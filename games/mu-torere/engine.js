/* Original rules and two-ply computer policy. MIT; see LICENSE. */
(function(root){
'use strict';
const KINDS=['dodo','yavalath','mu-torere','dao','neutreeko'];
const HEX=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
const QUEEN=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function positionKey(s){return s.turn+':'+s.board.join(',');}
function initial(kind){
 if(!KINDS.includes(kind))throw Error('Unknown game');
 const s={kind,w:kind==='dao'?4:5,h:kind==='dao'?4:5,coords:[],board:[],turn:1,ply:0,result:null,positions:[]};
 if(kind==='dodo'||kind==='yavalath'){
  const n=kind==='dodo'?3:4;
  for(let r=-n;r<=n;r++)for(let q=-n;q<=n;q++)if(Math.abs(q+r)<=n)s.coords.push([q,r]);
  s.board=s.coords.map(([q,r])=>kind==='dodo'?(2*r+q<=-2?1:2*r+q>=2?2:0):0);
 }else if(kind==='mu-torere')s.board=[1,1,1,1,2,2,2,2,0];
 else{
  s.board=Array(s.w*s.h).fill(0);
  if(kind==='dao')for(let r=0;r<4;r++){s.board[r*4+r]=1;s.board[r*4+3-r]=2;}
  else{for(const i of[7,21,23])s.board[i]=1;for(const i of[1,3,17])s.board[i]=2;}
 }
 if(reversible(s))s.positions=[positionKey(s)];
 return s;
}
function reversible(s){return ['dao','neutreeko','mu-torere'].includes(s.kind);}
function isPlacement(s){return s.kind==='yavalath';}
function destinations(s,from,who=s.turn){
 if(s.result||isPlacement(s)||!Number.isInteger(from)||from<0||from>=s.board.length||s.board[from]!==who)return [];
 const out=[];
 if(s.kind==='mu-torere'){
  if(from===8){for(let i=0;i<8;i++)if(!s.board[i])out.push(i);}
  else{for(const j of[(from+7)%8,(from+1)%8])if(!s.board[j])out.push(j);
   if(!s.board[8]&&[(from+7)%8,(from+1)%8].some(i=>s.board[i]===3-who))out.push(8);
  }
 }else if(s.kind==='dodo'){
  const [q,r]=s.coords[from],d=who===1?1:-1;
  for(const [dq,dr]of [[0,d],[d,0],[-d,d]]){const to=s.coords.findIndex(([a,b])=>a===q+dq&&b===r+dr);if(to>=0&&!s.board[to])out.push(to);}
 }else{
  const r=Math.floor(from/s.w),c=from%s.w;
  for(const [dr,dc]of QUEEN){let last=-1;for(let k=1;k<s.w;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||cc<0||rr>=s.h||cc>=s.w||s.board[rr*s.w+cc])break;last=rr*s.w+cc;}if(last>=0)out.push(last);}
 }
 return out;
}
function actions(s,who=s.turn){
 if(s.result)return [];
 if(isPlacement(s))return s.board.flatMap((v,to)=>v?[]:[{from:-1,to}]);
 return s.board.flatMap((_,from)=>destinations(s,from,who).map(to=>({from,to})));
}
function hasLine(s,who,n){
 if(s.kind==='yavalath'){
  for(let from=0;from<s.board.length;from++)if(s.board[from]===who){const [q,r]=s.coords[from];
   for(const [dq,dr]of HEX.slice(0,3)){let ok=true;for(let k=1;k<n;k++){const i=s.coords.findIndex(([a,b])=>a===q+dq*k&&b===r+dr*k);if(i<0||s.board[i]!==who){ok=false;break;}}if(ok)return true;}
  }
 }else{
  for(let r=0;r<s.h;r++)for(let c=0;c<s.w;c++)for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){
   let ok=true;for(let k=0;k<n;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||cc<0||rr>=s.h||cc>=s.w||s.board[rr*s.w+cc]!==who){ok=false;break;}}if(ok)return true;
  }
 }
 return false;
}
function daoFormation(s,who){
 const b=s.board;
 for(let i=0;i<4;i++)if([0,1,2,3].every(j=>b[i*4+j]===who)||[0,1,2,3].every(j=>b[j*4+i]===who))return true;
 if([0,3,12,15].every(i=>b[i]===who))return true;
 for(let r=0;r<3;r++)for(let c=0;c<3;c++)if([r*4+c,r*4+c+1,r*4+c+4,r*4+c+5].every(i=>b[i]===who))return true;
 return false;
}
function trappedCorner(s,victim){
 const b=s.board;
 return [[0,1,4,5],[3,2,6,7],[12,8,9,13],[15,10,11,14]].some(([corner,...near])=>b[corner]===victim&&near.every(i=>b[i]===3-victim));
}
// Internal transition assumes a legal action; public saved-state replay uses apply.
function advance(s,a){
 const t={...s,board:s.board.slice(),turn:3-s.turn,ply:s.ply+1};
 if(isPlacement(s))t.board[a.to]=s.turn;else{t.board[a.to]=s.turn;t.board[a.from]=0;}
 const win=(winner,reason)=>{t.result={winner,reason};};
 if(s.kind==='yavalath'){
  if(hasLine(t,s.turn,4))win(s.turn,'Four or more in a straight hex-grid line; four takes precedence over a triple.');
  else if(hasLine(t,s.turn,3))win(3-s.turn,'The mover made three without also making four, and loses.');
  else if(!t.board.includes(0))win(0,'The board is full without a winning four or losing triple.');
 }else if(s.kind==='neutreeko'&&hasLine(t,s.turn,3))win(s.turn,'Three adjacent pieces in a straight horizontal, vertical or diagonal line.');
 else if(s.kind==='dao'){
  // The anti-cornering loss overrides an ordinary formation made by the mover.
  if(trappedCorner(t,3-s.turn))win(3-s.turn,'The mover surrounded an enemy corner piece with three own pieces and loses.');
  else if(daoFormation(t,s.turn))win(s.turn,'All four pieces form a row, column, adjacent 2×2 square, or occupy all four corners.');
 }
 if(!t.result&&!actions(t).length)win(s.kind==='dodo'?t.turn:s.turn,s.kind==='dodo'?'The next player has no legal move and WINS in Dodo.':'The next player has no legal move and loses.');
 if(!t.result&&reversible(t)){
  const key=positionKey(t);t.positions=s.positions.concat(key);
  if(t.positions.filter(v=>v===key).length>=3)win(0,'House draw: third occurrence of the same board and player to move.');
  else if(t.ply>=200)win(0,'House draw: 200 completed moves.');
 }
 return t;
}
function apply(s,a){
 if(!a||!Number.isInteger(a.from)||!Number.isInteger(a.to)||!actions(s).some(v=>v.from===a.from&&v.to===a.to))return null;
 return advance(s,a);
}
function score(s,who){
 if(s.result)return s.result.winner===0?0:s.result.winner===who?100000:-100000;
 const own=actions(s,who).length,enemy=actions(s,3-who).length;
 if(s.kind==='dodo')return enemy-own;
 if(s.kind==='mu-torere')return own-enemy;
 let v=(own-enemy)*.1;
 if(s.kind==='yavalath'){
  for(let i=0;i<s.board.length;i++)if(s.board[i]){const [q,r]=s.coords[i];v+=(s.board[i]===who?1:-1)*(4-Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r)));}
 }else{
  // Reward close own pieces (alignment candidates), not an expert evaluator.
  for(let i=0;i<s.board.length;i++)if(s.board[i])for(let j=i+1;j<s.board.length;j++)if(s.board[j]===s.board[i])v+=(s.board[i]===who?1:-1)*(s.w-Math.max(Math.abs(Math.floor(i/s.w)-Math.floor(j/s.w)),Math.abs(i%s.w-j%s.w)));
 }
 return v;
}
function plan(s,level='tactical',rng=Math.random){
 const legal=actions(s);if(!legal.length)return [];
 if(level==='casual')return [legal[Math.floor(rng()*legal.length)]];
 let best=-Infinity,choices=[];
 for(const a of legal){const next=advance(s,a);let value=score(next,s.turn);
  if(!next.result){let worst=Infinity;for(const b of actions(next))worst=Math.min(worst,score(advance(next,b),s.turn));if(worst!==Infinity)value=worst+.001*value;}
  if(value>best+.000001){best=value;choices=[a];}else if(Math.abs(value-best)<.000001)choices.push(a);
 }
 return [choices[Math.floor(rng()*choices.length)]];
}
const api={KINDS,initial,isPlacement,destinations,actions,apply,hasLine,daoFormation,trappedCorner,plan};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
