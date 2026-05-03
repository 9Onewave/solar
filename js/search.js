/* ============================================================
   search.js — Global search: planets, satellites, news
   ============================================================ */

const Search = (() => {

  const OBJECTS = [
    // Planets
    { name: 'Mercury', type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Venus',   type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Earth',   type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Mars',    type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Jupiter', type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Saturn',  type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Uranus',  type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'Neptune', type: 'PLANET', action: () => scrollToSection('solar-system') },
    { name: 'The Sun', type: 'STAR',   action: () => scrollToSection('solar-system') },
    // Satellites
    { name: 'ISS — International Space Station', type: 'SATELLITE', action: () => scrollToSection('dashboard') },
    { name: 'Hubble Space Telescope',            type: 'SATELLITE', action: () => scrollToSection('dashboard') },
    { name: 'James Webb Space Telescope',        type: 'SATELLITE', action: () => scrollToSection('dashboard') },
    // Sections
    { name: 'Live Dashboard', type: 'SECTION', action: () => scrollToSection('dashboard') },
    { name: 'Space News',     type: 'SECTION', action: () => scrollToSection('news') },
    { name: 'NASA APOD',      type: 'SECTION', action: () => scrollToSection('dashboard') },
    { name: 'Near-Earth Objects', type: 'DATA', action: () => scrollToSection('dashboard') },
    { name: 'Satellite Tracking', type: 'DATA', action: () => scrollToSection('dashboard') },
  ];

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function init() {
    const input = document.getElementById('global-search');
    const dropdown = document.getElementById('search-results');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { dropdown.classList.remove('open'); return; }

      const matches = OBJECTS.filter(o =>
        o.name.toLowerCase().includes(q)
      ).slice(0, 6);

      if (matches.length === 0) { dropdown.classList.remove('open'); return; }

      dropdown.innerHTML = matches.map((o, i) =>
        `<div class="search-item" data-idx="${i}">
          <span class="search-item-name">${highlight(o.name, q)}</span>
          <span class="search-item-type">${o.type}</span>
        </div>`
      ).join('');

      dropdown.querySelectorAll('.search-item').forEach((el, i) => {
        el.addEventListener('click', () => {
          matches[i].action();
          input.value = '';
          dropdown.classList.remove('open');
        });
      });

      dropdown.classList.add('open');
    });

    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { dropdown.classList.remove('open'); input.value = ''; }
    });
  }

  function highlight(text, q) {
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return text.slice(0, idx) +
      `<span style="color:var(--accent)">${text.slice(idx, idx + q.length)}</span>` +
      text.slice(idx + q.length);
  }

  return { init };
})();