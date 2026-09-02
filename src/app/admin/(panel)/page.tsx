import Link from 'next/link';
import {
  Users, ShoppingBag, KeyRound, PackageCheck, AlertTriangle, CalendarX2,
  Truck, Clapperboard, TrendingUp, Wallet, Coins, ArrowRight, MessageCircle,
} from 'lucide-react';
import { PageHeader, StatCard, Panel, Money, Avatar } from '@/components/admin/Ui';
import { FinanzasMensuales, GananciaPorServicio } from '@/components/admin/Charts';
import { SemaforoBadge, SaleBadge } from '@/components/ui/Badge';
import {
  getStats, getMonthlyFinance, getFinanceByService, getExpirations, getSales, isDemo,
} from '@/lib/queries';
import { formatDateShort, formatMoney, formatNumber } from '@/lib/format';
import { waRecordatorio } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, mensual, porServicio, vencimientos, ventas] = await Promise.all([
    getStats(),
    getMonthlyFinance(),
    getFinanceByService(),
    getExpirations(6),
    getSales(),
  ]);

  const alertas = vencimientos.filter((v) =>
    ['vencido', 'hoy', 'critico'].includes(v.semaforo),
  );
  const ultimasVentas = ventas.slice(0, 6);
  const margen =
    stats.ventas_mes > 0 ? Math.round((stats.ganancia_mes / stats.ventas_mes) * 100) : 0;

  return (
    <div>
      <PageHeader
        titulo="Dashboard"
        descripcion={
          isDemo()
            ? 'Estás viendo datos de demostración. Conecta Supabase para ver tu operación real.'
            : 'Resumen de tu operación en tiempo real.'
        }
      >
        <Link href="/admin/vencimientos" className="btn-ghost btn-sm">
          Ver vencimientos
        </Link>
        <Link href="/admin/ventas" className="btn-primary btn-sm">
          Ventas
        </Link>
      </PageHeader>

      {/* Alertas de vencimiento */}
      {alertas.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-400/25 bg-amber-500/[0.07] p-5">
          <p className="mb-3 flex items-center gap-2 font-display font-bold text-amber-100">
            <AlertTriangle className="h-4.5 w-4.5" />
            {alertas.length} servicio{alertas.length === 1 ? '' : 's'} necesita
            {alertas.length === 1 ? '' : 'n'} tu atención
          </p>
          <ul className="space-y-2">
            {alertas.slice(0, 4).map((a) => (
              <li
                key={a.account_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/20 px-3.5 py-2.5 text-sm"
              >
                <span className="text-white/80">
                  ⚠️ <strong className="font-semibold">{a.servicio}</strong> de{' '}
                  <strong className="font-semibold">{a.cliente ?? 'sin cliente'}</strong>{' '}
                  {a.dias_restantes === null
                    ? 'sin fecha'
                    : a.dias_restantes < 0
                      ? `venció hace ${Math.abs(a.dias_restantes)} día${Math.abs(a.dias_restantes) === 1 ? '' : 's'}`
                      : a.dias_restantes === 0
                        ? 'vence hoy'
                        : `vence en ${a.dias_restantes} día${a.dias_restantes === 1 ? '' : 's'}`}
                </span>
                {a.cliente_whatsapp && (
                  <a
                    href={waRecordatorio(
                      a.cliente_whatsapp,
                      a.cliente ?? '',
                      a.servicio ?? '',
                      a.dias_restantes ?? 0,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp btn-sm shrink-0"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Recordar
                  </a>
                )}
              </li>
            ))}
          </ul>
          {alertas.length > 4 && (
            <Link
              href="/admin/vencimientos"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-200 hover:text-amber-100"
            >
              Ver los {alertas.length} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* KPIs financieros */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas del mes"
          value={formatMoney(stats.ventas_mes)}
          hint={`Hoy: ${formatMoney(stats.ventas_hoy)}`}
          icon={Wallet}
          tono="brand"
        />
        <StatCard
          label="Ganancia del mes"
          value={formatMoney(stats.ganancia_mes)}
          hint={`Margen ${margen}%`}
          icon={TrendingUp}
          tono="green"
        />
        <StatCard
          label="Costos del mes"
          value={formatMoney(stats.costos_mes)}
          hint="Lo invertido con proveedores"
          icon={Coins}
          tono="amber"
        />
        <StatCard
          label="Ganancia acumulada"
          value={formatMoney(stats.ganancia_total)}
          hint="Histórico total"
          icon={TrendingUp}
          tono="blue"
        />
      </div>

      {/* KPIs operativos */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clientes"
          value={formatNumber(stats.clientes_totales)}
          hint={`${stats.clientes_activos} activos`}
          icon={Users}
          tono="brand"
        />
        <StatCard
          label="Servicios vendidos"
          value={formatNumber(stats.servicios_vendidos)}
          hint={`${stats.cuentas_activas} activos ahora`}
          icon={ShoppingBag}
          tono="blue"
        />
        <StatCard
          label="Inventario disponible"
          value={formatNumber(stats.cuentas_disponibles)}
          hint="Cupos listos para vender"
          icon={PackageCheck}
          tono="green"
        />
        <StatCard
          label="Por vencer / vencidos"
          value={`${stats.por_vencer} / ${stats.vencidas}`}
          hint="Próximos 7 días"
          icon={CalendarX2}
          tono={stats.vencidas > 0 ? 'red' : 'amber'}
        />
      </div>

      {/* Gráficas */}
      <div className="mt-8 grid gap-5 xl:grid-cols-5">
        <Panel
          titulo="Evolución mensual"
          descripcion="Costos y ganancia de los últimos meses. La suma de ambos es el ingreso."
          className="xl:col-span-3"
        >
          <FinanzasMensuales data={mensual} />
        </Panel>

        <Panel
          titulo="Ganancia por servicio"
          descripcion="Qué servicios te están dejando más dinero."
          className="xl:col-span-2"
        >
          <GananciaPorServicio data={porServicio} />
        </Panel>
      </div>

      {/* Listas */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          titulo="Próximos vencimientos"
          accion={
            <Link href="/admin/vencimientos" className="btn-ghost btn-sm">
              Ver todos
            </Link>
          }
        >
          {vencimientos.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/35">Sin vencimientos próximos.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {vencimientos.map((v) => (
                <li key={v.account_id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {v.servicio}{' '}
                      <span className="font-normal text-white/40">· {v.cliente ?? 'sin cliente'}</span>
                    </p>
                    <p className="text-xs text-white/35">
                      {formatDateShort(v.fecha_vencimiento)}
                      {v.dias_restantes !== null && ` · ${v.dias_restantes} días`}
                    </p>
                  </div>
                  <SemaforoBadge semaforo={v.semaforo} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          titulo="Últimas ventas"
          accion={
            <Link href="/admin/ventas" className="btn-ghost btn-sm">
              Ver todas
            </Link>
          }
        >
          {ultimasVentas.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/35">Aún no hay ventas registradas.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {ultimasVentas.map((v) => (
                <li key={v.id} className="flex items-center gap-3 py-3">
                  <Avatar nombre={v.customers?.nombre ?? '?'} color={v.services?.color ?? '#a855f7'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {v.customers?.nombre ?? 'Cliente'}{' '}
                      <span className="font-normal text-white/40">· {v.services?.nombre}</span>
                    </p>
                    <p className="text-xs text-white/35">#{v.numero} · {formatDateShort(v.fecha)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Money value={v.precio} />
                    <div className="mt-1"><SaleBadge estado={v.estado} /></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Accesos rápidos */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/admin/servicios', label: 'Servicios y planes', icon: Clapperboard, texto: `${stats.servicios_catalogo} en catálogo` },
          { href: '/admin/proveedores', label: 'Proveedores', icon: Truck, texto: `${stats.proveedores_activos} activos` },
          { href: '/admin/comparador', label: 'Comparador', icon: KeyRound, texto: 'Dónde comprar más barato' },
          { href: '/admin/finanzas', label: 'Finanzas', icon: TrendingUp, texto: 'Rentabilidad por servicio' },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-ink-900/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-400/25 bg-brand-500/12 transition-transform group-hover:scale-110">
              <a.icon className="h-4.5 w-4.5 text-brand-300" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{a.label}</span>
              <span className="block truncate text-xs text-white/40">{a.texto}</span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-brand-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
