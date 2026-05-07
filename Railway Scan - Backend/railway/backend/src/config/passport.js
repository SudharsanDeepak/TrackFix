const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./index');
const User = require('../modules/auth/model');
const logger = require('../utils/logger');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        scope: ['profile', 'email'],
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const name = profile.displayName;
          const profilePicture = profile.photos[0]?.value;

          let user = await User.findOne({ email });

          if (user) {
            if (!user.googleId) {
              user.googleId = googleId;
              user.authProvider = 'both';
              user.profilePicture = profilePicture || user.profilePicture;
              await user.save();
              
              logger.info('Linked Google account to existing user:', { 
                userId: user._id, 
                email: user.email 
              });
            } else if (user.googleId !== googleId) {
              logger.warn('Google ID mismatch for user:', { 
                userId: user._id, 
                email: user.email 
              });
              return done(null, false, { 
                message: 'This email is already associated with a different Google account' 
              });
            }
          } else {
            // Determine role based on where the auth request originated
            const state = req.query.state || req.session?.oauthState || 'web';
            const defaultRole = state === 'mobile' ? 'INSPECTOR' : 'VENDOR';

            user = await User.create({
              name,
              email,
              googleId,
              authProvider: 'google',
              profilePicture,
              role: defaultRole,
              isActive: true,
            });

            logger.info('Created new user via Google OAuth:', { 
              userId: user._id, 
              email: user.email,
              role: defaultRole
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
}

module.exports = passport;
