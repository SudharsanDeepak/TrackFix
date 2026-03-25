import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getRoleBasePath } from '../utils/roleHelpers'

/**
 * Hook to redirect user to their role-appropriate dashboard
 * Automatically redirects authenticated users to their role's dashboard
 *
 * @example
 * // In a component
 * useRoleRedirect()
 */
export const useRoleRedirect = () => {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const basePath = getRoleBasePath(user.role)
      navigate(`${basePath}/dashboard`, { replace: true })
    }
  }, [isAuthenticated, user?.role, navigate])
}
