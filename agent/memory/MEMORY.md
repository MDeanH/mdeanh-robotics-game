# Durable project facts
- User requested a repository named mdeanh Robotics game and a retro game teaching robot parts.
- User selected student arcade challenges about sensors, motors, controllers, power, then selected visual concept 2 (Pixel Workshop), 2026-10-28.
- Source is buildless browser JavaScript. The workshop is illustrative; no hardware capability is being asserted.
- Current state and open decisions: `handoff.md`.

- User requested a more fun, game-like experience: real-time driving, scrapbots, pickups, special abilities, combos, upgrades, hearts, and high scores implemented.
- User explicitly requested PUBLIC Netlify hosting. Earlier private Sites registration remains unpublished and is superseded.
- Existing GitHub main contains another concurrent starter; preserved root index.html and main history; workshop changes are on codex/pixel-workshop.
- Artwork provenance: docs/artwork.md. Browser proof and phone regression: docs/browser-qa.md.

- 2026-10-28: user explicitly changed direction to a current/modern game, not retro. Earlier pixel choice is historical. Modern 3D game replaces that visual style, preserving gameplay and saves. Prior artwork/font assets are archived in baseline/retro-assets.

- User corrected the reference: use their own Netlify/GitHub projects, not Steadwell. Verified user-owned Luka Remote View at https://luka-a2.netlify.app; live index.html, app.css, figure.js match /Users/friday/Claude/code/luka-web/site/public bytes. User public model repo is MDeanH/luka-a2-ultra-model (9490d0a); private iPad data repo is separate and its onboard model is not licensed for redistribution.

- Latest user directive: every new game gets its own new Netlify site/link containing codex. Preserve old games and URLs. Retro is kept in games/retro and at both mdeanh-robotics-workshop.netlify.app and mdeanh-codex-retro.netlify.app. The third-person game is separate at mdeanh-codex-luka-3d.netlify.app; docs/game-sites.json is the source/site map.

- 2026-10-28: user wants the3D game to open directly on the character, without a startup popup. Hazards wait for first control input; controls are available immediately.
