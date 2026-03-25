import {
  UserStatsWidget,
  SystemHealthWidget,
  ActivityLogsWidget,
  SecurityAlertsWidget,
  UserManagementAccessWidget,
  SystemWideStatsWidget,
  StorageMetricsWidget,
} from '../../components/admin/widgets'

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserStatsWidget />
        <SystemHealthWidget />
        <SecurityAlertsWidget />
      </div>

      {/* System-wide stats and management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemWideStatsWidget />
        <UserManagementAccessWidget />
      </div>

      {/* Activity and storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityLogsWidget />
        <StorageMetricsWidget />
      </div>
    </div>
  )
}

export default AdminDashboardPage
