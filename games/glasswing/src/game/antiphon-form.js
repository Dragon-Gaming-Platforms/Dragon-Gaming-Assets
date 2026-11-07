import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {overlap,solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {ANTIPHON_FORM} from '../data/antiphon-form.js';
import {formDamage,endForm} from './possession.js';
import {POSSESSION as P} from '../data/forms.js';
import {movement} from './player.js';
import {groundAt} from './enemies/monster-kit.js';

// Rules-v5 possession form THE ANTIPHON (BOSS-DESIGN boss 2b): True Image, the Six-Arm Flurry, the Hymn Wave and the
// Undertow Grasp. possession.js owns the shift, the burst clock, the 3-hit shell and the boss limits (once per phase,
// the 12% budget, thresholds); possession5.js dispatches the worn frame here after those checks. All state lives in
// e.choir, created on the first worn frame and removed when the form ends (resetForm5), so runs that never wear the
// form carry none of it. Pinned enemies carry pinUntil (a frame number, so nothing has to count it down). No RNG.
export const ID='antiphon-form';
const A=ANTIPHON_FORM,M=A.moves;
// True Image: a reflection's hit lands on a boss's ivory as if its chip were 60% instead of 25%.
export const PIERCE=M.image.pierce/M.image.armour;

const box={x:0,y:0,w:0,h:0};
const hitOpts={stop:0,knock:0,impactX:0};
// The Flurry's arms: five quick strikes, then the sixth shoves.
const ARM={stop:M.flurry.stop,knock:M.flurry.knock},ARM_LAST={stop:M.flurry.stop*3,knock:M.flurry.lastKnock};
const fresh=()=>({move:null,f:0,hit:-1,imageCd:0,hymnCd:0,graspCd:0,gx:0,gy:0,gb:0,gid:-1,waves:[]});
const done=h=>{h.move=null;h.f=0;h.hit=-1;};
// A boss shows ivory (armour) unless an amber opening is up: every v4 boss opens with ai 'open', Tallowgrave with open>0.
// Cordycea's risen husks are boss entities with plain HP, not armour: nothing to pierce.
export const armoured=t=>!(t.ai==='open'||t.tallow&&t.open>0||t.risen&&t.husk);

export function reset(e){delete e.choir;}
// A 1-mask hit on the form: the 3-hit shell (2 s of burst instead of a mask, no flinch), as every v4 form.
export function formHurt(s,e){
 e.hits=(e.hits||0)+1;e.formShell--;e.inv=P.shellInv;e.flash=F.flash;
 if(s.config.hall!=='trial')e.formTimer-=P.shellCost;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0xf1ece2,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}
// One strike box (feet-relative, x forward unless at is given: then centred on that x). mirror: a reflection's hit.
function strike(s,e,b,targets,damage,m,mirror,at){
 const f=e.facing;
 box.x=at??e.x+f*(b.x0+b.x1)/2;box.w=b.x1-b.x0;box.y=e.y+b.y0;box.h=b.y1-b.y0;
 let landed=false;
 for(const t of targets){
  if(t.team===e.team||t.dead||e.hitIds.includes(t.id)||!overlap(box,t))continue;
  hitOpts.stop=m.stop;hitOpts.knock=m.knock;hitOpts.impactX=at??e.x;
  const result=hurt(s,t,e,mirror&&t.boss&&armoured(t)?damage*PIERCE:damage,hitOpts);
  if(result!=='immune'){e.hitIds.push(t.id);landed=true;}
  if(result==='hit'&&!t.boss&&!t.dead){
   if(m.launch)t.vy=m.launch;
   if(m.stun)t.stun=Math.max(t.stun||0,m.stun);
   if(m.pin){t.pinUntil=s.frame+m.pin;t.stun=Math.max(t.stun||0,m.pin);t.vx=0;t.vy=0;t.knockFrames=0;t.knockback=0;}
  }
  if(result==='hit'&&mirror&&t.boss)emit(s,t.x,(t.y||0)+1.2,0xffb347,6);
 }
 // Like every form, the Antiphon crushes the brittle walls it strikes.
 for(let y=Math.max(0,Math.floor(box.y));y<Math.min(s.level.grid.length,Math.ceil(box.y+box.h));y++)
  for(let x=Math.max(0,Math.floor(box.x-box.w/2));x<Math.min(s.level.width,Math.ceil(box.x+box.w/2));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 return landed;
}
// The Grasp's arm comes up from the floor under its mark (h.gb), so a Grasp from the air or a ledge still rises out of
// the ground beneath the foe; it reaches up to the mark's head: a flier is caught in the air too (up to m.up tiles).
const reachOf=(t,gb,m)=>Math.max(m.box.y1,Math.min(m.up,t.y+t.h-gb));
function follow(s,h,t,m){h.gx=t.x;h.gb=groundAt(s.level,t.x,t.y);h.gy=reachOf(t,h.gb,m);}
const graspBox={x0:0,x1:0,y0:0,y1:0};
// The Undertow Grasp's mark: the nearest enemy ahead (or just behind the hunter's front) within range, else 3 tiles out.
function mark(s,e,h,targets,m){
 let best=null,d0=1e9;
 for(const t of targets){
  if(t.team===e.team||t.dead)continue;
  const dx=(t.x-e.x)*e.facing,d=Math.abs(t.x-e.x);
  if(dx<-.5||d>m.range||Math.abs(t.y-e.y)>4||d>=d0)continue;
  best=t;d0=d;
 }
 h.gid=best?best.id:-1;
 if(best)follow(s,h,best,m);else{h.gx=e.x+e.facing*m.miss;h.gb=groundAt(s.level,h.gx,e.y);h.gy=m.box.y1;}
}
function begin(s,e,h,id,targets){
 h.move=id;h.f=0;h.hit=-1;e.attackId++;e.hitIds.length=0;
 if(id==='image'){h.imageCd=M.image.cooldown;emitSound(s,'enemy-telegraph');emit(s,e.x+e.facing*2,e.y,0xffb347,8);}
 else if(id==='hymn'){h.hymnCd=M.hymn.cooldown;emitSound(s,'altar-chime');}
 else if(id==='grasp'){h.graspCd=M.grasp.cooldown;mark(s,e,h,targets,M.grasp);emitSound(s,'dodge');emit(s,e.x,e.y+.1,0xcfe9f2,10);}
}
function flurry(s,e,h,m,targets){
 const i=m.hits.indexOf(h.f);
 // Each arm is its own strike: a fresh attack id, so all six land on the same target.
 if(i>=0){h.hit=i;e.attackId++;e.hitIds.length=0;emitSound(s,i===5?'punch3':i%2?'punch2':'punch1');}
 // Planted: the run bleeds off and the combo never walks through what it strikes.
 e.vx*=F.friction;physics(e,s.level);
 if(h.hit>=0&&h.f<m.hits[h.hit]+m.active){
  const last=h.hit===5;
  if(strike(s,e,m.box,targets,formDamage(e,m.damage),last?ARM_LAST:ARM,false))emit(s,e.x+e.facing*(2+h.hit*.3),e.y+1.4,0xffb347,last?8:3);
  // Six hands bat enemy shots out of the air in front; cyan ones pass (the colour rule never stops applying).
  for(const o of s.projectiles){
   const d=(o.x-e.x)*e.facing;
   if(!o.active||o.team===e.team||o.unparryable||d<m.box.x0-o.radius||d>m.box.x1+o.radius||o.y<e.y+m.box.y0||o.y>e.y+m.box.y1)continue;
   o.active=false;emit(s,o.x,o.y,0xffb347,5);emitSound(s,'blast-hit');
  }
 }
 e.clip='flurry';
 if(++h.f>=m.total)done(h);
}
function image(s,e,h,m,targets){
 e.vx*=F.friction;physics(e,s.level);e.clip='image';
 if(h.f===m.startup){s.shake=F.shakeFrames;emitSound(s,'punch3');for(let i=1;i<6;i++)emit(s,e.x+e.facing*(m.box.x0+i*(m.box.x1-m.box.x0)/6),e.y,0xffb347,3);}
 if(h.f>=m.startup&&h.f<m.startup+m.active)strike(s,e,m.box,targets,formDamage(e,m.damage),m,true);
 if(++h.f>=m.total)done(h);
}
function hymn(s,e,h,m){
 e.vx*=F.friction;physics(e,s.level);e.clip='hymn';
 if(h.f===m.startup){
  for(const dir of [1,-1])h.waves.push({x:e.x+dir*e.w/2,y:e.y,dir,travel:0,ids:[]});
  emit(s,e.x,e.y+e.h*.9,0xffb347,12);emitSound(s,'blast-fire');
 }
 if(++h.f>=m.total)done(h);
}
function grasp(s,e,h,m,targets){
 e.vx*=F.friction;physics(e,s.level);e.clip='grasp';
 // Sunk into the reflection: untouchable while the arm travels under the floor; the mark is followed until 4f before.
 if(h.f<m.dive){e.inv=Math.max(e.inv,2);if(h.f<m.dive-4&&h.gid>=0){const t=targets.find(x=>x.id===h.gid);if(t&&!t.dead)follow(s,h,t,m);}}
 if(h.f===m.dive){emitSound(s,'land');emit(s,h.gx,h.gb+.1,0xffb347,12);s.shake=Math.max(s.shake,F.shakeFrames);}
 if(h.f>=m.dive&&h.f<m.dive+4){graspBox.x0=m.box.x0;graspBox.x1=m.box.x1;graspBox.y0=h.gb-e.y+m.box.y0;graspBox.y1=h.gb-e.y+h.gy;strike(s,e,graspBox,targets,formDamage(e,m.damage),m,true,h.gx);}
 if(++h.f>=m.total)done(h);
}
// The Hymn Wave's rings run along the floor; a wall stops them, and so does the edge of a gap.
function waves(s,e,h,targets){
 const W=M.hymn;
 for(let i=h.waves.length-1;i>=0;i--){
  const k=h.waves[i];k.x+=k.dir*W.speed;k.travel+=W.speed;
  const under=tile(s.level,Math.floor(k.x),Math.floor(k.y-.5));
  if(k.travel>W.range||solid(tile(s.level,Math.floor(k.x),Math.floor(k.y+.5)))||!solid(under)&&under!==2&&under!==3){h.waves.splice(i,1);continue;}
  for(const t of targets){
   if(t.team===e.team||t.dead||k.ids.includes(t.id)||Math.abs(t.x-k.x)>t.w/2+W.box.r||t.y>k.y+W.box.h||t.y+t.h<k.y)continue;
   hitOpts.stop=2;hitOpts.knock=.5;hitOpts.impactX=k.x-k.dir;
   const result=hurt(s,t,e,formDamage(e,W.damage),hitOpts);
   if(result==='immune')continue;
   k.ids.push(t.id);
   // Minor enemies: stunned, and their guard broken as by a parry (vulnerable: armour cracks, the next hit lands x2).
   if(result==='hit'&&!t.boss&&!t.dead){t.stun=Math.max(t.stun||0,W.stun);t.vx=0;t.vulnerable=true;t.blocking=false;}
  }
 }
}
// One worn frame of the Antiphon, after possession.js's burst clock and boss-limit checks.
export function tick(s,e,input,targets){
 const h=e.choir||(e.choir=fresh());
 if(h.imageCd>0)h.imageCd--;
 if(h.hymnCd>0)h.hymnCd--;
 if(h.graspCd>0)h.graspCd--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 if(!h.move){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  if(edge(input,e.prev,B.dodge)&&!h.graspCd)begin(s,e,h,'grasp',targets);
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!h.hymnCd)begin(s,e,h,'hymn',targets);
  else if(edge(input,e.prev,B.sword)&&!h.imageCd)begin(s,e,h,'image',targets);
  else if(edge(input,e.prev,B.attack))begin(s,e,h,'flurry',targets);
 }else if(h.move==='flurry'&&edge(input,e.prev,B.dodge)&&!h.graspCd){
  // The Flurry cancels into the Undertow Grasp: sink out of a strike you read coming, mid-combo.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));if(axis)e.facing=axis;
  begin(s,e,h,'grasp',targets);
 }
 if(h.move==='flurry')flurry(s,e,h,M.flurry,targets);
 else if(h.move==='image')image(s,e,h,M.image,targets);
 else if(h.move==='hymn')hymn(s,e,h,M.hymn);
 else if(h.move==='grasp')grasp(s,e,h,M.grasp,targets);
 else movement(e,input,s.level,A);
 if(e.choir)waves(s,e,h,targets);
}
