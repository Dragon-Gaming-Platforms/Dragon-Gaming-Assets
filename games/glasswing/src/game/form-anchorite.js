import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {overlap,solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {ANCHORITE_FORM as AF} from '../data/form-anchorite.js';
import {ANCHORITE as BOSS} from '../data/anchorite.js';
import {POSSESSION as P} from '../data/forms.js';
import {formDamage,endForm} from './possession.js';
import {movement} from './player.js';
import {sinQ} from './chrysalis.js';

// Rules-v5 possession form THE ANCHORITE: Sand Lash, Overturn, Sand-Grave and Sand Pour (src/data/form-anchorite.js).
// possession.js still owns the shift, the burst clock, the 3-hit shell count and the boss limits (once per phase, the
// 12% budget, thresholds); possession5.js dispatches the worn frame, the shell hit and the reset here. All state lives
// in e.anch, created on the first worn frame and removed when the form ends, so runs that never wear the Anchorite
// carry none of it. No RNG is drawn and no Math.sin is used (the beam turns on the integer sinQ table).
export const FORM_ID='anchorite-form';
const M=AF.moves;
const box={x:0,y:0,w:0,h:0};
const hitOpts={stop:0,knock:0,impactX:0};
const noGravity={gravity:false};
const cosQ=a=>sinQ(90000-Math.abs(a));
// Sand-Grave and the Overturn crash use plain strike rules; the Pour's stream counts as a projectile on bosses (half
// damage on amber, as every shot), never retained or parried.
const pourHit={projectile:{reflected:false,unparryable:true,ivory:false,vx:0,hitIds:[]},stop:1,knock:0,impactX:0};

const fresh=()=>({move:null,stage:'',f:0,turnCd:0,graveCd:0,pourCd:0,staggered:false,stagId:0,stagT:0,crack:0,ang:0,len:0,lift:AF.moves.pour.box.y,graves:[],flips:[]});
export function resetAnchorite(e){delete e.anch;}

// The carapace takes half damage: a 1-mask hit cracks it, the second crack costs one of its 3 plates (and each crack
// half the burst cost), so it holds six hits, no mask and no flinch; a 2-mask strike still breaks the form (combat.js).
export function hurtAnchorite(s,e){
 const h=e.anch||(e.anch=fresh());
 e.hits=(e.hits||0)+1;e.inv=P.shellInv;e.flash=F.flash;
 h.crack=(h.crack||0)+1;
 if(h.crack>=2){h.crack=0;e.formShell--;}
 if(s.config.hall!=='trial')e.formTimer-=P.shellCost/2;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0xffb347,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}

function place(e,b){const f=e.facing;box.x=e.x+f*(b.x0+b.x1)/2;box.w=b.x1-b.x0;box.y=e.y+b.y0;box.h=b.y1-b.y0;return box;}
function strike(s,e,b,targets,damage,m){
 place(e,b);
 let landed=false;
 for(const t of targets){
  if(t.team===e.team||t.dead||e.hitIds.includes(t.id)||!overlap(box,t))continue;
  hitOpts.stop=m.stop;hitOpts.knock=m.knock;hitOpts.impactX=e.x;
  const result=hurt(s,t,e,damage,hitOpts);
  if(result!=='immune'){e.hitIds.push(t.id);landed=true;}
 }
 // Like every form, the Anchorite crushes the brittle walls it strikes.
 for(let y=Math.max(0,Math.floor(box.y));y<Math.min(s.level.grid.length,Math.ceil(box.y+box.h));y++)
  for(let x=Math.max(0,Math.floor(box.x-box.w/2));x<Math.min(s.level.width,Math.ceil(box.x+box.w/2));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 return landed;
}
// A foe already on the spears stops the lunge (so the lash never carries the body through what it stabs).
function foeOn(e,b,targets){place(e,b);for(const t of targets)if(t.team!==e.team&&!t.dead&&overlap(box,t))return true;return false;}
// The floor under x at or below y (the grave settles on it; a pit leaves it at the drop's bottom).
function floorUnder(level,x,y){
 const c=Math.floor(x);let r=Math.floor(y+.01);
 while(r>0&&!solid(tile(level,c,r-1))&&tile(level,c,r-1)!==2&&tile(level,c,r-1)!==3)r--;
 return r;
}

// Bosses: the footing stagger. A bosskit boss gets e.staggerT (its controller reads it); the Hourglass Anchorite
// itself loses its footing for 20f: a strike still in its tell is held 20f longer (a longer tell, never a shorter
// one) and its next move waits 20f. Other v4 bosses only take the slam's damage.
export function stagger(b,frames=M.overturn.stagger){
 if(b.dead)return false;
 if(b.kit){b.staggerT=Math.max(b.staggerT||0,frames);return true;}
 if(!b.anchorite||b.ai!=='fight')return false;
 const a=b.act;
 if(a&&a.stage==='tell'){
  // A lash already locked on its spot stays locked (its aim never jumps again: the tell stays honest).
  const lock=a.id==='lash'?BOSS.moves.lash.lock:0,locked=lock>0&&a.t<=a.frames*lock;
  a.t+=frames;a.frames+=frames;
  if(locked)a.frames=Math.max(a.frames,Math.ceil(a.t/lock));
  return true;
 }
 if(!a){b.gap+=frames;return true;}
 return false;
}
// Sand-Grave on a struck target: minor enemies are buried (e.buryT, held by the stun); a bosskit boss is slowed.
export function bury(t,G=M.grave){
 if(!t.boss){t.buryT=G.bury;t.stun=Math.max(t.stun||0,G.bury);t.vx=0;t.knockFrames=0;}
 else if(t.kit){t.slowT=G.slowFrames;t.slow=G.slow;}
}

function begin(s,e,h,id,m){
 h.move=id;h.f=0;h.stage='';e.attackId++;e.hitIds.length=0;
 if(id==='overturn'){h.turnCd=m.cooldown;emitSound(s,'enemy-telegraph');}
 else if(id==='grave')h.graveCd=m.cooldown;
 else if(id==='pour'){h.pourCd=m.cooldown;h.ang=m.from*1000;h.len=0;emitSound(s,'rush');}
}
const done=h=>{h.move=null;h.stage='';h.f=0;};

function lash(s,e,f,h,m,targets){
 const fr=h.f;
 e.vx=fr<m.startup&&!foeOn(e,m.box,targets)?e.facing*m.step:e.vx*F.friction;
 physics(e,s.level);
 for(const at of m.stabs){
  if(fr===at){e.attackId++;e.hitIds.length=0;emitSound(s,'sword-swing');}
  if(fr>=at&&fr<at+m.active&&strike(s,e,m.box,targets,formDamage(e,m.damage),m))emit(s,e.x+e.facing*m.box.x1*.8,e.y+1.4,0xffb347,6);
 }
 e.clip='lash';
 if(++h.f>=m.total)done(h);
}
function overturn(s,e,f,h,m,targets){
 const fr=h.f;
 e.vx*=F.friction;
 // In the air the carapace drops onto the floor it is about to turn.
 if(fr<m.startup&&!e.grounded)e.vy=Math.min(e.vy,-.4);
 physics(e,s.level);
 if(fr===m.startup){
  // The slam: every minor enemy within 8 tiles is turned over and falls 'up'; a boss loses its footing (once a burst).
  s.shake=F.shakeFrames*3;emit(s,e.x,e.y+.1,0xffb347,24);emitSound(s,'mask-shatter');
  for(const t of targets){
   if(t.team===e.team||t.dead||Math.abs(t.x-e.x)>m.radius||Math.abs(t.y-e.y)>m.height)continue;
   // The stagger is drawn on the boss (render2d/form-anchorite.js) for its 20 frames: h.stagId, h.stagT.
   if(t.boss){if(!h.staggered&&stagger(t,m.stagger)){h.staggered=true;h.stagId=t.id;h.stagT=m.stagger;s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,t.x,t.y+t.h*.5,0xffb347,20);}continue;}
   if(h.flips.some(q=>q.id===t.id))continue;
   // The flight is scripted (flyers and walkers alike): up to `rise` tiles, stopped under the first solid tile above.
   let top=t.y+t.h;const c=Math.floor(t.x);
   while(top<t.y+t.h+m.rise&&!solid(tile(s.level,c,Math.floor(top+.01))))top=Math.min(t.y+t.h+m.rise,Math.floor(top)+1);
   h.flips.push({id:t.id,t:0,x:t.x,y:t.y,rise:Math.max(0,top-t.y-t.h-.05)});
   t.vx=t.vy=0;t.knockFrames=0;t.stun=Math.max(t.stun||0,m.stun);
   emit(s,t.x,t.y,0xffb347,6);
  }
 }
 if(fr>=m.startup&&fr<m.startup+m.active)strike(s,e,m.box,targets,formDamage(e,m.damage),m);
 e.clip=fr<m.startup?'telegraph':'slam';
 if(++h.f>=m.total)done(h);
}
// The grave's span: from `x0` ahead along the floor the form stands over, cut where that floor ends (a pit, a wall),
// so a mound never bridges a gap or sinks into a wall; null when there is no floor ahead to hold it.
function graveSpan(level,e,m){
 const f=e.facing,a=e.x+f*m.box.x0,y=floorUnder(level,a,e.y);
 const held=x=>{const c=Math.floor(x),u=tile(level,c,y-1);return (solid(u)||u===2||u===3)&&!solid(tile(level,c,y));};
 if(!held(a))return null;
 let b=a;for(let d=.25;d<=m.box.x1-m.box.x0;d+=.25){const x=a+f*d;if(!held(x))break;b=x;}
 return Math.abs(b-a)<m.min?null:{x0:Math.min(a,b),x1:Math.max(a,b),y};
}
function grave(s,e,h,m){
 e.vx*=F.friction;physics(e,s.level);e.clip='pour';
 if(h.f===m.startup){
  const g=graveSpan(s.level,e,m);
  if(g){h.graves.push({...g,t:0,ids:[],dir:e.facing});emitSound(s,'blast-fire');}
  else{emit(s,e.x+e.facing*m.box.x0,e.y+.3,0xffb347,6);emitSound(s,'dodge');}
 }
 if(++h.f>=m.total)done(h);
}
// The beam's ray from the bulb's neck (over the shoulder), cut at the first solid tile. A low ceiling over the form
// dips the neck just under it (h.lift, read by the renderer), so the beam never starts inside the rock.
function ray(s,e,h,m){
 const dx=e.facing*cosQ(h.ang)/4096,dy=sinQ(h.ang)/4096,ox=e.x-e.facing*m.box.back,c=Math.floor(e.x);
 let lift=m.box.y;
 for(let r=Math.floor(e.y+e.h-.01);r<=Math.floor(e.y+m.box.y);r++)if(solid(tile(s.level,c,r))){lift=Math.min(lift,r-e.y-.2);break;}
 const oy=e.y+lift;h.lift=lift;
 let len=0;
 while(len<m.box.len){const n=len+.25;if(solid(tile(s.level,Math.floor(ox+dx*n),Math.floor(oy+dy*n))))break;len=n;}
 h.len=len;return {ox,oy,dx,dy,len};
}
function pour(s,e,h,m,input,targets){
 // The Pour grants no untouchable frames: once it flows, a fresh Jump or Dodge ends it (cooldown stands), never a 102f lock.
 if(h.f>m.startup&&(edge(input,e.prev,B.jump)||edge(input,e.prev,B.dodge))){done(h);movement(e,input,s.level,AF);return;}
 const fr=h.f,on=fr>=m.startup&&fr<m.startup+m.frames;
 if(fr<m.startup+m.frames){
  // Braced from the first frame: in the air the carapace hangs on the pour (a slow drift with the held direction).
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(e.grounded)e.vx*=F.friction;else{e.vy=0;e.vx=axis*m.drift;}
  physics(e,s.level,e.grounded?undefined:noGravity);
 }else{e.vx*=F.friction;physics(e,s.level);}
 if(on){
  // The beam sweeps from low in front up past level.
  h.ang=Math.round((m.from+(m.to-m.from)*(fr-m.startup)/m.frames)*1000);
  const r=ray(s,e,h,m),w=m.box.r;
  if((fr-m.startup)%m.every===0)for(const t of targets){
   if(t.team===e.team||t.dead)continue;
   for(const k of [.2,.55,.9]){
    const px=t.x-r.ox,py=t.y+t.h*k-r.oy,along=px*r.dx+py*r.dy;
    if(along<0||along>r.len+.2||Math.abs(px*r.dy-py*r.dx)>=w+t.w/2)continue;
    pourHit.impactX=r.ox;
    if(hurt(s,t,e,formDamage(e,m.damage),pourHit)!=='immune')emit(s,t.x,t.y+t.h*k,0xffb347,4);
    break;
   }
  }
  // The stream swats enemy shots out of the air; cyan ones pass through it.
  for(const o of s.projectiles){
   if(!o.active||o.team===e.team||o.unparryable)continue;
   const px=o.x-r.ox,py=o.y-r.oy,along=px*r.dx+py*r.dy;
   if(along<0||along>r.len+.2||Math.abs(px*r.dy-py*r.dx)>=w+o.radius)continue;
   o.active=false;emit(s,o.x,o.y,0xffb347,5);emitSound(s,'blast-hit');
  }
  if(fr%6===0)emit(s,e.x+r.dx*r.len,e.y+m.box.y+r.dy*r.len,0xffb347,3);
 }
 e.clip=on?'pour':'telegraph';
 if(++h.f>=m.total)done(h);
}

// Graves, the overturned enemies' crash back and the burial countdown (drawn by render2d/form-anchorite.js).
function hazards(s,e,h,targets){
 const G=M.grave,O=M.overturn;
 if(h.stagT>0)h.stagT--;
 for(let i=h.graves.length-1;i>=0;i--){
  const g=h.graves[i];g.t++;
  if(g.t>=G.set+G.life){h.graves.splice(i,1);continue;}
  if(g.t<G.set)continue;
  const first=g.t===G.set;
  if(first){s.shake=Math.max(s.shake||0,F.shakeFrames);emit(s,(g.x0+g.x1)/2,g.y+.4,0xffb347,14);emitSound(s,'land');}
  for(const t of targets){
   if(t.team===e.team||t.dead||g.ids.includes(t.id))continue;
   if(t.x+t.w/2<g.x0||t.x-t.w/2>g.x1||t.y<g.y-.5||t.y>g.y+G.box.y1)continue;
   // When it sets the grave strikes all on it; later it only buries a minor enemy that walks on (no boss, no damage).
   if(!first&&(t.boss||!t.grounded))continue;
   g.ids.push(t.id);
   if(first){hitOpts.stop=2;hitOpts.knock=0;hitOpts.impactX=t.x;if(hurt(s,t,e,formDamage(e,G.damage),hitOpts)==='immune')continue;}
   if(!t.dead)bury(t,G);
  }
 }
 for(let i=h.flips.length-1;i>=0;i--){
  const q=h.flips[i],t=targets.find(x=>x.id===q.id);
  if(!t||t.dead){h.flips.splice(i,1);continue;}
  q.t++;
  // Turned over, it falls 'up', hangs, and crashes back onto the spot it came from: the impact.
  const k=q.t/O.flight;
  t.x=q.x;t.y=q.y+q.rise*4*k*(1-k);t.vx=t.vy=0;t.knockFrames=0;t.grounded=false;t.stun=Math.max(t.stun||0,2);
  if(q.t>=O.flight){
   t.y=q.y;t.grounded=true;
   hitOpts.stop=3;hitOpts.knock=0;hitOpts.impactX=t.x;
   hurt(s,t,e,formDamage(e,O.impact),hitOpts);
   s.shake=Math.max(s.shake||0,F.shakeFrames);emit(s,t.x,t.y+.2,0xffb347,10);emitSound(s,'land');h.flips.splice(i,1);
  }
 }
 // Burials count down once per frame, by the first hunter wearing the Anchorite (two in co-op never double it).
 if(s.players.find(p=>p.anch)===e)for(const t of s.enemies)if(t.buryT>0)t.buryT--;
}

// One worn frame of the Anchorite, after possession.js's burst clock and boss-limit checks.
export function tickAnchorite(s,e,input,targets){
 const f=AF,h=e.anch||(e.anch=fresh());
 if(h.turnCd>0)h.turnCd--;
 if(h.graveCd>0)h.graveCd--;
 if(h.pourCd>0)h.pourCd--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 if(!h.move){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  if(edge(input,e.prev,B.dodge)&&!h.pourCd)begin(s,e,h,'pour',M.pour);
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!h.graveCd)begin(s,e,h,'grave',M.grave);
  else if(edge(input,e.prev,B.sword)&&!h.turnCd)begin(s,e,h,'overturn',M.overturn);
  else if(edge(input,e.prev,B.attack))begin(s,e,h,'lash',M.lash);
 }
 if(h.move==='lash')lash(s,e,f,h,M.lash,targets);
 else if(h.move==='overturn')overturn(s,e,f,h,M.overturn,targets);
 else if(h.move==='grave')grave(s,e,h,M.grave);
 else if(h.move==='pour')pour(s,e,h,M.pour,input,targets);
 else movement(e,input,s.level,f);
 if(e.anch)hazards(s,e,h,targets);
}
