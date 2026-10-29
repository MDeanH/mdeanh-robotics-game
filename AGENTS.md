# mdeanh Robotics game

Contemporary 3D robotics game for students. On 2026-10-28 the user explicitly replaced the earlier retro direction with a modern game. Use smooth 3D geometry, modern typography, and a current game interface. The authoritative visual reference is the user-owned Luka Remote View at https://luka-a2.netlify.app (local source /Users/friday/Claude/code/luka-web/site/public), verified against the live frontend. Use its neutral gray figure, blue tabs, dark two-column figure/status cards. Steadwell is not the requested reference. Read `agent/memory/MEMORY.md`, then `agent/memory/handoff.md` at session start. Preserve the append-only `RESEARCH_LOG.md`.

## Spine
- All four modules (sensors, motors, controllers, power) have a completable interactive challenge with instructional feedback.
- Award a component and its XP only after that challenge's actual success condition; replaying cannot inflate XP.
- Workshop progress persists across reloads; a storage failure must leave the current session playable.
- Every essential interaction is available through keyboard and touch; animations respect reduced motion.
- Educational simulations are labeled as models; no game result is represented as a hardware test.
- The kept baseline remains independently runnable.

## Scope and decisions
Buildless HTML/CSS/ES modules; no accounts, multiplayer, student data collection, or backend. All four modules are available from the start. Four awarded parts complete one robot. Progress is browser-local. Sound begins only after a user gesture. Grade level, expanded curriculum, and teacher features remain open decisions.

## Architecture
- `dist/index.html`: accessible workshop shell.
- `dist/style.css`: visual presentation.
- `dist/app.js`: workshop orchestration.
- `dist/arcade.js`: action-game input and lifecycle.
- `dist/scene3d.js`: Three.js arena and robot studio rendering.
- `dist/arena2d.js`: smooth vector fallback for devices without WebGL.
- `dist/arcade-model.js`: deterministic action-game rules.
- `dist/game.js`: optional Tinker lab interface.
- `dist/model.js`: deterministic challenge rules.
- `dist/content.js`: lesson data.
- `baseline/index.html`: kept minimal parts explorer.
- `tests/`: executable functional harness.

## Commands
- `npm start` — local HTTP preview.
- `npm test` — deterministic rules tests.
- `npm run check` — source checks.

## Verification and boundaries
Consult `~/wiki` before hardware or project-state claims. Carry evidence status. This is an illustrative browser game, with no connection to physical robots. Functional review only; no security-focused work. Before commits, complete `DEFINITION_OF_DONE.md` and update the handoff. Use GitHub remote `origin` for the user's named repository; Public deployment uses the authenticated Netlify CLI with the exact game site ID. The earlier Sites registration is unpublished and superseded; its reference is in docs/unpublished-sites-registration.json.

## Gotchas
- The installed Fable5 scaffolder writes `CLAUDE.md`; `AGENTS.md` is this project's canonical agent entry point.
