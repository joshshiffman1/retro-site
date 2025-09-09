// assets/components/mobile-blocker.js
export default function init(root) {
  // When to show: small screens (tweak as you wish)
  const isSmall = window.matchMedia('(max-width: 740px)').matches;

  // Only show on small screens, and only once per tab unless reopened
  if (!isSmall) return;
  if (sessionStorage.getItem('mb:dismissed') === '1') return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.className = 'mb-overlay';
  overlay.innerHTML = `
    <div class="mb-modal" role="dialog" aria-modal="true" aria-labelledby="mb-title">
      <button class="mb-x" aria-label="Close">✕</button>
      <h2 id="mb-title" class="mb-title">Heads up!</h2>
      <div class="mb-body">
        This site wasn’t designed for mobile. <br />
        For the full retro experience, jump to desktop.
      </div>

      <div class="mb-actions">
        <div class="mb-row">
          <input class="mb-input" type="email" inputmode="email" autocomplete="email"
                 placeholder="your@email.com" aria-label="Your email" />
          <button class="mb-btn" type="button">Email me this link</button>
        </div>
        <button class="mb-close" type="button">Continue anyway</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const modal = overlay.querySelector('.mb-modal');
  const closeBtn = overlay.querySelector('.mb-x');
  const contBtn = overlay.querySelector('.mb-close');
  const emailInput = overlay.querySelector('.mb-input');
  const emailBtn = overlay.querySelector('.mb-btn');

  // Prevent background scroll while modal open
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';

  // Email handler (mailto:)
  emailBtn.addEventListener('click', () => {
    const email = (emailInput.value || '').trim();
    // rudimentary check; mail client will validate further
    const ok = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      emailInput.focus();
      emailInput.select();
      return;
    }
    const subject = encodeURIComponent('RetroSite link');
    const body = encodeURIComponent(`Open this on your desktop:\n\n${location.href}`);
    const to = encodeURIComponent(email);
    // If user entered nothing, leave "to" blank so their mail app prompts them
    const href = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = href;
  });

  function dismiss() {
    sessionStorage.setItem('mb:dismissed', '1');
    document.documentElement.style.overflow = prevOverflow || '';
    overlay.remove();
  }

  closeBtn.addEventListener('click', dismiss);
  contBtn.addEventListener('click', dismiss);

  // Basic focus management (send focus into the modal)
  setTimeout(() => {
    (emailInput || contBtn || closeBtn).focus();
  }, 0);

  // Close on Escape
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dismiss();
  }, { once: false });
}
