/* --------------------------------------------------------------
   CONSTANTES GLOBALES – Nombres de hojas (sin espacios iniciales)
   -------------------------------------------------------------- */
const HOJAS = {
  ENCARGADOS:       "👥 Encargados",
  SOCIOS:           "👥 Socios",
  CUOTAS:           "💰 Cuotas",
  ESPACIOS:         "🏟️ Espacios",
  RESERVAS:         "📅 Reservas",
  RENDICIONES:      "🧾 Rendiciones",
  MOVIMIENTOS:      "💵 Movimientos",
  CARGA_RAPIDA:     "📝 Carga Rápida",
  RESUMEN_MENSUAL:  "📅 Resumen Mensual",
  DASHBOARD:        "📊 Dashboard",
  PANEL_CONTROL:    "🎯 Panel de Control",
  MOROSOS:          "📋 Morosos"
};

/* --------------------------------------------------------------
   CONSTANTES ADICIONALES – CIERRES PERIÓDICOS
   -------------------------------------------------------------- */
const CIERRE = {
  CARPETA_ROOT: "Club Guardia Mitre - Cierres PDF",
  SUB_CARPETA: "Rendiciones",
  HOJA_LOG: "📋 Cierres_Periódicos",
  ENCARGADOS_ADMIN: ["Diego", "Gonzalo"],
  COLORES: {
    HEADER: "#4285F4",
    HEADER_FONT: "#FFFFFF",
    SUBHEADER: "#D9E1F2",
    TOTAL: "#E2EFDA",
    CUOTAS: "#FFF2CC",
    GASTOS: "#FCE5CD"
  }
};

/* --------------------------------------------------------------
   LISTA MAESTRA DE CATEGORÍAS (para validaciones en Movimientos y Carga Rápida)
   -------------------------------------------------------------- */
const CATS_LIST = [
  "Turnos", "Alquileres", "Cantina", "Cheque Muni", "Indumentaria", "Banco",
  "Pagos Reyna (Quincho)", "Pagos Personal", "Pagos Profes", "Compras/Insumos",
  "Arreglos/Mantenimiento", "Saldo Inicial", "Cuotas Socios"
];

/* --------------------------------------------------------------
   CALENDARIO ESPECÍFICO (el que compartiste en el enlace público)
   -------------------------------------------------------------- */
const CAL_ID = 'd26d528f79545e172c6308af016a30f1668f25d017e34d1b9864598f3718c264@group.calendar.google.com';

/* --------------------------------------------------------------
   PLANTILLAS DE WHATSAPP (los placeholders deben coincidir con
   los que se usan en reemplazo)
   -------------------------------------------------------------- */
const MSGS_WHATSAPP = {
  "Cancha de Futsal": `¡Hola [NOMBRE]! 👋⚽

Te confirmamos tu reserva en el Club Guardia Mitre:

🏟️ ESPACIO: Cancha de Futsal
📅 FECHA: [FECHA]
⏰ HORARIO: [HORA INICIO] a [HORA FIN] hs
💰 MONTO: $[MONTO]

📍 IMPORTANTE:
• Por favor, llegar 10 minutos antes
• La cancha comienza en punto
• Traer calzado adecuado (suela lisa)

¡Te esperamos! 🎉

Club Social y Deportivo Guardia Mitre`,

  "Salón Principal": `¡Hola [NOMBRE]! 👋🎉

Te confirmamos tu reserva en el Club Guardia Mitre:

🏟️ ESPACIO: Salón Principal
📅 FECHA: [FECHA]
⏰ HORARIO: [HORA INICIO] a [HORA FIN] hs
💰 MONTO: $[MONTO]

📍 IMPORTANTE:
• Retirar llaves en recepción
• El salón se entrega limpio y debe devolverse en las mismas condiciones
• Consultar normas de uso en el club

¡Que lo disfrutes! 🎊

Club Social y Deportivo Guardia Mitre`,

  "Quincho": `¡Hola [NOMBRE]! 👋🍖

Te confirmamos tu reserva en el Club Guardia Mitre:

🏟️ ESPACIO: Quincho
📅 FECHA: [FECHA]
⏰ HORARIO: [HORA INICIO] a [HORA FIN] hs
💰 MONTO: $[MONTO]

📍 IMPORTANTE:
• El quincho incluye parrilla y mesadas
• Debe entregarse limpio y sin residuos
• Retirar llaves en recepción con anticipación
• Consultar normas de uso

¡Que lo disfrutes! 🔥

Club Social y Deportivo Guardia Mitre`,

  "Cancha de Pádel": `¡Hola [NOMBRE]! 👋🎾

Te confirmamos tu reserva en el Club Guardia Mitre:

🏟️ ESPACIO: Cancha de Pádel
5 FECHA: [FECHA]
⏰ HORARIO: [HORA INICIO] a [HORA FIN] hs
💰 MONTO: $[MONTO]

📍 IMPORTANTE:
• Por favor, llegar 10 minutos antes
• La cancha comienza en punto
• Respetar el horario de finalización

¡Te esperamos! 🏆

Club Social y Deportivo Guardia Mitre`,

  // Mensaje genérico (fallback si el espacio no coincide exactamente)
  DEFAULT: `Hola! Confirmamos tu reserva en * [ESPACIO]* para el * [FECSTR]* de * [HISTR] a [HFSTR]*.
Monto: [MONTO].
Recordá llegar 10 min antes. ¡¡Gracias!!`
};
```---

**_Funciones.gs**

```javascript
/* --------------------------------------------------------------
   FUNCIONES DE NEGOCIO Y HELPERS
   -------------------------------------------------------------- */

/* ---------- Helpers de fecha / mes corto ---------- */
function _mesCorto(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha)) return "sin-mes";
  const m = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return m[fecha.getMonth()] + "-" + String(fecha.getFullYear()).slice(-2);
}

function _mesCortoDesdeDatos(fecha, mesLargo, anio) {
  if (fecha instanceof Date && !isNaN(fecha)) return _mesCorto(fecha);
  const mapa = {
    "Enero":"ene","Febrero":"feb","Marzo":"mar","Abril":"abr","Mayo":"may","Junio":"jun",
    "Julio":"jul","Agosto":"ago","Septiembre":"sep","Octubre":"oct","Noviembre":"nov","Diciembre":"dic"
  };
  const m = mapa[mesLargo.charAt(0).toUpperCase() + mesLargo.slice(1).toLowerCase()];
  if (m && anio) return m + "-" + String(anio).slice(-2);
  return "sin-mes";
}

/* ---------- Función para obtener carpeta de cierres ---------- */
function _getCarpetaCierres(año, subPeriodo) {
  const root = DriveApp.getFoldersByName(CIERRE.CARPETA_ROOT);
  const carpetaRoot = root.hasNext() ? root.next() : DriveApp.createFolder(CIERRE.CARPETA_ROOT);
  const sub = carpetaRoot.getFoldersByName(CIERRE.SUB_CARPETA);
  const carpetaSub = sub.hasNext() ? sub.next() : carpetaRoot.createFolder(CIERRE.SUB_CARPETA);
  const añoFolderName = String(año);
  const añoFolders = carpetaSub.getFoldersByName(añoFolderName);
  const carpetaAño = añoFolders.hasNext() ? añoFolders.next() : carpetaSub.createFolder(añoFolderName);
  const periodFolders = carpetaAño.getFoldersByName(subPeriodo);
  return periodFolders.hasNext() ? periodFolders.next() : carpetaAño.createFolder(subPeriodo);
}

/* ---------- Generar cierre periódico ---------- */
function generarCierrePeriodico(tipo, año, mesOtrim) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  const hCuo = ss.getSheetByName(HOJAS.CUOTAS);
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  const hEnc = ss.getSheetByName(HOJAS.ENCARGADOS);
  if (!hRes || !hCuo || !hMov) throw new Error("Faltan hojas base (Reservas/Cuotas/Movimientos).");

  let fechaInicio, fechaFin, periodoLabel, subPeriodoFolder;
  const hoy = new Date();

  switch (tipo) {
    case "Mensual":
      const mes = parseInt(mesOtrim) || (hoy.getMonth() + 1);
      fechaInicio = new Date(año, mes - 1, 1);
      fechaFin = new Date(año, mes, 0, 23, 59, 59);
      periodoLabel = `${año}-${String(mes).padStart(2,'0')}`;
      subPeriodoFolder = `${String(mes).padStart(2,'0')}-${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][mes-1]}`;
      break;
    case "Trimestral":
      const trim = parseInt(mesOtrim);
      const mesIniTrim = (trim - 1) * 3;
      fechaInicio = new Date(año, mesIniTrim, 1);
      fechaFin = new Date(año, mesIniTrim + 3, 0, 23, 59, 59);
      periodoLabel = `${año}-Q${trim}`;
      subPeriodoFolder = `Q${trim}-Trimestral`;
      break;
    case "Anual":
      fechaInicio = new Date(año, 0, 1);
      fechaFin = new Date(año, 11, 31, 23, 59, 59);
      periodoLabel = `${año}-Anual`;
      subPeriodoFolder = `${año}-Anual`;
      break;
    case "Personalizado":
      fechaInicio = mesOtrim.inicio;
      fechaFin = mesOtrim.fin;
      periodoLabel = `${Utilities.formatDate(fechaInicio, "GMT-3", "yyyyMMdd")}_${Utilities.formatDate(fechaFin, "GMT-3", "yyyyMMdd")}`;
      subPeriodoFolder = `Personalizado_${periodoLabel}`;
      break;
    default:
      throw new Error("Tipo inválido: " + tipo);
  }

  // 1. RESERVAS
  const datRes = hRes.getDataRange().getValues();
  const hResH = datRes[0];
  const iFecRes = hResH.indexOf("Fecha");
  const iEstRes = hResH.indexOf("Estado Pago");
  const iEncRes = hResH.indexOf("Encargado");
  const iMonRes = hResH.indexOf("Monto Final ($)");
  const iEspRes = hResH.indexOf("Espacio");
  const iRespRes = hResH.indexOf("Responsable");

  const porEncargado = {};
  let totalReservas = 0;

  for (let r = 1; r < datRes.length; r++) {
    const f = datRes[r];
    const fec = f[iFecRes];
    const est = f[iEstRes];
    if (!(fec instanceof Date) || isNaN(fec)) continue;
    if (fec < fechaInicio || fec > fechaFin) continue;
    if (est !== "Cobrado" && est !== "Abonado anticipado") continue;

    const enc = f[iEncRes] || "SIN ENCARGADO";
    const monto = Number(f[iMonRes]) || 0;
    if (!porEncargado[enc]) porEncargado[enc] = { turnos: [], total: 0 };
    porEncargado[enc].turnos.push({
      fecha: fec, espacio: f[iEspRes], responsable: f[iRespRes], monto: monto, estado: est
    });
    porEncargado[enc].total += monto;
    totalReservas += monto;
  }

  // 2. CUOTAS
  const datCuo = hCuo.getDataRange().getValues();
  const hCuoH = datCuo[0];
  const iFecCuo = hCuoH.indexOf("Fecha Pago");
  const iEstCuo = hCuoH.indexOf("Estado");
  const iMonCuo = hCuoH.indexOf("Monto Pagado");
  const iMesCuo = hCuoH.indexOf("Mes");
  const iAniCuo = hCuoH.indexOf("Año");
  const iNomCuo = hCuoH.indexOf("Nombre Socio");
  const iMetCuo = hCuoH.indexOf("Método");

  const cuotas = [];
  let totalCuotas = 0;

  for (let r = 1; r < datCuo.length; r++) {
    const f = datCuo[r];
    const fec = f[iFecCuo];
    const est = f[iEstCuo];
    if (!(fec instanceof Date) || isNaN(fec)) continue;
    if (fec < fechaInicio || fec > fechaFin) continue;
    if (est !== "Pagado") continue;

    const monto = Number(f[iMonCuo]) || 0;
    cuotas.push({
      fecha: fec, socio: f[iNomCuo], mes: f[iMesCuo], año: f[iAniCuo], monto: monto, metodo: f[iMetCuo]
    });
    totalCuotas += monto;
  }

  // 3. EGRESOS (MOVIMIENTOS)
  const datMov = hMov.getDataRange().getValues();
  const hMovH = datMov[0];
  const iFecMov = hMovH.indexOf("Fecha");
  const iCatMov = hMovH.indexOf("Categoría");
  const iIngMov = hMovH.indexOf("Ingreso");
  const iEgrMov = hMovH.indexOf("Egreso");
  const iDescMov = hMovH.indexOf("Descripción");
  const iRespMov = hMovH.indexOf("Responsable");

  const gastosPorCat = {};
  let totalEgresos = 0;

  for (let r = 1; r < datMov.length; r++) {
    const f = datMov[r];
    const fec = f[iFecMov];
    if (!(fec instanceof Date) || isNaN(fec)) continue;
    if (fec < fechaInicio || fec > fechaFin) continue;

    const egr = Number(f[iEgrMov]) || 0;
    if (egr <= 0) continue;

    const cat = String(f[iCatMov] || "Otros").trim();
    if (!gastosPorCat[cat]) gastosPorCat[cat] = { items: [], total: 0 };
    gastosPorCat[cat].items.push({
      fecha: fec, descripcion: f[iDescMov], responsable: f[iRespMov], monto: egr
    });
    gastosPorCat[cat].total += egr;
    totalEgresos += egr;
  }

  const netoPeriodo = totalReservas + totalCuotas - totalEgresos;

  const listaEncargados = [];
  if (hEnc) {
    const datEnc = hEnc.getDataRange().getValues();
    for (let r = 1; r < datEnc.length; r++) if (datEnc[r][1]) listaEncargados.push(datEnc[r][1]);
  }

  return {
    periodo: { tipo, label: periodoLabel, folderName: subPeriodoFolder, inicio: fechaInicio, fin: fechaFin },
    reservas: { porEncargado, total: totalReservas },
    cuotas: { items: cuotas, total: totalCuotas },
    gastos: { porCategoria: gastosPorCat, total: totalEgresos },
    neto: netoPeriodo,
    encargados: listaEncargados,
    generadoEn: new Date(),
    generadoPor: Session.getActiveUser().getEmail() || "Script"
  };
}

