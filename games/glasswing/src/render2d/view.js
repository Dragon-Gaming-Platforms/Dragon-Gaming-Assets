import {VISUALS as V} from '../data/visuals.js';
import {manifest} from '../ui/assets.js';
import {Framing} from './framing.js';
import {themeFor} from './themes.js';
import {Parallax} from './parallax.js';
import {Tiles} from './tiles.js';
import {Props} from './props.js';
import {Characters,clipOf,formPose,COLLAPSE} from './characters.js';
import {FX} from './fx.js';
import {AtlasBank,clipFor,frameIndex,whiteSheet} from './atlas.js';
import {spriteFrame,drawSprite,drawTint,socket,footLift} from './sprites.js';
import {Squash} from './squash.js';
import {glow} from './surface.js';
import {P,css} from './color.js';

const NO_SQUASH=[1,1];
import {FORMS,formVisual} from '../data/forms.js';
import {KINDS} from '../data/kinds.js';
import {F} from '../data/feel.js';
import {drawMoults,drawVerbs,drawShards} from './overlays.js';
import {drawChrysalisWorld,dimFor} from './chrysalis.js';
import {drawHubBack,drawHubFront,hubFade,hubFocus} from './hub.js';
import {drawMonster,drawMonsterWorld} from './monsters.js';
import {drawMend} from './mend.js';
import {drawTallowWorld,drawTallowOver,tallowFocus} from './tallowgrave.js';
import {mereFocus,drawMereBack,drawAntiphon,drawMereOver} from './antiphon.js';
import {anchoriteFocus,anchoriteTurn,drawAnchoriteRoom,drawAnchorite,drawAnchoriteFront} from './anchorite.js';
import {drawCordyceaWorld,drawGardenBack,gardenFocus,gardenDim} from './cordycea.js';
import {drawWell,drawExuvialWorld,wellFocus} from './exuvial.js';
import {FORMS5} from '../data/forms5.js';
import {drawHuskEntity} from './husk.js';
import {Impact} from './impact.js';
import {drawChrysalis5World,drawChrysalis5Back,drawChrysalis5Front,dim5,sway5,boss5} from './chrysalis5.js';
import {drawRendererEntity} from './form-tallowgrave.js';
import {drawAntiphonFormEntity} from './antiphon-form.js';
import {drawAnchoriteFormEntity} from './form-anchorite.js';
import {drawBloomEntity} from './crowned-bloom.js';
import {drawExuvialFormEntity} from './form-exuvial.js';
// Rules-v5 form looks by form id (the form and the shift into it); a v5 form not listed draws as the Chrysalis Husk.
const FORM_DRAWS={'tallowgrave-form':drawRendererEntity,'antiphon-form':drawAntiphonFormEntity,'anchorite-form':drawAnchoriteFormEntity,'crowned-bloom':drawBloomEntity,'exuvial-form':drawExuvialFormEntity};

// Logical design space is 1280x720; the backing store follows CSS size x devicePixelRatio (at most 2, 1.5 on
// touch devices), inside 4K and a 1440p pixel budget: Canvas 2D fill rate, not resolution, sets the frame time.
export const LOGICAL={w:1280,h:720},MAX={w:3840,h:2160,pixels:2560*1440};
const SOCKETS=['head','back','hand','chest','tail','legs'];

// Capability failures must leave the localized title and menus available.
export function context2d(canvas){
 try{return canvas.getContext('2d',{alpha:false})||null;}catch{return null;}
}
export function spriteId(e){return e.form||(e.boss?'old-glasswing':e.team===2?'wild-'+e.kind:e.kind);}
// A possession form prefers its own sheet ('form-<id>'), then the boss sheet tinted amber, then the procedural body.
export function spriteIds(e){return e.form&&!e.boss?['form-'+e.form,e.form]:[spriteId(e)];}
const BOSS_H=KINDS.brawler.height*F.bossSize;
// age: animation ticks since the defeat (View.age skips hit-stop), so the cull matches the drawn fade; a boss stays
// for its collapse first.
export function expired(e,frame,age=frame-e.defeatedFrame){return !!(e.dead&&e.team===2&&age>V.defeatedLife+(e.boss?COLLAPSE:0));}
// Big painted bodies (boss and possessed-form sheets), in ticks: a turn squeezes the drawing edge-on (TURN boss, TURN_FORM
// the player's form, kept short so it never feels like input lag); a clip change leaves the outgoing drawing fading
// under the new one for FADE; taking the mask ends in a white flash that settles (BECOME); leaving it, the form
// collapses into the hunter (UNSHIFT). Render only: hitboxes and the simulation never see any of it.
export const BIG={TURN:7,TURN_FORM:3,MIN_SQUEEZE:.15,FADE:5,BECOME:10,UNSHIFT:14,FORM_SQUASH:.4};
const STRIKES=new Set(['sweep','slam','barrage','lunge','rush','gallop','summon']);
const clamp01=v=>v<0?0:v>1?1:v,ease=t=>t*t*(3-2*t),TAU=Math.PI*2;
// White over the growing form: a pale glow at first, gone mid-way, then a flash that peaks on the tick it becomes.
const shiftWhite=k=>.45*(1-ease(clamp01(k*1.6)))+.6*ease(clamp01((k-.7)/.3));

