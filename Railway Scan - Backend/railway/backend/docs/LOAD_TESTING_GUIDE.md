# 🚆 RailTrack-FIX - Load Testing & Performance Validation Guide

## Overview

Comprehensive load testing framework to validate national-scale performance and stability.

---

## 🎯 Test Modes

### LIGHT_TEST
- **Fittings**: 10,000
- **Inspections**: Low density (1-5 per fitting)
- **AI Reports**: Low frequency (10%)
- **Write Rate**: 50 writes/sec
- **Read Rate**: 100 reads/sec
- **Duration**: 60 seconds
- **Use Case**: Quick validation, CI/CD pipelines

### MEDIUM_TEST
- **Fittings**: 100,000
- **Inspections**: Medium density (5-20 per fitting)
- **AI Reports**: Medium frequency (30%)
- **Write Rate**: 200 writes/sec
- **Read Rate**: 500 reads/sec
- **Duration**: 300 seconds (5 minutes)
- **Use Case**: Pre-deployment validation

### HEAVY_TEST
- **Fittings**: 1,000,000
- **Inspections**: Medium density (5-20 per fitting)
- **AI Reports**: Medium frequency (30%)
- **Write Rate**: 500 writes/sec
- **Read Rate**: 1000 reads/sec
- **Duration**: 600 seconds (10 minutes)
- **Use Case**: Production readiness testing

### EXTREME_TEST
- **Fittings**: 5,000,000
- **Inspections**: High density (20-50 per fitting)
- **AI Reports**: High frequency (70%)
- **Write Rate**: 1000 writes/sec
- **Read Rate**: 2000 reads/sec
- **Duration**: 1800 seconds (30 minutes)
- **Use Case**: National-scale validation

---

## 🚀 Quick Start

### Run Complete Load Test Suite

```bash
# Light test (recommended for first run)
npm run test:load:light

# Medium test
npm run test:load:medium

# Heavy test
npm run test:load:heavy

# Extreme test (requires significant resources)
npm run test:load:extreme
```

### Run Individual Tests

```bash
# Data generation only
node tests/load/dataGenerator.js --count=10000 --distribution=EVEN

# Write load test
node tests/load/writeLoadSimulator.js --rate=100 --duration=60

# Read load test
node tests/load/readLoadSimulator.js --rate=200 --duration=60

# Shard efficiency analysis
node tests/load/shardAnalyzer.js
```

---

## 📊 Test Phases

### Phase 1: Data Generation
- Generates realistic test data
- Distributes across 16 railway zones
- Creates fittings, inspections, AI reports
- Configurable density and frequency

### Phase 2: Write Load Test
- Simulates concurrent write operations
- Tests QR generation, inspections, AI reports
- Measures write throughput and latency
- Detects transaction failures

### Phase 3: Read Load Test
- Simulates concurrent read operations
- Tests various query patterns:
  - Simple lookups
  - Filtered queries
  - Aggregations
  - Populated queries (joins)
- Measures read latency and consistency

### Phase 4: Shard Efficiency Analysis
- Analyzes zone distribution balance
- Detects scatter-gather queries
- Validates shard key usage
- Calculates efficiency score

### Phase 5: Mixed Load Test
- Simultaneous read and write operations
- Tests real-world usage patterns
- Validates system stability under mixed load

### Phase 6: Hot Zone Test
- Simulates uneven zone distribution (60/20/20)
- Tests performance under imbalanced load
- Validates counter hotspot prevention

---

## 📈 Performance Metrics

### Latency Metrics
- **Average Latency**: Mean response time
- **P95 Latency**: 95th percentile (5% of requests slower)
- **P99 Latency**: 99th percentile (1% of requests slower)
- **Max Latency**: Worst-case response time

### Throughput Metrics
- **Writes/Second**: Actual write throughput
- **Reads/Second**: Actual read throughput
- **Efficiency**: Actual vs target throughput

### Resource Metrics
- **Memory Usage**: Heap, RSS, external memory
- **CPU Usage**: User and system CPU time
- **Event Loop Lag**: Node.js event loop delay
- **GC Activity**: Garbage collection frequency

### Quality Metrics
- **Error Rate**: Percentage of failed operations
- **Shard Efficiency**: Zone distribution and query routing
- **Index Hit Ratio**: Index usage effectiveness

---

## 🎯 Performance Thresholds

### Latency Thresholds
- Average: < 200ms
- P95: < 500ms
- P99: < 1000ms
- Max: < 5000ms

### Error Rate
- < 1% error rate

### Memory
- Heap: < 1024MB
- RSS: < 2048MB

### CPU
- < 80% average usage

### Shard Efficiency
- > 85% efficiency score

### Index Hit Ratio
- > 90% index usage

---

## 📊 Performance Score

The framework calculates a comprehensive performance score (0-100):

### Scoring Weights
- **Latency**: 25%
- **Error Rate**: 20%
- **Memory**: 15%
- **CPU**: 10%
- **Index Hit Ratio**: 15%
- **Shard Efficiency**: 15%

