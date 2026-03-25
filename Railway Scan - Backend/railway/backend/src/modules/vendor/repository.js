const Vendor = require('./model');

class VendorRepository {
  async create(vendorData) {
    return await Vendor.create(vendorData);
  }

  async findById(id) {
    return await Vendor.findById(id);
  }

  async findByCode(vendorCode) {
    return await Vendor.findOne({ vendorCode });
  }

  async findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
    return await Vendor.find(filter).sort(sort).skip(skip).limit(limit).lean();
  }

  async count(filter = {}) {
    return await Vendor.countDocuments(filter);
  }

  async update(id, updateData) {
    return await Vendor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async updatePerformanceScore(vendorId, score) {
    return await Vendor.findByIdAndUpdate(vendorId, { performanceScore: score }, { new: true });
  }

  async updateRiskScore(vendorId, score) {
    return await Vendor.findByIdAndUpdate(vendorId, { riskScore: score }, { new: true });
  }

  async incrementDefectCount(vendorId) {
    return await Vendor.findByIdAndUpdate(vendorId, { $inc: { defectiveCount: 1 } }, { new: true });
  }

  async blacklist(vendorId, reason) {
    return await Vendor.findByIdAndUpdate(
      vendorId,
      { isBlacklisted: true, blacklistReason: reason, blacklistDate: new Date() },
      { new: true }
    );
  }

  async getTopPerformers(limit = 10) {
    return await Vendor.find({ isActive: true, isBlacklisted: false })
      .sort({ performanceScore: -1 })
      .limit(limit)
      .lean();
  }

  async getHighRiskVendors(threshold = 70) {
    return await Vendor.find({ riskScore: { $gte: threshold }, isActive: true }).lean();
  }
}

module.exports = new VendorRepository();
