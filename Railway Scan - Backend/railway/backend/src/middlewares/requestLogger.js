const logger = require('../utils/logger');
const { getCorrelationId } = require('../utils/correlationId');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const correlationId = getCorrelationId();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    };

    // Auth endpoints (Google OAuth) are expected to be slower due to external API calls
    const isAuthEndpoint = req.originalUrl.includes('/auth/')
    const slowThreshold = isAuthEndpoint ? 5000 : 1000

    if (duration > slowThreshold) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.debug('Request completed', logData);
    }
  });

  next();
};

module.exports = requestLogger;
