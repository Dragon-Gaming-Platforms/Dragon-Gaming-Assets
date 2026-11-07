import {css,P,mix} from './color.js';
import {glow,seeded} from './surface.js';
import {spriteFrame,drawSprite,drawTint,socket} from './sprites.js';
import {drawMoults} from './overlays.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {formVisual,POSSESSION} from '../data/forms.js';
import {EXUVIAL_ID as ID,EXUVIAL_FORM as X} from '../data/form-exuvial.js';
import {manifest} from '../ui/assets.js';
import {VISUALS as V} from '../data/visuals.js';

// Rules-v5 possession look: THE EXUVIAL (BOSS-DESIGN boss 4, possessionForm). The Brute rig (its sheet, or the procedural
// hero) drawn 2.4x, kept recognisable: the crested crescent-horned skull mask, cracked open like a cocoon (two ivory pupal
// flaps peel off it, amber light in the crack); the purple feather-fur arms; crimson cloth as a skirt of stitched hunter
// skins. Over it, the boss's signature piece: a stitched crimson cocoon slung on the back, and four thread hook-arms
// whose barbs were the boss's cyan and are now AMBER (the light is the hunter's). The amber lava cracks become graft
// seams. Every Moult worn is shown at 2x, with an amber graft glow. 0 bytes of art; every moving part reads sim fields
// only (e.exuv: the move and stage, the claws, the hook, the brood, the stolen shots, the torn plate).
// World units, y up (canvas y = -y).
const TAU=Math.PI*2,M=X.moves;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const BRUTE=KINDS.brawler.height;
// The look a form registry can list: the Brute sheet, a light amber wash, scaled from its authored height (sheetH).
export const EXUVIAL_LOOK={draw:drawExuvialForm,tint:'amber',sheetH:BRUTE,sheet:'brawler'};

