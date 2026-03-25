const mongoose = require('mongoose');
const { INSPECTION_STATUS } = require('../shared/constants');

const inspectionArchiveSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    inspectionYear: {
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
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(INSPECTION_STATUS),
    },
    findings: mongoose.Schema.Types.Mixed,
    defectsFound: [mongoose.Schema.Types.Mixed],
    overallResult: {
      type: String,
      enum: ['PASS', 'FAIL', 'CONDITIONAL'],
    },
    recommendations: [String],
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
inspectionArchiveSchema.index({ zoneCode: 1, inspectionYear: 1, originalId: 1 });
inspectionArchiveSchema.index({ zoneCode: 1, archivedAt: -1 });
inspectionArchiveSchema.index({ zoneCode: 1, fitting: 1 });

const InspectionArchive = mongoose.model('InspectionArchive', inspectionArchiveSchema);

module.exports = InspectionArchive;
