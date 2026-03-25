import { useEffect, useState } from 'react'
import { StatCard } from '../molecules'
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const StatsGrid = ({ stats, loading = false, onRefresh }) => {
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!autoRefresh || !onRefresh) return

    const interval = setInterval(() => {
      onRefresh()
    }, 60000) // Refresh every 60 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  const defaultStats = [
    {
      id: 'total',
      label: 'Total Fittings',
      value: stats?.totalFittings || 0,
      icon: Package,
      color: 'blue',
      trend: stats?.totalFittingsTrend,
    },
    {
      id: 'active',
      label: 'Active Fittings',
      value: stats?.activeFittings || 0,
      icon: CheckCircle,
      color: 'green',
      trend: stats?.activeFittingsTrend,
    },
    {
      id: 'high-risk',
      label: 'High Risk',
      value: stats?.highRiskFittings || 0,
      icon: AlertTriangle,
      color: 'red',
      trend: stats?.highRiskTrend,
    },
    {
      id: 'warranty-expiring',
      label: 'Warranty Expiring',
      value: stats?.warrantyExpiring || 0,
      icon: Clock,
      color: 'yellow',
      trend: stats?.warrantyExpiringTrend,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultStats.map(stat => (
        <StatCard
          key={stat.id}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          loading={loading}
        />
      ))}
    </div>
  )
}

export default StatsGrid
