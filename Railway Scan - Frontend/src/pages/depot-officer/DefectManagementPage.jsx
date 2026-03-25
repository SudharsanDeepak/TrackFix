import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  User,
  MapPin,
  FileText,
  AlertCircle,
  UserPlus,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const DefectManagementPage = () => {
  const [defects, setDefects] = useState([])
  const [filteredDefects, setFilteredDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedDefect, setSelectedDefect] = useState(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [assignForm, setAssignForm] = useState({
    inspectorId: '',
    notes: '',
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ]

  const severityOptions = [
    { value: 'all', label: 'All Severity' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ]

  const inspectorOptions = [
    { value: '', label: 'Select Inspector' },
    { value: 'USR-123', label: 'John Doe' },
    { value: 'USR-124', label: 'Sarah Smith' },
    { value: 'USR-125', label: 'Emily Johnson' },
    { value: 'USR-126', label: 'Michael Brown' },
  ]

  // Fetch defects
  useEffect(() => {
    const fetchDefects = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await defectService.getDepotDefects()

        // Mock data
        const mockData = [
          {
            id: 'DEF-001',
            title: 'Rail joint wear detected',
            description:
              'Minor wear detected on rail joint. Requires monitoring and potential replacement.',
            assetCode: 'TRK-2024-001',
            assetType: 'track',
            location: 'Platform 3, Section A',
            severity: 'medium',
            status: 'open',
            reportedBy: 'John Doe',
            reportedDate: '2024-01-20T10:30:00',
            assignedTo: null,
            assignedDate: null,
            resolvedDate: null,
            images: ['img1.jpg', 'img2.jpg'],
            notes: 'Inspection completed during routine maintenance window.',
          },
          {
            id: 'DEF-002',
            title: 'Signal lamp malfunction',
            description:
              'Signal lamp requires replacement. Backup system operational but primary lamp not functioning.',
            assetCode: 'SIG-2024-078',
            assetType: 'signal',
            location: 'Platform 5, Exit Signal',
            severity: 'high',
            status: 'assigned',
            reportedBy: 'John Doe',
            reportedDate: '2024-01-20T08:15:00',
            assignedTo: 'Sarah Smith',
            assignedToId: 'USR-124',
            assignedDate: '2024-01-20T09:00:00',
            resolvedDate: null,
            images: ['img7.jpg'],
            notes: 'Urgent attention required for lamp replacement.',
          },
          {
            id: 'DEF-003',
            title: 'Platform edge marking faded',
            description:
              'Platform edge markings need repainting. Safety equipment in good condition.',
            assetCode: 'STN-2024-003',
            assetType: 'station',
            location: 'Main Station Building',
            severity: 'low',
            status: 'in_progress',
            reportedBy: 'Emily Johnson',
            reportedDate: '2024-01-18T11:00:00',
            assignedTo: 'Michael Brown',
            assignedToId: 'USR-126',
            assignedDate: '2024-01-18T14:00:00',
            resolvedDate: null,
            images: ['img4.jpg', 'img5.jpg'],
            notes: 'Recommended for maintenance scheduling.',
          },
          {
            id: 'DEF-004',
            title: 'Bridge structural crack',
            description:
              'Small crack detected in bridge support beam. Requires immediate structural assessment.',
            assetCode: 'BRG-2024-012',
            assetType: 'bridge',
            location: 'Bridge 12, KM 45',
            severity: 'critical',
            status: 'assigned',
            reportedBy: 'Sarah Smith',
            reportedDate: '2024-01-19T15:30:00',
            assignedTo: 'John Doe',
            assignedToId: 'USR-123',
            assignedDate: '2024-01-19T16:00:00',
            resolvedDate: null,
            images: ['img8.jpg', 'img9.jpg', 'img10.jpg'],
            notes: 'Critical safety issue. Immediate inspection required.',
          },
          {
            id: 'DEF-005',
            title: 'Track alignment issue',
            description:
              'Minor track alignment deviation detected. Within acceptable limits but requires monitoring.',
            assetCode: 'TRK-2024-089',
            assetType: 'track',
            location: 'Platform 1, Section C',
            severity: 'medium',
            status: 'resolved',
            reportedBy: 'John Doe',
            reportedDate: '2024-01-15T10:00:00',
            assignedTo: 'Emily Johnson',
            assignedToId: 'USR-125',
            assignedDate: '2024-01-15T11:00:00',
            resolvedDate: '2024-01-17T14:30:00',
            images: ['img11.jpg'],
            notes: 'Track realignment completed successfully.',
            resolution: 'Track realigned and tested. All measurements within specifications.',
          },
          {
            id: 'DEF-006',
            title: 'Drainage system blockage',
            description:
              'Platform drainage system partially blocked. Water accumulation during rain.',
            assetCode: 'STN-2024-007',
            assetType: 'station',
            location: 'Platform 2, North End',
            severity: 'high',
            status: 'open',
            reportedBy: 'Sarah Smith',
            reportedDate: '2024-01-20T13:45:00',
            assignedTo: null,
            assignedDate: null,
            resolvedDate: null,
            images: ['img12.jpg', 'img13.jpg'],
            notes: 'Requires cleaning and maintenance.',
          },
          {
            id: 'DEF-007',
            title: 'Electrical panel corrosion',
            description:
              'Corrosion detected on electrical panel housing. No immediate safety risk but requires attention.',
            assetCode: 'SIG-2024-045',
            assetType: 'signal',
            location: 'Junction Point B',
            severity: 'low',
            status: 'closed',
            reportedBy: 'Emily Johnson',
            reportedDate: '2024-01-10T09:00:00',
            assignedTo: 'Michael Brown',
            assignedToId: 'USR-126',
            assignedDate: '2024-01-10T10:00:00',
            resolvedDate: '2024-01-12T16:00:00',
            images: ['img14.jpg'],
            notes: 'Panel replaced and tested.',
            resolution:
              'Electrical panel replaced with corrosion-resistant unit. All connections verified.',
          },
        ]

        setDefects(mockData)
        setFilteredDefects(mockData)
      } catch (error) {
        console.error('Failed to fetch defects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDefects()
  }, [])

  // Filter defects
  useEffect(() => {
    let filtered = defects

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(defect => defect.status === statusFilter)
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(defect => defect.severity === severityFilter)
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      filtered = filtered.filter(defect => {
        const defectDate = new Date(defect.reportedDate)

        switch (dateFilter) {
          case 'today':
            return defectDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return defectDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return defectDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        defect =>
          defect.id.toLowerCase().includes(query) ||
          defect.title.toLowerCase().includes(query) ||
          defect.assetCode.toLowerCase().includes(query) ||
          defect.location.toLowerCase().includes(query) ||
          defect.reportedBy.toLowerCase().includes(query) ||
          (defect.assignedTo && defect.assignedTo.toLowerCase().includes(query))
      )
    }

    setFilteredDefects(filtered)
  }, [searchQuery, statusFilter, severityFilter, dateFilter, defects])

  // Handle view defect
  const handleViewDefect = defect => {
    setSelectedDefect(defect)
    setShowSidePanel(true)
  }

  // Handle close side panel
  const handleCloseSidePanel = () => {
    setShowSidePanel(false)
    setTimeout(() => setSelectedDefect(null), 300)
  }

  // Handle assign defect
  const handleShowAssignModal = defect => {
    setSelectedDefect(defect)
    setShowAssignModal(true)
  }

  // Handle assign form change
  const handleAssignChange = e => {
    const { name, value } = e.target
    setAssignForm({ ...assignForm, [name]: value })
  }

  // Handle assign submit
  const handleAssignSubmit = async e => {
    e.preventDefault()
    if (!selectedDefect || !assignForm.inspectorId) return

    setUpdating(true)
    try {
      // TODO: Replace with actual API call
      // await defectService.assignDefect(selectedDefect.id, assignForm)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find inspector name
      const inspector = inspectorOptions.find(opt => opt.value === assignForm.inspectorId)

      // Update local state
      setDefects(prev =>
        prev.map(defect =>
          defect.id === selectedDefect.id
            ? {
                ...defect,
                status: 'assigned',
                assignedTo: inspector?.label || 'Unknown',
                assignedToId: assignForm.inspectorId,
                assignedDate: new Date().toISOString(),
                notes: assignForm.notes || defect.notes,
              }
            : defect
        )
      )

      // Reset form and close modal
      setAssignForm({ inspectorId: '', notes: '' })
      setShowAssignModal(false)
      setSelectedDefect(null)
    } catch (error) {
      console.error('Failed to assign defect:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async newStatus => {
    if (!selectedDefect) return

    setUpdating(true)
    try {
      // TODO: Replace with actual API call
      // await defectService.updateDefectStatus(selectedDefect.id, newStatus)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update local state
      setDefects(prev =>
        prev.map(defect =>
          defect.id === selectedDefect.id
            ? {
                ...defect,
                status: newStatus,
                resolvedDate:
                  newStatus === 'resolved' ? new Date().toISOString() : defect.resolvedDate,
              }
            : defect
        )
      )

      // Update selected defect
      setSelectedDefect(prev => ({
        ...prev,
        status: newStatus,
        resolvedDate: newStatus === 'resolved' ? new Date().toISOString() : prev.resolvedDate,
      }))
    } catch (error) {
      console.error('Failed to update defect status:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting defects:', filteredDefects)
    alert('Export functionality will download defects as PDF/CSV')
  }

  // Get severity badge
  const getSeverityBadge = severity => {
    const config = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }
    return config[severity] || config.medium
  }

  // Get status badge
  const getStatusBadge = status => {
    const config = {
      open: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-600',
    }
    return config[status] || config.open
  }

  // Get status icon
  const getStatusIcon = status => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'closed':
        return <XCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'assigned':
        return <User className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
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
      label: 'Defect ID',
      sortable: true,
      render: value => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: value => <span className="font-medium">{value}</span>,
    },
    {
      key: 'assetCode',
      label: 'Asset Code',
      sortable: true,
      render: value => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(value)}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
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
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      render: value => value || <span className="text-gray-400">Unassigned</span>,
    },
    {
      key: 'reportedDate',
      label: 'Reported',
      sortable: true,
      render: value => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleViewDefect(row)}
            className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          {row.status === 'open' && (
            <Button
              onClick={() => handleShowAssignModal(row)}
              className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1"
            >
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">Defect Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage all depot defects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Defects</p>
          <p className="text-2xl font-bold text-gray-900">{defects.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Open</p>
          <p className="text-2xl font-bold text-gray-600">
            {defects.filter(d => d.status === 'open').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Assigned</p>
          <p className="text-2xl font-bold text-blue-600">
            {defects.filter(d => d.status === 'assigned').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-purple-600">
            {defects.filter(d => d.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {defects.filter(d => d.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Critical</p>
          <p className="text-2xl font-bold text-red-600">
            {defects.filter(d => d.severity === 'critical').length}
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
                placeholder="Search by ID, title, asset code, location..."
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

          {/* Severity Filter */}
          <div>
            <Select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              options={severityOptions}
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
            Showing {filteredDefects.length} of {defects.length} defects
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

      {/* Defects Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredDefects} emptyMessage="No defects found" />
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedDefect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Assign Defect</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setAssignForm({ inspectorId: '', notes: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-4 space-y-4">
              {/* Defect Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedDefect.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedDefect.id} - {selectedDefect.assetCode}
                </p>
              </div>

              {/* Inspector Selection */}
              <div>
                <label
                  htmlFor="inspectorId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Assign to Inspector *
                </label>
                <Select
                  id="inspectorId"
                  name="inspectorId"
                  value={assignForm.inspectorId}
                  onChange={handleAssignChange}
                  options={inspectorOptions}
                  className="w-full"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={assignForm.notes}
                  onChange={handleAssignChange}
                  placeholder="Add any notes or instructions for the inspector..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false)
                    setAssignForm({ inspectorId: '', notes: '' })
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {updating ? 'Assigning...' : 'Assign Defect'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Side Panel */}
      {showSidePanel && selectedDefect && (
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
                <h2 className="text-lg font-semibold text-gray-900">Defect Details</h2>
                <p className="text-sm text-gray-600">{selectedDefect.id}</p>
              </div>
              <button onClick={handleCloseSidePanel} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status and Severity Badges */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusBadge(selectedDefect.status)}`}
                >
                  {getStatusIcon(selectedDefect.status)}
                  {selectedDefect.status.replace('_', ' ').charAt(0).toUpperCase() +
                    selectedDefect.status.replace('_', ' ').slice(1)}
                </span>
                <span
                  className={`inline-flex px-3 py-2 rounded-lg text-sm font-medium ${getSeverityBadge(selectedDefect.severity)}`}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {selectedDefect.severity.charAt(0).toUpperCase() +
                    selectedDefect.severity.slice(1)}{' '}
                  Severity
                </span>
              </div>

              {/* Title and Description */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedDefect.title}</h3>
                <p className="text-gray-700">{selectedDefect.description}</p>
              </div>

              {/* Asset Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Asset Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Asset Code</p>
                    <p className="font-mono font-semibold">{selectedDefect.assetCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Asset Type</p>
                    <p className="capitalize">{selectedDefect.assetType.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedDefect.location}</p>
                  </div>
                </div>
              </div>

              {/* Reported By */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Reported By</h3>
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedDefect.reportedBy}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedDefect.reportedDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              {selectedDefect.assignedTo && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                  <h3 className="font-semibold text-blue-900">Assignment Information</h3>
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-600">Assigned To</p>
                      <p className="font-medium text-blue-900">{selectedDefect.assignedTo}</p>
                      {selectedDefect.assignedDate && (
                        <p className="text-sm text-blue-500">
                          {formatDate(selectedDefect.assignedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Information */}
              {selectedDefect.resolution && (
                <div className="bg-green-50 p-4 rounded-lg space-y-3 border border-green-200">
                  <h3 className="font-semibold text-green-900">Resolution</h3>
                  <p className="text-green-700">{selectedDefect.resolution}</p>
                  {selectedDefect.resolvedDate && (
                    <p className="text-sm text-green-600">
                      Resolved on {formatDate(selectedDefect.resolvedDate)}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedDefect.notes && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Notes</h3>
                      <p className="text-gray-700 mt-1">{selectedDefect.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {selectedDefect.images && selectedDefect.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Images ({selectedDefect.images.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDefect.images.map((img, index) => (
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

              {/* Status Update Actions */}
              {selectedDefect.status !== 'closed' && selectedDefect.status !== 'resolved' && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDefect.status === 'open' && (
                      <Button
                        onClick={() => handleShowAssignModal(selectedDefect)}
                        disabled={updating}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <UserPlus className="h-5 w-5" />
                        Assign to Inspector
                      </Button>
                    )}
                    {selectedDefect.status === 'assigned' && (
                      <Button
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updating}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Clock className="h-5 w-5" />
                        Mark In Progress
                      </Button>
                    )}
                    {(selectedDefect.status === 'assigned' ||
                      selectedDefect.status === 'in_progress') && (
                      <Button
                        onClick={() => handleStatusUpdate('resolved')}
                        disabled={updating}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                  {selectedDefect.status === 'resolved' && (
                    <Button
                      onClick={() => handleStatusUpdate('closed')}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white mt-3"
                    >
                      <XCircle className="h-5 w-5" />
                      Close Defect
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DefectManagementPage
