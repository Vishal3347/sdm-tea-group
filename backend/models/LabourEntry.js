const mongoose = require('mongoose');

const labourEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalWorkers: { type: Number, required: true, min: 0 },
  notes: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('LabourEntry', labourEntrySchema);
