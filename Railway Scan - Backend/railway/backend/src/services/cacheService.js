const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache Service
 * Provides Redis caching functionality with role-specific TTL configurations
 * and cache key patterns for different data types
 */
class CacheService {
  /**
   * Cache key patterns for different data types
   */
  static CACHE_KEYS = {
    // Dashboard statistics
    DASHBOARD_STATS: (role, userId) => `dashboard:stats:${role}:${userId}`,
    
    // Analytics
    ANALYTICS_INSPECTION_TRENDS: (zoneId, timeRange) => `analytics:inspection-trends:${zoneId}:${timeRange}`,
    ANALYTICS_DEFECT_TRENDS: (zoneId, timeRange) => `analytics:defect-trends:${zoneId}:${timeRange}`,
    
    // Depot performance
    DEPOT_PERFORMANCE: (zoneId) => `depot:performance:${zoneId}`,
    DEPOT_RANKINGS: (zoneId) => `depot:rankings:${zoneId}`,
    
    // Vendor performance
    VENDOR_PERFORMANCE: (vendorId, zoneId) => `vendor:performance:${vendorId}:${zoneId}`,
    VENDOR_LIST: (zoneId) => `vendor:list:${zoneId}`,
    
    // User permissions
    USER_PERMISSIONS: (userId) => `user:permissions:${userId}`,
    
    // Activity logs
    ACTIVITY_LOGS: (userId, page) => `activity:logs:${userId}:${page}`,
    
    // Audit logs
    AUDIT_LOGS: (category, page) => `audit:logs:${category}:${page}`,
  };

  /**
   * TTL Configuration (in seconds)
   * Based on Requirements 30.2, 30.3, 30.4
   */
  static TTL = {
    INSPECTOR_DASHBOARD: 5 * 60,        // 5 minutes
    DEPOT_OFFICER_DASHBOARD: 10 * 60,   // 10 minutes
    ZONAL_MANAGER_DASHBOARD: 15 * 60,   // 15 minutes
    ANALYTICS: 15 * 60,                 // 15 minutes
    DEPOT_PERFORMANCE: 30 * 60,         // 30 minutes
    VENDOR_PERFORMANCE: 60 * 60,        // 1 hour
    USER_PERMISSIONS: 10 * 60,          // 10 minutes
    ACTIVITY_LOGS: 2 * 60,              // 2 minutes
  };

  /**
   * Get TTL based on role for dashboard statistics
   * @param {string} role - User role (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER, ADMIN)
   * @returns {number} TTL in seconds
   */
  static getDashboardTTL(role) {
    switch (role) {
      case 'INSPECTOR':
        return this.TTL.INSPECTOR_DASHBOARD;
      case 'DEPOT_OFFICER':
        return this.TTL.DEPOT_OFFICER_DASHBOARD;
      case 'ZONAL_MANAGER':
      case 'ADMIN':
        return this.TTL.ZONAL_MANAGER_DASHBOARD;
      default:
        return this.TTL.INSPECTOR_DASHBOARD;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null if not found
   */
  static async get(key) {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return null;
    }
    
    try {
      const data = await client.get(key);
      if (data) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} Success status
   */
  static async set(key, value, ttl = 300) {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    try {
      await client.setEx(key, ttl, JSON.stringify(value));
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', { key, ttl, error: error.message });
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  static async del(key) {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    try {
      await client.del(key);
      logger.debug(`Cache deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'dashboard:stats:*')
   * @returns {Promise<boolean>} Success status
   */
  static async invalidatePattern(pattern) {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        logger.info(`Cache invalidated: ${keys.length} keys matching pattern '${pattern}'`);
      } else {
        logger.debug(`No cache keys found matching pattern '${pattern}'`);
      }
      return true;
    } catch (error) {
      logger.error('Cache invalidate pattern error:', { pattern, error: error.message });
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists
   */
  static async exists(key) {
    const client = getRedisClient();
    if (!client) {
      return false;
    }
    
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} Remaining TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  static async ttl(key) {
    const client = getRedisClient();
    if (!client) {
      return -2;
    }
    
    try {
      return await client.ttl(key);
    } catch (error) {
      logger.error('Cache TTL error:', { key, error: error.message });
      return -2;
    }
  }

  /**
   * Invalidate cache for a specific depot
   * Used when depot data changes
   * @param {string} depotId - Depot ID
   * @returns {Promise<boolean>} Success status
   */
  static async invalidateDepotCache(depotId) {
    try {
      await this.invalidatePattern(`dashboard:stats:*:*${depotId}*`);
      await this.invalidatePattern(`depot:*:*${depotId}*`);
      logger.info(`Invalidated cache for depot: ${depotId}`);
      return true;
    } catch (error) {
      logger.error('Invalidate depot cache error:', { depotId, error: error.message });
      return false;
    }
  }

  /**
   * Invalidate cache for a specific zone
   * Used when zone data changes
   * @param {string} zoneId - Zone ID
   * @returns {Promise<boolean>} Success status
   */
  static async invalidateZoneCache(zoneId) {
    try {
      await this.invalidatePattern(`analytics:*:${zoneId}:*`);
      await this.invalidatePattern(`depot:*:${zoneId}`);
      await this.invalidatePattern(`vendor:*:${zoneId}`);
      logger.info(`Invalidated cache for zone: ${zoneId}`);
      return true;
    } catch (error) {
      logger.error('Invalidate zone cache error:', { zoneId, error: error.message });
      return false;
    }
  }

  /**
   * Invalidate user-specific cache
   * Used when user data or permissions change
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  static async invalidateUserCache(userId) {
    try {
      await this.invalidatePattern(`dashboard:stats:*:${userId}`);
      await this.invalidatePattern(`user:permissions:${userId}`);
      await this.invalidatePattern(`activity:logs:${userId}:*`);
      logger.info(`Invalidated cache for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Invalidate user cache error:', { userId, error: error.message });
      return false;
    }
  }

  /**
   * Clear all cache entries
   * Use with caution - typically only for maintenance or testing
   * @returns {Promise<boolean>} Success status
   */
  static async clearAll() {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis client not available');
      return false;
    }
    
    try {
      await client.flushDb();
      logger.warn('All cache entries cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear all error:', error);
      return false;
    }
  }
}

module.exports = CacheService;
