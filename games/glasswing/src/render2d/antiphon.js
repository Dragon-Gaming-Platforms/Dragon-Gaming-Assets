import {ANTIPHON as A} from '../data/antiphon.js';
import {css,P,mix} from './color.js';
import {glow,surface,seeded} from './surface.js';

// The Drowned Antiphon and the Scale Mere, drawn procedurally (render only; it reads simulation state). World units,
// y up (canvas y = -y). Above the waterline kneels the misted husk; the lower half of the screen is the mere's
// reflection, where the true six-armed choir-saint stands upside down. Only the saint shows which arms are real.
const TAU=Math.PI*2,L=1,SQ=.72,M=A.moves;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,ease=t=>t*t*(3-2*t),out=t=>1-(1-t)*(1-t)*(1-t);
// A telling hand reaches its lane in the first 40% of the tell (at least 5 frames), then holds there and counts down:
// the lane is readable for most of the tell, even at the 14f MASTER tier.
const reach=(t,T)=>out(clamp(t/Math.max(5,T*.4)));
// P2 -> P3: the husk sings each transition hymn for its tell (A.transSongs).
const transSong=e=>e.ai==='transition'&&e.phase===3&&A.transSongs.some(k=>e.trans>=k-M.sing.tell&&e.trans<k);
const MIST='#cfdbe4',SILVER='#c9d2dc',DEEP='#07060f';
// Shoulders, left to right (lane i belongs to shoulder i): x offset and height on each body.
const HUSK_SH=[[-1.15,3.35],[-.95,3.7],[-.7,4],[.7,4],[.95,3.7],[1.15,3.35]];
const SAINT_SH=[[-.62,3.55],[-.55,3.95],[-.45,4.35],[.45,4.35],[.55,3.95],[.62,3.55]];

// No floor under the line: the reflection is drawn in screen space, so even a portrait screen keeps the line mid-height.
export function mereFocus(e,f){f.left=A.arenaLeft;f.right=A.right;f.bottom=-2.3;f.top=6.6;f.ground=-1e3;return f;}
const tx=(e,alpha)=>e.hpx+(e.hx-e.hpx)*alpha;

