import apiClient from '../api/client'

const predictionService = {
  runPrediction: async fittingId => {
    const response = await apiClient.post('/predictions/run', { fittingId })
    return response.data
  },

  getPredictionHistory: async fittingId => {
    const response = await apiClient.get(`/predictions/fitting/${fittingId}`)
    return response.data
  },

  getHighRiskFittings: async (threshold = 70) => {
    const response = await apiClient.get('/predictions/high-risk', {
      params: { threshold },
    })
    return response.data
  },
}

export default predictionService
