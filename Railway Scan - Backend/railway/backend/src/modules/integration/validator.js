const Joi = require('joi');

const exportSchema = Joi.object({
  fittingIds: Joi.array().items(Joi.string().hex().length(24)).min(1).max(1000).required(),
});

module.exports = {
  exportSchema,
};
