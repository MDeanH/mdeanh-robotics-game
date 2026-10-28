# Browser QA — 2026-10-28

Software verification only. No physical robot is connected.

## Real playthrough
- Sensor arcade: four scans/collections around the map using held WASD keys; enemies cause health loss; return to dock required. Win at 980 points with two hearts. Claim then reload: 1/4 components, 100 XP; sensor replay shows best score 980.
- Power arcade: use shield, collect a cell, deliver to an uncharged station; HUD changes to 1/3 stations online.
- All four optional Tinker lab puzzles completed with native browser UI; final 4/4, 400 XP completion displayed.
- Pause/resume and independent local saves checked. Browser warning/error log empty at checked milestones.

## Regression: phone_start_button_fits_game_overlay
At 390x844, open a mission. Its Start button must fit completely in `.arcade-overlay` and the page must not horizontally overflow. The original 16:10 overlay clipped the CTA below its scroll area. The repaired ready/win/loss stage gives the overlay enough height.

Observed after repair: `clientWidth=390`, `body.scrollWidth=390`, Start bounds within overlay: `true`. Touch direction hold, scanner button, and pause accepted. Viewport override reset after testing.

## Automated counterpart
`npm test`: deterministic success/failure rules for all four arcade missions and lab puzzles, replay deduplication, storage recovery, upgrades, score persistence. Browser-only layout checks above complement these tests.
