const TrackFitting = require('../modules/qr/model');
const { eventBus, EVENTS } = require('../utils/eventBus');
const logger = require('../utils/logger');

const warrantyExpiryJob = async () => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringFittings = await TrackFitting.find({
    warrantyExpiry: {
      $gte: new Date(),
      $lte: thirtyDaysFromNow,
    },
    status: { $nin: ['DECOMMISSIONED', 'RECALLED'] },
  })
    .select('uniqueQRId warrantyExpiry vendor')
    .lean();

  logger.info('Warranty expiry scan completed', {
    count: expiringFittings.length,
  });

  expiringFittings.forEach((fitting) => {
    eventBus.emitEvent(EVENTS.WARRANTY_EXPIRING, {
      fittingId: fitting._id,
      uniqueQRId: fitting.uniqueQRId,
      warrantyExpiry: fitting.warrantyExpiry,
      vendorId: fitting.vendor,
    });
  });

  return { scanned: expiringFittings.length };
};

module.exports = warrantyExpiryJob;
