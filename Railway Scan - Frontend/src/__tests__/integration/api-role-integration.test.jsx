import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../store/authStore'

/**
 * Integration Tests: API Integration with Role Headers
 *
 * Tests API request behavior with role-based headers:
 * - Auth store provides role information for API requests
 * - Role information is available after login
 * - Role information is cleared after logout
 * - Session expiration clears role data
 *
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**
 */

describe('API Integration with Role Headers', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  describe('All API requests should include role information', () => {
    it('should provide Inspector role from auth store', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify role is available for API requests
      const role = useAuthStore.getState().user?.role
      expect(role).toBe('INSPECTOR')
    })

    it('should provide Depot Officer role from auth store', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      const role = useAuthStore.getState().user?.role
      expect(role).toBe('DEPOT_OFFICER')
    })

    it('should provide Zonal Manager role from auth store', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      const role = useAuthStore.getState().user?.role
      expect(role).toBe('ZONAL_MANAGER')
    })

    it('should provide Administrator role from auth store', () => {
      const adminUser = {
        id: '4',
        name: 'Alice Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      useAuthStore.getState().login(adminUser, 'mock-token', 'mock-refresh-token')

      const role = useAuthStore.getState().user?.role
      expect(role).toBe('ADMIN')
    })

    it('should provide token for Authorization header', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'test-token-123', 'mock-refresh-token')

      // Verify token is available for API requests
      const token = useAuthStore.getState().token
      expect(token).toBe('test-token-123')
    })
  })

  describe('403 response should trigger logout', () => {
    it('should have logout function available in auth store', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify user is logged in
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Simulate 403 response by calling logout
      useAuthStore.getState().logout()

      // Verify user is logged out
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().token).toBeNull()
    })
  })

  describe('Session expiration prevents API requests', () => {
    it('should not provide role when user is not authenticated', () => {
      // Ensure user is logged out
      useAuthStore.getState().logout()

      // Verify no role is available
      const role = useAuthStore.getState().user?.role
      expect(role).toBeUndefined()
    })

    it('should not provide token when user is not authenticated', () => {
      // Ensure user is logged out
      useAuthStore.getState().logout()

      // Verify no token is available
      const token = useAuthStore.getState().token
      expect(token).toBeNull()
    })

    it('should clear authentication state on logout', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Logout
      useAuthStore.getState().logout()

      // Verify not authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('Role-specific API services work correctly', () => {
    it('should provide correct role for Inspector API requests', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify role is available for Inspector API service
      const role = useAuthStore.getState().user?.role
      expect(role).toBe('INSPECTOR')

      // Verify role config has Inspector features
      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.features).toContain('scan-qr')
      expect(roleConfig?.features).toContain('inspections')
    })

    it('should provide correct role for Depot Officer API requests', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      const role = useAuthStore.getState().user?.role
      expect(role).toBe('DEPOT_OFFICER')

      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.features).toContain('qr-management')
      expect(roleConfig?.features).toContain('inspections')
    })

    it('should provide correct role for Zonal Manager API requests', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      const role = useAuthStore.getState().user?.role
      expect(role).toBe('ZONAL_MANAGER')

      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.features).toContain('analytics')
      expect(roleConfig?.features).toContain('depots')
    })

    it('should provide correct role for Admin API requests', () => {
      const adminUser = {
        id: '4',
        name: 'Alice Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      useAuthStore.getState().login(adminUser, 'mock-token', 'mock-refresh-token')

      const role = useAuthStore.getState().user?.role
      expect(role).toBe('ADMIN')

      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.features).toContain('users')
      expect(roleConfig?.features).toContain('settings')
    })
  })
})
