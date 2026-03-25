/**
 * Preload role-specific assets during authentication
 * This improves perceived performance by loading the appropriate
 * role-specific bundle when a user logs in
 */

/**
 * Preload role-specific route bundles and dashboard components
 * @param {string} role - User role (INSPECTOR, DEPOT_OFFICER, ZONAL_MANAGER, ADMIN)
 */
export const preloadRoleAssets = role => {
  if (!role) {
    console.warn('preloadRoleAssets: No role provided')
    return
  }

  switch (role) {
    case 'INSPECTOR':
      // Preload Inspector route bundle and dashboard
      import('../routes/InspectorRoutes').catch(err =>
        console.error('Failed to preload InspectorRoutes:', err)
      )
      import('../pages/inspector/InspectorDashboardPage').catch(err =>
        console.error('Failed to preload InspectorDashboardPage:', err)
      )
      break

    case 'DEPOT_OFFICER':
      // Preload Depot Officer route bundle and dashboard
      import('../routes/DepotOfficerRoutes').catch(err =>
        console.error('Failed to preload DepotOfficerRoutes:', err)
      )
      import('../pages/depot-officer/DepotOfficerDashboardPage').catch(err =>
        console.error('Failed to preload DepotOfficerDashboardPage:', err)
      )
      break

    case 'ZONAL_MANAGER':
      // Preload Zonal Manager route bundle and dashboard
      import('../routes/ZonalManagerRoutes').catch(err =>
        console.error('Failed to preload ZonalManagerRoutes:', err)
      )
      import('../pages/zonal-manager/ZonalManagerDashboardPage').catch(err =>
        console.error('Failed to preload ZonalManagerDashboardPage:', err)
      )
      break

    case 'ADMIN':
      // Preload Admin route bundle and dashboard
      import('../routes/AdminRoutes').catch(err =>
        console.error('Failed to preload AdminRoutes:', err)
      )
      import('../pages/admin/AdminDashboardPage').catch(err =>
        console.error('Failed to preload AdminDashboardPage:', err)
      )
      break

    default:
      console.warn(`preloadRoleAssets: Unknown role "${role}"`)
  }
}

export default preloadRoleAssets
