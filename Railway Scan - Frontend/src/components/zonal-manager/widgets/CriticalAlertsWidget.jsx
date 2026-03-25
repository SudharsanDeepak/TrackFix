import { useState, useEffect } from 'react'
import { AlertCircle, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CriticalAlertsWidget = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setAlerts([
          {
            id: 1,
            title: 'High defect rate at Depot C',
            severity: 'high',
            time: '15 min ago',
          },
          {
            id: 2,
            title: 'Inspection backlog at Depot A',
            severity: 'medium',
            time: '1 hour ago',
          },
          {
            id: 3,
            title: 'Vendor performance below threshold',
            severity: 'medium',
            time: '2 hours ago',
          },
        ])
      } catch (error) {
        console.error('Failed to fetch critical alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-600" />
          Critical Alerts
        </h3>
        <button
          onClick={() => navigate('/zonal-manager/alerts')}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View All
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No critical alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <button
              key={alert.id}
              onClick={() => navigate(`/zonal-manager/alerts/${alert.id}`)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-sm">{alert.title}</p>
                <span className="text-xs">{alert.time}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CriticalAlertsWidget
