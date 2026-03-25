const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    auditId: {
      type: String,
      required: true,
      unique: true,
      default: () => `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'USER_MANAGEMENT',
        'ROLE_ASSIGNMENT',
        'SYSTEM_CONFIG',
        'SECURITY',
        'DATA_EXPORT',
      ],
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    before: {
      type: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
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

// Index for user audit trail
auditLogSchema.index({ performedBy: 1, timestamp: -1 });

// Index for audits by category
auditLogSchema.index({ category: 1, timestamp: -1 });

// Index for chronological queries
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
