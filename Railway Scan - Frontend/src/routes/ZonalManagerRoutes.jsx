import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ZonalManagerLayout from '../layouts/ZonalManagerLayout'
import LoadingSpinner from '../components/atoms/LoadingSpinner'

// Lazy load pages
const ZonalManagerDashboardPage = lazy(
  () => import('../pages/zonal-manager/ZonalManagerDashboardPage')
)
const ZoneAnalyticsPage = lazy(() => import('../pages/zonal-manager/ZoneAnalyticsPage'))
const DepotPerformancePage = lazy(() => import('../pages/zonal-manager/DepotPerformancePage'))
const VendorManagementPage = lazy(() => import('../pages/zonal-manager/VendorManagementPage'))
const ReportsPage = lazy(() => import('../pages/zonal-manager/ReportsPage'))
const AlertsPage = lazy(() => import('../pages/zonal-manager/AlertsPage'))
const ProfilePage = lazy(() => import('../pages/zonal-manager/ProfilePage'))

const ZonalManagerRoutes = () => {
  return (
    <ZonalManagerLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<ZonalManagerDashboardPage />} />
          <Route path="/analytics" element={<ZoneAnalyticsPage />} />
          <Route path="/depots" element={<DepotPerformancePage />} />
          <Route path="/vendors" element={<VendorManagementPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </ZonalManagerLayout>
  )
}

export default ZonalManagerRoutes
