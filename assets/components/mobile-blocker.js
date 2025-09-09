// assets/components/mobile-blocker.js
export default function init(root) {
  // Define "mobile": adjust breakpoint to your taste
  const mq = window.matchMedia('(max-width: 740px)');

  // Only show on small screens
  if (!mq.matches) return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'mb-overlay';
  overlay.innerHTML = `
    <div class="mb-modal" role="dialog" aria-modal="true" aria-labelledby="mb-title" tabindex="-1">
      <h2 id="mb-title" class="mb-title">Heads up!</h2>
      <div class="mb-body">
        This site wasn’t designed for mobile.<br />
        For the full retro experience, jump to desktop.
      </div>

      <div class="mb-actions">
        <div class="mb-row">
          <input class="mb-input" type="email" inputmode="email" autocomplete="email"
                 placeholder="your@email.com" aria-label="Your email" />
          <button class="mb-btn" type="button">Email me this link</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modal = overlay.querySelector('.mb-modal');
  const emailInput = overlay.querySelector('.mb-input');
  const emailBtn = overlay.querySelector('.mb-btn');

  // Hard block: prevent background scroll and interaction
  const prevHtmlOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';

  // Prevent touch scroll on iOS and others
  const prevent = (e) => e.preventDefault();
  overlay.addEventListener('touchmove', prevent, { passive: false });
  overlay.addEventListener('wheel', prevent, { passive: false });

  // Trap focus inside modal (Tab cycles within)
  const focusables = () =>
    Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const els = focusables();
    if (els.length === 0) {
      e.preventDefault();
      return;
    }
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  overlay.addEventListener('keydown', trapFocus);

  // Never close on Escape
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // Focus initial control
  setTimeout(() => { (emailInput || emailBtn).focus(); }, 0);

  // Email handler (mailto:)
  emailBtn.addEventListener('click', () => {
    const email = (emailInput.value || '').trim();
    const ok = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      emailInput.focus();
      emailInput.select();
      return;
    }
    const subject = encodeURIComponent('RetroSite link');
    const body = encodeURIComponent(`Open this on your desktop:\n\n${location.href}`);
    const to = encodeURIComponent(email);
    const href = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = href;
  });

  // If the viewport becomes desktop-sized (e.g., user rotates/tablet/desktop),
  // we remove the block so they can use the site on a large screen.
  mq.addEventListener?.('change', (ev) => {
    if (!ev.matches) cleanup();
  });

  function cleanup() {
    // Allow scrolling again and remove overlay
    document.documentElement.style.overflow = prevHtmlOverflow || '';
    overlay.removeEventListener('touchmove', prevent);
    overlay.removeEventListener('wheel', prevent);
    overlay.removeEventListener('keydown', trapFocus);
    overlay.remove();
  }
}
