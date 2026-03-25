/**
 * Integration examples showing how useRoleData works with existing services
 */

import { useRoleData } from './useRoleData'
import * as inspectorService from '../services/inspectorService'
import * as depotOfficerService from '../services/depotOfficerService'
import * as zonalManagerService from '../services/zonalManagerService'
import * as adminService from '../services/adminService'

// Inspector: Dashboard data with caching
export const useInspectorDashboard = () => {
  return useRoleData('inspector-dashboard', () => inspectorService.getDashboardData(), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Inspector: Active inspections with shorter cache
export const useActiveInspections = () => {
  return useRoleData('active-inspections', () => inspectorService.getActiveInspections(), {
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates)
    cacheTime: 5 * 60 * 1000,
  })
}

// Depot Officer: QR stats with caching
export const useDepotQRStats = () => {
  return useRoleData('depot-qr-stats', () => depotOfficerService.getQRStats(), {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Zonal Manager: Zone analytics with caching
export const useZoneAnalytics = () => {
  return useRoleData('zone-analytics', () => zonalManagerService.getZoneAnalytics(), {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Admin: System health with shorter cache
export const useSystemHealth = () => {
  return useRoleData('system-health', () => adminService.getSystemHealth(), {
    staleTime: 1 * 60 * 1000, // 1 minute (real-time monitoring)
    cacheTime: 3 * 60 * 1000,
  })
}
