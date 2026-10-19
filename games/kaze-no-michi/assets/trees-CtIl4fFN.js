import{$n as e,An as t,Bt as n,C as r,Ct as i,D as a,Fn as o,Gn as s,H as c,Hn as l,K as u,L as d,O as f,On as p,Pt as m,S as h,Sn as g,Un as _,Y as v,Z as y,_n as b,_t as x,b as S,bt as C,c as w,dt as T,er as E,f as ee,g as D,i as O,jn as k,kt as A,l as te,m as j,n as ne,nr as re,nt as M,o as N,r as P,rr as F,rt as ie,s as ae,t as oe,tr as I,tt as L,u as R,ut as se,vt as z,yt as ce}from"./Layout-C14GeEeY.js";import{n as le}from"./three.module-D1GrkEkZ.js";import{a as B,c as V,i as ue,n as de,o as fe,r as pe,t as me}from"./index-C8mHxnSi.js";var H=512,he=H*4,ge=.5,U={mapleA:0,mapleB:1,mapleC:2,mapleLeaf:3,ginkgoA:4,ginkgoB:5,pinePad:6,pineSpray:7,cedarA:8,cedarB:9,bamboo:10,shrub:11,litterGinkgo:12,litterMaple:13,ginkgoLeaf:14,shrubB:15};function W(e){let t=e%4,n=Math.floor(e/4),r=1.5/he;return{u0:t/4+r,u1:(t+1)/4-r,vTop:n/4+r,vBottom:(n+1)/4-r}}var _e=e=>(e%360+360)%360,G=(e,t,n,r=1)=>`hsla(${_e(e).toFixed(1)},${R(t,0,100).toFixed(1)}%,${R(n,0,100).toFixed(1)}%,${r})`;function ve(e,t){let n=Math.hypot(e,t,1);return`rgb(${Math.round((.5+.5*e/n)*255)},${Math.round((.5+.5*t/n)*255)},255)`}function ye(e,t,n,r,i,a,o=.4){if(!e)return;let s=e.rand()*Math.PI*2,c=.12+e.rand()*.5,l=Math.cos(s)*c,u=Math.sin(s)*c,d=Math.cos(i)*o,f=Math.sin(i)*o,p=e.ctx;p.save(),p.translate(n,r),p.rotate(i),p.clip(t),p.fillStyle=ve(l+d,u+f),p.fillRect(-2*a,-2*a,2*a,3*a),p.fillStyle=ve(l-d,u-f),p.fillRect(0,-2*a,2*a,3*a),p.restore()}function be(e,t,n,r,i){for(let a=0;a<i;a++)e.fillStyle=G(r.h+8-t()*16,r.s-10,r.l-7-t()*9,.32),e.beginPath(),e.arc((t()-.5)*n,-t()*n*.9,n*(.1+t()*.18),0,Math.PI*2),e.fill()}function xe(e,t,n,r,i,a,o,s=null,c=!0){let l=[-2.05,-1.38,-.7,0,.7,1.38,2.05],u=[.42,.74,.96,1,.96,.74,.42],d=(e,t)=>[Math.sin(e)*t,-Math.cos(e)*t],f=.24*r,p=new Path2D;p.moveTo(0,.04*r);for(let e=0;e<7;e++){let t=l[e]+(o()-.5)*.1,n=u[e]*r*(.9+o()*.18),i=e===0?t-.5:(l[e-1]+l[e])/2,a=e===6?t+.5:(l[e]+l[e+1])/2,[s,c]=d(i,e===0?f*.45:f);e===0&&p.lineTo(s,c);let m=.2,[h,g]=d(t-m,n*.58),[_,v]=d(t,n),[y,b]=d(t+m,n*.58),[x,S]=d(a,e===6?f*.45:f);p.quadraticCurveTo(h,g,_,v),p.quadraticCurveTo(y,b,x,S)}p.closePath(),e.save(),e.translate(t,n),e.rotate(i);let m=e.createRadialGradient(0,-r*.1,r*.04,0,-r*.25,r*1.05);if(m.addColorStop(0,G(a.h+14,a.s-4,a.l+12)),m.addColorStop(.5,G(a.h,a.s,a.l)),m.addColorStop(1,G(a.h-5,a.s,a.l-9)),e.fillStyle=m,e.fill(p),c){e.save(),e.clip(p),e.fillStyle=G(a.h-6,a.s,a.l-13,.5),e.beginPath();for(let t=0;t<7;t++){let[n,i]=d(l[t],r*1.3),[a,o]=d(t===6?l[t]+.5:(l[t]+l[t+1])/2,r*1.3);e.moveTo(0,0),e.lineTo(n,i),e.lineTo(a,o),e.closePath()}e.fill(),be(e,o,r,a,2),e.restore(),e.strokeStyle=G(a.h+10,a.s-15,a.l+14,.32),e.lineWidth=Math.max(.8,r*.022);for(let t=0;t<7;t++){let[n,i]=d(l[t],u[t]*r*.84);e.beginPath(),e.moveTo(0,0),e.lineTo(n,i),e.stroke()}}e.strokeStyle=G(a.h,a.s-25,a.l-12),e.lineWidth=Math.max(1,r*.035),e.beginPath(),e.moveTo(0,0),e.lineTo(0,r*.42),e.stroke(),e.restore(),ye(s,p,t,n,i,r)}function Se(e,t,n,r,i,a,o,s=null,c=!0){let l=.82+o()*.3,u=o()<.65,d=-Math.PI/2,f=new Path2D;f.moveTo(0,0),f.lineTo(-Math.sin(l)*r*.96,-Math.cos(l)*r*.96),u?(f.arc(0,0,r,d-l,d-.07),f.lineTo(0,-r*.72),f.lineTo(Math.sin(.07)*r,-Math.cos(.07)*r),f.arc(0,0,r,d+.07,d+l)):f.arc(0,0,r,d-l,d+l),f.closePath(),e.save(),e.translate(t,n),e.rotate(i);let p=e.createRadialGradient(0,0,r*.05,0,0,r);if(p.addColorStop(0,G(a.h+10,a.s-20,a.l+8)),p.addColorStop(.45,G(a.h,a.s,a.l)),p.addColorStop(1,G(a.h-4,a.s,a.l-6)),e.fillStyle=p,e.fill(f),c){e.save(),e.clip(f),e.fillStyle=G(a.h-5,a.s,a.l-12,.3),e.fillRect(-r*1.2,-r*1.2,r*1.2,r*1.4),be(e,o,r,a,1),e.strokeStyle=G(a.h-8,a.s,a.l-16,.26),e.lineWidth=Math.max(1,r*.1),e.stroke(f),e.restore(),e.strokeStyle=G(a.h-6,a.s-20,a.l-14,.22),e.lineWidth=Math.max(.6,r*.012);for(let t=-5;t<=5;t++){let n=t/5*l*.92;e.beginPath(),e.moveTo(0,0),e.lineTo(Math.sin(n)*r*.95,-Math.cos(n)*r*.95),e.stroke()}}e.strokeStyle=G(a.h-8,a.s-30,a.l-20),e.lineWidth=Math.max(1,r*.03),e.beginPath(),e.moveTo(0,0),e.lineTo(0,r*.6),e.stroke(),e.restore(),ye(s,f,t,n,i,r)}function Ce(e,t,n,r,i,a){e.save(),e.translate(t,n),e.rotate(i);let o=r*.11;e.beginPath(),e.moveTo(0,0),e.quadraticCurveTo(-o*1.4,-r*.35,0,-r),e.quadraticCurveTo(o*1.4,-r*.35,0,0),e.fillStyle=G(a.h,a.s,a.l),e.fill(),e.strokeStyle=G(a.h+10,a.s-10,a.l+12,.45),e.lineWidth=1,e.beginPath(),e.moveTo(0,0),e.lineTo(0,-r*.95),e.stroke(),e.restore()}function we(e,t,n,r,i,a){e.save(),e.translate(t,n),e.rotate(i),e.beginPath(),e.ellipse(0,-r*.5,r*.32,r*.55,0,0,Math.PI*2),e.fillStyle=G(40,8,a),e.fill(),e.strokeStyle=G(40,8,a-14,.35),e.lineWidth=1,e.beginPath(),e.moveTo(0,0),e.lineTo(0,-r*.95),e.stroke(),e.restore()}function K(e,t,n,r,i,a,o,s=`#35231a`){e.strokeStyle=s,e.lineCap=`round`,e.lineWidth=a,e.beginPath(),e.moveTo(t,n),e.quadraticCurveTo((t+r)/2+(o()-.5)*50,(n+i)/2+(o()-.5)*20,r,i),e.stroke()}function Te(e,t,n,r,i,a=.6){for(;;){let o=e()*2-1,s=e()*2-1,c=o*o+s*s;if(!(c>1)&&!(e()>1-a*c))return[t+o*r,n+s*i,Math.sqrt(c)]}}function Ee(e,t,n,r,i,a,o,s){for(let e=0;e<o;e++){let[e,o]=Te(t,n,r,i,a,.15);s(e,o,t)}}function De(e,t=22){e.save(),e.globalCompositeOperation=`destination-in`;for(let n of[!0,!1]){let r=n?e.createLinearGradient(0,0,H,0):e.createLinearGradient(0,0,0,H);r.addColorStop(0,`rgba(0,0,0,0)`),r.addColorStop(t/H,`rgba(0,0,0,1)`),r.addColorStop(1-t/H,`rgba(0,0,0,1)`),r.addColorStop(1,`rgba(0,0,0,0)`),e.fillStyle=r,e.fillRect(0,0,H,H)}e.restore()}function Oe(e,t,n,r,i){let a=n(t,0);Ee(e,t,256,252,180,166,250,(t,n,r)=>xe(e,t,n,16+r()*14,r()*Math.PI*2,{h:a.h-4+r()*8,s:a.s-14,l:a.l*(.3+r()*.16)},r,null,!1)),K(e,256,500,250+(t()-.5)*40,200,5,t);for(let n=0;n<7;n++){let r=482-n*40;K(e,253,r,256+(n%2?1:-1)*(70+t()*120),r-50-t()*80,2.4,t)}let o=[];for(let e=0;e<r;e++){let[e,r,i]=Te(t,256,246,220,206,.3),a=t()*.6+.4*i;o.push({px:e,py:r,depth:a,size:(17+t()*13)*(1-.15*i),rot:Math.atan2(e-256,470-r)+(t()-.5)*1.6,c:n(t,a)})}o.sort((e,t)=>e.depth-t.depth);for(let n of o)xe(e,n.px,n.py,n.size,n.rot,n.c,t,i)}function ke(e,t,n,r,i){let a=n(t,0);Ee(e,t,256,258,172,172,230,(t,n,r)=>Se(e,t,n,14+r()*12,r()*Math.PI*2,{h:a.h-8+r()*4,s:a.s-15,l:a.l*(.6+r()*.16)},r,null,!1)),K(e,256,500,262+(t()-.5)*30,150,4.5,t,`#3b3129`);let o=[];for(let i=0;i<r;i++){let[r,i,a]=Te(t,256,258,196,192,.25);K(e,256+(i-250)*.05,Math.max(i+40,150),r,i,1.8,t,`#3b3129`);let s=4+Math.floor(t()*4),c=t()*.6+.4*a;for(let e=0;e<s;e++){let a=-Math.PI/2+(e/Math.max(1,s-1)-.5)*2.6+(t()-.5)*.5+(r-256)*.002,l=9+t()*9;o.push({x:r+Math.cos(a)*l,y:i+Math.sin(a)*l,s:17+t()*12,rot:a+Math.PI/2+(t()-.5)*.4,depth:c+t()*.05,c:n(t,c)})}}o.sort((e,t)=>e.depth-t.depth);for(let n of o)Se(e,n.x,n.y,n.s,n.rot,n.c,t,i)}function Ae(e,t,n,r,i,a,o,s,c){for(let l=0;l<o;l++){let o=r+(s()-.5)*i,l=a*(.55+s()*.45),u=c.l+8+s()*8,d=e.createLinearGradient(t,n,t+Math.cos(o)*l,n+Math.sin(o)*l);d.addColorStop(0,G(c.h,c.s,c.l-4)),d.addColorStop(1,G(c.h-6,c.s+5,u)),e.strokeStyle=d,e.lineWidth=1.6+s()*1.2,e.beginPath(),e.moveTo(t,n),e.quadraticCurveTo(t+Math.cos(o)*l*.5+(s()-.5)*6,n+Math.sin(o)*l*.5+(s()-.5)*6,t+Math.cos(o)*l,n+Math.sin(o)*l),e.stroke()}}function je(e,t){Ee(e,t,256,262,165,125,60,(t,n,r)=>Ae(e,t,n,r()*Math.PI*2,Math.PI*2,40+r()*20,30,r,{h:100,s:30,l:6+r()*3}));for(let n=0;n<120;n++){let[n,r,i]=Te(t,256,262,205,160,.2),a={h:94+t()*20,s:30+t()*18,l:12+t()*10-i*3};Ae(e,n,r,t()*Math.PI*2,Math.PI*2,42+t()*24,34,t,a)}}function Me(e,t){let n=[],r=40,i=330;for(let a=0;a<9;a++){let o=r+50+t()*10,s=i-18+(t()-.5)*30;K(e,r,i,o,s,5-a*.35,t,`#3a2a20`),n.push([o,s]),r=o,i=s}for(let[r,i]of n)for(let n=0;n<3;n++){let n={h:98+t()*14,s:32+t()*14,l:14+t()*9};Ae(e,r+(t()-.5)*30,i+(t()-.5)*20,-Math.PI/2+(t()-.5)*1.3,1.6,70+t()*40,30,t,n)}}function Ne(e,t,n,r,i,a,o){let s=Math.max(4,Math.floor(i/9)),c=t,l=n,u=r;for(let t=0;t<s;t++){u+=(o()-.5)*.12;let n=c+i/s*Math.cos(u),r=l+i/s*Math.sin(u);for(let n of[-1,1]){let r=u+n*(.55+o()*.3),i=7+o()*7*(1-t/s*.4),a=t>s*.7?8:0;e.strokeStyle=o()<.08?G(28,38,26):G(118+o()*18,32+o()*12,14+o()*8+a),e.lineWidth=2.2,e.beginPath(),e.moveTo(c,l),e.lineTo(c+Math.cos(r)*i,l+Math.sin(r)*i),e.stroke()}if(e.strokeStyle=G(110,30,16),e.lineWidth=2.6,e.beginPath(),e.moveTo(c,l),e.lineTo(n,r),e.stroke(),a>0&&t>1&&t%3==0&&o()<.85){let n=t/3%2?1:-1;Ne(e,c,l,u+n*(.7+o()*.3),i*(.45+o()*.2)*(1-t/s*.5),a-1,o)}c=n,l=r}}function Pe(e,t,n){Ee(e,t,256,285,140,165,70,(t,n,r)=>Ae(e,t,n,r()*Math.PI*2,Math.PI*2,34+r()*18,26,r,{h:125,s:34,l:5+r()*3}));for(let r=0;r<n;r++)Ne(e,256+(t()-.5)*110,492,-Math.PI/2+(r/Math.max(1,n-1)-.5)*1.1+(t()-.5)*.25,230+t()*110,2,t)}function Fe(e,t){for(let n=0;n<3;n++){let r=150+n*105+(t()-.5)*40;K(e,r,512,r+(t()-.5)*80,120+t()*60,3,t,`#6d7a3a`);for(let n=0;n<3;n++){let i=r+(t()-.5)*90,a=140+n*110+t()*40,o=4+Math.floor(t()*4);for(let n=0;n<o;n++){let r={h:72+t()*20,s:40+t()*22,l:28+t()*16},s=Math.PI*.5+(n/(o-1)-.5)*2.4+(t()-.5)*.3;Ce(e,i,a,90+t()*50,s+Math.PI,r)}}}}function Ie(e,t,n,r){for(let n=0;n<9;n++)K(e,256,512,256+(t()-.5)*420,120+t()*280,3,t,`#3b2c22`);for(let i=0;i<n;i++){let[n,i,a]=Te(t,256,262,225,215,.3),o=62+t()*26-a*12;r?Ce(e,n,i,26+t()*16,t()*Math.PI*2,{h:40,s:6,l:o}):we(e,n,i,22+t()*14,t()*Math.PI*2,o)}}function Le(e,t,n){let r=n===`ginkgo`?560:440;for(let i=0;i<r;i++){let r=18+t()*476,i=18+t()*476,a=Math.min(r,i,512-r,512-i)/120;if(t()>Math.min(1,.12+a*1.1))continue;let o=t()<.3;if(n===`ginkgo`){let n=o?{h:34+t()*8,s:55,l:34+t()*10}:{h:44+t()*9,s:82+t()*12,l:46+t()*12};Se(e,r,i,17+t()*15,t()*Math.PI*2,n,t)}else{let n=o?{h:14+t()*14,s:45,l:22+t()*8}:{h:-4+t()*24,s:78+t()*14,l:30+t()*12};xe(e,r,i,19+t()*15,t()*Math.PI*2,n,t)}}}function Re(e){let t=document.createElement(`canvas`);t.width=t.height=he;let n=t.getContext(`2d`,{willReadFrequently:!0}),r=document.createElement(`canvas`);r.width=r.height=he*ge;let i=r.getContext(`2d`,{willReadFrequently:!0});i.fillStyle=`rgb(128,128,255)`,i.fillRect(0,0,r.width,r.height);let a={ctx:i,rand:j(e*31+7)},o=j(e),s=(e,t)=>{let r=e%4,a=Math.floor(e/4);for(let[e,t]of[[n,1],[i,ge]])e.save(),e.scale(t,t),e.beginPath(),e.rect(r*H,a*H,H,H),e.clip(),e.translate(r*H,a*H);t(),De(n),n.restore(),i.restore()},c=(e,t=1)=>({h:-16+e()*14,s:52+e()*16,l:22+e()*13+t*7}),l=(e,t=1)=>e()<.06?{h:8+e()*8,s:70,l:34+e()*8+t*4}:{h:-12+e()*14,s:60+e()*16,l:27+e()*14+t*7},u=(e,t=1)=>({h:-18+e()*12,s:48+e()*16,l:16+e()*10+t*6}),d=(e,t=1)=>{if(e()<.04)return{h:56+e()*8,s:54,l:42+e()*8};let n=45+e()*14+t*10;return{h:40+(n-45)*.5+e()*4,s:74+e()*14,l:n}};return s(U.mapleA,()=>Oe(n,o,c,290,a)),s(U.mapleB,()=>Oe(n,o,l,290,a)),s(U.mapleC,()=>Oe(n,o,u,310,a)),s(U.mapleLeaf,()=>xe(n,256,330,205,0,{h:-2,s:86,l:40},o)),s(U.ginkgoA,()=>ke(n,o,d,80,a)),s(U.ginkgoB,()=>ke(n,o,d,90,a)),s(U.pinePad,()=>je(n,o)),s(U.pineSpray,()=>Me(n,o)),s(U.cedarA,()=>Pe(n,o,5)),s(U.cedarB,()=>Pe(n,o,7)),s(U.bamboo,()=>Fe(n,o)),s(U.shrub,()=>Ie(n,o,190,!1)),s(U.litterGinkgo,()=>Le(n,o,`ginkgo`)),s(U.litterMaple,()=>Le(n,o,`maple`)),s(U.ginkgoLeaf,()=>Se(n,256,400,230,0,{h:47,s:90,l:52},o)),s(U.shrubB,()=>Ie(n,o,170,!0)),{canvas:t,ncanvas:r}}function ze(e){let t=e.width,n=e.height,r=e.getContext(`2d`).getImageData(0,0,t,n).data,i=document.createElement(`canvas`);i.width=t,i.height=n;let a=i.getContext(`2d`,{willReadFrequently:!0});a.filter=`blur(10px)`,a.drawImage(e,0,0),a.filter=`blur(28px)`,a.globalCompositeOperation=`destination-over`,a.drawImage(e,0,0);let o=a.getImageData(0,0,t,n).data,s=new Uint8Array(t*n*4);for(let e=0;e<t*n*4;e+=4){let t=r[e+3];if(t>=250)s[e]=r[e],s[e+1]=r[e+1],s[e+2]=r[e+2];else{let n=t/255,i=o[e+3],a=i>0?o[e]:60,c=i>0?o[e+1]:40,l=i>0?o[e+2]:25;s[e]=Math.round(r[e]*n+a*(1-n)),s[e+1]=Math.round(r[e+1]*n+c*(1-n)),s[e+2]=Math.round(r[e+2]*n+l*(1-n))}s[e+3]=t}return s}function Be(e=71,t=8){let{canvas:r,ncanvas:i}=Re(e),o=(e,n,r,i)=>{let o=new d(e,n,n,r,s);return o.colorSpace=i,o.generateMipmaps=!0,o.minFilter=T,o.magFilter=se,o.wrapS=o.wrapT=a,o.anisotropy=t,o.flipY=!1,o.needsUpdate=!0,o},c=o(ze(r),he,n,p);c.userData.size=he;let l=i.width,u=i.getContext(`2d`).getImageData(0,0,l,l).data,f=new Uint8Array(l*l*2);for(let e=0,t=0;t<f.length;e+=4,t+=2)f[t]=u[e],f[t+1]=u[e+1];return{map:c,normalMap:o(f,l,b,``)}}var Ve={maple:{base:[.066,.054,.046],dark:[.02,.017,.015],lichen:[.12,.13,.1],normal:2.2},ginkgo:{base:[.115,.098,.082],dark:[.022,.019,.017],lichen:[.19,.18,.15],normal:4.2},pine:{base:[.22,.19,.17],dark:[.06,.05,.045],lichen:[.28,.28,.26],normal:3.8},cedar:{base:[.3,.17,.11],dark:[.11,.06,.04],lichen:[.36,.25,.18],normal:2.8},bamboo:{base:[.44,.52,.2],dark:[.3,.36,.12],lichen:[.62,.62,.34],normal:1.2}};function He(e,t=5,r=8){let i=new te(t),a=Ve[e],o=new Float32Array(143360),c=new Float32Array(430080),l=Math.PI*2,u=(e,t,n,r,a)=>{let o=n/l;return i.noise(Math.cos(e*l)*o+a,Math.sin(e*l)*o+t*r+a*1.7)};for(let t=0;t<560;t++){let n=t/512;for(let r=0;r<256;r++){let i=r/256,s=.5,d=0;if(e===`maple`){s=.55+.22*u(i,n,7,3,1)+.08*u(i,n,40,20,7);let e=Math.max(0,Math.sin(n*512*.32+u(i,n,12,2,3)*3))**24*(u(i,n,18,6,9)>.1);s-=e*.25,d=Math.max(0,u(i,n,5,2.5,11)-.35)*1.6}else if(e===`ginkgo`){let e=1-Math.abs(u(i,n,11,2.2,2));s=.25+.6*e*e+.1*u(i,n,50,12,5),d=Math.max(0,u(i,n,4,2,13)-.4)*1.2}else if(e===`pine`){let e=u(i,n,9,4.5,4)+.35*u(i,n,22,10,6);s=.25+.65*(1-Math.exp(-Math.abs(e)*5))+.06*u(i,n,60,30,8),d=Math.max(0,u(i,n,4,2,15)-.5)}else if(e===`cedar`)s=.5+.3*Math.sin(i*l*26+u(i,n,4,1.2,3)*5)*(.6+.4*u(i,n,30,1.5,9))+.08*u(i,n,80,4,1),d=Math.max(0,u(i,n,6,1.5,17)-.3)*.8;else{let e=t%512/512,r=Math.exp(-((e/.012)**2))+Math.exp(-(((1-e)/.012)**2));s=.5+.06*u(i,n,90,1,2)+r*.45,d=Math.exp(-(((e-.03)/.03)**2))*.7+Math.max(0,u(i,n,3,2,19)-.3)*.5}s=R(s,0,1);let f=t*256+r;o[f]=s;let p=.55+.65*s,m=R(d,0,1);for(let e=0;e<3;e++){let t=a.dark[e]+(a.base[e]-a.dark[e])*R(s*1.25-.1,0,1);t*=p,t+=(a.lichen[e]-t)*m*.6,c[f*3+e]=t}}}let f=(e,t)=>{for(let n=0;n<48;n++){let r=n/48;for(let i=0;i<256;i++)for(let a=0;a<t;a++){let o=e[((n+512)*256+i)*t+a],s=e[(n*256+i)*t+a];e[(n*256+i)*t+a]=o+(s-o)*r}}};e!==`bamboo`&&(f(o,1),f(c,3));let m=new Uint8Array(524288),h=new Uint8Array(524288),_=(e,t)=>o[(t%512+512)%512*256+(e%256+256)%256];for(let e=0;e<512;e++)for(let t=0;t<256;t++){let n=e*256+t;for(let e=0;e<3;e++)m[n*4+e]=Math.round(R(c[n*3+e],0,1)**(1/2.2)*255);m[n*4+3]=255;let r=(_(t+1,e)-_(t-1,e))*a.normal,i=(_(t,e+1)-_(t,e-1))*a.normal,o=-r,s=i,l=Math.hypot(o,s,1);h[n*4]=Math.round((o/l*.5+.5)*255),h[n*4+1]=Math.round((s/l*.5+.5)*255),h[n*4+2]=Math.round((1/l*.5+.5)*255),h[n*4+3]=255}let v=(e,t)=>{let i=new d(e,256,512,n,s);return i.colorSpace=t?p:``,i.wrapS=i.wrapT=g,i.generateMipmaps=!0,i.minFilter=T,i.magFilter=se,i.anisotropy=r,i.needsUpdate=!0,i};return{map:v(m,!0),normalMap:v(h,!1)}}function Ue(e=91,t=8){let r=1024,i=(e,i)=>{let a=document.createElement(`canvas`);a.width=a.height=r;let o=a.getContext(`2d`,{willReadFrequently:!0}),c=j(i),l=e===`ginkgo`?1500:1250;for(let t=0;t<l;t++){let n=c()*r,i=c()*r,a=c()<(e===`ginkgo`?.3:.42),s=c()*Math.PI*2,l,u;e===`ginkgo`?(l=a?{h:33+c()*8,s:50,l:30+c()*10}:{h:43+c()*9,s:80+c()*14,l:42+c()*14},u=22+c()*16):(l=a?{h:14+c()*14,s:38,l:16+c()*8}:{h:-6+c()*24,s:68+c()*16,l:21+c()*11},u=26+c()*18);for(let a of[-1024,0,r])for(let c of[-1024,0,r]){let d=n+a,f=i+c;if(d<-u*1.2||d>r+u*1.2||f<-u*1.2||f>r+u*1.2)continue;let p=j(t*7+1);e===`ginkgo`?Se(o,d,f,u,s,l,p):xe(o,d,f,u,s,l,p)}}let u=ze(a),f=new d(u,r,r,n,s);return f.colorSpace=p,f.wrapS=f.wrapT=g,f.generateMipmaps=!0,f.minFilter=T,f.magFilter=se,f.anisotropy=t,f.flipY=!1,f.needsUpdate=!0,f};return{maple:i(`maple`,e),ginkgo:i(`ginkgo`,e+1)}}var q=E,J=new q(0,1,0),We=class{constructor(e){this.rand=e,this.branches=[],this.leaves=[],this.clumps=[]}R(e,t){return e+(t-e)*this.rand()}curve(e,t,n,r,{upturn:i=0,noise:a=.08,pull:o=null,pullK:s=0}={}){let c=[e.clone()],l=t.clone().normalize(),u=e.clone(),d=n/r;for(let e=1;e<=r;e++)l.y+=i/r,l.x+=(this.rand()-.5)*a,l.z+=(this.rand()-.5)*a,l.y+=(this.rand()-.5)*a*.5,o&&l.addScaledVector(o,s/r),l.normalize(),u.addScaledVector(l,d),c.push(u.clone());return c}branch(e,t,n,r,i,a,o,s){let c=e.length,l={pts:e,rads:e.map((e,r)=>t+(n-t)*(r/(c-1))**.9),level:r,w0:i,w1:i+a,ph0:o,ph1:o+s};return this.branches.push(l),l}at(e,t){let n=e.pts.length-1,r=R(t,0,1)*n,i=Math.min(n-1,Math.floor(r)),a=r-i;return{p:e.pts[i].clone().lerp(e.pts[i+1],a),d:e.pts[i+1].clone().sub(e.pts[i]).normalize(),r:e.rads[i]+(e.rads[i+1]-e.rads[i])*a,w:e.w0+(e.w1-e.w0)*t,ph:e.ph0+(e.ph1-e.ph0)*t}}leaf(e,t,n,r,i,a,o,s){let c={p:e.clone(),dir:t.clone().normalize(),size:n,cell:r,tint:i,w:a,ph:o,keep1:this.rand()};return s&&Object.assign(c,s),this.leaves.push(c),c}clump(e,t,n,r,i,a,o,s,c,l,u=.4){let d={c:e.clone(),rx:t,ry:n,size:i,lod1:2.1*Math.max(t,n),cells:a,weights:o,tintFn:s,w:c,ph:l};this.clumps.push(d);for(let d=0;d<r;d++){let r=this.R(0,Math.PI*2),d=Math.asin(this.R(-.55,1)),f=new q(Math.cos(r)*Math.cos(d),Math.sin(d),Math.sin(r)*Math.cos(d)),p=.25+.75*Math.sqrt(this.rand()),m=i*this.R(.8,1.2),h=e.clone().add(new q(f.x*t*p,f.y*n*p-m*.35,f.z*t*p));this.leaf(h,f.clone().add(new q(0,u,0)),m,Ke(this,a,o),s(this),c,l,{fromClump:!0,n:f,ao:.72+.28*p*(.6+.4*Math.max(0,f.y))})}return d}},Ge=e=>new q(Math.cos(e),0,Math.sin(e)),Y=(e,t)=>new q(Math.cos(e)*Math.cos(t),Math.sin(t),Math.sin(e)*Math.cos(t));function Ke(e,t,n){let r=e.rand(),i=0;for(let e=0;e<t.length;e++)if(i+=n[e],r<i)return t[e];return t[t.length-1]}function qe(e,t,n,r=0){let i=(e.y-t.y)/n.y,a=1-r*(R(i,-1,1)+1)*.5;return Math.hypot((e.x-t.x)/(n.x*a),i,(e.z-t.z)/(n.z*a))}function Je(e,t,n,r,i){let a=!1;for(let o=0;o<e.length;o++){let s=qe(e[o],t,n,r);if(s<=i)a=!0;else if(a){let a=qe(e[o-1],t,n,r),c=e.slice(0,o);return c.push(e[o-1].clone().lerp(e[o],(i-a)/(s-a))),c}}return e}function Ye(e,t,n,r,i,a){let o=[];for(let n of t)for(let t=.3;t<=1.0001;t+=.1)o.push(e.at(n,t));let s=(t,n,r)=>{let i=e.clump(t,a.rx*e.R(.8,1.2),a.ry*e.R(.8,1.2),a.per+Math.floor(e.rand()*3),a.size,a.cells,a.weights,a.tint,n,r,a.up??.5);a.lod1&&(i.lod1=2*a.lod1*(Math.max(i.rx,i.ry)+.5*i.size))},c=a.tips||[];for(let t of c){let n=e.at(t,1);s(n.p.clone().add(new q(0,a.ry*.2,0)),n.w,n.ph)}for(let t=c.length;t<i;t++){let t=e.R(0,Math.PI*2),i=Math.asin(e.R(a.elMin??-.45,1)),c=new q(Math.cos(t)*Math.cos(i),Math.sin(i),Math.sin(t)*Math.cos(i)),l=e.rand()<(a.inner??.2)?e.R(.25,.6):e.R(.7,1),u=1-(a.taper??0)*(c.y+1)*.5,d=new q(n.x+c.x*r.x*l*u,n.y+c.y*r.y*l,n.z+c.z*r.z*l*u),f=o[0],p=1/0;for(let e of o){let t=e.p.distanceToSquared(d);t<p&&(p=t,f=e)}let m=f.w,h=f.ph,g=d.clone().sub(f.p),_=g.length();if(_>.5){let t=e.branch(e.curve(f.p,g,_*.9,3,{noise:.12}),Math.max(.018,f.r*.45),.01,2,f.w,.4,f.ph,e.R(.5,1.5)),n=e.at(t,1);m=n.w,h=n.ph}s(d,m,h)}}var Xe=[U.mapleA,U.mapleB,U.mapleC],Ze=[.42,.33,.25];function Qe(e){let t=.8+e.rand()*.32,n=e.rand()<.08?1.08:1;return[t*1.02,t*(.9+.12*e.rand())*n,t*(.9+.1*e.rand())]}function $e(e,t=1){let n=(t,n)=>e.R(t,n),r=n(1.3,2.2)*t,i=n(.22,.32)*t,a=Ge(n(0,Math.PI*2)),o=a.clone().multiplyScalar(n(.05,.25)).add(J),s=e.curve(new q(0,-.3,0),o,r+.3,4,{noise:.06});e.branch(s,i*1.4,i*.9,0,0,0,n(0,6.28),0);let c=s[s.length-1],l=n(4,5)*t,u=n(2.6,3.2)*t,d=c.clone().add(new q(a.x*.5*t,u*.8,a.z*.5*t)),f=new q(l,u,l*n(.9,1.1)),p=[],m=4+Math.floor(e.rand()*2),h=n(0,Math.PI*2);for(let r=0;r<m;r++){let a=h+r/m*Math.PI*2+n(-.3,.3),o=n(3.4,4.4)*t,s=Je(e.curve(c,Y(a,n(.45,.85)),o,7,{upturn:-.2,noise:.2}),d,f,0,.95),l=e.branch(s,i*.7,i*.18,1,.05,.4,n(0,6.28),n(.5,1.5));p.push(l);let u=e.at(l,n(.35,.6)),g=Je(e.curve(u.p,Y(a+n(-1.2,1.2),n(.1,.5)),o*n(.5,.7),4,{upturn:.2,noise:.2}),d,f,0,.95);p.push(e.branch(g,u.r*.6,.03,2,u.w,.4,u.ph,n(.5,1.5)))}return Ye(e,p,d,f,Math.round(n(36,42)),{rx:1.3*t,ry:.85*t,per:19,size:n(.62,.72)*t,tips:p,lod1:1,cells:Xe,weights:Ze,tint:Qe,up:.8,inner:.25,elMin:-.5}),{flex:.8,kind:`maple`,barkLod1:1}}var et=[U.ginkgoA,U.ginkgoB];function tt(e){let t=e.rand()<.03,n=.84+e.rand()*.28;return t?[.85*n,.97*n,.6*n]:[n,n*(.94+.08*e.rand()),n*.9]}function nt(e,t=1,n={}){let r=(t,n)=>e.R(t,n),i=n.shape===`columnar`,a=(i?r(21,25):r(15,19))*t,o=r(.42,.56)*t,s=e.curve(new q(0,-.3,0),new q(r(-.04,.04),1,r(-.04,.04)),a*.9+.3,10,{noise:.025}),c=e.branch(s,o*1.25,.08,0,0,.25,r(0,6.28),r(.3,.8)),l=(i?r(3.7,4.4):r(5.2,6.4))*t,u=a*(i?r(.41,.44):r(.37,.41)),d=e.at(c,.6).p,f=new q(d.x,a*(i?.56:.58),d.z),p=new q(l,u,l*r(.9,1.1)),m=i?.38:0,h=[c],g=r(0,6.28),_=Math.floor(i?r(15,19):r(12,16));for(let t=0;t<_;t++){let n=(i?.2:.3)+t/_*(i?.72:.6),a=e.at(c,n);g+=2.39996+r(-.3,.3);let o=(a.p.y-f.y)/u,s=l*Math.sqrt(Math.max(.15,1-o*o))*r(.7,.95)*(i?1-.3*(n-.2):1),d=i?r(.95,1.25):r(.55,.95),v=Je(e.curve(a.p,Y(g,d),s/Math.cos(d),5,{upturn:.1,noise:.16}),f,p,m,.8);h.push(e.branch(v,Math.max(.04,a.r*.45),.025,1,a.w,.5,a.ph,r(.5,1.4)))}return Ye(e,h,f,p,Math.round(i?r(104,114):r(98,108)),{rx:(i?1.3:1.54)*t,ry:(i?1.25:1.2)*t,per:30,size:r(.52,.6)*t,tips:h,lod1:1,cells:et,weights:[.5,.5],tint:tt,up:.4,inner:i?.38:.32,elMin:-.75,taper:m}),{flex:.95,kind:`ginkgo`,barkLod1:1}}function rt(e,t=1){let n=(t,n)=>e.R(t,n),r=n(8,12)*t,i=n(.22,.32)*t,a=Ge(n(0,6.28)).multiplyScalar(n(.15,.45)).add(J),o=e.curve(new q(0,-.3,0),a,r*.92,9,{noise:.28,pull:J,pullK:.35}),s=e.branch(o,i*1.25,.07,0,0,.3,n(0,6.28),n(.3,.7)),c=5+Math.floor(e.rand()*3),l=n(0,6.28);for(let r=0;r<c;r++){let i=.4+r/c*.55,a=e.at(s,i);l+=n(1.6,2.8);let o=n(2,3.8)*(1.1-i*.6)*t,u=e.curve(a.p,Y(l,n(-.15,.2)),o,5,{upturn:.25,noise:.22}),d=e.branch(u,Math.max(.045,a.r*.5),.03,1,a.w,.4,a.ph,n(.6,1.6));at(e,e.at(d,1),n(1.4,2)*t),e.rand()<.5&&at(e,e.at(d,.55),n(1,1.4)*t)}return at(e,e.at(s,1),n(1.5,2)*t),{flex:.6,kind:`pine`,barkLod1:0}}function it(e){let t=.4+e.rand()*.2;return[t,t,t*.95]}function at(e,t,n){e.clump(t.p.clone().add(new q(0,n*.18,0)),n,n*.45,Math.round(8+n*4),e.R(.95,1.25)*(.7+n*.2),[U.pinePad,U.pineSpray],[.5,.5],it,t.w,t.ph,.9)}function ot(e){let t=.45+e.rand()*.2;return e.rand()<.06?[1.25*t,.9*t,.65*t]:[t,t,t]}function st(e,t=1){let n=(t,n)=>e.R(t,n),r=n(20,27)*t,i=n(.36,.5)*t,a=e.curve(new q(0,-.3,0),new q(n(-.02,.02),1,n(-.02,.02)),r+.3,12,{noise:.015}),o=e.branch(a,i*1.3,.05,0,0,.3,n(0,6.28),n(.3,.8)),s=n(.2,.3),c=n(0,6.28),l=Math.floor(n(22,28));for(let r=0;r<l;r++){let i=s+r/l*(.97-s),a=(i-s)/(1-s),u=3+ +(e.rand()<.5);for(let r=0;r<u;r++){c+=2.39996+n(-.3,.3);let r=e.at(o,i),s=(.6+2.8*(1-a)**.85)*n(.8,1.2)*t,l=e.curve(r.p,Y(c,n(-.4,.02)),s,3,{upturn:.18,noise:.1}),u=e.branch(l,Math.max(.025,r.r*.22),.012,1,r.w,.35,r.ph,n(.5,1.3)),d=e.at(u,.05),f=e.at(u,1),p=f.p.clone().sub(d.p).normalize(),m=p.clone().setY(0).normalize(),h=Math.max(1,s*1.2)*n(.95,1.1),g=n(0,Math.PI);for(let t=0;t<3;t++)e.leaf(d.p,p,h,Ke(e,[U.cedarA,U.cedarB],[.5,.5]),ot(e),d.w,d.ph,{axis:p,roll:g+t*Math.PI/3+n(-.15,.15),n:m.clone().add(new q(0,.35,0)).normalize(),ao:.8});s>1.2&&e.leaf(f.p.clone().add(new q(0,-.3,0)),m.clone().add(new q(0,.4,0)),n(.9,1.2)*t,U.cedarB,ot(e),f.w,f.ph,{n:m,ao:1})}}let u=e.at(o,1),d=n(1.1,1.4)*t;for(let t=0;t<3;t++)e.leaf(u.p.clone().add(new q(0,-d*.62,0)),J,d,U.cedarA,ot(e),u.w,u.ph,{axis:J,roll:t*Math.PI/3+n(-.2,.2),n:J,ao:1});for(let r=0;r<6;r++)e.leaf(u.p.clone().add(new q(0,-1-r*.35,0)),new q(n(-.5,.5),1,n(-.5,.5)),n(1,1.3)*t,U.cedarA,ot(e),u.w,u.ph,{n:J,ao:1});return{flex:.7,kind:`cedar`,barkLod1:0}}function ct(e,t=1){let n=(t,n)=>e.R(t,n),r=10+Math.floor(e.rand()*9),i=n(1.2,2.2);for(let a=0;a<r;a++){let r=n(0,6.28),a=Math.sqrt(e.rand())*i,o=new q(Math.cos(r)*a,-.2,Math.sin(r)*a),s=n(8,13)*t,c=new q(Math.cos(r)*a*.03+n(-.05,.05),1,Math.sin(r)*a*.03+n(-.05,.05)),l=e.curve(o,c,s,8,{noise:.02,upturn:-.12}),u=e.branch(l,n(.035,.06),.02,0,0,.9,n(0,6.28),n(.6,1.4));u.bamboo=n(.28,.42);let d=Math.round(n(14,20));for(let t=0;t<d;t++){let r=e.at(u,.4+t/d*.6),i=Ge(n(0,6.28));e.leaf(r.p.clone().addScaledVector(i,.15),i.clone().add(new q(0,n(-.2,.6),0)),n(.8,1.2),U.bamboo,[.9+e.rand()*.25,.9+e.rand()*.25,.85],r.w,r.ph)}}return{flex:1.35,kind:`bamboo`,barkLod1:0}}function lt(e,t=1,n={}){let r=(t,n)=>e.R(t,n),i=n.cells||[U.shrub,U.shrubB],a=r(.8,1.4)*t,o=r(.8,1.5)*t,s=4+Math.floor(e.rand()*4);for(let t=0;t<s;t++){let t=e.curve(new q(0,-.1,0),Y(r(0,6.28),r(.7,1.2)),o,3,{noise:.2});e.branch(t,.03,.01,1,0,.5,r(0,6.28),1)}let c=Math.round(24+a*16);for(let n=0;n<c;n++){let s=r(0,6.28),c=r(-.1,1.3),l=Y(s,c),u=new q(l.x*a*r(.35,.9),.1+o*(.3+.55*Math.sin(c)*r(.6,1)),l.z*a*r(.35,.9)),d=.85+e.rand()*.3;e.leaf(u,l,r(.8,1.2)*t,i[n%i.length],[d,d,d],.5+.3*(u.y/o),r(0,6.28),{n:l,ao:.7+.3*Math.max(0,l.y)})}return{flex:.5,kind:`shrub`,barkLod1:1}}var ut={maple:$e,ginkgo:nt,pine:rt,cedar:st,bamboo:ct,shrub:lt},dt=class{constructor(){this.pos=[],this.nor=[],this.uv=[],this.col=[],this.wind=[],this.idx=[]}get count(){return this.pos.length/3}build(){let e=new r;return e.setAttribute(`position`,new u(this.pos,3)),e.setAttribute(`normal`,new u(this.nor,3)),e.setAttribute(`uv`,new u(this.uv,2)),e.setAttribute(`color`,new u(this.col,3)),e.setAttribute(`aWind`,new u(this.wind,4)),e.setIndex(this.count>65535?new _(this.idx,1):new l(this.idx,1)),e.computeBoundingBox(),e.computeBoundingSphere(),e}};function ft(e,t){let n=(e.x-t.c.x)/t.r.x,r=(e.z-t.c.z)/t.r.z,i=.45+.55*D(.3,1,Math.hypot(n,(e.y-t.c.y)/t.r.y,r)),a=e.y<t.c.y?.6+.4*D(.35,1.1,Math.hypot(n,r)):1;return Math.min(i,a)}function pt(e,t,n,r,i,a,o){let s=t.pts,c=t.rads;if(a&&s.length>3){let e=[0];for(let t=2;t<s.length-1;t+=2)e.push(t);e.push(s.length-1),s=e.map(e=>t.pts[e]),c=e.map(e=>t.rads[e])}let l=s.length,u=[],d=[],f=[];for(let e=0;e<l;e++)u.push(s[Math.min(l-1,e+1)].clone().sub(s[Math.max(0,e-1)]).normalize());let p=Math.abs(u[0].y)>.9?new q(1,0,0):new q(0,1,0);p.sub(u[0].clone().multiplyScalar(p.dot(u[0]))).normalize(),d.push(p),f.push(u[0].clone().cross(p));for(let e=1;e<l;e++){let t=u[e-1].clone().cross(u[e]),n=t.length(),r=d[e-1].clone();n>1e-6&&r.applyAxisAngle(t.divideScalar(n),Math.acos(R(u[e-1].dot(u[e]),-1,1))),d.push(r),f.push(u[e].clone().cross(r))}let m=e.count,h=2*Math.PI*c[0],g=t.bamboo?1:Math.max(1,Math.round(h/.9)),_=t.bamboo?1/t.bamboo:1/1.8,v=0;for(let a=0;a<l;a++){a>0&&(v+=s[a].distanceTo(s[a-1]));let u=a/(l-1),p=t.w0+(t.w1-t.w0)*u,m=t.ph0+(t.ph1-t.ph0)*u;for(let t=0;t<=n;t++){let l=t/n*Math.PI*2,u=Math.cos(l),h=Math.sin(l),y=d[a].x*u+f[a].x*h,b=d[a].y*u+f[a].y*h,x=d[a].z*u+f[a].z*h,S=s[a],C=S.y+b*c[a];e.pos.push(S.x+y*c[a],C,S.z+x*c[a]),e.nor.push(y,b,x),e.uv.push(t/n*g,v*_);let w=(.45+.55*R((C+.2)/1.6,0,1))*ft(S,o);e.col.push(w,w,w),e.wind.push(R(C/r,0,1.2)*i,p,m,0)}}for(let t=0;t<l-1;t++)for(let r=0;r<n;r++){let i=m+t*(n+1)+r,a=i+n+1;e.idx.push(i,a,i+1,i+1,a,a+1)}}function mt(e,t,n,r,i,a,o){let s=new q,c=new q,l=new q,u=new q;for(let d of t){let t;if(d.axis){c.copy(d.axis).normalize();let e=Math.abs(c.y)<.9?J:new q(1,0,0);t=e.clone().sub(c.clone().multiplyScalar(e.dot(c))).normalize().applyAxisAngle(c,d.roll||0),s.crossVectors(c,t).normalize()}else{t=d.dir.clone().add(new q((o()-.5)*.6,(o()-.5)*.4,(o()-.5)*.6)).normalize();let e=d.dir.clone();Math.abs(e.dot(t))>.95&&(e=J.clone()),s.crossVectors(e,t),s.lengthSq()<1e-6&&s.set(1,0,0),s.normalize(),s.applyAxisAngle(t,(o()-.5)*1.6),c.crossVectors(t,s).normalize()}let f=d.size*a,p=W(d.cell),m=o()<.5,h=m?p.u1:p.u0,g=m?p.u0:p.u1;u.copy(d.p).sub(n.c).divide(n.r),u.lengthSq()<1e-6&&u.set(0,1,0);let _=R(u.length(),0,1.2);u.normalize(),d.n?l.copy(u).multiplyScalar(.55).addScaledVector(d.n,.33).addScaledVector(t,.12):l.copy(u).multiplyScalar(.8).addScaledVector(t,.2),l.addScaledVector(J,n.upBias).normalize();let v=R((d.p.y-(n.c.y-n.r.y))/(2*n.r.y),0,1),y=(.5+.5*R(_,0,1))*(.78+.22*v)*(d.ao??1),b=e.count,x=-.12*f,S=[[-.5,0,h,p.vBottom],[.5,0,g,p.vBottom],[-.5,1,h,p.vTop],[.5,1,g,p.vTop]];for(let[t,n,a,o]of S){let u=d.p.x+s.x*t*f+c.x*(n*f+x),p=d.p.y+s.y*t*f+c.y*(n*f+x),m=d.p.z+s.z*t*f+c.z*(n*f+x);e.pos.push(u,p,m),e.nor.push(l.x,l.y,l.z),e.uv.push(a,o),e.col.push(d.tint[0]*y,d.tint[1]*y,d.tint[2]*y),e.wind.push(R(p/r,0,1.2)*i,d.w+n*.12,d.ph+n*.3,.6+n*.4)}e.idx.push(b,b+1,b+2,b+1,b+3,b+2)}}function ht(e,t,n=1,r={}){let i=new We(j(t)),a=(r.grower||ut[e])(i,n,r),o=new S;for(let e of i.branches)for(let t of e.pts)o.expandByPoint(t);let s=new S;for(let e of i.leaves)s.expandByPoint(e.p);s.isEmpty()&&s.copy(o),o.union(s.clone().expandByScalar(1.2));let c=Math.max(1,o.max.y),l={c:s.getCenter(new q),r:s.getSize(new q).multiplyScalar(.5).max(new q(.8,.8,.8)),upBias:e===`maple`?.3:e===`pine`?.4:.15},u=a.flex,d=(e,t)=>t===0?[9,6,4,3][e]:[6,4,3,3][e],f=new dt,p=new dt;for(let t of i.branches)pt(f,t,d(t.level,0)||3,c,u,!1,l),(t.level<=(a.barkLod1??1)||e===`bamboo`)&&pt(p,t,e===`bamboo`?3:d(t.level,1),c,u,!0,l);let m=new dt,h=new dt;mt(m,i.leaves,l,c,u,1,j(t*7+3));let g=j(t*11+5),_=[];if(i.clumps.length){for(let e of i.clumps){let t=e.c.clone().sub(l.c).setY(0);t.lengthSq()<1e-4&&t.set(1,0,0),t.normalize();let n=e.lod1,r=e.c.clone().add(new q(0,-n*.38,0)),a=e.tintFn(i),o=Ke(i,e.cells,e.weights),s=e.c.clone().sub(l.c).normalize();_.push({p:r,dir:t.clone().add(new q(0,.25,0)),size:n,cell:o,tint:a,w:e.w,ph:e.ph,n:s,ao:.95}),_.push({p:r,dir:t.clone().applyAxisAngle(J,Math.PI/2).add(new q(0,.25,0)),size:n,cell:o,tint:a,w:e.w,ph:e.ph,n:s,ao:.9})}mt(h,_,l,c,u,1,g)}let v=i.leaves.filter(e=>!e.fromClump&&e.keep1<.45);(!i.clumps.length||v.length)&&mt(h,i.clumps.length?v:i.leaves.filter(e=>e.keep1<.45),l,c,u,1.4,g);let y=o.getSize(new q),b=i.branches[0];return{kind:e,height:c,radius:Math.max(y.x,y.z)*.5,box:o,crown:l,trunkR:b?b.rads[0]:.1,trunk:b?{pts:b.pts.map(e=>[e.x,e.y,e.z]),rads:b.rads.slice()}:null,lod0:{bark:f.build(),leaves:m.build()},lod1:{bark:p.build(),leaves:h.count?h.build():m.build()},cards:i.leaves.length}}var X={uTreeCam:{value:new E},uLeafTrans:{value:new f(1,.8,.55)},uLeafWrap:{value:.5},uLeafScatter:{value:1},uAtlasSize:{value:2048}},gt=`
#include <kaze_wind>
attribute vec4 aWind;
uniform vec3 uTreeCam;
uniform vec4 uLodFade;
varying vec2 vTreeFade;
`,_t=`
vec3 transformed = vec3(position);
#ifdef USE_INSTANCING
  vec3 kzBase = (modelMatrix * vec4(instanceMatrix[3].xyz, 1.0)).xyz;
  mat3 kzIR = mat3(instanceMatrix);
#else
  vec3 kzBase = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  mat3 kzIR = mat3(1.0);
#endif
float kzS2 = max(dot(kzIR[1], kzIR[1]), 1e-4);
vec2 kzW = kazeWindBend(kzBase.xz);
float kzGl = length(kzW);
// where the two winds cancel the direction fades out through zero instead of flipping in one frame (a unit vector would
// take the crown's constant flutter below with it); the ambient gust is never under 0.24, so there this is the unit vector
vec2 kzWd = kzW / max(kzGl, 0.15);
// a guided gust (up to 1.85x the ambient one) bends a crown at most ~20 % more than the strongest ambient gust, and
// softly: with the ambient wind nothing changes (a bamboo top swung up to 5.6 m in a guided gust, now up to ~3.8 m)
float kzGp = max(kazeGustPeak(), 1e-3);
float kzG = min(kzGl, kzGp) + 0.2 * kzGp * tanh(max(kzGl - kzGp, 0.0) / (0.2 * kzGp));
float kzPh = fract(sin(dot(floor(kzBase.xz * 2.0), vec2(12.9898, 78.233))) * 43758.5453) * 6.2831853;
vec3 kzWL = (transpose(kzIR) * vec3(kzWd.x, 0.0, kzWd.y)) / kzS2;
float kzH = aWind.x;
float kzSway = kzG * (0.6 + 0.4 * sin(uTime * 0.72 + kzPh)) + 0.08 * sin(uTime * 1.9 + kzPh * 2.0);
transformed += kzWL * (kzH * kzH) * kzSway * 1.05;
float kzB = sin(uTime * (1.6 + 0.4 * sin(aWind.z * 3.1)) + aWind.z + kzPh);
transformed += (kzWL * (0.55 + 0.45 * kzB) + vec3(0.0, kzB * 0.16, 0.0) / sqrt(kzS2)) * aWind.y * kzG * 0.3;
float kzF = sin(uTime * (6.5 + 3.5 * fract(aWind.z * 7.31)) + aWind.z * 23.0 + dot(position, vec3(3.1, 1.7, 2.3)));
transformed += normal * (kzF * aWind.w * (0.02 + 0.055 * kzG));
float kzD = distance(kzBase.xz, uTreeCam.xz);
vTreeFade = vec2(smoothstep(uLodFade.x, uLodFade.y, kzD), 1.0 - smoothstep(uLodFade.z, uLodFade.w, kzD));
`,vt=`
varying vec2 vTreeFade;
float kzIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
`,yt=`
  {
    float kzN = kzIGN(gl_FragCoord.xy);
    if (kzN >= vTreeFade.y || kzN < 1.0 - vTreeFade.x) discard;
  }
`,bt=`
uniform vec3 uLeafTrans;
uniform float uLeafWrap;
uniform float uLeafScatter;
uniform float uAtlasSize;
vec3 kzLeafTrans = vec3(0.0);
`,xt=`
#include <lights_fragment_end>
#if NUM_SUN_LIGHTS > 0
  {
    float kzVoL = clamp(dot(-geometryViewDir, sunLights[0].direction), 0.0, 1.0);
    reflectedLight.directDiffuse += sunLights[0].color * kzLeafTrans * uLeafScatter * (0.18 * pow(kzVoL, 3.0) + 0.3 * pow(kzVoL, 12.0));
  }
#endif`,St=`
#undef RE_Direct
void RE_Direct_Leaf(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  float NoL = dot(geometryNormal, directLight.direction);
  float wrapNL = clamp((NoL + uLeafWrap) / (1.0 + uLeafWrap), 0.0, 1.0);
  reflectedLight.directDiffuse += wrapNL * directLight.color * BRDF_Lambert(material.diffuseContribution);
  reflectedLight.directSpecular += clamp(NoL, 0.0, 1.0) * directLight.color * BRDF_GGX(directLight.direction, geometryViewDir, geometryNormal, material) * 0.35;
  float VoL = clamp(dot(-geometryViewDir, directLight.direction), 0.0, 1.0);
  float trans = 0.35 * pow(VoL, 3.0) + 0.9 * pow(VoL, 14.0);
  // light gets through a leaf whose back faces the sun: with the per-leaf normal, a backlit crown glows leaf by leaf
  trans *= clamp(0.55 - 0.75 * NoL, 0.2, 1.25);
  reflectedLight.directDiffuse += directLight.color * kzLeafTrans * trans;
}
#define RE_Direct RE_Direct_Leaf
`,Ct=`
#if defined( RE_IndirectSpecular )
  radiance *= 0.12;
#endif
#include <lights_fragment_end>`,wt=`
#undef RE_Direct
void RE_Direct_Bark(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  float NoL = clamp(dot(geometryNormal, directLight.direction), 0.0, 1.0);
  reflectedLight.directDiffuse += NoL * directLight.color * BRDF_Lambert(material.diffuseContribution);
  reflectedLight.directSpecular += NoL * directLight.color * BRDF_GGX(directLight.direction, geometryViewDir, geometryNormal, material) * 0.1;
}
#define RE_Direct RE_Direct_Bark
`;function Tt(e){e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+gt).replace(`#include <begin_vertex>`,_t)}function Et(e){e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+vt).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
`+yt)}function Dt(e){e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+bt).replace(`#include <map_fragment>`,`#include <map_fragment>
#ifdef USE_MAP
  {
    vec2 kzTs = vMapUv * uAtlasSize;
    float kzLod = max(0.0, 0.5 * log2(max(dot(dFdx(kzTs), dFdx(kzTs)), dot(dFdy(kzTs), dFdy(kzTs)))));
    diffuseColor.a *= 1.0 + kzLod * 0.32;
    // a card seen edge-on reads as a strip: fade it out (true face normal from the position derivatives)
    vec3 kzFn = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
    diffuseColor.a *= smoothstep(0.06, 0.28, abs(dot(kzFn, normalize(vViewPosition))));
  }
