import { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { getChallenge, isApiConfigured, type Challenge, type CaptchaAnswer } from '../api';

interface CaptchaProps {
  onChange: (value: CaptchaAnswer | null) => void;
  idPrefix: string;
  /** Cambiarlo fuerza un desafío nuevo (por ejemplo, después de un envío). */
  refreshToken?: number;
}

/**
 * Captcha simple: una suma que se resuelve en el cliente, pero cuyo resultado
 * también valida el servidor contra un nonce de un solo uso. Frena bots tontos;
 * la defensa real son la validación y el límite de frecuencia de Apps Script.
 */
export default function Captcha({ onChange, idPrefix, refreshToken }: CaptchaProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    setAnswer('');
    if (!isApiConfigured) {
      setChallenge(null);
      setError('Falta configurar la API del ranking.');
      setLoading(false);
      return;
    }
    getChallenge()
      .then((fresh) => setChallenge(fresh))
      .catch(() => {
        setChallenge(null);
        setError('No se pudo cargar la verificación. Reintentá.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [refreshToken]);

  useEffect(() => {
    const clean = answer.trim();
    onChange(challenge && clean ? { nonce: challenge.nonce, answer: clean } : null);
  }, [challenge, answer, onChange]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verificación anti-bots
        </span>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Otra
        </button>
      </div>

      {challenge ? (
        <div className="flex items-center gap-2">
          <label htmlFor={`${idPrefix}-captcha`} className="text-xs text-gray-600 font-medium">
            ¿Cuánto es {challenge.a} + {challenge.b}?
          </label>
          <input
            id={`${idPrefix}-captcha`}
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Resultado de la suma"
          />
        </div>
      ) : (
        <p className="text-[11px] text-amber-700">{error || 'Cargando verificación…'}</p>
      )}
    </div>
  );
}
