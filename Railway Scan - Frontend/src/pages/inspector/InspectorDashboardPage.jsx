import {
  ActiveInspectionsWidget,
  QRScannerWidget,
  RecentInspectionsWidget,
  PendingDefectsWidget,
  DailyStatsWidget,
  QuickActionsWidget,
} from '../../components/inspector/widgets'

const InspectorDashboardPage = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Quick Actions - Prominent on mobile */}
      <QuickActionsWidget />

      {/* Two column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="space-y-4 md:space-y-6">
          {/* Active Assignments */}
          <ActiveInspectionsWidget />

          {/* Quick QR Scanner */}
          <QRScannerWidget />
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          {/* Daily Stats */}
          <DailyStatsWidget />

          {/* Pending Defects */}
          <PendingDefectsWidget />
        </div>
      </div>

      {/* Recent History - Full width */}
      <RecentInspectionsWidget limit={10} />
    </div>
  )
}

export default InspectorDashboardPage
