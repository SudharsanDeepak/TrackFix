import apiClient from '../api/client'

export const authService = {
  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: object, token: string, refreshToken: string}>}
   */
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<{user: object, token: string, refreshToken: string}>}
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  /**
   * Login with Google OAuth
   * @param {string} credential - Google OAuth credential/token
   * @param {string} role - User role (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER, ADMIN)
   * @returns {Promise<{user: object, token: string, refreshToken: string}>}
   */
  async googleLogin(credential, role) {
    const response = await apiClient.post('/auth/google', {
      credential,
      role,
    })
    return response.data
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   * @returns {Promise<{token: string, refreshToken: string}>}
   */
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  /**
   * Get current user profile
   * @returns {Promise<{user: object}>}
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}

export default authService
