import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, Header } from '../components/organisms'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ir-blue focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={handleMenuClick} />

        {/* Page Content */}
        <main id="main-content" className="p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-4 py-6 lg:px-6 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div>
              <p>© 2024 Indian Railways. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-4">
              <span>Version 1.0.0</span>
              <a href="/help" className="text-ir-blue hover:text-blue-700 transition-colors">
                Help
              </a>
              <a href="/privacy" className="text-ir-blue hover:text-blue-700 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-ir-blue hover:text-blue-700 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
