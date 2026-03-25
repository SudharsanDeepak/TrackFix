import apiClient from '../api/client'

/**
 * Inspector Service
 * API service for Inspector-specific endpoints
 */
const inspectorService = {
  /**
   * Get inspector's assigned inspections
   * @param {Object} params - Query parameters for filtering inspections
   * @param {string} [params.status] - Filter by inspection status
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of items per page
   * @returns {Promise<Object>} Response containing inspections array and pagination info
   * @endpoint GET /inspector/inspections
   */
  getMyInspections: async (params = {}) => {
    const response = await apiClient.get('/inspector/inspections', { params })
    return response
  },

  /**
   * Get inspector's assigned tasks
   */
  getAssignedTasks: async (params = {}) => {
    const response = await apiClient.get('/inspector/tasks', { params })
    return response
  },

  /**
   * Start a new inspection
   * @param {Object} data - Inspection data
   * @param {string} data.assetId - ID of the asset to inspect
   * @param {string} data.location - Location of the inspection
   * @param {string} [data.notes] - Optional notes
   * @returns {Promise<Object>} Response containing created inspection
   * @endpoint POST /inspector/inspections
   */
  startInspection: async data => {
    const response = await apiClient.post('/inspector/inspections', data)
    return response
  },

  /**
   * Submit inspection with images
   * @param {string} inspectionId - ID of the inspection to submit
   * @param {Object} data - Inspection submission data
   * @param {File[]} [data.images] - Array of image files
   * @param {string} data.status - Inspection status
   * @param {Object} [data.findings] - Inspection findings
   * @returns {Promise<Object>} Response containing updated inspection
   * @endpoint PUT /inspector/inspections/:id
   */
  submitInspection: async (inspectionId, data) => {
    const formData = new FormData()

    Object.keys(data).forEach(key => {
      if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach(file => formData.append('images', file))
      } else {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key])
      }
    })

    const response = await apiClient.put(`/inspector/inspections/${inspectionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  },

  /**
   * Submit defect report with photo
   * @param {Object} data - Defect report data
   * @param {string} data.assetId - ID of the asset with defect
   * @param {string} data.description - Defect description
   * @param {string} data.severity - Defect severity level
   * @param {File[]} [data.photos] - Array of photo files
   * @returns {Promise<Object>} Response containing created defect report
   * @endpoint POST /inspector/defects
   */
  submitDefectReport: async data => {
    const formData = new FormData()

    Object.keys(data).forEach(key => {
      if (key === 'photos' && Array.isArray(data[key])) {
        data[key].forEach(file => formData.append('photos', file))
      } else {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key])
      }
    })

    const response = await apiClient.post('/inspector/defects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  },

  /**
   * Get inspector's defect reports
   */
  getMyDefectReports: async (params = {}) => {
    const response = await apiClient.get('/inspector/defects', { params })
    return response
  },

  /**
   * Get inspection history for inspector
   */
  getInspectionHistory: async (params = {}) => {
    const response = await apiClient.get('/inspector/inspections/history', { params })
    return response
  },

  /**
   * Scan QR code and get asset information
   * @param {string} qrCode - QR code string to scan
   * @returns {Promise<Object>} Response containing asset information
   * @endpoint POST /inspector/scan-qr
   */
  scanQRCode: async qrCode => {
    const response = await apiClient.post('/inspector/scan-qr', { qrCode })
    return response
  },

  /**
   * Get daily statistics for inspector
   */
  getDailyStats: async () => {
    const response = await apiClient.get('/inspector/stats/daily')
    return response
  },

  /**
   * Sync offline data
   */
  syncOfflineData: async data => {
    const response = await apiClient.post('/inspector/sync', data)
    return response
  },
}

export default inspectorService
