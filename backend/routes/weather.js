const express = require('express');
const router = express.Router();
const Weather = require('../models/Weather');
const { authenticate } = require('../middleware/auth');
const { fetchAndStoreWeather } = require('../utils/weatherCron');

// GET /api/weather - Get latest weather
router.get('/', authenticate, async (req, res) => {
  try {
    const weather = await Weather.findOne().sort({ updatedAt: -1 });
    if (!weather) {
      return res.json({
        temperature: null,
        humidity: null,
        rainfall: 0,
        description: 'Weather data unavailable',
        alert: null,
        gardenName: process.env.GARDEN_NAME || 'Sultanicherra Tea Garden',
        updatedAt: new Date(),
      });
    }
    res.json({
      ...weather.toObject(),
      gardenName: process.env.GARDEN_NAME || 'Sultanicherra Tea Garden',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/weather/refresh - Force refresh (owner only)
router.post('/refresh', authenticate, async (req, res) => {
  try {
    await fetchAndStoreWeather();
    const weather = await Weather.findOne().sort({ updatedAt: -1 });
    res.json({ message: 'Weather refreshed', weather });
  } catch (error) {
    res.status(500).json({ message: 'Failed to refresh weather' });
  }
});

module.exports = router;
