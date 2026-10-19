(() => {
  'use strict';
  const $=(id)=>document.getElementById(id);
  const canvas=$('space'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  const BASE_G=880,SOFTENING=16,MAX_BODIES=12;
  const stars=Array.from({length:85},(_,i)=>({x:(i*137.51+31)%W,y:(i*71.17+19)%H,r:.5+(i%4)*.35,a:.25+(i%5)*.12}));
  const presets={
    duet:()=>[
      body(500,300,1000,0,0,'#ffd68a','Core'),
      body(665,300,9,0,72.2,'#82e5f0','Drifter'),
      body(365,300,7,0,-86,'#c5a8ff','Wisp'),
    ],
    binary:()=>[
      body(430,300,600,0,-43.8,'#ffd68a','Sun A'),
      body(570,300,600,0,43.8,'#ffb98a','Sun B'),
      body(500,125,6,69,0,'#8de7ed','Comet'),
    ],
    dance:()=>[
      body(500,300,1000,0,0,'#ffd68a','Anchor'),
      body(400,300,8,0,-82,'#85d9f2','Blue'),
      body(555,300,11,0,74,'#c1a6ff','Lilac'),
      body(500,420,4,67,0,'#f39dd0','Petal'),
    ],
  };
  let bodies=[],paused=false,lastTime=0,elapsed=0,collisionCount=0,drag=null,frame=0;
  function body(x,y,mass,vx,vy,color,name){return{x,y,mass,vx,vy,color,name,trail:[],radius:radiusFor(mass)};}
  function radiusFor(mass){return Math.max(3.5,Math.min(15,2.8+Math.sqrt(mass)*.27));}
  function loadPreset(key=$('preset').value){
    bodies=presets[key]().map((b)=>({...b,trail:[]}));
    paused=false;lastTime=0;elapsed=0;collisionCount=0;
    $('pause').textContent='Ⅱ Pause';$('status').textContent=`${bodies.length} bodies in ${$('preset').selectedOptions?.[0]?.textContent||'the garden'}. Drag to launch another.`;
    updateStats();
  }
  function updateStats(){
    $('body-count').textContent=`${bodies.length} ${bodies.length===1?'body':'bodies'}`;
    $('elapsed').textContent=`${elapsed.toFixed(1)} s`;
    $('collisions').textContent=String(collisionCount);
    $('gravity-value').textContent=`${Number($('gravity').value).toFixed(2)}×`;
    $('speed-value').textContent=`${Number($('speed').value).toFixed(1)}×`;
  }
  function pointerPosition(event){
    const rect=canvas.getBoundingClientRect();
    return{x:(event.clientX-rect.left)*W/rect.width,y:(event.clientY-rect.top)*H/rect.height};
  }
  function addBody(start,end){
    if(bodies.length>=MAX_BODIES){$('status').textContent=`The garden is full (${MAX_BODIES} bodies). Merge or reset to add more.`;return;}
    const type=$('body-type').value;
    const spec=type==='star'?{mass:230,color:'#ffd68a',name:'New star'}:type==='comet'?{mass:4,color:'#c2a1ff',name:'Comet'}:{mass:12,color:'#82e5f0',name:'Planet'};
    bodies.push(body(start.x,start.y,spec.mass,(end.x-start.x)*.62,(end.y-start.y)*.62,spec.color,spec.name));
    $('status').textContent=`${spec.name} launched · ${bodies.length}/${MAX_BODIES} bodies.`;
    updateStats();
  }
  function integrate(dt){
    const g=BASE_G*Number($('gravity').value);
    const ax=new Array(bodies.length).fill(0),ay=new Array(bodies.length).fill(0);
    for(let i=0;i<bodies.length;i+=1){
      for(let j=i+1;j<bodies.length;j+=1){
        const dx=bodies[j].x-bodies[i].x,dy=bodies[j].y-bodies[i].y;
        const r2=dx*dx+dy*dy+SOFTENING*SOFTENING;
        const scale=g/(r2*Math.sqrt(r2));
        ax[i]+=scale*bodies[j].mass*dx;ay[i]+=scale*bodies[j].mass*dy;
        ax[j]-=scale*bodies[i].mass*dx;ay[j]-=scale*bodies[i].mass*dy;
      }
    }
    const step=dt*Number($('speed').value);
    for(let i=0;i<bodies.length;i+=1){
      const b=bodies[i];b.vx+=ax[i]*step;b.vy+=ay[i]*step;b.x+=b.vx*step;b.y+=b.vy*step;
      if(frame%3===0){b.trail.push({x:b.x,y:b.y});if(b.trail.length>110)b.trail.shift();}
    }
    for(let i=bodies.length-1;i>=0;i-=1){
      for(let j=i-1;j>=0;j-=1){
        const a=bodies[i],b=bodies[j],dx=a.x-b.x,dy=a.y-b.y;
        if(Math.hypot(dx,dy)<(a.radius+b.radius)*.78){
          const mass=a.mass+b.mass;
          b.vx=(a.vx*a.mass+b.vx*b.mass)/mass;b.vy=(a.vy*a.mass+b.vy*b.mass)/mass;
          b.x=(a.x*a.mass+b.x*b.mass)/mass;b.y=(a.y*a.mass+b.y*b.mass)/mass;
          b.mass=mass;b.radius=radiusFor(mass);b.name=mass>450?'Merged core':'Merged body';
          a.trail.forEach((p)=>b.trail.push(p));if(b.trail.length>110)b.trail=b.trail.slice(-110);
          bodies.splice(i,1);collisionCount+=1;break;
        }
      }
    }
    elapsed+=step;
  }
  function draw(){
    ctx.fillStyle='#080b15';ctx.fillRect(0,0,W,H);
    for(const star of stars){ctx.globalAlpha=star.a;ctx.fillStyle='#d9e6ff';ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    ctx.strokeStyle='#28314a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(W/2,H/2,145,0,Math.PI*2);ctx.stroke();
    for(const b of bodies){
      if(b.trail.length>1){ctx.beginPath();ctx.moveTo(b.trail[0].x,b.trail[0].y);for(let i=1;i<b.trail.length;i+=1)ctx.lineTo(b.trail[i].x,b.trail[i].y);ctx.strokeStyle=b.color+'77';ctx.lineWidth=1.4;ctx.stroke();}
      const glow=ctx.createRadialGradient(b.x,b.y,b.radius*.2,b.x,b.y,b.radius*3.2);glow.addColorStop(0,b.color+'cc');glow.addColorStop(1,b.color+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(b.x,b.y,b.radius*3.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.radius,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#e9edff';ctx.font='10px ui-monospace,monospace';ctx.fillText(b.name,b.x+b.radius+5,b.y-5);
    }
    if(drag){ctx.strokeStyle='#d6e9ff';ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(drag.start.x,drag.start.y);ctx.lineTo(drag.current.x,drag.current.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#d6e9ff';ctx.beginPath();ctx.arc(drag.start.x,drag.start.y,4,0,Math.PI*2);ctx.fill();}
    if(paused){ctx.fillStyle='#070a13a8';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f1edff';ctx.font='800 22px system-ui';ctx.textAlign='center';ctx.fillText('SIMULATION PAUSED',W/2,H/2);ctx.textAlign='left';}
  }
  function loop(timestamp){
    if(!lastTime)lastTime=timestamp;
    const dt=Math.min(.03,(timestamp-lastTime)/1000);lastTime=timestamp;
    if(!paused){integrate(dt);if(frame%20===0)updateStats();}
    frame+=1;draw();requestAnimationFrame(loop);
  }
  canvas.addEventListener('pointerdown',(event)=>{event.preventDefault();canvas.setPointerCapture(event.pointerId);const p=pointerPosition(event);drag={pointerId:event.pointerId,start:p,current:p};});
  canvas.addEventListener('pointermove',(event)=>{if(drag&&drag.pointerId===event.pointerId)drag.current=pointerPosition(event);});
  canvas.addEventListener('pointerup',(event)=>{if(!drag||drag.pointerId!==event.pointerId)return;const start=drag.start,end=drag.current;drag=null;addBody(start,end);});
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  $('preset').addEventListener('change',()=>loadPreset());
  $('reset').addEventListener('click',()=>loadPreset());
  $('pause').addEventListener('click',()=>{paused=!paused;$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';$('status').textContent=paused?'Simulation paused.':'Simulation running · drag to launch another body.';});
  $('clear-trails').addEventListener('click',()=>{bodies.forEach((b)=>b.trail=[]);$('status').textContent='Orbital trails cleared.';});
  $('gravity').addEventListener('input',updateStats);$('speed').addEventListener('input',updateStats);
  window.addEventListener('keydown',(event)=>{if(event.key.toLowerCase()==='p'){paused=!paused;$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';}});
  loadPreset();requestAnimationFrame(loop);
})();
