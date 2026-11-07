import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {V4} from '../data/rules.js';
import {RENDERER} from '../data/form-tallowgrave.js';
import {POSSESSION as P} from '../data/forms.js';
import {formDamage,endForm} from './possession.js';
import {movement} from './player.js';
import {bossParried} from './boss4.js';

// Rules-v5 possession form THE RENDERER (Tallowgrave's mask): Shadow Cast, Tear-Through, Wax Pour and Snuff.
// possession.js still owns the shift, the burst clock, the 3-hit shell count and the boss limits (once per phase, the 12%
// budget, thresholds); possession5.js dispatches the worn frame, the 1-mask hit, the guard check and the reset here. All
// state lives in e.tallowForm, created on the first worn frame and removed when the form ends, so runs that never wear
// it carry none of it. No RNG is drawn. Bosses take every strike through their own hurt rules (amber, chip, caps, budget).
export const ID='tallowgrave-form';
const M=RENDERER.moves;
const hitOpts={stop:0,knock:0,impactX:0};
const fresh=s=>({move:null,stage:'',f:0,chain:0,chainT:0,reach:0,tearCd:0,waxCd:0,snuffCd:0,dark:0,parried:0,area:s.area,pools:[]});

// The shadow a claw throws: from .3 tiles ahead to x1, clipped by the first wall at the body's height (a shadow lies
// on what is in front of it). Returns the far edge (signed distance from e.x).
export function shadowReach(s,e,x1=M.cast.box.x1){
 const f=e.facing<0?-1:1,y=Math.floor(e.y+1);
 for(let d=.5;d<x1;d+=.5)if(solid(tile(s.level,Math.floor(e.x+f*d),y)))return Math.max(M.cast.box.x0,d-.5);
 return x1;
}
// A strike over the x-interval [a,b] (world, a<b) and a height band; once per target per move (e.hitIds).
function band(s,e,a,b,y0,y1,targets,damage,knock,stop,extra){
 let landed=false;
 for(const t of targets){
  if(t.team===e.team||t.dead||e.hitIds.includes(t.id))continue;
  if(t.x+t.w/2<=a||t.x-t.w/2>=b||t.y>=y1||t.y+t.h<=y0)continue;
  hitOpts.stop=stop;hitOpts.knock=knock;hitOpts.impactX=e.x;
  const r=hurt(s,t,e,damage,hitOpts);
  if(r!=='immune'){e.hitIds.push(t.id);landed=true;}
  if(r==='hit'&&!t.boss&&!t.dead&&extra)t.stun=Math.max(t.stun||0,extra);
 }
 // Like every form, it crushes the brittle walls it strikes.
 for(let y=Math.max(0,Math.floor(y0));y<Math.min(s.level.grid.length,Math.ceil(y1));y++)
  for(let x=Math.max(0,Math.floor(a));x<Math.min(s.level.width,Math.ceil(b));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 return landed;
}
const interval=(e,x0,x1)=>e.facing<0?[e.x-x1,e.x-x0]:[e.x+x0,e.x+x1];

function begin(s,e,h,id){
 h.move=id;h.f=0;e.attackId++;e.hitIds.length=0;
 if(id==='cast'){h.chain=h.chainT>0?(h.chain+1)%M.cast.chain.length:0;h.chainT=0;h.stage='cast';h.reach=shadowReach(s,e);}
 else if(id==='tear'){h.stage='tear';h.tearCd=M.tear.cooldown;emitSound(s,'dodge');}
 else if(id==='wax'){h.stage='pour';h.waxCd=M.wax.cooldown;}
 else if(id==='snuff'){
  h.stage='snuff';h.snuffCd=M.snuff.cooldown;h.dark=M.snuff.dark;e.inv=Math.max(e.inv,M.snuff.inv);
  s.shake=F.shakeFrames;emit(s,e.x,e.y+e.h*.9,0x2a1430,18);emitSound(s,'mask-crack1');
 }
}
const done=h=>{h.move=null;h.stage='';h.f=0;};

function cast(s,e,h,targets){
 const m=M.cast,step=m.chain[h.chain];
 e.vx*=F.friction;
 if(h.f>=m.startup&&h.f<m.startup+m.active){
  if(h.f===m.startup){h.reach=shadowReach(s,e);emitSound(s,'sword-swing');}
  const [a,b]=interval(e,m.box.x0,h.reach),dark=h.dark>0?M.snuff.bonus:1;
  if(band(s,e,a,b,e.y+m.box.y0,e.y+m.box.y1,targets,formDamage(e,step.damage*dark),step.knock,step.stop,0))
   emit(s,(a+b)/2,e.y+.3,0xffb347,6);
 }
 e.clip='cast';
 if(++h.f>=step.total){done(h);h.chainT=m.window;}
}
function tear(s,e,h,targets){
 const m=M.tear,active=h.f>=m.startup&&h.f<m.startup+m.active;
 e.vx=active?e.facing*m.dash:e.vx*F.friction;
 if(h.f===m.startup){emitSound(s,'sword-swing');emit(s,e.x+e.facing*e.w,e.y+1.4,0xffb347,6);}
 e.clip='tear';
 return active;
}
function tearStrike(s,e,h,targets){
 const m=M.tear;
 if(h.f>=m.startup&&h.f<m.startup+m.active){
  const [a,b]=interval(e,m.box.x0,m.box.x1);
  if(band(s,e,a,b,e.y+m.box.y0,e.y+m.box.y1,targets,formDamage(e,m.damage),m.knock,m.stop,m.stun)){s.shake=F.shakeFrames;emitSound(s,'sword-hit');}
 }
 if(++h.f>=m.total)done(h);
}
// The floor under x, at most `drop` rows under the hunter's feet: the top of the first tile that holds a body.
function floorUnder(s,x,y,drop){
 const cx=Math.floor(x);
 for(let row=Math.floor(y+.5);row>=Math.max(0,Math.floor(y)-drop);row--){const t=tile(s.level,cx,row);if(solid(t)||t===2||t===3)return row+1;}
 return null;
}
function pour(s,e,h){
 const m=M.wax;
 e.vx*=F.friction;e.clip='pour';
 if(h.f===m.startup){
  // The gush lands reach tiles ahead, or against the wall in front.
  const f=e.facing<0?-1:1;let d=m.reach;
  for(let k=.5;k<=m.reach;k+=.5)if(solid(tile(s.level,Math.floor(e.x+f*k),Math.floor(e.y+1)))){d=Math.max(.6,k-.6);break;}
  const x=e.x+f*d,y=floorUnder(s,x,e.y,m.drop);
  if(y!==null){h.pools.push({x,y,w:m.pool.w,t:0,hit:[]});emit(s,x,y+.2,0xffb347,14);emitSound(s,'blast-fire');}
  else emit(s,x,e.y,0xffb347,6);
 }
 if(++h.f>=m.total)done(h);
}
function snuff(s,e,h){
 e.vx*=F.friction;e.clip='snuff';
 if(++h.f>=M.snuff.total)done(h);
}
// Cooled wax benches hold the Renderer like a one-way ledge (Down drops through). before: feet height before physics.
function benches(e,h,before,input){
 if(input&B.down||e.vy>0)return;
 const W=M.wax.pool;
 for(const p of h.pools){
  if(p.t<W.molten)continue;
  const top=p.y+W.y;
  if(Math.abs(e.x-p.x)<p.w/2+e.w/2-.1&&before>=top-F.landTolerance&&e.y<top){e.y=top;e.vy=0;e.grounded=true;e.coyote=F.coyote;return;}
 }
}
// Molten pools root what wades in; cooled ones stand as benches, then crumble. Snuff's dark blinds the small monsters.
function hazards(s,e,h,targets){
 const W=M.wax.pool;
 for(let i=h.pools.length-1;i>=0;i--){
  const p=h.pools[i];
  if(++p.t>=W.molten+W.life){emit(s,p.x,p.y+W.y,0xf1ece2,8);h.pools.splice(i,1);continue;}
  if(p.t===W.molten){emit(s,p.x,p.y+W.y,0xffd98a,10);emitSound(s,'land');}
  if(p.t>=W.molten)continue;
  for(const t of targets){
   if(t.team===e.team||t.dead||p.hit.includes(t.id)||Math.abs(t.x-p.x)>=p.w/2+t.w/2||t.y>p.y+W.band||t.y+t.h<p.y-.2)continue;
   hitOpts.stop=2;hitOpts.knock=0;hitOpts.impactX=p.x;
   const r=hurt(s,t,e,formDamage(e,M.wax.damage),hitOpts);
   if(r==='immune')continue;
   p.hit.push(t.id);
   if(r==='hit'&&!t.boss&&!t.dead){t.waxT=M.wax.root;t.stun=Math.max(t.stun||0,M.wax.root);t.vx=0;t.knockFrames=0;}
   emit(s,t.x,p.y+.2,0xffb347,6);
  }
 }
 if(h.dark>0){
  h.dark--;
  const S=M.snuff;
  for(const t of targets){
   if(t.team===e.team||t.dead||t.boss||Math.abs(t.x-e.x)>S.radius||Math.abs(t.y-e.y)>S.radius*.6)continue;
   // Lost in the dark: no target, so a strike being wound up stalls (a wild one drops back to recover).
   t.stun=Math.max(t.stun||0,S.blind);t.blindT=S.blind;
   if(!t.beast&&t.ai==='telegraph'){t.ai='recover';t.aiTimer=Math.max(t.aiTimer||0,20);}
  }
 }
 // Roots and blinds count down once per frame, by the first hunter wearing the Renderer (co-op never doubles it).
 if(s.players.find(q=>q.tallowForm)===e)for(const t of s.enemies){if(t.waxT>0)t.waxT--;if(t.blindT>0)t.blindT--;}
}

// One worn frame, after possession.js's burst clock and boss-limit checks.
function tick(s,e,input,targets){
 const h=e.tallowForm||(e.tallowForm=fresh(s));
 // The form outlives a door (a Hub room, a campaign area): the wax stays in the room it was poured in.
 if(h.area!==s.area){h.area=s.area;h.pools.length=0;}
 if(h.tearCd>0)h.tearCd--;
 if(h.waxCd>0)h.waxCd--;
 if(h.snuffCd>0)h.snuffCd--;
 if(h.chainT>0)h.chainT--;
 if(h.parried>0)h.parried--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 if(!h.move){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  if(edge(input,e.prev,B.dodge)&&!h.snuffCd)begin(s,e,h,'snuff');
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!h.waxCd)begin(s,e,h,'wax');
  else if(edge(input,e.prev,B.sword)&&!h.tearCd)begin(s,e,h,'tear');
  else if(edge(input,e.prev,B.attack))begin(s,e,h,'cast');
 }
 const before=e.y;
 if(h.move==='cast'){cast(s,e,h,targets);physics(e,s.level);}
 else if(h.move==='tear'){tear(s,e,h,targets);physics(e,s.level);tearStrike(s,e,h,targets);}
 else if(h.move==='wax'){pour(s,e,h);physics(e,s.level);}
 else if(h.move==='snuff'){snuff(s,e,h);physics(e,s.level);}
 else movement(e,input,s.level,RENDERER);
 if(!e.tallowForm)return;
 benches(e,h,before,input);
 hazards(s,e,h,targets);
}

