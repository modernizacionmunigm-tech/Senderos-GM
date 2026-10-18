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
import { INITIAL_RANKINGS, TRAILS, CATEGORIES, DEFAULT_GOOGLE_SHEET_CSV_URL } from '../data';

interface RankingTableProps {
  refreshTrigger: number;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
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
    if (!DEFAULT_GOOGLE_SHEET_CSV_URL || !DEFAULT_GOOGLE_SHEET_CSV_URL.trim()) {
      setSheetRecords([]);
      return;
    }

    setIsLoading(true);
    setSyncError(null);

    try {
      const response = await fetch(DEFAULT_GOOGLE_SHEET_CSV_URL);
      if (!response.ok) {
        throw new Error(`Error al cargar datos (Código: ${response.status})`);
      }

      const csvContent = await response.text();
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        setSheetRecords([]);
        return;
      }

      // Detect delimiter
      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const delimiter = semicolonCount > commaCount ? ';' : ',';

      const headers = parseCSVLine(firstLine, delimiter).map(h => h.trim().toLowerCase());

      // Find column indices based on YOUR sheet structure
      let timestampIdx = headers.findIndex(h => h.includes('marca') || h.includes('timestamp'));
      let nameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('apodo'));
      let trailIdx = headers.findIndex(h => h.includes('sendero') || h.includes('recorrido'));
      let timeMinutesIdx = headers.findIndex(h => h.includes('tiempo') && h.includes('minuto'));
      let dateIdx = headers.findIndex(h => h.includes('fecha') && h.includes('recorrido'));
      let hourIdx = headers.findIndex(h => h.includes('hora') && h.includes('inicio'));
      let categoryIdx = headers.findIndex(h => h.includes('categor'));

      // Fallback indices
      if (timestampIdx === -1) timestampIdx = 0;
      if (nameIdx === -1) nameIdx = 1;
      if (trailIdx === -1) trailIdx = 2;
      if (timeMinutesIdx === -1) timeMinutesIdx = 3;
      if (dateIdx === -1) dateIdx = 4;
      if (hourIdx === -1) hourIdx = 5;

      const results: TimeRecord[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i], delimiter);
        if (columns.length < 2) continue;

        const nameValue = columns[nameIdx] || '';
        if (!nameValue || nameValue.trim() === '' || nameValue.toLowerCase().includes('nombre')) continue;

        // Get trail name
        const trailName = columns[trailIdx] || 'Sendero General';

        // Extract date from "Fecha del Recorrido" column
        let dateValue = columns[dateIdx] || '';
        if (!dateValue) {
          // Fallback: extract from timestamp
          const rawTimestamp = columns[timestampIdx] || '';
          if (rawTimestamp) {
            const spaceIndex = rawTimestamp.indexOf(' ');
            dateValue = spaceIndex !== -1 ? rawTimestamp.substring(0, spaceIndex) : rawTimestamp;
          } else {
            dateValue = new Date().toLocaleDateString('es-AR');
          }
        }

        // Convert minutes to HH:MM:SS format
        let timeValue = '00:00:00';
        const minutesStr = columns[timeMinutesIdx] || '0';
        const totalMinutes = parseInt(minutesStr.replace(/[^0-9]/g, ''), 10);
        
        if (!isNaN(totalMinutes) && totalMinutes > 0) {
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          timeValue = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
        }

        // Get category (fallback to "GENERAL" if not found)
        let category = 'GENERAL';
        if (categoryIdx !== -1 && columns[categoryIdx]) {
          category = columns[categoryIdx];
        } else if (trailName.toLowerCase().includes('baja')) {
          category = 'GENERAL';
        } else if (trailName.toLowerCase().includes('alta')) {
          category = 'MONTE';
        }

        results.push({
          id: `sheet_row_${i}_${Date.now()}`,
          name: nameValue.trim(),
          category: category,
          time: timeValue,
          trailName: trailName,
          date: dateValue,
          isLocal: false
        });
      }

      setSheetRecords(results);
      localStorage.setItem('cached_sheet_ranks', JSON.stringify(results));

    } catch (err: any) {
      console.error(err);
      setSyncError('Error al sincronizar con la planilla');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Merge data
  useEffect(() => {
    const localUserRuns = JSON.parse(localStorage.getItem('saved_user_ranks') || '[]');
    
    const sheetUniqueKeys = new Set(sheetRecords.map(r => `${r.name.toLowerCase()}_${r.trailName.toLowerCase()}_${r.date}`));
    
    const filteredBaseline = INITIAL_RANKINGS.filter(mock => {
      const key = `${mock.name.toLowerCase()}_${mock.trailName.toLowerCase()}_${mock.date}`;
      return !sheetUniqueKeys.has(key);
    });

    const combined = [...localUserRuns, ...sheetRecords, ...filteredBaseline];
    setRecords(combined);
  }, [refreshTrigger, sheetRecords]);

  // Auto-fetch on load
  useEffect(() => {
    if (DEFAULT_GOOGLE_SHEET_CSV_URL && DEFAULT_GOOGLE_SHEET_CSV_URL.trim()) {
      handleFetchSheet();
    }
  }, []);

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
      
      if (searchTerm && !rec.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      return true;
    })
    .sort((a, b) => timeToSeconds(a.time) - timeToSeconds(b.time));

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
          {DEFAULT_GOOGLE_SHEET_CSV_URL && (
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
                        <span>{rec.name}</span>
                        {isLocal && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-700 rounded text-[9px] font-bold uppercase">Tú</span>
                        )}
                      </div>
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
        <p className="font-display">Total de marcas: <strong className="text-gray-600">{filteredRecords.length}</strong></p>
      </div>
    </div>
  );
}