#endif`).replace(`#include <color_fragment>`,`#include <color_fragment>
  kzLeafTrans = diffuseColor.rgb * uLeafTrans;`).replace(`#include <normal_fragment_begin>`,le.normal_fragment_begin.replace(`normal *= faceDirection;`,``)).replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
`+St).replace(`#include <lights_fragment_end>`,xt)}function Ot(t,n,r=16777215,a=`bark`){let o={uLodFade:{value:n},...X},s=new i({color:r,map:t.map,normalMap:t.normalMap,normalScale:new e(1,1),roughness:.92,metalness:0,vertexColors:!0});return s.userData.shaderKey=`tree-`+a,s.userData.onBeforeCompile=e=>{Object.assign(e.uniforms,o),Tt(e),Et(e),e.fragmentShader=e.fragmentShader.replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
`+wt).replace(`#include <lights_fragment_end>`,Ct)},s.userData.depth=At(o,null,`bark`),s}function kt(t,n,r,a=`leaf`){let o={uLodFade:{value:n},...X},s=new i({color:16777215,map:t.map,normalMap:t.normalMap||null,normalScale:new e(1.6,1.6),roughness:.78,metalness:0,side:2,vertexColors:!0,alphaTest:.5});return s.alphaToCoverage=r>0,s.userData.shaderKey=`tree-`+a,s.userData.onBeforeCompile=e=>{Object.assign(e.uniforms,o),Tt(e),Et(e),Dt(e)},s.userData.depth=At(o,t.map,`leaf`),s}function At(e,t,n){let r=new C({map:t||null,alphaTest:t?.5:0,side:t?2:0});return r.onBeforeCompile=t=>{for(let e in V)e in t.uniforms||(t.uniforms[e]=V[e]);Object.assign(t.uniforms,e),Tt(t),Et(t)},r.customProgramCacheKey=()=>`kaze|tree-depth-`+n,r}var Z=O.shrine,jt={x:Z.stairDir.z,z:-Z.stairDir.x},Mt={maple:5.8,ginkgo:7,cedar:3.6,pine:5,bamboo:2.4},Nt={maple:[9,5,.6],ginkgo:[19,5,.58],cedar:[24,2.8,.6],pine:[10.5,3.2,.75],bamboo:[11,2.2,.7]},Pt=[[`ginkgo`,13,-19,1.2,`ginkgoCol0`],[`ginkgo`,11,-1,1.25,`ginkgoCol1`],[`ginkgo`,-1,15,1.3,`ginkgoCol2`],[`ginkgo`,-17,7,1.3,`ginkgoCol0`],[`maple`,20,20,1.3,null],[`maple`,28,10,1.25,null],[`maple`,10,32,1.2,null]],Ft={S1:[[`maple`,-37,100,1.7,`mapleHero`,110]],S4:[[`maple`,19,95,1.35,null,200]]},It=[[`pine`,30,-7.2,1.15,null,20],[`pine`,34.5,-8.4,1.25,null,140],[`pine`,38.8,-10.4,1.2,null,260],[`ginkgo`,37,16.5,1.3,null,30],[`ginkgo`,44,12.5,1.25,null,200]],Lt=[[31,7.3],[38,8],[52,8.5],[58,7],[50.9,26.6],[58.1,24.7]],Rt=[[44,-19],[42.5,-14],[46,-16.5]];function zt(e,t){let n=Z.stairDir;return{x:Z.stairsBase.x+n.x*e+n.z*t,z:Z.stairsBase.z+n.z*e-n.x*t}}function Bt(e,t,n,r,i,a){let o=i-n,s=a-r,c=o*o+s*s,l=c>0?R(((e-n)*o+(t-r)*s)/c,0,1):0;return{d:Math.hypot(e-n-o*l,t-r-s*l),t:l}}function Vt(){let e=N.size/4+1,t=new Float32Array(e*e).fill(1e3);return ne.forEach((n,r)=>{let i=P[r].width*.5;for(let r=0;r<n.length-1;r++){let a=n[r],o=n[r+1],s=Math.floor((Math.min(a.x,o.x)-14+N.half)/4),c=Math.ceil((Math.max(a.x,o.x)+14+N.half)/4),l=Math.floor((Math.min(a.z,o.z)-14+N.half)/4),u=Math.ceil((Math.max(a.z,o.z)+14+N.half)/4);for(let n=Math.max(0,l);n<=Math.min(e-1,u);n++)for(let r=Math.max(0,s);r<=Math.min(e-1,c);r++){let s=Bt(r*4-N.half,n*4-N.half,a.x,a.z,o.x,o.z).d-i,c=n*e+r;s<t[c]&&(t[c]=s)}}}),(n,r)=>{let i=R((n+N.half)/4,0,e-1.001),a=R((r+N.half)/4,0,e-1.001),o=Math.floor(i),s=Math.floor(a),c=i-o,l=a-s,u=t[s*e+o]+(t[s*e+o+1]-t[s*e+o])*c;return u+(t[(s+1)*e+o]+(t[(s+1)*e+o+1]-t[(s+1)*e+o])*c-u)*l}}function Ht(e,t){let n=me[e];if(!n)return null;let{pos:r,target:i}=n.pose(t);return Ut(r,i)}function Ut(e,t){let n=t[0]-e[0],r=t[2]-e[2],i=Math.hypot(n,r)||1;return n/=i,r/=i,{x:e[0],y:e[1],z:e[2],fx:n,fz:r,rx:-r,rz:n}}function Wt(e,t,n){let r=n*Math.tan(t*Math.PI/180);return{x:e.x+e.fx*n+e.rx*r,z:e.z+e.fz*n+e.rz*r}}function Gt(e,t,n){let r=t-e.x,i=n-e.z;return{along:r*e.fx+i*e.fz,lat:r*e.rx+i*e.rz}}function Kt(e,{seed:t=1234,density:n=1}={}){let r=j(t*3+17),i=j(t*5+29),a=new te(t+101),o=Vt(),s=[],c=[],l={S1:Ht(`S1_field`,e),S3:Ht(`S3_standoff`,e),S4:Ht(`S4_title`,e),S5:Ht(`S5_ginkgo`,e)},u=e.heightAt(Z.x,Z.z),d=[];if(l.S1){let e=l.S1;for(let t of[{x:Z.x,z:Z.z},{x:Z.stairsTop.x,z:Z.stairsTop.z}]){let n=u+6.5,r=t.x-e.x,i=n-e.y,a=t.z-e.z,o=Math.hypot(r,i,a),s=(o+90)/o;d.push({ax:e.x,ay:e.y,az:e.z,bx:e.x+r*s,by:e.y+i*s,bz:e.z+a*s,tBehind:o/(o+90)})}}let f=(e,t,n,r,i)=>{if(!d.length)return!1;let[a,o,s]=Nt[e]||Nt.maple,c=t,l=r+a*s*i,u=n,f=o*i+1.5;for(let e of d){let t=e.bx-e.ax,n=e.by-e.ay,s=e.bz-e.az,d=R(((c-e.ax)*t+(l-e.ay)*n+(u-e.az)*s)/(t*t+n*n+s*s),0,1),p=e.ax+t*d,m=e.ay+n*d,h=e.az+s*d,g=d>e.tBehind?f+4:f;if(Math.hypot(c-p,l-m,u-h)<g)return!0;let _=r+a*i;if(Math.hypot(c-p,Math.max(0,m-_),u-h)<o*i*.6&&_>m)return!0}return!1},p=(e,t)=>{let n=1,r=l.S1;if(r){let{along:i,lat:a}=Gt(r,e,t);if(Math.hypot(e-r.x,t-r.z)<14)return 0;let o=Math.abs(a)-i*.84;if(i>0&&i<150&&o<4)return 0;i>=150&&i<330&&o<0&&(n=Math.min(n,.35))}let i=l.S3;if(i){let{along:n,lat:r}=Gt(i,e,t);if(Math.hypot(e-i.x,t-i.z)<12||n>0&&n<420&&Math.abs(r)<n*.66+5)return 0}let a=l.S5;if(a){let{along:n,lat:r}=Gt(a,e,t);if(Math.hypot(e-a.x,t-a.z)<12||n>0&&n<34&&Math.abs(r)<10+n*.4)return 0}return n},m=new Map,h=(e,t)=>e*100003+t,g=(e,t,n)=>{let r=Math.floor((e-n)/8),i=Math.floor((e+n)/8),a=Math.floor((t-n)/8),o=Math.floor((t+n)/8);for(let s=r;s<=i;s++)for(let r=a;r<=o;r++){let i=m.get(h(s,r));if(i){for(let r of i)if(Math.hypot(r.x-e,r.z-t)<Math.max(n,r.r))return!1}}return!0},_=(e,t,n)=>{let r=h(Math.floor(e/8),Math.floor(t/8)),i=m.get(r);i||m.set(r,i=[]),i.push({x:e,z:t,r:n})},v=(t,n,r)=>Math.min(e.heightAt(t,n),e.heightAt(t+r,n),e.heightAt(t-r,n),e.heightAt(t,n+r),e.heightAt(t,n-r)),y=(e,t)=>Bt(e,t,Z.stairsBase.x,Z.stairsBase.z,Z.stairsTop.x,Z.stairsTop.z),b=(e,t)=>Math.hypot(e-O.camp.x,t-O.camp.z),x=(e,t,n,a,o={})=>{let c={species:e,x:t,z:n,y:v(t,n,.6*a),scale:a,rot:(o.hero?i:r)()*Math.PI*2,hero:!!o.hero,variant:o.variant||null};return s.push(c),_(t,n,o.space??(Mt[e]||4)*a),c},S=(t,n,r,i,{stair:a=6.2,camp:s=45,path:c=3.5,sight:l=!0}={})=>{let u=e.heightAt(n,r);return!!(u<.8||o(n,r)<c||y(n,r).d<a||Math.hypot(n-Z.x,r-Z.z)<16.5||b(n,r)<s||l&&f(t,n,r,u,i))},C=(e,t,n,r,i,a={})=>{let{x:o,z:s}=t;for(let t=0;t<10;t++){if(!S(e,o,s,n,{stair:a.stair??5,camp:45,path:4,sight:a.sight??!0}))return x(e,o,s,n,{hero:!0,variant:r,space:(Mt[e]||4)*n*1.2});o+=i.x*3,s+=i.z*3}return null},T=(e,t)=>({x:Z.stairsBase.x+(Z.stairsTop.x-Z.stairsBase.x)*e+jt.x*t,z:Z.stairsBase.z+(Z.stairsTop.z-Z.stairsBase.z)*e+jt.z*t}),E={x:-jt.x,z:-jt.z},k=Math.hypot(Z.stairsTop.x-Z.stairsBase.x,Z.stairsTop.z-Z.stairsBase.z),A=(e,t)=>T(e/k,t);C(`maple`,T(.97,13),1.45,`mapleHero`,jt,{stair:8});let re=[`ginkgo`,`maple`,`maple`,`ginkgo`,`maple`,`maple`,`ginkgo`,`maple`,`maple`,`maple`],M=[`cedar`,`maple`,`pine`,`cedar`,`maple`,`pine`,`pine`,`maple`,`pine`,`maple`];for(let e=0;e<re.length;e++){let t=3+e*6.8+i()*2;C(re[e],A(t,6.6+i()*2.2),1+i()*.3,null,jt,{stair:5.5}),C(M[e],A(t+3.2,-(6.6+i()*2.2)),.95+i()*.3,null,E,{stair:5.5})}for(let[e,t,n,r]of[[`ginkgo`,48,11,1.2],[`ginkgo`,56,9.5,1.25],[`maple`,61,12,1.3],[`maple`,52,8.5,1.2],[`maple`,58,7,1.15],[`pine`,40,-10.5,1.2],[`pine`,42.5,-14,1.25],[`pine`,46,-16.5,1.2],[`cedar`,44,-19,1]])C(e,A(t,n),r,null,n>0?jt:E,{stair:5.5,sight:!1});if(l.S1){let e=l.S1,t={x:-e.rx,z:-e.rz},n={x:e.rx,z:e.rz};for(let[r,i,a,o]of[[`maple`,-36,58,1.5],[`maple`,-23,175,1.4],[`maple`,-19,192,1.25],[`maple`,-27,210,1.2],[`pine`,-31,228,1.1],[`maple`,22,150,1.4],[`maple`,29,225,1.25],[`maple`,12,310,1.35]])C(r,Wt(e,i,a),o,null,i<0?t:n)}{let t=[175,e.heightAt(175,100)+9,100],{target:n}=de(t,249,-4),r=Ut(t,n),i={x:-r.rx,z:-r.rz};for(let[e,t,n,a]of[[`maple`,-21,26,1.55],[`maple`,-8,46,1.3]])C(e,Wt(r,t,n),a,null,i)}{let e=O.camp.yard;for(let[t,n,r,i,a]of Pt){let s=ae(n,r);if(w(s.x,s.z,oe)||Math.hypot(s.x-e.x,s.z-e.z)<6||o(s.x,s.z)<2.5){console.warn(`[trees] S5 hero ${a||t} at camp (${n}, ${r}) dropped: inside a camp clearing, the yard or a path`);continue}x(t,s.x,s.z,i,{hero:!0,variant:a,space:(Mt[t]||4)*i})}}let P=15/Math.sqrt(n);for(let t=-N.half+P/2;t<N.half;t+=P)for(let n=-N.half+P/2;n<N.half;n+=P){let i=n+(r()-.5)*P,o=t+(r()-.5)*P,s=e.surfaceAt(i,o),c=s.forest;if(c<.1||s.rock>.6)continue;let l=.5+.5*a.noise(i*.011+5.3,o*.011-2.7),u=Yt(i,o),d=D(.1,.6,c)*(.2+.8*D(.25,.7,l))*(u?.42:1);if(r()>d)continue;let f=e.heightAt(i,o),m=Math.hypot(i-Z.x,o-Z.z),h=Zt(i,o,f,m,a,r),_=1+Math.floor(r()**1.7*(u?2.5:1.5+6.5*c)),v=2.5+_*(h===`cedar`?1.2:1.9);for(let t=0;t<_;t++){let n=r()<.82?h:Zt(i+30,o-20,f,m,a,r),s=r()*Math.PI*2,c=t===0?r()*1.5:v*Math.sqrt(r()),l=i+Math.cos(s)*c,d=o+Math.sin(s)*c,_=e.surfaceAt(l,d);if(_.forest<.06||_.rock>.6)continue;let y=(n===`maple`||n===`ginkgo`?1+r()*.42:.8+r()*.35)*(t===0?1.08:1);if(u&&n===`ginkgo`&&(y=1.25+r()*.35),S(n,l,d,y))continue;let b=p(l,d);if(b<1&&r()>=b)continue;let C=(Mt[n]||4)*y*(.8+.3*r())*(u?1.35:1);if(!g(l,d,C))continue;let w=ee(Math.round(l*7),Math.round(d*7)),T=u&&n===`ginkgo`&&w<.5?`ginkgoCol`+Math.floor(w*6):null;x(n,l,d,y,{space:C,variant:T})}}let F=O.field;for(let e=F.z-F.r;e<F.z+F.r;e+=26)for(let t=F.x-F.r;t<F.x+F.r;t+=26){let n=t+(r()-.5)*22,i=e+(r()-.5)*22,o=Math.hypot(n-F.x,i-F.z);if(o>F.r)continue;let s=D(F.r*.45,F.r*.9,o),c=a.noise(n*.012+3.3,i*.012-1.1);if(r()>(.05+.22*s)*(.7+.6*c))continue;let l=r()<.8?`maple`:`pine`,u=l===`maple`?1.15+r()*.35:.95+r()*.25;S(l,n,i,u,{stair:12,path:7})||p(n,i)<1||g(n,i,10)&&x(l,n,i,u,{space:10})}let ie=ne[3];for(let e=0;e<ie.length-1;e++){let t=ie[e],n=ie[e+1];if(t.z>-205||t.z<-345)continue;let i=n.x-t.x,a=n.z-t.z,s=Math.hypot(i,a),c=-a/s,l=i/s;for(let e=0;e<s;e+=4.2)for(let n of[-1,1])for(let u=0;u<3;u++){let d=4.2+u*4.5+r()*2.5,f=t.x+i/s*e+c*d*n+(r()-.5)*2,p=t.z+a/s*e+l*d*n+(r()-.5)*2;o(f,p)<2.6||!g(f,p,2.2)||x(`bamboo`,f,p,.85+r()*.35,{space:2.4})}}let I=5.5;for(let t=-N.half+I/2;t<N.half;t+=I)for(let n=-N.half+I/2;n<N.half;n+=I){let i=n+(r()-.5)*I,a=t+(r()-.5)*I,s=e.surfaceAt(i,a),l=D(.03,.2,s.forest)*(1-D(.5,.85,s.forest))*.28+D(.6,.95,s.forest)*.05;r()>l||e.heightAt(i,a)<.8||s.rock>.5||o(i,a)<1.8||y(i,a).d<3.4||p(i,a)<1||b(i,a)<40||Math.hypot(i-Z.x,a-Z.z)<15||c.push({species:`shrub`,x:i,z:a,y:e.heightAt(i,a),scale:.75+r()*.6,rot:r()*6.283,hero:!1,variant:null,tone:Xt(r)})}for(let t=.03;t<.97;t+=.06)for(let n of[1,-1]){let i=T(t+r()*.02,n*(Z.stairHalf+1.4+r()*1.4));c.push({species:`shrub`,x:i.x,z:i.z,y:e.heightAt(i.x,i.z),scale:.65+r()*.3,rot:r()*6.283,hero:!0,variant:null,tone:r()<.2?`red`:`dark`})}if(l.S3){let t=l.S3;for(let n=0;n<9;n++){let n=Wt(t,7+r()*17,25+r()*10);o(n.x,n.z)<2||c.push({species:`shrub`,x:n.x,z:n.z,y:e.heightAt(n.x,n.z),scale:1.5+r()*.7,rot:r()*6.283,hero:!0,variant:null,tone:r()<.8?`red`:`yellow`})}}let L=[];for(let[e,t,n,r,i,a]of It){let o=zt(t,n);if(S(e,o.x,o.z,r,{stair:Z.stairHalf+1.6,camp:45,path:3,sight:!1})){console.warn(`[trees] S2 hero ${e} at stair (${t}, ${n}) dropped: on the stairs, the summit or a path`);continue}L.push({species:e,x:o.x,z:o.z,y:v(o.x,o.z,.6*r),scale:r,rot:a*Math.PI/180,hero:!0,variant:i,tag:`S2`})}for(let[e,t]of Object.entries(Ft)){let n=l[e];if(n)for(let[r,i,a,o,s,c]of t){let t=Wt(n,i,a);if(S(r,t.x,t.z,o,{stair:5,camp:45,path:4})){console.warn(`[trees] ${e} framing ${r} at ${i}° / ${a} m dropped: in the water, on a path, the stairs, the summit, the camp or an S1 sight line`);continue}L.push({species:r,x:t.x,z:t.z,y:v(t.x,t.z,.6*o),scale:o,rot:c*Math.PI/180,hero:!0,variant:s,tag:e})}}let se=(e,t)=>L.every(n=>Math.hypot(e.x-n.x,e.z-n.z)>(Mt[n.species]||4)*n.scale*.5+t),z=Lt.concat(Rt).map(([e,t])=>zt(e,t)),ce=l.S1?qt(l.S1):()=>!1,le=e=>{let t=l.S4;if(!t)return!1;let{along:n,lat:r}=Gt(t,e.x,e.z),i=Math.atan2(r,n)*180/Math.PI;return n>0&&n<120&&i>-24&&i<-2},B=s.filter(e=>se(e,0)&&z.every(t=>Math.hypot(e.x-t.x,e.z-t.z)>1.5)&&(e.hero||!ce(e)&&!le(e))).concat(L),V=c.filter(e=>e.hero||se(e,-1));for(let e of V){let t=e.x-Z.stairsBase.x,n=e.z-Z.stairsBase.z,r=t*Z.stairDir.x+n*Z.stairDir.z,i=t*Z.stairDir.z-n*Z.stairDir.x;!e.hero&&r>-6&&r<k+6&&Math.abs(i)<22&&(e.tone=`dark`)}return{trees:B,shrubs:V,frames:l}}function qt(e){let t=me.S1_field,n=t.sky||{},r=fe(pe(t.hours),n.sunLift||0),i=.0082*(n.sunSize||1)+.6*Math.PI/180;return t=>{let[n,a,o]=Nt[t.species]||Nt.maple,s=t.x-e.x,c=t.y+n*o*t.scale-e.y,l=t.z-e.z,u=Math.hypot(s,c,l);return Math.acos(R((s*r.x+c*r.y+l*r.z)/u,-1,1))-Math.atan2(a*1.2*t.scale,u)<i}}var Jt={x:335,z:-85,r:150};function Yt(e,t){return Math.hypot(e-Jt.x,t-Jt.z)<Jt.r}function Xt(e){let t=e();return t<.36?`red`:t<.8?`green`:`yellow`}function Zt(e,t,n,r,i,a){let o=Math.hypot(e-O.ginkgo.x,t-O.ginkgo.z),s=Math.hypot(e-O.camp.x,t-O.camp.z),c=i.noise(e*.0042+7.1,t*.0042+2.2),l;l=o<O.ginkgo.r*1.6||s<150?{ginkgo:.62,maple:.36,pine:.02}:r<Z.footRadius+18?{maple:.56,cedar:.08,ginkgo:.1,pine:.26}:e<-440?{pine:.6,maple:.38,cedar:.02}:n>130?{maple:.55,pine:.35,cedar:.1}:{maple:.74+.14*c,ginkgo:.06,pine:.16,cedar:.03};let u=0;for(let e in l)u+=Math.max(0,l[e]);let d=a()*u;for(let e in l)if(d-=Math.max(0,l[e]),d<=0)return e;return`maple`}function Qt(e,t,n=512){let r=new Float32Array(n*n*3),i=N.size/n;for(let a of e){let e=t(a);if(!e)continue;let o=a.species===`maple`?0:a.species===`ginkgo`?1:-1,s=Math.max(3,e.radius*a.scale*(Yt(a.x,a.z)?1.2:.95)),c=(a.x+N.half)/i,l=(a.z+N.half)/i,u=s/i,d=u*2.2;for(let e=Math.max(0,Math.floor(l-d));e<=Math.min(n-1,Math.ceil(l+d));e++)for(let t=Math.max(0,Math.floor(c-d));t<=Math.min(n-1,Math.ceil(c+d));t++){let i=Math.hypot(t+.5-c,e+.5-l)/u,a=(e*n+t)*3;o>=0&&(r[a+o]=Math.max(r[a+o],1-D(.6,1.4,i))),r[a+2]=Math.max(r[a+2],1-D(.8,2.2,i))}}let a=O.camp.house,o=O.camp.view,s=Math.hypot(Z.stairsTop.x-Z.stairsBase.x,Z.stairsTop.z-Z.stairsBase.z),c=o.x-a.x,l=o.z-a.z,u=c*c+l*l;for(let e=0;e<n;e++)for(let t=0;t<n;t++){let o=-N.half+(t+.5)*i,d=-N.half+(e+.5)*i,f=.72*(1-D(Jt.r*.55,Jt.r*1.05,Math.hypot(o-Jt.x,d-Jt.z))),p=(e*n+t)*3;f>r[p+1]&&(r[p+1]=f);let m=R(((o-a.x)*c+(d-a.z)*l)/u,0,1.2),h=.5+.5*D(16,34,Math.hypot(o-a.x-c*m,d-a.z-l*m));r[p]*=h,r[p+1]*=h;let g=o-Z.stairsBase.x,_=d-Z.stairsBase.z,v=g*Z.stairDir.x+_*Z.stairDir.z,y=Math.abs(g*Z.stairDir.z-_*Z.stairDir.x);if(v>-10&&v<s+8&&y<26){let e=(1-D(12,26,y))*D(-10,0,v)*(1-D(s,s+8,v));r[p]*=1-.7*e,r[p+1]*=1-.7*e}}let d=new Uint8Array(n*n*4);for(let e=0;e<n*n;e++)d[e*4]=Math.round(R(r[e*3],0,1)*255),d[e*4+1]=Math.round(R(r[e*3+1],0,1)*255),d[e*4+2]=Math.round(R(r[e*3+2],0,1)*255),d[e*4+3]=255;return{data:d,res:n}}var $t=32,en=new o,tn=new E,nn=class{constructor({variants:e,records:t,lod:n,sunDir:r}){this.variants=e,this.lod=n,this.sunDir=r,this.group=new y,this.group.name=`forest`;let i=t.length;this.n=i,this.x=new Float32Array(i),this.y=new Float32Array(i),this.z=new Float32Array(i),this.s=new Float32Array(i),this.vi=new Uint16Array(i),this.mat=new Float32Array(i*16);let a=new x,o=new m,s=new E,l=new E,u=Array(e.length).fill(0);this.cells=new Map,t.forEach((e,t)=>{this.x[t]=e.x,this.y[t]=e.y,this.z[t]=e.z,this.s[t]=e.scale,this.vi[t]=e.vi,u[e.vi]++,o.setFromAxisAngle(tn.set(0,1,0),e.rot),a.compose(l.set(e.x,e.y,e.z),o,s.set(e.scale,e.scale,e.scale)),a.toArray(this.mat,t*16);let n=this._cellKey(Math.floor(e.x/$t),Math.floor(e.z/$t)),r=this.cells.get(n);r||this.cells.set(n,r=[]),r.push(t)});for(let[e,t]of this.cells)this.cells.set(e,Int32Array.from(t));this.meshes=e.map((e,t)=>{let n=[];for(let r=0;r<2;r++){let i=Math.max(1,Math.min(u[t],r===0?700:5e3)),a=r===0?e.lod0:e.lod1,o=new ie(a.bark,e.mats.bark[r],i),s=new ie(a.leaves,e.mats.leaves[r],i);s.instanceMatrix=o.instanceMatrix;for(let t of[o,s])t.count=0,t.frustumCulled=!1,t.castShadow=e.castShadow!==!1,t.receiveShadow=!0,t.name=`tree-${e.key}-lod${r}`,this.group.add(t);o.customDepthMaterial=e.mats.bark[r].userData.depth,s.customDepthMaterial=e.mats.leaves[r].userData.depth,o.instanceMatrix.setUsage(c),n.push({bark:o,leaves:s,cap:i,count:0})}return n}),this._lastPos=new E(1e9,0,0),this._lastFwd=new E,this._fwd=new E,this._frustum=new v,this._pm=new x,this.stats={lod0:0,lod1:0}}_cellKey(e,t){return(e+512)*4096+(t+512)}_visible(e,t,n){let r=this.s[e],i=t.height*r,a=Math.max(t.radius*r,i*.5)+6;if(en.center.set(this.x[e],this.y[e]+i*.5,this.z[e]),en.radius=a,this._frustum.intersectsSphere(en))return!0;if(!n)return!1;let o=this.sunDir,s=Math.max(.06,o.y),c=Math.min(130,i/s*Math.hypot(o.x,o.z)),l=Math.hypot(o.x,o.z)||1;for(let t of[.5,1])if(en.center.set(this.x[e]-o.x/l*c*t,this.y[e]+i*.25,this.z[e]-o.z/l*c*t),this._frustum.intersectsSphere(en))return!0;return!1}update(e,t=!1){let n=e.position;if(e.getWorldDirection(this._fwd),!t&&n.distanceToSquared(this._lastPos)<6.25&&this._fwd.dot(this._lastFwd)>.9986)return!1;this._lastPos.copy(n),this._lastFwd.copy(this._fwd),this._pm.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(this._pm,re,e.reversedDepth);for(let e of this.meshes)for(let t of e)t.count=0;let r=3.5,i=this.lod.tree,a=this.lod.shrub,o=Math.max(i.lod1,a.lod1)+i.band+r+8,s=Math.floor((n.x-o)/$t),c=Math.floor((n.x+o)/$t),l=Math.floor((n.z-o)/$t),u=Math.floor((n.z+o)/$t),d=this.x,f=this.z,p=this.vi,m=this.mat;for(let e=s;e<=c;e++)for(let t=l;t<=u;t++){let o=this.cells.get(this._cellKey(e,t));if(o)for(let e=0;e<o.length;e++){let t=o[e],s=d[t]-n.x,c=f[t]-n.z,l=Math.sqrt(s*s+c*c),u=this.variants[p[t]],h=u.cls===`shrub`?a:i;if(l>h.lod1+h.band+r)continue;let g=this.meshes[p[t]];if(l<h.lod0+h.band*.5+r&&(l<25||this._visible(t,u,!0))){let e=g[0];e.count<e.cap&&(e.bark.instanceMatrix.array.set(m.subarray(t*16,t*16+16),e.count*16),e.count++)}if(l>h.lod0-h.band*.5-r&&this._visible(t,u,!0)){let e=g[1];e.count<e.cap&&(e.bark.instanceMatrix.array.set(m.subarray(t*16,t*16+16),e.count*16),e.count++)}}}let h=0,g=0;for(let e of this.meshes)e.forEach((e,t)=>{e.bark.count=e.leaves.count=e.count,e.count&&(e.bark.instanceMatrix.clearUpdateRanges(),e.bark.instanceMatrix.addUpdateRange(0,e.count*16),e.bark.instanceMatrix.needsUpdate=!0),t===0?h+=e.count:g+=e.count});return this.stats.lod0=h,this.stats.lod1=g,!0}},rn=8,an=4,Q=256,$=512;function on(e,r,i,a){let o=new F(rn*Q,an*$,{type:s,format:n,generateMipmaps:!0,minFilter:T,magFilter:se,depthBuffer:!0,stencilBuffer:!1});o.texture.colorSpace=p,o.texture.anisotropy=4;let c=new t,l=new A(-1,1,1,-1,1,600);l.position.set(0,0,300),l.lookAt(0,0,0);let u=e.getRenderTarget(),d=e.autoClear,m=e.getClearColor(new f),h=e.getClearAlpha();e.setClearColor(4862754,0),o.scissorTest=!1,o.viewport.set(0,0,rn*Q,an*$),e.setRenderTarget(o),e.clear(!0,!0,!1),e.autoClear=!1;let g=new ce({map:a,vertexColors:!0,alphaTest:.5,side:2}),_={},v=[];r.forEach((t,n)=>{if(n>=32)return;let r=n%rn,a=Math.floor(n/rn),s=t.radius*2+.6,u=t.box.max.y+.5,d=-.35,f=Math.max(u-d,s*$/Q),p=f*Q/$;l.left=-p/2,l.right=p/2,l.bottom=d,l.top=d+f,l.updateProjectionMatrix(),_[t.kind]||(_[t.kind]=new ce({map:i[t.kind].map,vertexColors:!0,color:t.barkTint}));let m=new z(t.lod0.bark,_[t.kind]),h=new z(t.lod0.leaves,g);c.add(m,h),o.viewport.set(r*Q,a*$,Q,$),o.scissor.set(r*Q,a*$,Q,$),o.scissorTest=!0,e.setRenderTarget(o),e.render(c,l),c.remove(m,h),v.push({u0:r/rn,u1:(r+1)/rn,v0:a/an,v1:(a+1)/an,w:p,h:f,y0:d})}),o.scissorTest=!1,o.viewport.set(0,0,rn*Q,an*$),e.setRenderTarget(u),e.autoClear=d,e.setClearColor(m,h),g.dispose();for(let e in _)_[e].dispose();return{texture:o.texture,cells:v,rt:o}}var sn=`
#include <kaze_wind>
attribute vec4 aImpPos;   // base xyz, scale
attribute vec4 aImpUV;    // atlas rect u0 v0 u1 v1
attribute vec4 aImpSize;  // card width, height, base offset, flip
attribute float aImpTint;
uniform vec3 uTreeCam;
uniform vec4 uLodFade;
varying vec2 vTreeFade;
`,cn=`
  vec3 kzC = aImpPos.xyz;
  float kzSc = aImpPos.w;
  vec3 kzTo = uTreeCam - kzC;
  kzTo.y = 0.0;
  float kzDist = length(kzTo);
  vec3 kzFwd = kzTo / max(kzDist, 1e-3);
  vec3 kzRight = vec3(kzFwd.z, 0.0, -kzFwd.x);
  vTreeFade = vec2(smoothstep(uLodFade.x, uLodFade.y, kzDist), 1.0 - smoothstep(uLodFade.z, uLodFade.w, kzDist));
  float kzAlive = step(0.0001, vTreeFade.x) * step(0.0001, vTreeFade.y);
  vec2 kzWind = kazeWindBend(kzC.xz);
  vec3 kzPos = kzC + kzRight * (position.x * aImpSize.x * kzSc) + vec3(0.0, (aImpSize.z + position.y * aImpSize.y) * kzSc, 0.0);
  kzPos.xz += kzWind * (position.y * position.y) * 0.35 * kzSc;
  // tilt the card back a little so it doesn't read as a vertical sheet from above
  kzPos -= kzFwd * position.y * aImpSize.y * kzSc * 0.12;
  kzPos = mix(kzC, kzPos, kzAlive);
  float kzU = aImpSize.w > 0.5 ? 1.0 - uv.x : uv.x;
  vMapUv = vec2(mix(aImpUV.x, aImpUV.z, kzU), mix(aImpUV.y, aImpUV.w, uv.y));
  vec3 objectNormal = normalize(kzFwd * 0.7 + kzRight * position.x * 1.1 + vec3(0.0, 0.25 + position.y * 0.45, 0.0));
