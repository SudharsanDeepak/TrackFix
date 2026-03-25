const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const cacheCleanupJob = async () => {
  const client = getRedisClient();
  if (!client) {
    logger.info('Redis not available, skipping cache cleanup');
    return { cleaned: 0 };
  }

  try {
    const keys = await client.keys('*');
    let cleaned = 0;

    for (const key of keys) {
      const ttl = await client.ttl(key);
      if (ttl === -1) {
        await client.del(key);
        cleaned++;
      }
    }

    logger.info('Cache cleanup completed', { cleaned, total: keys.length });
    return { cleaned };
  } catch (error) {
    logger.error('Cache cleanup failed:', error);
    return { cleaned: 0 };
  }
};

module.exports = cacheCleanupJob;
