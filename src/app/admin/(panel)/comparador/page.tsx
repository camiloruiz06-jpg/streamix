import { Trophy, Scale, TrendingDown, Percent } from 'lucide-react';
import { PageHeader, Panel, StatCard, Money } from '@/components/admin/Ui';
import { DataTable, type TableRow } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { getComparison } from '@/lib/queries';
import { formatDuration, formatMoney, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Comparador de proveedores' };

export default async function ComparadorPage() {
  const filas = await getComparison();

  /* Mejor opción por servicio+plan, medida en costo normalizado a 30 días */
  const mejores = new Map<string, string>();
  for (const f of filas) {
    const clave = `${f.service_id}|${f.plan}`;
    const actual = mejores.get(clave);
    if (!actual) {
      mejores.set(clave, f.price_id);
    } else {
      const rival = filas.find((x) => x.price_id === actual)!;
      if (f.costo_30_dias < rival.costo_30_dias) mejores.set(clave, f.price_id);
    }
  }
  const esMejor = (id: string) => [...mejores.values()].includes(id);

  const ganadoras = filas.filter((f) => esMejor(f.price_id));
  const ahorroPotencial = [...mejores.entries()].reduce((total, [clave, mejorId]) => {
    const grupo = filas.filter((f) => `${f.service_id}|${f.plan}` === clave);
    if (grupo.length < 2) return total;
    const mejor = grupo.find((f) => f.price_id === mejorId)!;
    const peor = grupo.reduce((a, b) => (a.costo_30_dias > b.costo_30_dias ? a : b));
    return total + (peor.costo_30_dias - mejor.costo_30_dias);
  }, 0);

  const margenPromedio =
    ganadoras.length > 0
      ? Math.round(
          ganadoras.reduce((a, f) => a + (f.margen_pct ?? 0), 0) / ganadoras.length,
        )
      : 0;

  const servicios = [...new Set(filas.map((f) => f.servicio))];
  const proveedores = [...new Set(filas.map((f) => f.proveedor))];

  const rows: TableRow[] = filas.map((f) => {
    const mejor = esMejor(f.price_id);
    return {
      id: f.price_id,
      tags: { servicio: f.servicio, proveedor: f.proveedor, mejor: mejor ? 'si' : 'no' },
      search: [f.servicio, f.proveedor, f.plan, f.condiciones].filter(Boolean).join(' '),
      sort: [
        f.servicio, f.plan, f.proveedor, f.costo, f.duracion_dias,
        f.costo_30_dias, f.margen ?? 0, f.margen_pct ?? 0, mejor ? 0 : 1,
      ],
      className: mejor ? 'bg-emerald-500/[0.05]' : undefined,
      cells: [
        <span key="s" className="font-medium text-white">{f.servicio}</span>,
        <span key="pl" className="text-white/60">{f.plan}</span>,
        <span key="pr" className="text-white/75">{f.proveedor}</span>,
        <Money key="c" value={f.costo} />,
        <Badge key="d" tone="gray">{formatDuration(f.duracion_dias)}</Badge>,
        <span key="c30" className={mejor ? 'font-bold text-emerald-300' : 'text-white/70'}>
          {formatMoney(f.costo_30_dias)}
        </span>,
        f.margen !== null ? <Money key="m" value={f.margen} positivo /> : <span key="m" className="text-white/25">—</span>,
        <span key="mp" className="tabular-nums text-white/60">
          {f.margen_pct !== null ? `${f.margen_pct}%` : '—'}
        </span>,
        mejor ? (
          <Badge key="b" tone="green">🏆 Mejor opción</Badge>
        ) : (
          <span key="b" className="text-xs text-white/25">—</span>
        ),
      ],
    };
  });

  return (
    <div>
      <PageHeader
        titulo="Comparador de proveedores"
        descripcion="Mismo servicio, distintos proveedores. La comparación se hace sobre el costo normalizado a 30 días, así una oferta de 45 días no se ve artificialmente cara."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Precios comparados" value={formatNumber(filas.length)} hint={`${servicios.length} servicios · ${proveedores.length} proveedores`} icon={Scale} tono="brand" />
        <StatCard label="Mejores opciones" value={formatNumber(mejores.size)} hint="Una por servicio y plan" icon={Trophy} tono="green" />
        <StatCard label="Ahorro potencial" value={formatMoney(ahorroPotencial)} hint="Comprando siempre al más barato" icon={TrendingDown} tono="amber" />
        <StatCard label="Margen promedio" value={`${margenPromedio}%`} hint="En las mejores opciones" icon={Percent} tono="blue" />
      </div>

      {/* Ganadores por servicio */}
      <Panel
        titulo="Dónde conviene comprar cada servicio"
        descripcion="El proveedor más barato por cada combinación de servicio y plan."
        className="mb-5"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ganadoras.map((g) => (
            <div
              key={g.price_id}
              className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.07] p-4"
            >
              <p className="text-sm font-semibold text-white">{g.servicio}</p>
              <p className="text-xs text-white/45">{g.plan}</p>
              <p className="mt-3 font-display text-xl font-extrabold text-emerald-300">
                {g.proveedor}
              </p>
              <p className="mt-1 text-xs text-white/50">
                {formatMoney(g.costo)} por {formatDuration(g.duracion_dias)}
                {' · '}
                <span className="text-white/35">{formatMoney(g.costo_30_dias)}/30 d.</span>
              </p>
              {g.margen !== null && (
                <p className="mt-2 text-xs text-white/45">
                  Margen: <Money value={g.margen} positivo />{' '}
                  {g.margen_pct !== null && <span className="text-white/30">({g.margen_pct}%)</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <DataTable
          headers={['Servicio', 'Plan', 'Proveedor', 'Costo', 'Duración', 'Costo /30 días', 'Margen', 'Margen %', '']}
          rows={rows}
          alignRight={[3, 5, 6, 7]}
          defaultSort={{ index: 0, dir: 'asc' }}
          searchPlaceholder="Buscar por servicio o proveedor…"
          filters={[
            { key: 'servicio', label: 'Servicio', options: servicios.map((s) => ({ value: s, label: s })) },
            { key: 'proveedor', label: 'Proveedor', options: proveedores.map((p) => ({ value: p, label: p })) },
            { key: 'mejor', label: 'Solo mejores', options: [{ value: 'si', label: 'Mejor opción' }] },
          ]}
          emptyTitle="Sin precios de proveedor"
          emptyText="Registra los precios de cada proveedor en la tabla provider_prices para poder compararlos."
        />
      </Panel>
    </div>
  );
}
