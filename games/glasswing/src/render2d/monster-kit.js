import {css,P} from './color.js';
import {glow} from './surface.js';

// Shared drawing verbs of the spoke families (src/render2d/nave.js, mere.js, hindwing.js). World units (tiles); the
// caller translates to the monster's feet and mirrors for facing, so +x is forward and -y is up.
export const TAU=Math.PI*2;
export const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
// Material palettes, one per spoke (colour grammar: their light is cyan; amber only on weak points).
export const WAX={wax:'#e9dcb6',waxShade:'#b9a478',waxDark:'#6f5e44',waxRim:'#fff4d6',soot:'#1c1416',sootLight:'#3d2e2c',bronze:'#5a4232',bronzeLight:'#8c6a4c'};
export const SCALE={silver:'#d7e0ec',silverShade:'#8c9bb4',silverDark:'#3c4660',deep:'#1d2238',plum:'#3a2848',plumLight:'#6a4f80',gleam:'#ffffff'};
export const FUNGUS={cap:'#e4d8c2',capShade:'#a99a80',gill:'#6f6252',flesh:'#3a2533',fleshLight:'#5e3d50',chitin:'#efe3c8',chitinShade:'#b8a582',chitinDark:'#6e5e46',sand:'#c9a66b',stalk:'#d9d1bf'};

export function glowAt(g,color,x,y,r,a=1){
 const sp=glow(color);if(!sp||r<=0||a<=0)return;
 const o=g.globalCompositeOperation,al=g.globalAlpha;
 g.globalCompositeOperation='lighter';g.globalAlpha=al*Math.min(1,a);g.drawImage(sp,x-r,y-r,r*2,r*2);
 g.globalAlpha=al;g.globalCompositeOperation=o;
}
// The parryable cue: an ivory ring that tightens on the striking part, blinking in its last frames.
export function ivoryRing(g,x,y,k,frame,size=1){
 const r=(.9-.55*ease(k))*size,o=g.globalCompositeOperation;g.globalCompositeOperation='lighter';
 g.strokeStyle=css(P.ivory,.35+.6*k);g.lineWidth=(.04+.05*k)*size;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
 if(k>.75&&Math.floor(frame/3)%2){g.strokeStyle=css(P.ivory,.95);g.lineWidth=.025*size;g.beginPath();g.arc(x,y,r*1.25,0,TAU);g.stroke();}
 g.globalCompositeOperation=o;glowAt(g,'#fff6e4',x,y,r*1.5,.35+.45*k);
}
// The unparryable cue: cyan light gathering at its source (no ring; light, not a shape).
export function cyanGather(g,x,y,k,frame,size=1){
 glowAt(g,P.cyan,x,y,(.4+.9*k)*size*(1+.08*Math.sin(frame*.7)),.4+.6*k);
 if(k>.6){glowAt(g,P.cyanHot,x,y,.25*size*k,.9);}
}
// The edge of an unparryable burst (its hitbox radius): broken saturated-cyan arcs, never a smooth pale ring, so it
// cannot be mistaken for the ivory parry cue.
export function cyanEdge(g,x,y,r,a=1){
 if(r<=0||a<=0)return;
 const o=g.globalCompositeOperation;g.globalCompositeOperation='source-over';
 g.strokeStyle=css(P.cyan,Math.min(1,a));g.lineWidth=.06;
 for(let i=0;i<12;i++){const s=i/12*TAU;g.beginPath();g.arc(x,y,r,s,s+TAU/24);g.stroke();}
 g.globalCompositeOperation=o;
}
// A teardrop flame (local up = -y).
export function flame(g,x,y,h,w,frame,col=P.cyan,hot=P.cyanHot,seed=0){
 const f=Math.sin(frame*.31+seed)*.12+Math.sin(frame*.77+seed*2)*.06,tip=-h*(1+f);
 const o=g.globalCompositeOperation;g.globalCompositeOperation='lighter';
 for(const [s,c,a] of [[1,col,.55],[.6,hot,.8],[.3,'#ffffff',.9]]){
  g.fillStyle=css(c,a);g.beginPath();g.moveTo(x-w*s,y);
  g.bezierCurveTo(x-w*s*1.1,y-h*s*.4,x+f*w*2-w*s*.3,y+tip*s*.7,x+f*w*3,y+tip*s);
  g.bezierCurveTo(x+f*w*2+w*s*.3,y+tip*s*.7,x+w*s*1.1,y-h*s*.4,x+w*s,y);
  g.quadraticCurveTo(x,y+w*s*.9,x-w*s,y);g.fill();
 }
 g.globalCompositeOperation=o;glowAt(g,col,x,y-h*.4,h*1.3,.55);
}
// A two-bone limb from (x0,y0) to a foot or hand at (x1,y1); bend picks the knee side.
export function limb(g,x0,y0,x1,y1,l1,l2,bend,w,color,outline=P.outline){
 const dx=x1-x0,dy=y1-y0,d=Math.max(.001,Math.min(Math.hypot(dx,dy),l1+l2-.001)),a=Math.atan2(dy,dx);
 const c=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),k=a+bend*Math.acos(c),kx=x0+Math.cos(k)*l1,ky=y0+Math.sin(k)*l1;
 g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=outline;g.lineWidth=w+.05;g.beginPath();g.moveTo(x0,y0);g.lineTo(kx,ky);g.lineTo(x1,y1);g.stroke();
 g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(kx,ky);g.lineTo(x1,y1);g.stroke();
 return [kx,ky];
}
export function blob(g,x,y,rx,ry,fill,stroke=P.outline,lw=.04){
 g.fillStyle=fill;g.beginPath();g.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,TAU);g.fill();
 if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();}
}
export function radial(g,x,y,r,stops){
 const gr=g.createRadialGradient(x,y,0,x,y,Math.max(.001,r));for(const [o,c] of stops)gr.addColorStop(o,c);return gr;
}
export function linear(g,x0,y0,x1,y1,stops){
 const gr=g.createLinearGradient(x0,y0,x1,y1);for(const [o,c] of stops)gr.addColorStop(o,c);return gr;
}
// Deterministic per-entity scatter for drips, scales, spots (render only).
export function hash(n){n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return ((n^n>>>16)>>>0)/4294967296;}
