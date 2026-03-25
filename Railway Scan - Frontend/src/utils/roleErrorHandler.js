/**
 * Role-based error handling utilities
 * Provides role-specific error messages and logging for administrative review
 */

import { getRoleConfig } from './roleHelpers'

/**
 * Error types for role-based access control
 */
export const ERROR_TYPES = {
  MISSING_ROLE: 'MISSING_ROLE',
  INVALID_ROLE: 'INVALID_ROLE',
  UNAUTHORIZED_ROUTE: 'UNAUTHORIZED_ROUTE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ROLE_CHANGED: 'ROLE_CHANGED',
}

/**
 * Get user-friendly error message for role-based access restrictions
 * @param {string} errorType - Type of error
 * @param {object} context - Additional context (role, path, feature, etc.)
 * @returns {object} Error object with message and action
 */
export const getRoleErrorMessage = (errorType, context = {}) => {
  const { role, oldRole, newRole } = context

  switch (errorType) {
    case ERROR_TYPES.MISSING_ROLE:
      return {
        error: 'MISSING_ROLE',
        title: 'Role Not Assigned',
        message:
          'Your account does not have a role assigned. Please contact your administrator to assign a role to your account.',
        action: 'BLOCK_ACCESS',
        severity: 'error',
      }

    case ERROR_TYPES.INVALID_ROLE:
      return {
        error: 'INVALID_ROLE',
        title: 'Invalid Role',
        message:
          'Your account has an invalid role. Please contact your administrator to resolve this issue.',
        action: 'LOGOUT',
        severity: 'error',
      }

    case ERROR_TYPES.UNAUTHORIZED_ROUTE: {
      const roleConfig = getRoleConfig(role)
      const roleName = roleConfig?.displayName || 'your role'

      return {
        error: 'UNAUTHORIZED_ROUTE',
        title: 'Access Restricted',
        message: `You do not have permission to access this page. This feature is not available for ${roleName} users.`,
        action: 'REDIRECT',
        redirectTo: roleConfig?.defaultRoute || '/',
        severity: 'warning',
        suggestion: `You can access features available to ${roleName} users from your dashboard.`,
      }
    }

    case ERROR_TYPES.PERMISSION_DENIED:
      return {
        error: 'PERMISSION_DENIED',
        title: 'Permission Denied',
        message:
          'You do not have permission to perform this action. Your session may have expired or your permissions may have changed.',
        action: 'LOGOUT',
        severity: 'error',
      }

    case ERROR_TYPES.SESSION_EXPIRED:
      return {
        error: 'SESSION_EXPIRED',
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        action: 'LOGOUT',
        severity: 'info',
      }

    case ERROR_TYPES.ROLE_CHANGED: {
      const newRoleConfig = getRoleConfig(newRole)
      const newRoleName = newRoleConfig?.displayName || newRole

      return {
        event: 'ROLE_CHANGED',
        title: 'Role Updated',
        message: `Your role has been updated to ${newRoleName}. You will be redirected to your new dashboard.`,
        oldRole,
        newRole,
        action: 'RELOAD',
        severity: 'info',
      }
    }

    default:
      return {
        error: 'UNKNOWN_ERROR',
        title: 'Error',
        message: 'An unexpected error occurred. Please try again or contact support.',
        action: 'NONE',
        severity: 'error',
      }
  }
}

/**
 * Get feature-specific access restriction message
 * @param {string} feature - Feature identifier
 * @param {string} role - User role
 * @returns {string} User-friendly message
 */
export const getFeatureAccessMessage = (feature, role) => {
  const roleConfig = getRoleConfig(role)
  const roleName = roleConfig?.displayName || 'your role'

  const featureNames = {
    'scan-qr': 'QR Code Scanning',
    inspections: 'Inspections',
    defects: 'Defect Reports',
    'qr-management': 'QR Code Management',
    reports: 'Reports',
    inventory: 'Inventory Management',
    analytics: 'Zone Analytics',
    depots: 'Depot Performance',
    vendors: 'Vendor Management',
    alerts: 'Alerts',
    users: 'User Management',
    settings: 'System Settings',
    'audit-logs': 'Audit Logs',
    'system-health': 'System Health',
  }

  const featureName = featureNames[feature] || feature

  return `${featureName} is not available for ${roleName} users. Please contact your administrator if you need access to this feature.`
}

