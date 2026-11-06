(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('scene'), ctx = canvas.getContext('2d');
  const objectDistance = $('object-distance'), focalLength = $('focal-length'), objectHeight = $('object-height'), lensType = $('lens-type');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function line(x1,y1,x2,y2,color,width=2,dash=[]) { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.strokeStyle=color; ctx.lineWidth=width; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); }
  function arrow(x,y,height,color,dashed=false) {
    const tip=y-height; line(x,y,x,tip,color,3,dashed?[6,5]:[]); const dir=height>=0?1:-1; line(x,tip,x-8,tip+12*dir,color,3,dashed?[5,4]:[]); line(x,tip,x+8,tip+12*dir,color,3,dashed?[5,4]:[]);
  }
  function render() {
    const W=canvas.width,H=canvas.height,lensX=420,axisY=258,scale=48;
    const doUnits=Number(objectDistance.value), hUnits=Number(objectHeight.value), sign=lensType.value==='convex'?1:-1, f=Number(focalLength.value)*sign;
    const denominator=(1/f)-(1/doUnits); const di=Math.abs(denominator)<0.015?Infinity:1/denominator; const mag=Number.isFinite(di)?-di/doUnits:Infinity;
    const objX=lensX-doUnits*scale, objTipY=axisY-hUnits*scale;
    ctx.fillStyle='#0a131a';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#1b2c35';ctx.lineWidth=1;for(let x=40;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=40;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    line(24,axisY,W-24,axisY,'#9bb0b5',1.5);
    const focalPx=Math.abs(f)*scale;
    [lensX-focalPx,lensX+focalPx].forEach((x,i)=>{ctx.beginPath();ctx.arc(x,axisY,4,0,Math.PI*2);ctx.fillStyle='#f2c574';ctx.fill();ctx.fillStyle='#a5b8bb';ctx.font='10px ui-monospace,monospace';ctx.fillText(i?'F₂':'F₁',x-7,axisY+18);});
    // Thin lens body, drawn as a slim convex or concave glass element.
    ctx.beginPath();
    if(sign>0){ctx.moveTo(lensX,axisY-112);ctx.bezierCurveTo(lensX-23,axisY-60,lensX-23,axisY+60,lensX,axisY+112);ctx.bezierCurveTo(lensX+23,axisY+60,lensX+23,axisY-60,lensX,axisY-112);}
    else{ctx.moveTo(lensX-15,axisY-112);ctx.bezierCurveTo(lensX+5,axisY-60,lensX+5,axisY+60,lensX-15,axisY+112);ctx.bezierCurveTo(lensX+15,axisY+60,lensX+15,axisY-60,lensX+15,axisY-112);}
    ctx.closePath();ctx.fillStyle='#64cbb722';ctx.fill();ctx.strokeStyle='#7edbc8';ctx.lineWidth=2;ctx.stroke();
    // Object and principal rays: center ray and a parallel ray.
    arrow(objX,axisY,hUnits*scale,'#f0bc73');
    ctx.fillStyle='#eacb98';ctx.font='10px system-ui';ctx.fillText('OBJECT',objX-23,axisY+27);
    const right=W-18; const yAt=(originY,slope,x)=>originY-slope*(x-lensX)*scale;
    // Center ray passes through the optical center without deflection.
    const centerSlope=-hUnits/doUnits;
    line(objX,objTipY,lensX,axisY,'#ffd27b',2);
    line(lensX,axisY,right,yAt(axisY,centerSlope,right),'#ffd27b',2);
    // Parallel incoming ray refracts with slope -h/f.
    line(objX,objTipY,lensX,objTipY,'#78d9d1',2);
    const refractedSlope=-hUnits/f;
    line(lensX,objTipY,right,axisY-(hUnits+refractedSlope*((right-lensX)/scale))*scale,'#78d9d1',2);
    if(Number.isFinite(di)){
      const imageX=lensX+di*scale; const imageH=mag*hUnits; const imageY=axisY-imageH*scale;
      const visible=imageX>22&&imageX<W-22&&imageY>25&&imageY<H-28;
      const type=di>0?'Real':'Virtual';
      if(di<0){
        line(lensX,axisY,imageX,imageY,'#ffd27b',1.5,[5,5]);
        line(lensX,objTipY,imageX,imageY,'#78d9d1',1.5,[5,5]);
      }
      if(visible){arrow(imageX,axisY,imageH,di>0?'#9fe8b1':'#c5a9ff',di<0);ctx.fillStyle=di>0?'#a9e8bb':'#cab2ff';ctx.fillText(`${type.toUpperCase()} IMAGE`,imageX-36,axisY+28);}
      $('image-distance').textContent=`${di.toFixed(2)} u`;$('magnification').textContent=mag.toFixed(2);$('image-type').textContent=type;$('focus-read').textContent=visible?'Inside bench':'Off bench';
      $('status').textContent=visible?`${type} image ${di>0?'right':'left'} of the lens; magnification ${mag.toFixed(2)}×.`:`${type} image falls outside the canvas; adjust distance or focal length.`;
    }else{$('image-distance').textContent='∞';$('magnification').textContent='∞';$('image-type').textContent='At infinity';$('focus-read').textContent='Parallel';$('status').textContent='Object is at the focal plane; outgoing principal rays are parallel.';}
    $('object-out').textContent=`${doUnits.toFixed(1)} units`;$('focal-out').textContent=`${Math.abs(f).toFixed(1)} units`;$('height-out').textContent=`${hUnits.toFixed(1)} units`;
    ctx.fillStyle='#9bb0b5';ctx.font='10px ui-monospace,monospace';ctx.fillText('OPTICAL AXIS',26,axisY-9);ctx.fillText(sign>0?'CONVERGING LENS':'DIVERGING LENS',lensX-53,28);
  }
  [objectDistance,focalLength,objectHeight,lensType].forEach((control)=>control.addEventListener('input',render));
  [objectDistance,focalLength,objectHeight,lensType].forEach((control)=>control.addEventListener('change',render));
  render();
})();
