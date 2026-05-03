/* ============================================================
   moonPhase.js — Accurate moon phase calculator + canvas render
   No API needed — pure astronomy math
   ============================================================ */

const MoonPhase = (() => {

  function calcPhase(date) {
    // Known new moon reference: Jan 6 2000 18:14 UTC
    const knownNew = new Date(Date.UTC(2000, 0, 6, 18, 14));
    const synodicMonth = 29.530588853; // days
    const elapsed = (date - knownNew) / (1000 * 60 * 60 * 24);
    let phase = ((elapsed % synodicMonth) + synodicMonth) % synodicMonth;
    return phase; // 0 = new moon, 14.77 = full moon
  }

  function phaseName(p) {
    const s = p / 29.530588853;
    if (s < 0.033) return 'New Moon';
    if (s < 0.258) return 'Waxing Crescent';
    if (s < 0.292) return 'First Quarter';
    if (s < 0.508) return 'Waxing Gibbous';
    if (s < 0.542) return 'Full Moon';
    if (s < 0.758) return 'Waning Gibbous';
    if (s < 0.792) return 'Last Quarter';
    if (s < 0.966) return 'Waning Crescent';
    return 'New Moon';
  }

  function phaseEmoji(name) {
    const map = {
      'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓',
      'Waxing Gibbous': '🌔', 'Full Moon': '🌕', 'Waning Gibbous': '🌖',
      'Last Quarter': '🌗', 'Waning Crescent': '🌘'
    };
    return map[name] || '🌕';
  }

  function daysToNextFull(phase) {
    const synodic = 29.530588853;
    const fullDay = synodic / 2;
    let diff = fullDay - phase;
    if (diff < 0) diff += synodic;
    return diff.toFixed(1);
  }

  function daysToNextNew(phase) {
    const synodic = 29.530588853;
    let diff = synodic - phase;
    if (diff < 0) diff += synodic;
    return diff.toFixed(1);
  }

  function illumination(phase) {
    // 0 at new, 1 at full
    return ((1 - Math.cos((phase / 29.530588853) * 2 * Math.PI)) / 2 * 100).toFixed(0);
  }

  function drawMoon(canvas, phase) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 6;
    ctx.clearRect(0, 0, size, size);

    const synodic = 29.530588853;
    const angle = (phase / synodic) * Math.PI * 2;
    const isWaxing = phase < synodic / 2;

    // Moon base (dark side)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1f2e';
    ctx.fill();

    // Lit side using clipping + ellipse overlay
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false); // right half
    ctx.closePath();
    ctx.clip();

    const illum = (1 - Math.cos(angle)) / 2; // 0=new,1=full
    const xScale = Math.abs(Math.cos(angle));

    // Lit crescent/gibbous shape
    ctx.beginPath();
    if (isWaxing) {
      // Right side lit
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.closePath();
      ctx.fillStyle = '#e8e4d0';
      ctx.fill();

      if (illum < 0.5) {
        // Waxing crescent: dark ellipse cuts into right half
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * xScale, r, 0, -Math.PI / 2, Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = '#1a1f2e';
        ctx.fill();
      }
    } else {
      // Waning: right side gets darker
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.closePath();
      const fade = 1 - (illum - 0.5) * 2;
      ctx.fillStyle = fade > 0 ? '#e8e4d0' : '#1a1f2e';
      ctx.fill();
    }
    ctx.restore();

    // Left side
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false); // left half
    ctx.closePath();
    ctx.clip();

    if (!isWaxing) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
      ctx.closePath();
      ctx.fillStyle = '#e8e4d0';
      ctx.fill();

      if (illum < 0.5) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * xScale, r, 0, Math.PI / 2, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = '#1a1f2e';
        ctx.fill();
      }
    }
    ctx.restore();

    // Moon glow for full moon
    if (illum > 0.85) {
      const grad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.5);
      grad.addColorStop(0, 'rgba(232,228,208,0.15)');
      grad.addColorStop(1, 'rgba(232,228,208,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Subtle craters
    ctx.save();
    const craters = [
      { x: cx - r * 0.2, y: cy - r * 0.1, r: r * 0.06 },
      { x: cx + r * 0.1, y: cy + r * 0.3, r: r * 0.04 },
      { x: cx - r * 0.4, y: cy + r * 0.2, r: r * 0.05 },
      { x: cx + r * 0.35, y: cy - r * 0.25, r: r * 0.035 },
    ];
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fill();
    });
    ctx.restore();

    // Outline
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function buildCard() {
    const phase = calcPhase(new Date());
    const name = phaseName(phase);
    const illum = illumination(phase);
    const nextFull = daysToNextFull(phase);
    const nextNew = daysToNextNew(phase);
    const emoji = phaseEmoji(name);

    const card = document.createElement('div');
    card.className = 'card card-moon';
    card.id = 'moon-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="card-label">MOON PHASE</span>
        <span class="card-badge">${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
      </div>
      <div class="moon-inner">
        <canvas id="moon-canvas" width="110" height="110"></canvas>
        <div class="moon-info">
          <div class="moon-phase-name">${emoji} ${name}</div>
          <div class="moon-stats">
            <div class="stat-item">
              <span class="stat-label">ILLUMINATION</span>
              <span class="stat-value">${illum}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">NEXT FULL MOON</span>
              <span class="stat-value">${nextFull} days</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">NEXT NEW MOON</span>
              <span class="stat-value">${nextNew} days</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">LUNAR DAY</span>
              <span class="stat-value">${Math.floor(phase) + 1} / 30</span>
            </div>
          </div>
          <div class="moon-cycle-bar">
            <div class="moon-cycle-fill" style="width:${(phase/29.53*100).toFixed(1)}%"></div>
          </div>
          <div class="moon-cycle-labels">
            <span>🌑 New</span><span>🌓 Quarter</span><span>🌕 Full</span><span>🌗 Quarter</span><span>🌑 New</span>
          </div>
        </div>
      </div>`;
    return card;
  }

  function init() {
    const grid = document.querySelector('.dashboard-grid');
    if (!grid) return;
    const card = buildCard();
    // Insert after sat-card
    const satCard = document.getElementById('sat-card');
    if (satCard && satCard.nextSibling) {
      grid.insertBefore(card, satCard.nextSibling);
    } else {
      grid.appendChild(card);
    }
    const canvas = document.getElementById('moon-canvas');
    const phase = calcPhase(new Date());
    drawMoon(canvas, phase);
  }

  return { init };
})();