import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import LoadingSpinner from '../components/atoms/LoadingSpinner'

// Lazy load pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'))
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettingsPage'))
const AllInspectionsPage = lazy(() => import('../pages/admin/AllInspectionsPage'))
const AllReportsPage = lazy(() => import('../pages/admin/AllReportsPage'))
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'))
const SystemHealthPage = lazy(() => import('../pages/admin/SystemHealthPage'))
const ProfilePage = lazy(() => import('../pages/admin/ProfilePage'))

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/settings" element={<SystemSettingsPage />} />
          <Route path="/inspections" element={<AllInspectionsPage />} />
          <Route path="/reports" element={<AllReportsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/system-health" element={<SystemHealthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  )
}

export default AdminRoutes
