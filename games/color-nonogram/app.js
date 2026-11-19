/* Colour Nonogram controller. Original code, MIT; see LICENSE. */
/* Colour nonogram rules, controller and renderer. Original code, MIT; see LICENSE. */
window.GAME={
  slug:'color-nonogram',
  puzzles:window.PUZZLES,
  label(p,i){return 'Puzzle '+(i+1)+' · '+p.n+'×'+p.n+' · 3 colours';},
  init(p){return {g:Array(p.n*p.n).fill(-1)};},
  valid(p,s){return !!s&&Array.isArray(s.g)&&s.g.length===p.n*p.n&&s.g.every(v=>Number.isInteger(v)&&v>=-1&&v<=3);},
  solved(p,s){return unsatisfied(p,s.g)===0;},
  remaining(p,s){return unsatisfied(p,s.g);},
  apply(p,s,a){
    if(a.type==='tool'){tool=a.v;return {render:true};}
    if(a.type==='paint'){
      const cur=s.g[a.i];
      if(cur===a.v)return {render:true};
      const g=s.g.slice();g[a.i]=a.v;
      return {state:{g},counted:true};
    }
    return null;
  },
  hint(p,s){
    const sol=p.solution;
    for(let i=0;i<sol.length;i++){if(s.g[i]!==sol[i]){const g=s.g.slice();g[i]=sol[i];
      const r=Math.floor(i/p.n)+1,c=i%p.n+1;
      return {state:{g},text:'Hint revealed row '+r+', column '+c+' ('+(sol[i]?'colour '+COLOURS[sol[i]].name:'empty')+'). Hints are not refunded.'};}}
    return null;
  },
  keys(e,p,s){
    if(e.key==='1'||e.key==='2'||e.key==='3')return {type:'tool',v:+e.key};
    if(e.key==='0'||e.key.toLowerCase()==='x')return {type:'tool',v:0};
    if(e.key==='Delete'||e.key==='Backspace')return {type:'tool',v:-1};
    return null;
  },
  render(p,s,api){
    const n=p.n;const b=document.getElementById('board');b.innerHTML='';
    const wrap=document.createElement('div');wrap.className='nono';wrap.style.setProperty('--n',n);
    wrap.setAttribute('role','grid');wrap.setAttribute('aria-label','Colour nonogram '+n+' by '+n);
    // corner
    const corner=document.createElement('div');corner.className='clue corner';wrap.appendChild(corner);
    // column clues
    for(let c=0;c<n;c++){const d=document.createElement('div');d.className='clue col'+(colOK(p,s.g,c)?' ok':'');
      d.innerHTML=p.cols[c].map(([col,len])=>'<span class="run" style="--c:'+COLOURS[col].hex+'">'+len+'</span>').join('');wrap.appendChild(d);}
    // rows
    for(let r=0;r<n;r++){
      const h=document.createElement('div');h.className='clue row'+(rowOK(p,s.g,r)?' ok':'');
      h.innerHTML=p.rows[r].map(([col,len])=>'<span class="run" style="--c:'+COLOURS[col].hex+'">'+len+'</span>').join('');wrap.appendChild(h);
      for(let c=0;c<n;c++){
        const i=r*n+c,v=s.g[i];
        const btn=document.createElement('button');btn.type='button';btn.className='cell nono-cell'+(v>0?' filled':'')+(v===0?' cross':'');
        if(v>0)btn.style.background=COLOURS[v].hex;
        btn.textContent=v===0?'×':'';
        btn.setAttribute('aria-label','Row '+(r+1)+' column '+(c+1)+': '+(v>0?COLOURS[v].name:v===0?'empty':'undecided'));
        btn.onclick=()=>api.act({type:'paint',i,v:tool});
        wrap.appendChild(btn);
      }
    }
    b.appendChild(wrap);
    const ctl=document.getElementById('controls');
    ctl.innerHTML='';
    const pal=document.createElement('div');pal.className='keypad';pal.setAttribute('role','group');pal.setAttribute('aria-label','Paint tool');
    [[1,'Rose'],[2,'Blue'],[3,'Amber'],[0,'Cross ×'],[-1,'Erase']].forEach(([v,label])=>{
      const bt=document.createElement('button');bt.type='button';bt.textContent=label;
      bt.setAttribute('aria-pressed',String(tool===v));
      bt.onclick=()=>api.act({type:'tool',v});
      if(v>0)bt.style.borderLeft='10px solid '+COLOURS[v].hex;
      pal.appendChild(bt);});
    ctl.appendChild(pal);
    const tip=document.createElement('p');tip.className='tip';
    tip.textContent='Clues list runs of each colour from top to bottom or left to right. Runs of the same colour need at least one gap; different colours can touch. Pick a tool, then click cells. Keys 1–3 paint colours, 0 or X crosses out, Delete erases. Completion is checked against every clue.';
    ctl.appendChild(tip);
  }
};
let tool=1;
const COLOURS={1:{name:'rose',hex:'#d9736a'},2:{name:'blue',hex:'#4f86c6'},3:{name:'amber',hex:'#e1b43e'}};
function runsOf(line){const out=[];for(let i=0;i<line.length;){const v=line[i];if(!(v>0)){i++;continue;}let j=i;while(j<line.length&&line[j]===v)j++;out.push([v,j-i]);i=j;}return out;}
function lineOf(p,g,isRow,k){const n=p.n;const out=[];for(let j=0;j<n;j++)out.push(isRow?g[k*n+j]:g[j*n+k]);return out;}
function same(a,b){return a.length===b.length&&a.every((x,i)=>x[0]===b[i][0]&&x[1]===b[i][1]);}
function rowOK(p,g,r){return same(runsOf(lineOf(p,g,true,r)),p.rows[r]);}
function colOK(p,g,c){return same(runsOf(lineOf(p,g,false,c)),p.cols[c]);}
function unsatisfied(p,g){let k=0;for(let r=0;r<p.n;r++)if(!rowOK(p,g,r))k++;for(let c=0;c<p.n;c++)if(!colOK(p,g,c))k++;return k;}

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
