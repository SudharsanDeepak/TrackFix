import {
  QRGenerationStatsWidget,
  InspectionCompletionWidget,
  PendingApprovalsWidget,
  RecentDefectsWidget,
  InventoryStatusWidget,
  QualityMetricsWidget,
  QuickActionsWidget,
} from '../../components/depot-officer/widgets'

const DepotOfficerDashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Depot Operations</h1>
        <QuickActionsWidget />
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QRGenerationStatsWidget />
        <InspectionCompletionWidget />
        <PendingApprovalsWidget />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryStatusWidget />
        <QualityMetricsWidget />
      </div>

      {/* Recent activity */}
      <RecentDefectsWidget />
    </div>
  )
}

export default DepotOfficerDashboardPage
