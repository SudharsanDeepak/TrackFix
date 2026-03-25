import { Menu, Bell, User, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'

const DepotOfficerHeader = ({ onMenuClick }) => {
  const { user } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200" role="banner">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Menu button and breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">Depot Operations</h1>
          </div>
        </div>

        {/* Right: Notifications and user menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="View notifications (1 unread)"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span
              className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full"
              aria-hidden="true"
            ></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div
                className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-green-700 font-semibold text-sm">
                  {user?.name?.charAt(0) || 'D'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user?.name || 'Depot Officer'}
              </span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Depot Officer</p>
                  </div>
                  <a
                    href="/depot-officer/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    Profile
                  </a>
                  <button
                    onClick={() => {
                      useAuthStore.getState().logout()
                      window.location.href = '/login'
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default DepotOfficerHeader
