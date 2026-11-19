/* Abalone. Original code, MIT; see LICENSE. */
/* Abalone: hexagonal push-out board game, hot-seat, rules and controller. Original code, MIT; see LICENSE. */
(function(){
'use strict';
const R=4;
const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
const k2=(q,r)=>q+','+r;
const parse=s=>s.split(',').map(Number);
const onBoard=(q,r)=>Math.abs(q)<=R&&Math.abs(r)<=R&&Math.abs(q+r)<=R;
const CELLS=[];for(let r=-R;r<=R;r++)for(let q=-R;q<=R;q++)if(onBoard(q,r))CELLS.push([q,r]);
const other=c=>c==='b'?'w':'b';
const WIN=6;

function startBoard(){
  const b={};
  for(const[q,r]of [[0,-4],[1,-4],[2,-4],[3,-4],[4,-4],[-1,-3],[0,-3],[1,-3],[2,-3],[3,-3],[4,-3],[-2,-2],[-1,-2],[0,-2]])b[k2(q,r)]='b';
  for(const[q,r]of [[0,4],[-1,4],[-2,4],[-3,4],[-4,4],[1,3],[0,3],[-1,3],[-2,3],[-3,3],[-4,3],[2,2],[1,2],[0,2]])b[k2(q,r)]='w';
  return b;
}
function isLine(cells){
  const n=cells.length;if(n<=1)return true;
  const set=new Set(cells.map(([q,r])=>k2(q,r)));
  for(const[q,r]of cells)for(const[dq,dr]of DIRS){
    let ok=true;
    for(let i=0;i<n&&ok;i++){if(!set.has(k2(q+i*dq,r+i*dr)))ok=false;}
    if(ok)return true;
  }
  return false;
}
function lineDir(cells){
  if(cells.length<2)return null;
  for(const[q,r]of cells)for(const[dq,dr]of DIRS){
    const set=new Set(cells.map(([a,b])=>k2(a,b)));let ok=true;
    for(let i=0;i<cells.length&&ok;i++)if(!set.has(k2(q+i*dq,r+i*dr)))ok=false;
    if(ok)return[dq,dr];
  }
  return null;
}
// Attempt a move of the selected marbles in direction e. Returns {board, pushed} or null.
function tryMove(board,turn,sel,e){
  if(!sel.length||sel.some(([q,r])=>board[k2(q,r)]!==turn))return null;
  const[eq,er]=e;
  const b={...board};
  const d=lineDir(sel);
  const inline=d&&((d[0]===eq&&d[1]===er)||(d[0]===-eq&&d[1]===-er));
  if(!inline){
    // broadside or single marble: every destination must be empty
    for(const[q,r]of sel){const t=k2(q+eq,r+er);if(!onBoard(q+eq,r+er)||b[t])return null;}
    for(const[q,r]of sel)delete b[k2(q,r)];
    for(const[q,r]of sel)b[k2(q+eq,r+er)]=turn;
    return {board:b,pushed:0};
  }
  // inline: the front marble is the one furthest along e
  const front=sel.reduce((best,c)=>(c[0]*eq+c[1]*er)>(best[0]*eq+best[1]*er)?c:best);
  let fq=front[0]+eq,fr=front[1]+er;
  if(!onBoard(fq,fr))return null;
  if(b[k2(fq,fr)]===turn)return null;
  const run=[];
  while(onBoard(fq,fr)&&b[k2(fq,fr)]&&b[k2(fq,fr)]!==turn){run.push([fq,fr]);fq+=eq;fr+=er;}
  if(!run.length){
    if(b[k2(fq,fr)])return null;
    // shift the whole line into the empty cell ahead
    for(const[q,r]of sel)delete b[k2(q,r)];
    for(const[q,r]of sel)b[k2(q+eq,r+er)]=turn;
    return {board:b,pushed:0};
  }
  if(sel.length<=run.length)return null;
  // beyond the opposing run: empty cell or off board (push out)
  let pushed=0;
  if(onBoard(fq,fr)){if(b[k2(fq,fr)])return null;}
  else pushed=1;
  // shift opposing run first, from the far end
  for(const[q,r]of run)delete b[k2(q,r)];
  for(const[q,r]of sel)delete b[k2(q,r)];
  for(const[q,r]of run){const nq=q+eq,nr=r+er;if(onBoard(nq,nr))b[k2(nq,nr)]=other(turn);}
  for(const[q,r]of sel)b[k2(q+eq,r+er)]=turn;
  return {board:b,pushed};
}
function counts(board){let b=0,w=0;for(const v of Object.values(board)){if(v==='b')b++;else w++;}return{b,w};}
const LOGIC={R,DIRS,CELLS,startBoard,isLine,lineDir,tryMove,counts,onBoard,k2,parse,WIN};
if(typeof window!=='undefined')window.MarblePushLogic=LOGIC;
if(typeof document==='undefined')return;

// ---------- controller ----------
const $=s=>document.querySelector(s);
const SVGNS='http://www.w3.org/2000/svg';
let game;
function fresh(){game={board:startBoard(),turn:'b',captured:{b:0,w:0},history:[],sel:[],over:null,plies:0,since:0,last:null};render();msg('Black to move. Select 1–3 marbles in a line, then click a neighbouring cell.');}
function msg(t){$('#message').textContent=t;}
function selIndex(q,r){return game.sel.findIndex(([a,b])=>a===q&&b===r);}
function clickCell(q,r){
  if(game.over)return;
  const v=game.board[k2(q,r)];
  if(v===game.turn){
    const i=selIndex(q,r);
    if(i>=0){game.sel.splice(i,1);}
    else if(game.sel.length===0)game.sel=[[q,r]];
    else if(game.sel.length<3){const cand=[...game.sel,[q,r]];if(isLine(cand))game.sel=cand;else{game.sel=[[q,r]];}}
    else game.sel=[[q,r]];
    render();return;
  }
  if(!game.sel.length){msg('Select your own marbles first.');return;}
  // try moves from any selected marble that neighbours the clicked cell
  for(const[sq,sr]of game.sel){
    const e=[q-sq,r-sr];
    if(!DIRS.some(([a,b])=>a===e[0]&&b===e[1]))continue;
    const res=tryMove(game.board,game.turn,game.sel,e);
    if(res){commit(res,e);return;}
  }
  msg('That move is not allowed from this selection.');
}
function commit(res,e){
  game.history.push({board:game.board,turn:game.turn,captured:{...game.captured},last:game.last,since:game.since});
  game.board=res.board;
  if(res.pushed)game.captured[game.turn]+=res.pushed;
  game.since=res.pushed?0:game.since+1;
  game.last=game.sel.map(([q,r])=>[q+e[0],r+e[1]]);
  game.sel=[];
  game.plies++;
  if(game.captured[game.turn]>=WIN){game.over=(game.turn==='b'?'Black':'White')+' wins by pushing six marbles out.';}
  else if(game.since>=100){game.over='Draw: 100 moves without a marble pushed out.';}
  else game.turn=other(game.turn);
  msg(game.over?game.over:(game.turn==='b'?'Black':'White')+' to move.');
  render();
}
function undo(){
  if(!game.history.length)return;
  const h=game.history.pop();
  Object.assign(game,{board:h.board,turn:h.turn,captured:h.captured,last:h.last,since:h.since,sel:[],over:null});
  game.plies=Math.max(0,game.plies-1);
  render();msg('Undid the last move.');
}
function pos(q,r){const s=26;return[s*Math.sqrt(3)*(q+r/2),s*1.5*r];}
function render(){
  const svg=$('#svg');svg.innerHTML='';
  const targets=new Set();
  if(game.sel.length&&!game.over){
    for(const[sq,sr]of game.sel)for(const[dq,dr]of DIRS){
      const tq=sq+dq,tr=sr+dr;const key=k2(tq,tr);
      if(!onBoard(tq,tr)||targets.has(key))continue;
      if(game.sel.some(([a,b])=>a===tq&&b===tr))continue;
      if(tryMove(game.board,game.turn,game.sel,[dq,dr]))targets.add(key);
    }
  }
  const lastSet=new Set((game.last||[]).map(([q,r])=>k2(q,r)));
  for(const[q,r]of CELLS){
    const[x,y]=pos(q,r);const key=k2(q,r);
    const g=document.createElementNS(SVGNS,'g');
    g.setAttribute('transform','translate('+(x+200)+','+(y+200)+')');
    const hex=document.createElementNS(SVGNS,'circle');
    hex.setAttribute('r','12.5');hex.setAttribute('class','cell'+(lastSet.has(key)?' last':''));
    g.appendChild(hex);
    const v=game.board[key];
    if(v){const m=document.createElementNS(SVGNS,'circle');m.setAttribute('r','10.5');m.setAttribute('class','marble '+(v==='b'?'black':'white'));g.appendChild(m);}
    if(game.sel.some(([a,b])=>a===q&&b===r)){const s=document.createElementNS(SVGNS,'circle');s.setAttribute('r','13.5');s.setAttribute('class','selected');g.appendChild(s);}
    if(targets.has(key)){const t=document.createElementNS(SVGNS,'circle');t.setAttribute('r','5');t.setAttribute('class','target');g.appendChild(t);}
    const hit=document.createElementNS(SVGNS,'circle');hit.setAttribute('r','14');hit.setAttribute('class','hit');hit.setAttribute('data-q',String(q));hit.setAttribute('data-r',String(r));
    hit.setAttribute('role','button');hit.setAttribute('tabindex','0');
    hit.setAttribute('aria-label','Cell '+(q)+','+(r)+(v?', '+(v==='b'?'black':'white')+' marble':', empty'));
    g.appendChild(hit);
    svg.appendChild(g);
  }
  $('#score').textContent='Pushed out: Black '+game.captured.b+' · White '+game.captured.w+' (six wins)';
  $('#turn').textContent=game.over?'Game over':(game.turn==='b'?'Black':'White')+' to move';
  $('#undo').disabled=!game.history.length;
  $('#clear').disabled=!game.sel.length;
}
$('#svg').addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('.hit');if(!h)return;clickCell(+h.dataset.q,+h.dataset.r);});
$('#svg').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const h=e.target.closest&&e.target.closest('.hit');if(!h)return;e.preventDefault();clickCell(+h.dataset.q,+h.dataset.r);});
$('#new').onclick=fresh;
$('#undo').onclick=undo;
$('#clear').onclick=()=>{game.sel=[];render();msg('Selection cleared.');};
fresh();
})();
