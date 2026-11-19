/* Exit Jam controller. Original code, MIT; see LICENSE. */
/* Exit Jam rules, controller and renderer. Original code, MIT; see LICENSE. */
window.GAME={
  slug:'exit-jam',
  puzzles:window.PUZZLES,
  allowAfterWin:false,
  label(p,i){return (i+1)+' · best '+p.optimal+' slides';},
  init(p){return {cars:p.cars.map(c=>c.slice())};},
  valid(p,s){
    if(!s||!Array.isArray(s.cars)||s.cars.length!==p.cars.length)return false;
    const g=new Set();
    for(let i=0;i<s.cars.length;i++){
      const[c0,c1,l,o]=s.cars[i];const[r0,q0,L0,O0]=p.cars[i];
      if(!Number.isInteger(c0)||!Number.isInteger(c1)||l!==L0||o!==O0)return false;
      for(let k=0;k<l;k++){const r=o?c0+k:c0,c=o?c1:c1+k;if(r<0||c<0||r>5||c>5)return false;const key=r*6+c;if(g.has(key))return false;g.add(key);}
    }
    return true;
  },
  solved(p,s){return s.cars[0][1]===4;},
  remaining(p,s){return s.cars[0][1]===4?0:4-s.cars[0][1];},
  apply(p,s,a){
    if(a.type==='select'){sel=a.i;return {render:true};}
    if(a.type==='slide'){
      const next=canSlide(s.cars,a.i,a.d);
      if(!next)return {msg:'That car is blocked in that direction.'};
      return {state:{cars:next},counted:true};
    }
    return null;
  },
  hint(p,s){
    const path=shortestPath(s.cars);
    if(!path)return null;
    if(path.length<2)return null;
    return {state:{cars:path[1]},text:'Hint applied one slide on a shortest route ('+(path.length-1)+' unit slides from this position). Hints are not refunded.'};
  },
  keys(e,p,s){
    if(e.key==='Escape'){sel=-1;return {type:'select',i:-1};}
    if(sel<0)return null;
    const car=s.cars[sel];if(!car)return null;
    const horiz=!car[3];
    let d=0;
    if(horiz&&e.key==='ArrowLeft')d=-1;if(horiz&&e.key==='ArrowRight')d=1;
    if(!horiz&&e.key==='ArrowUp')d=-1;if(!horiz&&e.key==='ArrowDown')d=1;
    return d?{type:'slide',i:sel,d}:null;
  },
  render(p,s,api){
    const b=document.getElementById('board');
    if(!b.dataset.ready){b.dataset.ready='1';wire(b,api);}
    b.innerHTML='';
    const grid=document.createElement('div');grid.className='rh-grid';
    grid.setAttribute('role','img');grid.setAttribute('aria-label','Exit Jam board, 6 by 6. Target car on row 3 must reach the right exit.');
    for(let i=0;i<36;i++){const d=document.createElement('div');d.className='rh-cell';grid.appendChild(d);}
    const exit=document.createElement('div');exit.className='rh-exit';exit.textContent='EXIT';grid.appendChild(exit);
    s.cars.forEach((car,i)=>{
      const[r,c,l,o]=car;const el=document.createElement('button');
      el.type='button';el.className='car'+(i===0?' target':'')+(l===3?' truck':'')+(o?' vert':'')+(i===sel?' sel':'');
      el.dataset.i=String(i);
      el.style.left=(c*100/6)+'%';el.style.top=(r*100/6)+'%';
      el.style.width=(o?100/6:l*100/6)+'%';el.style.height=(o?l*100/6:100/6)+'%';
      el.setAttribute('aria-label',(i===0?'Target car':'Car '+i)+', '+(o?'vertical':'horizontal')+', length '+l+', row '+(r+1)+' column '+(c+1));
      el.setAttribute('aria-pressed',i===sel?'true':'false');
      grid.appendChild(el);
    });
    b.appendChild(grid);
    const ctl=document.getElementById('controls');
    ctl.innerHTML='<p class="tip">Click or drag a car to slide it along its axis. Keyboard: select a car with Enter or Space, then use arrow keys. Escape clears selection. Target car must exit to the right. Each unit slide counts as one move.</p>';
  }
};
let sel=-1,drag=null;
function canSlide(cars,i,d){
  const car=cars[i];if(!car)return null;
  const[r,c,l,o]=car;
  const occ=new Set();cars.forEach((x,j)=>{if(j===i)return;for(let k=0;k<x[2];k++)occ.add(x[3]?(x[0]+k)*6+x[1]:x[0]*6+x[1]+k);});
  const nr=o?r+d:r,nc=o?c:c+d;
  const probeR=o?(d>0?r+l:r-1):r,probeC=o?c:(d>0?c+l:c-1);
  if(probeR<0||probeC<0||probeR>5||probeC>5)return null;
  if(occ.has(probeR*6+probeC))return null;
  const next=cars.map(x=>x.slice());next[i]=[nr,nc,l,o];return next;
}
function key(cars){return cars.map(x=>x[0]*6+x[1]).join(',');}
function neighbours(cars){const out=[];cars.forEach((_,i)=>{for(const d of[-1,1]){const n=canSlide(cars,i,d);if(n)out.push(n);}});return out;}
function shortestPath(cars){
  const start=cars.map(x=>x.slice());const parent=new Map([[key(start),null]]);const q=[start];let found=null;
  for(let h=0;h<q.length&&q.length<400000;h++){const cur=q[h];if(cur[0][1]===4){found=cur;break;}
    for(const nx of neighbours(cur)){const k=key(nx);if(!parent.has(k)){parent.set(k,key(cur));q.push(nx);}}}
  if(!found)return null;
  const chain=[];let k=key(found),node=found;
  // rebuild the chain from the start state
  const states=new Map();q.forEach(s=>states.set(key(s),s));
  while(k!==null){chain.push(states.get(k));k=parent.get(k);}
  return chain.reverse();
}
function wire(board,api){
  board.addEventListener('pointerdown',e=>{
    const el=e.target.closest&&e.target.closest('.car');if(!el)return;
    const i=+el.dataset.i;const st=api.state;const car=st.cars[i];
    sel=i;drag={i,x:e.clientX,y:e.clientY,r:car[0],c:car[1],cell:board.querySelector('.rh-grid').getBoundingClientRect().width/6,moved:false};
    api.act({type:'select',i});
  });
  board.addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('.car');if(!el)return;api.act({type:'select',i:+el.dataset.i});});
  window.addEventListener('pointermove',e=>{
    if(!drag)return;
    const st=api.state;const car=st.cars[drag.i];const o=car[3];
    const delta=o?(e.clientY-drag.y)/drag.cell:(e.clientX-drag.x)/drag.cell;
    const target=Math.round(o?drag.r+delta:drag.c+delta);
    const cur=o?car[0]:car[1];
    const dir=target>cur?1:target<cur?-1:0;
    if(!dir)return;
    drag.moved=true;
    api.act({type:'slide',i:drag.i,d:dir});
  });
  window.addEventListener('pointerup',()=>{drag=null;});
  window.addEventListener('pointercancel',()=>{drag=null;});
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
