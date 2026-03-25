import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Camera, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import inspectionService from '../api/inspectionService'

const ASSET_TYPES = ['RAIL', 'SWITCH', 'CROSSING', 'SIGNAL', 'BRIDGE', 'TUNNEL', 'PLATFORM', 'OTHER']
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']

const NewInspectionPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state || {}
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    assetId: prefill.assetId || '',
    assetType: prefill.assetType || 'RAIL',
    location: prefill.location || '',
    status: 'PENDING',
    notes: '',
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleImage = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        // Compress image
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const max = 1024
          let w = img.width, h = img.height
          if (w > max) { h = (h * max) / w; w = max }
          if (h > max) { w = (w * max) / h; h = max }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          setImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.7)])
        }
        img.src = ev.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const submit = async () => {
    if (!form.assetId || !form.location) {
      toast.error('Asset ID and Location are required')
      return
    }
    try {
      setLoading(true)
      await inspectionService.create({ ...form, images })
      toast.success('Inspection saved!')
      navigate('/inspections')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save inspection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">New Inspection</h1>
      </div>

      <div className="px-4 py-4 space-y-4 pb-32">
        {prefill.assetId && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">QR code scanned successfully</p>
          </div>
        )}

        {[
          { label: 'Asset ID *', key: 'assetId', placeholder: 'e.g. RAIL-001' },
          { label: 'Location *', key: 'location', placeholder: 'e.g. Station A, Track 2' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-ir-blue"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
          <select
            value={form.assetType}
            onChange={e => set('assetType', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-ir-blue bg-white"
          >
            {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-ir-blue bg-white"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Add inspection notes..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-ir-blue resize-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={img} className="w-full h-full object-cover rounded-xl" alt="" />
                <button
                  onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 active:bg-gray-50"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleImage} />
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-bottom">
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-ir-blue text-white py-4 rounded-2xl font-bold text-base disabled:opacity-60 active:scale-95 transition-transform"
        >
          {loading ? 'Saving...' : 'Save Inspection'}
        </button>
      </div>
    </div>
  )
}

export default NewInspectionPage
