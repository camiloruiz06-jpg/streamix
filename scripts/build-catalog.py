#!/usr/bin/env python3
"""
Fuente de verdad del catálogo de NOVAPLAY.

Genera:
  - src/lib/catalog-data.ts   (usado por la app en modo demostración)
  - supabase/seed.sql         (para cargar en la base de datos real)

Regla de precio: precio_venta = costo del proveedor más barato + MARGEN.
Cambia MARGEN abajo y vuelve a ejecutar:  python3 scripts/build-catalog.py
"""

import uuid, json, os

MARGEN = 1000  # pesos que se suman al costo más barato

NS = uuid.UUID("6f0d1f6a-0000-4000-8000-000000000000")
def uid(kind, key):
    return str(uuid.uuid5(NS, f"{kind}:{key}"))

# --------------------------------------------------------------- proveedores
PROVIDERS = [
    dict(key="p1", nombre="Proveedor 1",
         contacto="", whatsapp="573245338353", email="",
         condiciones="Netflix con vigencia de 33 días (mes + 3 días de cortesía).",
         estado="activo"),
    dict(key="p2", nombre="Proveedor 2",
         contacto="", whatsapp="573008777786", email="",
         condiciones="Maneja combos de varias plataformas en una sola compra.",
         estado="activo"),
    dict(key="p3", nombre="Proveedor 3",
         contacto="", whatsapp="573011216223", email="",
         condiciones="Precios por pantalla, 30 días. Deezer sujeto a disponibilidad.",
         estado="activo"),
    dict(key="p4", nombre="Proveedor 4",
         contacto="", whatsapp="573135211240", email="",
         condiciones="Catálogo más amplio: streaming, IA, software y gaming. Garantía y soporte.",
         estado="activo"),
]

# ---------------------------------------------------------------- categorías
CATEGORIES = [
    dict(slug="streaming",  nombre="Streaming",       desc="Películas y series bajo demanda.",                     icono="clapperboard", color="#a855f7", orden=1),
    dict(slug="combos",     nombre="Combos",          desc="Varias plataformas en un solo pago, al mejor precio.", icono="layers",       color="#ff2fd0", orden=2),
    dict(slug="deportes",   nombre="Deportes",        desc="Fútbol y eventos en vivo.",                            icono="trophy",       color="#f97316", orden=3),
    dict(slug="musica",     nombre="Música",          desc="Canciones y podcasts sin anuncios.",                   icono="music",        color="#22c55e", orden=4),
    dict(slug="ia",         nombre="Inteligencia artificial", desc="Las mejores IA con cuenta propia.",            icono="sparkles",     color="#38bdf8", orden=5),
    dict(slug="diseno",     nombre="Diseño",          desc="Herramientas creativas premium.",                      icono="palette",      color="#ec4899", orden=6),
    dict(slug="gaming",     nombre="Gaming",          desc="Suscripciones de consola y PC.",                       icono="gamepad-2",    color="#8b5cf6", orden=7),
    dict(slug="software",   nombre="Software",        desc="Ofimática y seguridad.",                               icono="monitor",      color="#64748b", orden=8),
]

# ------------------------------------------------------------------ servicios
# costos = { clave_proveedor: (costo, duracion_dias) }
S = []
def srv(slug, nombre, cat, corta, larga, color, planes, destacado=False):
    S.append(dict(slug=slug, nombre=nombre, cat=cat, corta=corta, larga=larga,
                  color=color, destacado=destacado, planes=planes))

def plan(nombre, desc, costos, dias=30, pantallas=1):
    return dict(nombre=nombre, desc=desc, costos=costos, dias=dias, pantallas=pantallas)

# ---- COMBOS (los que más se venden) ---------------------------------------
srv("combo-netflix-prime", "Netflix + Prime Video", "combos",
    "Las dos plataformas más pedidas en un solo pago.",
    "Perfil propio en Netflix y en Prime Video por un solo precio. Entrega inmediata y garantía durante toda la vigencia.",
    "#e50914", [plan("Combo · 1 pantalla c/u", "Un perfil en cada plataforma", {"p2": (19000, 30)})], destacado=True)

