# Load Testing Framework

Comprehensive performance validation framework for RailTrack AI.

## Quick Start

```bash
# Run complete load test suite
npm run test:load:light

# Individual tests
npm run test:write-load
npm run test:read-load
npm run test:shard-analysis
```

## Files

- **config.js** - Test modes and thresholds
- **dataGenerator.js** - Generate realistic test data
- **writeLoadSimulator.js** - Write performance testing
- **readLoadSimulator.js** - Read performance testing
- **shardAnalyzer.js** - Shard efficiency analysis
- **performanceMonitor.js** - Real-time monitoring
- **loadTestOrchestrator.js** - Complete test orchestration

## Test Modes

- **LIGHT_TEST**: 10K fittings, 60s duration
- **MEDIUM_TEST**: 100K fittings, 5min duration
- **HEAVY_TEST**: 1M fittings, 10min duration
- **EXTREME_TEST**: 5M fittings, 30min duration

## Documentation

See `LOAD_TESTING_GUIDE.md` for complete documentation.

## Reports

Test reports are saved to `railway/backend/reports/`
