import { Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { useRole } from '../../hooks/useRole'

/**
 * Role-aware Button Component
 * Applies role-specific color schemes while maintaining consistent variants
 * Ensures touch-friendly sizing for mobile roles (Inspector)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'outline', 'danger', 'ghost'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.type - Button type attribute
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  const { colorScheme, isInspector } = useRole()

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // Role-based color variants
  const getRoleVariants = () => {
    const primary = colorScheme?.primary || 'blue-600'
    const secondary = colorScheme?.secondary || 'blue-100'

    return {
      primary: `bg-${primary} text-white hover:opacity-90 focus:ring-${primary} shadow-sm`,
      secondary: `bg-${secondary} text-gray-900 hover:opacity-90 focus:ring-${primary}`,
      outline: `border-2 border-${primary} text-${primary} hover:bg-${secondary} focus:ring-${primary}`,
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    }
  }

  const variants = getRoleVariants()

  // Touch-friendly sizing for Inspector (mobile role)
  const sizes = {
    sm: isInspector ? 'px-3 py-2 text-sm min-h-[44px]' : 'px-3 py-2 text-sm min-h-[36px]',
    md: isInspector ? 'px-4 py-3 text-base min-h-[48px]' : 'px-4 py-2.5 text-base min-h-[44px]',
    lg: isInspector ? 'px-6 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg min-h-[48px]',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Button
