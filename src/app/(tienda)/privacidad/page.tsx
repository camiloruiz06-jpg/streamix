import type { Metadata } from 'next';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo tratamos y protegemos tus datos personales.',
};

const secciones = [
  {
    t: '1. Responsable del tratamiento',
    p: [
      `${site.name}, con domicilio en ${site.ciudad}, es responsable del tratamiento de los datos personales recolectados a través de este sitio y de WhatsApp. Puedes contactarnos en ${site.email}.`,
    ],
  },
  {
    t: '2. Qué datos recolectamos',
    p: [
      `Recolectamos únicamente los datos necesarios para vender y entregar el servicio: nombre, número de WhatsApp y, opcionalmente, correo electrónico. También guardamos el historial de tus compras (servicio, plan, fecha y vencimiento) para poder darte soporte y avisarte de renovaciones.`,
      `No solicitamos ni almacenamos números completos de tarjetas, claves bancarias ni documentos de identidad.`,
    ],
  },
  {
    t: '3. Para qué los usamos',
    p: [
      `Para procesar y entregar tu pedido; para prestarte soporte; para recordarte el vencimiento de tus servicios y ofrecerte la renovación; y para cumplir obligaciones legales o contables.`,
      `No vendemos ni cedemos tus datos a terceros con fines publicitarios.`,
    ],
  },
  {
    t: '4. Con quién los compartimos',
    p: [
      `Compartimos únicamente la información mínima necesaria con nuestros proveedores para poder activar tu servicio. También utilizamos servicios de infraestructura tecnológica (alojamiento web y base de datos) que actúan como encargados del tratamiento bajo nuestras instrucciones.`,
    ],
  },
  {
    t: '5. Cuánto tiempo los conservamos',
    p: [
      `Conservamos tus datos mientras seas cliente activo y durante el tiempo necesario para atender garantías, reclamaciones y obligaciones legales. Después de ese período los eliminamos o anonimizamos.`,
    ],
  },
  {
    t: '6. Tus derechos',
    p: [
      `Conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, puedes conocer, actualizar, rectificar y suprimir tus datos, así como revocar la autorización otorgada. Para ejercer estos derechos escríbenos a ${site.email} o al WhatsApp ${site.whatsappDisplay}; responderemos en los plazos de ley.`,
    ],
  },
  {
    t: '7. Seguridad',
    p: [
      `Aplicamos medidas técnicas y organizativas razonables para proteger tu información: acceso restringido al panel administrativo mediante autenticación, cifrado en tránsito y control de permisos sobre la base de datos.`,
    ],
  },
  {
    t: '8. Cookies',
    p: [
      `Este sitio utiliza únicamente cookies técnicas necesarias para su funcionamiento y para mantener la sesión del administrador. No utilizamos cookies publicitarias ni de perfilamiento.`,
    ],
  },
  {
    t: '9. Cambios en esta política',
    p: [
      `Podemos actualizar esta política. La versión vigente será siempre la publicada en esta página, con su fecha de actualización.`,
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <Reveal>
        <span className="eyebrow">Legal</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Política de privacidad</span>
        </h1>
        <p className="mt-3 text-sm text-white/40">
          Última actualización: {new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })}
        </p>
      </Reveal>

      <div className="mt-12 space-y-9">
        {secciones.map((s, i) => (
          <Reveal key={s.t} delay={Math.min(i * 0.03, 0.25)}>
            <section>
              <h2 className="font-display text-lg font-bold text-white">{s.t}</h2>
              {s.p.map((texto, j) => (
                <p key={j} className="mt-3 text-sm leading-relaxed text-white/60">{texto}</p>
              ))}
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
