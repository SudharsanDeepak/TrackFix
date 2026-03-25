import { Plus, QrCode, FileText, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActionsWidget = () => {
  const navigate = useNavigate()

  const actions = [
    {
      icon: QrCode,
      label: 'Generate QR Batch',
      path: '/depot-officer/qr-management',
      color: 'green',
    },
    {
      icon: FileText,
      label: 'Create Report',
      path: '/depot-officer/reports',
      color: 'blue',
    },
    {
      icon: Package,
      label: 'Manage Inventory',
      path: '/depot-officer/inventory',
      color: 'purple',
    },
  ]

  const getColorClasses = color => {
    const colors = {
      green: 'bg-green-600 hover:bg-green-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
    }
    return colors[color] || colors.green
  }

  return (
    <div className="flex gap-3">
      {actions.map(action => {
        const Icon = action.icon
        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-colors ${getColorClasses(action.color)}`}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default QuickActionsWidget
