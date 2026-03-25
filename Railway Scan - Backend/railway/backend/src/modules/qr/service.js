const qrRepository = require('./repository');
const vendorRepository = require('../vendor/repository');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const config = require('../../config');
const AuditService = require('../audit/service');
const { validateZoneCode, extractYearFromDate } = require('../../utils/shardingHelper');

class QRService {
  generateQRId(itemType, year, lotNumber, serialNumber) {
    const paddedSerial = String(serialNumber).padStart(6, '0');
    return `IR-${itemType}-${year}-${lotNumber}-${paddedSerial}`;
  }

  async generateBatch(batchData, userId) {
    const { itemType, lotNumber, quantity, vendorId, manufacturingDate, warrantyPeriod, specifications, zoneCode } = batchData;
    
    // Validate zone code
    const validatedZone = validateZoneCode(zoneCode);
    
    if (quantity > config.qr.batchMaxSize) {
      throw new ValidationError(`Batch size cannot exceed ${config.qr.batchMaxSize}`);
    }
    
    const vendor = await vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    
    const year = new Date().getFullYear();
    const manufactureYear = extractYearFromDate(manufacturingDate);
    const fittings = [];
    const warrantyExpiryDate = new Date(manufacturingDate);
    warrantyExpiryDate.setMonth(warrantyExpiryDate.getMonth() + warrantyPeriod);
    
    try {
      for (let i = 0; i < quantity; i++) {
        const serialNumber = await qrRepository.getNextSerialNumber(validatedZone, lotNumber, itemType, year);
        const uniqueQRId = this.generateQRId(itemType, year, lotNumber, serialNumber);
        
        fittings.push({
          uniqueQRId,
          itemType,
          lotNumber,
          serialNumber: String(serialNumber).padStart(6, '0'),
          vendor: vendorId,
          vendorCode: vendor.vendorCode,
          manufacturingDate,
          manufactureYear,
          warrantyPeriod,
          warrantyExpiry: warrantyExpiryDate,
          specifications: specifications || {},
          status: 'MANUFACTURED',
          zoneCode: validatedZone,
        });
      }
      
      const createdFittings = await qrRepository.createFittingsBulk(fittings);
      
      await AuditService.log({
        action: 'QR_BATCH_GENERATED',
        userId,
        details: {
          itemType,
          lotNumber,
          quantity,
          vendorId,
          zoneCode: validatedZone,
          firstQR: fittings[0].uniqueQRId,
          lastQR: fittings[fittings.length - 1].uniqueQRId,
        },
      });
      
      logger.info('QR batch generated:', {
        userId,
        quantity,
        lotNumber,
        itemType,
        zoneCode: validatedZone,
      });
      
      return {
        generated: createdFittings.length,
        lotNumber,
        itemType,
        zoneCode: validatedZone,
        qrCodes: createdFittings.map(f => f.uniqueQRId),
      };
    } catch (error) {
      logger.error('QR batch generation failed:', error);
      throw error;
    }
  }

  async getByQRId(uniqueQRId) {
    const fitting = await qrRepository.findByQRId(uniqueQRId);
    
    if (!fitting) {
      throw new NotFoundError('QR code not found');
    }
    
    return fitting;
  }

  async updateFitting(fittingId, updateData, userId) {
    const fitting = await qrRepository.findById(fittingId);
    
    if (!fitting) {
      throw new NotFoundError('Fitting not found');
    }
    
    const updated = await qrRepository.updateFitting(fittingId, updateData);
    
    await AuditService.log({
      action: 'FITTING_UPDATED',
      userId,
      resourceId: fittingId,
      details: { updates: Object.keys(updateData) },
    });
    
    return updated;
  }

  async listFittings(filters, pagination) {
    const query = {};
    
    // Zone code is mandatory for sharded queries
    if (filters.zoneCode) {
      query.zoneCode = filters.zoneCode.toUpperCase();
    }
    
    if (filters.vendorCode) query.vendorCode = filters.vendorCode;
    if (filters.status) query.status = filters.status;
    if (filters.lotNumber) query.lotNumber = filters.lotNumber;
    if (filters.itemType) query.itemType = filters.itemType;
    if (filters.depot) query['location.depot'] = filters.depot;
    
    const fittings = await qrRepository.findFittings(query, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    
    const total = await qrRepository.countFittings(query);
    
    return { fittings, total };
  }

  async recallLot(zoneCode, lotNumber, reason, userId) {
    const result = await qrRepository.recallByLot(zoneCode, lotNumber, reason);
    
    await AuditService.log({
      action: 'LOT_RECALLED',
      userId,
      details: { zoneCode, lotNumber, reason, affectedCount: result.modifiedCount },
    });
    
    logger.warn('Lot recalled:', { zoneCode, lotNumber, reason, affectedCount: result.modifiedCount });
    
    return result;
  }

  async getExpiringWarranties(zoneCode, days = 30) {
    return await qrRepository.findExpiringWarranties(zoneCode, days);
  }
}

module.exports = new QRService();
