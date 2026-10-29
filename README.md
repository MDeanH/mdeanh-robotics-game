# mdeanh Robotics game

**Retro game (preserved):** https://mdeanh-robotics-workshop.netlify.app/

**New third-person game:** https://mdeanh-codex-luka-3d.netlify.app — separate site created; game deployment and verification pending.

**Codex-named retro copy:** https://mdeanh-codex-retro.netlify.app — published as deploy `6ae295e0e9e677336c2719e5`; final byte verification pending. Original retro URL remains preserved.

A third-person 3D robotics adventure for students, set in an explorable learning lab. The current conversion puts the camera behind Luka and adds direct movement, jumping, sprinting, and system abilities. Students explore **sensors, motors, controllers, and power** through the game.

**Release status:** third-person conversion is in progress and is not yet browser-verified or published. The prior modern deployment `6ae2946060d6e5857ff3ac02` is historical and superseded. The retro game keeps its canonical link; the third-person game must be published to a new site and a new link.

The current version follows the user’s **modern game** direction and the user-owned Luka Remote View reference (https://luka-a2.netlify.app): dark rounded cards, blue-accent system tabs, a neutral-gray humanoid figure, and a figure/status layout. The earlier pixel-art concept is archived as a baseline. It runs in the browser with HTML, CSS, and JavaScript; there is no install or student account required to play.

## Run locally

Requires a current Node.js release. There are no package dependencies to install.

```sh
npm start
```

Open the local URL printed by the server.

```sh
npm test
npm run check
```

`npm test` runs the deterministic gameplay rules harness. `npm run check` checks the project source. The independently runnable minimal parts explorer lives in `baseline/index.html`.

## Third-person adventure direction

The new experience follows Luka from a camera behind the character through an explorable lab. Jumping and sprinting are part of the intended movement. Mission mechanics and camera controls are being integrated; the existing system-learning goals and saved components are retained.

- **Sensor sweep:** discover hidden components using perception.
- **Velocity trial:** explore motion and actuation.
- **Sequence sprint:** follow ordered instructions and checkpoints.
- **Energy relay:** explore power through energy-cell deliveries.

**Target controls, pending verification:** WASD moves; Space jumps; Shift sprints; E activates the system ability; Q/R and dragging control the camera. Touch controls are being updated for this third-person experience.

The optional **Simulation lab** keeps the deeper hands-on puzzles: scan an obstacle course, experiment with wheel speeds, program a route, and close a complete battery–load–return circuit. The Components panel explains what each component does.

Earned components and progress are saved only in the current browser; they do not follow a student between devices. Replaying a completed mission does not award duplicate component XP.

## Educational scope

The lab and its robot are illustrative game models. The arcade’s scan, dash, hearts, score, and pickups are playful mechanics rather than measurements of a real robot. The game does not connect to physical hardware, test a particular component, or guarantee real-world motion. The Simulation lab’s motor model simplifies real wheel behavior; its controller commands represent signals sent through a motor driver. Its circuit puzzle models a complete electrical path.

Lesson descriptions were checked against primary documentation; see [learning sources](docs/learning-sources.md). Documentation review is distinct from hardware verification.

## Project map

- `dist/`: the playable browser game with vendored Three.js and a vector fallback.
- `baseline/`: kept minimal parts explorer.
- `games/retro/`: all 16 files from the original published retro game, retained separately.
- `docs/game-sites.json`: explicit source, site ID, URL, and deployment map for each game.
- `tests/`: functional rules tests.
- `AGENTS.md`: build invariants and operating instructions.
- `agent/memory/`: current project state and settled decisions.
- `RESEARCH_LOG.md`: append-only evidence record.

Expanded grade-specific curriculum, more robots, and teacher reporting are future decisions.

The repository's original single-file starter is preserved at the repository root as `index.html`. The Robot Lab lives in `dist/` and is served by `npm start`. This version is developed on `codex/pixel-workshop` to preserve the existing `main` version.

The recent starter updates from main are retained in the root `index.html`. Its original notes are preserved in `docs/original-starter-README.md` and original deployment configuration in `baseline/starter-netlify.toml`. That separately hosted starter remains at https://mdeanh-robotics-game.netlify.app. The retro game keeps https://mdeanh-robotics-workshop.netlify.app/; the new third-person game will receive its own site and link.

The public A2 visual model is an **estimated T2D0 model**, not calibrated to Michael’s physical Luka. Its Mulan PSL v2 license and provenance notice are included in dist/assets/luka/. No robot connection or robot command transport is part of this game. The prior retro build remains available at https://6ae289b8b05a2208ace788a2--mdeanh-robotics-workshop.netlify.app/.

## Game link preservation

Every new game gets a new Netlify site and public link containing `codex`. Never replace an existing game with a new game at its old URL. The retro game remains at its canonical workshop URL above. The new third-person site is `mdeanh-codex-luka-3d`, ID `431dd23f-eab9-465d-8714-ae5720b481e4`; its public link is confirmed, while game deployment and third-person verification remain pending. The unchanged Codex-named retro copy has been published at the separate link above, with final byte verification pending. Its exact preserved source is in `games/retro/`; `docs/game-sites.json` maps each game source to its own site, link, and deploy. Do not deploy the third-person game using the retro site ID or an inherited Netlify binding.
