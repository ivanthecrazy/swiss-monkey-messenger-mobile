"""Generate the Android status-bar notification icon at every density.

Android renders the notification (small) icon as a MONOCHROME MASK: it keeps only
the alpha channel, discards color, and tints the opaque pixels with
`default_notification_color`. A full-color launcher icon therefore shows up as a
flat white square — hence a dedicated silhouette.

The whole monkey is too fine to read at 24dp (the tail all but disappears), so
this uses `monkey-head.png`: the head of the same mark, cut at the shoulders.
It is already a silhouette with the face punched out — eyes, nose and mouth are
transparent, so they read as holes once Android tints the rest.

Writes android/app/src/main/res/drawable-{density}/ic_stat_notification.png.
@capacitor/assets does NOT handle notification icons, so this is separate from
make-assets.py and is safe to re-run.
"""
import os
from PIL import Image

CLEAR = (0, 0, 0, 0)
SS = 8  # supersample factor for smooth edges/holes
FILL = 0.92  # fraction of the icon the head spans, leaving ~1dp breathing room

# Android status-bar icon sizes (dp == px at each density's baseline).
DENSITIES = {
    "mdpi": 24,
    "hdpi": 36,
    "xhdpi": 48,
    "xxhdpi": 72,
    "xxxhdpi": 96,
}

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(os.path.dirname(HERE), "android", "app", "src", "main", "res")

HEAD = Image.open(os.path.join(HERE, "monkey-head.png")).convert("RGBA")


def render_master():
    """Draw the head silhouette once at high resolution, centred in a square."""
    px = 96 * SS
    img = Image.new("RGBA", (px, px), CLEAR)
    scale = px * FILL / max(HEAD.width, HEAD.height)
    head = HEAD.resize((round(HEAD.width * scale), round(HEAD.height * scale)), Image.LANCZOS)
    img.alpha_composite(head, ((px - head.width) // 2, (px - head.height) // 2))
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
