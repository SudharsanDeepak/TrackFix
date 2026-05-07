/**
 * Preservation Property Tests
 *
 * These tests MUST PASS on UNFIXED code — they establish the baseline behavior
 * that must be preserved after all bug fixes are applied.
 *
 * Observation-first methodology:
 *   1. Observe current behavior on unfixed code
 *   2. Encode that behavior as property-based tests
 *   3. Verify tests pass on unfixed code (this file)
 *   4. Re-run after each fix to confirm no regressions
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const Inspection = require('../src/modules/inspection/model');
const { ROLES, INSPECTION_STATUS } = require('../src/shared/constants');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  submitInspectionSchema,
  listInspectionsQuerySchema,
} = require('../src/modules/inspector/validator');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a random valid INSPECTION_STATUS value.
 */
function randomStatus() {
  const statuses = Object.values(INSPECTION_STATUS);
  return statuses[Math.floor(Math.random() * statuses.length)];
}

/**
 * Generate a random alphanumeric string of given length.
 */
function randomString(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Generate a random valid PUT payload where `findings` is omitted or undefined.
 * These payloads must continue to be accepted by submitInspectionSchema.
 */
function generatePayloadWithoutFindings() {
  const payload = { status: randomStatus() };

  // Randomly include optional fields (but never `findings`)
  if (Math.random() > 0.5) {
    payload.completedAt = new Date().toISOString();
  }
  if (Math.random() > 0.7) {
    payload.aiPrediction = {
      riskLevel: ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'][Math.floor(Math.random() * 4)],
      confidence: Math.random(),
    };
  }

  return payload;
}

/**
 * isBugCondition_Bug1: request targets GET /inspector/inspections/:id with valid ObjectId.
 * Returns true if the request matches the bug condition (the missing route).
 */
function isBugCondition_Bug1(method, path) {
  return (
    method === 'GET' &&
    /^\/api\/v1\/inspector\/inspections\/[a-f0-9]{24}$/.test(path)
  );
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('Preservation Property Tests', () => {
  let inspectorUser;
  let inspectorToken;
  let testInspection;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  }, 60000);

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Inspection.deleteMany({});

    inspectorUser = await User.create({
      name: 'Preservation Test Inspector',
      email: 'preservation-inspector@test.com',
      password: 'password123',
      role: ROLES.INSPECTOR,
      depotId: 'DEPOT001',
      isActive: true,
    });

    inspectorToken = jwt.sign(
      { id: inspectorUser._id, role: inspectorUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    testInspection = await Inspection.create({
      zoneCode: 'NR',
      inspectionYear: 2024,
      inspector: inspectorUser._id,
      inspectionDate: new Date(),
      status: 'PENDING',
      overallResult: 'PASS',
      assetId: 'ASSET-PRES-001',
      assetType: 'RAIL',
      location: 'Zone A',
    });
  });

  // =========================================================================
  // OBSERVATION: GET /inspector/inspections returns paginated list
  // =========================================================================
  describe('Observation 3.1 — GET /inspector/inspections returns paginated list', () => {
    it('returns 200 with paginated data for authenticated inspector', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('returns only inspections belonging to the authenticated inspector', async () => {
      // Create a second inspector with their own inspection
      const otherInspector = await User.create({
        name: 'Other Inspector',
        email: 'other-pres@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
        isActive: true,
      });
      await Inspection.create({
        zoneCode: 'NR',
        inspectionYear: 2024,
        inspector: otherInspector._id,
        inspectionDate: new Date(),
        status: 'PENDING',
        overallResult: 'PASS',
        assetId: 'ASSET-OTHER-001',
        assetType: 'RAIL',
        location: 'Zone B',
      });

      const response = await request(app)
        .get('/api/v1/inspector/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      // Only the testInspection belonging to inspectorUser should be returned
      expect(response.body.data.length).toBe(1);
    });

    it('supports pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/inspections?page=1&limit=10')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  // =========================================================================
  // OBSERVATION: POST /inspector/inspections creates inspection
  // =========================================================================
  describe('Observation 3.2 — POST /inspector/inspections creates inspection', () => {
    it('creates a new inspection with valid assetId', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({
          assetId: 'ASSET-NEW-001',
          assetType: 'RAIL',
          location: 'Zone C',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('returns 400 when neither qrId nor assetId is provided', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ assetType: 'RAIL' });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // OBSERVATION: DELETE /inspector/inspections/:id deletes owned inspection
  // =========================================================================
  describe('Observation 3.3 — DELETE /inspector/inspections/:id deletes owned inspection', () => {
    it('returns success when deleting an owned inspection', async () => {
      const response = await request(app)
        .delete(`/api/v1/inspector/inspections/${testInspection._id}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns error (403 or 500) when trying to delete another inspector\'s inspection', async () => {
      /**
       * NOTE: On unfixed code, the service imports ForbiddenError from errors.js but
       * that export does not exist (only AuthorizationError is exported). This causes
       * a 500 TypeError when cross-inspector delete is attempted.
       *
       * The preservation property here is: the request is NOT accepted (not 200/201).
       * After the fix, this should return 403 (once ForbiddenError is corrected).
       * For now, we assert the response is not a success (not 2xx).
       */
      const otherInspector = await User.create({
        name: 'Other Inspector 2',
        email: 'other2-pres@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
        isActive: true,
      });
      const otherToken = jwt.sign(
        { id: otherInspector._id, role: otherInspector.role },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .delete(`/api/v1/inspector/inspections/${testInspection._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      // On unfixed code: 500 (ForbiddenError is not a constructor)
      // After fix: should be 403 (once ForbiddenError is corrected to AuthorizationError)
      // Preservation: the request must NOT succeed (not 200/201)
      expect(response.status).not.toBe(200);
      expect(response.status).not.toBe(201);
    });
  });

  // =========================================================================
  // OBSERVATION: PUT /inspector/inspections/:id with findings omitted is accepted
  // =========================================================================
  describe('Observation 3.4 — PUT with findings omitted is accepted by submitInspectionSchema', () => {
    it('accepts { status: "COMPLETED" } with no findings field', () => {
      const payload = { status: 'COMPLETED' };
      const { error } = submitInspectionSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('accepts { status: "PENDING" } with no findings field', () => {
      const payload = { status: 'PENDING' };
      const { error } = submitInspectionSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('accepts { status: "IN_PROGRESS" } with no findings field', () => {
      const payload = { status: 'IN_PROGRESS' };
      const { error } = submitInspectionSchema.validate(payload);
      expect(error).toBeUndefined();
    });
  });

  // =========================================================================
  // OBSERVATION: PUT with findings as string is accepted (intentionally changing)
  // =========================================================================
  describe('Observation — PUT with findings as string (INTENTIONALLY CHANGING behavior)', () => {
    /**
     * NOTE: This behavior WILL CHANGE after the BUG 7 fix.
     * On unfixed code: findings as string is accepted (Joi.string())
     * After fix: findings as string will be REJECTED (Joi.object() replaces Joi.string())
     *
     * This test documents the CURRENT (unfixed) behavior.
     * It is expected to FAIL after the BUG 7 fix is applied — that is intentional.
     * The fix intentionally breaks this behavior to correct the schema-model mismatch.
     *
     * See design.md: "findings: 'looks good' (string) → currently accepted but silently
     * discarded by Mongoose (wrong type for nested object field)"
     */
    it('[INTENTIONALLY CHANGING] accepts findings as string on unfixed code', () => {
      const payload = { status: 'COMPLETED', findings: 'looks good' };
      const { error } = submitInspectionSchema.validate(payload);
      // On unfixed code: no error (Joi.string() accepts this)
      // After BUG 7 fix: this will return an error (Joi.object() rejects strings)
      // This test documents the current behavior — it will fail after the fix (intentional)
      expect(error).toBeUndefined();
    });
  });

  // =========================================================================
  // OBSERVATION: POST /inspector/scan-qr returns fitting details
  // =========================================================================
  describe('Observation 3.6 — POST /inspector/scan-qr returns fitting details', () => {
    it('returns 400 for invalid QR format (schema validation works)', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: 'INVALID-QR' });

      expect(response.status).toBe(400);
    });

    it('returns 404 for valid QR format but non-existent fitting', async () => {
      const response = await request(app)
        .post('/api/v1/inspector/scan-qr')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ qrId: 'IR-NR-2024-NOTEXIST-000001' });

      expect(response.status).toBe(404);
    });
  });

  // =========================================================================
  // PROPERTY: For all PUT payloads where findings is omitted/undefined,
  //           submitInspectionSchema accepts the payload
  //
  // Preservation Requirement: "PUT must continue to accept valid payloads
  // where findings is omitted"
  //
  // Validates: Requirements 3.4
  // =========================================================================
  describe('Property 7 (Preservation) — submitInspectionSchema accepts payloads without findings', () => {
    /**
     * Property: For ALL valid PUT payloads where `findings` is omitted or undefined,
     * submitInspectionSchema.validate(payload).error must be undefined.
     *
     * This property must hold on BOTH unfixed and fixed code.
     * It establishes the baseline that the fix must not break.
     *
     * Validates: Requirements 3.4
     */
    it('Property: all generated payloads without findings are accepted (100 samples)', () => {
      // Run 100 random samples to verify the property holds across the input space
      const NUM_SAMPLES = 100;
      const failures = [];

      for (let i = 0; i < NUM_SAMPLES; i++) {
        const payload = generatePayloadWithoutFindings();

        // Ensure findings is truly absent
        expect(payload.findings).toBeUndefined();

        const { error, value } = submitInspectionSchema.validate(payload);

        if (error) {
          failures.push({ payload, error: error.message });
        }
      }

      if (failures.length > 0) {
        // Report the first failure as a counterexample
        const first = failures[0];
        throw new Error(
          `Property violated: submitInspectionSchema rejected a payload without findings.\n` +
          `Counterexample: ${JSON.stringify(first.payload)}\n` +
          `Error: ${first.error}\n` +
          `Total failures: ${failures.length}/${NUM_SAMPLES}`
        );
      }

      expect(failures.length).toBe(0);
    });

    it('Property: payload with only status field is always accepted', () => {
      const statuses = Object.values(INSPECTION_STATUS);

      for (const status of statuses) {
        const payload = { status };
        const { error } = submitInspectionSchema.validate(payload);
        expect(error).toBeUndefined();
      }
    });

    it('Property: payload with status + completedAt (no findings) is accepted', () => {
      const payload = {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };
      const { error } = submitInspectionSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it('Property: payload with status + aiPrediction (no findings) is accepted', () => {
      const riskLevels = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'];

      for (const riskLevel of riskLevels) {
        const payload = {
          status: 'COMPLETED',
          aiPrediction: { riskLevel, confidence: 0.85 },
        };
        const { error } = submitInspectionSchema.validate(payload);
        expect(error).toBeUndefined();
      }
    });

    it('Property: payload with status + images array (no findings) is accepted', () => {
      const payload = {
        status: 'COMPLETED',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      };
      const { error } = submitInspectionSchema.validate(payload);
      expect(error).toBeUndefined();
    });
  });

  // =========================================================================
  // PROPERTY: For all HTTP requests NOT matching GET /inspector/inspections/:id,
  //           the inspector router returns the same response before and after fix
  //
  // Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6
  // =========================================================================
  describe('Property 2 (Preservation) — Non-bug-condition routes return expected responses', () => {
    /**
     * Property: For all HTTP requests where isBugCondition_Bug1 does NOT hold
     * (i.e., requests to routes other than GET /inspector/inspections/:id),
     * the inspector router must return the same response as before the fix.
     *
     * We verify this by testing each non-bug-condition route and asserting
     * the response matches the observed baseline behavior.
     *
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6
     */

    it('Property: GET /inspector/inspections (list) is NOT a bug condition and returns 200', async () => {
      const path = '/api/v1/inspector/inspections';
      expect(isBugCondition_Bug1('GET', path)).toBe(false);

      const response = await request(app)
        .get(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Property: POST /inspector/inspections is NOT a bug condition and returns 201', async () => {
      const path = '/api/v1/inspector/inspections';
      expect(isBugCondition_Bug1('POST', path)).toBe(false);

      const response = await request(app)
        .post(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ assetId: 'ASSET-PROP-001', assetType: 'RAIL', location: 'Zone D' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('Property: DELETE /inspector/inspections/:id is NOT a bug condition and returns 200', async () => {
      const path = `/api/v1/inspector/inspections/${testInspection._id}`;
      expect(isBugCondition_Bug1('DELETE', path)).toBe(false);

      const response = await request(app)
        .delete(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Property: PUT /inspector/inspections/:id is NOT a bug condition and returns 200', async () => {
      const path = `/api/v1/inspector/inspections/${testInspection._id}`;
      expect(isBugCondition_Bug1('PUT', path)).toBe(false);

      const response = await request(app)
        .put(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Property: GET /inspector/dashboard/stats is NOT a bug condition and returns 200', async () => {
      const path = '/api/v1/inspector/dashboard/stats';
      expect(isBugCondition_Bug1('GET', path)).toBe(false);

      const response = await request(app)
        .get(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('inspectionsCompletedToday');
      expect(response.body.data).toHaveProperty('pendingTasks');
    });

    it('Property: GET /inspector/tasks is NOT a bug condition and returns 200', async () => {
      const path = '/api/v1/inspector/tasks';
      expect(isBugCondition_Bug1('GET', path)).toBe(false);

      const response = await request(app)
        .get(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Property: GET /inspector/defects is NOT a bug condition and returns 200', async () => {
      const path = '/api/v1/inspector/defects';
      expect(isBugCondition_Bug1('GET', path)).toBe(false);

      const response = await request(app)
        .get(path)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Property: isBugCondition_Bug1 correctly identifies the bug condition path', () => {
      const validObjectId = '6634a1b2c3d4e5f6a7b8c9d0';

      // These ARE bug conditions (GET + /inspector/inspections/:id with valid ObjectId)
      expect(isBugCondition_Bug1('GET', `/api/v1/inspector/inspections/${validObjectId}`)).toBe(true);

      // These are NOT bug conditions
      expect(isBugCondition_Bug1('GET', '/api/v1/inspector/inspections')).toBe(false);
      expect(isBugCondition_Bug1('POST', `/api/v1/inspector/inspections/${validObjectId}`)).toBe(false);
      expect(isBugCondition_Bug1('DELETE', `/api/v1/inspector/inspections/${validObjectId}`)).toBe(false);
      expect(isBugCondition_Bug1('PUT', `/api/v1/inspector/inspections/${validObjectId}`)).toBe(false);
      expect(isBugCondition_Bug1('GET', '/api/v1/inspector/dashboard/stats')).toBe(false);
      expect(isBugCondition_Bug1('GET', '/api/v1/inspector/tasks')).toBe(false);
      expect(isBugCondition_Bug1('GET', '/api/v1/inspector/defects')).toBe(false);
    });

    it('Property: unauthenticated requests to all routes return 401 (unchanged)', async () => {
      const routes = [
        { method: 'get', path: '/api/v1/inspector/inspections' },
        { method: 'post', path: '/api/v1/inspector/inspections' },
        { method: 'get', path: '/api/v1/inspector/dashboard/stats' },
        { method: 'get', path: '/api/v1/inspector/tasks' },
        { method: 'get', path: '/api/v1/inspector/defects' },
      ];

      for (const route of routes) {
        const response = await request(app)[route.method](route.path);
        expect(response.status).toBe(401);
      }
    });
  });

  // =========================================================================
  // OBSERVATION: listInspectionsQuerySchema accepts valid query params
  // =========================================================================
  describe('Observation — listInspectionsQuerySchema accepts valid query params', () => {
    it('accepts status filter', () => {
      const { error } = listInspectionsQuerySchema.validate({ status: 'PENDING' });
      expect(error).toBeUndefined();
    });

    it('accepts pagination params', () => {
      const { error } = listInspectionsQuerySchema.validate({ page: 1, limit: 20 });
      expect(error).toBeUndefined();
    });

    it('accepts date range params', () => {
      const { error } = listInspectionsQuerySchema.validate({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });
      expect(error).toBeUndefined();
    });

    it('accepts empty query (all params optional)', () => {
      const { error } = listInspectionsQuerySchema.validate({});
      expect(error).toBeUndefined();
    });
  });
});