/* ---------- Exportar cierre a PDF ---------- */
function exportarCierreAPDF(datos) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nombreTmp = `_TMP_Cierre_${datos.periodo.label}_${Utilities.formatDate(new Date(), "GMT-3", "HHmmss")}`;
  const hTmp = ss.insertSheet(nombreTmp);
  hTmp.hideSheet();

  const f = hTmp.getRange.bind(hTmp);
  let row = 1;
  const W = 8;

  // Header
  f(row,1,1,W).merge()
    .setValue("CLUB GUARDIA MITRE")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(CIERRE.COLORES.HEADER)
    .setFontColor(CIERRE.COLORES.HEADER_FONT);
  row++;

  f(row,1,1,W).merge()
    .setValue(`CIERRE ${datos.periodo.tipo.toUpperCase()} - ${datos.periodo.label}`)
    .setFontSize(14)
    .setBackground(CIERRE.COLORES.HEADER)
    .setFontColor(CIERRE.COLORES.HEADER_FONT);
  row++;

  f(row,1,1,W).merge()
    .setValue(`Período: ${Utilities.formatDate(datos.periodo.inicio,"GMT-3","dd/MM/yyyy")} al ${Utilities.formatDate(datos.periodo.fin,"GMT-3","dd/MM/yyyy")}`)
    .setBackground(CIERRE.COLORES.SUBHEADER);
  row++;

  f(row,1,1,W).merge()
    .setValue(`Generado: ${Utilities.formatDate(datos.generadoEn,"GMT-3","dd/MM/yyyy HH:mm")} por ${datos.generadoPor}`)
    .setBackground(CIERRE.COLORES.SUBHEADER);
  row += 2;

  // Resumen
  f(row,1,1,4).merge()
    .setValue("RESUMEN ECONÓMICO")
    .setFontWeight("bold")
    .setBackground(CIERRE.COLORES.SUBHEADER);
  row++;

  f(row,1,1,4).setValues([
    ["Ingresos Reservas","Ingresos Cuotas","Total Egresos","RESULTADO NETO"]
  ]).setFontWeight("bold").setBackground(CIERRE.COLORES.SUBHEADER);
  row++;

  f(row,1,1,4).setValues([
    [datos.reservas.total, datos.cuotas.total, datos.gastos.total, datos.neto]
  ]).setNumberFormat("$#,##0").setFontWeight("bold");
  f(row,4).setBackground(datos.neto >= 0 ? "#E2EFDA" : "#F4CCCC");
  row += 2;

  // Reservas por Encargado
  f(row,1,1,W).merge()
    .setValue("DETALLE DE RESERVAS POR ENCARGADO")
    .setFontWeight("bold")
    .setBackground(CIERRE.COLORES.SUBHEADER);
  row++;

  f(row,1,1,6).setValues([
    ["Encargado","Fecha","Espacio","Responsable","Monto","Estado"]
  ]).setFontWeight("bold").setBackground(CIERRE.COLORES.SUBHEADER);
  row++;

  for (const enc in datos.reservas.porEncargado) {
    const d = datos.reservas.porEncargado[enc];
    f(row,1,1,6).merge()
      .setValue(`${enc} — TOTAL: ${d.total.toLocaleString()}`)
      .setFontWeight("bold")
      .setBackground(CIERRE.COLORES.TOTAL);
    row++;

    for (const t of d.turnos) {
      f(row,1,1,6).setValues([
        ["", Utilities.formatDate(t.fecha,"GMT-3","dd/MM"), t.espacio, t.responsable, t.monto, t.estado]
      ]);
      f(row,5).setNumberFormat("$#,##0");
      row++;
    }
    row++;
  }

  f(row,1,1,5).merge()
    .setValue("TOTAL RESERVAS")
    .setFontWeight("bold")
    .setBackground(CIERRE.COLORES.TOTAL)
    .setHorizontalAlignment("right");
  f(row,6).setValue(datos.reservas.total).setNumberFormat("$#,##0").setFontWeight("bold").setBackground(CIERRE.COLORES.TOTAL);
  row += 2;

  // Cuotas
  if (datos.cuotas.items.length > 0) {
    f(row,1,1,W).merge()
      .setValue("CUOTAS SOCIOS COBRADAS")
      .setFontWeight("bold")
      .setBackground(CIERRE.COLORES.CUOTAS);
    row++;

    f(row,1,1,5).setValues([
      ["Fecha","Socio","Mes/Año","Método","Monto"]
    ]).setFontWeight("bold").setBackground(CIERRE.COLORES.CUOTAS);
    row++;

    for (const c of datos.cuotas.items) {
      f(row,1,1,5).setValues([
        [Utilities.formatDate(c.fecha,"GMT-3","dd/MM"), c.socio, `${c.mes}/${c.año}`, c.metodo, c.monto]
      ]);
      f(row,5).setNumberFormat("$#,##0");
      row++;
    }

    f(row,1,1,4).merge()
      .setValue("TOTAL CUOTAS")
      .setFontWeight("bold")
      .setBackground(CIERRE.COLORES.CUOTAS)
      .setHorizontalAlignment("right");
    f(row,5).setValue(datos.cuotas.total).setNumberFormat("$#,##0").setFontWeight("bold").setBackground(CIERRE.COLORES.CUOTAS);
    row += 2;
  }

  // Gastos
  f(row,1,1,W).merge()
    .setValue("EGRESOS POR CATEGORÍA")
    .setFontWeight("bold")
    .setBackground(CIERRE.COLORES.GASTOS);
  row++;

  f(row,1,1,5).setValues([
    ["Categoría","Fecha","Descripción","Responsable","Monto"]
  ]).setFontWeight("bold").setBackground(CIERRE.COLORES.GASTOS);
  row++;

  for (const cat in datos.gastos.porCategoria) {
    const d = datos.gastos.porCategoria[cat];
    f(row,1,1,5).merge()
      .setValue(`${cat} — ${d.total.toLocaleString()}`)
      .setFontWeight("bold")
      .setBackground(CIERRE.COLORES.TOTAL);
    row++;

    for (const g of d.items) {
      f(row,1,1,5).setValues([
        ["", Utilities.formatDate(g.fecha,"GMT-3","dd/MM"), g.descripcion, g.responsable, g.monto]
      ]);
      f(row,5).setNumberFormat("$#,##0");
      row++;
    }
    row++;
  }

  f(row,1,1,4).merge()
    .setValue("TOTAL EGRESOS")
    .setFontWeight("bold")
    .setBackground(CIERRE.COLORES.TOTAL)
    .setHorizontalAlignment("right");
  f(row,5).setValue(datos.gastos.total).setNumberFormat("$#,##0").setFontWeight("bold").setBackground(CIERRE.COLORES.TOTAL);
  row += 2;

  // Firmas
  f(row,1,1,W).merge().setValue("");
  row++;
  f(row,1,1,W).merge()
    .setValue("___________________________                    ___________________________")
    .setHorizontalAlignment("center");
  row++;
  f(row,1,1,W).merge()
    .setValue("DIEGO CASTRO (Presidente)                                            BRITES GENARO (Tesorero)")
    .setHorizontalAlignment("center");
  row++;
  f(row,1,1,W).merge()
    .setValue(`Fecha: ${Utilities.formatDate(new Date(),"GMT-3","dd/MM/yyyy")}`)
    .setHorizontalAlignment("center");
  row++;

  // Ajustar anchos de columna (mano a mano porque setColumnWidths no acepta array)
  const anchosTmp = [180,120,180,180,120,120,120,120];
  anchosTmp.forEach((ancho, i) => hTmp.setColumnWidth(i + 1, ancho));

  // Crear spreadsheet temporal, copiar hoja, eliminar hoja por defecto, exportar
  const tmpSpreadsheet = SpreadsheetApp.create(`_TMP_PDF_${datos.periodo.label}`);
  const hojaCopiada = hTmp.copyTo(tmpSpreadsheet);
  hojaCopiada.showSheet(); // la copia viene oculta, hay que mostrarla

  const hojaDefault = tmpSpreadsheet.getSheetByName("Hoja 1") || tmpSpreadsheet.getSheetByName("Sheet1");
  if (hojaDefault) tmpSpreadsheet.deleteSheet(hojaDefault);

  const blob = tmpSpreadsheet.getAs('application/pdf').setName(`Cierre_${datos.periodo.label}.pdf`);
  const carpeta = _getCarpetaCierres(datos.periodo.inicio.getFullYear(), datos.periodo.folderName);
  const file = carpeta.createFile(blob);

  // Limpieza
  DriveApp.getFileById(tmpSpreadsheet.getId()).setTrashed(true);
  ss.deleteSheet(hTmp);

  return file.getUrl();
}

