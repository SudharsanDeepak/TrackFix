import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ZonalManagerSidebar from '../components/zonal-manager/ZonalManagerSidebar'
import ZonalManagerHeader from '../components/zonal-manager/ZonalManagerHeader'
import SkipNav from '../components/atoms/SkipNav'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

/**
 * Zonal Manager Layout Component
 * Desktop-optimized layout for zone-wide analytics and oversight
 * Features: Collapsible sidebar, header with breadcrumbs, responsive design, keyboard shortcuts
 */
const ZonalManagerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Enable keyboard shortcuts for quick navigation
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip navigation for keyboard users */}
      <SkipNav />

      <ZonalManagerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <ZonalManagerHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content with semantic HTML and skip target */}
        <main id="main-content" className="p-4 lg:p-6" tabIndex="-1">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default ZonalManagerLayout
