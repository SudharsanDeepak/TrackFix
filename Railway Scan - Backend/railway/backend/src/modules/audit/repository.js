const AuditLog = require('./model');

class AuditRepository {
  async create(logData) {
    return await AuditLog.create(logData);
  }

  async findByUser(userId, options = {}) {
    const { skip = 0, limit = 50, sort = { timestamp: -1 } } = options;
    return await AuditLog.find({ userId }).sort(sort).skip(skip).limit(limit).lean();
  }

  async findByAction(action, options = {}) {
    const { skip = 0, limit = 50, sort = { timestamp: -1 } } = options;
    return await AuditLog.find({ action }).sort(sort).skip(skip).limit(limit).lean();
  }

  async findByDateRange(startDate, endDate, options = {}) {
    const { skip = 0, limit = 100, sort = { timestamp: -1 } } = options;
    return await AuditLog.find({
      timestamp: { $gte: startDate, $lte: endDate },
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter = {}) {
    return await AuditLog.countDocuments(filter);
  }

  async deleteOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    return await AuditLog.deleteMany({ timestamp: { $lt: cutoffDate } });
  }
}

module.exports = new AuditRepository();
