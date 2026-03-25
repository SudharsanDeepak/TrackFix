import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  Building2,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
  ChevronRight,
  ArrowUpCircle,
  Eye,
  MessageSquare,
  User,
} from 'lucide-react'
import { Button, Select } from '../../components/atoms'
import { StatCard } from '../../components/molecules'
import clsx from 'clsx'

const AlertsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)

  // Mock alert data - in real implementation, this would come from API
  const alertsData = useMemo(
    () => [
      {
        id: 'alert-1',
        title: 'Critical Defect Rate Spike at Depot A',
        description:
          'Defect rate has increased by 45% in the last 7 days, exceeding the threshold of 15%.',
        severity: 'critical',
        category: 'quality',
        status: 'open',
        depot: 'Depot A - Central',
        createdAt: '2024-01-20T08:30:00',
        updatedAt: '2024-01-20T08:30:00',
        assignedTo: 'Rajesh Kumar',
        metrics: {
          currentValue: 22.5,
          threshold: 15,
          change: '+45%',
        },
        actions: ['Escalate', 'Investigate', 'Assign Inspector'],
      },
      {
        id: 'alert-2',
        title: 'Inspection Completion Rate Below Target',
        description:
          'Depot B has only completed 68% of scheduled inspections this week, below the 85% target.',
        severity: 'high',
        category: 'performance',
        status: 'open',
        depot: 'Depot B - North',
        createdAt: '2024-01-20T10:15:00',
        updatedAt: '2024-01-20T10:15:00',
        assignedTo: null,
        metrics: {
          currentValue: 68,
          threshold: 85,
          change: '-20%',
        },
        actions: ['Assign Manager', 'Review Schedule', 'Request Resources'],
      },
      {
        id: 'alert-3',
        title: 'Vendor Delivery Delays',
        description: 'QuickFix Supplies has missed delivery deadlines for 3 consecutive orders.',
        severity: 'medium',
        category: 'vendor',
        status: 'in-progress',
        depot: 'Multiple Depots',
        createdAt: '2024-01-19T14:20:00',
        updatedAt: '2024-01-20T09:00:00',
        assignedTo: 'Priya Sharma',
        metrics: {
          currentValue: 3,
          threshold: 2,
          change: '+50%',
        },
        actions: ['Contact Vendor', 'Find Alternative', 'Review Contract'],
      },
      {
        id: 'alert-4',
        title: 'System Response Time Degradation',
        description: 'API response times have increased to 2.8s, exceeding the 2s threshold.',
        severity: 'high',
        category: 'system',
        status: 'open',
        depot: 'System-wide',
        createdAt: '2024-01-20T11:45:00',
        updatedAt: '2024-01-20T11:45:00',
        assignedTo: null,
        metrics: {
          currentValue: 2.8,
          threshold: 2.0,
          change: '+40%',
        },
        actions: ['Escalate to IT', 'Check Server Load', 'Review Logs'],
      },
      {
        id: 'alert-5',
        title: 'Low Inventory Alert - Safety Equipment',
        description: 'Safety equipment stock at Depot C has fallen below minimum required levels.',
        severity: 'medium',
        category: 'inventory',
        status: 'open',
        depot: 'Depot C - South',
        createdAt: '2024-01-20T07:00:00',
        updatedAt: '2024-01-20T07:00:00',
        assignedTo: 'Amit Patel',
        metrics: {
          currentValue: 12,
          threshold: 25,
          change: '-52%',
        },
        actions: ['Order Supplies', 'Transfer from Other Depot', 'Expedite Delivery'],
      },
      {
        id: 'alert-6',
        title: 'Inspector Attendance Issue',
        description: '3 inspectors absent at Depot A, affecting daily inspection capacity.',
        severity: 'medium',
        category: 'staffing',
        status: 'in-progress',
        depot: 'Depot A - Central',
        createdAt: '2024-01-20T06:30:00',
        updatedAt: '2024-01-20T08:00:00',
        assignedTo: 'Rajesh Kumar',
        metrics: {
          currentValue: 3,
          threshold: 1,
          change: '+200%',
        },
        actions: ['Reassign Tasks', 'Call Backup Staff', 'Reschedule Inspections'],
      },
      {
        id: 'alert-7',
        title: 'Quality Audit Failed',
        description:
          'Depot D failed quarterly quality audit with a score of 72%, below the 80% requirement.',
        severity: 'critical',
        category: 'quality',
        status: 'open',
        depot: 'Depot D - East',
        createdAt: '2024-01-19T16:00:00',
        updatedAt: '2024-01-19T16:00:00',
        assignedTo: null,
        metrics: {
          currentValue: 72,
          threshold: 80,
          change: '-10%',
        },
        actions: ['Schedule Re-audit', 'Training Program', 'Process Review'],
      },
      {
        id: 'alert-8',
        title: 'Budget Overrun Warning',
        description: 'Zone maintenance budget has reached 92% utilization with 2 months remaining.',
        severity: 'high',
        category: 'budget',
        status: 'open',
        depot: 'Zone-wide',
        createdAt: '2024-01-20T09:30:00',
        updatedAt: '2024-01-20T09:30:00',
        assignedTo: null,
        metrics: {
          currentValue: 92,
          threshold: 75,
          change: '+23%',
        },
        actions: ['Review Expenses', 'Request Additional Budget', 'Defer Non-Critical Work'],
      },
      {
        id: 'alert-9',
        title: 'Equipment Maintenance Overdue',
        description: '5 critical equipment items at Depot B have overdue maintenance schedules.',
        severity: 'medium',
        category: 'maintenance',
        status: 'resolved',
        depot: 'Depot B - North',
        createdAt: '2024-01-18T10:00:00',
        updatedAt: '2024-01-19T15:30:00',
        assignedTo: 'Priya Sharma',
        metrics: {
          currentValue: 5,
          threshold: 0,
          change: '+500%',
        },
        actions: [],
        resolution: 'All equipment maintenance completed on 2024-01-19',
      },
      {
        id: 'alert-10',
        title: 'Data Sync Failure',
        description:
          'Mobile app data synchronization failed for 12 inspectors in the last 24 hours.',
        severity: 'high',
        category: 'system',
        status: 'in-progress',
        depot: 'Multiple Depots',
        createdAt: '2024-01-20T05:00:00',
        updatedAt: '2024-01-20T10:30:00',
        assignedTo: 'Tech Support',
        metrics: {
          currentValue: 12,
          threshold: 2,
          change: '+500%',
        },
        actions: ['Reset Sync', 'Check Network', 'Manual Data Entry'],
      },
    ],
    []
  )

  // Filter and search alerts
  const filteredAlerts = useMemo(() => {
    return alertsData.filter(alert => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.depot.toLowerCase().includes(searchQuery.toLowerCase())

      // Severity filter
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter

      // Status filter
      const matchesStatus = statusFilter === 'all' || alert.status === statusFilter

      // Category filter
      const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter

      return matchesSearch && matchesSeverity && matchesStatus && matchesCategory
    })
  }, [alertsData, searchQuery, severityFilter, statusFilter, categoryFilter])

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = alertsData.length
    const critical = alertsData.filter(a => a.severity === 'critical').length
    const open = alertsData.filter(a => a.status === 'open').length
    const resolved = alertsData.filter(a => a.status === 'resolved').length
    const inProgress = alertsData.filter(a => a.status === 'in-progress').length

    return { total, critical, open, resolved, inProgress }
  }, [alertsData])

  // Filter options
  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'quality', label: 'Quality' },
    { value: 'performance', label: 'Performance' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'system', label: 'System' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'staffing', label: 'Staffing' },
    { value: 'budget', label: 'Budget' },
    { value: 'maintenance', label: 'Maintenance' },
  ]

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleEscalate = alert => {
    console.log('Escalating alert:', alert)
    alert(`Escalating alert: ${alert.title}... (Feature to be implemented)`)
  }

  const handleResolve = alert => {
    console.log('Resolving alert:', alert)
    alert(`Resolving alert: ${alert.title}... (Feature to be implemented)`)
  }

  const handleAssign = alert => {
    console.log('Assigning alert:', alert)
    alert(`Assigning alert: ${alert.title}... (Feature to be implemented)`)
  }

  const handleViewDetails = alert => {
    setSelectedAlert(alert)
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getSeverityIcon = severity => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'resolved':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryIcon = category => {
    switch (category) {
      case 'quality':
        return <CheckCircle className="h-4 w-4" />
      case 'performance':
        return <TrendingUp className="h-4 w-4" />
      case 'system':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Critical Alerts</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage alerts requiring managerial attention
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            loading={loading}
            className="border border-gray-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Bell}
          label="Total Alerts"
          value={summaryMetrics.total.toString()}
          variant="purple"
        />
        <StatCard
          icon={XCircle}
          label="Critical Alerts"
          value={summaryMetrics.critical.toString()}
          variant="red"
        />
        <StatCard
          icon={AlertTriangle}
          label="Open Alerts"
          value={summaryMetrics.open.toString()}
          variant="yellow"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved Today"
          value={summaryMetrics.resolved.toString()}
          variant="green"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts by title, description, or depot..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Severity"
            options={severityOptions}
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Alerts ({filteredAlerts.length})</h2>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={clsx(
                'border rounded-lg p-4 transition-all duration-200',
                'hover:shadow-md cursor-pointer',
                alert.severity === 'critical' && 'border-red-300 bg-red-50',
                alert.severity === 'high' && 'border-orange-300 bg-orange-50',
                alert.severity === 'medium' && 'border-yellow-300 bg-yellow-50',
                alert.severity === 'low' && 'border-blue-300 bg-blue-50',
                alert.status === 'resolved' && 'opacity-60'
              )}
              onClick={() => handleViewDetails(alert)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Alert Header */}
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={clsx('p-2 rounded-lg border', getSeverityColor(alert.severity))}
                    >
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                            getSeverityColor(alert.severity)
                          )}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        <span
                          className={clsx(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(alert.status)
                          )}
                        >
                          {alert.status === 'in-progress'
                            ? 'In Progress'
                            : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                    </div>
                  </div>

                  {/* Alert Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3 ml-14">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{alert.depot}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(alert.category)}
                      <span className="capitalize">{alert.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                    {alert.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{alert.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 mb-3 ml-14">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-600">Current:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {alert.metrics.currentValue}
                        {alert.category === 'performance' || alert.category === 'quality'
                          ? '%'
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-600">Threshold:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {alert.metrics.threshold}
                        {alert.category === 'performance' || alert.category === 'quality'
                          ? '%'
                          : ''}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        'flex items-center gap-1 px-3 py-1.5 rounded-lg border',
                        alert.metrics.change.startsWith('+')
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-green-50 border-green-200 text-green-700'
                      )}
                    >
                      <span className="text-sm font-semibold">{alert.metrics.change}</span>
                    </div>
                  </div>

                  {/* Resolution Note */}
                  {alert.resolution && (
                    <div className="ml-14 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Resolution:</strong> {alert.resolution}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {alert.status !== 'resolved' && alert.actions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 ml-14 mt-3">
                      {alert.actions.slice(0, 3).map((action, index) => (
                        <button
                          key={index}
                          onClick={e => {
                            e.stopPropagation()
                            if (action.includes('Escalate')) handleEscalate(alert)
                            else if (action.includes('Assign')) handleAssign(alert)
                            else console.log(`Action: ${action}`)
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleViewDetails(alert)
                  }}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex-shrink-0"
                  title="View Details"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No alerts found matching the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escalation Guide */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Escalation</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Critical alerts require immediate escalation to senior management or technical teams.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={() => alert('Opening escalation workflow... (Feature to be implemented)')}
          >
            Escalate Critical Alerts
          </Button>
        </div>

        {/* Assignment Guide */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Assignment</h3>
          </div>
          <p className="text-sm text-purple-700 mb-3">
            Assign alerts to appropriate team members for investigation and resolution.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => alert('Opening assignment panel... (Feature to be implemented)')}
          >
            Assign Alerts
          </Button>
        </div>

        {/* Resolution Workflow */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Resolution</h3>
          </div>
          <p className="text-sm text-green-700 mb-3">
            Mark alerts as resolved once the underlying issue has been addressed.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => alert('Opening resolution workflow... (Feature to be implemented)')}
          >
            Resolve Alerts
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AlertsPage
