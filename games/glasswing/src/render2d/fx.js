import {F} from '../data/feel.js';
import {glow} from './surface.js';
import {css,P,tone} from './color.js';
import {Trail} from './trail.js';

const TAU=Math.PI*2;
// Renderer-only particles (hit sparks, dissolving wild monsters). Never touches simulation state.
export class FX{
 constructor(){this.pool=Array.from({length:220},()=>({life:0}));this.cap=220;this.last=-1;this.seen=new WeakMap();this.seed=1;this.trail=new Trail();}
 rand(){this.seed=(this.seed*16807)%2147483647;return this.seed/2147483647;}
 burst(x,y,color,n,speed,life,size,add=true,gravity=.004){
  let k=0;
  for(const p of this.pool){if(k>=n)break;if(p.life>0)continue;
   const a=this.rand()*TAU,v=speed*(.35+this.rand()*.65);
   Object.assign(p,{x,y,px:x,py:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v+speed*.3,life:life*(.6+this.rand()*.4),max:life,size:size*(.6+this.rand()*.6),color,add,gravity,spin:this.rand()*TAU});k++;}
 }
 // Edge-detect hits, parries, breaks and defeats from entity timers.
 watch(e){
  let s=this.seen.get(e);if(!s){s={flash:e.flash,parry:e.parryFlash,dead:e.dead,glass:e.glass,form:e.form||null};this.seen.set(e,s);return;}
  const mid=e.y+e.h*.55,n=this.cap<150?.5:1;
  if(e.flash>s.flash){if(e.team===2){this.burst(e.x,mid,P.amberHot,14*n,.16,22,.09);this.burst(e.x,mid,P.bone,6*n,.1,26,.05,false,.008);}else{this.burst(e.x,e.y+e.h*.85,P.bone,10*n,.12,28,.06,false,.008);this.burst(e.x,mid,P.cyan,8*n,.12,18,.07);}}
  if(e.parryFlash>s.parry)this.burst(e.x,e.y+e.h*.6,P.ivory,22*n,.22,20,.08);
  if(e.glass&&!s.glass)this.burst(e.x,e.y+e.h*.8,e.team===2?P.cyan:P.amber,26*n,.2,34,.1);
  if(e.dead&&!s.dead&&e.team===2)this.burst(e.x,mid,P.cyan,(e.boss?60:20)*n,e.boss?.18:.08,e.boss?70:45,e.boss?.16:.08,true,-.002);
  // Rules-v4 possession: an amber flare when the form appears, amber dust when it falls away.
  if(e.form&&!s.form)this.burst(e.x,e.y+e.h*.6,P.amber,40*n,.26,40,.12);
  if(!e.form&&s.form)this.burst(e.x,e.y+e.h*.7,P.amberHot,30*n,.16,50,.1,true,-.002);
  s.flash=e.flash;s.parry=e.parryFlash;s.dead=e.dead;s.glass=e.glass;s.form=e.form||null;
 }
 // Sparks step on simulation frames (held during hit-stop, so a hit freezes crisply) and keep
 // their previous position for interpolation.
 step(frame,frozen=false){
  const n=this.last<0||frozen?0:Math.max(0,Math.min(4,frame-this.last));this.last=frame;
  for(let i=0;i<n;i++)for(const p of this.pool)if(p.life>0){p.px=p.x;p.py=p.y;p.life--;p.x+=p.vx;p.y+=p.vy;p.vy-=p.gravity;p.vx*=.97;}
 }
 draw(g,state,alpha,frame){
  const frozen=state.hitStop>0||!!state.phase&&state.phase!=='playing'&&state.phase!=='round',T=this.trail;
  this.step(frame,frozen);
  const owners=state.players||[];
  // Projectiles: amber for the hero, cold glass cyan for enemies; slam orbs read as ground waves.
  for(const p of state.projectiles||[]){
   if(!p.active)continue;
   // Rules-v4 parryable boss orbs are ivory; cyan never parries.
   const at=T.at(p,alpha,frame,frozen),enemy=p.team===2,col=enemy?(p.ivory?P.ivory:P.cyan):P.amber,x=at[0],y=at[1],r=p.radius||.18,dir=Math.sign(p.vx)||1;
   const sp=glow(col);
   g.globalCompositeOperation='lighter';
   if(sp){for(let i=3;i>=1;i--){const tx=x-p.vx*i*2.2,s=r*(3.4-i*.6);g.globalAlpha=.18*(4-i)/3;g.drawImage(sp,tx-s,-y-s,s*2,s*2);}g.globalAlpha=.9;g.drawImage(sp,x-r*3.2,-y-r*3.2,r*6.4,r*6.4);g.globalAlpha=1;}
   g.globalCompositeOperation='source-over';
   let archer=false;if(!enemy)for(const o of owners)if(o.id===p.owner&&o.kind==='spark'){archer=true;break;}
   if(enemy&&r>=.2&&y<1.3){
    g.fillStyle=css(P.cyanHot,.9);g.beginPath();g.moveTo(x-dir*r*2.5,-1);g.quadraticCurveTo(x,-1-r*3.2,x+dir*r*.8,-1);g.closePath();g.fill();
   }else if(archer){
    g.save();g.translate(x,-y);g.scale(dir,1);g.strokeStyle=P.amberHot;g.lineWidth=.035;g.beginPath();g.moveTo(-.55,0);g.lineTo(.1,0);g.stroke();
    g.fillStyle=P.ivory;g.beginPath();g.moveTo(.22,0);g.lineTo(.04,-.07);g.lineTo(.07,0);g.lineTo(.04,.07);g.closePath();g.fill();g.restore();
   }else{
    g.fillStyle=enemy?(p.ivory?'#3a3226':'#0c2630'):P.amberDeep;g.beginPath();g.arc(x,-y,r*.9,0,TAU);g.fill();
    g.fillStyle=enemy?(p.ivory?P.ivory:P.cyan):P.amberHot;g.beginPath();g.arc(x,-y,r*.6,0,TAU);g.fill();
    g.fillStyle='#ffffff';g.beginPath();g.arc(x+dir*r*.15,-y-r*.15,r*.22,0,TAU);g.fill();
    if(enemy){g.strokeStyle=css(P.cyanHot,.8);g.lineWidth=.02;g.beginPath();for(let i=0;i<4;i++){const a=frame*.1+i*1.57;g.moveTo(x,-y);g.lineTo(x+Math.cos(a)*r*1.3,-y+Math.sin(a)*r*1.3);}g.stroke();}
   }
  }
  // Simulation effects with the colour grammar applied.
  for(const e of state.effects||[]){
   if(!(e.life>0))continue;
   const k=e.life/F.effectLife,col=tone(e.color??0xf1ece2),s=(e.size||.12)*(.5+k),[ex,ey]=T.at(e,alpha,frame,frozen);
   if(col===P.bone||col==='#c9b48e'||col===P.ash){
    g.fillStyle=css(col,.8*k);g.save();g.translate(ex,-ey);g.rotate(e.life*.3);g.beginPath();g.moveTo(-s,0);g.lineTo(0,-s*.8);g.lineTo(s*.7,s*.4);g.closePath();g.fill();g.restore();
   }else{
    const sp=glow(col[0]==='#'?col:P.amber);if(!sp)continue;
    g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,k*1.2);g.drawImage(sp,ex-s*2.5,-ey-s*2.5,s*5,s*5);g.globalAlpha=1;g.globalCompositeOperation='source-over';
   }
  }
  // Drops: amber motes, ivory mask shards, amber heart fragments, a whole bone mask.
  for(const d of state.drops||[]){
   if(!d.active)continue;
   if(d.life<150&&Math.floor(frame/5)%2)continue;
   const [dx,dy]=T.at(d,alpha,frame,frozen),t=frame+(frozen?0:alpha),y=dy+Math.sin(t*.06+d.x)*.1,big=d.type==='fragment'||d.type==='mask';
   const col=d.type==='shard'||d.type==='mask'?P.ivory:P.amber,sp=glow(col);
   if(sp){g.globalCompositeOperation='lighter';const s=(big?.9:.55)*(1+.1*Math.sin(frame*.1));g.globalAlpha=.7;g.drawImage(sp,dx-s,-y-s,s*2,s*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
   g.save();g.translate(dx,-y);g.rotate(Math.sin(t*.05+d.x)*.3);g.strokeStyle=P.outline;g.lineWidth=.025;
   if(d.type==='energy'){g.fillStyle=P.amberHot;g.beginPath();g.arc(0,0,.08,0,TAU);g.fill();}
   else if(d.type==='shard'){g.fillStyle=P.bone;g.beginPath();g.moveTo(-.12,.06);g.lineTo(0,-.16);g.lineTo(.13,.08);g.lineTo(0,.02);g.closePath();g.fill();g.stroke();}
   else if(d.type==='fragment'){g.fillStyle=P.amber;g.beginPath();g.moveTo(0,-.22);g.lineTo(.14,0);g.lineTo(0,.22);g.lineTo(-.14,0);g.closePath();g.fill();g.stroke();g.fillStyle=P.amberHot;g.beginPath();g.moveTo(0,-.12);g.lineTo(.06,0);g.lineTo(0,.12);g.lineTo(-.06,0);g.closePath();g.fill();}
   else{g.fillStyle=P.bone;g.beginPath();g.moveTo(0,-.24);g.quadraticCurveTo(.22,-.18,.18,.04);g.quadraticCurveTo(.1,.2,0,.26);g.quadraticCurveTo(-.1,.2,-.18,.04);g.quadraticCurveTo(-.22,-.18,0,-.24);g.fill();g.stroke();g.fillStyle=P.amber;g.fillRect(-.12,-.06,.08,.04);g.fillRect(.04,-.06,.08,.04);}
   g.restore();
  }
  // Renderer sparks last.
  for(const p of this.pool){
   if(!(p.life>0))continue;
   const k=p.life/p.max,x=p.px+(p.x-p.px)*alpha,y=p.py+(p.y-p.py)*alpha;
   if(p.add){const sp=glow(p.color);if(!sp)continue;g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,k*1.3);const s=p.size*2.6;g.drawImage(sp,x-s,-y-s,s*2,s*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
   else{g.fillStyle=css(p.color,Math.min(1,k*1.5));g.save();g.translate(x,-y);g.rotate(p.spin+p.life*.2);g.fillRect(-p.size,-p.size*.5,p.size*2,p.size);g.restore();}
  }
 }
}
