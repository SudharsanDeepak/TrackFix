const AIReport = require('./model');
const { validateZoneCode, logScatterQuery } = require('../../utils/shardingHelper');

class AIReportRepository {
  async create(reportData) {
    return await AIReport.create(reportData);
  }

  async findById(id) {
    return await AIReport.findById(id).populate('fitting vendor');
  }

  async findByFitting(zoneCode, fittingId, options = {}) {
    const validatedZone = validateZoneCode(zoneCode);
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return await AIReport.find({ zoneCode: validatedZone, fitting: fittingId })
      .populate('fitting', 'uniqueQRId itemType status')
      .populate('vendor', 'vendorCode name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findByVendor(zoneCode, vendorId, options = {}) {
    const validatedZone = validateZoneCode(zoneCode);
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return await AIReport.find({ zoneCode: validatedZone, vendor: vendorId })
      .populate('fitting', 'uniqueQRId itemType status')
      .populate('vendor', 'vendorCode name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findHighRisk(zoneCode, threshold = 70) {
    const validatedZone = validateZoneCode(zoneCode);
    return await AIReport.find({ zoneCode: validatedZone, riskScore: { $gte: threshold } })
      .populate('fitting', 'uniqueQRId itemType status location')
      .populate('vendor', 'vendorCode name')
      .sort({ riskScore: -1 })
      .limit(100)
      .lean();
  }

  async count(filter = {}) {
    logScatterQuery('aireports', filter);
    return await AIReport.countDocuments(filter);
  }

  async getLatestByFitting(zoneCode, fittingId) {
    const validatedZone = validateZoneCode(zoneCode);
    return await AIReport.findOne({ zoneCode: validatedZone, fitting: fittingId })
      .sort({ createdAt: -1 })
      .populate('fitting vendor');
  }
}

module.exports = new AIReportRepository();
