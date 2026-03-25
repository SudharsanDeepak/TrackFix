const Joi = require('joi');
const { FITTING_TYPES } = require('../../shared/constants');

/**
 * Validation schemas for Depot Officer endpoints
 */

// QR Management Schemas
const batchQRSchema = Joi.object({
  fittingType: Joi.string().valid(...Object.keys(FITTING_TYPES)).required(),
  quantity: Joi.number().integer().min(1).max(1000).required(),
  lotNumber: Joi.string().trim().required(),
  vendorCode: Joi.string().trim().required(),
  manufacturingDate: Joi.date().required(),
  specifications: Joi.object().optional(),
});

const listQRQuerySchema = Joi.object({
  fittingType: Joi.string().valid(...Object.keys(FITTING_TYPES)).optional(),
  status: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const exportQRQuerySchema = Joi.object({
  format: Joi.string().valid('CSV', 'PDF').required(),
  fittingType: Joi.string().valid(...Object.keys(FITTING_TYPES)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

// Inspection Management Schemas
const listInspectionsQuerySchema = Joi.object({
  status: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  inspector: Joi.string().hex().length(24).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const approveInspectionSchema = Joi.object({
  comments: Joi.string().trim().max(1000).optional(),
});

const rejectInspectionSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(1000).required(),
  comments: Joi.string().trim().max(1000).optional(),
});

// Defect Management Schemas
const listDefectsQuerySchema = Joi.object({
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  status: Joi.string().valid('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const assignDefectSchema = Joi.object({
  assignedTo: Joi.string().hex().length(24).required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  comments: Joi.string().trim().max(1000).optional(),
});

// Inventory Management Schemas
const createInventorySchema = Joi.object({
  fittingType: Joi.string().valid(...Object.keys(FITTING_TYPES)).required(),
  quantity: Joi.number().integer().min(0).required(),
  minThreshold: Joi.number().integer().min(0).required(),
  maxThreshold: Joi.number().integer().min(0).required(),
  location: Joi.string().trim().max(200).required(),
});

const updateInventorySchema = Joi.object({
  quantity: Joi.number().integer().min(0).optional(),
  minThreshold: Joi.number().integer().min(0).optional(),
  maxThreshold: Joi.number().integer().min(0).optional(),
  location: Joi.string().trim().max(200).optional(),
  lastRestocked: Joi.date().optional(),
});

const listInventoryQuerySchema = Joi.object({
  fittingType: Joi.string().valid(...Object.keys(FITTING_TYPES)).optional(),
  lowStock: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// Report Generation Schemas
const generateReportSchema = Joi.object({
  reportType: Joi.string().valid('INSPECTION_SUMMARY', 'DEFECT_ANALYSIS', 'INVENTORY_STATUS').required(),
  format: Joi.string().valid('PDF', 'CSV', 'JSON').default('PDF'),
  filters: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    fittingType: Joi.string().valid(...Object.keys(FITTING_TYPES)).optional(),
    status: Joi.string().optional(),
  }).optional(),
});

const listReportsQuerySchema = Joi.object({
  reportType: Joi.string().valid('INSPECTION_SUMMARY', 'DEFECT_ANALYSIS', 'INVENTORY_STATUS').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

// Param Schemas
const inspectionIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const defectIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const inventoryIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = {
  // QR Management
  batchQRSchema,
  listQRQuerySchema,
  exportQRQuerySchema,
  
  // Inspection Management
  listInspectionsQuerySchema,
  approveInspectionSchema,
  rejectInspectionSchema,
  inspectionIdParamSchema,
  
  // Defect Management
  listDefectsQuerySchema,
  assignDefectSchema,
  defectIdParamSchema,
  
  // Inventory Management
  createInventorySchema,
  updateInventorySchema,
  listInventoryQuerySchema,
  inventoryIdParamSchema,
  
  // Report Generation
  generateReportSchema,
  listReportsQuerySchema,
};
