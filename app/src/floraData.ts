/**
@license
SPDX-License-Identifier: Apache-2.0
*/

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  category: 'arboles' | 'aves' | 'insectos' | 'hongos';
  categoryLabel: string;
  description: string;
  season: string;
  curiosity: string;
  image: string;
  imageCredit?: string;
}

export const SPECIES_LIST: Species[] = [
  {
    id: 'jarilla',
    commonName: 'Jarilla Hembra',
    scientificName: 'Larrea divaricata',
    category: 'arboles',
    categoryLabel: 'Arbusto Nativo',
    description: 'Arbusto emblemático de la estepa patagónica y el monte argentino. Posee pequeñas flores amarillas de cinco pétalos y hojas resinosas con propiedades medicinales ancestrales.',
    season: 'Floración: Octubre a Noviembre',
    curiosity: 'Sus hojas siempre se orientan en sentido norte-sur para evitar la radiación solar directa sobre sus caras anchas, regulando su temperatura.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Larrea_divaricata_frutos_ab.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'sauce-criollo',
    commonName: 'Sauce Criollo o Colorado',
    scientificName: 'Salix humboldtiana',
    category: 'arboles',
    categoryLabel: 'Árbol Ripario',
    description: 'Especie nativa que crece en las márgenes húmedas del Río Negro. Posee copa globosa e hilos de ramas péndulas de color verde claro y corteza agrietada muy rugosa.',
    season: 'Avistamiento: Todo el año (Follaje caduco en invierno)',
    curiosity: 'Es uno de los pocos árboles de gran porte autóctonos de la Patagonia, sirviendo de refugio fundamental para infinidad de nidos de aves acuáticas.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Salix_humboldtiana_%28Salicaceae%29.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'cardenal-amarillo',
    commonName: 'Cardenal Amarillo',
    scientificName: 'Gubernatrix cristata',
    category: 'aves',
    categoryLabel: 'Ave Emblemática (En Peligro)',
    description: 'Preciosa y melodiosa ave cantora con copete negro de plumas eréctiles y plumaje amarillo oliva de alta pureza. Vive en bosques de caldenes y algarrobos de Guardia Mitre.',
    season: 'Avistamiento: Primavera y Otoño',
    curiosity: 'Se encuentra en grave peligro de extinción debido a la captura ilegal para mascotismo y la pérdida de hábitat. Avistarlo en el parque es un verdadero privilegio científico.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Gubernatrix_cristata_-_Yellow_cardinal_%28male%29%3B_Iber%C3%A1_marshes%2C_Corrientes%2C_Argentina.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'choique',
    commonName: 'Choique o Ñandú Petiso',
    scientificName: 'Rhea pennata',
    category: 'aves',
    categoryLabel: 'Ave Corredora Nativa',
    description: 'Gran ave corredora no voladora de las estepas rionegrinas. Posee plumaje pardo moteado de blanco, patas fuertes y cuello largo y flexible.',
    season: 'Avistamiento: Todo el año',
    curiosity: 'El macho es el encargado de empollar los huevos de varias hembras en un solo nido común en el suelo, y defiende a los pichones (charitos) con notable ferocidad.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Rhea_pennata_352439478.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'alpataco',
    commonName: 'Alpataco',
    scientificName: 'Prosopis alpataco',
    category: 'arboles',
    categoryLabel: 'Arbusto Espinoso',
    description: 'Arbusto bajo caracterizado por sus ramas semienterradas y flexuosas llenas de espinas cónicas muy punzantes. Esencial para fijar el suelo de las lomas y del borde costero.',
    season: 'Floración: Octubre a Enero',
    curiosity: 'Desarrolla raíces pivotantes extremadamente profundas de hasta 15 metros para buscar humedad en napas subterráneas de la árida llanura.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Prosopis_alpataco_01.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'carancho',
    commonName: 'Carancho u Halcón Pollo',
    scientificName: 'Caracara plancus',
    category: 'aves',
    categoryLabel: 'Ave Rapaz',
    description: 'Ave rapaz de gran tamaño, plumaje pardo negruzco, capuchón oscuro con cara descubierta de piel amarilla o anaranjada brillante en invierno.',
    season: 'Avistamiento: Todo el año',
    curiosity: 'Es un consumado oportunista cosmopolita; puede cazar pequeños mamíferos o insectos, pero también actúa como limpiador carroñero indispensable del ecosistema.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Carancho_Caracara_plancus_Dario_Niz.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'bicho-cesto',
    commonName: 'Bicho de Cesto Oruga',
    scientificName: 'Oiketicus platensis',
    category: 'insectos',
    categoryLabel: 'Insectos Constructores',
    description: 'Larva de mariposa nocturna que teje un capullo móvil de seda cubriéndolo con pequeñas ramitas, fragmentos de hojas y espinas de los senderos de Guardia Mitre.',
    season: 'Avistamiento: Primavera e Invierno',
    curiosity: 'La hembra nunca llega a transformarse en mariposa alada; permanece sin alas ni patas dentro de su capullo protector durante todo su trayecto biológico.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Oiketicus_platensis_120662740.jpg',
    imageCredit: 'Wikimedia Commons'
  },
  {
    id: 'hongo-arenal',
    commonName: 'Hongo de los Arenales',
    scientificName: 'Montagnea arenaria',
    category: 'hongos',
    categoryLabel: 'Fungi Estepario',
    description: 'Singular hongo adaptado a los suelos arenosos y áridos del jarillal. Posee un pie fibroso negruzco y un sombrero aplanado que le confieren aspecto leñoso.',
    season: 'Avistamiento: Otoño e Invierno templado',
    curiosity: 'Es un hongo xerófilo extremo. Su consistencia rígida casi carbonosa evita que se deshidrate o desintegre rápidamente con los secos vientos patagónicos.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Montagnea_arenaria_%28DC.%29_Zeller_305107.jpg',
    imageCredit: 'Wikimedia Commons'
  }
];

export const CATEGORIES = [
  'Infantil (hasta 17)',
  'Adulto (18 - 39)',
  'Master (40 - 49)',
  'Senior (50 - 59)',
  'Veterano (60+)',
];

export const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSfzRfc2f-i8xmBMGfVbhDz4Nnxlt5hOfpK3Y4p3AE8D_iw0Pw',
  entries: {
    nombre: 'entry.969350065',
    sendero: 'entry.49559792',
    tiempo: 'entry.236869142',
    clima: 'entry.1090869712',
    comentarios: 'entry.1586715887',
    terminos: 'entry.871715811',
    fechaYear: 'entry.year',
    fechaMonth: 'entry.month',
    fechaDay: 'entry.day',
    horaHour: 'entry.hour',
    horaMinute: 'entry.minute',
  },
};

export const DEFAULT_GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1Cnck9_gdvqJ0wVIlJiZqiZj-PM7clQ68iFz35XuqMDk/pub?output=csv';

export const INITIAL_RANKINGS = [];