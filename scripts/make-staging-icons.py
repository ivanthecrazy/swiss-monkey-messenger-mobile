"""Generate the staging app's icons from the production ones.

The staging build (bundle/package id `io.swissmonkey.chat.staging`) installs next
to the store app, so it gets the same monkey on orange instead of brand purple —
easy to tell apart on a home screen. Every production icon is white mark on purple
(plus antialiased blends of the two), so each pixel is recoloured by how far it
sits between purple and white; alpha is kept. The Android adaptive foreground is
white on transparent and identical for both, so staging inherits it from main.

Run after `npx @capacitor/assets generate` (`npm run assets` does both). Writes:
  ios/App/App/Assets.xcassets/AppIcon-Staging.appiconset/    (Staging configuration)
  android/app/src/staging/res/mipmap-*/ic_launcher{,_round,_background}.png
"""
import glob
import json
import os
import shutil
from PIL import Image

PURPLE = (94, 0, 255)
WHITE = (255, 255, 255)
ORANGE = (240, 120, 0)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def recolour(src, dst):
    img = Image.open(src).convert("RGBA")
    out = []
    for r, g, b, a in img.getdata():
        # Position on the purple->white line, from the two channels that move.
        t = ((r - PURPLE[0]) / (WHITE[0] - PURPLE[0]) + (g - PURPLE[1]) / (WHITE[1] - PURPLE[1])) / 2
        t = min(max(t, 0.0), 1.0)
        out.append(tuple(round(o + (w - o) * t) for o, w in zip(ORANGE, WHITE)) + (a,))
    img.putdata(out)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst)
    print("wrote", os.path.relpath(dst, ROOT))


# --- iOS: a second app icon set, selected by the Staging build configuration ---
ios_src = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset")
ios_dst = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon-Staging.appiconset")
if os.path.isdir(ios_dst):
    shutil.rmtree(ios_dst)
os.makedirs(ios_dst)
with open(os.path.join(ios_src, "Contents.json")) as f:
    contents = json.load(f)
for image in contents["images"]:
    if "filename" in image:
        recolour(os.path.join(ios_src, image["filename"]), os.path.join(ios_dst, image["filename"]))
with open(os.path.join(ios_dst, "Contents.json"), "w") as f:
    json.dump(contents, f, indent=2)

# --- Android: the staging flavor's source set overrides main's launcher bitmaps ---
android_main = os.path.join(ROOT, "android/app/src/main/res")
android_staging = os.path.join(ROOT, "android/app/src/staging/res")
for name in ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_background.png"):
    for src in sorted(glob.glob(os.path.join(android_main, "mipmap-*", name))):
        density = os.path.basename(os.path.dirname(src))
        recolour(src, os.path.join(android_staging, density, name))
