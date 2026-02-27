const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const LabourEntry = require('../models/LabourEntry');
const { authenticate, requireOwner } = require('../middleware/auth');

// GET /api/labour
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const entries = await LabourEntry.find(query)
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await LabourEntry.countDocuments(query);
    res.json({ entries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/labour
router.post('/', authenticate, [
  body('date').isISO8601(),
  body('totalWorkers').isInt({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  try {
    const entry = await LabourEntry.create({
      ...req.body,
      createdBy: req.user._id,
    });
    await entry.populate('createdBy', 'name');
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/labour/:id - Owner only
router.put('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const entry = await LabourEntry.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('createdBy', 'name');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/labour/:id - Owner only
router.delete('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const entry = await LabourEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
