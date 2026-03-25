import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Building2, Plus } from 'lucide-react'
import { Button, Input, Badge } from '../components/atoms'
import { DataTable, ConfirmationModal } from '../components/organisms'
import vendorService from '../services/vendorService'

const vendorSchema = yup.object({
  name: yup.string().required('Name is required'),
  contactPerson: yup.string().required('Contact person is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  address: yup.string().required('Address is required'),
  gstNumber: yup.string().required('GST number is required'),
})

const VendorsPage = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showBlacklistModal, setShowBlacklistModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(vendorSchema),
  })

  useEffect(() => {
    if (activeTab === 'list') {
      fetchVendors()
    }
  }, [activeTab])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const result = await vendorService.getVendors()
      setVendors(result.data || [])
    } catch (error) {
      toast.error('Failed to fetch vendors')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async data => {
    try {
      await vendorService.createVendor(data)
      toast.success('Vendor created successfully')
      reset()
      setActiveTab('list')
      fetchVendors()
    } catch (error) {
      toast.error(error.message || 'Failed to create vendor')
    }
  }

  const handleBlacklist = async () => {
    try {
      await vendorService.blacklistVendor(selectedVendor.id, 'Quality issues')
      toast.success('Vendor blacklisted successfully')
      setShowBlacklistModal(false)
      fetchVendors()
    } catch (error) {
      toast.error('Failed to blacklist vendor')
    }
  }

  const columns = [
    { key: 'name', label: 'Vendor Name', sortable: true },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: value => <Badge variant={value === 'ACTIVE' ? 'green' : 'red'}>{value}</Badge>,
    },
    {
      key: 'performanceScore',
      label: 'Performance',
      render: value => (
        <Badge variant={value >= 80 ? 'green' : value >= 60 ? 'yellow' : 'red'}>
          {value || 'N/A'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-2">Manage vendors and track performance</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['list', 'create'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-ir-blue text-ir-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'list' ? 'All Vendors' : 'Create New'}
            </button>
          ))}
        </nav>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <DataTable
          columns={columns}
          data={vendors}
          loading={loading}
          emptyMessage="No vendors found"
          currentPage={1}
          pageSize={20}
          totalItems={vendors.length}
          showActions={true}
          onView={row => console.log('View', row)}
          onEdit={row => console.log('Edit', row)}
          onDelete={row => {
            setSelectedVendor(row)
            setShowBlacklistModal(true)
          }}
        />
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-6 w-6 text-ir-blue" />
            <h2 className="text-xl font-semibold">Create New Vendor</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vendor Name"
                placeholder="Enter vendor name"
                error={errors.name?.message}
                {...register('name')}
                required
              />

              <Input
                label="Contact Person"
                placeholder="Enter contact person"
                error={errors.contactPerson?.message}
                {...register('contactPerson')}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                error={errors.email?.message}
                {...register('email')}
                required
              />

              <Input
                label="Phone"
                placeholder="Enter phone number"
                error={errors.phone?.message}
                {...register('phone')}
                required
              />

              <Input
                label="GST Number"
                placeholder="Enter GST number"
                error={errors.gstNumber?.message}
                {...register('gstNumber')}
                required
              />
            </div>

            <Input
              label="Address"
              placeholder="Enter full address"
              error={errors.address?.message}
              {...register('address')}
              required
            />

            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                Create Vendor
              </Button>
              <Button type="button" variant="secondary" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        isOpen={showBlacklistModal}
        onClose={() => setShowBlacklistModal(false)}
        onConfirm={handleBlacklist}
        title="Blacklist Vendor"
        message={`Are you sure you want to blacklist ${selectedVendor?.name}?`}
        variant="danger"
        confirmText="Blacklist"
      />
    </div>
  )
}

export default VendorsPage
