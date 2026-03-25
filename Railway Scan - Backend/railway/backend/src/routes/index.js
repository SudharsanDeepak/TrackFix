const express = require('express');
const authRoutes = require('../modules/auth/route');
const vendorRoutes = require('../modules/vendor/route');
const qrRoutes = require('../modules/qr/route');
const aiRoutes = require('../modules/ai/route');
const dashboardRoutes = require('../modules/dashboard/route');
const integrationRoutes = require('../modules/integration/route');
const inspectionRoutes = require('../modules/inspection/route');
const inspectorRoutes = require('../modules/inspector/route');
const depotOfficerRoutes = require('../modules/depot-officer/route');
const zonalManagerRoutes = require('../modules/zonal-manager/route');
const adminRoutes = require('../modules/admin/route');
const healthRoutes = require('./health');
const config = require('../config');

const router = express.Router();

const apiVersion = config.apiVersion;

router.use(healthRoutes);

router.use(`/api/${apiVersion}/auth`, authRoutes);
router.use(`/api/${apiVersion}/vendors`, vendorRoutes);
router.use(`/api/${apiVersion}/qr`, qrRoutes);
router.use(`/api/${apiVersion}/ai`, aiRoutes);
router.use(`/api/${apiVersion}/dashboard`, dashboardRoutes);
router.use(`/api/${apiVersion}/integration`, integrationRoutes);
router.use(`/api/${apiVersion}/inspections`, inspectionRoutes);

// Role-specific routes
router.use(`/api/${apiVersion}/inspector`, inspectorRoutes);
router.use(`/api/${apiVersion}/depot-officer`, depotOfficerRoutes);
router.use(`/api/${apiVersion}/zonal-manager`, zonalManagerRoutes);
router.use(`/api/${apiVersion}/admin`, adminRoutes);

router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'RailTrack AI - National Railway Track Fitting Lifecycle & Predictive Monitoring System',
    version: apiVersion,
    documentation: '/api-docs',
  });
});

module.exports = router;
