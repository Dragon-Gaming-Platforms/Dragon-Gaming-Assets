// The Hub with Spokes, drawn from simulation state only (level.hub and state.world): the Mask Wall and its six niches,
// the Heart Door, benches, vein-lifts, arches and boss doors, the Echo locks, Amber Thread knots and the thread itself,
// each spoke's set dressing, and the short fade between rooms. World units, y up (drawn at -y).
import {glow,seeded} from './surface.js';
import {css,mix,P} from './color.js';
import {bone,crack} from './parts.js';
import {crystal} from './parallax.js';
import {NICHES,HUB} from '../data/hub.js';

const TAU=Math.PI*2;
const add=(g,color,x,y,r,a=1)=>{const sp=glow(color);if(!sp)return;g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';};
// Lock colours follow the Echo that opens them (amber thread, wax-pale wick, mirror silver, fungus, stone).
const LOCK={thread:P.amber,wick:'#f2e6c8',undertow:'#c8dcff',turnstone:'#e6c88a',bloom:P.cyan,shed:P.crimsonLight,masks:P.amberDeep,boss:P.cyanDeep};
const lockColor=gate=>LOCK[String(gate||'').split('+')[0].split(':')[1]]||LOCK[String(gate||'').split(':')[0]]||P.cyan;

function tusks(g,x,y,h=2.8,wd=1){
 for(const s of [-1,1])bone(g,g=>{g.beginPath();g.moveTo(x+s*.9*wd,-y);g.quadraticCurveTo(x+s*1.15*wd,-y-h*.72,x+s*.15,-y-h);g.quadraticCurveTo(x+s*.75*wd,-y-h*.64,x+s*.6*wd,-y);g.closePath();},[x-1.2*wd,-y-h,x+1.2*wd,-y]);
}
function veil(g,x,y,w,h,color,frame,a=.22){
 g.globalCompositeOperation='lighter';
 const v=g.createLinearGradient(0,-y-h,0,-y);v.addColorStop(0,css(color,0));v.addColorStop(1,css(color,a+.06*Math.sin(frame*.07)));
 g.fillStyle=v;g.fillRect(x-w/2,-y-h,w,h);g.globalCompositeOperation='source-over';
}
// A seal across a locked door: a lattice in the opening Echo's colour.
function seal(g,x,y,w,h,color,frame){
 g.strokeStyle=css(color,.55+.15*Math.sin(frame*.09));g.lineWidth=.06;g.beginPath();
 for(let i=0;i<=4;i++){const yy=-y-h*i/4;g.moveTo(x-w/2,yy);g.lineTo(x+w/2,yy-.3);}
 for(let i=0;i<=3;i++){const xx=x-w/2+w*i/3;g.moveTo(xx,-y);g.lineTo(xx+.15,-y-h);}
 g.stroke();add(g,color,x,y+h/2,Math.max(w,h)*.7,.35);
}

// Boss silhouettes for the Mask Wall's niches and the boss doors (centred, about 1.6 tiles tall).
const SIL={
 chrysalis(g){g.beginPath();g.ellipse(0,-.85,.42,.78,0,0,TAU);g.fill();g.fillRect(-.03,-1.9,.06,.4);},
 tallowgrave(g){g.beginPath();g.moveTo(-.3,0);g.lineTo(-.18,-1.25);g.arc(0,-1.35,.18,Math.PI,0);g.lineTo(.3,0);g.fill();g.fillRect(.32,-1.8,.05,1.8);g.beginPath();g.arc(.345,-1.85,.09,0,TAU);g.fill();},
 antiphon(g){g.beginPath();g.moveTo(-.25,0);g.lineTo(0,-1.4);g.lineTo(.25,0);g.fill();for(let i=0;i<3;i++)for(const s of [-1,1]){g.save();g.translate(0,-1+i*.25);g.rotate(s*(.5+i*.35));g.fillRect(0,-.03,s*.75,.06);g.restore();}},
 anchorite(g){g.beginPath();g.moveTo(-.45,-1.6);g.lineTo(.45,-1.6);g.lineTo(.05,-.8);g.lineTo(.45,0);g.lineTo(-.45,0);g.lineTo(-.05,-.8);g.closePath();g.fill();},
 cordycea(g){for(let i=0;i<5;i++){const x=(i-2)*.22,h=1+.4*(1-Math.abs(i-2)/2);g.fillRect(x-.03,-h,.06,h);g.beginPath();g.ellipse(x,-h,.16,.07,0,0,TAU);g.fill();}},
 exuvial(g){g.beginPath();g.moveTo(0,-1.9);g.quadraticCurveTo(.55,-1.1,.2,0);g.lineTo(-.2,0);g.quadraticCurveTo(-.55,-1.1,0,-1.9);g.fill();for(const s of [-1,1]){g.beginPath();g.moveTo(s*.3,-1.2);g.quadraticCurveTo(s*.8,-.9,s*.65,-.3);g.lineWidth=.06;g.stroke();}}
};
function silhouette(g,id,x,y,s,lit,frame){
 g.save();g.translate(x,-y);g.scale(s,s);
 g.fillStyle=lit?P.amber:'#120a14';g.strokeStyle=lit?P.amberHot:css(P.cyan,.35);
 (SIL[id]||SIL.chrysalis)(g);
 g.lineWidth=.05;g.stroke();
 g.restore();
 if(lit)add(g,P.amber,x,y+.9*s,1.3*s,.5+.15*Math.sin(frame*.06));
}

function maskWall(g,o,w,frame){
 // 9.6 tiles wide and set .8 east of the Hall arch (the Chrysalis niche sits over it): from the arch, facing either
 // way, all six niches stay in view and clear of the HUD panel.
 const x=o.x,y=o.y,W=9.6,Hh=6.2;
 g.fillStyle='#1a0e1c';g.fillRect(x-W/2,-y-Hh,W,Hh);
 bone(g,g=>{g.beginPath();g.moveTo(x-W/2-.4,-y);g.lineTo(x-W/2-.4,-y-Hh+1.2);g.quadraticCurveTo(x,-y-Hh-1.6,x+W/2+.4,-y-Hh+1.2);g.lineTo(x+W/2+.4,-y);g.lineTo(x+W/2-.3,-y);g.lineTo(x+W/2-.3,-y-Hh+1.4);g.quadraticCurveTo(x,-y-Hh-.7,x-W/2+.3,-y-Hh+1.4);g.lineTo(x-W/2+.3,-y);g.closePath();},[x-W/2,-y-Hh-1.6,x+W/2,-y]);
 const lit=w?.cleared||[];
 NICHES.forEach((id,i)=>{
  const nx=x-W/2+1.2+i*(W-2.4)/5,ny=y+2.1;
  g.fillStyle='#0a050c';g.beginPath();g.moveTo(nx-.56,-ny);g.lineTo(nx-.56,-ny-1.5);g.arc(nx,-ny-1.5,.56,Math.PI,0);g.lineTo(nx+.56,-ny);g.closePath();g.fill();
  g.strokeStyle=css(P.boneShade,.8);g.lineWidth=.06;g.stroke();
  silhouette(g,id,nx,ny+.15,.82,lit.includes(id),frame);
 });
 // Dead amber veins down the wall; they wake one by one as masks are taken.
 for(let i=0;i<6;i++){const vx=x-W/2+1.2+i*(W-2.4)/5;crack(g,[vx,-y-2,vx+.2,-y-1.2,vx-.1,-y-.3],lit.includes(NICHES[i])?P.amber:css(P.amberDeep,.35),.035);}
}
function heartDoor(g,o,state,frame){
 const x=o.x,y=o.y;
 g.fillStyle='#24101c';g.beginPath();g.moveTo(x-1.7,-y);g.quadraticCurveTo(x-1.9,-y-2.6,x,-y-3.4);g.quadraticCurveTo(x+1.9,-y-2.6,x+1.7,-y);g.closePath();g.fill();
 g.strokeStyle=css(P.amberDeep,.6);g.lineWidth=.08;g.stroke();
 const n=state.world?.cleared?.length||0;
 for(let i=0;i<6;i++){const a=Math.PI*(.15+.7*i/5),sx=x-Math.cos(a)*1.1,sy=y+.6+Math.sin(a)*1.9;g.fillStyle=i<n?P.amber:'#3a1e2a';g.beginPath();g.arc(sx,-sy,.13,0,TAU);g.fill();if(i<n)add(g,P.amber,sx,sy,.4,.6);}
 crack(g,[x,-y-.1,x,-y-3.2],css(P.amberDeep,.5+.2*Math.sin(frame*.03)),.04);
}
function bench(g,b,frame){
 const x=b.x,y=b.y;
 bone(g,g=>{g.beginPath();g.moveTo(x-1.1,-y-.55);g.quadraticCurveTo(x,-y-.75,x+1.1,-y-.55);g.lineTo(x+1,-y-.4);g.lineTo(x-1,-y-.4);g.closePath();},[x-1.1,-y-.75,x+1.1,-y-.4]);
 for(const s of [-1,1])bone(g,g=>{g.beginPath();g.moveTo(x+s*.85,-y);g.lineTo(x+s*.95,-y-.45);g.lineTo(x+s*.7,-y-.45);g.lineTo(x+s*.65,-y);g.closePath();},[x-1,-y-.45,x+1,-y],{dark:true});
 g.fillStyle=P.crimson;g.beginPath();g.moveTo(x-.5,-y-.6);g.lineTo(x+.4,-y-.62);g.lineTo(x+.3,-y-.2);g.lineTo(x+.05,-y-.32);g.lineTo(x-.2,-y-.12);g.closePath();g.fill();
 add(g,P.amber,x,y+1.2,.7,.5+.15*Math.sin(frame*.05));
}
function lift(g,d,state,open,frame){
 const x=d.x,y=d.y,top=y+7;
 const v=g.createLinearGradient(x-.6,0,x+.6,0);v.addColorStop(0,'#2a1020');v.addColorStop(.5,open?'#6a2a3a':'#3a1a26');v.addColorStop(1,'#2a1020');
 g.fillStyle=v;g.fillRect(x-.6,-top,1.2,top-y);
 for(let yy=y+.6;yy<top;yy+=.9)crack(g,[x-.5,-yy,x,-yy-.25,x+.5,-yy],open?css(P.amber,.7):css(P.amberDeep,.3),.03);
 g.fillStyle=P.boneShade;g.fillRect(x-.9,-y-.12,1.8,.12);
 if(open){const t=(frame*.04)%1;add(g,P.amber,x,y+t*6,.6,.7);}
}
function arch(g,d,stateName,frame){
 tusks(g,d.x,d.y,d.kind==='boss'?3.6:2.8,d.kind==='boss'?1.3:1);
 if(stateName==='open'||stateName==='cleared')veil(g,d.x,d.y,1.2,2.6,d.kind==='boss'?P.cyan:P.amber,frame);
 else seal(g,d.x,d.y,1.6,2.6,stateName==='coming'?P.cyanDeep:lockColor(d.gate),frame);
}
function edgeDoor(g,d,L,stateName,frame){
 const x=d.side<0?.2:L.width-.2;
 if(stateName==='open'){veil(g,x,d.y,1,3,P.amber,frame,.14);return;}
 seal(g,x,d.y,.6,3,lockColor(d.gate),frame);
}
function knot(g,k,owned,frame){
 g.strokeStyle=css(P.boneShade,.6);g.lineWidth=.04;g.beginPath();g.moveTo(k.x,-k.y);g.lineTo(k.x,-k.y-3);g.stroke();
 g.fillStyle=owned?P.amber:'#4a2a18';g.beginPath();g.arc(k.x,-k.y,.2,0,TAU);g.fill();
 g.strokeStyle=owned?P.amberHot:css(P.amberDeep,.5);g.lineWidth=.05;g.beginPath();g.arc(k.x,-k.y,.3,0,TAU);g.stroke();
 if(owned)add(g,P.amber,k.x,k.y,.8,.45+.2*Math.sin(frame*.08+k.x));
}

// The knot the sim's attach() would pick for an airborne hunter (same reach and 'above the hand' rule), or -1.
function inReach(p,H){
 if(!p||p.dead||p.grounded||p.swing||p.form||p.threadCd>0)return -1;
 let best=-1,bd=HUB.thread.reach/1000;
 H.knots.forEach((k,i)=>{const dx=p.x-k.x,dy=k.y-p.y-p.h*HUB.thread.hand;if(dy<=0)return;const d=Math.hypot(dx,dy);if(d<bd){bd=d;best=i;}});
 return best;
}

// Camera focus (framing.js) while the hunter is on or near the Amber Thread: the knot he swings from, or the one
// a guard press would catch, or the next one ahead, stays in view (the knots hang above the default framing).
export function hubFocus(state,box){
 const H=state.level?.hub,p=state.players?.[0];
 if(!H?.knots.length||!state.world?.echoes?.includes('thread')||!p||p.dead||p.grounded&&!p.swing)return null;
 let i=p.swing?p.swing.k:inReach(p,H);
 if(i<0){let bd=8;H.knots.forEach((k,j)=>{const d=(k.x-p.x)*p.facing;if(d>0&&d<bd&&k.y>p.y){bd=d;i=j;}});}
 const k=H.knots[i];if(!k)return null;
 box.left=Math.min(p.x,k.x)-1;box.right=Math.max(p.x,k.x)+1;box.bottom=Math.min(p.y,k.y);box.top=k.y+.8;
 return box;
}

// Spoke set dressing behind the play field.
const DECOR={
 rib(g,o){const s=o.size,x=o.x,y=o.y;g.globalAlpha=.45;bone(g,g=>{g.beginPath();g.moveTo(x-.25*s,-y);g.quadraticCurveTo(x-.6*s,-y-4*s,x+1.6*s,-y-6.5*s);g.lineTo(x+1.75*s,-y-6.2*s);g.quadraticCurveTo(x,-y-3.8*s,x+.25*s,-y);g.closePath();},[x-.6*s,-y-6.5*s,x+1.8*s,-y],{dark:true});g.globalAlpha=1;},
 tooth(g,o){const s=o.size,x=o.x,y=o.y;bone(g,g=>{g.beginPath();g.moveTo(x-.45*s,-y);g.quadraticCurveTo(x-.5*s,-y-1.2*s,x,-y-1.7*s);g.quadraticCurveTo(x+.5*s,-y-1.2*s,x+.45*s,-y);g.closePath();},[x-.5*s,-y-1.7*s,x+.5*s,-y]);},
 candle(g,o,frame){const s=o.size,x=o.x,y=o.y,h=2.4*s;g.fillStyle=mix('#f2e6c8','#000000',.25);g.beginPath();g.moveTo(x-.32*s,-y);g.lineTo(x-.28*s,-y-h);g.quadraticCurveTo(x,-y-h-.15,x+.28*s,-y-h);g.lineTo(x+.32*s,-y);g.closePath();g.fill();
  g.fillStyle='#fff6e4';for(let i=0;i<3;i++){g.beginPath();g.ellipse(x+(i-1)*.18*s,-y-h+.3+i*.25,.05,.25*s,0,0,TAU);g.fill();}
  const f=1+.1*Math.sin(frame*.25+x);g.fillStyle=P.cyanHot;g.beginPath();g.moveTo(x,-y-h-.05);g.quadraticCurveTo(x+.12*f,-y-h-.3,x,-y-h-.55*f);g.quadraticCurveTo(x-.12*f,-y-h-.3,x,-y-h-.05);g.fill();add(g,P.cyan,x,y+h+.3,.7,.55);},
 scale(g,o,frame){const s=o.size,x=o.x,y=o.y;g.globalAlpha=.75;g.fillStyle='#9aaac4';g.beginPath();g.moveTo(x,-y-2.2*s);g.lineTo(x+.6*s,-y);g.lineTo(x-.6*s,-y);g.closePath();g.fill();g.globalAlpha=1;g.strokeStyle=css('#e6f0ff',.6);g.lineWidth=.03;g.stroke();
  const sh=(frame*.01+x*.1)%1;g.strokeStyle=css('#ffffff',.25);g.beginPath();g.moveTo(x-.3*s+sh*.6*s,-y-.2);g.lineTo(x-.1*s+sh*.4*s,-y-1.8*s);g.stroke();},
 reliquary(g,o){const s=o.size,x=o.x,y=o.y;g.fillStyle='#4a3014';g.fillRect(x-.6*s,-y-1.6*s,1.2*s,1.6*s);g.strokeStyle='#c89a4a';g.lineWidth=.05;g.strokeRect(x-.6*s,-y-1.6*s,1.2*s,1.6*s);
  for(let i=1;i<4;i++){g.beginPath();g.moveTo(x-.6*s+i*.3*s,-y-1.6*s);g.lineTo(x-.6*s+i*.3*s,-y);g.stroke();}g.beginPath();g.moveTo(x,-y-1.6*s);g.lineTo(x,-y-4*s);g.strokeStyle=css('#8a6a3a',.7);g.stroke();},
 cap(g,o,frame){crystal(g,o.x,-o.y,.9*o.size,seeded('cap'+o.x),true);add(g,P.cyan,o.x,o.y+.8*o.size,.9*o.size,.3+.1*Math.sin(frame*.04+o.x));},
 cocoon(g,o){const s=o.size,x=o.x,y=o.y;g.strokeStyle=css('#d8c8b8',.5);g.lineWidth=.04;g.beginPath();g.moveTo(x,-y);g.lineTo(x,-y-3);g.stroke();
  g.fillStyle='#c8b8a4';g.beginPath();g.ellipse(x,-y+1*s,.45*s,1*s,0,0,TAU);g.fill();g.strokeStyle=css(P.crimsonDeep,.8);g.lineWidth=.06;g.beginPath();g.moveTo(x-.4*s,-y+.6*s);g.lineTo(x+.4*s,-y+1.1*s);g.stroke();},
 cord(g,o){g.strokeStyle='#cbb894';g.lineWidth=.35*o.size;g.beginPath();g.moveTo(o.x,-o.y);g.quadraticCurveTo(o.x+.6,-o.y+3,o.x+.1,-o.y+6);g.stroke();},
 pool(g,o,frame){const x=o.x,y=o.y;g.fillStyle=css('#c8dcff',.35);g.fillRect(x-1.6,-y-.08,3.2,.08);g.strokeStyle=css('#ffffff',.3+.2*Math.sin(frame*.05));g.lineWidth=.03;g.beginPath();g.moveTo(x-1.2,-y-.04);g.lineTo(x+1.2,-y-.04);g.stroke();},
 veil(g,o,frame){veil(g,o.x,o.y,1.8,3.4,P.cyan,frame,.18);},
 hatch(g,o,frame){g.fillStyle='#160a10';g.beginPath();g.ellipse(o.x,-o.y+.02,1.1,.25,0,0,TAU);g.fill();g.strokeStyle=css(P.boneShade,.7);g.lineWidth=.05;g.stroke();},
 arch(){},lift(){},maskwall(){},heart(){}
};

// Campaign runs only: an editor level or an imported replay may carry any extra keys, `hub` included.
export function drawHubBack(g,state,level,frame){
 const H=level?.hub;if(!H||!state.world)return;
 const w=state.world;
 for(const o of H.decor){if(o.kind==='maskwall')maskWall(g,o,w,frame);else if(o.kind==='heart')heartDoor(g,o,state,frame);else DECOR[o.kind]?.(g,o,frame);}
 const owned=!!w?.echoes?.includes('thread'),grab=owned?inReach(state.players[0],H):-1;
 H.knots.forEach((k,i)=>{
  knot(g,k,owned,frame);
  // The knot a guard press would catch right now: a bright ring, so a grab is never a guess.
  if(i===grab){g.strokeStyle=css(P.amberHot,.85);g.lineWidth=.06;g.beginPath();g.arc(k.x,-k.y,.5+.06*Math.sin(frame*.3),0,TAU);g.stroke();add(g,P.amber,k.x,k.y,1.1,.5);}
 });
 if(H.bench)bench(g,H.bench,frame);
 H.doors.forEach((d,i)=>{
  const st=w?.doors?.[i]||'open';
  if(d.kind==='edge')edgeDoor(g,d,level,st,frame);
  else if(d.kind==='lift')lift(g,d,state,st==='open',frame);
  else if(d.kind==='sealed'){}
  else{arch(g,d,st,frame);if(d.kind==='boss')silhouette(g,d.boss,d.x,d.y+4.2,.8,st==='cleared',frame);}
 });
}
// In front of the hunters: the Amber Thread from its knot to the hand.
export function drawHubFront(g,state,alpha,frame){
 const H=state.level?.hub;if(!H||!state.world)return;
 for(const p of state.players){
  if(!(p.thread>=0))continue;
  const k=H.knots[p.thread];if(!k)continue;
  const x=p.px+(p.x-p.px)*alpha,y=p.py+(p.y-p.py)*alpha+p.h*.8;
  g.lineCap='round';
  for(const [lw,c] of [[.12,css(P.amberDeep,.6)],[.06,P.amber],[.025,P.amberHot]]){g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(k.x,-k.y);g.lineTo(x,-y);g.stroke();}
  add(g,P.amber,x,y,.5,.6);
 }
}
// The cut between rooms: a short fade from black (render only; the simulation already moved).
export function hubFade(g,state,W,H){
 const f=state.world?.fade||0;if(f<=0)return;
 g.fillStyle=`rgba(4,2,6,${Math.min(1,f/10)})`;g.fillRect(0,0,W,H);
}
