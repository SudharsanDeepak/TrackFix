import { TrendingUp, TrendingDown } from 'lucide-react'
import { Icon, Spinner } from '../atoms'
import clsx from 'clsx'

const StatCard = ({
  icon: IconComponent,
  label,
  value,
  trend,
  trendValue,
  variant = 'blue',
  loading = false,
  className = '',
}) => {
  const variants = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  }

  const iconColors = {
    blue: 'text-ir-blue',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  }

  if (loading) {
    return (
      <div className={clsx('p-6 rounded-lg border bg-white shadow-sm', 'animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'p-6 rounded-lg border transition-all duration-200',
        'hover:shadow-md',
        variants[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {IconComponent && (
          <div className={clsx('p-3 rounded-lg', variants[variant], iconColors[variant])}>
            <Icon icon={IconComponent} size="xl" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
