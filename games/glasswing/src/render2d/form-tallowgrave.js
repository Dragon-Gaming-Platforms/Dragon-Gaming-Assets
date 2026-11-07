import {css,P} from './color.js';
import {glow} from './surface.js';
import {spriteFrame,drawSprite,drawTint,socket} from './sprites.js';
import {drawMoults} from './overlays.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {formVisual,POSSESSION} from '../data/forms.js';
import {RENDERER} from '../data/form-tallowgrave.js';
import {manifest} from '../ui/assets.js';
import {VISUALS as V} from '../data/visuals.js';

// Rules-v5 possession look: THE RENDERER (Tallowgrave's mask). The Brute rig (its sheet, or the procedural hero) drawn
// 2.2x with a light amber wash, so its crested crescent-horned skull mask, purple feather-fur arms and claws stay the
// hunter's own; over it a mantle of rendered tallow dripping from the shoulders, the crimson tribe cloth worn as a
// renderer's apron-robe, the lava cracks turned into the boss's amber parts (the wick-heart glowing through the wax,
// amber stitches at the wrists), a wick-crown of AMBER flames on the mask (the stolen light, the player's colour now),
// and the iron wick-spear burning amber at its tip. Every moving part reads sim fields only (e.tallowForm): the cast
// shadow is drawn on its true x-interval, the spear reaches its true box, pools and benches sit where the sim has them.
// 0 bytes of art. World units, y up (canvas y = -y). Helpers are copied from render2d/tallowgrave.js and husk.js.
const TAU=Math.PI*2,ID='tallowgrave-form',M=RENDERER.moves;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const BRUTE=KINDS.brawler.height,INK='#0b0710',IRON='#2b2731',IRON_HI='#8a8494',TALLOW='#efe2c2',TALLOW_SHADE='#bfa97e';
// The look a form registry reads: the Brute sheet, tinted amber, scaled from its authored height (sheetH).
export const RENDERER_LOOK={draw:drawRenderer,tint:'amber',sheetH:BRUTE,sheet:'brawler'};

// An amber flame (the boss's cold cyan wick-flame, in the hunter's colour).
function flame(g,x,y,sz,t,col=P.amber,a=1){
 if(a<=0)return;
 const f=1+.18*Math.sin(t*.5)+.1*Math.sin(t*1.3);
 g.globalCompositeOperation='lighter';
 const sp=glow(col);if(sp){g.globalAlpha=.6*a;g.drawImage(sp,x-sz*3,-y-sz*3.4,sz*6,sz*6);g.globalAlpha=1;}
 g.fillStyle=css(col,.9*a);g.beginPath();g.moveTo(x-sz*.5,-y);g.quadraticCurveTo(x-sz*.6,-y-sz*1.2*f,x+Math.sin(t*.4)*sz*.3,-y-sz*2.4*f);g.quadraticCurveTo(x+sz*.6,-y-sz*1.2*f,x+sz*.5,-y);g.closePath();g.fill();
 g.fillStyle=css(P.amberHot,.95*a);g.beginPath();g.ellipse(x,-y-sz*.55,sz*.22,sz*.5*f,0,0,TAU);g.fill();
 g.globalCompositeOperation='source-over';
}
const anchorsByHunter=new WeakMap();
function anchorsOf(e){let a=anchorsByHunter.get(e);if(!a){a={valid:false,scale:1,dir:1};anchorsByHunter.set(e,a);}return a;}
// Where a socket sits on the drawn form when the sheet does not report it.
function guess(n,x,y,dir,S){
 const w=S*.4;
 return n==='head'?[x+dir*w*.1,y+S*.95]:n==='back'?[x-dir*w*.3,y+S*.72]:n==='hand'?[x+dir*w*.65,y+S*.5]:
  n==='chest'?[x+dir*w*.15,y+S*.62]:n==='legs'?[x+dir*w*.05,y+S*.03]:[x-dir*w*.45,y+S*.35];
}
const SOCKETS=['head','back','hand','chest','tail','legs'];

