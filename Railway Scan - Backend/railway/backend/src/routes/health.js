const express = require('express');
const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');
const config = require('../config');

const router = express.Router();

router.get('/health', async (_req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: config.apiVersion,
    services: {},
  };

  try {
    if (mongoose.connection.readyState === 1) {
      health.services.mongodb = {
        status: 'connected',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      };
    } else {
      health.services.mongodb = { status: 'disconnected' };
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.mongodb = { status: 'error', message: error.message };
    health.status = 'unhealthy';
  }

  try {
    const redisClient = getRedisClient();
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      health.services.redis = { status: 'connected' };
    } else {
      health.services.redis = { status: 'disconnected' };
    }
  } catch (error) {
    health.services.redis = { status: 'error', message: error.message };
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/metrics', async (_req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
      },
      cpu: process.cpuUsage(),
    },
    database: {
      connections: mongoose.connection.readyState === 1 ? 'active' : 'inactive',
    },
  };

  // Add shard distribution metrics if MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    try {
      const db = mongoose.connection.db;
      
      // Get collection stats for sharded collections
      const shardedCollections = ['trackfittings', 'inspections', 'aireports', 'performancelogs'];
      const collectionStats = {};
      
      for (const collectionName of shardedCollections) {
        try {
          const stats = await db.collection(collectionName).stats();
          collectionStats[collectionName] = {
            count: stats.count || 0,
            size: `${Math.round((stats.size || 0) / 1024 / 1024)}MB`,
            avgObjSize: stats.avgObjSize ? `${Math.round(stats.avgObjSize)}B` : 'N/A',
            storageSize: `${Math.round((stats.storageSize || 0) / 1024 / 1024)}MB`,
            indexes: stats.nindexes || 0,
            indexSize: `${Math.round((stats.totalIndexSize || 0) / 1024 / 1024)}MB`,
          };
        } catch (err) {
          collectionStats[collectionName] = { error: 'Collection not found or stats unavailable' };
        }
      }
      
      metrics.sharding = {
        collections: collectionStats,
        shardingEnabled: false, // Will be true in actual sharded cluster
        note: 'Shard distribution available only in sharded cluster deployment',
      };
    } catch (error) {
      metrics.sharding = { error: error.message };
    }
  }

  res.json(metrics);
});

module.exports = router;