/* ---------- Registro de cierre en log ---------- */
function registrarCierreEnLog(datos, pdfUrl) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hLog = ss.getSheetByName(CIERRE.HOJA_LOG);
  if (!hLog) return;

  const contenidoHash = `${datos.periodo.label}|${datos.reservas.total}|${datos.cuotas.total}|${datos.gastos.total}|${datos.neto}`;
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, contenidoHash)
    .map(b => (b < 16 ? "0" : "") + (b & 0xff).toString(16)).join('').substr(0, 8);

  hLog.appendRow([
    datos.generadoEn,
    datos.periodo.tipo,
    datos.periodo.label,
    pdfUrl,
    datos.generadoPor,
    hash,
    `Reservas: ${datos.reservas.total} | Cuotas: ${datos.cuotas.total} | Gastos: ${datos.gastos.total} | Neto: ${datos.neto}`
  ]);
}

/* ---------- Procesar carga rápida ---------- */
function procesarCargaRapida() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hCarga = ss.getSheetByName(HOJAS.CARGA_RAPIDA);
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  if (!hCarga || !hMov) return;

  const datos = hCarga.getRange("A5:J" + hCarga.getLastRow()).getValues();
  let procesados = 0;

  for (let i = 0; i < datos.length; i++) {
    const fila = datos[i];
    const estado = fila[8]; // Col I (índice 8)
    if (estado === "Pendiente") {
      const fecha = fila[0];
      const mes = fila[1];
      const cat = fila[2];
      const sub = fila[3];
      const desc = fila[4];
      const resp = fila[5];
      const ing = Number(fila[6]) || 0;
      const egr = Number(fila[7]) || 0;

      // Calcular saldo acumulado
      const datMov = hMov.getDataRange().getValues();
      let saldo = 0;
      if (datMov.length > 1) {
        saldo = Number(datMov[datMov.length - 1][9]) || 0;
      }
      saldo += ing - egr;

      const newID = hMov.getLastRow();
      hMov.appendRow([newID, fecha, mes, cat, sub, desc, resp, ing, egr, saldo]);

      hCarga.getRange(i + 5, 9).setValue("Procesado"); // Col I
      hCarga.getRange(i + 5, 10).setValue(newID);      // Col J
      procesados++;
    }
  }

  if (procesados > 0) {
    SpreadsheetApp.getUi().alert("✅ Carga Rápida procesada: " + procesados + " movimientos agregados a Movimientos.");
  } else {
    SpreadsheetApp.getUi().alert("ℹ️ No hay filas con estado 'Pendiente' para procesar.");
  }
}

/* ---------- Sincronizar Reservas → Movimientos ---------- */
function sincronizarReservasAMovimientos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  if (!hRes || !hMov) return;

  const datos = hRes.getDataRange().getValues();
  const h = datos[0];
  const iFecha = h.indexOf("Fecha");
  const iResp = h.indexOf("Responsable");
  const iMonto = h.indexOf("Monto Final ($)");
  const iEst = h.indexOf("Estado Pago");
  const iSinc = h.indexOf("Sincronizado");
  const iEsp = h.indexOf("Espacio");

  let count = 0;
  let saldo = 0;
  const datMov = hMov.getDataRange().getValues();
  if (datMov.length > 1) saldo = Number(datMov[datMov.length - 1][9]) || 0;

  for (let i = 1; i < datos.length; i++) {
    const f = datos[i];
    const est = f[iEst];
    const sinc = f[iSinc];
    if ((est === "Cobrado" || est === "Abonado anticipado") && sinc !== "Si") {
      const fecha = f[iFecha];
      const resp = f[iResp];
      const monto = Number(f[iMonto]) || 0;
      const espacio = f[iEsp];
      const mes = _mesCorto(fecha);

      saldo += monto;
      const newID = hMov.getLastRow();
      hMov.appendRow([newID, fecha, mes, "Turnos", "Cobro Turno", `Turno ${espacio} - ${resp}`, resp, monto, 0, saldo]);
      hRes.getRange(i + 1, iSinc + 1).setValue("Si");
      count++;
    }
  }

  if (count > 0) SpreadsheetApp.getUi().alert("✅ " + count + " reservas sincronizadas a Movimientos.");
  else SpreadsheetApp.getUi().alert("ℹ️ No hay reservas nuevas para sincronizar.");
}

/* ---------- Sincronizar Cuotas → Movimientos ---------- */
function sincronizarCuotasAMovimientos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hCuo = ss.getSheetByName(HOJAS.CUOTAS);
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  if (!hCuo || !hMov) return;

  const datos = hCuo.getDataRange().getValues();
  const h = datos[0];
  const iFecha = h.indexOf("Fecha Pago");
  const iNom = h.indexOf("Nombre Socio");
  const iMon = h.indexOf("Monto Pagado");
  const iEst = h.indexOf("Estado");
  const iSinc = h.indexOf("Sincronizado");
  const iMes = h.indexOf("Mes");
  const iAnio = h.indexOf("Año");
  const iMet = h.indexOf("Método");

  let count = 0;
  let saldo = 0;
  const datMov = hMov.getDataRange().getValues();
  if (datMov.length > 1) saldo = Number(datMov[datMov.length - 1][9]) || 0;

  for (let i = 1; i < datos.length; i++) {
    const f = datos[i];
    if (f[iEst] === "Pagado" && f[iSinc] !== "Si") {
      const fecha = f[iFecha];
      const nombre = f[iNom];
      const monto = Number(f[iMon]) || 0;
      const mesLargo = String(f[iMes] || "").trim();
      const anio = f[iAnio];
      const metodo = f[iMet];

      const mesCorto = _mesCortoDesdeDatos(fecha, mesLargo, anio);
      const desc = `Cuota ${mesLargo} ${anio} - ${nombre} (${metodo})`;

      saldo += monto;
      const newID = hMov.getLastRow();
      hMov.appendRow([newID, fecha, mesCorto, "Cuotas Socios", "Cuota Social", desc, nombre, monto, 0, saldo]);
      hCuo.getRange(i + 1, iSinc + 1).setValue("Si");
      count++;
    }
  }

  if (count > 0) SpreadsheetApp.getUi().alert("✅ " + count + " cuotas sincronizadas a Movimientos.");
  else SpreadsheetApp.getUi().alert("ℹ️ No hay cuotas nuevas para sincronizar.");
}

/* ---------- Funciones de conflicto y generación de links ---------- */
function hayConflictoSimple(filaVals) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hRes = ss.getSheetByName(HOJAS.RESERVAS);
    if (!hRes) {
      Logger.log("❌ ERROR: No se encontró hoja '📅 Reservas'");
      return false; // Asumir no hay conflicto para no bloquear operaciones
    }

    const reservas = hRes.getDataRange().getValues();
    const hResHeaders = reservas[0];

    const iEspacio    = hResHeaders.indexOf("Espacio");
    const iFecha      = hResHeaders.indexOf("Fecha");
    const iHoraInicio = hResHeaders.indexOf("Hora Inicio");
    const iHoraFin    = hResHeaders.indexOf("Hora Fin");
    const iEstadoPago = hResHeaders.indexOf("Estado Pago");
    const iFilaID     = hResHeaders.indexOf("ID Reserva"); // Para evitar comparar con sí misma

    // Extraer datos de la reserva a verificar
    const reserva = {
      filaID:    filaVals[iFilaID],
      espacio:   filaVals[iEspacio],
      fechaObj:  filaVals[iFecha],
      horaInicioStr: String(filaVals[iHoraInicio] || ""),
      horaFinStr:    String(filaVals[iHoraFin] || "")
    };

    // Validar datos básicos
    if (!reserva.espacio ||
        !(reserva.fechaObj instanceof Date) ||
        isNaN(reserva.fechaObj.getTime())) {
      return false; // No podemos verificar, asumimos sin conflicto
    }

    // Convertir fecha a string comparable (yyyy-MM-dd)
    const fechaStr = Utilities.formatDate(reserva.fechaObj, "GMT-3", "yyyy-MM-dd");

    // Convertir horas de entrada a formato decimal (ej: "14:30" → 14.5)
    const tiempoADecimal = (tiempoStr) => {
      if (!tiempoStr || tiempoStr.trim() === "") return 0;
      const partes = String(tiempoStr).trim().split(':');
      const horas = parseInt(partes[0]) || 0;
      const minutos = parseInt(partes[1]) || 0;
      return horas + (minutos / 60);
    };
    const horaInicioDec = tiempoADecimal(reserva.horaInicioStr);
    const horaFinDec    = tiempoADecimal(reserva.horaFinStr);
    const duracionHoras = horaFinDec - horaInicioDec;

    if (duracionHoras <= 0) return false;

    // Revisar todas las demás reservas
    for (let i = 1; i < reservas.length; i++) {
      const res = reservas[i];

      if (res[iFilaID] === reserva.filaID) continue; // misma fila

      const resEstadoPago = res[iEstadoPago];
      if (resEstadoPago === "Reserva cancelada") continue; // Ignorar reservas canceladas

      const resEspacio    = res[iEspacio];
      const resFechaObj   = res[iFecha];
      const resHoraInicio = res[iHoraInicio];
      const resHoraFin    = res[iHoraFin];

      if (!resEspacio ||
          !(resFechaObj instanceof Date) ||
          isNaN(resFechaObj.getTime())) continue;

      if (resEspacio !== reserva.espacio) continue;
      const resFechaStr = Utilities.formatDate(resFechaObj, "GMT-3", "yyyy-MM-dd");
      if (resFechaStr !== fechaStr) continue;

      const resHoraInicioDec = tiempoADecimal(String(resHoraInicio || ""));
      const resHoraFinDec    = tiempoADecimal(String(resHoraFin || ""));

      // Solapamiento de intervalos: [inicio1, fin1] y [inicio2, fin2]
      // Se solapan si: inicio1 < fin2 AND inicio2 < fin1
      if (horaInicioDec < resHoraFinDec && resHoraInicioDec < horaFinDec) {
        Logger.log(`🔥 CONFLICTO: Reserva ${reserva.filaID} choca con ${res[iFilaID]} en ${reserva.espacio} el ${fechaStr}`);
        return true; // ¡Conflicto detectado!
      }
    }

    return false; // No se encontraron conflictos

  } catch (error) {
    Logger.log("❌ ERROR en hayConflictoSimple: " + error.toString());
    return false; // En caso de error, preferimos no bloquear operaciones
  }
}

