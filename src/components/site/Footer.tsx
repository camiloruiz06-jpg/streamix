import Link from 'next/link';
import { MessageCircle, Mail, MapPin, Clock, Instagram } from 'lucide-react';
import { BrandLockup } from '@/components/ui/BrandMark';
import { site } from '@/config/site';
import { waGeneral } from '@/lib/whatsapp';

const columnas = [
  {
    titulo: 'Plataforma',
    links: [
      { href: '/servicios', label: 'Catálogo de servicios' },
      { href: '/como-funciona', label: 'Cómo funciona' },
      { href: '/mi-compra', label: 'Consultar mi compra' },
      { href: '/metodos-de-pago', label: 'Métodos de pago' },
    ],
  },
  {
    titulo: 'Ayuda',
    links: [
      { href: '/faq', label: 'Preguntas frecuentes' },
      { href: '/contacto', label: 'Contacto y soporte' },
      { href: '/terminos', label: 'Términos y condiciones' },
      { href: '/privacidad', label: 'Política de privacidad' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950/70">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Marca */}
        <div className="lg:col-span-5">
          <Link href="/" className="group inline-flex items-center">
            <BrandLockup size={46} />
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">{site.description}</p>

          <div className="mt-6 space-y-2.5 text-sm text-white/55">
            <p className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <a href={waGeneral()} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                {site.whatsappDisplay}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-brand-400" />
              <a href={`mailto:${site.email}`} className="transition hover:text-white">{site.email}</a>
            </p>
            <p className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-brand-400" />{site.ciudad}</p>
            <p className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-brand-400" />{site.horario}</p>
          </div>

          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-brand-400/50 hover:text-white"
            aria-label="Instagram"
          >
            <Instagram className="h-4.5 w-4.5" />
          </a>
        </div>

        {/* Links */}
        {columnas.map((col) => (
          <div key={col.titulo} className="lg:col-span-3">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              {col.titulo}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
                  >
                    <span className="h-px w-0 bg-brand-400 transition-all duration-300 group-hover:w-3" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* CTA */}
        <div className="lg:col-span-1" />
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/40 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
          <p className="text-center sm:text-right">
            {site.name} es un servicio independiente y no está afiliado ni patrocinado por las
            plataformas mencionadas. Las marcas pertenecen a sus respectivos titulares.
          </p>
        </div>
      </div>
    </footer>
  );
}
