import Link from 'next/link';
import { PackageCheck, KeyRound, Users, AlertTriangle, Plus, Pencil, ShoppingCart } from 'lucide-react';
import { RecordForm } from '@/components/admin/RecordForm';
import {
  camposCuenta, opcionesClientes, opcionesProveedores, opcionesServicios, opcionesPlanes,
} from '@/components/admin/campos';
import { PageHeader, Panel, StatCard, Avatar } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { AccountBadge } from '@/components/ui/Badge';
import {
  getAccounts, getCustomers, getProviders, getServicesAdmin,
  getAccountSlots, getSubscriptions,
} from '@/lib/queries';
import { formatDateShort, formatMoney, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cuentas e inventario' };

export default async function CuentasPage() {
  const [cuentas, clientes, proveedores, servicios, plazas, subs] = await Promise.all([
    getAccounts(), getCustomers(), getProviders(), getServicesAdmin(),
    getAccountSlots(), getSubscriptions(),
  ]);

  const opts = {
    servicios: opcionesServicios(servicios),
    planes: opcionesPlanes(servicios),
    proveedores: opcionesProveedores(proveedores),
    clientes: opcionesClientes(clientes),
  };

  const porCuenta = new Map(plazas.map((p) => [p.account_id, p]));
  const ocupantes = new Map<string, string[]>();
  for (const s of subs) {
    if (!s.account_id || s.estado === 'vencida' || s.estado === 'cancelada') continue;
    const lista = ocupantes.get(s.account_id) ?? [];
    lista.push(s.cliente ?? '—');
    ocupantes.set(s.account_id, lista);
  }

  const totalPlazas = plazas.reduce((a, p) => a + p.plazas_totales, 0);
  const libres = plazas.reduce((a, p) => a + Math.max(0, p.plazas_libres), 0);
  const invertido = cuentas.reduce((a, c) => a + c.costo_adquisicion, 0);
  const vencidas = plazas.filter((p) => (p.dias_cuenta ?? 99) < 0).length;

  const nombresServicios = [...new Set(cuentas.map((c) => c.services?.nombre).filter(Boolean))] as string[];

  const rows: TableRow[] = cuentas.map((c) => {
    const pl = porCuenta.get(c.id);
    const totales = pl?.plazas_totales ?? c.plazas_totales ?? 1;
    const usadas = pl?.plazas_ocupadas ?? 0;
    const disp = pl?.plazas_libres ?? totales - usadas;
    const quien = ocupantes.get(c.id) ?? [];

    return {
      id: c.id,
      tags: {
        estado: c.estado,
        servicio: c.services?.nombre ?? '—',
        plazas: disp > 0 ? 'libres' : 'llena',
      },
      search: [
        c.services?.nombre, c.service_plans?.nombre, c.providers?.nombre,
        c.credencial_usuario, c.perfil, ...quien,
      ].filter(Boolean).join(' '),
      sort: [
        c.services?.nombre ?? '', disp, usadas,
        c.fecha_vencimiento ?? '9999-12-31',
        c.costo_adquisicion, c.estado, '',
      ],
      cells: [
        <div key="s" className="flex items-center gap-2.5">
          <Avatar nombre={c.services?.nombre ?? '?'} color={c.services?.color ?? '#a855f7'} />
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{c.services?.nombre}</p>
            <p className="truncate text-xs text-white/35">{c.credencial_usuario ?? c.service_plans?.nombre}</p>
          </div>
        </div>,
        <div key="pl" className="min-w-[92px]">
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totales, 10) }).map((_, i) => (
              <span
                key={i}
                className={
                  i < usadas
                    ? 'h-2.5 w-2.5 rounded-full bg-brand-400'
                    : 'h-2.5 w-2.5 rounded-full border border-white/25'
                }
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-white/40">
            {usadas}/{totales} · {disp > 0
              ? <span className="text-emerald-300">{disp} libre{disp === 1 ? '' : 's'}</span>
              : <span className="text-white/30">llena</span>}
          </p>
        </div>,
        <span key="q" className="text-xs text-white/60">
          {quien.length === 0 ? <span className="text-white/25">— nadie —</span> : quien.join(', ')}
        </span>,
        <span key="p" className="text-white/60">{c.providers?.nombre ?? '—'}</span>,
        <span key="fv" className="whitespace-nowrap tabular-nums text-white/60">
          {formatDateShort(c.fecha_vencimiento)}
          {pl?.dias_cuenta !== null && pl?.dias_cuenta !== undefined && (
            <span className={pl.dias_cuenta < 0 ? ' text-rose-300' : ' text-white/30'}>
              {' '}({pl.dias_cuenta < 0 ? `${Math.abs(pl.dias_cuenta)} d. atrás` : `${pl.dias_cuenta} d.`})
            </span>
          )}
        </span>,
        <div key="co" className="whitespace-nowrap text-right">
          <p className="font-semibold tabular-nums text-white">{formatMoney(c.costo_adquisicion)}</p>
          <p className="text-xs tabular-nums text-white/35">
            {formatMoney(Math.round(pl?.costo_por_plaza ?? c.costo_adquisicion))} / plaza
          </p>
        </div>,
        <AccountBadge key="e" estado={c.estado} />,
        <div key="ac" className="flex justify-end">
          <RecordForm
            tabla="accounts"
            id={c.id}
            titulo={`${c.services?.nombre ?? 'Cuenta'} · ${c.service_plans?.nombre ?? ''}`}
            descripcion="Costos, fechas, plazas y credenciales de esta cuenta."
            campos={camposCuenta(c, opts)}
            botonLabel="Editar"
            botonClase="btn-ghost btn-sm"
            botonIcono={<Pencil className="h-3.5 w-3.5" />}
            permiteBorrar
          />
        </div>,
      ],
    };
  });

  return (
    <div>
      <PageHeader
        titulo="Cuentas e inventario"
        descripcion="Cada cuenta que le compras a un proveedor, con sus plazas. Una misma cuenta puede servirle a varios clientes."
      >
        <Link href="/admin/vender" className="btn-ghost btn-sm">
          <ShoppingCart className="h-3.5 w-3.5" /> Nueva venta
        </Link>
        <RecordForm
          tabla="accounts"
          titulo="Nueva cuenta"
          descripcion="Registra una cuenta que le compraste a un proveedor."
          campos={camposCuenta(undefined, opts)}
          botonLabel="Nueva cuenta"
          botonIcono={<Plus className="h-3.5 w-3.5" />}
        />
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Plazas libres" value={formatNumber(libres)} hint={`de ${formatNumber(totalPlazas)} en total`} icon={PackageCheck} tono={libres ? 'green' : 'amber'} />
        <StatCard label="Plazas ocupadas" value={formatNumber(totalPlazas - libres)} hint="Clientes conectados ahora" icon={Users} tono="brand" />
        <StatCard label="Cuentas vencidas" value={formatNumber(vencidas)} hint="Hay que reponerlas" icon={AlertTriangle} tono={vencidas ? 'red' : 'blue'} />
        <StatCard label="Invertido" value={formatMoney(invertido)} hint="Costo total del inventario" icon={KeyRound} tono="amber" />
      </div>

      <Panel>
        <DataTable
          headers={['Cuenta', 'Plazas', 'Quién la usa', 'Proveedor', 'Vence', 'Costo', 'Estado', '']}
          rows={rows}
          alignRight={[5]}
          searchPlaceholder="Buscar por servicio, correo, proveedor o cliente…"
          filters={[
            {
              key: 'plazas',
              label: 'Plazas',
              options: [
                { value: 'libres', label: 'Con plazas libres' },
                { value: 'llena', label: 'Llenas' },
              ],
            },
            {
              key: 'estado',
              label: 'Estado',
              options: [
                { value: 'disponible', label: 'Disponible' },
                { value: 'activa', label: 'Activa' },
                { value: 'vencida', label: 'Vencida' },
                { value: 'suspendida', label: 'Suspendida' },
                { value: 'cancelada', label: 'Cancelada' },
              ],
            },
            {
              key: 'servicio',
              label: 'Servicio',
              options: nombresServicios.map((s) => ({ value: s, label: s })),
            },
          ]}
          emptyTitle="Sin cuentas registradas"
          emptyText="Registra las cuentas que le compras a tus proveedores para llevar el control de plazas, costos y vencimientos."
        />
      </Panel>

      <p className="mt-6 rounded-2xl border border-white/10 bg-ink-900/40 p-4 text-xs leading-relaxed text-white/40">
        <strong className="text-white/60">Cómo leerlo:</strong> los puntos morados son plazas ocupadas
        y los huecos son plazas libres. <strong className="text-white/60">Por plaza</strong> es lo que
        te cuesta cada cliente en esa cuenta: entre más gente le metas, menos te cuesta cada uno.
        Evita guardar contraseñas en texto plano; mándalas por WhatsApp.
      </p>
    </div>
  );
}
