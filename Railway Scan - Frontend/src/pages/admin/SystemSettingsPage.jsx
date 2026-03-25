import { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Mail,
  Bell,
  Shield,
  Globe,
  Clock,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

  const [settings, setSettings] = useState({
    // General Settings
    appName: 'RailTrack AI',
    appDescription: 'Railway Inspection Management System',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',

    // Email Settings
    emailHost: 'smtp.railway.com',
    emailPort: '587',
    emailUsername: 'noreply@railway.com',
    emailPassword: '',
    emailFrom: 'RailTrack AI <noreply@railway.com>',
    emailEncryption: 'tls',

    // Notification Settings
    enableEmailNotifications: true,
    enablePushNotifications: true,
    notifyOnDefect: true,
    notifyOnInspectionComplete: true,
    notifyOnUserCreated: true,

    // Security Settings
    sessionTimeout: '30',
    passwordMinLength: '8',
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    enableTwoFactor: false,
    maxLoginAttempts: '5',

    // Database Settings
    backupFrequency: 'daily',
    backupRetention: '30',
    enableAutoBackup: true,

    // API Settings
    apiRateLimit: '1000',
    apiTimeout: '30',
    enableApiLogging: true,
  })

  const [errors, setErrors] = useState({})

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await settingsService.getSettings()
        // setSettings(data)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  // Validate settings
  const validateSettings = () => {
    const newErrors = {}

    // Validate email settings
    if (settings.emailPort && isNaN(settings.emailPort)) {
      newErrors.emailPort = 'Port must be a number'
    }

    // Validate security settings
    if (settings.sessionTimeout && isNaN(settings.sessionTimeout)) {
      newErrors.sessionTimeout = 'Timeout must be a number'
    }
    if (settings.passwordMinLength && isNaN(settings.passwordMinLength)) {
      newErrors.passwordMinLength = 'Length must be a number'
    }
    if (settings.maxLoginAttempts && isNaN(settings.maxLoginAttempts)) {
      newErrors.maxLoginAttempts = 'Attempts must be a number'
    }

    // Validate database settings
    if (settings.backupRetention && isNaN(settings.backupRetention)) {
      newErrors.backupRetention = 'Retention must be a number'
    }

    // Validate API settings
    if (settings.apiRateLimit && isNaN(settings.apiRateLimit)) {
      newErrors.apiRateLimit = 'Rate limit must be a number'
    }
    if (settings.apiTimeout && isNaN(settings.apiTimeout)) {
      newErrors.apiTimeout = 'Timeout must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async e => {
    e.preventDefault()

    if (!validateSettings()) {
      return
    }

    setSaving(true)
    setSaveSuccess(false)

    try {
      // TODO: Replace with actual API call
      // await settingsService.updateSettings(settings)
      console.log('Saving settings:', settings)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle reset
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      // Reset to default values
      // In real implementation, fetch defaults from API
      console.log('Resetting settings to defaults')
    }
  }

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API', icon: Settings },
  ]

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  ]

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ]

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ]

  const encryptionOptions = [
    { value: 'tls', label: 'TLS' },
    { value: 'ssl', label: 'SSL' },
    { value: 'none', label: 'None' },
  ]

  const backupFrequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure application settings and preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-red-600" />
                  General Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Name
                  </label>
                  <Input
                    name="appName"
                    value={settings.appName}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Description
                  </label>
                  <Input
                    name="appDescription"
                    value={settings.appDescription}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <Select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    options={timezoneOptions}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <Select
                    name="dateFormat"
                    value={settings.dateFormat}
                    onChange={handleChange}
                    options={dateFormatOptions}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <Select
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                    options={languageOptions}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeSection === 'email' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-red-600" />
                  Email Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <Input
                    name="emailHost"
                    value={settings.emailHost}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <Input
                    name="emailPort"
                    value={settings.emailPort}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.emailPort && (
                    <p className="mt-1 text-sm text-red-600">{errors.emailPort}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <Input
                    name="emailUsername"
                    value={settings.emailUsername}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input
                    name="emailPassword"
                    type="password"
                    value={settings.emailPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Address
                  </label>
                  <Input
                    name="emailFrom"
                    value={settings.emailFrom}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                  <Select
                    name="emailEncryption"
                    value={settings.emailEncryption}
                    onChange={handleChange}
                    options={encryptionOptions}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  Notification Settings
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="enableEmailNotifications"
                      checked={settings.enableEmailNotifications}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Enable Email Notifications</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="enablePushNotifications"
                      checked={settings.enablePushNotifications}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Enable Push Notifications</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="notifyOnDefect"
                      checked={settings.notifyOnDefect}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Notify on New Defect Report</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="notifyOnInspectionComplete"
                      checked={settings.notifyOnInspectionComplete}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Notify on Inspection Completion</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="notifyOnUserCreated"
                      checked={settings.notifyOnUserCreated}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Notify on New User Created</span>
                  </label>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Security Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.sessionTimeout && (
                    <p className="mt-1 text-sm text-red-600">{errors.sessionTimeout}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Minimum Length
                  </label>
                  <Input
                    name="passwordMinLength"
                    value={settings.passwordMinLength}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.passwordMinLength && (
                    <p className="mt-1 text-sm text-red-600">{errors.passwordMinLength}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="passwordRequireSpecialChar"
                      checked={settings.passwordRequireSpecialChar}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Require Special Character</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="passwordRequireNumber"
                      checked={settings.passwordRequireNumber}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Require Number</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="passwordRequireUppercase"
                      checked={settings.passwordRequireUppercase}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Require Uppercase Letter</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="enableTwoFactor"
                      checked={settings.enableTwoFactor}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Login Attempts
                  </label>
                  <Input
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.maxLoginAttempts && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxLoginAttempts}</p>
                  )}
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeSection === 'database' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Database className="h-5 w-5 text-red-600" />
                  Database Settings
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="enableAutoBackup"
                      checked={settings.enableAutoBackup}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Enable Automatic Backups</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <Select
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleChange}
                    options={backupFrequencyOptions}
                    className="w-full"
                    disabled={!settings.enableAutoBackup}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Retention (days)
                  </label>
                  <Input
                    name="backupRetention"
                    value={settings.backupRetention}
                    onChange={handleChange}
                    className="w-full"
                    disabled={!settings.enableAutoBackup}
                  />
                  {errors.backupRetention && (
                    <p className="mt-1 text-sm text-red-600">{errors.backupRetention}</p>
                  )}
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeSection === 'api' && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  API Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limit (requests per hour)
                  </label>
                  <Input
                    name="apiRateLimit"
                    value={settings.apiRateLimit}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.apiRateLimit && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiRateLimit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Timeout (seconds)
                  </label>
                  <Input
                    name="apiTimeout"
                    value={settings.apiTimeout}
                    onChange={handleChange}
                    className="w-full"
                  />
                  {errors.apiTimeout && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiTimeout}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="enableApiLogging"
                      checked={settings.enableApiLogging}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Enable API Request Logging</span>
                  </label>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default SystemSettingsPage
