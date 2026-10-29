import test from 'node:test';
import assert from 'node:assert/strict';
import { ARENA, createArcadeState, startArcade, pauseArcade, tickArcade, jumpArcade } from '../dist/arcade-model.js';

const playing = () => { const state = createArcadeState('motors'); state.enemies = []; startArcade(state); return state; };
const step = (state, frames, input = {}) => { for (let i = 0; i < frames; i++) tickArcade(state, input, .02); };

test('adventure jump requires grounded play, cannot double jump, and returns to the floor', () => {
  const state = createArcadeState('motors');
  assert.equal(jumpArcade(state), false);
  startArcade(state); state.enemies = [];
  assert.equal(jumpArcade(state), true);
  assert.equal(jumpArcade(state), false);
  step(state, 20);
  assert.ok(state.player.elevation > 60 && state.player.elevation < 70);
  assert.equal(state.player.grounded, false);
  pauseArcade(state);
  const atPause = { ...state.player };
  assert.equal(jumpArcade(state), false);
  step(state, 50, { x: 1, sprint: true });
  assert.deepEqual(state.player, atPause);
  pauseArcade(state);
  step(state, 35);
  assert.equal(state.player.elevation, 0);
  assert.equal(state.player.verticalVelocity, 0);
  assert.equal(state.player.grounded, true);
  assert.equal(jumpArcade(state), true);
});

test('jumping reaches a bench, lands on its top, and walking off falls back to the floor', () => {
  const state = playing();
  state.player.x = 210; state.player.y = 180;
  jumpArcade(state);
  step(state, 32, { x: 1 });
  assert.ok(state.player.x > 270, 'jump clears the side collision');
  step(state, 20);
  assert.equal(state.player.elevation, 32, 'feet land on the solid bench top');
  assert.equal(state.player.grounded, true);
  const onBench = state.player.x;
  step(state, 65, { x: 1 });
  assert.ok(state.player.x > onBench + 100, 'a grounded avatar can walk off the bench');
  assert.equal(state.player.elevation, 0);
  assert.equal(state.player.grounded, true);
});

test('sprint increases travel while preserving diagonal normalization and solid boundaries', () => {
  const walk = playing(), sprint = playing(), diagonal = playing();
  step(walk, 10, { x: 1 });
  step(sprint, 10, { x: 1, sprint: true });
  step(diagonal, 10, { x: 1, y: -1, sprint: true });
  assert.ok(sprint.player.x - 100 > (walk.player.x - 100) * 1.4);
  assert.ok(Math.abs(Math.hypot(diagonal.player.x - 100, diagonal.player.y - 450) - (sprint.player.x - 100)) < .001);
  step(sprint, 300, { x: 1, sprint: true });
  assert.ok(sprint.player.x <= ARENA.width - 38 - sprint.player.radius);
  tickArcade(sprint, {}, .02);
  assert.equal(sprint.player.sprinting, false);
});

test('a high jump clears a training rover while ground contact still costs integrity', () => {
  const state = playing();
  jumpArcade(state); step(state, 20);
  state.enemies = [{ x: state.player.x, y: state.player.y, radius: 15, stunned: 0, phase: 0 }];
  tickArcade(state, {}, 0);
  assert.equal(state.health, 4);
  step(state, 35);
  state.invulnerable = 0;
  state.enemies[0].x = state.player.x; state.enemies[0].y = state.player.y;
  const health = state.health;
  tickArcade(state, {}, 0);
  assert.equal(state.health, health - 1);
});

test('returning above the home dock does not finish until the avatar lands', () => {
  const state = playing();
  for (const target of state.targets) { state.player.x = target.x; state.player.y = target.y; tickArcade(state, {}, 0); }
  assert.equal(state.collected, 4);
  state.player.x = ARENA.dock.x; state.player.y = ARENA.dock.y;
  jumpArcade(state); step(state, 20);
  assert.equal(state.mode, 'playing');
  step(state, 30);
  assert.equal(state.mode, 'won');
  assert.ok(state.player.elevation < 5);
});
