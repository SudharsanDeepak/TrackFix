const { eventBus, EVENTS } = require('../utils/eventBus');
const logger = require('../utils/logger');
const vendorRepository = require('../modules/vendor/repository');
const qrRepository = require('../modules/qr/repository');

const setupEventListeners = () => {
  // Silently setup event listeners

  eventBus.onEvent(EVENTS.INSPECTION_FAILED, async (data) => {
    const { fittingId, vendorId, defectCount } = data;

    await qrRepository.updateFitting(fittingId, {
      status: 'DEFECTIVE',
      defectCount: defectCount + 1,
    });

    await vendorRepository.incrementDefectCount(vendorId);
  });

  eventBus.onEvent(EVENTS.AI_PREDICTION_UPDATED, async (data) => {
    const { fittingId, riskScore, vendorId } = data;

    await qrRepository.updateRiskScore(fittingId, riskScore);

    if (riskScore >= 70) {
      await vendorRepository.updateRiskScore(vendorId, riskScore);
    }
  });

  eventBus.onEvent(EVENTS.VENDOR_BLACKLISTED, async (data) => {
    const { vendorId, reason } = data;
    logger.warn('Vendor blacklisted', { vendorId, reason });
  });

  eventBus.onEvent(EVENTS.LOT_RECALLED, async (data) => {
    const { lotNumber, reason, affectedCount } = data;
    logger.warn('Lot recalled', { lotNumber, reason, affectedCount });
  });

  eventBus.onEvent(EVENTS.WARRANTY_EXPIRING, async (data) => {
    const { fittingId, uniqueQRId, warrantyExpiry } = data;
    logger.info('Warranty expiring soon', { fittingId, uniqueQRId, warrantyExpiry });
  });

  console.log('✓ Event listeners ready');
};

module.exports = { setupEventListeners };
