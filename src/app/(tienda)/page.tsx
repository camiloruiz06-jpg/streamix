import { CatalogGrid } from '@/components/site/CatalogGrid';
import { Hero } from '@/components/site/Hero';
import { Reveal } from '@/components/ui/Reveal';
import { ComoFunciona, Ventajas, Faq, MetodosPago, CtaFinal } from '@/components/site/Sections';
import { getCatalog, getCategories } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [catalogo, categorias] = await Promise.all([getCatalog(), getCategories()]);

  return (
    <>
      <Hero servicios={catalogo.length} />

      {/* Catálogo completo, sin tener que ir a otra página */}
      <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <Reveal className="mb-8 max-w-2xl">
          <span className="eyebrow">Catálogo completo</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient">Elige tu servicio</span>
          </h2>
          <p className="mt-3 text-white/55">
            {catalogo.length} servicios disponibles. Todos los precios son finales por la duración
            indicada.
          </p>
        </Reveal>

        <CatalogGrid items={catalogo} categorias={categorias} />
      </section>

      <Ventajas />
      <ComoFunciona />
      <MetodosPago />
      <Faq compacto />
      <CtaFinal />
    </>
  );
}
