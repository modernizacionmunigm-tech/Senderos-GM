/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Corredor: nombre guardado en el teléfono y carga de marcas al ranking.
 *
 * La app no habla con la planilla ni con el formulario: manda la marca al
 * Web App de Apps Script (ver `api.ts`), que valida y escribe en la hoja
 * privada. Si no hay señal, la marca queda en cola y se sube sola.
 */
import { postMark, type CaptchaAnswer } from './api';

/** Nombre del corredor, para no pedirlo en cada recorrido. */
export const RUNNER_NAME_KEY = 'senderos_runner_name';

const QUEUE_KEY = 'senderos_pending_marks';
const LOCAL_RANKS_KEY = 'saved_user_ranks';

export function getRunnerName(): string {
  try {
    return (localStorage.getItem(RUNNER_NAME_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function saveRunnerName(name: string) {
  try {
    localStorage.setItem(RUNNER_NAME_KEY, name.trim());
  } catch {
    /* si el navegador no deja guardar, no pasa nada */
  }
}

/** Categoría deportiva, para no pedirla en cada recorrido. */
export const RUNNER_CATEGORY_KEY = 'senderos_runner_category';

export function getRunnerCategory(): string {
  try {
    return (localStorage.getItem(RUNNER_CATEGORY_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function saveRunnerCategory(category: string) {
  try {
    localStorage.setItem(RUNNER_CATEGORY_KEY, category.trim());
  } catch {
    /* si el navegador no deja guardar, no pasa nada */
  }
}

/** Segundos -> "HH:MM:SS", que es el formato que entiende la tabla. */
export function formatSeconds(secs: number): string {
  const total = Math.max(0, Math.round(secs));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export interface MarkPayload {
  name: string;
  trailName: string;
  seconds: number;
  /** "AAAA-MM-DD" del día del recorrido. */
  dateISO: string;
  /** "HH:MM" de cuando se apretó grabar. */
  startTime: string;
  weather: string;
  /** Categoría deportiva (Junior, Adulto, Master A, Master B). */
  category?: string;
  comments?: string;
  /** Email opcional, para verificar identidad si se pide una baja. */
  email?: string;
  /** Desafío anti-bot resuelto por la persona. */
  captcha?: CaptchaAnswer;
  /** Campo trampa: tiene que ir vacío. */
  honeypot?: string;
  /** Milisegundos que tardó en completar el formulario. */
  elapsedMs?: number;
}

interface QueuedMark extends MarkPayload {
  id: string;
  createdAt: number;
}

/** La categoría no la pregunta el formulario: se deduce del sendero. */
function categoryForTrail(trailName: string): string {
  const lower = trailName.toLowerCase();
  if (lower.includes('alta')) return 'MONTE';
  return 'GENERAL';
}

function dateForTable(dateISO: string): string {
  const [y, m, d] = (dateISO || '').split('-');
  return y && m && d ? `${d}/${m}/${y}` : new Date().toLocaleDateString('es-AR');
}

function readQueue(): QueuedMark[] {
  try {
    const raw = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMark[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* noop */
  }
}

function queueMark(payload: MarkPayload, id?: string) {
  const queue = readQueue();
  if (id) {
    const index = queue.findIndex((m) => m.id === id);
    if (index > -1) {
      queue[index] = { ...queue[index], ...payload };
      writeQueue(queue);
      return;
    }
  }
  const mark: QueuedMark = {
    ...payload,
    id: `mark_${Date.now()}`,
    createdAt: Date.now(),
  };
  writeQueue([mark, ...queue]);
}

/** Cuántas marcas quedaron esperando señal. */
export function pendingMarksCount(): number {
  return readQueue().length;
}

/** Intenta subir las marcas que quedaron en cola. Devuelve cuántas subió. */
export async function flushPendingMarks(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const left: QueuedMark[] = [];
  let sent = 0;
  for (const mark of queue) {
    try {
      await sendMark(mark, true);
      sent += 1;
    } catch {
      left.push(mark);
    }
  }
  writeQueue(left);
  return sent;
}

/**
 * Guarda la marca en el teléfono para que aparezca al instante en la tabla,
 * sin esperar a que el servidor la procese.
 */
function saveLocalRank(payload: MarkPayload) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_RANKS_KEY) || '[]');
    const list = Array.isArray(existing) ? existing : [];
    const date = dateForTable(payload.dateISO);
    const time = formatSeconds(payload.seconds);

    // Si ya está cargada (por ejemplo, apretó dos veces), no la duplicamos.
    const repeated = list.some(
      (run: any) =>
        run &&
        `${run.name}|${run.trailName}|${run.date}|${run.time}` ===
          `${payload.name}|${payload.trailName}|${date}|${time}`
    );
    if (repeated) return;

    const record = {
      id: `local_${Date.now()}`,
      name: payload.name,
      category: payload.category || categoryForTrail(payload.trailName),
      time,
      trailName: payload.trailName,
      date,
      isLocal: true,
    };
    localStorage.setItem(LOCAL_RANKS_KEY, JSON.stringify([record, ...list]));
  } catch {
    /* noop */
  }
}

async function sendMark(payload: MarkPayload, queued = false): Promise<void> {
  await postMark({
    name: payload.name,
    trailName: payload.trailName,
    seconds: payload.seconds,
    dateISO: payload.dateISO,
    startTime: payload.startTime,
    weather: payload.weather,
    category: payload.category || categoryForTrail(payload.trailName),
    comments: payload.comments,
    email: payload.email,
    captcha: payload.captcha,
    honeypot: payload.honeypot,
    elapsedMs: payload.elapsedMs,
    queued,
  });
}

/**
 * Carga la marca: aparece al instante en el ranking y se manda al servidor.
 * Si no hay señal, queda en cola y devuelve "en_cola".
 */
export async function submitMark(payload: MarkPayload): Promise<'enviado' | 'en_cola'> {
  saveLocalRank(payload);
  try {
    await sendMark(payload);
    return 'enviado';
  } catch {
    queueMark(payload);
    return 'en_cola';
  }
}
