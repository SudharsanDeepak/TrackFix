import { BarChart3, PieChart, LineChart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AnalyticsAccessWidget = () => {
  const navigate = useNavigate()

  const analyticsTypes = [
    {
      icon: BarChart3,
      label: 'Performance Analytics',
      description: 'Depot & zone metrics',
      color: 'purple',
    },
    {
      icon: PieChart,
      label: 'Distribution Analysis',
      description: 'Resource allocation',
      color: 'blue',
    },
    {
      icon: LineChart,
      label: 'Trend Reports',
      description: 'Historical data',
      color: 'green',
    },
  ]

  const getColorClasses = color => {
    const colors = {
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
    }
    return colors[color] || colors.purple
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-sm p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Advanced Analytics</h3>

      <div className="space-y-2">
        {analyticsTypes.map(type => {
          const Icon = type.icon
          return (
            <button
              key={type.label}
              onClick={() => navigate('/zonal-manager/analytics')}
              className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
            >
              <Icon className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-purple-100">{type.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AnalyticsAccessWidget
