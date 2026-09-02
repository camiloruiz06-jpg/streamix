import { Coins, TrendingUp, Percent, Wallet } from 'lucide-react';
import { PageHeader, Panel, StatCard, Money } from '@/components/admin/Ui';
import { FinanzasMensuales, GananciaPorServicio } from '@/components/admin/Charts';
import {
  getMonthlyFinance, getFinanceByService, getFinanceByProvider, getSales,
} from '@/lib/queries';
import { formatMoney, formatMonth } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Finanzas' };

export default async function FinanzasPage() {
  const [mensual, porServicio, porProveedor, ventas] = await Promise.all([
    getMonthlyFinance(),
    getFinanceByService(),
    getFinanceByProvider(),
    getSales(),
  ]);

  const validas = ventas.filter((v) => ['pagada', 'entregada'].includes(v.estado));
  const ingresos = validas.reduce((a, v) => a + v.precio, 0);
  const costos = validas.reduce((a, v) => a + v.costo, 0);
  const ganancia = ingresos - costos;
  const margen = ingresos > 0 ? Math.round((ganancia / ingresos) * 100) : 0;
  const ticket = validas.length > 0 ? Math.round(ingresos / validas.length) : 0;

  return (
    <div>
      <PageHeader
        titulo="Control financiero"
        descripcion="Ganancia = precio de venta − costo de adquisición. Todo se calcula automáticamente sobre las ventas pagadas y entregadas."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ingresos totales" value={formatMoney(ingresos)} hint={`${validas.length} ventas`} icon={Wallet} tono="brand" />
        <StatCard label="Costos totales" value={formatMoney(costos)} hint="Pagado a proveedores" icon={Coins} tono="amber" />
        <StatCard label="Ganancia bruta" value={formatMoney(ganancia)} hint={`Margen ${margen}%`} icon={TrendingUp} tono="green" />
        <StatCard label="Ticket promedio" value={formatMoney(ticket)} hint="Valor medio por venta" icon={Percent} tono="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Panel
          titulo="Evolución mensual"
          descripcion="Costos y ganancia por mes. La suma de ambas bandas es el ingreso total."
          className="xl:col-span-3"
        >
          <FinanzasMensuales data={mensual} />
        </Panel>

        <Panel
          titulo="Ganancia por servicio"
          descripcion="Qué servicios te dejan más dinero."
          className="xl:col-span-2"
        >
          <GananciaPorServicio data={porServicio} />
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel titulo="Rentabilidad por servicio">
          <div className="table-wrap">
            <table className="tbl min-w-[520px]">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-right">Ingresos</th>
                  <th className="text-right">Ganancia</th>
                  <th className="text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {porServicio.map((s) => {
                  const m = s.ingresos > 0 ? Math.round((s.ganancia / s.ingresos) * 100) : 0;
                  return (
                    <tr key={s.service_id}>
                      <td className="font-medium text-white">{s.servicio}</td>
                      <td className="text-right tabular-nums">{s.ventas}</td>
                      <td className="text-right"><Money value={s.ingresos} /></td>
                      <td className="text-right"><Money value={s.ganancia} positivo /></td>
                      <td className="text-right tabular-nums text-white/60">
                        {s.ingresos > 0 ? `${m}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel titulo="Rentabilidad por proveedor">
          <div className="table-wrap">
            <table className="tbl min-w-[460px]">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-right">Invertido</th>
                  <th className="text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {porProveedor.map((p) => (
                  <tr key={p.provider_id}>
                    <td className="font-medium text-white">{p.proveedor}</td>
                    <td className="text-right tabular-nums">{p.ventas}</td>
                    <td className="text-right"><Money value={p.invertido} /></td>
                    <td className="text-right"><Money value={p.ganancia} positivo /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel titulo="Detalle por mes" className="mt-5">
        <div className="table-wrap">
          <table className="tbl min-w-[560px]">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="text-right">Ventas</th>
                <th className="text-right">Ingresos</th>
                <th className="text-right">Costos</th>
                <th className="text-right">Ganancia</th>
                <th className="text-right">Margen</th>
              </tr>
            </thead>
            <tbody>
              {[...mensual].reverse().map((m) => {
                const pct = m.ingresos > 0 ? Math.round((m.ganancia / m.ingresos) * 100) : 0;
                return (
                  <tr key={m.mes}>
                    <td className="font-medium capitalize text-white">{formatMonth(m.mes)}</td>
                    <td className="text-right tabular-nums">{m.ventas}</td>
                    <td className="text-right"><Money value={m.ingresos} /></td>
                    <td className="text-right"><Money value={m.costos} /></td>
                    <td className="text-right"><Money value={m.ganancia} positivo /></td>
                    <td className="text-right tabular-nums text-white/60">
                      {m.ingresos > 0 ? `${pct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
