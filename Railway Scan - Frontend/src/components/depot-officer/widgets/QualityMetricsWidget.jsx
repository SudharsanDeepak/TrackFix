import { useState, useEffect } from 'react'
import { Award, TrendingUp, TrendingDown } from 'lucide-react'

const QualityMetricsWidget = () => {
  const [metrics, setMetrics] = useState({
    qualityScore: 0,
    passRate: 0,
    trend: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setMetrics({
          qualityScore: 92.5,
          passRate: 94.8,
          trend: 2.3,
        })
      } catch (error) {
        console.error('Failed to fetch quality metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const TrendIcon = metrics.trend >= 0 ? TrendingUp : TrendingDown
  const trendColor = metrics.trend >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Quality Metrics</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Quality Score</span>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{Math.abs(metrics.trend)}%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{metrics.qualityScore}</span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.qualityScore}%` }}
            ></div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pass Rate (This Week)</span>
            <span className="text-xl font-bold text-gray-900">{metrics.passRate}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QualityMetricsWidget
