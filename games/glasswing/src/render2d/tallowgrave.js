import {TALLOW as C} from '../data/tallowgrave.js';
import {css,mix,P} from './color.js';
import {glow,surface,seeded} from './surface.js';

// Tallowgrave, the Renderer, and the Rendering Nave, drawn procedurally in world units (y up, canvas y = -y).
// Back to front: the chapel of backlit wing-membrane (or its burnt vault), the corpse columns, the giant shadow on the
// membrane (P1), wax, tears and the real spear, the shadows in the hunter's plane (soft while they creep, sharp and
// cyan-rimmed when they strike), then the Renderer itself: ivory tallow over bone with an iron wick-spear whose cyan
// flame is the light. drawTallowOver adds the light bloom, embers and the desperation dim after every character.
const TAU=Math.PI*2,L=C.arenaLeft,R=C.right,TOP=14,W0=L-1.4,W1=R+1.4;
const lerp=(a,b,t)=>a+(b-a)*t,cl=t=>t<0?0:t>1?1:t,ease=t=>{t=cl(t);return t*t*(3-2*t);};
const INK='#05030a',IRON='#2b2731',IRON_HI='#6d6672',WAX='#e9dcc0',WAX_SHADE='#a8977a',WAX_DARK='#5e5040';
const poses=new WeakMap();

