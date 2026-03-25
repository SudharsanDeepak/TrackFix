import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Flashlight, X } from 'lucide-react'
import jsQR from 'jsqr'
import toast from 'react-hot-toast'

const ScanPage = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animRef = useRef(null)
  const [scanning, setScanning] = useState(true)
  const [torch, setTorch] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        animRef.current = requestAnimationFrame(tick)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission.')
    }
  }

  const stopCamera = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }

  const tick = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return
    const video = videoRef.current
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animRef.current = requestAnimationFrame(tick)
      return
    }
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code) {
      setScanning(false)
      stopCamera()
      handleQRResult(code.data)
      return
    }
    animRef.current = requestAnimationFrame(tick)
  }

  const handleQRResult = (data) => {
    // Format: ASSET_ID|ASSET_TYPE|LOCATION|MANUFACTURER
    const parts = data.split('|')
    if (parts.length >= 3) {
      const [assetId, assetType, location, manufacturer] = parts
      toast.success('QR Code scanned!')
      navigate('/inspections/new', { state: { assetId, assetType, location, manufacturer } })
    } else {
      toast.error('Invalid QR code format')
      setScanning(true)
      startCamera()
    }
  }

  const toggleTorch = async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch }] })
      setTorch(!torch)
    } catch {
      toast.error('Torch not supported on this device')
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <button onClick={() => { stopCamera(); navigate(-1) }} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-semibold">Scan QR Code</h1>
        <button onClick={toggleTorch} className={`w-10 h-10 rounded-full flex items-center justify-center ${torch ? 'bg-yellow-400' : 'bg-white/20'}`}>
          <span className="text-white text-lg">⚡</span>
        </button>
      </div>

      {/* Camera */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-6">
              <X className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-white text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                {/* Scan line */}
                {scanning && (
                  <div className="absolute left-2 right-2 h-0.5 bg-ir-blue animate-bounce top-1/2" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-4 text-center">
        <p className="text-white/70 text-sm">Point camera at a railway asset QR code</p>
      </div>
    </div>
  )
}

export default ScanPage
