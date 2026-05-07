# RailTrack-FIX - MongoDB Sharding Guide

## Overview

This guide explains the sharding architecture for RailTrack-FIX, designed to support 25+ crore (250 million) TrackFitting records and 100+ crore (1 billion) Inspection records over time.

---

## Sharding Strategy

### Sharded Collections

| Collection | Shard Key | Rationale |
|------------|-----------|-----------|
| **TrackFittings** | `{ zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 }` | Distributes by railway zone, balances yearly growth, prevents hotspotting |
| **Inspections** | `{ zoneCode: 1, inspectionYear: 1, fitting: 1 }` | Heavy write collection, partitioned by geography + time |
| **AIReports** | `{ zoneCode: 1, predictionYear: 1, fitting: 1 }` | Prediction data distributed by zone and year |
| **PerformanceLogs** | `{ zoneCode: 1, logYear: 1, fitting: 1 }` | Performance metrics partitioned by zone and time |
| **InspectionArchives** | `{ zoneCode: 1, inspectionYear: 1, originalId: 1 }` | Cold data storage with zone-based distribution |
| **AIReportArchives** | `{ zoneCode: 1, predictionYear: 1, originalId: 1 }` | Historical AI data with zone partitioning |
| **PerformanceLogArchives** | `{ zoneCode: 1, logYear: 1, originalId: 1 }` | Archived performance data |

### Non-Sharded Collections

- **Users** - Small collection, low write volume
- **Vendors** - Small collection, reference data
- **AuditLogs** - Time-series, can use TTL index
- **RefreshTokens** - Small, TTL-managed
- **Counters** - Segmented by zone (no global counter)

---

## Railway Zones

India has 16 railway zones + Metro:

```
NR   - Northern Railway
SR   - Southern Railway
ER   - Eastern Railway
WR   - Western Railway
CR   - Central Railway
NER  - North Eastern Railway
ECR  - East Central Railway
ECoR - East Coast Railway
NCR  - North Central Railway
NWR  - North Western Railway
SCR  - South Central Railway
SER  - South Eastern Railway
SWR  - South Western Railway
WCR  - West Central Railway
NF   - Northeast Frontier Railway
Metro - Metro Railways
```

---

## Hot vs Cold Data Architecture

### Hot Data (Active Collections)
- **TrackFittings**: Last 2 years + active lifecycle
- **Inspections**: Last 1 year
- **AIReports**: Last 2 years
- **PerformanceLogs**: Last 2 years

### Cold Data (Archive Collections)
- **InspectionArchives**: Inspections older than 365 days
- **AIReportArchives**: AI reports older than 730 days
- **PerformanceLogArchives**: Performance logs older than 730 days

### Archival Process
- **Automated Job**: Runs daily at 5:00 AM
- **Batch Size**: 1000 records per run
- **Retention**: Configurable via environment variables
- **Preservation**: All references and relationships maintained

---

## Shard Key Design Principles

### Why Compound Shard Keys?

1. **Zone-based Distribution**
   - Distributes data across geographical zones
   - Enables zone-specific queries
   - Prevents single-shard hotspots

2. **Time-based Partitioning**
   - Balances growth over years
   - Enables time-range queries
   - Facilitates data archival

3. **Unique Identifier**
   - Ensures even distribution
   - Prevents monotonic key issues
   - Enables efficient lookups

### Anti-Patterns Avoided

❌ **Monotonic Keys**: `{ createdAt: 1 }` - All writes go to one shard
❌ **Single Field**: `{ zoneCode: 1 }` - Uneven distribution
❌ **Low Cardinality**: `{ status: 1 }` - Hotspotting

✅ **Compound Keys**: `{ zoneCode: 1, year: 1, id: 1 }` - Balanced distribution

---

## Index Strategy

### TrackFittings Indexes

```javascript
// SHARD KEY (automatically indexed)
{ zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 }

// Secondary indexes
{ uniqueQRId: 1 }  // Unique lookup
{ zoneCode: 1, vendorCode: 1, status: 1 }  // Vendor queries
{ zoneCode: 1, warrantyExpiry: 1, status: 1 }  // Warranty alerts
{ zoneCode: 1, riskScore: -1 }  // Risk-based queries
{ zoneCode: 1, 'location.depot': 1, status: 1 }  // Location queries

// Partial index for soft-deleted
{ zoneCode: 1, isDeleted: 1, deletedAt: 1 }
  WHERE { isDeleted: true }
```

