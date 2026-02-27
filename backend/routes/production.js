const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ProductionEntry = require('../models/ProductionEntry');
const Buyer = require('../models/Buyer');
const { authenticate, requireOwner } = require('../middleware/auth');

// GET /api/production
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const entries = await ProductionEntry.find(query)
      .populate('createdBy', 'name')
      .populate('buyerId', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await ProductionEntry.countDocuments(query);
    res.json({ entries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/production/chart - Last 7 days
router.get('/chart', authenticate, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const data = await ProductionEntry.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalKg: { $sum: '$totalKg' },
          totalRevenue: { $sum: '$totalRevenue' },
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/production
router.post('/', authenticate, [
  body('date').isISO8601(),
  body('section').notEmpty().trim(),
  body('totalKg').isFloat({ min: 0 }),
  body('ratePerKg').isFloat({ min: 0 }),
  body('buyerId').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  try {
    const { totalKg, ratePerKg, buyerId } = req.body;
    const totalRevenue = totalKg * ratePerKg;

    const entry = await ProductionEntry.create({
      ...req.body,
      totalRevenue,
      createdBy: req.user._id,
    });

    // Update buyer's total quantity purchased
    await Buyer.findByIdAndUpdate(buyerId, {
      $inc: { totalQuantityPurchased: totalKg }
    });

    await entry.populate('createdBy', 'name');
    await entry.populate('buyerId', 'name');
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/production/:id - Owner only
router.put('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const oldEntry = await ProductionEntry.findById(req.params.id);
    if (!oldEntry) return res.status(404).json({ message: 'Entry not found' });

    const { totalKg, ratePerKg } = req.body;
    const updates = { ...req.body };
    if (totalKg && ratePerKg) updates.totalRevenue = totalKg * ratePerKg;

    // Adjust buyer quantity
    if (totalKg && oldEntry.buyerId) {
      const diff = totalKg - oldEntry.totalKg;
      await Buyer.findByIdAndUpdate(oldEntry.buyerId, { $inc: { totalQuantityPurchased: diff } });
    }

    const entry = await ProductionEntry.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('createdBy', 'name').populate('buyerId', 'name');
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/production/:id - Owner only
router.delete('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const entry = await ProductionEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Revert buyer quantity
    await Buyer.findByIdAndUpdate(entry.buyerId, {
      $inc: { totalQuantityPurchased: -entry.totalKg }
    });

    await ProductionEntry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
