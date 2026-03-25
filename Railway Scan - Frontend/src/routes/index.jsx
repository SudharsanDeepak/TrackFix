import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import RoleRouter from './RoleRouter'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import AuthCallbackPage from '../pages/AuthCallbackPage'
import MobileOnlyPage from '../pages/MobileOnlyPage'
import ErrorPage from '../pages/ErrorPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import NoRolePage from '../pages/NoRolePage'
import LoadingSpinner from '../components/atoms/LoadingSpinner'

// Lazy load role-specific route bundles
const InspectorRoutes = lazy(() => import('./InspectorRoutes'))
const DepotOfficerRoutes = lazy(() => import('./DepotOfficerRoutes'))
const ZonalManagerRoutes = lazy(() => import('./ZonalManagerRoutes'))
const AdminRoutes = lazy(() => import('./AdminRoutes'))

/**
 * Main Application Routes
 */
function AppRoutes() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  return (
    <>
      <RoleRouter />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
        </Route>

        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Mobile Only Page for Inspector role on web */}
        <Route path="/mobile-only" element={<MobileOnlyPage />} />

        {/* Role-Based Protected Routes */}
        <Route
          path="/inspector/*"
          element={
            <ProtectedRoute allowedRoles={['INSPECTOR']}>
              <Suspense fallback={<LoadingSpinner />}>
                <InspectorRoutes />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/depot-officer/*"
          element={
            <ProtectedRoute allowedRoles={['DEPOT_OFFICER']}>
              <Suspense fallback={<LoadingSpinner />}>
                <DepotOfficerRoutes />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/zonal-manager/*"
          element={
            <ProtectedRoute allowedRoles={['ZONAL_MANAGER']}>
              <Suspense fallback={<LoadingSpinner />}>
                <ZonalManagerRoutes />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Suspense fallback={<LoadingSpinner />}>
                <AdminRoutes />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Default redirect - handled by RoleRouter for authenticated users */}
        <Route
          path="/"
          element={
            !isAuthenticated ? <Navigate to="/login" replace /> : <LoadingSpinner />
          }
        />

        {/* Error Pages */}
        <Route path="/error/no-role" element={<NoRolePage />} />
        <Route path="/error/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/error" element={<ErrorPage />} />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a href="/" className="text-ir-blue hover:underline">
                  Go to Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  )
}

export default AppRoutes
