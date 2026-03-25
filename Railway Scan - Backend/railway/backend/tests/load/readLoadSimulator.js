/**
 * Concurrent Read Load Simulator
 * 
 * Simulates high-concurrency read operations to test query performance
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TrackFitting = require('../../src/modules/qr/model');
const Inspection = require('../../src/modules/inspection/model');
const AIReport = require('../../src/modules/ai/model');
const { RAILWAY_ZONES } = require('./config');

class ReadLoadSimulator {
  constructor(config = {}) {
    this.config = {
      readRate: config.readRate || 100,          // reads per second
      duration: config.duration || 60,           // seconds
      concurrency: config.concurrency || 50,     // concurrent readers
      queryMix: config.queryMix || {            // Query type distribution
        simple: 0.4,      // Simple lookups
        filtered: 0.3,    // Filtered queries
        aggregation: 0.2, // Aggregations
        join: 0.1,        // Populated queries
      },
      verbose: config.verbose !== false,
    };
    
    this.metrics = {
      totalReads: 0,
      successfulReads: 0,
      failedReads: 0,
      latencies: [],
      queryTypes: {},
      errors: [],
      startTime: null,
      endTime: null,
    };
    
    this.running = false;
    this.workers = [];
    this.sampleData = {
      fittingIds: [],
      zones: RAILWAY_ZONES,
    };
  }

  log(message, data = {}) {
    if (this.config.verbose) {
      console.log(`[ReadLoad] ${message}`, data);
    }
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      this.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    this.log('✅ Disconnected from MongoDB');
  }

  async loadSampleData() {
    this.log('Loading sample data for queries...');
    
    // Get sample fitting IDs
    const fittings = await TrackFitting.find().select('_id').limit(1000).lean();
    this.sampleData.fittingIds = fittings.map(f => f._id);
    
    this.log(`✅ Loaded ${this.sampleData.fittingIds.length} sample fitting IDs`);
  }

  async performSimpleQuery() {
    // Simple ID lookup
    const fittingId = this.sampleData.fittingIds[Math.floor(Math.random() * this.sampleData.fittingIds.length)];
    return await TrackFitting.findById(fittingId).lean();
  }

  async performFilteredQuery() {
    // Filtered query with zone
    const zone = this.sampleData.zones[Math.floor(Math.random() * this.sampleData.zones.length)];
    return await TrackFitting.find({ zoneCode: zone, status: 'MANUFACTURED' })
      .limit(20)
      .lean();
  }

  async performAggregationQuery() {
    // Aggregation query
    const zone = this.sampleData.zones[Math.floor(Math.random() * this.sampleData.zones.length)];
    return await TrackFitting.aggregate([
      { $match: { zoneCode: zone } },
      { $group: {
        _id: '$itemType',
        count: { $sum: 1 },
        avgRiskScore: { $avg: '$riskScore' },
      }},
      { $limit: 10 },
    ]);
  }

  async performJoinQuery() {
    // Query with population
    const zone = this.sampleData.zones[Math.floor(Math.random() * this.sampleData.zones.length)];
    return await Inspection.find({ zoneCode: zone })
      .populate('fitting', 'uniqueQRId itemType')
      .populate('inspector', 'name email')
      .limit(20)
      .lean();
  }

  async performRead() {
    const startTime = Date.now();
    let queryType = 'simple';
    
    try {
      const rand = Math.random();
      let result;
      
      if (rand < this.config.queryMix.simple) {
        queryType = 'simple';
        result = await this.performSimpleQuery();
      } else if (rand < this.config.queryMix.simple + this.config.queryMix.filtered) {
        queryType = 'filtered';
        result = await this.performFilteredQuery();
      } else if (rand < this.config.queryMix.simple + this.config.queryMix.filtered + this.config.queryMix.aggregation) {
        queryType = 'aggregation';
        result = await this.performAggregationQuery();
      } else {
        queryType = 'join';
        result = await this.performJoinQuery();
      }
      
      const latency = Date.now() - startTime;
      this.metrics.latencies.push(latency);
      this.metrics.successfulReads++;
      
      if (!this.metrics.queryTypes[queryType]) {
        this.metrics.queryTypes[queryType] = { count: 0, totalLatency: 0 };
      }
      this.metrics.queryTypes[queryType].count++;
      this.metrics.queryTypes[queryType].totalLatency += latency;
      
      return { success: true, latency, queryType };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedReads++;
      this.metrics.errors.push({
        error: error.message,
        queryType,
        timestamp: new Date(),
      });
      
      return { success: false, latency, error: error.message, queryType };
    }
  }

  async worker(workerId) {
    const readsPerWorker = Math.ceil(this.config.readRate / this.config.concurrency);
    const delayMs = 1000 / readsPerWorker;
    
    while (this.running) {
      await this.performRead();
      this.metrics.totalReads++;
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  async run() {
    this.metrics.startTime = Date.now();
    this.running = true;
    
    try {
      await this.connect();
      await this.loadSampleData();
      
      this.log(`Starting read load: ${this.config.readRate} reads/sec for ${this.config.duration}s`);
      
      // Start workers
      for (let i = 0; i < this.config.concurrency; i++) {
        this.workers.push(this.worker(i));
      }
      
      // Progress logging
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - this.metrics.startTime) / 1000;
        const currentRate = this.metrics.totalReads / elapsed;
        
        this.log(`Progress: ${this.metrics.totalReads} reads, ${currentRate.toFixed(2)} reads/sec`);
      }, 5000);
      
      // Run for specified duration
      await new Promise(resolve => setTimeout(resolve, this.config.duration * 1000));
      
      this.running = false;
      clearInterval(progressInterval);
      
      // Wait for workers to finish
      await Promise.all(this.workers);
      
      this.metrics.endTime = Date.now();
      
      await this.disconnect();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Read load test failed:', error);
      this.running = false;
      await this.disconnect();
      throw error;
    }
  }

  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  generateReport() {
    const duration = (this.metrics.endTime - this.metrics.startTime) / 1000;
    const throughput = this.metrics.totalReads / duration;
    const errorRate = (this.metrics.failedReads / this.metrics.totalReads) * 100;
    
    const avgLatency = this.metrics.latencies.reduce((a, b) => a + b, 0) / this.metrics.latencies.length;
    const p95Latency = this.calculatePercentile(this.metrics.latencies, 95);
    const p99Latency = this.calculatePercentile(this.metrics.latencies, 99);
    const maxLatency = Math.max(...this.metrics.latencies);
    
    const queryTypeStats = {};
    for (const [type, stats] of Object.entries(this.metrics.queryTypes)) {
      queryTypeStats[type] = {
        count: stats.count,
        avgLatency: `${(stats.totalLatency / stats.count).toFixed(2)}ms`,
      };
    }
    
    const report = {
      testType: 'READ_LOAD',
      config: this.config,
      duration: `${duration.toFixed(2)}s`,
      reads: {
        total: this.metrics.totalReads,
        successful: this.metrics.successfulReads,
        failed: this.metrics.failedReads,
        errorRate: `${errorRate.toFixed(2)}%`,
      },
      throughput: {
        actual: `${throughput.toFixed(2)} reads/sec`,
        target: `${this.config.readRate} reads/sec`,
        efficiency: `${((throughput / this.config.readRate) * 100).toFixed(2)}%`,
      },
      latency: {
        avg: `${avgLatency.toFixed(2)}ms`,
        p95: `${p95Latency.toFixed(2)}ms`,
        p99: `${p99Latency.toFixed(2)}ms`,
        max: `${maxLatency.toFixed(2)}ms`,
      },
      queryTypes: queryTypeStats,
      errors: this.metrics.errors.slice(0, 10),
    };
    
    this.log('\n📊 Read Load Test Report:', report);
    
    return report;
  }
}

module.exports = ReadLoadSimulator;

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const config = {};
  
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key === '--rate') config.readRate = parseInt(value);
    if (key === '--duration') config.duration = parseInt(value);
    if (key === '--concurrency') config.concurrency = parseInt(value);
  });
  
  const simulator = new ReadLoadSimulator(config);
  simulator.run().catch(console.error);
}
