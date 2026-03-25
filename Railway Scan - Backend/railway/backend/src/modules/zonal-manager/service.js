const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const Inspection = require('../inspection/model');
const Defect = require('../defect/model');
const Vendor = require('../vendor/model');
const Alert = require('../../models/Alert.model');
const Report = require('../../models/Report.model');
const TrackFitting = require('../qr/model');
const User = require('../auth/model');
const CacheService = require('../../services/cacheService');

/**
 * Zonal Manager Service
 * Business logic for Zonal Manager role operations
 */

class ZonalManagerService {
  /**
   * Get time range start date based on range string
   * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
   * @returns {Date} Start date
   */
  getTimeRangeStartDate(timeRange) {
    const now = new Date();
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    
    const days = ranges[timeRange] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return startDate;
  }

  /**
   * Get depot IDs for a zone
   * @param {string} zoneId - Zone ID
   * @returns {Promise<string[]>} Array of depot IDs
   */
  async getDepotIdsForZone(zoneId) {
    // Get all fittings in the zone and extract unique depot IDs
    const depots = await TrackFitting.distinct('location.depot', { zoneCode: zoneId });
    return depots.filter(Boolean);
  }

  /**
   * Get inspection trends over time
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Inspection trends data
   */
  async getInspectionTrends(filters, dataFilter, zoneId) {
    logger.info('Getting inspection trends for zone', { filters, zoneId });
    
    // Check cache first (15 minute TTL)
    const cacheKey = `analytics:inspection-trends:${zoneId}:${filters.timeRange}`;
    const cachedData = await CacheService.get(cacheKey);
    
    if (cachedData) {
      logger.debug('Returning cached inspection trends', { zoneId });
      return cachedData;
    }
    
    const startDate = this.getTimeRangeStartDate(filters.timeRange);
    const depotIds = await this.getDepotIdsForZone(zoneId);
    
    // Build query
    const query = {
      inspectionDate: { $gte: startDate },
    };
    
    // Filter by specific depot if provided
    if (filters.depotId) {
      query['fitting.location.depot'] = filters.depotId;
    }
    
    // Aggregate inspection trends by date
    const trends = await Inspection.aggregate([
      {
        $lookup: {
          from: 'trackfittings',
          localField: 'fitting',
          foreignField: '_id',
          as: 'fittingData',
        },
      },
      { $unwind: '$fittingData' },
      {
        $match: {
          'fittingData.zoneCode': zoneId,
          inspectionDate: { $gte: startDate },
          ...(filters.depotId && { 'fittingData.location.depot': filters.depotId }),
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$inspectionDate' } },
            depot: '$fittingData.location.depot',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          depots: {
            $push: {
              depot: '$_id.depot',
              status: '$_id.status',
              count: '$count',
            },
          },
          totalInspections: { $sum: '$count' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    // Calculate summary statistics
    const totalInspections = trends.reduce((sum, day) => sum + day.totalInspections, 0);
    const avgInspectionsPerDay = trends.length > 0 ? totalInspections / trends.length : 0;
    
    const result = {
      timeRange: filters.timeRange,
      startDate,
      endDate: new Date(),
      trends,
      summary: {
        totalInspections,
        avgInspectionsPerDay: Math.round(avgInspectionsPerDay * 100) / 100,
        totalDays: trends.length,
        depotsInZone: depotIds.length,
      },
    };
    
    // Cache for 15 minutes using CacheService.TTL.ANALYTICS
    await CacheService.set(cacheKey, result, CacheService.TTL.ANALYTICS);
    
    return result;
  }

  /**
   * Get defect trends over time
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Defect trends data
   */
  async getDefectTrends(filters, dataFilter, zoneId) {
    logger.info('Getting defect trends for zone', { filters, zoneId });
    
    // Check cache first (15 minute TTL)
    const cacheKey = `analytics:defect-trends:${zoneId}:${filters.timeRange}:${filters.fittingType || 'all'}`;
    const cachedData = await CacheService.get(cacheKey);
    
    if (cachedData) {
      logger.debug('Returning cached defect trends', { zoneId });
      return cachedData;
    }
    
    const startDate = this.getTimeRangeStartDate(filters.timeRange);
    const depotIds = await this.getDepotIdsForZone(zoneId);
    
    // Build query
    const query = {
      createdAt: { $gte: startDate },
      depotId: { $in: depotIds },
    };
    
    if (filters.fittingType) {
      query.fittingType = filters.fittingType;
    }
    
    // Aggregate defect trends by date, depot, and severity
    const trends = await Defect.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            depot: '$depotId',
            severity: '$severity',
            fittingType: '$fittingType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          defects: {
            $push: {
              depot: '$_id.depot',
              severity: '$_id.severity',
              fittingType: '$_id.fittingType',
              count: '$count',
            },
          },
          totalDefects: { $sum: '$count' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    // Calculate defect rates per depot
    const depotDefectRates = await Defect.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$depotId',
          totalDefects: { $sum: 1 },
          criticalDefects: {
            $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] },
          },
          highDefects: {
            $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] },
          },
        },
      },
    ]);
    
    // Calculate summary statistics
    const totalDefects = trends.reduce((sum, day) => sum + day.totalDefects, 0);
    const avgDefectsPerDay = trends.length > 0 ? totalDefects / trends.length : 0;
    
    const result = {
      timeRange: filters.timeRange,
      startDate,
      endDate: new Date(),
      trends,
      depotDefectRates,
      summary: {
        totalDefects,
        avgDefectsPerDay: Math.round(avgDefectsPerDay * 100) / 100,
        totalDays: trends.length,
        depotsInZone: depotIds.length,
      },
    };
    
    // Cache for 15 minutes using CacheService.TTL.ANALYTICS
    await CacheService.set(cacheKey, result, CacheService.TTL.ANALYTICS);
    
    return result;
  }

  /**
   * Get depot performance metrics
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Depot performance data
   */
  async getDepotPerformance(filters, dataFilter, zoneId) {
    logger.info('Getting depot performance for zone', { filters, zoneId });
    
    // Check cache first (30 minute TTL)
    const cacheKey = `depot:performance:${zoneId}`;
    const cachedData = await CacheService.get(cacheKey);
    
    if (cachedData) {
      logger.debug('Returning cached depot performance', { zoneId });
      return cachedData;
    }
    
    const depotIds = await this.getDepotIdsForZone(zoneId);
    const startDate = filters.startDate || this.getTimeRangeStartDate('90d');
    const endDate = filters.endDate || new Date();
    
    // Calculate performance metrics for each depot
    const performanceData = await Promise.all(
      depotIds.map(async (depotId) => {
        // Inspection completion rate
        const [totalInspections, completedInspections] = await Promise.all([
          Inspection.countDocuments({
            'fittingData.location.depot': depotId,
            inspectionDate: { $gte: startDate, $lte: endDate },
          }),
          Inspection.countDocuments({
            'fittingData.location.depot': depotId,
            inspectionDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['COMPLETED', 'APPROVED'] },
          }),
        ]);
        
        const inspectionCompletionRate = totalInspections > 0 
          ? (completedInspections / totalInspections) * 100 
          : 0;
        
        // Defect resolution time (average days to resolve)
        const resolvedDefects = await Defect.find({
          depotId,
          status: 'RESOLVED',
          resolvedAt: { $exists: true },
          createdAt: { $gte: startDate, $lte: endDate },
        }).select('createdAt resolvedAt');
        
        const avgResolutionTime = resolvedDefects.length > 0
          ? resolvedDefects.reduce((sum, defect) => {
              const days = (defect.resolvedAt - defect.createdAt) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / resolvedDefects.length
          : 0;
        
        // QR utilization (percentage of QR codes that have been inspected)
        const [totalQRCodes, inspectedQRCodes] = await Promise.all([
          TrackFitting.countDocuments({
            'location.depot': depotId,
            zoneCode: zoneId,
          }),
          TrackFitting.countDocuments({
            'location.depot': depotId,
            zoneCode: zoneId,
            inspectionCount: { $gt: 0 },
          }),
        ]);
        
        const qrUtilization = totalQRCodes > 0 
          ? (inspectedQRCodes / totalQRCodes) * 100 
          : 0;
        
        // Normalize metrics to 0-100 scale
        const normalizedInspectionRate = Math.min(inspectionCompletionRate, 100);
        const normalizedDefectResolution = Math.max(0, 100 - (avgResolutionTime * 2)); // Lower is better
        const normalizedQRUtilization = Math.min(qrUtilization, 100);
        
        // Weighted scoring (30% inspection, 25% defect resolution, 15% QR, 30% productivity)
        const performanceScore = 
          (normalizedInspectionRate * 0.30) +
          (normalizedDefectResolution * 0.25) +
          (normalizedQRUtilization * 0.15) +
          (normalizedInspectionRate * 0.30); // Productivity proxy
        
        return {
          depotId,
          metrics: {
            inspectionCompletionRate: Math.round(inspectionCompletionRate * 100) / 100,
            avgDefectResolutionTime: Math.round(avgResolutionTime * 100) / 100,
            qrUtilization: Math.round(qrUtilization * 100) / 100,
            totalInspections,
            completedInspections,
            totalDefects: await Defect.countDocuments({ depotId, createdAt: { $gte: startDate, $lte: endDate } }),
            resolvedDefects: resolvedDefects.length,
          },
          performanceScore: Math.round(performanceScore * 100) / 100,
        };
      })
    );
    
    const result = {
      zoneId,
      startDate,
      endDate,
      depots: performanceData,
      summary: {
        totalDepots: depotIds.length,
        avgPerformanceScore: performanceData.length > 0
          ? Math.round((performanceData.reduce((sum, d) => sum + d.performanceScore, 0) / performanceData.length) * 100) / 100
          : 0,
      },
    };
    
    // Cache for 30 minutes using CacheService.TTL.DEPOT_PERFORMANCE
    await CacheService.set(cacheKey, result, CacheService.TTL.DEPOT_PERFORMANCE);
    
    return result;
  }

  /**
   * Get depot rankings by performance score
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Depot rankings
   */
  async getDepotRankings(filters, dataFilter, zoneId) {
    logger.info('Getting depot rankings for zone', { zoneId });
    
    // Get performance data (will use cache if available)
    const performanceData = await this.getDepotPerformance(filters, dataFilter, zoneId);
    
    // Sort depots by performance score in descending order
    const rankings = performanceData.depots
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .map((depot, index) => ({
        rank: index + 1,
        depotId: depot.depotId,
        performanceScore: depot.performanceScore,
        metrics: depot.metrics,
      }));
    
    return {
      zoneId,
      startDate: performanceData.startDate,
      endDate: performanceData.endDate,
      rankings,
      summary: {
        totalDepots: rankings.length,
        topPerformer: rankings[0] || null,
        avgScore: performanceData.summary.avgPerformanceScore,
      },
    };
  }

  /**
   * Get vendors with performance metrics
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Vendors with metrics
   */
  async getVendors(filters, dataFilter, zoneId) {
    logger.info('Getting vendors for zone', { zoneId });
    
    // Check cache first (1 hour TTL)
    const cacheKey = `vendor:list:${zoneId}`;
    const cachedData = await CacheService.get(cacheKey);
    
    if (cachedData) {
      logger.debug('Returning cached vendor list', { zoneId });
      return cachedData;
    }
    
    const depotIds = await this.getDepotIdsForZone(zoneId);
    const startDate = filters.startDate || this.getTimeRangeStartDate('90d');
    const endDate = filters.endDate || new Date();
    
    // Get all vendors that have supplied fittings to this zone
    const vendors = await Vendor.find({ isActive: true });
    
    // Calculate performance metrics for each vendor
    const vendorsWithMetrics = await Promise.all(
      vendors.map(async (vendor) => {
        // Get fittings supplied by this vendor in the zone
        const fittings = await TrackFitting.find({
          vendor: vendor._id,
          zoneCode: zoneId,
          'location.depot': { $in: depotIds },
        });
        
        const fittingIds = fittings.map(f => f._id);
        
        // Get inspections for these fittings
        const inspections = await Inspection.find({
          fitting: { $in: fittingIds },
          inspectionDate: { $gte: startDate, $lte: endDate },
        });
        
        const totalInspections = inspections.length;
        const passedInspections = inspections.filter(i => i.overallResult === 'PASS').length;
        const inspectionPassRate = totalInspections > 0 
          ? (passedInspections / totalInspections) * 100 
          : 0;
        
        // Get defects for these fittings
        const inspectionIds = inspections.map(i => i._id);
        const defects = await Defect.find({
          inspectionId: { $in: inspectionIds },
          createdAt: { $gte: startDate, $lte: endDate },
        });
        
        const defectRate = totalInspections > 0 
          ? (defects.length / totalInspections) * 100 
          : 0;
        
        // Calculate quality score (inverse of defect rate, normalized)
        const qualityScore = Math.max(0, 100 - defectRate);
        
        return {
          vendorId: vendor._id,
          vendorCode: vendor.vendorCode,
          name: vendor.name,
          metrics: {
            totalFittingsSupplied: fittings.length,
            totalInspections,
            inspectionPassRate: Math.round(inspectionPassRate * 100) / 100,
            defectRate: Math.round(defectRate * 100) / 100,
            qualityScore: Math.round(qualityScore * 100) / 100,
            totalDefects: defects.length,
          },
          performanceScore: vendor.performanceScore,
          riskScore: vendor.riskScore,
        };
      })
    );
    
    // Filter out vendors with no activity in the zone
    const activeVendors = vendorsWithMetrics.filter(v => v.metrics.totalFittingsSupplied > 0);
    
    const result = {
      zoneId,
      startDate,
      endDate,
      vendors: activeVendors,
      summary: {
        totalVendors: activeVendors.length,
        avgQualityScore: activeVendors.length > 0
          ? Math.round((activeVendors.reduce((sum, v) => sum + v.metrics.qualityScore, 0) / activeVendors.length) * 100) / 100
          : 0,
      },
    };
    
    // Cache for 1 hour using CacheService.TTL.VENDOR_PERFORMANCE
    await CacheService.set(cacheKey, result, CacheService.TTL.VENDOR_PERFORMANCE);
    
    return result;
  }

  /**
   * Get detailed vendor performance
   * @param {string} vendorId - Vendor ID
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Detailed vendor performance
   */
  async getVendorPerformance(vendorId, filters, dataFilter, zoneId) {
    logger.info('Getting vendor performance', { vendorId, zoneId });
    
    // Check cache first (1 hour TTL)
    const cacheKey = `vendor:performance:${vendorId}:${zoneId}`;
    const cachedData = await CacheService.get(cacheKey);
    
    if (cachedData) {
      logger.debug('Returning cached vendor performance', { vendorId });
      return cachedData;
    }
    
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    
    const depotIds = await this.getDepotIdsForZone(zoneId);
    const startDate = filters.startDate || this.getTimeRangeStartDate('90d');
    const endDate = filters.endDate || new Date();
    
    // Get fittings supplied by this vendor in the zone
    const fittings = await TrackFitting.find({
      vendor: vendor._id,
      zoneCode: zoneId,
      'location.depot': { $in: depotIds },
    });
    
    const fittingIds = fittings.map(f => f._id);
    
    // Get inspections for these fittings
    const inspections = await Inspection.find({
      fitting: { $in: fittingIds },
      inspectionDate: { $gte: startDate, $lte: endDate },
    });
    
    const totalInspections = inspections.length;
    const passedInspections = inspections.filter(i => i.overallResult === 'PASS').length;
    const inspectionPassRate = totalInspections > 0 
      ? (passedInspections / totalInspections) * 100 
      : 0;
    
    // Get defects for these fittings
    const inspectionIds = inspections.map(i => i._id);
    const defects = await Defect.find({
      inspectionId: { $in: inspectionIds },
      createdAt: { $gte: startDate, $lte: endDate },
    });
    
    const defectRate = totalInspections > 0 
      ? (defects.length / totalInspections) * 100 
      : 0;
    
    // Group defects by severity
    const defectsBySeverity = defects.reduce((acc, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1;
      return acc;
    }, {});
    
    // Group defects by fitting type
    const defectsByFittingType = defects.reduce((acc, defect) => {
      acc[defect.fittingType] = (acc[defect.fittingType] || 0) + 1;
      return acc;
    }, {});
    
    const result = {
      vendor: {
        id: vendor._id,
        vendorCode: vendor.vendorCode,
        name: vendor.name,
        performanceScore: vendor.performanceScore,
        riskScore: vendor.riskScore,
      },
      zoneId,
      startDate,
      endDate,
      metrics: {
        totalFittingsSupplied: fittings.length,
        totalInspections,
        passedInspections,
        failedInspections: totalInspections - passedInspections,
        inspectionPassRate: Math.round(inspectionPassRate * 100) / 100,
        defectRate: Math.round(defectRate * 100) / 100,
        totalDefects: defects.length,
        defectsBySeverity,
        defectsByFittingType,
      },
    };
    
    // Cache for 1 hour using CacheService.TTL.VENDOR_PERFORMANCE
    await CacheService.set(cacheKey, result, CacheService.TTL.VENDOR_PERFORMANCE);
    
    return result;
  }

  /**
   * Rate a vendor
   * @param {string} vendorId - Vendor ID
   * @param {Object} data - Rating data
   * @param {string} userId - Zonal manager user ID
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Rating result
   */
  async rateVendor(vendorId, data, userId, zoneId) {
    logger.info('Rating vendor', { vendorId, data, userId, zoneId });
    
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    
    // Create a vendor rating record (we'll store this in vendor metadata or a separate collection)
    // For now, we'll just return success - in a full implementation, you'd store this in a VendorRating model
    const rating = {
      vendorId: vendor._id,
      ratedBy: userId,
      zoneId,
      rating: data.rating,
      category: data.category,
      comment: data.comment,
      timestamp: new Date(),
    };
    
    // Invalidate vendor performance cache
    await CacheService.del(`vendor:performance:${vendorId}:${zoneId}`);
    
    return {
      success: true,
      rating,
      message: 'Vendor rated successfully',
    };
  }

  /**
   * Get alerts for the zone
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {Object} pagination - Pagination params
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Alerts and total count
   */
  async getAlerts(filters, dataFilter, pagination, zoneId) {
    logger.info('Getting alerts for zone', { filters, zoneId });
    
    // Build query
    const query = {
      zoneId,
      ...dataFilter,
    };
    
    // Add severity filter if provided
    if (filters.severity) {
      query.severity = filters.severity;
    }
    
    // Add status filter if provided
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Add alertType filter if provided
    if (filters.alertType) {
      query.alertType = filters.alertType;
    }
    
    // Define severity order for sorting
    const severityOrder = { EMERGENCY: 1, CRITICAL: 2, WARNING: 3, INFO: 4 };
    
    // Execute query with pagination
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .populate('createdBy', 'name email')
        .populate('acknowledgedBy', 'name email')
        .populate('escalatedTo', 'name email')
        .sort({ severity: 1, createdAt: -1 }) // MongoDB will sort by severity string, we'll re-sort in memory
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Alert.countDocuments(query),
    ]);
    
    // Sort by severity order (EMERGENCY, CRITICAL, WARNING, INFO) then by createdAt
    const sortedAlerts = alerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return {
      alerts: sortedAlerts,
      total,
    };
  }

  /**
   * Acknowledge an alert
   * @param {string} alertId - Alert ID
   * @param {Object} data - Acknowledgement data
   * @param {string} userId - Zonal manager user ID
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Updated alert
   */
  async acknowledgeAlert(alertId, data, userId, zoneId) {
    logger.info('Acknowledging alert', { alertId, userId, zoneId });
    
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      throw new NotFoundError('Alert not found');
    }
    
    // Verify alert belongs to zonal manager's zone
    if (alert.zoneId !== zoneId) {
      throw new ForbiddenError('Cannot acknowledge alert from another zone');
    }
    
    // Update alert status
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    
    if (data.notes) {
      alert.metadata = {
        ...alert.metadata,
        acknowledgementNotes: data.notes,
      };
    }
    
    await alert.save();
    
    // Populate and return
    const populatedAlert = await Alert.findById(alert._id)
      .populate('createdBy', 'name email')
      .populate('acknowledgedBy', 'name email')
      .lean();
    
    return populatedAlert;
  }

  /**
   * Escalate an alert
   * @param {string} alertId - Alert ID
   * @param {Object} data - Escalation data
   * @param {string} userId - Zonal manager user ID
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Updated alert
   */
  async escalateAlert(alertId, data, userId, zoneId) {
    logger.info('Escalating alert', { alertId, data, userId, zoneId });
    
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      throw new NotFoundError('Alert not found');
    }
    
    // Verify alert belongs to zonal manager's zone
    if (alert.zoneId !== zoneId) {
      throw new ForbiddenError('Cannot escalate alert from another zone');
    }
    
    // Verify escalation recipient exists and has higher authority
    const recipient = await User.findById(data.escalateTo);
    
    if (!recipient) {
      throw new NotFoundError('Escalation recipient not found');
    }
    
    // Validate recipient has higher authority (ADMIN role)
    if (recipient.role !== 'ADMIN') {
      throw new ValidationError('Can only escalate to administrators');
    }
    
    // Update alert status
    alert.status = 'ESCALATED';
    alert.escalatedTo = data.escalateTo;
    alert.metadata = {
      ...alert.metadata,
      escalationReason: data.reason,
      escalatedBy: userId,
      escalatedAt: new Date(),
    };
    
    await alert.save();
    
    // Create notification for escalation recipient (would be implemented with a notification service)
    logger.info('Alert escalated, notification should be sent', {
      alertId,
      escalatedTo: data.escalateTo,
      reason: data.reason,
    });
    
    // Populate and return
    const populatedAlert = await Alert.findById(alert._id)
      .populate('createdBy', 'name email')
      .populate('acknowledgedBy', 'name email')
      .populate('escalatedTo', 'name email')
      .lean();
    
    return populatedAlert;
  }

  /**
   * Generate a zone-level report
   * @param {Object} data - Report data
   * @param {string} userId - Zonal manager user ID
   * @param {string} zoneId - Zonal manager's zone ID
   * @returns {Promise<Object>} Created report
   */
  async generateReport(data, userId, zoneId) {
    logger.info('Generating zone-level report', { data, userId, zoneId });
    
    // Create report record with status PENDING
    const report = await Report.create({
      generatedBy: userId,
      role: 'ZONAL_MANAGER',
      reportType: data.reportType,
      filters: {
        ...data.filters,
        zoneId,
      },
      format: data.format,
      status: 'PENDING',
    });
    
    // In a full implementation, queue a background job for report generation
    // For now, we'll just return the report record
    logger.info('Report generation queued', { reportId: report.reportId });
    
    // Populate and return
    const populatedReport = await Report.findById(report._id)
      .populate('generatedBy', 'name email')
      .lean();
    
    return populatedReport;
  }

  /**
   * Get generated reports
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @param {Object} pagination - Pagination params
   * @param {string} userId - Zonal manager user ID
   * @returns {Promise<Object>} Reports and total count
   */
  async getReports(filters, dataFilter, pagination, userId) {
    logger.info('Getting reports for zonal manager', { filters, userId });
    
    // Build query - filter by generatedBy to show only zonal manager's reports
    const query = {
      generatedBy: userId,
    };
    
    // Add reportType filter if provided
    if (filters.reportType) {
      query.reportType = filters.reportType;
    }
    
    // Add status filter if provided
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Execute query with pagination
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('generatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Report.countDocuments(query),
    ]);
    
    return {
      reports,
      total,
    };
  }

  /**
   * Get dashboard statistics for the zonal manager
   * @param {string} userId - Zonal manager user ID
   * @param {string} zoneId - Zonal manager's zone ID
   * @param {Object} dataFilter - Automatic zone filter from middleware
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(userId, zoneId, dataFilter) {
    logger.info('Getting dashboard stats for zonal manager', { userId, zoneId });
    
    // Check cache first (15 minute TTL as per design)
    const cacheKey = `dashboard:stats:ZONAL_MANAGER:${userId}:${zoneId}`;
    const cachedStats = await CacheService.get(cacheKey);
    
    if (cachedStats) {
      logger.debug('Returning cached dashboard stats', { userId });
      return cachedStats;
    }
    
    const depotIds = await this.getDepotIdsForZone(zoneId);
    
    // Run aggregations in parallel for performance
    const [
      totalDepots,
      totalInspections,
      totalDefects,
      criticalAlerts,
      avgPerformance,
    ] = await Promise.all([
      // Total depots in zone
      Promise.resolve(depotIds.length),
      
      // Total inspections in zone (last 30 days)
      Inspection.aggregate([
        {
          $lookup: {
            from: 'trackfittings',
            localField: 'fitting',
            foreignField: '_id',
            as: 'fittingData',
          },
        },
        { $unwind: '$fittingData' },
        {
          $match: {
            'fittingData.zoneCode': zoneId,
            inspectionDate: { $gte: this.getTimeRangeStartDate('30d') },
          },
        },
        {
          $count: 'total',
        },
      ]).then(result => result[0]?.total || 0),
      
      // Total defects in zone (last 30 days)
      Defect.countDocuments({
        depotId: { $in: depotIds },
        createdAt: { $gte: this.getTimeRangeStartDate('30d') },
      }),
      
      // Critical alerts count
      Alert.countDocuments({
        zoneId,
        status: { $in: ['ACTIVE', 'ACKNOWLEDGED'] },
        severity: { $in: ['CRITICAL', 'EMERGENCY'] },
      }),
      
      // Average depot performance (simplified calculation)
      this.getDepotPerformance({}, dataFilter, zoneId)
        .then(data => data.summary.avgPerformanceScore)
        .catch(() => 0),
    ]);
    
    // Calculate zone defect rate
    const zoneDefectRate = totalInspections > 0 
      ? (totalDefects / totalInspections) * 100 
      : 0;
    
    const stats = {
      totalDepots,
      totalInspections,
      totalDefects,
      zoneDefectRate: Math.round(zoneDefectRate * 100) / 100,
      avgDepotPerformance: avgPerformance,
      criticalAlertsCount: criticalAlerts,
      lastUpdated: new Date(),
    };
    
    // Cache for 15 minutes using CacheService.getDashboardTTL
    await CacheService.set(cacheKey, stats, CacheService.getDashboardTTL('ZONAL_MANAGER'));
    
    return stats;
  }
}

module.exports = new ZonalManagerService();
