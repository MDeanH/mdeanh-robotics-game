import { ARENA, ARCADE_MISSIONS, createArcadeState, startArcade, pauseArcade, tickArcade, activateAbility, missionProgress, objectiveComplete, claimArcadeReward } from './arcade-model.js';

import { createArenaRenderer } from './scene3d.js';
import { createVectorRenderer } from './arena2d.js';
import { partIcon } from './icons.js';

const robotBadge = partIcon('robot');
const missionNumber = id => String(['sensors', 'motors', 'controllers', 'power'].indexOf(id) + 1).padStart(2, '0');

/** Animated workshop arcade; all coordinates and rules are browser simulations. */
export function mountArcade(id, container, { onComplete = () => {}, playSound = () => {}, unlockedParts = [], bestScore = 0 } = {}) {
  const mission = ARCADE_MISSIONS[id];
  if (!mission) throw new Error(`Unknown arcade mission: ${id}`);
  let state = createArcadeState(id, unlockedParts);
  let disposed = false;
  let awardSent = false;
  let frameId;
  let previousTime = 0;
  let overlayMode = '';
  let lastMessage = '';
  let lastProgress = '';
  let particles = [];
  let floaters = [];
  let nudge = null;
  let arenaPointerId = null;
  const keys = new Set();
  const pressedPointers = new Map();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

  container.innerHTML = `<section class="arcade-shell" aria-label="${mission.title} action game">
    <div class="arcade-hud"><div class="arcade-health-block"><small>Integrity</small><strong class="arcade-health" aria-label="${state.health} hearts remaining"></strong></div><div class="arcade-score-block"><small>Score</small><strong class="arcade-score">00000</strong></div><div class="arcade-combo" aria-label="Combo multiplier">Launch mission</div><button class="arcade-pause-button" type="button" aria-label="Pause game" data-action="pause">Ⅱ <span>Pause</span></button></div>
    <div class="arcade-stage"><canvas class="arcade-canvas" width="960" height="540" tabindex="0" aria-label="3D training arena. Move with arrow keys or W A S D. Space uses ${mission.special.toLowerCase()}. P pauses. Touch controls are below.">Your browser needs graphics support to display this game.</canvas><div class="arcade-overlay"></div><div class="arcade-bubble" aria-hidden="true"></div></div>
    <div class="arcade-mission-bar"><span class="arcade-goal" role="status" aria-live="polite"></span><button class="arcade-special" type="button" data-action="special" aria-label="Use ${mission.special.toLowerCase()}"><span class="arcade-special-icon" aria-hidden="true">${{ sensors: '◎', motors: 'ϟ', controllers: '❄', power: '◇' }[id]}</span><span class="arcade-special-label">${mission.verb}</span><kbd>SPACE</kbd></button></div>
    <div class="arcade-touch-controls" aria-label="Touch movement controls"><div class="arcade-dpad"><button class="arcade-pad-button arcade-pad-up" type="button" data-direction="up" aria-label="Move up">↑</button><button class="arcade-pad-button arcade-pad-left" type="button" data-direction="left" aria-label="Move left">←</button><button class="arcade-pad-button arcade-pad-down" type="button" data-direction="down" aria-label="Move down">↓</button><button class="arcade-pad-button arcade-pad-right" type="button" data-direction="right" aria-label="Move right">→</button></div><span>Move your robot.<br>Tap ${mission.verb.toLowerCase()} for your special.</span><button class="arcade-touch-special" type="button" data-action="special" aria-label="Use ${mission.special.toLowerCase()}">${mission.verb}</button></div>
    <p class="arcade-status" role="status" aria-live="polite"></p><div class="arcade-footer"><span><kbd>WASD</kbd> / <kbd>↑ ← ↓ →</kbd> MOVE <b>·</b> <kbd>SPACE</kbd> ${mission.verb} <b>·</b> <kbd>P</kbd> Pause</span><span>Interactive learning model</span></div>
  </section>`;
  const shell = container.querySelector('.arcade-shell');
  let canvas = container.querySelector('canvas');
  let renderer;
  try { renderer = createArenaRenderer(canvas, { reducedMotion }); } catch { renderer = null; }
  shell.dataset.renderer = renderer ? 'webgl' : 'vector';
  if (!renderer) {
    const replacement = canvas.cloneNode(false);
    canvas.replaceWith(replacement); canvas = replacement;
    renderer = createVectorRenderer(canvas, { reducedMotion });
  }
  if (!renderer) { container.innerHTML = '<p>This browser cannot display the arena. Close this panel to try the simulation lab.</p>'; return () => {}; }
  const overlay = container.querySelector('.arcade-overlay');
  const health = container.querySelector('.arcade-health');
  const score = container.querySelector('.arcade-score');
  const combo = container.querySelector('.arcade-combo');
  const goal = container.querySelector('.arcade-goal');
  const status = container.querySelector('.arcade-status');
  const special = container.querySelector('.arcade-special');
  const specialLabel = container.querySelector('.arcade-special-label');
  const pauseButton = container.querySelector('.arcade-pause-button');

  function updateHud() {
    if (shell.dataset.mode !== state.mode) shell.dataset.mode = state.mode;
    const hearts = '♥'.repeat(state.health) + '♡'.repeat(state.maxHealth - state.health);
    if (health.textContent !== hearts) { health.textContent = hearts; health.setAttribute('aria-label', `${state.health} of ${state.maxHealth} hearts remaining`); }
    score.textContent = String(state.score).toLocaleString();
    combo.textContent = state.combo > 1 ? `×${state.combo} COMBO!` : state.upgrades.length ? `${state.upgrades.length} ${state.upgrades.length === 1 ? 'upgrade' : 'upgrades'} active` : 'Ready to explore';
    combo.classList.toggle('arcade-combo-hot', state.combo > 1);
    const currentProgress = missionProgress(state);
    if (currentProgress !== lastProgress) { goal.textContent = currentProgress; lastProgress = currentProgress; }
    goal.classList.toggle('arcade-return-goal', objectiveComplete(state));
    const message = state.messageTimer > 0 ? state.message : 'Collect sparks for bonus points. Keep moving and watch the scrapbots!';
    if (message !== lastMessage) { status.textContent = message; lastMessage = message; }
    special.disabled = state.mode !== 'playing' || state.cooldown > 0;
    specialLabel.textContent = state.cooldown > 0 ? `${Math.ceil(state.cooldown)}s` : mission.verb;
    special.style.setProperty('--arcade-ready', state.cooldown > 0 ? '0' : '1');
    pauseButton.disabled = !['playing', 'paused'].includes(state.mode);
    pauseButton.setAttribute('aria-label', state.mode === 'paused' ? 'Resume game' : 'Pause game');
    const pauseText = pauseButton.querySelector('span');
    const pauseLabel = state.mode === 'paused' ? 'Resume' : 'Pause';
    if (pauseText.textContent !== pauseLabel) pauseText.textContent = pauseLabel;
  }

  function setOverlay() {
    if (overlayMode === state.mode) return;
    overlayMode = state.mode;
    overlay.hidden = state.mode === 'playing';
    if (state.mode === 'playing') { overlay.innerHTML = ''; return; }
    const controls = `<div class="arcade-start-controls"><span><kbd>↑ ← ↓ →</kbd><small>MOVE</small></span><span><kbd>SPACE</kbd><small>${mission.verb}</small></span><span><kbd>P</kbd><small>Pause</small></span></div>`;
    if (state.mode === 'ready') {
      const upgradeNames = { motors: 'FASTER WHEELS', sensors: 'WIDE SCANNER', controllers: 'QUICKER SPECIAL', power: 'EXTRA HEART' };
      overlay.innerHTML = `<div class="arcade-overlay-card"><span class="arcade-eyebrow">Field trial / Mission ${missionNumber(id)}</span><div class="arcade-hero-robot">${robotBadge}</div><h3>${mission.title}</h3><p>${mission.instruction}</p>${controls}${state.upgrades.length ? `<div class="arcade-upgrade-list">${state.upgrades.map(part => `<span>+ ${upgradeNames[part]}</span>`).join('')}</div>` : ''}<button class="arcade-main-button" type="button" data-action="start">Launch mission <span aria-hidden="true">▶</span></button><small>${bestScore ? `Personal best ${Number(bestScore).toLocaleString()} · ` : ''}Explore at your own pace.</small></div>`;
    } else if (state.mode === 'paused') {
      overlay.innerHTML = `<div class="arcade-overlay-card arcade-small-card"><span class="arcade-eyebrow">Mission paused</span><h3>Take a moment.</h3><p>Your mission is right where you left it.</p><button class="arcade-main-button" type="button" data-action="resume">Resume mission <span aria-hidden="true">▶</span></button><button class="arcade-plain-button" type="button" data-action="restart">Restart this mission</button></div>`;
    } else if (state.mode === 'lost') {
      overlay.innerHTML = `<div class="arcade-overlay-card arcade-small-card"><span class="arcade-eyebrow">Ready for another attempt?</span><div class="arcade-hero-robot">${robotBadge}</div><h3>Let’s try that again.</h3><p>The training bots caught up. You can restart with full integrity.</p><div class="arcade-final-score"><small>This run</small><strong>${state.score.toLocaleString()}</strong></div><button class="arcade-main-button" type="button" data-action="restart">Restart mission <span aria-hidden="true">↻</span></button><small>Tip: keep moving. Your special can get you out of trouble.</small></div>`;
    } else if (state.mode === 'won') {
      overlay.innerHTML = `<div class="arcade-overlay-card arcade-win-card"><span class="arcade-eyebrow">Mission accomplished</span><div class="arcade-hero-robot">${robotBadge}</div><h3>System online.</h3><div class="arcade-final-score"><small>Final score · includes ${state.health * 100} integrity bonus</small><strong>${state.score.toLocaleString()}</strong></div><p>${mission.lesson}</p><div class="arcade-earned">Upgrade unlocked <strong>${mission.part}</strong></div><button class="arcade-main-button" type="button" data-action="collect">Install upgrade <span aria-hidden="true">→</span></button><button class="arcade-plain-button" type="button" data-action="restart">Play again</button></div>`;
    }
    overlay.querySelector('button')?.focus({ preventScroll: true });
  }

  function clearInput() { keys.clear(); pressedPointers.clear(); nudge = null; arenaPointerId = null; state.navigationTarget = null; shell.querySelectorAll('.arcade-pad-pressed').forEach(button => button.classList.remove('arcade-pad-pressed')); }
  function begin() { if (startArcade(state)) { playSound('click'); clearInput(); setOverlay(); canvas.focus({ preventScroll: true }); } }
  function resume() { if (state.mode === 'paused') { pauseArcade(state); clearInput(); setOverlay(); canvas.focus({ preventScroll: true }); } }
  function restart() { state = createArcadeState(id, unlockedParts); particles = []; floaters = []; clearInput(); overlayMode = ''; startArcade(state); setOverlay(); canvas.focus({ preventScroll: true }); playSound('click'); }
  function doSpecial() { if (activateAbility(state)) playSound('click'); }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button || !shell.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'start') begin();
    else if (action === 'resume') resume();
    else if (action === 'restart') restart();
    else if (action === 'pause') { if (pauseArcade(state)) { clearInput(); setOverlay(); if (state.mode === 'playing') canvas.focus({ preventScroll: true }); } }
    else if (action === 'special') doSpecial();
    else if (action === 'collect' && !awardSent && claimArcadeReward(state)) { awardSent = true; onComplete(id, { score: state.score }); }
    else if (button.dataset.direction && event.detail === 0) {
      const [x, y] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[button.dataset.direction];
      nudge = { x, y, remaining: 0.17 };
    }
  }

  const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];
  function onKeyDown(event) {
    if (disposed) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === 'p' && !event.repeat && ['playing', 'paused'].includes(state.mode)) { event.preventDefault(); pauseArcade(state); clearInput(); setOverlay(); if (state.mode === 'playing') canvas.focus({ preventScroll: true }); return; }
    if (state.mode !== 'playing') return;
    if (movementKeys.includes(key)) { event.preventDefault(); keys.add(key); }
    // Let native buttons handle Space once; the canvas uses it for the special.
    if (key === ' ' && event.target.closest?.('button')) return;
    if (key === ' ' && !event.repeat) { event.preventDefault(); doSpecial(); }
  }
  function onKeyUp(event) { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; keys.delete(key); }
  function onPointerDown(event) {
    if (event.target === canvas && state.mode === 'playing') {
      event.preventDefault(); canvas.focus({ preventScroll: true });
      arenaPointerId = event.pointerId;
      state.navigationTarget = renderer.pointOnFloor?.(event.clientX, event.clientY);
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }
    const button = event.target.closest('[data-direction]');
    if (!button || state.mode !== 'playing') return;
    event.preventDefault();
    pressedPointers.set(event.pointerId, button.dataset.direction);
    button.classList.add('arcade-pad-pressed');
    button.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (event.pointerId === arenaPointerId && state.mode === 'playing') state.navigationTarget = renderer.pointOnFloor?.(event.clientX, event.clientY);
  }
  function onPointerUp(event) {
    if (event.pointerId === arenaPointerId) { arenaPointerId = null; state.navigationTarget = null; }
    const direction = pressedPointers.get(event.pointerId);
    if (direction) shell.querySelector(`[data-direction="${direction}"]`)?.classList.remove('arcade-pad-pressed');
    pressedPointers.delete(event.pointerId);
  }
  function autoPause() { if (state.mode === 'playing') { pauseArcade(state); clearInput(); setOverlay(); } }
  function onVisibility() { if (document.hidden) autoPause(); }
  shell.addEventListener('click', onClick);
  shell.addEventListener('keydown', onKeyDown);
  shell.addEventListener('pointerdown', onPointerDown);
  shell.addEventListener('pointermove', onPointerMove);
  shell.addEventListener('pointerup', onPointerUp);
  shell.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', autoPause);
  document.addEventListener('visibilitychange', onVisibility);

  function drawWorld() { renderer.render(state, particles, floaters); }

  function processEvents() {
    for (const event of state.events.splice(0)) {
      if (event.type === 'pickup' || event.type === 'deliver' || event.type === 'stun' || event.type === 'hurt') {
        playSound(event.type === 'hurt' ? 'click' : 'pickup');
        floaters.push({ ...event, life: 1.1, color: event.type === 'hurt' ? '#ffe4c2' : '#fff1b4' });
        if (!reducedMotion) for (let i = 0; i < 12; i++) { const angle = i * Math.PI / 6; particles.push({ x: event.x, y: event.y, vx: Math.cos(angle) * (35 + i * 3), vy: Math.sin(angle) * 60 - 20, size: 3 + i % 3, life: .45, color: event.type === 'hurt' ? '#ec8863' : ['#f7d071', '#eaf2b5', '#6bbd9f'][i % 3] }); }
      }
      if (event.type === 'win') playSound('success');
    }
  }

  function animate(timestamp) {
    if (disposed) return;
    const dt = previousTime ? Math.min(.04, Math.max(0, (timestamp - previousTime) / 1000)) : 0;
    previousTime = timestamp;
    const directions = new Set(pressedPointers.values());
    let x = (keys.has('ArrowRight') || keys.has('d') || directions.has('right') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('a') || directions.has('left') ? 1 : 0);
    let y = (keys.has('ArrowDown') || keys.has('s') || directions.has('down') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('w') || directions.has('up') ? 1 : 0);
    if (state.navigationTarget && !x && !y) {
      const dx = state.navigationTarget.x - state.player.x, dy = state.navigationTarget.y - state.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 7) { x = dx / distance; y = dy / distance; }
    }
    if (nudge) { x += nudge.x; y += nudge.y; nudge.remaining -= dt; if (nudge.remaining <= 0) nudge = null; }
    tickArcade(state, { x, y }, dt);
    processEvents();
    if (state.mode === 'playing') {
      for (const particle of particles) { particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 90 * dt; }
      particles = particles.filter(particle => particle.life > 0);
      for (const floater of floaters) { floater.life -= dt; if (!reducedMotion) floater.y -= 32 * dt; }
      floaters = floaters.filter(floater => floater.life > 0);
    }
    updateHud(); drawWorld(); setOverlay();
    frameId = requestAnimationFrame(animate);
  }

  updateHud(); drawWorld(); setOverlay();
  frameId = requestAnimationFrame(animate);
  return () => {
    disposed = true; clearInput(); cancelAnimationFrame(frameId);
    shell.removeEventListener('click', onClick); shell.removeEventListener('keydown', onKeyDown);
    renderer.dispose();
    shell.removeEventListener('pointermove', onPointerMove);
    shell.removeEventListener('pointerdown', onPointerDown); shell.removeEventListener('pointerup', onPointerUp); shell.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', autoPause); document.removeEventListener('visibilitychange', onVisibility);
  };
}
