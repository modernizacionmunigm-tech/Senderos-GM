/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Search, 
  Star, 
  RotateCcw, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { TimeRecord } from '../types';
import { TRAILS, CATEGORIES } from '../data';
import { isApiConfigured, loadRankings } from '../api';

interface RankingTableProps {
  refreshTrigger: number;
}

/** "19/10/2026" y "2026-10-19" tienen que compararse igual. */
function dayKey(value: string): string {
  const text = (value || '').trim();
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return text.toLowerCase();
}

/** "2026-10" para comparar contra el mes que muestra el ranking. */
function monthKey(value: string): string {
  return dayKey(value).slice(0, 7);
}

/** Misma regla que la API: primer nombre completo y inicial de cada palabra siguiente. */
function publicName(value: string): string {
  const text = (value || '').trim().replace(/^'+/, '').replace(/\s+/g, ' ');
  if (!text) return 'Participante';
  const parts = text.split(' ');
  const initials = parts.slice(1).map((part) => `${part.charAt(0).toUpperCase()}.`);
  return `${parts[0]}${initials.length ? ` ${initials.join(' ')}` : ''}`.slice(0, 40);
}

export default function RankingTable({ refreshTrigger }: RankingTableProps) {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [filterTrail, setFilterTrail] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sheetRecords, setSheetRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const triggerVibrate = (ms: number = 30) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleResetFilters = () => {
    triggerVibrate();
    setFilterTrail('');
    setFilterCategory('');
    setSearchTerm('');
  };

  const handleFetchSheet = useCallback(async () => {
    if (!isApiConfigured) {
      setSheetRecords([]);
      setSyncError('El ranking todavía no está configurado.');
      return;
    }

    setIsLoading(true);
    setSyncError(null);

    try {
      const results = await loadRankings();
      setSheetRecords(results);
      localStorage.setItem('cached_sheet_ranks', JSON.stringify(results));
    } catch (err) {
      console.error(err);
      setSyncError('No se pudo actualizar el ranking. Probá de nuevo en unos minutos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Merge data
  useEffect(() => {
    const storedRuns = JSON.parse(localStorage.getItem('saved_user_ranks') || '[]');
    const allLocalRuns: any[] = Array.isArray(storedRuns) ? storedRuns : [];

    // El ranking es del mes calendario: las marcas viejas guardadas en el
    // teléfono no se siguen mostrando cuando cambia el mes.
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const localUserRuns = allLocalRuns.filter(
      (run) => monthKey(String(run?.date || '')) === currentMonth
    );

    const markKey = (run: { name?: string; trailName?: string; date?: string }) =>
      `${publicName(run.name || '').toLowerCase()}|${(run.trailName || '').trim().toLowerCase()}|${dayKey(run.date || '')}`;

    // Una marca del cronómetro se ve primero local y después aparece en la
    // planilla: cuando ya está en la planilla mostramos la local (que trae la
    // categoría y el "Tú"), pero le sumamos el comentario sólo si fue aprobado.
    const sheetByKey = new Map<string, TimeRecord>(
      sheetRecords.map((row) => [markKey(row), row] as const)
    );
    const localWithModeration = localUserRuns.map((run) => {
      const sheet = sheetByKey.get(markKey(run));
      return sheet?.comment ? { ...run, comment: sheet.comment } : run;
    });

    const localKeys = new Set(localUserRuns.map(markKey));
    const sheetOnly = sheetRecords.filter((row) => !localKeys.has(markKey(row)));

    const combined = [...localWithModeration, ...sheetOnly];
    setRecords(combined);
  }, [refreshTrigger, sheetRecords]);

  // Auto-fetch on load
  useEffect(() => {
    handleFetchSheet();
  }, [handleFetchSheet]);

  const timeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 999999;
  };

  const filteredRecords = records
    .filter((rec) => {
      if (filterTrail && rec.trailName !== filterTrail) return false;
      
      if (filterCategory) {
        const normalizedCategory = filterCategory.split(' ')[0].toLowerCase();
        if (!rec.category.toLowerCase().includes(normalizedCategory)) return false;
      }
      
      if (searchTerm && !publicName(rec.name).toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    })
    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));

  const monthName = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  const monthTitle = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div id="rankings-table-module" className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 md:p-6 space-y-6">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-50/40 p-4 rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar corredor..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700"
            />
          </div>

          <div className="relative">
            <select
              value={filterTrail}
              onChange={(e) => { triggerVibrate(); setFilterTrail(e.target.value); }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los Senderos</option>
              {TRAILS.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => { triggerVibrate(); setFilterCategory(e.target.value); }}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las Categorías</option>
              {CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isApiConfigured && (
            <button
              onClick={() => { triggerVibrate(50); handleFetchSheet(); }}
              disabled={isLoading}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reestablecer
          </button>
        </div>
      </div>

      {syncError && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <p className="text-[11px] font-semibold text-gray-500">
          Ranking de {monthTitle}
        </p>
        <p className="text-[10px] text-gray-400">
          La planilla conserva el historial completo de todos los meses.
        </p>
      </div>

      <div id="table-scroll-container" className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
              <th className="py-3.5 px-4 text-center w-16">Posición</th>
              <th className="py-3.5 px-4">Corredor</th>
              <th className="py-3.5 px-4">Sendero</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4 text-center">Tiempo</th>
              <th className="py-3.5 px-4">Fecha</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 text-xs">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec, idx) => {
                const position = idx + 1;
                const isLocal = rec.isLocal;

                return (
                  <tr 
                    key={rec.id} 
                    className={`hover:bg-gray-50/40 transition-colors ${
                      isLocal 
                        ? 'bg-amber-50/40 hover:bg-amber-50/60 font-semibold text-gray-900' 
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {position === 1 ? (
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">🏆</div>
                        ) : position === 2 ? (
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">🥈</div>
                        ) : position === 3 ? (
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">🥉</div>
                        ) : (
                          <span className="font-mono text-gray-500">{position}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span>{publicName(rec.name)}</span>
                        {isLocal && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-700 rounded text-[9px] font-bold uppercase">Tú</span>
                        )}
                      </div>
                      {rec.comment && (
                        <p className="mt-1 max-w-[280px] text-[10px] font-normal italic leading-snug text-gray-500 break-words">
                          “{rec.comment}”
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-display font-medium">
                      {rec.trailName}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium uppercase font-display">
                        {rec.category.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">
                      {rec.time}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 font-mono">
                      {rec.date}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Trophy className="w-8 h-8 text-gray-300" />
                    <p className="text-sm font-semibold">No se encontraron marcas de tiempo</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-gray-400 py-1 bg-gray-50/50 rounded-lg px-4 border border-gray-50">
        <p className="font-display">Total de marcas del mes: <strong className="text-gray-600">{filteredRecords.length}</strong></p>
      </div>
    </div>
  );
}