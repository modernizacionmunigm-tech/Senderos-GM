// ============================================================================
// SISTEMA DE GESTIÓN - CLUB GUARDIA MITRE
// Versión LIMPIA, COMPLETA y LISTA PARA INSTALAR (Parte 1/5)
// ============================================================================

// ============================================================================
// CONSTANTES GLOBALES (Nombres EXACTOS de hojas — SIN espacios iniciales)
// ============================================================================
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

// ============================================================================
// 1. INSTALACIÓN LIMPIA (Ejecutar UNA SOLA VEZ)
// ============================================================================
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

  // 4. Crear menú
  onOpen();

  SpreadsheetApp.getUi().alert(
    "✅ SISTEMA INSTALADO CORRECTAMENTE\n\n" +
    "Hojas creadas:\n" + Object.values(HOJAS).join("\n") + "\n\n" +
    "Próximos pasos:\n" +
    "1. Ejecutar 'crearFormularios()' para crear los 3 formularios\n" +
    "2. Configurar triggers: Menú 🏆 Club GM → ⚙️ Configurar Triggers Automáticos\n" +
    "3. Probar: Menú 🏆 Club GM → 📋 Ver Lista de Morosos"
  );
}

// ============================================================================
// HELPERS: CREACIÓN DE CADA HOJA (nombres desde HOJAS.*)
// ============================================================================
function _crearHojaEncargados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.ENCARGADOS);
  h.getRange("A1:E1").setValues([["ID", "Nombre", "Rol", "Teléfono", "Email"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.getRange("A2:E7").setValues([
    [1, "Diego", "Administrador", "", ""],
    [2, "Bruno", "Comisión", "", ""],
    [3, "Gonzalo", "Comisión", "", ""],
    [4, "Georgina", "Comisión", "", ""],
    [5, "Genaro", "Comisión", "", ""],
    [6, "Iris", "Comisión", "", ""]
  ]);
  h.setColumnWidths(1, 5, 150);
}

function _crearHojaSocios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.SOCIOS);
  h.getRange("A1:H1").setValues([["ID", "Nombre Completo", "DNI", "Teléfono", "Email", "Fecha Alta", "Categoría", "Observaciones"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1, 8, 130);
  h.setColumnWidth(2, 200);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Activo", "Vitalicio", "Inactivo", "Moroso"])
    .setAllowInvalid(false).build();
  h.getRange("G2:G1000").setDataValidation(rule);
}

function _crearHojaCuotas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.CUOTAS);
  // 10 columnas: ID_Pago .. Sincronizado
  h.getRange("A1:J1").setValues([["ID_Pago", "ID_Socio", "Nombre Socio", "Año", "Mes", "Monto Pagado", "Fecha Pago", "Método", "Estado", "Sincronizado"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1, 10, 120);
  h.setColumnWidth(3, 180);
  h.setColumnWidth(10, 100);

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
  h.getRange("A1:D1").setValues([["ID", "Nombre del Espacio", "Tarifa Base ($)", "Estado"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.getRange("A2:D5").setValues([
    [1, "Cancha de Futsal", 22000, "Activo"],
    [2, "Salón Principal", 50000, "Activo"],
    [3, "Quincho", 30000, "Activo"],
    [4, "Cancha de Pádel", 25000, "En construcción"]
  ]);
  h.setColumnWidths(1, 4, 150);
}

function _crearHojaReservas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.RESERVAS);
  const headers = [
    "ID Reserva", "Fecha", "Hora Inicio", "Hora Fin", "Espacio", "Responsable", "Teléfono",
    "Monto Base ($)", "Descuento ($)", "Monto Final ($)", "Seña ($)", "Estado Pago",
    "Encargado", "Tipo Descuento", "Link WhatsApp", "ID Calendario", "Sincronizado"
  ];
  h.getRange(1, 1, 1, 17).setValues([headers]).setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1, 17, 110);
  h.setColumnWidth(6, 180);

  const ruleEspacio = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Cancha de Futsal", "Salón Principal", "Quincho", "Cancha de Pádel"])
    .setAllowInvalid(false).build();
  h.getRange("E2:E1000").setDataValidation(ruleEspacio);

  const ruleEstadoPago = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Por cobrar", "Cobrado", "Abonado anticipado", "Pago parcial", "Reserva cancelada"])
    .setAllowInvalid(false).build();
  h.getRange("L2:L1000").setDataValidation(ruleEstadoPago);

  const ruleEncargado = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Diego", "Bruno", "Gonzalo", "Georgina", "Genaro", "Iris"])
    .setAllowInvalid(false).build();
  h.getRange("M2:M1000").setDataValidation(ruleEncargado);

  const ruleTipoDesc = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Ninguno", "Socio al día", "Pago anticipado", "Socio + Pago anticipado"])
    .setAllowInvalid(false).build();
  h.getRange("N2:N1000").setDataValidation(ruleTipoDesc);
}

function _crearHojaRendiciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.RENDICIONES);
  const headers = [["Semana", "Encargado", "Espacio", "Turnos Asignados", "Monto Teórico ($)",
                    "Monto Real Entregado ($)", "Diferencia ($)", "Estado"]];
  h.getRange("A1:H1").setValues(headers).setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1, 8, 130);

  const ruleEnc = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Diego", "Bruno", "Gonzalo", "Georgina", "Genaro", "Iris"])
    .setAllowInvalid(false).build();
  h.getRange("B2:B1000").setDataValidation(ruleEnc);

  const ruleEsp = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Cancha de Futsal", "Salón Principal", "Quincho", "Cancha de Pádel"])
    .setAllowInvalid(false).build();
  h.getRange("C2:C1000").setDataValidation(ruleEsp);

  const ruleEst = SpreadsheetApp.newDataValidation()
    .requireValueInList(["OK", "Faltante", "Sobrante", "Pendiente"])
    .setAllowInvalid(false).build();
  h.getRange("H2:H1000").setDataValidation(ruleEst);
}

