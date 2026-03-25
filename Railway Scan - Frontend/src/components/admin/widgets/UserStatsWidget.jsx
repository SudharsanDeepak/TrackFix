import { useState, useEffect } from 'react'
import { Users, UserCheck, UserCog, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UserStatsWidget = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    byRole: {
      INSPECTOR: 0,
      DEPOT_OFFICER: 0,
      ZONAL_MANAGER: 0,
      ADMIN: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setStats({
          total: 247,
          byRole: {
            INSPECTOR: 180,
            DEPOT_OFFICER: 45,
            ZONAL_MANAGER: 18,
            ADMIN: 4,
          },
        })
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
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
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const roleIcons = {
    INSPECTOR: UserCheck,
    DEPOT_OFFICER: UserCog,
    ZONAL_MANAGER: Users,
    ADMIN: Shield,
  }

  const roleColors = {
    INSPECTOR: 'bg-blue-50 text-blue-600',
    DEPOT_OFFICER: 'bg-green-50 text-green-600',
    ZONAL_MANAGER: 'bg-purple-50 text-purple-600',
    ADMIN: 'bg-red-50 text-red-600',
  }

  return (
    <button
      onClick={() => navigate('/admin/users')}
      className="w-full bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-red-200 p-6 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full">
          <Users className="h-8 w-8 text-red-600" />
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(stats.byRole).map(([role, count]) => {
          const Icon = roleIcons[role]
          return (
            <div key={role} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${roleColors[role]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-gray-600">
                  {role
                    .replace('_', ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          )
        })}
      </div>
    </button>
  )
}

export default UserStatsWidget
