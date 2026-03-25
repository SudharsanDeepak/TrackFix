import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DepotOfficerSidebar from '../components/depot-officer/DepotOfficerSidebar'
import DepotOfficerHeader from '../components/depot-officer/DepotOfficerHeader'
import SkipNav from '../components/atoms/SkipNav'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

/**
 * Depot Officer Layout Component
 * Desktop-optimized layout for depot operations management
 * Features: Collapsible sidebar, header with breadcrumbs, responsive design, keyboard shortcuts
 */
const DepotOfficerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Enable keyboard shortcuts for quick navigation
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip navigation for keyboard users */}
      <SkipNav />

      <DepotOfficerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <DepotOfficerHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content with semantic HTML and skip target */}
        <main id="main-content" className="p-4 lg:p-6" tabIndex="-1">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DepotOfficerLayout
