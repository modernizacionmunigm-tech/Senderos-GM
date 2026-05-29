/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import { Menu, X, Home, Map, Trophy, Compass, Clock, Leaf, Info } from 'lucide-react';
import { GMLogo } from './Logos';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export default function Header({ activeTab, onSelectTab }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Control body scroll lock when open vs closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const triggerVibrate = (ms: number = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleNavClick = (tabId: string) => {
    triggerVibrate(30);
    onSelectTab(tabId);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    triggerVibrate();
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'senderos', label: 'Senderos', icon: Compass },
    { id: 'mapa', label: 'Mapa', icon: Map },
    { id: 'tiempos', label: 'Registrar Tiempo', icon: Clock },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
    { id: 'biodiversidad', label: 'Flora y Fauna', icon: Leaf },
    { id: 'proyecto', label: 'Sobre el Proyecto', icon: Info },
  ];

  return (
    <>
      {/* Top Banner & Header Wrapper */}
      <header id="app-institutional-header" className="relative bg-[#2563ea] text-white z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo and Brand Title Row */}
          <div 
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* White round container for GMLogo to stand out */}
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
              <GMLogo className="w-full h-full" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-xl md:text-2xl tracking-tight leading-none animate-fade-in">
                Municipalidad de Guardia Mitre
              </h1>
              <p className="text-[10px] sm:text-xs text-blue-100 font-medium tracking-wide mt-1">
                Río Negro, Argentina
              </p>
            </div>
          </div>

          {/* Hamburger Menu Trigger for Mobile */}
          <button
            id="btn-hamburger-toggle"
            onClick={toggleMenu}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Horizontal Navigation Row for Desktop (always visible on md+) or horizontal swiper on mobile */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden md:flex items-center py-2.5 gap-1.5">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-desktop-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none cursor-pointer ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-xs font-bold' 
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* In Mobile View, instead of drawer only, we show a clean secondary horizontal scrolling navbar for instant access */}
            <nav className="md:hidden flex items-center overflow-x-auto py-2 gap-1.5 no-scrollbar scroll-smooth">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-mobile-scroll-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-1.5 whitespace-nowrap rounded-lg text-xs font-semibold transition-all select-none cursor-pointer shrink-0 ${
                      isActive 
                        ? 'bg-white/20 text-white font-bold' 
                        : 'text-blue-100/90 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Floating Hamburguesa Menu Overlay sliding from right */}
      <div 
        id="sidebar-overlay-backdrop"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div 
        id="hamburger-slider"
        className={`fixed top-0 bottom-0 right-0 w-[270px] bg-[#1e3a8a] text-white shadow-2xl z-50 md:hidden transition-transform duration-300 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Header of Drawer */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-xs overflow-hidden shrink-0">
                <GMLogo className="w-full h-full" />
              </div>
              <span className="font-extrabold text-xs tracking-widest text-blue-100 uppercase font-mono">MENÚ</span>
            </div>
            <button
              id="btn-sidebar-close"
              onClick={toggleMenu}
              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-100 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-mobile-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors text-left cursor-pointer ${
                    isActive 
                      ? 'bg-white/20 text-white font-bold' 
                      : 'text-blue-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info stamp Drawer Footer */}
        <div className="p-5 border-t border-white/10 bg-black/20 space-y-1.5 text-center">
          <p className="text-[10px] font-bold text-blue-200 tracking-wider">GUARDIA MITRE, RÍO NEGRO</p>
          <p className="text-[9px] text-blue-300 font-mono">App Móvil PWA v1.2.0</p>
        </div>
      </div>
    </>
  );
}

