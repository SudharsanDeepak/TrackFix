import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'

const ZoneTrendsWidget = () => {
  const [trends, setTrends] = useState({
    inspections: { current: 0, change: 0 },
    defects: { current: 0, change: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setTrends({
          inspections: { current: 2847, change: 12.5 },
          defects: { current: 143, change: -8.3 },
        })
      } catch (error) {
        console.error('Failed to fetch zone trends:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Zone Trends (30 Days)</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Inspections</span>
            <div
              className={`flex items-center gap-1 ${trends.inspections.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">{Math.abs(trends.inspections.change)}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {trends.inspections.current.toLocaleString()}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Defects Reported</span>
            <div
              className={`flex items-center gap-1 ${trends.defects.change >= 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">{Math.abs(trends.defects.change)}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {trends.defects.current.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ZoneTrendsWidget
