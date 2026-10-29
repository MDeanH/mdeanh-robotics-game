# 3D renderer dependency

The modern game uses Three.js **0.186.1**, locally vendored as `dist/vendor/three.module.js` and `three.core.js`. Its MIT license is included unchanged in `dist/vendor/THREE-LICENSE.txt`.

Version and license were verified on 2026-10-28 from the official npm registry metadata at https://registry.npmjs.org/three/latest. The source archive was fetched from https://registry.npmjs.org/three/-/three-0.186.1.tgz. The module imports only the local core module; no runtime CDN is required.

Rendering is a browser presentation of the existing deterministic classroom model. It does not verify physical hardware capability. Meshes, materials, canvas textures, render lists, resize observer, and renderer resources are disposed when the arena or preview is unmounted.
