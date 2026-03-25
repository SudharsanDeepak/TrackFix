import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const Spinner = ({ size = 'md', color = 'blue', variant = 'inline', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const colors = {
    blue: 'text-ir-blue',
    white: 'text-white',
    gray: 'text-gray-500',
    green: 'text-green-600',
    red: 'text-red-600',
  }

  const variants = {
    inline: 'inline-block',
    block: 'flex items-center justify-center w-full py-8',
  }

  const spinner = (
    <Loader2
      className={clsx('animate-spin', sizes[size], colors[color], className)}
      aria-label="Loading"
      role="status"
    />
  )

  if (variant === 'block') {
    return <div className={variants[variant]}>{spinner}</div>
  }

  return spinner
}

export default Spinner
