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

router.get(
  '/google/redirect',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Mobile app OAuth redirect — passes state=mobile so callback knows to use deeplink
router.get(
  '/google/redirect/mobile',
  passport.authenticate('google', { scope: ['profile', 'email'], state: 'mobile' })
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
