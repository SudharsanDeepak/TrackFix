const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  zoneCode: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['NR', 'SR', 'ER', 'WR', 'CR', 'NER', 'ECR', 'ECoR', 'NCR', 'NWR', 'SCR', 'SER', 'SWR', 'WCR', 'NF', 'Metro'],
    index: true,
  },
  lotNumber: {
    type: String,
    required: true,
    index: true,
  },
  itemType: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  currentSerial: {
    type: Number,
    default: 0,
  },
  maxSerial: {
    type: Number,
    default: 999999,
  },
});

// Zone-segmented counter: unique per zone + lot + item + year
counterSchema.index({ zoneCode: 1, lotNumber: 1, itemType: 1, year: 1 }, { unique: true });

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
