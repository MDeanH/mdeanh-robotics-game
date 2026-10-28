import test from 'node:test';
import assert from 'node:assert/strict';
import { PART_IDS, STORAGE_KEY, freshProgress, parseProgress, loadProgress, saveProgress, awardPart, progressXP, recordScore } from '../dist/progress.js';

test('each real part awards once and the fourth completes a 400 XP build', () => {
  let state = freshProgress();
  for (const [index, id] of PART_IDS.entries()) {
    state = awardPart(state, id);
    assert.equal(state.completed.length, index + 1);
    assert.equal(progressXP(state), (index + 1) * 100);
    const replay = awardPart(state, id);
    assert.equal(replay, state);
  }
  assert.equal(progressXP(state), 400);
});
test('unknown component cannot earn XP or mutate existing progress', () => {
  const state = freshProgress();
  assert.equal(awardPart(state, 'unearned'), state);
  assert.deepEqual(state.completed, []);
});
test('saved progress round trips and restores the selected mission', () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  const state = { ...awardPart(freshProgress(), 'sensors'), selected: 'motors' };
  assert.equal(saveProgress(state, storage), true);
  assert.deepEqual(loadProgress(storage), { progress: state, available: true });
  assert.ok(memory.has(STORAGE_KEY));
});
test('duplicate or unknown saved parts cannot inflate XP', () => {
  const state = parseProgress('{"version":1,"completed":["power","power","robot"],"selected":"fake","xp":9999}');
  assert.deepEqual(state.completed, ['power']);
  assert.equal(state.selected, 'sensors');
  assert.equal(progressXP(state), 100);
});
test('invalid, truncated or future saved progress starts a fresh playable session', () => {
  for (const raw of [null, '', '{', 'null', '[]', '{"version":2,"completed":[]}', '{"version":1,"completed":42}']) assert.deepEqual(parseProgress(raw), freshProgress());
});
test('unavailable storage leaves the session playable', () => {
  const blocked = { getItem() { throw new Error('unavailable'); }, setItem() { throw new Error('unavailable'); } };
  const loaded = loadProgress(blocked);
  assert.deepEqual(loaded, { progress: freshProgress(), available: false });
  const earned = awardPart(loaded.progress, 'sensors');
  assert.equal(progressXP(earned), 100);
  assert.equal(saveProgress(earned, blocked), false);
  assert.equal(saveProgress(earned, null), false);
});
test('replaying a mission improves best score without adding XP', () => {
  const state = recordScore(awardPart(freshProgress(), 'sensors'), 'sensors', 1200);
  const replay = recordScore(awardPart(state, 'sensors'), 'sensors', 1600);
  assert.equal(progressXP(replay), 100);
  assert.equal(replay.bestScores.sensors, 1600);
  assert.equal(recordScore(replay, 'sensors', 500), replay);
  assert.equal(state.bestScores.sensors, 1200);
});
test('best scores persist with malformed values discarded', () => {
  const raw = JSON.stringify({ version: 1, completed: [], selected: 'motors', bestScores: { sensors: 500, motors: -1, controllers: null, power: '1000', other: 999 } });
  assert.deepEqual(parseProgress(raw).bestScores, { sensors: 500 });
  assert.equal(recordScore(freshProgress(), 'sensors', Infinity).bestScores.sensors, undefined);
});