// The form's shell: three plates, each 1-mask hit costs one plate and 2 s of burst (never a mask), with no flinch.
function hurt1(s,e){
 e.hits=(e.hits||0)+1;e.formShell--;e.inv=P.shellInv;e.flash=F.flash;
 if(s.config.hall!=='trial')e.formTimer-=P.shellCost;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0xf1ece2,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}
// Tear-Through's parry armour: in its first frames a strike or shot that is not cyan is parried. Called from combat.js
// hurt() (through possession5.js formBlocked) before any guard or damage rule; 'parry' means the hit was answered.
function blocked(s,target,source,o){
 const h=target.tallowForm;
 if(!h||h.move!=='tear'||h.f>=M.tear.armour)return false;
 // Cyan is never parried (BOSS-DESIGN: only the Chrysalis's Shell Shut blocks cyan); the world's own costs land.
 if(o?.unparryable||o?.projectile?.unparryable)return false;
 if(!o?.projectile&&source?.id===undefined)return false;
 target.inv=Math.max(target.inv,V4.parryInv);target.parryFlash=F.parryStop;h.parried=F.parryStop;
 s.hitStop=Math.max(s.hitStop,F.parryStop);emitSound(s,'parry');
 emit(s,target.x+target.facing*target.w*.6,target.y+target.h*.55,0xffffff,14);
 const p=o?.projectile;
 if(p){p.vx=-p.vx;p.team=target.team;p.owner=target.id;p.color='#FFB347';p.hitIds.length=0;p.life=F.orbLifetime;p.reflected=true;p.ivory=false;}
 // A boss strike is answered like the hunter's own parry (never in desperation: that kill stays a real parry).
 else if(source.boss){if(!source.dead&&!source.glass)bossParried(s,source,target);}
 else if(source.team===2){source.stun=F.stun;source.vulnerable=true;}
 return 'parry';
}
function reset(e){delete e.tallowForm;}
export const TALLOW_FORM={field:'tallowForm',tick,hurt:hurt1,blocked,reset};
