import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { User, Lock, Globe } from 'lucide-react'
import { Button, Input, Select } from '../components/atoms'
import { useAuthStore } from '../store/authStore'
import { usePreferencesStore } from '../store/preferencesStore'

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
})

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
})

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const { user } = useAuthStore()
  const { language, setLanguage, theme, setTheme } = usePreferencesStore()

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  })

  const onUpdateProfile = async data => {
    try {
      // TODO: Call API to update profile
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const onChangePassword = async data => {
    try {
      // TODO: Call API to change password
      toast.success('Password changed successfully')
      resetPassword()
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'password', label: 'Password', icon: Lock },
            { key: 'preferences', label: 'Preferences', icon: Globe },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-ir-blue text-ir-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="max-w-md space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              error={profileErrors.name?.message}
              {...registerProfile('name')}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={profileErrors.email?.message}
              {...registerProfile('email')}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <Input value={user?.role || 'N/A'} disabled />
              <p className="text-xs text-gray-500 mt-1">Contact admin to change your role</p>
            </div>

            <Button type="submit" variant="primary">
              Update Profile
            </Button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          <form onSubmit={handleSubmitPassword(onChangePassword)} className="max-w-md space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
              required
            />

            <Button type="submit" variant="primary">
              Change Password
            </Button>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Preferences</h2>
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <Select
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'हिंदी (Hindi)' },
                ]}
                value={language}
                onChange={e => {
                  setLanguage(e.target.value)
                  toast.success('Language updated')
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <Select
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System' },
                ]}
                value={theme}
                onChange={e => {
                  setTheme(e.target.value)
                  toast.success('Theme updated')
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Dark theme coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
