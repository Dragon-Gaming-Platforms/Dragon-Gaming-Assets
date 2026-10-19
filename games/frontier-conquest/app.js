(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const map = $('map');
  const edgeList = [
    [0,1],[0,5],[1,2],[1,6],[2,3],[2,6],[3,4],[3,7],[4,7],[4,8],
    [5,6],[5,9],[6,7],[6,10],[7,8],[7,11],[8,11],[9,10],[10,11],
  ];
  const initial = [
    {name:'Aster',x:95,y:77,region:'Highlands',owner:'you',units:3},
    {name:'Beacon',x:245,y:56,region:'Highlands',owner:'neutral',units:2},
    {name:'Cairn',x:390,y:77,region:'Highlands',owner:'rival',units:2},
    {name:'Delta',x:548,y:77,region:'Highlands',owner:'rival',units:3},
    {name:'Estuary',x:696,y:142,region:'Coast',owner:'rival',units:2},
    {name:'Fern',x:140,y:202,region:'Coast',owner:'you',units:2},
    {name:'Gorge',x:320,y:197,region:'Coast',owner:'neutral',units:1},
    {name:'Harbor',x:510,y:200,region:'Coast',owner:'neutral',units:2},
    {name:'Isle',x:680,y:270,region:'Lowlands',owner:'rival',units:2},
    {name:'Junction',x:96,y:343,region:'Lowlands',owner:'you',units:2},
    {name:'Knoll',x:318,y:347,region:'Lowlands',owner:'you',units:2},
    {name:'Lagoon',x:535,y:348,region:'Lowlands',owner:'neutral',units:1},
  ];
  const regions = {
    Highlands:[0,1,2,3],
    Coast:[4,5,6,7],
    Lowlands:[8,9,10,11],
  };
  let territories=[];
  let phase='reinforce';
  let active='you';
  let reserve=0;
  let selected=-1;
  let round=1;
  let finished=false;
  let logEntries=[];
  let statusText='';
  let aiTimer=0;

  function copyMap(){ return initial.map((t)=>({...t})); }
  function neighbors(index){
    return edgeList.flatMap(([a,b])=>a===index?[b]:b===index?[a]:[]);
  }
  function ownedCount(owner){ return territories.filter((t)=>t.owner===owner).length; }
  function regionBonus(owner){
    return Object.values(regions).reduce((sum,ids)=>sum+(ids.every((id)=>territories[id].owner===owner)?2:0),0);
  }
  function reinforcement(owner){ return Math.max(3,Math.floor(ownedCount(owner)/3))+regionBonus(owner); }
  function note(text){
    logEntries.unshift(text);
    if(logEntries.length>9) logEntries.length=9;
  }
  function setStatus(text){ statusText=text; render(); }
  function ownerLabel(owner){ return owner==='you'?'Your':owner==='rival'?'Rival':'Neutral'; }

  function renderMap(){
    const edges=edgeList.map(([a,b])=>{
      const p=territories[a],q=territories[b];
      const different=p.region!==q.region?' region-edge':'';
      return `<line class="edge${different}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;
    }).join('');
    const nodes=territories.map((t,i)=>{
      const chosen=i===selected?' selected':'';
      const label=`${t.name}, ${ownerLabel(t.owner)} territory, ${t.units} ${t.units===1?'army':'armies'}`;
      return `<g class="territory owner-${t.owner}${chosen}" data-id="${i}" tabindex="0" role="button" aria-label="${label}"><circle cx="${t.x}" cy="${t.y}" r="25"/><text class="units" x="${t.x}" y="${t.y+5}">${t.units}</text><text class="name" x="${t.x}" y="${t.y+42}">${t.name}</text></g>`;
    }).join('');
    map.innerHTML=`<g aria-hidden="true">${edges}</g>${nodes}`;
  }

  function render(){
    renderMap();
    $('you-count').textContent=String(ownedCount('you'));
    $('rival-count').textContent=String(ownedCount('rival'));
    $('neutral-count').textContent=String(ownedCount('neutral'));
    $('round-label').textContent=finished?'Campaign complete':`Round ${round} · ${active==='you'?'your move':'rival move'}`;
    $('phase-chip').textContent=finished?'FINISHED':active==='rival'?'RIVAL':phase.toUpperCase();
    $('phase-title').textContent=finished?'Frontier secured':active==='rival'?'Rival planning':phase==='reinforce'?'Place your armies':'Choose an attack';
    $('reserve').textContent=active==='you'&&phase==='reinforce'?`+${reserve}`:active==='rival'?'…':'Ready';
    $('status').textContent=statusText;
    $('end-turn').disabled=finished||active!=='you';
    $('restart').disabled=false;
    $('log').innerHTML=logEntries.map((line)=>`<p>${line}</p>`).join('')||'<p>The frontier is quiet. Your scouts await orders.</p>';
  }

  function isAdjacent(from,to){ return edgeList.some(([a,b])=>(a===from&&b===to)||(a===to&&b===from)); }
  function winnerCheck(){
    if(ownedCount('you')>=9){ finished=true; active='you'; phase='finished'; statusText='Victory! Your banners now span the frontier.'; note('You secure nine territories and win the campaign.'); return true; }
    if(ownedCount('rival')>=9){ finished=true; active='rival'; phase='finished'; statusText='The rival has taken the frontier. Start a new campaign and try a different route.'; note('The rival secures nine territories.'); return true; }
    return false;
  }

  function resolveBattle(from,to,attacker){
    const source=territories[from],target=territories[to];
    const attackDice=Math.min(3,source.units-1);
    const defendDice=Math.min(2,target.units);
    const a=Array.from({length:attackDice},()=>1+Math.floor(Math.random()*6)).sort((x,y)=>y-x);
    const d=Array.from({length:defendDice},()=>1+Math.floor(Math.random()*6)).sort((x,y)=>y-x);
    let lossesToTarget=0,lossesToSource=0;
    for(let i=0;i<Math.min(a.length,d.length);i+=1){
      if(a[i]>d[i]){ target.units-=1; lossesToTarget+=1; }
      else { source.units-=1; lossesToSource+=1; }
    }
    const actor=attacker==='you'?'You':'Rival';
    if(target.units<=0){
      const moving=Math.min(attackDice,source.units-1);
      source.units-=moving;
      target.units=Math.max(1,moving);
      target.owner=attacker;
      note(`${actor} capture ${target.name} (${a.join('–')} vs ${d.join('–')}).`);
      if(attacker==='you') selected=to;
      else selected=-1;
    }else{
      note(`${actor} attack ${target.name}: ${lossesToTarget} defender lost, ${lossesToSource} attacker lost.`);
      if(source.units<=1&&attacker==='you') selected=-1;
    }
    winnerCheck();
  }

  function handleTerritory(index){
    if(finished||active!=='you') return;
    const territory=territories[index];
    if(phase==='reinforce'){
      if(territory.owner!=='you'){ setStatus('Reinforcements can only be placed on your own territory.'); return; }
      territory.units+=1;
      reserve-=1;
      note(`Reinforce ${territory.name}. ${reserve} reserve ${reserve===1?'army':'armies'} remain.`);
      if(reserve<=0){ phase='attack'; selected=-1; statusText='Reinforcements placed. Select a friendly border, then a neighboring target.'; }
      else statusText=`${territory.name} gains an army. Place ${reserve} more.`;
      render();
      return;
    }
    if(territory.owner==='you'){
      if(territory.units<2){ setStatus(`${territory.name} needs at least two armies to attack.`); return; }
      selected=selected===index?-1:index;
      statusText=selected<0?'Border selection cleared.':`${territory.name} selected. Choose an adjacent rival or neutral territory.`;
      render();
      return;
    }
    if(selected<0){ setStatus('Select one of your territories first.'); return; }
    if(!isAdjacent(selected,index)){ setStatus(`${territory.name} does not border your selected territory.`); return; }
    const origin=selected;
    resolveBattle(origin,index,'you');
    if(!finished){
      if(territories[origin].units>1){ selected=origin; statusText=`Battle resolved. ${territories[origin].name} can attack again or you can end your turn.`; }
      else { selected=-1; statusText='Battle resolved. Select another border or end your turn.'; }
    }
    render();
  }

  function aiTurn(){
    if(finished) return;
    active='rival';
    const armyReserve=reinforcement('rival');
    const border=()=>territories.map((t,i)=>({t,i,targets:neighbors(i).filter(n=>territories[n].owner!=='rival').length})).filter((x)=>x.t.owner==='rival'&&x.targets>0).sort((a,b)=>b.targets-a.targets||b.t.units-a.t.units);
    let remaining=armyReserve;
    while(remaining>0){
      const candidates=border();
      const slot=candidates[0]||territories.map((t,i)=>({t,i})).find((x)=>x.t.owner==='rival');
      if(!slot) break;
      slot.t.units+=1; remaining-=1;
    }
    note(`Rival reinforces the border with ${armyReserve} armies.`);
    for(let attempt=0;attempt<2&&!finished;attempt+=1){
      const options=[];
      territories.forEach((source,i)=>{
        if(source.owner!=='rival'||source.units<2) return;
        for(const n of neighbors(i)){
          const target=territories[n];
          if(target.owner==='rival') continue;
          const pressure=source.units-target.units+(target.owner==='neutral'?1.2:0);
          if(pressure>=1.1) options.push({from:i,to:n,score:pressure+Math.random()*.25});
        }
      });
      options.sort((a,b)=>b.score-a.score);
      if(!options.length) break;
      resolveBattle(options[0].from,options[0].to,'rival');
    }
    if(!finished){
      round+=1;
      active='you'; phase='reinforce'; selected=-1; reserve=reinforcement('you');
      statusText=`Your turn. Place ${reserve} reinforcements, then choose your battles.`;
      note(`Round ${round}: your command begins with ${reserve} reinforcements.`);
    }
    render();
  }

  function endTurn(){
    if(finished||active!=='you') return;
    selected=-1; active='rival'; phase='rival'; reserve=0;
    statusText='The rival is reinforcing and testing your borders…';
    render();
    aiTimer=window.setTimeout(aiTurn,280);
  }

  function restart(){
    if(aiTimer)window.clearTimeout(aiTimer);
    aiTimer=0;
    territories=copyMap(); phase='reinforce'; active='you'; reserve=reinforcement('you'); selected=-1; round=1; finished=false;
    logEntries=[]; statusText=`Campaign ready. Place ${reserve} reinforcements on your own territory.`;
    note('A new campaign begins across the three regions.'); render();
  }

  map.addEventListener('click',(event)=>{
    const group=event.target.closest('[data-id]');
    if(group) handleTerritory(Number(group.dataset.id));
  });
  map.addEventListener('keydown',(event)=>{
    if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-id]')){event.preventDefault();handleTerritory(Number(event.target.dataset.id));}
  });
  $('end-turn').addEventListener('click',endTurn);
  $('restart').addEventListener('click',restart);
  restart();
})();
