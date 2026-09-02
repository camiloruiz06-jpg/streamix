import type { Metadata } from 'next';
import { MetodosPago, CtaFinal } from '@/components/site/Sections';
import { Reveal } from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Métodos de pago',
  description: 'Llaves (Bre-B), Nequi, Bancolombia y PayPal.',
};

export default function MetodosPagoPage() {
  return (
    <div className="pt-28 sm:pt-36">
      <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <span className="eyebrow">Pagos seguros</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Métodos de pago</span>
        </h1>
        <p className="mt-4 text-white/55">
          Elige el que más te convenga. Confirmamos el pago al instante y despachamos de inmediato.
        </p>
      </Reveal>
      <MetodosPago />
      <CtaFinal />
    </div>
  );
}
