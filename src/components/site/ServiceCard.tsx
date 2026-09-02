'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { formatMoney } from '@/lib/format';
import { waServicio } from '@/lib/whatsapp';
import type { CatalogItem } from '@/lib/types';

export function ServiceCard({ item, index = 0 }: { item: CatalogItem; index?: number }) {
  const color = item.color || '#a855f7';
  const disponible = item.planes_disponibles > 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur-xl transition-colors duration-300 hover:border-white/20"
    >
      {/* glow de marca al pasar el mouse */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(60% 55% at 50% 0%, ${color}33, transparent 70%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -top-px h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* encabezado */}
      <div className="flex items-start justify-between gap-3">
        <ServiceLogo
          nombre={item.nombre}
          logoUrl={item.logo_url}
          color={color}
          size={56}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        {item.destacado && (
          <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            Top ventas
          </span>
        )}
      </div>

      {/* cuerpo */}
      <div className="mt-4 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-white">{item.nombre}</h3>
          {item.categoria && (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/45">
              {item.categoria}
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
          {item.descripcion_corta}
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/45">
          {disponible ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-300">Disponible</span>
              <span className="text-white/30">· {item.planes_disponibles} plan{item.planes_disponibles === 1 ? '' : 'es'}</span>
            </>
          ) : (
            <span className="text-white/35">Consultar disponibilidad</span>
          )}
        </p>
      </div>

      {/* precio */}
      <div className="mt-5 flex items-end justify-between border-t border-white/8 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/35">Desde</p>
          <p className="font-display text-2xl font-extrabold text-white">
            {formatMoney(item.precio_desde)}
          </p>
        </div>
        <Link
          href={`/servicios/${item.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-300 transition hover:text-brand-200"
        >
          Ver planes
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* acciones */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/servicios/${item.slug}`} className="btn-primary btn-sm whitespace-nowrap">
          Comprar
        </Link>
        <a
          href={waServicio(item.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp btn-sm whitespace-nowrap"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>
    </motion.article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <div className="skeleton h-14 w-14 rounded-2xl" />
      <div className="skeleton mt-4 h-5 w-32" />
      <div className="skeleton mt-2.5 h-3.5 w-full" />
      <div className="skeleton mt-2 h-3.5 w-3/4" />
      <div className="mt-6 flex items-end justify-between border-t border-white/8 pt-4">
        <div className="skeleton h-8 w-24" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="skeleton h-9" />
        <div className="skeleton h-9" />
      </div>
    </div>
  );
}
