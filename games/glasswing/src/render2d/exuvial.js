import {EXUVIAL as C} from '../data/exuvial.js';
import {lockAt,floorAt} from '../game/exuvial.js';
import {css,P,mix} from './color.js';
import {glow,seeded} from './surface.js';
import {drawMoults} from './overlays.js';

// The Exuvial and the Moulting Well, drawn procedurally in world units (y up, canvas y = -y). It hangs head-down from
// threads: three stitched abdomen sacks, the thorax, four hook-arms and an inverted mask stitched from hunter masks,
// with two peeling lips. Grafted parts are the hero's own moult drawings at 3x, glowing amber (weak points).
// Colour grammar: cyan = its light and unparryable strikes, an ivory ring = the parryable Rake ender, amber = weak points.
const TAU=Math.PI*2,L=C.arenaLeft,R=C.right,MID=(L+R)/2;
const lerp=(a,b,t)=>a+(b-a)*t;
function bloom(g,x,y,r,color,a=1){
 const sp=glow(color);if(!sp||a<=0)return;
 g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
// Scenery laid out once from fixed seeds: the renderer never touches the simulation RNG.
const rnd=seeded('moulting-well');
const SCENE={
 cocoons:Array.from({length:14},(_,i)=>({x:L-1+rnd()*(R-L+2),y:6+rnd()*19,s:.5+rnd()*.7,ph:rnd()*TAU,d:.25+rnd()*.35})),
 skins:Array.from({length:12},(_,i)=>({x:i%2?L+.3+rnd()*1.2:R-.3-rnd()*1.2,y:2+rnd()*22,s:.8+rnd()*.5,ph:rnd()*TAU,flip:i%2?1:-1})),
 veins:Array.from({length:9},()=>({x:L+rnd()*(R-L),k:rnd()*TAU,w:.03+rnd()*.05})),
 motes:Array.from({length:40},()=>({x:L+rnd()*(R-L),y:rnd()*26,v:.004+rnd()*.01,ph:rnd()*TAU})),
 patches:Array.from({length:4},()=>Array.from({length:7},()=>({a:rnd()*TAU,r:.35+rnd()*.5,s:.25+rnd()*.35,c:rnd()}))),
 tatters:Array.from({length:3},()=>Array.from({length:4},()=>({u:rnd()*2-1,len:.4+rnd()*.6,w:.1+rnd()*.1,ph:rnd()*TAU,c:rnd()}))),
 cracks:Array.from({length:6},()=>({x:rnd()*2-1,y:.6+rnd()*1.9,a:rnd()*TAU,l:.25+rnd()*.45}))
};
// Crimson hunter cloth hanging in strips from a sack's underside (it is wearing what it skinned).
function tatters(g,x,y,rx,i,frame,flash){
 for(const k of SCENE.tatters[i]){
  const ox=x+Math.sign(k.u)*(.5+.45*Math.abs(k.u))*rx,sw=Math.sin(frame*.035+k.ph)*.14,bot=y-k.len;
  // A torn, tapering rag: wide where it is stitched on, ragged at the tip, curling as it sways.
  g.fillStyle=flash?P.ivory:k.c<.7?P.crimson:P.crimsonDeep;g.strokeStyle=css(P.outline,.7);g.lineWidth=.03;
  g.beginPath();g.moveTo(ox-k.w,-y);g.lineTo(ox+k.w,-y);
  g.quadraticCurveTo(ox+k.w*.7+sw*.4,-(y-k.len*.55),ox+k.w*.25+sw,-(bot+.06));
  g.lineTo(ox+sw,-bot);g.lineTo(ox+sw-k.w*.2,-(bot+.12));g.lineTo(ox-k.w*.35+sw*.9,-(bot+.02));
  g.quadraticCurveTo(ox-k.w*.8+sw*.4,-(y-k.len*.5),ox-k.w,-y);g.closePath();g.fill();g.stroke();
  if(k.c<.7){g.strokeStyle=css(P.crimsonLight,.45);g.lineWidth=.03;g.beginPath();g.moveTo(ox,-y);g.quadraticCurveTo(ox+sw*.4,-(y-k.len*.5),ox+sw*.9,-(bot+.1));g.stroke();}
 }
}

// Behind the tiles: the shaft's flesh walls, rib bands, hung cocoons and shed hunter skins, cold light from the top lock.
export function drawWell(g,state,level,view,frame){
 if(!level?.well)return;
 const top=view.y+view.h/2+1,bot=Math.max(-1,view.y-view.h/2-1);
 const gr=g.createLinearGradient(0,-top,0,-bot);
 gr.addColorStop(0,'#120a18');gr.addColorStop(.55,'#1d1024');gr.addColorStop(1,'#0c070f');
 g.fillStyle=gr;g.fillRect(L-3,-top,R-L+6,top-bot);
 // Rib bands across the far wall.
 for(let y=Math.floor(bot);y<top;y+=2.6){
  g.strokeStyle=css(P.furDeep,.9);g.lineWidth=.5;g.beginPath();g.moveTo(L-3,-y);g.quadraticCurveTo(MID,-y-.5,R+3,-y);g.stroke();
  g.strokeStyle=css(P.furLight,.12);g.lineWidth=.08;g.beginPath();g.moveTo(L-3,-y-.22);g.quadraticCurveTo(MID,-y-.72,R+3,-y-.22);g.stroke();
 }
 for(const v of SCENE.veins){
  g.strokeStyle=css(P.cyanDeep,.14);g.lineWidth=v.w;g.beginPath();g.moveTo(v.x,-bot);
  for(let y=bot;y<top;y+=1)g.lineTo(v.x+Math.sin(y*.7+v.k)*.35,-y);g.stroke();
 }
 // Light from the top lock: two cold shafts.
 g.globalCompositeOperation='lighter';
 for(const [x,w,a] of [[47.5,2.2,.07],[53.5,3.1,.05]]){
  const lg=g.createLinearGradient(0,-26,0,-1);lg.addColorStop(0,css(P.cyanHot,a*2));lg.addColorStop(1,css(P.cyan,0));
  g.fillStyle=lg;g.beginPath();g.moveTo(x-w*.3,-26);g.lineTo(x+w*.3,-26);g.lineTo(x+w,-1);g.lineTo(x-w,-1);g.closePath();g.fill();
 }
 g.globalCompositeOperation='source-over';
 // Far cocoons on their threads.
 for(const c of SCENE.cocoons){
  if(c.y<bot-2||c.y>top+3)continue;
  const sw=Math.sin(frame*.012+c.ph)*.08,x=c.x+sw;
  g.strokeStyle=css(P.ash,.12);g.lineWidth=.025;g.beginPath();g.moveTo(c.x,-26);g.lineTo(x,-(c.y+c.s*1.2));g.stroke();
  g.fillStyle=css(mix(P.boneDark,'#1d1024',.55),.8);g.beginPath();g.ellipse(x,-c.y,c.s*.42,c.s*1.2,sw*.4,0,TAU);g.fill();
  g.strokeStyle=css(P.boneShade,.18);g.lineWidth=.03;for(let i=-1;i<=1;i++){g.beginPath();g.ellipse(x,-c.y+i*c.s*.35,c.s*.4,c.s*.12,0,0,Math.PI);g.stroke();}
 }
 // Shed skins of the hunter's tribe pinned to the walls: crimson tatters under an empty ivory mask.
 for(const k of SCENE.skins){
  if(k.y<bot-3||k.y>top+2)continue;
  drawSkin(g,k.x,k.y,k.s,frame*.02+k.ph,k.flip,.7);
 }
 // The walls themselves.
 for(const [x0,x1,d] of [[L-3,L,1],[R,R+3,-1]]){
  const wg=g.createLinearGradient(d>0?x0:x1,0,d>0?x1:x0,0);wg.addColorStop(0,'#08050a');wg.addColorStop(.75,'#24132b');wg.addColorStop(1,'#3b2140');
  g.fillStyle=wg;g.fillRect(x0,-top,x1-x0,top-bot);
  g.strokeStyle=css(P.boneDark,.5);g.lineWidth=.06;
  for(let y=Math.floor(bot);y<top;y+=1.3){const e=d>0?x1:x0;g.beginPath();g.moveTo(e,-y);g.quadraticCurveTo(e-d*.5,-y-.5,e,-y-1.1);g.stroke();}
 }
}
// A shed hunter skin: tattered crimson cloth under an empty crested mask (the only crimson that is not the hero's).
function drawSkin(g,x,y,s,t,dir,a=1){
 g.save();g.translate(x,-y);g.scale(s*dir,s);g.globalAlpha=a;
 g.fillStyle=P.crimsonDeep;g.beginPath();g.moveTo(-.28,-.1);
 for(let i=0;i<=6;i++){const u=i/6;g.lineTo(-.3+u*.6,1.1+Math.sin(t+u*9)*.06+(i%2?.22:0));}
 g.lineTo(.28,-.1);g.closePath();g.fill();
 g.fillStyle=css(P.crimson,.8);g.beginPath();g.moveTo(-.18,0);g.lineTo(.2,0);g.lineTo(.1,.8+Math.sin(t)*.05);g.lineTo(-.06,.95);g.closePath();g.fill();
 g.fillStyle=P.boneShade;g.beginPath();g.ellipse(0,-.28,.24,.3,0,0,TAU);g.fill();
 g.fillStyle=P.ink;g.beginPath();g.ellipse(-.09,-.3,.06,.08,0,0,TAU);g.ellipse(.09,-.3,.06,.08,0,0,TAU);g.fill();
 g.strokeStyle=P.boneShade;g.lineWidth=.05;g.beginPath();g.moveTo(-.18,-.45);g.quadraticCurveTo(-.4,-.7,-.3,-.9);g.moveTo(.18,-.45);g.quadraticCurveTo(.4,-.7,.3,-.9);g.stroke();
 g.restore();g.globalAlpha=1;
}

// Over the tiles: the silk lid (P1 floor) and the cocoon pods, from the level grid (render reads only).
function floors(g,state,frame){
 const grid=state.level?.grid;if(!grid)return;
 const lid=grid[C.lid.row];
 if(lid&&lid[45]===1){
  const y=C.lid.row+1;
  g.fillStyle='#1a0f1e';g.fillRect(L,-y,R-L,1.05);
  const mg=g.createLinearGradient(0,-y-.1,0,-y+.6);mg.addColorStop(0,P.boneRim);mg.addColorStop(.25,P.bone);mg.addColorStop(1,css(P.boneDark,.2));
  g.fillStyle=mg;g.beginPath();g.moveTo(L,-y-.06);
  for(let x=L;x<=R;x+=.5)g.lineTo(x,-y-.06+Math.sin(x*1.7)*.03);
  g.lineTo(R,-y+.5);for(let x=R;x>=L;x-=.5)g.lineTo(x,-y+.5+Math.sin(x*2.3+1)*.12);g.closePath();g.fill();
  // Silk strands sag under the membrane and stitch it to the walls.
  g.strokeStyle=css(P.boneShade,.45);g.lineWidth=.025;
  for(let x=L+.4;x<R;x+=.9){g.beginPath();g.moveTo(x,-y+.4);g.quadraticCurveTo(x+.45,-y+1.3+Math.sin(frame*.03+x)*.08,x+.9,-y+.4);g.stroke();}
  g.strokeStyle=css(P.boneDark,.7);g.lineWidth=.03;
  for(let x=L+.7;x<R;x+=1.4){g.beginPath();g.moveTo(x-.12,-y+.05);g.lineTo(x+.12,-y+.25);g.moveTo(x+.12,-y+.05);g.lineTo(x-.12,-y+.25);g.stroke();}
 }
 for(const p of C.pods){
  if(grid[p.row]?.[p.x0]!==2&&grid[p.row]?.[p.x1-1]!==2)continue;
  for(let x=p.x0;x<p.x1;x++){
   if(grid[p.row][x]!==2)continue;
   const cx=x+.5,y=p.row+1;
   const pg=g.createLinearGradient(0,-y,0,-y+.8);pg.addColorStop(0,P.boneRim);pg.addColorStop(.4,P.boneShade);pg.addColorStop(1,P.boneDark);
   g.fillStyle=pg;g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.ellipse(cx,-y+.34,.56,.42,0,0,TAU);g.fill();g.stroke();
   g.strokeStyle=css(P.boneDark,.6);g.lineWidth=.025;g.beginPath();g.ellipse(cx,-y+.34,.4,.1,0,0,Math.PI);g.stroke();
   g.strokeStyle=css(P.ash,.3);g.beginPath();g.moveTo(cx,-y+.76);g.lineTo(cx+Math.sin(frame*.02+x)*.1,-y+1.6);g.stroke();
  }
 }
}

// One stitched sack of shed skins (a body segment), centred at (x, y), radii rx, ry.
function sack(g,x,y,rx,ry,tilt,i,flash,frame){
 g.save();g.translate(x,-y);g.rotate(tilt);
 const gr=g.createRadialGradient(-rx*.3,-ry*.3,ry*.1,0,0,Math.max(rx,ry)*1.1);
 gr.addColorStop(0,flash?P.ivory:P.furLight);gr.addColorStop(.55,flash?P.bone:P.fur);gr.addColorStop(1,P.furDeep);
 g.fillStyle=gr;g.strokeStyle=P.outline;g.lineWidth=.07;
 g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();g.stroke();
 g.save();g.beginPath();g.ellipse(0,0,rx*.98,ry*.98,0,0,TAU);g.clip();
 // Patches: crimson hunter cloth and ivory mask shards, stitched on.
 for(const p of SCENE.patches[i%4]){
  const px=Math.cos(p.a)*rx*p.r,py=Math.sin(p.a)*ry*p.r,w=p.s*rx,h=p.s*ry*.8;
  g.fillStyle=p.c<.45?css(P.crimsonDeep,.95):p.c<.7?css(P.boneShade,.9):css('#2a1530',.95);
  g.beginPath();g.moveTo(px-w,py-h*.6);g.lineTo(px+w*.8,py-h);g.lineTo(px+w,py+h*.7);g.lineTo(px-w*.6,py+h);g.closePath();g.fill();
  if(p.c<.45){g.fillStyle=css(P.crimson,.5);g.fillRect(px-w*.6,py-h*.2,w*1.1,h*.25);}
  g.strokeStyle=css(P.bone,.75);g.lineWidth=.03;g.beginPath();
  for(let k=0;k<4;k++){const u=k/3,sx=lerp(px-w,px+w*.8,u),sy=lerp(py-h*.6,py-h,u);g.moveTo(sx-.05,sy-.07);g.lineTo(sx+.05,sy+.07);}
  g.stroke();
 }
 // Its own cold light leaks through the seams.
 g.strokeStyle=css(P.cyan,.22+.1*Math.sin(frame*.05+i));g.lineWidth=.04;g.beginPath();g.moveTo(-rx*.9,ry*.1);g.quadraticCurveTo(0,ry*.45,rx*.9,ry*.05);g.stroke();
 g.restore();
 g.strokeStyle=css(P.boneRim,.25);g.lineWidth=.05;g.beginPath();g.ellipse(-rx*.1,-ry*.08,rx*.86,ry*.84,0,3.6,5.2);g.stroke();
 g.restore();
}
// A two-segment hook-arm from the shoulder (sx, sy) to the hand (hx, hy), elbow bent outward by side.
function arm(g,sx,sy,hx,hy,side,cyan,flash){
 const mx=(sx+hx)/2+side*.9,my=(sy+hy)/2+.4;
 g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=P.outline;g.lineWidth=.3;g.beginPath();g.moveTo(sx,-sy);g.lineTo(mx,-my);g.lineTo(hx,-hy);g.stroke();
 g.strokeStyle=flash?P.ivory:P.boneShade;g.lineWidth=.19;g.beginPath();g.moveTo(sx,-sy);g.lineTo(mx,-my);g.lineTo(hx,-hy);g.stroke();
 g.strokeStyle=css(P.boneRim,.5);g.lineWidth=.05;g.beginPath();g.moveTo(sx,-sy);g.lineTo(mx,-my);g.stroke();
 g.fillStyle=P.bone;g.beginPath();g.arc(mx,-my,.13,0,TAU);g.fill();
 hook(g,hx,hy,Math.atan2(-(hy-my),hx-mx),cyan);
}
// The hook head: a curved cyan-edged barb (cyan = never parry it).
function hook(g,x,y,a,cyan){
 g.save();g.translate(x,-y);g.rotate(a);
 g.fillStyle=P.boneRim;g.strokeStyle=P.outline;g.lineWidth=.04;
 g.beginPath();g.moveTo(-.1,-.08);g.quadraticCurveTo(.45,-.25,.5,.15);g.quadraticCurveTo(.32,0,.18,.12);g.quadraticCurveTo(.05,.05,-.1,.08);g.closePath();g.fill();g.stroke();
 if(cyan>0){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyan,.4+.6*cyan);g.lineWidth=.05;g.beginPath();g.moveTo(.08,-.12);g.quadraticCurveTo(.45,-.25,.5,.15);g.stroke();g.globalCompositeOperation='source-over';}
 g.restore();
 if(cyan>0)bloom(g,x,y,.5+.5*cyan,P.cyan,.35+.5*cyan);
}
// The inverted mask: crest pointing down, eye holes of cold light, two peeling lips at the bottom.
function head(g,x,y,peel,eyes,flash,glass,frame,amber){
 g.save();g.translate(x,-y);
 const w=C.head.w*.55;
 // Horns of the stitched masks curl up around the face.
 g.strokeStyle=P.outline;g.lineWidth=.22;g.lineCap='round';
 for(const s of [-1,1]){g.beginPath();g.moveTo(s*w*.7,-2.1);g.quadraticCurveTo(s*w*1.6,-2.6,s*w*1.45,-1.2);g.stroke();}
 g.strokeStyle=flash?P.ivory:P.boneShade;g.lineWidth=.14;
 for(const s of [-1,1]){g.beginPath();g.moveTo(s*w*.7,-2.1);g.quadraticCurveTo(s*w*1.6,-2.6,s*w*1.45,-1.2);g.stroke();}
 const mg=g.createLinearGradient(-w,0,w,0);mg.addColorStop(0,P.boneShade);mg.addColorStop(.45,flash?P.ivory:P.bone);mg.addColorStop(1,P.boneDark);
 g.fillStyle=glass?mix(P.bone,P.cyanDeep,.25):mg;g.strokeStyle=P.outline;g.lineWidth=.07;
 g.beginPath();g.moveTo(-w,-2.6);g.bezierCurveTo(-w*1.1,-1.4,-w*.8,-.6,-w*.32,-.25);g.lineTo(0,-.05);g.lineTo(w*.32,-.25);g.bezierCurveTo(w*.8,-.6,w*1.1,-1.4,w,-2.6);
 g.quadraticCurveTo(0,-3.05,-w,-2.6);g.closePath();g.fill();g.stroke();
 // Form shading: the far cheek in shadow, the crest darkened, hairline cracks of old mask bone.
 g.save();g.clip();
 const sh=g.createLinearGradient(0,-3,0,0);sh.addColorStop(0,css(P.ink,.0));sh.addColorStop(.6,css(P.ink,.05));sh.addColorStop(1,css(P.ink,.42));
 g.fillStyle=sh;g.fillRect(-w*1.2,-3.1,w*2.4,3.1);
 g.fillStyle=css(P.ink,.22);g.beginPath();g.ellipse(w*.95,-1.5,w*.45,1.5,0,0,TAU);g.fill();
 g.strokeStyle=css(P.boneDark,.7);g.lineWidth=.025;
 for(const c of SCENE.cracks){const cx=c.x*w*.75,cy=-c.y;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(c.a)*c.l,cy+Math.sin(c.a)*c.l);g.lineTo(cx+Math.cos(c.a+.6)*c.l*1.5,cy+Math.sin(c.a+.6)*c.l*1.4);g.stroke();}
 g.restore();
 // Stitches where several masks were sewn into one.
 g.strokeStyle=css(P.boneDark,.85);g.lineWidth=.035;
 g.beginPath();g.moveTo(-w*.15,-2.85);g.lineTo(w*.1,-1.9);g.lineTo(-w*.05,-1.1);g.stroke();
 for(let k=0;k<5;k++){const u=k/4,sx=lerp(-w*.15,w*.1,u),sy=lerp(-2.85,-1.9,u);g.beginPath();g.moveTo(sx-.09,sy);g.lineTo(sx+.09,sy);g.stroke();}
 // Eye holes: its cold light (amber while the body lies open).
 const ec=amber?P.amberHot:P.cyan;
 for(const s of [-1,1]){
  g.fillStyle=P.ink;g.beginPath();g.ellipse(s*w*.42,-1.55,.24,.17,s*.3,0,TAU);g.fill();
  g.fillStyle=css(ec,.5+.5*eyes);g.beginPath();g.ellipse(s*w*.42,-1.52,.1,.07,s*.3,0,TAU);g.fill();
  // Its light runs from the holes like tears (upward: it hangs head-down).
  g.strokeStyle=css(ec,.18+.3*eyes);g.lineWidth=.04;g.beginPath();g.moveTo(s*w*.42,-1.7);g.quadraticCurveTo(s*w*.47,-2.05,s*w*.4,-2.4-.1*Math.sin(frame*.05+s));g.stroke();
 }
 g.restore();
 for(const s of [-1,1])bloom(g,x+s*w*.42,y+1.52,.35+.4*eyes,amber?P.amber:P.cyan,.35+.5*eyes);
 // The two lips (stitched skin flaps) peel back to show the maw.
 g.save();g.translate(x,-y);
 if(peel>0){bloom(g,x,y+.25,.9+peel,glass?P.amber:P.cyan,.3+.6*peel);g.fillStyle=css(P.cyanHot,.25+.6*peel);g.beginPath();g.ellipse(0,-.35,.32*peel+.05,.22,0,0,TAU);g.fill();}
 for(const s of [-1,1]){
  g.save();g.rotate(s*peel*.9);
  g.fillStyle=flash?P.ivory:P.crimsonDeep;g.strokeStyle=P.outline;g.lineWidth=.05;
  g.beginPath();g.moveTo(0,-.55);g.quadraticCurveTo(s*.55,-.6,s*.62,-.15);g.quadraticCurveTo(s*.35,.2,0,.05);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.bone,.7);g.lineWidth=.025;g.beginPath();g.moveTo(s*.1,-.45);g.lineTo(s*.5,-.2);g.stroke();
  g.restore();
 }
 g.restore();
}
// Sockets of the hanging rig (world points) where grafts are drawn at 3x.
function sockets(x,y,dir){
 return {head:[x,y+.15],back:[x-dir*1.2,y+3.4],hand:[x+dir*1.7,y+2.1],chest:[x,y+3.1],tail:[x-dir*.6,y+5.6],legs:[x+dir*.9,y+4.9],scale:2.4,dir};
}
const one=[''],holder={moults:one};
function part(g,id,slot,a,frame,flip){
 one[0]=id;
 const k=slot==='horns'?'head':slot==='arms'?'hand':slot==='legs'?(id.startsWith('tail')?'tail':'legs'):slot==='sigil'?'chest':'back';
 const at=a[k];if(!at)return;
 bloom(g,at[0],at[1],1.5+.2*Math.sin(frame*.15),P.amber,.55);
 g.save();
 if(flip){g.translate(0,-2*at[1]);g.scale(1,-1);}
 drawMoults(g,holder,a,frame,'behind');drawMoults(g,holder,a,frame,'front');
 g.restore();
}
const partAnchor=(x,y,s)=>({head:[x,y],back:[x,y],hand:[x,y],chest:[x,y],tail:[x,y],legs:[x,y],scale:s,dir:1});

