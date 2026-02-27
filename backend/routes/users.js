const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, requireOwner } = require('../middleware/auth');

// GET /api/users - Owner only
router.get('/', authenticate, requireOwner, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users - Owner only, max 5 users
router.post('/', authenticate, requireOwner, [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['owner', 'staff']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }

  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    if (totalUsers >= 5) {
      return res.status(400).json({ message: 'Maximum 5 users allowed' });
    }

    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id - Owner only
router.put('/:id', authenticate, requireOwner, [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('role').optional().isIn(['owner', 'staff']),
], async (req, res) => {
  try {
    const updates = {};
    const { name, email, password, role, isActive } = req.body;
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id - Owner only
router.delete('/:id', authenticate, requireOwner, async (req, res) => {
  try {
    // Cannot delete yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
