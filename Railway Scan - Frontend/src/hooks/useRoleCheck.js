import { useAuthStore } from '../store/authStore'

/**
 * Hook for conditional rendering based on role
 * @param {string|string[]} allowedRoles - Role or array of roles
 * @returns {boolean} Whether current user has allowed role
 *
 * @example
 * const hasAccess = useRoleCheck('ADMIN')
 * const hasAccess = useRoleCheck(['ADMIN', 'DEPOT_OFFICER'])
 */
export const useRoleCheck = allowedRoles => {
  const userRole = useAuthStore(state => state.user?.role)

  if (!userRole) return false

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole)
  }

  return userRole === allowedRoles
}
