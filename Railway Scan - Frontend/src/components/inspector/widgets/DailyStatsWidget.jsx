import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle, Clock } from 'lucide-react'
import inspectorService from '../../../services/inspectorService'

const DailyStatsWidget = () => {
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    target: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        const res = await inspectorService.getDailyStats()
        const payload = (res && res.data) || res || {}
        setStats({
          completed: payload.completed || 0,
          pending: payload.pending || 0,
          target: payload.target || 0,
        })
      } catch (error) {
        console.error('Failed to fetch daily stats:', error)
        setStats({ completed: 0, pending: 0, target: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchDailyStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const completionPercentage = stats.target > 0 ? (stats.completed / stats.target) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">Today's Progress</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <span className="text-xs md:text-sm text-gray-600">Completed</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
            <span className="text-xs md:text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.pending}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm md:text-base mb-2">
          <span className="text-gray-600">Daily Target</span>
          <span className="font-medium text-gray-900">
            {stats.completed} / {stats.target}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
          <div
            className="bg-blue-600 h-2 md:h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs md:text-sm text-gray-500 mt-1 text-right">
          {completionPercentage.toFixed(0)}% complete
        </p>
      </div>
    </div>
  )
}

export default DailyStatsWidget
