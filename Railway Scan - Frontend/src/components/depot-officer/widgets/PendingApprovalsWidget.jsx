import { useState, useEffect } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PendingApprovalsWidget = () => {
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)
  const [urgentCount, setUrgentCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setPendingCount(23)
        setUrgentCount(5)
      } catch (error) {
        console.error('Failed to fetch pending approvals:', error)
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
    <button
      onClick={() => navigate('/depot-officer/inspections?filter=pending-approval')}
      className="w-full bg-white hover:bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-yellow-100 p-3 rounded-full">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
      </div>

      {urgentCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-orange-600">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">{urgentCount} urgent</span>
        </div>
      )}
    </button>
  )
}

export default PendingApprovalsWidget
