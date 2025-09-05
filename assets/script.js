// assets/script.js
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.nav-toggle');

  // --- 1) Canonical nav (single source of truth) ---
  // Order locked to: Main → About → Other
  const items = [
    { href: 'index.html', label: 'Main' },
    { href: 'about.html', label: 'About' },
    { href: 'other.html', label: 'Other' },
  ];

  if (nav) {
    nav.innerHTML = items
      .map(i => `<li><a href="${i.href}">${i.label}</a></li>`)
      .join('');

    // --- 2) Highlight current page automatically ---
    // Normalize current file (handles /, index, and subpaths)
    const url = new URL(window.location.href);
    let file = url.pathname.split('/').pop();
    if (!file || file === '') file = 'index.html'; // directory default

    // If there are query params like ?p=..., we still want to match by path
    nav.querySelectorAll('a').forEach(a => {
      const target = a.getAttribute('href').toLowerCase();
      const isCurrent =
        file.toLowerCase() === target ||
        // Also treat "/" or "" as index.html (in some static hosts)
        (file === '' && target === 'index.html');

      if (isCurrent) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  // --- 3) Mobile menu toggle (your existing behavior) ---
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const shown = nav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', String(shown));
    });
  }
});
