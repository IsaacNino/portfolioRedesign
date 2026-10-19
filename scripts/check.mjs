import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateProjects } from '../content/project-utils.js';
export async function check() {
  const root = fileURLToPath(new URL('../',import.meta.url));
  const data = JSON.parse(await readFile(resolve(root,'content/projects.json'),'utf8'));
  const projects = validateProjects(data);
  for (const p of projects) if (p.image?.src.startsWith('./')) await access(resolve(root,p.image.src));
  const html = await readFile(resolve(root,'index.html'),'utf8');
  const assets = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(m=>m[1]);
  for (const asset of assets) await access(resolve(root,asset));
  console.log(`Validated ${projects.length} projects and ${assets.length} local page assets.`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await check();
