/* ============================================================
   main.js — Init everything + nav scroll behaviour
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Init modules
  SolarSystem.init();
  Dashboard.init();
  News.init();
  Search.init();
  initExtras();

  // ── Nav active link on scroll ───────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));

  // ── Fade-in on scroll ──────────────────────────────────
  const fadeEls = document.querySelectorAll('.card, .news-card, .section-header');
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeObserver.observe(el);
  });

  // ── Keyboard shortcut: / focuses search ───────────────
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('global-search')?.focus();
    }
  });

  console.log('%cCOSMOS loaded ✦', 'font-family: serif; font-size: 1.2rem; color: #7eb8f7;');
});
