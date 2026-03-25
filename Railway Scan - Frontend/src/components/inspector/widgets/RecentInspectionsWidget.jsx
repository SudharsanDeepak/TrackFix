import { useState, useEffect } from 'react'
import { History, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { inspectionService } from '../../../api/services'
import { useAuthStore } from '../../../store/authStore'

const RecentInspectionsWidget = ({ limit = 10 }) => {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const [recentInspections, setRecentInspections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setLoading(false)
      return
    }

    const fetchRecentInspections = async () => {
      try {
        const data = await inspectionService.getMyInspections({
          limit,
          sort: '-createdAt', // Most recent first
        })

        // The API returns the inspections array directly in the data field
        const inspectionsList = Array.isArray(data) ? data : []

        // Transform API response
        const transformedData = inspectionsList.map(inspection => ({
          id: inspection._id || inspection.id,
          assetName: `${inspection.assetId} - ${inspection.assetType}`,
          completedAt: getRelativeTime(inspection.createdAt || inspection.date),
          status: inspection.status,
          defectsFound: inspection.defectsCount || 0,
        }))

        setRecentInspections(transformedData)
      } catch (error) {
        console.error('Failed to fetch recent inspections:', error)
        // Don't show error toast for 401 during initial load
        if (error.response?.status !== 401) {
          setRecentInspections([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecentInspections()
  }, [limit, user])

  // Helper function to get relative time
  const getRelativeTime = dateString => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          Recent Inspections
        </h3>
        <button
          onClick={() => navigate('/inspector/inspections')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>
      </div>

      {recentInspections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No recent inspections</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentInspections.map(inspection => (
            <button
              key={inspection.id}
              onClick={() => navigate(`/inspector/inspections/${inspection.id}`)}
              className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(inspection.status)}
                  <span className="font-medium text-gray-900">{inspection.assetName}</span>
                </div>
                <span className="text-xs text-gray-500">{inspection.completedAt}</span>
              </div>
              {inspection.defectsFound > 0 && (
                <div className="text-sm text-orange-600 ml-7">
                  {inspection.defectsFound} defect{inspection.defectsFound > 1 ? 's' : ''} found
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentInspectionsWidget
