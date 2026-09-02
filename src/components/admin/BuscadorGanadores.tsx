'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { formatDuration, formatMoney } from '@/lib/format';
import type { ProviderComparisonRow } from '@/lib/types';

/**
 * Las tarjetas de "dónde conviene comprar cada servicio", con buscador.
 * Con 40 servicios, sin buscador toca bajar media pantalla para encontrar uno.
 */
export function BuscadorGanadores({ ganadoras }: { ganadoras: ProviderComparisonRow[] }) {
  const [q, setQ] = useState('');

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return ganadoras;
    return ganadoras.filter((g) =>
      [g.servicio, g.plan, g.proveedor].filter(Boolean).join(' ').toLowerCase().includes(t),
    );
  }, [ganadoras, q]);

  return (
    <>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar servicio o proveedor… (Netflix, Spotify, Proveedor 3…)"
          className="field pl-10 pr-10"
          aria-label="Buscar en el comparador"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Limpiar"
            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-white/35">
        {filtradas.length} de {ganadoras.length} servicios
      </p>

      {filtradas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/12 py-10 text-center text-sm text-white/35">
          Nada coincide con «{q}».
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((g) => (
            <div
              key={g.price_id}
              className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.07] p-4"
            >
              <p className="text-sm font-semibold text-white">{g.servicio}</p>
              <p className="text-xs text-white/45">{g.plan}</p>
              <p className="mt-3 font-display text-xl font-extrabold text-emerald-300">
                {g.proveedor}
              </p>
              <p className="mt-1 text-xs text-white/50">
                {formatMoney(g.costo)} por {formatDuration(g.duracion_dias)}
                {g.duracion_dias !== 30 && (
                  <>
                    {' · '}
                    <span className="text-white/35">{formatMoney(g.costo_30_dias)} si fueran 30 d.</span>
                  </>
                )}
              </p>
              <p className="mt-2 text-xs text-white/45">
                Véndelo en{' '}
                <strong className="text-white/80">{formatMoney(g.costo + 2000)}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