// The spear's line: grip at the hand, tip `reach` tiles ahead of the hunter (Tear-Through drives it to its true box).
function spearLine(h,x,y,dir,hand,t){
 const m=M.tear;
 if(h.move==='tear'){
  if(h.f<m.startup){const k=ease(h.f/m.startup);return {g:hand,tip:[hand[0]+dir*lerp(2,1.2,k),hand[1]+lerp(.2,.05,k)],butt:[hand[0]-dir*lerp(1.4,2.1,k),hand[1]-lerp(.3,.1,k)]};}
  const out=h.f<m.startup+m.active,k=out?1:1-ease((h.f-m.startup-m.active)/(m.total-m.startup-m.active)),tipX=x+dir*lerp(2.2,m.box.x1,k),tipY=y+(m.box.y0+m.box.y1)/2;
  return {g:hand,tip:[tipX,tipY],butt:[hand[0]-dir*1.2*(1-.4*k),hand[1]-.1]};
 }
 // At rest it is held upright like the boss's, leaning forward, its flame over the crown's.
 const sway=Math.sin(t*.05)*.04;
 const foot=y+.04;
 if(h.move==='cast'||h.move==='wax')return {g:hand,tip:[hand[0]-dir*.9,Math.max(hand[1]+2.4,foot+3.6)],butt:[hand[0]+dir*.25,Math.max(foot,hand[1]-.9)]};
 return {g:hand,tip:[hand[0]+dir*(.5+sway),foot+4.1],butt:[hand[0]+dir*.08,foot]};
}
function spear(g,h,L,t,armour,parried){
 const {tip,butt,g:hand}=L;
 g.lineCap='round';g.strokeStyle=IRON;g.lineWidth=.13;g.beginPath();g.moveTo(butt[0],-butt[1]);g.lineTo(tip[0],-tip[1]);g.stroke();
 g.strokeStyle=css(IRON_HI,.7);g.lineWidth=.035;g.beginPath();g.moveTo(butt[0],-butt[1]-.035);g.lineTo(tip[0],-tip[1]-.035);g.stroke();
 // The amber ferrule at the grip (the boss's own amber part), and a leaf blade under the flame.
 const fx=lerp(hand[0],tip[0],.08),fy=lerp(hand[1],tip[1],.08);
 g.strokeStyle=css(P.amber,.95);g.lineWidth=.2;g.beginPath();g.moveTo(fx,-fy);g.lineTo(lerp(hand[0],tip[0],.15),-lerp(hand[1],tip[1],.15));g.stroke();
 const a=Math.atan2(tip[1]-butt[1],tip[0]-butt[0]);
 g.save();g.translate(tip[0],-tip[1]);g.rotate(-a);
 g.fillStyle=css('#d9cfc0',1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;
 g.beginPath();g.moveTo(-.1,0);g.quadraticCurveTo(.12,-.13,.42,0);g.quadraticCurveTo(.12,.13,-.1,0);g.closePath();g.fill();g.stroke();
 g.restore();
 flame(g,tip[0]+Math.cos(a)*.3,tip[1]+Math.sin(a)*.3,.17,t,P.amber,1);
 if(armour>0){
  // Parry armour: an ivory ring on the blade (the boss's parry grammar), gone once the armour ends.
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.ivory,.45+.5*armour);g.lineWidth=.06;
  g.beginPath();g.arc(tip[0],-tip[1],.38+.2*(1-armour),0,TAU);g.stroke();g.globalCompositeOperation='source-over';
 }
 if(parried>0){
  const k=parried;g.globalCompositeOperation='lighter';g.strokeStyle=css('#ffffff',.9*k);g.lineWidth=.12*k;
  g.beginPath();g.arc(hand[0],-hand[1],1.6-.9*k,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
 }
}

// A soft-to-sharp layered fill (the boss's shadow grammar: soft while it creeps, sharp when it strikes).
function soft(g,q,draw){
 const blur=(1-q)*.8;
 for(let i=2;i>=1;i--){g.globalAlpha=(.1+.12*q)/i;draw(blur*i*.5);}
 g.globalAlpha=.5+.45*ease(q);draw(0);g.globalAlpha=1;
}
// A clawed shadow laid along the floor band from x0 to x1 (dir away from the hunter), up to `top` high: a palm and
// thick hooked fingers (each its own sub-path, filled together).
function clawShadow(g,x0,x1,y,top,dir,o,palm){
 const len=Math.abs(x1-x0),n=palm?4:3,pe=x0+dir*len*(palm?.36:.26),ph=top*(palm?.92:.72);
 g.beginPath();
 g.moveTo(x0,-(y-o*.2));g.quadraticCurveTo(x0-dir*.25,-(y+ph*.65+o),x0+dir*len*.1,-(y+ph+o));
 g.quadraticCurveTo(pe,-(y+ph*1.04+o),pe+dir*.25,-(y+ph*.5));g.quadraticCurveTo(pe+dir*.15,-(y-o*.2),x0,-(y-o*.2));g.closePath();
 for(let i=0;i<n;i++){
  const k=i/(n-1),by=y+ph*(.84-.66*k),th=Math.max(.14,ph*(palm?.13:.15))+o*.5;
  const reach=(palm?.97:1)-(palm?.16:.2)*Math.abs(k-.35)*2,tx=x0+dir*len*reach,ty=y+ph*(.6-.52*k)+.06,sx=pe-dir*.15;
  g.moveTo(sx,-(by+th));
  g.quadraticCurveTo(lerp(sx,tx,.5),-(lerp(by,ty,.35)+th*1.25+.1),tx,-(ty+th*.35));
  g.quadraticCurveTo(tx+dir*(.32+o),-(ty+th*.1),tx+dir*.1,-(ty-th*.7));
  g.quadraticCurveTo(lerp(sx,tx,.55),-(lerp(by,ty,.65)-th*.35),sx,-(by-th));g.closePath();
 }
}
function castShadow(g,h,x,y,dir,t,crown){
 const m=M.cast,step=m.chain[h.chain]||m.chain[0],palm=h.chain===m.chain.length-1;
 const end=m.startup+m.active,fade=h.f<end?1:1-clamp((h.f-end)/Math.max(1,step.total-end));
 if(fade<=0)return;
 const grow=h.f<m.startup?ease(h.f/m.startup):1,q=h.f<m.startup?grow:1,strike=h.f>=m.startup&&h.f<end;
 const x0=x+dir*m.box.x0,x1=x+dir*(m.box.x0+(h.reach-m.box.x0)*grow),top=m.box.y1*(palm?1:.78);
 // The light: a faint amber cone from the crown's flame over the shadow (the projection's source).
 g.globalCompositeOperation='lighter';g.fillStyle=css(P.amber,.07*fade);
 g.beginPath();g.moveTo(crown[0],-crown[1]);g.lineTo(x1,-y);g.lineTo(x1,-(y+top*.9));g.closePath();g.fill();
 g.globalCompositeOperation='source-over';
 g.fillStyle=css(INK,.92*fade);
 soft(g,q*fade,o=>{clawShadow(g,x0,x1,y,top,dir,o,palm);g.fill();});
 // The amber edge: dim while it creeps, hot on the strike frames (the hit is the whole x-interval drawn).
 g.globalCompositeOperation='lighter';
 clawShadow(g,x0,x1,y,top,dir,0,palm);
 g.strokeStyle=css(P.amber,(strike?.95:.35*q)*fade);g.lineWidth=strike?.09:.05;g.stroke();
 if(strike){g.strokeStyle=css(P.amberHot,.5);g.lineWidth=.3;g.globalAlpha=.25;g.stroke();g.globalAlpha=1;
  g.fillStyle=css(P.amber,.5);g.fillRect(Math.min(x0,x1),-(y+.05),Math.abs(x1-x0),.1);}
 g.globalCompositeOperation='source-over';
 if(h.dark>0&&strike){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.7);g.lineWidth=.04;g.setLineDash?.([.2,.15]);clawShadow(g,x0,x1,y,top+.2,dir,.1,palm);g.stroke();g.setLineDash?.([]);g.globalCompositeOperation='source-over';}
}
// The tallow cloak (back layer): rendered wax poured over the hump, hanging down the back to a dripping hem.
function mantleBack(g,x,y,dir,S,t,back){
 const bx=back[0],by=back[1],hem=y+S*.14,sw=Math.sin(t*.04)*.05;
 const gr=g.createLinearGradient(0,-by,0,-hem);gr.addColorStop(0,TALLOW);gr.addColorStop(1,TALLOW_SHADE);
 g.fillStyle=gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 g.beginPath();g.moveTo(bx+dir*.2,-(by+.25));
 g.quadraticCurveTo(bx-dir*.8,-(by+.1),bx-dir*.9+sw,-hem);
 for(let i=0;i<5;i++){const k=(i+1)/5,dx=bx-dir*lerp(.9,.05,k)+sw*(1-k),dy=hem+(i%2?.22:0)+.04*Math.sin(i*1.7);g.quadraticCurveTo(dx+dir*.1,-(dy-.25),dx,-dy);}
 g.lineTo(bx+dir*.2,-(by-.6));g.closePath();g.fill();g.stroke();
 g.strokeStyle=css(TALLOW_SHADE,.9);g.lineWidth=.03;
 for(const k of [.35,.7]){g.beginPath();g.moveTo(bx-dir*k*.6,-(by-.1));g.quadraticCurveTo(bx-dir*k*1.1,-(by-(by-hem)*.5),bx-dir*k*1.05,-(hem+.15));g.stroke();}
}
// The renderer's apron-robe: the crimson tribe cloth tied at the waist, hanging to the shins, wax-spattered and singed.
function apron(g,x,y,dir,S,t,flash){
 const cx=x+dir*.32,top=y+S*.4,hem=y+S*.05,w0=.5,w1=.68,sw=Math.sin(t*.06)*.04;
 g.fillStyle=flash?P.ivory:css(P.crimson,.97);g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.04;
 g.beginPath();g.moveTo(cx-w0,-top);g.quadraticCurveTo(cx,-(top-.08),cx+w0,-top);
 g.quadraticCurveTo(cx+w1*1.05,-(top-(top-hem)*.5),cx+w1+sw,-hem);
 for(let i=1;i<=6;i++){const k=i/6;g.lineTo(lerp(cx+w1+sw,cx-w1+sw,k),-(hem+(i%2?.14:0)+(i===3?.08:0)));}
 g.quadraticCurveTo(cx-w1*1.05,-(top-(top-hem)*.5),cx-w0,-top);g.closePath();g.fill();g.stroke();
 // Folds, the cord belt, burns and drips of tallow.
 g.strokeStyle=css(P.crimsonDeep,.7);g.lineWidth=.03;
 for(const k of [-.45,0,.42]){g.beginPath();g.moveTo(cx+k*w0,-(top-.1));g.quadraticCurveTo(cx+k*w1*1.1+sw,-(top-(top-hem)*.55),cx+k*w1+sw,-(hem+.1));g.stroke();}
 g.strokeStyle=css(P.crimsonLight,.6);g.lineWidth=.025;g.beginPath();g.moveTo(cx-w0*.9,-(top-.12));g.quadraticCurveTo(cx,-(top-.2),cx+w0*.9,-(top-.12));g.stroke();
 g.strokeStyle=css('#3a1a12',1);g.lineWidth=.08;g.beginPath();g.moveTo(cx-w0*1.15,-(top+.02));g.quadraticCurveTo(cx,-(top-.06),cx+w0*1.15,-(top+.02));g.stroke();
 g.lineWidth=.045;g.beginPath();g.moveTo(cx+dir*w0*.9,-top);g.quadraticCurveTo(cx+dir*w0*1.1,-(top-.35),cx+dir*w0*.85+sw,-(top-.55));g.stroke();
 g.fillStyle=css(TALLOW,.9);
 for(let i=0;i<5;i++){const sx=cx+(i-2)*w1*.36,sy=hem+.3+.25*((i*7)%3);g.beginPath();g.ellipse(sx,-sy,.07,.05,0,0,TAU);g.fill();g.fillRect(sx-.02,-sy,.04,.12+.05*(i%2));}
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberDeep,.6);g.lineWidth=.03;
 for(let i=0;i<4;i++){const sx=cx-w1*.8+i*w1*.5;g.beginPath();g.moveTo(sx,-(hem+.03));g.lineTo(sx+.06,-(hem+.16));g.stroke();}
 g.globalCompositeOperation='source-over';
}
// Front layer: the dripping tallow shawl over the hump, the wick-heart through the wax, the wrist stitches.
function mantleFront(g,x,y,dir,S,t,A,flash){
 const chest=A.chest,head=A.head,hand=A.hand,back=A.back;
 // The wick-heart: the Brute's lava crack become the boss's amber heart, glowing through the wax plate.
 const hx=lerp(chest[0],x,.2)+dir*.05,hy=chest[1]-S*.06,beat=.75+.25*Math.sin(t*.12);
 g.globalCompositeOperation='lighter';const sp=glow(P.amber);if(sp){g.globalAlpha=.3*beat;g.drawImage(sp,hx-.4,-hy-.4,.8,.8);g.globalAlpha=1;}
 g.fillStyle=css(P.amberHot,.85*beat);g.beginPath();g.ellipse(hx,-hy,.08,.13,0,0,TAU);g.fill();
 g.strokeStyle=css(P.amber,.8);g.lineWidth=.025;g.beginPath();g.moveTo(hx,-hy+.13);g.lineTo(hx+.06,-hy+.27);g.moveTo(hx,-hy-.13);g.lineTo(hx-.05,-hy-.27);g.moveTo(hx+.03,-hy);g.lineTo(hx+.18,-hy-.06);g.stroke();
 g.globalCompositeOperation='source-over';
 // The shawl: ivory wax over the hump from behind the shoulders to the neck, its lower edge dripping.
 const n=[lerp(back[0],head[0],.42),lerp(back[1],head[1],.42)],p0=[back[0]-dir*.6,back[1]-.28],top=[back[0]+dir*.02,back[1]+.2];
 const gr=g.createLinearGradient(0,-(top[1]+.1),0,-(n[1]-.5));gr.addColorStop(0,TALLOW);gr.addColorStop(1,TALLOW_SHADE);
 g.fillStyle=flash?P.ivory:gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 g.beginPath();g.moveTo(p0[0],-p0[1]);
 g.quadraticCurveTo(back[0]-dir*.42,-(back[1]+.28),top[0],-top[1]);
 g.quadraticCurveTo(lerp(top[0],n[0],.5)+dir*.08,-(lerp(top[1],n[1],.5)+.2),n[0]+dir*.1,-(n[1]+.06));
 g.lineTo(n[0]+dir*.16,-(n[1]-.3));
 for(let i=0;i<7;i++){
  const k=(i+1)/7,ex=lerp(n[0]+dir*.16,p0[0],k),ey=lerp(n[1]-.3,p0[1],k)-.04*Math.sin(k*Math.PI),len=.12+.26*(((i*5)%4)/3)+.03*Math.sin(t*.04+i);
  g.lineTo(ex+dir*.06,-ey);g.quadraticCurveTo(ex+dir*.03,-(ey-len),ex,-(ey-len*.9));g.quadraticCurveTo(ex-dir*.03,-(ey-len*.4),ex-dir*.06,-ey);
 }
 g.closePath();g.fill();g.stroke();
 g.strokeStyle=css('#fffaf0',.7);g.lineWidth=.035;g.beginPath();g.moveTo(back[0]-dir*.38,-(back[1]+.18));g.quadraticCurveTo(top[0],-(top[1]+.02),lerp(top[0],n[0],.6),-(lerp(top[1],n[1],.6)+.12));g.stroke();
 // Amber wrist-stitches (the jammed wrist was the boss's opening; on the hunter it is armour light).
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.9);g.lineWidth=.035;
 for(let i=0;i<3;i++){const k=(i-1)*.1;g.beginPath();g.moveTo(hand[0]-.12,-(hand[1]+.3+k));g.lineTo(hand[0]+.12,-(hand[1]+.38+k));g.stroke();}
 g.globalCompositeOperation='source-over';
}
// The wick-crown on the crested mask: three amber flames between the horns (the boss's three wicks, the hunter's light).
// It rides the hump (the back socket), where the mask's crest sits in every pose of the Brute sheet: the head socket is
// the snout, which dips and drives forward on every swing. Never under the head's top (the procedural rig's guesses).
function crown(g,back,head,S,t,dim,dir){
 const k=1-dim*.85,cx=back[0]+dir*S*.24,cy=Math.max(back[1]+S*.08,head[1]+S*.1);
 g.fillStyle=css(TALLOW,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;
 g.beginPath();g.moveTo(cx-.34,-(cy-.04));g.quadraticCurveTo(cx,-(cy+.12),cx+.34,-(cy-.04));g.lineTo(cx+.28,-(cy-.16));g.quadraticCurveTo(cx,-(cy-.08),cx-.28,-(cy-.16));g.closePath();g.fill();g.stroke();
 g.strokeStyle='#1a1214';g.lineWidth=.05;
 for(let i=-1;i<=1;i++){const fx=cx+i*.22,fy=cy+.06-Math.abs(i)*.05;g.beginPath();g.moveTo(fx,-fy);g.lineTo(fx,-(fy+.14));g.stroke();
  flame(g,fx,fy+.14,(i?.14:.19)*k,t+i*11,P.amber,clamp(k));}
}
// drawRenderer(ctx, p, A): the Renderer's own parts around the drawn Brute. A: {x,y} feet (interpolated), dir, frame,
// layer ('behind' | 'front'; omitted draws both), S (drawn height in tiles), anchors (head/hand/chest/back, world).
export function drawRenderer(g,p,A={}){
 const h=p.tallowForm||{},x=A.x??p.x,y=A.y??p.y,dir=A.dir??(p.facing<0?-1:1),t=A.frame??0,S=A.S||formVisual(ID,'brawler');
 const layer=A.layer,back=layer!=='front',front=layer!=='behind',flash=p.flash>0;
 const an=n=>A.anchors?.[n]||guess(n,x,y,dir,S);
 if(back){
  if(h.move==='cast')castShadow(g,h,x,y,dir,t,[an('head')[0],an('head')[1]+S*.2]);
  mantleBack(g,x,y,dir,S,t,an('back'));
 }
 if(!front)return;
 apron(g,x,y,dir,S,t,flash);
 mantleFront(g,x,y,dir,S,t,{chest:an('chest'),head:an('head'),hand:an('hand'),back:an('back')},flash);
 crown(g,an('back'),an('head'),S,t,h.dark>0?clamp(h.dark/30):0,dir);
 const armour=h.move==='tear'&&h.f<M.tear.armour?1-h.f/M.tear.armour:0;
 spear(g,h,spearLine(h,x,y,dir,an('hand'),t),t,armour,clamp((h.parried||0)/10));
 if(h.move==='tear'&&h.f>=M.tear.startup&&h.f<M.tear.startup+M.tear.active){
  // The lunge: an amber streak along the spear's true box.
  const b=M.tear.box,x0=x+dir*b.x0,x1=x+dir*b.x1,yc=y+(b.y0+b.y1)/2,k=(h.f-M.tear.startup)/M.tear.active;
  g.globalCompositeOperation='lighter';const lane=g.createLinearGradient(x0,0,x1,0);
  lane.addColorStop(0,css(P.amber,0));lane.addColorStop(1,css(P.amberHot,.55*(1-k*.5)));
  g.fillStyle=lane;g.fillRect(Math.min(x0,x1),-(yc+.35),Math.abs(x1-x0),.7);g.globalCompositeOperation='source-over';
 }
 if(h.move==='wax'&&h.f<M.wax.total){
  // The gush: a molten arc from the claw to where the pool will (or did) land.
  const k=clamp(h.f/M.wax.startup),hd=an('hand'),tx=x+dir*M.wax.reach,ty=y,mx=lerp(hd[0],tx,.5),my=Math.max(hd[1],ty)+1.2;
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.85*(h.f<M.wax.startup?k:1-clamp((h.f-M.wax.startup)/(M.wax.total-M.wax.startup))));
  g.lineWidth=.16;g.lineCap='round';g.beginPath();g.moveTo(hd[0],-hd[1]);g.quadraticCurveTo(mx,-my,lerp(hd[0],tx,k),-lerp(hd[1],ty,k*k));g.stroke();
  g.globalCompositeOperation='source-over';
 }
}

