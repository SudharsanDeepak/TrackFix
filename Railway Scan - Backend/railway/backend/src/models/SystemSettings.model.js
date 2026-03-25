const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['SECURITY', 'NOTIFICATIONS', 'THRESHOLDS', 'INTEGRATIONS'],
      unique: true,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for category lookup
systemSettingsSchema.index({ category: 1 });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = SystemSettings;
