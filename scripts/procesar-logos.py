#!/usr/bin/env python3
"""
Normaliza los logos que subes a mano y los deja listos para la tienda.

Qué hace con cada imagen:
  - la recorta a un cuadrado,
  - la escala a 256x256,
  - si tiene fondo transparente, la coloca sobre una placa oscura del color
    de la marca (así nunca se ve un logo blanco flotando sobre la nada),
  - y la guarda como  public/logos/<slug>.png

Uso:
    python3 scripts/procesar-logos.py            # lee la carpeta ./logos
    python3 scripts/procesar-logos.py otra/ruta  # lee otra carpeta

Después ejecuta:
    python3 scripts/build-catalog.py
"""

import os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "logos")
DESTINO = os.path.join(ROOT, "public", "logos")
LADO = 256

# Color de marca de cada servicio, para la placa de los logos transparentes.
COLOR = {
    "netflix": "#e50914", "disney-plus": "#0f2fa5", "max": "#7c3aed",
    "prime-video": "#00a8e1", "paramount-plus": "#0064ff", "paramount-deportes": "#0ea5e9",
    "crunchyroll": "#f47521", "vix": "#ff4d4d", "plex": "#e5a00d", "iptv": "#38bdf8",
    "jellyfin": "#00a4dc", "viki-rakuten": "#00b0f0", "flujo-tv": "#22d3ee",
    "telelatino": "#f59e0b", "youtube-premium": "#ff0000", "directv-go": "#f97316",
    "spotify": "#1db954", "deezer": "#a238ff", "chatgpt": "#10a37f",
    "gemini-pro": "#4285f4", "perplexity": "#20808d", "canva-pro": "#8b5cf6",
    "capcut-pro": "#111111", "xbox-game-pass": "#107c10", "ps-plus": "#0070d1",
    "office-365": "#d83b01", "mcafee": "#c01818",
}

# archivo de origen  ->  slug (o lista de slugs) del servicio
MAPA = {
    "Netflix-Symbol.png": "netflix",
    "amazon-prime-video.jpg": "prime-video",
    "d74a40e4-8b03-4abf-8e41-cf8800fdb409.jpeg": "max",
    "b488899c-a386-406e-8379-d609094e84fe.jpeg": ["paramount-plus", "paramount-deportes"],
    "Crunchyroll-Simbolo.png": "crunchyroll",
    "bfc67dcd-7892-4b7c-a72d-3b5c95418eb7.jpeg": "vix",
    "5x93lknmuaw81.jpg": "plex",
    "images.jpeg": "iptv",
    "9aa2287a970217506aa0d447c4f058e8.png": "jellyfin",
    "viki-icon.png": "viki-rakuten",
    "unnamed.png": "flujo-tv",
    "telelatino.jpeg": "telelatino",
    "youtube-1.png": "youtube-premium",
    "images.png": "directv-go",
    "spotify-1759471_1280.jpg": "spotify",
    "images (1).png": "deezer",
    "chatgpt-logo-chat-gpt-icon-on-green-background-free-vector.jpg": "chatgpt",
    "images (1).jpeg": "gemini-pro",
    "perplexity-icon-logo-png_seeklogo-619417.png": "perplexity",
    "images (2).jpeg": "canva-pro",
    "sddefault.jpg": "capcut-pro",
    "disney.jpeg": "disney-plus",
    "office 365.jpg": "office-365",
    "xbox-logo-icon-free-vector.jpg": "xbox-game-pass",
    "mcafee.png": "mcafee",
    "playsataton.jpeg": "ps-plus",
}


def hex_a_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mezclar(c1, c2, f):
    """Mezcla dos colores. f=0 → c1, f=1 → c2."""
    return tuple(round(a + (b - a) * f) for a, b in zip(c1, c2))


def recortar_transparencia(im):
    """Quita el margen transparente sobrante."""
    caja = im.getbbox()
    return im.crop(caja) if caja else im


def procesar(ruta, slug):
    im = Image.open(ruta)
    tiene_alfa = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA")

    if tiene_alfa:
        im = recortar_transparencia(im)
        # placa oscura con el tinte de la marca
        marca = hex_a_rgb(COLOR.get(slug, "#a855f7"))
        fondo_rgb = mezclar((11, 10, 20), marca, 0.16)
        placa = Image.new("RGBA", (LADO, LADO), fondo_rgb + (255,))
        # el logo ocupa el 62 % de la placa
        im.thumbnail((int(LADO * 0.62), int(LADO * 0.62)), Image.LANCZOS)
        placa.paste(im, ((LADO - im.width) // 2, (LADO - im.height) // 2), im)
        salida = placa
    else:
        # imagen con fondo propio: recorte cuadrado centrado, estilo icono de app
        lado = min(im.size)
        izq = (im.width - lado) // 2
        arr = (im.height - lado) // 2
        salida = im.crop((izq, arr, izq + lado, arr + lado)).resize((LADO, LADO), Image.LANCZOS)

    destino = os.path.join(DESTINO, f"{slug}.png")
    salida.convert("RGB").save(destino, "PNG", optimize=True)
    return destino, "transparente" if tiene_alfa else "con fondo"


def main():
    if not os.path.isdir(ORIGEN):
        print(f"No encuentro la carpeta {ORIGEN}")
        return
    os.makedirs(DESTINO, exist_ok=True)

    hechos, faltan = [], []
    for archivo, slugs in MAPA.items():
        ruta = os.path.join(ORIGEN, archivo)
        if not os.path.exists(ruta):
            faltan.append(archivo)
            continue
        for slug in ([slugs] if isinstance(slugs, str) else slugs):
            _, tipo = procesar(ruta, slug)
            hechos.append(f"{slug} ({tipo})")
            # si existía una versión SVG genérica, la imagen real manda
            svg = os.path.join(DESTINO, f"{slug}.svg")
            if os.path.exists(svg):
                try:
                    os.remove(svg)
                except OSError:
                    pass

    print(f"✅ Logos procesados: {len(hechos)}")
    for h in sorted(hechos):
        print(f"   · {h}")
    if faltan:
        print(f"\n⚠️  No encontrados en {ORIGEN}:")
        for f in faltan:
            print(f"   · {f}")
    print("\nAhora ejecuta:  python3 scripts/build-catalog.py")


if __name__ == "__main__":
    main()