function generarLinksWhatsApp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  if (!hRes) return 0;   // nada que hacer

  const dat = hRes.getDataRange().getValues();
  const h   = dat[0]; // fila de encabezados

  // ---- column indexes (0‑based) ---------------------------------
  const iTel      = h.indexOf("Teléfono");
  const iEspacio  = h.indexOf("Espacio");
  const iFec      = h.indexOf("Fecha");
  const iHi       = h.indexOf("Hora Inicio");
  const iHf       = h.indexOf("Hora Fin");
  const iMon      = h.indexOf("Monto Final ($)");
  const iDesc     = h.indexOf("Descuento ($)");
  const iLinkWA   = h.indexOf("Link WhatsApp");
  // -----------------------------------------------------------------
  const required = [iTel, iEspacio, iFec, iHi, iHf, iMon, iDesc, iLinkWA];
  if (required.some(idx => idx === -1)) {
    Logger.log("❌ ERROR: Faltan columnas necesarias en hoja Reservas para generar Links WhatsApp");
    return 0;
  }

  let escritos = 0;
  for (let i = 1; i < dat.length; i++) {
    const f = dat[i];

    // Si ya tiene un enlace, lo saltamos (evitamos sobrescribir)
    if (f[iLinkWA]) continue;

    const telRaw = String(f[iTel] || "").replace(/\D/g, "");
    if (!telRaw || telRaw.length < 10) continue; // teléfono no válido

    const espacio   = f[iEspacio];
    const fechaObj  = f[iFec];
    const hiObj     = f[iHi];
    const hfObj     = f[iHf];
    const monto     = Number(f[iMon]) || 0;
    const descuento = Number(f[iDesc]) || 0;

    // ---- helpers to format date & time (accept Date or string) ----------------
    const formatDate = (val) => {
      if (val instanceof Date && !isNaN(val)) {
        return Utilities.formatDate(val, "GMT-3", "dd/MM/yyyy");
      }
      return String(val || "");
    };
    const formatTime = (val) => {
      if (val instanceof Date && !isNaN(val)) {
        return Utilities.formatDate(val, "GMT-3", "HH:mm");
      }
      const str = String(val || "").trim();
      return str.length >= 5 ? str.substring(0, 5) : "00:00";
    };
    // --------------------------------------------------------------------------

    const fecStr = formatDate(fechaObj);
    const hiStr  = formatTime(hiObj);
    const hfStr  = formatTime(hfObj);

    // ---- pick the WhatsApp template for this space ---------------------------
    let plantilla = MSGS_WHATSAPP[espacio];
    if (!plantilla) {
      plantilla = MSGS_WHATSAPP.DEFAULT; // generic fallback
      Logger.log(`⚠️ No se encontró plantilla para espacio "${espacio}", usando DEFAULT`);
    }
    // --------------------------------------------------------------------------

    // Build the message by replacing placeholders
    let mensaje = plantilla
      .replace(/\[NOMBRE\]/g, String(f[h.indexOf("Responsable")] || ""))
      .replace(/\[FECHA\]/g, fecStr)
      .replace(/\[HORA INICIO\]/g, hiStr)
      .replace(/\[HORA FIN\]/g, hfStr)
      .replace(/\[MONTO\]/g, monto.toLocaleString())
      .replace(/\[DESCUENTO\]/g, descuento.toLocaleString())
      .replace(/\[ESPACIO\]/g, espacio);

    // Build the WhatsApp link (Argentina format: 549 + number)
    const telefonoFormateado = "549" + telRaw;
    const link = `https://wa.me/${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`;

    // Write the link to column O (Link WhatsApp) = 15 (1‑based)
    hRes.getRange(i + 1, 15).setValue(link);
    escritos++;
  }

  // Sólo para depuración (visible en Ver → Ejecutores)
  Logger.log(`✅ ${escritos} links de WhatsApp generados en columna 'Link WhatsApp'.`);
  return escritos;
}

/* ---------- Sincronizar con Google Calendar ---------- */
function sincronizarConGoogleCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  if (!hRes) return;

  const cal = CalendarApp.getCalendarById(CAL_ID);
  if (!cal) {
    Logger.log('❌ No se encontró el calendario con el ID: ' + CAL_ID);
    return;
  }

  const dat = hRes.getDataRange().getValues();
  const h   = dat[0]; // fila de encabezados

  // ---- índices de columnas (0‑based) ---------------------------------
  const iFec      = h.indexOf("Fecha");
  const iHi       = h.indexOf("Hora Inicio");
  const iHf       = h.indexOf("Hora Fin");
  const iEsp      = h.indexOf("Espacio");
  const iResp     = h.indexOf("Responsable");
  const iTel      = h.indexOf("Teléfono");
  const iMon      = h.indexOf("Monto Final ($)");
  const iEst      = h.indexOf("Estado Pago");
  const iCalIdCol = h.indexOf("ID Calendario"); // debería ser 15 → columna P (1‑based = 16)
  // --------------------------------------------------------------------

  let count = 0;
  for (let i = 1; i < dat.length; i++) {
    const f = dat[i];

    // Si ya tiene ID de evento, lo saltamos (evitamos duplicados)
    if (f[iCalIdCol]) continue;
    // Ignoramos reservas canceladas
    if (f[iEst] === "Reserva cancelada") continue;

    const fec = f[iFec];
    if (!(fec instanceof Date) || isNaN(fec.getTime())) continue;

    const hi = f[iHi];
    const hf = f[iHf];
    // Convertimos horas (pueden venir como Date o como string "HH:mm")
    const hIni = parseInt(String(hi).split(":")[0]) || 0;
    const hFin = parseInt(String(hf).split(":")[0]) || 0;

    const ini = new Date(fec);
    ini.setHours(hIni, 0, 0, 0);
    const fin = new Date(fec);
    fin.setHours(hFin, 0, 0, 0);

    const titulo = `${f[iEsp]} - ${f[iResp]}`;
    const desc   = `Responsable: ${f[iResp]}\nTel: ${f[iTel]}\nMonto: ${Number(f[iMon]) || 0}\nEstado: ${f[iEst]}`;

    try {
      const ev = cal.createEvent(titulo, ini, fin, { description: desc });
      // Guardamos el ID real del evento en la columna P (ID Calendario) = 16 (1‑based)
      hRes.getRange(i + 1, 16).setValue(ev.getId());
      count++;
    } catch (e) {
      Logger.log(`Error Calendar fila ${i + 1}: ${e.message}`);
    }
  }

  // Sólo para depuración (visible en Ver → Ejecutores)
  Logger.log(`✅ ${count} eventos creados en el calendario indicado.`);
}

/* ---------- Funciones auxiliares para formularios ---------- */
function buscarIDSocio(hSocios, nombre) {
  const datos = hSocios.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][1] && datos[i][1].toString().trim().toLowerCase() === nombre.toString().trim().toLowerCase()) {
      return datos[i][0];
    }
  }
  return 0;
}

function verificarSocioAlDia(hCuotas, idSocio) {
  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth(); // 0-11
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const mesesEsperados = meses.slice(0, mesActual + 1);

  const datos = hCuotas.getDataRange().getValues();
  const h = datos[0];
  const iId = h.indexOf("ID_Socio");
  const iAnio = h.indexOf("Año");
  const iMes = h.indexOf("Mes");
  const iEst = h.indexOf("Estado");

  let tieneAnual = false;
  const mesesPagados = new Set();

  for (let r = 1; r < datos.length; r++) {
    if (datos[r][iId] == idSocio && datos[r][iAnio] == anioActual && datos[r][iEst] === "Pagado") {
      const mes = datos[r][iMes];
      if (mes === "Anual") { tieneAnual = true; break; }
      mesesPagados.add(mes);
    }
  }
  if (tieneAnual) return true;
  return mesesEsperados.every(m => mesesPagados.has(m));
}

/* ---------- Instalación limpia (ejecutar una sola vez) ---------- */
function instalarSistemaCompleto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Borrar hojas viejas (nombres limpios + variantes con espacios/emojis viejos)
  const nombresEliminar = Object.values(HOJAS).concat([
    " Encargados", " Socios", "💰 Cuotas", "🏟️ Espacios", "📅 Reservas",
    " Rendiciones", " Movimientos", "📝 Carga Rápida", " Resumen Mensual",
    "📊 Dashboard", "🎯 Panel de Control", "📋 Morosos"
  ]);

  nombresEliminar.forEach(nombre => {
    try {
      const h = ss.getSheetByName(nombre);
      if (h) ss.deleteSheet(h);
    } catch (e) {}
  });

  // 2. Crear todas las hojas desde cero
  _crearHojaEncargados();
  _crearHojaSocios();
  _crearHojaCuotas();
  _crearHojaEspacios();
  _crearHojaReservas();
  _crearHojaRendiciones();
  _crearHojaMovimientos();
  _crearHojaCargaRapida();
  _crearHojaResumenMensual();
  _crearHojaDashboard();
  _crearHojaPanelControl();
  _crearHojaMorosos();

  // 3. Reordenar pestañas
  _reordenarHojas();

  // NO llamamos a onOpen() ni a getUi().alert() desde el editor.
  // El menú se crea solo al abrir la planilla (trigger simple onOpen).
  // Para ver el resultado, recargá la planilla (F5) después de guardar.

  Logger.log('✅ SISTEMA INSTALADO CORRECTAMENTE');
  Logger.log('Hojas creadas: ' + Object.values(HOJAS).join(', '));
  Logger.log('Próximos pasos:');
  Logger.log('1. Recargá la planilla (F5) para ver el menú 🏆 Club GM');
  Logger.log('2. Menú 🏆 Club GM → ⚙️ Crear Formularios (Ejecutar 1 vez)');
  Logger.log('3. En cada hoja de respuestas de formulario, agregar columna "Estado Proceso" al final');
  Logger.log('4. Menú 🏆 Club GM → 🔧 Configurar Triggers Automáticos');
}

