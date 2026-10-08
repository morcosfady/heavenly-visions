"""Cut a Gemini icon off its flat magenta background and save 256 / 512 px WebP files.
usage: python key.py <name> <screenshot.jpg> [top=100] [size=624] [out=F:/Heavenly Visions/repo/icons3d]
The screenshot is 624 wide, the picture sits at y=top, size x size."""
import sys, os
from PIL import Image

name, src = sys.argv[1], sys.argv[2]
top = int(sys.argv[3]) if len(sys.argv) > 3 else 100
size = int(sys.argv[4]) if len(sys.argv) > 4 else 624
out = sys.argv[5] if len(sys.argv) > 5 else 'F:/Heavenly Visions/repo/icons3d'
os.makedirs(out, exist_ok=True)

full = Image.open(src).convert('RGB')
# find the picture: the region that is not plain white
fp = full.load(); FW, FH = full.size
def notwhite(x, y):
    r, g, b = fp[x, y]
    return not (r > 244 and g > 244 and b > 244)
ys = [y for y in range(0, FH, 2) if notwhite(FW // 2, y) and notwhite(8, y)]
x0, x1 = 0, FW - 1
y0, y1 = ys[0], ys[-1]
side = min(x1 - x0 + 1, y1 - y0 + 1)
im = full.crop((x0 + 4, y0 + 4, x0 + side - 4, y0 + side - 4))
px = im.load()
W, H = im.size
res = Image.new('RGBA', (W, H))
rp = res.load()
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        m = min(r, b) - g                       # how magenta the pixel is
        if min(r, b) < 150:
            m = min(m, 60)                      # dark or non-magenta pixels are never background
        a = 1.0 - max(0.0, min(1.0, (m - 55) / 55.0))
        if a <= 0:
            rp[x, y] = (0, 0, 0, 0)
            continue
        if a < 1:                               # take the magenta out of the edge colour
            bgc = (255, 40, 255)
            r = int(max(0, min(255, (r - (1 - a) * bgc[0]) / a)))
            g = int(max(0, min(255, (g - (1 - a) * bgc[1]) / a)))
            b = int(max(0, min(255, (b - (1 - a) * bgc[2]) / a)))
            # remaining pink fringe: pull red and blue down toward green
            lim = g + 70
            r = min(r, lim)
            b = min(b, lim + 10)
        rp[x, y] = (r, g, b, int(a * 255))

from PIL import ImageFilter
al = res.getchannel('A').filter(ImageFilter.MinFilter(3))
res.putalpha(al)
box = res.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
res = res.crop(box)
w, h = res.size
s = int(max(w, h) * 1.08)
sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
sq.paste(res, ((s - w) // 2, (s - h) // 2))
for px_size in (256, 512):
    t = sq.resize((px_size, px_size), Image.LANCZOS)
    t.save(os.path.join(out, f'{name}{"" if px_size == 256 else "@2x"}.webp'), 'WEBP', quality=88, method=6)
print(name, 'ok', os.path.getsize(os.path.join(out, name + '.webp')), 'bytes at 256')
