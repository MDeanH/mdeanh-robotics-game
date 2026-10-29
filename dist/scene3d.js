import * as THREE from './vendor/three.module.js';
import { ARENA, BENCHES, objectiveComplete } from './arcade-model.js';
import { loadLukaVisual } from './luka-visual.js';

const PALETTE = {
  ink: 0x162638, navy: 0x263c51, floor: 0x111b28, edge: 0x34465a,
  white: 0xc8cdd3, steel: 0x8196a7, teal: 0x68a1ff, blue: 0x779ef4,
  gold: 0xf6b14c, red: 0xef7665,
};
const world = (x, y, height = 0) => new THREE.Vector3(x - ARENA.width / 2, height, y - ARENA.height / 2);

function createKit() {
  const geometries = new Set(), materials = new Set(), textures = new Set(), cache = new Map();
  const geometry = value => (geometries.add(value), value);
  const material = value => (materials.add(value), value);
  const texture = value => (textures.add(value), value);
  const standard = (color, roughness = .48, metalness = .08) => {
    const key = `${color}:${roughness}:${metalness}`;
    if (!cache.has(key)) cache.set(key, material(new THREE.MeshStandardMaterial({ color, roughness, metalness })));
    return cache.get(key);
  };
  const glow = (color, intensity = .75) => material(new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: .32, metalness: .12 }));
  const basic = (color, opacity = 1) => material(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1 }));
  function mesh(geo, mat, parent, x = 0, y = 0, z = 0, shadows = true) {
    const object = new THREE.Mesh(geo, mat); object.position.set(x, y, z);
    object.castShadow = shadows; object.receiveShadow = shadows; parent?.add(object); return object;
  }
  function box(w, h, d, radius, mat, parent, x = 0, y = 0, z = 0) {
    const r = Math.min(radius, w / 2, d / 2);
    const shape = new THREE.Shape(), left = -w / 2, top = -d / 2;
    shape.moveTo(left + r, top); shape.lineTo(left + w - r, top);
    shape.quadraticCurveTo(left + w, top, left + w, top + r);
    shape.lineTo(left + w, top + d - r); shape.quadraticCurveTo(left + w, top + d, left + w - r, top + d);
    shape.lineTo(left + r, top + d); shape.quadraticCurveTo(left, top + d, left, top + d - r);
    shape.lineTo(left, top + r); shape.quadraticCurveTo(left, top, left + r, top);
    const geo = geometry(new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 6, steps: 1 }));
    geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2, 0);
    return mesh(geo, mat, parent, x, y, z);
  }
  function ring(radius, thickness, mat, parent, x = 0, y = 1, z = 0) {
    const object = mesh(geometry(new THREE.TorusGeometry(radius, thickness, 8, 64)), mat, parent, x, y, z, false);
    object.rotation.x = -Math.PI / 2; return object;
  }
  function disk(radius, mat, parent, x = 0, y = .5, z = 0) {
    const object = mesh(geometry(new THREE.CircleGeometry(radius, 64)), mat, parent, x, y, z, false);
    object.rotation.x = -Math.PI / 2; return object;
  }
  function label(text, color = '#eafdf9', background = '#1c4c5b', width = 92, height = 30) {
    const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 128;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, 384, 128);
    if (background) { context.fillStyle = background; context.beginPath(); context.roundRect(3, 3, 378, 122, 36); context.fill(); }
    context.fillStyle = color; context.font = '600 49px system-ui, sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(text, 192, 65);
    const map = texture(new THREE.CanvasTexture(canvas)); map.colorSpace = THREE.SRGBColorSpace;
    const object = new THREE.Sprite(material(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false })));
    object.scale.set(width, height, 1); object.renderOrder = 10; return object;
  }
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d');
  const gradient = shadowContext.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(14,31,46,.4)'); gradient.addColorStop(1, 'rgba(14,31,46,0)');
  shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = texture(new THREE.CanvasTexture(shadowCanvas));
  function contact(parent, w = 66, d = 55) {
    const object = mesh(geometry(new THREE.PlaneGeometry(w, d)), material(new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })), parent, 0, .22, 0, false);
    object.rotation.x = -Math.PI / 2; return object;
  }
  return { geometry, material, texture, standard, glow, basic, mesh, box, ring, disk, label, contact,
    dispose() { textures.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); geometries.forEach(value => value.dispose()); } };
}

