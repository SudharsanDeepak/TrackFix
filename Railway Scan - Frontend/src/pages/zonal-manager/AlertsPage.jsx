import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, AlertCircle, Bell, CheckCircle, Clock, Filter, RefreshCw, Search, XCircle, ChevronRight, ArrowUpCircle, User, X } from 'lucide-react'
import { Button, Select } from '../../components/atoms'
import { StatCard } from '../../components/molecules'
import zonalManagerService from '../../services/zonalManagerService'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const severityColor = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  EMERGENCY: 'bg-red-100 text-red-700 border-red-200',
  WARNING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  INFO: 'bg-blue-100 text-blue-700 border-blue-200',
}

const statusColor = {
  ACTIVE: 'bg-red-100 text-red-700',
  ACKNOWLEDGED: 'bg-yellow-100 text-yellow-700',
  ESCALATED: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-green-100 text-green-700',
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [acting, setActing] = useState(false)

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'INFO', label: 'Info' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { value: 'ESCALATED', label: 'Escalated' },
    { value: 'RESOLVED', label: 'Resolved' },
  ]

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (severityFilter !== 'all') params.severity = severityFilter
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await zonalManagerService.getCriticalAlerts(params)
      const items = Array.isArray(res) ? res : res?.data || res?.alerts || []
      setAlerts(items)
    } catch (err) {
      toast.error('Failed to load alerts')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [severityFilter, statusFilter])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const filtered = alerts.filter(a => {
    const q = searchQuery.toLowerCase()
    return !q || (a.message || '').toLowerCase().includes(q) || (a.alertType || '').toLowerCase().includes(q) || (a.depotId || '').toLowerCase().includes(q)
  })

  const handleAcknowledge = async (alert) => {
    setActing(true)
    try {
      await zonalManagerService.resolveAlert(alert._id || alert.id, { notes: 'Acknowledged by Zonal Manager' })
      toast.success('Alert acknowledged')
      setSelectedAlert(null)
      fetchAlerts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to acknowledge alert')
    } finally { setActing(false) }
  }

  const handleEscalate = async (alert) => {
    setActing(true)
    try {
      await zonalManagerService.escalateAlert(alert._id || alert.id, { reason: 'Escalated by Zonal Manager' })
      toast.success('Alert escalated')
      setSelectedAlert(null)
      fetchAlerts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to escalate alert')
    } finally { setActing(false) }
  }

  const total = alerts.length
  const critical = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'EMERGENCY').length
  const active = alerts.filter(a => a.status === 'ACTIVE').length
  const resolved = alerts.filter(a => a.status === 'RESOLVED').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Critical Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor and manage alerts requiring attention</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchAlerts} loading={loading} className="border border-gray-300 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bell} label="Total Alerts" value={String(total)} variant="purple" />
        <StatCard icon={XCircle} label="Critical" value={String(critical)} variant="red" />
        <StatCard icon={AlertTriangle} label="Active" value={String(active)} variant="yellow" />
        <StatCard icon={CheckCircle} label="Resolved" value={String(resolved)} variant="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search alerts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Severity" options={severityOptions} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} />
          <Select label="Status" options={statusOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} />
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts ({filtered.length})</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No alerts found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(alert => (
              <div
                key={alert._id || alert.alertId}
                onClick={() => setSelectedAlert(alert)}
                className={clsx(
                  'border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all',
                  (alert.severity === 'CRITICAL' || alert.severity === 'EMERGENCY') && 'border-red-300 bg-red-50',
                  alert.severity === 'WARNING' && 'border-yellow-300 bg-yellow-50',
                  alert.severity === 'INFO' && 'border-blue-300 bg-blue-50',
                  alert.status === 'RESOLVED' && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${severityColor[alert.severity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {alert.severity}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor[alert.status] || 'bg-gray-100 text-gray-700'}`}>
                        {alert.status}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{(alert.alertType || '').replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {alert.depotId && <span>Depot: {alert.depotId}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedAlert && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedAlert(null)} />
          <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Alert Details</h2>
              <button onClick={() => setSelectedAlert(null)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${severityColor[selectedAlert.severity] || 'bg-gray-100'}`}>{selectedAlert.severity}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColor[selectedAlert.status] || 'bg-gray-100'}`}>{selectedAlert.status}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Alert Type</p>
                <p className="font-semibold capitalize">{(selectedAlert.alertType || '').replace(/_/g, ' ')}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                <p className="text-gray-800">{selectedAlert.message}</p>
              </div>

              {selectedAlert.depotId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Depot</p>
                  <p>{selectedAlert.depotId}</p>
                </div>
              )}

              <p className="text-sm text-gray-500">Created: {new Date(selectedAlert.createdAt).toLocaleString()}</p>

              {selectedAlert.status === 'ACTIVE' && (
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleEscalate(selectedAlert)} disabled={acting} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2">
                    <ArrowUpCircle className="h-5 w-5" /> Escalate
                  </Button>
                  <Button onClick={() => handleAcknowledge(selectedAlert)} disabled={acting} className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" /> {acting ? 'Processing...' : 'Acknowledge'}
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

export default AlertsPage
