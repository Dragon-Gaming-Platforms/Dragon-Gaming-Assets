import {CORDYCEA as C} from '../data/cordycea.js';
import {css,mix,P} from './color.js';
import {glow} from './surface.js';

// Cordycea, Who Wears the Dead, drawn procedurally in world units (y up, canvas y = -y): the Mycelial Garden behind the
// tiles (dead moths standing with fruiting stalks, hyphae curtains, the floor mat), then the fungal crown on its trunk,
// the sockets' stalks and caps, the risen dead and every telegraph. Grammar: cyan = never parryable (stalks, lashes,
// roots, spores), an ivory flash ring = the risen's parryable slam, amber = the open gills and the heart inside.
const TAU=Math.PI*2,K=C.crown,lerp=(a,b,t)=>a+(b-a)*t,clamp01=t=>t<0?0:t>1?1:t;
const ease=t=>1-(1-t)*(1-t)*(1-t);
const MOTHS=[[42.2,.9,0],[45.4,1.15,1],[48.6,.8,2],[55.6,1.05,3],[58.4,.95,4],[51.8,.7,5]];
const view={crown:null,seen:new WeakMap()};
const add=g=>{g.globalCompositeOperation='lighter';},norm=g=>{g.globalCompositeOperation='source-over';g.globalAlpha=1;};
function spot(g,color,x,y,r,a=1){const sp=glow(color);if(!sp||r<=0||a<=0)return;g.globalAlpha=Math.min(1,a);g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;}

export const crownOf=state=>{for(const e of state.enemies||[])if(e.crown)return e;return null;};
// Killed: the crown's bloom (the sim's dying hold) and after.
const gone=e=>e.dead||e.ai==='dying';
// Render-only framing: the crown and the whole grove stay in view with the hunter.
export function gardenFocus(state,f){
 const e=crownOf(state);if(!e||gone(e)&&state.frame-e.defeatedFrame>240)return null;
 f.left=C.arenaLeft;f.right=C.right;f.bottom=1;f.top=Math.min(14.4,Math.max(8,e.y+e.h+.5));return f;
}
// The garden's dimming: the last fruiting, then the dark after the death.
export function gardenDim(state){
 const e=crownOf(state);if(!e)return 0;
 if(gone(e))return Math.min(.5,(state.frame-e.defeatedFrame)/240);
 return e.glass&&e.ai!=='spent'?.28+.08*Math.sin((state.frame||0)*.1):0;
}

// Behind the tiles: the grove itself.
export function drawGardenBack(g,state,frame){
 if(!state.level?.garden)return;
 const e=crownOf(state),dead=e&&gone(e)?clamp01((frame-e.defeatedFrame)/120):0,mat=e?e.phase>=2?1:.35:.3;
 // Hyphae curtains from the vault.
 g.lineCap='round';
 for(let i=0;i<26;i++){
  const x=C.arenaLeft+.4+i*.76+Math.sin(i*7.3)*.3,len=2.4+((i*37)%11)*.38,sw=Math.sin(frame*.012+i)*.12;
  g.strokeStyle=css(i%3?P.boneShade:P.cyanDeep,.16+.1*(i%2));g.lineWidth=.035+(i%4)*.012;
  g.beginPath();g.moveTo(x,-15.2);g.quadraticCurveTo(x+sw,-(15.2-len*.5),x+sw*1.6,-(15.2-len));g.stroke();
  if(i%3===0)spot(g,P.cyan,x+sw*1.6,15.2-len,.22,.35*(1-dead));
 }
 // The dead lesser moths standing where they died, fruiting stalks from their heads.
 for(const [x,s,k] of MOTHS){
  const fall=dead*clamp01(dead*1.6-k*.12),tilt=fall*(k%2?1.35:-1.35);
  g.save();g.translate(x,-1);g.rotate(tilt);g.scale(s,s);
  g.fillStyle=css(mix(P.furDeep,P.ink,.45),.92);
  g.beginPath();g.moveTo(-.55,0);g.bezierCurveTo(-.7,-1.2,-.45,-2.3,-.1,-2.6);g.bezierCurveTo(.35,-2.5,.6,-1.3,.5,0);g.closePath();g.fill();
  // Folded wings, ragged.
  g.fillStyle=css(mix(P.wildFur,P.ink,.3),.85);
  g.beginPath();g.moveTo(-.2,-2.3);g.lineTo(-1.15,-1.1);g.lineTo(-.9,-.3);g.lineTo(-.6,-.9);g.lineTo(-.35,-.2);g.closePath();g.fill();
  g.beginPath();g.moveTo(.2,-2.3);g.lineTo(1.1,-1.3);g.lineTo(.85,-.4);g.lineTo(.55,-1);g.lineTo(.3,-.3);g.closePath();g.fill();
  g.fillStyle=css(P.boneDark,.9);g.beginPath();g.ellipse(0,-2.65,.26,.2,0,0,TAU);g.fill();
  g.fillStyle=css(P.cyan,.55*(1-dead));g.fillRect(-.12,-2.7,.07,.05);g.fillRect(.05,-2.7,.07,.05);
  // The stalk and its pale cap, glowing cold.
  const sw=Math.sin(frame*.02+k)*.08;
  g.strokeStyle=css(P.boneShade,.85);g.lineWidth=.07;g.beginPath();g.moveTo(0,-2.8);g.quadraticCurveTo(sw,-3.5,sw*2,-4.1-k%2*.4);g.stroke();
  const cy=-4.15-k%2*.4;
  g.fillStyle=css(P.bone,.85);g.beginPath();g.ellipse(sw*2,cy,.42,.2,0,Math.PI,TAU);g.fill();
  g.restore();
  spot(g,P.cyan,x+Math.sin(tilt)*3.4*s,1+3.9*s*Math.cos(tilt),.75*s,(.42+.12*Math.sin(frame*.04+k))*(1-dead));
 }
 // The mycelium mat on the floor: threads that pulse toward the crown (stronger from P2).
 g.strokeStyle=css(P.cyan,.12+.18*mat*(1-dead));g.lineWidth=.03;
 for(let i=0;i<14;i++){
  const x0=C.arenaLeft+i*1.4,x1=x0+1.2+Math.sin(i)*.4,y=-1.02-(i%3)*.03;
  g.beginPath();g.moveTo(x0,y);g.quadraticCurveTo((x0+x1)/2,y-.18,x1,y);g.stroke();
 }
 if(mat>.5&&!dead){add(g);const pulse=(frame*.05)%1;for(let i=0;i<5;i++)spot(g,P.cyan,lerp(C.arenaLeft,C.right,(i*.21+pulse)%1),1.05,.5,.18);norm(g);}
}

// Sockets: swell (a bulge shimmering cyan), erupt (a stalk shooting up, cyan-edged), the cap (ivory, a platform), rot.
function stalk(g,x,top,w,col,edge){
 const h=top-1;if(h<=0)return;
 g.fillStyle=col;g.beginPath();g.moveTo(x-w,-1);g.bezierCurveTo(x-w*.6,-(1+h*.5),x-w*.5,-(top-.2),x-w*.35,-top);g.lineTo(x+w*.35,-top);g.bezierCurveTo(x+w*.5,-(top-.2),x+w*.6,-(1+h*.5),x+w,-1);g.closePath();g.fill();
 if(edge){g.strokeStyle=edge;g.lineWidth=.05;g.stroke();}
}
function cap(g,x,y,w,col,under,a=1){
 // The cap's flat top is the platform line at y; the dome rises a little above it, the gills glow under it.
 g.globalAlpha=a;
 g.fillStyle=col;g.beginPath();g.moveTo(x-w,-y+.02);g.bezierCurveTo(x-w*.9,-(y+.42),x+w*.9,-(y+.42),x+w,-y+.02);g.quadraticCurveTo(x,-(y-.28),x-w,-y+.02);g.fill();
 g.strokeStyle=css(P.outline,.8);g.lineWidth=.035;g.stroke();
 g.strokeStyle=under;g.lineWidth=.025;
 for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(x+i*w*.12,-y+.05);g.lineTo(x+i*w*.2,-(y-.2));g.stroke();}
 g.fillStyle=css(P.boneRim,.55*a);g.beginPath();g.ellipse(x-w*.3,-(y+.26),w*.25,.06,-.15,0,TAU);g.fill();
 g.globalAlpha=1;
}
function drawSockets(g,e,frame){
 for(let k=0;k<C.sockets.length;k++){
  const so=e.sockets[k],d=C.sockets[k];
  if(!so.st){
   // A dormant socket still shows where it can grow (button caps on the floor, a dim knot on the wall), so the stalks'
   // fixed places are learnable before the first sow (gone once the crown has died).
   if(gone(e))continue;
   const pulse=.5+.5*Math.sin(frame*.04+k*1.7);
   if(d.wall){const wx=d.wall<0?C.arenaLeft:C.right,wy=d.row+.6;g.fillStyle=css(mix(P.furDeep,P.cyanDeep,.4),.9);g.beginPath();g.ellipse(wx,-wy,.22,.34,0,0,TAU);g.fill();add(g);spot(g,P.cyan,wx-d.wall*.12,wy,.35,.12+.08*pulse);norm(g);}
   else{
    // Three pale button caps across the stalk's column, its edges marked by the outer two.
    for(const [dx,h,r] of [[.32,.16,.12],[1,.24,.16],[1.68,.14,.11]]){
     const bx=d.x0+dx;
     g.strokeStyle=css(P.boneShade,.8);g.lineWidth=.035;g.beginPath();g.moveTo(bx,-1);g.lineTo(bx,-(1+h));g.stroke();
     g.fillStyle=css(P.bone,.75);g.beginPath();g.ellipse(bx,-(1+h),r,r*.5,0,Math.PI,TAU);g.fill();
    }
    add(g);spot(g,P.cyan,d.x0+1,1.15,.55,.12+.08*pulse);norm(g);
   }
   continue;
  }
  const x=d.x0+1,top=d.row+1,q=so.f?1-so.t/so.f:1;
  if(so.st===1){
   // Swell: the ground (or the wall) bulges and shimmers; a cold ring tightens as it nears.
   const by=d.wall?top-.4:1;
   g.fillStyle=css(mix(P.furDeep,P.cyanDeep,.35*q),.95);
   if(d.wall){g.beginPath();g.ellipse(d.wall<0?C.arenaLeft:C.right,-by,.3+.6*q,.25+.2*q,0,0,TAU);g.fill();}
   else{g.beginPath();g.ellipse(x,-1,.5+.55*q,.12+.3*q,0,Math.PI,TAU);g.fill();}
   add(g);
   const bx=d.wall?(d.wall<0?C.arenaLeft+.3:C.right-.3):x;
   spot(g,P.cyan,bx,by+.15,.6+1.1*q,.25+.6*q*(Math.floor(frame/3)%2?1:.7));
   // The ring closes on the stalk's full width (its hitbox), and the column it will fill is drawn faintly.
   g.strokeStyle=css(P.cyanHot,.3+.6*q);g.lineWidth=.04;g.beginPath();g.ellipse(bx,-by,lerp(1.7,d.wall?1.1:.85,q),.3-.18*q,0,0,TAU);g.stroke();
   if(!d.wall){g.strokeStyle=css(P.cyan,.08+.3*q);g.lineWidth=.035;g.setLineDash?.([.2,.16]);g.beginPath();g.moveTo(d.x0+.15,-1);g.lineTo(d.x0+.15,-top);g.moveTo(d.x0+1.85,-1);g.lineTo(d.x0+1.85,-top);g.stroke();g.setLineDash?.([]);}
   norm(g);
  }else if(so.st===2){
   const gq=ease(q),t=lerp(1,top,gq);
   // The eruption fills exactly the column that hurts (the sim's hitbox), full height from its first frame.
   const [bx0,bx1,by0,by1]=d.wall?[d.x0-.1,d.x0+2.1,d.row-.3,d.row+1.3]:[d.x0+.15,d.x0+1.85,1,top];
   add(g);g.fillStyle=css(P.cyanHot,.42*(1-q*.55));g.fillRect(bx0,-by1,bx1-bx0,by1-by0);norm(g);
   g.strokeStyle=css(P.cyanHot,.85*(1-q*.4));g.lineWidth=.05;g.beginPath();
   if(d.wall){g.moveTo(bx0,-by0);g.lineTo(bx1,-by0);g.moveTo(bx0,-by1);g.lineTo(bx1,-by1);}else{g.moveTo(bx0,-by0);g.lineTo(bx0,-by1);g.moveTo(bx1,-by0);g.lineTo(bx1,-by1);}
   g.stroke();
   if(d.wall){
    g.fillStyle=css(P.cyanHot,.9);const wx=d.wall<0?C.arenaLeft:C.right;
    g.beginPath();g.moveTo(wx,-(top-.5));g.lineTo(lerp(wx,x+d.wall*-1,gq),-(top-.1));g.lineTo(wx,-(top+.25));g.fill();
    cap(g,lerp(wx,x,gq),top,lerp(.3,1,gq),css(P.bone,1),css(P.cyan,.9));
   }else{
    stalk(g,x,t,.28,css(P.boneShade,1),css(P.cyanHot,1));cap(g,x,t,lerp(.35,1.05,gq),css(P.bone,1),css(P.cyan,.9));
   }
   add(g);spot(g,P.cyanHot,x,(1+top)/2,1.6,.8*(1-q*.5));spot(g,P.cyan,x,top,1.2,.7);norm(g);
  }else{
   const rot=so.st===4?q:0,blink=so.st===4&&Math.floor(frame/(rot>.6?3:6))%2,col=rot?mix(P.bone,'#5a4a3a',rot):P.bone;
   if(d.wall){
    const wx=d.wall<0?C.arenaLeft:C.right;
    g.fillStyle=css(mix(P.boneShade,'#4a3a30',rot),1);g.beginPath();g.moveTo(wx,-(top-.7));g.quadraticCurveTo(x,-(top-.4),x+d.wall*-.6,-(top-.05));g.lineTo(wx,-top);g.fill();
   }else stalk(g,x+Math.sin(frame*.02+k)*.03*(1-rot),top-.05,.24,css(mix(P.boneShade,'#3a2e28',rot),1),null);
   cap(g,x,top+(rot?-.06*rot:0),1.05-.08*rot,css(col,1),css(blink?P.ash:P.cyan,.55*(1-rot)),blink?.55:1);
   if(!rot){add(g);spot(g,P.cyan,x,top-.15,.7,.22+.08*Math.sin(frame*.06+k));norm(g);}
   else if(frame%5===k%5){add(g);spot(g,P.ash,x+((frame*13)%10-5)*.15,top-.4-rot*.6,.18,.5);norm(g);}
  }
 }
}

