import { useState, useEffect } from 'react'
import { useRealtimeInspections, useRealtimeFittings } from '../../../hooks/useRealtime'
import { BarChart3, TrendingUp } from 'lucide-react'

const SystemWideStatsWidget = () => {
  const [stats, setStats] = useState({
    totalInspections: 0,
    totalDefects: 0,
    totalQRCodes: 0,
    activeZones: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setStats({
          totalInspections: 15847,
          totalDefects: 892,
          totalQRCodes: 8934,
          activeZones: 12,
        })
      } catch (error) {
        console.error('Failed to fetch system-wide stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Update stats in real-time when inspections or fittings change
  useRealtimeInspections((update) => {
    if (update.type === 'CREATED') {
      setStats(prev => ({ ...prev, totalInspections: prev.totalInspections + 1 }))
    } else if (update.type === 'FAILED') {
      setStats(prev => ({ ...prev, totalDefects: prev.totalDefects + 1 }))
    }
  })

  useRealtimeFittings((update) => {
    if (update.type === 'STATUS_CHANGED') {
      // If a fitting becomes DEFECTIVE, increment defects
      if (update.data.newStatus === 'DEFECTIVE') {
        setStats(prev => ({ ...prev, totalDefects: prev.totalDefects + 1 }))
      }
    }
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statItems = [
    { label: 'Total Inspections', value: stats.totalInspections, color: 'blue' },
    { label: 'Total Defects', value: stats.totalDefects, color: 'orange' },
    { label: 'QR Codes Generated', value: stats.totalQRCodes, color: 'green' },
    { label: 'Active Zones', value: stats.activeZones, color: 'purple' },
  ]

  const getColorClasses = color => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      orange: 'bg-orange-50 text-orange-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">System-Wide Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map(item => (
          <div key={item.label} className={`rounded-lg p-4 ${getColorClasses(item.color)}`}>
            <p className="text-xs mb-1 opacity-80">{item.label}</p>
            <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SystemWideStatsWidget
