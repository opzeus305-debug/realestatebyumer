"""Build the mobile LOD from the attributed source, preserving its transforms.

Requires numpy and fast-simplification. Output has two draw calls, no runtime
decoder dependency, and the same glass / aluminium material names as the source.
Run from the repository root: python _research/build_mobile_model.py
"""
import gzip
import json
import struct
from pathlib import Path

import fast_simplification
import numpy as np

source = Path('assets/burj.opt.glb').read_bytes()
json_size = struct.unpack_from('<I', source, 12)[0]
doc = json.loads(source[20:20 + json_size])
binary = source[28 + json_size:]
dtypes = {5123: np.uint16, 5125: np.uint32, 5126: np.float32}
widths = {'SCALAR': 1, 'VEC3': 3}
groups = {i: [[], [], 0] for i in range(len(doc['materials']))}


def read(index):
    a = doc['accessors'][index]
    bv = doc['bufferViews'][a['bufferView']]
    offset = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    assert not bv.get('byteStride'), 'Source must have packed attributes'
    return np.frombuffer(binary, dtype=dtypes[a['componentType']],
                         count=a['count'] * widths[a['type']], offset=offset)


def visit(index, parent):
    node = doc['nodes'][index]
    if 'matrix' in node:
        local = np.array(node['matrix']).reshape(4, 4).T
    else:
        x, y, z, w = node.get('rotation', [0, 0, 0, 1])
        local = np.eye(4)
        local[:3, :3] = np.array([
            [1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
            [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
            [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)],
        ]) @ np.diag(node.get('scale', [1, 1, 1]))
        local[:3, 3] = node.get('translation', [0, 0, 0])
    world = parent @ local
    if 'mesh' in node:
        for primitive in doc['meshes'][node['mesh']]['primitives']:
            vertices = read(primitive['attributes']['POSITION']).reshape(-1, 3)
            vertices = (world @ np.column_stack([vertices, np.ones(len(vertices))]).T).T[:, :3]
            faces = read(primitive['indices']).reshape(-1, 3).astype(np.int32)
            if np.linalg.det(world[:3, :3]) < 0:
                faces = faces[:, ::-1]
            group = groups[primitive.get('material', 0)]
            group[0].append(vertices)
            group[1].append(faces + group[2])
            group[2] += len(vertices)
    for child in node.get('children', []):
        visit(child, world)


for node in doc['scenes'][doc.get('scene', 0)]['nodes']:
    visit(node, np.eye(4))

out = bytearray()
accessors, views, primitives = [], [], []


def accessor(values, kind, component, target):
    while len(out) % 4:
        out.append(0)
    start = len(out)
    out.extend(values.tobytes())
    views.append({'buffer': 0, 'byteOffset': start, 'byteLength': len(out)-start, 'target': target})
    item = {'bufferView': len(views)-1, 'componentType': component, 'count': len(values), 'type': kind}
    if kind == 'VEC3':
        item.update(min=values.min(axis=0).tolist(), max=values.max(axis=0).tolist())
    accessors.append(item)
    return len(accessors)-1


for material, (point_parts, face_parts, _) in groups.items():
    points = np.concatenate(point_parts)
    faces = np.concatenate(face_parts)
    original_bounds = np.array([points.min(0), points.max(0)])
    # Weld split vertices before simplification, so coplanar facade panels collapse.
    points, mapping = np.unique(points.round(7), axis=0, return_inverse=True)
    faces = mapping[faces].astype(np.int32)
    original_count = len(faces)
    points, faces = fast_simplification.simplify(points, faces, target_reduction=.92, agg=5)
    # The silhouette must retain the crown and all three wings of the building.
    assert np.all(np.abs(np.array([points.min(0), points.max(0)]) - original_bounds)
                  < np.ptp(original_bounds, axis=0).max() * .012)
    normals = np.zeros_like(points)
    vectors = np.cross(points[faces[:, 1]]-points[faces[:, 0]], points[faces[:, 2]]-points[faces[:, 0]])
    for i in range(3):
        np.add.at(normals, faces[:, i], vectors)
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    positions = accessor(points.astype(np.float32), 'VEC3', 5126, 34962)
    normal = accessor(normals.astype(np.float32), 'VEC3', 5126, 34962)
    dtype, component = (np.uint16, 5123) if len(points) < 65536 else (np.uint32, 5125)
    indices = accessor(faces.flatten().astype(dtype), 'SCALAR', component, 34963)
    primitives.append({'attributes': {'POSITION': positions, 'NORMAL': normal}, 'indices': indices, 'material': material})
    print(f"{doc['materials'][material]['name']}: {original_count:,} -> {len(faces):,} triangles")

result = {'asset': {**doc['asset'], 'generator': 'Mobile LOD: fast-simplification; original by SDC PERFORMANCE, CC BY 4.0'},
          'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
          'meshes': [{'primitives': primitives}], 'materials': doc['materials'],
          'accessors': accessors, 'bufferViews': views, 'buffers': [{'byteLength': len(out)}]}
encoded = json.dumps(result, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
out.extend(b'\0' * (-len(out) % 4))
glb = struct.pack('<III', 0x46546c67, 2, 28 + len(encoded) + len(out))
glb += struct.pack('<II', len(encoded), 0x4e4f534a) + encoded
glb += struct.pack('<II', len(out), 0x004e4942) + out
Path('assets/burj.mobile.glb').write_bytes(glb)
compressed = gzip.compress(glb, compresslevel=9, mtime=0)
Path('assets/burj.mobile.glb.gz').write_bytes(compressed)
print(f'Mobile: {len(glb):,} bytes; gzip {len(compressed):,} bytes')
