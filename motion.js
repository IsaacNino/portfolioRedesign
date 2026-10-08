// Shared motion preferences for the atmosphere, invitation, and project rows.
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const button = document.getElementById('motionToggle');
let paused = false;
const listeners = new Set();

export function motionEnabled() {
  return !paused && !preference.matches && !document.hidden;
}

export function onMotionChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function update() {
  document.documentElement.classList.toggle('motion-paused', !motionEnabled());
  document.documentElement.classList.toggle('motion-reduced', preference.matches);
  button.textContent = preference.matches ? 'Motion reduced' : paused ? 'Motion off' : 'Motion on';
  button.disabled = preference.matches;
  button.setAttribute('aria-pressed', String(!paused && !preference.matches));
  listeners.forEach(callback => callback());
}
button.addEventListener('click', () => { paused = !paused; update(); });
preference.addEventListener('change', update);
document.addEventListener('visibilitychange', update);
update();

const invite = document.getElementById('contactInvitation');
const word = document.getElementById('invitationWord');
const words = ['Talk', 'Plan', 'Think', 'Build'];
let index = 0;
let transition;
setInterval(() => {
  if (!motionEnabled() || invite.matches(':hover, :focus-within') || document.querySelector('dialog[open]')) return;
  index = (index + 1) % words.length;
  word.textContent = words[index];
  transition = word.animate([
    { transform: 'translateY(100%)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
}, 3600);
onMotionChange(() => { if (!motionEnabled()) transition?.finish(); });

// A small reusable noise tile; no full-screen canvas rendering per frame.
const noise = document.createElement('canvas');
noise.width = noise.height = 96;
const context = noise.getContext('2d');
if (context) {
  const pixels = context.createImageData(96, 96);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const value = Math.floor(Math.random() * 256);
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  document.querySelector('.portfolio-grain').style.backgroundImage = `url(${noise.toDataURL()})`;
}

const ribbon = document.querySelector('.capability-ribbon');
new IntersectionObserver(entries => {
  ribbon.classList.toggle('is-offscreen', !entries[0].isIntersecting);
}).observe(ribbon);
