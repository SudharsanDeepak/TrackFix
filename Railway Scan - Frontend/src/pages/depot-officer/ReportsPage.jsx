import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, Search, Download, X, Clock, CheckCircle, RefreshCw } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import depotOfficerService from '../../services/depotOfficerService'
import toast from 'react-hot-toast'

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'INSPECTION_SUMMARY', label: 'Inspection Summary' },
  { value: 'DEFECT_REPORT', label: 'Defect Report' },
  { value: 'QR_GENERATION', label: 'QR Generation' },
  { value: 'INVENTORY_STATUS', label: 'Inventory Status' },
  { value: 'OPERATIONAL', label: 'Operational' },
]

const reportTypeOptions = [
  { value: '', label: 'Select Report Type' },
  { value: 'INSPECTION_SUMMARY', label: 'Inspection Summary' },
  { value: 'DEFECT_REPORT', label: 'Defect Report' },
  { value: 'QR_GENERATION', label: 'QR Generation Report' },
  { value: 'INVENTORY_STATUS', label: 'Inventory Status' },
  { value: 'OPERATIONAL', label: 'Operational Report' },
]

const formatDate = d => d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d)) : 'N/A'

const ReportsPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)

  const [generateForm, setGenerateForm] = useState({
    reportType: '', startDate: '', endDate: '', format: 'PDF',
  })

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res = await depotOfficerService.getReports ? await depotOfficerService.getReports() : { data: [] }
      const items = Array.isArray(res) ? res : res?.data || res?.reports || []
      setReports(items)
    } catch (err) {
      // Reports endpoint may not exist yet — show empty state gracefully
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const filtered = reports.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || (r.reportId || r._id || '').toLowerCase().includes(q) || (r.reportType || '').toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || r.reportType === typeFilter
    return matchSearch && matchType
  })

  const handleGenerate = async e => {
    e.preventDefault()
    setGenerating(true)
    try {
      await depotOfficerService.generateOperationalReport(generateForm)
      toast.success('Report generated successfully')
      setShowGenerateModal(false)
      setGenerateForm({ reportType: '', startDate: '', endDate: '', format: 'PDF' })
      fetchReports()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report')
    } finally { setGenerating(false) }
  }

  const columns = [
    { key: 'reportId', label: 'Report ID', render: (v, row) => <span className="font-mono text-xs">{v || (row._id || '').slice(-8)}</span> },
    { key: 'reportType', label: 'Type', render: v => <span className="capitalize">{(v || '').replace(/_/g, ' ')}</span> },
    { key: 'startDate', label: 'Period', render: (v, row) => <span className="text-sm">{formatDate(v)} – {formatDate(row.endDate)}</span> },
    { key: 'format', label: 'Format', render: v => <span className="font-mono text-xs">{v || 'PDF'}</span> },
    {
      key: 'status', label: 'Status',
      render: v => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${v === 'COMPLETED' ? 'bg-green-100 text-green-800' : v === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
          {v === 'COMPLETED' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {v || 'COMPLETED'}
        </span>
      )
    },
    { key: 'createdAt', label: 'Generated', render: v => formatDate(v) },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => setSelectedReport(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Preview"><FileText className="h-4 w-4" /></button>
          <button onClick={() => toast('Download coming soon')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Download"><Download className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Generate and manage operational reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReports} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw className="h-5 w-5" /></button>
          <Button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2"><Plus className="h-4 w-4" /> Generate Report</Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={typeOptions} className="w-full" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable data={filtered} columns={columns} emptyMessage="No reports found. Generate your first report." />
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Generate Report</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleGenerate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                <Select value={generateForm.reportType} onChange={e => setGenerateForm(f => ({ ...f, reportType: e.target.value }))} options={reportTypeOptions} className="w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <Input type="date" value={generateForm.startDate} onChange={e => setGenerateForm(f => ({ ...f, startDate: e.target.value }))} className="w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <Input type="date" value={generateForm.endDate} onChange={e => setGenerateForm(f => ({ ...f, endDate: e.target.value }))} className="w-full" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowGenerateModal(false)} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" disabled={generating} className="flex-1">{generating ? 'Generating...' : 'Generate'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div><p className="text-xs text-gray-500">Report ID</p><p className="font-mono text-sm">{selectedReport.reportId || selectedReport._id}</p></div>
              <div><p className="text-xs text-gray-500">Type</p><p className="capitalize">{(selectedReport.reportType || '').replace(/_/g, ' ')}</p></div>
              <div><p className="text-xs text-gray-500">Period</p><p>{formatDate(selectedReport.startDate)} – {formatDate(selectedReport.endDate)}</p></div>
              <div><p className="text-xs text-gray-500">Generated</p><p>{formatDate(selectedReport.createdAt)}</p></div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setSelectedReport(null)} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">Close</Button>
                <Button onClick={() => toast('Download coming soon')} className="flex-1 flex items-center justify-center gap-2"><Download className="h-4 w-4" /> Download</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
