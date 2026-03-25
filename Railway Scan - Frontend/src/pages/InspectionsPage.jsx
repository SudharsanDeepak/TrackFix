import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ClipboardCheck, Upload } from 'lucide-react'
import { Button, Input, Select, Badge } from '../components/atoms'
import { DataTable } from '../components/organisms'
import inspectionService from '../services/inspectionService'

const InspectionsPage = () => {
  const [activeTab, setActiveTab] = useState('new')
  const [images, setImages] = useState([])
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset } = useForm()

  const handleImageUpload = e => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    setImages([...images, ...validFiles])
  }

  const removeImage = index => {
    setImages(images.filter((_, i) => i !== index))
  }

  const onSubmit = async data => {
    try {
      setLoading(true)
      await inspectionService.createInspection({
        ...data,
        images,
      })
      toast.success('Inspection submitted successfully')
      reset()
      setImages([])
      setActiveTab('history')
    } catch (error) {
      toast.error(error.message || 'Failed to submit inspection')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'qrCode', label: 'QR Code' },
    { key: 'inspector', label: 'Inspector' },
    {
      key: 'result',
      label: 'Result',
      render: value => <Badge variant={value === 'PASS' ? 'green' : 'red'}>{value}</Badge>,
    },
    { key: 'defects', label: 'Defects Found' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
        <p className="text-gray-600 mt-2">Conduct and review fitting inspections</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['new', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-ir-blue text-ir-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'new' ? 'New Inspection' : 'History'}
            </button>
          ))}
        </nav>
      </div>

      {/* New Inspection Tab */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardCheck className="h-6 w-6 text-ir-blue" />
            <h2 className="text-xl font-semibold">New Inspection</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
            <Input
              label="QR Code"
              placeholder="Scan or enter QR code"
              {...register('qrCode')}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Visual Inspection"
                options={[
                  { value: 'PASS', label: 'Pass' },
                  { value: 'FAIL', label: 'Fail' },
                ]}
                {...register('visualInspection')}
                required
              />

              <Select
                label="Dimensional Check"
                options={[
                  { value: 'PASS', label: 'Pass' },
                  { value: 'FAIL', label: 'Fail' },
                ]}
                {...register('dimensionalCheck')}
                required
              />

              <Select
                label="Functional Test"
                options={[
                  { value: 'PASS', label: 'Pass' },
                  { value: 'FAIL', label: 'Fail' },
                ]}
                {...register('functionalTest')}
                required
              />

              <Select
                label="Wear Analysis"
                options={[
                  { value: 'MINIMAL', label: 'Minimal' },
                  { value: 'MODERATE', label: 'Moderate' },
                  { value: 'SEVERE', label: 'Severe' },
                ]}
                {...register('wearAnalysis')}
                required
              />
            </div>

            <Input
              label="Defects (if any)"
              placeholder="Describe any defects found"
              {...register('defects')}
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Max 10, 5MB each)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-ir-blue hover:text-blue-700"
                >
                  Click to upload images
                </label>
                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP (max 5MB each)</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="primary" loading={loading}>
              Submit Inspection
            </Button>
          </form>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <DataTable
          columns={columns}
          data={inspections}
          loading={loading}
          emptyMessage="No inspections found"
          currentPage={1}
          pageSize={20}
          totalItems={inspections.length}
          showActions={true}
          onView={row => console.log('View', row)}
        />
      )}
    </div>
  )
}

export default InspectionsPage
