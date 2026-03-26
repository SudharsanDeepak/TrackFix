import { useState, useEffect, useCallback } from 'react'
import { Shield, Search, Download, Eye, Calendar, X, RefreshCw } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import adminService from '../../services/adminService'
import toast from 'react-hot-toast'

const actionOptions = [
  { value: 'all', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'EXPORT', label: 'Export' },
]

const formatDate = d => d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(d)) : 'N/A'

const getActionBadge = action => {
  if (['LOGIN', 'LOGOUT'].includes(action)) return 'bg-blue-100 text-blue-800'
  if (action === 'CREATE') return 'bg-green-100 text-green-800'
  if (['UPDATE', 'APPROVE'].includes(action)) return 'bg-yellow-100 text-yellow-800'
  if (['DELETE', 'REJECT'].includes(action)) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [selectedLog, setSelectedLog] = useState(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (actionFilter !== 'all') params.action = actionFilter
      const res = await adminService.getAuditLogs(params)
      const items = Array.isArray(res) ? res : res?.data || res?.logs || []
      setLogs(items)
    } catch (err) {
      toast.error('Failed to load audit logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [actionFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = logs.filter(l => {
    const q = searchQuery.toLowerCase()
    return !q || (l.action || '').toLowerCase().includes(q) || (l.resource || '').toLowerCase().includes(q) || (l.userId?.name || l.userId || '').toString().toLowerCase().includes(q)
  })

  const columns = [
    { key: 'createdAt', label: 'Timestamp', render: v => <span className="text-sm font-mono">{formatDate(v)}</span> },
    {
      key: 'userId', label: 'User',
      render: v => <span className="text-sm">{v?.name || v?.email || (typeof v === 'string' ? v.slice(-8) : '—')}</span>
    },
    {
      key: 'action', label: 'Action',
      render: v => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(v)}`}>{v || '—'}</span>
    },
    { key: 'resource', label: 'Resource', render: v => <span className="capitalize text-sm">{v || '—'}</span> },
    { key: 'resourceId', label: 'Resource ID', render: v => <span className="font-mono text-xs">{v || '—'}</span> },
    {
      key: 'actions', label: '',
      render: (_, row) => <button onClick={() => setSelectedLog(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="h-4 w-4" /></button>
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-600 mt-1">System activity tracking and security monitoring</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw className="h-5 w-5" /></button>
          <Button onClick={() => toast('Export coming soon')} className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"><Download className="h-5 w-5" /> Export</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: logs.length, color: 'text-gray-900' },
          { label: 'Logins', value: logs.filter(l => l.action === 'LOGIN').length, color: 'text-blue-600' },
          { label: 'Creates', value: logs.filter(l => l.action === 'CREATE').length, color: 'text-green-600' },
          { label: 'Deletes', value: logs.filter(l => l.action === 'DELETE').length, color: 'text-red-600' },
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
            <Input type="text" placeholder="Search by action, resource, user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)} options={actionOptions} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Showing {filtered.length} of {logs.length} logs</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} emptyMessage="No audit logs found" />
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div><p className="text-xs text-gray-500">Timestamp</p><p className="font-mono text-sm">{formatDate(selectedLog.createdAt)}</p></div>
              <div><p className="text-xs text-gray-500">Action</p><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(selectedLog.action)}`}>{selectedLog.action}</span></div>
              <div><p className="text-xs text-gray-500">Resource</p><p className="capitalize">{selectedLog.resource}</p></div>
              {selectedLog.resourceId && <div><p className="text-xs text-gray-500">Resource ID</p><p className="font-mono text-sm">{selectedLog.resourceId}</p></div>}
              {selectedLog.userId && <div><p className="text-xs text-gray-500">User</p><p>{selectedLog.userId?.name || selectedLog.userId?.email || selectedLog.userId}</p></div>}
              {selectedLog.ipAddress && <div><p className="text-xs text-gray-500">IP Address</p><p className="font-mono text-sm">{selectedLog.ipAddress}</p></div>}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div><p className="text-xs text-gray-500">Metadata</p><pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(selectedLog.metadata, null, 2)}</pre></div>
              )}
              <Button onClick={() => setSelectedLog(null)} className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 mt-2">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogsPage
