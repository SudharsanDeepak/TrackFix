import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Edit2, Save, X, LogOut, Shield } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import { useAuthStore } from '../../store/authStore'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    zoneName: user?.zoneName || 'Central Zone',
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

      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
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
      zoneName: user?.zoneName || 'Central Zone',
    })
    setEditing(false)
  }

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 h-32"></div>
        <div className="px-6 pb-6 -mt-16">
          <div className="flex items-end gap-4">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-28 h-28 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-14 w-14 text-purple-600" />
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Zonal Manager'}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-5 w-5" />
                <span>Zonal Manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!editing && (
            <Button onClick={() => setEditing(true)} className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
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
              <p className="text-gray-900 pl-6">{user?.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4" />
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
              <p className="text-gray-900 pl-6">{user?.email || 'Not provided'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" />
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
              <p className="text-gray-900 pl-6">{user?.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Zone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              Assigned Zone
            </label>
            <p className="text-gray-900 pl-6">{formData.zoneName}</p>
          </div>

          {/* Edit Actions */}
          {editing && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Zone Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Zone Performance</h3>
        </div>
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">8</p>
            <p className="text-sm text-gray-600 mt-1">Depots Managed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">342</p>
            <p className="text-sm text-gray-600 mt-1">Total Inspections</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">92%</p>
            <p className="text-sm text-gray-600 mt-1">Zone Efficiency</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">15</p>
            <p className="text-sm text-gray-600 mt-1">Active Vendors</p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="text-gray-900 font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync</span>
            <span className="text-gray-900 font-medium">Just now</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role</span>
            <span className="text-gray-900 font-medium">Zonal Manager</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </div>
  )
}

export default ProfilePage
