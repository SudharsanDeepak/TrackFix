const Joi = require('joi');
const { INSPECTION_STATUS } = require('../../shared/constants');

const createInspectionSchema = Joi.object({
  fittingId: Joi.string().hex().length(24).required(),
  inspectionDate: Joi.date().max('now').optional(),
  status: Joi.string()
    .valid(...Object.values(INSPECTION_STATUS))
    .default(INSPECTION_STATUS.COMPLETED),
  findings: Joi.object({
    visualInspection: Joi.object({
      passed: Joi.boolean().required(),
      notes: Joi.string().optional(),
    }).optional(),
    dimensionalCheck: Joi.object({
      passed: Joi.boolean().required(),
      measurements: Joi.object().optional(),
      notes: Joi.string().optional(),
    }).optional(),
    functionalTest: Joi.object({
      passed: Joi.boolean().required(),
      notes: Joi.string().optional(),
    }).optional(),
    wearAnalysis: Joi.object({
      wearLevel: Joi.number().min(0).max(100).optional(),
      notes: Joi.string().optional(),
    }).optional(),
  }).optional(),
  defectsFound: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required(),
        description: Joi.string().required(),
        severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required(),
      })
    )
    .optional(),
  overallResult: Joi.string().valid('PASS', 'FAIL', 'CONDITIONAL').required(),
  recommendations: Joi.array().items(Joi.string()).optional(),
  nextInspectionDate: Joi.date().greater('now').optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

const updateInspectionSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(INSPECTION_STATUS))
    .optional(),
  findings: Joi.object().optional(),
  defectsFound: Joi.array().optional(),
  recommendations: Joi.array().items(Joi.string()).optional(),
  nextInspectionDate: Joi.date().optional(),
}).min(1);

module.exports = {
  createInspectionSchema,
  updateInspectionSchema,
};
