const { validateZoneCode } = require('../utils/shardingHelper');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

const requireZoneCode = (req, _res, next) => {
  const zoneCode = req.body.zoneCode || req.query.zoneCode || req.params.zoneCode;
  
  if (!zoneCode) {
    logger.warn('Request missing zone code', {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    });
    throw new ValidationError('Zone code is required for this operation');
  }
  
  try {
    req.validatedZoneCode = validateZoneCode(zoneCode);
    next();
  } catch (error) {
    throw new ValidationError(error.message);
  }
};

const optionalZoneCode = (req, _res, next) => {
  const zoneCode = req.body.zoneCode || req.query.zoneCode || req.params.zoneCode;
  
  if (zoneCode) {
    try {
      req.validatedZoneCode = validateZoneCode(zoneCode);
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }
  
  next();
};

module.exports = { requireZoneCode, optionalZoneCode };
