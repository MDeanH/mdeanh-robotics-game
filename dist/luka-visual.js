import * as THREE from './vendor/three.module.js';
import { TwinModel } from './vendor/luka-kinematics.js';

// Public estimated A2 geometry derived from the MDeanH model repository.
// Neutral-gray styling follows the user’s Luka A2 app; no private body assets,
// measurements, device controls, or hardware validation are imported here.
let assetPromise;
const assets = () => {
  if (!assetPromise) assetPromise = Promise.all([
    fetch(new URL('./assets/luka/luka.model.json', import.meta.url)).then(response => { if (!response.ok) throw new Error('Luka model unavailable'); return response.json(); }),
    fetch(new URL('./assets/luka/luka.mesh.json', import.meta.url)).then(response => { if (!response.ok) throw new Error('Luka mesh index unavailable'); return response.json(); }),
    fetch(new URL('./assets/luka/luka.mesh.bin', import.meta.url)).then(response => { if (!response.ok) throw new Error('Luka visual mesh unavailable'); return response.arrayBuffer(); }),
  ]).catch(error => { assetPromise = null; throw error; });
  return assetPromise;
};

function category(name) {
  if (name.includes('head')) return 'head';
  if (name.includes('hand')) return 'hands';
  if (name.startsWith('left_arm') || name.startsWith('left_wrist')) return 'leftArm';
  if (name.startsWith('right_arm') || name.startsWith('right_wrist')) return 'rightArm';
  if (name.startsWith('left_')) return 'leftLeg';
  if (name.startsWith('right_')) return 'rightLeg';
  return 'body';
}

export async function loadLukaVisual(kit, { signal } = {}) {
  const [json, index, buffer] = await assets();
  if (signal?.aborted) throw new DOMException('Preview was closed', 'AbortError');
  if (index.vertexStride !== 6 || buffer.byteLength / 24 !== index.vertexCount) throw new Error('Unexpected Luka visual format');
  const values = new Float32Array(buffer), interleaved = new THREE.InterleavedBuffer(values, 6);
  const model = new TwinModel(json); model.forward(model.zeroPose());
  const root = new THREE.Group(), orientation = new THREE.Group(), normalized = new THREE.Group();
  orientation.rotation.y = Math.PI / 2; root.add(orientation); orientation.add(normalized);
  const colors = { body: 0xc8cdd3, head: 0xc8cdd3, leftArm: 0xc8cdd3, rightArm: 0xc8cdd3, hands: 0xc8cdd3, leftLeg: 0xc8cdd3, rightLeg: 0xc8cdd3 };
  const blueHighlight = new THREE.Color(0x88aaff);
  const materials = Object.fromEntries(Object.entries(colors).map(([name, color]) => [name, kit.material(new THREE.MeshStandardMaterial({ color, roughness: .6, metalness: .1, side: THREE.DoubleSide, flatShading: true }))]));
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const range of index.ranges) {
    const matrix = model.matrices.get(range.link);
    if (!matrix || range.first < 0 || range.count < 1 || range.first + range.count > index.vertexCount) throw new Error('Incomplete Luka link geometry');
    const geometry = kit.geometry(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleaved, 3, 0));
    geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(interleaved, 3, 3));
    geometry.setDrawRange(range.first, range.count);
    const localMin = [Infinity, Infinity, Infinity], localMax = [-Infinity, -Infinity, -Infinity];
    for (let vertex = range.first; vertex < range.first + range.count; vertex++) {
      const at = vertex * 6, x = values[at], y = values[at + 1], z = values[at + 2];
      const p = [matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12], matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13], matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]];
      const local = [x, y, z];
      for (let axis = 0; axis < 3; axis++) { localMin[axis] = Math.min(localMin[axis], local[axis]); localMax[axis] = Math.max(localMax[axis], local[axis]); min[axis] = Math.min(min[axis], p[axis]); max[axis] = Math.max(max[axis], p[axis]); }
    }
    geometry.boundingBox = new THREE.Box3(new THREE.Vector3(...localMin), new THREE.Vector3(...localMax));
    geometry.boundingSphere = geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
    const part = category(range.link), mesh = new THREE.Mesh(geometry, materials[part]);
    mesh.name = range.link; mesh.matrixAutoUpdate = false; mesh.matrix.fromArray(matrix);
    mesh.castShadow = true; mesh.receiveShadow = true; normalized.add(mesh);
  }
  normalized.position.set(-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2);
  const height = max[1] - min[1];
  root.scale.setScalar(218 / height);
  root.name = 'Luka estimated A2 visual';
  root.userData = { status: 'estimated visual model, not hardware verified', source: 'https://github.com/MDeanH/luka-a2-ultra-model', styleReference: 'https://luka-a2.netlify.app', linkCount: index.ranges.length };
  return {
    group: root,
    highlight(part) {
      const selected = part === 'sensors' ? ['head'] : part === 'motors' ? ['leftArm', 'rightArm', 'leftLeg', 'rightLeg'] : ['body'];
      for (const [name, material] of Object.entries(materials)) {
        const active = selected.includes(name);
        material.color.setHex(0xc8cdd3); if (active) material.color.lerp(blueHighlight, .12);
        material.emissive.setHex(active ? 0x355f9c : 0x000000); material.emissiveIntensity = active ? .14 : 0;
      }
    },
  };
}
