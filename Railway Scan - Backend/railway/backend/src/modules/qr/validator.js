const Joi = require('joi');
const { FITTING_STATUS } = require('../../shared/constants');

const generateBatchSchema = Joi.object({
  zoneCode: Joi.string().trim().uppercase().valid('NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'Metro').required(),
  itemType: Joi.string().trim().uppercase().required(),
  lotNumber: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).max(10000).required(),
  vendorId: Joi.string().hex().length(24).required(),
  manufacturingDate: Joi.date().max('now').required(),
  warrantyPeriod: Joi.number().integer().min(1).max(240).required(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

const updateFittingSchema = Joi.object({
  status: Joi.string().valid(...Object.values(FITTING_STATUS)).optional(),
  location: Joi.object({
    depot: Joi.string().trim().optional(),
    zone: Joi.string().trim().optional(),
    division: Joi.string().trim().optional(),
    section: Joi.string().trim().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
    }).optional(),
  }).optional(),
  installationDate: Joi.date().optional(),
  metadata: Joi.object().optional(),
}).min(1);

const recallLotSchema = Joi.object({
  zoneCode: Joi.string().trim().uppercase().valid('NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'Metro').required(),
  lotNumber: Joi.string().trim().required(),
  reason: Joi.string().trim().min(10).max(500).required(),
});

const listFittingsQuerySchema = Joi.object({
  zoneCode: Joi.string().trim().uppercase().valid('NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'Metro').optional(),
  vendorCode: Joi.string().trim().optional(),
  status: Joi.string().valid(...Object.values(FITTING_STATUS)).optional(),
  lotNumber: Joi.string().trim().optional(),
  itemType: Joi.string().trim().optional(),
  depot: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const qrIdParamSchema = Joi.object({
  qrId: Joi.string().pattern(/^IR-[A-Z]+-\d{4}-[A-Z0-9]+-\d{6}$/).required(),
});

const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

module.exports = {
  generateBatchSchema,
  updateFittingSchema,
  recallLotSchema,
  listFittingsQuerySchema,
  qrIdParamSchema,
  idParamSchema,
};
