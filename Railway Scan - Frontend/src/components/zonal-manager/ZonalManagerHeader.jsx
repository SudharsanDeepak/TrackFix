import { Menu, Bell, User, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'

const ZonalManagerHeader = ({ onMenuClick }) => {
  const { user } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Menu button and breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">Zone Management</h1>
          </div>
        </div>

        {/* Right: Notifications and user menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-semibold text-sm">
                  {user?.name?.charAt(0) || 'Z'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user?.name || 'Zonal Manager'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Zonal Manager</p>
                  </div>
                  <a
                    href="/zonal-manager/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <button
                    onClick={() => {
                      useAuthStore.getState().logout()
                      window.location.href = '/login'
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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

export default ZonalManagerHeader
