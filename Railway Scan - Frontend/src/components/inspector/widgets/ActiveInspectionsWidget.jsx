import { useState, useEffect } from 'react'
import { ClipboardCheck, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import inspectorService from '../../../services/inspectorService'

const ActiveInspectionsWidget = () => {
  const navigate = useNavigate()
  const [activeInspections, setActiveInspections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActiveInspections = async () => {
      try {
        const res = await inspectorService.getMyInspections({ status: 'assigned', limit: 10 })
        const items = (res && res.data) || res || []
        setActiveInspections(items)
      } catch (error) {
        console.error('Failed to fetch active inspections:', error)
        setActiveInspections([])
      } finally {
        setLoading(false)
      }
    }

    fetchActiveInspections()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
          <span className="hidden sm:inline">Active Assignments</span>
          <span className="sm:hidden">Active</span>
        </h3>
        <span className="bg-blue-100 text-blue-700 text-xs md:text-sm font-medium px-2.5 py-1 rounded-full">
          {activeInspections.length} pending
        </span>
      </div>

      {activeInspections.length === 0 ? (
        <div className="text-center py-8 md:py-12 text-gray-500">
          <ClipboardCheck className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-2 text-gray-300" />
          <p className="text-sm md:text-base">No active assignments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeInspections.map(inspection => (
            <button
              key={inspection.id}
              onClick={() => navigate(`/inspector/start-inspection?asset=${inspection.id}`)}
              className="w-full text-left bg-gray-50 hover:bg-blue-50 rounded-lg p-3 md:p-4 transition-all hover:shadow-md border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm md:text-base">{inspection.assetName}</h4>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                    inspection.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {inspection.priority}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{inspection.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  {inspection.scheduledTime}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActiveInspectionsWidget
