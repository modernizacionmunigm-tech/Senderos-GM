/**
@license
SPDX-License-Identifier: Apache-2.0
*/

import { Trail, TimeRecord } from './types';

/// Near Guardia Mitre town center coordinates, Río Negro, Argentina
export const GUARDIA_MITRE_CENTER: [number, number] = [-40.4220, -63.6680];

// Los datos de cada sendero salen de los KMZ relevados con GPS (carpeta `datos/`).
// Distancias: calculadas sobre los vértices del trazado (haversine).
// Desniveles: estimados con modelos digitales de elevación (Copernicus GLO-90 y
// SRTM 30 m) ignorando fluctuaciones menores a 3 m. Son valores de referencia.
export const TRAILS: Trail[] = [
  {
    id: 'monte-mitre-baja',
    name: 'Monte Mitre - Dificultad Baja',
    distance: 2.38,
    elevationGain: 15,
    duration: '18min',
    difficulty: 'baja',
    description: 'Recorrido ideal para principiantes, familias o un paseo rápido. Atraviesa zonas de monte bajo con senderos claros.',
    longDescription: 'El Sendero "Monte Mitre - Dificultad Baja" propone un recorrido familiar seguro, interactivo y totalmente accesible. Diseñado para realizar caminatas de acondicionamiento físico, recreación y observación botánica. El trazado fue relevado con GPS y pasa por la entrada del sendero, dos cañadones, la salida a la calle y el cementerio municipal antes de volver al punto de partida.',
    color: '#10b981', // emerald-600 (verde)
    startPoint: [-40.42588, -63.66577],
    coordinates: [
      // Trazado real relevado con GPS (KMZ "Sendero Baja real") - circuito cerrado
      [-40.42588, -63.66577], [-40.4256, -63.66553], [-40.42456, -63.66538], [-40.42434, -63.66522], [-40.42417, -63.66501],
      [-40.42397, -63.66453], [-40.42398, -63.66462], [-40.42373, -63.66451], [-40.42365, -63.66476], [-40.42289, -63.66506],
      [-40.42267, -63.66546], [-40.42242, -63.66553], [-40.42211, -63.66575], [-40.42209, -63.6659], [-40.42171, -63.66602],
      [-40.42138, -63.66633], [-40.42136, -63.66645], [-40.42133, -63.66643], [-40.42106, -63.66675], [-40.42085, -63.6669],
      [-40.42076, -63.66713], [-40.42054, -63.66744], [-40.42041, -63.66789], [-40.42022, -63.66771], [-40.4197, -63.66697],
      [-40.41956, -63.66644], [-40.41959, -63.66591], [-40.41952, -63.6656], [-40.41842, -63.66368], [-40.4185, -63.66343],
      [-40.41876, -63.6632], [-40.41914, -63.66249], [-40.41961, -63.66236], [-40.41997, -63.66176], [-40.4205, -63.66132],
      [-40.42204, -63.66154], [-40.42216, -63.66153], [-40.42246, -63.66132], [-40.42267, -63.66141], [-40.42286, -63.66138],
      [-40.42359, -63.66256], [-40.42384, -63.66317], [-40.42386, -63.66333], [-40.42378, -63.66388], [-40.42394, -63.66447],
      [-40.42415, -63.66499], [-40.42437, -63.66523], [-40.42457, -63.66536], [-40.42544, -63.6655], [-40.42571, -63.6656],
      [-40.42582, -63.66568], [-40.42583, -63.66574], [-40.42582, -63.6657]
    ],
    pointsOfInterest: [
      {
        name: 'Inicio / Meta del Sendero',
        lat: -40.42588,
        lng: -63.66577,
        description: 'Punto de partida y cierre del circuito. El KMZ marca el "Fin sendero baja intensidad" a 9 m de aquí. Distancia: 0 km',
        type: 'inicio',
      },
      {
        name: 'La puerta del monte',
        lat: -40.42398,
        lng: -63.66461,
        description: 'Acceso al circuito de baja dificultad, a la derecha del camino de ingreso. Distancia: 0.26 km',
        type: 'qr',
      },
      {
        name: 'El primer cañadón',
        lat: -40.42215,
        lng: -63.66568,
        description: 'Primer cañadón: hondonada de arena y arcilla entre lomas. Distancia: 0.51 km',
        type: 'qr',
      },
      {
        name: 'El cañadón largo',
        lat: -40.42095,
        lng: -63.66674,
        description: 'Segundo cañadón del recorrido, entre monte bajo y arena. Distancia: 0.67 km',
        type: 'qr',
      },
      {
        name: 'La salida a la calle',
        lat: -40.42034,
        lng: -63.66787,
        description: 'El sendero sale a la calle y continúa por el borde del sector. Distancia: 0.79 km',
        type: 'qr',
      },
      {
        name: 'La vuelta del monte',
        lat: -40.41845,
        lng: -63.66365,
        description: 'Reingreso al sendero para iniciar el tramo de regreso. Distancia: 1.23 km',
        type: 'qr',
      },
      {
        name: 'La bajada al cementerio',
        lat: -40.42296,
        lng: -63.6614,
        description: 'Salida del tramo de monte hacia el sector del cementerio. Distancia: 1.82 km',
        type: 'qr',
      },
      {
        name: 'El cementerio viejo',
        lat: -40.42362,
        lng: -63.66271,
        description: 'Paso junto al cementerio municipal, referencia histórica del sector. Distancia: 1.94 km',
        type: 'historico',
      },
      {
        name: 'La última curva',
        lat: -40.4244,
        lng: -63.66526,
        description: 'Bifurcación final a la derecha para volver al punto de partida. Distancia: 2.20 km',
        type: 'qr',
      },
    ],
  },
  {
    id: 'monte-mitre-alta',
    name: 'Monte Mitre - Dificultad Alta',
    distance: 2.68,
    elevationGain: 39,
    duration: '19min',
    difficulty: 'alta',
    description: 'Recorrido exigente con terrains variados y pendientes. Ideal para quienes buscan un desafío físico en contacto con la naturaleza.',
    longDescription: 'El Sendero "Monte Mitre - Dificultad Alta" rodea las lomas y cañadones más escarpados del relieve local. Con subidas pronunciadas y descensos en suelo arenoso y arcilloso, es idóneo para entrenar trail running o realizar caminatas intensas en primavera, otoño e invierno.',
    color: '#ef4444', // red-600 (rojo)
    startPoint: [-40.4242735, -63.6655205],
    coordinates: [
      // Coordenadas REALES del CSV - NO es circuito cerrado
      [-40.4242735, -63.6655205], // Inicio
      [-40.4239958, -63.6657726], [-40.4238406, -63.6656761], [-40.4236773, -63.6653113], [-40.4235711, -63.6649251], [-40.4235139, -63.6648178],
      [-40.4232362, -63.6650109], [-40.4228197, -63.6652147], [-40.4226727, -63.6654722], [-40.4224358, -63.6656654], [-40.4221418, -63.6657619],
      [-40.4221173, -63.6659765], [-40.4217824, -63.6663949], [-40.4215374, -63.6662554], [-40.4211780, -63.6666309], [-40.4208676, -63.6670065],
      [-40.4205245, -63.6673820], [-40.4203612, -63.6679184], [-40.4202264, -63.6680901], [-40.4200365, -63.6681437], [-40.4199589, -63.6683395],
      [-40.4197976, -63.6684334], [-40.4196955, -63.6685300], [-40.4195423, -63.6686721], [-40.4194668, -63.6687070], [-40.4193014, -63.6688786],
      [-40.4191115, -63.6690235], [-40.4189073, -63.6691174], [-40.4187929, -63.6691630], [-40.4186316, -63.6692220], [-40.4184968, -63.6693614],
      [-40.4183478, -63.6694473], [-40.4181599, -63.6696109], [-40.4180864, -63.6697799], [-40.4182477, -63.6702466], [-40.4182804, -63.6703565],
      [-40.4182191, -63.6707160], [-40.4182722, -63.6709949], [-40.4184825, -63.6709922], [-40.4185132, -63.6713141], [-40.4182906, -63.6714992],
      [-40.4181864, -63.6716064], [-40.4182742, -63.6725479], [-40.4185397, -63.6726766], [-40.4188440, -63.6730119], [-40.4190441, -63.6733365],
      [-40.4193606, -63.6734464], [-40.4194770, -63.6732587], [-40.4196587, -63.6730495], [-40.4199528, -63.6731004], [-40.4201652, -63.6731997],
      [-40.4202428, -63.6731997], [-40.4203265, -63.6730146], [-40.4203408, -63.6728966], [-40.4205858, -63.6728000], [-40.4211770, -63.6729288],
      [-40.4211662, -63.6726767], [-40.4210575, -63.6723816], [-40.4209085, -63.6721885], [-40.4207043, -63.6720651], [-40.4205327, -63.6720383],
      [-40.4204984, -63.6717763], [-40.4206148, -63.6716046], [-40.4208108, -63.6714651], [-40.4209538, -63.6713364], [-40.4210109, -63.6710521],
      [-40.4209374, -63.6708643], [-40.4208598, -63.6705961], [-40.4207986, -63.6703171], [-40.4207822, -63.6701187], [-40.4208578, -63.6698988],
      [-40.4210518, -63.6698799], [-40.4211478, -63.6696948], [-40.4213091, -63.6696814], [-40.4214357, -63.6697056], [-40.4215418, -63.6696573],
      [-40.4216664, -63.6694857], [-40.4219849, -63.6695152], [-40.4221810, -63.6694481], [-40.4223198, -63.6695259], [-40.4224280, -63.6697136],
      [-40.4224873, -63.6697995], [-40.4225914, -63.6697727], [-40.4227180, -63.6696573], [-40.4228180, -63.6695071], [-40.4229181, -63.6692684],
      [-40.4229487, -63.6691504], [-40.4230222, -63.6689787], [-40.4230815, -63.6687883], [-40.4232203, -63.6685898], [-40.4233796, -63.6683833],
      [-40.4235307, -63.6683243], [-40.4236164, -63.6683350], [-40.4237328, -63.6685496], [-40.4238696, -63.6687159], [-40.4239881, -63.6688124],
      [-40.4239860, -63.6686247], [-40.4240371, -63.6683940], [-40.4241004, -63.6682358], [-40.4241494, -63.6681338], [-40.4242984, -63.6681231],
      [-40.4244107, -63.6680560], [-40.4244659, -63.6677986], [-40.4243515, -63.6669402], [-40.4242800, -63.6664628], [-40.4243699, -63.6658271],
      [-40.4243372, -63.6656179]  // Fin (punto separado del inicio)
    ],
    pointsOfInterest: [
      {
        name: 'Inicio del Sendero',
        lat: -40.4242735,
        lng: -63.6655205,
        description: 'Punto de partida del recorrido. Distancia: 0m',
        type: 'inicio',
      },
      {
        name: 'La subida al cielo',
        lat: -40.4220775,
        lng: -63.6660302,
        description: 'Pendiente inicial exigente con vistas panorámicas que pone a prueba tus piernas. Distancia: 0.34 km',
        type: 'qr',
      },
      {
        name: 'El desierto desesperante',
        lat: -40.4195423,
        lng: -63.6686721,
        description: 'Traza plana de arena blanca rodeada de jarilla y monte virgen. Distancia: 0.73 km',
        type: 'qr',
      },
      {
        name: 'El cañón de la tortura',
        lat: -40.4184805,
        lng: -63.6712497,
        description: 'Paso estrecho esculpido por las lluvias entre lomas arenosas escarpadas. Distancia: 1.07 km',
        type: 'qr',
      },
      {
        name: 'No te preocupes no es tan difícil',
        lat: -40.4195587,
        lng: -63.6731092,
        description: 'Zona de recuperación parcial con excelente vista. Distancia: 1.39 km',
        type: 'qr',
      },
      {
        name: 'El salto al vacío',
        lat: -40.4212086,
        lng: -63.6728564,
        description: 'Descenso vertical rápido con terreno técnico y suelto. Distancia: 1.59 km',
        type: 'qr',
      },
      {
        name: 'La quebrada oscura',
        lat: -40.4217543,
        lng: -63.669491,
        description: 'Sombra reparadora natural producida por la vegetación autóctona de gran porte. Distancia: 2.03 km',
        type: 'qr',
      },
      {
        name: 'El empuje final',
        lat: -40.423986,
        lng: -63.6686247,
        description: 'Tramo final de retorno y aceleración con vistas maravillosas. Distancia: 2.39 km',
        type: 'qr',
      },
      {
        name: 'Meta - Fin del Recorrido',
        lat: -40.4243372,
        lng: -63.6656179,
        description: '¡Felicitaciones! Completaste el sendero de alta dificultad. Distancia total: 2.68 km',
        type: 'fin',
      }
    ],
  },
  {
    id: 'monte-mitre-media',
    name: 'Monte Mitre - Dificultad Media',
    distance: 2.64,
    elevationGain: 36,
    duration: '19min',
    difficulty: 'media',
    description: 'Circuito intermedio por lomas y cañadones cercanos al pueblo. Un paso más exigente que el sendero de baja, ideal para empezar a correr en el monte.',
    longDescription: 'El Sendero "Monte Mitre - Dificultad Media" recorre el sector sureste del Monte Mitre con subidas y bajadas sobre suelo arenoso. Es el paso intermedio entre el circuito de baja dificultad y el exigente recorrido de alta: tiene una distancia similar al sendero alto pero con menos desnivel, y comparte el punto de partida con los otros dos senderos. El trazado fue relevado con GPS (KMZ "Sendero Alta real").',
    color: '#f59e0b', // amber-500 (ámbar)
    startPoint: [-40.42572, -63.66564],
    coordinates: [
      // Trazado real relevado con GPS (KMZ "Sendero Alta real") - circuito cerrado
      [-40.42572, -63.66564], [-40.42542, -63.66548], [-40.42485, -63.66545], [-40.42446, -63.66536], [-40.42433, -63.66554],
      [-40.42423, -63.66549], [-40.42432, -63.6655], [-40.42439, -63.6657], [-40.42426, -63.66659], [-40.42437, -63.66706],
      [-40.42432, -63.66725], [-40.42443, -63.66727], [-40.42452, -63.66756], [-40.42444, -63.66803], [-40.42438, -63.66815],
      [-40.42415, -63.6681], [-40.42408, -63.66818], [-40.42394, -63.66865], [-40.42394, -63.66879], [-40.42415, -63.6689],
      [-40.42435, -63.6692], [-40.42434, -63.66928], [-40.42425, -63.66934], [-40.42389, -63.66926], [-40.42364, -63.6691],
      [-40.42337, -63.66905], [-40.42176, -63.66808], [-40.42132, -63.66792], [-40.42106, -63.66759], [-40.42027, -63.66718],
      [-40.41987, -63.66638], [-40.41963, -63.66643], [-40.41957, -63.66651], [-40.41957, -63.66665], [-40.41972, -63.66707],
      [-40.42044, -63.668], [-40.42085, -63.66863], [-40.4213, -63.66899], [-40.42148, -63.66921], [-40.4216, -63.66946],
      [-40.42229, -63.66944], [-40.42252, -63.66979], [-40.4228, -63.66956], [-40.42308, -63.66872], [-40.42328, -63.66842],
      [-40.42336, -63.66838], [-40.423, -63.66787], [-40.42279, -63.66736], [-40.42267, -63.66722], [-40.42251, -63.66685],
      [-40.42247, -63.66652], [-40.42218, -63.66598], [-40.42218, -63.66587], [-40.42207, -63.66573], [-40.4224, -63.66558],
      [-40.42254, -63.66545], [-40.42268, -63.66542], [-40.42316, -63.66463], [-40.42336, -63.6645], [-40.42352, -63.66454],
      [-40.4236, -63.66521], [-40.42377, -63.66546], [-40.4238, -63.66569], [-40.4239, -63.66577], [-40.42404, -63.66571],
      [-40.42452, -63.66528], [-40.42469, -63.66542], [-40.42557, -63.66553], [-40.42573, -63.66565]
    ],
    pointsOfInterest: [
      {
        name: 'Inicio / Meta del Sendero',
        lat: -40.42572,
        lng: -63.66564,
        description: 'Punto de partida y cierre del circuito. Distancia: 0 km',
        type: 'inicio',
      },
      {
        name: 'El primer repecho',
        lat: -40.42426,
        lng: -63.66659,
        description: 'Arranque en subida sobre arena suelta, entre jarilla y monte bajo. Distancia: 280 m',
        type: 'qr',
      },
      {
        name: 'El arenal largo',
        lat: -40.42027,
        lng: -63.66718,
        description: 'Recta larga de arena blanca, con el sol pegando de lleno y poco reparo. Distancia: 1.08 km',
        type: 'qr',
      },
      {
        name: 'La vuelta del viento',
        lat: -40.41957,
        lng: -63.66651,
        description: 'Extremo norte del circuito, donde el viento pega fuerte y el camino gira cerrado. Distancia: 1.20 km',
        type: 'qr',
      },
      {
        name: 'El bajo del zorro',
        lat: -40.42085,
        lng: -63.66863,
        description: 'Descenso hacia el oeste por un bajo arenoso, con buena vista del monte. Distancia: 1.44 km',
        type: 'qr',
      },
      {
        name: 'La sombra del chañar',
        lat: -40.42308,
        lng: -63.66872,
        description: 'Trecho de sombra que dan los chañares y la vegetación de gran porte. Distancia: 1.78 km',
        type: 'qr',
      },
      {
        name: 'El filo del este',
        lat: -40.42316,
        lng: -63.66463,
        description: 'Filo arenoso en el extremo este, con bajada rápida y terreno suelto. Distancia: 2.25 km',
        type: 'qr',
      },
      {
        name: 'La recta de casa',
        lat: -40.42404,
        lng: -63.66571,
        description: 'Últimos metros de retorno al punto de partida. Distancia: 2.43 km',
        type: 'qr',
      },
    ],
  },
];

export const INITIAL_RANKINGS: TimeRecord[] = [
  { id: 'r1', name: 'Martín Altieri', category: 'Adulto', time: '00:11:42', trailName: 'Monte Mitre - Dificultad Baja', date: '22/05/2026' },
  { id: 'r2', name: 'Florencia Benítez', category: 'Adulto', time: '00:13:15', trailName: 'Monte Mitre - Dificultad Baja', date: '18/05/2026' },
  { id: 'r3', name: 'Carlos Larrañaga', category: 'Master A', time: '00:12:58', trailName: 'Monte Mitre - Dificultad Baja', date: '21/05/2026' },
  { id: 'r4', name: 'María Luz Otero', category: 'Junior', time: '00:14:30', trailName: 'Monte Mitre - Dificultad Baja', date: '25/05/2026' },
  
  { id: 'r5', name: 'Sebastián Corradi', category: 'Master A', time: '00:18:10', trailName: 'Monte Mitre - Dificultad Alta', date: '24/05/2026' },
  { id: 'r6', name: 'Lorena Agrelo', category: 'Adulto', time: '00:19:45', trailName: 'Monte Mitre - Dificultad Alta', date: '26/05/2026' },
  { id: 'r7', name: 'Hernán De Rosa', category: 'Master B', time: '00:21:12', trailName: 'Monte Mitre - Dificultad Alta', date: '19/05/2026' },
  
  { id: 'r8', name: 'Julieta Giménez', category: 'Adulto', time: '00:15:18', trailName: 'Monte Mitre - Dificultad Baja', date: '27/05/2026' },
  { id: 'r9', name: 'Gastón Pozzo', category: 'Master A', time: '00:20:44', trailName: 'Monte Mitre - Dificultad Alta', date: '23/05/2026' },
  { id: 'r10', name: 'Tomas Belleti', category: 'Junior', time: '00:16:05', trailName: 'Monte Mitre - Dificultad Baja', date: '20/05/2026' },
];

export const CATEGORIES = ['Junior (Menores de 18)', 'Adulto (18 - 39)', 'Master A (40 - 52)', 'Master B (53+)'];

/**
 * Google Form integration details for real POST submit.
 */
export const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSfzRfc2f-i8xmBMGfVbhDz4Nnxlt5hOfpK3Y4p3AE8D_iw0Pw',
  entries: {
    nombre: 'entry.969350065',
    sendero: 'entry.49559792',
    tiempo: 'entry.236869142',
    fechaYear: 'entry.341045598_year',
    fechaMonth: 'entry.341045598_month',
    fechaDay: 'entry.341045598_day',
    horaHour: 'entry.1889950637_hour',
    horaMinute: 'entry.1889950637_minute',
    clima: 'entry.1090869712',
    comentarios: 'entry.1586715887',
    terminos: 'entry.871715811',
  }
};

// Default Google Sheets published CSV URL if any
export const DEFAULT_GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQwrJ2oWFuHV3HvqmX304q75q_T_7babaMlA6Crgfazai0awP9tP1WDUj9DAT0ukOq1U6bzxwAN6qXA/pub?output=csv';