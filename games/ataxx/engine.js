/* Original game engines and bounded computer player. MIT; see LICENSE. */
(function(root){
'use strict';
const KINDS=['ataxx','breakthrough','clobber','isolation','mini-amazons'];
const DIRS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const inside=(s,r,c)=>r>=0&&c>=0&&r<s.h&&c<s.w;
function neighbors(s,i,orth=false){const r=Math.floor(i/s.w),c=i%s.w;return DIRS.filter(([dr,dc])=>!orth||!dr||!dc).map(([dr,dc])=>[r+dr,c+dc]).filter(([r,c])=>inside(s,r,c)).map(([r,c])=>r*s.w+c)}
function rays(s,i){const out=[],r=Math.floor(i/s.w),c=i%s.w;for(const [dr,dc]of DIRS)for(let t=1;t<Math.max(s.w,s.h);t++){const rr=r+dr*t,cc=c+dc*t;if(!inside(s,rr,cc))break;const j=rr*s.w+cc;if(s.board[j]!==0)break;out.push(j)}return out}
function initial(kind){
 if(!KINDS.includes(kind))throw Error('Unknown game');
 const w=kind==='breakthrough'?8:kind==='clobber'||kind==='mini-amazons'?6:7,h=kind==='clobber'?5:w;
 const s={kind,w,h,board:Array(w*h).fill(0),turn:1,phase:'move',anchor:-1,ply:0,quiet:0,result:null,notice:'',positions:[]};
 if(kind==='ataxx'){s.board[0]=s.board[w*h-1]=1;s.board[w-1]=s.board[w*(h-1)]=2}
 if(kind==='breakthrough')for(let c=0;c<w;c++){s.board[c]=s.board[w+c]=1;s.board[(h-2)*w+c]=s.board[(h-1)*w+c]=2}
 if(kind==='clobber')for(let r=0;r<h;r++)for(let c=0;c<w;c++)s.board[r*w+c]=(r+c)%2+1;
 if(kind==='isolation'){s.board[3*w+1]=1;s.board[3*w+5]=2}
 if(kind==='mini-amazons'){s.board[1]=s.board[4]=1;s.board[5*w+1]=s.board[5*w+4]=2}
 if(kind==='ataxx')s.positions=[key(s)];return s;
}
function destinations(s,from,player=s.turn){
 if(!Number.isInteger(from)||from<0||from>=s.board.length||s.board[from]!==player)return [];
 const r=Math.floor(from/s.w),c=from%s.w;
 if(s.kind==='mini-amazons')return rays(s,from);
 if(s.kind==='isolation')return neighbors(s,from).filter(i=>s.board[i]===0);
 if(s.kind==='clobber')return neighbors(s,from,true).filter(i=>s.board[i]===3-player);
 if(s.kind==='breakthrough'){
  const rr=r+(player===1?1:-1);if(rr<0||rr>=s.h)return [];
  return [-1,0,1].filter(dc=>inside(s,rr,c+dc)&&(dc===0?s.board[rr*s.w+c]===0:s.board[rr*s.w+c+dc]!==player)).map(dc=>rr*s.w+c+dc);
 }
 const out=[];for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++)if((dr||dc)&&inside(s,r+dr,c+dc)){const i=(r+dr)*s.w+c+dc;if(s.board[i]===0)out.push(i)}return out;
}
function moves(s,player=s.turn){const out=[];for(let i=0;i<s.board.length;i++)if(s.board[i]===player)for(const to of destinations(s,i,player))out.push({from:i,to});return out}
function actions(s){if(s.result)return [];if(s.phase==='arrow')return rays(s,s.anchor).map(to=>({from:-1,to}));if(s.phase==='block')return s.board.flatMap((v,to)=>v===0?[{from:-1,to}]:[]);return moves(s)}
function key(s){return s.turn+':'+s.board.join(',')}
function count(s,player){return s.board.filter(v=>v===player).length}
function finish(s,actor){
 s.ply++;s.phase='move';s.anchor=-1;s.turn=3-actor;
 if(s.kind==='ataxx'){
  const a=count(s,1),b=count(s,2),next=moves(s),other=moves(s,actor);
  if(!a||!b||(!next.length&&!other.length)){s.result={winner:a===b?0:a>b?1:2,reason:'Final piece count: Blue '+a+', Amber '+b+'.'};return s}
  if(!next.length){s.turn=actor;s.notice=(3-actor===1?'Blue':'Amber')+' has no legal move and passes.'}
  const position=key(s);s.positions=s.positions.concat(position);
  if(s.positions.filter(v=>v===position).length>=3)s.result={winner:0,reason:'Draw: the same board and player to move occurred three times.'};
  else if(s.quiet>=80)s.result={winner:0,reason:'Draw: 80 consecutive jumps without a conversion.'};
  else if(s.ply>=500)s.result={winner:0,reason:'Draw: the 500-turn house limit was reached.'};
 }else if(s.kind==='breakthrough'&&s.board.some((v,i)=>v===actor&&(actor===1?Math.floor(i/s.w)===s.h-1:Math.floor(i/s.w)===0))){s.result={winner:actor,reason:'A pawn reached the opposite back rank.'}}
 else if(!moves(s).length)s.result={winner:actor,reason:(s.turn===1?'Blue':'Amber')+' has no legal move.'};
 return s;
}
function apply(s,a){
 if(!a||!Number.isInteger(a.from)||!Number.isInteger(a.to)||s.result)return null;
 if(s.phase==='move'){
  if(!destinations(s,a.from).includes(a.to))return null;
 }else if(a.from!==-1||!actions(s).some(v=>v.to===a.to))return null;
 const t={...s,board:s.board.slice(),notice:''},actor=s.turn;
 if(s.phase!=='move'){t.board[a.to]=-1;return finish(t,actor)}
 if(s.kind==='ataxx'){
  const distance=Math.max(Math.abs(Math.floor(a.from/s.w)-Math.floor(a.to/s.w)),Math.abs(a.from%s.w-a.to%s.w));
  if(distance===2)t.board[a.from]=0;t.board[a.to]=actor;let converted=0;
  for(const j of neighbors(t,a.to))if(t.board[j]===3-actor){t.board[j]=actor;converted++}
  t.quiet=distance===1||converted?0:s.quiet+1;return finish(t,actor);
 }
 t.board[a.from]=0;t.board[a.to]=actor;
 if(s.kind==='isolation'||s.kind==='mini-amazons'){t.phase=s.kind==='isolation'?'block':'arrow';t.anchor=a.to;return t}
 return finish(t,actor);
}
function reachable(s,player){const seen=new Set(),queue=[];s.board.forEach((v,i)=>{if(v===player){seen.add(i);queue.push(i)}});while(queue.length)for(const j of neighbors(s,queue.pop()))if(s.board[j]===0&&!seen.has(j)){seen.add(j);queue.push(j)}return seen.size}
function evaluate(s,player){
 if(s.result)return s.result.winner===0?0:s.result.winner===player?100000:-100000;
 const ours=moves(s,player),theirs=moves(s,3-player);
 if(s.kind==='ataxx')return 30*(count(s,player)-count(s,3-player))+.3*(ours.length-theirs.length);
 if(s.kind==='breakthrough'){
  let score=20*(count(s,player)-count(s,3-player));
  for(let i=0;i<s.board.length;i++)if(s.board[i]>0){const v=s.board[i],r=Math.floor(i/s.w),advance=v===1?r:s.h-1-r;score+=(v===player?1:-1)*advance*2}
  if(theirs.some(a=>(3-player)===1?Math.floor(a.to/s.w)===s.h-1:Math.floor(a.to/s.w)===0))score-=5000;
  return score+.2*(ours.length-theirs.length);
 }
 if(s.kind==='clobber')return 3*(ours.length-theirs.length)+.2*(count(s,player)-count(s,3-player));
 return (ours.length-theirs.length)*2+(reachable(s,player)-reachable(s,3-player));
}
function plan(s,level='tactical',rng=Math.random){
 const first=actions(s);if(!first.length)return [];
 if(level==='casual'){const a=first[Math.floor(rng()*first.length)],next=apply(s,a);if(next.phase!=='move'&&!next.result){const rest=actions(next);return [a,rest[Math.floor(rng()*rest.length)]]}return [a]}
 // Evaluate at most 512 complete turns, evenly sampled from the legal turn list.
 // This is a bounded one-ply heuristic, not an expert/minimax player.
 const candidates=[];for(const a of first){const next=apply(s,a);if(next.phase==='move'||next.result)candidates.push({seq:[a],state:next});else for(const b of actions(next))candidates.push({seq:[a,b],state:null,mid:next,last:b})}
 const limit=Math.min(512,candidates.length);let best=-Infinity,choices=[];
 for(let k=0;k<limit;k++){const candidate=candidates[Math.floor(k*candidates.length/limit)],state=candidate.state||apply(candidate.mid,candidate.last),value=evaluate(state,s.turn);if(value>best+.00001){best=value;choices=[candidate.seq]}else if(Math.abs(value-best)<.00001)choices.push(candidate.seq)}
 return choices[Math.floor(rng()*choices.length)]||[first[0]];
}
const api={KINDS,initial,neighbors,destinations,moves,actions,apply,count,plan,evaluate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
