/* Original accessible match controller. MIT; see LICENSE. */
(function(){
'use strict';
const E=window.BoardEngine,C=window.GAME_CONFIG,$=q=>document.querySelector(q),KEY='dragon-gaming.'+C.slug+'.v1';
const defaults={mode:'computer',human:1,level:'perfect',setup:1};
let settings={...defaults},s=E.initial(C.slug),steps=[],history=[],notes=[],selected=-1,hint=null,paused=false,thinking=false,token=0,timer=null,storageMessage='',initialMessage='',analysis='';
const player=n=>C.players[n-1];
function message(text){$('#message').textContent=text;}
function isHuman(){return settings.mode==='local'||s.turn===settings.human;}
function stopAI(){token++;clearTimeout(timer);timer=null;thinking=false;}
function validSettings(v){return v&&['computer','local'].includes(v.mode)&&[1,2].includes(v.human)&&['casual','perfect'].includes(v.level)&&Number.isInteger(v.setup)&&v.setup>=0&&v.setup<=2;}
function add(a){const next=E.apply(s,a);if(!next)return false;history.push({state:s,count:steps.length});notes.push(player(s.turn)+': '+E.describe(s,a));steps.push({from:a.from,to:a.to});s=next;selected=-1;hint=null;analysis='';return true;}
function restore(){
 try{const raw=localStorage.getItem(KEY);if(!raw)return;const v=JSON.parse(raw);
  if(!v||v.version!==1||!validSettings(v.settings)||!Array.isArray(v.steps)||v.steps.length>300)throw Error('Invalid match');
  settings={...v.settings};s=E.initial(C.slug,settings.setup);for(const a of v.steps)if(!add(a))throw Error('Illegal replay');initialMessage='Saved match restored.';
 }catch(e){settings={...defaults};s=E.initial(C.slug);steps=[];notes=[];history=[];initialMessage=e.name==='SecurityError'?'Local storage is unavailable. You can still play.':'Saved match was invalid; a fresh match is ready.';}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,settings,steps}));storageMessage='Match saved only in this browser.';}catch{storageMessage='Storage unavailable. This visit still works.';}$('#storage').textContent=storageMessage;}
