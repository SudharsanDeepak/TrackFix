/**
 * Role Helper Utilities
 * Provides role configuration and utility functions for role-based access control
 */

const ROLE_CONFIGS = {
  INSPECTOR: {
    role: 'INSPECTOR',
    basePath: '/inspector',
    displayName: 'Inspector',
    colorScheme: {
      primary: 'blue-600',
      secondary: 'blue-100',
      accent: 'blue-500',
    },
    layout: 'mobile',
    features: ['scan-qr', 'inspections', 'defects'],
    defaultRoute: '/inspector/dashboard',
  },
  DEPOT_OFFICER: {
    role: 'DEPOT_OFFICER',
    basePath: '/depot-officer',
    displayName: 'Depot Officer',
    colorScheme: {
      primary: 'green-600',
      secondary: 'green-100',
      accent: 'green-500',
    },
    layout: 'desktop',
    features: ['qr-management', 'inspections', 'defects', 'reports', 'inventory'],
    defaultRoute: '/depot-officer/dashboard',
  },
  ZONAL_MANAGER: {
    role: 'ZONAL_MANAGER',
    basePath: '/zonal-manager',
    displayName: 'Zonal Manager',
    colorScheme: {
      primary: 'purple-600',
      secondary: 'purple-100',
      accent: 'purple-500',
    },
    layout: 'desktop',
    features: ['analytics', 'depots', 'vendors', 'reports', 'alerts'],
    defaultRoute: '/zonal-manager/dashboard',
  },
  ADMIN: {
    role: 'ADMIN',
    basePath: '/admin',
    displayName: 'Administrator',
    colorScheme: {
      primary: 'red-600',
      secondary: 'red-100',
      accent: 'red-500',
    },
    layout: 'desktop',
    features: ['users', 'settings', 'inspections', 'reports', 'audit-logs', 'system-health'],
    defaultRoute: '/admin/dashboard',
  },
}

/**
 * Get role configuration by role name
 * @param {string} role - Role name (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER, ADMIN)
 * @returns {Object|null} Role configuration object or null if role not found
 */
export const getRoleConfig = role => {
  return ROLE_CONFIGS[role] || null
}

/**
 * Get base path for a role
 * @param {string} role - Role name
 * @returns {string} Base path for the role (e.g., '/inspector')
 */
export const getRoleBasePath = role => {
  const config = getRoleConfig(role)
  return config?.basePath || '/'
}

/**
 * Get default route for a role
 * @param {string} role - Role name
 * @returns {string} Default route for the role (e.g., '/inspector/dashboard')
 */
export const getRoleDefaultRoute = role => {
  const config = getRoleConfig(role)
  return config?.defaultRoute || '/'
}

/**
 * Check if a role has access to a feature
 * @param {string} role - Role name
 * @param {string} feature - Feature identifier
 * @returns {boolean} True if role has access to feature
 */
export const roleHasFeature = (role, feature) => {
  const config = getRoleConfig(role)
  return config?.features.includes(feature) || false
}

/**
 * Get color scheme for a role
 * @param {string} role - Role name
 * @returns {Object} Color scheme object with primary, secondary, and accent colors
 */
export const getRoleColorScheme = role => {
  const config = getRoleConfig(role)
  return config?.colorScheme || { primary: 'gray-600', secondary: 'gray-100', accent: 'gray-500' }
}

/**
 * Check if role requires mobile layout
 * @param {string} role - Role name
 * @returns {boolean} True if role uses mobile layout
 */
export const isMobileRole = role => {
  const config = getRoleConfig(role)
  return config?.layout === 'mobile'
}

/**
 * Validate if a path matches the user's role
 * @param {string} role - Role name
 * @param {string} path - URL path to validate
 * @returns {boolean} True if path is valid for the role
 */
export const isValidRolePath = (role, path) => {
  const basePath = getRoleBasePath(role)
  return path.startsWith(basePath)
}

export { ROLE_CONFIGS }
