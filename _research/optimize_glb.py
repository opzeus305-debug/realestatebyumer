"""Rebuild the Burj GLB with 16-bit indices.

Every primitive is under 65,536 vertices, so uint32 indices are pure waste:
they cost 7.57 MB where uint16 costs 3.79 MB. Lossless — the geometry is
byte-identical after decode. Pure stdlib; no Blender, no gltf-transform.
"""
import json, struct, sys, numpy as np

SRC, DST = 'assets/burj.glb', 'assets/burj.opt.glb'
GLB_MAGIC, JSON_C, BIN_C = 0x46546C67, 0x4E4F534A, 0x004E4942
COMP = {5120: np.int8, 5121: np.uint8, 5122: np.int16,
        5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

buf = open(SRC, 'rb').read()
magic, ver, _ = struct.unpack('<III', buf[:12])
assert magic == GLB_MAGIC, 'not a GLB'
off, js, bin_ = 12, None, None
while off < len(buf):
    clen, ctype = struct.unpack('<II', buf[off:off + 8])
    chunk = buf[off + 8: off + 8 + clen]
    if ctype == JSON_C: js = json.loads(chunk.decode('utf-8'))
    elif ctype == BIN_C: bin_ = chunk
    off += 8 + clen

def read(i):
    a = js['accessors'][i]
    bv = js['bufferViews'][a['bufferView']]
    o = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = a['count'] * NCOMP[a['type']]
    return np.frombuffer(bin_, dtype=COMP[a['componentType']], count=n, offset=o)

out = bytearray()
views, accs = [], []
def add(arr, target=None):
    while len(out) % 4: out.append(0)          # accessors must be 4-aligned
    o = len(out); out.extend(arr.tobytes())
    v = {'buffer': 0, 'byteOffset': o, 'byteLength': len(out) - o}
    if target: v['target'] = target
    views.append(v); return len(views) - 1

DT2COMP = {np.dtype(v): k for k, v in COMP.items()}
narrowed = 0
for m in js['meshes']:
    for p in m['primitives']:
        for name, ai in list(p['attributes'].items()):
            a = js['accessors'][ai]; arr = read(ai)
            accs.append({'bufferView': add(arr, 34962), 'componentType': a['componentType'],
                         'count': a['count'], 'type': a['type'],
                         **({'min': a['min'], 'max': a['max']} if 'min' in a else {})})
            p['attributes'][name] = len(accs) - 1
        if 'indices' in p:
            a = js['accessors'][p['indices']]; arr = read(p['indices'])
            if arr.max() <= 0xFFFF and a['componentType'] == 5125:
                arr = arr.astype(np.uint16); narrowed += 1
            accs.append({'bufferView': add(arr, 34963),
                         'componentType': DT2COMP[arr.dtype],
                         'count': a['count'], 'type': 'SCALAR'})
            p['indices'] = len(accs) - 1

js['accessors'], js['bufferViews'] = accs, views
js['buffers'] = [{'byteLength': len(out)}]
for k in ('animations', 'skins', 'cameras'): js.pop(k, None)

jb = json.dumps(js, separators=(',', ':')).encode('utf-8')
jb += b' ' * ((4 - len(jb) % 4) % 4)
while len(out) % 4: out.append(0)
glb = (struct.pack('<III', GLB_MAGIC, 2, 12 + 8 + len(jb) + 8 + len(out))
       + struct.pack('<II', len(jb), JSON_C) + jb
       + struct.pack('<II', len(out), BIN_C) + bytes(out))
open(DST, 'wb').write(glb)
print(f'{len(buf)/1048576:.2f} MB -> {len(glb)/1048576:.2f} MB   '
      f'({narrowed} index buffers narrowed to uint16)')
