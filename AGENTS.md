# mdeanh Robotics game

Third-person 3D robotics adventure for students. Latest 2026-10-28 direction: camera behind Luka, an explorable lab, jumping, sprinting, and direct movement. The third-person release is browser-verified and published on its own site. Use smooth geometry, modern typography, and a contemporary game interface. The current room-art reference is the user-supplied warm robotics workshop image, documented in docs/visual-direction.md: wood benches, tool walls, parts bins, plants and sunlight. Preserve the character-first opening. The character/identity reference remains the user-owned Luka Remote View at https://luka-a2.netlify.app (local source /Users/friday/Claude/code/luka-web/site/public), verified against the live frontend, plus the public MDeanH/luka-a2-ultra-model estimated A2 geometry. Keep its neutral gray figure and blue-accent visual language. Steadwell is not the requested reference. Read `agent/memory/MEMORY.md`, then `agent/memory/handoff.md` at session start. Preserve the append-only `RESEARCH_LOG.md`.

Controls: WASD movement, Space jump, Shift sprint, E system ability, Q/R camera look, and drag to look.

## Spine
- Every new game gets a new Netlify site and public link containing codex. Preserve existing games at their original links; never deploy a new game over another game. A Codex-named copy does not replace the original link.
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
Consult `~/wiki` before hardware or project-state claims. Carry evidence status. This is an illustrative browser game, with no connection to physical robots. Functional review only; no security-focused work. Before commits, complete `DEFINITION_OF_DONE.md` and update the handoff. Use GitHub remote `origin` for the user's named repository; Public deployment uses the authenticated Netlify CLI with the exact confirmed NEW-game site ID. The retro canonical site 52fa8bfb-3b0f-4627-94c4-be935970fb69 at https://mdeanh-robotics-workshop.netlify.app/ is preserved for the retro game and must never receive a different game. The new third-person site is confirmed as 431dd23f-eab9-465d-8714-ae5720b481e4 at https://mdeanh-codex-luka-3d.netlify.app; published third-person deploy is 6ae2999ca0a702a8b398ffb2, with real browser and byte verification. A separate unchanged retro copy is published at https://mdeanh-codex-retro.netlify.app, site e46a19a3-cfe9-4241-99dc-f3c5bfae5ca3, deploy 6ae295e0e9e677336c2719e5; all 16 files are byte-verified. Exact original retro source is retained in games/retro/. Use docs/game-sites.json as the explicit source/site/link map while preserving the original retro URL. Never infer a deployment target from a parent or old .netlify binding. The earlier Sites registration is unpublished and superseded; its reference is in docs/unpublished-sites-registration.json.

## Gotchas
- The installed Fable5 scaffolder writes `CLAUDE.md`; `AGENTS.md` is this project's canonical agent entry point.
