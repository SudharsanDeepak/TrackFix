const express = require('express');
const inspectionController = require('./controller');
const { validate, validateParams } = require('../../middlewares/validator');
const { createInspectionSchema, updateInspectionSchema } = require('./validator');
const { idParamSchema } = require('../qr/validator');
const authenticate = require('../../middlewares/auth');
const { authorize, checkPermission } = require('../../middlewares/authorize');
const { ROLES, PERMISSIONS } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.INSPECTOR),
  checkPermission(PERMISSIONS.CONDUCT_INSPECTION),
  validate(createInspectionSchema),
  inspectionController.create
);

router.get(
  '/my-inspections',
  authenticate,
  authorize(ROLES.INSPECTOR),
  paginate,
  inspectionController.getByInspector
);

router.get(
  '/failed',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.INSPECTOR),
  paginate,
  inspectionController.getFailedInspections
);

router.get(
  '/fitting/:fittingId',
  authenticate,
  paginate,
  validateParams(idParamSchema),
  inspectionController.getByFitting
);

router.get(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  inspectionController.getById
);

router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.INSPECTOR),
  validateParams(idParamSchema),
  validate(updateInspectionSchema),
  inspectionController.update
);

module.exports = router;
