(() => {
  'use strict';
  const $=(id)=>document.getElementById(id);
  const canvas=$('sky'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height,GROUND=H-105;
  let clouds=[],updrafts=[],rain=[],paused=false,lastTime=0,elapsed=0,rainfall=0,flash=0,windPhase=0;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function conditions(){
    const temp=Number($('temperature').value),humidity=Number($('humidity').value),pressure=Number($('pressure').value),wind=Number($('wind').value);
    const updraft=updrafts.reduce((max,u)=>Math.max(max,u.strength*(u.life/u.maxLife)),0);
    const moisture=clamp((humidity-30)/70,0,1);
    const heat=clamp((temp-4)/34,0,1);
    const lowPressure=clamp((1018-pressure)/45,0,1);
    const storm=clamp(moisture*.43+heat*.18+lowPressure*.22+updraft*.42,0,1);
    return{temp,humidity,pressure,wind,storm,updraft};
  }
  function seedClouds(){
    clouds=Array.from({length:9},(_,i)=>({x:35+i*116,y:105+(i%3)*49,scale:.65+(i%4)*.14,phase:i*1.71,moisture:.25+(i%5)*.12}));
  }
  function updateLabels(){
    const c=conditions();
    $('temp-value').textContent=`${c.temp} °C`;$('humidity-value').textContent=`${c.humidity}%`;
    $('pressure-value').textContent=`${c.pressure} hPa`;$('wind-value').textContent=`${c.wind} / 10`;
    $('storm-index').textContent=`${Math.round(c.storm*100)}%`;
    $('updraft-count').textContent=String(updrafts.length);
    $('rainfall').textContent=`${rainfall.toFixed(1)} mm`;
    $('weather-label').textContent=c.storm>.72?'Thunder cell':c.storm>.48?'Showers':c.storm>.25?'Cloud drift':'Clear air';
  }
  function setPreset(name){
    const presets={breeze:{temperature:22,humidity:62,pressure:1012,wind:3},clear:{temperature:27,humidity:24,pressure:1027,wind:1},storm:{temperature:29,humidity:91,pressure:985,wind:7}};
    const values=presets[name];if(!values)return;
    for(const [id,value] of Object.entries(values)){$(id).value=String(value);}
    updateLabels();$('status').textContent=`Preset loaded · ${name==='breeze'?'Sea breeze':name==='clear'?'High pressure':'Warm front'}. Click the sky to seed an updraft.`;
  }
  function seedUpdraft(x,y){
    if(updrafts.length>=8)updrafts.shift();
    updrafts.push({x,y,strength:.9+Math.random()*.35,life:13,maxLife:13,phase:Math.random()*Math.PI*2});
    $('status').textContent='Warm, moist air is rising here. Adjust humidity and pressure to strengthen or weaken it.';
    updateLabels();
  }
  function update(dt){
    if(paused)return;
    elapsed+=dt;windPhase+=dt;
    const c=conditions();
    const speed=8+c.wind*5;
    clouds.forEach((cloud)=>{
      cloud.x+=speed*dt;cloud.phase+=dt*.7;
      if(cloud.x>W+140)cloud.x=-150;
      cloud.moisture=clamp(cloud.moisture+(c.humidity/100-.48)*dt*.12,0,1);
    });
    updrafts.forEach((u)=>{u.life-=dt;u.y-=8*dt;u.phase+=dt*3;});
    updrafts=updrafts.filter((u)=>u.life>0);
    if(c.storm>.47&&Math.random()<dt*(c.storm-.38)*5){
      rain.push({x:Math.random()*W,y:100+Math.random()*(GROUND-100),speed:280+Math.random()*240,drift:c.wind*8+12});
    }
    rain.forEach((drop)=>{drop.x+=drop.drift*dt;drop.y+=drop.speed*dt;});
    const landed=rain.filter((drop)=>drop.y>=GROUND).length;
    if(landed){rainfall+=landed*.06;rain=rain.filter((drop)=>drop.y<GROUND);}
    if(c.storm>.82&&Math.random()<dt*.09)flash=.18;
    flash=Math.max(0,flash-dt);
    $('rainfall').textContent=`${rainfall.toFixed(1)} mm`;
    if(elapsed%1<dt)updateLabels();
  }
  function cloudShape(x,y,scale,opacity,storm){
    const r=38*scale;
    ctx.save();ctx.globalAlpha=opacity;
    ctx.fillStyle=storm>.65?'#607c89':'#edf8f1';
    ctx.beginPath();
    ctx.ellipse(x,y,r*1.5,r*.38,0,0,Math.PI*2);
    ctx.ellipse(x-r*.52,y-r*.15,r*.58,r*.48,0,0,Math.PI*2);
    ctx.ellipse(x,y-r*.35,r*.72,r*.66,0,0,Math.PI*2);
    ctx.ellipse(x+r*.55,y-r*.13,r*.56,r*.47,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  function draw(){
    const c=conditions();
    const gradient=ctx.createLinearGradient(0,0,0,H);
    const top=c.storm>.7?'#657c91':c.temp>29?'#63b8db':'#75c9e2';
    gradient.addColorStop(0,top);gradient.addColorStop(.66,c.storm>.65?'#b2c8c9':'#d5e4d2');gradient.addColorStop(1,'#f4d49a');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
    const sunX=745+Math.sin(elapsed*.025)*28,sunY=115;
    ctx.fillStyle=c.storm>.6?'#d4d4c1':'#ffe2a2';ctx.beginPath();ctx.arc(sunX,sunY,c.storm>.7?35:46,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff30';ctx.beginPath();ctx.arc(sunX,sunY,62,0,Math.PI*2);ctx.fill();
    clouds.forEach((cloud)=>{
      const density=.35+c.humidity/170+cloud.moisture*.22+c.storm*.18;
      const y=cloud.y+Math.sin(cloud.phase)*5;
      cloudShape(cloud.x,y,cloud.scale,clamp(density,.18,.92),c.storm);
    });
    updrafts.forEach((u)=>{
      const strength=u.strength*(u.life/u.maxLife);
      for(let i=0;i<5;i+=1){
        const rise=(elapsed*22+i*39)%125;
        const offset=Math.sin(u.phase+i*1.3)*17;
        ctx.fillStyle=`rgba(240,255,255,${.24*(1-rise/125)*strength})`;
        ctx.beginPath();ctx.arc(u.x+offset,u.y-rise,8+rise*.12,0,Math.PI*2);ctx.fill();
      }
    });
    ctx.fillStyle=c.storm>.72?'#556f68':'#789c75';ctx.beginPath();ctx.moveTo(0,GROUND+30);ctx.quadraticCurveTo(190,GROUND-55,390,GROUND+5);ctx.quadraticCurveTo(650,GROUND+70,960,GROUND-30);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
    ctx.fillStyle='#617f60';ctx.beginPath();ctx.moveTo(0,GROUND+65);ctx.quadraticCurveTo(220,GROUND+2,440,GROUND+48);ctx.quadraticCurveTo(710,GROUND+100,960,GROUND+32);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
    if(c.wind>0){
      ctx.strokeStyle='#f4ffff66';ctx.lineWidth=2;
      for(let i=0;i<4;i+=1){const y=255+i*45,x=(windPhase*45+i*210)%W;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+24,y-8,x+53,y);ctx.stroke();}
    }
    ctx.strokeStyle=c.storm>.6?'#e9f5ffad':'#d9f2ff';ctx.lineWidth=2;
    rain.forEach((drop)=>{ctx.beginPath();ctx.moveTo(drop.x,drop.y);ctx.lineTo(drop.x-drop.drift*.025,drop.y+12);ctx.stroke();});
    if(flash>0){ctx.fillStyle=`rgba(232,247,255,${flash*1.8})`;ctx.fillRect(0,0,W,H);}
    ctx.fillStyle='#18333c';ctx.font='800 12px ui-monospace,monospace';ctx.fillText(c.storm>.72?'STORM CELL':c.storm>.45?'MOISTURE FRONT':'LOCAL SKY MODEL',24,34);
    if(paused){ctx.fillStyle='#12202a88';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='800 24px system-ui';ctx.textAlign='center';ctx.fillText('SKY PAUSED',W/2,H/2);ctx.textAlign='left';}
  }
  function loop(timestamp){if(!lastTime)lastTime=timestamp;const dt=Math.min(.05,(timestamp-lastTime)/1000);lastTime=timestamp;update(dt);draw();requestAnimationFrame(loop);}
  canvas.addEventListener('pointerdown',(event)=>{event.preventDefault();const rect=canvas.getBoundingClientRect();seedUpdraft((event.clientX-rect.left)*W/rect.width,(event.clientY-rect.top)*H/rect.height);});
  for(const id of ['temperature','humidity','pressure','wind'])$(id).addEventListener('input',updateLabels);
  document.querySelectorAll('[data-preset]').forEach((button)=>button.addEventListener('click',()=>setPreset(button.dataset.preset)));
  $('pause').addEventListener('click',()=>{paused=!paused;$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';$('status').textContent=paused?'Simulation paused.':'Simulation running. Click the sky to seed an updraft.';});
  $('reset').addEventListener('click',()=>{updrafts=[];rain=[];rainfall=0;elapsed=0;paused=false;seedClouds();$('pause').textContent='Ⅱ Pause';$('status').textContent='Simulation reset. Tap or click inside the sky to seed a warm updraft.';updateLabels();});
  seedClouds();updateLabels();requestAnimationFrame(loop);
})();