### Score Ratings
- **85-100**: EXCELLENT - Production ready
- **70-84**: GOOD - Minor optimizations needed
- **50-69**: FAIR - Significant improvements required
- **0-49**: POOR - Not production ready

### Scale Readiness
- Score >= 70: ✅ Scale Ready
- Score < 70: ❌ Not Scale Ready

---

## 📁 Test Reports

Reports are saved to `railway/backend/reports/`:

```
load-test-report-[timestamp].json
```

### Report Structure

```json
{
  "mode": "MEDIUM_TEST",
  "timestamp": "2024-03-03T10:00:00.000Z",
  "dataGeneration": {
    "fittings": 100000,
    "inspections": 1500000,
    "aiReports": 450000
  },
  "writeLoad": {
    "throughput": "195.50 writes/sec",
    "latency": {
      "avg": "125.50ms",
      "p95": "350.25ms",
      "p99": "750.80ms"
    },
    "writes": {
      "total": 23460,
      "successful": 23450,
      "failed": 10,
      "errorRate": "0.04%"
    }
  },
  "readLoad": {
    "throughput": "485.20 reads/sec",
    "latency": {
      "avg": "85.30ms",
      "p95": "250.15ms",
      "p99": "500.45ms"
    }
  },
  "shardAnalysis": {
    "efficiency": {
      "score": "92.50",
      "rating": "EXCELLENT"
    },
    "scatterGatherQueries": 1
  },
  "performanceScore": {
    "total": "88.75",
    "rating": "EXCELLENT",
    "scaleReady": true
  },
  "passed": true
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/railtrack_ai

# Sharding
ENABLE_SHARDING=false
SHARD_QUERY_LOGGING=true

# Performance
SLOW_QUERY_THRESHOLD=200
```

### Test Configuration

Edit `tests/load/config.js` to customize:

```javascript
const TEST_MODES = {
  CUSTOM_TEST: {
    name: 'Custom Test',
    fittings: 50000,
    inspectionDensity: 'MEDIUM',
    aiReportFrequency: 'MEDIUM',
    concurrentWrites: 25,
    concurrentReads: 100,
    writeRate: 100,
    readRate: 250,
    duration: 180,
  },
};
```

---

## 🐛 Troubleshooting

### Out of Memory Errors

```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 tests/load/loadTestOrchestrator.js MEDIUM_TEST
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongosh

# Verify connection string
echo $MONGO_URI
```

### Slow Test Execution

- Reduce test mode (HEAVY → MEDIUM → LIGHT)
- Decrease duration in config
- Lower concurrency levels
- Use smaller batch sizes

### High Error Rates

- Check MongoDB connection stability
- Verify sufficient system resources
- Review error logs in test reports
- Reduce write/read rates

---

## 📊 Interpreting Results

### Good Performance Indicators
✅ Error rate < 1%
✅ P95 latency < 500ms
✅ Memory stable (no leaks)
✅ Shard efficiency > 85%
✅ Performance score > 70

### Warning Signs
⚠️ Error rate 1-5%
⚠️ P95 latency 500-1000ms
⚠️ Memory growing steadily
⚠️ Shard efficiency 70-85%
⚠️ Performance score 50-70

### Critical Issues
❌ Error rate > 5%
❌ P95 latency > 1000ms
❌ Memory leaks detected
❌ Shard efficiency < 70%
❌ Performance score < 50

---

## 🎯 Optimization Recommendations

### If Latency is High
1. Add missing indexes
2. Optimize query patterns
3. Enable query result caching
4. Use lean() for read-only queries
5. Add field projections

### If Error Rate is High
1. Check MongoDB connection pool size
2. Increase transaction timeout
3. Add retry logic
4. Review error logs for patterns

### If Memory Usage is High
1. Reduce batch sizes
2. Use streaming for large datasets
3. Clear unused references
4. Enable garbage collection logging

### If Shard Efficiency is Low
1. Add zoneCode to all queries
2. Migrate missing shard keys
3. Balance zone distribution
4. Review query patterns

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run light load test
        run: npm run test:load:light
      
      - name: Upload test report
        uses: actions/upload-artifact@v3
        with:
          name: load-test-report
          path: reports/
```

---

## 📚 Additional Resources

- **Sharding Guide**: `docs/SHARDING_GUIDE.md`
- **API Documentation**: `docs/API_GUIDE.md`
- **Architecture Overview**: `docs/ARCHITECTURE.md`
- **Quick Start**: `SHARDING_QUICK_START.md`

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] Run HEAVY_TEST successfully
- [ ] Performance score >= 70
- [ ] Error rate < 1%
- [ ] Shard efficiency >= 85%
- [ ] No memory leaks detected
- [ ] All indexes optimized
- [ ] Query patterns validated
- [ ] Hot zone test passed
- [ ] Mixed load test passed
- [ ] Archival stress test passed

---

## 🎉 Success Criteria

Your system is production-ready when:

✅ Handles 500+ writes/sec with < 1% errors
✅ Handles 1000+ reads/sec with P95 < 500ms
✅ Memory stable under sustained load
✅ Shard efficiency > 85%
✅ Performance score > 70
✅ No critical anomalies detected

---

**Ready to validate your system at national scale!** 🚀
