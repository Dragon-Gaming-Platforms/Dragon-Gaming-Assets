import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {overlap,solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {BOSS4} from '../data/boss4.js';
import {EXUVIAL_ID,EXUVIAL_FORM as X} from '../data/form-exuvial.js';
import {POSSESSION as P} from '../data/forms.js';
import {formDamage,endForm} from './possession.js';
import {movement} from './player.js';

// Rules-v5 possession form of the Exuvial (BOSS-DESIGN boss 4, possessionForm): Graft Rake, Shedding Hook, Brood and
// Cocoon Burst. possession.js still owns the shift, the burst clock, the 3-hit shell and the boss limits (once per phase,
// the 12% budget, thresholds); its formTick dispatches here after those checks. All of the form's state lives in e.exuv,
// created on the first worn frame and removed when the form ends, so runs that never wear it carry none of it. No RNG is
// drawn and no field is written on an enemy (the brood are not entities: bosses never target them).

const M=X.moves,R=M.rake,K=M.hook,D=M.brood,C=M.cocoon,S=X.stolen;
const box={x:0,y:0,w:0,h:0};
const hitOpts={stop:0,knock:0,impactX:0};
// Stolen shots use the projectile damage rules on bosses (half on amber); never parried (form shots are not in versus).
const boltHit={projectile:{reflected:false,unparryable:true,ivory:false,vx:0,hitIds:[]},stop:2,knock:.5,impactX:0};
const claimed=[];
// Each claw's strike options (the third launches and stuns minor enemies).
const CLAW=R.hits.map(m=>({stop:R.stop,knock:R.knock,launch:m.launch,stun:m.stun}));

const fresh=()=>({move:null,stage:'',f:0,combo:0,queued:false,hookCd:0,broodCd:0,cocoonCd:0,hook:null,stolen:null,plate:null,
 brood:[],bolts:[],swing:0});
export function resetExuvialForm(e){delete e.exuv;}

// The form's shell: 3 plates, each 1-mask hit costs one (2 s of burst instead of a mask), no flinch (as every v4 form).
export function exuvialFormHurt(s,e){
 e.hits=(e.hits||0)+1;e.formShell--;e.inv=P.shellInv;e.flash=F.flash;
 if(s.config.hall!=='trial')e.formTimer-=P.shellCost;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0x8f1c2c,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}

// Graft Rake: +10% per Moult worn, up to five (the build, doubled on the body, is the weapon).
export const graftBonus=e=>1+R.perMoult*Math.min(R.moultMax,e.moults?.length||0);

// Armour piercing: while a hooked boss's plate is torn, a hit that only chipped it is topped up to full damage (never in
// an opening, which keeps its own 10% cap; never past the phase threshold, which stays the boss's own to cross), at most
// plateCap of its max HP per plate and inside the burst budget. Every boss shares the thresholds .66/.33.
function pierce(s,e,h,t,damage,before,opened){
 const pl=h.plate;
 if(!pl||pl.id!==t.id||pl.t<=0||!t.boss||t.dead||t.glass||!(t.maxMask>0))return;
 const taken=before-t.hp;
 if(!(taken>0)||(t.openDamage||0)!==opened)return;
 const floor=t.phase>=1&&t.phase<3?t.maxMask*BOSS4.thresholds[t.phase-1]:0;
 let extra=Math.min(damage*K.full-taken,t.maxMask*K.plateCap-pl.dmg,t.hp-floor-t.maxMask*.001);
 if(e.formBudget>=0)extra=Math.min(extra,e.formBudget);
 if(!(extra>0))return;
 t.hp-=extra;t.mask=t.hp;pl.dmg+=extra;
 if(e.formBudget>=0)e.formBudget=Math.max(0,e.formBudget-extra);
 emit(s,t.x,t.y+Math.min(t.h||2,3)*.5,0xffb347,8);
}
// Every hit of the form goes through here: the hunter is the source (so each boss's own caps and the burst budget apply).
function land(s,e,h,t,damage,opts){
 const before=t.hp,opened=t.openDamage||0;
 const result=hurt(s,t,e,damage,opts);
 if(result==='hit'&&t.boss)pierce(s,e,h,t,damage,before,opened);
 return result;
}
function strike(s,e,h,b,x,f,targets,damage,m,ids){
 box.x=x+f*(b.x0+b.x1)/2;box.w=b.x1-b.x0;box.y=e.y+b.y0;box.h=b.y1-b.y0;
 let landed=false;
 for(const t of targets){
  if(t.team===e.team||t.dead||ids.includes(t.id)||!overlap(box,t))continue;
  hitOpts.stop=m.stop;hitOpts.knock=m.knock;hitOpts.impactX=x;
  const result=land(s,e,h,t,damage,hitOpts);
  if(result!=='immune'){ids.push(t.id);landed=true;}
  if(result==='hit'&&!t.boss&&!t.dead){if(m.launch)t.vy=m.launch;if(m.stun)t.stun=Math.max(t.stun,m.stun);}
 }
 return landed;
}
// The claws and the blast bat enemy shots out of the air inside the strike box; cyan ones pass (only the Chrysalis Husk's
// Shell Shut stops cyan).
function swat(s,e){
 for(const o of s.projectiles){
  if(!o.active||o.team===e.team||o.unparryable||Math.abs(o.x-box.x)>box.w/2+o.radius||o.y<box.y-o.radius||o.y>box.y+box.h+o.radius)continue;
  o.active=false;emit(s,o.x,o.y,0xffb347,5);emitSound(s,'blast-hit');
 }
}
// Like every form, its strikes crush the brittle walls they cover.
function crush(s){
 for(let y=Math.max(0,Math.floor(box.y));y<Math.min(s.level.grid.length,Math.ceil(box.y+box.h));y++)
  for(let x=Math.max(0,Math.floor(box.x-box.w/2));x<Math.min(s.level.width,Math.ceil(box.x+box.w/2));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
}
function begin(s,e,h,id){
 h.move=id;h.f=0;e.attackId++;e.hitIds.length=0;
 if(id==='rake'){h.stage='claw';h.combo=0;h.queued=false;}
 else if(id==='hook'){h.stage='throw';h.hookCd=K.cooldown;emitSound(s,'enemy-telegraph');}
 else if(id==='brood'){h.stage='hatch';h.broodCd=D.cooldown;emitSound(s,'mask-crack2');}
 else if(id==='cocoon'){h.stage='wrap';e.inv=Math.max(e.inv,2);emitSound(s,'dodge');emit(s,e.x,e.y+e.h*.5,0x8f1c2c,12);}
}
const done=h=>{h.move=null;h.stage='';h.f=0;};

// What a minor enemy's attack becomes in the form's hands.
const stealOf=t=>t.kind==='spark'||t.kind==='drip-censer'||t.kind==='sporeling'?'spark':t.kind==='skimmer'||t.kind==='mirror-skater'?'dart':'wave';
function fire(s,e,h){
 const k=h.stolen,o=S[k],dir=e.facing;
 if(k==='wave')h.bolts.push({kind:k,x:e.x+dir*e.w/2,y:e.y,vx:dir*o.speed,travel:0,ids:[],left:99});
 else if(k==='dart')h.bolts.push({kind:k,x:e.x+dir*e.w/2,y:e.y+o.y,vx:dir*o.speed,travel:0,ids:[],left:o.pierce});
 else for(const y of o.lanes)h.bolts.push({kind:k,x:e.x+dir*e.w/2,y:e.y+y,vx:dir*o.speed,travel:0,ids:[],left:0});
 emitSound(s,'blast-fire');emit(s,e.x+dir*e.w,e.y+1.4,0xffb347,6);
}
// The brood copies a claw: each skin-husk strikes once in front of itself.
function copy(s,e,h,damage,targets){
 for(const b of h.brood){
  b.atk=10;
  box.x=b.x+b.dir*(D.box.x0+D.box.x1)/2;box.w=D.box.x1-D.box.x0;box.y=b.y+D.box.y0;box.h=D.box.y1-D.box.y0;
  for(const t of targets){
   if(t.team===e.team||t.dead||!overlap(box,t))continue;
   hitOpts.stop=2;hitOpts.knock=.4;hitOpts.impactX=b.x;
   land(s,e,h,t,damage*(t.boss?D.boss:D.minor),hitOpts);
  }
 }
}

function rake(s,e,h,input,targets){
 const m=R.hits[h.combo],active=h.f>=m.startup&&h.f<m.startup+m.active;
 if(h.f>=m.startup&&edge(input,e.prev,B.attack))h.queued=true;
 e.vx=active?e.facing*m.step*(1+h.combo*.2):e.vx*F.friction;physics(e,s.level);
 if(h.f===m.startup){
  emitSound(s,h.combo===2?'punch3':'sword-swing');
  const damage=formDamage(e,m.damage*graftBonus(e));
  copy(s,e,h,damage,targets);
  if(h.combo===2&&h.stolen)fire(s,e,h);
 }
 if(active){
  if(strike(s,e,h,R.box,e.x,e.facing,targets,formDamage(e,m.damage*graftBonus(e)),CLAW[h.combo],e.hitIds))emit(s,e.x+e.facing*2,e.y+1.4,0xffb347,5);
  crush(s);swat(s,e);
 }
 h.swing=(h.f/m.total);e.clip='rake'+(h.combo+1);
 if(++h.f>=m.total){
  if(h.queued&&h.combo<R.hits.length-1){h.combo++;h.f=0;h.queued=false;e.attackId++;e.hitIds.length=0;}
  else done(h);
 }
}
function hook(s,e,h,targets){
 e.vx*=F.friction;physics(e,s.level);e.clip='hook';
 if(h.stage==='throw'){
  if(++h.f<K.startup)return;
  h.stage='fly';h.f=0;
  h.hook={x:e.x+e.facing*e.w/2,y:e.y+K.box.y,dir:e.facing,travel:0,back:false,caught:0,boss:false};
  emitSound(s,'sword-swing');
 }
 const k=h.hook;
 if(h.stage==='fly'){
  if(!k.back){
   k.travel+=K.speed;k.x=e.x+k.dir*(e.w/2+k.travel);k.y=e.y+K.box.y;
   if(k.travel>=K.range||solid(tile(s.level,Math.floor(k.x),Math.floor(k.y))))k.back=true;
   else for(const t of targets){
    if(t.team===e.team||t.dead||Math.abs(t.x-k.x)>t.w/2+K.box.r||k.y+K.box.r<t.y||k.y-K.box.r>t.y+t.h)continue;
    hitOpts.stop=K.stop;hitOpts.knock=K.knock;hitOpts.impactX=e.x;
    const before=t.hp,result=land(s,e,h,t,formDamage(e,K.damage),hitOpts);
    if(result==='immune')continue;
    k.back=true;k.caught=t.id;k.boss=!!t.boss;
    if(t.boss){
     // The plate tears only where the barb bit (it took damage): a clank, a cyan body or a spent chip window tears
     // nothing, so the rip is never drawn on armour that cannot be hurt. The spot takes full damage for 40f.
     if(result==='hit'&&!t.dead&&!t.glass&&t.hp<before){h.plate={id:t.id,t:K.plate,dmg:0,ox:k.x-t.x,oy:k.y-t.y};emit(s,k.x,k.y,0xffb347,14);emitSound(s,'mask-crack3');s.shake=F.shakeFrames;}
    }else if(!t.dead){
     // Reeled in (collision-aware, as a knockback push), stunned, and its attack is now the form's.
     t.knockback=e.x+k.dir*K.pull-t.x;t.knockFrames=8;t.vx=0;t.stun=Math.max(t.stun||0,K.stun);
     h.stolen=stealOf(t);emit(s,t.x,t.y+t.h*.6,0xffb347,10);emitSound(s,'mask-crack3');
    }else h.stolen=stealOf(t);
    break;
   }
   return;
  }
  k.travel=Math.max(0,k.travel-K.back);k.x=e.x+k.dir*(e.w/2+k.travel);k.y=e.y+K.box.y;
  if(k.travel>0)return;
  h.hook=null;h.stage='recover';h.f=0;return;
 }
 if(++h.f>=K.recover)done(h);
}
function brood(s,e,h){
 e.vx*=F.friction;physics(e,s.level);e.clip='brood';
 if(h.f===D.startup){
  h.brood.length=0;
  for(let i=0;i<D.count;i++){
   const x=e.x+(i-1)*D.spread-e.facing*.4;
   h.brood.push({x,y:e.y+.6,px:x,py:e.y+.6,vx:0,vy:.12,w:D.w,h:D.h,grounded:false,knockback:0,knockFrames:0,coyote:0,
    dir:e.facing,life:D.life,slot:i,atk:0,walk:0});
  }
  s.shake=F.shakeFrames;emit(s,e.x-e.facing*.5,e.y+e.h*.6,0x8f1c2c,16);emitSound(s,'boss-roar');
 }
 if(++h.f>=D.total)done(h);
}
function cocoon(s,e,h,input,targets){
 if(h.stage==='wrap'){
  e.inv=Math.max(e.inv,2);
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  e.vx=axis*C.drift;physics(e,s.level);e.clip='cocoon';
  if(++h.f<C.wrap)return;
  // The skin bursts: an amber blast on both sides.
  h.stage='burst';h.f=0;e.attackId++;e.hitIds.length=0;
  strike(s,e,h,C.box,e.x,1,targets,formDamage(e,C.damage),C,e.hitIds);crush(s);swat(s,e);
  h.cocoonCd=C.cooldown;s.shake=F.shakeFrames*2;emit(s,e.x,e.y+e.h*.5,0xffb347,24);emit(s,e.x,e.y+e.h*.4,0x8f1c2c,14);emitSound(s,'mask-shatter');
 }
 e.vx*=F.friction;physics(e,s.level);e.clip='burst';
 if(++h.f>=C.total-C.wrap)done(h);
}

// The brood, the stolen shots and the torn plate (in e.exuv, drawn by render2d/form-exuvial.js).
function hazards(s,e,h,targets){
 if(h.plate&&--h.plate.t<=0)h.plate=null;
 claimed.length=0;
 for(let i=h.brood.length-1;i>=0;i--){
  const b=h.brood[i];b.px=b.x;b.py=b.y;
  if(b.atk>0)b.atk--;
  if(--b.life<=0||b.y<-2){emit(s,b.x,b.y+.4,0x8f1c2c,6);h.brood.splice(i,1);continue;}
  // One enemy each (the nearest not yet taken by a brother), else the hunter's heel.
  let best=null,d=D.aggro;
  for(const t of targets){
   if(t.team===e.team||t.dead||claimed.includes(t.id))continue;
   const dx=Math.abs(t.x-b.x);if(dx<d){d=dx;best=t;}
  }
  if(!best)for(const t of targets){if(t.team===e.team||t.dead)continue;const dx=Math.abs(t.x-b.x);if(dx<d){d=dx;best=t;}}
  let goal;
  if(best){claimed.push(best.id);goal=best.x-Math.sign(best.x-b.x||1)*(best.w/2+.7);b.dir=best.x>=b.x?1:-1;}
  else goal=e.x-e.facing*(1.2+b.slot*.8);
  const dx=goal-b.x;
  b.vx=Math.abs(dx)>.3?Math.sign(dx)*D.speed:0;if(b.vx)b.dir=best?b.dir:Math.sign(b.vx);
  if(b.vx)b.walk++;
  physics(b,s.level);
 }
 for(let i=h.bolts.length-1;i>=0;i--){
  const o=h.bolts[i],k=S[o.kind];o.x+=o.vx;o.travel+=Math.abs(o.vx);
  let gone=o.travel>k.range||solid(tile(s.level,Math.floor(o.x),Math.floor(o.y+(o.kind==='wave'?.5:0))));
  if(!gone&&o.kind==='wave'){const under=tile(s.level,Math.floor(o.x),Math.floor(o.y-.5));if(!solid(under)&&under!==2&&under!==3)gone=true;}
  if(!gone)for(const t of targets){
   const top=o.kind==='wave'?o.y+k.h:o.y+k.r,bot=o.kind==='wave'?o.y:o.y-k.r;
   if(t.team===e.team||t.dead||o.ids.includes(t.id)||Math.abs(t.x-o.x)>t.w/2+k.r||bot>t.y+t.h||top<t.y)continue;
   boltHit.impactX=o.x-o.vx;
   if(land(s,e,h,t,formDamage(e,k.damage),boltHit)==='immune')continue;
   o.ids.push(t.id);emit(s,o.x,o.y+.2,0xffb347,5);emitSound(s,'blast-hit');
   if(o.kind!=='wave'&&--o.left<0){gone=true;break;}
  }
  if(gone)h.bolts.splice(i,1);
 }
}

// One worn frame of the Exuvial form, after possession.js's burst clock and boss-limit checks.
export function tickExuvialForm(s,e,input,targets){
 const h=e.exuv||(e.exuv=fresh());
 if(h.hookCd>0)h.hookCd--;
 if(h.broodCd>0)h.broodCd--;
 if(h.cocoonCd>0)h.cocoonCd--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 if(!h.move){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  if(edge(input,e.prev,B.dodge)&&!h.cocoonCd)begin(s,e,h,'cocoon');
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!h.broodCd)begin(s,e,h,'brood');
  else if(edge(input,e.prev,B.sword)&&!h.hookCd)begin(s,e,h,'hook');
  else if(edge(input,e.prev,B.attack))begin(s,e,h,'rake');
 }
 if(h.move==='rake')rake(s,e,h,input,targets);
 else if(h.move==='hook')hook(s,e,h,targets);
 else if(h.move==='brood')brood(s,e,h);
 else if(h.move==='cocoon')cocoon(s,e,h,input,targets);
 else movement(e,input,s.level,X);
 // A move can end the form (a strike that crosses a boss threshold is checked next frame by possession.js).
 if(e.exuv)hazards(s,e,h,targets);
}
export {EXUVIAL_ID};
