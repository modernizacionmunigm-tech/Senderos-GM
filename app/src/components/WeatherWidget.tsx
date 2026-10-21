/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, RefreshCw } from 'lucide-react';
import { WeatherData } from '../types';
import { GUARDIA_MITRE_CENTER } from '../data';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      // Las coordenadas del pueblo (no las del sendero): es el dato que le
      // interesa a quien va a salir. Antes apuntaban ~90 km al este.
      const [lat, lng] = GUARDIA_MITRE_CENTER;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=America%2FArgentina%2FSalta`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      
      const current = data.current;
      const code = current.weather_code;
      const precip = Number(current.precipitation) || 0;
      
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

      // El código puede quedar corto en lloviznas finas: si está precipitando,
      // manda la precipitación medida.
      if (precip > 0) {
        condition = precip >= 0.5 ? 'Lluvia' : 'Llovizna';
        icon = 'rain';
      }

      setWeather({
        temp: Math.round(current.temperature_2m),
        condition,
        icon,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        observedAt: String(current.time || '').slice(11, 16) || undefined,
      });
    } catch (e) {
      console.error('Error fetching weather:', e);
      // Sin datos no inventamos un clima: se muestra que no se pudo.
      setWeather(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // El clima cambia: cada 10 minutos se vuelve a consultar.
    const timer = window.setInterval(fetchWeather, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
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
          ) : !weather ? (
            <p className="text-sm text-gray-500">
              No pudimos consultar el clima. Probá con el botón de actualizar.
            </p>
          ) : (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800 font-display">{weather.temp}°C</span>
                <span className="text-sm font-medium text-gray-600">{weather.condition}</span>
              </div>
              <span className="text-[10px] text-gray-400">
                Según Open-Meteo
                {weather.observedAt ? ` · dato de las ${weather.observedAt}` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-600 border-t border-emerald-900/5 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-around">
        <div className="flex items-center gap-1.5">
          <Wind className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-xs text-gray-400 block">Viento</span>
            <span className="font-semibold font-mono">{loading || !weather ? '--' : `${weather.windSpeed} km/h`}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-xs text-gray-400 block">Humedad</span>
            <span className="font-semibold font-mono">{loading || !weather ? '--' : `${weather.humidity}%`}</span>
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