function rendererBase(canvas, { preview = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: preview, powerPreference: 'default' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.13;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(preview ? 0x0b0d10 : 0x0a111a);
  const camera = new THREE.OrthographicCamera(-520, 520, 292.5, -292.5, 1, 2200);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a1d22, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(250, 500, 375); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -650; key.shadow.camera.right = 650;
  key.shadow.camera.top = 500; key.shadow.camera.bottom = -500; key.shadow.camera.near = 1; key.shadow.camera.far = 1500;
  key.shadow.normalBias = 1.3; key.shadow.bias = -.00015; key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.DirectionalLight(0x8aaeff, .4); fill.position.set(420, 250, 400); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x88aaff, .9); rim.position.set(-375, 250, -250); scene.add(rim);
  let lastWidth = 0, lastHeight = 0;
  function resize() {
    const width = Math.round(canvas.clientWidth || canvas.getBoundingClientRect().width || 960);
    const height = Math.round(canvas.clientHeight || canvas.getBoundingClientRect().height || 540);
    if (width < 1 || height < 1 || width === lastWidth && height === lastHeight) return;
    lastWidth = width; lastHeight = height;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    const viewHeight = preview ? Math.max(330, 285 / aspect) : Math.max(570, 1050 / aspect);
    camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2; camera.updateProjectionMatrix();
  }
  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null; observer?.observe(canvas);
  resize();
  return { renderer, scene, camera, resize, dispose() { observer?.disconnect(); renderer.renderLists.dispose(); renderer.dispose(); } };
}

function createRover(kit, { enemy = false } = {}) {
  const group = new THREE.Group(), body = new THREE.Group(); group.add(body);
  const white = kit.standard(enemy ? 0xf18776 : PALETTE.white, .36, .14);
  const dark = kit.standard(PALETTE.ink, .58, .1), tire = kit.standard(0x263341, .94, .01);
  const accent = kit.glow(enemy ? 0xffa05c : PALETTE.teal, .85);
  kit.contact(group, 62, 60);
  kit.box(32, 12, 38, 7, white, body, 0, 19, 0);
  kit.box(28, 5, 28, 5, dark, body, 0, 28, 0);
  kit.box(31, 14, 21, 6, white, body, 0, 39, -6);
  kit.box(25, 9, 2, .6, kit.standard(0x152b3b, .24, .35), body, 0, 40, -17.1);
  for (const x of [-6.6, 6.6]) {
    const eye = kit.mesh(kit.geometry(new THREE.SphereGeometry(3, 16, 10)), accent, body, x, 40.8, -18.4); eye.scale.set(1, .58, .34);
  }
  kit.box(10, 5, 7, 2, kit.standard(enemy ? 0xd85b4c : PALETTE.gold, .42, .16), body, 7.5, 28, 11);
  kit.box(9, 2, 12, 1.5, accent, body, -7, 26.5, 8);
  const wheels = [];
  for (const x of [-20, 20]) for (const z of [-11, 11]) {
    const wheel = kit.mesh(kit.geometry(new THREE.CylinderGeometry(9.5, 9.5, 6, 24)), tire, body, x, 10, z); wheel.rotation.z = Math.PI / 2; wheels.push(wheel);
    const hub = kit.mesh(kit.geometry(new THREE.CylinderGeometry(4.8, 4.8, 6.5, 20)), kit.standard(0xa7b9c7, .3, .65), body, x, 10, z); hub.rotation.z = Math.PI / 2;
  }
  kit.mesh(kit.geometry(new THREE.CylinderGeometry(1, 1, 10, 10)), kit.standard(PALETTE.steel, .3, .7), body, 0, 50, -1);
  kit.mesh(kit.geometry(new THREE.SphereGeometry(2.5, 16, 10)), accent, body, 0, 56, -1);
  const carrying = new THREE.Group(); body.add(carrying); carrying.position.set(0, 36, 12);
  kit.box(18, 9, 13, 3, kit.standard(0x138a80, .25, .2), carrying);
  kit.box(12, 2, 8, 2, kit.glow(0x8effcd, 1), carrying, 0, 5.5, 0); carrying.visible = false;
  const stun = kit.label('Ⅱ', '#b5ffec', '#2b5369', 24, 13); stun.position.set(0, 69, 0); body.add(stun); stun.visible = false;
  group.userData = { body, wheels, carrying, stun }; return group;
}

