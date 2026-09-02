import Link from 'next/link';
import { MessageCircle, AlertTriangle, Plus } from 'lucide-react';
import { PageHeader, Panel, Money } from '@/components/admin/Ui';
import { BotonActualizarVencimientos } from '@/components/admin/QuickAction';
import { BotonRenovar, BotonCambiarCuenta, BotonCambiarCliente } from '@/components/admin/SubAcciones';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { SemaforoBadge, semaforoMeta } from '@/components/ui/Badge';
import { getSubscriptions, getAccountSlots, getCustomers } from '@/lib/queries';
import { formatDateShort } from '@/lib/format';
import { waRecordatorio } from '@/lib/whatsapp';
import type { Semaforo } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vencimientos' };

const ordenSemaforo: Semaforo[] = ['vencido', 'hoy', 'critico', 'proximo', 'ok', 'sin_fecha'];

/** 'por_vencer' se lee horrible; esto lo pasa a español de verdad. */
const estadoCuenta: Record<string, string> = {
  disponible: 'disponible',
  activa: 'activa',
  vendida: 'vendida',
  por_vencer: 'por vencer',
  vencida: 'vencida',
  suspendida: 'suspendida',
  cancelada: 'cancelada',
};

export default async function VencimientosPage() {
  const [subs, cuentas, clientes] = await Promise.all([
    getSubscriptions(),
    getAccountSlots(),
    getCustomers(),
  ]);

  const resumen = ordenSemaforo.map((s) => ({
    semaforo: s,
    total: subs.filter((f) => f.semaforo === s).length,
  }));

  // Lo urgente de verdad: la cuenta se muere antes que el derecho del cliente
  const porReemplazar = subs.filter((s) => s.necesita_reemplazo && s.estado !== 'vencida');
  // Cuántos están sobre una cuenta que marcaste como mala
  const enCuentaMala = porReemplazar.filter(
    (s) => s.cuenta_estado && s.cuenta_estado !== 'activa' && s.cuenta_estado !== 'disponible',
  ).length;

  const rows: TableRow[] = subs.map((f) => ({
    id: f.subscription_id,
    tags: {
      semaforo: f.semaforo,
      servicio: f.servicio ?? '—',
      alerta: f.necesita_reemplazo ? 'si' : 'no',
      cuenta:
        f.cuenta_estado && !['activa', 'disponible'].includes(f.cuenta_estado) ? 'mala' : 'buena',
    },
    search: [f.cliente, f.servicio, f.plan, f.proveedor, f.cliente_whatsapp, f.credencial_usuario]
      .filter(Boolean)
      .join(' '),
    sort: [
      f.cliente ?? '',
      f.servicio ?? '',
      f.dias_restantes ?? 9999,
      f.precio,
      '',
    ],
    className:
      f.semaforo === 'vencido' || f.semaforo === 'hoy'
        ? 'bg-rose-500/[0.05]'
        : f.necesita_reemplazo
          ? 'bg-amber-500/[0.05]'
          : f.semaforo === 'critico'
            ? 'bg-amber-500/[0.04]'
            : undefined,
    cells: [
      <div key="c" className="min-w-0">
        <p className="truncate font-medium text-white">{f.cliente ?? '— sin cliente —'}</p>
        <p className="text-xs text-white/35">{f.cliente_whatsapp ?? ''}</p>
      </div>,
      <div key="s" className="min-w-0">
        <p className="truncate font-medium text-white">{f.servicio}</p>
        <p className="truncate text-xs text-white/35">{f.plan}</p>
      </div>,
      <div key="d">
        <SemaforoBadge semaforo={f.semaforo === 'sin_cuenta' ? 'sin_fecha' : f.semaforo} />
        <p className="mt-1 whitespace-nowrap text-xs tabular-nums text-white/40">
          {formatDateShort(f.fecha_fin)}
          {f.dias_restantes !== null &&
            ` · ${f.dias_restantes < 0 ? `${Math.abs(f.dias_restantes)} d. atrás` : `${f.dias_restantes} d.`}`}
        </p>
      </div>,
      <div key="ct" className="min-w-0">
        <p className="truncate text-xs text-white/55">{f.credencial_usuario ?? '— sin cuenta —'}</p>
        {f.necesita_reemplazo ? (
          <span className="mt-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
            <AlertTriangle className="h-2.5 w-2.5" />
            {f.cuenta_estado && !['activa', 'disponible'].includes(f.cuenta_estado)
              ? `cuenta ${estadoCuenta[f.cuenta_estado] ?? f.cuenta_estado}`
              : 'se vence antes'}
          </span>
        ) : (
          <p className="truncate text-xs text-white/30">
            {f.proveedor ?? ''}
            {f.cuenta_vence ? ` · vence ${formatDateShort(f.cuenta_vence)}` : ''}
          </p>
        )}
      </div>,
      <Money key="v" value={f.precio} />,
      <div key="ac" className="flex justify-end gap-1.5">
        <BotonRenovar sub={f} cuentas={cuentas} />
        <BotonCambiarCuenta sub={f} cuentas={cuentas} resaltado={f.necesita_reemplazo} compacto />
        <BotonCambiarCliente sub={f} clientes={clientes} />
        {f.cliente_whatsapp && (
          <a
            href={waRecordatorio(
              f.cliente_whatsapp,
              f.cliente ?? '',
              f.servicio ?? '',
              f.dias_restantes ?? 0,
            )}
            target="_blank"
            rel="noopener noreferrer"
            title="Recordarle por WhatsApp"
            className="btn-whatsapp btn-sm !px-2"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        )}
      </div>,
    ],
  }));

  const nombresServicios = [...new Set(subs.map((s) => s.servicio).filter(Boolean))] as string[];

  return (
    <div>
      <PageHeader
        titulo="Vencimientos"
        descripcion="Los días que le debes a cada cliente. Renueva sumando días, o pásalo a otra cuenta sin que pierda ninguno."
      >
        <BotonActualizarVencimientos />
        <Link href="/admin/vender" className="btn-primary btn-sm">
          <Plus className="h-3.5 w-3.5" /> Nueva venta
        </Link>
      </PageHeader>

      {porReemplazar.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-500/[0.07] p-5">
          <p className="mb-1 flex items-center gap-2 font-display font-bold text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            {porReemplazar.length}{' '}
            {porReemplazar.length === 1 ? 'cliente se quedó' : 'clientes se quedaron'} sin cuenta buena
          </p>
          <p className="mb-4 text-sm leading-relaxed text-amber-100/70">
            La cuenta que están usando se venció, la marcaste como mala, o se muere antes de que se
            les acaben los días que pagaron. Pásalos a otra cuenta con plazas libres: conservan su
            tiempo.
          </p>

          <div className="space-y-2">
            {porReemplazar.map((s) => (
              <div
                key={s.subscription_id}
                className="flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-black/20 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {s.cliente}
                    <span className="ml-2 text-sm font-normal text-white/45">{s.servicio}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-amber-100/60">
                    {s.credencial_usuario ?? 'sin cuenta'}
                    {s.cuenta_estado && s.cuenta_estado !== 'activa' && (
                      <>
                        {' · cuenta '}
                        <strong className="text-amber-200">
                          {estadoCuenta[s.cuenta_estado] ?? s.cuenta_estado}
                        </strong>
                      </>
                    )}
                    {s.cuenta_vence && <> · la cuenta vence {formatDateShort(s.cuenta_vence)}</>}
                    {' · '}él tiene derecho hasta {formatDateShort(s.fecha_fin)}
                    {s.dias_restantes !== null && ` (${s.dias_restantes} d.)`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <BotonCambiarCuenta sub={s} cuentas={cuentas} resaltado />
                  {s.cliente_whatsapp && (
                    <a
                      href={waRecordatorio(
                        s.cliente_whatsapp,
                        s.cliente ?? '',
                        s.servicio ?? '',
                        s.dias_restantes ?? 0,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Avisarle por WhatsApp"
                      className="btn-whatsapp btn-sm !px-2"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          headers={['Cliente', 'Servicio', 'Vence', 'Cuenta que usa', 'Pagó', 'Acciones']}
          rows={rows}
          alignRight={[4]}
          defaultSort={{ index: 2, dir: 'asc' }}
          searchPlaceholder="Buscar por cliente, servicio, proveedor o correo de la cuenta…"
          filters={[
            {
              key: 'semaforo',
              label: 'Plazo',
              options: ordenSemaforo.map((s) => ({ value: s, label: semaforoMeta[s].label })),
            },
            {
              key: 'alerta',
              label: 'Alerta',
              options: [
                { value: 'si', label: 'Necesita cambio de cuenta' },
                { value: 'no', label: 'Sin problema' },
              ],
            },
            {
              key: 'cuenta',
              label: 'Cuenta',
              options: [
                { value: 'mala', label: 'Vencida o suspendida' },
                { value: 'buena', label: 'En buen estado' },
              ],
            },
            {
              key: 'servicio',
              label: 'Servicio',
              options: nombresServicios.map((s) => ({ value: s, label: s })),
            },
          ]}
          emptyTitle="Sin clientes activos"
          emptyText="Cuando registres una venta aparecerá aquí el plazo de cada cliente."
        />
      </Panel>
    </div>
  );
}
