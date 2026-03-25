const logger = require('../../utils/logger');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../utils/errors');
const TrackFitting = require('../qr/model');
const Inspection = require('../inspection/model');
const Defect = require('../defect/model');
const Inventory = require('../../models/Inventory.model');
const Report = require('../../models/Report.model');
const Alert = require('../../models/Alert.model');
const User = require('../auth/model');
const CacheService = require('../../services/cacheService');
const mongoose = require('mongoose');

/**
 * Depot Officer Service
 * Business logic for Depot Officer role operations
 */

class DepotOfficerService {
  // ==================== QR Management ====================
  
  /**
   * Generate QR codes in batch
   * @param {Object} data - Batch generation data
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Generated QR codes
   */
  async generateBatchQR(data, depotId) {
    logger.info('Generating batch QR codes', { data, depotId });
    
    const { fittingType, quantity, lotNumber, vendorCode, manufacturingDate, specifications } = data;
    
    // Validate batch size
    if (quantity > 1000) {
      throw new ValidationError('Batch size cannot exceed 1000 QR codes');
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const qrCodes = [];
      const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get vendor details
      const vendor = await User.findOne({ vendorCode, role: 'VENDOR' }).session(session);
      if (!vendor) {
        throw new NotFoundError('Vendor not found with provided vendorCode');
      }
      
      // Calculate warranty expiry (assuming 5 years warranty period)
      const warrantyPeriod = 5;
      const warrantyExpiry = new Date(manufacturingDate);
      warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + warrantyPeriod);
      
      // Extract zone from depotId (assuming format like "NR-DEPOT-01")
      const zoneCode = depotId.split('-')[0] || 'NR';
      const manufactureYear = new Date(manufacturingDate).getFullYear();
      
      // Generate QR codes
      for (let i = 0; i < quantity; i++) {
        const serialNumber = `${lotNumber}-${String(i + 1).padStart(6, '0')}`;
        const uniqueQRId = `${zoneCode}-${fittingType}-${manufactureYear}-${serialNumber}`;
        
        const qrCode = new TrackFitting({
          uniqueQRId,
          zoneCode,
          manufactureYear,
          itemType: fittingType,
          lotNumber,
          serialNumber,
          vendor: vendor._id,
          vendorCode,
          manufacturingDate,
          warrantyPeriod,
          warrantyExpiry,
          specifications: specifications || {},
          status: 'MANUFACTURED',
          location: {
            depot: depotId,
            zone: zoneCode,
          },
        });
        
        await qrCode.save({ session });
        qrCodes.push(qrCode);
      }
      
      await session.commitTransaction();
      
      logger.info('Batch QR generation successful', { batchId, quantity, depotId });
      
      // Invalidate cache for depot officer dashboard
      await CacheService.invalidateDepotCache(depotId);
      
      return {
        batchId,
        quantity: qrCodes.length,
        qrCodes: qrCodes.map(qr => ({
          uniqueQRId: qr.uniqueQRId,
          serialNumber: qr.serialNumber,
          status: qr.status,
        })),
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Batch QR generation failed, rolling back', { error: error.message, depotId });
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * List QR codes for the depot
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} QR codes and total count
   */
  async getQRCodes(filters, dataFilter, pagination) {
    logger.info('Getting QR codes for depot', { filters, dataFilter });
    
    const query = { 'location.depot': dataFilter.depotId };
    
    // Apply filters
    if (filters.fittingType) {
      query.itemType = filters.fittingType;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    const [qrCodes, total] = await Promise.all([
      TrackFitting.find(query)
        .populate('vendor', 'name vendorCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TrackFitting.countDocuments(query),
    ]);
    
    return { qrCodes, total };
  }

  /**
   * Export QR codes in specified format
   * @param {Object} filters - Export filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {string} format - Export format (CSV/PDF)
   * @returns {Promise<Object>} Export file URL
   */
  async exportQRCodes(filters, dataFilter, format) {
    logger.info('Exporting QR codes', { filters, dataFilter, format });
    
    const query = { 'location.depot': dataFilter.depotId };
    
    // Apply filters
    if (filters.fittingType) {
      query.itemType = filters.fittingType;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    
    // Limit export to 5000 QR codes
    const qrCodes = await TrackFitting.find(query)
      .populate('vendor', 'name vendorCode')
      .limit(5000)
      .lean();
    
    if (qrCodes.length === 0) {
      throw new NotFoundError('No QR codes found matching the criteria');
    }
    
    // Generate export file (simplified - in production, use a proper file generation service)
    const exportId = `EXPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileUrl = `/exports/${exportId}.${format.toLowerCase()}`;
    
    // In production, this would trigger an async job to generate the file
    logger.info('QR export initiated', { exportId, format, count: qrCodes.length });
    
    return {
      exportId,
      fileUrl,
      format,
      count: qrCodes.length,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  // ==================== Inspection Management ====================
  
  /**
   * List all inspections for the depot
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Inspections and total count
   */
  async getInspections(filters, dataFilter, pagination) {
    logger.info('Getting inspections for depot', { filters, dataFilter });
    
    // First, get all fittings for this depot
    const depotFittings = await TrackFitting.find({ 'location.depot': dataFilter.depotId }).select('_id').lean();
    const fittingIds = depotFittings.map(f => f._id);
    
    const query = { fitting: { $in: fittingIds } };
    
    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.inspector) {
      query.inspector = filters.inspector;
    }
    if (filters.startDate || filters.endDate) {
      query.inspectionDate = {};
      if (filters.startDate) query.inspectionDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.inspectionDate.$lte = new Date(filters.endDate);
    }
    
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    const [inspections, total] = await Promise.all([
      Inspection.find(query)
        .populate('fitting', 'uniqueQRId itemType status')
        .populate('inspector', 'name email')
        .sort({ inspectionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inspection.countDocuments(query),
    ]);
    
    return { inspections, total };
  }

  /**
   * List pending inspections awaiting approval
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Pending inspections and total count
   */
  async getPendingInspections(dataFilter, pagination) {
    logger.info('Getting pending inspections for depot', { dataFilter });
    
    // Get all fittings for this depot
    const depotFittings = await TrackFitting.find({ 'location.depot': dataFilter.depotId }).select('_id').lean();
    const fittingIds = depotFittings.map(f => f._id);
    
    const query = {
      fitting: { $in: fittingIds },
      status: 'PENDING',
    };
    
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    const [inspections, total] = await Promise.all([
      Inspection.find(query)
        .populate('fitting', 'uniqueQRId itemType status')
        .populate('inspector', 'name email')
        .sort({ inspectionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inspection.countDocuments(query),
    ]);
    
    return { inspections, total };
  }

  /**
   * Approve an inspection
   * @param {string} inspectionId - Inspection ID
   * @param {Object} data - Approval data
   * @param {string} userId - Depot Officer user ID
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Updated inspection
   */
  async approveInspection(inspectionId, data, userId, depotId) {
    logger.info('Approving inspection', { inspectionId, data, userId, depotId });
    
    const inspection = await Inspection.findById(inspectionId).populate('fitting');
    
    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }
    
    // Verify inspection belongs to depot officer's depot
    if (inspection.fitting.location.depot !== depotId) {
      throw new ForbiddenError('Cannot approve inspection from another depot');
    }
    
    if (inspection.status !== 'PENDING') {
      throw new ValidationError('Only pending inspections can be approved');
    }
    
    // Update inspection
    inspection.status = 'COMPLETED';
    inspection.approvedBy = userId;
    inspection.approvedAt = new Date();
    if (data.comments) {
      inspection.approvalComments = data.comments;
    }
    
    await inspection.save();
    
    // Invalidate cache
    await CacheService.invalidateDepotCache(depotId);
    // Also invalidate zone cache for zonal manager dashboards
    const zoneId = depotId.split('-')[0];
    if (zoneId) {
      await CacheService.invalidateZoneCache(zoneId);
    }
    
    logger.info('Inspection approved successfully', { inspectionId, userId });
    
    return inspection;
  }

  /**
   * Reject an inspection
   * @param {string} inspectionId - Inspection ID
   * @param {Object} data - Rejection data with reason
   * @param {string} userId - Depot Officer user ID
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Updated inspection
   */
  async rejectInspection(inspectionId, data, userId, depotId) {
    logger.info('Rejecting inspection', { inspectionId, data, userId, depotId });
    
    const inspection = await Inspection.findById(inspectionId).populate('fitting');
    
    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }
    
    // Verify inspection belongs to depot officer's depot
    if (inspection.fitting.location.depot !== depotId) {
      throw new ForbiddenError('Cannot reject inspection from another depot');
    }
    
    if (inspection.status !== 'PENDING') {
      throw new ValidationError('Only pending inspections can be rejected');
    }
    
    // Update inspection
    inspection.status = 'FAILED';
    inspection.rejectedBy = userId;
    inspection.rejectedAt = new Date();
    inspection.rejectionReason = data.reason;
    if (data.comments) {
      inspection.rejectionComments = data.comments;
    }
    
    await inspection.save();
    
    // Invalidate cache
    await CacheService.invalidateDepotCache(depotId);
    // Also invalidate zone cache for zonal manager dashboards
    const zoneId = depotId.split('-')[0];
    if (zoneId) {
      await CacheService.invalidateZoneCache(zoneId);
    }
    
    logger.info('Inspection rejected successfully', { inspectionId, userId });
    
    return inspection;
  }

  // ==================== Defect Management ====================
  
  /**
   * List all defects for the depot
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Defects and total count
   */
  async getDefects(filters, dataFilter, pagination) {
    logger.info('Getting defects for depot', { filters, dataFilter });
    
    const query = { depotId: dataFilter.depotId };
    
    // Apply filters
    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    const [defects, total] = await Promise.all([
      Defect.find(query)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('inspectionId', 'inspectionDate status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Defect.countDocuments(query),
    ]);
    
    return { defects, total };
  }

  /**
   * Assign a defect to a user
   * @param {string} defectId - Defect ID
   * @param {Object} data - Assignment data
   * @param {string} userId - Depot Officer user ID
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Updated defect
   */
  async assignDefect(defectId, data, userId, depotId) {
    logger.info('Assigning defect', { defectId, data, userId, depotId });
    
    const defect = await Defect.findById(defectId);
    
    if (!defect) {
      throw new NotFoundError('Defect not found');
    }
    
    // Verify defect belongs to depot officer's depot
    if (defect.depotId !== depotId) {
      throw new ForbiddenError('Cannot assign defect from another depot');
    }
    
    // Validate assignee belongs to same depot
    const assignee = await User.findById(data.assignedTo);
    if (!assignee) {
      throw new NotFoundError('Assignee user not found');
    }
    
    if (assignee.depotId !== depotId) {
      throw new ValidationError('Cannot assign defect to user from another depot');
    }
    
    // Update defect
    defect.status = 'ASSIGNED';
    defect.assignedTo = data.assignedTo;
    if (data.priority) {
      defect.severity = data.priority;
    }
    
    await defect.save();
    
    // Create alert for assignee
    const alert = new Alert({
      depotId,
      alertType: 'DEFECT_CRITICAL',
      severity: defect.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      message: `Defect ${defect.defectId} has been assigned to you`,
      metadata: {
        defectId: defect.defectId,
        defectSeverity: defect.severity,
        assignedBy: userId,
        comments: data.comments,
      },
      createdBy: userId,
    });
    
    await alert.save();
    
    // Invalidate cache
    await CacheService.invalidateDepotCache(depotId);
    // Also invalidate zone cache for zonal manager dashboards
    const zoneId = depotId.split('-')[0];
    if (zoneId) {
      await CacheService.invalidateZoneCache(zoneId);
    }
    
    logger.info('Defect assigned successfully', { defectId, assignedTo: data.assignedTo });
    
    return defect;
  }

  // ==================== Inventory Management ====================
  
  /**
   * List all inventory items for the depot
   * @param {Object} filters - Query filters
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} Inventory items and total count
   */
  async getInventory(filters, dataFilter, pagination) {
    logger.info('Getting inventory for depot', { filters, dataFilter });
    
    const query = { depotId: dataFilter.depotId };
    
    // Apply filters
    if (filters.fittingType) {
      query.fittingType = filters.fittingType;
    }
    if (filters.lowStock === 'true' || filters.lowStock === true) {
      query.$expr = { $lt: ['$quantity', '$minThreshold'] };
    }
    
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    const [inventory, total] = await Promise.all([
      Inventory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(query),
    ]);
    
    return { inventory, total };
  }

  /**
   * Add a new inventory item
   * @param {Object} data - Inventory item data
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Created inventory item
   */
  async createInventoryItem(data, depotId) {
    logger.info('Creating inventory item', { data, depotId });
    
    // Check if item already exists for this depot and fitting type
    const existing = await Inventory.findOne({
      depotId,
      fittingType: data.fittingType,
    });
    
    if (existing) {
      throw new ValidationError(`Inventory item for ${data.fittingType} already exists in this depot. Use update instead.`);
    }
    
    const item = new Inventory({
      ...data,
      depotId,
    });
    
    await item.save();
    
    // Invalidate cache
    await CacheService.invalidateDepotCache(depotId);
    
    logger.info('Inventory item created successfully', { itemId: item.itemId, depotId });
    
    return item;
  }

  /**
   * Update an inventory item
   * @param {string} itemId - Inventory item ID
   * @param {Object} data - Update data
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Updated inventory item
   */
  async updateInventoryItem(itemId, data, depotId) {
    logger.info('Updating inventory item', { itemId, data, depotId });
    
    const item = await Inventory.findOne({ _id: itemId, depotId });
    
    if (!item) {
      throw new NotFoundError('Inventory item not found or does not belong to your depot');
    }
    
    // Store old quantity for threshold checking
    const oldQuantity = item.quantity;
    
    // Update fields
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.minThreshold !== undefined) item.minThreshold = data.minThreshold;
    if (data.maxThreshold !== undefined) item.maxThreshold = data.maxThreshold;
    if (data.location !== undefined) item.location = data.location;
    if (data.lastRestocked !== undefined) item.lastRestocked = data.lastRestocked;
    
    await item.save();
    
    // Check if we need to resolve low inventory alert
    if (oldQuantity < item.minThreshold && item.quantity >= item.minThreshold) {
      await Alert.updateMany(
        {
          depotId,
          alertType: 'INVENTORY_LOW',
          status: 'ACTIVE',
          'metadata.itemId': item.itemId,
        },
        {
          status: 'RESOLVED',
        }
      );
    }
    
    // Invalidate cache
    await CacheService.invalidateDepotCache(depotId);
    
    logger.info('Inventory item updated successfully', { itemId, depotId });
    
    return item;
  }

  /**
   * Remove an inventory item
   * @param {string} itemId - Inventory item ID
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<void>}
   */
  async deleteInventoryItem(itemId, depotId) {
    logger.info('Deleting inventory item', { itemId, depotId });
    
    const item = await Inventory.findOne({ _id: itemId, depotId });
    
    if (!item) {
      throw new NotFoundError('Inventory item not found or does not belong to your depot');
    }
    
    await item.deleteOne();
    
    // Invalidate cache
    await CacheService.invalidateDepotCache(depotId);
    
    logger.info('Inventory item deleted successfully', { itemId, depotId });
  }

  // ==================== Reporting ====================
  
  /**
   * Generate a report
   * @param {Object} data - Report generation data
   * @param {string} userId - Depot Officer user ID
   * @param {string} depotId - Depot Officer's depot ID
   * @returns {Promise<Object>} Generated report
   */
  async generateReport(data, userId, depotId) {
    logger.info('Generating report', { data, userId, depotId });
    
    const { reportType, format, filters } = data;
    
    // Create report record with PENDING status
    const report = new Report({
      generatedBy: userId,
      role: 'DEPOT_OFFICER',
      reportType,
      format: format || 'PDF',
      filters: {
        ...filters,
        depotId, // Always include depotId in filters
      },
      status: 'PENDING',
    });
    
    await report.save();
    
    // In production, this would queue a background job for report generation
    // For now, we'll simulate immediate completion
    try {
      let reportData = {};
      
      // Generate report data based on type
      switch (reportType) {
        case 'INSPECTION_SUMMARY':
          reportData = await this._generateInspectionSummary(depotId, filters);
          break;
        case 'DEFECT_ANALYSIS':
          reportData = await this._generateDefectAnalysis(depotId, filters);
          break;
        case 'INVENTORY_STATUS':
          reportData = await this._generateInventoryStatus(depotId, filters);
          break;
        default:
          throw new ValidationError('Invalid report type');
      }
      
      // Update report with data and mark as completed
      report.data = reportData;
      report.status = 'COMPLETED';
      report.fileUrl = `/reports/${report.reportId}.${format.toLowerCase()}`;
      await report.save();
      
      logger.info('Report generated successfully', { reportId: report.reportId, reportType });
    } catch (error) {
      report.status = 'FAILED';
      report.errorMessage = error.message;
      await report.save();
      logger.error('Report generation failed', { reportId: report.reportId, error: error.message });
    }
    
    return report;
  }

  /**
   * List generated reports for the depot
   * @param {Object} filters - Query filters
   * @param {Object} pagination - Pagination params
   * @param {string} userId - Depot Officer user ID
   * @returns {Promise<Object>} Reports and total count
   */
  async getReports(filters, pagination, userId) {
    logger.info('Getting reports for depot officer', { filters, userId });
    
    const query = { generatedBy: userId };
    
    // Apply filters
    if (filters.reportType) {
      query.reportType = filters.reportType;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }
    
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    
    const [reports, total] = await Promise.all([
      Report.find(query)
        .select('-data') // Exclude large data field from list
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);
    
    return { reports, total };
  }

  // ==================== Dashboard ====================
  
  /**
   * Get dashboard statistics for the depot
   * @param {string} depotId - Depot Officer's depot ID
   * @param {Object} dataFilter - Automatic depot filter from middleware
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(userId, depotId, dataFilter) {
    logger.info('Getting dashboard stats for depot officer', { userId, depotId, dataFilter });
    
    // Check cache first
    const cacheKey = `dashboard:stats:DEPOT_OFFICER:${userId}:${depotId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      logger.info('Returning cached dashboard stats', { userId, depotId });
      return cached;
    }
    
    // Get all fittings for this depot
    const depotFittings = await TrackFitting.find({ 'location.depot': depotId }).select('_id').lean();
    const fittingIds = depotFittings.map(f => f._id);
    
    // Aggregate statistics using MongoDB aggregation pipelines
    const [
      totalInspections,
      pendingApprovals,
      activeDefects,
      inventoryAlerts,
      inspectorCount,
      lowStockItems,
    ] = await Promise.all([
      // Total inspections
      Inspection.countDocuments({ fitting: { $in: fittingIds } }),
      
      // Pending approvals
      Inspection.countDocuments({ fitting: { $in: fittingIds }, status: 'PENDING' }),
      
      // Active defects
      Defect.countDocuments({ depotId, status: { $in: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'] } }),
      
      // Inventory alerts
      Alert.countDocuments({ depotId, alertType: 'INVENTORY_LOW', status: 'ACTIVE' }),
      
      // Inspector count
      User.countDocuments({ depotId, role: 'INSPECTOR', isActive: true }),
      
      // Low stock items
      Inventory.countDocuments({ depotId, $expr: { $lt: ['$quantity', '$minThreshold'] } }),
    ]);
    
    const stats = {
      totalInspections,
      pendingApprovals,
      activeDefects,
      inventoryAlerts,
      inspectorCount,
      lowStockItems,
      timestamp: new Date(),
    };
    
    // Cache for 10 minutes using getDashboardTTL
    const ttl = CacheService.getDashboardTTL('DEPOT_OFFICER');
    await CacheService.set(cacheKey, stats, ttl);
    
    logger.info('Dashboard stats calculated and cached', { userId, depotId });
    
    return stats;
  }

  // ==================== Private Helper Methods ====================
  
  async _generateInspectionSummary(depotId, filters) {
    const depotFittings = await TrackFitting.find({ 'location.depot': depotId }).select('_id').lean();
    const fittingIds = depotFittings.map(f => f._id);
    
    const query = { fitting: { $in: fittingIds } };
    if (filters?.startDate) query.inspectionDate = { $gte: new Date(filters.startDate) };
    if (filters?.endDate) query.inspectionDate = { ...query.inspectionDate, $lte: new Date(filters.endDate) };
    
    const inspections = await Inspection.find(query)
      .populate('fitting', 'uniqueQRId itemType')
      .populate('inspector', 'name')
      .lean();
    
    return {
      totalInspections: inspections.length,
      byStatus: inspections.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      }, {}),
      byResult: inspections.reduce((acc, i) => {
        acc[i.overallResult] = (acc[i.overallResult] || 0) + 1;
        return acc;
      }, {}),
      inspections: inspections.slice(0, 100), // Limit to 100 for report
    };
  }
  
  async _generateDefectAnalysis(depotId, filters) {
    const query = { depotId };
    if (filters?.startDate) query.createdAt = { $gte: new Date(filters.startDate) };
    if (filters?.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
    
    const defects = await Defect.find(query)
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .lean();
    
    return {
      totalDefects: defects.length,
      bySeverity: defects.reduce((acc, d) => {
        acc[d.severity] = (acc[d.severity] || 0) + 1;
        return acc;
      }, {}),
      byStatus: defects.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {}),
      byFittingType: defects.reduce((acc, d) => {
        acc[d.fittingType] = (acc[d.fittingType] || 0) + 1;
        return acc;
      }, {}),
      defects: defects.slice(0, 100), // Limit to 100 for report
    };
  }
  
  async _generateInventoryStatus(depotId, filters) {
    const query = { depotId };
    if (filters?.fittingType) query.fittingType = filters.fittingType;
    
    const inventory = await Inventory.find(query).lean();
    
    return {
      totalItems: inventory.length,
      lowStockItems: inventory.filter(i => i.quantity < i.minThreshold).length,
      overStockItems: inventory.filter(i => i.quantity > i.maxThreshold).length,
      byFittingType: inventory.reduce((acc, i) => {
        if (!acc[i.fittingType]) {
          acc[i.fittingType] = { quantity: 0, items: 0 };
        }
        acc[i.fittingType].quantity += i.quantity;
        acc[i.fittingType].items += 1;
        return acc;
      }, {}),
      inventory,
    };
  }
}

module.exports = new DepotOfficerService();
