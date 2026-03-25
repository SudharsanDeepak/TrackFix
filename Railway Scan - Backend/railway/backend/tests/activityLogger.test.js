const activityLogger = require('../src/middlewares/activityLogger');
const ActivityLog = require('../src/models/ActivityLog.model');
const { ROLES } = require('../src/shared/constants');
const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

// Mock logger to prevent console output during tests
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Activity Logger Middleware', () => {
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
      user: {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test User',
        role: ROLES.INSPECTOR,
      },
      headers: {
        'user-agent': 'Mozilla/5.0 Test Browser',
      },
      path: '/api/v1/inspector/inspections',
      method: 'GET',
      ip: '192.168.1.100',
      connection: { remoteAddress: '192.168.1.100' },
      params: {},
      query: {},
      body: {},
    };
    
    res = {
      statusCode: 200,
      locals: {},
      on: jest.fn(),
    };
    
    next = jest.fn();
  });

  afterEach(async () => {
    // Clean up activity logs after each test
    await ActivityLog.deleteMany({});
    // Flush any pending batched logs
    await activityLogger.flushBatch();
  });

  describe('Basic Logging Functionality', () => {
    it('should log activity after response is sent', async () => {
      const middleware = activityLogger('READ', 'INSPECTION');
      
      // Call middleware
      middleware(req, res, next);
      
      // Verify next was called immediately
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      
      // Verify res.on was called with 'finish' event
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
      
      // Simulate response finish event
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      // Flush batch to write logs
      await activityLogger.flushBatch();
      
      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify log was created
      const logs = await ActivityLog.find({ resource: 'INSPECTION' });
      expect(logs.length).toBe(1);
      expect(logs[0].userId.toString()).toBe(req.user._id.toString());
      expect(logs[0].userName).toBe('Test User');
      expect(logs[0].role).toBe(ROLES.INSPECTOR);
      expect(logs[0].action).toBe('READ');
      expect(logs[0].resource).toBe('INSPECTION');
      expect(logs[0].ipAddress).toBe('192.168.1.100');
      expect(logs[0].userAgent).toBe('Mozilla/5.0 Test Browser');
    });

    it('should capture resourceId from request params', async () => {
      req.params.id = 'INSP-123';
      const middleware = activityLogger('UPDATE', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ resource: 'INSPECTION' });
      expect(logs.length).toBe(1);
      expect(logs[0].resourceId).toBe('INSP-123');
    });

    it('should capture resourceId from res.locals for POST requests', async () => {
      req.method = 'POST';
      res.locals.createdResourceId = 'QR-456';
      const middleware = activityLogger('CREATE', 'QR');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ resource: 'QR' });
      expect(logs.length).toBe(1);
      expect(logs[0].resourceId).toBe('QR-456');
    });

    it('should include metadata with method, path, and statusCode', async () => {
      req.method = 'POST';
      req.path = '/api/v1/depot-officer/qr/batch';
      res.statusCode = 201;
      
      const middleware = activityLogger('CREATE', 'QR');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ resource: 'QR' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.method).toBe('POST');
      expect(logs[0].metadata.path).toBe('/api/v1/depot-officer/qr/batch');
      expect(logs[0].metadata.statusCode).toBe(201);
    });

    it('should include query params in metadata for READ operations', async () => {
      req.query = { status: 'PENDING', page: '1', limit: '20' };
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ resource: 'INSPECTION' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.queryParams).toEqual({
        status: 'PENDING',
        page: '1',
        limit: '20',
      });
    });

    it('should not include query params for non-READ operations', async () => {
      req.query = { status: 'APPROVED' };
      const middleware = activityLogger('UPDATE', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ resource: 'INSPECTION' });
      expect(logs.length).toBe(1);
      expect(logs[0].metadata.queryParams).toBeUndefined();
    });
  });

  describe('Exclusion Rules', () => {
    it('should exclude /health endpoint from logging', async () => {
      req.path = '/health';
      const middleware = activityLogger('READ', 'HEALTH');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.on).not.toHaveBeenCalled();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(0);
    });

    it('should exclude /metrics endpoint from logging', async () => {
      req.path = '/metrics';
      const middleware = activityLogger('READ', 'METRICS');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.on).not.toHaveBeenCalled();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(0);
    });

    it('should exclude /api/health endpoint from logging', async () => {
      req.path = '/api/health';
      const middleware = activityLogger('READ', 'HEALTH');
      
      middleware(req, res, next);
      
      expect(res.on).not.toHaveBeenCalled();
    });

    it('should exclude /api/v1/metrics endpoint from logging', async () => {
      req.path = '/api/v1/metrics';
      const middleware = activityLogger('READ', 'METRICS');
      
      middleware(req, res, next);
      
      expect(res.on).not.toHaveBeenCalled();
    });

    it('should not exclude similar paths that are not health/metrics', async () => {
      req.path = '/api/v1/inspector/health-check';
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      expect(res.on).toHaveBeenCalled();
    });
  });

  describe('Authentication Check', () => {
    it('should skip logging if user is not authenticated', async () => {
      req.user = null;
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.on).not.toHaveBeenCalled();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(0);
    });
  });

  describe('Status Code Filtering', () => {
    it('should log successful 2xx responses', async () => {
      res.statusCode = 200;
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(1);
    });

    it('should log successful 3xx responses', async () => {
      res.statusCode = 301;
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(1);
    });

    it('should not log 4xx error responses', async () => {
      res.statusCode = 404;
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(0);
    });

    it('should not log 5xx error responses', async () => {
      res.statusCode = 500;
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(0);
    });
  });

  describe('Different Action Types', () => {
    it('should log CREATE actions', async () => {
      const middleware = activityLogger('CREATE', 'DEFECT');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ action: 'CREATE' });
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('DEFECT');
    });

    it('should log UPDATE actions', async () => {
      const middleware = activityLogger('UPDATE', 'INVENTORY');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ action: 'UPDATE' });
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('INVENTORY');
    });

    it('should log DELETE actions', async () => {
      const middleware = activityLogger('DELETE', 'USER');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ action: 'DELETE' });
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('USER');
    });

    it('should log APPROVE actions', async () => {
      const middleware = activityLogger('APPROVE', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ action: 'APPROVE' });
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('INSPECTION');
    });

    it('should log REJECT actions', async () => {
      const middleware = activityLogger('REJECT', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ action: 'REJECT' });
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('INSPECTION');
    });

    it('should log EXPORT actions', async () => {
      const middleware = activityLogger('EXPORT', 'QR');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ action: 'EXPORT' });
      expect(logs.length).toBe(1);
      expect(logs[0].resource).toBe('QR');
    });
  });

  describe('Different User Roles', () => {
    it('should log activities for INSPECTOR role', async () => {
      req.user.role = ROLES.INSPECTOR;
      const middleware = activityLogger('CREATE', 'DEFECT');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ role: ROLES.INSPECTOR });
      expect(logs.length).toBe(1);
    });

    it('should log activities for DEPOT_OFFICER role', async () => {
      req.user.role = ROLES.DEPOT_OFFICER;
      const middleware = activityLogger('APPROVE', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ role: ROLES.DEPOT_OFFICER });
      expect(logs.length).toBe(1);
    });

    it('should log activities for ZONAL_MANAGER role', async () => {
      req.user.role = ROLES.ZONAL_MANAGER;
      const middleware = activityLogger('READ', 'ANALYTICS');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ role: ROLES.ZONAL_MANAGER });
      expect(logs.length).toBe(1);
    });

    it('should log activities for ADMIN role', async () => {
      req.user.role = ROLES.ADMIN;
      const middleware = activityLogger('UPDATE', 'USER');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({ role: ROLES.ADMIN });
      expect(logs.length).toBe(1);
    });
  });

  describe('IP Address Capture', () => {
    it('should capture IP from req.ip', async () => {
      req.ip = '10.0.0.1';
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(1);
      expect(logs[0].ipAddress).toBe('10.0.0.1');
    });

    it('should fallback to req.connection.remoteAddress if req.ip is not available', async () => {
      req.ip = undefined;
      req.connection = { remoteAddress: '172.16.0.1' };
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(1);
      expect(logs[0].ipAddress).toBe('172.16.0.1');
    });

    it('should fallback to req.socket.remoteAddress if other options are not available', async () => {
      req.ip = undefined;
      req.connection = undefined;
      req.socket = { remoteAddress: '192.168.0.1' };
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(1);
      expect(logs[0].ipAddress).toBe('192.168.0.1');
    });
  });

  describe('Batching Behavior', () => {
    it('should batch multiple log entries', async () => {
      const middleware = activityLogger('READ', 'INSPECTION');
      
      // Create multiple requests
      for (let i = 0; i < 5; i++) {
        middleware(req, res, next);
        const finishHandler = res.on.mock.calls[i][1];
        finishHandler();
      }
      
      // Flush batch
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const logs = await ActivityLog.find({});
      expect(logs.length).toBe(5);
    });
  });

  describe('Non-blocking Behavior', () => {
    it('should not block the response', async () => {
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      // Verify next was called immediately without waiting
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should log asynchronously after response is sent', async () => {
      const middleware = activityLogger('READ', 'INSPECTION');
      
      middleware(req, res, next);
      
      // At this point, no logs should exist yet
      let logs = await ActivityLog.find({});
      expect(logs.length).toBe(0);
      
      // Trigger finish event
      const finishHandler = res.on.mock.calls[0][1];
      finishHandler();
      
      // Flush batch
      await activityLogger.flushBatch();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now logs should exist
      logs = await ActivityLog.find({});
      expect(logs.length).toBe(1);
    });
  });
});
