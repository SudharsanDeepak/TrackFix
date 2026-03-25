import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  Download,
  Calendar,
  Eye,
  X,
  Filter,
  FileSpreadsheet,
  Clock,
  CheckCircle,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const ReportsPage = () => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const [generateForm, setGenerateForm] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    format: 'pdf',
  })

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'inspection_summary', label: 'Inspection Summary' },
    { value: 'defect_report', label: 'Defect Report' },
    { value: 'qr_generation', label: 'QR Generation Report' },
    { value: 'inventory_status', label: 'Inventory Status' },
  ]

  const reportTypeOptions = [
    { value: '', label: 'Select Report Type' },
    { value: 'inspection_summary', label: 'Inspection Summary' },
    { value: 'defect_report', label: 'Defect Report' },
    { value: 'qr_generation', label: 'QR Generation Report' },
    { value: 'inventory_status', label: 'Inventory Status' },
  ]

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
  ]

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await reportService.getReports()

        // Mock data
        const mockData = [
          {
            id: 'RPT-001',
            name: 'Weekly Inspection Summary',
            type: 'inspection_summary',
            generatedDate: '2024-01-15',
            format: 'pdf',
            status: 'completed',
          },
          {
            id: 'RPT-002',
            name: 'Monthly Defect Report',
            type: 'defect_report',
            generatedDate: '2024-01-10',
            format: 'excel',
            status: 'completed',
          },
        ]

        setReports(mockData)
        setFilteredReports(mockData)
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // Filter reports
  useEffect(() => {
    let filtered = reports

    if (searchQuery) {
      filtered = filtered.filter(
        report =>
          report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter)
    }

    setFilteredReports(filtered)
  }, [searchQuery, typeFilter, reports])

  const handleGenerateReport = async e => {
    e.preventDefault()
    setGenerating(true)

    try {
      // TODO: Replace with actual API call
      // await reportService.generateReport(generateForm)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowGenerateModal(false)
      setGenerateForm({
        reportType: '',
        startDate: '',
        endDate: '',
        format: 'pdf',
      })
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'Report ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Report Name',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: value => {
        const type = typeOptions.find(t => t.value === value)
        return type ? type.label : value
      },
    },
    {
      key: 'generatedDate',
      label: 'Generated Date',
      sortable: true,
    },
    {
      key: 'format',
      label: 'Format',
      render: value => value.toUpperCase(),
    },
    {
      key: 'status',
      label: 'Status',
      render: value => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            value === 'completed'
              ? 'bg-green-100 text-green-800'
              : value === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {value === 'completed' && <CheckCircle className="h-3 w-3" />}
          {value === 'processing' && <Clock className="h-3 w-3" />}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, report) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedReport(report)
              setShowPreviewModal(true)
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              // TODO: Implement download
              console.log('Download report:', report.id)
            }}
            className="p-1 text-green-600 hover:text-green-800"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Generate and manage operational reports</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            options={typeOptions}
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable data={filteredReports} columns={columns} emptyMessage="No reports found" />
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Generate Report</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <Select
                  value={generateForm.reportType}
                  onChange={e => setGenerateForm({ ...generateForm, reportType: e.target.value })}
                  options={reportTypeOptions}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={generateForm.startDate}
                  onChange={e => setGenerateForm({ ...generateForm, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={generateForm.endDate}
                  onChange={e => setGenerateForm({ ...generateForm, endDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <Select
                  value={generateForm.format}
                  onChange={e => setGenerateForm({ ...generateForm, format: e.target.value })}
                  options={formatOptions}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={generating} className="flex-1">
                  {generating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Report Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Report ID:</span>
                  <p className="text-gray-900">{selectedReport.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-gray-900">{selectedReport.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <p className="text-gray-900">
                    {typeOptions.find(t => t.value === selectedReport.type)?.label}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Generated:</span>
                  <p className="text-gray-900">{selectedReport.generatedDate}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement download
                    console.log('Download report:', selectedReport.id)
                  }}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
