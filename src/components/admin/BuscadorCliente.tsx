'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { coincideCliente, contactoCliente, etiquetaCliente } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/types';

export function BuscadorCliente({
  clientes,
  value,
  onChange,
  name = 'customer_id',
  permiteNuevo = true,
  excluirId,
  requerido = true,
}: {
  clientes: Customer[];
  value: string;
  onChange: (id: string) => void;
  name?: string;
  permiteNuevo?: boolean;
  excluirId?: string;
  requerido?: boolean;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(false);

  const elegido = value && value !== 'nuevo' ? clientes.find((c) => c.id === value) : null;

  const lista = useMemo(() => {
    const base = excluirId ? clientes.filter((c) => c.id !== excluirId) : clientes;
    const filtrados = q.trim() ? base.filter((c) => coincideCliente(c, q)) : base;
    return filtrados.slice(0, 8);
  }, [clientes, q, excluirId]);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    window.addEventListener('mousedown', click);
    return () => window.removeEventListener('mousedown', click);
  }, []);

  const elegir = (id: string) => {
    onChange(id);
    setAbierto(false);
    setQ('');
  };

  const limpiar = () => {
    onChange('');
    setQ('');
    setAbierto(true);
  };

  return (
    <div ref={caja} className="relative">
      <input type="hidden" name={name} value={value} />

      {elegido && !abierto ? (
        <div className="field flex items-center justify-between gap-2 !py-2">
          <span className="min-w-0">
            <span className="block truncate text-sm text-white">{etiquetaCliente(elegido)}</span>
            {contactoCliente(elegido) && (
              <span className="block truncate text-xs text-white/40">{contactoCliente(elegido)}</span>
            )}
          </span>
          <button
            type="button"
            onClick={limpiar}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Cambiar cliente"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : value === 'nuevo' && !abierto ? (
        <div className="field flex items-center justify-between gap-2 !py-2">
          <span className="flex items-center gap-2 text-sm text-brand-200">
            <UserPlus className="h-4 w-4" /> Cliente nuevo
          </span>
          <button
            type="button"
            onClick={limpiar}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Cambiar cliente"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            id="v-cliente"
            type="search"
            autoComplete="off"
            className="field pl-9"
            placeholder="Escribe nombre, número o @usuario…"
            value={q}
            required={requerido && !value}
            onChange={(e) => {
              setQ(e.target.value);
              setAbierto(true);
              if (value) onChange('');
            }}
            onFocus={() => setAbierto(true)}
          />
        </div>
      )}

      {abierto && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-white/12 bg-ink-900 py-1 shadow-glow-lg">
          {permiteNuevo && (
            <li>
              <button
                type="button"
                onClick={() => elegir('nuevo')}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-brand-200 hover:bg-brand-500/15"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                Cliente nuevo
              </button>
            </li>
          )}
          {lista.length === 0 ? (
            <li className="px-3 py-3 text-xs text-white/40">
              {q.trim() ? 'Nadie coincide con esa búsqueda.' : 'Empieza a escribir para filtrar.'}
            </li>
          ) : (
            lista.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => elegir(c.id)}
                  className="flex w-full flex-col px-3 py-2 text-left hover:bg-white/[0.06]"
                >
                  <span className="truncate text-sm text-white">{etiquetaCliente(c)}</span>
                  {contactoCliente(c) && (
                    <span className="truncate text-xs text-white/40">{contactoCliente(c)}</span>
                  )}
                </button>
              </li>
            ))
          )}
          {!q.trim() && clientes.length > 8 && (
            <li className="border-t border-white/8 px-3 py-2 text-[11px] text-white/35">
              Escribe para ver el resto ({clientes.length} clientes).
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
