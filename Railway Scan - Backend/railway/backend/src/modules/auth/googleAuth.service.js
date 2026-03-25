const { OAuth2Client } = require('google-auth-library');
const config = require('../../config');
const authRepository = require('./repository');
const { AuthenticationError, ValidationError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const AuditService = require('../audit/service');

class GoogleAuthService {
  constructor() {
    if (config.google.clientId) {
      this.client = new OAuth2Client(config.google.clientId);
    }
  }

  async verifyGoogleToken(token) {
    try {
      // Try to verify as a Google ID token first
      if (this.client) {
        try {
          const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: config.google.clientId,
          });
          const payload = ticket.getPayload();
          return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            profilePicture: payload.picture,
            emailVerified: payload.email_verified,
          };
        } catch (idTokenError) {
          // Not an ID token, try other methods
        }
      }

      // Try as Google access token - fetch user info from Google
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (response.ok) {
          const userInfo = await response.json();
          if (userInfo.sub && userInfo.email) {
            return {
              googleId: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              profilePicture: userInfo.picture,
              emailVerified: userInfo.email_verified,
            };
          }
        }
      } catch (accessTokenError) {
        // Not a valid access token
      }

      // Try as base64 encoded user info (fallback)
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        if (decoded.sub && decoded.email) {
          return {
            googleId: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            profilePicture: decoded.picture,
            emailVerified: decoded.email_verified,
          };
        }
      } catch (decodeError) {
        // Not base64 encoded
      }

      throw new Error('Could not verify token with any method');
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new AuthenticationError('Invalid Google token');
    }
  }

  async googleLogin(googleToken, role, ipAddress, userAgent) {
    const googleData = await this.verifyGoogleToken(googleToken);

    if (!googleData.emailVerified) {
      throw new ValidationError('Email not verified with Google');
    }

    let user = await authRepository.findUserByEmail(googleData.email);

    if (user) {
      if (!user.googleId) {
        user.googleId = googleData.googleId;
        user.authProvider = user.password ? 'both' : 'google';
        user.profilePicture = googleData.profilePicture || user.profilePicture;
        await user.save();

        logger.info('Linked Google account to existing user:', {
          userId: user._id,
          email: user.email,
        });
      } else if (user.googleId !== googleData.googleId) {
        logger.warn('Google ID mismatch:', {
          userId: user._id,
          email: user.email,
          existingGoogleId: user.googleId,
          newGoogleId: googleData.googleId,
        });
        throw new AuthenticationError(
          'This email is already associated with a different Google account'
        );
      }
    } else {
      // Validate role for new users
      const validRoles = ['INSPECTOR', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'ADMIN'];
      if (!role || !validRoles.includes(role)) {
        throw new ValidationError('Valid role is required for new users');
      }

      user = await authRepository.createUser({
        name: googleData.name,
        email: googleData.email,
        googleId: googleData.googleId,
        authProvider: 'google',
        profilePicture: googleData.profilePicture,
        role: role,
        isActive: true,
      });

      logger.info('Created new user via Google OAuth:', {
        userId: user._id,
        email: user.email,
        role: role,
      });
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive');
    }

    await authRepository.updateLastLogin(user._id, ipAddress);

    const AuthService = require('./service');
    const accessToken = AuthService.generateAccessToken(user._id);
    const refreshToken = AuthService.generateRefreshToken(user._id);

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
      action: 'USER_LOGIN_GOOGLE',
      userId: user._id,
      ipAddress,
      details: { email: user.email },
    });

    logger.info('User logged in via Google:', {
      userId: user._id,
      email: user.email,
      ipAddress,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  async setPasswordForGoogleUser(userId, newPassword) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.password) {
      throw new ValidationError('Password already set. Use change password instead.');
    }

    user.password = newPassword;
    user.authProvider = user.googleId ? 'both' : 'local';
    await user.save();

    await AuditService.log({
      action: 'PASSWORD_SET',
      userId,
    });

    logger.info('Password set for Google user:', { userId });
  }
}

module.exports = new GoogleAuthService();
