const redis = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  if (!config.redis.url || config.redis.url.trim() === '') {
    logger.info('Redis disabled - caching not available');
    return null;
  }
  
  try {
    redisClient = redis.createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max reconnection attempts reached');
            return new Error('Redis reconnection failed');
          }
          return retries * 100;
        },
        connectTimeout: 10000,
        keepAlive: 5000,
      },
      commandsQueueMaxLength: 1000,
      disableOfflineQueue: false,
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });
    
    redisClient.on('reconnecting', () => {
      logger.warn('Redis Client Reconnecting');
    });
    
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    return null;
  }
};

const getRedisClient = () => redisClient;

const closeRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      // Redis already closed, ignore error
      logger.debug('Redis already closed');
    }
  }
};

module.exports = { connectRedis, getRedisClient, closeRedis };
