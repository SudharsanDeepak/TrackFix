import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  QrCode,
  Building2,
  ClipboardCheck,
  Brain,
  FileText,
  Settings,
  Train,
  X,
} from 'lucide-react'
import { Avatar } from '../atoms'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['ADMIN', 'DEPOT_OFFICER', 'INSPECTOR', 'VENDOR'],
    },
    {
      label: 'QR Management',
      icon: QrCode,
      path: '/qr-management',
      roles: ['ADMIN', 'DEPOT_OFFICER'],
    },
    {
      label: 'Vendors',
      icon: Building2,
      path: '/vendors',
      roles: ['ADMIN'],
    },
    {
      label: 'Inspections',
      icon: ClipboardCheck,
      path: '/inspections',
      roles: ['ADMIN', 'INSPECTOR', 'DEPOT_OFFICER'],
    },
    {
      label: 'AI Predictions',
      icon: Brain,
      path: '/predictions',
      roles: ['ADMIN', 'INSPECTOR', 'DEPOT_OFFICER'],
    },
    {
      label: 'Reports',
      icon: FileText,
      path: '/reports',
      roles: ['ADMIN', 'DEPOT_OFFICER'],
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['ADMIN', 'DEPOT_OFFICER', 'INSPECTOR', 'VENDOR'],
    },
  ]

  const filteredNavigation = navigationItems.filter(item => item.roles.includes(user?.role))

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-ir-blue rounded-lg">
                <Train className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">RailTrack AI</h1>
                <p className="text-xs text-gray-500">Indian Railways</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavigation.map(item => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                          'text-sm font-medium',
                          isActive ? 'bg-ir-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                        )
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Section */}
          {user && (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar src={user.profileImage} alt={user.name} name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
