// The Hub with Spokes (BOSS-DESIGN 'Hub map'), behind config.campaign (rules 4): every field here exists only in
// campaign runs, so classic, Hall and older v4 configs keep their digests. A campaign plays as SEGMENTS: each is a
// normal deterministic run (its own replay, save and resume) that starts from config.campaign, a snapshot of the
// world progress taken at a bench, a door or a vein-lift. Inside a segment the hunter travels room to room
// (enterRoom), sits at benches, swings on Amber Thread knots and dies back to the last bench, keeping every Echo.
// A segment ends (phase 'result', s.world.out) at a bench, at a boss door, at the Hall of Masks and after a long
// stretch at the next door; hubNext() turns that into the next segment's config (main.js and the tests share it).
import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {solid,tile} from '../core/physics.js';
import {hurt,heal,emit} from '../core/combat.js';
import {energyMax,F,EYES} from '../data/feel.js';
import {spawnEnemy} from './enemies/wild.js';
import {startDraft} from './moults.js';
import {xpNext} from '../data/moults.js';
import {resetForm,formEnterRoom} from './possession.js';
import {hallLevels} from './hall.js';
import {sinQ,asinQ} from './chrysalis.js';
import {validConfig} from '../core/config.js';
import {FORM_IDS} from '../data/forms.js';
import {HUB,HUB_BOSSES,ECHO_IDS,SPOKE_BEASTS,hubBossConfig} from '../data/hub.js';
import {HUB_ROOMS,HUB_START,HUB_LIFT,doorOf,roomLevel} from '../data/hub-rooms.js';
import {RUN as R} from '../data/run.js';
import {CURRENT_RULES} from '../data/rules.js';
import {MONSTERS} from '../data/monsters.js';

const T=HUB.thread;
const cosQ=a=>sinQ(90000-Math.abs(a));
function isqrt(n){let r=Math.floor(Math.sqrt(n));while(r*r>n)r--;while((r+1)*(r+1)<=n)r++;return r;}
const box={x:0,y:0,w:0,h:0};

// A new campaign: THE HEAD's first room, no Echoes, level 1.
// The spoke families are on (monsters: true; src/data/hub.js SPOKE_BEASTS); a snapshot without the key keeps the wild kinds.
export function newCampaign(base='glasswing'){
 return {v:1,room:HUB_START.room,at:HUB_START.at,bench:{room:HUB_START.room,at:'start'},echoes:[],cleared:[],visited:[],
  level:1,xp:0,drafts:0,seg:0,base:String(base).slice(0,80),deaths:0,monsters:true};
}
// The campaign is the main mode, so its configs carry every new gate: the rules-v5 hero tech (Winged glaive chain, pogo,
// buffered dash) and Mend with the Mask Ember for every hunter. main.js and segmentConfig build campaign configs through
// this; any other config (classic, Hall, versus, older replays) never passes here and stays exactly as it was.
export function hubGates(config){
 config.rulesVersion=Math.max(config.rulesVersion||1,CURRENT_RULES);
 config.mend=true;
 // The verb moults (src/game/moults5.js): the Hub's drafts offer the five verb branches.
 config.moults5=true;
 return config;
}
// A boss is playable once its package lets validConfig accept config.boss:'<id>' (the Chrysalis does today).
export function bossReady(id){
 if(!Object.hasOwn(HUB_BOSSES,id))return false;
 try{validConfig({seed:'hub',kind:'brawler',difficulty:'normal',mode:'solo',eye:EYES[0],rulesVersion:4,boss:hubBossConfig(id)});return true;}
 catch{return false;}
}
// Rooms of a segment: every hub room, or for a boss fight the boss's Hall Rematch arena (hallLevels).
export function hubLevels(levels,config){
 return config.campaign.fight?hallLevels(levels,{...config,hall:'rematch'}):HUB_ROOMS;
}

// Gates are data: 'echo:<id>', 'boss:<id>' (cleared), 'masks:<n>' (Mask Wall), joined by '+'.
export function gateOpen(w,gate){
 if(!gate)return true;
 return gate.split('+').every(g=>{
  const [kind,value]=g.split(':');
  if(kind==='echo')return w.echoes.includes(value);
  if(kind==='boss')return w.cleared.includes(value);
  if(kind==='masks')return w.cleared.length>=Number(value);
  return false;
 });
}
// What a door shows: open, its missing gate, or 'coming' (a boss whose package is not in this build).
export function doorState(w,d){
 if(d.kind==='sealed'&&gateOpen(w,d.gate))return 'coming';
 if(!gateOpen(w,d.gate))return 'locked';
 if(d.kind==='boss'&&!bossReady(d.boss))return 'coming';
 if(d.kind==='boss'&&w.cleared.includes(d.boss))return 'cleared';
 return 'open';
}

