import { User } from 'lucide-react'
import clsx from 'clsx'

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
  className = '',
}) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  }

  // Get initials from name
  const getInitials = name => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className={clsx('relative inline-block', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden bg-gray-200 flex items-center justify-center font-medium text-gray-600',
          sizes[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'User avatar'}
            className="h-full w-full object-cover"
          />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <User className="h-1/2 w-1/2" />
        )}
      </div>

      {showOnlineStatus && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusSizes[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}

export default Avatar
