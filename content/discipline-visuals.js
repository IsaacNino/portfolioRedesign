import { escapeHtml as esc } from './project-utils.js';

// Original orthogonal practice maps. Coordinates are artwork, not live metrics.
const maps = {
  systems: {
    paths: ['M96 140H224V86H292', 'M224 140V194H292', 'M372 86H424V140H532', 'M372 194H424'],
    nodes: [[28,113,136,54,'INPUT'],[280,60,104,52,'LOGIC'],[280,168,104,52,'RULES'],[496,113,116,54,'OUTPUT']],
    accent: 'M96 140H224V86H292M372 86H424V140H532',
    caption: 'Structure → clarity → useful output'
  },
  ai: {
    paths: ['M96 70H204V140H286','M96 140H286','M96 210H204V140','M370 140H430V70H534','M430 140H534','M430 140V210H534'],
    nodes: [[25,48,140,44,'PROMPT'],[25,118,140,44,'CONTEXT'],[25,188,140,44,'CURIOSITY'],[270,102,116,76,'MODEL'],[488,48,126,44,'EXPLORE'],[488,118,126,44,'REFINE'],[488,188,126,44,'CREATE']],
    accent: 'M96 210H204V140H286M370 140H430V70H534',
    caption: 'An idea, multiplied by possibility'
  },
  interaction: {
    paths: ['M90 140H210','M306 140H430','M526 140H606V44H260V100','M478 180V238H90V180'],
    nodes: [[30,102,120,76,'INPUT'],[200,102,116,76,'RESPONSE'],[418,102,120,76,'FEEDBACK']],
    accent: 'M90 140H210M306 140H430M478 180V238H90V180',
    caption: 'An ongoing exchange, not a dead end'
  },
  web: {
    paths: ['M88 140H190V66H270','M190 140H270','M190 140V214H270','M386 66H452V140H552','M386 140H552','M386 214H452V140'],
    nodes: [[26,112,124,56,'PURPOSE'],[258,44,140,44,'IDENTITY'],[258,118,140,44,'CONTENT'],[258,192,140,44,'INTERFACE'],[498,112,116,56,'PEOPLE']],
    accent: 'M88 140H190V66H270M386 66H452V140H552',
    caption: 'Everything connects back to people'
  }
};
export function disciplineVisual(mode) {
  const map = maps[mode] || maps.systems;
  return `<svg viewBox="0 0 640 280" fill="none" xmlns="http://www.w3.org/2000/svg"><g class="signal-grid">${Array.from({length:17},(_,i)=>`<path d="M${i*40} 0V280"/>`).join('')}${Array.from({length:8},(_,i)=>`<path d="M0 ${i*40}H640"/>`).join('')}</g><g class="signal-traces">${map.paths.map(d=>`<path d="${d}"/>`).join('')}</g><path class="signal-current" d="${map.accent}"/><g class="signal-nodes">${map.nodes.map(([x,y,w,h,label],i)=>`<g style="--node-index:${i}"><path d="M${x+7} ${y}H${x+w}V${y+h-7}L${x+w-7} ${y+h}H${x}V${y+7}Z"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle">${esc(label)}</text></g>`).join('')}</g><path class="signal-registration" d="M4 16V4H16M624 4H636V16M636 264V276H624M16 276H4V264"/></svg><div class="signal-caption mono">${esc(map.caption)}</div>`;
}
