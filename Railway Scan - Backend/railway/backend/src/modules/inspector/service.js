const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const Inspection = require('../inspection/model');
const TrackFitting = require('../qr/model');
const Defect = require('../defect/model');
const CacheService = require('../../services/cacheService');
const ImageService = require('../../services/imageService');

/**
 * Inspector Service
 * Business logic for Inspector role operations
 */

class InspectorService {
  /**
   * Get inspections assigned to the inspector
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @param {string} userId - Inspector user ID
   * @returns {Promise<Object>} Inspections and total count
   */
  async getInspections(filters, dataFilter, pagination, userId) {
    logger.info('Getting inspections for inspector', { filters, dataFilter, userId });
    
    // Build query - filter by inspector ID (inspections are assigned to specific inspectors)
    // The dataFilter contains depotId but Inspection model doesn't have depotId field
    // Instead, we filter by inspector to ensure they only see their own inspections
    const query = { inspector: userId };
    
    // Add status filter if provided
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Add date range filters if provided
    if (filters.startDate || filters.endDate) {
      query.inspectionDate = {};
      if (filters.startDate) {
        query.inspectionDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.inspectionDate.$lte = new Date(filters.endDate);
      }
    }
    
    // Execute query with pagination
    const [inspections, total] = await Promise.all([
      Inspection.find(query)
        .populate('fitting', 'uniqueQRId itemType status')
        .populate('inspector', 'name email')
        .sort({ inspectionDate: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Inspection.countDocuments(query),
    ]);
    
    // Convert Buffer images to base64 for response
    const inspectionsWithImages = inspections.map(inspection => {
      if (inspection.images && inspection.images.length > 0) {
        inspection.images = inspection.images.map(img => {
          if (img.data && img.data.buffer) {
            return `data:${img.contentType};base64,${img.data.buffer.toString('base64')}`;
          }
          return null;
        }).filter(img => img !== null);
      }
      return inspection;
    });
    
    return {
      inspections: inspectionsWithImages,
      total,
    };
  }

  /**
   * Get a single inspection by ID for the authenticated inspector
   * @param {string} inspectionId - Inspection ID
   * @param {string} userId - Inspector user ID
   * @returns {Promise<Object>} Inspection
   */
  async getInspectionById(inspectionId, userId) {
    logger.info('Getting inspection by id for inspector', { inspectionId, userId });

    const inspection = await Inspection.findById(inspectionId)
      .populate('fitting', 'uniqueQRId itemType status')
      .populate('inspector', 'name email')
      .lean();

    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }

    if (inspection.inspector?._id?.toString() !== userId) {
      throw new ForbiddenError('Cannot access inspection assigned to another inspector');
    }

    if (inspection.images && inspection.images.length > 0) {
      inspection.images = inspection.images.map(img => {
        if (img.data && img.data.buffer) {
          return `data:${img.contentType};base64,${img.data.buffer.toString('base64')}`;
        }
        return null;
      }).filter(img => img !== null);
    }

    return inspection;
  }

  /**
   * Start a new inspection
   * @param {Object} data - Inspection data
   * @param {string} userId - Inspector user ID
   * @param {string} depotId - Inspector's depot ID
   * @returns {Promise<Object>} Created inspection
   */
  async createInspection(data, userId, depotId) {
    logger.info('Creating inspection', { data, userId, depotId });
    
    let fitting = null;
    let inspectionData = {
      inspector: userId,
      inspectionDate: data.scheduledDate || new Date(),
      status: data.status || 'PENDING',
      overallResult: 'PASS', // Default, will be updated on submission
    };

    // Handle QR-based inspection (existing flow)
    if (data.qrId) {
      fitting = await TrackFitting.findOne({ uniqueQRId: data.qrId });
      
      if (!fitting) {
        throw new NotFoundError('QR code not found');
      }
      
      inspectionData.zoneCode = fitting.zoneCode;
      inspectionData.inspectionYear = new Date().getFullYear();
      inspectionData.fitting = fitting._id;
    } 
    // Handle simple asset-based inspection (new flow)
    else if (data.assetId) {
      inspectionData.assetId = data.assetId;
      inspectionData.assetType = data.assetType;
      inspectionData.location = data.location;
      inspectionData.notes = data.notes;
      inspectionData.zoneCode = 'GENERAL'; // Default zone
      inspectionData.inspectionYear = new Date().getFullYear();
      
      if (data.coordinates) {
        inspectionData.coordinates = data.coordinates;
      }

      // Handle images with optimization
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        try {
          inspectionData.images = await ImageService.processAndStoreImages(data.images, {
            maxSize: 512 * 1024, // 512KB threshold for GridFS
            quality: 80,
            format: 'jpeg',
            resize: { width: 1024, height: 1024 }
          });
          logger.info('Images processed and stored:', { 
            count: inspectionData.images.length,
            totalSize: inspectionData.images.reduce((sum, img) => sum + img.size, 0)
          });
        } catch (error) {
          logger.error('Failed to process images:', error);
          // Fallback to legacy Buffer storage
          inspectionData.images = data.images.map(base64Image => {
            const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              return {
                data: Buffer.from(matches[2], 'base64'),
                contentType: matches[1]
              };
            }
            return null;
          }).filter(img => img !== null);
        }
      }
    } else {
      throw new ValidationError('Either qrId or assetId must be provided');
    }
    
