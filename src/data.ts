/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trail, TimeRecord } from './types';

/// Near Guardia Mitre town center coordinates, Río Negro, Argentina
export const GUARDIA_MITRE_CENTER: [number, number] = [-40.4220, -63.6680];
export const TRAILS: Trail[] = [
  {
    id: 'monte-mitre-baja',
    name: 'Monte Mitre - Dificultad Baja',
    distance: 1.58,
    elevationGain: 40,
    duration: '12min',
    difficulty: 'baja',
    description: 'Recorrido ideal para principiantes, familias o un paseo rápido. Atraviesa zonas de monte bajo con senderos claros.',
    longDescription: 'El Sendero “Monte Mitre - Dificultad Baja” propone un recorrido familiar seguro, interactivo y totalmente accesible. Diseñado para realizar caminatas de acondicionamiento físico, recreación y observación botánica. Ideal para recorrer con niños y adultos mayores bajo cualquier condición climática templada.',
    color: '#10b981', // green for baja difficulty
    startPoint: [-40.42427, -63.66550],
    coordinates: [
      [-40.42427, -63.66550], // Inicio Sendero
      [-40.42350, -63.66630],
      [-40.42280, -63.66700],
      [-40.42210, -63.66780], // Punto de Retorno
      [-40.42290, -63.66850],
      [-40.42380, -63.66750],
      [-40.42427, -63.66550]  // Cierre
    ],
    pointsOfInterest: [
      {
        name: 'Inicio Sendero',
        lat: -40.42427,
        lng: -63.66550,
        description: 'Punto de partida del recorrido de baja dificultad con panel informativo del proyecto.',
        type: 'inicio',
      },
      {
        name: 'Punto de Retorno',
        lat: -40.42210,
        lng: -63.66780,
        description: 'Vértice norte del circuito familiar, ideal para hidratación y retorno.',
        type: 'fin',
      }
    ],
  },
  {
    id: 'monte-mitre-alta',
    name: 'Monte Mitre - Dificultad Alta',
    distance: 2.59,
    elevationGain: 65,
    duration: '19min',
    difficulty: 'alta',
    description: 'Recorrido exigente con terrains variados y pendientes. Ideal para quienes buscan un desafío físico en contacto con la naturaleza.',
    longDescription: 'El Sendero “Monte Mitre - Dificultad Alta” rodea los médanos y cañadones más escarpados del relieve local. Con subidas pronunciadas y descensos en suelo arenoso y arcilloso, es idóneo para entrenar trail running o realizar caminatas intensas en primavera, otoño e invierno.',
    color: '#ef4444', // red for alta difficulty
    startPoint: [-40.42427, -63.66550],
    coordinates: [
      [-40.4242735,-63.6655044],[-40.4239958,-63.6657726],[-40.4238406,-63.6656761],[-40.4236773,-63.6653113],[-40.4235711,-63.6649251],[-40.4235139,-63.6648178],[-40.4232362,-63.6650109],[-40.4228197,-63.6652147],[-40.4226727,-63.6654722],[-40.4224358,-63.6656654],[-40.4221418,-63.6657619],[-40.4221173,-63.6659765],[-40.4217824,-63.6663949],[-40.4215374,-63.6662554],[-40.421178,-63.6666309],[-40.4208676,-63.6670065],[-40.4205245,-63.667382],[-40.4203612,-63.6679184],[-40.4202264,-63.6680901],[-40.4200365,-63.6681437],[-40.4199589,-63.6683395],[-40.4197976,-63.6684334],[-40.4196955,-63.66853],[-40.4195423,-63.6686721],[-40.4194668,-63.668707],[-40.4193014,-63.6688786],[-40.4191115,-63.6690235],[-40.4189073,-63.6691174],[-40.4187929,-63.669163],[-40.4186316,-63.669222],[-40.4184968,-63.6693614],[-40.4183478,-63.6694473],[-40.4181599,-63.6696109],[-40.4180864,-63.6697799],[-40.4182477,-63.6702466],[-40.4182804,-63.6703565],[-40.4182191,-63.670716],[-40.4182722,-63.6709949],[-40.4184825,-63.6709922],[-40.4185132,-63.6713141],[-40.4182906,-63.6714992],[-40.4181864,-63.6716064],[-40.4182742,-63.6725479],[-40.4185397,-63.6726766],[-40.418844,-63.6730119],[-40.4190441,-63.6733365],[-40.4193606,-63.6734464],[-40.419477,-63.6732587],[-40.4196587,-63.6730495],[-40.4199528,-63.6731004],[-40.4201652,-63.6731997],[-40.4202428,-63.6731997],[-40.4203265,-63.6730146],[-40.4203408,-63.6728966],[-40.4205858,-63.6728],[-40.4206624,-63.6727786],[-40.4206981,-63.6726391],[-40.4206471,-63.6725104],[-40.4204715,-63.6723119],[-40.4203612,-63.672049],[-40.420366,-63.6718939],[-40.4204984,-63.6717763],[-40.4206148,-63.6716046],[-40.4208108,-63.6714651],[-40.4209538,-63.6713364],[-40.4210109,-63.6710521],[-40.4209374,-63.6708643],[-40.4208598,-63.6705961],[-40.4207986,-63.6703171],[-40.4207822,-63.6701187],[-40.4208741,-63.6699846],[-40.4210518,-63.6698799],[-40.4213091,-63.6697458],[-40.4214357,-63.6697056],[-40.4215418,-63.6696573],[-40.4216664,-63.6694857],[-40.4219849,-63.6695152],[-40.422181,-63.6694481],[-40.4223198,-63.6695259],[-40.422428,-63.6697136],[-40.4224873,-63.6697995],[-40.4225914,-63.6697727],[-40.422718,-63.6696573],[-40.422818,-63.6695071],[-40.4229181,-63.6692684],[-40.4229487,-63.6691504],[-40.4230222,-63.6689787],[-40.4230815,-63.6687883],[-40.4232203,-63.6685898],[-40.4233796,-63.6683833],[-40.4235307,-63.6683243],[-40.4236164,-63.668335],[-40.4237328,-63.6685496],[-40.4238696,-63.6687159],[-40.4239881,-63.6688124],[-40.423986,-63.6686247],[-40.4240371,-63.668394],[-40.4241004,-63.6682358],[-40.4241494,-63.6681338],[-40.4242984,-63.6681231],[-40.4244107,-63.668056],[-40.4244659,-63.6677986],[-40.4243515,-63.6669402],[-40.42428,-63.6664628],[-40.4243699,-63.6658271],[-40.4243372,-63.6656179],[-40.4243025,-63.665516]
    ],
    pointsOfInterest: [
      {
        name: 'Estacionamiento Principal',
        lat: -40.42427,
        lng: -63.66550,
        description: 'Punto de partida del recorrido con zona de estacionamiento y paneles informativos.',
        type: 'inicio',
      },
      {
        name: 'La subida al cielo',
        lat: -40.42087,
        lng: -63.66701,
        description: 'Pendiente inicial exigente con vistas panorámicas que pone a prueba tus piernas.',
        type: 'qr',
      },
      {
        name: 'El desierto desesperante',
        lat: -40.41828,
        lng: -63.67036,
        description: 'Traza plana de arena blanca rodeada de jarilla y monte virgen.',
        type: 'qr',
      },
      {
        name: 'Mirador del Río',
        lat: -40.42080,
        lng: -63.66980,
        description: 'Excelente vista panorámica del río Negro, el monte y el valle protegido.',
        type: 'mirador',
      },
      {
        name: 'El cañón de la tortura',
        lat: -40.42066,
        lng: -63.67278,
        description: 'Paso estrecho esculpido por las lluvias entre dunas arenosas escarpadas.',
        type: 'qr',
      },
      {
        name: 'La quebrada oscura',
        lat: -40.42167,
        lng: -63.66949,
        description: 'Sombra reparadora natural producida por la vegetación autóctona de gran porte.',
        type: 'qr',
      },
      {
        name: 'El salto al vacío',
        lat: -40.42338,
        lng: -63.66838,
        description: 'Descenso vertical rápido con terreno técnico y suelto.',
        type: 'qr',
      },
      {
        name: 'El empuje final',
        lat: -40.42437,
        lng: -63.66583,
        description: 'Tramo final de retorno y aceleración con vistas maravillosas a las bardas y el pueblo.',
        type: 'fin',
      }
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
 * To pre-fill a Google Form dynamically or POST directly, here are the default entry hooks.
 * The user can easily change the FORM_ID and ENTRY ids.
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

// Default Google Sheets published CSV URL if any (user can configure via GUI or edit here)
export const DEFAULT_GOOGLE_SHEET_CSV_URL = '';
