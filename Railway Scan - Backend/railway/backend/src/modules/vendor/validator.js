const Joi = require('joi');

const createVendorSchema = Joi.object({
  vendorCode: Joi.string().trim().uppercase().required(),
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).required(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    pincode: Joi.string().trim().pattern(/^[0-9]{6}$/).optional(),
    country: Joi.string().trim().default('India'),
  }).optional(),
  gstNumber: Joi.string().trim().optional(),
  panNumber: Joi.string().trim().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
  contractStartDate: Joi.date().optional(),
  contractEndDate: Joi.date().greater(Joi.ref('contractStartDate')).optional(),
});

const updateVendorSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).optional(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    pincode: Joi.string().trim().pattern(/^[0-9]{6}$/).optional(),
    country: Joi.string().trim().optional(),
  }).optional(),
  gstNumber: Joi.string().trim().optional(),
  panNumber: Joi.string().trim().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
  contractStartDate: Joi.date().optional(),
  contractEndDate: Joi.date().optional(),
}).min(1);

const blacklistSchema = Joi.object({
  reason: Joi.string().trim().min(10).max(500).required(),
});

module.exports = {
  createVendorSchema,
  updateVendorSchema,
  blacklistSchema,
};
