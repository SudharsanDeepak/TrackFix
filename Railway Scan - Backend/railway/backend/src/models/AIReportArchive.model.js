const mongoose = require('mongoose');
const { AI_PREDICTION_STATUS } = require('../shared/constants');

const aiReportArchiveSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    predictionYear: {
      type: Number,
      required: true,
      index: true,
    },
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    fitting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrackFitting',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    predictionData: mongoose.Schema.Types.Mixed,
    predictionResult: mongoose.Schema.Types.Mixed,
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: Object.values(AI_PREDICTION_STATUS),
    },
    archivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// SHARD KEY for archive collection
aiReportArchiveSchema.index({ zoneCode: 1, predictionYear: 1, originalId: 1 });
aiReportArchiveSchema.index({ zoneCode: 1, archivedAt: -1 });
aiReportArchiveSchema.index({ zoneCode: 1, fitting: 1 });

const AIReportArchive = mongoose.model('AIReportArchive', aiReportArchiveSchema);

module.exports = AIReportArchive;
