import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getRoleBasePath, getRoleConfig } from '../utils/roleHelpers'
import { ERROR_TYPES, logRoleError } from '../utils/roleErrorHandler'

const isNativeApp = () => {
  return window.Capacitor !== undefined || 
    window.location.protocol === 'capacitor:' ||
    document.URL.startsWith('capacitor://')
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user?.role) {
    logRoleError(ERROR_TYPES.MISSING_ROLE, { userId: user?.id, path: location.pathname })
    return <Navigate to="/error/no-role" replace />
  }

  // Block Inspector role on web browser — must use mobile app
  if (user.role === 'INSPECTOR' && !isNativeApp()) {
    return <Navigate to="/mobile-only" replace />
  }

  const roleConfig = getRoleConfig(user.role)
  if (!roleConfig) {
    logRoleError(ERROR_TYPES.INVALID_ROLE, { userId: user?.id, role: user.role, path: location.pathname })
    logout()
    return <Navigate to="/login" state={{ error: 'invalid_role' }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    logRoleError(ERROR_TYPES.UNAUTHORIZED_ROUTE, { userId: user?.id, role: user.role, path: location.pathname })
    return <Navigate to="/error/unauthorized" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
