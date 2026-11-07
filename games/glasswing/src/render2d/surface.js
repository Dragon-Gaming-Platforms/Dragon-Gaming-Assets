// Offscreen drawing surfaces. Tests and headless smoke runs inject a fake factory.
let factory=null;
export function setSurfaceFactory(f){factory=f;}
export function surface(w,h){
 w=Math.max(1,Math.ceil(w));h=Math.max(1,Math.ceil(h));
 if(factory)return factory(w,h);
 if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
 return null;
}
// Small deterministic generator for scenery: the renderer never consumes the simulation RNG.
export function seeded(seed){
 let a=typeof seed==='number'?seed>>>0:[...String(seed)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
 return ()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
}
// Cached radial glow sprites, drawn additively instead of per-frame shadowBlur.
const glows=new Map();
export function glow(color,core=0){
 let m=glows.get(color);if(!m)glows.set(color,m=new Map());
 let c=m.get(core);
 if(c!==undefined)return c;
 c=surface(64,64);const g=c?.getContext('2d');
 if(g){
  const [r,gr,b]=color[0]==='#'?[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)):[255,255,255];
  const v=g.createRadialGradient(32,32,0,32,32,32);
  v.addColorStop(0,`rgba(${r},${gr},${b},1)`);if(core)v.addColorStop(core,`rgba(${r},${gr},${b},.7)`);
  v.addColorStop(.35,`rgba(${r},${gr},${b},.32)`);v.addColorStop(1,`rgba(${r},${gr},${b},0)`);
  g.fillStyle=v;g.fillRect(0,0,64,64);
 }else c=null;
 m.set(core,c);return c;
}
export function clearGlows(){glows.clear();}
