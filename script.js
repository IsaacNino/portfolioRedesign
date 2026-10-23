import { validateProjects, getCategories, filterProjects, escapeHtml as esc } from './content/project-utils.js';
import { projectVisual } from './content/project-visuals.js';
import { disciplineVisual } from './content/discipline-visuals.js';

const $ = id => document.getElementById(id);
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const number = value => String(value).padStart(2, '0');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 761px)');
let userMotion;
try { userMotion = localStorage.getItem('isaac-motion'); } catch { /* Storage is optional. */ }
let motionEnabled = !reducedMotion.matches && userMotion !== 'off';
let projects = [], visibleProjects = [], storyElements = [], cards = [], activeIndex = -1;
let scrollScheduled = false;
const activeGlitches = new Map();
const glitchCooldown = new WeakMap();

// Duplicate only the visual layer; assistive technology reads the stable original.
function prepareGlitchText(element) {
  const text = [...element.childNodes].filter(node => !node.classList?.contains('glitch-layer')).map(node => node.textContent).join('');
  element.querySelectorAll(':scope > .glitch-layer').forEach(layer => layer.remove());
  element.classList.add('glitch-text');
  for (const tone of ['cyan', 'red']) {
    const layer = document.createElement('span');
    layer.className = `glitch-layer glitch-${tone}`;
    layer.setAttribute('aria-hidden', 'true');
    layer.textContent = text;
    element.append(layer);
  }
}
function glitch(element) {
  if (!motionEnabled || document.hidden) return;
  const rect = element.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= innerHeight || rect.width === 0) return;
  const now = performance.now();
  if (now - (glitchCooldown.get(element) ?? -Infinity) < 1400) return;
  glitchCooldown.set(element, now);
  element.classList.add('glitch-burst');
  activeGlitches.set(element, setTimeout(() => {
    element.classList.remove('glitch-burst');
    activeGlitches.delete(element);
  }, 650));
}
function stopGlitches() {
  activeGlitches.forEach((timer, element) => {
    clearTimeout(timer);
    element.classList.remove('glitch-burst');
  });
  activeGlitches.clear();
}
const hero = $('home');
const perspective = $('perspective');
const perspectiveLines = document.querySelector('.perspective-lines');
const perspectiveWords = [...perspective.querySelectorAll('h2 span')];

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('reveal-pending');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 }) : null;
function observeReveals(root = document) {
  root.querySelectorAll('.reveal').forEach(el => {
    if (motionEnabled && revealObserver && el.getBoundingClientRect().top > innerHeight * .92) {
      el.classList.add('reveal-pending');
      revealObserver.observe(el);
    }
  });
}
function applyMotion() {
  document.body.classList.toggle('motion-off', !motionEnabled);
  document.documentElement.style.scrollBehavior = motionEnabled ? 'smooth' : 'auto';
  $('motionToggle').setAttribute('aria-pressed', String(motionEnabled));
  $('motionToggle').setAttribute('aria-label', motionEnabled ? 'Pause motion' : reducedMotion.matches ? 'Motion off: system reduced motion is enabled' : 'Enable motion');
  $('motionLabel').textContent = motionEnabled ? 'Motion on' : 'Motion off';
  $('motionIcon').textContent = motionEnabled ? 'Ⅱ' : '▷';
  if (!motionEnabled) {
    stopGlitches();
    document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
    revealObserver?.disconnect();
  }
  scheduleScroll();
}
$('motionToggle').addEventListener('click', () => {
  motionEnabled = !motionEnabled && !reducedMotion.matches;
  userMotion = motionEnabled ? 'on' : 'off';
  try { localStorage.setItem('isaac-motion', userMotion); } catch { /* Keep the preference for this visit. */ }
  applyMotion();
});
reducedMotion.addEventListener('change', () => {
  motionEnabled = !reducedMotion.matches && userMotion !== 'off';
  applyMotion();
});
function scheduleScroll() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(updateScroll);
}
function updateScroll() {
  scrollScheduled = false;
  const pageRange = document.documentElement.scrollHeight - innerHeight;
  $('readingProgress').style.transform = `scaleX(${pageRange > 0 ? clamp(scrollY / pageRange) : 0})`;
  const heroRect = hero.getBoundingClientRect();
  const heroProgress = motionEnabled ? clamp(-heroRect.top / heroRect.height) : 0;
  $('heroMarquee').style.transform = `translate3d(${-220 - heroProgress * 550}px,0,0)`;
  $('portraitComposition').style.transform = `translate3d(0,${heroProgress * 85}px,0)`;
  document.querySelector('.hero-copy').style.transform = `translate3d(0,${heroProgress * -60}px,0)`;
  $('portraitFrame').style.setProperty('--scan-y', `${heroProgress * 100}%`);
  const consoleRect = $('signalConsole').getBoundingClientRect();
  const consoleProgress = motionEnabled ? clamp((innerHeight - consoleRect.top) / (innerHeight + consoleRect.height)) : .5;
  $('signalVisual').style.setProperty('--scan-position', `${consoleProgress * 100}%`);
  $('practiceTrack').style.transform = `translate3d(${-40 - heroProgress * 130}px,0,0)`;
  const pRect = perspective.getBoundingClientRect();
  const pProgress = motionEnabled ? clamp((innerHeight - pRect.top) / (innerHeight + pRect.height)) : .5;
  perspectiveWords.forEach((word, index) => { word.style.transform = `translateX(${(pProgress - .5) * (index - 1) * 70}px)`; });
  perspectiveLines.style.setProperty('--line-shift', (pProgress - .5) * 180);
  const contactProgress = motionEnabled ? clamp((innerHeight - $('contact').getBoundingClientRect().top) / (innerHeight + $('contact').offsetHeight)) : 0;
  $('contactAsterisk').style.transform = `translate3d(${contactProgress * 25}px,${contactProgress * -25}px,0)`;
  if (storyElements.length) {
    const target = innerHeight * .48;
    let closest = 0, distance = Infinity;
    storyElements.forEach((story, index) => {
      const rect = story.getBoundingClientRect();
      const next = Math.abs(rect.top + rect.height * .5 - target);
      if (next < distance) { closest = index; distance = next; }
      if (!desktop.matches) {
        const progress = motionEnabled ? clamp((innerHeight - rect.top) / (innerHeight + rect.height)) : .5;
        story.style.setProperty('--mobile-y', `${(progress - .5) * 18}px`);
      }
    });
    setActiveProject(closest);
    const rect = storyElements[closest].getBoundingClientRect();
    const progress = motionEnabled ? clamp((target - rect.top) / rect.height) : .5;
    cards[closest]?.style.setProperty('--image-y', `${(progress - .5) * -30}px`);
    cards[closest]?.style.setProperty('--image-scale', String(1 + Math.abs(progress - .5) * .035));
  }
}
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll);
function tilt(element, target, xName, yName, strength) {
  element.addEventListener('pointermove', event => {
    if (!motionEnabled || event.pointerType === 'touch') return;
    const rect = element.getBoundingClientRect();
    target.style.setProperty(xName, `${-(event.clientY - rect.top - rect.height / 2) / rect.height * strength}deg`);
    target.style.setProperty(yName, `${(event.clientX - rect.left - rect.width / 2) / rect.width * strength}deg`);
  });
  element.addEventListener('pointerleave', () => {
    target.style.setProperty(xName, '0deg'); target.style.setProperty(yName, '0deg');
  });
}
tilt(hero, $('portraitPerspective'), '--rx', '--ry', 8);
tilt($('showcaseTilt'), $('showcaseStage'), '--tilt-x', '--tilt-y', 6);
applyMotion(); observeReveals();
$('year').textContent = new Date().getFullYear();
[...$('heroTitle').children].forEach(prepareGlitchText);
$('heroTitle').addEventListener('pointerenter', () => glitch($('heroTitle')));
(document.fonts?.ready || Promise.resolve()).then(() => glitch($('heroTitle')));
prepareGlitchText($('channelLabel'));

