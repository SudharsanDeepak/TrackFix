const TrackFitting = require('./model');
const Counter = require('./counter.model');
const mongoose = require('mongoose');
const { validateZoneCode, logScatterQuery } = require('../../utils/shardingHelper');

class QRRepository {
  async getNextSerialNumber(zoneCode, lotNumber, itemType, year) {
    const validatedZone = validateZoneCode(zoneCode);
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const counter = await Counter.findOneAndUpdate(
        { zoneCode: validatedZone, lotNumber, itemType, year },
        { $inc: { currentSerial: 1 } },
        { 
          new: true, 
          upsert: true, 
          session,
          setDefaultsOnInsert: true 
        }
      );
      
      if (counter.currentSerial > counter.maxSerial) {
        throw new Error('Serial number limit exceeded for this lot');
      }
      
      await session.commitTransaction();
      return counter.currentSerial;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createFitting(fittingData) {
    return await TrackFitting.create(fittingData);
  }

  async createFittingsBulk(fittingsData) {
    return await TrackFitting.insertMany(fittingsData, { ordered: false });
  }

  async findByQRId(uniqueQRId) {
    return await TrackFitting.findOne({ uniqueQRId })
      .populate('vendor', 'vendorCode name email phone performanceScore riskScore')
      .lean();
  }

  async findById(id) {
    return await TrackFitting.findById(id)
      .populate('vendor', 'vendorCode name email phone performanceScore riskScore')
      .lean();
  }

  async updateFitting(id, updateData) {
    return await TrackFitting.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async findFittings(filter, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 }, projection = null } = options;
    
    // Log scatter-gather queries in development
    logScatterQuery('trackfittings', filter);
    
    let query = TrackFitting.find(filter)
      .populate('vendor', 'vendorCode name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    if (projection) {
      query = query.select(projection);
    }
    
    return await query.lean();
  }

  async countFittings(filter) {
    logScatterQuery('trackfittings', filter);
    return await TrackFitting.countDocuments(filter);
  }

  async findByLotNumber(zoneCode, lotNumber) {
    const validatedZone = validateZoneCode(zoneCode);
    return await TrackFitting.find({ zoneCode: validatedZone, lotNumber }).populate('vendor');
  }

  async findByVendor(zoneCode, vendorId, options = {}) {
    const validatedZone = validateZoneCode(zoneCode);
    return await this.findFittings({ zoneCode: validatedZone, vendor: vendorId }, options);
  }

  async findExpiringWarranties(zoneCode, days = 30) {
    const validatedZone = validateZoneCode(zoneCode);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await TrackFitting.find({
      zoneCode: validatedZone,
      warrantyExpiry: { $lte: futureDate, $gte: new Date() },
      status: { $nin: ['DECOMMISSIONED', 'RECALLED'] },
    })
      .populate('vendor', 'vendorCode name email')
      .select('uniqueQRId warrantyExpiry itemType lotNumber vendor status zoneCode')
      .lean();
  }

  async updateRiskScore(fittingId, riskScore) {
    return await TrackFitting.findByIdAndUpdate(
      fittingId,
      { riskScore },
      { new: true }
    );
  }

  async recallByLot(zoneCode, lotNumber, reason) {
    const validatedZone = validateZoneCode(zoneCode);
    return await TrackFitting.updateMany(
      { zoneCode: validatedZone, lotNumber },
      { 
        isRecalled: true, 
        recallReason: reason, 
        recallDate: new Date(),
        status: 'RECALLED'
      }
    );
  }
}

module.exports = new QRRepository();
