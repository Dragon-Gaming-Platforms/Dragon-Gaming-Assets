import {t} from './i18n.js';
import {HERO_KINDS,heroAtlas,heroFrame,drawHero,fitCanvas} from './hero-art.js';

// The title scene: a parallax corpse of the four-winged moth-god under amber light, the logo
// breaking in, and the three forms of the hunter on the ridge. Pure presentation: menus answer
// from the first frame (the intro never gates input) and prefers-reduced-motion stills it.
export const TITLE_ACTIONS=['play','twoPlayers','hall','options','howto'];
export const FLOURISH={brawler:'punch3',skimmer:'sword',spark:'blast'};

const wing=`<path class="fw" d="M522 296C600 176 760 84 946 64c16 52-10 124-62 176-62 60-182 92-344 92Z"/><path class="hw" d="M530 344c112 4 250 44 334 136-8 82-100 122-182 102-74-20-122-130-154-214Z"/>`+
 `<path class="vein" d="M528 304 940 70M528 306 902 168M530 310 852 248M532 316 760 312M534 352 860 482M534 356 760 560M533 360 668 576"/>`+
 `<path class="vein thin" d="M700 150c18 40 30 80 34 150M820 110c10 46 8 94-6 160M640 214c22 26 34 56 40 104M640 400c40 44 60 96 64 170M760 430c-6 52-16 92-36 130"/>`+
 `<path class="pane" d="M720 150 900 90 880 170 740 230Z"/><path class="pane dim" d="M600 360 760 420 700 520 640 470Z"/>`+
 `<path class="edge-glass" d="M522 296C600 176 760 84 946 64"/><circle class="spot" cx="724" cy="468" r="30"/><circle class="spot inner" cx="724" cy="468" r="12"/>`;
// The moth-god: wings mirrored around x=500, a masked head, feathered antennae and the hollow where its amber heart was.
export const MOTH_SVG=`<svg class="ts-moth" viewBox="0 0 1000 700" aria-hidden="true" focusable="false">`+
 `<defs><radialGradient id="ts-heart"><stop offset="0" stop-color="#FFD98A"/><stop offset=".35" stop-color="#FFAB3D" stop-opacity=".8"/><stop offset="1" stop-color="#FFAB3D" stop-opacity="0"/></radialGradient>`+
 `<linearGradient id="ts-wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B2140" stop-opacity=".95"/><stop offset=".7" stop-color="#1A0D1E" stop-opacity=".92"/><stop offset="1" stop-color="#0B0710" stop-opacity=".9"/></linearGradient></defs>`+
 `<g class="wings right">${wing}</g><g class="wings left"><g transform="translate(1000 0) scale(-1 1)">${wing}</g></g>`+
 `<path class="antenna" d="M492 236C470 196 446 160 404 126M508 236c22-40 46-76 88-110"/>`+
 `<path class="antenna comb" d="M482 218l-14 4M470 198l-14 2M456 178l-12 0M440 158l-10-2M518 218l14 4M530 198l14 2M544 178l12 0M560 158l10-2"/>`+
 `<path class="body" d="M500 276c22 0 34 20 32 44-2 22-12 32-12 40 0 6 10 14 10 34-2 40-12 84-30 118-18-34-28-78-30-118 0-20 10-28 10-34 0-8-10-18-12-40-2-24 10-44 32-44Z"/>`+
 `<path class="fur" d="M472 300l-10-6M470 320l-12 0M474 340l-10 6M528 300l10-6M530 320l12 0M526 340l10 6"/>`+
 `<path class="seg" d="M482 410h36M484 438h32M487 466h26M491 494h18"/>`+
 // The crested skull mask with its two cracked crescent horns: the hunters wear its likeness.
 `<path class="horn" d="M482 232c-30-4-48-30-44-62 10 22 26 36 46 42ZM518 232c30-4 48-30 44-62-10 22-26 36-46 42Z"/>`+
 `<path class="mask" d="M500 206l7 12c14 4 23 16 23 30 0 20-14 34-30 44-16-10-30-24-30-44 0-14 9-26 23-30Z"/>`+
 `<path class="crack" d="M500 214l-4 16 8 10-6 14 3 18M456 186l8 10M544 186l-8 10"/><circle class="eye" cx="489" cy="250" r="4"/><circle class="eye" cx="511" cy="250" r="4"/>`+
 `<circle class="heart" cx="500" cy="322" r="50" fill="url(#ts-heart)"/><circle class="socket" cx="500" cy="322" r="9"/></svg>`;
