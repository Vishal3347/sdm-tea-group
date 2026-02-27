const mongoose = require('mongoose');

const irrigationLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  section: { type: String, required: true, trim: true },
  irrigationDone: { type: Boolean, required: true, default: false },
  duration: { type: Number, min: 0 }, // hours
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('IrrigationLog', irrigationLogSchema);
