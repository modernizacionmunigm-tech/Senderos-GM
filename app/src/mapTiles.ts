// Capas de tiles del mapa, con respaldo automático y vigilancia de tiempo.
//
// Contexto (02/11/2026): OSM central le mostraba a la app el cartel
// "App is not following the tile usage policy", así que se pasó todo a Esri.
// Pero la ruta hacia Akamai (donde viven los tiles de Esri) puede cortarse
// desde algunas conexiones: los pedidos de tile quedan colgados sin responder
// y el mapa queda gris, sin ningún error en consola. Por eso este módulo:
//
//  1. arranca con el proveedor primario;
//  2. si acumula varios errores seguidos sin ningún tile bueno, salta al
//     siguiente;
//  3. si los pedidos quedan colgados (nada carga en N segundos, ni error ni
//     imagen), también salta al siguiente; y
//  4. si no queda ninguno, avisa con `{ state: 'down' }` para que la pantalla
//     muestre "no se pudo cargar el fondo" y ofrezca reintentar.
//
// Respaldo elegido: OpenTopoMap (servidores propios, estilo OSM con curvas de
// nivel, CC-BY-SA). Se descartaron tile.openstreetmap.de y
// tile.openstreetmap.fr el 02/11/2026: desde una página web devuelven una
// página 404/HTML y el navegador la bloquea (ERR_BLOCKED_BY_ORB), así que el
// respaldo no servía para nada. Exige atribución, igual que todos.

import L from 'leaflet';

/** Definición de un proveedor de tiles raster para Leaflet. */
interface TileProvider {
  name: string;
  url: string;
  attribution: string;
  maxNativeZoom: number;
}

/** Aviso del estado del fondo del mapa. */
export type TileStatus =
  | { state: 'ok'; provider: string }
  | { state: 'fallback'; provider: string; previous: string }
  | { state: 'down' };

const MAX_ZOOM = 22; // igual que el mapa: más allá estira el último tile nativo

const ESRI: TileProvider = {
  name: 'Esri',
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/{svc}/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors',
  maxNativeZoom: 19,
};

const OPENTOPOMAP: TileProvider = {
  name: 'OpenTopoMap',
  url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  maxNativeZoom: 17,
};

const PROVIDERS: { street: TileProvider[]; satellite: TileProvider[] } = {
  street: [{ ...ESRI, url: ESRI.url.replace('{svc}', 'World_Street_Map/MapServer') }, OPENTOPOMAP],
  satellite: [
    { ...ESRI, url: ESRI.url.replace('{svc}', 'World_Imagery/MapServer'), maxNativeZoom: 17 },
    // No hay proveedor satelital libre y sin clave que baje mejor desde la
    // región afectada: el respaldo usa un mapa de calles/topográfico para no
    // dejar el satelital gris y sin nada.
    OPENTOPOMAP,
  ],
};

/** Errores seguidos de tile antes de saltar al proveedor de respaldo. */
const ERRORES_ANTES_DE_FALLBACK = 4;

/** Si en este tiempo no cargó ni un tile (sin error), se da por colgado. */
const ESPERA_ANTES_DE_CREER_COLGADO_MS = 5000;

/** Cada cuánto se revisa si el fondo sigue colgado. */
const REVISION_MS = 1000;

/** Ref de la capa, para saber cuándo está en un mapa (y avisar el estado). */
function mapOf(layer: L.TileLayer): L.Map | null {
  return ((layer as unknown as { _map?: L.Map })._map) ?? null;
}

/**
 * Crea la capa de tiles de un tipo ('street' | 'satellite') con respaldo
 * automático: arranca con el proveedor primario y, si no logra cargar, cambia
 * solo al siguiente; si no queda ninguno, avisa `down`.
 *
 * onStatus se llama al cambiar de proveedor y al quedarse sin fondo. La primera
 * elección (el proveedor primario) no avisa: se asume que empieza bien.
 */
export function openTileLayer(
  kind: 'street' | 'satellite',
  onStatus?: (status: TileStatus) => void,
): L.TileLayer {
  const providers = PROVIDERS[kind];
  let current = 0;
  let loaded = 0;
  let errors = 0;
  let startedAt = 0;
  let watchdog: number | null = null;
  let finished = false;

  const layer = L.tileLayer(providers[0].url, {
    attribution: providers[0].attribution,
    maxNativeZoom: providers[0].maxNativeZoom,
    maxZoom: MAX_ZOOM,
    subdomains: 'abc',
  });

  const stopWatchdog = () => {
    if (watchdog !== null) {
      window.clearInterval(watchdog);
      watchdog = null;
    }
  };

  /** Vuelve a arrancar el reloj del proveedor en uso. */
  const resetClock = () => {
    loaded = 0;
    errors = 0;
    startedAt = Date.now();
  };

  /** Salta al siguiente proveedor o avisa que no queda fondo disponible. */
  const fail = () => {
    const map = mapOf(layer);
    if (!map || finished) return;
    if (current + 1 >= providers.length) {
      finished = true;
      stopWatchdog();
      onStatus?.({ state: 'down' });
      return;
    }
    const previous = providers[current].name;
    current += 1;
    const p = providers[current];
    resetClock();
    // Leaflet no tiene setter de maxNativeZoom: se guardó en options.
    layer.setUrl(p.url, false);
    layer.options.maxNativeZoom = p.maxNativeZoom;
    if (map.attributionControl) {
      map.attributionControl.addAttribution(p.attribution);
    }
    layer.redraw();
    onStatus?.({ state: 'fallback', provider: p.name, previous });
  };

  layer.on('add', () => {
    // Al volver a agregar la capa (cambio de fondo, salir de Modo Simple),
    // se rearma la vigilancia.
    stopWatchdog();
    finished = false;
    resetClock();
    watchdog = window.setInterval(() => {
      if (!mapOf(layer)) {
        stopWatchdog();
        return;
      }
      if (loaded > 0) {
        stopWatchdog();
        return;
      }
      // Ni un tile en todo este tiempo: los pedidos están colgados.
      if (Date.now() - startedAt >= ESPERA_ANTES_DE_CREER_COLGADO_MS) {
        fail();
      }
    }, REVISION_MS);
  });

  layer.on('remove', () => stopWatchdog());

  layer.on('tileerror', () => {
    if (!mapOf(layer)) return;
    errors += 1;
    // Alerta razonable: varios fallos seguidos y ningún éxito.
    if (errors >= ERRORES_ANTES_DE_FALLBACK && loaded === 0) {
      fail();
    }
  });

  layer.on('tileload', () => {
    loaded += 1;
    if (loaded === 1) {
      stopWatchdog();
      if (current === 0) onStatus?.({ state: 'ok', provider: providers[0].name });
    }
  });

  return layer;
}
