import apiClient from '../api/client'

/**
 * Administrator Service
 * API service for Administrator-specific endpoints
 */
const adminService = {
  /**
   * Get all users
   */
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params })
    return response
  },

  /**
   * Create new user
   * @param {Object} data - User data
   * @param {string} data.name - User's full name
   * @param {string} data.email - User's email address
   * @param {string} data.role - User's role (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER, ADMIN)
   * @param {string} [data.depotId] - Depot ID (for Inspector and Depot Officer)
   * @param {string} [data.zoneId] - Zone ID (for Zonal Manager)
   * @returns {Promise<Object>} Response containing created user
   * @endpoint POST /admin/users
   */
  createUser: async data => {
    const response = await apiClient.post('/admin/users', data)
    return response
  },

  /**
   * Update user
   */
  updateUser: async (userId, data) => {
    const response = await apiClient.put(`/admin/users/${userId}`, data)
    return response
  },

  /**
   * Delete user
   */
  deleteUser: async userId => {
    const response = await apiClient.delete(`/admin/users/${userId}`)
    return response
  },

  /**
   * Assign role to user
   * @param {string} userId - ID of the user
   * @param {Object} data - Role assignment data
   * @param {string} data.role - New role to assign (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER, ADMIN)
   * @returns {Promise<Object>} Response containing updated user
   * @endpoint POST /admin/users/:id/role
   */
  assignRole: async (userId, data) => {
    const response = await apiClient.post(`/admin/users/${userId}/role`, data)
    return response
  },

  /**
   * Get user activity logs
   */
  getUserActivityLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/activity-logs', { params })
    return response
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-logs', { params })
    return response
  },

  /**
   * Get system settings
   */
  getSystemSettings: async () => {
    const response = await apiClient.get('/admin/settings')
    return response
  },

  /**
   * Update system settings
   */
  updateSystemSettings: async data => {
    const response = await apiClient.put('/admin/settings', data)
    return response
  },

  /**
   * Get system health metrics
   */
  getSystemHealth: async () => {
    const response = await apiClient.get('/admin/system/health')
    return response
  },

  /**
   * Get API response time metrics
   */
  getAPIMetrics: async (params = {}) => {
    const response = await apiClient.get('/admin/system/api-metrics', { params })
    return response
  },

  /**
   * Get database storage metrics
   */
  getDatabaseMetrics: async () => {
    const response = await apiClient.get('/admin/system/database-metrics')
    return response
  },

  /**
   * Get security alerts
   */
  getSecurityAlerts: async (params = {}) => {
    const response = await apiClient.get('/admin/security/alerts', { params })
    return response
  },

  /**
   * Get failed login attempts
   */
  getFailedLoginAttempts: async (params = {}) => {
    const response = await apiClient.get('/admin/security/failed-logins', { params })
    return response
  },

  /**
   * Get all inspections (system-wide)
   */
  getAllInspections: async (params = {}) => {
    const response = await apiClient.get('/admin/inspections', { params })
    return response
  },

  /**
   * Get all reports (system-wide)
   */
  getAllReports: async (params = {}) => {
    const response = await apiClient.get('/admin/reports', { params })
    return response
  },

  /**
   * Get system-wide statistics
   */
  getSystemStats: async (params = {}) => {
    const response = await apiClient.get('/admin/stats/system-overview', { params })
    return response
  },

  /**
   * Get user statistics by role
   */
  getUserStatsByRole: async () => {
    const response = await apiClient.get('/admin/stats/users-by-role')
    return response
  },

  /**
   * Backup database
   */
  backupDatabase: async () => {
    const response = await apiClient.post('/admin/system/backup')
    return response
  },

  /**
   * Export audit logs
   */
  exportAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-logs/export', {
      params,
      responseType: 'blob',
    })
    return response
  },
}

export default adminService