// Two-bone limb from a shoulder to a hand; the elbow bends to the given side.
function elbow(sx,sy,hx,hy,l1,l2,bend){
 const dx=hx-sx,dy=hy-sy,d=Math.max(.01,Math.min(l1+l2-.01,Math.hypot(dx,dy))),a=Math.atan2(dy,dx);
 const c=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),b=Math.acos(c);
 // The elbow always rides above the hand (arms reach down onto the ice, never fold through the waterline).
 const y1=sy+Math.sin(a+b)*l1,y2=sy+Math.sin(a-b)*l1;
 return y1>=y2?[sx+Math.cos(a+b)*l1,y1]:[sx+Math.cos(a-b)*l1,y2];
}
function taper(g,x0,y0,x1,y1,w0,w1){
 const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);
 g.beginPath();g.moveTo(x0+nx*w0,-(y0+ny*w0));g.lineTo(x1+nx*w1,-(y1+ny*w1));g.arc(x1,-y1,w1,-a+Math.PI/2,-a-Math.PI/2,true);
 g.lineTo(x0-nx*w0,-(y0-ny*w0));g.arc(x0,-y0,w0,-a-Math.PI/2,-a+Math.PI/2,true);g.closePath();
}
function add(g,color,x,y,r,a){const sp=glow(color);if(!sp||a<=0)return;g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
// One arm. look: 'mist' (the husk's: no truth in it), 'true' (the saint's), with a glow ('cyan' unparryable, 'ivory'
// parryable, 'amber' an exposed joint) of strength k.
function arm(g,sx,sy,hx,hy,look,lit,k,frame,i,bend=1){
 const d=Math.hypot(hx-sx,hy-sy),l=Math.max(1.6,d*.58),[ex,ey]=elbow(sx,sy,hx,hy,l,l,bend);
 const mist=look==='mist',w=mist?.2:.17;
 if(mist){
  const on=k>0||lit===null&&hy>3.2?1:.45;
  g.fillStyle=css(MIST,(.34+.12*Math.sin(frame*.07+i))*on);taper(g,sx,sy,ex,ey,w*1.5,w*1.1);g.fill();taper(g,ex,ey,hx,hy,w*1.1,w*.6);g.fill();
  g.fillStyle=css('#ffffff',.22*on);taper(g,sx,sy,ex,ey,w*.55,w*.4);g.fill();taper(g,ex,ey,hx,hy,w*.4,w*.25);g.fill();
  add(g,'#dfe8f0',ex,ey,.55,.18);add(g,'#dfe8f0',hx,hy,.6,.22);
 }else{
  g.fillStyle=css(P.furDeep,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
  taper(g,sx,sy,ex,ey,w*1.2,w*.9);g.fill();g.stroke();taper(g,ex,ey,hx,hy,w*.9,w*.55);g.fill();g.stroke();
  // Bone bracers on the forearm, a joint stone at the elbow.
  g.fillStyle=css(P.boneShade,1);const bx=lerp(ex,hx,.45),by=lerp(ey,hy,.45);taper(g,lerp(ex,hx,.25),lerp(ey,hy,.25),bx,by,w*.75,w*.6);g.fill();
  g.fillStyle=lit==='amber'?css(P.amberHot,1):css(mix(P.fur,P.cyanDeep,.5),1);g.beginPath();g.arc(ex,-ey,w*.75,0,TAU);g.fill();
 }
 // The hand: four long fingers spread from the wrist.
 const a=Math.atan2(hy-ey,hx-ex);
 g.strokeStyle=mist?css(MIST,.3):css(P.boneShade,1);g.lineWidth=mist?.09:.06;g.lineCap='round';
 for(let f=-1.5;f<=1.5;f+=1){const fa=a+f*.32;g.beginPath();g.moveTo(hx,-hy);g.lineTo(hx+Math.cos(fa)*.55,-(hy+Math.sin(fa)*.55));g.stroke();}
 if(lit&&k>0){
  const c=lit==='cyan'?P.cyan:lit==='ivory'?P.ivory:P.amber;
  add(g,c,hx,hy,.8+.9*k,.35+.6*k);add(g,c,ex,ey,.5+.4*k,.25*k);
  if(lit!=='amber'){g.globalCompositeOperation='lighter';g.strokeStyle=css(c,.25+.5*k);g.lineWidth=.06;taper(g,ex,ey,hx,hy,.08,.05);g.stroke();g.globalCompositeOperation='source-over';}
  if(lit==='amber'){add(g,P.amber,sx,sy,.6,.5);add(g,P.amberHot,lerp(ex,hx,.5),lerp(ey,hy,.5),.45,.6+.3*Math.sin(frame*.3));}
 }
}
function beam(g,x,half,top,c,q){
 g.globalCompositeOperation='lighter';
 const gr=g.createLinearGradient(0,-top,0,-L);gr.addColorStop(0,css(c,0));gr.addColorStop(.7,css(c,.35*q));gr.addColorStop(1,css('#ffffff',.85*q));
 g.fillStyle=gr;g.beginPath();g.moveTo(x-half*.25,-top);g.lineTo(x+half*.25,-top);g.lineTo(x+half,-L);g.lineTo(x-half,-L);g.closePath();g.fill();
 g.globalCompositeOperation='source-over';
}
function ring(g,x,y,r,color,a,w=.06){g.strokeStyle=css(color,a);g.lineWidth=w;g.beginPath();g.arc(x,-y,r,0,TAU);g.stroke();}

// The six hand targets of the current action for one body (truth: the saint; else the husk, which raises all six).
function pose(e,saint,frame,alpha,bx){
 const out=[],a=e.act,t=a?a.t+alpha:0,sh=saint?SAINT_SH:HUSK_SH;
 for(let i=0;i<6;i++){
  const [ox,oy]=sh[i],s=Math.sign(ox),sw=Math.sin(frame*.03+i*1.7)*.12;
  // Rest: the husk folds its arms in prayer; the saint holds them in a fan about its halo.
  out.push(saint?{x:bx+ox+s*(1.3+(i%3)*.35),y:oy+1.4-(i%3)*.9+sw,lit:null,k:0}:{x:bx+s*(.35+(2-Math.abs(i-2.5)+.5)*.12),y:2.6+Math.abs(i-2.5)*.25+sw,lit:null,k:0});
 }
 if(!a||e.ai!=='act'&&!(e.ai==='transition'&&a))return out;
 if(a.id==='hands')for(let i=0;i<6;i++){
  const arm=a.arms[i],o=out[i];
  if(saint&&!arm.real)continue;
  const at=saint?arm.at:a.frames,k=M.hands.active;
  if(t<at){const q=ease(clamp(t/Math.min(at,a.frames)));o.x=lerp(o.x,arm.x,reach(t,Math.min(at,a.frames)));o.y=lerp(o.y,(saint?L+3.4:L+5.6-Math.abs(i-2.5)*.3)+Math.sin(frame*.2+i)*.08,q);
   if(saint){o.lit=arm.ivory&&at-t<22?'ivory':'cyan';o.k=clamp(.3+.7*(1-(at-t)/at));o.count=(at-t)/at;}}
  else if(t<at+k){o.x=arm.x;o.y=L+.15;if(saint){o.lit=arm.ivory?'ivory':'cyan';o.k=1;}}
  else{const q=ease(clamp((t-at-k)/14));o.x=lerp(arm.x,o.x,q);o.y=lerp(L+.2,o.y,q);}
 }else if(a.id==='grasp'){
  // The husk raises nothing here (its three hands rise from the ice); the saint reaches the real one up from below.
  if(saint){const x=a.xs[a.real];out.grasp={x,y:t<a.frames?L+5.4-4.6*ease(clamp(t/a.frames)):L+.4,k:clamp(t/a.frames)};}
 }else if(a.id==='fan'){
  const g0=a.gx-M.fan.gap/2,g1=a.gx+M.fan.gap/2;
  for(let i=0;i<6;i++){
   const o=out[i],side=i<3,u=(i%3+.5)/3,x=side?lerp(A.arenaLeft+.8,g0-.5,u):lerp(g1+.5,A.right-.8,u),q=ease(clamp(t/a.frames));
   if(t<a.frames){o.x=lerp(o.x,x,reach(t,a.frames));o.y=lerp(o.y,L+2.4,q);}else if(t<a.frames+M.fan.active){o.x=x;o.y=L+.9;}else{o.x=x;o.y=L+.9+.1*(t-a.frames);}
   if(saint||e.side<0){o.lit='cyan';o.k=clamp(t/a.frames);}
  }
 }else if(a.id==='hold'){
  const o=out[3],q=ease(clamp(t/a.lift));o.x=lerp(o.x,a.x,q);o.y=t<a.frames?lerp(o.y,L+2.9,q):L+.6;
  if(saint||e.side<0){o.lit=t>=a.lift?'ivory':'cyan';o.k=t>=a.lift?1:clamp(t/a.lift)*.6;}
 }else if(a.id==='lunge'){
  const d=a.dir||1;for(let i=0;i<6;i++){const o=out[i];o.x=bx+(i<3?-1:1)*.6-d*(t<a.frames?1.2*ease(clamp(t/a.frames)):-.8);o.y=3.2-Math.abs(i-2.5)*.3;if(saint||e.side<0){o.lit='cyan';o.k=clamp(t/a.frames);}}
 }else if(a.id==='hymn'){
  for(let i=0;i<6;i++){const o=out[i],s=i<3?-1:1;o.x=bx+s*(1.2+(i%3)*.5);o.y=4.6+(i%3)*.4;}
 }
 return out;
}

// The kneeling husk: ivory robes pooled on the water, a hood, a veil of shed scales over a face kept in the dark.
function husk(g,e,bx,frame,alpha,dim){
 const fl=e.flash>0,veilOpen=e.ai==='open'&&e.openKind==='veil',sing=e.act?.id==='hymn'&&e.act.t<e.act.frames||e.song||transSong(e);
 const rise=e.ai==='enter'?ease(1-e.aiTimer/e.aiFrames):1,y0=L-5*(1-rise),spent=e.ai==='spent'?1:0;
 g.save();g.translate(0,-(y0-L));
 if(spent)g.translate(0,1.2);
 // Mist around the hem.
 for(let i=0;i<7;i++){const mx=bx+(i-3)*.75+Math.sin(frame*.02+i)*.3;add(g,'#bcd0dc',mx,L+.35+Math.sin(frame*.03+i*2)*.15,1.1,.18*dim);}
 const gr=g.createLinearGradient(bx-2,0,bx+2,0);
 gr.addColorStop(0,P.boneDark);gr.addColorStop(.3,P.boneShade);gr.addColorStop(.55,P.bone);gr.addColorStop(1,P.boneDark);
 g.fillStyle=fl?P.ivory:gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.07;
 g.beginPath();g.moveTo(bx-2.1,-L);
 g.bezierCurveTo(bx-1.9,-(L+1.4),bx-1.5,-(L+2.6),bx-1.25,-(L+3.4));g.quadraticCurveTo(bx-1,-(L+4.6),bx-.4,-(L+5.4));
 g.quadraticCurveTo(bx,-(L+5.75),bx+.4,-(L+5.4));g.quadraticCurveTo(bx+1,-(L+4.6),bx+1.25,-(L+3.4));
 g.bezierCurveTo(bx+1.5,-(L+2.6),bx+1.9,-(L+1.4),bx+2.1,-L);
 // A tattered hem.
 for(let i=0;i<9;i++){const x=bx+2.1-i*4.2/8;g.lineTo(x-.12,-(L-.12-.08*Math.sin(i*2.3+frame*.04)));g.lineTo(x-.23,-L);}
 g.closePath();g.fill();g.stroke();
 // Robe folds.
 g.strokeStyle=css(P.boneDark,.5);g.lineWidth=.04;
 for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(bx+i*.3,-(L+4.2));g.quadraticCurveTo(bx+i*.55,-(L+2.4),bx+i*.85,-(L+.1));g.stroke();}
 // The hood's mouth and the face behind the veil.
 g.fillStyle=css(DEEP,1);g.beginPath();g.ellipse(bx,-(L+4.35),.62,.85,0,0,TAU);g.fill();
 if(veilOpen||sing){const k=veilOpen?1:.45+.25*Math.sin(frame*.4);add(g,veilOpen?P.amber:P.cyan,bx,L+4.3,1.4*k+.4,.8*k);
  g.fillStyle=css(veilOpen?P.amberHot:P.cyanHot,.85);g.beginPath();g.ellipse(bx,-(L+4.25),.18,.3*k+.05,0,0,TAU);g.fill();}
 if(e.glass||e.ai==='transition'){add(g,P.cyan,bx-.22,L+4.45,.3,.9);add(g,P.cyan,bx+.22,L+4.45,.3,.9);}
 // The veil: strands of shed wing-scales hanging from the hood; shattered while the face is open.
 const r=seeded('veil');
 for(let c=0;c<9;c++){
  const sx0=bx-.5+c*.125,len=4+Math.floor(r()*3),sway=Math.sin(frame*.04+c*.9)*.04;
  for(let row=0;row<len;row++){
   const fall=veilOpen?(e.aiFrames-e.aiTimer+alpha)*.07*(.4+r()):0,rr=r(),shim=.5+.5*Math.sin(frame*.08+row*.9+c*1.7);
   if(veilOpen&&fall>3.5)continue;
   const sx=sx0+sway*row+(rr-.5)*.07+(veilOpen?(rr-.5)*fall*1.5:0),sy=L+5-row*.24-(row*row)*.004-fall;
   g.save();g.translate(sx,-sy);g.rotate((rr-.5)*.5+(veilOpen?fall*(rr-.5)*2:0));
   g.fillStyle=css(mix(SILVER,P.ivory,shim*.6),.55+.4*rr);g.beginPath();g.ellipse(0,0,.055,.1,0,0,TAU);g.fill();
   if(shim>.92)add(g,'#ffffff',0,0,.12,.5);
   g.restore();
  }
 }
 if(sing){ring(g,bx,L+4.3,.9+.25*Math.sin(frame*.5),e.act?.ivory||e.song?.ivory?P.ivory:P.cyan,.6,.07);}
 g.restore();
}
// The true choir-saint: aubergine robes over bone ribs, a long ivory mask, a cold cyan halo; six two-segment arms.
function saint(g,e,bx,frame,alpha,fused){
 const fl=e.flash>0,openFace=e.ai==='open'&&e.openKind==='veil',spent=e.ai==='spent';
 const rise=e.ai==='enter'?ease(1-e.aiTimer/e.aiFrames):1;
 g.save();if(rise<1){g.globalAlpha=rise;}if(spent)g.translate(0,1.4);
 // Halo: a ring of choir spokes.
 const hy=L+5.25,hr=1.35+.05*Math.sin(frame*.05),pulse=e.act?.id==='hymn'||e.song||transSong(e)?.4:0;
 add(g,P.cyan,bx,hy,hr*2.2,.35+pulse);
 g.globalCompositeOperation='lighter';
 ring(g,bx,hy,hr,P.cyan,.75,.08);ring(g,bx,hy,hr*.78,P.cyanHot,.3,.03);
 for(let i=0;i<14;i++){const a=i/14*TAU+frame*.004;g.strokeStyle=css(P.cyan,.35);g.lineWidth=.035;g.beginPath();g.moveTo(bx+Math.cos(a)*hr*.82,-(hy+Math.sin(a)*hr*.82));g.lineTo(bx+Math.cos(a)*hr*1.18,-(hy+Math.sin(a)*hr*1.18));g.stroke();}
 g.globalCompositeOperation='source-over';
 // Robe.
 const gr=g.createLinearGradient(bx-1.2,0,bx+1.2,0);gr.addColorStop(0,P.furDeep);gr.addColorStop(.45,P.fur);gr.addColorStop(.6,P.furLight);gr.addColorStop(1,P.furDeep);
 g.fillStyle=fl?P.ivory:gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.06;
 g.beginPath();g.moveTo(bx-1.3,-L);g.quadraticCurveTo(bx-.8,-(L+1.6),bx-.45,-(L+2.7));g.quadraticCurveTo(bx-.75,-(L+3.6),bx-.6,-(L+4.4));
 g.lineTo(bx-.2,-(L+4.75));g.lineTo(bx+.2,-(L+4.75));g.lineTo(bx+.6,-(L+4.4));g.quadraticCurveTo(bx+.75,-(L+3.6),bx+.45,-(L+2.7));g.quadraticCurveTo(bx+.8,-(L+1.6),bx+1.3,-L);
 for(let i=0;i<7;i++){const x=bx+1.3-i*2.6/6;g.lineTo(x-.1,-(L-.18*(i%2)));}
 g.closePath();g.fill();g.stroke();
 // Bone ribs and the sigil-less chest.
 g.strokeStyle=css(P.bone,.9);g.lineWidth=.07;
 for(let i=0;i<3;i++){const y=L+3.1+i*.38;g.beginPath();g.moveTo(bx-.5+i*.04,-y);g.quadraticCurveTo(bx,-(y+.2),bx+.5-i*.04,-y);g.stroke();}
 g.strokeStyle=css(P.boneShade,.8);g.lineWidth=.05;g.beginPath();g.moveTo(bx,-(L+2.8));g.lineTo(bx,-(L+4.3));g.stroke();
 // The long ivory mask, cyan eye slits (amber when its true face is exposed), spines of a choir crown.
 g.fillStyle=css(P.bone,1);g.beginPath();g.ellipse(bx,-(L+5.2),.36,.62,0,0,TAU);g.fill();g.stroke();
 g.strokeStyle=css(P.boneShade,.9);g.lineWidth=.04;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(bx+i*.1,-(L+5.75));g.lineTo(bx+i*.18,-(L+6.25+(3-Math.abs(i))*.08));g.stroke();}
 const eye=openFace||spent?P.amberHot:P.cyanHot;
 g.fillStyle=css(eye,1);for(const s of [-1,1]){g.beginPath();g.ellipse(bx+s*.14,-(L+5.28),.09,.035,s*.3,0,TAU);g.fill();add(g,openFace?P.amber:P.cyan,bx+s*.14,L+5.28,.28,.8);}
 if(openFace)add(g,P.amber,bx,L+5,1.3,.8);
 if(fused)add(g,'#ffffff',bx,L+3,2.4,.12+.08*Math.sin(frame*.3));
 g.restore();
}
function drawArms(g,e,isSaint,bx,frame,alpha,look){
 const ps=pose(e,isSaint,frame,alpha,bx),sh=isSaint?SAINT_SH:HUSK_SH,open=e.ai==='open'&&e.openKind!=='veil';
 for(let i=0;i<6;i++){
  const o=ps[i],[ox,oy]=sh[i],sx=bx+ox,sy=L+oy,bend=ox<0?-1:1;
  arm(g,sx,sy,o.x,o.y,look,o.lit,o.k,frame,i,o.y<sy?-bend:bend);
  // A countdown ring closes on a real hand as its beat comes (the delayed beats read in the mirror).
  if(o.count!==undefined&&o.count>0){g.globalCompositeOperation='lighter';ring(g,o.x,o.y,.45+o.count*1.6,o.lit==='ivory'?P.ivory:P.cyan,.25+.5*(1-o.count),.05);g.globalCompositeOperation='source-over';}
 }
 if(ps.grasp){const q=ps.grasp;arm(g,q.x+.25,L+8,q.x,q.y,'true','cyan',.4+.6*q.k,frame,8,1);g.globalCompositeOperation='lighter';ring(g,q.x,q.y,.4+(1-q.k)*1.4,P.cyan,.3+.5*q.k,.05);g.globalCompositeOperation='source-over';}
 if(open&&isSaint){const t=(e.aiFrames-e.aiTimer+alpha);arm(g,bx+.5,L+3.9,e.ox,L+.3+.2*Math.sin(t*.2),'true','amber',1,frame,6);}
}
// The Choir Lunge dives: the body sinks through the line in its tell and skims with only its crown above the ice
// (the lunge's low hitbox: the husk's hood and the saint's halo stay about 1.1 tiles above the ice), then rises again.
function sink(e,alpha,which){
 const a=e.act;if(!a||a.id!=='lunge'||e.ai!=='act')return 0;
 const t=a.t+alpha;return (which==='saint'?5.75:4.65)*ease(clamp(a.stage!=='after'?t/a.frames:(a.end-t)/M.lunge.after));
}
function figure(g,e,which,frame,alpha,arms=true){
 const bx=tx(e,alpha),dim=e.ai==='enter'?ease(1-e.aiTimer/e.aiFrames):1;
 g.save();g.translate(0,sink(e,alpha,which));
 if(which==='saint'){drawArms(g,e,true,bx,frame,alpha,'true');saint(g,e,bx,frame,alpha,e.glass);}
 else{husk(g,e,bx,frame,alpha,dim);if(arms)drawArms(g,e,false,bx,frame,alpha,'mist');if(e.glass&&e.ai!=='fuse'){g.translate(0,sink(e,alpha,'saint')-sink(e,alpha,'husk'));saint(g,e,bx,frame,alpha,true);}}
 g.restore();
}
const fade=(g,e,frame)=>{if(e.dead){const q=clamp((frame-e.defeatedFrame)/120);g.globalAlpha=1-q;g.translate(0,q*3);}};

