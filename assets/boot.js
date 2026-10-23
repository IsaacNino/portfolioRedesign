/* Independent of the app module: a failed asset must never trap a visitor. */
(() => {
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('isaac-motion') === 'off'; } catch { /* Optional storage. */ }
  if (preference.matches || paused || (location.hash && location.hash !== '#home')) return;

  const states = new Map(['interface', 'type', 'portrait', 'work'].map(key => [key, 'pending']));
  const timers = new Set();
  let closed = false, exiting = false, mounted = false, locked = [], shown = 0, started = 0, interval;
  const later = (callback, delay) => { const id = setTimeout(() => { timers.delete(id); callback(); }, delay); timers.add(id); return id; };
  const clear = () => { timers.forEach(clearTimeout); timers.clear(); clearInterval(interval); };
  function release() {
    if (closed) return;
    closed = true; clear();
    root.classList.remove('boot-pending', 'boot-exit');
    locked.forEach(([element, inert]) => { element.inert = inert; });
    const screen = document.getElementById('bootScreen');
    const focused = screen?.contains(document.activeElement);
    if (screen) screen.hidden = true;
    if (focused) document.querySelector('.hero-cta')?.focus({ preventScroll: true });
    document.removeEventListener('keydown', onKey);
    preference.removeEventListener('change', onPreference);
    dispatchEvent(new Event('signal:entered'));
  }
  function finish(immediate = false) {
    if (closed || exiting) { if (immediate) release(); return; }
    exiting = true; clear();
    if (immediate || !mounted) { release(); return; }
    document.getElementById('bootStatus').textContent = 'Signal acquired. Entering portfolio.';
    root.classList.add('boot-exit');
    later(release, 480);
  }
  function onKey(event) { if (event.key === 'Escape') finish(true); }
  function onPreference() { if (preference.matches) finish(true); }
  function tick() {
    if (closed || exiting) return;
    const keys = [...states.keys()];
    const elapsed = performance.now() - started;
    // Each check gets a short visual beat, but only resolves once its asset settles.
    while (shown < keys.length && elapsed >= (shown + 1) * 310 && states.get(keys[shown]) !== 'pending') {
      const row = document.querySelector(`[data-boot-check="${keys[shown]}"]`);
      row.dataset.state = states.get(keys[shown]);
      row.querySelector('b').textContent = states.get(keys[shown]) === 'ready' ? 'READY' : 'FALLBACK';
      shown++;
    }
    document.getElementById('bootCount').textContent = String(shown).padStart(2, '0');
    document.getElementById('bootFill').style.transform = `scaleX(${shown / keys.length})`;
    if (shown === keys.length && elapsed >= 1650) finish();
  }
  window.signalBoot = {
    ready(key, success = true) { if (states.has(key)) states.set(key, success ? 'ready' : 'fallback'); },
    get active() { return !closed; }
  };
  root.classList.add('boot-pending');
  // Independent watchdog covers module errors, stalled requests, and missing callbacks.
  later(() => finish(true), 4500);
  document.addEventListener('keydown', onKey);
  preference.addEventListener('change', onPreference);
  addEventListener('pageshow', event => { if (event.persisted) finish(true); });
  document.addEventListener('DOMContentLoaded', () => {
    if (closed) return;
    const screen = document.getElementById('bootScreen');
    if (!screen) { finish(true); return; }
    mounted = true; started = performance.now();
    locked = [...document.body.children].filter(element => element !== screen && element.tagName !== 'SCRIPT').map(element => [element, element.inert]);
    locked.forEach(([element]) => { element.inert = true; });
    document.getElementById('bootSkip').addEventListener('click', () => finish(true));
    const portrait = document.querySelector('#portraitFrame img');
    if (!portrait) states.set('portrait', 'fallback');
    else if (portrait.complete) states.set('portrait', portrait.naturalWidth ? 'ready' : 'fallback');
    else {
      portrait.addEventListener('load', () => states.set('portrait', 'ready'), { once: true });
      portrait.addEventListener('error', () => states.set('portrait', 'fallback'), { once: true });
    }
    (document.fonts?.ready || Promise.resolve()).then(() => states.set('type', 'ready'), () => states.set('type', 'fallback'));
    interval = setInterval(tick, 80);
    tick();
  }, { once: true });
})();