// The risen dead: hunched moth corpses, an ivory moth-skull face, a fruiting stalk from the head, mycelium for strings.
function drawRisen(g,r,frame,alpha){
 const k=r.husk?C.risen:C.corpse,x=r.px+(r.x-r.px)*alpha,s=k.h/4.2,f=r.facing||1;
 let lift=1,tilt=0,arm=0,flash=0,ring=0;
 if(r.ai==='rise')lift=ease(1-r.aiTimer/r.aiFrames);
 if(r.ai==='fall'){tilt=ease(1-r.aiTimer/r.aiFrames)*1.3*f;}
 if(r.dead){const age=frame-(r.defeatedFrame||frame);if(age>50)return;tilt=Math.min(1.4,age/24)*f;lift=1-Math.max(0,age-30)/20;}
 if(r.ai==='tell'){const q=1-r.aiTimer/r.aiFrames;arm=-q;ring=q;}
 else if(r.ai==='active')arm=1;
 else if(r.ai==='after')arm=1-Math.min(1,(r.aiFrames-r.aiTimer)/20)*.3;
 else if(r.ai==='stun')flash=r.aiTimer/r.aiFrames;
 const bob=r.ai==='walk'?Math.abs(Math.sin(frame*.18))*.06:0,wob=r.ai==='stun'?Math.sin(frame*.9)*.08:0;
 g.save();g.translate(x,-1);g.rotate(tilt+wob);g.scale(f*s,s);
 if(lift<1){g.beginPath();g.rect(-3,-5,6,5*lift+.02);g.clip();g.translate(0,(1-lift)*4.4);}
 const hot=r.flash>0||flash>.5;
 // Mycelium threads from the ground into the body (it is moved from below, never on strings).
 g.strokeStyle=css(P.cyan,.35);g.lineWidth=.03;
 for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*.3,0);g.quadraticCurveTo(i*.1,-.8,i*.05,-1.6-bob);g.stroke();}
 // Legs, body, folded wings.
 g.fillStyle=css(mix(P.wildFur,P.ink,.2),1);
 g.fillRect(-.35,-1.1,.16,1.1);g.fillRect(.18,-1.1,.16,1.1);
 const body=hot?P.ivory:mix(P.fur,P.furDeep,.4);
 g.fillStyle=css(body,1);g.beginPath();g.moveTo(-.55,-1);g.bezierCurveTo(-.85,-2.2,-.5,-3.3,.2,-3.5-bob);g.bezierCurveTo(.75,-3.2,.8,-2,.5,-1);g.closePath();g.fill();
 g.strokeStyle=css(P.outline,1);g.lineWidth=.05;g.stroke();
 g.fillStyle=css(mix(P.ash,P.wildFur,.55),.9);
 g.beginPath();g.moveTo(-.1,-3.2);g.lineTo(-1.3,-2.2);g.lineTo(-1.1,-1.2);g.lineTo(-.75,-1.7);g.lineTo(-.55,-1.1);g.closePath();g.fill();
 // The head: a moth skull in ivory bone, cold cyan eyes.
 const hx=.35,hy=-3.65-bob;
 g.fillStyle=css(hot?P.ivory:P.bone,1);g.beginPath();g.ellipse(hx,hy,.36,.3,.2,0,TAU);g.fill();g.stroke();
 g.fillStyle=css(P.cyanHot,1);g.beginPath();g.arc(hx+.14,hy-.03,.06,0,TAU);g.fill();
 g.strokeStyle=css(P.boneShade,1);g.lineWidth=.04;g.beginPath();g.moveTo(hx-.1,hy-.25);g.quadraticCurveTo(hx-.3,hy-.7,hx-.6,hy-.8);g.moveTo(hx+.05,hy-.27);g.quadraticCurveTo(hx+.1,hy-.75,hx+.4,hy-.9);g.stroke();
 // The fruiting stalk from the skull.
 g.strokeStyle=css(P.boneShade,1);g.lineWidth=.09;g.beginPath();g.moveTo(hx-.1,hy-.2);g.quadraticCurveTo(hx-.35,hy-.9,hx-.25+Math.sin(frame*.05)*.1,hy-1.35);g.stroke();
 g.fillStyle=css(P.bone,1);g.beginPath();g.ellipse(hx-.25+Math.sin(frame*.05)*.1,hy-1.38,.38,.17,0,Math.PI,TAU);g.fill();
 // Arms: raised overhead in the tell, slammed down on the strike.
 const sx=.45,sy=-2.85,ang=arm<0?lerp(.6,-2.5,-arm):arm>0?lerp(-2.5,1.25,Math.min(1,arm)):.6;
 const ex=sx+Math.cos(ang)*1.15,ey=sy+Math.sin(ang)*1.15,hx2=ex+Math.cos(ang+.3)*1.05,hy2=ey+Math.sin(ang+.3)*1.05;
 g.strokeStyle=css(hot?P.ivory:mix(P.fur,P.ink,.2),1);g.lineWidth=.22;g.beginPath();g.moveTo(sx,sy);g.lineTo(ex,ey);g.lineTo(hx2,hy2);g.stroke();
 g.strokeStyle=css(P.bone,1);g.lineWidth=.08;g.beginPath();g.moveTo(hx2,hy2);g.lineTo(hx2+Math.cos(ang+.7)*.45,hy2+Math.sin(ang+.7)*.45);g.moveTo(hx2,hy2);g.lineTo(hx2+Math.cos(ang)*.5,hy2+Math.sin(ang)*.5);g.stroke();
 g.restore();
 const wy=1+(3.65+1.2)*s;
 if(ring>0){
  // The parryable cue: an ivory flash ring on the raised claws, tightening and blinking near the strike.
  const hxw=x+f*(.45+Math.cos(lerp(.6,-2.5,ring))*1.15)*s,hyw=1+(2.85-Math.sin(lerp(.6,-2.5,ring))*1.15)*s;
  add(g);spot(g,'#fff6e4',hxw,hyw,.9+.5*ring,.45+.5*ring);norm(g);
  g.strokeStyle=css(P.ivory,.45+.55*ring);g.lineWidth=.07;g.beginPath();g.arc(hxw,-hyw,lerp(1.4,.55,ring),0,TAU);g.stroke();
  if(ring>.7&&Math.floor(frame/3)%2){g.strokeStyle=css(P.ivory,.9);g.lineWidth=.03;g.beginPath();g.arc(hxw,-hyw,lerp(1.4,.55,ring)+.25,0,TAU);g.stroke();}
 }
 if(r.ai==='active'){
  // The slam: a pale arc and a crack of dust along its reach.
  const q=1-r.aiTimer/r.aiFrames;
  g.strokeStyle=css(P.ivory,.75*(1-q));g.lineWidth=.16;g.beginPath();g.arc(x+f*k.x0,-1,k.x1*.95,f>0?-Math.PI/2:-Math.PI/2,f>0?0:-Math.PI,f<0);g.stroke();
  add(g);spot(g,P.ivory,x+f*k.x1*.7,1.2,1.3,.6*(1-q));norm(g);
 }
 if(!r.dead)spot(g,P.cyan,x,wy-.3,.6,.25);
}

