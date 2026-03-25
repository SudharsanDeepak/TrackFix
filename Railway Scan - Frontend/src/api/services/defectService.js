import apiClient from '../client'

/**
 * Defect Service
 * Handles all defect-related API calls
 */

export const defectService = {
  /**
   * Get list of defects reported by the current inspector
   * @param {Object} params - Query parameters (severity, status, page, limit, etc.)
   * @returns {Promise<Object>} Defects list with pagination
   */
  getMyDefects: async (params = {}) => {
    const response = await apiClient.get('/inspector/defects', { params })
    return response.data
  },

  /**
   * Get defect by ID
   * @param {string} id - Defect ID
   * @returns {Promise<Object>} Defect details
   */
  getDefectById: async id => {
    const response = await apiClient.get(`/inspector/defects/${id}`)
    return response.data
  },

  /**
   * Create new defect report
   * @param {FormData} formData - Defect data with images
   * @returns {Promise<Object>} Created defect
   */
  createDefect: async formData => {
    const response = await apiClient.post('/inspector/defects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Update defect report
   * @param {string} id - Defect ID
   * @param {Object} data - Updated defect data
   * @returns {Promise<Object>} Updated defect
   */
  updateDefect: async (id, data) => {
    const response = await apiClient.put(`/inspector/defects/${id}`, data)
    return response.data
  },

  /**
   * Delete defect report
   * @param {string} id - Defect ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteDefect: async id => {
    const response = await apiClient.delete(`/inspector/defects/${id}`)
    return response.data
  },
}

export default defectService
