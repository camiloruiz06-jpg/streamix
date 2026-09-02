/**
 * ---------------------------------------------------------------------------
 * GENERADOR DE LOGOS
 * ---------------------------------------------------------------------------
 * Escribe los logos disponibles en `public/logos/<slug>.svg`, en blanco, para
 * que se vean bien sobre el fondo oscuro de las tarjetas.
 *
 *     node scripts/build-logos.mjs
 *
 * Los logos vienen del paquete `simple-icons` (SVG bajo licencia CC0). Ojo:
 * varias marcas pidieron ser retiradas de ese paquete, así que no están todas.
 * Las que falten se marcan abajo y puedes ponerlas tú a mano: basta con dejar
 * el archivo en `public/logos/` con el nombre del slug del servicio
 * (por ejemplo `disney-plus.png`) y volver a ejecutar:
 *
 *     python3 scripts/build-catalog.py
 * ---------------------------------------------------------------------------
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, 'public', 'logos');
mkdirSync(OUT, { recursive: true });

/** slug del servicio  →  clave en simple-icons */
const MAPA = {
  netflix: 'siNetflix',
  max: 'siHbomax',
  crunchyroll: 'siCrunchyroll',
  'paramount-plus': 'siParamountplus',
  'paramount-deportes': 'siParamountplus',
  plex: 'siPlex',
  jellyfin: 'siJellyfin',
  'viki-rakuten': 'siRakuten',
  'youtube-premium': 'siYoutube',
  spotify: 'siSpotify',
  deezer: 'siDeezer',
  'gemini-pro': 'siGooglegemini',
  perplexity: 'siPerplexity',
  mcafee: 'siMcafee',
  'ps-plus': 'siPlaystation',
};

const COLOR = '#ffffff';
const hechos = [];
const faltantes = [];

for (const [slug, key] of Object.entries(MAPA)) {
  const icon = si[key];
  if (!icon) {
    faltantes.push(slug);
    continue;
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${icon.title}">` +
    `<title>${icon.title}</title>` +
    `<path fill="${COLOR}" d="${icon.path}"/>` +
    `</svg>\n`;
  writeFileSync(join(OUT, `${slug}.svg`), svg, 'utf8');
  hechos.push(slug);
}

// Aviso para el resto del catálogo
const yaHay = new Set(
  readdirSync(OUT)
    .filter((f) => /\.(svg|png|webp|jpe?g)$/i.test(f))
    .map((f) => f.replace(/\.[^.]+$/, '')),
);

const guia = `Logos de los servicios
======================

Cada archivo debe llamarse igual que el "slug" del servicio.
Formatos aceptados: .svg, .png, .webp, .jpg

Ejemplos:
  netflix.svg        -> servicio "netflix"
  disney-plus.png    -> servicio "disney-plus"
  canva-pro.png      -> servicio "canva-pro"

Después de agregar archivos, ejecuta:

  python3 scripts/build-catalog.py

Eso vuelve a leer esta carpeta y conecta cada logo con su servicio.
Los servicios sin logo muestran un monograma con el color de la marca,
que también se ve bien: no es obligatorio poner todos.

Recomendaciones:
  - Preferir SVG o PNG con fondo transparente.
  - Logos claros o blancos se ven mejor sobre el fondo oscuro.
  - Tamaño sugerido para PNG: 256x256 px.

Logos generados automáticamente: ${hechos.length}
`;
writeFileSync(join(OUT, 'LEEME.txt'), guia, 'utf8');

console.log(`✅ Logos generados: ${hechos.length}`);
console.log(`   ${hechos.join(', ')}`);
if (faltantes.length) console.log(`⚠️  No disponibles en simple-icons: ${faltantes.join(', ')}`);
console.log(`\n📁 Carpeta: public/logos  (${yaHay.size} archivos en total)`);
