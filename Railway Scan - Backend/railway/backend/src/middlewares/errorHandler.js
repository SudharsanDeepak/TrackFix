const { HTTP_STATUS } = require('../shared/constants');
const logger = require('../utils/logger');
const ResponseFormatter = require('../utils/responseFormatter');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });
  
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }
  
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
  }
  
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for field: ${field}`;
  }
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }
  
  const errorResponse = {
    code: err.errorCode || 'INTERNAL_ERROR',
    details: err.details || null,
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  return ResponseFormatter.error(res, message, statusCode, errorResponse);
};

module.exports = errorHandler;
