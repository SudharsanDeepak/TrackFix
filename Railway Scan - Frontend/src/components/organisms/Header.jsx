import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, ChevronRight } from 'lucide-react'
import { SearchBar, NotificationDropdown, UserMenu } from '../molecules'
import clsx from 'clsx'

const Header = ({ onMenuClick }) => {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Mock notifications - in real app, fetch from API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Warranty Expiring Soon',
      message: '15 fittings have warranties expiring in 30 days',
      createdAt: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: 2,
      type: 'error',
      title: 'High Risk Fitting Detected',
      message: 'QR-2024-001234 has a risk score of 85',
      createdAt: new Date(Date.now() - 7200000),
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Inspection Completed',
      message: 'Batch #1234 inspection completed successfully',
      createdAt: new Date(Date.now() - 86400000),
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = id => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleSearch = async query => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    // TODO: Implement actual search API call
    setTimeout(() => {
      setSearchResults([])
      setIsSearching(false)
    }, 500)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Home', path: '/dashboard' }]

    paths.forEach((path, index) => {
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      const fullPath = '/' + paths.slice(0, index + 1).join('/')
      breadcrumbs.push({ label, path: fullPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Breadcrumbs - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-sm font-medium text-gray-900">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:block flex-1 max-w-md mx-4">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search fittings, vendors, reports..."
            resultCount={searchResults.length}
            loading={isSearching}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAll}
          />
          <UserMenu />
        </div>
      </div>

      {/* Mobile Search - Below header */}
      <div className="lg:hidden px-4 pb-3">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          onClear={handleClearSearch}
          placeholder="Search..."
          resultCount={searchResults.length}
          loading={isSearching}
        />
      </div>
    </header>
  )
}

export default Header
