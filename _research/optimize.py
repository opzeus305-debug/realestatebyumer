"""Resize + WebP-encode stock originals into responsive web assets."""
import os,glob,json
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
SRC='assets/stock'; OUT='assets/img'
os.makedirs(OUT,exist_ok=True)
WIDTHS=[640,1280,1920,2560]
rows=[]
for p in sorted(glob.glob(f'{SRC}/*.jpg')+glob.glob(f'{SRC}/*.png')):
    slug=os.path.splitext(os.path.basename(p))[0]
    try:
        im=Image.open(p); im=im.convert('RGB')
    except Exception as e:
        print('skip',slug,e); continue
    w0,h0=im.size; made=[]
    for w in WIDTHS:
        if w>w0 and made: break
        w=min(w,w0); h=round(h0*w/w0)
        r=im.resize((w,h),Image.LANCZOS)
        dst=f'{OUT}/{slug}-{w}.webp'
        r.save(dst,'WEBP',quality=82,method=6)
        made.append((w,os.path.getsize(dst)))
    # tiny blurred LQIP for progressive loading
    lq=im.resize((24,max(1,round(h0*24/w0))),Image.LANCZOS)
    lq.save(f'{OUT}/{slug}-lqip.webp','WEBP',quality=40,method=6)
    rows.append({'slug':slug,'orig':[w0,h0],'widths':[m[0] for m in made]})
    print(f'{slug:22} {w0}x{h0:5} -> ' + ', '.join(f'{m[0]}px/{m[1]//1024}KB' for m in made))
json.dump(rows,open(f'{OUT}/manifest.json','w'),indent=2)
print(f'\n{len(rows)} images optimized -> {OUT}/')
