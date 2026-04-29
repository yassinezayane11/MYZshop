const mongoose = require('mongoose');

const deliveryConfigSchema = new mongoose.Schema({
  defaultPrice: { type: Number, required: true, default: 8 },
  estimatedDays: { type: String, default: '2-3' },
  freeDeliveryThreshold: { type: Number, default: null },
  cityPrices: [{
    city: { type: String, required: true },
    price: { type: Number, required: true },
    estimatedDays: { type: String, default: '2-3' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('DeliveryConfig', deliveryConfigSchema);
