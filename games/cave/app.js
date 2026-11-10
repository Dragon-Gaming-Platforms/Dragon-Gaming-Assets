/* Original implementation for Dragon Gaming Platforms. MIT; see LICENSE. */
(function(){
'use strict';
const $=s=>document.querySelector(s),packs=window.PUZZLES,R=window.PencilRules,config=window.PUZZLE_CONFIG;
const KEY='dragon-gaming.'+config.slug+'.v1',known=new Set(packs.map(p=>p.id));
const integer=(v,max=1000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
function read(){
 const fallback={records:{},resume:null};
 try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(!raw||typeof raw!=='object'||Array.isArray(raw))return fallback;
  if(raw.records&&typeof raw.records==='object'&&!Array.isArray(raw.records))for(const [id,v]of Object.entries(raw.records))if(known.has(id)&&v&&integer(v.seconds,604800)&&integer(v.moves)&&integer(v.hints))fallback.records[id]={seconds:v.seconds,moves:v.moves,hints:v.hints};
  const v=raw.resume,p=v&&packs.find(p=>p.id===v.id);
  if(p&&Array.isArray(v.cells)&&v.cells.length===p.n*p.n&&v.cells.every(x=>[-1,0,1].includes(x))&&integer(v.moves)&&integer(v.hints)&&integer(v.seconds,604800)){
   const fixed=R.fixed(p);if(fixed.every((x,i)=>x===-1||x===v.cells[i]))fallback.resume={id:v.id,cells:v.cells.slice(),moves:v.moves,hints:v.hints,seconds:v.seconds};
  }
  return fallback;
 }catch{return fallback}
}
let saved=read(),p,index=0,cells=[],history=[],moves=0,hints=0,seconds=0,startedAt=0,won=false,paused=false,brush='cycle';
function elapsed(){return Math.min(604800,seconds+(startedAt?Math.floor((performance.now()-startedAt)/1000):0))}
function freeze(){seconds=elapsed();startedAt=0}
function run(){if(!won&&!paused&&!document.hidden&&!startedAt)startedAt=performance.now()}
function persist(){try{saved.resume={id:p.id,cells:cells.slice(),moves,hints,seconds:elapsed()};localStorage.setItem(KEY,JSON.stringify(saved));$('#storage').textContent='Progress stays in this browser.'}catch{$('#storage').textContent='Storage unavailable. This visit still works.'}}
function message(text,type=''){const el=$('#message');el.textContent=text;el.dataset.type=type}
function options(){const select=$('#level');select.replaceChildren();for(let i=0;i<packs.length;i++){const item=packs[i],o=document.createElement('option');o.value=String(i);o.textContent=String(i+1).padStart(2,'0')+' · '+item.n+'×'+item.n+(saved.records[item.id]?' · solved':'');select.append(o)}select.value=String(index)}
function fixedAt(i){return R.fixed(p)[i]!==-1}
function build(){
 const n=p.n,board=$('#board');board.replaceChildren();board.style.setProperty('--n',String(n));board.setAttribute('aria-label',config.name+' puzzle '+(index+1)+', '+n+' rows and columns');
 $('#row-clues').replaceChildren();$('#col-clues').replaceChildren();
 const roomFirst={};if(p.rooms)p.rooms.forEach((v,i)=>{roomFirst[v]??=i});
 for(let i=0;i<n*n;i++){
  const b=document.createElement('button');b.type='button';b.className='cell';b.dataset.cell=String(i);
  if(p.rooms){const room=p.rooms[i],r=Math.floor(i/n),c=i%n;b.style.setProperty('--room',String(room%5));b.classList.toggle('edge-top',r===0||p.rooms[i-n]!==room);b.classList.toggle('edge-left',c===0||p.rooms[i-1]!==room);b.classList.toggle('edge-right',c===n-1||p.rooms[i+1]!==room);b.classList.toggle('edge-bottom',r===n-1||p.rooms[i+n]!==room);
   if(roomFirst[room]===i){const label=document.createElement('span');label.className='room-count';label.textContent=String(p.counts[room]);label.title='Room '+(room+1)+': shade '+p.counts[room]+' cells';b.append(label)}
  }
  const mark=document.createElement('span');mark.className='mark';mark.setAttribute('aria-hidden','true');b.append(mark);
  const clue=(p.clues||[]).find(c=>c.cell===i);if(clue){b.dataset.clue=String(clue.value);if(fixedAt(i)){b.classList.add('clue-cell');mark.textContent=String(clue.value)}else{const label=document.createElement('span');label.className='area-count';label.textContent=String(clue.value);label.title=config.clueLabel+': '+clue.value;b.append(label)}}
  board.append(b);
 }
 $('#junctions').replaceChildren();
 render();
}
function render(){
 const n=p.n,fixed=R.fixed(p);for(const b of $('#board').children){const i=Number(b.dataset.cell),value=cells[i];b.dataset.state=String(value);b.classList.toggle('fixed',fixed[i]!==-1);b.disabled=won||paused||fixed[i]!==-1;b.setAttribute('aria-label','Row '+(Math.floor(i/n)+1)+', column '+(i%n+1)+': '+(value===-1?'undecided':value===1?config.fillName:config.clearName)+(fixed[i]!==-1?', fixed clue':'')+(b.dataset.clue?', '+config.clueLabel+' '+b.dataset.clue:'')+(p.rooms?', room '+(p.rooms[i]+1)+' needs '+p.counts[p.rooms[i]]+' shaded cells':''));b.setAttribute('aria-pressed',value===1?'true':value===-1?'mixed':'false');
  if(!b.classList.contains('clue-cell'))b.querySelector('.mark').textContent=value===-1?'':value===1?config.fillMark:config.clearMark;
 }
 $('#moves').textContent=String(moves);$('#hints').textContent=String(hints);$('#remaining').textContent=String(cells.filter(v=>v===-1).length);$('#undo').disabled=history.length===0||won||paused;$('#hint').disabled=won||paused;$('#check').disabled=won||paused;$('#next').disabled=index===packs.length-1;$('#pause').disabled=won;$('#pause').textContent=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#board-shell').classList.toggle('paused',paused);$('#pause-cover').hidden=!paused;$('#win').hidden=!won;
 const rec=saved.records[p.id];$('#record').textContent=rec?'Best: '+rec.hints+' hint'+(rec.hints===1?'':'s')+' · '+rec.moves+' moves · '+format(rec.seconds):'No completed record yet.';
}
function format(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function clock(){$('#time').textContent=format(elapsed())}
function load(i,resume=null){freeze();index=i;p=packs[index];cells=resume?resume.cells.slice():R.fixed(p);moves=resume?resume.moves:0;hints=resume?resume.hints:0;seconds=resume?resume.seconds:0;history=[];won=R.complete(p,cells);paused=false;options();build();message(resume?(won?'Your completed board is restored.':'Your unfinished board is restored.'):'Mark every undecided cell. Use the clues—not trial feedback.');if(won){$('#win-title').textContent='Puzzle '+(index+1)+' complete';$('#win-detail').textContent=hints?'Solved with '+hints+' hints.':'Solved without hints.';}run();clock();persist()}
function snapshot(){history.push(cells.slice());if(history.length>150)history.shift()}
function finish(){if(!R.complete(p,cells))return false;freeze();won=true;const candidate={seconds:elapsed(),moves,hints},old=saved.records[p.id];if(!old||candidate.hints<old.hints||(candidate.hints===old.hints&&(candidate.moves<old.moves||(candidate.moves===old.moves&&candidate.seconds<old.seconds))))saved.records[p.id]=candidate;options();render();persist();message('Every rule checks out. Puzzle complete!','good');$('#win-title').textContent='Puzzle '+(index+1)+' complete';$('#win-detail').textContent=hints?'Solved with '+hints+' hint'+(hints===1?'':'s')+'.':'Solved without hints.';return true}
function change(i,value){if(won||paused||fixedAt(i)||i<0||i>=cells.length||![-1,0,1].includes(value)||cells[i]===value)return;snapshot();cells[i]=value;moves++;run();message('');render();if(!finish())persist()}
function cycle(i){change(i,brush==='fill'?1:brush==='clear'?0:brush==='erase'?-1:cells[i]===-1?1:cells[i]===1?0:-1)}
$('#board').addEventListener('click',e=>{const b=e.target.closest('[data-cell]');if(b)cycle(Number(b.dataset.cell))});
$('#board').addEventListener('contextmenu',e=>{const b=e.target.closest('[data-cell]');if(b){e.preventDefault();change(Number(b.dataset.cell),0)}});
$('#board').addEventListener('keydown',e=>{const b=e.target.closest('[data-cell]');if(!b)return;const i=Number(b.dataset.cell),n=p.n;let j=i;
 if(e.key==='1'){e.preventDefault();change(i,1)}else if(e.key==='0'){e.preventDefault();change(i,0)}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();change(i,-1)}else if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft'&&i%n>0)j--;if(e.key==='ArrowRight'&&i%n<n-1)j++;if(e.key==='ArrowUp'&&i>=n)j-=n;if(e.key==='ArrowDown'&&i<n*(n-1))j+=n;const step=j-i,within=k=>k>=0&&k<cells.length&&(Math.abs(step)!==1||Math.floor(k/n)===Math.floor(i/n));while(step&&within(j)&&fixedAt(j))j+=step;if(within(j))$('#board').children[j].focus()}
});
$('#brush').addEventListener('change',e=>{brush=e.target.value});
$('#undo').addEventListener('click',()=>{if(!history.length||won||paused)return;cells=history.pop();moves++;message('One edit undone. Hint usage is not refunded.');render();persist()});
$('#restart').addEventListener('click',()=>load(index));
$('#next').addEventListener('click',()=>{if(index<packs.length-1)load(index+1)});
$('#level').addEventListener('change',e=>load(Number(e.target.value)));
$('#hint').addEventListener('click',()=>{if(won||paused)return;let i=cells.findIndex((v,i)=>v!==-1&&v!==p.solution[i]);if(i<0)i=cells.findIndex(v=>v===-1);if(i<0)return;snapshot();cells[i]=p.solution[i];moves++;hints++;message('Answer reveal: row '+(Math.floor(i/p.n)+1)+', column '+(i%p.n+1)+'. This is an assisted solve.');render();if(!finish())persist()});
$('#check').addEventListener('click',()=>{const e=R.issues(p,cells);if(e.length)message(e[0],'bad');else if(!finish())message('No rule contradiction detected yet. Decide '+cells.filter(v=>v===-1).length+' remaining cells. This does not guarantee every edit is correct.');});
$('#pause').addEventListener('click',()=>{if(won)return;if(paused){paused=false;run()}else{freeze();paused=true}render();clock();persist()});
$('#resume-board').addEventListener('click',()=>$('#pause').click());
$('#clear-progress').addEventListener('click',()=>{if(confirm('Clear only '+config.name+' records and restart?')){saved={records:{},resume:null};load(0)}});
$('#rules-open').addEventListener('click',()=>$('#rules').showModal());$('#rules-close').addEventListener('click',()=>$('#rules').close());
document.addEventListener('visibilitychange',()=>{if(document.hidden){freeze();persist()}else run()});window.addEventListener('pagehide',()=>{freeze();persist()});
const resume=saved.resume;load(resume?packs.findIndex(p=>p.id===resume.id):0,resume);setInterval(clock,250);
// Read-only snapshots for diagnostics; all edits still pass through physical controls.
window.PuzzleApp=Object.freeze({snapshot:()=>({id:p.id,cells:cells.slice(),moves,hints,seconds:elapsed(),won,paused,index}),key:KEY});
})();
