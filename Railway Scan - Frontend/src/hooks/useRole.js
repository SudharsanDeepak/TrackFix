import { useAuthStore } from '../store/authStore'

/**
 * Hook to access current user role and role configuration
 * @returns {Object} Role information and utilities
 * @property {string} role - Current user's role
 * @property {Object} roleConfig - Role configuration object
 * @property {boolean} isInspector - True if user is Inspector
 * @property {boolean} isDepotOfficer - True if user is Depot Officer
 * @property {boolean} isZonalManager - True if user is Zonal Manager
 * @property {boolean} isAdmin - True if user is Administrator
 * @property {string} basePath - Base path for role routes
 * @property {string} displayName - Display name for role
 * @property {Object} colorScheme - Color scheme for role
 * @property {string} layout - Layout type (mobile/desktop)
 * @property {Array} features - Available features for role
 * @property {Function} getRole - Function to get current role
 */
export const useRole = () => {
  const user = useAuthStore(state => state.user)
  const roleConfig = useAuthStore(state => state.roleConfig)
  const getRole = useAuthStore(state => state.getRole)

  return {
    role: user?.role,
    roleConfig,
    isInspector: user?.role === 'INSPECTOR',
    isDepotOfficer: user?.role === 'DEPOT_OFFICER',
    isZonalManager: user?.role === 'ZONAL_MANAGER',
    isAdmin: user?.role === 'ADMIN',
    basePath: roleConfig?.basePath || '/',
    displayName: roleConfig?.displayName || '',
    colorScheme: roleConfig?.colorScheme,
    layout: roleConfig?.layout,
    features: roleConfig?.features || [],
    getRole,
  }
}
