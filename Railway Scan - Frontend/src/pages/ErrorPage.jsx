import { useNavigate } from 'react-router-dom'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '../components/atoms'

/**
 * General error page for unexpected errors
 */
const ErrorPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Something Went Wrong</h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-8">
          We encountered an unexpected error. Please try refreshing the page or return to the home
          page.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="primary" size="lg" onClick={handleRefresh} className="w-full">
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Page
          </Button>

          <Button variant="outline" size="lg" onClick={handleGoHome} className="w-full">
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Support Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If the problem persists, please contact support at{' '}
            <a href="mailto:support@railtrack.ai" className="text-ir-blue hover:underline">
              support@railtrack.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
