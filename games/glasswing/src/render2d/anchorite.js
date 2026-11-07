import {ANCHORITE as A} from '../data/anchorite.js';
import {css,mix,P} from './color.js';
import {glow,seeded} from './surface.js';

// The Hourglass Anchorite and its Reliquary Drum, drawn procedurally in world units (y up, canvas y = -y).
// anchoriteTurn eases the room's turn (the whole world rotates about the drum's centre for 24f, then the simulation
// remaps it); drawAnchoriteRoom paints the chamber over the tiles; drawAnchorite the tick, its legs and the hourglass;
// drawAnchoriteFront the hazards and, during the fight, the bronze casing that hides the world outside the drum.
const TAU=Math.PI*2,N=A.n,X0=A.x0,[HX,HY]=A.hub,L=X0+1,R=X0+N-1,M=A.moves;
const CX=X0+N/2,CY=N/2;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const BRONZE='#6b4a2a',BRONZE_HI='#b8874a',BRONZE_DK='#2a1a10',SAND='#c79a55',SAND_DK='#7a5530',SAND_HI='#f0cf8a';
const bossOf=state=>{for(const e of state.enemies||[])if(e.anchorite)return e;return null;};
const clock=()=>(typeof performance!=='undefined'?performance.now():Date.now())/1000;
const deaths=new WeakMap();
function add(g,color,x,y,r,a=1){const sp=glow(color);if(!sp||r<=0)return;g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}

// The view frames the whole drum while the Anchorite lives (render only).
export function anchoriteFocus(state,view){
 const e=bossOf(state);if(!e)return null;
 const f=view.drumFocus||(view.drumFocus={});f.left=X0;f.right=X0+N;f.bottom=0;f.top=N;return f;
}
// Turn angle (radians, counter-clockwise) the picture is rotated by while the room turns.
export function turnAngle(e,alpha){
 if(!e||e.ai!=='turn')return 0;
 const q=e.turnQ===3?-1:e.turnQ,t=smooth((e.aiFrames-e.aiTimer+alpha)/e.aiFrames);
 // A little overshoot and settle sells the weight of the room.
 const k=t+Math.sin(t*Math.PI)*.06;
 return q*Math.PI/2*k;
}
export function anchoriteTurn(g,state,alpha){
 g.save();
 const e=bossOf(state),a=turnAngle(e,alpha);
 let sx=0,sy=0;
 if(e&&!e.dead&&e.ai==='warn'){const k=1-e.aiTimer/e.aiFrames,f=state.frame||0;sx=Math.sin(f*1.9)*.05*k;sy=Math.cos(f*2.3)*.04*k;}
 if(a||sx||sy){g.translate(CX+sx,-CY-sy);g.rotate(-a);g.translate(-CX,CY);}
}

