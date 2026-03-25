import { useState, useEffect } from 'react'
import { Package, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const InventoryStatusWidget = () => {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setInventory({
          totalItems: 156,
          lowStock: 12,
          outOfStock: 3,
        })
      } catch (error) {
        console.error('Failed to fetch inventory status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
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
      onClick={() => navigate('/depot-officer/inventory')}
      className="w-full bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 transition-colors text-left"
    >
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Items</span>
          <span className="text-2xl font-bold text-gray-900">{inventory.totalItems}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Low Stock</p>
            <p className="text-xl font-bold text-yellow-700">{inventory.lowStock}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Out of Stock</p>
            <p className="text-xl font-bold text-red-700">{inventory.outOfStock}</p>
          </div>
        </div>

        {(inventory.lowStock > 0 || inventory.outOfStock > 0) && (
          <div className="flex items-center gap-2 text-sm text-orange-600 mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>Attention required</span>
          </div>
        )}
      </div>
    </button>
  )
}

export default InventoryStatusWidget
