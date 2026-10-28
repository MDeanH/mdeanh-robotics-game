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