function bloom(g,x,y,r,color,a=1){
 const sp=glow(color);if(!sp||a<=0)return;
 g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
// Patches of the cocoon, fixed seeds (the renderer never touches the simulation RNG).
const rnd=seeded('exuvial-form');
const PATCH=Array.from({length:9},()=>({a:rnd()*TAU,r:.25+rnd()*.55,s:.22+rnd()*.3,c:rnd()}));
const RAGS=Array.from({length:5},()=>({u:rnd()*2-1,len:.35+rnd()*.45,w:.07+rnd()*.06,ph:rnd()*TAU,c:rnd()}));

// The stitched cocoon (local frame: centre at 0, radii rx, ry; canvas y down). seam: 0..1 amber light in the stitches.
function cocoonShape(g,rx,ry,seam,flash,t){
 const gr=g.createRadialGradient(-rx*.3,-ry*.35,ry*.1,0,0,Math.max(rx,ry)*1.1);
 gr.addColorStop(0,flash?P.ivory:P.crimsonLight);gr.addColorStop(.5,flash?P.bone:P.crimson);gr.addColorStop(1,P.crimsonDeep);
 g.fillStyle=gr;g.strokeStyle=P.outline;g.lineWidth=.06;
 g.beginPath();g.moveTo(0,-ry);g.bezierCurveTo(rx*1.15,-ry*.8,rx*1.05,ry*.6,0,ry);g.bezierCurveTo(-rx*1.05,ry*.6,-rx*1.15,-ry*.8,0,-ry);g.closePath();g.fill();g.stroke();
 g.save();g.clip();
 // Shed hunter skins sewn on: ivory mask shards, aubergine fur, darker crimson.
 for(const p of PATCH){
  const px=Math.cos(p.a)*rx*p.r,py=Math.sin(p.a)*ry*p.r,w=p.s*rx,h=p.s*ry*.55;
  g.fillStyle=p.c<.35?css(P.boneShade,.92):p.c<.65?css(P.crimsonDeep,.95):css(P.fur,.95);
  g.beginPath();g.moveTo(px-w,py-h*.6);g.lineTo(px+w*.8,py-h);g.lineTo(px+w,py+h*.7);g.lineTo(px-w*.6,py+h);g.closePath();g.fill();
  g.strokeStyle=css(P.bone,.7);g.lineWidth=.025;g.beginPath();
  for(let k=0;k<4;k++){const u=k/3,sx=lerp(px-w,px+w*.8,u),sy=lerp(py-h*.6,py-h,u);g.moveTo(sx-.04,sy-.06);g.lineTo(sx+.04,sy+.06);}
  g.stroke();
 }
 // Growth rings, then the amber graft seams (once the boss's cold light).
 g.strokeStyle=css(P.crimsonDeep,.7);g.lineWidth=.03;
 for(let i=-2;i<=2;i++){const y=i*ry*.33;g.beginPath();g.ellipse(0,y,rx*.95,ry*.1,0,0,Math.PI);g.stroke();}
 g.globalCompositeOperation='lighter';
 g.strokeStyle=css(P.amberHot,.25+.6*seam);g.lineWidth=.03+.04*seam;
 g.beginPath();g.moveTo(0,-ry*.92);g.lineTo(rx*.12,-ry*.5);g.lineTo(-rx*.08,-ry*.1);g.lineTo(rx*.1,ry*.35);g.lineTo(0,ry*.9);g.stroke();
 g.strokeStyle=css(P.amber,.15+.45*seam);g.lineWidth=.025;
 g.beginPath();g.moveTo(-rx*.8,-ry*.2);g.quadraticCurveTo(0,ry*.05+Math.sin(t*.07)*.03,rx*.85,-ry*.25);g.stroke();
 g.globalCompositeOperation='source-over';
 g.restore();
 g.strokeStyle=css(P.boneRim,.22);g.lineWidth=.04;g.beginPath();g.ellipse(-rx*.15,-ry*.1,rx*.75,ry*.82,0,3.7,5.1);g.stroke();
}
// Crimson rags under the cocoon, swaying.
function rags(g,rx,ry,t,flash){
 for(const k of RAGS){
  const ox=k.u*rx*.6,y=ry*.75,sw=Math.sin(t*.05+k.ph)*.1,bot=y+k.len;
  g.fillStyle=flash?P.ivory:k.c<.6?P.crimson:P.crimsonDeep;g.strokeStyle=css(P.outline,.7);g.lineWidth=.025;
  g.beginPath();g.moveTo(ox-k.w,y);g.lineTo(ox+k.w,y);g.quadraticCurveTo(ox+k.w*.6+sw*.4,y+k.len*.55,ox+sw,bot);
  g.lineTo(ox+sw-k.w*.3,bot-.08);g.quadraticCurveTo(ox-k.w*.7+sw*.4,y+k.len*.5,ox-k.w,y);g.closePath();g.fill();g.stroke();
 }
}
// A thread hook-arm: bone segments wrapped in amber silk, from the shoulder (sx, sy) to the barb (hx, hy), world units.
function arm(g,sx,sy,hx,hy,bend,w,flash,hot){
 const mx=(sx+hx)/2+bend[0],my=(sy+hy)/2+bend[1];
 g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=P.outline;g.lineWidth=w*1.5;g.beginPath();g.moveTo(sx,-sy);g.lineTo(mx,-my);g.lineTo(hx,-hy);g.stroke();
 g.strokeStyle=flash?P.ivory:P.boneShade;g.lineWidth=w;g.beginPath();g.moveTo(sx,-sy);g.lineTo(mx,-my);g.lineTo(hx,-hy);g.stroke();
 // The silk wound round the bone, in the hunter's amber.
 g.strokeStyle=css(P.amber,.55+.4*hot);g.lineWidth=w*.25;
 for(let k=1;k<=3;k++){const u=k/4,ax=lerp(sx,mx,u),ay=lerp(sy,my,u),bx=lerp(mx,hx,u),by=lerp(my,hy,u);
  g.beginPath();g.arc(ax,-ay,w*.55,0,Math.PI);g.stroke();g.beginPath();g.arc(bx,-by,w*.5,0,Math.PI);g.stroke();}
 g.fillStyle=P.bone;g.beginPath();g.arc(mx,-my,w*.65,0,TAU);g.fill();
 barb(g,hx,hy,Math.atan2(-(hy-my),hx-mx),w*2.6,hot);
}
// The barb: an ivory hook edged in amber (the boss's was cyan: never parry it; the hunter's is the hunter's light).
function barb(g,x,y,a,s,hot){
 g.save();g.translate(x,-y);g.rotate(a);g.scale(s,s);
 g.fillStyle=P.boneRim;g.strokeStyle=P.outline;g.lineWidth=.08;
 g.beginPath();g.moveTo(-.2,-.16);g.quadraticCurveTo(.9,-.5,1,.3);g.quadraticCurveTo(.64,0,.36,.24);g.quadraticCurveTo(.1,.1,-.2,.16);g.closePath();g.fill();g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.45+.55*hot);g.lineWidth=.1;
 g.beginPath();g.moveTo(.16,-.24);g.quadraticCurveTo(.9,-.5,1,.3);g.stroke();g.globalCompositeOperation='source-over';
 g.restore();
 if(hot>0)bloom(g,x,y,.3+.4*hot,P.amber,.3+.5*hot);
}
// The crested skull mask, cracked open like a cocoon: two ivory pupal flaps peel away from the crown, amber in the crack.
// (cx, cy): the head, world units; s: scale; open: 0..1 how far the flaps are peeled.
function hood(g,cx,cy,s,dir,open,flash,t){
 g.save();g.translate(cx,-cy);g.scale(dir*s,s);
 // The crack's light behind the flaps.
 g.globalCompositeOperation='lighter';
 const sp=glow(P.amber);if(sp){g.globalAlpha=.35+.35*open;g.drawImage(sp,-.55,-.95,1.1,1.1);g.globalAlpha=1;}
 g.globalCompositeOperation='source-over';
 for(const side of [-1,1]){
  g.save();g.translate(side*.08,-.15);g.rotate(side*(.25+.55*open));
  const gr=g.createLinearGradient(0,-.7,side*.4,0);gr.addColorStop(0,flash?P.ivory:P.boneRim);gr.addColorStop(1,P.boneShade);
  g.fillStyle=gr;g.strokeStyle=P.outline;g.lineWidth=.04;
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(side*.42,-.05,side*.46,-.55,side*.06,-.78);g.quadraticCurveTo(side*.03,-.4,0,0);g.closePath();g.fill();g.stroke();
  // Pupal growth rings and a jagged torn edge.
  g.strokeStyle=css(P.boneDark,.6);g.lineWidth=.02;
  for(let k=1;k<3;k++){g.beginPath();g.moveTo(side*.05,-.25*k);g.quadraticCurveTo(side*.3,-.22*k,side*.38,-.3*k+.08);g.stroke();}
  g.strokeStyle=css(P.amberHot,.7);g.lineWidth=.025;
  g.beginPath();g.moveTo(side*.06,-.78);g.lineTo(side*.02,-.6);g.lineTo(side*.07,-.45);g.lineTo(side*.01,-.3);g.lineTo(side*.05,-.12);g.stroke();
  g.restore();
 }
 // A silk thread trailing from the cocoon's peak.
 g.strokeStyle=css(P.ash,.55);g.lineWidth=.02;g.beginPath();g.moveTo(0,-.6);g.quadraticCurveTo(.2+.05*Math.sin(t*.05),-1,.05,-1.3);g.stroke();
 g.restore();
}
// The skirt of stitched hunter skins (the tribe's crimson cloth, worn the way the Exuvial wears what it skinned).
function skirt(g,x,y,S,dir,t,flash,step){
 const w=S*.19,top=y+S*.42,len=S*.2;
 for(let i=0;i<6;i++){
  const u=i/5,ox=x+dir*(u-.5)*w*2,sw=Math.sin(t*.06+i*1.7)*.05-dir*step*.12,l=len*(.7+.3*((i*7)%3)/2);
  g.fillStyle=flash?P.ivory:i%3===1?P.crimsonDeep:P.crimson;g.strokeStyle=css(P.outline,.85);g.lineWidth=.03;
  g.beginPath();g.moveTo(ox-w*.24,-top);g.lineTo(ox+w*.24,-top);g.lineTo(ox+w*.15+sw,-(top-l));g.lineTo(ox+sw,-(top-l-.08));g.lineTo(ox-w*.18+sw,-(top-l+.02));g.closePath();g.fill();g.stroke();
 }
 // The belt: a row of amber stitches across the waist (the lava cracks, now graft seams).
 g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.12;g.beginPath();g.moveTo(x-w*1.1,-(top+.02));g.quadraticCurveTo(x,-(top-.08),x+w*1.1,-(top+.02));g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.7);g.lineWidth=.025;g.beginPath();
 for(let k=0;k<7;k++){const sx=x-w+k*w/3;g.moveTo(sx-.04,-(top+.06));g.lineTo(sx+.04,-(top-.06));}
 g.stroke();g.globalCompositeOperation='source-over';
}