function createHumanoid(kit) {
  const group = new THREE.Group(), body = new THREE.Group(); group.add(body);
  const torso = kit.standard(0xc8cdd3, .6, .1), torsoPanel = kit.standard(0x66717d, .6, .1);
  const upperLimb = kit.standard(0xc8cdd3, .6, .1), lowerLimb = kit.standard(0xc0c7ce, .6, .1);
  const upperLeg = kit.standard(0xc8cdd3, .6, .1), lowerLeg = kit.standard(0xbac2ca, .6, .1);
  const handFinish = kit.standard(0xc1c7cd, .6, .1), joint = kit.standard(0x7b8996, .5, .35);
  const dark = kit.standard(0x26313e, .6, .1), blueGlow = kit.glow(0x88aaff, .2);
  kit.contact(group, 70, 55);
  // Torso, waist and neck are distinct articulated mechanical forms.
  kit.box(30, 30, 19, 7, torso, body, 0, 82, 0);
  kit.box(22, 17, 2, 4, torsoPanel, body, 0, 84, -10.3);
  kit.box(14, 1.6, 1.3, .5, blueGlow, body, 0, 89, -11.8);
  kit.box(9, 3, 1, .5, kit.standard(0x6e9caa, .4, .3), body, 0, 80, -11.8);
  kit.mesh(kit.geometry(new THREE.CylinderGeometry(7, 7, 5, 24)), dark, body, 0, 64.5, 0);
  kit.box(25, 13, 17, 5, dark, body, 0, 57, 0);
  kit.box(13, 5, 1.5, 1.5, torso, body, 0, 59, -9);
  kit.mesh(kit.geometry(new THREE.CylinderGeometry(4.6, 4.6, 7, 24)), joint, body, 0, 101, 0);
  kit.mesh(kit.geometry(new THREE.CylinderGeometry(6, 6, 2.2, 24)), dark, body, 0, 99, 0);
  kit.box(18, 17, 16, 5.5, torso, body, 0, 112, -.5);
  kit.box(13, 7, 1.6, 2, kit.standard(0x0c1d2b, .2, .38), body, 0, 113, -9.1);
  kit.box(8.6, 1.2, .7, .5, blueGlow, body, 0, 113.5, -10.1);
  kit.box(5.5, 2, 1, .4, kit.standard(0x93bdc0, .35, .32), body, 0, 107, -8.6);
  // Neutral-gray limbs retain distinct joints and a soft blue instrument accent.
  function arm(side, color) {
    const shoulder = new THREE.Group(); shoulder.position.set(side * 21, 92, 0); shoulder.rotation.z = -side * .1; body.add(shoulder);
    kit.mesh(kit.geometry(new THREE.SphereGeometry(6.3, 24, 16)), joint, shoulder);
    kit.box(10.5, 19.5, 11, 4.6, color, shoulder, 0, -10.5, 0);
    const elbow = new THREE.Group(); elbow.position.set(0, -22, 0); elbow.rotation.x = -.05; shoulder.add(elbow);
    const elbowJoint = kit.mesh(kit.geometry(new THREE.CylinderGeometry(5.7, 5.7, 11.5, 24)), joint, elbow); elbowJoint.rotation.z = Math.PI / 2;
    kit.box(9.4, 18, 10.3, 4, color, elbow, 0, -10.5, -.2);
    kit.mesh(kit.geometry(new THREE.CylinderGeometry(3.6, 3.6, 4, 20)), dark, elbow, 0, -21, -.2);
    const hand = new THREE.Group(); hand.position.set(0, -25.4, -.4); elbow.add(hand);
    kit.box(8.5, 8, 6.5, 2.4, handFinish, hand);
    for (const x of [-2.7, -.9, .9, 2.7]) kit.mesh(kit.geometry(new THREE.CapsuleGeometry(.72, 4.5, 4, 8)), handFinish, hand, x, -5.6, -.2);
    const thumb = kit.mesh(kit.geometry(new THREE.CapsuleGeometry(.9, 3.2, 4, 8)), handFinish, hand, side * 5.1, -1.5, -1); thumb.rotation.z = side * .35;
    return shoulder;
  }
  const leftShoulder = arm(1, upperLimb), rightShoulder = arm(-1, lowerLimb);
  function leg(side) {
    const hip = new THREE.Group(); hip.position.set(side * 8.1, 54.5, 0); body.add(hip);
    kit.mesh(kit.geometry(new THREE.SphereGeometry(5.6, 24, 16)), joint, hip);
    kit.box(11.5, 21, 13, 4.8, upperLeg, hip, 0, -12, 0);
    const knee = new THREE.Group(); knee.position.set(0, -25, 0); hip.add(knee);
    const kneeJoint = kit.mesh(kit.geometry(new THREE.CylinderGeometry(5.8, 5.8, 12.4, 24)), joint, knee); kneeJoint.rotation.z = Math.PI / 2;
    kit.box(9.5, 20.5, 10.8, 4, lowerLeg, knee, 0, -12, .1);
    kit.mesh(kit.geometry(new THREE.CylinderGeometry(3.7, 3.7, 4, 20)), dark, knee, 0, -24, 0);
    kit.box(11.5, 7, 20, 3.5, dark, knee, 0, -26, -3.4);
    kit.box(9.6, 1, 12, 2, kit.standard(0x718d93, .45, .35), knee, 0, -22, -5.3);
    return { hip, knee };
  }
  const left = leg(1), right = leg(-1);
  const carrying = new THREE.Group(); carrying.position.set(0, 74, 11.5); body.add(carrying);
  kit.box(18, 16, 8, 3, dark, carrying); kit.box(12, 2, 1.2, .6, blueGlow, carrying, 0, 3, 4.6); carrying.visible = false;
  const stun = kit.label('Ⅱ', '#b5ffec', '#2b5369', 24, 13); stun.position.set(0, 136, 0); body.add(stun); stun.visible = false;
  group.userData = { body, carrying, stun, limbs: { leftHip: left.hip, rightHip: right.hip, leftKnee: left.knee, rightKnee: right.knee, leftShoulder, rightShoulder } };
  return group;
}