function _crearHojaMovimientos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.MOVIMIENTOS);
  const headers = [["ID", "Fecha", "Mes", "Categoría", "Subcategoría", "Descripción", "Responsable", "Ingreso", "Egreso", "Saldo Acumulado"]];
  h.getRange("A1:J1").setValues(headers).setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1, 10, 120);
  h.setColumnWidth(6, 250);

  const cats = [
    "Turnos", "Alquileres", "Cantina", "Cheque Muni", "Indumentaria", "Banco",
    "Pagos Reyna (Quincho)", "Pagos Personal", "Pagos Profes", "Compras/Insumos",
    "Arreglos/Mantenimiento", "Saldo Inicial", "Cuotas Socios"
  ];
  const ruleCat = SpreadsheetApp.newDataValidation()
    .requireValueInList(cats).setAllowInvalid(false).build();
  h.getRange("D2:D1000").setDataValidation(ruleCat);
}

function _crearHojaCargaRapida() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.CARGA_RAPIDA);
  h.getRange("A1").setValue("CARGA RÁPIDA DE MOVIMIENTOS").setFontWeight("bold").setFontSize(14);
  h.getRange("A2").setValue("Completá los datos. Al marcar 'Pendiente' en columna I se procesará automáticamente.");
  h.getRange("A4:J4").setValues([["Fecha", "Mes", "Categoría", "Subcategoría", "Descripción", "Responsable", "Ingreso", "Egreso", "Estado", "ID Movimiento"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.getRange("A5:J5").setBackground("#FFF2CC");
  h.setColumnWidths(1, 10, 130);
  h.setColumnWidth(5, 250);

  const mesesCarga = ["Jul-25","Ago-25","Sep-25","Oct-25","Nov-25","Dic-25","Ene-26","Feb-26","Mar-26","Abr-26","May-26","Jun-26","Jul-26","Ago-26","Sep-26","Oct-26","Nov-26","Dic-26"];
  const ruleMes = SpreadsheetApp.newDataValidation().requireValueInList(mesesCarga).setAllowInvalid(false).build();
  h.getRange("B5:B1000").setDataValidation(ruleMes);

  const ruleCat = SpreadsheetApp.newDataValidation().requireValueInList(cats).setAllowInvalid(false).build();
  h.getRange("C5:C1000").setDataValidation(ruleCat);

  const ruleEst = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pendiente", "Procesado", "Error"])
    .setAllowInvalid(false).build();
  h.getRange("I5:I1000").setDataValidation(ruleEst);
}

function _crearHojaResumenMensual() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.RESUMEN_MENSUAL);
  h.getRange("A1:H1").setValues([["Mes", "Ingresos Turnos", "Ingresos Cuotas", "Otros Ingresos", "Total Ingresos", "Total Egresos", "Resultado Neto", "Saldo Final"]])
   .setFontWeight("bold").setBackground("#D9E1F2");
  h.setColumnWidths(1, 8, 140);
}

function _crearHojaMorosos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const h = ss.insertSheet(HOJAS.MOROSOS);
  h.getRange("A1:G1").setValues([["ID","Socio","Teléfono","Email","Meses Adeudados","Cantidad","Último Pago"]])
   .setFontWeight("bold").setBackground("#F4CCCC");
  h.setColumnWidths(1, 7, [50, 200, 120, 200, 300, 80, 120]);
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
    ["📝 Procesar Carga Rápida", "procesarCargaRapida"],
    ["📊 Sincronizar Reservas → Movimientos", "sincronizarReservasAMovimientos"],
    ["💰 Sincronizar Cuotas → Movimientos", "sincronizarCuotasAMovimientos"],
    ["🧾 Generar Rendiciones Semanales", "generarRendicionesSemanales"],
    ["📋 Ver Lista de Morosos", "generarListaMorosos"],
    ["📊 Actualizar Dashboard Completo", "actualizarDashboardCompleto"],
    ["📱 Generar Links WhatsApp", "generarLinksWhatsApp"],
    ["📅 Sincronizar con Google Calendar", "sincronizarConGoogleCalendar"]
  ];

  let row = 4;
  acciones.forEach(a => {
    h.getRange(row, 1).setValue(a[0]).setFontWeight("bold");
    h.getRange(row, 2).setValue(a[1]).setFontColor("#1155CC").setFontStyle("italic");
    row++;
  });

  h.getRange(row+1, 1, 1, 6).merge().setValue("INFORMACIÓN DEL SISTEMA")
   .setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2");
  row += 2;

  const info = [
    ["Total Socios:", '=COUNTA(\'👥 Socios\'!A:A)-1'],
    ["Reservas este mes:", '=COUNTIFS(\'📅 Reservas\'!B:B,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),\''+HOJAS.RESERVAS+'\'!L:L,"<>Reserva cancelada")'],
    ["Movimientos registrados:", '=COUNTA(\''+HOJAS.MOVIMIENTOS+'\'!A:A)-1'],
    ["Cuotas pagadas 2026:", '=COUNTIFS(\''+HOJAS.CUOTAS+'\'!D:D,2026,\''+HOJAS.CUOTAS+'\'!I:I,"Pagado")']
  ];
  info.forEach(([label, formula]) => {
    h.getRange(row, 1).setValue(label).setFontWeight("bold");
    h.getRange(row, 2).setFormula(formula);
    row++;
  });

  h.setColumnWidth(1, 250);
  h.setColumnWidth(2, 200);
  h.setColumnWidth(3, 400);
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

// ============================================================================
// FIN PARTE 1/5
// ============================================================================
// ============================================================================
// SISTEMA DE GESTIÓN - CLUB GUARDIA MITRE
// Versión LIMPIA, COMPLETA y LISTA PARA INSTALAR (Parte 2/5)
// ============================================================================

// ============================================================================
// 2. MENÚ PRINCIPAL (onOpen)
// ============================================================================
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
    .addToUi();
}

function abrirPanelControl() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.PANEL_CONTROL).activate();
}

