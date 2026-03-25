import { useEffect, useState } from 'react'
import { Clock, User, Package, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatters'
import clsx from 'clsx'

const ActivityFeed = ({ activities = [], loading = false, onRefresh }) => {
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!autoRefresh || !onRefresh) return

    const interval = setInterval(() => {
      onRefresh()
    }, 60000) // Refresh every 60 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  const getActivityIcon = type => {
    switch (type) {
      case 'inspection':
        return CheckCircle
      case 'qr_generated':
        return Package
      case 'prediction':
        return AlertTriangle
      case 'report':
        return FileText
      case 'user':
        return User
      default:
        return Clock
    }
  }

  const getActivityColor = type => {
    switch (type) {
      case 'inspection':
        return 'text-green-600 bg-green-100'
      case 'qr_generated':
        return 'text-blue-600 bg-blue-100'
      case 'prediction':
        return 'text-red-600 bg-red-100'
      case 'report':
        return 'text-purple-600 bg-purple-100'
      case 'user':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Limit to 10 most recent activities
  const displayedActivities = activities.slice(0, 10)

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        {activities.length > 10 && (
          <a
            href="/activity"
            className="text-sm text-ir-blue hover:text-blue-700 transition-colors"
          >
            View all
          </a>
        )}
      </div>

      {displayedActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map(activity => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)

            return (
              <div key={activity.id} className="flex gap-3">
                <div
                  className={clsx(
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                    colorClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
