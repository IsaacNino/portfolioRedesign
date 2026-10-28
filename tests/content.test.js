import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateProjects,getCategories,filterProjects,safeUrl,escapeHtml} from '../content/project-utils.js';
import {projectVisual} from '../content/project-visuals.js';
const content=JSON.parse(await readFile(new URL('../content/projects.json',import.meta.url),'utf8'));
const sample=()=>structuredClone(content);
test('published portfolio data validates and all categories filter correctly',()=>{
  const projects=validateProjects(content);
  assert.equal(filterProjects(projects,'All work').length,projects.length);
  for(const category of getCategories(projects).slice(1))assert.ok(filterProjects(projects,category).every(p=>p.category===category||p.additionalCategories?.includes(category)));
});
test('adding a project creates its own filter and fallback artwork without layout edits',()=>{
  const data=sample();const added={...data.projects[0],id:'new-experiment',title:'New experiment',category:'New category',featured:false};delete added.image;delete added.video;data.projects.push(added);
  const projects=validateProjects(data);
  assert.ok(getCategories(projects).includes('New category'));
  assert.equal(filterProjects(projects,'New category').length,1);
  assert.match(projectVisual(projects.at(-1)),/generic-art/);
});
test('rejects duplicate ids, missing fields, unsafe links, invalid tags and reserved categories',()=>{
  for(const mutate of [d=>d.projects.push(d.projects[0]),d=>delete d.projects[0].title,d=>d.projects[0].links=[{label:'Unsafe link',url:'javascript:alert(1)'}],d=>d.projects[0].tags=[],d=>d.projects[0].category='All work']){const data=sample();mutate(data);assert.throws(()=>validateProjects(data));}
});
test('accepts optional screenshots and validates alt text and safe URLs',()=>{
  const data=sample();data.projects[0].image={src:'./assets/images/siteShot.webp',alt:'A project screenshot'};assert.doesNotThrow(()=>validateProjects(data));
  data.projects[0].image.alt='';assert.throws(()=>validateProjects(data));
  for(const url of ['javascript:alert(1)','//example.com/x.png','./assets/../secret','https://name:password@example.com','https:\\example.com'])assert.equal(safeUrl(url,{image:true}),false);
});
test('supports agency credits and uncropped artwork without accepting invalid presentation values',()=>{
  const data=sample();data.projects[0].credit='Created with the team at Subvrsive.';data.projects[0].image.fit='contain';
  assert.doesNotThrow(()=>validateProjects(data));assert.match(projectVisual(data.projects[0]),/project-visual-contained/);
  data.projects[0].image.fit='unknown';assert.throws(()=>validateProjects(data));
  data.projects[0].image.fit='cover';data.projects[0].credit=42;assert.throws(()=>validateProjects(data));
});
test('escapes user-authored content and allows an empty portfolio',()=>{
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
  assert.deepEqual(validateProjects({projects:[]}),[]);
});

test('project films require a safe MP4 and descriptive still poster',()=>{
  const data=sample();data.projects[0].video={src:'./assets/videos/demo.mp4',alt:'An interaction preview'};
  assert.doesNotThrow(()=>validateProjects(data));
  const markup=projectVisual(data.projects[0]);
  assert.match(markup,/preload="none"/);assert.match(markup,/data-src=".\/assets\/videos\/demo.mp4"/);assert.match(markup,/poster=/);assert.doesNotMatch(markup,/autoplay/);
  delete data.projects[0].image;assert.throws(()=>validateProjects(data));
  for(const src of ['javascript:alert(1)','./assets/videos/../secret.mp4','./assets/videos/demo.gif']){const invalid=sample();invalid.projects[0].video={src,alt:'Preview'};assert.throws(()=>validateProjects(invalid));}
});

test('CES postcard appears in both AI filters without duplicating projects or filter names',()=>{
  const projects=validateProjects(content);
  assert.deepEqual(filterProjects(projects,'Generative AI').map(p=>p.id),['coca-cola-product-concepts','postcard']);
  assert.ok(filterProjects(projects,'AI & experiments').some(p=>p.id==='postcard'));
  assert.equal(filterProjects(projects,'All work').filter(p=>p.id==='postcard').length,1);
  assert.equal(getCategories(projects).filter(c=>c==='Generative AI').length,1);
  const data=sample();data.projects[0].additionalCategories=['New discipline'];
  assert.ok(getCategories(validateProjects(data)).includes('New discipline'));
  assert.equal(filterProjects(data.projects,'New discipline')[0].id,data.projects[0].id);
  for(const extra of ['Generative AI',[null],[''],['All work'],['Social AR'],['Generative AI','generative ai']]){
    const invalid=sample();invalid.projects[0].additionalCategories=extra;assert.throws(()=>validateProjects(invalid));
  }
});
