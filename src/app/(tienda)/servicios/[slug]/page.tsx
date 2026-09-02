import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, Zap, Headphones, RefreshCw } from 'lucide-react';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { PlanPicker } from '@/components/site/PlanPicker';
import { ServiceCard } from '@/components/site/ServiceCard';
import { Reveal } from '@/components/ui/Reveal';
import { CtaFinal } from '@/components/site/Sections';
import { getServiceBySlug, getCatalog } from '@/lib/queries';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const servicio = await getServiceBySlug(slug);
  if (!servicio) return { title: 'Servicio no encontrado' };
  return {
    title: servicio.nombre,
    description: servicio.descripcion_corta ?? servicio.descripcion ?? undefined,
  };
}

const garantias = [
  { icono: Zap, titulo: 'Entrega inmediata', texto: 'Entre 5 y 30 minutos tras confirmar el pago.' },
  { icono: ShieldCheck, titulo: 'Garantía vigente', texto: 'Te acompañamos durante todo el plan.' },
  { icono: RefreshCw, titulo: 'Renovación fácil', texto: 'Te avisamos antes de que se venza.' },
  { icono: Headphones, titulo: 'Soporte humano', texto: 'Escribes y te responde una persona.' },
];

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params;
  const servicio = await getServiceBySlug(slug);
  if (!servicio) notFound();

  const catalogo = await getCatalog();
  const relacionados = catalogo
    .filter((s) => s.slug !== slug && s.categoria_slug === servicio.categories?.slug)
    .slice(0, 4);
  const sugeridos = relacionados.length
    ? relacionados
    : catalogo.filter((s) => s.slug !== slug).slice(0, 4);

  const color = servicio.color || '#a855f7';

  return (
    <div className="pt-24 sm:pt-32">
      {/* halo de color del servicio */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
        style={{ background: `radial-gradient(60% 60% at 50% 0%, ${color}26, transparent 70%)` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* migas */}
        <nav className="flex items-center gap-1.5 text-xs text-white/40">
          <Link href="/" className="transition hover:text-white">Inicio</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/servicios" className="transition hover:text-white">Servicios</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/70">{servicio.nombre}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Columna izquierda */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex items-start gap-5">
                <ServiceLogo nombre={servicio.nombre} logoUrl={servicio.logo_url} color={color} size={84} />
                <div className="min-w-0">
                  {servicio.categories && (
                    <span className="eyebrow">{servicio.categories.nombre}</span>
                  )}
                  <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {servicio.nombre}
                  </h1>
                  <p className="mt-2 text-white/55">{servicio.descripcion_corta}</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-8 text-base leading-relaxed text-white/65">{servicio.descripcion}</p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {garantias.map((g) => (
                  <div
                    key={g.titulo}
                    className="flex gap-3.5 rounded-2xl border border-white/10 bg-ink-900/50 p-4 transition-colors hover:border-brand-400/35"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ background: `${color}1f`, border: `1px solid ${color}44` }}
                    >
                      <g.icono className="h-4.5 w-4.5" style={{ color }} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{g.titulo}</span>
                      <span className="block text-xs text-white/50">{g.texto}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Columna derecha: planes */}
          <div className="lg:col-span-5">
            <PlanPicker servicio={servicio} />
          </div>
        </div>

        {/* Relacionados */}
        {sugeridos.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                <span className="text-gradient">También te puede interesar</span>
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sugeridos.map((s, i) => (
                <ServiceCard key={s.id} item={s} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CtaFinal />
    </div>
  );
}
