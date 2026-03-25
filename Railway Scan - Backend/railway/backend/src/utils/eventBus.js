const EventEmitter = require('events');
const logger = require('./logger');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emitEvent(eventName, data) {
    logger.info('Event emitted:', { event: eventName, data });
    this.emit(eventName, data);
  }

  onEvent(eventName, handler) {
    // Silently register event listener
    this.on(eventName, async (data) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error('Event handler error:', { event: eventName, error: error.message });
      }
    });
  }
}

const eventBus = new EventBus();

const EVENTS = {
  INSPECTION_FAILED: 'inspection.failed',
  AI_PREDICTION_UPDATED: 'ai.prediction.updated',
  VENDOR_BLACKLISTED: 'vendor.blacklisted',
  LOT_RECALLED: 'lot.recalled',
  WARRANTY_EXPIRING: 'warranty.expiring',
  FITTING_STATUS_CHANGED: 'fitting.status.changed',
  VENDOR_METRICS_UPDATED: 'vendor.metrics.updated',
  SYSTEM_SETTINGS_CHANGED: 'system.settings.changed',
};

module.exports = { eventBus, EVENTS };
