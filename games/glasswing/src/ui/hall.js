import {t} from './i18n.js';
import {keyLabel} from './control-help.js';
import {KINDS} from '../data/kinds.js';
import {EYES} from '../data/feel.js';
import {TIERS} from '../data/rules.js';
import {FORM_IDS,HALL} from '../data/forms.js';
import {FORMS5} from '../data/forms5.js';
import {ARENAS} from '../core/config.js';
import {REMATCH,REMATCH_IDS,legacy,rematchBoss} from '../data/rematch.js';

// Hall of Masks (rules v4): the mask wall, a Mask Trial and a Rematch. Records stay apart from the campaign bests.
const eyes=['orange','cyan','green','violet','red','yellow','pink','white'];
// The Rematch's boss choices (src/data/rematch.js): every boss with its own record keys.
export const HALL_BOSSES=REMATCH_IDS,REMATCH_BOSSES=REMATCH_IDS;
export const clock=seconds=>{const m=Math.floor(seconds/60),r=seconds-m*60;return m+':'+(r<10?'0':'')+(Number.isInteger(r)?r:r.toFixed(1));};
export const trialKey=(form,arena)=>'trial-'+form+'-'+arena;
export const rematchKey=(tier,boss=legacy)=>'rematch-'+boss+'-'+tier;
export function recordText(entry,trial){
 if(!entry)return t('noRecord');
 return t('record')+' · '+(trial?t('recordTrial',{waves:entry.waves,time:clock(entry.time),hits:entry.hits}):t('recordRematch',{time:clock(entry.time),hits:entry.hits}));
}
export function moveKeys(map){
 const k={};for(const a of ['attack','sword','dodge','blast','possess'])k[a]=keyLabel(map[a][0]);
 return k;
}
// A worn form's moves as one line of keys and names (each move's text up to its colon), for boss fights.
export function moveNames(id,map){
 return t(id+'Moves',moveKeys(map)).split(' · ').map(m=>m.split(':')[0].trim()).join(' · ');
}
// owned: masks the hunter holds; glass: the Glass tier is open.
export function hallHTML(owned,maps,{glass=false,preview=''}={}){
 const none=!owned.length?' disabled':'';
 // v5 masks (M1-D) hang on the wall only once owned, so the Arcade Hall is unchanged.
 const niches=FORM_IDS.filter(id=>!FORMS5[id]||owned.includes(id)).map(id=>{
  const have=owned.includes(id);
  return `<div class="card hall-niche${have?'':' locked'}"><span class="mask-icon" aria-hidden="true"></span><div><h3>${t(id)}</h3><p>${t(have?id+'Desc':'maskLocked')}</p>${have?`<p class="muted">${t(id+'Moves',moveKeys(maps.solo))}</p><small>${t(id+'Echo')}</small>`:''}</div></div>`;
 }).join('');
 return `<section class="panel"><div class="eyebrow">${t('hallEyebrow')}</div><h2>${t('hall')}</h2><p>${t('hallIntro')}</p><div class="grid hall-wall">${niches}</div><div class="grid">`+
  `<div class="card"><h3>${t('trial')}</h3><p>${t('trialDesc')}</p><label>${t('form')}<select id="hall-form"${none}>${owned.map(id=>`<option value="${id}">${t(id)}</option>`).join('')}</select></label><label>${t('arena')}<select id="hall-arena">${ARENAS.map(a=>`<option value="${a}">${t(a)}</option>`).join('')}</select></label><p class="hall-record" id="trial-record"></p><button data-action="trial" class="primary"${none}>${t('beginTrial')}</button></div>`+
  `<div class="card"><h3>${t('rematch')}</h3><p>${t('rematchDescAny')}</p><label>${t('rematchBoss')}<select id="hall-boss">${REMATCH_IDS.map(id=>`<option value="${id}">${t(REMATCH[id].name)}</option>`).join('')}</select></label><label>${t('tier')}<select id="hall-tier">${HALL.tiers.map(d=>`<option value="${d}"${d==='hard'&&!glass?' disabled':''}>${t(d==='hard'&&!glass?'glassLocked':TIERS[d].id)}</option>`).join('')}</select></label><p class="hall-record" id="rematch-record"></p><button data-action="rematch"${none}>${t('beginRematch')}</button></div>`+
  `</div><div class="row"><label>${t('kind')}<select id="hall-kind">${Object.keys(KINDS).map(k=>`<option value="${k}">${t(k)}</option>`).join('')}</select></label><label>${t('eye')}<select id="hall-eye">${EYES.map((c,j)=>`<option value="${c}">${t(eyes[j])}</option>`).join('')}</select></label></div>${preview}<div class="buttons"><button data-action="back">${t('back')}</button></div></section>`;
}
// A won Rematch names the boss that fell: its own line, or its name (only the M3 Old Glasswing keeps 'rematchWon').
const wonTitle=id=>REMATCH[id]?.won?t(REMATCH[id].won):id==='old-glasswing'||!REMATCH[id]?t('rematchWon'):t('rematchWonBoss',{boss:t(REMATCH[id].name)});
// The Hall result: this run's figures and the record it now holds.
export function hallResultHTML(s,run,entry,improved){
 const trial=s.config.hall==='trial';
 const rows=trial?[['waves',run?.waves??0],['time',clock(run?.time??0)],['hitsTaken',run?.hits??0]]:
  run?[['time',clock(run.time)],['hitsTaken',run.hits],['attempts',run.attempts]]:[['attempts',s.hall.attempts]];
 return `<section class="panel"><div class="eyebrow">${t('hall')} · ${t(trial?'trial':'rematch')}${improved?' · '+t('newRecord'):''}</div><h2>${trial?t('trialOver'):s.won?wonTitle(rematchBoss(s.config)):t('defeat')}</h2><div class="stats">${rows.map(([k,v])=>`<div class="card">${t(k)}<strong>${v}</strong></div>`).join('')}</div><p class="hall-record">${recordText(entry,trial)}</p><div class="buttons"><button data-action="retry" class="primary">${t('retry')}</button><button data-action="hall">${t('hallBack')}</button><button data-action="replay">${t('exportReplay')}</button><button data-action="home">${t('home')}</button></div></section>`;
}
