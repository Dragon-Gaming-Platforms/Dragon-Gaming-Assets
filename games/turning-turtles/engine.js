/* Original rules and exact normal-play solvers. MIT; see LICENSE. */
(function(root){
'use strict';
const KINDS=['wythoffs-game','grundys-game','silver-dollar','turning-turtles','toads-and-frogs'];
const STARTS={
 'wythoffs-game':[[7,11],[13,21],[18,29]],
 'grundys-game':[[9],[15],[25,17]],
 'silver-dollar':[[14,1,4,8,12],[18,2,5,8,12,16],[20,1,4,7,11,15,18]],
 'turning-turtles':[[1,0,1,1,0,1,0,1],[0,1,0,1,1,0,1,0,1,1],[1,0,1,0,1,1,0,0,1,0,1,1]],
 'toads-and-frogs':[[1,1,0,0,0,2,2],[1,1,1,0,0,0,2,2,2],[1,1,1,1,0,0,0,2,2,2,2]]
};
function initial(kind,setup=1){
 if(!KINDS.includes(kind)||!Number.isInteger(setup)||setup<0||setup>2)throw Error('Unknown game or setup');
 let board=STARTS[kind][setup].slice();
 if(kind==='silver-dollar'){const [n,...coins]=board;board=Array(n).fill(0);for(const i of coins)board[i]=1;}
 return {kind,setup,board,turn:1,ply:0,result:null};
}
function actions(s){
 if(s.result)return [];
 const b=s.board,out=[];
 if(s.kind==='wythoffs-game'){
  for(let from=0;from<3;from++)for(let to=1;to<=(from===2?Math.min(...b):b[from]);to++)out.push({from,to});
 }else if(s.kind==='grundys-game'){
  for(let from=0;from<b.length;from++)for(let to=1;to<b[from]-to;to++)out.push({from,to});
 }else if(s.kind==='silver-dollar'){
  for(let from=0;from<b.length;from++)if(b[from])for(let to=from-1;to>=0&&!b[to];to--)out.push({from,to});
 }else if(s.kind==='turning-turtles'){
  for(let from=0;from<b.length;from++)if(b[from]){out.push({from,to:-1});for(let to=0;to<from;to++)out.push({from,to});}
 }else{
  const d=s.turn===1?1:-1;
  for(let from=0;from<b.length;from++)if(b[from]===s.turn){
   const step=from+d,jump=from+2*d;
   if(step>=0&&step<b.length&&b[step]===0)out.push({from,to:step});
   else if(jump>=0&&jump<b.length&&b[step]===3-s.turn&&b[jump]===0)out.push({from,to:jump});
  }
 }
 return out;
}
// Assumes a legal action. Kept internal so untrusted saved replays must use apply.
function next(s,a){
 const b=s.board.slice();
 if(s.kind==='wythoffs-game'){if(a.from===2){b[0]-=a.to;b[1]-=a.to;}else b[a.from]-=a.to;}
 else if(s.kind==='grundys-game')b.splice(a.from,1,a.to,b[a.from]-a.to);
 else if(s.kind==='silver-dollar'||s.kind==='toads-and-frogs'){b[a.to]=b[a.from];b[a.from]=0;}
 else{b[a.from]=0;if(a.to>=0)b[a.to]=1-b[a.to];}
 return {...s,board:b,turn:3-s.turn,ply:s.ply+1};
}
function apply(s,a){
 if(!a||!Number.isInteger(a.from)||!Number.isInteger(a.to)||!actions(s).some(v=>v.from===a.from&&v.to===a.to))return null;
 const t=next(s,a);
 if(!actions(t).length)t.result={winner:s.turn,reason:s.kind==='toads-and-frogs'?'The opponent has no legal forward step or jump.':'No legal move remains. The last player to move wins.'};
 return t;
}
const grundy=[0,0,0];
function splitValue(n){
 for(let k=grundy.length;k<=n;k++){
  const seen=new Set();for(let a=1;a<k-a;a++)seen.add(grundy[a]^grundy[k-a]);
  let value=0;while(seen.has(value))value++;grundy[k]=value;
 }
 return grundy[n];
}
const wythoffMemo=new Map(),toadMemo=new Map();
function winning(s){
 if(s.result)return false;
 if(s.kind==='grundys-game')return s.board.reduce((v,n)=>v^splitValue(n),0)!==0;
 if(s.kind==='turning-turtles')return s.board.reduce((v,n,i)=>n?v^(i+1):v,0)!==0;
 if(s.kind==='silver-dollar'){
  const p=[];s.board.forEach((v,i)=>{if(v)p.push(i);});let value=0;
  for(let i=p.length-1;i>=0;i-=2)value^=i===0?p[0]:p[i]-p[i-1]-1;
  return value!==0;
 }
 const memo=s.kind==='wythoffs-game'?wythoffMemo:toadMemo;
 const key=s.kind==='wythoffs-game'?s.board.slice().sort((a,b)=>a-b).join(','):s.turn+':'+s.board.join('');
 if(memo.has(key))return memo.get(key);
 const win=actions(s).some(a=>!winning(next(s,a)));memo.set(key,win);return win;
}
function plan(s,level='perfect',rng=Math.random){
 const legal=actions(s);if(!legal.length)return [];
 if(level==='casual')return [legal[Math.floor(rng()*legal.length)]];
 const wins=legal.filter(a=>!winning(next(s,a))),choices=wins.length?wins:legal;
 return [choices[Math.floor(rng()*choices.length)]];
}
function describe(s,a){
 if(s.kind==='wythoffs-game')return 'Remove '+a.to+(a.from===2?' from EACH heap':' from heap '+(a.from+1));
 if(s.kind==='grundys-game')return 'Split heap '+(a.from+1)+' ('+s.board[a.from]+') into '+a.to+' + '+(s.board[a.from]-a.to);
 if(s.kind==='turning-turtles')return 'Flip head '+(a.from+1)+(a.to<0?' only':' AND coin '+(a.to+1));
 return 'Move '+(s.kind==='silver-dollar'?'coin':s.turn===1?'toad':'frog')+' '+(a.from+1)+' → '+(a.to+1);
}
const api={KINDS,initial,actions,apply,winning,plan,describe};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
