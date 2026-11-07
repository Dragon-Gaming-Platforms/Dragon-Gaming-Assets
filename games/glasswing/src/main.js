import {t,setLanguage} from './ui/i18n.js';

import {View} from './render2d/view.js';

import {Input,B,MENU} from './core/input.js';
import {PressBuffer,BUFFER} from './core/buffer.js';

import {testLevel} from './data/test-level.js';

import {loadManifest} from './ui/assets.js';

import {Screens} from './ui/screens.js';

import {hud} from './ui/hud.js?v=0.7.0';
import {soloHelp,twoPlayerHelp,tutorialHelp,keyLabel} from './ui/control-help.js';

import {createRun,tick} from './game/run.js';

import {KINDS} from './data/kinds.js';
import {loadLevels,loadArenas,validateLevel} from './game/level.js';

import {record,validateReplay,ReplayCursor} from './core/replay.js';
import {REPLAY_FILES} from './data/resources.js';

import {loadSave,save,captureCurrent} from './core/save.js';

import {options} from './ui/options.js';

import {TouchControls} from './ui/touch.js';
import {AudioBus} from './ui/audio.js?v=0.4.0';

import {resultsHTML,resultStats,betterResult,shareCard,download} from './ui/results.js';

import {EYES,F} from './data/feel.js';
import {TIERS,CURRENT_RULES,tierMask} from './data/rules.js';
import {MONSTER_ARENAS} from './data/monsters.js';
import {draftHTML,previewHTML,previewMoults} from './ui/moults.js';
import {FORM_IDS} from './data/forms.js';
import {FORMS5,huskRules} from './data/forms5.js';
import {hallHTML,hallResultHTML,recordText,trialKey,rematchKey,moveKeys,moveNames} from './ui/hall.js';
import {hallRecord} from './game/hall.js';
import {hallBest} from './core/save.js';
import {hubNext,hubRetreat,newCampaign,hubGates} from './game/hub.js';
import {hubHint,mapScreenHTML,routeHTML,takenHTML,pauseHTML,savedText,ht} from './ui/hub.js';
import {loadCampaign,writeCampaign,captureCampaign} from './core/hub-save.js';
import {mendHint} from './ui/mend.js';
import {bossHint,bossId,arenaKey} from './ui/boss-tips.js';
import {REMATCH,rematchBoss} from './data/rematch.js';
import {updateCoach,coach} from './ui/onboarding.js';

const storage=loadSave();setLanguage(storage.settings.language);
// ?unlock=all opens the Glass tier and the starting-moult preview for demos; never on by default.
const unlockAll=new URLSearchParams(location.search).get('unlock')==='all';
// moults5: ?verbs puts the five verb moults (new powers) into the level-up drafts of new solo/co-op runs.
const verbMoults=new URLSearchParams(location.search).has('verbs');
// A ram, its windup and a Shell Drop hold presses back like a dodge (the press buffer delivers them after).
const BUSY_VERB=['windup','ram','hang','drop'];
const glassOpen=()=>unlockAll||storage.progress.glass;
// ?fair opts new runs into the rules-v4 fairness fixes (config.fair, src/game/fair.js); never on by default.
const fairOn=new URLSearchParams(location.search).has('fair');
// The last Hall run's setup: back in the Hall (from its result or its pause menu) the hunter, Boss and tier stay picked.
let hallLast=null;
// Boss masks the hunter owns (M4): taken by beating the boss, or every mask with ?unlock=all.
const ownedMasks=()=>unlockAll?[...FORM_IDS]:FORM_IDS.filter(id=>storage.progress.masks.includes(id));
// M1-D: v5 forms (the Chrysalis Husk) ride only on a v5 (or husk:true) config; Arcade v4 configs never carry them.
const arcadeMasks=()=>ownedMasks().filter(id=>!FORMS5[id]||huskRules({rulesVersion:CURRENT_RULES}));
// The Unborn Chrysalis's name-and-cry card shows in full once (this browser), then short.
const introSeen=(boss='chrysalis')=>{try{return localStorage.getItem('glasswing.intro.'+boss)==='1';}catch{return false;}};
const markIntro=(boss='chrysalis')=>{try{localStorage.setItem('glasswing.intro.'+boss,'1');}catch{}};
function tierOptions(){return ['easy','normal','hard'].map(d=>`<option value="${d}"${d==='hard'&&!glassOpen()?' disabled':''}>${t(d==='hard'&&!glassOpen()?'glassLocked':TIERS[d].id)}</option>`).join('');}