#ifdef USE_COLOR
  vColor.rgb = vec3(aImpTint);
#endif
`;function ln(e,t,n,a,s){let c=e.length,l=new Float32Array(c*4),d=new Float32Array(c*4),f=new Float32Array(c*4),p=new Float32Array(c),m=0;for(let n of e){let e=t[n.variant];e&&(l.set([n.x,n.y,n.z,n.scale],m*4),d.set([e.u0,e.v0,e.u1,e.v1],m*4),f.set([e.w,e.h,e.y0,+!!n.flip],m*4),p[m]=n.tint,m++)}let h=new r;h.setAttribute(`position`,new u([-.5,0,0,.5,0,0,-.5,1,0,.5,1,0],3)),h.setAttribute(`uv`,new u([0,0,1,0,0,1,1,1],2)),h.setIndex([0,1,2,1,3,2]);let g=new M;g.index=h.index,g.setAttribute(`position`,h.getAttribute(`position`)),g.setAttribute(`uv`,h.getAttribute(`uv`)),g.setAttribute(`aImpPos`,new L(l.subarray(0,m*4),4)),g.setAttribute(`aImpUV`,new L(d.subarray(0,m*4),4)),g.setAttribute(`aImpSize`,new L(f.subarray(0,m*4),4)),g.setAttribute(`aImpTint`,new L(p.subarray(0,m),1)),g.instanceCount=m,g.boundingSphere=new o(new E,1e6);let _={uLodFade:{value:a},...X},v=new i({map:n,alphaTest:.5,roughness:.85,metalness:0,vertexColors:!0,side:2});v.alphaToCoverage=s>0,v.userData.shaderKey=`tree-impostor`,v.userData.onBeforeCompile=e=>{Object.assign(e.uniforms,_),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+sn).replace(`#include <beginnormal_vertex>`,cn).replace(`#include <begin_vertex>`,`vec3 transformed = kzPos;`).replace(`#include <color_vertex>`,`#include <color_vertex>`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec2 vTreeFade;
uniform vec3 uLeafTrans;
uniform float uLeafWrap;
uniform float uAtlasSize;
vec3 kzLeafTrans = vec3(0.0);
float kzIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
  { float kzN = kzIGN(gl_FragCoord.xy); if (kzN >= vTreeFade.y || kzN < 1.0 - vTreeFade.x) discard; }`).replace(`#include <map_fragment>`,`#include <map_fragment>
  {
    vec2 kzTs = vMapUv * uAtlasSize;
    float kzLod = max(0.0, 0.5 * log2(max(dot(dFdx(kzTs), dFdx(kzTs)), dot(dFdy(kzTs), dFdy(kzTs)))));
    diffuseColor.a *= 1.0 + kzLod * 0.3;
  }`).replace(`#include <color_fragment>`,`#include <color_fragment>
  kzLeafTrans = diffuseColor.rgb * uLeafTrans * 0.8;`).replace(`#include <normal_fragment_begin>`,le.normal_fragment_begin.replace(`normal *= faceDirection;`,``)).replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