// The claw marks of the Graft Rake: three tapered hook-arm slashes whose outer tip is the strike box's far edge (4.2
// tiles) and whose span is its height, already most of the way round on the frame the claw lands (the drawn arc is the
// hitbox), then a short fade. Claws 1 and 3 rake upward, claw 2 downward; the third is the heavy one.
function claws(g,h,x,y,dir){
 const m=M.rake.hits[h.combo],b=M.rake.box,end=m.startup+m.active,tail=6;
 if(h.f<m.startup-1||h.f>=end+tail)return;
 const big=h.combo===2,up=h.combo!==1;
 const sweep=h.f<m.startup?.3:clamp(.65+.35*(h.f-m.startup)/Math.max(1,m.active-1));
 const fade=h.f<m.startup?.5:h.f<end?1:1-(h.f-end+1)/(tail+1);
 const cy=y+(b.y0+b.y1)/2,ry=(b.y1-b.y0)*.48,A=1.2,a0=up?-A:A,a1=a0+(up?2:-2)*A*sweep,n=16;
 g.globalCompositeOperation='lighter';g.lineCap='round';
 for(let i=0;i<3;i++){
  const rx=b.x1-i*(big?.4:.32),ri=ry*(1-.1*i),w=(big?.32:.22)*(1-.18*i);
  const pt=u=>{const a=lerp(a0,a1,u);return [x+dir*Math.cos(a)*rx,cy+Math.sin(a)*ri];};
  // A soft amber smear, then the hot core; both taper to a point at the leading edge and thin out at the tail.
  for(const [col,lw,al] of [[P.amber,w*2.6,.28],[i===1?P.amberHot:P.amber,w,.95]]){
   g.strokeStyle=css(col,al*fade);
   let [px,py]=pt(0);
   for(let j=1;j<=n;j++){
    const u=j/n,[qx,qy]=pt(u);
    g.lineWidth=lw*(.25+.75*Math.sin(Math.PI*Math.min(1,u*1.15)));
    g.beginPath();g.moveTo(px,-py);g.lineTo(qx,-qy);g.stroke();px=qx;py=qy;
   }
  }
 }
 g.globalCompositeOperation='source-over';
 // The impact glint at the claws' reach.
 if(h.f>=m.startup&&h.f<end)bloom(g,x+dir*b.x1*.92,cy,big?1.4:.9,P.amber,big?.75:.5);
}
// A skin-husk of the brood: a crawling crimson shed skin under an empty crested mask, amber in its eye holes.
function husk(g,b,x,y,frame,flash){
 const t=frame*.2+b.slot,crawl=Math.sin(b.walk*.4)*.06,life=clamp(b.life/40),dir=b.dir||1,atk=clamp(b.atk/10);
 g.save();g.translate(x,-y);g.scale(dir,1);g.globalAlpha=life;
 // Shadow, legs of tatters, the skin body leaning into its swipe.
 g.fillStyle=css(P.ink,.3);g.beginPath();g.ellipse(0,0,.38,.07,0,0,TAU);g.fill();
 g.rotate(.25*atk);
 g.fillStyle=flash?P.ivory:P.crimsonDeep;g.strokeStyle=P.outline;g.lineWidth=.03;
 g.beginPath();g.moveTo(-.32,0);
 for(let i=0;i<=5;i++){const u=i/5;g.lineTo(-.32+u*.64,-(.05+(i%2?.12:0)+Math.sin(t+u*6)*.03));}
 g.lineTo(.26,-.62+crawl);g.quadraticCurveTo(0,-.78,-.26,-.6-crawl);g.closePath();g.fill();g.stroke();
 g.fillStyle=css(P.crimson,.9);g.beginPath();g.moveTo(-.16,-.55);g.lineTo(.18,-.58);g.lineTo(.08,-.2);g.closePath();g.fill();
 // The mask, horns and amber eyes.
 g.fillStyle=flash?P.ivory:P.boneShade;g.strokeStyle=P.outline;g.lineWidth=.03;
 g.beginPath();g.ellipse(.08,-.84,.2,.18,0,0,TAU);g.fill();g.stroke();
 g.strokeStyle=P.boneShade;g.lineWidth=.04;g.beginPath();g.moveTo(-.04,-.96);g.quadraticCurveTo(-.2,-1.12,-.1,-1.22);g.moveTo(.2,-.96);g.quadraticCurveTo(.34,-1.12,.26,-1.22);g.stroke();
 g.fillStyle=css(P.amberHot,.9);g.beginPath();g.arc(.14,-.86,.04,0,TAU);g.arc(.02,-.86,.035,0,TAU);g.fill();
 // Its little hook-claw, copying the hunter's Rake.
 g.strokeStyle=css(P.bone,1);g.lineWidth=.05;g.beginPath();g.moveTo(.2,-.5);g.quadraticCurveTo(.45+.5*atk,-.7+.3*atk,.4+.9*atk,-.4);g.stroke();
 if(atk>0){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.8*atk);g.lineWidth=.08;
  g.beginPath();g.arc(.4,-.6,1.2*(1.1-atk*.4),-.9,.6);g.stroke();g.globalCompositeOperation='source-over';}
 g.restore();g.globalAlpha=1;
 bloom(g,x+dir*.1,y+.86,.22,P.amber,.4*life);
}