srv("combo-netflix-max", "Netflix + Max", "combos",
    "Netflix y todo el catálogo de HBO juntos.",
    "Perfil propio en Netflix y en Max (HBO). Ideal si sigues series de HBO y estrenos de Netflix al mismo tiempo. Entrega inmediata y garantía durante toda la vigencia.",
    "#7c3aed", [plan("Combo · 1 pantalla c/u", "Un perfil en cada plataforma",
                     {"p2": (19000, 30), "p4": (16000, 30)})], destacado=True)

srv("combo-netflix-prime-disney", "Netflix + Prime + Disney+", "combos",
    "Tres plataformas, un solo pago.",
    "Perfil propio en Netflix, Prime Video y Disney+. El combo más completo para toda la familia.",
    "#0f2fa5", [plan("Combo · 1 pantalla c/u", "Un perfil en cada plataforma", {"p2": (29000, 30)})], destacado=True)

srv("combo-netflix-prime-max", "Netflix + Prime + Max", "combos",
    "Cine, series y estrenos sin límite.",
    "Perfil propio en Netflix, Prime Video y Max.",
    "#6d28d9", [plan("Combo · 1 pantalla c/u", "Un perfil en cada plataforma", {"p2": (26000, 30)})])

srv("combo-netflix-prime-spotify", "Netflix + Prime + Spotify", "combos",
    "Entretenimiento completo: video y música.",
    "Perfil propio en Netflix y Prime Video, más Spotify Premium.",
    "#1db954", [plan("Combo · 1 pantalla c/u", "Video y música incluidos", {"p2": (27000, 30)})])

# ---- STREAMING -------------------------------------------------------------
srv("netflix", "Netflix", "streaming",
    "Series, películas y originales en HD/4K.",
    "Acceso a todo el catálogo de Netflix con calidad HD o 4K según el plan. Entrega inmediata, garantía durante toda la vigencia y soporte por WhatsApp.",
    "#e50914", [
        plan("Premium · 1 pantalla", "Perfil propio en HD/4K",
             {"p1": (14000, 33), "p2": (14000, 30), "p3": (13000, 30), "p4": (12000, 30)}),
        plan("Cuenta completa", "5 perfiles, control total de la cuenta",
             {"p4": (37000, 30)}, pantallas=5),
    ], destacado=True)

srv("disney-plus", "Disney+", "streaming",
    "Disney, Pixar, Marvel, Star Wars y ESPN.",
    "Todo el universo Disney en un solo lugar, incluyendo Star y ESPN en el plan premium.",
    "#0f2fa5", [
        plan("Estándar · 1 pantalla", "Perfil propio, catálogo básico", {"p3": (6000, 30)}),
        plan("Premium con ESPN · 1 pantalla", "Perfil propio con deportes incluidos",
             {"p1": (11000, 30), "p2": (10000, 30), "p3": (10000, 30), "p4": (9000, 30)}),
        plan("Cuenta completa Premium", "7 perfiles, control total", {"p4": (33000, 30)}, pantallas=7),
    ], destacado=True)

srv("max", "Max (HBO)", "streaming",
    "HBO, DC, Warner y los estrenos del año.",
    "El catálogo completo de Max con series originales de HBO, cine de Warner y contenido DC.",
    "#7c3aed", [
        plan("Estándar · 1 pantalla", "Perfil propio sin anuncios",
             {"p1": (9000, 30), "p2": (7000, 30), "p3": (5000, 30), "p4": (6000, 30)}),
    ], destacado=True)

srv("prime-video", "Prime Video", "streaming",
    "Cine, series y producciones originales de Amazon.",
    "Prime Video con acceso a estrenos, series originales y contenido exclusivo de Amazon.",
    "#00a8e1", [
        plan("Estándar · 1 pantalla", "Perfil propio",
             {"p1": (9000, 30), "p2": (7000, 30), "p3": (5000, 30), "p4": (6000, 30)}),
        plan("Cuenta completa", "Control total de la cuenta", {"p4": (18000, 30)}, pantallas=6),
    ], destacado=True)

