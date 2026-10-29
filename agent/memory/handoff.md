# Handoff — Codex robotics games
Updated 2026-10-28. The third-person 3D game is published and verified. The original retro game is preserved separately.

## Non-negotiable game links
Every NEW GAME gets a NEW Netlify site and public link containing `codex`. Never deploy a different game over an existing game. Preserve existing game URLs. Use explicit site IDs; do not infer a target from a parent or old Netlify binding.

- Third-person game: https://mdeanh-codex-luka-3d.netlify.app — source `dist/`, site `431dd23f-eab9-465d-8714-ae5720b481e4`, deploy `6ae2999ca0a702a8b398ffb2`.
- Unchanged retro game: https://mdeanh-codex-retro.netlify.app — source `games/retro/`, site `e46a19a3-cfe9-4241-99dc-f3c5bfae5ca3`, deploy `6ae295e0e9e677336c2719e5`.
- Original retro URL remains https://mdeanh-robotics-workshop.netlify.app — retro-only site `52fa8bfb-3b0f-4627-94c4-be935970fb69`, restored original deploy `6ae289b8b05a2208ace788a2`.
- Explicit mapping: `docs/game-sites.json`. Local ignored `.netlify/state.json` points to the third-person site.

## Current product
Luka: Systems Online is a third-person 3D adventure. Camera behind the humanoid, explorable orbital lab, solid benches, jump/gravity/landing, sprint, enemies, pickups, waypoint and navigator. Four missions teach sensors, joint actuators, controllers, and power. Fresh visits open directly on the character with no startup popup. Hazards wait for the first game-control interaction. Closing the game opens the garage and module selector.

WASD/arrows move relative to camera; Space jumps; Shift sprints; E uses mission ability; Q/R and drag turn the camera; P pauses. Phone controls include movement, jump, sprint toggle, ability and drag look. Reward gating, 400 XP campaign, version-1 saves and high scores remain compatible.

Correct reference is the user's owned Luka Remote View at https://luka-a2.netlify.app, not Steadwell. Public estimated A2 geometry is used in the optional garage preview with its license/provenance; the active game avatar is an illustrative animated humanoid. No robot connection or command transport exists. Game physics and model/FK checks are software evidence, not hardware calibration or verification.

## Verification
- 44 tests pass: original gameplay/save contracts plus jump, no double-jump, pause freeze, bench landing/walk-off, sprint normalization/boundaries, airborne rover clearance and grounded dock gating. Source checks pass for 11 modules, assets and baseline.
- Browser: actual WebGL with data-camera=third-person-perspective. Full Sequence sprint through held WASD and E pulse won2050 with5/5 integrity; claim completed; reload retained best2050 and400XP without duplicate XP.
- Visible Space jump, Q/R look and Shift+W camera-relative sprint exercised. At1280x720 the game fills the viewport without horizontal overflow.
- Phone390x844: Start visible y534.5–584.5, no horizontal overflow. Held forward, sprint toggle, jump, pulse, camera drag and pause exercised; navigator advanced100,450→100,159.3.
- Reproduced near-camera billboard covering the view during a turn/sprint/jump; view-depth label scaling fixes it. Same actual input sequence now keeps robot/room visible. Fresh browser warning/error logs empty.
- New public game: all26 filesHTTP200 and SHA256-identical to local dist (24,440,844bytes). Actual public scanner mission, camera turning, sprint, two revealed chips, pause and modern title verified; logs empty.
- Retro copy: all16 filesHTTP200 and SHA256-identical to games/retro; original and Codex retro URLs both return pixel-game title. Retro browser screenshot captured.
- Forced WebGL fallback and reduced-motion preference were reviewed in source, not forced in browser. No hardware test was performed.

Evidence artifacts are in ignored `output/`: third-person-deploy-verification.json, retro-codex-verification.json, third-person-mission-win.jpg, codex-luka-3d-public.jpg, codex-retro-preserved.jpg.

## Source and commands
GitHub repo: https://github.com/MDeanH/mdeanh-robotics-game. Work branch `codex/pixel-workshop`, PR1. Source snapshot `0fafb46`; merged current main `78a91d8` as `ef05fce`, preserving its separate root starter and saving its README in docs/original-starter-README.md. Do not merge the PR into main without a user request. Main/root starter is a separate concurrent workflow/site.

`npm start` serves dist on4173. `npm test` and `npm run check` verify software. Only deploy this 3D game to `431dd23f-eab9-465d-8714-ae5720b481e4` with `--dir dist --no-build --prod`. Retro source must remain unchanged unless the user requests a retro edit. Earlier Sites registration remains unpublished.

Further work follows user play feedback. Open product decisions: student age band, deeper in-world lessons, more levels/robots, and teacher reporting.