/* ---------- Helpers de creación de hojas (se usan en instalación) ---------- */
function _crearHojaEncargados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.ENCARGADOS);
  h.getRange("A1:E1").setValues([["ID","Nombre","Rol","Teléfono","Email"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.getRange("A2:E7").setValues([
    [1,"Diego","Administrador","",""],
    [2,"Bruno","Comisión","",""],
    [3,"Gonzalo","Comisión","",""],
    [4,"Georgina","Comisión","",""],
    [5,"Genaro","Comisión","",""],
    [6,"Iris","Comisión","",""]
  ]);
  h.setColumnWidths(1,5,150);
}

function _crearHojaSocios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.SOCIOS);
  h.getRange("A1:H1").setValues([["ID","Nombre Completo","DNI","Teléfono","Email","Fecha Alta","Categoría","Observaciones"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1,8,130);
  h.setColumnWidth(2,200);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Activo","Vitalicio","Inactivo","Moroso"])
    .setAllowInvalid(false).build();
  h.getRange("G2:G1000").setDataValidation(rule);
}

function _crearHojaCuotas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.CUOTAS);
  // 10 columnas: ID_Pago .. Sincronizado
  h.getRange("A1:J1").setValues([["ID_Pago","ID_Socio","Nombre Socio","Año","Mes","Monto Pagado","Fecha Pago","Método","Estado","Sincronizado"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1,10,120);
  h.setColumnWidth(3,180);
  h.setColumnWidth(10,100);
  const ruleMes = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre","Anual"])
    .setAllowInvalid(false).build();
  h.getRange("E2:E1000").setDataValidation(ruleMes);
  const ruleMetodo = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Efectivo","Transferencia","Cheque","Exento"])
    .setAllowInvalid(false).build();
  h.getRange("H2:H1000").setDataValidation(ruleMetodo);
  const ruleEstado = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pagado","Pendiente","Exento","Moroso"])
    .setAllowInvalid(false).build();
  h.getRange("I2:I1000").setDataValidation(ruleEstado);
}

function _crearHojaEspacios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.ESPACIOS);
  h.getRange("A1:D1").setValues([["ID","Nombre del Espacio","Tarifa Base ($)","Estado"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.getRange("A2:D5").setValues([
    [1,"Cancha de Futsal",22000,"Activo"],
    [2,"Salón Principal",50000,"Activo"],
    [3,"Quincho",30000,"Activo"],
    [4,"Cancha de Pádel",25000,"En construcción"]
  ]);
  h.setColumnWidths(1,4,150);
}

function _crearHojaReservas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.RESERVAS);
  const headers = [
    "ID Reserva","Fecha","Hora Inicio","Hora Fin","Espacio","Responsable","Teléfono",
    "Monto Base ($)","Descuento ($)","Monto Final ($)","Seña ($)","Estado Pago",
    "Encargado","Tipo Descuento","Link WhatsApp","ID Calendario","Sincronizado"
  ];
  h.getRange(1,1,1,17).setValues([headers]).setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1,17,110);
  h.setColumnWidth(6,180);
  const ruleEspacio = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Cancha de Futsal","Salón Principal","Quincho","Cancha de Pádel"])
    .setAllowInvalid(false).build();
  h.getRange("E2:E1000").setDataValidation(ruleEspacio);
  const ruleEstadoPago = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Por cobrar","Cobrado","Abonado anticipado","Pago parcial","Reserva cancelada"])
    .setAllowInvalid(false).build();
  h.getRange("L2:L1000").setDataValidation(ruleEstadoPago);
  const ruleEncargado = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Diego","Bruno","Gonzalo","Georgina","Genaro","Iris"])
    .setAllowInvalid(false).build();
  h.getRange("M2:M1000").setDataValidation(ruleEncargado);
  const ruleTipoDesc = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Ninguno","Socio al día","Pago anticipado","Socio + Pago anticipado"])
    .setAllowInvalid(false).build();
  h.getRange("N2:N1000").setDataValidation(ruleTipoDesc);
}

function _crearHojaRendiciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.RENDICIONES);
  const headers = [["Semana","Encargado","Espacio","Turnos Asignados","Monto Teórico ($)",
                    "Monto Real Entregado ($)","Diferencia ($)","Estado"]];
  h.getRange("A1:H1").setValues(headers).setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1,8,130);
  const ruleEnc = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Diego","Bruno","Gonzalo","Georgina","Genaro","Iris"])
    .setAllowInvalid(false).build();
  h.getRange("B2:B1000").setDataValidation(ruleEnc);
  const ruleEsp = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Cancha de Futsal","Salón Principal","Quincho","Cancha de Pádel"])
    .setAllowInvalid(false).build();
  h.getRange("C2:C1000").setDataValidation(ruleEsp);
  const ruleEst = SpreadsheetApp.newDataValidation()
    .requireValueInList(["OK","Faltante","Sobrante","Pendiente"])
    .setAllowInvalid(false).build();
  h.getRange("H2:H1000").setDataValidation(ruleEst);
}

function _crearHojaMovimientos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.MOVIMIENTOS);
  const headers = [["ID","Fecha","Mes","Categoría","Subcategoría","Descripción","Responsable","Ingreso","Egreso","Saldo Acumulado"]];
  h.getRange("A1:J1").setValues(headers).setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1,10,120);
  h.setColumnWidth(6,250);
  const ruleCat = SpreadsheetApp.newDataValidation()
    .requireValueInList(CATS_LIST).setAllowInvalid(false).build();
  h.getRange("D2:D1000").setDataValidation(ruleCat);
}

function _crearHojaCargaRapida() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.CARGA_RAPIDA);
  h.getRange("A1").setValue("CARGA RÁPIDA DE MOVIMIENTOS").setFontWeight("bold").setFontSize(14);
  h.getRange("A2").setValue("Completá los datos. Al marcar 'Pendiente' en columna I se procesará automáticamente.");
  h.getRange("A4:J4").setValues([["Fecha","Mes","Categoría","Subcategoría","Descripción","Responsable","Ingreso","Egreso","Estado","ID Movimiento"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.getRange("A5:J5").setBackground("#FFF2CC");
  h.setColumnWidths(1,10,130);
  h.setColumnWidth(5,250);
  const mesesCarga = ["Jul-25","Ago-25","Sep-25","Oct-25","Nov-25","Dic-25","Ene-26","Feb-26","Mar-26","Abr-26","May-26","Jun-26","Jul-26","Ago-26","Sep-26","Oct-26","Nov-26","Dic-26"];
  const ruleMes = SpreadsheetApp.newDataValidation().requireValueInList(mesesCarga).setAllowInvalid(false).build();
  h.getRange("B5:B1000").setDataValidation(ruleMe);
  const ruleCat = SpreadsheetApp.newDataValidation().requireValueInList(CATS_LIST).setAllowInvalid(false).build();
  h.getRange("C5:C1000").setDataValidation(ruleCat);
  const ruleEst = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pendiente","Procesado","Error"])
    .setAllowInvalid(false).build();
  h.getRange("I5:I1000").setDataValidation(ruleEst);
}

function _crearHojaResumenMensual() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.RESUMEN_MENSUAL);
  h.getRange("A1:H1").setValues([["Mes","Ingresos Turnos","Ingresos Cuotas","Otros Ingresos","Total Ingresos","Total Egresos","Resultado Neto","Saldo Final"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1,8,140);
}

function _crearHojaDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.DASHBOARD);
  h.getRange("A1").setValue("DASHBOARD EJECUTIVO - CLUB GUARDIA MITRE")
   .setFontWeight("bold").setFontSize(16).setBackground("#4285F4").setFontColor("white");
  h.getRange("A1:F1").merge();
  // El contenido real lo llena actualizarDashboardCompleto()
}

function _crearHojaPanelControl() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.PANEL_CONTROL);
  h.getRange("A1").setValue("PANEL DE CONTROL - CLUB GUARDIA MITRE")
   .setFontWeight("bold").setFontSize(16).setBackground("#4285F4").setFontColor("white");
  h.getRange("A1:F1").merge();

  h.getRange("A3").setValue("ACCIONES RÁPIDAS (ejecutar desde menú 🏆 Club GM)")
   .setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2");
  h.getRange("A3:F3").merge();

  const acciones = [
    ["📝 Procesar Carga Rápida","procesarCargaRapida"],
    ["📊 Sincronizar Reservas → Movimientos","sincronizarReservasAMovimientos"],
    ["💰 Sincronizar Cuotas → Movimientos","sincronizarCuotasAMovimientos"],
    ["🧾 Generar Rendiciones Semanales","generarRendicionesSemanales"],
    ["📋 Ver Lista de Morosos","generarListaMorosos"],
    ["📊 Actualizar Dashboard Completo","actualizarDashboardCompleto"],
    ["📱 Generar Links WhatsApp","generarLinksWhatsApp"],
    ["📅 Sincronizar con Google Calendar","sincronizarConGoogleCalendar"]
  ];

  let row = 4;
  acciones.forEach(a => {
    h.getRange(row,1).setValue(a[0]).setFontWeight("bold");
    h.getRange(row,2).setValue(a[1]).setFontColor("#1155CC").setFontStyle("italic");
    row++;
  });

  h.getRange(row+1,1,1,6).merge().setValue("INFORMACIÓN DEL SISTEMA")
   .setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2");
  row += 2;

  const info = [
    ["Total Socios:",'=COUNTA(\'👥 Socios\'!A:A)-1'],
    ["Reservas este mes:",'=COUNTIFS(\'📅 Reservas\'!B:B,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),\''+HOJAS.RESERVAS+'\'!L:L,"<>Reserva cancelada")'],
    ["Movimientos registrados:",'=COUNTA(\''+HOJAS.MOVIMIENTOS+'\'!A:A)-1'],
    ["Cuotas pagadas 2026:",'=COUNTIFS(\''+HOJAS.CUOTAS+'\'!D:D,2026,\''+HOJAS.CUOTAS+'\'!I:I,"Pagado")']
  ];
  info.forEach(([label,formula]) => {
    h.getRange(row,1).setValue(label).setFontWeight("bold");
    h.getRange(row,2).setFormula(formula);
    row++;
  });

  h.setColumnWidth(1,250);
  h.setColumnWidth(2,200);
  h.setColumnWidth(3,400);
}

function _crearHojaMorosos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.MOROSOS);
  h.getRange("A1:G1").setValues([["ID","Socio","Teléfono","Email","Meses Adeudados","Cantidad","Último Pago"]])
   .setFontWeight("bold").setBackground("#F4CCCC");

  // FIX: setColumnWidth por columna (no array)
  const anchos = [50,200,120,200,300,80,120];
  anchos.forEach((ancho, i) => h.setColumnWidth(i + 1, ancho));
}

function _reordenarHojas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orden = [
    HOJAS.PANEL_CONTROL, HOJAS.DASHBOARD, HOJAS.RESUMEN_MENSUAL, HOJAS.MOVIMIENTOS,
    HOJAS.CARGA_RAPIDA, HOJAS.RESERVAS, HOJAS.RENDICIONES, HOJAS.ESPACIOS,
    HOJAS.CUOTAS, HOJAS.SOCIOS, HOJAS.ENCARGADOS, HOJAS.MOROSOS
  ];
  // Mover de atrás hacia adelante para que queden en el orden deseado
  orden.reverse().forEach(nombre => {
    try { ss.getSheetByName(nombre)?.activate(); } catch (e) {}
  });
}
```---

**_Formularios.gs**

```javascript
/* --------------------------------------------------------------
   FORMULARIOS Y Manejo de envíos
   -------------------------------------------------------------- */
