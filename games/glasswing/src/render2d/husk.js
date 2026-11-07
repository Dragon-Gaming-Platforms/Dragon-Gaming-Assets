import {css,P} from './color.js';
import {glow} from './surface.js';
import {spriteFrame,drawSprite,drawTint,socket} from './sprites.js';
import {drawMoults} from './overlays.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {formVisual,POSSESSION} from '../data/forms.js';
import {FORMS5} from '../data/forms5.js';
import {manifest} from '../ui/assets.js';
import {VISUALS as V} from '../data/visuals.js';

// Rules-v5 possession look (M1-D): the CHRYSALIS HUSK. The Brute rig (its sheet, or the procedural hero) drawn 2.2x
// with an amber tint, sealed in two procedural ivory shell halves with an amber seam, lava cracks, three rim lips, a
// crimson cloth wrap and gum drips; the crowned mask stays out on top. Everything moving is driven by sim fields only
// (e.husk: the move and stage, the Lariat wind-up and spin, Shell Shut, the gum, shocks and debris). 0 bytes of art.
// World units, y up (canvas y = -y). Helpers are copied from render2d/chrysalis.js rather than shared.
const TAU=Math.PI*2,ID='chrysalis-husk',H=FORMS5[ID],M=H.moves;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const BRUTE=KINDS.brawler.height;
// The look M1-E registers in FORM_LOOKS: the Brute sheet, tinted amber, scaled from its authored height (sheetH).
export const HUSK_LOOK={draw:drawHusk,tint:'amber',sheetH:BRUTE,sheet:'brawler'};

// One shell half (side -1 or 1), local units: the rim at y=0 (canvas, feet side) up to the shoulder at -h.
function half(g,side,w,h,open,flash,crack){
 const gr=g.createLinearGradient(-w/2,0,w/2,0);
 gr.addColorStop(0,side<0?P.boneRim:P.boneShade);gr.addColorStop(.5,P.bone);gr.addColorStop(1,side<0?P.boneShade:P.boneDark);
 g.fillStyle=flash?P.ivory:gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
 g.beginPath();g.moveTo(side*open,-h);
 g.bezierCurveTo(side*(w*.55+open),-h*.95,side*(w*.62+open),-h*.25,side*(w*.2+open),0);
 g.lineTo(side*open,-h*.03);g.closePath();g.fill();g.stroke();
 // Growth rings in the ivory, and the molten cracks that glow through it.
 g.strokeStyle=css(P.boneDark,.45);g.lineWidth=.025;
 for(let i=1;i<4;i++){const y=-h*i/4;g.beginPath();g.moveTo(side*(open+.04),y);g.quadraticCurveTo(side*(w*.42+open),y+.08,side*(w*.5+open),y-.04);g.stroke();}
 if(crack>0){
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,Math.min(1,.35+.5*crack));g.lineWidth=crack>1.1?.055:.035;g.beginPath();
  g.moveTo(side*(open+w*.18),-h*.82);g.lineTo(side*(open+w*.3),-h*.62);g.lineTo(side*(open+w*.2),-h*.45);g.lineTo(side*(open+w*.36),-h*.22);g.stroke();
  g.globalCompositeOperation='source-over';
 }
}
function lip(g,x,y,r,a,flash){
 g.save();g.translate(x,y);g.rotate(a);
 g.fillStyle=flash?P.ivory:css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 g.beginPath();g.ellipse(0,0,r,r*.42,0,0,Math.PI);g.fill();g.stroke();g.restore();
}
function seam(g,h,k,t){
 g.globalCompositeOperation='lighter';
 const sp=glow(P.amber);if(sp){const r=.35+k*.6+.04*Math.sin(t*.2);g.globalAlpha=.3+.55*k;g.drawImage(sp,-r,-h*.5-r,r*2,r*2);g.globalAlpha=1;}
 g.strokeStyle=css(P.amberHot,.35+.6*k);g.lineWidth=.04+.05*k;g.beginPath();
 g.moveTo(0,-h*.95);g.lineTo(.05,-h*.72);g.lineTo(-.04,-h*.5);g.lineTo(.05,-h*.28);g.lineTo(0,-h*.05);g.stroke();
 g.globalCompositeOperation='source-over';
}
// The pupal cord (amber gum over aubergine fibre), as on the boss.
function cord(g,x0,y0,x1,y1,sag,width){
 const mx=(x0+x1)/2,my=(y0+y1)/2-sag;
 g.lineCap='round';
 g.strokeStyle=css(P.furDeep,1);g.lineWidth=width;g.beginPath();g.moveTo(x0,-y0);g.quadraticCurveTo(mx,-my,x1,-y1);g.stroke();
 g.strokeStyle=css(P.amber,.8);g.lineWidth=width*.4;g.beginPath();g.moveTo(x0,-y0);g.quadraticCurveTo(mx,-my,x1,-y1);g.stroke();
}
function weight(g,x,y,r,a,flash){
 // The swung rim lip: a crescent of ivory with an amber core.
 g.save();g.translate(x,-y);g.rotate(a);
 g.fillStyle=flash?P.ivory:P.bone;g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
 g.beginPath();g.ellipse(0,0,r,r*.6,0,0,TAU);g.fill();g.stroke();
 g.fillStyle=css(P.amber,.9);g.beginPath();g.ellipse(0,0,r*.35,r*.25,0,0,TAU);g.fill();g.restore();
}

