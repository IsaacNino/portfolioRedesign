import { motionEnabled, onMotionChange } from './motion.js';
const rowsElement = document.getElementById('projectRows');
const hint = document.getElementById('galleryHint');
const loadState = document.getElementById('projectLoadState');
const retry = document.getElementById('projectRetry');
const dialog = document.getElementById('projectDialog');
const dialogContent = document.getElementById('projectDialogContent');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const placeholder = './assets/projects/preview-pending.svg';
let dialogTrigger;
let rows = [];
let idleUntil = 0;
let keyboardFocus = false;
let pressed = false;
let galleryVisible = false;
let previousFrame = 0;
let speedRamp = 0;
const IDLE_DELAY = 5000;
const DRIFT_SPEED = 16;

function interact() {
  idleUntil = performance.now() + IDLE_DELAY;
  speedRamp = 0;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Treat data as text. Only web URLs and same-site relative paths are supported.
function webURL(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const url = new URL(value, document.baseURI);
  return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
}

function projectImage(project, eager = false) {
  const image = element('img', 'showcase-image');
  image.src = webURL(project.image) || placeholder;
  image.classList.toggle('is-placeholder', image.src.endsWith('/preview-pending.svg'));
  image.alt = project.imageAlt;
  image.width = 1200;
  image.height = 750;
  image.loading = eager ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.src = placeholder;
    image.classList.add('is-placeholder');
    image.alt = `Preview unavailable for ${project.title}.`;
  }, { once: true });
  return image;
}

function projectLink(label, value, project) {
  const href = webURL(value);
  if (!href) return null;
  const link = element('a', 'project-action', label);
  link.href = href;
  link.setAttribute('aria-label', `${label}: ${project.title}`);
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  arrow.setAttribute('viewBox', '0 0 24 24');
  arrow.setAttribute('width', '16');
  arrow.setAttribute('height', '16');
  arrow.setAttribute('fill', 'none');
  arrow.setAttribute('stroke', 'currentColor');
  arrow.setAttribute('stroke-width', '1.5');
  arrow.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M6 18 18 6M6 6h12v12');
  arrow.append(path);
  link.append(arrow);
  return link;
}

function openDetails(project, trigger) {
  interact();
  dialogTrigger = trigger;
  dialogContent.replaceChildren();
  dialogContent.append(projectImage(project, true));
  const body = element('div', 'project-story');
  body.append(element('p', 'studio-eyebrow', project.category));
  const title = element('h2', '', project.title);
  title.id = 'projectDialogTitle';
  title.tabIndex = -1;
  body.append(title, element('p', 'project-story-summary', project.summary));
  const facts = element('dl', 'project-facts');
  for (const [key, label] of [['role', 'My role'], ['status', 'Status'], ['focus', 'Focus'], ['tools', 'Tools']]) {
    if (!project.details[key]) continue;
    const pair = element('div');
    pair.append(element('dt', '', label), element('dd', '', project.details[key]));
    facts.append(pair);
  }
  body.append(facts);
  for (const [key, label] of [['problem', 'The challenge'], ['approach', 'The approach'], ['outcome', 'The outcome']]) {
    if (!project.details[key]) continue;
    const section = element('section', 'project-story-section');
    section.append(element('h3', '', label), element('p', '', project.details[key]));
    body.append(section);
  }
  const live = projectLink('Visit live site', project.liveUrl, project);
  if (live) body.append(live);
  dialogContent.append(body);
  dialog.showModal();
  document.documentElement.classList.add('dialog-open');
  dialog.scrollTop = 0;
  document.getElementById('projectDialogClose').focus({ preventScroll: true });
}

document.getElementById('projectDialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.documentElement.classList.remove('dialog-open');
  dialogTrigger?.focus({ preventScroll: true });
  interact();
});

