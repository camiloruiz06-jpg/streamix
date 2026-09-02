/* eslint-disable */
/**
 * ---------------------------------------------------------------------------
 * CATÁLOGO Y PRECIOS DE PROVEEDORES  ·  ARCHIVO GENERADO
 * ---------------------------------------------------------------------------
 * No edites este archivo a mano: se genera desde `scripts/build-catalog.py`.
 * Para cambiar precios o agregar servicios, edita ese script y ejecuta:
 *
 *     python3 scripts/build-catalog.py
 *
 * Regla de precio de venta: costo del proveedor más barato + $2.000.
 * ---------------------------------------------------------------------------
 */

export interface SeedPlan {
  id: string;
  nombre: string;
  descripcion: string;
  duracion_dias: number;
  pantallas: number;
  precio_venta: number;
  orden: number;
  /** costo de cada proveedor: [claveProveedor, costo, duracionDias] */
  costos: [string, number, number][];
}

export interface SeedService {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  descripcion_corta: string;
  descripcion: string;
  color: string;
  destacado: boolean;
  orden: number;
  logo_url: string | null;
  planes: SeedPlan[];
}

export interface SeedCategory {
  id: string; slug: string; nombre: string; descripcion: string;
  icono: string; color: string; orden: number;
}

export interface SeedProvider {
  id: string; key: string; nombre: string; contacto: string;
  whatsapp: string; email: string; condiciones: string; estado: 'activo' | 'inactivo';
}

export const seedCategories: SeedCategory[] = [
  { id: "78154892-e853-5231-9714-7e3e4f66c996", slug: "streaming", nombre: "Streaming", descripcion: "Películas y series bajo demanda.", icono: "clapperboard", color: "#a855f7", orden: 1 },
  { id: "2b4d3d87-f316-56b0-b338-0c3ac87fdf39", slug: "combos", nombre: "Combos", descripcion: "Varias plataformas en un solo pago, al mejor precio.", icono: "layers", color: "#ff2fd0", orden: 2 },
  { id: "5f51673c-cb96-52a4-b79b-00a0780cb033", slug: "deportes", nombre: "Deportes", descripcion: "Fútbol y eventos en vivo.", icono: "trophy", color: "#f97316", orden: 3 },
  { id: "06219c8d-3267-564a-aecb-20c306f17544", slug: "musica", nombre: "Música", descripcion: "Canciones y podcasts sin anuncios.", icono: "music", color: "#22c55e", orden: 4 },
  { id: "9becfded-c275-590c-92aa-96a53d751751", slug: "ia", nombre: "Inteligencia artificial", descripcion: "Las mejores IA con cuenta propia.", icono: "sparkles", color: "#38bdf8", orden: 5 },
  { id: "c2fdedbc-6d2e-5b60-93a9-832f9636f4ca", slug: "diseno", nombre: "Diseño", descripcion: "Herramientas creativas premium.", icono: "palette", color: "#ec4899", orden: 6 },
  { id: "4066e7e3-b9dd-5955-b0e2-f4d5c6b8d366", slug: "gaming", nombre: "Gaming", descripcion: "Suscripciones de consola y PC.", icono: "gamepad-2", color: "#8b5cf6", orden: 7 },
  { id: "d8fa66ad-4c6a-5163-a33d-260d437793ca", slug: "software", nombre: "Software", descripcion: "Ofimática y seguridad.", icono: "monitor", color: "#64748b", orden: 8 },
];

export const seedProviders: SeedProvider[] = [
  { id: "e3325edd-b632-534e-a290-6791d1cac62a", key: "p1", nombre: "Proveedor 1", contacto: "", whatsapp: "573245338353", email: "", condiciones: "Netflix con vigencia de 33 días (mes + 3 días de cortesía).", estado: 'activo' },
  { id: "b9bfc7e3-6608-5b77-bf38-71d735258063", key: "p2", nombre: "Proveedor 2", contacto: "", whatsapp: "573008777786", email: "", condiciones: "Maneja combos de varias plataformas en una sola compra.", estado: 'activo' },
  { id: "a6e91af7-485a-557c-9fb1-678ba79fbbc2", key: "p3", nombre: "Proveedor 3", contacto: "", whatsapp: "573011216223", email: "", condiciones: "Precios por pantalla, 30 días. Deezer sujeto a disponibilidad.", estado: 'activo' },
  { id: "f914b816-96c2-5bc1-ae7d-66961bda4e51", key: "p4", nombre: "Proveedor 4", contacto: "", whatsapp: "573135211240", email: "", condiciones: "Catálogo más amplio: streaming, IA, software y gaming. Garantía y soporte.", estado: 'activo' },
];

