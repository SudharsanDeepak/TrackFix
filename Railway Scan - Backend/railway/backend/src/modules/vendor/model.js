const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      /* index: true */
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    panNumber: {
      type: String,
      trim: true,
    },
    certifications: [String],
    specializations: [String],
    performanceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalFittingsSupplied: {
      type: Number,
      default: 0,
    },
    defectiveCount: {
      type: Number,
      default: 0,
    },
    recallCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
    blacklistReason: String,
    blacklistDate: Date,
    contractStartDate: Date,
    contractEndDate: Date,
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

vendorSchema.index({ vendorCode: 1 });
vendorSchema.index({ performanceScore: -1, isDeleted: 1 });
vendorSchema.index({ riskScore: -1, isDeleted: 1 });
vendorSchema.index({ isActive: 1, isBlacklisted: 1, isDeleted: 1 });
vendorSchema.index({ email: 1 }, { sparse: true });

vendorSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

vendorSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
