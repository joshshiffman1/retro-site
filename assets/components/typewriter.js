// assets/components/typewriter.js
export default function init(root) {
  const textEl = root.querySelector('.typewriter-text');
  if (!textEl) return;

  // Get phrases + anchor from HTML dataset
  const phrases = parseJSON(root.dataset.phrases, [
    "Welcome to my site.",
    "Welcome to what's on my mind.",
    "Welcome to what interests me.",
  ]);
  const anchor = root.dataset.anchor || "Welcome";

  // Timing constants
  const TYPING_MS = 90;
  const DELETING_MS = 60;
  const PAUSE_FULL = 1200;
  const PAUSE_ANCHOR = 800;

  let p = 0;          // phrase index
  let visible = "";   // current text
  let paused = false; // used by observer to save CPU

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Type until we match the target string
  function* typeTo(target) {
    while (visible !== target) {
      visible = target.slice(0, visible.length + 1);
      textEl.textContent = visible;
      yield TYPING_MS;
    }
  }

  // Erase until only target string remains
  function* eraseTo(target) {
    while (visible !== target) {
      visible = visible.slice(0, Math.max(target.length, visible.length - 1));
      textEl.textContent = visible;
      yield DELETING_MS;
    }
  }

  // Pause typing when element is offscreen
  const io = new IntersectionObserver(([entry]) => {
    paused = !entry.isIntersecting;
  }, { threshold: 0 });
  io.observe(root);

  // Main loop
  (async function loop() {
    if (!visible) {
      for (const d of typeTo(anchor)) await gatedSleep(d);
      await gatedSleep(PAUSE_ANCHOR);
    }
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const phrase = phrases[p];

      // Type the full phrase
      for (const d of typeTo(phrase)) await gatedSleep(d);
      await gatedSleep(PAUSE_FULL);

      // Erase back to anchor
      for (const d of eraseTo(anchor)) await gatedSleep(d);
      await gatedSleep(PAUSE_ANCHOR);

      p = (p + 1) % phrases.length;
    }
  })();

  // Sleep, but pause if offscreen
  async function gatedSleep(ms) {
    const chunk = 100;
    let waited = 0;
    while (waited < ms) {
      if (!paused) {
        const step = Math.min(chunk, ms - waited);
        await sleep(step);
        waited += step;
      } else {
        await sleep(150); // idle when offscreen
      }
    }
  }

  function parseJSON(str, fallback) {
    try { return JSON.parse(str); } catch { return fallback; }
  }
}