#undef RE_Direct
void RE_Direct_Imp(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  float NoL = dot(geometryNormal, directLight.direction);
  float wrapNL = clamp((NoL + uLeafWrap) / (1.0 + uLeafWrap), 0.0, 1.0);
  reflectedLight.directDiffuse += wrapNL * directLight.color * BRDF_Lambert(material.diffuseContribution);
  float VoL = clamp(dot(-geometryViewDir, directLight.direction), 0.0, 1.0);
  reflectedLight.directDiffuse += directLight.color * kzLeafTrans * (0.35 * pow(VoL, 3.0) + 0.9 * pow(VoL, 14.0));
}
#define RE_Direct RE_Direct_Imp`)};let y=new z(g,v);return y.frustumCulled=!1,y.castShadow=!1,y.receiveShadow=!1,y.name=`tree-impostors`,y}var un=(()=>{let e=new r;return e.setAttribute(`position`,new u([-.5,-.5,0,.5,-.5,0,-.5,.5,0,.5,.5,0],3)),e.setAttribute(`uv`,new u([0,0,1,0,0,1,1,1],2)),e.setIndex([0,1,2,1,3,2]),e})();function dn(e,t){let n=j(t),r=new Float32Array(e*4);for(let t=0;t<e*4;t++)r[t]=n();let i=new M;return i.index=un.index,i.setAttribute(`position`,un.getAttribute(`position`)),i.setAttribute(`uv`,un.getAttribute(`uv`)),i.setAttribute(`aSeed`,new L(r,4)),i.instanceCount=e,i.boundingSphere=new o(new E,1e6),i}var fn=`
#include <kaze_wind>
#include <kaze_terrain>
attribute vec4 aSeed;
uniform vec3 uFallCenter;
uniform vec4 uFallBox;      // x half size, y height, z base density (open fields), w size scale
uniform vec2 uFallDrift;
uniform sampler2D uLitterMask;
uniform vec4 uCellMaple;    // u0, vBottom, u1, vTop
uniform vec4 uCellGinkgo;
varying float vFallFade;
vec3 kzRot(vec3 v, vec3 k, float a) {
  float c = cos(a), s = sin(a);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}
