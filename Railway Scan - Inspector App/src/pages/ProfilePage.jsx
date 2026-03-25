import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, User, Mail, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header */}
      <div className="bg-ir-blue px-4 pt-4 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            {user?.profilePicture ? (
              <img src={user.profilePicture} className="w-full h-full rounded-full object-cover" alt="" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-blue-200 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {[
            { icon: User, label: 'Name', value: user?.name },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Shield, label: 'Role', value: 'Inspector' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-ir-blue" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
