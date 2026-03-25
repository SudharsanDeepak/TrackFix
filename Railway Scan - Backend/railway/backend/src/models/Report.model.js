const mongoose = require('mongoose');
const { ROLES } = require('../shared/constants');

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      default: () => `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
    },
    reportType: {
      type: String,
      required: true,
      enum: [
        'INSPECTION_SUMMARY',
        'DEFECT_ANALYSIS',
        'INVENTORY_STATUS',
        'VENDOR_PERFORMANCE',
        'TREND_ANALYSIS',
        'DEPOT_COMPARISON',
      ],
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    format: {
      type: String,
      required: true,
      enum: ['PDF', 'CSV', 'JSON'],
      default: 'PDF',
    },
    fileUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    errorMessage: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from creation
    },
  },
  {
    timestamps: true,
  }
);

// Index for user's reports
reportSchema.index({ generatedBy: 1, createdAt: -1 });

// Index for reports by type
reportSchema.index({ reportType: 1, createdAt: -1 });

// TTL index for automatic deletion of expired reports
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
