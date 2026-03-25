import { NavLink } from 'react-router-dom'
import { Home, ClipboardCheck, QrCode, AlertCircle, User } from 'lucide-react'
import clsx from 'clsx'

/**
 * Inspector Bottom Navigation Component
 * Mobile-optimized bottom navigation bar for Inspector role
 * Features: Touch-friendly buttons (44x44px), active state highlighting, keyboard accessible
 */
const InspectorBottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/inspector/dashboard', ariaLabel: 'Navigate to Dashboard' },
    {
      icon: ClipboardCheck,
      label: 'Inspections',
      path: '/inspector/inspections',
      ariaLabel: 'View My Inspections',
    },
    { icon: QrCode, label: 'Scan', path: '/inspector/scan-qr', ariaLabel: 'Scan QR Code' },
    {
      icon: AlertCircle,
      label: 'Defects',
      path: '/inspector/defects',
      ariaLabel: 'View Defect Reports',
    },
    { icon: User, label: 'Profile', path: '/inspector/profile', ariaLabel: 'View Profile' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, path, ariaLabel }) => (
          <NavLink
            key={path}
            to={path}
            aria-label={ariaLabel}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px]',
                'transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                isActive ? 'text-ir-blue' : 'text-gray-600 hover:text-gray-900'
              )
            }
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default InspectorBottomNav
