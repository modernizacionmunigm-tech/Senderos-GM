/**
@license
SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import {
  Search,
  Info,
  X,
  Leaf,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Users,
  Globe,
  Database,
  Bird,
  BookOpen,
  ListChecks,
  Sprout
} from 'lucide-react';
import { SPECIES_LIST, Species } from '../floraData';
import { GUARDIA_MITRE_CENTER } from '../data';

/**
 * Apps y sitios que sí reconocen especies. La página no adivina: manda a
 * herramientas de verdad, gratuitas y conocidas, para usar en el mismo sendero.
 */
const APPS_IDENTIFICACION = [
  {
    name: 'Merlin Bird ID',
    para: 'Aves',
    detail: 'Le sacás una foto al ave —o grabás su canto— y te sugiere cuál es.',
    url: 'https://merlin.allaboutbirds.org/',
    Icon: Bird,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    name: 'eBird',
    para: 'Aves',
    detail: 'Para anotar las aves que viste y armar la lista del día. Lo que cargás queda para la ciencia.',
    url: 'https://ebird.org/',
    Icon: ListChecks,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    name: 'Aves Argentinas',
    para: 'Aves',
    detail: 'Fichas y guías de las aves del país, en castellano.',
    url: 'https://www.avesargentinas.org.ar/',
    Icon: BookOpen,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    name: 'Pl@ntNet',
    para: 'Plantas',
    detail: 'Identifica plantas con una foto de la hoja, la flor o el fruto.',
    url: 'https://plantnet.org/',
    Icon: Sprout,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'iNaturalist',
    para: 'Plantas, animales y hongos',
    detail: 'Subís la foto y la comunidad de naturalistas te ayuda a confirmar qué es.',
    url: 'https://www.inaturalist.org/',
    Icon: Globe,
    tone: 'bg-blue-50 text-blue-700',
  },
];

