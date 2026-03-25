const express = require('express');
const inspectorController = require('./controller');
const { validate, validateQuery, validateParams } = require('../../middlewares/validator');
const {
  createInspectionSchema,
  submitInspectionSchema,
  createDefectSchema,
  scanQRSchema,
  listInspectionsQuerySchema,
  listDefectsQuerySchema,
  inspectionIdParamSchema,
} = require('./validator');
const authenticate = require('../../middlewares/auth');
const roleAuthorization = require('../../middlewares/roleAuthorization');
const dataFilter = require('../../middlewares/dataFilter');
const activityLogger = require('../../middlewares/activityLogger');
const { ROLES } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');

const router = express.Router();

/**
 * Inspector Routes
 * All routes are protected with:
 * - authenticate: Verify JWT token
 * - roleAuthorization: Verify INSPECTOR role
 * - dataFilter: Inject depotId filter
 * - activityLogger: Log user actions
 */

// GET /api/v1/inspector/inspections - List assigned inspections
router.get(
  '/inspections',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  paginate,
  validateQuery(listInspectionsQuerySchema),
  activityLogger('READ', 'INSPECTION'),
  inspectorController.getInspections
);

// POST /api/v1/inspector/inspections - Start new inspection
router.post(
  '/inspections',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  validate(createInspectionSchema),
  activityLogger('CREATE', 'INSPECTION'),
  inspectorController.createInspection
);

// DELETE /api/v1/inspector/inspections/:id - Delete inspection
router.delete(
  '/inspections/:id',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  validateParams(inspectionIdParamSchema),
  activityLogger('DELETE', 'INSPECTION'),
  inspectorController.deleteInspection
);

// PUT /api/v1/inspector/inspections/:id - Submit inspection results
router.put(
  '/inspections/:id',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  validateParams(inspectionIdParamSchema),
  validate(submitInspectionSchema),
  activityLogger('UPDATE', 'INSPECTION'),
  inspectorController.submitInspection
);

// GET /api/v1/inspector/tasks - Get assigned tasks
router.get(
  '/tasks',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  activityLogger('READ', 'TASK'),
  inspectorController.getTasks
);

// POST /api/v1/inspector/defects - Submit defect report
router.post(
  '/defects',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  validate(createDefectSchema),
  activityLogger('CREATE', 'DEFECT'),
  inspectorController.createDefect
);

// GET /api/v1/inspector/defects - List reported defects
router.get(
  '/defects',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  paginate,
  validateQuery(listDefectsQuerySchema),
  activityLogger('READ', 'DEFECT'),
  inspectorController.getDefects
);

// GET /api/v1/inspector/dashboard/stats - Get dashboard statistics
router.get(
  '/dashboard/stats',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  activityLogger('READ', 'DASHBOARD'),
  inspectorController.getDashboardStats
);

// POST /api/v1/inspector/scan-qr - Scan and validate QR code
router.post(
  '/scan-qr',
  authenticate,
  roleAuthorization([ROLES.INSPECTOR]),
  dataFilter(),
  validate(scanQRSchema),
  activityLogger('READ', 'QR'),
  inspectorController.scanQR
);

module.exports = router;
