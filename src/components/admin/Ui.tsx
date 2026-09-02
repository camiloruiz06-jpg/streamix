import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------- encabezado */

export function PageHeader({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {titulo}
        </h1>
        {descripcion && <p className="mt-1.5 text-sm text-white/45">{descripcion}</p>}
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ tarjeta KPI */

type Tono = 'brand' | 'green' | 'amber' | 'red' | 'blue';

const tonos: Record<Tono, { fondo: string; borde: string; icono: string; glow: string }> = {
  brand: { fondo: 'bg-brand-500/12',   borde: 'border-brand-400/25',   icono: 'text-brand-300',   glow: 'rgba(168,85,247,.35)' },
  green: { fondo: 'bg-emerald-500/12', borde: 'border-emerald-400/25', icono: 'text-emerald-300', glow: 'rgba(16,185,129,.35)' },
  amber: { fondo: 'bg-amber-500/12',   borde: 'border-amber-400/25',   icono: 'text-amber-300',   glow: 'rgba(245,158,11,.35)' },
  red:   { fondo: 'bg-rose-500/12',    borde: 'border-rose-400/25',    icono: 'text-rose-300',    glow: 'rgba(244,63,94,.35)' },
  blue:  { fondo: 'bg-sky-500/12',     borde: 'border-sky-400/25',     icono: 'text-sky-300',     glow: 'rgba(56,189,248,.35)' },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tono = 'brand',
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tono?: Tono;
  className?: string;
}) {
  const t = tonos[tono];
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: t.glow }}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
        <span
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-transform duration-300 group-hover:scale-110',
            t.fondo,
            t.borde,
          )}
        >
          <Icon className={cn('h-4 w-4', t.icono)} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-white/35">{hint}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------- panel */

export function Panel({
  titulo,
  descripcion,
  accion,
  children,
  className,
}: {
  titulo?: string;
  descripcion?: string;
  accion?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-2xl border border-white/10 bg-ink-900/50 p-5 backdrop-blur', className)}>
      {(titulo || accion) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="font-display font-bold text-white">{titulo}</h2>}
            {descripcion && <p className="mt-1 text-xs text-white/40">{descripcion}</p>}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------- utilidades */

export function Money({ value, positivo = false }: { value: number; positivo?: boolean }) {
  const negativo = value < 0;
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        positivo && !negativo && 'text-emerald-300',
        negativo && 'text-rose-300',
      )}
    >
      {new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value)}
    </span>
  );
}

export function Avatar({ nombre, color = '#a855f7' }: { nombre: string; color?: string }) {
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
      style={{ background: `${color}2e`, border: `1px solid ${color}55` }}
    >
      {iniciales}
    </span>
  );
}
