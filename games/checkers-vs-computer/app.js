/* Checkers vs Computer. Original code, MIT; see LICENSE. */
/* Checkers vs Computer: rules, computer player and board controller. Original code, MIT; see LICENSE. */
(function(){
'use strict';
const N=8;
const DIRS=[[1,1],[1,-1],[-1,1],[-1,-1]];
const inside=(r,c)=>r>=0&&r<N&&c>=0&&c<N;
const colorOf=p=>p.toLowerCase();
const isKing=p=>p!==''&&p===p.toUpperCase();
const fwd=color=>color==='r'?-1:1;
const other=color=>color==='r'?'b':'r';
const promoRow=color=>color==='r'?0:N-1;
const clone=b=>b.map(row=>row.slice());
const key=(r,c)=>r+','+c;

function startBoard(){
  const b=Array.from({length:N},()=>Array(N).fill(''));
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    if((r+c)%2!==1)continue;
    if(r<3)b[r][c]='b';else if(r>4)b[r][c]='r';
  }
  return b;
}
function jumpSearch(bb,r,c,color,path,caps,out){
  let extended=false;
  for(const[dr,dc]of DIRS){
    const mr=r+dr,mc=c+dc,lr=r+2*dr,lc=c+2*dc;
    if(!inside(lr,lc))continue;
    const m=bb[mr][mc];
    if(!m||colorOf(m)===color)continue;
    if(caps.some(([a,b])=>a===mr&&b===mc))continue;
    if(bb[lr][lc]!==''&&!(lr===path[0][0]&&lc===path[0][1]))continue;
    extended=true;
    jumpSearch(bb,lr,lc,color,[...path,[lr,lc]],[...caps,[mr,mc]],out);
  }
  if(!extended&&caps.length)out.push({path,caps});
}
// Legal moves for a colour. Capturing is mandatory; a player who can capture must take a capture sequence.
function legalMoves(b,color){
  const captures=[],simple=[];
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const p=b[r][c];if(!p||colorOf(p)!==color)continue;
    const bb=clone(b);bb[r][c]='';
    const found=[];
    jumpSearch(bb,r,c,color,[[r,c]],[],found);
    for(const f of found)captures.push({from:[r,c],path:f.path,caps:f.caps,piece:p});
    const dirs=isKing(p)?DIRS:DIRS.filter(([dr])=>dr===fwd(color));
    for(const[dr,dc]of dirs){const nr=r+dr,nc=c+dc;if(inside(nr,nc)&&b[nr][nc]==='')simple.push({from:[r,c],path:[[r,c],[nr,nc]],caps:[],piece:p});}
  }
  return captures.length?captures:simple;
}
function applyMove(b,mv){
  const nb=clone(b);
  const[fr,fc]=mv.from;let p=nb[fr][fc];
  nb[fr][fc]='';
  for(const[r,c]of mv.caps)nb[r][c]='';
  const[er,ec]=mv.path[mv.path.length-1];
  if(!isKing(p)&&er===promoRow(colorOf(p)))p=p.toUpperCase();
  nb[er][ec]=p;
  return nb;
}
const VALUE={man:100,king:160};
function evalFor(b,color){
  let s=0;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const p=b[r][c];if(!p)continue;
    const mine=colorOf(p)===color;
    const adv=color==='b'?r:N-1-r;
    let v=isKing(p)?VALUE.king:VALUE.man+adv*4;
    if(!isKing(p)&&r>=2&&r<=5&&c>=2&&c<=5)v+=3;
    s+=mine?v:-v;
  }
  return s;
}
function negamax(b,color,depth,alpha,beta,ply){
  const moves=legalMoves(b,color);
  if(!moves.length)return -(100000-ply);
  if(depth===0)return evalFor(b,color);
  let best=-Infinity;
  for(const mv of moves){
    const v=-negamax(applyMove(b,mv),other(color),depth-1,-beta,-alpha,ply+1);
    if(v>best)best=v;
    if(best>alpha)alpha=best;
    if(alpha>=beta)break;
  }
  return best;
}
const DEPTH={easy:2,medium:4,hard:5};
function computerMove(b,color,level,rand=Math.random){
  const moves=legalMoves(b,color);
  if(!moves.length)return null;
  const depth=DEPTH[level]||DEPTH.medium;
  let best=-Infinity,choices=[];
  for(const mv of moves){
    const v=-negamax(applyMove(b,mv),other(color),depth-1,-Infinity,Infinity,1);
    if(v>best){best=v;choices=[mv];}else if(v===best)choices.push(mv);
  }
  return choices[Math.floor(rand()*choices.length)];
}
const LOGIC={N,startBoard,legalMoves,applyMove,computerMove,evalFor,DEPTH,key};
if(typeof window!=='undefined')window.CheckersLogic=LOGIC;
if(typeof document==='undefined')return;

