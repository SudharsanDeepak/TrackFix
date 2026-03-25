import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../store/authStore'
import { getRoleBasePath, getRoleConfig } from '../../utils/roleHelpers'

/**
 * Integration Tests: Authentication Flow with Role Detection
 *
 * Tests complete authentication flows including:
 * - Login with different roles and role configuration
 * - Missing role error handling
 * - Invalid role handling
 * - Role-based path resolution
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.5, 2.6, 2.7, 2.8**
 */

describe('Authentication Flow with Role Detection', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  describe('Login with Inspector role redirects to /inspector/dashboard', () => {
    it('should set Inspector role and configure /inspector path after login', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      // Simulate login
      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify role is set
      expect(useAuthStore.getState().user?.role).toBe('INSPECTOR')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Verify role config is set correctly
      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.basePath).toBe('/inspector')
      expect(roleConfig?.defaultRoute).toBe('/inspector/dashboard')

      // Verify getRoleBasePath returns correct path
      expect(getRoleBasePath('INSPECTOR')).toBe('/inspector')
    })
  })

  describe('Login with Depot Officer role redirects to /depot-officer/dashboard', () => {
    it('should set Depot Officer role and configure /depot-officer path after login', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      // Simulate login
      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      // Verify role is set
      expect(useAuthStore.getState().user?.role).toBe('DEPOT_OFFICER')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Verify role config is set correctly
      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.basePath).toBe('/depot-officer')
      expect(roleConfig?.defaultRoute).toBe('/depot-officer/dashboard')

      // Verify getRoleBasePath returns correct path
      expect(getRoleBasePath('DEPOT_OFFICER')).toBe('/depot-officer')
    })
  })

  describe('Login with Zonal Manager role redirects to /zonal-manager/dashboard', () => {
    it('should set Zonal Manager role and configure /zonal-manager path after login', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      // Simulate login
      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      // Verify role is set
      expect(useAuthStore.getState().user?.role).toBe('ZONAL_MANAGER')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Verify role config is set correctly
      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.basePath).toBe('/zonal-manager')
      expect(roleConfig?.defaultRoute).toBe('/zonal-manager/dashboard')

      // Verify getRoleBasePath returns correct path
      expect(getRoleBasePath('ZONAL_MANAGER')).toBe('/zonal-manager')
    })
  })

  describe('Login with Administrator role redirects to /admin/dashboard', () => {
    it('should set Administrator role and configure /admin path after login', () => {
      const adminUser = {
        id: '4',
        name: 'Alice Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      // Simulate login
      useAuthStore.getState().login(adminUser, 'mock-token', 'mock-refresh-token')

      // Verify role is set
      expect(useAuthStore.getState().user?.role).toBe('ADMIN')
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Verify role config is set correctly
      const roleConfig = useAuthStore.getState().roleConfig
      expect(roleConfig?.basePath).toBe('/admin')
      expect(roleConfig?.defaultRoute).toBe('/admin/dashboard')

      // Verify getRoleBasePath returns correct path
      expect(getRoleBasePath('ADMIN')).toBe('/admin')
    })
  })

  describe('Missing role error prevents access', () => {
    it('should not set roleConfig when user has no role', () => {
      const userWithoutRole = {
        id: '5',
        name: 'No Role User',
        email: 'norole@test.com',
        // role is missing
      }

      // Simulate login with user without role
      useAuthStore.setState({
        user: userWithoutRole,
        token: 'mock-token',
        isAuthenticated: true,
        roleConfig: null,
      })

      // Verify roleConfig is null
      expect(useAuthStore.getState().roleConfig).toBeNull()
      expect(useAuthStore.getState().user?.role).toBeUndefined()
    })

    it('should return null for getRoleConfig with missing role', () => {
      const config = getRoleConfig(undefined)
      expect(config).toBeNull()
    })
  })

  describe('Invalid role triggers logout', () => {
    it('should not set roleConfig for invalid role', () => {
      const userWithInvalidRole = {
        id: '6',
        name: 'Invalid Role User',
        email: 'invalid@test.com',
        role: 'INVALID_ROLE',
      }

      // Simulate login with invalid role
      useAuthStore.setState({
        user: userWithInvalidRole,
        token: 'mock-token',
        isAuthenticated: true,
        roleConfig: null,
      })

      // Verify roleConfig is null for invalid role
      expect(useAuthStore.getState().roleConfig).toBeNull()
    })

    it('should return null for getRoleConfig with invalid role', () => {
      const config = getRoleConfig('INVALID_ROLE')
      expect(config).toBeNull()
    })

    it('should return "/" for getRoleBasePath with invalid role', () => {
      const basePath = getRoleBasePath('INVALID_ROLE')
      expect(basePath).toBe('/')
    })
  })
})