// ---- The chamber ----
let decor=null;
function decorOf(){
 if(decor)return decor;
 const r=seeded('reliquary-drum');decor={chains:[],stones:[],motes:[]};
 for(let i=0;i<5;i++)decor.chains.push({x:L+1.2+i*2.4+r()*.6,len:1.6+r()*2.4,ph:r()*TAU,size:.45+r()*.25});
 for(let i=0;i<70;i++)decor.stones.push({x:L+r()*(R-L),y:1+r()*(N-2),r:.04+r()*.09,a:.15+r()*.3});
 for(let i=0;i<40;i++)decor.motes.push({x:r(),y:r(),s:.02+r()*.05,v:.2+r()*.6,ph:r()*TAU});
 return decor;
}
// Points in the drum's own frame (rotation 0) placed for the current rotation.
function place(rot,u,v){let X=u-X0,Y=v;for(let i=0;i<rot;i++){const t=X;X=N-Y;Y=t;}return [X0+X,Y];}
function backdrop(g,e,frame){
 // Deep aubergine flesh behind bronze and bone: a lit cavity, the spinning drum wheel, rib arches.
 const gr=g.createLinearGradient(0,-(N-1),0,-1);
 gr.addColorStop(0,'#120916');gr.addColorStop(.55,'#2a1530');gr.addColorStop(1,'#3a1d2c');
 g.fillStyle=gr;g.fillRect(L,-(N-1),R-L,N-2);
 const rot=e?e.rot:0,spin=(e?e.conv*(e.glass?0:1):0)*frame*.004+(e?.ai==='turn'?0:0);
 // The drum wheel: concentric bronze rings with bone spokes, spinning with the belt.
 g.save();g.translate(CX,-CY);
 for(const [r,w,c] of [[5.6,.22,BRONZE],[4.4,.1,BRONZE_DK],[3.2,.16,BRONZE]]){g.strokeStyle=css(c,.55);g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();}
 g.rotate(spin);
 for(let i=0;i<12;i++){g.rotate(TAU/12);g.strokeStyle=css(P.boneDark,.35);g.lineWidth=.16;g.beginPath();g.moveTo(1.4,0);g.lineTo(5.5,0);g.stroke();g.fillStyle=css(P.boneShade,.35);g.beginPath();g.arc(5.6,0,.18,0,TAU);g.fill();}
 g.restore();
 // Rib arches on the back wall: tall pointed niches of bone (they belong to the room, so they turn with it).
 g.lineCap='round';g.lineJoin='round';
 for(const [u,w] of [[X0+3.2,2.4],[CX,3],[X0+N-3.2,2.4]]){
  const pts=[[u-w/2,1],[u-w/2,6.5],[u-w*.35,8.6],[u,9.6+(w>2.5?.8:0)],[u+w*.35,8.6],[u+w/2,6.5],[u+w/2,1]].map(([a,b])=>place(rot,a,b));
  g.beginPath();g.moveTo(pts[0][0],-pts[0][1]);for(const [x,y] of pts.slice(1))g.lineTo(x,-y);
  g.fillStyle=css('#0d0610',.45);g.fill();
  g.strokeStyle=css(P.boneShade,.42);g.lineWidth=.3;g.stroke();g.strokeStyle=css(P.boneRim,.12);g.lineWidth=.08;g.stroke();
  for(let v=1.8;v<6.5;v+=1.1){const [a,b]=place(rot,u-w/2-.15,v),[c,d]=place(rot,u-w/2+.15,v),[e2,f2]=place(rot,u+w/2-.15,v),[g2,h2]=place(rot,u+w/2+.15,v);g.strokeStyle=css(P.boneShade,.35);g.lineWidth=.1;g.beginPath();g.moveTo(a,-b);g.lineTo(c,-d);g.moveTo(e2,-f2);g.lineTo(g2,-h2);g.stroke();}
 }
 // Embedded relic stones and slow motes of sand in the light.
 const d=decorOf();
 for(const s of d.stones){const [x,y]=place(rot,s.x,s.y);g.fillStyle=css(P.boneDark,s.a);g.beginPath();g.arc(x,-y,s.r,0,TAU);g.fill();}
 add(g,P.amber,CX,CY-1,6.5,.10);
 for(const m of d.motes){const x=L+((m.x+frame*.0006*m.v)%1)*(R-L),y=1+((m.y+frame*.0011*m.v)%1)*(N-2);g.fillStyle=css(SAND_HI,.25+.2*Math.sin(frame*.03+m.ph));g.fillRect(x,-y,m.s,m.s);}
 // Chained reliquaries from the current ceiling (decor; the falling ones are hazards).
 for(const c of d.chains){
  const sw=Math.sin(frame*.02+c.ph)*.12,top=N-1,bx=c.x+sw*c.len,by=top-c.len;
  g.strokeStyle=css(BRONZE_HI,.55);g.lineWidth=.05;g.setLineDash?.([.12,.08]);g.beginPath();g.moveTo(c.x,-top);g.lineTo(bx,-by);g.stroke();g.setLineDash?.([]);
  cage(g,bx,by-c.size,c.size,frame+c.ph*40,.75);
 }
}
function cage(g,x,y,s,frame,a=1){
 // A bronze-and-bone reliquary with a cold cyan relic inside (cyan: it falls, it cannot be parried).
 g.globalAlpha=a;
 g.fillStyle=css(BRONZE_DK,.85);g.fillRect(x-s/2,-(y+s),s,s);
 add(g,P.cyan,x,y+s*.45,s*.9,.55*a);
 g.fillStyle=css(P.cyanHot,.9);g.beginPath();g.ellipse(x,-(y+s*.45),s*.12,s*.2,0,0,TAU);g.fill();
 g.strokeStyle=css(BRONZE_HI,1);g.lineWidth=s*.08;g.strokeRect(x-s/2,-(y+s),s,s);
 g.strokeStyle=css(P.bone,.9);g.lineWidth=s*.05;
 for(let i=1;i<4;i++){const bx=x-s/2+s*i/4;g.beginPath();g.moveTo(bx,-y);g.lineTo(bx,-(y+s));g.stroke();}
 g.fillStyle=css(P.bone,1);g.beginPath();g.moveTo(x-s*.6,-(y+s));g.lineTo(x,-(y+s*1.35));g.lineTo(x+s*.6,-(y+s));g.closePath();g.fill();
 g.globalAlpha=1;
}
function walls(g,frame){
 // The drum's ring: thick bronze with bone trim and rivets, lit amber from the cracks.
 const t=1;
 for(const [x,y,w,h] of [[X0,0,N,t],[X0,N-t,N,t],[X0,0,t,N],[R,0,t,N]]){
  const gr=g.createLinearGradient(x,-y,x+w,-(y+h));gr.addColorStop(0,BRONZE_DK);gr.addColorStop(.5,BRONZE);gr.addColorStop(1,BRONZE_DK);
  g.fillStyle=gr;g.fillRect(x,-(y+h),w,h);
 }
 g.strokeStyle=css(P.bone,.75);g.lineWidth=.08;g.strokeRect(L,-(N-1),R-L,N-2);
 g.strokeStyle=css(BRONZE_HI,.5);g.lineWidth=.04;g.strokeRect(X0+.08,-(N-.08),N-.16,N-.16);
 g.fillStyle=css(BRONZE_HI,.8);
 for(let i=0;i<N;i++)for(const [x,y] of [[X0+i+.5,.5],[X0+i+.5,N-.5],[X0+.5,i+.5],[R+.5,i+.5]]){g.beginPath();g.arc(x,-y,.07,0,TAU);g.fill();}
}
function cells(g,level,e,frame){
 // Ledges (one-way) and sand (the bed and any set drift) inside the drum, from the grid itself.
 for(let y=1;y<N-1;y++)for(let x=L;x<R;x++){
  const t=level.grid[y]?.[x];
  if(t===2){
   g.fillStyle=css(P.boneShade,1);g.fillRect(x,-(y+1),1,.28);
   g.fillStyle=css(P.boneRim,.6);g.fillRect(x,-(y+1),1,.06);
   g.fillStyle=css(BRONZE,1);g.fillRect(x+.42,-(y+.72),.16,.3);
  }else if(t===1){
   const gr=g.createLinearGradient(0,-(y+1),0,-y);gr.addColorStop(0,SAND_HI);gr.addColorStop(.25,SAND);gr.addColorStop(1,SAND_DK);
   g.fillStyle=gr;g.fillRect(x-.01,-(y+1),1.02,1);
   if(!level.grid[y+1]?.[x]){g.fillStyle=css(SAND_HI,.6);for(let i=0;i<3;i++)g.fillRect(x+((i*.37+frame*.002)%1),-(y+1)-.02,.08,.03);}
  }
 }
}
function floorTrim(g,e,frame){
 // The belt: sand ripples run along the floor with the conveyor; they stall and flow back 24f before a reversal.
 if(!e||e.glass)return;
 const y=1+e.bed,dir=e.convWarn>0?-e.conv:e.conv,speed=e.convWarn>0?.6:1;
 g.fillStyle=css(SAND_HI,.35);
 for(let i=0;i<24;i++){const x=L+(((i*.5+dir*frame*A.conveyor.speed*speed)%(R-L))+(R-L))%(R-L);g.fillRect(x,-y-.05,.22,.05);}
 if(e.convWarn>0){add(g,P.cyan,dir>0?L+.5:R-.5,y+.3,1.2,.4);}
}
function pits(g,e,frame){
 for(const p of e.pits){
  // Quicksand: a sunken funnel of dark sand with a pale rim and grains sliding in, readable from across the drum.
  const y=1+e.bed,cx=(p.x0+p.x1)/2,w=p.x1-p.x0;
  g.fillStyle=css(SAND,.9);g.beginPath();g.moveTo(p.x0-.35,-y);g.quadraticCurveTo(p.x0-.15,-(y+.22),p.x0+.1,-(y+.12));g.lineTo(p.x1-.1,-(y+.12));g.quadraticCurveTo(p.x1+.15,-(y+.22),p.x1+.35,-y);g.closePath();g.fill();
  g.save();g.translate(cx,-y);g.scale(1,.3);
  const gr=g.createRadialGradient(0,0,0,0,0,w/2+.2);gr.addColorStop(0,'#0c0604');gr.addColorStop(.45,'#2a160b');gr.addColorStop(.8,SAND_DK);gr.addColorStop(1,css(SAND,.6));
  g.fillStyle=gr;g.beginPath();g.arc(0,0,w/2+.2,0,TAU);g.fill();
  g.strokeStyle=css(SAND_HI,.75);g.lineWidth=.09;
  for(let i=0;i<3;i++){g.beginPath();g.arc(0,0,w*(.14+i*.13),frame*.08+i*2,frame*.08+i*2+3.6);g.stroke();}
  g.restore();
  g.fillStyle=css(SAND_HI,.85);
  for(let i=0;i<6;i++){const q=(frame*.02+i/6)%1,s=i%2?1:-1;g.fillRect(cx+s*(w/2+.25)*(1-q)-.03,-(y+.14*(1-q)),.06,.06);}
 }
}
// A hunter standing in quicksand sinks: sand climbs the legs, cold glints in the last third (render only; e.sink).
function sinking(g,state,e,frame,alpha){
 for(let i=0;i<state.players.length&&i<2;i++){
  const n=e.sink[i];if(!(n>0))continue;
  const p=state.players[i],k=clamp(n/A.sink.frames),x=p.px+(p.x-p.px)*alpha,y=p.py+(p.y-p.py)*alpha,w=p.w/2+.25,h=.15+k*1.1;
  const gr=g.createLinearGradient(0,-(y+h),0,-y);gr.addColorStop(0,SAND_HI);gr.addColorStop(.35,SAND);gr.addColorStop(1,SAND_DK);
  g.fillStyle=gr;g.beginPath();g.moveTo(x-w-.2,-y);g.quadraticCurveTo(x-w,-(y+h*.9),x,-(y+h));g.quadraticCurveTo(x+w,-(y+h*.9),x+w+.2,-y);g.closePath();g.fill();
  g.fillStyle=css(SAND_HI,.9);for(let j=0;j<5;j++){const q=(frame*.05+j/5)%1;g.fillRect(x-w+j*w*.45,-(y+h*(1-q)+.15*q),.05,.05);}
  if(k>.6)add(g,P.cyan,x,y+h,.5+.4*k,(k-.6)*2*(Math.floor(frame/4)%2?1:.5));
 }
}
function drift(g,e,frame){
 const d=e.drift;if(!d||d.set)return;
 // Sand pours from the hourglass neck onto the burying half and piles up; cyan glints in its last second.
 const k=clamp(d.t/A.bury.frames),y=1+e.bed,x0=d.side<0?L:HX,x1=d.side<0?HX:R,h=k*1,src=HX+d.side*.6;
 g.strokeStyle=css(SAND,.55);g.lineWidth=.12+.1*k;g.beginPath();g.moveTo(HX,-(HY-2.6));g.quadraticCurveTo(src+d.side*1.5,-(HY-3),(x0+x1)/2,-(y+h));g.stroke();
 g.strokeStyle=css(SAND_HI,.35);g.lineWidth=.04;g.stroke();
 const gr=g.createLinearGradient(0,-(y+h),0,-y);gr.addColorStop(0,SAND_HI);gr.addColorStop(.3,SAND);gr.addColorStop(1,SAND_DK);
 g.fillStyle=gr;g.beginPath();g.moveTo(x0,-y);
 for(let i=0;i<=12;i++){const x=lerp(x0,x1,i/12),edge=Math.min(1,Math.min(i,12-i)/3);g.lineTo(x,-(y+h*(.55+.45*edge)+Math.sin(i*1.7+frame*.05)*.03*k));}
 g.lineTo(x1,-y);g.closePath();g.fill();
 if(k>.72){const f=(k-.72)/.28;for(let i=0;i<8;i++){const x=lerp(x0,x1,(i+.5)/8);add(g,P.cyan,x,y+h+.05,.35+.25*f,.25+.5*f*(Math.floor(frame/4+i)%2));}}
}

