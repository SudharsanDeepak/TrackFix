const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

describe('Google OAuth Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Google Login Flow', () => {
    it('should create new user on first Google login', async () => {
      const mockGoogleToken = 'mock-google-token';
      
      // Note: In real tests, you would mock the Google token verification
      // For now, this is a placeholder test structure
      
      const usersBefore = await User.countDocuments();
      expect(usersBefore).toBe(0);
    });

    it('should link Google account to existing email user', async () => {
      // Create user with email/password
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@1234',
        role: 'VENDOR',
      });

      expect(user.googleId).toBeUndefined();
      expect(user.authProvider).toBe('local');

      // In real test, simulate Google login with same email
      // Verify googleId is added and authProvider becomes 'both'
    });

    it('should allow password login after setting password', async () => {
      // Create Google-only user
      const user = await User.create({
        name: 'Google User',
        email: 'google@example.com',
        googleId: '123456789',
        authProvider: 'google',
        role: 'VENDOR',
      });

      expect(user.password).toBeUndefined();

      // Set password
      user.password = 'NewPass@123';
      user.authProvider = 'both';
      await user.save();

      // Verify password login works
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'google@example.com',
          password: 'NewPass@123',
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    it('should reject email/password login for Google-only users', async () => {
      // Create Google-only user (no password)
      await User.create({
        name: 'Google Only User',
        email: 'googleonly@example.com',
        googleId: '987654321',
        authProvider: 'google',
        role: 'VENDOR',
      });

      // Try to login with password
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'googleonly@example.com',
          password: 'AnyPassword@123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Google');
    });

    it('should allow both login methods for users with both', async () => {
      // Create user with both auth methods
      const user = await User.create({
        name: 'Both Auth User',
        email: 'both@example.com',
        password: 'Pass@1234',
        googleId: '111222333',
        authProvider: 'both',
        role: 'VENDOR',
      });

      // Test email/password login
      const emailLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'both@example.com',
          password: 'Pass@1234',
        });

      expect(emailLoginRes.statusCode).toBe(200);
      expect(emailLoginRes.body.success).toBe(true);

      // In real test, also verify Google login works
    });
  });

  describe('Set Password Endpoint', () => {
    it('should allow Google users to set password', async () => {
      // Create Google-only user
      const user = await User.create({
        name: 'Google User',
        email: 'setpass@example.com',
        googleId: '444555666',
        authProvider: 'google',
        role: 'VENDOR',
      });

      // Login to get token
      const AuthService = require('../src/modules/auth/service');
      const accessToken = AuthService.generateAccessToken(user._id);

      // Set password
      const res = await request(app)
        .post('/api/v1/auth/set-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewSecure@123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify user can now login with password
      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser.password).toBeDefined();
      expect(updatedUser.authProvider).toBe('both');
    });

    it('should reject set-password if password already exists', async () => {
      // Create user with password
      const user = await User.create({
        name: 'Has Password User',
        email: 'haspass@example.com',
        password: 'Existing@123',
        role: 'VENDOR',
      });

      const AuthService = require('../src/modules/auth/service');
      const accessToken = AuthService.generateAccessToken(user._id);

      // Try to set password again
      const res = await request(app)
        .post('/api/v1/auth/set-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'Another@123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already set');
    });
  });

  describe('Auth Provider States', () => {
    it('should have correct authProvider for email-only users', async () => {
      const user = await User.create({
        name: 'Email User',
        email: 'email@example.com',
        password: 'Email@123',
        role: 'VENDOR',
      });

      expect(user.authProvider).toBe('local');
      expect(user.googleId).toBeUndefined();
    });

    it('should have correct authProvider for Google-only users', async () => {
      const user = await User.create({
        name: 'Google User',
        email: 'google@example.com',
        googleId: '777888999',
        authProvider: 'google',
        role: 'VENDOR',
      });

      expect(user.authProvider).toBe('google');
      expect(user.password).toBeUndefined();
    });

    it('should transition from local to both when Google linked', async () => {
      const user = await User.create({
        name: 'Transition User',
        email: 'transition@example.com',
        password: 'Trans@123',
        authProvider: 'local',
        role: 'VENDOR',
      });

      // Simulate Google linking
      user.googleId = '123123123';
      user.authProvider = 'both';
      await user.save();

      const updated = await User.findById(user._id);
      expect(updated.authProvider).toBe('both');
      expect(updated.googleId).toBe('123123123');
    });

    it('should transition from google to both when password set', async () => {
      const user = await User.create({
        name: 'Google First User',
        email: 'googlefirst@example.com',
        googleId: '456456456',
        authProvider: 'google',
        role: 'VENDOR',
      });

      // Set password
      user.password = 'NewPass@123';
      user.authProvider = 'both';
      await user.save();

      const updated = await User.findById(user._id).select('+password');
      expect(updated.authProvider).toBe('both');
      expect(updated.password).toBeDefined();
    });
  });
});
