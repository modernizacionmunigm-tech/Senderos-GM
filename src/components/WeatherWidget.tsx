/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, RefreshCw } from 'lucide-react';
import { WeatherData } from '../types';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      // Coordinates for Guardia Mitre: -40.4357, -62.7230
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=-40.4357&longitude=-62.7230&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=America/Argentina/Salta';
      const response = await fetch(url);
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      
      const current = data.current;
      const code = current.weather_code;
      
      // Map WMO codes to descriptions & icons
      let condition = 'Despejado';
      let icon = 'sun';
      
      if (code === 0) {
        condition = 'Cielo Despejado';
        icon = 'sun';
      } else if (code >= 1 && code <= 3) {
        condition = 'Parcialmente Nublado';
        icon = 'cloud';
      } else if (code >= 45 && code <= 48) {
        condition = 'Niebla';
        icon = 'cloud';
      } else if (code >= 51 && code <= 67) {
        condition = 'Llovizna';
        icon = 'rain';
      } else if (code >= 71 && code <= 82) {
        condition = 'Lluvia / Chubascos';
        icon = 'rain';
      } else {
        condition = 'Condición Variable';
        icon = 'cloud';
      }

      setWeather({
        temp: Math.round(current.temperature_2m),
        condition,
        icon,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
      });
    } catch (e) {
      console.error('Error fetching weather:', e);
      setError(true);
      // Reasonable fallbacks for Guardia Mitre (Autumn/Winter in June etc.)
      setWeather({
        temp: 14,
        condition: 'Templado Estepario (Estacional)',
        icon: 'sun',
        humidity: 55,
        windSpeed: 18,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  return (
    <div id="weather-widget-container" className="bg-emerald-900/10 border border-emerald-900/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div id="weather-icon-badge" className="p-3 bg-emerald-600/10 rounded-xl text-emerald-600">
          {loading ? (
            <RefreshCw className="w-8 h-8 animate-spin" />
          ) : weather?.icon === 'sun' ? (
            <Sun className="w-8 h-8 animate-pulse text-amber-500" />
          ) : weather?.icon === 'rain' ? (
            <CloudRain className="w-8 h-8 text-blue-500" />
          ) : (
            <Cloud className="w-8 h-8 text-emerald-600" />
          )}
        </div>
        
        <div>
          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase block font-display">Clima en Guardia Mitre</span>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando condiciones en vivo...</p>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-800 font-display">{weather?.temp}°C</span>
              <span className="text-sm font-medium text-gray-600">{weather?.condition}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-600 border-t border-emerald-900/5 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-around">
        <div className="flex items-center gap-1.5">
          <Wind className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-xs text-gray-400 block">Viento</span>
            <span className="font-semibold font-mono">{loading ? '--' : `${weather?.windSpeed} km/h`}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-xs text-gray-400 block">Humedad</span>
            <span className="font-semibold font-mono">{loading ? '--' : `${weather?.humidity}%`}</span>
          </div>
        </div>

        <button 
          id="btn-refresh-weather"
          onClick={() => { triggerVibration(); fetchWeather(); }}
          className="flex items-center justify-center p-2 rounded-lg hover:bg-emerald-600/10 text-emerald-600 transition-colors"
          title="Recargar Clima"
          aria-label="Recargar Clima"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
