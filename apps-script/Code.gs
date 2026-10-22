/**
 * SENDEROS — API mínima sobre Google Apps Script
 *
 * La planilla queda privada y este Web App es el único intermediario:
 *  - GET  ?action=rankings&callback=...  → ranking público sanitizado (JSONP)
 *  - GET  ?action=challenge&callback=... → desafío anti-bot de un solo uso
 *  - POST action=submit                  → valida y agrega una marca
 *
 * Instalación: ver apps-script/README.md. No agregar endpoints que devuelvan
 * emails, teléfonos ni comentarios sin aprobar.
 */

const HEADERS = [
  'Marca temporal',
  'Nombre',
  'Sendero',
  'Tiempo (minutos)',
  'Tiempo (segundos)',
  'Fecha del Recorrido',
  'Hora de inicio',
  'Condición del clima',
  'Comentarios',
  'Categoría',
  'Comentario aprobado',
  'Email',
];

const TRAILS = [
  'Monte Mitre - Dificultad Baja',
  'Monte Mitre - Dificultad Media',
  'Monte Mitre - Dificultad Alta',
];

const CATEGORIES = [
  'Junior (Menores de 18)',
  'Adulto (18 - 39)',
  'Master A (40 - 52)',
  'Master B (53+)',
];

const MIN_SECONDS = 60;
const MAX_SECONDS = 12 * 60 * 60;
const MAX_COMMENT = 280;
const MIN_ELAPSED_MS = 1000;
const CACHE_RANKINGS = 'senderos_rankings_v1';

// Si el script es independiente (no está atado a la planilla), pegar el ID.
const SPREADSHEET_ID = '';

// Opcional: nombre exacto de la hoja de respuestas. Vacío = primera hoja.
const SHEET_NAME = '';

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = params.callback || '';
  try {
    const action = String(params.action || 'rankings').toLowerCase();
    if (action === 'challenge') return respond_(createChallenge_(), callback);
    if (action === 'rankings') return respond_(getRankings_(), callback);
    return respond_({ error: 'acción inválida' }, callback);
  } catch (err) {
    return respond_({ error: 'error interno' }, callback);
  }
}

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Trampa para bots: el campo está oculto en la app.
    if (String(p.website || '').trim()) return json_({ ok: false });

    // Sólo el valor exacto "1" habilita el modo sin señal. Un "0" no saltea
    // el captcha ni el control de tiempo.
    const isQueued = String(p.queued || '') === '1';

    // Un humano tarda más de 1 s en completar el formulario.
    const elapsed = Number(p.elapsed || 0);
    if (!isQueued && elapsed > 0 && elapsed < MIN_ELAPSED_MS) return json_({ ok: false });

    const invalid = validate_(p);
    if (invalid) return json_({ ok: false, error: invalid });

    if (!isQueued) checkChallenge_(p);
    checkRate_(p);

    const sheet = getSheet_();
    if (isDuplicate_(sheet, p)) return json_({ ok: true, duplicate: true });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const seconds = Math.round(Number(p.seconds));
      sheet.appendRow([
        new Date(),
        safeCell_(clean_(p.name, 40)),
        String(p.trail || '').trim(),
        Math.floor(seconds / 60),
        seconds % 60,
        String(p.date || '').trim(),
        String(p.startTime || '').trim(),
        safeCell_(clean_(p.weather, 40)),
        safeCell_(clean_(p.comments, MAX_COMMENT)),
        String(p.category || '').trim(),
        false,
        safeCell_(clean_(p.email, 120)),
      ]);
    } finally {
      lock.releaseLock();
    }

    CacheService.getScriptCache().remove(CACHE_RANKINGS + '_' + currentMonthKey_());
    return json_({ ok: true });
  } catch (err) {
    // No registrar datos personales en los logs.
    return json_({ ok: false, error: 'no se pudo guardar' });
  }
}

/** Ejecutar una vez desde el editor para crear/verificar los encabezados. */
function setup() {
  const sheet = getSheet_();
  // Casillas para moderar comentarios: sólo se publican los tildados.
  if (sheet.getMaxRows() > 1) {
    sheet.getRange(2, 11, sheet.getMaxRows() - 1, 1).insertCheckboxes();
  }
  Logger.log('Hoja lista: ' + sheet.getName());
  Logger.log('Encabezados: ' + sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0].join(' | '));
}

