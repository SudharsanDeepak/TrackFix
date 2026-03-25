const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const Vendor = require('../src/modules/vendor/model');
const TrackFitting = require('../src/modules/qr/model');
const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

describe('QR Generation Tests', () => {
  let adminToken;
  let vendorId;

  beforeAll(async () => {
    await connectDB();

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@railtrack.gov.in',
      password: 'Admin@1234',
      role: 'ADMIN',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@railtrack.gov.in',
        password: 'Admin@1234',
      });

    adminToken = loginRes.body.data.accessToken;

    const vendor = await Vendor.create({
      vendorCode: 'TEST001',
      name: 'Test Vendor',
      email: 'vendor@test.com',
      phone: '9876543210',
    });

    vendorId = vendor._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await TrackFitting.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/qr/generate-batch', () => {
    it('should generate QR batch with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/qr/generate-batch')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemType: 'ERC',
          lotNumber: 'LOT2026001',
          quantity: 10,
          vendorId: vendorId.toString(),
          manufacturingDate: new Date('2026-01-01'),
          warrantyPeriod: 24,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.generated).toBe(10);
      expect(res.body.data.qrCodes).toHaveLength(10);
    });

    it('should enforce uniqueness of QR codes', async () => {
      const qrCode = await TrackFitting.findOne({ lotNumber: 'LOT2026001' });
      expect(qrCode).toBeTruthy();
      expect(qrCode.uniqueQRId).toMatch(/^IR-ERC-2026-LOT2026001-\d{6}$/);
    });
  });
});
