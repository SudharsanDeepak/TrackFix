import apiClient from '../api/client'

const inspectionService = {
  createInspection: async data => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach(file => formData.append('images', file))
      } else {
        formData.append(key, JSON.stringify(data[key]))
      }
    })

    const response = await apiClient.post('/inspections', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getInspectionHistory: async (fittingId, params) => {
    const response = await apiClient.get(`/inspections/fitting/${fittingId}`, { params })
    return response.data
  },

  getInspectionDetails: async id => {
    const response = await apiClient.get(`/inspections/${id}`)
    return response.data
  },

  uploadImages: async files => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))

    const response = await apiClient.post('/inspections/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export default inspectionService
