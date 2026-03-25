const express = require('express');
const qrController = require('./controller');
const { validate, validateQuery, validateParams } = require('../../middlewares/validator');
const {
  generateBatchSchema,
  updateFittingSchema,
  recallLotSchema,
  listFittingsQuerySchema,
  qrIdParamSchema,
  idParamSchema,
} = require('./validator');
const authenticate = require('../../middlewares/auth');
const { authorize, checkPermission } = require('../../middlewares/authorize');
const { ROLES, PERMISSIONS } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');
const { strictLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

router.post(
  '/generate-batch',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DEPOT_OFFICER),
  checkPermission(PERMISSIONS.CREATE_QR),
  strictLimiter,
  validate(generateBatchSchema),
  qrController.generateBatch
);

router.get(
  '/:qrId',
  authenticate,
  validateParams(qrIdParamSchema),
  qrController.getByQRId
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.DEPOT_OFFICER),
  checkPermission(PERMISSIONS.UPDATE_QR),
  validateParams(idParamSchema),
  validate(updateFittingSchema),
  qrController.updateFitting
);

router.get(
  '/',
  authenticate,
  paginate,
  validateQuery(listFittingsQuerySchema),
  qrController.listFittings
);

router.post(
  '/recall-lot',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(recallLotSchema),
  qrController.recallLot
);

router.get(
  '/warranty/expiring',
  authenticate,
  qrController.getExpiringWarranties
);

module.exports = router;
