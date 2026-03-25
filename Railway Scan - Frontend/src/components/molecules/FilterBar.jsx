import { X } from 'lucide-react'
import { Badge, Button } from '../atoms'
import clsx from 'clsx'

const FilterBar = ({
  filters = {},
  onFilterChange,
  onClearFilter,
  onClearAll,
  filterConfig = [],
  className = '',
}) => {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value !== '' && value !== null && value !== undefined
  )

  const getFilterLabel = key => {
    const config = filterConfig.find(f => f.key === key)
    return config?.label || key
  }

  const getFilterDisplayValue = (key, value) => {
    const config = filterConfig.find(f => f.key === key)
    if (config?.options) {
      const option = config.options.find(opt => opt.value === value)
      return option?.label || value
    }
    return value
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {filterConfig.map(config => (
          <div key={config.key} className="flex-1 min-w-[200px]">
            {config.component}
          </div>
        ))}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">
            Active Filters ({activeFilters.length}):
          </span>
          {activeFilters.map(([key, value]) => (
            <Badge key={key} variant="blue" className="flex items-center gap-1.5 pr-1">
              <span className="text-xs">
                {getFilterLabel(key)}: {getFilterDisplayValue(key, value)}
              </span>
              <button
                onClick={() => onClearFilter(key)}
                className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${getFilterLabel(key)} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

export default FilterBar