// ============================================================================
// 3. CREACIÓN DE FORMULARIOS (Ejecutar UNA VEZ desde el menú)
// ============================================================================
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

// ============================================================================
// 4. TRIGGERS DE FORMULARIOS (se disparan automáticamente al enviar formulario)
// ============================================================================
function onFormSubmitSocios(e) { sincronizarNuevosSocios(); }
function onFormSubmitReservas(e) { sincronizarNuevasReservas(); }
function onFormSubmitCuotas(e) { sincronizarNuevasCuotas(); }

// ============================================================================
// 5. SINCRONIZACIÓN: FORMULARIOS → HOJAS MAESTRAS
// ============================================================================
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
  const hSocios = ss.getSheetByName(HOJAS.SOCIOS);
  const hCuotas = ss.getSheetByName(HOJAS.CUOTAS);
  const hEsp = ss.getSheetByName(HOJAS.ESPACIOS);
  if (!hForm || !hRes) return;

  const lr = hForm.getLastRow();
  if (lr < 2) return;
  const estado = hForm.getRange(lr, hForm.getLastColumn()).getValue();
  if (estado === "Procesado" || estado === "Rechazado") return;

  const espacio = hForm.getRange(lr, 2).getValue();
  const fecha = hForm.getRange(lr, 3).getValue();
  const horaIni = hForm.getRange(lr, 4).getValue();
  const durTxt = hForm.getRange(lr, 5).getValue();
  const resp = hForm.getRange(lr, 6).getValue();
  const tel = hForm.getRange(lr, 7).getValue();
  const esSocio = hForm.getRange(lr, 8).getValue();

  let hrs = 1;
  if (durTxt?.includes("2")) hrs = 2;
  else if (durTxt?.includes("3")) hrs = 3;
  else if (durTxt?.includes("4")) hrs = 4;

  const hIni = parseInt(horaIni.toString().split(':')[0]);
  const hFin = hIni + hrs;
  const hFinStr = hFin.toString().padStart(2,'0') + ':00';

  let tarifa = 22000;
  const datEsp = hEsp.getDataRange().getValues();
  for (let i=1;i<datEsp.length;i++) if (datEsp[i][1]===espacio) { tarifa=datEsp[i][2]; break; }

  const base = tarifa * hrs;
  let desc = 0, tipoDesc = "Ninguno";

  if (hSocios && hCuotas && esSocio?.toString().includes("Sí")) {
    const idSoc = buscarIDSocio(hSocios, resp);
    if (idSoc > 0 && verificarSocioAlDia(hCuotas, idSoc)) {
      desc = 2000; tipoDesc = "Socio al día";
    }
  }

  const final = base - desc;
  const reservas = hRes.getDataRange().getValues();
  let conflicto = false;
  const fStr = fecha instanceof Date ? Utilities.formatDate(fecha, "GMT-3", "yyyy-MM-dd") : fecha;

  for (let i=1;i<reservas.length;i++) {
    let rf = reservas[i][1];
    if (rf instanceof Date) rf = Utilities.formatDate(rf, "GMT-3", "yyyy-MM-dd");
    if (reservas[i][4]===espacio && rf===fStr && reservas[i][11]!=="Reserva cancelada") {
      const rh = parseInt(reservas[i][2].toString().split(':')[0]);
      if (hIni < rh+1 && hFin > rh) { conflicto=true; break; }
    }
  }

  const encs = ['Diego','Bruno','Gonzalo','Georgina','Genaro','Iris'];
  const encargado = encs[(hRes.getLastRow() - 1) % encs.length];

  if (conflicto) {
    hForm.getRange(lr, hForm.getLastColumn()).setValue("Rechazado - Horario ocupado");
    return;
  }

   const nuevoID = 'R-' + (hRes.getLastRow()).toString().padStart(3, '0');
  const encs = ['Diego','Bruno','Gonzalo','Georgina','Genaro','Iris'];
  const encargado = encs[(hRes.getLastRow() - 1) % encs.length];

  if (conflicto) {
    hForm.getRange(lr, hForm.getLastColumn()).setValue("Rechazado - Horario ocupado");
    return;
  }

  hRes.appendRow([nuevoID, fStr, horaIni.toString(), hFinStr, espacio, resp, tel, base, desc, final, 0, 'Por cobrar', encargado, tipoDesc, '', '']);
  hForm.getRange(lr, hForm.getLastColumn()).setValue("Procesado");
}

// ============================================================================
// SINCRONIZACIÓN: FORMULARIO CUOTAS → HOJA CUOTAS
// ============================================================================
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

// ============================================================================
// HELPERS GLOBALES
// ============================================================================
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

// ============================================================================
// PROCESAR CARGA RÁPIDA (Hoja 📝 Carga Rápida → 💵 Movimientos)
// ============================================================================
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

// ============================================================================
// SINCRONIZACIÓN: RESERVAS COBRADAS → MOVIMIENTOS (Categoría "Turnos")
// ============================================================================
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

// ============================================================================
// SINCRONIZACIÓN: CUOTAS PAGADAS → MOVIMIENTOS (Categoría "Cuotas Socios")
// ============================================================================
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

// ============================================================================
// HELPERS DE FECHA / MES CORTO
// ============================================================================
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

// ============================================================================
// FIN PARTE 3/5
// ============================================================================

// ============================================================================
// SISTEMA DE GESTIÓN - CLUB GUARDIA MITRE
// Versión LIMPIA, COMPLETA y LISTA PARA INSTALAR (Parte 4/5)
// ============================================================================