`,pn=`
  vec2 kzBoxS = vec2(uFallBox.x * 2.0);
  vec2 kzOrg = uFallCenter.xz - uFallBox.x;
  vec2 kzXZ = aSeed.xy * kzBoxS + uFallDrift * mix(0.7, 1.3, aSeed.z);
  kzXZ = kzOrg + mod(kzXZ - kzOrg, kzBoxS);
  float kzFall = mix(0.5, 1.05, aSeed.z);
  float kzY01 = fract(aSeed.w - uTime * kzFall / uFallBox.y);
  float kzAng = uTime * (1.1 + 1.9 * aSeed.z) + aSeed.w * 31.0;
  kzXZ += vec2(cos(kzAng), sin(kzAng)) * 0.45 + kazeWindBend(kzXZ) * 0.9 * kzY01;
  float kzGround = kazeTerrainHeightFast(kzXZ);
  float kzY = kzGround + 0.06 + kzY01 * uFallBox.y;
  vec4 kzLit = textureLod(uLitterMask, (kzXZ + KZ_HALF) / (2.0 * KZ_HALF), 0.0);
  // the leaves of the ambient wind are in or out as they always were; the extra ones a guide brings down (uGuideSoft
  // rises and falls over ~1 s) grow in and shrink away over a narrow band of the density, not on and off in mid-air
  float kzDens0 = max(kzLit.b, uFallBox.z);
  float kzDens = max(kzLit.b, uFallBox.z + uGuideSoft * 0.35);
  float kzH1 = fract(aSeed.x * 91.7 + aSeed.w * 13.1);
  float kzAlive = max(step(kzH1, kzDens0), smoothstep(kzH1, kzH1 + 0.08, kzDens));
  float kzEdge = 1.0 - smoothstep(uFallBox.x * 0.72, uFallBox.x, length(kzXZ - uFallCenter.xz));
  float kzEnds = smoothstep(0.0, 0.02, kzY01) * (1.0 - smoothstep(0.93, 1.0, kzY01));
  vec3 kzC = vec3(kzXZ.x, kzY, kzXZ.y);
  float kzCamD = distance(kzC, cameraPosition);
  float kzCam = smoothstep(0.5, 1.5, kzCamD);
  float kzSize = kzLensCap(mix(0.1, 0.17, fract(aSeed.y * 7.7)) * uFallBox.w, kzCamD) * kzAlive * kzEnds * kzCam * step(0.001, kzEdge);
  vFallFade = kzEdge;
  vec3 kzAxis = normalize(vec3(fract(aSeed.y * 3.7) - 0.5, 0.45, fract(aSeed.z * 5.3) - 0.5));
  float kzRa = uTime * (2.2 + 5.0 * fract(aSeed.y * 11.3)) + aSeed.z * 6.2831853;
  vec3 kzPos = kzC + kzRot(vec3(position.xy, 0.0), kzAxis, kzRa) * kzSize;
  vec3 objectNormal = kzRot(vec3(0.0, 0.0, 1.0), kzAxis, kzRa);
  float kzGinkgoP = kzLit.g / max(kzLit.r + kzLit.g, 0.001);
  bool kzIsG = fract(aSeed.w * 17.3) < (kzLit.r + kzLit.g > 0.02 ? kzGinkgoP : 0.25);
  vec4 kzRect = kzIsG ? uCellGinkgo : uCellMaple;
  vMapUv = vec2(mix(kzRect.x, kzRect.z, uv.x), mix(kzRect.y, kzRect.w, uv.y));
