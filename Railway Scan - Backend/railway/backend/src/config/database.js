const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

// Suppress Mongoose warnings
mongoose.set('strictQuery', false);
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

const connectDB = async () => {
  try {
    // Suppress duplicate index warnings
    mongoose.set('autoIndex', false);
    
    const conn = await mongoose.connect(config.database.uri, config.database.options);
    
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    
    // Disable slow query logging to reduce noise
    // const { setupSlowQueryLogging } = require('../middlewares/slowQuery');
    // setupSlowQueryLogging();
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
