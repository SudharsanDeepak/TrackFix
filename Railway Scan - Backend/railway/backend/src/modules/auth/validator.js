const Joi = require('joi');
const { ROLES } = require('../../shared/constants');

const registerSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .default(ROLES.VENDOR),
  vendorCode: Joi.string().trim().when('role', {
    is: ROLES.VENDOR,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).optional(),
  department: Joi.string().trim().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

const googleLoginSchema = Joi.object({
  credential: Joi.string().required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .optional(),
});

const setPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(128).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  googleLoginSchema,
  setPasswordSchema,
};
