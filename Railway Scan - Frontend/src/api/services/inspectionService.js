import apiClient from '../client'

/**
 * Inspection Service
 * Handles all inspection-related API calls
 */

export const inspectionService = {
  /**
   * Get list of inspections for the current inspector
   * @param {Object} params - Query parameters (status, page, limit, etc.)
   * @returns {Promise<Object>} Inspections list with pagination
   */
  getMyInspections: async (params = {}) => {
    const response = await apiClient.get('/inspector/inspections', { params })
    return response.data
  },

  /**
   * Get inspection by ID
   * @param {string} id - Inspection ID
   * @returns {Promise<Object>} Inspection details
   */
  getInspectionById: async id => {
    const response = await apiClient.get(`/inspector/inspections/${id}`)
    return response.data
  },

  /**
   * Create new inspection
   * @param {Object} data - Inspection data
   * @returns {Promise<Object>} Created inspection
   */
  createInspection: async data => {
    const response = await apiClient.post('/inspector/inspections', data)
    return response.data
  },

  /**
   * Update inspection
   * @param {string} id - Inspection ID
   * @param {Object} data - Updated inspection data
   * @returns {Promise<Object>} Updated inspection
   */
  updateInspection: async (id, data) => {
    const response = await apiClient.put(`/inspector/inspections/${id}`, data)
    return response.data
  },

  /**
   * Delete inspection
   * @param {string} id - Inspection ID
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteInspection: async id => {
    const response = await apiClient.delete(`/inspector/inspections/${id}`)
    return response.data
  },

  /**
   * Submit inspection results
   * @param {string} id - Inspection ID
   * @param {Object} data - Inspection results
   * @returns {Promise<Object>} Updated inspection
   */
  submitInspection: async (id, data) => {
    const response = await apiClient.put(`/inspector/inspections/${id}`, data)
    return response.data
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  getDashboardStats: async () => {
    const response = await apiClient.get('/inspector/dashboard/stats')
    return response.data
  },

  /**
   * Scan QR code
   * @param {Object} data - QR code data
   * @returns {Promise<Object>} Asset information
   */
  scanQR: async data => {
    const response = await apiClient.post('/inspector/scan-qr', data)
    return response.data
  },

  /**
   * Get assigned tasks
   * @returns {Promise<Array>} List of tasks
   */
  getTasks: async () => {
    const response = await apiClient.get('/inspector/tasks')
    return response.data
  },
}

export default inspectionService
