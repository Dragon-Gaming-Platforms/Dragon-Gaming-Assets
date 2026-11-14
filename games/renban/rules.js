/* Original rule checker. MIT; see LICENSE. */
(function(root){
'use strict';
function neighbors(p,i){const r=Math.floor(i/p.n),c=i%p.n;return [i-p.n,i+p.n,i-1,i+1].filter(j=>j>=0&&j<p.n*p.n&&Math.abs(Math.floor(j/p.n)-r)+Math.abs(j%p.n-c)===1);}
function rooms(p){if(!p.rooms)return [];const out=[];p.rooms.forEach((id,i)=>{if(id>=0)(out[id]??=[]).push(i);});return out;}
function max(p){return p.kind==='nondango'?1:p.kind==='sukoro'?4:p.kind==='renban'?p.n:Math.max(...rooms(p).map(g=>g.length));}
function fixed(p){const v=p.givens?p.givens.slice():Array(p.n*p.n).fill(-1);for(let i=0;i<v.length;i++)if(p.kind==='nondango'&&!p.circles[i]||p.kind==='makaro'&&p.rooms[i]<0)v[i]=0;return v;}
function allowed(p,v){return Number.isInteger(v)&&v>=-1&&v<=max(p);}
function connectPossible(p,cells){
 const starts=cells.flatMap((v,i)=>v>0?[i]:[]);if(!starts.length)return true;
 const seen=new Set([starts[0]]),stack=[starts[0]];
 while(stack.length)for(const j of neighbors(p,stack.pop()))if(cells[j]!==0&&!seen.has(j)){seen.add(j);stack.push(j);}
 return starts.every(i=>seen.has(i));
}
function issues(p,cells){
 const out=[],n=p.n,N=n*n;if(!Array.isArray(cells)||cells.length!==N||cells.some(v=>!allowed(p,v)))return ['Invalid cell data.'];
 const f=fixed(p);if(f.some((v,i)=>v!==-1&&v!==cells[i]))return ['A fixed clue or blocked cell was changed.'];
 const groups=rooms(p),duplicate=ids=>{const v=ids.map(i=>cells[i]).filter(x=>x>0);return new Set(v).size!==v.length;};
 if(p.kind==='nondango'){
  groups.forEach((g,k)=>{const black=g.filter(i=>cells[i]===1).length,unknown=g.some(i=>p.circles[i]&&cells[i]===-1);if(black>1||!unknown&&black!==1)out.push('Room '+(k+1)+' must contain exactly one black circle.');});
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)for(const [dr,dc]of [[0,1],[1,0],[1,1],[1,-1]])if(r+2*dr<n&&c+2*dc>=0&&c+2*dc<n){const ids=[0,1,2].map(k=>(r+dr*k)*n+c+dc*k);if(ids.every(i=>p.circles[i]&&cells[i]!==-1)&&ids.every(i=>cells[i]===cells[ids[0]]))out.push('Three consecutive circles cannot all have the same color.');}
 }else if(p.kind==='renban'){
  if(cells.some(v=>v===0))out.push('Every Renban cell needs a digit from 1 to '+n+'.');
  for(let r=0;r<n;r++)if(duplicate(Array.from({length:n},(_,c)=>r*n+c)))out.push('A row repeats a digit.');
  for(let c=0;c<n;c++)if(duplicate(Array.from({length:n},(_,r)=>r*n+c)))out.push('A column repeats a digit.');
  groups.forEach((g,k)=>{const known=g.map(i=>cells[i]).filter(v=>v>0);if(duplicate(g))out.push('Room '+(k+1)+' repeats a digit.');if(known.length&&Math.max(...known)-Math.min(...known)>=g.length)out.push('Room '+(k+1)+' cannot form consecutive digits.');});
 }else if(p.kind==='makaro'){
  groups.forEach((g,k)=>{if(g.some(i=>cells[i]===0||cells[i]>g.length))out.push('Room '+(k+1)+' uses exactly 1 through '+g.length+'.');if(duplicate(g))out.push('Room '+(k+1)+' repeats a digit.');});
  for(let i=0;i<N;i++)if(cells[i]>0)for(const j of neighbors(p,i))if(j>i&&cells[j]===cells[i])out.push('Equal numbers cannot share an edge.');
  for(const a of p.arrows)if(cells[a.to]>0&&neighbors(p,a.cell).some(j=>j!==a.to&&p.rooms[j]>=0&&cells[j]>0&&cells[j]>=cells[a.to]))out.push('An arrow must point to a strictly larger number than every other neighboring number.');
 }else{
  if(p.kind==='sukoro'){
   for(let i=0;i<N;i++)if(cells[i]>0){const ns=neighbors(p,i),lo=ns.filter(j=>cells[j]>0).length,hi=lo+ns.filter(j=>cells[j]===-1).length;if(cells[i]<lo||cells[i]>hi)out.push('At row '+(Math.floor(i/n)+1)+', column '+(i%n+1)+', the number must equal its numbered edge-neighbors.');}
  }else{
   groups.forEach((g,k)=>{const values=g.map(i=>cells[i]).filter(v=>v>0),unknown=g.filter(i=>cells[i]===-1).length;if(!values.length&&!unknown)out.push('Room '+(k+1)+' needs at least one number.');if(new Set(values).size>1)out.push('All numbers in room '+(k+1)+' must match.');if(values.length&&(values[0]<values.length||values[0]>values.length+unknown))out.push('The number in room '+(k+1)+' must equal its count of numbered cells.');});
   for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++)if([r*n+c,r*n+c+1,(r+1)*n+c,(r+1)*n+c+1].every(i=>cells[i]>0))out.push('A 2×2 block cannot be entirely numbered.');
  }
  for(let i=0;i<N;i++)if(cells[i]>0)for(const j of neighbors(p,i))if(j>i&&cells[j]===cells[i]&&(p.kind==='sukoro'||p.rooms[i]!==p.rooms[j]))out.push('Equal numbers cannot share an edge'+(p.kind==='nanro'?' across a room border.':'.'));
  if(!connectPossible(p,cells))out.push('Numbered cells are separated by confirmed empty cells.');
  if(!cells.includes(-1)&&!cells.some(v=>v>0))out.push('The puzzle needs a connected group of numbers.');
 }
 return [...new Set(out)];
}
function complete(p,cells){return Array.isArray(cells)&&!cells.includes(-1)&&issues(p,cells).length===0;}
const api={neighbors,rooms,max,fixed,allowed,issues,complete};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PencilRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
