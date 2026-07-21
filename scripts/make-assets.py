"""Generate the source icon/splash assets for @capacitor/assets.

Produces (in assets/):
  icon-only.png        1024  full-bleed purple + white chat bubble  -> iOS (OS masks it)
  icon-foreground.png  1024  transparent + bubble in the adaptive safe zone -> Android
  icon-background.png  1024  solid purple                            -> Android
  splash.png           2732  purple with a centered bubble
  splash-dark.png      2732  same (the brand purple reads fine in dark mode)

Then: npx @capacitor/assets generate
"""
import os
from PIL import Image, ImageDraw

PURPLE = (94, 0, 255, 255)
WHITE = (255, 255, 255, 255)
S = 4  # supersample factor, downscaled at the end for smooth edges

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
os.makedirs(OUT, exist_ok=True)


def draw_bubble(d, cx, cy, bw):
    """White chat bubble with three purple dots, centred on (cx, cy), `bw` wide.
    Ratios match the desktop app icon so the family stays consistent."""
    def s(v):
        return int(round(v * S))

    bh = bw * 0.767
    bx0, by0 = cx - bw / 2, cy - bh / 2 - bw * 0.03
    bx1, by1 = bx0 + bw, by0 + bh
    d.rounded_rectangle([s(bx0), s(by0), s(bx1), s(by1)], radius=s(bh * 0.30), fill=WHITE)

    # tail at the bottom-left, pointing down
    tail_x = bx0 + bw * 0.26
    d.polygon(
        [
            (s(tail_x), s(by1 - bh * 0.10)),
            (s(tail_x + bw * 0.20), s(by1 - bh * 0.10)),
            (s(tail_x - bw * 0.02), s(by1 + bh * 0.22)),
        ],
        fill=WHITE,
    )

    # three dots
    r = bw * 0.0617
    gap = bw * 0.225
    dcy = (by0 + by1) / 2
    for i in (-1, 0, 1):
        dcx = cx + i * gap
        d.ellipse([s(dcx - r), s(dcy - r), s(dcx + r), s(dcy + r)], fill=PURPLE)


def canvas(size, bg):
    img = Image.new("RGBA", (size * S, size * S), bg)
    return img, ImageDraw.Draw(img)


def save(img, size, name):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))
    print("wrote", name)


# --- iOS: full-bleed, no transparency (iOS rounds it) ---
img, d = canvas(1024, PURPLE)
draw_bubble(d, 512, 512, 1024 * 0.56)
save(img, 1024, "icon-only.png")

# --- Android adaptive foreground: transparent, glyph inside the safe zone (~66%) ---
img, d = canvas(1024, (0, 0, 0, 0))
draw_bubble(d, 512, 512, 1024 * 0.46)
save(img, 1024, "icon-foreground.png")

# --- Android adaptive background: solid brand purple ---
img, _ = canvas(1024, PURPLE)
save(img, 1024, "icon-background.png")

# --- Splash: logo well inside the centre, since it gets cropped per aspect ratio ---
for name in ("splash.png", "splash-dark.png"):
    img, d = canvas(2732, PURPLE)
    draw_bubble(d, 1366, 1366, 2732 * 0.22)
    save(img, 2732, name)