function button(label,index,locked){const n=document.createElement('button');n.type='button';n.className='slot';n.dataset.cell=index;n.disabled=locked;n.setAttribute('aria-pressed',String(selected===index));n.classList.toggle('selected',selected===index);n.classList.toggle('hint-source',hint?.from===index);n.setAttribute('aria-label',label);return n;}
function render(){
 const locked=paused||thinking||!!s.result||!isHuman(),legal=E.actions(s),sources=new Set(legal.map(a=>a.from)),destinations=new Set(legal.filter(a=>a.from===selected).map(a=>a.to));
 const board=$('#board');board.replaceChildren();board.className=(s.kind==='wythoffs-game'||s.kind==='grundys-game')?'heaps':'strip';
 const n=s.kind==='wythoffs-game'?3:s.board.length;
 for(let i=0;i<n;i++){
  let text,label;
  if(s.kind==='wythoffs-game'){text=i===2?'Both heaps':String(s.board[i]);label=i===2?'Select both heaps, remove the same positive amount from each':'Heap '+(i+1)+': '+s.board[i]+' counters';}
  else if(s.kind==='grundys-game'){text=String(s.board[i]);label='Heap '+(i+1)+': '+s.board[i]+' counters'+(s.board[i]<3?', cannot split':'');}
  else if(s.kind==='silver-dollar'){text=s.board[i]?'●':'·';label='Square '+(i+1)+': '+(s.board[i]?'shared coin':'empty');}
  else if(s.kind==='turning-turtles'){text=s.board[i]?'H':'T';label='Coin '+(i+1)+': '+(s.board[i]?'heads':'tails');}
  else{text=s.board[i]===1?'T →':s.board[i]===2?'← F':'·';label='Square '+(i+1)+': '+(s.board[i]===1?'Blue toad, moves right':s.board[i]===2?'Amber frog, moves left':'empty');}
  const node=button(label,i,locked);node.dataset.value=s.board[i]??0;node.classList.toggle('movable',sources.has(i));node.classList.toggle('destination',selected>=0&&destinations.has(i));node.classList.toggle('hint-destination',hint?.to===i&&s.kind!=='wythoffs-game'&&s.kind!=='grundys-game');
  if(selected>=0&&destinations.has(i))node.setAttribute('aria-label',label+', legal destination');
  const title=document.createElement('small');title.textContent=s.kind==='wythoffs-game'?(i===2?'Equal removal':'Heap '+(i+1)):s.kind==='grundys-game'?'Heap '+(i+1):String(i+1);
  const value=document.createElement('strong');value.textContent=text;node.append(title,value);board.append(node);
 }
 $('#board').setAttribute('aria-label',C.name+'. '+(s.result?'Match finished.':player(s.turn)+' to play.'));
 $('#choices').replaceChildren();
 const choices=legal.filter(a=>a.from===selected);
 for(const a of choices){const node=document.createElement('button');node.type='button';node.dataset.from=a.from;node.dataset.to=a.to;node.textContent=E.describe(s,a);node.disabled=locked;node.classList.toggle('hint',hint?.from===a.from&&hint?.to===a.to);$('#choices').append(node);}
 $('#choices').scrollTop=0;const hintButton=$('#choices .hint');if(hintButton)$('#choices').scrollTop=Math.max(0,hintButton.offsetTop-$('#choices').clientHeight/2);
 $('#selection').textContent=selected<0?C.selectPrompt:'Choose one action below'+(board.className==='strip'?' or a highlighted destination.':'.');
 $('#object-count').textContent=s.kind==='grundys-game'?s.board.length:s.kind==='wythoffs-game'?s.board[0]+s.board[1]:s.board.filter(v=>v>0).length;
 $('#legal-count').textContent=legal.length;$('#turn-count').textContent=s.ply;$('#setup-label').textContent=C.setups[settings.setup];
 $('#phase').textContent=s.result?'Match finished':paused?'Match paused':thinking?'Computer is thinking…':player(s.turn)+' to play';$('#phase').dataset.player=s.turn;
 $('#mode-label').textContent=settings.mode==='local'?'Local two-player':'You: '+player(settings.human)+' · '+settings.level+' computer';
 $('#undo').disabled=paused||!history.some(v=>settings.mode==='local'||v.state.turn===settings.human);$('#cancel').disabled=locked||(selected<0&&!hint);$('#hint').disabled=locked;$('#analyze').disabled=paused||thinking||!!s.result;
 $('#pause').disabled=!!s.result;$('#pause').textContent=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#pause-cover').hidden=!paused;
 $('#result').hidden=!s.result;if(s.result){$('#result-title').textContent=player(s.result.winner)+' wins';$('#result-detail').textContent=s.result.reason;}
 $('#analysis').textContent=analysis;$('#storage').textContent=storageMessage;$('#log').replaceChildren();for(const text of notes.slice(-12)){const li=document.createElement('li');li.textContent=text;$('#log').append(li);}
}
function announce(){message(s.result?player(s.result.winner)+' wins. '+s.result.reason:C.prompt);}
function schedule(){
 if(s.result||paused||isHuman()||document.hidden||thinking)return;
 thinking=true;const ticket=++token;render();message('Computer is choosing a legal move…');
 timer=setTimeout(()=>{if(ticket!==token||paused)return;try{const seq=E.plan(s,settings.level);if(!seq.length||!add(seq[0]))throw Error('Invalid turn');thinking=false;save();render();announce();}catch{thinking=false;render();message('The computer could not move. Restart or switch to local play.');}},220);
}
function play(a){if(paused||thinking||s.result||!isHuman())return;if(!add(a)){message('That action is not legal. '+C.prompt);return;}save();render();announce();schedule();}
function choose(i){
 if(paused||thinking||s.result||!isHuman())return;
 if(selected>=0&&s.kind!=='wythoffs-game'&&s.kind!=='grundys-game'&&E.actions(s).some(a=>a.from===selected&&a.to===i)){play({from:selected,to:i});return;}
 if(selected===i){cancel();return;}
 if(!E.actions(s).some(a=>a.from===i)){message(C.selectPrompt);return;}
 selected=i;hint=null;render();message('Selection ready. Choose an action to commit the move.');
 if(s.kind==='wythoffs-game'||s.kind==='grundys-game')$('#choices button')?.focus();else $('#board [data-cell="'+i+'"]').focus();
}
function cancel(){if(paused||thinking||s.result||!isHuman())return;selected=-1;hint=null;render();announce();}
function takeBack(){
 if(paused)return;stopAI();let root=null;while(history.length){root=history.pop();if(settings.mode==='local'||root.state.turn===settings.human)break;}
 if(!root)return;s=root.state;steps=steps.slice(0,root.count);notes=notes.slice(0,root.count);selected=-1;hint=null;analysis='';save();render();message('Move taken back. '+player(s.turn)+' to play.');schedule();
}
function newMatch(){stopAI();settings={mode:$('#mode').value,human:Number($('#side').value),level:$('#level').value,setup:Number($('#setup').value)};s=E.initial(C.slug,settings.setup);steps=[];history=[];notes=[];selected=-1;hint=null;analysis='';paused=false;save();render();announce();schedule();}
$('#board').addEventListener('click',e=>{const n=e.target.closest('[data-cell]');if(n)choose(Number(n.dataset.cell));});
$('#choices').addEventListener('click',e=>{const n=e.target.closest('[data-from]');if(n)play({from:Number(n.dataset.from),to:Number(n.dataset.to)});});
$('#board').addEventListener('keydown',e=>{const n=e.target.closest('[data-cell]');if(!n)return;if(e.key==='Escape'){e.preventDefault();cancel();return;}const i=Number(n.dataset.cell),d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;const target=$('#board [data-cell="'+(i+d)+'"]');if(target){e.preventDefault();target.focus();}});
$('#choices').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancel();}});
$('#new').addEventListener('click',newMatch);$('#undo').addEventListener('click',takeBack);$('#cancel').addEventListener('click',cancel);
$('#hint').addEventListener('click',()=>{if(paused||thinking||s.result||!isHuman())return;hint=E.plan(s,'perfect')[0];if(!hint)return;selected=hint.from;render();message('Perfect-play suggestion: '+E.describe(s,hint)+'. '+(E.winning(s)?'This preserves a forced win.':'No forced win exists against perfect defense; this is a legal move.'));});
$('#analyze').addEventListener('click',()=>{if(paused||thinking||s.result)return;analysis=player(s.turn)+(E.winning(s)?' can force a win with perfect play.':' loses against perfect defense, but an opponent mistake can change this.')+' '+C.method;render();});
$('#pause').addEventListener('click',()=>{if(s.result)return;paused=!paused;stopAI();render();if(paused)message('Match paused.');else{announce();schedule();}});$('#resume').addEventListener('click',()=>$('#pause').click());
$('#rules-open').addEventListener('click',()=>$('#rules').showModal());$('#rules-close').addEventListener('click',()=>$('#rules').close());
$('#clear').addEventListener('click',()=>{if(confirm('Clear only this game’s saved match?')){try{localStorage.removeItem(KEY);}catch{}newMatch();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAI();render();save();}else schedule();});window.addEventListener('pagehide',save);
restore();for(const k of ['mode','side','level','setup'])$('#'+k).value=String(k==='side'?settings.human:settings[k]);save();render();if(initialMessage)message(initialMessage);else announce();schedule();
window.BoardApp=Object.freeze({key:KEY,snapshot:()=>JSON.parse(JSON.stringify({state:s,settings,steps,selected,hint,thinking,paused,historyLength:history.length}))});
})();
