/* Samurai Sudoku controller. Original code, MIT; see LICENSE. */
/* Samurai Sudoku rules, controller and renderer. Original code, MIT; see LICENSE. */
window.GAME={
  slug:'samurai-sudoku',
  puzzles:window.PUZZLES,
  label(p,i){return 'Puzzle '+(i+1)+' · '+p.tier+' · '+p.clues+' clues';},
  init(p){return {g:p.givens.slice()};},
  valid(p,s){
    if(!s||!Array.isArray(s.g)||s.g.length!==W*W)return false;
    return s.g.every((v,i)=>{
      if(p.givens[i]===-1)return v===-1;
      if(!Number.isInteger(v)||v<0||v>9)return false;
      return !p.givens[i]||v===p.givens[i];
    });
  },
  solved(p,s){return s.g.every((v,i)=>p.givens[i]===-1||v>0)&&conflicts(s.g).size===0;},
  remaining(p,s){return s.g.filter((v,i)=>p.givens[i]!==-1&&!v).length;},
  apply(p,s,a){
    if(a.type==='select'){sel=a.i;return {render:true};}
    if(a.type==='set'){
      const i=a.i;
      if(!Number.isInteger(i)||i<0||p.givens[i]===-1)return {msg:'Select a cell of the grid first.'};
      if(p.givens[i])return {msg:'Fixed clues cannot be changed.'};
      if(s.g[i]===a.v)return {render:true};
      const g=s.g.slice();g[i]=a.v;
      return {state:{g},counted:true};
    }
    return null;
  },
  hint(p,s){
    for(let i=0;i<W*W;i++){
      if(p.givens[i]===-1||s.g[i]===p.solution[i])continue;
      const g=s.g.slice();g[i]=p.solution[i];sel=i;
      return {state:{g},text:'Hint revealed row '+(Math.floor(i/W)+1)+', column '+(i%W+1)+'. Hints are not refunded.'};
    }
    return null;
  },
  keys(e,p,s){
    if(e.key==='Escape'){sel=-1;return {type:'select',i:-1};}
    if(/^[1-9]$/.test(e.key)&&sel>=0)return {type:'set',i:sel,v:+e.key};
    if((e.key==='0'||e.key==='Backspace'||e.key==='Delete')&&sel>=0)return {type:'set',i:sel,v:0};
    const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];
    if(!d)return null;
    let r=sel>=0?Math.floor(sel/W):0,c=sel>=0?sel%W:0;
    // step until a playable cell is reached (or stay put at the edge)
    for(let k=0;k<W;k++){
      const nr=r+d[0],nc=c+d[1];
      if(nr<0||nc<0||nr>=W||nc>=W)break;
      r=nr;c=nc;
      if(p.givens[r*W+c]!==-1)break;
    }
    sel=r*W+c;return {type:'select',i:sel};
  },
  render(p,s,api){
    const b=document.getElementById('board');b.innerHTML='';
    const bad=conflicts(s.g);
    const grid=document.createElement('div');grid.className='grid ss-grid';grid.style.gridTemplateColumns='repeat('+W+',1fr)';
    grid.style.width='min(94vw,470px)';
    grid.setAttribute('role','grid');grid.setAttribute('aria-label','Samurai Sudoku, five overlapping 9 by 9 grids.');
    for(let i=0;i<W*W;i++){
      const d=document.createElement('button');d.type='button';
      if(p.givens[i]===-1){d.className='ss-hole';d.tabIndex=-1;d.disabled=true;grid.appendChild(d);continue;}
      d.className='cell ss-cell'+(p.givens[i]?' fixed':'')+(i===sel?' sel':'')+(bad.has(i)?' bad':'');
      d.textContent=s.g[i]>0?String(s.g[i]):'';
      const r=Math.floor(i/W),c=i%W;
      d.setAttribute('aria-label','Row '+(r+1)+' column '+(c+1)+': '+(s.g[i]>0?s.g[i]:'empty')+(p.givens[i]?' fixed':'')+(bad.has(i)?', conflicts':''));
      d.onclick=()=>api.act({type:'select',i});
      grid.appendChild(d);
    }
    b.appendChild(grid);
    const ctl=document.getElementById('controls');ctl.innerHTML='';
    const pad=document.createElement('div');pad.className='keypad';pad.setAttribute('role','group');pad.setAttribute('aria-label','Number entry');
    for(let v=1;v<=9;v++){const bt=document.createElement('button');bt.type='button';bt.textContent=String(v);bt.onclick=()=>api.act({type:'set',i:sel,v});pad.appendChild(bt);}
    const er=document.createElement('button');er.type='button';er.textContent='Erase';er.onclick=()=>api.act({type:'set',i:sel,v:0});pad.appendChild(er);
    ctl.appendChild(pad);
    const tip=document.createElement('p');tip.className='tip';
    tip.textContent='Five 9×9 grids overlap at their corners. Every row, column and 3×3 box of each grid, within that grid, must hold 1–9 once. Fixed bold digits cannot change. Red cells conflict with another entry. Keys 1–9 enter a digit, 0 erases, and arrows move between cells.';
    ctl.appendChild(tip);
  }
};
const W=21;
let sel=-1;
const ORIGINS=[[0,0],[0,12],[12,0],[12,12],[6,6]];
const UNITS=[];
for(const[r0,c0]of ORIGINS){
  for(let r=0;r<9;r++)UNITS.push([...Array(9)].map((_,c)=>(r0+r)*W+c0+c));
  for(let c=0;c<9;c++)UNITS.push([...Array(9)].map((_,r)=>(r0+r)*W+c0+c));
  for(let br=0;br<3;br++)for(let bc=0;bc<3;bc++)UNITS.push([...Array(9)].map((_,k)=>(r0+br*3+Math.floor(k/3))*W+c0+bc*3+k%3));
}
function conflicts(g){
  const bad=new Set();
  for(const u of UNITS){
    const m=new Map();
    for(const i of u){const v=g[i];if(!(v>0))continue;if(!m.has(v))m.set(v,[]);m.get(v).push(i);}
    for(const arr of m.values())if(arr.length>1)arr.forEach(i=>bad.add(i));
  }
  return bad;
}

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
