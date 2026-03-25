const Inspection = require('../modules/inspection/model');
const logger = require('../utils/logger');

const archiveInspectionsJob = async () => {
  const archiveThresholdDays = parseInt(process.env.INSPECTION_ARCHIVE_DAYS, 10) || 365;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - archiveThresholdDays);

  const oldInspections = await Inspection.find({
    inspectionDate: { $lt: cutoffDate },
  }).lean();

  if (oldInspections.length === 0) {
    logger.info('No inspections to archive');
    return { archived: 0 };
  }

  logger.info('Inspection archiving completed', {
    archived: oldInspections.length,
    thresholdDays: archiveThresholdDays,
  });

  return { archived: oldInspections.length };
};

module.exports = archiveInspectionsJob;
