'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { waGeneral, waSoporte } from '@/lib/whatsapp';
import { site } from '@/config/site';

/** Botón flotante de WhatsApp, siempre visible. */
export function WhatsAppFab() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-[17rem] overflow-hidden rounded-2xl border border-white/12 bg-ink-900/95 shadow-glow-lg backdrop-blur-xl"
          >
            <div className="border-b border-white/10 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">¿Hablamos por WhatsApp?</p>
              <p className="text-xs text-white/55">{site.horario}</p>
            </div>
            <div className="flex flex-col p-2">
              <a href={waGeneral()} target="_blank" rel="noopener noreferrer"
                 className="rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/8 hover:text-white">
                🛒 Quiero comprar un servicio
              </a>
              <a href={waSoporte()} target="_blank" rel="noopener noreferrer"
                 className="rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/8 hover:text-white">
                🛟 Necesito soporte
              </a>
              <a href="/servicios"
                 className="rounded-xl px-3 py-2.5 text-sm text-white/85 transition hover:bg-white/8 hover:text-white">
                🎬 Ver el catálogo primero
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat de WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={visible ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_12px_40px_-8px_rgba(16,185,129,.8)]"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-500/40" />
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" fill="currentColor" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