// drawExuvialForm(ctx, p, A): the cocoon, hook-arms, skirt, hood and move effects around the drawn Brute rig.
// A: {x,y} feet (interpolated), dir, frame, layer ('behind' | 'front'; omitted draws both), S (drawn height in tiles).
export function drawExuvialForm(g,p,A={}){
 const h=p.exuv||{},x=A.x??p.x,y=A.y??p.y,dir=A.dir??(p.facing<0?-1:1),t=A.frame??0,S=A.S||formVisual(ID,'brawler');
 const flash=p.flash>0,layer=A.layer,back=layer!=='front',front=layer!=='behind';
 const wrap=h.move==='cocoon'&&h.stage==='wrap',burst=h.move==='cocoon'&&h.stage==='burst';
 const hatch=h.move==='brood'?clamp(h.f/M.brood.startup):0,split=h.move==='brood'?Math.sin(Math.PI*clamp(h.f/M.brood.total)):0;
 const breathe=Math.sin(t*.05)*.03,seam=.35+.25*Math.sin(t*.09)+(h.move==='brood'?.6*hatch:0)+(h.plate?.3:0);
 const claw=h.move==='rake'?M.rake.hits[h.combo]:null,clawK=claw?clamp((h.f-claw.startup+2)/(claw.active+4)):0;
 const hook=h.move==='hook',hk=h.hook;
 // Shoulders and the cocoon's slings.
 const sh=[x-dir*S*.05,y+S*.74],cx=x-dir*S*.33,cy=y+S*.7+breathe,rx=S*.21,ry=S*.42;
 if(back&&!wrap){
  // Two rear hook-arms rise from the cocoon like a mantis's: they do the reaching (the Rake's claws, the Hook).
  const up=[cx+dir*S*.06,cy+ry*.8];
  const reachA=claw&&claw===M.rake.hits[0]?clawK:0,reachB=claw&&claw!==M.rake.hits[0]?clawK:0;
  const aimA=[x+dir*(S*.38+reachA*S*.6),y+S*(1.08-.3*reachA)+Math.sin(t*.04)*.05];
  const aimB=[x+dir*(S*.26+reachB*S*.7),y+S*(.98-.35*reachB)+Math.sin(t*.04+1)*.05];
  arm(g,up[0],up[1],aimB[0],aimB[1],[-dir*S*.04,S*.24],.19,flash,reachB);
  if(!(hook&&hk))arm(g,up[0]+dir*.1,up[1]+.12,aimA[0],aimA[1],[-dir*S*.07,S*.3],.21,flash,reachA+(hook?clamp(h.f/M.hook.startup):0));
  else arm(g,up[0]+dir*.1,up[1]+.12,x+dir*S*.4,y+S*.85,[-dir*S*.02,S*.22],.21,flash,1);
  // The cocoon on its back, tilting with the move.
  g.save();g.translate(cx,-cy);g.rotate(dir*(.12+.1*split-.15*clawK));
  // Brood: the cocoon splits along its seam while the skin-husks drop out.
  if(split>0){
   g.save();g.translate(-split*.18,0);g.beginPath();g.rect(-rx*1.3,-ry*1.1,rx*1.3,ry*2.2);g.clip();cocoonShape(g,rx,ry,seam,flash,t);g.restore();
   g.save();g.translate(split*.18,0);g.beginPath();g.rect(0,-ry*1.1,rx*1.3,ry*2.2);g.clip();cocoonShape(g,rx,ry,seam,flash,t);g.restore();
   g.globalCompositeOperation='lighter';g.fillStyle=css(P.amberHot,.5*split);g.fillRect(-.12*split,-ry*.9,.24*split,ry*1.8);g.globalCompositeOperation='source-over';
  }else cocoonShape(g,rx,ry,seam,flash,t);
  rags(g,rx,ry,t,flash);
  g.restore();
  // The slings over the shoulder: crimson straps stitched with amber.
  g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.14;g.beginPath();g.moveTo(cx,-(cy+ry*.55));g.quadraticCurveTo(sh[0],-(sh[1]+.3),x+dir*S*.1,-(y+S*.6));g.stroke();
  g.strokeStyle=css(P.amber,.5);g.lineWidth=.03;g.setLineDash?.([.06,.08]);g.stroke();g.setLineDash?.([]);
 }
 if(back&&hook&&hk){
  // The thrown hook: amber silk from the hand to the barb (the boss's line was cyan; this one is the hunter's light).
  const hx=x+dir*S*.4,hy=y+S*.85;
  g.strokeStyle=css(P.amber,.95);g.lineWidth=.06;g.beginPath();g.moveTo(hx,-hy);g.quadraticCurveTo((hx+hk.x)/2,-(hy+hk.y)/2+.15,hk.x,-hk.y);g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.3);g.lineWidth=.2;g.beginPath();g.moveTo(hx,-hy);g.lineTo(hk.x,-hk.y);g.stroke();g.globalCompositeOperation='source-over';
  barb(g,hk.x,hk.y,hk.dir>0?(hk.back?Math.PI*.8:0):(hk.back?Math.PI*.2:Math.PI),.36,1);
 }
 if(!front)return;
 if(wrap){
  // Cocoon Burst: the shed skin wraps the whole body; its seams heat up to the blast.
  const k=clamp(h.f/M.cocoon.wrap),wr=S*.3*(1-.12*k),hr=S*.55;
  g.save();g.translate(x,-(y+hr*.95));g.rotate(Math.sin(t*.8)*.04*k);
  cocoonShape(g,wr,hr,.3+.7*k,flash,t);
  g.restore();
  bloom(g,x,y+hr,S*.4*k,P.amber,.25+.5*k);
  // The skin's threads bind it.
  g.strokeStyle=css(P.ash,.6);g.lineWidth=.03;
  for(let i=0;i<5;i++){const yy=y+hr*(.25+i*.36);g.beginPath();g.moveTo(x-wr*1.02,-yy);g.quadraticCurveTo(x,-(yy-.18+.04*Math.sin(t*.3+i)),x+wr*1.02,-(yy+.1));g.stroke();}
  hood(g,x+dir*.05,y+hr*1.9,S*.3,dir,.2,flash,t);
  return;
 }
 if(claw)claws(g,h,x,y,dir);
 // Two front hook-arms hang folded from the chest, barbs down; they sweep forward with the third claw.
 const third=claw===M.rake.hits[2]?clawK:0;
 arm(g,x+dir*S*.08,y+S*.62,x+dir*(S*.28+third*S*.55),y+S*(.28+.3*third),[dir*S*.1,-S*.04],.15,flash,third);
 skirt(g,x,y,S,dir,t,flash,clawK);
 // The mask cracked open like a cocoon, worn as a hood over the crest.
 hood(g,x+dir*S*.04,y+S*.93,S*.34,dir,.35+.35*hatch+.3*(h.plate?1:0),flash,t);
 if(burst&&h.f<14){
  // The blast lands on its first frame over the whole strike box, so the ring is drawn at the box's reach from the
  // start (3.2 tiles each way), swells a little and fades; crimson shreds flung out.
  const k=h.f/14,r=M.cocoon.box.x1*(.9+.15*ease(k));
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.95*(1-k));g.lineWidth=.16;
  g.beginPath();g.ellipse(x,-(y+1.35),r,1.65*(.85+.15*k),0,0,TAU);g.stroke();
  g.fillStyle=css(P.amberHot,.3*(1-k));g.beginPath();g.ellipse(x,-(y+1.35),r*.85,1.45,0,0,TAU);g.fill();
  bloom(g,x,y+1.35,r*.8,P.amber,.6*(1-k));
  g.globalCompositeOperation='source-over';
  for(let i=0;i<10;i++){const a=i/10*TAU+.3,d=r*(.7+.25*((i*5)%3)),sx=x+Math.cos(a)*d,sy=y+1.4+Math.sin(a)*d*.45;
   g.fillStyle=css(i%2?P.crimson:P.boneShade,1-k);g.beginPath();g.moveTo(sx,-sy);g.lineTo(sx+.18,-(sy+.08));g.lineTo(sx+.05,-(sy-.14));g.closePath();g.fill();}
 }
 // The stolen attack rides on the barb of the front arm: a small amber glyph of what it will fire.
 if(h.stolen){
  const gx=x+dir*(S*.28+third*S*.55),gy=y+S*.34+Math.sin(t*.1)*.05;
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.85);g.fillStyle=css(P.amber,.7);g.lineWidth=.04;g.beginPath();
  if(h.stolen==='wave'){g.moveTo(gx-.2,-gy);g.quadraticCurveTo(gx,-(gy+.25),gx+.2,-gy);g.stroke();}
  else if(h.stolen==='dart'){g.moveTo(gx-.18,-gy);g.lineTo(gx+.2,-gy);g.lineTo(gx+.08,-(gy+.08));g.moveTo(gx+.2,-gy);g.lineTo(gx+.08,-(gy-.08));g.stroke();}
  else{for(const o of [-.12,0,.12]){g.moveTo(gx+.06+o,-(gy+o));g.arc(gx+o,-(gy+o),.06,0,TAU);}g.fill();}
  g.globalCompositeOperation='source-over';
  bloom(g,gx,gy,.3,P.amber,.5);
 }
}

