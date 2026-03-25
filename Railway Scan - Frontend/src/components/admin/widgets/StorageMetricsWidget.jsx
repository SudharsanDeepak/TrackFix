import { useState, useEffect } from 'react'
import { Database, HardDrive } from 'lucide-react'

const StorageMetricsWidget = () => {
  const [storage, setStorage] = useState({
    database: { used: 0, total: 0 },
    files: { used: 0, total: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setStorage({
          database: { used: 12.4, total: 50 },
          files: { used: 28.7, total: 100 },
        })
      } catch (error) {
        console.error('Failed to fetch storage metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStorage()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const calculatePercentage = (used, total) => {
    return total > 0 ? ((used / total) * 100).toFixed(1) : 0
  }

  const storageItems = [
    {
      icon: Database,
      label: 'Database',
      data: storage.database,
      color: 'red',
    },
    {
      icon: HardDrive,
      label: 'File Storage',
      data: storage.files,
      color: 'blue',
    },
  ]

  const getColorClasses = color => {
    const colors = {
      red: 'bg-red-600',
      blue: 'bg-blue-600',
    }
    return colors[color] || colors.red
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Storage Utilization</h3>
      </div>

      <div className="space-y-4">
        {storageItems.map(item => {
          const Icon = item.icon
          const percentage = calculatePercentage(item.data.used, item.data.total)

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.data.used} GB / {item.data.total} GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getColorClasses(item.color)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{percentage}% used</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StorageMetricsWidget
