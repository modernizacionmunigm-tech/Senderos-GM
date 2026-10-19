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
  CheckCircle2,
  Maximize2,
  Minimize2,
  HelpCircle,
  User,
  Flag,
  Send
} from 'lucide-react';
import { Trail, PointOfInterest } from '../types';
import { TRAILS, GUARDIA_MITRE_CENTER } from '../data';
import { getRunnerName, saveRunnerName, formatSeconds, submitMark } from '../corredor';

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
  /** Avisa al padre cuando se prende/apaga el Modo Simple, así el botón del
   *  encabezado y el ojito del mapa quedan siempre sincronizados. */
  onSimpleModeChange?: (value: boolean) => void;
  /** Lleva a la tabla de posiciones después de cargar una marca. */
  onGoToRanking?: () => void;
  /** Avisa que hay una marca nueva para que la tabla se refresque. */
  onMarkSaved?: () => void;
}

export default function MapModule({ selectedTrailId, onSelectTrail, initialSimpleMode = false, onSimpleModeChange, onGoToRanking, onMarkSaved }: MapModuleProps) {
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

  // Reflejos del cronómetro y del recorrido: la lectura del GPS se registra
  // una sola vez (al abrir el mapa), así que no puede leer los estados
  // actuales. Con estos refs sabe la hora y la distancia del momento.
  const elapsedSecondsRef = useRef(0);
  const totalDistanceRef = useRef(0);
  const recordPathRef = useRef<[number, number][]>([]);
  const lastRecordedPointRef = useRef<[number, number] | null>(null);
  const finishedRef = useRef(false);
  const startInfoRef = useRef<{ dateISO: string; time: string }>({ dateISO: '', time: '' });

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
  // El mapa (que se usa a pantalla completa mientras se sigue el recorrido)
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showGpsHelp, setShowGpsHelp] = useState(false);
  const [showCheckpointBtn, setShowCheckpointBtn] = useState(false);
  const [lastCheckpointIndex, setLastCheckpointIndex] = useState(-1);
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(null);

  // Nombre del corredor: se pide una sola vez al entrar al mapa y se guarda.
  const [runnerName, setRunnerName] = useState<string>(() => getRunnerName());
  const [showNamePrompt, setShowNamePrompt] = useState<boolean>(() => !getRunnerName());
  const [nameDraft, setNameDraft] = useState<string>(() => getRunnerName());

  // Fin del recorrido: se reconoce solo cuando pasó todos los puntos y volvió
  // al inicio (o llegó a la meta, en los senderos que la tienen).
  const [finished, setFinished] = useState(false);
  const [finishSeconds, setFinishSeconds] = useState(0);
  const [finishDistance, setFinishDistance] = useState(0);
  const [finishWeather, setFinishWeather] = useState('Soleado');
  const [markStatus, setMarkStatus] = useState<'idle' | 'enviando' | 'enviado' | 'en_cola'>('idle');
  const [markName, setMarkName] = useState<string>(() => getRunnerName());
  const [markAccepted, setMarkAccepted] = useState(true);
  const [markError, setMarkError] = useState<string | null>(null);

  useEffect(() => { elapsedSecondsRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { recordPathRef.current = recordPath; }, [recordPath]);

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

  // El botón del encabezado ("Modo Simple: OFF") y el ojito del mapa mandan
  // sobre el mismo estado. El mapa avisa al padre cuando cambia el ojito, y
  // acá sigue los cambios que vengan de arriba.
  useEffect(() => {
    setSimpleMode(initialSimpleMode);
  }, [initialSimpleMode]);

  const changeSimpleMode = (value: boolean) => {
    setSimpleMode(value);
    onSimpleModeChange?.(value);
  };

  // Al entrar o salir de pantalla completa hay que avisarle a Leaflet que
  // cambió el tamaño del contenedor, si no quedan los tiles grises.
  useEffect(() => {
    const id = window.setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 120);
    return () => window.clearTimeout(id);
  }, [mapExpanded]);

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
      maxZoom: 19,
      minZoom: 11,
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
    // maxNativeZoom: en el campo la imagen de Esri no llega a los últimos
    // niveles de zoom y devuelve "Map data not yet available" (el cuadrado
    // gris). Hasta el nivel 17 hay imagen; más cerca, Leaflet agranda la
    // última que sirve en vez de mostrar el cartel de error.
    const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxNativeZoom: 17,
      maxZoom: 19,
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
    // Si la lectura es imprecisa (típico de la ubicación por red, sin señal de
    // satélites), el círculo va en ámbar: no es la posición real, es "por acá".
    const poor = accuracy > 100;
    const circleColor = poor ? '#f59e0b' : '#3b82f6';
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current
        .setLatLng([lat, lng])
        .setRadius(radius)
        .setStyle({ color: circleColor, fillColor: circleColor });
    } else {
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius,
        color: circleColor,
        weight: 1,
        fillColor: circleColor,
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
      // Con lectura imprecisa no tiene sentido acercar a nivel calle: se vería
      // una esquina equivocada como si fuera la real.
      const zoom = accuracy > 200 ? 13 : accuracy > 100 ? 15 : Math.max(map.getZoom(), 16);
      map.setView([lat, lng], zoom, { animate: true });
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
    if (nextPoiIndex >= trail.pointsOfInterest.length) {
      // Ya pasó todos los puntos: puede ser que haya terminado el recorrido.
      return checkFinish(coords, trail);
    }

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

  // El sendero elegido, para mostrar el progreso de los puntos.
  const currentTrail = selectedTrailId
    ? TRAILS.find(t => t.id === selectedTrailId) || null
    : null;
  const checkpointTotal = currentTrail
    ? currentTrail.pointsOfInterest.filter(p => p.type !== 'inicio').length
    : 0;
  const checkpointsPassed = currentTrail
    ? currentTrail.pointsOfInterest
        .slice(0, lastCheckpointIndex + 1)
        .filter(p => p.type !== 'inicio').length
    : 0;

  // Guarda el trazado grabado en el teléfono (lista "Mis recorridos").
  // Usa los refs porque también la llama la lectura del GPS, que no ve los
  // estados actuales.
  const saveRecordedRoute = () => {
    const path = recordPathRef.current;
    const distance = totalDistanceRef.current;
    const seconds = elapsedSecondsRef.current;
    if (path.length < 2) return;

    try {
      const recordedRoutes = JSON.parse(localStorage.getItem('saved_recorded_routes') || '[]');
      const trailId = selectedTrailIdRef.current;
      const trailName = trailId
        ? TRAILS.find(t => t.id === trailId)?.name || 'Recorrido Libre'
        : 'Recorrido Libre';
      const newRoute = {
        id: 'trace_' + Date.now(),
        date: new Date().toLocaleDateString('es-AR'),
        distance: (distance / 1000).toFixed(2),
        duration: formatTime(seconds),
        trailName,
        coords: path,
      };
      recordedRoutes.unshift(newRoute);
      localStorage.setItem('saved_recorded_routes', JSON.stringify(recordedRoutes));
      setSavedRoutes(recordedRoutes);
    } catch (e) {
      console.warn('No se pudo guardar el recorrido:', e);
    }
  };

  // Se terminó el recorrido: se congela el cronómetro y aparece la tarjeta
  // para cargar el tiempo en el ranking.
  const markFinished = () => {
    finishedRef.current = true;
    setFinished(true);
    setFinishSeconds(elapsedSecondsRef.current);
    setFinishDistance(totalDistanceRef.current);
    setMarkStatus('idle');
    setMarkError(null);
    setRecording(false);
    setShowCheckpointBtn(false);
    setMapExpanded(false);
    setCheckpointMessage(null);
    setMarkName(runnerName || getRunnerName());
    triggerVibrate([150, 80, 150, 80, 250]);
    saveRecordedRoute();
  };

  // ¿Llegó al final del sendero? Se pide haber pasado todos los puntos y,
  // además, haber hecho el recorrido. En los circuitos cerrados (Baja y
  // Media) hay que volver cerca del inicio; en el Alta alcanza con la meta.
  const checkFinish = (coords: [number, number], trail: Trail) => {
    if (finishedRef.current) return false;

    const covered = totalDistanceRef.current;
    if (covered < trail.distance * 1000 * 0.8) return false;

    const lastPoi = trail.pointsOfInterest[lastCheckpointRef.current];
    const endsAtFinish = !!lastPoi && lastPoi.type === 'fin';

    if (!endsAtFinish) {
      const start = trail.pointsOfInterest.find(p => p.type === 'inicio');
      const startLat = start ? start.lat : trail.startPoint[0];
      const startLng = start ? start.lng : trail.startPoint[1];
      if (calculateDistance(coords[0], coords[1], startLat, startLng) > 50) return false;
    }

    markFinished();
    return true;
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

        // El recorrido se arma por partes: primero la distancia (con el punto
        // anterior) y después el punto nuevo. El cálculo va afuera del
        // updater de React, si no el acumulado se puede contar dos veces.
        const previous = lastRecordedPointRef.current;
        if (previous) {
          const increment = calculateDistance(previous[0], previous[1], latitude, longitude);
          // Ignoramos el ruido GPS y las lecturas muy imprecisas
          if (increment > 2 && accuracy < 50) {
            totalDistanceRef.current += increment;
            setTotalDistance(totalDistanceRef.current);
          }
        }
        lastRecordedPointRef.current = coords;
        setRecordPath((prev) => [...prev, coords]);
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
            const zoom = accuracy > 200 ? 13 : accuracy > 100 ? 15 : 17;
            mapInstanceRef.current.setView([latitude, longitude], zoom);
          }
        },
        (err) => {
          alert('No se pudo determinar tu ubicación exacta: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  const startTracking = () => {
    triggerVibrate(60);
    setRecordPath([]);
    setTotalDistance(0);
    setElapsedSeconds(0);
    recordPathRef.current = [];
    totalDistanceRef.current = 0;
    elapsedSecondsRef.current = 0;
    lastRecordedPointRef.current = null;
    finishedRef.current = false;
    setFinished(false);
    setMarkStatus('idle');
    setMarkError(null);
    lastCheckpointRef.current = -1;
    setLastCheckpointIndex(-1);
    setCheckpointMessage(null);

    // Guardamos día y hora del arranque: son los que van a la planilla.
    const now = new Date();
    startInfoRef.current = {
      dateISO: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };

    // Si todavía no dijo cómo se llama, le preguntamos ahora.
    if (!runnerName && !getRunnerName()) {
      setShowNamePrompt(true);
    }

    setShowCheckpointBtn(true);
    setRecording(true);
  };

  const stopTracking = () => {
    triggerVibrate(100);
    setRecording(false);
    setShowCheckpointBtn(false);
    // Si veníamos siguiendo el recorrido a pantalla completa, volvemos a la
    // vista normal para ver el resumen y el panel de grabación.
    setMapExpanded(false);
    lastCheckpointRef.current = -1;
    setLastCheckpointIndex(-1);
    setCheckpointMessage(null);

    // Guardamos el trazado en el teléfono
    const hadPath = recordPath.length > 1;
    saveRecordedRoute();
    if (hadPath) {
      alert(`¡Recorrido guardado con éxito! Recorriste ${(totalDistance / 1000).toFixed(2)} km en ${formatTime(elapsedSeconds)}.`);
    }
  };

  // Carga la marca del cronómetro al ranking, sin pasar por el formulario.
  const handleSubmitMark = async () => {
    if (!currentTrail) return;
    const name = markName.trim();
    if (!name) {
      setMarkError('Escribí tu nombre para aparecer en la tabla.');
      return;
    }
    if (!markAccepted) {
      setMarkError('Necesitamos tu visto bueno para publicar el tiempo.');
      return;
    }

    setMarkError(null);
    setMarkStatus('enviando');
    saveRunnerName(name);
    setRunnerName(name);

    const info = startInfoRef.current;
    const today = new Date();
    const result = await submitMark({
      name,
      trailName: currentTrail.name,
      seconds: finishSeconds,
      dateISO:
        info.dateISO ||
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      startTime:
        info.time ||
        `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`,
      weather: finishWeather,
    });

    setMarkStatus(result);
    if (result === 'enviado') triggerVibrate(150);
    onMarkSaved?.();
  };

  // Calidad de la señal GPS. Sin señal de satélites el celular devuelve una
  // ubicación por red (antena/wifi) que puede estar a un kilómetro o más.
  // Eso no es un error del mapa: hay que avisarlo para no confundir.
  const gpsQuality: 'buscando' | 'alta' | 'media' | 'baja' =
    gpsAccuracy === null ? 'buscando'
      : gpsAccuracy <= 30 ? 'alta'
      : gpsAccuracy <= 100 ? 'media'
      : 'baja';
  const poorAccuracy = gpsQuality === 'baja';

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

      {/* Los controles del mapa (ojo, capas y pantalla completa) van adentro de
          la tarjeta del mapa, más abajo, para que sigan bien su posición
          cuando el mapa se pone a pantalla completa. */}

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
            {currentTrail && (
              <div className="w-full max-w-xs mx-auto space-y-1.5">
                <p className="text-xs font-bold text-gray-500">
                  Puntos: {checkpointsPassed} de {checkpointTotal}
                </p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${checkpointTotal ? (checkpointsPassed / checkpointTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
            {gpsAccuracy && (
              <p className={`text-xs font-semibold ${
                gpsAccuracy <= 30 ? 'text-emerald-600'
                  : gpsAccuracy <= 100 ? 'text-amber-600'
                  : 'text-red-600'
              }`}>
                Precisión GPS: ±{Math.round(gpsAccuracy)} m
                {gpsAccuracy > 100 && ' — salí a cielo abierto'}
              </p>
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

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => {
                triggerVibrate();
                // Pasar a ver el mapa a pantalla completa para seguir el
                // recorrido, sin dejar de grabar.
                changeSimpleMode(false);
                setMapExpanded(true);
              }}
              className="w-full py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-2xl border border-emerald-200 flex items-center justify-center gap-2 transition-all"
            >
              <Maximize2 className="w-5 h-5" />
              Ver el mapa mientras recorro
            </button>

            <button
              onClick={stopTracking}
              className="w-full py-5 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <Square className="w-6 h-6 fill-current" />
              DETENER Y GUARDAR
            </button>
          </div>
        </div>
      )}

      {/* Contenedor del Mapa (Oculto en modo simple grabando).
          En pantalla completa se sale del flujo con `fixed` y ocupa todo. */}
      {!simpleMode || !recording ? (
        <div
          className={[
            mapExpanded
              ? 'fixed inset-0 z-[45] h-[100dvh] w-screen bg-gray-100'
              : `relative grow ${simpleMode && !recording ? 'h-[450px]' : 'h-[450px]'} shadow-sm rounded-2xl border border-gray-100 overflow-hidden`,
            mapExpanded && recording ? 'map-grabando' : '',
          ].join(' ')}
        >
           {/* Leaflet hook element */}
          <div id="leaflet-map-element" ref={mapContainerRef} className="h-full w-full" />

          {/* Controles del mapa */}
          <button
            onClick={() => changeSimpleMode(!simpleMode)}
            className="absolute top-4 left-4 z-30 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-emerald-600"
            title={simpleMode ? 'Ver mapa completo' : 'Modo Simple: sólo cronómetro'}
          >
            {simpleMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
            className="absolute top-4 right-20 z-30 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-blue-600"
            title={mapType === 'street' ? 'Ver vista satelital' : 'Ver vista calle'}
          >
            <Layers className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              triggerVibrate();
              setMapExpanded(!mapExpanded);
            }}
            className="absolute top-4 right-4 z-30 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-emerald-600"
            title={mapExpanded ? 'Salir de pantalla completa' : 'Ver el mapa a pantalla completa'}
          >
            {mapExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>


          {/* Calidad de la señal GPS. Sin esto, una ubicación por antena
              (sin satélites) parece una ubicación exacta en el mapa. */}
          {!geolocationError && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md border text-[10px] font-bold whitespace-nowrap ${
                gpsQuality === 'alta' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : gpsQuality === 'media' ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : gpsQuality === 'baja' ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  gpsQuality === 'alta' ? 'bg-emerald-500'
                    : gpsQuality === 'media' ? 'bg-amber-500'
                    : gpsQuality === 'baja' ? 'bg-red-500'
                    : 'bg-gray-400 animate-pulse'
                }`}
              />
              {gpsAccuracy === null
                ? 'Buscando GPS…'
                : `${gpsQuality === 'baja' ? 'GPS aproximado' : gpsQuality === 'media' ? 'GPS regular' : 'GPS preciso'} · ±${Math.round(gpsAccuracy)} m`}
            </div>
          )}

          {/* Aviso de ubicación aproximada: pasa cuando el navegador tiene el
              permiso de ubicación en "aproximada" o el GPS no tomó señal. */}
          {poorAccuracy && !geolocationError && (
            <div className="absolute top-16 left-4 right-4 z-20 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] leading-snug shadow-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Ubicación aproximada (±{Math.round(gpsAccuracy || 0)} m).</strong>{' '}
                  El GPS todavía no tomó señal, así que el punto azul es una
                  estimación por antena. Salí a cielo abierto y revisá que el
                  permiso de ubicación del sitio sea <strong>“Precisa”</strong>.
                </div>
              </div>
              <button
                onClick={() => { triggerVibrate(); setShowGpsHelp(true); }}
                className="mt-2 w-full py-1.5 bg-white border border-amber-300 text-amber-800 font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                ¿Cómo lo activo? Paso a paso
              </button>
            </div>
          )}

          {/* Ayuda de ubicación precisa: explicada para quien no sabe de permisos */}
          {showGpsHelp && (
            <div className="absolute inset-0 z-30 bg-white/97 overflow-y-auto p-4 text-gray-800">
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="font-display font-extrabold text-base">
                    Cómo activar la ubicación precisa
                  </h3>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Si el teléfono tiene el permiso en <strong>“Aproximada”</strong>,
                  el mapa te va a mostrar una zona y no tu posición exacta. Se
                  cambia una sola vez:
                </p>

                <div className="rounded-xl border border-gray-200 p-3 space-y-1.5">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Android (Chrome)</p>
                  <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Tocá el <strong>candadito</strong> al lado de la dirección de la página.</li>
                    <li>Entrá a <strong>Permisos</strong> → <strong>Ubicación</strong>.</li>
                    <li>Elegí <strong>“Precisa”</strong> (no “Aproximada”).</li>
                    <li>Recargá la página.</li>
                  </ol>
                </div>

                <div className="rounded-xl border border-gray-200 p-3 space-y-1.5">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">iPhone (Safari)</p>
                  <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Abrí <strong>Ajustes</strong> del teléfono.</li>
                    <li><strong>Privacidad y seguridad</strong> → <strong>Localización</strong>.</li>
                    <li>Buscá <strong>Safari</strong> y elegí <strong>“Precisa”</strong>.</li>
                    <li>Recargá la página.</li>
                  </ol>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-900 leading-relaxed">
                  <strong>Importante:</strong> el GPS necesita <strong>cielo abierto</strong>.
                  Adentro de la casa, en el auto o abajo de los árboles no agarra
                  satélites. Salí al patio o a la vereda y esperá unos segundos:
                  el punto azul se va a acomodar solo.
                </div>

                <button
                  onClick={() => { triggerVibrate(); setShowGpsHelp(false); }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

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
            <div className="absolute top-16 left-4 right-4 z-20 p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs shadow-md">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <div className="flex-1">
                  <strong>GPS: </strong>{geolocationError}
                </div>
              </div>
              <button
                onClick={() => { triggerVibrate(); setShowGpsHelp(true); }}
                className="mt-2 w-full py-1.5 bg-white border border-red-300 text-red-800 font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                ¿Cómo lo activo? Paso a paso
              </button>
            </div>
          )}

          {/* Aviso de desvío: sólo mientras se graba, para no alertar de más.
              Se exige buena precisión: con una lectura por antena (±1 km)
              avisaría "fuera del sendero" sin que sea cierto. */}
          {recording && offRouteDistance !== null && offRouteDistance > 40 && gpsAccuracy !== null && gpsAccuracy <= 50 && (
            <div className={`absolute ${geolocationError ? 'top-44' : 'top-16'} left-4 right-4 z-20 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2.5 shadow-md`}>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1">
                <strong>Fuera del sendero: </strong>
                estás a {Math.round(offRouteDistance)} m del trazado.
              </div>
            </div>
          )}

          {/* Brújula al sendero: flecha y distancia al punto más cercano del trazado */}
          {!simpleMode && selectedTrailId && navInfo && (
            <div className={`absolute ${mapExpanded && recording ? 'bottom-24' : 'bottom-4'} left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-100 max-w-[calc(100%-2rem)]`}>
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  navInfo.distance < 15 ? 'bg-emerald-100 text-emerald-700'
                    : poorAccuracy ? 'bg-amber-500 text-white'
                    : 'bg-blue-600 text-white'
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
                {poorAccuracy && navInfo.distance >= 15 && (
                  <span className="block text-[9px] font-bold text-amber-600">
                    Distancia estimada: GPS impreciso
                  </span>
                )}
              </div>
            </div>
          )}
          {/* A pantalla completa y grabando: reloj y botón para detener, así no
              hay que salir de la pantalla completa para terminar el recorrido. */}
          {mapExpanded && recording && (
            <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100">
              <div className="leading-tight">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-red-500 font-mono">
                  Grabando
                </span>
                <span className="text-lg font-black font-mono text-gray-900">{formatTime(elapsedSeconds)}</span>
                <span className="block text-[10px] text-gray-500">
                  {(totalDistance / 1000).toFixed(2)} km
                  {currentTrail ? ` · ${checkpointsPassed}/${checkpointTotal} puntos` : ''}
                </span>
              </div>
              <button
                onClick={stopTracking}
                className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                Detener y guardar
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Tarjeta de fin: el recorrido se reconoció solo (pasó todos los puntos
          y volvió al inicio). Desde acá el tiempo se carga al ranking sin
          pasar por el formulario. */}
      {finished && currentTrail && (
        <div id="finish-card" className="hc-dark bg-emerald-800 text-white rounded-2xl p-5 shadow-lg space-y-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">¡Terminaste!</p>
              <h3 className="font-display font-extrabold text-lg leading-tight truncate">{currentTrail.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center bg-black/20 rounded-xl p-3">
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-200 font-mono">Tiempo</span>
              <strong className="text-base font-black font-mono">{formatSeconds(finishSeconds)}</strong>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-200 font-mono">Distancia</span>
              <strong className="text-base font-black font-mono">{(finishDistance / 1000).toFixed(2)} km</strong>
            </div>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-200 font-mono">Puntos</span>
              <strong className="text-base font-black font-mono">{checkpointTotal}/{checkpointTotal}</strong>
            </div>
          </div>

          {markStatus === 'enviado' || markStatus === 'en_cola' ? (
            <div className="space-y-3">
              <div className="bg-white/15 rounded-xl p-3 text-xs leading-relaxed">
                {markStatus === 'enviado'
                  ? '✅ Tu tiempo quedó cargado y ya figura en la tabla de posiciones.'
                  : '📥 Quedó guardado en tu teléfono. Se sube solo cuando vuelva la señal.'}
              </div>
              <div className="flex gap-2">
                {onGoToRanking && (
                  <button
                    onClick={() => { triggerVibrate(); onGoToRanking(); }}
                    className="flex-1 py-3 bg-white text-emerald-800 font-bold rounded-xl text-xs"
                  >
                    Ver la tabla
                  </button>
                )}
                <button
                  onClick={() => { triggerVibrate(); setFinished(false); finishedRef.current = false; }}
                  className="flex-1 py-3 bg-white/15 text-white font-bold rounded-xl text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Tu nombre para la tabla
                </span>
                <input
                  value={markName}
                  onChange={(e) => setMarkName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-3 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
                  ¿Cómo estuvo el clima?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Soleado', 'Nublado', 'Ventoso', 'Lluvioso'].map((w) => (
                    <button
                      key={w}
                      onClick={() => { triggerVibrate(20); setFinishWeather(w); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        finishWeather === w
                          ? 'bg-white text-emerald-800 border-white'
                          : 'bg-white/10 text-white border-white/30'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] leading-snug text-emerald-50 selection:bg-transparent">
                <input
                  type="checkbox"
                  checked={markAccepted}
                  onChange={(e) => setMarkAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-white/40"
                />
                <span>Acepto que mi nombre y mi tiempo aparezcan públicamente en el ranking.</span>
              </label>

              {markError && <p className="text-xs font-bold text-amber-200">{markError}</p>}

              <button
                onClick={handleSubmitMark}
                disabled={markStatus === 'enviando'}
                className="w-full py-3.5 bg-white text-emerald-800 font-extrabold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {markStatus === 'enviando' ? 'Cargando…' : 'Cargar mi tiempo al ranking'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pedido de nombre: una sola vez, al entrar al mapa. */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start gap-2.5">
              <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-extrabold text-base text-gray-900">¿Cómo te llamás?</h3>
                <p className="text-[11px] text-gray-500 leading-snug">
                  Se usa para cargar tu tiempo en el ranking. Queda guardado en
                  este teléfono, no se pide de nuevo.
                </p>
              </div>
            </div>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Ej: Juan Pérez o Senderista2024"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameDraft.trim()) {
                  saveRunnerName(nameDraft);
                  setRunnerName(nameDraft.trim());
                  setMarkName(nameDraft.trim());
                  setShowNamePrompt(false);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl"
              >
                Ahora no
              </button>
              <button
                onClick={() => {
                  if (!nameDraft.trim()) return;
                  triggerVibrate(50);
                  saveRunnerName(nameDraft);
                  setRunnerName(nameDraft.trim());
                  setMarkName(nameDraft.trim());
                  setShowNamePrompt(false);
                }}
                disabled={!nameDraft.trim()}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Nombre del corredor: se guarda y se usa para cargar el tiempo */}
            <button
              onClick={() => { setNameDraft(runnerName); setShowNamePrompt(true); }}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-emerald-700 transition-colors"
            >
              <User className="w-3 h-3" />
              {runnerName ? `Corredor: ${runnerName}` : 'Poner mi nombre'}
              <span className="text-gray-300">·</span>
              <span className="text-emerald-700">editar</span>
            </button>

            {/* Progreso de los puntos del sendero elegido */}
            {currentTrail && (
              <div className="pt-1 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Puntos validados: {checkpointsPassed} de {checkpointTotal}
                </p>
                <div className="h-1.5 w-44 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${checkpointTotal ? (checkpointsPassed / checkpointTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
            {!currentTrail && !recording && (
              <p className="text-[11px] font-medium text-amber-700 leading-snug">
                Elegí un sendero para que el cronómetro valide los puntos y se
                pueda cargar el tiempo al ranking.
              </p>
            )}
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