// World effects of a worn Exuvial form: the brood, the stolen shots, the torn plate on a hooked boss (plate:false leaves
// the plate out: the View draws it over the form, whose body overflows its box and would hide a rip at its claws' reach).
export function drawExuvialFormWorld(g,state,p,alpha=1,frame=0,plate=true){
 const h=p.exuv;if(!h)return;
 const frozen=state.hitStop>0||state.phase!=='playing',a=frozen?1:alpha;
 for(const b of h.brood)husk(g,b,b.px+(b.x-b.px)*a,b.py+(b.y-b.py)*a,frame,false);
 for(const o of h.bolts){
  const k=X.stolen[o.kind],x=o.x-o.vx*(1-a);
  if(o.kind==='wave'){
   const fade=1-o.travel/k.range,d=Math.sign(o.vx);
   g.globalCompositeOperation='lighter';g.fillStyle=css(P.amber,.75*fade);
   g.beginPath();g.moveTo(x-d*.7,-o.y);g.quadraticCurveTo(x,-(o.y+k.h*1.3),x+d*.3,-o.y);g.closePath();g.fill();
   g.strokeStyle=css(P.crimsonLight,.6*fade);g.lineWidth=.05;g.beginPath();g.moveTo(x-d*.5,-o.y);g.quadraticCurveTo(x,-(o.y+k.h*.8),x+d*.2,-o.y);g.stroke();
   g.globalCompositeOperation='source-over';
  }else if(o.kind==='dart'){
   const d=Math.sign(o.vx);
   g.strokeStyle=css(P.amber,.4);g.lineWidth=.1;g.beginPath();g.moveTo(x-d*1.2,-o.y);g.lineTo(x,-o.y);g.stroke();
   barb(g,x,o.y,d>0?0:Math.PI,.3,1);
  }else{
   bloom(g,x,o.y,.45,P.amber,.8);
   g.fillStyle=css(P.amberHot,1);g.beginPath();g.arc(x,-o.y,k.r*.6,0,TAU);g.fill();
  }
 }
 if(plate)drawTornPlate(g,state,p,alpha,frame);
}
// The torn plate: a jagged amber rip on the hooked boss while its spot takes full damage.
export function drawTornPlate(g,state,p,alpha=1,frame=0){
 const pl=p.exuv?.plate;
 if(pl){
  const e=state.enemies?.find(t=>t.id===pl.id);
  if(e&&!e.dead){
   // Where the hook struck (sim offset from the boss's box), drawn a little inside the box edge so it sits on the body.
   const k=clamp(pl.t/M.hook.plate),ex=(e.px??e.x)+(e.x-(e.px??e.x))*alpha+(pl.ox??0)*.7,ey=(e.py??e.y)+(e.y-(e.py??e.y))*alpha+(pl.oy??Math.min(e.h||2,3)*.5);
   const r=.72+.1*Math.sin(frame*.4),star=(rr,a)=>{g.beginPath();
    for(let i=0;i<=14;i++){const an=i/14*TAU+a,q=rr*(i%2?.55:1.15);i?g.lineTo(ex+Math.cos(an)*q,-(ey+Math.sin(an)*q)):g.moveTo(ex+Math.cos(an)*q,-(ey+Math.sin(an)*q));}};
   // A dark rip with a molten amber rim, drawn opaque so it reads on ivory shells and wax as well as on dark skins.
   bloom(g,ex,ey,1.3+.5*k,P.amber,.3+.45*k);
   g.fillStyle=css(P.outline,.85);star(r,0);g.fill();
   g.fillStyle=css(P.amberDeep,.9);star(r*.62,.25);g.fill();
   g.strokeStyle=css(P.amber,.7+.3*k);g.lineWidth=.1;star(r,0);g.stroke();
   g.globalCompositeOperation='lighter';
   g.strokeStyle=css(P.amberHot,.4+.5*k);g.lineWidth=.05;star(r*.62,.25);g.stroke();
   g.globalCompositeOperation='source-over';
   // The torn plate itself, an ivory shard flung off the boss in the first frames.
   const f=1-k;
   if(f<.5){const sx=ex+(Math.sign(ex-p.x)||1)*f*2.4,sy=ey+f*1.6-f*f*3;g.save();g.translate(sx,-sy);g.rotate(f*9);g.globalAlpha=1-f*2;
    g.fillStyle=P.boneRim;g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.moveTo(-.3,-.18);g.lineTo(.32,-.24);g.lineTo(.2,.2);g.lineTo(-.24,.16);g.closePath();g.fill();g.stroke();
    g.restore();g.globalAlpha=1;}
  }
 }
}