#ifdef USE_COLOR
  float kzT = fract(aSeed.z * 23.9);
  vColor.rgb = kzIsG ? vec3(1.0, 0.92 + 0.1 * kzT, 0.8) * (0.85 + 0.3 * kzT)
                 : mix(vec3(1.0, 0.8, 0.8), vec3(1.05, 1.5, 0.85), step(0.7, kzT)) * (0.75 + 0.35 * fract(kzT * 7.0));
#endif
`,mn=`
varying float vLeafNear;
varying float vLeafFar;
float kzTele() {
  return smoothstep(2.3, 2.9, projectionMatrix[1][1]);
}
float kzLensCap(float size, float dist) {
  float px = mix(120.0, 40.0, smoothstep(2.0, 12.0, dist));
  return min(size, px / 540.0 * dist / projectionMatrix[1][1]);
}
`,hn=`
  float kzLensD = distance(kzPos, cameraPosition);
  float kzLensL = max(1.0, projectionMatrix[1][1] / 2.15);
  vLeafNear = 1.0 - smoothstep(1.2 * kzLensL, 4.0 * kzLensL, kzLensD);
  vLeafFar = smoothstep(20.0, 50.0, kzLensD);`,gn=`
  float kzEdgeW = 0.03 + 0.35 * vLeafNear + 0.2 * vLeafFar;
  diffuseColor.a = smoothstep(0.5 - kzEdgeW, 0.5 + kzEdgeW, diffuseColor.a) * (1.0 - 0.45 * vLeafNear - 0.25 * vLeafFar);
#ifdef ALPHA_TO_COVERAGE
  if (diffuseColor.a < 0.02) discard;
#else
  if (diffuseColor.a < 0.5) discard;
#endif
`;function _n({count:e,seed:t,atlas:n,msaa:r,uniforms:a,vertPars:o,vert:s,key:c,name:l}){let u=new i({map:n,alphaTest:.5,side:2,roughness:.7,metalness:0,vertexColors:!0});u.alphaToCoverage=r>0,u.userData.shaderKey=c,u.userData.onBeforeCompile=e=>{Object.assign(e.uniforms,a),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+mn+o).replace(`#include <beginnormal_vertex>`,s).replace(`#include <begin_vertex>`,`vec3 transformed = kzPos;`+hn),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 uLeafTrans;
uniform float uLeafWrap;
varying float vLeafNear;
varying float vLeafFar;
vec3 kzLeafTrans = vec3(0.0);`).replace(`#include <color_fragment>`,`#include <color_fragment>
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114))), 0.35 * vLeafFar);
  kzLeafTrans = diffuseColor.rgb * uLeafTrans * 1.2;`).replace(`#include <alphatest_fragment>`,gn).replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
#undef RE_Direct
void RE_Direct_Fall(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  float NoL = abs(dot(geometryNormal, directLight.direction));
  reflectedLight.directDiffuse += (0.35 + 0.65 * NoL) * directLight.color * BRDF_Lambert(material.diffuseContribution);
  float VoL = clamp(dot(-geometryViewDir, directLight.direction), 0.0, 1.0);
  reflectedLight.directDiffuse += directLight.color * kzLeafTrans * (0.4 * pow(VoL, 3.0) + 1.0 * pow(VoL, 12.0));
}
#define RE_Direct RE_Direct_Fall`)};let d=new z(dn(e,t),u);return d.frustumCulled=!1,d.castShadow=!1,d.receiveShadow=!0,d.name=l,d}var vn=e=>new I(e.u0,e.vBottom,e.u1,e.vTop),yn=class{constructor({count:t,atlas:n,litterMask:r,cellMaple:i,cellGinkgo:a,msaa:o}){this.uniforms={uFallCenter:{value:new E},uFallBox:{value:new I(34,16,.18,1)},uFallDrift:{value:new e},uLitterMask:{value:r},uCellMaple:{value:vn(i)},uCellGinkgo:{value:vn(a)},...X},this.mesh=_n({count:t,seed:913,atlas:n,msaa:o,uniforms:this.uniforms,vertPars:fn,vert:pn,key:`tree-fall`,name:`falling-leaves`}),this._d=new e}reset(){this.uniforms.uFallDrift.value.set(0,0)}update(e,t){let n=this.uniforms;n.uFallCenter.value.copy(t.position);let r=B.gust(t.position.x,t.position.z),i=B.uniforms.uGuide.value,a=.8+1.8*r+7.5*i;B.dir(this._d),n.uFallDrift.value.addScaledVector(this._d,a*e);let o=n.uFallBox.value.x*2*64;Math.abs(n.uFallDrift.value.x)>o&&(n.uFallDrift.value.x-=Math.sign(n.uFallDrift.value.x)*o),Math.abs(n.uFallDrift.value.y)>o&&(n.uFallDrift.value.y-=Math.sign(n.uFallDrift.value.y)*o)}},bn=`
#include <kaze_wind>
#include <kaze_terrain>
attribute vec4 aSeed;
uniform vec3 uSwarmCenter;
uniform vec4 uSwarmBox;     // x half size, y flight height, z share of the leaves aloft in a lull, w size scale
uniform vec2 uSwarmDrift;   // the stream's travel along the wind (m)
uniform sampler2D uLitterMask;
uniform vec4 uCellMaple;    // u0, vBottom, u1, vTop
uniform vec4 uCellGinkgo;
vec3 kzRot(vec3 v, vec3 k, float a) {
  float c = cos(a), s = sin(a);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}
