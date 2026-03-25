const jwt = require('jsonwebtoken');
const config = require('../../config');
const authRepository = require('./repository');
const { AuthenticationError, ValidationError, DuplicateError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const AuditService = require('../audit/service');

class AuthService {
  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });
  }

  async register(userData) {
    const existingUser = await authRepository.findUserByEmail(userData.email);
    
    if (existingUser) {
      throw new DuplicateError('Email already registered');
    }
    
    const user = await authRepository.createUser(userData);
    
    await AuditService.log({
      action: 'USER_REGISTERED',
      userId: user._id,
      details: { email: user.email, role: user.role },
    });
    
    logger.info('User registered:', { userId: user._id, email: user.email });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return userResponse;
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await authRepository.findUserByEmail(email);
    
    if (!user) {
      logger.warn('Login failed - user not found:', { email, ipAddress });
      throw new AuthenticationError('Invalid email or password');
    }
    
    if (!user.password) {
      logger.warn('Login failed - no password set (Google-only account):', { email, ipAddress });
      throw new AuthenticationError('This account was created with Google. Please use "Continue with Google" or set a password first.');
    }
    
    if (!(await user.comparePassword(password))) {
      logger.warn('Login failed - incorrect password:', { email, ipAddress });
      throw new AuthenticationError('Invalid email or password');
    }
    
    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive');
    }
    
    await authRepository.updateLastLogin(user._id, ipAddress);
    
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await authRepository.createRefreshToken({
      token: refreshToken,
      user: user._id,
      expiresAt,
      ipAddress,
      userAgent,
    });
    
    await AuditService.log({
      action: 'USER_LOGIN',
      userId: user._id,
      ipAddress,
      details: { email: user.email },
    });
    
    logger.info('User logged in:', { userId: user._id, email: user.email, ipAddress });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
    
    const tokenDoc = await authRepository.findRefreshToken(refreshToken);
    
    if (!tokenDoc) {
      throw new AuthenticationError('Refresh token not found or revoked');
    }
    
    if (new Date() > tokenDoc.expiresAt) {
      throw new AuthenticationError('Refresh token expired');
    }
    
    const accessToken = this.generateAccessToken(decoded.id);
    
    return { accessToken };
  }

  async logout(refreshToken, userId) {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken);
    }
    
    await AuditService.log({
      action: 'USER_LOGOUT',
      userId,
    });
    
    logger.info('User logged out:', { userId });
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserByEmail((await authRepository.findUserById(userId)).email);
    
    if (!(await user.comparePassword(currentPassword))) {
      throw new ValidationError('Current password is incorrect');
    }
    
    user.password = newPassword;
    await user.save();
    
    await authRepository.revokeAllUserTokens(userId);
    
    await AuditService.log({
      action: 'PASSWORD_CHANGED',
      userId,
    });
    
    logger.info('Password changed:', { userId });
  }
}

module.exports = new AuthService();
