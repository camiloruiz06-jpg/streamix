import { MessageCircle } from 'lucide-react';
import { PageHeader, Panel, Money } from '@/components/admin/Ui';
import { BotonActualizarVencimientos } from '@/components/admin/QuickAction';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { SemaforoBadge, AccountBadge, semaforoMeta } from '@/components/ui/Badge';
import { getExpirations } from '@/lib/queries';
import { formatDateShort } from '@/lib/format';
import { waRecordatorio } from '@/lib/whatsapp';
import type { Semaforo } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vencimientos' };

const ordenSemaforo: Semaforo[] = ['vencido', 'hoy', 'critico', 'proximo', 'ok', 'sin_fecha'];

export default async function VencimientosPage() {
  const filas = await getExpirations();

  const resumen = ordenSemaforo.map((s) => ({
    semaforo: s,
    total: filas.filter((f) => f.semaforo === s).length,
  }));

  const rows: TableRow[] = filas.map((f) => ({
    id: f.account_id,
    tags: { semaforo: f.semaforo, estado: f.estado, servicio: f.servicio ?? '—' },
    search: [f.cliente, f.servicio, f.plan, f.proveedor, f.cliente_whatsapp]
      .filter(Boolean)
      .join(' '),
    sort: [
      f.cliente ?? '',
      f.servicio ?? '',
      f.fecha_vencimiento ?? '9999-12-31',
      f.dias_restantes ?? 9999,
      f.proveedor ?? '',
      f.precio_venta,
      '',
    ],
    className:
      f.semaforo === 'vencido' || f.semaforo === 'hoy'
        ? 'bg-rose-500/[0.05]'
        : f.semaforo === 'critico'
          ? 'bg-amber-500/[0.04]'
          : undefined,
    cells: [
      <div key="c" className="min-w-0">
        <p className="font-medium text-white">{f.cliente ?? '— sin cliente —'}</p>
        <p className="text-xs text-white/35">{f.cliente_whatsapp ?? ''}</p>
      </div>,
      <div key="s">
        <p className="font-medium text-white">{f.servicio}</p>
        <p className="text-xs text-white/35">{f.plan}</p>
      </div>,
      <span key="f" className="tabular-nums text-white/70">
        {formatDateShort(f.fecha_vencimiento)}
      </span>,
      <div key="d" className="flex items-center gap-2">
        <SemaforoBadge semaforo={f.semaforo} />
        {f.dias_restantes !== null && (
          <span className="text-xs tabular-nums text-white/40">
            {f.dias_restantes < 0
              ? `${Math.abs(f.dias_restantes)} d. atrás`
              : `${f.dias_restantes} d.`}
          </span>
        )}
      </div>,
      <span key="p" className="text-white/60">{f.proveedor ?? '—'}</span>,
      <AccountBadge key="e" estado={f.estado} />,
      <Money key="v" value={f.precio_venta} />,
      f.cliente_whatsapp ? (
        <a
          key="a"
          href={waRecordatorio(
            f.cliente_whatsapp,
            f.cliente ?? '',
            f.servicio ?? '',
            f.dias_restantes ?? 0,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp btn-sm"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Recordar
        </a>
      ) : (
        <span key="a" className="text-xs text-white/25">Sin WhatsApp</span>
      ),
    ],
  }));

  return (
    <div>
      <PageHeader
        titulo="Próximos vencimientos"
        descripcion="Controla qué servicios están por caducar y avisa al cliente antes de perder la renovación."
      >
        <BotonActualizarVencimientos />
      </PageHeader>

      {/* Semáforo */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {resumen.map((r) => (
          <div
            key={r.semaforo}
            className="rounded-2xl border border-white/10 bg-ink-900/50 p-4 transition hover:border-white/20"
          >
            <p className="text-xl">{semaforoMeta[r.semaforo].emoji}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-white">{r.total}</p>
            <p className="mt-0.5 text-xs text-white/40">{semaforoMeta[r.semaforo].label}</p>
          </div>
        ))}
      </div>

      <Panel>
        <DataTable
          headers={['Cliente', 'Servicio', 'Vence', 'Estado del plazo', 'Proveedor', 'Estado', 'Valor', 'Acción']}
          rows={rows}
          alignRight={[6]}
          defaultSort={{ index: 2, dir: 'asc' }}
          searchPlaceholder="Buscar por cliente, servicio o proveedor…"
          filters={[
            {
              key: 'semaforo',
              label: 'Plazo',
              options: ordenSemaforo.map((s) => ({ value: s, label: semaforoMeta[s].label })),
            },
            {
              key: 'estado',
              label: 'Estado',
              options: [
                { value: 'activa', label: 'Activa' },
                { value: 'vendida', label: 'Vendida' },
                { value: 'por_vencer', label: 'Por vencer' },
                { value: 'vencida', label: 'Vencida' },
              ],
            },
          ]}
          emptyTitle="Sin vencimientos registrados"
          emptyText="Cuando asignes cuentas a clientes con fecha de vencimiento aparecerán aquí."
        />
      </Panel>
    </div>
  );
}
