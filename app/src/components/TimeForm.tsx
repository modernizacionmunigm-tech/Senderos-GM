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
  Mail
} from 'lucide-react';
import { TRAILS, CATEGORIES } from '../data';
import { formatSeconds, getRunnerName, getRunnerCategory, saveRunnerName, saveRunnerCategory, submitMark } from '../corredor';
import { isApiConfigured, type CaptchaAnswer } from '../api';
import Captcha from './Captcha';
import PrivacyNotice from './PrivacyNotice';

interface TimeFormProps {
  onTimeAdded: () => void;
  preselectedTrailId?: string | null;
  onClose?: () => void;
}

export default function TimeForm({ onTimeAdded, preselectedTrailId, onClose }: TimeFormProps) {
  // Local form state representing ALL Google Form variables
  const [nombre, setNombre] = useState(() => getRunnerName());
  const [sendero, setSendero] = useState('Monte Mitre - Dificultad Baja');
  const [tiempoMinutos, setTiempoMinutos] = useState<number>(30);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);
  /** El tiempo siempre se maneja en segundos, que es lo que entiende la tabla. */
  const totalSegundos = tiempoMinutos * 60 + tiempoSegundos;
  const [clima, setClima] = useState('Soleado');
  const [comentarios, setComentarios] = useState('');
  const [email, setEmail] = useState('');
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaAnswer | null>(null);
  const [queued, setQueued] = useState(false);
  const [startedAt] = useState(() => Date.now());
  
  // Categoría deportiva: se usa para la tabla y se guarda en su columna.
  const [categoria, setCategoria] = useState(() => getRunnerCategory() || CATEGORIES[1]);

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
      const trail = TRAILS.find(t => t.id === preselectedTrailId || t.name === preselectedTrailId);
      if (trail) setSendero(trail.name);
    }
  }, [preselectedTrailId]);

  const triggerVibrate = (ms: number = 40) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Convertir el tiempo a HH:MM:SS para la tabla
  const getFormattedTimeForLocalList = (): string => formatSeconds(totalSegundos);

  const getFormattedDateToDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!terminosAceptados) {
      alert('Necesitamos tu consentimiento para publicar la marca.');
      return;
    }
    if (totalSegundos <= 0) {
      alert('Poné cuánto tardaste: los minutos y los segundos.');
      return;
    }
    if (!isApiConfigured) {
      alert('El ranking todavía no está configurado. Avisá al Área de Modernización.');
      return;
    }
    if (!captcha) {
      alert('Resolvé la verificación anti-bots para continuar.');
      return;
    }

    triggerVibrate(60);
    setSubmitting(true);
    setQueued(false);

    const result = await submitMark({
      name: nombre.trim(),
      trailName: sendero,
      seconds: totalSegundos,
      dateISO: fecha,
      startTime: horaInicio,
      weather: clima,
      category: categoria,
      comments: comentarios,
      email: email.trim(),
      captcha,
      elapsedMs: Date.now() - startedAt,
    });

    saveRunnerName(nombre.trim());
    saveRunnerCategory(categoria);
    setSubmitting(false);
    setQueued(result === 'en_cola');
    setSuccess(true);
    triggerVibrate(150);
    onTimeAdded();

    if (onClose) {
      setTimeout(onClose, 3500);
    }
  };

  return (
    <div id="times-form-container" className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
      
      {success ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs border border-emerald-200">
            ✓
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-gray-900 font-display">¡Tiempo Registrado con Éxito!</h3>
            <p className="text-xs text-gray-400 font-medium max-w-sm">
              {queued
                ? 'Tu marca quedó guardada en este teléfono y se enviará sola cuando vuelva la señal.'
                : 'Tu marca se envió al ranking oficial de Monte Mitre.'}
            </p>
          </div>
          
          <div className="hc-dark p-4 bg-zinc-950 text-white rounded-2xl text-[11px] font-mono leading-relaxed text-left w-full max-w-xs space-y-1 shadow-md border border-zinc-900">
            <p className="text-amber-400 font-extrabold uppercase tracking-wider text-[9px] mb-1">DETALLE DE MARCA VALIDADA</p>
            <p><span className="text-zinc-500">CORREDOR:</span> {nombre}</p>
            <p><span className="text-zinc-500">SENDERO:</span> {sendero}</p>
            <p><span className="text-zinc-500">TIEMPO:</span> {tiempoMinutos} min {tiempoSegundos} s ({getFormattedTimeForLocalList()})</p>
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
                setQueued(false);
                setCaptcha(null);
                setNombre('');
                setTiempoMinutos(30);
                setTiempoSegundos(0);
                setComentarios('');
                setEmail('');
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
                Completa tus datos reales de recorrido. Al registrar, tu marca se envía al ranking oficial; si no hay señal, queda en tu teléfono y se sube después.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nombre o apodo */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Tu nombre y apellido (se publica el primer nombre y las iniciales)
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Daniela Pérez"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Sendero */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Sendero realizado
                </label>
                <select
                  id="sendero"
                  value={sendero}
                  onChange={(e) => { triggerVibrate(); setSendero(e.target.value); }}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                >
                  {TRAILS.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Tiempo: minutos y segundos. La planilla los guarda en dos
                  columnas (o en minutos con decimales mientras la pregunta de
                  segundos no exista en el Formulario). */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Tiempo total
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      id="tiempo"
                      value={tiempoMinutos}
                      onChange={(e) => setTiempoMinutos(Math.min(999, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder="0"
                      min="0"
                      max="999"
                      aria-label="Minutos"
                      className="w-full pl-3 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">min</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      id="tiempo-segundos"
                      value={tiempoSegundos}
                      onChange={(e) => setTiempoSegundos(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder="0"
                      min="0"
                      max="59"
                      aria-label="Segundos"
                      className="w-full pl-3 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">seg</span>
                  </div>
                </div>
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

              {/* Condición del clima */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-blue-600" />
                  Condición del clima
                </label>
                <select
                  id="clima"
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

              {/* Categoría deportiva: viaja como campo propio a Apps Script. */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-blue-600" />
                  Categoría deportiva
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

              {/* Comentario: se guarda y se publica sólo si lo aprueban. */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Comentario (opcional, se publica si lo aprueban)
                </label>
                <textarea
                  id="comentarios"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comparte tu experiencia en los senderos..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              {/* Email opcional: sólo interno, para verificar una baja. */}
              <div className="space-y-1.5 md:col-span-2">
                <label
                  htmlFor="email"
                  className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Email (opcional, no se publica)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  maxLength={120}
                  className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-800"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Captcha onChange={setCaptcha} idPrefix="time-form" />
                <PrivacyNotice />
              </div>

              {/* Consentimiento */}
              <div className="md:col-span-2 py-1">
                <label className="flex items-start gap-2.5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    id="terminos"
                    checked={terminosAceptados}
                    onChange={(e) => setTerminosAceptados(e.target.checked)}
                    required
                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500 select-none">
                    Acepto que mi primer nombre y las iniciales de las demás palabras (por ejemplo,
                    “Daniela P.” o “Daniela P. G.”), sendero, tiempo, categoría y fecha aparezcan en
                    el ranking público. Si soy menor, lo hago con autorización de un
                    adulto responsable. Los comentarios se publican sólo si
                    Modernización los aprueba. El email es opcional y no se publica.
                  </span>
                </label>
              </div>

            </div>


            {/* Submit Button */}
            <button
              type="submit"
              id="submit-form-time"
              disabled={submitting || !nombre.trim() || !terminosAceptados || !captcha}
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
