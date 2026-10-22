#!/usr/bin/env node
/**
 * Genera los SVG de imprenta de la cartelería de los Senderos del Monte Mitre.
 *
 * CÓMO SE USA
 *   1) npm i opentype.js        (en una carpeta aparte; acá no se versiona node_modules)
 *   2) NODE_PATH="<carpeta>\node_modules" node carteleria\herramientas\generar-imprenta.js
 *      Opcional: pasar como argumento la carpeta de las tipografías
 *      (por defecto carteleria\fuentes).
 *
 * QUÉ HACE
 *   - Toma la geometría de carteleria/mockups.html (que es la fuente de verdad del diseño):
 *     no hay números copiados a mano, se leen las piezas de ahí.
 *   - Toma los datos de app/src/data.ts (distancias, puntos, descripciones): tampoco
 *     hay datos copiados a mano.
 *   - Escribe un SVG por pieza en carteleria/imprenta/, a tamaño real en milímetros,
 *     con 5 mm de sangrado y TODO EL TEXTO CONVERTIDO A CURVAS (no depende de que la
 *     imprenta tenga las tipografías instaladas).
 *
 * SI ALGO NO CIERRA, NO ESCRIBE NADA Y AVISA. Es a propósito: si se toca el mockup y
 * este script deja de encontrar una pieza o un texto, conviene que grite en vez de
 * generar archivos a medias.
 */
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const RAIZ = path.resolve(__dirname, '..', '..');
const MOCKUPS = path.join(RAIZ, 'carteleria', 'mockups.html');
const DATA = path.join(RAIZ, 'app', 'src', 'data.ts');
const IMAGENES = path.join(RAIZ, 'app', 'src', 'assets', 'images');
const SALIDA = path.join(RAIZ, 'carteleria', 'imprenta');
const FUENTES = process.argv[2] || path.join(RAIZ, 'carteleria', 'fuentes');

const SANGRADO = 5; // mm

fs.mkdirSync(SALIDA, { recursive: true });

// ---------------------------------------------------------------- utilidades

const avisos = [];
function avisar(...t) { avisos.push(t.join(' ')); }

function reemplazar(texto, buscar, poner, vecesEsperadas) {
  const n = texto.split(buscar).length - 1;
  if (vecesEsperadas !== undefined && n !== vecesEsperadas) {
    throw new Error('esperaba ' + vecesEsperadas + ' apariciones de ' + JSON.stringify(buscar) +
      ' y hay ' + n + '. ¿Cambió el mockup?');
  }
  if (n === 0) throw new Error('no aparece ' + JSON.stringify(buscar) + ' en la pieza.');
  return texto.split(buscar).join(poner);
}

// ---------------------------------------------------------------- tipografías

const ARCHIVOS = {
  'Space Grotesk|600': 'space-grotesk-v22-latin-600.ttf',
  'Space Grotesk|700': 'space-grotesk-v22-latin-700.ttf',
  'Inter|400': 'inter-v20-latin-regular.ttf',
  'Inter|500': 'inter-v20-latin-500.ttf',
  'Inter|600': 'inter-v20-latin-600.ttf',
};
const cacheFuentes = {};
function fuente(familia, peso) {
  let clave = String(familia) + '|' + String(peso);
  if (!ARCHIVOS[clave]) {
    // fuera del sistema: se resuelve al peso más cercano de las dos familias del sistema
    const familiaNorm = /space/i.test(String(familia)) ? 'Space Grotesk' : 'Inter';
    const disponibles = Object.keys(ARCHIVOS).filter(k => k.startsWith(familiaNorm + '|')).map(k => Number(k.split('|')[1]));
    const elegido = disponibles.sort((a, b) => Math.abs(a - peso) - Math.abs(b - peso))[0];
    avisar('tipografía fuera del sistema:', familia, peso, '→', familiaNorm, elegido);
    clave = familiaNorm + '|' + elegido;
  }
  if (!cacheFuentes[clave]) {
    const arch = path.join(FUENTES, ARCHIVOS[clave]);
    if (!fs.existsSync(arch)) throw new Error('falta la tipografía ' + arch + ' (ver el encabezado del script)');
    cacheFuentes[clave] = opentype.parse(fs.readFileSync(arch).buffer);
  }
  return cacheFuentes[clave];
}

