import { useState, useEffect, useCallback } from 'react'
import {
  Search, Download, CheckCircle, XCircle, Clock, Eye, X,
  ChevronRight, MapPin, User, FileText,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import depotOfficerService from '../../services/depotOfficerService'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
]

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

const statusBadge = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
}

const formatDate = d => d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : 'N/A'

const InspectionsPage = () => {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [approving, setApproving] = useState(false)

  const fetchInspections = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchQuery.trim()) params.search = searchQuery
      const res = await depotOfficerService.getDepotInspections(params)
      const items = Array.isArray(res) ? res : res?.data || res?.inspections || []
      setInspections(items)
    } catch (err) {
      toast.error('Failed to load inspections')
      setInspections([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => { fetchInspections() }, [fetchInspections])

  const filtered = inspections.filter(i => {
    if (dateFilter === 'all') return true
    const d = new Date(i.inspectionDate || i.createdAt)
    const now = new Date()
    if (dateFilter === 'today') return d.toDateString() === now.toDateString()
    if (dateFilter === 'week') return (now - d) < 7 * 86400000
    if (dateFilter === 'month') return (now - d) < 30 * 86400000
    return true
  })

  const handleApprove = async () => {
    if (!selectedInspection) return
    setApproving(true)
    try {
      await depotOfficerService.approveInspection(selectedInspection._id || selectedInspection.id, { comments: 'Approved' })
      toast.success('Inspection approved')
      setSelectedInspection(null)
      fetchInspections()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    } finally { setApproving(false) }
  }

  const handleReject = async () => {
    if (!selectedInspection) return
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    setApproving(true)
    try {
      await depotOfficerService.rejectInspection(selectedInspection._id || selectedInspection.id, { reason })
      toast.success('Inspection rejected')
      setSelectedInspection(null)
      fetchInspections()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    } finally { setApproving(false) }
  }

  const columns = [
    { key: '_id', label: 'ID', render: v => <span className="font-mono text-xs">{(v || '').slice(-8)}</span> },
    { key: 'assetId', label: 'Asset ID', render: v => <span className="font-mono">{v || '—'}</span> },
    { key: 'assetType', label: 'Type', render: v => <span className="capitalize">{v || '—'}</span> },
    { key: 'location', label: 'Location' },
    {
      key: 'inspector', label: 'Inspector',
      render: (v, row) => row.inspector?.name || row.inspectorName || '—'
    },
    {
      key: 'status', label: 'Status',
      render: v => <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge[v] || 'bg-gray-100 text-gray-700'}`}>{v}</span>
    },
    { key: 'inspectionDate', label: 'Date', render: v => formatDate(v || '') },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <Button onClick={() => setSelectedInspection(row)} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 flex items-center gap-1">
          <Eye className="h-4 w-4" /> View
        </Button>
      )
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depot Inspections</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage all depot inspections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: inspections.length, color: 'text-gray-900' },
          { label: 'Pending', value: inspections.filter(i => i.status === 'PENDING').length, color: 'text-yellow-600' },
          { label: 'Approved', value: inspections.filter(i => i.status === 'APPROVED').length, color: 'text-green-600' },
          { label: 'In Progress', value: inspections.filter(i => i.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search by asset, location, inspector..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} className="w-full" />
          <Select value={dateFilter} onChange={e => setDateFilter(e.target.value)} options={dateOptions} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Showing {filtered.length} of {inspections.length} inspections</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} emptyMessage="No inspections found" />
      </div>

      {/* Side Panel */}
      {selectedInspection && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedInspection(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Inspection Details</h2>
                <p className="text-sm text-gray-600 font-mono">{(selectedInspection._id || selectedInspection.id || '').slice(-12)}</p>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${statusBadge[selectedInspection.status] || 'bg-gray-100'}`}>{selectedInspection.status}</span>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Asset</h3>
                <p><span className="text-gray-500 text-sm">ID:</span> <span className="font-mono">{selectedInspection.assetId || '—'}</span></p>
                <p><span className="text-gray-500 text-sm">Type:</span> {selectedInspection.assetType || '—'}</p>
                <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" />{selectedInspection.location || '—'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Inspector</h3>
                <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{selectedInspection.inspector?.name || selectedInspection.inspectorName || '—'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Timeline</h3>
                <p><span className="text-gray-500 text-sm">Date:</span> {formatDate(selectedInspection.inspectionDate || selectedInspection.createdAt)}</p>
              </div>

              {selectedInspection.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-gray-400" /><h3 className="font-semibold text-gray-900">Notes</h3></div>
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

              {selectedInspection.status === 'PENDING' && (
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleReject} disabled={approving} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <XCircle className="h-5 w-5 mr-2" /> Reject
                  </Button>
                  <Button onClick={handleApprove} disabled={approving} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="h-5 w-5 mr-2" /> {approving ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InspectionsPage
