(() => {
  'use strict';
  const $=(id)=>document.getElementById(id);
  const levels=[
    {title:'First Bend',description:'One beam, three mirrors. Route around the block.',startY:3,goal:{x:5,y:3},blocks:[[4,3]],mirrors:[
      {x:2,y:3,solution:'/',initial:'\\'},{x:2,y:1,solution:'/',initial:'\\'},{x:5,y:1,solution:'\\',initial:'/'}]},
    {title:'High Current',description:'Lift the pulse over the center wall, then turn down.',startY:4,goal:{x:5,y:5},blocks:[[4,4],[4,5]],mirrors:[
      {x:1,y:4,solution:'/',initial:'\\'},{x:1,y:1,solution:'/',initial:'\\'},{x:5,y:1,solution:'\\',initial:'/'}]},
    {title:'Corner Star',description:'A longer climb through the upper channel.',startY:2,goal:{x:6,y:4},blocks:[[4,2],[5,2],[4,1]],mirrors:[
      {x:3,y:2,solution:'/',initial:'\\'},{x:3,y:0,solution:'/',initial:'\\'},{x:6,y:0,solution:'\\',initial:'/'}]},
    {title:'Low Orbit',description:'Use the lower approach to find the receiver.',startY:5,goal:{x:5,y:2},blocks:[[4,5],[4,4]],mirrors:[
      {x:2,y:5,solution:'/',initial:'\\'},{x:2,y:1,solution:'/',initial:'\\'},{x:5,y:1,solution:'\\',initial:'/'}]},
    {title:'Last Relay',description:'Three mirrors guide the pulse; one decoy may distract you.',startY:3,goal:{x:4,y:6},blocks:[[3,3],[5,4]],mirrors:[
      {x:1,y:3,solution:'/',initial:'\\'},{x:1,y:1,solution:'/',initial:'\\'},{x:4,y:1,solution:'\\',initial:'/'},{x:6,y:4,solution:'/',initial:'\\'}]},
  ];
  const delta=[[0,-1],[1,0],[0,1],[-1,0]];
  let levelIndex=0;
  let mirrors=[];
  let statusText='Tap a mirror to rotate it and reroute the beam.';
  let solvedLevels=new Set();

  function current(){return levels[levelIndex];}
  function mirrorAt(x,y){return mirrors.find((m)=>m.x===x&&m.y===y);}
  function trace(){
    const level=current(),path=[],seen=new Set();
    let x=0,y=level.startY,dir=1,reason='exit',solved=false;
    for(let step=0;step<80;step+=1){
      if(x<0||x>=7||y<0||y>=7){reason='exit';break;}
      const state=`${x},${y},${dir}`;
      if(seen.has(state)){reason='loop';break;}
      seen.add(state);path.push(`${x},${y}`);
      if(x===level.goal.x&&y===level.goal.y){reason='goal';solved=true;break;}
      if(level.blocks.some(([bx,by])=>bx===x&&by===y)){reason='block';break;}
      const mirror=mirrorAt(x,y);
      if(mirror){
        dir=mirror.orientation==='/'?[1,0,3,2][dir]:[3,2,1,0][dir];
      }
      x+=delta[dir][0];y+=delta[dir][1];
    }
    return {path:new Set(path),reason,solved};
  }
  function render(){
    const level=current(),result=trace();
    $('board-title').textContent=`CIRCUIT ${String(levelIndex+1).padStart(2,'0')}`;
    $('level-name').textContent=level.title;
    $('description').textContent=level.description;
    $('beam-count').textContent=`Beam path · ${result.path.size} cells`;
    const cells=[];
    for(let y=0;y<7;y+=1){
      for(let x=0;x<7;x+=1){
        const key=`${x},${y}`,mirror=mirrorAt(x,y),isSource=x===0&&y===level.startY,isGoal=x===level.goal.x&&y===level.goal.y;
        const isBlock=level.blocks.some(([bx,by])=>bx===x&&by===y);
        let cls='cell empty',glyph='·',label='Open cell';
        if(result.path.has(key))cls+=' beam';
        if(isSource){cls+=' source';glyph='◉';label='Emitter';}
        if(isGoal){cls+=result.solved?' goal success':' goal';glyph='◎';label='Receiver';}
        if(isBlock){cls='cell block';glyph='▧';label='Blocker';}
        if(mirror){cls='cell mirror'+(result.path.has(key)?' beam':'');glyph=mirror.orientation==='/'?'╱':'╲';label=`${mirror.orientation==='/'?'Slash':'Backslash'} mirror; activate to rotate`;}
        const symbol=isSource?'◉':isGoal?'◎':isBlock?'▧':mirror?(mirror.orientation==='/'?'╱':'╲'):'·';
        const ariaLabel=`${label} at column ${x+1}, row ${y+1}`;
        if(mirror){
          const pressed=mirror.orientation==='/'?'true':'false';
          cells.push(`<button class="${cls}" type="button" data-x="${x}" data-y="${y}" aria-label="${ariaLabel}" aria-pressed="${pressed}">${symbol}</button>`);
        }else if(isSource||isGoal||isBlock){
          cells.push(`<div class="${cls}" role="img" aria-label="${ariaLabel}">${symbol}</div>`);
        }else{
          cells.push(`<div class="${cls}" aria-hidden="true">${symbol}</div>`);
        }
      }
    }
    $('board').innerHTML=cells.join('');
    const status=$('status');
    status.classList.toggle('win',result.solved);
    if(result.solved){
      solvedLevels.add(levelIndex);
      statusText=`Circuit complete! ${solvedLevels.size} of ${levels.length} relays solved.`;
    }else if(result.reason==='block')statusText='The pulse struck a blocker. Rotate a mirror to find another path.';
    else if(result.reason==='loop')statusText='The pulse got trapped in a loop. Break the cycle.';
    else statusText='The pulse leaves the board. Tap a mirror to redirect it.';
    status.textContent=statusText;
    $('levels').innerHTML=levels.map((item,index)=>`<button class="level-button${index===levelIndex?' active':''}" type="button" data-level="${index}" aria-label="Circuit ${index+1}: ${item.title}" aria-pressed="${index===levelIndex}">${String(index+1).padStart(2,'0')}${solvedLevels.has(index)?' ✓':''}</button>`).join('');
    $('next').textContent=levelIndex===levels.length-1?'Start over ↺':'Next circuit →';
  }
  function loadLevel(index){
    levelIndex=(index+levels.length)%levels.length;
    mirrors=current().mirrors.map((m)=>({...m,orientation:m.initial}));
    statusText='Tap a mirror to rotate it and reroute the beam.';
    render();
  }
  $('board').addEventListener('click',(event)=>{
    const button=event.target.closest('.cell.mirror');
    if(!button)return;
    const mirror=mirrorAt(Number(button.dataset.x),Number(button.dataset.y));
    if(!mirror)return;
    mirror.orientation=mirror.orientation==='/'?'\\':'/';
    render();
  });
  $('levels').addEventListener('click',(event)=>{
    const button=event.target.closest('[data-level]');
    if(button)loadLevel(Number(button.dataset.level));
  });
  $('reset').addEventListener('click',()=>loadLevel(levelIndex));
  $('next').addEventListener('click',()=>loadLevel((levelIndex+1)%levels.length));
  loadLevel(0);
})();
