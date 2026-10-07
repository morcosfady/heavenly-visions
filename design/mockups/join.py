from PIL import Image
import os
for v in 'abc':
    shots = []
    for m in ('dark', 'light'):
        f = 'qa-shots/p0-home-%s-%s.png' % (v, m)
        im = Image.open(f).convert('RGB')
        off = (im.width - 390) // 2
        shots.append(im.crop((off, 0, off + 390, 960)))
        os.remove(f)
    out = Image.new('RGB', (800, 960), (20, 20, 30))
    out.paste(shots[0], (0, 0))
    out.paste(shots[1], (410, 0))
    out.save('qa-shots/p0-direction-%s.jpg' % v, quality=88)
