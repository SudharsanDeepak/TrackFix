import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PendingDefectsWidget = () => {
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const fetchPendingDefects = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setPendingCount(3)
      } catch (error) {
        console.error('Failed to fetch pending defects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingDefects()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => navigate('/inspector/defects')}
      className="w-full bg-white hover:bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-medium text-gray-700">Pending Defects</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
          <p className="text-sm text-gray-600 mt-1">Awaiting resolution</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
        </div>
      </div>
    </button>
  )
}

export default PendingDefectsWidget
