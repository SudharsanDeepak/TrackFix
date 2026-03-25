import { useState, useEffect } from 'react'
import { QrCode, TrendingUp } from 'lucide-react'

const QRGenerationStatsWidget = () => {
  const [stats, setStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    percentageChange: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setStats({
          thisMonth: 1247,
          lastMonth: 1089,
          percentageChange: 14.5,
        })
      } catch (error) {
        console.error('Failed to fetch QR generation stats:', error)
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
          <p className="text-sm text-gray-600 mb-1">QR Codes Generated</p>
          <p className="text-3xl font-bold text-gray-900">{stats.thisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <QrCode className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div
          className={`flex items-center gap-1 ${stats.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">{Math.abs(stats.percentageChange)}%</span>
        </div>
        <span className="text-gray-600">vs last month</span>
      </div>
    </div>
  )
}

export default QRGenerationStatsWidget
