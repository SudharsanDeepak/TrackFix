const mongoose = require('mongoose');
const { ROLES } = require('../shared/constants');

const activityLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      default: () => `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'EXPORT',
        'APPROVE',
        'REJECT',
      ],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  }
);

// Index for user activity history
activityLogSchema.index({ userId: 1, timestamp: -1 });

// Index for actions by type
activityLogSchema.index({ action: 1, timestamp: -1 });

// Index for resource access logs
activityLogSchema.index({ resource: 1, timestamp: -1 });

// TTL index for 365-day retention (31536000 seconds = 365 days)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