// Hazards: the lash lanes, the roots, the Bloom Wall, the puff clouds, the spore rain's drips.
function drawHazards(g,e,x,y,frame){
 const L=C.moves.lash.lanes,W0=C.arenaLeft,W1=C.right;
 for(const l of e.lashes){
  const [a,b]=L[l.lane],mid=(a+b)/2;
  if(l.warn>0){
   // The tell: a hypha drops from the gills to the lane and a faint cold thread draws across it.
   const q=1-l.warn/l.tell;
   g.strokeStyle=css(P.cyan,.15+.5*q);g.lineWidth=.03+.04*q;g.setLineDash?.([.25,.2]);
   g.beginPath();g.moveTo(W0,-mid);g.lineTo(W1,-mid);g.stroke();g.setLineDash?.([]);
   g.strokeStyle=css(P.cyanHot,.3+.6*q);g.lineWidth=.08;g.beginPath();g.moveTo(x,-(y+.2));g.quadraticCurveTo(x+Math.sin(frame*.3)*.6,-(mid+(y-mid)*.5),x,-mid);g.stroke();
   add(g);spot(g,P.cyan,x,mid,.6+.8*q,.3+.5*q);if(l.warn<8)for(let i=0;i<5;i++)spot(g,P.cyan,lerp(W0,W1,(i+.5)/5),mid,.5,.35);norm(g);
  }else{
   // The strike: a whip of light across the whole lane.
   const q=1-l.t/C.moves.lash.active;
   add(g);
   for(const s of [-1,1]){
    g.strokeStyle=css(P.cyanHot,.95*(1-q*.6));g.lineWidth=(b-a)*.55;g.beginPath();g.moveTo(x,-mid);
    for(let i=1;i<=12;i++){const t=i/12,xx=x+s*t*(s<0?x-W0:W1-x);g.lineTo(xx,-(mid+Math.sin(t*9+frame*.8)*.12*(1-t)));}
    g.stroke();
    g.strokeStyle=css(P.cyan,.35);g.lineWidth=(b-a)*1.6;g.stroke();
   }
   for(let i=0;i<7;i++)spot(g,P.cyanHot,lerp(W0,W1,(i+.5)/7),mid,1.1,.5*(1-q));
   norm(g);
  }
 }
 for(const n of e.snares){
  const k=C.moves.snare;
  if(n.warn>0){
   const q=1-n.warn/k.swell;
   g.strokeStyle=css(P.cyan,.3+.6*q);g.lineWidth=.05;g.beginPath();g.ellipse(n.x,-n.y,lerp(1.1,.7,q),.14,0,0,TAU);g.stroke();
   add(g);spot(g,P.cyan,n.x,n.y+.1,.8+.6*q,.3+.5*q);norm(g);
   g.fillStyle=css(P.cyanDeep,.6);for(let i=-2;i<=2;i++)g.fillRect(n.x+i*.22-.03,-(n.y+.12*q+(i&1)*.05),.06,.12*q+.04);
  }else{
   const q=Math.min(1,(k.active+k.swell-n.t-k.swell+1)/3);
   for(let i=-3;i<=3;i++){
    const rx=n.x+i*.2,h=k.h*q*(1-Math.abs(i)*.18);
    g.fillStyle=css(P.boneShade,1);g.beginPath();g.moveTo(rx-.09,-n.y);g.lineTo(rx+i*.04,-(n.y+h));g.lineTo(rx+.09,-n.y);g.fill();
    g.fillStyle=css(P.cyanHot,1);g.beginPath();g.moveTo(rx+i*.04-.04,-(n.y+h-.3));g.lineTo(rx+i*.04,-(n.y+h));g.lineTo(rx+i*.04+.04,-(n.y+h-.3));g.fill();
   }
   add(g);spot(g,P.cyan,n.x,n.y+1.2,1.4,.6);norm(g);
  }
 }
 for(const w of e.walls){
  const b=C.moves.bloom;
  if(w.warn>0){
   const q=1-w.warn/w.tell,wx=w.x;
   add(g);spot(g,P.cyan,wx,1.4,1+1.4*q,.3+.5*q);norm(g);
   g.fillStyle=css(P.cyanDeep,.7);for(let i=0;i<5;i++)g.fillRect(wx-.4+i*.2,-(1+.5*q*((i*7)%3)/2),.08,.5*q*((i*7)%3)/2+.05);
   continue;
  }
  // A rushing wall of stalks, cyan-hot at the front, ivory crests on top (a pogo off them works). The bundle spans exactly
  // the sim's hitbox (w.x +- b.w/2): the hot front stalk's outer edge is the edge that hurts.
  for(let i=0;i<6;i++){
   const sx=w.x+w.dir*(b.w/2-.1-i*(b.w-.2)/5)+Math.sin(frame*.7+i)*.02,h=b.h*(1-i*.07)*(i%2?.93:1);
   g.fillStyle=css(i?mix(P.boneShade,P.cyanDeep,.3):P.cyanHot,1-i*.08);g.beginPath();g.moveTo(sx-.1,-1);g.lineTo(sx-.05,-(1+h));g.lineTo(sx+.05,-(1+h));g.lineTo(sx+.1,-1);g.fill();
  }
  cap(g,w.x,1+b.h,.55,css(P.bone,1),css(P.cyan,.9));
  add(g);spot(g,P.cyanHot,w.x+w.dir*.3,1+b.h*.5,1.7,.7);spot(g,P.cyan,w.x-w.dir*.8,1.3,1.2,.4);norm(g);
 }
 for(const c of e.puffs){
  const k=C.moves.puff;
  if(c.warn>0){
   const q=1-c.warn/c.tell;
   g.strokeStyle=css(P.cyan,.25+.6*q);g.lineWidth=.05;g.setLineDash?.([.18,.14]);g.beginPath();g.ellipse(c.x,-1.02,k.w/2*(.4+.6*q),.18,0,0,TAU);g.stroke();g.setLineDash?.([]);
   add(g);spot(g,P.cyan,c.x,1.2,1+q,.25+.35*q);norm(g);continue;
  }
  const hw=k.w/2*c.grow,h=k.h*c.grow,fade=Math.min(1,c.t/30);
  // A low, heavy bank of spores: a dark teal body, glowing billows, drifting specks.
  g.fillStyle=css(P.cyanDeep,.34*fade);g.beginPath();g.moveTo(c.x-hw,-1);
  for(let i=0;i<=8;i++){const t=i/8,px=c.x-hw+t*hw*2,py=1+h*(.75+.18*Math.sin(i*1.9+frame*.05))*Math.sin(Math.PI*(.08+t*.84));g.lineTo(px,-py);}
  g.lineTo(c.x+hw,-1);g.closePath();g.fill();
  add(g);
  for(let i=0;i<9;i++){
   const t=(i+.5)/9,px=c.x-hw+t*hw*2+Math.sin(frame*.03+i*2)*.2,py=1+h*(.35+.3*Math.sin(i*1.7+frame*.02));
   spot(g,P.cyan,px,py,h*.75,.36*fade);
  }
  spot(g,P.cyanHot,c.x,1+h*.4,hw*.8,.26*fade);
  g.fillStyle=css(P.cyanHot,.8*fade);for(let i=0;i<14;i++){const px=c.x-hw*.9+((i*37+frame*.4*(1+i%3))%(hw*180))/90,py=1+((i*53+frame*.6)%(h*90))/90;g.fillRect(px,-py,.05,.05);}
  norm(g);
  g.strokeStyle=css(P.cyan,.55*fade);g.lineWidth=.04;g.setLineDash?.([.25,.15]);g.beginPath();g.ellipse(c.x,-(1+h*.45),hw,h*.55,0,0,TAU);g.stroke();g.setLineDash?.([]);
 }
 for(const r of e.rain){
  if(r.t>C.moves.rain.warn)continue;
  const q=1-r.t/C.moves.rain.warn;
  g.strokeStyle=css(P.cyan,.15+.5*q);g.lineWidth=.04;g.beginPath();g.moveTo(r.x,-C.moves.rain.y);g.lineTo(r.x,-1);g.stroke();
  add(g);spot(g,P.cyan,r.x,C.moves.rain.y-.4,.5+.4*q,.6);spot(g,P.cyan,r.x,1.05,.6,.3*q);norm(g);
 }
}

