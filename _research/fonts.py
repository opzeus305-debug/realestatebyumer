import os,re,urllib.request
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'}
OUT='assets/fonts'; os.makedirs(OUT,exist_ok=True)
SPECS=[('Fraunces','Fraunces:opsz,wght@9..144,100..900','fraunces-var'),
       ('Fraunces','Fraunces:ital,opsz,wght@1,9..144,100..900','fraunces-var-italic'),
       ('Jost','Jost:wght@100..900','jost-var'),
       ('DM Mono','DM+Mono:wght@300;400;500','dmmono')]
KEEP={'latin','latin-ext'}
css_out=[]
def fetch(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()
for fam,spec,base in SPECS:
    css=fetch(f'https://fonts.googleapis.com/css2?family={spec}&display=swap').decode()
    # split into subset-labelled @font-face blocks
    blocks=re.findall(r'/\*\s*([\w\-\[\]]+)\s*\*/\s*(@font-face\s*\{.*?\})',css,re.S)
    n=0
    for subset,block in blocks:
        if subset not in KEEP: continue
        m=re.search(r'url\((https://[^)]+\.woff2)\)',block)
        if not m: continue
        fn=f'{base}-{subset}.woff2'; path=f'{OUT}/{fn}'
        try:
            data=fetch(m.group(1))
            open(path,'wb').write(data)
        except Exception as e:
            print(' fail',fn,e); continue
        blk=block.replace(m.group(1),f'../fonts/{fn}')
        blk=re.sub(r'font-family:\s*[\'"][^\'"]+[\'"]',f"font-family:'{fam}'",blk)
        css_out.append(f'/* {fam} · {subset} */\n{blk}')
        n+=1; print(f'OK  {fn:34} {len(data)//1024:4}KB')
    if not n: print(f'MISS {base}')
open(f'{OUT}/fonts.css','w',encoding='utf-8').write('\n\n'.join(css_out)+'\n')
tot=sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT) if f.endswith('.woff2'))
print(f'\ntotal woff2: {tot//1024} KB  ->  {OUT}/fonts.css')