export const seedServices: SeedService[] = [
  {
    id: "6a2ce6eb-df48-529b-be41-22249bc593eb", slug: "netflix", nombre: "Netflix", logo_url: "/logos/netflix.png",
    categoria: "streaming", color: "#e50914", destacado: true, orden: 1,
    descripcion_corta: "Series, películas y originales en HD/4K.",
    descripcion: "Acceso a todo el catálogo de Netflix con calidad HD o 4K según el plan. Entrega inmediata, garantía durante toda la vigencia y soporte por WhatsApp.",
    planes: [
      { id: "764f3db0-bf4a-56dc-8cf1-68889ecc0c28", nombre: "Premium · 1 pantalla", descripcion: "Perfil propio en HD/4K", duracion_dias: 30, pantallas: 1, precio_venta: 14000, orden: 1, costos: [["p1", 14000, 33], ["p2", 14000, 30], ["p3", 13000, 30], ["p4", 12000, 30]] },
      { id: "71efb27d-3fdc-52ae-a99c-2a13dcd73aa6", nombre: "Cuenta completa", descripcion: "5 perfiles, control total de la cuenta", duracion_dias: 30, pantallas: 5, precio_venta: 39000, orden: 2, costos: [["p4", 37000, 30]] },
    ],
  },
  {
    id: "165da644-34c2-5724-a1a7-78610dde3be0", slug: "disney-plus", nombre: "Disney+", logo_url: "/logos/disney-plus.png",
    categoria: "streaming", color: "#0f2fa5", destacado: true, orden: 2,
    descripcion_corta: "Disney, Pixar, Marvel, Star Wars y ESPN.",
    descripcion: "Todo el universo Disney en un solo lugar, incluyendo Star y ESPN en el plan premium.",
    planes: [
      { id: "5f0fbd1e-a0f2-5d94-be50-d41e2206bf95", nombre: "Estándar · 1 pantalla", descripcion: "Perfil propio, catálogo básico", duracion_dias: 30, pantallas: 1, precio_venta: 8000, orden: 1, costos: [["p3", 6000, 30]] },
      { id: "b78cb344-aa79-56d8-bd8b-217b487cec06", nombre: "Premium con ESPN · 1 pantalla", descripcion: "Perfil propio con deportes incluidos", duracion_dias: 30, pantallas: 1, precio_venta: 11000, orden: 2, costos: [["p1", 11000, 30], ["p2", 10000, 30], ["p3", 10000, 30], ["p4", 9000, 30]] },
      { id: "a3132c40-a66c-5004-823e-f973c168f7cc", nombre: "Cuenta completa Premium", descripcion: "7 perfiles, control total", duracion_dias: 30, pantallas: 7, precio_venta: 35000, orden: 3, costos: [["p4", 33000, 30]] },
    ],
  },
  {
    id: "32d051b5-b2a5-5713-9bf6-0b12cd23ab80", slug: "max", nombre: "Max (HBO)", logo_url: "/logos/max.png",
    categoria: "streaming", color: "#7c3aed", destacado: true, orden: 3,
    descripcion_corta: "HBO, DC, Warner y los estrenos del año.",
    descripcion: "El catálogo completo de Max con series originales de HBO, cine de Warner y contenido DC.",
    planes: [
      { id: "0e724583-fe29-562d-8974-531b983cb503", nombre: "Estándar · 1 pantalla", descripcion: "Perfil propio sin anuncios", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p1", 9000, 30], ["p2", 7000, 30], ["p3", 5000, 30], ["p4", 6000, 30]] },
    ],
  },
  {
    id: "b4ef416d-40d2-5ac3-bb36-43502dfb70c4", slug: "prime-video", nombre: "Prime Video", logo_url: "/logos/prime-video.png",
    categoria: "streaming", color: "#00a8e1", destacado: true, orden: 4,
    descripcion_corta: "Cine, series y producciones originales de Amazon.",
    descripcion: "Prime Video con acceso a estrenos, series originales y contenido exclusivo de Amazon.",
    planes: [
      { id: "6c3818c3-632a-576a-acb8-257372aaa72b", nombre: "Estándar · 1 pantalla", descripcion: "Perfil propio", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p1", 9000, 30], ["p2", 7000, 30], ["p3", 5000, 30], ["p4", 6000, 30]] },
      { id: "94b9ef57-9995-59a2-84e7-707b0b3f4cc6", nombre: "Cuenta completa", descripcion: "Control total de la cuenta", duracion_dias: 30, pantallas: 6, precio_venta: 20000, orden: 2, costos: [["p4", 18000, 30]] },
    ],
  },
  {
    id: "70fa438e-807e-54ed-9bd0-47d24c902fca", slug: "paramount-plus", nombre: "Paramount+", logo_url: "/logos/paramount-plus.png",
    categoria: "streaming", color: "#0064ff", destacado: false, orden: 5,
    descripcion_corta: "Cine, series y contenido exclusivo de Paramount.",
    descripcion: "Paramount+ con su catálogo completo de películas y series originales.",
    planes: [
      { id: "f5d77b06-5613-50cd-9db7-11e9c61b3a03", nombre: "Estándar · 1 pantalla", descripcion: "Perfil propio", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p2", 10000, 30], ["p3", 5000, 30], ["p4", 10000, 30]] },
    ],
  },
  {
    id: "cbdf399f-3d42-5c46-b5d2-92a35c4d0cbd", slug: "crunchyroll", nombre: "Crunchyroll", logo_url: "/logos/crunchyroll.png",
    categoria: "streaming", color: "#f47521", destacado: false, orden: 6,
    descripcion_corta: "El catálogo de anime más grande, con simulcast.",
    descripcion: "Anime sin anuncios, episodios el mismo día de su estreno en Japón y biblioteca completa.",
    planes: [
      { id: "f5e68862-4d27-5c02-ac2f-babdd070ac99", nombre: "Mega Fan · 1 pantalla", descripcion: "Anime sin anuncios", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p1", 6000, 30], ["p2", 5000, 30], ["p3", 5000, 30], ["p4", 7000, 30]] },
    ],
  },
  {
    id: "fd1d6756-633b-568c-8887-c894f766bcd9", slug: "vix", nombre: "Vix", logo_url: "/logos/vix.png",
    categoria: "streaming", color: "#ff4d4d", destacado: false, orden: 7,
    descripcion_corta: "Cine y series en español, novelas y fútbol.",
    descripcion: "Vix Premium con contenido en español, novelas, cine mexicano y deportes.",
    planes: [
      { id: "34a204ef-4e42-565b-b7f0-98a78070f4fa", nombre: "Estándar · 1 pantalla", descripcion: "Perfil propio", duracion_dias: 30, pantallas: 1, precio_venta: 6000, orden: 1, costos: [["p3", 4000, 30], ["p4", 6000, 30]] },
    ],
  },
  {
    id: "242f5fb3-59db-5707-9efb-ce34f5338e7e", slug: "plex", nombre: "Plex", logo_url: "/logos/plex.png",
    categoria: "streaming", color: "#e5a00d", destacado: false, orden: 8,
    descripcion_corta: "Tu biblioteca de películas y series en un solo lugar.",
    descripcion: "Plex Premium con acceso a bibliotecas y contenido gratuito con soporte.",
    planes: [
      { id: "f30b1f6a-5553-5fc7-bc1f-fd267ea4272d", nombre: "Pantalla", descripcion: "Un dispositivo", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p3", 5000, 30], ["p4", 5000, 30]] },
      { id: "c7557d89-0332-558a-be4c-496d919c9b33", nombre: "Premium · 3 dispositivos", descripcion: "Hasta 3 dispositivos", duracion_dias: 30, pantallas: 3, precio_venta: 17000, orden: 2, costos: [["p4", 15000, 30]] },
    ],
  },
  {
    id: "5191432a-e8b0-5282-8e96-3b3c4076a61f", slug: "iptv", nombre: "IPTV", logo_url: "/logos/iptv.png",
    categoria: "streaming", color: "#38bdf8", destacado: false, orden: 9,
    descripcion_corta: "Canales en vivo, nacionales e internacionales.",
    descripcion: "Servicio de televisión por internet con canales nacionales, internacionales y deportes.",
    planes: [
      { id: "de76190a-54b5-51a4-b140-3aba964b20e6", nombre: "Estándar", descripcion: "Canales en vivo", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p3", 5000, 30]] },
      { id: "e92223c5-9cba-50a8-9682-991a015282a9", nombre: "IPTV + WIN Sports", descripcion: "Incluye WIN Sports+", duracion_dias: 30, pantallas: 1, precio_venta: 12000, orden: 2, costos: [["p4", 10000, 30]] },
    ],
  },
  {
    id: "af53a9b5-5718-5ef7-9f88-5785be0389b3", slug: "jellyfin", nombre: "Jellyfin", logo_url: "/logos/jellyfin.png",
    categoria: "streaming", color: "#a855f7", destacado: false, orden: 10,
    descripcion_corta: "Servidor de streaming privado con gran catálogo.",
    descripcion: "Acceso a un servidor Jellyfin con biblioteca de películas y series.",
    planes: [
      { id: "7bdabfc8-7fe7-5023-b748-4263091e7f97", nombre: "Acceso mensual", descripcion: "Un usuario", duracion_dias: 30, pantallas: 1, precio_venta: 17000, orden: 1, costos: [["p4", 15000, 30]] },
    ],
  },
  {
    id: "181df90f-bb63-50e7-bec1-ce441063b27b", slug: "viki-rakuten", nombre: "Viki Rakuten", logo_url: "/logos/viki-rakuten.png",
    categoria: "streaming", color: "#00b0f0", destacado: false, orden: 11,
    descripcion_corta: "Doramas coreanos, chinos y japoneses.",
    descripcion: "Rakuten Viki con doramas y series asiáticas subtituladas, sin anuncios.",
    planes: [
      { id: "fddae8b5-cab4-5f17-803a-e0145ee1571e", nombre: "Estándar · 1 pantalla", descripcion: "Perfil propio", duracion_dias: 30, pantallas: 1, precio_venta: 11000, orden: 1, costos: [["p4", 9000, 30]] },
    ],
  },
  {
    id: "261c4478-e59c-5394-9d84-fcc47e8b36d4", slug: "flujo-tv", nombre: "Flujo TV", logo_url: "/logos/flujo-tv.png",
    categoria: "streaming", color: "#22d3ee", destacado: false, orden: 12,
    descripcion_corta: "Canales en vivo y contenido bajo demanda.",
    descripcion: "Plataforma de televisión en línea con canales en vivo y catálogo bajo demanda.",
    planes: [
      { id: "7d4fc099-a8bd-5a22-8891-236b7d3ffe07", nombre: "Pantalla", descripcion: "Un dispositivo", duracion_dias: 30, pantallas: 1, precio_venta: 12000, orden: 1, costos: [["p4", 10000, 30]] },
      { id: "d99fc50b-4494-5773-8a81-fa57475760bf", nombre: "Cuenta completa", descripcion: "Varios dispositivos", duracion_dias: 30, pantallas: 4, precio_venta: 20000, orden: 2, costos: [["p4", 18000, 30]] },
    ],
  },
  {
    id: "56b8d724-1566-54bc-b97b-c1c75a66e884", slug: "telelatino", nombre: "Telelatino + WIN", logo_url: "/logos/telelatino.png",
    categoria: "streaming", color: "#f59e0b", destacado: false, orden: 13,
    descripcion_corta: "Canales latinos con WIN Sports incluido.",
    descripcion: "Telelatino con canales en español y WIN Sports+ para el fútbol colombiano.",
    planes: [
      { id: "7f8e1ad0-246e-5ce4-9436-8701ee4b5535", nombre: "Mensual", descripcion: "Canales latinos + WIN", duracion_dias: 30, pantallas: 1, precio_venta: 17000, orden: 1, costos: [["p4", 15000, 30]] },
    ],
  },
  {
    id: "6ed3c7f8-4696-52a8-9e86-bdf4f81c32bf", slug: "youtube-premium", nombre: "YouTube Premium", logo_url: "/logos/youtube-premium.png",
    categoria: "streaming", color: "#ff0000", destacado: false, orden: 14,
    descripcion_corta: "YouTube sin anuncios, con descargas y música.",
    descripcion: "YouTube Premium: video sin anuncios, reproducción en segundo plano, descargas y YouTube Music.",
    planes: [
      { id: "82a5887a-bbe9-55b9-a639-c619e46dd80e", nombre: "Premium · 1 mes", descripcion: "Cuenta propia", duracion_dias: 30, pantallas: 1, precio_venta: 9000, orden: 1, costos: [["p3", 7000, 30], ["p4", 10000, 30]] },
    ],
  },
  {
    id: "c42d28a8-be84-5cee-9dca-da85927e93b5", slug: "combo-netflix-prime", nombre: "Netflix + Prime Video", logo_url: "/logos/combo-netflix-prime.png",
    categoria: "combos", color: "#e50914", destacado: true, orden: 15,
    descripcion_corta: "Las dos plataformas más pedidas en un solo pago.",
    descripcion: "Perfil propio en Netflix y en Prime Video por un solo precio. Entrega inmediata y garantía durante toda la vigencia.",
    planes: [
      { id: "c32317ca-5117-5d74-a714-15a9b02cf175", nombre: "Combo · 1 pantalla c/u", descripcion: "Un perfil en cada plataforma", duracion_dias: 30, pantallas: 1, precio_venta: 21000, orden: 1, costos: [["p2", 19000, 30]] },
    ],
  },
  {
    id: "59426ef0-7dfd-5781-bbab-5c6b9d5eb592", slug: "combo-netflix-max", nombre: "Netflix + Max", logo_url: "/logos/combo-netflix-max.png",
    categoria: "combos", color: "#7c3aed", destacado: true, orden: 16,
    descripcion_corta: "Netflix y todo el catálogo de HBO juntos.",
    descripcion: "Perfil propio en Netflix y en Max (HBO). Ideal si sigues series de HBO y estrenos de Netflix al mismo tiempo. Entrega inmediata y garantía durante toda la vigencia.",
    planes: [
      { id: "29f08eb2-4485-55b5-b724-879d77a6c68e", nombre: "Combo · 1 pantalla c/u", descripcion: "Un perfil en cada plataforma", duracion_dias: 30, pantallas: 1, precio_venta: 18000, orden: 1, costos: [["p2", 19000, 30], ["p4", 16000, 30]] },
    ],
  },
  {
    id: "9168d390-f53d-5c69-b08b-29fba73c62e0", slug: "combo-netflix-prime-disney", nombre: "Netflix + Prime + Disney+", logo_url: "/logos/combo-netflix-prime-disney.png",
    categoria: "combos", color: "#0f2fa5", destacado: true, orden: 17,
    descripcion_corta: "Tres plataformas, un solo pago.",
    descripcion: "Perfil propio en Netflix, Prime Video y Disney+. El combo más completo para toda la familia.",
    planes: [
      { id: "367e0489-9e32-5d06-a82d-1916adb3ccc1", nombre: "Combo · 1 pantalla c/u", descripcion: "Un perfil en cada plataforma", duracion_dias: 30, pantallas: 1, precio_venta: 31000, orden: 1, costos: [["p2", 29000, 30]] },
    ],
  },
  {
    id: "fc726882-9cee-5865-9317-ed11cba1e3a2", slug: "combo-netflix-prime-max", nombre: "Netflix + Prime + Max", logo_url: "/logos/combo-netflix-prime-max.png",
    categoria: "combos", color: "#6d28d9", destacado: false, orden: 18,
    descripcion_corta: "Cine, series y estrenos sin límite.",
    descripcion: "Perfil propio en Netflix, Prime Video y Max.",
    planes: [
      { id: "05c78f34-082e-5c8e-bf2d-9049fd1bcbf2", nombre: "Combo · 1 pantalla c/u", descripcion: "Un perfil en cada plataforma", duracion_dias: 30, pantallas: 1, precio_venta: 28000, orden: 1, costos: [["p2", 26000, 30]] },
    ],
  },
  {
    id: "b0862a77-83af-5ad7-852e-c2146fc7234b", slug: "combo-netflix-prime-spotify", nombre: "Netflix + Prime + Spotify", logo_url: "/logos/combo-netflix-prime-spotify.png",
    categoria: "combos", color: "#1db954", destacado: false, orden: 19,
    descripcion_corta: "Entretenimiento completo: video y música.",
    descripcion: "Perfil propio en Netflix y Prime Video, más Spotify Premium.",
    planes: [
      { id: "27ff1fb7-56e2-5735-8d1a-586aa73fdf07", nombre: "Combo · 1 pantalla c/u", descripcion: "Video y música incluidos", duracion_dias: 30, pantallas: 1, precio_venta: 29000, orden: 1, costos: [["p2", 27000, 30]] },
    ],
  },
  {
    id: "4103d0e5-da21-522d-9fe2-b01e7c711f2d", slug: "paramount-deportes", nombre: "Paramount+ Deportes", logo_url: "/logos/paramount-deportes.png",
    categoria: "deportes", color: "#0ea5e9", destacado: true, orden: 20,
    descripcion_corta: "Fútbol internacional y eventos en vivo.",
    descripcion: "Paramount+ con el paquete de deportes: DSports, fútbol internacional y eventos en directo.",
    planes: [
      { id: "c154da2a-b06d-5d55-96c9-a289c4bf4bc5", nombre: "Mensual", descripcion: "Deportes en vivo", duracion_dias: 30, pantallas: 1, precio_venta: 10000, orden: 1, costos: [["p1", 8000, 30], ["p3", 10000, 30]] },
    ],
  },
  {
    id: "cdb7ba23-c1fb-5bc3-a1a4-eecd7467ec96", slug: "directv-go", nombre: "DIRECTV GO · Plan Oro", logo_url: "/logos/directv-go.png",
    categoria: "deportes", color: "#f97316", destacado: false, orden: 21,
    descripcion_corta: "Canales premium y deportes en vivo.",
    descripcion: "DIRECTV GO Plan Oro con canales premium y deportes en directo (sin WIN Sports).",
    planes: [
      { id: "0a766734-0845-538f-99e5-f5088be80981", nombre: "Plan Oro · mensual", descripcion: "Sin WIN Sports", duracion_dias: 30, pantallas: 1, precio_venta: 22000, orden: 1, costos: [["p4", 20000, 30]] },
    ],
  },
  {
    id: "f2813b7c-c914-514e-b234-1a73e89305e4", slug: "spotify", nombre: "Spotify Premium", logo_url: "/logos/spotify.png",
    categoria: "musica", color: "#1db954", destacado: true, orden: 22,
    descripcion_corta: "Música y podcasts sin anuncios, con descargas.",
    descripcion: "Spotify Premium: sin anuncios, reproducción sin conexión, calidad alta y saltos ilimitados.",
    planes: [
      { id: "e6cef54e-9177-565f-a862-5e7882a6474c", nombre: "Premium · 1 mes", descripcion: "Cuenta propia renovable", duracion_dias: 30, pantallas: 1, precio_venta: 10000, orden: 1, costos: [["p1", 9000, 30], ["p2", 8000, 30], ["p3", 8000, 30], ["p4", 11000, 30]] },
      { id: "ac119ce0-7a53-5611-85f7-8bcd0718b948", nombre: "Premium · 3 meses", descripcion: "Ahorra pagando por trimestre", duracion_dias: 90, pantallas: 1, precio_venta: 24000, orden: 2, costos: [["p4", 22000, 90]] },
    ],
  },
  {
    id: "27bab71b-e0b9-53e8-8b7a-e90636637097", slug: "deezer", nombre: "Deezer", logo_url: "/logos/deezer.png",
    categoria: "musica", color: "#a238ff", destacado: false, orden: 23,
    descripcion_corta: "Millones de canciones sin anuncios.",
    descripcion: "Deezer Premium con música ilimitada, descargas y sin publicidad. Sujeto a disponibilidad.",
    planes: [
      { id: "b8cd729f-5873-5b8b-8806-2f4d266761d1", nombre: "Premium · 1 mes", descripcion: "Consultar disponibilidad", duracion_dias: 30, pantallas: 1, precio_venta: 5000, orden: 1, costos: [["p3", 3000, 30]] },
    ],
  },
  {
    id: "0cfd6eeb-fdf4-50e6-a691-86b8247909fb", slug: "chatgpt", nombre: "ChatGPT Pro", logo_url: "/logos/chatgpt.png",
    categoria: "ia", color: "#10a37f", destacado: true, orden: 24,
    descripcion_corta: "El modelo más avanzado de OpenAI, sin límites.",
    descripcion: "Acceso a ChatGPT Pro con los modelos más avanzados, respuestas prioritarias y funciones premium.",
    planes: [
      { id: "3219211d-e7de-516d-92c3-df2a28f5bfeb", nombre: "Business Pro · 1 mes", descripcion: "Cuenta con acceso completo", duracion_dias: 30, pantallas: 1, precio_venta: 25000, orden: 1, costos: [["p4", 23000, 30]] },
    ],
  },
  {
    id: "51f6e43d-baaf-58c7-a268-2d761fecbf9c", slug: "gemini-pro", nombre: "Gemini Pro", logo_url: "/logos/gemini-pro.png",
    categoria: "ia", color: "#4285f4", destacado: false, orden: 25,
    descripcion_corta: "La IA de Google con todas sus funciones.",
    descripcion: "Gemini Pro con acceso a los modelos avanzados de Google, generación de imágenes y más.",
    planes: [
      { id: "ab665406-9ead-5837-9408-cfe0c9e789df", nombre: "Pro · 1 mes", descripcion: "Cuenta con acceso completo", duracion_dias: 30, pantallas: 1, precio_venta: 12000, orden: 1, costos: [["p3", 10000, 30], ["p4", 20000, 30]] },
    ],
  },
  {
    id: "56d294a9-7e0f-5812-9dcc-c92f83e269c4", slug: "perplexity", nombre: "Perplexity Pro", logo_url: "/logos/perplexity.png",
    categoria: "ia", color: "#20808d", destacado: false, orden: 26,
    descripcion_corta: "Buscador con IA y fuentes verificadas.",
    descripcion: "Perplexity Pro: búsquedas ilimitadas con IA, modelos avanzados y respuestas con fuentes.",
    planes: [
      { id: "72608056-ab6a-5454-bfab-5bbacf24a19f", nombre: "Pro · 1 mes", descripcion: "Cuenta con acceso completo", duracion_dias: 30, pantallas: 1, precio_venta: 22000, orden: 1, costos: [["p4", 20000, 30]] },
    ],
  },
  {
    id: "ef29bf9c-4925-5dae-98ed-0a4206b5ec1b", slug: "canva-pro", nombre: "Canva Pro", logo_url: "/logos/canva-pro.png",
    categoria: "diseno", color: "#8b5cf6", destacado: true, orden: 27,
    descripcion_corta: "Diseño profesional con plantillas premium.",
    descripcion: "Canva Pro con millones de recursos, quitar fondos, kit de marca y almacenamiento ampliado.",
    planes: [
      { id: "4fc06b25-fc03-5f9e-a978-197f8fa8cdef", nombre: "Pro · 1 mes", descripcion: "Correo personal", duracion_dias: 30, pantallas: 1, precio_venta: 7000, orden: 1, costos: [["p3", 5000, 30], ["p4", 6000, 30]] },
      { id: "2f1401fa-e115-5217-b08e-7275b3583d3c", nombre: "Pro · 6 meses", descripcion: "Correo personal", duracion_dias: 180, pantallas: 1, precio_venta: 27000, orden: 2, costos: [["p4", 25000, 180]] },
      { id: "9fd6c7f2-5df1-56a2-96fa-2c7993ead4f2", nombre: "Pro · 1 año", descripcion: "Correo personal", duracion_dias: 365, pantallas: 1, precio_venta: 40000, orden: 3, costos: [["p4", 38000, 365]] },
    ],
  },
  {
    id: "869cd590-171f-538d-8335-d910fdb15885", slug: "capcut-pro", nombre: "CapCut Pro", logo_url: "/logos/capcut-pro.png",
    categoria: "diseno", color: "#000000", destacado: false, orden: 28,
    descripcion_corta: "Edición de video profesional sin marca de agua.",
    descripcion: "CapCut Pro con efectos premium, exportación en 4K y sin marca de agua.",
    planes: [
      { id: "20fc4610-81cc-5a1d-97ca-6cbf32799551", nombre: "Pro · 1 mes", descripcion: "Cuenta con acceso completo", duracion_dias: 30, pantallas: 1, precio_venta: 20000, orden: 1, costos: [["p4", 18000, 30]] },
    ],
  },
  {
    id: "303ed1e7-6cf3-5cb3-b346-354b01850c3d", slug: "xbox-game-pass", nombre: "Xbox Game Pass", logo_url: "/logos/xbox-game-pass.png",
    categoria: "gaming", color: "#107c10", destacado: false, orden: 29,
    descripcion_corta: "Cientos de juegos en consola y PC.",
    descripcion: "Xbox Game Pass con acceso a cientos de juegos, estrenos el día de lanzamiento y juego en la nube.",
    planes: [
      { id: "8d9b3c42-3e69-5fa5-9b63-4be09ae9dff9", nombre: "Mensual", descripcion: "Consola y PC", duracion_dias: 30, pantallas: 1, precio_venta: 47000, orden: 1, costos: [["p4", 45000, 30]] },
    ],
  },
  {
    id: "985e8418-2ee8-5d46-8f67-46d790f63577", slug: "ps-plus", nombre: "PlayStation Plus Deluxe", logo_url: "/logos/ps-plus.png",
    categoria: "gaming", color: "#0070d1", destacado: false, orden: 30,
    descripcion_corta: "Catálogo de juegos para PS4 y PS5.",
    descripcion: "PS Plus Deluxe con catálogo de juegos, clásicos y multijugador en línea.",
    planes: [
      { id: "744c1a4b-b408-5474-bfb6-da70f11acca1", nombre: "Mensual · PS4/PS5", descripcion: "Cuenta con acceso completo", duracion_dias: 30, pantallas: 1, precio_venta: 78000, orden: 1, costos: [["p4", 76000, 30]] },
    ],
  },
  {
    id: "80a96cc9-b585-5e59-8992-326f78b8c674", slug: "office-365", nombre: "Microsoft Office 365", logo_url: "/logos/office-365.png",
    categoria: "software", color: "#d83b01", destacado: false, orden: 31,
    descripcion_corta: "Word, Excel, PowerPoint y 1 TB en la nube.",
    descripcion: "Office 365 por un año completo con todas las aplicaciones de escritorio y OneDrive.",
    planes: [
      { id: "51906623-ea49-5305-80f2-5a696e389f7c", nombre: "1 año · compartida", descripcion: "Licencia compartida", duracion_dias: 365, pantallas: 1, precio_venta: 72000, orden: 1, costos: [["p4", 70000, 365]] },
      { id: "780afeea-6ce9-52a2-89f0-4136fa11d398", nombre: "1 año · correo personal", descripcion: "Licencia en tu propio correo", duracion_dias: 365, pantallas: 1, precio_venta: 173000, orden: 2, costos: [["p4", 171000, 365]] },
    ],
  },
  {
    id: "0577f8f4-e82f-57c8-9420-0dd4c6e71a8d", slug: "mcafee", nombre: "McAfee Antivirus", logo_url: "/logos/mcafee.png",
    categoria: "software", color: "#c01818", destacado: false, orden: 32,
    descripcion_corta: "Protección completa para tus dispositivos.",
    descripcion: "McAfee Antivirus por un año con protección en tiempo real y navegación segura.",
    planes: [
      { id: "19ebfc86-aa7d-5b89-bf31-7433ffecfd4c", nombre: "1 año", descripcion: "Licencia anual", duracion_dias: 365, pantallas: 1, precio_venta: 69000, orden: 1, costos: [["p4", 67000, 365]] },
    ],
  },
];
