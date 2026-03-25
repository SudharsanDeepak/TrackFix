import { useState, useEffect } from 'react'
import { CheckCircle, Target } from 'lucide-react'

const InspectionCompletionWidget = () => {
  const [stats, setStats] = useState({
    completed: 0,
    total: 0,
    rate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const completed = 342
        const total = 380
        setStats({
          completed,
          total,
          rate: ((completed / total) * 100).toFixed(1),
        })
      } catch (error) {
        console.error('Failed to fetch inspection completion stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
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
    <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Inspection Completion</p>
          <p className="text-3xl font-bold text-gray-900">{stats.rate}%</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Completed</span>
          <span className="font-medium text-gray-900">{stats.completed}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.rate}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Target</span>
          <span className="font-medium text-gray-900">{stats.total}</span>
        </div>
      </div>
    </div>
  )
}

export default InspectionCompletionWidget
