import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, QrCode, AlertTriangle, CheckCircle, ChevronRight, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import inspectionService from '../api/inspectionService'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await inspectionService.getAll({ limit: 5, sort: '-createdAt' })
        const items = Array.isArray(res) ? res : res?.data || res?.inspections || []
        setRecent(items)
        setStats({
          total: items.length,
          completed: items.filter(i => i.status === 'COMPLETED').length,
          pending: items.filter(i => i.status === 'PENDING').length,
          inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
        })
      } catch {}
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total', value: stats.total, icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: stats.pending, icon: AlertTriangle, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'In Progress', value: stats.inProgress, icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header */}
      <div className="bg-ir-blue px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h1 className="text-white text-xl font-bold">{user?.name || 'Inspector'}</h1>
          </div>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scan Button */}
        <button
          onClick={() => navigate('/scan')}
          className="w-full bg-white text-ir-blue py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
        >
          <QrCode className="w-6 h-6" />
          Scan QR Code
        </button>
      </div>

      <div className="px-4 -mt-2">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/inspections/new')}
            className="bg-ir-blue text-white rounded-2xl p-4 text-left active:scale-95 transition-transform"
          >
            <ClipboardList className="w-6 h-6 mb-2" />
            <p className="font-semibold">New Inspection</p>
            <p className="text-xs text-blue-200">Start without QR</p>
          </button>
          <button
            onClick={() => navigate('/inspections')}
            className="bg-white text-gray-900 rounded-2xl p-4 text-left shadow-sm active:scale-95 transition-transform"
          >
            <ClipboardList className="w-6 h-6 mb-2 text-ir-blue" />
            <p className="font-semibold">My Inspections</p>
            <p className="text-xs text-gray-500">View all records</p>
          </button>
        </div>

        {/* Recent Inspections */}
        {recent.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Inspections</h2>
              <button onClick={() => navigate('/inspections')} className="text-ir-blue text-sm">See all</button>
            </div>
            {recent.map((item) => (
              <button
                key={item._id}
                onClick={() => navigate(`/inspections/${item._id}`)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 active:bg-gray-50"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">{item.assetId || 'Unknown Asset'}</p>
                  <p className="text-xs text-gray-500">{item.assetType} • {item.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{item.status}</span>
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

export default DashboardPage