const view=new View(document.querySelector('#world'),{disabled:new URLSearchParams(location.search).has('no-webgl')}),input=new Input(),screens=new Screens(document.querySelector('#ui')),audio=new AudioBus(storage.settings);

const touch=new TouchControls(input,storage.settings,pause);
view.impact.prefs=()=>storage.settings;
screens.onChange=()=>input.clear();
screens.onCue=name=>{audio.unlock();audio.cue(name);};
screens.links={play:()=>select('solo')};
input.maps=structuredClone(storage.settings.maps);

let ready=false,customLevel=null,levels=[testLevel],state=createRun(levels),paused=false,uiPhase='',queued=[0,0],replaying=null,activeRun=false,saveFrame=0;

view.setLevel(state.level);loadManifest(new URLSearchParams(location.search).get('assets')==='test'?'./assets/manifest.test.json':'./assets/manifest.json');Promise.all([loadLevels(),loadArenas()]).then(([forest,arenas])=>{levels=forest.concat(arenas);if(new URLSearchParams(location.search).has('editor')){try{customLevel=validateLevel(JSON.parse(localStorage.getItem('glasswing.editor.v1')));levels=[customLevel];}catch{}}ready=true;if(customLevel)select('solo');
 // ?monsters=nave|mere|hindwing|sovereign[&kind=brawler|skimmer|spark][&difficulty=easy|normal|hard]: a spoke family's test arena (never saved as a campaign result).
 else{const q=new URLSearchParams(location.search),mon=q.get('monsters'),kind=q.get('kind'),difficulty=q.get('difficulty');if(MONSTER_ARENAS.includes(mon)){state.config={...state.config,rulesVersion:CURRENT_RULES,mode:'solo',monsters:mon,...(Object.hasOwn(KINDS,kind)?{kind}:{}),...(Object.hasOwn(TIERS,difficulty)?{difficulty}:{})};start();}}}).catch(()=>screens.simple('play',t('loadError'),title));

window.addEventListener('pagehide',persist);
window.addEventListener('keydown',()=>audio.unlock());window.addEventListener('pointerdown',()=>audio.unlock());

function persist(){captureCurrent(storage,state,activeRun,replaying);save(storage);captureCampaign(state,activeRun,replaying);}

function title(){audio.resetEffects();activeRun=false;paused=false;input.clear();queued.fill(0);input.multi=false;replaying=null;state=createRun(levels);state.players[0].showcase=true;state.players[0].x=13;state.players[0].px=13;state.players[0].y=1;state.players[0].py=1;view.setLevel(state.level);document.querySelector('#hud').innerHTML='';document.querySelector('#glass-border').className='';screens.title({play:()=>select('solo'),twoPlayers:twoPlayers,hall:hallMenu,options:()=>showOptions(title),howto:howto},!view.available);

 const row=document.createElement('div');row.className='buttons';if(storage.current){const b=document.createElement('button');b.textContent=t('continue');b.onclick=()=>resumeSaved();row.append(b);}
 // The Hub campaign's own slot, when a Hall or classic run has taken storage.current since.
 const hub=loadCampaign();if(hub&&!storage.current?.config?.campaign){const b=document.createElement('button');b.textContent=ht('hubContinue');b.onclick=()=>resumeSaved(hub);row.append(b);}
 screens.root.firstChild.append(row);}

function showOptions(back){audio.settings=storage.settings;touch.settings=storage.settings;options(screens,storage,input,back,()=>{audio.settings=storage.settings;title();});}

function howto(){screens.show('howto',`<section class="panel"><h2>${t('howto')}</h2><p>${soloHelp(input.maps)}</p><h3>${t('credits')}</h3><p>${t('about')}</p><label>${t('verifiedReplays')}<select id="replay-choice">${Object.keys(REPLAY_FILES).map((id,i)=>`<option value="${id}">${t(['','','','coop','replayV4','replayPossession'][i]||id.slice(7))}</option>`).join('')}</select></label><div class="buttons"><button data-action="back">${t('back')}</button><button data-action="replay">${t('replayWatch')}</button></div></section>`,{back:title,replay:watchReplay});}