srv("paramount-plus", "Paramount+", "streaming",
    "Cine, series y contenido exclusivo de Paramount.",
    "Paramount+ con su catálogo completo de películas y series originales.",
    "#0064ff", [
        plan("Estándar · 1 pantalla", "Perfil propio",
             {"p2": (10000, 30), "p3": (5000, 30), "p4": (10000, 30)}),
    ])

srv("crunchyroll", "Crunchyroll", "streaming",
    "El catálogo de anime más grande, con simulcast.",
    "Anime sin anuncios, episodios el mismo día de su estreno en Japón y biblioteca completa.",
    "#f47521", [
        plan("Mega Fan · 1 pantalla", "Anime sin anuncios",
             {"p1": (6000, 30), "p2": (5000, 30), "p3": (5000, 30), "p4": (7000, 30)}),
    ])

srv("vix", "Vix", "streaming",
    "Cine y series en español, novelas y fútbol.",
    "Vix Premium con contenido en español, novelas, cine mexicano y deportes.",
    "#ff4d4d", [
        plan("Estándar · 1 pantalla", "Perfil propio", {"p3": (4000, 30), "p4": (6000, 30)}),
    ])

srv("plex", "Plex", "streaming",
    "Tu biblioteca de películas y series en un solo lugar.",
    "Plex Premium con acceso a bibliotecas y contenido gratuito con soporte.",
    "#e5a00d", [
        plan("Pantalla", "Un dispositivo", {"p3": (5000, 30), "p4": (5000, 30)}),
        plan("Premium · 3 dispositivos", "Hasta 3 dispositivos", {"p4": (15000, 30)}, pantallas=3),
    ])

srv("iptv", "IPTV", "streaming",
    "Canales en vivo, nacionales e internacionales.",
    "Servicio de televisión por internet con canales nacionales, internacionales y deportes.",
    "#38bdf8", [
        plan("Estándar", "Canales en vivo", {"p3": (5000, 30)}),
        plan("IPTV + WIN Sports", "Incluye WIN Sports+", {"p4": (10000, 30)}),
    ])

srv("jellyfin", "Jellyfin", "streaming",
    "Servidor de streaming privado con gran catálogo.",
    "Acceso a un servidor Jellyfin con biblioteca de películas y series.",
    "#a855f7", [
        plan("Acceso mensual", "Un usuario", {"p4": (15000, 30)}),
    ])

srv("viki-rakuten", "Viki Rakuten", "streaming",
    "Doramas coreanos, chinos y japoneses.",
    "Rakuten Viki con doramas y series asiáticas subtituladas, sin anuncios.",
    "#00b0f0", [
        plan("Estándar · 1 pantalla", "Perfil propio", {"p4": (9000, 30)}),
    ])

srv("flujo-tv", "Flujo TV", "streaming",
    "Canales en vivo y contenido bajo demanda.",
    "Plataforma de televisión en línea con canales en vivo y catálogo bajo demanda.",
    "#22d3ee", [
        plan("Pantalla", "Un dispositivo", {"p4": (10000, 30)}),
        plan("Cuenta completa", "Varios dispositivos", {"p4": (18000, 30)}, pantallas=4),
    ])

srv("telelatino", "Telelatino + WIN", "streaming",
    "Canales latinos con WIN Sports incluido.",
    "Telelatino con canales en español y WIN Sports+ para el fútbol colombiano.",
    "#f59e0b", [
        plan("Mensual", "Canales latinos + WIN", {"p4": (15000, 30)}),
    ])

srv("youtube-premium", "YouTube Premium", "streaming",
    "YouTube sin anuncios, con descargas y música.",
    "YouTube Premium: video sin anuncios, reproducción en segundo plano, descargas y YouTube Music.",
    "#ff0000", [
        plan("Premium · 1 mes", "Cuenta propia", {"p3": (7000, 30), "p4": (10000, 30)}),
    ])

