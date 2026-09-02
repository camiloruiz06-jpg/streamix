/**
 * ---------------------------------------------------------------------------
 * CONFIGURACIÓN DE MARCA Y CONTACTO
 * ---------------------------------------------------------------------------
 * Este es el ÚNICO archivo que necesitas tocar para cambiar el nombre de la
 * marca, el número de WhatsApp, los textos legales o los métodos de pago.
 * Los valores sensibles se leen de .env.local cuando existen.
 * ---------------------------------------------------------------------------
 */

export const site = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Streamix',
  /** Cómo se parte el nombre para el degradado del logotipo */
  nameParts: ['Stream', 'ix'] as const,
  tagline: 'Tu entretenimiento favorito, en un solo lugar.',
  description:
    'Cuentas y planes de streaming, música y deportes al mejor precio. Entrega inmediata, garantía durante toda la vigencia y soporte real por WhatsApp.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  locale: 'es-CO',
  currency: 'COP',

  /** Formato internacional SIN el signo + (ej. 573014605500) */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '573014605500',
  whatsappDisplay: '+57 301 460 5500',
  email: 'camiloruizroa06@gmail.com',
  ciudad: 'Barranquilla, Colombia',

  horario: 'Lunes a domingo · 8:00 a.m. – 10:00 p.m.',

  social: {
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/',
    facebook: 'https://facebook.com/',
  },
} as const;

/** Plantillas de mensaje de WhatsApp. Edítalas a tu gusto. */
export const waTemplates = {
  general: () =>
    `¡Hola ${site.name}! 👋 Estoy interesado en sus servicios y quisiera más información.`,

  servicio: (servicio: string) =>
    `¡Hola ${site.name}! 👋 Quisiera información sobre *${servicio}*: disponibilidad, precio y métodos de pago.`,

  compra: (servicio: string, plan: string, dias: number, precio: string) =>
    `¡Hola ${site.name}! 👋 Quiero comprar:\n\n` +
    `🎬 *Servicio:* ${servicio}\n` +
    `📦 *Plan:* ${plan}\n` +
    `⏳ *Duración:* ${dias} días\n` +
    `💰 *Precio:* ${precio}\n\n` +
    `¿Me confirmas disponibilidad y el método de pago?`,

  soporte: () =>
    `¡Hola ${site.name}! 👋 Necesito soporte con un servicio que compré.`,

  renovacion: (servicio: string) =>
    `¡Hola ${site.name}! 👋 Quiero renovar mi servicio de *${servicio}*.`,

  recordatorio: (cliente: string, servicio: string, dias: number) =>
    `¡Hola ${cliente}! 👋 Te escribimos de ${site.name}.\n\n` +
    `Tu servicio de *${servicio}* ${dias <= 0 ? 'ya venció' : `vence en ${dias} día${dias === 1 ? '' : 's'}`}. ` +
    `¿Deseas renovarlo? Escríbenos y lo dejamos listo. 😊`,
} as const;

export const metodosPago = [
  { nombre: 'Llaves (Bre-B)', detalle: 'Transferencia inmediata entre bancos', icono: '🔑', destacado: true },
  { nombre: 'Nequi', detalle: 'Transferencia inmediata', icono: '📲' },
  { nombre: 'Daviplata', detalle: 'Transferencia inmediata', icono: '💜' },
  { nombre: 'Bancolombia', detalle: 'Ahorros / corriente', icono: '🏦' },
  { nombre: 'PayPal', detalle: 'Pagos internacionales', icono: '🌎' },
] as const;

export const pasos = [
  {
    titulo: 'Elige tu servicio',
    texto: 'Explora el catálogo, compara planes y precios, y escoge la duración que más te conviene.',
    icono: 'search',
  },
  {
    titulo: 'Escríbenos por WhatsApp',
    texto: 'Al dar clic en comprar se abre WhatsApp con tu pedido listo. Confirmamos disponibilidad al instante.',
    icono: 'message',
  },
  {
    titulo: 'Realiza el pago',
    texto: 'Llaves (Bre-B), Nequi, Daviplata, Bancolombia o PayPal. Tú eliges el método que prefieras.',
    icono: 'wallet',
  },
  {
    titulo: 'Recibe y disfruta',
    texto: 'Te enviamos los datos de acceso en minutos, con garantía durante toda la vigencia del plan.',
    icono: 'play',
  },
] as const;

export const faqs = [
  {
    q: '¿Cuánto tarda la entrega?',
    a: 'La mayoría de pedidos se entregan entre 5 y 30 minutos después de confirmar el pago, dentro de nuestro horario de atención. Si compras fuera de horario, tu pedido queda de primero en la fila.',
  },
  {
    q: '¿Qué garantía tengo?',
    a: 'Acompañamos tu servicio durante toda la vigencia del plan que compraste. Si presenta alguna falla que dependa de nosotros, lo reponemos o te devolvemos el dinero proporcional a los días restantes.',
  },
  {
    q: '¿Necesito crear una cuenta en la página?',
    a: 'No. La página funciona como catálogo y todo el proceso se cierra por WhatsApp, que es más rápido y directo. Guardamos tu historial de compras para avisarte cuando esté por vencer.',
  },
  {
    q: '¿Puedo renovar cuando se venza?',
    a: 'Claro. Te escribimos por WhatsApp unos días antes del vencimiento para que renueves sin perder el acceso. También puedes escribirnos tú cuando quieras.',
  },
  {
    q: '¿Puedo cambiar la contraseña del servicio?',
    a: 'En los planes de perfil compartido no, porque afectaría a otros usuarios. En los planes de cuenta completa sí, y te explicamos cómo hacerlo.',
  },
  {
    q: '¿Los precios incluyen todo?',
    a: 'Sí. El precio que ves en el catálogo es el precio final por la duración indicada. No cobramos activación ni comisiones adicionales.',
  },
  {
    q: '¿Qué pasa si el servicio falla?',
    a: 'Escríbenos por WhatsApp con una captura del problema. Revisamos y, si el fallo es de nuestro lado, lo reponemos lo antes posible sin costo.',
  },
  {
    q: '¿Atienden fuera de Colombia?',
    a: 'Sí. Para pedidos internacionales aceptamos PayPal. Escríbenos y te cotizamos en tu moneda.',
  },
] as const;
