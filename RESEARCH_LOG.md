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