function createFloor(kit, scene) {
  const floor = kit.box(962, 12, 542, 16, kit.standard(PALETTE.floor, .75, .06), scene, 0, -7, 0); floor.receiveShadow = true;
  kit.box(990, 11, 570, 20, kit.standard(0x172638, .42, .3), scene, 0, -16, 0);
  const points = [];
  for (let x = -450; x <= 450; x += 45) { points.push(x, .1, -235, x, .1, 235); }
  for (let z = -225; z <= 225; z += 45) { points.push(-445, .1, z, 445, .1, z); }
  const grid = new THREE.LineSegments(kit.geometry(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(points, 3))), kit.material(new THREE.LineBasicMaterial({ color: 0x4a647c, transparent: true, opacity: .22 })));
  scene.add(grid);
  for (const x of [-470, 470]) {
    kit.box(9, 11, 485, 4, kit.standard(0x2c4156, .3, .38), scene, x, 3, 2);
    kit.box(2, 1.4, 445, 1, kit.glow(0x99c4ee, .35), scene, x - Math.sign(x) * 5.5, 7.5, 2);
  }
  for (const z of [-251, 252]) kit.box(940, 11, 9, 4, kit.standard(0x2c4156, .3, .38), scene, 0, 3, z);
  // Decorative supply lockers sit outside all model collision space.
  for (const x of [-375, -260, 265, 380]) {
    kit.box(86, 24, 20, 5, kit.standard(0x344d65, .48, .25), scene, x, 10, -266);
    kit.box(66, 2, 14, 3, kit.standard(0x7391a4, .35, .4), scene, x, 23.5, -266);
  }
  for (const bench of BENCHES) {
    const group = new THREE.Group(); group.position.copy(world(bench.x + bench.w / 2, bench.y + bench.h / 2)); scene.add(group);
    kit.contact(group, bench.w + 45, bench.h + 35);
    kit.box(bench.w - 18, 21, bench.h - 9, 8, kit.standard(0x5c7083, .43, .3), group, 0, 11, 0);
    kit.box(bench.w, 7, bench.h, 7, kit.standard(0x4b6073, .28, .25), group, 0, 25, 0);
    kit.box(bench.w - 16, 1.5, bench.h - 10, 4, kit.standard(0x233d51, .3, .25), group, 0, 29.5, 0);
    kit.box(40, 1.5, 24, 3, kit.standard(0x3b8e91, .5, .05), group, -bench.w * .24, 31, 0);
    kit.box(24, 7, 16, 3, kit.standard(0x294357, .26, .4), group, bench.w * .24, 34, -3);
    kit.box(17, 1, 10, 1, kit.glow(0x8ddccd, .3), group, bench.w * .24, 38, -3);
    kit.box(bench.w - 24, 2, 2, 1, kit.glow(PALETTE.blue, .4), group, 0, 18, bench.h / 2 - 1);
  }
}

