const { ROLE_PERMISSIONS } = require('../shared/constants');
const { AuthorizationError } = require('../utils/errors');
const logger = require('../utils/logger');

const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed:', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      throw new AuthorizationError('Insufficient permissions');
    }
    
    next();
  };
};

const checkPermission = (permission) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }
    
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      logger.warn('Permission check failed:', {
        userId: req.user.id,
        role: req.user.role,
        requiredPermission: permission,
        path: req.path,
      });
      throw new AuthorizationError(`Permission denied: ${permission}`);
    }
    
    next();
  };
};

module.exports = { authorize, checkPermission };