### Inspections Indexes

```javascript
// SHARD KEY
{ zoneCode: 1, inspectionYear: 1, fitting: 1 }

// Secondary indexes
{ zoneCode: 1, fitting: 1, inspectionDate: -1 }
{ zoneCode: 1, inspector: 1, inspectionDate: -1 }
{ zoneCode: 1, status: 1, inspectionDate: -1 }

// Partial index for failed inspections
{ zoneCode: 1, overallResult: 1, inspectionDate: -1 }
  WHERE { overallResult: 'FAIL' }
```

---

## Query Patterns

### Zone-Aware Queries (Efficient)

```javascript
// ✅ GOOD: Includes shard key prefix
db.trackfittings.find({
  zoneCode: 'NR',
  status: 'OPERATIONAL'
});

// ✅ GOOD: Zone-specific aggregation
db.inspections.aggregate([
  { $match: { zoneCode: 'SR', inspectionYear: 2026 } },
  { $group: { _id: '$overallResult', count: { $sum: 1 } } }
]);
```

### Scatter-Gather Queries (Avoid)

```javascript
// ❌ BAD: No shard key, queries all shards
db.trackfittings.find({
  status: 'DEFECTIVE'
});

// ❌ BAD: Cross-zone aggregation
db.inspections.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

### Multi-Zone Queries (When Necessary)

```javascript
// ⚠️ ACCEPTABLE: Explicit multi-zone query
db.trackfittings.find({
  zoneCode: { $in: ['NR', 'SR', 'ER'] },
  status: 'DEFECTIVE'
});
```

---

## Enabling Sharding

### Prerequisites

1. **MongoDB Sharded Cluster**
   - Config servers (3 replicas)
   - Shard servers (3+ shards)
   - mongos router

2. **Replica Sets**
   - Each shard is a replica set
   - Minimum 3 nodes per shard

### Step 1: Enable Sharding

```bash
# Run the sharding script
node scripts/enableSharding.js
```

### Step 2: Verify Shard Status

```javascript
// Connect to mongos
mongosh mongodb://mongos-host:27017

// Check shard status
sh.status()

// Check balancer
sh.getBalancerState()

// Check collection distribution
db.trackfittings.getShardDistribution()
```

### Step 3: Monitor Distribution

```javascript
// Check chunk distribution
use config
db.chunks.aggregate([
  { $group: { _id: '$shard', count: { $sum: 1 } } }
])

// Check shard sizes
db.adminCommand({ listShards: 1 })
```

---

## Data Migration

### Migrating Existing Data

If you have existing data without `zoneCode`:

```javascript
// Add zoneCode based on location
db.trackfittings.updateMany(
  { zoneCode: { $exists: false } },
  [
    {
      $set: {
        zoneCode: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: '$location.zone', regex: /^NR/ } }, then: 'NR' },
              { case: { $regexMatch: { input: '$location.zone', regex: /^SR/ } }, then: 'SR' },
              // ... other zones
            ],
            default: 'NR'
          }
        },
        manufactureYear: { $year: '$manufacturingDate' }
      }
    }
  ]
);
```

---

## Performance Optimization

### Write Performance

- **Batch Inserts**: Use `insertMany()` with `ordered: false`
- **Zone Distribution**: Writes distributed across shards
- **No Hotspots**: Compound shard key prevents single-shard bottleneck

### Read Performance

- **Zone-Specific**: Most queries include `zoneCode`
- **Covered Queries**: Indexes cover common query patterns
- **Read Preference**: Use `secondaryPreferred` for analytics

### Balancer Configuration

```javascript
// Enable balancer
sh.startBalancer()

// Set balancer window (off-peak hours)
db.settings.update(
  { _id: 'balancer' },
  {
    $set: {
      activeWindow: {
        start: '01:00',
        stop: '05:00'
      }
    }
  },
  { upsert: true }
)
```

---

## Monitoring

### Key Metrics

1. **Shard Distribution**
   - Documents per shard
   - Data size per shard
   - Chunk distribution

2. **Query Performance**
   - Scatter-gather queries
   - Slow queries (>200ms)
   - Index usage

3. **Balancer Activity**
   - Chunk migrations
   - Balancer rounds
   - Failed migrations

### Monitoring Endpoints

```bash
# Enhanced metrics endpoint
GET /metrics

