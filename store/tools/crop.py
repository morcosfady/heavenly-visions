"""Crops a screenshot to the top left w x h css pixels. Usage: python crop.py file.png 360 640 3"""
import sys
from PIL import Image
f, w, h, s = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
im = Image.open(f).convert('RGB')
im.crop((0, 0, w * s, h * s)).save(f.rsplit('.', 1)[0] + '.jpg', 'JPEG', quality=88, optimize=True)
import os
os.remove(f)