# ---- DEPORTES --------------------------------------------------------------
srv("paramount-deportes", "Paramount+ Deportes", "deportes",
    "Fútbol internacional y eventos en vivo.",
    "Paramount+ con el paquete de deportes: DSports, fútbol internacional y eventos en directo.",
    "#0ea5e9", [
        plan("Mensual", "Deportes en vivo", {"p1": (8000, 30), "p3": (10000, 30)}),
    ], destacado=True)

srv("directv-go", "DIRECTV GO · Plan Oro", "deportes",
    "Canales premium y deportes en vivo.",
    "DIRECTV GO Plan Oro con canales premium y deportes en directo (sin WIN Sports).",
    "#f97316", [
        plan("Plan Oro · mensual", "Sin WIN Sports", {"p4": (20000, 30)}),
    ])

# ---- MÚSICA ----------------------------------------------------------------
srv("spotify", "Spotify Premium", "musica",
    "Música y podcasts sin anuncios, con descargas.",
    "Spotify Premium: sin anuncios, reproducción sin conexión, calidad alta y saltos ilimitados.",
    "#1db954", [
        plan("Premium · 1 mes", "Cuenta propia renovable",
             {"p1": (9000, 30), "p2": (8000, 30), "p3": (8000, 30), "p4": (11000, 30)}),
        plan("Premium · 3 meses", "Ahorra pagando por trimestre", {"p4": (22000, 90)}, dias=90),
    ], destacado=True)

srv("deezer", "Deezer", "musica",
    "Millones de canciones sin anuncios.",
    "Deezer Premium con música ilimitada, descargas y sin publicidad. Sujeto a disponibilidad.",
    "#a238ff", [
        plan("Premium · 1 mes", "Consultar disponibilidad", {"p3": (3000, 30)}),
    ])

# ---- IA --------------------------------------------------------------------
srv("chatgpt", "ChatGPT Pro", "ia",
    "El modelo más avanzado de OpenAI, sin límites.",
    "Acceso a ChatGPT Pro con los modelos más avanzados, respuestas prioritarias y funciones premium.",
    "#10a37f", [
        plan("Business Pro · 1 mes", "Cuenta con acceso completo", {"p4": (23000, 30)}),
    ], destacado=True)

srv("gemini-pro", "Gemini Pro", "ia",
    "La IA de Google con todas sus funciones.",
    "Gemini Pro con acceso a los modelos avanzados de Google, generación de imágenes y más.",
    "#4285f4", [
        plan("Pro · 1 mes", "Cuenta con acceso completo", {"p3": (10000, 30), "p4": (20000, 30)}),
    ])

srv("perplexity", "Perplexity Pro", "ia",
    "Buscador con IA y fuentes verificadas.",
    "Perplexity Pro: búsquedas ilimitadas con IA, modelos avanzados y respuestas con fuentes.",
    "#20808d", [
        plan("Pro · 1 mes", "Cuenta con acceso completo", {"p4": (20000, 30)}),
    ])

# ---- DISEÑO ----------------------------------------------------------------
srv("canva-pro", "Canva Pro", "diseno",
    "Diseño profesional con plantillas premium.",
    "Canva Pro con millones de recursos, quitar fondos, kit de marca y almacenamiento ampliado.",
    "#8b5cf6", [
        plan("Pro · 1 mes", "Correo personal", {"p3": (5000, 30), "p4": (6000, 30)}),
        plan("Pro · 6 meses", "Correo personal", {"p4": (25000, 180)}, dias=180),
        plan("Pro · 1 año", "Correo personal", {"p4": (38000, 365)}, dias=365),
    ], destacado=True)

