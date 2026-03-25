const ActivityLog = require('../models/ActivityLog.model');
const logger = require('../utils/logger');

/**
 * Activity logger middleware factory
 * Logs user actions after successful requests
 * 
 * Features:
 * - Asynchronous logging (doesn't block response)
 * - Batching for performance optimization
 * - Automatic exclusion of health check and metrics endpoints
 * - Captures userId, userName, role, action, resource, resourceId, ipAddress, userAgent
 * 
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, READ)
 * @param {string} resource - Resource type being acted upon (e.g., 'QR', 'INSPECTION', 'DEFECT')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Log QR code creation
 * router.post('/qr', activityLogger('CREATE', 'QR'), controller.createQR);
 * 
 * @example
 * // Log inspection approval
 * router.post('/inspections/:id/approve', activityLogger('APPROVE', 'INSPECTION'), controller.approve);
 */

// Batch configuration
const BATCH_SIZE = 50; // Number of logs to batch before writing
const BATCH_TIMEOUT = 5000; // Max time (ms) to wait before flushing batch
const logBatch = [];
let batchTimer = null;

/**
 * Flush the current batch of logs to the database
 */
async function flushBatch() {
  if (logBatch.length === 0) {
    return;
  }

  // Clear the timer
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }

  // Copy and clear the batch
  const logsToWrite = [...logBatch];
  logBatch.length = 0;

  try {
    await ActivityLog.insertMany(logsToWrite, { ordered: false });
    logger.info(`Activity logs batch written: ${logsToWrite.length} entries`);
  } catch (error) {
    // Log the error but don't throw - logging failures shouldn't affect the application
    logger.error('Failed to write activity logs batch:', {
      error: error.message,
      batchSize: logsToWrite.length,
      stack: error.stack,
    });
  }
}

/**
 * Add a log entry to the batch
 * 
 * @param {Object} logEntry - Log entry to add to batch
 */
function addToBatch(logEntry) {
  logBatch.push(logEntry);

  // Flush immediately if batch is full
  if (logBatch.length >= BATCH_SIZE) {
    flushBatch();
  } else {
    // Reset the timer
    if (batchTimer) {
      clearTimeout(batchTimer);
    }
    batchTimer = setTimeout(flushBatch, BATCH_TIMEOUT);
  }
}

/**
 * Check if the request path should be excluded from logging
 * 
 * @param {string} path - Request path
 * @returns {boolean} True if path should be excluded
 */
function shouldExclude(path) {
  const excludedPaths = [
    '/health',
    '/metrics',
    '/api/health',
    '/api/metrics',
    '/api/v1/health',
    '/api/v1/metrics',
  ];

  return excludedPaths.some(excluded => path.endsWith(excluded));
}

/**
 * Activity logger middleware factory
 */
const activityLogger = (action, resource) => {
  return (req, res, next) => {
    // Skip logging for excluded endpoints
    if (shouldExclude(req.path)) {
      return next();
    }

    // Skip if user is not authenticated
    if (!req.user) {
      return next();
    }

    // Log after response is sent to avoid blocking
    res.on('finish', () => {
      // Only log successful responses (2xx and 3xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          // Extract resourceId from request params or body
          let resourceId = req.params.id || req.params.resourceId;
          
          // For POST requests, try to get the created resource ID from response
          if (!resourceId && req.method === 'POST' && res.locals.createdResourceId) {
            resourceId = res.locals.createdResourceId;
          }

          // Create log entry
          const logEntry = {
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            action,
            resource,
            resourceId: resourceId || undefined,
            ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress,
            userAgent: req.headers['user-agent'],
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              // Include query params for READ operations
              ...(action === 'READ' && Object.keys(req.query).length > 0 && {
                queryParams: req.query,
              }),
            },
          };

          // Add to batch for async processing
          addToBatch(logEntry);
        } catch (error) {
          // Don't throw error if logging fails - just log it
          logger.error('Failed to create activity log entry:', {
            error: error.message,
            userId: req.user?._id,
            action,
            resource,
            path: req.path,
          });
        }
      }
    });

    next();
  };
};

/**
 * Graceful shutdown handler
 * Flushes remaining logs before process exits
 */
function gracefulShutdown() {
  logger.info('Flushing remaining activity logs before shutdown...');
  return flushBatch();
}

// Register shutdown handlers
process.on('SIGTERM', async () => {
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await gracefulShutdown();
  process.exit(0);
});

// Export the middleware and utility functions
module.exports = activityLogger;
module.exports.flushBatch = flushBatch;
module.exports.gracefulShutdown = gracefulShutdown;
