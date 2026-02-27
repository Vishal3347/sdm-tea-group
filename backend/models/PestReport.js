const mongoose = require('mongoose');

const pestReportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  section: { type: String, required: true, trim: true },
  pestType: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('PestReport', pestReportSchema);
