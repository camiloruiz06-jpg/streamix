import Link from 'next/link';
import { Clapperboard, Layers, Star, EyeOff, ExternalLink, Plus, Pencil } from 'lucide-react';
import { RecordForm } from '@/components/admin/RecordForm';
import { camposServicio, camposPlan, opcionesCategorias, opcionesServicios } from '@/components/admin/campos';
import { PageHeader, Panel, StatCard } from '@/components/admin/Ui';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { Badge } from '@/components/ui/Badge';
import { getServicesAdmin, getCategories, isDemo } from '@/lib/queries';
import { formatDuration, formatMoney, formatNumber } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Servicios y planes' };

export default async function ServiciosAdminPage() {
  const [servicios, categorias] = await Promise.all([getServicesAdmin(), getCategories()]);
  const optCategorias = opcionesCategorias(categorias);
  const optServicios = opcionesServicios(servicios);

  const planes = servicios.flatMap((s) => s.service_plans ?? []);
  const activos = servicios.filter((s) => s.activo);
  const destacados = servicios.filter((s) => s.destacado);

  return (
    <div>
      <PageHeader
        titulo="Servicios y planes"
        descripcion="Todo lo que aparece en el catálogo público. Cada servicio puede tener varios planes con distinta duración y precio."
      >
        <Link href="/servicios" target="_blank" className="btn-ghost btn-sm">
          <ExternalLink className="h-3.5 w-3.5" /> Ver tienda
        </Link>
        <RecordForm
          tabla="services"
          titulo="Nuevo servicio"
          descripcion="Se publica en el catálogo apenas lo guardes."
          campos={camposServicio(undefined, optCategorias)}
          botonLabel="Nuevo servicio"
          botonIcono={<Plus className="h-3.5 w-3.5" />}
        />
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Servicios" value={formatNumber(servicios.length)} hint={`${activos.length} publicados`} icon={Clapperboard} tono="brand" />
        <StatCard label="Planes" value={formatNumber(planes.length)} hint="Combinaciones de duración y precio" icon={Layers} tono="blue" />
        <StatCard label="Destacados" value={formatNumber(destacados.length)} hint="Aparecen primero en la portada" icon={Star} tono="amber" />
        <StatCard label="Ocultos" value={formatNumber(servicios.length - activos.length)} hint="No visibles en la tienda" icon={EyeOff} tono={servicios.length - activos.length ? 'red' : 'green'} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {servicios.map((s) => {
          const sus = (s.service_plans ?? []).slice().sort((a, b) => a.orden - b.orden);
          return (
            <Panel key={s.id}>
              <div className="mb-5 flex items-start gap-4">
                <ServiceLogo nombre={s.nombre} logoUrl={s.logo_url} color={s.color} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold text-white">{s.nombre}</h2>
                    {s.destacado && <Badge tone="amber">Destacado</Badge>}
                    <Badge tone={s.activo ? 'green' : 'gray'} dot>
                      {s.activo ? 'Publicado' : 'Oculto'}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-white/45">{s.descripcion_corta}</p>
                  <p className="mt-1.5 text-[11px] uppercase tracking-wider text-white/30">
                    {s.categories?.nombre ?? 'Sin categoría'} · /{s.slug}
                  </p>
                </div>
                <RecordForm
                  tabla="services"
                  id={s.id}
                  titulo={`Editar ${s.nombre}`}
                  descripcion="Nombre, categoría, visibilidad y textos del catálogo."
                  campos={camposServicio(s, optCategorias)}
                  botonLabel="Editar"
                  botonClase="btn-ghost btn-sm shrink-0"
                  botonIcono={<Pencil className="h-3.5 w-3.5" />}
                  permiteBorrar
                />
              </div>

              {sus.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/12 py-6 text-center text-xs text-white/35">
                  Este servicio aún no tiene planes.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sus.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{p.nombre}</p>
                        <p className="text-xs text-white/35">
                          {formatDuration(p.duracion_dias)}
                          {p.pantallas ? ` · ${p.pantallas} pantalla${p.pantallas === 1 ? '' : 's'}` : ''}
                          {!p.disponible && ' · sin stock'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          {p.precio_descuento && (
                            <p className="text-[11px] text-white/30 line-through">
                              {formatMoney(p.precio_venta)}
                            </p>
                          )}
                          <p className="font-semibold tabular-nums text-white">
                            {formatMoney(p.precio_descuento ?? p.precio_venta)}
                          </p>
                        </div>
                        <RecordForm
                          tabla="service_plans"
                          id={p.id}
                          titulo={`${s.nombre} · ${p.nombre}`}
                          descripcion="Cambia el precio, la duración o el stock de este plan."
                          campos={camposPlan(p, s.id, optServicios)}
                          botonLabel=""
                          botonClase="btn-ghost btn-sm !px-2"
                          botonIcono={<Pencil className="h-3.5 w-3.5" />}
                          permiteBorrar
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 flex justify-end">
                <RecordForm
                  tabla="service_plans"
                  titulo={`Nuevo plan de ${s.nombre}`}
                  descripcion="Una duración y un precio nuevos para este servicio."
                  campos={camposPlan(undefined, s.id, optServicios)}
                  botonLabel="Agregar plan"
                  botonClase="btn-ghost btn-sm"
                  botonIcono={<Plus className="h-3.5 w-3.5" />}
                />
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-400/20 bg-brand-500/[0.06] p-5 text-sm leading-relaxed text-white/60">
        <p className="mb-2 font-display font-bold text-white">Cómo agregar o editar servicios</p>
        <p>
          {isDemo()
            ? 'Estás en modo demostración, por eso ves servicios de ejemplo. '
            : ''}
          Usa <strong className="text-white/80">Nuevo servicio</strong> para agregar una plataforma
          y <strong className="text-white/80">Agregar plan</strong> para crear cada combinación de
          duración y precio. El lápiz de cada plan te deja cambiar el precio en segundos. Todo lo que
          guardes aquí aparece de inmediato en la tienda pública, sin tocar el código.
        </p>
      </div>
    </div>
  );
}
