import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {overlap,solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {BOSS4} from '../data/boss4.js';
import {FORMS,FORM_IDS,ECHOES,POSSESSION as P,EMBER} from '../data/forms.js';
import {damageBonus,glassMultiplier} from './moults.js';
import {movement} from './player.js';
import {FORMS5} from '../data/forms5.js';
import {tick5,resetForm5,formHurt5} from './possession5.js';
import {EXUVIAL_ID,tickExuvialForm,resetExuvialForm,exuvialFormHurt} from './form-exuvial.js';

// Rules-v4 possession (M4): Mask Ember, the 20f transformation, the form's four player moves, its 3-hit shell and the
// boss-fight limits (once per phase, a 12% burst budget, ends on thresholds). Only players that own a mask carry
// these fields, so v4 runs without masks stay frame-identical to M3.
const box={x:0,y:0,w:0,h:0};
const noGravity={gravity:false};
const trialOf=s=>s.config.hall==='trial';

export function initForms(p,masks){
 const forms=FORM_IDS.filter(id=>masks.includes(id));
 let echo=0;for(const id of forms)echo+=ECHOES[id]?.flaps||0;
 Object.assign(p,{forms,formLast:forms[0],ember:0,emberMax:EMBER.max,emberCalm:0,form:null,formNext:null,formTimer:0,formShift:0,
  formShell:0,formCd:0,formHold:0,formPick:0,formMove:null,formFrame:0,formRushCd:0,formStormCd:0,formBudget:-1,formUsed:[],echo,echoFlash:0});
}
// The living rules-v4 boss, when a boss fight is on.
export function inBoss(s){
 for(const e of s.enemies)if(e.boss&&e.v4&&!e.dead)return e;
 return null;
}
export function gainEmber(s,p,amount){
 if(!p.forms||p.form||p.formShift||p.dead||trialOf(s))return;
 const full=p.ember>=p.emberMax;
 p.ember=Math.min(p.emberMax,p.ember+amount*(inBoss(s)?1:EMBER.outside)*(s.config.difficulty==='easy'?EMBER.pilgrim:1));
 if(!full&&p.ember>=p.emberMax){emit(s,p.x,p.y+p.h,0xffb347,10);emitSound(s,p.mend!==undefined?'ember-full':'altar-chime');}
}
export function drainEmber(p){
 if(!p.forms||p.form)return;
 p.ember=Math.max(0,p.ember-EMBER.drain);p.emberCalm=0;
}
// Leaving the form by death or a reset: the box shrinks back, the meter is kept.
export function resetForm(p){
 // Every v5 form drops its own state (e.husk, e.tallowForm, e.choir, e.anch, e.bloom); a no-op for the v4 form and for no form.
 resetForm5(p);
 // The Exuvial form runs from its own module (possession.js dispatches it before the v5 table).
 if(p.exuv)resetExuvialForm(p);
 Object.assign(p,{form:null,formNext:null,formTimer:0,formShift:0,formShell:0,formMove:null,formFrame:0,formBudget:-1,formHold:0,
  w:KINDS[p.kind].width,h:KINDS[p.kind].height});
}
// A worn form through a Hub door (hub.js enterRoom): what it placed in the old room stays there and a move in progress
// (old-room coordinates) is dropped. The form stays worn.
const PLACED=['globs','shocks','debris','pools','waves','graves','flips','stalks','ledges','husks','brood','bolts'];
export function formEnterRoom(p){
 for(const k of ['husk','tallowForm','choir','anch','bloom','exuv']){
  const h=p[k];if(!h)continue;
  for(const a of PLACED)if(Array.isArray(h[a]))h[a].length=0;
  if(h.hook)h.hook=null;
  if(h.plate)h.plate=null;
  h.move=null;h.f=0;if(typeof h.stage==='string')h.stage='';if(typeof h.hit==='number')h.hit=-1;
 }
}
// The bigger box must fit where the hero stands.
function room(level,e,f){
 for(let y=Math.floor(e.y+F.collisionSkin);y<=Math.floor(e.y+f.h-F.collisionSkin);y++)
  for(let x=Math.floor(e.x-f.w/2);x<=Math.floor(e.x+f.w/2);x++)if(solid(tile(level,x,y)))return false;
 return true;
}
// v5 forms against a wall: the bigger box steps clear by at most half the width difference. Returns the x shift or null.
// v4 forms keep the strict check, so rules-4 recordings are unchanged.
function fit(level,e,f,id){
 if(room(level,e,f))return 0;
 if(!FORMS5[id])return null;
 const d=Math.max(0,(f.w-e.w)/2)+.01;
 for(const dx of e.facing<0?[-d,d]:[d,-d])if(room(level,{x:e.x+dx,y:e.y},f))return dx;
 return null;
}
export function canPossess(s,e,id=e.formLast){
 const f=FORMS[id];
 if(!f||!e.forms?.includes(id)||e.form||e.formShift||e.dead||e.stun||e.formCd>0||e.ember<e.emberMax)return false;
 const boss=inBoss(s);
 // Never during the entrance or a phase transition; once per phase.
 if(boss&&(boss.ai==='enter'||boss.ai==='transition'||e.formUsed.includes(boss.id+':'+boss.phase)))return false;
 return fit(s.level,e,f,id)!==null;
}
export function possess(s,e,id=e.formLast){
 if(!canPossess(s,e,id))return false;
 e.x+=fit(s.level,e,FORMS[id],id);
 const boss=inBoss(s);
 if(boss)e.formUsed.push(boss.id+':'+boss.phase);
 e.formNext=id;e.formShift=P.shift;e.move=null;e.charge=0;e.dodge=0;e.blocking=false;e.inv=Math.max(e.inv,P.shift);
 if(!trialOf(s))e.ember=0;
 emit(s,e.x,e.y+e.h*.9,0xf1ece2,10);emitSound(s,'mask-crack3');
 return true;
}
function become(s,e){
 const f=FORMS[e.formNext],boss=inBoss(s);
 Object.assign(e,{form:e.formNext,formNext:null,formLast:e.formNext,formTimer:P.burst,formShell:P.shell,formMove:null,formFrame:0,
  formRushCd:0,formStormCd:0,w:f.w,h:f.h,vx:0});
 if(boss){
  // A shift that ends after the boss arrived still spends that phase's burst.
  if(!e.formUsed.includes(boss.id+':'+boss.phase))e.formUsed.push(boss.id+':'+boss.phase);
  e.formBoss=boss.id;e.formPhase=boss.phase;e.formGlass=boss.glass;e.formBudget=boss.maxMask*P.budget;
  // During a burst, chip outside openings may reach 3% of max HP per 5 s instead of 1%.
  boss.formChip=boss.maxMask*(P.chipCap-BOSS4.chipCap);
 }else e.formBudget=-1;
 s.shake=F.shakeFrames*2;emit(s,e.x,e.y+e.h*.6,0xffb347,24);emitSound(s,'boss-roar');
}
export function endForm(s,e,reason='time'){
 resetForm(e);
 e.formCd=trialOf(s)?P.trialCooldown:inBoss(s)?0:P.cooldown;
 emit(s,e.x,e.y+e.h*.7,0xffb347,reason==='broken'?24:14);emitSound(s,reason==='broken'?'mask-shatter':'land');
}
// A 1-mask hit on the form: the shell absorbs it (2 s of burst instead of a mask), with no flinch.
export function formHurt(s,e){
 if(e.form===EXUVIAL_ID)return exuvialFormHurt(s,e);
 if(FORMS5[e.form])return formHurt5(s,e);
 e.hits=(e.hits||0)+1;e.formShell--;e.inv=P.shellInv;e.flash=F.flash;
 if(!trialOf(s))e.formTimer-=P.shellCost;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0xf1ece2,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}

export const formDamage=(e,v)=>v*(1+damageBonus(e,'sword'))*(e.glass?glassMultiplier(e):1);
function shot(s,e,x,y,vx,o){
 for(const p of s.projectiles){
  if(p.active)continue;
  Object.assign(p,{active:true,x,y,vx,vy:0,radius:o.radius,damage:formDamage(e,o.damage),team:e.team,owner:e.id,life:F.orbLifetime,
   range:o.range,travel:0,pierce:o.pierce||0,color:'#FFB347',unparryable:false,ivory:false,reflected:false});
  if(!p.hitIds)p.hitIds=[];
  p.hitIds.length=0;return p;
 }
 return null;
}
function strike(s,e,m,targets){
 const f=e.facing;
 box.x=e.x+f*(m.x0+m.x1)/2;box.w=m.x1-m.x0;box.y=e.y+m.y0;box.h=m.y1-m.y0;
 for(const t of targets){
  if(t.team===e.team||t.dead||e.hitIds.includes(t.id)||!overlap(box,t))continue;
  const result=hurt(s,t,e,formDamage(e,m.damage),{stop:m.stop,knock:m.knock,impactX:e.x});
  if(result!=='immune')e.hitIds.push(t.id);
  if(result==='hit'&&m.launch&&!t.boss&&!t.dead){t.vy=m.launch;t.stun=Math.max(t.stun,m.stun);}
 }
 // The form crushes brittle walls it strikes.
 for(let y=Math.max(0,Math.floor(box.y));y<Math.min(s.level.grid.length,Math.ceil(box.y+box.h));y++)
  for(let x=Math.max(0,Math.floor(box.x-box.w/2));x<Math.min(s.level.width,Math.ceil(box.x+box.w/2));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
}
// Unique capability: the form's amber shots shatter enemy shots they meet, cyan ones included.
function shatter(s,e){
 for(const o of s.projectiles){
  if(!o.active||o.owner!==e.id||o.team!==e.team)continue;
  for(const x of s.projectiles){
   if(!x.active||x.team===e.team)continue;
   const reach=o.radius+x.radius;
   if(Math.abs(x.x-o.x)<reach+Math.abs(o.vx)+Math.abs(x.vx)&&Math.abs(x.y-o.y)<reach){x.active=false;emit(s,x.x,x.y,0xffb347,4);emitSound(s,'blast-hit');}
  }
 }
}
function start(s,e,id){
 const m=FORMS[e.form].moves[id];
 e.formMove=id;e.formFrame=0;e.attackId++;e.hitIds.length=0;
 if(id==='rush'){e.formRushCd=m.cooldown;emitSound(s,'dodge');}
 else if(id==='storm')e.formStormCd=m.cooldown;
 else if(id==='slam'&&!e.grounded)e.vy=m.plunge;
}
function moveTick(s,e,f,targets){
 const id=e.formMove,m=f.moves[id],fr=e.formFrame,active=fr>=m.startup&&fr<m.startup+m.active;
 if(id==='rush'){
  if(active){e.vx=e.facing*m.speed;e.vy=0;e.inv=Math.max(e.inv,2);}else e.vx*=F.friction;
  physics(e,s.level,active?noGravity:undefined);
 }else{
  e.vx=id==='sweep'&&active?e.facing*m.step:e.vx*F.friction;
  physics(e,s.level);
 }
 if(fr===m.startup)emitSound(s,id==='storm'?'blast-fire':id==='slam'?'land':'sword-swing');
 if(active){
  if(m.x1!==undefined)strike(s,e,m,targets);
  if(id==='slam'&&fr===m.startup){
   const w=m.wave;for(const dir of [1,-1])shot(s,e,e.x+dir*e.w/2,e.y+w.y,dir*w.speed,w);
   s.shake=F.shakeFrames*2;emit(s,e.x,e.y+.1,0xffb347,16);
  }
  if(id==='storm'&&(fr-m.startup)%m.interval===0)
   shot(s,e,e.x+e.facing*e.w/2,e.y+m.lanes[((fr-m.startup)/m.interval|0)%m.lanes.length],e.facing*m.speed,m);
 }
 e.clip=fr<m.startup?'telegraph':id==='storm'?'barrage':id;
 if(++e.formFrame>=m.total)e.formMove=null;
}
function formTick(s,e,input,targets){
 const f=FORMS[e.form],boss=inBoss(s);
 if(!trialOf(s)&&--e.formTimer<=0){endForm(s,e,'time');return;}
 // A burst taken away from the boss never carries into its fight: the boss's arrival ends it.
 if(e.formBudget<0&&boss){endForm(s,e,'threshold');return;}
 // Boss fights: the burst ends when the boss reaches a threshold or when its 12% budget is spent.
 if(e.formBudget>=0&&(!boss||boss.id!==e.formBoss||boss.phase!==e.formPhase||boss.glass!==e.formGlass||
  boss.ai==='transition'||e.formBudget<=1e-9)){endForm(s,e,'threshold');return;}
 if(e.form===EXUVIAL_ID)return tickExuvialForm(s,e,input,targets);
 if(FORMS5[e.form])return tick5(s,e,input,targets);
 if(e.formRushCd>0)e.formRushCd--;
 if(e.formStormCd>0)e.formStormCd--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 if(!e.formMove){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  if(edge(input,e.prev,B.dodge)&&!e.formRushCd)start(s,e,'rush');
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!e.formStormCd)start(s,e,'storm');
  else if(edge(input,e.prev,B.sword))start(s,e,'slam');
  else if(edge(input,e.prev,B.attack))start(s,e,'sweep');
 }
 if(e.formMove)moveTick(s,e,f,targets);
 else movement(e,input,s.level,f);
 shatter(s,e);
}
function emberTick(s,e){
 if(trialOf(s)){e.ember=e.emberMax;return;}
 if(++e.emberCalm>=EMBER.calmFrames){e.emberCalm=0;gainEmber(s,e,EMBER.calm);}
}
// Called from playerTick for mask owners; returns true when possession used up this frame.
export function possessionTick(s,e,input,targets){
 if(e.formShift>0){
  // The transformation: 20 frames untouchable, the hero mask cracks while the boss mask grows.
  e.formShift--;e.inv=Math.max(e.inv,1);e.vx*=F.friction;e.clip='maskbreak';
  physics(e,s.level);
  if(!e.formShift)become(s,e);
  e.prev=input;return true;
 }
 if(e.form){formTick(s,e,input,targets);e.prev=input;return true;}
 emberTick(s,e);
 // Tap: the last form used. Hold (several masks): cycle a picker, release to take the shown mask.
 // Mend runs step the picker (the wheel) with Left and Right instead (src/game/mend.js).
 const held=!!(input&B.possess),many=e.forms.length>1;
 if(many&&held){
  if(e.prev&B.possess){if(++e.formHold>=P.hold&&e.mend===undefined&&(e.formHold-P.hold)%P.pick===0)e.formPick=(e.formPick+1)%e.forms.length;}
  else{e.formHold=0;e.formPick=Math.max(0,e.forms.indexOf(e.formLast));}
 }
 if(many?!held&&e.prev&B.possess:edge(input,e.prev,B.possess)){
  const id=many&&e.formHold>=P.hold?e.forms[e.formPick]:e.formLast;
  e.formHold=0;
  if(possess(s,e,id)){e.prev=input;return true;}
 }
 return false;
}
