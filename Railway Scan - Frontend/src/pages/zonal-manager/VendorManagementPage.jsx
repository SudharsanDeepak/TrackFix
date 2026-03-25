import { useState, useMemo } from 'react'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ChevronRight,
  Edit,
  Eye,
} from 'lucide-react'
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
import { Button, Select } from '../../components/atoms'
import { ChartCard, StatCard } from '../../components/molecules'
import clsx from 'clsx'

const VendorManagementPage = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock vendor data - in real implementation, this would come from API
  const vendorData = useMemo(
    () => [
      {
        id: 'vendor-1',
        name: 'RailTech Solutions',
        category: 'Equipment',
        rating: 4.8,
        totalOrders: 156,
        completedOrders: 148,
        pendingOrders: 8,
        avgDeliveryTime: 3.2,
        onTimeDelivery: 95,
        qualityScore: 92,
        costEfficiency: 88,
        status: 'active',
        trend: 'up',
        trendValue: 5.2,
        lastOrder: '2024-01-15',
        totalValue: 2450000,
        color: '#9333EA',
      },
      {
        id: 'vendor-2',
        name: 'TrackMaster Industries',
        category: 'Maintenance',
        rating: 4.5,
        totalOrders: 203,
        completedOrders: 189,
        pendingOrders: 14,
        avgDeliveryTime: 4.1,
        onTimeDelivery: 93,
        qualityScore: 89,
        costEfficiency: 91,
        status: 'active',
        trend: 'up',
        trendValue: 3.1,
        lastOrder: '2024-01-18',
        totalValue: 3120000,
        color: '#3B82F6',
      },
      {
        id: 'vendor-3',
        name: 'SafeRail Components',
        category: 'Safety Equipment',
        rating: 4.9,
        totalOrders: 98,
        completedOrders: 96,
        pendingOrders: 2,
        avgDeliveryTime: 2.8,
        onTimeDelivery: 98,
        qualityScore: 96,
        costEfficiency: 85,
        status: 'active',
        trend: 'up',
        trendValue: 7.8,
        lastOrder: '2024-01-20',
        totalValue: 1890000,
        color: '#10B981',
      },
      {
        id: 'vendor-4',
        name: 'QuickFix Supplies',
        category: 'Spare Parts',
        rating: 4.2,
        totalOrders: 312,
        completedOrders: 285,
        pendingOrders: 27,
        avgDeliveryTime: 5.3,
        onTimeDelivery: 87,
        qualityScore: 84,
        costEfficiency: 94,
        status: 'active',
        trend: 'down',
        trendValue: -2.4,
        lastOrder: '2024-01-19',
        totalValue: 1560000,
        color: '#F59E0B',
      },
      {
        id: 'vendor-5',
        name: 'ElectroRail Systems',
        category: 'Electronics',
        rating: 4.6,
        totalOrders: 127,
        completedOrders: 119,
        pendingOrders: 8,
        avgDeliveryTime: 3.9,
        onTimeDelivery: 94,
        qualityScore: 90,
        costEfficiency: 89,
        status: 'active',
        trend: 'up',
        trendValue: 4.5,
        lastOrder: '2024-01-17',
        totalValue: 2780000,
        color: '#EF4444',
      },
      {
        id: 'vendor-6',
        name: 'Legacy Rail Parts',
        category: 'Equipment',
        rating: 3.8,
        totalOrders: 89,
        completedOrders: 78,
        pendingOrders: 11,
        avgDeliveryTime: 6.2,
        onTimeDelivery: 82,
        qualityScore: 79,
        costEfficiency: 86,
        status: 'warning',
        trend: 'down',
        trendValue: -5.1,
        lastOrder: '2024-01-10',
        totalValue: 980000,
        color: '#6B7280',
      },
    ],
    []
  )

  // Performance trend data over time
  const performanceTrendData = useMemo(
    () => [
      {
        month: 'Sep',
        RailTech: 4.6,
        TrackMaster: 4.3,
        SafeRail: 4.7,
        QuickFix: 4.4,
        ElectroRail: 4.4,
      },
      {
        month: 'Oct',
        RailTech: 4.7,
        TrackMaster: 4.4,
        SafeRail: 4.8,
        QuickFix: 4.3,
        ElectroRail: 4.5,
      },
      {
        month: 'Nov',
        RailTech: 4.7,
        TrackMaster: 4.5,
        SafeRail: 4.9,
        QuickFix: 4.2,
        ElectroRail: 4.6,
      },
      {
        month: 'Dec',
        RailTech: 4.8,
        TrackMaster: 4.5,
        SafeRail: 4.9,
        QuickFix: 4.2,
        ElectroRail: 4.6,
      },
    ],
    []
  )

  // Category distribution data
  const categoryDistributionData = useMemo(() => {
    const categories = {}
    vendorData.forEach(vendor => {
      if (!categories[vendor.category]) {
        categories[vendor.category] = { name: vendor.category, value: 0, count: 0 }
      }
      categories[vendor.category].value += vendor.totalValue
      categories[vendor.category].count += 1
    })
    return Object.values(categories)
  }, [vendorData])

  // Sorted vendor data
  const sortedVendors = useMemo(() => {
    let filtered = vendorData

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus)
    }

    // Filter by selected vendor
    if (selectedVendor !== 'all') {
      filtered = filtered.filter(v => v.id === selectedVendor)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    return sorted
  }, [vendorData, sortBy, sortOrder, filterStatus, selectedVendor])

  // Filter options
  const timeRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const vendorOptions = [
    { value: 'all', label: 'All Vendors' },
    ...vendorData.map(vendor => ({ value: vendor.id, label: vendor.name })),
  ]

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'totalOrders', label: 'Total Orders' },
    { value: 'onTimeDelivery', label: 'On-Time Delivery' },
    { value: 'qualityScore', label: 'Quality Score' },
    { value: 'costEfficiency', label: 'Cost Efficiency' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'warning', label: 'Warning' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleExport = format => {
    console.log(`Exporting vendor data as ${format}`)
    alert(`Exporting data as ${format}... (Feature to be implemented)`)
  }

  const handleVendorClick = vendor => {
    console.log('View vendor details:', vendor)
    alert(`Viewing details for ${vendor.name}... (Feature to be implemented)`)
  }

  const handleRateVendor = vendor => {
    console.log('Rate vendor:', vendor)
    alert(`Rating ${vendor.name}... (Feature to be implemented)`)
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const totalOrders = vendorData.reduce((sum, v) => sum + v.totalOrders, 0)
    const totalCompleted = vendorData.reduce((sum, v) => sum + v.completedOrders, 0)
    const avgRating = vendorData.reduce((sum, v) => sum + v.rating, 0) / vendorData.length
    const avgOnTime = vendorData.reduce((sum, v) => sum + v.onTimeDelivery, 0) / vendorData.length
    const totalValue = vendorData.reduce((sum, v) => sum + v.totalValue, 0)

    return {
      totalOrders,
      totalCompleted,
      avgRating: avgRating.toFixed(1),
      avgOnTime: avgOnTime.toFixed(1),
      totalValue,
      activeVendors: vendorData.filter(v => v.status === 'active').length,
    }
  }, [vendorData])

  // Chart colors
  const COLORS = ['#9333EA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">
            Track vendor performance, ratings, and manage vendor relationships
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
            label="Vendor"
            options={vendorOptions}
            value={selectedVendor}
            onChange={e => setSelectedVendor(e.target.value)}
          />
          <Select
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Overall Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Active Vendors"
          value={overallMetrics.activeVendors.toString()}
          variant="purple"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={overallMetrics.avgRating}
          trend="up"
          trendValue="+0.3"
          variant="yellow"
        />
        <StatCard
          icon={Package}
          label="Total Orders"
          value={overallMetrics.totalOrders.toLocaleString()}
          trend="up"
          trendValue="+12.5%"
          variant="blue"
        />
        <StatCard
          icon={Clock}
          label="On-Time Delivery"
          value={`${overallMetrics.avgOnTime}%`}
          trend="up"
          trendValue="+2.1%"
          variant="green"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Rating Trends */}
        <ChartCard
          title="Vendor Rating Trends"
          headerAction={<span className="text-sm text-gray-600">Last 4 months</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis
                stroke="#6B7280"
                domain={[3.5, 5]}
                label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
              />
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
                dataKey="RailTech"
                stroke="#9333EA"
                strokeWidth={2}
                dot={{ fill: '#9333EA', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="TrackMaster"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="SafeRail"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="QuickFix"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="ElectroRail"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard
          title="Vendor Category Distribution"
          headerAction={<span className="text-sm text-gray-600">By total value</span>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={value => `₹${(value / 1000000).toFixed(2)}M`}
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

      {/* Performance Comparison Chart */}
      <ChartCard title="Vendor Performance Comparison">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sortedVendors}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" angle={-15} textAnchor="end" height={80} />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="onTimeDelivery" fill="#10B981" name="On-Time %" radius={[8, 8, 0, 0]} />
            <Bar dataKey="qualityScore" fill="#9333EA" name="Quality %" radius={[8, 8, 0, 0]} />
            <Bar
              dataKey="costEfficiency"
              fill="#3B82F6"
              name="Cost Efficiency %"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Vendor List Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Vendor List</h2>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Rating
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  On-Time %
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Quality
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Cost Eff.
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVendors.map(vendor => (
                <tr
                  key={vendor.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleVendorClick(vendor)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: vendor.color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">
                          Last order: {new Date(vendor.lastOrder).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{vendor.rating}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{vendor.completedOrders}</span>
                      <span className="text-gray-500">/{vendor.totalOrders}</span>
                    </div>
                    {vendor.pendingOrders > 0 && (
                      <p className="text-xs text-gray-500">{vendor.pendingOrders} pending</p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        vendor.onTimeDelivery >= 95
                          ? 'bg-green-100 text-green-700'
                          : vendor.onTimeDelivery >= 90
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      )}
                    >
                      {vendor.onTimeDelivery}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        vendor.qualityScore >= 90
                          ? 'bg-green-100 text-green-700'
                          : vendor.qualityScore >= 85
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      )}
                    >
                      {vendor.qualityScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm text-gray-900">{vendor.costEfficiency}%</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {vendor.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    ) : vendor.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <AlertTriangle className="h-3 w-3" />
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div
                      className={clsx(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        vendor.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {vendor.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(vendor.trendValue)}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleRateVendor(vendor)
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Rate Vendor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleVendorClick(vendor)
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedVendors.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No vendors found matching the selected filters.</p>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Rated Vendor */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-900">Top Rated</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mb-1">
            {[...vendorData].sort((a, b) => b.rating - a.rating)[0]?.name}
          </p>
          <p className="text-sm text-yellow-700">
            {[...vendorData].sort((a, b) => b.rating - a.rating)[0]?.rating} stars with{' '}
            {[...vendorData].sort((a, b) => b.rating - a.rating)[0]?.completedOrders} completed
            orders
          </p>
        </div>

        {/* Most Reliable */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Most Reliable</h3>
          </div>
          <p className="text-2xl font-bold text-green-900 mb-1">
            {[...vendorData].sort((a, b) => b.onTimeDelivery - a.onTimeDelivery)[0]?.name}
          </p>
          <p className="text-sm text-green-700">
            {[...vendorData].sort((a, b) => b.onTimeDelivery - a.onTimeDelivery)[0]?.onTimeDelivery}
            % on-time delivery rate
          </p>
        </div>

        {/* Needs Attention */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Needs Attention</h3>
          </div>
          <p className="text-2xl font-bold text-red-900 mb-1">
            {vendorData.filter(v => v.status === 'warning')[0]?.name || 'None'}
          </p>
          <p className="text-sm text-red-700">
            {vendorData.filter(v => v.status === 'warning')[0]
              ? `${vendorData.filter(v => v.status === 'warning')[0].rating} stars - performance declining`
              : 'All vendors performing well'}
          </p>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{(overallMetrics.totalValue / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Delivery Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {(
                vendorData.reduce((sum, v) => sum + v.avgDeliveryTime, 0) / vendorData.length
              ).toFixed(1)}{' '}
              days
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {vendorData.reduce((sum, v) => sum + v.pendingOrders, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Quality Score</p>
            <p className="text-2xl font-bold text-gray-900">
              {(vendorData.reduce((sum, v) => sum + v.qualityScore, 0) / vendorData.length).toFixed(
                1
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorManagementPage
