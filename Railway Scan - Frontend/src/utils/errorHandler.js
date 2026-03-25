/**
 * Error handling utilities
 */

/**
 * Parse API error and extract user-friendly message
 */
export const parseApiError = error => {
  // Network error
  if (!error.response) {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
    }
  }

  const { status, data } = error.response

  // Extract error message from response
  const message = data?.message || data?.error?.message || getDefaultErrorMessage(status)

  return {
    message,
    code: data?.error?.code || `HTTP_${status}`,
    status,
    details: data?.error?.details,
  }
}

/**
 * Get default error message based on status code
 */
const getDefaultErrorMessage = status => {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'Unauthorized. Please login again.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    409: 'This resource already exists.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.',
  }

  return messages[status] || 'An unexpected error occurred.'
}

/**
 * Log error to console (development) or error service (production)
 */
export const logError = (error, context = {}) => {
  if (import.meta.env.DEV) {
    console.error('Error:', error)
    console.error('Context:', context)
  } else {
    // In production, send to error logging service
    // Example: Sentry, LogRocket, etc.
    // sendToErrorService(error, context)
  }
}

/**
 * Handle async errors in components
 */
export const handleAsyncError = (error, fallbackMessage = 'An error occurred') => {
  const parsedError = parseApiError(error)
  logError(error, { parsedError })
  return parsedError.message || fallbackMessage
}

/**
 * Create error object for display
 */
export const createError = (message, code = 'ERROR', details = null) => {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Check if error is network error
 */
export const isNetworkError = error => {
  return !error.response && error.message === 'Network Error'
}

/**
 * Check if error is authentication error
 */
export const isAuthError = error => {
  return error.response?.status === 401
}

/**
 * Check if error is authorization error
 */
export const isAuthorizationError = error => {
  return error.response?.status === 403
}

/**
 * Check if error is validation error
 */
export const isValidationError = error => {
  return error.response?.status === 400
}

/**
 * Check if error is server error
 */
export const isServerError = error => {
  return error.response?.status >= 500
}
