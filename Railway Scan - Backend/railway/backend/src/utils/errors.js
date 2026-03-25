const { HTTP_STATUS, ERROR_CODES } = require('../shared/constants');

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

class DuplicateError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_ENTRY);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'External service error') {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, ERROR_CODES.EXTERNAL_SERVICE_ERROR);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateError,
  DatabaseError,
  ExternalServiceError,
};