// The crown: the trunk from the vault, the cathedral of caps, the gill skirt, the amber heart deep inside.
function drawCrown(g,state,e,frame,alpha){
 const x=e.px+(e.x-e.px)*alpha,by=e.py+(e.y-e.py)*alpha,open=e.ai==='open'||e.ai==='spent'||e.ai==='dying',breath=open&&e.openKind==='breath';
 const base=breath?by+K.open.drop:by,top=base+K.h,dead=gone(e)?clamp01((frame-e.defeatedFrame)/90):0;
 const inhale=e.ai==='inhale'?1-e.aiTimer/e.aiFrames:0,glass=e.glass&&e.ai!=='spent'&&!gone(e);
 const tell=e.act&&e.act.stage==='tell'?1-e.act.t/Math.max(1,e.act.frames):0,id=e.act?.id;
 const hot=e.flash>0,sway=Math.sin(frame*.015)*.12*(1-dead);
 const cx=x+sway,W=K.w/2+.7;
 // The trunk: from the vault down into the crown (torn to a stump in the last fruiting).
 if(!glass&&e.ai!=='spent'&&!gone(e)){
  const g1=g.createLinearGradient(cx-.9,0,cx+.9,0);g1.addColorStop(0,P.furDeep);g1.addColorStop(.45,mix(P.fur,P.boneDark,.25));g1.addColorStop(1,P.ink);
  g.fillStyle=g1;g.beginPath();g.moveTo(cx-.6,-16);g.bezierCurveTo(cx-.7,-(top+1.5),cx-1.3,-(top+.4),cx-1.6,-(top-.3));g.lineTo(cx+1.6,-(top-.3));g.bezierCurveTo(cx+1.3,-(top+.4),cx+.7,-(top+1.5),cx+.6,-16);g.fill();
  g.strokeStyle=css(P.boneShade,.3);g.lineWidth=.04;
  for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(cx+i*.2,-16);g.quadraticCurveTo(cx+i*.28,-(top+1),cx+i*.55,-(top-.2));g.stroke();}
 }else if(!gone(e)){
  g.strokeStyle=css(P.fur,1);g.lineWidth=.5;g.beginPath();g.moveTo(cx,-(top+.3));g.lineTo(cx+Math.sin(frame*.2)*.2,-(top+1.4));g.stroke();
  g.strokeStyle=css(P.cyan,.6);g.lineWidth=.04;for(let i=0;i<5;i++){g.beginPath();g.moveTo(cx+(i-2)*.4,-(top+.2));g.lineTo(cx+(i-2)*.5+Math.sin(frame*.1+i)*.3,-(top+1.3+i%2*.5));g.stroke();}
 }
 // Back caps: the cathedral of smaller crowns clustered behind, each with a cold gill glow.
 const backs=[[-3.2,.9,.62],[3.1,1.1,.7],[-1.8,2.1,.55],[2.0,2.3,.5],[0,2.9,.42],[-4.1,-.1,.45],[4.2,0,.42]];
 for(const [dx,dy,s] of backs){
  const bx=cx+dx*(1-dead*.2),bty=top+dy-1.2-dead*1.5;
  g.fillStyle=css(mix(P.boneShade,P.furDeep,.35+.4*dead),1);
  g.beginPath();g.moveTo(bx-2.2*s,-bty);g.bezierCurveTo(bx-2*s,-(bty+1.6*s),bx+2*s,-(bty+1.6*s),bx+2.2*s,-bty);g.quadraticCurveTo(bx,-(bty-.5*s),bx-2.2*s,-bty);g.fill();
  g.strokeStyle=css(P.outline,.7);g.lineWidth=.04;g.stroke();
  add(g);spot(g,glass?P.cyanHot:P.cyan,bx,bty-.15,1.6*s,(.3+.15*Math.sin(frame*.05+dx))*(1-dead));norm(g);
 }
 // The gill skirt: lamellae hanging from the cap, parting amber when it breathes.
 const part=open?1:inhale*.4;
 const gy=base,gw=W*(1+.08*part);
 const heart=gone(e)?1-dead:open?1:inhale?.4+.6*inhale:.18+.06*Math.sin(frame*.07);
 add(g);spot(g,P.amber,cx,gy+.6,(2.2+2.6*heart)*(open?1+.05*Math.sin(frame*.4):1),.25+.7*heart);spot(g,P.amberHot,cx,gy+.7,.8+1.4*heart,.5*heart);norm(g);
 const n=26;
 for(let i=0;i<n;i++){
  const t=i/(n-1)*2-1,lx=cx+t*gw,len=(1.25-Math.abs(t)*.55)*(breath?1.6:1)+.08*Math.sin(frame*.05+i),spread=part*Math.sign(t||1)*(1-Math.abs(t))*.55;
  const col=open?mix(P.amberHot,P.amberDeep,Math.abs(t)):inhale?mix(P.furLight,P.amber,inhale*(i%2?1:.6)):tell&&(id==='lash'||id==='volley')?mix(P.furLight,P.cyan,tell):mix(P.furDeep,P.fur,.5+.3*(i%2));
  g.strokeStyle=css(hot?P.ivory:col,.95);g.lineWidth=.13-Math.abs(t)*.05;
  g.beginPath();g.moveTo(lx,-(gy+.55));g.quadraticCurveTo(lx+spread*.5,-(gy+.1),lx+spread+Math.sin(frame*.04+i)*.04,-(gy+.55-len));g.stroke();
 }
 if(open&&!gone(e)){
  // The amber heart behind the gills, and the light pouring down.
  add(g);
  const pulse=.85+.15*Math.sin(frame*.35);
  g.fillStyle=css(P.amberHot,.9*pulse);g.beginPath();g.ellipse(cx,-(gy+.75),.75,.55,0,0,TAU);g.fill();
  g.fillStyle=css('#fff0c8',.9);g.beginPath();g.ellipse(cx,-(gy+.75),.3,.22,0,0,TAU);g.fill();
  const lg=g.createLinearGradient(0,-gy,0,-(gy-3.2));lg.addColorStop(0,css(P.amber,.32));lg.addColorStop(1,css(P.amber,0));
  g.fillStyle=lg;g.beginPath();g.moveTo(cx-gw*.7,-gy);g.lineTo(cx-gw*1.05,-(gy-3.2));g.lineTo(cx+gw*1.05,-(gy-3.2));g.lineTo(cx+gw*.7,-gy);g.fill();
  norm(g);
  // The cap of this opening dims as it fills (the framework's per-opening limit, read in the light).
  const left=1-e.openDamage/(e.maxMask*C.cap);
  g.strokeStyle=css(P.amberHot,.5+.5*left);g.lineWidth=.06;g.beginPath();g.arc(cx,-(gy+.75),1.05,-Math.PI/2,-Math.PI/2+TAU*left);g.stroke();
 }
 // The main cap: a vast ivory dome, layered rims, spots; cyan veins in the last fruiting.
 const g2=g.createLinearGradient(0,-(top+.6),0,-(gy+.3));
 const ivory=gone(e)?mix(P.bone,'#4a3a30',dead):P.bone;
 g2.addColorStop(0,mix(ivory,P.boneRim,.4));g2.addColorStop(.55,ivory);g2.addColorStop(1,mix(P.boneShade,P.boneDark,.5));
 g.fillStyle=hot?P.ivory:g2;
 g.beginPath();g.moveTo(cx-W-.25,-(gy+.55));
 g.bezierCurveTo(cx-W-.4,-(top+.3),cx-W*.55,-(top+1.25),cx,-(top+1.2));
 g.bezierCurveTo(cx+W*.55,-(top+1.25),cx+W+.4,-(top+.3),cx+W+.25,-(gy+.55));
 g.quadraticCurveTo(cx,-(gy+1.2),cx-W-.25,-(gy+.55));g.fill();
 g.strokeStyle=css(P.outline,1);g.lineWidth=.07;g.stroke();
 g.strokeStyle=css(P.boneDark,.55);g.lineWidth=.045;
 for(let i=1;i<4;i++){const yy=gy+.55+i*.42,ww=W*(1-i*.08);g.beginPath();g.moveTo(cx-ww,-yy);g.quadraticCurveTo(cx,-(yy+.35),cx+ww,-yy);g.stroke();}
 g.fillStyle=css(P.boneRim,.7);for(const [dx,dy,r] of [[-1.8,2.6,.32],[1.2,3.1,.24],[2.6,2.1,.2],[-.4,3.5,.18],[-2.9,1.6,.16]]){g.beginPath();g.ellipse(cx+dx,-(gy+dy),r,r*.6,0,0,TAU);g.fill();}
 if(glass||tell&&id==='sow'){
  g.strokeStyle=css(P.cyan,glass?.75:.25+.55*tell);g.lineWidth=.05;
  for(let i=0;i<7;i++){const a=i/7*Math.PI;g.beginPath();g.moveTo(cx+Math.cos(a)*W*.95,-(gy+.6+Math.sin(a)*.3));g.quadraticCurveTo(cx+Math.cos(a)*W*.5,-(gy+1.6+Math.sin(a)*1.2),cx+Math.cos(a)*W*.15,-(top+.9));g.stroke();}
 }
 // The rim's eyes: a ring of cold cyan pores that wake with every tell.
 add(g);
 for(let i=0;i<9;i++){const t=i/8*2-1;spot(g,P.cyan,cx+t*W*.92,gy+.62+(1-t*t)*.15,.35+.4*tell,(.25+.6*tell)*(1-dead));}
 // Spores pouring for a sow, the gills swelling cyan for a puff.
 if(tell&&id==='sow')for(let i=0;i<10;i++){const q=(frame*.02+i*.1)%1;spot(g,P.cyan,cx+Math.sin(i*2.3)*W*.8*q*1.4,gy-q*3,.25,.7*(1-q));}
 if(tell&&id==='puff')spot(g,P.cyanHot,cx,gy+.3,2+2*tell,.4*tell);
 if(tell&&id==='volley')for(let i=-1;i<=1;i++)spot(g,P.cyanHot,cx+i*.8,gy-.2,.4+.4*tell,.8);
 if(tell&&id==='bloom')spot(g,P.cyan,cx,gy+.5,3*tell,.3*tell);
 norm(g);
 if(e.ai==='spent'&&!gone(e)){add(g);spot(g,P.amber,cx,gy+1,3.5,.5+.3*Math.sin(frame*.2));norm(g);}
 if(gone(e)&&dead<1){
  // The last fruiting: an amber bloom, then the garden goes dark.
  add(g);const q=dead;spot(g,P.amberHot,cx,gy+1,2+q*9,.9*(1-q));
  g.strokeStyle=css(P.amberHot,.8*(1-q));g.lineWidth=.12*(1-q)+.02;g.beginPath();g.arc(cx,-(gy+1),1+q*10,0,TAU);g.stroke();
  for(let i=0;i<16;i++){const a=i/16*TAU,r=1+q*7;spot(g,P.amber,cx+Math.cos(a)*r,gy+1+Math.sin(a)*r*.6-q*q*3,.35,.8*(1-q));}
  norm(g);
 }
}

