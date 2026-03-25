import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Building,
  MapPin,
  User,
  X,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const AllReportsPage = () => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [depotFilter, setDepotFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'inspection', label: 'Inspection Report' },
    { value: 'defect', label: 'Defect Report' },
    { value: 'operational', label: 'Operational Report' },
    { value: 'analytics', label: 'Analytics Report' },
    { value: 'audit', label: 'Audit Report' },
  ]

  const zoneOptions = [
    { value: 'all', label: 'All Zones' },
    { value: 'Zone 1', label: 'Zone 1' },
    { value: 'Zone 2', label: 'Zone 2' },
    { value: 'Zone 3', label: 'Zone 3' },
  ]

  const depotOptions = [
    { value: 'all', label: 'All Depots' },
    { value: 'Depot A', label: 'Depot A' },
    { value: 'Depot B', label: 'Depot B' },
    { value: 'Depot C', label: 'Depot C' },
    { value: 'Depot D', label: 'Depot D' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ]

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await reportService.getAllReports()

        // Mock data
        const mockData = [
          {
            id: 'RPT-001',
            title: 'Weekly Inspection Summary - Zone 1',
            type: 'inspection',
            zone: 'Zone 1',
            depot: 'Depot A',
            generatedBy: 'Sarah Officer',
            generatedDate: '2024-01-20T10:00:00',
            period: 'Jan 14 - Jan 20, 2024',
            format: 'PDF',
            size: '2.4 MB',
          },
          {
            id: 'RPT-002',
            title: 'Critical Defects Report - December 2023',
            type: 'defect',
            zone: 'Zone 2',
            depot: 'Depot C',
            generatedBy: 'Mike Manager',
            generatedDate: '2024-01-15T14:30:00',
            period: 'December 2023',
            format: 'PDF',
            size: '3.1 MB',
          },
          {
            id: 'RPT-003',
            title: 'Operational Performance - Q4 2023',
            type: 'operational',
            zone: 'Zone 1',
            depot: 'Depot B',
            generatedBy: 'Admin User',
            generatedDate: '2024-01-10T09:15:00',
            period: 'Q4 2023',
            format: 'Excel',
            size: '1.8 MB',
          },
          {
            id: 'RPT-004',
            title: 'Zone Analytics - Monthly Overview',
            type: 'analytics',
            zone: 'Zone 2',
            depot: null,
            generatedBy: 'Mike Manager',
            generatedDate: '2024-01-05T16:45:00',
            period: 'December 2023',
            format: 'PDF',
            size: '4.2 MB',
          },
          {
            id: 'RPT-005',
            title: 'System Audit Log - January 2024',
            type: 'audit',
            zone: null,
            depot: null,
            generatedBy: 'Admin User',
            generatedDate: '2024-01-20T18:00:00',
            period: 'Jan 1 - Jan 20, 2024',
            format: 'CSV',
            size: '856 KB',
          },
        ]

        setReports(mockData)
        setFilteredReports(mockData)
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // Filter reports
  useEffect(() => {
    let filtered = reports

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter)
    }

    // Filter by zone
    if (zoneFilter !== 'all') {
      filtered = filtered.filter(report => report.zone === zoneFilter)
    }

    // Filter by depot
    if (depotFilter !== 'all') {
      filtered = filtered.filter(report => report.depot === depotFilter)
    }

    // Filter by date (simplified)
    if (dateFilter !== 'all') {
      // In real implementation, apply date range filtering
      console.log('Filtering by date:', dateFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        report =>
          report.id.toLowerCase().includes(query) ||
          report.title.toLowerCase().includes(query) ||
          report.generatedBy.toLowerCase().includes(query)
      )
    }

    setFilteredReports(filtered)
  }, [searchQuery, typeFilter, zoneFilter, depotFilter, dateFilter, reports])

  // Handle preview
  const handlePreview = report => {
    setSelectedReport(report)
    setShowPreviewModal(true)
  }

  // Handle download
  const handleDownload = report => {
    console.log('Downloading report:', report.id)
    alert(`Downloading ${report.title}... (Feature to be implemented)`)
  }

  // Handle export all
  const handleExportAll = () => {
    console.log('Exporting all reports:', filteredReports)
    alert('Export functionality will download all reports as ZIP')
  }

  // Get type badge
  const getTypeBadge = type => {
    const config = {
      inspection: 'bg-blue-100 text-blue-800',
      defect: 'bg-red-100 text-red-800',
      operational: 'bg-green-100 text-green-800',
      analytics: 'bg-purple-100 text-purple-800',
      audit: 'bg-gray-100 text-gray-800',
    }
    return config[type] || 'bg-gray-100 text-gray-800'
  }

  // Get type display name
  const getTypeDisplayName = type => {
    const names = {
      inspection: 'Inspection',
      defect: 'Defect',
      operational: 'Operational',
      analytics: 'Analytics',
      audit: 'Audit',
    }
    return names[type] || type
  }

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Table columns
  const columns = [
    {
      key: 'id',
      label: 'Report ID',
      sortable: true,
      render: value => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.period}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(
            value
          )}`}
        >
          {getTypeDisplayName(value)}
        </span>
      ),
    },
    {
      key: 'zone',
      label: 'Zone',
      sortable: true,
      render: value => value || <span className="text-gray-400">System-wide</span>,
    },
    {
      key: 'depot',
      label: 'Depot',
      sortable: true,
      render: value => value || <span className="text-gray-400">N/A</span>,
    },
    {
      key: 'generatedBy',
      label: 'Generated By',
      sortable: true,
      render: value => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'generatedDate',
      label: 'Generated',
      sortable: true,
      render: value => <span className="text-sm text-gray-600">{formatDate(value)}</span>,
    },
    {
      key: 'format',
      label: 'Format',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-sm font-medium">{value}</p>
          <p className="text-xs text-gray-500">{row.size}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePreview(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            aria-label="Preview report"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownload(row)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            aria-label="Download report"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
          <p className="text-sm text-gray-600 mt-1">
            System-wide reports with filtering and export
          </p>
        </div>
        <Button
          onClick={handleExportAll}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          <Download className="h-5 w-5" />
          Export All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Inspection</p>
          <p className="text-2xl font-bold text-blue-600">
            {reports.filter(r => r.type === 'inspection').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Defect</p>
          <p className="text-2xl font-bold text-red-600">
            {reports.filter(r => r.type === 'defect').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Operational</p>
          <p className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.type === 'operational').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Analytics</p>
          <p className="text-2xl font-bold text-purple-600">
            {reports.filter(r => r.type === 'analytics').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={typeOptions}
              className="w-full"
            />
          </div>

          {/* Zone Filter */}
          <div>
            <Select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              options={zoneOptions}
              className="w-full"
            />
          </div>

          {/* Depot Filter */}
          <div>
            <Select
              value={depotFilter}
              onChange={e => setDepotFilter(e.target.value)}
              options={depotOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <Select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              options={dateOptions}
              className="w-48"
            />
          </div>
          <p className="text-sm text-gray-600">
            Showing {filteredReports.length} of {reports.length} reports
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredReports} emptyMessage="No reports found" />
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Report Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Header */}
              <div>
                <p className="text-sm text-gray-600">Report ID</p>
                <p className="text-xl font-bold text-gray-900 font-mono">{selectedReport.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Title</p>
                <p className="text-lg font-semibold text-gray-900">{selectedReport.title}</p>
              </div>

              {/* Report Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(
                      selectedReport.type
                    )}`}
                  >
                    {getTypeDisplayName(selectedReport.type)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Format</p>
                  <p className="font-medium">{selectedReport.format}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-medium">{selectedReport.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="font-medium">{selectedReport.size}</p>
                </div>
              </div>

              {/* Organization */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Organization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Zone</p>
                    <p className="font-medium">{selectedReport.zone || 'System-wide'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Depot</p>
                    <p className="font-medium">{selectedReport.depot || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Generation Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Generation Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Generated By</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {selectedReport.generatedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Generated Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(selectedReport.generatedDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Placeholder */}
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Report preview will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">{selectedReport.format} format</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDownload(selectedReport)}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
                <Button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllReportsPage
