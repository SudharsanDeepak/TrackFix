const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config');

const setupSlowQueryLogging = () => {
  if (config.env === 'development') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug('MongoDB Query', {
        collection: collectionName,
        method,
        query: JSON.stringify(query),
      });
    });
  }

  mongoose.connection.on('connected', () => {
    const db = mongoose.connection.db;
    
    if (db && config.env !== 'test') {
      db.admin().command({ profile: 2, slowms: config.performance.slowQueryThreshold }, (err) => {
        if (err) {
          logger.warn('Could not enable database profiling:', err.message);
        } else {
          logger.info('Database profiling enabled', {
            slowQueryThreshold: `${config.performance.slowQueryThreshold}ms`,
          });
        }
      });
    }
  });
};

module.exports = { setupSlowQueryLogging };
