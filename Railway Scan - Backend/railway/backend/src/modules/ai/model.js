const mongoose = require('mongoose');
const { AI_PREDICTION_STATUS } = require('../../shared/constants');

const aiReportSchema = new mongoose.Schema(
  {
    zoneCode: {
      type: String,
      required: [true, 'Zone code is required for sharding'],
      uppercase: true,
      enum: ['NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'SWR', 'Metro'],
      index: true,
    },
    predictionYear: {
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
    predictionData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    predictionResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: Object.values(AI_PREDICTION_STATUS),
      default: AI_PREDICTION_STATUS.LOW_RISK,
    },
    predictedFailureDate: {
      type: Date,
    },
    recommendations: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    modelVersion: {
      type: String,
      required: true,
    },
    processingTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// SHARD KEY: Compound key for AI predictions
aiReportSchema.index({ zoneCode: 1, predictionYear: 1, fitting: 1 });

// Secondary indexes for common queries
aiReportSchema.index({ zoneCode: 1, fitting: 1, createdAt: -1 });
aiReportSchema.index({ zoneCode: 1, riskScore: -1 });
aiReportSchema.index({ zoneCode: 1, vendor: 1, riskScore: -1 });
aiReportSchema.index({ zoneCode: 1, riskLevel: 1, createdAt: -1 });

// Partial index for high-risk predictions
aiReportSchema.index(
  { zoneCode: 1, riskScore: -1, createdAt: -1 },
  { partialFilterExpression: { riskScore: { $gte: 70 } } }
);

aiReportSchema.pre('save', function (next) {
  if (this.riskScore >= 80) {
    this.riskLevel = AI_PREDICTION_STATUS.CRITICAL;
  } else if (this.riskScore >= 60) {
    this.riskLevel = AI_PREDICTION_STATUS.HIGH_RISK;
  } else if (this.riskScore >= 30) {
    this.riskLevel = AI_PREDICTION_STATUS.MEDIUM_RISK;
  } else {
    this.riskLevel = AI_PREDICTION_STATUS.LOW_RISK;
  }
  next();
});

const AIReport = mongoose.model('AIReport', aiReportSchema);

module.exports = AIReport;
