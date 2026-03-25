import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { StatsGrid, ChartSection, ActivityFeed } from '../components/organisms'

const DashboardPage = () => {
  const user = useAuthStore(state => state.user)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setStats({
          totalFittings: 12458,
          totalFittingsTrend: { direction: 'up', value: '+12%' },
          activeFittings: 11234,
          activeFittingsTrend: { direction: 'up', value: '+5%' },
          highRiskFittings: 156,
          highRiskTrend: { direction: 'down', value: '-8%' },
          warrantyExpiring: 89,
          warrantyExpiringTrend: { direction: 'up', value: '+3%' },
        })

        setChartData({
          vendorPerformance: [
            { name: 'Vendor A', score: 85 },
            { name: 'Vendor B', score: 92 },
            { name: 'Vendor C', score: 78 },
            { name: 'Vendor D', score: 88 },
            { name: 'Vendor E', score: 95 },
          ],
          zoneFailures: [
            { name: 'Central', value: 45 },
            { name: 'Western', value: 32 },
            { name: 'Eastern', value: 28 },
            { name: 'Northern', value: 38 },
            { name: 'Southern', value: 25 },
          ],
          warrantyTimeline: [
            { month: 'Jan', expiring: 12, expired: 5 },
            { month: 'Feb', expiring: 15, expired: 8 },
            { month: 'Mar', expiring: 18, expired: 6 },
            { month: 'Apr', expiring: 22, expired: 10 },
            { month: 'May', expiring: 19, expired: 7 },
            { month: 'Jun', expiring: 25, expired: 12 },
          ],
        })

        setActivities([
          {
            id: 1,
            type: 'inspection',
            user: 'John Doe',
            action: 'completed inspection',
            description: 'Batch #1234 - 50 fittings inspected',
            timestamp: new Date(Date.now() - 1800000),
          },
          {
            id: 2,
            type: 'qr_generated',
            user: 'Jane Smith',
            action: 'generated QR codes',
            description: '100 new QR codes for Central Zone',
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: 3,
            type: 'prediction',
            user: 'AI System',
            action: 'detected high-risk fitting',
            description: 'QR-2024-001234 has risk score of 85',
            timestamp: new Date(Date.now() - 7200000),
          },
          {
            id: 4,
            type: 'report',
            user: 'Admin User',
            action: 'generated vendor ranking report',
            description: 'Q1 2024 Performance Report',
            timestamp: new Date(Date.now() - 10800000),
          },
          {
            id: 5,
            type: 'user',
            user: 'Mike Johnson',
            action: 'updated vendor information',
            description: 'Vendor ABC Ltd. contact details updated',
            timestamp: new Date(Date.now() - 14400000),
          },
        ])

        setLoading(false)
      }, 1000)
    }

    fetchDashboardData()
  }, [])

  const handleRefreshStats = () => {
    // In real app, refetch stats from API
    console.log('Refreshing stats...')
  }

  const handleRefreshActivities = () => {
    // In real app, refetch activities from API
    console.log('Refreshing activities...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your railway track fitting system
        </p>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} loading={loading} onRefresh={handleRefreshStats} />

      {/* Charts Section */}
      <ChartSection chartData={chartData} loading={loading} />

      {/* Activity Feed */}
      <ActivityFeed activities={activities} loading={loading} onRefresh={handleRefreshActivities} />
    </div>
  )
}

export default DashboardPage