function twoPlayers(){screens.show('twoPlayers',`<section class="panel"><div class="eyebrow">${t('localModes')}</div><h2>${t('twoPlayers')}</h2><div class="grid"><button data-action="versus" class="card"><h3>${t('versus')}</h3><p>${t('versusDesc')}</p></button><button data-action="coop" class="card"><h3>${t('coop')}</h3><p>${t('coopDesc')}</p></button></div><p>${twoPlayerHelp(input.maps)}</p><button data-action="back">${t('back')}</button></section>`,{versus:()=>select('versus'),coop:()=>select('coop'),back:title});}
function select(mode='solo'){const count=mode==='solo'?1:2;screens.show('select',`<section class="panel"><div class="eyebrow">${t('choose')}</div><h2>${t(mode)}</h2><div class="grid">${Array.from({length:count},(_,i)=>`<div class="card"><h3>${t(i?'p2':'p1')}</h3><label>${t('kind')}<select id="kind${i}">${Object.entries(KINDS).map(([k,v])=>`<option value="${k}">${t(k)} · ${v.mask} ${t('maskHits')}</option>`).join('')}</select></label><label>${t('eye')}<select id="eye${i}">${EYES.map((c,j)=>`<option value="${c}">${t(['orange','cyan','green','violet','red','yellow','pink','white'][j])}</option>`).join('')}</select></label></div>`).join('')}</div><div class="row">${mode!=='versus'?`<label>${t('tier')}<select id="difficulty">${tierOptions()}</select><small id="tier-desc"></small></label>`:`<label>${t('arena')}<select id="arena">${['arena-clearing','arena-canopy','arena-hollow'].map(d=>`<option value="${d}">${t(d)}</option>`).join('')}</select></label>`}${mode==='solo'?routeHTML(!!loadCampaign()):''}<label>${t('seed')}<input id="seed" maxlength="100"></label></div>${count===2?`<p>${twoPlayerHelp(input.maps)}</p><small>${t('sameEyes')}</small>`:''}${unlockAll&&mode!=='versus'?previewHTML(verbMoults)+`<small>${t('unlockedAll')}</small>`:''}${verbMoults&&mode!=='versus'?`<small>${t('verbsOn')}</small>`:''}<div class="buttons"><button class="primary" data-action="start">${t('start')}</button><button data-action="back">${t('back')}</button></div></section>`,{start:()=>{const moults=previewMoults(screens.root);const masks=mode==='versus'?[]:ownedMasks();state.config={...state.config,kind:document.querySelector('#kind0').value,rulesVersion:CURRENT_RULES,mode,eye:document.querySelector('#eye0').value,kind2:document.querySelector('#kind1')?.value||'skimmer',eye2:document.querySelector('#eye1')?.value||EYES[1],arena:document.querySelector('#arena')?.value||'arena-clearing',difficulty:document.querySelector('#difficulty')?.value||'normal',seed:document.querySelector('#seed').value||'glasswing',boss:'chrysalis',introSeen:introSeen()};if(mode!=='versus')state.config.mend=true;else delete state.config.mend;delete state.config.moults;delete state.config.moults5;delete state.config.masks;delete state.config.hall;delete state.config.form;delete state.config.fair;if(fairOn&&mode!=='versus')state.config.fair=true;if(verbMoults&&mode!=='versus')state.config.moults5=true;if(moults.length)state.config.moults=moults;if(masks.length)state.config.masks=masks;delete state.config.campaign;delete state.config.monsters;if(mode==='solo'&&!customLevel&&document.querySelector('#route')?.value!=='classic'){state.config.campaign=newCampaign(state.config.seed);hubGates(state.config);}storage.settings.difficulty=state.config.difficulty;start();},back:mode==='solo'?title:twoPlayers});if(mode!=='versus'){const tier=document.querySelector('#difficulty'),desc=()=>{document.querySelector('#tier-desc').textContent=t(TIERS[tier.value].id+'Desc');for(const o of document.querySelectorAll('#kind0 option,#kind1 option'))o.textContent=`${t(o.value)} · ${tierMask(o.value,tier.value)} ${t('maskHits')}`;};tier.value=storage.settings.difficulty==='hard'&&!glassOpen()?'normal':storage.settings.difficulty;tier.onchange=desc;desc();}document.querySelector('#seed').value='forest-'+new Date().toISOString().slice(0,10);if(count===2){document.querySelector('#eye1').value=EYES[1];document.querySelector('#kind1').value='skimmer';}}
// Hall of Masks: a Mask Trial (an owned form, no meter limit, arena waves) or a Rematch from the boss door.
function hallMenu(back){
 if(typeof back!=='function')back=title;
 const owned=ownedMasks();
 screens.show('hall',hallHTML(owned,input.maps,{glass:glassOpen(),preview:unlockAll?previewHTML(verbMoults)+`<small>${t('unlockedAll')}</small>`:''}),{
  back:back,
  trial:()=>hallStart('trial'),
  rematch:()=>hallStart('rematch')
 });
 const records=()=>{
  const form=document.querySelector('#hall-form')?.value,arena=document.querySelector('#hall-arena').value,tier=document.querySelector('#hall-tier').value;
  document.querySelector('#trial-record').textContent=form?recordText(storage.hall[trialKey(form,arena)],true):'';
  document.querySelector('#rematch-record').textContent=recordText(storage.hall[rematchKey(tier,document.querySelector('#hall-boss')?.value)],false);
 };
 for(const id of ['#hall-form','#hall-arena','#hall-tier','#hall-boss'])document.querySelector(id)?.addEventListener('change',records);
 const from=hallLast||state.config;
 document.querySelector('#hall-kind').value=from.kind||'brawler';document.querySelector('#hall-eye').value=from.eye||EYES[0];
 // A Trial's form and arena stay picked too (a form no longer owned keeps the default).
 if(hallLast?.hall==='trial'){const f=document.querySelector('#hall-form');if(f?.querySelector(`[value="${hallLast.form}"]`))f.value=hallLast.form;document.querySelector('#hall-arena').value=hallLast.arena;}
 if(hallLast?.hall==='rematch'){document.querySelector('#hall-boss').value=rematchBoss(hallLast);const tier=document.querySelector('#hall-tier');if(!tier.querySelector(`[value="${hallLast.difficulty}"]`)?.disabled)tier.value=hallLast.difficulty;}
 records();
}
function hallStart(kind){
 const owned=arcadeMasks();if(!owned.length)return;
 const moults=previewMoults(screens.root),config={seed:'hall-'+new Date().toISOString().slice(0,10),kind:document.querySelector('#hall-kind').value,eye:document.querySelector('#hall-eye').value,
  mode:'solo',rulesVersion:CURRENT_RULES,masks:owned,hall:kind,difficulty:kind==='trial'?'normal':document.querySelector('#hall-tier').value,boss:'chrysalis',introSeen:introSeen(),mend:true};
 if(kind==='trial'){config.form=document.querySelector('#hall-form').value;config.arena=document.querySelector('#hall-arena').value;}
 // Each Rematch boss keeps its own records; the M3 Old Glasswing fights without a boss key.
 else{const boss=REMATCH[document.querySelector('#hall-boss')?.value]?.config;if(boss){config.boss=boss;config.introSeen=introSeen(boss);}else delete config.boss;}
 if(fairOn)config.fair=true;
 if(moults.length)config.moults=moults;
 if(verbMoults)config.moults5=true;
 hallLast=config;state.config=config;start();
}
function start(){if(!ready){screens.simple('play',t('loading'),()=>select(state.config.mode));return;}audio.resetEffects();replaying=null;activeRun=true;queued.fill(0);state=createRun(levels,{...state.config,...(customLevel?{customLevel}:{} )});input.multi=state.config.mode!=='solo';paused=false;input.clear();view.setLevel(state.level);uiPhase='';saveFrame=0;screens.clear();syncUI();persist();}

