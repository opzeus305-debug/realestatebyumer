"""Build the hero's sky: a seamless equirectangular dusk from a real photograph.

A shader ramp cannot produce cloud structure, and because the sky dome is also
the scene's reflection environment, a photograph means the tower's aluminium
mirrors real sky. Output is ~16 KB.

Only the top 34% of the source frame is used — that band is clean sky in this
photograph, no buildings, so there is no second Burj in the reflection.
"""
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np, os

SRC  = 'assets/stock/dusk-wide.jpg'      # Unsplash, free for commercial use
DST  = 'assets/img/sky-dusk.webp'
W, H, SKY_H = 2048, 1024, 592            # equirect; sky occupies zenith->horizon

src = Image.open(SRC).convert('RGB')
band = src.crop((0, 0, src.width, int(src.height * 0.34)))

# Seamless wrap: one half plus its mirror, so column 0 equals column W-1.
half = band.resize((W // 2, SKY_H), Image.LANCZOS)
sky = Image.new('RGB', (W, SKY_H))
sky.paste(half, (0, 0))
sky.paste(half.transpose(Image.FLIP_LEFT_RIGHT), (W // 2, 0))

sky = sky.filter(ImageFilter.GaussianBlur(1.1))          # drop jpeg grain
sky = ImageEnhance.Color(sky).enhance(0.80)              # house grade
sky = ImageEnhance.Brightness(sky).enhance(0.66)         # hold type contrast

out = Image.new('RGB', (W, H), (10, 11, 18))
out.paste(sky, (0, 0))
a = np.asarray(out).astype(np.float32)

for y in range(SKY_H):                                   # close the frame at the zenith
    a[y] *= 1.0 - 0.34 * (1.0 - y / SKY_H) ** 1.6

edge, night = a[SKY_H - 1].copy(), np.array([10, 11, 18], np.float32)
for y in range(SKY_H, H):                                # below horizon -> night
    k = ((y - SKY_H) / (H - SKY_H)) ** 0.55
    a[y] = edge * (1 - k) + night * k
for y in range(SKY_H - 14, SKY_H + 14):                  # soften the join
    if 0 <= y < H:
        a[y] = a[max(0, y - 14):min(H, y + 14)].mean(axis=0)

Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(DST, 'WEBP', quality=88, method=6)

chk = np.asarray(Image.open(DST).convert('RGB')).astype(int)
print(f'{DST}  {os.path.getsize(DST) // 1024} KB  '
      f'wrap seam delta {int(np.abs(chk[:, 0] - chk[:, -1]).max())} (low is seamless)')