/** Pruebas rápidas de las funciones puras. Ejecutar desde el editor. */
function selftest() {
  assert_(aliasName_('Juan Pérez', 'Adulto (18 - 39)') === 'Juan P.', 'apellido abreviado');
  assert_(aliasName_('Daniela Pérez', 'Adulto (18 - 39)') === 'Daniela P.', 'ejemplo Daniela');
  assert_(aliasName_('Ana Gómez', 'Junior (Menores de 18)') === 'Ana G.', 'apellido abreviado en menor');
  assert_(aliasName_('Juan Carlos Pérez', 'Adulto (18 - 39)') === 'Juan C. P.', 'nombre compuesto');
  assert_(aliasName_('Daniela Pérez Gómez', 'Adulto (18 - 39)') === 'Daniela P. G.', 'dos apellidos');
  assert_(parseSeconds_('12:31') === 751, 'mm:ss');
  assert_(parseSeconds_('01:02:03') === 3723, 'hh:mm:ss');
  assert_(parseSeconds_('12.517') === 751, 'minutos decimales');
  assert_(safeCell_('=HYPERLINK("x")').charAt(0) === "'", 'fórmula escapada');
  assert_(validate_({ name: 'Juan', trail: TRAILS[0], category: CATEGORIES[1], seconds: 600, date: '2026-10-22', startTime: '09:00' }) === null, 'alta válida');
  assert_(validate_({ name: 'J', trail: TRAILS[0], category: CATEGORIES[1], seconds: 600, date: '2026-10-22', startTime: '09:00' }) !== null, 'nombre corto');
  assert_(validate_({ name: 'Juan', trail: TRAILS[0], category: CATEGORIES[1], seconds: 600, date: '2026-10-22', startTime: '09:00', email: 'no-es-email' }) !== null, 'email inválido');
  assert_(validate_({ name: 'Juan', trail: TRAILS[0], category: CATEGORIES[1], seconds: 600, date: '2026-10-22', startTime: '09:00', email: 'persona@example.com' }) === null, 'email válido');
  Logger.log('selftest OK');
}

// ---------------------------------------------------------------------------
// Ranking público
// ---------------------------------------------------------------------------

function getRankings_() {
  const monthKey = currentMonthKey_();
  const cacheKey = CACHE_RANKINGS + '_' + monthKey;
  const cache = CacheService.getScriptCache();
  const hit = cache.get(cacheKey);
  if (hit) {
    try {
      return JSON.parse(hit);
    } catch (err) {
      /* cache rota: se regenera */
    }
  }

  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const width = Math.max(sheet.getLastColumn(), HEADERS.length);
  const rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
  const records = [];

  rows.forEach(function (row, index) {
    const name = String(row[1] || '').trim();
    const seconds = rowSeconds_(row[3], row[4]);
    if (!name || !seconds || seconds <= 0) return;

    // El ranking público es del mes calendario, por fecha del recorrido.
    // La planilla conserva todos los meses.
    if (monthKeyFrom_(row[5] || row[0]) !== monthKey) return;

    const category = categoryFor_(row);
    const comment = String(row[8] || '').trim().replace(/^'/, '');
    const record = {
      id: 'row_' + (index + 2),
      name: aliasName_(name, category),
      category: category,
      seconds: seconds,
      trailName: String(row[2] || 'Sendero General').trim(),
      date: formatDate_(row[5] || row[0]),
    };
    // Sólo se publica el comentario tildado por Modernización.
    if (isApproved_(row[10]) && comment) record.comment = comment;
    records.push(record);
  });

  records.sort(function (a, b) {
    return a.seconds - b.seconds;
  });

  const publicRecords = records.map(function (record) {
    const out = {
      id: record.id,
      name: record.name,
      category: record.category,
      time: clock_(record.seconds),
      trailName: record.trailName,
      date: record.date,
    };
    if (record.comment) out.comment = record.comment;
    return out;
  });

  cache.put(cacheKey, JSON.stringify(publicRecords), 60);
  return publicRecords;
}

function categoryFor_(row) {
  const direct = String(row[9] || '').trim();
  if (direct) return direct;
  const annotated = String(row[8] || '').match(/Categor[ií]a:\s*([^.]*)/i);
  return annotated ? annotated[1].trim() : 'GENERAL';
}

function aliasName_(name) {
  // Se publica el primer nombre completo y la inicial de cada palabra
  // siguiente: "Daniela Pérez" -> "Daniela P.";
  // "Daniela Pérez Gómez" -> "Daniela P. G.".
  const full = String(name || '').trim().replace(/^'+/, '').replace(/\s+/g, ' ');
  if (!full) return 'Participante';
  const parts = full.split(' ');
  const initials = parts.slice(1).map(function (part) {
    return part.charAt(0).toUpperCase() + '.';
  });
  return (parts[0] + (initials.length ? ' ' + initials.join(' ') : '')).slice(0, 40);
}

function rowSeconds_(minutesCell, secondsCell) {
  const rawSeconds = String(secondsCell === null || secondsCell === undefined ? '' : secondsCell).trim();
  if (rawSeconds !== '') {
    const mins = Number(String(minutesCell === null || minutesCell === undefined ? '' : minutesCell).replace(',', '.'));
    const secs = Number(rawSeconds.replace(',', '.'));
    if (!isNaN(secs)) return (isNaN(mins) ? 0 : mins) * 60 + secs;
  }
  return parseSeconds_(minutesCell);
}

function parseSeconds_(value) {
  const text = String(value === null || value === undefined ? '' : value).trim().replace(/\s+/g, '');
  if (!text) return 0;
  if (text.indexOf(':') !== -1) {
    const parts = text.split(':').map(function (part) {
      return Number(part.replace(',', '.'));
    });
    if (parts.some(function (n) { return isNaN(n); })) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }
  const minutes = Number(text.replace(',', '.'));
  return isNaN(minutes) ? 0 : Math.round(minutes * 60);
}

function formatDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  const text = String(value || '').trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[3] + '/' + iso[2] + '/' + iso[1];
  return text;
}

function currentMonthKey_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM');
}

