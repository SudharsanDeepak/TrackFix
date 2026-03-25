import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../store/authStore'
import * as storage from '../../utils/storage'

/**
 * Integration Tests: Logout Flow
 *
 * Tests complete logout behavior:
 * - Logout clears all session data
 * - Logout clears role information from store
 * - Logout clears browser storage
 * - Logout resets authentication state
 *
 * **Validates: Requirements 1.5, 24.6**
 */

// Mock storage utilities
vi.mock('../../utils/storage', () => ({
  saveToken: vi.fn(),
  saveRefreshToken: vi.fn(),
  saveUser: vi.fn(),
  clearAuthData: vi.fn(),
  getUser: vi.fn(() => null),
  getToken: vi.fn(() => null),
  removeToken: vi.fn(),
}))

describe('Logout Flow', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()

    // Reset localStorage
    localStorage.clear()
  })

  describe('Logout clears all session data', () => {
    it('should clear user data from auth store on logout', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      // Login user
      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify user is logged in
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().user).toEqual(inspectorUser)
      expect(useAuthStore.getState().token).toBe('mock-token')

      // Logout
      useAuthStore.getState().logout()

      // Verify session data is cleared
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().token).toBeNull()
    })

    it('should clear token on logout', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      // Login user
      useAuthStore.getState().login(depotOfficerUser, 'test-token-123', 'test-refresh-456')

      // Verify token is set
      expect(useAuthStore.getState().token).toBe('test-token-123')

      // Logout
      useAuthStore.getState().logout()

      // Verify token is cleared
      expect(useAuthStore.getState().token).toBeNull()
    })

    it('should clear authentication state on logout', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      // Login user
      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      // Verify authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Logout
      useAuthStore.getState().logout()

      // Verify not authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('Logout clears role information from store', () => {
    it('should clear role from user object on logout', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      // Login user
      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify role is set
      expect(useAuthStore.getState().user?.role).toBe('INSPECTOR')

      // Logout
      useAuthStore.getState().logout()

      // Verify user object is cleared (including role)
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('should clear roleConfig on logout', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      // Login user
      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      // Verify roleConfig is set
      expect(useAuthStore.getState().roleConfig).not.toBeNull()
      expect(useAuthStore.getState().roleConfig?.role).toBe('DEPOT_OFFICER')

      // Logout
      useAuthStore.getState().logout()

      // Verify roleConfig is cleared
      expect(useAuthStore.getState().roleConfig).toBeNull()
    })

    it('should clear all role-related state on logout', () => {
      const adminUser = {
        id: '4',
        name: 'Alice Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      // Login user
      useAuthStore.getState().login(adminUser, 'mock-token', 'mock-refresh-token')

      // Verify role-related state is set
      expect(useAuthStore.getState().getRole()).toBe('ADMIN')
      expect(useAuthStore.getState().isAdmin()).toBe(true)
      expect(useAuthStore.getState().roleConfig).not.toBeNull()

      // Logout
      useAuthStore.getState().logout()

      // Verify all role-related state is cleared
      expect(useAuthStore.getState().getRole()).toBeUndefined()
      expect(useAuthStore.getState().isAdmin()).toBe(false)
      expect(useAuthStore.getState().roleConfig).toBeNull()
    })
  })

  describe('Logout clears browser storage', () => {
    it('should call clearAuthData to remove data from browser storage', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      // Login user
      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Clear the mock call history
      vi.clearAllMocks()

      // Logout
      useAuthStore.getState().logout()

      // Verify clearAuthData was called
      expect(storage.clearAuthData).toHaveBeenCalled()
    })

    it('should clear persisted auth storage on logout', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      // Login user
      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      // Logout
      useAuthStore.getState().logout()

      // Verify storage was cleared
      expect(storage.clearAuthData).toHaveBeenCalled()
    })
  })

  describe('Logout resets authentication state', () => {
    it('should prevent access after logout', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      // Login user
      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Logout
      useAuthStore.getState().logout()

      // Verify user cannot access protected resources
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })

    it('should clear error state on logout', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      // Login user
      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      // Set an error
      useAuthStore.getState().setError('Some error occurred')
      expect(useAuthStore.getState().error).toBe('Some error occurred')

      // Logout
      useAuthStore.getState().logout()

      // Verify error is cleared
      expect(useAuthStore.getState().error).toBeNull()
    })
  })
})
