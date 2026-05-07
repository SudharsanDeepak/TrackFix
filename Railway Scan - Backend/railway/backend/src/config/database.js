const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

let inMemoryServer = null;
let isUsingInMemory = false;
let MongoMemoryServer;
try {
  // optional dependency; only used for local development fallback
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (err) {
  MongoMemoryServer = null;
}

// Suppress Mongoose warnings
mongoose.set('strictQuery', false);
process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

const connectDB = async () => {
  try {
    // Suppress duplicate index warnings
    mongoose.set('autoIndex', false);
    
    let conn;
    try {
      conn = await mongoose.connect(config.database.uri, config.database.options);
      console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      logger.warn('Primary MongoDB connection failed:', error);

      // If in development, try an in-memory MongoDB as a fallback so the app can run
      if (process.env.NODE_ENV === 'development' && MongoMemoryServer) {
        logger.info('Attempting to start in-memory MongoDB for development...');
        inMemoryServer = await MongoMemoryServer.create();
        const uri = inMemoryServer.getUri();
        isUsingInMemory = true;
        conn = await mongoose.connect(uri, config.database.options);
        console.log(`✓ MongoDB In-Memory Connected: ${conn.connection.host}`);
      } else {
        throw error;
      }
    }

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
      if (inMemoryServer) {
        try {
          await inMemoryServer.stop();
        } catch (e) {
          logger.debug('Error stopping in-memory MongoDB', e);
        }
      }
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