const disciplines = {
  systems: { title: 'Less friction. More possibility.', text: 'Local-first software and thoughtful workflows that make complex work easier to navigate.', tools: 'React / Rust / Tauri / Document automation' },
  ai: { title: 'A little curiosity goes a long way.', text: 'Generative experiments that turn emerging capabilities into something people can try, shape, and share.', tools: 'Generative AI / Prompt design / JavaScript' },
  interaction: { title: 'An invitation to explore.', text: 'Interfaces that respond, stories that unfold, and digital experiences built to be discovered through interaction.', tools: 'Interactive galleries / Motion / Creative development' },
  web: { title: 'Clear, considered, connected.', text: 'Web experiences with a clear purpose, a thoughtful visual identity, and an approachable path from curiosity to action.', tools: 'Responsive design / Front-end development / SEO' }
};
$('signalVisual').innerHTML = disciplineVisual('systems');
document.querySelector('.channel-selector').addEventListener('click', event => {
  const button = event.target.closest('[data-discipline]');
  if (!button || button.dataset.discipline === $('signalConsole').dataset.mode) return;
  document.querySelectorAll('.channel-button').forEach(el => {
    el.classList.toggle('active', el === button);
    el.setAttribute('aria-pressed', String(el === button));
  });
  const mode = button.dataset.discipline;
  const detail = disciplines[mode];
  $('signalConsole').dataset.mode = mode;
  $('channelLabel').textContent = `${number(Object.keys(disciplines).indexOf(mode) + 1)} / ${mode === 'ai' ? 'Applied AI' : mode}`;
  $('signalVisual').innerHTML = disciplineVisual(mode);
  prepareGlitchText($('channelLabel'));
  glitch($('channelLabel'));
  glitch($('signalVisual'));
  $('disciplineDetail').innerHTML = `<h3>${esc(detail.title)}</h3><p>${esc(detail.text)}</p>`;
  $('disciplineTools').textContent = detail.tools;
  if (motionEnabled) $('disciplineDetail').animate([{ opacity: .3, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
});

function setActiveProject(index) {
  if (index === activeIndex || !visibleProjects[index]) return;
  activeIndex = index;
  const project = visibleProjects[index];
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
    card.classList.toggle('past', i < index);
    card.setAttribute('aria-hidden', String(i !== index));
  });
  $('projectJumps').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  $('showcaseNumber').textContent = `${number(index + 1)} / ${number(visibleProjects.length)}`;
  $('showcaseCategory').textContent = project.category;
  $('showcaseTitle').textContent = project.title;
  prepareGlitchText($('showcaseTitle'));
  if (desktop.matches) { glitch($('showcaseTitle')); glitch($('showcaseStage')); }
  $('showcaseOpen').dataset.project = project.id;
  $('showcaseOpen').setAttribute('aria-label', `Read ${project.title} case study`);
  $('showcaseProgress').style.transform = `scaleX(${(index + 1) / visibleProjects.length})`;
}
function renderProjects(category = 'All work') {
  visibleProjects = filterProjects(projects, category);
  activeIndex = -1;
  $('workLayout').hidden = visibleProjects.length === 0;
  $('workEmpty').hidden = visibleProjects.length !== 0;
  $('projectStories').innerHTML = visibleProjects.map(project => {
    const index = projects.indexOf(project);
    const link = project.links[0];
    return `<article class="project-story" id="work-${esc(project.id)}"><div class="project-number mono">${number(index + 1)} / ${esc(project.category)}</div><h3>${esc(project.title)}</h3><div class="mobile-media">${projectVisual(project)}</div><p>${esc(project.summary)}</p><div class="tag-list" aria-label="Tools">${project.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div><div class="story-actions"><button class="case-link" type="button" data-project="${esc(project.id)}" aria-label="Read ${esc(project.title)} case study">Inside the project <span aria-hidden="true">↗</span></button>${link ? `<a class="text-link" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">Visit site ↗</a>` : ''}</div><div class="story-role mono">${esc(project.role)}</div></article>`;
  }).join('');
  $('showcaseStage').innerHTML = visibleProjects.map((project, index) => `<div class="showcase-card" data-id="${esc(project.id)}" aria-hidden="true"><div class="screen-top" aria-hidden="true"><span class="screen-dots"><i></i><i></i><i></i></span><span>SELECTED WORK / ${number(index + 1)}</span></div>${projectVisual(project)}</div>`).join('');
  $('projectJumps').innerHTML = visibleProjects.map((project, index) => `<button class="jump-button" type="button" data-jump="${index}" aria-label="Scroll to ${esc(project.title)}" aria-pressed="false">${number(index + 1)}</button>`).join('');
  $('projectCount').textContent = `${number(visibleProjects.length)} project${visibleProjects.length === 1 ? '' : 's'}`;
  storyElements = [...$('projectStories').children];
  cards = [...$('showcaseStage').children];
  setActiveProject(0);
  scheduleScroll();
}
$('projectJumps').addEventListener('click', event => {
  const button = event.target.closest('[data-jump]');
  if (!button) return;
  storyElements[Number(button.dataset.jump)]?.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'instant', block: 'start' });
});
$('projectFilters').addEventListener('click', event => {
  const filter = event.target.closest('[data-category]');
  if (!filter) return;
  $('projectFilters').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
  renderProjects(filter.dataset.category);
});