// ============================================================================
// RENDICIONES SEMANALES (📅 Reservas → 🧾 Rendiciones)
// ============================================================================
function generarRendicionesSemanales() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  const hRen = ss.getSheetByName(HOJAS.RENDICIONES);
  if (!hRes || !hRen) return;

  const datos = hRes.getDataRange().getValues();
  const h = datos[0];
  const iFecha = h.indexOf("Fecha");
  const iMonto = h.indexOf("Monto Final ($)");
  const iEst = h.indexOf("Estado Pago");
  const iEnc = h.indexOf("Encargado");
  const iEsp = h.indexOf("Espacio");

  const hoy = new Date();
  const hace7 = new Date(); hace7.setDate(hoy.getDate() - 7);
  const semanaStr = Utilities.formatDate(hace7, "GMT-3", "dd/MM") + " al " + Utilities.formatDate(hoy, "GMT-3", "dd/MM");

  // Acumular por encargado
  const rend = {}; // { "Diego": { turnos: 3, monto: 66000 } }

  for (let i = 1; i < datos.length; i++) {
    const f = datos[i];
    const fecha = f[iFecha];
    const est = f[iEst];
    if (!(fecha instanceof Date) || isNaN(fecha)) continue;
    if (fecha < hace7) continue;
    if (est !== "Cobrado" && est !== "Abonado anticipado") continue;

    const enc = f[iEnc];
    if (!enc) continue;
    const monto = Number(f[iMonto]) || 0;

    if (!rend[enc]) rend[enc] = { turnos: 0, monto: 0 };
    rend[enc].turnos++;
    rend[enc].monto += monto;
  }

  const filas = [];
  for (const enc in rend) {
    const filaDestino = hRen.getLastRow() + filas.length + 1;
    filas.push([
      semanaStr,
      enc,
      "Varios", // Espacio general
      rend[enc].turnos,
      rend[enc].monto,
      "", // Monto Real (lo completa el encargado)
      `=E${filaDestino}-F${filaDestino}`, // Diferencia
      "Pendiente"
    ]);
  }

  if (filas.length === 0) {
    SpreadsheetApp.getUi().alert("ℹ️ No hay reservas cobradas en los últimos 7 días para rendir.");
    return;
  }

  hRen.getRange(hRen.getLastRow() + 1, 1, filas.length, 8).setValues(filas);
  SpreadsheetApp.getUi().alert("✅ Rendiciones generadas para " + filas.length + " encargados (semana " + semanaStr + ").");
}

// ============================================================================
// LISTA DE MOROSOS (👥 Socios + 💰 Cuotas → 📋 Morosos)
// ============================================================================
function generarListaMorosos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const hSoc = ss.getSheetByName(HOJAS.SOCIOS);
  const hCuo = ss.getSheetByName(HOJAS.CUOTAS);
  const hMor = ss.getSheetByName(HOJAS.MOROSOS);
  if (!hSoc || !hCuo || !hMor) { ui.alert("❌ Faltan hojas base."); return; }

  // 1. Socios Activos
  const dSoc = hSoc.getDataRange().getValues();
  const hS = dSoc[0];
  const iId = hS.indexOf("ID");
  const iNom = hS.indexOf("Nombre Completo");
  const iTel = hS.indexOf("Teléfono");
  const iEma = hS.indexOf("Email");
  const iCat = hS.indexOf("Categoría");

  const activos = [];
  for (let r = 1; r < dSoc.length; r++) {
    if (dSoc[r][iCat] === "Activo" && dSoc[r][iNom]) {
      activos.push({ id: dSoc[r][iId], nom: dSoc[r][iNom], tel: dSoc[r][iTel]||"", ema: dSoc[r][iEma]||"" });
    }
  }

  // 2. Cuotas pagadas año actual
  const dCuo = hCuo.getDataRange().getValues();
  const hC = dCuo[0];
  const iIdS = hC.indexOf("ID_Socio");
  const iAnio = hC.indexOf("Año");
  const iMes = hC.indexOf("Mes");
  const iEst = hC.indexOf("Estado");

  const anio = new Date().getFullYear();
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const mesAct = new Date().getMonth();
  const esperados = meses.slice(0, mesAct + 1);

  const pagos = {}; // idSocio -> { meses: Set, anual: bool, ultPago: "Mes Año" }
  for (let r = 1; r < dCuo.length; r++) {
    if (dCuo[r][iAnio] == anio && dCuo[r][iEst] === "Pagado") {
      const id = dCuo[r][iIdS];
      const mes = dCuo[r][iMes];
      if (!pagos[id]) pagos[id] = { meses: new Set(), anual: false, ult: "" };
      if (mes === "Anual") pagos[id].anual = true;
      else pagos[id].meses.add(mes);
      // Último pago para info
      const mesIdx = meses.indexOf(mes);
      if (mes !== "Anual" && (pagos[id].ult === "" || (mesIdx !== -1 && mesIdx > meses.indexOf(pagos[id].ult.split(" ")[0])))) {
        pagos[id].ult = mes + " " + anio;
      }
    }
  }

  // 3. Detectar morosos
  const morosos = [];
  for (const s of activos) {
    const p = pagos[s.id] || { meses: new Set(), anual: false, ult: "Nunca" };
    if (p.anual) continue;
    const falt = esperados.filter(m => !p.meses.has(m));
    if (falt.length > 0) {
      morosos.push([s.id, s.nom, s.tel, s.ema, falt.join(", "), falt.length, p.ult]);
    }
  }

  // 4. Escribir hoja Morosos
  hMor.clearContents();
  hMor.getRange("A1:G1").setValues([["ID","Socio","Teléfono","Email","Meses Adeudados","Cantidad","Último Pago"]])
   .setFontWeight("bold").setBackground("#F4CCCC");
  if (morosos.length > 0) {
    hMor.getRange(2, 1, morosos.length, 7).setValues(morosos);
  }
  hMor.setColumnWidths(1, 7, [50, 200, 120, 200, 300, 80, 120]);

  ui.alert("📋 LISTA DE MOROSOS ACTUALIZADA\n\n" +
    "🟢 Socios Activos: " + activos.length + "\n" +
    "🔴 Morosos: " + morosos.length + "\n" +
    "📅 Meses controlados: " + esperados.join(" - ") + "\n\n" +
    "Revisá la hoja 📋 Morosos. Filtrá por 'Cantidad' para priorizar.");
}

