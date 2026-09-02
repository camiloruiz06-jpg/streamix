import { PackageCheck, KeyRound, ShoppingBag, AlertTriangle, Plus, Pencil, Handshake } from 'lucide-react';
import { RecordForm } from '@/components/admin/RecordForm';
import {
  camposCuenta, opcionesClientes, opcionesProveedores, opcionesServicios,
  opcionesPlanes, opcionesCuentasDisponibles, METODOS_PAGO,
} from '@/components/admin/campos';
import { PageHeader, Panel, StatCard, Money, Avatar } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { AccountBadge } from '@/components/ui/Badge';
import { getAccounts, getCustomers, getProviders, getServicesAdmin } from '@/lib/queries';
import { formatDateShort, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cuentas e inventario' };

export default async function CuentasPage() {
  const [cuentas, clientes, proveedores, servicios] = await Promise.all([
    getAccounts(),
    getCustomers(),
    getProviders(),
    getServicesAdmin(),
  ]);

  const opts = {
    servicios: opcionesServicios(servicios),
    planes: opcionesPlanes(servicios),
    proveedores: opcionesProveedores(proveedores),
    clientes: opcionesClientes(clientes),
  };

  const disponibles = cuentas.filter((c) => c.estado === 'disponible');
  const activas = cuentas.filter((c) => ['activa', 'vendida'].includes(c.estado));
  const vencidas = cuentas.filter((c) => c.estado === 'vencida');
  const invertido = cuentas.reduce((a, c) => a + c.costo_adquisicion, 0);

  const nombresServicios = [...new Set(cuentas.map((c) => c.services?.nombre).filter(Boolean))] as string[];

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
      <div key="ac" className="flex justify-end">
        <RecordForm
          tabla="accounts"
          id={c.id}
          titulo={`${c.services?.nombre ?? 'Cuenta'} · ${c.service_plans?.nombre ?? ''}`}
          descripcion="Edita costos, fechas o a quién está asignada."
          campos={camposCuenta(c, opts)}
          botonLabel="Editar"
          botonClase="btn-ghost btn-sm"
          botonIcono={<Pencil className="h-3.5 w-3.5" />}
          permiteBorrar
        />
      </div>,
    ],
  }));

  return (
    <div>
      <PageHeader
        titulo="Cuentas e inventario"
        descripcion="Cada cupo o cuenta que compras a un proveedor, con su costo, su precio de venta y a quién está asignada."
      >
        <RecordForm
          tabla="accounts"
          accion="vender"
          titulo="Entregar una cuenta"
          descripcion="Asigna un cupo disponible a un cliente y registra la venta de una vez."
          campos={[
            { name: 'account_id', label: 'Cuenta a entregar', tipo: 'select', requerido: true, ancho: 'full', opciones: opcionesCuentasDisponibles(cuentas), placeholder: '— elegir del inventario disponible —' },
            { name: 'customer_id', label: 'Cliente', tipo: 'select', requerido: true, opciones: opts.clientes },
            { name: 'precio', label: 'Precio cobrado', tipo: 'numero', prefijo: '$', requerido: true },
            { name: 'metodo_pago', label: 'Método de pago', tipo: 'select', requerido: true, opciones: METODOS_PAGO, valor: 'llaves' },
            { name: 'fecha_vencimiento', label: 'Vence el', tipo: 'fecha', ayuda: 'Si lo dejas vacío se calcula con la duración del plan' },
            { name: 'notas', label: 'Notas', tipo: 'textarea', ancho: 'full' },
          ]}
          botonLabel="Entregar y vender"
          botonClase="btn-ghost btn-sm"
          botonIcono={<Handshake className="h-3.5 w-3.5" />}
        />
        <RecordForm
          tabla="accounts"
          titulo="Nueva cuenta"
          descripcion="Registra un cupo que le compraste a un proveedor."
          campos={camposCuenta(undefined, opts)}
          botonLabel="Nueva cuenta"
          botonIcono={<Plus className="h-3.5 w-3.5" />}
        />
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Disponibles" value={formatNumber(disponibles.length)} hint="Listas para vender" icon={PackageCheck} tono="green" />
        <StatCard label="Asignadas" value={formatNumber(activas.length)} hint="En uso por clientes" icon={ShoppingBag} tono="brand" />
        <StatCard label="Vencidas" value={formatNumber(vencidas.length)} hint="Requieren renovación" icon={AlertTriangle} tono={vencidas.length ? 'red' : 'blue'} />
        <StatCard label="Invertido en inventario" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(invertido)} hint="Costo total acumulado" icon={KeyRound} tono="amber" />
      </div>

      <Panel>
        <DataTable
          headers={['Servicio', 'Credencial', 'Cliente', 'Proveedor', 'Vence', 'Costo', 'Precio', 'Ganancia', 'Estado', '']}
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
              options: nombresServicios.map((s) => ({ value: s, label: s })),
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
