const mongoose = require('mongoose');

const performanceLogArchiveSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    logYear: {
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
    recordedDate: {
      type: Date,
      required: true,
    },
    metrics: mongoose.Schema.Types.Mixed,
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
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
performanceLogArchiveSchema.index({ zoneCode: 1, logYear: 1, originalId: 1 });
performanceLogArchiveSchema.index({ zoneCode: 1, archivedAt: -1 });
performanceLogArchiveSchema.index({ zoneCode: 1, fitting: 1 });

const PerformanceLogArchive = mongoose.model('PerformanceLogArchive', performanceLogArchiveSchema);

module.exports = PerformanceLogArchive;
