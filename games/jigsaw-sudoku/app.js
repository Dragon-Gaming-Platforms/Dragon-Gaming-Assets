/* Jigsaw Sudoku controller. Original code, MIT; see LICENSE. */
/* Jigsaw Sudoku rules, controller and renderer. Original code, MIT; see LICENSE. */
window.GAME={
  slug:'jigsaw-sudoku',
  puzzles:window.PUZZLES,
  label(p,i){return 'Puzzle '+(i+1)+' · '+p.tier+' · '+p.givens.filter(x=>x).length+' givens';},
  init(p){return {g:p.givens.slice()};},
  valid(p,s){
    if(!s||!Array.isArray(s.g)||s.g.length!==81)return false;
    return s.g.every((v,i)=>Number.isInteger(v)&&v>=0&&v<=9&&(!p.givens[i]||v===p.givens[i]));
  },
  solved(p,s){return s.g.every(v=>v>0)&&conflicts(p,s.g).size===0;},
  remaining(p,s){return s.g.filter(v=>!v).length;},
  apply(p,s,a){
    if(a.type==='select'){sel=a.i;return {render:true};}
    if(a.type==='set'){
      const i=a.i;
      if(!Number.isInteger(i)||i<0||i>80)return {msg:'Select a cell first.'};
      if(p.givens[i])return {msg:'Fixed clues cannot be changed.'};
      if(s.g[i]===a.v)return {render:true};
      const g=s.g.slice();g[i]=a.v;
      return {state:{g},counted:true};
    }
    return null;
  },
  hint(p,s){
    for(let i=0;i<81;i++){if(s.g[i]!==p.solution[i]){const g=s.g.slice();g[i]=p.solution[i];
      sel=i;return {state:{g},text:'Hint revealed row '+(Math.floor(i/9)+1)+', column '+(i%9+1)+'. Hints are not refunded.'};}}
    return null;
  },
  keys(e,p,s){
    if(e.key==='Escape'){sel=-1;return {type:'select',i:-1};}
    if(/^[1-9]$/.test(e.key)&&sel>=0)return {type:'set',i:sel,v:+e.key};
    if((e.key==='0'||e.key==='Backspace'||e.key==='Delete')&&sel>=0)return {type:'set',i:sel,v:0};
    if(sel<0&&e.key.startsWith('Arrow')){sel=40;return {type:'select',i:sel};}
    let r=sel>=0?Math.floor(sel/9):0,c=sel>=0?sel%9:0;
    if(e.key==='ArrowUp')r=Math.max(0,r-1);else if(e.key==='ArrowDown')r=Math.min(8,r+1);
    else if(e.key==='ArrowLeft')c=Math.max(0,c-1);else if(e.key==='ArrowRight')c=Math.min(8,c+1);
    else return null;
    sel=r*9+c;return {type:'select',i:sel};
  },
  render(p,s,api){
    const b=document.getElementById('board');b.innerHTML='';
    const bad=conflicts(p,s.g);
    const grid=document.createElement('div');grid.className='grid js-grid';grid.style.gridTemplateColumns='repeat(9,1fr)';
    grid.style.width='min(92vw,420px)';
    grid.setAttribute('role','grid');grid.setAttribute('aria-label','Jigsaw Sudoku, 9 by 9. Thick lines mark irregular regions.');
    for(let i=0;i<81;i++){
      const d=document.createElement('button');d.type='button';
      d.className='cell js-cell'+(p.givens[i]?' fixed':'')+(i===sel?' sel':'')+(bad.has(i)?' bad':'');
      d.style.background=REGION_COLOURS[p.regions[i]];
      const r=Math.floor(i/9),c=i%9;
      if(c<8&&p.regions[i]!==p.regions[i+1])d.classList.add('edge-r');
      if(r<8&&p.regions[i]!==p.regions[i+9])d.classList.add('edge-b');
      d.textContent=s.g[i]?String(s.g[i]):'';
      d.setAttribute('aria-label','Row '+(r+1)+' column '+(c+1)+': '+(s.g[i]?s.g[i]:'empty')+(p.givens[i]?' fixed':'')+(bad.has(i)?', conflicts':''));
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
    tip.textContent='Each row, column and outlined region must contain 1–9 once. Bold digits are fixed clues; other cells are open. Red cells conflict with another entry. Keys 1–9 enter a digit, 0 or Delete erases, and arrows move the selection.';
    ctl.appendChild(tip);
  }
};
let sel=-1;
const REGION_COLOURS=['#f7e7c4','#d7ebf6','#e2f2dc','#f2dcec','#e6e1f7','#fbe3d6','#d8f0ee','#f1f0c9','#e8e8e8'];
function conflicts(p,g){
  const bad=new Set();
  const check=cells=>{const m=new Map();for(const i of cells){const v=g[i];if(!v)continue;if(!m.has(v))m.set(v,[]);m.get(v).push(i);}
    for(const arr of m.values())if(arr.length>1)arr.forEach(i=>bad.add(i));};
  for(let r=0;r<9;r++)check([...Array(9)].map((_,c)=>r*9+c));
  for(let c=0;c<9;c++)check([...Array(9)].map((_,r)=>r*9+c));
  for(let k=0;k<9;k++)check([...Array(81).keys()].filter(i=>p.regions[i]===k));
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
