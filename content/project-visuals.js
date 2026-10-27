import { escapeHtml as esc } from './project-utils.js';
export function projectVisual(project) {
  const contained = project.image?.fit === 'contain' ? ' project-visual-contained' : '';
  if (project.video && project.image) return `<div class="project-visual project-film${contained}"><video class="project-image" data-project-video data-src="${esc(project.video.src)}" poster="${esc(project.image.src)}" aria-label="${esc(project.video.alt)}" muted loop playsinline preload="none" width="1280" height="900"></video><button type="button" class="film-toggle" aria-label="Play ${esc(project.title)} preview" data-film-title="${esc(project.title)}"><span aria-hidden="true">▷</span> Play preview</button></div>`;
  if (project.image) return `<div class="project-visual${contained}"><img class="project-image" src="${esc(project.image.src)}" alt="${esc(project.image.alt)}" loading="lazy" width="1280" height="900"></div>`;
  return `<div class="project-visual"><div class="generic-art" aria-label="${esc(project.title)} project artwork"><span aria-hidden="true">${esc(project.title.slice(0,2).toUpperCase())}</span></div></div>`;
}
