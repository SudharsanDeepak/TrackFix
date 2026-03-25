import { useNavigate } from 'react-router-dom'
import { UserX, LogOut, Mail } from 'lucide-react'
import { Button } from '../components/atoms'
import { useAuthStore } from '../store/authStore'

/**
 * No role page for users without assigned roles
 */
const NoRolePage = () => {
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)
  const user = useAuthStore(state => state.user)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleContactSupport = () => {
    window.location.href = 'mailto:admin@railtrack.ai?subject=Role Assignment Request'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* No Role Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <UserX className="w-8 h-8 text-orange-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Role Not Assigned</h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Your account does not have a role assigned. A role is required to access the
            application.
          </p>
        </div>

        {/* User Information */}
        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Account Information</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Name:</span> {user.name || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">What to do next:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Contact your system administrator</li>
            <li>Request a role assignment for your account</li>
            <li>Log in again after your role has been assigned</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="primary" size="lg" onClick={handleContactSupport} className="w-full">
            <Mail className="w-5 h-5 mr-2" />
            Contact Administrator
          </Button>

          <Button variant="outline" size="lg" onClick={handleLogout} className="w-full">
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>

        {/* Support Information */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@railtrack.ai" className="text-ir-blue hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NoRolePage
