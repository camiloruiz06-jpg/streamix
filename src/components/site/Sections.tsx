'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, MessageSquare, Wallet, Play, ChevronDown, ShieldCheck, Clock,
  Users, Star, ArrowRight, MessageCircle,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { pasos, faqs, metodosPago, site } from '@/config/site';
import { waGeneral } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------- encabezado */

export function SectionHeading({
  eyebrow,
  titulo,
  descripcion,
  centrado = true,
}: {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  centrado?: boolean;
}) {
  return (
    <Reveal className={cn('max-w-2xl', centrado && 'mx-auto text-center')}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        <span className="text-gradient">{titulo}</span>
      </h2>
      {descripcion && (
        <p className="mt-4 text-base leading-relaxed text-white/55">{descripcion}</p>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------ cómo funciona */

const iconos = { search: Search, message: MessageSquare, wallet: Wallet, play: Play } as const;

export function ComoFunciona() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Proceso simple"
        titulo="Comprar toma menos de 5 minutos"
        descripcion="Sin registros, sin formularios eternos. Eliges, escribes y disfrutas."
      />

      <Stagger className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* línea conectora */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px lg:block"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.35), transparent)' }}
        />

        {pasos.map((paso, i) => {
          const Icono = iconos[paso.icono as keyof typeof iconos] ?? Search;
          return (
            <StaggerItem key={paso.titulo}>
              <div className="group relative h-full rounded-2xl border border-white/10 bg-ink-900/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 hover:shadow-glow">
                <div className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-brand-400/25 bg-grad-brand-soft">
                  <Icono className="h-6 w-6 text-brand-300" />
                  <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-grad-brand text-[11px] font-bold text-white shadow-glow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{paso.texto}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ ventajas */

const ventajas = [
  { icono: Clock, titulo: 'Entrega en minutos', texto: 'La mayoría de pedidos se entregan entre 5 y 30 minutos después del pago.', color: '#a855f7' },
  { icono: ShieldCheck, titulo: 'Garantía real', texto: 'Acompañamos tu servicio durante toda la vigencia. Si falla, lo reponemos.', color: '#22c55e' },
  { icono: Users, titulo: 'Soporte por WhatsApp', texto: 'Hablas con una persona, no con un bot. Todos los días del año.', color: '#ec4899' },
  { icono: Star, titulo: 'Precios honestos', texto: 'El precio que ves es el precio final. Sin activación ni cargos ocultos.', color: '#38bdf8' },
];

export function Ventajas() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Por qué nosotros"
        titulo="Una tienda en la que puedes confiar"
        descripcion="Trabajamos con varios proveedores verificados para darte siempre el mejor precio, con respaldo."
      />
      <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ventajas.map((v) => (
          <StaggerItem key={v.titulo}>
            <div
              className="group h-full rounded-2xl border border-white/10 bg-ink-900/50 p-6 transition-all duration-300 hover:-translate-y-1.5"
              style={{ ['--c' as string]: v.color }}
            >
              <div
                className="mb-4 grid h-12 w-12 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${v.color}1f`, border: `1px solid ${v.color}44` }}
              >
                <v.icono className="h-5 w-5" style={{ color: v.color }} />
              </div>
              <h3 className="font-display font-bold text-white">{v.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{v.texto}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */

export function Faq({ compacto = false }: { compacto?: boolean }) {
  const [abierto, setAbierto] = useState<number | null>(0);
  const lista = compacto ? faqs.slice(0, 5) : faqs;

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Dudas frecuentes"
        titulo="Preguntas frecuentes"
        descripcion="Y si te queda alguna, escríbenos por WhatsApp: respondemos rápido."
      />

      <div className="mt-12 space-y-3">
        {lista.map((f, i) => {
          const activo = abierto === i;
          return (
            <Reveal key={f.q} delay={i * 0.04}>
              <div
                className={cn(
                  'overflow-hidden rounded-2xl border transition-colors duration-300',
                  activo ? 'border-brand-400/40 bg-brand-500/[0.07]' : 'border-white/10 bg-ink-900/50',
                )}
              >
                <button
                  type="button"
                  onClick={() => setAbierto(activo ? null : i)}
                  aria-expanded={activo}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-white">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 text-brand-300 transition-transform duration-300',
                      activo && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {activo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-white/60">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>

      {compacto && (
        <Reveal className="mt-8 text-center">
          <Link href="/faq" className="btn-ghost btn-sm">
            Ver todas las preguntas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      )}
    </section>
  );
}

/* -------------------------------------------------------- métodos de pago */

export function MetodosPago() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Pagos"
        titulo="Paga como más te convenga"
        descripcion="Confirmamos tu pago al instante y despachamos tu pedido de inmediato."
      />
      <Stagger className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
        {metodosPago.map((m) => (
          <StaggerItem key={m.nombre}>
            <div className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40">
              <span className="text-2xl">{m.icono}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{m.nombre}</p>
                <p className="truncate text-xs text-white/45">{m.detalle}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------- CTA final */

export function CtaFinal() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-brand-400/25 p-8 text-center sm:p-14">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(80% 120% at 50% 0%, rgba(168,85,247,.28), rgba(11,10,20,.6) 60%), linear-gradient(180deg, rgba(255,47,208,.12), transparent)',
            }}
          />
          <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl animate-float" />

          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient">¿Listo para empezar a disfrutar?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Escríbenos y en minutos tienes tu servicio activo. Atendemos {site.horario.toLowerCase()}.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={waGeneral()} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" />
              Escribir por WhatsApp
            </a>
            <Link href="/servicios" className="btn-ghost w-full sm:w-auto">
              Explorar el catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
