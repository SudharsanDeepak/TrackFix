const mongoose = require('mongoose');
const User = require('../src/modules/auth/model');
const { ROLES } = require('../src/shared/constants');
const connectDB = require('../src/config/database');

describe('User Model - Extended Fields', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('depotId field', () => {
    it('should allow depotId for INSPECTOR role', async () => {
      const user = new User({
        name: 'Test Inspector',
        email: 'inspector@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.depotId).toBe('DEPOT001');
    });

    it('should allow depotId for DEPOT_OFFICER role', async () => {
      const user = new User({
        name: 'Test Depot Officer',
        email: 'officer@test.com',
        password: 'password123',
        role: ROLES.DEPOT_OFFICER,
        depotId: 'DEPOT002',
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.depotId).toBe('DEPOT002');
    });

    it('should require depotId for INSPECTOR role', async () => {
      const user = new User({
        name: 'Test Inspector',
        email: 'inspector2@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require depotId for DEPOT_OFFICER role', async () => {
      const user = new User({
        name: 'Test Depot Officer',
        email: 'officer2@test.com',
        password: 'password123',
        role: ROLES.DEPOT_OFFICER,
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should allow null depotId for ADMIN role', async () => {
      const user = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.depotId).toBeUndefined();
    });

    it('should allow null depotId for VENDOR role', async () => {
      const user = new User({
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: 'password123',
        role: ROLES.VENDOR,
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.depotId).toBeUndefined();
    });
  });

  describe('zoneId field', () => {
    it('should allow zoneId for ZONAL_MANAGER role', async () => {
      const user = new User({
        name: 'Test Zonal Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: ROLES.ZONAL_MANAGER,
        zoneId: 'ZONE001',
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.zoneId).toBe('ZONE001');
    });

    it('should require zoneId for ZONAL_MANAGER role', async () => {
      const user = new User({
        name: 'Test Zonal Manager',
        email: 'manager2@test.com',
        password: 'password123',
        role: ROLES.ZONAL_MANAGER,
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should allow null zoneId for INSPECTOR role', async () => {
      const user = new User({
        name: 'Test Inspector',
        email: 'inspector3@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT003',
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.zoneId).toBeUndefined();
    });

    it('should allow null zoneId for ADMIN role', async () => {
      const user = new User({
        name: 'Test Admin',
        email: 'admin2@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.zoneId).toBeUndefined();
    });
  });

  describe('permissions field', () => {
    it('should allow empty permissions array', async () => {
      const user = new User({
        name: 'Test User',
        email: 'user@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
        permissions: [],
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.permissions).toEqual([]);
    });

    it('should allow permissions array with values', async () => {
      const user = new User({
        name: 'Test User',
        email: 'user2@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
        permissions: ['CREATE_QR', 'VIEW_QR', 'MANAGE_USERS'],
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.permissions).toEqual(['CREATE_QR', 'VIEW_QR', 'MANAGE_USERS']);
    });

    it('should default to empty array if not provided', async () => {
      const user = new User({
        name: 'Test User',
        email: 'user3@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
      });

      await expect(user.save()).resolves.toBeDefined();
      expect(user.permissions).toEqual([]);
    });
  });

  describe('indexes', () => {
    it('should have compound index on role, depotId, and isActive', async () => {
      const indexes = User.schema.indexes();
      const compoundIndex = indexes.find(
        (idx) => idx[0].role === 1 && idx[0].depotId === 1 && idx[0].isActive === 1
      );
      expect(compoundIndex).toBeDefined();
    });

    it('should have compound index on role, zoneId, and isActive', async () => {
      const indexes = User.schema.indexes();
      const compoundIndex = indexes.find(
        (idx) => idx[0].role === 1 && idx[0].zoneId === 1 && idx[0].isActive === 1
      );
      expect(compoundIndex).toBeDefined();
    });

    it('should have sparse index on depotId', async () => {
      const indexes = User.schema.indexes();
      const depotIdIndex = indexes.find(
        (idx) => idx[0].depotId === 1 && idx[1]?.sparse === true
      );
      expect(depotIdIndex).toBeDefined();
    });

    it('should have sparse index on zoneId', async () => {
      const indexes = User.schema.indexes();
      const zoneIdIndex = indexes.find(
        (idx) => idx[0].zoneId === 1 && idx[1]?.sparse === true
      );
      expect(zoneIdIndex).toBeDefined();
    });
  });

  describe('conditional validation', () => {
    it('should validate depotId is required when role changes to INSPECTOR', async () => {
      const user = new User({
        name: 'Test User',
        email: 'user4@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
      });

      await user.save();
      
      user.role = ROLES.INSPECTOR;
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate zoneId is required when role changes to ZONAL_MANAGER', async () => {
      const user = new User({
        name: 'Test User',
        email: 'user5@test.com',
        password: 'password123',
        role: ROLES.ADMIN,
      });

      await user.save();
      
      user.role = ROLES.ZONAL_MANAGER;
      await expect(user.save()).rejects.toThrow();
    });

    it('should allow role change from INSPECTOR to ADMIN without depotId', async () => {
      const user = new User({
        name: 'Test Inspector',
        email: 'inspector4@test.com',
        password: 'password123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT004',
      });

      await user.save();
      
      user.role = ROLES.ADMIN;
      user.depotId = undefined;
      await expect(user.save()).resolves.toBeDefined();
    });
  });
});
