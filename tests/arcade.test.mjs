import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA, ARCADE_MISSIONS, createArcadeState, startArcade, pauseArcade,
  objectiveComplete, missionProgress, activateAbility, damagePlayer,
  tickArcade, claimArcadeReward,
} from '../dist/arcade-model.js';

// These exercise the deterministic simulation, not browser controls or canvas layout.
function playing(id = 'sensors', upgrades = []) {
  const state = createArcadeState(id, upgrades);
  state.enemies = [];
  startArcade(state);
  return state;
}

function visit(state, point) {
  state.player.x = point.x;
  state.player.y = point.y;
  tickArcade(state, {}, 1 / 60);
}

function collectTarget(state, index) {
  const target = state.targets[index];
  state.player.x = target.x;
  state.player.y = target.y;
  if (state.id === 'sensors') {
    state.cooldown = 0;
    activateAbility(state);
  }
  tickArcade(state, {}, 1 / 60);
}

test('arcade requires start, pauses simulation, and resumes without changing progress', () => {
  const state = createArcadeState('sensors');
  tickArcade(state, { x: 1 }, 0.05);
  assert.equal(state.player.x, 100);
  assert.equal(activateAbility(state), false);
  assert.equal(pauseArcade(state), false);
  assert.equal(startArcade(state), true);
  assert.equal(startArcade(state), false);
  assert.equal(pauseArcade(state), true);
  const snapshot = JSON.stringify(state);
  tickArcade(state, { x: 1 }, 0.05);
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(activateAbility(state), false);
  assert.equal(pauseArcade(state), true);
  tickArcade(state, { x: 1 }, 0.05);
  assert.ok(state.player.x > 100);
  assert.equal(state.mode, 'playing');
});

test('movement normalizes diagonal speed, rejects invalid input, and caps long frames', () => {
  const straight = playing();
  const diagonal = playing();
  tickArcade(straight, { x: 1, y: 0 }, 0.05);
  tickArcade(diagonal, { x: 1, y: -1 }, 0.05);
  assert.ok(Math.abs(Math.hypot(diagonal.player.x - 100, diagonal.player.y - 450) - (straight.player.x - 100)) < 1e-9);
  const capped = playing();
  tickArcade(capped, { x: 1, y: NaN }, 100);
  assert.equal(capped.player.x, straight.player.x);
  assert.equal(capped.player.y, 450);
  const before = { ...capped.player };
  tickArcade(capped, { x: Infinity, y: NaN }, -1);
  assert.equal(capped.player.x, before.x);
  assert.equal(capped.player.y, before.y);
});

test('benches and arena edges block spatial movement including turbo', () => {
  const state = playing('motors');
  state.player.x = 210;
  state.player.y = 180;
  for (let i = 0; i < 30; i++) tickArcade(state, { x: 1, y: 0 }, 0.05);
  assert.ok(state.player.x <= 215, 'rover must stop before the bench begins at x=230');
  state.player.dx = 1;
  state.player.dy = 0;
  activateAbility(state);
  for (let i = 0; i < 6; i++) tickArcade(state, { x: 1, y: 0 }, 0.05);
  assert.ok(state.player.x <= 215, 'turbo must not tunnel through the bench');
  state.dash = 0;
  state.player.x = 60;
  state.player.y = 450;
  for (let i = 0; i < 50; i++) tickArcade(state, { x: -1, y: 0 }, 0.05);
  assert.ok(state.player.x >= 38 + state.player.radius);
  assert.ok(state.player.y <= ARENA.height - 30 - state.player.radius);
});

test('sensor chips require a nearby scan before spatial collection', () => {
  const state = playing('sensors');
  visit(state, state.targets[0]);
  assert.equal(state.collected, 0);
  assert.equal(state.targets[0].revealed, false);
  state.player.x = 100;
  state.player.y = 450;
  assert.equal(activateAbility(state), true);
  assert.equal(state.targets[0].revealed, false, 'distant chip must stay hidden');
  assert.equal(state.targets[3].revealed, true, 'chip inside scan radius must be revealed');
  assert.equal(activateAbility(state), false, 'cooldown blocks repeated scans');
  state.cooldown = 0;
  state.player.x = state.targets[0].x;
  state.player.y = state.targets[0].y;
  activateAbility(state);
  tickArcade(state, {}, 1 / 60);
  assert.equal(state.collected, 1);
  const score = state.score;
  tickArcade(state, {}, 1 / 60);
  assert.equal(state.collected, 1, 'standing on a chip must not collect it twice');
  assert.equal(state.score, score);
});

test('controller checkpoints enforce the real sequence and pulse freezes nearby enemies', () => {
  const state = playing('controllers');
  visit(state, state.targets[2]);
  assert.equal(state.collected, 0);
  assert.equal(state.targets[2].taken, false);
  assert.match(missionProgress(state), /Next checkpoint 1/);
  collectTarget(state, 0);
  assert.equal(state.collected, 1);
  visit(state, state.targets[2]);
  assert.equal(state.collected, 1);
  collectTarget(state, 1);
  assert.equal(state.collected, 2);
  state.enemies = [{ x: state.player.x + 50, y: state.player.y, radius: 15, stunned: 0, phase: 0 }];
  activateAbility(state);
  assert.equal(state.enemies[0].stunned, 2.8);
  const enemyPosition = { x: state.enemies[0].x, y: state.enemies[0].y };
  tickArcade(state, {}, 0.05);
  assert.equal(state.enemies[0].x, enemyPosition.x);
  assert.equal(state.enemies[0].y, enemyPosition.y);
});

