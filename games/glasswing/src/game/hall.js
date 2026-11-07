import {emitSound} from '../core/sound.js';
import {random} from '../core/rng.js';
import {hurt,heal} from '../core/combat.js';
import {spawnEnemy} from './enemies/wild.js';
import {possess} from './possession.js';
import {arenaHazards} from './versus.js';
import {HALL} from '../data/forms.js';
import {BOSS4} from '../data/boss4.js';
import {VISUALS as V} from '../data/visuals.js';
import {F} from '../data/feel.js';

// Rules-v4 Hall of Masks. A Mask Trial puts an owned form (no meter limit) against escalating waves of wild kinds in an
// arena; a Rematch refights the Old Glasswing from its door at the Hunter or Glass tier. Records live outside the campaign.
const fall={x:0,team:2,eye:'#FF4A4A'};
export const hitsOf=s=>{let n=0;for(const p of s.players)n+=p.hits||0;return n;};
export function hallLevels(levels,config){
 return config.hall==='trial'?[levels.find(l=>l.id===config.arena)||levels[0]]:[levels.find(l=>l.id==='nest')||levels.at(-1)];
}
export function setupHall(s){
 if(s.config.hall==='trial'){
  s.hall={kind:'trial',wave:0,cleared:0,timer:HALL.firstDelay};s.lives=1;
  // The hunter starts on the arena floor (not dropped onto the platform above the start).
  for(const p of s.players){p.y=p.py=s.level.start.y;p.ember=p.emberMax;possess(s,p,s.config.form);}
 }else{
  // The boss door, every wave of the Nest already cleared (as tests/boss-arena.mjs).
  s.hall={kind:'rematch',boss:0,start:0,hits:0,attempts:0};
  s.spawned=s.level.waves.map((_,i)=>i);s.checkpoint=BOSS4.door-1;
  for(const p of s.players){p.x=p.px=BOSS4.door+3;p.y=p.py=1;}
 }
}
function wave(s,h){
 // Corpses that finished dissolving leave the list, so a long trial stays small.
 for(let i=s.enemies.length-1;i>=0;i--){const e=s.enemies[i];if(e.dead&&e.dropped&&s.frame-e.defeatedFrame>V.defeatedLife)s.enemies.splice(i,1);}
 h.wave++;
 const n=Math.min(HALL.max,1+h.wave),w=s.level.width;
 for(let i=0;i<n;i++){
  const kind=HALL.kinds[Math.floor(random(s)*HALL.kinds.length)];
  const elite=h.wave>=HALL.eliteFrom&&random(s)<Math.min(HALL.eliteMax,HALL.elite*h.wave),step=(i>>1)*HALL.spacing;
  const e=spawnEnemy(s,{kind,x:i%2?w-HALL.edge-step:HALL.edge+step,y:kind==='skimmer'?HALL.skimmerY:1,delay:i*F.spawnDelay,elite});
  e.hp*=1+HALL.hpStep*(h.wave-1);
 }
 emitSound(s,'enemy-telegraph');
}
export function hallTick(s){
 const h=s.hall;
 if(h.kind==='rematch'){
  // Records count the winning attempt only: its time from the boss's arrival and the hits taken in it.
  for(const e of s.enemies)if(e.boss){if(e.id!==h.boss){h.boss=e.id;h.start=s.frame;h.hits=hitsOf(s);h.attempts++;}break;}
  return;
 }
 // The arena's own hazard (wind or mushrooms) plays as in versus.
 arenaHazards(s);
 // A fall costs a mask (or a shell plate) and returns the hunter to the arena start.
 for(const p of s.players)if(!p.dead&&p.y<HALL.fall){
  p.x=p.px=s.level.start.x;p.y=p.py=s.level.start.y+.5;p.vx=0;p.vy=0;fall.x=p.x;
  hurt(s,p,fall,1,{unparryable:true});
 }
 let alive=false;
 for(const e of s.enemies)if(!e.dead){alive=true;break;}
 if(alive){h.timer=HALL.gap;return;}
 if(h.wave>h.cleared){
  h.cleared=h.wave;emitSound(s,'altar-chime');
  for(const p of s.players)if(!p.dead&&!p.glass)heal(p,HALL.repair);
 }
 if(--h.timer<=0)wave(s,h);
}
// The record a finished Hall run sets: waves for a trial, time and hits of the winning attempt for a rematch.
export function hallRecord(s){
 const h=s.hall;
 if(!h)return null;
 if(h.kind==='trial')return {waves:h.cleared,time:Math.floor(s.frame/F.hz),hits:hitsOf(s)};
 return s.won?{time:Math.round((s.frame-h.start)/F.hz*10)/10,hits:hitsOf(s)-h.hits,attempts:h.attempts}:null;
}
