const AuditLog = require('../modules/audit/model');
const logger = require('../utils/logger');

const auditCleanupJob = async () => {
  const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await AuditLog.deleteMany({
    timestamp: { $lt: cutoffDate },
  });

  logger.info('Audit log cleanup completed', {
    deleted: result.deletedCount,
    retentionDays,
  });

  return { deleted: result.deletedCount };
};

module.exports = auditCleanupJob;
