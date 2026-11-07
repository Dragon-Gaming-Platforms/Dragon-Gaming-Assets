import {CHRYSALIS5 as C} from '../data/chrysalis5.js';
import {css,P,mix} from './color.js';
import {glow,seeded} from './surface.js';
import {Trail} from './trail.js';

// The Unborn Chrysalis, finished (config.boss 'chrysalis5'): a cathedral-scale Gullet drawn procedurally in world units
// (y up, canvas y = -y). Three layers: the nave behind the tiles (cartilage arches, hanging gum), the boss with its
// hazards, and the light in front (shafts from the vault, motes, vignette, impact frames). Render only: nothing here
// writes to the simulation or draws from its RNG; render-side memory lives in a WeakMap keyed by the boss.
const TAU=Math.PI*2,[AX]=C.anchor,L=C.arenaLeft,R=C.right,TOP=C.rows,M=C.moves;
const lerp=(a,b,t)=>a+(b-a)*t,clamp01=v=>v<0?0:v>1?1:v,smooth=t=>t*t*(3-2*t);
const globTrail=new Trail();
const memo=new WeakMap();
const mem=e=>{let m=memo.get(e);if(!m)memo.set(e,m={imp:null,n:0,roll:0});return m;};

// Scenery is seeded once (never from the simulation RNG).
const rnd=seeded('gullet5-nave');
const RIBS=[...Array(9)].map((_,i)=>({x:L+.6+i*(R-L-1.2)/8+(rnd()-.5)*.7,depth:.25+rnd()*.6,w:.28+rnd()*.3,lean:(rnd()-.5)*.9,knobs:3+Math.floor(rnd()*3)}));
const HANG=[...Array(11)].map(()=>({x:L+.8+rnd()*(R-L-1.6),len:1.4+rnd()*4.2,ph:rnd()*TAU,w:.018+rnd()*.03}));
const MOTES=[...Array(46)].map(()=>({x:rnd(),y:rnd(),s:.03+rnd()*.06,v:.25+rnd()*.9,ph:rnd()*TAU}));
const SHAFTS=[{x:42.6,w:.7,b:2.6,a:.12},{x:46.9,w:.45,b:1.7,a:.08},{x:51.6,w:1,b:3,a:.14},{x:56.4,w:.5,b:1.8,a:.08}];
const CRACKS=[...Array(8)].map(()=>{const pts=[];let x=(rnd()-.5)*.9,y=.15+rnd()*.6;for(let i=0;i<4;i++){pts.push([x,y]);x+=(rnd()-.5)*.35;y+=.06+rnd()*.12;}return pts;});
const SHARDS=[...Array(9)].map(()=>({dx:(rnd()-.5)*4.4,r:.25+rnd()*.45,a:rnd()*TAU,s:rnd()<.5?-1:1}));
const DUST=[...Array(34)].map(()=>({dx:(rnd()-.5)*3.4,v:.5+rnd(),ph:rnd()*TAU,s:.035+rnd()*.06}));

export function boss5(state){for(const e of state.enemies||[])if(e.chrysalis5)return e;return null;}
// Desperation: the Gullet dims while the unborn tries to unfold.
export function dim5(state){
 for(const e of state.enemies||[])if(e.chrysalis5&&!e.dead&&e.glass&&e.ai!=='spent')return .42+.1*Math.sin((state.frame||0)*.1);
 return 0;
}
// A slight camera roll that follows the pendulum (at most about 1.3 degrees), eased on the render side.
export function sway5(state){
 const e=boss5(state);if(!e)return 0;
 const m=mem(e),swing=e.ai==='swing'&&!e.dead&&!e.frozen;
 const target=swing?Math.max(-1,Math.min(1,(e.ang||0)/52000))*(e.cut?.012:.022):0;
 // Eased once per simulation frame, so the roll feels the same at 60 or 144 Hz (and holds through hit-stop).
 if(m.f!==state.frame){m.f=state.frame;m.roll+=(target-m.roll)*.06;}
 return Math.abs(m.roll)<1e-5?0:m.roll;
}

// ---- the nave (behind the tiles) ----
export function drawChrysalis5Back(g,state,e,frame){
 g.lineCap='round';
 for(const r of RIBS){
  // Gothic cartilage arches rising from the floor into the vault over the anchor; nearer ones are paler.
  const a=.16+.3*(1-r.depth),col=mix(P.boneDark,P.ink,r.depth*.55),tx=AX+(r.x-AX)*.1;
  g.strokeStyle=css(col,a);g.lineWidth=r.w*(1.25-r.depth*.6);
  g.beginPath();g.moveTo(r.x,-.6);g.bezierCurveTo(r.x+r.lean,-6.5,lerp(r.x,AX,.55),-TOP+1.2,tx,-TOP-.6);g.stroke();
  g.strokeStyle=css(P.bone,a*.35);g.lineWidth=r.w*.22;
  g.beginPath();g.moveTo(r.x-.06,-.8);g.bezierCurveTo(r.x+r.lean-.06,-6.5,lerp(r.x,AX,.55)-.06,-TOP+1.3,tx,-TOP-.5);g.stroke();
  // Vertebral knobs along the rib.
  g.fillStyle=css(col,a*1.1);
  for(let i=1;i<=r.knobs;i++){const t=i/(r.knobs+1),u=1-t,px=u*u*u*r.x+3*u*u*t*(r.x+r.lean)+3*u*t*t*lerp(r.x,AX,.55)+t*t*t*tx,py=u*u*u*-.6+3*u*u*t*-6.5+3*u*t*t*(-TOP+1.2)+t*t*t*(-TOP-.6);g.beginPath();g.ellipse(px,py,r.w*.7,r.w*.45,t,0,TAU);g.fill();}
 }
 // Gum hanging from the vault: cyan threads that sway and bead at the tip.
 for(const s of HANG){
  const sw=Math.sin(frame*.012+s.ph)*.25,ex=s.x+sw*1.6,ey=-(TOP-s.len);
  g.strokeStyle=css(P.cyanDeep,.32);g.lineWidth=s.w;g.beginPath();g.moveTo(s.x,-TOP-.5);g.quadraticCurveTo(s.x+sw,-(TOP-s.len*.6),ex,ey);g.stroke();
  g.fillStyle=css(P.cyan,.42);g.beginPath();g.arc(ex,ey+.05,s.w*2.4+.02*Math.sin(frame*.05+s.ph),0,TAU);g.fill();
 }
 // A low haze over the floor.
 const hz=g.createLinearGradient(0,-1,0,-3.4);hz.addColorStop(0,css(P.fur,.28));hz.addColorStop(1,css(P.fur,0));
 g.fillStyle=hz;g.fillRect(L,-3.4,R-L,2.4);
}