    // Create inspection
    const inspection = await Inspection.create(inspectionData);
    
    // Populate and return
    const populatedInspection = await Inspection.findById(inspection._id)
      .populate('fitting', 'uniqueQRId itemType status')
      .populate('inspector', 'name email')
      .lean();

    if (populatedInspection.images && populatedInspection.images.length > 0) {
      populatedInspection.images = populatedInspection.images.map(img => {
        if (img.data && img.data.buffer) {
          return `data:${img.contentType};base64,${img.data.buffer.toString('base64')}`;
        }
        return null;
      }).filter(img => img !== null);
    }
    
    // Convert images to base64 for response (handle both Buffer and optimized formats)
    if (populatedInspection.images && populatedInspection.images.length > 0) {
      populatedInspection.images = await Promise.all(
        populatedInspection.images.map(async (img) => {
          try {
            if (img.type === 'buffer' && img.data) {
              return `data:${img.contentType};base64,${img.data.toString('base64')}`;
            } else if (img.type === 'gridfs') {
              return await ImageService.retrieveImage(img);
            } else if (img.data && img.data.buffer) {
              // Legacy Buffer format
              return `data:${img.contentType};base64,${img.data.buffer.toString('base64')}`;
            }
            return null;
          } catch (error) {
            logger.error('Failed to retrieve image:', error);
            return null;
          }
        })
      );
      populatedInspection.images = populatedInspection.images.filter(img => img !== null);
    }
    
    // Invalidate cache for inspector and depot officer dashboards
    await CacheService.invalidateDepotCache(depotId);
    // Also invalidate zone cache for zonal manager dashboards
    const zoneId = depotId.split('-')[0];
    if (zoneId) {
      await CacheService.invalidateZoneCache(zoneId);
    }
    