function resumeSaved(saved=storage.current){if(!saved)return;if(!ready){screens.simple('play',t('loading'),title);return;}try{const r=validateReplay(saved);audio.resetEffects();state=createRun(levels,r.config);input.multi=state.config.mode!=='solo';for(const [n,a,b] of r.inputs)for(let i=0;i<n;i++)tick(state,[a,b]);paused=false;replaying=null;activeRun=true;queued.fill(0);saveFrame=state.frame;input.clear();view.setLevel(state.level);uiPhase='';syncUI();}catch{screens.simple('play',t('invalidSave'),title);}}

async function watchReplay(){
 if(!ready){screens.simple('howto',t('loading'),howto);return;}
 const revision=screens.revision;
 try{
  const choice=document.querySelector('#replay-choice')?.value;
  const name=Object.hasOwn(REPLAY_FILES,choice)?choice:'normal-brawler';
  const response=await fetch(REPLAY_FILES[name]);
  if(!response.ok)throw new Error('Missing replay');
  const replay=validateReplay(await response.json());
  if(screens.revision!==revision)return;
  audio.resetEffects();replaying=new ReplayCursor(replay);activeRun=false;
  state=createRun(levels,replaying.config);input.multi=state.config.mode!=='solo';input.clear();queued.fill(0);
  paused=false;uiPhase='';view.setLevel(state.level);syncUI();
 }catch{if(screens.revision===revision)screens.simple('howto',t('invalidSave'),howto);}
}