`,xn=`
  vec2 kzBoxS = vec2(uSwarmBox.x * 2.0);
  vec2 kzOrg = uSwarmCenter.xz - uSwarmBox.x;
  // each leaf rides the stream at its own pace (the heavier ones lag behind the front)
  vec2 kzXZ = aSeed.xy * kzBoxS + uSwarmDrift * mix(0.8, 1.05, aSeed.z);
  kzXZ = kzOrg + mod(kzXZ - kzOrg, kzBoxS);
  float kzGn = smoothstep(0.26, 0.95, kazeGust(kzXZ));
  // loops and side-slips around the stream line, wider in a front
  float kzAng = uTime * (0.8 + 1.4 * aSeed.w) + aSeed.w * 31.0;
  kzXZ += vec2(cos(kzAng), sin(kzAng)) * (0.35 + 0.9 * kzGn);
  float kzGround = kazeTerrainHeightFast(kzXZ);
  // flight height: from just above the grass up to the box top; a front lifts them all
  float kzH = pow(fract(aSeed.w * 7.31 + aSeed.x * 3.7), 1.1);
  float kzY = kzGround + 0.8 + kzH * uSwarmBox.y * (0.7 + 0.3 * kzGn) + sin(uTime * (1.1 + aSeed.y * 1.3) + aSeed.z * 17.0) * (0.25 + 0.4 * kzGn);
  vec4 kzLit = textureLod(uLitterMask, (kzXZ + KZ_HALF) / (2.0 * KZ_HALF), 0.0);
  // more leaves aloft in a front: each one grows in (or dwindles away) over its own short band of the gust;
  // the stream crosses open ground (under the trees the falling leaves take over: litter B = tree nearby)
  float kzH1 = fract(aSeed.x * 91.7 + aSeed.w * 13.1);
  // (uGuideSoft, the guide envelope low-passed over ~1 s: the extra leaves of a guide join and leave gradually)
  float kzDens = (uSwarmBox.z + (1.0 - uSwarmBox.z) * kzGn + uGuideSoft * 0.3) * (1.0 - 0.9 * kzLit.b);
  float kzAlive = smoothstep(kzH1 - 0.06, kzH1 + 0.06, kzDens);
  float kzEdge = 1.0 - smoothstep(uSwarmBox.x * 0.7, uSwarmBox.x, length(kzXZ - uSwarmCenter.xz));
  vec3 kzC = vec3(kzXZ.x, kzY, kzXZ.y);
  float kzCamD = distance(kzC, cameraPosition);
  // a few cross just in front of the lens, large and out of focus
  float kzCam = smoothstep(0.7, 1.6, kzCamD);
  // red maple over the open fields, ginkgo where the ginkgo litter says so
  float kzGinkgoP = kzLit.g / max(kzLit.r + kzLit.g, 0.001);
  bool kzIsG = fract(aSeed.w * 17.3) < (kzLit.r + kzLit.g > 0.02 ? kzGinkgoP : 0.06);
  // leaf-sized within a few metres of the lens (no flat leaf fills the frame), drawn larger beyond it so the stream
  // reads against the sky: the red maple leaves torn off over the open fields 3x from ~12 m (20–40 px at 1080p
  // near the camera, a scatter of smaller ones far off); the ginkgo leaves of the valley grow less (the gold lies
  // on the ground, no big fans drifting over the roofs); little of it through a long lens (see kzTele)
  float kzGrow = (kzIsG ? 1.2 * smoothstep(6.0, 30.0, kzCamD) : 2.0 * smoothstep(3.0, 12.0, kzCamD)) * (1.0 - 0.7 * kzTele());
  float kzSize = kzLensCap(mix(0.13, 0.22, fract(aSeed.y * 7.7)) * (1.0 + kzGrow) * uSwarmBox.w, kzCamD) * kzAlive * kzEdge * kzCam;
  // tumbling, faster for the light ones
  vec3 kzAxis = normalize(vec3(fract(aSeed.y * 3.7) - 0.5, 0.35, fract(aSeed.z * 5.3) - 0.5));
  float kzRa = uTime * (2.6 + 5.5 * fract(aSeed.y * 11.3)) + aSeed.z * 6.2831853;
  vec3 kzPos = kzC + kzRot(vec3(position.xy, 0.0), kzAxis, kzRa) * kzSize;
  vec3 objectNormal = kzRot(vec3(0.0, 0.0, 1.0), kzAxis, kzRa);
  vec4 kzRect = kzIsG ? uCellGinkgo : uCellMaple;
  vMapUv = vec2(mix(kzRect.x, kzRect.z, uv.x), mix(kzRect.y, kzRect.w, uv.y));
#ifdef USE_COLOR
  float kzT = fract(aSeed.z * 23.9);
  vColor.rgb = kzIsG ? vec3(1.0, 0.92 + 0.1 * kzT, 0.8) * (0.85 + 0.3 * kzT)
                 : mix(vec3(1.0, 0.78, 0.78), vec3(1.05, 1.35, 0.85), step(0.82, kzT)) * (0.78 + 0.32 * fract(kzT * 7.0));
#endif
`,Sn=class{constructor({count:t,atlas:n,litterMask:r,cellMaple:i,cellGinkgo:a,msaa:o,box:s=[36,11,.35,1],seed:c=577,name:l=`leaf-swarm`}){this.uniforms={uSwarmCenter:{value:new E},uSwarmBox:{value:new I(...s)},uSwarmDrift:{value:new e},uLitterMask:{value:r},uCellMaple:{value:vn(i)},uCellGinkgo:{value:vn(a)},...X},this.mesh=_n({count:t,seed:c,atlas:n,msaa:o,uniforms:this.uniforms,vertPars:bn,vert:xn,key:`tree-swarm`,name:l}),this._d=new e}update(e,t){let n=this.uniforms;n.uSwarmCenter.value.copy(t.position),B.dir(this._d),n.uSwarmDrift.value.addScaledVector(this._d,(ue+6*B.uniforms.uGuide.value)*e);let r=n.uSwarmBox.value.x*2*512;Math.abs(n.uSwarmDrift.value.x)>r&&(n.uSwarmDrift.value.x-=Math.sign(n.uSwarmDrift.value.x)*r),Math.abs(n.uSwarmDrift.value.y)>r&&(n.uSwarmDrift.value.y-=Math.sign(n.uSwarmDrift.value.y)*r)}reset(){this.uniforms.uSwarmDrift.value.set(0,0)}},Cn=`
#include <kaze_common>
attribute vec4 aSeed;
uniform float uTime;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uMoteCenter;
uniform vec4 uMoteBox;    // x half size, y height, z intensity
uniform vec2 uMoteDrift;
varying vec3 vMote;
varying vec2 vQ;
void main() {
  vec2 box = vec2(uMoteBox.x * 2.0);
  vec2 org = uMoteCenter.xz - uMoteBox.x;
  vec2 xz = aSeed.xy * box + uMoteDrift * mix(0.35, 0.8, aSeed.z);
  xz = org + mod(xz - org, box);
  xz += vec2(sin(uTime * 0.37 + aSeed.w * 40.0), cos(uTime * 0.29 + aSeed.z * 33.0)) * 0.6;
  float y = uMoteCenter.y - 1.6 + fract(aSeed.w + uTime * 0.012 * (aSeed.x - 0.5)) * uMoteBox.y + sin(uTime * 0.6 + aSeed.y * 25.0) * 0.25;
  vec3 wp = vec3(xz.x, y, xz.y);
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float size = mix(0.008, 0.024, aSeed.z);
  mv.xy += position.xy * size;
  gl_Position = projectionMatrix * mv;
  vec3 V = normalize(wp - cameraPosition);
  float fwd = pow(max(dot(V, uSunDir), 0.0), 7.0);
  float d = length(mv.xyz);
  float fade = smoothstep(0.4, 1.6, d) * (1.0 - smoothstep(uMoteBox.x * 0.55, uMoteBox.x, d));
  float tw = 0.55 + 0.45 * sin(uTime * (1.5 + aSeed.x * 3.0) + aSeed.y * 50.0);
  vMote = uSunColor * (0.05 + 1.6 * fwd) * fade * tw * uMoteBox.z;
  vQ = position.xy;
}
`,wn=`
varying vec3 vMote;
varying vec2 vQ;
void main() {
  float r = length(vQ) * 2.0;
  float a = exp(-r * r * 5.0);
  gl_FragColor = vec4(vMote * a, 1.0);
}
`,Tn=class{constructor({count:t}){this.uniforms={uTime:V.uTime,uSunDir:V.uSunDir,uSunColor:V.uSunColor,uNoiseTex:V.uNoiseTex,uMoteCenter:{value:new E},uMoteBox:{value:new I(18,7,.06,0)},uMoteDrift:{value:new e}};let n=new k({vertexShader:Cn,fragmentShader:wn,uniforms:this.uniforms,transparent:!0,depthWrite:!1,blending:2});this.mesh=new z(dn(t,377),n),this.mesh.frustumCulled=!1,this.mesh.renderOrder=20,this.mesh.name=`sun-motes`,this._d=new e}update(e,t){this.uniforms.uMoteCenter.value.copy(t.position),B.dir(this._d),this.uniforms.uMoteDrift.value.addScaledVector(this._d,(.35+.6*B.uniforms.uWindStrength.value)*e)}reset(){this.uniforms.uMoteDrift.value.set(0,0)}},En=`
#include <kaze_common>
#include <kaze_terrain>
attribute vec2 aSeed;
uniform vec3 uLitCenter;
uniform vec4 uLitBox;       // x half patch, y fade start, z fade end, w size scale
uniform sampler2D uLitterMask;
uniform vec4 uCellLitMaple; // u0, vBottom, u1, vTop
uniform vec4 uCellLitGinkgo;
#include <kaze_lawn>
varying float vLitFade;
varying float vLitAO;
`,Dn=`
  vec2 kzBox = vec2(uLitBox.x * 2.0);
  vec2 kzOrg = uLitCenter.xz - uLitBox.x;
  vec2 kzXZ = kzOrg + mod(aSeed * kzBox - kzOrg, kzBox);
  vec2 kzCellId = floor(kzXZ * 61.0);
  float kzH = kazeHash12(kzCellId);
  float kzH2 = kazeHash12(kzCellId + 17.31);
  float kzH3 = kazeHash12(kzCellId + 41.7);
  vec4 kzLit = textureLod(uLitterMask, (kzXZ + KZ_HALF) / (2.0 * KZ_HALF), 0.0);
  float kzDens = max(kzLit.r, kzLit.g);
  // on a grazed lawn the fallen leaves lie thick over the whole turf, where the litter mask is kept thin
  float kzLawnL = kazeLawnAt(kzXZ);
  float kzAlive = step(kzH, mix(kzDens * 0.95, min(1.0, 0.75 + kzDens), kzLawnL));
  float kzDist = distance(kzXZ, uLitCenter.xz);
  vLitFade = 1.0 - smoothstep(uLitBox.y, uLitBox.z, kzDist);
  // leaves of every size, from small fresh ones to big curled ones (a little bigger on the lawn, over the turf)
  float kzS = mix(0.6, 1.45, kzH2) * (1.0 + 0.25 * kzLawnL) * uLitBox.w * kzAlive * step(0.001, vLitFade);
  // on a lawn the leaves rest on top of the turf instead of under it
  float kzY = kazeTerrainHeightFast(kzXZ) + 0.02 + kzLawnL * mix(0.05, 0.14, kzH3);
  float kzHx = kazeTerrainHeightFast(kzXZ + vec2(0.7, 0.0)) - kazeTerrainHeightFast(kzXZ - vec2(0.7, 0.0));
  float kzHz = kazeTerrainHeightFast(kzXZ + vec2(0.0, 0.7)) - kazeTerrainHeightFast(kzXZ - vec2(0.0, 0.7));
  vec3 kzN = normalize(vec3(-kzHx / 1.4, 1.0, -kzHz / 1.4) + vec3(kzH2 - 0.5, 0.0, kzH3 - 0.5) * 0.7);
  float kzA = kzH3 * 6.2831853;
  vec3 kzT0 = vec3(cos(kzA), 0.0, sin(kzA));
  vec3 kzT = normalize(kzT0 - kzN * dot(kzT0, kzN));
  vec3 kzB = cross(kzN, kzT);
  vec3 kzPos = vec3(kzXZ.x, kzY + 0.03 + kzH2 * 0.02, kzXZ.y) + (kzT * position.x + kzB * position.y) * kzS;
  vec3 objectNormal = kzN;
  vLitAO = mix(1.0, kazeTerrainLight(kzXZ).g, 0.6);
  bool kzIsG = kzH2 * (kzLit.r + kzLit.g) < kzLit.g;
  vec4 kzRect = kzIsG ? uCellLitGinkgo : uCellLitMaple;
  vMapUv = vec2(mix(kzRect.x, kzRect.z, uv.x), mix(kzRect.y, kzRect.w, uv.y));
#ifdef USE_COLOR
  // tones: golden fresh leaves, a share turned rust-brown, a few bleached pale
  float kzTone = kazeHash12(kzCellId + 63.1);
  vColor.rgb = vec3(0.7 + 0.4 * kzH3) * mix(vec3(1.0), vec3(0.82, 0.58, 0.4), step(0.7, kzTone));
  vColor.rgb *= mix(vec3(1.0), vec3(1.08, 1.06, 0.92), step(kzTone, 0.12));
#endif
`,On=class{constructor({atlas:e,litterMask:t,cellMaple:n,cellGinkgo:a,half:s=38,density:c=1.4,msaa:l}){let d=Math.round(Math.sqrt(c)*s*2),f=j(5151),p=new Float32Array(d*d*2),m=0;for(let e=0;e<d;e++)for(let t=0;t<d;t++)p[m++]=(t+f())/d,p[m++]=(e+f())/d;let h=new r;h.setAttribute(`position`,new u([-.5,-.5,0,.5,-.5,0,-.5,.5,0,.5,.5,0],3)),h.setAttribute(`uv`,new u([0,0,1,0,0,1,1,1],2)),h.setIndex([0,1,2,1,3,2]);let g=new M;g.index=h.index,g.setAttribute(`position`,h.getAttribute(`position`)),g.setAttribute(`uv`,h.getAttribute(`uv`)),g.setAttribute(`aSeed`,new L(p,2)),g.instanceCount=d*d,g.boundingSphere=new o(new E,1e6),this.uniforms={uLitCenter:{value:new E},uLitBox:{value:new I(s,s*.7,s*.95,1)},uLitterMask:{value:t},uCellLitMaple:{value:new I(n.u0,n.vBottom,n.u1,n.vTop)},uCellLitGinkgo:{value:new I(a.u0,a.vBottom,a.u1,a.vTop)}};let _=new i({map:e,alphaTest:.5,roughness:.82,metalness:0,vertexColors:!0});_.alphaToCoverage=l>0,_.userData.shaderKey=`tree-litter`;let v=this.uniforms;_.userData.onBeforeCompile=e=>{Object.assign(e.uniforms,v),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+En).replace(`#include <beginnormal_vertex>`,Dn).replace(`#include <begin_vertex>`,`vec3 transformed = kzPos;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying float vLitFade;
varying float vLitAO;
float kzIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
  if (kzIGN(gl_FragCoord.xy) >= vLitFade) discard;`).replace(`#include <color_fragment>`,`#include <color_fragment>
  diffuseColor.rgb *= vLitAO;`)},this.mesh=new z(g,_),this.mesh.frustumCulled=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!0,this.mesh.name=`leaf-litter`}update(e){this.uniforms.uLitCenter.value.copy(e.position)}},kn=2,An=`
#include <kaze_common>
#include <kaze_terrain>
uniform vec2 uCarpetOrigin;
uniform vec3 uCarpetCenter;
uniform vec2 uCarpetFade;
uniform sampler2D uLitterMask;
varying vec2 vCarpetXZ;
varying float vCarpetFade;
varying float vCarpetCov;
`,jn=`
  vec2 kzXZ = uCarpetOrigin + position.xz;
  float kzY = kazeTerrainHeight(kzXZ) + 0.035;
  float kzHl = kazeTerrainHeight(kzXZ - vec2(2.0, 0.0)), kzHr = kazeTerrainHeight(kzXZ + vec2(2.0, 0.0));
  float kzHd = kazeTerrainHeight(kzXZ - vec2(0.0, 2.0)), kzHu = kazeTerrainHeight(kzXZ + vec2(0.0, 2.0));
  vec3 objectNormal = normalize(vec3(kzHl - kzHr, 4.0, kzHd - kzHu));
  vCarpetXZ = kzXZ;
  vCarpetFade = 1.0 - smoothstep(uCarpetFade.x, uCarpetFade.y, distance(kzXZ, uCarpetCenter.xz));
  vec4 kzLitV = textureLod(uLitterMask, (kzXZ + KZ_HALF) / (2.0 * KZ_HALF), 0.0);
  vCarpetCov = max(kzLitV.r, kzLitV.g);
