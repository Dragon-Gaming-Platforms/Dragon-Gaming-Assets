/* Fifteen Puzzle controller. Original code, MIT; see LICENSE. */
/* Fifteen Puzzle rules, controller and renderer. Original code, MIT; see LICENSE. */
window.GAME={
  slug:'fifteen-puzzle',
  puzzles:window.PUZZLES,
  label(p,i){return 'Puzzle '+(i+1)+' · '+p.n+'×'+p.n+' · start distance '+p.manhattan;},
  init(p){return {t:p.start.slice()};},
  valid(p,s){
    if(!s||!Array.isArray(s.t)||s.t.length!==p.n*p.n)return false;
    const seen=new Set();
    for(const v of s.t){if(!Number.isInteger(v)||v<0||v>=p.n*p.n||seen.has(v))return false;seen.add(v);}
    return true;
  },
  solved(p,s){return s.t.every((v,i)=>v===goalAt(p.n,i));},
  remaining(p,s){return s.t.filter((v,i)=>v!==goalAt(p.n,i)).length;},
  apply(p,s,a){
    if(a.type!=='move')return null;
    const blank=s.t.indexOf(0);
    if(!adjacent(p.n,a.i,blank))return {msg:'Only a tile next to the blank can move.'};
    const t=s.t.slice();t[blank]=t[a.i];t[a.i]=0;
    return {state:{t},counted:true};
  },
  hint(p,s){
    const n=p.n,blank=s.t.indexOf(0);
    let best=null,bestScore=Infinity;
    for(const i of neighbourIndices(n,blank)){
      const t=s.t.slice();t[blank]=t[i];t[i]=0;
      const score=distance(t,n);
      if(score<bestScore){bestScore=score;best={i,t};}
    }
    if(!best)return null;
    const tile=s.t[best.i];
    return {state:{t:best.t},text:'Hint: slid tile '+tile+' into the blank. It is a helpful move that reduces total distance; it is not guaranteed to be on an optimal route.'};
  },
  keys(e,p,s){
    const n=p.n,blank=s.t.indexOf(0),r=Math.floor(blank/n),c=blank%n;
    let from=-1;
    // Arrow keys move the blank; the tile on the opposite side slides into it.
    if(e.key==='ArrowUp'&&r>0)from=blank-n;
    if(e.key==='ArrowDown'&&r<n-1)from=blank+n;
    if(e.key==='ArrowLeft'&&c>0)from=blank-1;
    if(e.key==='ArrowRight'&&c<n-1)from=blank+1;
    return from>=0?{type:'move',i:from}:null;
  },
  render(p,s,api){
    const n=p.n;const b=document.getElementById('board');b.innerHTML='';
    const grid=document.createElement('div');grid.className='grid fp-grid';grid.style.gridTemplateColumns='repeat('+n+',1fr)';
    grid.style.width='min(90vw,360px)';
    grid.setAttribute('role','group');grid.setAttribute('aria-label','Sliding tile board '+n+' by '+n);
    s.t.forEach((v,i)=>{
      const btn=document.createElement('button');btn.type='button';btn.className='cell fp-tile'+(v===0?' blank':'')+(v&&v===goalAt(n,i)?' home':'');
      btn.textContent=v?String(v):'';
      btn.setAttribute('aria-label',v?'Tile '+v+', row '+(Math.floor(i/n)+1)+', column '+(i%n+1):'Blank');
      if(v===0){btn.disabled=true;btn.style.background='#dfe7ec';}
      else btn.onclick=()=>api.act({type:'move',i});
      grid.appendChild(btn);
    });
    b.appendChild(grid);
    document.getElementById('controls').innerHTML='<p class="tip">Tap a tile beside the blank to slide it, or use the arrow keys to move the blank. A tile sits in its home when its number matches its cell. Hints suggest a move that reduces total distance; they do not solve the puzzle.</p>';
  }
};
function goalAt(n,i){return i===n*n-1?0:i+1;}
function adjacent(n,i,j){const ri=Math.floor(i/n),ci=i%n,rj=Math.floor(j/n),cj=j%n;return Math.abs(ri-rj)+Math.abs(ci-cj)===1;}
function neighbourIndices(n,i){const r=Math.floor(i/n),c=i%n,o=[];if(r>0)o.push(i-n);if(r<n-1)o.push(i+n);if(c>0)o.push(i-1);if(c<n-1)o.push(i+1);return o;}
function distance(t,n){let s=0;t.forEach((v,i)=>{if(!v)return;const g=v-1;s+=Math.abs(Math.floor(i/n)-Math.floor(g/n))+Math.abs(i%n-g%n);});return s;}

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