function cardFor(project, index, copy = false) {
  const item = element('li', 'showcase-item');
  item.dataset.projectId = project.id;
  if (copy) { item.dataset.copy = ''; item.setAttribute('aria-hidden', 'true'); }
  const card = element('article', 'showcase-card');
  const media = element('div', 'showcase-media');
  media.append(projectImage(project, index === 0));
  const number = element('span', 'project-number', String(index + 1).padStart(2, '0'));
  number.setAttribute('aria-hidden', 'true');
  media.append(number);
  const previewLabel = element('span', 'preview-label', 'Project preview coming soon');
  previewLabel.setAttribute('aria-hidden', 'true');
  media.append(previewLabel);
  const body = element('div', 'showcase-body');
  body.append(element('p', 'studio-eyebrow', project.category), element('h3', '', project.title));
  const actions = element('div', 'project-actions');
  const caseStudy = projectLink('Explore project', project.caseStudyUrl, project);
  if (caseStudy) {
    actions.append(caseStudy);
  } else if (project.details && Object.values(project.details).some(Boolean)) {
    const button = element('button', 'project-action', 'Explore project');
    button.type = 'button';
    button.setAttribute('aria-label', `Explore project: ${project.title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => {
      const original = rows.flatMap(row => row.cards).find(card => card.dataset.projectId === project.id);
      openDetails(project, copy ? original.querySelector('button.project-action') : button);
    });
    actions.append(button);
  }
  const live = projectLink('Visit live site', project.liveUrl, project);
  if (live) actions.append(live);
  if (actions.children.length) body.append(actions);
  card.append(media, body);
  item.append(card);
  if (copy) item.querySelectorAll('a, button').forEach(action => {
    action.tabIndex = -1;
    // Copies are visual loop continuations, never extra keyboard stops.
    action.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') event.preventDefault();
    });
  });
  return item;
}

function cardLeft(row, card) {
  return card.getBoundingClientRect().left - row.track.getBoundingClientRect().left + row.track.scrollLeft;
}

function measure(row) {
  const { track, cards } = row;
  const oldCycle = row.cycle;
  const phase = oldCycle ? ((track.scrollLeft - row.start) % oldCycle + oldCycle) % oldCycle / oldCycle : 0;
  row.start = cardLeft(row, cards[0]);
  row.step = cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  row.cycle = row.step * cards.length;
  track.scrollLeft = motion.matches ? Math.min(track.scrollLeft, track.scrollWidth - track.clientWidth) : row.start + phase * row.cycle;
  row.position = track.scrollLeft;
  row.controls.hidden = track.scrollWidth <= track.clientWidth + 2;
}

function navigate(row, direction) {
  interact();
  if (!motion.matches && row.cards.length > 1) {
    // Normalize into the middle copy without changing what is visible.
    row.track.scrollLeft = row.start + ((row.track.scrollLeft - row.start) % row.cycle + row.cycle) % row.cycle;
  }
  row.track.scrollBy({ left: direction * row.step, behavior: motion.matches ? 'instant' : 'smooth' });
}

function createRow(projects, rowIndex, indexOffset) {
  const section = element('div', 'project-row');
  const toolbar = element('div', 'showcase-toolbar');
  toolbar.append(element('p', 'project-row-label', `${String(rowIndex + 1).padStart(2, '0')} / Selected work`));
  const controls = element('div', 'showcase-buttons');
  const track = element('ul', 'project-track');
  track.id = rowIndex === 0 ? 'projectTrack' : 'projectTrackBottom';
  track.tabIndex = 0;
  track.setAttribute('aria-label', `${rowIndex ? 'Bottom' : 'Top'} project row`);
  track.setAttribute('aria-describedby', 'projectHelp');
  track.classList.toggle('single-project', projects.length === 1);
  const row = { track, controls, cards: [], start: 0, cycle: 0, step: 0, position: 0 };
  for (const [direction, label, glyph] of [[-1, 'Previous', '←'], [1, 'Next', '→']]) {
    const button = element('button', '', glyph);
    button.type = 'button';
    button.setAttribute('aria-label', `${label} project in ${rowIndex ? 'bottom' : 'top'} row`);
    button.setAttribute('aria-controls', track.id);
    button.addEventListener('click', () => navigate(row, direction));
    controls.append(button);
  }
  toolbar.append(controls);
  const groups = projects.length > 1 ? 5 : 1;
  for (let group = 0; group < groups; group++) {
    const copy = group !== Math.floor(groups / 2);
    projects.forEach((project, index) => {
      const card = cardFor(project, index + indexOffset, copy);
      track.append(card);
      if (!copy) row.cards.push(card);
    });
  }
  track.addEventListener('keydown', event => {
    if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    interact();
    if (event.key.startsWith('Arrow')) navigate(row, event.key === 'ArrowLeft' ? -1 : 1);
    else track.scrollTo({ left: cardLeft(row, event.key === 'Home' ? row.cards[0] : row.cards.at(-1)), behavior: motion.matches ? 'instant' : 'smooth' });
  });
  track.addEventListener('focusin', event => {
    const card = event.target.closest('.showcase-item');
    if (!card) return;
    if (card.hasAttribute('data-copy')) {
      const original = row.cards.find(item => item.dataset.projectId === card.dataset.projectId);
      const actionIndex = [...card.querySelectorAll('.project-action')].indexOf(event.target);
      original.querySelectorAll('.project-action')[actionIndex]?.focus({ preventScroll: true });
      return;
    }
    const rect = card.getBoundingClientRect();
    const viewport = track.getBoundingClientRect();
    if (rect.left < viewport.left || rect.right > viewport.right) track.scrollTo({ left: cardLeft(row, card), behavior: 'instant' });
  });
  let drag;
  let suppressClick = false;
  track.addEventListener('pointerdown', event => {
    pressed = true;
    if (event.pointerType === 'mouse' && event.button === 0) drag = { x: event.clientX, left: track.scrollLeft, moved: false };
  });
  track.addEventListener('pointermove', event => {
    if (!drag) return;
    const distance = drag.x - event.clientX;
    if (Math.abs(distance) > 6) {
      drag.moved = true;
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    }
    if (drag.moved) { event.preventDefault(); track.scrollLeft = drag.left + distance; }
  });
  const release = () => {
    if (drag?.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
    drag = null;
    pressed = false;
    track.classList.remove('is-dragging');
    interact();
  };
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  track.addEventListener('lostpointercapture', release);
  window.addEventListener('pointerup', () => { if (drag || pressed) release(); });
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  track.addEventListener('scroll', () => {
    // Extend the idle period through native touch momentum and arrow scrolling.
    if (performance.now() < idleUntil) interact();
  }, { passive: true });
  section.append(toolbar, track);
  rowsElement.append(section);
  row.resize = new ResizeObserver(() => measure(row));
  row.resize.observe(track);
  return row;
}

rowsElement.addEventListener('pointerenter', interact);
rowsElement.addEventListener('pointermove', interact);
rowsElement.addEventListener('pointerleave', interact);
rowsElement.addEventListener('pointerdown', () => { keyboardFocus = false; interact(); });
rowsElement.addEventListener('wheel', interact, { passive: true });
rowsElement.addEventListener('keydown', () => { keyboardFocus = true; interact(); });
rowsElement.addEventListener('focusin', event => { keyboardFocus = event.target.matches(':focus-visible'); interact(); });
rowsElement.addEventListener('focusout', event => { if (!rowsElement.contains(event.relatedTarget)) { keyboardFocus = false; interact(); } });
new IntersectionObserver(entries => { galleryVisible = entries[0].isIntersecting; }, { threshold: .05 }).observe(rowsElement);
onMotionChange(() => {
  rows.forEach(measure);
  interact();
  hint.textContent = motion.matches ? 'Swipe or use the arrows to explore' : !motionEnabled() ? 'Motion off · Drag, swipe, or use the arrows to explore' : 'Drag, swipe, or use the arrows · Drift returns after 5 seconds idle';
});

function animate(now) {
  const delta = Math.min((now - (previousFrame || now)) / 1000, .05);
  previousFrame = now;
  const moving = motionEnabled() && galleryVisible && !pressed && !keyboardFocus && now >= idleUntil && !document.querySelector('dialog[open]');
  if (moving) speedRamp = Math.min(1, speedRamp + delta / .8);
  else speedRamp = 0;
  rows.forEach((row, index) => {
    if (!moving || row.cards.length < 2 || !row.cycle) { row.position = row.track.scrollLeft; return; }
    row.position += (index ? -1 : 1) * DRIFT_SPEED * delta * speedRamp;
    if (row.position < row.start - row.cycle / 2) row.position += row.cycle;
    if (row.position > row.start + row.cycle / 2) row.position -= row.cycle;
    row.track.scrollLeft = row.position;
  });
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function validate(projects) {
  if (!Array.isArray(projects)) throw new Error('Project content must be an array.');
  const ids = new Set();
  for (const project of projects) {
    for (const field of ['id', 'title', 'summary', 'image', 'imageAlt', 'category']) {
      if (typeof project?.[field] !== 'string' || !project[field].trim()) throw new Error(`Missing project field: ${field}`);
    }
    if (ids.has(project.id)) throw new Error(`Duplicate project id: ${project.id}`);
    ids.add(project.id);
    if (!webURL(project.image)) throw new Error('Invalid project image URL.');
    for (const field of ['caseStudyUrl', 'liveUrl']) {
      if (project[field] && !webURL(project[field])) throw new Error(`Invalid project URL: ${field}`);
    }
    if (project.tags && (!Array.isArray(project.tags) || project.tags.some(tag => typeof tag !== 'string'))) throw new Error('Project tags must be an array of text.');
    if (project.details && (typeof project.details !== 'object' || Array.isArray(project.details) || Object.values(project.details).some(value => typeof value !== 'string'))) throw new Error('Project details must contain text fields.');
  }
  return projects;
}

async function loadProjects() {
  retry.hidden = true;
  document.getElementById('projectLoadMessage').textContent = 'Loading selected work…';
  try {
    const response = await fetch(new URL('./data/projects.json', import.meta.url));
    if (!response.ok) throw new Error(`Project request failed: ${response.status}`);
    const projects = validate(await response.json());
    if (!projects.length) {
      document.getElementById('work').hidden = true;
      document.querySelectorAll('a[href="#work"]').forEach(link => { link.hidden = true; });
      return;
    }
    rows.forEach(row => row.resize.disconnect());
    rowsElement.replaceChildren();
    rowsElement.hidden = false;
    const split = Math.ceil(projects.length / 2);
    rows = [createRow(projects.slice(0, split), 0, 0)];
    if (projects.length > 1) rows.push(createRow(projects.slice(split), 1, split));
    rows.forEach(measure);
    loadState.hidden = true;
  } catch (error) {
    document.getElementById('projectLoadMessage').textContent = 'Selected work couldn’t load. Please try again, or get in touch below.';
    retry.hidden = false;
    console.error(error);
  }
}

retry.addEventListener('click', loadProjects);
loadProjects();
