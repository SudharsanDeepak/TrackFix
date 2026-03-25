const express = require('express');
const aiController = require('./controller');
const { validate, validateParams } = require('../../middlewares/validator');
const { predictSchema } = require('./validator');
const { idParamSchema } = require('../qr/validator');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/authorize');
const { ROLES } = require('../../shared/constants');
const { paginate } = require('../../middlewares/pagination');
const { strictLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

router.post(
  '/predict',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.INSPECTOR),
  strictLimiter,
  validate(predictSchema),
  aiController.predict
);

router.get(
  '/reports/fitting/:fittingId',
  authenticate,
  paginate,
  validateParams(idParamSchema),
  aiController.getReportsByFitting
);

router.get(
  '/reports/high-risk',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.INSPECTOR),
  aiController.getHighRiskPredictions
);

module.exports = router;
