import {t} from './i18n.js';
import {keyLabel} from './control-help.js';
import {MEND} from '../data/mend.js';
import {POSSESSION} from '../data/forms.js';

// Mend runs (config.mend) in the HUD: the ember ring carries a notch at the Mend cost and fills its mask while the
// channel runs; pips beside the mask count show the Mends the ring holds; the transform wheel names the shown mask.
export function mendRing(p){
 if(p.mend===undefined)return {cls:'',style:''};
 return {cls:' mend'+(p.mend>0?' mending':'')+(p.mendFlash>0?' mended':''),
  style:`;--mend:${Math.round(Math.min(1,p.mend/MEND.channel)*100)}%;--notch:${MEND.cost/p.emberMax*360}deg`};
}
export function mendPips(p){
 if(p.mend===undefined||p.form||p.formShift)return '';
 const max=Math.floor(p.emberMax/MEND.cost),ready=Math.min(max,Math.floor(p.ember/MEND.cost));
 return `<span class="mend-pips" role="img" aria-label="${t('mendsReady')} ${ready}">${Array.from({length:max},(_,i)=>`<i${i<ready?' class="on"':''}></i>`).join('')}</span>`;
}
export const wheelOpen=p=>p.forms?.length>1&&p.formHold>=POSSESSION.hold&&!p.form&&!p.formShift;
export function wheelRow(p){
 if(p.mend===undefined||!wheelOpen(p))return '';
 return `<div class="row wheel-row"><small>${t('maskWheel')}</small> <strong>${t(p.forms[p.formPick])}</strong></div>`;
}
// The play hint: how to Mend while the ring holds one, and how to steer an open wheel.
// touch: the wheel is held on the Mask button, not the possess key.
export function mendHint(s,input,touch=false){
 const p=s.players[0];
 if(p?.mend===undefined||s.hall?.kind==='trial')return '';
 const map=input.maps[input.multi?'p1':'solo'],keys={down:keyLabel(map.down[0]),possess:touch?t('touchMask'):keyLabel(map.possess[0]),left:keyLabel(map.left[0]),right:keyLabel(map.right[0])};
 if(wheelOpen(p))return ' · '+t('wheelHint',keys);
 if(p.mend>0)return ' · '+t('mending');
 return !p.form&&!p.formShift&&!p.dead&&p.mask<p.maxMask&&p.ember>=MEND.cost?' · '+t('mendReady',keys):'';
}
