import { escapeHtml } from './project-utils.js';
export function projectVisual(project) {
  if (project.image) return `<div class="project-visual"><img class="project-image" src="${escapeHtml(project.image.src)}" alt="${escapeHtml(project.image.alt)}" loading="lazy" width="1280" height="900"></div>`;
  return `<div class="project-visual"><div class="generic-art" aria-label="${escapeHtml(project.title)} project artwork"><span aria-hidden="true">${escapeHtml(project.title.slice(0,2).toUpperCase())}</span></div></div>`;
}
