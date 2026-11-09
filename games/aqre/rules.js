/* Original implementation for Dragon Gaming Platforms. MIT; see LICENSE. */
(function(root){
'use strict';
const around=(n,i)=>{const r=Math.floor(i/n),c=i%n;return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([r,c])=>r>=0&&c>=0&&r<n&&c<n).map(([r,c])=>r*n+c)};
const ring=(n,i)=>{const r=Math.floor(i/n),c=i%n;return [[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]].map(([dr,dc])=>r+dr>=0&&c+dc>=0&&r+dr<n&&c+dc<n?(r+dr)*n+c+dc:-1)};
function runs(a){if(a.every(Boolean))return [8];if(!a.some(Boolean))return [0];const start=a.indexOf(0),out=[];let run=0;for(let k=1;k<=8;k++){if(a[(start+k)%8])run++;else if(run){out.push(run);run=0}}return out.sort((a,b)=>a-b)}
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
function connectedPossible(n,s,color){const fixed=s.map((v,i)=>v===color?i:-1).filter(i=>i>=0),allowed=s.map((v,i)=>v===color||v===-1?i:-1).filter(i=>i>=0);if(!allowed.length)return false;if(!fixed.length)return true;const seen=new Set([fixed[0]]),q=[fixed[0]];while(q.length){for(const j of around(n,q.pop()))if(s[j]!==1-color&&!seen.has(j)){seen.add(j);q.push(j)}}return fixed.every(i=>seen.has(i))}
const cache=new WeakMap();
function prepare(p){if(cache.has(p))return cache.get(p);const n=p.n,regions=[];if(p.rooms)for(let i=0;i<n*n;i++){regions[p.rooms[i]]??=[];regions[p.rooms[i]].push(i)}
const clues=(p.clues||[]).map(clue=>{
 if(p.kind==='creek'){const {r,c}=clue;return {...clue,ids:[[r-1,c-1],[r-1,c],[r,c-1],[r,c]].filter(([r,c])=>r>=0&&c>=0&&r<n&&c<n).map(([r,c])=>r*n+c)}}
 const ids=ring(n,clue.cell),patterns=[];for(let m=0;m<256;m++){const a=ids.map((i,k)=>i<0?0:(m>>k)&1);if(ids.some((i,k)=>i<0&&((m>>k)&1)))continue;if(same(runs(a),clue.groups))patterns.push(a)}return {...clue,ids,patterns};
});const info={regions,clues};cache.set(p,info);return info}
function fixed(p){const a=Array(p.n*p.n).fill(-1);if(p.kind==='yin-yang')for(const [i,v]of Object.entries(p.givens))a[Number(i)]=v;if(p.kind==='tapa')for(const clue of p.clues)a[clue.cell]=0;return a}
function issues(p,s){
 const n=p.n,N=n*n;if(!Array.isArray(s)||s.length!==N||s.some(v=>![-1,0,1].includes(v)))return ['Invalid board data.'];
 const errors=[],info=prepare(p),given=fixed(p);for(let i=0;i<N;i++)if(given[i]!==-1&&s[i]!==given[i])return ['A fixed clue was changed.'];
 const count=(ids,want,label)=>{let yes=0,open=0;for(const i of ids){yes+=s[i]===1;open+=s[i]===-1}if(yes>want||yes+open<want)errors.push(label+' cannot meet its total.');};
 if(p.kind==='aquarium'){
  p.rows.forEach((v,r)=>count(Array.from({length:n},(_,c)=>r*n+c),v,'Row '+(r+1)));
  p.cols.forEach((v,c)=>count(Array.from({length:n},(_,r)=>r*n+c),v,'Column '+(c+1)));
  for(const ids of info.regions){let lowClear=-1,highWater=n;for(const i of ids){if(s[i]===0)lowClear=Math.max(lowClear,Math.floor(i/n));if(s[i]===1)highWater=Math.min(highWater,Math.floor(i/n))}if(lowClear>=highWater){errors.push('Water must be level within each room and fill from the bottom.');break}}
 }
 if(p.kind==='aqre'){
  info.regions.forEach((ids,k)=>count(ids,p.counts[k],'Room '+(k+1)));
  outer:for(const [dr,dc]of [[0,1],[1,0]])for(let r=0;r<n-3*dr;r++)for(let c=0;c<n-3*dc;c++){const a=Array.from({length:4},(_,k)=>s[(r+dr*k)*n+c+dc*k]);if(a[0]!==-1&&a.every(v=>v===a[0])){errors.push('Four cells of one color cannot form a straight run.');break outer}}
 }
 if(p.kind==='creek')for(const clue of info.clues)count(clue.ids,clue.value,'Junction '+(clue.r+1)+','+(clue.c+1));
 if(p.kind==='tapa')for(const clue of info.clues){if(!clue.patterns.some(a=>clue.ids.every((i,k)=>i<0||s[i]===-1||s[i]===a[k]))){errors.push('A Tapa clue cannot match its surrounding runs.');break}}
 if(p.kind==='tapa'||p.kind==='yin-yang'){
  outer:for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const a=[s[r*n+c],s[r*n+c+1],s[(r+1)*n+c],s[(r+1)*n+c+1]];if(a.every(v=>v===1)||(p.kind==='yin-yang'&&a.every(v=>v===0))){errors.push('A solid 2×2 block is not allowed.');break outer}}
 }
 const colors=p.kind==='yin-yang'?[0,1]:p.kind==='creek'?[0]:p.kind==='aqre'||p.kind==='tapa'?[1]:[];
 for(const color of colors)if(!connectedPossible(n,s,color))errors.push((color?'Shaded':'Clear')+' cells must form one nonempty orthogonally connected group.');
 return [...new Set(errors)];
}
function complete(p,s){return Array.isArray(s)&&s.length===p.n*p.n&&s.every(v=>v===0||v===1)&&issues(p,s).length===0}
const api={around,ring,runs,fixed,issues,complete};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PencilRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
