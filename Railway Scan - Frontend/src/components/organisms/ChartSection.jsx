import { useState } from 'react'
import { ChartCard } from '../molecules'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const ChartSection = ({ chartData, loading = false }) => {
  const [dateRange, setDateRange] = useState('30d')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const vendorPerformanceData = chartData?.vendorPerformance || []
  const zoneFailuresData = chartData?.zoneFailures || []
  const warrantyTimelineData = chartData?.warrantyTimeline || []

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ir-blue"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Performance Chart */}
        <ChartCard
          title="Vendor Performance"
          loading={loading}
          isEmpty={vendorPerformanceData.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#0088FE" name="Performance Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Zone Failures Chart */}
        <ChartCard
          title="Failures by Zone"
          loading={loading}
          isEmpty={zoneFailuresData.length === 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={zoneFailuresData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneFailuresData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Warranty Timeline Chart */}
        <ChartCard
          title="Warranty Expiry Timeline"
          loading={loading}
          isEmpty={warrantyTimelineData.length === 0}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={warrantyTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="expiring" stroke="#FF8042" name="Expiring" />
              <Line type="monotone" dataKey="expired" stroke="#FF0000" name="Expired" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

export default ChartSection