export function setupHub(s){
 const c=s.config.campaign;
 s.world={room:null,spoke:null,fight:c.fight||null,bench:{...c.bench},echoes:[...c.echoes],cleared:[...c.cleared],
  visited:[...c.visited],deaths:c.deaths||0,entered:0,out:null,fade:0,msg:null,safe:null,prev:0,doors:[]};
 for(const p of s.players){
  if(p.level!==undefined){p.level=c.level;p.xp=c.xp;p.xpNext=xpNext(c.level);p.drafts=c.drafts;}
  p.mask=p.maxMask;
 }
 if(c.fight){
  // The boss door of the Hall Rematch arena, every wave already cleared (as setupHall).
  const b=HUB_BOSSES[c.fight];
  s.spawned=(s.level.waves||[]).map((_,i)=>i);s.checkpoint=b.door-4;
  for(const p of s.players){p.x=p.px=b.door;p.y=p.py=1;}
  // A fight carried on from a cut segment (hubAgain) keeps counting its attempts.
  if(c.tries)s.bossAttempts=c.tries;
  return;
 }
 enterRoom(s,c.room,c.at);
}

// Room entry: today's enterArea reset (it stays untouched), then the arrival spot, the room's wild spawns and gates.
export function enterRoom(s,id,at){
 const w=s.world,index=s.levels.findIndex(l=>l.hub?.room===id);
 if(index<0)return;
 s.area=index;s.level=structuredClone(s.levels[index]);s.levelRevision++;
 s.enemies=[];s.spawned=[];s.lock=null;s.bossStarted=false;
 // Spoke families: a room entry (a respawn into the bench room included, where s.area does not change) clears the
 // wax blobs, puddles and floor shocks the old foes left, as monstersTick does on an area change.
 if(s.mon){s.mon.area=index;s.mon.blobs.length=0;s.mon.puddles.length=0;s.mon.shocks.length=0;}
 s.checkpoint=s.level.checkpoints[0];s.drops=[];
 for(const p of s.projectiles)p.active=false;
 const L=s.level,H=L.hub,d=H.doors.find(x=>x.id===at);
 let x=L.start.x,y=L.start.y,facing=1;
 if(at==='bench'&&H.bench){x=H.bench.x;y=H.bench.y;}
 else if(d){x=d.kind==='edge'?(d.side<0?1.6:L.width-1.6):d.x;y=d.y;facing=d.kind==='edge'?-d.side:facing;}
 for(const p of s.players){
  p.x=p.px=x;p.y=p.py=y;p.vx=0;p.vy=0;p.move=null;p.prev=0;p.facing=facing;p.knockback=0;p.knockFrames=0;
  p.swing=null;p.thread=-1;
  if(p.form)formEnterRoom(p);
 }
 s.camera.x=Math.max(F.cameraWidth/2,Math.min(L.width-F.cameraWidth/2,x));
 // campaign.monsters: a spoke room's wild foes are its family's kinds in the same roles (the elite is the family's
 // mid-boss where it has one); the Head and the Nave keep the wild kinds.
 const beasts=s.config.campaign.monsters?SPOKE_BEASTS[L.spoke]:null;
 for(const f of H.foes){
  const kind=beasts&&(f.elite&&beasts.elite||beasts[f.kind]);
  if(kind)spawnEnemy(s,{kind,x:f.x,y:MONSTERS[kind].flying?Math.max(f.y,3):f.y,...(MONSTERS[kind].count?{count:beasts.flock}:{})});
  else spawnEnemy(s,{kind:f.kind,x:f.x,y:f.kind==='skimmer'?Math.max(f.y,3):f.y,elite:f.elite});
 }
 w.room=id;w.spoke=L.spoke;w.safe={x,y};w.fade=HUB.fade;w.entered++;w.msg=null;
 if(!w.visited.includes(id))w.visited.push(id);
 w.doors=H.doors.map(o=>doorState(w,o));
 s.phase='playing';
}
function end(s,out){s.world.out=out;s.phase='result';}
// A hub fight has no lives, so its segment would grow with every attempt (across sessions too: Continue resumes it)
// until its replay passed validateReplay's 100-minute limit and the campaign save could no longer load. Past
// HUB.segment, a lost attempt ends the segment instead of retrying in place; hubNext starts the same fight again.
export function hubAgain(s){
 if(!s.world?.fight||s.frame<=HUB.segment)return false;
 end(s,{kind:'again'});return true;
}

