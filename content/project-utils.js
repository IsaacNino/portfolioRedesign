/** Shared by the browser, build check, and content tests. No dependencies. */
export const accents = ['violet', 'amber', 'blue', 'sage'];
export function safeUrl(value, { image = false } = {}) {
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return false;
  if (image && /^\.\/assets\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
export function validateProjects(data) {
  if (!data || !Array.isArray(data.projects)) throw new Error('content/projects.json must contain a projects array.');
  const ids = new Set();
  data.projects.forEach((p, i) => {
    const label = `Project ${i + 1} (${p?.id || 'missing id'})`;
    for (const field of ['id','title','category','summary','role','focus','status','problem','approach','outcome']) {
      if (typeof p?.[field] !== 'string' || !p[field].trim()) throw new Error(`${label}: ${field} is required.`);
    }
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(p.id) || ids.has(p.id)) throw new Error(`${label}: use a unique lowercase hyphenated id.`);
    ids.add(p.id);
    if (p.category.trim().toLowerCase() === 'all work') throw new Error(`${label}: category "All work" is reserved for the filter.`);
    if (!Array.isArray(p.tags) || !p.tags.length || p.tags.some(t => typeof t !== 'string' || !t.trim())) throw new Error(`${label}: tags must be a nonempty list of text.`);
    if (p.featured !== undefined && typeof p.featured !== 'boolean') throw new Error(`${label}: featured must be true or false.`);
    if (p.accent !== undefined && !accents.includes(p.accent)) throw new Error(`${label}: unsupported accent.`);
    if (p.image && (!safeUrl(p.image.src, { image: true }) || typeof p.image.alt !== 'string' || !p.image.alt.trim())) throw new Error(`${label}: image needs a safe src and descriptive alt.`);
    if (!Array.isArray(p.links) || p.links.some(l => typeof l.label !== 'string' || !l.label.trim() || !safeUrl(l.url))) throw new Error(`${label}: links must contain labels and HTTPS URLs (or an empty array).`);
  });
  return data.projects;
}
export function getCategories(projects) { return ['All work', ...new Set(projects.map(p => p.category))]; }
export function filterProjects(projects, category) { return category === 'All work' ? projects : projects.filter(p => p.category === category); }
export function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
