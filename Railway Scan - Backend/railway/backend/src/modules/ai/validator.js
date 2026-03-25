const Joi = require('joi');

const predictSchema = Joi.object({
  fittingId: Joi.string().hex().length(24).required(),
});

module.exports = {
  predictSchema,
};
