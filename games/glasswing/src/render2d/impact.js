import {IMPACT as I} from '../data/impact.js';
import {MOVES,WILD_HITBOX as WH} from '../data/moves.js';
import {ENEMIES} from '../data/enemies.js';
import {BOSS4} from '../data/boss4.js';
import {FORMS} from '../data/forms.js';
import {CORDYCEA} from '../data/cordycea.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {glow} from './surface.js';
import {css,P} from './color.js';
import {t} from '../ui/i18n.js';

// Impact and juice: slash arcs shaped to the hitboxes, hit sparks and a white impact star, floating damage, a
// render-side screen shake, and boss break, phase and kill moments (slow motion, radial flash, shock ring).
// Reads the simulation, never writes it: every memory is a WeakMap or a pool on this side.
// Fairness guard: telegraphing bodies (inflated by their ring and, for bosses, the move's reach) cap every overlay.
const TAU=Math.PI*2,D=Math.PI/180;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,easeOut=x=>1-(1-x)**3;
// Arc per melee move: sweep angles (degrees, 0 = forward, 90 = up) and crescent thickness.
const ARC={punch1:{a:[60,-40],th:.4,ry:1.5},punch2:{a:[-45,55],th:.4,ry:1.5},punch3:{a:[80,-65],th:.5,ry:1.4},kick:{a:[-65,40],th:.36},
 divekick:{a:[40,-75],th:.32},sword:{a:[85,-65],th:.5},downsword:{a:[-170,-10],th:.48,down:1}};
const BOSS_ARC={sweep:{a:[80,-50],th:.5},lunge:{a:[-60,80],th:.45}};
const FORM_ARC={sweep:{a:[80,-55],th:.5}};
const HERO=[P.amber,P.amberHot,'#ffffff'],FOE=[P.cyan,P.cyanHot,'#ffffff'],FOE_PARRY=[P.cyan,P.ivory,'#ffffff'];

// A body showing a tell: wild and Old Glasswing telegraphs, the Chrysalis lip cue (either side), its act tells
// (gum, corkscrew, flail, the wall self-pump) and the whole Drop-Reel until it lands.
const REEL={creak:1,lift:1,sway:1,fall:1};
// Also the spoke bosses' own tell states: the Anchorite's turn warning, the Exuvial's Rake wind-ups, the delayed clap's
// hold, the Antiphon's sung Hymn.
export function tell(e){return !e.dead&&(e.ai==='telegraph'||e.ai==='warn'||e.clip==='telegraph'||!!e.lip||!!e.song||e.act?.stage==='tell'||e.act?.stage==='pump'||e.act?.stage==='wind'||e.act?.stage==='hold'&&!!e.chrysalis5||!!REEL[e.reel?.stage]);}

