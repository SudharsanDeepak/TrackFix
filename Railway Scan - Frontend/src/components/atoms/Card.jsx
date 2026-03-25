import clsx from 'clsx'
import { useRole } from '../../hooks/useRole'

/**
 * Role-aware Card Component
 * Container component with role-based border colors and styling
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} props.highlight - Apply emphasized styling with role-specific border
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Optional click handler (makes card interactive)
 * @param {string} props.padding - Padding size: 'none', 'sm', 'md', 'lg' (default: 'md')
 */
const Card = ({
  children,
  highlight = false,
  className = '',
  onClick,
  padding = 'md',
  ...props
}) => {
  const { colorScheme } = useRole()

  const baseStyles = 'bg-white rounded-lg shadow-sm transition-all duration-200'

  // Role-based border color for highlighted cards
  const getBorderColor = () => {
    if (!highlight) return 'border border-gray-200'

    const primary = colorScheme?.primary || 'blue-600'
    return `border-2 border-${primary}`
  }

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''

  return (
    <div
      className={clsx(
        baseStyles,
        getBorderColor(),
        paddingStyles[padding],
        interactiveStyles,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