// UI timing only (the simulation has already ended the run): after a boss falls, the result panel waits for its
// collapse (the 0.8 s 'beaten' clip, played by the View on its own clock) before it covers the arena.
const COLLAPSE_MS=1200;let fallen=null,fallenAt=0;
function bossFalling(){if(replaying||screens.name!=='playing'||!state.won||!state.enemies?.some(e=>e.boss&&e.dead))return false;const now=performance.now();if(fallen!==state){fallen=state;fallenAt=now;}return now-fallenAt<COLLAPSE_MS;}
function syncUI(){if(state.phase==='result'&&bossFalling())return;const key=state.phase+state.altarPlayer+(state.draftId||0);if(uiPhase===key)return;uiPhase=key;input.clear();if(state.phase==='playing'){screens.clear();view.setLevel(state.level);}else if(state.phase==='altar'||state.phase==='bonus'){screens.show('altar',`<section class="panel"><div class="eyebrow">${t('chooseUpgrade')} ${state.players.length>1?' · '+t(state.altarPlayer?'p2':'p1'):''}</div><h2>${t(state.phase==='bonus'?'bonus':'altar')}</h2><div class="grid">${state.choices.map((id,i)=>`<button data-choice="${i}" class="card"><h3>${t(id)}</h3><p>${t(id+'Desc')}</p><span class="key">${keyLabel(input.maps[input.multi?(state.altarPlayer?'p2':'p1'):'solo'][['attack','sword','blast'][i]][0])}</span></button>`).join('')}</div></section>`);for(const b of document.querySelectorAll('[data-choice]'))b.onclick=()=>queued[state.altarPlayer]=[B.attack,B.sword,B.blast][Number(b.dataset.choice)];persist();}else if(state.phase==='moult'){const player=state.draft.player;screens.show('altar',draftHTML(state,input.maps,input.multi));for(const b of document.querySelectorAll('[data-choice]'))b.onclick=()=>queued[player]=[B.attack,B.sword,B.blast][Number(b.dataset.choice)];persist();}else if(state.phase==='round'){screens.show('round',`<div class="hint">${state.roundWinner<0?t('draw'):t('roundWon',{player:state.roundWinner+1})} · ${state.scores.join(' : ')}</div>`);}else if(state.phase==='respawn'){screens.show('respawn',`<div class="hint">${t('respawn')}</div>`);}else if(state.phase==='result'){if(state.config.campaign){campaignResult();return;}if(state.config.hall){const run=hallRecord(state),key=state.config.hall==='trial'?trialKey(state.config.form,state.config.arena):rematchKey(state.config.difficulty,rematchBoss(state.config));let improved=false;if(!replaying){storage.current=null;if(run)improved=hallBest(storage.hall,key,run);save(storage);}screens.show('result',hallResultHTML(state,run,storage.hall[key],improved),{retry:start,hall:hallMenu,replay:()=>download(JSON.stringify(record(state)),'glasswing-replay.json'),home:title});return;}let taken=false;if(!replaying&&state.config.monsters){storage.current=null;save(storage);}else if(!replaying){storage.current=null;const stats=resultStats(state);const id=state.config.mode+'-'+state.config.kind+'-'+state.config.difficulty;if(betterResult(stats,storage.bests[id]))storage.bests[id]=stats;if(state.won&&state.config.rulesVersion>=4&&state.config.mode!=='versus'){storage.progress.glass=true;if(!state.config.customLevel&&!storage.progress.masks.includes('old-glasswing')){storage.progress.masks.push('old-glasswing');taken=true;}}save(storage);}screens.show('result',resultsHTML(state)+(taken?`<p class="hint">${t('maskTaken',{possess:keyLabel(input.maps.solo.possess[0])})}</p>`:''),{retry:start,card:async()=>{try{await shareCard(state);}catch{const status=document.querySelector('#export-status');if(status)status.textContent=t('exportFailed');}},replay:()=>download(JSON.stringify(record(state)),'glasswing-replay.json'),home:title});}}