// The ridge the hunters stand on: ribs and vertebrae of the corpse.
const RIDGE_SVG=`<svg class="ts-ridge" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">`+
 `<path class="rib far" d="M-20 300C120 120 260 70 420 96M1180 300c40-150 170-230 440-220M760 300c60-110 180-170 330-172"/>`+
 `<path class="ground" d="M0 300V186c140-26 280-30 420-14 160 18 300 4 450-22 170-30 380-22 730 10V300Z"/>`+
 `<path class="edge" d="M0 186c140-26 280-30 420-14 160 18 300 4 450-22 170-30 380-22 730 10"/></svg>`;

export function logoHTML(word=t('title')){
 // One span per letter for the rise-in; the shine band and the amber crack sit over the whole word.
 const letters=[...word].map((c,i)=>`<span style="--i:${i}">${c}</span>`).join('');
 return `<h1 class="logo" aria-label="${word}"><span class="logo-word" aria-hidden="true">${letters}</span><span class="logo-shine" aria-hidden="true">${word}</span>`+
  `<svg class="logo-crack" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="100" d="M6 12 13 9 18 14 26 7 33 12 41 5 49 13 57 9 63 16 72 10 79 12 88 6 95 10"/></svg></h1>`;
}

export function titleHTML(noWebGL=false){
 const motes=Array.from({length:22},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${7+(i*5)%9}s;--w:${-((i*13)%17)}s;--s:${.6+((i*7)%5)/5}"></i>`).join('');
 const names=HERO_KINDS.map((k,i)=>`<span class="ts-name" data-kind="${k}" style="--slot:${i}">${t(k)}</span>`).join('');
 return `<section class="panel title title-scene">`+
  `<div class="ts-scene" aria-hidden="true"><div class="ts-sky"></div><div class="ts-rays"></div>${MOTH_SVG}<div class="ts-motes">${motes}</div>`+
  `${RIDGE_SVG}<div class="ts-heroes" title="${t('titleHeroes')}"><canvas class="ts-stage"></canvas>${names}</div><div class="ts-fog"></div><div class="ts-vignette"></div></div>`+
  `<div class="eyebrow">${t('byline')}</div>${logoHTML()}<p class="lead">${t('tagline')}</p>`+
  `<div class="buttons">${TITLE_ACTIONS.map(id=>`<button data-action="${id}" class="${id==='play'?'primary':''}">${t(id)}</button>`).join('')}</div>`+
  `${noWebGL?`<p class="status">${t('noWebGL')}</p>`:''}<div class="credit">${t('credit')}</div>`+
  `<div class="nav-hint" aria-hidden="true"><span class="nh-keys">${t('navKeys')}</span><span class="nh-pad">${t('navPad')}</span></div></section>`;
}

const clamp=v=>Math.max(-1,Math.min(1,v));
// Mounts the living layers; returns the cleanup Screens runs when the title leaves.
export function mountTitle(root,{onPick=null,win=globalThis.window,now=()=>performance.now()}={}){
 const scene=root.querySelector('.ts-scene');
 if(!scene||!win)return ()=>{};
 const reduce=!!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const stage=root.querySelector('.ts-stage'),g=stage?.getContext?.('2d');
 const layers=[['.ts-sky',-8,-5],['.ts-moth',-24,-14,'translate(-50%,-50%) '],['.ts-motes',-34,-18],['.ts-ridge',-44,0],['.ts-heroes',-44,-6]]
  .map(([sel,kx,ky,pre=''])=>[root.querySelector(sel),kx,ky,pre]).filter(l=>l[0]);
 let refit=0;const onResize=()=>{refit=0;};
 const start=now();let tx=0,ty=0,x=0,y=0,raf=0,alive=true,hover=-1;
 // Each hunter idles; one at a time shows off its signature move, or the hovered one at once.
 const shows=HERO_KINDS.map(()=>({clip:'idle',at:0}));let nextShow=2.2,turn=1;
 const move=e=>{tx=clamp(e.clientX/win.innerWidth*2-1);ty=clamp(e.clientY/win.innerHeight*2-1);};
 const tilt=e=>{if(typeof e.gamma!=='number')return;tx=clamp(e.gamma/25);ty=clamp(((e.beta||45)-45)/25);};
 win.addEventListener('pointermove',move,{passive:true});win.addEventListener('deviceorientation',tilt);win.addEventListener('resize',onResize);
 const slotAt=e=>{if(!stage)return -1;const r=stage.getBoundingClientRect();const f=(e.clientX-r.left)/r.width;return f<0||f>1?-1:Math.min(2,Math.floor(f*3));};
 const show=(i,s)=>{if(i>=0&&shows[i].clip==='idle'){shows[i].clip=FLOURISH[HERO_KINDS[i]];shows[i].at=s;}};
 const names=[...root.querySelectorAll('.ts-name')];
 const over=e=>{const i=slotAt(e);if(i!==hover){hover=i;names.forEach((n,j)=>n.classList.toggle('lit',j===i));show(i,(now()-start)/1000);}};
 const leave=()=>{hover=-1;names.forEach(n=>n.classList.remove('lit'));};
 const pick=e=>{const i=slotAt(e);if(i>=0&&onPick)onPick(HERO_KINDS[i]);};
 const heroes=root.querySelector('.ts-heroes');
 heroes?.addEventListener('pointermove',over);heroes?.addEventListener('pointerleave',leave);heroes?.addEventListener('click',pick);
 function frame(){
  if(!alive)return;
  const s=(now()-start)/1000;
  const dx=reduce?0:Math.sin(s*.23)*.22,dy=reduce?0:Math.cos(s*.19)*.14;
  x+=(tx*.8+dx-x)*.06;y+=(ty*.8+dy-y)*.06;
  if(g){
   // Measuring the stage forces a style pass (the motes animate): once a second, or at once after a resize.
   if(--refit<=0){fitCanvas(stage);refit=60;}const W=stage.width,H=stage.height;
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
   if(!reduce&&s>nextShow){show(turn,s);turn=(turn+1)%3;nextShow=s+3.4;}
   const ppt=Math.min(H*.27,W*.13);
   // The Brute (centre) is drawn last, in front of the two flanking forms.
   for(const i of [0,2,1]){
    const kind=HERO_KINDS[i],atlas=heroAtlas(kind);if(!atlas)continue;
    const st=shows[i];let f=heroFrame(atlas,st.clip,reduce?0:s-st.at);
    if(f.done){st.clip='idle';f=heroFrame(atlas,'idle',s);}
    else if(st.clip==='idle')f=heroFrame(atlas,'idle',reduce?0:s+i*.37);
    const fx=W*(.2+.3*i),fy=H*(i===1?.93:.88),k=(i===1?1.08:1)*ppt/atlas.data.pxPerTile;
    // A soft amber pool under each pair of feet, then the hunter (the Archer faces the others).
    g.save();g.globalCompositeOperation='lighter';const pool=g.createRadialGradient(fx,fy,0,fx,fy,ppt*.9);
    pool.addColorStop(0,`rgba(255,171,61,${i===hover?.34:.18})`);pool.addColorStop(1,'rgba(255,171,61,0)');g.fillStyle=pool;g.fillRect(fx-ppt,fy-ppt*.5,ppt*2,ppt);g.restore();
    drawHero(g,atlas,f.frame,fx,fy,k,i===2);
   }
  }
  // Each layer moves by its own depth, set on the layer itself and after the stage is measured: custom properties
  // on the scene restyled every mote and wing path each frame (a third of a frame on a 4x-throttled CPU).
  for(const [el,kx,ky,pre] of layers)el.style.transform=pre+'translate3d('+(x*kx).toFixed(2)+'px,'+(y*ky).toFixed(2)+'px,0)';
  raf=win.requestAnimationFrame(frame);
 }
 raf=win.requestAnimationFrame(frame);
 return ()=>{
  alive=false;win.cancelAnimationFrame?.(raf);
  win.removeEventListener('pointermove',move);win.removeEventListener('deviceorientation',tilt);win.removeEventListener('resize',onResize);
 };
}
