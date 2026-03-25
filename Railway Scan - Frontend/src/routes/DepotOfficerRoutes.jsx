import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import DepotOfficerLayout from '../layouts/DepotOfficerLayout'
import LoadingSpinner from '../components/atoms/LoadingSpinner'

// Lazy load pages
const DepotOfficerDashboardPage = lazy(
  () => import('../pages/depot-officer/DepotOfficerDashboardPage')
)
const QRManagementPage = lazy(() => import('../pages/depot-officer/QRManagementPage'))
const InspectionsPage = lazy(() => import('../pages/depot-officer/InspectionsPage'))
const DefectManagementPage = lazy(() => import('../pages/depot-officer/DefectManagementPage'))
const ReportsPage = lazy(() => import('../pages/depot-officer/ReportsPage'))
const InventoryPage = lazy(() => import('../pages/depot-officer/InventoryPage'))
const ProfilePage = lazy(() => import('../pages/depot-officer/ProfilePage'))

const DepotOfficerRoutes = () => {
  return (
    <DepotOfficerLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<DepotOfficerDashboardPage />} />
          <Route path="/qr-management" element={<QRManagementPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/defects" element={<DefectManagementPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </DepotOfficerLayout>
  )
}

export default DepotOfficerRoutes
