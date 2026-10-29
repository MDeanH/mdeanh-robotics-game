import { createWorkshopProps } from './workshop-props.js';

/** A warm maker workshop around the unchanged training area. All sizes are game units. */
export function createWorkshopEnvironment(THREE, kit, scene, { BENCHES = [] } = {}) {
  const colliders = [], props = createWorkshopProps(THREE, kit);
  const cream = kit.standard(0xdfd2b6, .92, .01), plaster = kit.standard(0xcbbb97, .92, .01);
  const steel = kit.standard(0x34464a, .58, .4), darkSteel = kit.standard(0x273337, .7, .24);
  const woodEdge = kit.standard(0xa36f3b, .78, .02), handle = kit.standard(0x9ca7a4, .32, .64);
  const proxyMaterial = kit.material(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  const canvasTexture = (width, height, paint) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; paint(canvas.getContext('2d'), width, height);
    const map = kit.texture(new THREE.CanvasTexture(canvas)); map.colorSpace = THREE.SRGBColorSpace; return map;
  };
  const tileMap = canvasTexture(512, 512, (ctx) => {
    const shades = ['#d7cdb7', '#cfc4ae', '#d2c9b5', '#c9bea8'];
    for (let row = 0; row < 2; row++) for (let col = 0; col < 2; col++) {
      const x = col * 256, y = row * 256; ctx.fillStyle = '#a99e87'; ctx.fillRect(x, y, 256, 256);
      ctx.fillStyle = shades[row * 2 + col]; ctx.fillRect(x + 3, y + 3, 250, 250);
      ctx.strokeStyle = '#e2d8c3'; ctx.lineWidth = 1; ctx.strokeRect(x + 4, y + 4, 248, 248);
      for (let i = 0; i < 45; i++) { const px = x + 12 + ((i * 97 + row * 23) % 227), py = y + 12 + ((i * 61 + col * 47) % 227); ctx.fillStyle = i % 3 ? '#7c735b08' : '#fffbed0b'; ctx.beginPath(); ctx.ellipse(px, py, 4 + i % 9, 1 + i % 4, i, 0, Math.PI * 2); ctx.fill(); }
    }
  });
  tileMap.wrapS = tileMap.wrapT = THREE.RepeatWrapping; tileMap.repeat.set(13, 9); tileMap.anisotropy = 4;
  const tileMaterial = kit.material(new THREE.MeshStandardMaterial({ color: 0xffffff, map: tileMap, roughness: .86, metalness: 0 }));
  kit.box(1312, 10, 912, 2, kit.standard(0x9c927f, .95, 0), scene, 0, -5, 0);
  const floor = kit.mesh(kit.geometry(new THREE.PlaneGeometry(1300, 900)), tileMaterial, scene, 0, .04, 0, false); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  const woodMap = canvasTexture(1024, 128, (ctx) => {
    ctx.fillStyle = '#c69350'; ctx.fillRect(0, 0, 1024, 128);
    for (let i = 0; i < 68; i++) {
      ctx.strokeStyle = i % 4 ? '#75491c18' : '#ffe1a72b'; ctx.lineWidth = i % 6 ? .7 : 1.6; ctx.beginPath();
      for (let x = 0; x <= 1024; x += 18) { const y = i * 2 + Math.sin(x * .012 + i * 2) * (i % 7 + 1) * .21; if (!x) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
    }
    for (const x of [250, 680]) { ctx.strokeStyle = '#70431d2b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, 45 + x % 36, 28, 6, .06, 0, Math.PI * 2); ctx.stroke(); }
  });
  woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping; woodMap.repeat.set(.012, .025); woodMap.anisotropy = 4;
  const wood = kit.material(new THREE.MeshStandardMaterial({ color: 0xe1b477, map: woodMap, roughness: .68, metalness: .015 }));
  const workMatMap = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#376b5b'; ctx.fillRect(0, 0, 256, 256); ctx.strokeStyle = '#b2c89c55'; ctx.lineWidth = 1;
    for (let x = 12; x < 256; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke(); }
    for (let y = 12; y < 256; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke(); }
    ctx.strokeStyle = '#d0d6b085'; ctx.lineWidth = 2; ctx.strokeRect(8, 8, 240, 240);
  });
  const workMat = kit.material(new THREE.MeshStandardMaterial({ color: 0xffffff, map: workMatMap, roughness: .94, metalness: 0 }));
  function placed(group, x, y, z, rotation = 0) { group.position.set(x, y, z); group.rotation.y = rotation; scene.add(group); return group; }
  function proxy(parent, width, height, depth, x = 0, y = height / 2, z = 0) {
    const mesh = kit.box(width, height, depth, 1, proxyMaterial, parent, x, y, z); mesh.castShadow = mesh.receiveShadow = false; colliders.push(mesh); return mesh;
  }
  function matOn(parent, width, depth, x, y, z) {
    const mat = kit.mesh(kit.geometry(new THREE.PlaneGeometry(width, depth)), workMat, parent, x, y, z, false); mat.rotation.x = -Math.PI / 2; mat.receiveShadow = true; return mat;
  }
  function workbench(width, depth, height, x, z, { drawers = false } = {}) {
    const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group);
    const top = kit.box(width, 6, depth, 2.4, wood, group, 0, height - 3, 0); colliders.push(top);
    kit.box(width - 5, 2.5, depth - 3, 1, woodEdge, group, 0, height - 6.4, 0);
    for (const legX of [-width / 2 + 10, width / 2 - 10]) for (const legZ of [-depth / 2 + 8, depth / 2 - 8]) kit.box(5.5, height - 7, 5.5, 1, darkSteel, group, legX, (height - 7) / 2, legZ);
    kit.box(width - 18, 3, depth - 15, 1, steel, group, 0, 8, 0);
    if (drawers) {
      const banks = Math.max(2, Math.floor(width / 140)), bankWidth = (width - 28) / banks;
      for (let bank = 0; bank < banks; bank++) {
        const bx = -width / 2 + 14 + bankWidth * (bank + .5);
        kit.box(bankWidth - 6, height - 17, depth - 16, 2, kit.standard(bank % 2 ? 0x4b5558 : 0x3d4c50, .65, .2), group, bx, (height - 17) / 2 + 4, 0);
        for (let row = 0; row < 3; row++) {
          const y = 11 + row * (height - 19) / 3;
          kit.box(bankWidth - 10, 8.4, 2, 1, kit.standard(bank % 2 ? 0x6b7270 : 0x59666a, .63, .18), group, bx, y, depth / 2 - 7);
          kit.box(Math.min(28, bankWidth * .3), 2, 2.8, .7, handle, group, bx, y + .3, depth / 2 - 5.5);
        }
      }
    }
    return group;
  }

  // The playable area's rubber floor and safety corners belong to the workshop,
  // rather than a raised board. Movement limits sit just inside its border.
  const rubberMap = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = '#3e4444'; ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 5) { ctx.fillStyle = '#60646020'; ctx.fillRect(0, y, 256, 1); }
    for (let i = 0; i < 200; i++) { ctx.fillStyle = i % 2 ? '#1119180d' : '#a2a79b0c'; ctx.fillRect(i * 73 % 255, i * 131 % 255, 2, 1); }
  });
  rubberMap.wrapS = rubberMap.wrapT = THREE.RepeatWrapping; rubberMap.repeat.set(.01, .01);
  const rubber = kit.material(new THREE.MeshStandardMaterial({ color: 0xd4d0bd, map: rubberMap, roughness: .98, metalness: 0 }));
  kit.box(890, .12, 463, 7, rubber, scene, 0, .12, 11.5);
  const hazardMap = canvasTexture(256, 64, (ctx) => {
    ctx.fillStyle = '#252d2f'; ctx.fillRect(0, 0, 256, 64); ctx.fillStyle = '#d9ab46';
    for (let x = -64; x < 320; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 32, 0); ctx.lineTo(x + 96, 64); ctx.lineTo(x + 64, 64); ctx.closePath(); ctx.fill(); }
  });
  hazardMap.wrapS = hazardMap.wrapT = THREE.RepeatWrapping;
  const hazard = kit.material(new THREE.MeshStandardMaterial({ color: 0xffffff, map: hazardMap, roughness: .94 }));
  for (const side of [-1, 1]) for (const end of [-1, 1]) {
    const z = end < 0 ? -213 : 236;
    kit.mesh(kit.geometry(new THREE.BoxGeometry(90, .16, 8)), hazard, scene, side * 392, .27, z, false);
    const strip = kit.mesh(kit.geometry(new THREE.BoxGeometry(90, .16, 8)), hazard, scene, side * 438, .27, end < 0 ? -173 : 196, false); strip.rotation.y = Math.PI / 2;
  }

  // Natural plaster enclosure. The left wall opens to a six-pane sunlit window.
  colliders.push(kit.box(1310, 340, 18, 2, cream, scene, 0, 170, -450));
  colliders.push(kit.box(1310, 340, 18, 2, plaster, scene, 0, 170, 450));
  colliders.push(kit.box(18, 340, 900, 2, cream, scene, 650, 170, 0));
  colliders.push(kit.box(18, 60, 900, 2, cream, scene, -650, 30, 0));
  colliders.push(kit.box(18, 42, 900, 2, cream, scene, -650, 319, 0));
  for (const z of [-439, 430]) colliders.push(kit.box(18, 250, 24, 2, cream, scene, -650, 179, z));
  const frame = kit.standard(0x59604d, .66, .15), frameEdge = kit.standard(0xc8b88e, .78, .01);
  for (const z of [-405, -152, 102, 355]) colliders.push(kit.box(13, 224, 8, 1, frame, scene, -640, 178, z));
  for (const y of [66, 178, 290]) colliders.push(kit.box(13, 8, 768, 1, frame, scene, -640, y, -25));
  kit.box(15, 7, 784, 1, frameEdge, scene, -642, 299, -25);
  kit.box(70, 9, 804, 2, wood, scene, -625, 62, -25);
  const glassMaterial = kit.material(new THREE.MeshBasicMaterial({ color: 0xfff1c6, transparent: true, opacity: .065, depthWrite: false, side: THREE.DoubleSide }));
  for (const z of [-279, -25, 229]) for (const y of [122, 234]) {
    const glass = kit.mesh(kit.geometry(new THREE.PlaneGeometry(246, 104)), glassMaterial, scene, -650, y, z, false); glass.rotation.y = Math.PI / 2; colliders.push(glass);
  }
  // A garden beyond the glazing makes the sunlit window read as an actual opening.
  const gardenMap = canvasTexture(1024, 512, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#a9d4da'); sky.addColorStop(.55, '#f5ebc3'); sky.addColorStop(1, '#98a36c'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1024, 512);
    const hills = [['#9bad77', 292, 32], ['#7f9965', 340, 42], ['#668450', 390, 34]];
    for (const [color, baseline, amplitude] of hills) { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 512); for (let x = 0; x <= 1024; x += 8) ctx.lineTo(x, baseline + Math.sin(x * .008) * amplitude + Math.cos(x * .018) * 12); ctx.lineTo(1024, 512); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#ffefb4'; ctx.beginPath(); ctx.arc(710, 130, 42, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 28; i++) { const x = i * 137 % 1050, y = 315 + i * 29 % 95, height = 35 + i * 7 % 45; ctx.fillStyle = i % 2 ? '#667d4c' : '#748a53'; ctx.beginPath(); ctx.ellipse(x, y, 16 + i % 9, height, .05, 0, Math.PI * 2); ctx.fill(); }
  });
  const garden = kit.mesh(kit.geometry(new THREE.PlaneGeometry(1170, 480)), kit.material(new THREE.MeshBasicMaterial({ map: gardenMap, side: THREE.DoubleSide })), scene, -930, 175, -25, false); garden.rotation.y = Math.PI / 2;
  kit.box(650, 4, 1100, 2, kit.standard(0x728651, 1, 0), scene, -1010, -8, 0);
  for (const [x, z, scale] of [[-760, -310, 1], [-835, 190, 1.3], [-795, 370, .8]]) {
    const tree = new THREE.Group(); tree.position.set(x, 0, z); scene.add(tree);
    kit.mesh(kit.geometry(new THREE.CylinderGeometry(4 * scale, 6 * scale, 105 * scale, 9)), kit.standard(0x6c5737, 1, 0), tree, 0, 50 * scale, 0, false);
    for (let i = 0; i < 5; i++) { const foliage = kit.mesh(kit.geometry(new THREE.SphereGeometry((28 + i % 2 * 9) * scale, 16, 12)), kit.standard([0x748944, 0x849952, 0x637f41][i % 3], .98, 0), tree, Math.sin(i * 2.1) * 22 * scale, (110 + Math.sin(i) * 17) * scale, Math.cos(i * 2.1) * 16 * scale, false); foliage.scale.y = 1.25; }
  }

  // North-wall work areas, full of practical storage and tools at normal desk height.
  workbench(510, 76, 52, -330, -401, { drawers: true });
  workbench(385, 76, 52, 380, -401, { drawers: true });
  const leftTools = placed(props.toolWall({ width: 510, height: 145 }), -330, 83, -434);
  const rightTools = placed(props.toolWall({ width: 382, height: 145 }), 380, 83, -434);
  proxy(leftTools, 510, 145, 8, 0, 72.5, 0); proxy(rightTools, 382, 145, 8, 0, 72.5, 0);
  const rearRack = placed(props.storageRack({ width: 184, height: 174, depth: 66 }), 45, 0, -410); proxy(rearRack, 184, 174, 66);
  const rightRack = placed(props.storageRack({ width: 350, height: 206, depth: 70 }), 606, 0, -160, -Math.PI / 2); proxy(rightRack, 350, 206, 70);
  // Left window counter faces the room and carries plants, small projects and lamps.
  const windowCounter = workbench(455, 72, 44, -601, 30, { drawers: true }); windowCounter.rotation.y = Math.PI / 2;
  // The counter's proxy joins its group, so camera bounds follow the rotation.
  proxy(windowCounter, 455, 44, 72, 0, 22, 0);
  matOn(windowCounter, 135, 48, -98, 44.3, 0);
  placed(props.taskLamp({ scale: .48 }), -520, 52, -393);
  placed(props.taskLamp({ scale: .44 }), 540, 52, -398, -.8);
  placed(props.displayRover({ scale: .68 }), -275, 52, -393, .1);
  placed(props.displayRover({ scale: .48 }), 379, 52, -393, -.5);
  for (const [x, y, z, scale] of [[-615, 67, -290, .45], [-615, 67, -40, .38], [-615, 67, 225, .5], [-550, 69, -300, .93], [545, 0, -320, 1.2], [-566, 0, 308, 1.1]]) placed(props.plant({ scale }), x, y, z);
  placed(props.plant({ scale: .6 }), -598, 241, -145);
  const hangingWire = kit.mesh(kit.geometry(new THREE.CylinderGeometry(.65, .65, 42, 8)), darkSteel, scene, -598, 313, -145, false);
  const red = kit.standard(0x913d35, .62, .16), redDrawer = kit.standard(0xb14d3c, .58, .18);
  const redCabinet = new THREE.Group(); redCabinet.position.set(-550, 0, -296); scene.add(redCabinet);
  kit.box(74, 59, 53, 2, red, redCabinet, 0, 34, 0); proxy(redCabinet, 74, 65, 53);
  kit.box(78, 4, 57, 1, steel, redCabinet, 0, 65, 0);
  for (let i = 0; i < 6; i++) { const y = 12 + i * 8.3; kit.box(65, 6.8, 2.5, .8, redDrawer, redCabinet, 0, y, 28); kit.box(42, 1.8, 3, .5, handle, redCabinet, 0, y + 1.5, 29.7); }
  for (const x of [-25, 25]) for (const z of [-16, 16]) { const wheel = kit.mesh(kit.geometry(new THREE.CylinderGeometry(4.2, 4.2, 4, 14)), darkSteel, redCabinet, x, 5, z); wheel.rotation.z = Math.PI / 2; }

  // Exactly matching the playable collisions, these are climbable working benches.
  BENCHES.forEach((bench, index) => {
    const height = bench.height || 32, group = workbench(bench.w, bench.h, height, bench.x + bench.w / 2 - 480, bench.y + bench.h / 2 - 270);
    matOn(group, bench.w * .47, bench.h * .68, -bench.w * .13, height + .18, 0);
    // Low-profile hardware at the edge leaves the jumping surface clear.
    kit.box(16, 5, 10, 1.5, kit.standard(index % 2 ? 0x8c9b9c : 0x3c5b65, .56, .24), group, bench.w * .32, height + 2.5, -bench.h * .17);
    kit.box(11, 1, 4, .5, handle, group, bench.w * .32, height + 5.5, -bench.h * .17);
  });

  // Ceiling timber and green pendant shades echo the warm reference workshop.
  const ceilingTimber = kit.standard(0x766247, .8, .04), greenShade = kit.material(new THREE.MeshStandardMaterial({ color: 0x315d51, roughness: .46, metalness: .28, side: THREE.DoubleSide }));
  for (const z of [-310, 25, 340]) kit.box(1300, 19, 22, 2, ceilingTimber, scene, 0, 330, z);
  for (const [x, z] of [[-285, -280], [350, -220]]) {
    kit.mesh(kit.geometry(new THREE.CylinderGeometry(1.1, 1.1, 54, 10)), darkSteel, scene, x, 302, z);
    kit.mesh(kit.geometry(new THREE.ConeGeometry(28, 23, 36, 1, true)), greenShade, scene, x, 266, z);
    kit.mesh(kit.geometry(new THREE.SphereGeometry(5.2, 16, 12)), kit.glow(0xffdf9b, .75), scene, x, 254, z, false);
  }
  // Back-wall baseboard and side door complete the ordinary workshop architecture.
  kit.box(1290, 11, 4, 1, kit.standard(0x88785c, .9, .02), scene, 0, 5.5, -438);
  kit.box(145, 226, 9, 2, kit.standard(0x8d9778, .82, .02), scene, 255, 113, 436);
  kit.box(130, 209, 3, 1, kit.standard(0xb0b49a, .8, .01), scene, 255, 113, 430);
  kit.mesh(kit.geometry(new THREE.SphereGeometry(3.2, 14, 10)), handle, scene, 305, 107, 426);
  return colliders;
}
