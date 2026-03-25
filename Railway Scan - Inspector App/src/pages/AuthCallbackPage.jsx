import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { config } from '../config'
import toast from 'react-hot-toast'
import { Train, AlertCircle } from 'lucide-react'

/**
 * Handles auth callbacks from:
 * 1. Deeplink: railtrack://auth/callback?accessToken=...&refreshToken=...
 *    (Capacitor App plugin fires appUrlOpen → DeepLinkHandler navigates here)
 * 2. Web redirect: http://localhost:5174/auth/callback?accessToken=...
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore(s => s.login)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Close the in-app browser if it was opened via Capacitor Browser
      try {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close()
      } catch {
        // Not in Capacitor or browser wasn't open — ignore
      }

      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 2500)
        return
      }

      if (!accessToken || !refreshToken) {
        setError('Invalid authentication response.')
        setTimeout(() => navigate('/login'), 2500)
        return
      }

      try {
        const res = await fetch(`${config.apiBaseUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!res.ok) throw new Error('Failed to fetch profile')

        const data = await res.json()
        const user = data.data || data

        if (user.role !== 'INSPECTOR') {
          setError('This app is for Inspectors only.')
          setTimeout(() => navigate('/login'), 2500)
          return
        }

        login(user, accessToken, refreshToken)
        toast.success('Welcome back!')
        navigate('/', { replace: true })
      } catch {
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 2500)
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-6 safe-top safe-bottom">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-white font-semibold">{error}</p>
            <p className="text-blue-200 text-sm mt-1">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Train className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-semibold">Signing you in...</p>
            <p className="text-blue-200 text-sm mt-1">Please wait</p>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthCallbackPage
