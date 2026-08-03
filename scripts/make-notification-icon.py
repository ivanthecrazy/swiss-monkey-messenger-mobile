"""Generate the Android status-bar notification icon at every density.

Android renders the notification (small) icon as a MONOCHROME MASK: it keeps only
the alpha channel, discards color, and tints the opaque pixels with
`default_notification_color`. A full-color launcher icon therefore shows up as a
flat white square — hence a dedicated silhouette.

We draw the same chat bubble as the app icon, but as a solid white shape with the
three dots PUNCHED OUT (transparent) so they read as holes in the silhouette.

Writes android/app/src/main/res/drawable-{density}/ic_stat_notification.png.
@capacitor/assets does NOT handle notification icons, so this is separate from
make-assets.py and is safe to re-run.
"""
import os
from PIL import Image, ImageDraw

WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)
S = 8  # supersample factor for smooth edges/holes

# Android status-bar icon sizes (dp == px at each density's baseline).
DENSITIES = {
    "mdpi": 24,
    "hdpi": 36,
    "xhdpi": 48,
    "xxhdpi": 72,
    "xxxhdpi": 96,
}

RES = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "android", "app", "src", "main", "res",
)


def render_master():
    """Draw the bubble silhouette once at high resolution, dots cut out."""
    px = 96 * S
    img = Image.new("RGBA", (px, px), CLEAR)
    d = ImageDraw.Draw(img)

    def s(v):
        return int(round(v * S))

    cx = cy = 48  # centre in dp space
    bw = 96 * 0.72  # glyph width; leaves ~2dp breathing room per side
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

    # three dots — punched out (fully transparent) so they read as holes.
    r = bw * 0.075
    gap = bw * 0.225
    dcy = (by0 + by1) / 2
    for i in (-1, 0, 1):
        dcx = cx + i * gap
        d.ellipse(
            [s(dcx - r), s(dcy - r), s(dcx + r), s(dcy + r)],
            fill=CLEAR,
        )
    return img


def main():
    master = render_master()
    for density, size in DENSITIES.items():
        out_dir = os.path.join(RES, f"drawable-{density}")
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, "ic_stat_notification.png")
        master.resize((size, size), Image.LANCZOS).save(path)
        print("wrote", os.path.relpath(path, RES), f"({size}x{size})")


if __name__ == "__main__":
    main()
