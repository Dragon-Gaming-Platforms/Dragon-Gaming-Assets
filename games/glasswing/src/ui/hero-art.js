import {AtlasBank,clipFor} from '../render2d/atlas.js';
import {manifest,loadManifest} from './assets.js';

// Menu-side hero portraits (title and select screens): the same painted sheets the game draws,
// played on small canvases. Read-only: no simulation state is touched.
export const HERO_KINDS=['skimmer','brawler','spark'];
const bank=new AtlasBank();
let ready=null;
function ensure(){
 if(!ready)ready=(Object.keys(manifest.sprites).length?Promise.resolve(manifest):loadManifest()).catch(()=>manifest);
 return ready;
}
// Called every animation frame per hunter: once the sheet is cached, no promise is made.
const asked=new Set();
export function heroAtlas(kind){
 const atlas=bank.get(kind);
 if(!atlas&&!asked.has(kind)){asked.add(kind);ensure().then(m=>bank.load(kind,m.sprites[kind])).finally(()=>asked.delete(kind));}
 return atlas;
}
// Frame of a clip at time t (seconds); one-shot clips report done.
export function heroFrame(atlas,name,t){
 const clipName=clipFor(atlas,name),clip=atlas.data.clips[clipName],n=clip.frames.length;
 const i=Math.max(0,Math.floor(t*(clip.fps||8)));
 return {clip:clipName,frame:clip.frames[i%n],done:name!=='idle'&&i>=n};
}
// Draws one frame so the atlas pivot (feet centre) lands at (px,py) on the canvas, scale = screen px per atlas px.
export function drawHero(g,atlas,frame,px,py,scale,mirror=false,glow=true){
 const d=atlas.data,[pvx,pvy]=d.pivot;
 g.save();g.translate(px,py);if(mirror)g.scale(-1,1);g.scale(scale,scale);g.translate(-pvx,-pvy);
 const w=frame.w??d.cell[0],h=frame.h??d.cell[1];
 g.drawImage(atlas.image,frame.x,frame.y,w,h,frame.ox||0,frame.oy||0,w,h);
 if(glow&&atlas.glow&&frame.g){
  const [gx,gy,gw,gh,ox,oy]=frame.g,k=d.glowScale||1;
  g.globalCompositeOperation='lighter';g.globalAlpha=.85;
  g.drawImage(atlas.glow,gx,gy,gw,gh,ox,oy,gw/k,gh/k);
 }
 g.restore();
}
// Fit a canvas backing store to its CSS box (HiDPI capped at 2).
export function fitCanvas(canvas){
 const r=canvas.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1);
 const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 return dpr;
}