function makePickup(kit, id, index) {
  const group = new THREE.Group(), item = new THREE.Group(); group.add(item);
  const ring = kit.ring(18, 1.1, kit.glow(id === 'controllers' ? PALETTE.blue : PALETTE.teal, .45), group, 0, 1.5, 0);
  kit.disk(22, kit.basic(id === 'controllers' ? PALETTE.blue : PALETTE.teal, .08), group);
  const hint = kit.mesh(kit.geometry(new THREE.SphereGeometry(3, 16, 12)), kit.glow(0x80b5c6, .5), group, 0, 6, 0);
  if (id === 'sensors') {
    kit.box(20, 4, 17, 3, kit.standard(0x277774, .32, .5), item, 0, 1, 0);
    kit.box(12, 2, 10, 2, kit.glow(0x7bf6d1, .5), item, 0, 4.2, 0);
    for (const x of [-6, 0, 6]) for (const z of [-10, 10]) kit.box(2, 2, 5, .7, kit.standard(0xc2d9e3, .25, .75), item, x, 1, z);
  } else if (id === 'motors') {
    kit.mesh(kit.geometry(new THREE.TorusGeometry(10, 4, 10, 24)), kit.standard(PALETTE.gold, .3, .65), item).rotation.x = Math.PI / 2;
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; const tooth = kit.box(4, 6, 6, 1.5, kit.standard(PALETTE.gold, .3, .65), item, Math.cos(a) * 13, 0, Math.sin(a) * 13); tooth.rotation.y = -a; }
  } else if (id === 'power') {
    kit.box(24, 12, 16, 4, kit.standard(0x346a76, .3, .4), item);
    for (const x of [-7, 0, 7]) kit.box(4, 2.5, 10, 1.5, kit.glow(0xa8f5d1, .9), item, x, 7.5, 0);
    kit.box(5, 5, 8, 1, kit.standard(0xb6c9d1, .22, .6), item, 14, 0, 0);
  } else {
    kit.mesh(kit.geometry(new THREE.CylinderGeometry(15, 16, 6, 32)), kit.standard(0x718bef, .25, .35), item);
    const number = kit.label(String(index + 1), '#ffffff', '#657ce5', 28, 28); number.position.set(0, 22, 0); item.add(number);
  }
  group.userData = { item, ring, hint }; return group;
}