// ---------------------------------------------------------------- leer el mockup

const html = fs.readFileSync(MOCKUPS, 'utf8');

function piezaDelMockup(etiqueta) {
  const marca = 'aria-label="' + etiqueta + '"';
  const i = html.indexOf(marca);
  if (i < 0) throw new Error('no encontré la pieza "' + etiqueta + '" en mockups.html');
  const ini = html.lastIndexOf('<svg', i);
  const finTag = html.indexOf('>', ini);
  let prof = 1, pos = -1;
  const re = /<svg[\s>]|<\/svg>/g;
  re.lastIndex = finTag + 1;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === '</svg>') { prof--; if (prof === 0) { pos = m.index; break; } } else prof++;
  }
  if (pos < 0) throw new Error('no pude cerrar la pieza "' + etiqueta + '"');
  const vb = (html.slice(ini, finTag).match(/viewBox="([^"]+)"/) || [])[1];
  return { viewBox: vb.split(/\s+/).map(Number), inner: html.slice(finTag + 1, pos) };
}

function symbolDelMockup(id) {
  const i = html.indexOf('<symbol id="' + id + '"');
  if (i < 0) throw new Error('no encontré el símbolo #' + id);
  const finTag = html.indexOf('>', i);
  const vb = (html.slice(i, finTag).match(/viewBox="([^"]+)"/) || [])[1];
  return { viewBox: vb, inner: html.slice(finTag + 1, html.indexOf('</symbol>', i)) };
}

// ---------------------------------------------------------------- leer data.ts

