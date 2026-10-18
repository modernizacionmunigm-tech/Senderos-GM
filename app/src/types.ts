/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'baja' | 'media' | 'alta';

export interface PointOfInterest {
  name: string;
  lat: number;
  lng: number;
  description: string;
  type: 'inicio' | 'fin' | 'mirador' | 'qr' | 'historico';
}

export interface Trail {
  id: string;
  name: string;
  distance: number; // in km
  elevationGain: number; // in meters
  duration: string; // e.g. "1h 30m"
  difficulty: Difficulty;
  description: string;
  longDescription: string;
  color: string; // Hex or tailwind color class
  startPoint: [number, number];
  coordinates: [number, number][]; // GPS path for Leaflet
  pointsOfInterest: PointOfInterest[];
}

export interface TimeRecord {
  id: string;
  name: string;
  category: string;
  time: string; // "HH:MM:SS" or "MM:SS"
  trailName: string;
  date: string; // "DD/MM/YYYY"
  isLocal?: boolean; // To distinguish user-added from hardcoded ones
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}
