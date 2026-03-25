import { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  ChevronRight,
  MapPin,
  User,
  FileText,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const InspectionsPage = () => {
  const [inspections, setInspections] = useState([])
  const [filteredInspections, setFilteredInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [approving, setApproving] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ]

  // Fetch inspections
  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await inspectionService.getDepotInspections()

        // Mock data
        const mockData = [
          {
            id: 'INS-001',
            assetCode: 'TRK-2024-001',
            assetType: 'track',
            location: 'Platform 3, Section A',
            inspector: 'John Doe',
            inspectorId: 'USR-123',
            status: 'pending',
            date: '2024-01-20T10:30:00',
            completedDate: '2024-01-20T11:45:00',
            findings: 'Minor wear detected on rail joint. Requires monitoring.',
            defectsCount: 1,
            images: ['img1.jpg', 'img2.jpg'],
            notes: 'Inspection completed during routine maintenance window.',
          },
          {
            id: 'INS-002',
            assetCode: 'SIG-2024-045',
            assetType: 'signal',
            location: 'Junction Point B',
            inspector: 'Sarah Smith',
            inspectorId: 'USR-124',
            status: 'approved',
            date: '2024-01-19T14:00:00',
            completedDate: '2024-01-19T14:30:00',
            findings: 'All signal lights functioning properly. No issues found.',
            defectsCount: 0,
            images: ['img3.jpg'],
            notes: 'Regular inspection completed.',
            approvedBy: 'Officer Mike',
            approvedDate: '2024-01-19T15:00:00',
          },
          {
            id: 'INS-003',
            assetCode: 'BRG-2024-012',
            assetType: 'bridge',
            location: 'Bridge 12, KM 45',
            inspector: 'John Doe',
            inspectorId: 'USR-123',
            status: 'in_progress',
            date: '2024-01-20T09:00:00',
            completedDate: null,
            findings: null,
            defectsCount: 0,
            images: [],
            notes: null,
          },
          {
            id: 'INS-004',
            assetCode: 'STN-2024-003',
            assetType: 'station',
            location: 'Main Station Building',
            inspector: 'Emily Johnson',
            inspectorId: 'USR-125',
            status: 'completed',
            date: '2024-01-18T11:00:00',
            completedDate: '2024-01-18T12:30:00',
            findings: 'Platform edge markings need repainting. Safety equipment in good condition.',
            defectsCount: 1,
            images: ['img4.jpg', 'img5.jpg', 'img6.jpg'],
            notes: 'Recommended for maintenance scheduling.',
          },
          {
            id: 'INS-005',
            assetCode: 'TRK-2024-089',
            assetType: 'track',
            location: 'Platform 1, Section C',
            inspector: 'Sarah Smith',
            inspectorId: 'USR-124',
            status: 'rejected',
            date: '2024-01-17T10:00:00',
            completedDate: '2024-01-17T10:45:00',
            findings: 'Incomplete inspection data.',
            defectsCount: 0,
            images: [],
            notes: 'Inspection needs to be redone with complete documentation.',
            rejectedBy: 'Officer Mike',
            rejectedDate: '2024-01-17T16:00:00',
            rejectionReason: 'Missing required photos and measurements.',
          },
          {
            id: 'INS-006',
            assetCode: 'SIG-2024-078',
            assetType: 'signal',
            location: 'Platform 5, Exit Signal',
            inspector: 'John Doe',
            inspectorId: 'USR-123',
            status: 'pending',
            date: '2024-01-20T08:15:00',
            completedDate: '2024-01-20T09:00:00',
            findings: 'Signal lamp requires replacement. Backup system operational.',
            defectsCount: 1,
            images: ['img7.jpg'],
            notes: 'Urgent attention required for lamp replacement.',
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

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inspection => inspection.status === statusFilter)
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter(inspection => {
        const inspectionDate = new Date(inspection.date)

        switch (dateFilter) {
          case 'today':
            return inspectionDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return inspectionDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return inspectionDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        inspection =>
          inspection.id.toLowerCase().includes(query) ||
          inspection.assetCode.toLowerCase().includes(query) ||
          inspection.location.toLowerCase().includes(query) ||
          inspection.inspector.toLowerCase().includes(query)
      )
    }

    setFilteredInspections(filtered)
  }, [searchQuery, statusFilter, dateFilter, inspections])

  // Handle view inspection
  const handleViewInspection = inspection => {
    setSelectedInspection(inspection)
    setShowSidePanel(true)
  }

  // Handle close side panel
  const handleCloseSidePanel = () => {
    setShowSidePanel(false)
    setTimeout(() => setSelectedInspection(null), 300)
  }

  // Handle approve inspection
  const handleApprove = async () => {
    if (!selectedInspection) return

    setApproving(true)
    try {
      // TODO: Replace with actual API call
      // await inspectionService.approveInspection(selectedInspection.id)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update local state
      setInspections(prev =>
        prev.map(inspection =>
          inspection.id === selectedInspection.id
            ? {
                ...inspection,
                status: 'approved',
                approvedBy: 'Current Officer',
                approvedDate: new Date().toISOString(),
              }
            : inspection
        )
      )

      handleCloseSidePanel()
    } catch (error) {
      console.error('Failed to approve inspection:', error)
    } finally {
      setApproving(false)
    }
  }

  // Handle reject inspection
  const handleReject = async () => {
    if (!selectedInspection) return

    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    setApproving(true)
    try {
      // TODO: Replace with actual API call
      // await inspectionService.rejectInspection(selectedInspection.id, reason)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update local state
      setInspections(prev =>
        prev.map(inspection =>
          inspection.id === selectedInspection.id
            ? {
                ...inspection,
                status: 'rejected',
                rejectedBy: 'Current Officer',
                rejectedDate: new Date().toISOString(),
                rejectionReason: reason,
              }
            : inspection
        )
      )

      handleCloseSidePanel()
    } catch (error) {
      console.error('Failed to reject inspection:', error)
    } finally {
      setApproving(false)
    }
  }

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting inspections:', filteredInspections)
    alert('Export functionality will download inspections as PDF/CSV')
  }

  // Get status badge
  const getStatusBadge = status => {
    const config = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
    }
    return config[status] || config.pending
  }

  // Get status icon
  const getStatusIcon = status => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A'
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
      key: 'assetCode',
      label: 'Asset Code',
      sortable: true,
      render: value => <span className="font-mono">{value}</span>,
    },
    {
      key: 'assetType',
      label: 'Type',
      sortable: true,
      render: value => <span className="capitalize">{value.replace('_', ' ')}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'inspector',
      label: 'Inspector',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(value)}`}
        >
          {getStatusIcon(value)}
          {value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: value => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          onClick={() => handleViewInspection(row)}
          className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Depot Inspections</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage all depot inspections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Inspections</p>
          <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">
            {inspections.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {inspections.filter(i => i.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {inspections.filter(i => i.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {inspections.filter(i => i.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ID, asset code, location, or inspector..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
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

          {/* Date Filter */}
          <div>
            <Select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              options={dateOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredInspections.length} of {inspections.length} inspections
          </p>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
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

      {/* Side Panel */}
      {showSidePanel && selectedInspection && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseSidePanel}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Inspection Details</h2>
                <p className="text-sm text-gray-600">{selectedInspection.id}</p>
              </div>
              <button onClick={handleCloseSidePanel} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusBadge(selectedInspection.status)}`}
                >
                  {getStatusIcon(selectedInspection.status)}
                  {selectedInspection.status.replace('_', ' ').charAt(0).toUpperCase() +
                    selectedInspection.status.replace('_', ' ').slice(1)}
                </span>
                {selectedInspection.defectsCount > 0 && (
                  <span className="text-sm text-red-600 font-medium">
                    {selectedInspection.defectsCount} Defect
                    {selectedInspection.defectsCount > 1 ? 's' : ''} Found
                  </span>
                )}
              </div>

              {/* Asset Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Asset Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Asset Code</p>
                    <p className="font-mono font-semibold">{selectedInspection.assetCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asset Type</p>
                    <p className="capitalize">{selectedInspection.assetType.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedInspection.location}</p>
                  </div>
                </div>
              </div>

              {/* Inspector Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Inspector Information</h3>
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Inspector</p>
                    <p className="font-medium">{selectedInspection.inspector}</p>
                    <p className="text-sm text-gray-500">{selectedInspection.inspectorId}</p>
                  </div>
                </div>
              </div>

              {/* Inspection Timeline */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Timeline</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Started</p>
                    <p className="font-medium">{formatDate(selectedInspection.date)}</p>
                  </div>
                  {selectedInspection.completedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="font-medium">{formatDate(selectedInspection.completedDate)}</p>
                    </div>
                  )}
                  {selectedInspection.approvedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="font-medium">{formatDate(selectedInspection.approvedDate)}</p>
                      <p className="text-sm text-gray-500">by {selectedInspection.approvedBy}</p>
                    </div>
                  )}
                  {selectedInspection.rejectedDate && (
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="font-medium">{formatDate(selectedInspection.rejectedDate)}</p>
                      <p className="text-sm text-gray-500">by {selectedInspection.rejectedBy}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Findings */}
              {selectedInspection.findings && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-900">Findings</h3>
                  <p className="text-gray-700">{selectedInspection.findings}</p>
                </div>
              )}

              {/* Notes */}
              {selectedInspection.notes && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Notes</h3>
                      <p className="text-gray-700 mt-1">{selectedInspection.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedInspection.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg space-y-3 border border-red-200">
                  <h3 className="font-semibold text-red-900">Rejection Reason</h3>
                  <p className="text-red-700">{selectedInspection.rejectionReason}</p>
                </div>
              )}

              {/* Images */}
              {selectedInspection.images && selectedInspection.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Images ({selectedInspection.images.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedInspection.images.map((img, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <span className="text-gray-400 text-sm">Image {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Actions */}
              {selectedInspection.status === 'pending' && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 flex gap-3">
                  <Button
                    onClick={handleReject}
                    disabled={approving}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {approving ? 'Processing...' : 'Approve'}
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
