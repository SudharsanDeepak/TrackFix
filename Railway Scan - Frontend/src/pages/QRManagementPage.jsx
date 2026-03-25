import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { QrCode, Search, AlertTriangle } from 'lucide-react'
import { Button, Input, Select, Badge } from '../components/atoms'
import { DataTable, ConfirmationModal } from '../components/organisms'
import qrService from '../services/qrService'

const generateSchema = yup.object({
  quantity: yup
    .number()
    .min(1, 'Minimum 1 QR code')
    .max(10000, 'Maximum 10,000 QR codes')
    .required('Quantity is required'),
  zone: yup.string().required('Zone is required'),
})

const zoneOptions = [
  { value: 'CENTRAL', label: 'Central Railway' },
  { value: 'WESTERN', label: 'Western Railway' },
  { value: 'EASTERN', label: 'Eastern Railway' },
  { value: 'NORTHERN', label: 'Northern Railway' },
  { value: 'SOUTHERN', label: 'Southern Railway' },
]

const QRManagementPage = () => {
  const [activeTab, setActiveTab] = useState('generate')
  const [generating, setGenerating] = useState(false)
  const [searchFilters, setSearchFilters] = useState({})
  const [fittings, setFittings] = useState([])
  const [loading, setLoading] = useState(false)
  const [showRecallModal, setShowRecallModal] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(generateSchema),
  })

  const onGenerate = async data => {
    try {
      setGenerating(true)
      const result = await qrService.generateBatch(data)
      toast.success(`Successfully generated ${result.count} QR codes!`)
      reset()
    } catch (error) {
      toast.error(error.message || 'Failed to generate QR codes')
    } finally {
      setGenerating(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const result = await qrService.searchFittings(searchFilters)
      setFittings(result.data || [])
    } catch (error) {
      toast.error('Failed to search fittings')
    } finally {
      setLoading(false)
    }
  }

  const handleRecall = async () => {
    try {
      await qrService.recallLot({
        lotNumber: selectedLot,
        reason: 'Quality issue detected',
      })
      toast.success('Lot recalled successfully')
      setShowRecallModal(false)
      setSelectedLot(null)
    } catch (error) {
      toast.error('Failed to recall lot')
    }
  }

  const columns = [
    { key: 'qrCode', label: 'QR Code', sortable: true },
    { key: 'zone', label: 'Zone', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: value => <Badge variant={value === 'ACTIVE' ? 'green' : 'gray'}>{value}</Badge>,
    },
    { key: 'vendor', label: 'Vendor', sortable: true },
    { key: 'location', label: 'Location' },
    { key: 'warrantyExpiry', label: 'Warranty Expiry' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
        <p className="text-gray-600 mt-2">
          Generate, search, and manage railway track fitting QR codes
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['generate', 'search', 'recall'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-ir-blue text-ir-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <QrCode className="h-6 w-6 text-ir-blue" />
            <h2 className="text-xl font-semibold">Generate QR Codes</h2>
          </div>

          <form onSubmit={handleSubmit(onGenerate)} className="max-w-md space-y-4">
            <Input
              label="Quantity"
              type="number"
              placeholder="Enter quantity (1-10,000)"
              error={errors.quantity?.message}
              {...register('quantity')}
              required
            />

            <Select
              label="Zone"
              options={zoneOptions}
              placeholder="Select zone"
              error={errors.zone?.message}
              {...register('zone')}
              required
            />

            <Button type="submit" variant="primary" loading={generating} className="w-full">
              Generate QR Codes
            </Button>
          </form>
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-6 w-6 text-ir-blue" />
              <h2 className="text-xl font-semibold">Search Fittings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="QR Code"
                placeholder="Enter QR code"
                onChange={e => setSearchFilters({ ...searchFilters, qrCode: e.target.value })}
              />
              <Select
                label="Zone"
                options={zoneOptions}
                placeholder="All zones"
                onChange={e => setSearchFilters({ ...searchFilters, zone: e.target.value })}
              />
              <Select
                label="Status"
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'RECALLED', label: 'Recalled' },
                ]}
                placeholder="All statuses"
                onChange={e => setSearchFilters({ ...searchFilters, status: e.target.value })}
              />
            </div>

            <Button onClick={handleSearch} loading={loading}>
              Search
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={fittings}
            loading={loading}
            emptyMessage="No fittings found. Try adjusting your search filters."
            currentPage={1}
            pageSize={20}
            totalItems={fittings.length}
            showActions={true}
            onView={row => console.log('View', row)}
          />
        </div>
      )}

      {/* Recall Tab */}
      {activeTab === 'recall' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold">Recall Lot</h2>
          </div>

          <div className="max-w-md space-y-4">
            <Input
              label="Lot Number"
              placeholder="Enter lot number"
              value={selectedLot || ''}
              onChange={e => setSelectedLot(e.target.value)}
            />

            <Button
              variant="danger"
              onClick={() => setShowRecallModal(true)}
              disabled={!selectedLot}
            >
              Recall Lot
            </Button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showRecallModal}
        onClose={() => setShowRecallModal(false)}
        onConfirm={handleRecall}
        title="Confirm Lot Recall"
        message={`Are you sure you want to recall lot ${selectedLot}? This action cannot be undone.`}
        variant="danger"
        confirmText="Recall Lot"
      />
    </div>
  )
}

export default QRManagementPage
