import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  QrCode,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Package,
  User,
  X,
  Train,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../../store/authStore'

const DepotOfficerSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/depot-officer/dashboard',
      ariaLabel: 'Navigate to Dashboard',
    },
    {
      icon: QrCode,
      label: 'QR Management',
      path: '/depot-officer/qr-management',
      ariaLabel: 'Manage QR Codes',
    },
    {
      icon: ClipboardCheck,
      label: 'Inspections',
      path: '/depot-officer/inspections',
      ariaLabel: 'View Inspections',
    },
    {
      icon: AlertTriangle,
      label: 'Defect Management',
      path: '/depot-officer/defects',
      ariaLabel: 'Manage Defects',
    },
    { icon: FileText, label: 'Reports', path: '/depot-officer/reports', ariaLabel: 'View Reports' },
    {
      icon: Package,
      label: 'Inventory',
      path: '/depot-officer/inventory',
      ariaLabel: 'Manage Inventory',
    },
    { icon: User, label: 'Profile', path: '/depot-officer/profile', ariaLabel: 'View Profile' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Depot Officer navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg"
                aria-hidden="true"
              >
                <Train className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Depot Officer</h1>
                <p className="text-xs text-gray-500">Operations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Primary">
            <ul className="space-y-1">
              {navItems.map(({ icon: Icon, label, path, ariaLabel }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={onClose}
                    aria-label={ariaLabel}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'text-sm font-medium transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                        isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      )
                    }
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User section */}
          {user && (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-semibold">{user.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">Depot Officer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default DepotOfficerSidebar
