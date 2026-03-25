import { Plus, QrCode, AlertCircle, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActionsWidget = () => {
  const navigate = useNavigate()

  const actions = [
    {
      icon: Plus,
      label: 'Start Inspection',
      path: '/inspector/start-inspection',
      color: 'blue',
    },
    {
      icon: QrCode,
      label: 'Scan QR',
      path: '/inspector/scan-qr',
      color: 'purple',
    },
    {
      icon: AlertCircle,
      label: 'Report Defect',
      path: '/inspector/defects',
      color: 'orange',
    },
    {
      icon: ClipboardList,
      label: 'My Inspections',
      path: '/inspector/inspections',
      color: 'green',
    },
  ]

  const getColorClasses = color => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
      green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {actions.map(action => {
          const Icon = action.icon
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-lg border transition-all hover:scale-105 active:scale-95 ${getColorClasses(action.color)}`}
            >
              <Icon className="h-8 w-8 md:h-10 md:w-10 mb-2" />
              <span className="text-sm md:text-base font-medium text-center">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActionsWidget
