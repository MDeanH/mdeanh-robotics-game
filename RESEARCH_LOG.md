# Research log — append-only

## 2026-10-28 — scope and operating baseline
- Start/end: 2026-10-28 session setup.
- Sources opened: user conversation; ~/wiki/wiki/concepts/production-grade-build-process.md (status verified, verified_by user-confirmed); Fable5 and Sites skills; live `gh api user`.
- Conclusion: user chose student arcade challenges and Pixel Workshop mockup. Workspace was an empty unborn Git repository; connected GitHub login is MDeanH. No claim about actual robot hardware is necessary for this browser simulation.
- Status: user-selected scope; software implementation not yet tested.
- Defaults: four freely selectable modules, browser-local save, keyboard/touch input, private repository and Site.

## 2026-10-28 — software checks and preserved repository
- Sources opened: current GitHub repository metadata and initial README/index.html, checked via gh; primary lesson sources listed in docs/learning-sources.md; Google Fonts official Silkscreen TTF and OFL.
- Result: repository already existed, created 2026-10-28T23:31:37Z by a concurrent workflow. Preserve root index.html and main history; deliver Pixel Workshop on codex/pixel-workshop.
- Verification: npm test: 16/16 pass; npm run check passes (6 ES modules and local assets). Root and baseline HTTP both 200. Browser visual and action QA pending.
- Red-on-demand: challenge model scan gate mutated in memory by subagent; scan-gate assertion failed (exit 1, true !== false). Actual source unchanged. Meaningful regression harness demonstrated.
- User steering: requested more game-like/fun experience. Add movement, enemies, collectibles, specials, scoring, and ability unlocks; keep self-paced puzzles as optional Tinker lab.
- Artwork: built-in image generator transformed selected Pixel Workshop mockup into full-bleed workshop asset; stored in dist/assets/workshop.png. Illustration only.

## 2026-10-28 — integrated browser puzzle proof
- Browser: in-app preview at 1280 px desktop, local HTTP server.
- Reproduced failure: sensor route attempted before a scan remained at 0/4 and displayed scan-first feedback.
- Completed all four optional lab puzzles through actual UI buttons: sensors lanes 2,1,3,2; motors forward/left/right; controller eight-step route; closed battery-return circuit.
- Result: 4/4 parts and 400 XP, completion dialog rendered. Reload after the first earned controller retained 1/4 and 100 XP. Browser warning/error log empty at that checkpoint.
- Independent functional integration review: no confirmed defect; 18 tests passed after high-score persistence additions. Native keyboard/touch arcade QA remains pending.

## 2026-10-28 — action arcade and Netlify direction
- User explicitly requested more game-like, fun play, then public hosting on their Netlify account.
- Added four real-time missions with keyboard/touch driving, scrapbot enemies, health, scanner/turbo/freeze/shield specials, pickups, combo scoring, return-to-dock wins, upgrades, and browser-local high scores. Puzzle labs remain optional.
- Browser proof: scanner mission completed through actual movement and scans with moving enemies; collected all 4 chips, docked with 2 hearts, received final score 980, claimed component. Reload retained 1/4 parts and 100 XP; replay start displayed YOUR BEST 980. Power mission collected a cell, shielded, and charged a station in real play. All four complete routes also pass deterministic rules tests.
- Phone regression test `phone_start_button_fits_game_overlay`: at 390x844, initial start CTA was clipped inside the arena overlay. Fixed ready/win/loss mobile stage minimum height; fresh DOM measurement returned width=390, bodyWidth=390, startButtonVisible=true. Touch scan and pause passed; browser error/warning log empty.
- Checks after action integration: 32/32 tests pass, 8 ES module source checks pass, git diff --check clean. No physical robot testing applies.
- Hosting: authenticated Netlify CLI was available. It initially inferred an unrelated parent project; every deployment for this task must use the exact newly created game-site ID. Account list confirms slug mdeanh, display Mdean.
- Earlier Sites registration is unpublished and is superseded by the user's explicit Netlify request. Do not publish it.

## 2026-10-28 — pre-publication functional review
- Snapshot: bfca549. Independent reviewer reran 32 passing tests and found no confirmed functional defect in spatial win gates, claim deduplication, pause, new-player startup, and cleanup.
- Copy adjustment: motor upgrade now says FASTER WHEELS, matching the actual cross-mission speed increase; the motor mission still provides a turbo special.
- Public Netlify game site created in account mdeanh: site ID 52fa8bfb-3b0f-4627-94c4-be935970fb69; final site name mdeanh-robotics-workshop. Deployment next.

## 2026-10-28 — public Netlify publication
- Production deploy returned success: 6ae2891847d4efdc963f5a03, site 52fa8bfb-3b0f-4627-94c4-be935970fb69, https://mdeanh-robotics-workshop.netlify.app.
- Anonymous HTTP homepage: 200, game title present, no login redirect. All 16 files in local dist matched live SHA-256 values exactly.
- Opened public site in browser. Fresh-player start screen, live driving, scanner reveal, and pause verified; browser error/warning log empty. Screenshot saved in ignored output/netlify-arcade.jpg.
- Netlify reference lookup correction: local CLI method is listAccountsForUser (not listAccounts); getSiteDeploy requires both site_id and deploy_id. No secrets read or saved.

## 2026-10-28 — compact laptop arena layout
- Public screenshot at 1280x720 exposed health HUD clipping after canvas focus. Updated desktop dialog width based on available screen height and compacted its surrounding controls. Mobile rules remain unchanged.
- Source checks and git diff whitespace check pass; runtime/game rules are unchanged from the 32-test passing build. Publishing the layout fix, then measuring the public dialog.

## 2026-10-28 — final public layout verification
- Final deploy: 6ae289b8b05a2208ace788a2 at https://mdeanh-robotics-workshop.netlify.app.
- Public browser at 1280x720: dialog clientHeight=671, scrollHeight=671, health HUD top=121.17. Entire health/arena/goal interface fits with no internal scrolling. Live movement and scan passed after reload.
- Final action screenshot: output/netlify-arcade-final.jpg. Public tab retained as deliverable; viewport override reset and isolated QA tab closed.

## 2026-10-28 — preserve concurrent starter changes
- PR reported conflicts because main advanced to 6049fda (starter lesson/arcade improvements and separate Netlify hosting).
- Merged main into codex/pixel-workshop, preserved its updated root index.html, retained its README/config as reference artifacts, and resolved workshop publish path to dist/. No change to remote main or the separately hosted starter.
- Removed machine-local .netlify/state.json from tracked source; preserved ignored local binding to workshop site 52fa8bfb-3b0f-4627-94c4-be935970fb69. Explicit deployment ID remains required. Rechecked source and functional harness after merge.

## 2026-10-28 — contemporary game direction
- User instruction: Create a current game, not retro. This supersedes the prior visual direction.
- Implementation: real Three.js 3D arena and studio rover; smooth vector fallback, modern HUD/menus/icons, pointer steering plus keyboard/touch, contemporary sound envelope. Missions, success rules, IDs, save key and saved progress stay compatible.
- Archived first-concept raster/font assets under baseline/retro-assets; no longer included in the deployable game. Direct file:// launch now redirects to the live game because browser ES modules need an HTTP origin.
- Three.js pinned package and source are being verified against official npm metadata; no actual robot or hardware capability is asserted by this illustrative game.
- Initial browser/source verification pending renderer integration.

## 2026-10-28 — modernization integration regression
- Browser initialization failed at app.js navigation binding: lab-tab did not exist after a copy rename. No modules or preview initialized.
- Recorded red test: lab_navigation_bindings_match_real_document_or_panel_elements failed with missing lab-tab (exit 1). Corrected binding to preserved workshop-tab ID; named contract test passes. Source model tests were unaffected, demonstrating why browser integration is necessary.

## 2026-10-28 — latest Luka app as the visual reference
- User asked to base this on the most recent Luka app. Consulted status-gated wiki luka-web and a2-remote-ipad-app; those are dated source records, with hardware/model claims carrying their documented limits.
- Most recent user-referenced browser app found in today's Codex chat Review site for A2 Ultra training: https://luka.steadwell.cc (Steadwell · Luka A2 Ultra Cockpit), repository agr-labs/luka-cockpit, pushed 2026-10-28T13:25:49Z.
- Inspected its live UI and presentation CSS only. Observed black three-column cockpit, central color-coded humanoid, compact dark panels, thin borders, teal/blue/amber system colors, system typography, mono labels. Did not use any hardware or robot controls.
- Adapting the game to those presentation ideas. Gameplay remains an educational simulation with no robot connection.
- Reviewed AGR Labs MIT LICENSE and third-party NOTICE. Public A2 T2D0 visual model is distributed under Mulan PSL v2; fetched its model/mesh pack and included license/notice. This is an estimated visual model, not physically calibrated to Luka. No joint recordings, camera, mapping, or live telemetry are copied.
- Retro version remains at immutable public deploy https://6ae289b8b05a2208ace788a2--mdeanh-robotics-workshop.netlify.app/ (HTTP 200, retro title checked).

## 2026-10-28 — correct the reference to the user's owned projects
- User explicitly rejected the Steadwell reference and requested checking their own Netlify and GitHub projects. Stopped further changes while identifying those projects.
- Live Netlify account inventory confirms user's Luka site: luka-a2, site f4805163-24ad-4369-a52a-bd1f925ae591, latest published 2026-10-23T06:26:29Z. Public frontend index.html, app.css, and figure.js match the local /Users/friday/Claude/code/luka-web/site/public bytes exactly.
- Correct reference is Luka · Remote View: #0b0d10 background, #14171c cards, blue #5aa9ff accent, system typography, tab strip, two-column figure/status layout, and neutral gray humanoid. Earlier Steadwell styling is superseded and is not used as the product reference.
- GitHub checked directly: MDeanH/luka-a2-ultra-model main 9490d0a (public estimated T2D0/Mulan assets), plus separate private luka-a2-ultra-ipad-data metadata/README. The latter says onboard/iPad meshes lack redistribution licensing; those private assets are not copied or published.
- Public game geometry stays an estimated A2 teaching visual with its license/provenance, never physical Luka calibration or control. Correct owned-site styling and model presentation are now being applied.

## 2026-10-28 — modern gameplay and visual checks
- Actual WebGL initialized in browser (DOM renderer=webgl). Completed the four-checkpoint humanoid mission via held WASD and pulse, returning to dock with score 1380 and 3/4 integrity. Upgrade claim button was fully inside the overlay at 1280x720. Existing sensor upgrade and 980 best score carried over.
- Gray public A2 hub model loaded all 47 drawable meshes (DOM data-visual=luka-estimated-a2); no browser warnings/errors in the fresh corrected-reference tab.
- Laptop arena: dialog clientHeight=662, scrollHeight=662, Start fully visible; input and turbo exercised in actual 3D scene. Hub at1280px had no horizontal overflow.
- Visual regression: expanding torus pulse had tube/radius 1.5/1 and became a filled white disk. Changed tube/radius to .008/1 (thin ring); decorative pulse hidden for reduced-motion preference. Gameplay rules unchanged.
- Source and asset/model contracts: 39 tests pass before the final visual adjustment; full ES module checks pass. No hardware test or model calibration is claimed.