// ============================================================================
// DASHBOARD COMPLETO (EJECUTIVO + 3 TABLAS DINÁMICAS)
// ============================================================================
function actualizarDashboardCompleto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  const hSoc = ss.getSheetByName(HOJAS.SOCIOS);
  const hDash = ss.getSheetByName(HOJAS.DASHBOARD);
  if (!hMov || !hDash) { SpreadsheetApp.getUi().alert("❌ Faltan hojas Movimientos o Dashboard."); return; }

  const dat = hMov.getDataRange().getValues();
  if (dat.length <= 1) { hDash.clear(); hDash.getRange(1,1).setValue("Sin datos en Movimientos"); return; }

  const h = dat[0];
  const iFec = h.indexOf("Fecha");
  const iMes = h.indexOf("Mes");
  const iCat = h.indexOf("Categoría");
  const iIng = h.indexOf("Ingreso");
  const iEgr = h.indexOf("Egreso");

  const resMes = {}; // mes -> { ing:0, egr:0, cats:{} }
  const catsIng = new Set(), catsEgr = new Set();
  const ordenMeses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

  for (let r = 1; r < dat.length; r++) {
    const f = dat[r];
    const mes = String(f[iMes] || "").trim().toLowerCase();
    if (!mes) continue;
    if (!resMes[mes]) resMes[mes] = { ing: 0, egr: 0, cats: {} };
    const cat = String(f[iCat] || "").trim();
    const ing = Number(f[iIng]) || 0;
    const egr = Number(f[iEgr]) || 0;
    resMes[mes].ing += ing;
    resMes[mes].egr += egr;
    if (ing > 0) { catsIng.add(cat); resMes[mes].cats[cat] = (resMes[mes].cats[cat] || 0) + ing; }
    if (egr > 0) { catsEgr.add(cat); resMes[mes].cats[cat] = (resMes[mes].cats[cat] || 0) - egr; }
  }

  // Ordenar meses cronológicamente
  const mesesOrden = Object.keys(resMes).sort((a,b) => {
    const [ma, ya] = a.split("-"); const [mb, yb] = b.split("-");
    const ia = ordenMeses.indexOf(ma), ib = ordenMeses.indexOf(mb);
    const ya2 = parseInt("20"+ya), yb2 = parseInt("20"+yb);
    if (ya2 !== yb2) return ya2 - yb2;
    return ia - ib;
  });

  // Resumen mensual (Balance)
  let saldoAcum = 0, totIngG = 0, totEgrG = 0;
  const filasBal = [];
  for (const mes of mesesOrden) {
    const d = resMes[mes];
    const neto = d.ing - d.egr;
    saldoAcum += neto;
    const marg = d.ing !== 0 ? neto / d.ing : 0;
    filasBal.push([mes, d.ing, d.egr, neto, saldoAcum, marg]);
    totIngG += d.ing; totEgrG += d.egr;
  }
  const margTot = totIngG !== 0 ? (totIngG - totEgrG) / totIngG : 0;
  filasBal.push(["TOTAL", totIngG, totEgrG, totIngG - totEgrG, saldoAcum, margTot]);

  // Tablas dinámicas
  const catsIngArr = Array.from(catsIng).sort();
  const catsEgrArr = Array.from(catsEgr).sort();

  const tabIng = [["Fuente de Ingreso", ...mesesOrden, "Total"]];
  for (const cat of catsIngArr) {
    const fila = [cat]; let tot = 0;
    for (const mes of mesesOrden) { const v = Math.max(0, resMes[mes].cats[cat] || 0); fila.push(v); tot += v; }
    fila.push(tot); tabIng.push(fila);
  }
  const totIngFila = ["TOTAL INGRESOS"]; for (const mes of mesesOrden) totIngFila.push(resMes[mes].ing); totIngFila.push(totIngG); tabIng.push(totIngFila);

  const tabEgr = [["Concepto de Egreso", ...mesesOrden, "Total"]];
  for (const cat of catsEgrArr) {
    const fila = [cat]; let tot = 0;
    for (const mes of mesesOrden) { const v = Math.max(0, -(resMes[mes].cats[cat] || 0)); fila.push(v); tot += v; }
    fila.push(tot); tabEgr.push(fila);
  }
  const totEgrFila = ["TOTAL EGRESOS"]; for (const mes of mesesOrden) totEgrFila.push(resMes[mes].egr); totEgrFila.push(totEgrG); tabEgr.push(totEgrFila);

  // KPIs mes actual
  const mesAct = ordenMeses[new Date().getMonth()] + "-" + String(new Date().getFullYear()).slice(-2);
  const dAct = resMes[mesAct] || {ing:0, egr:0, cats:{}};
  const resMesNum = hRes ? hRes.getRange(2, 12, hRes.getLastRow()-1, 1).getValues().filter(r => r[0]==="Cobrado" || r[0]==="Abonado anticipado").length : 0;
  const socAct = hSoc ? hSoc.getRange(2, 7, hSoc.getLastRow()-1, 1).getValues().filter(r => r[0]==="Activo").length : 0;
  let cuoAct = dAct.cats["Cuotas Socios"] > 0 ? dAct.cats["Cuotas Socios"] : 0;

  // ESCRITURA EN HOJA
  hDash.clear();
  const f = hDash.getRange.bind(hDash);
  let row = 1;

  const stTitle = {fontWeight:"bold", fontSize:14, background:"#4285F4", fontColor:"white", horizontalAlignment:"center"};
  const stHead = {fontWeight:"bold", background:"#D9E1F2", horizontalAlignment:"center"};
  const stMoney = {numberFormat:"$#,##0", horizontalAlignment:"right"};
  const stPct = {numberFormat:"0.0%", horizontalAlignment:"center"};
  const stTot = {fontWeight:"bold", background:"#E2EFDA"};

  // Cabecera ejecutiva
  f(row,1,1,6).merge().setValue("DASHBOARD EJECUTIVO - CLUB GUARDIA MITRE").setFontSize(16).setFontWeight("bold").setBackground("#4285F4").setFontColor("white"); row++;
  f(row,1,1,4).setValues([["SALDO ACTUAL","INGRESOS TOTALES","EGRESOS TOTALES","RESULTADO NETO"]]).setFontWeight("bold").setBackground("#D9E1F2"); row++;
  f(row,1,1,4).setValues([[saldoAcum, totIngG, totEgrG, totIngG-totEgrG]]).setNumberFormat("$#,##0").setFontWeight("bold"); f(row,1).setBackground("#E2EFDA"); row += 2;

  f(row,1,1,4).merge().setValue("INDICADORES MES ACTUAL (" + mesAct + ")").setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2"); row++;
  f(row,1,1,4).setValues([["Reservas Cobradas","Recaudado Turnos","Recaudado Cuotas","Socios Activos"]]).setFontWeight("bold").setBackground("#D9E1F2"); row++;
  f(row,1,1,4).setValues([[resMesNum, dAct.ing, cuoAct, socAct]]).setNumberFormat("$#,##0"); row += 2;

  // Tabla 1: Balance
  f(row,1,1,6).merge().setValue("RESUMEN MENSUAL - BALANCE DEL CLUB").setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2"); row++;
  f(row,1,1,6).setValues([["Mes","Total Ingresos","Total Egresos","Resultado Neto","Saldo Final","% Margen"]]).setFontWeight("bold").setBackground("#D9E1F2"); row++;
  f(row,1,filasBal.length,6).setValues(filasBal);
  f(row,2,filasBal.length,4).setNumberFormat("$#,##0"); f(row,6,filasBal.length,1).setNumberFormat("0.0%");
  f(row + filasBal.length - 1, 1, 1, 6).setFontWeight("bold").setBackground("#E2EFDA"); row += filasBal.length + 1;

  // Tabla 2: Ingresos por Fuente
  f(row,1,1,mesesOrden.length+2).merge().setValue("INGRESOS POR FUENTE").setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2"); row++;
  f(row,1,1,mesesOrden.length+2).setValues([tabIng[0]]).setFontWeight("bold").setBackground("#D9E1F2"); row++;
  f(row,1,tabIng.length-1,mesesOrden.length+2).setValues(tabIng.slice(1));
  f(row,2,tabIng.length-1,mesesOrden.length+1).setNumberFormat("$#,##0");
  f(row + tabIng.length - 2, 1, 1, mesesOrden.length+2).setFontWeight("bold").setBackground("#E2EFDA"); row += tabIng.length;

  // Tabla 3: Egresos por Concepto
  f(row,1,1,mesesOrden.length+2).merge().setValue("EGRESOS POR CONCEPTO").setFontWeight("bold").setFontSize(12).setBackground("#D9E1F2"); row++;
  f(row,1,1,mesesOrden.length+2).setValues([tabEgr[0]]).setFontWeight("bold").setBackground("#D9E1F2"); row++;
  f(row,1,tabEgr.length-1,mesesOrden.length+2).setValues(tabEgr.slice(1));
  f(row,2,tabEgr.length-1,mesesOrden.length+1).setNumberFormat("$#,##0");
  f(row + tabEgr.length - 2, 1, 1, mesesOrden.length+2).setFontWeight("bold").setBackground("#E2EFDA");

  hDash.autoResizeColumns(1, Math.max(6, mesesOrden.length+2));
  SpreadsheetApp.getUi().alert("✅ Dashboard actualizado: Balance + Ingresos por Fuente + Egresos por Concepto + KPIs.");
}

