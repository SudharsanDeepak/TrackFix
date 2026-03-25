import { useAuthStore } from '../store/authStore'

/**
 * Hook to check if user has access to a specific feature
 * @param {string} feature - Feature identifier
 * @returns {boolean} Whether user has access to feature
 *
 * @example
 * const canScanQR = useFeatureAccess('scan-qr')
 * const canManageUsers = useFeatureAccess('users')
 */
export const useFeatureAccess = feature => {
  const roleConfig = useAuthStore(state => state.roleConfig)

  if (!roleConfig) return false

  return roleConfig.features.includes(feature)
}
