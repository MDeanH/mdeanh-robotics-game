import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA, createArcadeState, startArcade, tickArcade, activateAbility, claimArcadeReward,
} from '../dist/arcade-model.js';
import {
  STORAGE_KEY, freshProgress, loadProgress, saveProgress, awardPart, recordScore, progressXP,
} from '../dist/progress.js';

// Integration contract for the visual replacement. Spatial positions are controlled
// directly here; real input, WebGL rendering, and layout are browser-only checks.
function finishMission(id, unlockedParts) {
  const state = createArcadeState(id, unlockedParts);
  state.enemies = [];
  startArcade(state);
  for (const [index, target] of state.targets.entries()) {
    state.player.x = target.x;
    state.player.y = target.y;
    if (id === 'sensors') { state.cooldown = 0; activateAbility(state); }
    tickArcade(state, {}, 1 / 60);
    if (id === 'power') {
      state.player.x = state.stations[index].x;
      state.player.y = state.stations[index].y;
      tickArcade(state, {}, 1 / 60);
    }
  }
  state.player.x = ARENA.dock.x;
  state.player.y = ARENA.dock.y;
  tickArcade(state, {}, 1 / 60);
  assert.equal(state.mode, 'won');
  return state;
}

test('modern presentation keeps campaign rewards, replay scores, and next-mission upgrades connected', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  let progress = freshProgress();

  for (const [index, id] of ['motors', 'sensors', 'controllers', 'power'].entries()) {
    const state = finishMission(id, progress.completed);
    assert.equal(claimArcadeReward(state), true);
    progress = recordScore(awardPart(progress, id), id, state.score);
    assert.equal(saveProgress(progress, storage), true);
    progress = loadProgress(storage).progress;
    assert.equal(progressXP(progress), (index + 1) * 100);
    assert.ok(progress.bestScores[id] > 0);

    // The earned upgrade must feed the same model used by the modern renderer.
    const next = createArcadeState('motors', progress.completed);
    assert.deepEqual(new Set(next.upgrades), new Set(progress.completed));
    if (progress.completed.includes('motors')) assert.equal(next.speed, 216);
    if (progress.completed.includes('power')) assert.equal(next.maxHealth, 5);
    assert.equal(claimArcadeReward(state), false);
  }

  const replay = finishMission('sensors', progress.completed);
  assert.equal(claimArcadeReward(replay), true);
  const replayProgress = recordScore(awardPart(progress, 'sensors'), 'sensors', replay.score + 1000);
  assert.equal(progressXP(replayProgress), 400);
  assert.equal(replayProgress.bestScores.sensors, replay.score + 1000);
  assert.ok(memory.has(STORAGE_KEY));
});

test('a saved workshop robot loads into the modern arena with every earned ability intact', () => {
  const legacySave = '{"version":1,"completed":["sensors","motors","controllers","power"],"selected":"power","bestScores":{"sensors":980}}';
  const loaded = loadProgress({ getItem: key => key === STORAGE_KEY ? legacySave : null });
  assert.equal(loaded.available, true);
  assert.equal(loaded.progress.selected, 'power');
  assert.equal(loaded.progress.bestScores.sensors, 980);
  const state = createArcadeState(loaded.progress.selected, loaded.progress.completed);
  assert.equal(state.id, 'power');
  assert.equal(state.speed, 216);
  assert.equal(state.scanRange, 365);
  assert.equal(state.cooldownFactor, 0.7);
  assert.equal(state.maxHealth, 5);
  assert.equal(progressXP(loaded.progress), 400);
});
