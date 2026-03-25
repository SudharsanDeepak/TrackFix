import { Outlet } from 'react-router-dom'
import InspectorHeader from '../components/inspector/InspectorHeader'
import InspectorBottomNav from '../components/inspector/InspectorBottomNav'
import SkipNav from '../components/atoms/SkipNav'

/**
 * Inspector Layout Component
 * Mobile-first layout optimized for field inspectors
 * Features: Fixed header, bottom navigation, mobile-optimized spacing, keyboard accessibility
 */
const InspectorLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip navigation for keyboard users */}
      <SkipNav />

      {/* Mobile header - Fixed at top */}
      <InspectorHeader />

      {/* Main content with proper spacing for fixed header and bottom nav */}
      <main 
        id="main-content" 
        className="container mx-auto px-4 py-4 md:py-6 lg:py-8 max-w-7xl pt-20 pb-20 md:pb-6" 
        tabIndex="-1"
      >
        {children || <Outlet />}
      </main>

      {/* Bottom navigation for mobile - Fixed at bottom */}
      <InspectorBottomNav />
    </div>
  )
}

export default InspectorLayout
