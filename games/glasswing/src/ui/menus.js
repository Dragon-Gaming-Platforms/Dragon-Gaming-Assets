import {t} from './i18n.js';
import {MENU} from '../core/input.js';
import {coach} from './onboarding.js';
import {HERO_KINDS,heroAtlas,heroFrame,drawHero,fitCanvas} from './hero-art.js';
import {FLOURISH} from './title.js';

// Menu polish shared by every screen: held-direction repeat for pads, a hero portrait on the select
// screen, a way forward from an empty Hall, and the lesson switches in Pause and How to play.
export const REPEAT={delay:320,every:95};
const DIRS=MENU.up|MENU.down|MENU.left|MENU.right;
// Held D-pad / stick: after `delay` ms, emit the held direction every `every` ms (one at a time).
export class MenuRepeat{
 constructor(){this.held=0;this.since=0;this.last=0;this.blocked=false;}
 // A new screen ignores a direction already held (the stick pushed in play when an altar opens,
 // or D-pad held across a screen change) until it is released: focus never drifts on its own.
 block(){this.blocked=true;}
 step(held,now){
  const dir=held&DIRS;
  if(this.blocked){if(dir)return 0;this.blocked=false;}
  if(dir!==this.held){this.held=dir;this.since=now;this.last=now;return 0;}
  if(!dir||now-this.since<REPEAT.delay||now-this.last<REPEAT.every)return 0;
  this.last=now;return dir;
 }
}

// Hero preference picked on the title (click a hunter) and the dev-only seed field.
export const menuState={kind:null};
export const devMode=search=>new URLSearchParams(search||'').has('dev');

function heroPortrait(root,select,cleanups){
 const card=select.closest('.card');if(!card||card.querySelector('.hero-portrait'))return;
 const box=root.ownerDocument.createElement('div');box.className='hero-portrait';
 box.innerHTML=`<canvas aria-hidden="true"></canvas><p class="hero-role"></p>`;
 card.insertBefore(box,card.children[1]||null);
 const canvas=box.querySelector('canvas'),g=canvas.getContext?.('2d'),role=box.querySelector('.hero-role');
 const win=root.ownerDocument.defaultView;
 let clip='idle',at=0,start=performance.now(),raf=0,alive=true,shown=null;
 // A new pick plays its signature move once; the role line follows the value (set by code or by hand).
 const sync=flourish=>{shown=select.value;role.textContent=t(shown+'Role');clip=flourish?FLOURISH[shown]||'idle':'idle';at=(performance.now()-start)/1000;};
 select.addEventListener('change',()=>sync(true));sync(false);
 const frame=()=>{
  if(!alive)return;
  if(select.value!==shown)sync(false);
  const s=(performance.now()-start)/1000,atlas=heroAtlas(select.value);
  if(g&&atlas){
   fitCanvas(canvas);const W=canvas.width,H=canvas.height;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
   let f=heroFrame(atlas,clip,s-at);if(f.done||clip==='idle'){clip='idle';f=heroFrame(atlas,'idle',s);}
   const ppt=H*.36;drawHero(g,atlas,f.frame,W/2,H*.94,ppt/atlas.data.pxPerTile);
  }
  raf=win.requestAnimationFrame(frame);
 };
 raf=win.requestAnimationFrame(frame);
 cleanups.push(()=>{alive=false;win.cancelAnimationFrame(raf);});
}

// Runs after Screens.show() renders a screen; returns a cleanup or nothing.
export function enhance(name,root,{links={},search=globalThis.location?.search}={}){
 const doc=root.ownerDocument,cleanups=[];
 if(!doc?.createElement||!root.querySelector)return null;
 doc.documentElement?.classList.toggle('gw-dev',devMode(search));
 if(name==='select'){
  const kind=root.querySelector('#kind0');
  // A hunter clicked on the title is a one-time pick: a later plain Play keeps the usual default.
  if(kind&&menuState.kind&&HERO_KINDS.includes(menuState.kind)){kind.value=menuState.kind;kind.dispatchEvent(new Event('change',{bubbles:true}));}
  menuState.kind=null;
  for(const select of root.querySelectorAll('select[id^="kind"]'))heroPortrait(root,select,cleanups);
  // The seed is a developer tool: shown with ?dev only (the field keeps its default value).
  const seed=root.querySelector('#seed')?.closest('label');if(seed)seed.classList.add('dev-only');
 }else if(name==='hall'){
  // A first visit owns no mask: everything is locked, so offer the way to the first one.
  const locked=root.querySelector('[data-action="trial"]:disabled');
  if(locked&&links.play&&!root.querySelector('.hall-bare')){
   const note=doc.createElement('div');note.className='card hall-bare';
   note.innerHTML=`<p>${t('hallBare')}</p><div class="buttons"><button class="primary" data-link="play">${t('hallBegin')}</button><button data-link="back">${t('back')}</button></div>`;
   const panel=root.querySelector('.panel');panel?.insertBefore(note,panel.querySelector('.grid'));
   note.querySelector('[data-link="play"]').addEventListener('click',links.play);
   note.querySelector('[data-link="back"]').addEventListener('click',()=>links.back?.());
   return ()=>{};
  }
 }else if(name==='pause'&&coach.live&&coach.pending().length){
  const row=root.querySelector('.buttons');
  if(row){
   const b=doc.createElement('button');b.dataset.coach='skip';b.textContent=t('coachSkipAll');
   b.addEventListener('click',()=>{coach.skip();b.replaceWith(Object.assign(doc.createElement('small'),{className:'coach-note',textContent:t('coachSkipped')}));root.querySelector('[data-action="resume"]')?.focus();});
   row.append(b);
  }
 }else if(name==='howto'&&(coach.skipped||coach.done.size)){
  const row=root.querySelector('.buttons');
  if(row){
   const b=doc.createElement('button');b.dataset.coach='replay';b.textContent=t('coachReplay');
   b.addEventListener('click',()=>{coach.reset();b.replaceWith(Object.assign(doc.createElement('small'),{className:'coach-note',textContent:t('coachReplayDone')}));root.querySelector('[data-action="back"]')?.focus();});
   row.append(b);
  }
 }
 return cleanups.length?()=>cleanups.forEach(fn=>fn()):null;
}
