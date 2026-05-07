import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { StatsGrid, ChartSection, ActivityFeed } from '../components/organisms'
import apiClient from '../api/client'

const DashboardPage = () => {
  const user = useAuthStore(state => state.user)
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const overviewRes = await apiClient.get('/dashboard/overview')
        const aiRes = await apiClient.get('/dashboard/ai-summary')

        // `apiClient` returns ResponseFormatter payload directly
        setStats(overviewRes.data || overviewRes || {})
        setChartData({ vendorPerformance: aiRes || [] })
        setActivities([]) // Activities should come from real event feed / activity API
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setStats(null)
        setChartData(null)
        setActivities([])
      } finally {
        setLoading(false)
      }
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
