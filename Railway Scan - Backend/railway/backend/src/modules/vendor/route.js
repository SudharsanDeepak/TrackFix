const express = require('express');
const vendorController = require('./controller');
const { validate, validateParams } = require('../../middlewares/validator');
const { createVendorSchema, updateVendorSchema, blacklistSchema } = require('./validator');
const { idParamSchema } = require('../qr/validator');
const authenticate = require('../../middlewares/auth');
const { authorize, checkPermission } = require('../../middlewares/authorize');
const { ROLES, PERMISSIONS } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  checkPermission(PERMISSIONS.MANAGE_VENDORS),
  validate(createVendorSchema),
  vendorController.create
);

router.get('/', authenticate, paginate, vendorController.list);

router.get('/top-performers', authenticate, vendorController.getTopPerformers);

router.get('/high-risk', authenticate, authorize(ROLES.ADMIN), vendorController.getHighRiskVendors);

router.get('/:id', authenticate, validateParams(idParamSchema), vendorController.getById);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  checkPermission(PERMISSIONS.MANAGE_VENDORS),
  validateParams(idParamSchema),
  validate(updateVendorSchema),
  vendorController.update
);

router.post(
  '/:id/blacklist',
  authenticate,
  authorize(ROLES.ADMIN),
  validateParams(idParamSchema),
  validate(blacklistSchema),
  vendorController.blacklist
);

module.exports = router;
