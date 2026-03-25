const mongoose = require('mongoose');

const performanceLogSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: [true, 'Zone code is required for sharding'],
      uppercase: true,
      enum: ['NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'SWR', 'Metro'],
      index: true,
    },
    logYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      index: true,
    },
    fitting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrackFitting',
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    recordedDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    metrics: {
      loadCapacity: {
        value: Number,
        unit: String,
        status: String,
      },
      fatigueResistance: {
        cycles: Number,
        status: String,
      },
      corrosionLevel: {
        value: Number,
        unit: String,
        status: String,
      },
      vibrationLevel: {
        value: Number,
        unit: String,
        status: String,
      },
      temperature: {
        value: Number,
        unit: String,
      },
    },
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    anomaliesDetected: [
      {
        type: String,
        severity: String,
        description: String,
      },
    ],
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// SHARD KEY: Compound key for performance logs
performanceLogSchema.index({ zoneCode: 1, logYear: 1, fitting: 1 });

// Secondary indexes for common queries
performanceLogSchema.index({ zoneCode: 1, fitting: 1, recordedDate: -1 });
performanceLogSchema.index({ zoneCode: 1, vendor: 1, performanceScore: -1 });
performanceLogSchema.index({ zoneCode: 1, performanceScore: 1 });

performanceLogSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const PerformanceLog = mongoose.model('PerformanceLog', performanceLogSchema);

module.exports = PerformanceLog;