srv("capcut-pro", "CapCut Pro", "diseno",
    "Edición de video profesional sin marca de agua.",
    "CapCut Pro con efectos premium, exportación en 4K y sin marca de agua.",
    "#000000", [
        plan("Pro · 1 mes", "Cuenta con acceso completo", {"p4": (18000, 30)}),
    ])

# ---- GAMING ----------------------------------------------------------------
srv("xbox-game-pass", "Xbox Game Pass", "gaming",
    "Cientos de juegos en consola y PC.",
    "Xbox Game Pass con acceso a cientos de juegos, estrenos el día de lanzamiento y juego en la nube.",
    "#107c10", [
        plan("Mensual", "Consola y PC", {"p4": (45000, 30)}),
    ])

srv("ps-plus", "PlayStation Plus Deluxe", "gaming",
    "Catálogo de juegos para PS4 y PS5.",
    "PS Plus Deluxe con catálogo de juegos, clásicos y multijugador en línea.",
    "#0070d1", [
        plan("Mensual · PS4/PS5", "Cuenta con acceso completo", {"p4": (76000, 30)}),
    ])

# ---- SOFTWARE --------------------------------------------------------------
srv("office-365", "Microsoft Office 365", "software",
    "Word, Excel, PowerPoint y 1 TB en la nube.",
    "Office 365 por un año completo con todas las aplicaciones de escritorio y OneDrive.",
    "#d83b01", [
        plan("1 año · compartida", "Licencia compartida", {"p4": (70000, 365)}, dias=365),
        plan("1 año · correo personal", "Licencia en tu propio correo", {"p4": (171000, 365)}, dias=365),
    ])

srv("mcafee", "McAfee Antivirus", "software",
    "Protección completa para tus dispositivos.",
    "McAfee Antivirus por un año con protección en tiempo real y navegación segura.",
    "#c01818", [
        plan("1 año", "Licencia anual", {"p4": (67000, 365)}, dias=365),
    ])

# ============================================================================
# Generación
# ============================================================================

# El orden de aparición en la tienda sigue el orden de las categorías:
# primero Streaming, luego Combos, y así sucesivamente.
_orden_cat = {c["slug"]: c["orden"] for c in CATEGORIES}
_declarado = {id(x): i for i, x in enumerate(S)}
S.sort(key=lambda x: (_orden_cat.get(x["cat"], 99), _declarado[id(x)]))

for i, s in enumerate(S):
    s["orden"] = i + 1
    s["id"] = uid("service", s["slug"])
    for j, p in enumerate(s["planes"]):
        p["orden"] = j + 1
        p["id"] = uid("plan", f"{s['slug']}:{j}")
        costos = [c for c, _ in p["costos"].values()]
        p["precio"] = min(costos) + MARGEN

for c in CATEGORIES:
    c["id"] = uid("category", c["slug"])
for p in PROVIDERS:
    p["id"] = uid("provider", p["key"])

CAT_ID = {c["slug"]: c["id"] for c in CATEGORIES}
PROV_ID = {p["key"]: p["id"] for p in PROVIDERS}
PROV_NAME = {p["key"]: p["nombre"] for p in PROVIDERS}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --------------------------------------------------------------------- logos
# Busca en public/logos un archivo que se llame igual que el slug del servicio.
# Acepta .svg, .png, .webp, .jpg. Si no hay, el servicio muestra su monograma.
LOGOS_DIR = os.path.join(ROOT, "public", "logos")
# Si hay varios archivos para el mismo servicio, gana la imagen real sobre el
# icono monocromo genérico (.svg queda de último).
_PRIORIDAD = [".png", ".webp", ".jpg", ".jpeg", ".svg"]
_logos = {}
if os.path.isdir(LOGOS_DIR):
    _por_base = {}
    for f in os.listdir(LOGOS_DIR):
        base, ext = os.path.splitext(f)
        if ext.lower() in _PRIORIDAD:
            _por_base.setdefault(base, []).append(f)
    for base, archivos in _por_base.items():
        archivos.sort(key=lambda f: _PRIORIDAD.index(os.path.splitext(f)[1].lower()))
        _logos[base] = f"/logos/{archivos[0]}"

