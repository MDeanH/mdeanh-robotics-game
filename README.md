# mdeanh Robotics game

**Play publicly:** https://mdeanh-robotics-workshop.netlify.app

A modern 3D robotics adventure for students, set inside a contemporary training lab. Drive a little robot, grab lost parts, dodge scrapbots, and make a triumphant delivery to the dock. Each mission helps you earn one of the **sensors, motors, controller, and power** components for your build.

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

## Play the Luka-inspired learning lab

Choose a mission, collect four parts or checkpoints (or power three stations), and return to the dock. Dodge the scrapbots, protect your hearts, and chain pickups for a bigger score.

- **Lights-out loot run:** use the sensor scan to reveal your route through the dark.
- **Turbo parts run:** steer around trouble and use a motor-powered dash.
- **Checkpoint rush:** reach the numbered checkpoints in the correct order.
- **Battery blitz:** carry three energy cells to separate charging stations, using your shield to dodge trouble.

Move with **WASD or the arrow keys**. Press **Space** for the mission ability. Touch controls provide movement and the action button on phones and tablets.

The optional **Tinker lab** keeps the deeper hands-on puzzles: scan an obstacle course, experiment with wheel speeds, program a route, and close a complete battery–load–return circuit. The Parts notebook explains what each component does.

Earned components and progress are saved only in the current browser; they do not follow a student between devices. Replaying a completed mission does not award duplicate component XP.

## Educational scope

The lab and its robot are illustrative game models. The arcade’s scan, dash, hearts, score, and pickups are playful mechanics rather than measurements of a real robot. The game does not connect to physical hardware, test a particular component, or guarantee real-world motion. The Tinker lab’s motor model simplifies real wheel behavior; its controller commands represent signals sent through a motor driver. Its circuit puzzle models a complete electrical path.

Lesson descriptions were checked against primary documentation; see [learning sources](docs/learning-sources.md). Documentation review is distinct from hardware verification.

## Project map

- `dist/`: the playable browser game with vendored Three.js and a vector fallback.
- `baseline/`: kept minimal parts explorer.
- `tests/`: functional rules tests.
- `AGENTS.md`: build invariants and operating instructions.
- `agent/memory/`: current project state and settled decisions.
- `RESEARCH_LOG.md`: append-only evidence record.

Expanded grade-specific curriculum, more robots, and teacher reporting are future decisions.

The repository's original single-file starter is preserved at the repository root as `index.html`. The Robot Lab lives in `dist/` and is served by `npm start`. This version is developed on `codex/pixel-workshop` to preserve the existing `main` version.

The recent starter updates from main are retained in the root `index.html`. Its original notes are preserved in `docs/original-starter-README.md` and original deployment configuration in `baseline/starter-netlify.toml`. That separately hosted starter remains at https://mdeanh-robotics-game.netlify.app; the user-selected Robot Lab is at the public workshop URL above.

The public A2 visual model is an **estimated T2D0 model**, not calibrated to Michael’s physical Luka. Its Mulan PSL v2 license and provenance notice are included in dist/assets/luka/. No robot connection or robot command transport is part of this game. The prior retro build remains available at https://6ae289b8b05a2208ace788a2--mdeanh-robotics-workshop.netlify.app/.
