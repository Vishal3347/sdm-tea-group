const axios = require('axios');
const Weather = require('../models/Weather');

const fetchAndStoreWeather = async () => {
  try {
    const { OPENWEATHER_API_KEY, GARDEN_LAT, GARDEN_LON } = process.env;

    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_openweather_api_key') {
      console.log('⚠️  OpenWeather API key not configured, skipping weather fetch');
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${GARDEN_LAT}&lon=${GARDEN_LON}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    const temperature = data.main?.temp;
    const humidity = data.main?.humidity;
    const rainfall = data.rain?.['1h'] || data.rain?.['3h'] || 0;
    const description = data.weather?.[0]?.description || '';
    const windSpeed = data.wind?.speed || 0;
    const feelsLike = data.main?.feels_like;
    const icon = data.weather?.[0]?.icon || '01d';

    // Determine alert
    let alert = null;
    if (rainfall > 7) alert = 'Heavy Rain';
    else if (humidity < 30 && temperature > 35) alert = 'Drought Alert';
    else if (windSpeed > 15) alert = 'Strong Winds';

    // Keep only one weather document
    await Weather.deleteMany({});
    await Weather.create({
      temperature,
      feelsLike,
      humidity,
      rainfall,
      description,
      windSpeed,
      alert,
      icon,
      updatedAt: new Date(),
    });

    console.log(`✅ Weather updated: ${temperature}°C, ${description}`);
  } catch (error) {
    console.error('❌ Weather fetch error:', error.message);
  }
};

module.exports = { fetchAndStoreWeather };