// ---- painted pieces ----
const prof=t=>Math.pow(Math.sin(Math.PI*Math.min(1,.06+t*.98)),.75)*(.4+.6*Math.min(1,t*2.2));
function halfPath(g,side,w,h,o){
 g.beginPath();g.moveTo(side*o,0);
 g.bezierCurveTo(side*(w*.62+o),h*.12,side*(w*.6+o),h*.82,side*(w*.12+o),h);
 g.lineTo(side*o,h*.97);g.closePath();
}
// One painted cocoon half: a lit ivory volume (light from the vault, upper left), fibres that turn with the shell,
// growth rings, damage cracks, occlusion under the rim and a hard ink outline.
function paintHalf(g,side,w,h,o,flash,rot,dmg,peel,frame){
 halfPath(g,side,w,h,o);
 if(flash){g.fillStyle=P.ivory;g.fill();}
 else{
  const gr=g.createRadialGradient(-w*.24+side*o,h*.3,.15,-w*.08+side*o,h*.48,h*.78);
  gr.addColorStop(0,P.boneRim);gr.addColorStop(.32,P.bone);gr.addColorStop(.72,P.boneShade);gr.addColorStop(1,P.boneDark);
  g.fillStyle=gr;g.fill();
 }
 g.save();g.clip();
 g.translate(side*o,0);
 // Fibres around the body: only the front ones show, so a twist reads as the shell turning.
 for(let j=0;j<18;j++){
  const ph=j/18*TAU+rot*TAU/3,c=Math.cos(ph);if(c<.08)continue;
  const sn=Math.sin(ph);
  g.strokeStyle=css(j%3?P.boneShade:P.boneDark,.14+.26*c);g.lineWidth=.02+.025*c;g.beginPath();
  for(let k=0;k<=10;k++){const t=k/10,px=sn*prof(t)*w*.5,py=t*h;if(k)g.lineTo(px,py);else g.moveTo(px,py);}
  g.stroke();
 }
 // Growth rings.
 g.strokeStyle=css(P.boneDark,.3);g.lineWidth=.028;
 for(let i=1;i<5;i++){const y=h*i/5;g.beginPath();g.moveTo(-w*.6,y-.05);g.quadraticCurveTo(0,y+.16,w*.6,y-.05);g.stroke();}
 // Cracks that grow with the damage taken.
 g.strokeStyle=css(P.ink,.55);g.lineWidth=.035;
 for(let i=0;i<Math.min(CRACKS.length,dmg);i++){const c=CRACKS[i];g.beginPath();for(let k=0;k<c.length;k++){const px=c[k][0]*w,py=c[k][1]*h;if(k)g.lineTo(px,py);else g.moveTo(px,py);}g.stroke();}
 // Peeling (Shed Husks tell): flakes lift off the surface with a dark gap under them.
 if(peel>0){
  for(let i=0;i<5;i++){
   const fy=h*(.25+i*.13),fx=(i%2?-1:1)*w*.18,lift=peel*.18*(1+i%2);
   g.fillStyle=css(P.ink,.35*peel);g.beginPath();g.ellipse(fx,fy,.32,.12,0,0,TAU);g.fill();
   g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;
   g.beginPath();g.ellipse(fx+(i%2?-1:1)*lift,fy-lift,.3,.11,(i%2?-1:1)*peel*.5,0,TAU);g.fill();g.stroke();
  }
 }
 // Occlusion under the rim and a cool bounce from the gum on the far side.
 const ao=g.createLinearGradient(0,h*.55,0,h);ao.addColorStop(0,css(P.ink,0));ao.addColorStop(1,css(P.ink,.38));
 g.fillStyle=ao;g.fillRect(-w,h*.5,w*2,h*.55);
 g.restore();
 halfPath(g,side,w,h,o);g.strokeStyle=css(P.outline,1);g.lineWidth=.075;g.stroke();
 if(!flash&&side<0){g.strokeStyle=css(P.boneRim,.55);g.lineWidth=.04;g.beginPath();g.moveTo(-o-.1,h*.05);g.bezierCurveTo(-(w*.55+o),h*.16,-(w*.55+o),h*.55,-(w*.42+o),h*.72);g.stroke();}
 if(!flash&&side>0){g.strokeStyle=css(P.cyanDeep,.35);g.lineWidth=.05;g.beginPath();g.moveTo(w*.5+o,h*.35);g.bezierCurveTo(w*.58+o,h*.55,w*.5+o,h*.8,w*.2+o,h*.97);g.stroke();}
}
// The three rim lips, each with its own silhouette: the heavy Brow, the curled Hook, the trailing Tail.
function lipShape(g,id,r){
 g.beginPath();
 if(id==='brow'){g.moveTo(-r,0);g.bezierCurveTo(-r*.85,r*.95,r*.85,r*.95,r,0);g.bezierCurveTo(r*.5,r*.32,-r*.5,r*.32,-r,0);}
 else if(id==='hook'){g.moveTo(-r*.75,-r*.08);g.bezierCurveTo(-r*.6,r*.85,r*.65,r*1.15,r*.95,r*.3);g.bezierCurveTo(r*1.1,0,r*.82,-r*.22,r*.58,0);g.bezierCurveTo(r*.5,r*.45,-r*.2,r*.5,-r*.3,-r*.06);g.closePath();}
 else{g.moveTo(-r*.85,0);g.quadraticCurveTo(-r*.2,r*.5,r*1.45,r*1);g.quadraticCurveTo(r*.3,r*.16,r*.62,-r*.06);g.closePath();}
}
function drawLip(g,id,x,y,r,sx,depth,cue,hot,frame,revealed){
 g.save();g.translate(x,y);g.scale(sx,1);
 const back=depth<0;
 const gr=g.createLinearGradient(0,-r*.2,0,r);gr.addColorStop(0,back?P.boneDark:P.boneRim);gr.addColorStop(1,back?P.ink:P.boneShade);
 g.fillStyle=gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
 lipShape(g,id,r);g.fill();g.stroke();
 if(!back){g.strokeStyle=css(P.boneRim,.5*depth);g.lineWidth=.03;g.beginPath();g.moveTo(-r*.6,r*.1);g.quadraticCurveTo(0,r*.42,r*.6,r*.1);g.stroke();}
 if(revealed&&!back&&!cue){g.strokeStyle=css(P.ivory,.35);g.lineWidth=.025;lipShape(g,id,r*1.25);g.stroke();}
 if(cue>0){
  // The parry cue: ivory on the leading lip as its window nears; a hard white flash with a beat inside it.
  g.globalCompositeOperation='lighter';
  const sp=glow(P.ivory);if(sp){g.globalAlpha=(hot?.95:.45)*cue;const s=r*(hot?3.6:2.6);g.drawImage(sp,-s/2,r*.3-s/2,s,s);g.globalAlpha=1;}
  g.strokeStyle=css(P.ivory,hot?1:.55*cue);g.lineWidth=hot?.07:.045;lipShape(g,id,r*1.2);g.stroke();
  if(hot&&Math.floor(frame/3)%2){g.strokeStyle=css('#ffffff',.9);g.lineWidth=.03;g.beginPath();g.ellipse(0,r*.35,r*1.9,r*.9,0,0,TAU);g.stroke();}
  g.globalCompositeOperation='source-over';
 }
 g.restore();
}
function seam(g,h,k,frame,revealed){
 // The memory of the unborn god: amber always faintly inside; the split is the weak point.
 g.globalCompositeOperation='lighter';
 const sp=glow(P.amber);
 if(sp){const r=.7+k*1.4+.06*Math.sin(frame*.2);g.globalAlpha=(revealed?.35:.18)+.7*k;g.drawImage(sp,-r,h*.5-r,r*2,r*2);g.globalAlpha=1;}
 g.strokeStyle=css(P.amberHot,(revealed?.5:.22)+.7*k);g.lineWidth=.05+.08*k;g.beginPath();
 g.moveTo(0,h*.12);g.lineTo(.06,h*.3);g.lineTo(-.05,h*.48);g.lineTo(.07,h*.66);g.lineTo(-.02,h*.86);g.stroke();
 g.globalCompositeOperation='source-over';
}
// The curled amber form glimpsed through an open seam.
function inner(g,h,k,frame){
 if(k<=0)return;
 g.save();g.globalAlpha=k;
 const gr=g.createRadialGradient(0,h*.5,.1,0,h*.5,1.4);gr.addColorStop(0,P.amberHot);gr.addColorStop(.5,P.amber);gr.addColorStop(1,P.amberDeep);
 g.fillStyle=gr;g.beginPath();g.ellipse(0,h*.52,.55+.04*Math.sin(frame*.15),1.5,0,0,TAU);g.fill();
 g.strokeStyle=css(P.amberDeep,.8);g.lineWidth=.05;for(let i=0;i<5;i++){const y=h*(.3+i*.1);g.beginPath();g.moveTo(-.45,y);g.quadraticCurveTo(0,y+.12,.45,y);g.stroke();}
 g.restore();
}
function qpt(x0,y0,mx,my,x1,y1,t){const u=1-t;return [u*u*x0+2*u*t*mx+t*t*x1,u*u*y0+2*u*t*my+t*t*y1];}
// The pupal cord: a dark braided rope with a highlight strand; frayed in P2.
function cord(g,x0,y0,x1,y1,frame,frayed,width=.34){
 const mx=(x0+x1)/2+Math.sin(frame*.03)*.08,my=(y0+y1)/2;
 g.lineCap='round';
 const path=(o)=>{g.beginPath();g.moveTo(x0+o,-y0);g.quadraticCurveTo(mx+o,-my,x1+o,-y1);};
 g.strokeStyle=css(P.ink,.6);g.lineWidth=width*1.4;path(0);g.stroke();
 g.strokeStyle=css(P.furDeep,1);g.lineWidth=width;path(0);g.stroke();
 g.strokeStyle=css(P.furLight,.45);g.lineWidth=width*.18;path(-width*.22);g.stroke();
 // Braid: short diagonal wraps along the rope.
 g.strokeStyle=css(P.boneDark,.7);g.lineWidth=width*.14;
 for(let i=1;i<16;i++){const [px,py]=qpt(x0,y0,mx,my,x1,y1,i/16);g.beginPath();g.moveTo(px-width*.45,-py-width*.2);g.lineTo(px+width*.45,-py+width*.2);g.stroke();}
 if(frayed){
  const [fx,fy]=qpt(x0,y0,mx,my,x1,y1,.35);g.strokeStyle=css(P.boneShade,.85);g.lineWidth=.035;
  for(let i=0;i<9;i++){const a=i/9*TAU+frame*.01;g.beginPath();g.moveTo(fx,-fy);g.quadraticCurveTo(fx+Math.cos(a)*.3,-fy+Math.sin(a)*.2,fx+Math.cos(a)*.6,-fy+Math.sin(a)*.4+.25);g.stroke();}
 }
}
// A shed husk: an empty cocoon, open at one end, ivory-rimmed while it rolls (parry it apart, or jump it).
function husk(g,h,frame){
 const wob=h.settle>0?Math.sin(h.settle*1.4)*.25:0;
 g.save();g.translate(h.x,-h.y);g.rotate(-h.spin+wob);
 const r=h.r,gr=g.createRadialGradient(-r*.3,-r*.3,.05,0,0,r*1.3);gr.addColorStop(0,P.boneRim);gr.addColorStop(.6,P.bone);gr.addColorStop(1,P.boneDark);
 g.fillStyle=gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
 g.beginPath();g.ellipse(0,0,r*1.05,r*.9,0,0,TAU);g.fill();g.stroke();
 g.fillStyle=css(P.ink,.85);g.beginPath();g.ellipse(r*.72,0,r*.22,r*.55,0,0,TAU);g.fill();
 g.strokeStyle=css(P.boneDark,.6);g.lineWidth=.03;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(-r*.8,i*r*.4);g.quadraticCurveTo(0,i*r*.55,r*.6,i*r*.4);g.stroke();}
 g.restore();
 if(h.landed&&h.settle<=0){
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.ivory,.55+.25*Math.sin(frame*.4));g.lineWidth=.05;
  g.beginPath();g.arc(h.x,-h.y,h.r*1.18,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
 }
}