// ---------- the chapel: lancets of membrane between bone mullions, cached once ----------
let tex=null;
const LANCETS=[[W0,L+4.4],[L+4.4,C.mid],[C.mid,R-4.4],[R-4.4,W1]];
function lancet(g,x0,x1,top,base){
 const m=(x0+x1)/2,h=(x1-x0)*.75;
 g.moveTo(x0,base);g.lineTo(x0,top);g.quadraticCurveTo(x0,top-h*.75,m,top-h);g.quadraticCurveTo(x1,top-h*.75,x1,top);g.lineTo(x1,base);g.closePath();
}
function veins(){
 if(tex!==null)return tex;
 const ppt=36,w=(W1-W0)*ppt,h=(TOP-1)*ppt,c=surface(w,h),g=c?.getContext?.('2d');
 if(!g){tex=false;return null;}
 const rnd=seeded('rendering-nave');
 g.setTransform(ppt,0,0,ppt,-W0*ppt,TOP*ppt);
 g.save();g.beginPath();for(const [a,b] of LANCETS)lancet(g,a+.25,b-.25,-10.6,-1);g.clip();
 // Wing cells: wavy long veins from the vault down, joined by cross-veins; scale dust in the cells.
 for(const [a,b] of LANCETS){
  const n=5,xs=[];for(let i=0;i<=n;i++)xs.push(lerp(a,b,i/n)+(rnd()-.5)*.4);
  for(let i=0;i<=n;i++){
   g.strokeStyle=css('#1a0d18',.85);g.lineWidth=.07+rnd()*.05;g.beginPath();
   for(let y=-13;y<=-1;y+=.5){const x=xs[i]+Math.sin(y*.7+i*2.1)*.18;y===-13?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
   if(i<n)for(let y=-12.5+rnd();y<-1.2;y+=.9+rnd()*1.2){
    const xa=xs[i]+Math.sin(y*.7+i*2.1)*.18,xb=xs[i+1]+Math.sin(y*.7+(i+1)*2.1)*.18,yb=y+(rnd()-.5)*.6;
    g.lineWidth=.03+rnd()*.03;g.beginPath();g.moveTo(xa,y);g.quadraticCurveTo((xa+xb)/2,y-.25,xb,yb);g.stroke();
   }
  }
  for(let k=0;k<70;k++){g.fillStyle=css(rnd()<.5?'#fff6e4':'#3b2140',.05+rnd()*.1);g.beginPath();g.arc(lerp(a,b,rnd()),-1-rnd()*11.5,.04+rnd()*.12,0,TAU);g.fill();}
 }
 g.restore();
 // Rows of rendered dead behind the membrane, backlit: slumped candle columns in silhouette.
 for(let row=0;row<2;row++)for(let x=W0+.6+row*1.3;x<W1;x+=2.6){
  const hh=2.2+rnd()*1.6-row*.6,ww=.45+rnd()*.25;
  g.fillStyle=css('#0c0610',.55+row*.15);g.beginPath();g.moveTo(x-ww,-1);
  for(let y=0;y<=hh;y+=.35)g.lineTo(x-ww*(1-y/hh*.35)+Math.sin(y*3+x)*.08,-1-y);
  g.quadraticCurveTo(x,-1-hh-.35,x+ww*.65,-1-hh);
  for(let y=hh;y>=0;y-=.35)g.lineTo(x+ww*(1-y/hh*.35)+Math.sin(y*2.6+x*2)*.08,-1-y);
  g.closePath();g.fill();
 }
 tex=c;return c;
}

function backdrop(g,e,frame,cam){
 // The P2 transition burns the membrane away over its first second (the fire front runs down the lancets) while the
 // Renderer is still behind it; the light and the giant shadow's scale glide (smoothPose), so nothing pops.
 const st=poses.get(e),veil=e.ai==='transition'&&e.phase===2?1-e.burn:e.behind?1:0,l={x:st?st.lx:e.light.x,y:st?st.ly:e.light.y},k=st?st.k:C.light.k[e.light.tier];
 const v=g.createLinearGradient(0,-TOP,0,-1);v.addColorStop(0,'#070409');v.addColorStop(.6,'#140a16');v.addColorStop(1,'#1e1018');
 g.fillStyle=v;g.fillRect(W0-2,-TOP-2,W1-W0+4,TOP+1.02);
 // Lights: the stolen heart-light behind the membrane (P1), the spear and the vault lamp (P2), the pyre (P3).
 const lights=[],out=e.dead?Math.max(0,1-(poses.get(e)?.melt||0)*2):1;
 if(e.behind||veil>0)lights.push([l.x,l.y+.8,e.behind?6.5+(k-3)*.9:8,.95,P.cyanHot]);
 else lights.push([l.x,l.y,e.pyre?11:8,(e.pyre?.5:.34)*out*(e.ai==='open'&&e.openKind!=='flare'?.35:1),e.pyre?P.cyan:P.cyanHot]);
 if(e.lamp)lights.push([e.lamp.x,e.lamp.y,9,.32*out*(e.act?.id==='snuff'&&e.act.which==='lamp'?1-ease(1-e.act.t/Math.max(1,e.act.T)):1),P.cyanHot]);
 g.save();g.beginPath();for(const [a,b] of LANCETS)lancet(g,a+.25,b-.25,-10.6,-1);g.clip();
 g.fillStyle=css('#24131f',.35+.65*veil);g.fillRect(W0,-TOP,W1-W0,TOP-1);
 if(veil<1)vault(g,frame,veil);
 if(veil>0)glowAt(g,lights,veil);
 const t=veins();if(t&&veil>0){g.globalAlpha=.4+.6*veil;g.drawImage(t,W0,-TOP,W1-W0,TOP-1);g.globalAlpha=1;}
 // P1: the Renderer's shadow on the membrane, huge (near light) or small and sharp (far), rimmed in cyan.
 if(e.behind&&veil>0){g.globalAlpha=veil;giantShadow(g,e,frame);g.globalAlpha=1;}
 if(veil<1)burnt(g,frame,veil);
 g.restore();
 // In the open Nave the lights wash the chapel: the shadows read against them.
 if(veil<1)glowAt(g,lights,1-veil);
 for(const tr of e.tears){
  if(veil<=0)break;
  const a=Math.min(1,tr.t/30);
  g.fillStyle=css(INK,.9*a);g.beginPath();g.ellipse(tr.x,-tr.y,.2,.75,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';const sp=glow(P.cyanHot);if(sp){g.globalAlpha=.55*a;g.drawImage(sp,tr.x-1,-tr.y-1.3,2,2.6);g.globalAlpha=1;}
  g.strokeStyle=css(P.cyan,.7*a);g.lineWidth=.05;g.beginPath();g.ellipse(tr.x,-tr.y,.24,.8,0,0,TAU);g.stroke();
  g.globalCompositeOperation='source-over';
 }
 mullions(g,frame);
}
function glowAt(g,lights,k){
 g.globalCompositeOperation='lighter';
 for(const [x,y,r,a,c] of lights){
  const rg=g.createRadialGradient(x,-y,0,x,-y,r);
  rg.addColorStop(0,css(c,a*k));rg.addColorStop(.3,css(mix(c,'#b48fc0',.35),a*.42*k));rg.addColorStop(1,css('#3b2140',0));
  g.fillStyle=rg;g.fillRect(x-r,-y-r,r*2,r*2);
 }
 g.globalCompositeOperation='source-over';
}
function mullions(g,frame){
 // Bone ribs of the god's wing framing the lancets, a vault arch above, a wax-glazed floor line below.
 for(const [a,b] of LANCETS){
  g.strokeStyle=css('#120a12',1);g.lineWidth=.62;g.lineJoin='round';g.beginPath();lancet(g,a+.25,b-.25,-10.6,-.9);g.stroke();
  const v=g.createLinearGradient(a,0,a+.5,0);v.addColorStop(0,P.boneDark);v.addColorStop(.5,P.boneShade);v.addColorStop(1,'#3a2f28');
  g.strokeStyle=v;g.lineWidth=.36;g.beginPath();lancet(g,a+.25,b-.25,-10.6,-.9);g.stroke();
  g.strokeStyle=css(P.boneRim,.25);g.lineWidth=.06;g.beginPath();lancet(g,a+.17,b-.33,-10.6,-.9);g.stroke();
 }
 g.fillStyle=css('#0d070d',1);g.fillRect(W0-2,-TOP-2,W1-W0+4,1.6);
 // The floor: a sheen of old tallow over the bone.
 const f=g.createLinearGradient(0,-1.12,0,-.9);f.addColorStop(0,css(WAX,.0));f.addColorStop(.5,css(WAX,.22));f.addColorStop(1,css(WAX_DARK,.0));
 g.fillStyle=f;g.fillRect(L,-1.12,R-L,.24);
}
function vault(g,frame,veil){
 // Beyond the membrane: the Nave's dark vault, far rows of candles (cyan points) on their wax columns.
 const v=g.createLinearGradient(0,-TOP,0,-1);v.addColorStop(0,'#030205');v.addColorStop(1,'#140a14');
 g.fillStyle=v;g.globalAlpha=1-veil;g.fillRect(W0,-TOP,W1-W0,TOP-1);g.globalAlpha=1;
 const rnd=seeded('vault');
 for(let i=0;i<46;i++){const x=lerp(W0,W1,rnd()),y=1.5+rnd()*7,f=.5+.5*Math.sin(frame*.07+i*1.7);g.fillStyle=css('#1a1018',(1-veil));g.fillRect(x-.08,-y+.04,.16,.5+rnd()*.6);g.fillStyle=css(P.cyan,(.25+.4*f)*(1-veil));g.fillRect(x-.03,-y-.08,.06,.12);}
}
function burnt(g,frame,veil){
 // Tatters along the top of every lancet, charred; the edge glows amber and cyan while the fire runs.
 const front=1+(1-veil)*11;
 for(const [a,b] of LANCETS){
  g.fillStyle=css('#1a0e16',.95);g.beginPath();g.moveTo(a,-11.4);
  for(let x=a;x<=b;x+=.3){const hang=front<11?TOP:10.4-(.5+.5*Math.sin(x*5.1))*1.4-(Math.sin(x*2.3)+1)*.6;g.lineTo(x,-Math.max(front,hang));}
  g.lineTo(b,-11.4);g.closePath();g.fill();
  if(veil>0&&veil<1){
   g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.9);g.lineWidth=.12;g.beginPath();
   for(let x=a;x<=b;x+=.25){const y=front+Math.sin(x*4+frame*.3)*.25;x===a?g.moveTo(x,-y):g.lineTo(x,-y);}g.stroke();
   g.strokeStyle=css(P.cyan,.6);g.lineWidth=.05;g.stroke();g.globalCompositeOperation='source-over';
  }
 }
}

// ---------- the Renderer's rig: one skeleton for the body and for its shadow ----------
const v=(a,d)=>[d*Math.sin(a),-Math.cos(a)];
function poseFor(e,frame){
 const a=e.act,q=a?1-a.t/Math.max(1,a.T):0,p={lean:.06,kneel:0,aF:1.05,eF:1,aB:.35,eB:.5,spear:Math.PI-.22,walk:0,bob:Math.sin(frame*.05)*.05,flame:1,head:0};
 if(e.ai==='open'||e.open>0&&!e.behind){
  // The flare kneels too, so the exposed heart sits where the hunter's blows land.
  const k=e.openKind==='flare'?0:1;Object.assign(p,{kneel:k||.8,lean:k?.42:.3,aF:k?.55:1.9,eF:.3,aB:k?.2:1.9,eB:.2,spear:k?.5:Math.PI-.5,flame:k?.25:1.6,head:k?.4:-.25});
  return p;
 }
 if(e.ai==='spent'||e.dead)return Object.assign(p,{kneel:1,lean:.6,aF:.2,eF:.1,aB:.1,eB:.1,spear:.3,flame:.15,head:.7});
 if(e.ai==='transition')return Object.assign(p,e.phase===3?{aF:2.7,eF:.2,spear:Math.PI-.05,lean:-.18,aB:2.3,eB:.3,flame:1.6}:{lean:.18,aF:1.6,eF:.4,spear:Math.PI/2+.25,walk:frame*.12});
 if(!a)return p;
 if(a.id==='sweep'){
  // The box is live from the first active frame, so the swing crosses it in about two frames (never trails it).
  const sub=a.sub,act=a.stage==='active'?Math.min(1,(1-a.t/C.moves.sweep.active)*3+.5):a.stage==='after'?1:0;
  if(sub==='thrust'){
   // A low lunge: it crouches with the spear level at the hunter's hip, where the box is (the core reaches as far).
   const reach=e.glass?2:1;
   if(a.stage==='tell')Object.assign(p,{kneel:.8*ease(q),lean:lerp(.06,.55,ease(q)),aF:lerp(1.05,.35,ease(q)),eF:lerp(1,.9,ease(q)),spear:Math.PI/2,aB:.9,reach});
   else Object.assign(p,{kneel:1,lean:.9,aF:.75,eF:0,spear:Math.PI/2,aB:-.3,eB:.4,reach});
  }else if(sub==='low'){
   if(a.stage==='tell')Object.assign(p,{lean:-.1,aF:lerp(1.05,-.5,ease(q)),eF:.5,spear:lerp(Math.PI-.22,-.9,ease(q)),aB:1});
   // The blade skims the floor through its whole live box, and only rises in the follow-through.
   else if(a.stage==='active')Object.assign(p,{lean:.3,kneel:.35,aF:lerp(-.5,.75,ease(act)),eF:.15,spear:lerp(-.9,1.2,ease(act)),aB:.2});
   else{const u=ease(1-a.t/C.moves.sweep.after);Object.assign(p,{lean:lerp(.3,.22,u),kneel:lerp(.35,0,u),aF:lerp(.75,1.7,u),eF:.15,spear:lerp(1.2,Math.PI/2+.55,u),aB:.2});}
  }else{
   if(a.stage==='tell')Object.assign(p,{lean:-.12,aF:lerp(1.05,2.9,ease(q)),eF:.4,spear:lerp(Math.PI-.22,Math.PI+.7,ease(q)),aB:.6});
   else Object.assign(p,{lean:.18,aF:lerp(2.9,1.55,ease(act)),eF:.1,spear:lerp(Math.PI+.7,Math.PI/2-.15,ease(act)),aB:.3});
  }
 }else if(a.id==='grasp')Object.assign(p,{spreadF:1,spreadB:1,aF:lerp(1.05,2.7,ease(q*1.5)),eF:.25,aB:lerp(.35,2.6,ease(q*1.5)),eB:.25,lean:-.12,spear:Math.PI-.05});
 else if(a.id==='snuff')Object.assign(p,{aB:a.which==='spear'?1.95:2.5,eB:a.which==='spear'?1.2:.2,aF:1.2,eF:.9,flame:a.which==='spear'?lerp(1,.15,ease(q)):1});
 else if(a.id==='pulse')Object.assign(p,{spreadF:1,spreadB:1,aF:lerp(1.05,2,ease(q)),aB:lerp(.35,2,ease(q)),eF:.1,eB:.1,lean:-.15,flame:1+ease(q)});
 else if(a.id==='stride')Object.assign(p,{walk:frame*.16,lean:.16});
 else if(a.id==='pour')Object.assign(p,{aF:2.2,eF:.6,aB:1.6,eB:.6,lean:-.08});
 else if(a.id==='palm')Object.assign(p,{spreadF:1,aF:lerp(1.05,2.8,ease(q*1.6)),eF:lerp(1,.2,ease(q)),spear:Math.PI-.4,lean:-.05+.3*ease(q)});
 else if(a.id==='rake')Object.assign(p,{spreadF:1.2,aF:lerp(1.05,1.9,ease(q)),eF:.5,lean:.3,kneel:.35});
 else if(a.id==='tear')Object.assign(p,{aF:a.stage==='tell'?lerp(1.05,.5,ease(q)):1.55,eF:a.stage==='tell'?1.6:.05,spear:Math.PI/2,lean:a.stage==='tell'?-.15:.3});
 else if(a.id==='race')Object.assign(p,{lean:.7,kneel:.5,aF:-.3,aB:-.5});
 return p;
}
function smoothPose(e,frame){
 let st=poses.get(e);
 const t=poseFor(e,frame);t.spreadF??=0;t.spreadB??=.3;t.reach??=1;
 if(!st){st={pose:{...t},melt:0,last:frame,lx:e.light.x,ly:e.light.y,k:C.light.k[e.light.tier]};poses.set(e,st);return st;}
 const a=e.act,fast=a&&a.stage==='active'&&(a.id==='sweep'||a.id==='race'),step=frame!==st.last,k=step?(fast?.8:.32):0;st.last=frame;
 for(const n in t)st.pose[n]=n==='walk'||n==='bob'?t[n]:lerp(st.pose[n],t[n],k);
 // The light glides when it turns or is shoved (no bloom pop), and so does the giant shadow's scale.
 if(step){st.lx=lerp(st.lx,e.light.x,.22);st.ly=lerp(st.ly,e.light.y,.22);st.k=lerp(st.k,C.light.k[e.light.tier],.18);}
 return st;
}
function rig(x,y,dir,p,s=1){
 const at=(o,a,l)=>{const [dx,dy]=v(a,dir);return [o[0]+dx*l*s,o[1]+dy*l*s];};
 const kn=p.kneel,hip=[x+dir*.1*s,y+(3.2-1.25*kn+p.bob)*s];
 const chest=at(hip,Math.PI-p.lean,1.75),neck=[chest[0]+dir*(.12+.3*p.head)*s,chest[1]+(.72-.2*p.head)*s],head=[neck[0]+dir*(.22+.25*p.head)*s,neck[1]+(.5-.3*p.head)*s];
 const sF=[chest[0]+dir*.36*s,chest[1]+.32*s],sB=[chest[0]-dir*.3*s,chest[1]+.4*s];
 const arm=(sh,a,b)=>{const el=at(sh,a,1.55);return [sh,el,at(el,a+b,1.5)];};
 const F=arm(sF,p.aF,p.eF),B=arm(sB,p.aB,p.eB),legs=[];
 for(const side of [1,-1]){
  // Digitigrade legs: the thigh swings with the walk, the shin angles back; kneeling plants the back knee.
  const ph=Math.sin(p.walk+(side>0?0:Math.PI)),front=side>0;
  const th=.3+ph*.35+(front?kn*1.1:-kn*.2),sh=-.75-ph*.15+(front?kn*.75:-kn*.82);
  const knee=at(hip,th,1.75),ankle=at(knee,sh,1.35),ground=y+Math.max(0,ph)*.18*s*(1-kn);
  ankle[1]=Math.max(ankle[1],ground+.3*s);
  legs.push([hip,knee,ankle,[ankle[0]+dir*.55*s,ground]]);
 }
 const hand=F[2],tip=at(hand,p.spear,3.3*(p.reach||1)),butt=at(hand,p.spear+Math.PI,2.3);
 return {hip,chest,neck,head,F,B,legs,tip,butt,hand,s,dir,aF:p.aF,eF:p.eF,aB:p.aB,eB:p.eB,spreadF:p.spreadF||0,spreadB:p.spreadB||0};
}
function shifted(r,dx){
 const m=p=>[p[0]+dx,p[1]];
 return {...r,hip:m(r.hip),chest:m(r.chest),neck:m(r.neck),head:m(r.head),hand:m(r.hand),tip:m(r.tip),butt:m(r.butt),F:r.F.map(m),B:r.B.map(m),legs:r.legs.map(l=>l.map(m))};
}
function limb(g,a,b,w0,w1,fill){
 const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*.5,ny=dx/l*.5;
 g.fillStyle=fill;g.beginPath();
 g.moveTo(a[0]+nx*w0,-(a[1]+ny*w0));g.lineTo(b[0]+nx*w1,-(b[1]+ny*w1));g.lineTo(b[0]-nx*w1,-(b[1]-ny*w1));g.lineTo(a[0]-nx*w0,-(a[1]-ny*w0));g.closePath();g.fill();
 g.beginPath();g.arc(a[0],-a[1],w0/2,0,TAU);g.fill();g.beginPath();g.arc(b[0],-b[1],w1/2,0,TAU);g.fill();
}
// Parts of the silhouette, drawn in one fill (the shadow on the membrane, the outline pass, the rim pass).
function hand(g,A,a,s,o,fill,spread){
 // A long-fingered renderer's hand: a palm and four bone fingers that fan open (spread) or close on the spear.
 const w=A[2],[dx,dy]=v(a,1),d=Math.sign(A[2][0]-A[1][0])||1;
 g.fillStyle=fill;g.beginPath();g.ellipse(w[0],-w[1],.2*s+o/2,.15*s+o/2,Math.atan2(-dy,dx*d),0,TAU);g.fill();
 for(let i=0;i<4;i++){const f=a+(i-1.5)*(.18+.25*spread),[fx,fy]=[d*Math.abs(Math.sin(f))*Math.sign(Math.sin(f)||1),-Math.cos(f)],l=(.55+.12*(i===1||i===2))*s;
  limb(g,w,[w[0]+fx*l,w[1]+fy*l],.09*s+o,.04*s+o,fill);}
}
function drape(g,r,s,o,fill,frame){
 // The robe of poured tallow: from the shoulders to a dripping hem on the floor, swaying with its steps.
 const d=r.dir,c=r.chest,h=r.hip,y0=Math.min(r.legs[0][3][1],r.legs[1][3][1])+.35*s,sw=Math.sin(frame*.04+r.hip[0])*.08*s,lean=(c[0]-h[0]);
 const hw=1.35*s+o,mid=h[0]+lean*.3;
 g.fillStyle=fill;g.beginPath();
 g.moveTo(c[0]+d*.55*s+o*d,-(c[1]+.35*s+o));
 g.quadraticCurveTo(h[0]+d*.9*s+o*d,-(h[1]),mid+d*hw+sw,-(y0-o));
 for(let i=1;i<10;i++){const t=i/10,x=lerp(mid+d*hw,mid-d*hw*1.05,t)+sw*(1-t),dr=(i%3===1?.55:i%2?.25:.08)*s;g.lineTo(x,-(y0-dr-o));g.lineTo(x-d*.08*s,-(y0-o));}
 g.lineTo(mid-d*hw*1.1+sw*.2,-(y0-o));
 g.quadraticCurveTo(h[0]-d*1.15*s-o*d,-(h[1]+.6*s),c[0]-d*.75*s-o*d,-(c[1]+.45*s+o));
 g.closePath();g.fill();
}
function hood(g,r,s,o,fill){
 // A hood of melted tallow framing the skull; drips hang from its rim over the shoulders.
 const H=r.head,d=r.dir;
 g.fillStyle=fill;g.beginPath();
 g.moveTo(H[0]+d*.42*s+o*d,-(H[1]+.2*s));
 g.quadraticCurveTo(H[0]+d*.3*s,-(H[1]+.85*s+o),H[0]-d*.35*s,-(H[1]+.72*s+o));
 g.quadraticCurveTo(H[0]-d*.95*s-o*d,-(H[1]+.1*s),H[0]-d*.75*s-o*d,-(H[1]-.75*s-o));
 for(let i=0;i<5;i++){const x=lerp(H[0]-d*.75*s,H[0]+d*.25*s,i/4),l=(i%2?.35:.18)*s;g.lineTo(x,-(H[1]-.6*s-l-o));g.lineTo(x+d*.1*s,-(H[1]-.62*s-o));}
 g.closePath();g.fill();
}
function silhouette(g,r,fill,grow=0,frame=0){
 const s=r.s,o=grow;
 for(const lg of r.legs){limb(g,lg[1],lg[2],.4*s+o,.24*s+o,fill);limb(g,lg[2],lg[3],.24*s+o,.1*s+o,fill);}
 drape(g,r,s,o,fill,frame);
 limb(g,r.hip,r.chest,.9*s+o,1.35*s+o,fill);limb(g,r.chest,r.neck,.62*s+o,.34*s+o,fill);
 // The hunch: the mantle over the shoulders, a hump of tallow behind the neck.
 g.fillStyle=fill;g.beginPath();g.ellipse(r.chest[0]-r.dir*.25*s,-(r.chest[1]+.42*s),.85*s+o/2,.55*s+o/2,r.dir*.35,0,TAU);g.fill();
 hood(g,r,s,o,fill);
 g.fillStyle=fill;g.beginPath();g.ellipse(r.head[0]+r.dir*.08*s,-r.head[1],.38*s+o/2,.52*s+o/2,r.dir*.3,0,TAU);g.fill();
 for(const [A,a,sp] of [[r.B,r.aB+r.eB,r.spreadB],[r.F,r.aF+r.eF,r.spreadF]]){limb(g,A[0],A[1],.5*s+o,.34*s+o,fill);limb(g,A[1],A[2],.22*s+o,.14*s+o,fill);hand(g,A,a,s,o,fill,sp);}
 limb(g,r.butt,r.tip,.15*s+o,.09*s+o,fill);
 for(let i=-1;i<=1;i++){const bx=r.head[0]+(i*.2-r.dir*.05)*s,by=r.head[1]+.62*s;limb(g,[bx,by],[bx+i*.14*s,by+(.55-Math.abs(i)*.18)*s],.1*s+o,.05*s+o,fill);}
}
function giantShadow(g,e,frame){
 const st=smoothPose(e,frame),k=st.k,sc=.75+.24*k,x=e.pbx+(e.bx-e.pbx)*.5;
 const r=rig(x,1-7*sc*.4+(e.ai==='enter'?(e.aiTimer/e.aiFrames)*6:0),e.facing,st.pose,sc);
 g.globalCompositeOperation='lighter';silhouette(g,r,css(P.cyan,.08),.55,frame);silhouette(g,r,css(P.cyan,.2),.18,frame);g.globalCompositeOperation='source-over';
 silhouette(g,r,INK,0,frame);
}

// ---------- corpse columns, wax, lamp ----------
function column(g,x,frame,lit,seed,fade=1){
 const c=C.column,rnd=seeded('col'+seed),h=c.h,w=c.w;
 g.fillStyle=css('#0d080c',.5);g.beginPath();g.ellipse(x,-1.02,w*.95,.12,0,0,TAU);g.fill();
 const v=g.createLinearGradient(x-w,0,x+w,0);v.addColorStop(0,lit<0?WAX:WAX_SHADE);v.addColorStop(.5,WAX);v.addColorStop(1,lit>0?WAX:WAX_DARK);
 g.fillStyle=v;g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.moveTo(x-w*.62,-1);
 for(let y=0;y<=h;y+=.3)g.lineTo(x-w*(.62-y/h*.14)+Math.sin(y*2.7+seed)*.06,-1-y);
 g.lineTo(x+w*.48,-1-h);for(let y=h;y>=0;y-=.3)g.lineTo(x+w*(.62-y/h*.14)+Math.sin(y*3.1+seed*2)*.06,-1-y);g.closePath();g.fill();g.stroke();
 // The rendered dead: slumped skulls and arms in the wax, drips hardened down the sides.
 for(let i=0;i<4;i++){
  const y=.6+i*1.05+rnd()*.3,sx=x+(rnd()-.5)*w*.5;
  g.fillStyle=css(WAX_SHADE,.9);g.beginPath();g.ellipse(sx,-1-y,.2,.17,0,0,TAU);g.fill();
  g.fillStyle=css('#2a1e20',.85);g.beginPath();g.arc(sx-.07,-1-y+.02,.04,0,TAU);g.arc(sx+.07,-1-y+.02,.04,0,TAU);g.fill();
  g.strokeStyle=css(WAX_DARK,.6);g.lineWidth=.06;g.beginPath();g.moveTo(sx+.15,-1-y-.1);g.quadraticCurveTo(sx+.45,-1-y+.2,sx+.25,-1-y+.55);g.stroke();
 }
 g.strokeStyle=css(P.boneRim,.35);g.lineWidth=.035;for(let i=0;i<3;i++){const dx=x+(i-1)*w*.3;g.beginPath();g.moveTo(dx,-1-h+.05);g.lineTo(dx+.02,-1-h+.5+rnd()*1.4);g.stroke();}
 // Its candle: a short wick with a cold cyan flame (all go dark when the Renderer dies).
 g.strokeStyle='#1a1214';g.lineWidth=.05;g.beginPath();g.moveTo(x,-1-h);g.lineTo(x,-1-h-.18);g.stroke();
 if(lit!==null)flame(g,x,1+h+.18,.16,frame+seed*7,P.cyan,(lit===0?.5:1)*fade);
}
function flame(g,x,y,sz,t,col,a=1){
 if(a<=0)return;
 const f=1+.18*Math.sin(t*.5)+.1*Math.sin(t*1.3);
 g.globalCompositeOperation='lighter';
 const sp=glow(col);if(sp){g.globalAlpha=.65*a;g.drawImage(sp,x-sz*3,-y-sz*3.4,sz*6,sz*6);g.globalAlpha=1;}
 g.fillStyle=css(col,.85*a);g.beginPath();g.moveTo(x-sz*.5,-y);g.quadraticCurveTo(x-sz*.6,-y-sz*1.2*f,x+Math.sin(t*.4)*sz*.3,-y-sz*2.4*f);g.quadraticCurveTo(x+sz*.6,-y-sz*1.2*f,x+sz*.5,-y);g.closePath();g.fill();
 g.fillStyle=css(P.cyanHot,.9*a);g.beginPath();g.ellipse(x,-y-sz*.55,sz*.22,sz*.5*f,0,0,TAU);g.fill();
 g.globalCompositeOperation='source-over';
}
function lamp(g,e,frame){
 const l=e.lamp;if(!l)return;
 const a=e.act,dim=a?.id==='snuff'&&a.which==='lamp'?1-ease(1-a.t/Math.max(1,a.T)):a?.id==='snuff'&&a.stage==='active'&&a.which==='lamp'?0:1;
 g.strokeStyle='#2b2731';g.lineWidth=.06;g.beginPath();for(let y=TOP;y>l.y+.5;y-=.25){const sw=Math.sin(frame*.03)*.05*(TOP-y);g.lineTo(l.x+sw,-y);}g.stroke();
 g.fillStyle='#1a1418';g.strokeStyle=P.boneShade;g.lineWidth=.05;g.beginPath();g.moveTo(l.x-.35,-l.y-.5);g.lineTo(l.x+.35,-l.y-.5);g.lineTo(l.x+.25,-l.y+.45);g.lineTo(l.x-.25,-l.y+.45);g.closePath();g.fill();g.stroke();
 flame(g,l.x,l.y-.25,.3,frame,P.cyan,dim*(e.dead?Math.max(0,1-(poses.get(e)?.melt||0)*2):1));
 g.strokeStyle=P.boneDark;g.lineWidth=.05;for(const d of [-.3,0,.3]){g.beginPath();g.moveTo(l.x+d,-l.y-.5);g.lineTo(l.x+d*.8,-l.y+.45);g.stroke();}
}
function wax(g,e,frame){
 for(const o of e.pools){
  const x=(o.x0+o.x1)/2,hw=(o.x1-o.x0)/2;
  if(!o.hard){
   const a=Math.min(1,(C.moves.pour.pool-o.t)/10+.3);
   g.globalCompositeOperation='lighter';const sp=glow(P.amberHot);if(sp){g.globalAlpha=.25*a;g.drawImage(sp,x-hw*1.4,-1.6,hw*2.8,1.3);g.globalAlpha=1;}g.globalCompositeOperation='source-over';
   g.fillStyle=css(WAX,.92);g.beginPath();g.ellipse(x,-1.03,hw,.13+.03*Math.sin(frame*.2),0,0,TAU);g.fill();
   g.fillStyle=css(P.ivory,.8);g.beginPath();g.ellipse(x-hw*.3,-1.07,hw*.35,.04,0,0,TAU);g.fill();
  }else{
   // A cooled pew: a slab of tallow you can stand on, drips frozen down its face.
   const melt=o.t<40?o.t/40:1,top=1+melt;
   const v=g.createLinearGradient(0,-top,0,-1);v.addColorStop(0,P.boneRim);v.addColorStop(.3,WAX);v.addColorStop(1,WAX_SHADE);
   g.fillStyle=v;g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.moveTo(o.x0,-1);g.lineTo(o.x0+.08,-top+.1);g.quadraticCurveTo(x,-top-.12,o.x1-.08,-top+.1);g.lineTo(o.x1,-1);g.closePath();g.fill();g.stroke();
   g.strokeStyle=css(WAX_DARK,.5);g.lineWidth=.06;for(let i=0;i<4;i++){const dx=lerp(o.x0+.2,o.x1-.2,i/3);g.beginPath();g.moveTo(dx,-top+.12);g.lineTo(dx,-top+.3+((i*37)%5)*.08);g.stroke();}
  }
 }
 for(const o of e.trails){
  const a=Math.min(1,o.t/40),x=(o.x0+o.x1)/2;
  g.fillStyle=css('#1d2f38',.7*a);g.fillRect(o.x0,-1.06,o.x1-o.x0,.08);
  for(let i=0;i<3;i++)flame(g,lerp(o.x0+.15,o.x1-.15,i/2),1.02,.1+.03*i,frame+i*9+x*5,P.cyan,a*.8);
 }
 const a=e.act;
 if(a?.id==='pour'){
  const top=e.behind?C.moves.pour.y-1:C.moves.pour.y+1.5;
  if(a.stage==='tell'){
   // Drips gather, falling drops mark the column, the floor glows where it will land.
   const q=1-a.t/a.T;
   for(let i=0;i<5;i++){const y=top-((frame*.25+i*1.7)%(top-1));g.fillStyle=css(WAX,.55+.3*q);g.beginPath();g.ellipse(a.x+Math.sin(i)*.05,-y,.05,.1,0,0,TAU);g.fill();}
   g.globalCompositeOperation='lighter';const sp=glow(P.cyanHot);if(sp){g.globalAlpha=.25+.5*q;g.drawImage(sp,a.x-.7,-1.5,1.4,1);g.globalAlpha=1;}g.globalCompositeOperation='source-over';
   g.strokeStyle=css(P.cyan,.15+.35*q);g.lineWidth=.03;g.setLineDash?.([.15,.15]);g.beginPath();g.moveTo(a.x-.45,-1);g.lineTo(a.x-.45,-top);g.moveTo(a.x+.45,-1);g.lineTo(a.x+.45,-top);g.stroke();g.setLineDash?.([]);
  }else if(a.stage==='active'){
   const v=g.createLinearGradient(a.x-.45,0,a.x+.45,0);v.addColorStop(0,css(WAX_SHADE,.9));v.addColorStop(.5,css(P.ivory,1));v.addColorStop(1,css(WAX_SHADE,.9));
   g.fillStyle=v;g.fillRect(a.x-.45,-top,.9,top-1);
   g.globalCompositeOperation='lighter';g.fillStyle=css(P.cyanHot,.35);g.fillRect(a.x-.12,-top,.24,top-1);g.globalCompositeOperation='source-over';
   g.fillStyle=css(WAX,1);g.beginPath();g.ellipse(a.x,-1.05,.9,.2,0,0,TAU);g.fill();
  }
 }
 for(const f of e.falls)if(f.t<=C.falls.warn){
  const q=1-f.t/C.falls.warn;
  g.fillStyle=css(P.amber,.08+.22*q);g.fillRect(f.x-.1,-C.falls.y,.2,C.falls.y-1);
  for(let i=0;i<4;i++){const y=C.falls.y-((frame*.12+i*.9)%(C.falls.y-1));g.fillStyle=css(P.amberHot,.5*q+.2);g.fillRect(f.x-.03+Math.sin(i*3+frame*.2)*.08,-y,.06,.06);}
  g.fillStyle=css(P.amber,.3*q);g.beginPath();g.ellipse(f.x,-1.03,.45*q+.1,.06,0,0,TAU);g.fill();
 }
}

// ---------- the real spear through the membrane (P1) ----------
function spearP1(g,e,frame){
 const a=e.act;if(a?.id!=='tear')return;
 const q=a.stage==='tell'?1-a.t/a.T:1,y=a.y,dir=a.dir;let x=a.x;
 if(a.stage==='tell'){
  // The silk bulges, then splits; an ivory ring flashes at the point the spear will come out: parry it.
  const r=.35+.5*ease(q),sp=glow(P.ivory);
  g.globalCompositeOperation='lighter';if(sp){g.globalAlpha=.25+.55*q;g.drawImage(sp,x-r*2,-y-r*2,r*4,r*4);g.globalAlpha=1;}
  g.strokeStyle=css(P.ivory,.5+.5*q);g.lineWidth=.06+.05*q;g.beginPath();g.ellipse(x+dir*.15,-y,r,r*.85,0,0,TAU);g.stroke();
  if(Math.floor(frame/3)%2){g.strokeStyle=css('#ffffff',.8);g.lineWidth=.03;g.beginPath();g.ellipse(x+dir*.15,-y,r*1.35,r*1.15,0,0,TAU);g.stroke();}
  g.globalCompositeOperation='source-over';
  g.fillStyle=IRON_HI;g.beginPath();g.moveTo(x,-y-.08);g.lineTo(x+dir*.35*q,-y);g.lineTo(x,-y+.08);g.closePath();g.fill();
  return;
 }
 const len=a.len,tip=x+dir*len,stuck=a.stage==='jam'||a.stage==='stun',st=poses.get(e);
 // A parry drags the wrist through the silk to the hunter: the shaft's base glides there (the tip stays put).
 if(st){if(st.tear!==a){st.tear=a;st.tx=x;st.tf=frame;}else if(frame!==st.tf){st.tf=frame;st.tx=lerp(st.tx,x,.35);}x=st.tx;}
 if(!stuck){
  // The ivory band is exactly the shaft's hitbox (tear.r above and below): parry it, or clear it.
  const r=C.moves.tear.r;g.globalCompositeOperation='lighter';g.lineCap='butt';
  g.strokeStyle=css(P.ivory,.14);g.lineWidth=r*2;g.beginPath();g.moveTo(x,-y);g.lineTo(tip,-y);g.stroke();
  g.strokeStyle=css(P.ivory,.4);g.lineWidth=.025;g.beginPath();g.moveTo(x,-y-r);g.lineTo(tip,-y-r);g.moveTo(x,-y+r);g.lineTo(tip,-y+r);g.stroke();
  g.globalCompositeOperation='source-over';
 }
 g.strokeStyle=IRON;g.lineWidth=.16;g.lineCap='round';g.beginPath();g.moveTo(x-dir*.2,-y);g.lineTo(tip-dir*.5,-y);g.stroke();
 g.strokeStyle=css(IRON_HI,.8);g.lineWidth=.04;g.beginPath();g.moveTo(x,-y-.04);g.lineTo(tip-dir*.5,-y-.04);g.stroke();
 g.fillStyle=IRON_HI;g.strokeStyle=P.outline;g.lineWidth=.03;g.beginPath();g.moveTo(tip-dir*.6,-y-.2);g.quadraticCurveTo(tip-dir*.1,-y-.12,tip+dir*.25,-y);g.quadraticCurveTo(tip-dir*.1,-y+.12,tip-dir*.6,-y+.2);g.closePath();g.fill();g.stroke();
 flame(g,tip,y+.02,.13,frame,P.cyan,stuck?.4:1);
 // Ivory flash on the shaft while it holds (parry window); amber wrist stitches when jammed.
 if(stuck){
  const op=Math.max(0,e.open/Math.max(1,e.openMax));
  g.fillStyle=WAX;g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.ellipse(x+dir*.4,-y,.55,.36,0,0,TAU);g.fill();g.stroke();
  for(let i=0;i<4;i++){const sx=x+dir*(.15+i*.6);limb(g,[sx,y+.25],[sx+dir*.18,y-.25],.07,.05,css(P.amberHot,.95));}
  g.globalCompositeOperation='lighter';const sp=glow(P.amber);if(sp){g.globalAlpha=.4+.5*op;g.drawImage(sp,x+dir*.9-1.6,-y-1.6,3.2,3.2);g.globalAlpha=1;}g.globalCompositeOperation='source-over';
  g.strokeStyle=css(P.amber,.9);g.lineWidth=.06;g.beginPath();g.moveTo(x+dir*.9,-y-.4);g.lineTo(x+dir*1.3,-y);g.lineTo(x+dir*.9,-y+.4);g.stroke();
 }
}

// ---------- the shadows in the hunter's plane ----------
function soft(g,x0,x1,y0,y1,q,draw){
 // Soft while it creeps (wide faint passes), sharp and dark as it is about to strike.
 const blur=(1-q)*.9;
 for(let i=2;i>=1;i--){g.globalAlpha=(.1+.12*q)/i;draw(blur*i*.5);}
 g.globalAlpha=.45+.52*ease(q);draw(0);g.globalAlpha=1;
}
function rim(g,path,q,strike,frame){
 g.globalCompositeOperation='lighter';
 g.strokeStyle=css(P.cyan,(strike?.35:.1*q));g.lineWidth=strike?.4:.25;path();g.stroke();
 g.strokeStyle=css(P.cyan,strike?1:.25+.65*q*q);g.lineWidth=strike?.1:.04+.05*q;path();g.stroke();
 if(strike||q>.7){g.strokeStyle=css(P.cyanHot,strike?.8:(q-.7)*1.6);g.lineWidth=.035;path();g.stroke();}
 g.globalCompositeOperation='source-over';
}
function handShape(g,x0,x1,y,top,grow,q){
 // A hand pressing down from above: four long fingers over the floor, the palm and a forearm as wide as the hand up
 // to the box's top. The whole x0..x1 band is the hitbox up to that top, so the drawing never narrows inside it.
 const w=x1-x0,fl=Math.min(2.6,w*.42),py=y+fl,o=grow,gap=w*.035;
 g.beginPath();
 g.moveTo(x0-o,-(py+w*.12));
 for(let i=0;i<4;i++){
  const a=x0+w*.08+i*(w*.84/4),b=a+w*.84/4-gap,len=fl*(i===1||i===2?1:.82);
  g.lineTo(a-o,-(py+.1));g.lineTo(a-o+gap*.4,-(py-len+.25-o));g.quadraticCurveTo((a+b)/2,-(py-len-.3-o*1.5),b+o-gap*.4,-(py-len+.25-o));g.lineTo(b+o,-(py+.1));
 }
 g.lineTo(x1+o,-(py+w*.12));
 g.lineTo(x1+o,-(top-.25));g.quadraticCurveTo(x1+o,-(top+o),x1-.25,-(top+o));g.lineTo(x0+.25,-(top+o));g.quadraticCurveTo(x0-o,-(top+o),x0-o,-(top-.25));
 g.closePath();
}
function shades(g,e,frame){
 for(const h of e.shades){
  const q=1-h.t/h.T,strike=h.t===0,dark=css(INK,1);
  if(h.src==='palm'){
   const fall=(1-ease(q))*2.2;
   soft(g,h.x0,h.x1,1,h.y1,q,b=>{g.fillStyle=dark;handShape(g,h.x0-b,h.x1+b,1+fall,h.y1,b,q);g.fill();});
   rim(g,()=>handShape(g,h.x0,h.x1,1+fall,h.y1,0,q),q,strike,frame);
   // The floor darkens where it will land: the lit lane stays clear beside it.
   g.fillStyle=css(INK,.25+.45*q);g.fillRect(h.x0,-1.05,h.x1-h.x0,.1);
  }else if(h.src==='rake'){
   const x=(h.x0+h.x1)/2,w=h.x1-h.x0,y1=h.y1;
   const path=b=>{g.beginPath();g.moveTo(h.x0-b,-1);g.lineTo(h.x0-b,-(y1-.18));g.quadraticCurveTo(x,-(y1+.18+b),h.x1+b,-(y1-.18));g.lineTo(h.x1+b,-1);g.closePath();};
   soft(g,h.x0,h.x1,1,y1,q,b=>{g.fillStyle=dark;path(b);g.fill();});
   // The knuckle runs up toward the hand above (a soft shaft of shadow).
   g.fillStyle=css(INK,.1+.12*q);g.beginPath();g.moveTo(h.x0+w*.2,-(y1+.15));g.lineTo(x-h.vx*30,-(y1+4));g.lineTo(h.x1-w*.2,-(y1+.15));g.closePath();g.fill();
   rim(g,()=>path(0),q,strike,frame);
  }else if(h.src==='grasp'||h.src==='snuff'){
   // Curtains of shadow: the grasp closes from the walls onto the lit band; the snuff's body shadow grows from its body
   // edge out to the far end of its box. The final extent shows faintly from the start, and the claw tips stop exactly
   // on the box's edge (they never reach into the lit band).
   let dir,from,edge;
   if(h.src==='snuff'){const out=Math.abs(h.x0-e.bx)<=Math.abs(h.x1-e.bx);dir=out?1:-1;from=out?h.x0:h.x1;edge=out?h.x1:h.x0;}
   else{const left=h.x0<=L+.01;dir=left?1:-1;from=left?L-1:R+1;edge=left?h.x1:h.x0;}
   const reach=lerp(from,edge,ease(q*1.08)),y1=h.y1;
   g.fillStyle=css(INK,.12+.1*q);g.fillRect(h.x0,-y1,h.x1-h.x0,y1-1);
   const claws=b=>{g.beginPath();g.moveTo(from,-1);g.lineTo(from,-y1);
    for(let i=0;i<=6;i++){const yy=y1-(y1-1)*i/6,c=Math.sin(i*1.9+frame*.05)*.25;g.lineTo(reach+dir*(b-(i%2?.3+c:0)),-yy);}g.lineTo(reach,-1);g.closePath();};
   soft(g,h.x0,h.x1,1,y1,q,b=>{g.fillStyle=dark;claws(b);g.fill();});
   rim(g,()=>claws(0),q,strike,frame);
  }else if(h.src==='pulse'){
   const path=b=>{g.beginPath();g.rect(h.x0-b,-(h.y1+b),h.x1-h.x0+b*2,h.y1-1+b);};
   soft(g,h.x0,h.x1,1,h.y1,q,b=>{g.fillStyle=dark;path(b*.4);g.fill();});
   rim(g,()=>path(0),q,strike,frame);
  }
  if(strike){
   // The strike frame: shadow turns solid, an ivory-cyan crack along its edge.
   g.globalCompositeOperation='lighter';const sp=glow(P.cyanHot);
   if(sp){g.globalAlpha=.5;g.drawImage(sp,h.x0-.8,-2.2,h.x1-h.x0+1.6,2.4);g.globalAlpha=1;}
   g.globalCompositeOperation='source-over';
  }
 }
}

// ---------- the body ----------
function body(g,e,frame,alpha,st){
 const x=e.pbx+(e.bx-e.pbx)*alpha,y=e.pby+(e.by-e.pby)*alpha,dir=e.facing||1,p=st.pose;
 const core=e.glass,melt=st.melt,sc=core?(e.act?.id==='race'&&e.act.stage==='active'?.42:.52):1;
 if(melt>=1)return;
 const r=rig(x,y,dir,p,sc*(1-melt*.75));
 const flash=e.flash>0;
 g.fillStyle=css(INK,.5);g.beginPath();g.ellipse(x,-1.02,1.8*sc,.16,0,0,TAU);g.fill();
 // Outline pass, a cyan rim where the light grazes it, then the tallow body (lit from the light's side).
 const lightSide=Math.sign(e.light.x-x)||dir;
 silhouette(g,r,P.outline,.1*sc,frame);
 const sh=shifted(r,lightSide*.07);
 if(!flash){g.globalCompositeOperation='lighter';silhouette(g,sh,css(core?P.amber:P.cyan,e.pyre||core?.9:.55),.02,frame);g.globalCompositeOperation='source-over';}
 const v=g.createLinearGradient(x-2.2*lightSide,0,x+2.2*lightSide,0),u=g.createLinearGradient(0,-(y+7*sc),0,-y);
 if(core){v.addColorStop(0,'#120e12');v.addColorStop(.6,'#2d2228');v.addColorStop(1,'#5a4a46');}
 else{v.addColorStop(0,WAX_DARK);v.addColorStop(.5,WAX_SHADE);v.addColorStop(1,e.pyre?'#fff6e4':WAX);}
 silhouette(g,r,flash?P.ivory:v,0,frame);
 if(!flash){
  // Depth: the far arm and leg sit in shade, the feet in the floor's darkness.
  u.addColorStop(0,css(INK,0));u.addColorStop(.6,css(INK,0));u.addColorStop(1,css(INK,.45));
  g.fillStyle=u;g.fillRect(x-3*sc,-(y+7*sc),6*sc,7*sc);
  const B=r.B;limb(g,B[0],B[1],.5*sc,.34*sc,css(INK,.22));limb(g,B[1],B[2],.22*sc,.14*sc,css(INK,.22));
 }
 if(!core){
  // Ribs under the tallow, the wax plate over the wick-heart, drips hanging from the arms.
  g.strokeStyle=css(WAX_DARK,.55);g.lineWidth=.05;
  for(let i=0;i<4;i++){const t=.25+i*.17,cx=lerp(r.hip[0],r.chest[0],t),cy=lerp(r.hip[1],r.chest[1],t);g.beginPath();g.moveTo(cx-dir*.35,-cy);g.quadraticCurveTo(cx,-cy-.15,cx+dir*.4,-cy+.05);g.stroke();}
  for(const A of [r.F,r.B])for(let i=0;i<3;i++){const t=(i+1)/4,px=lerp(A[0][0],A[1][0],t),py=lerp(A[0][1],A[1][1],t),l=.25+.25*Math.sin(frame*.04+i+A[0][0]);
   g.strokeStyle=css(WAX,.9);g.lineWidth=.07;g.beginPath();g.moveTo(px,-py);g.lineTo(px+.02,-(py-l));g.stroke();g.fillStyle=WAX;g.beginPath();g.arc(px+.02,-(py-l),.05,0,TAU);g.fill();}
 // The rendered dead in its robe: faces and hands half-sunk in the tallow, drip streaks down to the hem.
 const rb=seeded('robe');
 for(let i=0;i<5;i++){const t=.25+i*.15,fx=lerp(r.hip[0],x,t)+(rb()-.5)*1.4,fy=lerp(r.hip[1],y+.6,t);g.fillStyle=css(WAX_DARK,.35);g.beginPath();g.ellipse(fx,-fy,.18,.15,0,0,TAU);g.fill();g.fillStyle=css('#2a1e20',.5);g.beginPath();g.arc(fx-.06,-fy+.02,.035,0,TAU);g.arc(fx+.06,-fy+.02,.035,0,TAU);g.fill();}
 g.strokeStyle=css(P.boneRim,.28);g.lineWidth=.05;for(let i=0;i<6;i++){const sx=r.hip[0]+(i-2.5)*.42;g.beginPath();g.moveTo(sx,-(r.hip[1]+.2));g.lineTo(sx+Math.sin(i+frame*.01)*.06,-(y+.8+((i*7)%4)*.25));g.stroke();}
 }else{
  g.strokeStyle=css(P.amberDeep,.8);g.lineWidth=.04;for(let i=0;i<4;i++){const t=.2+i*.2;g.beginPath();g.moveTo(lerp(r.hip[0],r.chest[0],t)-.2,-lerp(r.hip[1],r.chest[1],t));g.lineTo(lerp(r.hip[0],r.chest[0],t)+.2,-lerp(r.hip[1],r.chest[1],t)-.05);g.stroke();}
 }
 // The wick-heart: dim behind wax; exposed amber while open (gutter, stun, flare), and the core in desperation.
 const hx=lerp(r.hip[0],r.chest[0],.78),hy=lerp(r.hip[1],r.chest[1],.78),open=e.open>0&&!e.behind||e.ai==='open';
 const hk=open?.6+.4*Math.sin(frame*.4):core?.7:e.ai==='spent'?.5:.12;
 g.globalCompositeOperation='lighter';const hs=glow(P.amber);if(hs){const rr=(open?1.6:core?1.1:.6)*sc;g.globalAlpha=hk;g.drawImage(hs,hx-rr,-hy-rr,rr*2,rr*2);g.globalAlpha=1;}g.globalCompositeOperation='source-over';
 g.fillStyle=css(open||core?P.amberHot:P.amberDeep,open||core?1:.6);g.beginPath();g.moveTo(hx,-(hy+.35*sc));g.quadraticCurveTo(hx+.3*sc,-(hy-.05*sc),hx,-(hy-.38*sc));g.quadraticCurveTo(hx-.3*sc,-(hy-.05*sc),hx,-(hy+.35*sc));g.fill();
 if(open){g.strokeStyle=css(WAX_DARK,1);g.lineWidth=.06;g.beginPath();g.moveTo(hx-.5,-hy-.5);g.lineTo(hx-.2,-hy-.1);g.lineTo(hx-.55,-hy+.3);g.moveTo(hx+.5,-hy-.45);g.lineTo(hx+.22,-hy);g.lineTo(hx+.5,-hy+.4);g.stroke();}
 // Head: a melted candle-skull, black sockets with cyan pinpoints, the wick crown burning.
 const H=r.head;
 g.fillStyle=css('#120a10',1);g.beginPath();g.ellipse(H[0]+dir*.12*sc,-(H[1]-.02*sc),.1*sc,.13*sc,0,0,TAU);g.ellipse(H[0]-dir*.12*sc,-(H[1]-.04*sc),.09*sc,.12*sc,0,0,TAU);g.fill();
 const eyeA=e.ai==='spent'?.3:1;
 g.globalCompositeOperation='lighter';g.fillStyle=css(P.cyanHot,eyeA);g.beginPath();g.arc(H[0]+dir*.12*sc,-(H[1]-.02*sc),.035*sc,0,TAU);g.arc(H[0]-dir*.12*sc,-(H[1]-.04*sc),.03*sc,0,TAU);g.fill();g.globalCompositeOperation='source-over';
 for(let i=-1;i<=1;i++)flame(g,H[0]+i*.18*sc+i*.1*sc,H[1]+(.95-Math.abs(i)*.15)*sc,.11*sc*p.flame,frame+i*11,P.cyan,Math.min(1,p.flame));
 // The iron wick-spear: shaft, amber ferrule at the grip, leaf blade, the cyan flame that is the light.
 g.strokeStyle=IRON;g.lineWidth=.15*sc;g.lineCap='round';g.beginPath();g.moveTo(r.butt[0],-r.butt[1]);g.lineTo(r.tip[0],-r.tip[1]);g.stroke();
 g.strokeStyle=css(IRON_HI,.7);g.lineWidth=.04*sc;g.beginPath();g.moveTo(r.butt[0],-r.butt[1]-.04);g.lineTo(r.tip[0],-r.tip[1]-.04);g.stroke();
 const fx=lerp(r.hand[0],r.tip[0],.1),fy=lerp(r.hand[1],r.tip[1],.1);g.strokeStyle=css(P.amber,.9);g.lineWidth=.2*sc;g.beginPath();g.moveTo(fx,-fy);g.lineTo(lerp(r.hand[0],r.tip[0],.17),-lerp(r.hand[1],r.tip[1],.17));g.stroke();
 const a=e.act,thrustTell=a?.id==='sweep'&&a.sub==='thrust'&&a.stage==='tell';
 flame(g,r.tip[0],r.tip[1],.22*sc*p.flame,frame,P.cyan,Math.min(1,p.flame));
 // Telegraph grammar on the body: the ivory ring on the thrust's blade (parry it), cyan along cyan cuts.
 if(thrustTell){
  const q=1-a.t/a.T,rr=.4+.4*q;g.globalCompositeOperation='lighter';const sp=glow(P.ivory);
  if(sp){g.globalAlpha=.3+.6*q;g.drawImage(sp,r.tip[0]-rr*2,-r.tip[1]-rr*2,rr*4,rr*4);g.globalAlpha=1;}
  g.strokeStyle=css('#ffffff',.6+.4*q);g.lineWidth=.07;g.beginPath();g.arc(r.tip[0],-r.tip[1],rr,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
 }else if(a?.id==='sweep'&&a.stage!=='after'){
  const q=a.stage==='tell'?1-a.t/a.T:1;g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyan,.25+.6*q);g.lineWidth=.12;g.beginPath();g.moveTo(r.hand[0],-r.hand[1]);g.lineTo(r.tip[0],-r.tip[1]);g.stroke();g.globalCompositeOperation='source-over';
  if(a.stage==='active'){
   // The cut itself: a cyan arc where its box is (hitboxes never follow the art; the art follows the box).
   const b=C.moves.sweep[a.sub],x0=x+dir*b.x0,x1=x+dir*b.x1,yc=y+(b.y0+b.y1)/2,hh=(b.y1-b.y0)/2,k=1-a.t/C.moves.sweep.active;
   g.globalCompositeOperation='lighter';g.strokeStyle=css(a.sub==='thrust'?P.ivory:P.cyan,.85*(1-k*.6));g.lineWidth=.16;g.beginPath();
   g.ellipse((x0+x1)/2,-yc,Math.abs(x1-x0)/2,hh,0,dir>0?-Math.PI*.6:Math.PI*.4,dir>0?Math.PI*.6:Math.PI*1.6);g.stroke();
   g.strokeStyle=css(P.cyanHot,.6*(1-k));g.lineWidth=.05;g.stroke();g.globalCompositeOperation='source-over';
  }
 }
 if(a?.id==='race'&&a.stage==='tell'){
  // The crouch: its lane lights cyan along the floor at the core's height and its body flares, brighter as it nears.
  const q=1-a.t/a.T;g.globalCompositeOperation='lighter';
  const lane=g.createLinearGradient(x,0,a.end,0);lane.addColorStop(0,css(P.cyanHot,.25+.45*q));lane.addColorStop(1,css(P.cyan,.05+.2*q));
  g.fillStyle=lane;g.fillRect(Math.min(x,a.end),-(1+C.core.race),Math.abs(a.end-x),C.core.race);
  g.strokeStyle=css(P.cyanHot,.35+.6*q);g.lineWidth=.05+.07*q;g.setLineDash?.([.3,.2]);g.beginPath();g.moveTo(x,-1.5);g.lineTo(a.end,-1.5);g.stroke();g.setLineDash?.([]);
  const sp=glow(P.cyanHot);if(sp){g.globalAlpha=.3+.6*q;g.drawImage(sp,x-1.4,-(1+C.core.race+.6),2.8,C.core.race+1.2);g.globalAlpha=1;}
  g.globalCompositeOperation='source-over';
 }
 // Just through the burnt membrane, it is still the dark backlit figure: the tallow shows as that darkness lifts.
 if(e.ai==='transition'&&e.phase===2&&e.tt<140){const k=1-ease((e.tt-110)/30);if(k>0)silhouette(g,r,css(INK,.95*k),0,frame);}
 // P3: it is the pyre. Cyan tongues climb its arms, shoulders and crown.
 if(e.pyre&&!e.dead){
  const pts=[r.F[1],r.F[2],r.B[1],r.B[2],r.chest,r.neck,r.hip,r.legs[0][1],r.legs[1][1]];
  for(let i=0;i<pts.length;i++)flame(g,pts[i][0],pts[i][1]+.1,(core?.14:.2)*(1+.3*Math.sin(frame*.1+i)),frame+i*13,P.cyan,.45);
 }
}

// P2 transition, behind the burning membrane: a dark figure, rimmed by the vault light, walks up to the plane.
function emerge(g,e,frame,alpha,st){
 const k=ease((e.tt-50)/60),x=e.pbx+(e.bx-e.pbx)*alpha,r=rig(x,1,e.facing||1,st.pose,.86+.14*k);
 g.globalCompositeOperation='lighter';silhouette(g,r,css(P.cyan,.25*k),.12,frame);g.globalCompositeOperation='source-over';
 silhouette(g,r,css(INK,.95*k),0,frame);
}
export function drawTallowWorld(g,state,e,frame,alpha,cam){
 const st=smoothPose(e,frame);
 // The melt follows the sim's kill countdown (e.dying), so it lasts the same on a 60 or a 144 Hz screen.
 if(e.dead)st.melt=e.dying>0?Math.max(st.melt,1-e.dying/C.dying):Math.min(1,st.melt+.012);
 backdrop(g,e,frame,cam);
 lamp(g,e,frame);
 // The corpse columns stand in the hunter's plane; their candles die with the Renderer.
 const dead=e.dead?Math.max(0,1-st.melt*2):1;
 for(let i=0;i<C.columns.length;i++){const x=C.columns[i];column(g,x,frame,dead>0?(e.pyre?Math.sign(x-e.bx):0):null,i+1,dead);}
 wax(g,e,frame);
 spearP1(g,e,frame);
 if(!e.behind)body(g,e,frame,alpha,st);
 else if(e.ai==='transition'&&e.phase===2&&e.tt>50)emerge(g,e,frame,alpha,st);
 if(e.dead&&st.melt>0){
  // The kill: it gutters, slumps and melts into a pool of tallow; a small cyan larva crawls out toward the chest.
  const x=e.bx,m=st.melt;
  g.fillStyle=css(WAX,.95);g.beginPath();g.ellipse(x,-1.04,.6+1.8*m,.12+.12*m,0,0,TAU);g.fill();
  if(m>.55){const lx=x-(m-.55)*4;g.fillStyle=css(P.cyan,.9);g.beginPath();g.ellipse(lx,-1.12,.16,.07,0,0,TAU);g.fill();g.globalCompositeOperation='lighter';const sp=glow(P.cyan);if(sp){g.globalAlpha=.6;g.drawImage(sp,lx-.5,-1.6,1,1);g.globalAlpha=1;}g.globalCompositeOperation='source-over';}
 }
 shades(g,e,frame);
}
// After the characters: bloom from the lights, embers and wax-ash rising, the desperation dim.
export function drawTallowOver(g,state,frame){
 let e=null;for(const x of state.enemies||[])if(x.tallow){e=x;break;}
 if(!e)return;
 if(e.glass&&e.ai!=='spent'&&!e.dead){
  g.fillStyle=`rgba(4,2,8,${.35+.08*Math.sin(frame*.1)})`;g.fillRect(W0-2,-TOP-2,W1-W0+4,TOP+3);
  const x=e.bx,sp=glow(P.cyan);g.globalCompositeOperation='lighter';if(sp){g.globalAlpha=.5;g.drawImage(sp,x-3,-e.by-4,6,6);g.globalAlpha=1;}g.globalCompositeOperation='source-over';
 }
 g.globalCompositeOperation='lighter';
 const rnd=seeded('embers'),n=e.pyre?40:22;
 for(let i=0;i<n;i++){
  const sx=lerp(L,R,rnd()),sp=.012+rnd()*.02,y=1+((frame*sp+rnd()*12)%11),x=sx+Math.sin(frame*.02+i)*.4;
  const c=i%3===0?P.amberHot:P.cyan,a=(.25+.35*rnd())*(e.dead?.4:1);
  g.fillStyle=css(c,a);g.fillRect(x,-y,.05,.05);
 }
 const st=poses.get(e),fade=e.dead?Math.max(0,1-(st?.melt||1)*2):1;
 if(!e.behind&&fade>0){const sp=glow(P.cyan),lx=st?st.lx:e.light.x,ly=st?st.ly:e.light.y;if(sp){const r=e.pyre?3.6:1.8;g.globalAlpha=(e.pyre?.4:.3)*fade;g.drawImage(sp,lx-r,-ly-r,r*2,r*2);g.globalAlpha=1;}}
 g.globalCompositeOperation='source-over';
}
// The Nave frames the whole chapel: every shadow must be readable at once.
export function tallowFocus(e,f){f.left=L;f.right=R;f.bottom=1;f.top=9.6;return f;}
