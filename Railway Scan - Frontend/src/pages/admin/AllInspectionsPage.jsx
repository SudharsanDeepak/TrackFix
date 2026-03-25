import { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  User,
  Building,
  X,
  ChevronRight,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const AllInspectionsPage = () => {
  const [inspections, setInspections] = useState([])
  const [filteredInspections, setFilteredInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [depotFilter, setDepotFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)

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

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ]

  // Fetch inspections
  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await inspectionService.getAllInspections()

        // Mock data
        const mockData = [
          {
            id: 'INS-001',
            assetId: 'TRK-2024-001',
            assetType: 'Track',
            location: 'Platform 3, Section A',
            zone: 'Zone 1',
            depot: 'Depot A',
            inspector: 'John Inspector',
            status: 'completed',
            date: '2024-01-20T10:30:00',
            defectsFound: 2,
            priority: 'medium',
          },
          {
            id: 'INS-002',
            assetId: 'SIG-2024-045',
            assetType: 'Signal',
            location: 'Junction Point B',
            zone: 'Zone 1',
            depot: 'Depot B',
            inspector: 'Sarah Inspector',
            status: 'approved',
            date: '2024-01-20T14:15:00',
            defectsFound: 0,
            priority: 'low',
          },
          {
            id: 'INS-003',
            assetId: 'BRG-2024-012',
            assetType: 'Bridge',
            location: 'Bridge 12, KM 45',
            zone: 'Zone 2',
            depot: 'Depot C',
            inspector: 'Mike Inspector',
            status: 'in_progress',
            date: '2024-01-20T16:00:00',
            defectsFound: 1,
            priority: 'high',
          },
          {
            id: 'INS-004',
            assetId: 'STN-2024-003',
            assetType: 'Station',
            location: 'Main Station Building',
            zone: 'Zone 2',
            depot: 'Depot D',
            inspector: 'Jane Inspector',
            status: 'pending',
            date: '2024-01-19T09:00:00',
            defectsFound: 0,
            priority: 'medium',
          },
          {
            id: 'INS-005',
            assetId: 'TRK-2024-089',
            assetType: 'Track',
            location: 'Platform 1, Section C',
            zone: 'Zone 1',
            depot: 'Depot A',
            inspector: 'John Inspector',
            status: 'rejected',
            date: '2024-01-18T11:30:00',
            defectsFound: 3,
            priority: 'high',
          },
        ]

        setInspections(mockData)
        setFilteredInspections(mockData)
      } catch (error) {
        console.error('Failed to fetch inspections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInspections()
  }, [])

  // Filter inspections
  useEffect(() => {
    let filtered = inspections

    // Filter by zone
    if (zoneFilter !== 'all') {
      filtered = filtered.filter(insp => insp.zone === zoneFilter)
    }

    // Filter by depot
    if (depotFilter !== 'all') {
      filtered = filtered.filter(insp => insp.depot === depotFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(insp => insp.status === statusFilter)
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
        insp =>
          insp.id.toLowerCase().includes(query) ||
          insp.assetId.toLowerCase().includes(query) ||
          insp.location.toLowerCase().includes(query) ||
          insp.inspector.toLowerCase().includes(query)
      )
    }

    setFilteredInspections(filtered)
  }, [searchQuery, zoneFilter, depotFilter, statusFilter, dateFilter, inspections])

  // Handle view details
  const handleViewDetails = inspection => {
    setSelectedInspection(inspection)
    setShowDetailPanel(true)
  }

  // Handle export
  const handleExport = () => {
    console.log('Exporting inspections:', filteredInspections)
    alert('Export functionality will download inspections as CSV/PDF')
  }

  // Get status badge
  const getStatusBadge = status => {
    const config = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return config[status] || 'bg-gray-100 text-gray-800'
  }

  // Get priority badge
  const getPriorityBadge = priority => {
    const config = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }
    return config[priority] || 'bg-gray-100 text-gray-800'
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
      label: 'Inspection ID',
      sortable: true,
      render: value => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      key: 'assetId',
      label: 'Asset',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.assetType}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: value => (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'zone',
      label: 'Zone',
      sortable: true,
    },
    {
      key: 'depot',
      label: 'Depot',
      sortable: true,
    },
    {
      key: 'inspector',
      label: 'Inspector',
      sortable: true,
      render: value => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
            value
          )}`}
        >
          {value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
        </span>
      ),
    },
    {
      key: 'defectsFound',
      label: 'Defects',
      sortable: true,
      render: value => (
        <span className={`font-semibold ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: value => <span className="text-sm text-gray-600">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          aria-label="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
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
          <h1 className="text-2xl font-bold text-gray-900">All Inspections</h1>
          <p className="text-sm text-gray-600 mt-1">
            System-wide inspection data across all zones and depots
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          <Download className="h-5 w-5" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Inspections</p>
          <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {inspections.filter(i => i.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {inspections.filter(i => i.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {inspections.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Defects</p>
          <p className="text-2xl font-bold text-red-600">
            {inspections.reduce((sum, i) => sum + i.defectsFound, 0)}
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
                placeholder="Search inspections..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
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

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={statusOptions}
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
            Showing {filteredInspections.length} of {inspections.length} inspections
          </p>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredInspections}
          emptyMessage="No inspections found"
        />
      </div>

      {/* Detail Side Panel */}
      {showDetailPanel && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Inspection Details</h2>
              <button
                onClick={() => setShowDetailPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div>
                <p className="text-sm text-gray-600">Inspection ID</p>
                <p className="text-xl font-bold text-gray-900 font-mono">{selectedInspection.id}</p>
              </div>

              {/* Status and Priority */}
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                      selectedInspection.status
                    )}`}
                  >
                    {selectedInspection.status.replace('_', ' ').charAt(0).toUpperCase() +
                      selectedInspection.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(
                      selectedInspection.priority
                    )}`}
                  >
                    {selectedInspection.priority.charAt(0).toUpperCase() +
                      selectedInspection.priority.slice(1)}
                  </span>
                </div>
              </div>

              {/* Asset Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Asset Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Asset ID</p>
                    <p className="font-medium">{selectedInspection.assetId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asset Type</p>
                    <p className="font-medium">{selectedInspection.assetType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {selectedInspection.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Organization</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Zone</p>
                    <p className="font-medium">{selectedInspection.zone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Depot</p>
                    <p className="font-medium">{selectedInspection.depot}</p>
                  </div>
                </div>
              </div>

              {/* Inspector */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Inspector</h3>
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {selectedInspection.inspector}
                </p>
              </div>

              {/* Inspection Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Inspection Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(selectedInspection.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Defects Found</p>
                    <p
                      className={`text-2xl font-bold ${
                        selectedInspection.defectsFound > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {selectedInspection.defectsFound}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1">View Full Report</Button>
                <Button className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllInspectionsPage
