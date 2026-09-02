'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ServiceCard } from '@/components/site/ServiceCard';
import { cn } from '@/lib/utils';
import type { CatalogItem, Category } from '@/lib/types';

type Orden = 'destacados' | 'precio-asc' | 'precio-desc' | 'nombre';

const ordenes: { value: Orden; label: string }[] = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'nombre', label: 'A – Z' },
];

export function CatalogGrid({
  items,
  categorias,
}: {
  items: CatalogItem[];
  categorias: Category[];
}) {
  const [categoria, setCategoria] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<Orden>('destacados');

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let out = items.filter((i) => {
      const okCat = categoria === 'todos' || i.categoria_slug === categoria;
      const okQ =
        !q ||
        i.nombre.toLowerCase().includes(q) ||
        (i.descripcion_corta ?? '').toLowerCase().includes(q) ||
        (i.categoria ?? '').toLowerCase().includes(q);
      return okCat && okQ;
    });

    out = [...out].sort((a, b) => {
      switch (orden) {
        case 'precio-asc':
          return (a.precio_desde ?? 1e12) - (b.precio_desde ?? 1e12);
        case 'precio-desc':
          return (b.precio_desde ?? 0) - (a.precio_desde ?? 0);
        case 'nombre':
          return a.nombre.localeCompare(b.nombre, 'es');
        default:
          return Number(b.destacado) - Number(a.destacado) || a.orden - b.orden;
      }
    });

    return out;
  }, [items, categoria, busqueda, orden]);

  const chips = [
    { slug: 'todos', nombre: 'Todos', color: '#a855f7' },
    ...categorias.map((c) => ({ slug: c.slug, nombre: c.nombre, color: c.color || '#a855f7' })),
  ];

  return (
    <div>
      {/* Controles */}
      <div className="sticky top-16 z-20 -mx-4 mb-8 border-y border-white/8 bg-ink-950/80 px-4 py-4 backdrop-blur-xl sm:top-18 sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          {/* Chips de categoría */}
          <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1">
            {chips.map((c) => {
              const activo = categoria === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCategoria(c.slug)}
                  className={cn(
                    'relative whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
                    activo
                      ? 'border-transparent text-white'
                      : 'border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white',
                  )}
                >
                  {activo && (
                    <motion.span
                      layoutId="chip-activo"
                      className="absolute inset-0 -z-10 rounded-full bg-grad-brand shadow-glow"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {c.nombre}
                </button>
              );
            })}
          </div>

          {/* Buscador + orden */}
          <div className="flex shrink-0 gap-2">
            <div className="relative flex-1 xl:w-60 xl:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar servicio…"
                className="field pl-9 pr-9"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                aria-label="Ordenar por"
                className="field cursor-pointer appearance-none pl-9 pr-8"
              >
                {ordenes.map((o) => (
                  <option key={o.value} value={o.value} className="bg-ink-900">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <p className="mb-5 text-sm text-white/40">
        {visibles.length} servicio{visibles.length === 1 ? '' : 's'}
        {categoria !== 'todos' && ` en ${chips.find((c) => c.slug === categoria)?.nombre}`}
      </p>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visibles.map((item, i) => (
            <ServiceCard key={item.id} item={item} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visibles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-white/12 py-20 text-center"
        >
          <p className="text-4xl">🔍</p>
          <p className="mt-4 font-display text-lg font-semibold text-white">
            No encontramos ese servicio
          </p>
          <p className="mt-1.5 text-sm text-white/45">
            Prueba con otra búsqueda o escríbenos: conseguimos casi cualquier plataforma.
          </p>
          <button
            type="button"
            onClick={() => {
              setBusqueda('');
              setCategoria('todos');
            }}
            className="btn-ghost btn-sm mt-6"
          >
            Limpiar filtros
          </button>
        </motion.div>
      )}
    </div>
  );
}
