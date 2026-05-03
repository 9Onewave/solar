/* ============================================================
   tonightSky.js — "Tonight's Sky" section
   Calculates visible planets, rise/set times, events
   Pure JS astronomy math — no API needed
   ============================================================ */

const TonightSky = (() => {

  // Degrees to radians
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;

  function julianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function siderealTime(jd, lon) {
    const T = (jd - 2451545.0) / 36525;
    let st = 280.46061837 + 360.98564736629 * (jd - 2451545) +
             0.000387933 * T * T - T * T * T / 38710000;
    return ((st + lon) % 360 + 360) % 360;
  }

  // Approximate planetary visibility (heliocentric longitude, rough)
  function getPlanetData(date) {
    const jd = julianDate(date);
    const T = (jd - 2451545.0) / 36525;

    const planets = [
      {
        name: 'Venus', color: '#e8c97a', symbol: '♀',
        L0: 181.979, L1: 58517.81,
        maxMag: -4.6, desc: 'Brightest planet — often mistaken for a UFO'
      },
      {
        name: 'Mars', color: '#c1440e', symbol: '♂',
        L0: 355.453, L1: 19140.30,
        maxMag: -2.9, desc: 'The Red Planet — look for its distinctive orange hue'
      },
      {
        name: 'Jupiter', color: '#c9a96e', symbol: '♃',
        L0: 34.396, L1: 3034.74,
        maxMag: -2.9, desc: 'King of planets — visible even in light-polluted skies'
      },
      {
        name: 'Saturn', color: '#e4d191', symbol: '♄',
        L0: 49.944, L1: 1222.49,
        maxMag: 0.7, desc: 'Rings visible through even a small telescope'
      },
      {
        name: 'Mercury', color: '#b5b5b5', symbol: '☿',
        L0: 252.251, L1: 149472.67,
        maxMag: -1.9, desc: 'Elusive — only visible near the horizon at dusk/dawn'
      },
    ];

    const earthL = ((100.464 + 35999.372 * T * 100) % 360 + 360) % 360;

    return planets.map(p => {
      const L = ((p.L0 + p.L1 * T * 100) % 360 + 360) % 360;
      const elongation = Math.abs(((L - earthL + 180) % 360) - 180);
      let visibility, timeStr, quality;

      if (elongation < 18) {
        visibility = 'Too close to Sun';
        timeStr = 'Not visible';
        quality = 0;
      } else if (elongation < 90) {
        const isEvening = ((L - earthL + 360) % 360) < 180;
        timeStr = isEvening ? 'Evening sky (W)' : 'Morning sky (E)';
        visibility = timeStr;
        quality = Math.round(elongation / 90 * 3);
      } else {
        timeStr = 'All night';
        quality = 3;
        visibility = 'All night — best view around midnight';
      }

      // Approximate magnitude based on elongation
      const mag = (p.maxMag + (1 - elongation / 180) * 3).toFixed(1);

      return { ...p, elongation: elongation.toFixed(0), visibility, timeStr, quality, mag };
    }).sort((a, b) => b.quality - a.quality);
  }

  function getAstronomicalEvents(date) {
    const events = [];
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Recurring annual events (approximate)
    const annualEvents = [
      { m: 1, d: 3, name: 'Quadrantids Meteor Shower Peak', type: 'meteor' },
      { m: 4, d: 22, name: 'Lyrids Meteor Shower Peak', type: 'meteor' },
      { m: 5, d: 6, name: 'Eta Aquariids Meteor Shower Peak', type: 'meteor' },
      { m: 7, d: 28, name: 'Delta Aquariids Meteor Shower Peak', type: 'meteor' },
      { m: 8, d: 12, name: 'Perseids Meteor Shower Peak', type: 'meteor', highlight: true },
      { m: 10, d: 21, name: 'Orionids Meteor Shower Peak', type: 'meteor' },
      { m: 11, d: 17, name: 'Leonids Meteor Shower Peak', type: 'meteor' },
      { m: 12, d: 14, name: 'Geminids Meteor Shower Peak', type: 'meteor', highlight: true },
      { m: 12, d: 22, name: 'Ursids Meteor Shower Peak', type: 'meteor' },
      { m: 3, d: 20, name: 'Spring Equinox', type: 'seasonal' },
      { m: 6, d: 21, name: 'Summer Solstice (Longest Day)', type: 'seasonal' },
      { m: 9, d: 22, name: 'Autumn Equinox', type: 'seasonal' },
      { m: 12, d: 21, name: 'Winter Solstice (Shortest Day)', type: 'seasonal' },
    ];

    annualEvents.forEach(e => {
      const diff = (e.m - month) * 30 + (e.d - day);
      if (diff >= 0 && diff <= 30) {
        events.push({
          ...e,
          daysAway: diff === 0 ? 'Tonight!' : diff === 1 ? 'Tomorrow' : `In ${diff} days`
        });
      }
    });

    return events.slice(0, 4);
  }

  function getConstellationSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 12 || m <= 2) return {
      season: 'Winter',
      constellations: ['Orion', 'Taurus', 'Gemini', 'Canis Major', 'Auriga'],
      highlight: 'Orion is the unmistakable winter beacon — look for his three-star belt.'
    };
    if (m <= 5) return {
      season: 'Spring',
      constellations: ['Leo', 'Virgo', 'Boötes', 'Corvus', 'Hydra'],
      highlight: 'Follow the arc of the Big Dipper to Arcturus in Boötes — one of the brightest stars.'
    };
    if (m <= 8) return {
      season: 'Summer',
      constellations: ['Scorpius', 'Sagittarius', 'Lyra', 'Cygnus', 'Aquila'],
      highlight: 'The Summer Triangle — Vega, Deneb, and Altair — dominates the summer sky.'
    };
    return {
      season: 'Autumn',
      constellations: ['Pegasus', 'Andromeda', 'Perseus', 'Cassiopeia', 'Aries'],
      highlight: 'Andromeda Galaxy (M31) is visible to the naked eye — 2.5 million light years away.'
    };
  }

  function qualityDots(q) {
    return '●'.repeat(q) + '○'.repeat(3 - q);
  }

  function buildSection() {
    const date = new Date();
    const planetData = getPlanetData(date);
    const events = getAstronomicalEvents(date);
    const constSeason = getConstellationSeason();

    const section = document.createElement('section');
    section.id = 'tonight';
    section.innerHTML = `
      <div class="section-header">
        <span class="section-tag">TONIGHT</span>
        <h2>Tonight's Sky</h2>
        <span style="margin-left:auto;font-size:0.65rem;color:var(--text-dim);letter-spacing:0.1em">
          ${date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </span>
      </div>

      <div class="tonight-grid">

        <!-- Visible Planets -->
        <div class="card tonight-planets">
          <div class="card-header">
            <span class="card-label">VISIBLE PLANETS</span>
            <span class="card-badge">NAKED EYE</span>
          </div>
          <div class="tonight-planet-list">
            ${planetData.map(p => `
              <div class="tonight-planet-row">
                <div class="tonight-planet-left">
                  <span class="tonight-symbol" style="color:${p.color}">${p.symbol}</span>
                  <div>
                    <div class="tonight-planet-name">${p.name}</div>
                    <div class="tonight-planet-desc">${p.desc}</div>
                  </div>
                </div>
                <div class="tonight-planet-right">
                  <div class="tonight-visibility ${p.quality === 0 ? 'dim' : ''}">${p.timeStr}</div>
                  <div class="tonight-quality" title="Visibility quality">${qualityDots(p.quality)}</div>
                  <div class="tonight-mag">mag ${p.mag}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Constellations -->
        <div class="card tonight-const">
          <div class="card-header">
            <span class="card-label">SEASONAL CONSTELLATIONS</span>
            <span class="card-badge">${constSeason.season.toUpperCase()}</span>
          </div>
          <div class="const-highlight">${constSeason.highlight}</div>
          <div class="const-list">
            ${constSeason.constellations.map(c => `
              <div class="const-item">
                <span class="const-dot">✦</span>
                <span>${c}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="card tonight-events">
          <div class="card-header">
            <span class="card-label">UPCOMING EVENTS</span>
            <span class="card-badge">30-DAY WINDOW</span>
          </div>
          ${events.length === 0
            ? '<p style="color:var(--text-dim);font-size:0.72rem">No major events this month.</p>'
            : events.map(e => `
              <div class="event-row ${e.highlight ? 'event-highlight' : ''}">
                <div class="event-icon">${e.type === 'meteor' ? '☄' : '🌍'}</div>
                <div class="event-info">
                  <div class="event-name">${e.name}</div>
                  <div class="event-time">${e.daysAway}</div>
                </div>
                ${e.highlight ? '<span class="event-badge">NOTABLE</span>' : ''}
              </div>`).join('')
          }
          ${events.length === 0 ? `
            <div class="event-row">
              <div class="event-icon">☄</div>
              <div class="event-info">
                <div class="event-name">Perseids Meteor Shower</div>
                <div class="event-time">Next: August 12</div>
              </div>
            </div>` : ''}
        </div>

        <!-- Observation Tips -->
        <div class="card tonight-tips">
          <div class="card-header">
            <span class="card-label">OBSERVATION TIPS</span>
          </div>
          <div class="tips-list">
            <div class="tip-item">
              <span class="tip-icon">👁</span>
              <span>Allow 20–30 minutes for your eyes to fully dark-adapt after leaving indoor lighting.</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🔴</span>
              <span>Use a red light torch — it preserves your night vision unlike white light.</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">📍</span>
              <span>Find a spot away from streetlights. Even 10 minutes outside a city makes a huge difference.</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🌡</span>
              <span>Dress warmer than you think you need — you'll be standing still in the cold for a while.</span>
            </div>
          </div>
        </div>

      </div>`;

    return section;
  }

  function init() {
    const newsSection = document.getElementById('news');
    if (!newsSection || !newsSection.parentNode) return;
    const section = buildSection();
    newsSection.parentNode.insertBefore(section, newsSection);

    // Add nav link
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      const link = document.createElement('a');
      link.href = '#tonight';
      link.className = 'nav-link';
      link.textContent = 'Tonight';
      const newsLink = navLinks.querySelector('[href="#news"]');
      if (newsLink) navLinks.insertBefore(link, newsLink);
    }
  }

  return { init };
})();