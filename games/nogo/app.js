/* Original board collection controller. MIT; see LICENSE. */
(function(){
'use strict';
const E=window.BoardEngine,C=window.GAME_CONFIG,$=q=>document.querySelector(q);
const KEY='dragon-gaming.'+C.slug+'.v1',defaults={mode:'computer',human:1,level:'tactical'};
let settings={...defaults},s=E.initial(C.slug),steps=[],history=[],notes=[],selected=-1,mark=1,hint=null,paused=false,thinking=false,token=0,timer=null,storageMessage='',initialMessage='';
const player=n=>C.players[n-1];
const coord=i=>s.kind==='notakto'?'board '+(Math.floor(i/9)+1)+', '+String.fromCharCode(97+i%3)+(3-Math.floor(i%9/3)):String.fromCharCode(97+i%s.w)+(s.h-Math.floor(i/s.w));
function message(text){$('#message').textContent=text;}
function stopAI(){token++;clearTimeout(timer);timer=null;thinking=false;}
function validSettings(v){return v&&['computer','local'].includes(v.mode)&&[1,2].includes(v.human)&&['casual','tactical'].includes(v.level);}
function describe(state,a){
 if(state.kind==='knightthrough')return coord(a.from)+' → '+coord(a.to);
 if(state.kind==='order-and-chaos')return 'place '+(a.mark===1?'X':'O')+' at '+coord(a.to);
 if(state.kind==='traffic-lights')return coord(a.to)+' → '+['off','green','yellow','red'][state.board[a.to]+1];
 return 'place '+(state.kind==='notakto'?'X':'stone')+' at '+coord(a.to);
}
function add(a){const next=E.apply(s,a);if(!next)return false;history.push({state:s,count:steps.length});notes.push(player(s.turn)+': '+describe(s,a));steps.push({...a});s=next;selected=-1;hint=null;return true;}
function restore(){
 try{const raw=localStorage.getItem(KEY);if(!raw)return;const v=JSON.parse(raw);
  if(!v||v.version!==1||!validSettings(v.settings)||!Array.isArray(v.steps)||v.steps.length>200)throw Error('Invalid match');
  settings={...v.settings};for(const a of v.steps)if(!add(a))throw Error('Illegal replay');initialMessage='Saved match restored.';
 }catch(e){s=E.initial(C.slug);steps=[];notes=[];history=[];settings={...defaults};initialMessage=e.name==='SecurityError'?'Local storage is unavailable. You can still play.':'Saved match was invalid; a fresh match is ready.';}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,settings,steps}));storageMessage='Match saved only in this browser.';}catch{storageMessage='Storage unavailable. This visit still works.';}$('#storage').textContent=storageMessage;}
