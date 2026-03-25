const adminService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

/**
 * Admin Controller
 * Handles HTTP requests for Administrator role operations
 */

class AdminController {
  /**
   * GET /api/v1/admin/users
   * List all users with filtering and pagination
   */
  getUsers = asyncHandler(async (req, res) => {
    const { users, total } = await adminService.getUsers(
      req.query,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, users, pagination, 'Users retrieved successfully');
  });

  /**
   * POST /api/v1/admin/users
   * Create a new user
   */
  createUser = asyncHandler(async (req, res) => {
    const user = await adminService.createUser(
      req.body,
      req.user.id
    );
    
    // Store created resource ID for activity logging
    res.locals.createdResourceId = user.id;
    
    ResponseFormatter.created(res, user, 'User created successfully');
  });

  /**
   * PUT /api/v1/admin/users/:id
   * Update user information
   */
  updateUser = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(
      req.params.id,
      req.body,
      req.user.id
    );
    
    ResponseFormatter.success(res, user, 'User updated successfully');
  });

  /**
   * DELETE /api/v1/admin/users/:id
   * Soft delete a user
   */
  deleteUser = asyncHandler(async (req, res) => {
    const user = await adminService.deleteUser(
      req.params.id,
      req.user.id
    );
    
    ResponseFormatter.success(res, user, 'User deleted successfully');
  });

  /**
   * POST /api/v1/admin/users/:id/role
   * Assign or change user role
   */
  assignRole = asyncHandler(async (req, res) => {
    const user = await adminService.assignRole(
      req.params.id,
      req.body,
      req.user.id
    );
    
    ResponseFormatter.success(res, user, 'Role assigned successfully');
  });

  /**
   * GET /api/v1/admin/activity-logs
   * Get user activity logs with filtering
   */
  getActivityLogs = asyncHandler(async (req, res) => {
    const { logs, total } = await adminService.getActivityLogs(
      req.query,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, logs, pagination, 'Activity logs retrieved successfully');
  });

  /**
   * GET /api/v1/admin/audit-logs
   * Get system audit logs with filtering
   */
  getAuditLogs = asyncHandler(async (req, res) => {
    const { logs, total } = await adminService.getAuditLogs(
      req.query,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, logs, pagination, 'Audit logs retrieved successfully');
  });

  /**
   * GET /api/v1/admin/system-settings
   * Get current system settings
   */
  getSystemSettings = asyncHandler(async (req, res) => {
    const settings = await adminService.getSystemSettings();
    
    ResponseFormatter.success(res, settings, 'System settings retrieved successfully');
  });

  /**
   * PUT /api/v1/admin/system-settings
   * Update system settings
   */
  updateSystemSettings = asyncHandler(async (req, res) => {
    const settings = await adminService.updateSystemSettings(
      req.body,
      req.user.id
    );
    
    ResponseFormatter.success(res, settings, 'System settings updated successfully');
  });

  /**
   * GET /api/v1/admin/system-health
   * Get system health metrics
   */
  getSystemHealth = asyncHandler(async (req, res) => {
    const health = await adminService.getSystemHealth();
    
    // Return 503 Service Unavailable if system is unhealthy
    if (health.status === 'unhealthy') {
      return res.status(503).json({
        success: false,
        data: health,
        message: 'System is unhealthy',
      });
    }
    
    ResponseFormatter.success(res, health, 'System health retrieved successfully');
  });
}

module.exports = new AdminController();