`,Mn=`
#include <kaze_common>
uniform sampler2D uLitterMask;
uniform sampler2D uTexMaple;
uniform sampler2D uTexGinkgo;
uniform float uCarpetHalf;
varying vec2 vCarpetXZ;
varying float vCarpetFade;
varying float vCarpetCov;
#include <kaze_lawn>
float kzIGN(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
`,Nn=`
  if (vCarpetCov < 0.02 || kzIGN(gl_FragCoord.xy) >= vCarpetFade) discard;
`,Pn=`
  {
    vec4 kzLit = texture(uLitterMask, (vCarpetXZ + uCarpetHalf) / (2.0 * uCarpetHalf));
    float kzDens = max(kzLit.r, kzLit.g);
    float kzN = kazeFbm(vCarpetXZ * 0.23 + vec2(0.31, 0.77));
    float kzCov = smoothstep(0.16, 0.55, kzDens + kzN * 0.25);
    // on a grazed lawn the leaves lie everywhere, thicker in drifts toward the trees, the turf showing through in a
    // few open stretches
    float kzLawnC = kazeLawnAt(vCarpetXZ);
    if (kzLawnC > 0.001) {
      float kzDrift = kazeFbm(vCarpetXZ * 0.16 + vec2(0.13, 0.57)) + kazeFbm(vCarpetXZ * 0.53 + vec2(0.71, 0.29)) * 0.3;
      kzDrift = smoothstep(-0.62, 0.02, kzDrift + (kzDens - 0.55) * 0.7);
      kzCov = mix(kzCov, max(kzCov, 0.62) * kzDrift, kzLawnC);
    }
    if (kzCov < 0.01) discard;
    float kzWG = kzLit.g / max(kzLit.r + kzLit.g, 1e-3);
    vec2 kzUV1 = vCarpetXZ * 0.42;
    vec2 kzUV2 = mat2(0.8, -0.6, 0.6, 0.8) * vCarpetXZ * 0.36 + vec2(0.37, 0.61);
    vec4 kzA1 = mix(texture(uTexMaple, kzUV1), texture(uTexGinkgo, kzUV1), kzWG);
    vec4 kzA2 = mix(texture(uTexMaple, kzUV2), texture(uTexGinkgo, kzUV2), kzWG);
    // mip-coverage compensation: keep the carpet dense in the distance
    vec2 kzTs = kzUV1 * 1024.0;
    float kzLod = max(0.0, 0.5 * log2(max(dot(dFdx(kzTs), dFdx(kzTs)), dot(dFdy(kzTs), dFdy(kzTs)))));
    float kzBoost = 1.0 + kzLod * 0.35;
    vec3 kzCol = kzA1.a > 0.45 ? kzA1.rgb : kzA2.rgb * 0.82;
    // older drifts brown and dull, fresh falls stay golden: tone patches at the scale of a few metres
    float kzAge = smoothstep(0.05, 0.55, kazeFbm(vCarpetXZ * 0.09 + vec2(0.47, 0.11)));
    kzCol = mix(kzCol, kzCol * vec3(0.78, 0.6, 0.46), kzAge * 0.55);
    diffuseColor.rgb = kzCol * (0.85 + 0.25 * kzN);
    // a drift thins out leaf by leaf (a noise of ~14 cm cells against the coverage) instead of ending on a smooth
    // outline cut through the leaves, which reads as a decal; far away the noise averages out to the plain coverage
    float kzRag = 0.15 + 0.7 * clamp(kazeFbm(vCarpetXZ * 1.8 + vec2(0.53, 0.19)) * 0.5 + 0.5, 0.0, 1.0);
    diffuseColor.a = clamp(max(kzA1.a, kzA2.a * 0.95) * kzBoost, 0.0, 1.0) * smoothstep(kzRag - 0.06, kzRag + 0.06, kzCov);
  }
`,Fn=`
  material.specularColor = vec3(0.0);
  material.specularColorBlended = vec3(0.0);
  material.specularF90 = 0.0;
`,In=class{constructor({litterMask:t,tiles:n,cells:a=112,fade:s=[70,106],msaa:c=0}){this.cells=a;let l=a+1,u=new Float32Array(l*l*3);for(let e=0;e<l;e++)for(let t=0;t<l;t++){let n=(e*l+t)*3;u[n]=t*kn,u[n+1]=0,u[n+2]=e*kn}let d=new Uint32Array(a*a*6),f=0;for(let e=0;e<a;e++)for(let t=0;t<a;t++){let n=e*l+t,r=n+1,i=n+l,a=i+1;d[f++]=n,d[f++]=i,d[f++]=r,d[f++]=i,d[f++]=a,d[f++]=r}let p=new r;p.setAttribute(`position`,new h(u,3)),p.setAttribute(`normal`,new h(new Float32Array(l*l*3),3)),p.setIndex(new h(d,1)),p.boundingSphere=new o(new E,1e6),this.uniforms={uCarpetOrigin:{value:new e},uCarpetCenter:{value:new E},uCarpetFade:{value:new e(s[0],s[1])},uCarpetHalf:{value:1024},uLitterMask:{value:t},uTexMaple:{value:n.maple},uTexGinkgo:{value:n.ginkgo}};let m=new i({color:16777215,roughness:.85,metalness:0,alphaTest:.5});m.alphaToCoverage=c>0,m.userData.shaderKey=`tree-carpet`;let g=this.uniforms;m.userData.onBeforeCompile=e=>{Object.assign(e.uniforms,g),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+An).replace(`#include <beginnormal_vertex>`,jn).replace(`#include <begin_vertex>`,`vec3 transformed = vec3(kzXZ.x, kzY, kzXZ.y);`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+Mn).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
`+Nn).replace(`#include <color_fragment>`,`#include <color_fragment>
`+Pn).replace(`#include <lights_physical_fragment>`,`#include <lights_physical_fragment>
`+Fn)},this.mesh=new z(p,m),this.mesh.frustumCulled=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!0,this.mesh.name=`leaf-carpet`}update(e){let t=this.cells*kn/2,n=Math.round((e.position.x-t+1024)/kn)*kn-1024,r=Math.round((e.position.z-t+1024)/kn)*kn-1024;this.uniforms.uCarpetOrigin.value.set(n,r),this.uniforms.uCarpetCenter.value.copy(e.position)}},Ln={low:{tree:{lod0:45,lod1:170,band:10},shrub:{lod0:26,lod1:70,band:8},imp:1150,density:.85,fall:500,swarm:450,motes:140,leaves:14,leafHalf:9,carpet:64},medium:{tree:{lod0:65,lod1:240,band:12},shrub:{lod0:36,lod1:95,band:10},imp:1500,density:.95,fall:900,swarm:800,motes:240,leaves:22,leafHalf:11,carpet:88},high:{tree:{lod0:95,lod1:320,band:14},shrub:{lod0:46,lod1:120,band:12},imp:1900,density:1,fall:1500,swarm:1200,motes:380,leaves:30,leafHalf:14,carpet:112},ultra:{tree:{lod0:125,lod1:400,band:16},shrub:{lod0:62,lod1:150,band:14},imp:2300,density:1.05,fall:2200,swarm:1600,motes:560,leaves:40,leafHalf:17,carpet:136}},Rn=[{key:`maple0`,kind:`maple`,seed:11},{key:`maple1`,kind:`maple`,seed:12},{key:`maple2`,kind:`maple`,seed:13},{key:`maple3`,kind:`maple`,seed:14},{key:`mapleHero`,kind:`maple`,seed:21,big:1.3},{key:`ginkgo0`,kind:`ginkgo`,seed:31},{key:`ginkgo1`,kind:`ginkgo`,seed:32},{key:`ginkgo2`,kind:`ginkgo`,seed:33},{key:`ginkgoCol0`,kind:`ginkgo`,seed:34,shape:`columnar`},{key:`ginkgoCol1`,kind:`ginkgo`,seed:35,shape:`columnar`},{key:`ginkgoCol2`,kind:`ginkgo`,seed:36,shape:`columnar`},{key:`pine0`,kind:`pine`,seed:41},{key:`pine1`,kind:`pine`,seed:42},{key:`pine2`,kind:`pine`,seed:43},{key:`cedar0`,kind:`cedar`,seed:51},{key:`cedar1`,kind:`cedar`,seed:52},{key:`cedar2`,kind:`cedar`,seed:53},{key:`bamboo0`,kind:`bamboo`,seed:61},{key:`bamboo1`,kind:`bamboo`,seed:62},{key:`shrubRed`,kind:`shrub`,seed:71,cls:`shrub`,tint:[.95,.13,.06]},{key:`shrubGreen`,kind:`shrub`,seed:72,cls:`shrub`,tint:[.2,.3,.1]},{key:`shrubYellow`,kind:`shrub`,seed:73,cls:`shrub`,tint:[.9,.55,.1]},{key:`shrubDark`,kind:`shrub`,seed:74,cls:`shrub`,tint:[.09,.13,.05]}],zn={maple:16777215,ginkgo:16777215,pine:16777215,cedar:16777215,bamboo:16777215,shrub:11575440};async function Bn(e,t){let r=performance.now(),i=Ln[e.quality.name]||Ln.high,a=e.quality.msaa||0,o=Math.min(8,e.gl.capabilities.getMaxAnisotropy()),c=Be(71,o),l=c.map;X.uAtlasSize.value=l.userData.size;let u={},f=5;for(let e of[`maple`,`ginkgo`,`pine`,`cedar`,`bamboo`])u[e]=He(e,f++,o);u.shrub=u.maple;let p=Rn.map(e=>{let t=ht(e.kind,e.seed,e.big||1,{shape:e.shape});if(t.key=e.key,t.cls=e.cls||`tree`,t.barkTint=zn[e.kind],e.tint)for(let n of[t.lod0,t.lod1]){let t=n.leaves.getAttribute(`color`);for(let n=0;n<t.count;n++)t.setXYZ(n,t.getX(n)*e.tint[0],t.getY(n)*e.tint[1],t.getZ(n)*e.tint[2]);t.needsUpdate=!0}return t.castShadow=!0,t}),m=Object.fromEntries(p.map((e,t)=>[e.key,t])),h={};p.forEach((e,t)=>{e.key===`mapleHero`||e.key.startsWith(`ginkgoCol`)||(h[e.kind]||=[]).push(t)});let g=i.tree,_=i.shrub,v={tree0:new I(-2,-1,g.lod0-g.band*.5,g.lod0+g.band*.5),tree1:new I(g.lod0-g.band*.5,g.lod0+g.band*.5,g.lod1-g.band,g.lod1+g.band),shrub0:new I(-2,-1,_.lod0-_.band*.5,_.lod0+_.band*.5),shrub1:new I(_.lod0-_.band*.5,_.lod0+_.band*.5,_.lod1-_.band,_.lod1),imp:new I(g.lod1-g.band,g.lod1+g.band,i.imp-260,i.imp)},y={};for(let e of[`maple`,`ginkgo`,`pine`,`cedar`,`bamboo`,`shrub`]){let t=e===`shrub`?v.shrub0:v.tree0,n=e===`shrub`?v.shrub1:v.tree1;y[e]=[Ot(u[e],t,zn[e],`bark`),Ot(u[e],n,zn[e],`bark`)]}let b={tree:[kt(c,v.tree0,a),kt(c,v.tree1,a)],shrub:[kt({map:l},v.shrub0,a),kt({map:l},v.shrub1,a)]};for(let e of p)e.mats={bark:y[e.kind],leaves:b[e.cls]};let{trees:x,shrubs:S}=Kt(e.terrain,{seed:e.seed,density:i.density});for(let e of x)if(e.variant&&m[e.variant]!==void 0)e.vi=m[e.variant];else{let t=h[e.species];e.vi=t[Math.floor(ee(Math.round(e.x*10),Math.round(e.z*10))*t.length)]}let C={red:`shrubRed`,green:`shrubGreen`,yellow:`shrubYellow`,dark:`shrubDark`};for(let e of S)e.vi=m[C[e.tone]||`shrubGreen`];let w=new nn({variants:p,records:x.concat(S),lod:{tree:g,shrub:_},sunDir:e.lighting.sunDir});e.add(w.group);let T=on(e.gl,p,u,l),E=x.filter(e=>p[e.vi].cls===`tree`).map(e=>({x:e.x,y:e.y,z:e.z,scale:e.scale,variant:e.vi,flip:ee(Math.round(e.x),Math.round(e.z*3))<.5,tint:.82+.3*ee(Math.round(e.z),Math.round(e.x*3))})),D=ln(E,T.cells,T.texture,v.imp,a);e.add(D);let O=Qt(x,e=>p[e.vi]),k=new d(O.data,O.res,O.res,n,s);k.minFilter=k.magFilter=se,k.generateMipmaps=!1,k.needsUpdate=!0;let A=new yn({count:i.fall,atlas:l,litterMask:k,cellMaple:W(U.mapleLeaf),cellGinkgo:W(U.ginkgoLeaf),msaa:a});e.add(A.mesh);let te={atlas:l,litterMask:k,cellMaple:W(U.mapleLeaf),cellGinkgo:W(U.ginkgoLeaf),msaa:a},j=new Sn({count:i.swarm,...te}),ne=new Sn({count:Math.round(i.swarm*.2),...te,box:[12,5,.35,1],seed:733,name:`leaf-swarm-near`});e.add(j.mesh),e.add(ne.mesh);let re=new In({litterMask:k,tiles:Ue(91,o),cells:i.carpet,fade:[i.carpet*.62,i.carpet*.95],msaa:a});e.add(re.mesh);let M=new On({atlas:l,litterMask:k,cellMaple:W(U.mapleLeaf),cellGinkgo:W(U.ginkgoLeaf),half:i.leafHalf,density:i.leaves,msaa:a});M.uniforms.uLitBox.value.set(i.leafHalf,i.leafHalf*.6,i.leafHalf*.95,.12),e.add(M.mesh);let N=new Tn({count:i.motes});e.add(N.mesh);for(let t of x){let n=p[t.vi],r=n.kind===`bamboo`?1.1*t.scale:Math.max(.22,n.trunkR*t.scale*1.1);e.colliders.addCircle(t.x,t.z,r,{tag:`tree`})}let P=e.camera;e.addSystem({frame(e){X.uTreeCam.value.copy(P.position),w.update(P),A.update(e,P),j.update(e,P),ne.update(e,P),N.update(e,P),M.update(P),re.update(P)}}),e.onShot(()=>{A.reset(),j.reset(),ne.reset(),N.reset(),X.uTreeCam.value.copy(P.position),w.update(P,!0),re.update(P),M.update(P)}),Hn(e);let F={records:x,shrubs:S,variants:p,forest:w,impostors:D,nearest(e,t,n=20){let r=[];for(let i of x){let a=Math.hypot(i.x-e,i.z-t);a<n&&r.push({x:i.x,z:i.z,species:i.species,radius:p[i.vi].radius*i.scale,height:p[i.vi].height*i.scale,d:a})}return r.sort((e,t)=>e.d-t.d)},clear(t){return Vn(e,F,t,O,k)},stats(){return{trees:x.length,shrubs:S.length,impostors:E.length,lod0:w.stats.lod0,lod1:w.stats.lod1,buildMs:Math.round(ie)}}},ie=performance.now()-r,ae=e=>(e.index?e.index.count:e.getAttribute(`position`).count)/3;return console.info(`[trees] ${x.length} trees, ${S.length} shrubs, ${p.length} variants in ${ie.toFixed(0)} ms · tris/variant `+p.map(e=>`${e.key}:${ae(e.lod0.bark)+ae(e.lod0.leaves)}/${ae(e.lod1.bark)+ae(e.lod1.leaves)}`).join(` `)),F}function Vn(e,t,n,r,i){if(!n||!n.length)return 0;let a=n.filter(e=>e.y===void 0),o=n.filter(e=>e.y!==void 0),s=(e,t,n=0,r=a)=>r.some(r=>{let i=r.r+n;if(r.x2===void 0)return(e-r.x)**2+(t-r.z)**2<i*i;let a=r.x2-r.x,o=r.z2-r.z,s=Math.max(0,Math.min(1,((e-r.x)*a+(t-r.z)*o)/(a*a+o*o||1)));return(e-r.x-a*s)**2+(t-r.z-o*s)**2<i*i}),c=(e,t,n,r)=>o.some(i=>{let a=i.x2-i.x,o=i.y2-i.y,s=i.z2-i.z,c=Math.max(0,Math.min(1,((e-i.x)*a+(t-i.y)*o+(n-i.z)*s)/(a*a+o*o+s*s||1)));return Math.hypot(e-i.x-a*c,t-i.y-o*c,n-i.z-s*c)<i.r+r}),l=t.forest,u=e=>{let n=t.variants[l.vi[e]],r=l.s[e];return c(l.x[e]+n.crown.c.x*r,l.y[e]+n.crown.c.y*r,l.z[e]+n.crown.c.z*r,Math.max(n.crown.r.x,n.crown.r.y,n.crown.r.z)*r*.85)},d=0,f=new Set;for(let[e,t]of l.cells){let n=[];for(let e of t)s(l.x[e],l.z[e])?d++:o.length&&u(e)?(d++,f.add(`${l.x[e].toFixed(2)},${l.z[e].toFixed(2)}`)):n.push(e);n.length!==t.length&&l.cells.set(e,Int32Array.from(n))}l._lastPos.set(1e9,1e9,1e9);let p=t.impostors.geometry.getAttribute(`aImpPos`),m=t.impostors.geometry.getAttribute(`aImpSize`);for(let e=0;e<p.count;e++){let t=p.array,n=e*4;if(s(t[n],t[n+2]))t[n+3]=0;else if(o.length&&t[n+3]>0){let e=m.array[n],r=m.array[n+1],i=m.array[n+2],a=t[n+3];c(t[n],t[n+1]+(i+r*.62)*a,t[n+2],e*.4*a)&&(t[n+3]=0)}}p.needsUpdate=!0;let h=e.colliders,g=new Set(h.items.filter(e=>e.tag===`tree`&&(s(e.x,e.z)||f.has(`${Math.fround(e.x).toFixed(2)},${Math.fround(e.z).toFixed(2)}`))));if(g.size){h.items=h.items.filter(e=>!g.has(e));for(let[e,t]of h.grid)h.grid.set(e,t.filter(e=>!g.has(e)))}let _=a.filter(e=>!e.keepLitter),v=r.res,y=2048/v;for(let e=0;e<v&&_.length;e++)for(let t=0;t<v;t++)if(s(-1024+(t+.5)*y,-1024+(e+.5)*y,-1,_)){let n=(e*v+t)*4;r.data[n]=r.data[n+1]=r.data[n+2]=0}return i.needsUpdate=!0,d}function Hn(e){let t=(t,n)=>e.terrain.heightAt(t,n);me.T5_maple={hours:17.62,fov:50,t0:11,pose(){return{pos:[-52,t(-52,71)+1.7,71],target:[-76,t(-76,86)+5,86]}}},me.T5_forest={hours:17.5,fov:55,t0:3,pose(){let e=O.shrine.x+18,n=O.shrine.z-10;return{pos:[e,t(e,n)+22,n],target:[140,40,-140]}}},me.T5_ginkgo={hours:17.3,fov:55,t0:7,pose(){let e=-140;return{pos:[300,t(300,e)+1.7,e],target:[360,t(360,-96)+7,-96]}}},me.T5_bamboo={hours:17.45,fov:55,t0:5,pose(){let e=-222,n=-320;return{pos:[26,t(26,e)+1.7,e],target:[31,t(31,n)+4,n]}}}}export{Rn as SPECS,Bn as install};