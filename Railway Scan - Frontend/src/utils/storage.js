/**
 * Storage utility for managing tokens and user data
 */

const TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

/**
 * Save authentication token
 */
export const saveToken = token => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Error saving token:', error)
  }
}

/**
 * Get authentication token
 */
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

/**
 * Remove authentication token
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error removing token:', error)
  }
}

/**
 * Save refresh token
 */
export const saveRefreshToken = token => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } catch (error) {
    console.error('Error saving refresh token:', error)
  }
}

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null
  }
}

/**
 * Remove refresh token
 */
export const removeRefreshToken = () => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Error removing refresh token:', error)
  }
}

/**
 * Save user data
 */
export const saveUser = user => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

/**
 * Get user data
 */
export const getUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Remove user data
 */
export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Error removing user:', error)
  }
}

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
  removeToken()
  removeRefreshToken()
  removeUser()
}

/**
 * Check if token is expired (basic check)
 */
export const isTokenExpired = token => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expiry
  } catch (error) {
    return true
  }
}
