# Handoff — mdeanh Robotics game
Updated 2026-10-28. Browser game is implemented and locally verified. Public Netlify deployment is being finalized.

## Product and decisions
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
GitHub repository MDeanH/mdeanh-robotics-game already existed, created by a concurrent workflow. Work is on codex/pixel-workshop; preserve main and its starter. PR and branch push pending. Netlify site ID 52fa8bfb-3b0f-4627-94c4-be935970fb69, account slug mdeanh. Use this exact site ID for deployments; CLI originally inferred an unrelated parent project. Local .netlify state is ignored. Earlier Sites registration is unpublished; reference in docs/unpublished-sites-registration.json, never publish it.

## Commands
npm start — localhost preview on 4173.
npm test — rules + progress harness.
npm run check — ES modules and local assets.
netlify deploy --site 52fa8bfb-3b0f-4627-94c4-be935970fb69 --dir dist --no-build --prod — authorized public deploy.

## Open decisions
Exact student grade band, extended curriculum, more robots, teacher reporting. Defaults: beginner language, four modules, no accounts, device-local save.

## Next
Finish public deployment verification and GitHub PR, record live URL. Further product work follows user play feedback.
