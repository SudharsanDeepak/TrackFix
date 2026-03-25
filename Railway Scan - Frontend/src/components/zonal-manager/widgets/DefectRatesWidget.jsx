import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingDown } from 'lucide-react'

const DefectRatesWidget = () => {
  const [defectRate, setDefectRate] = useState({ rate: 0, trend: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDefectRate = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        setDefectRate({ rate: 5.02, trend: -1.2 })
      } catch (error) {
        console.error('Failed to fetch defect rates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDefectRate()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Zone Defect Rate</p>
          <p className="text-3xl font-bold text-gray-900">{defectRate.rate}%</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      <div
        className={`flex items-center gap-2 text-sm ${defectRate.trend < 0 ? 'text-green-600' : 'text-red-600'}`}
      >
        <TrendingDown className="h-4 w-4" />
        <span className="font-medium">{Math.abs(defectRate.trend)}% improvement</span>
      </div>
    </div>
  )
}

export default DefectRatesWidget
