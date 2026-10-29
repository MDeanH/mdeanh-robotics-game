import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TwinModel } from '../dist/vendor/luka-kinematics.js';

// Asset/source consistency and FK math only. These tests do not validate Luka's
// physical dimensions, joint limits, motion, hardware fit, or actual capability.
const assetRoot = new URL('../dist/assets/luka/', import.meta.url);
const [model, mesh, binary] = await Promise.all([
  readFile(new URL('luka.model.json', assetRoot), 'utf8').then(JSON.parse),
  readFile(new URL('luka.mesh.json', assetRoot), 'utf8').then(JSON.parse),
  readFile(new URL('luka.mesh.bin', assetRoot)),
]);

const finiteArray = (values, length, message) => {
  assert.equal(values.length, length, `${message}: length`);
  assert.ok(Array.from(values).every(Number.isFinite), `${message}: finite values`);
};

test('Luka visual buffer matches its declared interleaved position-normal format', () => {
  assert.equal(mesh.vertexStride, 6, 'the renderer expects three position and three normal floats');
  assert.ok(Number.isInteger(mesh.vertexCount) && mesh.vertexCount > 0);
  assert.equal(binary.byteLength, mesh.vertexCount * mesh.vertexStride * Float32Array.BYTES_PER_ELEMENT);
  assert.equal(binary.byteOffset % Float32Array.BYTES_PER_ELEMENT, 0);
  const values = new Float32Array(binary.buffer, binary.byteOffset, binary.byteLength / Float32Array.BYTES_PER_ELEMENT);
  let firstNonFinite = -1;
  for (let i = 0; i < values.length; i++) if (!Number.isFinite(values[i])) { firstNonFinite = i; break; }
  assert.equal(firstNonFinite, -1, 'all positions and normals must be finite to draw');
  assert.equal(model.meta.counts.vertices, mesh.vertexCount);
  assert.match(model.meta.provenance.status, /ESTIMATED/i, 'the asset must retain its estimated visual provenance');
});

test('Luka mesh ranges cover the buffer exactly and map to unique model drawables', () => {
  const drawables = model.links.filter(link => link.drawableIndex !== null);
  const linkByName = new Map(model.links.map(link => [link.name, link]));
  assert.equal(linkByName.size, model.links.length, 'link names must be unique');
  assert.equal(mesh.linkCount, mesh.ranges.length);
  assert.equal(drawables.length, mesh.ranges.length);
  assert.equal(new Set(mesh.ranges.map(range => range.link)).size, mesh.ranges.length);
  assert.deepEqual(drawables.map(link => link.drawableIndex).sort((a, b) => a - b), Array.from({ length: drawables.length }, (_, i) => i));

  let cursor = 0, triangleCount = 0;
  for (const [rangeIndex, range] of mesh.ranges.entries()) {
    assert.ok(linkByName.has(range.link), `${range.link}: missing model link`);
    assert.ok(Number.isInteger(range.first) && Number.isInteger(range.count) && range.count > 0);
    assert.equal(range.first, cursor, `${range.link}: ranges must have no gap or overlap`);
    assert.equal(range.count % 3, 0, `${range.link}: complete triangles`);
    assert.equal(range.tris, range.count / 3);
    const link = linkByName.get(range.link);
    assert.notEqual(link.drawableIndex, null, `${range.link}: drawable index`);
    assert.equal(link.drawableIndex, rangeIndex, `${range.link}: mesh order must match drawable matrix order`);
    assert.deepEqual(link.vertexRange, { first: range.first, count: range.count });
    finiteArray(link.aabb.min, 3, `${range.link} minimum bounds`);
    finiteArray(link.aabb.max, 3, `${range.link} maximum bounds`);
    for (let axis = 0; axis < 3; axis++) assert.ok(link.aabb.min[axis] <= link.aabb.max[axis]);
    cursor += range.count;
    triangleCount += range.tris;
  }
  assert.equal(cursor, mesh.vertexCount);
  assert.equal(triangleCount, model.meta.counts.triangles);
});

test('Luka joint tree has one root and no missing, duplicate-parent, or orphan links', () => {
  assert.equal(model.meta.counts.links, model.links.length);
  assert.equal(model.meta.counts.joints, model.joints.length);
  const linkNames = new Set(model.links.map(link => link.name));
  const jointNames = new Set(), children = new Set();
  for (const joint of model.joints) {
    assert.ok(!jointNames.has(joint.name), `${joint.name}: duplicate joint`);
    jointNames.add(joint.name);
    assert.ok(linkNames.has(joint.parent), `${joint.name}: missing parent ${joint.parent}`);
    assert.ok(linkNames.has(joint.child), `${joint.name}: missing child ${joint.child}`);
    assert.ok(!children.has(joint.child), `${joint.child}: more than one parent`);
    children.add(joint.child);
    finiteArray(joint.origin, 16, `${joint.name} origin`);
    if (joint.movable) finiteArray(joint.axis, 3, `${joint.name} axis`);
  }
  assert.deepEqual([...linkNames].filter(link => !children.has(link)), ['base_link']);
  const twin = new TwinModel(model);
  const reached = new Set(['base_link']);
  for (const joint of twin.jointOrder) {
    assert.ok(reached.has(joint.parent), `${joint.name}: parent must be reached first`);
    reached.add(joint.child);
  }
  assert.equal(reached.size, model.links.length);
  assert.equal(twin.jointOrder.length, model.joints.length);
  assert.equal(twin.movable.length, model.meta.counts.movableJoints);
});

test('Luka zero pose and bounded pose produce finite drawable matrices in mesh order', () => {
  const twin = new TwinModel(model);
  const zeroPose = twin.zeroPose();
  assert.equal(Object.keys(zeroPose).length, twin.movable.length);
  assert.ok(Object.values(zeroPose).every(value => value === 0));
  for (const [pose, root] of [
    [zeroPose, { x: 0, y: 0, z: 0, yaw: 0 }],
    [twin.clampPose(Object.fromEntries(twin.movable.map(joint => [joint.name, 0.25]))), { x: 0.2, y: 0.1, z: -0.3, yaw: Math.PI / 3 }],
  ]) {
    const result = twin.forward(pose, root);
    assert.equal(result.matrices.size, model.links.length);
    finiteArray(result.flat, mesh.ranges.length * 16, 'drawable matrix buffer');
    for (const link of model.links) {
      const matrix = result.matrices.get(link.name);
      finiteArray(matrix, 16, `${link.name} transform`);
      assert.equal(matrix[15], 1, `${link.name}: homogeneous transform`);
      if (link.drawableIndex !== null) assert.deepEqual(Array.from(result.flat.subarray(link.drawableIndex * 16, (link.drawableIndex + 1) * 16)), Array.from(matrix));
    }
  }
});
