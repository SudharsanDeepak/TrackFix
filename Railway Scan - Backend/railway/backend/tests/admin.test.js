const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const connectDB = require('../src/config/database');

describe('Admin Endpoints', () => {
  let adminToken;
  let admin;

  beforeAll(async () => {
    await connectDB();
    
    // Create test admin
    admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN',
      isActive: true,
    });

    // Generate token for admin
    adminToken = jwt.sign(
      { id: admin._id, role: admin.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'admin@test.com' });
    await mongoose.connection.close();
  });

  describe('GET /api/v1/admin/system-health', () => {
    it('should return system health metrics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system-health')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-User-Role', 'ADMIN');

      // Accept both 200 (healthy) and 503 (unhealthy) as valid responses
      // since Redis might not be available in test environment
      expect([200, 503]).toContain(response.status);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('redis');
      expect(response.body.data).toHaveProperty('apiResponseTime');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('errorRate');
      expect(response.body.data).toHaveProperty('timestamp');
    });

    it('should complete health check within 2 seconds', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/admin/system-health')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-User-Role', 'ADMIN');

      const duration = Date.now() - startTime;

      // Accept both 200 and 503 status codes
      expect([200, 503]).toContain(response.status);
      expect(duration).toBeLessThan(2000);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system-health');

      expect(response.status).toBe(401);
    });

    it('should require ADMIN role', async () => {
      // Create a non-admin user
      const inspector = await User.create({
        name: 'Test Inspector',
        email: 'inspector-health@test.com',
        password: 'password123',
        role: 'INSPECTOR',
        depotId: 'DEPOT001',
        isActive: true,
      });

      const inspectorToken = jwt.sign(
        { id: inspector._id, role: inspector.role },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiry }
      );

      const response = await request(app)
        .get('/api/v1/admin/system-health')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', 'INSPECTOR');

      expect(response.status).toBe(403);

      // Clean up
      await User.deleteOne({ email: 'inspector-health@test.com' });
    });
  });
});
