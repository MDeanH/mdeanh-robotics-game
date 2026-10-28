# mdeanh Robotics game

Student robotics arcade in a warm 16-bit pixel workshop. User chose concept 2 on 2026-10-28. Read `agent/memory/MEMORY.md`, then `agent/memory/handoff.md` at session start. Preserve the append-only `RESEARCH_LOG.md`.

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
- `dist/game.js`: challenge interface.
- `dist/model.js`: deterministic challenge rules.
- `dist/content.js`: lesson data.
- `baseline/index.html`: kept minimal parts explorer.
- `tests/`: executable functional harness.

## Commands
- `npm start` — local HTTP preview.
- `npm test` — deterministic rules tests.
- `npm run check` — source checks.

## Verification and boundaries
Consult `~/wiki` before hardware or project-state claims. Carry evidence status. This is an illustrative browser game, with no connection to physical robots. Functional review only; no security-focused work. Before commits, complete `DEFINITION_OF_DONE.md` and update the handoff. Use GitHub remote `origin` for the user's named repository; Sites source credentials use the Sites helper without exposing or persisting tokens.

## Gotchas
- The installed Fable5 scaffolder writes `CLAUDE.md`; `AGENTS.md` is this project's canonical agent entry point.
