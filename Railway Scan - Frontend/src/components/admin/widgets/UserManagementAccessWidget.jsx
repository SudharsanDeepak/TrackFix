import { UserPlus, Users, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UserManagementAccessWidget = () => {
  const navigate = useNavigate()

  const actions = [
    { icon: UserPlus, label: 'Add User', path: '/admin/users?action=create', color: 'green' },
    { icon: Users, label: 'Manage Users', path: '/admin/users', color: 'blue' },
    {
      icon: UserCog,
      label: 'Roles & Permissions',
      path: '/admin/users?tab=roles',
      color: 'purple',
    },
  ]

  const getColorClasses = color => {
    const colors = {
      green: 'bg-green-600 hover:bg-green-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-sm p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">User Management</h3>

      <div className="space-y-2">
        {actions.map(action => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default UserManagementAccessWidget