Response includes:
- Collection sizes
- Document counts
- Index sizes
- Shard distribution readiness
```

---

## Backup Strategy

### Replica Set Backups

```bash
# Backup from secondary node
mongodump --host secondary-host:27017 \
  --db railtrack_ai \
  --out /backups/$(date +%Y%m%d)

# Compress backup
tar -czf railtrack_ai_$(date +%Y%m%d).tar.gz /backups/$(date +%Y%m%d)
```

### Sharded Cluster Backups

```bash
# Stop balancer
sh.stopBalancer()

# Backup config servers
mongodump --host config-server:27017 \
  --db config \
  --out /backups/config_$(date +%Y%m%d)

# Backup each shard
for shard in shard1 shard2 shard3; do
  mongodump --host $shard:27017 \
    --db railtrack_ai \
    --out /backups/${shard}_$(date +%Y%m%d)
done

# Restart balancer
sh.startBalancer()
```

---

## Disaster Recovery

### Recovery Procedure

1. **Restore Config Servers**
2. **Restore Shard Data**
3. **Verify Metadata**
4. **Enable Balancer**
5. **Verify Application Connectivity**

### RTO/RPO Targets

- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour
- **Backup Frequency**: Daily full, hourly incremental

---

## Scaling Strategy

### Horizontal Scaling

```javascript
// Add new shard
sh.addShard('shard4/shard4-host1:27017,shard4-host2:27017,shard4-host3:27017')

// Balancer will automatically redistribute chunks
```

### Capacity Planning

| Records | Shards | Storage per Shard | RAM per Shard |
|---------|--------|-------------------|---------------|
| 25 crore | 3 | ~300 GB | 32 GB |
| 50 crore | 5 | ~300 GB | 32 GB |
| 100 crore | 10 | ~300 GB | 32 GB |

---

## Testing

### Generate Test Data

```bash
# Generate 10,000 test fittings
node scripts/generateTestData.js --count=10000

# Generate 1 million test fittings
node scripts/generateTestData.js --count=1000000
```

### Verify Distribution

```javascript
// Check zone distribution
db.trackfittings.aggregate([
  { $group: { _id: '$zoneCode', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Check year distribution
db.trackfittings.aggregate([
  { $group: { _id: '$manufactureYear', count: { $sum: 1 } } },
  { $sort: { _id: -1 } }
])
```

---

## Troubleshooting

### Unbalanced Shards

```javascript
// Check chunk distribution
sh.status()

// Manually split chunks if needed
sh.splitAt('railtrack_ai.trackfittings', { zoneCode: 'NR', manufactureYear: 2025, uniqueQRId: 'IR-ERC-2025-LOT001-500000' })
```

### Slow Queries

```javascript
// Enable profiling
db.setProfilingLevel(2, { slowms: 200 })

// Check slow queries
db.system.profile.find({ millis: { $gt: 200 } }).sort({ ts: -1 }).limit(10)
```

### Balancer Issues

```javascript
// Check balancer status
sh.getBalancerState()

// Check failed migrations
db.getSiblingDB('config').migrations.find({ state: 'fail' })
```

---

## Environment Variables

```bash
# Sharding Configuration
MONGODB_SHARDED=true
SHARD_COUNT=3

# Archive Thresholds
INSPECTION_ARCHIVE_DAYS=365
AI_REPORT_ARCHIVE_DAYS=730
PERFORMANCE_LOG_ARCHIVE_DAYS=730

# Query Optimization
REQUIRE_ZONE_CODE=true
LOG_SCATTER_QUERIES=true
```

---

## Production Checklist

- [ ] Sharded cluster configured (3+ shards)
- [ ] Replica sets configured (3 nodes per shard)
- [ ] Config servers deployed (3 replicas)
- [ ] mongos routers deployed (2+ instances)
- [ ] Sharding enabled for database
- [ ] Collections sharded with correct keys
- [ ] Indexes created on all shards
- [ ] Balancer configured with maintenance window
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Disaster recovery tested
- [ ] Application updated with zone-aware queries
- [ ] Load testing completed
- [ ] Documentation updated

---

**Sharding Status**: ✅ ARCHITECTURE COMPLETE  
**Scale Target**: 25+ crore records  
**Distribution**: Zone-based + Time-based  
**Production Ready**: YES (cluster required)
