import { useState, useMemo } from 'react'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  FileDown,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
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
  ComposedChart,
} from 'recharts'
import { Button, Select } from '../../components/atoms'
import { ChartCard, StatCard } from '../../components/molecules'
import clsx from 'clsx'

const ReportsPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('performance')
  const [timeRange, setTimeRange] = useState('30')
  const [selectedDepot, setSelectedDepot] = useState('all')
  const [loading, setLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')

  // Mock data for trend analysis
  const performanceTrendData = useMemo(
    () => [
      { month: 'Jan', inspections: 1245, defects: 98, efficiency: 88, cost: 2.3 },
      { month: 'Feb', inspections: 1389, defects: 87, efficiency: 91, cost: 2.1 },
      { month: 'Mar', inspections: 1456, defects: 102, efficiency: 89, cost: 2.4 },
      { month: 'Apr', inspections: 1523, defects: 94, efficiency: 92, cost: 2.0 },
      { month: 'May', inspections: 1678, defects: 89, efficiency: 94, cost: 1.9 },
      { month: 'Jun', inspections: 1780, defects: 85, efficiency: 95, cost: 1.8 },
    ],
    []
  )

  const depotComparisonData = useMemo(
    () => [
      { depot: 'Depot A', q1: 456, q2: 489, q3: 512, q4: 534, target: 500 },
      { depot: 'Depot B', q1: 389, q2: 412, q3: 445, q4: 478, target: 450 },
      { depot: 'Depot C', q1: 512, q2: 534, q3: 556, q4: 589, target: 550 },
      { depot: 'Depot D', q1: 423, q2: 445, q3: 467, q4: 490, target: 475 },
    ],
    []
  )

  const defectTrendData = useMemo(
    () => [
      { week: 'W1', structural: 12, electrical: 8, mechanical: 6, safety: 3 },
      { week: 'W2', structural: 10, electrical: 9, mechanical: 7, safety: 2 },
      { week: 'W3', structural: 14, electrical: 7, mechanical: 5, safety: 4 },
      { week: 'W4', structural: 11, electrical: 10, mechanical: 8, safety: 3 },
    ],
    []
  )

  const resourceUtilizationData = useMemo(
    () => [
      { name: 'Inspectors', value: 85, color: '#9333EA' },
      { name: 'Equipment', value: 78, color: '#3B82F6' },
      { name: 'Vehicles', value: 92, color: '#10B981' },
      { name: 'Budget', value: 73, color: '#F59E0B' },
    ],
    []
  )

  const costAnalysisData = useMemo(
    () => [
      { category: 'Labor', amount: 4500000, percentage: 45 },
      { category: 'Equipment', amount: 2500000, percentage: 25 },
      { category: 'Materials', amount: 1800000, percentage: 18 },
      { category: 'Maintenance', amount: 1200000, percentage: 12 },
    ],
    []
  )

  // Report templates
  const reportTemplates = [
    {
      id: 'performance',
      name: 'Zone Performance Report',
      description: 'Comprehensive zone-wide performance metrics and trends',
      icon: BarChart3,
      color: 'purple',
    },
    {
      id: 'defects',
      name: 'Defect Analysis Report',
      description: 'Detailed defect trends and category breakdown',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      id: 'financial',
      name: 'Financial Summary Report',
      description: 'Cost analysis and budget utilization overview',
      icon: FileSpreadsheet,
      color: 'green',
    },
    {
      id: 'resource',
      name: 'Resource Utilization Report',
      description: 'Inspector, equipment, and resource allocation analysis',
      icon: PieChartIcon,
      color: 'blue',
    },
    {
      id: 'strategic',
      name: 'Strategic Overview Report',
      description: 'Executive summary with key insights and recommendations',
      icon: FileText,
      color: 'indigo',
    },
  ]

  // Filter options
  const timeRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '180', label: 'Last 6 Months' },
    { value: '365', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const depotOptions = [
    { value: 'all', label: 'All Depots' },
    { value: 'depot-a', label: 'Depot A' },
    { value: 'depot-b', label: 'Depot B' },
    { value: 'depot-c', label: 'Depot C' },
    { value: 'depot-d', label: 'Depot D' },
  ]

  const exportFormatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV Data' },
  ]

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const latestData = performanceTrendData[performanceTrendData.length - 1]
    const previousData = performanceTrendData[performanceTrendData.length - 2]

    return {
      totalInspections: latestData.inspections,
      inspectionChange: (
        ((latestData.inspections - previousData.inspections) / previousData.inspections) *
        100
      ).toFixed(1),
      totalDefects: latestData.defects,
      defectChange: (
        ((latestData.defects - previousData.defects) / previousData.defects) *
        100
      ).toFixed(1),
      efficiency: latestData.efficiency,
      efficiencyChange: (latestData.efficiency - previousData.efficiency).toFixed(1),
      avgCost: latestData.cost,
      costChange: (((latestData.cost - previousData.cost) / previousData.cost) * 100).toFixed(1),
    }
  }, [performanceTrendData])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    console.log(`Exporting ${selectedTemplate} report as ${exportFormat}`)
    alert(
      `Generating ${reportTemplates.find(t => t.id === selectedTemplate)?.name} as ${exportFormat.toUpperCase()}...\n\nThis feature will generate a comprehensive report with all charts and data tables.`
    )
  }

  const handlePreview = () => {
    console.log(`Previewing ${selectedTemplate} report`)
    alert(
      `Opening preview for ${reportTemplates.find(t => t.id === selectedTemplate)?.name}...\n\nThis will show a full-page preview before export.`
    )
  }

  const handleScheduleReport = () => {
    alert(
      'Schedule Report feature coming soon!\n\nYou will be able to:\n- Set up recurring reports\n- Choose delivery schedule\n- Select recipients\n- Configure auto-export'
    )
  }

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategic Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports with trend analysis and exportable data
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
            onClick={handlePreview}
            className="border border-gray-300"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Template Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Report Templates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map(template => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={clsx(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={clsx('p-2 rounded-lg', isSelected ? 'bg-purple-600' : 'bg-gray-100')}
                  >
                    <Icon
                      className={clsx('h-5 w-5', isSelected ? 'text-white' : 'text-gray-600')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={clsx(
                        'font-semibold mb-1',
                        isSelected ? 'text-purple-900' : 'text-gray-900'
                      )}
                    >
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filters and Export Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Report Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Time Period"
            options={timeRangeOptions}
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          />
          <Select
            label="Depot Filter"
            options={depotOptions}
            value={selectedDepot}
            onChange={e => setSelectedDepot(e.target.value)}
          />
          <Select
            label="Export Format"
            options={exportFormatOptions}
            value={exportFormat}
            onChange={e => setExportFormat(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleScheduleReport}
              className="w-full border border-gray-300"
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Inspections"
          value={summaryMetrics.totalInspections.toLocaleString()}
          trend={summaryMetrics.inspectionChange > 0 ? 'up' : 'down'}
          trendValue={`${summaryMetrics.inspectionChange > 0 ? '+' : ''}${summaryMetrics.inspectionChange}%`}
          variant="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Total Defects"
          value={summaryMetrics.totalDefects.toString()}
          trend={summaryMetrics.defectChange < 0 ? 'up' : 'down'}
          trendValue={`${summaryMetrics.defectChange > 0 ? '+' : ''}${summaryMetrics.defectChange}%`}
          variant={summaryMetrics.defectChange < 0 ? 'green' : 'red'}
        />
        <StatCard
          icon={TrendingUp}
          label="Efficiency Rate"
          value={`${summaryMetrics.efficiency}%`}
          trend={summaryMetrics.efficiencyChange > 0 ? 'up' : 'down'}
          trendValue={`${summaryMetrics.efficiencyChange > 0 ? '+' : ''}${summaryMetrics.efficiencyChange}%`}
          variant="green"
        />
        <StatCard
          icon={FileSpreadsheet}
          label="Avg Cost per Inspection"
          value={`₹${summaryMetrics.avgCost}K`}
          trend={summaryMetrics.costChange < 0 ? 'up' : 'down'}
          trendValue={`${summaryMetrics.costChange > 0 ? '+' : ''}${summaryMetrics.costChange}%`}
          variant={summaryMetrics.costChange < 0 ? 'green' : 'red'}
        />
      </div>

      {/* Performance Trend Analysis */}
      <ChartCard
        title="6-Month Performance Trend Analysis"
        headerAction={
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Jan - Jun 2024</span>
            <button
              onClick={handleExport}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Export Chart →
            </button>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={performanceTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis yAxisId="left" stroke="#6B7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="inspections"
              fill="#9333EA"
              name="Inspections"
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="efficiency"
              stroke="#10B981"
              strokeWidth={3}
              name="Efficiency %"
              dot={{ fill: '#10B981', r: 5 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="defects"
              stroke="#EF4444"
              strokeWidth={2}
              name="Defects"
              dot={{ fill: '#EF4444', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Depot Comparison and Defect Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Depot Comparison */}
        <ChartCard
          title="Quarterly Depot Performance"
          headerAction={<span className="text-sm text-gray-600">vs Target</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depotComparisonData}>
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
              <Bar dataKey="q1" fill="#9333EA" name="Q1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="q2" fill="#A855F7" name="Q2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="q3" fill="#C084FC" name="Q3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="q4" fill="#D8B4FE" name="Q4" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
                dot={{ fill: '#EF4444', r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Defect Category Trends */}
        <ChartCard
          title="Weekly Defect Category Breakdown"
          headerAction={<span className="text-sm text-gray-600">Last 4 weeks</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={defectTrendData}>
              <defs>
                <linearGradient id="colorStructural" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorElectrical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMechanical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSafety" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="structural"
                stackId="1"
                stroke="#EF4444"
                fill="url(#colorStructural)"
                name="Structural"
              />
              <Area
                type="monotone"
                dataKey="electrical"
                stackId="1"
                stroke="#F59E0B"
                fill="url(#colorElectrical)"
                name="Electrical"
              />
              <Area
                type="monotone"
                dataKey="mechanical"
                stackId="1"
                stroke="#3B82F6"
                fill="url(#colorMechanical)"
                name="Mechanical"
              />
              <Area
                type="monotone"
                dataKey="safety"
                stackId="1"
                stroke="#10B981"
                fill="url(#colorSafety)"
                name="Safety"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Resource Utilization and Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Utilization */}
        <ChartCard
          title="Resource Utilization Overview"
          headerAction={<span className="text-sm text-gray-600">Current Period</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resourceUtilizationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {resourceUtilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={value => `${value}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {resourceUtilizationData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Cost Analysis */}
        <ChartCard
          title="Cost Distribution Analysis"
          headerAction={<span className="text-sm text-gray-600">Total: ₹10M</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costAnalysisData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="category" type="category" stroke="#6B7280" width={100} />
              <Tooltip
                formatter={value => `₹${(value / 1000000).toFixed(2)}M`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="amount"
                fill="#9333EA"
                radius={[0, 8, 8, 0]}
                label={{
                  position: 'right',
                  formatter: value => `${((value / 10000000) * 100).toFixed(0)}%`,
                }}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {costAnalysisData.map(item => (
              <div key={item.category} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">{item.category}</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{(item.amount / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-purple-600 font-medium">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Key Insights and Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Key Insights & Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Insights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-green-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Positive Trends
            </h3>
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900 font-medium mb-1">Efficiency Improvement</p>
                <p className="text-xs text-green-700">
                  Zone efficiency increased by 7% over the last 6 months, exceeding target by 3%.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900 font-medium mb-1">Cost Reduction</p>
                <p className="text-xs text-green-700">
                  Average cost per inspection decreased by 21.7%, saving ₹500K monthly.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900 font-medium mb-1">Depot C Performance</p>
                <p className="text-xs text-green-700">
                  Depot C consistently exceeds targets, showing 8% growth quarter-over-quarter.
                </p>
              </div>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Recommendations
            </h3>
            <div className="space-y-2">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-900 font-medium mb-1">
                  Structural Defects Rising
                </p>
                <p className="text-xs text-orange-700">
                  Structural defects increased 16.7% in W3. Recommend additional training and
                  equipment inspection.
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-900 font-medium mb-1">Depot B Underperforming</p>
                <p className="text-xs text-orange-700">
                  Depot B is 6% below target. Consider resource reallocation and process review.
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-900 font-medium mb-1">Budget Utilization Low</p>
                <p className="text-xs text-orange-700">
                  Only 73% budget utilized. Identify opportunities for strategic investments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Ready to Export Report</h3>
            <p className="text-sm text-purple-700">
              Current selection: <span className="font-semibold">{selectedTemplateData?.name}</span>
            </p>
            <p className="text-sm text-purple-700">
              Format: <span className="font-semibold">{exportFormat.toUpperCase()}</span> • Period:{' '}
              <span className="font-semibold">
                {timeRangeOptions.find(o => o.value === timeRange)?.label}
              </span>{' '}
              • Depot:{' '}
              <span className="font-semibold">
                {depotOptions.find(o => o.value === selectedDepot)?.label}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={handlePreview}
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Report
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExport}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {exportFormat === 'pdf' && <FilePdf className="h-4 w-4 mr-2" />}
              {exportFormat === 'excel' && <FileSpreadsheet className="h-4 w-4 mr-2" />}
              {exportFormat === 'csv' && <Download className="h-4 w-4 mr-2" />}
              Export as {exportFormat.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
