import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../store/authStore'
import { getRoleBasePath, isValidRolePath } from '../../utils/roleHelpers'

/**
 * Integration Tests: Role-Based Navigation Flows
 *
 * Tests navigation within role-specific routes and unauthorized access handling:
 * - Users can navigate within their role's routes
 * - Unauthorized route access is detected
 * - Role path validation works correctly
 *
 * **Validates: Requirements 2.2, 2.3, 2.4**
 */

describe('Role-Based Navigation Flows', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  describe('Inspector can navigate within /inspector/* routes', () => {
    it('should validate Inspector can access /inspector/dashboard', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify Inspector role path
      const basePath = getRoleBasePath('INSPECTOR')
      expect(basePath).toBe('/inspector')

      // Verify path validation
      expect(isValidRolePath('INSPECTOR', '/inspector/dashboard')).toBe(true)
    })

    it('should validate Inspector can access /inspector/inspections', () => {
      expect(isValidRolePath('INSPECTOR', '/inspector/inspections')).toBe(true)
    })

    it('should validate Inspector can access /inspector/scan-qr', () => {
      expect(isValidRolePath('INSPECTOR', '/inspector/scan-qr')).toBe(true)
    })
  })

  describe('Depot Officer can navigate within /depot-officer/* routes', () => {
    it('should validate Depot Officer can access /depot-officer/dashboard', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      // Verify Depot Officer role path
      const basePath = getRoleBasePath('DEPOT_OFFICER')
      expect(basePath).toBe('/depot-officer')

      // Verify path validation
      expect(isValidRolePath('DEPOT_OFFICER', '/depot-officer/dashboard')).toBe(true)
    })

    it('should validate Depot Officer can access /depot-officer/qr-management', () => {
      expect(isValidRolePath('DEPOT_OFFICER', '/depot-officer/qr-management')).toBe(true)
    })
  })

  describe('Zonal Manager can navigate within /zonal-manager/* routes', () => {
    it('should validate Zonal Manager can access /zonal-manager/dashboard', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      // Verify Zonal Manager role path
      const basePath = getRoleBasePath('ZONAL_MANAGER')
      expect(basePath).toBe('/zonal-manager')

      // Verify path validation
      expect(isValidRolePath('ZONAL_MANAGER', '/zonal-manager/dashboard')).toBe(true)
    })

    it('should validate Zonal Manager can access /zonal-manager/analytics', () => {
      expect(isValidRolePath('ZONAL_MANAGER', '/zonal-manager/analytics')).toBe(true)
    })
  })

  describe('Administrator can navigate within /admin/* routes', () => {
    it('should validate Administrator can access /admin/dashboard', () => {
      const adminUser = {
        id: '4',
        name: 'Alice Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      useAuthStore.getState().login(adminUser, 'mock-token', 'mock-refresh-token')

      // Verify Admin role path
      const basePath = getRoleBasePath('ADMIN')
      expect(basePath).toBe('/admin')

      // Verify path validation
      expect(isValidRolePath('ADMIN', '/admin/dashboard')).toBe(true)
    })

    it('should validate Administrator can access /admin/users', () => {
      expect(isValidRolePath('ADMIN', '/admin/users')).toBe(true)
    })
  })

  describe('Unauthorized route access is detected', () => {
    it('should detect Inspector trying to access /depot-officer/* routes', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      // Verify Inspector cannot access Depot Officer routes
      expect(isValidRolePath('INSPECTOR', '/depot-officer/dashboard')).toBe(false)
    })

    it('should detect Depot Officer trying to access /admin/* routes', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      // Verify Depot Officer cannot access Admin routes
      expect(isValidRolePath('DEPOT_OFFICER', '/admin/users')).toBe(false)
    })

    it('should detect Zonal Manager trying to access /inspector/* routes', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      // Verify Zonal Manager cannot access Inspector routes
      expect(isValidRolePath('ZONAL_MANAGER', '/inspector/scan-qr')).toBe(false)
    })

    it('should detect Admin trying to access other role routes', () => {
      // Admin should only access /admin/* routes
      expect(isValidRolePath('ADMIN', '/inspector/dashboard')).toBe(false)
      expect(isValidRolePath('ADMIN', '/depot-officer/dashboard')).toBe(false)
      expect(isValidRolePath('ADMIN', '/zonal-manager/dashboard')).toBe(false)
    })
  })
})
