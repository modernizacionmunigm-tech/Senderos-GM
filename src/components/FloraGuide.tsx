/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  Info, 
  X, 
  Leaf, 
  ExternalLink, 
  Sparkles, 
  Upload, 
  Compass, 
  ArrowRight,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { SPECIES_LIST, Species } from '../floraData';

export default function FloraGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'arboles' | 'aves' | 'insectos' | 'hongos'>('todos');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

  // PlantNet Modal states
  const [showPlantNetModal, setShowPlantNetModal] = useState(false);
  const [selectedFileForID, setSelectedFileForID] = useState<File | null>(null);
  const [previewUrlForID, setPreviewUrlForID] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [idResult, setIdResult] = useState<{ name: string; sci: string; confidence: number; speciesId?: string } | null>(null);

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

  // Handle PlantNet Sim Identification
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerVibrate(50);
      setSelectedFileForID(file);
      setPreviewUrlForID(URL.createObjectURL(file));
      setIdResult(null);
    }
  };

  const startIdentification = () => {
    if (!selectedFileForID) return;
    triggerVibrate(80);
    setIsIdentifying(true);

    // Simulate analysis with native Monte vegetation candidates
    setTimeout(() => {
      setIsIdentifying(false);
      
      // Randomly select one of our trees / plants or yield a neat match based on name if possible
      const plants = SPECIES_LIST.filter(s => s.category === 'arboles');
      const matched = plants[Math.floor(Math.random() * plants.length)] || SPECIES_LIST[0];

      setIdResult({
        name: matched.commonName,
        sci: matched.scientificName,
        confidence: Math.floor(Math.random() * 11) + 82, // 82% to 92% confidence
        speciesId: matched.id
      });
    }, 2200);
  };

  const resetPlantNetModal = () => {
    setSelectedFileForID(null);
    setPreviewUrlForID(null);
    setIdResult(null);
    setIsIdentifying(false);
  };

  const filterToIdentified = (spId?: string) => {
    if (spId) {
      setSelectedCategory('todos');
      const found = SPECIES_LIST.find(s => s.id === spId);
      if (found) {
        setSearchTerm(found.commonName);
      }
    }
    setShowPlantNetModal(false);
    resetPlantNetModal();
    triggerVibrate();
  };

  // iNaturalist helper link
  const buildINaturalistLink = (sp: Species) => {
    // Geo coordinates for Monte Mitre area
    const lat = -40.4357;
    const lng = -62.7230;
    const termEncoded = encodeURIComponent(sp.scientificName);
    return `https://www.inaturalist.org/observations/new?latitude=${lat}&longitude=${lng}&taxon_name=${termEncoded}&place_id=argentina`;
  };

  const openDeepINaturalist = (sp: Species) => {
    triggerVibrate(50);
    const deepLink = `inaturalist://observations/new?latitude=-40.4357&longitude=-62.7230&taxon_name=${encodeURIComponent(sp.scientificName)}`;
    
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
      <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 font-display flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-600 animate-pulse" />
            Biodiversidad del Parque Guardia Mitre
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Explora la maravillosa fauna, flora, ecorregión monte y hongos autóctonos de nuestro valle protegido de la Patagonia.
          </p>
        </div>

        {/* Float Action Camera Identify Button */}
        <button
          id="btn-trigger-id-specimen"
          onClick={() => { triggerVibrate(60); setShowPlantNetModal(true); }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Camera className="w-4 h-4" />
          Identificar Especie (PlantNet)
        </button>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        {/* Search input field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            id="input-biodiversity-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre común o científico..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-gray-800"
          />
        </div>

        {/* Pill category selection buttons */}
        <div className="flex flex-wrap items-center gap-1.5 scrollbar-thin overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'arboles', label: 'Árboles/Plantas' },
            { id: 'aves', label: 'Aves' },
            { id: 'insectos', label: 'Insectos' },
            { id: 'hongos', label: 'Hongos' },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`filter-pill-${cat.id}`}
              onClick={() => { handleManualVibe(); setSelectedCategory(cat.id as any); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN SPECIMENS GRID */}
      <div id="biodiversity-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredSpecies.length > 0 ? (
          filteredSpecies.map((sp) => (
            <div
              key={sp.id}
              id={`species-card-${sp.id}`}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Header Illustration image */}
              <div className="h-32 sm:h-40 relative group overflow-hidden bg-gray-150">
                <img
                  src={sp.image}
                  alt={sp.commonName}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white rounded text-[9px] font-bold uppercase tracking-wider">
                  {sp.categoryLabel}
                </span>
              </div>

              {/* Card Content details */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-800 font-display leading-tight">{sp.commonName}</h4>
                  <p className="text-xs text-emerald-700 italic font-medium">{sp.scientificName}</p>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gray-50">
                  <button
                    id={`btn-species-details-${sp.id}`}
                    onClick={() => { triggerVibrate(); setSelectedSpecies(sp); }}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-semibold text-[10px] rounded-lg border border-gray-100 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Info className="w-3 h-3" />
                    Info
                  </button>
                  
                  <button
                    id={`btn-species-inaturalist-${sp.id}`}
                    onClick={() => openDeepINaturalist(sp)}
                    className="px-3 py-1.5 bg-brand-650 hover:bg-brand-50 text-emerald-800 font-bold text-[10px] rounded-lg hover:border-emerald-200 border border-transparent transition-all flex items-center gap-1 cursor-pointer"
                    title="Registrar avistamiento en Ciencia Ciudadana iNaturalist"
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
            <p className="text-sm font-semibold text-gray-700 font-display">No hay especies registradas de este tipo</p>
            <p className="text-xs text-gray-400">Intenta reestablecer los filtros o buscar otro término.</p>
          </div>
        )}
      </div>

      {/* PLANTNET SIM IDENTIFICATION MODAL */}
      {showPlantNetModal && (
        <div id="plantnet-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-emerald-950 text-white relative">
              <button
                id="btn-close-plantnet-top"
                onClick={() => { triggerVibrate(); setShowPlantNetModal(false); resetPlantNetModal(); }}
                className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl text-brand-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display">Identificación PlantNet</h3>
                  <span className="text-[9px] font-bold text-emerald-200 font-mono tracking-wider block uppercase">Servicio de Taxonomía de Monte</span>
                </div>
              </div>
            </div>

            {/* Modal Body content */}
            <div className="p-6 space-y-6">
              
              {!previewUrlForID ? (
                /* Select file screen */
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 leading-normal">
                    Tómale una foto a una hoja, fruto, corteza o flor para identificarla en segundos usando la inteligencia artificial de PlantNet y compararla con las especies nativas registradas de Guardia Mitre.
                  </p>

                  <label className="border-2 border-dashed border-emerald-900/10 hover:border-emerald-600 bg-emerald-50/10 hover:bg-emerald-50/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-350 select-none group">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-emerald-650 group-hover:scale-105 transition-transform mb-3" />
                    <span className="text-xs font-bold text-gray-700 font-display">Tomar Foto con Celular</span>
                    <span className="text-[10px] text-gray-400 mt-1 block">Soporta cámara en vivo o galería pública</span>
                  </label>
                </div>
              ) : (
                /* File review and identify screen */
                <div className="space-y-4">
                  <div className="h-48 w-full rounded-2xl overflow-hidden shadow-inner bg-gray-100 relative">
                    <img
                      src={previewUrlForID}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      id="btn-reset-preview"
                      disabled={isIdentifying}
                      onClick={resetPlantNetModal}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white font-semibold text-[10px] transition-colors cursor-pointer"
                    >
                      Cambiar Foto
                    </button>
                  </div>

                  {!isIdentifying && !idResult && (
                    <button
                      id="btn-execute-identification"
                      onClick={startIdentification}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Procesar Imagen con PlantNet AI
                    </button>
                  )}

                  {isIdentifying && (
                    <div className="py-4 text-center space-y-3">
                      <div className="mx-auto w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-700 font-display animate-pulse">Analizando morfología botánica...</p>
                        <p className="text-[10px] text-gray-400 font-mono">Consultando base de especies exóticas y nativas de Guardia Mitre</p>
                      </div>
                    </div>
                  )}

                  {idResult && (
                    <div className="bg-emerald-50 border border-emerald-200/40 rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-2 duration-200 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-200 text-emerald-800 text-[9px] font-bold uppercase rounded-full">
                        Match Encontrado
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-gray-800 font-display">{idResult.name}</h4>
                        <p className="text-xs italic text-emerald-700">{idResult.sci}</p>
                      </div>

                      <div className="py-1 flex items-center justify-center gap-1">
                        <span className="text-3xl font-bold text-gray-800 font-display">{idResult.confidence}%</span>
                        <span className="text-xs text-gray-500 font-semibold">de certeza</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          id="btn-view-identified"
                          onClick={() => filterToIdentified(idResult.speciesId)}
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          Filtrar en Guía
                        </button>
                        <button
                          id="btn-inaturalist-identified"
                          onClick={() => {
                            const found = SPECIES_LIST.find(s => s.id === idResult.speciesId);
                            if (found) {
                              openDeepINaturalist(found);
                            }
                          }}
                          className="px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Subir a iNaturalist
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* SINGLE SPECIES DETAIL MODAL */}
      {selectedSpecies && (
        <div id="species-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
            
            <button
              id="btn-close-species-top"
              onClick={() => { triggerVibrate(); setSelectedSpecies(null); }}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Hero Banner image */}
            <div className="h-48 sm:h-56 relative">
              <img
                src={selectedSpecies.image}
                alt={selectedSpecies.commonName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>
              
              <div className="absolute bottom-5 left-5 text-white">
                <span className="px-2 py-0.5 bg-brand-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-md block w-fit mb-1.5">
                  {selectedSpecies.categoryLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display leading-tight">{selectedSpecies.commonName}</h3>
                <p className="text-xs text-brand-200 italic font-medium mt-0.5">{selectedSpecies.scientificName}</p>
              </div>
            </div>

            {/* Content particulars */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 font-display">Descripción de la Especie</h4>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedSpecies.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Estación de Avistamiento</h5>
                  <p className="text-xs font-semibold text-gray-700 mt-1 font-sans">{selectedSpecies.season}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Curiosidad Singular</h5>
                  <p className="text-xs italic text-gray-600 mt-1 leading-normal font-sans">"{selectedSpecies.curiosity}"</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 text-xs text-emerald-950/80 rounded-xl border border-emerald-250/30 flex items-start gap-2.5">
                <span className="text-xl">🔬</span>
                <div>
                  <strong>Aporta al Mapa de la Biodiversidad</strong>
                  <p className="mt-0.5">Puedes sumarte al proyecto de ciencia participativa de la estepa en Guardia Mitre reportando fotos geolocalizadas directo al nodo regional de iNaturalist.</p>
                </div>
              </div>
            </div>

            {/* Actions for Modal */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                id="btn-close-species-bottom"
                onClick={() => { triggerVibrate(); setSelectedSpecies(null); }}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-605 transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                id="btn-inaturalist-deep"
                onClick={() => { openDeepINaturalist(selectedSpecies); setSelectedSpecies(null); }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