// The world above the line: the figure on this side (husk; the saint while the hunter stands on the true side, P2).
// The husk's misted arms are drawn after the reflection (drawMereOver), so the mere never mirrors its lies.
export function drawAntiphon(g,state,e,frame,alpha){
 if(e.dead&&frame-e.defeatedFrame>120)return;
 g.save();fade(g,e,frame);
 figure(g,e,e.side>0?'husk':'saint',frame,alpha,e.side<0);
 g.restore();
}

// Backdrop: the dead compound eye over a silver and aubergine mere, distant wing-scale ridges, drifting scale motes.
let eyeCache=null;
function eyeSurface(R){
 if(eyeCache&&eyeCache.R===R)return eyeCache.c;
 const c=surface(R*2,R*2),g=c?.getContext('2d');if(!g)return null;
 const cg=g.createRadialGradient(R*.8,R*.7,R*.1,R,R,R);cg.addColorStop(0,'#5a5466');cg.addColorStop(.6,'#2b2436');cg.addColorStop(1,'#120c18');
 g.fillStyle=cg;g.beginPath();g.arc(R,R,R,0,TAU);g.fill();
 g.save();g.beginPath();g.arc(R,R,R*.98,0,TAU);g.clip();
 const h=R/15,r=seeded('ommatidia');
 for(let row=-1;row<34;row++)for(let col=-1;col<38;col++){
  const x=col*h*1.5,y=row*h*1.732+(col%2)*h*.866,d=Math.hypot(x-R,y-R)/R;if(d>1.05)continue;
  const lit=r(),sz=h*(1-d*d*.35)*.95;
  g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g.lineTo(x+Math.cos(a)*sz,y+Math.sin(a)*sz);}g.closePath();
  g.fillStyle=lit>.93?`rgba(255,171,61,${.18+.2*(1-d)})`:`rgba(${150+lit*60|0},${150+lit*55|0},${170+lit*60|0},${.06+.1*(1-d)})`;g.fill();
  g.strokeStyle='rgba(10,6,14,.55)';g.lineWidth=Math.max(1,h*.08);g.stroke();
 }
 g.restore();
 const rim=g.createRadialGradient(R,R,R*.75,R,R,R);rim.addColorStop(0,'rgba(0,0,0,0)');rim.addColorStop(1,'rgba(8,4,12,.85)');g.fillStyle=rim;g.beginPath();g.arc(R,R,R,0,TAU);g.fill();
 eyeCache={R,c};return c;
}
export function drawMereBack(g,W,H,cx,cy,k,frame,state){
 const ly=H/2+(cy-L)*k;
 const sky=g.createLinearGradient(0,0,0,ly);sky.addColorStop(0,'#05030a');sky.addColorStop(.55,'#1a1026');sky.addColorStop(.88,'#3d2f49');sky.addColorStop(1,'#6d6478');
 g.fillStyle=sky;g.fillRect(0,0,W,Math.ceil(ly)+2);
 const R=Math.round(Math.min(H*.36,W*.3)),eye=eyeSurface(R),ex=W*.62-(cx-A.mid)*k*.08,ey=ly*.42;
 if(eye){g.globalAlpha=.78;g.drawImage(eye,ex-R,ey-R);g.globalAlpha=1;}
 // Cold light falling from the eye.
 const sh=g.createLinearGradient(ex,ey,ex,ly);sh.addColorStop(0,'rgba(170,190,215,.10)');sh.addColorStop(1,'rgba(170,190,215,0)');
 g.fillStyle=sh;g.beginPath();g.moveTo(ex-R*.5,ey);g.lineTo(ex+R*.5,ey);g.lineTo(ex+R*1.3,ly);g.lineTo(ex-R*1.3,ly);g.closePath();g.fill();
 // Two ridges of shed wing-scales, like shingles, along the far shore.
 for(const [depth,col,amp] of [[.04,'#2a2134',.16],[.1,'#1a1322',.1]]){
  const off=-(cx-A.mid)*k*depth*2,base=ly-H*amp*.25,r=seeded('ridge'+depth);
  g.fillStyle=col;g.beginPath();g.moveTo(0,ly+1);
  for(let x=-200;x<W+200;x+=H*.06){const hh=H*amp*(.35+r()*.65);g.lineTo(x+off,base-hh*.4);g.quadraticCurveTo(x+off+H*.03,base-hh,x+off+H*.06,base-hh*.4);}
  g.lineTo(W,ly+1);g.closePath();g.fill();
 }
 // Mist on the waterline.
 const mist=g.createLinearGradient(0,ly-H*.12,0,ly);mist.addColorStop(0,'rgba(190,200,215,0)');mist.addColorStop(1,'rgba(190,200,215,.16)');g.fillStyle=mist;g.fillRect(0,ly-H*.12,W,H*.12);
 // Scale motes drifting down, glinting.
 const r=seeded('motes');
 for(let i=0;i<42;i++){
  const sp=.2+r()*.5,x=((r()*W+Math.sin(frame*.01+i)*30-(cx-A.mid)*k*.3)%W+W)%W,y=((r()*ly+frame*sp)%ly),tw=.5+.5*Math.sin(frame*.07+i*3);
  g.fillStyle=`rgba(${215+tw*40|0},${220+tw*30|0},235,${.15+.45*tw})`;g.save();g.translate(x,y);g.rotate(frame*.02+i);g.fillRect(-1.5*H/720,-.6*H/720,3*H/720,1.2*H/720);g.restore();
 }
}

