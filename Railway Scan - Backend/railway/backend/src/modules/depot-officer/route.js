const express = require('express');
const depotOfficerController = require('./controller');
const { validate, validateQuery, validateParams } = require('../../middlewares/validator');
const {
  batchQRSchema,
  listQRQuerySchema,
  exportQRQuerySchema,
  listInspectionsQuerySchema,
  approveInspectionSchema,
  rejectInspectionSchema,
  inspectionIdParamSchema,
  listDefectsQuerySchema,
  assignDefectSchema,
  defectIdParamSchema,
  createInventorySchema,
  updateInventorySchema,
  listInventoryQuerySchema,
  inventoryIdParamSchema,
  generateReportSchema,
  listReportsQuerySchema,
} = require('./validator');
const authenticate = require('../../middlewares/auth');
const roleAuthorization = require('../../middlewares/roleAuthorization');
const dataFilter = require('../../middlewares/dataFilter');
const activityLogger = require('../../middlewares/activityLogger');
const { ROLES } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');

const router = express.Router();

/**
 * Depot Officer Routes
 * All routes are protected with:
 * - authenticate: Verify JWT token
 * - roleAuthorization: Verify DEPOT_OFFICER role
 * - dataFilter: Inject depotId filter
 * - activityLogger: Log user actions
 */

// ==================== QR Management ====================

// POST /api/v1/depot-officer/qr/batch - Generate QR codes in batch
router.post(
  '/qr/batch',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validate(batchQRSchema),
  activityLogger('CREATE', 'QR_BATCH'),
  depotOfficerController.generateBatchQR
);

// GET /api/v1/depot-officer/qr - List QR codes with pagination
router.get(
  '/qr',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  paginate,
  validateQuery(listQRQuerySchema),
  activityLogger('READ', 'QR'),
  depotOfficerController.getQRCodes
);

// GET /api/v1/depot-officer/qr/export - Export QR codes (CSV/PDF)
router.get(
  '/qr/export',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validateQuery(exportQRQuerySchema),
  activityLogger('EXPORT', 'QR'),
  depotOfficerController.exportQRCodes
);

// ==================== Inspection Management ====================

// GET /api/v1/depot-officer/inspections - List all depot inspections
router.get(
  '/inspections',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  paginate,
  validateQuery(listInspectionsQuerySchema),
  activityLogger('READ', 'INSPECTION'),
  depotOfficerController.getInspections
);

// GET /api/v1/depot-officer/inspections/pending - List pending approvals
router.get(
  '/inspections/pending',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  paginate,
  activityLogger('READ', 'INSPECTION'),
  depotOfficerController.getPendingInspections
);

// POST /api/v1/depot-officer/inspections/:id/approve - Approve inspection
router.post(
  '/inspections/:id/approve',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validateParams(inspectionIdParamSchema),
  validate(approveInspectionSchema),
  activityLogger('APPROVE', 'INSPECTION'),
  depotOfficerController.approveInspection
);

// POST /api/v1/depot-officer/inspections/:id/reject - Reject inspection
router.post(
  '/inspections/:id/reject',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validateParams(inspectionIdParamSchema),
  validate(rejectInspectionSchema),
  activityLogger('REJECT', 'INSPECTION'),
  depotOfficerController.rejectInspection
);

// ==================== Defect Management ====================

// GET /api/v1/depot-officer/defects - List all depot defects
router.get(
  '/defects',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  paginate,
  validateQuery(listDefectsQuerySchema),
  activityLogger('READ', 'DEFECT'),
  depotOfficerController.getDefects
);

// POST /api/v1/depot-officer/defects/:id/assign - Assign defect to user
router.post(
  '/defects/:id/assign',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validateParams(defectIdParamSchema),
  validate(assignDefectSchema),
  activityLogger('UPDATE', 'DEFECT'),
  depotOfficerController.assignDefect
);

// ==================== Inventory Management ====================

// GET /api/v1/depot-officer/inventory - List inventory items
router.get(
  '/inventory',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  paginate,
  validateQuery(listInventoryQuerySchema),
  activityLogger('READ', 'INVENTORY'),
  depotOfficerController.getInventory
);

// POST /api/v1/depot-officer/inventory - Add inventory item
router.post(
  '/inventory',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validate(createInventorySchema),
  activityLogger('CREATE', 'INVENTORY'),
  depotOfficerController.createInventoryItem
);

// PUT /api/v1/depot-officer/inventory/:id - Update inventory item
router.put(
  '/inventory/:id',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validateParams(inventoryIdParamSchema),
  validate(updateInventorySchema),
  activityLogger('UPDATE', 'INVENTORY'),
  depotOfficerController.updateInventoryItem
);

// DELETE /api/v1/depot-officer/inventory/:id - Remove inventory item
router.delete(
  '/inventory/:id',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validateParams(inventoryIdParamSchema),
  activityLogger('DELETE', 'INVENTORY'),
  depotOfficerController.deleteInventoryItem
);

// ==================== Reporting ====================

// POST /api/v1/depot-officer/reports/generate - Generate report
router.post(
  '/reports/generate',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  validate(generateReportSchema),
  activityLogger('CREATE', 'REPORT'),
  depotOfficerController.generateReport
);

// GET /api/v1/depot-officer/reports - List generated reports
router.get(
  '/reports',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  paginate,
  validateQuery(listReportsQuerySchema),
  activityLogger('READ', 'REPORT'),
  depotOfficerController.getReports
);

// ==================== Dashboard ====================

// GET /api/v1/depot-officer/dashboard/stats - Get dashboard statistics
router.get(
  '/dashboard/stats',
  authenticate,
  roleAuthorization([ROLES.DEPOT_OFFICER]),
  dataFilter(),
  activityLogger('READ', 'DASHBOARD'),
  depotOfficerController.getDashboardStats
);

module.exports = router;
