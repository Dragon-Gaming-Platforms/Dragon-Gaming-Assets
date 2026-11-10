/* Original rule evaluator for Dragon Gaming Platforms. MIT; see LICENSE. */
(function(root){
'use strict';
const around=(n,i)=>{const r=Math.floor(i/n),c=i%n;return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([a,b])=>a>=0&&b>=0&&a<n&&b<n).map(([a,b])=>a*n+b)};
function flood(n,s,start,accept,ids=null){const seen=new Set([start]),queue=[start];while(queue.length)for(const j of around(n,queue.pop()))if(!seen.has(j)&&(!ids||ids.has(j))&&accept(s[j],j)){seen.add(j);queue.push(j)}return seen}
function components(n,s,color,ids=null){const left=new Set(s.map((v,i)=>v===color&&(!ids||ids.has(i))?i:-1).filter(i=>i>=0)),out=[];while(left.size){const found=flood(n,s,left.values().next().value,v=>v===color,ids);out.push(found);for(const i of found)left.delete(i)}return out}
function bounding(n,ids){const rows=[...ids].map(i=>Math.floor(i/n)),cols=[...ids].map(i=>i%n),out=[];for(let r=Math.min(...rows);r<=Math.max(...rows);r++)for(let c=Math.min(...cols);c<=Math.max(...cols);c++)out.push(r*n+c);return out}
function canConnect(n,s,color,ids=null){const allowed=s.map((v,i)=>(v===color||v===-1)&&(!ids||ids.has(i))?i:-1).filter(i=>i>=0);if(!allowed.length)return false;const known=allowed.filter(i=>s[i]===color);if(!known.length)return true;const seen=flood(n,s,known[0],v=>v!==1-color,ids);return known.every(i=>seen.has(i))}
function fixed(p){const a=Array(p.n*p.n).fill(-1);if(p.kind==='cave'||p.kind==='canal-view')for(const clue of p.clues)a[clue.cell]=0;return a}
function issues(p,s){
 const n=p.n,N=n*n,k=p.kind;
 if(!Array.isArray(s)||s.length!==N||s.some(v=>v!==-1&&v!==0&&v!==1))return ['Invalid board data.'];
 const given=fixed(p);if(given.some((v,i)=>v!==-1&&v!==s[i]))return ['A fixed clue was changed.'];
 const errors=[];
 if(k==='cave'||k==='canal-view'){
  const color=k==='cave'?0:1;
  for(const clue of p.clues){let min=k==='cave'?1:0,max=min;const r=Math.floor(clue.cell/n),c=clue.cell%n;
   for(const [dr,dc]of [[-1,0],[1,0],[0,-1],[0,1]]){let certain=true;for(let t=1;t<n;t++){const rr=r+dr*t,cc=c+dc*t;if(rr<0||cc<0||rr>=n||cc>=n)break;const v=s[rr*n+cc];if(v===1-color)break;max++;if(v===-1)certain=false;if(certain)min++}}
   if(clue.value<min||clue.value>max){errors.push('A sightline clue cannot meet its visible-cell total.');break}
  }
  if(!canConnect(n,s,color))errors.push((color?'Shaded canal':'Clear cave')+' cells must form one nonempty orthogonally connected area.');
  if(k==='cave')for(const part of components(n,s,1)){
   const reach=flood(n,s,part.values().next().value,v=>v!==0);
   if(![...reach].some(i=>i<n||i>=N-n||i%n===0||i%n===n-1)){errors.push('Every shaded wall component must reach the board edge.');break}
  }
  if(k==='canal-view')outer:for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++)if([r*n+c,r*n+c+1,(r+1)*n+c,(r+1)*n+c+1].every(i=>s[i]===1)){errors.push('A solid shaded 2×2 block is not allowed.');break outer}
 }
 if(k==='chocona'){
  const regions=[];p.rooms.forEach((room,i)=>{regions[room]??=[];regions[room].push(i)});
  regions.forEach((ids,r)=>{let black=0,open=0;for(const i of ids){black+=s[i]===1;open+=s[i]===-1}if(black>p.counts[r]||black+open<p.counts[r])errors.push('Room '+(r+1)+' cannot meet its shaded-cell total.');});
  for(const part of components(n,s,1))if(bounding(n,part).some(i=>s[i]===0)){errors.push('Every shaded component must be a filled rectangle.');break}
 }

 return [...new Set(errors)];
}
function complete(p,s){return Array.isArray(s)&&s.length===p.n*p.n&&s.every(v=>v===0||v===1)&&issues(p,s).length===0}
const api={around,fixed,issues,complete,components,bounding};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PencilRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
