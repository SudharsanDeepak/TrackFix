import { useState } from 'react'
import toast from 'react-hot-toast'
import { Brain, AlertTriangle } from 'lucide-react'
import { Button, Input, Badge } from '../components/atoms'
import { DataTable } from '../components/organisms'
import predictionService from '../services/predictionService'

const PredictionsPage = () => {
  const [activeTab, setActiveTab] = useState('run')
  const [fittingId, setFittingId] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [highRiskFittings, setHighRiskFittings] = useState([])

  const handleRunPrediction = async () => {
    if (!fittingId) {
      toast.error('Please enter a fitting ID')
      return
    }

    try {
      setLoading(true)
      const result = await predictionService.runPrediction(fittingId)
      setPrediction(result)
      toast.success('Prediction completed successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to run prediction')
    } finally {
      setLoading(false)
    }
  }

  const fetchHighRiskFittings = async () => {
    try {
      setLoading(true)
      const result = await predictionService.getHighRiskFittings(70)
      setHighRiskFittings(result.data || [])
    } catch (error) {
      toast.error('Failed to fetch high-risk fittings')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = score => {
    if (score >= 70) return 'red'
    if (score >= 40) return 'yellow'
    return 'green'
  }

  const getRiskLevel = score => {
    if (score >= 70) return 'HIGH'
    if (score >= 40) return 'MEDIUM'
    return 'LOW'
  }

  const columns = [
    { key: 'qrCode', label: 'QR Code', sortable: true },
    {
      key: 'riskScore',
      label: 'Risk Score',
      sortable: true,
      render: value => <Badge variant={getRiskColor(value)}>{value}</Badge>,
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      render: value => (
        <Badge variant={getRiskColor(value === 'HIGH' ? 80 : value === 'MEDIUM' ? 50 : 20)}>
          {value}
        </Badge>
      ),
    },
    { key: 'predictedFailureDate', label: 'Predicted Failure' },
    { key: 'location', label: 'Location' },
    { key: 'zone', label: 'Zone' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Predictions</h1>
        <p className="text-gray-600 mt-2">Run AI predictions and monitor high-risk fittings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['run', 'high-risk'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                if (tab === 'high-risk') fetchHighRiskFittings()
              }}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-ir-blue text-ir-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'run' ? 'Run Prediction' : 'High Risk'}
            </button>
          ))}
        </nav>
      </div>

      {/* Run Prediction Tab */}
      {activeTab === 'run' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="h-6 w-6 text-ir-blue" />
            <h2 className="text-xl font-semibold">Run AI Prediction</h2>
          </div>

          <div className="max-w-md space-y-4">
            <Input
              label="Fitting ID or QR Code"
              placeholder="Enter fitting ID"
              value={fittingId}
              onChange={e => setFittingId(e.target.value)}
            />

            <Button variant="primary" onClick={handleRunPrediction} loading={loading}>
              Run Prediction
            </Button>
          </div>

          {prediction && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Prediction Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRiskColor(prediction.riskScore)} size="lg">
                      {prediction.riskScore}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Level</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRiskColor(prediction.riskScore)} size="lg">
                      {getRiskLevel(prediction.riskScore)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Predicted Failure Date</p>
                  <p className="text-base font-medium mt-1">
                    {prediction.predictedFailureDate || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="text-base font-medium mt-1">{prediction.confidence || 'N/A'}%</p>
                </div>
              </div>
              {prediction.recommendations && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* High Risk Tab */}
      {activeTab === 'high-risk' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">
                {highRiskFittings.length} High-Risk Fittings Detected
              </h3>
              <p className="text-sm text-red-700 mt-1">
                These fittings require immediate attention
              </p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={highRiskFittings}
            loading={loading}
            emptyMessage="No high-risk fittings found"
            currentPage={1}
            pageSize={20}
            totalItems={highRiskFittings.length}
            showActions={true}
            onView={row => console.log('View', row)}
          />
        </div>
      )}
    </div>
  )
}

export default PredictionsPage
