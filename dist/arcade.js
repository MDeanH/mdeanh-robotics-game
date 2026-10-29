import { ARENA, BENCHES, ARCADE_MISSIONS, createArcadeState, startArcade, pauseArcade, tickArcade, activateAbility, jumpArcade, missionProgress, objectiveComplete, claimArcadeReward } from './arcade-model.js';
import { createArenaRenderer } from './scene3d.js';
import { createVectorRenderer } from './arena2d.js';
import { partIcon } from './icons.js';

const missionNumber = id => String(['sensors', 'motors', 'controllers', 'power'].indexOf(id) + 1).padStart(2, '0');
const distanceTo = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Navigation follows the same outstanding objectives that gate mission completion. */
export function getNavigationObjective(state) {
  if (objectiveComplete(state)) return { ...ARENA.dock, label: 'Home dock', kind: 'dock' };
  let choices;
  if (state.id === 'power' && state.carrying) choices = state.stations.filter(station => !station.charged).map(station => ({ ...station, label: 'Charging station', kind: 'station' }));
  else if (state.id === 'controllers') choices = state.targets.filter(target => !target.taken && target.index === state.collected).map(target => ({ ...target, label: `Checkpoint ${target.index + 1}`, kind: 'checkpoint' }));
  else choices = state.targets.filter(target => !target.taken).map(target => ({ ...target, label: state.id === 'sensors' ? target.revealed ? 'Sensor component' : 'Scan this area' : state.id === 'power' ? 'Energy cell' : 'Actuator component', kind: 'component' }));
  return choices.reduce((nearest, point) => !nearest || distanceTo(point, state.player) < distanceTo(nearest, state.player) ? point : nearest, null);
}

