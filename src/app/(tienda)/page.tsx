import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/site/Hero';
import { ServiceCard } from '@/components/site/ServiceCard';
import { Reveal } from '@/components/ui/Reveal';
import { ComoFunciona, Ventajas, Faq, MetodosPago, CtaFinal, SectionHeading } from '@/components/site/Sections';
import { getCatalog, getFeatured } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [catalogo, destacados] = await Promise.all([getCatalog(), getFeatured(8)]);

  return (
    <>
      <Hero servicios={catalogo.length} />

      {/* Servicios destacados */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            centrado={false}
            eyebrow="Los más pedidos"
            titulo="Servicios destacados"
            descripcion="Los planes que más venden nuestros clientes, listos para entrega inmediata."
          />
          <Reveal>
            <Link href="/servicios" className="btn-ghost btn-sm group whitespace-nowrap">
              Ver todo el catálogo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((item, i) => (
            <ServiceCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      <Ventajas />
      <ComoFunciona />
      <MetodosPago />
      <Faq compacto />
      <CtaFinal />
    </>
  );
}
