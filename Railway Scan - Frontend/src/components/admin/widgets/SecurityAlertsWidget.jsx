import { useState, useEffect } from 'react'
import { Shield, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SecurityAlertsWidget = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState({ total: 0, failedLogins: 0, suspiciousActivity: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setAlerts({ total: 7, failedLogins: 5, suspiciousActivity: 2 })
      } catch (error) {
        console.error('Failed to fetch security alerts:', error)
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
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => navigate('/admin/audit-logs?filter=security')}
      className="w-full bg-white hover:bg-red-50 rounded-lg shadow-sm border border-red-200 p-6 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Security Alerts</p>
          <p className="text-3xl font-bold text-gray-900">{alerts.total}</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
      </div>

      {alerts.total > 0 && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Failed logins</span>
            <span className="font-medium text-gray-900">{alerts.failedLogins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Suspicious activity</span>
            <span className="font-medium text-gray-900">{alerts.suspiciousActivity}</span>
          </div>
        </div>
      )}
    </button>
  )
}

export default SecurityAlertsWidget
