import { Smartphone, Train, Download } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const MobileOnlyPage = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Train className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">RailTrack-FIX</span>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Download RailTrack Inspector!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The <span className="font-semibold text-blue-600">Inspector</span> role only works on the mobile app.
          Download it on your Android or iOS device to scan QR codes, log inspections, and report defects.
        </p>

        {/* App Store Badges */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-5 py-3 justify-center cursor-pointer hover:bg-gray-800 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.4.83 3.22.84.97-.04 1.9-.8 3.22-.84 1.36.05 2.4.6 3.1 1.5-2.8 1.7-2.34 5.4.46 6.5-.6 1.6-1.4 3.2-2 3.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs text-gray-400">Download on the</div>
              <div className="text-sm font-semibold">App Store</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-5 py-3 justify-center cursor-pointer hover:bg-gray-800 transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M3.18 23.76c.3.17.64.22.99.13l11.37-6.57-2.43-2.43-9.93 8.87zm-1.1-20.1c-.06.2-.08.42-.08.65v19.38c0 .23.02.45.08.65l.06.06 10.85-10.85v-.26L2.14 3.6l-.06.06zm14.96 14.1l-3.62-3.62v-.26l3.62-3.62.08.05 4.29 2.44c1.22.7 1.22 1.83 0 2.52l-4.29 2.44-.08.05zm-3.62-3.88L2.14.24C1.79.15 1.45.2 1.15.37l-.03.03 10.9 10.9 2.4-2.42z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs text-gray-400">Get it on</div>
              <div className="text-sm font-semibold">Google Play</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default MobileOnlyPage
