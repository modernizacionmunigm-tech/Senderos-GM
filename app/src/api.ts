/**
 * Puente entre la app y el Web App de Apps Script.
 *
 * La planilla y el formulario quedan privados: la app sólo habla con el
 * Web App, que devuelve datos ya sanitizados y valida las altas.
 *
 * Para conectar: pegá la URL del despliegue en `API_URL_FALLBACK` (o definí
 * VITE_SENDEROS_API al compilar). La URL es pública por diseño; la planilla no.
 */
import { TimeRecord } from './types';

const API_URL_FALLBACK = 'https://script.google.com/macros/s/AKfycbwDmfoJKyfmBrsm4f9kvHGCQKdWfbZheBrtJ8qJo7h8KkpyeBDxKJciLNuz7m4KubL5XA/exec';

export const API_URL =
  import.meta.env.VITE_SENDEROS_API?.trim() || API_URL_FALLBACK;

export const isApiConfigured =
  API_URL.startsWith('https://script.google.com/') &&
  !API_URL.includes('REEMPLAZAR');

const DEVICE_KEY = 'senderos_device_id';

/** Identificador anónimo del dispositivo, para limitar abusos. */
export function getDeviceId(): string {
  try {
    const saved = localStorage.getItem(DEVICE_KEY);
    if (saved) return saved;
    const fresh =
      (crypto as any)?.randomUUID?.() ??
      `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, fresh);
    return fresh;
  } catch {
    return 'sin_almacenamiento';
  }
}

export interface Challenge {
  nonce: string;
  a: number;
  b: number;
}

export interface CaptchaAnswer {
  nonce: string;
  answer: string;
}

/** Pide datos al Web App con JSONP: evita CORS y funciona en GitHub Pages. */
function jsonp<T>(params: Record<string, string>, timeoutMs = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!isApiConfigured) {
      reject(new Error('La API todavía no está configurada.'));
      return;
    }

    const callback = `__senderos_cb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const url = new URL(API_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('callback', callback);

    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      delete (window as any)[callback];
      script.remove();
      window.clearTimeout(timer);
    };

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('La respuesta tardó demasiado.'));
    }, timeoutMs);

    (window as any)[callback] = (data: T) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data);
    };

    script.async = true;
    script.src = url.toString();
    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('No se pudo conectar con el ranking.'));
    };
    document.head.appendChild(script);
  });
}

/** Ranking público del mes: nombre y apellido abreviado, sendero, tiempo, categoría, fecha y comentarios aprobados. */
export async function loadRankings(): Promise<TimeRecord[]> {
  const data = await jsonp<TimeRecord[]>({ action: 'rankings' });
  return Array.isArray(data) ? data : [];
}

/** Desafío anti-bot de un solo uso. */
export async function getChallenge(): Promise<Challenge> {
  const data = await jsonp<Challenge>({ action: 'challenge' });
  if (!data || typeof data.nonce !== 'string' || !data.nonce) {
    throw new Error('El desafío anti-bot llegó incompleto.');
  }
  return data;
}

export interface SubmitPayload {
  name: string;
  trailName: string;
  seconds: number;
  dateISO: string;
  startTime: string;
  weather: string;
  category: string;
  comments?: string;
  /** Email opcional, sólo para verificar identidad si se pide una baja. */
  email?: string;
  captcha?: CaptchaAnswer;
  /** Campo trampa: si viene completo, es un bot. */
  honeypot?: string;
  /** Tiempo que tardó la persona en completar el formulario. */
  elapsedMs?: number;
  /** Marca que se cargó sin señal y se envía al recuperar conexión. */
  queued?: boolean;
}

/**
 * Envía una marca al Web App. Usa `no-cors` porque Apps Script no expone
 * cabeceras CORS para POST; la respuesta no se lee y el servidor valida igual.
 */
export async function postMark(payload: SubmitPayload): Promise<void> {
  if (!isApiConfigured) {
    throw new Error('La API todavía no está configurada.');
  }

  const body = new URLSearchParams();
  body.set('action', 'submit');
  body.set('name', payload.name.trim());
  body.set('trail', payload.trailName);
  body.set('seconds', String(Math.round(payload.seconds)));
  body.set('date', payload.dateISO);
  body.set('startTime', payload.startTime);
  body.set('weather', payload.weather);
  body.set('category', payload.category);
  body.set('comments', (payload.comments || '').slice(0, 280));
  body.set('email', (payload.email || '').trim().slice(0, 120));
  body.set('device', getDeviceId());
  body.set('website', payload.honeypot || '');
  body.set('elapsed', String(payload.elapsedMs ?? 0));

  if (payload.captcha) {
    body.set('nonce', payload.captcha.nonce);
    body.set('answer', payload.captcha.answer);
  }
  if (payload.queued) {
    body.set('queued', '1');
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      body,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}
