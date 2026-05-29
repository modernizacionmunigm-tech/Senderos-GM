/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Play, 
  Square, 
  MapPin, 
  Compass, 
  Layers, 
  Activity, 
  Crosshair, 
  RotateCcw,
  AlertTriangle 
} from 'lucide-react';
import { Trail, PointOfInterest } from '../types';
import { TRAILS, GUARDIA_MITRE_CENTER } from '../data';

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180;
  const phi2 = lat2 * Math.PI/180;
  const deltaPhi = (lat2 - lat1) * Math.PI/180;
  const deltaLambda = (lon2 - lon1) * Math.PI/180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

interface MapModuleProps {
  selectedTrailId: string | null;
  onSelectTrail: (trailId: string | null) => void;
}

export default function MapModule({ selectedTrailId, onSelectTrail }: MapModuleProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layers refs
  const baseTilesRef = useRef<L.TileLayer | null>(null);
  const satelliteTilesRef = useRef<L.TileLayer | null>(null);
  const trailsGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const recordingGroupRef = useRef<L.FeatureGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // States
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [recording, setRecording] = useState(false);
  const [recordPath, setRecordPath] = useState<[number, number][]>([]);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState(0); // in meters
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  
  const hapticIdRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<any>(null);

  useEffect(() => {
    try {
      const routes = JSON.parse(localStorage.getItem('saved_recorded_routes') || '[]');
      setSavedRoutes(routes);
    } catch (e) {
      console.warn('Error reading saved routes:', e);
    }
  }, []);

  const triggerVibrate = (ms: number = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Switch Tile layers safely
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mapType === 'street') {
      if (satelliteTilesRef.current) map.removeLayer(satelliteTilesRef.current);
      if (baseTilesRef.current) baseTilesRef.current.addTo(map);
    } else {
      if (baseTilesRef.current) map.removeLayer(baseTilesRef.current);
      if (satelliteTilesRef.current) satelliteTilesRef.current.addTo(map);
    }
  }, [mapType]);

  // Handle Initial Map Mounting Client Side
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Build the leaflet instance
    const map = L.map(mapContainerRef.current, {
      center: GUARDIA_MITRE_CENTER,
      zoom: 14,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // Add normal Street tiles
    const baseTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    });
    baseTilesRef.current = baseTiles;
    baseTiles.addTo(map);

    // Add satellite tiles (Esri)
    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Weather Source, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community'
    });
    satelliteTilesRef.current = satelliteTiles;

    // Create groups
    trailsGroupRef.current = L.featureGroup().addTo(map);
    markersGroupRef.current = L.featureGroup().addTo(map);
    recordingGroupRef.current = L.featureGroup().addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Request initial position quietly
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserCoords([latitude, longitude]);
          setGpsAccuracy(accuracy);
          updateUserMarker(latitude, longitude, accuracy);
        },
        (err) => {
          console.warn('Geolocation warning on startup:', err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Trail Rendering details when choice changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !trailsGroupRef.current || !markersGroupRef.current) return;

    // Clean up older graphics
    trailsGroupRef.current.clearLayers();
    markersGroupRef.current.clearLayers();

    const fitBoundsCoordinates: L.LatLngExpression[] = [];

    // Filter trails to render
    const trailsToDraw = selectedTrailId 
      ? TRAILS.filter(t => t.id === selectedTrailId)
      : TRAILS;

    trailsToDraw.forEach((trail) => {
      // 1. Draw Polyline
      const pathGeo = trail.coordinates.map(c => L.latLng(c[0], c[1]));
      pathGeo.forEach(c => fitBoundsCoordinates.push(c));

      const poly = L.polyline(pathGeo, {
        color: trail.color,
        weight: selectedTrailId ? 6 : 4,
        opacity: selectedTrailId ? 0.95 : 0.65,
        dashArray: selectedTrailId ? undefined : '5, 5',
      }).addTo(trailsGroupRef.current!);

      // Click to select
      poly.on('click', () => {
        triggerVibrate(30);
        onSelectTrail(trail.id);
      });

      // 2. Draw Points of Interest
      trail.pointsOfInterest.forEach((poi, pIdx) => {
        // Build crisp SVG icon representation instead of missing images
        const iconHtml = `
          <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-md font-sans text-[10px] font-bold text-white transition-transform hover:scale-110" style="background: ${trail.color}">
            ${poi.type === 'inicio' ? '▶' : poi.type === 'fin' ? '■' : poi.type === 'qr' ? 'QR' : pIdx + 1}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-icon-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const m = L.marker([poi.lat, poi.lng], { icon: customIcon })
          .addTo(markersGroupRef.current!)
          .bindPopup(`
            <div class="p-2.5 max-w-xs font-sans text-xs">
              <span class="px-1.5 py-0.5 rounded text-[9px] text-white font-bold uppercase tracking-wider block w-fit mb-1" style="background: ${trail.color}">
                ${poi.type.toUpperCase()}
              </span>
              <strong class="text-sm font-semibold text-gray-800 font-display block mb-1">${poi.name}</strong>
              <p class="text-gray-600 leading-normal">${poi.description}</p>
            </div>
          `, { className: 'custom-leaflet-popup', closeButton: false });

        m.on('click', () => { triggerVibrate(20); });
      });
    });

    // Auto-frame map space nicely
    if (fitBoundsCoordinates.length > 0) {
      map.fitBounds(L.latLngBounds(fitBoundsCoordinates), { padding: [40, 40] });
    } else {
      map.setView(GUARDIA_MITRE_CENTER, 14);
    }
  }, [selectedTrailId]);

  // Handle active user custom marker
  const updateUserMarker = (lat: number, lng: number, accuracy: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userHtml = `
      <div id="user-location-ping" class="relative flex items-center justify-center w-6 h-6">
        <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-65 animate-ping"></span>
        <div class="relative rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-lg"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'user-icon-ping',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
    }
  };

  // Live Location watch listener during active GPS Track Recording
  useEffect(() => {
    if (!recording) {
      if (hapticIdRef.current !== null) {
        navigator.geolocation.clearWatch(hapticIdRef.current);
        hapticIdRef.current = null;
      }
      return;
    }

    setGeolocationError(null);

    // Reinitialize tracking parameters
    setRecordStartTime(Date.now());
    setRecordPath([]);
    setTotalDistance(0);

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const accurate = accuracy && accuracy < 60; // accurate down to 60m
      
      setGpsAccuracy(accuracy);
      setUserCoords([latitude, longitude]);
      updateUserMarker(latitude, longitude, accuracy);

      setRecordPath((prev) => {
        const nextPath = [...prev, [latitude, longitude] as [number, number]];
        
        // Calculate new incremental geodesic distances
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const increment = calculateDistance(last[0], last[1], latitude, longitude);
          
          // Smooth out GPS static jitter
          if (increment > 1.5) {
            setTotalDistance((dist) => dist + increment);
          }
        }
        return nextPath;
      });
    };

    const handleError = (err: GeolocationPositionError) => {
      console.error('GPS Watch registration error:', err);
      let message = 'Acceso GPS Denegado';
      if (err.code === err.POSITION_UNAVAILABLE) message = 'Señal GPS no disponible';
      if (err.code === err.TIMEOUT) message = 'Se agostó tiempo de GPS';
      setGeolocationError(message);
    };

    hapticIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );

    // Start clock timer
    recordingIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (hapticIdRef.current !== null) {
        navigator.geolocation.clearWatch(hapticIdRef.current);
        hapticIdRef.current = null;
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [recording]);

  // Draw active recorded coordinate tracking path on the fly or selected historical track
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !recordingGroupRef.current) return;

    recordingGroupRef.current.clearLayers();

    // 1. Draw active recording path
    if (recordPath.length > 1) {
      const pathGeo = recordPath.map(c => L.latLng(c[0], c[1]));
      
      // Draw red tracking overlay
      L.polyline(pathGeo, {
        color: '#dc2626', // red-600
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(recordingGroupRef.current);
    } 
    // 2. Clear visual path if recording stopped, but draw selected historical path if user clicked on one in their logs
    else if (selectedRouteId) {
      try {
        const route = savedRoutes.find(r => r.id === selectedRouteId);
        if (route && route.coords && route.coords.length > 1) {
          const pathGeo = route.coords.map((c: any) => L.latLng(c[0], c[1]));
          
          const historicalPoly = L.polyline(pathGeo, {
            color: '#2563eb', // Indigo / Blue 600
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: '3, 6',
          }).addTo(recordingGroupRef.current);

          // Focus map view nicely around this custom historical route
          map.fitBounds(historicalPoly.getBounds(), { padding: [30, 30] });
        }
      } catch (e) {
        console.warn('Error rendering selected historical route:', e);
      }
    }
  }, [recordPath, selectedRouteId, savedRoutes]);

  // Center view on user current position
  const handleRecenter = () => {
    triggerVibrate();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setUserCoords([latitude, longitude]);
          setGpsAccuracy(accuracy);
          updateUserMarker(latitude, longitude, accuracy);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 16);
          }
        },
        (err) => {
          alert('No se pudo determinar tu ubicación exacta: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  };

  const startTracking = () => {
    triggerVibrate(60);
    setRecordPath([]);
    setTotalDistance(0);
    setElapsedSeconds(0);
    setRecording(true);
  };

  const stopTracking = () => {
    triggerVibrate(100);
    setRecording(false);
    
    // Save recorded trace locally for historical reference!
    if (recordPath.length > 1) {
      const recordedRoutes = JSON.parse(localStorage.getItem('saved_recorded_routes') || '[]');
      const newRoute = {
        id: 'trace_' + Date.now(),
        date: new Date().toLocaleDateString('es-AR'),
        distance: (totalDistance / 1000).toFixed(2),
        duration: formatTime(elapsedSeconds),
        trailName: selectedTrailId 
          ? TRAILS.find(t => t.id === selectedTrailId)?.name || 'Recorrido Libre'
          : 'Recorrido Libre',
        coords: recordPath,
      };
      recordedRoutes.unshift(newRoute);
      localStorage.setItem('saved_recorded_routes', JSON.stringify(recordedRoutes));
      setSavedRoutes(recordedRoutes); // Instantly update lists reactively
      
      alert(`¡Recorrido guardado con éxito! Recorriste ${(totalDistance / 1000).toFixed(2)} km en ${formatTime(elapsedSeconds)}.`);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0'),
    ].filter(Boolean).join(':');
  };

  return (
    <div id="map-module-layout" className="flex flex-col gap-4 h-full">
      {/* Search / selection Bar */}
      <div id="map-controls-panel" className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 font-display">Ver Sendero:</span>
          <select
            id="map-trail-selector"
            value={selectedTrailId || ''}
            onChange={(e) => { triggerVibrate(30); onSelectTrail(e.target.value || null); }}
            className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg max-w-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Todos los Senderos</option>
            {TRAILS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Street / Satellite mode selector toggle */}
        <div className="flex gap-1.5 items-center bg-gray-50 p-1 border border-gray-100 rounded-lg shrink-0">
          <button
            id="btn-map-street"
            onClick={() => { triggerVibrate(); setMapType('street'); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${mapType === 'street' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Callejero
          </button>
          <button
            id="btn-map-satellite"
            onClick={() => { triggerVibrate(); setMapType('satellite'); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${mapType === 'satellite' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Satelital
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative grow h-[450px] shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        
        {/* Leaflet hook element */}
        <div id="leaflet-map-element" ref={mapContainerRef} className="h-full w-full" />

        {/* GPS recalibrator shortcut icon overlay bottom left */}
        <button
          id="btn-gps-recenter"
          onClick={handleRecenter}
          className="absolute bottom-4 left-4 z-20 p-3 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full shadow-lg border border-gray-100 transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
          title="Centrar en mi ubicación"
          aria-label="Centrar en mi ubicación"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* Geolocation notifications overlay if fails */}
        {geolocationError && (
          <div className="absolute top-4 left-4 right-4 z-20 p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2.5 shadow-md">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="flex-1">
              <strong>GPS:{' '}</strong>{geolocationError}
              <p className="text-[10px] text-red-700 mt-0.5">La grabación requiere activa calibración de ubicación.</p>
            </div>
          </div>
        )}
      </div>

      {/* Track Recorder Section */}
      <div id="tracker-recording-panel" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" style={{ display: recording ? 'inline-block' : 'none' }}></span>
            <h4 className="font-bold text-sm tracking-tight text-gray-800 font-display flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500" />
              Grabar mi Recorrido (Offline GPS)
            </h4>
          </div>
          <p className="text-xs text-gray-500">
            Dibuja tu trayecto en tiempo real usando el receptor de tu teléfono. Al finalizar, registra tu marca localmente.
          </p>
        </div>

        {/* active metrics and states controls */}
        <div className="flex flex-wrap items-center gap-4">
          
          {recording && (
            <div id="gps-stats-display" className="grid grid-cols-2 gap-4 bg-red-50/50 p-2.5 rounded-xl border border-red-200/20 text-center text-xs">
              <div>
                <span className="text-[10px] text-red-700/60 font-semibold block">DURACIÓN</span>
                <span className="font-extrabold text-red-900 font-mono text-sm">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-[10px] text-red-700/60 font-semibold block">DISTANCIA</span>
                <span className="font-extrabold text-red-900 font-mono text-sm">{(totalDistance / 1000).toFixed(2)} km</span>
              </div>
            </div>
          )}

          {recording ? (
            <button
              id="btn-tracker-stop"
              onClick={stopTracking}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Detener y Guardar
            </button>
          ) : (
            <button
              id="btn-tracker-start"
              onClick={startTracking}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Grabar Recorrido
            </button>
          )}

        </div>
      </div>

      {/* Historical routes list - Shows users their recorded offline tracks directly in the UI */}
      {savedRoutes.length > 0 && (
        <div id="historical-tracks" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider font-mono">
              Mis Recorridos Grabados ({savedRoutes.length})
            </h5>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas borrar todo tu historial de recorridos?')) {
                  localStorage.removeItem('saved_recorded_routes');
                  setSavedRoutes([]);
                  setSelectedRouteId(null);
                  triggerVibrate(80);
                }
              }}
              className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Borrar todo
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {savedRoutes.map((route) => {
              const isCurrent = selectedRouteId === route.id;
              return (
                <div 
                  key={route.id}
                  onClick={() => {
                    triggerVibrate(20);
                    setSelectedRouteId(isCurrent ? null : route.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative flex flex-col justify-between gap-2.5 ${
                    isCurrent 
                      ? 'bg-blue-50/50 border-blue-400 shadow-xs' 
                      : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">{route.date}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold text-[9px] uppercase rounded">
                          Ver en mapa
                        </span>
                      )}
                    </div>
                    <strong className="text-xs text-gray-800 block leading-snug">{route.trailName}</strong>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-gray-600">
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans block">DISTANCIA</span>
                      <strong className="text-gray-800">{route.distance} km</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-sans block">DURACIÓN</span>
                      <strong className="text-gray-800">{route.duration}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
