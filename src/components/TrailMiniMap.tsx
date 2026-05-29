/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trail } from '../types';

interface TrailMiniMapProps {
  trail: Trail;
}

export default function TrailMiniMap({ trail }: TrailMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove any existing leaflet map in container to avoid double-initialization
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const start = trail.startPoint || [trail.coordinates[0][0], trail.coordinates[0][1]];

    // Create the map focusing on the start position
    const map = L.map(mapContainerRef.current, {
      center: [start[0], start[1]],
      zoom: 14,
      scrollWheelZoom: false, // gentle interaction for inline lists
      dragging: !L.Browser.mobile, // prevent dragging on mobile unless they swipe with two fingers
    });

    mapRef.current = map;

    // Use a clean, beautiful OpenStreetMap map stile (CARTO DB Positron or similar matches our aesthetic beautifully)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Draw the polyline tracing the coordinates path
    const polylineCoords = trail.coordinates.map(coord => [coord[0], coord[1]] as [number, number]);
    const polyline = L.polyline(polylineCoords, {
      color: trail.color || '#10b981',
      weight: 4,
      opacity: 0.85,
      lineJoin: 'round'
    }).addTo(map);

    // Fit bounds to polyline paths
    try {
      map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    } catch (e) {
      // safe fallback
    }

    // Add starting point indicator using a nice custom CircleMarker to avoid broken PNG icon paths in bundlers
    const startPointMarker = L.circleMarker([start[0], start[1]], {
      radius: 7,
      fillColor: '#10b981', // green start cue
      color: '#ffffff',
      weight: 1.5,
      fillOpacity: 1
    }).addTo(map);

    startPointMarker.bindPopup(`<strong>Inicio: ${trail.name}</strong><br/>¡Punto de partida oficial!`);

    // Add key POIs along the way
    trail.pointsOfInterest.forEach((poi) => {
      let color = '#3b82f6'; // POI default blue
      if (poi.type === 'inicio') color = '#10b981';
      else if (poi.type === 'fin') color = '#ef4444';
      else if (poi.type === 'mirador') color = '#f59e0b';
      else if (poi.type === 'qr') color = '#a855f7';

      const marker = L.circleMarker([poi.lat, poi.lng], {
        radius: 5.5,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`<strong>${poi.name}</strong><br/><span style="font-size:11px;">${poi.description}</span>`);
    });

    // Invalidate size helper for correct tile rendering inside transitions
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [trail]);

  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-100 shadow-inner group">
      {/* Map Division */}
      <div 
        ref={mapContainerRef} 
        id={`map-inline-${trail.id}`}
        className="w-full h-full z-10" 
      />
      {/* Overlay status marker */}
      <div className="absolute bottom-2.5 left-2.5 z-20 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-md border border-gray-100 text-[9px] font-bold uppercase text-gray-700 pointer-events-none shadow-xs font-mono">
        Mapa Interactivo 📍
      </div>
    </div>
  );
}