function hazards(g,state,e,frame,alpha){
 // Gum strands on the floor: a wavy cyan film with beads that drip.
 for(const st of e.strands){
  const a=Math.min(1,st.t/30);
  g.strokeStyle=css(P.cyanDeep,.6*a);g.lineWidth=.12;g.beginPath();
  for(let i=0;i<=8;i++){const sx=lerp(st.x0,st.x1,i/8),sy=-1.06-.04*Math.sin(i*1.7+frame*.08);if(i)g.lineTo(sx,sy);else g.moveTo(sx,sy);}
  g.stroke();
  g.fillStyle=css(P.cyan,.65*a);
  for(let i=0;i<4;i++){const sx=lerp(st.x0,st.x1,(i+.5)/4),hgt=.22+.1*Math.sin(frame*.06+i);g.fillRect(sx-.025,-1.05-hgt,.05,hgt);g.beginPath();g.arc(sx,-1.05-hgt,.06,0,TAU);g.fill();}
 }
 for(const w of e.wires){
  const set=w.warn<=0;g.strokeStyle=css(P.cyan,set?.9:.22+.2*Math.sin(frame*.5));g.lineWidth=set?.06:.03;
  g.setLineDash?.(set?[]:[.2,.15]);g.beginPath();g.moveTo(w.x0,-w.y);g.quadraticCurveTo((w.x0+w.x1)/2,-w.y+.06,w.x1,-w.y);g.stroke();g.setLineDash?.([]);
  if(set){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyanHot,.3);g.lineWidth=.2;g.beginPath();g.moveTo(w.x0,-w.y);g.lineTo(w.x1,-w.y);g.stroke();g.globalCompositeOperation='source-over';}
 }
 const frozen=state.hitStop>0||state.phase!=='playing';
 for(const b of e.globs){
  const [x,y]=globTrail.at(b,alpha,frame,frozen);
  g.strokeStyle=css(P.cyanDeep,.5);g.lineWidth=.14;g.beginPath();g.moveTo(x,-y);g.lineTo(x-b.vx*5,-(y-b.vy*5));g.stroke();
  g.fillStyle=css(P.cyan,.95);g.beginPath();g.ellipse(x,-y,.2,.17,Math.atan2(-b.vy,b.vx),0,TAU);g.fill();
  g.fillStyle=css(P.cyanHot,.8);g.beginPath();g.arc(x-.05,-y-.05,.06,0,TAU);g.fill();
 }
 // Dust trickles where cartilage will fall after a Wall Strike.
 for(const f of e.falls)if(f.t<=M.wall.warn){
  const k=1-f.t/M.wall.warn;
  g.fillStyle=css(P.ash,.1+.22*k);g.fillRect(f.x-.06-k*.05,-C.debris.y,.12+k*.1,C.debris.y-1);
  g.fillStyle=css(P.bone,.6);for(let i=0;i<3;i++){const fy=C.debris.y-((frame*.12+i*1.7)%(C.debris.y-1));g.fillRect(f.x-.03+i*.03,-fy,.05,.05);}
 }
 for(const h of e.husks)husk(g,h,frame);
}

