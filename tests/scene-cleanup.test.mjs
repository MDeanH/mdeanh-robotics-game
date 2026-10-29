import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import { disposeRenderedScene } from '../dist/scene3d.js';

test('nested workshop instances release their buffers before shared resources and renderer cleanup', () => {
  const scene = new THREE.Scene(), group = new THREE.Group(), order = [];
  const geometry = new THREE.BoxGeometry(1, 1, 1), material = new THREE.MeshBasicMaterial();
  for (const name of ['leaves', 'tools']) {
    const mesh = new THREE.InstancedMesh(geometry, material, 2);
    mesh.setColorAt(0, new THREE.Color(0x668844));
    // Three's WebGLObjects releases instanceMatrix and instanceColor on this event.
    mesh.addEventListener('dispose', () => order.push(name));
    group.add(mesh);
  }
  group.add(new THREE.Mesh(geometry, material)); scene.add(group);
  geometry.addEventListener('dispose', () => order.push('geometry'));
  material.addEventListener('dispose', () => order.push('material'));
  disposeRenderedScene(scene, { dispose() { geometry.dispose(); material.dispose(); } }, { dispose() { order.push('renderer'); } });
  assert.deepEqual(order, ['leaves', 'tools', 'geometry', 'material', 'renderer']);
  assert.equal(scene.children.length, 0);
});
