import test from 'node:test';
import assert from 'node:assert/strict';
import { SENSOR_ROUNDS, checkSensorRoute, wheelMotion, checkMotorTarget, runProgram, INITIAL_POWER_TILES, tileConnections, rotatePowerTile, isPowerCircuitClosed } from '../dist/model.js';
import { mountChallenge } from '../dist/game.js';

test('sensor progression requires a scan and the actual clear lane', () => {
  assert.equal(checkSensorRoute(0, 1, false).ok, false);
  assert.equal(checkSensorRoute(0, 0, true).ok, false);
  assert.equal(checkSensorRoute(0, 1, true).ok, true);
  assert.equal(checkSensorRoute(0, 1, true).complete, false);
  assert.equal(checkSensorRoute(3, 1, true).complete, true);
  assert.equal(checkSensorRoute(4, 1, true).ok, false);
  assert.equal(checkSensorRoute(0, -1, true).ok, false);
  assert.equal(checkSensorRoute(0, '1', true).ok, false);
  for (let round = 0; round < SENSOR_ROUNDS.length; round++) assert.equal(SENSOR_ROUNDS[round].filter(d => d >= 60).length, 1);
});

test('differential drive distinguishes straight travel, reverse, turns, and stop', () => {
  assert.equal(wheelMotion(1, 1), 'forward');
  assert.equal(wheelMotion(-1, -1), 'reverse');
  assert.equal(wheelMotion(0, 1), 'left');
  assert.equal(wheelMotion(1, 0), 'right');
  assert.equal(wheelMotion(-1, 1), 'left');
  assert.equal(wheelMotion(1, -1), 'right');
  assert.equal(wheelMotion(0, 0), 'stop');
  assert.equal(wheelMotion(2, 1), 'invalid');
  assert.equal(checkMotorTarget(0, 1, 0).ok, false);
  assert.equal(checkMotorTarget(0, 1, 1).ok, true);
  assert.equal(checkMotorTarget(2, 1, 0).complete, true);
  assert.equal(checkMotorTarget(3, 1, 0).ok, false);
});

test('controller executes a real route to the star', () => {
  const result = runProgram(['F', 'F', 'F', 'R', 'F', 'F', 'F', 'F']);
  assert.equal(result.success, true);
  assert.deepEqual(result.position, { x: 4, y: 0, direction: 1 });
  assert.equal(result.trace.length, 9);
});

test('controller rejects obstacles, edges, empty and unknown programs', () => {
  assert.equal(runProgram(['R', 'F']).success, false);
  assert.match(runProgram(['R', 'F']).reason, /obstacle/);
  assert.equal(runProgram(['F', 'F', 'F', 'F']).success, false);
  assert.equal(runProgram([]).success, false);
  assert.equal(runProgram(['F']).success, false);
  assert.equal(runProgram(['teleport']).success, false);
  assert.equal(runProgram(Array(21).fill('L')).success, false);
});

function solvedTiles() {
  const rotations = [0, 1, 2, 0, 0, 1, 0, 0];
  return INITIAL_POWER_TILES.map((tile, index) => ({ ...tile, rotation: rotations[index] }));
}

test('power requires a complete battery-load-return loop', () => {
  assert.equal(isPowerCircuitClosed(INITIAL_POWER_TILES), false);
  assert.equal(isPowerCircuitClosed(solvedTiles()), true);
  for (const index of [1, 2, 3, 5, 6, 7]) assert.equal(isPowerCircuitClosed(rotatePowerTile(solvedTiles(), index)), false, `wire ${index} must not leave a broken circuit accepted`);
  assert.equal(isPowerCircuitClosed(solvedTiles().slice(1)), false);
  assert.equal(isPowerCircuitClosed(solvedTiles().map(t => t.kind === 'motor' ? { ...t, kind: 'wire' } : t)), false);
});

test('tile rotation is immutable and fixed components stay fixed', () => {
  const before = JSON.stringify(INITIAL_POWER_TILES);
  const after = rotatePowerTile(INITIAL_POWER_TILES, 1);
  assert.equal(after[1].rotation, 1);
  assert.equal(JSON.stringify(INITIAL_POWER_TILES), before);
  assert.equal(rotatePowerTile(after, 0)[0].rotation, 0);
  assert.deepEqual(tileConnections(after[1]).sort(), [1, 3]);
});

// Synthetic events exercise the actual challenge handlers, not browser layout,
// DOM parsing, focus behavior, or screen-reader output. Browser QA is separate.
function challengeEventHarness(id, activeElement) {
  let listener = null;
  let awards = 0;
  const container = {
    innerHTML: '',
    contains: element => element !== activeElement,
    querySelector: () => ({ focus() {} }),
    addEventListener(type, handler) { if (type === 'click') listener = handler; },
    removeEventListener(type, handler) { if (type === 'click' && listener === handler) listener = null; },
  };
  const cleanup = mountChallenge(id, container, { onComplete: completedId => { assert.equal(completedId, id); awards += 1; } });
  return {
    container,
    cleanup,
    click(action, extra = {}) {
      const button = { dataset: { action, ...extra } };
      listener?.({ target: { closest: () => button } });
    },
    get awards() { return awards; },
    get listenerAttached() { return listener !== null; },
  };
}

const solveThroughEvents = {
  sensors(harness) {
    for (const lane of [1, 0, 2, 1]) {
      harness.click('scan');
      harness.click('drive', { lane: String(lane) });
    }
  },
  motors(harness) {
    for (const [left, right] of [[1, 1], [0, 1], [1, 0]]) {
      harness.click('wheel', { wheel: 'Left', speed: String(left) });
      harness.click('wheel', { wheel: 'Right', speed: String(right) });
      harness.click('test-motors');
    }
  },
  controllers(harness) {
    for (const command of ['F', 'F', 'F', 'R', 'F', 'F', 'F', 'F']) harness.click('command', { command });
    harness.click('run');
  },
  power(harness) {
    for (const [index, count] of [[1, 1], [2, 2], [3, 1], [5, 1], [6, 3], [7, 1]]) {
      for (let turn = 0; turn < count; turn += 1) harness.click('rotate', { index: String(index) });
    }
    harness.click('test-power');
  },
};

for (const [id, solve] of Object.entries(solveThroughEvents)) {
  test(`synthetic events: ${id} completes, rejects premature claims, awards once, and cleans up`, () => {
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const activeElement = { dataset: {} };
    let harness;
    Object.defineProperty(globalThis, 'document', { configurable: true, writable: true, value: { activeElement } });
    try {
      harness = challengeEventHarness(id, activeElement);
      assert.equal(harness.listenerAttached, true);
      harness.click('claim');
      assert.equal(harness.awards, 0, 'claim before actual success must not award a part');
      solve(harness);
      assert.match(harness.container.innerHTML, /CHALLENGE COMPLETE/);
      assert.equal(harness.awards, 0, 'success must wait for the earned-part claim');
      harness.click('claim');
      harness.click('claim');
      assert.equal(harness.awards, 1, 'repeated claim events must invoke completion only once');
      harness.cleanup();
      assert.equal(harness.listenerAttached, false, 'cleanup must remove the actual registered listener');
      harness.click('claim');
      assert.equal(harness.awards, 1, 'events after cleanup must not invoke completion');
    } finally {
      harness?.cleanup();
      if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
      else delete globalThis.document;
    }
  });
}
