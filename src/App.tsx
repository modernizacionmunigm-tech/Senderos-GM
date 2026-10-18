/**
@license
SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import {
  Compass,
  Map,
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Heart,
  ExternalLink,
  Leaf,
  Info,
  Facebook,
  Instagram,
  Phone
} from 'lucide-react';

import { GMLogo } from './components/Logos';

import Header from './components/Header';
import WeatherWidget from './components/WeatherWidget';
import PWAInstallBanner from './components/PWAInstallBanner';
import TrailCard from './components/TrailCard';
import MapModule from './components/MapModule';
import TimeForm from './components/TimeForm';
import RankingTable from './components/RankingTable';
import FloraGuide from './components/FloraGuide';
import AboutProject from './components/AboutProject';
import logoSenderos from './assets/images/logo-senderos-wt.png';

import { TRAILS } from './data';

export default function App() {
  // Navigation / router state con Deep Linking support
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'inicio';
  });
  
  // Highlighting specific trail on map
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  
  // Tracking trail registration state
  const [registeringTrailId, setRegisteringTrailId] = useState<string | null>(null);
  
  // Real-time scores reload clock trigger
  const [refreshRanks, setRefreshRanks] = useState(0);

  // Vibration support
  const triggerVibrate = (ms: number = 45) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Sincronizar URL con el tab activo para deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === 'mapa') {
      params.set('tab', 'mapa');
    } else {
      params.delete('tab');
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab]);

  const handleSelectTrailOnMap = (trailId: string) => {
    triggerVibrate(60);
    setSelectedTrailId(trailId);
    setActiveTab('mapa');
  };

  const incrementRefreshRanks = (shouldStayInPlace?: boolean) => {
    setRefreshRanks((prev) => prev + 1);
    if (!shouldStayInPlace) {
      setActiveTab('ranking');
    }
  };

  const handleFooterNav = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    triggerVibrate(30);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado para Modo Simple del Mapa (persistido en localStorage)
  const [mapSimpleMode, setMapSimpleMode] = useState(() => {
    const saved = localStorage.getItem('map_simple_mode');
    return saved === 'true';
  });

  const toggleSimpleMode = () => {
    const newVal = !mapSimpleMode;
    setMapSimpleMode(newVal);
    localStorage.setItem('map_simple_mode', String(newVal));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Permanent floating helper installations indicator */}
      <PWAInstallBanner />

      {/* Global layout Sticky header */}
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        
        {/* VIEW 1: INICIO (HOME) */}
        {activeTab === 'inicio' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Scenic Welcome Card Section */}
            <div className="relative bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl overflow-hidden shadow-sm border border-blue-900/40">
              
              {/* Pattern Background details */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.15),transparent_60%)] z-0"></div>
              
              <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10">
                <div className="space-y-4 md:space-y-5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider rounded-full backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                    Corredores & Senderistas
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display leading-tight">
                    Descubre los Senderos de <span className="text-sky-400 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300">Guardia Mitre</span>
                  </h1>
                  
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Explora la naturaleza de Río Negro a través de nuestros senderos turísticos. Registra tus tiempos, identifica flora y fauna, y comparte tu experiencia.
                  </p>

                  {/* Primary shortcuts actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      id="btn-shortcut-trails"
                      onClick={() => { triggerVibrate(); setActiveTab('senderos'); }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Ver Senderos
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id="btn-shortcut-rankings"
                      onClick={() => { triggerVibrate(); setActiveTab('ranking'); }}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    >
                      Tabla de Clasificación
                    </button>
                  </div>
                </div>

                {/* Integration of Mi-Logo Claro in the Hero right side */}
                <div className="hidden md:flex flex-col items-center gap-2 px-6 py-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 select-none shrink-0 animate-in fade-in duration-700 w-72">
                  {/* Contenedor del logo sin padding para que ocupe todo */}
                  <div className="flex-1 w-full h-full flex items-center justify-center p-2">
                    <img 
                      src={logoSenderos} 
                      alt="Logo Monte Mitre Senderos" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  {/* Texto inferior con fondo para contraste */}
                  <div className="w-full py-3 bg-black/20 text-center border-t border-white/10">
                    <span className="text-[12px] uppercase font-bold text-sky-300 tracking-widest font-mono">
                      INICIATIVA OFICIAL
                    </span>
                  </div>
                </div>

              </div>

              {/* Angle design visual clip path */}
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-bl from-sky-500/15 to-slate-900 clip-path-slant select-none pointer-events-none"></div>
            </div>

            {/* LIVE WEATHER COMPONENT FOR GUARDIA MITRE */}
            <WeatherWidget />

            {/* QUICK ACTIONS ROW (HAPTIC) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                id="btn-action-view-map"
                onClick={() => { triggerVibrate(40); setSelectedTrailId(null); setActiveTab('mapa'); }}
                className="p-4 bg-white hover:bg-sky-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-3 bg-sky-100 text-sky-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 font-display">Mapa Interactivo</span>
              </button>
              
              <button
                id="btn-action-view-trails"
                onClick={() => { triggerVibrate(40); setActiveTab('senderos'); }}
                className="p-4 bg-white hover:bg-blue-50/55 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 font-display">2 Senderos Activos</span>
              </button>

              <button
                id="btn-action-view-biodiversidad"
                onClick={() => { triggerVibrate(40); setActiveTab('biodiversidad'); }}
                className="p-4 bg-white hover:bg-emerald-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 font-display">Biodiversidad</span>
              </button>

              <button
                id="btn-action-view-proyecto"
                onClick={() => { triggerVibrate(40); setActiveTab('proyecto'); }}
                className="p-4 bg-white hover:bg-slate-50/70 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Info className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 font-display">El Proyecto</span>
              </button>

              <button
                id="btn-action-view-time-form"
                onClick={() => { triggerVibrate(40); setActiveTab('tiempos'); }}
                className="p-4 bg-white hover:bg-amber-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 font-display">Registrar Tiempo</span>
              </button>

              <button
                id="btn-action-view-ranking"
                onClick={() => { triggerVibrate(40); setActiveTab('ranking'); }}
                className="p-4 bg-white hover:bg-orange-50/50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-all hover:shadow-xs cursor-pointer group"
              >
                <div className="p-3 bg-orange-100 text-orange-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 font-display">Tabla de Líderes</span>
              </button>
            </div>

            {/* SELECTION PREVIEW OF TRAILS */}
            <div className="space-y-3.5">
              <h3 className="font-extrabold text-base tracking-tight text-gray-800 font-display">Senderos Destacados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRAILS.slice(0, 2).map(t => (
                  <TrailCard key={t.id} trail={t} onViewOnMap={handleSelectTrailOnMap} />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SENDEROS (TRAILS EXPLORER) */}
        {activeTab === 'senderos' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 font-display">Explorador de Senderos Guardia Mitre</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Conoce los desniveles, distancias y puntos emblemáticos de las 2 rutas activas habilitadas por el consorcio de turismo.
                </p>
              </div>
              
              <button
                id="btn-senderos-direct-register"
                onClick={() => { triggerVibrate(50); setRegisteringTrailId(TRAILS[0].id); }}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-750 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Clock className="w-4.5 h-4.5" />
                Registrar Marca Directa
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRAILS.map(t => (
                <TrailCard 
                  key={t.id} 
                  trail={t} 
                  onViewOnMap={handleSelectTrailOnMap} 
                  onRegisterTime={(id) => { triggerVibrate(50); setRegisteringTrailId(id); }}
                />
              ))}
            </div>

            {/* If registeringTrailId is active (custom modal) */}
            {registeringTrailId && (
              <div id="register-time-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                <div className="w-full max-w-2xl relative my-8 animate-in zoom-in-95 duration-250">
                  <TimeForm 
                    preselectedTrailId={registeringTrailId} 
                    onTimeAdded={() => incrementRefreshRanks(true)}
                    onClose={() => setRegisteringTrailId(null)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: MAPA (GPS REALTIME) */}
        {activeTab === 'mapa' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 h-full">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 font-display">Senda bajo Control Satelital GPS</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Activa el "Modo Simple" para ocultar el mapa y priorizar el cronómetro y la batería.
                </p>
              </div>
              
              {/* Toggle para Modo Simple */}
              <button
                onClick={toggleSimpleMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapSimpleMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {mapSimpleMode ? 'Modo Simple: ON' : 'Modo Simple: OFF'}
              </button>
            </div>
            
            <MapModule 
              selectedTrailId={selectedTrailId} 
              onSelectTrail={setSelectedTrailId} 
              initialSimpleMode={mapSimpleMode}
            />
          </div>
        )}

        {/* VIEW 3-B: BIODIVERSIDAD (FLORA & FAUNA) */}
        {activeTab === 'biodiversidad' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <FloraGuide />
          </div>
        )}

        {/* VIEW 3-C: EL PROYECTO (SOBRE EL PROYECTO) */}
        {activeTab === 'proyecto' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <AboutProject />
          </div>
        )}

        {/* VIEW 4: TIMES FORM */}
        {activeTab === 'tiempos' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <TimeForm onTimeAdded={() => incrementRefreshRanks(false)} />
          </div>
        )}

        {/* VIEW 5: CLASS RANKINGS */}
        {activeTab === 'ranking' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-extrabold text-gray-800 font-display">Clasificación Histórica & Marcas Oficiales</h2>
              <p className="text-xs text-gray-500 mt-1">
                Tabla de líderes de Guardia Mitre organizada por rapidez e indexada por categorías.
              </p>
            </div>

            <RankingTable refreshTrigger={refreshRanks} />
          </div>
        )}

      </main>

      {/* Combined Institutional Footer */}
      <footer id="app-footer" className="bg-slate-900 text-white pt-8 pb-6 mt-12 text-xs">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Navegación Principal */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium">
            <a 
              href="#" 
              onClick={(e) => handleFooterNav(e, 'inicio')} 
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Inicio
            </a>
            <a 
              href="#" 
              onClick={(e) => handleFooterNav(e, 'senderos')} 
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Senderos
            </a>
            <a 
              href="#" 
              onClick={(e) => handleFooterNav(e, 'tiempos')} 
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Registrar Tiempo
            </a>
            <a 
              href="#" 
              onClick={(e) => handleFooterNav(e, 'ranking')} 
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Ranking
            </a>
            <a 
              href="#" 
              onClick={(e) => handleFooterNav(e, 'mapa')} 
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Mapa
            </a>
            <a 
              href="#" 
              onClick={(e) => handleFooterNav(e, 'biodiversidad')} 
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Flora y Fauna
            </a>
          </div>

          {/* Quick Info & Public Notices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 pb-2 text-[11px] text-slate-400 border-t border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                {/* Logo sin fondo blanco - transparente como en el header */}
                <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center p-0.5 shadow-xs overflow-hidden shrink-0">
                  <GMLogo className="w-full h-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs font-display">Municipalidad de Guardia Mitre</h4>
                </div>
              </div>
              <p className="leading-relaxed">
                Promoviendo el turismo de naturaleza y la educación ambiental en Río Negro.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs font-display">Contacto de Emergencia</h4>
              <p className="leading-relaxed">
                En caso de emergencia en los senderos, comunícate inmediatamente:
              </p>
              <div className="pt-0.5">
                <a 
                  href="tel:911" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold rounded-lg border border-red-500/20 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Emergencias: 911
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs font-display">Síguenos</h4>
              <ul className="space-y-1.5">
                <li>
                  <a 
                    href="https://www.facebook.com/MunicipalidadGM/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-blue-400"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    Facebook
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.instagram.com/muniguardiamitre" 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-pink-400"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Instagram
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://guardiamitre.gob.ar" 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-sky-400"
                  >
                    guardiamitre.gob.ar
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-slate-800 my-6"></div>

          {/* Información Legal y Créditos */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
            
            {/* Copyright */}
            <div className="text-center md:text-left space-y-1">
              <p>&copy; 2026 Municipalidad de Guardia Mitre. Todos los derechos reservados.</p>
            </div>

            {/* Developer Credits - Explicitly requested */}
            <div className="text-center md:text-right border-t border-slate-800/60 md:border-0 pt-4 md:pt-0">
              <p className="text-[10px] text-slate-500">
                Desarrollado por <span className="text-slate-300 font-medium">Gonzalo Baldomé</span> | Especialista en Soluciones Digitales
              </p>
            </div>
          </div>

          {/* Botón de Emergencia Flotante (Fijo en móvil) */}
          <a 
            href="tel:911" 
            className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-transform hover:scale-105 active:scale-95 z-50 flex items-center gap-2 animate-pulse"
            aria-label="Llamar a emergencias 911"
          >
            <Phone className="h-5 w-5 fill-current" />
            <span className="hidden sm:inline">EMERGENCIA 911</span>
            <span className="sm:hidden text-xs">911</span>
          </a>

        </div>
      </footer>

    </div>
  );
}