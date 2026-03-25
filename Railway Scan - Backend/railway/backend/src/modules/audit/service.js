const auditRepository = require('./repository');
const logger = require('../../utils/logger');

class AuditService {
  async log(logData) {
    try {
      await auditRepository.create({
        ...logData,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Audit log creation failed:', error);
    }
  }

  async getUserLogs(userId, pagination) {
    const logs = await auditRepository.findByUser(userId, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await auditRepository.count({ userId });
    return { logs, total };
  }

  async getActionLogs(action, pagination) {
    const logs = await auditRepository.findByAction(action, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await auditRepository.count({ action });
    return { logs, total };
  }

  async getLogsByDateRange(startDate, endDate, pagination) {
    const logs = await auditRepository.findByDateRange(startDate, endDate, {
      skip: pagination.skip,
      limit: pagination.limit,
    });
    const total = await auditRepository.count({
      timestamp: { $gte: startDate, $lte: endDate },
    });
    return { logs, total };
  }

  async cleanupOldLogs(daysToKeep = 90) {
    const result = await auditRepository.deleteOldLogs(daysToKeep);
    logger.info('Old audit logs cleaned up:', { deletedCount: result.deletedCount });
    return result;
  }
}

module.exports = new AuditService();
