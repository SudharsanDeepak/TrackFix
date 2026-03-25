const inspectorService = require('./service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const { buildPaginationResponse } = require('../../middlewares/pagination');

/**
 * Inspector Controller
 * Handles HTTP requests for Inspector role operations
 */

class InspectorController {
  /**
   * GET /api/v1/inspector/inspections
   * List inspections assigned to the authenticated inspector
   */
  getInspections = asyncHandler(async (req, res) => {
    const { inspections, total } = await inspectorService.getInspections(
      req.query,
      req.dataFilter,
      req.pagination,
      req.user.id
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, inspections, pagination, 'Inspections retrieved successfully');
  });

  /**
   * POST /api/v1/inspector/inspections
   * Start a new inspection
   */
  createInspection = asyncHandler(async (req, res) => {
    const inspection = await inspectorService.createInspection(
      req.body,
      req.user.id,
      req.user.depotId
    );
    
    // Store created resource ID for activity logging
    res.locals.createdResourceId = inspection.id;
    
    ResponseFormatter.created(res, inspection, 'Inspection created successfully');
  });

  /**
   * PUT /api/v1/inspector/inspections/:id
   * Submit inspection results
   */
  submitInspection = asyncHandler(async (req, res) => {
    const inspection = await inspectorService.submitInspection(
      req.params.id,
      req.body,
      req.user.id
    );
    
    ResponseFormatter.success(res, inspection, 'Inspection submitted successfully');
  });

  /**
   * DELETE /api/v1/inspector/inspections/:id
   * Delete inspection
   */
  deleteInspection = asyncHandler(async (req, res) => {
    await inspectorService.deleteInspection(
      req.params.id,
      req.user.id
    );
    
    ResponseFormatter.success(res, null, 'Inspection deleted successfully');
  });

  /**
   * GET /api/v1/inspector/tasks
   * Get assigned tasks for the inspector
   */
  getTasks = asyncHandler(async (req, res) => {
    const tasks = await inspectorService.getTasks(
      req.user.id,
      req.dataFilter
    );
    
    ResponseFormatter.success(res, tasks, 'Tasks retrieved successfully');
  });

  /**
   * POST /api/v1/inspector/defects
   * Submit a defect report
   */
  createDefect = asyncHandler(async (req, res) => {
    const defect = await inspectorService.createDefect(
      req.body,
      req.user.id,
      req.user.depotId
    );
    
    // Store created resource ID for activity logging
    res.locals.createdResourceId = defect.defectId;
    
    ResponseFormatter.created(res, defect, 'Defect reported successfully');
  });

  /**
   * GET /api/v1/inspector/defects
   * List defects reported by the inspector
   */
  getDefects = asyncHandler(async (req, res) => {
    const { defects, total } = await inspectorService.getDefects(
      req.query,
      req.dataFilter,
      req.pagination,
      req.user.id
    );
    
    const pagination = buildPaginationResponse(total, req.pagination.page, req.pagination.limit);
    ResponseFormatter.paginated(res, defects, pagination, 'Defects retrieved successfully');
  });

  /**
   * GET /api/v1/inspector/dashboard/stats
   * Get dashboard statistics for the inspector
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await inspectorService.getDashboardStats(
      req.user.id,
      req.user.depotId,
      req.dataFilter
    );
    
    ResponseFormatter.success(res, stats, 'Dashboard statistics retrieved successfully');
  });

  /**
   * POST /api/v1/inspector/scan-qr
   * Scan and validate QR code
   */
  scanQR = asyncHandler(async (req, res) => {
    const result = await inspectorService.scanQR(
      req.body.qrId,
      req.dataFilter
    );
    
    ResponseFormatter.success(res, result, 'QR code scanned successfully');
  });
}

module.exports = new InspectorController();
