import { useState, useEffect } from 'react'
import { Users, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const VendorMetricsWidget = () => {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState({ total: 0, avgRating: 0, topPerformer: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setVendors({
          total: 24,
          avgRating: 4.3,
          topPerformer: 'ABC Maintenance Co.',
        })
      } catch (error) {
        console.error('Failed to fetch vendor metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => navigate('/zonal-manager/vendors')}
      className="w-full bg-white hover:bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-6 transition-colors text-left"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Vendor Performance</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Vendors</span>
          <span className="text-2xl font-bold text-gray-900">{vendors.total}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Rating</span>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-xl font-bold text-gray-900">{vendors.avgRating}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Top Performer</p>
          <p className="text-sm font-medium text-purple-600">{vendors.topPerformer}</p>
        </div>
      </div>
    </button>
  )
}

export default VendorMetricsWidget
