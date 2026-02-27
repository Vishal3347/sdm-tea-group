const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ratePerKg: { type: Number, required: true, min: 0 },
  totalQuantityPurchased: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Buyer', buyerSchema);