/** Pure presentation of the existing model. It never moves, collects, damages or awards. */
export function createArenaRenderer(canvas, { reducedMotion = false } = {}) {
  const base = rendererBase(canvas), { scene, renderer, camera } = base, kit = createKit();
  camera.position.set(0, 870, 620); camera.lookAt(0, 0, 0);
  createFloor(kit, scene);
  const dock = new THREE.Group(); dock.position.copy(world(ARENA.dock.x, ARENA.dock.y)); scene.add(dock);
  kit.disk(43, kit.basic(PALETTE.teal, .16), dock);
  const dockRing = kit.ring(39, 2, kit.glow(PALETTE.teal, .8), dock);
  const dockLabel = kit.label('HOME', '#1c776f', '#e7fffa', 54, 17); dockLabel.position.set(0, 3, 50); dock.add(dockLabel);
  const player = createHumanoid(kit); player.scale.setScalar(.68); scene.add(player);
  const enemyObjects = [];
  const targetObjects = [];
  const sparkObjects = [];
  const stationObjects = [];
  let currentMission = '', disposed = false;
  const shield = kit.mesh(kit.geometry(new THREE.SphereGeometry(36, 28, 18)), kit.material(new THREE.MeshBasicMaterial({ color: 0x88aaff, transparent: true, opacity: .15, depthWrite: false, wireframe: false })), scene); shield.visible = false;
  const pulse = kit.ring(1, .008, kit.basic(0x76b0ff, .7), scene); pulse.visible = false;
  const destination = kit.ring(9, 1, kit.basic(0x97b5ff, .55), scene); destination.visible = false;
  const radar = kit.ring(65, .65, kit.basic(PALETTE.teal, .15), scene);
  const sensorLight = new THREE.PointLight(0xa7c5ff, 5000, 430, 1.5); sensorLight.visible = false; scene.add(sensorLight);
  const particlesPool = [], floatersPool = [], labelTextures = new Map();
  function setupMission(state) {
    [...targetObjects, ...sparkObjects, ...stationObjects].forEach(object => scene.remove(object));
    targetObjects.length = sparkObjects.length = stationObjects.length = 0;
    state.targets.forEach((target, i) => { const object = makePickup(kit, state.id, i); object.position.copy(world(target.x, target.y)); scene.add(object); targetObjects.push(object); });
    state.sparks.forEach(spark => { const group = new THREE.Group(); group.position.copy(world(spark.x, spark.y)); kit.mesh(kit.geometry(new THREE.OctahedronGeometry(4.5, 1)), kit.glow(PALETTE.gold, .5), group, 0, 13, 0); scene.add(group); sparkObjects.push(group); });
    if (state.id === 'power') state.stations.forEach((station, i) => {
      const group = new THREE.Group(); group.position.copy(world(station.x, station.y)); scene.add(group);
      kit.contact(group, 62, 54); kit.box(37, 22, 30, 7, kit.standard(0x51697d, .4, .35), group, 0, 11, 0);
      kit.box(31, 5, 26, 5, kit.standard(0xc6d6df, .35, .3), group, 0, 25, 0);
      const light = kit.box(23, 2, 16, 3, kit.glow(0xf1b568, .45), group, 0, 28.5, 0);
      const label = kit.label(`0${i + 1}`, '#58718a', '#e5eef5', 27, 15); label.position.set(0, 42, 0); group.add(label);
      group.userData.light = light; stationObjects.push(group);
    });
    currentMission = state.id;
  }
  function render(state, particles = [], floaters = []) {
    if (disposed) return;
    base.resize();
    if (state.id !== currentMission || state.targets.length !== targetObjects.length) setupMission(state);
    const time = state.elapsed || 0;
    player.position.copy(world(state.player.x, state.player.y));
    player.userData.body.rotation.y = Math.atan2(-state.player.dx, -state.player.dy);
    player.userData.body.position.y = !reducedMotion && state.player.moving ? Math.sin(time * 16) * .6 : 0;
    player.userData.carrying.visible = Boolean(state.carrying);
    if (player.userData.limbs) {
      const stride = state.player.moving && !reducedMotion ? Math.sin(time * 10) * .38 : 0;
      const { leftHip, rightHip, leftShoulder, rightShoulder, leftKnee, rightKnee } = player.userData.limbs;
      leftHip.rotation.x = stride; rightHip.rotation.x = -stride;
      leftShoulder.rotation.x = -stride * .65; rightShoulder.rotation.x = stride * .65;
      leftKnee.rotation.x = Math.max(0, -stride) * .55;
      rightKnee.rotation.x = Math.max(0, stride) * .55;
    }
    while (enemyObjects.length < state.enemies.length) { const enemy = createRover(kit, { enemy: true }); scene.add(enemy); enemyObjects.push(enemy); }
    enemyObjects.forEach((object, i) => {
      const enemy = state.enemies[i]; object.visible = Boolean(enemy); if (!enemy) return;
      object.position.copy(world(enemy.x, enemy.y)); object.userData.body.rotation.y = Math.atan2(enemy.x - state.player.x, enemy.y - state.player.y);
      object.userData.body.position.y = !reducedMotion && enemy.stunned <= 0 && state.mode === 'playing' ? Math.sin(time * 13 + i) * .6 : 0;
      object.userData.stun.visible = enemy.stunned > 0;
    });
    state.targets.forEach((target, i) => {
      const object = targetObjects[i]; object.visible = !target.taken;
      object.userData.item.visible = target.revealed;
      object.userData.hint.visible = !target.revealed;
      object.userData.ring.visible = target.revealed;
      object.userData.item.position.y = 18 + (!reducedMotion ? Math.sin(time * 3 + i) * 2.5 : 0);
      object.userData.item.rotation.y = reducedMotion || state.id === 'controllers' ? 0 : time * .6 + i;
      object.userData.ring.material.color.setHex(state.id === 'controllers' && i !== state.collected ? 0xa2b3c8 : PALETTE.teal);
    });
    state.sparks.forEach((spark, i) => { const object = sparkObjects[i]; object.visible = !spark.taken; object.children[0].rotation.y = reducedMotion ? .4 : time * 1.2 + i; object.children[0].position.y = 13 + (!reducedMotion ? Math.sin(time * 3 + i) * 2 : 0); });
    stationObjects.forEach((object, i) => { const charged = state.stations[i]?.charged; object.userData.light.material.color.setHex(charged ? 0x63dfb1 : 0xf1b568); object.userData.light.material.emissive.setHex(charged ? 0x39c69f : 0x916746); });
    const home = objectiveComplete(state); dockRing.material.emissiveIntensity = home ? 1.9 : .6; dockRing.scale.setScalar(home && !reducedMotion ? 1 + Math.sin(time * 4) * .035 : 1);
    shield.visible = state.shield > 0; shield.position.copy(world(state.player.x, state.player.y, 28));
    pulse.visible = state.pulse > 0 && !reducedMotion; pulse.position.copy(world(state.player.x, state.player.y, 1.6));
    if (pulse.visible) { pulse.scale.setScalar(Math.max(1, (1 - state.pulse / .65) * state.scanRange)); pulse.material.opacity = state.pulse / .65 * .7; }
    radar.visible = state.upgrades.includes('sensors'); radar.position.copy(world(state.player.x, state.player.y, 1.3));
    destination.visible = Boolean(state.navigationTarget);
    if (state.navigationTarget) destination.position.copy(world(state.navigationTarget.x, state.navigationTarget.y, 1.5));
    sensorLight.visible = state.id === 'sensors'; sensorLight.position.copy(world(state.player.x, state.player.y, 70));
    // A cooler ambient palette hints at the sensor mission without concealing hazards.
    scene.background.setHex(state.id === 'sensors' ? 0x07101a : 0x0a131d);
    particles.slice(0, 100).forEach((particle, i) => {
      if (!particlesPool[i]) { const object = kit.mesh(kit.geometry(new THREE.SphereGeometry(1, 8, 6)), kit.basic(0x9cf3d0), scene, 0, 0, 0, false); particlesPool.push(object); }
      const object = particlesPool[i]; object.visible = true; object.position.copy(world(particle.x, particle.y, 15 + (particle.life || .1) * 25)); object.scale.setScalar(Math.max(1, (particle.size || 3) * .55)); object.material.color.set(particle.color || '#9cf3d0');
    });
    for (let i = Math.min(particles.length, 100); i < particlesPool.length; i++) particlesPool[i].visible = false;
    floaters.slice(0, 12).forEach((floater, i) => {
      if (!floatersPool[i]) { const object = kit.label('', '#f5fffa', '#254b59', 66, 19); scene.add(object); floatersPool.push(object); }
      const object = floatersPool[i], key = `${floater.text}`;
      if (!labelTextures.has(key)) labelTextures.set(key, kit.label(key, '#e9fff6', '#245567', 66, 19).material.map);
      object.material.map = labelTextures.get(key); object.material.needsUpdate = true; object.material.opacity = Math.min(1, (floater.life || 0) * 1.7); object.position.copy(world(floater.x, floater.y, 65)); object.visible = true;
    });
    for (let i = Math.min(floaters.length, 12); i < floatersPool.length; i++) floatersPool[i].visible = false;
    renderer.render(scene, camera);
  }
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), intersection = new THREE.Vector3();
  return {
    render,
    pointOnFloor(clientX, clientY) {
      if (disposed) return null;
      const bounds = canvas.getBoundingClientRect(); if (!bounds.width || !bounds.height) return null;
      pointer.set((clientX - bounds.left) / bounds.width * 2 - 1, -(clientY - bounds.top) / bounds.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      if (!raycaster.ray.intersectPlane(floorPlane, intersection)) return null;
      const x = intersection.x + ARENA.width / 2, y = intersection.z + ARENA.height / 2;
      return x >= 0 && x <= ARENA.width && y >= 0 && y <= ARENA.height ? { x, y } : null;
    },
    dispose() { if (disposed) return; disposed = true; kit.dispose(); base.dispose(); scene.clear(); },
  };
}

