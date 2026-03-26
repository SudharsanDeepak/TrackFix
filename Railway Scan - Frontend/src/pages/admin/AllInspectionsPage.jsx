import { useState, useEffect, useCallback } from 'react'
import { Search, Download, Eye, MapPin, Calendar, User, X, RefreshCw } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import adminService from '../../services/adminService'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

const statusBadge = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const formatDate = d => d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : 'N/A'

const AllInspectionsPage = () => {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInspection, setSelectedInspection] = useState(null)

  const fetchInspections = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await adminService.getAllInspections(params)
      const items = Array.isArray(res) ? res : res?.data || res?.inspections || []
      setInspections(items)
    } catch (err) {
      toast.error('Failed to load inspections')
      setInspections([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchInspections() }, [fetchInspections])

  const filtered = inspections.filter(i => {
    const q = searchQuery.toLowerCase()
    return !q || (i.assetId || '').toLowerCase().includes(q) || (i.location || '').toLowerCase().includes(q) || (i.inspector?.name || '').toLowerCase().includes(q)
  })

  const columns = [
    { key: '_id', label: 'ID', render: v => <span className="font-mono text-xs">{(v || '').slice(-8)}</span> },
    {
      key: 'assetId', label: 'Asset',
      render: (v, row) => <div><p className="font-medium">{v || '—'}</p><p className="text-xs text-gray-500 capitalize">{row.assetType || ''}</p></div>
    },
    {
      key: 'location', label: 'Location',
      render: v => <div className="flex items-start gap-1"><MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" /><span className="text-sm">{v || '—'}</span></div>
    },
    {
      key: 'inspector', label: 'Inspector',
      render: (v, row) => <span className="text-sm">{v?.name || row.inspectorName || '—'}</span>
    },
    {
      key: 'status', label: 'Status',
      render: v => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusBadge[v] || 'bg-gray-100 text-gray-700'}`}>{v || '—'}</span>
    },
    { key: 'createdAt', label: 'Date', render: v => <span className="text-sm text-gray-600">{formatDate(v)}</span> },
    {
      key: 'actions', label: '',
      render: (_, row) => <button onClick={() => setSelectedInspection(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="h-4 w-4" /></button>
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Inspections</h1>
          <p className="text-sm text-gray-600 mt-1">System-wide inspection data across all zones and depots</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInspections} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw className="h-5 w-5" /></button>
          <Button onClick={() => toast('Export coming soon')} className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"><Download className="h-5 w-5" /> Export</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: inspections.length, color: 'text-gray-900' },
          { label: 'Completed', value: inspections.filter(i => i.status === 'COMPLETED').length, color: 'text-green-600' },
          { label: 'In Progress', value: inspections.filter(i => i.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
          { label: 'Pending', value: inspections.filter(i => i.status === 'PENDING').length, color: 'text-yellow-600' },
          { label: 'Rejected', value: inspections.filter(i => i.status === 'REJECTED').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search by asset, location, inspector..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Showing {filtered.length} of {inspections.length} inspections</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} emptyMessage="No inspections found" />
      </div>

      {/* Detail Panel */}
      {selectedInspection && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedInspection(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[560px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Inspection Details</h2>
              <button onClick={() => setSelectedInspection(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${statusBadge[selectedInspection.status] || 'bg-gray-100'}`}>{selectedInspection.status}</span>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Asset</h3>
                <p><span className="text-gray-500 text-sm">ID:</span> <span className="font-mono">{selectedInspection.assetId || '—'}</span></p>
                <p><span className="text-gray-500 text-sm">Type:</span> {selectedInspection.assetType || '—'}</p>
                {selectedInspection.location && <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" />{selectedInspection.location}</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Inspector</h3>
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{selectedInspection.inspector?.name || selectedInspection.inspectorName || '—'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Date</p>
                <p className="flex items-center gap-2 mt-1"><Calendar className="h-4 w-4 text-gray-400" />{formatDate(selectedInspection.createdAt)}</p>
              </div>

              {selectedInspection.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Notes</h3>
                  <p className="text-gray-700">{selectedInspection.notes}</p>
                </div>
              )}

              {selectedInspection.images?.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Photos ({selectedInspection.images.length})</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedInspection.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AllInspectionsPage
