/* Rush Hour controller. Original code, MIT; see LICENSE. */
/* Rush Hour rules, controller and renderer. Original code, MIT; see LICENSE. */
const N=6,EXIT_ROW=2;
window.GAME={
  slug:'rush-hour',
  puzzles:window.PUZZLES,
  label(p,i){return 'Puzzle '+(i+1)+' · '+p.tier+' · best '+p.optimal+' steps';},
  init(p){return {pos:p.cars.map(c=>[c.r,c.c])};},
  valid(p,s){
    if(!s||!Array.isArray(s.pos)||s.pos.length!==p.cars.length)return false;
    const seen=new Set();
    for(let i=0;i<p.cars.length;i++){
      const[r,c]=s.pos[i]||[];const car=p.cars[i];
      if(!Number.isInteger(r)||!Number.isInteger(c))return false;
      if(car.dir==='h'?(r<0||r>=N||c<0||c+car.len>N):(c<0||c>=N||r<0||r+car.len>N))return false;
      for(let k=0;k<car.len;k++){const key=car.dir==='h'?r*N+c+k:(r+k)*N+c;if(seen.has(key))return false;seen.add(key);}
    }
    return true;
  },
  solved(p,s){return s.pos[0][0]===EXIT_ROW&&s.pos[0][1]===N-p.cars[0].len;},
  remaining(p,s){
    // steps still needed by the shortest route, computed when the puzzle is shown
    return null;
  },
  apply(p,s,a){
    if(a.type==='select'){sel=a.i;return {render:true};}
    if(a.type==='move'){
      const i=a.car,d=a.delta;
      if(!Number.isInteger(i)||i<0||i>=p.cars.length||(d!==1&&d!==-1))return {msg:'Select a car first.'};
      const np=legalStep(p,s.pos,i,d);
      if(!np)return {msg:'That car cannot move that way.'};
      sel=i;
      return {state:{pos:np},counted:true};
    }
    return null;
  },
  hint(p,s){
    const path=shortest(p,s.pos);
    if(!path||!path.length)return null;
    const[i,d]=path[0];const np=legalStep(p,s.pos,i,d);sel=i;
    return {state:{pos:np},text:'Hint moved car '+(i===0?'X (red)':'#'+i)+' one cell '+(d>0?(p.cars[i].dir==='h'?'right':'down'):(p.cars[i].dir==='h'?'left':'up'))+'. Hints are not refunded.'};
  },
  keys(e,p,s){
    if(e.key==='Escape'){sel=-1;return {type:'select',i:-1};}
    if(e.key==='Tab'){if(!p.cars.length)return null;sel=(sel+1+p.cars.length)%p.cars.length;return {type:'select',i:sel};}
    const map={ArrowLeft:[-1,'h'],ArrowRight:[1,'h'],ArrowUp:[-1,'v'],ArrowDown:[1,'v']};
    const m=map[e.key];if(!m)return null;
    if(sel<0){sel=0;return {type:'select',i:0};}
    const car=p.cars[sel];
    if(car.dir!==m[1])return {type:'select',i:sel};
    return {type:'move',car:sel,delta:m[0]};
  },
  render(p,s,api){
    const b=document.getElementById('board');b.innerHTML='';
    const wrap=document.createElement('div');wrap.className='rh-board';
    wrap.setAttribute('role','group');wrap.setAttribute('aria-label','Rush Hour board, 6 by 6. The exit is on the right of row 3.');
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){const d=document.createElement('div');d.className='rh-cell';wrap.appendChild(d);}
    const exit=document.createElement('div');exit.className='rh-exit';exit.setAttribute('aria-hidden','true');
    exit.style.gridRow=String(EXIT_ROW+1);wrap.appendChild(exit);
    p.cars.forEach((car,i)=>{
      const[r,c]=s.pos[i];
      const el=document.createElement('button');el.type='button';
      el.className='rh-car '+(car.dir==='h'?'h':'v')+(i===0?' target':'')+(i===sel?' sel':'');
      el.style.gridRow=(r+1)+' / span '+(car.dir==='v'?car.len:1);
      el.style.gridColumn=(c+1)+' / span '+(car.dir==='h'?car.len:1);
      el.setAttribute('aria-label',(i===0?'Red car X':'Car '+i)+', '+(car.dir==='h'?'horizontal':'vertical')+', length '+car.len+', at row '+(r+1)+' column '+(c+1)+(i===sel?', selected':''));
      el.onclick=()=>api.act({type:'select',i});
      wrap.appendChild(el);
    });
    b.appendChild(wrap);
    const ctl=document.getElementById('controls');ctl.innerHTML='';
    const pad=document.createElement('div');pad.className='keypad rh-pad';pad.setAttribute('role','group');pad.setAttribute('aria-label','Move selected car');
    const car=sel>=0?p.cars[sel]:null;
    const dirs=[['◀','Left',-1,'h'],['▶','Right',1,'h'],['▲','Up',-1,'v'],['▼','Down',1,'v']];
    for(const[label,name,d,ax]of dirs){
      const bt=document.createElement('button');bt.type='button';bt.textContent=label;bt.setAttribute('aria-label','Move selected car '+name);
      bt.disabled=!car||car.dir!==ax||!legalStep(p,s.pos,sel,d);
      bt.onclick=()=>api.act({type:'move',car:sel,delta:d});
      pad.appendChild(bt);
    }
    ctl.appendChild(pad);
    const tip=document.createElement('p');tip.className='tip';
    tip.textContent='Slide cars one cell at a time to clear the red car X through the exit on the right. Click a car to select it. Arrow keys move a selected car along its direction, Tab cycles cars, and Escape clears the selection.';
    ctl.appendChild(tip);
  }
};
let sel=-1;
// one-cell legal step for car i in direction d, or null
function legalStep(p,pos,i,d){
  const car=p.cars[i];const[r,c]=pos[i];
  const occ=new Set();
  pos.forEach((q,j)=>{if(j===i)return;for(let k=0;k<p.cars[j].len;k++)occ.add(p.cars[j].dir==='h'?q[0]*N+q[1]+k:(q[0]+k)*N+q[1]);});
  let nr=r,nc=c;
  if(car.dir==='h'){nc=c+d;if(nc<0||nc+car.len>N)return null;const cell=d<0?r*N+nc:r*N+nc+car.len-1;if(occ.has(cell))return null;}
  else{nr=r+d;if(nr<0||nr+car.len>N)return null;const cell=d<0?nr*N+c:(nr+car.len-1)*N+c;if(occ.has(cell))return null;}
  const np=pos.map(q=>q.slice());np[i]=[nr,nc];return np;
}
// breadth-first shortest path (one-cell steps) from pos to solution; returns [[car,delta],...]
function shortest(p,pos){
  const key=ps=>ps.map(q=>q[0]*N+q[1]).join(',');
  const prev=new Map([[key(pos),null]]);let frontier=[pos];
  const done=ps=>ps[0][0]===EXIT_ROW&&ps[0][1]===N-p.cars[0].len;
  if(done(pos))return [];
  while(frontier.length){
    const next=[];
    for(const ps of frontier){
      for(let i=0;i<p.cars.length;i++)for(const d of[-1,1]){
        const np=legalStep(p,ps,i,d);if(!np)continue;
        const k=key(np);if(prev.has(k))continue;
        prev.set(k,[key(ps),i,d]);
        if(done(np)){
          const path=[];let cur=k;
          while(prev.get(cur)){const[pk,ci,cd]=prev.get(cur);path.unshift([ci,cd]);cur=pk;}
          return path;
        }
        next.push(np);
      }
    }
    frontier=next;
  }
  return null;
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
