/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  category: 'arboles' | 'aves' | 'insectos' | 'hongos';
  categoryLabel: string;
  description: string;
  season: string; // "Primavera - Verano", "Todo el año", etc.
  curiosity: string;
  image: string; // Curated unsplash photo url
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
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600' // Dry mountain desert plant vibe
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
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600' // Big ancient willow/tree riverside look
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
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=600' // Yellow majestic bird close up
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
    image: 'https://images.unsplash.com/photo-1611384592817-f27eb6943bf0?auto=format&fit=crop&q=80&w=600' // Rhea/choique/ostrich patron look
  },
  {
    id: 'cavanillesia',
    commonName: 'Alpataco',
    scientificName: 'Prosopis alpataco',
    category: 'arboles',
    categoryLabel: 'Arbusto Espinoso',
    description: 'Arbusto bajo caracterizado por sus ramas semienterradas y flexuosas llenas de espinas cónicas muy punzantes. Esencial para fijar los médanos costeros.',
    season: 'Floración: Octubre a Enero',
    curiosity: 'Desarrolla raíces pivotantes extremadamente profundas de hasta 15 metros para buscar humedad en napas subterráneas de la árida llanura.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600' // Desert thorn plants
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
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600' // Birds of prey lookup
  },
  {
    id: 'bicho-cesto',
    commonName: 'Bicho de Cesto Oruga',
    scientificName: 'Oiketicus platensis',
    category: 'insectos',
    categoryLabel: 'Insectos constructores',
    description: 'Larva de mariposa nocturna que teje un capullo móvil de seda cubriéndolo con pequeñas ramitas, fragmentos de hojas y espinas de los senderos de Guardia Mitre.',
    season: 'Avistamiento: Primavera e Invierno',
    curiosity: 'La hembra nunca llega a transformarse en mariposa alada; permanece sin alas ni patas dentro de su capullo protector durante todo su trayecto biológico.',
    image: 'https://images.unsplash.com/photo-1576082900999-48978aeeb6b6?auto=format&fit=crop&q=80&w=600' // Cocoon/branch garden insect detail
  },
  {
    id: 'hongo-jarillal',
    commonName: 'Hongo de los Arenales',
    scientificName: 'Montagnea arenaria',
    category: 'hongos',
    categoryLabel: 'Fungi Estepario',
    description: 'Singular hongo adaptado a los suelos arenosos y áridos del jarillal. Posee un pie fibroso negruzco y un sombrero aplanado que le confieren aspecto leñoso.',
    season: 'Avistamiento: Otoño e Invierno templado',
    curiosity: 'Es un hongo xerófilo extremo. Su consistencia rígida casi carbonosa evita que se deshidrate o desintegre rápidamente con los secos vientos patagónicos.',
    image: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=600' // Desert ground fungus structure
  }
];
