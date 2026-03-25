const rateLimit = require('express-rate-limit');
const config = require('../config');
const { HTTP_STATUS, ERROR_CODES } = require('../shared/constants');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs || config.security.rateLimitWindow * 60 * 1000,
    max: max || config.security.rateLimitMaxRequests,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later',
      data: null,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
    },
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Temporarily increased for testing - change back to 5 in production
const loginLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many login attempts, please try again after 15 minutes');

const apiLimiter = createRateLimiter();

const strictLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Rate limit exceeded for this operation');

module.exports = {
  createRateLimiter,
  loginLimiter,
  apiLimiter,
  strictLimiter,
};
