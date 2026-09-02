import type { Metadata } from 'next';
import { Faq, CtaFinal } from '@/components/site/Sections';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Resolvemos las dudas más comunes sobre entrega, garantía, renovaciones y pagos.',
};

export default function FaqPage() {
  return (
    <div className="pt-20 sm:pt-28">
      <Faq />
      <CtaFinal />
    </div>
  );
}
