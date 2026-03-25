const { AuthorizationError, ValidationError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../shared/constants');
const ActivityLog = require('../models/ActivityLog.model');
const logger = require('../utils/logger');

/**
 * Role authorization middleware factory
 * Validates user role and permissions for route access
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @param {string[]} requiredPermissions - Optional specific permissions required
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow only DEPOT_OFFICER role
 * router.get('/qr', roleAuthorization([ROLES.DEPOT_OFFICER]), controller.listQR);
 * 
 * @example
 * // Allow multiple roles
 * router.get('/inspections', roleAuthorization([ROLES.INSPECTOR, ROLES.DEPOT_OFFICER]), controller.list);
 * 
 * @example
 * // Require specific permissions
 * router.post('/qr/batch', roleAuthorization([ROLES.DEPOT_OFFICER], ['CREATE_QR']), controller.batchGenerate);
 */
const roleAuthorization = (allowedRoles = [], requiredPermissions = []) => {
  return asyncHandler(async (req, _res, next) => {
    // Ensure user is authenticated (should be set by auth middleware)
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }

    const user = req.user;
    const userRole = user.role;

    // Validate X-User-Role header
    const headerRole = req.headers['x-user-role'];
    
    if (!headerRole) {
      // Log authorization failure
      try {
        await logAuthorizationFailure(req, 'Missing X-User-Role header');
      } catch (logError) {
        // Ignore logging errors
      }
      throw new ValidationError('X-User-Role header is required');
    }

    // Validate header role matches user's actual role
    if (headerRole !== userRole) {
      // Log authorization failure
      try {
        await logAuthorizationFailure(req, `X-User-Role header mismatch: ${headerRole} vs ${userRole}`);
      } catch (logError) {
        // Ignore logging errors
      }
      throw new AuthorizationError('X-User-Role header does not match user role');
    }

    // ADMIN role has access to all routes (role hierarchy)
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      // Log authorization failure
      try {
        await logAuthorizationFailure(req, `Role ${userRole} not in allowed roles: ${allowedRoles.join(', ')}`);
      } catch (logError) {
        // Ignore logging errors
      }
      throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    // Check required permissions if specified
    if (requiredPermissions.length > 0) {
      const userPermissions = user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          permission => !userPermissions.includes(permission)
        );
        
        // Log authorization failure
        try {
          await logAuthorizationFailure(
            req, 
            `Missing permissions: ${missingPermissions.join(', ')}`
          );
        } catch (logError) {
          // Ignore logging errors
        }
        
        throw new AuthorizationError(
          `Access denied. Missing required permissions: ${missingPermissions.join(', ')}`
        );
      }
    }

    // Authorization successful
    next();
  });
};

/**
 * Log authorization failures to ActivityLog for security monitoring
 * 
 * @param {Object} req - Express request object
 * @param {string} reason - Reason for authorization failure
 */
async function logAuthorizationFailure(req, reason) {
  try {
    await ActivityLog.create({
      userId: req.user?._id || null,
      userName: req.user?.name || 'Unknown',
      role: req.user?.role || 'Unknown',
      action: 'READ', // Authorization check is a read operation
      resource: 'AUTHORIZATION',
      resourceId: req.path,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata: {
        reason,
        method: req.method,
        path: req.path,
        headerRole: req.headers['x-user-role'],
        actualRole: req.user?.role,
      },
    });
  } catch (error) {
    // Don't throw error if logging fails - just log it
    logger.error('Failed to log authorization failure:', {
      error: error.message,
      userId: req.user?._id,
      path: req.path,
    });
  }
}

module.exports = roleAuthorization;
