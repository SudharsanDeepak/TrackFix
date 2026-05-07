const Inspection = require('./model');
const { validateZoneCode, logScatterQuery } = require('../../utils/shardingHelper');

class InspectionRepository {
  async create(inspectionData) {
    return await Inspection.create(inspectionData);
  }

  async findById(id) {
    return await Inspection.findById(id).populate('fitting inspector');
  }

  async find(filter = {}, options = {}) {
    const { skip = 0, limit = 50, sort = { inspectionDate: -1 } } = options;
    return await Inspection.find(filter)
      .populate('fitting', 'uniqueQRId itemType status location')
      .populate('inspector', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findByFitting(zoneCode, fittingId, options = {}) {
    const validatedZone = validateZoneCode(zoneCode);
    const { skip = 0, limit = 20, sort = { inspectionDate: -1 } } = options;
    return await Inspection.find({ zoneCode: validatedZone, fitting: fittingId })
      .populate('fitting', 'uniqueQRId itemType status')
      .populate('inspector', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findByInspector(zoneCode, inspectorId, options = {}) {
    const validatedZone = validateZoneCode(zoneCode);
    const { skip = 0, limit = 20, sort = { inspectionDate: -1 } } = options;
    return await Inspection.find({ zoneCode: validatedZone, inspector: inspectorId })
      .populate('fitting', 'uniqueQRId itemType status location')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async update(id, updateData) {
    return await Inspection.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async count(filter = {}) {
    logScatterQuery('inspections', filter);
    return await Inspection.countDocuments(filter);
  }

  async getLatestByFitting(zoneCode, fittingId) {
    const validatedZone = validateZoneCode(zoneCode);
    return await Inspection.findOne({ zoneCode: validatedZone, fitting: fittingId })
      .sort({ inspectionDate: -1 })
      .populate('inspector');
  }

  async findFailedInspections(zoneCode, options = {}) {
    const validatedZone = validateZoneCode(zoneCode);
    const { skip = 0, limit = 50 } = options;
    return await Inspection.find({ zoneCode: validatedZone, overallResult: 'FAIL' })
      .populate('fitting', 'uniqueQRId itemType vendor status')
      .populate('inspector', 'name email')
      .sort({ inspectionDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

module.exports = new InspectionRepository();
