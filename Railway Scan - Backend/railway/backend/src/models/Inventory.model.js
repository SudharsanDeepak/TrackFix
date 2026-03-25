const mongoose = require('mongoose');
const { FITTING_TYPES } = require('../shared/constants');

const inventorySchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      default: () => `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    depotId: {
      type: String,
      required: true,
      index: true,
    },
    fittingType: {
      type: String,
      required: true,
      enum: Object.keys(FITTING_TYPES),
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    minThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
      validate: {
        validator: Number.isInteger,
        message: 'minThreshold must be an integer',
      },
    },
    maxThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 1000,
      validate: {
        validator: Number.isInteger,
        message: 'maxThreshold must be an integer',
      },
    },
    location: {
      type: String,
      required: true,
      maxlength: 200,
    },
    lastRestocked: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index on (depotId, fittingType) to prevent duplicate inventory items
inventorySchema.index({ depotId: 1, fittingType: 1 }, { unique: true });

// Index for low stock queries
inventorySchema.index({ depotId: 1, quantity: 1 });

// Pre-save hook to check thresholds and create alerts
inventorySchema.pre('save', async function(next) {
  // Only check thresholds if quantity has changed
  if (!this.isModified('quantity')) {
    return next();
  }
  
  const Alert = mongoose.model('Alert');
  
  try {
    // Check for low inventory
    if (this.quantity < this.minThreshold) {
      // Check if an active low inventory alert already exists
      const existingAlert = await Alert.findOne({
        depotId: this.depotId,
        alertType: 'INVENTORY_LOW',
        status: 'ACTIVE',
        'metadata.itemId': this.itemId,
      });
      
      // Only create alert if one doesn't exist
      if (!existingAlert) {
        await Alert.create({
          depotId: this.depotId,
          alertType: 'INVENTORY_LOW',
          severity: 'WARNING',
          message: `Low inventory alert: ${this.fittingType} quantity (${this.quantity}) is below minimum threshold (${this.minThreshold})`,
          metadata: {
            itemId: this.itemId,
            fittingType: this.fittingType,
            quantity: this.quantity,
            minThreshold: this.minThreshold,
            location: this.location,
          },
          status: 'ACTIVE',
        });
      }
    }
    
    // Check for excess inventory
    if (this.quantity > this.maxThreshold) {
      // Check if an active excess inventory alert already exists
      const existingAlert = await Alert.findOne({
        depotId: this.depotId,
        alertType: 'INVENTORY_LOW', // Using INVENTORY_LOW as INVENTORY_EXCESS is not in the enum
        status: 'ACTIVE',
        'metadata.itemId': this.itemId,
        'metadata.alertSubType': 'EXCESS',
      });
      
      // Only create alert if one doesn't exist
      if (!existingAlert) {
        await Alert.create({
          depotId: this.depotId,
          alertType: 'INVENTORY_LOW', // Using closest available type
          severity: 'WARNING',
          message: `Excess inventory alert: ${this.fittingType} quantity (${this.quantity}) exceeds maximum threshold (${this.maxThreshold})`,
          metadata: {
            itemId: this.itemId,
            fittingType: this.fittingType,
            quantity: this.quantity,
            maxThreshold: this.maxThreshold,
            location: this.location,
            alertSubType: 'EXCESS',
          },
          status: 'ACTIVE',
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
