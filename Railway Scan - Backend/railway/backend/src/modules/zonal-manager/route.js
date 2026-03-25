const express = require('express');
const zonalManagerController = require('./controller');
const { validate, validateQuery, validateParams } = require('../../middlewares/validator');
const {
  inspectionTrendsQuerySchema,
  defectTrendsQuerySchema,
  depotPerformanceQuerySchema,
  vendorPerformanceQuerySchema,
  vendorIdParamSchema,
  rateVendorSchema,
  alertsQuerySchema,
  alertIdParamSchema,
  acknowledgeAlertSchema,
  escalateAlertSchema,
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
 * Zonal Manager Routes
 * All routes are protected with:
 * - authenticate: Verify JWT token
 * - roleAuthorization: Verify ZONAL_MANAGER role
 * - dataFilter: Inject zoneId filter
 * - activityLogger: Log user actions
 */

// Analytics endpoints
router.get(
  '/analytics/inspection-trends',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateQuery(inspectionTrendsQuerySchema),
  activityLogger('READ', 'ANALYTICS'),
  zonalManagerController.getInspectionTrends
);

router.get(
  '/analytics/defect-trends',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateQuery(defectTrendsQuerySchema),
  activityLogger('READ', 'ANALYTICS'),
  zonalManagerController.getDefectTrends
);

// Depot performance endpoints
router.get(
  '/depots/performance',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateQuery(depotPerformanceQuerySchema),
  activityLogger('READ', 'DEPOT_PERFORMANCE'),
  zonalManagerController.getDepotPerformance
);

router.get(
  '/depots/rankings',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateQuery(depotPerformanceQuerySchema),
  activityLogger('READ', 'DEPOT_RANKINGS'),
  zonalManagerController.getDepotRankings
);

// Vendor management endpoints
router.get(
  '/vendors',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateQuery(vendorPerformanceQuerySchema),
  activityLogger('READ', 'VENDOR'),
  zonalManagerController.getVendors
);

router.get(
  '/vendors/:id/performance',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateParams(vendorIdParamSchema),
  validateQuery(vendorPerformanceQuerySchema),
  activityLogger('READ', 'VENDOR_PERFORMANCE'),
  zonalManagerController.getVendorPerformance
);

router.post(
  '/vendors/:id/rate',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateParams(vendorIdParamSchema),
  validate(rateVendorSchema),
  activityLogger('CREATE', 'VENDOR_RATING'),
  zonalManagerController.rateVendor
);

// Alert management endpoints
router.get(
  '/alerts',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  paginate,
  validateQuery(alertsQuerySchema),
  activityLogger('READ', 'ALERT'),
  zonalManagerController.getAlerts
);

router.post(
  '/alerts/:id/acknowledge',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateParams(alertIdParamSchema),
  validate(acknowledgeAlertSchema),
  activityLogger('UPDATE', 'ALERT'),
  zonalManagerController.acknowledgeAlert
);

router.post(
  '/alerts/:id/escalate',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validateParams(alertIdParamSchema),
  validate(escalateAlertSchema),
  activityLogger('UPDATE', 'ALERT'),
  zonalManagerController.escalateAlert
);

// Reporting endpoints
router.post(
  '/reports/generate',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  validate(generateReportSchema),
  activityLogger('CREATE', 'REPORT'),
  zonalManagerController.generateReport
);

router.get(
  '/reports',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  paginate,
  validateQuery(listReportsQuerySchema),
  activityLogger('READ', 'REPORT'),
  zonalManagerController.getReports
);

// Dashboard endpoint
router.get(
  '/dashboard/stats',
  authenticate,
  roleAuthorization([ROLES.ZONAL_MANAGER]),
  dataFilter(),
  activityLogger('READ', 'DASHBOARD'),
  zonalManagerController.getDashboardStats
);

module.exports = router;