/** "2026-10" a partir de una fecha de hoja, ISO o dd/mm/aaaa. */
function monthKeyFrom_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM');
  }
  const text = String(value || '').trim();
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return iso[1] + '-' + iso[2].padStart(2, '0');
  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return dmy[3] + '-' + dmy[2].padStart(2, '0');
  return '';
}

function isApproved_(value) {
  if (value === true) return true;
  const text = String(value === null || value === undefined ? '' : value).trim().toLowerCase();
  return text === 'true' || text === '1' || text === 'sí' || text === 'si' || text === 'x';
}

function clock_(total) {
  const secs = Math.max(0, Math.round(total));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(function (n) {
    return String(n).padStart(2, '0');
  }).join(':');
}

// ---------------------------------------------------------------------------
// Validación y anti-abuso
// ---------------------------------------------------------------------------

function validate_(p) {
  const name = clean_(p.name, 40);
  if (name.length < 2) return 'nombre inválido';

  const trail = String(p.trail || '').trim();
  if (TRAILS.indexOf(trail) === -1) return 'sendero inválido';

  const category = String(p.category || '').trim();
  if (CATEGORIES.indexOf(category) === -1) return 'categoría inválida';

  const seconds = Number(p.seconds);
  if (!isFinite(seconds) || seconds < MIN_SECONDS || seconds > MAX_SECONDS) {
    return 'tiempo fuera de rango';
  }

  const date = parseISODate_(p.date);
  if (!date) return 'fecha inválida';
  const now = new Date();
  const earliest = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const latest = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (date < earliest || date > latest) return 'fecha fuera de rango';

  if (!/^\d{2}:\d{2}$/.test(String(p.startTime || ''))) return 'hora inválida';
  if (String(p.comments || '').trim().length > MAX_COMMENT) return 'comentario demasiado largo';

  const email = String(p.email || '').trim();
  if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
    return 'email inválido';
  }

  return null;
}

function parseISODate_(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function clean_(value, max) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function safeCell_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function createChallenge_() {
  const a = 2 + Math.floor(Math.random() * 8);
  const b = 2 + Math.floor(Math.random() * 8);
  const nonce = Utilities.getUuid();
  CacheService.getScriptCache().put('challenge_' + nonce, String(a + b), 300);
  return { nonce: nonce, a: a, b: b };
}

function checkChallenge_(p) {
  const nonce = String(p.nonce || '');
  const answer = String(p.answer || '').trim();
  if (!nonce || !answer) throw new Error('falta verificación');

  const cache = CacheService.getScriptCache();
  const expected = cache.get('challenge_' + nonce);
  cache.remove('challenge_' + nonce);
  if (!expected || String(expected) !== answer) throw new Error('verificación inválida');
}

function checkRate_(p) {
  const cache = CacheService.getScriptCache();
  const now = new Date();
  const day = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const hour = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd-HH');
  const device = clean_(p.device, 80) || 'sin_dispositivo';
  const nameKey = normalize_(p.name);

  bump_(cache, 'rate_dev_' + device + '_' + day, 8, 21600);
  bump_(cache, 'rate_name_' + nameKey + '_' + day, 2, 21600);
  bump_(cache, 'rate_global_' + hour, 60, 3600);
}

function bump_(cache, key, max, ttl) {
  const current = Number(cache.get(key) || 0) + 1;
  if (current > max) throw new Error('demasiados envíos');
  cache.put(key, String(current), ttl);
}

function isDuplicate_(sheet, p) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const start = Math.max(2, lastRow - 500);
  const width = Math.max(sheet.getLastColumn(), HEADERS.length);
  const rows = sheet.getRange(start, 1, lastRow - start + 1, width).getValues();
  const key = normalize_(p.name) + '|' + String(p.trail || '').trim() + '|' + String(p.date || '').trim() + '|' + Math.round(Number(p.seconds));

  return rows.some(function (row) {
    const rowKey = normalize_(row[1]) + '|' + String(row[2] || '').trim() + '|' + isoFromCell_(row[5]) + '|' + Math.round(rowSeconds_(row[3], row[4]));
    return rowKey === key;
  });
}

function isoFromCell_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value || '').trim();
  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return dmy[3] + '-' + dmy[2].padStart(2, '0') + '-' + dmy[1].padStart(2, '0');
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? iso[1] + '-' + iso[2] + '-' + iso[3] : text;
}

function normalize_(value) {
  return String(value || '').trim().replace(/^'/, '').toLowerCase().replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// Planilla y respuestas
// ---------------------------------------------------------------------------

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('No hay planilla asociada.');

  const sheet = (SHEET_NAME && spreadsheet.getSheetByName(SHEET_NAME)) || spreadsheet.getSheets()[0];
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0 || !sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }
  if (lastColumn < HEADERS.length) {
    const missing = HEADERS.slice(lastColumn);
    sheet.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
  }
}

function respond_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function assert_(condition, message) {
  if (!condition) throw new Error('selftest: ' + message);
}
