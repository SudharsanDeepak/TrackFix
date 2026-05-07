const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');
const { connectRedis, closeRedis } = require('./config/redis');
const logger = require('./utils/logger');
const jobScheduler = require('./jobs');
const { setupEventListeners } = require('./events');
const http = require('http');
const { initializeSocket } = require('./config/socket');

let server;

const startServer = async () => {
  try {
    await connectDB();
    
    await connectRedis();
    
    setupEventListeners();
    
    jobScheduler.start();
    
    // Create HTTP server for socket.io
    const httpServer = http.createServer(app);
    
    // Initialize socket.io
    initializeSocket(httpServer);
    
    server = httpServer.listen(config.port, () => {
      console.log(`\n🚀 RailTrack-FIX Backend`);
      console.log(`   Port: ${config.port}`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   API Docs: http://localhost:${config.port}/api-docs`);
      console.log(`   Health: http://localhost:${config.port}/health`);
      console.log(`   WebSocket: ws://localhost:${config.port}\n`);
    });
    
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      jobScheduler.stop();
      
      try {
        await closeRedis();
      } catch (error) {
        // Ignore Redis close errors during shutdown
        logger.debug('Redis close error ignored during shutdown');
      }
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });
    
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