function useDoor(s,d,i){
 const w=s.world,state=w.doors[i];
 if(state==='locked'||state==='coming'){
  if(!w.msg||w.msg.door!==d.id||s.frame-w.msg.frame>30){w.msg={door:d.id,state,gate:d.gate||'',boss:d.boss||'',frame:s.frame};emitSound(s,'block');}
  return false;
 }
 if(d.kind==='hall'){end(s,{kind:'hall',room:w.room,at:d.id});return true;}
 if(d.kind==='boss'){end(s,{kind:'boss',boss:d.boss,room:w.room,at:'bench'});return true;}
 if(!d.to)return false;
 const [room,at]=d.to.split(':');
 emitSound(s,d.kind==='lift'?'altar-chime':'land');
 enterRoom(s,room,at);
 // A long segment is cut at the next door, so every replay stays far inside the 100-minute cap.
 if(s.frame>HUB.segment)end(s,{kind:'travel',room,at});
 return true;
}

// Amber Thread: integer pendulum on the nearest knot; the hand hangs from the thread, the feet below it.
function attach(s,p){
 const L=s.level,hand=p.h*T.hand;let best=-1,bd=T.reach+1,bx=0,by=0;
 for(let i=0;i<L.hub.knots.length;i++){
  const k=L.hub.knots[i],dx=Math.round((p.x-k.x)*1000),dy=Math.round((k.y-p.y-hand)*1000);
  if(dy<=0)continue;
  const d=isqrt(dx*dx+dy*dy);
  if(d<bd){bd=d;best=i;bx=dx;by=dy;}
 }
 if(best<0)return;
 const len=Math.max(T.min,bd),ang=asinQ(Math.trunc(bx*4096/Math.max(1,bd)));
 // Carry the hunter's speed into the swing: the tangent at this angle is (cos, sin). A fling's carry (the
 // knockback push after a release) counts too, so a release-and-catch chain keeps its momentum.
 const vx=p.vx+(p.knockFrames>0?p.knockback/p.knockFrames:0);p.knockback=0;p.knockFrames=0;
 const vt=vx*cosQ(ang)/4096+p.vy*sinQ(ang)/4096;
 const om=Math.max(-T.maxSpeed,Math.min(T.maxSpeed,Math.round(vt*1000*57296/len)));
 p.swing={k:best,ang,om,len,g:Math.floor(T.gravity*57296/len)};p.thread=best;
 p.move=null;p.charge=0;p.glide=0;
 emitSound(s,'parry');emit(s,L.hub.knots[best].x,L.hub.knots[best].y,0xffb347,6);
}
function release(s,p,hop){
 const sw=p.swing,vt=sw.om*sw.len/57296/1000;
 const vx=vt*cosQ(sw.ang)/4096,vy=vt*sinQ(sw.ang)/4096+(hop?T.hop:0);
 p.vy=vy;p.vx=Math.max(-.2,Math.min(.2,vx));
 // The slingshot: the swing's speed carries on for a few frames (collision-aware, as a knockback push).
 p.knockback=vx*T.carry;p.knockFrames=T.carry;
 p.swing=null;p.thread=-1;p.threadCd=T.cooldown;p.jumps=Math.min(p.jumps,1);
}
function swingTick(s,p,input){
 const sw=p.swing,L=s.level,k=L.hub.knots[sw.k];
 const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
 sw.om-=Math.trunc(sw.g*sinQ(sw.ang)/4096);
 // Pump: lean into the swing's direction while it passes the bottom.
 if(axis&&Math.sign(sw.om)===axis&&Math.abs(sw.ang)<T.pumpZone)sw.om+=axis*T.pump;
 sw.om=Math.max(-T.maxSpeed,Math.min(T.maxSpeed,sw.om));
 sw.ang+=sw.om;
 if(Math.abs(sw.ang)>T.maxAngle){sw.ang=Math.sign(sw.ang)*T.maxAngle;sw.om=0;}
 const x=k.x+sw.len*sinQ(sw.ang)/4096000,y=k.y-sw.len*cosQ(sw.ang)/4096000-p.h*T.hand;
 box.x=x;box.y=y;box.w=p.w;box.h=p.h;
 if(blocked(L,box)){p.vx=0;p.vy=0;p.swing=null;p.thread=-1;p.threadCd=T.cooldown;return;}
 p.vx=x-p.px;p.vy=y-p.py;p.x=x;p.y=y;p.grounded=false;p.clip='glide';
 if(axis)p.facing=axis;
}
function blocked(L,b){
 for(let y=Math.floor(b.y+.05);y<=Math.floor(b.y+b.h-.05);y++)for(let x=Math.floor(b.x-b.w/2);x<=Math.floor(b.x+b.w/2);x++)if(solid(tile(L,x,y)))return true;
 return b.x<b.w/2||b.x>L.width-b.w/2;
}
function thread(s,p,input){
 if(p.threadCd>0)p.threadCd--;
 if(p.swing){
  if(!(input&B.block)||p.dead||p.stun||p.form||p.formShift||p.dodge)release(s,p,false);
  else if(edge(input,s.world.prev,B.jump))release(s,p,true);
  else swingTick(s,p,input);
  return;
 }
 if(input&B.block&&!p.grounded&&!p.dodge&&!p.form&&!p.formShift&&!(p.threadCd>0)&&s.world.echoes.includes('thread')&&s.level.hub.knots.length)attach(s,p);
}