def logo_de(slug):
    return _logos.get(slug)

for _s in S:
    _s["logo"] = logo_de(_s["slug"])


# ------------------------------------------------------------ catalog-data.ts
def ts(v):
    return json.dumps(v, ensure_ascii=False)

lines = []
lines.append("""/* eslint-disable */
/**
 * ---------------------------------------------------------------------------
 * CATÁLOGO Y PRECIOS DE PROVEEDORES  ·  ARCHIVO GENERADO
 * ---------------------------------------------------------------------------
 * No edites este archivo a mano: se genera desde `scripts/build-catalog.py`.
 * Para cambiar precios o agregar servicios, edita ese script y ejecuta:
 *
 *     python3 scripts/build-catalog.py
 *
 * Regla de precio de venta: costo del proveedor más barato + $%s.
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
""" % f"{MARGEN:,}".replace(",", "."))

lines.append("export const seedCategories: SeedCategory[] = [")
for c in CATEGORIES:
    lines.append(f"  {{ id: {ts(c['id'])}, slug: {ts(c['slug'])}, nombre: {ts(c['nombre'])}, descripcion: {ts(c['desc'])}, icono: {ts(c['icono'])}, color: {ts(c['color'])}, orden: {c['orden']} }},")
lines.append("];\n")

lines.append("export const seedProviders: SeedProvider[] = [")
for p in PROVIDERS:
    lines.append(f"  {{ id: {ts(p['id'])}, key: {ts(p['key'])}, nombre: {ts(p['nombre'])}, contacto: {ts(p['contacto'])}, whatsapp: {ts(p['whatsapp'])}, email: {ts(p['email'])}, condiciones: {ts(p['condiciones'])}, estado: 'activo' }},")
lines.append("];\n")

lines.append("export const seedServices: SeedService[] = [")
for s in S:
    lines.append("  {")
    lines.append(f"    id: {ts(s['id'])}, slug: {ts(s['slug'])}, nombre: {ts(s['nombre'])}, logo_url: {ts(s['logo'])},")
    lines.append(f"    categoria: {ts(s['cat'])}, color: {ts(s['color'])}, destacado: {str(s['destacado']).lower()}, orden: {s['orden']},")
    lines.append(f"    descripcion_corta: {ts(s['corta'])},")
    lines.append(f"    descripcion: {ts(s['larga'])},")
    lines.append("    planes: [")
    for p in s["planes"]:
        costos = ", ".join(f"[{ts(k)}, {c}, {d}]" for k, (c, d) in p["costos"].items())
        lines.append(f"      {{ id: {ts(p['id'])}, nombre: {ts(p['nombre'])}, descripcion: {ts(p['desc'])}, duracion_dias: {p['dias']}, pantallas: {p['pantallas']}, precio_venta: {p['precio']}, orden: {p['orden']}, costos: [{costos}] }},")
    lines.append("    ],")
    lines.append("  },")
lines.append("];\n")

