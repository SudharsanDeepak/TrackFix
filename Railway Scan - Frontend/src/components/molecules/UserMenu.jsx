import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { Avatar, Badge } from '../atoms'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = event => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  const handleProfile = () => {
    navigate('/profile')
    setIsOpen(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setIsOpen(false)
  }

  const getRoleBadgeVariant = role => {
    switch (role) {
      case 'ADMIN':
        return 'red'
      case 'DEPOT_OFFICER':
        return 'blue'
      case 'INSPECTOR':
        return 'green'
      case 'VENDOR':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const formatRole = role => {
    return role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <Avatar src={user.profileImage} alt={user.name} name={user.name} size="sm" />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <ChevronDown
          className={clsx(
            'h-4 w-4 text-gray-500 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar src={user.profileImage} alt={user.name} name={user.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
