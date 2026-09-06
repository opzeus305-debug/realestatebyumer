import os,sys,io,urllib.request,concurrent.futures as cf
from PIL import Image, ImageDraw
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'}
CATS={
 'city':"1512453979798-5ea266f8880c 1518684079-3c830dcef090 1580674684081-7617fbf3d745 1546412414-e1885259563a 1634007626524-f47fa37810a7 1459787915554-b34915863013 1651467606797-e1c660cf3fda 1528702748617-c64d49f918af 1543579596-2c11997c7706 1607414851776-f2fcc379fb48 1546412414-8035e1776c9a 1526495124232-a04e1849168c",
 'night':"1550779864-6ccb28702fdb 1623638498061-2fcab5587cb0 1621073831231-faa453d28112 1628226391692-86781bc11f45 1617559057121-5ccad3b7571b 1577908884587-a89c28d6c1af 1612034649994-c4eb7a1209e5 1620242383083-b8db5453b97e 1647845590515-fa57cf7a9324 1682410601760-6372fd33ad2b 1721801783842-7133fbf11509 1642137470505-c2f85c227ab8",
 'interior':"1565623833408-d77e39b88af6 1503174971373-b1f69850bded 1680416124510-5eae1beca412 1702411200201-3061d0eea802 1643376452350-97eadd2c417f 1677553512940-f79af72efd1b 1564078516393-cf04bd966897 1628744876497-eb30460be9f6 1663811397207-418a92396ad5 1592401526914-7e5d94a8d6fa 1667584523543-d1d9cc828a15 1705326701287-346fc37a2c86",
 'arch':"1493397212122-2b85dda8106b 1483366774565-c783b9f70e2c 1527576539890-dfa815648363 1622396481322-3b83d186701b 1486718448742-163732cd1544 1601570682455-bdd0b87f0cfa 1518893228544-d6c4eee24344 1548248823-ce16a73b6d49 1460574283810-2aab119d8511 1632667680404-572c57873c21 1522743791393-522312deeebf 1543067361-9bf996edf6ff",
}
CW,CH=440,300
def grab(pid):
    url=f'https://images.unsplash.com/photo-{pid}?w=600&q=70&fm=jpg&fit=crop'
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=45) as r:
            return pid, Image.open(io.BytesIO(r.read())).convert('RGB')
    except Exception as e:
        return pid, None
os.makedirs('_research/tmp/sheets',exist_ok=True)
for cat,ids in CATS.items():
    ids=ids.split()
    sheet=Image.new('RGB',(CW*4,CH*3),(12,14,24)); d=ImageDraw.Draw(sheet)
    with cf.ThreadPoolExecutor(12) as ex: res=dict(ex.map(grab,ids))
    ok=0
    for i,pid in enumerate(ids[:12]):
        im=res.get(pid)
        x,y=(i%4)*CW,(i//4)*CH
        if im is None:
            d.text((x+12,y+12),f'{i+1}. FAILED',fill=(200,80,80)); continue
        im=im.copy(); im.thumbnail((CW-8,CH-30),Image.LANCZOS)
        sheet.paste(im,(x+4,y+26)); ok+=1
        d.text((x+8,y+8),f'{i+1}. {pid[:22]}',fill=(230,200,150))
    sheet.save(f'_research/tmp/sheets/{cat}.jpg',quality=80)
    print(f'{cat:9} {ok}/12 ok -> _research/tmp/sheets/{cat}.jpg')
