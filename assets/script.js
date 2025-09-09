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

  // ---- Logo: live hh:mm AM/PM in Eastern (text only) ----
  const logoLink = document.querySelector('a.logo');

  function updateLogoTime() {
    if (!logoLink) return;
    const t = nowHHMM();
    logoLink.textContent = t;
    logoLink.setAttribute('href', SITE.home);
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

  // ---- Typewriter (Press Start 2P) ----
  (function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return; // only runs on pages that include the typewriter markup

    const phrases = [
      "Welcome to my site",
      "Welcome to what's on my mind",
      "Welcome to what interests me"
    ];
    const anchor = "Welcome"; // delete back to this

    const TYPING_MS = 90;       // per character
    const DELETING_MS = 60;     // per character
    const PAUSE_FULL = 1200;    // pause after full phrase typed
    const PAUSE_ANCHOR = 800;   // pause when trimmed back to "Welcome"

    let p = 0;        // phrase index
    let visible = ""; // current visible text

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    function* typeTo(target) {
      while (visible !== target) {
        visible = target.slice(0, visible.length + 1);
        el.textContent = visible;
        yield TYPING_MS;
      }
    }

    function* eraseTo(target) {
      while (visible !== target) {
        visible = visible.slice(0, Math.max(target.length, visible.length - 1));
        el.textContent = visible;
        yield DELETING_MS;
      }
    }

    async function loop() {
      // Ensure we start by showing the anchor at least once
      if (!visible) {
        for (const d of typeTo(anchor)) await sleep(d);
        await sleep(PAUSE_ANCHOR);
      }

      while (true) {
        const phrase = phrases[p];

        // 1) Type full phrase
        for (const d of typeTo(phrase)) await sleep(d);
        await sleep(PAUSE_FULL);

        // 2) Delete back to anchor ("Welcome")
        for (const d of eraseTo(anchor)) await sleep(d);
        await sleep(PAUSE_ANCHOR);

        // Next phrase (wrap)
        p = (p + 1) % phrases.length;
      }
    }

    loop();
  })();
});
