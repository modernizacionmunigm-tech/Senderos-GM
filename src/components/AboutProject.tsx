/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, BookOpen, Award, CheckCircle, MapPin, Heart, Shield, Compass } from 'lucide-react';
import { GMLogo } from './Logos';

export default function AboutProject() {
  const triggerVibrate = (ms: number = 30) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  return (
    <div id="about-project-page" className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 sm:p-10 shadow-lg border border-blue-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent)] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4 flex-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-200 text-xs font-bold rounded-full border border-blue-500/30">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-red-400" />
            Iniciativa para la Salud y la Comunidad
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight">
            Proyecto "Monte Mitre"
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Propuesta de creación y puesta en valor de senderos naturales destinados a promover la vida activa, el bienestar vecinal y el disfrute responsable de Guardia Mitre.
          </p>
        </div>

        {/* Brand Logo inside hero of About page */}
        <div className="relative z-10 hidden md:flex flex-col items-center gap-2 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 select-none shrink-0 animate-in fade-in duration-500">
          <GMLogo className="w-12 h-12" />
          <span className="text-[9px] uppercase font-bold text-sky-300 tracking-widest font-mono">Guardia Mitre</span>
        </div>
      </div>

      {/* Main Narrative Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column - Genesis and Objectives (takes 2 columns) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-lg font-bold text-gray-800 font-display flex items-center gap-2 pb-3 border-b border-gray-100">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Génesis del Proyecto
            </h3>
            
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
              El presente proyecto, elaborado por los estudiantes de Educación Física <strong className="text-gray-800">Chazarreta Alan</strong>, <strong className="text-gray-800">Haure Milena</strong> y <strong className="text-gray-800">Ramírez Sergio</strong>, propone la creación y puesta en valor del Sendero “Monte Mitre”, un space natural destinado a la comunidad de Guardia Mitre.
            </p>
            
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
              Esta iniciativa surge como una propuesta orientada a promover la actividad física, el contacto con la naturaleza y el fortalecimiento del sentido de pertenencia comunitaria, a través de la creación de un sendero accesible, seguro y desafiante.
            </p>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
              La visión se cimenta en la revalorización de rincones silvestres que antes carecían de senderos marcados, permitiendo a niños, jóvenes y adultos mayores caminar sobre senderos de llanuras, médanos y montes con total seguridad y con fines recreativos y educativos.
            </p>
          </div>

          {/* Pillars of the Project */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-150 text-emerald-700 flex items-center justify-center mx-auto">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-gray-800 uppercase font-display">Salud Integral</h4>
              <p className="text-[10px] text-gray-500 leading-normal">Combate el sedentarismo promoviendo caminatas y trekking de bajo impacto en senderos locales.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-gray-800 uppercase font-display">Identidad Local</h4>
              <p className="text-[10px] text-gray-500 leading-normal">Fomenta el arraigo mediante el redescubrimiento de la flora nativa y los hitos del pueblo.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-gray-800 uppercase font-display">Sustentabilidad</h4>
              <p className="text-[10px] text-gray-500 leading-normal">Concientización y preservación de la biodiversidad de este valioso ecosistema fluvial patagónico.</p>
            </div>
          </div>
        </div>

        {/* Right column - Students Authors cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-800 font-display flex items-center gap-2 pb-2 border-b border-gray-100">
              <Users className="w-4 h-4 text-emerald-600" />
              Estudiantes Autores
            </h3>
            
            <div className="space-y-3">
              {[
                { name: 'Alan Chazarreta', title: 'Ed. Física' },
                { name: 'Milena Haure', title: 'Ed. Física' },
                { name: 'Sergio Ramírez', title: 'Ed. Física' }
              ].map((student, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50/55 rounded-xl border border-gray-100">
                  <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{student.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Estudiante de {student.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Credit line details */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200/30 flex flex-col items-center justify-center gap-2">
            <GMLogo className="w-10 h-10 opacity-90" />
            <div>
              <p className="text-[10px] text-gray-400">Implementación Digital del Proyecto</p>
              <p className="text-xs font-bold text-gray-700 font-display mt-0.5">Municipalidad de Guardia Mitre</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1 font-mono">Hecho por Gonzalo Baldomé</p>
            </div>
          </div>
        </div>

      </div>

      {/* Sponsoring Institutions Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-gray-800 font-display flex items-center gap-2 pb-3 border-b border-gray-100">
          <Award className="w-5 h-5 text-blue-600" />
          Instituciones Promotoras e Impulsoras
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Institutional Card 1 - Municipalidad */}
          <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-600/10 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <GMLogo className="w-12 h-12 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800 leading-tight">Municipalidad de Guardia Mitre</h4>
                  <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block">Gestión Municipal</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-normal font-sans">
                Impulso fundamental e institucional en la planificación, dotación de herrajes, guardaparques iniciales y mantenimiento de la traza para el uso del pueblo de Guardia Mitre.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              Respaldo Administrativo y Logístico
            </div>
          </div>

          {/* Institutional Card 2 - Area de Deportes */}
          <div className="p-5 bg-orange-50/20 rounded-2xl border border-orange-600/10 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Award className="w-12 h-12 text-orange-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800 leading-tight">Área de Deporte Guardia Mitre</h4>
                  <span className="text-[9px] text-orange-700 font-bold uppercase tracking-wider block">Prof. Denis Evans - Director</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-normal">
                Esta iniciativa, orientada a promover la actividad física y el contacto con la naturaleza, cuenta con el impulso y respaldo del Área de Deportes de la Municipalidad, bajo la gestión de su director, el Profesor Denis Evans.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-700">
              <CheckCircle className="w-3.5 h-3.5 text-orange-600" />
              Promoción de la Salud y Vida Activa
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
