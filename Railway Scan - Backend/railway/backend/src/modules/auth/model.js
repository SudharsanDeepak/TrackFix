const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES } = require('../../shared/constants');
const config = require('../../config');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId;
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'both'],
      default: 'local',
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VENDOR,
    },
    depotId: {
      type: String,
      sparse: true,
      index: true,
      required: function() {
        // Only required if explicitly set, not during creation via OAuth
        return false;
      },
    },
    zoneId: {
      type: String,
      sparse: true,
      index: true,
      required: function() {
        return false;
      },
    },
    permissions: [{
      type: String,
    }],
    vendorCode: {
      type: String,
      sparse: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
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

userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ role: 1, isActive: 1, isDeleted: 1 });
userSchema.index({ role: 1, depotId: 1, isActive: 1 });
userSchema.index({ role: 1, zoneId: 1, isActive: 1 });
userSchema.index({ vendorCode: 1 }, { sparse: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, config.security.bcryptRounds);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
