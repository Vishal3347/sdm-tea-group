'use client';
import { useState, useEffect } from 'react';
import { Cloud, Droplets, Thermometer, Wind, AlertTriangle, RefreshCw, Leaf } from 'lucide-react';
import api from '../../lib/api';

export default function WeatherHeader() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      const res = await api.get('/weather');
      setWeather(res.data);
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const alertColor = weather?.alert
    ? weather.alert.includes('Rain') ? 'bg-blue-600'
    : weather.alert.includes('Drought') ? 'bg-orange-500'
    : 'bg-yellow-500'
    : '';

  return (
    <header className="sticky top-0 z-50 bg-tea-900 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-tea-700/50">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-tea-600">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide font-serif">SDM Tea Group LLP</span>
            <span className="text-tea-400 text-xs ml-2">– Sultanicherra</span>
          </div>
        </div>

        {/* Weather Info */}
        <div className="flex items-center gap-4 text-xs">
          {loading ? (
            <span className="text-tea-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Loading weather...
            </span>
          ) : weather ? (
            <>
              <span className="text-tea-300 hidden md:block">{weather.gardenName}</span>
              <div className="flex items-center gap-1 text-orange-300">
                <Thermometer className="w-3.5 h-3.5" />
                <span className="font-semibold">{weather.temperature?.toFixed(1) ?? '--'}°C</span>
              </div>
              <div className="flex items-center gap-1 text-blue-300">
                <Droplets className="w-3.5 h-3.5" />
                <span>{weather.humidity ?? '--'}%</span>
              </div>
              <div className="flex items-center gap-1 text-sky-300 hidden sm:flex">
                <Cloud className="w-3.5 h-3.5" />
                <span>{weather.rainfall ?? 0} mm</span>
              </div>
              <div className="flex items-center gap-1 text-tea-300 hidden lg:flex">
                <Wind className="w-3.5 h-3.5" />
                <span>{weather.windSpeed?.toFixed(1) ?? '--'} m/s</span>
              </div>
              {weather.alert && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${alertColor} alert-pulse text-white font-semibold`}>
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">{weather.alert}</span>
                </div>
              )}
              <span className="text-tea-500 text-xs hidden xl:block capitalize">{weather.description}</span>
            </>
          ) : (
            <span className="text-tea-400">Weather unavailable</span>
          )}
        </div>
      </div>
    </header>
  );
}
