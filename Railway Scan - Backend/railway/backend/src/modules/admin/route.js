const express = require('express');
const adminController = require('./controller');
const { validate, validateQuery, validateParams } = require('../../middlewares/validator');
const {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  listUsersQuerySchema,
  activityLogsQuerySchema,
  auditLogsQuerySchema,
  updateSystemSettingsSchema,
  userIdParamSchema,
} = require('./validator');
const authenticate = require('../../middlewares/auth');
const roleAuthorization = require('../../middlewares/roleAuthorization');
const activityLogger = require('../../middlewares/activityLogger');
const { ROLES } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');

const router = express.Router();

/**
 * Admin Routes
 * All routes are protected with:
 * - authenticate: Verify JWT token
 * - roleAuthorization: Verify ADMIN role
 * - activityLogger: Log user actions
 * Note: No dataFilter middleware as admins have unrestricted access
 */

// User Management Routes

// GET /api/v1/admin/users - List all users
router.get(
  '/users',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  paginate,
  validateQuery(listUsersQuerySchema),
  activityLogger('READ', 'USER'),
  adminController.getUsers
);

// POST /api/v1/admin/users - Create new user
router.post(
  '/users',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  validate(createUserSchema),
  activityLogger('CREATE', 'USER'),
  adminController.createUser
);

// PUT /api/v1/admin/users/:id - Update user
router.put(
  '/users/:id',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  validateParams(userIdParamSchema),
  validate(updateUserSchema),
  activityLogger('UPDATE', 'USER'),
  adminController.updateUser
);

// DELETE /api/v1/admin/users/:id - Soft delete user
router.delete(
  '/users/:id',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  validateParams(userIdParamSchema),
  activityLogger('DELETE', 'USER'),
  adminController.deleteUser
);

// POST /api/v1/admin/users/:id/role - Assign or change user role
router.post(
  '/users/:id/role',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  validateParams(userIdParamSchema),
  validate(assignRoleSchema),
  activityLogger('UPDATE', 'USER_ROLE'),
  adminController.assignRole
);

// Activity and Audit Log Routes

// GET /api/v1/admin/activity-logs - Get user activity logs
router.get(
  '/activity-logs',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  paginate,
  validateQuery(activityLogsQuerySchema),
  activityLogger('READ', 'ACTIVITY_LOG'),
  adminController.getActivityLogs
);

// GET /api/v1/admin/audit-logs - Get system audit logs
router.get(
  '/audit-logs',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  paginate,
  validateQuery(auditLogsQuerySchema),
  activityLogger('READ', 'AUDIT_LOG'),
  adminController.getAuditLogs
);

// System Configuration Routes

// GET /api/v1/admin/system-settings - Get system settings
router.get(
  '/system-settings',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  activityLogger('READ', 'SYSTEM_SETTINGS'),
  adminController.getSystemSettings
);

// PUT /api/v1/admin/system-settings - Update system settings
router.put(
  '/system-settings',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  validate(updateSystemSettingsSchema),
  activityLogger('UPDATE', 'SYSTEM_SETTINGS'),
  adminController.updateSystemSettings
);

// System Health Route

// GET /api/v1/admin/system-health - Get system health metrics
router.get(
  '/system-health',
  authenticate,
  roleAuthorization([ROLES.ADMIN]),
  activityLogger('READ', 'SYSTEM_HEALTH'),
  adminController.getSystemHealth
);

module.exports = router;
