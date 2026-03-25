const { getRedisClient } = require('../config/redis');
const config = require('../config');
const logger = require('./logger');

class CacheService {
  static async get(key) {
    const client = getRedisClient();
    if (!client) return null;
    
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, value, ttl = config.redis.cacheTTL) {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  static async del(key) {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  static async delPattern(pattern) {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return false;
    }
  }

  static async exists(key) {
    const client = getRedisClient();
    if (!client) return false;
    
    try {
      return await client.exists(key);
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get dashboard TTL based on role
   * @param {string} role - User role (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER)
   * @returns {number} TTL in seconds
   */
  static getDashboardTTL(role) {
    const ttlConfig = {
      INSPECTOR: 300,        // 5 minutes
      DEPOT_OFFICER: 600,    // 10 minutes
      ZONAL_MANAGER: 900,    // 15 minutes
    };
    
    return ttlConfig[role] || 300; // Default to 5 minutes
  }
}

module.exports = CacheService;
