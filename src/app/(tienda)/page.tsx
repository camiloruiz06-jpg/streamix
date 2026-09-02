import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/site/Hero';
import { ServiceCard } from '@/components/site/ServiceCard';
import { Reveal } from '@/components/ui/Reveal';
import { ComoFunciona, Ventajas, Faq, MetodosPago, CtaFinal } from '@/components/site/Sections';
import { getCatalog, getFeatured } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [catalogo, destacados] = await Promise.all([getCatalog(), getFeatured(6)]);

  return (
    <>
      <Hero servicios={catalogo.length} />

      {/* Los más pedidos: una muestra, no el catálogo entero */}
      <section id="destacados" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal className="mb-10 max-w-2xl">
          <span className="eyebrow">Los más pedidos</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient">Servicios destacados</span>
          </h2>
          <p className="mt-3 text-white/55">
            Los que más venden nuestros clientes, listos para entrega inmediata.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((item, i) => (
            <ServiceCard key={item.id} item={item} index={i} />
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <Link href="/servicios" className="btn-primary group">
            Ver catálogo completo · {catalogo.length} servicios
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <Ventajas />
      <ComoFunciona />
      <MetodosPago />
      <Faq compacto />
      <CtaFinal />
    </>
  );
}
