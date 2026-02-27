const express = require('express');
const router = express.Router();
const LabourEntry = require('../models/LabourEntry');
const ProductionEntry = require('../models/ProductionEntry');
const PestReport = require('../models/PestReport');
const IrrigationLog = require('../models/IrrigationLog');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      todayLabour,
      todayProduction,
      latestPest,
      latestIrrigation,
    ] = await Promise.all([
      LabourEntry.findOne({ date: { $gte: startOfDay, $lte: endOfDay } }).sort({ date: -1 }),
      ProductionEntry.aggregate([
        { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, totalKg: { $sum: '$totalKg' }, totalRevenue: { $sum: '$totalRevenue' } } }
      ]),
      PestReport.findOne().sort({ date: -1 }).populate('createdBy', 'name'),
      IrrigationLog.findOne().sort({ date: -1 }).populate('createdBy', 'name'),
    ]);

    res.json({
      todayWorkers: todayLabour?.totalWorkers || 0,
      todayKg: todayProduction[0]?.totalKg || 0,
      todayRevenue: todayProduction[0]?.totalRevenue || 0,
      latestPest,
      latestIrrigation,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
