const dashboardService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');

class DashboardController {
  getOverviewStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getOverviewStats();
    ResponseFormatter.success(res, stats, 'Overview stats retrieved successfully');
  });

  getVendorRanking = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const ranking = await dashboardService.getVendorRanking(limit);
    ResponseFormatter.success(res, ranking, 'Vendor ranking retrieved successfully');
  });

  getFailureRateByRegion = asyncHandler(async (req, res) => {
    const failureRate = await dashboardService.getFailureRateByRegion();
    ResponseFormatter.success(res, failureRate, 'Failure rate by region retrieved successfully');
  });

  getWarrantyAlerts = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    const alerts = await dashboardService.getWarrantyAlerts(days);
    ResponseFormatter.success(res, alerts, 'Warranty alerts retrieved successfully');
  });

  getBatchRecallDetection = asyncHandler(async (req, res) => {
    const candidates = await dashboardService.getBatchRecallDetection();
    ResponseFormatter.success(res, candidates, 'Batch recall candidates retrieved successfully');
  });

  getInventoryDistribution = asyncHandler(async (req, res) => {
    const distribution = await dashboardService.getInventoryDistribution();
    ResponseFormatter.success(res, distribution, 'Inventory distribution retrieved successfully');
  });

  getAIPredictionSummary = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getAIPredictionSummary();
    ResponseFormatter.success(res, summary, 'AI prediction summary retrieved successfully');
  });
}

module.exports = new DashboardController();