os.makedirs(os.path.join(ROOT, "src/lib"), exist_ok=True)
with open(os.path.join(ROOT, "src/lib/catalog-data.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

# -------------------------------------------------------------------- seed.sql
def q(v):
    if v is None or v == "":
        return "null"
    return "'" + str(v).replace("'", "''") + "'"

sql = []
sql.append(f"""-- ============================================================================
-- NOVAPLAY · Catálogo real (generado)
-- ----------------------------------------------------------------------------
-- Generado por scripts/build-catalog.py — no lo edites a mano.
-- Ejecútalo en Supabase → SQL Editor DESPUÉS de schema.sql
--
-- Precio de venta = costo del proveedor más barato + ${MARGEN:,}
-- ============================================================================
""".replace(",", "."))

sql.append("-- ------------------------------------------------------------- categorías")
sql.append("insert into categories (id, slug, nombre, descripcion, icono, color, orden) values")
sql.append(",\n".join(
    f"  ({q(c['id'])}, {q(c['slug'])}, {q(c['nombre'])}, {q(c['desc'])}, {q(c['icono'])}, {q(c['color'])}, {c['orden']})"
    for c in CATEGORIES) + "\non conflict (id) do update set nombre = excluded.nombre, descripcion = excluded.descripcion, orden = excluded.orden;\n")

sql.append("-- ------------------------------------------------------------ proveedores")
sql.append("insert into providers (id, nombre, contacto, whatsapp, email, condiciones, estado) values")
sql.append(",\n".join(
    f"  ({q(p['id'])}, {q(p['nombre'])}, {q(p['contacto'])}, {q(p['whatsapp'])}, {q(p['email'])}, {q(p['condiciones'])}, 'activo')"
    for p in PROVIDERS) + "\non conflict (id) do update set condiciones = excluded.condiciones;\n")

sql.append("-- -------------------------------------------------------------- servicios")
sql.append("insert into services (id, category_id, slug, nombre, descripcion_corta, descripcion, logo_url, color, destacado, activo, orden) values")
sql.append(",\n".join(
    f"  ({q(s['id'])}, {q(CAT_ID[s['cat']])}, {q(s['slug'])}, {q(s['nombre'])}, {q(s['corta'])}, {q(s['larga'])}, {q(s['logo'])}, {q(s['color'])}, {str(s['destacado']).lower()}, true, {s['orden']})"
    for s in S) + "\non conflict (id) do update set nombre = excluded.nombre, descripcion_corta = excluded.descripcion_corta, descripcion = excluded.descripcion, logo_url = excluded.logo_url, color = excluded.color, destacado = excluded.destacado, orden = excluded.orden;\n")

sql.append("-- ----------------------------------------------------------------- planes")
rows = []
for s in S:
    for p in s["planes"]:
        rows.append(f"  ({q(p['id'])}, {q(s['id'])}, {q(p['nombre'])}, {q(p['desc'])}, {p['dias']}, {p['precio']}, {p['pantallas']}, true, true, {p['orden']})")
sql.append("insert into service_plans (id, service_id, nombre, descripcion, duracion_dias, precio_venta, pantallas, disponible, activo, orden) values")
sql.append(",\n".join(rows) + "\non conflict (id) do update set nombre = excluded.nombre, duracion_dias = excluded.duracion_dias, precio_venta = excluded.precio_venta, orden = excluded.orden;\n")

sql.append("-- ------------------------------------- precios de proveedor (comparador)")
sql.append("delete from provider_prices;")
rows = []
for s in S:
    for p in s["planes"]:
        for k, (costo, dias) in p["costos"].items():
            rows.append(f"  ({q(PROV_ID[k])}, {q(s['id'])}, {q(p['id'])}, {q(p['nombre'])}, {costo}, {dias}, true)")
sql.append("insert into provider_prices (provider_id, service_id, plan_id, etiqueta, costo, duracion_dias, activo) values")
sql.append(",\n".join(rows) + ";\n")

sql.append("""-- ============================================================================
-- Listo. Revisa el catálogo en Supabase → Table Editor → services.
-- Recuerda ponerles nombre y WhatsApp reales a tus proveedores en la tabla
-- `providers` (ahora aparecen como "Proveedor 1", "Proveedor 2"…).
-- ============================================================================
""")

with open(os.path.join(ROOT, "supabase/seed.sql"), "w", encoding="utf-8") as f:
    f.write("\n".join(sql))

# ------------------------------------------------------------------- resumen
total_planes = sum(len(s["planes"]) for s in S)
total_precios = sum(len(p["costos"]) for s in S for p in s["planes"])
print(f"Servicios: {len(S)} · Planes: {total_planes} · Precios de proveedor: {total_precios}")
print(f"Categorías: {len(CATEGORIES)} · Proveedores: {len(PROVIDERS)} · Margen: ${MARGEN}")
print(f"Logos conectados: {sum(1 for x in S if x['logo'])} de {len(S)} servicios")
