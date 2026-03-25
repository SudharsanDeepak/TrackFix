import { useState, useEffect } from 'react'
import { FileText, User, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ActivityLogsWidget = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setLogs([
          { id: 1, user: 'John Doe', action: 'Created inspection', time: '5 min ago' },
          { id: 2, user: 'Jane Smith', action: 'Updated QR batch', time: '12 min ago' },
          { id: 3, user: 'Bob Johnson', action: 'Approved inspection', time: '25 min ago' },
          { id: 4, user: 'Alice Brown', action: 'Generated report', time: '1 hour ago' },
        ])
      } catch (error) {
        console.error('Failed to fetch activity logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-600" />
          Recent Activity
        </h3>
        <button
          onClick={() => navigate('/admin/audit-logs')}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{log.user}</p>
              <p className="text-sm text-gray-600">{log.action}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {log.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityLogsWidget
