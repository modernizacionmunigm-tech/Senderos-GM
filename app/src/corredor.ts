/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Corredor: nombre guardado en el teléfono y carga de marcas al ranking.
 *
 * La página no tiene servidor propio: las marcas se mandan al mismo
 * Formulario de Google que alimenta la planilla del ranking (el que usa el
 * formulario manual de "Registrar Tiempo"). La diferencia es que acá se manda
 * por atrás, sin que la persona complete nada.
 *
 * Si en el momento de terminar no hay señal, la marca queda guardada en el
 * teléfono y se sube sola cuando vuelve la conexión.
 */
import { GOOGLE_FORM_CONFIG } from './data';

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

/** Segundos -> "HH:MM:SS", que es el formato que entiende la tabla. */
export function formatSeconds(secs: number): string {
  const total = Math.max(0, Math.round(secs));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/**
 * Segundos -> minutos con tres decimales. La planilla tiene una columna
 * "Tiempo Total (minutos)", así que el cronómetro se manda en minutos: a la
 * tabla le alcanza con tres decimales para no perder ni un segundo.
 */
export function secondsToMinutesValue(secs: number): string {
  return (Math.round((secs / 60) * 1000) / 1000).toFixed(3);
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
  comments?: string;
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

/** Arma el cuerpo tal cual lo manda el formulario de Google. */
function buildBody(payload: MarkPayload): URLSearchParams {
  const entries = GOOGLE_FORM_CONFIG.entries;
  const [year, month, day] = payload.dateISO.split('-');
  const [hour, minute] = payload.startTime.split(':');

  const body = new URLSearchParams();
  body.set(entries.nombre, payload.name);
  body.set(entries.sendero, payload.trailName);
  body.set(entries.tiempo, secondsToMinutesValue(payload.seconds));
  body.set(entries.fechaYear, year || '');
  body.set(entries.fechaMonth, month || '');
  body.set(entries.fechaDay, day || '');
  body.set(entries.horaHour, hour || '');
  body.set(entries.horaMinute, minute || '');
  body.set(entries.clima, payload.weather);
  body.set(
    entries.comentarios,
    [
      `Tiempo exacto: ${formatSeconds(payload.seconds)} (cronómetro GPS).`,
      payload.comments,
    ]
      .filter(Boolean)
      .join(' ')
  );
  body.set(entries.terminos, 'Acepto');
  return body;
}

/** Manda la marca al formulario. Falla sólo si no hay conexión. */
async function sendMark(payload: MarkPayload): Promise<void> {
  const url = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    body: buildBody(payload),
  });
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
      await sendMark(mark);
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
 * sin esperar a que Google la procese.
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
      category: categoryForTrail(payload.trailName),
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

/**
 * Carga la marca: aparece al instante en el ranking y se manda al formulario.
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
