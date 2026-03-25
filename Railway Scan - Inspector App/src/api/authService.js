import apiClient from './client'

const authService = {
  async login(email, password) {
    return apiClient.post('/auth/login', { email, password })
  },
  async googleLogin(credential, role) {
    return apiClient.post('/auth/google', { credential, role })
  },
}

export default authService