/** Cosmetic humanoid learning model; no physical calibration or hardware claim. */
export function mountLabPreview(canvas, { reducedMotion = false, getSelectedPart = () => 'sensors' } = {}) {
  const base = rendererBase(canvas, { preview: true }), { scene, camera, renderer } = base, kit = createKit();
  camera.position.set(220, 190, 390); camera.lookAt(0, 100, 0);
  scene.fog = new THREE.Fog(0x0b0d10, 650, 1400);
  kit.box(1200, 5, 1200, 14, kit.standard(0x0b0d10, .74, .1), scene, 0, -4, 0);
  const grid = new THREE.GridHelper(1100, 22, 0x3a414b, 0x22272e); grid.position.y = -.9; grid.material.transparent = true; grid.material.opacity = .45; scene.add(grid);
  kit.geometry(grid.geometry); kit.material(grid.material);
  const baseRing = kit.ring(106, .9, kit.basic(0x88aaff, .15), scene, 25, -.55, 0);
  const humanoid = createHumanoid(kit); humanoid.scale.setScalar(1.72); humanoid.position.set(25, 0, 0); humanoid.userData.body.rotation.y = -2.63; scene.add(humanoid);
  // A quiet coordinate cross anchors the figure on the lab floor.
  const cross = new THREE.LineSegments(kit.geometry(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-140, -.4, 0), new THREE.Vector3(190, -.4, 0),
    new THREE.Vector3(25, -.4, -150), new THREE.Vector3(25, -.4, 150),
  ])), kit.material(new THREE.LineBasicMaterial({ color: 0x3a414b, transparent: true, opacity: .25 }))); scene.add(cross);
  let frame = 0, disposed = false, began = 0, actualVisual = null;
  const controller = new AbortController();
  loadLukaVisual(kit, { signal: controller.signal }).then(visual => {
    if (disposed) return;
    actualVisual = visual; humanoid.visible = false;
    visual.group.position.set(25, 0, 0); visual.group.rotation.y = -2.63; scene.add(visual.group);
    canvas.dataset.visual = 'luka-estimated-a2';
  }).catch(error => { if (!disposed && error.name !== 'AbortError') canvas.dataset.visual = 'procedural-learning-model'; });
  function draw(timestamp) {
    if (disposed) return; if (!began) began = timestamp;
    const time = (timestamp - began) / 1000;
    base.resize();
    if (!reducedMotion) { humanoid.userData.body.rotation.y = -2.63 + Math.sin(time * .12) * .075; baseRing.material.opacity = .2 + Math.sin(time * .7) * .025; }
    if (actualVisual) { actualVisual.group.rotation.y = -2.63 + (!reducedMotion ? Math.sin(time * .12) * .075 : 0); actualVisual.highlight(getSelectedPart()); }
    renderer.render(scene, camera); frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
  return () => { if (disposed) return; disposed = true; controller.abort(); cancelAnimationFrame(frame); kit.dispose(); base.dispose(); scene.clear(); };
}