    return populatedInspection;
  }

  /**
   * Submit inspection results
   * @param {string} inspectionId - Inspection ID
   * @param {Object} data - Inspection results
   * @param {string} userId - Inspector user ID
   * @returns {Promise<Object>} Updated inspection
   */
  async submitInspection(inspectionId, data, userId) {
    logger.info('Submitting inspection', { inspectionId, data, userId });
    
    // Find inspection and populate fitting to get depot info
    const inspection = await Inspection.findById(inspectionId).populate('fitting');
    
    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }
    
    // Verify inspector owns this inspection
    if (inspection.inspector.toString() !== userId) {
      throw new ForbiddenError('Cannot submit inspection assigned to another inspector');
    }
    
    // Store depot and zone for cache invalidation
    const depotId = inspection.fitting?.location?.depot;
    const zoneId = inspection.zoneCode;
    
    // Update inspection with results
    inspection.status = data.status;
    inspection.assetId = data.assetId || inspection.assetId;
    inspection.assetType = data.assetType || inspection.assetType;
    inspection.location = data.location || inspection.location;
    inspection.notes = data.notes || inspection.notes;
    inspection.findings = data.findings || inspection.findings;
    inspection.defectsFound = data.defectsFound || inspection.defectsFound;
    inspection.overallResult = data.overallResult || inspection.overallResult;
    inspection.recommendations = data.recommendations || inspection.recommendations;
    inspection.nextInspectionDate = data.nextInspectionDate || inspection.nextInspectionDate;
    if (data.images && Array.isArray(data.images)) {
      try {
        inspection.images = await ImageService.processAndStoreImages(data.images, {
          maxSize: 512 * 1024, // 512KB threshold for GridFS
          quality: 80,
          format: 'jpeg',
          resize: { width: 1024, height: 1024 }
        });
        logger.info('Images processed and stored for inspection update:', { 
          inspectionId,
          count: inspection.images.length
        });
      } catch (error) {
        logger.error('Failed to process images for update:', error);
        // Fallback to legacy Buffer storage
        inspection.images = data.images.map(base64Image => {
          const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            return {
              data: Buffer.from(matches[2], 'base64'),
              contentType: matches[1],
            };
          }
          return null;
        }).filter(img => img !== null);
      }
    }
    inspection.signature = data.signature || inspection.signature;
    
    await inspection.save();
    
    // Populate and return
    const populatedInspection = await Inspection.findById(inspection._id)
      .populate('fitting', 'uniqueQRId itemType status')
      .populate('inspector', 'name email')
      .lean();
    
    // Invalidate cache for inspector and depot officer dashboards
    if (depotId) {
      await CacheService.invalidateDepotCache(depotId);
    }
    // Also invalidate zone cache for zonal manager dashboards
    if (zoneId) {
      await CacheService.invalidateZoneCache(zoneId);
    }
    
    return populatedInspection;
  }

  /**
   * Delete inspection
   * @param {string} inspectionId - Inspection ID
   * @param {string} userId - Inspector user ID
   * @returns {Promise<void>}
   */
  async deleteInspection(inspectionId, userId) {
    logger.info('Deleting inspection', { inspectionId, userId });
    
    // Find inspection
    const inspection = await Inspection.findById(inspectionId);
    
    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }
    
    // Verify inspector owns this inspection
    if (inspection.inspector.toString() !== userId) {
      throw new ForbiddenError('Cannot delete inspection assigned to another inspector');
    }
    
    // Delete the inspection
    await Inspection.findByIdAndDelete(inspectionId);
    
    logger.info('Inspection deleted successfully', { inspectionId });
  }

  /**
   * Get tasks assigned to the inspector
   * @param {string} userId - Inspector user ID
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @returns {Promise<Array>} Assigned tasks
   */
  async getTasks(userId, dataFilter) {
    logger.info('Getting tasks for inspector', { userId, dataFilter });
    
    // Get pending inspections assigned to this inspector
    const pendingInspections = await Inspection.find({
      inspector: userId,
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    })
      .populate('fitting', 'uniqueQRId itemType status')
      .sort({ inspectionDate: 1 })
      .limit(20)
      .lean();
    
    // Get defects assigned to this inspector
    const assignedDefects = await Defect.find({
      assignedTo: userId,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
    })
      .populate('inspectionId', 'inspectionDate')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    // Format tasks
    const tasks = {
      pendingInspections: pendingInspections.map(inspection => ({
        id: inspection._id,
        type: 'INSPECTION',
        qrId: inspection.fitting?.uniqueQRId,
        fittingType: inspection.fitting?.itemType,
        scheduledDate: inspection.inspectionDate,
        status: inspection.status,
        priority: inspection.status === 'IN_PROGRESS' ? 'HIGH' : 'MEDIUM',
      })),
      assignedDefects: assignedDefects.map(defect => ({
        id: defect._id,
        defectId: defect.defectId,
        type: 'DEFECT',
        fittingType: defect.fittingType,
        severity: defect.severity,
        description: defect.description,
        status: defect.status,
        reportedAt: defect.createdAt,
        priority: defect.severity === 'CRITICAL' ? 'CRITICAL' : defect.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
      })),
      summary: {
        totalPendingInspections: pendingInspections.length,
        totalAssignedDefects: assignedDefects.length,
        totalTasks: pendingInspections.length + assignedDefects.length,
      },
    };
    
    return tasks;
  }

  /**
   * Submit a defect report
   * @param {Object} data - Defect data
   * @param {string} userId - Inspector user ID
   * @param {string} depotId - Inspector's depot ID
   * @returns {Promise<Object>} Created defect
   */
  async createDefect(data, userId, depotId) {
    logger.info('Creating defect', { data, userId, depotId });
    
    // Validate that the inspection exists
    const inspection = await Inspection.findById(data.inspectionId);
    
    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }
    
    // Verify inspector owns this inspection
    if (inspection.inspector.toString() !== userId) {
      throw new ForbiddenError('Cannot create defect for inspection assigned to another inspector');
    }
    
    // Create defect with status REPORTED
    const defect = await Defect.create({
      inspectionId: data.inspectionId,
      reportedBy: userId,
      depotId,
      fittingType: data.fittingType,
      severity: data.severity,
      description: data.description,
      images: data.images || [],
      status: 'REPORTED',
    });
    
    // Populate and return
    const populatedDefect = await Defect.findById(defect._id)
      .populate('reportedBy', 'name email')
      .populate('inspectionId', 'inspectionDate fitting')
      .lean();
    
    // Invalidate cache for all dashboards in the affected depot
    await CacheService.invalidateDepotCache(depotId);
    // Also invalidate zone cache for zonal manager dashboards
    const zoneId = depotId.split('-')[0];
    if (zoneId) {
      await CacheService.invalidateZoneCache(zoneId);
    }
    
    return populatedDefect;
  }

  /**
   * Get defects reported by the inspector
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @param {string} userId - Inspector user ID
   * @returns {Promise<Object>} Defects and total count
   */
  async getDefects(filters, dataFilter, pagination, userId) {
    logger.info('Getting defects for inspector', { filters, dataFilter, userId });
    
    // Build query - filter by reportedBy to show only inspector's defects
    const query = {
      reportedBy: userId,
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
    
    // Add date range filters if provided
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    // Execute query with pagination
    const [defects, total] = await Promise.all([
      Defect.find(query)
        .populate('reportedBy', 'name email')
        .populate('inspectionId', 'inspectionDate fitting')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Defect.countDocuments(query),
    ]);
    
    return {
      defects,
      total,
    };
  }

  /**
   * Get dashboard statistics for the inspector
   * @param {string} userId - Inspector user ID
   * @param {string} depotId - Inspector's depot ID
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(userId, depotId, dataFilter) {
    logger.info('Getting dashboard stats for inspector', { userId, depotId, dataFilter });
    
    // Generate cache key: dashboard:stats:INSPECTOR:${userId}:${depotId}
    const cacheKey = `dashboard:stats:INSPECTOR:${userId}:${depotId}`;
    
    // Check cache first
    const cachedStats = await CacheService.get(cacheKey);
    
    if (cachedStats) {
      logger.debug('Returning cached dashboard stats', { userId, depotId });
      return cachedStats;
    }
    
    // Cache miss - query database
    logger.debug('Cache miss - querying database for dashboard stats', { userId, depotId });
    
    // Calculate start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    // Run aggregations in parallel for performance
    const [
      inspectionsCompletedToday,
      pendingTasks,
      defectsReportedToday,
      totalQRScanned,
    ] = await Promise.all([
      // Inspections completed today by this inspector
      Inspection.countDocuments({
        inspector: userId,
        status: { $in: ['COMPLETED', 'APPROVED'] },
        updatedAt: { $gte: startOfToday },
      }),
      
      // Pending tasks (pending inspections + assigned defects)
      Promise.all([
        Inspection.countDocuments({
          inspector: userId,
          status: { $in: ['PENDING', 'IN_PROGRESS'] },
        }),
        Defect.countDocuments({
          assignedTo: userId,
          status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
        }),
      ]).then(([pendingInspections, assignedDefects]) => pendingInspections + assignedDefects),
      
      // Defects reported today by this inspector
      Defect.countDocuments({
        reportedBy: userId,
        createdAt: { $gte: startOfToday },
      }),
      
      // Total QR codes scanned (inspections created today)
      Inspection.countDocuments({
        inspector: userId,
        createdAt: { $gte: startOfToday },
      }),
    ]);
    
    const stats = {
      inspectionsCompletedToday,
      pendingTasks,
      defectsReported: defectsReportedToday,
      qrCodesScanned: totalQRScanned,
      lastUpdated: new Date(),
    };
    
    // Cache result with 5-minute TTL
    const ttl = CacheService.getDashboardTTL('INSPECTOR');
    await CacheService.set(cacheKey, stats, ttl);
    
    return stats;
  }

  /**
   * Scan and validate QR code
   * @param {string} qrId - QR code ID
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @returns {Promise<Object>} QR code details and validation result
   */
  async scanQR(qrId, dataFilter) {
    logger.info('Scanning QR code', { qrId, dataFilter });
    
    // Find the track fitting by QR ID
    const fitting = await TrackFitting.findOne({ uniqueQRId: qrId })
      .populate('vendor', 'name vendorCode contactInfo')
      .lean();
    
    if (!fitting) {
      throw new NotFoundError('QR code not found');
    }
    
    // Apply data filtering - check if fitting belongs to inspector's depot
    if (dataFilter.depotId && fitting.location?.depot !== dataFilter.depotId) {
      throw new ForbiddenError('QR code does not belong to your assigned depot');
    }
    
    // Check if fitting is recalled
    if (fitting.isRecalled) {
      logger.warn('Scanned QR code is recalled', { qrId, recallReason: fitting.recallReason });
    }
    
    // Check warranty status
    const isWarrantyValid = fitting.warrantyExpiry && new Date(fitting.warrantyExpiry) > new Date();
    
    // Get last inspection details
    const lastInspection = await Inspection.findOne({ fitting: fitting._id })
      .sort({ inspectionDate: -1 })
      .populate('inspector', 'name email')
      .lean();
    
    // Get recent defects for this fitting
    const recentDefects = await Defect.find({ inspectionId: { $in: await Inspection.find({ fitting: fitting._id }).distinct('_id') } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('defectId severity status description createdAt')
      .lean();
    
    // Build response with fitting details
    const result = {
      valid: true,
      qrId: fitting.uniqueQRId,
      fittingDetails: {
        id: fitting._id,
        itemType: fitting.itemType,
        lotNumber: fitting.lotNumber,
        serialNumber: fitting.serialNumber,
        status: fitting.status,
        vendor: {
          name: fitting.vendor?.name,
          code: fitting.vendorCode,
          contact: fitting.vendor?.contactInfo,
        },
        manufacturing: {
          date: fitting.manufacturingDate,
          year: fitting.manufactureYear,
        },
        warranty: {
          period: fitting.warrantyPeriod,
          expiry: fitting.warrantyExpiry,
          isValid: isWarrantyValid,
        },
        location: fitting.location,
        specifications: fitting.specifications,
        installationDate: fitting.installationDate,
        inspectionHistory: {
          lastInspectionDate: fitting.lastInspectionDate,
          totalInspections: fitting.inspectionCount,
          lastInspection: lastInspection ? {
            date: lastInspection.inspectionDate,
            result: lastInspection.overallResult,
            inspector: lastInspection.inspector?.name,
            status: lastInspection.status,
          } : null,
        },
        defectHistory: {
          totalDefects: fitting.defectCount,
          recentDefects,
        },
        riskScore: fitting.riskScore,
        isRecalled: fitting.isRecalled,
        recallReason: fitting.recallReason,
        recallDate: fitting.recallDate,
      },
      warnings: [],
    };
    
    // Add warnings if applicable
    if (fitting.isRecalled) {
      result.warnings.push({
        type: 'RECALL',
        message: `This fitting has been recalled: ${fitting.recallReason}`,
        severity: 'CRITICAL',
      });
    }
    
    if (!isWarrantyValid) {
      result.warnings.push({
        type: 'WARRANTY_EXPIRED',
        message: 'Warranty has expired',
        severity: 'WARNING',
      });
    }
    
    if (fitting.riskScore > 70) {
      result.warnings.push({
        type: 'HIGH_RISK',
        message: `High risk score: ${fitting.riskScore}`,
        severity: 'HIGH',
      });
    }
    
    if (fitting.status === 'DECOMMISSIONED' || fitting.status === 'FAILED') {
      result.warnings.push({
        type: 'STATUS_WARNING',
        message: `Fitting status: ${fitting.status}`,
        severity: 'WARNING',
      });
    }
    
    return result;
  }
}

module.exports = new InspectorService();
