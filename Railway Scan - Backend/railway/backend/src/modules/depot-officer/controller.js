const depotOfficerService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

/**
 * Depot Officer Controller
 * Handles HTTP requests for Depot Officer role operations
 */

class DepotOfficerController {
  // ==================== QR Management ====================
  
  /**
   * POST /api/v1/depot-officer/qr/batch
   * Generate QR codes in batch
   */
  generateBatchQR = asyncHandler(async (req, res) => {
    const result = await depotOfficerService.generateBatchQR(
      req.body,
      req.user.depotId
    );
    
    res.locals.createdResourceId = result.batchId;
    ResponseFormatter.created(res, result, 'QR codes generated successfully');
  });

  /**
   * GET /api/v1/depot-officer/qr
   * List QR codes for the depot
   */
  getQRCodes = asyncHandler(async (req, res) => {
    const { qrCodes, total } = await depotOfficerService.getQRCodes(
      req.query,
      req.dataFilter,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, qrCodes, pagination, 'QR codes retrieved successfully');
  });

  /**
   * GET /api/v1/depot-officer/qr/export
   * Export QR codes in specified format
   */
  exportQRCodes = asyncHandler(async (req, res) => {
    const result = await depotOfficerService.exportQRCodes(
      req.query,
      req.dataFilter,
      req.query.format
    );
    
    ResponseFormatter.success(res, result, 'QR codes exported successfully');
  });

  // ==================== Inspection Management ====================
  
  /**
   * GET /api/v1/depot-officer/inspections
   * List all inspections for the depot
   */
  getInspections = asyncHandler(async (req, res) => {
    const { inspections, total } = await depotOfficerService.getInspections(
      req.query,
      req.dataFilter,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inspections, pagination, 'Inspections retrieved successfully');
  });

  /**
   * GET /api/v1/depot-officer/inspections/pending
   * List pending inspections awaiting approval
   */
  getPendingInspections = asyncHandler(async (req, res) => {
    const { inspections, total } = await depotOfficerService.getPendingInspections(
      req.dataFilter,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inspections, pagination, 'Pending inspections retrieved successfully');
  });

  /**
   * POST /api/v1/depot-officer/inspections/:id/approve
   * Approve an inspection
   */
  approveInspection = asyncHandler(async (req, res) => {
    const inspection = await depotOfficerService.approveInspection(
      req.params.id,
      req.body,
      req.user.id,
      req.user.depotId
    );
    
    ResponseFormatter.success(res, inspection, 'Inspection approved successfully');
  });

  /**
   * POST /api/v1/depot-officer/inspections/:id/reject
   * Reject an inspection
   */
  rejectInspection = asyncHandler(async (req, res) => {
    const inspection = await depotOfficerService.rejectInspection(
      req.params.id,
      req.body,
      req.user.id,
      req.user.depotId
    );
    
    ResponseFormatter.success(res, inspection, 'Inspection rejected successfully');
  });

  // ==================== Defect Management ====================
  
  /**
   * GET /api/v1/depot-officer/defects
   * List all defects for the depot
   */
  getDefects = asyncHandler(async (req, res) => {
    const { defects, total } = await depotOfficerService.getDefects(
      req.query,
      req.dataFilter,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, defects, pagination, 'Defects retrieved successfully');
  });

  /**
   * POST /api/v1/depot-officer/defects/:id/assign
   * Assign a defect to a user
   */
  assignDefect = asyncHandler(async (req, res) => {
    const defect = await depotOfficerService.assignDefect(
      req.params.id,
      req.body,
      req.user.id,
      req.user.depotId
    );
    
    ResponseFormatter.success(res, defect, 'Defect assigned successfully');
  });

  // ==================== Inventory Management ====================
  
  /**
   * GET /api/v1/depot-officer/inventory
   * List all inventory items for the depot
   */
  getInventory = asyncHandler(async (req, res) => {
    const { inventory, total } = await depotOfficerService.getInventory(
      req.query,
      req.dataFilter,
      req.pagination
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inventory, pagination, 'Inventory retrieved successfully');
  });

  /**
   * POST /api/v1/depot-officer/inventory
   * Add a new inventory item
   */
  createInventoryItem = asyncHandler(async (req, res) => {
    const item = await depotOfficerService.createInventoryItem(
      req.body,
      req.user.depotId
    );
    
    res.locals.createdResourceId = item.itemId;
    ResponseFormatter.created(res, item, 'Inventory item created successfully');
  });

  /**
   * PUT /api/v1/depot-officer/inventory/:id
   * Update an inventory item
   */
  updateInventoryItem = asyncHandler(async (req, res) => {
    const item = await depotOfficerService.updateInventoryItem(
      req.params.id,
      req.body,
      req.user.depotId
    );
    
    ResponseFormatter.success(res, item, 'Inventory item updated successfully');
  });

  /**
   * DELETE /api/v1/depot-officer/inventory/:id
   * Remove an inventory item
   */
  deleteInventoryItem = asyncHandler(async (req, res) => {
    await depotOfficerService.deleteInventoryItem(
      req.params.id,
      req.user.depotId
    );
    
    ResponseFormatter.success(res, null, 'Inventory item deleted successfully');
  });

  // ==================== Reporting ====================
  
  /**
   * POST /api/v1/depot-officer/reports/generate
   * Generate a report
   */
  generateReport = asyncHandler(async (req, res) => {
    const report = await depotOfficerService.generateReport(
      req.body,
      req.user.id,
      req.user.depotId
    );
    
    res.locals.createdResourceId = report.reportId;
    ResponseFormatter.created(res, report, 'Report generation initiated successfully');
  });

  /**
   * GET /api/v1/depot-officer/reports
   * List generated reports
   */
  getReports = asyncHandler(async (req, res) => {
    const { reports, total } = await depotOfficerService.getReports(
      req.query,
      req.pagination,
      req.user.id
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, reports, pagination, 'Reports retrieved successfully');
  });

  // ==================== Dashboard ====================
  
  /**
   * GET /api/v1/depot-officer/dashboard/stats
   * Get dashboard statistics
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await depotOfficerService.getDashboardStats(
      req.user.id,
      req.user.depotId,
      req.dataFilter
    );
    
    ResponseFormatter.success(res, stats, 'Dashboard statistics retrieved successfully');
  });
}

module.exports = new DepotOfficerController();
