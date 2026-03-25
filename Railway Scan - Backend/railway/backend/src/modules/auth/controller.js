const authService = require('./service');
const googleAuthService = require('./googleAuth.service');
const ResponseFormatter = require('../../utils/responseFormatter');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    ResponseFormatter.created(res, user, 'User registered successfully');
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    
    const result = await authService.login(email, password, ipAddress, userAgent);
    
    ResponseFormatter.success(res, result, 'Login successful');
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    ResponseFormatter.success(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken;
    await authService.logout(refreshToken, req.user.id);
    ResponseFormatter.success(res, null, 'Logout successful');
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    ResponseFormatter.success(res, null, 'Password changed successfully');
  });

  getProfile = asyncHandler(async (req, res) => {
    ResponseFormatter.success(res, req.user, 'Profile retrieved successfully');
  });

  googleLogin = asyncHandler(async (req, res) => {
    const { credential, role } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await googleAuthService.googleLogin(credential, role, ipAddress, userAgent);

    ResponseFormatter.success(res, result, 'Google login successful');
  });

  googleCallback = asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.redirect(`${config.frontend.url}/login?error=authentication_failed`);
    }

    const AuthService = require('./service');
    const accessToken = AuthService.generateAccessToken(req.user._id);
    const refreshToken = AuthService.generateRefreshToken(req.user._id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const authRepository = require('./repository');
    await authRepository.createRefreshToken({
      token: refreshToken,
      user: req.user._id,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Detect mobile app request via state param or user-agent
    const isMobile = req.query.state === 'mobile' ||
      (req.get('user-agent') || '').toLowerCase().includes('capacitor')

    const callbackBase = isMobile
      ? `${process.env.MOBILE_APP_SCHEME || 'railtrack'}://auth/callback`
      : `${config.frontend.url}/auth/callback`

    res.redirect(
      `${callbackBase}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  });

  setPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    await googleAuthService.setPasswordForGoogleUser(req.user.id, newPassword);
    ResponseFormatter.success(res, null, 'Password set successfully');
  });
}

module.exports = new AuthController();
