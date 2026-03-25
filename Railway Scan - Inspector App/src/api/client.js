import axios from 'axios'
import { config } from '../config'

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  res => res.data,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const res = await axios.post(`${config.apiBaseUrl}/auth/refresh-token`, { refreshToken })
        const { accessToken } = res.data.data
        localStorage.setItem('token', accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
