import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ChevronRight, Search } from 'lucide-react'
import inspectionService from '../api/inspectionService'

const statusColor = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
}

const InspectionsPage = () => {
  const navigate = useNavigate()
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await inspectionService.getAll({ sort: '-createdAt' })
        const items = Array.isArray(res) ? res : res?.data || res?.inspections || []
        setInspections(items)
      } catch {} finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = inspections.filter(i =>
    i.assetId?.toLowerCase().includes(search.toLowerCase()) ||
    i.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/')} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">My Inspections</h1>
          <button onClick={() => navigate('/inspections/new')} className="w-9 h-9 bg-ir-blue rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No inspections found</p>
            <p className="text-sm mt-1">Start a new inspection to get going</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <button
                key={item._id}
                onClick={() => navigate(`/inspections/${item._id}`)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-95 transition-transform text-left"
              >
                <div>
                  <p className="font-semibold text-gray-900">{item.assetId || 'Unknown Asset'}</p>
                  <p className="text-sm text-gray-500">{item.assetType} • {item.location}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[item.status] || 'bg-gray-100 text-gray-600'}`}>
                    {item.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InspectionsPage
