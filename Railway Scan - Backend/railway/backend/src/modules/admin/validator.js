const Joi = require('joi');
const { ROLES } = require('../../shared/constants');

/**
 * Validation schemas for Admin endpoints
 */

// User Management Schemas
const createUserSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid(...Object.values(ROLES)).required(),
  depotId: Joi.string().trim().when('role', {
    is: Joi.string().valid('INSPECTOR', 'DEPOT_OFFICER'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  zoneId: Joi.string().trim().when('role', {
    is: 'ZONAL_MANAGER',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  phone: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().trim().optional(),
  department: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional(),
  permissions: Joi.array().items(Joi.string()).optional(),
  depotId: Joi.string().trim().optional(),
  zoneId: Joi.string().trim().optional(),
});

const assignRoleSchema = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)).required(),
  depotId: Joi.string().trim().when('role', {
    is: Joi.string().valid('INSPECTOR', 'DEPOT_OFFICER'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  zoneId: Joi.string().trim().when('role', {
    is: 'ZONAL_MANAGER',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const listUsersQuerySchema = Joi.object({
  role: Joi.string().valid(...Object.values(ROLES)).optional(),
  depotId: Joi.string().trim().optional(),
  zoneId: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// Activity Log Schemas
const activityLogsQuerySchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  action: Joi.string().valid('LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'APPROVE', 'REJECT').optional(),
  resource: Joi.string().trim().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// Audit Log Schemas
const auditLogsQuerySchema = Joi.object({
  performedBy: Joi.string().hex().length(24).optional(),
  category: Joi.string().valid('USER_MANAGEMENT', 'ROLE_ASSIGNMENT', 'SYSTEM_CONFIG', 'SECURITY', 'DATA_EXPORT').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// System Settings Schema
const updateSystemSettingsSchema = Joi.object({
  category: Joi.string().valid('SECURITY', 'NOTIFICATIONS', 'THRESHOLDS', 'INTEGRATIONS').required(),
  settings: Joi.object().required(),
});

// Param Schemas
const userIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  listUsersQuerySchema,
  activityLogsQuerySchema,
  auditLogsQuerySchema,
  updateSystemSettingsSchema,
  userIdParamSchema,
};