export class Impact{
 constructor(){
  this.on=I.on;this.layers=true;this.prefs=()=>null;this.clock=()=>(globalThis.performance?.now?.()??Date.now())/1000;
  this.now=null;this.dt=0;this.mem=new WeakMap();this.seed=7;
  this.sparks=Array.from({length:I.sparks.pool},()=>({life:0}));
  this.nums=Array.from({length:I.numbers.pool},()=>({life:0}));
  this.rings=Array.from({length:I.rings.pool},()=>({life:0}));
  this.stars=Array.from({length:12},()=>({life:0}));
  this.words=Array.from({length:4},()=>({life:0}));
  this.trauma=0;this.ft=0;this.kx=0;this.ky=0;this.st=0;this.amp=0;
  this.slow={k:1,t:0,dur:0,min:1,hold:0};this.flash={a:0,max:0,x:0,y:0,t:0,dur:.35};this.drain={a:0,max:0,t:0,dur:0};
  this.guards=[];this.box=[0,0,0,0];this.pts=new Float32Array(I.slash.points*2+2);this.out=[0,0];
  this.stats={frames:0,guarded:0,overlay:0,gated:0,flash:0,shake:0,shakeAll:0,ms:0,maxMs:0,numbers:0,words:0,moments:0,slashes:0};
 }
 rand(){this.seed=(this.seed*16807)%2147483647;return this.seed/2147483647;}
 // Options: damage numbers on/off; shake and flashes full / reduced / off.
 settings(){const s=this.prefs()||{};return {numbers:I.numbers.on&&s.numbers!==false,k:!I.shake.on||s.shake==='off'?0:s.shake==='reduced'?I.shake.reduced:1};}
 // Live clock pace for src/main.js: 0 while a moment freezes, then eases back to 1 from its slow motion.
 pace(){return this.on?this.slow.k:1;}
 // A new level (a room door, a fight beginning or ending): the world-anchored sparks, rings, words and the frozen
 // clock belong to the old one, so a FELLED or a burst never replays over the next room.
 clear(){for(const pool of [this.sparks,this.nums,this.rings,this.stars,this.words])for(const o of pool)o.life=0;this.trauma=this.kx=this.ky=0;this.slow={k:1,t:0,dur:0,min:1,hold:0};this.flash.a=this.flash.max=0;this.drain.a=this.drain.max=0;}
 // White flash share for a struck sprite (drawn over its shaded self): fades in real time, slower through a hit-stop.
 white(e){const m=this.mem.get(e),W=I.white;if(!m||m.fat===undefined)return W.peak;const k=Math.max(0,1-(this.ft-m.fat)/W.life)*(e.boss?W.boss:W.peak);return tell(e)?Math.min(k,I.guard.alpha):k;}
 // Called first in View.render: detects hits from entity changes, then returns the camera offset (tiles).
 frame(state,alpha,delta){
  const out=this.out;out[0]=out[1]=0;
  if(!this.on)return out;
  const now=this.clock();this.dt=this.now===null?0:clamp(now-this.now,0,.1);this.now=now;this.wdt=Math.min(.1,(this.wdt||0)+this.dt);this.sdt=Math.min(.1,(this.sdt||0)+this.dt);
  const players=state.players||[];
  this.frozen=state.hitStop>0||!!state.phase&&state.phase!=='playing'&&state.phase!=='round'||!(delta>0);this.ft+=this.dt*(this.frozen?I.white.freeze:1);
  for(const e of state.enemies||[])this.watch(state,e,players);
  for(const p of players)this.watch(state,p,players);
  // Guards: every telegraphing enemy, its ring, and for a boss the reach of the move it is telling.
  // Hazard tells too: falling-debris columns (their dust shows at the ceiling), corkscrew tripwires while they
  // warn. Live hazards (hostile shots, gum, set tripwires) only cap the overlays drawn over them (5th flag 0).
  const G=this.guards;G.length=0;let tells=0;
  for(const e of state.enemies||[]){
   if(e.dead)continue;
   if(tell(e)){
    const pad=I.guard.pad*(e.boss?2:1);let l=e.x-e.w/2-pad,r=e.x+e.w/2+pad,b=e.reel?-1:e.y-pad*.4,top=e.y+e.h+pad;
    const m=e.boss&&e.v4&&!e.chrysalis&&BOSS4.moves[e.action],f=e.facing<0?-1:1;
    if(m&&m.x1!==undefined){const a=e.x+f*m.x0,z=e.x+f*m.x1;l=Math.min(l,a,z)-.5;r=Math.max(r,a,z)+.5;top=Math.max(top,e.y+m.y1+.5);}
    if(m&&m.waveRange){l=Math.min(l,e.x-m.waveRange);r=Math.max(r,e.x+m.waveRange);}
    G.push([l,b,r,top,1]);tells++;
   }
   for(const d of e.falls||[]){G.push([d.x-1.2,-1,d.x+1.2,99,1]);tells++;}
   for(const w of e.wires||[]){G.push([w.x0-.4,w.y-.6,w.x1+.4,w.y+.6,w.warn>0?1:0]);if(w.warn>0)tells++;}
   for(const o of e.globs||[])G.push([o.x-.6,o.y-.6,o.x+.6,o.y+.6,0]);
   if(e.boss)tells+=hazardTells(e,G);
  }
  for(const p of state.projectiles||[])if(p.active&&p.team===2){const r=(p.radius||.2)+.4;G.push([p.x-r,p.y-r,p.x+r,p.y+r,0]);}
  this.tells=tells;this.stats.frames++;if(tells)this.stats.guarded++;
  // Slow motion and freeze frames (real time).
  const S=this.slow,dt=this.dt;
  if(S.t<S.hold+S.dur){S.t+=dt;S.k=S.t<S.hold?0:S.min+(1-S.min)*easeOut(clamp((S.t-S.hold)/Math.max(.01,S.dur)));}else S.k=1;
  // Shake: trauma squared on layered sines, plus a directional kick; the guard caps it while a tell plays.
  const set=this.settings(),H=I.shake;
  this.trauma=Math.max(0,this.trauma-H.decay*dt);const kd=Math.exp(-H.kickDecay*dt);this.kx*=kd;this.ky*=kd;this.st+=dt;
  const q=this.trauma*this.trauma*H.max,w=this.st,fq=H.freq;
  let dx=(q*(Math.sin(w*fq[0])*.6+Math.sin(w*fq[1]+1.3)*.4)+this.kx)*set.k,dy=(q*(Math.sin(w*fq[2]+.7)*.6+Math.sin(w*fq[3]+2.1)*.4)+this.ky)*set.k;
  const amp=Math.hypot(dx,dy);this.stats.shakeAll=Math.max(this.stats.shakeAll,amp);
  if(tells&&amp>I.guard.shake){const s=I.guard.shake/amp;dx*=s;dy*=s;}
  if(tells)this.stats.shake=Math.max(this.stats.shake,Math.min(amp,I.guard.shake));
  out[0]=dx;out[1]=dy;this.amp=Math.hypot(dx,dy);this.cost=this.clock()-now;
  return out;
 }
 watch(s,e,players){
  let m=this.mem.get(e);
  if(!m){m={hp:e.hp,mask:e.mask,flash:e.flash||0,parry:e.parryFlash||0,ai:e.ai,phase:e.phase||1,glass:!!e.glass,dead:!!e.dead,vul:!!e.vulnerable,od:e.openDamage||0,form:e.form||null,elite:e.eliteHits||0};this.mem.set(e,m);return;}
  const foe=e.team===2;if((e.flash||0)>m.flash)m.fat=this.ft;
  if(foe&&!m.dead){
   const dhp=(m.hp??0)-(e.hp??0),armour=(e.eliteHits||0)<m.elite;
   if((e.flash||0)>m.flash||dhp>0||armour){
    const src=nearest(players,e),dir=src?Math.sign(e.x-src.x)||src.facing||1:1;
    const x=e.x-dir*Math.min(e.w*.45,.7),y=clamp(src?src.y+.85:e.y+e.h*.5,e.y+.25,e.y+Math.max(.3,e.h-.25));
    const amber=dhp>0&&(e.boss?(e.openDamage||0)>m.od||m.ai==='open':m.vul&&!e.vulnerable||!!src?.glass);
    const chip=dhp>0&&e.boss&&!amber,heavy=s.hitStop>=6;
    const kind=dhp<=0&&!armour?'clank':amber?'amber':chip?'chip':'hit';
    this.hit(x,y,dir,kind,amber?I.shake.weight.amber:heavy?I.shake.weight.heavy:I.shake.weight.light*(chip||kind==='clank'?.6:1));
    if(dhp>0)this.number(e,dhp,amber?'crit':chip?'chip':'hit',dir);
   }
  }else if(!foe&&!e.dead){
   if((e.mask??0)<(m.mask??0)||(e.flash||0)>m.flash&&!e.form){const dir=Math.sign(e.knockback||0)||-(e.facing||1);this.hit(e.x,e.y+e.h*.55,dir,'hurt',I.shake.weight.hurt);}
   if((e.parryFlash||0)>m.parry)this.parry(e);
   if(e.form&&!m.form){this.ring(e.x,e.y+e.h*.6,4,.45,P.amber);this.add(I.shake.weight.form,0);}
  }
  // Cordycea's risen dead are boss-flagged bodies but not the boss: they fall like foes, with no boss moments.
  // A boss that dies through a hold (Cordycea's bloom: hp 0, ai 'dying', dead 2 s later) is felled on the killing blow,
  // not over the empty grove after its fall.
  const main=e.boss&&!e.risen&&!e.minion,down=!!e.dead||main&&e.ai==='dying';
  if(main&&!down){
   if(e.ai==='open'&&m.ai!=='open')this.moment(e.riposte||e.openKind==='clap'?'stagger':'open',e);
   if((e.phase||1)>m.phase&&!e.glass)this.moment('phase',e);
   if(e.glass&&!m.glass)this.moment('shatter',e);
  }
  if(down&&!m.dead&&foe){
   if(main)this.moment('felled',e);
   else{const y=e.y+e.h*.55;this.ring(e.x,y,1.8,.3,P.cyan);this.burst(e.x,y,0,'kill',10);this.add(I.shake.weight.kill,0);}
  }
  m.hp=e.hp;m.mask=e.mask;m.flash=e.flash||0;m.parry=e.parryFlash||0;m.ai=e.ai;m.phase=e.phase||1;m.glass=!!e.glass;m.dead=down;m.vul=!!e.vulnerable;m.od=e.openDamage||0;m.form=e.form||null;m.elite=e.eliteHits||0;
 }
 add(w,dir){if(!(w>0))return;this.trauma=Math.min(1,this.trauma+w);this.kx+=dir*I.shake.kick*w*2;}
 // One struck body: the white impact star, directional streaks and shards, the shake.
 hit(x,y,dir,kind,w){
  const big=kind==='amber'?1.5:kind==='hurt'?1.2:kind==='chip'||kind==='clank'?.6:1;
  this.star(x,y,dir,I.star.size*big,kind==='hurt'?P.cyanHot:'#ffffff');
  this.burst(x,y,dir,kind,Math.round(I.sparks.streaks*big));
  this.add(w,kind==='hurt'?dir*.5:-dir);
 }
 parry(e){
  const f=e.facing<0?-1:1,x=e.x+f*.45,y=e.y+e.h*.6;
  this.star(x,y,f,I.star.parry,P.ivory);this.ring(x,y,2.6,.32,P.ivory);
  this.burst(x,y,f,'parry',16);this.add(I.shake.weight.parry,f);
 }
 star(x,y,dir,size,color){const o=free(this.stars);if(!o)return;Object.assign(o,{life:I.star.life,max:I.star.life,x,y,dir,size,color,rot:this.rand()*.6});}
 ring(x,y,r,dur,color,delay=0){const o=free(this.rings)||oldest(this.rings);Object.assign(o,{life:dur+delay,max:dur,delay,x,y,r,color});}
 burst(x,y,dir,kind,n){
  const S=I.sparks;if(!S.on)return;
  const pal=kind==='amber'?[P.amberHot,P.amber,P.amberHot]:kind==='hurt'?[P.cyanHot,P.cyan,P.bone]:kind==='parry'?[P.ivory,'#ffffff',P.bone]:kind==='chip'?[P.bone,P.ash,P.bone]:kind==='clank'?[P.cyanHot,P.ash,P.ash]:kind==='kill'?[P.cyan,P.cyanHot,P.bone]:kind==='boss'?[P.amberHot,P.ivory,P.bone]:[P.ivory,P.amberHot,P.bone];
  const shards=kind==='clank'?0:Math.round(S.shards*(kind==='boss'?3:kind==='amber'?1.5:1)),all=n+shards;let k=0;
  for(const p of this.sparks){
   if(k>=all)break;if(p.life>0)continue;
   const shard=k>=n,spread=dir?(shard?1.1:.7):Math.PI,back=dir&&!shard&&this.rand()<.2;
   const a=(dir?(dir>0?0:Math.PI)+(back?Math.PI:0):0)+(this.rand()*2-1)*spread+(shard?(dir>0?.35:-.35):0),v=S.speed*(.45+this.rand()*.75)*(kind==='boss'?1.6:1)*(shard?.55:1);
   const life=S.life*(.6+this.rand()*.6)*(shard?1.7:1)*(kind==='boss'?1.8:1);
   Object.assign(p,{life,max:life,x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v+(shard?.06:0),shard,color:pal[shard?2:k%2],size:(shard?.07:.05)*(.7+this.rand()*.8)*(kind==='boss'?1.6:1),spin:this.rand()*TAU});k++;
  }
 }
 number(e,v,kind,dir){
  if(!this.settings().numbers)return;
  const N=I.numbers;let slot=0;
  for(;slot<N.pool;slot++){let used=false;for(const n of this.nums)if(n.life>0&&n.e===e&&n.slot===slot){used=true;break;}if(!used)break;}
  const o=free(this.nums)||oldest(this.nums);
  Object.assign(o,{life:N.life,max:N.life,e,x:e.x+dir*.25,y:e.y+e.h+.15,v:Math.max(1,Math.round(v*N.scale)),kind,slot,dir});
  this.stats.numbers++;
 }
 moment(kind,e){
  const M=I.moments[kind],x=e.x,y=e.y+e.h*.55,S=this.slow;
  if(M.slow<1&&(S.t>=S.hold+S.dur||M.slow<=S.min)){S.t=0;S.min=M.slow;S.dur=M.dur;S.hold=kind==='felled'?.16:kind==='shatter'?.1:.06;S.k=0;}
  const col=kind==='stagger'||kind==='phase'?P.ivory:P.amber;
  this.ring(x,y,M.ring[0],M.ring[1],col);
  if(kind==='felled'||kind==='shatter'){this.ring(x,y,M.ring[0]*.6,M.ring[1]*.8,P.ivory,.12);this.burst(x,y,0,'boss',kind==='felled'?40:26);}
  else if(kind==='open'||kind==='stagger')this.burst(x,y,0,kind==='open'?'amber':'parry',12);
  if(M.flash){const f=this.flash;f.max=f.a=M.flash;f.t=0;f.x=x;f.y=y;f.dur=kind==='felled'?.5:.35;}
  if(M.desat){const d=this.drain;d.max=d.a=M.desat;d.t=0;d.dur=M.dur+.3;this.dg=this.guards.length?0:1;}
  if(M.word){for(const w of this.words)if(w.e===e||kind==="felled")w.life=0;const o=free(this.words)||oldest(this.words);Object.assign(o,{life:I.words.life,max:I.words.life,key:M.word,e,x,y:e.y+e.h+.6,col:kind==='stagger'?P.ivory:P.amber});this.stats.words++;}
  this.add(I.shake.weight[kind],0);this.stats.moments++;
 }
 guarded(l,b,r,top){for(const G of this.guards)if(l<G[2]&&r>G[0]&&b<G[3]&&top>G[1])return true;return false;}
 // Alpha through the fairness guard (world box).
 gate(a,l,b,r,top){if(!this.guards.length||!this.guarded(l,b,r,top))return a;const v=Math.min(a,I.guard.alpha);this.stats.gated++;this.stats.overlay=Math.max(this.stats.overlay,v);return v;}
 // World layer (after the simulation effects): slash arcs, sparks, stars, rings.
 world(g,state,alpha,frame){
  if(!this.on||!this.layers)return;
  const c0=this.clock(),wdt=this.wdt;this.wdt=0;const step=wdt*60*(this.frozen?I.sparks.freeze:1)*(this.slow.k||I.sparks.freeze),age=wdt*(this.frozen?I.sparks.freeze:1)*(this.slow.k||I.sparks.freeze);
  g.globalCompositeOperation='lighter';
  if(I.slash.on){for(const p of state.players||[])this.slash(g,p,alpha,frame);for(const e of state.enemies||[])this.slash(g,e,alpha,frame);}
  for(const r of this.rings){
   if(!(r.life>0))continue;r.life-=wdt*(this.slow.k||.25);if(r.life>r.max)continue;
   const k=1-clamp(r.life/r.max),rad=r.r*easeOut(k)+.1,a=this.gate((1-k)*.9,r.x-rad,r.y-rad,r.x+rad,r.y+rad);
   g.strokeStyle=css(r.color,a);g.lineWidth=.04+.32*(1-k)*(r.r>5?1.4:1);g.beginPath();g.arc(r.x,-r.y,rad,0,TAU);g.stroke();
  }
  for(const p of this.sparks){
   if(!(p.life>0))continue;
   p.px=p.x;p.py=p.y;p.x+=p.vx*step;p.y+=p.vy*step;p.vy-=(p.shard?I.sparks.gravity*2:I.sparks.gravity*.4)*step;p.vx*=Math.pow(.93,step);p.life-=age;
   const k=clamp(p.life/p.max),a=this.gate(Math.min(1,k*1.4),p.x-.3,p.y-.3,p.x+.3,p.y+.3);
   if(p.shard){
    g.globalCompositeOperation='source-over';g.fillStyle=css(p.color,a);g.save();g.translate(p.x,-p.y);g.rotate(p.spin+p.life*14);
    g.beginPath();g.moveTo(-p.size,0);g.lineTo(0,-p.size*1.6);g.lineTo(p.size,p.size*.4);g.closePath();g.fill();g.restore();g.globalCompositeOperation='lighter';
   }else{
    const len=Math.hypot(p.vx,p.vy)*(2.2+3*k)+.05,ux=p.vx/(Math.hypot(p.vx,p.vy)||1),uy=p.vy/(Math.hypot(p.vx,p.vy)||1);
    g.strokeStyle=css(p.color,a);g.lineWidth=p.size*(.5+k);g.lineCap='round';g.beginPath();g.moveTo(p.x,-p.y);g.lineTo(p.x-ux*len,-(p.y-uy*len));g.stroke();
   }
  }
  g.lineCap='butt';
  for(const o of this.stars){
   if(!(o.life>0))continue;o.life-=age;
   const k=clamp(o.life/o.max),s=o.size*(.6+.6*k),a=this.gate(Math.min(1,k*1.6),o.x-s,o.y-s,o.x+s,o.y+s),sp=glow(o.color);
   if(sp){g.globalAlpha=a*.7;g.drawImage(sp,o.x-s*.9,-o.y-s*.9,s*1.8,s*1.8);g.globalAlpha=1;}
   g.fillStyle=css('#ffffff',a);g.save();g.translate(o.x,-o.y);g.rotate(o.rot);g.beginPath();
   for(let i=0;i<8;i++){const r=i%2?s*.12:i%4?s*.55:s*1.1,an=i*Math.PI/4;g.lineTo(Math.cos(an)*r*(i%4===0?1.15:1),Math.sin(an)*r);}
   g.closePath();g.fill();g.restore();
  }
  g.globalCompositeOperation='source-over';g.globalAlpha=1;this.cost+=this.clock()-c0;
 }
 // Slash crescent for the melee move an entity is in, shaped to its hitbox and shown while it is active.
 slash(g,e,alpha,frame){
  if(e.dead)return;
  const f=e.facing<0?-1:1,ex=e.px+(e.x-e.px)*alpha,ey=e.py+(e.y-e.py)*alpha;
  if(e.team!==2&&e.move&&ARC[e.move]){
   const m=MOVES[e.move],A=ARC[e.move],box=m.frames[m.startup],lt=e.moveFrame-m.startup-1+alpha,L=I.slash.linger;
   if(!box||lt<-.5||lt>m.active+L)return;
   const reach=box.w+(m.stat==='sword'&&e.upgrades?.includes('longerNeedle')?U.longerNeedle:0);
   const head=clamp((lt+1)/Math.min(I.slash.sweep,m.active)),tail=lt>m.active?clamp((lt-m.active)/L):0;
   let k=I.slash.alpha*(box.stop>=6||e.move==='punch3'?I.slash.heavy:1)*(e.glass?I.slash.glass:1)*(e.hitIds?.length?1.25:1)*(1-tail*tail);
   if(A.down)this.crescent(g,ex,ey,f,0,box.y+box.h,reach*.5,box.h,A,tail,head,k,HERO,e.glass?1.25:1);
   else this.crescent(g,ex,ey,f,box.x,box.y+box.h/2,reach,box.h/2*(A.ry||I.slash.ry),A,tail,head,k,HERO,(box.stop>=6?1.2:1)*(e.glass?1.25:1));
  }else if(e.team!==2&&e.form&&e.formMove&&FORMS[e.form]){
   const m=FORMS[e.form].moves[e.formMove];if(!m)return;const lt=e.formFrame-m.startup-1+alpha;
   if(lt<-.5||lt>m.active+I.slash.linger)return;
   const head=clamp((lt+1)/I.slash.sweep),tail=lt>m.active?clamp((lt-m.active)/I.slash.linger):0,k=I.slash.alpha*1.2*(1-tail*tail);
   if(FORM_ARC[e.formMove])this.crescent(g,ex,ey,f,m.x0,(m.y0+m.y1)/2,m.x1-m.x0,(m.y1-m.y0)/2*1.1,FORM_ARC[e.formMove],tail,head,k,HERO,1.3);
   else if(e.formMove==='slam')for(const s of [f,-f])this.crescent(g,ex,ey,s,0,m.y0+.3,m.x1,(m.y1-m.y0)*.8,{a:[90,-5],th:.4},tail,head,k,HERO,1.2);
   else if(e.formMove==='rush'&&lt<m.active)this.streaks(g,ex,ey,f,e.h,k,P.amber);
  }else if(e.team===2&&e.ai==='attack'){
   if(e.boss){
    if(!e.v4||e.chrysalis||!e.action)return;
    const m=BOSS4.moves[e.action],lt=(e.aiFrames||m?.active||1)-e.aiTimer-1+alpha;if(!m)return;
    const col=m.parry?FOE_PARRY:FOE,k=I.slash.alpha*(1-clamp((lt-m.active+3)/3)*.6);
    if(BOSS_ARC[e.action])this.crescent(g,ex,ey,f,m.x0,(m.y0+m.y1)/2,m.x1-m.x0,(m.y1-m.y0)/2*1.1,BOSS_ARC[e.action],0,clamp((lt+1)/I.slash.sweep),k,col,1.5);
    else if(e.action==='slam')for(const s of [f,-f])this.crescent(g,ex,ey,s,0,m.y0+.1,m.x1,m.y1-m.y0+.1,{a:[90,0],th:.45},0,clamp((lt+1)/I.slash.sweep),k,col,1.3);
    else if(e.action==='rush')this.streaks(g,ex,ey,f,e.h,k,P.cyan);
   }else if(e.kind!=='spark'){
    // Wild strikes: the full crescent for exactly the frames the hitbox is live (the arc never runs ahead of it);
    // they can be parried, so the core is ivory (cyan alone means unparryable).
    const d=ENEMIES[e.kind]||ENEMIES.brawler,lt=d.active-e.aiTimer-1+alpha,ww=e.w+WH.extraWidth,x0=WH.forward-ww/2;
    this.crescent(g,ex,ey,f,x0,e.h/2,ww,e.h/2*1.05,{a:[70,-50],th:.42},0,clamp((lt+1)/2),I.slash.alpha*.9,FOE_PARRY,1);
   }
  }
 }
 // A filled crescent on the ellipse (cx, cy, rx, ry) in the body's frame (x forward, y up), drawn from
 // `from` to `to` (shares of the sweep A.a): pointed tips, thickest mid-sweep; glow, hot body, white edge.
 crescent(g,ox,oy,f,cx,cy,rx,ry,A,from,to,k,col,width=1){
  if(to<=from||k<=0)return;
  const n=I.slash.points,a0=A.a[0]*D,a1=A.a[1]*D,th=A.th*width,pts=this.pts;
  const l=ox+Math.min(f*(cx-rx),f*(cx+rx)),r=ox+Math.max(f*(cx-rx),f*(cx+rx));
  k=this.gate(Math.min(1,k),l,oy+cy-ry,r,oy+cy+ry);this.stats.slashes++;
  for(let i=0;i<=n;i++){const u=from+(to-from)*i/n,an=a0+(a1-a0)*u;pts[i*2]=Math.cos(an);pts[i*2+1]=Math.sin(an);}
  for(const [w,c,al] of [[1,col[0],.38],[.6,col[1],.78],[.18,col[2],.95]]){
   g.fillStyle=css(c,Math.min(1,al*k));g.beginPath();
   for(let i=0;i<=n;i++){const x=cx+rx*pts[i*2],y=cy+ry*pts[i*2+1];g.lineTo(ox+f*x,-(oy+y));}
   for(let i=n;i>=0;i--){const u=from+(to-from)*i/n,fat=1-th*w*Math.pow(Math.sin(Math.PI*u),.7),x=cx+rx*fat*pts[i*2],y=cy+ry*(1-(1-fat)*.35)*pts[i*2+1];g.lineTo(ox+f*x,-(oy+y));}
   g.closePath();g.fill();
  }
 }
 streaks(g,x,y,f,h,k,col){
  for(let i=0;i<4;i++){const yy=y+h*(.2+i*.2),len=1.2+(i%2)*.8;g.strokeStyle=css(col,this.gate(.55*k,x-3,y,x+3,y+h));g.lineWidth=.06;g.beginPath();g.moveTo(x-f*.6,-yy);g.lineTo(x-f*(.6+len),-yy);g.stroke();}
 }
 // Screen layer (after the fog): damage numbers, BREAK/STAGGER words, the radial flash and the colour drain.
 screen(g,W,H,k,cx,cy){
  if(!this.on||!this.layers)return;
  const c0=this.clock(),ui=H/720,top=H*(H>W?I.words.tall:I.words.top),set=this.settings(),dt=this.sdt,X=x=>W/2+(x-cx)*k,Y=y=>H/2-(y-cy)*k,G=this.guards,N=I.numbers;this.sdt=0;
  const gs=G.map(b=>[X(b[0]),Y(b[3]),X(b[2]),Y(b[1])]);
  // Colour drain, then the flash centred on the boss.
  const d=this.drain;
  if(d.a>0){d.t+=dt;d.a=d.max*(1-clamp((d.t-.15)/Math.max(.05,d.dur)));this.dg=clamp((this.dg??1)+(G.length?-20:4)*dt);const a=this.dg*d.a*Math.min(1,set.k*2);
   if(a>.01){g.globalCompositeOperation='saturation';g.globalAlpha=a;g.fillStyle='#808080';g.fillRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';}}
  const F=this.flash;
  if(F.a>0){F.t+=dt;F.a=F.max*(1-easeOut(clamp(F.t/F.dur)));let a=F.a*set.k;if(this.tells)a=Math.min(a,I.guard.flash);
   if(this.tells)this.stats.flash=Math.max(this.stats.flash,a);
   if(a>.01){const x=X(F.x),y=Y(F.y),R=Math.max(W,H)*.85,gr=g.createRadialGradient(x,y,0,x,y,R);
    gr.addColorStop(0,css(P.ivory,a));gr.addColorStop(.18,css(P.amberHot,a*.6));gr.addColorStop(1,css(P.amber,0));
    g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';}}
  g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  // Damage numbers: anchored where they struck, stacked by slot, pushed apart and kept above telegraphs.
  // Words are laid out first (measured, kept on screen) so the numbers stack above them instead of across them.
  const placed=this.placed||(this.placed=[]),wl=this.wl||(this.wl=[]);placed.length=0;wl.length=0;
  for(const o of this.words){
   if(!(o.life>0))continue;o.life-=dt;if(o.life<=0)continue;
   const age=o.max-o.life,u=clamp(age/o.max),pop=1+.8*(1-easeOut(clamp(age/I.words.pop))),s=I.words.px*ui*pop;
   let text;try{text=t(o.key);}catch{text=o.key;}
   g.font=font(Math.round(s),true);const hw=Math.min(W/2,(g.measureText(text).width||s*3)/2+s*.15);
   const x=clamp(X(o.x),hw,W-hw),y=clamp(Y(o.y)-12*ui*easeOut(u),top+s/2,H-s);let a=u>.7?1-(u-.7)/.3:1;
   for(const b of gs)if(x+hw>b[0]&&x-hw<b[2]&&y+s/2>b[1]&&y-s/2<b[3]){a=Math.min(a,I.guard.alpha);this.stats.gated++;this.stats.overlay=Math.max(this.stats.overlay,a);}
   placed.push([x,y,hw*2,s]);wl.push([o,text,x,y,s,a]);
  }
  for(const n of this.nums){
   if(!(n.life>0))continue;n.life-=dt;if(n.life<=0||!set.numbers)continue;
   const age=n.max-n.life,u=clamp(age/n.max),px=(n.kind==='crit'?N.crit:n.kind==='chip'?N.chip:N.px)*ui;
   let x=X(n.x)+n.dir*N.drift*ui*easeOut(u),y=Y(n.y)-n.slot*N.line*ui-N.rise*ui*easeOut(u);
   const w=px*.62*String(n.v).length+6*ui,h=px*.9;
   // Stacked upwards, a digit's width apart side by side (two 10s touching read as 1010); a stack that would climb under the HUD band turns and stacks downwards instead.
   y=Math.max(y,top+h/2);let up=true;
   for(let i=0;i<placed.length;i++){const q=placed[i];if(Math.abs(q[0]-x)<(q[2]+w)/2+px*.4&&Math.abs(q[1]-y)<(q[3]+h)/2){const ny=q[1]-(q[3]+h)/2-2*ui;if(up&&ny>=top+h/2)y=ny;else{up=false;y=Math.max(y,q[1]+(q[3]+h)/2+2*ui);}i=-1;}}
   let a=u>.65?1-(u-.65)/.35:1;
   // Lifted above a guard only when that keeps it near the hit (a boss guard is tall); otherwise it fades to the cap.
   for(const b of gs)if(x+w/2>b[0]&&x-w/2<b[2]&&y+h/2>b[1]&&y-h/2<b[3]){const ny=b[1]-h/2-4*ui;if(ny>top+h/2&&y-ny<k*1.2)y=ny;else{a=Math.min(a,I.guard.alpha);this.stats.gated++;this.stats.overlay=Math.max(this.stats.overlay,a);}}
   placed.push([x,y,w,h]);
   const pop=n.kind==='chip'?1:1+.6*(1-clamp(age/N.pop)),s=px*pop;
   g.font=font(Math.round(s));g.globalAlpha=a;
   if(n.kind==='crit'){const sp=glow(P.amber);if(sp){g.globalCompositeOperation='lighter';g.globalAlpha=a*.55;g.drawImage(sp,x-s*1.2,y-s*.9,s*2.4,s*1.8);g.globalCompositeOperation='source-over';g.globalAlpha=a;}}
   g.strokeStyle=I.colors.outline;g.lineWidth=Math.max(2,s*.16);g.strokeText(String(n.v),x,y);
   g.fillStyle=n.kind==='crit'?I.colors.crit:n.kind==='chip'?I.colors.chip:I.colors.hit;g.fillText(String(n.v),x,y);
   if(n.kind==='crit'){g.fillStyle=css(I.colors.critHot,.85*a);g.fillText(String(n.v),x,y-s*.06);}
  }
  for(const [o,text,x,y,s,a] of wl){
   g.save();g.translate(x,y);g.rotate(-.06);g.font=font(Math.round(s),true);g.globalAlpha=a;
   g.strokeStyle=I.colors.outline;g.lineWidth=s*.2;g.strokeText(text,0,0);
   g.fillStyle=o.col;g.fillText(text,0,0);g.fillStyle=css('#ffffff',.35);g.fillText(text,0,-s*.07);g.restore();
  }
  g.globalAlpha=1;g.textAlign='start';g.textBaseline='alphabetic';
  const ms=(this.cost+this.clock()-c0)*1000;this.stats.ms=this.stats.ms*.95+ms*.05;this.stats.maxMs=Math.max(this.stats.maxMs,ms);
 }
}
// The spoke bosses' hazard warnings are tells too (their bodies are guarded by tell()): the Anchorite's cages before they
// drop, Cordycea's lash lanes, snares, Bloom Walls, puffs, swelling sockets and spore-rain drips, the Antiphon's falling
// shards, the Exuvial's skin rain. A BREAK, a number or a burst must never sit over one at full strength.
function hazardTells(e,G){
 let n=0;const col=(x,h=1.2)=>{G.push([x-h,-1,x+h,99,1]);n++;};
 for(const c of e.cages||[])if(c.warn>0)col(c.x);else G.push([c.x-.9,c.y-.3,c.x+.9,c.y+1.5,0]);
 for(const f of e.shards||[])col(f.x,.9);
 for(const k of e.skins||[])col(k.x);
 if(e.cordycea){
  const M=CORDYCEA.moves;
  for(const l of e.lashes||[])if(l.warn>0){const L=M.lash.lanes[l.lane]||M.lash.lanes[0];G.push([-1e3,L[0]-.3,1e3,L[1]+.3,1]);n++;}
  for(const o of e.snares||[])if(o.warn>0){G.push([o.x-M.snare.w/2-.3,o.y-.3,o.x+M.snare.w/2+.3,o.y+M.snare.h+.3,1]);n++;}
  for(const w of e.walls||[])if(w.warn>0)col(w.x,.8);
  for(const p of e.puffs||[])if(p.warn>0){G.push([p.x-M.puff.w/2-.3,-1,p.x+M.puff.w/2+.3,1+M.puff.h+.3,1]);n++;}
  for(const r of e.rain||[])if(r.t>0&&r.t<=M.rain.warn)col(r.x,.7);
  (e.sockets||[]).forEach((so,k)=>{const d=CORDYCEA.sockets[k];if(so.st===1&&d){G.push([d.x0-.3,-1,d.x0+2.3,d.row+1.5,1]);n++;}});
 }
 return n;
}
const fonts=new Map();
function font(px,word=false){const key=px*2+(word?1:0);let f=fonts.get(key);if(!f){f=`${word?'italic ':''}700 ${px}px Fredoka, Nunito, sans-serif`;fonts.set(key,f);}return f;}
function free(pool){for(const o of pool)if(!(o.life>0))return o;return null;}
function oldest(pool){let o=pool[0];for(const p of pool)if(p.life<o.life)o=p;return o;}
function nearest(players,e){let best=null,d=Infinity;for(const p of players){if(p.dead)continue;const v=Math.abs(p.x-e.x)+Math.abs(p.y-e.y)*.5;if(v<d){d=v;best=p;}}return best;}
