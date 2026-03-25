import { Outlet } from 'react-router-dom'
import { Train, Globe } from 'lucide-react'
import { usePreferencesStore } from '../store/preferencesStore'

const AuthLayout = () => {
  const { language, setLanguage } = usePreferencesStore()

  const handleLanguageChange = lang => {
    setLanguage(lang)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ir-blue via-blue-600 to-ir-saffron px-4 py-12">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <Globe className="h-4 w-4 text-gray-600" />
          <select
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
            className="text-sm bg-transparent border-none focus:outline-none cursor-pointer text-gray-700"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>
      </div>

      {/* Auth Content */}
      <div className="w-full max-w-md">
        <Outlet />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/90">© 2024 Indian Railways. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-white/80">
            <a href="/help" className="hover:text-white transition-colors">
              Help
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 opacity-10">
        <Train className="h-32 w-32 text-white" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Train className="h-32 w-32 text-white transform rotate-180" />
      </div>
    </div>
  )
}

export default AuthLayout
