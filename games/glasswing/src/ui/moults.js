import {t} from './i18n.js';
import {keyLabel} from './control-help.js';
import {MOULTS,SLOTS,MOULT_IDS} from '../data/moults.js';
import {VERBS,MOULTS5,MOULT5_IDS} from '../data/moults5.js';

// Rules-v4 moult draft cards and the ?unlock=all starting-moult picker.
const icons={
 horns:'<path d="M7 17c-4-3-4-9 0-12M17 17c4-3 4-9 0-12M8 18h8"/>',
 back:'<path d="M12 4v16M12 6c-5 1-8 5-8 10M12 6c5 1 8 5 8 10"/>',
 arms:'<path d="M5 19l6-6M9 7c3 0 6 2 7 5M14 5l3 3M17 4l2 3M19 8l2 2"/>',
 legs:'<path d="M9 3v8l-3 8M15 3v8l4 6c1 2-1 3-3 2"/>',
 sigil:'<circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14"/>'
};
export const slotIcon=slot=>`<svg class="slot-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${icons[slot]||icons.sigil}</svg>`;
const kindLabel={affinity:'moultAffinity',any:'moultAny',wild:'moultWild',verb:'moultVerb'};
// moults5 verb moults: a tiny icon of the new verb itself (what it does, not where it grows).
const verbIcons={
 'arms-tether':'<path d="M4 18l9-9"/><path d="M13 9c2-3 6-3 7 0c1 2-1 4-3 4"/><path d="M5 15l1 1M8 12l1 1" stroke-dasharray="1 2"/>',
 'horns-charge':'<path d="M6 9c-2-3 0-6 3-5M6 9h8"/><path d="M14 12h7M18 9l3 3-3 3"/><path d="M3 15h6M2 18h5"/>',
 'legs-cricket':'<path d="M7 20l3-8-4-3 8-3"/><path d="M17 15V4M14 7l3-3 3 3"/><path d="M4 21h8"/>',
 'sigil-shell':'<path d="M6 10a6 5 0 0 1 12 0z"/><path d="M12 12v4M10 14l2 2 2-2"/><path d="M3 20h18M6 18l-2-2M18 18l2-2"/>',
 'back-spines':'<path d="M4 12l4-1M4 12l4 1"/><path d="M10 12l10-6M10 12h11M10 12l10 6"/>'
};
export const verbIcon=id=>`<svg class="verb-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${verbIcons[id.replace(/-deep$/,'')]||''}</svg>`;
const verbHow=(id,keys)=>{const label=a=>keyLabel(keys[a][0]);return t('verbHow_'+id,{block:label('block'),dodge:label('dodge'),down:label('down'),jump:label('jump')});};

export function draftHTML(s,maps,multi){
 const d=s.draft,p=s.players[d.player],keys=maps[multi?(d.player?'p2':'p1'):'solo'];
 const cards=d.cards.map((id,i)=>{
  const deep=p.moults.includes(id),verb=Object.hasOwn(VERBS,id),slot=MOULTS[id]||MOULTS5[id];
  // A verb card names the new power and shows how to use it (live key labels) under a tiny icon of the verb.
  const label=deep?'moultDeep':verb?'moultVerb':kindLabel[d.kinds[i]],how=verb?`<p class="verb-how">${verbIcon(id)} <span>${verbHow(id,keys)}</span></p>`:'';
  return `<button data-choice="${i}" class="card moult-card${deep?' deep':''}${verb?' verb-card':''}"><div class="eyebrow">${slotIcon(slot)} ${t('slot_'+slot)} · ${t(label)}</div><h3>${t(id)}${deep?' +':''}</h3><p>${t(id+(deep?'Deep':'Desc'))}</p>${how}<span class="key">${keyLabel(keys[['attack','sword','blast'][i]][0])}</span></button>`;
 }).join('');
 return `<section class="panel"><div class="eyebrow">${t('moultEyebrow',{level:d.level})}${multi?' · '+t(d.player?'p2':'p1'):''}</div><h2>${t('moultTitle')}</h2><div class="grid">${cards}</div></section>`;
}
// One select per slot: none, either branch, or either branch deepened (with verb moults on, the verb branch too).
export function previewHTML(verbs=false){
 const ids=verbs?MOULT5_IDS:MOULT_IDS,slots=verbs?MOULTS5:MOULTS;
 return `<fieldset class="moult-preview"><legend>${t('moultPreview')}</legend><div class="row">${SLOTS.map(slot=>`<label>${slotIcon(slot)} ${t('slot_'+slot)}<select data-moult-slot="${slot}"><option value="">${t('none')}</option>${ids.filter(id=>slots[id]===slot).map(id=>`<option value="${id}">${t(id)}</option><option value="${id}-deep">${t(id)} +</option>`).join('')}</select></label>`).join('')}</div></fieldset>`;
}
export function previewMoults(root){
 const list=[];
 for(const select of root.querySelectorAll('[data-moult-slot]'))if(select.value)list.push(select.value);
 return list;
}