// World effects: Snuff's dark (behind the hunter, over the monsters), molten pools and wax benches, blinded and
// wax-rooted monsters. Drawn before the body.
export function drawRendererWorld(g,state,p,alpha=1,frame=0){
 const h=p.tallowForm;if(!h)return;
 const W=M.wax.pool;
 for(const q of h.pools){
  if(q.t<W.molten){
   const k=q.t/W.molten,bub=Math.sin(frame*.3+q.x)*.04;
   g.globalCompositeOperation='lighter';const sp=glow(P.amber);if(sp){g.globalAlpha=.4*(1-k*.5);g.drawImage(sp,q.x-q.w*.6,-q.y-.8,q.w*1.2,1.2);g.globalAlpha=1;}
   g.globalCompositeOperation='source-over';
   g.fillStyle=css(P.amber,.85-.3*k);g.beginPath();g.ellipse(q.x,-(q.y+.06),q.w/2,.16+bub,0,0,TAU);g.fill();
   g.fillStyle=css(P.amberHot,.6);for(let i=0;i<3;i++){const bx=q.x+(i-1)*q.w*.28+Math.sin(frame*.1+i)*.1;g.beginPath();g.arc(bx,-(q.y+.14+.05*Math.sin(frame*.2+i*2)),.05,0,TAU);g.fill();}
   // It swells as it cools: a ghost of the bench it is becoming.
   g.strokeStyle=css(TALLOW,.25*k);g.lineWidth=.04;g.strokeRect(q.x-q.w/2,-(q.y+W.y),q.w,.22);
  }else{
   const life=q.t-W.molten,left=W.life-life,fade=clamp(left/60),rise=clamp(life/8),top=q.y+W.y*ease(rise);
   g.globalAlpha=fade;
   // Legs of poured wax flaring into puddles, the slab with drips hanging from its lip, amber cooling in its core.
   g.fillStyle=css(TALLOW_SHADE,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
   for(const dx of [-.36,.02,.38]){const lx=q.x+dx*q.w,lw=.13+(dx>0&&dx<.1?.05:0),mid=q.y+(top-q.y)*.5;
    g.beginPath();g.moveTo(lx-lw*2.2,-q.y);g.quadraticCurveTo(lx-lw*.6,-(q.y+.08),lx-lw*.8,-mid);g.quadraticCurveTo(lx-lw,-(top-.1),lx-lw*1.6,-top);
    g.lineTo(lx+lw*1.6,-top);g.quadraticCurveTo(lx+lw,-(top-.1),lx+lw*.8,-mid);g.quadraticCurveTo(lx+lw*.6,-(q.y+.08),lx+lw*2.2,-q.y);g.closePath();g.fill();g.stroke();}
   const gr=g.createLinearGradient(0,-(top+.06),0,-(top-.3));gr.addColorStop(0,'#fff8e8');gr.addColorStop(1,TALLOW_SHADE);
   g.fillStyle=gr;g.beginPath();g.moveTo(q.x-q.w/2,-(top-.12));g.quadraticCurveTo(q.x-q.w/2,-(top+.08),q.x-q.w/2+.25,-(top+.08));
   g.lineTo(q.x+q.w/2-.25,-(top+.08));g.quadraticCurveTo(q.x+q.w/2,-(top+.08),q.x+q.w/2,-(top-.12));
   for(let i=0;i<8;i++){const k=(i+.5)/8,dx=lerp(q.x+q.w/2-.1,q.x-q.w/2+.1,k),len=.1+.18*((i*3)%4)/3;g.lineTo(dx+.07,-(top-.16));g.quadraticCurveTo(dx+.03,-(top-.16-len),dx,-(top-.16-len));g.quadraticCurveTo(dx-.03,-(top-.16-len),dx-.07,-(top-.16));}
   g.lineTo(q.x-q.w/2,-(top-.12));g.closePath();g.fill();g.stroke();
   g.fillStyle=css('#fffaf0',.75);g.fillRect(q.x-q.w/2+.25,-(top+.05),q.w-.5,.04);
   g.globalCompositeOperation='lighter';const core=clamp(1-life/150);
   if(core>0){const sp=glow(P.amber);if(sp){g.globalAlpha=.35*core;g.drawImage(sp,q.x-q.w*.4,-(top+.3),q.w*.8,.6);g.globalAlpha=1;}}
   g.strokeStyle=css(P.amber,.55*core+.15);g.lineWidth=.03;
   g.beginPath();g.moveTo(q.x-q.w*.35,-(top-.04));g.lineTo(q.x-q.w*.1,-(top-.1));g.lineTo(q.x+q.w*.2,-(top-.02));g.lineTo(q.x+q.w*.38,-(top-.09));g.stroke();
   g.globalCompositeOperation='source-over';g.globalAlpha=1;
  }
 }
 for(const e of state.enemies||[]){
  if(e.dead)continue;
  const ex=e.px+(e.x-e.px)*alpha,ey=e.py+(e.y-e.py)*alpha;
  if(e.waxT>0){
   const k=clamp(e.waxT/M.wax.root);g.fillStyle=css(P.amber,.8*k);g.beginPath();g.ellipse(ex,-(ey+.15),e.w*.8,.24,0,0,TAU);g.fill();
   g.fillStyle=css(TALLOW,.75*k);g.beginPath();g.moveTo(ex-e.w*.55,-ey);g.lineTo(ex-e.w*.4,-(ey+e.h*.42*k));g.lineTo(ex,-(ey+e.h*.3*k));g.lineTo(ex+e.w*.45,-(ey+e.h*.45*k));g.lineTo(ex+e.w*.55,-ey);g.closePath();g.fill();
  }
 }
}
// Snuff's darkness over the room (drawn after the monsters, before the hunter): a lit hole around the hunter's crown.
// In a boss fight the dark stays thin: the boss keeps its sight, so its tells (shadows, cyan rims) must stay readable.
function darkness(g,state,p,x,y,S){
 const h=p.tallowForm;if(!(h?.dark>0))return;
 const boss=(state.enemies||[]).some(e=>e.boss&&!e.dead)?.45:1;
 const T=M.snuff.dark,k=Math.min(clamp((T-h.dark)/8),clamp(h.dark/20))*boss,cx=x,cy=y+S*.6,R=M.snuff.radius;
 const gr=g.createRadialGradient(cx,-cy,1.4,cx,-cy,R);
 // Monsters beyond the blind radius still strike: the rim stays at most 66% dark so their tells read.
 gr.addColorStop(0,css('#05020a',.1*k));gr.addColorStop(.35,css('#05020a',.5*k));gr.addColorStop(1,css('#05020a',.66*k));
 g.fillStyle=gr;g.fillRect(cx-40,-(cy+24),80,48);
 // A ring of smoke where the light was smothered, rolling out to the dark's edge.
 const ring=clamp((T-h.dark)/24);g.strokeStyle=css('#2a2030',.6*(1-ring));g.lineWidth=.3*(1-ring);
 g.beginPath();g.arc(cx,-cy,1+ring*(R-1),0,TAU);g.stroke();
}
function blinded(g,state,alpha,frame){
 for(const e of state.enemies||[]){
  if(e.dead||!(e.blindT>0))continue;
  const ex=e.px+(e.x-e.px)*alpha,ey=e.py+(e.y-e.py)*alpha+e.h+.25;
  // Snuffed eyes: two grey curls of smoke where their light went out.
  g.strokeStyle=css(P.ash,.75);g.lineWidth=.045;
  for(const s of [-1,1]){g.beginPath();g.arc(ex+s*.14,-(ey+.05*Math.sin(frame*.2+s)),.09,0,Math.PI*1.5);g.stroke();}
 }
}

// Brute clips for the Renderer's sim state, as the hero rig names them (frame data stays authoritative).
function clip(e){
 const h=e.tallowForm||{};
 if(h.move==='cast'){const st=M.cast.chain[h.chain]||M.cast.chain[0];return [['punch1','punch2','blast'][h.chain]||'punch1',clamp(h.f/st.total)];}
 if(h.move==='tear')return h.f<M.tear.startup?['charge',null]:['punch1',.45+.55*clamp((h.f-M.tear.startup)/(M.tear.total-M.tear.startup))];
 if(h.move==='wax')return ['blast',clamp(h.f/M.wax.total)];
 if(h.move==='snuff')return ['block',null];
 return [['cast','tear','pour','snuff'].includes(e.clip)?'idle':e.clip||'idle',null];
}
const proxies=new WeakMap();
// A render-only stand-in for the hunter: the Brute rig with no form (it inherits every live field of the player).
function proxyOf(e){let q=proxies.get(e);if(!q){q=Object.create(e);proxies.set(e,q);}return q;}
// The whole Renderer for the View: world effects, the dark, back layer, the amber Brute (sheet or procedural, 2.2x),
// front layer and Moults.
export function drawRendererEntity(view,g,state,e,frame,alpha,load=true){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1,S=formVisual(ID,'brawler'),k=S/BRUTE;
 if(!e.form){drawShift(view,g,e,frame,alpha,load,x,y,dir,S);return;}
 drawRendererWorld(g,state,e,alpha,frame);
 darkness(g,state,e,x,y,S);
 blinded(g,state,alpha,frame);
 const h=e.tallowForm||{};
 if(e.inv&&!e.dead&&!h.move&&Math.floor(frame/V.blinkFrames)%2)return;
 const MA=anchorsOf(e),moults=!!e.moults?.length;
 const A={x,y,dir,frame,S,layer:'behind',anchors:MA.valid?MA:null};
 // Snuff sinks the hunter into its own shadow: drawn dark for its invulnerable frames.
 const sunk=h.move==='snuff'?1-clamp(Math.abs(h.f-M.snuff.inv/2)/(M.snuff.inv/2+4)):0;
 drawRenderer(g,e,A);
 if(moults&&MA.valid)drawMoults(g,e,MA,frame,'behind');
 const [name,progress]=clip(e),q=proxyOf(e),mv=MOVES[name];
 Object.assign(q,{form:null,formShift:0,formNext:null,kind:'brawler',emberMax:0,echoFlash:0,facing:dir,
  move:mv&&progress!==null?name:null,moveFrame:mv&&progress!==null?progress*mv.total*.999:0,clip:name});
 const entry=manifest.sprites?.brawler;
 if(load&&entry)view.atlas.load('brawler',entry);
 const atlas=view.atlas.get('brawler');
 if(sunk>0)g.globalAlpha=1-.55*sunk;
 if(atlas){
  q.h=e.h;q.w=e.w;
  const opts={sprite:(sx,sy,d,scale,n,pr,fl)=>{
   const f=spriteFrame(atlas,q,n,pr,frame,sx,k);
   drawSprite(g,atlas,f.frame,sx,sy,d,k,fl,1.4);
   // A light amber wash only: the Brute's purple fur and crimson cloth must stay readable through it.
   if(!fl)drawTint(g,atlas,f.frame,sx,sy,d,k,.16);
   for(const n of SOCKETS)MA[n]=socket(atlas,f.frame,n,sx,sy,d,k)||guess(n,sx,sy,d,S);
   MA.dir=d;
  },anchors:null,low:!!view.mobile};
  view.chars.draw(g,q,frame,alpha,opts);
 }else{
  q.h=BRUTE;q.w=KINDS.brawler.width;
  g.save();g.translate(x,-y);g.scale(k,k);g.translate(-x,y);
  view.chars.draw(g,q,frame,alpha,{sprite:null,anchors:null,low:!!view.mobile});
  g.restore();
  for(const n of SOCKETS)MA[n]=guess(n,x,y,dir,S);
  MA.dir=dir;
 }
 g.globalAlpha=1;
 MA.scale=k*.8;MA.valid=true;
 A.layer='front';A.anchors=MA;drawRenderer(g,e,A);
 if(sunk>0){g.globalCompositeOperation='source-over';g.fillStyle=css(INK,.5*sunk);g.beginPath();g.ellipse(x,-(y+S*.45),S*.32,S*.52,0,0,TAU);g.fill();}
 if(moults)drawMoults(g,e,MA,frame,'front');
}
const shifting=new WeakMap();
// The 20f transformation: the hunter's own body (its mask cracking), the tallow pouring over it and the wick-crown
// lighting amber, instead of the Old Glasswing body the v4 shift grows.
function drawShift(view,g,e,frame,alpha,load,x,y,dir,S){
 let q=shifting.get(e);if(!q){q=Object.create(e);q.formNext=null;shifting.set(e,q);}
 const A=view.anchorsOf(q),o=view.opts,moults=!!e.moults?.length;
 if(moults&&A.valid)drawMoults(g,e,A,frame,'behind');
 o.sprite=view.spriteFor(q,load,g,frame,A,alpha);o.anchors=A;o.low=!!view.mobile;
 view.chars.draw(g,q,frame,alpha,o);
 A.x=x;A.y=y;A.valid=true;
 if(moults)drawMoults(g,e,A,frame,'front');
 const k=ease(clamp(1-e.formShift/POSSESSION.shift)),s=S*(.35+.65*k);
 g.globalAlpha=.3+.6*k;drawRenderer(g,e,{x,y,dir,frame,S:s});g.globalAlpha=1;
 // Wax pours down from the crown as the light catches.
 g.fillStyle=css(TALLOW,.7*(1-k));g.fillRect(x-.5,-(y+s),1,s*(1-k));
 flame(g,x,y+s*.98+.2,.25+.2*k,frame,P.amber,1);
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;
 g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*S*.5,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
}
