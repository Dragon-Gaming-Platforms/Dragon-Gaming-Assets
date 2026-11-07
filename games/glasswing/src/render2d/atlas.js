import {localAsset} from '../ui/assets.js';
import {surface} from './surface.js';

// Sprite atlases from assets/manifest.json "sprites" (docs/PIVOT-2D.md). Missing or invalid
// entries fail once and the procedural look stays in place.
export const SPRITE_IDS=['brawler','skimmer','spark','wild-brawler','wild-skimmer','wild-spark','old-glasswing'];
const FALLBACK={glassidle:'idle',doublejump:'jump',glide:'jump',maskbreak:'hit',charge:'blast',move:'run',run:'move',punch2:'punch1',punch3:'punch1',divekick:'kick',downsword:'sword',block:'idle',slam:'attack',sweep:'attack',barrage:'attack',summon:'attack',rush:'attack',walk:'rush',gallop:'rush',lunge:'attack',attack:'punch1',telegraph:'idle'};
const num=v=>typeof v==='number'&&isFinite(v);

export function validateAtlas(d){
 if(!d||typeof d!=='object'||d.version!==1)throw new Error('Atlas version 1 required');
 if(!num(d.pxPerTile)||d.pxPerTile<=0)throw new Error('pxPerTile');
 if(!Array.isArray(d.cell)||d.cell.length!==2||!d.cell.every(v=>num(v)&&v>0))throw new Error('cell');
 if(!Array.isArray(d.pivot)||d.pivot.length!==2||!d.pivot.every(num))throw new Error('pivot');
 if(d.glowScale!==undefined&&!(num(d.glowScale)&&d.glowScale>0))throw new Error('glowScale');
 if(!d.clips||typeof d.clips!=='object'||!Object.keys(d.clips).length)throw new Error('clips');
 for(const [name,c] of Object.entries(d.clips)){
  if(!c||!Array.isArray(c.frames)||!c.frames.length)throw new Error('frames: '+name);
  if(c.fps!==undefined&&!(num(c.fps)&&c.fps>0))throw new Error('fps: '+name);
  // Locomotion: ground distance (atlas tiles) at each drawing, then one full cycle (sprites.js spriteFrame).
  const t=c.travel;
  if(t!==undefined&&!(Array.isArray(t)&&t.length===c.frames.length+1&&t.every(num)&&t[0]===0&&t.every((v,i)=>!i||v>=t[i-1])&&t[t.length-1]>0))throw new Error('travel: '+name);
  // Optional: the drawing a locomotion clip starts on from a stand.
  if(c.enter!==undefined&&!(t&&Number.isInteger(c.enter)&&c.enter>=0&&c.enter<c.frames.length))throw new Error('enter: '+name);
  for(const f of c.frames){
   if(!f||!num(f.x)||!num(f.y))throw new Error('frame: '+name);
   if(f.w!==undefined&&!(['w','h','ox','oy'].every(k=>num(f[k]))&&f.w>0&&f.h>0))throw new Error('trim: '+name);
   if(f.g!==undefined&&!(Array.isArray(f.g)&&f.g.length===6&&f.g.every(num)&&f.g[2]>0&&f.g[3]>0))throw new Error('glow: '+name);
   if(f.sockets)for(const v of Object.values(f.sockets))if(!Array.isArray(v)||v.length!==2||!v.every(num))throw new Error('socket: '+name);
  }
 }
 return d;
}

const defaultJSON=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('Missing atlas');return r.json();};
const defaultImage=url=>new Promise((resolve,reject)=>{
 if(typeof Image==='undefined'){reject(new Error('No image decoder'));return;}
 // Decoded before it resolves, so the first frame that draws the sheet does not pay an 11-Mpx decode.
 const img=new Image();img.decoding='async';img.onload=()=>img.decode?img.decode().then(()=>resolve(img),()=>resolve(img)):resolve(img);img.onerror=()=>reject(new Error('Image failed'));img.src=url;
});

export class AtlasBank{
 constructor({loadJSON=defaultJSON,loadImage=defaultImage}={}){
  this.cache=new Map();this.pending=new Set();this.failed=new Set();this.loadJSON=loadJSON;this.loadImage=loadImage;
  // Sheets loaded but not yet warmed (white sheet built, textures uploaded): View.warm takes one per frame.
  this.fresh=[];
 }
 // Called for every drawn entity each frame: the settled check stays synchronous (no promise).
 load(id,entry){
  if(!entry||this.cache.has(id)||this.pending.has(id)||this.failed.has(id))return null;
  this.pending.add(id);return this.fetch(id,entry);
 }
 async fetch(id,entry){
  try{
   if(typeof entry!=='object'||typeof entry.image!=='string'||typeof entry.data!=='string')throw new Error('Sprite entry');
   const data=validateAtlas(await this.loadJSON(localAsset(entry.data)));
   const sheet=await this.loadImage(localAsset(entry.image)),image=data.lit?sheet:liftSheet(sheet);
   let glowImage=null;
   if(entry.glow)try{glowImage=await this.loadImage(localAsset(entry.glow));}catch{}
   const atlas={id,data,image,glow:glowImage,white:null};this.cache.set(id,atlas);this.fresh.push(atlas);
  }catch{this.failed.add(id);}
  finally{this.pending.delete(id);}
 }
 get(id){return this.cache.get(id)||null;}
}

export function clipFor(atlas,name){
 const clips=atlas.data.clips;let n=name;
 for(let i=0;i<4&&n&&!clips[n];i++)n=FALLBACK[n];
 if(n&&clips[n])return n;
 return clips.idle?'idle':Object.keys(clips)[0];
}
// Attack/telegraph progress maps straight to frames; other clips play at their fps from clip start.
export function frameIndex(clip,progress,elapsed){
 const n=clip.frames.length;
 if(progress!==null&&progress!==undefined)return Math.min(n-1,Math.max(0,Math.floor(progress*n)));
 const f=Math.max(0,Math.floor(elapsed*(clip.fps||8)/60));
 return clip.loop===false?Math.min(n-1,f):f%n;
}

// Painted sheets are lit for a neutral turntable and read too dark on the night levels,
// so the colour sheet is lifted once at load (no-op where canvas filters are missing).
// Sheets packed with the lift baked in say so with "lit" and are used as decoded.
function liftSheet(img){
 const c=surface(img.width||1,img.height||1),g=c?.getContext('2d');
 if(!g||!('filter' in g))return img;
 g.filter='brightness(1.3) saturate(1.1)';g.drawImage(img,0,0);
 return c;
}
// White silhouette sheet for hit flashes, made once per atlas.
export function whiteSheet(atlas){
 if(atlas.white!==null)return atlas.white;
 const img=atlas.image,c=surface(img.width||1,img.height||1),g=c?.getContext('2d');
 if(!g){atlas.white=img;return img;}
 g.drawImage(img,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='#ffffff';g.fillRect(0,0,c.width,c.height);
 atlas.white=c;return c;
}
