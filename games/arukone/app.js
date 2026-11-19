/* Arukone controller. Original code, MIT; see LICENSE. */
/* Arukone-style path puzzle: rules, controller and renderer. Original code, MIT; see LICENSE. */
window.GAME={
  slug:'arukone',
  puzzles:window.PUZZLES,
  label(p,i){return 'Puzzle '+(i+1)+' · '+p.n+'×'+p.n+' · '+p.pairs.length+' colours';},
  init(p){return {paths:p.pairs.map(()=>[])};},
  valid(p,s){
    if(!s||!Array.isArray(s.paths)||s.paths.length!==p.pairs.length)return false;
    const n2=p.n*p.n,used=new Set();
    const ends=new Map();p.pairs.forEach(([a,b],k)=>{ends.set(a,k);ends.set(b,k);});
    for(let k=0;k<s.paths.length;k++){
      const path=s.paths[k];if(!Array.isArray(path))return false;
      if(path.length&&path[0]!==p.pairs[k][0]&&path[0]!==p.pairs[k][1])return false;
      for(let i=0;i<path.length;i++){
        const c=path[i];if(!Number.isInteger(c)||c<0||c>=n2||used.has(c))return false;
        if(ends.has(c)&&ends.get(c)!==k)return false;
        if(i>0&&!adj(p.n,path[i-1],c))return false;
        used.add(c);
      }
    }
    return true;
  },
  solved(p,s){
    return s.paths.every((path,k)=>isComplete(p,k,path))&&s.paths.reduce((t,x)=>t+x.length,0)===p.n*p.n;
  },
  remaining(p,s){return p.n*p.n-s.paths.reduce((t,x)=>t+x.length,0);},
  apply(p,s,a){
    if(a.type==='set'){
      const cur=s.paths[a.k];
      if(sameArr(cur,a.path))return {render:true};
      const paths=s.paths.map((x,j)=>j===a.k?a.path.slice():x);
      return {state:{paths},counted:true};
    }
    return null;
  },
  hint(p,s){
    for(let k=0;k<p.pairs.length;k++){
      const target=p.solution[k];
      if(sameArr(s.paths[k],target))continue;
      const tset=new Set(target);
      const paths=s.paths.map((x,j)=>{
        if(j===k)return target.slice();
        const cut=x.findIndex(c=>tset.has(c));return cut<0?x.slice():x.slice(0,cut);
      });
      return {state:{paths},text:'Hint drew the path for colour '+COLOURS[k].name+' and trimmed any conflicting strokes. Hints are not refunded.'};
    }
    return null;
  },
  keys(){return null;},
  render(p,s,api){
    lastP=p;lastS=s;lastApi=api;
    const b=document.getElementById('board');
    if(!b.dataset.ready){b.dataset.ready='1';wire(b);}
    draw(p,s);
    const ctl=document.getElementById('controls');
    ctl.innerHTML='<p class="tip">Drag from one coloured dot to its partner to draw a path. Paths may not cross or share cells, and every cell must be covered. Dragging back over your own path shortens it; a stroke becomes one move when you release. Arukone is pointer or touch only in this build.</p>';
  }
};
let lastP=null,lastS=null,lastApi=null,stroke=null;
const COLOURS=[{name:'rose',hex:'#e46b6b'},{name:'orange',hex:'#e6934a'},{name:'gold',hex:'#d7b33a'},{name:'green',hex:'#5fae6a'},{name:'teal',hex:'#3aa6a6'},{name:'blue',hex:'#4f86c6'},{name:'violet',hex:'#8a6bc4'},{name:'pink',hex:'#d9719f'},{name:'brown',hex:'#9a6b4a'},{name:'slate',hex:'#6d7f8f'}];
function adj(n,a,b){const ra=Math.floor(a/n),ca=a%n,rb=Math.floor(b/n),cb=b%n;return Math.abs(ra-rb)+Math.abs(ca-cb)===1;}
function sameArr(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
function isComplete(p,k,path){return path.length>=2&&path[0]===p.pairs[k][0]&&path[path.length-1]===p.pairs[k][1];}
function ownerOf(p,s,cell){for(let k=0;k<s.paths.length;k++){const i=s.paths[k].indexOf(cell);if(i>=0)return {k,i};}return null;}
function endpointOf(p,cell){for(let k=0;k<p.pairs.length;k++){if(p.pairs[k][0]===cell)return {k,other:p.pairs[k][1]};if(p.pairs[k][1]===cell)return {k,other:p.pairs[k][0]};}return null;}
function draw(p,s){
  const n=p.n;const b=document.getElementById('board');b.innerHTML='';
  const view=s.paths.map(x=>x.slice());
  if(stroke){view[stroke.k]=stroke.path.slice();}
  const cellColor=new Map();
  view.forEach((path,k)=>path.forEach(c=>cellColor.set(c,k)));
  const grid=document.createElement('div');grid.className='grid ak-grid';grid.style.gridTemplateColumns='repeat('+n+',1fr)';
  grid.style.width='min(90vw,380px)';grid.dataset.n=String(n);
  grid.setAttribute('role','group');grid.setAttribute('aria-label','Arukone board '+n+' by '+n+'.');
  for(let i=0;i<n*n;i++){
    const d=document.createElement('div');d.className='cell ak-cell';d.dataset.i=String(i);
    const k=cellColor.get(i);
    const ep=endpointOf(p,i);
    if(k!==undefined){d.style.background=hexFor(k,true);d.classList.add('painted');}
    if(ep){d.classList.add('end');d.innerHTML='<span class="dot" style="background:'+hexFor(ep.k,false)+'"></span>';
      d.setAttribute('aria-label','Endpoint for colour '+COLOURS[ep.k].name);}
    else d.setAttribute('aria-label',k!==undefined?'Path '+COLOURS[k].name:'Empty cell');
    grid.appendChild(d);
  }
  b.appendChild(grid);
}
function hexFor(k,path){const c=COLOURS[k%COLOURS.length].hex;return path?c+'cc':c;}
function cellAt(e){const el=document.elementFromPoint(e.clientX,e.clientY);const c=el&&el.closest&&el.closest('.ak-cell');return c?+c.dataset.i:null;}
function wire(board){
  board.addEventListener('pointerdown',e=>{
    const c=cellAt(e);if(c===null||!lastP)return;
    const ep=endpointOf(lastP,c);if(!ep)return;
    e.preventDefault();
    stroke={k:ep.k,other:ep.other,path:[c]};
    board.setPointerCapture&&board.setPointerCapture(e.pointerId);
    draw(lastP,lastS);
  });
  board.addEventListener('pointermove',e=>{
    if(!stroke)return;
    const c=cellAt(e);if(c===null)return;
    const last=stroke.path[stroke.path.length-1];
    if(c===last)return;
    if(!adj(lastP.n,last,c))return;
    const pt=stroke.path;
    if(pt.length>=2&&pt[pt.length-2]===c){pt.pop();draw(lastP,lastS);return;}
    if(pt.includes(c))return;
    if(isEndpointOther(c))return;
    const own=ownerOf(lastP,lastS,c);
    if(own&&own.k!==stroke.k)return;
    if(pt.length>0&&(pt[pt.length-1]===stroke.other))return;
    pt.push(c);
    draw(lastP,lastS);
  });
  const end=()=>{
    if(!stroke)return;
    const s=stroke;stroke=null;
    lastApi.act({type:'set',k:s.k,path:s.path.slice()});
  };
  board.addEventListener('pointerup',end);
  board.addEventListener('pointercancel',end);
}
function isEndpointOther(c){return lastP&&lastP.pairs.some(([a,b],k)=>(a===c||b===c)&&!(stroke&&stroke.k===k));}

/* Shared puzzle runtime for this game folder. Original code, MIT; see LICENSE. */
(function(){
'use strict';
const cfg=window.GAME,P=cfg.puzzles,KEY='dragon-gaming.'+cfg.slug+'.v1';
const $=s=>document.querySelector(s);
let idx=0,st=null,past=[],future=[],moves=0,hints=0,won=false,solved=new Set(),best={},storageOK=true;
let startedAt=Date.now(),tickBase=0;
function elapsed(){return tickBase+Math.floor((Date.now()-startedAt)/1000);}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function setMsg(t){$('#message').textContent=t||'';}
function load(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!v||v.v!==1)return;
    if(Array.isArray(v.solved))solved=new Set(v.solved.filter(x=>P.some(p=>p.id===x)));
    if(v.best&&typeof v.best==='object')for(const p of P){const b=v.best[p.id];if(b&&Number.isSafeInteger(b.secs)&&b.secs>=0&&Number.isSafeInteger(b.moves)&&Number.isSafeInteger(b.hints))best[p.id]={secs:b.secs,moves:b.moves,hints:b.hints};}
    if(Number.isInteger(v.idx)&&v.idx>=0&&v.idx<P.length)idx=v.idx;
    const c=v.cur;
    if(c&&c.id===P[idx].id&&cfg.valid(P[idx],c.st)){
      st=c.st;past=(c.past||[]).filter(s=>cfg.valid(P[idx],s)).slice(-200);future=(c.future||[]).filter(s=>cfg.valid(P[idx],s)).slice(-200);
      moves=Number.isSafeInteger(c.moves)?c.moves:0;hints=Number.isSafeInteger(c.hints)?c.hints:0;tickBase=Number.isSafeInteger(c.secs)?c.secs:0;
    }
  }catch(e){storageOK=false;}
}
function save(){
  if(!storageOK)return;
  try{localStorage.setItem(KEY,JSON.stringify({v:1,idx,solved:[...solved],best,cur:{id:P[idx].id,st,past:past.slice(-200),future:future.slice(-200),moves,hints,secs:elapsed()}}));}
  catch(e){storageOK=false;setMsg('Progress cannot be saved in this browser; the puzzle still works.');}
}
function fresh(){st=cfg.init(P[idx]);past=[];future=[];moves=0;hints=0;tickBase=0;startedAt=Date.now();won=false;$('#win').hidden=true;}
function checkWin(){
  if(!won&&cfg.solved(P[idx],st)){
    won=true;solved.add(P[idx].id);const s=elapsed();
    const b=best[P[idx].id];
    if(!b||s<b.secs||(s===b.secs&&moves<b.moves))best[P[idx].id]={secs:s,moves,hints};
    $('#win-title').textContent='Puzzle solved';
    $('#win-detail').textContent='Time '+fmt(s)+' · Moves '+moves+' · Hints used '+hints+(hints?' (assisted, not refunded)':'')+'. Press Next puzzle to continue.';
    $('#win').hidden=false;setMsg('Solved.');
  }
}
function commit(next,counted){
  if(!next||next===st)return;
  past.push(st);if(past.length>200)past.shift();future=[];st=next;if(counted)moves++;
  checkWin();afterChange();
}
const api={
  act(a){
    if(won)return;
    const r=cfg.apply(P[idx],st,a);
    if(!r)return;
    if(r.msg)setMsg(r.msg);
    if(r.state&&r.state!==st)commit(r.state,r.counted!==false);
    else if(r.render)afterChange();
  },
  setMsg,
  get state(){return st;}
};
function undo(){if(!past.length)return;future.push(st);st=past.pop();won=false;$('#win').hidden=true;afterChange();}
function redo(){if(!future.length)return;past.push(st);st=future.pop();won=false;$('#win').hidden=true;afterChange();}
function hint(){
  if(won)return;
  const h=cfg.hint(P[idx],st);
  if(!h){setMsg('No hint is available from this position.');return;}
  past.push(st);future=[];st=h.state;hints++;setMsg(h.text);checkWin();afterChange();
}
function go(i){idx=(i%P.length+P.length)%P.length;fresh();$('#level').value=String(idx);afterChange();}
function afterChange(){
  $('#time').textContent=fmt(elapsed());
  $('#moves').textContent=String(moves);
  $('#hints').textContent=String(hints);
  $('#solved').textContent=solved.size+' / '+P.length+' solved';
  const rem=cfg.remaining?cfg.remaining(P[idx],st):null;
  $('#remaining').textContent=rem===null||rem===undefined?'—':String(rem);
  $('#undo').disabled=!past.length;$('#redo').disabled=!future.length;
  const b=best[P[idx].id];
  $('#record').textContent=b?'Best: '+fmt(b.secs)+' · '+b.moves+' moves · '+b.hints+' hints':'No completed record yet.';
  $('#level').value=String(idx);
  cfg.render(P[idx],st,api);
  save();
}
function build(){
  const sel=$('#level');sel.innerHTML='';
  P.forEach((p,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=cfg.label(p,i);sel.appendChild(o);});
  sel.onchange=()=>go(+sel.value);
  $('#undo').onclick=undo;$('#redo').onclick=redo;$('#hint').onclick=hint;
  $('#restart').onclick=()=>{fresh();afterChange();setMsg('Restarted this puzzle.');};
  $('#prev').onclick=()=>go(idx-1);$('#next').onclick=()=>go(idx+1);
  $('#daily').onclick=()=>go(Math.floor(Date.now()/86400000)%P.length);
  $('#clear-progress').onclick=()=>{
    if(!confirm('Clear saved progress and records in this browser?'))return;
    try{localStorage.removeItem(KEY);}catch(e){}
    solved=new Set();best={};idx=0;fresh();afterChange();setMsg('Local progress cleared.');
  };
  $('#rules-open').onclick=()=>$('#rules').showModal();
  $('#rules-close').onclick=()=>$('#rules').close();
  document.addEventListener('keydown',e=>{
    if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
    if((e.ctrlKey||e.metaKey)&&!e.altKey){
      const k=e.key.toLowerCase();
      if(k==='z'&&!e.shiftKey){e.preventDefault();undo();return;}
      if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();redo();return;}
    }
    if(cfg.keys&&!won){const a=cfg.keys(e,P[idx],st);if(a){e.preventDefault();api.act(a);}}
  });
  setInterval(()=>{if(!won){$('#time').textContent=fmt(elapsed());save();}},1000);
}
load();
if(!st)fresh();
build();
checkWin();
afterChange();
if(!storageOK)setMsg('Storage is unavailable; progress will not persist.');
window.PuzzleApp={snapshot:()=>({id:P[idx].id,state:st,moves,hints,solved:[...solved],won})};
})();