export function drawExuvialWorld(g,state,e,frame,alpha){
 const x=e.phx+(e.hx-e.phx)*alpha,y=e.phy+(e.hy-e.phy)*alpha,a=e.act,glass=e.glass&&e.ai!=='spent';
 floors(g,state,frame);
 // Desperation: the Well darkens around the chimera.
 if(glass||e.ai==='spent'){const d=e.ai==='spent'?.25:.35+.1*Math.sin(frame*.1);g.fillStyle=`rgba(4,2,6,${d})`;g.fillRect(L-3,-(y+20),R-L+6,40);}
 // Debris dust, falling skins.
 // The dust trickles from the top of the shaft down to the floor the debris will hit (not from the body, which may be high).
 for(const f of e.falls)if(f.t<=C.debris.warn){const fl=floorAt(state.level,f.x,C.debris.y);g.fillStyle=css(P.ash,.1+.3*(1-f.t/C.debris.warn));g.fillRect(f.x-.1,-C.debris.y,.2,C.debris.y-fl);}
 for(const k of e.skins){
  g.fillStyle=css(P.ink,.35);g.beginPath();g.ellipse(k.x,-k.fl,.5,.1,0,0,TAU);g.fill();
  drawSkin(g,k.x,k.y,.9,frame*.2,1,1);
 }
 const dir=state.players[0]&&state.players[0].x<x?-1:1,flash=e.flash>0;
 const hit=a&&(a.stage==='drop'||a.stage==='swipe'||a.stage==='active');
 // Telegraph strength: 0 at the tell start, 1 at the strike.
 const tell=a&&(a.stage==='tell'||a.stage==='wind')?1-a.t/a.frames:0;
 const cyanTell=a&&a.id!=='rake'?tell:0;
 // Threads from the top lock to the abdomen.
 const top=y+3+2*2.15+2.4,sway=Math.sin(frame*.018)*.25;
 if(e.ai!=='cocoon'||e.cocoon?.stage==='wrap'){
  g.strokeStyle=css(P.ash,.55);g.lineWidth=.04;
  for(const o of [-1.1,-.4,.3,1]){g.beginPath();g.moveTo(x+o*1.4+sway*.3,-(C.top+3));g.quadraticCurveTo(x+o*1.1,-(top+3),x+o*.6+sway,-top);g.stroke();}
  g.strokeStyle=css(P.cyanHot,.12);g.lineWidth=.12;g.beginPath();g.moveTo(x+sway*.3,-(C.top+3));g.lineTo(x+sway,-top);g.stroke();
 }
 if(e.ai==='cocoon'&&e.cocoon?.stage==='shell'){cocoonBody(g,e,x,y,frame);overlays(g,state,e,x,y,frame);return;}
 // Abdomen sacks (swaying more toward the top), thorax, arms, head.
 const slam=a&&a.id==='slam'&&a.stage==='rest'?Math.max(0,1-(a.frames-a.t)/10):0,squash=1-slam*.18;
 const ty=y+3;
 // Its shadow pools on the floor under it (darker as it comes down).
 const fl=floorAt(state.level,x,y+.5),near=Math.max(0,1-(y-fl)/9),rags=[];
 g.fillStyle=css(P.ink,.18+.3*near);g.beginPath();g.ellipse(x,-fl-.02,2.6-1*near,.22,0,0,TAU);g.fill();
 for(let i=2;i>=0;i--){
  const sx=x+Math.sin(frame*.025+i*1.3)*.12*(i+1)+sway*(i+1)*.3,sy=ty+1.3+i*2.15*squash,rx=[1.9,1.6,1.15][i],ry=[1.25,1.15,1][i];
  sack(g,sx,sy+.4,rx,ry,Math.sin(frame*.02+i)*.06,i,flash,frame);
  rags[i]=[sx,sy+.4-ry*.55,rx];
  // Two shed hunter skins hang off the middle sack on threads: its trophies.
  if(i===1)for(const s of [-1,1]){
   const hx=sx+s*(rx+.35)+Math.sin(frame*.03+s)*.08,hy=sy-.6;
   g.strokeStyle=css(P.ash,.5);g.lineWidth=.03;g.beginPath();g.moveTo(sx+s*rx*.8,-(sy+.6));g.lineTo(hx,-(hy+.35));g.stroke();
   drawSkin(g,hx,hy,.75,frame*.05+s,s,.95);
  }
 }
 // Wings of a stolen back part spread during Wing Burst (or in desperation, on the wrong socket).
 if(a&&(a.id==='burst'||a.id==='storm')&&(a.stage==='tell'||a.stage==='volley'||a.stage==='droop')||glass)wings(g,x,ty+1,a?.stage==='tell'?tell:1,frame,glass);
 // Hook-arms: two folded around the head, two reaching; the one that throws the hook extends to its tip.
 const reach=a&&a.id==='hook'&&(a.stage==='active'||a.stage==='retract');
 for(const s of [-1,1]){
  arm(g,x+s*1.1,ty+.6,x+s*1.25,y+.7,s,cyanTell*(a?.id==='hook'?1:.35),flash);
  if(!(reach&&s===(a.ex>x?1:-1))){
   let hx=x+s*2.2,hy=ty-.6;
   if(a?.id==='rake'&&s===a.dir){const sw=a.stage==='swipe'?1-a.t/a.frames:0;hx=x+s*(1.4+2.4*sw);hy=a.fl+.8+(a.stage==='wind'?1.2*tell:0)-sw*.4;}
   arm(g,x+s*1.4,ty+1.1,hx,hy,s,0,flash);
  }
 }
 if(reach){
  // The thrown hook: a cyan silk line and the barb at its tip.
  g.strokeStyle=css(P.cyan,.9);g.lineWidth=.06;g.beginPath();g.moveTo(x,-(y+.4));g.lineTo(a.tx,-a.ty);g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyanHot,.3);g.lineWidth=.22;g.beginPath();g.moveTo(x,-(y+.4));g.lineTo(a.tx,-a.ty);g.stroke();g.globalCompositeOperation='source-over';
  hook(g,a.tx,a.ty,Math.atan2(-(a.ty-y-.4),a.tx-x),1);
 }
 // The thorax plate.
 g.save();g.translate(x,-(ty+.5));
 const tg=g.createLinearGradient(-1.5,0,1.5,0);tg.addColorStop(0,P.boneDark);tg.addColorStop(.5,flash?P.ivory:P.boneShade);tg.addColorStop(1,P.boneDark);
 g.fillStyle=tg;g.strokeStyle=P.outline;g.lineWidth=.07;g.beginPath();g.ellipse(0,0,1.45,.75,0,0,TAU);g.fill();g.stroke();
 g.strokeStyle=css(P.boneDark,.8);g.lineWidth=.04;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*.45,-.65);g.quadraticCurveTo(k*.5,0,k*.4,.65);g.stroke();}
 g.restore();
 // The skinned cloth drapes over the sacks' flanks and the thorax.
 for(let i=2;i>=0;i--)tatters(g,rags[i][0],rags[i][1],rags[i][2],i,frame,flash);
 // Grafts at 3x on its sockets, amber: the weak points it stole. Horns hang from the inverted head.
 const S=sockets(x,y,dir);
 for(const gr of e.grafts){
  const pl=a?.stage==='plant'&&a.slot===gr.slot;
  if(pl)continue;
  part(g,gr.id,gr.slot,S,frame,gr.slot==='horns');
 }
 // Desperation: every part on the wrong socket (horns as claws, tail as mandibles).
 if(glass)for(const [id,k] of [['horns-ram','hand'],['tail-root','head'],['arms-hook','tail']]){one[0]=id;const at=S[k];g.save();g.globalAlpha=.85;drawMoults(g,holder,{...S,[id.startsWith('horns')?'head':id.startsWith('tail')?'tail':'hand']:at},frame,'behind');drawMoults(g,holder,{...S,[id.startsWith('horns')?'head':id.startsWith('tail')?'tail':'hand']:at},frame,'front');g.restore();}
 const open=e.ai==='open'||e.ai==='spent';
 const peel=a?.id==='hook'?(a.stage==='tell'?tell:a.stage==='active'?1:Math.max(0,1-(a.frames-a.t)/8)):a?.id==='rain'&&a.stage==='tell'?tell*.5:glass?.5+.3*Math.sin(frame*.3):open?1:0;
 head(g,x,y,peel,Math.max(cyanTell,glass?.8:.3),flash,glass,frame,open);
 if(open){
  // The stitched body splits: amber light pours out of the seam (hit it).
  const k=e.ai==='spent'?1:Math.min(1,e.open/8);
  bloom(g,x,y+1.4,2.2+.2*Math.sin(frame*.3),P.amber,.65*k+.2);
  g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.1;g.beginPath();g.moveTo(x-.1,-(y+.3));g.lineTo(x+.2,-(y+1.1));g.lineTo(x-.15,-(y+1.8));g.lineTo(x+.1,-(y+2.6));g.stroke();
 }
 overlays(g,state,e,x,y,frame);
}
function wings(g,x,y,k,frame,glass){
 for(const s of [-1,1]){
  g.save();g.translate(x+s*.8,-y);g.scale(s*(.3+.7*k),1);
  const wg=g.createLinearGradient(0,0,3,0);wg.addColorStop(0,css(glass?P.amberDeep:P.furDeep,.9));wg.addColorStop(1,css(P.cyanDeep,.25));
  g.fillStyle=wg;g.strokeStyle=css(P.cyan,.6);g.lineWidth=.04;
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(1.5,-1.6+Math.sin(frame*.2)*.1,3.2,-.8,3.4,.6);g.bezierCurveTo(2.4,.4,1.6,1.4,.2,.6);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.cyan,.35);for(let i=1;i<4;i++){g.beginPath();g.moveTo(.1,.1);g.lineTo(3.2*i/4+.4,-1.1+i*.45);g.stroke();}
  g.restore();
 }
}
function cocoonBody(g,e,x,y,frame){
 const c=e.cocoon,k=c.hits/C.cocoon.hits,late=c.t<60?1-c.t/60:0,shake=late?Math.sin(frame*1.7)*.06*late:0;
 g.save();g.translate(x+shake,-(y+1.8));
 const cg=g.createLinearGradient(-1.5,0,1.5,0);cg.addColorStop(0,P.boneShade);cg.addColorStop(.5,e.flash>0?P.ivory:P.bone);cg.addColorStop(1,P.boneDark);
 g.fillStyle=cg;g.strokeStyle=P.outline;g.lineWidth=.08;g.beginPath();g.ellipse(0,0,1.55,1.85,0,0,TAU);g.fill();g.stroke();
 g.strokeStyle=css(P.boneDark,.5);g.lineWidth=.04;for(let i=-3;i<=3;i++){g.beginPath();g.ellipse(0,i*.45,1.5*Math.cos(i*.3),.2,0,0,Math.PI);g.stroke();}
 // Cracks: amber where the hunter has hit it, cyan as it is about to burst out.
 g.strokeStyle=css(P.amberHot,.95);g.lineWidth=.06;
 for(let i=0;i<c.hits;i++){const a=i*2.1;g.beginPath();g.moveTo(Math.cos(a)*.3,Math.sin(a)*.4);g.lineTo(Math.cos(a)*.9,Math.sin(a)*1.1);g.lineTo(Math.cos(a+.3)*1.3,Math.sin(a+.3)*1.6);g.stroke();}
 if(late){g.strokeStyle=css(P.cyan,.5+.5*late);g.lineWidth=.05;for(let i=0;i<5;i++){const a=i*1.3+.5;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*1.4,Math.sin(a)*1.7);g.stroke();}}
 g.restore();
 bloom(g,x,y+1.8,1.2+k*1.5,P.amber,.2+.6*k);
 if(late)bloom(g,x,y+1.8,2+late,P.cyan,.5*late);
}
// Telegraphs and strikes in the world: shadows, aim lines, rings, pillars, the tail, planted parts, flying parts.
function overlays(g,state,e,x,y,frame){
 const a=e.act;
 if(a){
  const tell=a.stage==='tell'?1-a.t/a.frames:0,locked=a.stage==='tell'&&a.t<=a.frames*lockAt(a.id);
  if(a.id==='hook'&&a.stage==='tell'&&locked){
   // The aim: a flickering cyan thread to the locked point.
   g.setLineDash?.([.25,.2]);g.strokeStyle=css(P.cyan,.25+.5*tell);g.lineWidth=.035;g.beginPath();g.moveTo(x,-(y+.4));g.lineTo(a.x,-a.y);g.stroke();g.setLineDash?.([]);
   bloom(g,a.x,a.y,.5+.3*tell,P.cyan,.3+.4*tell);
  }
  if((a.id==='slam'||a.id==='gore')&&(a.stage==='tell'||a.stage==='drop')){
   const w=C.moves[a.id].w,k=a.stage==='drop'?1:tell,fl=a.stage==='drop'?a.fl:a.fl;
   g.fillStyle=css(P.ink,.3+.45*k);g.beginPath();g.ellipse(a.x,-fl-.02,w/2*(.6+.4*k),.18,0,0,TAU);g.fill();
   if(locked||a.stage==='drop'){g.strokeStyle=css(P.cyan,.35+.5*k);g.lineWidth=.04;g.beginPath();g.ellipse(a.x,-fl-.02,w/2,.2,0,0,TAU);g.stroke();
    if(a.id==='gore'){g.globalCompositeOperation='lighter';g.fillStyle=css(P.cyan,.08+.15*k);g.fillRect(a.x-w/2,-(y+.3),w,y+.3-fl);g.globalCompositeOperation='source-over';}}
  }
  if(a.id==='slam'&&a.stage==='rest'&&a.frames-a.t<10){
   // Impact frame: a white ring and a cyan dust wave.
   const q=(a.frames-a.t)/10;g.strokeStyle=css(P.ivory,1-q);g.lineWidth=.12*(1-q)+.02;g.beginPath();g.ellipse(x,-a.fl,1.2+3*q,.3+.4*q,0,0,TAU);g.stroke();
   bloom(g,x,a.fl+.3,2.5*(1-q)+.5,P.cyan,.5*(1-q));
  }
  if(a.id==='rake'){
   const k=C.moves.rake;
   if(a.stage==='wind'&&a.n===k.swipes-1){
    // The ender carries the ivory flash ring: parry it.
    const q=1-a.t/a.frames,cx=x+a.dir*1.9,cy=a.fl+1;
    g.strokeStyle=css(P.ivory,.45+.55*q);g.lineWidth=.06+.05*q;g.beginPath();g.arc(cx,-cy,1.4-.6*q,0,TAU);g.stroke();
    if(Math.floor(frame/4)%2){g.strokeStyle=css(P.ivory,.9);g.lineWidth=.03;g.beginPath();g.arc(cx,-cy,1.7-.6*q,0,TAU);g.stroke();}
    bloom(g,cx,cy,1+q,'#fff6e4',.25+.5*q);
   }
   if(a.stage==='swipe'){
    const q=1-a.t/a.frames,x0=x+a.dir*k.x0,x1=x+a.dir*k.x1,ender=a.n===k.swipes-1;
    g.strokeStyle=css(ender?P.ivory:P.boneRim,.9-.6*q);g.lineWidth=.16;g.lineCap='round';
    g.beginPath();g.moveTo(x0,-(a.fl+k.h));g.quadraticCurveTo((x0+x1)/2+a.dir*.9,-(a.fl+k.h*.8),x1,-(a.fl+.25+q*.3));g.stroke();
    g.strokeStyle=css(P.boneDark,.6-.4*q);g.lineWidth=.05;g.beginPath();g.moveTo(x0,-(a.fl+k.h-.25));g.quadraticCurveTo((x0+x1)/2+a.dir*.6,-(a.fl+k.h*.6),x1,-(a.fl+.1));g.stroke();
   }
  }
  if(a.id==='sweep'){
   const k=C.moves.sweep,tip=a.stage==='active'?a.tip??a.x0:a.stage==='tell'?a.x0:null;
   if(tip!==null){
    // The tail: stitched segments from the abdomen down to the floor and along it to the cyan tip.
    const ax=x-Math.sign(a.x1-a.x0)*.6,ay=y+5.2,k2=a.stage==='tell'?1-a.t/a.frames:1;
    g.strokeStyle=P.outline;g.lineWidth=.42;g.lineCap='round';g.beginPath();g.moveTo(ax,-ay);g.quadraticCurveTo(a.x0,-(ay-1),tip,-(a.fl+.4));g.stroke();
    g.strokeStyle=P.fur;g.lineWidth=.3;g.beginPath();g.moveTo(ax,-ay);g.quadraticCurveTo(a.x0,-(ay-1),tip,-(a.fl+.4));g.stroke();
    g.strokeStyle=css(P.crimson,.8);g.lineWidth=.08;g.setLineDash?.([.3,.25]);g.beginPath();g.moveTo(ax,-ay);g.quadraticCurveTo(a.x0,-(ay-1),tip,-(a.fl+.4));g.stroke();g.setLineDash?.([]);
    g.fillStyle=P.boneRim;g.beginPath();g.ellipse(tip,-(a.fl+.4),k.w/2,.3,0,0,TAU);g.fill();
    bloom(g,tip,a.fl+.4,.9+.5*k2,P.cyan,.35+.55*k2);
    if(a.stage==='active'){g.globalCompositeOperation='lighter';g.fillStyle=css(P.cyan,.18);g.fillRect(Math.min(a.x0,tip),-(a.fl+k.h),Math.abs(tip-a.x0),k.h);g.globalCompositeOperation='source-over';}
   }
  }
  if(a.rings&&(a.id==='sigil'||a.stage==='sigil')){
   const k=C.moves.sigil,act=a.stage==='active'||a.stage==='sigil'&&a.t<k.active,prog=a.stage==='tell'?1-a.t/a.frames:a.stage==='sigil'?1-Math.max(0,a.t-k.active)/(C.moves.storm.ring-k.active):1;
   const lk=a.stage==='tell'?a.t<=a.frames*lockAt('sigil'):a.stage!=='sigil'||a.t<=C.moves.storm.lock;
   for(const r of a.rings){
    // Your sigil, inverted: a cyan circle-and-cross on the floor, then a pillar of cold light. The outer ring is the
    // true zone from the start (faint while it follows you, thick once it locks); the inner ring closes in as the timer.
    g.save();g.translate(r.x,-(r.fl+.02));g.scale(1,.28);
    g.strokeStyle=css(P.cyan,lk?.55+.4*prog:.22);g.lineWidth=lk?.17:.08;g.beginPath();g.arc(0,0,k.radius,0,TAU);g.stroke();
    g.strokeStyle=css(P.cyanHot,.3+.6*prog);g.lineWidth=.1;g.beginPath();g.arc(0,0,k.radius*(.25+.75*prog),0,TAU);g.stroke();
    g.beginPath();g.moveTo(-k.radius,0);g.lineTo(k.radius,0);g.moveTo(0,-k.radius);g.lineTo(0,k.radius);g.stroke();
    g.restore();
    if(act){
     const lg=g.createLinearGradient(r.x-k.radius,0,r.x+k.radius,0);lg.addColorStop(0,css(P.cyan,0));lg.addColorStop(.5,css(P.cyanHot,.85));lg.addColorStop(1,css(P.cyan,0));
     g.globalCompositeOperation='lighter';g.fillStyle=lg;g.fillRect(r.x-k.radius,-(r.fl+k.height),k.radius*2,k.height);g.globalCompositeOperation='source-over';
     bloom(g,r.x,r.fl+.3,1.6,P.cyan,.8);
    }
   }
  }
  if(a.stage==='plant'&&e.planted){
   // The torn-in part, planted low on a taut cyan thread: amber, hit it three times.
   const p=e.planted,gr=e.grafts.find(q=>q.slot===p.slot),k=Math.min(1,(a.frames-a.t)/6),hits=e.tearHits.length;
   g.strokeStyle=css(P.cyan,.6);g.lineWidth=.05;g.beginPath();g.moveTo(x,-(y+.6));g.lineTo(p.x,-(p.y+p.h*.6));g.stroke();
   bloom(g,p.x,p.y+p.h*.5,1.2+.4*hits+.15*Math.sin(frame*.4),P.amber,.5+.3*k);
   if(gr)part(g,gr.id,gr.slot,partAnchor(p.x,p.y+p.h*.4,2.2),frame,false);
   g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.05;for(let i=0;i<hits;i++){g.beginPath();g.arc(p.x,-(p.y+p.h*.5),.6+i*.25,0,TAU);g.stroke();}
  }
 }
 // A part in flight between the hunter and the boss (20f), with its amber trail.
 for(const f of e.flying){
  const q=1-f.t/C.fly,to=f.to>0?{x:e.hx,y:e.hy+2}:state.players.find(p=>p.id===-f.to)||{x:f.x,y:f.y,h:0};
  const px=lerp(f.x,to.x,q),py=lerp(f.y,to.y+(to.h||0)*.6,q)+Math.sin(q*Math.PI)*1.5;
  bloom(g,px,py,.8,P.amber,.8);
  part(g,f.id,f.slot,partAnchor(px,py,1.3),frame,false);
 }
}
// The camera frames the whole Well width, the hunter's floor and the hanging head (render only). The box keeps one
// height, so the zoom never breathes (a zoom bucket change repaints every cached sprite: a visible hitch on phones),
// and it holds between attempts too (no Exuvial alive): the view never leaves the Well for the Nest behind its walls.
export function wellFocus(view,e,players){
 const f=view.wfocus||(view.wfocus={});
 let fl=99;for(const p of players)if(!p.dead)fl=Math.min(fl,p.y);
 if(fl===99)for(const p of players)fl=Math.min(fl,p.y);
 if(fl===99)fl=1;
 f.left=L;f.right=R;f.bottom=Math.max(.5,Math.min(fl,e?e.hy:fl)-.4);f.top=f.bottom+(R-L)*.56;
 return f;
}