/** Third-person action adventure. All movement is a classroom game simulation. */
export function mountArcade(id, container, { onComplete = () => {}, playSound = () => {}, unlockedParts = [], bestScore = 0 } = {}) {
  const mission = ARCADE_MISSIONS[id];
  if (!mission) throw new Error(`Unknown robotics mission: ${id}`);
  let state = createArcadeState(id, unlockedParts);
  let inputEngaged = false;
  let disposed = false, awardSent = false, frameId, previousTime = 0, overlayMode = '', lastMessage = '', lastProgress = '', lastMapTime = -1;
  let particles = [], floaters = [], nudge = null, lookPointer = null, touchSprinting = false;
  const keys = new Set();
  const pressedPointers = new Map();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

  container.innerHTML = `<section class="arcade-shell adventure-shell" aria-label="${mission.title} third-person adventure">
    <div class="arcade-stage"><canvas class="arcade-canvas" width="1280" height="720" tabindex="0" aria-label="Third-person 3D adventure. W A S D or arrows move relative to the camera. Space jumps. E uses ${mission.special.toLowerCase()}. Shift sprints. Drag to look, or hold Q and R to turn the camera. P pauses.">Your browser needs graphics support to display this game.</canvas><div class="adventure-vignette" aria-hidden="true"></div><div class="arcade-overlay"></div></div>
    <div class="arcade-hud"><div class="arcade-health-block"><small>Integrity</small><strong class="arcade-health" aria-label="${state.health} hearts remaining"></strong></div><div class="arcade-score-block"><small>Score</small><strong class="arcade-score">0</strong></div><div class="arcade-combo" aria-label="Combo multiplier">Explore the lab</div><button class="arcade-pause-button" type="button" aria-label="Pause game" data-action="pause">Ⅱ <span>Pause</span></button></div>
    <div class="adventure-objective"><span class="adventure-mission-tag">Field trial ${missionNumber(id)}</span><span class="arcade-goal" role="status" aria-live="polite"></span><div class="adventure-guidance"><span class="adventure-waypoint-arrow" aria-hidden="true">↑</span><span class="adventure-waypoint-label">Find your next objective</span><span class="adventure-waypoint-range"></span></div></div>
    <div class="adventure-navigation"><div class="adventure-map-title"><span>Navigator</span><span>N ↑</span></div><svg class="adventure-minimap" viewBox="0 0 960 540" role="img" aria-label="Navigation map. Blue is your robot; amber is your next objective; red markers are training bots."><rect x="22" y="28" width="916" height="490" rx="20" class="map-floor"/>${BENCHES.map(bench => `<rect x="${bench.x}" y="${bench.y}" width="${bench.w}" height="${bench.h}" rx="10" class="map-obstacle"/>`).join('')}<circle cx="100" cy="450" r="36" class="map-dock"/>${state.targets.map((target, index) => `<circle class="map-target" data-map-target="${index}" cx="${target.x}" cy="${target.y}" r="13"/>`).join('')}${state.stations.map((station, index) => `<rect class="map-station" data-map-station="${index}" x="${station.x - 14}" y="${station.y - 14}" width="28" height="28" rx="6"/>`).join('')}${state.enemies.map((_, index) => `<circle class="map-enemy" data-map-enemy="${index}" r="12"/>`).join('')}<path class="map-guide-line"/><circle class="map-objective" r="25"/><g class="map-player"><circle r="19"/><path d="M0 -30 13 -7 0 -12 -13 -7Z"/></g></svg><span class="adventure-view-label">Third-person view</span></div>
    <div class="adventure-crosshair" aria-hidden="true"><i></i></div>
    <div class="arcade-mission-bar"><button class="adventure-jump" type="button" data-action="jump" aria-label="Jump"><span>↟</span> Jump <kbd>Space</kbd></button><button class="arcade-special" type="button" data-action="special" aria-label="Use ${mission.special.toLowerCase()}"><span class="arcade-special-icon" aria-hidden="true">${{ sensors: '◎', motors: 'ϟ', controllers: '❄', power: '◇' }[id]}</span><span class="arcade-special-label">${mission.verb}</span><kbd>E</kbd></button><button class="adventure-reset-camera" type="button" data-action="reset-camera" aria-label="Reset camera behind the robot">Reset view</button></div>
    <div class="arcade-touch-controls" aria-label="Touch adventure controls"><div class="arcade-dpad"><button class="arcade-pad-button arcade-pad-up" type="button" data-direction="up" aria-label="Move forward">↑</button><button class="arcade-pad-button arcade-pad-left" type="button" data-direction="left" aria-label="Move left">←</button><button class="arcade-pad-button arcade-pad-down" type="button" data-direction="down" aria-label="Move backward">↓</button><button class="arcade-pad-button arcade-pad-right" type="button" data-direction="right" aria-label="Move right">→</button></div><span class="adventure-touch-look">Drag the world<br>to look around</span><div class="adventure-touch-actions"><button class="adventure-touch-sprint" type="button" data-action="sprint" aria-pressed="false">Sprint</button><div><button class="adventure-touch-jump" type="button" data-action="jump" aria-label="Jump">Jump</button><button class="arcade-touch-special" type="button" data-action="special" aria-label="Use ${mission.special.toLowerCase()}">${mission.verb}</button></div></div></div>
    <p class="arcade-status" role="status" aria-live="polite"></p><div class="arcade-footer"><span><kbd>WASD</kbd> Move <b>·</b> <kbd>Space</kbd> Jump <b>·</b> <kbd>E</kbd> ${mission.verb} <b>·</b> <kbd>Shift</kbd> Sprint <b>·</b> Drag to look <b>·</b> <kbd>Q / R</kbd> Turn view</span><span>Learning simulation</span></div>
  </section>`;
  const shell = container.querySelector('.arcade-shell');
  let canvas = container.querySelector('canvas');
  let renderer;
  try { renderer = createArenaRenderer(canvas, { reducedMotion }); } catch { renderer = null; }
  shell.dataset.renderer = renderer ? 'webgl' : 'vector';
  if (!renderer) { const replacement = canvas.cloneNode(false); canvas.replaceWith(replacement); canvas = replacement; renderer = createVectorRenderer(canvas, { reducedMotion }); }
  if (!renderer) { container.innerHTML = '<p>This browser cannot display the adventure. Close this panel to try the simulation lab.</p>'; return () => {}; }
  const find = selector => container.querySelector(selector);
  const overlay = find('.arcade-overlay'), health = find('.arcade-health'), score = find('.arcade-score'), combo = find('.arcade-combo'), goal = find('.arcade-goal'), status = find('.arcade-status');
  const special = find('.arcade-special'), specialLabel = find('.arcade-special-label'), pauseButton = find('.arcade-pause-button');
  const jumpButtons = [...container.querySelectorAll('[data-action="jump"]')];
  const waypointArrow = find('.adventure-waypoint-arrow'), waypointLabel = find('.adventure-waypoint-label'), waypointRange = find('.adventure-waypoint-range');
  const mapPlayer = find('.map-player'), mapObjective = find('.map-objective'), mapGuide = find('.map-guide-line');
  const mapTargets = [...container.querySelectorAll('[data-map-target]')], mapEnemies = [...container.querySelectorAll('[data-map-enemy]')], mapStations = [...container.querySelectorAll('[data-map-station]')];

  function updateNavigation() {
    const target = getNavigationObjective(state);
    const supplied = renderer.getGuidance?.(state);
    const heading = renderer.getHeading?.() || 0;
    const bearing = supplied?.bearing ?? (target ? Math.atan2(target.x - state.player.x, state.player.y - target.y) + heading : 0);
    const distance = supplied?.distance ?? (target ? distanceTo(target, state.player) : 0);
    waypointArrow.style.transform = `rotate(${bearing}rad)`;
    waypointLabel.textContent = supplied?.label || target?.label || 'Mission complete';
    waypointRange.textContent = target ? distance < 100 ? 'Nearby' : distance > 400 ? 'Across the lab' : 'Keep going' : '';
    if (lastMapTime >= 0 && state.elapsed - lastMapTime < .12) return;
    lastMapTime = state.elapsed;
    const facing = Math.atan2(state.player.dy, state.player.dx) * 180 / Math.PI + 90;
    mapPlayer.setAttribute('transform', `translate(${state.player.x} ${state.player.y}) rotate(${facing})`);
    mapTargets.forEach((marker, index) => { const item = state.targets[index]; marker.setAttribute('opacity', item.taken ? '0' : item.revealed ? '.8' : '.3'); });
    mapEnemies.forEach((marker, index) => { const enemy = state.enemies[index]; marker.setAttribute('cx', enemy.x); marker.setAttribute('cy', enemy.y); marker.setAttribute('opacity', enemy.stunned > 0 ? '.3' : '.8'); });
    mapStations.forEach((marker, index) => { marker.setAttribute('opacity', state.id === 'power' ? '1' : '0'); marker.classList.toggle('map-station-charged', state.stations[index].charged); });
    mapObjective.setAttribute('opacity', target ? '1' : '0');
    mapGuide.setAttribute('opacity', target ? '.5' : '0');
    if (target) { mapObjective.setAttribute('cx', target.x); mapObjective.setAttribute('cy', target.y); mapGuide.setAttribute('d', `M ${state.player.x} ${state.player.y} L ${target.x} ${target.y}`); }
  }

  function updateHud() {
    if (shell.dataset.mode !== state.mode) shell.dataset.mode = state.mode;
    const hearts = '♥'.repeat(state.health) + '♡'.repeat(state.maxHealth - state.health);
    if (health.textContent !== hearts) { health.textContent = hearts; health.setAttribute('aria-label', `${state.health} of ${state.maxHealth} hearts remaining`); }
    score.textContent = state.score.toLocaleString();
    combo.textContent = state.combo > 1 ? `×${state.combo} combo` : state.mode === 'playing' && state.player.sprinting ? 'Sprinting' : state.upgrades.length ? `${state.upgrades.length} ${state.upgrades.length === 1 ? 'upgrade' : 'upgrades'} active` : 'Explore the lab';
    combo.classList.toggle('arcade-combo-hot', state.combo > 1);
    const currentProgress = missionProgress(state);
    if (currentProgress !== lastProgress) { goal.textContent = currentProgress; lastProgress = currentProgress; }
    goal.classList.toggle('arcade-return-goal', objectiveComplete(state));
    const message = state.messageTimer > 0 ? state.message : 'Follow the waypoint. Jump across platforms, dodge training bots, and explore.';
    if (message !== lastMessage) { status.textContent = message; lastMessage = message; }
    special.disabled = state.mode !== 'playing' || state.cooldown > 0;
    specialLabel.textContent = state.cooldown > 0 ? `${Math.ceil(state.cooldown)}s` : mission.verb;
    const pauseLabel = state.mode === 'paused' ? 'Resume' : 'Pause';
    pauseButton.disabled = !['playing', 'paused'].includes(state.mode);
    pauseButton.setAttribute('aria-label', `${pauseLabel} game`);
    if (pauseButton.querySelector('span').textContent !== pauseLabel) pauseButton.querySelector('span').textContent = pauseLabel;
    jumpButtons.forEach(button => { button.disabled = state.mode !== 'playing' || state.player.grounded === false; });
    const sprintButton = find('.adventure-touch-sprint');
    sprintButton.setAttribute('aria-pressed', String(touchSprinting));
    sprintButton.classList.toggle('adventure-sprint-active', touchSprinting);
    updateNavigation();
  }

  function setOverlay() {
    if (overlayMode === state.mode) return;
    overlayMode = state.mode;
    overlay.hidden = state.mode === 'playing';
    if (state.mode === 'playing') { overlay.innerHTML = ''; return; }
    if (state.mode === 'paused') {
      overlay.innerHTML = '<div class="arcade-overlay-card arcade-small-card"><span class="arcade-eyebrow">Adventure paused</span><h3>Take a moment.</h3><p>Your mission is right where you left it.</p><button class="arcade-main-button" type="button" data-action="resume">Resume adventure <span aria-hidden="true">→</span></button><button class="arcade-plain-button" type="button" data-action="reset-camera">Reset camera behind Luka</button><button class="arcade-plain-button" type="button" data-action="restart">Restart this mission</button></div>';
    } else if (state.mode === 'lost') {
      overlay.innerHTML = `<div class="arcade-overlay-card arcade-small-card"><span class="arcade-eyebrow">Ready for another attempt?</span><div class="arcade-hero-robot">${partIcon('robot')}</div><h3>Let’s try that again.</h3><p>The training bots caught up. Restart with full integrity and keep your mission abilities ready.</p><div class="arcade-final-score"><small>This run</small><strong>${state.score.toLocaleString()}</strong></div><button class="arcade-main-button" type="button" data-action="restart">Restart adventure <span aria-hidden="true">↻</span></button><small>Jump to get past trouble. Sprint to open up some space.</small></div>`;
    } else if (state.mode === 'won') {
      overlay.innerHTML = `<div class="arcade-overlay-card arcade-win-card"><span class="arcade-eyebrow">Mission accomplished</span><div class="arcade-hero-robot">${partIcon('robot')}</div><h3>System online.</h3><div class="arcade-final-score"><small>Final score · includes ${state.health * 100} integrity bonus</small><strong>${state.score.toLocaleString()}</strong></div><p>${mission.lesson}</p><div class="arcade-earned">Upgrade unlocked <strong>${mission.part}</strong></div><button class="arcade-main-button" type="button" data-action="collect">Install upgrade <span aria-hidden="true">→</span></button><button class="arcade-plain-button" type="button" data-action="restart">Play again</button></div>`;
    }
    overlay.querySelector('button')?.focus({ preventScroll: true });
  }

  function releaseCapture(element, id) { try { if (element.hasPointerCapture?.(id)) element.releasePointerCapture(id); } catch { /* A pointer can already have been cancelled by the browser. */ } }
  function clearInput() {
    keys.clear(); nudge = null; touchSprinting = false; canvas.classList.remove('adventure-looking');
    if (lookPointer) releaseCapture(canvas, lookPointer.id);
    lookPointer = null;
    for (const [pointerId, pointer] of pressedPointers) releaseCapture(pointer.button, pointerId);
    pressedPointers.clear();
    state.navigationTarget = null;
    shell.querySelectorAll('.arcade-pad-pressed').forEach(button => button.classList.remove('arcade-pad-pressed'));
  }
  function resume() { if (state.mode === 'paused') { inputEngaged = true; pauseArcade(state); clearInput(); setOverlay(); canvas.focus({ preventScroll: true }); } }
  function restart() { state = createArcadeState(id, unlockedParts); inputEngaged = true; particles = []; floaters = []; lastMapTime = -1; clearInput(); renderer.resetCamera?.(); overlayMode = ''; startArcade(state); setOverlay(); canvas.focus({ preventScroll: true }); playSound('click'); }
  function doSpecial() { inputEngaged = true; if (activateAbility(state)) playSound('click'); }
  function doJump() { inputEngaged = true; if (jumpArcade(state)) playSound('jump'); }
  function togglePause() { if (pauseArcade(state)) { inputEngaged = true; clearInput(); setOverlay(); if (state.mode === 'playing') canvas.focus({ preventScroll: true }); } }

  function onClick(event) {
    const button = event.target.closest('button');
    if (!button || !shell.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'resume') resume();
    else if (action === 'restart') restart();
    else if (action === 'pause') togglePause();
    else if (action === 'special') doSpecial();
    else if (action === 'jump') doJump();
    else if (action === 'sprint' && state.mode === 'playing') { inputEngaged = true; touchSprinting = !touchSprinting; }
    else if (action === 'reset-camera') { inputEngaged = true; renderer.resetCamera?.(); }
    else if (action === 'collect' && !awardSent && claimArcadeReward(state)) { awardSent = true; onComplete(id, { score: state.score }); }
    else if (button.dataset.direction && event.detail === 0 && state.mode === 'playing') {
      inputEngaged = true;
      const [x, y] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[button.dataset.direction];
      nudge = { x, y, remaining: .17 };
    }
  }
  const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'];
  function onKeyDown(event) {
    if (disposed) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === 'p' && !event.repeat && ['playing', 'paused'].includes(state.mode)) { event.preventDefault(); togglePause(); return; }
    if (state.mode !== 'playing') return;
    if (movementKeys.includes(key) || ['Shift', 'q', 'r'].includes(key)) { inputEngaged = true; event.preventDefault(); keys.add(key); }
    if (key === ' ' && event.target.closest?.('button')) return;
    if (key === ' ' && !event.repeat) { event.preventDefault(); doJump(); }
    if (key === 'e' && !event.repeat) { event.preventDefault(); doSpecial(); }
  }
  function onKeyUp(event) { keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key); }
  function onPointerDown(event) {
    if (state.mode !== 'playing') return;
    if (event.target === canvas) {
      if (lookPointer) return;
      inputEngaged = true;
      event.preventDefault(); canvas.focus({ preventScroll: true });
      lookPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add('adventure-looking');
      return;
    }
    const button = event.target.closest('[data-direction]');
    if (!button) return;
    inputEngaged = true;
    event.preventDefault(); pressedPointers.set(event.pointerId, { direction: button.dataset.direction, button });
    button.classList.add('arcade-pad-pressed'); button.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (lookPointer?.id !== event.pointerId || state.mode !== 'playing') return;
    renderer.rotateCamera?.(event.clientX - lookPointer.x, event.clientY - lookPointer.y);
    lookPointer.x = event.clientX; lookPointer.y = event.clientY;
  }
  function onPointerUp(event) {
    if (lookPointer?.id === event.pointerId) { releaseCapture(canvas, event.pointerId); lookPointer = null; canvas.classList.remove('adventure-looking'); }
    const pointer = pressedPointers.get(event.pointerId);
    if (pointer) { pointer.button.classList.remove('arcade-pad-pressed'); releaseCapture(pointer.button, event.pointerId); }
    pressedPointers.delete(event.pointerId);
  }
  function autoPause() { if (inputEngaged && state.mode === 'playing') { pauseArcade(state); clearInput(); canvas.classList.remove('adventure-looking'); setOverlay(); } }
  function onVisibility() { if (document.hidden) autoPause(); }
  shell.addEventListener('click', onClick); shell.addEventListener('keydown', onKeyDown);
  shell.addEventListener('pointerdown', onPointerDown); shell.addEventListener('pointermove', onPointerMove); shell.addEventListener('pointerup', onPointerUp); shell.addEventListener('pointercancel', onPointerUp); shell.addEventListener('lostpointercapture', onPointerUp);
  window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', autoPause); document.addEventListener('visibilitychange', onVisibility);

  function processEvents() {
    for (const event of state.events.splice(0)) {
      if (['pickup', 'deliver', 'stun', 'hurt'].includes(event.type)) {
        playSound(event.type === 'hurt' ? 'click' : 'pickup');
        floaters.push({ ...event, life: 1.1, color: event.type === 'hurt' ? '#f3b8af' : '#d5edff' });
        if (!reducedMotion) for (let i = 0; i < 12; i++) { const angle = i * Math.PI / 6; particles.push({ x: event.x, y: event.y, vx: Math.cos(angle) * (35 + i * 3), vy: Math.sin(angle) * 60 - 20, size: 3 + i % 3, life: .45, color: event.type === 'hurt' ? '#e79483' : ['#7dc4ff', '#e1efff', '#86d2bc'][i % 3] }); }
      }
      if (event.type === 'win') playSound('success');
    }
  }
  function animate(timestamp) {
    if (disposed) return;
    const dt = previousTime ? Math.min(.04, Math.max(0, (timestamp - previousTime) / 1000)) : 0; previousTime = timestamp;
    const directions = new Set([...pressedPointers.values()].map(pointer => pointer.direction));
    let x = (keys.has('ArrowRight') || keys.has('d') || directions.has('right') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('a') || directions.has('left') ? 1 : 0);
    let y = (keys.has('ArrowDown') || keys.has('s') || directions.has('down') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('w') || directions.has('up') ? 1 : 0);
    if (nudge) { x += nudge.x; y += nudge.y; nudge.remaining -= dt; if (nudge.remaining <= 0) nudge = null; }
    if (state.mode === 'playing') renderer.rotateCamera?.(((keys.has('r') ? 1 : 0) - (keys.has('q') ? 1 : 0)) * 300 * dt, 0);
    const worldMove = renderer.moveInput?.(x, y) || { x, y };
    if (inputEngaged) tickArcade(state, { ...worldMove, sprint: keys.has('Shift') || touchSprinting }, dt);
    processEvents();
    if (state.mode === 'playing') {
      for (const particle of particles) { particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 90 * dt; }
      particles = particles.filter(particle => particle.life > 0);
      for (const floater of floaters) { floater.life -= dt; if (!reducedMotion) floater.y -= 32 * dt; }
      floaters = floaters.filter(floater => floater.life > 0);
    }
    updateHud(); renderer.render(state, particles, floaters); setOverlay(); frameId = requestAnimationFrame(animate);
  }
  // Show the character immediately, with no title popup or automatic sound.
  // Hazards wait until the player uses a control.
  startArcade(state);
  updateHud(); renderer.render(state, particles, floaters); setOverlay(); frameId = requestAnimationFrame(animate);
  return () => {
    disposed = true; clearInput(); cancelAnimationFrame(frameId); renderer.dispose();
    shell.removeEventListener('click', onClick); shell.removeEventListener('keydown', onKeyDown);
    shell.removeEventListener('pointerdown', onPointerDown); shell.removeEventListener('pointermove', onPointerMove); shell.removeEventListener('pointerup', onPointerUp); shell.removeEventListener('pointercancel', onPointerUp); shell.removeEventListener('lostpointercapture', onPointerUp);
    window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', autoPause); document.removeEventListener('visibilitychange', onVisibility);
  };
}
