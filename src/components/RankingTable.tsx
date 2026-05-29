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
  Medal, 
  RefreshCw, 
  FileSpreadsheet, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2,
  Database,
  ExternalLink
} from 'lucide-react';
import { TimeRecord } from '../types';
import { INITIAL_RANKINGS, TRAILS, CATEGORIES, DEFAULT_GOOGLE_SHEET_CSV_URL } from '../data';

interface RankingTableProps {
  refreshTrigger: number;
}

// Custom inline CSV line parsing logic to support commas or semicolons safely combined with quotes
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

  // Google Sheets state
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('ranking_sheet_csv_url') || DEFAULT_GOOGLE_SHEET_CSV_URL || '';
  });
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sheetRecords, setSheetRecords] = useState<TimeRecord[]>(() => {
    const cached = localStorage.getItem('cached_sheet_ranks');
    return cached ? JSON.parse(cached) : [];
  });

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

  // Main fetch function to download and parse values from public published CSV URL
  const handleFetchSheet = useCallback(async (customUrl?: string) => {
    const urlToFetch = customUrl !== undefined ? customUrl : sheetUrl;
    if (!urlToFetch || !urlToFetch.trim()) {
      setSheetRecords([]);
      localStorage.removeItem('cached_sheet_ranks');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSyncSuccess(false);

    try {
      // Validate CSV format in a basic way
      if (!urlToFetch.includes('pub?output=csv') && !urlToFetch.includes('export?format=csv')) {
        throw new Error('El enlace provisto no parece ser de formato exportable de Excel/Hojas de cálculo (.csv). Revisa los pasos de la guía.');
      }

      const response = await fetch(urlToFetch);
      if (!response.ok) {
        throw new Error(`Servidor de Google denegó la petición (Código: ${response.status}). Asegúrate de haber publicado la planilla correcta.`);
      }

      const csvContent = await response.text();
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        setSheetRecords([]);
        localStorage.removeItem('cached_sheet_ranks');
        return;
      }

      // Automatically identify if we are processing commas (US localization) or semicolons (ES decimal localizations)
      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const delimiter = semicolonCount > commaCount ? ';' : ',';

      const headers = parseCSVLine(firstLine, delimiter).map(h => h.trim().toLowerCase());

      // Try substring matching to find correct spreadsheet mapping elements
      let timestampIdx = headers.findIndex(h => h.includes('marca') || h.includes('fecha') || h.includes('timestamp') || h.includes('hora'));
      let nameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('apellido') || h.includes('corredor') || h.includes('participante'));
      let categoryIdx = headers.findIndex(h => h.includes('categor'));
      let trailIdx = headers.findIndex(h => h.includes('sendero') || h.includes('camino') || h.includes('recorrido'));
      let timeIdx = headers.findIndex(h => h.includes('tiempo') || h.includes('marca') || h.includes('duraci') || h.includes('cronometro') || h.includes('oficial'));

      // If headers cannot be auto-detected, we safely fallback to layout-index assumption
      if (timestampIdx === -1) timestampIdx = 0;
      if (nameIdx === -1) nameIdx = 1;
      if (categoryIdx === -1) categoryIdx = 2;
      if (trailIdx === -1) trailIdx = 3;
      if (timeIdx === -1) timeIdx = 4;

      const results: TimeRecord[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i], delimiter);
        if (columns.length < 2) continue; // Skip blank lines

        const nameValue = columns[nameIdx] || '';
        if (!nameValue || nameValue.trim() === '' || nameValue.toLowerCase().includes('nombre')) continue;

        // Extract Date element
        let rawDate = columns[timestampIdx] || '';
        let dateValue = '';
        if (rawDate) {
          // Extract only the date part of the timestamp (usually separated by a space)
          const spaceIndex = rawDate.indexOf(' ');
          dateValue = spaceIndex !== -1 ? rawDate.substring(0, spaceIndex) : rawDate;
        } else {
          dateValue = new Date().toLocaleDateString('es-AR');
        }

        // Standardize time formatting values to HH:MM:SS format
        let rawTime = columns[timeIdx] || '00:00';
        let cleanTime = rawTime.trim();
        const parts = cleanTime.split(':');
        if (parts.length === 2) {
          cleanTime = `00:${cleanTime}`;
        }

        results.push({
          id: `sheet_row_${i}_${Date.now()}`,
          name: nameValue.trim(),
          category: columns[categoryIdx] || 'Libre',
          time: cleanTime,
          trailName: columns[trailIdx] || 'Sendero General',
          date: dateValue,
          isLocal: false
        });
      }

      setSheetRecords(results);
      localStorage.setItem('cached_sheet_ranks', JSON.stringify(results));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error desconocido al intentar sincronizar con la planilla.');
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  // Hook to keep local storage and baseline state merged
  useEffect(() => {
    const localUserRuns = JSON.parse(localStorage.getItem('saved_user_ranks') || '[]');
    
    // De-duplicate baseline mock records if we have equivalent names in our spreadsheet
    const sheetUniqueKeys = new Set(sheetRecords.map(r => `${r.name.toLowerCase()}_${r.trailName.toLowerCase()}`));
    
    const filteredBaseline = INITIAL_RANKINGS.filter(mock => {
      const key = `${mock.name.toLowerCase()}_${mock.trailName.toLowerCase()}`;
      return !sheetUniqueKeys.has(key);
    });

    const combined = [...localUserRuns, ...sheetRecords, ...filteredBaseline];
    setRecords(combined);
  }, [refreshTrigger, sheetRecords]);

  // Handle auto-sync on load if sheetUrl is present
  useEffect(() => {
    if (sheetUrl && sheetUrl.trim() && sheetRecords.length === 0) {
      handleFetchSheet();
    }
  }, []);

  const handleSaveConfig = () => {
    triggerVibrate(50);
    localStorage.setItem('ranking_sheet_csv_url', sheetUrl.trim());
    handleFetchSheet(sheetUrl.trim());
  };

  const handleRemoveConfig = () => {
    triggerVibrate(40);
    setSheetUrl('');
    setSheetRecords([]);
    localStorage.removeItem('ranking_sheet_csv_url');
    localStorage.removeItem('cached_sheet_ranks');
    setSyncSuccess(false);
    setErrorMsg(null);
  };

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
      
      {/* Google spreadsheet configuration header block */}
      <div className="border border-blue-100 rounded-xl bg-blue-50/10 overflow-hidden divide-y divide-blue-50">
        <button
          id="btn-toggle-config-panel"
          onClick={() => { triggerVibrate(); setShowConfig(!showConfig); }}
          className="w-full px-4 py-3 bg-blue-50/30 flex items-center justify-between text-xs font-semibold text-blue-900 transition-colors hover:bg-blue-50/60 cursor-pointer text-left font-display"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Sincronización de Tabla con Google Sheets (Excel)</span>
            {sheetRecords.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md font-mono text-[9px] font-extrabold animate-pulse">
                CONECTADO ({sheetRecords.length} MARCAS)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-blue-600/70">{showConfig ? 'Ocultar ajuste' : 'Configurar conexión'}</span>
            {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showConfig && (
          <div className="p-4 md:p-5 space-y-4 bg-white text-xs text-gray-600 animate-in slide-in-from-top-1 duration-200">
            <div className="space-y-2">
              <p className="font-semibold text-gray-800">¿Cómo conectar la planilla que recopila los datos del Formulario?</p>
              <ol className="list-decimal list-inside pl-1 space-y-1 text-gray-500 leading-relaxed font-sans text-[11px]">
                <li>Abre el documento de Google Sheets que está enlazado a tu formulario.</li>
                <li>Ve al menú principal: <strong className="text-gray-700">Archivo</strong> &gt; <strong className="text-gray-700">Compartir</strong> &gt; <strong className="text-gray-700">Publicar en la Web</strong>.</li>
                <li>En la ventana, cambia de "Todo el documento" a la hoja que guarda las marcas (ej: <em>"Respuestas de formulario 1"</em>).</li>
                <li>Cambia de "Página web" a <strong className="text-gray-800">Valores separados por comas (.csv)</strong>.</li>
                <li>Presiona <strong className="text-blue-700">Publicar</strong>, copia el enlace generado y pégalo aquí abajo.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <input
                type="text"
                id="input-sheet-url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="Pegar enlace publicado (ej: https://docs.google.com/spreadsheets/.../pub?output=csv)"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs tracking-tight text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-save-sheet-url"
                  onClick={handleSaveConfig}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-all active:scale-95 text-xs cursor-pointer flex-1 sm:flex-initial"
                >
                  {isLoading ? 'Conectando...' : 'Conectar Planilla'}
                </button>
                {sheetRecords.length > 0 && (
                  <button
                    id="btn-remove-sheet-url"
                    onClick={handleRemoveConfig}
                    className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-lg font-semibold transition-all active:scale-95 text-xs cursor-pointer"
                    title="Desconectar Planilla"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2 max-w-2xl animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sheetRecords.length > 0 && !errorMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-center gap-2 max-w-2xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>¡Conexión establecida con éxito! Se cargaron y ordenaron {sheetRecords.length} marcas de tiempo de la planilla.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search & Filter Header controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gray-50/40 p-4 rounded-xl border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {/* Text search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="search-candidate"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar corredor..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700"
            />
          </div>

          {/* Trail Selection Filter */}
          <div className="relative">
            <select
              id="filter-trail-select"
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

          {/* Category Selection Filter */}
          <div className="relative">
            <select
              id="filter-category-select"
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
          {sheetUrl && (
            <button
              id="btn-sheet-refresh"
              onClick={() => { triggerVibrate(50); handleFetchSheet(); }}
              disabled={isLoading}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
              title="Sincronizar Planilla"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            id="btn-filters-reset"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reestablecer
          </button>
        </div>
      </div>

      {/* Table section */}
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
                        ? 'bg-amber-50/40 hover:bg-amber-50/60 font-semibold text-gray-900 border-l-3 border-amber-400' 
                        : ''
                    }`}
                  >
                    
                    {/* Position and Medals */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {position === 1 ? (
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold" title="Primer Puesto">
                            🏆
                          </div>
                        ) : position === 2 ? (
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold" title="Segundo Puesto">
                            🥈
                          </div>
                        ) : position === 3 ? (
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold" title="Tercer Puesto">
                            🥉
                          </div>
                        ) : (
                          <span className="font-mono text-gray-500">{position}</span>
                        )}
                      </div>
                    </td>

                    {/* Participant Name */}
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span>{rec.name}</span>
                        {isLocal && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-700 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Tú
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trail */}
                    <td className="py-3.5 px-4 text-gray-600 font-display font-medium">
                      {rec.trailName}
                    </td>

                    {/* Category tag */}
                    <td className="py-3.5 px-4 text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium uppercase font-display border border-gray-150">
                        {rec.category.split(' ')[0]}
                      </span>
                    </td>

                    {/* Registered Time */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">
                      {rec.time}
                    </td>

                    {/* Date */}
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
                    <p className="text-xs text-gray-400">Intenta reestablecer los filtros cargados.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-gray-400 py-1 bg-gray-50/50 rounded-lg px-4 border border-gray-50">
        <p className="font-display">Total de marcas en la base: <strong className="text-gray-600">{filteredRecords.length}</strong></p>
        <p className="font-mono">Coordenadas del Parque: Guardia Mitre, Río Negro, ARG</p>
      </div>

    </div>
  );
}
