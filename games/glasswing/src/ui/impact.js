import {t} from './i18n.js';
// Options rows for the impact pass: damage numbers, and shake and flashes (accessibility: reduced or off).
export function impactOptions(){
 return `<div class="grid"><label>${t('impactNumbers')}<select id="impact-numbers">${['shown','hidden'].map(v=>`<option value="${v}">${t('impact_'+v)}</option>`).join('')}</select></label><label>${t('impactShake')}<select id="impact-shake">${['full','reduced','off'].map(v=>`<option value="${v}">${t('impact_'+v)}</option>`).join('')}</select></label></div>`;
}
export function bindImpact(storage,save){
 const n=document.querySelector('#impact-numbers'),s=document.querySelector('#impact-shake');if(!n||!s)return;
 n.value=storage.settings.numbers===false?'hidden':'shown';s.value=storage.settings.shake||'full';
 n.onchange=()=>{storage.settings.numbers=n.value!=='hidden';save(storage);};
 s.onchange=()=>{storage.settings.shake=s.value;save(storage);};
}
