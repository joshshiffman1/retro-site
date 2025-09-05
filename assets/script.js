// assets/script.js
document.addEventListener('DOMContentLoaded', () => {
  // ---- Single source of truth ----
  const SITE = { home: 'index.html' };

  const NAV_ITEMS = [
    { href: 'index.html', label: 'Main' },
    { href: 'about.html', label: 'About' },
    { href: 'other.html', label: 'Other' },
  ];

  // ---- Time formatting (Eastern) ----
  const TZ = 'America/New_York';
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const nowHHMM = () => fmt.format(new Date()); // e.g., "03:47 PM"

  function scheduleMinuteTicks(updateFn) {
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(function tick() {
      updateFn();
      setTimeout(tick, 60 * 1000);
    }, Math.max(0, msToNextMinute));
  }

  // ---- Logo: witch-hat image ABOVE live time ----
  const logoLink = document.querySelector('a.logo');

  function buildLogoOnce() {
    if (!logoLink) return null;

    // Clear any existing text
    logoLink.textContent = '';

    // Create and add image
    const logoImg = new Image();
    logoImg.src = 'assets/img/witch-hat.png';
    logoImg.alt = 'Site logo';
    logoImg.className = 'logo-img'; // styled in CSS

    // Create and add time element
    const timeSpan = document.createElement('span');
    timeSpan.className = 'logo-time'; // styled in CSS
    timeSpan.textContent = nowHHMM();

    // Stack them inside the anchor
    logoLink.appendChild(logoImg);
    logoLink.appendChild(timeSpan);

    // Basic link attributes
    logoLink.setAttribute('href', SITE.home);
    logoLink.setAttribute('aria-label', `Home — ${timeSpan.textContent} Eastern`);

    return timeSpan;
  }

  const timeNode = buildLogoOnce();

  function updateLogoTime() {
    if (!logoLink || !timeNode) return;
    const t = nowHHMM();
    timeNode.textContent = t;
    logoLink.setAttribute('aria-label', `Home — ${t} Eastern`);
  }

  updateLogoTime();
  scheduleMinuteTicks(updateLogoTime);

  // ---- Canonical nav injection ----
  const nav = document.getElementById('site-nav');
  if (nav) {
    nav.innerHTML = NAV_ITEMS.map(item => `<li><a href="${item.href}">${item.label}</a></li>`).join('');

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