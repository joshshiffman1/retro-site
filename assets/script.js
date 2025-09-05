// assets/script.js
document.addEventListener('DOMContentLoaded', () => {
  // ---- Single source of truth ----
  const SITE = {
    home: 'index.html', // homepage path
  };

  const NAV_ITEMS = [
    { href: 'index.html', label: 'Main' },
    { href: 'about.html', label: 'About' },
    { href: 'other.html', label: 'Other' },
  ];

  // ---- Helpers ----
  const TZ = 'America/New_York';
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // change to false for 24h time
  });

  function nowHHMM() {
    return fmt.format(new Date()); // e.g., "03:47 PM"
  }

  // ---- Logo: live hh:mm AM/PM in Eastern ----
  const logoLink = document.querySelector('a.logo');

  function updateLogoTime() {
    if (!logoLink) return;
    const t = nowHHMM();
    logoLink.textContent = t;
    logoLink.setAttribute('href', SITE.home);
    logoLink.setAttribute('aria-label', `Home — ${t} Eastern`);
  }

  function scheduleMinuteTicks(updateFn) {
    // Align the first tick to the top of the next minute, then tick every minute
    const now = new Date();
    const msToNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(function tick() {
      updateFn();
      setTimeout(tick, 60 * 1000);
    }, Math.max(0, msToNextMinute));
  }

  updateLogoTime();
  scheduleMinuteTicks(updateLogoTime);

  // ---- Canonical nav injection ----
  const nav = document.getElementById('site-nav');
  if (nav) {
    nav.innerHTML = NAV_ITEMS
      .map(item => `<li><a href="${item.href}">${item.label}</a></li>`)
      .join('');

    // Highlight the current page automatically
    const currentFile = (() => {
      const file = (location.pathname.split('/').pop() || '').toLowerCase();
      return file === '' ? SITE.home.toLowerCase() : file;
    })();

    nav.querySelectorAll('a').forEach(a => {
      const target = a.getAttribute('href').toLowerCase();
      if (target === currentFile) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  // ---- Mobile menu toggle ----
  const toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const shown = nav.classList.toggle('show');
      toggle.setAttribute('aria-expanded', String(shown));
    });
  }

  // ---- Optional: live <title> updates (Page · hh:mm AM/PM) ----
  function updateTitle() {
    const file = (location.pathname.split('/').pop() || '').toLowerCase() || SITE.home.toLowerCase();
    const match = NAV_ITEMS.find(i => i.href.toLowerCase() === file);
    if (match) document.title = `${match.label} · ${nowHHMM()}`;
  }
  updateTitle();
  scheduleMinuteTicks(updateTitle);
});
