import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {hurt,fire,emit} from '../core/combat.js';
import {spawnEnemy} from './enemies/wild.js';
import {EXUVIAL as C} from '../data/exuvial.js';
import {MOULTS} from '../data/moults.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {VISUALS as V} from '../data/visuals.js';
import {glassMultiplier,baseId} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';

// Rules-v4 The Exuvial: it hangs head-down in the Moulting Well. Its Shedding Hook (cyan, dodge only) grafts a body
// slot onto it: your moult when it lands, a wall skin's part when dodged. Each graft is a fixed move that ends with the
// part planted low (amber): three hits inside 60f tear it back and open the body for 60f (at most every 12 s).
// Holding three parts (P3) it pupates; a broken cocoon opens it for 90f. A parried Rake ender stuns it for 35f.
const M=C.moves,MOVE={horns:'gore',back:'burst',arms:'rake',legs:'sweep',sigil:'sigil'};
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const clampX=x=>Math.max(C.minX,Math.min(C.maxX,x));
const ringX=x=>Math.max(C.arenaLeft+1,Math.min(C.right-1,x));
const mid=(C.arenaLeft+C.right)/2;

// The Moulting Well over the Nest's boss arena: the silk lid (P1 floor) and, from P2, the cocoon pods. Idempotent.
export function well(level){
 const w=level.width;
 while(level.grid.length<C.rows)level.grid.push(Array(w).fill(0));
 for(let y=1;y<level.grid.length;y++)for(let x=Math.floor(C.arenaLeft);x<Math.min(w,C.right);x++)level.grid[y][x]=0;
 for(let x=C.lid.x0;x<Math.min(w,C.lid.x1);x++)level.grid[C.lid.row][x]=1;
 // The Nest's arena secrets (a mask) would float in the open shaft as a free heal: the Well has none.
 if(level.secrets)level.secrets=level.secrets.filter(d=>d.x<C.arenaLeft);
 // Render hint only (the simulation never reads it): the view may frame past the Nest's edge to centre the Well.
 level.well=true;level.viewWidth=C.right+3;
 return level;
}
function pods(s,on){
 for(const p of C.pods)for(let x=p.x0;x<p.x1;x++)s.level.grid[p.row][x]=on?2:0;
 s.levelRevision++;
}
// The top of the first floor at or under (x, y): the lid, a pod or the Well's bottom.
export function floorAt(level,x,y){
 const c=Math.floor(x);
 for(let r=Math.min(level.grid.length-1,Math.floor(y-.01));r>=0;r--){const t=level.grid[r]?.[c]||0;if(t===1||t===2||t===4)return r+1;}
 return 1;
}
const floorOf=(s,p)=>p.grounded?p.y:floorAt(s.level,p.x,p.y);