// The fungal veil the hunter came through (left, side -1) and the mycelium wall that closes the grove (right, side 1): each
// covers everything beyond the simulation's arena edge (the Nest's floor and pit, the void past the level's end), so a wide
// or centred view never shows them. The wall brackets grow out of these walls.
function drawVeil(g,frame,side=-1){
 const x1=side<0?C.arenaLeft-.3:C.right+.05,edge=i=>x1-side*(.1*Math.sin(i*1.9+(side>0?2.1:0))+.06*Math.sin(i*.7+1));
 const gr=g.createLinearGradient(x1+side*4,0,x1,0);gr.addColorStop(0,'#020305');gr.addColorStop(.7,css(mix(P.furDeep,P.ink,.55),1));gr.addColorStop(1,css(mix(P.furDeep,P.cyanDeep,.3),1));
 g.fillStyle=gr;g.beginPath();g.moveTo(x1+side*30,2);g.lineTo(x1+side*30,-16);
 for(let i=0;i<=35;i++)g.lineTo(edge(i),-(16-i*.5));
 g.lineTo(x1+side*30,2);g.closePath();g.fill();
 g.strokeStyle=css(P.boneShade,.45);g.lineWidth=.05;g.beginPath();for(let i=0;i<=35;i++){const y=16-i*.5;i?g.lineTo(edge(i),-y):g.moveTo(edge(i),-y);}g.stroke();
 g.lineWidth=.035;
 for(let i=0;i<9;i++){
  const x=x1+side*(.2+i*.34),sw=Math.sin(frame*.011+i*1.3+(side>0?1:0))*.12;
  g.strokeStyle=css(i%3?P.boneShade:P.cyanDeep,.3-.025*i);g.beginPath();g.moveTo(x,-15.5);
  g.bezierCurveTo(x+sw,-11,x-sw,-6,x+sw*.5,-1);g.stroke();
 }
 g.fillStyle=css(mix(P.boneShade,P.furDeep,.5),1);
 for(let i=0;i<4;i++){g.beginPath();g.ellipse(x1+side*(.15+i*.45),-(1+.05*i),.38-.05*i,.24-.03*i,0,Math.PI,TAU);g.fill();}
 add(g);for(let i=0;i<6;i++)spot(g,P.cyan,x1+side*(.25+(i%3)*.3),2+i*2.1,.4,.25+.12*Math.sin(frame*.05+i*2));norm(g);
}

export function drawCordyceaWorld(g,state,e,frame,alpha){
 if(!view.seen.has(e))view.seen.set(e,frame);
 drawVeil(g,frame,-1);drawVeil(g,frame,1);
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;
 drawSockets(g,e,frame);
 drawCrown(g,state,e,frame,alpha);
 for(const r of e.raised)drawRisen(g,r,frame,alpha);
 drawHazards(g,e,x,(e.ai==='open'&&e.openKind==='breath'?y+K.open.drop:y)+.5,frame);
}
