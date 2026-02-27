const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  temperature: { type: Number },
  feelsLike: { type: Number },
  humidity: { type: Number },
  rainfall: { type: Number, default: 0 },
  description: { type: String },
  windSpeed: { type: Number },
  alert: { type: String, default: null }, // 'Heavy Rain', 'Drought', 'Storm', null
  icon: { type: String },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Weather', weatherSchema);
