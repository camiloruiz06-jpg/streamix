'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Clapperboard, Truck, Scale, KeyRound, Users, Receipt,
  CalendarClock, TrendingUp, Menu, X, ExternalLink, LogOut,
  type LucideIcon, ShoppingCart,} from 'lucide-react';
import { site } from '@/config/site';
import { BrandMark } from '@/components/ui/BrandMark';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const grupos: { titulo: string; items: NavItem[] }[] = [
  {
    titulo: 'General',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    titulo: 'Operación',
    items: [
      { href: '/admin/vender', label: 'Nueva venta', icon: ShoppingCart },
      { href: '/admin/vencimientos', label: 'Vencimientos', icon: CalendarClock },
      { href: '/admin/cuentas', label: 'Cuentas', icon: KeyRound },
      { href: '/admin/ventas', label: 'Ventas', icon: Receipt },
      { href: '/admin/clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    titulo: 'Catálogo',
    items: [
      { href: '/admin/servicios', label: 'Servicios y planes', icon: Clapperboard },
      { href: '/admin/proveedores', label: 'Proveedores', icon: Truck },
      { href: '/admin/comparador', label: 'Comparador', icon: Scale },
    ],
  },
  {
    titulo: 'Análisis',
    items: [{ href: '/admin/finanzas', label: 'Finanzas', icon: TrendingUp }],
  },
];

export function Sidebar({ email, alertas = 0 }: { email?: string | null; alertas?: number }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const contenido = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/8 px-5">
        <BrandMark size={38} />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-extrabold tracking-tight text-white">
            {site.name}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-brand-300/70">Panel admin</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {grupos.map((g) => (
          <div key={g.titulo} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
              {g.titulo}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const activo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const badge = item.href === '/admin/vencimientos' && alertas > 0 ? alertas : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setAbierto(false)}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        activo ? 'text-white' : 'text-white/50 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      {activo && (
                        <motion.span
                          layoutId="admin-active"
                          className="absolute inset-0 -z-10 rounded-xl border border-brand-400/30 bg-brand-500/15"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          'h-4.5 w-4.5 shrink-0 transition-colors',
                          activo ? 'text-brand-300' : 'text-white/40 group-hover:text-white/70',
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge && (
                        <span className="rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Pie */}
      <div className="border-t border-white/8 p-3">
        <Link
          href="/"
          target="_blank"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Ver la tienda
        </Link>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
        {email && (
          <p className="truncate px-3 pt-2 text-[11px] text-white/25">{email}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/8 bg-ink-950/80 backdrop-blur-xl lg:block">
        {contenido}
      </aside>

      {/* Móvil */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="fixed left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink-900/90 text-white/80 backdrop-blur lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {abierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAbierto(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-ink-950 lg:hidden"
            >
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar menú"
                className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
              {contenido}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