export function spawnExuvial(s){
 well(s.level);s.levelRevision++;
 // Every stolen part comes back for a new attempt (a retry starts whole).
 if(!s.exStash)s.exStash=s.players.map(p=>p.moults?[...p.moults]:null);
 s.players.forEach((p,i)=>{
  if(s.exStash[i])p.moults=[...s.exStash[i]];
  // The hunter drops into the Well through its top lock onto the silk lid.
  p.x=p.px=C.drop.x+i*C.drop.spacing;p.y=p.py=C.drop.y;p.vx=0;p.vy=0;
 });
 const e=entity(s.nextId++,'brawler',52,C.top,2,s.config.difficulty);
 const hp=Math.round(C.hp*(s.config.mode==='coop'?C.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 Object.assign(e,{
  boss:true,v4:true,exuvial:true,bossId:'exuvial',phase:1,hp,maxMask:hp,mask:hp,eye:'#19B8A6',w:C.head.w,h:C.head.h,
  ai:'enter',aiTimer:long?C.intro:C.entrance,aiFrames:long?C.intro:C.entrance,intro:long,
  hx:52,hy:C.top,phx:52,phy:C.top,act:null,queue:[],history:[],seen:[],gap:0,lastG:'',
  grafts:[],flying:[],tearHits:[],planted:null,skins:[],falls:[],husks:[],
  open:0,openDamage:0,openKind:'',sinceOpen:C.openGap,sinceParry:C.parryGap,emerged:false,cocoon:null,
  chip:hp*C.chipCap,chipTimer:C.chipWindow,far:0,still:0,desperate:0,despMax:C.desperation,trans:0,
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,grafts:0,tears:0,stolen:0,cocoons:0,strikes:0,minLead:999,minShot:999,start:s.frame}
 });
 box(e);
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=C.door;emitSound(s,'boss-roar');
 return e;
}

// The hurtbox: hitboxes never follow the art. The head (ivory), a planted graft (amber), the cocoon, the slumped body.
function box(e){
 const pl=e.act?.stage==='plant'&&e.planted;
 if(pl){e.x=pl.x;e.y=pl.y;e.w=pl.w;e.h=pl.h;}
 else if(e.ai==='open'||e.ai==='spent'){e.x=e.hx;e.y=e.hy;e.w=3;e.h=2.6;}
 else if(e.ai==='cocoon'){e.x=e.hx;e.y=e.hy;e.w=3;e.h=3.6;}
 else{e.x=e.hx;e.y=e.hy;e.w=C.head.w;e.h=C.head.h;}
}
// Every strike on a hunter goes through here: its lead (frames since its tell began) is kept for the fairness audit.
function strike(s,e,p,lead,opts,heavy=false){
 if(p.dead||p.inv>0||p.dodge>0)return 'immune';
 const r=hurt(s,p,e,e.glass||heavy?C.despDamage:1,opts);
 if(r==='hit'){e.stats.strikes++;e.stats.minLead=Math.min(e.stats.minLead,lead);}
 return r;
}
// The burning chimera's contact shape follows the drawn inverted mask: narrow at the lips, full width at the crest.
function burns(e,p){
 const top=Math.min(C.head.h,p.y+p.h-e.hy);
 if(top<=0||p.y>=e.hy+C.head.h)return false;
 return Math.abs(p.x-e.hx)<.4+.92*Math.min(1,top/2.6)+p.w/2;
}
const inBox=(p,x0,x1,y0,y1)=>p.x+p.w/2>x0&&p.x-p.w/2<x1&&p.y<y1&&p.y+p.h>y0;
function nearPoint(p,x,y,r){
 const dx=Math.max(Math.abs(p.x-x)-p.w/2,0),dy=y<p.y?p.y-y:y>p.y+p.h?y-(p.y+p.h):0;
 return dx*dx+dy*dy<r*r;
}
// Shots carry their tell too: the lead at launch is a floor for any hit they land.
function orb(s,e,lead,x,y,vx,vy,radius,range=99){
 const o=fire(s,e,false,true);
 e.stats.minShot=Math.min(e.stats.minShot??999,lead);
 if(o){o.x=x;o.y=y;o.vx=vx;o.vy=vy;o.radius=radius;o.range=range;o.unparryable=true;o.damage=e.glass?C.despDamage:1;}
 return o;
}

// Grafts: a hooked hunter loses the part in the chosen slot (its moult; an empty slot gives a fixed boss part);
// a dodged hook snags a wall skin's part instead. Either way the part flies across for 20f.
function graft(s,e,p,x,y){
 if(e.grafts.length>=C.holds[tier(e)])return;
 const free=C.slots.filter(sl=>!e.grafts.some(g=>g.slot===sl));
 if(!free.length)return;
 const owned=p?.moults?free.filter(sl=>p.moults.some(m=>MOULTS[baseId(m)]===sl)):[];
 const list=owned.length?owned:free,slot=list[Math.floor(random(s)*list.length)];
 let id=C.own[slot],pid=0;
 if(owned.length){const i=p.moults.findIndex(m=>MOULTS[baseId(m)]===slot);id=p.moults[i];p.moults.splice(i,1);pid=p.id;e.stats.stolen++;}
 e.grafts.push({slot,id,pid,mine:!!pid});
 e.flying.push({slot,id,x,y,to:1,t:C.fly});
 e.stats.grafts++;
 emitSound(s,pid?'mask-crack2':'block');emit(s,x,y,0xffb347,8);
}
function giveBack(s,e,g){
 const p=g.pid&&s.players.find(q=>q.id===g.pid);
 if(p&&p.moults&&!p.moults.some(m=>MOULTS[baseId(m)]===g.slot))p.moults.push(g.id);
 e.flying.push({slot:g.slot,id:g.id,x:e.hx,y:e.hy+1,to:p?-p.id:0,t:C.fly});
}
function tear(s,e,slot){
 const i=e.grafts.findIndex(g=>g.slot===slot);if(i<0)return;
 giveBack(s,e,e.grafts[i]);e.grafts.splice(i,1);e.tearHits.length=0;e.stats.tears++;
 s.shake=F.shakeFrames*2;emit(s,e.x,e.y+.5,0xffb347,18);emitSound(s,'mask-shatter');
 const pl=e.planted;e.planted=null;
 if(e.sinceOpen>=C.openGap&&!e.glass)openUp(s,e,'tear',C.tearOpen,pl);
 else{e.act=null;e.queue.length=0;e.ai='stagger';e.aiTimer=e.aiFrames=C.stagger;e.unparryable=false;}
}
function openUp(s,e,kind,frames,at){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openKind=kind;e.openDamage=0;
 if(kind==='rake')e.sinceParry=0;else e.sinceOpen=0;
 // The stitched body slumps to the floor where the part was torn (or where it stood) and splits amber: it falls
 // there in a few frames (the 'open' tick), never a jump cut.
 e.slump={x:at?clampX(at.x):e.hx,y:at?at.y:floorAt(s.level,e.hx,e.hy)};
 e.act=null;e.queue.length=0;e.planted=null;e.unparryable=false;e.clip='hit';e.stats.openings++;
 emit(s,e.hx,e.hy+1.3,0xffb347,16);emitSound(s,'block');
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.ai='hang';e.clip='idle';e.gap=roll(s,C.neutral[tier(e)]);
}
export function exuvialParried(s,e,p){
 const a=e.act;
 if(e.dead||!a||a.id!=='rake'||a.stage!=='swipe')return;
 // Desperation: a parried Rake ender ends it. Otherwise the ender stuns it for 35f (at most every 10 s).
 if(a.n===M.rake.swipes-1){
  if(e.glass){defeat(s,e,p);return;}
  if(e.sinceParry>=C.parryGap){openUp(s,e,'rake',C.rakeOpen,{x:e.hx,y:a.fl});s.shake=F.shakeFrames;}
 }
}
function defeat(s,e,source,credit=true){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';
 if(credit&&source&&source.team!==2&&source.kills!==undefined)source.kills++;
 for(const g of e.grafts)giveBack(s,e,g);e.grafts.length=0;
 if(s.exStash)s.players.forEach((p,i)=>{if(s.exStash[i])p.moults=[...s.exStash[i]];});
 emit(s,e.hx,e.hy+2,0xffb347,30);emitSound(s,'enemy-beaten');
}
function transition(s,e){
 e.open=0;e.phase++;e.ai='transition';e.trans=0;e.aiTimer=e.aiFrames=C.transition;e.clip='summon';
 e.act=null;e.queue.length=0;e.planted=null;e.unparryable=false;e.cocoon=null;
 s.shake=F.shakeFrames*3;emit(s,e.hx,e.hy+2,0xf1ece2,24);emitSound(s,'boss-roar');
}
function desperation(s,e){
 e.open=0;e.glass=true;e.desperate=C.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;e.planted=null;e.cocoon=null;
 e.ai='hang';e.gap=C.neutral[3][0];e.unparryable=false;
 s.hitStop=F.swordStop;emit(s,e.hx,e.hy+2,0xf1ece2,24);emitSound(s,'mask-shatter');
}
// Damage rules: the open body is amber (x2.5 up to the 10% cap); a planted graft takes chip and three melee hits inside
// 60f tear it back; the cocoon cracks on every hit; the stitched skins take capped chip; entrance, transitions and the
// desperation clank.
export function exuvialHurt(s,e,source,damage,projectile){
 if(e.ai==='spent'){defeat(s,e,source,false);return 'hit';}
 const clank=e.ai==='enter'||e.ai==='transition'||e.glass||e.ai==='cocoon'&&e.cocoon?.stage!=='shell';
 let take=0;
 const amber=!clank&&e.ai==='open',planted=!clank&&e.act?.stage==='plant'&&e.planted;
 if(amber){
  take=Math.min(damage*C.amber*(projectile?.5:1),Math.max(0,e.maxMask*C.cap-e.openDamage));
  if(source.form&&source.formBudget>=0)take=Math.min(take,source.formBudget);
  e.openDamage+=take;
  if(source.forms)gainEmber(s,source,EMBER.hit);
 }else if(!clank){
  const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
  if(source.form&&source.formBudget>=0){
   take=Math.min(raw*C.chip*(projectile?.5:1),e.chip+(e.formChip||0),source.formBudget);
   const base=Math.min(take,e.chip);e.chip-=base;if(take>base)e.formChip-=take-base;
  }else{take=Math.min(raw*C.chip*(projectile?.5:1),e.chip);e.chip-=take;}
 }
 if(source.form&&source.formBudget>=0)source.formBudget=Math.max(0,source.formBudget-take);
 const floor=e.phase<3?e.maxMask*C.thresholds[e.phase-1]:0;
 e.hp=Math.max(floor,e.hp-take);e.mask=e.hp;e.flash=F.flash;
 s.hitStop=Math.max(s.hitStop,amber||planted?F.swordStop:F.hitStop);
 emit(s,source.x+(e.x-source.x)*.5,(source.y||e.y)+1,amber||planted?0xffb347:clank?0x7fe8ff:0xf1ece2,amber||planted?8:4);
 if(amber||planted)s.shake=F.shakeFrames;
 if(clank){emitSound(s,'block');return 'hit';}
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);return 'hit';}
 if(planted&&!projectile){
  e.tearHits.push(s.frame);while(e.tearHits.length&&s.frame-e.tearHits[0]>=C.tear.window)e.tearHits.shift();
  if(e.tearHits.length>=C.tear.hits)tear(s,e,planted.slot);
 }else if(e.ai==='cocoon'&&e.cocoon.stage==='shell'&&++e.cocoon.hits>=C.cocoon.hits)breakCocoon(s,e);
 else if(amber&&e.openDamage>=e.maxMask*C.cap-1e-9){emit(s,e.hx,e.hy+1.3,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}

function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
const husksAlive=s=>{let n=0;for(const x of s.enemies)if(x.husk&&!x.dead)n++;return n;};
function can(s,e,m){
 if(m==='hook')return !e.glass&&e.grafts.length<C.holds[tier(e)];
 if(m==='g')return e.glass||e.grafts.length>0;
 if(m==='rain')return husksAlive(s)+e.skins.length<M.rain.max[tier(e)];
 return true;
}
function choose(s,e){
 // P3: holding three parts it pupates (until it has emerged once this phase).
 if(e.phase===3&&!e.glass&&e.grafts.length>=3&&!e.emerged){pupate(s,e);return;}
 const list=C.patterns[tier(e)].filter(p=>(!p.chimera||e.emerged)&&p.m.every(m=>can(s,e,m)));
 let pick=null;
 // Range is answered by the hook (or a slam when its hands are full), turtling by the slam.
 if(e.far>=C.antiRange.frames)pick=list.find(p=>p.m[0]==='hook')||list.find(p=>p.m[0]==='slam');
 else if(e.still>=C.antiTurtle)pick=list.find(p=>p.m[0]==='slam');
 if(pick&&!allowed(e,pick.id))pick=null;
 if(!pick){
  let total=0;for(const p of list)if(allowed(e,p.id))total+=p.w;
  let r=random(s)*total;
  for(const p of list){if(!allowed(e,p.id))continue;r-=p.w;if(r<0){pick=p;break;}}
  pick=pick||list[0];
 }
 e.far=0;e.still=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.queue=[...pick.m];
 e.gap=pick.m.length?0:roll(s,C.neutral[tier(e)])*2;
}
function graftMove(s,e){
 const list=e.glass?C.slots:e.grafts.map(g=>g.slot),pool=list.length>1?list.filter(x=>x!==e.lastG):list;
 const slot=pool[Math.floor(random(s)*pool.length)];e.lastG=slot;
 return MOVE[slot];
}
function tellFrames(s,e,id){
 const tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=C.tells[tr<3?Math.min(2,tr+tight):3];
 if(tr<3&&!e.seen.includes(id)){tells=C.tells[tight];e.seen.push(id);}
 return Math.max(C.minTell,Math.round(roll(s,tells)*TIERS[s.config.difficulty].tell))+(C.extra[id]||0);
}
function start(s,e,t,id){
 if(id==='g')id=graftMove(s,e);
 if(id==='hook'&&!can(s,e,'hook'))id='slam';
 const frames=tellFrames(s,e,id),fl=floorOf(s,t);
 const a=e.act={id,stage:'tell',t:frames,frames,x:t.x,y:t.y+t.h/2,fl,born:s.frame,dir:Math.sign(t.x-e.hx)||1,hit:[]};
 e.unparryable=id!=='rake';
 emitSound(s,'enemy-telegraph');
 if(id==='rain'){
  const k=M.rain;a.xs=[];
  for(let i=0;i<Math.min(k.skins,k.max[tier(e)]-husksAlive(s));i++)a.xs.push(Math.max(C.arenaLeft+.8,Math.min(C.right-.8,t.x+(i?1:-1)*k.spread*(.6+random(s)*.5))));
 }else if(id==='sweep'){
  // The tail starts at the wall on its own side and sweeps the hunter's floor to the other wall.
  a.side=e.hx<mid?-1:1;a.x0=a.side<0?C.arenaLeft+.4:C.right-.4;a.x1=a.side<0?C.right-.4:C.arenaLeft+.4;
 }else if(id==='sigil'){
  a.rings=[{x:t.x,fl}];
  // The second ring keeps its distance from the first while it tracks: the gap between them is always the same.
  if(e.phase>1||e.glass){a.off=t.x<mid?M.sigil.offset:-M.sigil.offset;a.rings.push({x:ringX(t.x+a.off),fl});}
 }
}
function endAct(s,e){
 e.act=null;e.planted=null;e.unparryable=false;
 e.gap=e.queue.length?C.neutral[tier(e)][0]>>1:roll(s,C.neutral[tier(e)]);
}
function plant(s,e,a,x,y,w,h){
 // Desperation wears the parts on the wrong sockets: nothing to tear back, it simply rises.
 if(e.glass||!e.grafts.some(g=>g.slot===a.slot)){a.stage='lift';a.t=a.frames=M[a.id].lift;return;}
 a.stage='plant';a.t=a.frames=C.plant[tier(e)];
 e.planted={slot:a.slot,x,y,w,h};e.tearHits.length=0;e.unparryable=false;
}
export const lockAt=id=>id==='hook'?.5:id==='slam'||id==='gore'?.7:.6;
const goal=(e,x,y,k=.25)=>{e.hx+=Math.max(-k,Math.min(k,x-e.hx));e.hy+=Math.max(-k,Math.min(k,y-e.hy));};
function actTick(s,e,t){
 const a=e.act,tr=tier(e),fl=a.fl,lead=s.frame-a.born;
 a.t--;
 const q=1-a.t/a.frames;
 if(a.stage==='tell'){
  // Aimed moves track the hunter for the first part of the tell (half for the hook, 40% for the drops), then lock.
  if(a.t>a.frames*lockAt(a.id)){a.x=a.id==='slam'||a.id==='gore'?clampX(t.x):t.x;a.y=t.y+t.h/2;a.fl=floorOf(s,t);if(a.rings){a.rings[0].x=t.x;if(a.rings[1])a.rings[1].x=ringX(t.x+a.off);}}
  if(a.id==='hook')goal(e,clampX(e.hx+(t.x-e.hx)*.02),a.fl+C.hang[tr]+.6,.03);
  else if(a.id==='slam'||a.id==='gore')goal(e,clampX(a.x),a.fl+C.hang[tr]+(a.id==='slam'?M.slam.rise:.4),.14);
  else if(a.id==='rake')goal(e,clampX(t.x-a.dir*2.2),a.fl+.3,.12);
  else if(a.id==='sweep')goal(e,clampX(a.x0),a.fl+C.hang[tr]+.8,.12);
  else goal(e,e.hx,a.fl+C.hang[tr]+.5,.05);
  if(a.t>0)return;
  if(a.id==='hook'){a.stage='active';a.t=a.frames=M.hook.active;a.mx=e.hx;a.my=e.hy+.4;
   const dx=a.x-a.mx,dy=a.y-a.my,d=Math.sqrt(dx*dx+dy*dy)||1,l=Math.min(M.hook.reach,d+M.hook.over);
   a.ex=a.mx+dx/d*l;a.ey=Math.max(a.fl+.15,a.my+dy/d*l);a.tx=a.mx;a.ty=a.my;emitSound(s,'rush');}
  else if(a.id==='slam'||a.id==='gore'){a.stage='drop';a.t=a.frames=M[a.id].drop;a.x0=e.hx;a.y0=e.hy;a.fl=floorAt(s.level,a.x,e.hy);}
  else if(a.id==='rain'){
   for(const x of a.xs)e.skins.push({x,y:e.hy+5,fl:floorAt(s.level,x,e.hy+4),t:M.rain.fall,born:a.born});
   emitSound(s,'block');endAct(s,e);
  }else if(a.id==='burst'||a.id==='storm'){
   curtain(s,e,lead,M.burst.cols[a.id==='storm'||tr>=2?1:0]);
   s.shake=F.shakeFrames;emit(s,e.hx,e.hy+.6,0x7fe8ff,14);emitSound(s,'blast-fire');
   // From P3 the wings beat twice: a second curtain in the first one's gaps, 30f later.
   if(a.id==='storm'||tr>=2){a.stage='volley';a.t=a.frames=M.storm.volley;}
   else droop(e,a,t);
  }else if(a.id==='rake'){a.stage='wind';a.n=0;a.t=a.frames=M.rake.gap;a.fl=floorAt(s.level,e.hx,e.hy+.5);a.dir=Math.sign(t.x-e.hx)||a.dir;}
  else if(a.id==='sweep'){a.stage='active';a.t=a.frames=M.sweep.active;a.fl=floorOf(s,t);emitSound(s,'rush');}
  else if(a.id==='sigil'){a.stage='active';a.t=a.frames=M.sigil.active;emit(s,a.rings[0].x,a.rings[0].fl,0x7fe8ff,10);emitSound(s,'blast-fire');}
  return;
 }
 if(a.id==='hook'){
  if(a.stage==='active'){
   // The hook's tip flies to where the hunter was at the lock (and a little past): two sub-steps per frame.
   for(const k of [.5,1]){
    const qq=Math.min(1,(1-(a.t+1-k)/a.frames));a.tx=a.mx+(a.ex-a.mx)*qq;a.ty=a.my+(a.ey-a.my)*qq;
    for(const p of s.players)if(!a.hooked&&nearPoint(p,a.tx,a.ty,M.hook.radius)&&strike(s,e,p,lead,{unparryable:true,impactX:a.tx})==='hit')a.hooked=p;
    if(a.hooked)break;
   }
   if(a.hooked||a.t<=0){
    graft(s,e,a.hooked||null,a.tx,a.ty);
    a.stage='retract';a.t=a.frames=M.hook.retract;a.rx=a.tx;a.ry=a.ty;
   }
  }else{a.tx=a.rx+(e.hx-a.rx)*q;a.ty=a.ry+(e.hy+.4-a.ry)*q;if(a.t<=0)endAct(s,e);}
  return;
 }
 if(a.id==='slam'||a.id==='gore'){
  const k=M[a.id];
  if(a.stage==='drop'){
   // It swoops from where the tell left it onto its shadow (never a jump cut), landing on the shadow at impact.
   e.hx=a.x0+(clampX(a.x)-a.x0)*Math.min(1,q*1.6);e.hy=a.y0+(a.fl-a.y0)*q*q;
   if(a.t<=0){
    e.hy=a.fl;s.shake=F.shakeFrames*(a.id==='slam'?3:2);emit(s,a.x,a.fl,0xf1ece2,a.id==='slam'?22:12);emitSound(s,'land');
    for(const p of s.players)if(inBox(p,a.x-k.w/2,a.x+k.w/2,a.fl-.2,a.fl+C.head.h))strike(s,e,p,lead,{unparryable:true,impactX:a.x},a.id==='slam'&&e.phase>1);
    // From P2 the slam sends floor waves and smashes the cocoon pod it lands on.
    if(e.phase>1&&a.id==='slam'){
     for(const d of [-1,1])orb(s,e,lead,a.x+d*1.4,a.fl+M.slam.wave.y,d*M.slam.wave.speed,0,M.slam.wave.radius,M.slam.wave.range);
     if(a.fl>1){const r=a.fl-1;let n=0;for(let x=Math.floor(a.x-k.w/2);x<Math.ceil(a.x+k.w/2);x++)if(s.level.grid[r]?.[x]===2){s.level.grid[r][x]=0;n++;emit(s,x+.5,a.fl,0xf1ece2,3);}if(n)s.levelRevision++;}
    }
    if(a.id==='slam'){a.stage='rest';a.t=a.frames=k.rest;}
    else{a.slot='horns';plant(s,e,a,a.x,a.fl,1.8,1.3);if(a.stage==='plant')e.hy=a.fl+1;}
   }
   return;
  }
  if(a.stage==='rest'){if(a.t<=0){a.stage='lift';a.t=a.frames=k.lift;}return;}
 }
 if(a.id==='burst'||a.id==='storm'){
  if(a.stage==='volley'){
   if(a.t<=0){
    curtain(s,e,lead,M.burst.cols[0]);emitSound(s,'blast-fire');
    if(a.id==='storm'){a.rings=[{x:t.x,fl:floorOf(s,t)}];a.stage='sigil';a.t=a.frames=M.storm.ring;}
    else droop(e,a,t);
   }
   return;
  }
  if(a.stage==='sigil'){
   // The ring follows the hunter while the second curtain falls, then locks (its lead counts from the lock).
   if(a.t>M.storm.lock){a.rings[0].x=t.x;a.rings[0].fl=floorOf(s,t);}
   else if(a.t===M.storm.lock){a.lock=1;emitSound(s,'enemy-telegraph');}
   if(a.t<M.sigil.active)pillars(s,e,a,M.storm.lock-a.t);
   if(a.t<=0){a.stage='lift';a.t=a.frames=M.storm.lift;}
   return;
  }
  if(a.stage==='droop'){goal(e,e.hx,a.fl+1.2,.25);if(a.t<=0){plant(s,e,a,clampX(e.hx+a.side*1.7),a.fl,1.6,1.2);if(a.stage==='plant')e.hy=a.fl+1.2;}return;}
 }
 if(a.id==='rake'){
  const k=M.rake;
  if(a.stage==='wind'){
   e.hx=clampX(e.hx+Math.max(-k.drift,Math.min(k.drift,t.x-a.dir*1.6-e.hx)));
   if(a.t<=0){a.stage='swipe';a.t=a.frames=k.active;a.hit=[];emitSound(s,'sword-swing');}
   return;
  }
  if(a.stage==='swipe'){
   const x0=a.dir>0?e.hx+k.x0:e.hx-k.x1,x1=a.dir>0?e.hx+k.x1:e.hx-k.x0;
   for(const p of s.players){
    if(a.hit.includes(p.id)||!inBox(p,x0,x1,a.fl,a.fl+k.h))continue;
    a.hit.push(p.id);
    strike(s,e,p,lead,{stop:F.swordStop,impactX:e.hx});
    if(e.act!==a)return;
   }
   if(a.t<=0){
    a.n++;
    if(a.n<k.swipes){a.stage='wind';a.t=a.frames=a.n===k.swipes-1?k.ender:k.gap;a.dir=Math.sign(t.x-e.hx)||a.dir;}
    else{a.slot='arms';plant(s,e,a,clampX(e.hx+a.dir*2.1),a.fl,1.8,1);}
   }
   return;
  }
 }
 if(a.id==='sweep'&&a.stage==='active'){
  const k=M.sweep;a.tip=a.x0+(a.x1-a.x0)*q;
  for(const p of s.players)if(!a.hit.includes(p.id)&&inBox(p,a.tip-k.w/2,a.tip+k.w/2,a.fl-.3,a.fl+k.h)){a.hit.push(p.id);strike(s,e,p,lead,{unparryable:true,impactX:a.tip});}
  // The spent tail slaps down flat along the floor beside the hunter (harmless, amber where it was grafted).
  if(a.t<=0){a.slot='legs';plant(s,e,a,Math.max(C.arenaLeft+2.8,Math.min(C.right-2.8,t.x)),a.fl,5.4,.9);}
  return;
 }
 if(a.id==='sigil'&&a.stage==='active'){
  pillars(s,e,a,lead);
  // Desperation plants nothing, so it rises at once instead of sinking its head onto the floor.
  if(a.t<=0){a.slot='sigil';a.stage=e.glass?'lift':'sink';a.t=a.frames=e.glass?M.sigil.lift:12;}
  return;
 }
 if(a.stage==='sink'){goal(e,e.hx,a.fl+.25,.3);if(a.t<=0){plant(s,e,a,e.hx,a.fl,2.2,1.4);if(a.stage==='plant')e.hy=a.fl+.25;}return;}
 if(a.stage==='plant'){if(a.t<=0){e.planted=null;a.stage='lift';a.t=a.frames=M[a.id].lift;}return;}
 if(a.stage==='lift'){goal(e,e.hx,floorOf(s,t)+C.hang[tr],.18);if(a.t<=0)endAct(s,e);}
}
// After a Wing Burst the stolen back droops low to be torn (desperation plants nothing: it rises).
function droop(e,a,t){
 if(e.glass){a.stage='lift';a.t=a.frames=M.burst.lift;return;}
 a.slot='back';a.side=Math.sign(t.x-e.hx)||1;a.stage='droop';a.t=a.frames=14;
}
function curtain(s,e,lead,cols){
 const k=M.burst;
 for(const c of cols){const x=e.hx+c;if(x>C.arenaLeft+.2&&x<C.right-.2)orb(s,e,lead,x,e.hy+1.2+Math.abs(c)*.15,Math.sign(c)*k.drift,-k.speed,k.radius);}
}
function pillars(s,e,a,lead){
 const k=M.sigil;
 for(const r of a.rings)for(const p of s.players)if(!a.hit.includes(p.id)&&inBox(p,r.x-k.radius,r.x+k.radius,r.fl-.2,r.fl+k.height)){a.hit.push(p.id);strike(s,e,p,lead,{unparryable:true,impactX:r.x});}
}

// P3: holding three parts it wraps itself in a cocoon on the floor. Six hits break it (every part torn back, 90f open);
// left alone for 8 s it emerges, keeps its parts and gains the Skin Storm for the rest of the phase.
function pupate(s,e){
 e.ai='cocoon';e.cocoon={stage:'wrap',t:C.cocoon.tell,hits:0,born:s.frame,fl:floorAt(s.level,e.hx,e.hy),rain:C.cocoon.rain};
 e.unparryable=false;e.stats.cocoons++;emitSound(s,'enemy-telegraph');
}
function breakCocoon(s,e){
 for(const g of e.grafts)giveBack(s,e,g);
 e.grafts.length=0;e.stats.tears++;e.cocoon=null;s.shake=F.shakeFrames*3;emitSound(s,'mask-shatter');
 openUp(s,e,'cocoon',C.cocoonOpen,{x:e.hx,y:e.hy});
}
function cocoonTick(s,e,t){
 const c=e.cocoon;c.t--;
 if(c.stage==='wrap'){goal(e,e.hx,c.fl,.2);if(c.t<=0){e.hy=c.fl;c.stage='shell';c.t=C.cocoon.frames;s.shake=F.shakeFrames*2;emit(s,e.hx,c.fl,0xf1ece2,18);emitSound(s,'land');}return;}
 if(c.stage==='shell'){
  // The Well keeps raining skins on a hunter who waits.
  if(--c.rain<=0&&husksAlive(s)<M.rain.max[2]){c.rain=C.cocoon.rain;const x=Math.max(C.arenaLeft+.8,Math.min(C.right-.8,t.x+(t.x<mid?2:-2)));e.skins.push({x,y:e.hy+6,fl:floorAt(s.level,x,e.hy+5),t:M.rain.fall+24,born:s.frame});}
  if(c.t<=0){
   // It emerges: the shell bursts into a ring of cyan scales (the cracking shell is the tell).
   e.emerged=true;e.cocoon=null;e.ai='hang';e.gap=C.neutral[2][0];
   // Two low floor waves each way (jump them).
   for(const d of [-1,1])for(const [v,y] of [[C.wave.speed,.25],[C.wave.speed*.65,.25]])orb(s,e,s.frame-c.born,e.hx+d*1.6,e.hy+y,d*v,0,C.wave.radius,C.wave.range);
   s.shake=F.shakeFrames*3;emit(s,e.hx,e.hy+1.8,0x7fe8ff,24);emitSound(s,'boss-roar');
  }
 }
}
function transitionTick(s,e,t){
 const n=++e.trans,T=C.transition,cut=e.phase===2?50:40;
 if(n<cut){goal(e,clampX(e.hx),Math.min(C.top-2,e.hy+6),.25);if(n===cut-24)emitSound(s,'enemy-telegraph');}
 if(n===cut){
  // P2: it crashes through the silk lid; the hunter falls among cocoon pods. P3: it rips every pod down to the bottom.
  s.shake=F.shakeFrames*4;emitSound(s,'mask-shatter');
  if(e.phase===2){for(let x=C.lid.x0;x<C.lid.x1;x++){s.level.grid[C.lid.row][x]=0;emit(s,x+.5,C.lid.row+.5,0xf1ece2,2);}pods(s,true);}
  else{for(const p of C.pods)for(let x=p.x0;x<p.x1;x++)emit(s,x+.5,p.row+.5,0xf1ece2,2);pods(s,false);}
  for(let i=0;i<4;i++)e.falls.push({x:Math.max(C.arenaLeft+.8,Math.min(C.right-.8,t.x+(i-1.5)*3.1+random(s)*.6)),t:C.debris.warn+10+i*14,born:s.frame});
 }
 if(n>cut)goal(e,clampX(t.x),floorOf(s,t)+C.hang[e.phase-1]+.6,.2);
 if(n>=T){e.ai='hang';e.gap=roll(s,C.neutral[e.phase-1]);e.emerged=false;}
}

function hazards(s,e){
 for(let i=e.falls.length-1;i>=0;i--){
  const f=e.falls[i];
  if(f.t<=C.debris.warn&&f.t%6===0)emit(s,f.x,Math.min(C.debris.y,e.hy+8)-.4,0xf1ece2,2);
  if(--f.t>0)continue;
  e.falls.splice(i,1);orb(s,e,s.frame-f.born,f.x,C.debris.y,0,C.debris.speed,C.debris.radius);
 }
 // Shed skins drop from the dark and stand up as crawling husks (wild Brutes, their own 24-30f tells).
 for(let i=e.skins.length-1;i>=0;i--){
  const k=e.skins[i];k.y+=(k.fl-k.y)/Math.max(1,k.t);
  if(--k.t>0)continue;
  e.skins.splice(i,1);
  const h=spawnEnemy(s,{kind:'brawler',x:k.x,y:k.fl,delay:30});h.minion=true;h.husk=true;h.hp=M.rain.hp;emit(s,k.x,k.fl,0x8f1c2c,6);
 }
 for(const f of e.flying)f.t--;
 for(let i=e.flying.length-1;i>=0;i--)if(e.flying[i].t<=0)e.flying.splice(i,1);
 // Husk corpses leave the list once they have dissolved, so a long fight stays small.
 for(let i=s.enemies.length-1;i>=0;i--){const x=s.enemies[i];if(x.husk&&x.dead&&s.frame-x.defeatedFrame>V.defeatedLife)s.enemies.splice(i,1);}
}

export function exuvialTick(s,e){
 if(e.dead)return;
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.phx=e.hx;e.phy=e.hy;
 e.stun=0;e.vx=0;e.vy=0;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(--e.chipTimer<=0){e.chipTimer=C.chipWindow;e.chip=e.maxMask*C.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-C.chipCap);}
 for(const p of s.players){if(p.x<C.arenaLeft){p.x=C.arenaLeft;if(p.vx<0)p.vx=0;}if(p.x>C.right-.4){p.x=C.right-.4;if(p.vx>0)p.vx=0;}}
 e.far=Math.abs(t.x-e.hx)>C.antiRange.distance?e.far+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 e.sinceOpen++;e.sinceParry++;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.stats.frames++;
 hazards(s,e);
 if(e.ai==='enter'){
  e.clip='idle';
  // It lowers itself head-first out of the dark on its threads while its name and cry show.
  const q=e.aiTimer/e.aiFrames,y=floorOf(s,t)+C.hang[0];e.hy=y+(C.top-y)*q*q;e.hx=52-3*q;
  if(--e.aiTimer<=0){e.ai='hang';e.gap=roll(s,C.neutral[0]);}
 }else if(e.ai==='hang'){
  if(e.glass&&e.desperate<=0&&!e.act){e.ai='spent';e.slump={x:e.hx,y:floorAt(s.level,e.hx,e.hy)};e.clip='maskbreak';emitSound(s,'mask-crack3');}
  else if(e.act)actTick(s,e,t);
  else{
   goal(e,clampX(t.x),floorOf(s,t)+C.hang[tier(e)],.06);
   if(e.gap>0)e.gap--;
   else if(e.queue.length)start(s,e,t,e.queue.shift());
   else choose(s,e);
  }
  e.clip=e.glass?'glassidle':e.act?(e.act.stage==='tell'||e.act.stage==='wind'?'telegraph':'sweep'):'idle';
  // Desperation: once it has risen (burnGrace frames) the chimera's body burns on contact, but only while it hangs, rests
  // or rises: a drop, swipe or sink is the move's own hitbox (its shadow and rings), never an untold body slam.
  // The body only burns after it has been still for minTell frames, so a hunter inside it when a move ends can step out.
  const burn=C.desperation-e.desperate,st=e.act?.stage,still=!e.act||st==='rest'||st==='lift'||st==='tell'&&e.act.id!=='rake';
  e.calm=still?(e.calm||0)+1:0;
  if(e.glass&&e.ai==='hang'&&e.calm>=C.minTell&&burn>=C.burnGrace)for(const p of s.players)if(burns(e,p))strike(s,e,p,Math.min(burn,e.calm),{unparryable:true,impactX:e.hx});
 }else if(e.ai==='open'){
  e.clip='hit';e.open=e.aiTimer;
  if(e.slump)goal(e,e.slump.x,e.slump.y,.7);
  if(--e.aiTimer<=0)closeOpening(s,e);
 }else if(e.ai==='stagger'){e.clip='hit';if(--e.aiTimer<=0){e.ai='hang';e.gap=roll(s,C.neutral[tier(e)]);}}
 else if(e.ai==='cocoon')cocoonTick(s,e,t);
 else if(e.ai==='transition')transitionTick(s,e,t);
 else if(e.ai==='spent'){e.clip='maskbreak';if(e.slump)goal(e,e.slump.x,e.slump.y,.3);}
 box(e);
 if(e.ai==='transition'||e.ai==='cocoon'||e.act||e.glass&&e.ai!=='spent'||e.falls.length||e.skins.length)e.stats.threat++;
}
