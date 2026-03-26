const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { fetchAndStoreWeather } = require('./utils/weatherCron');

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes("vercel.app") ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/labour', require('./routes/labour'));
app.use('/api/production', require('./routes/production'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/pest', require('./routes/pest'));
app.use('/api/irrigation', require('./routes/irrigation'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SDM Tea Group API Running' }));

// Connect DB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // Seed initial admin user if not exists
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const existingAdmin = await User.findOne({ role: 'owner' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@SDM2024', 10);
      await User.create({
        name: 'SDM Admin',
        email: 'admin@sdmtea.com',
        password: hashedPassword,
        role: 'owner'
      });
      console.log('✅ Default admin created: admin@sdmtea.com / Admin@SDM2024');
    }

    // Fetch weather immediately on startup
    await fetchAndStoreWeather();

    // Schedule weather fetch every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('🌤️ Fetching weather data...');
      await fetchAndStoreWeather();
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
