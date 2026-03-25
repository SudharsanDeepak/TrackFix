const express = require('express');
const dashboardController = require('./controller');
const authenticate = require('../../middlewares/auth');
const { checkPermission } = require('../../middlewares/authorize');
const { PERMISSIONS } = require('../../shared/constants');

const router = express.Router();

router.get(
  '/overview',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getOverviewStats
);

router.get(
  '/vendor-ranking',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getVendorRanking
);

router.get(
  '/failure-rate',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getFailureRateByRegion
);

router.get(
  '/warranty-alerts',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getWarrantyAlerts
);

router.get(
  '/recall-detection',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getBatchRecallDetection
);

router.get(
  '/inventory-distribution',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getInventoryDistribution
);

router.get(
  '/ai-summary',
  authenticate,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  dashboardController.getAIPredictionSummary
);

module.exports = router;
