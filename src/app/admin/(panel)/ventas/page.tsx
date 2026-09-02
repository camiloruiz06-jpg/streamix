import { Receipt, TrendingUp, Coins, Percent } from 'lucide-react';
import { PageHeader, Panel, StatCard, Money, Avatar } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { SaleBadge } from '@/components/ui/Badge';
import { getSales } from '@/lib/queries';
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
  const ventas = await getSales();
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
    ],
  }));

  return (
    <div>
      <PageHeader
        titulo="Ventas"
        descripcion="Historial completo con precio, costo y ganancia calculada automáticamente."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ventas registradas" value={formatNumber(validas.length)} hint={`${ventas.length} registros en total`} icon={Receipt} tono="brand" />
        <StatCard label="Ingresos" value={formatMoney(ingresos)} hint="Pagadas y entregadas" icon={Coins} tono="blue" />
        <StatCard label="Ganancia" value={formatMoney(ganancia)} hint={`Costos: ${formatMoney(costos)}`} icon={TrendingUp} tono="green" />
        <StatCard label="Margen promedio" value={`${margen}%`} hint="Ganancia sobre ingresos" icon={Percent} tono="amber" />
      </div>

      <Panel>
        <DataTable
          headers={['N.º', 'Cliente', 'Servicio', 'Fecha', 'Precio', 'Costo', 'Ganancia', 'Pago', 'Estado']}
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
