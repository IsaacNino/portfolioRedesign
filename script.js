import { validateProjects, getCategories, filterProjects, escapeHtml as esc } from './content/project-utils.js';
import { projectVisual } from './content/project-visuals.js';

const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let userMotion;
try { userMotion = localStorage.getItem('isaac-motion'); } catch { /* Storage can be unavailable in private browsing. */ }
let motionEnabled = userMotion ? userMotion === 'on' && !reducedMotion.matches : !reducedMotion.matches;
const scene = document.querySelector('.industrial-scene');
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); revealObserver.unobserve(entry.target); } });
}, { threshold: 0.08 }) : null;
function observeReveals(root = document) {
  root.querySelectorAll('.reveal').forEach(el => {
    if (motionEnabled && revealObserver && el.getBoundingClientRect().top > innerHeight * .9) {
      el.classList.add('reveal-pending'); revealObserver.observe(el);
    }
  });
}
function applyMotion() {
  document.body.classList.toggle('motion-enabled', motionEnabled);
  document.body.classList.toggle('motion-off', !motionEnabled);
  $('motionToggle').setAttribute('aria-pressed', String(!motionEnabled));
  $('motionToggle').setAttribute('aria-label', motionEnabled ? 'Pause animations' : 'Animations paused; enable if system motion settings allow');
  $('motionLabel').textContent = motionEnabled ? 'on' : 'off';
  if (!motionEnabled) document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
  if (!motionEnabled) scene.style.transform = 'none';
}
$('motionToggle').addEventListener('click', () => {
  motionEnabled = !motionEnabled && !reducedMotion.matches;
  userMotion = motionEnabled ? 'on' : 'off';
  try { localStorage.setItem('isaac-motion', userMotion); } catch { /* Preference remains active for this visit. */ }
  applyMotion();
});
reducedMotion.addEventListener('change', () => { motionEnabled = !reducedMotion.matches && userMotion !== 'off'; applyMotion(); });
applyMotion(); observeReveals();

let scrollScheduled = false;
function updateScroll() {
  const range = document.documentElement.scrollHeight - innerHeight;
  $('readingProgress').style.transform = `scaleX(${range > 0 ? Math.min(1, scrollY / range) : 0})`;
  const heroProgress = Math.min(1, scrollY / Math.max(1, innerHeight));
  scene.style.transform = motionEnabled ? `translate3d(0,${heroProgress * 60}px,0) scale(${1 + heroProgress * .04})` : 'none';
  scrollScheduled = false;
}
addEventListener('scroll', () => { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); } }, { passive:true });
addEventListener('resize', updateScroll); updateScroll();
$('year').textContent = new Date().getFullYear();
function updateTime() { $('localTime').textContent = new Date().toLocaleTimeString('en-US', { timeZone:'America/Denver',hour:'2-digit',minute:'2-digit',hour12:false }) + ' MT'; }
updateTime(); setInterval(updateTime, 60000);

function closeMenu(restore = false) {
  $('navigation').classList.remove('is-open');
  $('menuToggle').setAttribute('aria-expanded', 'false');
  $('menuToggle').lastElementChild.textContent = '＋';
  if (restore) $('menuToggle').focus();
}
$('menuToggle').addEventListener('click', () => {
  const open = $('menuToggle').getAttribute('aria-expanded') !== 'true';
  $('navigation').classList.toggle('is-open', open);
  $('menuToggle').setAttribute('aria-expanded', String(open));
  $('menuToggle').lastElementChild.textContent = open ? '−' : '＋';
});
$('navigation').addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('menuToggle').getAttribute('aria-expanded') === 'true') closeMenu(true); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

