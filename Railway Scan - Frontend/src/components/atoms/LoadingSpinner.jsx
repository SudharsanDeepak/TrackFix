import { Loader2 } from 'lucide-react'
import { useRole } from '../../hooks/useRole'
import clsx from 'clsx'

/**
 * Loading Spinner Component
 * Accessible loading indicator with role-based color scheme
 *
 * @param {Object} props
 * @param {string} props.size - Size of spinner: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ size = 'md', className }) => {
  const { colorScheme } = useRole()

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorClass = colorScheme?.primary ? `text-${colorScheme.primary}` : 'text-ir-blue'

  return (
    <div
      className={clsx('flex items-center justify-center', className)}
      role="status"
      aria-label="Loading"
    >
      <Loader2 className={clsx(sizeClasses[size], colorClass, 'animate-spin')} aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
