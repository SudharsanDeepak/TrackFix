const { NotFoundError, ValidationError, ConflictError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const User = require('../auth/model');
const ActivityLog = require('../../models/ActivityLog.model');
const AuditLog = require('../../models/AuditLog.model');
const SystemSettings = require('../../models/SystemSettings.model');
const CacheService = require('../../services/cacheService');
const mongoose = require('mongoose');
const { getRedisClient } = require('../../config/redis');
const { eventBus, EVENTS } = require('../../utils/eventBus');

/**
 * Admin Service
 * Business logic for Administrator role operations
 */

class AdminService {
  /**
   * Get all users with filtering and pagination
   * @param {Object} filters - Query filters
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Users and total count
   */
  async getUsers(filters, pagination) {
    logger.info('Getting users', { filters, pagination });
    
    // Build query based on filters
    const query = {};
    
    // Filter by role
    if (filters.role) {
      query.role = filters.role;
    }
    
    // Filter by depotId
    if (filters.depotId) {
      query.depotId = filters.depotId;
    }
    
    // Filter by zoneId
    if (filters.zoneId) {
      query.zoneId = filters.zoneId;
    }
    
    // Filter by isActive
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    
    // Search by name or email
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    // Execute query with pagination
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);
    
    return {
      users,
      total,
    };
  }

  /**
   * Create a new user
   * @param {Object} data - User data
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Created user
   */
  async createUser(data, adminId) {
    logger.info('Creating user', { data, adminId });
    
    // Validate email uniqueness
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Validate role-specific fields
    if (['INSPECTOR', 'DEPOT_OFFICER'].includes(data.role) && !data.depotId) {
      throw new ValidationError('depotId is required for INSPECTOR and DEPOT_OFFICER roles');
    }
    
    if (data.role === 'ZONAL_MANAGER' && !data.zoneId) {
      throw new ValidationError('zoneId is required for ZONAL_MANAGER role');
    }
    
    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      depotId: data.depotId,
      zoneId: data.zoneId,
      phone: data.phone,
      department: data.department,
      permissions: data.permissions || [],
      isActive: true,
    });
    
    // Create audit log entry
    await AuditLog.create({
      action: 'USER_CREATED',
      userId: adminId,
      resourceId: user._id,
      resourceType: 'USER',
      details: {
        category: 'USER_MANAGEMENT',
        description: `User ${user.email} created with role ${user.role}`,
        after: {
          name: user.name,
          email: user.email,
          role: user.role,
          depotId: user.depotId,
          zoneId: user.zoneId,
        },
      },
    });
    
    // Emit user creation event
    eventBus.emitToRoles(EVENTS.USER_CREATED, {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      depotId: user.depotId,
      zoneId: user.zoneId,
      createdBy: adminId,
      timestamp: new Date(),
    }, ['ADMIN']);
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} data - Update data
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, data, adminId) {
    logger.info('Updating user', { userId, data, adminId });
    
    // Find user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Store before state for audit log
    const beforeState = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      permissions: user.permissions,
      depotId: user.depotId,
      zoneId: user.zoneId,
    };
    
    // Check email uniqueness if email is being updated
    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
      user.email = data.email;
    }
    
    // Update fields
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.department !== undefined) user.department = data.department;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    if (data.permissions !== undefined) user.permissions = data.permissions;
    if (data.depotId !== undefined) user.depotId = data.depotId;
    if (data.zoneId !== undefined) user.zoneId = data.zoneId;
    
    await user.save();
    
    // Store after state
    const afterState = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      permissions: user.permissions,
      depotId: user.depotId,
      zoneId: user.zoneId,
    };
    
    // Create audit log entry with before/after states
    await AuditLog.create({
      action: 'USER_UPDATED',
      userId: adminId,
      resourceId: user._id,
      resourceType: 'USER',
      details: {
        category: 'USER_MANAGEMENT',
        description: `User ${user.email} information updated`,
        before: beforeState,
        after: afterState,
      },
    });
    
    // Emit user update event for real-time synchronization
    eventBus.emitToRoles(EVENTS.USER_UPDATED, {
      userId: user._id,
      name: user.name,
      email: user.email,
      changes: Object.keys(data).filter(key => data[key] !== beforeState[key]),
      updatedAt: new Date(),
      updatedBy: adminId,
    }, ['ADMIN']);
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }

  /**
   * Soft delete a user
   * @param {string} userId - User ID
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Deleted user
   */
  async deleteUser(userId, adminId) {
    logger.info('Deleting user', { userId, adminId });
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Store before state
    const beforeState = {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isDeleted: false,
    };
    
    // Perform soft delete
    await user.softDelete();
    
    // Create audit log entry
    await AuditLog.create({
      action: 'USER_DELETED',
      userId: adminId,
      resourceId: user._id,
      resourceType: 'USER',
      details: {
        category: 'USER_MANAGEMENT',
        description: `User ${user.email} soft deleted`,
        before: beforeState,
        after: {
          isDeleted: true,
          isActive: false,
          deletedAt: user.deletedAt,
        },
      },
    });
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }

  /**
   * Assign or change user role
   * @param {string} userId - User ID
   * @param {Object} data - Role assignment data
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Updated user
   */
  async assignRole(userId, data, adminId) {
    logger.info('Assigning role', { userId, data, adminId });
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Validate role-specific fields
    if (['INSPECTOR', 'DEPOT_OFFICER'].includes(data.role) && !data.depotId) {
      throw new ValidationError('depotId is required for INSPECTOR and DEPOT_OFFICER roles');
    }
    
    if (data.role === 'ZONAL_MANAGER' && !data.zoneId) {
      throw new ValidationError('zoneId is required for ZONAL_MANAGER role');
    }
    
    // Store before state
    const beforeState = {
      role: user.role,
      depotId: user.depotId,
      zoneId: user.zoneId,
    };
    
    // Update role and related fields
    user.role = data.role;
    
    // Clear or set depotId based on role
    if (['INSPECTOR', 'DEPOT_OFFICER'].includes(data.role)) {
      user.depotId = data.depotId;
      user.zoneId = undefined;
    } else if (data.role === 'ZONAL_MANAGER') {
      user.zoneId = data.zoneId;
      user.depotId = undefined;
    } else {
      // For ADMIN and VENDOR roles, clear both
      user.depotId = undefined;
      user.zoneId = undefined;
    }
    
    await user.save();
    
    // Store after state
    const afterState = {
      role: user.role,
      depotId: user.depotId,
      zoneId: user.zoneId,
    };
    
    // Create audit log entry with before/after states
    await AuditLog.create({
      action: 'ROLE_ASSIGNED',
      userId: adminId,
      resourceId: user._id,
      resourceType: 'USER',
      details: {
        category: 'ROLE_ASSIGNMENT',
        description: `User ${user.email} role changed from ${beforeState.role} to ${afterState.role}`,
        before: beforeState,
        after: afterState,
      },
    });
    
    // Invalidate all user's cached data when role changes
    await CacheService.invalidateUserCache(userId);
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }

  /**
   * Get activity logs with filtering
   * @param {Object} filters - Query filters
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Activity logs and total count
   */
  async getActivityLogs(filters, pagination) {
    logger.info('Getting activity logs', { filters, pagination });
    
    // Generate cache key based on filters and pagination
    const cacheKey = `activity-logs:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    
    // Check cache
    const redis = getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info('Returning cached activity logs');
        return JSON.parse(cached);
      }
    }
    
    // Build query based on filters
    const query = {};
    
    // Filter by userId
    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    // Filter by action
    if (filters.action) {
      query.action = filters.action;
    }
    
    // Filter by resource
    if (filters.resource) {
      query.resource = filters.resource;
    }
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }
    
    // Execute query with pagination
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('userId', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);
    
    const result = {
      logs,
      total,
    };
    
    // Cache the result for 2 minutes (120 seconds)
    if (redis) {
      await redis.setex(cacheKey, 120, JSON.stringify(result));
    }
    
    return result;
  }

  /**
   * Get audit logs with filtering
   * @param {Object} filters - Query filters
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Audit logs and total count
   */
  async getAuditLogs(filters, pagination) {
    logger.info('Getting audit logs', { filters, pagination });
    
    // Generate cache key based on filters and pagination
    const cacheKey = `audit-logs:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    
    // Check cache
    const redis = getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.info('Returning cached audit logs');
        return JSON.parse(cached);
      }
    }
    
    // Build query based on filters
    const query = {};
    
    // Filter by performedBy
    if (filters.performedBy) {
      query.performedBy = filters.performedBy;
    }
    
    // Filter by category
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }
    
    // Execute query with pagination
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate({ path: 'performedBy', select: 'name email role', strictPopulate: false })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);
    
    const result = {
      logs,
      total,
    };
    
    // Cache the result for 2 minutes (120 seconds)
    if (redis) {
      await redis.setex(cacheKey, 120, JSON.stringify(result));
    }
    
    return result;
  }

  /**
   * Get current system settings
   * @returns {Promise<Object>} System settings
   */
  async getSystemSettings() {
    logger.info('Getting system settings');
    
    // Retrieve all system settings grouped by category
    const settings = await SystemSettings.find({}).lean();
    
    // Format settings by category
    const formattedSettings = {
      SECURITY: {},
      NOTIFICATIONS: {},
      THRESHOLDS: {},
      INTEGRATIONS: {},
    };
    
    settings.forEach(setting => {
      formattedSettings[setting.category] = setting.settings;
    });
    
    return formattedSettings;
  }

  /**
   * Update system settings
   * @param {Object} data - Settings data
   * @param {string} adminId - Admin user ID
   * @returns {Promise<Object>} Updated settings
   */
  async updateSystemSettings(data, adminId) {
    logger.info('Updating system settings', { data, adminId });
    
    const { category, settings } = data;
    
    // Validate configuration values based on category
    this._validateSettingsByCategory(category, settings);
    
    // Find existing settings for this category
    const existingSettings = await SystemSettings.findOne({ category });
    
    // Store before state
    const beforeState = existingSettings ? existingSettings.settings : {};
    
    // Update or create settings
    const updatedSettings = await SystemSettings.findOneAndUpdate(
      { category },
      {
        category,
        settings,
        updatedBy: adminId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
    
    // Create audit log entry with before/after states
    await AuditLog.create({
      action: 'SYSTEM_SETTINGS_UPDATED',
      userId: adminId,
      resourceId: updatedSettings._id,
      resourceType: 'SYSTEM_SETTINGS',
      details: {
        category: 'SYSTEM_CONFIG',
        description: `System settings updated for category ${category}`,
        before: beforeState,
        after: settings,
      },
    });
    
    // Emit system event for critical setting changes
    const { eventBus, EVENTS } = require('../../utils/eventBus');
    eventBus.emitEvent(EVENTS.SYSTEM_SETTINGS_CHANGED, {
      category,
      before: beforeState,
      after: settings,
      updatedBy: adminId,
      timestamp: new Date(),
    });
    
    logger.info('System settings updated successfully', { category });
    
    return updatedSettings;
  }

  /**
   * Validate settings based on category
   * @param {string} category - Settings category
   * @param {Object} settings - Settings object
   * @private
   */
  _validateSettingsByCategory(category, settings) {
    switch (category) {
      case 'SECURITY':
        this._validateSecuritySettings(settings);
        break;
      case 'NOTIFICATIONS':
        this._validateNotificationSettings(settings);
        break;
      case 'THRESHOLDS':
        this._validateThresholdSettings(settings);
        break;
      case 'INTEGRATIONS':
        this._validateIntegrationSettings(settings);
        break;
      default:
        throw new Error(`Invalid category: ${category}`);
    }
  }

  /**
   * Validate security settings
   * @param {Object} settings - Security settings
   * @private
   */
  _validateSecuritySettings(settings) {
    if (settings.passwordMinLength !== undefined) {
      if (typeof settings.passwordMinLength !== 'number' || settings.passwordMinLength < 8 || settings.passwordMinLength > 128) {
        throw new Error('passwordMinLength must be a number between 8 and 128');
      }
    }
    
    if (settings.sessionTimeout !== undefined) {
      if (typeof settings.sessionTimeout !== 'number' || settings.sessionTimeout < 300 || settings.sessionTimeout > 86400) {
        throw new Error('sessionTimeout must be a number between 300 (5 min) and 86400 (24 hours) seconds');
      }
    }
    
    if (settings.maxLoginAttempts !== undefined) {
      if (typeof settings.maxLoginAttempts !== 'number' || settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 10) {
        throw new Error('maxLoginAttempts must be a number between 3 and 10');
      }
    }
    
    if (settings.requireMFA !== undefined && typeof settings.requireMFA !== 'boolean') {
      throw new Error('requireMFA must be a boolean');
    }
  }

  /**
   * Validate notification settings
   * @param {Object} settings - Notification settings
   * @private
   */
  _validateNotificationSettings(settings) {
    if (settings.emailEnabled !== undefined && typeof settings.emailEnabled !== 'boolean') {
      throw new Error('emailEnabled must be a boolean');
    }
    
    if (settings.smsEnabled !== undefined && typeof settings.smsEnabled !== 'boolean') {
      throw new Error('smsEnabled must be a boolean');
    }
    
    if (settings.alertThreshold !== undefined) {
      const validThresholds = ['INFO', 'WARNING', 'CRITICAL', 'EMERGENCY'];
      if (!validThresholds.includes(settings.alertThreshold)) {
        throw new Error(`alertThreshold must be one of: ${validThresholds.join(', ')}`);
      }
    }
    
    if (settings.emailRecipients !== undefined) {
      if (!Array.isArray(settings.emailRecipients)) {
        throw new Error('emailRecipients must be an array');
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of settings.emailRecipients) {
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid email format: ${email}`);
        }
      }
    }
  }

  /**
   * Validate threshold settings
   * @param {Object} settings - Threshold settings
   * @private
   */
  _validateThresholdSettings(settings) {
    if (settings.inventoryLowThreshold !== undefined) {
      if (typeof settings.inventoryLowThreshold !== 'number' || settings.inventoryLowThreshold < 0) {
        throw new Error('inventoryLowThreshold must be a non-negative number');
      }
    }
    
    if (settings.defectCriticalThreshold !== undefined) {
      if (typeof settings.defectCriticalThreshold !== 'number' || settings.defectCriticalThreshold < 0 || settings.defectCriticalThreshold > 100) {
        throw new Error('defectCriticalThreshold must be a number between 0 and 100');
      }
    }
    
    if (settings.inspectionOverdueHours !== undefined) {
      if (typeof settings.inspectionOverdueHours !== 'number' || settings.inspectionOverdueHours < 1) {
        throw new Error('inspectionOverdueHours must be a positive number');
      }
    }
    
    if (settings.reportRetentionDays !== undefined) {
      if (typeof settings.reportRetentionDays !== 'number' || settings.reportRetentionDays < 1 || settings.reportRetentionDays > 365) {
        throw new Error('reportRetentionDays must be a number between 1 and 365');
      }
    }
  }

  /**
   * Validate integration settings
   * @param {Object} settings - Integration settings
   * @private
   */
  _validateIntegrationSettings(settings) {
    if (settings.apiEnabled !== undefined && typeof settings.apiEnabled !== 'boolean') {
      throw new Error('apiEnabled must be a boolean');
    }
    
    if (settings.webhookUrl !== undefined) {
      if (typeof settings.webhookUrl !== 'string') {
        throw new Error('webhookUrl must be a string');
      }
      // Validate URL format
      try {
        new URL(settings.webhookUrl);
      } catch (error) {
        throw new Error('webhookUrl must be a valid URL');
      }
    }
    
    if (settings.apiRateLimit !== undefined) {
      if (typeof settings.apiRateLimit !== 'number' || settings.apiRateLimit < 10 || settings.apiRateLimit > 10000) {
        throw new Error('apiRateLimit must be a number between 10 and 10000 requests per hour');
      }
    }
    
    if (settings.externalSystemEnabled !== undefined && typeof settings.externalSystemEnabled !== 'boolean') {
      throw new Error('externalSystemEnabled must be a boolean');
    }
  }

  /**
   * Get system health metrics
   * @returns {Promise<Object>} System health status
   */
  async getSystemHealth() {
    logger.info('Getting system health');
    
    const startTime = Date.now();
    const health = {
      status: 'healthy',
      database: { connected: false },
      redis: { connected: false },
      apiResponseTime: { avg: 0, p95: 0, p99: 0 },
      activeUsers: 0,
      errorRate: 0,
      timestamp: new Date(),
    };
    
    try {
      // Check database connection
      const dbState = mongoose.connection.readyState;
      health.database.connected = dbState === 1; // 1 = connected
      health.database.state = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState];
      
      if (!health.database.connected) {
        health.status = 'unhealthy';
      }
      
      // Check Redis connection
      try {
        const redisClient = getRedisClient();
        if (redisClient && redisClient.isOpen) {
          await redisClient.ping();
          health.redis.connected = true;
          health.redis.status = 'connected';
        } else {
          health.redis.connected = false;
          health.redis.status = 'disconnected';
          health.status = 'unhealthy';
        }
      } catch (redisError) {
        health.redis.connected = false;
        health.redis.status = 'error';
        health.redis.error = redisError.message;
        health.status = 'unhealthy';
      }
      
      // Get active user count (users who logged in within last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      health.activeUsers = await User.countDocuments({
        isActive: true,
        lastLogin: { $gte: oneDayAgo },
      });
      
      // Calculate error rate from recent activity logs (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentLogs = await ActivityLog.countDocuments({
        timestamp: { $gte: oneHourAgo },
      });
      
      // For error rate, we would need error logs - for now, set to 0
      // In production, this would query error tracking system
      health.errorRate = 0;
      
      // API response time - calculate from this health check
      const responseTime = Date.now() - startTime;
      health.apiResponseTime = {
        current: responseTime,
        avg: responseTime, // In production, calculate from metrics
        p95: responseTime,
        p99: responseTime,
      };
      
      // Check if health check took too long
      if (responseTime > 2000) {
        health.status = 'degraded';
        health.warning = 'Health check took longer than 2 seconds';
      }
      
      return health;
    } catch (error) {
      logger.error('System health check failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AdminService();
