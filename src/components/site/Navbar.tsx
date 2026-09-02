'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle } from 'lucide-react';
import { BrandLockup } from '@/components/ui/BrandMark';
import { site } from '@/config/site';
import { waGeneral } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const links = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/mi-compra', label: 'Mi compra' },
  { href: '/faq', label: 'Preguntas' },
  { href: '/contacto', label: 'Contacto' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500',
        scrolled
          ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center">
          <BrandLockup size={44} />
        </Link>

        {/* Links escritorio */}
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                    active ? 'text-white' : 'text-white/60 hover:text-white',
                  )}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-grad-brand"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <a
            href={waGeneral()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-sm hidden sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <Link href="/servicios" className="btn-primary btn-sm hidden sm:inline-flex">
            Ver servicios
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    className={cn(
                      'block rounded-xl px-4 py-3 text-base font-medium transition',
                      pathname === l.href
                        ? 'bg-brand-500/15 text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-2 grid grid-cols-2 gap-2">
                <a href={waGeneral()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <Link href="/servicios" className="btn-primary">
                  Ver servicios
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
