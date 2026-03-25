const express = require('express');
const integrationController = require('./controller');
const { validate } = require('../../middlewares/validator');
const { exportSchema } = require('./validator');
const authenticate = require('../../middlewares/auth');
const { authorize, checkPermission } = require('../../middlewares/authorize');
const { ROLES, PERMISSIONS } = require('../../shared/constants');
const { strictLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

router.post(
  '/export/udm',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DEPOT_OFFICER),
  checkPermission(PERMISSIONS.EXPORT_DATA),
  strictLimiter,
  validate(exportSchema),
  integrationController.exportToUDM
);

router.post(
  '/export/tms',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DEPOT_OFFICER),
  checkPermission(PERMISSIONS.EXPORT_DATA),
  strictLimiter,
  validate(exportSchema),
  integrationController.exportToTMS
);

router.post(
  '/sync',
  authenticate,
  authorize(ROLES.ADMIN),
  strictLimiter,
  validate(exportSchema),
  integrationController.syncData
);

module.exports = router;
