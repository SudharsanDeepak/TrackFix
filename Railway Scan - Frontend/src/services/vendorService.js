import apiClient from '../api/client'

const vendorService = {
  getVendors: async params => {
    const response = await apiClient.get('/vendors', { params })
    return response.data
  },

  createVendor: async data => {
    const response = await apiClient.post('/vendors', data)
    return response.data
  },

  updateVendor: async (id, data) => {
    const response = await apiClient.put(`/vendors/${id}`, data)
    return response.data
  },

  getVendorPerformance: async id => {
    const response = await apiClient.get(`/vendors/${id}/performance`)
    return response.data
  },

  blacklistVendor: async (id, reason) => {
    const response = await apiClient.post(`/vendors/${id}/blacklist`, { reason })
    return response.data
  },

  unblacklistVendor: async id => {
    const response = await apiClient.post(`/vendors/${id}/unblacklist`)
    return response.data
  },
}

export default vendorService
