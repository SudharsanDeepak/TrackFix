import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Camera, MapPin, Upload, X, AlertCircle } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import { useAuthStore } from '../../store/authStore'
import { inspectionService } from '../../api/services'
import toast from 'react-hot-toast'

const StartInspectionPage = () => {
  const navigate = useNavigate()
  const locationState = useLocation()
  const user = useAuthStore(state => state.user)

  // Check if we're in edit mode
  const editMode = locationState.state?.editMode || false
  const existingInspection = locationState.state?.inspection || null

  const [formData, setFormData] = useState({
    assetId: '',
    assetType: '',
    location: '',
    notes: '',
  })

  // Pre-fill form if coming from QR scan OR edit mode
  useEffect(() => {
    if (editMode && existingInspection) {
      // Edit mode - pre-fill with existing data
      setFormData({
        assetId: existingInspection.assetId || '',
        assetType: existingInspection.assetType?.toLowerCase() || '',
        location: existingInspection.location || '',
        notes: existingInspection.notes || '',
      })
      // Pre-fill images if they exist
      if (existingInspection.images && existingInspection.images.length > 0) {
        setImages(existingInspection.images)
      }
    } else if (locationState.state?.assetData) {
      // QR scan mode - pre-fill with scanned data
      const { assetId, assetType, location } = locationState.state.assetData
      setFormData(prev => ({
        ...prev,
        assetId: assetId || '',
        assetType: assetType?.toLowerCase() || '',
        location: location || '',
      }))
    }
  }, [locationState, editMode, existingInspection])

  const [images, setImages] = useState([])
  const [location, setLocation] = useState(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const assetTypes = [
    { value: '', label: 'Select Asset Type' },
    { value: 'track', label: 'Track' },
    { value: 'signal', label: 'Signal' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'station', label: 'Station' },
    { value: 'rolling_stock', label: 'Rolling Stock' },
    { value: 'other', label: 'Other' },
  ]

  // Capture current location
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ ...errors, location: 'Geolocation is not supported by your browser' })
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        setLocation(coords)
        setFormData({
          ...formData,
          location: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        })
        setLoadingLocation(false)
        setErrors({ ...errors, location: null })
      },
      error => {
        setLoadingLocation(false)
        setErrors({
          ...errors,
          location: 'Unable to retrieve location. Please enable location services.',
        })
      }
    )
  }

  // Handle image upload
  const handleImageUpload = e => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }))
    setImages([...images, ...newImages])
  }

  // Remove image
  const removeImage = id => {
    const updatedImages = images.filter(img => img.id !== id)
    // Revoke object URL to free memory
    const imageToRemove = images.find(img => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    setImages(updatedImages)
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [])

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.assetId.trim()) {
      newErrors.assetId = 'Asset ID is required'
    }

    if (!formData.assetType) {
      newErrors.assetType = 'Asset type is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // Create inspection data
      const inspectionData = {
        assetId: formData.assetId,
        assetType: formData.assetType,
        location: formData.location,
        notes: formData.notes,
        status: 'PENDING',
      }

      if (location) {
        inspectionData.coordinates = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }
      }

      // Convert images to base64 for storage (with compression)
      if (images.length > 0) {
        const imagePromises = images.map(img => {
          // If image is already a base64 string (from edit mode), use it directly
          if (typeof img === 'string' && img.startsWith('data:')) {
            return Promise.resolve(img)
          }
          
          // Otherwise, process the file
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              // Compress image before sending
              const image = new Image()
              image.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                // Calculate new dimensions (max 1024px on longest side)
                let width = image.width
                let height = image.height
                const maxSize = 1024
                
                if (width > height && width > maxSize) {
                  height = (height * maxSize) / width
                  width = maxSize
                } else if (height > maxSize) {
                  width = (width * maxSize) / height
                  height = maxSize
                }
                
                canvas.width = width
                canvas.height = height
                ctx.drawImage(image, 0, 0, width, height)
                
                // Convert to base64 with compression (0.7 quality for JPEG)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
                resolve(compressedBase64)
              }
              image.onerror = reject
              image.src = reader.result
            }
            reader.onerror = reject
            reader.readAsDataURL(img.file)
          })
        })
        
        inspectionData.images = await Promise.all(imagePromises)
      }

      // Create or update inspection via API
      if (editMode && existingInspection) {
        await inspectionService.updateInspection(existingInspection.id, inspectionData)
        toast.success('Inspection updated successfully!')
      } else {
        await inspectionService.createInspection(inspectionData)
        toast.success('Inspection created successfully!')
      }

      // Success - navigate to inspections list
      navigate('/inspector/inspections')
    } catch (error) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} inspection:`, error)
      setErrors({ submit: error.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} inspection. Please try again.` })
      toast.error(`Failed to ${editMode ? 'update' : 'create'} inspection. Please try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {editMode ? 'Edit Inspection' : 'Start Inspection'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset ID */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-2">
            Asset ID *
          </label>
          <Input
            id="assetId"
            name="assetId"
            type="text"
            value={formData.assetId}
            onChange={handleChange}
            placeholder="Enter asset ID"
            className="w-full"
            aria-required="true"
            aria-invalid={!!errors.assetId}
            aria-describedby={errors.assetId ? 'assetId-error' : undefined}
          />
          {errors.assetId && (
            <p id="assetId-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.assetId}
            </p>
          )}
        </div>

        {/* Asset Type */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-2">
            Asset Type *
          </label>
          <Select
            id="assetType"
            name="assetType"
            value={formData.assetType}
            onChange={handleChange}
            options={assetTypes}
            className="w-full"
            aria-required="true"
            aria-invalid={!!errors.assetType}
            aria-describedby={errors.assetType ? 'assetType-error' : undefined}
          />
          {errors.assetType && (
            <p id="assetType-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.assetType}
            </p>
          )}
        </div>

        {/* Location Capture */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="flex gap-2">
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location or capture GPS"
              className="flex-1"
              aria-required="true"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'location-error' : undefined}
            />
            <Button
              type="button"
              onClick={captureLocation}
              disabled={loadingLocation}
              className="flex items-center gap-2 whitespace-nowrap"
              aria-label="Capture current location"
            >
              <MapPin className="h-5 w-5" />
              {loadingLocation ? 'Getting...' : 'GPS'}
            </Button>
          </div>
          {errors.location && (
            <p id="location-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.location}
            </p>
          )}
          {location && (
            <p className="mt-1 text-xs text-green-600">
              Location captured (Accuracy: ±{location.accuracy.toFixed(0)}m)
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos * (Tap to add from camera or gallery)
          </label>

          {/* Upload Button */}
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
          >
            <Camera className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-600">Take Photo or Upload</span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload inspection photos"
            />
          </label>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {images.map(img => (
                <div key={img.id} className="relative aspect-square">
                  <img
                    src={img.preview}
                    alt="Inspection preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.images && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.images}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional notes..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Inspection notes"
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => navigate('/inspector/inspections')}
            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting 
              ? (editMode ? 'Updating...' : 'Creating...') 
              : (editMode ? 'Update Inspection' : 'Start Inspection')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StartInspectionPage
