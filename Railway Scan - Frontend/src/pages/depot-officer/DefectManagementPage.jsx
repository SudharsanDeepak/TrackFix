import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Search, CheckCircle, XCircle, Clock, Eye, X, User, MapPin, AlertCircle, UserPlus, RefreshCw } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import depotOfficerService from '../../services/depotOfficerService'
import adminService from '../../services/adminService'
import toast from 'react-hot-toast'

const severityBadge = { critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-blue-100 text-blue-800' }
const statusBadge = { OPEN: 'bg-gray-100 text-gray-800', ASSIGNED: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-purple-100 text-purple-800', RESOLVED: 'bg-green-100 text-green-800', CLOSED: 'bg-gray-100 text-gray-600' }
const formatDate = d => d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : 'N/A'

const DefectManagementPage = () => {
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedDefect, setSelectedDefect] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [inspectors, setInspectors] = useState([])
  const [assignForm, setAssignForm] = useState({ userId: '', notes: '' })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ]

  const severityOptions = [
    { value: 'all', label: 'All Severity' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]

  const fetchDefects = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (severityFilter !== 'all') params.severity = severityFilter
      const res = await depotOfficerService.getDepotDefects(params)
      const items = Array.isArray(res) ? res : res?.data || res?.defects || []
      setDefects(items)
    } catch (err) {
      toast.error('Failed to load defects')
      setDefects([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, severityFilter])

  useEffect(() => { fetchDefects() }, [fetchDefects])

  // Load inspectors for assignment dropdown
  useEffect(() => {
    const loadInspectors = async () => {
      try {
        const res = await adminService.getUsers({ role: 'INSPECTOR' })
        const users = Array.isArray(res) ? res : res?.data || res?.users || []
        setInspectors(users.map(u => ({ value: u._id || u.id, label: u.name || u.email })))
      } catch { /* silently fail */ }
    }
    loadInspectors()
  }, [])

  const filtered = defects.filter(d => {
    const q = searchQuery.toLowerCase()
    return !q || (d.assetId || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q) ||
      (d.location || '').toLowerCase().includes(q)
  })

  const handleAssign = async () => {
    if (!selectedDefect || !assignForm.userId) return
    setUpdating(true)
    try {
      await depotOfficerService.assignDefect(selectedDefect._id || selectedDefect.id, { userId: assignForm.userId, notes: assignForm.notes })
      toast.success('Defect assigned successfully')
      setShowAssignModal(false)
      setAssignForm({ userId: '', notes: '' })
      fetchDefects()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign defect')
    } finally { setUpdating(false) }
  }

  const columns = [
    { key: '_id', label: 'ID', render: v => <span className="font-mono text-xs">{(v || '').slice(-8)}</span> },
    { key: 'assetId', label: 'Asset ID', render: v => <span className="font-mono">{v || '—'}</span> },
    { key: 'type', label: 'Type', render: v => <span className="capitalize">{v || '—'}</span> },
    {
      key: 'severity', label: 'Severity',
      render: v => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${severityBadge[v?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{v || '—'}</span>
    },
    {
      key: 'status', label: 'Status',
      render: v => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusBadge[v] || 'bg-gray-100 text-gray-700'}`}>{v || '—'}</span>
    },
    { key: 'location', label: 'Location', render: v => v || '—' },
    { key: 'createdAt', label: 'Reported', render: v => formatDate(v) },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button onClick={() => setSelectedDefect(row)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 flex items-center gap-1">
            <Eye className="h-4 w-4" /> View
          </Button>
          {(row.status === 'OPEN' || !row.status) && (
            <Button onClick={() => { setSelectedDefect(row); setShowAssignModal(true) }} className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Assign
            </Button>
          )}
        </div>
      )
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Defect Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage all depot defects</p>
        </div>
        <button onClick={fetchDefects} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw className="h-5 w-5" /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: defects.length, color: 'text-gray-900' },
          { label: 'Open', value: defects.filter(d => d.status === 'OPEN').length, color: 'text-gray-600' },
          { label: 'Assigned', value: defects.filter(d => d.status === 'ASSIGNED').length, color: 'text-blue-600' },
          { label: 'In Progress', value: defects.filter(d => d.status === 'IN_PROGRESS').length, color: 'text-purple-600' },
          { label: 'Critical', value: defects.filter(d => d.severity?.toLowerCase() === 'critical').length, color: 'text-red-600' },
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
            <Input type="text" placeholder="Search by asset, description, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={statusOptions} className="w-full" />
          <Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} options={severityOptions} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Showing {filtered.length} of {defects.length} defects</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} emptyMessage="No defects found" />
      </div>

      {/* Detail Side Panel */}
      {selectedDefect && !showAssignModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedDefect(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[560px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Defect Details</h2>
                <p className="text-sm text-gray-600 font-mono">{(selectedDefect._id || selectedDefect.id || '').slice(-12)}</p>
              </div>
              <button onClick={() => setSelectedDefect(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusBadge[selectedDefect.status] || 'bg-gray-100'}`}>{selectedDefect.status || 'OPEN'}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${severityBadge[selectedDefect.severity?.toLowerCase()] || 'bg-gray-100'}`}>{selectedDefect.severity || '—'}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">Asset</h3>
                <p><span className="text-gray-500 text-sm">ID:</span> <span className="font-mono">{selectedDefect.assetId || '—'}</span></p>
                <p><span className="text-gray-500 text-sm">Type:</span> {selectedDefect.type || '—'}</p>
                {selectedDefect.location && <p className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" />{selectedDefect.location}</p>}
              </div>

              {selectedDefect.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                  <p className="text-gray-700">{selectedDefect.description}</p>
                </div>
              )}

              {selectedDefect.reportedBy && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-1">Reported By</h3>
                  <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />{selectedDefect.reportedBy?.name || selectedDefect.reportedBy}</p>
                </div>
              )}

              {selectedDefect.assignedTo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-1">Assigned To</h3>
                  <p className="flex items-center gap-2"><User className="h-4 w-4 text-blue-400" />{selectedDefect.assignedTo?.name || selectedDefect.assignedTo}</p>
                </div>
              )}

              <p className="text-sm text-gray-500">Reported: {formatDate(selectedDefect.createdAt)}</p>

              {(selectedDefect.status === 'OPEN' || !selectedDefect.status) && (
                <Button onClick={() => setShowAssignModal(true)} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5" /> Assign to Inspector
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedDefect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Assign Defect</h2>
              <button onClick={() => { setShowAssignModal(false); setAssignForm({ userId: '', notes: '' }) }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedDefect.assetId || 'Unknown Asset'}</p>
                <p className="text-xs text-gray-600 mt-1">{selectedDefect.type} — {selectedDefect.severity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Inspector *</label>
                <Select
                  value={assignForm.userId}
                  onChange={e => setAssignForm(f => ({ ...f, userId: e.target.value }))}
                  options={[{ value: '', label: 'Select Inspector' }, ...inspectors]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={assignForm.notes}
                  onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Add instructions for the inspector..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => { setShowAssignModal(false); setAssignForm({ userId: '', notes: '' }) }} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
                <Button onClick={handleAssign} disabled={updating || !assignForm.userId} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  {updating ? 'Assigning...' : 'Assign Defect'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DefectManagementPage
