# Build-a-Bot Lab — mdeanh Robotics

A retro, 8-bit style browser game that teaches **the six core hardware parts of a robot** to college students with no robotics background. About 15–20 minutes per playthrough.

## Play

**Live:** https://mdeanh-robotics-game.netlify.app

Or open `index.html` in any modern browser (desktop or phone). No install or build step.

```bash
python3 -m http.server 8765
```
then visit http://localhost:8765.

## How it works

You drive **BOLT**, a robot that starts as a bare circuit board. Each level, you collect the parts for one system, return to the workbench, read a short lesson, and answer two questions to install the part. Every installed part gives BOLT a new in-game ability, so students *feel* what the part does:

| Level | Part | Role | Ability unlocked |
|---|---|---|---|
| 1 | Chassis | skeleton | +2 HP (armor) |
| 2 | Actuators (motors) | muscles | faster driving |
| 3 | Power | energy supply | SPACE boost + energy bar |
| 4 | Sensors | senses | see far through the dark lab |
| 5 | Controller | brain | arrow points to the next target |
| 6 | End effector | hands | grab parts from a distance |
| 7 | Field Test | everything together | final 4-question inspection |

Glitches (red) chase you; get hit too often and the level restarts. Lessons stay unlocked in the **Parts Manual** for review.

Controls: arrows / WASD to drive, SPACE boost, P pause, M sound, 1–4 answer quizzes. Touch controls appear on phones.

## Project layout

Single file: `index.html` (HTML + CSS + JS, no dependencies besides two Google Fonts). Lesson and quiz content lives in the `LEVELS` array at the top of the script; edit it to change what is taught.
