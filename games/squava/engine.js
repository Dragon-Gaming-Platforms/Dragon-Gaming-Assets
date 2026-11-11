/* Original rules and bounded computer policy. MIT; see LICENSE. */
(function(root){
'use strict';
const KINDS=['col','gopher','squava','neutron','quadrant-five'];
const DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
function initial(kind){if(!KINDS.includes(kind))throw Error('Unknown game');const w={col:7,gopher:6,squava:5,neutron:5,'quadrant-five':6}[kind],s={kind,w,h:w,board:Array(w*w).fill(0),turn:1,phase:'move',anchor:-1,ply:0,result:null,positions:[]};if(kind==='neutron'){for(let c=0;c<5;c++){s.board[c]=1;s.board[20+c]=2}s.board[12]=3;s.positions=[key(s)]}return s}
function neighbors(s,i){const r=Math.floor(i/s.w),c=i%s.w;return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<s.h&&b<s.w).map(([a,b])=>a*s.w+b)}
function slides(s,from){const out=[],r=Math.floor(from/s.w),c=from%s.w;for(const [dr,dc]of DIRS){let last=-1;for(let k=1;k<s.w;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||cc<0||rr>=s.h||cc>=s.w||s.board[rr*s.w+cc]!==0)break;last=rr*s.w+cc}if(last>=0)out.push(last)}return out}
function isPlacement(s){return s.kind!=='neutron'&&s.phase==='move'}
function turnStart(s){return s.phase==='move'}
function destinations(s,from,who=s.turn){if(s.result||s.kind!=='neutron'||!Number.isInteger(from)||from<0||from>=25)return [];const wanted=s.ply===0||s.phase==='pawn'?who:3;return s.board[from]===wanted?slides(s,from):[]}
function actions(s,who=s.turn){if(s.result)return [];if(s.phase==='rotate')return [0,1,2,3].flatMap(from=>[{from,to:1},{from,to:-1}]);if(s.kind==='neutron'){const out=[];for(let i=0;i<25;i++)for(const to of destinations(s,i,who))out.push({from:i,to});return out}const out=[];for(let to=0;to<s.board.length;to++)if(s.board[to]===0){const near=neighbors(s,to);if(s.kind==='col'&&near.some(i=>s.board[i]===who))continue;if(s.kind==='gopher'&&s.ply>0&&(near.filter(i=>s.board[i]===3-who).length!==1||near.some(i=>s.board[i]===who)))continue;out.push({from:-1,to})}return out}
function hasLine(s,who,n){for(let r=0;r<s.h;r++)for(let c=0;c<s.w;c++)for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){let ok=true;for(let k=0;k<n;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||cc<0||rr>=s.h||cc>=s.w||s.board[rr*s.w+cc]!==who){ok=false;break}}if(ok)return true}return false}
function key(s){return s.turn+':'+s.board.join(',')}
function rotated(board,q,dir){const out=board.slice(),r0=Math.floor(q/2)*3,c0=q%2*3;for(let r=0;r<3;r++)for(let c=0;c<3;c++){const rr=dir===1?c:2-c,cc=dir===1?2-r:r;out[(r0+rr)*6+c0+cc]=board[(r0+r)*6+c0+c]}return out}
function fiveResult(s){const b=hasLine(s,1,5),a=hasLine(s,2,5);if(b&&a)return {winner:0,reason:'Both colors have five in a row after the twist.'};if(b||a)return {winner:b?1:2,reason:'Five or more consecutive stones in a straight line.'};return null}
function finish(s,actor){s.phase='move';s.anchor=-1;s.ply++;s.turn=3-actor;if(!s.result&&s.kind==='neutron'){if(!actions(s).length)s.result={winner:actor,reason:'The other player cannot slide the neutron.'};else{const k=key(s);s.positions=s.positions.concat(k);if(s.positions.filter(v=>v===k).length>=3)s.result={winner:0,reason:'House draw: three occurrences of the same board and player to move.'};else if(s.ply>=200)s.result={winner:0,reason:'House draw: 200 completed turns.'}}}return s}
function apply(s,a){if(!a||s.result||!Number.isInteger(a.from)||!Number.isInteger(a.to)||!actions(s).some(v=>v.from===a.from&&v.to===a.to))return null;const t={...s,board:s.board.slice()},actor=s.turn;
 if(s.kind==='neutron'){
  const piece=t.board[a.from];t.board[a.from]=0;t.board[a.to]=piece;
  if(piece===3){const row=Math.floor(a.to/5);if(row===0||row===4){t.result={winner:row===0?1:2,reason:'The neutron reached '+(row===0?'Blue':'Amber')+'’s home row.'};return finish(t,actor)}t.phase='pawn';t.anchor=a.to;if(!actions(t).length){t.result={winner:3-actor,reason:'The neutron moved, but the player has no legal pawn slide.'};return finish(t,actor)}return t}
  return finish(t,actor);
 }
 if(s.phase==='rotate'){t.board=rotated(s.board,a.from,a.to);t.result=fiveResult(t);if(!t.result&&!t.board.includes(0))t.result={winner:0,reason:'The board is full without a five-in-a-row.'};return finish(t,actor)}
 t.board[a.to]=actor;
 if(s.kind==='quadrant-five'){t.result=fiveResult(t);if(t.result)return finish(t,actor);t.phase='rotate';return t}
 if(s.kind==='squava'){if(hasLine(t,actor,4))t.result={winner:actor,reason:'Four in a row: this takes precedence over a triple.'};else if(hasLine(t,actor,3))t.result={winner:3-actor,reason:(actor===1?'Blue':'Amber')+' made three in a row without a four and loses.'};else if(!t.board.includes(0))t.result={winner:0,reason:'Full board without a four or a losing triple.'};return finish(t,actor)}
 finish(t,actor);if(!actions(t).length)t.result={winner:actor,reason:(t.turn===1?'Blue':'Amber')+' has no legal placement.'};return t;
}
function count(s,who){return s.board.filter(v=>v===who).length}
function pawnMobility(s,who){let n=0;for(let i=0;i<25;i++)if(s.board[i]===who)n+=slides(s,i).length;return n}
function score(s,who){if(s.result)return s.result.winner===0?0:s.result.winner===who?100000:-100000;if(s.kind==='neutron'){const n=s.board.indexOf(3);let value=pawnMobility(s,who)-pawnMobility(s,3-who);if(slides(s,n).some(i=>Math.floor(i/5)===(s.turn===1?0:4)))value-=5000;return value}
 if(s.kind==='col'||s.kind==='gopher')return actions(s,who).length-actions(s,3-who).length;
 let value=0;for(let i=0;i<s.board.length;i++)if(s.board[i]>0){const r=Math.floor(i/s.w),c=i%s.w;value+=(s.board[i]===who?1:-1)*(s.w-Math.abs(r-(s.h-1)/2)-Math.abs(c-(s.w-1)/2))}
 if(s.kind==='squava'&&actions(s).some(a=>apply(s,a).result?.winner===s.turn))value-=5000;
 return value;
}
function plan(s,level='tactical',rng=Math.random){const first=actions(s);if(!first.length)return [];if(level==='casual'){const a=first[Math.floor(rng()*first.length)],n=apply(s,a);if(!n.result&&!turnStart(n)){const more=actions(n);return[a,more[Math.floor(rng()*more.length)]]}return[a]}
 const candidates=[];for(const a of first){const next=apply(s,a);if(next.result||turnStart(next))candidates.push({seq:[a],state:next});else for(const b of actions(next))candidates.push({seq:[a,b],mid:next,last:b})}
 const limit=Math.min(512,candidates.length);let best=-Infinity,choices=[];for(let i=0;i<limit;i++){const c=candidates[Math.floor(i*candidates.length/limit)],v=score(c.state||apply(c.mid,c.last),s.turn);if(v>best+.00001){best=v;choices=[c.seq]}else if(Math.abs(v-best)<.00001)choices.push(c.seq)}return choices[Math.floor(rng()*choices.length)]}
const api={KINDS,initial,neighbors,isPlacement,turnStart,destinations,actions,apply,count,plan,hasLine,rotated};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
