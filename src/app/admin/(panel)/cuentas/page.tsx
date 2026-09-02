import { PackageCheck, KeyRound, ShoppingBag, AlertTriangle } from 'lucide-react';
import { PageHeader, Panel, StatCard, Money, Avatar } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { AccountBadge } from '@/components/ui/Badge';
import { getAccounts } from '@/lib/queries';
import { formatDateShort, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cuentas e inventario' };

export default async function CuentasPage() {
  const cuentas = await getAccounts();

  const disponibles = cuentas.filter((c) => c.estado === 'disponible');
  const activas = cuentas.filter((c) => ['activa', 'vendida'].includes(c.estado));
  const vencidas = cuentas.filter((c) => c.estado === 'vencida');
  const invertido = cuentas.reduce((a, c) => a + c.costo_adquisicion, 0);

  const servicios = [...new Set(cuentas.map((c) => c.services?.nombre).filter(Boolean))] as string[];

  const rows: TableRow[] = cuentas.map((c) => ({
    id: c.id,
    tags: {
      estado: c.estado,
      servicio: c.services?.nombre ?? '—',
      proveedor: c.providers?.nombre ?? '—',
    },
    search: [
      c.services?.nombre, c.service_plans?.nombre, c.providers?.nombre,
      c.customers?.nombre, c.credencial_usuario, c.perfil,
    ].filter(Boolean).join(' '),
    sort: [
      c.services?.nombre ?? '', c.customers?.nombre ?? '', c.providers?.nombre ?? '',
      c.fecha_vencimiento ?? '9999-12-31', c.costo_adquisicion, c.precio_venta, c.ganancia, c.estado,
    ],
    cells: [
      <div key="s" className="flex items-center gap-2.5">
        <Avatar nombre={c.services?.nombre ?? '?'} color={c.services?.color ?? '#a855f7'} />
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{c.services?.nombre}</p>
          <p className="truncate text-xs text-white/35">{c.service_plans?.nombre}</p>
        </div>
      </div>,
      <div key="cr" className="min-w-0">
        <p className="truncate text-xs text-white/60">{c.credencial_usuario ?? '—'}</p>
        {c.perfil && <p className="truncate text-xs text-white/30">{c.perfil}</p>}
      </div>,
      <span key="cl" className="text-white/70">{c.customers?.nombre ?? '— libre —'}</span>,
      <span key="p" className="text-white/60">{c.providers?.nombre ?? '—'}</span>,
      <span key="fv" className="tabular-nums text-white/60">
        {formatDateShort(c.fecha_vencimiento)}
      </span>,
      <Money key="co" value={c.costo_adquisicion} />,
      <Money key="pv" value={c.precio_venta} />,
      <Money key="g" value={c.ganancia} positivo />,
      <AccountBadge key="e" estado={c.estado} />,
    ],
  }));

  return (
    <div>
      <PageHeader
        titulo="Cuentas e inventario"
        descripcion="Cada cupo o cuenta que compras a un proveedor, con su costo, su precio de venta y a quién está asignada."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Disponibles" value={formatNumber(disponibles.length)} hint="Listas para vender" icon={PackageCheck} tono="green" />
        <StatCard label="Asignadas" value={formatNumber(activas.length)} hint="En uso por clientes" icon={ShoppingBag} tono="brand" />
        <StatCard label="Vencidas" value={formatNumber(vencidas.length)} hint="Requieren renovación" icon={AlertTriangle} tono={vencidas.length ? 'red' : 'blue'} />
        <StatCard label="Invertido en inventario" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(invertido)} hint="Costo total acumulado" icon={KeyRound} tono="amber" />
      </div>

      <Panel>
        <DataTable
          headers={['Servicio', 'Credencial', 'Cliente', 'Proveedor', 'Vence', 'Costo', 'Precio', 'Ganancia', 'Estado']}
          rows={rows}
          alignRight={[5, 6, 7]}
          searchPlaceholder="Buscar por servicio, cliente, proveedor o credencial…"
          filters={[
            {
              key: 'estado',
              label: 'Estado',
              options: [
                { value: 'disponible', label: 'Disponible' },
                { value: 'activa', label: 'Activa' },
                { value: 'vendida', label: 'Vendida' },
                { value: 'por_vencer', label: 'Por vencer' },
                { value: 'vencida', label: 'Vencida' },
                { value: 'suspendida', label: 'Suspendida' },
                { value: 'cancelada', label: 'Cancelada' },
              ],
            },
            {
              key: 'servicio',
              label: 'Servicio',
              options: servicios.map((s) => ({ value: s, label: s })),
            },
          ]}
          emptyTitle="Sin cuentas registradas"
          emptyText="Registra las cuentas que compras a tus proveedores para llevar el control de costos y vencimientos."
        />
      </Panel>

      <p className="mt-6 rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-xs leading-relaxed text-white/40">
        <strong className="text-white/60">Nota de seguridad:</strong> evita guardar contraseñas en
        texto plano. El campo <code className="rounded bg-white/5 px-1">credencial_secreto</code>{' '}
        existe por compatibilidad, pero lo recomendable es almacenar solo el correo o identificador
        y enviar la contraseña directamente al cliente por WhatsApp.
      </p>
    </div>
  );
}