// ============================================================================
// LINKS WHATSAPP (para reservas con teléfono)
// ============================================================================
function generarLinksWhatsApp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  if (!hRes) return;

  const dat = hRes.getDataRange().getValues();
  const h = dat[0];
  const iTel = h.indexOf("Teléfono");
  const iEsp = h.indexOf("Espacio");
  const iFec = h.indexOf("Fecha");
  const iHi = h.indexOf("Hora Inicio");
  const iHf = h.indexOf("Hora Fin");
  const iMon = h.indexOf("Monto Final ($)");
  const iDesc = h.indexOf("Descuento ($)");
  const iLink = h.indexOf("Link WhatsApp");

  let count = 0;
  for (let i = 1; i < dat.length; i++) {
    const f = dat[i];
    if (f[iLink]) continue; // Ya tiene link
    const tel = String(f[iTel] || "").replace(/\D/g, "");
    if (!tel || tel.length < 10) continue;

    const espacio = f[iEsp];
    const fec = f[iFec] instanceof Date ? Utilities.formatDate(f[iFec], "GMT-3", "dd/MM/yyyy") : f[iFec];
    const hi = f[iHi]; const hf = f[iHf];
    const monto = Number(f[iMon]) || 0;
    const desc = Number(f[iDesc]) || 0;

    let msg = `Hola! Confirmamos tu reserva en *${espacio}* para el *${fec}* de *${hi} a ${hf}*.\n`;
    msg += `Monto: ${monto.toLocaleString()}`;
    if (desc > 0) msg += ` (incluye descuento de ${desc.toLocaleString()})`;
    msg += `.\nRecordá llegar 10 min antes. ¡Gracias!`;

    const link = "https://wa.me/549" + tel + "?text=" + encodeURIComponent(msg);
    hRes.getRange(i + 1, iLink + 1).setValue(link);
    count++;
  }
  SpreadsheetApp.getUi().alert("✅ " + count + " links de WhatsApp generados en columna 'Link WhatsApp'.");
}

