import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Edit2, 
  Save, 
  X, 
  LogOut, 
  Shield,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    depotName: user?.depotName || 'Central Depot',
  })

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Replace with actual API call
      // await userService.updateProfile(formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update user in store
      // updateUser(formData)

      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      depotName: user?.depotName || 'Central Depot',
    })
    setEditing(false)
  }

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear auth data
      logout()
      
      // Clear any cached data
      sessionStorage.clear()
      
      // Navigate to login and replace history
      navigate('/login', { replace: true })
      
      // Force reload to clear any remaining state
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header with Cover */}
      <div className="bg-white shadow-sm">
        {/* Cover Image */}
        <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative -mt-16 sm:-mt-20 pb-4">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 sm:h-14 sm:w-14 text-blue-600" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Name and Role */}
              <div className="flex-1 text-center sm:text-left sm:pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user?.name || 'Test Inspector'}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm sm:text-base text-gray-600">Inspector</span>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="sm:mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4 text-gray-400" />
                Full Name
              </label>
              {editing ? (
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pl-6">{user?.name || 'Not provided'}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address
              </label>
              {editing ? (
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pl-6">{user?.email || 'Not provided'}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                Phone Number
              </label>
              {editing ? (
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pl-6">{user?.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Depot */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4 text-gray-400" />
                Assigned Depot
              </label>
              <p className="text-base text-gray-900 pl-6">{formData.depotName}</p>
            </div>

            {/* Edit Actions */}
            {editing && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Activity Statistics</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Total Inspections */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">24</p>
                <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">Total Inspections</p>
              </div>

              {/* Defects Reported */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-orange-700">8</p>
                <p className="text-xs sm:text-sm text-orange-600 font-medium mt-1">Defects Found</p>
              </div>

              {/* Completion Rate */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">95%</p>
                <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">Completion Rate</p>
              </div>

              {/* This Month */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700">12</p>
                <p className="text-xs sm:text-sm text-purple-600 font-medium mt-1">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">App Information</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-semibold text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Last Sync</span>
              <span className="text-sm font-semibold text-gray-900">Just now</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-semibold text-gray-900">45 MB</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
