import { useState, useMemo } from 'react'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  Award,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Button, Select } from '../../components/atoms'
import { ChartCard, StatCard } from '../../components/molecules'
import clsx from 'clsx'

const DepotPerformancePage = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [selectedDepots, setSelectedDepots] = useState(['all'])
  const [sortBy, setSortBy] = useState('efficiency')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [comparisonView, setComparisonView] = useState('side-by-side')
  const [apiDepotData, setApiDepotData] = useState([])

  // Fetch real depot performance data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { default: zonalManagerService } = await import('../../services/zonalManagerService')
        const res = await zonalManagerService.getDepotPerformance({ days: timeRange })
        const items = Array.isArray(res) ? res : res?.data || res?.depots || []
        if (items.length > 0) setApiDepotData(items)
      } catch { /* use fallback */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange])

  // Mock data as fallback when API returns empty
  const depotData = useMemo(
    () => apiDepotData.length > 0 ? apiDepotData.map((d, i) => ({
      id: d._id || d.depotId || `depot-${i}`,
      name: d.name || d.depotId || `Depot ${i + 1}`,
      location: d.location || d.zone || '—',
      inspections: d.totalInspections || d.inspections || 0,
      completed: d.completedInspections || d.completed || 0,
      defects: d.totalDefects || d.defects || 0,
      avgResponseTime: d.avgResponseTime || 0,
      efficiency: d.efficiency || d.completionRate || 0,
      inspectors: d.inspectorCount || d.inspectors || 0,
      qrCodes: d.qrCodes || 0,
      trend: 'up',
      trendValue: d.trend || 0,
      color: ['#9333EA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i % 5],
    })) : [
      { id: 'depot-a', name: 'No Data', location: 'N/A', inspections: 0, completed: 0, defects: 0, avgResponseTime: 0, efficiency: 0, inspectors: 0, qrCodes: 0, trend: 'up', trendValue: 0, color: '#9333EA' },
    ],
    [apiDepotData]
  )

  // Performance trend data over time
  const performanceTrendData = useMemo(
    () => [
      {
        period: 'Week 1',
        'Depot A': 88,
        'Depot B': 85,
        'Depot C': 90,
        'Depot D': 82,
        'Depot E': 87,
      },
      {
        period: 'Week 2',
        'Depot A': 90,
        'Depot B': 87,
        'Depot C': 92,
        'Depot D': 84,
        'Depot E': 89,
      },
      {
        period: 'Week 3',
        'Depot A': 91,
        'Depot B': 88,
        'Depot C': 93,
        'Depot D': 86,
        'Depot E': 90,
      },
      {
        period: 'Week 4',
        'Depot A': 92,
        'Depot B': 89,
        'Depot C': 94,
        'Depot D': 87,
        'Depot E': 91,
      },
    ],
    []
  )

  // Radar chart data for multi-dimensional comparison
  const radarComparisonData = useMemo(
    () => [
      {
        metric: 'Efficiency',
        'Depot A': 92,
        'Depot B': 89,
        'Depot C': 94,
        'Depot D': 87,
        'Depot E': 91,
      },
      {
        metric: 'Quality',
        'Depot A': 88,
        'Depot B': 85,
        'Depot C': 91,
        'Depot D': 83,
        'Depot E': 87,
      },
      {
        metric: 'Speed',
        'Depot A': 90,
        'Depot B': 82,
        'Depot C': 95,
        'Depot D': 78,
        'Depot E': 85,
      },
      {
        metric: 'Resources',
        'Depot A': 85,
        'Depot B': 88,
        'Depot C': 92,
        'Depot D': 80,
        'Depot E': 86,
      },
      {
        metric: 'Compliance',
        'Depot A': 94,
        'Depot B': 91,
        'Depot C': 96,
        'Depot D': 89,
        'Depot E': 93,
      },
    ],
    []
  )

  // Sorted depot data
  const sortedDepots = useMemo(() => {
    const sorted = [...depotData].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    return sorted
  }, [depotData, sortBy, sortOrder])

  // Filter options
  const timeRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const depotOptions = [
    { value: 'all', label: 'All Depots' },
    ...depotData.map(depot => ({ value: depot.id, label: depot.name })),
  ]

  const sortOptions = [
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'inspections', label: 'Total Inspections' },
    { value: 'completed', label: 'Completed' },
    { value: 'defects', label: 'Defects' },
    { value: 'avgResponseTime', label: 'Response Time' },
  ]

  const comparisonViewOptions = [
    { value: 'side-by-side', label: 'Side by Side' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'radar', label: 'Radar Chart' },
  ]

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = format => {
    console.log(`Exporting depot performance data as ${format}`)
    alert(`Exporting data as ${format}... (Feature to be implemented)`)
  }

  const handleDepotClick = depot => {
    console.log('View depot details:', depot)
    alert(`Viewing details for ${depot.name}... (Feature to be implemented)`)
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // Calculate zone-wide metrics
  const zoneMetrics = useMemo(() => {
    const totalInspections = depotData.reduce((sum, d) => sum + d.inspections, 0)
    const totalCompleted = depotData.reduce((sum, d) => sum + d.completed, 0)
    const totalDefects = depotData.reduce((sum, d) => sum + d.defects, 0)
    const avgEfficiency = depotData.reduce((sum, d) => sum + d.efficiency, 0) / depotData.length
    const totalInspectors = depotData.reduce((sum, d) => sum + d.inspectors, 0)

    return {
      totalInspections,
      totalCompleted,
      totalDefects,
      avgEfficiency: avgEfficiency.toFixed(1),
      totalInspectors,
      completionRate: ((totalCompleted / totalInspections) * 100).toFixed(1),
    }
  }, [depotData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Depot Performance</h1>
          <p className="text-gray-600 mt-1">
            Comparative analysis and performance metrics across all depots
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('csv')}
            className="border border-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Time Period"
            options={timeRangeOptions}
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          />
          <Select
            label="Depot"
            options={depotOptions}
            value={selectedDepots[0]}
            onChange={e => setSelectedDepots([e.target.value])}
          />
          <Select
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          />
          <Select
            label="Comparison View"
            options={comparisonViewOptions}
            value={comparisonView}
            onChange={e => setComparisonView(e.target.value)}
          />
        </div>
      </div>

      {/* Zone-Wide Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardCheck}
          label="Total Inspections"
          value={zoneMetrics.totalInspections.toLocaleString()}
          trend="up"
          trendValue="+12.3%"
          variant="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Efficiency"
          value={`${zoneMetrics.avgEfficiency}%`}
          trend="up"
          trendValue="+4.2%"
          variant="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Total Defects"
          value={zoneMetrics.totalDefects.toLocaleString()}
          trend="down"
          trendValue="-8.5%"
          variant="yellow"
        />
        <StatCard
          icon={Users}
          label="Active Inspectors"
          value={zoneMetrics.totalInspectors.toLocaleString()}
          variant="gray"
        />
      </div>

      {/* Performance Trend Chart */}
      <ChartCard
        title="Depot Performance Trends"
        headerAction={<span className="text-sm text-gray-600">Last 4 weeks</span>}
      >
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={performanceTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="period" stroke="#6B7280" />
            <YAxis
              stroke="#6B7280"
              label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {depotData.map(depot => (
              <Line
                key={depot.id}
                type="monotone"
                dataKey={depot.name}
                stroke={depot.color}
                strokeWidth={2}
                dot={{ fill: depot.color, r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Side-by-Side Comparison */}
      {comparisonView === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inspection Volume Comparison */}
          <ChartCard title="Inspection Volume Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedDepots}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="inspections" fill="#9333EA" name="Total" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Defect Rate Comparison */}
          <ChartCard title="Defect Rate Comparison">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedDepots}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="defects" name="Defects" radius={[8, 8, 0, 0]}>
                  {sortedDepots.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Radar Chart Comparison */}
      {comparisonView === 'radar' && (
        <ChartCard title="Multi-Dimensional Performance Comparison">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarComparisonData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="metric" stroke="#6B7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {depotData.map(depot => (
                <Radar
                  key={depot.id}
                  name={depot.name}
                  dataKey={depot.name}
                  stroke={depot.color}
                  fill={depot.color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Depot Rankings Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Depot Rankings</h2>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Depot</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Inspections
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Completed
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Defects
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Efficiency
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Avg Response
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedDepots.map((depot, index) => (
                <tr
                  key={depot.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleDepotClick(depot)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: depot.color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{depot.name}</p>
                        <p className="text-xs text-gray-500">{depot.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-900">
                    {depot.inspections}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-900">{depot.completed}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {depot.defects}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        depot.efficiency >= 90
                          ? 'bg-green-100 text-green-700'
                          : depot.efficiency >= 85
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      )}
                    >
                      {depot.efficiency}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-gray-900">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {depot.avgResponseTime}h
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div
                      className={clsx(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        depot.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {depot.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(depot.trendValue)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleDepotClick(depot)
                      }}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performer */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Top Performer</h3>
          </div>
          <p className="text-2xl font-bold text-green-900 mb-1">{sortedDepots[0]?.name}</p>
          <p className="text-sm text-green-700">
            {sortedDepots[0]?.efficiency}% efficiency with {sortedDepots[0]?.completed} completed
            inspections
          </p>
        </div>

        {/* Needs Attention */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Needs Attention</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mb-1">
            {sortedDepots[sortedDepots.length - 1]?.name}
          </p>
          <p className="text-sm text-yellow-700">
            {sortedDepots[sortedDepots.length - 1]?.efficiency}% efficiency - below zone average
          </p>
        </div>

        {/* Most Improved */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Most Improved</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mb-1">
            {[...depotData].sort((a, b) => b.trendValue - a.trendValue)[0]?.name}
          </p>
          <p className="text-sm text-blue-700">
            +{[...depotData].sort((a, b) => b.trendValue - a.trendValue)[0]?.trendValue}%
            improvement this period
          </p>
        </div>
      </div>
    </div>
  )
}

export default DepotPerformancePage
