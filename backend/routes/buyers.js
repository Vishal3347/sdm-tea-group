const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Buyer = require('../models/Buyer');
const { authenticate, requireOwner } = require('../middleware/auth');

// GET /api/buyers
router.get('/', authenticate, async (req, res) => {
  try {
    const buyers = await Buyer.find({ isActive: true }).sort({ name: 1 });
    res.json(buyers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/buyers - Owner only
router.post('/', authenticate, requireOwner, [
  body('name').notEmpty().trim(),
  body('ratePerKg').isFloat({ min: 0 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  try {
    const buyer = await Buyer.create(req.body);
    res.status(201).json(buyer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/buyers/:id - Owner only
router.put('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    const { totalQuantityPurchased, ...updates } = req.body; // prevent manual override
    const buyer = await Buyer.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });
    res.json(buyer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/buyers/:id - Owner only
router.delete('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    await Buyer.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Buyer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
