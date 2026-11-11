/* Original rule engine and bounded computer policy. MIT; see LICENSE. */
(function(root){
'use strict';
const KINDS=['nogo','knightthrough','traffic-lights','order-and-chaos','notakto'];
function initial(kind){
 if(!KINDS.includes(kind))throw Error('Unknown game');
 const w={nogo:7,knightthrough:8,'traffic-lights':4,'order-and-chaos':6,notakto:3}[kind];
 const h=kind==='traffic-lights'?3:kind==='notakto'?9:w;
 const s={kind,w,h,board:Array(w*h).fill(0),turn:1,ply:0,result:null};
 if(kind==='knightthrough')for(let i=0;i<16;i++){s.board[i]=1;s.board[63-i]=2;}
 return s;
}
function neighbors(s,i){const r=Math.floor(i/s.w),c=i%s.w;return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<s.h&&b<s.w).map(([a,b])=>a*s.w+b);}
function hasLine(s,who,n,offset=0,w=s.w,h=s.h){
 for(let r=0;r<h;r++)for(let c=0;c<w;c++)for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){
  let ok=true;
  for(let k=0;k<n;k++){const rr=r+dr*k,cc=c+dc*k;if(rr<0||cc<0||rr>=h||cc>=w||s.board[offset+rr*w+cc]!==who){ok=false;break;}}
  if(ok)return true;
 }
 return false;
}
function dead(s,b){return hasLine(s,1,3,b*9,3,3);}
function safeNoGo(s,to,who){
 const t={...s,board:s.board.slice()};t.board[to]=who;
 // Examine each affected block. Existing valid blocks elsewhere are unchanged.
 const seen=new Set();
 for(const start of [to,...neighbors(t,to)]){
  if(!t.board[start]||seen.has(start))continue;
  const color=t.board[start],stack=[start];let liberty=false;seen.add(start);
  while(stack.length){const i=stack.pop();for(const j of neighbors(t,i)){
   if(t.board[j]===0)liberty=true;
   else if(t.board[j]===color&&!seen.has(j)){seen.add(j);stack.push(j);}
  }}
  if(!liberty)return false;
 }
 return true;
}
function isPlacement(s){return s.kind!=='knightthrough';}
function destinations(s,from,who=s.turn){
 if(s.result||s.kind!=='knightthrough'||!Number.isInteger(from)||from<0||from>=64||s.board[from]!==who)return [];
 const r=Math.floor(from/8),c=from%8,d=who===1?1:-1,out=[];
 for(const [dr,dc]of [[d,2],[d,-2],[2*d,1],[2*d,-1]]){
  const rr=r+dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8&&s.board[rr*8+cc]!==who)out.push(rr*8+cc);
 }
 return out;
}
function actions(s,who=s.turn){
 if(s.result)return [];
 if(s.kind==='knightthrough')return s.board.flatMap((_,from)=>destinations(s,from,who).map(to=>({from,to})));
 const out=[];
 for(let to=0;to<s.board.length;to++){
  const v=s.board[to];
  if(s.kind==='traffic-lights'){if(v<3)out.push({from:-1,to});continue;}
  if(v!==0)continue;
  if(s.kind==='notakto'&&dead(s,Math.floor(to/9)))continue;
  if(s.kind==='nogo'&&!safeNoGo(s,to,who))continue;
  if(s.kind==='order-and-chaos'){out.push({from:-1,to,mark:1},{from:-1,to,mark:2});continue;}
  out.push({from:-1,to});
 }
 return out;
}
function apply(s,a){
 if(!a||s.result||!Number.isInteger(a.from)||!Number.isInteger(a.to)||!actions(s).some(v=>v.from===a.from&&v.to===a.to&&v.mark===a.mark))return null;
 const t={...s,board:s.board.slice(),turn:3-s.turn,ply:s.ply+1};
 if(s.kind==='knightthrough'){t.board[a.from]=0;t.board[a.to]=s.turn;}
 else t.board[a.to]=s.kind==='traffic-lights'?s.board[a.to]+1:s.kind==='notakto'?1:s.kind==='order-and-chaos'?a.mark:s.turn;
 const win=(winner,reason)=>{t.result={winner,reason};};
 if(s.kind==='traffic-lights'){
  if(hasLine(t,t.board[a.to],3))win(s.turn,'Three lights of the same color form a straight line. The mover wins.');
  else if(!actions(t).length)win(0,'No light can advance and no line was formed.');
 }else if(s.kind==='order-and-chaos'){
  if(hasLine(t,1,5)||hasLine(t,2,5))win(1,'Order wins: five or more identical marks in a straight line, regardless of who placed them.');
  else if(!t.board.includes(0))win(2,'Chaos wins: the full board has no line of five identical marks.');
 }else if(s.kind==='notakto'){
  if([0,1,2].every(b=>dead(t,b)))win(3-s.turn,'The mover killed the last live board and loses.');
 }else if(s.kind==='knightthrough'){
  const r=Math.floor(a.to/8);
  if(r===(s.turn===1?7:0))win(s.turn,'A knight reached the opposite back rank.');
  else if(!actions(t).length)win(s.turn,'The opponent has no legal forward knight move.');
 }else if(!actions(t).length)win(s.turn,'The opponent has no legal placement without capture or suicide.');
 return t;
}
function heuristic(s,who){
 if(s.result)return s.result.winner===0?0:s.result.winner===who?100000:-100000;
 if(s.kind==='nogo')return actions(s,who).length-actions(s,3-who).length;
 if(s.kind==='knightthrough'){
  let value=0;for(let i=0;i<64;i++)if(s.board[i]){const p=s.board[i],r=Math.floor(i/8);value+=(p===who?1:-1)*(10+(p===1?r:7-r)*4);}
  return value;
 }
 if(s.kind==='order-and-chaos'){
  let value=0;
  // Unmixed five-cell windows are the opportunities Order wants to preserve.
  for(let r=0;r<6;r++)for(let c=0;c<6;c++)for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]]){
   if(r+dr*4>=6||c+dc*4<0||c+dc*4>=6)continue;
   const counts=[0,0,0];for(let k=0;k<5;k++)counts[s.board[(r+k*dr)*6+c+k*dc]]++;
   if(!counts[1]||!counts[2])value+=Math.pow(3,Math.max(counts[1],counts[2]));
  }
  return who===1?value:-value;
 }
 return 0;
}
function plan(s,level='tactical',rng=Math.random){
 const legal=actions(s);if(!legal.length)return [];
 if(level==='casual')return [legal[Math.floor(rng()*legal.length)]];
 // One opponent ply: at most 1,600 nonterminal reply heuristics per decision.
 // All own moves and immediate terminal replies are checked; heuristic sampling
 // is bounded. NoGo instead uses a full one-ply mobility policy.
 const per=Math.max(1,Math.floor(1600/legal.length));let best=-Infinity,choices=[];
 for(const a of legal){
  const n=apply(s,a);let v=heuristic(n,s.turn);
  if(!n.result&&s.kind!=='nogo'){
   const replies=actions(n);let worst=Infinity;
   for(let i=0;i<replies.length;i++){
    const q=apply(n,replies[i]);
    if(q.result){worst=Math.min(worst,heuristic(q,s.turn));}
    else if(i%Math.max(1,Math.ceil(replies.length/per))===0)worst=Math.min(worst,heuristic(q,s.turn));
   }
   if(worst!==Infinity)v=worst+.001*v;
  }
  if(v>best+.000001){best=v;choices=[a];}else if(Math.abs(v-best)<.000001)choices.push(a);
 }
 return [choices[Math.floor(rng()*choices.length)]];
}
const api={KINDS,initial,neighbors,hasLine,dead,isPlacement,destinations,actions,apply,plan};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
