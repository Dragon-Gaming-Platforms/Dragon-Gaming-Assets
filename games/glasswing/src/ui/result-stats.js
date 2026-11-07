import {F,EYES} from '../data/feel.js';
import {RESULTS as R} from '../data/results.js';
import {t} from './i18n.js';

const eyeNames=['orange','cyan','green','violet','red','yellow','pink','white'];
export const eyeName=eye=>t(eyeNames[EYES.indexOf(eye)]||'white');
export const duration=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
// A rank also weighs the hits taken (p.hits counts from rules v4): S and A need a clean run as well as the score.
export const RANK_HITS={S:5,A:12};
export const hitsTaken=s=>s.players.reduce((sum,p)=>sum+(p.hits||0),0);
export const rankOf=(won,score,hits)=>!won?'C':score>F.rankS&&hits<=RANK_HITS.S?'S':score>F.rankA&&hits<=RANK_HITS.A?'A':'B';

export function resultStats(s) {
 const p=s.players[0],kills=s.players.reduce((sum,p)=>sum+p.kills,0);
 const breaks=s.players.reduce((sum,p)=>sum+p.survived,0),hits=hitsTaken(s);
 const score=kills*R.killScore+s.areasCleared*R.areaScore+breaks*R.survivalScore+Math.max(0,s.lives)*R.lifeScore;
 return {
  won:s.won,areas:s.areasCleared,areaTotal:s.levels.length,score,kills,time:Math.floor(s.frame/F.hz),
  rank:rankOf(s.won,score,hits),hits,
  kind:p.kind,eye:p.eye,breaks,upgrades:[...p.upgrades],
  players:s.players.map(p=>({kind:p.kind,eye:p.eye,glass:p.glass,mask:p.mask,maxMask:p.maxMask,upgrades:[...p.upgrades],...(p.moults?{moults:[...p.moults],level:p.level}:{})}))
 };
}

// A later loss must never erase a winning personal best. Equal scores favour speed.
export function betterResult(candidate,previous) {
 return !previous||Number(candidate.won)>Number(previous.won)||candidate.won===previous.won&&
  (candidate.score>previous.score||candidate.score===previous.score&&candidate.time<previous.time);
}
