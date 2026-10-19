/**
@license
SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Play,
  Square,
  MapPin,
  Compass,
  Navigation,
  Layers,
  Activity,
  Crosshair,
  RotateCcw,
  AlertTriangle,
  EyeOff,
  Eye,
  CheckCircle2
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

// Punto más cercano del trazado y distancia al mismo (sirve para el aviso de
// desvío y para orientar la brújula). Mide contra los tramos, no sólo contra
// los vértices, para que sea preciso.
function nearestPointOnPath(lat: number, lng: number, path: [number, number][]) {
  if (path.length === 0) return null;
  if (path.length === 1) {
    return {
      lat: path[0][0],
      lng: path[0][1],
      distance: calculateDistance(lat, lng, path[0][0], path[0][1]),
    };
  }

  const mPerDegLat = 111320;
  const mPerDegLon = 111320 * Math.cos((lat * Math.PI) / 180);
  const px = lng * mPerDegLon;
  const py = lat * mPerDegLat;
  let best = Infinity;
  let bestLat = path[0][0];
  let bestLng = path[0][1];

  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const ax = a[1] * mPerDegLon, ay = a[0] * mPerDegLat;
    const bx = b[1] * mPerDegLon, by = b[0] * mPerDegLat;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (d < best) {
      best = d;
      bestLat = a[0] + (b[0] - a[0]) * t;
      bestLng = a[1] + (b[1] - a[1]) * t;
    }
  }

  return { lat: bestLat, lng: bestLng, distance: best };
}

// Rumbo inicial (grados desde el norte) para orientar la flecha de la brújula
function bearingBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLambda = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
function cardinalName(deg: number) {
  return CARDINALS[Math.round(deg / 45) % 8];
}

interface MapModuleProps {
  selectedTrailId: string | null;
  onSelectTrail: (trailId: string | null) => void;
  initialSimpleMode?: boolean;
}

export default function MapModule({ selectedTrailId, onSelectTrail, initialSimpleMode = false }: MapModuleProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layers refs
  const baseTilesRef = useRef<L.TileLayer | null>(null);
  const satelliteTilesRef = useRef<L.TileLayer | null>(null);
  const trailsGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const recordingGroupRef = useRef<L.FeatureGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Refs espejo: permiten que el watchPosition lea el estado actual sin
  // reiniciarse en cada lectura (reiniciarlo borraba el recorrido grabado).
  const userCoordsRef = useRef<[number, number] | null>(null);
  const selectedTrailIdRef = useRef<string | null>(selectedTrailId);
  const recordingRef = useRef(false);
  const followUserRef = useRef(false);
  const lastCheckpointRef = useRef(-1);

  // States
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [recording, setRecording] = useState(false);
  const [recordPath, setRecordPath] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState(0); // in meters
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [offRouteDistance, setOffRouteDistance] = useState<number | null>(null);
  // Brújula: distancia y rumbo al punto más cercano del sendero elegido
  const [navInfo, setNavInfo] = useState<{ distance: number; bearing: number } | null>(null);
  const [followUser, setFollowUser] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  
  // Nuevos estados para Modo Simple y Checkpoints
  const [simpleMode, setSimpleMode] = useState(initialSimpleMode);
  const [showCheckpointBtn, setShowCheckpointBtn] = useState(false);
  const [lastCheckpointIndex, setLastCheckpointIndex] = useState(-1);
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(null);

  useEffect(() => { userCoordsRef.current = userCoords; }, [userCoords]);
  useEffect(() => { recordingRef.current = recording; }, [recording]);
  useEffect(() => { followUserRef.current = followUser; }, [followUser]);
  useEffect(() => {
    selectedTrailIdRef.current = selectedTrailId;
    lastCheckpointRef.current = -1;
    setLastCheckpointIndex(-1);
    const coords = userCoordsRef.current;
    if (coords && selectedTrailId) {
      const trail = TRAILS.find(t => t.id === selectedTrailId);
      const nearest = trail ? nearestPointOnPath(coords[0], coords[1], trail.coordinates) : null;
      setOffRouteDistance(nearest ? nearest.distance : null);
      setNavInfo(nearest
        ? { distance: nearest.distance, bearing: bearingBetween(coords[0], coords[1], nearest.lat, nearest.lng) }
        : null);
    } else {
      setOffRouteDistance(null);
      setNavInfo(null);
    }
  }, [selectedTrailId]);

  useEffect(() => {
    try {
      const routes = JSON.parse(localStorage.getItem('saved_recorded_routes') || '[]');
      setSavedRoutes(routes);
    } catch (e) {
      console.warn('Error reading saved routes:', e);
    }
  }, []);

  const triggerVibrate = (pattern: number | number[] = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
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
      attribution: 'Tiles &copy; Esri'
    });
    satelliteTilesRef.current = satelliteTiles;

    // Create groups
    trailsGroupRef.current = L.featureGroup().addTo(map);
    markersGroupRef.current = L.featureGroup().addTo(map);
    recordingGroupRef.current = L.featureGroup().addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

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

      // 2. Draw Points of Interest (Solo referencia visual con NÚMEROS)
      // El inicio (▶) y la meta (■) no consumen número: si no, el punto 1
      // quedaba "afuera" de la numeración (se mostraba recién el 2).
      let poiNumber = 0;
      trail.pointsOfInterest.forEach((poi) => {
        if (poi.type !== 'inicio' && poi.type !== 'fin') poiNumber += 1;

        // Icono con número para checkpoints, ícono especial para inicio/fin
        let iconContent = poiNumber ? String(poiNumber) : '';
        let iconColor = trail.color;
        
        if (poi.type === 'inicio') {
          iconContent = '▶';
          iconColor = '#10b981'; // verde para inicio
        } else if (poi.type === 'fin') {
          iconContent = '■';
          iconColor = '#ef4444'; // rojo para fin
        } else if (poi.type === 'mirador') {
          iconContent = '👁';
          iconColor = '#f59e0b'; // ámbar para mirador
        }
        // Para otros tipos (qr, historico) simplemente mostramos el número

        const iconHtml = `
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow-md font-sans text-[11px] font-bold text-white" style="background: ${iconColor}">
            ${iconContent}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-icon-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const m = L.marker([poi.lat, poi.lng], { icon: customIcon })
          .addTo(markersGroupRef.current!)
          .bindPopup(`
            <div class="p-2 max-w-xs font-sans text-xs">
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

  // Handle active user custom marker + círculo de precisión GPS
  const updateUserMarker = (lat: number, lng: number, accuracy: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const radius = Math.max(accuracy, 5);
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng([lat, lng]).setRadius(radius);
    } else {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius,
        color: '#3b82f6',
        weight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(map);
    }

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

    if (followUserRef.current) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
    }
  };

  // Distancia al sendero seleccionado: sirve para avisar si te alejás y para la brújula
  const updateOffRouteDistance = (lat: number, lng: number) => {
    const trailId = selectedTrailIdRef.current;
    if (!trailId) {
      setOffRouteDistance(null);
      setNavInfo(null);
      return;
    }
    const trail = TRAILS.find(t => t.id === trailId);
    if (!trail) {
      setOffRouteDistance(null);
      setNavInfo(null);
      return;
    }
    const nearest = nearestPointOnPath(lat, lng, trail.coordinates);
    setOffRouteDistance(nearest ? nearest.distance : null);
    setNavInfo(nearest
      ? { distance: nearest.distance, bearing: bearingBetween(lat, lng, nearest.lat, nearest.lng) }
      : null);
  };

  // Check proximity to next checkpoint (validación pasiva, sin QR)
  const checkCheckpointProximity = (coords: [number, number]) => {
    const trailId = selectedTrailIdRef.current;
    if (!trailId) return false;

    const trail = TRAILS.find(t => t.id === trailId);
    if (!trail) return false;

    // Encontrar el siguiente checkpoint (el inicio no cuenta como checkpoint)
    let nextPoiIndex = lastCheckpointRef.current + 1;
    while (nextPoiIndex < trail.pointsOfInterest.length && trail.pointsOfInterest[nextPoiIndex].type === 'inicio') {
      nextPoiIndex += 1;
    }
    if (nextPoiIndex >= trail.pointsOfInterest.length) return false; // Ya terminaste

    const nextPoi = trail.pointsOfInterest[nextPoiIndex];
    const distanceToPoi = calculateDistance(coords[0], coords[1], nextPoi.lat, nextPoi.lng);

    // Radio de 30 metros para considerar que pasaste
    if (distanceToPoi < 30) {
      lastCheckpointRef.current = nextPoiIndex;
      setLastCheckpointIndex(nextPoiIndex);
      const poiNumber = trail.pointsOfInterest
        .slice(0, nextPoiIndex + 1)
        .filter((p) => p.type !== 'inicio' && p.type !== 'fin').length;
      const label = nextPoi.type === 'fin' ? 'la meta' : `el punto ${poiNumber}`;
      setCheckpointMessage(`✅ ¡Pasaste por ${label}: ${nextPoi.name}!`);
      setTimeout(() => setCheckpointMessage(null), 4000);
      triggerVibrate([100, 50, 100]);
      return true;
    }
    return false;
  };

  // GPS en vivo: una sola suscripción mientras el mapa está abierto.
  // Antes este efecto dependía de userCoords y se reiniciaba en cada lectura,
  // borrando el recorrido y la distancia acumulada.
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocationError('Este dispositivo no tiene GPS disponible');
      return;
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const coords: [number, number] = [latitude, longitude];

      setGpsAccuracy(accuracy);
      setUserCoords(coords);
      updateUserMarker(latitude, longitude, accuracy);
      updateOffRouteDistance(latitude, longitude);
      setGeolocationError(null);

      if (recordingRef.current) {
        checkCheckpointProximity(coords);

        setRecordPath((prev) => {
          const nextPath = [...prev, coords];

          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const increment = calculateDistance(last[0], last[1], latitude, longitude);

            // Ignoramos el ruido GPS y las lecturas muy imprecisas
            if (increment > 2 && accuracy < 50) {
              setTotalDistance((dist) => dist + increment);
            }
          }
          return nextPath;
        });
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      let message = 'Acceso GPS Denegado';
      if (err.code === err.POSITION_UNAVAILABLE) message = 'Señal GPS no disponible';
      if (err.code === err.TIMEOUT) message = 'Se agotó el tiempo de espera del GPS';
      setGeolocationError(message);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Cronómetro del recorrido
  useEffect(() => {
    if (!recording) return;
    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [recording]);

  // Mantener la pantalla encendida mientras se graba (si el navegador lo permite)
  useEffect(() => {
    if (!recording) return;

    let cancelled = false;
    const requestWakeLock = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (type: string) => Promise<any> } };
        if (nav.wakeLock && document.visibilityState === 'visible') {
          wakeLockRef.current = await nav.wakeLock.request('screen');
        }
      } catch (e) {
        console.warn('No se pudo mantener la pantalla encendida:', e);
      }
    };

    requestWakeLock();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cancelled) requestWakeLock();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (wakeLockRef.current) {
        try { wakeLockRef.current.release?.(); } catch (e) { /* noop */ }
        wakeLockRef.current = null;
      }
    };
  }, [recording]);

  // Draw active recorded coordinate tracking path on the fly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !recordingGroupRef.current) return;
    recordingGroupRef.current.clearLayers();

    if (recordPath.length > 1) {
      const pathGeo = recordPath.map(c => L.latLng(c[0], c[1]));
      
      L.polyline(pathGeo, {
        color: '#dc2626',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(recordingGroupRef.current);
    }
  }, [recordPath]);

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
          updateOffRouteDistance(latitude, longitude);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 16);
          }
        },
        (err) => {
          alert('No se pudo determinar tu ubicación exacta: ' + err.message);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const startTracking = () => {
    triggerVibrate(60);
    setRecordPath([]);
    setTotalDistance(0);
    setElapsedSeconds(0);
    lastCheckpointRef.current = -1;
    setLastCheckpointIndex(-1);
    setCheckpointMessage(null);
    setShowCheckpointBtn(true);
    setRecording(true);
  };

  const stopTracking = () => {
    triggerVibrate(100);
    setRecording(false);
    setShowCheckpointBtn(false);
    lastCheckpointRef.current = -1;
    setLastCheckpointIndex(-1);
    setCheckpointMessage(null);
    
    // Save recorded trace locally
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
      setSavedRoutes(recordedRoutes);
      
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
    <div id="map-module-layout" className="flex flex-col gap-4 h-full relative">
      
      {/* Botón flotante para activar/desactivar Modo Simple */}
      <button
        onClick={() => setSimpleMode(!simpleMode)}
        className="absolute top-4 left-4 z-30 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-emerald-600"
        title={simpleMode ? "Ver Mapa Completo" : "Modo Simple (Solo Cronómetro)"}
      >
        {simpleMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>

      {/* Botón para cambiar entre vista calle y satelital */}
      <button
        onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
        className="absolute top-4 right-20 z-30 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-blue-600"
        title={mapType === 'street' ? "Ver Vista Satelital" : "Ver Vista Calle"}
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* UI de Modo Simple: Solo Cronómetro y Botones Grandes */}
      {simpleMode && recording && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 md:p-12 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="text-center space-y-4 mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              GRABANDO RECORRIDO
            </div>
            <h2 className="text-6xl font-black text-gray-900 font-mono tracking-tighter">
              {formatTime(elapsedSeconds)}
            </h2>
            <p className="text-xl text-gray-500 font-medium">
              {(totalDistance / 1000).toFixed(2)} km recorridos
            </p>
            {gpsAccuracy && (
              <p className="text-xs text-gray-400">Precisión GPS: {Math.round(gpsAccuracy)}m</p>
            )}
          </div>

          {/* Botón de Check-in Manual (Solo visible en modo simple si está cerca o forzado) */}
          {showCheckpointBtn && (
             <div className="w-full max-w-xs space-y-3">
               <button
                 onClick={() => {
                   triggerVibrate(50);
                   // Verificar proximidad manualmente o registrar pase
                   const coords = userCoordsRef.current;
                   if (coords && checkCheckpointProximity(coords)) {
                     // Ya mostró el mensaje de checkpoint superado
                   } else {
                     setCheckpointMessage("📍 Ubicación registrada (lejos del próximo checkpoint)");
                     setTimeout(() => setCheckpointMessage(null), 3000);
                   }
                 }}
                 className="w-full py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 flex items-center justify-center gap-2 transition-all"
               >
                 <MapPin className="w-5 h-5" />
                 Marcar Checkpoint
               </button>
               {checkpointMessage && (
                 <div className="py-2 px-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium border border-emerald-100 animate-in zoom-in-95">
                   {checkpointMessage}
                 </div>
               )}
             </div>
          )}

          <button
            onClick={stopTracking}
            className="w-full max-w-sm py-5 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
          >
            <Square className="w-6 h-6 fill-current" />
            DETENER Y GUARDAR
          </button>
        </div>
      )}

      {/* Contenedor del Mapa (Oculto en modo simple grabando) */}
      {!simpleMode || !recording ? (
        <div className={`relative grow ${simpleMode && !recording ? 'h-[450px]' : 'h-[450px]'} shadow-sm rounded-2xl border border-gray-100 overflow-hidden`}>
           {/* Leaflet hook element */}
          <div id="leaflet-map-element" ref={mapContainerRef} className="h-full w-full" />

          {/* Overlay de Modo Simple cuando NO está grabando */}
          {simpleMode && !recording && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">Modo Simple Activado</h3>
              <p className="text-sm text-gray-500 max-w-xs mt-2">
                El mapa está oculto para ahorrar batería y datos. Presiona "Grabar Recorrido" para iniciar el cronómetro a pantalla completa.
              </p>
            </div>
          )}

          {/* GPS recalibrator shortcut icon overlay bottom left */}
          <button
            id="btn-gps-recenter"
            onClick={handleRecenter}
            className="absolute bottom-4 left-4 z-20 p-3 bg-white hover:bg-emerald-50 text-emerald-600 rounded-full shadow-lg border border-gray-100 transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
            title="Centrar en mi ubicación"
          >
            <Crosshair className="w-5 h-5" />
          </button>

          {/* Seguir mi ubicación (modo seguimiento) */}
          <button
            id="btn-gps-follow"
            onClick={() => {
              const next = !followUser;
              triggerVibrate();
              setFollowUser(next);
              followUserRef.current = next;
              const coords = userCoordsRef.current;
              if (next && coords && mapInstanceRef.current) {
                mapInstanceRef.current.setView(coords, Math.max(mapInstanceRef.current.getZoom(), 16), { animate: true });
              }
            }}
            className={`absolute bottom-16 left-4 z-20 p-3 rounded-full shadow-lg border transition-colors flex items-center justify-center cursor-pointer ${
              followUser
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-600 border-gray-100 hover:bg-emerald-50'
            }`}
            title={followUser ? 'Dejar de seguir mi ubicación' : 'Seguir mi ubicación'}
          >
            <Navigation className="w-5 h-5" />
          </button>

          {/* Geolocation notifications overlay */}
          {geolocationError && (
            <div className="absolute top-4 left-4 right-4 z-20 p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2.5 shadow-md">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1">
                <strong>GPS: </strong>{geolocationError}
              </div>
            </div>
          )}

          {/* Aviso de desvío: sólo mientras se graba, para no alertar de más */}
          {recording && offRouteDistance !== null && offRouteDistance > 40 && (
            <div className={`absolute ${geolocationError ? 'top-20' : 'top-4'} left-4 right-4 z-20 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2.5 shadow-md`}>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1">
                <strong>Fuera del sendero: </strong>
                estás a {Math.round(offRouteDistance)} m del trazado.
              </div>
            </div>
          )}

          {/* Brújula al sendero: flecha y distancia al punto más cercano del trazado */}
          {!simpleMode && selectedTrailId && navInfo && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-100 max-w-[calc(100%-2rem)]">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  navInfo.distance < 15 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white'
                }`}
              >
                {navInfo.distance < 15 ? (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                ) : (
                  <Navigation
                    className="w-4.5 h-4.5"
                    style={{ transform: `rotate(${navInfo.bearing - 45}deg)` }}
                  />
                )}
              </span>
              <div className="leading-tight min-w-0">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                  Brújula al sendero
                </span>
                <span className="block text-xs font-extrabold text-gray-800 truncate">
                  {navInfo.distance < 15
                    ? 'Estás sobre el sendero'
                    : `${Math.round(navInfo.distance)} m al ${cardinalName(navInfo.bearing)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Track Recorder Section (Visible siempre que no esté en modo simple grabando) */}
      {(!simpleMode || !recording) && (
        <div id="tracker-recording-panel" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" style={{ display: recording ? 'inline-block' : 'none' }}></span>
              <h4 className="font-bold text-sm tracking-tight text-gray-800 font-display flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-500" />
                {simpleMode ? 'Cronómetro GPS (Modo Simple)' : 'Grabar mi Recorrido'}
              </h4>
            </div>
            <p className="text-xs text-gray-500">
              {simpleMode 
                ? 'Modo optimizado: oculta el mapa y prioriza el cronómetro y la batería.' 
                : 'Dibuja tu trayecto en tiempo real usando el receptor de tu teléfono.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {recording && (
              <div id="gps-stats-display" className="grid grid-cols-3 gap-3 bg-red-50/50 p-2.5 rounded-xl border border-red-200/20 text-center text-xs">
                <div>
                  <span className="text-[10px] text-red-700/60 font-semibold block">DURACIÓN</span>
                  <span className="font-extrabold text-red-900 font-mono text-sm">{formatTime(elapsedSeconds)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-700/60 font-semibold block">DISTANCIA</span>
                  <span className="font-extrabold text-red-900 font-mono text-sm">{(totalDistance / 1000).toFixed(2)} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-700/60 font-semibold block">DESVÍO</span>
                  <span className={`font-extrabold font-mono text-sm ${offRouteDistance !== null && offRouteDistance > 40 ? 'text-amber-700' : 'text-red-900'}`}>
                    {offRouteDistance !== null ? `${Math.round(offRouteDistance)} m` : '—'}
                  </span>
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
                {simpleMode ? 'Iniciar Cronómetro' : 'Grabar Recorrido'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Historical routes list */}
      {!simpleMode && savedRoutes.length > 0 && (
        <div id="historical-tracks" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider font-mono">
              Mis Recorridos Grabados ({savedRoutes.length})
            </h5>
            <button
              onClick={() => {
                if (confirm('¿Borrar historial?')) {
                  localStorage.removeItem('saved_recorded_routes');
                  setSavedRoutes([]);
                  setSelectedRouteId(null);
                }
              }}
              className="text-[11px] font-semibold text-red-500 hover:text-red-700 px-2 py-1"
            >
              Borrar todo
            </button>
          </div>
          {/* Listado de recorridos */}
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