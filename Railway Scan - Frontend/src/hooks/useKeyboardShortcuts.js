import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from './useRole'

/**
 * Keyboard shortcuts for management roles
 * Provides quick navigation using keyboard combinations
 *
 * Shortcuts:
 * - Alt+D: Dashboard
 * - Alt+R: Reports
 * - Alt+P: Profile
 * - Alt+S: Settings (Admin only)
 * - Alt+U: Users (Admin only)
 * - Alt+Q: QR Management (Depot Officer only)
 * - Alt+I: Inspections
 * - Alt+A: Analytics (Zonal Manager only)
 * - Alt+V: Vendors (Zonal Manager only)
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate()
  const { role, basePath } = useRole()

  useEffect(() => {
    // Only enable for management roles (not Inspector - mobile-first)
    if (role === 'INSPECTOR') return

    const handleKeyDown = event => {
      // Only trigger on Alt key combinations
      if (!event.altKey) return

      // Prevent default browser behavior
      event.preventDefault()

      const key = event.key.toLowerCase()

      // Common shortcuts for all management roles
      switch (key) {
        case 'd':
          navigate(`${basePath}/dashboard`)
          break
        case 'r':
          navigate(`${basePath}/reports`)
          break
        case 'p':
          navigate(`${basePath}/profile`)
          break
        case 'i':
          if (role === 'DEPOT_OFFICER' || role === 'ADMIN') {
            navigate(`${basePath}/inspections`)
          }
          break
        default:
          break
      }

      // Role-specific shortcuts
      if (role === 'ADMIN') {
        switch (key) {
          case 's':
            navigate(`${basePath}/settings`)
            break
          case 'u':
            navigate(`${basePath}/users`)
            break
          default:
            break
        }
      } else if (role === 'DEPOT_OFFICER') {
        switch (key) {
          case 'q':
            navigate(`${basePath}/qr-management`)
            break
          default:
            break
        }
      } else if (role === 'ZONAL_MANAGER') {
        switch (key) {
          case 'a':
            navigate(`${basePath}/analytics`)
            break
          case 'v':
            navigate(`${basePath}/vendors`)
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, role, basePath])
}
