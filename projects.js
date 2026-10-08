const track = document.getElementById('projectTrack');
const controls = document.getElementById('projectControls');
const previous = document.getElementById('projectPrevious');
const next = document.getElementById('projectNext');
const status = document.getElementById('projectStatus');
const footnote = document.getElementById('projectFootnote');
const loadState = document.getElementById('projectLoadState');
const retry = document.getElementById('projectRetry');
const dialog = document.getElementById('projectDialog');
const dialogContent = document.getElementById('projectDialogContent');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const placeholder = './assets/projects/preview-pending.svg';
let cards = [];
let activeIndex = 0;
let scrollTimer;
let dialogTrigger;

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
});

function cardFor(project, index) {
  const item = element('li', 'showcase-item');
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
  body.append(element('p', 'studio-eyebrow', project.category), element('h3', '', project.title), element('p', 'showcase-summary', project.summary));
  if (project.tags?.length) {
    const tags = element('ul', 'showcase-tags');
    tags.setAttribute('aria-label', 'Project tags');
    project.tags.forEach(tag => tags.append(element('li', '', tag)));
    body.append(tags);
  }
  const actions = element('div', 'project-actions');
  const caseStudy = projectLink('Explore project', project.caseStudyUrl, project);
  if (caseStudy) {
    actions.append(caseStudy);
  } else if (project.details && Object.values(project.details).some(Boolean)) {
    const button = element('button', 'project-action', 'Explore project');
    button.type = 'button';
    button.setAttribute('aria-label', `Explore project: ${project.title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', () => openDetails(project, button));
    actions.append(button);
  }
  const live = projectLink('Visit live site', project.liveUrl, project);
  if (live) actions.append(live);
  if (actions.children.length) body.append(actions);
  card.append(media, body);
  item.append(card);
  return item;
}

function cardLeft(card) {
  return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
}

function updateControls() {
  if (!cards.length) return;
  activeIndex = cards.reduce((best, card, index) => Math.abs(cardLeft(card) - track.scrollLeft) < Math.abs(cardLeft(cards[best]) - track.scrollLeft) ? index : best, 0);
  const overflowing = track.scrollWidth > track.clientWidth + 2;
  controls.hidden = !overflowing;
  footnote.hidden = !overflowing;
  previous.disabled = track.scrollLeft < 2;
  next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  const text = `Project ${activeIndex + 1} of ${cards.length}`;
  if (status.textContent !== text) status.textContent = text;
}

function goTo(index, animate = true) {
  if (!cards.length) return;
  const target = Math.max(0, Math.min(cards.length - 1, index));
  track.scrollTo({ left: cardLeft(cards[target]), behavior: animate && !motion.matches ? 'smooth' : 'instant' });
  activeIndex = target;
}

previous.addEventListener('click', () => goTo(activeIndex - 1));
next.addEventListener('click', () => goTo(activeIndex + 1));
track.addEventListener('keydown', (event) => {
  if (event.target !== track || event.altKey || event.ctrlKey || event.metaKey) return;
  const keys = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: cards.length - 1 };
  if (!(event.key in keys)) return;
  event.preventDefault();
  goTo(keys[event.key]);
});
track.addEventListener('focusin', (event) => {
  const card = event.target.closest('.showcase-item');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const viewport = track.getBoundingClientRect();
  if (rect.left < viewport.left - 1 || rect.right > viewport.right + 1) goTo(cards.indexOf(card), false);
});
track.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(updateControls, 120);
}, { passive: true });

// A trailing space allows the final card to align with the first card's position.
// It never creates an extra slide or duplicates project links.
const resize = new ResizeObserver(() => {
  if (!cards.length) return;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  track.style.setProperty('--end-space', `${Math.max(0, track.clientWidth - cards.at(-1).offsetWidth - gap)}px`);
  goTo(activeIndex, false);
  updateControls();
});
resize.observe(track);

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
    track.replaceChildren(...projects.map(cardFor));
    cards = [...track.children];
    track.classList.toggle('single-project', cards.length === 1);
    track.hidden = false;
    loadState.hidden = true;
    requestAnimationFrame(updateControls);
  } catch (error) {
    document.getElementById('projectLoadMessage').textContent = 'Selected work couldn’t load. Please try again, or get in touch below.';
    retry.hidden = false;
    console.error(error);
  }
}

retry.addEventListener('click', loadProjects);
loadProjects();