const dialog = $('projectDialog');
const contactDialog = $('contactDialog');
let lastProjectTrigger, returnHash = '#work';
function syncModalLock() { document.body.classList.toggle('modal-open', dialog.open || contactDialog.open); }
function openProject(project) {
  $('dialogContent').innerHTML = `<div class="dialog-cover">${projectVisual(project)}</div><div class="dialog-body"><p class="mono">${esc(project.category)}</p><h2 id="dialogTitle">${esc(project.title)}</h2><p class="dialog-summary">${esc(project.summary)}</p><dl class="dialog-facts">${[['Role',project.role],['Focus',project.focus],['Tools',project.tags.join(' · ')],['Status',project.status]].map(([label,value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${[['The challenge',project.problem],['The approach',project.approach],['The outcome',project.outcome]].map(([title,text]) => `<section class="case-section"><h3>${title}</h3><p>${esc(text)}</p></section>`).join('')}<div class="dialog-links">${project.links.map(link => `<a class="button-light" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div></div>`;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  syncModalLock();
}
function syncProjectHash() {
  const slug = location.hash.startsWith('#project/') ? location.hash.slice(9) : '';
  const project = projects.find(project => project.id === slug);
  if (project) openProject(project); else if (dialog.open) dialog.close();
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-project]');
  if (!trigger) return;
  lastProjectTrigger = trigger;
  if (!location.hash.startsWith('#project/')) returnHash = location.hash || '#work';
  const hash = `#project/${trigger.dataset.project}`;
  if (location.hash === hash) syncProjectHash(); else location.hash = hash;
});
$('closeProject').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (location.hash.startsWith('#project/')) history.replaceState(null, '', `${location.pathname}${location.search}${returnHash}`);
  syncModalLock();
  lastProjectTrigger?.focus({ preventScroll: true });
});
addEventListener('hashchange', syncProjectHash);
for (const modal of [dialog, contactDialog]) {
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
}
$('contactOpen').addEventListener('click', () => { contactDialog.showModal(); syncModalLock(); });
$('closeContact').addEventListener('click', () => contactDialog.close());
contactDialog.addEventListener('close', () => { syncModalLock(); $('contactOpen').focus({ preventScroll: true }); });
$('contactForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const status = $('formStatus');
  button.disabled = true; button.textContent = 'Sending…';
  status.classList.remove('error'); status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!response.ok) throw new Error('Message not accepted');
    form.reset(); status.textContent = 'Thanks — your message has been sent. I’ll be in touch.';
  } catch {
    status.classList.add('error'); status.textContent = 'Your message couldn’t be sent. Your text is still here — please try again, or email me directly below.';
  } finally { clearTimeout(timeout); button.disabled = false; button.innerHTML = 'Send message <span aria-hidden="true">↗</span>'; }
});

try {
  const response = await fetch('./content/projects.json');
  if (!response.ok) throw new Error(`Content request returned ${response.status}`);
  projects = validateProjects(await response.json());
  $('navCount').textContent = number(projects.length);
  if (projects.length) {
    const marqueeProjects = [...projects, projects[0]];
    $('heroMarquee').innerHTML = marqueeProjects.map(project => `<span>${esc(project.title)}<sup>${number(projects.indexOf(project) + 1)}</sup></span>`).join('');
  }
  $('projectFilters').innerHTML = getCategories(projects).map((category,index) => `<button class="filter" type="button" aria-pressed="${index === 0}" data-category="${esc(category)}">${esc(category)}</button>`).join('');
  renderProjects(); syncProjectHash();
} catch (error) {
  $('workLayout').hidden = true; $('workError').hidden = false;
  console.error('Project content could not load:', error);
}