// The Lariat's ring: the swung lip circles on an ellipse that is the move's hitbox (4 tiles each side, feet to 2.6).
function lariat(g,p,h,x,y,dir,S,t,flash){
 const b=M.lariat.box,rx=b.x1,cy=y+(b.y0+b.y1)/2,ry=(b.y1-b.y0)/2,hand=[x+dir*S*.2,y+S*.5];
 if(h.stage==='wind'){
  const w=clamp(h.wind/M.lariat.wind),a=t*(.12+.4*w)*dir,r=.6+1.1*w;
  const wx=hand[0]+Math.cos(a)*r,wy=hand[1]+S*.18+Math.sin(a)*r*.45;
  cord(g,hand[0],hand[1],wx,wy,.05,.08);weight(g,wx,wy,.32+.08*w,a,flash);
  if(w>=1){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.6+.3*Math.sin(t*.6));g.lineWidth=.05;g.beginPath();g.ellipse(hand[0],-(hand[1]+S*.18),r+.15,(r+.15)*.45,0,0,TAU);g.stroke();g.globalCompositeOperation='source-over';}
  return;
 }
 const k=clamp(h.spin),a=-Math.PI/2+k*TAU*dir,wx=x+Math.cos(a)*rx,wy=cy+Math.sin(a)*ry;
 const m=M.lariat,on=h.f>=m.startup&&h.f<m.startup+m.active;
 g.globalCompositeOperation='lighter';
 g.strokeStyle=css(P.amber,on?.75:.25);g.lineWidth=on?.16+.1*h.power:.06;g.beginPath();
 // Canvas angle -a is the lip; the trail lies behind its travel.
 g.ellipse(x,-cy,rx,ry,0,dir>0?-a:-a-1.4,dir>0?-a+1.4:-a,false);g.stroke();
 if(on){g.strokeStyle=css(P.amberHot,.25);g.lineWidth=.04;g.beginPath();g.ellipse(x,-cy,rx,ry,0,0,TAU);g.stroke();}
 g.globalCompositeOperation='source-over';
 cord(g,x,y+S*.55,wx,wy,0,.09);weight(g,wx,wy,.4,a,flash);
}