// After the players' own tick (run.js tick): Echo traversal, chasm falls, doors and the bench.
export function hubTick(s,inputs){
 const w=s.world;
 if(w.fight)return;
 if(w.fade>0)w.fade--;
 const p=s.players[0],input=inputs[0]||0;
 if(p.dead){w.prev=input;return;}
 thread(s,p,input);
 if(p.grounded&&!p.swing){const t=tile(s.level,Math.floor(p.x),Math.floor(p.y-.5));if(t===1||t===4){w.safe.x=p.x;w.safe.y=p.y;}}
 // A fall into a chasm: one mask, back on the last solid footing.
 if(p.y<HUB.fall){
  p.x=p.px=w.safe.x;p.y=p.py=w.safe.y+.3;p.vx=0;p.vy=0;p.knockback=0;p.knockFrames=0;p.swing=null;p.thread=-1;
  hurt(s,p,{x:p.x,team:2,eye:'#FF4A4A'},HUB.fallDamage,{unparryable:true});
 }
 // A door or the bench takes a plain Down: Down pressed with Dodge (the Battering Brow, the Shell Drop), Mask (the Mend
 // chord) or a strike is that move, never also a door.
 const L=s.level,H=L.hub,down=edge(input,w.prev,B.down)&&!(input&(B.dodge|B.possess|B.attack|B.sword|B.blast));
 w.prev=input;
 if(s.frame>HUB.cap&&p.grounded&&!p.swing&&H.doors.length){
  let near=H.doors[0];for(const d of H.doors)if(Math.abs(d.x-p.x)+Math.abs(d.y-p.y)<Math.abs(near.x-p.x)+Math.abs(near.y-p.y))near=d;
  end(s,{kind:'travel',room:w.room,at:near.id});return;
 }
 for(let i=0;i<H.doors.length;i++){
  const d=H.doors[i];
  if(d.kind==='edge'){
   if(Math.abs(p.y-d.y)<HUB.edgeRise&&(d.side<0?p.x<HUB.edge&&input&B.left:p.x>L.width-HUB.edge&&input&B.right)){useDoor(s,d,i);return;}
  }else if(down&&Math.abs(p.x-d.x)<HUB.arch&&Math.abs(p.y-d.y)<HUB.archRise){useDoor(s,d,i);return;}
 }
 // The bench: masks restored, the save taken (the segment ends and the next one starts sitting here).
 if(down&&H.bench&&Math.abs(p.x-H.bench.x)<HUB.arch&&Math.abs(p.y-H.bench.y)<HUB.archRise){
  for(const q of s.players){heal(q,q.maxMask);q.energy=energyMax(q);}
  w.bench={room:w.room,at:'bench'};emitSound(s,'altar-chime');emit(s,p.x,p.y+1,0xffb347,12);
  end(s,{kind:'bench',room:w.room,at:'bench'});
 }
 if(w.msg&&s.frame-w.msg.frame>HUB.message)w.msg=null;
}

// Replaces the classic end-of-area flow in hub rooms: no lives, moult drafts, a death returns to the last bench.
export function hubFlow(s){
 let alive=false;
 for(const p of s.players){
  if(p.y<R.playerFallY&&!p.dead){p.dead=true;p.defeatedFrame=s.frame;p.clip='beaten';if(p.forms)resetForm(p);}
  if(!p.dead)alive=true;
 }
 if(!alive){s.phase='respawn';s.respawn=F.respawn;return;}
 startDraft(s);
}
// Called by run.js respawn() after the hunters are rebuilt: back to the bench room, masks full, progress kept.
export function hubRespawn(s){
 const w=s.world;w.deaths++;
 enterRoom(s,w.bench.room,w.bench.at);
 for(const p of s.players){p.mask=p.maxMask;p.glass=false;}
}

