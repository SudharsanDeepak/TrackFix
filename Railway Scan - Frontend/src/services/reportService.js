import apiClient from '../api/client'

const reportService = {
  getVendorRanking: async dateRange => {
    const response = await apiClient.get('/reports/vendor-ranking', {
      params: dateRange,
    })
    return response.data
  },

  getZoneFailureAnalysis: async dateRange => {
    const response = await apiClient.get('/reports/zone-failures', {
      params: dateRange,
    })
    return response.data
  },

  getWarrantyExpiry: async () => {
    const response = await apiClient.get('/reports/warranty-expiry')
    return response.data
  },

  getRecallDetection: async () => {
    const response = await apiClient.get('/reports/recall-detection')
    return response.data
  },

  exportCSV: async (reportType, data) => {
    const response = await apiClient.post(
      `/reports/export/csv`,
      {
        reportType,
        data,
      },
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  exportPDF: async (reportType, data) => {
    const response = await apiClient.post(
      `/reports/export/pdf`,
      {
        reportType,
        data,
      },
      {
        responseType: 'blob',
      }
    )
    return response.data
  },
}

export default reportService