// drawHusk(ctx, p, A): the shell, gum and move effects around the drawn Brute rig. A: {x,y} feet (interpolated),
// dir, frame, layer ('behind' | 'front'; omitted draws both), S (drawn height in tiles; formVisual by default).
export function drawHusk(g,p,A={}){
 const h=p.husk||{},x=A.x??p.x,y=A.y??p.y,dir=A.dir??(p.facing<0?-1:1),t=A.frame??0,S=A.S||formVisual(ID,'brawler');
 const flash=p.flash>0,layer=A.layer,back=layer!=='front',front=layer!=='behind';
 const shut=h.move==='shut'&&h.stage==='shut',counter=h.move==='shut'&&h.stage==='counter';
 const close=shut?ease(clamp(h.f/6)):0,burst=counter?1-clamp(h.f/M.shut.total):0;
 // Closing, the shell also settles onto the floor (open, it rides on the Brute's knees).
 const w=S*.5,top=lerp(S*.66,S*.97,close),gap=lerp(.08,0,close)+burst*.5,lift=Math.sin(t*.05)*.02-S*.1*close;
 if(back){
  // The back plate and its rim, darker, behind the body.
  g.save();g.translate(x-dir*.08,-(y+S*.1+lift));g.scale(dir,1);
  g.fillStyle=css(P.boneDark,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
  g.beginPath();g.ellipse(0,-top*.47,w*.62,top*.55,0,0,TAU);g.fill();g.stroke();
  g.restore();
  if(h.move==='lariat'&&h.stage==='spin')lariat(g,p,h,x,y,dir,S,t,flash);
 }
 if(!front)return;
 if(h.move==='lariat'&&h.stage==='wind')lariat(g,p,h,x,y,dir,S,t,flash);
 // The two halves around the Brute from the knees to the shoulders (to the crown while shut), the seam between.
 g.save();g.translate(x,-(y+S*.1+lift));g.scale(dir,1);
 // The lava cracks breathe; they flare while the Lariat winds and stay hot once a hit has cracked the shell (h.crack).
 const crack=.4+.3*Math.sin(t*.09)+(h.move==='lariat'&&h.stage==='wind'?.5*clamp(h.wind/M.lariat.wind):0)+(h.crack>0?.45:0);
 if(!shut)seam(g,top,.35+burst*.65,t);
 half(g,-1,w,top,gap,flash,crack);half(g,1,w,top,gap,flash,crack);
 if(shut)seam(g,top,.25,t);
 // Crimson tribe cloth wound where the pupal gum was.
 if(!shut){g.fillStyle=css(P.crimson,.95);g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.03;g.beginPath();g.moveTo(-w*.55,-top*.42);g.quadraticCurveTo(0,-top*.36,w*.58,-top*.47);g.lineTo(w*.56,-top*.36);g.quadraticCurveTo(0,-top*.26,-w*.53,-top*.31);g.closePath();g.fill();g.stroke();
  g.beginPath();g.moveTo(w*.5,-top*.4);g.quadraticCurveTo(w*.8,-top*.32+Math.sin(t*.08)*.06,w*.75,-top*.12);g.lineTo(w*.66,-top*.14);g.quadraticCurveTo(w*.65,-top*.3,w*.42,-top*.33);g.closePath();g.fill();}
 lip(g,-w*.36,0,.24,.4,flash);lip(g,w*.36,0,.24,-.4,flash);lip(g,0,.02,.2,0,flash);
 // Gum drips from the rim.
 g.strokeStyle=css(P.amber,.55);g.lineWidth=.03;
 for(let i=0;i<3;i++){const gx=(i-1)*w*.3;g.beginPath();g.moveTo(gx,0);g.quadraticCurveTo(gx+.04,.12+.05*Math.sin(t*.05+i),gx-.02,.2+.06*i);g.stroke();}
 if(shut){
  // Shut: an amber rim that clanks on each block (the one guard that stops cyan too).
  const ring=t-h.lastBlock<8&&h.blocked>0?1:.45;
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,ring);g.lineWidth=.07;
  g.beginPath();g.ellipse(0,-top*.5,w*.7,top*.58,0,0,TAU);g.stroke();
  if(h.blocked>0){g.strokeStyle=css(P.cyanHot,.35*ring);g.lineWidth=.03;g.beginPath();g.ellipse(0,-top*.5,w*.8,top*.66,0,0,TAU);g.stroke();}
  g.globalCompositeOperation='source-over';
 }
 g.restore();
 if(counter&&h.f<M.shut.counter){
  // The counter-shove: an amber ring out to the strike box on both sides.
  const k=clamp(h.f/M.shut.counter),r=M.shut.box.x1*ease(k);
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.9*(1-k));g.lineWidth=.12;
  g.beginPath();g.ellipse(x,-(y+1.3),r,1.3,0,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
 }
 if(h.move==='wall'&&h.stage==='recover'&&h.f<10){
  // The slam: a dome of amber dust as wide as the strike box, and shards kicked up from the floor.
  const k=h.f/10,b=M.wall.box,r=(b.x1-b.x0)/2;g.globalCompositeOperation='lighter';
  g.fillStyle=css(P.amber,.35*(1-k));g.beginPath();g.ellipse(x,-y,r*(.7+.3*k),b.y1*(1-k*.4),0,Math.PI,TAU);g.fill();
  g.strokeStyle=css(P.amberHot,.8*(1-k));g.lineWidth=.06;
  for(let i=-3;i<=3;i++){const sx=x+i*r/3.5;g.beginPath();g.moveTo(sx,-y);g.lineTo(sx+i*.05,-(y+(.5+.25*(3-Math.abs(i)))*(1-k*.6)));g.stroke();}
  g.globalCompositeOperation='source-over';
 }
}

