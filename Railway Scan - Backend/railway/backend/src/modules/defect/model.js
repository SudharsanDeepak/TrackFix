const mongoose = require('mongoose');
const { FITTING_TYPES } = require('../../shared/constants');

const defectSchema = new mongoose.Schema(
  {
    defectId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `DEF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      },
      index: true,
    },
    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
      required: [true, 'Inspection ID is required'],
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
      index: true,
    },
    depotId: {
      type: String,
      required: [true, 'Depot ID is required'],
      index: true,
    },
    fittingType: {
      type: String,
      required: [true, 'Fitting type is required'],
      enum: Object.values(FITTING_TYPES),
    },
    severity: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'REPORTED',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes as per requirements
defectSchema.index({ depotId: 1, status: 1, createdAt: -1 });
defectSchema.index({ reportedBy: 1, createdAt: -1 });
defectSchema.index({ assignedTo: 1, status: 1 });
defectSchema.index({ severity: 1, status: 1 });

const Defect = mongoose.model('Defect', defectSchema);

module.exports = Defect;
