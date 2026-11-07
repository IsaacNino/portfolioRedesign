import { escapeHtml as esc } from './project-utils.js';
import { practices } from './practice-data.js';

const text = (x,y,value,kind='') => `<text x="${x}" y="${y}" class="${kind}">${esc(value)}</text>`;
const line = (d,kind='') => `<path d="${d}" class="${kind}"/>`;
const box = (x,y,w,h,kind='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${kind}"/>`;
const group = (id,active,content) => `<g class="blueprint-layer${id===active?' is-selected':''}" data-map-layer="${id}">${content}</g>`;
const bars = (x,y,widths,gap=12) => widths.map((w,i)=>line(`M${x} ${y+i*gap}h${w}`,'copy-line')).join('');
const panel = (x,y,w,h,label,code) => box(x,y,w,h,'module')+line(`M${x} ${y+34}h${w}`,'rule')+text(x+12,y+21,label,'module-title')+text(x+w-34,y+21,code,'module-code');

function systems(active) {
  return text(20,22,'CAPTURE','lane-title')+text(280,22,'DECIDE','lane-title')+text(550,22,'ASSEMBLE','lane-title')+
    group('intake',active,panel(20,42,204,235,'STRUCTURED INTAKE','01')+['People & roles','Relationships','Intake answers'].map((s,i)=>box(34,91+i*49,176,36,'field')+text(44,113+i*49,s,'field-label')+box(194,103+i*49,5,5,'indicator')).join('')+text(34,257,'Guided input → named data','small-note'))+
    line('M224 155H251V155H279','bus')+
    group('logic',active,panel(280,42,200,235,'DECISION LAYER','02')+box(296,94,168,44,'field')+text(309,113,'IF / WHEN','accent-label')+text(309,128,'Intake conditions','small-note')+line('M380 139V155','bus')+box(296,155,168,44,'field')+text(309,175,'SELECT','accent-label')+text(309,190,'Content + clauses','small-note')+line('M380 200V218','bus')+text(310,239,'Template mapping','field-label'))+
    line('M480 155H550','bus')+
    group('assembly',active,panel(550,42,190,235,'DOCX PACKAGE','03')+box(584,91,128,153,'paper-back')+box(575,84,128,153,'paper')+text(589,106,'DOCUMENT','paper-label')+bars(589,121,[91,76,91,58],13)+line('M589 174h91','rule')+bars(589,187,[84,91,64],12)+text(567,261,'Structure · styles · content','small-note'))+
    group('review',active,box(20,320,720,51,'review-band')+text(34,342,'04 / REFINEMENT LOOP','accent-label')+text(34,359,'Read the output. Refine the rules, templates, and experience.','small-note')+line('M644 277V299H120V277','feedback')+line('M115 285l5-8 5 8','feedback'));
}
function ai(active) {
  return group('brief',active,panel(20,24,214,153,'CREATIVE BRIEF','01')+text(35,82,'CONTEXT','accent-label')+text(35,101,'CES / a visitor / a moment','field-label')+text(35,128,'DIRECTION','accent-label')+text(35,147,'Mindset + personal input','field-label'))+
    group('prompt',active,panel(20,196,214,171,'PROMPT MATRIX','02')+['Subject / personal signal','Mood / creative direction','Frame / visual consistency'].map((s,i)=>box(34,244+i*35,185,27,'field')+text(42,261+i*35,s,'small-note')).join(''))+
    line('M234 101H268V194H300M234 280H268V194','bus')+
    group('generation',active,panel(300,81,157,224,'GENERATION','03')+Array.from({length:7},(_,i)=>line(`M${319+i*18} 149v${42+(i%3)*17}`,'model-line')).join('')+line('M316 221h124','rule')+text(319,245,'FLUX','engine-label')+text(319,269,'Prompt → image','small-note')+text(319,287,'One visual frame','small-note'))+
    line('M457 194H500','bus')+
    group('iteration',active,panel(500,24,240,281,'POSTCARD / OUTPUT','04')+box(517,77,206,158,'postcard')+line('M517 207 567 135 607 179 655 108 723 207','postcard-art')+line('M529 90h42M529 97h26','postcard-detail')+text(533,220,'CES 2026','postcard-word')+text(516,260,'REVIEW THE COMPOSITION','accent-label')+text(516,282,'Intent / framing / expression','small-note')+line('M620 305V350H270V280H234','feedback')+line('M242 275l-8 5 8 5','feedback')+text(404,342,'Creative judgment loops back','small-note'));
}
function interaction(active) {
  const attributes=['SKIN TONE','EYES','HAIR','ACCESSORIES'];
  const choices=attributes.map((label,i)=>{
    const y=99+i*49;
    return text(34,y,label,'small-note')+Array.from({length:4},(_,j)=>box(34+j*43,y+8,34,20,j===(i%4)?'contact-region':'field')+(j===(i%4)?text(46+j*43,y+22,'+','accent-label'):'')).join('');
  }).join('');
  const register=attributes.map((label,i)=>{
    const y=88+i*49;
    return box(278,y,170,42,'state-row')+text(289,y+15,label,'small-note')+text(289,y+31,['Selected tone','Selected eyes','Selected hairstyle','Selected accessory'][i],'field-label');
  }).join('');
  return text(20,22,'01 / PERSONAL CHOICES','lane-title')+text(264,22,'02 / STATE REGISTER','lane-title')+text(508,22,'03 / VISUAL RESPONSE','lane-title')+
    group('choices',active,panel(20,42,204,267,'CUSTOMIZATION','01')+choices)+
    line('M224 173H264','bus')+
    group('state',active,panel(264,42,198,267,'CURRENT COMBINATION','02')+register)+
    line('M462 173H508','bus')+
    group('preview',active,panel(508,42,232,267,'CHARACTER STUDY','03')+
      box(546,92,156,162,'character-frame')+
      '<rect x="568" y="110" width="112" height="83" rx="22" class="character-head"/>'+
      line('M570 137v-8q0-21 22-21h67q21 0 21 21v14l-22-19-19 11-17-12-20 14-14-9z','character-hair')+
      '<circle cx="596" cy="158" r="10" class="character-eye"/><circle cx="652" cy="158" r="10" class="character-eye"/>'+
      line('M603 197h42l12 39h-66zM602 238v14M646 238v14','character-body')+
      line('M624 193v-7m-6-2h12','rule')+text(530,278,'Choices → a personal likeness','small-note')+text(530,294,'Illustrative interaction model','small-note'))+
    group('expression',active,box(20,333,720,42,'review-band')+text(34,350,'04 / SELF-EXPRESSION','accent-label')+text(34,366,'Try on. Customize. Make it yours.','small-note')+line('M624 309v14H120v-14','feedback')+line('M115 315l5-6 5 6','feedback')+text(508,359,'A character worth sharing','field-label'));
}
function web(active) {
  return text(20,22,'CONTENT SYSTEM / ONE INTENT, TWO SCALES','lane-title')+
    box(20,44,442,276,'viewport')+box(20,44,442,31,'window-bar')+text(34,64,'DESKTOP / CONTENT HIERARCHY','module-title')+box(507,44,147,293,'device')+line('M554 57h51','rule')+
    group('structure',active,box(36,91,230,54,'content-region')+text(48,115,'A CLEAR INTRODUCTION','field-label')+text(48,134,'Who you help. How you help.','small-note')+box(521,82,119,64,'content-region')+text(531,106,'INTRODUCTION','small-note')+bars(532,121,[90,74],11)+box(36,169,230,54,'content-region')+text(48,190,'SERVICES + APPROACH','field-label')+bars(48,207,[196],11)+box(521,211,119,45,'content-region')+text(532,237,'SERVICES','small-note'))+
    group('identity',active,box(287,91,158,132,'image-region')+line('M305 205 334 160 362 181 403 129 430 205','identity-art')+text(304,116,'VISUAL TONE','small-note')+box(521,158,119,42,'image-region')+line('M532 191 557 171 583 183 612 168 632 191','identity-art')+box(36,242,32,17,'swatch-a')+box(77,242,32,17,'swatch-b')+box(118,242,32,17,'swatch-c')+text(164,255,'Space / type / warmth','small-note'))+
    group('contact',active,box(36,279,409,26,'contact-region')+text(49,297,'A VISIBLE NEXT STEP → CONTACT','accent-label')+box(521,278,119,30,'contact-region')+text(540,298,'CONTACT ↗','small-note'))+
    group('responsive',active,line('M462 168H507','feedback')+line('M497 163l10 5-10 5','feedback')+line('M678 67h62M678 67v254M678 321h62M689 135h39M689 203h39M689 271h39','layout-guide')+text(694,96,'ORDER','vertical-note')+text(20,358,'Same content. New arrangement. Clear priority.','accent-label')+text(507,358,'MOBILE / READING ORDER','small-note'));
}
export function disciplineVisual(mode, layerId) {
  const practice=practices[mode] || practices.systems;
  const active=practice.layers.some(layer=>layer.id===layerId)?layerId:practice.layers[0].id;
  const renderer={systems,ai,interaction,web}[mode] || systems;
  return `<svg class="practice-blueprint" viewBox="0 0 760 390" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" class="blueprint-grid"/></pattern></defs><rect width="760" height="390" fill="url(#blueprintGrid)"/>${renderer(active)}</svg><div class="signal-caption mono">${esc(practice.caption)}</div>`;
}
