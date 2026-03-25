import { QrCode, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QRScannerWidget = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Quick QR Scanner</h3>
          <p className="text-blue-100 text-sm">Scan asset QR codes instantly</p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <QrCode className="h-8 w-8" />
        </div>
      </div>

      <button
        onClick={() => navigate('/inspector/scan-qr')}
        className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Camera className="h-5 w-5" />
        Open Scanner
      </button>
    </div>
  )
}

export default QRScannerWidget
