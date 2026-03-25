#!/usr/bin/env node

/**
 * MongoDB Sharding Enablement Script
 * 
 * This script enables sharding for RailTrack AI collections
 * Run this ONLY on a sharded MongoDB cluster
 * 
 * Prerequisites:
 * - MongoDB sharded cluster configured
 * - Config servers running
 * - Shard servers running
 * - mongos router accessible
 * 
 * Usage:
 * node scripts/enableSharding.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/railtrack_ai';
const DB_NAME = 'railtrack_ai';

const shardedCollections = [
  {
    name: 'trackfittings',
    shardKey: { zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 },
    unique: false,
  },
  {
    name: 'inspections',
    shardKey: { zoneCode: 1, inspectionYear: 1, fitting: 1 },
    unique: false,
  },
  {
    name: 'aireports',
    shardKey: { zoneCode: 1, predictionYear: 1, fitting: 1 },
    unique: false,
  },
  {
    name: 'performancelogs',
    shardKey: { zoneCode: 1, logYear: 1, fitting: 1 },
    unique: false,
  },
  {
    name: 'inspectionarchives',
    shardKey: { zoneCode: 1, inspectionYear: 1, originalId: 1 },
    unique: false,
  },
  {
    name: 'aireportarchives',
    shardKey: { zoneCode: 1, predictionYear: 1, originalId: 1 },
    unique: false,
  },
  {
    name: 'performancelogarchives',
    shardKey: { zoneCode: 1, logYear: 1, originalId: 1 },
    unique: false,
  },
];

async function enableSharding() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    console.log('\n=== Enabling Sharding for Database ===');
    try {
      await admin.command({ enableSharding: DB_NAME });
      console.log(`✓ Sharding enabled for database: ${DB_NAME}`);
    } catch (error) {
      if (error.codeName === 'AlreadyInitialized') {
        console.log(`✓ Sharding already enabled for database: ${DB_NAME}`);
      } else {
        throw error;
      }
    }
    
    console.log('\n=== Sharding Collections ===');
    for (const collection of shardedCollections) {
      const fullName = `${DB_NAME}.${collection.name}`;
      
      try {
        await admin.command({
          shardCollection: fullName,
          key: collection.shardKey,
          unique: collection.unique,
        });
        console.log(`✓ Sharded: ${collection.name}`);
        console.log(`  Shard Key: ${JSON.stringify(collection.shardKey)}`);
      } catch (error) {
        if (error.codeName === 'AlreadyInitialized') {
          console.log(`✓ Already sharded: ${collection.name}`);
        } else {
          console.error(`✗ Failed to shard ${collection.name}:`, error.message);
        }
      }
    }
    
    console.log('\n=== Verifying Shard Status ===');
    const shardStatus = await admin.command({ listShards: 1 });
    console.log(`Active Shards: ${shardStatus.shards.length}`);
    shardStatus.shards.forEach((shard, index) => {
      console.log(`  Shard ${index + 1}: ${shard._id} - ${shard.host}`);
    });
    
    console.log('\n=== Shard Distribution ===');
    for (const collection of shardedCollections) {
      try {
        const stats = await db.collection(collection.name).stats();
        console.log(`\n${collection.name}:`);
        console.log(`  Documents: ${stats.count || 0}`);
        console.log(`  Size: ${((stats.size || 0) / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Sharded: ${stats.sharded ? 'Yes' : 'No'}`);
      } catch (error) {
        console.log(`\n${collection.name}: Collection not yet created`);
      }
    }
    
    console.log('\n✓ Sharding configuration complete!');
    console.log('\nNext steps:');
    console.log('1. Monitor shard distribution: db.collection.getShardDistribution()');
    console.log('2. Check balancer status: sh.getBalancerState()');
    console.log('3. Monitor chunk distribution: sh.status()');
    
  } catch (error) {
    console.error('\n✗ Error enabling sharding:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  enableSharding();
}

module.exports = enableSharding;
