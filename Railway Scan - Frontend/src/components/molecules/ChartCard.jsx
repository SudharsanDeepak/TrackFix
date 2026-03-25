import { Spinner } from '../atoms'
import clsx from 'clsx'

const ChartCard = ({
  title,
  children,
  loading = false,
  error,
  emptyMessage = 'No data available',
  className = '',
  headerAction,
}) => {
  if (loading) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load chart</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = !children

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  )
}

export default ChartCard
