const zonalManagerService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

/**
 * Zonal Manager Controller
 * Handles HTTP requests for Zonal Manager role operations
 */

class ZonalManagerController {
  /**
   * GET /api/v1/zonal-manager/analytics/inspection-trends
   * Get inspection trends over time
   */
  getInspectionTrends = asyncHandler(async (req, res) => {
    const trends = await zonalManagerService.getInspectionTrends(
      req.query,
      req.dataFilter,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, trends, 'Inspection trends retrieved successfully');
  });

  /**
   * GET /api/v1/zonal-manager/analytics/defect-trends
   * Get defect rate trends
   */
  getDefectTrends = asyncHandler(async (req, res) => {
    const trends = await zonalManagerService.getDefectTrends(
      req.query,
      req.dataFilter,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, trends, 'Defect trends retrieved successfully');
  });

  /**
   * GET /api/v1/zonal-manager/depots/performance
   * Get depot performance metrics
   */
  getDepotPerformance = asyncHandler(async (req, res) => {
    const performance = await zonalManagerService.getDepotPerformance(
      req.query,
      req.dataFilter,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, performance, 'Depot performance retrieved successfully');
  });

  /**
   * GET /api/v1/zonal-manager/depots/rankings
   * Get depot rankings by performance score
   */
  getDepotRankings = asyncHandler(async (req, res) => {
    const rankings = await zonalManagerService.getDepotRankings(
      req.query,
      req.dataFilter,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, rankings, 'Depot rankings retrieved successfully');
  });

  /**
   * GET /api/v1/zonal-manager/vendors
   * List vendors with performance metrics
   */
  getVendors = asyncHandler(async (req, res) => {
    const vendors = await zonalManagerService.getVendors(
      req.query,
      req.dataFilter,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, vendors, 'Vendors retrieved successfully');
  });

  /**
   * GET /api/v1/zonal-manager/vendors/:id/performance
   * Get detailed vendor performance
   */
  getVendorPerformance = asyncHandler(async (req, res) => {
    const performance = await zonalManagerService.getVendorPerformance(
      req.params.id,
      req.query,
      req.dataFilter,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, performance, 'Vendor performance retrieved successfully');
  });

  /**
   * POST /api/v1/zonal-manager/vendors/:id/rate
   * Submit vendor rating
   */
  rateVendor = asyncHandler(async (req, res) => {
    const result = await zonalManagerService.rateVendor(
      req.params.id,
      req.body,
      req.user.id,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, result, 'Vendor rated successfully');
  });

  /**
   * GET /api/v1/zonal-manager/alerts
   * List active alerts for the zone
   */
  getAlerts = asyncHandler(async (req, res) => {
    const { alerts, total } = await zonalManagerService.getAlerts(
      req.query,
      req.dataFilter,
      req.pagination,
      req.user.zoneId
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, alerts, pagination, 'Alerts retrieved successfully');
  });

  /**
   * POST /api/v1/zonal-manager/alerts/:id/acknowledge
   * Acknowledge an alert
   */
  acknowledgeAlert = asyncHandler(async (req, res) => {
    const alert = await zonalManagerService.acknowledgeAlert(
      req.params.id,
      req.body,
      req.user.id,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, alert, 'Alert acknowledged successfully');
  });

  /**
   * POST /api/v1/zonal-manager/alerts/:id/escalate
   * Escalate an alert
   */
  escalateAlert = asyncHandler(async (req, res) => {
    const alert = await zonalManagerService.escalateAlert(
      req.params.id,
      req.body,
      req.user.id,
      req.user.zoneId
    );
    
    ResponseFormatter.success(res, alert, 'Alert escalated successfully');
  });

  /**
   * POST /api/v1/zonal-manager/reports/generate
   * Generate a zone-level report
   */
  generateReport = asyncHandler(async (req, res) => {
    const report = await zonalManagerService.generateReport(
      req.body,
      req.user.id,
      req.user.zoneId
    );
    
    // Store created resource ID for activity logging
    res.locals.createdResourceId = report.reportId;
    
    ResponseFormatter.created(res, report, 'Report generation initiated successfully');
  });

  /**
   * GET /api/v1/zonal-manager/reports
   * List generated reports
   */
  getReports = asyncHandler(async (req, res) => {
    const { reports, total } = await zonalManagerService.getReports(
      req.query,
      req.dataFilter,
      req.pagination,
      req.user.id
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, reports, pagination, 'Reports retrieved successfully');
  });

  /**
   * GET /api/v1/zonal-manager/dashboard/stats
   * Get dashboard statistics
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await zonalManagerService.getDashboardStats(
      req.user.id,
      req.user.zoneId,
      req.dataFilter
    );
    
    ResponseFormatter.success(res, stats, 'Dashboard statistics retrieved successfully');
  });
}

module.exports = new ZonalManagerController();
