const { AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_DURATION) {
      loginAttempts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

const bruteForceProtection = (req, _res, next) => {
  const identifier = req.body.email || req.ip;
  const now = Date.now();

  if (!loginAttempts.has(identifier)) {
    loginAttempts.set(identifier, { count: 0, lastAttempt: now, lockedUntil: null });
  }

  const attempts = loginAttempts.get(identifier);

  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
    logger.warn('Account locked due to brute force', { identifier, remainingTime });
    throw new AuthenticationError(
      `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`
    );
  }

  if (attempts.lockedUntil && now >= attempts.lockedUntil) {
    attempts.count = 0;
    attempts.lockedUntil = null;
  }

  next();
};

const recordFailedAttempt = (identifier) => {
  const now = Date.now();
  
  if (!loginAttempts.has(identifier)) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now, lockedUntil: null });
    return;
  }

  const attempts = loginAttempts.get(identifier);
  attempts.count++;
  attempts.lastAttempt = now;

  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockedUntil = now + LOCKOUT_DURATION;
    logger.warn('Account locked after max attempts', { identifier, attempts: attempts.count });
  }
};

const resetAttempts = (identifier) => {
  loginAttempts.delete(identifier);
};

module.exports = { bruteForceProtection, recordFailedAttempt, resetAttempts };
