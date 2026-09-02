import { cn } from '@/lib/utils';
import type { AccountStatus, CustomerStatus, ProviderStatus, SaleStatus, Semaforo } from '@/lib/types';

type Tone = 'brand' | 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'pink';

const tones: Record<Tone, string> = {
  brand: 'border-brand-400/30 bg-brand-500/15 text-brand-200',
  green: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  amber: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
  red:   'border-rose-400/30 bg-rose-500/15 text-rose-200',
  blue:  'border-sky-400/30 bg-sky-500/15 text-sky-200',
  pink:  'border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200',
  gray:  'border-white/12 bg-white/5 text-white/55',
};

export function Badge({
  children,
  tone = 'gray',
  className,
  dot = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ mapeos ---- */

const accountTone: Record<AccountStatus, { tone: Tone; label: string }> = {
  disponible: { tone: 'blue',  label: 'Disponible' },
  vendida:    { tone: 'brand', label: 'Vendida' },
  activa:     { tone: 'green', label: 'Activa' },
  por_vencer: { tone: 'amber', label: 'Por vencer' },
  vencida:    { tone: 'red',   label: 'Vencida' },
  suspendida: { tone: 'gray',  label: 'Suspendida' },
  cancelada:  { tone: 'gray',  label: 'Cancelada' },
};

const saleTone: Record<SaleStatus, { tone: Tone; label: string }> = {
  pendiente:   { tone: 'amber', label: 'Pendiente' },
  pagada:      { tone: 'brand', label: 'Pagada' },
  entregada:   { tone: 'green', label: 'Entregada' },
  reembolsada: { tone: 'red',   label: 'Reembolsada' },
  cancelada:   { tone: 'gray',  label: 'Cancelada' },
};

const customerTone: Record<CustomerStatus, { tone: Tone; label: string }> = {
  activo:    { tone: 'green', label: 'Activo' },
  inactivo:  { tone: 'gray',  label: 'Inactivo' },
  moroso:    { tone: 'amber', label: 'Moroso' },
  bloqueado: { tone: 'red',   label: 'Bloqueado' },
};

const providerTone: Record<ProviderStatus, { tone: Tone; label: string }> = {
  activo:     { tone: 'green', label: 'Activo' },
  inactivo:   { tone: 'gray',  label: 'Inactivo' },
  suspendido: { tone: 'red',   label: 'Suspendido' },
};

export const semaforoMeta: Record<Semaforo, { tone: Tone; label: string; emoji: string }> = {
  vencido:   { tone: 'red',   label: 'Vencido',        emoji: '🔴' },
  hoy:       { tone: 'red',   label: 'Vence hoy',      emoji: '🔴' },
  critico:   { tone: 'amber', label: 'Vence en 1-3 d', emoji: '🟠' },
  proximo:   { tone: 'amber', label: 'Vence en 4-7 d', emoji: '🟡' },
  ok:        { tone: 'green', label: 'Más de 7 días',  emoji: '🟢' },
  sin_fecha: { tone: 'gray',  label: 'Sin fecha',      emoji: '⚪' },
};

export const AccountBadge  = ({ estado }: { estado: AccountStatus })  => <Badge dot tone={accountTone[estado].tone}>{accountTone[estado].label}</Badge>;
export const SaleBadge     = ({ estado }: { estado: SaleStatus })     => <Badge dot tone={saleTone[estado].tone}>{saleTone[estado].label}</Badge>;
export const CustomerBadge = ({ estado }: { estado: CustomerStatus }) => <Badge dot tone={customerTone[estado].tone}>{customerTone[estado].label}</Badge>;
export const ProviderBadge = ({ estado }: { estado: ProviderStatus }) => <Badge dot tone={providerTone[estado].tone}>{providerTone[estado].label}</Badge>;
export const SemaforoBadge = ({ semaforo }: { semaforo: Semaforo })   => <Badge tone={semaforoMeta[semaforo].tone}>{semaforoMeta[semaforo].emoji} {semaforoMeta[semaforo].label}</Badge>;