/**
 * Get alternative action suggestions for blocked navigation
 * @param {string} role - User role
 * @returns {Array} Array of suggested actions
 */
export const getAlternativeActions = role => {
  const roleConfig = getRoleConfig(role)

  if (!roleConfig) {
    return []
  }

  const suggestions = {
    INSPECTOR: [
      { label: 'Go to Dashboard', path: '/inspector/dashboard' },
      { label: 'Start Inspection', path: '/inspector/start-inspection' },
      { label: 'Scan QR Code', path: '/inspector/scan-qr' },
      { label: 'View My Inspections', path: '/inspector/inspections' },
    ],
    DEPOT_OFFICER: [
      { label: 'Go to Dashboard', path: '/depot-officer/dashboard' },
      { label: 'Manage QR Codes', path: '/depot-officer/qr-management' },
      { label: 'View Inspections', path: '/depot-officer/inspections' },
      { label: 'Generate Reports', path: '/depot-officer/reports' },
    ],
    ZONAL_MANAGER: [
      { label: 'Go to Dashboard', path: '/zonal-manager/dashboard' },
      { label: 'View Zone Analytics', path: '/zonal-manager/analytics' },
      { label: 'Check Depot Performance', path: '/zonal-manager/depots' },
      { label: 'Manage Vendors', path: '/zonal-manager/vendors' },
    ],
    ADMIN: [
      { label: 'Go to Dashboard', path: '/admin/dashboard' },
      { label: 'Manage Users', path: '/admin/users' },
      { label: 'System Settings', path: '/admin/settings' },
      { label: 'View Audit Logs', path: '/admin/audit-logs' },
    ],
  }

  return suggestions[role] || []
}

/**
 * Log role-based access error for administrative review
 * @param {string} errorType - Type of error
 * @param {object} context - Error context
 */
export const logRoleError = (errorType, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    errorType,
    userId: context.userId || 'unknown',
    currentRole: context.role || 'unknown',
    attemptedPath: context.path || 'unknown',
    attemptedFeature: context.feature || null,
    userAgent: navigator.userAgent,
    sessionId: context.sessionId || null,
    additionalContext: context,
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('[Role Access Error]', errorLog)
  }

  // In production, send to backend for administrative review
  if (!import.meta.env.DEV) {
    // Send to backend logging endpoint
    try {
      fetch('/api/v1/logs/role-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      }).catch(err => {
        console.error('Failed to log role error:', err)
      })
    } catch (error) {
      console.error('Failed to log role error:', error)
    }
  }

  return errorLog
}

/**
 * Handle role-based error with appropriate action
 * @param {string} errorType - Type of error
 * @param {object} context - Error context
 * @param {Function} onLogout - Logout callback
 * @param {Function} onRedirect - Redirect callback
 * @returns {object} Error details
 */
export const handleRoleError = (errorType, context = {}, onLogout, onRedirect) => {
  // Log the error
  logRoleError(errorType, context)

  // Get error message
  const errorDetails = getRoleErrorMessage(errorType, context)

  // Execute appropriate action
  switch (errorDetails.action) {
    case 'LOGOUT':
      if (onLogout) {
        onLogout()
      }
      break

    case 'REDIRECT':
      if (onRedirect && errorDetails.redirectTo) {
        onRedirect(errorDetails.redirectTo)
      }
      break

    case 'BLOCK_ACCESS':
      // Display error and prevent access
      // Handled by caller
      break

    case 'RELOAD':
      // Reload application with new role
      // Handled by caller
      break

    default:
      // No action needed
      break
  }

  return errorDetails
}

/**
 * Format error for display in UI
 * @param {object} errorDetails - Error details from getRoleErrorMessage
 * @returns {object} Formatted error for UI display
 */
export const formatErrorForDisplay = errorDetails => {
  return {
    title: errorDetails.title,
    message: errorDetails.message,
    severity: errorDetails.severity,
    suggestion: errorDetails.suggestion || null,
    actions: errorDetails.action !== 'NONE' ? [errorDetails.action] : [],
  }
}