// ---------- controller ----------
const $=s=>document.querySelector(s);
const SYMBOL={r:'●',b:'●',R:'♛',B:'♛'};
let st,history,selected=null,targets=[],busy=false,last=null;
function newGame(){
  st={board:startBoard(),turn:'r',over:null};history=[];selected=null;targets=[];busy=false;last=null;
  $('#difficulty').disabled=false;
  render();setMsg('Your move. Red is you and moves up the board; capturing is mandatory.');
}
function setMsg(t){$('#message').textContent=t;}
function endCheck(){
  const moves=legalMoves(st.board,st.turn);
  if(!moves.length){st.over=st.turn==='r'?'Computer wins: you have no legal moves.':'You win: the computer has no legal moves.';return true;}
  return false;
}
function humanClick(r,c){
  if(busy||st.over||st.turn!=='r')return;
  const p=st.board[r][c];
  const moves=legalMoves(st.board,'r');
  if(p&&colorOf(p)==='r'){
    const mine=moves.filter(m=>m.from[0]===r&&m.from[1]===c);
    selected=[r,c];
    targets=mine;
    if(!mine.length)setMsg(moves.some(m=>m.caps.length)?'That piece has no capture; a capture elsewhere is mandatory.':'That piece has no legal move.');
    else setMsg('Choose a highlighted square.');
    render();return;
  }
  if(!selected)return;
  const chosen=targets.filter(m=>m.path[m.path.length-1][0]===r&&m.path[m.path.length-1][1]===c);
  if(!chosen.length){selected=null;targets=[];setMsg('Not a legal destination.');render();return;}
  chosen.sort((a,b)=>b.caps.length-a.caps.length);
  playHuman(chosen[0]);
}
function playHuman(mv){
  history.push({board:st.board,turn:st.turn,last});
  last=mv.path;
  st.board=applyMove(st.board,mv);
  selected=null;targets=[];
  st.turn='b';
  if(endCheck()){render();setMsg(st.over);return;}
  busy=true;setMsg('Computer is thinking…');render();
  setTimeout(computerTurn,60);
}
function computerTurn(){
  const level=$('#difficulty').value;
  const mv=computerMove(st.board,'b',level);
  if(!mv){st.over='You win: the computer has no legal moves.';busy=false;render();setMsg(st.over);return;}
  history.push({board:st.board,turn:st.turn,last});
  last=mv.path;
  st.board=applyMove(st.board,mv);
  st.turn='r';busy=false;
  if(endCheck()){render();setMsg(st.over);return;}
  render();setMsg('Your move.');
}
function undo(){
  if(busy||!history.length)return;
  // rewind to the player's previous turn
  let snap=history.pop();
  while(snap&&snap.turn!=='r'&&history.length)snap=history.pop();
  if(!snap)return;
  st.board=snap.board;st.turn=snap.turn;last=snap.last;st.over=null;selected=null;targets=[];
  render();setMsg('Undid the last move.');
}
function render(){
  const b=$('#board');b.innerHTML='';
  const hit=new Set(targets.map(m=>key(...m.path[m.path.length-1])));
  const pathSet=new Set((last||[]).map(([r,c])=>key(r,c)));
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const dark=(r+c)%2===1;
    const cell=document.createElement('button');
    cell.type='button';
    cell.className='sq '+(dark?'dark':'light');
    const p=st.board[r][c];
    const k=key(r,c);
    if(selected&&selected[0]===r&&selected[1]===c)cell.classList.add('sel');
    if(hit.has(k))cell.classList.add('target');
    if(pathSet.has(k))cell.classList.add('last');
    if(p){
      const piece=document.createElement('span');
      piece.className='piece '+(colorOf(p)==='r'?'red':'black')+(isKing(p)?' king':'');
      piece.textContent=isKing(p)?'♛':'';
      cell.appendChild(piece);
    }
    const name=(p?(colorOf(p)==='r'?'Red':'Black')+(isKing(p)?' king':' piece')+' ':'Empty ')+'square '+String.fromCharCode(97+c)+(8-r);
    cell.setAttribute('aria-label',name);
    cell.disabled=!dark||!!st.over||busy||st.turn!=='r';
    cell.onclick=()=>humanClick(r,c);
    b.appendChild(cell);
  }
  $('#undo').disabled=!history.length||busy;
  const red=[].concat(...st.board).filter(x=>colorOf(x)==='r').length;
  const black=[].concat(...st.board).filter(x=>colorOf(x)==='b').length;
  $('#count').textContent='Red '+red+' · Black '+black;
}
$('#new').onclick=newGame;
$('#undo').onclick=undo;
newGame();
})();