// ============================================================================
// GOOGLE CALENDAR (crear eventos para reservas)
// ============================================================================
function sincronizarConGoogleCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hRes = ss.getSheetByName(HOJAS.RESERVAS);
  if (!hRes) return;

  const cal = CalendarApp.getDefaultCalendar(); // O CalendarApp.getCalendarById("ID_CALENDARIO_COMPARTIDO")
  const dat = hRes.getDataRange().getValues();
  const h = dat[0];
  const iFec = h.indexOf("Fecha");
  const iHi = h.indexOf("Hora Inicio");
  const iHf = h.indexOf("Hora Fin");
  const iEsp = h.indexOf("Espacio");
  const iResp = h.indexOf("Responsable");
  const iTel = h.indexOf("Teléfono");
  const iMon = h.indexOf("Monto Final ($)");
  const iEst = h.indexOf("Estado Pago");
  const iCalId = h.indexOf("ID Calendario");

  let count = 0;
  for (let i = 1; i < dat.length; i++) {
    const f = dat[i];
    if (f[iCalId]) continue; // Ya sincronizado
    if (f[iEst] === "Reserva cancelada") continue;

    const fec = f[iFec];
    if (!(fec instanceof Date) || isNaN(fec)) continue;
    const hi = f[iHi]; const hf = f[iHf];
    const hIni = parseInt(hi.toString().split(':')[0]);
    const hFin = parseInt(hf.toString().split(':')[0]);

    const ini = new Date(fec); ini.setHours(hIni, 0, 0, 0);
    const fin = new Date(fec); fin.setHours(hFin, 0, 0, 0);

    const titulo = `${f[iEsp]} - ${f[iResp]}`;
    const desc = `Responsable: ${f[iResp]}\nTel: ${f[iTel]}\nMonto: ${Number(f[iMon])||0}\nEstado: ${f[iEst]}`;

    try {
      const ev = cal.createEvent(titulo, ini, fin, {description: desc});
      hRes.getRange(i + 1, iCalId + 1).setValue(ev.getId());
      count++;
    } catch (e) {
      Logger.log("Error Calendar fila " + (i+1) + ": " + e.message);
    }
  }
  SpreadsheetApp.getUi().alert("✅ " + count + " eventos creados en Google Calendar.");
}

// ============================================================================
// FIN PARTE 4/5
// ============================================================================
// ============================================================================
// SISTEMA DE GESTIÓN - CLUB GUARDIA MITRE
// Versión LIMPIA, COMPLETA y LISTA PARA INSTALAR (Parte 5/5 - FINAL)
// ============================================================================

// ============================================================================
// CONFIGURAR TRIGGERS AUTOMÁTICOS (Ejecutar 1 vez desde el menú)
// Crea todos los triggers necesarios: formularios + reloj cada hora
// ============================================================================
function configurarTriggersAutomaticos() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Borrar triggers viejos de este proyecto para no duplicar
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

  // 1. Triggers de Formularios (onFormSubmit)
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

  // 2. Triggers de Reloj (Cada hora) - Sincronizaciones automáticas
  ScriptApp.newTrigger("sincronizarReservasAMovimientos").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("sincronizarCuotasAMovimientos").timeBased().everyHours(1).create();

  // 3. Trigger Diario - Dashboard (opcional, a las 6:00 AM)
  ScriptApp.newTrigger("actualizarDashboardCompleto").timeBased().atHour(6).everyDays(1).create();

  // 4. Trigger Diario - Lista Morosos (opcional, a las 7:00 AM)
  ScriptApp.newTrigger("generarListaMorosos").timeBased().atHour(7).everyDays(1).create();

  // 5. Trigger Semanal - Rendiciones (Lunes 8:00 AM)
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
  if (triggers.length === 0) msg += "(ninguno)";
  else {
    triggers.forEach((t, i) => {
      const ev = t.getEventType();
      const src = t.getTriggerSource();
      const freq = t.getTriggerSourceId() ? "" : " | " + (t.getHandlerFunction().includes("sincronizar") ? "Cada hora" :
           t.getHandlerFunction().includes("Dashboard") ? "Diario 6AM" :
           t.getHandlerFunction().includes("Morosos") ? "Diario 7AM" :
           t.getHandlerFunction().includes("Rendiciones") ? "Lunes 8AM" : "");
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

// ============================================================================
// DESHACER ÚLTIMO MOVIMIENTO (Botón de "Pánico")
// Borra la última fila de Movimientos y revierte "Sincronizado" en Cuotas/Reservas
// ============================================================================
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
  const cat = ult[3];      // Categoría
  const desc = ult[5];     // Descripción
  const ing = ult[7];      // Ingreso
  const egr = ult[8];      // Egreso
  const resp = ult[6];     // Responsable

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

  // 1. Borrar fila de Movimientos
  hMov.deleteRow(lr);

  // 2. Intentar revertir Sincronizado en Reservas
  let revertido = false;
  if (cat === "Turnos" && hRes) {
    const dat = hRes.getDataRange().getValues();
    const h = dat[0];
    const iDesc = h.indexOf("Descripción");
    const iSinc = h.indexOf("Sincronizado");
    for (let i = dat.length - 1; i >= 1; i--) {
      if (dat[i][iDesc] && dat[i][iDesc].toString().includes(resp) && dat[i][iSinc] === "Si") {
        hRes.getRange(i + 1, iSinc + 1).setValue("");
        revertido = true; break;
      }
    }
  }

  // 3. Intentar revertir Sincronizado en Cuotas
  if (cat === "Cuotas Socios" && hCuo) {
    const dat = hCuo.getDataRange().getValues();
    const h = dat[0];
    const iNom = h.indexOf("Nombre Socio");
    const iSinc = h.indexOf("Sincronizado");
    for (let i = dat.length - 1; i >= 1; i--) {
      if (dat[i][iNom] === resp && dat[i][iSinc] === "Si") {
        hCuo.getRange(i + 1, iSinc + 1).setValue("");
        revertido = true; break;
      }
    }
  }

  ui.alert("✅ Último movimiento deshecho.\n\n" +
    `Fila ${lr} de Movimientos eliminada.\n` +
    (revertido ? "🔄 Sincronización revertida en hoja origen." : "⚠️ No se encontró origen para revertir (revisar manual).") +
    "\n\nRecordá: Si el movimiento venía de Carga Rápida, solo se borra de Movimientos."
  );
}

// ============================================================================
// UTILIDADES DE MANTENIMIENTO
// ============================================================================

// Recalcular todos los saldos acumulados en Movimientos (si se editó/borró algo manual)
function recalcularSaldosMovimientos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);
  if (!hMov) return;

  const dat = hMov.getDataRange().getValues();
  if (dat.length <= 1) return;

  const h = dat[0];
  const iIng = h.indexOf("Ingreso");
  const iEgr = h.indexOf("Egreso");
  const iSal = h.indexOf("Saldo Acumulado");

  let saldo = 0;
  const nuevos = [];
  for (let r = 1; r < dat.length; r++) {
    saldo += (Number(dat[r][iIng]) || 0) - (Number(dat[r][iEgr]) || 0);
    nuevos.push([saldo]);
  }

  if (nuevos.length > 0) {
    hMov.getRange(2, iSal + 1, nuevos.length, 1).setValues(nuevos);
  }
  SpreadsheetApp.getUi().alert("✅ Saldos acumulados recalculados en " + nuevos.length + " filas.");
}

