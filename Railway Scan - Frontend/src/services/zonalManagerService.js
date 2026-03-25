import apiClient from '../api/client'

/**
 * Zonal Manager Service
 * API service for Zonal Manager-specific endpoints
 */
const zonalManagerService = {
  /**
   * Get zone-wide inspection trends
   */
  getInspectionTrends: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/analytics/inspection-trends', { params })
    return response
  },

  /**
   * Get defect rate trends
   */
  getDefectRateTrends: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/analytics/defect-trends', { params })
    return response
  },

  /**
   * Get depot performance comparison
   */
  getDepotPerformance: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/depots/performance', { params })
    return response
  },

  /**
   * Get depot rankings
   */
  getDepotRankings: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/depots/rankings', { params })
    return response
  },

  /**
   * Get vendor list with performance metrics
   */
  getVendors: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/vendors', { params })
    return response
  },

  /**
   * Get vendor performance metrics
   */
  getVendorPerformance: async (vendorId, params = {}) => {
    const response = await apiClient.get(`/zonal-manager/vendors/${vendorId}/performance`, {
      params,
    })
    return response
  },

  /**
   * Rate vendor
   * @param {string} vendorId - ID of the vendor to rate
   * @param {Object} data - Rating data
   * @param {number} data.rating - Rating value (1-5)
   * @param {string} [data.comments] - Rating comments
   * @returns {Promise<Object>} Response containing updated vendor rating
   * @endpoint POST /zonal-manager/vendors/:id/rate
   */
  rateVendor: async (vendorId, data) => {
    const response = await apiClient.post(`/zonal-manager/vendors/${vendorId}/rate`, data)
    return response
  },

  /**
   * Get critical alerts
   */
  getCriticalAlerts: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/alerts', { params })
    return response
  },

  /**
   * Escalate alert
   */
  escalateAlert: async (alertId, data) => {
    const response = await apiClient.post(`/zonal-manager/alerts/${alertId}/escalate`, data)
    return response
  },

  /**
   * Resolve alert
   */
  resolveAlert: async (alertId, data) => {
    const response = await apiClient.post(`/zonal-manager/alerts/${alertId}/resolve`, data)
    return response
  },

  /**
   * Generate trend analysis report
   * @param {Object} data - Report parameters
   * @param {string} data.startDate - Report start date (ISO format)
   * @param {string} data.endDate - Report end date (ISO format)
   * @param {string[]} [data.metrics] - Metrics to include in report
   * @returns {Promise<Object>} Response containing generated report
   * @endpoint POST /zonal-manager/reports/trend-analysis
   */
  generateTrendReport: async data => {
    const response = await apiClient.post('/zonal-manager/reports/trend-analysis', data)
    return response
  },

  /**
   * Export report data
   */
  exportReportData: async (reportId, format = 'pdf') => {
    const response = await apiClient.get(`/zonal-manager/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response
  },

  /**
   * Get resource utilization metrics
   */
  getResourceUtilization: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/analytics/resource-utilization', {
      params,
    })
    return response
  },

  /**
   * Get zone-wide statistics
   */
  getZoneStats: async (params = {}) => {
    const response = await apiClient.get('/zonal-manager/stats/zone-overview', { params })
    return response
  },
}

export default zonalManagerService
