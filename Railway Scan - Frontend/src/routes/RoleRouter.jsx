import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getRoleBasePath } from '../utils/roleHelpers'

const isNativeApp = () => {
  return window.Capacitor !== undefined ||
    window.location.protocol === 'capacitor:' ||
    document.URL.startsWith('capacitor://')
}

const RoleRouter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return

    // Inspector on web → mobile only page
    if (user.role === 'INSPECTOR' && !isNativeApp()) {
      if (!location.pathname.startsWith('/mobile-only')) {
        navigate('/mobile-only', { replace: true })
      }
      return
    }

    const roleBasePath = getRoleBasePath(user.role)
    const currentPath = location.pathname

    if (currentPath.startsWith('/login') || currentPath.startsWith('/register')) return

    if (currentPath === '/') {
      navigate(`${roleBasePath}/dashboard`, { replace: true })
      return
    }

    const rolePathPrefixes = ['/inspector', '/depot-officer', '/zonal-manager', '/admin']
    const isOnRolePath = rolePathPrefixes.some(prefix => currentPath.startsWith(prefix))

    if (isOnRolePath && !currentPath.startsWith(roleBasePath)) {
      navigate(`${roleBasePath}/dashboard`, { replace: true })
    }
  }, [user?.role, isAuthenticated, location.pathname, navigate])

  return null
}

export default RoleRouter
