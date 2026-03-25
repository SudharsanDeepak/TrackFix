import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, QrCode, AlertCircle, CheckCircle, X, Keyboard, Info } from 'lucide-react'
import jsQR from 'jsqr'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'

const ScanQRPage = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scannedData, setScannedData] = useState(null)
  const [error, setError] = useState(null)
  const [cameraPermission, setCameraPermission] = useState(null)
  const [debugMode, setDebugMode] = useState(false)
  const streamRef = useRef(null)
  const scanningRef = useRef(false)
  const animationFrameRef = useRef(null)

  // Start camera
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScanning(true)
        scanningRef.current = true
        setCameraPermission('granted')

        // Wait for video to be ready before starting scan
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          scanQRCode()
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraPermission('denied')
      setError('Unable to access camera. Please enable camera permissions or use manual entry.')
    }
  }

  // Stop camera
  const stopCamera = () => {
    scanningRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  // Scan QR code from video
  const scanQRCode = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        // Get image data from canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        
        // Try to detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        })

        if (code && code.data) {
          console.log('✅ QR Code detected:', code.data)
          handleQRCodeDetected(code.data)
          return // Stop scanning after successful detection
        }
      } catch (err) {
        console.error('QR scan error:', err)
      }
    }

    // Continue scanning - request next frame immediately for maximum speed
    if (scanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
    }
  }

  // Handle QR code detected
  const handleQRCodeDetected = qrData => {
    stopCamera()

    // Parse QR data (assuming format: ASSET_ID|ASSET_TYPE|LOCATION)
    try {
      const parts = qrData.split('|')
      const assetData = {
        assetId: parts[0] || qrData,
        assetType: parts[1] || 'Unknown',
        location: parts[2] || 'Unknown',
        scannedAt: new Date().toISOString(),
      }

      setScannedData(assetData)
    } catch (err) {
      setScannedData({
        assetId: qrData,
        assetType: 'Unknown',
        location: 'Unknown',
        scannedAt: new Date().toISOString(),
      })
    }
  }

  // Handle manual entry
  const handleManualSubmit = e => {
    e.preventDefault()

    if (!manualCode.trim()) {
      setError('Please enter a QR code')
      return
    }

    handleQRCodeDetected(manualCode.trim())
    setManualCode('')
  }

  // Start inspection with scanned asset
  const startInspection = () => {
    if (scannedData) {
      // Navigate to start inspection with pre-filled data
      navigate('/inspector/start-inspection', {
        state: { assetData: scannedData },
      })
    }
  }

  // Reset and scan again
  const scanAgain = () => {
    setScannedData(null)
    setError(null)
    if (!manualEntry) {
      startCamera()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
        <Button
          onClick={() => {
            if (manualEntry) {
              setManualEntry(false)
              setManualCode('')
              setError(null)
            } else {
              stopCamera()
              setManualEntry(true)
            }
          }}
          className="flex items-center gap-2"
        >
          {manualEntry ? (
            <>
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Camera</span>
            </>
          ) : (
            <>
              <Keyboard className="h-4 w-4" />
              <span className="hidden sm:inline">Manual</span>
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How to scan:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Point your camera at the QR code</li>
            <li>Hold steady until the code is detected</li>
            <li>Or use manual entry if camera is unavailable</li>
          </ul>
        </div>
      </div>

      {/* Scanned Data Display */}
      {scannedData ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">QR Code Scanned Successfully</p>
              <p className="text-sm text-green-700">Asset information retrieved</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Asset ID</label>
              <p className="text-lg font-semibold text-gray-900">{scannedData.assetId}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                <p className="text-sm text-gray-900">{scannedData.assetType}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                <p className="text-sm text-gray-900">{scannedData.location}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Scanned At</label>
              <p className="text-sm text-gray-900">
                {new Date(scannedData.scannedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <Button
              onClick={scanAgain}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Scan Again
            </Button>
            <Button onClick={startInspection} className="flex-1">
              Start Inspection
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Manual Entry Mode */}
          {manualEntry ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Manual QR Code Entry</h2>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="manualCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter QR Code
                  </label>
                  <Input
                    id="manualCode"
                    type="text"
                    value={manualCode}
                    onChange={e => {
                      setManualCode(e.target.value)
                      setError(null)
                    }}
                    placeholder="Enter QR code manually"
                    className="w-full"
                    autoFocus
                    aria-label="Manual QR code entry"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Submit Code
                </Button>
              </form>
            </div>
          ) : (
            /* Camera Scanner Mode */
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Camera View */}
              <div className="relative bg-gray-900 aspect-square">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  aria-label="QR code scanner camera view"
                />
                <canvas 
                  ref={canvasRef} 
                  className={debugMode ? "absolute inset-0 w-full h-full object-cover opacity-50" : "hidden"}
                />

                {/* Scanning Overlay */}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-4 border-blue-500 rounded-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <div className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                        Scanning...
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera not started */}
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-75">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 space-y-3">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!scanning ? (
                    <Button
                      onClick={startCamera}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Camera className="h-5 w-5" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button
                      onClick={stopCamera}
                      className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <X className="h-5 w-5" />
                      Stop Camera
                    </Button>
                  )}
                  
                  {scanning && (
                    <Button
                      onClick={() => setDebugMode(!debugMode)}
                      className="bg-gray-600 hover:bg-gray-700 px-3"
                      title="Toggle debug mode"
                    >
                      {debugMode ? '👁️' : '🔍'}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-center text-gray-500">
                  {scanning 
                    ? 'Position the QR code within the blue frame' 
                    : 'Click Start Camera to begin scanning'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ScanQRPage
