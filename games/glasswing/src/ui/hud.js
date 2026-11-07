import {F,energyMax} from '../data/feel.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {t} from './i18n.js';
import {glassMultiplier} from '../game/moults.js';
import {BOSS4} from '../data/boss4.js';
import {POSSESSION} from '../data/forms.js';
import {deathCard,deathCardAge} from './deathcard.js';
import {say,label as safeLabel,liveBoss,bossId,bossName,bossThresholds,bossPhases} from './boss-tips.js';
import {hubProgress} from './hub.js';
import {mendRing,mendPips,wheelRow} from './mend.js';

const painted=new WeakMap();

export function hudMarkup(s){
 return s.players.map((p,i)=>{
  const maximum=energyMax(p),energy=Math.max(0,Math.min(maximum,p.energy));
  const label=p.dead?t('downed'):p.glass?t('glass'):t('mask');
  const value=p.dead?Math.floor(p.revive/F.revive*100)+'%':p.glass?
   '×'+(p.moults?glassMultiplier(p):p.upgrades.includes('glassHeart')?U.glassHeart:F.glassMultiplier):
   Math.ceil(p.mask)+' / '+p.maxMask;
  // While possessed the hunter is the form: its name replaces the kind's.
  const name=(p.form?safeLabel(p.form):t(p.kind))+(s.players.length>1?' · '+t(i?'p2':'p1'):'');
  const progress=s.config.mode==='versus'?t('round')+' '+s.round+' · '+s.scores.join(' : '):progressText(s);
  return `<div class="hudbox"><span class="swatch" style="--eye:${p.eye}"></span> ${name}<div class="row">${ember(p)}${label} <strong>${value}</strong>${mendPips(p)}</div>${wheelRow(p)}${form(s,p)}<div class="hudbar" role="meter" aria-label="${t('energy')}" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${energy}"><span style="width:${energy/maximum*100}%"></span></div><small>${t('energy')}${progress?' · '+progress:''}</small>${s.hall?'':level(p)}</div>`;
 }).join('')+bossBar(s)+deathCard(s);
}

// Lives are never lost in a Hall run or inside a rules-v4 boss fight (it retries at its door), so none are shown there:
// a Rematch counts attempts, a Mask Trial its wave, a v4 boss fight its attempt (also in the few frames between a retry
// and the boss's return, so lives never flash in); the Hub shows its Mask Wall.
const trial=s=>s.hall?.kind==='trial'||s.config.hall==='trial';
const bossFight=s=>s.config.rulesVersion>=4&&(s.bossStarted||s.bossAttempts>0&&s.level?.boss);
export function progressText(s){
 if(s.world)return hubProgress(s);
 if(s.hall?.kind==='rematch')return t('attempt')+' '+Math.max(1,s.hall.attempts||0);
 if(trial(s))return say('hudWave',{n:Math.max(1,s.hall?.wave||0)});
 if(s.config.hall)return '';
 if(bossFight(s))return t('attempt')+' '+((s.bossAttempts||0)+1);
 return t('lives')+' '+s.lives;
}
// Rules v4: level and Amber XP under each hunter, and the Old Glasswing's health under the HUD.
function level(p){
 if(p.level===undefined)return '';
 const share=Math.max(0,Math.min(1,p.xp/p.xpNext));
 return `<div class="row xp-row">${t('levelShort')} <strong>${p.level}</strong><span class="hudbar xpbar" role="meter" aria-label="${t('xp')}" aria-valuemin="0" aria-valuemax="${p.xpNext}" aria-valuenow="${p.xp}"><span style="width:${share*100}%"></span></span></div>`;
}
// Rules v4 possession: the Mask Ember ring around the mask (glows when full), then the form's burst and shell.
function ember(p){
 if(p.emberMax===undefined)return '';
 const share=p.form||p.formShift?100:Math.round(Math.max(0,Math.min(1,p.ember/p.emberMax))*100),m=mendRing(p);
 return `<span class="ember-ring${share>=100?' full':''}${p.form?' worn':''}${p.formCd>0?' cool':''}${m.cls}" style="--ember:${share}%${m.style}" role="meter" aria-label="${t('ember')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${share}"><span></span></span>`;
}
function form(s,p){
 if(!p.form)return p.formCd>0&&!s.hall?`<div class="row form-row"><small>${t('emberCooling')} ${Math.ceil(p.formCd/60)}s</small></div>`:'';
 const left=s.hall?1:Math.max(0,p.formTimer/POSSESSION.burst);
 return `<div class="row form-row"><small>${t('form')}</small><span class="hudbar formbar" role="meter" aria-label="${t('form')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(left*100)}"><span style="width:${left*100}%"></span></span><span class="shell" aria-label="${t('formShell')} ${p.formShell}">${'<i></i>'.repeat(Math.max(0,p.formShell))}</span></div>`;
}
const pc=x=>+(x*100).toFixed(2);
function bossBar(s){
 const e=liveBoss(s);
 if(!e)return '';
 const share=Math.max(0,Math.min(1,e.hp/e.maxMask)),name=bossName(e),phase=e.phase||1,phases=bossPhases(e);
 // The Unborn Chrysalis: its name and cry while it lowers into the Gullet (in full once, then the name only).
 // Every later boss (e.name: its id) shows its own card and cry ('<id>Cry') the same way.
 const id=bossId(e),card=id&&e.ai==='enter'?`<div class="bosscard${e.intro?'':' short'}${e.chrysalis?'':' '+id}"><strong>${name}</strong>${e.intro?`<em>${t(id+'Cry')}</em>`:''}</div>`:'';
 const fill=e.glass?e.desperate/(e.despMax||BOSS4.desperation):share;
 // The block bar: the health fill, the chunk this opening has taken (hot amber while open), the phase ticks.
 const chunk=e.open&&!e.glass&&e.openDamage>0?`<span class="chunk" style="left:${pc(share)}%;width:${pc(Math.min(1-share,e.openDamage/e.maxMask))}%"></span>`:'';
 const ticks=e.glass?'':bossThresholds(e).map((x,i)=>`<i class="tick${phase>i+1?' passed':''}" style="left:${pc(x)}%"></i>`).join('');
 const pips=Array.from({length:phases},(_,i)=>i+1).map(n=>`<i class="${n<=phase||e.glass?'on':''}${n===phase&&!e.glass?' now':''}"></i>`).join('');
 const stage=e.glass?say('bossDesperation'):say('bossPhase',{n:phase,total:phases});
 return `<div class="bossbar${e.open?' open':''}${e.glass?' glass':''}">${card}<div class="boss-label"><small>${name}</small><span class="phase-pips" role="img" aria-label="${stage}">${pips}</span></div><div class="hudbar bossmeter" role="meter" aria-label="${name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(share*100)}"><span class="fill" style="width:${pc(fill)}%"></span>${chunk}${ticks}</div></div>`;
}

export function hud(s){
 const node=document.querySelector('#hud'),markup=hudMarkup(s);
 // The 10 Hz HUD check need not recreate unchanged DOM. A cleared title invalidates it.
 if(painted.get(node)!==markup||node.childElementCount!==s.players.length+(markup.includes('bossbar')?1:0)+(markup.includes('deathcard')?1:0)){
  // A repaint recreates the death card: resume its fade where it was instead of restarting it.
  const age=deathCardAge(s);
  node.innerHTML=age>0?markup.replace('<div class="deathcard"',`<div class="deathcard" style="animation-delay:-${age.toFixed(2)}s"`):markup;painted.set(node,markup);
 }
 document.querySelector('#glass-border').classList.toggle('active',s.players.some(p=>p.glass&&!p.dead));
}
