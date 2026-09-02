'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageCircle, Monitor, Clock, Tag, ShieldCheck } from 'lucide-react';
import { formatMoney, formatDuration } from '@/lib/format';
import { waCompra, waServicio } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import type { Service, ServicePlan } from '@/lib/types';

export function PlanPicker({ servicio }: { servicio: Service }) {
  const planes = (servicio.service_plans ?? []).filter((p) => p.activo);
  const [seleccion, setSeleccion] = useState<ServicePlan | null>(planes[0] ?? null);

  const precioFinal = (p: ServicePlan) => p.precio_descuento ?? p.precio_venta;
  const ahorro = (p: ServicePlan) =>
    p.precio_descuento ? p.precio_venta - p.precio_descuento : 0;

  if (planes.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-white/60">Este servicio no tiene planes publicados en este momento.</p>
        <a
          href={waServicio(servicio.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp mt-4"
        >
          <MessageCircle className="h-4 w-4" /> Consultar disponibilidad
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold text-white">Elige tu plan</h2>

      <div className="space-y-3">
        {planes.map((p, i) => {
          const activo = seleccion?.id === p.id;
          const desc = ahorro(p);
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setSeleccion(p)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300',
                activo
                  ? 'border-brand-400/60 bg-brand-500/10 shadow-glow'
                  : 'border-white/10 bg-ink-900/50 hover:border-white/25 hover:bg-white/[0.05]',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all',
                  activo ? 'border-brand-400 bg-brand-500' : 'border-white/25',
                )}
              >
                {activo && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{p.nombre}</span>
                  {desc > 0 && (
                    <span className="rounded-md border border-emerald-400/30 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-200">
                      Ahorra {formatMoney(desc)}
                    </span>
                  )}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(p.duracion_dias)}</span>
                  {p.pantallas ? (
                    <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{p.pantallas} pantalla{p.pantallas === 1 ? '' : 's'}</span>
                  ) : null}
                  {p.descripcion && <span className="truncate">{p.descripcion}</span>}
                </span>
              </span>

              <span className="shrink-0 text-right">
                {desc > 0 && (
                  <span className="block text-xs text-white/35 line-through">
                    {formatMoney(p.precio_venta)}
                  </span>
                )}
                <span className="block font-display text-xl font-extrabold text-white">
                  {formatMoney(precioFinal(p))}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Resumen y compra */}
      <AnimatePresence mode="wait">
        {seleccion && (
          <motion.div
            key={seleccion.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="sticky bottom-4 mt-6 rounded-2xl border border-brand-400/25 bg-ink-900/90 p-5 shadow-glow-lg backdrop-blur-xl"
          >
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-white/40">Total a pagar</p>
                <p className="font-display text-3xl font-extrabold text-white">
                  {formatMoney(precioFinal(seleccion))}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/45">
                  {servicio.nombre} · {seleccion.nombre} · {formatDuration(seleccion.duracion_dias)}
                </p>
              </div>
              <Tag className="hidden h-8 w-8 text-brand-400/40 sm:block" />
            </div>

            <a
              href={waCompra(
                servicio.nombre,
                seleccion.nombre,
                seleccion.duracion_dias,
                precioFinal(seleccion),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 w-full"
            >
              <MessageCircle className="h-4 w-4" />
              Comprar por WhatsApp
            </a>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Se abrirá WhatsApp con tu pedido listo. No pagas nada en la página.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
