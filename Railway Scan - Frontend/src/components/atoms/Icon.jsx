import clsx from 'clsx'

const Icon = ({
  icon: IconComponent,
  size = 'md',
  color = 'current',
  className = '',
  label,
  ...props
}) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  }

  const colors = {
    current: 'text-current',
    blue: 'text-ir-blue',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-500',
    white: 'text-white',
  }

  return (
    <IconComponent
      className={clsx(sizes[size], colors[color], className)}
      aria-label={label}
      aria-hidden={!label}
      {...props}
    />
  )
}

export default Icon
