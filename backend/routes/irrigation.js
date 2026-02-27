const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const IrrigationLog = require('../models/IrrigationLog');
const { authenticate, requireOwner } = require('../middleware/auth');

// GET /api/irrigation
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const entries = await IrrigationLog.find()
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await IrrigationLog.countDocuments();
    res.json({ entries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/irrigation
router.post('/', authenticate, [
  body('date').isISO8601(),
  body('section').notEmpty().trim(),
  body('irrigationDone').isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  try {
    const entry = await IrrigationLog.create({
      ...req.body,
      createdBy: req.user._id,
    });
    await entry.populate('createdBy', 'name');
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/irrigation/:id - Owner only
router.put('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const entry = await IrrigationLog.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('createdBy', 'name');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/irrigation/:id - Owner only
router.delete('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    await IrrigationLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Irrigation log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
