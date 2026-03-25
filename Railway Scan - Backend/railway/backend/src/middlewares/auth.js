const jwt = require('jsonwebtoken');
const config = require('../config');
const { AuthenticationError } = require('../utils/errors');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../modules/auth/model');
const logger = require('../utils/logger');

const authenticate = asyncHandler(async (req, _res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    throw new AuthenticationError('No token provided');
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (!user.isActive) {
      throw new AuthenticationError('User account is inactive');
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Authentication failed:', { error: error.message, ip: req.ip });
    throw new AuthenticationError('Invalid or expired token');
  }
});

module.exports = authenticate;
