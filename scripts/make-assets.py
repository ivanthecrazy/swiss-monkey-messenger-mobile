"""Generate the source icon/splash assets for @capacitor/assets.

The mark is the Swiss Monkey monkey, white on brand purple. `monkey-mark.png`
next to this script is the master: the vector mark (from the platform repo's
`public/logo_with_text.svg`) rasterised at 2048px, white with an alpha channel
and cropped to the glyph. Everything below is a placement of that one master, so
every size stays crisp and the family stays consistent.

Produces (in assets/):
  icon-only.png        1024  full-bleed purple + the mark, zoomed  -> iOS (OS masks it)
  icon-foreground.png  1024  transparent + the whole mark in the adaptive safe zone -> Android
  icon-background.png  1024  solid purple                          -> Android
  splash.png           2732  purple with the centred mark
  splash-dark.png      2732  same (the brand purple reads fine in dark mode)
  ../icons/icon-*.webp       square icons for web/PWA use

Then: npx @capacitor/assets generate
"""
import os
from PIL import Image

PURPLE = (94, 0, 255, 255)
CLEAR = (0, 0, 0, 0)
SS = 2  # supersample factor, downscaled at the end for smooth edges

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "assets")
ICONS = os.path.join(ROOT, "icons")

MARK = Image.open(os.path.join(HERE, "monkey-mark.png")).convert("RGBA")
MARK_ASPECT = MARK.height / MARK.width

# --- Framing --------------------------------------------------------------
# App icon: the supplied artwork is zoomed in, so the tail runs off the left
# edge and the body off the bottom. Fractions of the canvas, mark bbox.
ICON_W, ICON_X, ICON_Y = 0.973, -0.088, 0.137

# Android adaptive foreground: nothing may bleed, because the launcher masks the
# icon inside the middle 72dp of the 108dp layer and only the middle 66dp is
# guaranteed to survive. @capacitor/assets insets both layers by 16.7%, so this
# image *is* that 72dp square. The mark's smallest enclosing circle is r = 0.5343w
# around (0.5125w, 0.5162w); sizing it to 95% of the 66dp safe circle and centring
# that circle keeps the whole monkey clear of any mask shape, with a little air.
FG_W = 0.95 * (33 / 72) / 0.5343
FG_X, FG_Y = 0.5 - 0.5125 * FG_W, 0.5 - 0.5162 * FG_W

# Splash: small and centred, since it gets cropped to each device's aspect ratio.
SPLASH_W = 0.26


def canvas(size, bg, mark_w, mark_x, mark_y):
    """`size`px square of `bg` with the mark `mark_w` wide at (`mark_x`, `mark_y`).
    All three mark values are fractions of the canvas; the position is its top-left."""
    img = Image.new("RGBA", (size * SS, size * SS), bg)
    w = round(size * SS * mark_w)
    mark = MARK.resize((w, round(w * MARK_ASPECT)), Image.LANCZOS)
    img.alpha_composite(mark, (round(size * SS * mark_x), round(size * SS * mark_y)))
    return img.resize((size, size), Image.LANCZOS)


def centred(size, bg, mark_w):
    h = mark_w * MARK_ASPECT
    return canvas(size, bg, mark_w, (1 - mark_w) / 2, (1 - h) / 2)


def save(img, path):
    img.save(path)
    print("wrote", os.path.relpath(path, ROOT))


os.makedirs(OUT, exist_ok=True)

# --- iOS: full-bleed, no transparency (iOS rounds it) ---
icon = canvas(1024, PURPLE, ICON_W, ICON_X, ICON_Y)
save(icon, os.path.join(OUT, "icon-only.png"))

# --- Android adaptive foreground: transparent, whole mark inside the safe zone ---
save(canvas(1024, CLEAR, FG_W, FG_X, FG_Y), os.path.join(OUT, "icon-foreground.png"))

# --- Android adaptive background: solid brand purple ---
save(Image.new("RGBA", (1024, 1024), PURPLE), os.path.join(OUT, "icon-background.png"))

# --- Splash: logo well inside the centre, since it gets cropped per aspect ratio ---
splash = centred(2732, PURPLE, SPLASH_W)
for name in ("splash.png", "splash-dark.png"):
    save(splash, os.path.join(OUT, name))

# --- Plain square icons (web/PWA), same framing as the iOS icon ---
if os.path.isdir(ICONS):
    for size in (48, 72, 96, 128, 192, 256, 512):
        save(icon.resize((size, size), Image.LANCZOS), os.path.join(ICONS, f"icon-{size}.webp"))