function crearFormularios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  try {
    // --------------------------------------------------
    // FORMULARIO 1: ALTA DE SOCIOS
    // --------------------------------------------------
    let form = FormApp.create('Alta de Socio - Club Guardia Mitre');
    form.setDescription('Completá tus datos para registrarte como socio del club.');
    form.addTextItem().setTitle('Nombre y Apellido Completo').setRequired(true);
    form.addTextItem().setTitle('DNI (Solo números)').setRequired(true);
    form.addTextItem().setTitle('Teléfono / WhatsApp').setRequired(true);
    form.addTextItem().setTitle('Correo Electrónico').setRequired(false);
    const catItem = form.addListItem().setTitle('Categoría').setRequired(true);
    catItem.setChoices([catItem.createChoice('Activo')]);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    const urlSocios = form.getPublishedUrl();

    // --------------------------------------------------
    // FORMULARIO 2: RESERVA DE CANCHA/SALÓN
    // --------------------------------------------------
    form = FormApp.create('Reserva de Cancha/Salon - Club Guardia Mitre');
    form.setDescription('Completá los datos para reservar un espacio.');
    const espItem = form.addListItem().setTitle('¿Qué espacio querés reservar?').setRequired(true);
    espItem.setChoices(["Cancha de Futsal","Salón Principal","Quincho","Cancha de Pádel"].map(c => espItem.createChoice(c)));
    form.addDateItem().setTitle('Fecha de la reserva').setRequired(true);
    const horaItem = form.addListItem().setTitle('Hora de inicio').setRequired(true);
    horaItem.setChoices(['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(h => horaItem.createChoice(h)));
    const durItem = form.addListItem().setTitle('Duración').setRequired(true);
    durItem.setChoices(['1 hora','2 horas','3 horas','4 horas (evento)'].map(d => durItem.createChoice(d)));
    form.addTextItem().setTitle('Nombre y Apellido del responsable').setRequired(true);
    form.addTextItem().setTitle('Teléfono / WhatsApp').setRequired(true);
    const socioItem = form.addListItem().setTitle('¿Es socio del club?').setRequired(true);
    socioItem.setChoices([socioItem.createChoice('Sí, soy socio'), socioItem.createChoice('No, soy externo')]);
    form.addParagraphTextItem().setTitle('Observaciones (opcional)').setRequired(false);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    const urlReservas = form.getPublishedUrl();

    // --------------------------------------------------
    // FORMULARIO 3: PAGO DE CUOTA
    // --------------------------------------------------
    form = FormApp.create('Pago de Cuota - Club Guardia Mitre');
    form.setDescription('Registrá el pago de cuota de un socio.');
    form.addTextItem().setTitle('ID del Socio (número)').setRequired(true).setHelpText('Ejemplo: 25');
    form.addTextItem().setTitle('Nombre del Socio').setRequired(true);
    const mesItem = form.addListItem().setTitle('Mes').setRequired(true);
    mesItem.setChoices(['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre','Anual'].map(m => mesItem.createChoice(m)));
    form.addTextItem().setTitle('Año (ej: 2026)').setRequired(true);
    form.addTextItem().setTitle('Monto pagado ($)').setRequired(true).setHelpText('Ejemplo: 4500 o 34000');
    const metItem = form.addListItem().setTitle('Método de pago').setRequired(true);
    metItem.setChoices(['Efectivo','Transferencia','Cheque','Exento'].map(m => metItem.createChoice(m)));
    form.addDateItem().setTitle('Fecha de pago').setRequired(true);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    const urlCuotas = form.getPublishedUrl();

    ui.alert("✅ FORMULARIOS CREADOS EXITOSAMENTE\n\n" +
      "📋 Socios: " + urlSocios + "\n\n" +
      "📅 Reservas: " + urlReservas + "\n\n" +
      "💰 Cuotas: " + urlCuotas + "\n\n" +
      "⚠️ IMPORTANTE: En cada hoja de respuestas que se creó en este spreadsheet,\n" +
      "agregá una columna al final (después de las respuestas) con header:\n" +
      "'Estado Proceso' (en fila 1). El script escribirá ahí 'Procesado' o 'Error'.");
  } catch (e) {
    ui.alert("❌ Error creando formularios: " + e.message);
  }
}

function onFormSubmitSocios(e) { sincronizarNuevosSocios(); }
function onFormSubmitReservas(e) { sincronizarNuevasReservas(); }
function onFormSubmitCuotas(e) { sincronizarNuevasCuotas(); }

function sincronizarNuevosSocios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hForm = ss.getSheetByName("Respuestas de formulario Nuevo Socio");
  const hSocios = ss.getSheetByName(HOJAS.SOCIOS);
  if (!hForm || !hSocios) return;

  const lr = hForm.getLastRow();
  if (lr < 2) return;
  if (hForm.getRange(lr, hForm.getLastColumn()).getValue() === "Procesado") return;

  const nombre = hForm.getRange(lr, 2).getValue();
  const dni = hForm.getRange(lr, 3).getValue();
  const tel = hForm.getRange(lr, 4).getValue();
  const email = hForm.getRange(lr, 5).getValue();
  const cat = hForm.getRange(lr, 6).getValue();

  const newID = hSocios.getLastRow();
  const anio = new Date().getFullYear().toString();

  hSocios.appendRow([newID, nombre, dni || "", tel || "", email || "", anio, cat || "Activo", "Alta desde formulario"]);
  hForm.getRange(lr, hForm.getLastColumn()).setValue("Procesado");
}

function sincronizarNuevasReservas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hForm = ss.getSheetByName("Respuestas de formulario Reservas");
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  const hEspacios = ss.getSheetByName(HOJAS.ESPACIOS);
  const hSocios = ss.getSheetByName(HOJAS.SOCIOS);
  const hCuotas = ss.getSheetByName(HOJAS.CUOTAS);
  if (!hForm || !hRes || !hEspacios || !hSocios || !hCuotas) return;

  try {
    const lr = hForm.getLastRow();
    if (lr < 2) return;
    const estado = hForm.getRange(lr, hForm.getLastColumn()).getValue();
    if (estado === "Procesado" || estado === "Rechazado") return;

    const espacio = hForm.getRange(lr, 2).getValue();
    const fecha = hForm.getRange(lr, 3).getValue();
    const horaInicio = hForm.getRange(lr, 4).getValue();
    const duracionTexto = hForm.getRange(lr, 5).getValue();
    const responsable = hForm.getRange(lr, 6).getValue();
    const telefono = hForm.getRange(lr, 7).getValue();
    const esSocio = hForm.getRange(lr, 8).getValue();

    let horasDuracion = 1;
    if (duracionTexto) {
      if (duracionTexto.toString().includes("2")) horasDuracion = 2;
      else if (duracionTexto.toString().includes("3")) horasDuracion = 3;
      else if (duracionTexto.toString().includes("4")) horasDuracion = 4;
    }

    const horaInicioNum = parseInt(horaInicio.toString().split(':')[0]);
    const horaFinNum = horaInicioNum + horasDuracion;
    const horaFinStr = horaFinNum.toString().padStart(2, '0') + ':00';

    let tarifaBase = 22000;
    if (hEspacios) {
      const datos = hEspacios.getDataRange().getValues();
      for (let i = 1; i < datos.length; i++) {
        if (datos[i][1] === espacio) { tarifaBase = datos[i][2]; break; }
      }
    }
    const montoBase = tarifaBase * horasDuracion;

    let descuento = 0;
    let tipoDescuento = "Ninguno";
    if (hSocios && hCuotas && esSocio?.toString().includes("Sí")) {
      const idSocio = buscarIDSocio(hSocios, responsable);
      if (idSocio > 0 && verificarSocioAlDia(hCuotas, idSocio)) {
        descuento = 2000;
        tipoDescuento = "Socio al día";
      }
    }

    const montoFinal = montoBase - descuento;

    const reservas = hRes.getDataRange().getValues();
    let hayConflicto = false;
    const fechaStr = fecha instanceof Date ? Utilities.formatDate(fecha, "GMT-3", "yyyy-MM-dd") : fecha;

    for (let i = 1; i < reservas.length; i++) {
      let resFecha = reservas[i][1];
      if (resFecha instanceof Date) resFecha = Utilities.formatDate(resFecha, "GMT-3", "yyyy-MM-dd");
      if (reservas[i][4] === espacio && resFecha === fechaStr && reservas[i][11] !== 'Reserva cancelada') {
        const resHora = parseInt(reservas[i][2].toString().split(':')[0]);
        if (horaInicioNum < resHora + 1 && horaFinNum > resHora) { hayConflicto = true; break; }
      }
    }

    const nuevoID = 'R-' + (hRes.getLastRow()).toString().padStart(3, '0');
    const encargados = ['Diego', 'Bruno', 'Gonzalo', 'Georgina', 'Genaro', 'Iris'];
    const encargado = encargados[(hRes.getLastRow() - 1) % encargados.length];

    if (hayConflicto) {
      hForm.getRange(lr, hForm.getLastColumn()).setValue("Rechazado - Horario ocupado");
      return;
    }

    // SOLO COPIAR DATOS DESDE FORMULARIO A HOJA MAESTRA (NADA MÁS)
    hRes.appendRow([
      nuevoID, fechaStr, horaInicio.toString(), horaFinStr, espacio, responsable, telefono,
      montoBase, descuento, montoFinal, 0, 'Por cobrar', encargado, tipoDescuento, '', ''
    ]);
    hForm.getRange(lr, hForm.getLastColumn()).setValue("Procesado");
  } catch (error) {
    Logger.log("ERROR in sincronizarNuevasReservas: " + error.toString());
    hForm.getRange(lr, hForm.getLastColumn()).setValue("Error: revisar registros");
  }
}

function sincronizarNuevasCuotas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hForm = ss.getSheetByName("Respuestas de formulario Cuotas");
  const hCuotas = ss.getSheetByName(HOJAS.CUOTAS);
  if (!hForm || !hCuotas) return;

  const lr = hForm.getLastRow();
  if (lr < 2) return;
  if (hForm.getRange(lr, hForm.getLastColumn()).getValue() === "Procesado") return;

  const idSoc = hForm.getRange(lr, 2).getValue();
  const nombre = hForm.getRange(lr, 3).getValue();
  const mes = hForm.getRange(lr, 4).getValue();
  const anio = hForm.getRange(lr, 5).getValue();
  const monto = parseFloat(hForm.getRange(lr, 6).getValue()) || 0;
  const metodo = hForm.getRange(lr, 7).getValue();
  const fechaPago = hForm.getRange(lr, 8).getValue();

  if (!idSoc || !nombre || monto <= 0) {
    hForm.getRange(lr, hForm.getLastColumn()).setValue("Error: Datos inválidos");
    return;
  }

  const nuevoID = hCuotas.getLastRow();
  hCuotas.appendRow([nuevoID, idSoc, nombre, anio, mes, monto, fechaPago, metodo, "Pagado", ""]);
  hForm.getRange(lr, hForm.getLastColumn()).setValue("Procesado");
}
```---

**_Triggers.gs**

```javascript
/* --------------------------------------------------------------
   TRIGGERS Y UTILIDADES
   -------------------------------------------------------------- */
