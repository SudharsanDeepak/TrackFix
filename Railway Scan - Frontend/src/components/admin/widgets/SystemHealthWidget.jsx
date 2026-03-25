import { useState, useEffect } from 'react'
import { Activity, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SystemHealthWidget = () => {
  const navigate = useNavigate()
  const [health, setHealth] = useState({
    status: 'healthy',
    apiResponseTime: 0,
    uptime: 0,
    services: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setHealth({
          status: 'healthy',
          apiResponseTime: 145,
          uptime: 99.8,
          services: [
            { name: 'API Server', status: 'healthy' },
            { name: 'Database', status: 'healthy' },
            { name: 'Storage', status: 'healthy' },
            { name: 'Cache', status: 'warning' },
          ],
        })
      } catch (error) {
        console.error('Failed to fetch system health:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = status => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <button
      onClick={() => navigate('/admin/system-health')}
      className="w-full bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-red-200 p-6 transition-colors text-left"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">API Response</p>
            <p className="text-xl font-bold text-gray-900">{health.apiResponseTime}ms</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Uptime</p>
            <p className="text-xl font-bold text-gray-900">{health.uptime}%</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Services</p>
          <div className="space-y-1">
            {health.services.map(service => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{service.name}</span>
                <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                  {service.status === 'healthy' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

export default SystemHealthWidget