export default function FloraGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'arboles' | 'aves' | 'insectos' | 'hongos'>('todos');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  const triggerVibrate = (ms: number = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleManualVibe = () => {
    triggerVibrate(30);
  };

  // Filter logic
  const filteredSpecies = SPECIES_LIST.filter((sp) => {
    const matchesCategory = selectedCategory === 'todos' || sp.category === selectedCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      sp.commonName.toLowerCase().includes(searchLower) ||
      sp.scientificName.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  // iNaturalist helper link
  const buildINaturalistLink = (sp: Species) => {
    // Coordenadas del inicio del sendero (Monte Mitre), para que la
    // observación quede clavada en el lugar y no en otro punto del mapa.
    const [lat, lng] = GUARDIA_MITRE_CENTER;
    const termEncoded = encodeURIComponent(sp.scientificName);
    return `https://www.inaturalist.org/observations/new?latitude=${lat}&longitude=${lng}&taxon_name=${termEncoded}&place_id=argentina`;
  };

  const openDeepINaturalist = (sp: Species) => {
    triggerVibrate(50);
    const [lat, lng] = GUARDIA_MITRE_CENTER;
    const deepLink = `inaturalist://observations/new?latitude=${lat}&longitude=${lng}&taxon_name=${encodeURIComponent(sp.scientificName)}`;
    
    // Attempt standard deep link block launch
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    setTimeout(() => {
      document.body.removeChild(iframe);
      // Fallback web redirect if app doesn't trigger
      window.open(buildINaturalistLink(sp), '_blank', 'noreferrer,noopener');
    }, 300);
  };

  return (
    <div id="flora-fauna-explorer" className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-800 font-display flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-600 animate-pulse" />
          Biodiversidad del Parque Guardia Mitre
        </h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Explora la rica flora y fauna de los senderos de Guardia Mitre. Aprende a identificar especies 
          y contribuye al conocimiento científico con tus observaciones.
        </p>
      </div>

      {/* APPS PARA RECONOCER LO QUE VAS VIENDO */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-gray-800 font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Apps para reconocer lo que vas viendo
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Esta página no reconoce plantas ni aves por su cuenta, pero hay aplicaciones gratuitas
          que sí, y se usan en el mismo sendero: le sacás una foto a la hoja, a la flor o al ave
          —o grabás su canto— y te tiran los nombres posibles. Necesitan internet, así que conviene
          bajarlas antes de salir a caminar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {APPS_IDENTIFICACION.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerVibrate(40)}
              className="group bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-sm rounded-2xl p-4 flex items-start gap-3 transition-all"
            >
              <div className={`p-2 rounded-xl shrink-0 ${app.tone}`}>
                <app.Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-gray-800 leading-tight">{app.name}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-600 shrink-0" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{app.para}</span>
                <p className="text-[11px] text-gray-600 leading-snug mt-1">{app.detail}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 leading-snug">
          Son aplicaciones y sitios de otras organizaciones: se abren en otra pestaña y no
          dependen de la Municipalidad.
        </p>
      </div>

      {/* CÓMO USAR - 4 pasos */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-bold text-base text-gray-800 font-display flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-600" />
          ¿Cómo usar estas apps?
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="font-bold text-xs text-gray-800">Toma una foto</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Toma una foto clara de la planta o del ave: flores, hojas, corteza o el detalle que más se note.
              Si el ave no se deja, grabá su canto: varias apps lo reconocen igual.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="font-bold text-xs text-gray-800">Subila a la app</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pl@ntNet o iNaturalist para plantas; Merlin o eBird para aves. La app procesa la foto
              (o el audio) y te devuelve los nombres posibles.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="font-bold text-xs text-gray-800">Compará</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mirá las sugerencias y compará con la ficha de esta guía. Ninguna app acierta el 100 %:
              si no estás seguro, dejalo como "no identificado".
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="font-bold text-xs text-gray-800">Compartí</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Si querés, subí la observación a iNaturalist o eBird. Tus registros quedan para la
              ciencia y ayudan a conocer mejor el monte de Guardia Mitre.
            </p>
          </div>
        </div>
      </div>

      {/* CATÁLOGO DE ESPECIES */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-gray-800 font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Catálogo de Especies
          </h3>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar especie..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'todos', label: 'Todas' },
                { id: 'arboles', label: '🌱 Flora' },
                { id: 'aves', label: '🦅 Fauna' },
                { id: 'insectos', label: 'Insectos' },
                { id: 'hongos', label: 'Hongos' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { handleManualVibe(); setSelectedCategory(cat.id as any); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Species Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSpecies.length > 0 ? (
            filteredSpecies.map((sp) => (
              <div
                key={sp.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <div className="h-48 relative group overflow-hidden bg-gray-100">
                  <img
                    src={sp.image}
                    alt={sp.commonName}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback si alguna imagen falla al cargar
                      (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Larrea_divaricata_01.jpg/640px-Larrea_divaricata_01.jpg'; 
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-1 bg-black/60 backdrop-blur-md text-white rounded text-[9px] font-bold uppercase">
                    {sp.categoryLabel}
                  </span>
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-800 font-display">{sp.commonName}</h4>
                    <p className="text-xs text-emerald-700 italic">{sp.scientificName}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => { triggerVibrate(); setSelectedSpecies(sp); }}
                      className="flex-1 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-semibold text-[10px] rounded-lg border border-gray-100 transition-colors"
                    >
                      Info
                    </button>
                    <button
                      onClick={() => openDeepINaturalist(sp)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all"
                    >
                      Avistaje 📷
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Leaf className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-gray-700">No se encontraron especies</p>
              <p className="text-xs text-gray-400">Intenta con otros filtros</p>
            </div>
          )}
        </div>
      </div>

      {/* IDENTIFICACIÓN COLABORATIVA */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-base text-gray-800 font-display flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" />
          Identificación Colaborativa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-gray-800">¿No puedes identificar una especie?</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Si encuentras una especie que no puedes identificar con seguridad, súbela a iNaturalist 
              con una identificación general. La comunidad de naturalistas te ayudará a identificarla correctamente.
            </p>
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-100/50 p-2 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <span>Tip: Incluye varias fotos desde diferentes ángulos y agrega información sobre el hábitat.</span>
            </div>
          </div>

          <div className="bg-white/70 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-gray-800">¿Eres experto en algún grupo?</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Si tienes conocimientos sobre plantas, insectos, aves u otros grupos, ayuda a identificar 
              las observaciones de otros usuarios. ¡Tu conocimiento es muy valioso para la comunidad!
            </p>
            <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-100/50 p-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>Tu ayuda permite que científicos y estudiantes usen estas observaciones.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIES DETAIL MODAL */}
      {selectedSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
            
            <button
              onClick={() => { triggerVibrate(); setSelectedSpecies(null); }}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-56 relative">
              <img src={selectedSpecies.image} alt={selectedSpecies.commonName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-5 left-5 text-white">
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold uppercase rounded-md block w-fit mb-1.5">
                  {selectedSpecies.categoryLabel}
                </span>
                <h3 className="text-2xl font-extrabold font-display leading-tight">{selectedSpecies.commonName}</h3>
                <p className="text-xs text-emerald-200 italic font-medium mt-0.5">{selectedSpecies.scientificName}</p>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 font-display">Descripción</h4>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedSpecies.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estación</h5>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{selectedSpecies.season}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Curiosidad</h5>
                  <p className="text-xs italic text-gray-600 mt-1">{selectedSpecies.curiosity}</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 text-xs text-emerald-900 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                <span className="text-xl">🔬</span>
                <div>
                  <strong>Aporta al Mapa de la Biodiversidad</strong>
                  <p className="mt-0.5">
                    Sumate al proyecto de ciencia participativa reportando fotos geolocalizadas directo al nodo regional de iNaturalist.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => { triggerVibrate(); setSelectedSpecies(null); }}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={() => { openDeepINaturalist(selectedSpecies); setSelectedSpecies(null); }}
                className="flex-1 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                Registrar Avistamiento
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}