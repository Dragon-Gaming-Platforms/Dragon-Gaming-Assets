/* Original board collection controller. MIT; see LICENSE. */
(function(){
'use strict';
const E=window.BoardEngine,C=window.GAME_CONFIG,$=q=>document.querySelector(q);
const KEY='dragon-gaming.'+C.slug+'.v1',defaults={mode:'computer',human:1,level:'tactical'};
let settings={...defaults},s=E.initial(C.slug),steps=[],history=[],notes=[],selected=-1,hint=null,paused=false,thinking=false,token=0,timer=null,storageMessage='',initialMessage='';
const player=n=>C.players[n-1];
const coord=i=>s.coords.length?'cell '+(i+1)+' (q '+s.coords[i][0]+', r '+s.coords[i][1]+')':s.kind==='mu-torere'?(i===8?'center':'outer '+(i+1)):String.fromCharCode(97+i%s.w)+(s.h-Math.floor(i/s.w));
function message(text){$('#message').textContent=text;}
function stopAI(){token++;clearTimeout(timer);timer=null;thinking=false;}
function validSettings(v){return v&&['computer','local'].includes(v.mode)&&[1,2].includes(v.human)&&['casual','tactical'].includes(v.level);}
function describe(state,a){return a.from<0?'place at '+coord(a.to):coord(a.from)+' → '+coord(a.to);}
function add(a){const next=E.apply(s,a);if(!next)return false;history.push({state:s,count:steps.length});notes.push(player(s.turn)+': '+describe(s,a));steps.push({...a});s=next;selected=-1;hint=null;return true;}
function restore(){
 try{const raw=localStorage.getItem(KEY);if(!raw)return;const v=JSON.parse(raw);
  if(!v||v.version!==1||!validSettings(v.settings)||!Array.isArray(v.steps)||v.steps.length>300)throw Error('Invalid match');
  settings={...v.settings};for(const a of v.steps)if(!add(a))throw Error('Illegal replay');initialMessage='Saved match restored.';
 }catch(e){s=E.initial(C.slug);steps=[];notes=[];history=[];settings={...defaults};initialMessage=e.name==='SecurityError'?'Local storage is unavailable. You can still play.':'Saved match was invalid; a fresh match is ready.';}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,settings,steps}));storageMessage='Match saved only in this browser.';}catch{storageMessage='Storage unavailable. This visit still works.';}$('#storage').textContent=storageMessage;}
