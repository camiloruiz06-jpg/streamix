'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, X, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableRow {
  /** Identificador único de la fila. */
  id: string;
  /** Celdas ya renderizadas en el servidor. */
  cells: ReactNode[];
  /** Texto plano para el buscador. */
  search: string;
  /** Valores por los que se puede ordenar, alineados con las columnas. */
  sort?: (string | number | null)[];
  /** Etiquetas para los filtros: { estado: 'activa', servicio: 'Netflix' } */
  tags?: Record<string, string>;
  /** Clase extra para la fila (por ejemplo resaltar vencidos). */
  className?: string;
}

export interface TableFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export function DataTable({
  headers,
  rows,
  filters = [],
  searchPlaceholder = 'Buscar…',
  emptyTitle = 'Nada por aquí todavía',
  emptyText = 'Cuando registres información aparecerá en esta tabla.',
  defaultSort,
  pageSize = 25,
  alignRight = [],
}: {
  headers: string[];
  rows: TableRow[];
  filters?: TableFilter[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyText?: string;
  defaultSort?: { index: number; dir: 'asc' | 'desc' };
  pageSize?: number;
  /** Índices de columna que se alinean a la derecha (montos). */
  alignRight?: number[];
}) {
  const [q, setQ] = useState('');
  const [activos, setActivos] = useState<Record<string, string>>({});
  const [orden, setOrden] = useState<{ index: number; dir: 'asc' | 'desc' } | null>(
    defaultSort ?? null,
  );
  const [pagina, setPagina] = useState(1);

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase();
    let out = rows.filter((r) => {
      const okQ = !texto || r.search.toLowerCase().includes(texto);
      const okF = Object.entries(activos).every(
        ([k, v]) => !v || v === 'todos' || r.tags?.[k] === v,
      );
      return okQ && okF;
    });

    if (orden && rows.some((r) => r.sort)) {
      const { index, dir } = orden;
      out = [...out].sort((a, b) => {
        const va = a.sort?.[index] ?? '';
        const vb = b.sort?.[index] ?? '';
        let cmp: number;
        if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
        else cmp = String(va).localeCompare(String(vb), 'es', { numeric: true });
        return dir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, activos, orden]);

  const totalPaginas = Math.max(1, Math.ceil(visibles.length / pageSize));
  const paginaActual = Math.min(pagina, totalPaginas);
  const enPagina = visibles.slice((paginaActual - 1) * pageSize, paginaActual * pageSize);

  const cambiarOrden = (index: number) => {
    setPagina(1);
    setOrden((prev) =>
      prev?.index === index
        ? { index, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { index, dir: 'asc' },
    );
  };

  const hayFiltros = q || Object.values(activos).some((v) => v && v !== 'todos');

  return (
    <div>
      {/* Controles */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPagina(1);
            }}
            placeholder={searchPlaceholder}
            className="field pl-9"
          />
        </div>

        {filters.map((f) => (
          <select
            key={f.key}
            aria-label={f.label}
            value={activos[f.key] ?? 'todos'}
            onChange={(e) => {
              setActivos((p) => ({ ...p, [f.key]: e.target.value }));
              setPagina(1);
            }}
            className="field cursor-pointer sm:w-48"
          >
            <option value="todos" className="bg-ink-900">{f.label}: todos</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-900">
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {hayFiltros && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setActivos({});
              setPagina(1);
            }}
            className="btn-ghost btn-sm shrink-0"
          >
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      <p className="mb-3 text-xs text-white/35">
        {visibles.length} registro{visibles.length === 1 ? '' : 's'}
        {visibles.length !== rows.length && ` de ${rows.length}`}
      </p>

      {/* Tabla */}
      {visibles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/12 py-16 text-center">
          <Inbox className="mx-auto h-9 w-9 text-white/20" />
          <p className="mt-4 font-display font-semibold text-white">{emptyTitle}</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-white/40">{emptyText}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {headers.map((h, i) => {
                  const ordenable = rows.some((r) => r.sort?.[i] !== undefined);
                  const activo = orden?.index === i;
                  return (
                    <th key={h} className={cn(alignRight.includes(i) && 'text-right')}>
                      {ordenable ? (
                        <button
                          type="button"
                          onClick={() => cambiarOrden(i)}
                          className={cn(
                            'inline-flex items-center gap-1.5 transition hover:text-white',
                            activo && 'text-brand-300',
                            alignRight.includes(i) && 'flex-row-reverse',
                          )}
                        >
                          {h}
                          {activo ? (
                            orden.dir === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        h
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {enPagina.map((r) => (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={r.className}
                  >
                    {r.cells.map((c, i) => (
                      <td key={i} className={cn(alignRight.includes(i) && 'text-right')}>
                        {c}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={paginaActual === 1}
            onClick={() => setPagina((p) => p - 1)}
            className="btn-ghost btn-sm"
          >
            Anterior
          </button>
          <span className="text-xs text-white/40">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="btn-ghost btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
