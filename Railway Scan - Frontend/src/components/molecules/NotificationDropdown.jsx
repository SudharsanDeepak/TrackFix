import { useState, useRef, useEffect } from 'react'
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Badge, Button } from '../atoms'
import clsx from 'clsx'
import { formatRelativeTime } from '../../utils/formatters'

const NotificationDropdown = ({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onClearAll,
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getNotificationIcon = type => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const handleNotificationClick = notification => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  // Limit to 20 most recent notifications
  const displayedNotifications = notifications.slice(0, 20)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
                Clear All
              </Button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {displayedNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <ul>
                {displayedNotifications.map(notification => (
                  <li
                    key={notification.id}
                    className={clsx(
                      'px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                      !notification.read && 'bg-blue-50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={clsx(
                            'text-sm text-gray-900',
                            !notification.read && 'font-semibold'
                          )}
                        >
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              onMarkAsRead(notification.id)
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {displayedNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <span className="text-xs text-gray-500">
                Showing {displayedNotifications.length} of {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
