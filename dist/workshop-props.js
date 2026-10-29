/** Decorative workshop geometry only; these props do not define robot hardware or game collisions. */
export function createWorkshopProps(THREE, kit) {
  const geometryCache = new Map();
  let plantSerial = 0;
  let lampLightCount = 0;
  const geometry = (key, build) => {
    if (!geometryCache.has(key)) geometryCache.set(key, kit.geometry(build()));
    return geometryCache.get(key);
  };
  const unitBox = () => geometry('box', () => new THREE.BoxGeometry(1, 1, 1));
  const unitCylinder = () => geometry('cylinder', () => new THREE.CylinderGeometry(1, 1, 1, 16));
  const sphere = () => geometry('sphere', () => new THREE.SphereGeometry(1, 12, 8));
  const steel = kit.standard(0x34454b, .46, .6);
  const silver = kit.standard(0x9aa6a3, .3, .7);
  const dark = kit.standard(0x1b272b, .73, .15);
  const blue = kit.standard(0x28516a, .6, .15);
  const blueEdge = kit.standard(0x47758b, .55, .2);
  const green = kit.standard(0x2a694b, .6, .12);
  const mustard = kit.standard(0xd6a345, .54, .16);
  const red = kit.standard(0xaa4d31, .57, .12);
  const brass = kit.standard(0xd1ae62, .36, .58);

  function placement(parent, x, y, z, defaults) {
    const optionsOnly = parent && !parent.isObject3D;
    const options = optionsOnly ? { ...defaults, ...parent } : defaults;
    const group = new THREE.Group();
    if (!optionsOnly) {
      group.position.set(x, y, z);
      parent?.add(group);
    }
    group.scale.setScalar(options.scale ?? 1);
    group.userData.decorative = true;
    return { group, options };
  }

  function box(parent, w, h, d, material, x = 0, y = 0, z = 0, shadow = false) {
    const object = kit.mesh(unitBox(), material, parent, x, y, z, shadow);
    object.scale.set(w, h, d);
    return object;
  }

  function cylinder(parent, radius, height, material, x = 0, y = 0, z = 0, shadow = false) {
    const object = kit.mesh(unitCylinder(), material, parent, x, y, z, shadow);
    object.scale.set(radius, height, radius);
    return object;
  }

  function ball(parent, radius, material, x, y, z) {
    const object = kit.mesh(sphere(), material, parent, x, y, z, false);
    object.scale.setScalar(radius);
    return object;
  }

  function bar(parent, from, to, radius, material) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const object = cylinder(parent, radius, a.distanceTo(b), material);
    object.position.copy(a).add(b).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
    return object;
  }

  function instanced(parent, geo, material, parts, shadow = false) {
    const object = new THREE.InstancedMesh(geo, material, parts.length);
    const transform = new THREE.Object3D();
    parts.forEach((part, index) => {
      transform.position.set(...(part.position || [0, 0, 0]));
      transform.rotation.set(...(part.rotation || [0, 0, 0]));
      transform.scale.set(...(part.scale || [1, 1, 1]));
      transform.updateMatrix(); object.setMatrixAt(index, transform.matrix);
      if (part.color !== undefined) object.setColorAt(index, new THREE.Color(part.color));
    });
    object.instanceMatrix.needsUpdate = true;
    if (object.instanceColor) object.instanceColor.needsUpdate = true;
    object.castShadow = shadow; object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function wire(parent, points, color = 0x27362e, radius = .7) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const geo = kit.geometry(new THREE.TubeGeometry(curve, 14, radius, 5, false));
    return kit.mesh(geo, kit.standard(color, .84, .03), parent, 0, 0, 0, false);
  }

  /** Pot base is y=0. Options form: plant({scale, potColor}). */
  function plant(parent, x = 0, y = 0, z = 0, size = 1) {
    const serial = plantSerial++;
    const { group, options } = placement(parent, x, y, z, { scale: size });
    group.name = 'Workshop plant';
    const potColor = options.potColor ?? (serial % 2 ? 0x4a6d54 : 0xad6948);
    const pot = kit.standard(potColor, .87, .03);
    kit.mesh(geometry('plant-pot', () => new THREE.CylinderGeometry(14.5, 10.5, 23, 24)), pot, group, 0, 11.5, 0, true);
    cylinder(group, 15.5, 3, pot, 0, 23, 0);
    cylinder(group, 13.2, 1.4, kit.standard(0x443d2c, .98, 0), 0, 24.5, 0);
    const stems = [], leaves = [];
    for (let index = 0; index < 9; index++) {
      const angle = index * 2.39996 + serial * .3;
      const reach = 10 + index % 3 * 4;
      const top = 44 + index % 4 * 7;
      const end = new THREE.Vector3(Math.cos(angle) * reach, top, Math.sin(angle) * reach);
      const start = new THREE.Vector3(0, 24, 0), direction = end.clone().sub(start);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      const rotation = new THREE.Euler().setFromQuaternion(q);
      stems.push({ position: start.clone().add(end).multiplyScalar(.5).toArray(), scale: [.65, direction.length(), .65], rotation: [rotation.x, rotation.y, rotation.z] });
      for (let side = 0; side < 2; side++) {
        const a = angle + (side ? .8 : -.7), level = top - side * 9;
        leaves.push({ position: [Math.cos(a) * reach, level, Math.sin(a) * reach], scale: [4.5 + index % 2, 11, 2.3], rotation: [Math.sin(a) * .65, a, -Math.cos(a) * .8], color: [0x41693a, 0x597a40, 0x7b934d, 0x365a35][index % 4] });
      }
    }
    instanced(group, unitCylinder(), kit.standard(0x49653b, .94, 0), stems);
    const leafMaterial = kit.standard(0xffffff, .91, 0);
    instanced(group, geometry('plant-leaf', () => new THREE.SphereGeometry(1, 10, 6)), leafMaterial, leaves);
    const vinePoints = [
      [[-3, 36, 3], [-17, 35, 10], [-24, 27, 13], [-25, 11, 14]],
      [[4, 38, -2], [17, 35, -7], [23, 23, -10], [25, 9, -11]],
    ];
    const vineLeaves = [];
    vinePoints.forEach((points, index) => {
      wire(group, points, 0x405e34, .55);
      points.slice(1).forEach((point, leaf) => vineLeaves.push({ position: [point[0] + (leaf % 2 ? -3 : 3), point[1], point[2]], scale: [3.8, 6.8, 1.8], rotation: [.2, index * 1.1, leaf % 2 ? -.6 : .6], color: 0x688347 }));
    });
    instanced(group, geometry('plant-leaf', () => new THREE.SphereGeometry(1, 10, 6)), leafMaterial, vineLeaves);
    return group;
  }

  function pegboardTexture(width, height) {
    const size = 32, pixels = new Uint8Array(size * size * 4);
    for (let row = 0; row < size; row++) for (let column = 0; column < size; column++) {
      const at = (row * size + column) * 4;
      const hole = Math.hypot(column - 16, row - 16) < 3.2;
      const grain = (row * 7 + column * 3) % 7 - 3;
      pixels[at] = hole ? 71 : 174 + grain; pixels[at + 1] = hole ? 61 : 130 + grain; pixels[at + 2] = hole ? 43 : 79 + grain; pixels[at + 3] = 255;
    }
    const map = kit.texture(new THREE.DataTexture(pixels, size, size));
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(width / 22, height / 22);
    map.colorSpace = THREE.SRGBColorSpace; map.magFilter = THREE.LinearFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter; map.generateMipmaps = true; map.needsUpdate = true;
    return map;
  }

  function wrenchGeometry() {
    return geometry('open-wrench', () => {
      const shape = new THREE.Shape();
      shape.moveTo(-3, -22); shape.lineTo(3, -22); shape.lineTo(3, 10); shape.lineTo(9, 16);
      shape.lineTo(9, 25); shape.lineTo(5, 30); shape.lineTo(2, 30); shape.lineTo(2, 21);
      shape.lineTo(-2, 21); shape.lineTo(-2, 30); shape.lineTo(-5, 30); shape.lineTo(-9, 25);
      shape.lineTo(-9, 16); shape.lineTo(-3, 10); shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { depth: 2.6, bevelEnabled: true, bevelSegments: 1, bevelSize: .6, bevelThickness: .5, curveSegments: 3 });
    });
  }

  /** Bottom-center panel origin; tools face +Z. Options: toolWall({width,height}). */
  function toolWall(parent, x = 0, y = 0, z = 0, width = 600, height = 140) {
    const placed = placement(parent, x, y, z, { width, height });
    const { group, options } = placed; width = options.width; height = options.height;
    group.name = 'Pegboard and hand tools';
    const board = kit.material(new THREE.MeshStandardMaterial({ map: pegboardTexture(width, height), roughness: .94, metalness: .02 }));
    box(group, width, height, 6, board, 0, height / 2, 0, true);
    const frame = kit.standard(0x6d6d56, .63, .35);
    box(group, width + 10, 5, 10, frame, 0, 0, 1); box(group, width + 10, 5, 10, frame, 0, height, 1);
    box(group, 5, height, 10, frame, -width / 2, height / 2, 1); box(group, 5, height, 10, frame, width / 2, height / 2, 1);
    const hooks = [];
    const wrenchPositions = [-.39, -.29, -.19];
    wrenchPositions.forEach((fraction, index) => {
      const scale = .85 + index * .17;
      const object = kit.mesh(wrenchGeometry(), silver, group, fraction * width, height * .6, 5, false);
      object.scale.setScalar(scale); object.rotation.z = index === 1 ? -.1 : .04;
      hooks.push({ position: [fraction * width, height * .6 + 29 * scale, 6], scale: [1.5, 8, 1.5], rotation: [Math.PI / 2, 0, 0] });
    });
    for (let index = 0; index < 5; index++) {
      const px = (-.045 + index * .078) * width, py = height * .53;
      const handle = cylinder(group, 3.8, 24, [red, mustard, green, red, dark][index], px, py - 9, 7);
      handle.rotation.z = index % 2 ? .025 : -.025;
      cylinder(group, 1.35, 34 + index % 2 * 6, silver, px, py + 18, 7);
      box(group, 3, 5, 1.3, silver, px, py + 37 + index % 2 * 3, 7);
      hooks.push({ position: [px, py + 29, 7], scale: [1.4, 8, 1.4], rotation: [Math.PI / 2, 0, 0] });
    }
    const hammer = new THREE.Group(); hammer.position.set(width * .405, height * .57, 8); hammer.rotation.z = -.1; group.add(hammer);
    cylinder(hammer, 3.1, 53, red, 0, -3, 0); box(hammer, 30, 12, 12, silver, 3, 26, 0);
    box(hammer, 7, 9, 12, dark, -15, 26, 0);
    const pliers = new THREE.Group(); pliers.position.set(-width * .095, height * .56, 8); group.add(pliers);
    for (const side of [-1, 1]) {
      const grip = cylinder(pliers, 3.2, 28, mustard, side * 5, -13, 0); grip.rotation.z = side * -.24;
      const jaw = box(pliers, 4, 23, 5, silver, side * 3.6, 11, 0); jaw.rotation.z = side * .2;
    }
    ball(pliers, 4.3, silver, 0, 0, 0);
    hooks.push({ position: [width * .405, height * .57 + 30, 7], scale: [1.5, 8, 1.5], rotation: [Math.PI / 2, 0, 0] });
    instanced(group, unitCylinder(), steel, hooks);
    // A compact tray catches loose bits beneath the hanging tools.
    box(group, width * .66, 3, 16, steel, -width * .04, 14, 11);
    instanced(group, unitCylinder(), silver, Array.from({ length: 10 }, (_, index) => ({ position: [(-.28 + index * .048) * width, 18, 12], scale: [1.4, 7, 1.4], rotation: [Math.PI / 2, 0, .2] })));
    return group;
  }

  function binGeometry(width, height, depth) {
    return geometry(`bin:${width}:${height}:${depth}`, () => {
      const positions = [], normals = [];
      const slabs = [
        [width, 3, depth, 0, 1.5, 0],
        [3, height, depth, -width / 2 + 1.5, height / 2, 0],
        [3, height, depth, width / 2 - 1.5, height / 2, 0],
        [width - 6, height, 3, 0, height / 2, -depth / 2 + 1.5],
        [width - 6, 8, 3, 0, 4, depth / 2 - 1.5],
      ];
      for (const [w, h, d, x, y, z] of slabs) {
        const source = new THREE.BoxGeometry(w, h, d), slab = source.toNonIndexed(); source.dispose(); slab.translate(x, y, z);
        positions.push(...slab.attributes.position.array); normals.push(...slab.attributes.normal.array); slab.dispose();
      }
      const result = new THREE.BufferGeometry();
      result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      result.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      return result;
    });
  }

  function sensor(parent, x, y, z, size = 1) {
    const group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(size); parent.add(group);
    box(group, 30, 12, 4, blue, 0, 6, 0);
    const eyes = [-8, 8].map(px => ({ position: [px, 6, 4], scale: [5.1, 5, 5.1], rotation: [Math.PI / 2, 0, 0] }));
    instanced(group, unitCylinder(), silver, eyes);
    instanced(group, unitCylinder(), dark, [-8, 8].map(px => ({ position: [px, 6, 6.7], scale: [3.5, .6, 3.5], rotation: [Math.PI / 2, 0, 0] })));
    return group;
  }

  function gear(parent, x, y, z, size = 1) {
    const group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(size); parent.add(group);
    const torus = kit.mesh(geometry('gear-ring', () => new THREE.TorusGeometry(10, 3.6, 8, 20)), silver, group, 0, 10, 0, false);
    const teeth = Array.from({ length: 10 }, (_, index) => {
      const a = index * Math.PI / 5;
      return { position: [Math.cos(a) * 13, 10 + Math.sin(a) * 13, 0], scale: [6.3, 5, 7], rotation: [0, 0, a] };
    });
    instanced(group, unitBox(), steel, teeth); torus.rotation.z = .1;
  }

  /** Floor origin, open front faces +Z. Options: storageRack({width,height,depth}). */
  function storageRack(parent, x = 0, y = 0, z = 0, width = 240) {
    const { group, options } = placement(parent, x, y, z, { width, height: 220, depth: 66 });
    const { height, depth } = options; width = options.width;
    group.name = 'Component storage rack';
    const uprights = [];
    for (const px of [-width / 2, width / 2]) for (const pz of [-depth / 2, depth / 2]) uprights.push({ position: [px, height / 2, pz], scale: [6, height, 6] });
    instanced(group, unitBox(), steel, uprights, true);
    const shelves = [10, height * .29, height * .55, height * .81];
    instanced(group, unitBox(), steel, shelves.map(level => ({ position: [0, level, 0], scale: [width + 6, 5, depth + 6] })), true);
    const backBrace = bar(group, [-width / 2, 8, -depth / 2], [width / 2, height - 8, -depth / 2], 2.1, steel);
    backBrace.castShadow = false;
    const binWidth = width / 2 - 12, binDepth = depth - 14, binHeight = Math.min(31, height * .14);
    shelves.forEach((level, row) => {
      for (const side of [-1, 1]) {
        const bx = side * width * .245;
        kit.mesh(binGeometry(binWidth, binHeight, binDepth), blue, group, bx, level + 3, 1, false);
        box(group, binWidth - 3, 3, 3, blueEdge, bx, level + 12, binDepth / 2);
        box(group, 22, 6, 1.2, kit.standard(0xc1c1a4, .9, 0), bx, level + 8, binDepth / 2 + 1.6);
        const content = new THREE.Group(); content.position.set(bx, level + 10, binDepth * .2); group.add(content);
        if (row === 0) {
          box(content, 34, 16, 23, mustard, 0, 8, 0);
          box(content, 5, 18, 24, dark, -9, 8, 0); box(content, 5, 18, 24, dark, 9, 8, 0);
        } else if (row === 1) {
          box(content, 40, 4, 25, green, 0, 3, 0);
          box(content, 12, 5, 12, dark, -5, 6, 0);
          instanced(content, unitBox(), brass, [-14, -7, 0, 7, 14].map(px => ({ position: [px, 6, 10], scale: [2, 4, 2] })));
        } else if (row === 2) gear(content, 0, 0, 0, .9);
        else sensor(content, 0, 0, 2, 1.12);
      }
    });
    return group;
  }

  /** Tabletop rover with cosmetic sensor, battery and PCB; its wheel base is y=0. */
  function displayRover(parent, x = 0, y = 0, z = 0, size = 1) {
    const { group } = placement(parent, x, y, z, { scale: size }); group.name = 'Illustrative display rover';
    box(group, 56, 7, 67, silver, 0, 18, 0, true);
    box(group, 48, 4, 56, dark, 0, 13, 0);
    const tire = kit.standard(0x252d2b, .96, .02);
    const wheels = [], hubs = [];
    for (const px of [-31, 31]) for (const pz of [-24, 24]) {
      wheels.push({ position: [px, 11, pz], scale: [11, 9, 11], rotation: [0, 0, Math.PI / 2] });
      hubs.push({ position: [px * 1.06, 11, pz], scale: [5.4, 9.4, 5.4], rotation: [0, 0, Math.PI / 2] });
    }
    instanced(group, unitCylinder(), tire, wheels, true); instanced(group, unitCylinder(), mustard, hubs);
    const axleParts = [-24, 24].map(pz => ({ position: [0, 11, pz], scale: [2, 65, 2], rotation: [0, 0, Math.PI / 2] }));
    instanced(group, unitCylinder(), steel, axleParts);
    box(group, 22, 11, 25, mustard, 12, 27, -14);
    box(group, 4, 12, 26, dark, 12, 27, -14);
    box(group, 29, 3, 26, green, -11, 24, -3);
    box(group, 10, 4, 10, dark, -13, 27.5, -3);
    instanced(group, unitBox(), brass, [-21, -14, -7, 0].flatMap(px => [-13, 7].map(pz => ({ position: [px, 27, pz], scale: [2.5, 4, 2] }))));
    cylinder(group, 2.4, 17, steel, 0, 29, 21);
    sensor(group, 0, 34, 21);
    ball(group, 1.8, kit.glow(0x9ce3a6, .65), -22, 27.5, 3);
    wire(group, [[15, 33, -19], [6, 36, -22], [-5, 32, -18], [-11, 28, -10]], 0x953e28, .65);
    wire(group, [[19, 33, -13], [14, 35, -6], [3, 32, 4], [-8, 27, 4]], 0x27302d, .65);
    return group;
  }

  /** Desk-base origin; adjustable arm and green shade face down into the workbench. */
  function taskLamp(parent, x = 0, y = 0, z = 0, size = 1) {
    const { group, options } = placement(parent, x, y, z, { scale: size }); group.name = 'Green task lamp';
    const enamel = kit.standard(0x356553, .4, .55);
    cylinder(group, 12, 4, enamel, 0, 2, 0, true);
    cylinder(group, 7, 3, dark, 0, 5.5, 0);
    bar(group, [-3, 7, 0], [-14, 46, 0], 1.9, steel);
    bar(group, [3, 7, 0], [-8, 46, 0], 1.9, steel);
    bar(group, [-11, 46, 0], [19, 73, 0], 2.3, steel);
    for (const point of [[0, 8, 0], [-11, 46, 0], [19, 73, 0]]) ball(group, 3.3, enamel, ...point);
    const shadeGroup = new THREE.Group(); shadeGroup.position.set(21, 74, 0); shadeGroup.rotation.z = -.28; group.add(shadeGroup);
    const shadeMaterial = kit.material(new THREE.MeshStandardMaterial({ color: 0x356553, roughness: .42, metalness: .55, side: THREE.DoubleSide }));
    kit.mesh(geometry('lamp-shade', () => new THREE.CylinderGeometry(6.5, 15.5, 16, 24, 1, true)), shadeMaterial, shadeGroup, 0, 0, 0, true);
    const bulb = kit.glow(0xffd694, 1.8);
    ball(shadeGroup, 5.1, bulb, 0, -4, 0);
    cylinder(shadeGroup, 5.8, 3, steel, 0, 9, 0);
    wire(group, [[0, 5, -3], [-17, 23, -3], [-15, 46, -3], [2, 65, -3], [20, 78, -3]], 0x243b30, .65);
    if (options.light !== false && lampLightCount < 2) {
      const light = new THREE.PointLight(0xffd29a, 3000, 175, 2);
      light.position.set(21, 65, 0); light.castShadow = false; group.add(light); lampLightCount++;
    }
    return group;
  }

  return { plant, toolWall, storageRack, displayRover, taskLamp };
}
