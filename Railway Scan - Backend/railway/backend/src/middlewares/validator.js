const { ValidationError } = require('../utils/errors');

const validate = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      throw new ValidationError('Validation failed', details);
    }
    
    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      throw new ValidationError('Query validation failed', details);
    }
    
    req.query = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      throw new ValidationError('Params validation failed', details);
    }
    
    req.params = value;
    next();
  };
};

module.exports = { validate, validateQuery, validateParams };