function leerSenderos() {
  const src = fs.readFileSync(DATA, 'utf8');
  const cortos = { baja: { nombre: 'BAJA', dificultad: 'fácil' }, media: { nombre: 'MEDIA', dificultad: 'intermedio' }, alta: { nombre: 'ALTA', dificultad: 'exigente' } };
  return ['baja', 'media', 'alta'].map(tipo => {
    const i = src.indexOf("id: 'monte-mitre-" + tipo + "'");
    if (i < 0) throw new Error('no encontré el sendero ' + tipo + ' en data.ts');
    const bloque = src.slice(i, src.indexOf("id: 'monte-mitre-", i + 10) > 0 ? src.indexOf("id: 'monte-mitre-", i + 10) : src.length);
    const color = (bloque.match(/color:\s*'([^']+)'/) || [])[1];
    const distancia = Number((bloque.match(/distance:\s*([\d.]+)/) || [])[1]);
    const desnivel = Number((bloque.match(/elevationGain:\s*([\d.]+)/) || [])[1]);
    // los puntos
    const iPoi = bloque.indexOf('pointsOfInterest:');
    const puntos = [];
    const re = /name:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?description:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?type:\s*'([^']+)'/g;
    const sub = bloque.slice(iPoi);
    let m;
    while ((m = re.exec(sub))) {
      puntos.push({ nombre: m[1].replace(/\\'/g, "'"), descripcion: m[2].replace(/\\'/g, "'"), tipo: m[3] });
    }
    if (!puntos.length) throw new Error('no leí los puntos de ' + tipo);
    // numeración: el inicio y la meta no consumen número (igual que el mapa de la app)
    let n = 0;
    const numerados = [];
    for (const p of puntos) {
      if (p.tipo === 'inicio' || p.tipo === 'fin') continue;
      n += 1;
      numerados.push(Object.assign({}, p, { numero: n, total: puntos.filter(x => x.tipo !== 'inicio' && x.tipo !== 'fin').length }));
    }
    return Object.assign({ tipo, color, distancia, desnivel, puntos: numerados }, cortos[tipo]);
  });
}

const SENDEROS = leerSenderos();
const km = (n) => n.toFixed(2).replace('.', ',');

// ---------------------------------------------------------------- texto → curvas

const entidades = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú', '&ntilde;': 'ñ' };
function decodificar(s) { return s.replace(/&[a-z#0-9]+;/g, e => entidades[e] || e); }

function attrsDe(txt) {
  const a = {};
  const re = /([a-zA-Z:_-][\w:.-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) a[m[1]] = m[2];
  return a;
}

function anchoDe(font, texto, tam, esp) {
  let w = 0;
  for (const ch of texto) w += font.getAdvanceWidth(ch, tam) + esp;
  return w;
}

// Arma el atributo "d" a mano. No se usa path.toPathData() de opentype.js 2.0.0:
// su redondeo devuelve NaN cuando la parte decimal es un flotante diminuto
// (por ejemplo 202.00000000000006), y eso mete "NaN" en el archivo sin avisar.
function caminoDe(path, decimales = 2) {
  const factor = Math.pow(10, decimales);
  const n = (v) => {
    if (!Number.isFinite(v)) throw new Error('coordenada inválida en un trazado: ' + v);
    const r = Math.round(v * factor) / factor;
    return Object.is(r, -0) ? '0' : String(r);
  };
  let d = '';
  for (const c of path.commands) {
    if (c.type === 'M') d += 'M' + n(c.x) + ' ' + n(c.y);
    else if (c.type === 'L') d += 'L' + n(c.x) + ' ' + n(c.y);
    else if (c.type === 'C') d += 'C' + n(c.x1) + ' ' + n(c.y1) + ' ' + n(c.x2) + ' ' + n(c.y2) + ' ' + n(c.x) + ' ' + n(c.y);
    else if (c.type === 'Q') d += 'Q' + n(c.x1) + ' ' + n(c.y1) + ' ' + n(c.x) + ' ' + n(c.y);
    else if (c.type === 'Z') d += 'Z';
    else throw new Error('comando de trazado desconocido: ' + c.type);
  }
  return d;
}

function aCurvas(inner, etiqueta) {
  return inner.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (todo, attrsTxt, contenidoRaw) => {
    const a = attrsDe(attrsTxt);
    const texto = decodificar(contenidoRaw);
    const familia = a['font-family'] || 'Inter';
    const peso = a['font-weight'] || 400;
    const tam = Number(a['font-size'] || 16);
    const esp = Number(a['letter-spacing'] || 0);
    const ancla = a['text-anchor'] || 'start';
    const font = fuente(familia, peso);
    const x = Number(a.x || 0), y = Number(a.y || 0);
    const ancho = anchoDe(font, texto, tam, esp);
    let cursor = ancla === 'middle' ? x - ancho / 2 : ancla === 'end' ? x - ancho : x;

    const trozos = [];
    let previo = null;
    for (const ch of texto) {
      const gi = font.charToGlyphIndex(ch);
      if (gi === 0 && ch !== ' ') {
        // carácter que la tipografía no tiene (los ▢ de "a completar"): se dibuja un cuadrito
        const caja = tam * 0.72;
        trozos.push('<rect x="' + (cursor + tam * 0.05).toFixed(2) + '" y="' + (y - caja).toFixed(2) +
          '" width="' + caja.toFixed(2) + '" height="' + caja.toFixed(2) +
          '" fill="none" stroke="' + (a.fill || '#111111') + '" stroke-width="' + (tam * 0.07).toFixed(2) + '"/>');
        avisar(etiqueta + ': el carácter "' + ch + '" no está en ' + familia + '; va dibujado como cuadrito.');
        cursor += tam * 0.8 + esp;
        previo = null;
        continue;
      }
      const glifo = font.glyphs.get(gi);
      if (previo) cursor += font.getKerningValue(previo, glifo) * tam / font.unitsPerEm;
      if (ch !== ' ') {
        const p = font.getPath(ch, cursor, y, tam);
        const d = caminoDe(p);
        if (d) trozos.push('<path d="' + d + '"/>');
      }
      cursor += glifo.advanceWidth * tam / font.unitsPerEm + esp;
      previo = glifo;
    }
    // atributos que se conservan del <text> (todo menos lo que ya resolvimos)
    const conservar = Object.keys(a).filter(k => !['x', 'y', 'font-family', 'font-size', 'font-weight', 'letter-spacing', 'text-anchor'].includes(k))
      .map(k => ' ' + k + '="' + a[k] + '"').join('');
    return '<g' + conservar + '>' + trozos.join('') + '</g>';
  });
}

// ---------------------------------------------------------------- imágenes

function imagenEmbebida(rutaRelativa, etiqueta) {
  const arch = path.join(RAIZ, 'carteleria', rutaRelativa);
  if (!fs.existsSync(arch)) throw new Error('no está la imagen ' + arch);
  const buf = fs.readFileSync(arch);
  // tamaño en píxeles del PNG (IHDR)
  let px = null;
  if (buf.slice(1, 4).toString() === 'PNG') px = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  const datos = 'data:image/png;base64,' + buf.toString('base64');
  return { datos, px, kb: Math.round(buf.length / 1024), etiqueta };
}

function embeberImagenes(inner, etiqueta) {
  return inner.replace(/<image\b([^>]*)\/?>/g, (todo, attrs) => {
    const a = attrsDe(attrs);
    const href = a.href || a['xlink:href'];
    if (!href) throw new Error('una <image> sin href en ' + etiqueta);
    if (href.startsWith('data:')) return todo;
    const img = imagenEmbebida(href, etiqueta);
    // aviso si la resolución no alcanza para 300 dpi
    const anchoMm = Number(a.width || 0);
    if (img.px && anchoMm) {
      const dpi = img.px.w / (anchoMm / 25.4);
      if (dpi < 300) avisar(etiqueta + ': ' + href + ' queda a ' + Math.round(dpi) + ' dpi (' + img.px.w + ' px en ' + anchoMm + ' mm).');
    }
    const limpio = attrs.replace(/\s*(xlink:)?href="[^"]*"/g, '').replace(/\/\s*$/, '');
    return '<image' + limpio + ' xlink:href="' + img.datos + '" href="' + img.datos + '"/>';
  });
}

// ---------------------------------------------------------------- armado del archivo

const CAB = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';

// Chequeo barato de buena formación: si algo de esto falla, el archivo no lo abre ni
// el navegador ni la imprenta. Preferimos que el script corte antes que entregar basura.
function validar(nombre, texto) {
  const problemas = [];
  const nan = texto.match(/\b(NaN|Infinity|undefined)\b/g);
  if (nan) problemas.push(nan.length + ' valores inválidos (NaN/Infinity/undefined)');
  const trasCierre = texto.match(/\/>\s*[a-zA-Z:][\w:.-]*\s*=/g);
  if (trasCierre) problemas.push('atributos después de "/>": ' + trasCierre.slice(0, 2).join(' | '));
  const sueltos = texto.match(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g);
  if (sueltos) problemas.push(sueltos.length + ' "&" sin escapar');
  for (const etiqueta of ['svg', 'g', 'symbol', 'defs', 'clipPath']) {
    const abre = (texto.match(new RegExp('<' + etiqueta + '[\\s>]', 'g')) || []).length;
    const cierra = (texto.match(new RegExp('</' + etiqueta + '>', 'g')) || []).length;
    if (abre !== cierra) problemas.push('<' + etiqueta + '>: ' + abre + ' abiertas, ' + cierra + ' cerradas');
  }
  if (problemas.length) throw new Error('el SVG \"' + nombre + '\" salió mal formado: ' + problemas.join('; '));
}

function archivo({ nombre, ancho, alto, sangrado, contenido, defs, nota }) {
  const s = sangrado;
  const partes = [];
  partes.push(CAB);
  partes.push('<!-- Senderos del Monte Mitre — ' + nota + ' -->\n');
  partes.push('<!-- Tamaño real: ' + ancho + ' × ' + alto + ' mm · sangrado ' + s + ' mm por lado. -->\n');
  partes.push('<!-- Generado por carteleria/herramientas/generar-imprenta.js — no editar a mano: se pisa. -->\n');
  partes.push('<!-- El texto va convertido a curvas. El diseño editable está en carteleria/mockups.html -->\n');
  partes.push('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'width="' + (ancho + 2 * s) + 'mm" height="' + (alto + 2 * s) + 'mm" ' +
    'viewBox="' + (-s) + ' ' + (-s) + ' ' + (ancho + 2 * s) + ' ' + (alto + 2 * s) + '" ' +
    'font-family="Inter, sans-serif">\n');
  if (defs) partes.push(defs + '\n');
  partes.push(contenido);
  partes.push('\n</svg>\n');
  validar(nombre, partes.join(''));
  const destino = path.join(SALIDA, nombre);
  fs.writeFileSync(destino, partes.join(''), 'utf8');
  return { archivo: nombre, kb: Math.round(fs.statSync(destino).size / 1024) };
}

// sangrado: rectángulos que continúan los colores que tocan el borde
function sangradoPlaca(color) {
  return [
    `<rect x="${-SANGRADO}" y="${-SANGRADO}" width="${250 + 2 * SANGRADO}" height="${200 + 2 * SANGRADO}" fill="#ffffff"/>`,
    `<rect x="${-SANGRADO}" y="${-SANGRADO}" width="${140 + SANGRADO}" height="${SANGRADO}" fill="${color}"/>`,
    `<rect x="140" y="${-SANGRADO}" width="${110 + SANGRADO}" height="${SANGRADO}" fill="#003366"/>`,
    `<rect x="${-SANGRADO}" y="${-SANGRADO}" width="${SANGRADO}" height="${26 + SANGRADO}" fill="${color}"/>`,
    `<rect x="250" y="${-SANGRADO}" width="${SANGRADO}" height="${26 + SANGRADO}" fill="#003366"/>`,
  ].join('');
}

// ---------------------------------------------------------------- envolver texto (para las placas de punto)

function envolver(font, texto, tam, maxMm, maxLineas) {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? actual + ' ' + palabra : palabra;
    if (anchoDe(font, prueba, tam, 0) <= maxMm || !actual) {
      actual = prueba;
    } else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) return { lineas: lineas.slice(0, maxLineas), recortado: true };
  return { lineas, recortado: false };
}

function textoEnLineas(lineas, x, yInicial, paso, tam, attrs) {
  return lineas.map((l, i) => `<text x="${x}" y="${(yInicial + i * paso).toFixed(2)}"${tam ? ' font-size="' + tam + '"' : ''}${attrs}>${l}</text>`).join('\n      ');
}

// ---------------------------------------------------------------- las piezas

const SALIDA_LISTA = [];
const symbol = symbolDelMockup('mapaTrazado');
const defsMapa = '<defs><symbol id="mapaTrazado" viewBox="' + symbol.viewBox + '">' + aCurvas(symbol.inner, 'mapa') + '</symbol></defs>';

// --- 01 · cartel de la puerta (la pieza elegida: estructura municipal + tipografía de la app)
{
  const p = piezaDelMockup('Cartel de la puerta, variante municipal');
  let inner = embeberImagenes(p.inner, 'puerta');
  inner = aCurvas(inner, 'puerta');
  const contenido = `<rect x="${-SANGRADO}" y="${-SANGRADO}" width="1410" height="1010" fill="#003366"/>` + inner;
  SALIDA_LISTA.push(archivo({ nombre: '01-cartel-puerta-1400x1000.svg', ancho: 1400, alto: 1000, sangrado: SANGRADO, contenido, defs: defsMapa, nota: 'cartel de la puerta · 1400 × 1000 mm' }));
}

// --- 01b · el mismo cartel de la puerta en la voz de la app (la pieza blanca, que quedó como referencia)
{
  const p = piezaDelMockup('Cartel de la puerta');
  let inner = embeberImagenes(p.inner, 'puerta voz app');
  inner = aCurvas(inner, 'puerta voz app');
  const contenido = `<rect x="${-SANGRADO}" y="${-SANGRADO}" width="1410" height="1010" fill="#ffffff"/>` + inner;
  SALIDA_LISTA.push(archivo({ nombre: '01b-cartel-puerta-voz-app-1400x1000.svg', ancho: 1400, alto: 1000, sangrado: SANGRADO, contenido, defs: defsMapa, nota: 'cartel de la puerta, voz de la app (referencia) · 1400 × 1000 mm' }));
}

// --- 02/03 · placas de inicio (frente) y de meta (dorso), una por sendero
{
  const frente = piezaDelMockup('Placa de inicio, frente');
  const dorso = piezaDelMockup('Placa de meta, dorso');
  for (const s of SENDEROS) {
    // frente
    let f = reemplazar(frente.inner, '#10b981', s.color, 1);
    f = reemplazar(f, '>BAJA<', '>' + s.nombre + '<', 1);
    f = reemplazar(f, '>2,38 km · desnivel 15 m<', '>' + km(s.distancia) + ' km · desnivel ' + s.desnivel + ' m<', 1);
    f = aCurvas(f, 'placa frente ' + s.nombre);
    SALIDA_LISTA.push(archivo({
      nombre: '02-placa-inicio-frente-' + s.tipo + '-250x200.svg', ancho: 250, alto: 200, sangrado: SANGRADO,
      contenido: sangradoPlaca(s.color) + f, nota: 'placa de inicio, frente · sendero ' + s.nombre,
    }));
    // dorso
    let d = reemplazar(dorso.inner, '#10b981', s.color, 1);
    d = reemplazar(d, '>Completaste el sendero BAJA<', '>Completaste el sendero ' + s.nombre + '<', 1);
    d = aCurvas(d, 'placa dorso ' + s.nombre);
    SALIDA_LISTA.push(archivo({
      nombre: '03-placa-meta-dorso-' + s.tipo + '-250x200.svg', ancho: 250, alto: 200, sangrado: SANGRADO,
      contenido: sangradoPlaca(s.color) + d, nota: 'placa de meta, dorso · sendero ' + s.nombre,
    }));
  }
}

// --- 04 · placas de punto numerado, una por punto (22 en total)
{
  const base = piezaDelMockup('Placa de punto numerado');
  const RE_NOMBRE = /(\s*<text x="106" y="(?:\d+(?:\.\d+)?)" font-family="Space Grotesk" font-weight="700" font-size="15" fill="#003366">[^<]*<\/text>)+/;
  const RE_DESC = /(\s*<text x="106" y="(?:\d+(?:\.\d+)?)" font-size="10\.5" fill="#6b7280">[^<]*<\/text>)+/;
  for (const s of SENDEROS) {
    const fontNombre = fuente('Space Grotesk', 700);
    const fontDato = fuente('Inter', 400);
    for (const p of s.puntos) {
      let inner = reemplazar(base.inner, '#ef4444', s.color, 4);
      inner = reemplazar(inner, '>3</text>', '>' + p.numero + '</text>', 1); // el número grande
      // altura: se baja el tamaño si el nombre no entra en dos renglones;
      // si aún así no entra, se le permite un tercer renglón (y se avisa)
      let tamNombre = 15;
      let env = envolver(fontNombre, p.nombre.toUpperCase(), tamNombre, 130, 2);
      while (env.recortado && tamNombre > 12) {
        tamNombre -= 0.5;
        env = envolver(fontNombre, p.nombre.toUpperCase(), tamNombre, 130, 2);
      }
      if (env.recortado && tamNombre <= 12) {
        tamNombre = 12.5;
        env = envolver(fontNombre, p.nombre.toUpperCase(), tamNombre, 128, 3);
        if (!env.recortado) {
          avisar('punto ' + p.numero + ' de ' + s.nombre + ': el nombre "' + p.nombre + '" no entra en dos renglones; va en tres a ' + tamNombre + ' mm (esa placa queda distinta de las otras 21).');
        }
      } else if (tamNombre !== 15) {
        avisar('punto ' + p.numero + ' de ' + s.nombre + ': el nombre no entraba en dos renglones a 15 mm; va a ' + tamNombre + ' mm.');
      }
      if (env.recortado) avisar('¡ATENCIÓN! punto ' + p.numero + ' de ' + s.nombre + ': el nombre "' + p.nombre + '" NO entra ni en tres renglones.');
      const yNombre = env.lineas.length === 1 ? 82 : env.lineas.length === 2 ? 72 : 64;
      const pasoNombre = env.lineas.length === 3 ? 18 : 20;
      inner = inner.replace(RE_NOMBRE, () => '\n      ' + textoEnLineas(env.lineas, 106, yNombre, pasoNombre, tamNombre, ' font-family="Space Grotesk" font-weight="700" fill="#003366"') + '\n      ');
      // la descripción: se saca la "Distancia:" del final y se envuelve
      const cuerpo = p.descripcion.replace(/\s*Distancia(?: total)?:\s*[\d.,]+\s*(km|m|mts)?\.?\s*$/i, '').trim();
      let tamDesc = 10.5;
      let envD = envolver(fontDato, cuerpo, tamDesc, 130, 3);
      while (envD.recortado && tamDesc > 9) {
        tamDesc -= 0.5;
        envD = envolver(fontDato, cuerpo, tamDesc, 130, 3);
      }
      if (tamDesc !== 10.5) avisar('punto ' + p.numero + ' de ' + s.nombre + ': la descripción bajó a ' + tamDesc + ' mm.');
      if (envD.recortado) avisar('¡ATENCIÓN! punto ' + p.numero + ' de ' + s.nombre + ': la descripción se cortó en tres renglones.');
      const yDesc = 123 + (env.lineas.length === 3 ? 6 : 0) - (envD.lineas.length - 1) * 15 / 2;
      inner = inner.replace(RE_DESC, () => '\n      ' + textoEnLineas(envD.lineas, 106, yDesc, 15, tamDesc, ' fill="#6b7280"') + '\n      ');
      // la distancia al inicio
      const m = p.descripcion.match(/Distancia(?: total)?:\s*([\d.,]+)\s*(km|m|mts)?/i);
      let distancia = '';
      if (m) {
        const valor = Number(m[1].replace(',', '.'));
        const enMetros = (m[2] || 'km').toLowerCase() === 'km' ? valor * 1000 : valor;
        if (enMetros >= 10) distancia = 'A ' + km(enMetros / 1000) + ' km del inicio';
      }
      if (!distancia) { distancia = 'A ' + km(0) + ' km del inicio'; avisar('punto ' + p.numero + ' de ' + s.nombre + ': no pude leer la distancia; quedó en blanco.'); }
      inner = reemplazar(inner, '>A 1,07 km del inicio<', '>' + distancia + '<', 1);
      // el pie
      inner = reemplazar(inner, '>PUNTO 3 DE 7 · SENDERO ALTA<', '>PUNTO ' + p.numero + ' DE ' + p.total + ' · SENDERO ' + s.nombre + '<', 1);
      inner = aCurvas(inner, 'punto ' + p.numero + ' ' + s.nombre);
      SALIDA_LISTA.push(archivo({
        nombre: '04-punto-' + s.tipo + '-' + String(p.numero).padStart(2, '0') + '-250x200.svg',
        ancho: 250, alto: 200, sangrado: SANGRADO,
        contenido: sangradoPlaca(s.color) + inner,
        nota: 'placa de punto ' + p.numero + ' de ' + p.total + ' · sendero ' + s.nombre + ' · ' + p.nombre,
      }));
    }
  }
}

// --- 05 · flechas de orientación (una por sendero; la cantidad y los lugares salen del relevamiento)
{
  const base = piezaDelMockup('Flecha de orientación');
  for (const s of SENDEROS) {
    let inner = reemplazar(base.inner, '#ef4444', s.color, 1);
    inner = reemplazar(inner, '>ALTA<', '>' + s.nombre + '<', 1);
    inner = aCurvas(inner, 'flecha ' + s.nombre);
    const fondo = `<rect x="${-SANGRADO}" y="${-SANGRADO}" width="${300 + 2 * SANGRADO}" height="${100 + 2 * SANGRADO}" fill="${s.color}"/>`;
    SALIDA_LISTA.push(archivo({
      nombre: '05-flecha-' + s.tipo + '-300x100.svg', ancho: 300, alto: 100, sangrado: SANGRADO,
      contenido: fondo + inner, nota: 'flecha de orientación · sendero ' + s.nombre,
    }));
  }
}

// ---------------------------------------------------------------- informe

console.log('\n' + SALIDA_LISTA.length + ' archivos en carteleria/imprenta/');
const porTipo = {};
for (const f of SALIDA_LISTA) {
  const tipo = f.archivo.slice(0, 2);
  porTipo[tipo] = (porTipo[tipo] || 0) + 1;
}
for (const t of Object.keys(porTipo).sort()) console.log('  ' + t + ' → ' + porTipo[t] + ' archivos');
console.log('\nsenderos leídos de data.ts:');
for (const s of SENDEROS) console.log('  ' + s.nombre.padEnd(6) + s.color + '  ' + km(s.distancia) + ' km · ' + s.desnivel + ' m · ' + s.puntos.length + ' puntos numerados');
if (avisos.length) {
  console.log('\nAVISOS (' + avisos.length + '):');
  for (const a of avisos) console.log('  · ' + a);
} else {
  console.log('\nsin avisos.');
}
