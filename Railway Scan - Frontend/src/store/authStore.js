import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  saveToken,
  saveRefreshToken,
  saveUser,
  clearAuthData,
  getUser,
  getToken,
} from '../utils/storage'
import { getRoleConfig } from '../utils/roleHelpers'
import { preloadRoleAssets } from '../utils/preloadRoleAssets'

/**
 * Authentication Store
 * Manages user authentication state and role-based access control
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: getUser(),
      token: getToken(),
      isAuthenticated: !!getToken(),
      isLoading: false,
      error: null,
      roleConfig: getUser() ? getRoleConfig(getUser().role) : null,

      // Actions
      login: (userData, accessToken, refreshToken) => {
        saveToken(accessToken)
        saveRefreshToken(refreshToken)
        saveUser(userData)

        const roleConfig = getRoleConfig(userData.role)

        set({
          user: userData,
          token: accessToken,
          isAuthenticated: true,
          roleConfig,
          error: null,
        })

        // Preload role-specific assets for improved performance
        preloadRoleAssets(userData.role)
      },

      logout: () => {
        clearAuthData()

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          roleConfig: null,
          error: null,
        })
      },

      updateUser: userData => {
        saveUser(userData)
        const roleConfig = getRoleConfig(userData.role)

        set({
          user: userData,
          roleConfig,
        })
      },

      updateRole: newRole => {
        const user = get().user
        if (!user) return

        const updatedUser = { ...user, role: newRole }
        saveUser(updatedUser)
        const roleConfig = getRoleConfig(newRole)

        set({
          user: updatedUser,
          roleConfig,
        })
      },

      setLoading: isLoading => {
        set({ isLoading })
      },

      setError: error => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      refreshToken: (newAccessToken, newRefreshToken) => {
        saveToken(newAccessToken)
        saveRefreshToken(newRefreshToken)

        set({
          token: newAccessToken,
        })
      },

      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
      getRole: () => get().user?.role,
      getRoleConfig: () => get().roleConfig,

      // Role checks
      isInspector: () => get().user?.role === 'INSPECTOR',
      isDepotOfficer: () => get().user?.role === 'DEPOT_OFFICER',
      isZonalManager: () => get().user?.role === 'ZONAL_MANAGER',
      isAdmin: () => get().user?.role === 'ADMIN',
      isVendor: () => get().user?.role === 'VENDOR',
      hasRole: role => get().user?.role === role,
      hasAnyRole: roles => roles.includes(get().user?.role),
      hasFeature: feature => get().roleConfig?.features.includes(feature),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        roleConfig: state.roleConfig,
      }),
    }
  )
)
