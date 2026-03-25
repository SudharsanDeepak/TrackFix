import axios from 'axios'
import { config } from '../config'
import { getToken, saveToken, removeToken } from '../utils/storage'
import { useAuthStore } from '../store/authStore'

/**
 * Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Add authentication token and role header
 */
apiClient.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add role header from authStore
    const role = useAuthStore.getState().user?.role
    if (role) {
      config.headers['X-User-Role'] = role
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors and token refresh
 */
apiClient.interceptors.response.use(
  response => {
    // Check for role change in response headers
    const newRole = response.headers['x-new-role']
    if (newRole) {
      const currentRole = useAuthStore.getState().user?.role
      if (currentRole && newRole !== currentRole) {
        handleRoleChange(currentRole, newRole)
      }
    }

    return response.data
  },
  async error => {
    const originalRequest = error.config

    // Handle 403 Forbidden - Role-based access denied
    if (error.response?.status === 403) {
      // Log user out and redirect to login
      const { logout } = useAuthStore.getState()
      logout()
      removeToken()
      localStorage.removeItem('refreshToken')

      // Import toast dynamically to show error message
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('You do not have permission to perform this action. Please log in again.')
      })

      window.location.href = '/login'
      return Promise.reject({
        ...error,
        message: 'You do not have permission to perform this action. Please log in again.',
      })
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Attempt to refresh token
        const response = await axios.post(`${config.apiBaseUrl}/auth/refresh-token`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        // Save new tokens
        saveToken(accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed - session expired, logout user
        const { logout } = useAuthStore.getState()
        logout()
        removeToken()
        localStorage.removeItem('refreshToken')

        // Import toast and error handler dynamically
        import('react-hot-toast').then(({ default: toast }) => {
          import('../utils/roleErrorHandler').then(({ ERROR_TYPES, getRoleErrorMessage }) => {
            const errorDetails = getRoleErrorMessage(ERROR_TYPES.SESSION_EXPIRED)
            toast.error(errorDetails.message)
          })
        })

        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

/**
 * Handle role change detection
 */
const handleRoleChange = (oldRole, newRole) => {
  // Import dynamically to avoid circular dependency
  import('../store/uiStore').then(({ useUIStore }) => {
    import('../store/cacheStore').then(({ useCacheStore }) => {
      import('../utils/roleHelpers').then(({ getRoleBasePath }) => {
        // Update role in auth store
        const { updateRole } = useAuthStore.getState()
        updateRole(newRole)

        // Clear cached data from previous role
        const { invalidateCachePattern } = useCacheStore.getState()
        invalidateCachePattern(oldRole.toLowerCase())

        // Display role change notification
        const { addToast } = useUIStore.getState()
        addToast({
          type: 'info',
          message: `Your role has been updated to ${newRole.replace('_', ' ')}`,
          duration: 5000,
        })

        // Redirect to new role dashboard
        const newBasePath = getRoleBasePath(newRole)
        window.location.href = `${newBasePath}/dashboard`
      })
    })
  })
}

/**
 * Retry logic with exponential backoff
 */
export const retryRequest = async (requestFn, maxAttempts = config.retryAttempts) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error
      }

      // Last attempt - throw error
      if (attempt === maxAttempts) {
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = config.retryDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

export default apiClient
