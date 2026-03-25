const Joi = require('joi');

/**
 * Validation schemas for Zonal Manager endpoints
 */

// Analytics endpoints
const inspectionTrendsQuerySchema = Joi.object({
  timeRange: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
  depotId: Joi.string().optional(),
});

const defectTrendsQuerySchema = Joi.object({
  timeRange: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
  depotId: Joi.string().optional(),
  fittingType: Joi.string().optional(),
});

// Depot performance endpoints
const depotPerformanceQuerySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

// Vendor management endpoints
const vendorPerformanceQuerySchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

const vendorIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const rateVendorSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).optional(),
  category: Joi.string().valid('QUALITY', 'DELIVERY', 'SUPPORT', 'OVERALL').required(),
});

// Alert management endpoints
const alertsQuerySchema = Joi.object({
  severity: Joi.string().valid('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY').optional(),
  status: Joi.string().valid('ACTIVE', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED').optional(),
  alertType: Joi.string().valid('DEFECT_CRITICAL', 'INVENTORY_LOW', 'INSPECTION_OVERDUE', 'VENDOR_ISSUE', 'SYSTEM_ERROR').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const alertIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const acknowledgeAlertSchema = Joi.object({
  notes: Joi.string().trim().max(500).optional(),
});

const escalateAlertSchema = Joi.object({
  escalateTo: Joi.string().hex().length(24).required(),
  reason: Joi.string().trim().min(10).max(1000).required(),
});

// Reporting endpoints
const generateReportSchema = Joi.object({
  reportType: Joi.string().valid('TREND_ANALYSIS', 'DEPOT_COMPARISON', 'VENDOR_PERFORMANCE').required(),
  format: Joi.string().valid('PDF', 'CSV', 'JSON').default('PDF'),
  filters: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    depotIds: Joi.array().items(Joi.string()).optional(),
    vendorIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  }).optional(),
});

const listReportsQuerySchema = Joi.object({
  reportType: Joi.string().valid('TREND_ANALYSIS', 'DEPOT_COMPARISON', 'VENDOR_PERFORMANCE').optional(),
  status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
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
};
