import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2, MapPin, Tag, Calendar, FileText, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import inspectionService from '../api/inspectionService'

const statusColor = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
}

const InspectionDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await inspectionService.getById(id)
        setInspection(res?.data || res)
      } catch {
        toast.error('Failed to load inspection')
        navigate('/inspections')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this inspection?')) return
    try {
      setDeleting(true)
      await inspectionService.delete(id)
      toast.success('Inspection deleted')
      navigate('/inspections')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 safe-top safe-bottom flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ir-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!inspection) return null

  const fields = [
    { icon: Tag, label: 'Asset ID', value: inspection.assetId },
    { icon: Tag, label: 'Asset Type', value: inspection.assetType },
    { icon: MapPin, label: 'Location', value: inspection.location },
    { icon: Calendar, label: 'Date', value: new Date(inspection.createdAt).toLocaleString() },
  ]

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Inspection Details</h1>
        <button
          onClick={() => navigate(`/inspections/${id}/edit`, { state: inspection })}
          className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center"
        >
          <Edit2 className="w-4 h-4 text-ir-blue" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Status badge */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Status</span>
          <span className={`text-sm px-3 py-1 rounded-full font-semibold ${statusColor[inspection.status] || 'bg-gray-100 text-gray-600'}`}>
            {inspection.status}
          </span>
        </div>

        {/* Info fields */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-ir-blue" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {inspection.notes && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-ir-blue" />
              <p className="text-sm font-semibold text-gray-700">Notes</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{inspection.notes}</p>
          </div>
        )}

        {/* Images */}
        {inspection.images?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-4 h-4 text-ir-blue" />
              <p className="text-sm font-semibold text-gray-700">Photos ({inspection.images.length})</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {inspection.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)} className="aspect-square rounded-xl overflow-hidden">
                  <img src={img} className="w-full h-full object-cover" alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} className="max-w-full max-h-full rounded-xl object-contain" alt="Full size" />
        </div>
      )}
    </div>
  )
}

export default InspectionDetailPage
