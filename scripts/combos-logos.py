#!/usr/bin/env python3
"""
Genera los logos de los COMBOS combinando los logos individuales que ya existen
en public/logos.

  · 2 plataformas → una arriba-izquierda y otra abajo-derecha
  · 3 plataformas → dos arriba y una centrada abajo

Uso:
    python3 scripts/combos-logos.py
    python3 scripts/build-catalog.py
"""

import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGOS = os.path.join(ROOT, "public", "logos")
LADO = 256
FONDO = (13, 12, 24)   # fondo de la placa del combo

# combo  ->  logos que lo componen (en orden)
COMBOS = {
    "combo-netflix-prime":          ["netflix", "prime-video"],
    "combo-netflix-max":            ["netflix", "max"],
    "combo-netflix-prime-disney":   ["netflix", "prime-video", "disney-plus"],
    "combo-netflix-prime-max":      ["netflix", "prime-video", "max"],
    "combo-netflix-prime-spotify":  ["netflix", "prime-video", "spotify"],
}


def cargar(slug):
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        ruta = os.path.join(LOGOS, slug + ext)
        if os.path.exists(ruta):
            im = Image.open(ruta).convert("RGB")
            lado = min(im.size)
            izq = (im.width - lado) // 2
            arr = (im.height - lado) // 2
            return im.crop((izq, arr, izq + lado, arr + lado)).resize((LADO, LADO), Image.LANCZOS)
    return None


def redondear(im, radio_frac=0.22):
    """Devuelve la imagen con las esquinas redondeadas (canal alfa)."""
    r = int(min(im.size) * radio_frac)
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([(0, 0), (im.width - 1, im.height - 1)], r, fill=255)
    im = im.convert("RGBA")
    im.putalpha(mask)
    return im


def lienzo_base():
    return Image.new("RGB", (LADO, LADO), FONDO)


def dos(a, b):
    """Dos plataformas: una arriba-izquierda y otra abajo-derecha."""
    lienzo = lienzo_base()
    chico = int(LADO * 0.60)
    margen = int(LADO * 0.045)
    ta = redondear(a.resize((chico, chico), Image.LANCZOS))
    tb = redondear(b.resize((chico, chico), Image.LANCZOS))
    lienzo.paste(ta, (margen, margen), ta)
    lienzo.paste(tb, (LADO - chico - margen, LADO - chico - margen), tb)
    return lienzo


def tres(a, b, c):
    """Tres plataformas: dos arriba y una centrada abajo."""
    lienzo = lienzo_base()
    chico = int(LADO * 0.46)
    hueco = int(LADO * 0.04)
    total = chico * 2 + hueco
    x0 = (LADO - total) // 2
    y0 = int(LADO * 0.06)
    piezas = [a, b, c]
    pos = [(x0, y0), (x0 + chico + hueco, y0), ((LADO - chico) // 2, y0 + chico + hueco)]
    for im, (x, y) in zip(piezas, pos):
        t = redondear(im.resize((chico, chico), Image.LANCZOS))
        lienzo.paste(t, (x, y), t)
    return lienzo


def main():
    hechos, faltan = [], {}
    for combo, partes in COMBOS.items():
        imgs, ausentes = [], []
        for p in partes:
            im = cargar(p)
            (imgs if im else ausentes).append(im if im else p)
        if ausentes:
            faltan[combo] = ausentes
            continue
        salida = dos(*imgs) if len(imgs) == 2 else tres(*imgs)
        salida.save(os.path.join(LOGOS, f"{combo}.png"), "PNG", optimize=True)
        hechos.append(combo)

    print(f"✅ Logos de combo generados: {len(hechos)}")
    for h in hechos:
        print(f"   · {h}")
    if faltan:
        print("\n⚠️  No se pudieron generar (falta el logo de una plataforma):")
        for combo, ausentes in faltan.items():
            print(f"   · {combo} → falta: {', '.join(ausentes)}")
    print("\nAhora ejecuta:  python3 scripts/build-catalog.py")


if __name__ == "__main__":
    main()
