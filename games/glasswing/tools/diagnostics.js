import {View} from '../src/render2d/view.js';
import {entity} from '../src/core/entity.js';
import {testLevel} from '../src/data/test-level.js';
import {t} from '../src/ui/i18n.js';
import {loadLevel,LEVEL_IDS} from '../src/game/level.js';
import {MOVES} from '../src/data/moves.js';

// Controlled visual fixtures (not playthroughs): ?pose=run|air|glass|windup|gallery|moves|boss&area=landing|canopy|hollow|nest
const params=new URLSearchParams(location.search),pose=params.get('pose')||'run';
let level=testLevel;
if(LEVEL_IDS.includes(params.get('area')))level=await loadLevel(params.get('area'));
const view=new View(document.querySelector('#world'));view.setLevel(level);
// ?zoom=3&cx=6&cy=2 pins a close camera for art inspection.
const zoom=Number(params.get('zoom'));
if(zoom>0){const fit=view.framing.update.bind(view.framing);view.framing.update=(...a)=>{const r=fit(...a);r.h=10/zoom;r.w=r.h*a[3];r.x=Number(params.get('cx'))||r.x;r.y=Number(params.get('cy'))||r.y;return r;};}
const kinds=['brawler','skimmer','spark'];
let players=[],enemies=[];
if(pose==='gallery'||pose==='boss'){
 players=kinds.map((k,i)=>Object.assign(entity(i+1,k,4+i*2.2,1),{grounded:true}));
 enemies=kinds.map((k,i)=>Object.assign(entity(10+i,k,11+i*2.2,k==='skimmer'?2.3:1,2),{grounded:k!=='skimmer',facing:-1,eye:'#8C8C94',eliteHits:i===1?2:0}));
 if(pose==='boss'){const b=entity(20,'brawler',22,1,2);Object.assign(b,{boss:true,phase:1,w:b.w*3,h:b.h*3,facing:-1,grounded:true,eye:'#19B8A6',ai:'idle'});enemies.push(b);}
}else if(pose==='moves'){
 const names=['idle','run','jump','glide','punch1','kick','sword','downsword','blast','dodge','block','beaten'];
 players=names.map((n,i)=>Object.assign(entity(i+1,kinds[i%3],2+i*1.6,1),{grounded:!['jump','glide','downsword'].includes(n),clip:n,demo:n}));
}else{
 const count=pose==='air'?2:20;
 players=Array.from({length:count},(_,i)=>entity(i,kinds[i%3],2+i%10*1.5,1+Math.floor(i/10)*2,i%2));
 if(pose==='air')for(let i=0;i<2;i++){const p=players[i];p.x=p.px=20+i*12;p.y=p.py=i?1:12;p.clip='jump';}
 else for(const p of players){
  p.grounded=true;p.clip=pose==='glass'?'glassidle':pose==='windup'?'telegraph':'run';
  if(pose==='glass'){p.mask=0;p.glass=true;}
  if(pose==='windup'){p.ai='telegraph';p.aiTimer=12;p.team=2;}
 }
}
const state={players,enemies,frame:0,camera:{x:pose==='air'?26:pose==='boss'?16:9,y:5},level};
let last=0,frames=0,elapsed=0;
function frame(now){
 const delta=last?(now-last)/1000:1/60;last=now;state.frame++;
 for(const p of players)if(p.demo&&MOVES[p.demo]){p.move=p.demo;p.moveFrame=state.frame%MOVES[p.demo].total;}
 for(const e of enemies){if(e.boss){const c=Math.floor(state.frame/90)%4;e.ai=c===1?'telegraph':c===2?'attack':'idle';e.action='sweep';e.clip=c===2?'sweep':e.ai;e.aiTimer=c===1?28-(state.frame%90)*28/90:c===2?20-(state.frame%90)*20/90:0;}else{e.ai=Math.floor(state.frame/120)%2?'telegraph':'idle';e.clip=e.ai==='telegraph'?'telegraph':'move';e.aiTimer=e.ai==='telegraph'?24-(state.frame%120)/5:0;}}
 view.render(state,1,delta);frames++;elapsed+=delta;
 if(frames%60===0)document.querySelector('#hud').innerHTML=`<div class="hudbox"><h3>${t('diagnostics')}</h3><output id="metrics">${JSON.stringify({characters:players.length+enemies.length,fps:Math.round(frames/elapsed*10)/10,drawn:view.stats.characters,sprites:view.stats.sprites,backing:[view.stats.width,view.stats.height],frames})}</output></div>`;
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