// The Hub with Spokes: a segment's end starts the next one (a bench save, a boss door, the Hall, a vein-lift after a
// mask is taken). storage.current always holds the running segment, so Continue resumes the campaign.
let toast=null;
function campaignResult(){
 if(replaying){title();return;}
 const next=hubNext(state);
 if(!next){title();return;}
 const go=()=>{state.config=next.config;start();};
 if(next.fight)next.config.introSeen=introSeen(next.config.boss);
 // The next segment is saved before any card shows: closing the page on the mask card loses nothing.
 const fresh=record(createRun(levels,next.config));storage.current=fresh;writeCampaign(fresh);
 // Forms the campaign owns are owned in the Hall of Masks too.
 for(const id of next.config.masks||[])if(!storage.progress.masks.includes(id))storage.progress.masks.push(id);
 if(next.taken){
  storage.progress.glass=true;
  if(next.taken.mask&&!storage.progress.masks.includes(next.taken.mask))storage.progress.masks.push(next.taken.mask);
  save(storage);
  screens.show('result',takenHTML(next),{lift:go,home:title});return;
 }
 save(storage);
 go();
 if(next.saved)toast={text:savedText(),until:state.frame+180};
 // The Hall of Masks from its arch: leaving the Hall menu walks back out into the Nave.
 if(next.hall)hallMenu(()=>{uiPhase='';syncUI();});
}
// While an onboarding card is up in the Head, the room's own control line waits (one control prompt at a time).
// The phone layout names the Mask button, not the possess key.
function possessLabel(map=input.maps.solo){return touch.active?t('touchMask'):keyLabel(map.possess[0]);}
function campaignHint(lesson){return hubHint(state,input.maps,{coached:!!(coach.live&&coach.run?.card),touch:touch.active})+(lesson?' · '+lesson:'')+(toast&&state.frame<toast.until?' · '+toast.text:'')+(emberReady(state)?' · '+t('emberReady',{possess:possessLabel()}):'');}

// A worn form's moves: in a boss fight one line of names, then the lesson (never over the tells); elsewhere the full text.
function formHint(s,lesson){const id=s.players[0].form;return s.enemies.some(e=>e.boss&&!e.dead)?moveNames(id,input.maps.solo)+(lesson?' · '+lesson:''):t(id+'Moves',moveKeys(input.maps.solo));}

function emberReady(s){const p=s.players[0];return p.forms?.length&&!p.form&&!p.formShift&&p.ember>=p.emberMax&&!s.hall;}

function resume(){paused=false;uiPhase='';input.clear();syncUI();}

function pause(){if(paused)return;audio.resetEffects();paused=true;input.clear();persist();screens.show('pause',`<section class="panel"><h2>${t('pause')}</h2><div class="buttons"><button data-action="resume">${t('resume')}</button><button data-action="options">${t('options')}</button>${state.config.hall&&!replaying?`<button data-action="hall">${t('hallBack')}</button>`:''}<button data-action="home">${t('home')}</button><button data-action="replay">${t('exportReplay')}</button>${pauseHTML(state)}</div></section>`,{resume,options:()=>showOptions(pauseReturn),hall:()=>{title();hallMenu();},home:title,map:()=>screens.show('map',mapScreenHTML(state),{back:pauseReturn}),retreat:()=>{const n=hubRetreat(state);if(n){state.config=n.config;start();}},replay:()=>download(JSON.stringify(record(state)),'glasswing-replay.json')});}

function pauseReturn(){paused=false;pause();}



document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','altar','respawn','round'].includes(screens.name))pause();});

function menuPad(){
 const menu=input.poll()|screens.repeat(input.padMenu,performance.now());
 if(input.pausePressed){
  audio.unlock();
  if(paused||!['playing','altar','respawn','round'].includes(screens.name))screens.back();
  else pause();
  return;
 }
 if(!menu||['playing','respawn','round'].includes(screens.name)||replaying&&!paused)return;
 audio.unlock();
 if(menu&MENU.back)screens.back();else screens.navigate(menu);
}