export function drawAnchoriteRoom(g,state,frame,alpha){
 const e=bossOf(state),level=state.level;
 backdrop(g,e&&!e.dead?e:null,frame+alpha);
 walls(g,frame);
 cells(g,level,e,frame);
 if(e&&!e.dead){floorTrim(g,e,frame+alpha);pits(g,e,frame+alpha);drift(g,e,frame+alpha);}
 // The door stays open (a dark arch) until the hunter is in.
 if(!e?.sealed&&level.grid[A.door[0]]?.[X0]===0){g.fillStyle='#07040a';g.fillRect(X0,-(A.door[1]+1),1,A.door[1]+1-A.door[0]);add(g,P.amber,X0+.5,2,1.4,.25);}
}

// ---- The Anchorite ----
// Two-bone reach: the knee of a leg from s to t with segment lengths a, b, bending to side.
function knee(sx,sy,tx,ty,a,b,bend){
 const dx=tx-sx,dy=ty-sy,d=Math.max(.01,Math.min(a+b-.01,Math.sqrt(dx*dx+dy*dy))),k=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-k*k));
 const ux=dx/Math.max(.01,Math.sqrt(dx*dx+dy*dy)),uy=dy/Math.max(.01,Math.sqrt(dx*dx+dy*dy));
 return [sx+ux*k-uy*h*bend,sy+uy*k+ux*h*bend];
}
// A tapered segment (a quad from width w0 to w1), filled then outlined.
function seg(g,x0,y0,x1,y1,w0,w1,fill,rim){
 const dx=x1-x0,dy=y1-y0,l=Math.max(.01,Math.sqrt(dx*dx+dy*dy)),nx=-dy/l,ny=dx/l;
 g.beginPath();g.moveTo(x0+nx*w0/2,-(y0+ny*w0/2));g.quadraticCurveTo((x0+x1)/2+nx*(w0+w1)*.4,-((y0+y1)/2+ny*(w0+w1)*.4),x1+nx*w1/2,-(y1+ny*w1/2));
 g.lineTo(x1-nx*w1/2,-(y1-ny*w1/2));g.quadraticCurveTo((x0+x1)/2-nx*(w0+w1)*.2,-((y0+y1)/2-ny*(w0+w1)*.2),x0-nx*w0/2,-(y0-ny*w0/2));g.closePath();
 g.fillStyle=fill;g.fill();g.strokeStyle=css(P.outline,1);g.lineWidth=.05;g.stroke();
 if(rim){g.strokeStyle=rim;g.lineWidth=Math.min(w0,w1)*.25;g.beginPath();g.moveTo(x0+nx*w0*.25,-(y0+ny*w0*.25));g.lineTo(lerp(x0,x1,.85)+nx*w1*.2,-(lerp(y0,y1,.85)+ny*w1*.2));g.stroke();}
}
function limb(g,sx,sy,kx,ky,tx,ty,w,tip,flash){
 g.lineCap='round';g.lineJoin='round';
 seg(g,sx,sy,kx,ky,w*1.5,w*.95,flash?P.ivory:css(P.fur,1),css(P.furRim,.45));
 seg(g,kx,ky,tx,ty,w*.95,w*.35,flash?P.ivory:css(P.boneShade,1),css(P.boneRim,.55));
 if(!tip){const dx=tx-kx,dy=ty-ky,l=Math.max(.01,Math.sqrt(dx*dx+dy*dy));g.strokeStyle=css(P.bone,1);g.lineWidth=w*.3;g.beginPath();g.moveTo(tx,-ty);g.quadraticCurveTo(tx+dx/l*.35-dy/l*.25,-(ty+dy/l*.35+dx/l*.25),tx+dx/l*.15-dy/l*.45,-(ty+dy/l*.15+dx/l*.45));g.stroke();}
 g.fillStyle=css(P.bone,1);g.beginPath();g.arc(kx,-ky,w*.62,0,TAU);g.fill();g.strokeStyle=css(P.outline,1);g.lineWidth=w*.2;g.stroke();
 if(tip){
  // A spear tip on the foreleg.
  const dx=tx-kx,dy=ty-ky,l=Math.max(.01,Math.sqrt(dx*dx+dy*dy)),ux=dx/l,uy=dy/l;
  g.fillStyle=flash?P.ivory:css(P.bone,1);g.beginPath();g.moveTo(tx+ux*.7,-(ty+uy*.7));g.lineTo(tx-uy*.28,-(ty+ux*.28));g.lineTo(tx+uy*.28,-(ty-ux*.28));g.closePath();g.fill();g.stroke();
 }
}
// Which foreleg draws a lash (render only): the one on the target's side, picked once per lash and kept for its jam,
// so a stab never reaches across the body and no leg switches mid-move. Under the body it alternates (the sim's a.leg).
const lashLeg=new WeakMap();
function lashSide(e,a){
 let m=lashLeg.get(e);if(!m){m={act:null,side:1};lashLeg.set(e,m);}
 if(a&&a.id==='lash'&&m.act!==a){m.act=a;m.side=Math.abs(a.x-HX)<1.3?a.leg:Math.sign(a.x-HX);}
 return m.side;
}
// Pose of a foreleg (side -1/1): rest, cocked out to its side during a tell (ivory ring at the tip), stabbing, stuck.
// Every pose keeps the tip below the shoulder, so the knee (bent away from the body) stays a raised mantis elbow
// outside the carapace: the forelegs never cross the face and the knee never flips sides mid-move.
function foreleg(e,side,frame,alpha){
 const sx=HX+side*1.3,sy=HY-.3,a=e.act,rest=[HX+side*2.6,HY-2.9],leg=lashSide(e,a);
 let tip=rest,ring=0,stuck=false,amber=0;
 if(e.ai==='open'&&e.openKind==='jam'&&leg===side){tip=[e.jamX,e.jamY+.15];stuck=true;amber=1;}
 else if(a?.id==='lash'&&leg===side){
  const rear=[HX+side*4.2,HY-.9];
  if(a.stage==='tell'){const k=smooth(1-(a.t-alpha)/a.frames);tip=[lerp(rest[0],rear[0],Math.min(1,k*1.6)),lerp(rest[1],rear[1],Math.min(1,k*1.6))];ring=k;
   // The aim: the tip swings to point at the locked target.
   tip[0]+=(a.x-HX)*.12*k;}
  else if(a.stage==='strike'){const k=clamp((a.t+alpha)/M.lash.hit);tip=[lerp(rear[0]+(a.x-HX)*.12,a.x,k*k),lerp(rear[1],a.y+.15,k*k)];ring=1-k;}
  else{const k=a.stage==='hold'?clamp(1-(a.t-alpha)/M.lash.hold):clamp(1-(a.t-alpha)/M.lash.after);tip=[lerp(a.x,rest[0],k*k),lerp(a.y+.15,rest[1],k*k)];stuck=a.stage==='hold'&&k<.3;}
 }
 let [kx,ky]=knee(sx,sy,tip[0],tip[1],4.4,4.4,side);
 // The jammed leg buckles: its bared joint settles inside the opening's hurtbox (the sim's e.x, e.y, e.h).
 if(amber){const k=smooth(clamp((e.aiFrames-e.aiTimer+alpha)/6));kx=lerp(kx,e.x,k);ky=lerp(ky,e.y+e.h*.5,k);}
 return {sx,sy,kx,ky,tx:tip[0],ty:tip[1],ring,stuck,amber};
}
// The upper bulb's sand as drawn (render only): it drains visibly instead of popping when the sim empties it at once
// (a transition's crack, the anti-form early turn); it refills at once only when a turn lands, where the turned-over
// glass already shows it full.
const sandShown=new WeakMap();
function topSand(state,e){
 const target=e.ai==='turn'||e.ai==='warn'?0:clamp(e.sand/(e.sandMax||1)),f=state.frame||0;
 let m=sandShown.get(e);if(!m){m={v:target,f};sandShown.set(e,m);}
 const df=Math.max(0,Math.min(4,f-m.f));m.f=f;
 m.v=target>=m.v?target:Math.max(target,m.v-.03*df);
 return m.v;
}
function hourglass(g,e,x,y,frame,flash,open,spin=0,top=null){
 // The hourglass: a bronze frame, two cyan-tinted glass bulbs; the upper one's sand is the time to the next turn.
 const h=2.5,w=1.35,cracked=e.phase>=3,shattered=e.glass||e.ai==='spent',fill=clamp(e.sand/(e.sandMax||1));
 const sandTop=top??(e.ai==='turn'||e.ai==='warn'?0:fill),sandLow=1-sandTop;
 g.save();g.translate(x,-y);if(spin)g.rotate(spin);
 const bulb=(dir)=>{g.beginPath();g.moveTo(-.12,0);g.bezierCurveTo(-w*1.1,-dir*h*.25,-w,-dir*h*.95,0,-dir*h);g.bezierCurveTo(w,-dir*h*.95,w*1.1,-dir*h*.25,.12,0);g.closePath();};
 if(!shattered){
  for(const dir of [1,-1]){bulb(dir);g.fillStyle=css(P.cyanDeep,.18);g.fill();}
  // Sand: the top bulb drains from the top, the low one fills from the bottom; amber when bared.
  g.save();bulb(1);g.clip();g.fillStyle=css(SAND,.95);const st=h*sandTop*.92;g.fillRect(-w,-st,w*2,st);g.restore();
  g.save();bulb(-1);g.clip();
  const low=open>0?mix(SAND,P.amber,open):SAND;g.fillStyle=css(low,.95);const sl=h*Math.max(.12,sandLow)*.9;g.fillRect(-w,h-sl,w*2,sl);
  g.restore();
  if(open>0){g.save();bulb(-1);g.clip();add(g,P.amber,0,-h*.55,2.4*open,.9*open);g.restore();add(g,P.amberHot,0,-h*.55,1.6*open,.45*open);}
  // The stream through the neck.
  if(fill>0&&fill<1&&e.ai!=='turn'){g.strokeStyle=css(SAND_HI,.9);g.lineWidth=.06;g.beginPath();g.moveTo(0,0);g.lineTo(Math.sin(frame*.3)*.02,h*(1-Math.max(.12,sandLow)*.9));g.stroke();}
  for(const dir of [1,-1]){bulb(dir);g.strokeStyle=css(P.cyanHot,.55);g.lineWidth=.06;g.stroke();g.strokeStyle=css(P.ivory,.25);g.lineWidth=.03;g.beginPath();g.arc(-w*.35,-dir*h*.55,w*.42,Math.PI*.9,Math.PI*1.4);g.stroke();}
  if(cracked){g.strokeStyle=css(P.cyanHot,.8);g.lineWidth=.035;g.beginPath();g.moveTo(-.5,h*.3);g.lineTo(-.15,h*.55);g.lineTo(-.4,h*.8);g.moveTo(-.15,h*.55);g.lineTo(.25,h*.62);g.moveTo(.4,-h*.4);g.lineTo(.1,-h*.6);g.stroke();
   g.fillStyle=css(SAND,.8);for(let i=0;i<4;i++)g.fillRect(-.42+Math.sin(i)*.03,h*.8+((frame*.05+i*.25)%1)*.9,.04,.08);}
 }else{
  // Shattered: jagged rims of glass on the frame.
  g.strokeStyle=css(P.cyanHot,.7);g.lineWidth=.05;
  for(const dir of [1,-1]){g.beginPath();g.moveTo(-.12,0);g.lineTo(-w*.7,-dir*h*.3);g.lineTo(-w*.45,-dir*h*.5);g.lineTo(-w*.8,-dir*h*.62);g.moveTo(.12,0);g.lineTo(w*.6,-dir*h*.35);g.lineTo(w*.4,-dir*h*.48);g.stroke();}
 }
 // The bronze frame: two plates and four bone pillars.
 g.fillStyle=css(BRONZE,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
 for(const dir of [1,-1]){g.beginPath();g.ellipse(0,-dir*(h+.12),w*1.15,.2,0,0,TAU);g.fill();g.stroke();g.fillStyle=css(BRONZE_HI,.6);g.fillRect(-w*.9,-dir*(h+.12)-.04,w*1.8,.06);g.fillStyle=css(BRONZE,1);}
 g.strokeStyle=css(P.boneShade,1);g.lineWidth=.13;for(const sx of [-w*1.02,w*1.02]){g.beginPath();g.moveTo(sx,-(h+.05));g.lineTo(sx,h+.05);g.stroke();}
 if(flash){g.globalCompositeOperation='lighter';for(const dir of [1,-1]){bulb(dir);g.fillStyle=css(P.ivory,.45);g.fill();}g.globalCompositeOperation='source-over';}
 g.restore();
}
function tick(g,e,frame,flash,wake){
 // The hermit-tick fused to the axle: a bloated ivory carapace, aubergine flesh, six cyan eyes, mandibles.
 const x=HX,y=HY+.15,breathe=1+Math.sin(frame*.06)*.025,glass=e.glass;
 g.save();g.translate(x,-y);g.scale(breathe,1/breathe);
 // Flesh sac behind.
 const fg=g.createRadialGradient(0,-.2,.2,0,0,2.4);fg.addColorStop(0,P.furLight);fg.addColorStop(.6,P.fur);fg.addColorStop(1,P.furDeep);
 g.fillStyle=fg;g.beginPath();g.ellipse(0,.1,2.15,1.65,0,0,TAU);g.fill();g.strokeStyle=css(P.outline,1);g.lineWidth=.07;g.stroke();
 // Carapace plates: overlapping ivory arcs.
 for(let i=0;i<4;i++){
  const r=1.95-i*.38,yy=-.25-i*.22;
  const cg=g.createLinearGradient(-r,yy-r*.6,r,yy+r*.4);cg.addColorStop(0,P.boneRim);cg.addColorStop(.45,P.bone);cg.addColorStop(1,P.boneDark);
  g.fillStyle=flash?P.ivory:cg;g.beginPath();g.ellipse(0,yy,r,r*.62,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();
 }
 // Cracks with the stolen amber light (dim) and growth rings.
 g.strokeStyle=css(P.amberDeep,glass?.9:.55);g.lineWidth=.04;g.beginPath();g.moveTo(-1.2,-.4);g.lineTo(-.7,-.8);g.lineTo(-.85,-1.1);g.moveTo(.9,-.5);g.lineTo(.55,-.95);g.stroke();
 // Head: low under the dome, six cyan eyes.
 g.fillStyle=css(P.furDeep,1);g.beginPath();g.ellipse(0,.55,.85,.5,0,0,TAU);g.fill();g.stroke();
 const eyes=[[-.42,.42],[.42,.42],[-.2,.3],[.2,.3],[-.62,.6],[.62,.6]];
 for(let i=0;i<eyes.length;i++){const [ex,ey]=eyes[i],lit=clamp(wake*6-i);g.fillStyle=css(glass?P.cyanHot:P.cyan,.25+.75*lit);g.beginPath();g.arc(ex,ey,.085,0,TAU);g.fill();}
 g.restore();
 for(const [ex,ey] of eyes)add(g,P.cyan,x+ex,y-ey,.42,.55*wake);
 // Mandibles.
 g.strokeStyle=css(P.bone,1);g.lineWidth=.1;g.lineCap='round';
 const m=Math.sin(frame*.15)*.08+(glass?.15:0);
 for(const s of [-1,1]){g.beginPath();g.moveTo(x+s*.3,-(y-.85));g.quadraticCurveTo(x+s*(.55+m),-(y-1.25),x+s*.15,-(y-1.45));g.stroke();}
}
function axle(g,e,frame,front){
 // The cyan axle: cold glass behind the tick, it clanks; in desperation it burns through as a contact hazard.
 const hot=e.glass&&e.ai!=='spent',p=.5+.5*Math.sin(frame*.25);
 if(!front){
  add(g,P.cyan,HX,HY,hot?2.2+p*.6:1.6,hot?.85:.4);
  g.fillStyle=css(P.cyanDeep,1);g.beginPath();g.arc(HX,-HY,.7,0,TAU);g.fill();
  g.fillStyle=css(P.cyanHot,hot?.95:.6);g.beginPath();g.arc(HX,-HY,.34,0,TAU);g.fill();
  return;
 }
 if(hot){add(g,P.cyan,HX,HY,1.6+p*.5,.7);g.strokeStyle=css(P.cyan,.7);g.lineWidth=.06;g.beginPath();g.arc(HX,-HY,A.axle.w/2+.15*p,0,TAU);g.stroke();}
}
function turnCue(g,e,frame,alpha){
 // The turn: a ring of amber light runs around the hub the way the room will turn (a half turn runs both ways).
 if(e.ai!=='warn')return;
 const k=1-(e.aiTimer-alpha)/e.aiFrames,dirs=e.turnQ===2?[1,-1]:[e.turnQ===1?1:-1],r=3.4;
 g.lineCap='round';
 for(const d of dirs){
  for(let i=0;i<5;i++){
   const a0=-Math.PI/2+d*(k*Math.PI*(e.turnQ===2?1:.5)-i*.16);
   g.strokeStyle=css(P.amberHot,.85*(1-i/5));g.lineWidth=.16-i*.02;g.beginPath();g.arc(HX,-HY,r,-a0-.08,-a0+.08);g.stroke();
  }
  const a=-Math.PI/2+d*k*Math.PI*(e.turnQ===2?1:.5);add(g,P.amber,HX+Math.cos(a)*r,HY+Math.sin(a)*r,.9,.8);
 }
 // The last grains drop; dust trickles from the whole ceiling.
 g.fillStyle=css(P.ash,.35*k);for(let i=0;i<14;i++){const x=L+.4+i*.82,yy=N-1-((frame*.12+i*.37)%1)*k*3;g.fillRect(x,-yy,.05,.16);}
}

export function drawAnchorite(g,state,e,frame,alpha){
 const t=frame+alpha;
 if(e.dead){death(g,state,e);return;}
 const wake=e.ai==='enter'?clamp(1-e.aiTimer/Math.max(1,e.aiFrames)):1,flash=e.flash>0;
 // Six legs anchored into the corners and wall middles (they turn with the room); unfolding on waking.
 const anchors=[[L+.2,1.2],[R-.2,1.2],[L+.2,N-1.2],[R-.2,N-1.2],[L+.1,HY+2.2],[R-.1,HY+2.2]];
 for(let i=0;i<anchors.length;i++){
  const [ax,ay]=anchors[i],side=ax<HX?-1:1,sx=HX+side*1.4,sy=HY+(ay>HY?.6:-.4);
  const tx=lerp(HX+side*2,ax,smooth(wake*1.4-i*.06)),ty=lerp(HY,ay,smooth(wake*1.4-i*.06));
  const [kx,ky]=knee(sx,sy,tx,ty,3.9,3.9,ay>HY?side:-side);
  limb(g,sx,sy,kx,ky,tx,ty,.22,false,false);
 }
 // The hourglass: at the hub, or lowered to the floor as the bulb opening (amber).
 let hx=HX,hy=HY,open=0;
 if(e.ai==='open'&&e.openKind==='bulb'){
  const into=clamp((e.aiFrames-e.aiTimer+alpha)/6),out=clamp((e.aiTimer-alpha)/8),k=smooth(Math.min(into,out));
  const fy=e.y+2.6;hx=lerp(HX,e.bulbX,k);hy=lerp(HY,fy,k);open=Math.min(into,out)*(1-e.openDamage/(e.maxMask*e.openCap)*.6);
  // The telescoping bronze neck from the axle to the lowered glass.
  g.strokeStyle=css(BRONZE,1);g.lineWidth=.32;g.beginPath();g.moveTo(HX,-HY);g.lineTo(hx,-hy);g.stroke();
  g.strokeStyle=css(BRONZE_HI,.6);g.lineWidth=.08;g.stroke();
 }
 if(e.ai==='spent'){hx=HX;hy=e.y+2.6;}
 // While the room turns the tick holds on upright (it is drawn against the turn); on a quarter turn the glass does too,
 // on a half turn it turns over in the tick's grip, which is the point.
 const ta=turnAngle(e,alpha),quarter=e.turnQ===1||e.turnQ===3,S=1.25;
 const body=(fn)=>{g.save();if(ta){g.translate(HX,-HY);g.rotate(ta);g.translate(-HX,HY);}g.translate(HX,-(HY+.15));g.scale(S,S);g.translate(-HX,HY+.15);fn();g.restore();};
 axle(g,e,t,false);
 // On a quarter turn the glass also turns over in the tick's grip (half a turn the way the room goes), so the sand that
 // ran into the low bulb is on top when the room lands, as on a half turn: no pop from bulb to bulb.
 const prog=e.ai==='turn'?smooth((e.aiFrames-e.aiTimer+alpha)/e.aiFrames):0,flip=quarter&&ta?ta-Math.sign(ta)*Math.PI*prog:0;
 const glassNow=()=>hourglass(g,e,hx,hy,t,flash&&e.ai==='open',open,flip,topSand(state,e));
 // The lowered bulb is drawn in front of the tick (it is the thing to hit); at rest the glass sits behind the carapace.
 if(open<=0)glassNow();
 if(e.ai!=='spent')body(()=>tick(g,e,t,flash&&e.ai!=='open',wake));
 else{g.save();g.translate(0,-(e.y+1.2-HY));body(()=>tick(g,e,t,flash,.3));g.restore();}
 if(open>0)glassNow();
 axle(g,e,t,true);
 // The forelegs, last: the Sand Lash reads on top of everything but the hunter.
 for(const side of [-1,1]){
  const f=foreleg(e,side,t,alpha);
  limb(g,f.sx,f.sy,f.kx,f.ky,f.tx,f.ty,.3,true,flash&&e.ai!=='open');
  if(f.ring>0){
   // Parryable: the ivory flash ring at the spear tip, tightening as the strike comes.
   const r=.55+.9*(1-f.ring);
   g.strokeStyle=css(P.ivory,.45+.55*f.ring);g.lineWidth=.08;g.beginPath();g.arc(f.tx,-f.ty,r,0,TAU);g.stroke();
   add(g,'#fff6e4',f.tx,f.ty,.9+.6*f.ring,.65*f.ring);
   if(Math.floor(t/4)%2){g.strokeStyle=css(P.ivory,.8);g.lineWidth=.03;g.beginPath();g.arc(f.tx,-f.ty,r*1.35,0,TAU);g.stroke();}
  }
  if(f.amber){
   // A jammed leg: the bare amber joint.
   const p=.5+.5*Math.sin(t*.4),left=1-e.openDamage/(e.maxMask*e.openCap);
   add(g,P.amber,f.kx,f.ky,1.3+.3*p,.9*left);add(g,P.amberHot,f.kx,f.ky,.6,.8*left);
   g.fillStyle=css(P.amberHot,.9*left);g.beginPath();g.arc(f.kx,-f.ky,.26,0,TAU);g.fill();
  }
 }
 // Where a lash will land: a faint ivory scuff on the floor once it is locked.
 const a=e.act;
 if(a?.id==='lash'&&a.stage==='tell'&&a.t<=a.frames*M.lash.lock){g.strokeStyle=css(P.ivory,.35);g.lineWidth=.05;g.beginPath();g.ellipse(a.x,-a.y,.6,.12,0,0,TAU);g.stroke();}
 turnCue(g,e,t,alpha);
}
function death(g,state,e){
 // The break: the hourglass bursts into amber dust, the tick falls still, a cyan larva tumbles out of the glass.
 let d=deaths.get(e);if(!d){d={t0:clock(),shards:[]};const r=seeded('anchorite-death');for(let i=0;i<36;i++)d.shards.push({a:r()*TAU,v:2+r()*6,s:.1+r()*.3,spin:r()*8-4,c:r()<.6?P.amber:r()<.5?P.cyanHot:P.bone});deaths.set(e,d);}
 const T=clock()-d.t0,x=HX,y=e.y+1.4,floor=1+(e.bed||0);
 // It falls from where it died (the hub, or already on the floor when spent) onto the floor, at its live scale.
 const off=lerp(e.y<HY-3?e.y+1.2-HY:0,floor+1.2-HY,smooth(Math.min(1,T*2)));
 g.save();g.translate(0,-off);g.translate(HX,-(HY+.15));g.scale(1.25,1.25);g.translate(-HX,HY+.15);tick(g,e,0,false,Math.max(0,1-T));g.restore();
 add(g,P.amber,x,y,3+T*6,Math.max(0,1-T*.5));add(g,P.amberHot,x,y,1.5+T*2,Math.max(0,1-T));
 for(const s of d.shards){
  const k=Math.min(T,2.2),sx=x+Math.cos(s.a)*s.v*k*.6,sy=y+Math.sin(s.a)*s.v*k*.6-2.5*k*k*.5;
  if(sy<floor)continue;
  g.save();g.translate(sx,-sy);g.rotate(s.spin*k);g.fillStyle=css(s.c,Math.max(0,1-T*.35));g.fillRect(-s.s/2,-s.s/4,s.s,s.s/2);g.restore();
 }
 // The larva: a small cyan grub crawling toward the chest.
 const lx=x+Math.min(3,Math.max(0,T-.8)*.8),ly=floor+.12;
 if(T>.6){add(g,P.cyan,lx,ly,.5,.7);g.fillStyle=css(P.cyanHot,.95);for(let i=0;i<4;i++){g.beginPath();g.arc(lx-i*.12,-(ly+Math.abs(Math.sin(T*6-i))*.04),.07-i*.01,0,TAU);g.fill();}}
}

// ---- Hazards in front, then the casing ----
function ribs(g,e,frame){
 const a=e.act;
 if(a?.id==='ribs'){
  // The wall the ribs come out of glows cold cyan for the whole volley.
  const wx=a.side<0?L:R,k=a.stage==='tell'?1-a.t/a.frames:1,y=1+e.bed;
  add(g,P.cyan,wx,y+.6,1.2+.6*k,.5+.4*k);
  g.fillStyle=css(P.cyanHot,.5+.4*k);g.fillRect(wx-(a.side<0?0:.12),-(y+1.4),.12,1.4);
 }
 for(const r of e.ribs){
  // A curved rib of bone sheathed in cyan: it runs the floor; jump it.
  g.save();g.translate(r.x,-r.y);g.scale(-r.dir,1);
  add(g,P.cyan,0,.5,.9,.5);
  g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.cyan,1);g.lineWidth=.06;
  g.beginPath();g.moveTo(-.25,0);g.quadraticCurveTo(-.32,-.7,.08,-1);g.quadraticCurveTo(.0,-.55,.25,0);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.cyan,.35);g.lineWidth=.12;g.beginPath();g.moveTo(.3,-.15);g.lineTo(1.4,-.15);g.stroke();
  g.restore();
 }
}
function cages(g,e,frame){
 for(const c of e.cages){
  if(!c.falling){
   // Dust trickles from the ceiling first, and the relic's cyan glint shows where it will fall.
   const k=clamp(1-c.warn/36);
   g.fillStyle=css(P.ash,.15+.35*k);
   for(let i=0;i<6;i++){const yy=N-1-((frame*.06+i/6)%1)*(N-2-e.bed)*k;g.fillRect(c.x-.4+i*.16,-yy,.05,.2);}
   g.fillStyle=css(P.ash,.08+.12*k);g.fillRect(c.x-.55,-(N-1),1.1,N-2-e.bed);
   add(g,P.cyan,c.x,N-1.4,.6+.4*k,.3+.5*k);
  }else cage(g,c.x,c.y,M.drop.size,frame);
 }
}
function pour(g,e,frame,alpha){
 const a=e.act;if(a?.id!=='pour')return;
 const dir=(ang)=>{const r=ang/1000*Math.PI/180;return [Math.sin(r),-Math.cos(r)];};
 const len=(dx,dy)=>{let l=99;if(dx>1e-6)l=Math.min(l,(R-HX)/dx);else if(dx<-1e-6)l=Math.min(l,(L-HX)/dx);if(dy<-1e-6)l=Math.min(l,(HY-1-e.bed)/-dy);return l;};
 const n0=M.pour.neck;
 if(a.stage==='tell'){
  // The aim: a dotted cyan thread from the bulb's neck along the start of the sweep.
  const [dx,dy]=dir(a.ang),l=len(dx,dy),k=1-a.t/a.frames;
  g.strokeStyle=css(P.cyan,.3+.5*k);g.lineWidth=.04+.04*k;g.setLineDash?.([.25,.18]);g.beginPath();g.moveTo(HX+dx*n0,-(HY+dy*n0));g.lineTo(HX+dx*l,-(HY+dy*l));g.stroke();g.setLineDash?.([]);
  add(g,P.cyan,HX+dx*n0,HY+dy*n0,.8+k,.6);
  return;
 }
 // The sweep: a beam of cyan-lit sand from the neck to the walls or the floor, spraying where it lands.
 const ang=a.ang+a.om*alpha,[dx,dy]=dir(ang),l=len(dx,dy),x0=HX+dx*n0,y0=HY+dy*n0,x1=HX+dx*l,y1=HY+dy*l;
 g.lineCap='round';g.globalCompositeOperation='lighter';
 for(const [w,c,al] of [[M.pour.width*3.2,P.cyanDeep,.35],[M.pour.width*2,P.cyan,.55],[M.pour.width*.8,P.cyanHot,.9]]){g.strokeStyle=css(c,al);g.lineWidth=w;g.beginPath();g.moveTo(x0,-y0);g.lineTo(x1,-y1);g.stroke();}
 g.globalCompositeOperation='source-over';
 g.fillStyle=css(SAND_HI,.9);
 for(let i=0;i<14;i++){const q=((frame*.09+i/14)%1),j=Math.sin(i*12.9)*.12;g.fillRect(lerp(x0,x1,q)-dy*j,-(lerp(y0,y1,q)+dx*j),.06,.06);}
 add(g,P.cyan,x1,y1,1.2,.8);
 for(let i=0;i<6;i++){const s=Math.sin(frame*.7+i*2.1);g.fillStyle=css(i%2?SAND_HI:P.cyanHot,.8);g.fillRect(x1+s*.5,-(y1+Math.abs(Math.cos(frame*.5+i))*.5),.07,.07);}
}
function casing(g,e,frame,k){
 // The bronze casing of the drum: everything outside the chamber, a ring of rivets, bone ribs and great chains.
 if(k<=0)return;
 g.globalAlpha=k;
 g.fillStyle='#0a0609';g.beginPath();g.rect(X0-60,-(N+60),N+120,N+120);g.rect(X0,-N,N,N);g.fill('evenodd');
 const ring=g.createRadialGradient(CX,-CY,N*.5,CX,-CY,N*.95);ring.addColorStop(0,'#3a2414');ring.addColorStop(.35,'#22140c');ring.addColorStop(1,'rgba(10,6,9,0)');
 g.fillStyle=ring;g.beginPath();g.arc(CX,-CY,N*.95,0,TAU);g.rect(X0,-N,N,N);g.fill('evenodd');
 g.strokeStyle=css(BRONZE,1);g.lineWidth=.5;g.beginPath();g.arc(CX,-CY,N*.72,0,TAU);g.stroke();
 g.strokeStyle=css(BRONZE_HI,.45);g.lineWidth=.08;g.beginPath();g.arc(CX,-CY,N*.72+.2,0,TAU);g.stroke();
 g.fillStyle=css(BRONZE_HI,.7);for(let i=0;i<40;i++){const a=i/40*TAU;g.beginPath();g.arc(CX+Math.cos(a)*N*.72,-CY+Math.sin(a)*N*.72,.09,0,TAU);g.fill();}
 // Bone buttresses at the corners and amber seams in the casing.
 g.strokeStyle=css(P.boneShade,.65);g.lineWidth=.35;g.lineCap='round';
 for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){g.beginPath();g.moveTo(CX+sx*N*.5,-(CY+sy*N*.5));g.lineTo(CX+sx*N*.8,-(CY+sy*N*.8));g.stroke();}
 g.strokeStyle=css(P.amberDeep,.5);g.lineWidth=.05;
 for(let i=0;i<8;i++){const a=i/8*TAU+.3;g.beginPath();g.moveTo(CX+Math.cos(a)*N*.62,-CY+Math.sin(a)*N*.62);g.lineTo(CX+Math.cos(a+.05)*N*.86,-CY+Math.sin(a+.05)*N*.86);g.stroke();}
 g.globalAlpha=1;
}
export function drawAnchoriteFront(g,state,frame,alpha){
 const e=bossOf(state),t=frame+alpha;
 if(e&&!e.dead){sinking(g,state,e,t,alpha);ribs(g,e,t);cages(g,e,t);pour(g,e,t,alpha);}
 const k=e?(e.sealed||e.dead?1:.4):0;
 casing(g,e,t,k);
 g.restore();
 // Desperation and the turn: the drum dims at its edges (render only).
 if(e&&!e.dead&&(e.glass||e.ai==='turn')&&g.canvas){
  const W=g.canvas.width,H=g.canvas.height;g.save();g.setTransform(1,0,0,1,0,0);
  const v=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.85);v.addColorStop(0,'rgba(4,2,6,0)');v.addColorStop(1,`rgba(4,2,6,${e.glass?.55+.1*Math.sin(t*.1):.35})`);
  g.fillStyle=v;g.fillRect(0,0,W,H);g.restore();
 }
}
