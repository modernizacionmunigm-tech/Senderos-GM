import React from 'react';

// GUARDIA MITRE LOGO PNG (Usa directamente el logo en PNG cargado sin SVG o fallbacks de error)
export function GMLogo({ className = "w-10 h-10" }: { className?: string }) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <span className="text-xs font-semibold text-white/90 bg-white/10 px-2.5 py-1 rounded-md border border-white/10 select-none">
        Logo Institucional
      </span>
    );
  }

  return (
    <img 
      src="./assets/img/logo-guardia-mitre.png" 
      alt="Logo Institucional" 
      className={`${className} object-contain`} 
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
}