// Brute clips for the form's sim state, as the hero rig names them (frame data stays authoritative).
function clip(e){
 const h=e.exuv||{};
 if(h.move==='rake'){const m=M.rake.hits[h.combo];return [['punch1','punch2','sword'][h.combo],clamp(h.f/m.total)];}
 if(h.move==='hook')return h.stage==='throw'?['charge',null]:['blast',h.stage==='recover'?.6+.4*clamp(h.f/M.hook.recover):.5];
 if(h.move==='brood')return ['blast',clamp(h.f/M.brood.total)];
 if(h.move==='cocoon')return h.stage==='wrap'?['block',null]:['sword',.4+.6*clamp(h.f/M.cocoon.total)];
 return [/^(rake\d|hook|brood|cocoon|burst)$/.test(e.clip)?'idle':e.clip||'idle',null];
}
const proxies=new WeakMap();
// A render-only stand-in for the hunter: the Brute rig with no form (it inherits every live field of the player).
function proxyOf(e){let q=proxies.get(e);if(!q){q=Object.create(e);proxies.set(e,q);}return q;}
const SOCKETS=['head','back','hand','chest','tail','legs'],anchorsByHunter=new WeakMap();
function moultsOf(e){let a=anchorsByHunter.get(e);if(!a){a={valid:false,scale:1,dir:1};anchorsByHunter.set(e,a);}return a;}
// Where a socket sits on the drawn form when the sheet does not report it.
function guess(n,x,y,dir,S){
 const w=S*.4;
 return n==='head'?[x+dir*w*.1,y+S*.95]:n==='back'?[x-dir*w*.3,y+S*.72]:n==='hand'?[x+dir*w*.65,y+S*.5]:
  n==='chest'?[x+dir*w*.15,y+S*.62]:n==='legs'?[x+dir*w*.05,y+S*.03]:[x-dir*w*.45,y+S*.35];
}
// Every Moult worn, at 2x and grafted in amber (the Exuvial wears your build; now you wear it doubled).
function grafts(g,e,MA,frame,pass){
 if(pass==='front')for(const n of SOCKETS){const a=MA[n];if(a)bloom(g,a[0],a[1],.55+.08*Math.sin(frame*.12+a[0]),P.amber,.35);}
 drawMoults(g,e,MA,frame,pass);
}
// The whole form for the View: behind layer, the Brute (sheet or procedural, 2.4x), front layer, world effects.
export function drawExuvialFormEntity(view,g,state,e,frame,alpha,load=true){
 if(!e.form){const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;drawShift(view,g,e,frame,alpha,load,x,y,e.facing<0?-1:1,formVisual(ID,'brawler'));return;}
 drawExuvialFormWorld(g,state,e,alpha,frame,false);
 drawBody(view,g,e,frame,alpha,load);
 drawTornPlate(g,state,e,alpha,frame);
}
function drawBody(view,g,e,frame,alpha,load){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1,S=formVisual(ID,'brawler'),k=S/BRUTE,A={x,y,dir,frame,S,layer:'behind'};
 const h=e.exuv||{};
 // The hurt blink hides the body only (brood and shots stay); never during a move: the shape is the cue.
 if(e.inv&&!e.dead&&!h.move&&Math.floor(frame/V.blinkFrames)%2)return;
 drawExuvialForm(g,e,A);
 // Wrapped in the cocoon: only the cocoon (and its hood) is drawn.
 if(h.move==='cocoon'&&h.stage==='wrap'){A.layer='front';drawExuvialForm(g,e,A);return;}
 const MA=moultsOf(e),moults=!!e.moults?.length;
 if(moults&&MA.valid)grafts(g,e,MA,frame,'behind');
 const [name,progress]=clip(e),q=proxyOf(e);
 const mv=MOVES[name];
 Object.assign(q,{form:null,formShift:0,formNext:null,kind:'brawler',emberMax:0,echoFlash:0,facing:dir,
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
   if(!fl)drawTint(g,atlas,f.frame,sx,sy,d,k,.12);
   if(moults)for(const n of SOCKETS)MA[n]=socket(atlas,f.frame,n,sx,sy,d,k)||guess(n,sx,sy,d,S);
   MA.dir=d;
  },anchors:null,low:!!view.mobile};
  view.chars.draw(g,q,frame,alpha,opts);
 }else{
  q.h=BRUTE;q.w=KINDS.brawler.width;
  g.save();g.translate(x,-y);g.scale(k,k);g.translate(-x,y);
  view.chars.draw(g,q,frame,alpha,{sprite:null,anchors:null,low:!!view.mobile});
  g.restore();
  if(moults)for(const n of SOCKETS)MA[n]=guess(n,x,y,dir,S);
  MA.dir=dir;
 }
 A.layer='front';drawExuvialForm(g,e,A);
 // Larger than on any other form (the Husk shows them at 0.8 of its scale): over twice the hero's own Moults.
 if(moults){MA.scale=k*1.1;MA.valid=true;grafts(g,e,MA,frame,'front');}
}
const shifting=new WeakMap();
// The 20f transformation: the hunter's own body (its mask cracking) while the crimson cocoon grows around and splits.
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
 g.save();g.translate(x,-(y+S*.3*(.3+.7*k)));cocoonShape(g,S*.2*(.3+.7*k),S*.32*(.3+.7*k),k,false,frame);g.restore();
 g.globalAlpha=1;
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;
 g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*S*.5,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
}
// Colour check for the tests: the hook-arms' barbs are amber, never the boss's cyan.
export const EXUVIAL_FORM_COLOURS={barb:P.amber,cloth:P.crimson,cocoon:mix(P.crimson,P.crimsonDeep,.5)};
