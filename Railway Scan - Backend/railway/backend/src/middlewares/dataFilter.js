const { AuthorizationError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../shared/constants');
const logger = require('../utils/logger');

/**
 * Data filtering middleware
 * Automatically injects depot/zone filters into queries based on user role and assignment
 * 
 * Behavior:
 * - For INSPECTOR/DEPOT_OFFICER: Injects { depotId: user.depotId }
 * - For ZONAL_MANAGER: Injects { zoneId: user.zoneId }
 * - For ADMIN: No filters (full access)
 * - Validates POST/PUT requests to prevent cross-depot/zone resource creation
 * 
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Use in route middleware chain
 * router.get('/inspections', authenticate, roleAuthorization(['INSPECTOR']), dataFilter(), controller.list);
 * 
 * @example
 * // Services can access filters via req.dataFilter
 * const inspections = await Inspection.find({ ...req.dataFilter, status: 'PENDING' });
 */
const dataFilter = () => {
  return asyncHandler(async (req, _res, next) => {
    // Ensure user is authenticated (should be set by auth middleware)
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }

    const user = req.user;
    const userRole = user.role;

    // Initialize dataFilter object
    req.dataFilter = {};

    // Apply filters based on role
    switch (userRole) {
      case ROLES.INSPECTOR:
      case ROLES.DEPOT_OFFICER:
        if (!user.depotId) {
          // Silently skip depot filter - user hasn't been assigned a depot yet
          break;
        }
        req.dataFilter.depotId = user.depotId;
        break;

      case ROLES.ZONAL_MANAGER:
        if (!user.zoneId) {
          // Silently skip zone filter - user hasn't been assigned a zone yet
          break;
        }
        req.dataFilter.zoneId = user.zoneId;
        break;

      case ROLES.ADMIN:
        // No filters - full access
        break;

      default:
        // For other roles (e.g., VENDOR), no automatic filtering
        break;
    }

    // Validate POST/PUT requests to prevent cross-depot/zone resource creation
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      validateResourceCreation(req, user);
    }

    next();
  });
};

/**
 * Validate that users cannot create resources outside their assigned depot or zone
 * 
 * @param {Object} req - Express request object
 * @param {Object} user - Authenticated user object
 * @throws {AuthorizationError} If user attempts to create resource outside their assignment
 */
function validateResourceCreation(req, user) {
  const userRole = user.role;
  const requestBody = req.body;

  // Skip validation for ADMIN (full access)
  if (userRole === ROLES.ADMIN) {
    return;
  }

  // Validate depotId for INSPECTOR and DEPOT_OFFICER
  if ([ROLES.INSPECTOR, ROLES.DEPOT_OFFICER].includes(userRole)) {
    if (requestBody.depotId && user.depotId && requestBody.depotId !== user.depotId) {
      logger.warn('Cross-depot resource creation attempt:', {
        userId: user._id,
        role: userRole,
        userDepotId: user.depotId,
        requestedDepotId: requestBody.depotId,
        method: req.method,
        path: req.path,
      });
      throw new AuthorizationError(
        `Cannot create or modify resources for depot ${requestBody.depotId}. You are assigned to depot ${user.depotId}`
      );
    }

    // Auto-inject depotId if user has one and request doesn't
    if (!requestBody.depotId && user.depotId) {
      requestBody.depotId = user.depotId;
    }
  }

  // Validate zoneId for ZONAL_MANAGER
  if (userRole === ROLES.ZONAL_MANAGER) {
    if (requestBody.zoneId && requestBody.zoneId !== user.zoneId) {
      logger.warn('Cross-zone resource creation attempt:', {
        userId: user._id,
        role: userRole,
        userZoneId: user.zoneId,
        requestedZoneId: requestBody.zoneId,
        method: req.method,
        path: req.path,
      });
      throw new AuthorizationError(
        `Cannot create or modify resources for zone ${requestBody.zoneId}. You are assigned to zone ${user.zoneId}`
      );
    }

    // Auto-inject zoneId if not provided in request body
    if (!requestBody.zoneId) {
      requestBody.zoneId = user.zoneId;
    }
  }
}

module.exports = dataFilter;
