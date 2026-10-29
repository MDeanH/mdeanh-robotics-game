# Handoff — mdeanh Robotics game
Updated 2026-10-28. Modernization is in progress: user asked for a current game, not retro. The prior release remains publicly hosted until the modern version passes verification.

## Product and decisions
Current direction, 2026-10-28: contemporary 3D robotics lab with smooth geometry, lighting, modern HUD and controls. This supersedes the earlier pixel-art visual direction below. Preserve all four missions and existing browser saves.

User chose Pixel Workshop concept 2, then requested more fun action and public Netlify hosting. The workshop hub launches four real-time action missions teaching sensors, motors, controllers, and power. WASD/arrows, touch controls, Space specials, enemies, pickups, health, scoring, combos, upgrades, pause/retry. Optional Tinker labs teach sensing, differential wheels, programs, and circuits.

## Architecture
- dist/index.html + style.css: workshop presentation.
- dist/app.js: progress + modal orchestration.
- dist/arcade.js + arcade.css: arcade input and rendering.
- dist/arcade-model.js: action mission rules.
- dist/game.js + model.js + game.css: optional puzzle labs.
- dist/progress.js: local save, XP, high scores.
- dist/content.js: sourced lesson copy; sources in docs/learning-sources.md.
- baseline/index.html: independently runnable parts explorer.
- root index.html: preserved separate GitHub starter, untouched from main.

## Verification
32 automated tests passed; source checks and git diff whitespace checks passed. Actual browser scanner mission completed at score 980, upgrade awarded once, reload retains 100 XP and score. Power collect/shield/delivery exercised. All four optional puzzle labs completed to 400 XP. Phone 390x844 Start-button clipping reproduced and fixed, no horizontal overflow; touch scanning/pause and browser error logs checked. See docs/browser-qa.md. No physical hardware is connected or tested.

## Repository and hosting
GitHub repository MDeanH/mdeanh-robotics-game already existed, created by a concurrent workflow. Work is on codex/pixel-workshop; preserve main and its starter. Branch is pushed. PR: https://github.com/MDeanH/mdeanh-robotics-game/pull/1. Existing main is preserved. Netlify site ID 52fa8bfb-3b0f-4627-94c4-be935970fb69, account slug mdeanh. Use this exact site ID for deployments; CLI originally inferred an unrelated parent project. Local .netlify state is ignored. Earlier Sites registration is unpublished; reference in docs/unpublished-sites-registration.json, never publish it.

## Commands
npm start — localhost preview on 4173.
npm test — rules + progress harness.
npm run check — ES modules and local assets.
netlify deploy --site 52fa8bfb-3b0f-4627-94c4-be935970fb69 --dir dist --no-build --prod — authorized public deploy.

## Open decisions
Exact student grade band, extended curriculum, more robots, teacher reporting. Defaults: beginner language, four modules, no accounts, device-local save.

## Published result
- Public game: https://mdeanh-robotics-workshop.netlify.app
- Netlify deploy: 6ae289b8b05a2208ace788a2. Anonymous homepage HTTP 200; SHA-256 of all 16 deployed files matches local dist. Public browser driving and scanner verified; no warning/error logs.

## Next
Implementation and public hosting request complete. Final laptop layout also verified: dialog client/scroll height both 671 at 1280x720. Further product work follows user play feedback.

## Concurrent source preservation
Merged origin/main at 6049fda into the workshop branch after source conflicts in README and netlify.toml. Root starter index.html includes those recent updates; original README/config retained in docs/original-starter-README.md and baseline/starter-netlify.toml. Workshop deploy stays dist/ and uses its own explicit site ID. Removed tracked machine-local Netlify binding, retaining ignored local state for the workshop. Main and the separately hosted starter are unchanged remotely.
