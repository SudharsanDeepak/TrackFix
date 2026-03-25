const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    depotId: {
      type: String,
      index: true,
    },
    zoneId: {
      type: String,
      index: true,
    },
    alertType: {
      type: String,
      required: true,
      enum: [
        'DEFECT_CRITICAL',
        'INVENTORY_LOW',
        'INSPECTION_OVERDUE',
        'VENDOR_ISSUE',
        'SYSTEM_ERROR',
      ],
    },
    severity: {
      type: String,
      required: true,
      enum: ['INFO', 'WARNING', 'CRITICAL', 'EMERGENCY'],
      default: 'INFO',
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED'],
      default: 'ACTIVE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for zone alerts sorted by status, severity, and creation time
alertSchema.index({ zoneId: 1, status: 1, severity: 1, createdAt: -1 });

// Index for depot alerts sorted by status and creation time
alertSchema.index({ depotId: 1, status: 1, createdAt: -1 });

// Index for active critical alerts
alertSchema.index({ status: 1, severity: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
