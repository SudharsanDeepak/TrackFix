import apiClient from './client'

const inspectionService = {
  async getAll(params = {}) {
    return apiClient.get('/inspector/inspections', { params })
  },
  async getById(id) {
    return apiClient.get(`/inspector/inspections/${id}`)
  },
  async create(data) {
    return apiClient.post('/inspector/inspections', data)
  },
  async update(id, data) {
    return apiClient.put(`/inspector/inspections/${id}`, data)
  },
  async delete(id) {
    return apiClient.delete(`/inspector/inspections/${id}`)
  },
}

export default inspectionService
