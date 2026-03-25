const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const Inspection = require('../src/modules/inspection/model');
const Defect = require('../src/modules/defect/model');
const TrackFitting = require('../src/modules/qr/model');
const { ROLES } = require('../src/shared/constants');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

describe('Inspector Endpoints', () => {
  let inspectorUser;
  let inspectorToken;
  let testFitting;
  let testInspection;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/railtrack-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await Inspection.deleteMany({});
    await Defect.deleteMany({});
    await TrackFitting.deleteMany({});

    // Create test inspector user
    inspectorUser = await User.create({
      name: 'Test Inspector',
      email: 'inspector@test.com',
      password: 'password123',
      role: ROLES.INSPECTOR,
      depotId: 'DEPOT001',
      isActive: true,
    });

    // Generate token
    inspectorToken = jwt.sign(
      { id: inspectorUser._id, role: inspectorUser.role },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Create test fitting
    testFitting = await TrackFitting.create({
      uniqueQRId: 'IR-NR-2024-TEST-000001',
      zoneCode: 'NR',
      itemType: 'RAIL',
      status: 'ACTIVE',
      location: {
        depot: 'DEPOT001',
        section: 'A',
        trackNumber: '1',
      },
    });

    // Create test inspection
    testInspection = await Inspection.create({
      zoneCode: 'NR',
      inspectionYear: 2024,
      fitting: testFitting._id,
      inspector: inspectorUser._id,
      inspectionDate: new Date(),
      status: 'PENDING',
      overallResult: 'PASS',
    });
  });

  describe('GET /api/v1/inspector/tasks', () => {
    it('should return assigned tasks for inspector', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/tasks')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pendingInspections');
      expect(response.body.data).toHaveProperty('assignedDefects');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.summary.totalPendingInspections).toBeGreaterThanOrEqual(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/tasks');

      expect(response.status).toBe(401);
    });

    it('should return 403 without correct role', async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
        isActive: true,
      });

      const adminToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/v1/inspector/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-User-Role', ROLES.ADMIN);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/v1/inspector/defects', () => {
    it('should create a defect report', async () => {
      const defectData = {
        inspectionId: testInspection._id.toString(),
        fittingType: 'RAIL',
        severity: 'HIGH',
        description: 'Crack detected on rail surface',
        images: ['https://example.com/image1.jpg'],
      };

      const response = await request(app)
        .post('/api/v1/inspector/defects')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send(defectData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('defectId');
      expect(response.body.data.status).toBe('REPORTED');
      expect(response.body.data.severity).toBe('HIGH');
      expect(response.body.data.description).toBe(defectData.description);
    });

    it('should return 404 for non-existent inspection', async () => {
      const defectData = {
        inspectionId: new mongoose.Types.ObjectId().toString(),
        fittingType: 'RAIL',
        severity: 'HIGH',
        description: 'Test defect',
      };

      const response = await request(app)
        .post('/api/v1/inspector/defects')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send(defectData);

      expect(response.status).toBe(404);
    });

    it('should return 403 when creating defect for another inspector\'s inspection', async () => {
      // Create another inspector
      const otherInspector = await User.create({
        name: 'Other Inspector',
        email: 'other@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT002',
        isActive: true,
      });

      // Create inspection for other inspector
      const otherInspection = await Inspection.create({
        zoneCode: 'NR',
        inspectionYear: 2024,
        fitting: testFitting._id,
        inspector: otherInspector._id,
        inspectionDate: new Date(),
        status: 'PENDING',
        overallResult: 'PASS',
      });

      const defectData = {
        inspectionId: otherInspection._id.toString(),
        fittingType: 'RAIL',
        severity: 'HIGH',
        description: 'Test defect',
      };

      const response = await request(app)
        .post('/api/v1/inspector/defects')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send(defectData);

      expect(response.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        inspectionId: testInspection._id.toString(),
        // Missing fittingType, severity, description
      };

      const response = await request(app)
        .post('/api/v1/inspector/defects')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/inspector/defects', () => {
    beforeEach(async () => {
      // Create test defects
      await Defect.create({
        inspectionId: testInspection._id,
        reportedBy: inspectorUser._id,
        depotId: 'DEPOT001',
        fittingType: 'RAIL',
        severity: 'HIGH',
        description: 'Test defect 1',
        status: 'REPORTED',
      });

      await Defect.create({
        inspectionId: testInspection._id,
        reportedBy: inspectorUser._id,
        depotId: 'DEPOT001',
        fittingType: 'SLEEPER',
        severity: 'MEDIUM',
        description: 'Test defect 2',
        status: 'ASSIGNED',
      });
    });

    it('should return defects reported by inspector', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/defects')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter defects by severity', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/defects?severity=HIGH')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].severity).toBe('HIGH');
    });

    it('should filter defects by status', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/defects?status=ASSIGNED')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('ASSIGNED');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/defects?page=1&limit=1')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it('should only return defects reported by the authenticated inspector', async () => {
      // Create another inspector and their defect
      const otherInspector = await User.create({
        name: 'Other Inspector',
        email: 'other2@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT002',
        isActive: true,
      });

      await Defect.create({
        inspectionId: testInspection._id,
        reportedBy: otherInspector._id,
        depotId: 'DEPOT002',
        fittingType: 'RAIL',
        severity: 'CRITICAL',
        description: 'Other inspector defect',
        status: 'REPORTED',
      });

      const response = await request(app)
        .get('/api/v1/inspector/defects')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2); // Only the 2 defects from beforeEach
      expect(response.body.data.every(d => d.reportedBy._id === inspectorUser._id.toString())).toBe(true);
    });
  });

  describe('GET /api/v1/inspector/dashboard/stats', () => {
    beforeEach(async () => {
      // Create test data for dashboard stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create completed inspections today
      await Inspection.create({
        zoneCode: 'NR',
        inspectionYear: 2024,
        fitting: testFitting._id,
        inspector: inspectorUser._id,
        inspectionDate: today,
        status: 'COMPLETED',
        overallResult: 'PASS',
        updatedAt: new Date(),
      });

      // Create pending inspection
      await Inspection.create({
        zoneCode: 'NR',
        inspectionYear: 2024,
        fitting: testFitting._id,
        inspector: inspectorUser._id,
        inspectionDate: today,
        status: 'PENDING',
        overallResult: 'PASS',
      });

      // Create defect reported today
      await Defect.create({
        inspectionId: testInspection._id,
        reportedBy: inspectorUser._id,
        depotId: 'DEPOT001',
        fittingType: 'RAIL',
        severity: 'HIGH',
        description: 'Test defect today',
        status: 'REPORTED',
        createdAt: new Date(),
      });
    });

    it('should return dashboard statistics for inspector', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/dashboard/stats')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inspectionsCompletedToday');
      expect(response.body.data).toHaveProperty('pendingTasks');
      expect(response.body.data).toHaveProperty('defectsReported');
      expect(response.body.data).toHaveProperty('qrCodesScanned');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(response.body.data.inspectionsCompletedToday).toBeGreaterThanOrEqual(1);
      expect(response.body.data.pendingTasks).toBeGreaterThanOrEqual(1);
      expect(response.body.data.defectsReported).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/dashboard/stats');

      expect(response.status).toBe(401);
    });

    it('should return 403 without correct role', async () => {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin2@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
        isActive: true,
      });

      const adminToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/v1/inspector/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-User-Role', ROLES.ADMIN);

      expect(response.status).toBe(403);
    });

    it('should cache dashboard stats', async () => {
      // First request
      const response1 = await request(app)
        .get('/api/v1/inspector/dashboard/stats')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response1.status).toBe(200);
      const firstLastUpdated = response1.body.data.lastUpdated;

      // Second request (should be cached)
      const response2 = await request(app)
        .get('/api/v1/inspector/dashboard/stats')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response2.status).toBe(200);
      expect(response2.body.data.lastUpdated).toBe(firstLastUpdated);
    });
  });

  describe('POST /api/v1/inspector/scan-qr', () => {
    let vendor;

    beforeEach(async () => {
      // Create vendor for fitting
      const Vendor = require('../src/modules/vendor/model');
      vendor = await Vendor.create({
        name: 'Test Vendor',
        vendorCode: 'VEN001',
        contactInfo: {
          email: 'vendor@test.com',
          phone: '1234567890',
        },
        isActive: true,
      });

      // Update test fitting with complete details
      await TrackFitting.findByIdAndUpdate(testFitting._id, {
        vendor: vendor._id,
        vendorCode: 'VEN001',
        lotNumber: 'LOT001',
        serialNumber: 'SN001',
        manufactureYear: 2024,
        manufacturingDate: new Date('2024-01-01'),
        warrantyPeriod: 24,
        warrantyExpiry: new Date('2026-01-01'),
        location: {
          depot: 'DEPOT001',
          zone: 'NR',
          section: 'A',
        },
        installationDate: new Date('2024-02-01'),
        lastInspectionDate: new Date(),
        inspectionCount: 1,
        defectCount: 0,
        riskScore: 25,
        isRecalled: false,
      });
    });

    it('should scan and validate QR code successfully', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: testFitting.uniqueQRId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('valid', true);
      expect(response.body.data).toHaveProperty('qrId', testFitting.uniqueQRId);
      expect(response.body.data).toHaveProperty('fittingDetails');
      expect(response.body.data.fittingDetails).toHaveProperty('itemType');
      expect(response.body.data.fittingDetails).toHaveProperty('vendor');
      expect(response.body.data.fittingDetails).toHaveProperty('warranty');
      expect(response.body.data.fittingDetails).toHaveProperty('inspectionHistory');
      expect(response.body.data.fittingDetails).toHaveProperty('defectHistory');
      expect(response.body.data).toHaveProperty('warnings');
    });

    it('should return 404 for non-existent QR code', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: 'IR-NR-2024-INVALID-000001' });

      expect(response.status).toBe(404);
    });

    it('should return 403 when scanning QR from different depot', async () => {
      // Create fitting in different depot
      const otherFitting = await TrackFitting.create({
        uniqueQRId: 'IR-NR-2024-OTHER-000001',
        zoneCode: 'NR',
        itemType: 'RAIL',
        status: 'ACTIVE',
        location: {
          depot: 'DEPOT002', // Different depot
          section: 'B',
        },
        vendor: vendor._id,
        vendorCode: 'VEN001',
        lotNumber: 'LOT002',
        serialNumber: 'SN002',
        manufactureYear: 2024,
        manufacturingDate: new Date('2024-01-01'),
        warrantyPeriod: 24,
        warrantyExpiry: new Date('2026-01-01'),
      });

      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: otherFitting.uniqueQRId });

      expect(response.status).toBe(403);
    });

    it('should include warnings for recalled fittings', async () => {
      // Update fitting to be recalled
      await TrackFitting.findByIdAndUpdate(testFitting._id, {
        isRecalled: true,
        recallReason: 'Manufacturing defect detected',
        recallDate: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: testFitting.uniqueQRId });

      expect(response.status).toBe(200);
      expect(response.body.data.warnings).toBeInstanceOf(Array);
      expect(response.body.data.warnings.length).toBeGreaterThan(0);
      expect(response.body.data.warnings.some(w => w.type === 'RECALL')).toBe(true);
    });

    it('should include warnings for expired warranty', async () => {
      // Update fitting with expired warranty
      await TrackFitting.findByIdAndUpdate(testFitting._id, {
        warrantyExpiry: new Date('2020-01-01'), // Expired
      });

      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: testFitting.uniqueQRId });

      expect(response.status).toBe(200);
      expect(response.body.data.warnings.some(w => w.type === 'WARRANTY_EXPIRED')).toBe(true);
    });

    it('should include warnings for high risk score', async () => {
      // Update fitting with high risk score
      await TrackFitting.findByIdAndUpdate(testFitting._id, {
        riskScore: 85,
      });

      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: testFitting.uniqueQRId });

      expect(response.status).toBe(200);
      expect(response.body.data.warnings.some(w => w.type === 'HIGH_RISK')).toBe(true);
    });

    it('should validate required qrId field', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
