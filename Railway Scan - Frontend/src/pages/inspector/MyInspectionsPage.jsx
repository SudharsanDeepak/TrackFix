import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  MapPin,
  RefreshCw,
  Image as ImageIcon,
  X,
  Edit2,
  Trash2,
} from 'lucide-react'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import Badge from '../../components/atoms/Badge'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import { useAuthStore } from '../../store/authStore'
import { inspectionService } from '../../api/services'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'
import { useRealtimeInspections } from '../../hooks/useRealtime'

const MyInspectionsPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const [inspections, setInspections] = useState([])
  const [filteredInspections, setFilteredInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingInspection, setEditingInspection] = useState(null)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
  ]

  // Fetch inspections
  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true)
      try {
        console.log('Fetching inspections with filter:', statusFilter)
        const data = await inspectionService.getMyInspections({
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })

        console.log('API Response:', data)

        // The API returns the inspections array directly in the data field
        const inspectionsList = Array.isArray(data) ? data : []
        
        // Transform API response to match component structure
        const transformedData = inspectionsList.map(inspection => ({
          id: inspection._id || inspection.id,
          assetId: inspection.assetId,
          assetType: inspection.assetType,
          location: inspection.location,
          status: inspection.status,
          date: inspection.createdAt || inspection.date,
          notes: inspection.notes || inspection.description,
          images: inspection.images || [],
        }))

        console.log('Transformed data:', transformedData)

        setInspections(transformedData)
        setFilteredInspections(transformedData)
      } catch (error) {
        console.error('Failed to fetch inspections:', error)
        
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.')
          // The API client will handle the redirect
        } else {
          toast.error('Failed to load inspections. Please try again.')
        }
        
        setInspections([])
        setFilteredInspections([])
      } finally {
        setLoading(false)
      }
    }

    fetchInspections()
  }, [statusFilter, refreshKey])

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setRefreshKey(prev => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Filter inspections
  useEffect(() => {
    let filtered = inspections

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inspection => inspection.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        inspection =>
          inspection.id.toLowerCase().includes(query) ||
          inspection.assetId.toLowerCase().includes(query) ||
          inspection.assetType.toLowerCase().includes(query) ||
          inspection.location.toLowerCase().includes(query)
      )
    }

    setFilteredInspections(filtered)
  }, [searchQuery, statusFilter, inspections])

  // Real-time updates
  useRealtimeInspections((update) => {
    if (!update?.data) return

    if (update.type === 'CREATED') {
      const i = update.data.inspection || update.data
      const transformed = {
        id: i._id || i.id,
        assetId: i.assetId || i.fittingId || i.uniqueQRId || '',
        assetType: i.assetType || i.itemType || '',
        location: i.location || i.zoneCode || '',
        status: i.overallResult || i.status || 'PENDING',
        date: i.inspectionDate || i.createdAt || new Date(),
        notes: i.notes || i.description || '',
        images: i.images || [],
      }
      setInspections(prev => [transformed, ...prev])
      setFilteredInspections(prev => [transformed, ...prev])
    }

    if (update.type === 'UPDATED') {
      const upd = update.data
      setInspections(prev => prev.map(it => it.id === upd.inspectionId ? { ...it, ...upd.updates } : it))
      setFilteredInspections(prev => prev.map(it => it.id === upd.inspectionId ? { ...it, ...upd.updates } : it))
    }
  })

  // Get status badge
  const getStatusBadge = status => {
    const statusConfig = {
      COMPLETED: {
        icon: CheckCircle,
        label: 'Completed',
        className: 'bg-green-100 text-green-800',
      },
      IN_PROGRESS: {
        icon: Clock,
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-800',
      },
      PENDING: {
        icon: AlertCircle,
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
      },
      FAILED: {
        icon: XCircle,
        label: 'Failed',
        className: 'bg-red-100 text-red-800',
      },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Handle inspection click
  const handleInspectionClick = inspectionId => {
    // TODO: Navigate to inspection detail page
    console.log('View inspection:', inspectionId)
  }

  // Handle edit inspection - navigate to start inspection page with pre-filled data
  const handleEdit = (inspection) => {
    // Store inspection data in sessionStorage for the edit page to use
    sessionStorage.setItem('editInspection', JSON.stringify(inspection))
    navigate('/inspector/start-inspection', { state: { editMode: true, inspection } })
  }

  // Handle delete inspection
  const handleDelete = async (inspectionId) => {
    try {
      // Call the delete API
      const response = await apiClient.delete(`/inspector/inspections/${inspectionId}`)
      toast.success('Inspection deleted successfully')
      setDeleteConfirm(null)
      setRefreshKey(prev => prev + 1) // Refresh the list
    } catch (error) {
      console.error('Failed to delete inspection:', error)
      toast.error(error.response?.data?.message || 'Failed to delete inspection. Please try again.')
    }
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
        <h1 className="text-2xl font-bold text-gray-900">My Inspections</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            disabled={loading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh inspections"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Badge className="bg-blue-100 text-blue-800">
            {filteredInspections.length}{' '}
            {filteredInspections.length === 1 ? 'Inspection' : 'Inspections'}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by ID, asset, or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
            aria-label="Search inspections"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="flex-1"
            aria-label="Filter by status"
          />
        </div>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all'
              ? 'No inspections found matching your filters.'
              : 'You have no inspections yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInspections.map(inspection => (
            <div
              key={inspection.id}
              className="w-full bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Header Row with Asset ID, Status, and Actions */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate">{inspection.assetId}</span>
                  {getStatusBadge(inspection.status)}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(inspection)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label={`Edit inspection ${inspection.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(inspection.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Delete inspection ${inspection.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleInspectionClick(inspection.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={`View inspection ${inspection.id}`}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Asset Info */}
              <div className="space-y-1 mb-2">
                <p className="text-sm text-gray-600">
                  {inspection.assetType}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{inspection.location}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>{formatDate(inspection.date)}</span>
                </div>
              </div>

              {/* Notes */}
              {inspection.notes && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{inspection.notes}</p>
              )}

              {/* Images Preview */}
              {inspection.images && inspection.images.length > 0 && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className="flex gap-2">
                    {inspection.images.slice(0, 3).map((image, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImage(image)
                        }}
                        className="relative group"
                      >
                        <img
                          src={image}
                          alt={`Inspection ${idx + 1}`}
                          className="w-16 h-16 rounded-lg border-2 border-gray-200 object-cover shadow-sm group-hover:border-blue-500 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {inspection.images.length} {inspection.images.length === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close image"
          >
            <X className="h-6 w-6 text-gray-900" />
          </button>
          <img
            src={selectedImage}
            alt="Inspection full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Inspection</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this inspection? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyInspectionsPage
