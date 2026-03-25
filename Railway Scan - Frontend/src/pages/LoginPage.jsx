import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { Button, Input, Select } from '../components/atoms'
import { useAuthStore } from '../store/authStore'
import authService from '../services/authService'
import { Train, X, AlertCircle } from 'lucide-react'
import { ERROR_TYPES, getRoleErrorMessage } from '../utils/roleErrorHandler'
import { config } from '../config'

const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [googleToken, setGoogleToken] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const login = useAuthStore(state => state.login)

  // Check for error state from navigation
  useEffect(() => {
    if (location.state?.error === 'invalid_role') {
      const errorDetails = getRoleErrorMessage(ERROR_TYPES.INVALID_ROLE)
      setErrorMessage(errorDetails.message)
      toast.error(errorDetails.message)
    }
  }, [location.state])

  const roles = [
    { value: 'INSPECTOR', label: 'Inspector' },
    { value: 'DEPOT_OFFICER', label: 'Depot Officer' },
    { value: 'ZONAL_MANAGER', label: 'Zonal Manager' },
    { value: 'ADMIN', label: 'Administrator' },
  ]

  // Block Inspector role on web — must use mobile app
  const isInspectorSelected = selectedRole === 'INSPECTOR'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async data => {
    try {
      setLoading(true)
      setErrorMessage(null)
      const response = await authService.login(data.email, data.password)

      // Check if role is present in response
      if (!response.user?.role) {
        const errorDetails = getRoleErrorMessage(ERROR_TYPES.MISSING_ROLE)
        setErrorMessage(errorDetails.message)
        toast.error(errorDetails.message)
        return
      }

      // Block Inspector role on web
      if (response.user.role === 'INSPECTOR') {
        setErrorMessage('inspector_mobile_only')
        return
      }

      login(response.user, response.accessToken, response.refreshToken)
      toast.success('Login successful!')
      navigate('/')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log('Google OAuth Success:', tokenResponse)
        
        // Exchange the access token for user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        
        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text()
          console.error('Failed to get user info:', errorText)
          throw new Error('Failed to get user info')
        }

        const userInfo = await userInfoResponse.json()
        console.log('User Info:', userInfo)
        
        // For new users, show role selection modal
        // Store the token to use after role selection
        setGoogleToken(tokenResponse.access_token)
        setShowRoleModal(true)
      } catch (error) {
        console.error('Google login error:', error)
        toast.error(`Google login failed: ${error.message}`)
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error)
      toast.error(`Google login failed: ${error.error || 'Unknown error'}`)
    },
    scope: 'openid email profile',
    flow: 'implicit',
  })

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    // Block Inspector role on web
    if (selectedRole === 'INSPECTOR') {
      setShowRoleModal(false)
      setGoogleToken(null)
      setSelectedRole('')
      setErrorMessage('inspector_mobile_only')
      return
    }

    try {
      setGoogleLoading(true)
      setErrorMessage(null)

      // Send the access token directly to backend - it will fetch user info server-side
      const response = await authService.googleLogin(googleToken, selectedRole)

      if (!response.user?.role) {
        const errorDetails = getRoleErrorMessage(ERROR_TYPES.MISSING_ROLE)
        setErrorMessage(errorDetails.message)
        toast.error(errorDetails.message)
        setShowRoleModal(false)
        return
      }

      login(response.user, response.accessToken, response.refreshToken)
      toast.success('Login successful!')
      setShowRoleModal(false)
      navigate('/')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Google login failed'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ir-blue rounded-full mb-4">
            <Train className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RailTrack AI</h1>
          <p className="text-gray-600">Railway Track Fitting Lifecycle Management</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error / Inspector Mobile-Only Banner */}
          {errorMessage === 'inspector_mobile_only' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Download RailTrack Inspector!</p>
              <p className="text-xs text-blue-700">
                The Inspector role only works on the mobile app. Download it on Android or iOS to get started.
              </p>
            </div>
          ) : errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
            required
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={() => googleLogin()}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-medium text-gray-700">Continue with Google</span>
        </button>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-ir-blue hover:text-blue-700 transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Role</h2>
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setGoogleToken(null)
                  setSelectedRole('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Please select your role to complete the Google sign-in process.
            </p>

            <div className="space-y-4">
              <Select
                label="Role"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                options={roles}
                placeholder="Select your role"
                required
              />

              {/* Inspector warning inside modal */}
              {isInspectorSelected && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Download RailTrack Inspector!</p>
                  <p className="text-xs text-blue-700">The Inspector role only works on the mobile app. Please download it on Android or iOS.</p>
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleRoleSubmit}
                loading={googleLoading}
                disabled={isInspectorSelected}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LoginPage