let last=0,acc=0,heldAlpha=0,frozen=false;
const presses=new PressBuffer();
function loop(time){
 menuPad();
 touch.visible(screens.name==='playing'&&!paused&&!replaying,!!state.players[0].forms?.length,state.players[0].mend!==undefined);
 // Impact moments (boss break, phase, kill) slow the live clock; the ticks and replays are unchanged.
 const dt=Math.min(.1,(time-last)/1000||0);last=time;acc+=dt*view.impact.pace();
 let steps=0;
 while(acc>=1/F.hz&&steps++<F.maxSteps){
  if(['playing','altar','respawn','round'].includes(screens.name)&&!paused){
   const masks=[input.sample(0)|queued[0],(input.multi?input.sample(1):0)|queued[1]];
   queued.fill(0);
   // Pause is handled once per render above, never recorded as gameplay input.
   masks[0]&=~B.pause;masks[1]&=~B.pause;
   // The possess bit exists from rules 4 (replay format 2); older rules never record it.
   if(!(state.config.rulesVersion>=4)){masks[0]&=~B.possess;masks[1]&=~B.possess;}
   // Rules v4, live play: presses made during a dodge or a hit-stop wait for the hero (src/core/buffer.js).
   else if(!replaying){
    if(presses.state!==state){presses.reset();presses.state=state;}
    const live=state.phase==='playing';
    const bits=state.config.rulesVersion>=5?BUFFER.bits5:BUFFER.bits;
    for(let i=0;i<state.players.length&&i<2;i++)masks[i]=presses.filter(i,masks[i],live&&(state.hitStop>0||state.players[i].dodge>0||BUSY_VERB.includes(state.players[i].verbs?.mode)),bits);
   }
   if(replaying&&!replaying.next(masks))pause();
   else{
    const revision=state.levelRevision,ticked=state.phase!=='result';
    tick(state,masks);
    // A run that has ended (the boss collapse holds the result panel back) keeps its last tick's cues: never replay them.
    if(!ticked);
    else if(state.audioEvents?.length)for(const name of state.audioEvents)audio.cue(name);
    else if(state.audio)audio.cue(state.audio);
    if(state.levelRevision!==revision)view.setLevel(state.level);
    syncUI();
    if(state.frame-saveFrame>=900){persist();saveFrame=state.frame;}
   }
   if(state.frame%6===0){
    hud(state);
    // A boss's full name-and-cry card shows once per boss (its id: bossId, src/ui/boss-tips.js).
    if(!replaying)for(const e of state.enemies)if(e.boss&&e.v4&&e.intro&&e.ai!=='enter'&&bossId(e))markIntro(bossId(e));
    if(screens.name==='playing'){
     let hint=document.querySelector('#play-hint');
     if(!hint){hint=document.createElement('div');hint.id='play-hint';hint.className='hint';screens.root.append(hint);}
     const lesson=bossHint(state);
     hint.textContent=(state.world?campaignHint(lesson):(replaying?t('replaying')+' · ':'')+(state.config.customLevel?t('editorTest'):t(arenaKey(state.level)))+(touch.active?(lesson?' · '+lesson:''):' · '+(!input.multi&&state.players[0].form?formHint(state,lesson):lesson||tutorialHelp(state.area,input)))+(emberReady(state)?' · '+t('emberReady',{possess:possessLabel(input.maps[input.multi?'p1':'solo'])}):''))+mendHint(state,input,touch.active);
     updateCoach(state,{root:screens.root,input,touch,replaying});
    }
   }
  }else if(screens.name==='title'||screens.name==='select')state.frame++;
  acc-=1/F.hz;
 }
 if(steps>=F.maxSteps)acc=0;
 // Hit-stop, pause and the still phases freeze positions mid-step: keep drawing at the last live
 // blend (no lurch in, no pop out) and resume the clock from it.
 const still=paused||state.hitStop>0||!['playing','round',undefined].includes(state.phase);
 if(still)frozen=true;
 else{if(frozen){acc=Math.min(acc,heldAlpha/F.hz);frozen=false;}heldAlpha=acc*F.hz;}
 view.render(state,heldAlpha,still?0:dt,!state.players[0].showcase);
 audio.update(state,!!state.players[0].showcase,dt,paused);
 if(screens.name==='options'){
  const status=document.querySelector('#key-status');
  if(status&&input.keys.size)status.textContent=[...input.keys].join(' + ');
 }
 requestAnimationFrame(loop);
}
title();requestAnimationFrame(loop);
