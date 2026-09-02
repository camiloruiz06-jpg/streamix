import Link from 'next/link';
import { MessageCircle, Truck, Scale, TrendingUp, Package } from 'lucide-react';
import { PageHeader, Panel, StatCard, Money } from '@/components/admin/Ui';
import { ProviderBadge, Badge } from '@/components/ui/Badge';
import { getProviders, getComparison, getFinanceByProvider } from '@/lib/queries';
import { formatDuration, formatMoney, formatNumber } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';
import { site } from '@/config/site';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Proveedores' };

export default async function ProveedoresPage() {
  const [proveedores, comparacion, finanzas] = await Promise.all([
    getProviders(),
    getComparison(),
    getFinanceByProvider(),
  ]);

  const activos = proveedores.filter((p) => p.estado === 'activo');
  const invertido = finanzas.reduce((a, f) => a + f.invertido, 0);
  const gananciaTotal = finanzas.reduce((a, f) => a + f.ganancia, 0);

  return (
    <div>
      <PageHeader
        titulo="Proveedores"
        descripcion="Con quién compras, a qué precio y cuánto te ha dejado cada uno."
      >
        <Link href="/admin/comparador" className="btn-primary btn-sm">
          <Scale className="h-3.5 w-3.5" /> Comparar precios
        </Link>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Proveedores" value={formatNumber(proveedores.length)} hint={`${activos.length} activos`} icon={Truck} tono="brand" />
        <StatCard label="Precios registrados" value={formatNumber(comparacion.length)} hint="Para el comparador" icon={Package} tono="blue" />
        <StatCard label="Invertido" value={formatMoney(invertido)} hint="Total pagado a proveedores" icon={Package} tono="amber" />
        <StatCard label="Ganancia generada" value={formatMoney(gananciaTotal)} hint="Margen acumulado" icon={TrendingUp} tono="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {proveedores.map((p) => {
          const precios = comparacion.filter((c) => c.provider_id === p.id);
          const fin = finanzas.find((f) => f.provider_id === p.id);
          return (
            <Panel key={p.id}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold text-white">{p.nombre}</h2>
                    <ProviderBadge estado={p.estado} />
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    {p.contacto ?? 'Sin contacto'}
                    {p.email ? ` · ${p.email}` : ''}
                  </p>
                </div>
                {p.whatsapp && (
                  <a
                    href={waLink(`¡Hola! 👋 Te escribo de ${site.name}, quiero consultar disponibilidad.`, p.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp btn-sm shrink-0"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Escribir
                  </a>
                )}
              </div>

              {p.condiciones && (
                <p className="mb-4 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-xs leading-relaxed text-white/50">
                  {p.condiciones}
                </p>
              )}

              <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-white/8 bg-white/[0.02] py-2.5">
                  <p className="font-display text-lg font-bold text-white">{fin?.ventas ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">Ventas</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] py-2.5">
                  <p className="font-display text-sm font-bold text-white">
                    {formatMoney(fin?.invertido ?? 0)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">Invertido</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.02] py-2.5">
                  <p className="font-display text-sm font-bold text-emerald-300">
                    {formatMoney(fin?.ganancia ?? 0)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/35">Ganancia</p>
                </div>
              </div>

              {precios.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/12 py-5 text-center text-xs text-white/35">
                  Sin precios registrados para este proveedor.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {precios.slice(0, 6).map((c) => (
                    <li
                      key={c.price_id}
                      className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition hover:bg-white/[0.03]"
                    >
                      <span className="min-w-0 truncate text-white/75">
                        {c.servicio} <span className="text-white/35">· {c.plan}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge tone="gray">{formatDuration(c.duracion_dias)}</Badge>
                        <Money value={c.costo} />
                      </span>
                    </li>
                  ))}
                  {precios.length > 6 && (
                    <li className="pt-1 text-center text-xs text-white/30">
                      +{precios.length - 6} precios más
                    </li>
                  )}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
