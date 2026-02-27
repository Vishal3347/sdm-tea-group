const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PestReport = require('../models/PestReport');
const { authenticate, requireOwner } = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

// GET /api/pest
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const entries = await PestReport.find()
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await PestReport.countDocuments();
    res.json({ entries, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/pest - with optional image upload
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { date, section, pestType, notes } = req.body;
    if (!date || !section || !pestType) {
      return res.status(400).json({ message: 'Date, section, and pestType are required' });
    }

    const entry = await PestReport.create({
      date,
      section,
      pestType,
      notes,
      imageUrl: req.file?.path || null,
      createdBy: req.user._id,
    });
    await entry.populate('createdBy', 'name');
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/pest/:id - Owner only
router.put('/:id', authenticate, requireOwner, upload.single('image'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = req.file.path;
    const entry = await PestReport.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('createdBy', 'name');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/pest/:id - Owner only
router.delete('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const entry = await PestReport.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Pest report deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
