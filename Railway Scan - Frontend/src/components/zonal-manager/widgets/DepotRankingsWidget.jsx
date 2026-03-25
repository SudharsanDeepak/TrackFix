import { useState, useEffect } from 'react'
import { Award, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DepotRankingsWidget = () => {
  const navigate = useNavigate()
  const [depots, setDepots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setDepots([
          { id: 1, name: 'Depot A', score: 95.2, rank: 1, trend: 'up' },
          { id: 2, name: 'Depot B', score: 92.8, rank: 2, trend: 'up' },
          { id: 3, name: 'Depot C', score: 89.5, rank: 3, trend: 'down' },
          { id: 4, name: 'Depot D', score: 87.1, rank: 4, trend: 'same' },
        ])
      } catch (error) {
        console.error('Failed to fetch depot rankings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepots()
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

  const getRankColor = rank => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700'
      case 2:
        return 'bg-gray-100 text-gray-700'
      case 3:
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Depot Rankings
        </h3>
        <button
          onClick={() => navigate('/zonal-manager/depots')}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {depots.map(depot => (
          <button
            key={depot.id}
            onClick={() => navigate(`/zonal-manager/depots/${depot.id}`)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${getRankColor(depot.rank)}`}
              >
                {depot.rank}
              </span>
              <span className="font-medium text-gray-900">{depot.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{depot.score}</span>
              {depot.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DepotRankingsWidget
