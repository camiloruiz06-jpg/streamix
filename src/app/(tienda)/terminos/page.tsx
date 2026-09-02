import type { Metadata } from 'next';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/config/site';

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Condiciones de uso y de compra de los servicios ofrecidos.',
};

const secciones = [
  {
    t: '1. Quiénes somos',
    p: [
      `${site.name} es un comercio independiente ubicado en ${site.ciudad} dedicado a la intermediación y venta de accesos a servicios digitales de entretenimiento. No somos, ni estamos afiliados o patrocinados por, ninguna de las plataformas mencionadas en el catálogo. Todas las marcas, logotipos y nombres comerciales pertenecen a sus respectivos titulares y se utilizan únicamente con fines descriptivos.`,
    ],
  },
  {
    t: '2. Objeto del servicio',
    p: [
      `Ofrecemos accesos a servicios de entretenimiento por un período determinado, indicado claramente en cada plan del catálogo. El precio publicado corresponde al valor total por esa duración, sin cargos adicionales de activación.`,
      `La página web funciona como catálogo informativo. El proceso de compra, pago y entrega se completa a través de WhatsApp.`,
    ],
  },
  {
    t: '3. Proceso de compra',
    p: [
      `El cliente selecciona un servicio y un plan, y es dirigido a WhatsApp con un mensaje prellenado. Nuestro equipo confirma la disponibilidad y el método de pago.`,
      `La compra se considera perfeccionada cuando el pago ha sido confirmado. A partir de ese momento inicia el plazo de entrega.`,
    ],
  },
  {
    t: '4. Entrega',
    p: [
      `La entrega se realiza por WhatsApp al número desde el cual se hizo el pedido, en un plazo estimado de 5 a 30 minutos dentro del horario de atención (${site.horario}). Los pedidos realizados fuera de este horario se atienden al inicio de la siguiente jornada.`,
    ],
  },
  {
    t: '5. Garantía',
    p: [
      `Garantizamos el funcionamiento del servicio durante toda la vigencia del plan adquirido. Si el acceso presenta una falla atribuible a nosotros o a nuestro proveedor, realizaremos la reposición sin costo o, si no fuera posible, la devolución proporcional a los días no disfrutados.`,
      `La garantía no cubre: fallas causadas por el uso indebido del acceso por parte del cliente, el cambio de contraseña sin autorización en planes compartidos, compartir los datos con terceros, ni interrupciones atribuibles a la plataforma proveedora del contenido.`,
    ],
  },
  {
    t: '6. Obligaciones del cliente',
    p: [
      `El cliente se compromete a: usar el acceso de forma personal, no revender ni compartir los datos entregados, no modificar la configuración de la cuenta en planes compartidos, y notificar cualquier inconveniente dentro de la vigencia del plan.`,
      `El incumplimiento de estas condiciones puede dar lugar a la suspensión del servicio sin derecho a reembolso.`,
    ],
  },
  {
    t: '7. Renovaciones',
    p: [
      `Los planes no se renuevan automáticamente. Nos comunicamos con el cliente antes del vencimiento para ofrecer la renovación, que debe ser confirmada y pagada de forma expresa.`,
    ],
  },
  {
    t: '8. Devoluciones',
    p: [
      `Procede la devolución cuando no podamos entregar el servicio adquirido, o cuando la falla no pueda ser subsanada dentro de un plazo razonable. En ese caso se devuelve el valor proporcional a los días no disfrutados, por el mismo medio de pago utilizado.`,
      `No procede la devolución por arrepentimiento una vez entregados los datos de acceso, dada la naturaleza digital e inmediata del producto.`,
    ],
  },
  {
    t: '9. Limitación de responsabilidad',
    p: [
      `${site.name} responde por la entrega y el funcionamiento del acceso dentro de los términos aquí descritos. No respondemos por decisiones, cambios de política, precios, catálogo o disponibilidad de las plataformas proveedoras del contenido, ni por daños indirectos derivados de la interrupción del servicio.`,
    ],
  },
  {
    t: '10. Modificaciones',
    p: [
      `Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada en esta página. Los cambios no afectan compras ya realizadas.`,
    ],
  },
  {
    t: '11. Contacto y ley aplicable',
    p: [
      `Para cualquier reclamación puedes escribirnos a ${site.email} o al WhatsApp ${site.whatsappDisplay}. Estas condiciones se rigen por la legislación colombiana, incluyendo el Estatuto del Consumidor (Ley 1480 de 2011).`,
    ],
  },
];

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <Reveal>
        <span className="eyebrow">Legal</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Términos y condiciones</span>
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
                <p key={j} className="mt-3 text-sm leading-relaxed text-white/60">
                  {texto}
                </p>
              ))}
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <p className="mt-14 rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] p-5 text-xs leading-relaxed text-amber-100/80">
          <strong className="font-semibold">Nota para el administrador:</strong> este documento es
          una plantilla base y no sustituye la asesoría de un abogado. Antes de publicar el sitio,
          revísalo con un profesional para verificar que se ajusta a tu operación real, al Estatuto
          del Consumidor y a las condiciones de uso de las plataformas con las que trabajas.
          Recuerda eliminar esta nota una vez lo hayas revisado.
        </p>
      </Reveal>
    </div>
  );
}