export class View{
 constructor(canvas,{disabled=false}={}){
  this.canvas=canvas;this.available=false;this.framing=new Framing();this.level=null;this.revision=-1;
  this.stats={fps:0,calls:0,characters:0,sprites:0,width:0,height:0};
  this.atlas=new AtlasBank();this.tiles=new Tiles();this.parallax=new Parallax();this.props=new Props();
  this.chars=new Characters();this.fx=new FX();this.squash=new Squash();this.impact=new Impact();this.anchors=new WeakMap();this.opts={sprite:null,anchors:null,low:false,shift:null};
  this.motion=new WeakMap();this.wallClock=0;this.wall=0;this.preloaded=null;
  if(disabled)return;
  const ctx=context2d(canvas);
  if(!ctx)return;
  this.ctx=ctx;this.available=true;
  try{this.mobile=typeof matchMedia==='function'&&matchMedia('(pointer: coarse)').matches;}catch{this.mobile=false;}
  if(this.mobile){this.parallax.mobile=true;this.tiles.cap=96;this.fx.cap=110;}
  this.resize();
  if(typeof window!=='undefined')window.addEventListener?.('resize',()=>this.resize());
 }

 resize(){
  if(!this.available)return;
  this.width=this.canvas.clientWidth||0;this.height=this.canvas.clientHeight||0;
  // Hidden or transitional layouts can briefly report zero-sized canvases.
  const dpr=this.dpr=Math.max(1,Math.min(globalThis.devicePixelRatio||1,this.mobile?1.5:2));
  let w=Math.max(1,Math.round(this.width*dpr)),h=Math.max(1,Math.round(this.height*dpr));
  const f=Math.min(1,MAX.w/w,MAX.h/h,Math.sqrt(MAX.pixels/(w*h)));w=Math.max(1,Math.floor(w*f));h=Math.max(1,Math.floor(h*f));
  if(this.canvas.width!==w)this.canvas.width=w;
  if(this.canvas.height!==h)this.canvas.height=h;
  this.W=w;this.H=h;this.ui=h/LOGICAL.h;this.stats.width=w;this.stats.height=h;
 }

 setLevel(level){
  if(!this.available||!level)return;
  const theme=themeFor(level);
  // Same level object after a breakable wall: repaint only the changed tile blocks.
  if(level===this.level&&theme===this.theme){this.tiles.refresh();return;}
  if(level!==this.level)this.impact.clear();
  this.level=level;this.theme=theme;this.revision=-1;
  this.tiles.setLevel(level,theme);this.parallax.setTheme(theme);
 }

