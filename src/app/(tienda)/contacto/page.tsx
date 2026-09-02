import type { Metadata } from 'next';
import { MessageCircle, Mail, MapPin, Clock, Instagram } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { CtaFinal } from '@/components/site/Sections';
import { site } from '@/config/site';
import { waGeneral, waSoporte } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Contacto y soporte',
  description: 'Escríbenos por WhatsApp o correo. Respondemos todos los días.',
};

const canales = [
  {
    icono: MessageCircle,
    titulo: 'WhatsApp (recomendado)',
    valor: site.whatsappDisplay,
    href: waGeneral(),
    nota: 'La vía más rápida. Ventas, dudas y soporte.',
    color: '#22c55e',
  },
  {
    icono: Mail,
    titulo: 'Correo electrónico',
    valor: site.email,
    href: `mailto:${site.email}`,
    nota: 'Para facturación o temas administrativos.',
    color: '#a855f7',
  },
  {
    icono: Instagram,
    titulo: 'Instagram',
    valor: '@novaplay',
    href: site.social.instagram,
    nota: 'Promociones y novedades del catálogo.',
    color: '#ec4899',
  },
];

export default function ContactoPage() {
  return (
    <div className="pt-28 sm:pt-36">
      <Reveal className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <span className="eyebrow">Estamos para ayudarte</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Contacto y soporte</span>
        </h1>
        <p className="mt-4 text-white/55">
          Escríbenos por el canal que prefieras. Atendemos {site.horario.toLowerCase()}.
        </p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {canales.map((c, i) => (
          <Reveal key={c.titulo} delay={i * 0.08}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400/40 hover:shadow-glow"
            >
              <span
                className="mb-4 grid h-12 w-12 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${c.color}1f`, border: `1px solid ${c.color}44` }}
              >
                <c.icono className="h-5 w-5" style={{ color: c.color }} />
              </span>
              <h2 className="font-display font-bold text-white">{c.titulo}</h2>
              <p className="mt-1 text-sm font-medium text-brand-300">{c.valor}</p>
              <p className="mt-2 text-sm text-white/50">{c.nota}</p>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-ink-900/50 p-6 sm:grid-cols-2">
          <p className="flex items-center gap-3 text-sm text-white/60">
            <MapPin className="h-4.5 w-4.5 text-brand-400" /> {site.ciudad}
          </p>
          <p className="flex items-center gap-3 text-sm text-white/60">
            <Clock className="h-4.5 w-4.5 text-brand-400" /> {site.horario}
          </p>
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-8 max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <a href={waSoporte()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          <MessageCircle className="h-4 w-4" /> Necesito soporte con una compra
        </a>
      </Reveal>

      <CtaFinal />
    </div>
  );
}
