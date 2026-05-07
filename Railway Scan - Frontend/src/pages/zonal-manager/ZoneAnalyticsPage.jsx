import { useState, useMemo, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  ClipboardCheck,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Button, Select } from '../../components/atoms'
import { ChartCard, StatCard } from '../../components/molecules'
import clsx from 'clsx'

const ZoneAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [selectedDepot, setSelectedDepot] = useState('all')
  const [comparisonPeriod, setComparisonPeriod] = useState('previous')
  const [loading, setLoading] = useState(false)
  const [apiData, setApiData] = useState(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [trendsRes, defectRes] = await Promise.allSettled([
          import('../../services/zonalManagerService').then(m => m.default.getInspectionTrends({ days: timeRange })),
          import('../../services/zonalManagerService').then(m => m.default.getDefectRateTrends({ days: timeRange })),
        ])
        setApiData({
          trends: trendsRes.status === 'fulfilled' ? trendsRes.value : null,
          defects: defectRes.status === 'fulfilled' ? defectRes.value : null,
        })
      } catch { /* use fallback data */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange])

  // Use API data if available, otherwise use illustrative fallback
  const inspectionTrendData = useMemo(() => {
    const raw = apiData?.trends?.data || apiData?.trends
    if (Array.isArray(raw) && raw.length > 0) return raw
    return [
      { date: 'Week 1', inspections: 0, defects: 0, completion: 0 },
      { date: 'Week 2', inspections: 0, defects: 0, completion: 0 },
      { date: 'Week 3', inspections: 0, defects: 0, completion: 0 },
      { date: 'Week 4', inspections: 0, defects: 0, completion: 0 },
    ]
  }, [apiData])

  const depotPerformanceData = useMemo(() => {
    const raw = apiData?.trends?.data || apiData?.trends
    if (Array.isArray(raw) && raw.length > 0) return raw
    return []
  }, [apiData])

  const defectCategoryData = useMemo(() => {
    const raw = apiData?.defects?.categories || apiData?.defects
    if (Array.isArray(raw) && raw.length > 0) return raw
    return []
  }, [apiData])

  const comparisonData = useMemo(() => {
    const raw = apiData?.comparison || null
    if (Array.isArray(raw) && raw.length > 0) return raw
    return []
  }, [apiData])

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const depotOptions = [
    { value: 'all', label: 'All Depots' },
    { value: 'depot-a', label: 'Depot A' },
    { value: 'depot-b', label: 'Depot B' },
    { value: 'depot-c', label: 'Depot C' },
    { value: 'depot-d', label: 'Depot D' },
  ]

  const comparisonOptions = [
    { value: 'previous', label: 'Previous Period' },
    { value: 'year', label: 'Same Period Last Year' },
    { value: 'target', label: 'Target Values' },
  ]

  const handleExport = format => {
    // In real implementation, this would generate and download the file
    console.log(`Exporting analytics data as ${format}`)
    alert(`Exporting data as ${format}... (Feature to be implemented)`)
  }

  const handleRefresh = () => {
    setApiData(null)
    setLoading(true)
    // Re-trigger useEffect by toggling timeRange
    setTimeRange(t => t)
  }

  const handleDrillDown = dataPoint => {
    console.log('Drill down into:', dataPoint)
    // In real implementation, this would navigate to detailed view or show modal
    alert(`Drilling down into ${dataPoint.depot || dataPoint.date}... (Feature to be implemented)`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zone Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive zone-wide metrics and performance insights
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
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('pdf')}
            className="border border-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Time Range"
            options={timeRangeOptions}
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          />
          <Select
            label="Depot"
            options={depotOptions}
            value={selectedDepot}
            onChange={e => setSelectedDepot(e.target.value)}
          />
          <Select
            label="Compare With"
            options={comparisonOptions}
            value={comparisonPeriod}
            onChange={e => setComparisonPeriod(e.target.value)}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Inspections"
          value={
            apiData?.trends?.totalInspections ||
            (Array.isArray(apiData?.trends?.data)
              ? apiData.trends.data.reduce((sum, item) => sum + (item.inspections || 0), 0)
              : '—')
          }
          trend={apiData?.trends?.trendDirection || 'up'}
          trendValue={apiData?.trends?.trendValue || '0.0%'}
          variant="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Total Defects"
          value={
            apiData?.defects?.totalDefects ||
            (Array.isArray(apiData?.defects?.data)
              ? apiData.defects.data.reduce((sum, item) => sum + (item.count || item.defects || 0), 0)
              : '—')
          }
          trend={apiData?.defects?.trendDirection || 'down'}
          trendValue={apiData?.defects?.trendValue || '0.0%'}
          variant="red"
        />
        <StatCard
          icon={Users}
          label="Completion Rate"
          value={apiData?.trends?.completionRate ? `${apiData.trends.completionRate}%` : '—'}
          trend={apiData?.trends?.completionTrend || 'up'}
          trendValue={apiData?.trends?.completionChange || '0.0%'}
          variant="green"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Avg Response Time"
          value={apiData?.trends?.avgResponseTime ? `${apiData.trends.avgResponseTime} ms` : '—'}
          trend={apiData?.trends?.responseTimeTrend || 'down'}
          trendValue={apiData?.trends?.responseTimeChange || '0.0%'}
          variant="purple"
        />
      </div>

      <ChartCard
        title="Inspection Trends"
        headerAction={
          <button
            onClick={() => handleDrillDown({ type: 'trends' })}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View Details →
          </button>
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={inspectionTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="inspections"
              stroke="#9333EA"
              strokeWidth={2}
              name="Inspections"
              dot={{ fill: '#9333EA', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="defects"
              stroke="#EF4444"
              strokeWidth={2}
              name="Defects"
              dot={{ fill: '#EF4444', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="#10B981"
              strokeWidth={2}
              name="Completion %"
              dot={{ fill: '#10B981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Depot Performance and Defect Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Depot Performance Chart */}
        <ChartCard
          title="Depot Performance Comparison"
          headerAction={
            <button
              onClick={() => handleDrillDown({ type: 'depots' })}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depotPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="depot" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="inspections"
                fill="#9333EA"
                name="Inspections"
                radius={[8, 8, 0, 0]}
                onClick={data => handleDrillDown(data)}
                cursor="pointer"
              />
              <Bar
                dataKey="defects"
                fill="#EF4444"
                name="Defects"
                radius={[8, 8, 0, 0]}
                onClick={data => handleDrillDown(data)}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Defect Categories Chart */}
        <ChartCard
          title="Defect Categories Distribution"
          headerAction={
            <button
              onClick={() => handleDrillDown({ type: 'defects' })}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View Details →
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={defectCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {defectCategoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    onClick={() => handleDrillDown({ category: entry.name })}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Period Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Period Comparison</h2>
          <span className="text-sm text-gray-600">
            Current vs{' '}
            {comparisonPeriod === 'previous' ? 'Previous Period' : 'Same Period Last Year'}
          </span>
        </div>

        <div className="space-y-4">
          {comparisonData.map(item => (
            <div
              key={item.metric}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => handleDrillDown({ metric: item.metric })}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{item.metric}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-lg font-bold text-gray-900">{item.current}</span>
                  <span className="text-sm text-gray-500">vs {item.previous}</span>
                </div>
              </div>

              <div
                className={clsx(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                  item.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}
              >
                {item.change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4 rotate-180" />
                )}
                <span>{Math.abs(item.change)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Efficiency Trend Area Chart */}
      <ChartCard
        title="Zone-Wide Efficiency Trend"
        headerAction={
          <button
            onClick={() => handleDrillDown({ type: 'efficiency' })}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View Details →
          </button>
        }
      >
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={inspectionTrendData}>
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="#9333EA"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompletion)"
              name="Completion Rate %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

export default ZoneAnalyticsPage
