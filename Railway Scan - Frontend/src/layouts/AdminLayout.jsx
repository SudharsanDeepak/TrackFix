import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'
import SkipNav from '../components/atoms/SkipNav'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

/**
 * Administrator Layout Component
 * Desktop-optimized layout for system administration
 * Features: Collapsible sidebar, header with breadcrumbs, responsive design, keyboard shortcuts
 */
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Enable keyboard shortcuts for quick navigation
  useKeyboardShortcuts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip navigation for keyboard users */}
      <SkipNav />

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content with semantic HTML and skip target */}
        <main id="main-content" className="p-4 lg:p-6" tabIndex="-1">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
