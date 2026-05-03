/* ============================================================
   extras.js — Constellations, Satellite Tracker, Moon Phase,
               Tonight's Sky
   ============================================================ */

// ═══════════════════════════════════════════════════════════
// 1. MOON PHASE WIDGET
// ═══════════════════════════════════════════════════════════
const MoonPhase = (() => {

  function getMoonPhase(date) {
    // Synodic month = 29.53058867 days
    // Reference new moon: Jan 6, 2000
    const known = new Date(2000, 0, 6, 18, 14, 0);
    const synodic = 29.53058867;
    const diff = (date - known) / (1000 * 60 * 60 * 24);
    const cycle = ((diff % synodic) + synodic) % synodic;
    const pct = cycle / synodic; // 0 = new moon, 0.5 = full moon

    const phases = [
      { name: 'New Moon',        emoji: '🌑', range: [0,    0.034] },
      { name: 'Waxing Crescent', emoji: '🌒', range: [0.034, 0.25] },
      { name: 'First Quarter',   emoji: '🌓', range: [0.25,  0.27] },
      { name: 'Waxing Gibbous',  emoji: '🌔', range: [0.27,  0.5]  },
      { name: 'Full Moon',       emoji: '🌕', range: [0.5,   0.534] },
      { name: 'Waning Gibbous',  emoji: '🌖', range: [0.534, 0.75] },
      { name: 'Last Quarter',    emoji: '🌗', range: [0.75,  0.77] },
      { name: 'Waning Crescent', emoji: '🌘', range: [0.77,  1.0]  },
    ];

    const phase = phases.find(p => pct >= p.range[0] && pct < p.range[1]) || phases[7];
    const daysUntilFull = ((0.5 - pct + 1) % 1) * synodic;
    const daysUntilNew  = ((1.0 - pct) % 1) * synodic;
    const illumination  = Math.round((1 - Math.cos(2 * Math.PI * pct)) / 2 * 100);
    const age           = Math.round(cycle * 10) / 10;

    return { phase, pct, illumination, age, daysUntilFull, daysUntilNew, cycle };
  }

  function drawMoon(canvas, pct) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 4;
    ctx.clearRect(0, 0, w, h);

    // Dark moon base
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1f2e';
    ctx.fill();

    // Illuminated part
    const isWaxing = pct < 0.5;
    const t = isWaxing ? pct * 2 : (pct - 0.5) * 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.closePath();
    ctx.clip();

    const bright = 'rgba(230,220,180,0.95)';

    if (isWaxing) {
      // Right side lit, left dark
      const ex = cx + (1 - 2 * t) * r;
      ctx.beginPath();
      ctx.ellipse(ex, cy, r * Math.abs(1 - 2 * t), r, 0, 0, Math.PI * 2);
      ctx.fillStyle = bright;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI / 2, (3 * Math.PI) / 2, false);
      ctx.fillStyle = bright;
      ctx.fill();
    }
    ctx.restore();

    if (!isWaxing) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.closePath();
      ctx.clip();
      const ex2 = cx + (2 * t - 1) * r;
      ctx.beginPath();
      ctx.ellipse(ex2, cy, r * Math.abs(2 * t - 1), r, 0, 0, Math.PI * 2);
      ctx.fillStyle = bright;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.fillStyle = bright;
      ctx.fill();
      ctx.restore();
    }

    // Surface texture (craters)
    const craters = [
      [cx - r*0.2, cy - r*0.1, r*0.08],
      [cx + r*0.3, cy + r*0.2, r*0.06],
      [cx - r*0.1, cy + r*0.3, r*0.05],
      [cx + r*0.1, cy - r*0.3, r*0.04],
    ];
    craters.forEach(([x, y, cr]) => {
      ctx.beginPath();
      ctx.arc(x, y, cr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fill();
    });

    // Glow
    const grd = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.4);
    grd.addColorStop(0, 'rgba(200,190,140,0.08)');
    grd.addColorStop(1, 'rgba(200,190,140,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  function renderCard() {
    const card = document.getElementById('moon-card');
    if (!card) return;
    const data = getMoonPhase(new Date());
    const { phase, illumination, age, daysUntilFull, daysUntilNew } = data;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-label">MOON PHASE</span>
        <span class="card-badge">TONIGHT</span>
      </div>
      <div class="moon-inner">
        <canvas id="moon-canvas" width="100" height="100"></canvas>
        <div class="moon-info">
          <div class="moon-phase-name">${phase.name}</div>
          <div class="moon-stats">
            <div class="stat-item">
              <span class="stat-label">ILLUMINATION</span>
              <span class="stat-value">${illumination}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">AGE</span>
              <span class="stat-value">${age} days</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">FULL MOON IN</span>
              <span class="stat-value">${Math.round(daysUntilFull)} days</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">NEW MOON IN</span>
              <span class="stat-value">${Math.round(daysUntilNew)} days</span>
            </div>
          </div>
        </div>
      </div>`;

    const canvas = document.getElementById('moon-canvas');
    if (canvas) drawMoon(canvas, data.pct);
  }

  return { renderCard, getMoonPhase };
})();


// ═══════════════════════════════════════════════════════════
// 2. TONIGHT'S SKY
// ═══════════════════════════════════════════════════════════
const TonightSky = (() => {

  // Visibility data is approximate but astronomically grounded
  // Based on mean orbital positions and seasonal visibility
  function getVisibleObjects(date) {
    const month = date.getMonth(); // 0-11
    const hour  = date.getHours();
    const isNight = hour >= 20 || hour <= 5;

    const OBJECTS = [
      // Planets - rough visibility windows by month
      { name: 'Venus',   type: 'PLANET',  color: '#e8c97a', months: [0,1,2,9,10,11], desc: 'Brightest object in the sky after the Moon. Look west after sunset.' },
      { name: 'Mars',    type: 'PLANET',  color: '#c1440e', months: [0,1,5,6,7,8],   desc: 'Distinctive red colour. Look south to southeast in the early evening.' },
      { name: 'Jupiter', type: 'PLANET',  color: '#c9a96e', months: [2,3,4,5,6,7,8], desc: 'Brightest non-Venus planet. Its 4 Galilean moons visible with binoculars.' },
      { name: 'Saturn',  type: 'PLANET',  color: '#e4d191', months: [5,6,7,8,9,10],  desc: 'Rings visible with any small telescope. Yellow-white star-like appearance.' },
      { name: 'Mercury', type: 'PLANET',  color: '#b5b5b5', months: [1,2,7,8],        desc: 'Near the horizon just after sunset or before sunrise. Hard to spot.' },

      // Always visible (from mid-latitudes)
      { name: 'Orion',        type: 'CONSTELLATION', color: '#7eb8f7', months: [10,11,0,1,2], desc: 'The Hunter. Betelgeuse (red) and Rigel (blue) mark his shoulders and foot.' },
      { name: 'Ursa Major',   type: 'CONSTELLATION', color: '#7eb8f7', months: [0,1,2,3,4],   desc: 'The Great Bear. The Plough/Big Dipper is the most recognisable pattern.' },
      { name: 'Scorpius',     type: 'CONSTELLATION', color: '#7eb8f7', months: [5,6,7],        desc: 'The Scorpion. Best seen from southern latitudes in summer.' },
      { name: 'Cassiopeia',   type: 'CONSTELLATION', color: '#7eb8f7', months: [8,9,10,11,0], desc: 'The W-shape queen. Circumpolar — visible all year from Scotland.' },
      { name: 'Leo',          type: 'CONSTELLATION', color: '#7eb8f7', months: [2,3,4,5],      desc: 'The Lion. Look for the backwards question mark pattern (the Sickle).' },

      // Meteor showers
      { name: 'Perseids',     type: 'METEOR SHOWER', color: '#f97316', months: [7],    desc: 'Up to 100 meteors/hour. Peak around Aug 12. Best after midnight.' },
      { name: 'Geminids',     type: 'METEOR SHOWER', color: '#f97316', months: [11],   desc: 'Best annual shower. Up to 120/hr. Peak Dec 13–14.' },
      { name: 'Leonids',      type: 'METEOR SHOWER', color: '#f97316', months: [10],   desc: 'Fast, bright meteors. Peak Nov 17–18.' },
      { name: 'Lyrids',       type: 'METEOR SHOWER', color: '#f97316', months: [3],    desc: 'Ancient shower, peak Apr 22–23.' },

      // Always interesting
      { name: 'Milky Way Core', type: 'DEEP SKY',  color: '#c9a96e', months: [5,6,7,8], desc: 'Best in summer from dark skies. Face south and look for the band of stars.' },
      { name: 'Andromeda Galaxy (M31)', type: 'DEEP SKY', color: '#c9a96e', months: [8,9,10,11], desc: 'Naked eye visible from dark sites. 2.5 million light-years away.' },
      { name: 'Pleiades (Seven Sisters)', type: 'STAR CLUSTER', color: '#7de8e8', months: [10,11,0,1,2,3], desc: 'Beautiful open cluster. Spot with naked eye, stunning in binoculars.' },
    ];

    return OBJECTS.filter(o => o.months.includes(month));
  }

  function renderCard() {
    const card = document.getElementById('tonight-card');
    if (!card) return;
    const now = new Date();
    const objects = getVisibleObjects(now);
    const monthName = now.toLocaleDateString('en-GB', { month: 'long' });

    card.innerHTML = `
      <div class="card-header">
        <span class="card-label">TONIGHT'S SKY — ${monthName.toUpperCase()}</span>
        <span class="card-badge live">SEASONAL</span>
      </div>
      <div class="tonight-list">
        ${objects.map(o => `
          <div class="tonight-item">
            <div class="tonight-dot" style="background:${o.color}"></div>
            <div class="tonight-body">
              <div class="tonight-name">
                ${o.name}
                <span class="tonight-type">${o.type}</span>
              </div>
              <div class="tonight-desc">${o.desc}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  return { renderCard };
})();


// ═══════════════════════════════════════════════════════════
// 3. REAL SATELLITE TRACKER (with orbital paths)
// ═══════════════════════════════════════════════════════════
const SatTracker = (() => {

  // Simplified orbital propagation (circular orbit approximation)
  // Real sites use SGP4 — we approximate with mean motion
  const SATELLITES = [
    {
      name: 'ISS',
      fullName: 'International Space Station',
      norad: 25544,
      altitude: 408,
      inclination: 51.6,
      period: 92.68,
      color: '#4ade80',
      raan: 45,
      liveUrl: 'https://api.wheretheiss.at/v1/satellites/25544'
    },
    {
      name: 'Hubble',
      fullName: 'Hubble Space Telescope',
      norad: 20580,
      altitude: 547,
      inclination: 28.47,
      period: 95.47,
      color: '#7eb8f7',
      raan: 120
    },
    {
      name: 'JWST',
      fullName: 'James Webb Space Telescope',
      norad: 50463,
      altitude: 1500000, // L2 point
      inclination: 0,
      period: 365.25 * 24 * 60, // 1 year
      color: '#c9a96e',
      raan: 0,
      note: 'L2 Lagrange Point'
    },
    {
      name: 'Tiangong',
      fullName: 'China Space Station',
      norad: 48274,
      altitude: 390,
      inclination: 41.5,
      period: 91.6,
      color: '#f97316',
      raan: 200
    },
  ];

  let canvas, ctx, animFrame;
  let w, h;
  let trackerTime = Date.now();
  let issLive = null;
  let selectedSat = 0;
  const TRAIL_STEPS = 60;

  function latLonToXY(lat, lon) {
    const x = (lon + 180) / 360 * w;
    const y = (90 - lat)  / 180 * h;
    return { x, y };
  }

  // Approximate ground track from orbital elements
  function getGroundTrack(sat, steps, timeMs) {
    const pts = [];
    const periodMs = sat.period * 60 * 1000;
    const earthRotRate = 360 / (24 * 60); // degrees per minute

    for (let i = -TRAIL_STEPS; i <= steps; i++) {
      const t = timeMs + i * (periodMs / steps / 2);
      const meanAnomaly = ((t / periodMs) * 360) % 360;
      const lat = sat.inclination * Math.sin((meanAnomaly + sat.raan * 0.1) * Math.PI / 180);
      const earthRot = (t / 60000) * earthRotRate;
      const lon = ((meanAnomaly + sat.raan - earthRot) % 360 + 360) % 360 - 180;
      pts.push({ lat, lon, future: i > 0 });
    }
    return pts;
  }

  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#06091a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = (90 - lat) / 180 * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 60) {
      const x = (lon + 180) / 360 * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    // Continent blobs
    ctx.fillStyle = 'rgba(126,184,247,0.07)';
    const blobs = [
      [0.05,0.10,0.20,0.34],[0.12,0.46,0.12,0.29],
      [0.45,0.10,0.09,0.20],[0.46,0.30,0.10,0.30],
      [0.53,0.05,0.25,0.40],[0.73,0.54,0.10,0.14],
    ];
    blobs.forEach(([lx,ly,lw,lh]) => {
      ctx.beginPath(); ctx.roundRect(lx*w, ly*h, lw*w, lh*h, 4); ctx.fill();
    });

    // Draw each satellite track
    SATELLITES.forEach((sat, idx) => {
      if (sat.note === 'L2 Lagrange Point') return; // Skip JWST (too far)
      const isSelected = idx === selectedSat;
      const track = getGroundTrack(sat, TRAIL_STEPS, trackerTime);

      // Past trail
      ctx.beginPath();
      let first = true;
      let prevX = null;
      track.filter(p => !p.future).forEach(p => {
        const { x, y } = latLonToXY(p.lat, p.lon);
        if (first || Math.abs(x - prevX) > w * 0.5) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
        prevX = x;
      });
      ctx.strokeStyle = isSelected ? sat.color : `${sat.color}55`;
      ctx.lineWidth = isSelected ? 1.5 : 0.8;
      ctx.stroke();

      // Future track (dashed)
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      first = true; prevX = null;
      track.filter(p => p.future).forEach(p => {
        const { x, y } = latLonToXY(p.lat, p.lon);
        if (first || Math.abs(x - prevX) > w * 0.5) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
        prevX = x;
      });
      ctx.strokeStyle = `${sat.color}33`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Current position
      const current = track[TRAIL_STEPS];
      let { x, y } = latLonToXY(current.lat, current.lon);

      // Use live ISS data if available
      if (idx === 0 && issLive) {
        const live = latLonToXY(issLive.lat, issLive.lon);
        x = live.x; y = live.y;
      }

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = sat.color;
      ctx.fill();

      // Pulse ring for selected
      if (isSelected) {
        const elapsed = (Date.now() % 1500) / 1500;
        ctx.beginPath();
        ctx.arc(x, y, 5 + elapsed * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `${sat.color}${Math.round((1 - elapsed) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Label
      if (isSelected) {
        ctx.fillStyle = sat.color;
        ctx.font = '700 9px Space Mono, monospace';
        ctx.fillText(sat.name, x + 8, y - 5);
      }
    });

    trackerTime += 2000; // Advance simulation by 2s per frame (~real speed)
    animFrame = requestAnimationFrame(draw);
  }

  async function fetchISSLive() {
    try {
      const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const d = await r.json();
      issLive = { lat: parseFloat(d.latitude), lon: parseFloat(d.longitude) };
    } catch {}
    setTimeout(fetchISSLive, 5000);
  }

  function renderCard() {
    const card = document.getElementById('sattracker-card');
    if (!card) return;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-label">SATELLITE ORBITAL TRACKER</span>
        <span class="card-badge live">LIVE</span>
      </div>
      <div class="sat-buttons" id="sat-buttons">
        ${SATELLITES.filter(s => !s.note).map((s, i) => `
          <button class="sat-btn ${i === 0 ? 'active' : ''}" data-idx="${i}"
            style="--sat-color:${s.color}">
            ${s.name}
          </button>`).join('')}
      </div>
      <div class="sat-tracker-map">
        <canvas id="sat-canvas"></canvas>
      </div>
      <div class="sat-info" id="sat-info"></div>`;

    canvas = document.getElementById('sat-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;

    function resize() {
      if (!canvas) return;
      w = canvas.parentElement.clientWidth;
      h = 220;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    updateSatInfo(0);
    fetchISSLive();

    if (animFrame) cancelAnimationFrame(animFrame);
    trackerTime = Date.now();
    draw();

    // Button events
    document.getElementById('sat-buttons')?.addEventListener('click', e => {
      const btn = e.target.closest('.sat-btn');
      if (!btn) return;
      selectedSat = parseInt(btn.dataset.idx);
      document.querySelectorAll('.sat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateSatInfo(selectedSat);
    });
  }

  function updateSatInfo(idx) {
    const s = SATELLITES.filter(sat => !sat.note)[idx];
    if (!s) return;
    const infoEl = document.getElementById('sat-info');
    if (!infoEl) return;
    infoEl.innerHTML = `
      <div class="sat-detail-grid">
        <div class="stat-item"><span class="stat-label">SATELLITE</span><span class="stat-value" style="color:${s.color}">${s.fullName}</span></div>
        <div class="stat-item"><span class="stat-label">NORAD ID</span><span class="stat-value mono">${s.norad}</span></div>
        <div class="stat-item"><span class="stat-label">ALTITUDE</span><span class="stat-value mono">${s.altitude.toLocaleString()} km</span></div>
        <div class="stat-item"><span class="stat-label">INCLINATION</span><span class="stat-value mono">${s.inclination}°</span></div>
        <div class="stat-item"><span class="stat-label">ORBITAL PERIOD</span><span class="stat-value mono">${s.period.toFixed(1)} min</span></div>
        <div class="stat-item"><span class="stat-label">ORBITS/DAY</span><span class="stat-value mono">${(1440 / s.period).toFixed(2)}</span></div>
      </div>`;
  }

  return { renderCard };
})();


// ═══════════════════════════════════════════════════════════
// 4. CONSTELLATION STAR MAP
// ═══════════════════════════════════════════════════════════
const ConstellationMap = (() => {

  const CONSTELLATIONS = [
    {
      name: 'Orion', shortDesc: 'The Hunter',
      stars: [[0.5,0.3],[0.45,0.38],[0.55,0.38],[0.42,0.5],[0.58,0.5],[0.5,0.55],[0.47,0.65],[0.53,0.65]],
      lines: [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[5,6],[5,7]],
      color: '#7eb8f7'
    },
    {
      name: 'Ursa Major', shortDesc: 'The Great Bear',
      stars: [[0.15,0.2],[0.22,0.18],[0.28,0.2],[0.32,0.25],[0.35,0.32],[0.28,0.35],[0.2,0.33]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]],
      color: '#c9a96e'
    },
    {
      name: 'Cassiopeia', shortDesc: 'The Queen',
      stars: [[0.62,0.15],[0.67,0.1],[0.72,0.15],[0.77,0.1],[0.82,0.15]],
      lines: [[0,1],[1,2],[2,3],[3,4]],
      color: '#e8c97a'
    },
    {
      name: 'Leo', shortDesc: 'The Lion',
      stars: [[0.72,0.38],[0.68,0.32],[0.62,0.3],[0.58,0.35],[0.62,0.42],[0.7,0.44],[0.78,0.42]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]],
      color: '#7de8e8'
    },
    {
      name: 'Scorpius', shortDesc: 'The Scorpion',
      stars: [[0.3,0.6],[0.35,0.58],[0.38,0.62],[0.42,0.68],[0.45,0.75],[0.4,0.8],[0.35,0.82]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
      color: '#f97316'
    },
  ];

  let canvas, ctx;
  let w, h;
  let hovered = null;

  function drawStarfield(count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 1.2;
      const alpha = 0.3 + Math.random() * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }
  }

  function render() {
    if (!ctx) return;
    ctx.fillStyle = '#04050a';
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.save();
    // Use seeded draw (clear + redraw same stars each frame via seed trick)
    const savedSeed = Math.random;
    let seed = 42;
    Math.random = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    drawStarfield(800);
    Math.random = savedSeed;
    ctx.restore();

    // Milky way glow
    const mw = ctx.createLinearGradient(w*0.2, 0, w*0.8, h);
    mw.addColorStop(0, 'rgba(100,120,180,0.0)');
    mw.addColorStop(0.4, 'rgba(100,120,180,0.04)');
    mw.addColorStop(0.6, 'rgba(100,120,180,0.06)');
    mw.addColorStop(1, 'rgba(100,120,180,0.0)');
    ctx.fillStyle = mw;
    ctx.fillRect(0, 0, w, h);

    // Draw each constellation
    CONSTELLATIONS.forEach((con, ci) => {
      const isHov = hovered === ci;
      const alpha = isHov ? 1 : 0.5;

      // Lines
      ctx.strokeStyle = `${con.color}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth = isHov ? 1.2 : 0.6;
      ctx.setLineDash([3, 3]);
      con.lines.forEach(([a, b]) => {
        const s1 = con.stars[a], s2 = con.stars[b];
        ctx.beginPath();
        ctx.moveTo(s1[0]*w, s1[1]*h);
        ctx.lineTo(s2[0]*w, s2[1]*h);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Stars
      con.stars.forEach((s, si) => {
        const r = si === 0 ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.arc(s[0]*w, s[1]*h, r, 0, Math.PI*2);
        ctx.fillStyle = isHov ? con.color : `${con.color}aa`;
        ctx.fill();

        if (isHov) {
          ctx.beginPath();
          ctx.arc(s[0]*w, s[1]*h, r+3, 0, Math.PI*2);
          ctx.fillStyle = `${con.color}22`;
          ctx.fill();
        }
      });

      // Label
      if (isHov) {
        const cx = con.stars.reduce((s,p) => s+p[0],0) / con.stars.length * w;
        const cy = con.stars.reduce((s,p) => s+p[1],0) / con.stars.length * h - 14;
        ctx.fillStyle = con.color;
        ctx.font = '700 10px Space Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(con.name.toUpperCase(), cx, cy);
        ctx.fillStyle = `${con.color}88`;
        ctx.font = '9px Space Mono, monospace';
        ctx.fillText(con.shortDesc, cx, cy + 13);
        ctx.textAlign = 'left';
      }
    });
  }

  function getHoveredConstellation(mx, my) {
    for (let ci = 0; ci < CONSTELLATIONS.length; ci++) {
      const con = CONSTELLATIONS[ci];
      for (const [sx, sy] of con.stars) {
        const dx = mx - sx * w;
        const dy = my - sy * h;
        if (Math.sqrt(dx*dx + dy*dy) < 20) return ci;
      }
    }
    return null;
  }

  function renderCard() {
    const card = document.getElementById('constellation-card');
    if (!card) return;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-label">CONSTELLATION MAP</span>
        <span class="card-badge">HOVER TO IDENTIFY</span>
      </div>
      <canvas id="constellation-canvas" style="width:100%;border-radius:4px;cursor:crosshair"></canvas>`;

    canvas = document.getElementById('constellation-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;

    function resize() {
      if (!canvas) return;
      w = canvas.parentElement.clientWidth;
      h = 280;
      canvas.width = w;
      canvas.height = h;
      render();
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (w / rect.width);
      const my = (e.clientY - rect.top) * (h / rect.height);
      const newHov = getHoveredConstellation(mx, my);
      if (newHov !== hovered) { hovered = newHov; render(); }
    });
    canvas.addEventListener('mouseleave', () => { hovered = null; render(); });
  }

  return { renderCard };
})();


// ═══════════════════════════════════════════════════════════
// INIT ALL EXTRAS
// ═══════════════════════════════════════════════════════════
window.initExtras = function() {
  MoonPhase.renderCard();
  TonightSky.renderCard();
  SatTracker.renderCard();
  ConstellationMap.renderCard();
};
