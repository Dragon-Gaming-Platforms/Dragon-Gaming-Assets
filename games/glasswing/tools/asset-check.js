import {View} from '../src/render2d/view.js';
import {SPRITE_IDS} from '../src/render2d/atlas.js';
import {loadManifest} from '../src/ui/assets.js';
import {entity} from '../src/core/entity.js';
import {testLevel} from '../src/data/test-level.js';
import {t} from '../src/ui/i18n.js';
import {F} from '../src/data/feel.js';

// Sprite viewer for assets/manifest.json "sprites": loads each atlas, plays clips, reports failures.
const params=new URLSearchParams(location.search);
const manifest=await loadManifest(params.get('manifest')==='test'?'../assets/manifest.test.json':'../assets/manifest.json');
const view=new View(document.querySelector('#world'));
view.setLevel(testLevel);
const fit=view.framing.update.bind(view.framing);
view.framing.update=(...a)=>{const r=fit(...a);r.h=4.2;r.w=r.h*a[3];r.x=9;r.y=2.4;return r;};
let id=SPRITE_IDS.includes(params.get('id'))?params.get('id'):'brawler',clip='idle',pose='normal',paused=false,resets=0,last=0,accumulator=0;
const choices=['normal','hit','glass','telegraph','downed','boss'];
const state={players:[],enemies:[],frame:0,camera:{x:9,y:5},level:testLevel};
function make(){
 const wild=id.startsWith('wild-'),boss=id==='old-glasswing'||pose==='boss',kind=wild?id.slice(5):boss?'brawler':id;
 const e=entity(1,kind,9,1,wild||boss?2:0);e.grounded=true;e.eye=wild?'#8C8C94':'#FF8A3D';
 if(boss)Object.assign(e,{boss:true,phase:1,w:e.w*F.bossSize,h:e.h*F.bossSize,eye:'#19B8A6'});
 state.players=wild||boss?[]:[e];state.enemies=wild||boss?[e]:[];
 return e;
}
let subject=make();
const hud=document.querySelector('#hud');
hud.style.pointerEvents='auto';
hud.innerHTML=`<div class="hudbox"><h3>${t('assetCheck')}</h3>
 <label>id <select id="sprite">${SPRITE_IDS.map(s=>`<option${s===id?' selected':''}>${s}</option>`).join('')}</select></label>
 <label>clip <select id="clip"><option>idle</option></select></label>
 <label>${t('assetPose')} <select id="pose">${choices.map(name=>`<option value="${name}">${t('assetPose_'+name)}</option>`).join('')}</select></label>
 <button id="reset">${t('retry')}</button><button id="pause">${t('action_pause')}</button>
 <output id="asset-result"></output></div>`;
const clipSelect=document.querySelector('#clip');
document.querySelector('#sprite').addEventListener('change',e=>{id=e.target.value;clip='idle';subject=make();clipSelect.dataset.for='';});
clipSelect.addEventListener('change',e=>{clip=e.target.value;});
document.querySelector('#pose').addEventListener('change',e=>{pose=e.target.value;subject=make();state.frame=0;});
document.querySelector('#reset').addEventListener('click',()=>{view.setLevel(testLevel);subject=make();resets++;});
document.querySelector('#pause').addEventListener('click',e=>{paused=!paused;e.target.textContent=t(paused?'resume':'action_pause');});

function frame(now){
 const delta=Math.min(last?(now-last)/1000:1/F.hz,.1);last=now;
 if(!paused){accumulator+=delta;while(accumulator>=1/F.hz){state.frame++;accumulator-=1/F.hz;}}
 const atlas=view.atlas.get(id);
 if(atlas&&clipSelect.dataset.for!==id){clipSelect.innerHTML=Object.keys(atlas.data.clips).map(c=>`<option>${c}</option>`).join('');clipSelect.dataset.for=id;clip=clipSelect.value;}
 subject.clip=pose==='downed'?'beaten':pose==='telegraph'?'telegraph':clip;
 subject.dead=pose==='downed';subject.glass=pose==='glass';subject.mask=subject.glass?0:subject.maxMask;
 subject.flash=pose==='hit'?F.flash:0;
 subject.ai=pose==='telegraph'?'telegraph':'idle';subject.aiTimer=pose==='telegraph'?12:0;
 view.render(state,1,paused?0:delta,true);
 const status={id,entry:manifest.sprites?.[id]||null,loaded:!!atlas,pending:view.atlas.pending.has(id),failed:[...view.atlas.failed],
  clips:atlas?Object.keys(atlas.data.clips).length:0,clip,cell:atlas?.data.cell||null,glow:!!atlas?.glow,sprites:view.stats.sprites,resets,frame:state.frame,paused};
 document.querySelector('#asset-result').textContent=JSON.stringify(status);
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
