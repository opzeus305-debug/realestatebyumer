import os,json,urllib.request,concurrent.futures as cf
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'}
OUT='assets/stock'; os.makedirs(OUT,exist_ok=True)
PICKS=[
 # slug, unsplash id, target width
 ('hero-night-skyline','1623638498061-2fcab5587cb0',3000),
 ('downtown-night','1628226391692-86781bc11f45',3000),
 ('skyline-dark','1620242383083-b8db5453b97e',2560),
 ('skyline-teal','1617559057121-5ccad3b7571b',2560),
 ('burj-portrait','1634007626524-f47fa37810a7',1800),
 ('storm-downtown','1651467606797-e1c660cf3fda',2560),
 ('burj-minimal-dusk','1607414851776-f2fcc379fb48',2560),
 ('palm-aerial','1682410601760-6372fd33ad2b',2560),
 ('marina-aerial','1459787915554-b34915863013',1800),
 ('marina-moody','1642137470505-c2f85c227ab8',1800),
 ('burj-al-arab','1518684079-3c830dcef090',1800),
 ('dusk-wide','1550779864-6ccb28702fdb',3000),
 ('int-penthouse-dusk','1565623833408-d77e39b88af6',2560),
 ('int-bedroom-dark','1702411200201-3061d0eea802',2560),
 ('int-living-warm','1680416124510-5eae1beca412',2560),
 ('int-bedroom-moody','1663811397207-418a92396ad5',1800),
 ('int-living-soft','1667584523543-d1d9cc828a15',2560),
 ('fac-spiral-bronze','1548248823-ce16a73b6d49',1800),
 ('fac-circular-bw','1527576539890-dfa815648363',1800),
 ('fac-navy-minimal','1601570682455-bdd0b87f0cfa',1800),
 ('fac-lattice','1493397212122-2b85dda8106b',2560),
]
def get(t):
    slug,pid,w=t
    url=f'https://images.unsplash.com/photo-{pid}?w={w}&q=85&fm=jpg&fit=max'
    dst=f'{OUT}/{slug}.jpg'
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=120) as r:
                d=r.read()
            if len(d)<80000: raise ValueError(f'too small {len(d)}')
            open(dst,'wb').write(d)
            return f'OK   {slug:20} {len(d)//1024:5}KB'
        except Exception as e:
            if attempt==2: return f'FAIL {slug:20} {e}'
with cf.ThreadPoolExecutor(6) as ex:
    for line in ex.map(get,PICKS): print(line)
json.dump([{'slug':s,'unsplash_id':f'photo-{p}','source':f'https://unsplash.com/photos/{p}',
            'license':'Unsplash License - free for commercial use, no attribution required'}
           for s,p,_ in PICKS], open(f'{OUT}/CREDITS.json','w'), indent=2)
