/* Original board collection controller. MIT; see LICENSE. */
(function(){
'use strict';
const E=window.BoardEngine,C=window.GAME_CONFIG,$=s=>document.querySelector(s),KEY='dragon-gaming.'+C.slug+'.v1';
const defaults={mode:'computer',human:1,level:'tactical'};
let settings={...defaults},s=E.initial(C.slug),steps=[],history=[],notes=[],selected=-1,suggestion=[],paused=false,thinking=false,token=0,timer=null,storageMessage='',initialMessage='';
const player=n=>n===1?'Blue':'Amber';
const coord=i=>String.fromCharCode(97+i%s.w)+(s.h-Math.floor(i/s.w));
function validSettings(v){return v&&['computer','local'].includes(v.mode)&&[1,2].includes(v.human)&&['casual','tactical'].includes(v.level)}
function message(text){$('#message').textContent=text}
function stopAI(){token++;clearTimeout(timer);timer=null;thinking=false}
function add(a){const next=E.apply(s,a);if(!next)return false;if(s.phase==='move')history.push({state:s,count:steps.length});notes.push(player(s.turn)+(s.kind==='kayles'?' removes '+coord(a.from)+(a.from===a.to?'':' + '+coord(a.to)):a.from<0?' places '+coord(a.to):' '+coord(a.from)+' → '+coord(a.to)));steps.push({from:a.from,to:a.to});s=next;selected=-1;suggestion=[];return true}
function restore(){try{const raw=localStorage.getItem(KEY);if(!raw)return;const v=JSON.parse(raw);if(!v||v.version!==1||!validSettings(v.settings)||!Array.isArray(v.steps)||v.steps.length>1000)throw Error('Invalid match');settings={...v.settings};for(const a of v.steps)if(!add(a))throw Error('Illegal replay');initialMessage='Saved match restored.'}catch(e){s=E.initial(C.slug);steps=[];notes=[];history=[];settings={...defaults};initialMessage=e.name==='SecurityError'?'Local storage is unavailable. You can still play.':'Saved match was invalid; a fresh match is ready.'}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,settings,steps}));storageMessage='Match saved only in this browser.'}catch{storageMessage='Storage unavailable. This visit still works.'}$('#storage').textContent=storageMessage}
function isHuman(){return settings.mode==='local'||s.turn===settings.human}
function targets(){return E.isPlacement(s)?E.actions(s).map(a=>a.to):selected<0?[]:E.destinations(s,selected)}
function render(){
 const legal=new Set(targets()),hintTo=suggestion[0]?.to,last=steps[steps.length-1]?.to,locked=paused||thinking||!!s.result||!isHuman();
 $('#board').style.setProperty('--cols',String(s.w));$('#columns').style.setProperty('--cols',String(s.w));
 const board=$('#board');if(board.children.length!==s.board.length){board.replaceChildren();for(let i=0;i<s.board.length;i++){const cell=document.createElement('button');cell.type='button';cell.dataset.cell=String(i);cell.className='cell';board.append(cell)}$('#columns').replaceChildren();for(let c=0;c<s.w;c++){const n=document.createElement('span');n.textContent=String.fromCharCode(97+c);$('#columns').append(n)}}
 for(const cell of board.children){const i=Number(cell.dataset.cell),v=s.board[i];cell.dataset.player=String(v);cell.classList.toggle('dark',(Math.floor(i/s.w)+i%s.w)%2===1);cell.classList.toggle('selected',i===selected||(s.phase!=='move'&&i===s.anchor));cell.classList.toggle('legal',legal.has(i));cell.classList.toggle('hint',i===hintTo);cell.classList.toggle('last',i===last);cell.disabled=locked||v===-1;cell.replaceChildren();
  if(v===1||v===2||v===3){const piece=document.createElement('span');piece.className='piece';piece.textContent=C.piece;piece.setAttribute('aria-hidden','true');if(v!==3){const name=document.createElement('small');name.textContent=v===1?'B':'A';piece.append(name);}cell.append(piece)}else if(v===-1){const block=document.createElement('span');block.className='block';block.textContent='×';block.setAttribute('aria-hidden','true');cell.append(block)}else if(legal.has(i)){const dot=document.createElement('span');dot.className='legal-dot';dot.setAttribute('aria-hidden','true');cell.append(dot)}
  cell.setAttribute('aria-label',coord(i)+': '+(v===0?'empty':v===-1?'outside the playing rows':v===3?C.unit:player(v)+' '+C.unit)+(legal.has(i)?', legal destination':'')+(i===selected?', selected':''));cell.setAttribute('aria-pressed',String(i===selected));
 }
 $('#board').setAttribute('aria-label',C.name+', '+s.h+' rows and '+s.w+' columns. '+(s.result?'Match finished.':player(s.turn)+' to play.'));
 $('#blue-count').textContent=String(E.count(s,1));$('#amber-count').textContent=String(E.count(s,2));$('#open-count').textContent=String(s.board.filter(v=>v===0).length);$('#turn-count').textContent=String(s.ply);
 $('#mode-label').textContent=settings.mode==='local'?'Local two-player':('You: '+player(settings.human)+' · '+settings.level+' computer');
 $('#phase').textContent=s.result?'Match finished':thinking?'Computer is thinking…':paused?'Match paused':player(s.turn)+(E.isPlacement(s)?' · place a '+C.unit:' · choose a '+C.unit);$('#phase').dataset.player=String(s.turn);
 $('#undo').disabled=paused||!history.some(v=>settings.mode==='local'||v.state.turn===settings.human);$('#cancel').disabled=paused||thinking||!isHuman()||!!s.result||(selected<0&&!suggestion.length);$('#hint').disabled=locked;$('#pause').disabled=!!s.result;$('#pause').textContent=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#pause-cover').hidden=!paused;
 $('#result').hidden=!s.result;if(s.result){$('#result-title').textContent=s.result.winner?player(s.result.winner)+' wins':'Draw';$('#result-detail').textContent=s.result.reason}
 $('#log').replaceChildren();for(const text of notes.slice(-12)){const li=document.createElement('li');li.textContent=text;$('#log').append(li)}$('#storage').textContent=storageMessage;
}
function announce(){if(s.result)message((s.result.winner?player(s.result.winner)+' wins. ':'Draw. ')+s.result.reason);else message(E.isPlacement(s)?'Place a '+C.unit+' on a marked cell.':s.kind==='kayles'?'Choose a standing pin, then click it again for one pin or its standing neighbor for two.':'Choose your pawn or stone, then a marked destination.')}
function schedule(){
 if(s.result||paused||isHuman()||document.hidden||thinking)return;
 thinking=true;const ticket=++token;render();message('Computer is choosing a legal turn…');timer=setTimeout(()=>{if(ticket!==token||paused)return;try{const seq=E.plan(s,settings.level);for(const a of seq)if(!add(a))throw Error('Invalid computer turn');thinking=false;save();render();announce();schedule()}catch{thinking=false;render();message('The computer could not move. Restart or switch to local play.')}},220);
}
function clickCell(i){if(paused||thinking||s.result||!isHuman())return;
 if(E.isPlacement(s)){if(add({from:-1,to:i})){save();render();announce();schedule()}else message('That placement is not legal. Choose a marked empty cell.');return}
 if(selected>=0&&E.destinations(s,selected).includes(i)){add({from:selected,to:i});save();render();announce();schedule();return}
 if(i===selected){selected=-1;suggestion=[];render();announce();return}
 if((s.kind==='kayles'?s.board[i]===3:s.board[i]===s.turn)&&E.destinations(s,i).length){selected=i;suggestion=[];render();message(s.kind==='kayles'?'Click this pin again to remove one, or a marked neighboring pin to remove two.':'Choose a marked destination for '+coord(i)+'.')}else message('That is not a movable '+C.unit+'.');
}
function takeBack(){
 if(paused)return;stopAI();let root=null;
 while(history.length){root=history.pop();if(settings.mode==='local'||root.state.turn===settings.human)break}
 if(!root)return;s=root.state;steps=steps.slice(0,root.count);notes=notes.slice(0,root.count);selected=-1;suggestion=[];save();render();message('Turn taken back. '+player(s.turn)+' to play.');schedule();
}
function cancel(){if(paused||thinking||!isHuman()||s.result)return;if(s.phase!=='move')takeBack();else{selected=-1;suggestion=[];render();announce()}}
function newMatch(){stopAI();settings={mode:$('#mode').value,human:Number($('#side').value),level:$('#level').value};s=E.initial(C.slug);steps=[];notes=[];history=[];selected=-1;suggestion=[];paused=false;save();render();announce();schedule()}
$('#board').addEventListener('click',e=>{const cell=e.target.closest('[data-cell]');if(cell)clickCell(Number(cell.dataset.cell))});
$('#board').addEventListener('keydown',e=>{const cell=e.target.closest('[data-cell]');if(!cell)return;const i=Number(cell.dataset.cell),r=Math.floor(i/s.w),c=i%s.w;let j=i;if(e.key==='ArrowLeft'&&c>0)j--;else if(e.key==='ArrowRight'&&c<s.w-1)j++;else if(e.key==='ArrowUp'&&r>0)j-=s.w;else if(e.key==='ArrowDown'&&r<s.h-1)j+=s.w;else if(e.key==='Escape'){e.preventDefault();cancel();return}else return;e.preventDefault();$('#board').children[j].focus()});
$('#new').addEventListener('click',newMatch);$('#undo').addEventListener('click',takeBack);$('#cancel').addEventListener('click',cancel);
$('#hint').addEventListener('click',()=>{if(paused||thinking||s.result||!isHuman())return;suggestion=E.plan(s,'tactical');if(!suggestion.length)return;const a=suggestion[0];selected=s.phase==='move'?a.from:-1;render();message('Computer suggestion: '+(s.kind==='kayles'?'remove '+coord(a.from)+(a.from===a.to?'':' + '+coord(a.to)):a.from>=0?coord(a.from)+' → '+coord(a.to):'place '+coord(a.to))+'. '+C.aiNote)});
$('#pause').addEventListener('click',()=>{if(s.result)return;paused=!paused;stopAI();render();if(paused)message('Match paused.');else{announce();schedule()}});$('#resume').addEventListener('click',()=>$('#pause').click());
$('#rules-open').addEventListener('click',()=>$('#rules').showModal());$('#rules-close').addEventListener('click',()=>$('#rules').close());
$('#clear').addEventListener('click',()=>{if(confirm('Clear only this game’s saved match?')){try{localStorage.removeItem(KEY)}catch{}newMatch()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAI();render();save()}else schedule()});window.addEventListener('pagehide',save);
restore();$('#mode').value=settings.mode;$('#side').value=String(settings.human);$('#level').value=settings.level;save();render();if(initialMessage)message(initialMessage);else announce();schedule();
window.BoardApp=Object.freeze({key:KEY,snapshot:()=>JSON.parse(JSON.stringify({state:s,settings,steps,selected,thinking,paused,historyLength:history.length}))});
})();