function isHuman(){return settings.mode==='local'||s.turn===settings.human;}
function contents(v){
 if(!v)return 'empty';
 if(s.kind==='traffic-lights')return ['off','green light','yellow light','red light'][v];
 if(s.kind==='order-and-chaos')return v===1?'X mark':'O mark';
 if(s.kind==='notakto')return 'shared X';
 return player(v)+' '+C.unit;
}
function initBoard(){
 const board=$('#board');board.replaceChildren();$('#columns').replaceChildren();
 if(s.kind==='notakto'){
  for(let b=0;b<3;b++){const group=document.createElement('section');group.className='mini-board';group.setAttribute('aria-label','Board '+(b+1));const title=document.createElement('strong');title.textContent='Board '+(b+1);group.append(title);const grid=document.createElement('div');grid.className='mini-grid';for(let j=0;j<9;j++)grid.append(cell(b*9+j));group.append(grid);board.append(group);}
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
  const i=Number(node.dataset.cell),v=s.board[i],closed=s.kind==='notakto'&&E.dead(s,Math.floor(i/9));
  node.dataset.player=v;node.classList.toggle('dark',(Math.floor(i/s.w)+i%s.w)%2===1);node.classList.toggle('selected',selected===i);node.classList.toggle('legal',legal.has(i));node.classList.toggle('hint',hint?.to===i);node.classList.toggle('last',steps[steps.length-1]?.to===i);
  node.disabled=locked||closed;node.replaceChildren();
  if(v){const piece=document.createElement('span');piece.className='piece';piece.setAttribute('aria-hidden','true');piece.textContent=s.kind==='traffic-lights'?['','G','Y','R'][v]:s.kind==='order-and-chaos'?(v===1?'X':'O'):s.kind==='notakto'?'X':C.piece;
   if(s.kind==='nogo'||s.kind==='knightthrough'){const badge=document.createElement('small');badge.textContent=v===1?'B':'A';piece.append(badge);}node.append(piece);
  }else if(legal.has(i)){const dot=document.createElement('span');dot.className='legal-dot';dot.setAttribute('aria-hidden','true');node.append(dot);}
  node.setAttribute('aria-label',coord(i)+': '+contents(v)+(closed?', dead board':legal.has(i)?', legal destination':'')+(selected===i?', selected':''));node.setAttribute('aria-pressed',String(selected===i));
 }
 if(s.kind==='notakto')for(const group of $('#board').children){const b=Number(group.querySelector('[data-cell]').dataset.cell)/9;group.classList.toggle('dead',E.dead(s,b));group.querySelector('strong').textContent='Board '+(b+1)+(E.dead(s,b)?' · dead':' · live');}
 $('#board').setAttribute('aria-label',C.name+'. '+(s.result?'Match finished.':player(s.turn)+' to play.'));
 const counts=C.stats.map((_,i)=>s.kind==='notakto'?(i===0?s.board.filter(v=>v===1).length:[0,1,2].filter(b=>!E.dead(s,b)).length):s.board.filter(v=>v===i+1).length);
 $('#blue-count').textContent=counts[0];$('#amber-count').textContent=counts[1];$('#open-count').textContent=s.board.filter(v=>v===0).length;$('#turn-count').textContent=s.ply;
 $('#mode-label').textContent=settings.mode==='local'?'Local two-player':'You: '+player(settings.human)+' · '+settings.level+' computer';
 $('#phase').textContent=s.result?'Match finished':paused?'Match paused':thinking?'Computer is thinking…':player(s.turn)+' · '+C.verb;$('#phase').dataset.player=s.turn;
 $('#undo').disabled=paused||!history.some(v=>settings.mode==='local'||v.state.turn===settings.human);$('#cancel').disabled=locked||(selected<0&&!hint);$('#hint').disabled=locked;$('#pause').disabled=!!s.result;$('#pause').textContent=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#pause-cover').hidden=!paused;
 $('#result').hidden=!s.result;if(s.result){$('#result-title').textContent=s.result.winner?player(s.result.winner)+' wins':'Draw';$('#result-detail').textContent=s.result.reason;}
 $('#mark-choice').hidden=s.kind!=='order-and-chaos';for(const b of $('#mark-choice').querySelectorAll('button')){b.disabled=locked;b.setAttribute('aria-pressed',String(Number(b.dataset.mark)===mark));}
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
  const a={from:-1,to:i};if(s.kind==='order-and-chaos')a.mark=mark;
  if(add(a)){save();render();announce();schedule();}else message(C.illegal);return;
 }
 if(selected>=0&&E.destinations(s,selected).includes(i)){add({from:selected,to:i});save();render();announce();schedule();return;}
 if(selected===i){selected=-1;hint=null;render();announce();return;}
 if(E.destinations(s,i).length){selected=i;hint=null;render();message('Choose a marked forward knight destination for '+coord(i)+'.');}else message('Select one of your movable knights.');
}
function takeBack(){
 if(paused)return;stopAI();let root=null;
 while(history.length){root=history.pop();if(settings.mode==='local'||root.state.turn===settings.human)break;}
 if(!root)return;s=root.state;steps=steps.slice(0,root.count);notes=notes.slice(0,root.count);selected=-1;hint=null;save();render();message('Turn taken back. '+player(s.turn)+' to play.');schedule();
}
function cancel(){if(paused||thinking||!isHuman()||s.result)return;selected=-1;hint=null;render();announce();}
function newMatch(){stopAI();settings={mode:$('#mode').value,human:Number($('#side').value),level:$('#level').value};s=E.initial(C.slug);steps=[];history=[];notes=[];selected=-1;hint=null;mark=1;paused=false;save();render();announce();schedule();}
$('#board').addEventListener('click',e=>{const cell=e.target.closest('[data-cell]');if(cell)clickCell(Number(cell.dataset.cell));});
$('#board').addEventListener('keydown',e=>{
 const cell=e.target.closest('[data-cell]');if(!cell)return;const i=Number(cell.dataset.cell),r=Math.floor(i/s.w),c=i%s.w;let j=i;
 if(e.key==='Escape'){e.preventDefault();cancel();return;}
 if(e.key==='ArrowLeft'&&c>0)j--;else if(e.key==='ArrowRight'&&c<s.w-1)j++;else if(e.key==='ArrowUp'&&r>0)j-=s.w;else if(e.key==='ArrowDown'&&r<s.h-1)j+=s.w;else return;
 e.preventDefault();$('#board').querySelector('[data-cell="'+j+'"]').focus();
});
$('#mark-choice').addEventListener('click',e=>{const b=e.target.closest('[data-mark]');if(!b||paused||thinking||s.result||!isHuman())return;mark=Number(b.dataset.mark);hint=null;render();message((mark===1?'X':'O')+' selected. Both roles may place either mark.');});
$('#new').addEventListener('click',newMatch);$('#undo').addEventListener('click',takeBack);$('#cancel').addEventListener('click',cancel);
$('#hint').addEventListener('click',()=>{if(paused||thinking||s.result||!isHuman())return;hint=E.plan(s,'tactical')[0];if(!hint)return;selected=hint.from;if(hint.mark)mark=hint.mark;render();message('Computer suggestion: '+describe(s,hint)+'. '+C.aiNote);});
$('#pause').addEventListener('click',()=>{if(s.result)return;paused=!paused;stopAI();render();if(paused)message('Match paused.');else{announce();schedule();}});$('#resume').addEventListener('click',()=>$('#pause').click());
$('#rules-open').addEventListener('click',()=>$('#rules').showModal());$('#rules-close').addEventListener('click',()=>$('#rules').close());
$('#clear').addEventListener('click',()=>{if(confirm('Clear only this game’s saved match?')){try{localStorage.removeItem(KEY);}catch{}newMatch();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAI();render();save();}else schedule();});window.addEventListener('pagehide',save);
restore();initBoard();$('#mode').value=settings.mode;$('#side').value=String(settings.human);$('#level').value=settings.level;save();render();if(initialMessage)message(initialMessage);else announce();schedule();
window.BoardApp=Object.freeze({key:KEY,snapshot:()=>JSON.parse(JSON.stringify({state:s,settings,steps,selected,mark,thinking,paused,historyLength:history.length}))});
})();
