import { useState, useEffect } from 'react'
import {
  Camera,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import Badge from '../../components/atoms/Badge'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import { useAuthStore } from '../../store/authStore'
import { defectService } from '../../api/services'
import toast from 'react-hot-toast'

const DefectReportsPage = () => {
  const user = useAuthStore(state => state.user)

  const [showForm, setShowForm] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [expandedReport, setExpandedReport] = useState(null)

  const [formData, setFormData] = useState({
    inspectionId: '',
    defectType: '',
    severity: '',
    description: '',
  })

  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})

  const defectTypes = [
    { value: '', label: 'Select Defect Type' },
    { value: 'crack', label: 'Crack' },
    { value: 'corrosion', label: 'Corrosion' },
    { value: 'wear', label: 'Wear and Tear' },
    { value: 'misalignment', label: 'Misalignment' },
    { value: 'damage', label: 'Physical Damage' },
    { value: 'malfunction', label: 'Malfunction' },
    { value: 'other', label: 'Other' },
  ]

  const severityLevels = [
    { value: '', label: 'Select Severity' },
    { value: 'low', label: 'Low - Minor Issue' },
    { value: 'medium', label: 'Medium - Needs Attention' },
    { value: 'high', label: 'High - Urgent' },
    { value: 'critical', label: 'Critical - Immediate Action' },
  ]

  // Fetch defect reports
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await defectService.getMyDefects()

      // The API returns the defects array directly in the data field
      const defectsList = Array.isArray(data) ? data : []

      // Transform API response to match component structure
      const transformedData = defectsList.map(defect => ({
        id: defect._id || defect.id,
        inspectionId: defect.inspectionId,
        defectType: defect.type || defect.defectType,
        severity: defect.severity,
        description: defect.description,
        status: defect.status || 'submitted',
        submittedAt: defect.createdAt || defect.submittedAt,
        images: defect.images?.length || 0,
        synced: true, // Assume synced if from API
      }))

      setReports(transformedData)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to load defect reports. Please try again.')
      setReports([])
    } finally {
      setLoading(false)
    }
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
    const imageToRemove = images.find(img => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    setImages(updatedImages)
  }

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.inspectionId.trim()) {
      newErrors.inspectionId = 'Inspection ID is required'
    }

    if (!formData.defectType) {
      newErrors.defectType = 'Defect type is required'
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity level is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (images.length === 0) {
      newErrors.images = 'At least one photo is required'
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
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('inspectionId', formData.inspectionId)
      submitData.append('type', formData.defectType)
      submitData.append('severity', formData.severity)
      submitData.append('description', formData.description)

      images.forEach(img => {
        submitData.append('images', img.file)
      })

      await defectService.createDefect(submitData)

      toast.success('Defect report submitted successfully!')

      // Success - reset form and refresh list
      setFormData({
        inspectionId: '',
        defectType: '',
        severity: '',
        description: '',
      })
      setImages([])
      setShowForm(false)

      // Refresh reports list
      fetchReports()
    } catch (error) {
      console.error('Failed to submit defect report:', error)
      setErrors({ submit: error.response?.data?.message || 'Failed to submit defect report. Please try again.' })
      toast.error('Failed to submit defect report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Get severity badge
  const getSeverityBadge = severity => {
    const config = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return config[severity] || config.low
  }

  // Get status badge
  const getStatusBadge = status => {
    const config = {
      pending: { label: 'Pending', className: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
      under_review: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
    }
    const statusConfig = config[status] || config.pending
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    )
  }

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Defect Reports</h1>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Report'}
        </Button>
      </div>

      {/* Offline Indicator */}
      {!navigator.onLine && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            You're offline. Reports will sync when connection is restored.
          </p>
        </div>
      )}

      {/* New Report Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inspection ID */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label htmlFor="inspectionId" className="block text-sm font-medium text-gray-700 mb-2">
              Inspection ID *
            </label>
            <Input
              id="inspectionId"
              name="inspectionId"
              type="text"
              value={formData.inspectionId}
              onChange={handleChange}
              placeholder="Enter inspection ID"
              className="w-full"
              aria-required="true"
            />
            {errors.inspectionId && (
              <p className="mt-1 text-sm text-red-600">{errors.inspectionId}</p>
            )}
          </div>

          {/* Defect Type */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label htmlFor="defectType" className="block text-sm font-medium text-gray-700 mb-2">
              Defect Type *
            </label>
            <Select
              id="defectType"
              name="defectType"
              value={formData.defectType}
              onChange={handleChange}
              options={defectTypes}
              className="w-full"
              aria-required="true"
            />
            {errors.defectType && <p className="mt-1 text-sm text-red-600">{errors.defectType}</p>}
          </div>

          {/* Severity */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level *
            </label>
            <Select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={severityLevels}
              className="w-full"
              aria-required="true"
            />
            {errors.severity && <p className="mt-1 text-sm text-red-600">{errors.severity}</p>}
          </div>

          {/* Description */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the defect in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-required="true"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos * (Capture defect images)
            </label>

            <label
              htmlFor="defect-images"
              className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Camera className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">Take Photo</span>
              <input
                id="defect-images"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative aspect-square">
                    <img
                      src={img.preview}
                      alt="Defect"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Defect Report'}
          </Button>
        </form>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Submitted Reports</h2>

        {reports.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No defect reports submitted yet.</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{report.id}</span>
                      {getStatusBadge(report.status)}
                      {!report.synced && (
                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <WifiOff className="h-3 w-3" />
                          Offline
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadge(report.severity)}`}
                        >
                          {report.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">{report.defectType}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(report.submittedAt)} • {report.images}{' '}
                        {report.images === 1 ? 'photo' : 'photos'}
                      </p>
                    </div>
                  </div>

                  {expandedReport === report.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>

              {expandedReport === report.id && (
                <div className="px-4 pb-4 border-t border-gray-200 pt-3">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Inspection ID</label>
                      <p className="text-sm text-gray-900">{report.inspectionId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900">{report.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DefectReportsPage
