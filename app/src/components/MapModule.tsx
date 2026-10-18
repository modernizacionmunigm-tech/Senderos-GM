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
  
  // Nuevos estados para Modo Simple y Checkpoints
  const [simpleMode, setSimpleMode] = useState(initialSimpleMode);
  const [showCheckpointBtn, setShowCheckpointBtn] = useState(false);
  const [lastCheckpointIndex, setLastCheckpointIndex] = useState(-1);
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(null);

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
      attribution: 'Tiles &copy; Esri'
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

      // 2. Draw Points of Interest (Solo referencia visual con NÚMEROS)
      trail.pointsOfInterest.forEach((poi, pIdx) => {
        // Icono con número para checkpoints, ícono especial para inicio/fin
        let iconContent = String(pIdx + 1);
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

  // Check proximity to next checkpoint (validación pasiva, sin QR)
  const checkCheckpointProximity = () => {
    if (!selectedTrailId || !userCoords) return false;
    
    const trail = TRAILS.find(t => t.id === selectedTrailId);
    if (!trail) return false;

    // Encontrar el siguiente checkpoint
    const nextPoiIndex = lastCheckpointIndex + 1;
    if (nextPoiIndex >= trail.pointsOfInterest.length) return false; // Ya terminaste

    const nextPoi = trail.pointsOfInterest[nextPoiIndex];
    const distanceToPoi = calculateDistance(userCoords[0], userCoords[1], nextPoi.lat, nextPoi.lng);

    // Radio de 30 metros para considerar que pasaste
    if (distanceToPoi < 30) {
      setLastCheckpointIndex(nextPoiIndex);
      setCheckpointMessage(`✅ ¡Pasaste por el punto ${nextPoiIndex + 1}: ${nextPoi.name}!`);
      setTimeout(() => setCheckpointMessage(null), 4000);
      triggerVibrate([100, 50, 100]);
      return true;
    }
    return false;
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
    setRecordStartTime(Date.now());
    setRecordPath([]);
    setTotalDistance(0);
    setLastCheckpointIndex(-1);
    setShowCheckpointBtn(true); // Mostrar botón de check-in al iniciar

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const accurate = accuracy && accuracy < 60;
      
      setGpsAccuracy(accuracy);
      setUserCoords([latitude, longitude]);
      updateUserMarker(latitude, longitude, accuracy);

      // Verificar si pasó por un checkpoint automáticamente (sin QR)
      checkCheckpointProximity();

      setRecordPath((prev) => {
        const nextPath = [...prev, [latitude, longitude] as [number, number]];
        
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const increment = calculateDistance(last[0], last[1], latitude, longitude);
          
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
      if (err.code === err.TIMEOUT) message = 'Se agotó tiempo de GPS';
      setGeolocationError(message);
    };

    hapticIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess, 
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );

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
  }, [recording, selectedTrailId, userCoords]);

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
    setRecording(true);
  };

  const stopTracking = () => {
    triggerVibrate(100);
    setRecording(false);
    setShowCheckpointBtn(false);
    
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
                   if(checkCheckpointProximity()) {
                     // Ya mostró mensaje
                   } else {
                     setCheckpointMessage("📍 Ubicación registrada (Lejos de checkpoint)");
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

          {/* Geolocation notifications overlay */}
          {geolocationError && (
            <div className="absolute top-4 left-4 right-4 z-20 p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2.5 shadow-md">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1">
                <strong>GPS: </strong>{geolocationError}
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