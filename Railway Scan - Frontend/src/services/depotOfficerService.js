import apiClient from '../api/client'

/**
 * Depot Officer Service
 * API service for Depot Officer-specific endpoints
 */
const depotOfficerService = {
  /**
   * Generate QR code batch
   * @param {Object} data - QR batch generation parameters
   * @param {number} data.quantity - Number of QR codes to generate
   * @param {string} data.prefix - Prefix for QR codes
   * @param {string} [data.assetType] - Type of asset for QR codes
   * @returns {Promise<Object>} Response containing generated QR codes
   * @endpoint POST /depot-officer/qr/batch
   */
  generateQRBatch: async data => {
    const response = await apiClient.post('/depot-officer/qr/batch', data)
    return response
  },

  /**
   * Get QR codes for depot
   */
  getQRCodes: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/qr', { params })
    return response
  },

  /**
   * Export QR codes
   */
  exportQRCodes: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/qr/export', {
      params,
      responseType: 'blob',
    })
    return response
  },

  /**
   * Get all depot inspections
   */
  getDepotInspections: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/inspections', { params })
    return response
  },

  /**
   * Get pending inspection approvals
   */
  getPendingApprovals: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/inspections/pending', { params })
    return response
  },

  /**
   * Approve inspection
   * @param {string} inspectionId - ID of the inspection to approve
   * @param {Object} data - Approval data
   * @param {string} [data.comments] - Approval comments
   * @returns {Promise<Object>} Response containing approved inspection
   * @endpoint POST /depot-officer/inspections/:id/approve
   */
  approveInspection: async (inspectionId, data) => {
    const response = await apiClient.post(
      `/depot-officer/inspections/${inspectionId}/approve`,
      data
    )
    return response
  },

  /**
   * Reject inspection
   */
  rejectInspection: async (inspectionId, data) => {
    const response = await apiClient.post(`/depot-officer/inspections/${inspectionId}/reject`, data)
    return response
  },

  /**
   * Get defects for depot
   */
  getDepotDefects: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/defects', { params })
    return response
  },

  /**
   * Assign defect to inspector
   */
  assignDefect: async (defectId, data) => {
    const response = await apiClient.post(`/depot-officer/defects/${defectId}/assign`, data)
    return response
  },

  /**
   * Get inventory status
   */
  getInventoryStatus: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/inventory', { params })
    return response
  },

  /**
   * Update inventory item
   */
  updateInventoryItem: async (itemId, data) => {
    const response = await apiClient.put(`/depot-officer/inventory/${itemId}`, data)
    return response
  },

  /**
   * Generate operational report
   * @param {Object} data - Report generation parameters
   * @param {string} data.startDate - Report start date (ISO format)
   * @param {string} data.endDate - Report end date (ISO format)
   * @param {string} data.reportType - Type of operational report
   * @returns {Promise<Object>} Response containing generated report
   * @endpoint POST /depot-officer/reports/operational
   */
  generateOperationalReport: async data => {
    const response = await apiClient.post('/depot-officer/reports/operational', data)
    return response
  },

  /**
   * Get QR generation statistics
   */
  getQRGenerationStats: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/stats/qr-generation', { params })
    return response
  },

  /**
   * Get inspection completion rates
   */
  getInspectionCompletionRates: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/stats/inspection-completion', { params })
    return response
  },

  /**
   * Get quality control metrics
   */
  getQualityMetrics: async (params = {}) => {
    const response = await apiClient.get('/depot-officer/stats/quality-metrics', { params })
    return response
  },
}

export default depotOfficerService
