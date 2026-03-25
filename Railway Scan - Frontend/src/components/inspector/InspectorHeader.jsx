import { Bell, Train } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

/**
 * Inspector Header Component
 * Mobile-optimized header for Inspector role
 * Features: App logo, user name, notification icon, keyboard accessible
 */
const InspectorHeader = () => {
  const { user } = useAuthStore()

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-ir-blue text-white z-30 shadow-md"
      role="banner"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 bg-white rounded-lg"
            aria-hidden="true"
          >
            <Train className="w-6 h-6 text-ir-blue" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RailTrack AI</h1>
            <p className="text-xs text-blue-100">Inspector</p>
          </div>
        </div>

        {/* User Info and Notifications */}
        <div className="flex items-center gap-3">
          <button
            className="relative p-2 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-label="View notifications (1 unread)"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            <span
              className="absolute top-1 right-1 w-2 h-2 bg-ir-saffron rounded-full"
              aria-hidden="true"
            ></span>
          </button>
          <div
            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            aria-label={`User: ${user?.name || 'Inspector'}`}
          >
            <span className="text-ir-blue font-semibold text-sm" aria-hidden="true">
              {user?.name?.charAt(0) || 'I'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default InspectorHeader
