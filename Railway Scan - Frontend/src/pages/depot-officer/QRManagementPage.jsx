import { useState, useEffect } from 'react'
import {
  QrCode,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import Badge from '../../components/atoms/Badge'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const QRManagementPage = () => {
  const [qrCodes, setQrCodes] = useState([])
  const [filteredCodes, setFilteredCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const [generateForm, setGenerateForm] = useState({
    assetType: '',
    prefix: '',
    startNumber: '1',
    quantity: '10',
    location: '',
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'track', label: 'Track' },
    { value: 'signal', label: 'Signal' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'station', label: 'Station' },
    { value: 'rolling_stock', label: 'Rolling Stock' },
  ]

  const assetTypeOptions = [
    { value: '', label: 'Select Asset Type' },
    { value: 'track', label: 'Track' },
    { value: 'signal', label: 'Signal' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'station', label: 'Station' },
    { value: 'rolling_stock', label: 'Rolling Stock' },
  ]

  // Fetch QR codes
  useEffect(() => {
    const fetchQRCodes = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await qrService.getQRCodes()

        // Fetch real data from API (no sample/mock data)
        try {
          const res = await qrService.searchFittings({})
          // ResponseFormatter returns { success, message, data, pagination }
          const items = (res && res.data) || []
          setQrCodes(items)
          setFilteredCodes(items)
        } catch (err) {
          console.error('Failed to fetch QR codes from API:', err)
          setQrCodes([])
          setFilteredCodes([])
        }
      } catch (error) {
        console.error('Failed to fetch QR codes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQRCodes()
  }, [])

  // Filter QR codes
  useEffect(() => {
    let filtered = qrCodes

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(code => code.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(code => code.assetType === typeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        code =>
          code.code.toLowerCase().includes(query) ||
          code.location.toLowerCase().includes(query) ||
          (code.assignedTo && code.assignedTo.toLowerCase().includes(query))
      )
    }

    setFilteredCodes(filtered)
  }, [searchQuery, statusFilter, typeFilter, qrCodes])

  // Handle generate form change
  const handleGenerateChange = e => {
    const { name, value } = e.target
    setGenerateForm({ ...generateForm, [name]: value })
  }

  // Handle batch generation
  const handleGenerate = async e => {
    e.preventDefault()
    setGenerating(true)

    try {
      // TODO: Replace with actual API call
      // await qrService.generateBatch(generateForm)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Reset form and close modal
      setGenerateForm({
        assetType: '',
        prefix: '',
        startNumber: '1',
        quantity: '10',
        location: '',
      })
      setShowGenerateModal(false)

      // Refresh list
      // fetchQRCodes()
    } catch (error) {
      console.error('Failed to generate QR codes:', error)
    } finally {
      setGenerating(false)
    }
  }

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting QR codes:', filteredCodes)
    alert('Export functionality will download QR codes as PDF/CSV')
  }

  // Get status badge
  const getStatusBadge = status => {
    const config = {
      active: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
    }
    return config[status] || config.active
  }

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Table columns
  const columns = [
    {
      key: 'code',
      label: 'QR Code',
      sortable: true,
      render: value => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      key: 'assetType',
      label: 'Asset Type',
      sortable: true,
      render: value => <span className="capitalize">{value.replace('_', ' ')}</span>,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(value)}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
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
      key: 'generatedDate',
      label: 'Generated',
      sortable: true,
      render: value => formatDate(value),
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
          <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Generate and manage QR codes for asset tracking
          </p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Generate Batch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total QR Codes</p>
          <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {qrCodes.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Assigned</p>
          <p className="text-2xl font-bold text-blue-600">
            {qrCodes.filter(c => c.status === 'assigned').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {qrCodes.filter(c => c.status === 'inactive').length}
          </p>
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
                placeholder="Search by code, location, or assignee..."
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

          {/* Type Filter */}
          <div>
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              options={typeOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredCodes.length} of {qrCodes.length} QR codes
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

      {/* QR Codes Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredCodes} emptyMessage="No QR codes found" />
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Generate QR Batch</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-4 space-y-4">
              {/* Asset Type */}
              <div>
                <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Type *
                </label>
                <Select
                  id="assetType"
                  name="assetType"
                  value={generateForm.assetType}
                  onChange={handleGenerateChange}
                  options={assetTypeOptions}
                  className="w-full"
                  required
                />
              </div>

              {/* Prefix */}
              <div>
                <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-2">
                  Code Prefix *
                </label>
                <Input
                  id="prefix"
                  name="prefix"
                  type="text"
                  value={generateForm.prefix}
                  onChange={handleGenerateChange}
                  placeholder="e.g., TRK-2024"
                  className="w-full"
                  required
                />
              </div>

              {/* Start Number */}
              <div>
                <label
                  htmlFor="startNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Number *
                </label>
                <Input
                  id="startNumber"
                  name="startNumber"
                  type="number"
                  value={generateForm.startNumber}
                  onChange={handleGenerateChange}
                  min="1"
                  className="w-full"
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={generateForm.quantity}
                  onChange={handleGenerateChange}
                  min="1"
                  max="100"
                  className="w-full"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Maximum 100 codes per batch</p>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Location
                </label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={generateForm.location}
                  onChange={handleGenerateChange}
                  placeholder="e.g., Central Depot"
                  className="w-full"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={generating} className="flex-1">
                  {generating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRManagementPage
