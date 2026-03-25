import {
  ZoneTrendsWidget,
  DefectRatesWidget,
  VendorMetricsWidget,
  DepotRankingsWidget,
  AnalyticsAccessWidget,
  CriticalAlertsWidget,
  ResourceUtilizationWidget,
} from '../../components/zonal-manager/widgets'

const ZonalManagerDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Zone Management Dashboard</h1>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ZoneTrendsWidget />
        <DefectRatesWidget />
        <VendorMetricsWidget />
      </div>

      {/* Analytics and rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepotRankingsWidget />
        <AnalyticsAccessWidget />
      </div>

      {/* Alerts and resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalAlertsWidget />
        <ResourceUtilizationWidget />
      </div>
    </div>
  )
}

export default ZonalManagerDashboardPage
