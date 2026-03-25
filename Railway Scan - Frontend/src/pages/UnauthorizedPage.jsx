import { useNavigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '../components/atoms'
import { useAuthStore } from '../store/authStore'
import { getAlternativeActions } from '../utils/roleErrorHandler'

/**
 * Unauthorized page for role-based access denials
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const roleConfig = useAuthStore(state => state.roleConfig)

  const roleName = roleConfig?.displayName || 'your role'
  const alternativeActions = user?.role ? getAlternativeActions(user.role) : []

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoToDashboard = () => {
    if (roleConfig?.defaultRoute) {
      navigate(roleConfig.defaultRoute)
    } else {
      navigate('/')
    }
  }

  const handleActionClick = path => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Unauthorized Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-yellow-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>

          {/* Message */}
          <p className="text-gray-600">
            You do not have permission to access this page. This feature is not available for{' '}
            {roleName} users.
          </p>
        </div>

        {/* Alternative Actions */}
        {alternativeActions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Here's what you can do instead:
            </h2>
            <div className="space-y-2">
              {alternativeActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleActionClick(action.path)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 hover:text-gray-900"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="primary" size="lg" onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>

          <Button variant="outline" size="lg" onClick={handleGoBack} className="w-full">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Support Information */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need access to this feature?{' '}
            <a href="mailto:admin@railtrack.ai" className="text-ir-blue hover:underline">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
