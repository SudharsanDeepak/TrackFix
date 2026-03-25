const mongoose = require('mongoose');
const { INSPECTION_STATUS } = require('../../shared/constants');

const inspectionSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: [true, 'Zone code is required for sharding'],
      uppercase: true,
      default: 'GENERAL',
      index: true,
    },
    inspectionYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      index: true,
    },
    fitting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrackFitting',
      required: false, // Make optional for simple inspections
      index: true,
    },
    // Simple inspection fields (when not using QR/fitting)
    assetId: {
      type: String,
      trim: true,
      index: true,
    },
    assetType: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(INSPECTION_STATUS),
      default: INSPECTION_STATUS.PENDING,
      index: true,
    },
    findings: {
      visualInspection: {
        passed: Boolean,
        notes: String,
      },
      dimensionalCheck: {
        passed: Boolean,
        measurements: Map,
        notes: String,
      },
      functionalTest: {
        passed: Boolean,
        notes: String,
      },
      wearAnalysis: {
        wearLevel: {
          type: Number,
          min: 0,
          max: 100,
        },
        notes: String,
      },
    },
    defectsFound: [
      {
        type: String,
        description: String,
        severity: {
          type: String,
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        },
      },
    ],
    overallResult: {
      type: String,
      enum: ['PASS', 'FAIL', 'CONDITIONAL'],
      required: true,
    },
    recommendations: [String],
    nextInspectionDate: {
      type: Date,
    },
    images: [{
      data: Buffer,
      contentType: String,
    }],
    signature: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    approvalComments: {
      type: String,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    rejectionComments: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// SHARD KEY: Compound key for write-heavy collection
inspectionSchema.index({ zoneCode: 1, inspectionYear: 1, fitting: 1 });

// Secondary indexes for common queries
inspectionSchema.index({ zoneCode: 1, fitting: 1, inspectionDate: -1 });
inspectionSchema.index({ zoneCode: 1, inspector: 1, inspectionDate: -1 });
inspectionSchema.index({ zoneCode: 1, status: 1, inspectionDate: -1 });
inspectionSchema.index({ zoneCode: 1, overallResult: 1 });
inspectionSchema.index({ zoneCode: 1, createdAt: -1 });

// Partial index for failed inspections
inspectionSchema.index(
  { zoneCode: 1, overallResult: 1, inspectionDate: -1 },
  { partialFilterExpression: { overallResult: 'FAIL' } }
);

inspectionSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

inspectionSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

const Inspection = mongoose.model('Inspection', inspectionSchema);

module.exports = Inspection;
