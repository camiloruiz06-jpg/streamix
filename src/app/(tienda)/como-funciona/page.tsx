import type { Metadata } from 'next';
import { ComoFunciona, Ventajas, MetodosPago, CtaFinal } from '@/components/site/Sections';
import { Reveal } from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Cómo funciona',
  description: 'Comprar un servicio toma menos de 5 minutos. Te explicamos el proceso paso a paso.',
};

export default function ComoFuncionaPage() {
  return (
    <div className="pt-28 sm:pt-36">
      <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <span className="eyebrow">Paso a paso</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Cómo funciona</span>
        </h1>
        <p className="mt-4 text-white/55">
          Sin registros ni formularios eternos: eliges, escribes por WhatsApp y disfrutas.
        </p>
      </Reveal>

      <ComoFunciona />
      <Ventajas />
      <MetodosPago />
      <CtaFinal />
    </div>
  );
}