// Migrar datos históricos (ejemplo: socios 2026, cuotas 2026, saldo inicial)
// Adaptar según tus datos reales
function migrarDatosHistoricos() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    "⚠️ MIGRACIÓN DE DATOS HISTÓRICOS\n\n" +
    "Esta función es un EJEMPLO. Debés adaptar los arrays internos\n" +
    "con tus datos reales antes de ejecutar.\n\n" +
    "¿Querés continuar con el ejemplo (crea 3 socios de prueba)?",
    ui.ButtonSet.YES_NO
  );
  if (resp !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hSoc = ss.getSheetByName(HOJAS.SOCIOS);
  const hCuo = ss.getSheetByName(HOJAS.CUOTAS);
  const hMov = ss.getSheetByName(HOJAS.MOVIMIENTOS);

  // Ejemplo: 3 socios de prueba
  const socios = [
    [1, "Pérez, Juan", "12345678", "1122334455", "juan@mail.com", "2026", "Activo", "Migración inicial"],
    [2, "Gómez, María", "23456789", "1133445566", "maria@mail.com", "2026", "Activo", "Migración inicial"],
    [3, "López, Carlos", "34567890", "1144556677", "carlos@mail.com", "2026", "Vitalicio", "Socio vitalicio"]
  ];
  socios.forEach(s => hSoc.appendRow(s));

  // Ejemplo: Cuotas 2026 pagadas
  const cuotas = [
    [1, 1, "Pérez, Juan", 2026, "Anual", 34000, new Date("2026-01-15"), "Transferencia", "Pagado", "Si"],
    [2, 2, "Gómez, María", 2026, "Enero", 4500, new Date("2026-01-10"), "Efectivo", "Pagado", "Si"],
    [3, 2, "Gómez, María", 2026, "Febrero", 4500, new Date("2026-02-10"), "Efectivo", "Pagado", "Si"]
  ];
  cuotas.forEach(c => hCuo.appendRow(c));

  // Ejemplo: Saldo inicial en Movimientos
  const saldoIni = 17000000; // Deuda inicial (egreso)
  hMov.appendRow([1, new Date("2026-01-31"), "ene-26", "Saldo Inicial", "Saldo", "Saldo inicial Enero 2026", "Sistema", 0, saldoIni, -saldoIni]);

  // Sincronizar cuotas de ejemplo a movimientos
  sincronizarCuotasAMovimientos();

  ui.alert("✅ Datos de ejemplo migrados.\n\n" +
    "👥 3 socios creados\n" +
    "💰 3 cuotas cargadas\n" +
    "💵 Saldo inicial -$17.000 en Movimientos\n" +
    "🔄 Cuotas sincronizadas a Movimientos\n\n" +
    "Ahora probá: Menú 🏆 Club GM → 📊 Actualizar Dashboard Completo");
}

// ============================================================================
// FUNCIONES AUXILIARES PARA MENÚ (wrappers simples)
// ============================================================================
function abrirPanelControl() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJAS.PANEL_CONTROL).activate();
}

// ============================================================================
// FIN DEL SISTEMA COMPLETO - CLUB GUARDIA MITRE
// ============================================================================
//
// RESUMEN DE INSTALACIÓN:
// 1. Pegar Partes 1 a 5 en orden en el editor de Apps Script (Ctrl+S cada una)
// 2. Ejecutar: instalarSistemaCompleto()
// 3. Ejecutar: crearFormularios()  (desde el menú 🏆 Club GM)
// 4. En cada hoja de respuestas de formulario, agregar columna "Estado Proceso" al final
// 5. Ejecutar: configurarTriggersAutomaticos()  (desde el menú 🏆 Club GM)
// 6. Probar flujo completo:
//    - Formulario Socio → aparece en 👥 Socios
//    - Formulario Reserva → aparece en 📅 Reservas (con descuento si socio al día)
//    - Cambiar reserva a "Cobrado" → Menú → 📊 Sincronizar Reservas → aparece en 💵 Movimientos
//    - Formulario Cuota → aparece en 💰 Cuotas → Menú → 💰 Sincronizar Cuotas → aparece en 💵 Movimientos
//    - Menú → 📋 Ver Lista de Morosos → aparece en 📋 Morosos
//    - Menú → 🧾 Generar Rendiciones Semanales → aparece en 🧾 Rendiciones
//    - Menú → 📊 Actualizar Dashboard Completo → Dashboard lleno con 3 tablas
//    - Menú → 📱 Generar Links WhatsApp → links en columna Link WhatsApp
//    - Menú → 📅 Sincronizar con Google Calendar → eventos en Calendar
//
// COMANDOS ÚTILES ADICIONALES (ejecutar desde editor si hace falta):
// - recalcularSaldosMovimientos()  // si editaste Movimientos a mano
// - verTriggersActuales()          // para auditar triggers
// - borrarTodosLosTriggers()       // limpieza total
// - deshacerUltimoMovimiento()     // botón de pánico (también en menú si querés agregarlo)
// - migrarDatosHistoricos()        // solo para testing inicial
//
// ¡SISTEMA LISTO PARA PRODUCCIÓN! 🚀
// ============================================================================