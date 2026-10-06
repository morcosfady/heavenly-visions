"""Makes the app icons for Google Play and the App Store from icon-512.png and logo.png.
Run from the repo root:  python store/tools/make-icons.py
Needs Pillow (pip install pillow)."""
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'store', 'icons')
src = Image.open(os.path.join(ROOT, 'icon-512.png')).convert('RGBA')
logo = Image.open(os.path.join(ROOT, 'logo.png')).convert('RGBA')
NAVY = (29, 58, 107)

def save(img, *path):
    p = os.path.join(OUT, *path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p, optimize=True)

# Android launcher icons (mdpi to xxxhdpi) and the Play Store icon
for name, px in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
    save(src.resize((px, px), Image.LANCZOS), 'android', 'mipmap-' + name, 'ic_launcher.png')
save(src.resize((512, 512), Image.LANCZOS), 'android', 'play-store-icon-512.png')

# Adaptive icon: a solid background and the logo in the safe zone (66 percent of the canvas)
fg = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
w = int(432 * 0.62)
l2 = logo.resize((w, int(w * logo.height / logo.width)), Image.LANCZOS)
fg.paste(l2, ((432 - l2.width) // 2, (432 - l2.height) // 2), l2)
save(fg, 'android', 'adaptive', 'ic_launcher_foreground.png')
save(Image.new('RGBA', (432, 432), NAVY + (255,)), 'android', 'adaptive', 'ic_launcher_background.png')
open(os.path.join(OUT, 'android', 'adaptive', 'background-color.txt'), 'w').write('#1D3A6B\n')

# iOS: 1024 with no transparency, plus the usual sizes
flat = Image.new('RGB', (1024, 1024), NAVY)
big = src.resize((1024, 1024), Image.LANCZOS)
flat.paste(big, (0, 0), big)
save(flat, 'ios', 'AppIcon-1024.png')
for px in [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180]:
    save(flat.resize((px, px), Image.LANCZOS), 'ios', 'AppIcon-%d.png' % px)

# splash logo for the Android launch screen
splash = Image.new('RGBA', (960, 960), (0, 0, 0, 0))
w = 720
l3 = logo.resize((w, int(w * logo.height / logo.width)), Image.LANCZOS)
splash.paste(l3, ((960 - w) // 2, (960 - l3.height) // 2), l3)
save(splash, 'android', 'splash-logo.png')
print('icons done')
