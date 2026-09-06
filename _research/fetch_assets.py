import json,os,re,urllib.request,urllib.parse,sys
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'}
OUT='assets/stock'; os.makedirs(OUT,exist_ok=True)

# slug -> (search term, min width)
WANT=[
 ('hero-skyline-night','Dubai city at night skyline',3000),
 ('skyline-panorama','Dubai skyline panorama',3000),
 ('burj-khalifa','Burj Khalifa',2400),
 ('downtown-dubai','Downtown Dubai Burj Lake',2400),
 ('marina','Dubai Marina Skyline',2400),
 ('palm-jumeirah','Palm Jumeirah',2000),
 ('business-bay','Business Bay Dubai',2000),
 ('creek-harbour','Dubai Creek Harbour',1600),
 ('aerial-dubai','Dubai aerial view',2400),
 ('expo-city','Expo 2020 Dubai Al Wasl',2000),
 ('golf-dubai','Dubai golf course',1600),
 ('interior-luxury','luxury apartment interior living room',1600),
 ('penthouse-view','apartment balcony city view',1600),
 ('jumeirah-beach','Jumeirah Beach Residence',2000),
]
def search(term,size='large',source='wikimedia',n=20):
    p={'q':term,'page_size':n,'source':source,'size':size,'mature':'false'}
    u='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode(p)
    try:
        with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40) as r:
            return json.load(r).get('results',[])
    except Exception as e:
        print('   search err:',e); return []

manifest=[]
for slug,term,minw in WANT:
    res=search(term)
    if not res: res=search(term,size='medium')
    cand=[r for r in res if (r.get('width') or 0)>=minw and (r.get('filetype') or 'jpg') in ('jpg','jpeg','png')]
    cand.sort(key=lambda r:-(r['width']*r['height']))
    got=False
    for r in cand[:3]:
        ext='jpg' if (r.get('filetype') or 'jpg') in ('jpg','jpeg') else 'png'
        path=f'{OUT}/{slug}.{ext}'
        try:
            req=urllib.request.Request(r['url'],headers=UA)
            with urllib.request.urlopen(req,timeout=90) as resp, open(path,'wb') as f:
                data=resp.read()
                if len(data)<60000: raise ValueError('too small %d'%len(data))
                f.write(data)
            manifest.append({'slug':slug,'file':path,'w':r['width'],'h':r['height'],
                'title':r.get('title'),'creator':r.get('creator'),'license':r.get('license'),
                'license_version':r.get('license_version'),'license_url':r.get('license_url'),
                'source_page':r.get('foreign_landing_url'),'attribution':r.get('attribution')})
            print(f'OK  {slug:20} {r["width"]}x{r["height"]:5} {len(data)//1024:6}KB  {r["license"]}')
            got=True; break
        except Exception as e:
            print(f'    retry {slug}: {e}')
            if os.path.exists(path): os.remove(path)
    if not got: print(f'MISS {slug:20} ({term})')

json.dump(manifest,open('assets/stock/CREDITS.json','w',encoding='utf-8'),indent=2,ensure_ascii=False)
print(f'\n{len(manifest)}/{len(WANT)} downloaded')
