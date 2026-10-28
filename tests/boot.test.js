import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/boot.js', import.meta.url), 'utf8');
function harness({ reduced = false, paused = false, hash = '' } = {}) {
  let now = 0, serial = 0;
  const jobs = new Map(), events = new Map(), classes = new Set(), elements = new Map();
  const element = () => ({ inert: false, hidden: false, dataset: {}, style: {}, textContent: '', tagName: 'DIV', addEventListener() {}, contains: () => false, querySelector: () => ({ textContent: '' }) });
  for (const id of ['bootScreen','bootStatus','bootSkip','bootCount','bootFill']) elements.set(id, element());
  for (const key of ['interface','type','portrait','work']) elements.set(`[data-boot-check="${key}"]`, element());
  const main = element(), portrait = { complete: true, naturalWidth: 200 };
  const schedule = (callback, delay, repeat = false) => { const id = ++serial; jobs.set(id, {callback, due: now + delay, delay, repeat}); return id; };
  const context = {
    document: { documentElement: {classList:{add:(...values)=>values.forEach(x=>classes.add(x)),remove:(...values)=>values.forEach(x=>classes.delete(x))}},
      body:{children:[elements.get('bootScreen'),main]}, fonts:{ready:Promise.resolve()}, activeElement:null,
      getElementById:id=>elements.get(id), querySelector:s=>s==='#portraitFrame img'?portrait:elements.get(s),
      addEventListener:(type,fn)=>events.set(type,fn), removeEventListener:type=>events.delete(type)},
    matchMedia:()=>({matches:reduced,addEventListener:(type,fn)=>events.set('preference',fn),removeEventListener:()=>events.delete('preference')}),
    localStorage:{getItem:()=>paused?'off':null},location:{hash},performance:{now:()=>now},
    setTimeout:(fn,delay)=>schedule(fn,delay),clearTimeout:id=>jobs.delete(id),setInterval:(fn,delay)=>schedule(fn,delay,true),clearInterval:id=>jobs.delete(id),
    addEventListener:(type,fn)=>events.set(type,fn),dispatchEvent:event=>events.get(event.type)?.(event),Event:class{constructor(type){this.type=type;}},window:{}
  };
  runInNewContext(source,context);
  function advance(ms) {
    const end = now + ms;
    while (true) {
      const entry = [...jobs].filter(([,job])=>job.due<=end).sort((a,b)=>a[1].due-b[1].due)[0];
      if (!entry) break;
      const [id,job]=entry; now=job.due; if(job.repeat) job.due+=job.delay; else jobs.delete(id); job.callback();
    }
    now=end;
  }
  return {context,main,classes,jobs,elements,events,advance};
}

test('loader bypasses reduced motion, saved motion pause, and direct section links',()=>{
  for(const options of [{reduced:true},{paused:true},{hash:'#project/intrust'}]) {
    const h=harness(options); assert.equal(h.classes.size,0); assert.equal(h.jobs.size,0);
  }
});
test('watchdog reveals the page even if the app never initializes',()=>{
  const h=harness(); assert.ok(h.classes.has('boot-pending')); h.advance(4500);
  assert.equal(h.classes.size,0); assert.equal(h.elements.get('bootScreen').hidden,true); assert.equal(h.jobs.size,0);
});
test('Escape immediately releases content and clears all pending work',()=>{
  const h=harness(); h.events.get('DOMContentLoaded')(); assert.equal(h.main.inert,true);
  h.events.get('keydown')({key:'Escape'}); assert.equal(h.main.inert,false); assert.equal(h.jobs.size,0);
});
test('completed and failed assets both settle, then restore the page after the reveal',async()=>{
  const h=harness(); h.events.get('DOMContentLoaded')(); await Promise.resolve();
  h.context.window.signalBoot.ready('interface'); h.context.window.signalBoot.ready('work',false);
  h.advance(1680); assert.ok(h.classes.has('boot-exit'));
  assert.equal(h.elements.get('[data-boot-check="work"]').dataset.state,'fallback');
  h.advance(480); assert.equal(h.classes.size,0); assert.equal(h.main.inert,false); assert.equal(h.jobs.size,0);
});
