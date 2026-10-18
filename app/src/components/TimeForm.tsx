/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  Trophy, 
  CheckCircle, 
  Clock, 
  Calendar, 
  CloudSun, 
  MessageSquare, 
  User, 
  Compass, 
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TRAILS, CATEGORIES, GOOGLE_FORM_CONFIG } from '../data';

interface TimeFormProps {
  onTimeAdded: () => void;
  preselectedTrailId?: string | null;
  onClose?: () => void;
}

export default function TimeForm({ onTimeAdded, preselectedTrailId, onClose }: TimeFormProps) {
  // Local form state representing ALL Google Form variables
  const [nombre, setNombre] = useState('');
  const [sendero, setSendero] = useState('Monte Mitre - Dificultad Baja');
  const [tiempoMinutos, setTiempoMinutos] = useState<number>(30);
  const [clima, setClima] = useState('Soleado');
  const [comentarios, setComentarios] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(true);
  
  // Sports category (kept for beautiful local ranking styling metadata!)
  const [categoria, setCategoria] = useState(CATEGORIES[1]); // Default to 'Adulto (18 - 39)'

  // Date and hour starts state
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [horaInicio, setHoraInicio] = useState(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  // Submission control flow
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Synchronize preselectedTrailId if it changes
  useEffect(() => {
    if (preselectedTrailId) {
      if (preselectedTrailId === 'monte-mitre-baja' || preselectedTrailId === 'Monte Mitre - Dificultad Baja') {
        setSendero('Monte Mitre - Dificultad Baja');
      } else if (preselectedTrailId === 'monte-mitre-alta' || preselectedTrailId === 'Monte Mitre - Dificultad Alta') {
        setSendero('Monte Mitre - Dificultad Alta');
      }
    }
  }, [preselectedTrailId]);

  const triggerVibrate = (ms: number = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Compute breakdown of date and start hour
  const [fechaYear, fechaMonth, fechaDay] = fecha ? fecha.split('-') : ['', '', ''];
  const [horaHour, horaMinute] = horaInicio ? horaInicio.split(':') : ['', ''];

  // Convert minutes into HH:MM:SS for local Leaderboard compliance
  const getFormattedTimeForLocalList = (): string => {
    const hh = String(Math.floor(tiempoMinutos / 60)).padStart(2, '0');
    const mm = String(tiempoMinutos % 60).padStart(2, '0');
    const ss = '00';
    return `${hh}:${mm}:${ss}`;
  };

  const getFormattedDateToDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
  };

  const handleSubmit = (e: FormEvent) => {
    if (!terminosAceptados) {
      e.preventDefault();
      alert('Debes aceptar los términos para aparecer en la clasificación pública.');
      return;
    }
    triggerVibrate(60);
    setSubmitting(true);
    // Let browser native submit mechanism continue into target="google_form_target_iframe"
  };

  // Triggered when search loaded content
  const handleIframeLoad = () => {
    if (submitting) {
      setSubmitting(false);
      setSuccess(true);
      triggerVibrate(150);

      // 1. Instantly register in our localStorage database for immediate local display
      const cleanTime = getFormattedTimeForLocalList();
      const cleanDate = getFormattedDateToDisplay(fecha);

      const localUserRuns = JSON.parse(localStorage.getItem('saved_user_ranks') || '[]');
      const newRun = {
        id: 'local_' + Date.now(),
        name: nombre.trim(),
        category: categoria,
        time: cleanTime,
        trailName: sendero,
        date: cleanDate,
        isLocal: true,
      };

      localStorage.setItem('saved_user_ranks', JSON.stringify([newRun, ...localUserRuns]));

      // 2. Trigger parent callbacks
      onTimeAdded();
      
      // Auto close after 3 seconds if inside modal
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 3500);
      }
    }
  };

  return (
    <div id="times-form-container" className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
      
      {/* Hidden iframe that handles direct Google Forms submission without page redraw */}
      <iframe
        name="google_form_target_iframe"
        id="google_form_target_iframe"
        style={{ display: 'none' }}
        onLoad={handleIframeLoad}
        title="Google Form Response Transmitter"
      />

      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs border border-emerald-200">
            ✓
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-gray-900 font-display">¡Tiempo Registrado con Éxito!</h3>
            <p className="text-xs text-gray-400 font-medium max-w-sm">
              Tu marca se guardó de forma segura localmente y se transmitió de extremo a extremo al Formulario Oficial de Guardia Mitre.
            </p>
          </div>
          
          <div className="p-4 bg-zinc-950 text-white rounded-2xl text-[11px] font-mono leading-relaxed text-left w-full max-w-xs space-y-1 shadow-md border border-zinc-900">
            <p className="text-amber-400 font-extrabold uppercase tracking-wider text-[9px] mb-1">DETALLE DE MARCA VALIDADA</p>
            <p><span className="text-zinc-500">CORREDOR:</span> {nombre}</p>
            <p><span className="text-zinc-500">SENDERO:</span> {sendero}</p>
            <p><span className="text-zinc-500">TIEMPO:</span> {tiempoMinutos} min ({getFormattedTimeForLocalList()})</p>
            <p><span className="text-zinc-500">CLIMA:</span> {clima}</p>
            <p><span className="text-zinc-500">HORA INICIO:</span> {horaInicio}</p>
            <p><span className="text-zinc-500">FECHA:</span> {getFormattedDateToDisplay(fecha)}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              id="btn-add-another-time"
              onClick={() => {
                triggerVibrate();
                setSuccess(false);
                setNombre('');
                setTiempoMinutos(30);
                setComentarios('');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Registrar otra marca
            </button>
            {onClose && (
              <button
                id="btn-success-close"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Cerrar Ventana
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 font-display">Registrar Mi Marca de Tiempo</h3>
              </div>
              <p className="text-xs text-gray-500 max-w-xl">
                Completa tus datos reales de recorrido. Al presionar registrar se guardarán en la planilla y aparecerás en nuestro ranking.
              </p>
            </div>
            
            {onClose && (
              <button
                id="btn-form-cancel"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-500 cursor-pointer active:scale-95"
              >
                Cancelar
              </button>
            )}
          </div>

          <form
            action={`https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`}
            method="POST"
            target="google_form_target_iframe"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Real Form hidden fields mapping back to google forms exact structured keys */}
            <input type="hidden" name={GOOGLE_FORM_CONFIG.entries.fechaYear} value={fechaYear} />
            <input type="hidden" name={GOOGLE_FORM_CONFIG.entries.fechaMonth} value={fechaMonth} />
            <input type="hidden" name={GOOGLE_FORM_CONFIG.entries.fechaDay} value={fechaDay} />
            <input type="hidden" name={GOOGLE_FORM_CONFIG.entries.horaHour} value={horaHour} />
            <input type="hidden" name={GOOGLE_FORM_CONFIG.entries.horaMinute} value={horaMinute} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Runner Name (entry.969350065) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Tu nombre o apodo para el ranking público
                </label>
                <input
                  type="text"
                  id="nombre"
                  name={GOOGLE_FORM_CONFIG.entries.nombre}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez o Senderista2024"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Sendero Realizado (entry.49559792) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Sendero realizado
                </label>
                <select
                  id="sendero"
                  name={GOOGLE_FORM_CONFIG.entries.sendero}
                  value={sendero}
                  onChange={(e) => { triggerVibrate(); setSendero(e.target.value); }}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                >
                  <option value="Monte Mitre - Dificultad Baja">Monte Mitre - Dificultad Baja</option>
                  <option value="Monte Mitre - Dificultad Alta">Monte Mitre - Dificultad Alta</option>
                </select>
              </div>

              {/* Tiempo Total en minutos (entry.236869142) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Tiempo total (minutos)
                </label>
                <input
                  type="number"
                  id="tiempo"
                  name={GOOGLE_FORM_CONFIG.entries.tiempo}
                  value={tiempoMinutos}
                  onChange={(e) => setTiempoMinutos(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Ej: 45"
                  min="1"
                  max="999"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Fecha del recorrido */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Fecha del recorrido
                </label>
                <input
                  type="date"
                  id="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Hora de inicio */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Hora de inicio
                </label>
                <input
                  type="time"
                  id="hora-inicio"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Condicion del clima (entry.1090869712) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-blue-600" />
                  Condición del clima
                </label>
                <select
                  id="clima"
                  name={GOOGLE_FORM_CONFIG.entries.clima}
                  value={clima}
                  onChange={(e) => { triggerVibrate(); setClima(e.target.value); }}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                >
                  <option value="Soleado">Soleado</option>
                  <option value="Nublado">Nublado</option>
                  <option value="Lluvioso">Lluvioso</option>
                  <option value="Ventoso">Ventoso</option>
                </select>
              </div>

              {/* Deporte Categoria dropdown (Local Metadata only, highly visual for locals!) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-blue-600" />
                  Categoría Deportiva (local)
                </label>
                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => { triggerVibrate(); setCategoria(e.target.value); }}
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comentarios (entry.1586715887) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Comentarios (opcional)
                </label>
                <textarea
                  id="comentarios"
                  name={GOOGLE_FORM_CONFIG.entries.comentarios}
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comparte tu experiencia en los senderos..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Terminos y condiciones (entry.871715811) */}
              <div className="md:col-span-2 py-1">
                <label className="flex items-start gap-2.5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    id="terminos"
                    name={GOOGLE_FORM_CONFIG.entries.terminos}
                    value="Acepto"
                    checked={terminosAceptados}
                    onChange={(e) => setTerminosAceptados(e.target.checked)}
                    required
                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 select-none">
                    Acepto que mi nombre y tiempo aparezcan públicamente en el ranking oficial de Monte Mitre.
                  </span>
                </label>
              </div>

            </div>


            {/* Submit Button */}
            <button
              type="submit"
              id="submit-form-time"
              disabled={submitting || !nombre.trim() || !terminosAceptados}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 fill-current text-white/90" />
              {submitting ? 'Transmitiendo Marca...' : 'Registrar Tiempo de Caminata'}
            </button>

          </form>
        </>
      )}

    </div>
  );
}