 render(state,alpha=1,delta=1/60,loadModels=true){
  if(!this.available||!state||!Array.isArray(state.players))return;
  // Size or zoom changes (a window dragged to another monitor changes devicePixelRatio only).
  if(this.width!==this.canvas.clientWidth||this.height!==this.canvas.clientHeight||this.dpr!==Math.max(1,Math.min(globalThis.devicePixelRatio||1,this.mobile?1.5:2)))this.resize();
  const level=state.level||this.level;if(!level)return;
  if(level!==this.level)this.setLevel(level);
  if(state.levelRevision!==undefined&&state.levelRevision!==this.revision){if(this.revision!==-1)this.tiles.refresh();this.revision=state.levelRevision;}
  const g=this.ctx,W=this.W,H=this.H,frame=state.frame||0,players=state.players,anim=this.clock(state,frame);
  // Wall clock (seconds) that keeps running while the picture is frozen: a beaten boss collapses on it.
  const now=typeof performance!=='undefined'?performance.now():Date.now();this.wallClock+=this.wall?Math.min(.1,Math.max(0,(now-this.wall)/1000)):0;this.wall=now;
  this.warm(g);
  // The Gullet: frame the swinging cocoon with the hunter (render only; the simulation camera is unchanged).
  let focus=null;
  if(level.garden)focus=gardenFocus(state,this.focus||(this.focus={}));
  for(const e of state.enemies||[])if((e.chrysalis||e.chrysalis5)&&!e.dead){const f=this.focus||(this.focus={});f.left=Math.max(40.6,Math.min(e.x-e.w/2-1,49));f.right=Math.min(level.width||60,Math.max(e.x+e.w/2+1,51.5));f.bottom=1;f.top=Math.min(11.5,Math.max(7,e.y+e.h+.6));focus=f;break;}
  // The Scale Mere: the causeway sits mid-screen so the reflection fills the lower half.
  // Kept between attempts too: a retry's frames without the boss must not drop the Mere for the Nest.
  if(level.mere)focus=mereFocus(null,this.mere||(this.mere={}));
  for(const e of state.enemies||[])if(e.tallow){focus=tallowFocus(e,this.focus||(this.focus={}));break;}
  if(!focus&&level.drum)focus=anchoriteFocus(state,this);
  if(level.well)focus=wellFocus(this,(state.enemies||[]).find(e=>e.exuvial&&!e.dead),players);
  // A boss's own framing wins over the Hub's room framing (a Hub fight runs in the boss's arena).
  if(!focus&&state.world)focus=hubFocus(state,this.hubBox||(this.hubBox={}));
  const cam=this.framing.update(players,state.camera||{x:9},level.viewWidth||level.width||18,W/H,alpha,focus,delta);
  let cx=cam.x,cy=cam.y;
  // Impact pass (render-side shake: an offset on this view only, never state.camera).
  const q=this.impact.frame(state,alpha,delta);cx+=q[0];cy+=q[1];
  if(state.shake>0&&!this.impact.on){cx+=Math.sin(frame*13)*.06;cy+=Math.cos(frame*17)*.04;}
  const k=H/cam.h,view={x:cx,y:cy,w:cam.w,h:cam.h};
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  this.parallax.back(g,view,W,H,frame);
  if(focus&&level.mere)drawMereBack(g,W,H,cx,cy,k,frame,state);
  g.setTransform(k,0,0,k,W/2-cx*k,H/2+cy*k);
  // The Reliquary Drum turns the whole world about its centre while the room turns (paired with drawAnchoriteFront).
  if(level.drum)anchoriteTurn(g,state,alpha);
  // The finished Chrysalis (config.boss 'chrysalis5'): a slight roll with the pendulum, and the nave behind the tiles.
  const c5=boss5(state),roll=c5?sway5(state):0;
  if(roll){const z=1+Math.abs(roll)*1.4;g.setTransform(1,0,0,1,0,0);g.translate(W/2,H/2);g.rotate(roll);g.scale(z,z);g.translate(-W/2,-H/2);g.transform(k,0,0,k,W/2-cx*k,H/2+cy*k);}
  if(c5)drawChrysalis5Back(g,state,c5,frame);
  const ppt=this.tiles.bucket(k);
  drawGardenBack(g,state,frame);
  drawWell(g,state,level,view,frame);
  this.props.draw(g,state,level,frame,ppt);
  drawHubBack(g,state,level,frame);
  this.tiles.draw(g,view,k);
  this.tiles.drawGlows(g,frame);
  if(state.mon)drawMonsterWorld(g,state,frame,alpha,'back');
  if(level.drum)drawAnchoriteRoom(g,state,frame,alpha);
  this.chars.reset(ppt);
  // Entities: boss behind, wild monsters, then players on top.
  const list=this.list||(this.list=[]);list.length=0;
  for(const e of state.enemies||[])if(e.boss)list.push(e);
  for(const e of state.enemies||[])if(!e.boss)list.push(e);
  for(const p of players)list.push(p);
  this.chars.level=level;this.chars.fx=this.fx;this.chars.crowd(list,frame,alpha);
  const left=cx-cam.w/2-4,right=cx+cam.w/2+4;
  // Rules v4, the Unborn Chrysalis's desperation: the Gullet dims.
  const dim=Math.max(dimFor(state),gardenDim(state),dim5(state));
  if(dim>0){g.fillStyle=`rgba(4,2,6,${dim})`;g.fillRect(cx-cam.w/2-1,-(cy+cam.h/2+1),cam.w+2,cam.h+2);}
  for(const e of list){
   if(expired(e,frame,this.age(e,frame))||e.x<left-(e.boss?6:0)||e.x>right+(e.boss?6:0))continue;
   this.fx.watch(e);
   if(e.chrysalis&&!e.cut||e.chrysalis5||e.hidden)continue;
   // Procedural bosses that draw their own shadows and stage.
   if(e.tallow||e.antiphon||e.anchorite||e.cordycea||e.exuvial)continue;
   if(!e.dead||e.team!==2)this.props.shadow(g,level,e.px+(e.x-e.px)*alpha,e.py+(e.y-e.py)*alpha,(e.w||.7)*(e.boss?1.1:1.4)*(e.showcase?V.showcaseScale:1));
  }
  let drawn=0,sprites=0;
  for(const e of list){
   // Tallowgrave draws its whole chapel (membrane, columns, shadows) with its body, and stays for its death.
   if(e.tallow){drawTallowWorld(g,state,e,frame,alpha);drawn++;continue;}
   const age=this.age(e,frame);
   if(expired(e,frame,age)||e.x<left-(e.boss?6:0)||e.x>right+(e.boss?6:0))continue;
   // Spoke monsters are procedural (src/render2d/monsters.js); the hit flash is drawn, never a blink.
   if(e.beast){drawMonster(g,state,e,frame,alpha);drawn++;continue;}
   // Rules-v5 forms (M1-D): the Chrysalis Husk (and the shift into it) draws its own look until M1-E's FORM_LOOKS takes it.
   const form5=!e.boss&&(e.form||e.formShift>0&&e.formNext);
   if(form5&&FORMS5[form5]){(FORM_DRAWS[form5]||drawHuskEntity)(this,g,state,e,frame,alpha,loadModels);drawn++;continue;}
   // No blink while transforming or during a form move: the shape itself is the cue.
   // Motion memory runs on the animation clock (spriteFor draws on it), so a hit-stop never skews a turn or a fade.
   const mo=this.track(e,anim,level);
   if(e.inv&&!e.dead&&!e.formShift&&!(e.form&&e.formMove)&&!this.morphing(mo,anim)&&Math.floor(frame/V.blinkFrames)%2)continue;
   // The cocoon is procedural (cord, two halves, three lips, the amber seam); the P3 creature is a sprite or body.
   if(e.chrysalis5){drawChrysalis5World(g,state,e,frame,alpha);drawn++;continue;}
   if(e.chrysalis){drawChrysalisWorld(g,state,e,frame,alpha);if(!e.cut){drawn++;continue;}}
   if(e.antiphon){drawAntiphon(g,state,e,frame,alpha);drawn++;continue;}
   if(e.anchorite){drawAnchorite(g,state,e,frame,alpha);drawn++;continue;}
   if(e.cordycea){if(e.crown)drawCordyceaWorld(g,state,e,frame,alpha);drawn++;continue;}
   if(e.exuvial){drawExuvialWorld(g,state,e,frame,alpha);drawn++;continue;}
   const A=this.anchorsOf(e);
   if(e.moults?.length&&A.valid){
    const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;
    drawMoults(g,e,shift(A,x-A.x,y-A.y),frame,'behind');
   }
   const sprite=this.spriteFor(e,loadModels,g,anim,A,alpha);
   if(sprite)sprites++;
   const o=this.opts;o.sprite=sprite;o.anchors=A;o.low=!!this.mobile;o.anim=anim;o.age=age;o.shift=e.formShift>0&&!e.form&&e.formNext?this.shiftFor(e,g,frame,A,loadModels):null;
   this.chars.draw(g,e,frame,alpha,o);
   if(mo.last&&!e.form)this.unshift(g,e,mo,anim,alpha);
   A.x=e.px+(e.x-e.px)*alpha;A.y=e.py+(e.y-e.py)*alpha;A.valid=true;
   if(e.moults?.length)drawMoults(g,e,A,frame,'front');
   if(e.emberMax!==undefined)drawMend(g,e,A,frame);
   if(e.verbs)drawVerbs(g,e,A,frame,alpha);
   drawn++;
  }
  drawHubFront(g,state,alpha,frame);
  if(state.mon)drawMonsterWorld(g,state,frame,alpha,'front');
  this.props.locks(g,state,frame);
  drawTallowOver(g,state,frame);
  if(loadModels)this.preload(state);
  this.fx.draw(g,state,alpha,frame);
  drawShards(g,state,alpha);
  // The finished Chrysalis's foreground (gum, strands), then the impact pass over it.
  if(c5)drawChrysalis5Front(g,state,c5,frame,alpha,view);
  // Impact pass (numbers, arcs, BREAK) in world space: over the Mere's reflection (so it never mirrors) and inside the Drum's turn.
  if(focus&&level.mere){drawMereOver(g,this.canvas,state,W,H,cx,cy,k,frame,alpha,!!this.mobile);g.setTransform(k,0,0,k,W/2-cx*k,H/2+cy*k);}
  this.impact.world(g,state,alpha,frame);
  if(level.drum)drawAnchoriteFront(g,state,frame,alpha);
  g.setTransform(1,0,0,1,0,0);
  let glass=0;for(const p of players)if(p.glass&&!p.dead&&!p.showcase)glass=Math.max(glass,.55+.2*Math.sin(frame*.12));
  // The Garden keeps its own foreground (no parallax front layer).
  const front=this.parallax.front;if(level.garden)this.parallax.front=null;
  this.parallax.over(g,view,W,H,frame,glass,!!(focus&&level.mere));this.parallax.front=front;
  this.impact.screen(g,W,H,k,cx,cy);
  hubFade(g,state,W,H);
  this.stats.characters=drawn;this.stats.sprites=sprites;this.stats.calls=drawn+this.tiles.blocks.size;
  if(delta>0)this.stats.fps=this.stats.fps*.95+Math.min(120,1/delta)*.05;
 }
 // Hit-stop freezes the bodies too: an animation clock that skips the sim ticks that ran frozen (s.frame still counts
 // them). Blinks, shake and telegraph flashes stay on the real frame.
 clock(state,frame){
  const c=this.anim||(this.anim={state:null,frame:0,hs:0,frozen:0,log:[]});
  if(c.state!==state||frame<c.frame){c.state=state;c.frozen=0;c.log.length=0;}
  else if(frame>c.frame){const n=Math.min(frame-c.frame,c.hs);for(let i=1;i<=n;i++)c.log.push(c.frame+i);c.frozen+=n;}
  c.frame=frame;c.hs=state.hitStop||0;
  while(c.log.length&&c.log[0]<frame-V.defeatedLife*2)c.log.shift();
  return frame-c.frozen;
 }
 // Animation ticks since a defeat (frozen ticks after it do not count).
 age(e,frame){
  if(!e.dead||e.team!==2)return frame-(e.defeatedFrame||0);
  const L=this.anim?.log||[];let n=0;for(let i=L.length-1;i>=0&&L[i]>e.defeatedFrame;i--)if(L[i]<=frame)n++;
  return frame-e.defeatedFrame-n;
 }
 anchorsOf(e){let A=this.anchors.get(e);if(!A){A={valid:false,x:0,y:0,scale:1,dir:1};this.anchors.set(e,A);}return A;}
 motionOf(e){let m=this.motion.get(e);if(!m){m={formWas:!!e.form,level:null};this.motion.set(e,m);}return m;}
 // Per-entity render memory: when the mask was taken (becameAt) or the form ended (endAt); dropped on death or a new level.
 track(e,frame,level){
  const m=this.motionOf(e);
  // A new level also forgets the last drawn pose (no cross-fade from the previous level's body).
  const fresh=m.level!==level;if(fresh){m.level=level;m.cur=null;}
  if(fresh||e.dead){m.last=null;m.endAt=undefined;m.becameAt=undefined;m.ghost=null;}
  else if(m.formWas&&!e.form){m.endAt=frame;m.becameAt=undefined;}
  else if(!m.formWas&&e.form){m.becameAt=frame;m.endAt=undefined;m.last=null;}
  m.formWas=!!e.form;
  if(!e.form&&m.last&&!(frame-m.endAt<BIG.UNSHIFT))m.last=null;
  if(e.form&&m.becameAt!==undefined&&frame-m.becameAt>BIG.BECOME)m.becameAt=undefined;
  return m;
 }
 // No invulnerability blink while the body is changing shape: the transformation itself is the cue.
 morphing(m,frame){return m.becameAt!==undefined&&frame-m.becameAt<BIG.BECOME+2||!!m.last&&m.endAt!==undefined;}
 // Drawn facing in [-1, 1]: a turn eases through edge-on (cosine), a reversal mid-turn continues from where it is.
 // Strikes (the sim's attack state, or a strike drawing such as the Chrysalis creature's sweep) and the dead turn at once.
 turn(e,m,dir,now,form,strike=false){
  const T=form?BIG.TURN_FORM:BIG.TURN;
  if(m.dir===undefined||e.dead||strike||e.boss&&e.ai==='attack'||form&&e.formMove){m.dir=dir;m.turnAt=-1e9;return dir;}
  if(dir!==m.dir){const p=clamp01((now-m.turnAt)/(m.turnT||T));m.turnAt=now-(1-p)*T;m.turnT=T;m.dir=dir;}
  return -dir*Math.cos(Math.PI*clamp01((now-m.turnAt)/(m.turnT||T)));
 }
 // Taking the mask with the form's own sheet: the painted form grows out of a white-amber light over the cracking
 // hunter (characters.js fades the hunter out over the second half); the procedural moth stays the fallback.
 shiftFor(e,g,frame,A,load=true){
  if(!FORMS[e.formNext])return null;
  let atlas=null,borrowed=false,waiting=false;
  // The form's sheet is requested on the first tick of the shift too (a trial opens on it before any preload ran).
  for(const k of ['form-'+e.formNext,e.formNext]){if(load)this.atlas.load(k,manifest.sprites?.[k]);const a=this.atlas.get(k);if(a){atlas=a;borrowed=k===e.formNext;break;}if(this.atlas.pending.has(k)){waiting=true;break;}}
  // While the sheet is still arriving only the light and the cracks show (never the procedural moth for a few frames).
  if(!atlas&&!waiting)return null;
  const vis=formVisual(e.formNext,e.kind);
  return (x,y,dir,k)=>{
   const w=ease(k),s=(borrowed?vis/BOSS_H:1)*(.3+.77*w),a=g.globalAlpha,cy=y+vis*.45*(.3+.7*w);
   g.globalCompositeOperation='lighter';
   const sp=glow(P.amber);if(sp){const r=vis*(.25+.55*w);g.globalAlpha=a*(.25+.55*w);g.drawImage(sp,x-r,-cy-r,r*2,r*2);}
   g.globalCompositeOperation='source-over';
   if(atlas){
    // Idle drawing 0, the one the form stands on when it becomes; lit from inside, a white flash peaks as it becomes.
    const f=atlas.data.clips[clipFor(atlas,'idle')].frames[0];
    g.globalAlpha=a*clamp01(.25+1.5*w);drawSprite(g,atlas,f,x,y,dir,s,false,borrowed?2:1);
    if(borrowed)drawTint(g,atlas,f,x,y,dir,s);
    g.globalAlpha=a*shiftWhite(k);drawSprite(g,atlas,f,x,y,dir,s,true,0);
   }
   // Amber cracks run out of the hunter's mask, then burn out as the form takes over.
   const h=A.head||[x,y+e.h*.9];g.globalCompositeOperation='lighter';g.lineCap='round';
   for(let i=0;i<7;i++){
    const ang=i/7*TAU+.4,len=(.15+1.6*w)*(.7+.3*Math.sin(i*2.3));let px=h[0],py=-h[1];
    g.strokeStyle=css(i%2?P.amberHot:'#ffffff',.9*(1-.7*w));g.lineWidth=.06*(1-.5*w);g.beginPath();g.moveTo(px,py);
    for(let j=1;j<=3;j++){const t=j/3,jit=(j%2?.18:-.18)*len*.3;px=h[0]+Math.cos(ang)*len*t-Math.sin(ang)*jit;py=-h[1]-Math.sin(ang)*len*t-Math.cos(ang)*jit;g.lineTo(px,py);}
    g.stroke();
   }
   g.strokeStyle=css(P.amberHot,.9*(1-w));g.lineWidth=.08;g.beginPath();g.arc(x,-cy,.3+w*vis*.5,0,TAU);g.stroke();
   g.globalCompositeOperation='source-over';g.globalAlpha=a;
  };
 }
 // Leaving the form: its last drawing shrinks into the hunter as a fading white-amber shell and bursts into shards.
 unshift(g,e,m,frame,alpha){
  const L=m.last,t=(frame+alpha-m.endAt)/BIG.UNSHIFT;if(!L?.atlas||!(t>=0&&t<1))return;
  const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,w=ease(t),s=L.s*(1-.7*w),cy=y+L.vis*.45*(1-.6*w);
  g.globalCompositeOperation='lighter';
  const sp=glow(P.amber);if(sp){const r=L.vis*(.7-.4*w);g.globalAlpha=.6*(1-t);g.drawImage(sp,x-r,-cy-r,r*2,r*2);}
  g.fillStyle=css(P.amberHot,.9*(1-t));
  for(let i=0;i<12;i++){const a=i/12*TAU+.2,d=L.vis*(.15+.75*w)*(.6+.4*Math.sin(i*1.7)),r=.08+.04*(i%3),px=x+Math.cos(a)*d,py=-(cy+Math.sin(a)*d)+w*w*.8;
   g.save();g.translate(px,py);g.rotate(t*6*(i%2?1:-1)+i);g.beginPath();g.moveTo(-r,0);g.lineTo(0,-r*1.6);g.lineTo(r,r*.4);g.closePath();g.fill();g.restore();}
  g.globalCompositeOperation='source-over';
  g.globalAlpha=1-w;drawSprite(g,L.atlas,L.f,x,y,L.dir,s,false,0);
  g.globalAlpha=.5*(1-w)*Math.min(1,t*4+.4);drawSprite(g,L.atlas,L.f,x,y,L.dir,s,true,0);
  g.globalAlpha=1;
 }
 // Every sheet the run can need is requested at its start (players, their masks' forms, enemies, the boss sheet that the
 // Chrysalis creature and a missing form sheet use), so none arrives late or mid-transformation.
 // They load one at a time and only while nothing on screen is waiting for its own sheet.
 preload(state){
  const sheets=manifest.sprites;if(!sheets)return;
  if(this.preloaded!==state){
   this.preloaded=state;const ids=new Set();
   for(const p of state.players){for(const k of spriteIds(p))ids.add(k);for(const f of p.forms||[]){ids.add('form-'+f);ids.add(f);}}
   for(const e of state.enemies||[])for(const k of spriteIds(e))ids.add(k);
   // The Old Glasswing's sheet (boss, Chrysalis creature, borrowed form) always comes last, so the title screen has
   // it ready before a Hall fight opens on it.
   ids.add('old-glasswing');
   this.queue=[...ids].filter(k=>sheets[k]);
  }
  while(this.queue?.length&&!this.atlas.pending.size)this.atlas.load(this.queue[0],sheets[this.queue.shift()]);
 }
 // One texture per frame from each freshly loaded sheet (colour, glow, then its white flash sheet, built here), touched
 // under the sky that is painted next, so the first boss frame, hit flash or transformation does not stall on it.
 warm(g){
  const w=this.warming||(this.warming={a:null,i:0});
  if(!w.a){w.a=this.atlas.fresh.shift()||null;w.i=0;if(!w.a)return;}
  const a=w.a,img=w.i===0?a.image:w.i===1?a.glow:whiteSheet(a);
  if(++w.i>2)w.a=null;
  if(img){g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;try{g.drawImage(img,0,0,1,1,0,0,1,1);}catch{}}
 }
 // Delivered atlas for this entity, as a draw callback; null keeps the procedural body.
 spriteFor(e,load,g,frame,A,alpha=1){
  let id=null,atlas=null;
  for(const k of spriteIds(e)){
   const entry=manifest.sprites?.[k];
   if(load&&entry)this.atlas.load(k,entry);
   atlas=this.atlas.get(k);if(atlas){id=k;break;}
   // The preferred sheet is still on its way: keep the procedural body rather than flash a fallback sheet.
   if(entry&&this.atlas.pending.has(k))return null;
  }
  if(!atlas)return null;
  const form=!!(e.form&&!e.boss&&FORMS[e.form]),borrowed=form&&id===e.form,vis=form?formVisual(e.form,e.kind):0,big=!!(e.boss||form);
  const mo=this.motionOf(e);
  return (x,y,dir,scale,name,progress,flash,rest=null)=>{
   const now=frame+alpha;
   let nm=e.glass&&name==='idle'?'glassidle':name,pr=progress,lift=false;
   // Possessed form: strikes play their own wind-up, the air uses the gallop's flight drawings.
   if(form){const fp=formPose(e,nm,pr,frame,mo);nm=fp.name;pr=fp.progress;lift=fp.lift;}
   // A beaten boss collapses on the wall clock, so the clip plays out on the frozen result frame too.
   if(nm==='beaten'&&e.boss&&e.dead){
    if(mo.deadAt===undefined)mo.deadAt=this.wallClock;
    const c=atlas.data.clips[clipFor(atlas,'beaten')];pr=Math.min(1,(this.wallClock-mo.deadAt)*(c.fps||30)/c.frames.length);
   }else mo.deadAt=undefined;
   // The borrowed boss sheet is authored at the boss's 5.1-tile box; the form is drawn at its own visual height.
   const s=borrowed?scale*vis/BOSS_H:scale,f=spriteFrame(atlas,e,nm,pr,frame,x,s);
   let sx=1,sy=1;
   if(e.team!==2){const q=this.squash.at(e,frame,alpha),k=form?BIG.FORM_SQUASH:1;sx=1+(q[0]-1)*k;sy=1+(q[1]-1)*k;}
   if(big){
    // A charge that ends in a turn (gallop -> telegraph at a wall) flips at once, under the cross-fade: the gallop's mass
    // sits ahead of the feet and every other drawing's behind, so the mirror lands nearest it, while an eased turn would
    // first throw the body back about 2 tiles, then sweep it across.
    const c=mo.cur,snap=!!c&&c.clip==='gallop'&&f.clip!=='gallop'&&mo.dir!==undefined&&dir!==mo.dir;
    const fv=this.turn(e,mo,dir,now,form,snap||STRIKES.has(nm));dir=fv<0?-1:1;sx*=Math.max(BIG.MIN_SQUEEZE,Math.abs(fv));
    if(form&&mo.becameAt!==undefined){const kb=(now-mo.becameAt)/BIG.BECOME;if(kb>=0&&kb<1){const o=1+.07*(1-ease(kb));sx*=o;sy*=o;}}
   }
   // A fallen wild body rests where its drawing (not its pivot) meets the surface (characters.js fallen).
   if(rest&&rest.floor!==null){const d=atlas.data,ff=f.frame;y=Math.max(y,Math.min(rest.cap,rest.floor+((ff.oy??0)+(ff.h??d.cell[1])-d.pivot[1])*s/d.pxPerTile));}
   // Air poses drawn from the gallop put their talons on the body's feet.
   const dy=lift?footLift(atlas,f.frame)*s*sy/atlas.data.pxPerTile:0,yd=y+dy;
   if(big&&!flash){
    // The outgoing record becomes the ghost (a new one is kept from here on, so the ghost keeps the old drawing).
    // Strikes cut in crisp (the strike is the read; a fading tell under it would smear it), and nothing fades into the
    // collapse (the result frame is frozen, so the ghost would never fade).
    if(mo.cur&&mo.cur.clip!==f.clip){if(!e.dead&&!STRIKES.has(f.clip)){mo.ghost=mo.cur;mo.fadeAt=now;}else mo.ghost=null;mo.cur=null;}
    const gh=mo.ghost,t=gh?(now-mo.fadeAt)/BIG.FADE:1;
    if(gh&&t>=0&&t<1&&gh.atlas===atlas){const a=g.globalAlpha;g.globalAlpha=a*(1-ease(t));drawSprite(g,atlas,gh.f,x,y+gh.dy,gh.dir,gh.s,false,0,gh.sx,gh.sy);g.globalAlpha=a;}
    else mo.ghost=null;
    const c=mo.cur||(mo.cur={});c.atlas=atlas;c.clip=f.clip;c.f=f.frame;c.dir=dir;c.s=s;c.sx=sx;c.sy=sy;c.dy=dy;
   }
   // Impact pass: the struck body keeps its shading under a white flash that fades (capped on bosses and tells).
   const wk=flash&&this.impact.on?this.impact.white(e):-1;if(wk>=0)flash=false;
   drawSprite(g,atlas,f.frame,x,yd,dir,s,flash,e.glass?1.4:borrowed?2:1,sx,sy);
   if(borrowed&&!flash)drawTint(g,atlas,f.frame,x,yd,dir,s,.75,sx,sy);
   if(wk>0){const a=g.globalAlpha;g.globalAlpha=a*wk;drawSprite(g,atlas,f.frame,x,yd,dir,s,true,0,sx,sy);g.globalAlpha=a;}
   // White flash: the form just taken settles out of light; the hunter just out of the form glows back in.
   const white=form?(mo.becameAt!==undefined?shiftWhite(1)*(1-clamp01((now-mo.becameAt)/BIG.BECOME))**1.5:0):mo.last?.85*(1-clamp01((now-mo.endAt)/(BIG.UNSHIFT*.5))):0;
   if(white>0&&!flash){const a=g.globalAlpha;g.globalAlpha=a*white;drawSprite(g,atlas,f.frame,x,yd,dir,s,true,0,sx,sy);g.globalAlpha=a;}
   if(form){const L=mo.last||(mo.last={});L.atlas=atlas;L.f=f.frame;L.dir=dir;L.s=s;L.borrowed=borrowed;L.vis=vis;}
   A.scale=form?vis*.5:s*(e.boss?3:1)*.8;A.dir=dir;
   for(const n of SOCKETS)A[n]=socket(atlas,f.frame,n,x,yd,dir,s,sx,sy)||estimate(n,e,x,yd,dir,s,vis);
   // Charging a blast on the run keeps the run drawings (clipOf), so the charge shows as light in the hand.
   if(e.charge>0&&!e.move&&f.clip!=='charge'&&f.clip!=='blast'&&!flash)chargeGlow(g,A.hand,Math.min(1,e.charge/F.charge),frame);
  };
 }
}
function chargeGlow(g,at,k,frame){
 const sp=glow(P.amber);if(!sp||!at)return;
 const r=(.12+.35*k)*(1+.1*Math.sin(frame*.5));
 g.globalCompositeOperation='lighter';g.globalAlpha=.9;g.drawImage(sp,at[0]-r,-at[1]-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function estimate(n,e,x,y,dir,s,vis=0){
 const h=vis||e.h*s,w=vis?vis*.4:e.w*s;
 return n==='head'?[x+dir*w*.1,y+h*.95]:n==='back'?[x-dir*w*.3,y+h*.72]:n==='hand'?[x+dir*w*.65,y+h*.5]:n==='chest'?[x+dir*w*.15,y+h*.62]:n==='legs'?[x+dir*w*.05,y+h*.03]:[x-dir*w*.45,y+h*.35];
}
const shifted={};
function shift(A,dx,dy){
 for(const n of SOCKETS)shifted[n]=A[n]&&[A[n][0]+dx,A[n][1]+dy];
 shifted.scale=A.scale;shifted.dir=A.dir;return shifted;
}
export {clipOf};
