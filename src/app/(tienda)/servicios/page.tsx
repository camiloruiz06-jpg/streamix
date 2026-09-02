import type { Metadata } from 'next';
import { CatalogGrid } from '@/components/site/CatalogGrid';
import { Reveal } from '@/components/ui/Reveal';
import { getCatalog, getCategories } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Explora todos los servicios de streaming, música y deportes disponibles. Precios claros, entrega inmediata y garantía.',
};

export default async function ServiciosPage() {
  const [catalogo, categorias] = await Promise.all([getCatalog(), getCategories()]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <Reveal className="mb-10 max-w-2xl">
        <span className="eyebrow">Catálogo completo</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Elige tu servicio</span>
        </h1>
        <p className="mt-4 text-white/55">
          Todos los precios son finales por la duración indicada. Filtra por categoría, compara
          planes y compra en un clic por WhatsApp.
        </p>
      </Reveal>

      <CatalogGrid items={catalogo} categorias={categorias} />
    </div>
  );
}
