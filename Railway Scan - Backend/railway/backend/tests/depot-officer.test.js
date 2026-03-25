const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const TrackFitting = require('../src/modules/qr/model');
const Inspection = require('../src/modules/inspection/model');
const Defect = require('../src/modules/defect/model');
const Inventory = require('../src/models/Inventory.model');
const Alert = require('../src/models/Alert.model');
const Report = require('../src/models/Report.model');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

describe('Depot Officer Endpoints', () => {
  let depotOfficerToken;
  let depotOfficer;
  let vendor;
  let inspector;
  const depotId = 'NR-DEPOT-01';

  beforeAll(async () => {
    // Create test vendor
    vendor = await User.create({
      name: 'Test Vendor',
      email: 'vendor@test.com',
      password: 'password123',
      role: 'VENDOR',
      vendorCode: 'VEN001',
      isActive: true,
    });

    // Create test depot officer
    depotOfficer = await User.create({
      name: 'Test Depot Officer',
      email: 'depot@test.com',
      password: 'password123',
      role: 'DEPOT_OFFICER',
      depotId,
      isActive: true,
    });

    // Create test inspector
    inspector = await User.create({
      name: 'Test Inspector',
      email: 'inspector@test.com',
      password: 'password123',
      role: 'INSPECTOR',
      depotId,
      isActive: true,
    });

    // Generate token for depot officer
    depotOfficerToken = jwt.sign(
      { id: depotOfficer._id, role: depotOfficer.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $in: ['vendor@test.com', 'depot@test.com', 'inspector@test.com'] } });
    await TrackFitting.deleteMany({ vendorCode: 'VEN001' });
    await Inspection.deleteMany({});
    await Defect.deleteMany({ depotId });
    await Inventory.deleteMany({ depotId });
    await Alert.deleteMany({ depotId });
    await Report.deleteMany({ generatedBy: depotOfficer._id });
  });

  describe('POST /api/v1/depot-officer/qr/batch', () => {
    it('should generate QR codes in batch', async () => {
      const response = await request(app)
        .post('/api/v1/depot-officer/qr/batch')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          fittingType: 'ERC',
          quantity: 10,
          lotNumber: 'LOT001',
          vendorCode: 'VEN001',
          manufacturingDate: new Date('2024-01-01'),
          specifications: { material: 'Steel' },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(10);
      expect(response.body.data.qrCodes).toHaveLength(10);
    });

    it('should reject batch size exceeding 1000', async () => {
      const response = await request(app)
        .post('/api/v1/depot-officer/qr/batch')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          fittingType: 'ERC',
          quantity: 1001,
          lotNumber: 'LOT002',
          vendorCode: 'VEN001',
          manufacturingDate: new Date('2024-01-01'),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/depot-officer/qr', () => {
    it('should list QR codes for the depot', async () => {
      const response = await request(app)
        .get('/api/v1/depot-officer/qr')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('qrCodes');
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('POST /api/v1/depot-officer/inventory', () => {
    it('should create inventory item', async () => {
      const response = await request(app)
        .post('/api/v1/depot-officer/inventory')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          fittingType: 'ERC',
          quantity: 100,
          minThreshold: 20,
          maxThreshold: 500,
          location: 'Warehouse A',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.depotId).toBe(depotId);
      expect(response.body.data.fittingType).toBe('ERC');
    });

    it('should reject duplicate inventory item', async () => {
      const response = await request(app)
        .post('/api/v1/depot-officer/inventory')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          fittingType: 'ERC',
          quantity: 50,
          minThreshold: 10,
          maxThreshold: 300,
          location: 'Warehouse B',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/depot-officer/inventory/:id', () => {
    let inventoryItem;

    beforeAll(async () => {
      inventoryItem = await Inventory.create({
        depotId,
        fittingType: 'PANDROL',
        quantity: 100,
        minThreshold: 20,
        maxThreshold: 500,
        location: 'Warehouse C',
      });
    });

    it('should update inventory item', async () => {
      const response = await request(app)
        .put(`/api/v1/depot-officer/inventory/${inventoryItem._id}`)
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          quantity: 150,
          location: 'Warehouse D',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(150);
      expect(response.body.data.location).toBe('Warehouse D');
    });

    it('should create low inventory alert when quantity drops below threshold', async () => {
      const response = await request(app)
        .put(`/api/v1/depot-officer/inventory/${inventoryItem._id}`)
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          quantity: 15, // Below minThreshold of 20
        });

      expect(response.status).toBe(200);

      // Check if alert was created
      const alert = await Alert.findOne({
        depotId,
        alertType: 'INVENTORY_LOW',
        'metadata.itemId': inventoryItem.itemId,
      });

      expect(alert).toBeDefined();
      expect(alert.severity).toBe('WARNING');
    });
  });

  describe('GET /api/v1/depot-officer/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/depot-officer/dashboard/stats')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalInspections');
      expect(response.body.data).toHaveProperty('pendingApprovals');
      expect(response.body.data).toHaveProperty('activeDefects');
      expect(response.body.data).toHaveProperty('inventoryAlerts');
      expect(response.body.data).toHaveProperty('inspectorCount');
    });
  });

  describe('POST /api/v1/depot-officer/reports/generate', () => {
    it('should generate inventory status report', async () => {
      const response = await request(app)
        .post('/api/v1/depot-officer/reports/generate')
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          reportType: 'INVENTORY_STATUS',
          format: 'PDF',
          filters: {},
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reportType).toBe('INVENTORY_STATUS');
      expect(response.body.data.status).toBe('COMPLETED');
    });
  });

  describe('Inspection Approval Workflow', () => {
    let fitting;
    let inspection;

    beforeAll(async () => {
      // Create a test fitting
      fitting = await TrackFitting.create({
        uniqueQRId: 'NR-ERC-2024-TEST001',
        zoneCode: 'NR',
        manufactureYear: 2024,
        itemType: 'ERC',
        lotNumber: 'LOT001',
        serialNumber: 'TEST001',
        vendor: vendor._id,
        vendorCode: 'VEN001',
        manufacturingDate: new Date('2024-01-01'),
        warrantyPeriod: 5,
        warrantyExpiry: new Date('2029-01-01'),
        status: 'MANUFACTURED',
        location: {
          depot: depotId,
          zone: 'NR',
        },
      });

      // Create a test inspection
      inspection = await Inspection.create({
        zoneCode: 'NR',
        inspectionYear: 2024,
        fitting: fitting._id,
        inspector: inspector._id,
        inspectionDate: new Date(),
        status: 'PENDING',
        overallResult: 'PASS',
        findings: {
          visualInspection: { passed: true, notes: 'Good condition' },
        },
      });
    });

    it('should approve inspection', async () => {
      const response = await request(app)
        .post(`/api/v1/depot-officer/inspections/${inspection._id}/approve`)
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          comments: 'Approved after review',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.approvedBy).toBeDefined();
      expect(response.body.data.approvedAt).toBeDefined();
    });

    it('should reject inspection with reason', async () => {
      // Create another inspection
      const inspection2 = await Inspection.create({
        zoneCode: 'NR',
        inspectionYear: 2024,
        fitting: fitting._id,
        inspector: inspector._id,
        inspectionDate: new Date(),
        status: 'PENDING',
        overallResult: 'FAIL',
        findings: {
          visualInspection: { passed: false, notes: 'Defects found' },
        },
      });

      const response = await request(app)
        .post(`/api/v1/depot-officer/inspections/${inspection2._id}/reject`)
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          reason: 'Incomplete inspection data',
          comments: 'Please re-inspect with complete measurements',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('FAILED');
      expect(response.body.data.rejectedBy).toBeDefined();
      expect(response.body.data.rejectionReason).toBe('Incomplete inspection data');
    });
  });

  describe('Defect Assignment', () => {
    let defect;

    beforeAll(async () => {
      // Create a test defect
      defect = await Defect.create({
        inspectionId: new mongoose.Types.ObjectId(),
        reportedBy: inspector._id,
        depotId,
        fittingType: 'ERC',
        severity: 'HIGH',
        description: 'Crack detected on rail clip',
        status: 'REPORTED',
      });
    });

    it('should assign defect to user', async () => {
      const response = await request(app)
        .post(`/api/v1/depot-officer/defects/${defect._id}/assign`)
        .set('Authorization', `Bearer ${depotOfficerToken}`)
        .set('X-User-Role', 'DEPOT_OFFICER')
        .send({
          assignedTo: inspector._id.toString(),
          priority: 'CRITICAL',
          comments: 'Please investigate immediately',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ASSIGNED');
      expect(response.body.data.assignedTo).toBeDefined();

      // Check if alert was created
      const alert = await Alert.findOne({
        depotId,
        alertType: 'DEFECT_CRITICAL',
        'metadata.defectId': defect.defectId,
      });

      expect(alert).toBeDefined();
    });
  });
});