function onEditInstalable(e) {
  try {
    const hoja = e.range.getSheet();
    if (hoja.getName() !== HOJAS.RESERVAS) return;

    const columnaEditada = e.range.getColumn();
    if (columnaEditada !== 12) return; // Estado Pago en columna L

    const nuevoEstado = e.value;
    const estadosQueActivan = ["Cobrado", "Abonado anticipado", "Pago parcial"];
    if (!estadosQueActivan.includes(nuevoEstado)) return;

    const filaEditada = e.range.getRow();
    const ultimaCol = hoja.getLastColumn();
    const rangoFila = hoja.getRange(filaEditada, 1, 1, ultimaCol);
    const filaVals = rangoFila.getValues()[0];

    if (hayConflictoSimple(filaVals)) {
      hoja.getRange(filaEditada, 12).setValue(e.oldValue);
      SpreadsheetApp.getActive().toast(
        "⚠️ Conflicto de horario detectado. La reserva no fue procesada.",
        "Error de Reserva",
        15
      );
      return;
    }

    Logger.log(`✅ Disparador activado en fila ${filaEditada}, columna ${columnaEditada}. Estado: ${nuevoEstado}`);

    const linksEscritos = generarLinksWhatsApp(filaVals);
    sincronizarConGoogleCalendar(filaVals);

    if (linksEscritos > 0) {
      SpreadsheetApp.getActive().toast(
        "✅ Reserva procesada: Link de WhatsApp generado y evento de Calendar creado/actualizado.",
        "Éxito",
        5
      );
    } else {
      SpreadsheetApp.getActive().toast(
        "ℹ️ Evento de Calendar creado, pero no se generó link de WhatsApp (teléfono vacío o ya existía enlace).",
        "Información",
        5
      );
    }
  } catch (error) {
    Logger.log("❌ ERROR en onEditInstalable: " + error.toString());
    SpreadsheetApp.getActive().toast(
      "❌ Error procesando la reserva. Revisa los registros.",
      "Error",
      15
    );
  }
}

function configurarTriggersAutomaticos() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const allTriggers = ScriptApp.getProjectTriggers();
  let borrados = 0;
  allTriggers.forEach(t => {
    if (t.getHandlerFunction().startsWith("onFormSubmit") ||
        t.getHandlerFunction().startsWith("sincronizar") ||
        t.getHandlerFunction().startsWith("actualizarDashboard")) {
      ScriptApp.deleteTrigger(t);
      borrados++;
    }
  });

  try {
    const hFormSoc = ss.getSheetByName("Respuestas de formulario Nuevo Socio");
    const hFormRes = ss.getSheetByName("Respuestas de formulario Reservas");
    const hFormCuo = ss.getSheetByName("Respuestas de formulario Cuotas");
    if (hFormSoc) ScriptApp.newTrigger("onFormSubmitSocios").forSpreadsheet(ss).onFormSubmit().create();
    if (hFormRes) ScriptApp.newTrigger("onFormSubmitReservas").forSpreadsheet(ss).onFormSubmit().create();
    if (hFormCuo) ScriptApp.newTrigger("onFormSubmitCuotas").forSpreadsheet(ss).onFormSubmit().create();
  } catch (e) {
    Logger.log("Error triggers formularios: " + e.message);
  }

  ScriptApp.newTrigger("sincronizarReservasAMovimientos").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("sincronizarCuotasAMovimientos").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("actualizarDashboardCompleto").timeBased().atHour(6).everyDays(1).create();
  ScriptApp.newTrigger("generarListaMorosos").timeBased().atHour(7).everyDays(1).create();
  ScriptApp.newTrigger("generarRendicionesSemanales").timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();

  ui.alert("✅ TRIGGERS CONFIGURADOS AUTOMÁTICAMENTE\n\n" +
    "🗑️ Triggers viejos eliminados: " + borrados + "\n\n" +
    "⏰ **Triggers de Reloj creados:**\n" +
    "• Cada 1 hora: Sincronizar Reservas → Movimientos\n" +
    "• Cada 1 hora: Sincronizar Cuotas → Movimientos\n" +
    "• Diario 06:00: Actualizar Dashboard Completo\n" +
    "• Diario 07:00: Generar Lista de Morosos\n" +
    "• Lunes 08:00: Generar Rendiciones Semanales\n\n" +
    "📋 **Triggers de Formulario creados:**\n" +
    "• Al enviar formulario Socios → sincronizarNuevosSocios\n" +
    "• Al enviar formulario Reservas → sincronizarNuevasReservas\n" +
    "• Al enviar formulario Cuotas → sincronizarNuevasCuotas\n\n" +
    "💡 Podés ver/modificar/borrar en: Extensiones > Apps Script > Triggers (icono reloj ⏰)");
}

function verTriggersActuales() {
  const triggers = ScriptApp.getProjectTriggers();
  let msg = "⏰ TRIGGERS ACTUALES DEL PROYECTO:\n\n";
  if (triggers.length === 0) {
    msg += "(ninguno)";
  } else {
    triggers.forEach((t, i) => {
      const ev = t.getEventType();
      const src = t.getTriggerSource();
      let freq = "";
      if (!t.getTriggerSourceId()) {
        const fn = t.getHandlerFunction();
        if (fn.includes("sincronizar")) freq = "Cada hora";
        else if (fn.includes("Dashboard")) freq = "Diario 6AM";
        else if (fn.includes("Morosos")) freq = "Diario 7AM";
        else if (fn.includes("Rendiciones")) freq = "Lunes 8AM";
      }
      msg += `${i+1}. ${t.getHandlerFunction()}\n   Evento: ${ev} | Fuente: ${src}${freq}\n   ID: ${t.getUniqueId()}\n\n`;
    });
  }
  SpreadsheetApp.getUi().alert(msg);
}

function borrarTodosLosTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));
  SpreadsheetApp.getUi().alert("🗑️ Se eliminaron " + triggers.length + " triggers del proyecto.");
}

function deshacerUltimoMovimiento() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  const hCuo = ss.getSheetByName(HOJAS.CUOTAS);
  if (!hMov) { ui.alert("❌ No se encuentra hoja Movimientos."); return; }

  const lr = hMov.getLastRow();
  if (lr <= 1) { ui.alert("ℹ️ No hay movimientos para deshacer."); return; }

  const ult = hMov.getRange(lr, 1, 1, 10).getValues()[0];
  const id = ult[0];
  const cat = ult[3];
  const desc = ult[5];
  const ing = ult[7];
  const egr = ult[8];
  const resp = ult[6];

  const respBtn = ui.alert(
    `⚠️ CONFIRMAR DESHACER ÚLTIMO MOVIMIENTO\n\n` +
    `ID: ${id}\n` +
    `Categoría: ${cat}\n` +
    `Descripción: ${desc}\n` +
    `Ingreso: ${Number(ing).toLocaleString()}\n` +
    `Egreso: ${Number(egr).toLocaleString()}\n` +
    `Responsable: ${resp}\n\n` +
    `Esto borrará la fila de Movimientos y pondrá "Sincronizado" = ""\n` +
    `en la reserva/cuota correspondiente. ¿Continuar?`,
    ui.ButtonSet.YES_NO
  );

  if (respBtn !== ui.Button.YES) return;

  hMov.deleteRow(lr);
  let revertido = false;
  if (cat === "Turnos" && hRes) {
    const dat = hRes.getDataRange().getValues();
    const h = dat[0];
    const iDesc = h.indexOf("Descripción");
    const iSinc = h.indexOf("Sincronizado");
    for (let i = dat.length - 1; i >= 1; i--) {
      if (dat[i][iDesc] && dat[i][iDesc].toString().includes(resp) && dat[i][iSinc] === "Si") {
        hRes.getRange(i + 1, iSinc + 1).setValue("");
        revertido = true;
        break;
      }
    }
  }
  if (cat === "Cuotas Socios" && hCuo) {
    const dat = hCuo.getDataRange().getValues();
    const h = dat[0];
    const iNom = h.indexOf("Nombre Socio");
    const iSinc = h.indexOf("Sincronizado");
    for (let i = dat.length - 1; i >= 1; i--) {
      if (dat[i][iNom] === resp && dat[i][iSinc] === "Si") {
        hCuo.getRange(i + 1, iSinc + 1).setValue("");
        revertido = true;
        break;
      }
    }
  }

  ui.alert("✅ Último movimiento deshecho.\n\n" +
    `Fila ${lr} de Movimientos eliminada.\n` +
    (revertido ? "🔄 Sincronización revertida en hoja origen." : "⚠️ No se encontró origen para revertir (revisar manual).") +
    "\n\nRecordá: Si el movimiento venía de Carga Rápida, solo se borra de Movimientos.");
}
```---

**_UI.gs**

```javascript
/* --------------------------------------------------------------
   MENÚ PRINCIPAL Y FUNCIONES DE INTERFAZ
   -------------------------------------------------------------- */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🏆 Club GM');

  menu.addItem('🎯 Abrir Panel de Control', 'abrirPanelControl')
    .addSeparator()
    .addItem('📝 Procesar Carga Rápida', 'procesarCargaRapida')
    .addItem('📊 Sincronizar Reservas → Movimientos', 'sincronizarReservasAMovimientos')
    .addItem('💰 Sincronizar Cuotas → Movimientos', 'sincronizarCuotasAMovimientos')
    .addSeparator()
    .addItem('🧾 Generar Rendiciones Semanales', 'generarRendicionesSemanales')
    .addItem('📋 Ver Lista de Morosos', 'generarListaMorosos')
    .addItem('📊 Actualizar Dashboard Completo', 'actualizarDashboardCompleto')
    .addSeparator()
    .addItem('📱 Generar Links WhatsApp', 'generarLinksWhatsApp')
    .addItem('📅 Sincronizar con Google Calendar', 'sincronizarConGoogleCalendar')
    .addSeparator()
    .addItem('⚙️ Crear Formularios (Ejecutar 1 vez)', 'crearFormularios')
    .addItem('🔧 Configurar Triggers Automáticos', 'configurarTriggersAutomaticos')
    .addSeparator()
    .addItem('📊 Generar Cierre Periódico (PDF)', 'menuGenerarCierrePeriodico')
    .addToUi();
}

function abrirPanelControl() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.PANEL_CONTROL).activate();
}

