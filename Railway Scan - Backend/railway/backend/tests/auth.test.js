const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'VENDOR',
          vendorCode: 'VEN001',
          phone: '9876543210',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should not register duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'VENDOR',
          vendorCode: 'VEN002',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