// ---- the boss ----
export function drawChrysalis5World(g,state,e,frame,alpha){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;
 hazards(g,state,e,frame,alpha);
 // A soft floor shadow that shrinks as the shell rises.
 const lift=clamp01((y-1)/14);
 g.fillStyle=css(P.ink,.38*(1-lift)+.1);g.beginPath();g.ellipse(x,-1.02,e.w*(.55-.25*lift),.15,0,0,TAU);g.fill();
 const r=e.reel;
 if(e.ai==='reel'&&r&&(r.stage==='lift'||r.stage==='sway'||r.stage==='fall')){
  const k=r.stage==='fall'?1-r.t/r.frames:r.stage==='sway'?.4:.2;
  g.fillStyle=css(P.ink,.35+.4*k);g.beginPath();g.ellipse(x,-1.02,e.w*(.4+.35*k),.16,0,0,TAU);g.fill();
  if(r.stage==='fall'&&r.t<C.dodgeLate){g.strokeStyle=css(P.ivory,.6);g.lineWidth=.05;g.beginPath();g.ellipse(x,-1.02,e.w*.85,.3,0,0,TAU);g.stroke();}
 }
 if(e.dead){defeated(g,state,e,frame,x);return;}
 if(e.cut){creature(g,state,e,frame,x,y);return;}
 shell(g,state,e,frame,x,y);
}
function shell(g,state,e,frame,x,y){
 const r=e.reel,top=TOP+1,h=e.h,w=Math.min(e.w,C.shell.w);
 const ang=(e.ai==='swing'||e.ai==='open'||e.ai==='enter'||e.ai==='transition'&&!r?e.ang:0)/1000*Math.PI/180;
 cord(g,AX+(e.ai==='reel'?(x-AX)*.5:0),top,x,y+h,frame,e.frayed);
 g.save();g.translate(x,-(y+h));g.rotate(-ang);
 if(e.spin){const sc=Math.cos(frame*.25);g.scale(.55+.45*Math.abs(sc),1);}
 if(e.ai==='reel'&&r?.stage==='creak')g.rotate(Math.sin(frame*1.3)*.035);
 // Gum hangs from the shell.
 g.strokeStyle=css(P.cyan,.32);g.lineWidth=.03;
 for(let i=0;i<4;i++){const gx=(i-1.5)*.6;g.beginPath();g.moveTo(gx,h*.9);g.quadraticCurveTo(gx+.1,h+.4+.1*Math.sin(frame*.05+i),gx-.05,h+.7+.15*i);g.stroke();}
 // The lips sit on a turning rim: the leading lip faces the hunter; a P2 twist turns the next one round.
 const p2=e.phase===2,lead=p2?e.lipIdx:0;
 // Anticipation: on the swing before a twist (every second apex) the rim winds a little toward the next lip as the
 // shell climbs to that apex, and the incoming lip shows a faint ivory edge.
 const pending=p2&&e.ai==='swing'&&e.apexN%2===1&&e.twist>=18&&!e.cut;
 const pre=pending&&(e.bx-AX)*e.om>0?.18*smooth(clamp01((Math.abs(e.ang)/C.rungs[Math.min(e.rung,C.wallRung)]-.6)/.4)):0;
 const rot=(p2&&e.twist<18?lead-1+smooth(clamp01(e.twist/18)):lead)+pre;
 const lips=C.lips.map((l,i)=>{const th=(i-rot)*TAU/3;return {l,i,depth:Math.cos(th),x:Math.sin(th)*w*.36};});
 for(const q of lips)if(q.depth<-.2)drawLip(g,q.l.id,q.x,h*.86,.42,.35+.55*Math.abs(q.depth),q.depth,0,false,frame,false);
 const open=e.ai==='open'?Math.min(1,e.open/10):0,side=e.openSide||1,split=open*.36;
 const dmg=Math.floor((1-e.hp/e.maxMask)*CRACKS.length*1.2),a=e.act;
 const peel=a?.id==='husks'?(a.stage==='tell'?1-a.t/a.frames:a.stage==='drop'?1:0):0;
 inner(g,h,open,frame);
 const flash=e.flash>0;
 paintHalf(g,-1,w,h,split*(side<0?1.4:.6),flash,rot,dmg,peel,frame);
 paintHalf(g,1,w,h,split*(side>0?1.4:.6),flash,rot,dmg,peel,frame);
 seam(g,h,open,frame,e.revealed);
 if(peel>=1){for(const s of [-1,1]){g.save();g.translate(s*.55,h*.98);husk(g,{x:0,y:0,r:M.husks.radius*.8,spin:s*.4,settle:0,landed:false},frame);g.restore();}}
 // The cue is as strong for the early Hook and the late Tail as for the Brow: it follows the lip's window, not the bottom.
 const cue=e.lip?(e.lipHot?1:.7):0,next=(lead+1)%3;
 for(const q of lips)if(q.depth>=-.2){const leading=q.i===lead&&q.depth>.85,incoming=pre>0&&q.i===next;drawLip(g,q.l.id,q.x,h*.86,.44,.35+.65*Math.abs(q.depth),q.depth,leading?cue:incoming?.35*pre/.18:0,leading&&e.lipHot,frame,leading&&e.revealed);}
 g.restore();
 // The pump direction under a cued lip: ivory chevrons pointing the way the shell travels.
 if(e.lip){
  const d=e.lip,cx=x,cy=-(y-.1),k=e.lipHot?1:.5;
  g.strokeStyle=css(P.ivory,k);g.lineWidth=.06;
  for(let i=0;i<(e.lipHot?3:2);i++){const ox=cx+d*(.3+i*.32);g.beginPath();g.moveTo(ox-d*.14,cy-.16);g.lineTo(ox+d*.04,cy);g.lineTo(ox-d*.14,cy+.16);g.stroke();}
 }
}