test('power carries only one cell and requires delivery to three different stations', () => {
  const state = playing('power');
  collectTarget(state, 0);
  assert.equal(state.carrying, true);
  assert.equal(state.collected, 0, 'a collected cell alone is not a charged station');
  visit(state, state.targets[1]);
  assert.equal(state.targets[1].taken, false, 'cannot carry a second cell');
  visit(state, state.stations[0]);
  assert.equal(state.carrying, false);
  assert.equal(state.collected, 1);
  assert.equal(state.stations[0].charged, true);
  collectTarget(state, 1);
  visit(state, state.stations[0]);
  assert.equal(state.carrying, true, 'already charged station must not consume another cell');
  assert.equal(state.collected, 1);
  visit(state, state.stations[1]);
  assert.equal(state.collected, 2);
  collectTarget(state, 2);
  visit(state, state.stations[2]);
  assert.equal(state.collected, 3);
  assert.equal(objectiveComplete(state), true);
  assert.equal(state.mode, 'playing', 'charging stations does not skip the dock objective');
});

for (const id of Object.keys(ARCADE_MISSIONS)) {
  test(`${id} mission wins only after spatial objectives plus returning to dock, then awards once`, () => {
    const state = playing(id);
    assert.equal(claimArcadeReward(state), false);
    visit(state, ARENA.dock);
    assert.equal(state.mode, 'playing');
    for (let index = 0; index < state.targets.length; index++) {
      collectTarget(state, index);
      if (id === 'power') visit(state, state.stations[index]);
    }
    assert.equal(objectiveComplete(state), true);
    assert.equal(state.mode, 'playing');
    assert.equal(claimArcadeReward(state), false, 'objective completion before dock is not a win');
    assert.match(missionProgress(state), /Return to your dock/);
    const beforeBonus = state.score;
    visit(state, ARENA.dock);
    assert.equal(state.mode, 'won');
    assert.equal(state.score, beforeBonus + state.health * 100);
    const final = state.score;
    tickArcade(state, {}, 0.05);
    assert.equal(state.score, final, 'docked bonus is awarded only once');
    assert.equal(claimArcadeReward(state), true);
    assert.equal(claimArcadeReward(state), false);
  });
}

test('damage consumes health once per invulnerability window, resets combo, and can lose', () => {
  const state = playing('sensors');
  state.combo = 3;
  state.comboTimer = 4;
  assert.equal(damagePlayer(state), true);
  assert.equal(state.health, 3);
  assert.equal(state.combo, 0);
  assert.equal(damagePlayer(state), false);
  assert.equal(state.health, 3);
  for (let damage = 0; damage < 3; damage++) { state.invulnerable = 0; damagePlayer(state); }
  assert.equal(state.health, 0);
  assert.equal(state.mode, 'lost');
  assert.equal(damagePlayer(state), false);
  assert.equal(claimArcadeReward(state), false);
});

test('shield and turbo protect from damage; turbo moves faster and stuns a scrapbot', () => {
  const power = playing('power');
  activateAbility(power);
  assert.equal(power.shield, 2.5);
  assert.equal(damagePlayer(power), false);
  const normal = playing('motors');
  const turbo = playing('motors');
  normal.player.y = 280;
  turbo.player.y = 280;
  turbo.player.dx = 1;
  turbo.player.dy = 0;
  assert.equal(activateAbility(turbo), true);
  assert.equal(damagePlayer(turbo), false);
  tickArcade(normal, { x: 1 }, 0.05);
  tickArcade(turbo, { x: 1 }, 0.05);
  assert.ok(turbo.player.x - 100 > 3 * (normal.player.x - 100));
  turbo.enemies = [{ x: turbo.player.x + 28, y: turbo.player.y, radius: 15, stunned: 0, phase: 0 }];
  const score = turbo.score;
  tickArcade(turbo, { x: 1 }, 0.02);
  assert.ok(turbo.enemies[0].stunned > 0);
  assert.ok(turbo.score > score);
  assert.equal(turbo.health, turbo.maxHealth);
});

test('earned upgrades change movement, health, detection, cooldown, and rewards', () => {
  const base = playing('sensors');
  const upgraded = playing('sensors', ['motors', 'power', 'sensors', 'controllers']);
  assert.equal(base.maxHealth, 4);
  assert.equal(upgraded.maxHealth, 5);
  assert.equal(upgraded.health, 5);
  tickArcade(base, { x: 1 }, 0.05);
  tickArcade(upgraded, { x: 1 }, 0.05);
  assert.ok(upgraded.player.x > base.player.x);
  assert.equal(upgraded.scanRange, base.scanRange + 110);
  activateAbility(base);
  activateAbility(upgraded);
  assert.equal(base.targets[0].revealed, false);
  assert.equal(upgraded.targets[0].revealed, true);
  assert.ok(upgraded.cooldown < base.cooldown);
  const baseScore = playing('motors');
  const upgradedScore = playing('motors', ['controllers']);
  visit(baseScore, baseScore.sparks[0]);
  visit(upgradedScore, upgradedScore.sparks[0]);
  assert.equal(baseScore.score, 20);
  assert.equal(upgradedScore.score, 25);
});

test('spark combo rewards consecutive pickups without duplicate farming', () => {
  const state = playing('motors');
  visit(state, state.sparks[0]);
  assert.equal(state.score, 20);
  assert.equal(state.combo, 1);
  visit(state, state.sparks[1]);
  assert.equal(state.score, 60);
  assert.equal(state.combo, 2);
  visit(state, state.sparks[1]);
  assert.equal(state.score, 60);
  state.comboTimer = 0;
  visit(state, state.sparks[2]);
  assert.equal(state.score, 80);
  assert.equal(state.combo, 1);
});
