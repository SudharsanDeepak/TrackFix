/**
 * Bug Condition Exploration Tests
 *
 * These tests MUST FAIL on unfixed code — failure confirms the bugs exist.
 * DO NOT attempt to fix the tests or the code when they fail.
 *
 * These tests encode the expected behavior — they will validate the fixes
 * when they pass after implementation.
 *
 * Validates: Requirements 1.1, 1.2, 3.1, 7.1, 8.1
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/modules/auth/model');
const Inspection = require('../src/modules/inspection/model');
const { ROLES } = require('../src/shared/constants');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { submitInspectionSchema, listInspectionsQuerySchema } = require('../src/modules/inspector/validator');

describe('Bug Condition Exploration Tests', () => {
  let inspectorUser;
  let inspectorToken;
  let testFitting;
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
      name: 'Bug Test Inspector',
      email: 'bug-inspector@test.com',
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

    // Create a simple inspection without a fitting (fitting is optional in the model)
    testInspection = await Inspection.create({
      zoneCode: 'NR',
      inspectionYear: 2024,
      inspector: inspectorUser._id,
      inspectionDate: new Date(),
      status: 'PENDING',
      overallResult: 'PASS',
      assetId: 'ASSET-BUG-001',
      assetType: 'RAIL',
      location: 'Zone A',
    });
  });

  // ---------------------------------------------------------------------------
  // BUG 1 — Missing GET /inspector/inspections/:id endpoint
  // ---------------------------------------------------------------------------
  describe('BUG 1 — GET /api/v1/inspector/inspections/:id', () => {
    /**
     * isBugCondition_Bug1: request.method = "GET"
     *   AND request.path MATCHES "/api/v1/inspector/inspections/:id"
     *   AND request.params.id IS valid ObjectId
     *
     * Expected (fixed): response.status IN {200, 403, 404}
     * Bug (unfixed):    response.status = 404 (no route registered)
     *
     * This test MUST FAIL on unfixed code.
     */
    it('BUG 1: GET /inspector/inspections/:id with valid ObjectId should NOT return 404 (route missing)', async () => {
      const validId = testInspection._id.toString();

      const response = await request(app)
        .get(`/api/v1/inspector/inspections/${validId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      // On unfixed code this returns 404 because the route doesn't exist.
      // After fix it should return 200 with the inspection document.
      expect(response.status).not.toBe(404);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('BUG 1: GET /inspector/inspections/:id returns 200 with inspection document for owned inspection', async () => {
      const validId = testInspection._id.toString();

      const response = await request(app)
        .get(`/api/v1/inspector/inspections/${validId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // BUG 7 — submitInspection validator expects findings as string, not object
  // ---------------------------------------------------------------------------
  describe('BUG 7 — submitInspectionSchema findings type mismatch', () => {
    /**
     * isBugCondition_Bug7: submitPayload.findings IS object
     *   AND submitPayload.findings HAS keys IN
     *     {"visualInspection", "dimensionalCheck", "functionalTest", "wearAnalysis"}
     *
     * Expected (fixed): submitInspectionSchema.validate(payload).error = null
     * Bug (unfixed):    Joi returns a validation error because findings is Joi.string()
     *
     * This test MUST FAIL on unfixed code.
     */
    it('BUG 7: submitInspectionSchema should NOT return error when findings is an object (Joi.string() mismatch)', () => {
      const payload = {
        status: 'COMPLETED',
        findings: {
          visualInspection: { passed: true, notes: 'OK' },
        },
      };

      const { error } = submitInspectionSchema.validate(payload);

      // On unfixed code, Joi rejects the object because findings is declared as Joi.string().
      // After fix, findings should be a Joi.object() and this should pass.
      expect(error).toBeUndefined();
    });

    it('BUG 7: PUT /inspector/inspections/:id with object findings should NOT return 400', async () => {
      const validId = testInspection._id.toString();

      const response = await request(app)
        .put(`/api/v1/inspector/inspections/${validId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR)
        .send({
          status: 'COMPLETED',
          findings: {
            visualInspection: { passed: true, notes: 'OK' },
            dimensionalCheck: { passed: true, notes: 'Within tolerance' },
          },
        });

      // On unfixed code, Joi rejects the object findings with 400.
      // After fix, the request should be accepted (200 or 201).
      expect(response.status).not.toBe(400);
    });

    it('BUG 7: submitInspectionSchema accepts full findings object with all sub-fields', () => {
      const payload = {
        status: 'COMPLETED',
        findings: {
          visualInspection: { passed: true, notes: 'No visible damage' },
          dimensionalCheck: { passed: false, notes: 'Slight wear detected' },
          functionalTest: { passed: true, notes: 'Operates normally' },
          wearAnalysis: { wearLevel: 15, notes: 'Acceptable wear' },
        },
      };

      const { error, value } = submitInspectionSchema.validate(payload);

      expect(error).toBeUndefined();
      expect(value.findings).toBeDefined();
      expect(typeof value.findings).toBe('object');
    });
  });

  // ---------------------------------------------------------------------------
  // BUG 8 — sort query parameter stripped by listInspectionsQuerySchema
  // ---------------------------------------------------------------------------
  describe('BUG 8 — listInspectionsQuerySchema strips sort param', () => {
    /**
     * isBugCondition_Bug8: "sort" IN queryParams
     *   AND listInspectionsQuerySchema DOES NOT DECLARE "sort"
     *
     * Expected (fixed): sort param passes through validation unchanged
     * Bug (unfixed):    sort is stripped by Joi's stripUnknown behavior
     *
     * This test MUST FAIL on unfixed code.
     */
    it('BUG 8: listInspectionsQuerySchema should NOT strip the sort param', () => {
      const queryParams = { sort: '-createdAt' };

      const { error, value } = listInspectionsQuerySchema.validate(queryParams, {
        allowUnknown: false,
        stripUnknown: true,
      });

      // On unfixed code, sort is stripped because it's not declared in the schema.
      // After fix, sort should be present in the validated value.
      expect(error).toBeUndefined();
      expect(value.sort).toBe('-createdAt');
    });

    it('BUG 8: GET /inspector/inspections?sort=-createdAt should NOT strip sort param (returns 200)', async () => {
      const response = await request(app)
        .get('/api/v1/inspector/inspections?sort=-createdAt')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('X-User-Role', ROLES.INSPECTOR);

      // The route should accept the sort param without error.
      // On unfixed code, sort is silently stripped but the request still returns 200.
      // The key assertion is that sort is NOT stripped from the schema validation.
      expect(response.status).toBe(200);
    });

    it('BUG 8: listInspectionsQuerySchema declares sort as a valid field', () => {
      // Directly check that the schema description includes sort.
      // On unfixed code, sort is not in the schema keys.
      const schemaDescription = listInspectionsQuerySchema.describe();
      const schemaKeys = Object.keys(schemaDescription.keys || {});

      // After fix, 'sort' must be a declared key in the schema.
      expect(schemaKeys).toContain('sort');
    });
  });
});