function isHuman(){return settings.mode==='local'||s.turn===settings.human;}
function contents(v){return v?player(v)+' '+C.unit:'empty';}
function initBoard(){
 const board=$('#board');board.replaceChildren();$('#columns').replaceChildren();
 if(s.coords.length){
  board.classList.add('hex');
  const points=s.coords.map(([q,r])=>[1.5*q,Math.sqrt(3)*(r+q/2)]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const x0=Math.min(...xs)-1.05,y0=Math.min(...ys)-.92,w=Math.max(...xs)-x0+1.05,h=Math.max(...ys)-y0+.92;
  board.style.aspectRatio=String(w/h);
  points.forEach(([x,y],i)=>{const node=cell(i);node.style.left=((x-x0)/w*100)+'%';node.style.top=((y-y0)/h*100)+'%';node.style.width=(1.94/w*100)+'%';node.style.height=(1.68/h*100)+'%';board.append(node);});
 }else if(s.kind==='mu-torere'){
  board.classList.add('ring');const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.classList.add('graph');
  const points=Array.from({length:8},(_,i)=>[50+38*Math.sin(i*Math.PI/4),50-38*Math.cos(i*Math.PI/4)]);points.push([50,50]);
  for(let i=0;i<8;i++)for(const j of[(i+1)%8,8]){const line=document.createElementNS(ns,'line');line.setAttribute('x1',points[i][0]);line.setAttribute('y1',points[i][1]);line.setAttribute('x2',points[j][0]);line.setAttribute('y2',points[j][1]);svg.append(line);}board.append(svg);
  points.forEach(([x,y],i)=>{const node=cell(i);node.style.left=x+'%';node.style.top=y+'%';board.append(node);});
 }else{
  for(let i=0;i<s.board.length;i++)board.append(cell(i));
  for(let c=0;c<s.w;c++){const n=document.createElement('span');n.textContent=String.fromCharCode(97+c);$('#columns').append(n);}
 }
 board.style.setProperty('--cols',s.w);$('#columns').style.setProperty('--cols',s.w);
}
function cell(i){const n=document.createElement('button');n.type='button';n.dataset.cell=i;n.className='cell';return n;}

function render(){
 const legal=new Set(E.isPlacement(s)?E.actions(s).map(a=>a.to):selected<0?[]:E.destinations(s,selected));
 const locked=paused||thinking||!!s.result||!isHuman();
 for(const node of $('#board').querySelectorAll('[data-cell]')){
  const i=Number(node.dataset.cell),v=s.board[i];
  node.dataset.player=v;node.classList.toggle('dark',(Math.floor(i/s.w)+i%s.w)%2===1);node.classList.toggle('selected',selected===i);node.classList.toggle('legal',legal.has(i));node.classList.toggle('hint',hint?.to===i);node.classList.toggle('last',steps[steps.length-1]?.to===i);
  node.disabled=locked;node.replaceChildren();
  if(v){const piece=document.createElement('span');piece.className='piece';piece.setAttribute('aria-hidden','true');piece.textContent=C.piece;const badge=document.createElement('small');badge.textContent=v===1?'B':'A';piece.append(badge);node.append(piece);
  }else if(legal.has(i)){const dot=document.createElement('span');dot.className='legal-dot';dot.setAttribute('aria-hidden','true');node.append(dot);}
  if(s.coords.length||s.kind==='mu-torere'){const label=document.createElement('span');label.className='cell-number';label.textContent=s.kind==='mu-torere'&&i===8?'C':String(i+1);label.setAttribute('aria-hidden','true');node.append(label);}
  node.setAttribute('aria-label',coord(i)+': '+contents(v)+(legal.has(i)?', legal destination':'')+(selected===i?', selected':''));node.setAttribute('aria-pressed',String(selected===i));
 }
 $('#board').setAttribute('aria-label',C.name+'. '+(s.result?'Match finished.':player(s.turn)+' to play.'));
 const counts=[1,2].map(who=>s.board.filter(v=>v===who).length);
 $('#blue-count').textContent=counts[0];$('#amber-count').textContent=counts[1];$('#open-count').textContent=s.board.filter(v=>v===0).length;$('#turn-count').textContent=s.ply;
 $('#mode-label').textContent=settings.mode==='local'?'Local two-player':'You: '+player(settings.human)+' · '+settings.level+' computer';
 $('#phase').textContent=s.result?'Match finished':paused?'Match paused':thinking?'Computer is thinking…':player(s.turn)+' · '+C.verb;$('#phase').dataset.player=s.turn;
 $('#undo').disabled=paused||!history.some(v=>settings.mode==='local'||v.state.turn===settings.human);$('#cancel').disabled=locked||(selected<0&&!hint);$('#hint').disabled=locked;$('#pause').disabled=!!s.result;$('#pause').textContent=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#pause-cover').hidden=!paused;
 $('#result').hidden=!s.result;if(s.result){$('#result-title').textContent=s.result.winner?player(s.result.winner)+' wins':'Draw';$('#result-detail').textContent=s.result.reason;}
 $('#log').replaceChildren();for(const text of notes.slice(-12)){const li=document.createElement('li');li.textContent=text;$('#log').append(li);}$('#storage').textContent=storageMessage;
}
function announce(){message(s.result?(s.result.winner?player(s.result.winner)+' wins. ':'Draw. ')+s.result.reason:C.prompt);}
function schedule(){
 if(s.result||paused||isHuman()||document.hidden||thinking)return;
 thinking=true;const ticket=++token;render();message('Computer is choosing a legal turn…');
 timer=setTimeout(()=>{if(ticket!==token||paused)return;try{const seq=E.plan(s,settings.level);if(!seq.length||!add(seq[0]))throw Error('Invalid turn');thinking=false;save();render();announce();}catch{thinking=false;render();message('The computer could not move. Restart or switch to local play.');}},220);
}
function clickCell(i){
 if(paused||thinking||s.result||!isHuman())return;
 if(E.isPlacement(s)){
  const a={from:-1,to:i};
  if(add(a)){save();render();announce();schedule();}else message(C.illegal);return;
 }
 if(selected>=0&&E.destinations(s,selected).includes(i)){add({from:selected,to:i});save();render();announce();schedule();return;}
 if(selected===i){selected=-1;hint=null;render();announce();return;}
 if(E.destinations(s,i).length){selected=i;hint=null;render();message('Choose a marked destination for '+coord(i)+'.');}else message('Select one of your movable pieces.');
}
function takeBack(){
 if(paused)return;stopAI();let root=null;
 while(history.length){root=history.pop();if(settings.mode==='local'||root.state.turn===settings.human)break;}
 if(!root)return;s=root.state;steps=steps.slice(0,root.count);notes=notes.slice(0,root.count);selected=-1;hint=null;save();render();message('Turn taken back. '+player(s.turn)+' to play.');schedule();
}
function cancel(){if(paused||thinking||!isHuman()||s.result)return;selected=-1;hint=null;render();announce();}
function newMatch(){stopAI();settings={mode:$('#mode').value,human:Number($('#side').value),level:$('#level').value};s=E.initial(C.slug);steps=[];history=[];notes=[];selected=-1;hint=null;paused=false;save();render();announce();schedule();}
$('#board').addEventListener('click',e=>{const cell=e.target.closest('[data-cell]');if(cell)clickCell(Number(cell.dataset.cell));});
$('#board').addEventListener('keydown',e=>{
 const cell=e.target.closest('[data-cell]');if(!cell)return;
 if(e.key==='Escape'){e.preventDefault();cancel();return;}
 const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!dir)return;
 const rect=cell.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;let target=null,best=Infinity;
 for(const n of $('#board').querySelectorAll('[data-cell]')){if(n===cell)continue;const r=n.getBoundingClientRect(),dx=r.x+r.width/2-x,dy=r.y+r.height/2-y,forward=dx*dir[0]+dy*dir[1],side=Math.abs(dx*dir[1]-dy*dir[0]);if(forward<1)continue;const score=Math.hypot(dx,dy)+side*2;if(score<best){best=score;target=n;}}
 if(target){e.preventDefault();target.focus();}
});
$('#new').addEventListener('click',newMatch);$('#undo').addEventListener('click',takeBack);$('#cancel').addEventListener('click',cancel);
$('#hint').addEventListener('click',()=>{if(paused||thinking||s.result||!isHuman())return;hint=E.plan(s,'tactical')[0];if(!hint)return;selected=hint.from;render();message('Computer suggestion: '+describe(s,hint)+'. '+C.aiNote);});
$('#pause').addEventListener('click',()=>{if(s.result)return;paused=!paused;stopAI();render();if(paused)message('Match paused.');else{announce();schedule();}});$('#resume').addEventListener('click',()=>$('#pause').click());
$('#rules-open').addEventListener('click',()=>$('#rules').showModal());$('#rules-close').addEventListener('click',()=>$('#rules').close());
$('#clear').addEventListener('click',()=>{if(confirm('Clear only this game’s saved match?')){try{localStorage.removeItem(KEY);}catch{}newMatch();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAI();render();save();}else schedule();});window.addEventListener('pagehide',save);
restore();initBoard();$('#mode').value=settings.mode;$('#side').value=String(settings.human);$('#level').value=settings.level;save();render();if(initialMessage)message(initialMessage);else announce();schedule();
window.BoardApp=Object.freeze({key:KEY,snapshot:()=>JSON.parse(JSON.stringify({state:s,settings,steps,selected,thinking,paused,historyLength:history.length}))});
})();
