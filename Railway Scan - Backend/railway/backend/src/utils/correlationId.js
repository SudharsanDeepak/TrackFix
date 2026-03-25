const { v4: uuidv4 } = require('uuid');
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

const correlationIdMiddleware = (req, _res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  
  asyncLocalStorage.run({ correlationId }, () => {
    next();
  });
};

const getCorrelationId = () => {
  const store = asyncLocalStorage.getStore();
  return store?.correlationId || 'no-correlation-id';
};

module.exports = { correlationIdMiddleware, getCorrelationId };
