/**
 * Shard Efficiency Analyzer
 * 
 * Analyzes query patterns and shard key usage to detect inefficiencies
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TrackFitting = require('../../src/modules/qr/model');
const Inspection = require('../../src/modules/inspection/model');
const AIReport = require('../../src/modules/ai/model');
const PerformanceLog = require('../../src/modules/performance/model');
const { RAILWAY_ZONES } = require('./config');

class ShardAnalyzer {
  constructor(config = {}) {
    this.config = {
      sampleSize: config.sampleSize || 1000,
      verbose: config.verbose !== false,
    };
    
    this.analysis = {
      collections: {},
      shardKeyUsage: {},
      scatterGatherQueries: [],
      crossShardOperations: 0,
      efficiency: {
        score: 0,
        details: {},
      },
    };
  }

  log(message, data = {}) {
    if (this.config.verbose) {
      console.log(`[ShardAnalyzer] ${message}`, data);
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

  async analyzeCollection(Model, collectionName, shardKey) {
    this.log(`Analyzing ${collectionName}...`);
    
    const analysis = {
      name: collectionName,
      shardKey,
      totalDocuments: 0,
      zoneDistribution: {},
      yearDistribution: {},
      shardKeyPresence: 0,
      missingShardKey: 0,
    };
    
    // Get total count
    analysis.totalDocuments = await Model.countDocuments();
    
    // Analyze zone distribution
    const zoneAgg = await Model.aggregate([
      { $group: {
        _id: '$zoneCode',
        count: { $sum: 1 },
      }},
      { $sort: { count: -1 } },
    ]);
    
    zoneAgg.forEach(item => {
      analysis.zoneDistribution[item._id || 'MISSING'] = item.count;
    });
    
    // Check shard key presence
    const withZone = await Model.countDocuments({ zoneCode: { $exists: true } });
    analysis.shardKeyPresence = withZone;
    analysis.missingShardKey = analysis.totalDocuments - withZone;
    
    // Calculate distribution balance
    const zoneCounts = Object.values(analysis.zoneDistribution).filter(c => c > 0);
    const avgPerZone = zoneCounts.reduce((a, b) => a + b, 0) / zoneCounts.length;
    const variance = zoneCounts.reduce((sum, count) => sum + Math.pow(count - avgPerZone, 2), 0) / zoneCounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avgPerZone) * 100;
    
    analysis.distributionBalance = {
      avgPerZone: Math.round(avgPerZone),
      stdDev: Math.round(stdDev),
      coefficientOfVariation: coefficientOfVariation.toFixed(2) + '%',
      balanced: coefficientOfVariation < 30, // Less than 30% variation is considered balanced
    };
    
    this.analysis.collections[collectionName] = analysis;
    
    return analysis;
  }

  async testQueryPatterns() {
    this.log('Testing query patterns...');
    
    const patterns = [];
    
    // Test 1: Query with zoneCode (efficient)
    const zone = RAILWAY_ZONES[0];
    const start1 = Date.now();
    const result1 = await TrackFitting.find({ zoneCode: zone }).limit(10).explain('executionStats');
    const time1 = Date.now() - start1;
    
    patterns.push({
      name: 'Zone-scoped query',
      query: { zoneCode: zone },
      executionTime: time1,
      docsExamined: result1.executionStats.totalDocsExamined,
      docsReturned: result1.executionStats.nReturned,
      efficient: true,
      usesShardKey: true,
    });
    
    // Test 2: Query without zoneCode (scatter-gather)
    const start2 = Date.now();
    const result2 = await TrackFitting.find({ status: 'MANUFACTURED' }).limit(10).explain('executionStats');
    const time2 = Date.now() - start2;
    
    patterns.push({
      name: 'Non-zone query (scatter-gather)',
      query: { status: 'MANUFACTURED' },
      executionTime: time2,
      docsExamined: result2.executionStats.totalDocsExamined,
      docsReturned: result2.executionStats.nReturned,
      efficient: false,
      usesShardKey: false,
    });
    
    // Test 3: Aggregation with zone
    const start3 = Date.now();
    const result3 = await Inspection.aggregate([
      { $match: { zoneCode: zone } },
      { $group: { _id: '$overallResult', count: { $sum: 1 } } },
    ]).explain('executionStats');
    const time3 = Date.now() - start3;
    
    patterns.push({
      name: 'Zone-scoped aggregation',
      query: 'aggregation with zoneCode',
      executionTime: time3,
      efficient: true,
      usesShardKey: true,
    });
    
    // Test 4: Cross-zone aggregation
    const start4 = Date.now();
    const result4 = await Inspection.aggregate([
      { $group: { _id: '$overallResult', count: { $sum: 1 } } },
    ]).explain('executionStats');
    const time4 = Date.now() - start4;
    
    patterns.push({
      name: 'Cross-zone aggregation',
      query: 'aggregation without zoneCode',
      executionTime: time4,
      efficient: false,
      usesShardKey: false,
    });
    
    this.analysis.queryPatterns = patterns;
    
    // Identify scatter-gather queries
    this.analysis.scatterGatherQueries = patterns.filter(p => !p.usesShardKey);
    
    return patterns;
  }

  async analyzeIndexUsage() {
    this.log('Analyzing index usage...');
    
    const collections = [
      { model: TrackFitting, name: 'trackfittings' },
      { model: Inspection, name: 'inspections' },
      { model: AIReport, name: 'aireports' },
      { model: PerformanceLog, name: 'performancelogs' },
    ];
    
    const indexAnalysis = {};
    
    for (const { model, name } of collections) {
      const indexes = await model.collection.getIndexes();
      const stats = await model.collection.stats();
      
      indexAnalysis[name] = {
        indexCount: Object.keys(indexes).length,
        indexes: Object.keys(indexes),
        totalIndexSize: stats.totalIndexSize,
        avgObjSize: stats.avgObjSize,
      };
    }
    
    this.analysis.indexUsage = indexAnalysis;
    
    return indexAnalysis;
  }

  calculateEfficiencyScore() {
    this.log('Calculating shard efficiency score...');
    
    let score = 100;
    const details = {};
    
    // Check shard key presence (30 points)
    const collections = Object.values(this.analysis.collections);
    const avgShardKeyPresence = collections.reduce((sum, col) => {
      return sum + (col.shardKeyPresence / col.totalDocuments);
    }, 0) / collections.length;
    
    const shardKeyScore = avgShardKeyPresence * 30;
    score = score - (30 - shardKeyScore);
    details.shardKeyPresence = {
      score: shardKeyScore.toFixed(2),
      percentage: (avgShardKeyPresence * 100).toFixed(2) + '%',
    };
    
    // Check distribution balance (30 points)
    const balancedCollections = collections.filter(col => col.distributionBalance?.balanced).length;
    const balanceScore = (balancedCollections / collections.length) * 30;
    score = score - (30 - balanceScore);
    details.distributionBalance = {
      score: balanceScore.toFixed(2),
      balancedCollections: `${balancedCollections}/${collections.length}`,
    };
    
    // Check query efficiency (40 points)
    const efficientQueries = this.analysis.queryPatterns?.filter(p => p.efficient).length || 0;
    const totalQueries = this.analysis.queryPatterns?.length || 1;
    const queryScore = (efficientQueries / totalQueries) * 40;
    score = score - (40 - queryScore);
    details.queryEfficiency = {
      score: queryScore.toFixed(2),
      efficientQueries: `${efficientQueries}/${totalQueries}`,
    };
    
    this.analysis.efficiency = {
      score: Math.max(0, Math.min(100, score)).toFixed(2),
      details,
      rating: score >= 85 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : 'POOR',
    };
    
    return this.analysis.efficiency;
  }

  async analyze() {
    try {
      await this.connect();
      
      // Analyze each sharded collection
      await this.analyzeCollection(TrackFitting, 'trackfittings', 'zoneCode_manufactureYear_uniqueQRId');
      await this.analyzeCollection(Inspection, 'inspections', 'zoneCode_inspectionYear_fitting');
      await this.analyzeCollection(AIReport, 'aireports', 'zoneCode_predictionYear_fitting');
      await this.analyzeCollection(PerformanceLog, 'performancelogs', 'zoneCode_logYear_fitting');
      
      // Test query patterns
      await this.testQueryPatterns();
      
      // Analyze index usage
      await this.analyzeIndexUsage();
      
      // Calculate efficiency score
      this.calculateEfficiencyScore();
      
      await this.disconnect();
      
      return this.generateReport();
    } catch (error) {
      console.error('❌ Shard analysis failed:', error);
      await this.disconnect();
      throw error;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      collections: this.analysis.collections,
      queryPatterns: this.analysis.queryPatterns,
      scatterGatherQueries: this.analysis.scatterGatherQueries.length,
      indexUsage: this.analysis.indexUsage,
      efficiency: this.analysis.efficiency,
      recommendations: this.generateRecommendations(),
    };
    
    this.log('\n📊 Shard Efficiency Analysis Report:');
    this.log('Efficiency Score:', { score: report.efficiency.score, rating: report.efficiency.rating });
    this.log('Scatter-Gather Queries:', report.scatterGatherQueries);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for missing shard keys
    for (const [name, col] of Object.entries(this.analysis.collections)) {
      if (col.missingShardKey > 0) {
        recommendations.push({
          severity: 'HIGH',
          collection: name,
          issue: `${col.missingShardKey} documents missing zoneCode`,
          action: 'Run migration script to add zoneCode to all documents',
        });
      }
    }
    
    // Check for imbalanced distribution
    for (const [name, col] of Object.entries(this.analysis.collections)) {
      if (!col.distributionBalance?.balanced) {
        recommendations.push({
          severity: 'MEDIUM',
          collection: name,
          issue: `Unbalanced zone distribution (CV: ${col.distributionBalance.coefficientOfVariation})`,
          action: 'Review data generation patterns and ensure even zone distribution',
        });
      }
    }
    
    // Check for scatter-gather queries
    if (this.analysis.scatterGatherQueries.length > 0) {
      recommendations.push({
        severity: 'HIGH',
        issue: `${this.analysis.scatterGatherQueries.length} scatter-gather queries detected`,
        action: 'Add zoneCode filter to all queries where possible',
      });
    }
    
    // Check efficiency score
    const score = parseFloat(this.analysis.efficiency.score);
    if (score < 70) {
      recommendations.push({
        severity: 'HIGH',
        issue: `Low shard efficiency score: ${score}`,
        action: 'Address shard key presence, distribution balance, and query patterns',
      });
    }
    
    return recommendations;
  }
}

module.exports = ShardAnalyzer;

// CLI execution
if (require.main === module) {
  const analyzer = new ShardAnalyzer();
  analyzer.analyze()
    .then(report => {
      console.log('\n✅ Analysis complete');
      console.log(JSON.stringify(report, null, 2));
    })
    .catch(console.error);
}
