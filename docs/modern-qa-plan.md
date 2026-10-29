# Modern 3D game verification

The 2026-10-28 user request replaces the visual direction with a contemporary game. The prior retro choice is historical. All results remain browser/software evidence; this project does not connect to or verify a physical robot.

## Automated contracts

Run `npm test` and `npm run check`. The added modern contract tests join the gameplay model to award gating, persistence, replay scores, and the next mission's unlocked abilities. They also load the existing version-1 save into the arena model. They do not claim to test WebGL, real controls, or visual layout.

## Browser checks required before publication

1. Fresh visit: confirm the contemporary robot/lab appears, the start button is visible, and console errors are absent. Verify the arena canvas actually has rendered geometry rather than a CSS background or an old pixel frame.
2. Keyboard: start a mission, hold each movement direction, use Space, pause/resume, and confirm the projected screen direction matches WASD/arrows. Aiming toward a visible object must correspond to its logical collision position.
3. Sensors: approach a hidden chip, scan, collect it, and check the chip disappears from the 3D scene while the DOM objective increments. Return to the dock after all four; claim once, then reload to verify saved progress and score.
4. Motors/controllers/power: exercise each distinct special and objective; charged stations, taken targets, stun/shield states, and carried cells must update when the model changes. Restart a mission to confirm a newly created model state replaces all displayed object state.
5. Phone layout: at 390×844, start/claim buttons, health, objective, and touch controls must remain visible. Check no horizontal overflow. Hold a direction, release it, and verify movement stops. Rotate/rescale to ensure the WebGL backing buffer and camera match the CSS display.
6. Laptop layout: at 1280×720, verify the entire arena and health HUD fit in the dialog, including after canvas focus. Re-run the existing phone/laptop start-button regressions.
7. Lifecycle: close/reopen several missions. Verify no movement continues after close and no duplicate input/sound callbacks appear. While playing, background the tab and return; the mission should pause. Closing the game must dispose its renderer, geometries/materials/textures, resize observer, RAF, and input listeners.
8. Reduced motion: verify decorative robot bobbing/spinning, pulse/particle effects, and camera shake are suppressed while essential movement remains usable.
9. Unsupported WebGL: fail renderer creation in a controlled test. The user must see a clear usable alternative (the Tinker lab or a smooth 2D fallback), with the modal close button working and no component awarded. A hub renderer failure must not prevent mission selection, help, or existing saves from loading.
10. Public result: after Netlify reports successful publication, open the anonymous public URL and verify its modern game. Compare deployed assets with the intended local output. Reset temporary viewport overrides and retain the public game tab as the user-facing deliverable.

## Integration constraints

- A canvas cannot acquire a WebGL context after it has already acquired a 2D context. Remove the old 2D context acquisition on the Three.js path, or use a replacement canvas for fallback.
- Keep `mdeanh-robotics-workshop-v1`, its version, and the four part IDs compatible. Visual modernization must not reset an earned robot.
- Render from the current model passed each frame; restart replaces the state object.
- `processEvents` drains the model event queue. Renderer effects should consume the passed visual-effect data, not assume events remain in `state.events`.
- The camera's projected axes and model XY→world XZ mapping must agree with the controls.

## Status

Plan created before modern browser QA. Specific passed checks belong in the final handoff and research log; this plan alone proves none of them.
