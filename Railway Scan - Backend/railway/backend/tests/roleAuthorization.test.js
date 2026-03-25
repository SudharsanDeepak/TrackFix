const roleAuthorization = require('../src/middlewares/roleAuthorization');
const { ROLES } = require('../src/shared/constants');
const ActivityLog = require('../src/models/ActivityLog.model');
const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

// Mock logger to prevent console output during tests
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Role Authorization Middleware', () => {
  let req, res, next;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await ActivityLog.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(() => {
    // Reset mocks before each test
    req = {
      user: null,
      headers: {},
      path: '/test/path',
      method: 'GET',
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
    };
    res = {};
    next = jest.fn();
  });

  afterEach(async () => {
    // Clean up activity logs after each test
    await ActivityLog.deleteMany({});
  });

  describe('X-User-Role Header Validation', () => {
    it('should return 400 Bad Request if X-User-Role header is missing', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };

      const middleware = roleAuthorization([ROLES.INSPECTOR]);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('X-User-Role header is required');

      // Verify authorization failure was logged
      const logs = await ActivityLog.find({ resource: 'AUTHORIZATION' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.reason).toContain('Missing X-User-Role header');
    });

    it('should return 403 Forbidden if X-User-Role header does not match user role', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.DEPOT_OFFICER;

      const middleware = roleAuthorization([ROLES.INSPECTOR]);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('X-User-Role header does not match user role');

      // Verify authorization failure was logged
      const logs = await ActivityLog.find({ resource: 'AUTHORIZATION' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.reason).toContain('X-User-Role header mismatch');
    });

    it('should proceed if X-User-Role header matches user role', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware = roleAuthorization([ROLES.INSPECTOR]);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Role-Based Authorization', () => {
    it('should allow access if user role is in allowedRoles', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.DEPOT_OFFICER,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.DEPOT_OFFICER;

      const middleware = roleAuthorization([ROLES.DEPOT_OFFICER, ROLES.INSPECTOR]);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should return 403 Forbidden if user role is not in allowedRoles', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware = roleAuthorization([ROLES.DEPOT_OFFICER]);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('Access denied');

      // Verify authorization failure was logged
      const logs = await ActivityLog.find({ resource: 'AUTHORIZATION' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.reason).toContain('not in allowed roles');
    });
  });

  describe('ADMIN Role Hierarchy', () => {
    it('should allow ADMIN role to access all routes regardless of allowedRoles', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Admin User',
        role: ROLES.ADMIN,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.ADMIN;

      const middleware = roleAuthorization([ROLES.INSPECTOR]);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow ADMIN role to access routes with permission requirements', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Admin User',
        role: ROLES.ADMIN,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.ADMIN;

      const middleware = roleAuthorization([ROLES.DEPOT_OFFICER], ['CREATE_QR', 'EXPORT_DATA']);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Permission-Based Authorization', () => {
    it('should allow access if user has all required permissions', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.DEPOT_OFFICER,
        permissions: ['CREATE_QR', 'EXPORT_DATA', 'VIEW_REPORTS'],
      };
      req.headers['x-user-role'] = ROLES.DEPOT_OFFICER;

      const middleware = roleAuthorization([ROLES.DEPOT_OFFICER], ['CREATE_QR', 'EXPORT_DATA']);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should return 403 Forbidden if user lacks required permissions', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.DEPOT_OFFICER,
        permissions: ['VIEW_REPORTS'],
      };
      req.headers['x-user-role'] = ROLES.DEPOT_OFFICER;

      const middleware = roleAuthorization([ROLES.DEPOT_OFFICER], ['CREATE_QR', 'EXPORT_DATA']);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('Missing required permissions');

      // Verify authorization failure was logged
      const logs = await ActivityLog.find({ resource: 'AUTHORIZATION' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.reason).toContain('Missing permissions');
    });

    it('should allow access if no permissions are required', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware = roleAuthorization([ROLES.INSPECTOR], []);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Authorization Failure Logging', () => {
    it('should log authorization failures to ActivityLog', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware = roleAuthorization([ROLES.DEPOT_OFFICER]);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();

      // Verify log entry was created
      const logs = await ActivityLog.find({ resource: 'AUTHORIZATION' });
      expect(logs.length).toBe(1);
      expect(logs[0].userId.toString()).toBe(req.user._id.toString());
      expect(logs[0].userName).toBe('Test User');
      expect(logs[0].role).toBe(ROLES.INSPECTOR);
      expect(logs[0].action).toBe('READ');
      expect(logs[0].resourceId).toBe('/test/path');
      expect(logs[0].ipAddress).toBe('127.0.0.1');
      expect(logs[0].metadata).toHaveProperty('reason');
      expect(logs[0].metadata).toHaveProperty('method', 'GET');
      expect(logs[0].metadata).toHaveProperty('path', '/test/path');
    });

    it('should log multiple authorization failures separately', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware1 = roleAuthorization([ROLES.DEPOT_OFFICER]);
      const middleware2 = roleAuthorization([ROLES.ZONAL_MANAGER]);

      // Call first middleware
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware1(req, res, testNext);
      });

      // Call second middleware
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware2(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(2);

      // Verify two log entries were created
      const logs = await ActivityLog.find({ resource: 'AUTHORIZATION' });
      expect(logs.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should return 403 if user is not authenticated', async () => {
      req.user = null;

      const middleware = roleAuthorization([ROLES.INSPECTOR]);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('User not authenticated');
    });

    it('should handle user with undefined permissions array', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        // permissions field is undefined
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware = roleAuthorization([ROLES.INSPECTOR], ['VIEW_REPORTS']);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('Missing required permissions');
    });

    it('should handle empty allowedRoles array', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.INSPECTOR;

      const middleware = roleAuthorization([], []);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('Access denied');
    });

    it('should handle case-sensitive role comparison', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
        permissions: [],
      };
      req.headers['x-user-role'] = 'inspector'; // lowercase

      const middleware = roleAuthorization([ROLES.INSPECTOR]);

      // Call middleware and wait for it to complete
      await new Promise((resolve) => {
        const testNext = (error) => {
          next(error);
          resolve();
        };
        middleware(req, res, testNext);
      });

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeDefined();
      expect(next.mock.calls[0][0].message).toContain('X-User-Role header does not match user role');
    });
  });

  describe('Multiple Roles Support', () => {
    it('should allow access if user role matches any of the allowed roles', async () => {
      req.user = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.ZONAL_MANAGER,
        permissions: [],
      };
      req.headers['x-user-role'] = ROLES.ZONAL_MANAGER;

      const middleware = roleAuthorization([
        ROLES.INSPECTOR,
        ROLES.DEPOT_OFFICER,
        ROLES.ZONAL_MANAGER,
      ]);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
