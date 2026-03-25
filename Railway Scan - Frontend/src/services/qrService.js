import apiClient from '../api/client'

const qrService = {
  /**
   * Generate batch of QR codes
   * @param {Object} data - { quantity, zone }
   * @returns {Promise<Object>} Generated batch info
   */
  generateBatch: async data => {
    const response = await apiClient.post('/qr/generate', data)
    return response.data
  },

  /**
   * Search fittings with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Paginated fittings list
   */
  searchFittings: async filters => {
    const response = await apiClient.get('/qr/search', { params: filters })
    return response.data
  },

  /**
   * Get fitting details by ID
   * @param {string} id - Fitting ID
   * @returns {Promise<Object>} Fitting details
   */
  getFittingDetails: async id => {
    const response = await apiClient.get(`/qr/${id}`)
    return response.data
  },

  /**
   * Update fitting information
   * @param {string} id - Fitting ID
   * @param {Object} data - Updated fitting data
   * @returns {Promise<Object>} Updated fitting
   */
  updateFitting: async (id, data) => {
    const response = await apiClient.put(`/qr/${id}`, data)
    return response.data
  },

  /**
   * Recall lot by lot number
   * @param {Object} data - { lotNumber, reason }
   * @returns {Promise<Object>} Recall result
   */
  recallLot: async data => {
    const response = await apiClient.post('/qr/recall', data)
    return response.data
  },

  /**
   * Get recall history
   * @returns {Promise<Array>} List of recalls
   */
  getRecallHistory: async () => {
    const response = await apiClient.get('/qr/recalls')
    return response.data
  },
}

export default qrService
