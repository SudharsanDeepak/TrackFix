/**
 * Concurrent Write Load Simulator
 * 
 * Simulates high-throughput write operations to test system stability
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TrackFitting = require('../../src/modules/qr/model');
const Inspection = require('../../src/modules/inspection/model');
const AIReport = require('../../src/modules/ai/model');
const { RAILWAY_ZONES } = require('./config');

class WriteLoadSimulator {
  constructor(config = {}) {
    this.config = {
      writeRate: config.writeRate || 100,        // writes per second
      duration: config.duration || 60,           // seconds
      concurrency: config.concurrency || 10,     // concurrent workers
      burstMode: config.burstMode || false,      // burst test mode
      burstSize: config.burstSize || 5000,       // writes in burst
      verbose: config.verbose !== false,
    };
    
    this.metrics = {
      totalWrites: 0,
      successfulWrites: 0,
      failedWrites: 0,
      latencies: [],
      errors: [],
      startTime: null,
      endTime: null,
      memorySnapshots: [],
      cpuSnapshots: [],
    };
    
    this.running = false;
    this.workers = [];
  }

  log(message, data = {}) {
    if (this.config.verbose) {
      console.log(`[WriteLoad] ${message}`, data);
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

  generateFittingData() {
    const zone = RAILWAY_ZONES[Math.floor(Math.random() * RAILWAY_ZONES.length)];
    const year = 2024;
    const serialNumber = Math.floor(Math.random() * 1000000);
    const itemType = ['RAIL', 'SLEEPER', 'FASTENER', 'BOLT'][Math.floor(Math.random() * 4)];
    const lotNumber = `LOAD${zone}${Date.now()}`;
    
    return {
      uniqueQRId: `IR-${itemType}-${year}-${lotNumber}-${String(serialNumber).padStart(6, '0')}`,
      itemType,
      lotNumber,
      serialNumber: String(serialNumber).padStart(6, '0'),
      vendor: new mongoose.Types.ObjectId(),
      vendorCode: `VEN${Math.floor(Math.random() * 100)}`,
      zoneCode: zone,
      manufacturingDate: new Date(),
      manufactureYear: year,
      warrantyPeriod: 24,
      warrantyExpiry: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
      specifications: { test: 'load' },
      status: 'MANUFACTURED',
    };
  }

  generateInspectionData() {
    const zone = RAILWAY_ZONES[Math.floor(Math.random() * RAILWAY_ZONES.length)];
    
    return {
      fitting: new mongoose.Types.ObjectId(),
      inspector: new mongoose.Types.ObjectId(),
      zoneCode: zone,
      inspectionDate: new Date(),
      inspectionYear: 2024,
      status: 'COMPLETED',
      findings: { visualInspection: { passed: true } },
      overallResult: 'PASS',
    };
  }

  generateAIReportData() {
    const zone = RAILWAY_ZONES[Math.floor(Math.random() * RAILWAY_ZONES.length)];
    const riskScore = Math.random() * 100;
    
    return {
      fitting: new mongoose.Types.ObjectId(),
      vendor: new mongoose.Types.ObjectId(),
      zoneCode: zone,
      predictionYear: 2024,
      predictionData: { test: 'load' },
      predictionResult: { riskScore },
      riskScore,
      riskLevel: 'MEDIUM_RISK',
      recommendations: [],
      confidence: 80,
      modelVersion: 'v1.0',
    };
  }

  async performWrite() {
    const startTime = Date.now();
    
    try {
      // Random write type
      const writeType = Math.random();
      
      if (writeType < 0.5) {
        // Fitting write
        await TrackFitting.create(this.generateFittingData());
      } else if (writeType < 0.8) {
        // Inspection write
        await Inspection.create(this.generateInspectionData());
      } else {
        // AI Report write
        await AIReport.create(this.generateAIReportData());
      }
      
      const latency = Date.now() - startTime;
      this.metrics.latencies.push(latency);
      this.metrics.successfulWrites++;
      
      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metrics.failedWrites++;
      this.metrics.errors.push({
        error: error.message,
        timestamp: new Date(),
      });
      
      return { success: false, latency, error: error.message };
    }
  }

  async worker(workerId) {
    const writesPerWorker = Math.ceil(this.config.writeRate / this.config.concurrency);
    const delayMs = 1000 / writesPerWorker;
    
    while (this.running) {
      await this.performWrite();
      this.metrics.totalWrites++;
      
      if (!this.config.burstMode) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  async burstTest() {
    this.log(`Starting burst test: ${this.config.burstSize} writes`);
    
    const promises = [];
    for (let i = 0; i < this.config.burstSize; i++) {
      promises.push(this.performWrite());
      
      if (promises.length >= this.config.concurrency) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    this.log(`✅ Burst test complete`);
  }

  captureMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memorySnapshots.push({
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external,
    });
    
    this.metrics.cpuSnapshots.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system,
    });
  }

  async run() {
    this.metrics.startTime = Date.now();
    this.running = true;
    
    try {
      await this.connect();
      
      if (this.config.burstMode) {
        await this.burstTest();
      } else {
        this.log(`Starting sustained write load: ${this.config.writeRate} writes/sec for ${this.config.duration}s`);
        
        // Start workers
        for (let i = 0; i < this.config.concurrency; i++) {
          this.workers.push(this.worker(i));
        }
        
        // Capture metrics every second
        const metricsInterval = setInterval(() => {
          this.captureMetrics();
          
          const elapsed = (Date.now() - this.metrics.startTime) / 1000;
          const currentRate = this.metrics.totalWrites / elapsed;
          
          this.log(`Progress: ${this.metrics.totalWrites} writes, ${currentRate.toFixed(2)} writes/sec`);
        }, 1000);
        
        // Run for specified duration
        await new Promise(resolve => setTimeout(resolve, this.config.duration * 1000));
        
        this.running = false;
        clearInterval(metricsInterval);
        
        // Wait for workers to finish
        await Promise.all(this.workers);
      }
      
      this.metrics.endTime = Date.now();
      
      await this.disconnect();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Write load test failed:', error);
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
    const throughput = this.metrics.totalWrites / duration;
    const errorRate = (this.metrics.failedWrites / this.metrics.totalWrites) * 100;
    
    const avgLatency = this.metrics.latencies.reduce((a, b) => a + b, 0) / this.metrics.latencies.length;
    const p95Latency = this.calculatePercentile(this.metrics.latencies, 95);
    const p99Latency = this.calculatePercentile(this.metrics.latencies, 99);
    const maxLatency = Math.max(...this.metrics.latencies);
    
    const avgMemory = this.metrics.memorySnapshots.reduce((sum, snap) => sum + snap.heapUsed, 0) / this.metrics.memorySnapshots.length;
    const maxMemory = Math.max(...this.metrics.memorySnapshots.map(s => s.heapUsed));
    
    const report = {
      testType: 'WRITE_LOAD',
      config: this.config,
      duration: `${duration.toFixed(2)}s`,
      writes: {
        total: this.metrics.totalWrites,
        successful: this.metrics.successfulWrites,
        failed: this.metrics.failedWrites,
        errorRate: `${errorRate.toFixed(2)}%`,
      },
      throughput: {
        actual: `${throughput.toFixed(2)} writes/sec`,
        target: `${this.config.writeRate} writes/sec`,
        efficiency: `${((throughput / this.config.writeRate) * 100).toFixed(2)}%`,
      },
      latency: {
        avg: `${avgLatency.toFixed(2)}ms`,
        p95: `${p95Latency.toFixed(2)}ms`,
        p99: `${p99Latency.toFixed(2)}ms`,
        max: `${maxLatency.toFixed(2)}ms`,
      },
      memory: {
        avg: `${(avgMemory / 1024 / 1024).toFixed(2)}MB`,
        max: `${(maxMemory / 1024 / 1024).toFixed(2)}MB`,
      },
      errors: this.metrics.errors.slice(0, 10), // First 10 errors
    };
    
    this.log('\n📊 Write Load Test Report:', report);
    
    return report;
  }
}

module.exports = WriteLoadSimulator;

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const config = {};
  
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key === '--rate') config.writeRate = parseInt(value);
    if (key === '--duration') config.duration = parseInt(value);
    if (key === '--concurrency') config.concurrency = parseInt(value);
    if (key === '--burst') config.burstMode = true;
    if (key === '--burst-size') config.burstSize = parseInt(value);
  });
  
  const simulator = new WriteLoadSimulator(config);
  simulator.run().catch(console.error);
}
