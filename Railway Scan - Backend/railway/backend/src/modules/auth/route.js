const express = require('express');
const passport = require('../../config/passport');
const authController = require('./controller');
const { validate } = require('../../middlewares/validator');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  googleLoginSchema,
  setPasswordSchema,
} = require('./validator');
const authenticate = require('../../middlewares/auth');
const { loginLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

router.post('/google', loginLimiter, validate(googleLoginSchema), authController.googleLogin);

// Single redirect route — accepts optional ?state=mobile query param for mobile deeplink
router.get(
  '/google/redirect',
  (req, res, next) => {
    // Store state in session so callback can read it
    if (req.query.state) {
      req.session = req.session || {}
      req.session.oauthState = req.query.state
    }
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: req.query.state || 'web',
    })(req, res, next)
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: true 
  }),
  authController.googleCallback
);

router.post('/set-password', authenticate, validate(setPasswordSchema), authController.setPassword);

module.exports = router;
