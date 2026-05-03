/* ============================================================
   news.js — Space News from SpaceFlightNews API (free, no key)
   ============================================================ */

const News = (() => {

  let allArticles = [];
  let activeFilter = 'all';
  let searchQuery = '';

  async function fetchNews() {
    try {
      const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=24&ordering=-published_at');
      if (!res.ok) throw new Error('News fetch failed');
      const d = await res.json();
      allArticles = d.results || [];
      render();
    } catch (e) {
      console.warn('News API unavailable:', e.message);
      document.getElementById('news-grid').innerHTML = `
        <div style="color:var(--text-dim);font-size:0.75rem;grid-column:1/-1;text-align:center;padding:3rem">
          News feed temporarily unavailable. <a href="https://spaceflightnewsapi.net" target="_blank" style="color:var(--accent)">Visit SpaceflightNewsAPI</a>
        </div>`;
    }
  }

  function filterArticles() {
    return allArticles.filter(a => {
      const matchFilter = activeFilter === 'all' ||
        a.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
        (a.news_site || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
        (a.summary || '').toLowerCase().includes(activeFilter.toLowerCase());
      const matchSearch = !searchQuery ||
        a.title.toLowerCase().includes(searchQuery) ||
        (a.summary || '').toLowerCase().includes(searchQuery);
      return matchFilter && matchSearch;
    });
  }

  function formatDate(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function render() {
    const filtered = filterArticles();
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="color:var(--text-dim);font-size:0.75rem;grid-column:1/-1;text-align:center;padding:3rem">No articles found.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(a => `
      <a class="news-card" href="${a.url}" target="_blank" rel="noopener">
        <img class="news-card-img" src="${a.image_url || ''}" alt="${a.title}"
          onerror="this.style.display='none'" loading="lazy" />
        <div class="news-card-body">
          <div class="news-card-source">${a.news_site || 'SPACE NEWS'}</div>
          <div class="news-card-title">${a.title}</div>
          <div class="news-card-summary">${a.summary || ''}</div>
          <div class="news-card-date">${formatDate(a.published_at)}</div>
        </div>
      </a>`
    ).join('');
  }

  function init() {
    fetchNews();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        render();
      });
    });

    // Search
    const searchEl = document.getElementById('news-search');
    if (searchEl) {
      searchEl.addEventListener('input', e => {
        searchQuery = e.target.value.trim().toLowerCase();
        render();
      });
    }
  }

  return { init };
})();
