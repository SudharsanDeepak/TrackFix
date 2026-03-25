import { useState, useEffect } from 'react'
import { Activity, Users, Package } from 'lucide-react'

const ResourceUtilizationWidget = () => {
  const [resources, setResources] = useState({
    inspectors: { utilized: 0, total: 0 },
    equipment: { utilized: 0, total: 0 },
    inventory: { utilized: 0, total: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setResources({
          inspectors: { utilized: 87, total: 100 },
          equipment: { utilized: 142, total: 180 },
          inventory: { utilized: 78, total: 100 },
        })
      } catch (error) {
        console.error('Failed to fetch resource utilization:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const calculatePercentage = (utilized, total) => {
    return total > 0 ? ((utilized / total) * 100).toFixed(0) : 0
  }

  const resourceItems = [
    {
      icon: Users,
      label: 'Inspectors',
      data: resources.inspectors,
      color: 'purple',
    },
    {
      icon: Activity,
      label: 'Equipment',
      data: resources.equipment,
      color: 'blue',
    },
    {
      icon: Package,
      label: 'Inventory',
      data: resources.inventory,
      color: 'green',
    },
  ]

  const getColorClasses = color => {
    const colors = {
      purple: 'bg-purple-600',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
    }
    return colors[color] || colors.purple
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resource Utilization</h3>
      </div>

      <div className="space-y-4">
        {resourceItems.map(item => {
          const Icon = item.icon
          const percentage = calculatePercentage(item.data.utilized, item.data.total)

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.data.utilized} / {item.data.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getColorClasses(item.color)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{percentage}% utilized</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ResourceUtilizationWidget
