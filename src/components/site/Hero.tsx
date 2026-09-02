'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MessageCircle, ShieldCheck, Zap, Headphones } from 'lucide-react';
import { site } from '@/config/site';
import { waGeneral } from '@/lib/whatsapp';

const marcas = [
  'Netflix', 'Disney+', 'Max', 'Prime Video', 'Spotify', 'Crunchyroll',
  'Paramount+', 'YouTube Premium', 'Canva Pro', 'ChatGPT', 'Vix', 'Plex',
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero({ servicios = 8 }: { servicios?: number }) {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-40">
      {/* rayos de luz de cine */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0, scaleY: 0.6 }}
          animate={{ opacity: 0.5, scaleY: 1 }}
          transition={{ duration: 1.6, ease }}
          className="absolute left-1/2 top-0 h-[42rem] w-[70rem] -translate-x-1/2 origin-top"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(168,85,247,.16) 22deg, transparent 44deg, transparent 316deg, rgba(255,47,208,.13) 338deg, transparent 360deg)',
            filter: 'blur(14px)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              {servicios} servicios disponibles · entrega inmediata
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.08, ease }}
            className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-gradient">Tu entretenimiento favorito,</span>
            <br />
            <span className="text-brand-gradient">en un solo lugar.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Streaming, música y deportes al mejor precio del mercado. Compra en minutos por
            WhatsApp, recibe tu acceso al instante y disfruta con garantía durante toda la vigencia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="#catalogo" className="btn-primary group w-full sm:w-auto">
              Ver catálogo
              <ArrowRight className="h-4 w-4 rotate-90 transition-transform duration-300 group-hover:translate-y-1" />
            </a>
            <a
              href={waGeneral()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Comprar por WhatsApp
            </a>
          </motion.div>

          {/* señales de confianza */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-white/45"
          >
            <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-400" /> Entrega en minutos</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Garantía en toda la vigencia</li>
            <li className="flex items-center gap-2"><Headphones className="h-4 w-4 text-fuchsia-400" /> Soporte real por WhatsApp</li>
          </motion.ul>
        </div>

        {/* marquesina de marcas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative mt-16 overflow-hidden py-4"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee gap-10">
            {[...marcas, ...marcas].map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="whitespace-nowrap font-display text-xl font-bold tracking-tight text-white/18 transition-colors hover:text-white/45 sm:text-2xl"
              >
                {m}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
