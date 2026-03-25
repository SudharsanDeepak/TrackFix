/**
 * Load Testing Configuration
 * 
 * Defines test modes, scenarios, and thresholds for performance validation
 */

const RAILWAY_ZONES = ['NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'Metro'];

const ZONE_DISTRIBUTION_MODES = {
  EVEN: 'EVEN',           // Equal distribution across all zones
  HOT_ZONE: 'HOT_ZONE',   // 60% in one zone, 20% in another, 20% across rest
  RANDOM: 'RANDOM',       // Random distribution
};

const INSPECTION_DENSITY = {
  LOW: { min: 1, max: 5 },      // 1-5 inspections per fitting
  MEDIUM: { min: 5, max: 20 },  // 5-20 inspections per fitting
  HIGH: { min: 20, max: 50 },   // 20-50 inspections per fitting
};

const AI_REPORT_FREQUENCY = {
  LOW: 0.1,     // 10% of inspections get AI reports
  MEDIUM: 0.3,  // 30% of inspections get AI reports
  HIGH: 0.7,    // 70% of inspections get AI reports
};

const TEST_MODES = {
  LIGHT_TEST: {
    name: 'Light Test',
    fittings: 10000,
    inspectionDensity: 'LOW',
    aiReportFrequency: 'LOW',
    concurrentWrites: 10,
    concurrentReads: 50,
    writeRate: 50,      // writes per second
    readRate: 100,      // reads per second
    duration: 60,       // seconds
  },
  MEDIUM_TEST: {
    name: 'Medium Test',
    fittings: 100000,
    inspectionDensity: 'MEDIUM',
    aiReportFrequency: 'MEDIUM',
    concurrentWrites: 50,
    concurrentReads: 200,
    writeRate: 200,
    readRate: 500,
    duration: 300,
  },
  HEAVY_TEST: {
    name: 'Heavy Test',
    fittings: 1000000,
    inspectionDensity: 'MEDIUM',
    aiReportFrequency: 'MEDIUM',
    concurrentWrites: 100,
    concurrentReads: 500,
    writeRate: 500,
    readRate: 1000,
    duration: 600,
  },
  EXTREME_TEST: {
    name: 'Extreme Test',
    fittings: 5000000,
    inspectionDensity: 'HIGH',
    aiReportFrequency: 'HIGH',
    concurrentWrites: 200,
    concurrentReads: 1000,
    writeRate: 1000,
    readRate: 2000,
    duration: 1800,
  },
};

const PERFORMANCE_THRESHOLDS = {
  // Latency thresholds (milliseconds)
  latency: {
    avg: 200,
    p95: 500,
    p99: 1000,
    max: 5000,
  },
  
  // Error rate threshold (percentage)
  errorRate: 1.0,
  
  // Memory thresholds (MB)
  memory: {
    heap: 1024,
    rss: 2048,
  },
  
  // CPU threshold (percentage)
  cpu: 80,
  
  // Index hit ratio threshold (percentage)
  indexHitRatio: 90,
  
  // Shard efficiency threshold (percentage)
  shardEfficiency: 85,
  
  // Throughput thresholds
  throughput: {
    minWrites: 50,   // writes per second
    minReads: 100,   // reads per second
  },
};

const SCORING_WEIGHTS = {
  latency: 0.25,
  errorRate: 0.20,
  memory: 0.15,
  cpu: 0.10,
  indexHitRatio: 0.15,
  shardEfficiency: 0.15,
};

module.exports = {
  RAILWAY_ZONES,
  ZONE_DISTRIBUTION_MODES,
  INSPECTION_DENSITY,
  AI_REPORT_FREQUENCY,
  TEST_MODES,
  PERFORMANCE_THRESHOLDS,
  SCORING_WEIGHTS,
};
