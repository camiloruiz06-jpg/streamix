import { Receipt, TrendingUp, Coins, Percent, Plus, Pencil } from 'lucide-react';
import { RecordForm } from '@/components/admin/RecordForm';
import {
  opcionesClientes, opcionesProveedores, opcionesServicios, opcionesPlanes,
  METODOS_PAGO, ESTADOS_VENTA, hoyISO,
} from '@/components/admin/campos';
import { PageHeader, Panel, StatCard, Money, Avatar } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { SaleBadge } from '@/components/ui/Badge';
import { getSales, getCustomers, getProviders, getServicesAdmin } from '@/lib/queries';
import { formatDateTime, formatMoney, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ventas' };

const metodos: Record<string, string> = {
  llaves: 'Llaves (Bre-B)',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  bancolombia: 'Bancolombia',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  paypal: 'PayPal',
  binance: 'Binance',
  otro: 'Otro',
};

export default async function VentasPage() {
  const [ventas, clientes, proveedores, catalogo] = await Promise.all([
    getSales(),
    getCustomers(),
    getProviders(),
    getServicesAdmin(),
  ]);

  const camposVenta = (v?: (typeof ventas)[number]) => [
    { name: 'customer_id', label: 'Cliente', tipo: 'select' as const, requerido: true, opciones: opcionesClientes(clientes), valor: v?.customer_id },
    { name: 'service_id', label: 'Servicio', tipo: 'select' as const, requerido: true, opciones: opcionesServicios(catalogo), valor: v?.service_id },
    { name: 'plan_id', label: 'Plan', tipo: 'select' as const, opciones: opcionesPlanes(catalogo), valor: v?.plan_id },
    { name: 'provider_id', label: 'Proveedor', tipo: 'select' as const, opciones: opcionesProveedores(proveedores), valor: v?.provider_id },
    { name: 'precio', label: 'Precio cobrado', tipo: 'numero' as const, prefijo: '$', requerido: true, valor: v?.precio ?? '' },
    { name: 'costo', label: 'Costo', tipo: 'numero' as const, prefijo: '$', requerido: true, valor: v?.costo ?? '', ayuda: 'La ganancia se calcula sola' },
    { name: 'metodo_pago', label: 'Método de pago', tipo: 'select' as const, requerido: true, opciones: METODOS_PAGO, valor: v?.metodo_pago ?? 'llaves' },
    { name: 'estado', label: 'Estado', tipo: 'select' as const, requerido: true, opciones: ESTADOS_VENTA, valor: v?.estado ?? 'entregada' },
    { name: 'fecha', label: 'Fecha', tipo: 'fecha' as const, valor: v ? v.fecha.slice(0, 10) : hoyISO() },
    { name: 'notas', label: 'Notas', tipo: 'textarea' as const, ancho: 'full' as const, valor: v?.notas },
  ];
  const validas = ventas.filter((v) => ['pagada', 'entregada'].includes(v.estado));

  const ingresos = validas.reduce((a, v) => a + v.precio, 0);
  const costos = validas.reduce((a, v) => a + v.costo, 0);
  const ganancia = ingresos - costos;
  const margen = ingresos > 0 ? Math.round((ganancia / ingresos) * 100) : 0;

  const servicios = [...new Set(ventas.map((v) => v.services?.nombre).filter(Boolean))] as string[];

  const rows: TableRow[] = ventas.map((v) => ({
    id: v.id,
    tags: {
      estado: v.estado,
      metodo: v.metodo_pago,
      servicio: v.services?.nombre ?? '—',
    },
    search: [
      String(v.numero), v.customers?.nombre, v.customers?.whatsapp,
      v.services?.nombre, v.service_plans?.nombre, v.providers?.nombre,
    ].filter(Boolean).join(' '),
    sort: [
      v.numero, v.customers?.nombre ?? '', v.services?.nombre ?? '',
      new Date(v.fecha).getTime(), v.precio, v.costo, v.ganancia,
      metodos[v.metodo_pago] ?? v.metodo_pago, v.estado,
    ],
    cells: [
      <span key="n" className="font-mono text-xs text-white/45">#{v.numero}</span>,
      <div key="c" className="flex items-center gap-2.5">
        <Avatar nombre={v.customers?.nombre ?? '?'} color={v.services?.color ?? '#a855f7'} />
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{v.customers?.nombre ?? 'Cliente'}</p>
          <p className="truncate text-xs text-white/35">{v.customers?.whatsapp ?? ''}</p>
        </div>
      </div>,
      <div key="s" className="min-w-0">
        <p className="truncate font-medium text-white">{v.services?.nombre}</p>
        <p className="truncate text-xs text-white/35">{v.service_plans?.nombre}</p>
      </div>,
      <span key="f" className="whitespace-nowrap text-white/60">{formatDateTime(v.fecha)}</span>,
      <Money key="p" value={v.precio} />,
      <Money key="co" value={v.costo} />,
      <Money key="g" value={v.ganancia} positivo />,
      <span key="m" className="text-white/60">{metodos[v.metodo_pago] ?? v.metodo_pago}</span>,
      <SaleBadge key="e" estado={v.estado} />,
      <div key="ac" className="flex justify-end">
        <RecordForm
          tabla="sales"
          id={v.id}
          titulo={`Venta #${v.numero}`}
          campos={camposVenta(v)}
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
        titulo="Ventas"
        descripcion="Historial completo con precio, costo y ganancia calculada automáticamente."
      >
        <RecordForm
          tabla="sales"
          titulo="Registrar venta"
          descripcion="Para ventas sueltas. Si vas a entregar un cupo del inventario, usa 'Entregar y vender' en Cuentas."
          campos={camposVenta()}
          botonLabel="Registrar venta"
          botonIcono={<Plus className="h-3.5 w-3.5" />}
        />
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas registradas" value={formatNumber(validas.length)} hint={`${ventas.length} registros en total`} icon={Receipt} tono="brand" />
        <StatCard label="Ingresos" value={formatMoney(ingresos)} hint="Pagadas y entregadas" icon={Coins} tono="blue" />
        <StatCard label="Ganancia" value={formatMoney(ganancia)} hint={`Costos: ${formatMoney(costos)}`} icon={TrendingUp} tono="green" />
        <StatCard label="Margen promedio" value={`${margen}%`} hint="Ganancia sobre ingresos" icon={Percent} tono="amber" />
      </div>

      <Panel>
        <DataTable
          headers={['N.º', 'Cliente', 'Servicio', 'Fecha', 'Precio', 'Costo', 'Ganancia', 'Pago', 'Estado', '']}
          rows={rows}
          alignRight={[4, 5, 6]}
          defaultSort={{ index: 3, dir: 'desc' }}
          searchPlaceholder="Buscar por número, cliente o servicio…"
          filters={[
            {
              key: 'estado',
              label: 'Estado',
              options: [
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'pagada', label: 'Pagada' },
                { value: 'entregada', label: 'Entregada' },
                { value: 'reembolsada', label: 'Reembolsada' },
                { value: 'cancelada', label: 'Cancelada' },
              ],
            },
            {
              key: 'servicio',
              label: 'Servicio',
              options: servicios.map((s) => ({ value: s, label: s })),
            },
            {
              key: 'metodo',
              label: 'Pago',
              options: Object.entries(metodos).map(([value, label]) => ({ value, label })),
            },
          ]}
          emptyTitle="Sin ventas registradas"
          emptyText="Registra tus ventas para ver aquí ingresos, costos y ganancia."
        />
      </Panel>
    </div>
  );
}
