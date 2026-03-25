const CacheService = require('../src/services/cacheService');

describe('CacheService', () => {
  describe('Cache Key Patterns', () => {
    it('should generate correct dashboard stats key', () => {
      const key = CacheService.CACHE_KEYS.DASHBOARD_STATS('INSPECTOR', 'user123');
      expect(key).toBe('dashboard:stats:INSPECTOR:user123');
    });

    it('should generate correct analytics inspection trends key', () => {
      const key = CacheService.CACHE_KEYS.ANALYTICS_INSPECTION_TRENDS('zone1', '30d');
      expect(key).toBe('analytics:inspection-trends:zone1:30d');
    });

    it('should generate correct depot performance key', () => {
      const key = CacheService.CACHE_KEYS.DEPOT_PERFORMANCE('zone1');
      expect(key).toBe('depot:performance:zone1');
    });

    it('should generate correct vendor performance key', () => {
      const key = CacheService.CACHE_KEYS.VENDOR_PERFORMANCE('vendor1', 'zone1');
      expect(key).toBe('vendor:performance:vendor1:zone1');
    });
  });

  describe('TTL Configuration', () => {
    it('should have correct TTL for Inspector dashboard (5 minutes)', () => {
      expect(CacheService.TTL.INSPECTOR_DASHBOARD).toBe(5 * 60);
    });

    it('should have correct TTL for Depot Officer dashboard (10 minutes)', () => {
      expect(CacheService.TTL.DEPOT_OFFICER_DASHBOARD).toBe(10 * 60);
    });

    it('should have correct TTL for Zonal Manager dashboard (15 minutes)', () => {
      expect(CacheService.TTL.ZONAL_MANAGER_DASHBOARD).toBe(15 * 60);
    });

    it('should have correct TTL for Analytics (15 minutes)', () => {
      expect(CacheService.TTL.ANALYTICS).toBe(15 * 60);
    });

    it('should have correct TTL for Depot Performance (30 minutes)', () => {
      expect(CacheService.TTL.DEPOT_PERFORMANCE).toBe(30 * 60);
    });

    it('should have correct TTL for Vendor Performance (1 hour)', () => {
      expect(CacheService.TTL.VENDOR_PERFORMANCE).toBe(60 * 60);
    });
  });

  describe('getDashboardTTL', () => {
    it('should return 5 minutes for INSPECTOR role', () => {
      const ttl = CacheService.getDashboardTTL('INSPECTOR');
      expect(ttl).toBe(5 * 60);
    });

    it('should return 10 minutes for DEPOT_OFFICER role', () => {
      const ttl = CacheService.getDashboardTTL('DEPOT_OFFICER');
      expect(ttl).toBe(10 * 60);
    });

    it('should return 15 minutes for ZONAL_MANAGER role', () => {
      const ttl = CacheService.getDashboardTTL('ZONAL_MANAGER');
      expect(ttl).toBe(15 * 60);
    });

    it('should return 15 minutes for ADMIN role', () => {
      const ttl = CacheService.getDashboardTTL('ADMIN');
      expect(ttl).toBe(15 * 60);
    });

    it('should return default 5 minutes for unknown role', () => {
      const ttl = CacheService.getDashboardTTL('UNKNOWN');
      expect(ttl).toBe(5 * 60);
    });
  });

  describe('Method Availability', () => {
    it('should have get method', () => {
      expect(typeof CacheService.get).toBe('function');
    });

    it('should have set method', () => {
      expect(typeof CacheService.set).toBe('function');
    });

    it('should have del method', () => {
      expect(typeof CacheService.del).toBe('function');
    });

    it('should have invalidatePattern method', () => {
      expect(typeof CacheService.invalidatePattern).toBe('function');
    });

    it('should have exists method', () => {
      expect(typeof CacheService.exists).toBe('function');
    });

    it('should have ttl method', () => {
      expect(typeof CacheService.ttl).toBe('function');
    });

    it('should have invalidateDepotCache method', () => {
      expect(typeof CacheService.invalidateDepotCache).toBe('function');
    });

    it('should have invalidateZoneCache method', () => {
      expect(typeof CacheService.invalidateZoneCache).toBe('function');
    });

    it('should have invalidateUserCache method', () => {
      expect(typeof CacheService.invalidateUserCache).toBe('function');
    });

    it('should have clearAll method', () => {
      expect(typeof CacheService.clearAll).toBe('function');
    });
  });
});
