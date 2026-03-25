import { useState, useEffect } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RecentDefectsWidget = () => {
  const navigate = useNavigate()
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setDefects([
          {
            id: 1,
            assetName: 'Coach A-1234',
            severity: 'high',
            description: 'Brake system malfunction',
            reportedAt: '2 hours ago',
            inspector: 'John Doe',
          },
          {
            id: 2,
            assetName: 'Engine E-5678',
            severity: 'medium',
            description: 'Oil leak detected',
            reportedAt: '4 hours ago',
            inspector: 'Jane Smith',
          },
          {
            id: 3,
            assetName: 'Wagon W-9012',
            severity: 'low',
            description: 'Minor paint damage',
            reportedAt: '6 hours ago',
            inspector: 'Bob Johnson',
          },
        ])
      } catch (error) {
        console.error('Failed to fetch recent defects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDefects()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Recent Defects
        </h3>
        <button
          onClick={() => navigate('/depot-officer/defects')}
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {defects.map(defect => (
          <button
            key={defect.id}
            onClick={() => navigate(`/depot-officer/defects/${defect.id}`)}
            className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{defect.assetName}</h4>
                <p className="text-sm text-gray-600 mt-1">{defect.description}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${getSeverityColor(defect.severity)}`}
              >
                {defect.severity}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By {defect.inspector}</span>
              <span>{defect.reportedAt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RecentDefectsWidget