function menuGenerarCierrePeriodico() {
  const ui = SpreadsheetApp.getUi();

  const tipoPrompt = ui.prompt(
    "📊 GENERAR CIERRE PERIÓDICO",
    "Seleccioná tipo:\n1️⃣ Mensual\n2️⃣ Trimestral\n3️⃣ Anual\n4️⃣ Personalizado (fechas exactas)\n\nEscribí el número:",
    ui.ButtonSet.OK_CANCEL
  );
  if (tipoPrompt.getSelectedButton() !== ui.Button.OK) return;
  const tipoNum = parseInt(tipoPrompt.getResponseText().trim());
  const tipos = {1:"Mensual",2:"Trimestral",3:"Anual",4:"Personalizado"};
  const tipo = tipos[tipoNum];
  if (!tipo) { ui.alert("❌ Opción inválida."); return; }

  const añoPrompt = ui.prompt(`📊 CIERRE ${tipo.toUpperCase()}`, "Año (ej: 2026):", ui.ButtonSet.OK_CANCEL);
  if (añoPrompt.getSelectedButton() !== ui.Button.OK) return;
  const año = parseInt(añoPrompt.getResponseText().trim());
  if (isNaN(año) || año < 2020 || año > 2030) { ui.alert("❌ Año inválido."); return; }

  let mesOtrim = null;
  if (tipo === "Mensual") {
    const m = ui.prompt("Mes (1-12):", ui.ButtonSet.OK_CANCEL);
    if (m.getSelectedButton() !== ui.Button.OK) return;
    mesOtrim = parseInt(m.getResponseText().trim());
    if (isNaN(mesOtrim) || mesOtrim < 1 || mesOtrim > 12) { ui.alert("❌ Mes inválido."); return; }
  } else if (tipo === "Trimestral") {
    const t = ui.prompt("Trimestre (1-4):", ui.ButtonSet.OK_CANCEL);
    if (t.getSelectedButton() !== ui.Button.OK) return;
    mesOtrim = parseInt(t.getResponseText().trim());
    if (isNaN(mesOtrim) || mesOtrim < 1 || mesOtrim > 4) { ui.alert("❌ Trimestre inválido."); return; }
  } else if (tipo === "Personalizado") {
    const ini = ui.prompt("Fecha INICIO (dd/mm/yyyy):", ui.ButtonSet.OK_CANCEL);
    if (ini.getSelectedButton() !== ui.Button.OK) return;
    const fin = ui.prompt("Fecha FIN (dd/mm/yyyy):", ui.ButtonSet.OK_CANCEL);
    if (fin.getSelectedButton() !== ui.Button.OK) return;
    const fi = _parsearFechaDDMMYYYY(ini.getResponseText());
    const ff = _parsearFechaDDMMYYYY(fin.getResponseText());
    if (!fi || !ff) { ui.alert("❌ Formato fecha inválido (dd/mm/yyyy)."); return; }
    ff.setHours(23,59,59);
    mesOtrim = { inicio: fi, fin: ff };
  }

  const conf = ui.alert(
    `✅ CONFIRMAR GENERACIÓN\n\nTipo: ${tipo}\nAño: ${año}\nPeríodo: ${tipo==="Mensual"?`Mes ${mesOtrim}`:tipo==="Trimestral"?`Q${mesOtrim}`:tipo}\n\n`+
    `Se hará:\n1. Recálculo directo Reservas + Cuotas + Gastos\n2. PDF Consolidado en Drive\n3. Registro en 📋 Cierres_Periódicos\n\n¿Continuar?`,
    ui.ButtonSet.YES_NO
  );
  if (conf !== ui.Button.YES) return;

  try {
    ui.alert("⏳ Generando cierre... (10-20 seg)");
    const datos = generarCierrePeriodico(tipo, año, mesOtrim);
    const pdfUrl = exportarCierreAPDF(datos);
    registrarCierreEnLog(datos, pdfUrl);

    ui.alert(
      `✅ CIERRE ${tipo.toUpperCase()} GENERADO\n\n📄 PDF: ${pdfUrl}\n\n`+
      `📊 Resumen:\n• Reservas: ${datos.reservas.total.toLocaleString()}\n`+
      `• Cuotas: ${datos.cuotas.total.toLocaleString()}\n`+
      `• Gastos: ${datos.gastos.total.toLocaleString()}\n`+
      `• NETO: ${datos.neto.toLocaleString()}\n\n`+
      `En Drive > ${CIERRE.CARPETA_ROOT} > ${CIERRE.SUB_CARPETA} > ${año} > ${datos.periodo.folderName}`
    );
  } catch (e) {
    ui.alert("❌ ERROR: " + e.message + "\n\n" + e.stack);
  }
}
```---

**_Tests.gs**

```javascript
/* --------------------------------------------------------------
   FUNCIONES DE PRUEBA (para desarrollo/debug)
   -------------------------------------------------------------- */
function testOnEdit() {
  const fakeEvent = {
    range: {
      getSheet: () => SpreadsheetApp.getActiveSpreadsheet()
                         .getSheetByName(HOJAS.RESERVAS),
      getColumn: () => 12,
      getRow:    () => 2,
      getValue:  () => "Cobrado"
    },
    oldValue: "Por cobrado",
    value:    "Cobrado"
  };
  onEdit(fakeEvent);
}

function testConflicto() {
  const reservaDePrueba = {
    fila: 8,
    espacio: "Cancha de Futsal",
    fechaObj: new Date("2026-06-25"),
    horaInicioStr: "12:00",
    horaFinStr: "13:00"
  };
  const hayConflicto = hayConflictoSimple(reservaDePrueba);
  Logger.log("✅ PRUEBA: Para reserva en " + reservaDePrueba.espacio +
            " el " + reservaDePrueba.fechaObj.toDateString() +
            " de " + reservaDePrueba.horaInicioStr + " a " + reservaDePrueba.horaFinStr +
            " → ¿Conflicto? " + hayConflicto);
  SpreadsheetApp.getActive().toast(
    "PRUEBA DE CONFLICTO: " + (hayConflicto ? "¡CONFLICTO DETECTADO!" : "Libre"),
    "🧪 Test",
    5
  );
}

function testSoloMensaje() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hRes = ss.getSheetByName(HOJAS.RESERVAS);
    if (!hRes) {
      Logger.log("❌ ERROR: No se encontró hoja '📅 Reservas'");
      return;
    }

    const dat = hRes.getDataRange().getValues();
    let testRow = null;
    for (let i = 1; i < dat.length; i++) {
      const f = dat[i];
      const responsable = String(f[5] || "").trim();
      const telefono = String(f[6] || "").replace(/\D/g, "");
      const fecha = f[1];
      if (responsable && telefono.length >= 10 && fecha instanceof Date && !isNaN(fecha)) {
        testRow = f;
        break;
      }
    }

    if (!testRow) {
      Logger.log("ℹ️ No se encontró una fila de reserva válida para probar en hoja Reservas");
      return;
    }

    const h = hRes.getDataRange().getValues()[0];
    const iTel = h.indexOf("Teléfono");
    const iEspacio = h.indexOf("Espacio");
    const iFec = h.indexOf("Fecha");
    const iHi = h.indexOf("Hora Inicio");
    const iHf = h.indexOf("Hora Fin");
    const iMon = h.indexOf("Monto Final ($)");
    const iDesc = h.indexOf("Descuento ($)");
    const iResp = h.indexOf("Responsable");
    const iLink = h.indexOf("Link WhatsApp");

    if ([iTel, iEspacio, iFec, iHi, iHf, iMon, iDesc, iResp, iLink].some(i => i === -1)) {
      Logger.log("❌ ERROR: Faltan columnas necesarias en hoja Reservas para generar Links WhatsApp");
      return;
    }

    const telRaw = String(testRow[iTel] || "").replace(/\D/g, "");
    if (!telRaw || telRaw.length < 10) {
      Logger.log("❌ Teléfono inválido en fila de prueba");
      return;
    }

    const espacio = testRow[iEspacio];
    const fechaObj = testRow[iFec];
    const hiObj = testRow[iHi];
    const hfObj = testRow[iHf];
    const monto = Number(testRow[iMon]) || 0;
    const descuento = Number(testRow[iDesc]) || 0;
    const nombreResponsable = String(testRow[iResp] || "Cliente");

    const formatearFecha = (valor) => {
      if (valor instanceof Date && !isNaN(valor)) {
        return Utilities.formatDate(valor, "GMT-3", "dd/MM/yyyy");
      }
      return String(valor || "");
    };
    const formatearHora = (valor) => {
      if (valor instanceof Date && !isNaN(valor)) {
        return Utilities.formatDate(valor, "GMT-3", "HH:mm");
      }
      const str = String(valor || "").trim();
      return str.length >= 5 ? str.substring(0, 5) : "00:00";
    };

    const fecStr = formatearFecha(fechaObj);
    const hiStr = formatearHora(hiObj);
    const hfStr = formatearHora(hfObj);

    let plantilla = MSGS_WHATSAPP[testRow[iEspacio]];
    if (!plantilla) {
      plantilla = MSGS_WHATSAPP.DEFAULT;
      Logger.log(`⚠️ No se encontró plantilla para espacio "${testRow[iEspacio]}", usando DEFAULT`);
    }

    let mensaje = plantilla
      .replace(/\[NOMBRE\]/g, nombreResponsable)
      .replace(/\[FECHA\]/g, fecStr)
      .replace(/\[HORA INICIO\]/g, hiStr)
      .replace(/\[HORA FIN\]/g, hfStr)
      .replace(/\[MONTO\]/g, monto.toLocaleString())
      .replace(/\[DESCUENTO\]/g, descuento.toLocaleString())
      .replace(/\[ESPACIO\]/g, espacio);

    const telefonoFormateado = "549" + telRaw;
    const link = `https://wa.me/${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`;

    Logger.log("=== PRUEBA DE generateLinksWhatsApp() === ");
    Logger.log(`Datos de prueba: Responsable=${nombreResponsable}, Tel=${telRaw}, Fecha=${fecStr}, Hora=${hiStr}-${hfStr}, Monto=${monto}`);
    Logger.log(`Link generado: ${link}`);
    Logger.log("========================================");

    SpreadsheetApp.getActive().toast(
      "🔬 Prueba de link de WhatsApp completada. Revisa los registros (Ver > Ejecuciones).",
      "Prueba Exitosa",
      5
    );
  } catch (error) {
    Logger.log("❌ ERROR en testSoloMensaje: " + error.toString());
    SpreadsheetApp.getActive().toast(
      "❌ Error en la prueba de link de WhatsApp. Revisa los registros.",
      "Error de Prueba",
      10
    );
  }
}
```---

Con estos seis archivos tendrás el proyecto completo, sin funciones duplicadas y listo para usar.
Para ponerlos en marcha:

1. En el editor de Apps Script, crea cada archivo con el nombre exacto indicado y pega el contenido correspondiente.
2. Guarda (Ctrl + S).
3. Recarga la hoja de cálculo (F5).
4. Ejecuta `instalarSistemaCompleto()` una vez (desde el menú ► Ejecutar) para crear las hojas y el menú.
5. Sigue los pasos indicados en el menú: crear formularios, configurar triggers, etc.

¡Listo! Tu sistema de gestión del Club Guardia Mitre quedará operativo y organizado. 🚀