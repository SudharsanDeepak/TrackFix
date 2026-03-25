import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import InspectorLayout from '../layouts/InspectorLayout'
import LoadingSpinner from '../components/atoms/LoadingSpinner'

// Lazy load Inspector pages
const InspectorDashboardPage = lazy(() => import('../pages/inspector/InspectorDashboardPage'))
const StartInspectionPage = lazy(() => import('../pages/inspector/StartInspectionPage'))
const MyInspectionsPage = lazy(() => import('../pages/inspector/MyInspectionsPage'))
const ScanQRPage = lazy(() => import('../pages/inspector/ScanQRPage'))
const DefectReportsPage = lazy(() => import('../pages/inspector/DefectReportsPage'))
const ProfilePage = lazy(() => import('../pages/inspector/ProfilePage'))

/**
 * Inspector Routes Bundle
 * Lazy-loaded route configuration for Inspector role
 * All routes are wrapped in InspectorLayout for consistent mobile-first design
 */
function InspectorRoutes() {
  return (
    <InspectorLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="dashboard" element={<InspectorDashboardPage />} />
          <Route path="start-inspection" element={<StartInspectionPage />} />
          <Route path="inspections" element={<MyInspectionsPage />} />
          <Route path="scan-qr" element={<ScanQRPage />} />
          <Route path="defects" element={<DefectReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </InspectorLayout>
  )
}

export default InspectorRoutes
