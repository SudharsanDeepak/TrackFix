const EventEmitter = require('events');
const logger = require('./logger');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
    this.roleSubscribers = {}; // Track subscribers by role
  }

  emitEvent(eventName, data) {
    logger.info('Event emitted:', { event: eventName, dataType: data?.type || 'unknown' });
    this.emit(eventName, data);
  }

  // Emit event to specific roles
  emitToRoles(eventName, data, targetRoles = []) {
    const enrichedData = {
      ...data,
      event: eventName,
      timestamp: new Date().toISOString(),
      targetRoles,
    };
    
    logger.info('Event emitted to roles:', { event: eventName, roles: targetRoles });
    this.emit('role-event', enrichedData);
    this.emit(eventName, enrichedData);
  }

  onEvent(eventName, handler) {
    // Register event listener
    this.on(eventName, async (data) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error('Event handler error:', { event: eventName, error: error.message });
      }
    });
  }

  // Subscribe to role-specific events
  onRoleEvent(handler) {
    this.on('role-event', async (data) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error('Role event handler error:', { error: error.message });
      }
    });
  }
}

const eventBus = new EventBus();

const EVENTS = {
  // Inspection lifecycle events
  INSPECTION_CREATED: 'inspection.created',
  INSPECTION_UPDATED: 'inspection.updated',
  INSPECTION_COMPLETED: 'inspection.completed',
  INSPECTION_FAILED: 'inspection.failed',
  INSPECTION_APPROVED: 'inspection.approved',
  
  // QR/Fitting events
  FITTING_STATUS_CHANGED: 'fitting.status.changed',
  FITTING_DEFECT_REPORTED: 'fitting.defect.reported',
  
  // Vendor events
  VENDOR_BLACKLISTED: 'vendor.blacklisted',
  VENDOR_METRICS_UPDATED: 'vendor.metrics.updated',
  
  // System events
  SYSTEM_SETTINGS_CHANGED: 'system.settings.changed',
  WARRANTY_EXPIRING: 'warranty.expiring',
  LOT_RECALLED: 'lot.recalled',
  AI_PREDICTION_UPDATED: 'ai.prediction.updated',
  
  // User/Role events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  ROLE_CHANGED: 'role.changed',
  
  // Real-time notifications
  NOTIFICATION_SENT: 'notification.sent',
  ALERT_TRIGGERED: 'alert.triggered',
};

// Event to role mapping - defines which roles should see which events
const EVENT_ROLE_MAP = {
  [EVENTS.INSPECTION_CREATED]: ['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'INSPECTOR'],
  [EVENTS.INSPECTION_UPDATED]: ['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'INSPECTOR'],
  [EVENTS.INSPECTION_COMPLETED]: ['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER'],
  [EVENTS.INSPECTION_FAILED]: ['ADMIN', 'ZONAL_MANAGER', 'DEPOT_OFFICER'],
  [EVENTS.FITTING_DEFECT_REPORTED]: ['ADMIN', 'ZONAL_MANAGER', 'DEPOT_OFFICER'],
  [EVENTS.VENDOR_BLACKLISTED]: ['ADMIN', 'DEPOT_OFFICER'],
  [EVENTS.USER_CREATED]: ['ADMIN'],
  [EVENTS.USER_UPDATED]: ['ADMIN'],
  [EVENTS.ROLE_CHANGED]: ['ADMIN'],
  [EVENTS.SYSTEM_SETTINGS_CHANGED]: ['ADMIN', 'DEPOT_OFFICER', 'ZONAL_MANAGER', 'INSPECTOR'],
};

module.exports = { eventBus, EVENTS, EVENT_ROLE_MAP };