// The P3 unborn in eight parts: segmented body, head, four crumpled wings and two arms that hold the shell halves.
function creature(g,state,e,frame,x,y){
 const a=e.act,h=e.h,desp=e.glass&&e.ai!=='spent';
 const r=e.reel,climbing=e.ai==='transition'&&r;
 if(!(climbing&&r.t<C.transition-40)&&e.ai!=='spent')cord(g,AX,TOP+1,x,y+h*.95,frame,true,.26);
 const unfold=desp?clamp01((C.desperation-e.desperate)/50):0;
 const flail=a?.id==='flail'&&a.stage==='active';
 const beat=flail?Math.sin(frame*1.3):a?.id==='flail'&&a.stage==='tell'?Math.sin(frame*.5)*.3:Math.sin(frame*.06)*.08;
 const spent=e.ai==='spent';
 g.save();g.translate(x,-y);
 if(spent){g.translate(0,-.5);g.rotate(1.35);g.translate(0,.2);}
 // Wings: upper and lower pairs, membranes with veins; they unfold huge and amber-veined in desperation.
 for(const s of [-1,1])for(const lower of [0,1]){
  const len=(lower?1.25:1.85)*lerp(1,2.1,unfold),base=(lower?.15:.6)+lerp(0,.55,unfold)+beat*(lower?.35:.6)-(spent?.6:0);
  const rx=s*(lower?.2:.28),ry=-(lower?2.1:2.6),ax=Math.cos(base),ay=Math.sin(base);
  const tip=[rx+s*ax*len,ry-ay*len],pts=[];
  for(let i=0;i<=5;i++){const t=i/5,jag=(i%2?.18:0)*len;pts.push([lerp(tip[0],rx+s*.05,t)+s*jag*.3,lerp(tip[1],ry+len*(lower?.45:.62),t)+jag*.4]);}
  const memb=desp?mix(P.fur,P.amberDeep,unfold*.6):P.fur;
  g.fillStyle=css(memb,lower?.5:.62);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
  g.beginPath();g.moveTo(rx,ry);g.lineTo(tip[0],tip[1]);for(const p of pts)g.lineTo(p[0],p[1]);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(desp?P.amberHot:P.cyanDeep,desp?.5+.4*unfold:.55);g.lineWidth=.025;
  for(const p of pts){g.beginPath();g.moveTo(rx,ry);g.quadraticCurveTo((rx+p[0])/2+s*.1,(ry+p[1])/2-.1,p[0],p[1]);g.stroke();}
  g.fillStyle=css(P.ivory,.5);g.beginPath();g.arc(lerp(rx,tip[0],.55),lerp(ry,tip[1],.55),.07,0,TAU);g.fill();
 }
 // Abdomen: five segments from the tip up, each with a pale band.
 for(let i=0;i<5;i++){
  const t=i/4,sy=-(.35+t*1.5),rx=.32+.22*Math.sin(Math.PI*(.2+t*.7)),ry=.26;
  const gr=g.createLinearGradient(-rx,sy,rx,sy);gr.addColorStop(0,P.furLight);gr.addColorStop(.5,P.fur);gr.addColorStop(1,P.furDeep);
  g.fillStyle=gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.04;g.beginPath();g.ellipse(Math.sin(frame*.05+i)*.03,sy,rx,ry,0,0,TAU);g.fill();g.stroke();
  g.strokeStyle=css(P.boneShade,.55);g.lineWidth=.035;g.beginPath();g.ellipse(0,sy-.08,rx*.85,ry*.5,0,Math.PI*1.1,Math.PI*1.9);g.stroke();
 }
 // Thorax with an ivory ruff.
 const tg=g.createRadialGradient(-.2,-2.6,.05,0,-2.45,.75);tg.addColorStop(0,P.furRim);tg.addColorStop(.4,P.fur);tg.addColorStop(1,P.furDeep);
 g.fillStyle=tg;g.strokeStyle=css(P.outline,1);g.lineWidth=.05;g.beginPath();g.ellipse(0,-2.45,.62,.56,0,0,TAU);g.fill();g.stroke();
 g.fillStyle=css(P.bone,.9);for(let i=-3;i<=3;i++){g.beginPath();g.ellipse(i*.15,-2.95+Math.abs(i)*.03,.1,.17,i*.2,0,TAU);g.fill();}
 // Head: cyan eyes, feathered antennae.
 g.fillStyle=css(P.furDeep,1);g.beginPath();g.arc(0,-3.3,.42,0,TAU);g.fill();g.stroke();
 const eyes=glow(P.cyan);
 for(const s of [-1,1]){
  g.fillStyle=css(spent?P.cyanDeep:P.cyan,1);g.beginPath();g.ellipse(s*.17,-3.33,.1,.13,0,0,TAU);g.fill();
  if(eyes&&!spent){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(eyes,s*.17-.3,-3.63,.6,.6);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  g.strokeStyle=css(P.furLight,.9);g.lineWidth=.035;const ax=s*(.75+.05*Math.sin(frame*.07)),ay=-4.25;
  g.beginPath();g.moveTo(s*.12,-3.65);g.quadraticCurveTo(s*.2,-4.2,ax,ay);g.stroke();
  for(let i=1;i<6;i++){const t=i/6,[px,py]=qpt(s*.12,-3.65,s*.2,-4.2,ax,ay,t);g.beginPath();g.moveTo(px,py);g.lineTo(px+s*.12,py+.05);g.moveTo(px,py);g.lineTo(px-s*.04,py-.12);g.stroke();}
 }
 // The soft form glows through when exposed.
 if(e.ai==='open'||desp){const sp=glow(desp?P.cyan:P.amber);if(sp){const k=e.ai==='open'?Math.min(1,e.open/10):.4+.2*Math.sin(frame*.2);g.globalCompositeOperation='lighter';g.globalAlpha=.75*k;g.drawImage(sp,-1.6,-3.6,3.2,3.2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}}
 g.restore();
 // Arms and the two shell halves of the Half-Shell Clap.
 let gap=1.25,ring=0,tremble=0,n=0;
 if(a&&CLAPS.includes(a.id)){
  n=a.id==='clap2'?(a.n||1):0;
  if(a.stage==='wait')gap=1.35;
  else if(a.stage==='tell'){const q=1-a.t/a.frames;gap=lerp(1.25,2.15,smooth(q));ring=q;}
  else if(a.stage==='hold'){gap=2.15;tremble=Math.sin(frame*2.1)*.06;ring=1;}
  else if(a.stage==='active')gap=.32;
  else if(a.stage==='after')gap=lerp(1.25,.32,a.t/M.clap.after);
 }
 if(spent)gap=1.6;
 // The halves hang low under the body, centred on the clap box (from under the feet up into the abdomen), so the slam
 // visibly sweeps the floor the strike covers: a hunter under a high apex is hit by halves that reach them.
 const hy=y+(spent?.56:.25);
 for(const s of [-1,1]){
  const hx=x+s*(gap+tremble);
  g.strokeStyle=css(P.furDeep,1);g.lineWidth=.17;g.lineCap='round';
  g.beginPath();g.moveTo(x+s*.45,-(y+2.6));g.quadraticCurveTo(x+s*(gap*.8+.3),-(y+2.2),hx-s*.15,-(hy+.85));g.stroke();
  g.strokeStyle=css(P.furLight,.5);g.lineWidth=.05;g.stroke();
  g.save();g.translate(hx,-(hy+C.shell.h*.7*.55*.5));g.scale(.55,.55);
  paintHalf(g,s,C.shell.w,C.shell.h*.7,0,e.flash>0,0,0,0,frame);
  g.restore();
 }
 if(ring>0){
  // The ivory ring: this clap is parryable; it tightens as the halves wind up (a second pip for the double clap).
  const R=M.clap.reach*(1.25-.25*ring);
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.ivory,.25+.6*ring);g.lineWidth=.06+.05*ring;
  g.beginPath();g.ellipse(x,-(hy+.2),R,R*.55,0,0,TAU);g.stroke();
  if(a.id==='clapd'&&a.stage==='hold'){g.setLineDash?.([.25,.2]);g.beginPath();g.ellipse(x,-(hy+.2),R*1.12,R*.62,0,0,TAU);g.stroke();g.setLineDash?.([]);}
  if(a.id==='clap2'){for(let i=0;i<2;i++){g.fillStyle=css(P.ivory,i<n?.95:.3);g.beginPath();g.arc(x-.2+i*.4,-(y+h+.45),.09,0,TAU);g.fill();}}
  // An amber core: parrying this clap will expose the soft form (the 10 s skill clock has run, and it is the last clap
  // of a double). Without it a parry only guards.
  if(e.glass||e.sinceClap>=C.clapGap&&(a.id!=='clap2'||n===2)){
   const sp=glow(P.amber);if(sp){g.globalAlpha=.25+.45*ring;g.drawImage(sp,x-R*.7,-(hy+.2)-R*.7,R*1.4,R*1.4);g.globalAlpha=1;}
   g.strokeStyle=css(P.amberHot,.3+.5*ring);g.lineWidth=.05;g.beginPath();g.ellipse(x,-(hy+.2),R*.72,R*.4,0,0,TAU);g.stroke();
  }
  g.globalCompositeOperation='source-over';
 }
 if(a&&CLAPS.includes(a.id)&&a.stage==='active'&&a.t>=M.clap.active-1){const sp=glow(P.ivory);if(sp){g.globalCompositeOperation='lighter';g.drawImage(sp,x-1.4,-(hy+.2)-1.4,2.8,2.8);g.globalCompositeOperation='source-over';}}
 // Wing Flail: a ring of cyan scale dust.
 if(a?.id==='flail'&&(a.stage==='active'||a.stage==='tell')){
  const R=M.flail.radius,k=a.stage==='active'?1:.35;
  g.fillStyle=css(P.cyan,.55*k);
  for(let i=0;i<28;i++){const t=i/28*TAU+frame*.15,rr=R*(a.stage==='active'?.85+.15*Math.sin(i*3.1+frame*.4):.5);g.fillRect(x+Math.cos(t)*rr-.04,-(y+h*.5)+Math.sin(t)*rr-.04,.08,.08);}
 }
 // Cord Lash: the stump coils under the unborn (tell), then whips along the floor to a cyan tip.
 if(a?.id==='lash'){
  if(a.stage==='tell'||a.stage==='wait'){
   const q=a.stage==='tell'?1-a.t/a.frames:0;g.strokeStyle=css(P.furDeep,1);g.lineWidth=.16;g.beginPath();
   for(let i=0;i<=20;i++){const t=i/20,rr=.15+t*.5*q,an=t*TAU*1.5;const px=x+Math.cos(an)*rr,py=-(y+.3)+Math.sin(an)*rr*.4;if(i)g.lineTo(px,py);else g.moveTo(px,py);}g.stroke();
   if(q>0){const sp=glow(P.cyan);if(sp){g.globalCompositeOperation='lighter';g.globalAlpha=q;g.drawImage(sp,x-.5,-(y+.3)-.5,1,1);g.globalAlpha=1;g.globalCompositeOperation='source-over';}}
  }else if(a.stage==='active'&&a.tip!==undefined){
   const tx=a.tip,ty=1.25,mx=(x+tx)/2;g.strokeStyle=css(P.furDeep,1);g.lineWidth=.17;
   g.beginPath();g.moveTo(x,-(y+.4));g.quadraticCurveTo(mx,-(.7+.35*Math.sin(frame*.9)),tx,-ty);g.stroke();
   const sp=glow(P.cyan,.25);if(sp){g.globalCompositeOperation='lighter';g.drawImage(sp,tx-.7,-ty-.7,1.4,1.4);g.globalCompositeOperation='source-over';}
   g.fillStyle=css(P.cyanHot,1);g.beginPath();g.arc(tx,-ty,.14,0,TAU);g.fill();
  }
 }
}
const CLAPS=['clap','clapd','clap2'];
// Defeat: the halves lie broken, amber dust rises, and a small cyan larva crawls out of the wreck.
function defeated(g,state,e,frame,x){
 const t=Math.max(0,frame-(e.defeatedFrame||frame));
 for(const s of SHARDS){g.save();g.translate(x+s.dx,-1.15);g.rotate(s.a);g.fillStyle=css(P.boneShade,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;g.beginPath();g.moveTo(-s.r,0);g.quadraticCurveTo(0,-s.r*s.s,s.r,0);g.closePath();g.fill();g.stroke();g.restore();}
 g.globalCompositeOperation='lighter';
 for(const d of DUST){const yy=1.2+((t*.02*d.v+d.ph)%5),k=1-((t*.02*d.v+d.ph)%5)/5;g.fillStyle=css(P.amberHot,.6*k);g.fillRect(x+d.dx+Math.sin(t*.03+d.ph)*.3,-yy,d.s,d.s);}
 g.globalCompositeOperation='source-over';
 const lx=x+Math.min(2.2,t*.006),wr=Math.sin(t*.25);
 for(let i=0;i<5;i++){g.fillStyle=css(i%2?P.cyanDeep:P.cyan,1);g.beginPath();g.ellipse(lx-i*.16,-1.12-Math.max(0,wr*(i===2?.05:0)),.1-i*.01,.08,0,0,TAU);g.fill();}
 const sp=glow(P.cyan);if(sp){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(sp,lx-.6,-1.7,1.2,1.2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
}

// ---- the light (in front) ----
const BIG={open:P.amberHot,cap:P.amber,split:P.ivory,phase:P.ivory,defeat:P.amberHot,wall:P.ivory,spent:P.cyanHot,unfold:P.cyanHot};
const SMALL={shove:P.ivory,deflect:P.boneShade,husk:P.ivory,clap:P.ivory,amber:P.amber,reel:P.bone};
export function drawChrysalis5Front(g,state,e,frame,alpha,view){
 const desp=e.glass&&e.ai!=='spent'&&!e.dead,warm=e.cut;
 g.globalCompositeOperation='lighter';
 // Shafts of light slant down from the vault like a nave at dusk (warmer once the unborn is out).
 for(let i=0;i<SHAFTS.length;i++){
  const s=SHAFTS[i],a=s.a*(.75+.25*Math.sin(frame*.011+i*1.7))*(desp?.3:1);
  const x0=s.x,x1=s.x+3.2,y0=-TOP-1,y1=-1;
  const gr=g.createLinearGradient(x0,y0,x1,y1);
  gr.addColorStop(0,css(warm?P.amberHot:P.ivory,a));gr.addColorStop(.7,css(warm?P.amber:P.ivory,a*.35));gr.addColorStop(1,css(P.ivory,0));
  g.fillStyle=gr;g.beginPath();g.moveTo(x0-s.w/2,y0);g.lineTo(x0+s.w/2,y0);g.lineTo(x1+s.b/2,y1);g.lineTo(x1-s.b/2,y1);g.closePath();g.fill();
 }
 // Motes drifting up through the light.
 const W=R-L,H=TOP-1;
 for(const m of MOTES){
  const mx=L+(((m.x*W+Math.sin(frame*.004*m.v+m.ph)*.6)%W)+W)%W,my=1+((m.y*H+frame*.004*m.v)%H);
  g.fillStyle=css(desp?P.cyanHot:P.ivory,.2+.2*Math.sin(frame*.03+m.ph));g.fillRect(mx-m.s/2,-my-m.s/2,m.s,m.s);
 }
 g.globalCompositeOperation='source-over';
 // Vignette: the nave's edges fall into shadow.
 if(view){
  const vx=view.x,vy=-view.y,rad=Math.max(view.w,view.h)*.75;
  const vg=g.createRadialGradient(vx,vy,rad*.35,vx,vy,rad);vg.addColorStop(0,css(P.ink,0));vg.addColorStop(1,css(P.ink,.5));
  g.fillStyle=vg;g.fillRect(vx-view.w/2-1,vy-view.h/2-1,view.w+2,view.h+2);
 }
 impactFrame(g,e,view);
}
// Impact frames: a big beat (opening, cap, split, phase, wall, defeat) flashes the whole view for a few drawn frames
// with ink speed lines, then rings out; small beats (shove, deflect, husk, clap, amber) burst a ring where they land.
function impactFrame(g,e,view){
 const im=e.impact;if(!im)return;
 const m=mem(e);if(m.imp!==im){m.imp=im;m.n=0;}
 const n=m.n++,x=im.x,y=-im.y;
 const big=BIG[im.k],small=SMALL[im.k];
 if(big){
  if(n<=2&&view){g.fillStyle=css(big,.2*(3-n)/3);g.fillRect(view.x-view.w/2-1,-view.y-view.h/2-1,view.w+2,view.h+2);}
  if(n<=4){g.strokeStyle=css(P.ink,.7*(1-n/5));g.lineWidth=.07;for(let i=0;i<20;i++){const a=i/20*TAU+(i%2)*.08,r0=1.2+(i%3)*.4,r1=r0+3+(i%4);g.beginPath();g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);g.stroke();}}
  if(n<=16){g.globalCompositeOperation='lighter';g.strokeStyle=css(big,.8*(1-n/16));g.lineWidth=.12*(1-n/20);g.beginPath();g.arc(x,y,.6+n*.28,0,TAU);g.stroke();g.globalCompositeOperation='source-over';}
 }else if(small&&n<=10){
  const k=1-n/10;g.globalCompositeOperation='lighter';g.strokeStyle=css(small,.85*k);g.lineWidth=.06;
  g.beginPath();g.arc(x,y,.2+n*.09,0,TAU);g.stroke();
  for(let i=0;i<6;i++){const a=i/6*TAU+.3,r0=.25+n*.08;g.beginPath();g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);g.lineTo(x+Math.cos(a)*(r0+.25*k),y+Math.sin(a)*(r0+.25*k));g.stroke();}
  g.globalCompositeOperation='source-over';
 }
}