// World effects of a worn Husk: gum globs, floor shocks, falling debris, enemies rooted in amber.
export function drawHuskWorld(g,state,p,alpha=1,frame=0){
 const h=p.husk;if(!h)return;
 const frozen=state.hitStop>0||state.phase!=='playing',a=frozen?1:alpha;
 for(const b of h.globs){
  const x=b.x-b.vx*(1-a);g.fillStyle=css(P.amber,.95);g.beginPath();g.arc(x,-b.y,M.gum.box.r,0,TAU);g.fill();
  g.strokeStyle=css(P.amberDeep,1);g.lineWidth=.04;g.stroke();
  g.strokeStyle=css(P.amber,.4);g.lineWidth=.12;g.beginPath();g.moveTo(x,-b.y);g.lineTo(x-b.vx*5,-b.y-.04);g.stroke();
 }
 const W=M.wall;
 for(const k of h.shocks){
  const x=k.x-k.dir*W.shock.speed*(1-a),fade=1-k.travel/W.shock.range;
  g.globalCompositeOperation='lighter';g.fillStyle=css(P.amber,.7*fade);
  g.beginPath();g.moveTo(x-k.dir*.6,-k.y);g.quadraticCurveTo(x,-(k.y+W.shock.h*1.2),x+k.dir*.25,-k.y);g.closePath();g.fill();
  g.globalCompositeOperation='source-over';
 }
 for(const d of h.debris){
  const y=d.y-W.debris.speed*(1-a),r=W.debris.radius;
  g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
  g.beginPath();g.moveTo(d.x-r,-y);g.lineTo(d.x-r*.3,-(y+r));g.lineTo(d.x+r,-(y+r*.4));g.lineTo(d.x+r*.5,-(y-r*.8));g.closePath();g.fill();g.stroke();
  const sp=glow(P.amber);if(sp){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(sp,d.x-r*1.5,-y-r*1.5,r*3,r*3);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
 }
 for(const e of state.enemies||[]){
  if(!(e.rootT>0)||e.dead)continue;
  const k=clamp(e.rootT/M.gum.root),x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;
  g.fillStyle=css(P.amber,.75*k);g.beginPath();g.ellipse(x,-(y+.12),e.w*.75,.2,0,0,TAU);g.fill();
  g.strokeStyle=css(P.amberHot,.6*k);g.lineWidth=.04;
  for(let i=0;i<4;i++){const sx=x+(i-1.5)*e.w*.35;g.beginPath();g.moveTo(sx,-(y+.1));g.quadraticCurveTo(sx+.08,-(y+e.h*.3),sx-.04,-(y+e.h*(.4+.08*i)));g.stroke();}
 }
}

// Brute clips for the Husk's sim state, as the hero rig names them (frame data stays authoritative).
// The Brute sheet's punch3 uppercut (frames 3-6) is cut flat at its cell's top (assets/sprites/brawler.json, oy 2):
// at 2.2x that cut showed over the shell, so the Lariat spins on the sword sweep and the counter starts past the uppercut.
function clip(e){
 const h=e.husk||{};
 if(h.move==='lariat')return h.stage==='wind'?['charge',null]:['sword',h.spin];
 if(h.move==='wall')return h.stage==='rise'?['jump',null]:h.stage==='plunge'?['downsword',.5]:['sword',.4+.6*clamp(h.f/M.wall.recover)];
 if(h.move==='gum')return ['blast',clamp(h.f/M.gum.total)];
 if(h.move==='shut')return h.stage==='shut'?['block',null]:['punch3',.4+.6*clamp(h.f/M.shut.total)];
 return [e.clip==='spin'||e.clip==='wind'?'idle':e.clip||'idle',null];
}
const proxies=new WeakMap();
// A render-only stand-in for the hunter: the Brute rig with no form (it inherits every live field of the player).
function proxyOf(e){let q=proxies.get(e);if(!q){q=Object.create(e);proxies.set(e,q);}return q;}
// The whole Husk for the View: behind layer, the amber Brute (sheet or procedural, 2.2x), front layer, world effects.
// M1-E's FORM_LOOKS registry replaces this entry point (HUSK_LOOK carries draw, tint and sheetH).
export function drawHuskEntity(view,g,state,e,frame,alpha,load=true){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1,S=formVisual(ID,'brawler'),k=S/BRUTE,A={x,y,dir,frame,S,layer:'behind'};
 if(!e.form){drawShift(view,g,e,frame,alpha,load,x,y,dir,S);return;}
 drawHuskWorld(g,state,e,alpha,frame);
 // The hurt blink hides the body only (gum, shocks and debris stay); never during a move: the shape is the cue.
 if(e.inv&&!e.dead&&!e.husk?.move&&Math.floor(frame/V.blinkFrames)%2)return;
 drawHusk(g,e,A);
 const h=e.husk||{};
 // Shell Shut seals the hunter in: once the halves meet, only the shell (and its rim light) is drawn.
 if(h.move==='shut'&&h.stage==='shut'&&h.f>=4){A.layer='front';drawHusk(g,e,A);return;}
 // Equipped Moults stay visible on every form (BOSS-DESIGN): back-slot parts behind the body, the rest in front.
 const MA=moultsOf(e),moults=!!e.moults?.length;
 if(moults&&MA.valid)drawMoults(g,e,MA,frame,'behind');
 const [name,progress]=clip(e),q=proxyOf(e);
 // A spinning Lariat turns the body: the far half of the spin is drawn facing back.
 const spinDir=h.move==='lariat'&&h.stage==='spin'&&h.spin>.25&&h.spin<.75?-dir:dir;
 const mv=MOVES[name];
 Object.assign(q,{form:null,formShift:0,formNext:null,kind:'brawler',emberMax:0,echoFlash:0,facing:spinDir,
  move:mv&&progress!==null?name:null,moveFrame:mv&&progress!==null?progress*mv.total*.999:0,clip:name});
 const entry=manifest.sprites?.brawler;
 if(load&&entry)view.atlas.load('brawler',entry);
 const atlas=view.atlas.get('brawler');
 if(atlas){
  q.h=e.h;q.w=e.w;
  const opts={sprite:(sx,sy,d,scale,n,pr,fl)=>{
   const f=spriteFrame(atlas,q,n,pr,frame,sx,k);
   drawSprite(g,atlas,f.frame,sx,sy,d,k,fl,1.4);
   // A light amber wash only: the Brute's purple fur and crimson cloth must stay readable through it.
   if(!fl)drawTint(g,atlas,f.frame,sx,sy,d,k,.18);
   if(moults)for(const n of SOCKETS)MA[n]=socket(atlas,f.frame,n,sx,sy,d,k)||guess(n,sx,sy,d,S);
   MA.dir=d;
  },anchors:null,low:!!view.mobile};
  view.chars.draw(g,q,frame,alpha,opts);
 }else{
  q.h=BRUTE;q.w=KINDS.brawler.width;
  g.save();g.translate(x,-y);g.scale(k,k);g.translate(-x,y);
  view.chars.draw(g,q,frame,alpha,{sprite:null,anchors:null,low:!!view.mobile});
  g.restore();
  if(moults)for(const n of SOCKETS)MA[n]=guess(n,x,y,spinDir,S);
  MA.dir=spinDir;
 }
 A.layer='front';drawHusk(g,e,A);
 if(moults){MA.scale=k*.8;MA.valid=true;drawMoults(g,e,MA,frame,'front');}
}
const SOCKETS=['head','back','hand','chest','tail','legs'],anchorsByHunter=new WeakMap();
function moultsOf(e){let a=anchorsByHunter.get(e);if(!a){a={valid:false,scale:1,dir:1};anchorsByHunter.set(e,a);}return a;}
// Where a socket sits on the drawn form when the sheet does not report it (as the View estimates for the v4 forms).
function guess(n,x,y,dir,S){
 const w=S*.4;
 return n==='head'?[x+dir*w*.1,y+S*.95]:n==='back'?[x-dir*w*.3,y+S*.72]:n==='hand'?[x+dir*w*.65,y+S*.5]:
  n==='chest'?[x+dir*w*.15,y+S*.62]:n==='legs'?[x+dir*w*.05,y+S*.03]:[x-dir*w*.45,y+S*.35];
}
const shifting=new WeakMap();
// The 20f transformation into the Husk: the hunter's own body (its mask cracking), with the ivory halves growing and
// closing around it, instead of the Old Glasswing body the v4 shift grows (characters.js reads formNext for that).
function drawShift(view,g,e,frame,alpha,load,x,y,dir,S){
 let q=shifting.get(e);if(!q){q=Object.create(e);q.formNext=null;shifting.set(e,q);}
 const A=view.anchorsOf(q),o=view.opts,moults=!!e.moults?.length;
 if(moults&&A.valid)drawMoults(g,e,A,frame,'behind');
 o.sprite=view.spriteFor(q,load,g,frame,A,alpha);o.anchors=A;o.low=!!view.mobile;
 view.chars.draw(g,q,frame,alpha,o);
 A.x=x;A.y=y;A.valid=true;
 if(moults)drawMoults(g,e,A,frame,'front');
 const k=ease(clamp(1-e.formShift/POSSESSION.shift));
 g.globalAlpha=.35+.6*k;
 drawHusk(g,e,{x,y,dir,frame,S:S*(.3+.7*k)});
 g.globalAlpha=1;
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;
 g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*S*.5,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
}
