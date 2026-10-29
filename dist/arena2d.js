import { ARENA, BENCHES, objectiveComplete } from './arcade-model.js';

// A smooth vector renderer keeps the game playable on devices without WebGL.
export function createVectorRenderer(canvas, { reducedMotion = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let disposed = false;
  function round(x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function circle(x, y, r, fill, stroke) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function label(value, x, y, size = 12, fill = '#53647a') {
    ctx.font = `600 ${size}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = fill; ctx.fillText(value, x, y);
  }
  function rover(body, state, enemy = false) {
    ctx.save(); ctx.translate(body.x, body.y);
    if (!enemy) ctx.rotate(Math.atan2(body.dy, body.dx) + Math.PI / 2);
    if (enemy && body.stunned > 0) ctx.globalAlpha = .5;
    ctx.shadowColor = '#0b183035'; ctx.shadowBlur = 13; ctx.shadowOffsetY = 7;
    round(-23, -15, 12, 36, 6, '#1d2b40'); round(11, -15, 12, 36, 6, '#1d2b40');
    const bodyFill = ctx.createLinearGradient(-14, -24, 16, 21);
    bodyFill.addColorStop(0, enemy ? '#ffb199' : '#ffffff'); bodyFill.addColorStop(1, enemy ? '#e95f52' : '#d7e2ec');
    round(-16, -25, 32, 48, 13, bodyFill, enemy ? '#da655e' : '#a7b8c9');
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    round(-13, -14, 26, 15, 7, '#182b41');
    circle(-6, -7, 3.4, enemy ? '#fff0c9' : '#54e9cb'); circle(6, -7, 3.4, enemy ? '#fff0c9' : '#54e9cb');
    round(-7, 8, 14, 4, 2, enemy ? '#9f3e42' : '#26bda1');
    if (!enemy && state.carrying) round(-11, 16, 22, 14, 4, '#99f0c0', '#2a9f7a');
    ctx.restore();
    if (!enemy && state.shield > 0) circle(body.x, body.y, 35, '#54dfc527', '#52cdb0');
    if (enemy && body.stunned > 0) label('Paused', body.x, body.y - 34, 10, '#cc6559');
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round((bounds.width || 960) * ratio), height = Math.round((bounds.height || 540) * ratio);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  }
  function render(state, particles = [], floaters = []) {
    if (disposed) return;
    resize(); ctx.setTransform(canvas.width / ARENA.width, 0, 0, canvas.height / ARENA.height, 0, 0);
    const backdrop = ctx.createLinearGradient(0, 0, 960, 540); backdrop.addColorStop(0, '#edf4fa'); backdrop.addColorStop(1, '#c8d7e5');
    ctx.fillStyle = backdrop; ctx.fillRect(0, 0, 960, 540);
    round(25, 38, 910, 481, 23, '#e5edf3', '#bdcddd');
    ctx.save(); ctx.beginPath(); ctx.roundRect(25, 38, 910, 481, 23); ctx.clip();
    ctx.strokeStyle = '#c7d5e144'; ctx.lineWidth = 1;
    for (let x = 40; x < 940; x += 40) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 520); ctx.stroke(); }
    for (let y = 40; y < 520; y += 40) { ctx.beginPath(); ctx.moveTo(25, y); ctx.lineTo(935, y); ctx.stroke(); }
    ctx.restore();
    round(48, 399, 104, 101, 20, objectiveComplete(state) ? '#3ddcba33' : '#bccdd844', '#40bfa5');
    circle(100, 450, 30, '#8be3cc33', '#4bbca4'); label(objectiveComplete(state) ? 'RETURN' : 'HOME', 100, 455, 12, '#328575');
    label('ROBOTICS LAB · TRAINING ARENA', 480, 25, 12, '#718498');
    for (const bench of BENCHES) {
      ctx.shadowColor = '#223b5127'; ctx.shadowBlur = 17; ctx.shadowOffsetY = 8;
      round(bench.x, bench.y, bench.w, bench.h, 11, '#60758a', '#445b71');
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      round(bench.x + 7, bench.y + 5, bench.w - 14, bench.h - 15, 8, '#f7fbff');
      round(bench.x + 18, bench.y + 11, 45, 18, 5, '#b8e6e0');
      circle(bench.x + bench.w - 19, bench.y + 17, 5, '#f6ab79');
    }
    if (state.id === 'power') for (const [index, station] of state.stations.entries()) {
      round(station.x - 21, station.y - 22, 42, 44, 11, station.charged ? '#c4efdf' : '#b4c6d7', station.charged ? '#3cb28d' : '#94acc3');
      label(station.charged ? '✓' : '⚡', station.x, station.y + 6, 20, station.charged ? '#259b76' : '#637f9a');
      label(`Station ${index + 1}`, station.x, station.y + 37, 10);
    }
    for (const spark of state.sparks) if (!spark.taken) {
      circle(spark.x, spark.y, 7, '#ffbd5540'); circle(spark.x, spark.y, 3, '#e7a232');
    }
    for (const target of state.targets) {
      if (target.taken) continue;
      const bob = reducedMotion ? 0 : Math.sin(state.elapsed * 3 + target.index) * 3;
      const y = target.y + bob;
      if (!target.revealed) { circle(target.x, y, 11, '#6697bb15', '#96b3c3'); label('?', target.x, y + 4, 11, '#7597ad'); continue; }
      ctx.shadowColor = '#35bfa34d'; ctx.shadowBlur = 16;
      circle(target.x, y, 22, '#52bcb81a');
      round(target.x - 14, y - 14, 28, 28, 8, state.id === 'motors' ? '#ffb86b' : '#53c8b8', '#ffffff');
      ctx.shadowBlur = 0;
      label(state.id === 'controllers' ? String(target.index + 1) : state.id === 'power' ? 'ϟ' : state.id === 'motors' ? '⚙' : '◎', target.x, y + 6, 17, '#fff');
    }
    for (const enemy of state.enemies) rover(enemy, state, true);
    rover(state.player, state);
    if (state.pulse > 0) { ctx.globalAlpha = state.pulse / .65; circle(state.player.x, state.player.y, (1 - state.pulse / .65) * state.scanRange, null, '#39c2ad'); ctx.globalAlpha = 1; }
    if (state.navigationTarget) { circle(state.navigationTarget.x, state.navigationTarget.y, 8, null, '#6b86e2'); }
    for (const particle of particles) circle(particle.x, particle.y, particle.size / 2, particle.color);
    for (const floater of floaters) { ctx.globalAlpha = Math.min(1, floater.life); label(floater.text, floater.x, floater.y, 14, '#245c81'); } ctx.globalAlpha = 1;
  }
  return { render, dispose() { disposed = true; }, pointOnFloor(clientX, clientY) { const bounds = canvas.getBoundingClientRect(); return { x: (clientX - bounds.left) / bounds.width * 960, y: (clientY - bounds.top) / bounds.height * 540 }; } };
}
