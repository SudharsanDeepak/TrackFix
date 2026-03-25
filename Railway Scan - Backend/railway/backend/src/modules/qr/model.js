const mongoose = require('mongoose');
const { FITTING_STATUS } = require('../../shared/constants');

const trackFittingSchema = new mongoose.Schema(
  {
    uniqueQRId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    zoneCode: {
      type: String,
      required: [true, 'Zone code is required for sharding'],
      uppercase: true,
      enum: ['NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'SWR', 'Metro'],
      index: true,
    },
    manufactureYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      index: true,
    },
    itemType: {
      type: String,
      required: true,
      index: true,
    },
    lotNumber: {
      type: String,
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    vendorCode: {
      type: String,
      required: true,
      index: true,
    },
    manufacturingDate: {
      type: Date,
      required: true,
    },
    warrantyPeriod: {
      type: Number,
      required: true,
    },
    warrantyExpiry: {
      type: Date,
      required: true,
      index: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
    status: {
      type: String,
      enum: Object.values(FITTING_STATUS),
      default: FITTING_STATUS.MANUFACTURED,
      index: true,
    },
    location: {
      depot: String,
      zone: String,
      division: String,
      section: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    installationDate: {
      type: Date,
    },
    lastInspectionDate: {
      type: Date,
    },
    inspectionCount: {
      type: Number,
      default: 0,
    },
    defectCount: {
      type: Number,
      default: 0,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isRecalled: {
      type: Boolean,
      default: false,
      index: true,
    },
    recallReason: {
      type: String,
    },
    recallDate: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
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

// SHARD KEY: Compound key for balanced distribution
trackFittingSchema.index({ zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 });

// Secondary indexes for common queries
trackFittingSchema.index({ uniqueQRId: 1 });
trackFittingSchema.index({ zoneCode: 1, vendorCode: 1, status: 1 });
trackFittingSchema.index({ zoneCode: 1, lotNumber: 1, serialNumber: 1 });
trackFittingSchema.index({ zoneCode: 1, warrantyExpiry: 1, status: 1 });
trackFittingSchema.index({ zoneCode: 1, 'location.depot': 1, status: 1 });
trackFittingSchema.index({ zoneCode: 1, riskScore: -1 });
trackFittingSchema.index({ zoneCode: 1, vendor: 1, status: 1 });
trackFittingSchema.index({ zoneCode: 1, isRecalled: 1 });
trackFittingSchema.index({ zoneCode: 1, createdAt: -1 });

// Partial index for soft-deleted records
trackFittingSchema.index(
  { zoneCode: 1, isDeleted: 1, deletedAt: 1 },
  { partialFilterExpression: { isDeleted: true } }
);

trackFittingSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

trackFittingSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return await this.save();
};

const TrackFitting = mongoose.model('TrackFitting', trackFittingSchema);

module.exports = TrackFitting;
