/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MapPin, Navigation, Clock, Activity, ChevronRight, X, Info, Trophy } from 'lucide-react';
import { Trail } from '../types';
import TrailMiniMap from './TrailMiniMap';

interface TrailCardProps {
  key?: string;
  trail: Trail;
  onViewOnMap: (trailId: string) => void;
  onRegisterTime?: (trailId: string) => void;
}

export default function TrailCard({ trail, onViewOnMap, onRegisterTime }: TrailCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Vibration helper
  const triggerVibrate = (ms: number = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const getDifficultyBadge = (difficulty: 'baja' | 'media' | 'alta') => {
    switch (difficulty) {
      case 'baja':
        return <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200">Dificultad Baja ★</span>;
      case 'media':
        return <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-200">Dificultad Media ★★</span>;
      case 'alta':
        return <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-xs font-semibold rounded-full border border-red-200">Dificultad Alta ★★★</span>;
    }
  };

  const getDifficultyColor = (difficulty: 'baja' | 'media' | 'alta') => {
    switch (difficulty) {
      case 'baja': return 'border-l-emerald-500';
      case 'media': return 'border-l-amber-500';
      case 'alta': return 'border-l-red-500';
    }
  };

  return (
    <>
      <div 
        id={`trail-card-${trail.id}`}
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-l-4 ${getDifficultyColor(trail.difficulty)} flex flex-col`}
      >
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-bold text-lg text-gray-800 font-display leading-tight">{trail.name}</h3>
            <div className="shrink-0">{getDifficultyBadge(trail.difficulty)}</div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 md:line-clamp-3">{trail.description}</p>
          
          {/* Interactive Live Leaflet Map */}
          <div className="mt-4">
            <TrailMiniMap trail={trail} />
          </div>
          
          {/* Senders metrics list */}
          <div className="grid grid-cols-3 gap-2 mt-5 py-3 border-y border-gray-50 bg-gray-50/50 rounded-xl px-2.5 text-center">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Distancia</span>
              <span className="text-sm font-bold text-gray-700 font-mono">{trail.distance} km</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Desnivel</span>
              <span className="text-sm font-bold text-gray-700 font-mono">+{trail.elevationGain}m</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Tiempo Est.</span>
              <span className="text-sm font-bold text-gray-700 font-mono">{trail.duration}</span>
            </div>
          </div>

          {/* New Register local mark button */}
          <button
            id={`btn-card-register-time-${trail.id}`}
            onClick={() => { triggerVibrate(); onRegisterTime && onRegisterTime(trail.id); }}
            className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
            Registrar Marca de Tiempo
          </button>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between gap-2">
          <button
            id={`btn-trail-details-${trail.id}`}
            onClick={() => { triggerVibrate(); setShowModal(true); }}
            className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-700 rounded-lg text-xs font-semibold text-gray-600 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Ficha Técnica
          </button>
          
          <button
            id={`btn-trail-map-${trail.id}`}
            onClick={() => { triggerVibrate(50); onViewOnMap(trail.id); }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            Ver en Mapa
          </button>
        </div>
      </div>

      {/* Details Dialog Modals */}
      {showModal && (
        <div id={`trail-modal-${trail.id}`} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative my-8 overflow-hidden animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 text-white relative" style={{ backgroundColor: trail.color }}>
              <div className="absolute inset-0 bg-linear-to-r from-black/40 to-black/10 z-0 flex rounded-t-2xl"></div>
              
              <button
                id={`btn-close-modal-${trail.id}`}
                onClick={() => { triggerVibrate(); setShowModal(false); }}
                className="absolute top-4 right-4 z-10 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors cursor-pointer"
                aria-label="Cerrar detalles"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] uppercase tracking-widest font-bold rounded-md">
                    Sendero Guardia Mitre
                  </span>
                  <div className="text-white/85 text-xs font-semibold">
                    {trail.difficulty === 'baja' ? 'DIFICULTAD BAJA' : 'DIFICULTAD ALTA'}
                  </div>
                </div>
                <h2 className="text-2xl font-bold font-display tracking-tight leading-tight">{trail.name}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 font-display">Descripción General</h4>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{trail.longDescription}</p>
              </div>

              {/* Data Grid with colors matched dynamically to Difficulty */}
              <div className={`grid grid-cols-3 gap-2 py-3 border rounded-xl px-4 text-center ${
                trail.difficulty === 'baja' 
                  ? 'bg-emerald-50/40 border-emerald-600/10 text-emerald-950' 
                  : 'bg-red-50/40 border-red-600/10 text-red-950'
              }`}>
                <div>
                  <span className="text-[10px] opacity-70 font-semibold uppercase block">Distancia</span>
                  <span className="text-lg font-extrabold font-mono">{trail.distance} km</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 font-semibold uppercase block">Elevación</span>
                  <span className="text-lg font-extrabold font-mono">+{trail.elevationGain}m</span>
                </div>
                <div>
                  <span className="text-[10px] opacity-70 font-semibold uppercase block">Duración</span>
                  <span className="text-lg font-extrabold font-mono">{trail.duration}</span>
                </div>
              </div>

              {/* Points of Interest list */}
              <div>
                <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <MapPin className={`w-4 h-4 ${trail.difficulty === 'baja' ? 'text-emerald-600' : 'text-red-500'}`} />
                  <h4 className="font-bold text-sm text-gray-800 font-display">Puntos de Interés / Paradas QR</h4>
                </div>
                
                <ul className="space-y-4 mt-3">
                  {trail.pointsOfInterest.map((poi, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                        trail.difficulty === 'baja' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-gray-800 text-sm">{poi.name}</strong>
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold rounded uppercase">
                            {poi.type}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1">{poi.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* local Storage details */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-600/10 text-xs text-amber-900/80 flex items-start gap-2.5">
                <Trophy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>¿Quieres marcar tiempo en este sendero?</strong>
                  <p className="mt-0.5">Ve al portal en el parque, escanea el QR en el punto de partida, pon en marcha tu cronómetro y registra tu marca al finalizar para el Ranking histórico local.</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2 text-center">
              <button
                id={`btn-close-modal-bottom-${trail.id}`}
                onClick={() => { triggerVibrate(); setShowModal(false); }}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-650 transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                id={`btn-modal-register-time-${trail.id}`}
                onClick={() => { triggerVibrate(); setShowModal(false); onRegisterTime && onRegisterTime(trail.id); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 text-center cursor-pointer flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                Registrar Marca
              </button>
              <button
                id={`btn-modal-map-${trail.id}`}
                onClick={() => { triggerVibrate(50); onViewOnMap(trail.id); setShowModal(false); }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-775 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                Iniciar recorrido en Mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
