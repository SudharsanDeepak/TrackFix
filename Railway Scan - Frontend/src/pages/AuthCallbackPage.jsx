import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Train } from 'lucide-react'

const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore(state => state.login)

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')
      const error = searchParams.get('error')

      if (error) {
        toast.error('Google authentication failed')
        navigate('/login')
        return
      }

      if (accessToken && refreshToken) {
        try {
          // Fetch user profile with the access token
          const response = await fetch('http://localhost:5000/api/v1/auth/profile', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            login(data.data, accessToken, refreshToken)
            toast.success('Login successful!')
            navigate('/')
          } else {
            throw new Error('Failed to fetch user profile')
          }
        } catch (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed')
          navigate('/login')
        }
      } else {
        toast.error('Invalid authentication response')
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate, login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-ir-blue rounded-full mb-4 animate-pulse">
          <Train className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we authenticate your account.</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
