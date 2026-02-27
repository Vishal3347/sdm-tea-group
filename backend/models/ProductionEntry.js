const mongoose = require('mongoose');

const productionEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  section: { type: String, required: true, trim: true },
  totalKg: { type: Number, required: true, min: 0 },
  ratePerKg: { type: Number, required: true, min: 0 },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
  totalRevenue: { type: Number, required: true, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Auto-calculate totalRevenue before save
productionEntrySchema.pre('save', function(next) {
  this.totalRevenue = this.totalKg * this.ratePerKg;
  next();
});

module.exports = mongoose.model('ProductionEntry', productionEntrySchema);
