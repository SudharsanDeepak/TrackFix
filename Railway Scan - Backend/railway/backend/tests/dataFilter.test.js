const dataFilter = require('../src/middlewares/dataFilter');
const { ROLES } = require('../src/shared/constants');
const { AuthorizationError } = require('../src/utils/errors');

describe('Data Filter Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null,
      method: 'GET',
      path: '/api/v1/test',
      body: {},
    };
    res = {};
    next = jest.fn();
  });

  describe('Authentication Check', () => {
    it('should throw AuthorizationError if user is not authenticated', async () => {
      const middleware = dataFilter();
      
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toBe('User not authenticated');
    });
  });

  describe('INSPECTOR Role', () => {
    it('should inject depotId filter for INSPECTOR', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ depotId: 'DEPOT001' });
      expect(next).toHaveBeenCalled();
    });

    it('should throw error if INSPECTOR has no depotId', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: null,
      };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toContain('must have an assigned depotId');
    });

    it('should prevent cross-depot resource creation for INSPECTOR', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'POST';
      req.body = { depotId: 'DEPOT002', name: 'Test' };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toContain('Cannot create or modify resources for depot DEPOT002');
    });

    it('should auto-inject depotId in POST request body for INSPECTOR', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'POST';
      req.body = { name: 'Test' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.body.depotId).toBe('DEPOT001');
      expect(req.dataFilter).toEqual({ depotId: 'DEPOT001' });
      expect(next).toHaveBeenCalled();
    });

    it('should allow same depot resource creation for INSPECTOR', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'POST';
      req.body = { depotId: 'DEPOT001', name: 'Test' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ depotId: 'DEPOT001' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('DEPOT_OFFICER Role', () => {
    it('should inject depotId filter for DEPOT_OFFICER', async () => {
      req.user = {
        _id: 'user456',
        role: ROLES.DEPOT_OFFICER,
        depotId: 'DEPOT002',
      };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ depotId: 'DEPOT002' });
      expect(next).toHaveBeenCalled();
    });

    it('should throw error if DEPOT_OFFICER has no depotId', async () => {
      req.user = {
        _id: 'user456',
        role: ROLES.DEPOT_OFFICER,
        depotId: undefined,
      };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toContain('must have an assigned depotId');
    });

    it('should prevent cross-depot resource creation for DEPOT_OFFICER', async () => {
      req.user = {
        _id: 'user456',
        role: ROLES.DEPOT_OFFICER,
        depotId: 'DEPOT002',
      };
      req.method = 'PUT';
      req.body = { depotId: 'DEPOT003', quantity: 100 };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toContain('Cannot create or modify resources for depot DEPOT003');
    });

    it('should auto-inject depotId in PUT request body for DEPOT_OFFICER', async () => {
      req.user = {
        _id: 'user456',
        role: ROLES.DEPOT_OFFICER,
        depotId: 'DEPOT002',
      };
      req.method = 'PUT';
      req.body = { quantity: 100 };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.body.depotId).toBe('DEPOT002');
      expect(req.dataFilter).toEqual({ depotId: 'DEPOT002' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('ZONAL_MANAGER Role', () => {
    it('should inject zoneId filter for ZONAL_MANAGER', async () => {
      req.user = {
        _id: 'user789',
        role: ROLES.ZONAL_MANAGER,
        zoneId: 'ZONE001',
      };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ zoneId: 'ZONE001' });
      expect(next).toHaveBeenCalled();
    });

    it('should throw error if ZONAL_MANAGER has no zoneId', async () => {
      req.user = {
        _id: 'user789',
        role: ROLES.ZONAL_MANAGER,
        zoneId: null,
      };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toContain('must have an assigned zoneId');
    });

    it('should prevent cross-zone resource creation for ZONAL_MANAGER', async () => {
      req.user = {
        _id: 'user789',
        role: ROLES.ZONAL_MANAGER,
        zoneId: 'ZONE001',
      };
      req.method = 'POST';
      req.body = { zoneId: 'ZONE002', name: 'Test Report' };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
      expect(next.mock.calls[0][0].message).toContain('Cannot create or modify resources for zone ZONE002');
    });

    it('should auto-inject zoneId in POST request body for ZONAL_MANAGER', async () => {
      req.user = {
        _id: 'user789',
        role: ROLES.ZONAL_MANAGER,
        zoneId: 'ZONE001',
      };
      req.method = 'POST';
      req.body = { name: 'Test Report' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.body.zoneId).toBe('ZONE001');
      expect(req.dataFilter).toEqual({ zoneId: 'ZONE001' });
      expect(next).toHaveBeenCalled();
    });

    it('should allow same zone resource creation for ZONAL_MANAGER', async () => {
      req.user = {
        _id: 'user789',
        role: ROLES.ZONAL_MANAGER,
        zoneId: 'ZONE001',
      };
      req.method = 'POST';
      req.body = { zoneId: 'ZONE001', name: 'Test Report' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ zoneId: 'ZONE001' });
      expect(next).toHaveBeenCalled();
    });
  });

  describe('ADMIN Role', () => {
    it('should not inject any filters for ADMIN', async () => {
      req.user = {
        _id: 'admin123',
        role: ROLES.ADMIN,
      };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({});
      expect(next).toHaveBeenCalled();
    });

    it('should allow ADMIN to create resources with any depotId', async () => {
      req.user = {
        _id: 'admin123',
        role: ROLES.ADMIN,
      };
      req.method = 'POST';
      req.body = { depotId: 'DEPOT999', name: 'Test' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({});
      expect(req.body.depotId).toBe('DEPOT999');
      expect(next).toHaveBeenCalled();
    });

    it('should allow ADMIN to create resources with any zoneId', async () => {
      req.user = {
        _id: 'admin123',
        role: ROLES.ADMIN,
      };
      req.method = 'POST';
      req.body = { zoneId: 'ZONE999', name: 'Test' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({});
      expect(req.body.zoneId).toBe('ZONE999');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('VENDOR Role', () => {
    it('should not inject any filters for VENDOR', async () => {
      req.user = {
        _id: 'vendor123',
        role: ROLES.VENDOR,
        vendorCode: 'VEN001',
      };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({});
      expect(next).toHaveBeenCalled();
    });

    it('should not validate resource creation for VENDOR', async () => {
      req.user = {
        _id: 'vendor123',
        role: ROLES.VENDOR,
        vendorCode: 'VEN001',
      };
      req.method = 'POST';
      req.body = { depotId: 'DEPOT001', name: 'Test' };

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({});
      expect(req.body.depotId).toBe('DEPOT001');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('HTTP Method Validation', () => {
    it('should validate POST requests', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'POST';
      req.body = { depotId: 'DEPOT002' };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });

    it('should validate PUT requests', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'PUT';
      req.body = { depotId: 'DEPOT002' };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });

    it('should validate PATCH requests', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'PATCH';
      req.body = { depotId: 'DEPOT002' };

      const middleware = dataFilter();
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });

    it('should not validate GET requests', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'GET';
      req.body = { depotId: 'DEPOT002' }; // Should be ignored for GET

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ depotId: 'DEPOT001' });
      expect(next).toHaveBeenCalled();
    });

    it('should not validate DELETE requests', async () => {
      req.user = {
        _id: 'user123',
        role: ROLES.INSPECTOR,
        depotId: 'DEPOT001',
      };
      req.method = 'DELETE';
      req.body = { depotId: 'DEPOT002' }; // Should be ignored for DELETE

      const middleware = dataFilter();
      await middleware(req, res, next);

      expect(req.dataFilter).toEqual({ depotId: 'DEPOT001' });
      expect(next).toHaveBeenCalled();
    });
  });
});