// The snapshot a following segment starts from.
// Clamped to validCampaign's bounds: a snapshot that failed validation would make the saved replay unreadable.
export function hubSnapshot(s,room,at,extra={}){
 const w=s.world,p=s.players[0],c=s.config.campaign,cap=(v,max)=>Math.max(0,Math.min(max,v));
 return {v:1,room,at,bench:{...w.bench},echoes:[...w.echoes],cleared:[...w.cleared],visited:[...w.visited],
  level:cap(p.level??c.level,99)||1,xp:cap(p.xp??c.xp,999),drafts:cap(p.drafts??c.drafts,20),seg:cap(c.seg+1,1e6),base:c.base,deaths:w.deaths,...(c.monsters?{monsters:true}:{}),...extra};
}
function segmentConfig(s,campaign,boss){
 const p=s.players[0],config={...s.config,seed:campaign.base+':'+campaign.seg,campaign};
 // The Exuvial's stolen parts always come back: a fight left mid-way keeps the moults the hunter brought in.
 const moults=s.exStash?.[0]||p.moults;
 delete config.moults;if(moults?.length)config.moults=[...moults];
 config.boss=hubBossConfig(boss||'chrysalis');
 // A boss cleared by an older build, before its form existed, still hands its form over (FORM_IDS order).
 const owed=campaign.cleared.map(id=>HUB_BOSSES[id]?.mask).filter(id=>FORM_IDS.includes(id));
 if(owed.some(id=>!config.masks?.includes(id))){const own=new Set([...(config.masks||[]),...owed]);config.masks=FORM_IDS.filter(id=>own.has(id));}
 return hubGates(config);
}
// After a segment's result: {config} for the next segment, plus what the screen should say. Null: stay on the result.
export function hubNext(s){
 const w=s.world,c=s.config.campaign;
 if(!w)return null;
 if(w.fight){
  // A long fight cut after a lost attempt (hubAgain): the same fight, a fresh segment, the attempt count kept.
  if(!s.won&&w.out?.kind==='again'){
   const campaign=hubSnapshot(s,c.room,c.at,{fight:w.fight,tries:Math.min(1e6,s.bossAttempts+1)});
   return {config:segmentConfig(s,campaign,w.fight),fight:w.fight,again:true};
  }
  // A hub fight has no lives, so it only ends won; anything else goes back to the bench, never to an empty save.
  if(!s.won)return {...hubRetreat(s),retreat:true};
  const b=HUB_BOSSES[w.fight],echo=b.echo,again=c.cleared.includes(w.fight);
  if(!w.cleared.includes(w.fight))w.cleared.push(w.fight);
  if(echo&&!w.echoes.includes(echo))w.echoes.push(echo);
  const campaign=hubSnapshot(s,HUB_LIFT.room,HUB_LIFT.at,{fight:undefined});delete campaign.fight;delete campaign.tries;
  const config=segmentConfig(s,campaign);
  const mask=FORM_IDS.includes(b.mask)?b.mask:null;
  if(mask){config.masks=[...new Set([...(config.masks||[]),mask])].filter(id=>FORM_IDS.includes(id));config.masks=FORM_IDS.filter(id=>config.masks.includes(id));}
  return {config,taken:{boss:w.fight,mask,echo,...(again?{again:true}:{})}};
 }
 const out=w.out;
 if(!out)return null;
 if(out.kind==='boss'){
  const campaign=hubSnapshot(s,out.room,out.at,{fight:out.boss,bench:{room:w.room,at:'bench'}});
  return {config:segmentConfig(s,campaign,out.boss),fight:out.boss};
 }
 const config=segmentConfig(s,hubSnapshot(s,out.room,out.at));
 return {config,saved:out.kind==='bench',hall:out.kind==='hall'};
}
// A fight given up from the pause menu: back to the bench before its door, nothing lost.
export function hubRetreat(s){
 const w=s.world;if(!w?.fight)return null;
 const campaign=hubSnapshot(s,w.bench.room,w.bench.at);delete campaign.fight;
 return {config:segmentConfig(s,campaign)};
}
export {ECHO_IDS,HUB_ROOMS,roomLevel,doorOf};
