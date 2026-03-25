import { useState, useEffect } from 'react'
import {
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  X,
  FileText,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortColumn, setSortColumn] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState('desc')

  const userOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'admin@railway.com', label: 'Admin User' },
    { value: 'john.inspector@railway.com', label: 'John Inspector' },
    { value: 'sarah.officer@railway.com', label: 'Sarah Officer' },
    { value: 'mike.manager@railway.com', label: 'Mike Manager' },
  ]

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'USER_LOGIN', label: 'User Login' },
    { value: 'USER_LOGOUT', label: 'User Logout' },
    { value: 'USER_CREATE', label: 'User Create' },
    { value: 'USER_UPDATE', label: 'User Update' },
    { value: 'USER_DELETE', label: 'User Delete' },
    { value: 'ROLE_CHANGE', label: 'Role Change' },
    { value: 'INSPECTION_CREATE', label: 'Inspection Create' },
    { value: 'INSPECTION_UPDATE', label: 'Inspection Update' },
    { value: 'INSPECTION_DELETE', label: 'Inspection Delete' },
    { value: 'REPORT_GENERATE', label: 'Report Generate' },
    { value: 'SETTINGS_UPDATE', label: 'Settings Update' },
    { value: 'QR_GENERATE', label: 'QR Generate' },
    { value: 'DEFECT_CREATE', label: 'Defect Create' },
    { value: 'DEFECT_UPDATE', label: 'Defect Update' },
  ]

  const resourceOptions = [
    { value: 'all', label: 'All Resources' },
    { value: 'user', label: 'User' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'defect', label: 'Defect' },
    { value: 'report', label: 'Report' },
    { value: 'qr_code', label: 'QR Code' },
    { value: 'settings', label: 'Settings' },
    { value: 'system', label: 'System' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ]

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await auditService.getLogs()

        // Mock data
        const mockData = [
          {
            id: 'LOG-001',
            timestamp: '2024-01-20T18:30:15',
            user: 'admin@railway.com',
            userName: 'Admin User',
            action: 'USER_CREATE',
            resource: 'user',
            resourceId: 'USR-006',
            details: 'Created new user: Jane Doe (INSPECTOR)',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'success',
          },
          {
            id: 'LOG-002',
            timestamp: '2024-01-20T17:45:22',
            user: 'sarah.officer@railway.com',
            userName: 'Sarah Officer',
            action: 'INSPECTION_CREATE',
            resource: 'inspection',
            resourceId: 'INS-123',
            details: 'Created inspection for asset TRK-2024-045',
            ipAddress: '192.168.1.105',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            status: 'success',
          },
          {
            id: 'LOG-003',
            timestamp: '2024-01-20T16:20:10',
            user: 'mike.manager@railway.com',
            userName: 'Mike Manager',
            action: 'REPORT_GENERATE',
            resource: 'report',
            resourceId: 'RPT-045',
            details: 'Generated Zone Analytics Report for December 2023',
            ipAddress: '192.168.1.110',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'success',
          },
          {
            id: 'LOG-004',
            timestamp: '2024-01-20T15:10:33',
            user: 'admin@railway.com',
            userName: 'Admin User',
            action: 'ROLE_CHANGE',
            resource: 'user',
            resourceId: 'USR-003',
            details: 'Changed user role from DEPOT_OFFICER to ZONAL_MANAGER',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'success',
          },
          {
            id: 'LOG-005',
            timestamp: '2024-01-20T14:55:18',
            user: 'john.inspector@railway.com',
            userName: 'John Inspector',
            action: 'USER_LOGIN',
            resource: 'system',
            resourceId: null,
            details: 'User logged in successfully',
            ipAddress: '192.168.1.120',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            status: 'success',
          },
          {
            id: 'LOG-006',
            timestamp: '2024-01-20T14:30:45',
            user: 'sarah.officer@railway.com',
            userName: 'Sarah Officer',
            action: 'QR_GENERATE',
            resource: 'qr_code',
            resourceId: 'QR-BATCH-089',
            details: 'Generated QR code batch: 50 codes for Depot B',
            ipAddress: '192.168.1.105',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            status: 'success',
          },
          {
            id: 'LOG-007',
            timestamp: '2024-01-20T13:15:22',
            user: 'admin@railway.com',
            userName: 'Admin User',
            action: 'SETTINGS_UPDATE',
            resource: 'settings',
            resourceId: 'SYS-CONFIG',
            details: 'Updated system configuration: email notifications enabled',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'success',
          },
          {
            id: 'LOG-008',
            timestamp: '2024-01-20T12:40:11',
            user: 'john.inspector@railway.com',
            userName: 'John Inspector',
            action: 'DEFECT_CREATE',
            resource: 'defect',
            resourceId: 'DEF-234',
            details: 'Reported defect: Track misalignment at Platform 3',
            ipAddress: '192.168.1.120',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            status: 'success',
          },
          {
            id: 'LOG-009',
            timestamp: '2024-01-20T11:25:55',
            user: 'unknown@railway.com',
            userName: 'Unknown User',
            action: 'USER_LOGIN',
            resource: 'system',
            resourceId: null,
            details: 'Failed login attempt: Invalid credentials',
            ipAddress: '203.45.67.89',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
            status: 'failure',
          },
          {
            id: 'LOG-010',
            timestamp: '2024-01-20T10:15:30',
            user: 'admin@railway.com',
            userName: 'Admin User',
            action: 'USER_DELETE',
            resource: 'user',
            resourceId: 'USR-005',
            details: 'Deleted inactive user: Old Inspector',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            status: 'success',
          },
        ]

        setLogs(mockData)
        setFilteredLogs(mockData)
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  // Filter logs
  useEffect(() => {
    let filtered = logs

    // Filter by user
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user === userFilter)
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter)
    }

    // Filter by resource
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource === resourceFilter)
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
        log =>
          log.id.toLowerCase().includes(query) ||
          log.userName.toLowerCase().includes(query) ||
          log.user.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          (log.resourceId && log.resourceId.toLowerCase().includes(query))
      )
    }

    setFilteredLogs(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, userFilter, actionFilter, resourceFilter, dateFilter, logs])

  // Handle sorting
  const handleSort = (column, direction) => {
    setSortColumn(column)
    setSortDirection(direction)

    const sorted = [...filteredLogs].sort((a, b) => {
      let aVal = a[column]
      let bVal = b[column]

      // Handle null/undefined values
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Convert to comparable values
      if (column === 'timestamp') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })

    setFilteredLogs(sorted)
  }

  // Handle pagination
  const handlePageChange = page => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = size => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // Get paginated data
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handle view details
  const handleViewDetails = log => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  // Handle export
  const handleExport = () => {
    console.log('Exporting audit logs:', filteredLogs)
    alert('Export functionality will download logs as CSV')
  }

  // Get action badge
  const getActionBadge = action => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return 'bg-blue-100 text-blue-800'
    }
    if (action.includes('CREATE')) {
      return 'bg-green-100 text-green-800'
    }
    if (action.includes('UPDATE') || action.includes('CHANGE')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (action.includes('DELETE')) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  // Get status badge
  const getStatusBadge = status => {
    return status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  // Format action display
  const formatAction = action => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
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
      second: '2-digit',
    }).format(date)
  }

  // Table columns
  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: value => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-mono">{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.user}</p>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(
            value
          )}`}
        >
          {formatAction(value)}
        </span>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 capitalize">{value}</p>
          {row.resourceId && <p className="text-xs text-gray-500 font-mono">{row.resourceId}</p>}
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: value => <span className="text-sm text-gray-600 line-clamp-2">{value}</span>,
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
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            System activity tracking and security monitoring
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          <Download className="h-5 w-5" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Successful Actions</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.status === 'success').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Failed Actions</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.status === 'failure').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Unique Users</p>
          <p className="text-2xl font-bold text-blue-600">{new Set(logs.map(l => l.user)).size}</p>
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
                placeholder="Search logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <Select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              options={userOptions}
              className="w-full"
            />
          </div>

          {/* Action Filter */}
          <div>
            <Select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              options={actionOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Resource Filter */}
          <div>
            <Select
              value={resourceFilter}
              onChange={e => setResourceFilter(e.target.value)}
              options={resourceOptions}
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

          <div className="md:col-span-2 flex items-center justify-end">
            <p className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={paginatedLogs}
          emptyMessage="No audit logs found"
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredLogs.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Audit Log Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Log ID */}
              <div>
                <p className="text-sm text-gray-600">Log ID</p>
                <p className="text-xl font-bold text-gray-900 font-mono">{selectedLog.id}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                    selectedLog.status
                  )}`}
                >
                  {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                </span>
              </div>

              {/* Timestamp */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Timestamp</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(selectedLog.timestamp)}
                </p>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">User Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedLog.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedLog.user}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IP Address</p>
                    <p className="font-medium font-mono">{selectedLog.ipAddress}</p>
                  </div>
                </div>
              </div>

              {/* Action Information */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Action Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Action Type</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getActionBadge(
                        selectedLog.action
                      )}`}
                    >
                      {formatAction(selectedLog.action)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Resource Type</p>
                    <p className="font-medium capitalize">{selectedLog.resource}</p>
                  </div>
                  {selectedLog.resourceId && (
                    <div>
                      <p className="text-sm text-gray-600">Resource ID</p>
                      <p className="font-medium font-mono">{selectedLog.resourceId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Details</p>
                <p className="text-gray-900">{selectedLog.details}</p>
              </div>

              {/* Technical Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">User Agent</p>
                <p className="text-xs text-gray-700 font-mono break-all">{selectedLog.userAgent}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDetailModal(false)}
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

export default AuditLogsPage
