const inspectionRepository = require('./repository');
const qrRepository = require('../qr/repository');
const { NotFoundError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const AuditService = require('../audit/service');
const { extractYearFromDate } = require('../../utils/shardingHelper');
const { eventBus, EVENTS } = require('../../utils/eventBus');
const { broadcastToRoles, broadcastToZone } = require('../../config/socket');

class InspectionService {
  async create(inspectionData, inspectorId) {
    const fitting = await qrRepository.findById(inspectionData.fittingId);
    if (!fitting) {
      throw new NotFoundError('Fitting not found');
    }

    // Extract zoneCode from fitting and inspectionYear from date
    const inspectionDate = inspectionData.inspectionDate || new Date();
    const inspectionYear = extractYearFromDate(inspectionDate);

    const inspection = await inspectionRepository.create({
      ...inspectionData,
      fitting: inspectionData.fittingId,
      inspector: inspectorId,
      zoneCode: fitting.zoneCode,
      inspectionYear,
      inspectionDate,
    });

    await qrRepository.updateFitting(inspectionData.fittingId, {
      lastInspectionDate: inspectionDate,
      $inc: { inspectionCount: 1 },
    });

    if (inspectionData.overallResult === 'FAIL') {
      await qrRepository.updateFitting(inspectionData.fittingId, {
        status: 'DEFECTIVE',
        $inc: { defectCount: 1 },
      });
    }

    await AuditService.log({
      action: 'INSPECTION_CREATED',
      userId: inspectorId,
      resourceId: inspection._id,
      details: {
        fittingId: inspectionData.fittingId,
        zoneCode: fitting.zoneCode,
        result: inspectionData.overallResult,
      },
    });

    // Emit event for real-time updates across all roles
    eventBus.emitToRoles(EVENTS.INSPECTION_CREATED, {
      inspectionId: inspection._id,
      fittingId: inspectionData.fittingId,
      zoneCode: fitting.zoneCode,
      result: inspectionData.overallResult,
      inspectorId,
      timestamp: inspectionDate,
      inspection,
    }, ['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'INSPECTOR']);

    logger.info('Inspection created:', {
      inspectionId: inspection._id,
      fittingId: inspectionData.fittingId,
      zoneCode: fitting.zoneCode,
      result: inspectionData.overallResult,
    });

    return inspection;
  }

  async getById(id) {
    const inspection = await inspectionRepository.findById(id);
    if (!inspection) {
      throw new NotFoundError('Inspection not found');
    }
    return inspection;
  }

  async getByFitting(fittingId, pagination) {
    // Get fitting to extract zoneCode
    const fitting = await qrRepository.findById(fittingId);
    if (!fitting) {
      throw new NotFoundError('Fitting not found');
    }

    const inspections = await inspectionRepository.findByFitting(fitting.zoneCode, fittingId, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await inspectionRepository.count({ zoneCode: fitting.zoneCode, fitting: fittingId });
    return { inspections, total };
  }

  async getByInspector(inspectorId, zoneCode, pagination) {
    const inspections = await inspectionRepository.findByInspector(zoneCode, inspectorId, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await inspectionRepository.count({ zoneCode, inspector: inspectorId });
    return { inspections, total };
  }

  async update(id, updateData, userId) {
    const inspection = await this.getById(id);
    const updated = await inspectionRepository.update(id, updateData);

    // Emit update event for real-time synchronization
    eventBus.emitToRoles(EVENTS.INSPECTION_UPDATED, {
      inspectionId: id,
      updates: updateData,
      zoneCode: inspection.zoneCode,
      previousStatus: inspection.overallResult,
      newStatus: updateData.overallResult,
      userId,
      timestamp: new Date(),
    }, ['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'INSPECTOR']);

    await AuditService.log({
      action: 'INSPECTION_UPDATED',
      userId,
      resourceId: id,
      details: { updates: Object.keys(updateData) },
    });

    return updated;
  }

  async getFailedInspections(zoneCode, pagination) {
    const inspections = await inspectionRepository.findFailedInspections(zoneCode, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await inspectionRepository.count({ zoneCode, overallResult: 'FAIL' });
    return { inspections, total };
  }
}

module.exports = new InspectionService();
