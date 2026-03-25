import { useState, useEffect } from 'react'
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'

const SystemHealthPage = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [systemHealth, setSystemHealth] = useState({
    overallStatus: 'healthy',
    apiMetrics: {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      successRate: 0,
    },
    databaseMetrics: {
      connectionPoolUsage: 0,
      activeConnections: 0,
      maxConnections: 0,
      queryPerformance: 0,
      slowQueries: 0,
      cacheHitRate: 0,
    },
    serverMetrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkIn: 0,
      networkOut: 0,
      uptime: 0,
    },
    services: [],
  })

  const fetchSystemHealth = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await systemService.getSystemHealth()

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data
      setSystemHealth({
        overallStatus: 'healthy',
        apiMetrics: {
          avgResponseTime: 145,
          p95ResponseTime: 320,
          p99ResponseTime: 580,
          requestsPerMinute: 1250,
          errorRate: 0.8,
          successRate: 99.2,
        },
        databaseMetrics: {
          connectionPoolUsage: 65,
          activeConnections: 13,
          maxConnections: 20,
          queryPerformance: 42,
          slowQueries: 3,
          cacheHitRate: 94.5,
        },
        serverMetrics: {
          cpuUsage: 45.2,
          memoryUsage: 68.7,
          diskUsage: 52.3,
          networkIn: 125.4,
          networkOut: 89.2,
          uptime: 99.8,
        },
        services: [
          { name: 'API Server', status: 'healthy', responseTime: 145 },
          { name: 'Database', status: 'healthy', responseTime: 42 },
          { name: 'Storage Service', status: 'healthy', responseTime: 78 },
          { name: 'Cache Server', status: 'warning', responseTime: 210 },
          { name: 'Email Service', status: 'healthy', responseTime: 156 },
          { name: 'Background Jobs', status: 'healthy', responseTime: null },
        ],
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchSystemHealth()
      setLoading(false)
    }

    loadData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemHealth()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSystemHealth()
    setRefreshing(false)
  }

  const getStatusColor = status => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBgColor = status => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'error':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
      case 'error':
        return <XCircle className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  const getMetricStatus = (value, thresholds = { warning: 70, error: 85 }) => {
    if (value >= thresholds.error) return 'error'
    if (value >= thresholds.warning) return 'warning'
    return 'healthy'
  }

  const formatUptime = percentage => {
    const downtime = 100 - percentage
    const hoursDown = (downtime / 100) * 24 * 30 // Approximate hours down per month
    return `${percentage}% (${hoursDown.toFixed(1)}h downtime/month)`
  }

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
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time monitoring of system performance and health metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-full ${getStatusBgColor(
              systemHealth.overallStatus
            )} ${getStatusColor(systemHealth.overallStatus)}`}
          >
            {getStatusIcon(systemHealth.overallStatus)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              System Status:{' '}
              <span className={getStatusColor(systemHealth.overallStatus)}>
                {systemHealth.overallStatus.charAt(0).toUpperCase() +
                  systemHealth.overallStatus.slice(1)}
              </span>
            </h2>
            <p className="text-sm text-gray-600">All critical services are operational</p>
          </div>
        </div>
      </div>

      {/* API Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">API Response Time Monitoring</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Average Response Time</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {systemHealth.apiMetrics.avgResponseTime}
                </p>
                <span className="text-sm text-gray-600">ms</span>
                <TrendingDown className="h-4 w-4 text-green-600 ml-2" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">P95 Response Time</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {systemHealth.apiMetrics.p95ResponseTime}
                </p>
                <span className="text-sm text-gray-600">ms</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">P99 Response Time</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {systemHealth.apiMetrics.p99ResponseTime}
                </p>
                <span className="text-sm text-gray-600">ms</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-2">Requests/Minute</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {systemHealth.apiMetrics.requestsPerMinute.toLocaleString()}
                </p>
                <TrendingUp className="h-4 w-4 text-blue-600 ml-2" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Success Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {systemHealth.apiMetrics.successRate}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Error Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-yellow-600">
                  {systemHealth.apiMetrics.errorRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Database Performance Metrics</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Connection Pool Usage</p>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-3xl font-bold ${
                    getMetricStatus(systemHealth.databaseMetrics.connectionPoolUsage) === 'healthy'
                      ? 'text-green-600'
                      : getMetricStatus(systemHealth.databaseMetrics.connectionPoolUsage) ===
                          'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {systemHealth.databaseMetrics.connectionPoolUsage}%
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {systemHealth.databaseMetrics.activeConnections} /{' '}
                {systemHealth.databaseMetrics.maxConnections} connections
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Query Performance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {systemHealth.databaseMetrics.queryPerformance}
                </p>
                <span className="text-sm text-gray-600">ms</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {systemHealth.databaseMetrics.slowQueries} slow queries
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Cache Hit Rate</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-green-600">
                  {systemHealth.databaseMetrics.cacheHitRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Resource Utilization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Server Resource Utilization</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-gray-600" />
                <p className="text-sm text-gray-600">CPU Usage</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-3xl font-bold ${
                    getMetricStatus(systemHealth.serverMetrics.cpuUsage) === 'healthy'
                      ? 'text-green-600'
                      : getMetricStatus(systemHealth.serverMetrics.cpuUsage) === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {systemHealth.serverMetrics.cpuUsage}%
                </p>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getMetricStatus(systemHealth.serverMetrics.cpuUsage) === 'healthy'
                      ? 'bg-green-600'
                      : getMetricStatus(systemHealth.serverMetrics.cpuUsage) === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${systemHealth.serverMetrics.cpuUsage}%` }}
                />
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="h-4 w-4 text-gray-600" />
                <p className="text-sm text-gray-600">Memory Usage</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-3xl font-bold ${
                    getMetricStatus(systemHealth.serverMetrics.memoryUsage) === 'healthy'
                      ? 'text-green-600'
                      : getMetricStatus(systemHealth.serverMetrics.memoryUsage) === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {systemHealth.serverMetrics.memoryUsage}%
                </p>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getMetricStatus(systemHealth.serverMetrics.memoryUsage) === 'healthy'
                      ? 'bg-green-600'
                      : getMetricStatus(systemHealth.serverMetrics.memoryUsage) === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${systemHealth.serverMetrics.memoryUsage}%` }}
                />
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-gray-600" />
                <p className="text-sm text-gray-600">Disk Usage</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-3xl font-bold ${
                    getMetricStatus(systemHealth.serverMetrics.diskUsage) === 'healthy'
                      ? 'text-green-600'
                      : getMetricStatus(systemHealth.serverMetrics.diskUsage) === 'warning'
                        ? 'bg-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {systemHealth.serverMetrics.diskUsage}%
                </p>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getMetricStatus(systemHealth.serverMetrics.diskUsage) === 'healthy'
                      ? 'bg-green-600'
                      : getMetricStatus(systemHealth.serverMetrics.diskUsage) === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${systemHealth.serverMetrics.diskUsage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-2">Network In</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {systemHealth.serverMetrics.networkIn}
                </p>
                <span className="text-sm text-gray-600">MB/s</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Network Out</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {systemHealth.serverMetrics.networkOut}
                </p>
                <span className="text-sm text-gray-600">MB/s</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">System Uptime</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {systemHealth.serverMetrics.uptime}%
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatUptime(systemHealth.serverMetrics.uptime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Services Status</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {systemHealth.services.map(service => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${getStatusBgColor(
                      service.status
                    )} ${getStatusColor(service.status)}`}
                  >
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      Status:{' '}
                      <span className={getStatusColor(service.status)}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                {service.responseTime !== null && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-semibold text-gray-900">{service.responseTime}ms</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthPage
