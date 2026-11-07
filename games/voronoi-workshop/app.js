(() => {
  'use strict';
  const $=(id)=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height,N=W*H;
  const image=ctx.createImageData(W,H),owners=new Int16Array(N),areas=new Int32Array(32);
  const palettes={
    prism:[[68,205,177],[101,145,255],[244,168,95],[210,120,231],[242,221,112]],
    coast:[[41,111,144],[58,157,165],[86,197,175],[126,217,194],[216,225,173]],
    ember:[[146,74,74],[197,99,67],[229,146,73],[242,187,98],[232,214,154]],
  };
  let sites=[],dragIndex=-1,seed=521;
  function random(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
  function generate(){const count=Number($('site-count').value),mode=$('preset').value;seed=521+count*37+(mode==='clustered'?13:mode==='grid'?29:0);sites=[];if(mode==='grid'){const cols=Math.ceil(Math.sqrt(count)),rows=Math.ceil(count/cols);for(let i=0;i<count;i++){const col=i%cols,row=Math.floor(i/cols);sites.push({x:22+(col+.5)*((W-44)/cols)+(random()-.5)*7,y:18+(row+.5)*((H-36)/rows)+(random()-.5)*7});}}else if(mode==='clustered'){const centers=[[W*.28,H*.34],[W*.72,H*.3],[W*.5,H*.72]];for(let i=0;i<count;i++){const c=centers[i%centers.length];sites.push({x:Math.max(6,Math.min(W-6,c[0]+(random()-.5)*75)),y:Math.max(6,Math.min(H-6,c[1]+(random()-.5)*55))});}}else{for(let i=0;i<count;i++)sites.push({x:12+random()*(W-24),y:12+random()*(H-24)});}render();$('status').textContent=`Generated ${sites.length} sites in a ${mode} layout.`;}
  function render(){const data=image.data,palette=palettes[$('palette').value]||palettes.prism;areas.fill(0);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let best=Infinity,winner=0;for(let s=0;s<sites.length;s++){const dx=x-sites[s].x,dy=y-sites[s].y,d=dx*dx+dy*dy;if(d<best){best=d;winner=s;}}const i=y*W+x;owners[i]=winner;areas[winner]++;}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,site=owners[i],color=palette[site%palette.length];let border=false;if($('borders').checked){border=(x>0&&owners[i-1]!==site)||(x<W-1&&owners[i+1]!==site)||(y>0&&owners[i-W]!==site)||(y<H-1&&owners[i+W]!==site);}const p=i*4;if(border){data[p]=31;data[p+1]=43;data[p+2]=53;}else{data[p]=color[0];data[p+1]=color[1];data[p+2]=color[2];}data[p+3]=255;}
    ctx.putImageData(image,0,0);ctx.lineWidth=1.2;sites.forEach((s,i)=>{ctx.beginPath();ctx.arc(s.x,s.y,4.2,0,Math.PI*2);ctx.fillStyle='#f5f8f5';ctx.fill();ctx.beginPath();ctx.arc(s.x,s.y,2.7,0,Math.PI*2);ctx.fillStyle=`rgb(${palette[i%palette.length].join(',')})`;ctx.fill();});const largest=sites.length?Math.max(...areas.slice(0,sites.length)):0;$('site-count-read').textContent=String(sites.length);$('largest-cell').textContent=`${(largest/N*100).toFixed(1)}%`;$('state-chip').textContent=`${sites.length} SITES`;}
  function point(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)/r.width*W,y:(event.clientY-r.top)/r.height*H};}
  function nearest(p){let index=-1,best=Infinity;sites.forEach((s,i)=>{const d=(s.x-p.x)**2+(s.y-p.y)**2;if(d<best){best=d;index=i;}});return best<11*11?index:-1;}
  $('generate').addEventListener('click',generate);$('site-count').addEventListener('input',()=>{$('site-out').textContent=$('site-count').value;});$('palette').addEventListener('change',render);$('borders').addEventListener('change',render);$('preset').addEventListener('change',generate);
  canvas.addEventListener('pointerdown',event=>{const p=point(event);dragIndex=nearest(p);if(dragIndex<0){if(sites.length>=32){$('status').textContent='This map has 32 sites; drag or remove one to make room.';return;}sites.push({x:p.x,y:p.y});dragIndex=sites.length-1;render();$('status').textContent='Added a site. Drag it to reshape its cell.';}else $('status').textContent='Dragging site; its cell is recalculated locally.';if(canvas.setPointerCapture)canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(dragIndex<0)return;const p=point(event);sites[dragIndex].x=Math.max(3,Math.min(W-3,p.x));sites[dragIndex].y=Math.max(3,Math.min(H-3,p.y));render();});
  const release=()=>{dragIndex=-1;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('contextmenu',event=>{event.preventDefault();const index=nearest(point(event));if(index<0)return;if(sites.length<=3){$('status').textContent='Keep at least three sites in the diagram.';return;}sites.splice(index,1);dragIndex=-1;render();$('status').textContent='Removed a site and recomputed the cells.';});
  $('site-out').textContent=$('site-count').value;generate();
})();
