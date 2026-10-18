/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = () => {
      return (
        ['iPadSimulator', 'iPhoneSimulator', 'iPodSimulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
        // iPad on iOS 13+
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
      );
    };
    setIsIOS(isIosDevice());

    // Listen for default prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show a small, discrete nudge manually after 5 seconds for demonstration purposes in sandboxed preview contexts
    const timer = setTimeout(() => {
      if (!deferredPrompt && !localStorage.getItem('pwa_dismissed')) {
        setShowBanner(true);
      }
    }, 6000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const triggerVibration = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleInstallClick = async () => {
    triggerVibration();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowBanner(false);
    } else {
      // Direct instruction fallback or simulation callback
      alert(
        isIOS 
          ? 'En iOS/Safari: Toca el botón "Compartir" de la barra de navegación de tu navegador y selecciona "Agregar a Inicio" para instalar la app.' 
          : 'Para instalar Senderos Guardia Mitre como una aplicación móvil de alto rendimiento: Toca los tres puntos de tu navegador (menú) y pulsa "Instalar Aplicación" o "Agregar a la pantalla de inicio".'
      );
    }
  };

  const handleDismiss = () => {
    triggerVibration();
    setShowBanner(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div id="pwa-install-banner" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl shadow-2xl z-50 flex items-start gap-3.5 animate-bounce-short">
      <div className="p-2.5 bg-brand-600 rounded-lg text-white mt-1 shrink-0">
        <Smartphone className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="font-bold text-sm text-zinc-100 font-display">Instalar Senderos GM</h4>
          <span className="px-1.5 py-0.5 bg-brand-600/20 text-brand-200 text-[10px] font-semibold tracking-wider uppercase rounded-full">offline</span>
        </div>
        <p className="text-xs text-zinc-300 mt-1">
          {isIOS 
            ? 'Accede más rápido como una aplicación móvil nativa. Toca Compartir y selecciona Agregar a Inicio.' 
            : 'Guarda mapas de senderos de Guardia Mitre offline, navega con GPS sin señal y registra tus tiempos.'}
        </p>
        
        <div className="flex items-center gap-2 mt-3.5">
          <button
            id="btn-pwa-install"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            {isIOS ? 'Cómo de Instalar' : 'Instalar ahora'}
          </button>
          
          <button
            id="btn-pwa-dismiss"
            onClick={handleDismiss}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Quizás luego
          </button>
        </div>
      </div>

      <button
        id="btn-pwa-close"
        onClick={handleDismiss}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        aria-label="Cerrar aviso de instalación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
