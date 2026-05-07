const Joi = require('joi');
const { INSPECTION_STATUS } = require('../../shared/constants');

/**
 * Validation schemas for Inspector endpoints
 */

const createInspectionSchema = Joi.object({
  qrId: Joi.string().optional(), // Make optional for backward compatibility
  assetId: Joi.string().trim().optional(), // Support simple asset IDs
  assetType: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  scheduledDate: Joi.date().optional(),
  notes: Joi.string().trim().max(1000).optional(),
  status: Joi.string().optional(),
  coordinates: Joi.object({
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    accuracy: Joi.number().optional(),
  }).optional(),
  images: Joi.array().items(Joi.string()).optional(), // Allow base64 strings
}).or('qrId', 'assetId'); // Require at least one

const submitInspectionSchema = Joi.object({
  status: Joi.string().valid(...Object.values(INSPECTION_STATUS)).required(),
  assetId: Joi.string().trim().optional(),
  assetType: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  notes: Joi.string().trim().max(1000).optional(),
  findings: Joi.alternatives().try(
    Joi.string().trim().max(2000),
    Joi.object()
  ).optional(),
  images: Joi.array().items(Joi.string()).max(10).optional(),
  aiPrediction: Joi.object({
    riskLevel: Joi.string().valid('LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL').optional(),
    confidence: Joi.number().min(0).max(1).optional(),
  }).optional(),
  completedAt: Joi.date().optional(),
});

const createDefectSchema = Joi.object({
  inspectionId: Joi.string().hex().length(24).required(),
  fittingType: Joi.string().trim().required(),
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  images: Joi.array().items(Joi.string().uri()).max(10).optional(),
});

const scanQRSchema = Joi.object({
  qrId: Joi.string().pattern(/^IR-[A-Z]+-\d{4}-[A-Z0-9]+-\d{6}$/).required(),
});

const listInspectionsQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(INSPECTION_STATUS)).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const listDefectsQuerySchema = Joi.object({
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  status: Joi.string().valid('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const inspectionIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = {
  createInspectionSchema,
  submitInspectionSchema,
  createDefectSchema,
  scanQRSchema,
  listInspectionsQuerySchema,
  listDefectsQuerySchema,
  inspectionIdParamSchema,
};