let projects = [];
let lastProjectTrigger;
let returnHash = '#work';
const dialog = $('projectDialog');
function renderProjects(category = 'All work') {
  const filtered = filterProjects(projects, category);
  $('projectsGrid').innerHTML = filtered.map(project => {
    const index = projects.indexOf(project);
    return `<article class="project-card reveal${project.featured && category === 'All work' ? ' featured' : ''}" data-accent="${esc(project.accent || 'acid')}"><button class="project-art-button" type="button" data-project="${esc(project.id)}" aria-label="Explore ${esc(project.title)} case study">${projectVisual(project,index)}<span class="project-open" aria-hidden="true">↗</span></button><div class="project-info"><div><p class="project-meta">${String(index + 1).padStart(2,'0')} / ${esc(project.category)}</p><h3><button data-project="${esc(project.id)}" type="button">${esc(project.title)}</button></h3><p class="project-summary">${esc(project.summary)}</p><div class="tag-list" aria-label="Tools">${project.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div></div><button class="case-link" data-project="${esc(project.id)}" type="button" aria-label="Read ${esc(project.title)} case study">CASE STUDY <span aria-hidden="true">↗</span></button></div></article>`;
  }).join('');
  $('projectCount').textContent = `${String(filtered.length).padStart(2,'0')} PROJECT${filtered.length === 1 ? '' : 'S'}`;
  observeReveals($('projectsGrid')); updateScroll();
}
function openProject(project) {
  $('dialogContent').innerHTML = `<div class="dialog-cover">${projectVisual(project,projects.indexOf(project))}</div><div class="dialog-body"><p class="eyebrow">${esc(project.category)}</p><h2 id="dialogTitle">${esc(project.title)}</h2><p class="dialog-summary">${esc(project.summary)}</p><dl class="dialog-facts">${[['Role',project.role],['Focus',project.focus],['Tools',project.tags.join(' · ')],['Status',project.status]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${[['The challenge',project.problem],['The approach',project.approach],['The outcome',project.outcome]].map(([title,text])=>`<section class="case-section"><h3>${title}</h3><p>${esc(text)}</p></section>`).join('')}<div class="dialog-links">${project.links.map(link=>`<a class="button button-light" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div></div>`;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
function syncProjectHash() {
  const slug = location.hash.startsWith('#project/') ? location.hash.slice(9) : '';
  const project = projects.find(p => p.id === slug);
  if (project) openProject(project); else if (dialog.open) dialog.close();
}
$('projectsGrid').addEventListener('click', event => {
  const trigger = event.target.closest('[data-project]');
  if (!trigger) return;
  lastProjectTrigger = trigger;
  if (!location.hash.startsWith('#project/')) returnHash = location.hash || '#work';
  const hash = `#project/${trigger.dataset.project}`;
  if (location.hash === hash) syncProjectHash(); else location.hash = hash;
});
$('closeProject').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (location.hash.startsWith('#project/')) history.replaceState(null,'',`${location.pathname}${location.search}${returnHash}`);
  lastProjectTrigger?.focus({preventScroll:true});
});
addEventListener('hashchange', syncProjectHash);
for (const modal of [dialog,$('contactDialog')]) {
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  });
}
try {
  const response = await fetch('./content/projects.json');
  if (!response.ok) throw new Error(`Content request returned ${response.status}`);
  projects = validateProjects(await response.json());
  $('projectFilters').innerHTML = getCategories(projects).map((category,index)=>`<button class="filter" type="button" aria-pressed="${index===0}" data-category="${esc(category)}">${esc(category)}</button>`).join('');
  $('projectFilters').addEventListener('click', event => {
    const filter = event.target.closest('[data-category]');
    if (!filter) return;
    $('projectFilters').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===filter)));
    renderProjects(filter.dataset.category);
  });
  renderProjects(); syncProjectHash();
} catch (error) { $('workError').hidden = false; console.error('Project content could not load:',error); }

$('contactOpen').addEventListener('click',()=> $('contactDialog').showModal());
$('closeContact').addEventListener('click',()=> $('contactDialog').close());
$('contactForm').addEventListener('submit',async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const status = $('formStatus');
  button.disabled = true; button.textContent = 'Sending…';
  status.classList.remove('error'); status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),15000);
  try {
    const response = await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal});
    if (!response.ok) throw new Error('Message not accepted');
    form.reset(); status.textContent = 'Thanks — your message has been sent. I’ll be in touch.';
  } catch {
    status.classList.add('error'); status.textContent = 'Your message couldn’t be sent. Your text is still here — please try again, or email me directly below.';
  } finally { clearTimeout(timeout); button.disabled = false; button.innerHTML = 'Send message <span aria-hidden="true">↗</span>'; }
});
