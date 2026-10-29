# Handoff — mdeanh Robotics game
Updated 2026-10-28. Current objective: third-person 3D robotics adventure. Implementation and verification of that new direction are pending.

## Game link invariant — latest user directive
KEEP THE RETRO GAME. EVERY NEW GAME GETS A NEW LINK. New public game links must contain codex. Create a separate Netlify site for each new game; never overwrite an existing game or reuse its canonical URL for a new game.

Retro canonical: https://mdeanh-robotics-workshop.netlify.app/ (site 52fa8bfb-3b0f-4627-94c4-be935970fb69). Root restored retro deploy 6ae289b8b05a2208ace788a2 and verified the canonical live URL returns HTTP 200 with its pixel-game title. Preserve this site for retro only.

The new third-person site is created and renamed mdeanh-codex-luka-3d: ID 431dd23f-eab9-465d-8714-ae5720b481e4, URL https://mdeanh-codex-luka-3d.netlify.app. Third-person game deployment/verification remain PENDING. Use this fresh site ID explicitly, never the retro ID or an inferred local/parent .netlify binding. An unchanged Codex-named retro copy is published at https://mdeanh-codex-retro.netlify.app, site e46a19a3-cfe9-4241-99dc-f3c5bfae5ca3, deploy 6ae295e0e9e677336c2719e5. Root final byte verification is pending. Original retro URL remains preserved.

## Current user direction
Put the camera behind Luka in an explorable lab. Add jumping, sprinting, direct movement, and camera look. Target controls are WASD movement, Space jump, Shift sprint, E system ability, Q/R camera look, and drag to look. These are implementation targets, not yet verified results. Root owns model/tests; renderer work is in scene3d.js; arcade/UI work is in arcade.js and CSS.

The visual reference is the user's owned Luka Remote View at https://luka-a2.netlify.app, with local frontend /Users/friday/Claude/code/luka-web/site/public, and public MDeanH/luka-a2-ultra-model geometry. Use a neutral gray humanoid with blue-accent modern styling. The earlier Steadwell reference was rejected. Public T2D0 geometry remains estimated, not calibrated to the physical Luka. No robot connection or command transport belongs in this educational game.

## Existing architecture
- dist/index.html + style.css: learning hub.
- dist/app.js: browser save and modal orchestration.
- dist/arcade.js + arcade.css: game input, HUD, lifecycle.
- dist/scene3d.js: Three.js arena and model presentation; camera conversion in progress.
- dist/luka-visual.js + assets/luka/: public licensed estimated A2 geometry.
- dist/arena2d.js: vector compatibility fallback from the previous release.
- dist/arcade-model.js: deterministic game rules; third-person changes in progress.
- dist/game.js + model.js + game.css: optional Simulation lab puzzles.
- dist/progress.js: existing version-1 local save and high scores.
- baseline/: kept explorer and historical visual assets.
- games/retro/: all 16 exact original published retro files, preserved separately from dist/.
- docs/game-sites.json: explicit game-source/site-ID/URL/deploy map. Ignored local .netlify/state.json points to the new 3D site, but every deploy still requires an explicit ID.
- root index.html: preserved separate starter from main.

## Current third-person model review
44 automated tests pass, including five adventure tests for jump/landing, pause, sprint, collision, and airborne dock gating. An additional source-model probe landed on the bench at elevation 32 and then walked off each of four edges to elevation 0 with grounded=true. No confirmed physics defect found. These are software/model checks; third-person browser and publication checks remain pending.

## Historical verified modern release
Before this third-person request, 39 automated tests and source checks passed. Root browser QA observed the WebGL arena; the public hub loaded all 47 estimated A2 meshes with data-visual=luka-estimated-a2; a complete Sequence sprint keyboard run won at score 1380 with 3/4 integrity and a visible claim button. At 1280x720 the dialog client/scroll height was 662. At 390x844 there was no horizontal overflow; an energy-cell state at score 220, held Move up, shield action, and pause/resume were observed. These checks describe the prior modern release, not the new third-person implementation. Forced fallback, reduced-motion mode, and hardware behavior were not browser/hardware-tested.

## Hosting and source
- Preserved retro canonical URL: https://mdeanh-robotics-workshop.netlify.app/; retro-only site ID 52fa8bfb-3b0f-4627-94c4-be935970fb69.
- New third-person site: mdeanh-codex-luka-3d, confirmed ID 431dd23f-eab9-465d-8714-ae5720b481e4, URL https://mdeanh-codex-luka-3d.netlify.app. Third-person game deploy and live verification: PENDING.
- Codex-named unchanged retro copy: https://mdeanh-codex-retro.netlify.app; site e46a19a3-cfe9-4241-99dc-f3c5bfae5ca3, published deploy 6ae295e0e9e677336c2719e5. Root final byte verification PENDING. Preserve the original retro canonical URL too.
- Previous modern deploy 6ae2946060d6e5857ff3ac02 is a historical artifact, superseded by the current third-person direction and the new-link requirement. Root verified that previous artifact's 26 files (24,418,199 bytes) anonymously returned HTTP 200 and matched local SHA-256, with live WebGL movement/turbo and no warning/error logs. Those results do not verify the third-person game.
- GitHub: MDeanH/mdeanh-robotics-game, branch codex/pixel-workshop, PR https://github.com/MDeanH/mdeanh-robotics-game/pull/1. Preserve concurrent changes on main; root is handling its merge.
- Prior immutable retro permalink remains https://6ae289b8b05a2208ace788a2--mdeanh-robotics-workshop.netlify.app/; canonical retro URL above must remain retro too.
- Earlier Sites registration remains unpublished; do not publish it.

## Run and verify
npm start serves the local preview on 4173. npm test checks game/save/model contracts. npm run check checks source and assets. After final third-person checks, deploy only to the confirmed new site: netlify deploy --site 431dd23f-eab9-465d-8714-ae5720b481e4 --dir dist --no-build --prod. No third-person deployment targeting the retro site is authorized.

## Next
Complete the behind-character camera and third-person movement, run the updated harness, verify actual browser movement/jump/sprint/ability/look and touch behavior, then publish to the confirmed NEW third-person Netlify site and record its NEW public link. Verify the retro canonical still serves the retro game. Record the new deploy ID and distinguish fresh checks from historical evidence. Preserve saves and the kept baseline. Further curriculum depth, age band, more robots, and teacher features remain user decisions.