// The waterline pass, after the world is drawn: the mere reflects the upper half (ripples, a cold tint), the other
// figure stands in it, then the causeway ice, holes, hymn waves, grasps, the tilt flood and the turning world.
let buf=null,flipBuf=null;
export function drawMereOver(g,canvas,state,W,H,cx,cy,k,frame,alpha,low){
 const e=(state.enemies||[]).find(x=>x.antiphon&&(!x.dead||frame-x.defeatedFrame<=120));
 const ly=Math.round(H/2+(cy-L)*k),hb=H-ly;
 if(hb<=2)return;
 const src=Math.min(ly,Math.ceil(hb/SQ));
 if(!buf||buf.width!==W||buf.height<src){buf=surface(W,src);}
 const bg=buf?.getContext('2d');
 g.setTransform(1,0,0,1,0,0);
 const water=g.createLinearGradient(0,ly,0,H);water.addColorStop(0,'#2a2238');water.addColorStop(.35,'#120d1c');water.addColorStop(1,'#040308');
 g.fillStyle=water;g.fillRect(0,ly,W,hb);
 const rip=e&&e.ripple>0?clamp(e.ripple/40):0,amp=(2+rip*14)*H/720;
 if(bg){
  bg.globalCompositeOperation='copy';bg.drawImage(canvas,0,ly-src,W,src,0,0,W,src);bg.globalCompositeOperation='source-over';
  g.save();g.setTransform(1,0,0,-SQ,0,ly);g.globalAlpha=.62;
  const step=low?6:3;
  for(let d=0;d<src;d+=step){const off=Math.sin(d*.045+frame*.06)*amp*(.25+d/src)+(rip?Math.sin(d*.13-frame*.21)*amp*.6:0);g.drawImage(buf,0,src-d-step,W,step,off,-(d+step),W,step);}
  g.restore();
 }
 // The truth: the other figure, mirrored into the mere (the saint in P1/P3; the husk while the hunter stands below).
 if(e){
  const bx=tx(e,alpha),sx=W/2+(bx-cx)*k;
  const hide=g.createRadialGradient(sx,ly+2.6*k*SQ,0,sx,ly+2.6*k*SQ,3.4*k);hide.addColorStop(0,'rgba(12,9,20,.9)');hide.addColorStop(1,'rgba(12,9,20,0)');
  g.fillStyle=hide;g.fillRect(sx-3.6*k,ly,7.2*k,Math.min(hb,6*k));
  g.save();g.beginPath();g.rect(0,ly,W,hb);g.clip();g.setTransform(k,0,0,-k*SQ,W/2-cx*k,ly-k*SQ*L);
  if(e.dead){const q=clamp((frame-e.defeatedFrame)/120);g.globalAlpha=1-q;}
  if(rip){g.translate(Math.sin(frame*.25)*.25*rip,0);}
  figure(g,e,e.side>0?'saint':'husk',frame,alpha);
  g.restore();
 }
 // A cold sheen over the reflection, glints on the surface.
 const tint=g.createLinearGradient(0,ly,0,H);tint.addColorStop(0,'rgba(98,240,255,.08)');tint.addColorStop(1,'rgba(30,14,40,.45)');g.fillStyle=tint;g.fillRect(0,ly,W,hb);
 g.globalCompositeOperation='lighter';
 const r=seeded('glints');
 for(let i=0;i<30;i++){const x=(r()*W+frame*(r()-.5)*.6+W*4)%W,y=ly+r()*hb*.8,tw=Math.max(0,Math.sin(frame*.05+i*2.1));g.fillStyle=`rgba(200,230,255,${.25*tw})`;g.fillRect(x,y,(8+r()*26)*H/720,1.2*H/720);}
 g.globalCompositeOperation='source-over';
 // Back to world units for the line itself.
 g.setTransform(k,0,0,k,W/2-cx*k,H/2+cy*k);
 if(e)line(g,state,e,frame,alpha);
 else ice(g,frame,null);
 if(e&&e.side>0){g.save();g.setTransform(1,0,0,1,0,0);g.beginPath();g.rect(0,0,W,ly);g.clip();g.setTransform(k,0,0,k,W/2-cx*k,H/2+cy*k);fade(g,e,frame);g.translate(0,sink(e,alpha,'husk'));drawArms(g,e,false,tx(e,alpha),frame,alpha,'mist');g.restore();}
 g.setTransform(1,0,0,1,0,0);
 // The world turns over as the hunter falls into the reflection (P1 -> P2) and back (P2 -> P3).
 if(e&&e.ai==='transition'&&e.trans>=56&&e.trans<=120)turn(g,canvas,W,H,ly,clamp((e.trans+alpha-64)/48,0,1),e.trans);
 // Desperation: the mere dims around the fused creature.
 if(e&&e.glass&&!e.dead&&e.ai!=='spent'){g.fillStyle=`rgba(4,2,8,${.28+.08*Math.sin(frame*.1)})`;g.fillRect(0,0,W,H);
  g.save();g.beginPath();g.rect(0,0,W,ly);g.clip();
  g.setTransform(k,0,0,k,W/2-cx*k,H/2+cy*k);const bx=tx(e,alpha);add(g,P.cyan,bx,L+3-sink(e,alpha,'saint'),4.5,.25);figure(g,e,'saint',frame,alpha);g.restore();g.setTransform(1,0,0,1,0,0);}
}
function turn(g,canvas,W,H,ly,u,k){
 if(!flipBuf||flipBuf.width!==W||flipBuf.height!==H)flipBuf=surface(W,H);
 const fg=flipBuf?.getContext('2d');if(!fg)return;
 fg.globalCompositeOperation='copy';fg.drawImage(canvas,0,0);
 const c=Math.max(.02,Math.abs(Math.cos(u*Math.PI)));
 g.fillStyle='#05040a';g.fillRect(0,0,W,H);
 g.save();g.translate(0,ly);g.scale(1,c);g.translate(0,-ly);g.drawImage(flipBuf,0,0);g.restore();
 const flash=Math.max(0,1-Math.abs(u-.5)*5);
 if(flash>0){g.fillStyle=`rgba(214,253,255,${flash*.6})`;g.fillRect(0,ly-H*.02*flash-2,W,H*.04*flash+4);}
}
// The causeway of scale-ice right at the waterline.
function ice(g,frame,e){
 const x0=A.arenaLeft-.4,x1=A.right+.4;
 const gr=g.createLinearGradient(0,-L,0,-(L-.32));gr.addColorStop(0,'#e8eef6');gr.addColorStop(.25,'#9fb0c4');gr.addColorStop(1,'#3b3a52');
 g.fillStyle=gr;g.fillRect(x0,-L,x1-x0,.3);
 g.globalCompositeOperation='lighter';g.fillStyle=css(P.cyanHot,.35);g.fillRect(x0,-L-.012,x1-x0,.03);g.globalCompositeOperation='source-over';
 // Overlapping scales on the ice face.
 g.strokeStyle=css('#5b6378',.7);g.lineWidth=.025;
 for(let x=Math.ceil(x0*2)/2;x<x1;x+=.5){g.beginPath();g.arc(x,-(L-.05),.26,.15*Math.PI,.85*Math.PI);g.stroke();}
}
function line(g,state,e,frame,alpha){
 ice(g,frame,e);
 const tilt=e.tilt,T=A.tilt;
 // Ice holes: dark water in a jagged rim; frost closes them as they refreeze.
 for(const h of e.holes){
  const lim=e.ai==='open'&&e.openKind==='limb'&&e.ox===h.x,q=lim?1:clamp(h.t/40),w=.55*q+.05;
  g.fillStyle=css(DEEP,.95);g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=w*(1+.25*Math.sin(i*2.7+h.x));g.lineTo(h.x+Math.cos(a)*rr,-(L-.02+Math.sin(a)*rr*.22));}g.closePath();g.fill();
  g.strokeStyle=css('#e8f4ff',.8);g.lineWidth=.03;
  for(let i=0;i<5;i++){const a=(i/5-.5)*2.2;g.beginPath();g.moveTo(h.x+Math.cos(a)*w,-L);g.lineTo(h.x+Math.cos(a)*(w+.35),-(L+.02));g.stroke();}
  add(g,P.cyan,h.x,L,.5*q,.3);
 }
 // The stuck limb: amber joints through the hole (the weak point).
 if(e.ai==='open'&&e.openKind!=='veil'){
  const t=e.aiFrames-e.aiTimer+alpha,ox=e.ox,limb=e.openKind==='limb',top=limb?L+1.6:L+1.2,q=clamp(e.aiTimer/12);
  g.save();g.globalAlpha=Math.max(.2,q);
  arm(g,ox+(limb?0:-.9),limb?L-.4:L+.3,ox+(limb?.5:1.1),top+Math.sin(t*.25)*.1,'true','amber',1,frame,7,1);
  for(const j of [.35,.7])add(g,P.amberHot,ox+(limb?.25:.3)*j,L+.4+j*(top-L-.4),.55,.75+.25*Math.sin(t*.4+j*4));
  g.restore();
 }
 // Hymn waves: a raised ring of water running along the ice (ivory: the parryable one).
 for(const w of e.waves){
  const x=w.x+w.dir*M.hymn.speed*(w.back?1.25:1)*(alpha-1),c=w.ivory?P.ivory:P.cyan;
  g.fillStyle=css(w.ivory?'#fff6e4':'#8ff4ff',.85);g.beginPath();g.ellipse(x,-L,M.hymn.radius,M.hymn.top-L,0,Math.PI,TAU);g.fill();
  add(g,c,x,L+.3,.9,.75);
  g.globalCompositeOperation='lighter';g.strokeStyle=css(c,.5);g.lineWidth=.04;
  for(let i=1;i<4;i++){g.beginPath();g.ellipse(x-w.dir*i*.32,-(L+.05),.18+i*.08,.1,0,Math.PI,TAU);g.stroke();}
  if(w.ivory){ring(g,x,L+.35,.55+.08*Math.sin(frame*.6),P.ivory,.8,.05);}
  g.globalCompositeOperation='source-over';
 }
 // Grasps: three misted hands rise from the ice (the husk's lie); the real one bursts out cyan at the strike.
 const a=e.act;
 if(a&&a.id==='grasp'&&(e.ai==='act'||e.ai==='transition')){
  const t=a.t+alpha,q=clamp(t/a.frames);
  for(let i=0;i<3;i++){
   const x=a.xs[i];if(e.ai==='transition'&&i!==1)continue;
   if(t<a.frames){g.globalAlpha=.6;arm(g,x,L-.6,x+Math.sin(frame*.1+i)*.15,L+.25+q*.8,'mist',null,0,frame,i);g.globalAlpha=1;}
   else if(i===a.real&&t<a.frames+M.grasp.active+10){const u=clamp((t-a.frames)/4);arm(g,x,L-.5,x+.1,L+.4+(M.grasp.top-L-.4)*u,'true','cyan',1,frame,i);add(g,P.cyanHot,x,L+.4,1.3,.7*(1-clamp((t-a.frames-M.grasp.active)/10)));}
   else if(t<a.frames+12){add(g,MIST,x,L+.6,.8,.3*(1-(t-a.frames)/12));}
  }
 }
 // The beats of the Six-Hand Antiphon land: a cyan (or ivory) impact on its lane; fakes dissolve to mist.
 if(a&&a.id==='hands'&&e.ai==='act'){
  const t=a.t+alpha;
  for(const arm of a.arms){
   if(arm.real&&t>=arm.at&&t<arm.at+M.hands.active+6){const q=1-(t-arm.at)/(M.hands.active+6);add(g,arm.ivory?'#ffffff':P.cyanHot,arm.x,L+.6,1.6*q+.4,.9*q);
    beam(g,arm.x,M.hands.half,M.hands.top,arm.ivory?P.ivory:P.cyan,q);}
   else if(!arm.real&&t>=a.frames&&t<a.frames+14)add(g,MIST,arm.x,L+.8,1,.25*(1-(t-a.frames)/14));
  }
 }
 if(a&&a.id==='fan'&&e.ai==='act'){
  const t=a.t+alpha;
  if(t>=a.frames&&t<a.frames+M.fan.active+6){
   const q=1-(t-a.frames)/(M.fan.active+6),g0=a.gx-M.fan.gap/2,g1=a.gx+M.fan.gap/2;
   g.globalCompositeOperation='lighter';
   for(const [x0,x1] of [[A.arenaLeft,g0],[g1,A.right]]){if(x1<=x0)continue;const gr=g.createLinearGradient(0,-M.fan.top,0,-L);gr.addColorStop(0,css(P.cyan,0));gr.addColorStop(.6,css(P.cyan,.45*q));gr.addColorStop(1,css(P.cyanHot,.8*q));g.fillStyle=gr;g.fillRect(x0,-M.fan.top,x1-x0,M.fan.top-L);}
   g.globalCompositeOperation='source-over';
  }
 }
 if(a&&a.id==='hold'&&e.ai==='act'&&a.t>=a.lift&&a.t<a.frames){const q=(a.t+alpha-a.lift)/M.hold.lift;g.globalCompositeOperation='lighter';ring(g,a.x,(L+M.hold.top)/2,1.1-.5*q,P.ivory,.9,.08);ring(g,a.x,(L+M.hold.top)/2,1.5-.7*q,P.ivory,.4,.04);g.globalCompositeOperation='source-over';}
 // The Choir Lunge skims: a bow wave as tall as its hitbox, spray and a wake behind (jump the crest).
 if(a&&a.id==='lunge'&&e.ai==='act'&&a.t>=a.frames&&a.stage!=='after'){
  const bx=tx(e,alpha),d=a.dir||1,f=bx+d*M.lunge.w/2,h=M.lunge.top;
  g.globalCompositeOperation='lighter';
  const gr=g.createLinearGradient(f,0,bx-d*3.4,0);gr.addColorStop(0,css(P.cyanHot,.6));gr.addColorStop(.35,css(P.cyan,.3));gr.addColorStop(1,css(P.cyan,0));
  g.fillStyle=gr;g.beginPath();g.moveTo(f+d*.25,-L);g.quadraticCurveTo(f+d*.1,-h,f-d*.5,-h);g.quadraticCurveTo(bx-d*1.4,-(L+.5),bx-d*3.4,-L);g.closePath();g.fill();
  for(let i=0;i<5;i++)add(g,'#dff9ff',f-d*(.2+i*.55),L+.2+(h-L-.2)*(1-i/5)*Math.abs(Math.sin(frame*.4+i)),.2,.6);
  g.globalCompositeOperation='source-over';
 }
 // Falling scale shards (P1 -> P2): a trickle of glints marks each one first.
 for(const f of e.shards){
  if(f.t>0){g.fillStyle=css(SILVER,.15+.3*(1-f.t/A.shards.warn));g.fillRect(f.x-.05,-A.shards.top,.1,A.shards.top-L);continue;}
  g.save();g.translate(f.x,-f.y);g.rotate(frame*.3);g.fillStyle=css('#e6eef8',1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;g.beginPath();g.moveTo(0,-.38);g.lineTo(.22,0);g.lineTo(0,.38);g.lineTo(-.22,0);g.closePath();g.fill();g.stroke();g.restore();
  add(g,P.cyan,f.x,f.y,.5,.4);
 }
 // P3: the waterline rocks; where it rises over the causeway, cold water floods it.
 if(tilt&&(tilt.q>0||tilt.t<A.tilt.warn)){
  const q=tilt.q,s=q*T.slope*tilt.dir,y=x=>L+s*(x-A.mid)-T.flood,x0=A.arenaLeft,x1=A.right,wob=tilt.t<T.warn?Math.sin(frame*.4)*.03:0;
  // Only where the line stands over the causeway: that is the flood (exactly where the sim floods it).
  if(Math.abs(s)>1e-4&&y(tilt.dir>0?x1:x0)>L){const xc=clamp(A.mid+T.flood/s,x0,x1),xw=tilt.dir>0?x1:x0;
   g.fillStyle=css(P.cyanDeep,.42);g.beginPath();g.moveTo(xc,-L);g.lineTo(xw,-L);g.lineTo(xw,-y(xw));g.closePath();g.fill();
   g.fillStyle=css(P.cyan,.12);for(let i=0;i<6;i++){const u=(i+.5)/6,x=lerp(xc,xw,u);g.fillRect(x-.02,-y(x),.04,y(x)-L);}}
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyan,.55+.4*q);g.lineWidth=.06+.04*q;g.beginPath();g.moveTo(x0,-y(x0)-wob);g.lineTo(x1,-y(x1)+wob);g.stroke();
  if(Math.abs(s)>1e-4){const fx=A.mid+T.flood/s;if(fx>x0&&fx<x1)add(g,P.cyanHot,fx,L+.3,.7,.5);}
  g.globalCompositeOperation='source-over';
 }
 // P1 -> P2: cracks race across the ice before it shatters.
 if(e.ai==='transition'&&e.phase===2&&e.trans<64){const q=clamp((e.trans-20)/44);g.strokeStyle=css('#e8f4ff',.8);g.lineWidth=.035;const r=seeded('cracks');for(let i=0;i<14;i++){const x=A.arenaLeft+r()*(A.right-A.arenaLeft),len=q*(.6+r()*1.6);g.beginPath();g.moveTo(x,-L);g.lineTo(x+len*.5,-(L-.05));g.lineTo(x+len,-(L+.02));g.stroke();}}
}
