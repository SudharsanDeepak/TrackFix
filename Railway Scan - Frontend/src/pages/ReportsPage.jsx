import { useState } from 'react'
import toast from 'react-hot-toast'
import { FileText, Download } from 'lucide-react'
import { Button, Badge } from '../components/atoms'
import { DataTable } from '../components/organisms'
import reportService from '../services/reportService'

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('vendor-ranking')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchReport = async reportType => {
    try {
      setLoading(true)
      let result
      switch (reportType) {
        case 'vendor-ranking':
          result = await reportService.getVendorRanking({ days: 30 })
          break
        case 'zone-failures':
          result = await reportService.getZoneFailureAnalysis({ days: 30 })
          break
        case 'warranty':
          result = await reportService.getWarrantyExpiry()
          break
        case 'recall':
          result = await reportService.getRecallDetection()
          break
        default:
          result = { data: [] }
      }
      setReportData(result.data || [])
    } catch (error) {
      toast.error('Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async format => {
    try {
      const blob =
        format === 'csv'
          ? await reportService.exportCSV(activeTab, reportData)
          : await reportService.exportPDF(activeTab, reportData)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeTab}-report.${format}`
      a.click()
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const vendorColumns = [
    { key: 'rank', label: 'Rank', sortable: true },
    { key: 'name', label: 'Vendor Name', sortable: true },
    {
      key: 'performanceScore',
      label: 'Score',
      render: value => (
        <Badge variant={value >= 80 ? 'green' : value >= 60 ? 'yellow' : 'red'}>{value}</Badge>
      ),
    },
    { key: 'qualityRating', label: 'Quality' },
    { key: 'deliveryPerformance', label: 'Delivery' },
    { key: 'defectRate', label: 'Defect Rate' },
  ]

  const zoneColumns = [
    { key: 'zone', label: 'Zone', sortable: true },
    { key: 'failureCount', label: 'Failures', sortable: true },
    { key: 'failureRate', label: 'Failure Rate' },
    { key: 'totalFittings', label: 'Total Fittings' },
  ]

  const warrantyColumns = [
    { key: 'qrCode', label: 'QR Code' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'expiryDate', label: 'Expiry Date', sortable: true },
    { key: 'zone', label: 'Zone' },
    {
      key: 'status',
      label: 'Status',
      render: value => <Badge variant={value === 'EXPIRED' ? 'red' : 'yellow'}>{value}</Badge>,
    },
  ]

  const recallColumns = [
    { key: 'lotNumber', label: 'Lot Number', sortable: true },
    { key: 'vendor', label: 'Vendor' },
    { key: 'failureCount', label: 'Failures', sortable: true },
    { key: 'totalCount', label: 'Total' },
    {
      key: 'failureRate',
      label: 'Failure Rate',
      render: value => <Badge variant={value >= 15 ? 'red' : 'yellow'}>{value}%</Badge>,
    },
  ]

  const getColumns = () => {
    switch (activeTab) {
      case 'vendor-ranking':
        return vendorColumns
      case 'zone-failures':
        return zoneColumns
      case 'warranty':
        return warrantyColumns
      case 'recall':
        return recallColumns
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate and export comprehensive reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'vendor-ranking', label: 'Vendor Ranking' },
            { key: 'zone-failures', label: 'Zone Failures' },
            { key: 'warranty', label: 'Warranty Expiry' },
            { key: 'recall', label: 'Recall Detection' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                fetchReport(tab.key)
              }}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-ir-blue text-ir-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <DataTable
        columns={getColumns()}
        data={reportData}
        loading={loading}
        emptyMessage="No data available for this report"
        currentPage={1}
        pageSize={20}
        totalItems={reportData.length}
        showActions={false}
      />
    </div>
  )
}

export default ReportsPage
