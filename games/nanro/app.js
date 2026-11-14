/* Original puzzle controller, adapting first-party collection lifecycle. MIT. */
(function(){
'use strict';
const $=q=>document.querySelector(q),P=window.PUZZLES,R=window.PencilRules,C=window.PUZZLE_CONFIG,KEY='dragon-gaming.'+C.slug+'.v1';
let records={},resume=null,storageOK=true;
const integer=(v,max=1000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
function validFrame(p,v){return v&&Array.isArray(v.cells)&&v.cells.length===p.n*p.n&&v.cells.every(x=>R.allowed(p,x))&&R.fixed(p).every((x,i)=>x===-1||x===v.cells[i])&&Array.isArray(v.notes)&&v.notes.length===p.n*p.n&&v.notes.every((x,i)=>integer(x,(1<<(R.max(p)+1))-1)&&(R.fixed(p)[i]===-1||x===0));}
try{
 const v=JSON.parse(localStorage.getItem(KEY)||'null');
 if(v&&v.version===1){
  if(v.records&&typeof v.records==='object'&&!Array.isArray(v.records))for(const p of P){const r=v.records[p.id];if(r&&integer(r.moves)&&integer(r.hints)&&integer(r.seconds,604800))records[p.id]={moves:r.moves,hints:r.hints,seconds:r.seconds};}
  const x=v.resume,p=x&&P.find(p=>p.id===x.id);
  if(p&&validFrame(p,x)&&integer(x.moves)&&integer(x.hints)&&integer(x.seconds,604800))resume={...x,history:Array.isArray(x.history)?x.history.slice(-100).filter(f=>validFrame(p,f)):[],redo:Array.isArray(x.redo)?x.redo.slice(-100).filter(f=>validFrame(p,f)):[]};
 }
}catch{storageOK=false;}
let index=0,p,cells=[],notes=[],history=[],redo=[],moves=0,hints=0,seconds=0,started=0,won=false,paused=false,selected=-1,noteMode=false,brush=1;
const fixedAt=i=>R.fixed(p)[i]!==-1;
const elapsed=()=>Math.min(604800,seconds+(started?Math.floor((Date.now()-started)/1000):0));
function freeze(){seconds=elapsed();started=0;}
function run(){if(!paused&&!won&&!document.hidden&&!started)started=Date.now();}
function message(t,type=''){$('#message').textContent=t;$('#message').dataset.type=type;}
function frame(){return {cells:cells.slice(),notes:notes.slice()};}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records,resume:{id:p.id,...frame(),moves,hints,seconds:elapsed(),history:history.slice(-100),redo:redo.slice(-100)}}));storageOK=true;}catch{storageOK=false;}$('#storage').textContent=storageOK?'Progress, notes and undo history stay in this browser.':'Storage unavailable. This visit still works.';}
function options(){const box=$('#level');box.replaceChildren();P.forEach((v,i)=>{const o=document.createElement('option');o.value=i;o.textContent=String(i+1).padStart(2,'0')+' · '+v.n+'×'+v.n+(records[v.id]?' · solved':'');box.append(o);});box.value=index;$('#progress').textContent=Object.keys(records).length+' / '+P.length+' solved';}
function build(){
 const board=$('#board');board.replaceChildren();board.style.setProperty('--n',p.n);board.setAttribute('aria-label',C.name+' puzzle '+(index+1)+', '+p.n+' rows and columns');
 for(let i=0;i<cells.length;i++){
  const n=document.createElement('button');n.type='button';n.className='cell';n.dataset.cell=i;
  if(p.rooms&&p.rooms[i]>=0){const room=p.rooms[i],r=Math.floor(i/p.n),c=i%p.n;n.style.setProperty('--room',room%5);n.classList.toggle('edge-top',r===0||p.rooms[i-p.n]!==room);n.classList.toggle('edge-bottom',r===p.n-1||p.rooms[i+p.n]!==room);n.classList.toggle('edge-left',c===0||p.rooms[i-1]!==room);n.classList.toggle('edge-right',c===p.n-1||p.rooms[i+1]!==room);}
  const mark=document.createElement('span');mark.className='mark';mark.setAttribute('aria-hidden','true');n.append(mark);const pencil=document.createElement('span');pencil.className='pencil';pencil.setAttribute('aria-hidden','true');n.append(pencil);board.append(n);
 }
 const pad=$('#keypad');pad.replaceChildren();
 const add=(value,label)=>{const b=document.createElement('button');b.type='button';b.dataset.value=value;b.textContent=label;pad.append(b);};
 if(p.kind==='nondango'){add(1,'Black ●');add(0,'White ○');}else{for(let v=1;v<=R.max(p);v++)add(v,String(v));if(['nanro','sukoro'].includes(p.kind))add(0,'Empty ×');}add(-1,'Erase');
 $('#notes').hidden=p.kind==='nondango';
}
function render(){
 for(const b of $('#board').children){
  const i=Number(b.dataset.cell),v=cells[i],fixed=fixedAt(i),hole=p.kind==='nondango'&&!p.circles[i],block=p.kind==='makaro'&&p.rooms[i]<0,arrow=p.arrows?.find(a=>a.cell===i);
  b.dataset.state=v;b.classList.toggle('fixed',fixed&&!hole&&!block);b.classList.toggle('blocked',block);b.classList.toggle('hole',hole);b.classList.toggle('selected',selected===i);b.classList.toggle('circle',p.kind==='nondango'&&!hole);b.disabled=paused||fixed;
  let text=v===-1?'':v===0?'×':String(v),desc=v===-1?'undecided':v===0?'confirmed empty':String(v);
  if(p.kind==='nondango'){text=hole?'':v===1?'●':v===0?'○':'?';desc=hole?'no circle':v===1?'black circle':v===0?'white circle':'undecided circle';}
  if(block){text=arrow?(arrow.to===i-p.n?'↑':arrow.to===i+p.n?'↓':arrow.to===i-1?'←':'→'):'';desc=arrow?'blocked arrow pointing '+(arrow.to===i-p.n?'up':arrow.to===i+p.n?'down':arrow.to===i-1?'left':'right'):'blocked cell';}
  b.querySelector('.mark').textContent=text;
  const ns=[];for(let v=1;v<=R.max(p);v++)if(notes[i]&(1<<v))ns.push(v);
  b.querySelector('.pencil').textContent=cells[i]===-1?ns.join(' '):'';
  b.setAttribute('aria-label','Row '+(Math.floor(i/p.n)+1)+', column '+(i%p.n+1)+': '+desc+(fixed&&!block&&!hole?', fixed clue':'')+(p.rooms&&p.rooms[i]>=0?', room '+(p.rooms[i]+1):'')+(ns.length?', notes '+ns.join(', '):''));b.setAttribute('aria-pressed',String(selected===i));
 }
 $('#moves').textContent=moves;$('#hints').textContent=hints;$('#remaining').textContent=cells.filter(v=>v===-1).length;$('#undo').disabled=paused||!history.length;$('#redo').disabled=paused||!redo.length;$('#check').disabled=paused;$('#hint').disabled=paused||won;$('#notes').disabled=paused;$('#notes').setAttribute('aria-pressed',String(noteMode));$('#notes').textContent=noteMode?'Notes: on':'Notes: off';$('#pause').disabled=won;$('#pause').textContent=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#pause-cover').hidden=!paused;$('#win').hidden=!won;
 for(const b of $('#keypad').children){b.disabled=paused;b.setAttribute('aria-pressed',String(Number(b.dataset.value)===brush));}
 $('#next').disabled=index===P.length-1;$('#previous').disabled=index===0;
 const r=records[p.id];$('#record').textContent=r?'Best: '+r.hints+' hints · '+r.moves+' edits · '+format(r.seconds):'No completed record yet.';
 if(won){$('#win-title').textContent='Puzzle '+(index+1)+' complete';$('#win-detail').textContent=hints?'Solved with '+hints+' answer reveals.':'Solved without answer reveals.';}
}
function format(v){return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0');}
function clock(){$('#time').textContent=format(elapsed());}
function load(i,data=null){
 freeze();index=i;p=P[index];cells=data?data.cells.slice():R.fixed(p);notes=data?data.notes.slice():Array(cells.length).fill(0);history=data?data.history:[];redo=data?data.redo:[];moves=data?data.moves:0;hints=data?data.hints:0;seconds=data?data.seconds:0;selected=-1;noteMode=false;brush=1;paused=false;won=R.complete(p,cells);options();build();render();message(data?'Saved puzzle restored.':'Select a cell and enter a value. Every editable cell needs a decision.');run();clock();persist();
}
function saveFrame(){history.push(frame());if(history.length>100)history.shift();redo=[];}
function settle(){
 const complete=R.complete(p,cells);if(complete){freeze();won=true;const r={moves,hints,seconds:elapsed()},old=records[p.id];if(!old||r.hints<old.hints||r.hints===old.hints&&(r.moves<old.moves||r.moves===old.moves&&r.seconds<old.seconds))records[p.id]=r;options();message('Every rule checks out. Puzzle complete!','good');}else{won=false;run();}
 render();clock();persist();
}
function enter(value){
 if(paused||selected<0||fixedAt(selected)||!R.allowed(p,value))return;
 if(value===0&&['renban','makaro'].includes(p.kind))return;
 const i=selected;
 if(noteMode&&p.kind!=='nondango'&&value>0){if(cells[i]!==-1){message('Erase the value before adding notes.');return;}saveFrame();notes[i]^=1<<value;moves++;message('Pencil notes are not checked as filled cells.');render();persist();return;}
 if(cells[i]===value&&!notes[i])return;saveFrame();cells[i]=value;notes[i]=0;moves++;message('');settle();
}
$('#board').addEventListener('click',e=>{const n=e.target.closest('[data-cell]');if(!n||paused)return;selected=Number(n.dataset.cell);if(p.kind==='nondango')enter(brush);else{render();message('Row '+(Math.floor(selected/p.n)+1)+', column '+(selected%p.n+1)+' selected. Use the keypad or keyboard.');}});
$('#keypad').addEventListener('click',e=>{const b=e.target.closest('[data-value]');if(!b)return;brush=Number(b.dataset.value);if(p.kind!=='nondango')enter(brush);else message('Brush selected. Tap circles to paint.');render();});
$('#board').addEventListener('keydown',e=>{
 const n=e.target.closest('[data-cell]');if(!n||paused)return;const i=Number(n.dataset.cell),r=Math.floor(i/p.n),c=i%p.n;selected=i;
 if(/^[0-6]$/.test(e.key)){e.preventDefault();enter(Number(e.key));}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();enter(-1);}else if(e.key.toLowerCase()==='n'){e.preventDefault();$('#notes').click();}else if(e.key.toLowerCase()==='z'){e.preventDefault();$('#undo').click();}else if(e.key.toLowerCase()==='y'){e.preventDefault();$('#redo').click();}else if(e.key.toLowerCase()==='h'){e.preventDefault();$('#hint').click();}else{
  let j=i;if(e.key==='ArrowLeft'&&c>0)j--;else if(e.key==='ArrowRight'&&c<p.n-1)j++;else if(e.key==='ArrowUp'&&r>0)j-=p.n;else if(e.key==='ArrowDown'&&r<p.n-1)j+=p.n;else return;e.preventDefault();const step=j-i,valid=k=>k>=0&&k<cells.length&&(Math.abs(step)!==1||Math.floor(k/p.n)===r);while(step&&valid(j)&&fixedAt(j))j+=step;if(valid(j)){selected=j;render();$('#board').children[j].focus();}
 }
});
$('#notes').addEventListener('click',()=>{if(paused||p.kind==='nondango')return;noteMode=!noteMode;render();});
$('#undo').addEventListener('click',()=>{if(paused||!history.length)return;redo.push(frame());const f=history.pop();cells=f.cells.slice();notes=f.notes.slice();moves++;message('Edit undone. Hint usage is not refunded.');settle();});
$('#redo').addEventListener('click',()=>{if(paused||!redo.length)return;history.push(frame());const f=redo.pop();cells=f.cells.slice();notes=f.notes.slice();moves++;message('Edit redone.');settle();});
$('#hint').addEventListener('click',()=>{if(paused||won)return;let i=cells.findIndex((v,i)=>!fixedAt(i)&&v!==-1&&v!==p.solution[i]);if(i<0)i=cells.findIndex((v,i)=>!fixedAt(i)&&v===-1);if(i<0)return;saveFrame();cells[i]=p.solution[i];notes[i]=0;selected=i;hints++;moves++;message('Answer reveal at row '+(Math.floor(i/p.n)+1)+', column '+(i%p.n+1)+'. This attempt is assisted.');settle();});
$('#check').addEventListener('click',()=>{if(paused)return;const issues=R.issues(p,cells);if(issues.length)message(issues.slice(0,3).join(' '),'bad');else if(!R.complete(p,cells))message('No rule contradiction detected yet. '+cells.filter(v=>v===-1).length+' cells remain undecided. This does not prove every entry is correct.');else settle();});
$('#restart').addEventListener('click',()=>load(index));$('#next').addEventListener('click',()=>{if(index<P.length-1)load(index+1);});$('#previous').addEventListener('click',()=>{if(index>0)load(index-1);});$('#level').addEventListener('change',e=>load(Number(e.target.value)));
$('#daily').addEventListener('click',()=>{load(Math.floor(Date.now()/86400000)%P.length);message('UTC daily selection from the fixed local pack; it repeats every '+P.length+' days.');});
$('#pause').addEventListener('click',()=>{if(won)return;if(paused){paused=false;run();}else{freeze();paused=true;}render();clock();persist();});$('#resume-board').addEventListener('click',()=>$('#pause').click());
$('#clear-progress').addEventListener('click',()=>{if(confirm('Clear only '+C.name+' records and saved board?')){records={};load(0);}});
$('#rules-open').addEventListener('click',()=>$('#rules').showModal());$('#rules-close').addEventListener('click',()=>$('#rules').close());document.addEventListener('visibilitychange',()=>{if(document.hidden){freeze();persist();}else run();});window.addEventListener('pagehide',()=>{freeze();persist();});
load(resume?P.findIndex(v=>v.id===resume.id):0,resume);setInterval(clock,250);
window.PuzzleApp=Object.freeze({key:KEY,snapshot:()=>({index,id:p.id,cells:cells.slice(),notes:notes.slice(),moves,hints,seconds:elapsed(),selected,noteMode,won,paused,historyLength:history.length,redoLength:redo.length})});
})();
