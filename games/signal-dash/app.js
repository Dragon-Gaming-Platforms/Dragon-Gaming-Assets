(() => {
  'use strict';
  const $=(id)=>document.getElementById(id);
  const canvas=$('game');
  const ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height,LANES=8,GROUND=H-74,PLAYER_Y=GROUND-25;
  let state='idle',lane=3,score=0,lives=3,energy=2,timeLeft=45,objects=[],spawnClock=0,lastFrame=0,gameClock=0,pulseFlash=0,combo=0;

  const laneWidth=W/LANES;
  const overlay=$('overlay');

  function setOverlay(title,copy,button){
    $('overlay-title').textContent=title;
    $('overlay-copy').textContent=copy;
    $('start').textContent=button;
    overlay.hidden=false;
  }
  function updateHud(){
    $('score').textContent=String(score).padStart(3,'0');
    $('lives').textContent='♥'.repeat(Math.max(0,lives))+'♡'.repeat(Math.max(0,3-lives));
    $('energy').textContent='●'.repeat(energy)+'○'.repeat(3-energy);
    $('time').textContent=String(Math.ceil(timeLeft)).padStart(2,'0');
  }
  function begin(){
    state='running';lane=3;score=0;lives=3;energy=2;timeLeft=45;objects=[];spawnClock=0;gameClock=0;pulseFlash=0;combo=0;lastFrame=0;
    overlay.hidden=true;$('status').textContent='Run active · catch signals, avoid static.';updateHud();
  }
  function move(delta){
    if(state!=='running')return;
    lane=Math.max(0,Math.min(LANES-1,lane+delta));
  }
  function pulse(){
    if(state!=='running')return;
    if(energy<=0){$('status').textContent='Pulse battery empty. Collect a signal to recharge.';return;}
    energy-=1;pulseFlash=.45;
    let cleared=0;
    objects=objects.filter((item)=>{
      if(item.type==='static'&&item.lane===lane&&item.y>GROUND-230){cleared+=1;return false;}
      return true;
    });
    score+=cleared*3;updateHud();
    $('status').textContent=cleared?`Pulse cleared ${cleared} static ${cleared===1?'burst':'bursts'}.`:'Pulse emitted · nearby lane is clear.';
  }
  function spawn(){
    const isSignal=Math.random()<.68;
    objects.push({lane:Math.floor(Math.random()*LANES),y:-24,type:isSignal?'signal':'static',speed:165+gameClock*1.5+Math.random()*34,phase:Math.random()*Math.PI*2});
  }
  function collide(item){
    if(state!=='running')return false;
    if(item.lane!==lane||item.y<PLAYER_Y-19||item.y>PLAYER_Y+20)return false;
    if(item.type==='signal'){
      combo+=1;score+=10+Math.min(20,(combo-1)*2);energy=Math.min(3,energy+1);
      $('status').textContent=combo>1?`Signal chain ×${combo} · battery recharged.`:'Signal caught · pulse battery recharged.';
    }else{
      lives-=1;combo=0;$('status').textContent='Static hit · one life lost.';
      pulseFlash=.22;
      if(lives<=0){finish(false);}
    }
    updateHud();return true;
  }
  function finish(won){
    if(state==='over')return;
    state='over';best=Math.max(best,score);
    setOverlay(won?'Signal secured!':'Run interrupted',won?`Shift complete. Final score: ${score}.`:`Final score: ${score}. Try a different lane or save your pulse for a tight spot.`,'Run again');
    $('status').textContent=`Run over · score ${score} · signals chained ${combo}.`;
  }
  function update(dt){
    if(state!=='running')return;
    gameClock+=dt;timeLeft=Math.max(0,timeLeft-dt);spawnClock+=dt;
    const interval=Math.max(.34,1.02-gameClock*.012);
    while(spawnClock>=interval){spawnClock-=interval;spawn();}
    if(pulseFlash>0)pulseFlash=Math.max(0,pulseFlash-dt);
    for(const item of objects){item.y+=item.speed*dt;item.phase+=dt*5;}
    objects=objects.filter((item)=>{
      if(collide(item))return false;
      return item.y<H+30;
    });
    if(timeLeft<=0)finish(true);
    updateHud();
  }
  function draw(){
    ctx.fillStyle='#c7d7a7';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#adc28c';ctx.fillRect(0,0,W,68);
    ctx.fillStyle='#31463a';ctx.font='800 17px ui-monospace,monospace';ctx.fillText('SIGNAL FIELD',28,40);
    ctx.fillStyle='#546d4e';ctx.font='12px ui-monospace,monospace';ctx.fillText('MOVE / COLLECT / PULSE',W-268,40);
    const top=78;
    ctx.strokeStyle='#78936b';ctx.lineWidth=2;
    for(let i=0;i<=LANES;i++){const x=i*laneWidth;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,GROUND+14);ctx.stroke();}
    for(let y=top;y<=GROUND+12;y+=58){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.fillStyle='#738862';ctx.fillRect(0,GROUND+15,W,3);
    ctx.fillStyle='#435a43';ctx.fillRect(0,GROUND+18,W,H-GROUND-18);
    ctx.fillStyle='#c7d7a7';ctx.font='11px ui-monospace,monospace';ctx.fillText('SAFE DOCK',18,GROUND+45);
    objects.forEach((item)=>{
      const cx=(item.lane+.5)*laneWidth,cy=item.y;
      if(item.type==='signal'){
        const pulseSize=10+Math.sin(item.phase)*2;
        ctx.fillStyle='#477b67';ctx.beginPath();ctx.arc(cx,cy,pulseSize+4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#1b594c';ctx.fillRect(cx-5,cy-11,10,22);ctx.fillRect(cx-11,cy-5,22,10);
        ctx.fillStyle='#ecf5b0';ctx.fillRect(cx-2,cy-2,4,4);
      }else{
        ctx.fillStyle='#a44766';ctx.beginPath();ctx.moveTo(cx,cy-13);ctx.lineTo(cx+12,cy+10);ctx.lineTo(cx-12,cy+10);ctx.closePath();ctx.fill();
        ctx.fillStyle='#f1b6a8';ctx.fillRect(cx-2,cy-4,4,8);
      }
    });
    const px=(lane+.5)*laneWidth;
    if(pulseFlash>0){ctx.strokeStyle=`rgba(47,106,87,${Math.min(.8,pulseFlash*1.7)})`;ctx.lineWidth=12;ctx.beginPath();ctx.arc(px,PLAYER_Y,68+(1-pulseFlash/.45)*100,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#1c4037';ctx.fillRect(px-20,PLAYER_Y-19,40,34);
    ctx.fillStyle='#d9efad';ctx.fillRect(px-12,PLAYER_Y-29,24,14);
    ctx.fillStyle='#284737';ctx.fillRect(px-9,PLAYER_Y-25,5,5);ctx.fillRect(px+4,PLAYER_Y-25,5,5);
    ctx.fillStyle='#d9efad';ctx.fillRect(px-13,PLAYER_Y+15,8,5);ctx.fillRect(px+5,PLAYER_Y+15,8,5);
    if(state==='running'){
      ctx.fillStyle='#31463a';ctx.font='700 13px ui-monospace,monospace';ctx.fillText(`CHAIN ${String(combo).padStart(2,'0')}`,W-140,GROUND+45);
    }else if(state==='idle'){
      ctx.fillStyle='#31463a';ctx.font='700 14px ui-monospace,monospace';ctx.fillText('SIGNAL AWAITING PICKUP',W/2-110,GROUND-64);
    }
  }
  function loop(timestamp){
    if(!lastFrame)lastFrame=timestamp;
    const dt=Math.min(.05,(timestamp-lastFrame)/1000);lastFrame=timestamp;
    update(dt);draw();requestAnimationFrame(loop);
  }
  function pauseToggle(){
    if(state==='running'){state='paused';setOverlay('Paused','Your courier is safe at the dock. Resume when ready.','Resume run');$('status').textContent='Paused · press Escape or Resume to continue.';}
    else if(state==='paused'){state='running';overlay.hidden=true;lastFrame=0;$('status').textContent='Run active · catch signals, avoid static.';}
  }
  $('start').addEventListener('click',()=>{if(state==='paused')pauseToggle();else begin();});
  $('left').addEventListener('pointerdown',(event)=>{event.preventDefault();move(-1);});
  $('right').addEventListener('pointerdown',(event)=>{event.preventDefault();move(1);});
  $('pulse').addEventListener('pointerdown',(event)=>{event.preventDefault();pulse();});
  window.addEventListener('keydown',(event)=>{
    const key=event.key.toLowerCase();
    if(['arrowleft','arrowright',' ','escape'].includes(key))event.preventDefault();
    if(key==='arrowleft'||key==='a')move(-1);
    else if(key==='arrowright'||key==='d')move(1);
    else if(key===' '||key==='spacebar')pulse();
    else if(key==='escape')pauseToggle();
  });
  updateHud();draw();requestAnimationFrame(loop);
})();
