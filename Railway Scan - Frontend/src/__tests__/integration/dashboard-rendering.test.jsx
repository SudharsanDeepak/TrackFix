import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../store/authStore'
import { getRoleConfig } from '../../utils/roleHelpers'

/**
 * Integration Tests: Dashboard Rendering for All Roles
 *
 * Tests that each role's dashboard configuration is correct:
 * - Inspector dashboard with mobile-optimized layout
 * - Depot Officer dashboard with operational layout
 * - Zonal Manager dashboard with analytics layout
 * - Administrator dashboard with comprehensive layout
 *
 * **Validates: Requirements 3.1-3.7, 4.1-4.7, 5.1-5.7, 6.1-6.7**
 */

describe('Dashboard Rendering for All Roles', () => {
  beforeEach(() => {
    // Clear auth store before each test
    useAuthStore.getState().logout()
    vi.clearAllMocks()
  })

  describe('Inspector dashboard configuration', () => {
    it('should configure Inspector with mobile layout', () => {
      const inspectorUser = {
        id: '1',
        name: 'John Inspector',
        email: 'inspector@test.com',
        role: 'INSPECTOR',
      }

      useAuthStore.getState().login(inspectorUser, 'mock-token', 'mock-refresh-token')

      const roleConfig = useAuthStore.getState().roleConfig

      // Verify mobile layout is configured
      expect(roleConfig?.layout).toBe('mobile')
      expect(roleConfig?.role).toBe('INSPECTOR')
    })

    it('should configure Inspector with correct features', () => {
      const roleConfig = getRoleConfig('INSPECTOR')

      // Verify Inspector has field operation features
      expect(roleConfig?.features).toContain('scan-qr')
      expect(roleConfig?.features).toContain('inspections')
      expect(roleConfig?.features).toContain('defects')
    })

    it('should configure Inspector with blue color scheme', () => {
      const roleConfig = getRoleConfig('INSPECTOR')

      expect(roleConfig?.colorScheme.primary).toBe('blue-600')
      expect(roleConfig?.colorScheme.secondary).toBe('blue-100')
    })
  })

  describe('Depot Officer dashboard configuration', () => {
    it('should configure Depot Officer with desktop layout', () => {
      const depotOfficerUser = {
        id: '2',
        name: 'Jane Officer',
        email: 'officer@test.com',
        role: 'DEPOT_OFFICER',
      }

      useAuthStore.getState().login(depotOfficerUser, 'mock-token', 'mock-refresh-token')

      const roleConfig = useAuthStore.getState().roleConfig

      // Verify desktop layout is configured
      expect(roleConfig?.layout).toBe('desktop')
      expect(roleConfig?.role).toBe('DEPOT_OFFICER')
    })

    it('should configure Depot Officer with correct features', () => {
      const roleConfig = getRoleConfig('DEPOT_OFFICER')

      // Verify Depot Officer has operational features
      expect(roleConfig?.features).toContain('qr-management')
      expect(roleConfig?.features).toContain('inspections')
      expect(roleConfig?.features).toContain('defects')
      expect(roleConfig?.features).toContain('reports')
      expect(roleConfig?.features).toContain('inventory')
    })

    it('should configure Depot Officer with green color scheme', () => {
      const roleConfig = getRoleConfig('DEPOT_OFFICER')

      expect(roleConfig?.colorScheme.primary).toBe('green-600')
      expect(roleConfig?.colorScheme.secondary).toBe('green-100')
    })
  })

  describe('Zonal Manager dashboard configuration', () => {
    it('should configure Zonal Manager with desktop layout', () => {
      const zonalManagerUser = {
        id: '3',
        name: 'Bob Manager',
        email: 'manager@test.com',
        role: 'ZONAL_MANAGER',
      }

      useAuthStore.getState().login(zonalManagerUser, 'mock-token', 'mock-refresh-token')

      const roleConfig = useAuthStore.getState().roleConfig

      // Verify desktop layout is configured
      expect(roleConfig?.layout).toBe('desktop')
      expect(roleConfig?.role).toBe('ZONAL_MANAGER')
    })

    it('should configure Zonal Manager with correct features', () => {
      const roleConfig = getRoleConfig('ZONAL_MANAGER')

      // Verify Zonal Manager has analytics features
      expect(roleConfig?.features).toContain('analytics')
      expect(roleConfig?.features).toContain('depots')
      expect(roleConfig?.features).toContain('vendors')
      expect(roleConfig?.features).toContain('reports')
      expect(roleConfig?.features).toContain('alerts')
    })

    it('should configure Zonal Manager with purple color scheme', () => {
      const roleConfig = getRoleConfig('ZONAL_MANAGER')

      expect(roleConfig?.colorScheme.primary).toBe('purple-600')
      expect(roleConfig?.colorScheme.secondary).toBe('purple-100')
    })
  })

  describe('Administrator dashboard configuration', () => {
    it('should configure Administrator with desktop layout', () => {
      const adminUser = {
        id: '4',
        name: 'Alice Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      }

      useAuthStore.getState().login(adminUser, 'mock-token', 'mock-refresh-token')

      const roleConfig = useAuthStore.getState().roleConfig

      // Verify desktop layout is configured
      expect(roleConfig?.layout).toBe('desktop')
      expect(roleConfig?.role).toBe('ADMIN')
    })

    it('should configure Administrator with correct features', () => {
      const roleConfig = getRoleConfig('ADMIN')

      // Verify Admin has comprehensive features
      expect(roleConfig?.features).toContain('users')
      expect(roleConfig?.features).toContain('settings')
      expect(roleConfig?.features).toContain('inspections')
      expect(roleConfig?.features).toContain('reports')
      expect(roleConfig?.features).toContain('audit-logs')
      expect(roleConfig?.features).toContain('system-health')
    })

    it('should configure Administrator with red color scheme', () => {
      const roleConfig = getRoleConfig('ADMIN')

      expect(roleConfig?.colorScheme.primary).toBe('red-600')
      expect(roleConfig?.colorScheme.secondary).toBe('red-100')
    })
  })
})
