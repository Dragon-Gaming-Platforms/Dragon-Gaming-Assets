const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./trees-CtIl4fFN.js","./Layout-C14GeEeY.js","./three.module-D1GrkEkZ.js","./props-CFr1IxRj.js","./BufferGeometryUtils-BRxHBn9Y.js","./torii-XWYxrguG.js","./actors-C7wnLYvI.js","./charShading-DiRZsUfe.js","./i18n-AqexAa8x.js","./wildlife-CnFbGFqZ.js","./ui-OFCnlZEd.js","./ui-zU1_v1Hq.css","./audio-B9-2QAYG.js"])))=>i.map(i=>d[i]);
import{$ as e,$n as t,An as n,At as r,Bn as i,Bt as a,C as o,Ct as s,Fn as c,Gn as l,In as u,J as d,K as f,L as p,Mt as m,O as h,On as g,Ot as _,Q as v,R as y,S as b,Sn as x,Tt as S,U as C,V as w,X as ee,Y as T,Z as E,_n as te,_t as ne,a as D,at as re,b as ie,bn as O,ct as ae,dt as oe,er as k,g as A,h as j,ht as M,i as N,j as se,jn as ce,kt as P,l as le,lt as ue,m as de,n as F,nt as fe,o as I,p as L,q as pe,r as me,rr as he,tr as R,tt as ge,u as z,ut as B,vt as V,yt as _e,z as ve}from"./Layout-C14GeEeY.js";import{i as ye,n as be,r as xe,t as Se}from"./three.module-D1GrkEkZ.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var Ce=class{constructor(e,t){this.quality=t;let n=document.createElement(`canvas`);n.id=`kaze-canvas`,e.appendChild(n),this.canvas=n;let r=n.getContext(`webgl2`,{antialias:!1,alpha:!1,depth:!0,stencil:!1,powerPreference:`high-performance`,preserveDrawingBuffer:!1});if(!r)throw Error(`WebGL2 is required`);let i=!!(r&&r.getExtension(`EXT_clip_control`));this.renderer=new ye({canvas:n,context:r,antialias:!1,alpha:!1,stencil:!1,depth:!0,powerPreference:`high-performance`,reversedDepthBuffer:i,preserveDrawingBuffer:!1});let a=this.renderer;a.outputColorSpace=g,a.toneMapping=0,a.shadowMap.enabled=!0,a.shadowMap.type=1,a.shadowMap.autoUpdate=!0,a.info.autoReset=!1,this.reversedDepth=i,this.pixelRatio=1,this.renderScale=t.renderScale,this.width=1,this.height=1,this.listeners=[],this.dyn={enabled:t.dynamicResolution,ema:16.7,t:0,min:.6,target:1e3/58},this.resize(),window.addEventListener(`resize`,()=>this.resize())}onResize(e){this.listeners.push(e)}get drawingWidth(){return Math.max(1,Math.floor(this.width*this.pixelRatio))}get drawingHeight(){return Math.max(1,Math.floor(this.height*this.pixelRatio))}get renderWidth(){return Math.max(1,Math.floor(this.drawingWidth*this.renderScale))}get renderHeight(){return Math.max(1,Math.floor(this.drawingHeight*this.renderScale))}resize(){this.width=window.innerWidth,this.height=window.innerHeight,this.pixelRatio=Math.min(window.devicePixelRatio||1,this.quality.maxDpr),this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setSize(this.width,this.height,!0);for(let e of this.listeners)e(this)}setQuality(e){this.quality=e,this.renderScale=e.renderScale,this.dyn.enabled=e.dynamicResolution,this.resize()}updateDynamicResolution(e){let t=this.dyn;if(!t.enabled||(t.ema+=(e-t.ema)*.05,t.t+=e,t.t<1200))return;t.t=0;let n=this.quality.renderScale,r=this.renderScale;if(t.ema>t.target*1.12&&r>t.min?r=Math.max(t.min,r-.08):t.ema<t.target*.8&&r<n&&(r=Math.min(n,r+.05)),r!==this.renderScale){this.renderScale=r;for(let e of this.listeners)e(this)}}},we=class{constructor({update:e,frame:t,fixedDt:n=1/60,maxSteps:r=6,deterministic:i=!1}){this.update=e,this.frame=t,this.fixedDt=n,this.maxSteps=r,this.deterministic=i,this.timeScale=1,this.paused=!1,this.time=0,this.frameCount=0,this.acc=0,this.last=0,this.running=!1,this.lastFrameMs=16.7,this._frameWaiters=[],this._tick=this._tick.bind(this)}start(){this.running||(this.running=!0,this.last=performance.now(),requestAnimationFrame(this._tick))}stop(){this.running=!1}waitFrames(e){return new Promise(t=>this._frameWaiters.push({n:this.frameCount+e,resolve:t}))}_tick(e){if(!this.running)return;requestAnimationFrame(this._tick);let t=Math.min(250,Math.max(0,e-this.last));this.last=e,this.lastFrameMs=t;let n;if(this.deterministic)n=this.paused?0:this.fixedDt*this.timeScale,this.paused||(this.time+=n,this.update(n,this.time));else{n=this.paused?0:Math.min(.1,t/1e3)*this.timeScale,this.acc+=n;let e=0,r=this.fixedDt*Math.min(1,this.timeScale||1);for(;this.acc>=r&&e<this.maxSteps;)this.time+=r,this.update(r,this.time),this.acc-=r,e++;e===this.maxSteps&&(this.acc=0)}let r=this.deterministic?1:this.acc/this.fixedDt;if(this.frame(n,this.time,r,t),this.frameCount++,this._frameWaiters.length){let e=[];for(let t of this._frameWaiters)this.frameCount>=t.n?t.resolve():e.push(t);this._frameWaiters=e}}},Te={forward:{keys:[`KeyW`,`ArrowUp`]},back:{keys:[`KeyS`,`ArrowDown`]},left:{keys:[`KeyA`,`ArrowLeft`]},right:{keys:[`KeyD`,`ArrowRight`]},sprint:{keys:[`ShiftLeft`,`ShiftRight`],pad:[10]},walk:{keys:[`KeyZ`]},dodge:{keys:[`Space`,`KeyC`],pad:[1]},attack:{mouse:[0],pad:[2]},heavy:{keys:[`KeyF`],mouse:[2],pad:[3]},block:{keys:[`KeyQ`],pad:[4]},interact:{keys:[`KeyE`],pad:[5]},guide:{keys:[`KeyT`,`Tab`],pad:[8]},heal:{keys:[`KeyR`],pad:[12]},pause:{keys:[`Escape`,`KeyP`],pad:[9]},photo:{keys:[`KeyO`],pad:[13]},freecam:{keys:[`F1`]},up:{keys:[`KeyE`]},down:{keys:[`KeyQ`]},fast:{keys:[`ShiftLeft`,`ShiftRight`]},horse:{keys:[`KeyH`],pad:[14]},zoomReset:{mouse:[1]}};function Ee(e,t=0){let n=t===1?e*33:t===2?e*800:e;return n?Math.sign(n)*Math.min(1.5,Math.max(.25,Math.abs(n)/60)):0}var De=new Set,Oe=new Set([`ShiftLeft`,`ShiftRight`]),ke=new Set([`MetaLeft`,`MetaRight`,`OSLeft`,`OSRight`]),Ae=new Set([...Oe,...ke,`ControlLeft`,`ControlRight`,`AltLeft`,`AltRight`,`CapsLock`]),je=new Set([`Space`,`Tab`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`AltLeft`,`AltRight`,`F1`,`Backspace`,`Slash`,`Quote`,`ContextMenu`]),Me=class{constructor(e){this.target=e,this.keys=new Set,this._taps=new Set,this.prevKeys=new Set,this.mouseButtons=new Set,this.prevMouse=new Set,this.padButtons=new Set,this.prevPad=new Set,this._mdx=0,this._mdy=0,this._wheel=0,this._wheelSteps=0,this.mouseDX=0,this.mouseDY=0,this.wheel=0,this.wheelSteps=0,this.pad={lx:0,ly:0,rx:0,ry:0,lt:0,rt:0,connected:!1},this.pointerLocked=!1,this.enabled=!0,this.lookSensitivity=.0022,this.padLookSpeed=2.6,window.addEventListener(`keydown`,e=>this._keyDown(e)),window.addEventListener(`keyup`,e=>this._keyUp(e)),window.addEventListener(`blur`,()=>this.clear()),document.addEventListener(`visibilitychange`,()=>{document.hidden&&this.clear()}),e.addEventListener(`mousedown`,e=>{this._syncShift(e),this.enabled&&(this.mouseButtons.add(e.button),this._taps.add(`mouse`+e.button),(e.button===1||e.button>2)&&e.preventDefault())}),window.addEventListener(`mouseup`,e=>{this.mouseButtons.delete(e.button),this.enabled&&e.button>2&&e.preventDefault()}),e.addEventListener(`contextmenu`,e=>e.preventDefault()),window.addEventListener(`contextmenu`,e=>{this.enabled&&e.preventDefault()}),window.addEventListener(`mousemove`,e=>{this._syncShift(e),this.pointerLocked&&(this._mdx+=e.movementX,this._mdy+=e.movementY)}),window.addEventListener(`wheel`,e=>{this._wheel+=Math.sign(e.deltaY),this.enabled&&(this._wheelSteps+=Ee(e.deltaY,e.deltaMode))},{passive:!0}),document.addEventListener(`pointerlockchange`,()=>{let t=this.pointerLocked;this.pointerLocked=document.pointerLockElement===e,t&&!this.pointerLocked&&this.clear()})}_keyDown(e){if(!this.enabled)return;let t=e.code;(!e.metaKey||Ae.has(t))&&(this._syncShift(e),e.repeat?this.keys.has(t)||(this.keys.add(t),this.keysFrame&&this.keysFrame.add(t)):(this.keys.add(t),this._taps.add(t)),this._isGameKey(e)&&e.preventDefault())}_keyUp(e){this.keys.delete(e.code),ke.has(e.code)?this.clear({keepModifiers:!0}):this._syncShift(e),this.enabled&&this._isGameKey(e)&&e.preventDefault()}_syncShift(e){if(typeof e.shiftKey!=`boolean`||Oe.has(e.code))return;let t=this.keys.has(`ShiftLeft`)||this.keys.has(`ShiftRight`);e.shiftKey&&!t&&this.enabled?this.keys.add(`ShiftLeft`):!e.shiftKey&&t&&e.isTrusted&&(this.keys.delete(`ShiftLeft`),this.keys.delete(`ShiftRight`))}_isGameKey(e){return e.ctrlKey||e.metaKey?!1:je.has(e.code)||Object.values(Te).some(t=>t.keys&&t.keys.includes(e.code))}clear({keepModifiers:e=!1}={}){for(let t of[...this.keys])(!e||!Ae.has(t))&&this.keys.delete(t);e||(this.mouseButtons.clear(),this._taps.clear())}requestPointerLock(){if(!this.pointerLocked&&this.target.requestPointerLock){let e=this.target.requestPointerLock();e&&e.catch&&e.catch(()=>{})}}exitPointerLock(){document.exitPointerLock&&document.exitPointerLock()}update(){this.prevKeys=new Set(this.keysFrame||[]),this.keysFrame=new Set(this.keys),this.prevMouse=new Set(this.mouseFrame||[]),this.mouseFrame=new Set(this.mouseButtons);for(let e of this._taps)if(e.startsWith(`mouse`)){let t=Number(e.slice(5));this.mouseFrame.add(t),this.prevMouse.delete(t)}else this.keysFrame.add(e),this.prevKeys.delete(e);this._taps.clear(),this.mouseDX=this._mdx,this.mouseDY=this._mdy,this.wheel=this._wheel,this.wheelSteps=this._wheelSteps,this._mdx=this._mdy=this._wheel=this._wheelSteps=0,this.prevPad=this.padButtons,this.padButtons=new Set;let e=this._gamepad(),t=e=>Math.abs(e)<.15?0:(e-Math.sign(e)*.15)/.85;e?(this.pad.connected=!0,this.pad.lx=t(e.axes[0]||0),this.pad.ly=t(e.axes[1]||0),this.pad.rx=t(e.axes[2]||0),this.pad.ry=t(e.axes[3]||0),this.pad.lt=e.buttons[6]?e.buttons[6].value:0,this.pad.rt=e.buttons[7]?e.buttons[7].value:0,e.buttons.forEach((e,t)=>{e.pressed&&this.padButtons.add(t)})):(this.pad.connected=!1,this.pad.lx=this.pad.ly=this.pad.rx=this.pad.ry=this.pad.lt=this.pad.rt=0)}_gamepad(){let e=navigator.getGamepads?navigator.getGamepads():[];return e&&Array.from(e).find(e=>e&&e.connected)||null}rumble(e,t,n){let r=this._gamepad();if(!r)return!1;try{let i=r.vibrationActuator,a=r.hapticActuators&&r.hapticActuators[0],o=null;if(i&&i.playEffect)o=i.playEffect(`dual-rumble`,{startDelay:0,duration:n,strongMagnitude:e,weakMagnitude:t});else if(a&&a.pulse)o=a.pulse(Math.max(e,t),n);else return!1;return o&&o.catch&&o.catch(()=>{}),!0}catch{return!1}}_state(e,t,n,r){let i=Te[e];return i?!!(i.keys&&i.keys.some(e=>t.has(e))||i.mouse&&i.mouse.some(e=>n.has(e))||i.pad&&i.pad.some(e=>r.has(e))):t.has(e)}_sets(e,t){let n=t?this.prevKeys:this.keysFrame||this.keys,r=t?this.prevMouse:this.mouseFrame||this.mouseButtons,i=t?this.prevPad:this.padButtons;return[!e||e===`key`?n:De,!e||e===`mouse`?r:De,!e||e===`pad`?i:De]}down(e,t){return this._state(e,...this._sets(t,!1))}pressed(e,t){return this.down(e,t)&&!this._state(e,...this._sets(t,!0))}released(e,t){return!this.down(e,t)&&this._state(e,...this._sets(t,!0))}move(){let e=0,t=0;this.down(`left`)&&--e,this.down(`right`)&&(e+=1),this.down(`forward`)&&(t+=1),this.down(`back`)&&--t,e+=this.pad.lx,t-=this.pad.ly;let n=Math.hypot(e,t);return n>1&&(e/=n,t/=n),{x:e,y:t}}look(e=1/60){return{x:this.mouseDX*this.lookSensitivity+this.pad.rx*this.padLookSpeed*e,y:this.mouseDY*this.lookSensitivity+this.pad.ry*this.padLookSpeed*e}}},Ne=class{constructor(e,t,n){this.camera=e,this.input=t,this.terrain=n,this.enabled=!0,this.speed=12,this.yaw=0,this.pitch=0,this._v=new k,this._f=new k,this._r=new k,this.syncFromCamera()}syncFromCamera(){let e=new C().setFromQuaternion(this.camera.quaternion,`YXZ`);this.yaw=e.y,this.pitch=e.x}frame(e){if(!this.enabled)return;let t=this.input,n=t.look(e);(t.pointerLocked||t.pad.connected)&&(this.yaw-=n.x,this.pitch=M.clamp(this.pitch-n.y,-1.5,1.5)),t.wheel&&(this.speed=M.clamp(this.speed*(t.wheel>0?.8:1.25),1,400)),this.camera.quaternion.setFromEuler(new C(this.pitch,this.yaw,0,`YXZ`));let r=t.move(),i=this._f.set(0,0,-1).applyQuaternion(this.camera.quaternion),a=this._r.set(1,0,0).applyQuaternion(this.camera.quaternion),o=this._v.set(0,0,0).addScaledVector(i,r.y).addScaledVector(a,r.x);t.down(`up`)&&(o.y+=1),t.down(`down`)&&--o.y;let s=this.speed*(t.down(`fast`)?4:1);if(this.camera.position.addScaledVector(o,s*e),this.terrain){let e=this.terrain.heightAt(this.camera.position.x,this.camera.position.z)+.6;this.camera.position.y<e&&(this.camera.position.y=e)}}},Pe={low:{name:`low`,maxDpr:1,renderScale:.72,msaa:0,shadowMapSize:1024,shadowFar:140,grassDensity:.4,grassNear:32,grassMid:!1,pampasDensity:.45,terrainLodDist:260,bloom:!0,dynamicResolution:!0},medium:{name:`medium`,maxDpr:1,renderScale:.88,msaa:2,shadowMapSize:2048,shadowFar:200,grassDensity:.65,grassNear:40,grassMid:!0,pampasDensity:.7,terrainLodDist:340,bloom:!0,dynamicResolution:!0},high:{name:`high`,maxDpr:1.25,renderScale:1,msaa:4,shadowMapSize:2048,shadowFar:260,grassDensity:1,grassNear:46,grassMid:!0,pampasDensity:1,terrainLodDist:420,bloom:!0,dynamicResolution:!0},ultra:{name:`ultra`,maxDpr:2,renderScale:1,msaa:4,shadowMapSize:4096,shadowFar:360,grassDensity:1.35,grassNear:52,grassMid:!0,pampasDensity:1.3,terrainLodDist:560,bloom:!0,dynamicResolution:!1}};function Fe(e){return{...Pe[e]||Pe.high}}var Ie=[4,8,16,32];function Le(e,t,n){let r=de(n),i=new Float32Array(t*t),a=new Float32Array(t*t);for(let e=0;e<t*t;e++){let t=r()*Math.PI*2;i[e]=Math.cos(t),a[e]=Math.sin(t)}let o=new Float32Array(e*e),s=e=>e*e*e*(e*(e*6-15)+10);for(let n=0;n<e;n++)for(let r=0;r<e;r++){let c=r/e*t,l=n/e*t,u=Math.floor(c),d=Math.floor(l),f=c-u,p=l-d,m=(u+1)%t,h=(d+1)%t,g=d*t+u,_=d*t+m,v=h*t+u,y=h*t+m,b=i[g]*f+a[g]*p,x=i[_]*(f-1)+a[_]*p,S=i[v]*f+a[v]*(p-1),C=i[y]*(f-1)+a[y]*(p-1),w=s(f),ee=s(p),T=b+(x-b)*w,E=S+(C-S)*w;o[n*e+r]=(T+(E-T)*ee)*1.414}return o}function Re(e=7){let t=Ie.map((t,n)=>Le(256,t,e*97+n*13)),n=new Float32Array(262144),r=new Uint16Array(262144);for(let e=0;e<65536;e++)for(let i=0;i<4;i++){let a=t[i][e];n[e*4+i]=a,r[e*4+i]=y.toHalfFloat(a)}let i=new p(r,256,256,a,v);i.wrapS=i.wrapT=x,i.magFilter=B,i.minFilter=oe,i.generateMipmaps=!0,i.colorSpace=``,i.needsUpdate=!0;function o(e,t,r){let i=e*256-.5,a=t*256-.5,o=Math.floor(i),s=Math.floor(a),c=i-o,l=a-s,u=o&255,d=o+1&255,f=s&255,p=s+1&255,m=n[(f*256+u)*4+r],h=n[(f*256+d)*4+r],g=n[(p*256+u)*4+r],_=n[(p*256+d)*4+r],v=m+(h-m)*c;return v+(g+(_-g)*c-v)*l}return{texture:i,data:n,size:256,sample:o}}var H={};function ze(e){for(let t in e)H[t]=e[t];return e}function Be(e,t){be[e]=t}Be(`kaze_common`,`
#ifndef KAZE_COMMON
#define KAZE_COMMON
uniform sampler2D uNoiseTex;

uvec3 kazePcg3(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}
vec3 kazeHash3(ivec3 p) { return vec3(kazePcg3(uvec3(p))) * (1.0 / 4294967295.0); }
float kazeHash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
// 4-octave tileable fbm in ~[-1,1] from one texture fetch.
float kazeFbm(vec2 uv) { return dot(texture(uNoiseTex, uv), vec4(0.5333, 0.2667, 0.1333, 0.0667)); }
float kazeFbmLod(vec2 uv) { return dot(textureLod(uNoiseTex, uv, 0.0), vec4(0.5333, 0.2667, 0.1333, 0.0667)); }
vec4 kazeNoise4(vec2 uv) { return texture(uNoiseTex, uv); }
vec4 kazeNoise4Lod(vec2 uv) { return textureLod(uNoiseTex, uv, 0.0); }
#endif
`),Be(`kaze_atmosphere`,`
#ifndef KAZE_ATMOSPHERE
#define KAZE_ATMOSPHERE
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogHeightFalloff;
uniform float uScatter;
uniform float uHazeDensity;
uniform float uHazeFalloff;
uniform vec3 uHazeColor;
uniform vec3 uHazeWarm;
uniform float uSunHalo; // aerosol glow around the sun: a weather value owned by Sky (shots override it)

// optical depth of an exponential layer along a ray segment of length d starting at height h0
float kazeLayerDepth(float density, float k, float h0, float dirY, float d) {
  float e0 = exp(-k * clamp(h0, -50.0, 5000.0));
  float kdy = k * dirY;
  if (abs(kdy) < 1e-6) return density * e0 * d;
  return density * e0 * (1.0 - exp(clamp(-kdy * d, -60.0, 60.0))) / kdy;
}

// Haze colour: golden only within ~30° of the sun's bearing, blue-violet everywhere else (the distant ranges
// beside the low sun fade to layered blue-violet, not to a beige veil).
vec3 kazeHazeColor(vec3 dir, float mistFrac) {
  vec2 dxz = normalize(dir.xz + vec2(1e-5));
  vec2 sxz = normalize(uSunDir.xz + vec2(1e-5));
  float side = clamp(0.5 + 0.5 * dot(dxz, sxz), 0.0, 1.0);
  float warm = pow(side, 16.0); // 0.61 at 20° off the sun's bearing, 0.33 at 30°, 0.08 at 45°
  vec3 haze = mix(uHazeColor, uHazeWarm, warm);
  vec3 mist = uFogColor * mix(vec3(0.82, 0.86, 0.98), vec3(1.08, 1.0, 0.9), warm);
  return mix(haze, mist, mistFrac);
}

// Forward-scattering lobe: the air glows around the low sun.
vec3 kazeSunGlow(vec3 dir) {
  float mu = max(dot(dir, uSunDir), 0.0);
  float lobe = 0.042 * pow(mu, 2.0) + 0.15 * pow(mu, 8.0) + 0.42 * pow(mu, 32.0) + 0.9 * pow(mu, 260.0);
  return uSunColor * (uScatter * uSunHalo * lobe);
}

vec3 kazeInscatter(vec3 dir, float mistFrac) {
  return kazeHazeColor(dir, mistFrac) + kazeSunGlow(dir);
}

vec3 kazeAtmosphereRay(vec3 color, vec3 origin, vec3 dir, float d) {
  float tm = kazeLayerDepth(uFogDensity, uFogHeightFalloff, origin.y, dir.y, d);
  float th = kazeLayerDepth(uHazeDensity, uHazeFalloff, origin.y, dir.y, d);
  float T = exp(-(tm + th));
  float mistFrac = tm / max(tm + th, 1e-5);
  // the glow around a low sun needs a long column of lit air: the sky and the far ranges (1 - T > 0.35) get all of
  // it, a hill a few hundred metres off (1 - T ≈ 0.1) little and the near field none, so what stands in front of the
  // sun keeps its dark backlit silhouette against the glow instead of turning into a golden veil
  float glow = smoothstep(0.03, 0.35, 1.0 - T);
  return color * T + (kazeHazeColor(dir, mistFrac) + kazeSunGlow(dir) * glow) * (1.0 - T);
}

vec3 kazeAtmosphere(vec3 color, vec3 worldPos) {
  vec3 v = worldPos - cameraPosition;
  float d = length(v);
  if (d < 1e-3) return color;
  return kazeAtmosphereRay(color, cameraPosition, v / d, d);
}

// Transmittance of a ray to "infinity" (sky): used by the sky dome so it blends into the same haze.
float kazeSkyTransmittance(vec3 origin, vec3 dir, out float mistFrac) {
  float dy = max(dir.y, 0.0015);
  float d = 60000.0;
  float tm = kazeLayerDepth(uFogDensity, uFogHeightFalloff, origin.y, dy, d);
  float th = kazeLayerDepth(uHazeDensity, uHazeFalloff, origin.y, dy, d);
  mistFrac = tm / max(tm + th, 1e-5);
  return exp(-(tm + th));
}
#endif
`);var Ve=`
#ifdef USE_FOG
  varying vec3 vKazeFogWorld;
#endif
`,He=`
#ifdef USE_FOG
  vKazeFogWorld = transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz);
#endif
`,Ue=`
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying vec3 vKazeFogWorld;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
  #include <kaze_atmosphere>
#endif
`,We=`
#ifdef USE_FOG
  gl_FragColor.rgb = kazeAtmosphere(gl_FragColor.rgb, vKazeFogWorld);
#endif
`,Ge=new class{constructor(){this.uniforms=ze({uSunDir:{value:new k(-.8,.17,.55).normalize()},uSunColor:{value:new h(3,1.6,.7)},uFogColor:{value:new h(.55,.5,.52)},uFogDensity:{value:8e-4},uFogHeightFalloff:{value:1/22},uScatter:{value:.55},uHazeDensity:{value:1e-4},uHazeFalloff:{value:1/1400},uHazeColor:{value:new h(.36,.42,.62)},uHazeWarm:{value:new h(.8,.55,.3)}}),this.installed=!1}install(){this.installed||=(be.fog_pars_vertex=Ve,be.fog_vertex=He,be.fog_pars_fragment=Ue,be.fog_fragment=We,!0)}patchMaterial(e){let t=e.onBeforeCompile,n=this.uniforms;return e.onBeforeCompile=function(e,r){t.call(this,e,r),Object.assign(e.uniforms,n),H.uSunHalo&&(e.uniforms.uSunHalo=H.uSunHalo)},e.needsUpdate=!0,e}},Ke=new P(-1,1,1,-1,0,1),qe=new class extends o{constructor(){super(),this.setAttribute(`position`,new f([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new f([0,2,0,0,2,0],2))}},Je=class{constructor(e){this._mesh=new V(qe,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Ke)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Ye=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,Xe=`
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uFirst;
uniform float uThreshold;
uniform float uKnee;
varying vec2 vUv;
vec3 S(vec2 o) {
  vec3 c = texture2D(tSrc, vUv + o * uTexel).rgb;
  // a single NaN/Inf pixel would smear across the whole frame through the bloom chain
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
  return c;
}
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 karis(vec3 a, vec3 b, vec3 c, vec3 d) {
  float wa = 1.0 / (1.0 + luma(a)), wb = 1.0 / (1.0 + luma(b)), wc = 1.0 / (1.0 + luma(c)), wd = 1.0 / (1.0 + luma(d));
  return (a * wa + b * wb + c * wc + d * wd) / (wa + wb + wc + wd);
}
void main() {
  vec3 a = S(vec2(-2.0, 2.0)), b = S(vec2(0.0, 2.0)), c = S(vec2(2.0, 2.0));
  vec3 d = S(vec2(-2.0, 0.0)), e = S(vec2(0.0, 0.0)), f = S(vec2(2.0, 0.0));
  vec3 g = S(vec2(-2.0, -2.0)), h = S(vec2(0.0, -2.0)), i = S(vec2(2.0, -2.0));
  vec3 j = S(vec2(-1.0, 1.0)), k = S(vec2(1.0, 1.0)), l = S(vec2(-1.0, -1.0)), m = S(vec2(1.0, -1.0));
  vec3 col;
  if (uFirst > 0.5) {
    col = karis(j, k, l, m) * 0.5
        + karis(a, b, d, e) * 0.125 + karis(b, c, e, f) * 0.125
        + karis(d, e, g, h) * 0.125 + karis(e, f, h, i) * 0.125;
    // soft-knee threshold keeps bloom to genuinely bright light
    float br = max(col.r, max(col.g, col.b));
    float rq = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
    rq = rq * rq / (4.0 * uKnee + 1e-4);
    col *= max(rq, br - uThreshold) / max(br, 1e-4);
    col = min(col, vec3(250.0));
  } else {
    col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  }
  gl_FragColor = vec4(col, 1.0);
}
`,Ze=`
uniform sampler2D tLow;
uniform sampler2D tHigh;
uniform vec2 uTexel;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 o = uTexel * uRadius;
  vec3 s = texture2D(tLow, vUv + vec2(-o.x, o.y)).rgb + texture2D(tLow, vUv + vec2(0.0, o.y)).rgb * 2.0
         + texture2D(tLow, vUv + vec2(o.x, o.y)).rgb + texture2D(tLow, vUv + vec2(-o.x, 0.0)).rgb * 2.0
         + texture2D(tLow, vUv).rgb * 4.0 + texture2D(tLow, vUv + vec2(o.x, 0.0)).rgb * 2.0
         + texture2D(tLow, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tLow, vUv + vec2(0.0, -o.y)).rgb * 2.0
         + texture2D(tLow, vUv + vec2(o.x, -o.y)).rgb;
  gl_FragColor = vec4(texture2D(tHigh, vUv).rgb + s / 16.0, 1.0);
}
`,Qe=2.39;function $e(e){return Math.max(0,.5-.5*e/Qe)}var et=`
uniform sampler2D tColor;
uniform sampler2D tBloom;
uniform vec2 uResolution;
uniform float uExposure;
uniform float uBloomStrength;
uniform float uTime;
uniform float uSaturation;
uniform float uContrast;
uniform vec3 uLift;
uniform vec3 uGamma;
uniform vec3 uGain;
uniform vec3 uShadowTint;
uniform vec3 uHighlightTint;
uniform float uSplitStrength;
uniform float uVignette;
uniform float uGroundShade;
uniform float uGrain;
uniform float uLetterbox;
uniform float uBars;
uniform float uBW;
uniform float uCA;
uniform float uFade;
uniform float uWarmth;
varying vec2 vUv;

vec3 RRTAndODTFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}
vec3 ACESFilmic(vec3 color) {
  const mat3 ACESInputMat = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 ACESOutputMat = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  color = ACESInputMat * color;
  color = RRTAndODTFit(color);
  color = ACESOutputMat * color;
  return clamp(color, 0.0, 1.0);
}
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 linearToSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec2 uv = vUv;
  vec3 hdr;
  if (uCA > 0.0) {
    vec2 d = (uv - 0.5) * uCA * 0.004;
    hdr = vec3(texture2D(tColor, uv + d).r, texture2D(tColor, uv).g, texture2D(tColor, uv - d).b);
  } else {
    hdr = texture2D(tColor, uv).rgb;
  }
  vec3 bloom = texture2D(tBloom, uv).rgb;
  vec3 c = (hdr + bloom * uBloomStrength) * uExposure;
  // scene warmth (dusk/cutscene grade): pushes the whole HDR image toward red-orange before tonemapping
  c *= vec3(1.0 + 0.15 * uWarmth, 1.0 - 0.12 * uWarmth, 1.0 - 0.3 * uWarmth);

  c = ACESFilmic(c / 0.6);

  // grade in display-linear space
  c = uGain * (c + uLift * (1.0 - c));
  c = pow(max(c, 0.0), 1.0 / uGamma);
  float l = luma(c);
  c = mix(vec3(l), c, uSaturation);
  // gentle S-curve contrast around mid grey
  c = clamp((c - 0.18) * uContrast + 0.18, 0.0, 1.0);
  l = luma(c);
  c += (uShadowTint - 0.5) * uSplitStrength * (1.0 - l) * (1.0 - l);
  c += (uHighlightTint - 0.5) * uSplitStrength * l * l;
  c = clamp(c, 0.0, 1.0);

  // black & white cinema mode (high contrast, lifted grain)
  if (uBW > 0.0) {
    float bw = luma(c);
    bw = smoothstep(0.02, 0.92, bw);
    bw = pow(bw, 1.12);
    c = mix(c, vec3(bw), uBW);
  }

  // vignette
  vec2 q = uv - 0.5;
  q.x *= uResolution.x / uResolution.y;
  float vig = 1.0 - uVignette * smoothstep(0.35, 1.05, length(q));
  c *= vig;
  // graduated shade over the lower frame (a grad filter): darkens the foreground below the subjects
  c *= 1.0 - uGroundShade * (1.0 - smoothstep(0.1, 0.45, uv.y));

  // film grain (luma-dependent, strongest in mid tones)
  float g = hash(uv * uResolution + fract(uTime * 7.31) * 173.0) - 0.5;
  float gl = luma(c);
  c += g * uGrain * (1.0 + uBW * 1.5) * (0.35 + gl * (1.0 - gl) * 2.2);

  // letterbox (the film ratio, FILM_ASPECT, at uLetterbox = 1: filmBars() above), or bars of an absolute height
  // whatever the aspect (uBars: a fraction of the frame per bar, 0.5 = closed; the opening cinematic) — the taller
  const float FILM_ASPECT = ${Qe.toFixed(2)};
  float barH = max(uLetterbox * max(0.0, 0.5 - 0.5 * (uResolution.x / uResolution.y) / FILM_ASPECT), uBars);
  float bars = step(barH, uv.y) * step(uv.y, 1.0 - barH);
  c *= bars;
  c *= (1.0 - uFade);

  c = linearToSRGB(clamp(c, 0.0, 1.0));
  // triangular dither: kills banding in the sky gradients
  float dn = hash(gl_FragCoord.xy + 0.37) + hash(gl_FragCoord.xy * 1.37 + 11.1) - 1.0;
  c += dn / 255.0;
  gl_FragColor = vec4(c, 1.0);
}
`;function tt(e,t,n={}){let r=new he(e,t,{type:v,format:a,minFilter:B,magFilter:B,depthBuffer:!!n.depth,stencilBuffer:!1,samples:n.samples||0,generateMipmaps:!1});return r.texture.colorSpace=``,n.depthTexture&&(r.depthTexture=new w(e,t,pe),r.depthTexture.format=ve),r}var nt=class{constructor(e,n){this.r=e,this.quality=n,this.hdrPasses=[],this.bloomLevels=6,this.enabled={bloom:n.bloom},this.params={exposure:1,bloomStrength:.45,bloomThreshold:2,bloomKnee:.8,bloomRadius:1,saturation:1.2,contrast:1.1,lift:new k(.008,.003,0),gamma:new k(1,1,1),gain:new k(1.03,.99,.93),shadowTint:new k(.52,.47,.44),highlightTint:new k(.62,.52,.4),splitStrength:.2,vignette:.35,groundShade:0,grain:.028,letterbox:0,bars:0,bw:0,ca:.1,fade:0,warmth:0,godRays:.2,dofAperture:0,dofFocus:12,dofMaxBlur:10},this.defaults=Object.fromEntries(Object.entries(this.params).filter(([,e])=>typeof e==`number`)),this.downMat=new ce({vertexShader:Ye,fragmentShader:Xe,uniforms:{tSrc:{value:null},uTexel:{value:new t},uFirst:{value:0},uThreshold:{value:1},uKnee:{value:.5}},depthTest:!1,depthWrite:!1}),this.upMat=new ce({vertexShader:Ye,fragmentShader:Ze,uniforms:{tLow:{value:null},tHigh:{value:null},uTexel:{value:new t},uRadius:{value:1}},depthTest:!1,depthWrite:!1});let r=this.params;this.finalMat=new ce({vertexShader:Ye,fragmentShader:et,uniforms:{tColor:{value:null},tBloom:{value:null},uResolution:{value:new t(1,1)},uExposure:{value:r.exposure},uBloomStrength:{value:r.bloomStrength},uTime:{value:0},uSaturation:{value:r.saturation},uContrast:{value:r.contrast},uLift:{value:r.lift},uGamma:{value:r.gamma},uGain:{value:r.gain},uShadowTint:{value:r.shadowTint},uHighlightTint:{value:r.highlightTint},uSplitStrength:{value:r.splitStrength},uVignette:{value:r.vignette},uGroundShade:{value:r.groundShade},uGrain:{value:r.grain},uLetterbox:{value:r.letterbox},uBars:{value:r.bars},uBW:{value:r.bw},uCA:{value:r.ca},uFade:{value:r.fade},uWarmth:{value:r.warmth}},depthTest:!1,depthWrite:!1}),this.quad=new Je(null),this.black=new p(new Uint8Array([0,0,0,255]),1,1),this.black.needsUpdate=!0,this._alloc(),e.onResize(()=>this._alloc())}_alloc(){let e=this.r.renderWidth,t=this.r.renderHeight;if(this.sceneRT&&this.sceneRT.width===e&&this.sceneRT.height===t)return;this._dispose(),this.sceneRT=tt(e,t,{depth:!0,samples:this.quality.msaa,depthTexture:!0}),this.hdrA=tt(e,t),this.hdrB=tt(e,t),this.down=[],this.up=[];let n=Math.max(1,e>>1),r=Math.max(1,t>>1);for(let e=0;e<this.bloomLevels;e++)this.down.push(tt(n,r)),this.up.push(tt(n,r)),n=Math.max(1,n>>1),r=Math.max(1,r>>1)}_dispose(){let e=[this.sceneRT,this.hdrA,this.hdrB,...this.down||[],...this.up||[]];for(let t of e)t&&t.dispose()}get depthTexture(){return this.sceneRT.depthTexture}addHDRPass(e){return this.hdrPasses.push(e),e}_blit(e,t){this.quad.material=e,this.r.renderer.setRenderTarget(t),this.quad.render(this.r.renderer)}render(e,t,n=0){let r=this.r.renderer;r.setRenderTarget(this.sceneRT),r.clear(!0,!0,!1),r.render(e,t);let i=this.sceneRT.texture,a=this.hdrA,o=this.hdrB,s={camera:t,depthTexture:this.sceneRT.depthTexture,time:n,width:this.sceneRT.width,height:this.sceneRT.height};for(let e of this.hdrPasses)e.enabled!==!1&&(e.render(r,i,a,s),i=a.texture,[a,o]=[o,a]);let c=this.black;if(this.enabled.bloom){let e=this.params,t=this.downMat.uniforms,n=i,r=this.sceneRT.width,a=this.sceneRT.height;for(let i=0;i<this.bloomLevels;i++)t.tSrc.value=n,t.uTexel.value.set(1/r,1/a),t.uFirst.value=+(i===0),t.uThreshold.value=e.bloomThreshold,t.uKnee.value=e.bloomKnee,this._blit(this.downMat,this.down[i]),n=this.down[i].texture,r=this.down[i].width,a=this.down[i].height;let o=this.upMat.uniforms,s=this.down[this.bloomLevels-1].texture;for(let t=this.bloomLevels-2;t>=0;t--)o.tLow.value=s,o.tHigh.value=this.down[t].texture,o.uTexel.value.set(1/this.down[t+1].width,1/this.down[t+1].height),o.uRadius.value=e.bloomRadius,this._blit(this.upMat,this.up[t]),s=this.up[t].texture;c=s}let l=this.finalMat.uniforms,u=this.params;l.tColor.value=i,l.tBloom.value=c,l.uResolution.value.set(this.r.drawingWidth,this.r.drawingHeight),l.uExposure.value=u.exposure,l.uBloomStrength.value=this.enabled.bloom?u.bloomStrength/this.bloomLevels:0,l.uTime.value=n,l.uSaturation.value=u.saturation,l.uContrast.value=u.contrast,l.uSplitStrength.value=u.splitStrength,l.uVignette.value=u.vignette,l.uGroundShade.value=u.groundShade,l.uGrain.value=u.grain,l.uLetterbox.value=u.letterbox,l.uBars.value=u.bars,l.uBW.value=u.bw,l.uCA.value=u.ca,l.uFade.value=u.fade,l.uWarmth.value=u.warmth,this._blit(this.finalMat,null)}};function rt(e,t,n=new k){let r=Math.hypot(e.x,e.z);if(!t||r<1e-6)return n.copy(e);let i=Math.asin(M.clamp(e.y,-1,1))+M.degToRad(t),a=Math.cos(i)/r;return n.set(e.x*a,Math.sin(i),e.z*a)}var it=`
vec3 kazeDrawnSunDir(vec3 sunDir, float liftDeg) {
  float h = length(sunDir.xz);
  if (liftDeg == 0.0 || h < 1e-6) return sunDir;
  float el = asin(clamp(sunDir.y, -1.0, 1.0)) + radians(liftDeg);
  vec2 b = sunDir.xz * (cos(el) / h);
  return vec3(b.x, sin(el), b.y);
}
`,at=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`,ot=`
uniform float uReversed;
uniform float uNear;
uniform float uFar;
float kzLinearDepth(float d) {
  if (uReversed > 0.5) return uNear * uFar / (d * (uFar - uNear) + uNear);
  float z = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear));
}
bool kzIsSky(float d) { return uReversed > 0.5 ? d <= 1e-7 : d >= 0.9999999; }
`;function st(e,t,n=1){let r=new he(Math.max(1,e>>n),Math.max(1,t>>n),{type:v,minFilter:B,magFilter:B,depthBuffer:!1});return r.texture.colorSpace=``,r}function ct(e,t){return new ce({vertexShader:at,fragmentShader:e,uniforms:t,depthTest:!1,depthWrite:!1})}var lt=new k,ut=new k,dt=new k,ft=new t,pt=class{constructor(e){this.post=e,this.enabled=!0,this.quad=new Je(null);let n=()=>({uReversed:{value:+!!e.r.reversedDepth},uNear:{value:.3},uFar:{value:2e4}});this.maskMat=ct(`
      ${ot}
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      uniform vec2 uSun;
      uniform float uAspect;
      varying vec2 vUv;
      void main() {
        float d = texture2D(tDepth, vUv).r;
        vec3 c = min(texture2D(tColor, vUv).rgb, vec3(8.0));
        vec2 dv = vUv - uSun;
        dv.x *= uAspect;
        // only sky near the sun emits (the rest of the sky is the ambient dome, not a light source)
        float fall = exp(-dot(dv, dv) * 12.0);
        gl_FragColor = vec4(kzIsSky(d) ? c * fall : vec3(0.0), 1.0);
      }`,{tColor:{value:null},tDepth:{value:null},uSun:{value:new t},uAspect:{value:1},...n()}),this.blurMat=ct(`
      uniform sampler2D tSrc;
      uniform vec2 uSun;
      uniform float uLength;
      varying vec2 vUv;
      const int N = 40;
      void main() {
        vec2 delta = (vUv - uSun) * uLength / float(N);
        vec2 uv = vUv;
        vec3 sum = vec3(0.0);
        float w = 1.0, wsum = 0.0;
        for (int i = 0; i < N; i++) {
          sum += texture2D(tSrc, uv).rgb * w;
          wsum += w;
          w *= 0.965;
          uv -= delta;
        }
        gl_FragColor = vec4(sum / wsum, 1.0);
      }`,{tSrc:{value:null},uSun:{value:new t},uLength:{value:.9}}),this.compMat=ct(`
      uniform sampler2D tColor;
      uniform sampler2D tRays;
      uniform vec3 uTint;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tColor, vUv).rgb;
        vec3 r = texture2D(tRays, vUv).rgb;
        gl_FragColor = vec4(c + r * uTint * uStrength, 1.0);
      }`,{tColor:{value:null},tRays:{value:null},uTint:{value:new h(1,.85,.62)},uStrength:{value:0}}),this.rtA=null,this.rtB=null}_alloc(e,t){this.rtA&&this.w===e&&this.h===t||(this.rtA&&(this.rtA.dispose(),this.rtB.dispose()),this.w=e,this.h=t,this.rtA=st(e,t,2),this.rtB=st(e,t,2))}_blit(e,t,n){this.quad.material=e,n.setRenderTarget(t),this.quad.render(n)}sunOnScreen(e,t){let n=Ge.uniforms.uSunDir.value,r=rt(n,H.uSunLift?H.uSunLift.value:0,dt);e.getWorldDirection(ut);let i=ut.dot(r);lt.copy(r).multiplyScalar(1e3).add(e.position).project(e),t.set(lt.x*.5+.5,lt.y*.5+.5);let a=Math.max(Math.abs(lt.x),Math.abs(lt.y));return M.smoothstep(i,.05,.45)*(1-M.smoothstep(a,1.3,2.4))*Math.min(1,n.y*12+.2)}render(e,t,n,r){let i=this.post.params.godRays??.6,a=r.camera,o=ft,s=this.sunOnScreen(a,o);if(i<=0||s<=.001){this.compMat.uniforms.tColor.value=t,this.compMat.uniforms.tRays.value=t,this.compMat.uniforms.uStrength.value=0,this._blit(this.compMat,n,e);return}this._alloc(r.width,r.height);let c=this.maskMat.uniforms;c.tColor.value=t,c.tDepth.value=r.depthTexture,c.uSun.value.copy(o),c.uAspect.value=r.width/r.height,c.uNear.value=a.near,c.uFar.value=a.far,this._blit(this.maskMat,this.rtA,e);let l=this.blurMat.uniforms;l.uSun.value.copy(o),l.tSrc.value=this.rtA.texture,l.uLength.value=.85,this._blit(this.blurMat,this.rtB,e),l.tSrc.value=this.rtB.texture,l.uLength.value=.22,this._blit(this.blurMat,this.rtA,e);let u=this.compMat.uniforms;u.tColor.value=t,u.tRays.value=this.rtA.texture,u.uStrength.value=i*s;let d=Ge.uniforms.uSunColor.value,f=Math.max(d.r,d.g,d.b,.001);u.uTint.value.setRGB(d.r/f,d.g/f,d.b/f),this._blit(this.compMat,n,e)}},mt=class{constructor(e){this.post=e,this.quad=new Je(null);let n=()=>({uReversed:{value:+!!e.r.reversedDepth},uNear:{value:.3},uFar:{value:2e4}}),r=`
      uniform float uFocus;
      uniform float uAperture;
      // signed circle of confusion (negative = foreground), 1 = max blur
      float kzCoc(float dist) {
        float c = (dist - uFocus) / max(dist, 0.01) * uAperture;
        return clamp(c, -1.0, 1.0);
      }`;this.prepMat=ct(`
      ${ot}
      ${r}
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      varying vec2 vUv;
      void main() {
        float d = texture2D(tDepth, vUv).r;
        float dist = kzIsSky(d) ? uFar : kzLinearDepth(d);
        gl_FragColor = vec4(texture2D(tColor, vUv).rgb, kzCoc(dist));
      }`,{tColor:{value:null},tDepth:{value:null},uFocus:{value:10},uAperture:{value:0},...n()}),this.blurMat=ct(`
      uniform sampler2D tSrc;
      uniform vec2 uTexel;
      uniform float uMaxBlur;
      varying vec2 vUv;
      const int N = 24;
      void main() {
        vec4 center = texture2D(tSrc, vUv);
        float rC = abs(center.a) * uMaxBlur;
        vec3 sum = center.rgb;
        float wsum = 1.0;
        float ga = 2.39996323;
        for (int i = 1; i < N; i++) {
          float fi = float(i);
          float r = sqrt(fi / float(N)) * uMaxBlur;
          vec2 o = vec2(cos(fi * ga), sin(fi * ga)) * r;
          vec4 s = texture2D(tSrc, vUv + o * uTexel);
          float rS = abs(s.a) * uMaxBlur;
          // a sample contributes if its own blur reaches this pixel; foreground (a<0) may spill over
          float reach = smoothstep(r - 1.0, r + 1.0, s.a < 0.0 ? rS : min(rS, rC + 1.0));
          sum += s.rgb * reach;
          wsum += reach;
        }
        gl_FragColor = vec4(sum / wsum, center.a);
      }`,{tSrc:{value:null},uTexel:{value:new t},uMaxBlur:{value:8}}),this.compMat=ct(`
      ${ot}
      ${r}
      uniform sampler2D tColor;
      uniform sampler2D tBlur;
      uniform sampler2D tDepth;
      varying vec2 vUv;
      void main() {
        float d = texture2D(tDepth, vUv).r;
        float dist = kzIsSky(d) ? uFar : kzLinearDepth(d);
        float coc = abs(kzCoc(dist));
        vec4 b = texture2D(tBlur, vUv);
        // foreground blur also bleeds over sharp background edges
        float amt = max(smoothstep(0.04, 0.28, coc), smoothstep(0.04, 0.28, -b.a));
        gl_FragColor = vec4(mix(texture2D(tColor, vUv).rgb, b.rgb, amt), 1.0);
      }`,{tColor:{value:null},tBlur:{value:null},tDepth:{value:null},uFocus:{value:10},uAperture:{value:0},...n()}),this.rtA=null,this.rtB=null}get enabled(){return(this.post.params.dofAperture||0)>0}_alloc(e,t){this.rtA&&this.w===e&&this.h===t||(this.rtA&&(this.rtA.dispose(),this.rtB.dispose()),this.w=e,this.h=t,this.rtA=st(e,t),this.rtB=st(e,t))}_blit(e,t,n){this.quad.material=e,n.setRenderTarget(t),this.quad.render(n)}render(e,t,n,r){let i=this.post.params,a=r.camera;this._alloc(r.width,r.height);let o=this.prepMat.uniforms,s=this.compMat.uniforms,c=this.blurMat.uniforms;for(let e of[o,s])e.uFocus.value=i.dofFocus||10,e.uAperture.value=i.dofAperture||0,e.uNear.value=a.near,e.uFar.value=a.far,e.tDepth.value=r.depthTexture;o.tColor.value=t,this._blit(this.prepMat,this.rtA,e),c.tSrc.value=this.rtA.texture,c.uTexel.value.set(1/this.rtA.width,1/this.rtA.height),c.uMaxBlur.value=(i.dofMaxBlur||10)*(r.height/1080)/2,this._blit(this.blurMat,this.rtB,e),s.tColor.value=t,s.tBlur.value=this.rtB.texture,this._blit(this.compMat,n,e)}},ht=7.5,gt=1.85,_t=1.6,vt=2.5,yt=.6,bt=.8;Be(`kaze_wind`,`
#ifndef KAZE_WIND
#define KAZE_WIND
#include <kaze_common>
#define KZ_FRONT_SPEED ${ht.toFixed(2)}
#define KZ_GUIDE_GAIN ${gt.toFixed(2)}
uniform float uTime;
uniform vec2 uWindDir;
uniform float uWindStrength;
uniform float uGust;
uniform vec2 uGuideDir;     // heading of the guided wind (unit)
uniform float uGuide;       // guide envelope 0..1: how much of the air is the guided wind
uniform vec2 uGuidePhase;   // how far the guided fronts have travelled along uGuideDir and slid across it (m)
uniform vec2 uWindFlow;     // heading of the air (unit): the arc from the ambient heading to uGuideDir, by uGuide
uniform float uGuideSoft;   // uGuide low-passed (~0.8 s): for what should join and leave the guided wind gradually
uniform vec2 uWaveDrift;    // how far the sea's waves have drifted downwind (m), integrated on the CPU

// the ambient heading, normalised as it always was
vec2 kzAmbientDir() {
  float l = length(uWindDir);
  return l > 1e-4 ? uWindDir / l : uWindDir;
}

vec2 kazeWindDir() { return uGuide > 0.0 ? uWindFlow : kzAmbientDir(); }

// Wind speed factor of one field of gust fronts, at the point whose coordinates in the field's own travelling frame
// are (along, lateral): a steady breeze that keeps the fields leaning, and gust fronts rolling across them: bands
// ~20 m deep, ~46 m apart (an ~8 m leading edge, a ~15 m core of full gust, an ~7 m trailing edge), broken into
// patches, with ~16 m of steady air between them (the lulls hold still, so the eye sees the bands move). Everything is
// sampled in the fronts' own frame, so a gust patch keeps its shape as it crosses the field. Two noise fetches.
// ~0.25 in a lull .. ~1 in a front.
float kzFronts(float along, float lateral) {
  vec4 nL = textureLod(uNoiseTex, vec2(lateral, along) * 0.0021 + vec2(0.37, 0.11), 0.0);
  vec4 nS = textureLod(uNoiseTex, vec2(lateral, along) * 0.011 + vec2(0.71, 0.29), 0.0);
  // the fronts bend into long arcs (r: ~120 m) with ragged edges (small r: ~20 m)
  float s = fract((along + nL.r * 30.0 + nS.r * 6.0) * (1.0 / 46.0));
  float front = smoothstep(0.35, 0.52, s) * (1.0 - smoothstep(0.82, 1.0, s));
  // patches ~40–80 m across (g, b) and cat's paws inside them (small g, b); the lulls are steady air
  float patchy = smoothstep(-0.4, 0.35, nL.g + 0.35 * nL.b);
  float paws = clamp(0.5 + 0.9 * nS.g + 0.5 * nS.b, 0.0, 1.0);
  float g = 0.3 + uGust * front * patchy * (0.8 + 0.4 * paws);
  return uWindStrength * g;
}

// the strongest gust the ambient wind has (the core of a front where the cat's paws peak): the most a crown should bend
float kazeGustPeak() { return uWindStrength * (0.3 + uGust * 1.2); }

// The bend of both fields cross-faded by the envelope, and the ambient gust on its own (a: what the field has always
// been, ~0.25 in a lull .. ~1 in a front; the guided gust reaches ~1.8). There is no branch: while no guide blows the
// guided fetches read the ambient texels (cache hits) and their term is multiplied by zero. With a branch around the
// guided fetches the compiler fused the consumers' arithmetic differently, by an ulp, and a few pixels of every
// canonical capture moved with it; without it S1 and S3 stay byte-identical to the single-field shader.
void kzBlend(vec2 p, out vec2 b, out float a) {
  vec2 d = kzAmbientDir();
  float alongA = dot(p, d) - uTime * KZ_FRONT_SPEED;
  float lateralA = dot(p, vec2(-d.y, d.x));
  a = kzFronts(alongA, lateralA);
  bool live = uGuide > 0.0;
  float alongG = live ? dot(p, uGuideDir) - uGuidePhase.x : alongA;
  float lateralG = live ? dot(p, vec2(-uGuideDir.y, uGuideDir.x)) - uGuidePhase.y : lateralA;
  float guided = kzFronts(alongG, lateralG);
  b = d * (a * (1.0 - uGuide)) + uGuideDir * (guided * (KZ_GUIDE_GAIN * uGuide));
}

float kazeGust(vec2 p) {
  vec2 b;
  float a;
  kzBlend(p, b, a);
  return uGuide > 0.0 ? length(b) : a;
}

vec2 kazeWindBend(vec2 p) {
  vec2 b;
  float a;
  kzBlend(p, b, a);
  return b;
}
#endif
`);var xt=new t,St=new t,Ct=Math.PI*2,wt=e=>Math.atan2(Math.sin(e),Math.cos(e)),Tt=e=>.5-Math.sin(Math.asin(1-2*z(e,0,1))/3),U=new class{constructor(){let e=new t(.86,.51).normalize();this.uniforms=ze({uTime:{value:0},uWindDir:{value:e.clone()},uWindStrength:{value:.8},uGust:{value:.9},uGuideDir:{value:new t(1,0)},uGuide:{value:0},uGuidePhase:{value:new t},uWindFlow:{value:e.clone()},uGuideSoft:{value:0},uWaveDrift:{value:new t}}),this.baseAngle=Math.atan2(.51,.86),this.noise=null,this.origin=new t,this._guide=null,this._time=0,this._angle=this.baseAngle,this._guideAngle=0,this._flowDelta=0}setNoise(e){this.noise=e}get time(){return this._time}set time(e){this.setTime(e)}setTime(e){let t=this.uniforms;this._time=e,this._guide=null,this._guideAngle=0,this._flowDelta=0,t.uGuide.value=0,t.uGuideSoft.value=0,t.uGuideDir.value.set(1,0),t.uGuidePhase.value.set(0,0),this.update(0),t.uWaveDrift.value.copy(t.uWindDir.value).multiplyScalar(e)}setOrigin(e,t){this.origin.set(e,t)}guideTo(e,t,n=6){let r=this.uniforms,i=r.uGuide.value,a=this._guide!==null&&i>0;if(!a){let n=e-this.origin.x,i=t-this.origin.y;this._guideAngle=n*n+i*i>4?Math.atan2(i,n):this._angle,r.uGuideDir.value.set(Math.cos(this._guideAngle),Math.sin(this._guideAngle)),r.uGuidePhase.value.set(this._time*13.5,0),this._flowDelta=wt(this._guideAngle-this._angle)}let o=a?_t*Tt(i):0;this._guide={x:e,z:t,t:o,dur:o+(a?Math.max(n,vt):n)}}update(e){this._time+=e;let t=this.uniforms;t.uTime.value=this._time;let n=this.baseAngle+Math.sin(this._time*.021)*.13+Math.sin(this._time*.057+1.3)*.08;this._angle=n,t.uWindDir.value.set(Math.cos(n),Math.sin(n));let r=0,i=this._guide;if(i&&(i.t+=e,this._steer(e),t.uGuidePhase.value.x+=13.5*e,r=A(0,_t,i.t)*(1-A(i.dur-vt,i.dur,i.t)),i.t>=i.dur&&(this._guide=null,r=0)),t.uGuide.value=r,r>0){let e=wt(this._guideAngle-n);e+=Ct*Math.round((this._flowDelta-e)/Ct),this._flowDelta=e;let i=n+e*r;t.uWindFlow.value.set(Math.cos(i),Math.sin(i))}else t.uWindFlow.value.copy(t.uWindDir.value);t.uWaveDrift.value.addScaledVector(t.uWindFlow.value,e);let a=t.uGuideSoft.value+(r-t.uGuideSoft.value)*(1-Math.exp(-e/bt));t.uGuideSoft.value=r===0&&a<.001?0:a}_steer(e){let t=this._guide,n=this.origin,r=this.uniforms,i=t.x-n.x,a=t.z-n.y;if(i*i+a*a<=4)return;let o=yt*e,s=z(wt(Math.atan2(a,i)-this._guideAngle),-o,o);if(s===0)return;let c=r.uGuideDir.value,l=r.uGuidePhase.value;this._guideAngle=wt(this._guideAngle+s);let u=Math.cos(this._guideAngle),d=Math.sin(this._guideAngle);l.x+=n.x*u+n.y*d-(n.x*c.x+n.y*c.y),l.y+=-n.x*d+n.y*u-(-n.x*c.y+n.y*c.x),c.set(u,d)}_ambientDir(e){let t=this.uniforms.uWindDir.value;e.copy(t);let n=e.length();return n>1e-4&&e.multiplyScalar(1/n),e}dir(e=new t){let n=this.uniforms;return n.uGuide.value>0?e.copy(n.uWindFlow.value):this._ambientDir(e)}_fronts(e,t){let n=this.uniforms,r=this.noise,i=t*.0021+.37,a=e*.0021+.11,o=t*.011+.71,s=e*.011+.29,c=r?r.sample(i,a,0):0,l=r?r.sample(i,a,1):0,u=r?r.sample(i,a,2):0,d=r?r.sample(o,s,0):0,f=r?r.sample(o,s,1):0,p=r?r.sample(o,s,2):0,m=(e+c*30+d*6)*(1/46),h=m-Math.floor(m),g=A(.35,.52,h)*(1-A(.82,1,h)),_=A(-.4,.35,l+.35*u),v=z(.5+.9*f+.5*p,0,1),y=.3+n.uGust.value*g*_*(.8+.4*v);return n.uWindStrength.value*y}_blend(e,t,n){let r=this.uniforms,i=r.uGuide.value,a=r.uGuideDir.value,o=r.uGuidePhase.value,s=this._fronts(e*a.x+t*a.y-o.x,-e*a.y+t*a.x-o.y)*(gt*i),c=a.x*s,l=a.y*s;if(i<1){let n=this._ambientDir(St),a=this._fronts(e*n.x+t*n.y-r.uTime.value*ht,-e*n.y+t*n.x)*(1-i);c+=n.x*a,l+=n.y*a}return n.set(c,l)}gust(e,t){if(this.uniforms.uGuide.value>0){let n=this._blend(e,t,xt);return Math.sqrt(n.x*n.x+n.y*n.y)}let n=this._ambientDir(xt);return this._fronts(e*n.x+t*n.y-this.uniforms.uTime.value*ht,-e*n.y+t*n.x)}sample(e,n,r=new t){if(this.uniforms.uGuide.value>0)return this._blend(e,n,r);let i=this.gust(e,n),a=this.dir(r);return r.set(a.x*i,a.y*i)}gustPeak(){let e=this.uniforms;return e.uWindStrength.value*(.3+e.uGust.value*1.2)}intensity(e,t){return z(this.gust(e,t),0,3)}},Et=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
}
`,Dt=`
#include <kaze_common>
#include <kaze_atmosphere>
uniform vec3 uSkyZenith;
uniform vec3 uSkyHorizon;
uniform vec3 uSkyHorizonCool;
uniform vec3 uGroundColor;
uniform float uSunDisc; // disc brightness scale (1 = palette; a giant cinematic disc needs less to stay a readable disc)
uniform float uSunSize;
uniform float uSunLift; // degrees: the drawn sun (disc, aureole, cloud glow; the light shafts follow) above the true one
uniform float uCloudCover;
uniform float uCloudHeight;
uniform vec2 uCloudOffset;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform float uCloudDark; // 1 = palette; lower = storm: dark grey bodies overhead, pale air between (silver linings kept)
uniform float uCloudGlow; // 1 = palette; > 1 = brighter sunlit cloud sides and, under a storm deck, brighter pale air low down
uniform float uCloudScale; // < 1 = bigger cloud masses
uniform float uCloudSoft;  // width of the density ramp at the cloud edge (soft, volumetric-looking bodies)
uniform float uEnvPass;
varying vec3 vDir;
${it}
// Scattered cumulus: a large-scale coverage field gates billowy puffs (abs-fbm gives rounded lobes). Returns the
// raw field; the cover threshold (1 - uCloudCover) is applied by the caller.
float cloudField(vec2 uv) {
  vec2 w = vec2(kazeFbm(uv * 0.7 + vec2(3.1, 1.7)), kazeFbm(uv * 0.7 - vec2(1.3, 4.1))) * 0.22;
  float field = kazeFbm(uv * 0.45 + w * 0.4) * 0.5 + 0.5;
  float puff = kazeFbm(uv * 1.7 + w) * 0.58 + (1.0 - abs(kazeFbm(uv * 4.3 - w * 1.3))) * 0.3 + kazeFbm(uv * 10.5 + w) * 0.12;
  return field * 0.55 + (puff * 0.5 + 0.5) * 0.55 - 0.05;
}

void main() {
  vec3 dir = normalize(vDir);
  float h = dir.y;
  float hp = max(h, 0.0);
  vec2 sxz = normalize(uSunDir.xz + vec2(1e-5));
  // the sun as drawn in the sky (render/drawnSun.js, shared with the light shafts): the true sun, or a shot's giant
  // disc raised by uSunLift so it rests above the hills. Lighting, haze and shadows keep the true direction.
  float mu = dot(dir, kazeDrawnSunDir(uSunDir, uSunLift));
  float muc = max(mu, 0.0);

  // base gradient: clear teal-blue overhead, warm band hugging the horizon (stronger on the sun side)
  vec2 dxz = normalize(dir.xz + vec2(1e-5));
  // clamped: float error can push the anti-sun direction a hair below 0 and pow(<0, x) is NaN
  float sunSide = clamp(0.5 + 0.5 * dot(dxz, sxz), 0.0, 1.0);
  // the warm band climbs high only within ~25° of the sun: a wider band mixed into the teal greys the upper
  // sky; elsewhere the teal dome comes down to a few degrees above the horizon
  float nearSun = pow(muc, 8.0);
  float band = exp(-hp * mix(12.0, 4.0, nearSun));
  vec3 zen = uSkyZenith * (1.25 + 0.6 * (1.0 - hp));
  // low sun: the teal-green zenith belongs to the sun side (blue seen through the warm forward-scattered
  // light); away from the sun it deepens to blue. The split fades out as the sun climbs.
  float lowSun = 1.0 - smoothstep(0.1, 0.35, uSunDir.y);
  zen *= mix(vec3(1.0), vec3(0.8, 0.95, 1.25), (1.0 - sunSide) * lowSun);
  // horizon: golden toward the sun, cool lilac-rose away from it (mixing teal with orange would go grey)
  vec3 hor = mix(uSkyHorizonCool, uSkyHorizon, pow(sunSide, 1.6));
  vec3 sky = mix(zen, hor, band);
  sky += uSunColor * 0.02 * pow(sunSide, 6.0) * exp(-hp * 6.0);
  // Mie halo: broad golden glow + tight bright corona (uSunHalo: aerosol weather, shared with kazeInscatter)
  sky += uSunColor * uSunHalo * (0.005 * pow(muc, 3.0) + 0.036 * pow(muc, 24.0) + 0.13 * pow(muc, 90.0) + 0.6 * pow(muc, 700.0));
  // hazy weather (uSunHalo > 1): the same aerosols that widen the aureole turn the sky milky, tinted by the
  // forward-scattered sunlight (white when there is no sun)
  vec3 sunTint = (uSunColor + 1e-3) / (max(uSunColor.r, max(uSunColor.g, uSunColor.b)) + 1e-3);
  float milk = dot(uHazeWarm, vec3(0.3, 0.5, 0.2)) * (0.9 + 1.4 * pow(muc, 4.0));
  sky = mix(sky, sunTint * milk, clamp((uSunHalo - 1.0) * 0.3, 0.0, 0.75));
  // storm weather (uCloudDark < 0.6): the humid air between the masses is pale, not the clear-day teal;
  // milder values only darken the cloud bodies (a dusk deck in shadow keeps its coloured sky)
  float storm = 1.0 - smoothstep(0.15, 0.6, uCloudDark);
  sky = mix(sky, vec3(dot(sky, vec3(0.3, 0.5, 0.2))) * vec3(1.06, 1.0, 0.9), storm * 0.85);
  // a glowing storm (uCloudGlow > 1): the low sun floods the humid air under the deck, brightest toward the horizon
  // (the dark deck overhead keeps its weight)
  sky *= 1.0 + (uCloudGlow - 1.0) * (1.0 - smoothstep(0.05, 0.45, h)) * storm;

  // cloud layer: dome projection (a flat plane would squash the puffs into streaks near the horizon)
  float cloudA = 0.0; // cloud opacity in front of the sun disc
  if (h > 0.0) {
    vec2 uv = (dir.xz / (h + 0.18) * (0.5 * 1900.0 / uCloudHeight) + cameraPosition.xz * 0.00011) * uCloudScale + uCloudOffset;
    float lo = 1.0 - uCloudCover;
    float n = cloudField(uv);
    float dens = smoothstep(lo, lo + uCloudSoft, n);
    if (dens > 0.001) {
      // optical depth: keeps rising well inside the edge ramp, so a large mass keeps its relief (thin lobes,
      // thick cores) instead of turning into a flat plate once the coverage saturates
      float depth = smoothstep(lo, lo + 0.12, n);
      // self-shadowing toward the sun, through the same optical depth: the side facing the sun is lit and the
      // light dies away gradually into the mass (a lit band, not a lit outline)
      vec2 toSun = sxz * 0.04;
      float o2 = smoothstep(lo, lo + 0.12, cloudField(uv + toSun));
      float o3 = smoothstep(lo, lo + 0.12, cloudField(uv + toSun * 2.4));
      float shade = exp(-(o2 * 2.4 + o3 * 1.5));
      // backlit: the thick body of a cloud between the viewer and the sun lets little light through and reads
      // darker, while its thin parts glow (silver lining). The glow follows the optical depth, so it fades into the
      // body from the edge instead of drawing a bright outline around it.
      float thick = smoothstep(0.3, 0.95, depth);
      float back = pow(muc, 6.0) * thick;
      float silver = pow(muc, 5.0) * 1.05 * (1.0 - depth) + pow(muc, 40.0) * 0.72 * (1.0 - 0.56 * depth);
      // a storm deck (uCloudDark < 1) is dark grey overhead, seen from below, but its distant masses show
      // their lit sides low in the sky and toward the sun: heavy weather keeps bright tears near the horizon
      // (uCloudDark = 1 is the palette cloud: lit side over shaded side)
      float lift = max(pow(muc, 6.0), 1.0 - smoothstep(0.08, 0.45, h));
      float dark = mix(uCloudDark, 1.0, lift);
      vec3 lit = uCloudGlow * uCloudLit * (0.5 + 0.8 * shade) * (1.0 - 0.6 * back) + uSunColor * silver * 0.35;
      // the shaded side also sees the bright horizon band (warm at golden hour, gone with the sun), and its thin
      // lobes let more of that light through than the core: relief inside the shade instead of a flat mauve plate
      float sunUp = min(1.0, dot(uSunColor, vec3(0.3, 0.5, 0.2)));
      vec3 body = (uCloudShade + uSkyHorizon * (0.3 * sunUp)) * mix(uCloudDark, 1.0, 0.5 * lift) * (1.4 - 0.8 * depth);
      body = mix(body, vec3(dot(body, vec3(0.3, 0.5, 0.2))) * vec3(1.1, 1.0, 0.88), storm * 0.68);
      vec3 col = mix(body, lit, (shade * 0.85 + 0.15) * dark);
      // thin edges pick up the sky colour
      col = mix(sky, col, smoothstep(0.0, 0.2, dens));
      float fade = smoothstep(0.0, 0.08, h);
      cloudA = dens * fade;
      sky = mix(sky, col, cloudA);
    }
  }

  // atmosphere / horizon haze, identical model to kazeAtmosphere() used by the terrain
  float mist;
  float T = kazeSkyTransmittance(cameraPosition, dir, mist);
  // the haze integral to "infinity" is only meaningful near the horizon (where it must match distant
  // terrain exactly); higher up it would wash the teal sky and the clouds out, so it fades away
  T = mix(T, 1.0, smoothstep(0.02, 0.2, h) * 0.95);
  vec3 col = sky * T + kazeInscatter(dir, mist) * (1.0 - T);

  // sun disc, attenuated by the atmosphere along its own path and hidden behind the clouds in front of it
  // (bands of cloud cross a low sun); the rim keeps the width of the natural disc (crisp at any size) and a
  // limb darkening warms it toward the edge, so a giant cinematic sun reads as a disc and not as a flat blob.
  // A raised disc (uSunLift) keeps the true sun's path through the air, hence its sunset colour and brightness.
  float mistS;
  float Ts = kazeSkyTransmittance(cameraPosition, uSunDir, mistS);
  float discR = 0.0082 * uSunSize;
  float disc = smoothstep(cos(discR), cos(max(discR - 0.00164, 0.0)), mu);
  float r2 = clamp((1.0 - mu) / max(1.0 - cos(discR), 1e-7), 0.0, 1.0); // (radius / disc radius)^2
  vec3 limb = mix(vec3(1.0), vec3(0.72, 0.52, 0.34), r2 * r2);
  col += uSunColor * limb * (80.0 * uSunDisc) * disc * (0.25 + Ts) * (1.0 - 0.9 * cloudA);

  // below the horizon (only ever seen by the environment probe): warm ground bounce
  float below = 1.0 - smoothstep(-0.12, 0.0, h); // ascending edges (edge0 > edge1 is undefined in GLSL), same ramp
  col = mix(col, uGroundColor * (0.6 + 0.4 * T) + kazeInscatter(dir, 1.0) * 0.25, below * uEnvPass);

  gl_FragColor = vec4(col, 1.0);
}
`,Ot=class{constructor(){this.uniforms=ze({uSkyZenith:{value:new h(.05,.13,.32)},uSkyHorizon:{value:new h(.9,.55,.32)},uSkyHorizonCool:{value:new h(.44,.38,.46)},uGroundColor:{value:new h(.09,.07,.04)},uSunDisc:{value:1},uSunHalo:{value:1},uSunSize:{value:1},uSunLift:{value:0},uCloudCover:{value:.54},uCloudHeight:{value:1900},uCloudOffset:{value:new t(.21,.63)},uCloudLit:{value:new h(1,.62,.42)},uCloudShade:{value:new h(.2,.18,.26)},uCloudDark:{value:1},uCloudGlow:{value:1},uCloudScale:{value:1},uCloudSoft:{value:.12}});let e=this.uniforms;this.defaults={sunSize:e.uSunSize.value,sunLift:e.uSunLift.value,sunDisc:e.uSunDisc.value,sunHalo:e.uSunHalo.value,cloudCover:e.uCloudCover.value,cloudDark:e.uCloudDark.value,cloudGlow:e.uCloudGlow.value,cloudScale:e.uCloudScale.value,cloudSoft:e.uCloudSoft.value,cloudOffset:[e.uCloudOffset.value.x,e.uCloudOffset.value.y]},this.material=new ce({vertexShader:Et,fragmentShader:Dt,uniforms:{...H,uEnvPass:{value:0}},side:1,depthWrite:!1,depthTest:!1,fog:!1}),this.envMaterial=this.material.clone(),this.envMaterial.uniforms={...H,uEnvPass:{value:1}};let r=new u(1,64,32);this.mesh=new V(r,this.material),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-1e3,this.mesh.name=`sky`,this.radius=9e3,this.mesh.scale.setScalar(this.radius),this.envScene=new n,this.envMesh=new V(r,this.envMaterial),this.envMesh.scale.setScalar(1e3),this.envScene.add(this.envMesh)}applyShot(e={}){let t=this.defaults,n=this.uniforms,r=e||{};n.uSunSize.value=r.sunSize??t.sunSize,n.uSunLift.value=r.sunLift??t.sunLift,n.uSunDisc.value=r.sunDisc??t.sunDisc,n.uSunHalo.value=r.sunHalo??t.sunHalo,n.uCloudCover.value=r.cloudCover??t.cloudCover,n.uCloudDark.value=r.cloudDark??t.cloudDark,n.uCloudGlow.value=r.cloudGlow??t.cloudGlow,n.uCloudScale.value=r.cloudScale??t.cloudScale,n.uCloudSoft.value=r.cloudSoft??t.cloudSoft;let i=r.cloudOffset??t.cloudOffset;n.uCloudOffset.value.set(i[0],i[1])}update(e,t,n){this.mesh.position.copy(e.position);let r=this.uniforms.uCloudOffset.value;r.x+=n.x*t*9e-4,r.y+=n.y*t*9e-4}},kt=new ne,At=new ne,jt=new k,Mt=new k,W=new k,Nt=[new k,new k,new k,new k],Pt=[new k,new k,new k,new k],Ft=[new k,new k,new k,new k,new k,new k,new k,new k],G=2,It=.1,Lt=class extends ue{constructor(){super(new P(-5,5,5,-5,.5,500)),this.isSunLightShadow=!0,this.mapSize.set(1024,1024),this._cameras=[],this._matrices=[],this._frustums=[],this._cascadeSplits=[,,,].fill(0),this._cascadeData=[],this._viewportCount=G,this._frameExtents.set(2,1);for(let e=0;e<G;e++)this._cameras.push(new P),this._matrices.push(new ne),this._frustums.push(new T),this._cascadeData.push(new R);for(;this._viewports.length<G;)this._viewports.push(new R)}getCamera(e=0){return this._cameras[e]}getMatrix(e=0){return this._matrices[e]}getFrustum(e=0){return this._frustums[e]}updateMatrices(e,t){if(t===void 0)return;let n=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.x),r=Math.min(.25,(Math.ceil(this.radius)+1)/this.mapSize.y);for(let e=0;e<G;e++)this._viewports[e].set(e+n,r,1-2*n,1-2*r);let i=this.mapSize.x*(1-2*n),a=this.mapSize.y*(1-2*r),o=Math.min(i,a),s=this.camera,c=t.near,l=Math.max(c+1e-6,Math.min(s.far,t.far)),u=this._cascadeSplits;u[0]=c;for(let e=1;e<G;e++){let t=e/G,n=c+(l-c)*t,r=c>0?c*(l/c)**+t:n;u[e]=(n+r)*.5}u[G]=l,jt.setFromMatrixPosition(e.matrixWorld).negate().normalize(),Mt.set(0,1,0),Math.abs(Mt.dot(jt))>.99&&Mt.set(0,0,1),kt.lookAt(W.set(0,0,0),jt,Mt),At.copy(kt).transpose().multiply(t.matrixWorld);let d=t.reversedDepth?1:t.coordinateSystem===2001?0:-1,f=t.projectionMatrixInverse,p=-1/0;for(let e=0;e<4;e++){let n=e===0||e===1?1:-1,r=e===0||e===3?1:-1,i=Nt[e].set(n,r,d).applyMatrix4(f),a=Pt[e];t.isPerspectiveCamera===!0?a.copy(i).multiplyScalar(l/c):a.set(i.x,i.y,-l),i.applyMatrix4(At),a.applyMatrix4(At),p=Math.max(p,i.z,a.z)}p+=l;let m=s.near;for(let e=0;e<G;e++){let t=e===0?u[0]:this._cascadeData[e-1].z,n=u[e+1],r=n-It*(n-u[e]);this._cascadeData[e].set(e===0?-1e10:t,n,r,0);let d=(t-c)/(l-c),f=(n-c)/(l-c);W.set(0,0,0);for(let e=0;e<4;e++)Ft[e*2].lerpVectors(Nt[e],Pt[e],d),Ft[e*2+1].lerpVectors(Nt[e],Pt[e],f),W.add(Ft[e*2]).add(Ft[e*2+1]);W.multiplyScalar(1/8);let h=0,g=1/0;for(let e=0;e<8;e++)h=Math.max(h,Ft[e].distanceToSquared(W)),g=Math.min(g,Ft[e].z);let _=Math.sqrt(h);if(o>1){_/=1-1/o;let e=2*_/i,t=2*_/a;W.x=Math.round(W.x/e)*e,W.y=Math.round(W.y/t)*t}W.z=p+m,W.applyMatrix4(kt);let v=this._cameras[e];v.position.copy(W),v.quaternion.setFromRotationMatrix(kt),v.left=-_,v.right=_,v.top=_,v.bottom=-_,v.near=m,v.far=p-g+2*m,v.coordinateSystem=s.coordinateSystem,v._reversedDepth=s.reversedDepth,v.updateProjectionMatrix(),v.updateMatrixWorld(),this._updateMatrix(v,this._matrices[e],this._frustums[e],this._viewports[e])}}},Rt=class extends ae{constructor(e,t){super(e,t),this.isSunLight=!0,this.type=`SunLight`,this.position.copy(_.DEFAULT_UP),this.updateMatrix(),this.shadow=new Lt}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t}},K=[{el:-4,sun:[1,.25,.08],sunI:0,zen:[.012,.025,.07],hor:[.42,.17,.1],horCool:[.14,.07,.1],haze:[.1,.09,.16],hazeWarm:[.3,.14,.09],mist:[.26,.15,.12],cloudLit:[.5,.2,.16],cloudShade:[.06,.05,.09],env:.35,fill:[.3,.2,.2],fillI:.1},{el:1.5,sun:[1,.26,.06],sunI:2.4,zen:[.07,.035,.07],hor:[1.1,.14,.03],horCool:[.34,.09,.11],haze:[.24,.1,.14],hazeWarm:[.9,.16,.05],mist:[.55,.14,.07],cloudLit:[1.6,.24,.09],cloudShade:[.15,.04,.05],env:.75,fill:[1,.45,.25],fillI:.62},{el:4,sun:[1,.4155,.1586],sunI:2.939,zen:[.045,.1147,.16],hor:[1.142,.431,.172],horCool:[.428,.269,.325],haze:[.245,.189,.289],hazeWarm:[.892,.396,.177],mist:[.62,.337,.195],cloudLit:[1.923,.699,.322],cloudShade:[.208,.111,.132],env:.738,fill:[1,.546,.331],fillI:.593},{el:8,sun:[1,.6,.3],sunI:3.8,zen:[.021,.17,.176],hor:[1.05,.64,.32],horCool:[.44,.38,.46],haze:[.22,.25,.4],hazeWarm:[.8,.55,.3],mist:[.62,.46,.3],cloudLit:[1.8,1.5,.84],cloudShade:[.23,.19,.19],env:.72,fill:[1,.7,.46],fillI:.55},{el:22,sun:[1,.8,.6],sunI:4.4,zen:[.05,.16,.43],hor:[.66,.66,.7],horCool:[.5,.56,.68],haze:[.36,.43,.6],hazeWarm:[.6,.54,.48],mist:[.62,.6,.58],cloudLit:[1.6,1.4,1.2],cloudShade:[.3,.32,.4],env:.85,fill:[.9,.78,.66],fillI:.3},{el:55,sun:[1,.95,.88],sunI:5,zen:[.05,.19,.52],hor:[.55,.66,.82],horCool:[.5,.62,.8],haze:[.45,.54,.72],hazeWarm:[.52,.58,.7],mist:[.66,.7,.76],cloudLit:[1.7,1.66,1.6],cloudShade:[.42,.45,.54],env:.95,fill:[.82,.82,.82],fillI:.22}];function zt(e){let t=K[0],n=K[K.length-1];for(let r=0;r<K.length-1;r++)if(e>=K[r].el&&e<=K[r+1].el){t=K[r],n=K[r+1];break}let r=t===n?0:z((e-t.el)/(n.el-t.el),0,1),i=(e,t)=>e.map((e,n)=>e+(t[n]-e)*r),a={};for(let e of Object.keys(t))a[e]=Array.isArray(t[e])?i(t[e],n[e]):t[e]+(n[e]-t[e])*r;return e<K[0].el&&Object.assign(a,K[0]),e>K[K.length-1].el&&Object.assign(a,K[K.length-1]),a}function Bt(e,t=new k){let n=M.degToRad(42*Math.sin(Math.PI*(e-6.4)/12.2)),r=M.degToRad(180+(e-12.3)*13.16),i=Math.cos(n);return t.set(Math.sin(r)*i,Math.sin(n),-Math.cos(r)*i).normalize()}var Vt=class{constructor({renderer:t,scene:n,quality:r,atmosphere:i,sky:a}){this.renderer=t,this.scene=n,this.atmosphere=i,this.sky=a,this.hours=17.7,this.sunDir=new k,this.sunColor=new h,this.palette=null;let o=new Rt(16777215,3);o.castShadow=!0,o.shadow.mapSize.set(r.shadowMapSize,r.shadowMapSize),o.shadow.camera.near=.5,o.shadow.camera.far=r.shadowFar,o.shadow.bias=-6e-4,o.shadow.normalBias=.35,o.shadow.radius=2.5,this.sun=o,n.add(o),this.fill=new e(16777215,8939076,.3),n.add(this.fill),this.pmrem=new Se(t),this.cubeRT=new xe(128,{type:v,generateMipmaps:!1}),this.cubeCamera=new se(1,5e3,this.cubeRT),this.sky.envScene.add(this.cubeCamera),this.envRT=null,this.envDirty=!0,this.envIntensity=1}setQuality(e){this.sun.shadow.camera.far=e.shadowFar,this.sun.shadow.mapSize.x!==e.shadowMapSize&&(this.sun.shadow.mapSize.set(e.shadowMapSize,e.shadowMapSize),this.sun.shadow.map&&(this.sun.shadow.map.dispose(),this.sun.shadow.map=null))}setTimeOfDay(e){this.hours=e,Bt(e,this.sunDir);let t=zt(M.radToDeg(Math.asin(this.sunDir.y)));this.palette=t,this.sunColor.setRGB(t.sun[0],t.sun[1],t.sun[2]),this.sun.position.copy(this.sunDir),this.sun.color.copy(this.sunColor),this.sun.intensity=t.sunI;let n=this.atmosphere.uniforms;n.uSunDir.value.copy(this.sunDir),n.uSunColor.value.setRGB(t.sun[0]*t.sunI,t.sun[1]*t.sunI,t.sun[2]*t.sunI),n.uHazeColor.value.setRGB(...t.haze),n.uHazeWarm.value.setRGB(...t.hazeWarm),n.uFogColor.value.setRGB(...t.mist);let r=this.sky.uniforms;r.uSkyZenith.value.setRGB(...t.zen),r.uSkyHorizon.value.setRGB(...t.hor),r.uSkyHorizonCool.value.setRGB(...t.horCool),r.uCloudLit.value.setRGB(...t.cloudLit),r.uCloudShade.value.setRGB(...t.cloudShade),this.fill.color.setRGB(t.fill[0],t.fill[1],t.fill[2]),this.fill.groundColor.setRGB(t.fill[0]*.42,t.fill[1]*.34,t.fill[2]*.22),this.fill.intensity=t.fillI,this.envIntensity=t.env,this.envDirty=!0}bakeEnvironment(){this.cubeCamera.position.set(0,30,0),this.sky.envMesh.position.set(0,30,0),this.cubeCamera.update(this.renderer,this.sky.envScene);let e=this.pmrem.fromCubemap(this.cubeRT.texture);this.envRT&&this.envRT.dispose(),this.envRT=e,this.scene.environment=e.texture,this.scene.environmentIntensity=this.envIntensity,this.envDirty=!1}update(){this.envDirty&&this.bakeEnvironment()}},q=I.size/2+1,J=N.field,Ht=N.camp,Ut=N.pagoda,Y=N.shrine,Wt=N.cliff,Gt=18,Kt=class{constructor(e=1234){this.s1=new le(e),this.s2=new le(e+101),this.s3=new le(e+202),this.shrineTopY=Gt+Y.rise,this._noStairs=!0,this.pagodaY=null,this.pagodaY=this._pagodaTop(),this.stairsBaseY=this.height(Y.stairsBase.x,Y.stairsBase.z),this._noStairs=!1}_pagodaTop(){let e=this.pagodaY;this.pagodaY=null;let t=-1/0;for(let e=0;e<8;e++){let n=Ut.x+Math.cos(e)*6,r=Ut.z+Math.sin(e)*6;t=Math.max(t,this.height(n,r))}return this.pagodaY=e,t+1}height(e,t){let n=this.s1,r=this.s2,i=this.s3,a=22+n.fbm(e*.0023,t*.0023,5)*17;a+=r.fbm(e*.011+5.1,t*.011-2.3,3)*2.6;let o=i.fbm(e*.021+3.7,t*.021-8.1,3)*1.25+n.noise(e*.063+1.1,t*.063+4.4)*.32,s=Math.hypot(e-J.x,t-J.z),c=1-A(J.r*.5,J.r*1.08,s);if(c>0){let n=Gt+r.fbm(e*.0052+3.3,t*.0052-1.1,4)*4.6;a=L(a,n,c*.93)}a+=o;let l=A(J.r*.9,J.r*1.6,s)*(1-A(J.r*2.6,J.r*3.6,s));l>0&&(a+=l*(6+(n.ridged(e*.0065+2.2,t*.0065-5.5,4)*.18+(r.fbm(e*.005,t*.005,3)*.5+.5)*.82)*32));let u=Math.hypot(e-Ht.x,t-Ht.z),d=1-A(45,150,u);d>0&&(a=L(a,15+r.fbm(e*.012,t*.012,2)*1.4,d*.85));let f=e-Ut.x,p=t-Ut.z,m=Math.exp(-(p*p)/7200)*A(560,140,Math.abs(f));if(m>.002){let r=60+n.ridged(e*.0042+1.7,t*.0042,4)*26;a=Math.max(a,L(a,r,m))}if(this.pagodaY!==null){let e=1-A(15,32,Math.hypot(f,p));e>0&&(a=L(a,this.pagodaY,e))}let h=A(640,1050,-t+i.noise(e*.0025,7.7)*110),g=A(640,1050,e+i.noise(3.3,t*.0025)*110),_=Math.max(h,g);if(_>0){let r=A(1300,4200,Math.hypot(e,t)),i=n.fbm(e*.0015+3.1,t*.0015-1.7,5)*.5+.5,o=n.ridged(e*.0021,t*.0021,4),s=Math.max(0,.86*i+.14*o)**1.35;a+=_*(45+s*(170+260*r))}if(t>1150&&e>-900){let n=A(1300,2600,t)*A(-900,-300,e);a+=n*(50+(r.fbm(e*.0014+4.1,t*.0014,5)*.5+.5)**1.2*360)}let v=Math.hypot(e-Y.x,t-Y.z);if(v<Y.footRadius){let i=j((Y.footRadius-v)/(Y.footRadius-Y.topRadius)),o=i*i*(3-2*i),s=n.fbm(e*.021,t*.021,3)*3.2*Math.sin(Math.PI*i),c=this.shrineTopY+s;a+=(c-a)*o,v<Y.topRadius&&(a=this.shrineTopY+r.noise(e*.05,t*.05)*.12)}if(!this._noStairs){let n=Y.stairsBase.x,r=Y.stairsBase.z,i=Y.stairDir.x,o=Y.stairDir.z,s=e-n,c=t-r,l=Math.hypot(Y.stairsTop.x-n,Y.stairsTop.z-r),u=s*i+c*o,d=Math.abs(-s*o+c*i),f=Y.stairHalf+1.1;if(u>-8&&u<l+6&&d<f+10){let e=z(u/l,0,1),t=L(this.stairsBaseY,this.shrineTopY,e),n=1-A(f,f+10,d),r=A(-8,0,u)*(1-A(l,l+6,u));a=L(a,t,n*r)}}if(e<-420){let i=-700-e+r.fbm(t*.0042+9.1,e*.0042,4)*70;if(i>-140){let r=Math.hypot(e-Wt.x,t-Wt.z),o=1-A(70,280,r),s=1-A(-60,-4,i);a=L(a,Math.max(a,34+n.fbm(e*.02,t*.02,2)*3),o*s);let c=L(80,9,o),l=A(-c,0,i),u=L(a,1,l),d=A(0,L(110,30,o),i);a=L(u,-26,d)}}if(e<-2e3){let r=Math.hypot(e+3300,t-1500),i=Math.hypot(e+2800,t+1300),o=Math.hypot(e+5200,t-300),s=(e,t,n)=>e<t?(1-A(0,t,e))**1.5*n:0,c=s(r,700,190)+s(i,520,120)+s(o,1100,340);c>0&&(a=Math.max(a,-26+c+n.fbm(e*.003,t*.003,4)*30*(c>20)))}return a}seaward(e,t){return-700-e+this.s2.fbm(t*.0042+9.1,e*.0042,4)*70}generate(){let e=q,t=new Float32Array(e*e);for(let n=0;n<e;n++){let r=-I.half+n*2;for(let i=0;i<e;i++)t[n*e+i]=this.height(-I.half+i*2,r)}return this.H=t,this.pathD=this._pathDistance(),this._smoothPaths(),this._masks(),this}_smoothPaths(){let e=q,t=this.H,n=this.pathD,r=new Float32Array(t);for(let i=3;i<e-3;i++)for(let a=3;a<e-3;a++){let o=n[i*e+a];if(o>2.4)continue;let s=0,c=0;for(let t=-3;t<=3;t++)for(let n=-3;n<=3;n++){let o=1/(1+n*n+t*t);s+=r[(i+t)*e+(a+n)]*o,c+=o}let l=1-A(1,2.4,o);t[i*e+a]=r[i*e+a]+(s/c-.14-r[i*e+a])*l}}_pathDistance(){let e=q,t=new Float32Array(e*e).fill(1e9),n=(n,r)=>{let i=r+5;for(let a=0;a<n.length-1;a++){let o=n[a],s=n[a+1],c=Math.min(o.x,s.x)-i,l=Math.max(o.x,s.x)+i,u=Math.min(o.z,s.z)-i,d=Math.max(o.z,s.z)+i,f=Math.max(0,Math.floor((c+I.half)/2)),p=Math.min(e-1,Math.ceil((l+I.half)/2)),m=Math.max(0,Math.floor((u+I.half)/2)),h=Math.min(e-1,Math.ceil((d+I.half)/2)),g=s.x-o.x,_=s.z-o.z,v=g*g+_*_||1;for(let n=m;n<=h;n++){let i=-I.half+n*2;for(let a=f;a<=p;a++){let s=-I.half+a*2,c=j(((s-o.x)*g+(i-o.z)*_)/v),l=Math.hypot(s-(o.x+g*c),i-(o.z+_*c))/r,u=n*e+a;l<t[u]&&(t[u]=l)}}}};return F.forEach((e,t)=>n(e,me[t].width*.5)),n([Y.stairsBase,Y.stairsTop],Y.stairWidth*.5+.8),t}hAt(e,t){let n=q;return e=e<0?0:e>=n?n-1:e,t=t<0?0:t>=n?n-1:t,this.H[t*n+e]}heightAt(e,t){let n=(e+I.half)/2,r=(t+I.half)/2;if(n<0||r<0||n>=q-1||r>=q-1)return this.height(e,t);let i=Math.floor(n),a=Math.floor(r),o=n-i,s=r-a,c=q,l=this.H,u=l[a*c+i],d=l[a*c+i+1],f=l[(a+1)*c+i],p=l[(a+1)*c+i+1];return o+s<=1?u+(d-u)*o+(f-u)*s:p+(f-p)*(1-o)+(d-p)*(1-s)}heightAtGrid(e,t){let n=I.half-.01;return this.heightAt(e<-n?-n:e>n?n:e,t<-n?-n:t>n?n:t)}normalAt(e,t,n){let r=this.heightAt(e-2,t),i=this.heightAt(e+2,t),a=this.heightAt(e,t-2),o=this.heightAt(e,t+2),s=r-i,c=4,l=a-o,u=Math.hypot(s,c,l);return s/=u,c/=u,l/=u,n?(n.x=s,n.y=c,n.z=l,n):{x:s,y:c,z:l}}_masks(){let e=q,t=this.H,n=new Uint8Array(e*e*4),r=new Uint8Array(e*e*4),i=this.pathD,a=Math.hypot(Y.stairsTop.x-Y.stairsBase.x,Y.stairsTop.z-Y.stairsBase.z),o=this.s1,s=this.s2,c=this.s3;for(let l=0;l<e;l++){let u=-I.half+l*2;for(let d=0;d<e;d++){let f=-I.half+d*2,p=l*e+d,m=t[p],h=t[l*e+Math.max(0,d-1)],g=t[l*e+Math.min(e-1,d+1)],_=t[Math.max(0,l-1)*e+d],v=t[Math.min(e-1,l+1)*e+d],y=(g-h)/4,b=(v-_)/4,x=1/Math.sqrt(1+y*y+b*b),S=o.noise(f*.004+11.1,u*.004-3.2),C=s.noise(f*.011-7.3,u*.011+2.9),w=c.noise(f*.03+1.9,u*.03+8.8),ee=A(.68,.52,x+w*.04),T=i[p],E=1-A(.75,1.25,T+w*.12),te=f<-420?this.seaward(f,u):-1e3,ne=f<-420?A(3.2,1.4,m)*A(-70,-20,te)*(1-ee):0,D=f<-420?A(1.2,.2,m):0,re=+(m<.4),ie=Math.hypot(f-J.x,u-J.z),O=1-A(J.r*.62,J.r*.98,ie),ae=Math.hypot(f-Y.x,u-Y.z),oe=A(Y.topRadius+3,Y.topRadius+12,ae)*(1-A(Y.footRadius-20,Y.footRadius+25,ae)),k=Math.hypot(f-N.ginkgo.x,u-N.ginkgo.z),M=1-A(N.ginkgo.r*.5,N.ginkgo.r*1.1,k),se=Math.hypot(f-Ht.x,u-Ht.z),ce=A(Ht.r*.7,Ht.r*1.15,se),P=A(.05,.4,S+C*.25)*(1-O),le=A(.985,.93,x)*A(.78,.86,x)*(1-O);P=Math.max(P,le*A(-.45,.1,C)),P=Math.max(P,A(30,60,m)*(1-O)*A(-.2,.3,S+.2)),P=Math.max(P,A(70,140,m)*(1-O));let ue=A(J.r*1,J.r*1.55,ie);P=Math.max(P,ue*A(-.35,.15,C+S*.4)),P=Math.max(P,oe*A(-.5,.2,C+.3)),P=Math.max(P,M);let de=A(55,110,Math.hypot(f-Wt.x,u-Wt.z));P*=ce*de*(1-E)*(1-ne)*(1-re),P*=1-A(.55,.9,ee),P=j(P);let F=(1-ee*.95)*(1-E)*(1-ne)*(1-re);F*=1-P*.55,F*=A(.62,.8,x),F=j(F);let fe=s.noise(f*.0085+2.2,u*.0085-4.4)*.7+c.noise(f*.03,u*.03)*.3,L=A(-.35,.15,fe+O*.6)*(.45+.55*O);L*=F*(1-P*.8),L*=A(1.2,2.6,T);let pe=c.noise(f*.021+5.5,u*.021+1.1),me=A(1.35,1.8,T)*(1-A(2.2,4,T))*A(-.1,.35,C),he=Math.max(A(.52,.72,pe)*A(-.2,.3,S+.2)*(1-O*.75),me);he*=F*(1-L*.8);let R=f-Y.stairsBase.x,ge=u-Y.stairsBase.z,z=R*Y.stairDir.x+ge*Y.stairDir.z;if(z>-14&&z<a+14){let e=Math.abs(-R*Y.stairDir.z+ge*Y.stairDir.x);if(e<30){let t=A(-14,-4,z)*(1-A(a+4,a+14,z)),n=(1-A(Y.stairHalf+.7,Y.stairHalf+1.5,e))*t,r=(1-A(16,30,e))*t;F*=(1-n)*(1-.35*r),L*=(1-n)*(1-r),he*=(1-n)*(1-.8*r)}}let B=p*4;n[B]=Math.round(F*255),n[B+1]=Math.round(j(L)*255),n[B+2]=Math.round(j(he)*255),n[B+3]=Math.round(E*255),r[B]=Math.round(ee*255),r[B+1]=Math.round(P*255),r[B+2]=Math.round(ne*255),r[B+3]=Math.round(D*255)}}this.mask=n,this.surf=r}surfaceAt(e,t){let n=q,r=z((e+I.half)/2,0,n-1.001),i=z((t+I.half)/2,0,n-1.001),a=Math.floor(r),o=Math.floor(i),s=r-a,c=i-o,l=this.mask,u=this.surf,d=(o*n+a)*4,f=d+4,p=d+n*4,m=p+4,h=(e,t)=>{let n=e[d+t]+(e[f+t]-e[d+t])*s;return(n+(e[p+t]+(e[m+t]-e[p+t])*s-n)*c)/255};return{grass:h(l,0),pampas:h(l,1),flowers:h(l,2),path:h(l,3),rock:h(u,0),forest:h(u,1),sand:h(u,2),wet:h(u,3)}}bakeLighting(e,t=512){let n=new Uint8Array(t*t*4),r=I.size/t,i=Math.asin(z(e.y,-1,1)),a=Math.tan(Math.max(i,.005)),o=e.x,s=e.z,c=Math.hypot(o,s)||1,l=o/c,u=s/c,d=[];for(let e=0;e<8;e++)d.push([Math.cos(e/8*Math.PI*2),Math.sin(e/8*Math.PI*2)]);let f=[10,22,45,90,180],p=!this._ao,m=p?new Uint8Array(t*t):this._ao;for(let e=0;e<t;e++){let o=-I.half+(e+.5)*r;for(let s=0;s<t;s++){let c=-I.half+(s+.5)*r,h=this.heightAtGrid(c,o)+.6,g=1;if(i<=0)g=0;else{let e=3,t=1e9;for(let n=0;n<64&&e<3200;n++){let n=c+l*e,r=o+u*e,i=this.heightAtGrid(n,r),s=(h+e*a-i)/(e*.035+.6);if(s<t&&(t=s),t<-1.5)break;e*=1.075,e+=1.5}g=j(.5+t*.5),g=g*g*(3-2*g)}let _=(e*t+s)*4;if(n[_]=Math.round(g*255),p){let n=0;for(let[e,t]of d){let r=0;for(let n of f){let i=(this.heightAtGrid(c+e*n,o+t*n)-h+.6)/n;i>r&&(r=i)}n+=r/Math.sqrt(1+r*r)}m[e*t+s]=Math.round(j(1-n/d.length*1.1)*255)}n[_+1]=m[e*t+s],n[_+2]=0,n[_+3]=255}}return this._ao=m,{data:n,res:t}}};Be(`kaze_field`,`
#ifndef KAZE_FIELD
#define KAZE_FIELD
#include <kaze_common>
// autumn susuki blades: amber and bronze, not lemon (the lit field is a red-amber with brown shadows)
const vec3 KZ_TIP_GOLD   = vec3(0.66, 0.34, 0.12);
const vec3 KZ_TIP_STRAW  = vec3(0.72, 0.5, 0.25);
const vec3 KZ_TIP_GREEN  = vec3(0.22, 0.25, 0.065);
const vec3 KZ_TIP_BRONZE = vec3(0.5, 0.19, 0.07);
const vec3 KZ_BASE       = vec3(0.05, 0.042, 0.014);
// the dry thatch at the foot of a dense field: dead leaves and stems, amber-brown (never black soil)
const vec3 KZ_THATCH     = vec3(0.17, 0.1, 0.045);
// susuki plumes: a near-neutral silver that the golden light turns pink-gold (a cream albedo turned yellow)
const vec3 KZ_PLUME      = vec3(0.85, 0.78, 0.71);
const vec3 KZ_LILY       = vec3(0.64, 0.022, 0.018);

// large patches (x) and medium patches (y) of colour variation
vec2 kazeFieldVar(vec2 xz) {
  return vec2(kazeFbmLod(xz * 0.0019 + vec2(0.31, 0.93)), kazeFbmLod(xz * 0.0105 + vec2(0.71, 0.17)));
}
vec3 kazeGrassTip(vec2 xz, float rnd) {
  vec2 v = kazeFieldVar(xz);
  float golden = smoothstep(-0.75, -0.25, v.x + 0.1);
  float bronze = smoothstep(0.05, 0.45, v.y) * 0.6;
  float pale = smoothstep(0.2, 0.55, -v.y) * 0.5;
  vec3 tip = mix(KZ_TIP_GOLD, KZ_TIP_STRAW, rnd);
  tip = mix(tip, KZ_TIP_BRONZE, bronze);
  tip = mix(tip, KZ_TIP_STRAW * 1.1, pale);
  return mix(KZ_TIP_GREEN, tip, golden);
}
// average colour of a grass canopy as seen from afar (blade tips dominate), with pampas and lilies
vec3 kazeFieldCanopy(vec2 xz, vec4 mask) {
  vec3 c = mix(KZ_BASE * 1.6, kazeGrassTip(xz, 0.45), 0.5);
  // plume density follows pampas mask^0.35 in the grass layers (Grass.js)
  c = mix(c, KZ_PLUME * 0.82, pow(mask.g, 0.35) * 0.4);
  c = mix(c, KZ_LILY, mask.b * 0.42);
  return c;
}
#endif
`),Be(`kaze_lawn`,`
#ifndef KAZE_LAWN
#define KAZE_LAWN
uniform vec4 uLawn[4];
float kazeLawnAt(vec2 xz) {
  float l = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 z = uLawn[i];
    if (z.z <= 0.0) continue;
    l = max(l, (1.0 - smoothstep(z.z * 0.6, z.z, length(xz - z.xy))) * z.w);
  }
  return l;
}
#endif
`);var qt={textures:[],models:[],audio:[]};Be(`kaze_terrain`,`
#ifndef KAZE_TERRAIN
#define KAZE_TERRAIN
uniform highp sampler2D uTerrainHeight;
uniform highp sampler2D uTerrainHeightL;
uniform sampler2D uTerrainMask;
uniform sampler2D uTerrainSurf;
uniform sampler2D uTerrainLight;
const float KZ_HALF = ${I.half.toFixed(1)};
const float KZ_CELL = ${2 .toFixed(1)};
const float KZ_N = ${q.toFixed(1)};
float kazeTerrainHeight(vec2 xz) {
  vec2 f = clamp((xz + KZ_HALF) / KZ_CELL, vec2(0.0), vec2(KZ_N - 1.001));
  ivec2 i = ivec2(floor(f));
  vec2 t = f - vec2(i);
  float h00 = texelFetch(uTerrainHeight, i, 0).r;
  float h10 = texelFetch(uTerrainHeight, i + ivec2(1, 0), 0).r;
  float h01 = texelFetch(uTerrainHeight, i + ivec2(0, 1), 0).r;
  float h11 = texelFetch(uTerrainHeight, i + ivec2(1, 1), 0).r;
  if (t.x + t.y <= 1.0) return h00 + (h10 - h00) * t.x + (h01 - h00) * t.y;
  return h11 + (h01 - h11) * (1.0 - t.x) + (h10 - h11) * (1.0 - t.y);
}
vec2 kazeTerrainUV(vec2 xz) { return ((xz + KZ_HALF) / KZ_CELL + 0.5) / KZ_N; }
// one filtered fetch (half float): ~cm accuracy in the lowlands, for dense vegetation
float kazeTerrainHeightFast(vec2 xz) { return textureLod(uTerrainHeightL, kazeTerrainUV(xz), 0.0).r; }
vec4 kazeTerrainMask(vec2 xz) { return textureLod(uTerrainMask, kazeTerrainUV(xz), 0.0); }
vec4 kazeTerrainSurf(vec2 xz) { return textureLod(uTerrainSurf, kazeTerrainUV(xz), 0.0); }
vec4 kazeTerrainLight(vec2 xz) { return textureLod(uTerrainLight, (xz + KZ_HALF) / (2.0 * KZ_HALF), 0.0); }
#endif
`);var Jt=`
#include <kaze_field>
#include <kaze_terrain>
#include <kaze_atmosphere>
#include <kaze_wind>
varying vec3 vTerrainWorld;
#ifdef KAZE_TERRAIN_PHOTO
uniform sampler2D uTexGrass;
uniform sampler2D uTexDirt;
uniform sampler2D uTexRock;
uniform vec3 uTexAvg[3];
#endif
float kzRough = 0.9;
float kzAO = 1.0;
float kzSunVis = 1.0;
// grazed lawns (Grass.setLawn, shared uniform): olive turf instead of the field's dry golden thatch
#include <kaze_lawn>
float kzCanopy = 0.0;
vec3 kzCanopyTrans = vec3(0.0);
vec3 kzSunDirV = vec3(0.0, 1.0, 0.0);

// autumn forest seen from afar: a crown-scale mottle of evergreen, maple red and ginkgo gold
vec3 kazeForestCanopy(vec2 xz) {
  float region = kazeFbm(xz * 0.0031 + vec2(7.1, 2.2));        // broad stands (more red in some valleys)
  float crown = kazeFbm(xz * 0.061 + vec2(2.3, 5.5));          // individual crowns (~15 m)
  float crown2 = kazeFbm(xz * 0.17 + vec2(9.1, 0.4));
  vec3 pine = vec3(0.02, 0.036, 0.018);
  vec3 maple = vec3(0.24, 0.04, 0.018);
  vec3 ginkgo = vec3(0.3, 0.17, 0.025);
  float redShare = mix(0.18, 0.45, smoothstep(-0.3, 0.4, region));
  float t = crown * 0.5 + 0.5;
  vec3 c = pine;
  c = mix(c, maple, smoothstep(1.0 - redShare - 0.08, 1.0 - redShare + 0.08, t));
  c = mix(c, ginkgo, smoothstep(0.62, 0.8, crown2 * 0.5 + 0.5) * 0.55);
  return c * (0.7 + 0.5 * (crown2 * 0.5 + 0.5));
}

vec3 kzPerturb(vec3 surfPos, vec3 surfNorm, float h) {
  vec3 sx = dFdx(surfPos), sy = dFdy(surfPos);
  vec3 r1 = cross(sy, surfNorm), r2 = cross(surfNorm, sx);
  float det = dot(sx, r1);
  vec2 dh = vec2(dFdx(h), dFdy(h));
  vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
  return normalize(abs(det) * surfNorm - grad);
}

#ifdef KAZE_TERRAIN_PHOTO
vec3 kzTri(sampler2D tex, vec3 p, vec3 n, float scale) {
  vec3 w = pow(abs(n), vec3(4.0));
  w /= (w.x + w.y + w.z);
  return texture2D(tex, p.zy * scale).rgb * w.x + texture2D(tex, p.xz * scale).rgb * w.y + texture2D(tex, p.xy * scale).rgb * w.z;
}
#endif
`,Yt=`
  vec2 kxz = vTerrainWorld.xz;
  float kdist = distance(vTerrainWorld, cameraPosition);
  vec3 kWN = normalize(transpose(mat3(viewMatrix)) * normalize(vNormal));
  float n1 = kazeFbm(kxz * 0.043);
  float n2 = kazeFbm(kxz * 0.31 + vec2(3.7, 1.9));
  // fine detail only where it can be resolved (saves fetches on the far half of the screen)
  float n3 = 0.0;
  if (kdist < 120.0) n3 = kazeFbm(kxz * 1.9 + vec2(1.3, 7.7));
#ifdef KAZE_TERRAIN_FAR
  vec4 kmask = vec4(0.0);
  float slopeRock = smoothstep(0.62, 0.48, kWN.y);
  float coastSand = smoothstep(4.0, 1.5, vTerrainWorld.y) * (1.0 - slopeRock);
  vec4 ksurf = vec4(slopeRock, (1.0 - slopeRock) * smoothstep(3.0, 12.0, vTerrainWorld.y), coastSand, 0.0);
  vec4 klit = vec4(1.0);
#else
  vec4 kmask = texture(uTerrainMask, kazeTerrainUV(kxz));
  vec4 ksurf = texture(uTerrainSurf, kazeTerrainUV(kxz));
  vec4 klit = texture(uTerrainLight, (kxz + KZ_HALF) / (2.0 * KZ_HALF));
#endif
  // matted dry grass / soil under the blades
  vec3 soil = mix(vec3(0.034, 0.025, 0.015), vec3(0.062, 0.046, 0.027), n2 * 0.5 + 0.5);
  vec3 kcol = soil * 1.2;
  vec3 canopy = vec3(0.0);
  float clumps = 0.5;
  float canopyT = smoothstep(10.0, 70.0, kdist);
  if (kmask.r > 0.004) {
    // thatch: matted stems and dead blades as a soft mottle (the fine detail comes from the blades drawn over it)
    float thatch = 0.5 + 0.35 * n3 * (1.0 - smoothstep(20.0, 60.0, kdist));
    // canopy texture: wind-combed clumps with dark gaps (keeps distant fields from reading as sand)
    if (kdist < 450.0) {
      vec2 comb = vec2(kxz.x * 0.9 + kxz.y * 0.35, kxz.y * 0.28 - kxz.x * 0.12);
      float clumpA = kazeFbm(comb * 0.55 + vec2(1.3, 0.2)) * 0.5 + 0.5;
      clumps = mix(0.5, clumpA, 1.0 - smoothstep(150.0, 450.0, kdist));
    }
    float clumpB = kazeFbm(kxz * 0.12 + vec2(0.4, 3.3)) * 0.5 + 0.5;
    float canopyShade = mix(0.5, 1.12, clumps) * mix(0.8, 1.1, clumpB);
    canopy = kazeFieldCanopy(kxz, kmask) * (0.62 + 0.3 * (n1 * 0.5 + 0.5)) * canopyShade;
    // olive hollows and rust drifts at the 50–200 m scale
    float hollow = smoothstep(0.1, 0.6, kazeFbm(kxz * 0.007 + vec2(5.1, 2.7)));
    canopy = mix(canopy, canopy * vec3(0.62, 0.8, 0.5), hollow * 0.55);
    // under the blades: the field's dead thatch, in tone with the foot of the stems (Grass.js), never bare soil
    vec3 dryMat = mix(KZ_THATCH * mix(0.75, 1.1, thatch) * (0.9 + 0.1 * n2), canopy * 0.7, 0.3);
    vec3 grassCol = mix(dryMat, canopy * 0.86, canopyT);
    kcol = mix(kcol, grassCol, kmask.r);
  }
  float kzLawnF = kmask.r > 0.004 ? kazeLawnAt(kxz) : 0.0;
  if (kzLawnF > 0.001) {
    // olive turf
    vec3 turf = mix(vec3(0.075, 0.1, 0.026), vec3(0.14, 0.16, 0.045), n2 * 0.5 + 0.5) * (0.85 + 0.3 * n3);
    kcol = mix(kcol, turf, kzLawnF * kmask.r * (1.0 - kmask.a));
  }
  // packed-earth path with ruts and pebbles
  vec3 pathCol = mix(vec3(0.27, 0.2, 0.125), vec3(0.4, 0.31, 0.19), n3 * 0.5 + 0.5) * (0.85 + 0.25 * n2);
  kcol = mix(kcol, pathCol, kmask.a);
  // forest floor (red leaf litter) near, autumn forest canopy far
  if (ksurf.g > 0.004) {
    vec3 forestFloor = mix(vec3(0.045, 0.03, 0.017), vec3(0.15, 0.045, 0.02), smoothstep(0.05, 0.6, n2));
    float forestFarT = smoothstep(260.0, 800.0, kdist);
    vec3 forestCol = forestFloor;
    if (forestFarT > 0.0) forestCol = mix(forestFloor, kazeForestCanopy(kxz), forestFarT);
    kcol = mix(kcol, forestCol, ksurf.g * (0.7 + 0.3 * forestFarT));
  }
  // rock with moss on up-facing surfaces; trees cling to all but the sheerest faces
  if (ksurf.r > 0.004) {
    vec3 rockCol = mix(vec3(0.07, 0.065, 0.058), vec3(0.15, 0.135, 0.11), n2 * 0.5 + 0.5) * (0.78 + 0.3 * n3);
    rockCol = mix(rockCol, vec3(0.05, 0.07, 0.025), smoothstep(0.55, 0.95, kWN.y) * (0.35 + 0.35 * n1));
    kcol = mix(kcol, rockCol, ksurf.r * mix(1.0, 0.55, ksurf.g * smoothstep(300.0, 700.0, kdist)));
  }
  // beach sand, darker when wet
  vec3 sandCol = mix(vec3(0.42, 0.37, 0.28), vec3(0.2, 0.18, 0.15), ksurf.a);
  kcol = mix(kcol, sandCol, ksurf.b);
#ifdef KAZE_TERRAIN_PHOTO
  float photoT = 1.0 - smoothstep(25.0, 90.0, kdist);
  if (photoT > 0.001) {
    vec3 tg = texture2D(uTexGrass, kxz * 0.33).rgb / max(uTexAvg[0], vec3(0.02));
    vec3 td = texture2D(uTexDirt, kxz * 0.4).rgb / max(uTexAvg[1], vec3(0.02));
    vec3 tr = kzTri(uTexRock, vTerrainWorld, kWN, 0.17) / max(uTexAvg[2], vec3(0.02));
    vec3 detail = mix(tg, td, max(kmask.a, 1.0 - kmask.r));
    detail = mix(detail, tr, ksurf.r);
    kcol *= mix(vec3(1.0), clamp(detail, 0.2, 2.5), photoT);
  }
#endif
  diffuseColor.rgb = kcol;
  kzRough = mix(0.93, 0.86, kmask.a);
  kzRough = mix(kzRough, 0.78, ksurf.r);
  kzRough = mix(kzRough, mix(0.85, 0.35, ksurf.a), ksurf.b);
  kzAO = mix(1.0, klit.g, 0.6);
  // baked heightfield shadows only beyond the shadow-map range (4 m texels are too coarse up close)
  kzSunVis = mix(1.0, klit.r, smoothstep(110.0, 220.0, kdist));
  // the ground between dense blades sits in their shade (but light still filters through the thatch)
  float under = kmask.r * (1.0 - canopyT) * (1.0 - kmask.a) * (1.0 - 0.8 * kzLawnF);
  kzAO *= mix(1.0, 0.7, under);
  kzSunVis *= mix(1.0, 0.8, under);
  // grass canopy: wrap lighting + translucency so fields glow toward the sun like the blades (half strength on
  // the near thatch, whose blades are drawn)
  kzCanopy = kmask.r * (1.0 - kmask.a) * (1.0 - ksurf.r) * (1.0 - ksurf.g * 0.8) * mix(0.5, 1.0, smoothstep(8.0, 60.0, kdist)) * (1.0 - 0.8 * kzLawnF);
  kzCanopyTrans = canopy * vec3(1.0, 0.82, 0.55) * 0.5 * clumps;
  if (kzCanopy > 0.01) {
    // travelling gust fronts keep rolling across the fields beyond the grass rings (the blades' sheen ramp)
    float gw = smoothstep(0.35, 0.9, kazeGust(kxz));
    diffuseColor.rgb *= 1.0 + gw * 0.6 * kzCanopy;
    kzCanopyTrans *= 1.0 + gw * 0.8;
  }
  kzSunDirV = normalize((viewMatrix * vec4(uSunDir, 0.0)).xyz);
`,Xt=`
  {
    float fade1 = 1.0 - smoothstep(25.0, 110.0, kdist);
    float fade2 = 1.0 - smoothstep(120.0, 600.0, kdist);
    float bump = n1 * 0.42 * fade2 + n2 * 0.07 * fade1 + n3 * 0.025 * fade1;
    bump *= mix(1.0, 3.5, ksurf.r);
#ifndef KAZE_TERRAIN_FAR
    // tree crowns: lumpy canopy relief on distant forest
    float crownW = ksurf.g * smoothstep(120.0, 400.0, kdist) * (1.0 - smoothstep(1400.0, 2400.0, kdist));
    if (crownW > 0.001) bump += (kazeFbm(kxz * 0.09 + vec2(4.4, 1.2)) * 3.2 + kazeFbm(kxz * 0.23) * 1.1) * crownW;
#endif
    normal = kzPerturb(-vViewPosition, normal, bump);
    // grass-covered ground is lit like a canopy: blades, not the soil's micro-slopes, catch the light
    vec3 upV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
    normal = normalize(mix(normal, upV, kmask.r * (1.0 - kmask.a) * 0.65));
  }
`,Zt=`
#undef RE_Direct
void RE_Direct_Terrain(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  IncidentLight l = directLight;
  if (dot(l.direction, kzSunDirV) > 0.9995) l.color *= kzSunVis;
  if (kzCanopy > 0.001) {
    float NoL = dot(geometryNormal, l.direction);
    float wrap = clamp((NoL + 0.55) / 1.55, 0.0, 1.0);
    reflectedLight.directDiffuse += l.color * BRDF_Lambert(material.diffuseContribution) * max(wrap - max(NoL, 0.0), 0.0) * kzCanopy * 0.55;
    float back = pow(clamp(dot(-geometryViewDir, l.direction), 0.0, 1.0), 3.0);
    reflectedLight.directDiffuse += l.color * kzCanopyTrans * back * kzCanopy * 0.9;
  }
  RE_Direct_Physical(l, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight);
}
#define RE_Direct RE_Direct_Terrain
`;function Qt(e,t){let n=new s({color:16777215,roughness:.9,metalness:0,envMapIntensity:.72});return n.userData.shaderKey=`terrain`+(e?`-far`:``)+(t?`-photo`:``),n.defines={},e&&(n.defines.KAZE_TERRAIN_FAR=``),t&&(n.defines.KAZE_TERRAIN_PHOTO=``),n.userData.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vTerrainWorld;`).replace(`#include <project_vertex>`,`#include <project_vertex>
  vTerrainWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+Jt).replace(`#include <color_fragment>`,`#include <color_fragment>
`+Yt).replace(`#include <roughnessmap_fragment>`,`float roughnessFactor = kzRough;`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
`+Xt).replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
`+Zt).replace(`#include <aomap_fragment>`,`#include <aomap_fragment>
  reflectedLight.indirectDiffuse *= kzAO * mix(vec3(1.0), vec3(1.12, 0.96, 0.78), kmask.r);
  reflectedLight.indirectSpecular *= kzAO * mix(0.3, 0.6, ksurf.r);
  reflectedLight.directSpecular *= mix(0.45, 1.0, ksurf.r);`)},n}var $t=class{constructor({seed:e=1234,quality:t}){this.quality=t,this.gen=new Kt(e).generate(),this.size=I.size,this.half=I.half,this.group=new E,this.group.name=`terrain`;let n=q;this.heightTexture=new p(this.gen.H,n,n,O,pe),this.heightTexture.minFilter=this.heightTexture.magFilter=S,this.heightTexture.generateMipmaps=!1,this.heightTexture.needsUpdate=!0;let r=new Uint16Array(n*n);for(let e=0;e<n*n;e++)r[e]=y.toHalfFloat(this.gen.H[e]);this.heightTextureLinear=new p(r,n,n,O,v),this.heightTextureLinear.minFilter=this.heightTextureLinear.magFilter=B,this.heightTextureLinear.generateMipmaps=!1,this.heightTextureLinear.needsUpdate=!0;let i=e=>{let t=new p(e,n,n,a,l);return t.minFilter=oe,t.magFilter=B,t.generateMipmaps=!0,t.colorSpace=``,t.needsUpdate=!0,t};this.maskTexture=i(this.gen.mask),this.surfTexture=i(this.gen.surf),this.lightTexture=new p(new Uint8Array(16).fill(255),2,2),this.lightTexture.needsUpdate=!0,this.uniforms=ze({uTerrainHeight:{value:this.heightTexture},uTerrainHeightL:{value:this.heightTextureLinear},uTerrainMask:{value:this.maskTexture},uTerrainSurf:{value:this.surfTexture},uTerrainLight:{value:this.lightTexture}}),this.material=Qt(!1,!1),this.farMaterial=Qt(!0,!1),this._buildChunks(),this._buildFarRing()}heightAt(e,t){return this.gen.heightAt(e,t)}normalAt(e,t,n=new k){return this.gen.normalAt(e,t,n)}surfaceAt(e,t){return this.gen.surfaceAt(e,t)}bakeLighting(e){let{data:t,res:n}=this.gen.bakeLighting(e,512);!this._lightTex||this._lightTex.image.width!==n?(this._lightTex=new p(t,n,n,a,l),this._lightTex.minFilter=B,this._lightTex.magFilter=B,this._lightTex.generateMipmaps=!1,this._lightTex.colorSpace=``,this.uniforms.uTerrainLight.value=this._lightTex):this._lightTex.image.data.set(t),this._lightTex.needsUpdate=!0}async loadPhotoTextures(e){let t=[`ground_grass`,`ground_dirt`,`rock_moss`];if(!t.every(e=>qt.textures.includes(e+`.jpg`)))return!1;let n=new i,r=await Promise.all(t.map(e=>new Promise(t=>{n.load(`assets/textures/${e}.jpg`,e=>t(e),void 0,()=>t(null))})));if(r.some(e=>!e))return!1;let a=r.map(t=>{t.wrapS=t.wrapT=x,t.colorSpace=g,t.anisotropy=Math.min(8,e.capabilities.getMaxAnisotropy()),t.needsUpdate=!0;let n=document.createElement(`canvas`);n.width=n.height=16;let r=n.getContext(`2d`);r.drawImage(t.image,0,0,16,16);let i=r.getImageData(0,0,16,16).data,a=[0,0,0];for(let e=0;e<i.length;e+=4)for(let t=0;t<3;t++)a[t]+=(i[e+t]/255)**2.2;return new k(a[0]/256,a[1]/256,a[2]/256)}),o=Qt(!1,!0),s=o.userData.onBeforeCompile;return o.userData.onBeforeCompile=(e,t)=>{s(e,t),e.uniforms.uTexGrass={value:r[0]},e.uniforms.uTexDirt={value:r[1]},e.uniforms.uTexRock={value:r[2]},e.uniforms.uTexAvg={value:a}},this._swapMaterial(this.material,o),this.material=o,!0}_swapMaterial(e,t){this.group.traverse(n=>{n.isMesh&&n.material===e&&(n.material=t)}),this.onMaterialSwap&&this.onMaterialSwap(t)}_buildChunks(){let e=I.size/16,t=e/2,n=[{step:1,skirt:5},{step:4,skirt:14}],r=new Map,i=this.gen,a=q,s=(e,t,n,r)=>{let a=i.hAt(e-1,t),o=i.hAt(e+1,t),s=i.hAt(e,t-1),c=i.hAt(e,t+1),l=a-o,u=s-c,d=Math.hypot(l,4,u);n[r]=l/d,n[r+1]=4/d,n[r+2]=u/d},c=e=>{if(r.has(e))return r.get(e);let t=e+1,n=[];for(let r=0;r<e;r++)for(let i=0;i<e;i++){let e=r*t+i,a=e+1,o=e+t,s=o+1;n.push(e,o,a,o,s,a)}let i=t*t,a=[];for(let t=0;t<=e;t++)a.push([t,0]);for(let t=0;t<=e;t++)a.push([e,t]);for(let t=e;t>=0;t--)a.push([t,e]);for(let t=e;t>=0;t--)a.push([0,t]);for(let e=0;e<a.length-1;e++){let[r,o]=a[e],[s,c]=a[e+1];if(r===s&&o===c)continue;let l=o*t+r,u=c*t+s,d=i+e,f=i+e+1;n.push(l,d,u,u,d,f,l,u,d,u,f,d)}let o={idx:n,edges:a};return r.set(e,o),o};this.chunks=[];for(let r=0;r<16;r++)for(let l=0;l<16;l++){let u=l*t,d=r*t,f=-I.half+(l+.5)*e,p=-I.half+(r+.5)*e,m=new re;m.position.set(f,0,p),m.name=`chunk_${l}_${r}`;for(let e=0;e<n.length;e++){let{step:r,skirt:l}=n[e],h=t/r,g=h+1,{idx:_,edges:v}=c(h),y=g*g+v.length,x=new Float32Array(y*3),S=new Float32Array(y*3);for(let e=0;e<=h;e++)for(let t=0;t<=h;t++){let n=u+t*r,o=d+e*r,c=e*g+t;x[c*3]=-I.half+n*2-f,x[c*3+1]=i.H[Math.min(a-1,o)*a+Math.min(a-1,n)],x[c*3+2]=-I.half+o*2-p,s(n,o,S,c*3)}for(let e=0;e<v.length;e++){let[t,n]=v[e],r=n*g+t,i=g*g+e;x[i*3]=x[r*3],x[i*3+1]=x[r*3+1]-l,x[i*3+2]=x[r*3+2],S[i*3]=S[r*3],S[i*3+1]=S[r*3+1],S[i*3+2]=S[r*3+2]}let C=new o;C.setAttribute(`position`,new b(x,3)),C.setAttribute(`normal`,new b(S,3)),C.setIndex(_),C.computeBoundingSphere(),C.computeBoundingBox();let w=new V(C,this.material);w.castShadow=e===0,w.receiveShadow=!0,w.matrixAutoUpdate=!1,w.updateMatrix(),m.addLevel(w,e===0?0:this.quality.terrainLodDist)}m.updateMatrix(),this.group.add(m),this.chunks.push(m)}}_buildFarRing(){let e=this.gen,t=7168,n=new Float32Array(151875),r=new Float32Array(151875);for(let t=0;t<=224;t++)for(let i=0;i<=224;i++){let a=-7168+i*64,o=-7168+t*64,s=t*225+i,c=Math.abs(a)<=I.half&&Math.abs(o)<=I.half?e.heightAt(a,o):e.height(a,o);n[s*3]=a,n[s*3+1]=c,n[s*3+2]=o;let l=e.height(a-48,o),u=e.height(a+48,o),d=e.height(a,o-48),f=e.height(a,o+48),p=l-u,m=d-f,h=Math.hypot(p,96,m);r[s*3]=p/h,r[s*3+1]=96/h,r[s*3+2]=m/h}let i=[];for(let e=0;e<224;e++)for(let t=0;t<224;t++){let n=-7168+t*64,r=-7168+e*64;if(n>=-I.half&&n+64<=I.half&&r>=-I.half&&r+64<=I.half)continue;let a=e*225+t,o=a+1,s=a+225,c=s+1;i.push(a,s,o,s,c,o)}let a=[],s=(t-I.half)/64,c=(t+I.half)/64;for(let e=s;e<=c;e++)a.push([e,s]);for(let e=s+1;e<=c;e++)a.push([c,e]);for(let e=c-1;e>=s;e--)a.push([e,c]);for(let e=c-1;e>=s;e--)a.push([s,e]);let l=new Float32Array(a.length*3),u=new Float32Array(a.length*3);a.forEach(([e,t],i)=>{let a=t*225+e;l[i*3]=n[a*3],l[i*3+1]=n[a*3+1]-90,l[i*3+2]=n[a*3+2],u[i*3]=r[a*3],u[i*3+1]=r[a*3+1],u[i*3+2]=r[a*3+2]});let d=50625;for(let e=0;e<a.length-1;e++){let t=a[e][1]*225+a[e][0],n=a[e+1][1]*225+a[e+1][0],r=d+e,o=d+e+1;i.push(t,r,n,n,r,o,t,n,r,n,o,r)}let f=new Float32Array(n.length+l.length);f.set(n),f.set(l,n.length);let p=new Float32Array(r.length+u.length);p.set(r),p.set(u,r.length);let m=new o;m.setAttribute(`position`,new b(f,3)),m.setAttribute(`normal`,new b(p,3)),m.setIndex(i),m.computeBoundingSphere();let h=new V(m,this.farMaterial);h.name=`terrain_far`,h.receiveShadow=!1,h.castShadow=!1,h.frustumCulled=!1,this.far=h,this.group.add(h)}},en=`
#include <kaze_common>
#include <kaze_terrain>
#include <kaze_wind>
varying vec3 vWaterWorld;
float kzWaterRough = 0.08;
vec3 kzPerturbW(vec3 surfPos, vec3 surfNorm, float h) {
  vec3 sx = dFdx(surfPos), sy = dFdy(surfPos);
  vec3 r1 = cross(sy, surfNorm), r2 = cross(surfNorm, sx);
  float det = dot(sx, r1);
  vec2 dh = vec2(dFdx(h), dFdy(h));
  vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
  return normalize(abs(det) * surfNorm - grad);
}
// The waves drift downwind by uWaveDrift, the wind's own travel integrated over time: a heading that turns (the guiding
// wind) never moves the whole sea, as heading × clock did.
float kzWaves(vec2 p) {
  float w = kazeFbm(p * 0.018 + uWaveDrift * 0.012) * 0.55;
  w += kazeFbm(p * 0.061 - uWaveDrift.yx * 0.03 + vec2(0.3, 0.7)) * 0.3;
  w += kazeFbm(p * 0.23 + uWaveDrift * 0.06 + vec2(0.9, 0.1)) * 0.15;
  return w;
}
`,tn=`
  vec2 wxz = vWaterWorld.xz;
  float wdist = distance(vWaterWorld, cameraPosition);
  float ground = (abs(wxz.x) < KZ_HALF && abs(wxz.y) < KZ_HALF) ? kazeTerrainHeight(wxz) : -40.0;
  float depth = max(0.0, ${D.level.toFixed(1)} - ground);
  vec3 deep = vec3(0.006, 0.026, 0.045);
  vec3 shallow = vec3(0.04, 0.13, 0.12);
  vec3 wcol = mix(shallow, deep, smoothstep(0.0, 14.0, depth));
  float foamN = kazeFbm(wxz * 0.35 + vec2(uTime * 0.05, 0.0)) * 0.5 + 0.5;
  float foam = (1.0 - smoothstep(0.0, 1.4, depth)) * smoothstep(0.35, 0.75, foamN + 0.25 * sin(uTime * 1.3 + depth * 5.0));
  wcol = mix(wcol, vec3(0.65, 0.66, 0.63), foam * 0.8);
  diffuseColor.rgb = wcol;
  kzWaterRough = mix(0.045, 0.2, smoothstep(40.0, 2500.0, wdist));
  kzWaterRough = mix(kzWaterRough, 0.7, foam);
`,nn=`
  {
    float amp = mix(0.32, 0.05, smoothstep(30.0, 1800.0, wdist));
    normal = kzPerturbW(-vViewPosition, normal, kzWaves(wxz) * amp);
  }
`,rn=class{constructor(){let e=new s({color:664112,roughness:.08,metalness:0});e.userData.shaderKey=`water`,e.userData.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vWaterWorld;`).replace(`#include <project_vertex>`,`#include <project_vertex>
  vWaterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+en).replace(`#include <color_fragment>`,`#include <color_fragment>
`+tn).replace(`#include <roughnessmap_fragment>`,`float roughnessFactor = kzWaterRough;`).replace(`#include <normal_fragment_maps>`,`#include <normal_fragment_maps>
`+nn)},this.material=e;let t=new m(4e4,4e4,1,1);t.rotateX(-Math.PI/2),this.mesh=new V(t,e),this.mesh.position.y=D.level,this.mesh.receiveShadow=!0,this.mesh.name=`sea`,this.mesh.frustumCulled=!1}update(e){this.mesh.position.x=Math.round(e.position.x/256)*256,this.mesh.position.z=Math.round(e.position.z/256)*256}},an=[{r:3300,depth:1500,peak:350,from:205,to:322,seed:5.3,freq:14,round:2,cols:720},{r:5700,depth:2300,peak:670,from:200,to:330,seed:3.1,freq:10,round:1.8,cols:540},{r:9300,depth:3200,peak:1180,from:195,to:336,seed:7.7,freq:7,round:1.4,cols:420},{r:14500,depth:4200,peak:1980,from:190,to:342,seed:1.9,freq:5,round:1.1,cols:360}],on={az:260,half:11,floor:.12};function sn(e,t,n=1){let r=0,i=1,a=1,o=0;for(let s=0;s<5;s++){let c=Math.sin(e*a+t*(s+1)*1.7)*.6+Math.sin(e*a*1.618+t*3.3+s)*.4;r+=(1-Math.abs(c)**+n)*i,o+=i,i*=.5,a*=2.13}return r/o}function cn(e,t,n=10){let r=e.cols||360,i=new Float32Array((r+1)*(n+1)*3),a=Math.PI/180,s=0;for(let o=0;o<=r;o++){let c=e.from+(e.to-e.from)*o/r,l=c*a,u=o/r,d=Math.min(1,u*6,(1-u)*6),f=t?t.floor+(1-t.floor)*M.smoothstep(Math.abs(c-t.az),0,t.half):1,p=sn(u*e.freq,e.seed,e.round||1),m=e.peak*(.3+.7*p**1.6)*(.35+.65*d)*f,h=Math.sin(l),g=-Math.cos(l);for(let t=0;t<=n;t++){let r=t/n,a=e.r+(r-.5)*e.depth,o=r<.45?Math.sin(r/.45*Math.PI*.5)**.9:Math.cos((r-.45)/.55*Math.PI*.5)**1.3,c=sn(u*e.freq*3.1+r*2,e.seed+5)*.22;i[s++]=h*a,i[s++]=-30+m*o*(.85+c),i[s++]=g*a}}let c=[];for(let e=0;e<r;e++)for(let t=0;t<n;t++){let r=e*(n+1)+t,i=r+n+1;c.push(r,i,r+1,i,i+1,r+1)}let l=new o;return l.setAttribute(`position`,new b(i,3)),l.setIndex(c),l.computeVertexNormals(),l}var ln=class{constructor(e=an,t=on){this.group=new E,this.group.name=`backdrop`,this.material=new _e({color:new h(.035,.04,.05)});for(let n of e){let e=new V(cn(n,t),this.material);e.castShadow=!1,e.receiveShadow=!1,e.matrixAutoUpdate=!1,this.group.add(e)}}},un=e=>Number.isInteger(e)?e.toFixed(1):String(e),dn=`
#define KZ_BLADE_ARC_MAX ${un(1.5)}
#define KZ_BLADE_ARC_GAIN ${un(2.1)}
void kzBladeArc(float bend, float t, out float reach, out float rise, out vec2 dir) {
  float a = max(KZ_BLADE_ARC_MAX * tanh(KZ_BLADE_ARC_GAIN * bend / KZ_BLADE_ARC_MAX), 1e-4);
  float h = 0.5 * a * t;
  float sh = sin(h), ch = cos(h);
  reach = 2.0 * sh * sh / a;
  rise = 2.0 * sh * ch / a;
  dir = vec2(2.0 * sh * ch, 1.0 - 2.0 * sh * sh);
}
`,fn=`
#define KZ_STALK_MAX_BEND ${un(.6)}
float kzStalkBend(float d) { return KZ_STALK_MAX_BEND * tanh(d / KZ_STALK_MAX_BEND); }
`,pn=`
#define KZ_LENS_FAR ${un(3.6)}
#define KZ_LENS_DOWN ${un(.9)}
#define KZ_LENS_SPAN_FROM ${un(.4)}
#define KZ_LENS_SPAN_TO ${un(.6)}
float kzPlumeLens(vec3 c) {
  float r = mix(KZ_LENS_FAR, KZ_LENS_DOWN, smoothstep(0.18, 0.45, -c.y / max(length(c.xz), 0.1)));
  return smoothstep(0.55 * r, r, length(c));
}
float kzPlumeSpan(float plumeL, float nearest) {
  float span = plumeL * projectionMatrix[1][1] / (2.0 * max(nearest, 0.05));
  return 1.0 - smoothstep(KZ_LENS_SPAN_FROM, KZ_LENS_SPAN_TO, span);
}
float kzPlantLens(vec3 c0, vec3 C, vec3 E, float plumeL) {
  vec3 c1 = c0 + 0.5 * C + 0.25 * E;
  vec3 c2 = c0 + E;
  float lens = min(kzPlumeLens(c0), min(kzPlumeLens(c1), kzPlumeLens(c2)));
  return lens * kzPlumeSpan(plumeL, min(length(c0), min(length(c1), length(c2))));
}
`,mn=ze({uPlayer:{value:new R(0,-1e3,0,.9)},uPlumeGlow:{value:new h(.35,.3,.3)},uTrample:{value:Array.from({length:8},()=>new R(0,0,0,0))},uLawn:{value:Array.from({length:4},()=>new R(0,0,0,0))},uGrassView:{value:new R(0,-1,-1,0)}}),hn=new k,gn=`
#include <kaze_common>
#include <kaze_wind>
#include <kaze_terrain>
#include <kaze_field>
attribute vec2 aOffset;
uniform vec3 uGrassCenter;
uniform vec4 uGrassPatch;   // x patch size, y inner radius, z outer radius, w density scale
uniform vec4 uGrassShape;   // x height scale, y width scale, z far keep fraction, w pixel angle
uniform float uGrassCell;
uniform vec4 uGrassView;
uniform highp sampler2D uInst0;
uniform highp sampler2D uInst1;
uniform highp sampler2D uInst2;
uniform highp sampler2D uInst3;
uniform int uInstN;
varying vec3 vGrassColor;
varying vec4 vGrassData;    // x t along blade, y ao, z sheen (gust), w baked sun visibility
varying vec3 vGrassUv;      // cards: uv + part id
varying float vGrassFade;   // pampas plumes: dissolve near the lens

// Horizontal view-wedge culling: the toroidal patches surround the camera but only ~1/4 of them is on screen;
// instances outside the wedge (beyond 6 m) bail out before any texture fetch.
bool kzOutsideView(vec2 xz) {
  if (uGrassView.w < 0.5) return false;
  vec2 d = xz - uGrassCenter.xz;
  float l = length(d);
  return l > 6.0 && dot(d, uGrassView.xy) < uGrassView.z * l;
}
`,_n=`
  vec2 kzOrigin = uGrassCenter.xz - 0.5 * uGrassPatch.x;
  vec2 kzK = ceil((kzOrigin - kzOffset) / uGrassPatch.x);
  ivec2 kzKi = ivec2(kzK);
  vec3 r1 = kazeHash3(ivec3(kzId, kzKi.x + 5003, kzKi.y + 7919));
  vec3 r2 = kazeHash3(ivec3(kzKi.x * 31 + 17, kzId * 3 + 1, kzKi.y * 131 + 5));
  vec3 r3 = kazeHash3(ivec3(kzKi.y * 17 + 3, kzKi.x * 71 + 11, kzId * 7 + 2));
  vec2 kzXZ = kzOffset + kzK * uGrassPatch.x + (r2.xy - 0.5) * uGrassCell;
`,vn=`
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`,yn=`
#include <kaze_common>
#include <kaze_wind>
#include <kaze_terrain>
#include <kaze_field>
#include <kaze_lawn>
uniform highp sampler2D uOffsetTex;
uniform vec3 uGrassCenter;
uniform vec4 uGrassPatch;
uniform float uGrassCell;
uniform int uInstN;
uniform vec4 uGrassView;
uniform vec4 uPlayer;
uniform vec4 uTrample[8];

// Horizontal view-wedge culling: the toroidal patches surround the camera but only ~1/4 of them is on screen;
// instances outside the wedge (beyond 6 m) bail out before any texture fetch.
bool kzOutsideView(vec2 xz) {
  if (uGrassView.w < 0.5) return false;
  vec2 d = xz - uGrassCenter.xz;
  float l = length(d);
  return l > 6.0 && dot(d, uGrassView.xy) < uGrassView.z * l;
}
layout(location = 0) out highp vec4 oInst0;
layout(location = 1) out highp vec4 oInst1;
layout(location = 2) out highp vec4 oInst2;
layout(location = 3) out highp vec4 oInst3;
void main() {
  ivec2 kzIJ = ivec2(gl_FragCoord.xy);
  int kzId = kzIJ.y * uInstN + kzIJ.x;
  vec2 kzOffset = texelFetch(uOffsetTex, kzIJ, 0).rg;
  ${_n}
  if (kzOutsideView(kzXZ)) {
    oInst0 = vec4(0.0);
    oInst1 = vec4(0.0);
    oInst2 = vec4(0.0);
    oInst3 = vec4(0.0);
    return;
  }
  float kzH0 = kazeTerrainHeightFast(kzXZ);
  oInst0 = vec4(kzH0, kazeTerrainLight(kzXZ).r, kazeWindBend(kzXZ));
  oInst1 = kazeTerrainMask(kzXZ);
  oInst2 = vec4(kazeGrassTip(kzXZ, r3.x), kazeFbmLod(kzXZ * 0.21 + vec2(0.37, 0.91)));
  // interaction, once per instance: blades part around the player and flatten in trampled zones
  vec2 kzDp = kzXZ - uPlayer.xz;
  float kzDpl = length(kzDp);
  float kzPush = (1.0 - smoothstep(0.1, uPlayer.w, kzDpl)) * step(abs(kzH0 - uPlayer.y), 3.0);
  vec2 kzPushV = (kzDp / max(kzDpl, 1e-3)) * kzPush * 1.2;
  float kzFlat = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 tz = uTrample[i];
    if (tz.z <= 0.0) continue;
    vec2 td = kzXZ - tz.xy;
    float tl = length(td);
    float tf = (1.0 - smoothstep(tz.z * 0.35, tz.z, tl)) * tz.w;
    kzPushV += (td / max(tl, 1e-3)) * tf * 0.8;
    kzFlat = max(kzFlat, tf);
  }
  oInst3 = vec4(kzPushV, kzFlat, kazeLawnAt(kzXZ));
}
`,bn=`
  vec2 kzOffset = aOffset;
  int kzId = gl_InstanceID;
  ${_n}
  if (kzOutsideView(kzXZ)) {
    gl_Position = vec4(0.0, 0.0, -2.0, 1.0); // outside the clip volume for both depth conventions
    return;
  }
  ivec2 kzIJ = ivec2(kzId % uInstN, kzId / uInstN);
  vec4 kzI0 = texelFetch(uInst0, kzIJ, 0);
  vec4 kzMask = texelFetch(uInst1, kzIJ, 0);
  vec4 kzI2 = texelFetch(uInst2, kzIJ, 0);
  float kzH0 = kzI0.x;
  vec3 kzTip = kzI2.rgb;
  float kzClump = kzI2.a;
  float kzDist = distance(kzXZ, uGrassCenter.xz);
  float kzOuter = uGrassPatch.z, kzInner = uGrassPatch.y;
  float kzThin = mix(1.0, uGrassShape.z, smoothstep(kzOuter * 0.15, kzOuter, kzDist));
  float kzFadeOut = 1.0 - smoothstep(kzOuter - 9.0, kzOuter, kzDist);
  float kzFadeIn = kzInner > 0.0 ? smoothstep(kzInner - 9.0, kzInner, kzDist) : 1.0;
  float kzAlive = step(r1.z, kzFadeOut) * step(1.0 - r1.z, kzFadeIn);
  vec2 kzWind = kzI0.zw;
  float kzGustL = length(kzWind);
  vec2 kzWindN = kzWind / max(kzGustL, 1e-3);
  // this plant's share of a passing gust front, 0 in a lull .. 1 in a front, and the sheen it brings (both per
  // instance, from the prepass's wind bend)
  float kzGustN = smoothstep(0.26, 0.95, kzGustL);
  float kzSheen = smoothstep(0.35, 0.9, kzGustL);
  // interaction (player push + trampled zones), precomputed per instance by the prepass
  vec4 kzI3 = texelFetch(uInst3, kzIJ, 0);
  vec2 kzPushV = kzI3.xy;
  float kzFlat = kzI3.z;
  float kzLawn = kzI3.w;
  float kzSunVis = kzI0.y;
  vGrassFade = 1.0;
`,xn=`
  float t = position.y;
  float side = position.x;
  // tufts: density and height clump at ~1–3 m scale
  float clump = kzClump;
  float thatch = 0.0;
#ifdef GRASS_MID
  float keep = kzMask.r * uGrassPatch.w * kzThin * (1.0 - kzMask.a) * clamp(0.62 + clump * 1.1, 0.15, 1.35);
  kzAlive *= step(r1.x, keep);
  float kzHeight = mix(0.6, 1.15, r1.y) * uGrassShape.x * (1.0 + kzMask.g * 0.6) * (0.85 + 0.3 * clump) * (1.0 - 0.52 * kzLawn);
  float kzWidth = mix(0.14, 0.24, r2.z) * uGrassShape.y;
#else
  // close up the field stays full between its tufts (no bare patches of ground)
  float keep = kzMask.r * uGrassPatch.w * kzThin * (1.0 - kzMask.a) * clamp(0.8 + clump * 0.9, 0.45, 1.35);
  // grazed lawn: a dense turf gathered in irregular tufts (the clump noise) instead of the field's thinning
  keep = mix(keep, kzMask.r * (1.0 - kzMask.a) * uGrassPatch.w * (0.6 + 1.0 * smoothstep(-0.3, 0.35, clump)), kzLawn);
  kzAlive *= step(r1.x, keep);
  // three storeys: a short dry thatch bent over the ground, the body of the field, a few tall leaves
  float st = r1.y;
  thatch = step(st, 0.3);
  float kzHeight = st < 0.3 ? mix(0.2, 0.42, st / 0.3) : (st < 0.9 ? mix(0.5, 0.95, (st - 0.3) / 0.6) : mix(1.0, 1.15, (st - 0.9) / 0.1));
  kzHeight *= uGrassShape.x * mix(0.7, 1.12, kzMask.r) * (1.0 + kzMask.g * 0.3) * (0.82 + 0.3 * clump);
  // blades right at the lens (a low camera in the grass) stay below it instead of striping the frame
  kzHeight *= mix(0.55, 1.0, smoothstep(0.4, 1.4, kzDist));
  float kzWidth = mix(0.02, 0.038, r2.z) * (1.0 + 0.45 * thatch) * uGrassShape.y / sqrt(max(kzThin, 0.08));
  // the lawn's turf: uneven, taller in its tufts, a few long blades standing above it, finer blades
  kzHeight = mix(kzHeight, mix(0.12, 0.34, r1.y) * (0.65 + 0.75 * smoothstep(-0.3, 0.45, clump)) * (r3.x > 0.88 ? 1.6 : 1.0), kzLawn);
  kzWidth = mix(kzWidth, mix(0.024, 0.04, r2.z) * uGrassShape.y, kzLawn);
  thatch *= 1.0 - kzLawn;
#endif
  kzWidth = max(kzWidth, kzDist * uGrassShape.w);
  kzHeight *= kzAlive * (1.0 - 0.5 * kzFlat);
  float ang = r3.z * 6.2831853;
  vec2 across = vec2(cos(ang), sin(ang));
  vec2 facing = vec2(-across.y, across.x);
  vec2 leanDir = vec2(cos(r2.x * 6.2831853), sin(r2.x * 6.2831853));
  // in a lull the blades hold still, leaning in the steady breeze (the stillness between the fronts is what lets
  // the eye see the bands roll in); a front sets them fluttering, fast and wide
  float kzPh = r3.y * 37.0 + dot(kzXZ, vec2(0.61, 0.37));
  float fl = sin(uTime * (4.2 + r3.y * 3.8) + kzPh) * 0.13 * kzGustN * kzGustN;
  vec2 D = leanDir * mix(0.06 + 0.28 * r2.y, 0.75 + 0.5 * r2.y, thatch) + kzWind * (0.55 + 0.4 * r3.y) + kzPushV;
  D += vec2(-kzWindN.y, kzWindN.x) * fl;
  // the blade bows in an arc of constant length, its tip leaning further from the vertical the stronger the bend |D|
  // and never past ~86° (grassBend.js): a gust lays it over instead of stretching it into a needle, and the tip stays
  // above the root, so a blade bent uphill clears the slope. Trampling, stiffness, flutter and lean all arrive in D.
  float kzReach, kzRise;
  vec2 kzDir;
  float Dl = length(D);
  kzBladeArc(Dl, t, kzReach, kzRise, kzDir);
  vec2 Dn = D / max(Dl, 1e-4);
  float taper = pow(max(1.0 - t, 0.0), 0.85);
  vec3 kzPos;
  kzPos.xz = kzXZ + Dn * (kzHeight * kzReach) + across * (side * kzWidth * 0.5 * taper);
  kzPos.y = kzH0 - 0.04 + kzHeight * kzRise;
  // normal: blade plane normal, bent with the curve, turned toward the viewer, softened toward up
  vec3 tang = vec3(Dn.x * kzDir.x, kzDir.y, Dn.y * kzDir.x);
  vec3 bn = vec3(facing.x, 0.0, facing.y);
  bn = normalize(bn - tang * dot(bn, tang));
  vec3 toCam = cameraPosition - kzPos;
  bn *= sign(dot(bn, toCam) + 1e-4);
  bn = normalize(bn + vec3(across.x, 0.0, across.y) * side * 0.35);
  vec3 objectNormal = normalize(mix(bn, vec3(0.0, 1.0, 0.0), 0.52));
  // colour: dark base → olive middle → gold/straw tip
  vec3 tip = kzTip;
#ifdef GRASS_MID
  tip = mix(tip, KZ_PLUME * 0.95, kzMask.g * 0.72);
#else
  tip = mix(tip, KZ_PLUME * 0.9, kzMask.g * 0.18);
#endif
  // a few blades stay green, a few are bleached pale straw; grazed lawns regrow green
  float kind = r3.x;
  tip = mix(tip, KZ_TIP_GREEN * vec3(1.5, 1.45, 1.3), kzLawn * 0.85);
  tip = mix(tip, KZ_TIP_GREEN * 1.2, step(0.9, kind) * 0.7);
  tip = mix(tip, KZ_TIP_STRAW * 1.12, step(kind, 0.08) * 0.8);
  // the thatch storey is dead grass: pale straw, duller
  tip = mix(tip, KZ_TIP_STRAW * vec3(0.85, 0.72, 0.58), thatch * 0.6);
  vec3 midc = tip * vec3(0.52, 0.5, 0.36) + vec3(0.0, 0.012, 0.0);
#ifdef GRASS_MID
  vec3 col = mix(midc * 0.7, tip, smoothstep(0.0, 1.0, t));
#else
  // foot of the blade: amber-brown thatch in the field, dark olive in a lawn (no black soil between the stems)
  vec3 foot = mix(KZ_THATCH, KZ_TIP_GREEN * 0.55, kzLawn);
  vec3 col = mix(foot, midc, smoothstep(0.0, 0.45, t));
#endif
  col = mix(col, tip, smoothstep(0.5, 1.0, t));
  col *= mix(0.62 + 0.55 * r1.y, 0.8 + 0.3 * r2.y, thatch);
  vGrassColor = col;
  // lower parts of the blades are shaded by the canopy around them (by height above the ground, so the short
  // thatch sits in the shade of the tall blades)
#ifdef GRASS_MID
  float selfShadow = mix(0.7, 1.0, t);
  float kzAo = mix(0.12, 1.0, smoothstep(0.0, 0.8, t));
#else
  float kzLit = mix(smoothstep(0.04, 0.75, kzHeight * t), 1.0, kzLawn * 0.7);
  float selfShadow = mix(mix(0.42, 1.0, kzLit), 1.0, 1.0 - kzMask.r);
  float kzAo = mix(0.26, 1.0, kzLit);
#endif
  vGrassData = vec4(t, kzAo, kzSheen * t, kzSunVis * selfShadow);
  vGrassUv = vec3(0.0);
`,Sn=fn+pn,Cn=`
  float part = uv.y;
  // susuki grows in tussocks: the plumes gather in clumps (the ~5 m clump noise) with thinner ground between them, and
  // stand taller where they crowd, instead of an even carpet of identical plumes
  float tuss = smoothstep(-0.35, 0.3, kzClump);
  // the plumes thin out gently where the pampas mask is low (the field's edges) instead of vanishing
  float keep = pow(kzMask.g, 0.35) * uGrassPatch.w * kzThin * (1.0 - kzLawn) * mix(0.3, 1.3, tuss);
  kzAlive *= step(r1.x, keep);
  // trampled ground (the duel arena, around actors): the stalks go down and only the grass stands; each plant
  // shrinks away over its own short band of the trampling, so a walking actor never pops plumes on and off
  kzAlive *= clamp((1.0 - smoothstep(0.3, 0.62, kzFlat) - 0.75 * r3.y) * 4.0, 0.0, 1.0);
  // no two plants alike: short and tall stalks, small and long plumes, most upright and a few leaning far over; the
  // plumes nod just above the blades rather than standing on tall poles
  float stalkH = mix(0.95, 1.95, r1.y) * mix(0.8, 1.12, tuss) * uGrassShape.x * kzAlive * (1.0 - 0.35 * kzFlat);
  float plumeL = mix(0.5, 1.1, r2.z) * uGrassShape.x * kzAlive;
  vec2 leanDir = vec2(cos(r2.x * 6.2831853), sin(r2.x * 6.2831853));
  // still in a lull (like the blades), a fast swing in a front
  float kzPh = r3.y * 23.0 + dot(kzXZ, vec2(0.41, 0.27));
  float fl = sin(uTime * (2.6 + r3.y * 2.0) + kzPh) * 0.12 * kzGustN;
  vec2 D = leanDir * (0.03 + 0.36 * r2.y * r2.y) + kzWind * (0.62 + 0.35 * r3.y) + kzPushV * 0.8;
  D += vec2(-kzWindN.y, kzWindN.x) * fl;
  // the stalk is stiff: its bend saturates, and only ever grows with the gust (a front can't lay it down into the
  // grass, where its plume would seem to float stalkless in mid-air, nor straighten it again at the gust's peak); the
  // soft plume takes the rest of the gust (Tend below)
  float kzDl = length(D);
  D *= kzStalkBend(kzDl) / max(kzDl, 1e-4);
  float dd = dot(D, D);
  vec3 kzPos;
  vec3 objectNormal;
  // stalk: xz = base + D·H·t², y = base + H·t·(1 − 0.36·|D|²·t)
  vec2 tipXZ = kzXZ + D * stalkH;
  vec3 tipPos = vec3(tipXZ.x, kzH0 - 0.05 + stalkH * (1.0 - 0.36 * dd), tipXZ.y);
  vec3 tipTan = normalize(vec3(D.x * 2.0, 1.0 - 0.72 * dd, D.y * 2.0) + vec3(0.0, 1e-4, 0.0));
  vec3 W3 = vec3(kzWindN.x, 0.0, kzWindN.y);
  vec3 P3 = vec3(-kzWindN.y, 0.0, kzWindN.x);
  float gust = min(kzGustL, 1.5);
  // end direction of the arch: the stalk's own direction curled well downwind (more in a gust) and drooping
  // under the plume's weight, fluttering sideways with the stalk
  vec3 Tend = normalize(tipTan * 0.7 + W3 * (0.3 + 0.35 * gust) + vec3(0.0, -(0.06 + 0.36 * r3.y), 0.0) + P3 * (fl * 3.0));
  vec3 C = tipTan * (0.5 * plumeL);
  vec3 E = C + Tend * (0.5 * plumeL);
  // near the lens a plume at eye height would fill the frame, and one streaming downwind from a plant beside or behind
  // the camera (the guiding wind blows from behind it) sweeps right across the view: so the plant (plume and stalk)
  // dissolves within ~3.6 m of the part of it nearest the camera, the node, the middle of the plume or its end, not of
  // the stalk's tip alone (the ones a raised camera looks down on, a field shot's foreground, stay whole down to ~1 m),
  // and a plume that would span half the frame's height lets go, however far it is. Each part fades on its own and the
  // plant by the least of them: every input moves smoothly with the wind, so the dissolve is gradual in time.
  float kzLens = kzPlantLens(tipPos - cameraPosition, C, E, plumeL);
  if (part < 0.5) {
    float t = position.y, side = position.x;
    kzPos.xz = kzXZ + D * (stalkH * t * t);
    kzPos.y = kzH0 - 0.05 + stalkH * t * (1.0 - 0.36 * dd * t);
    vec3 stT = normalize(vec3(2.0 * t * D.x, 1.0 - 0.72 * dd * t, 2.0 * t * D.y) + vec3(0.0, 1e-4, 0.0));
    vec3 toC = cameraPosition - kzPos;
    float camD = length(toC);
    // a thin stem that stays visible close to the camera (it goes only with its dissolving plume, or within
    // the last decimetres before the lens)
    float w = max(mix(0.012, 0.02, r3.x) * uGrassShape.y, camD * uGrassShape.w) * (1.0 - 0.45 * t) * smoothstep(0.15, 0.45, camD) * kzLens;
    vec3 sd = cross(stT, toC);
    float sdl = length(sd);
    sd = sdl > 1e-5 ? sd / sdl : vec3(1.0, 0.0, 0.0);
    kzPos += sd * (side * w * 0.5 * kzAlive);
    vec3 bn = normalize(cross(sd, stT) + 1e-5);
    bn *= sign(dot(bn, toC) + 1e-4);
    objectNormal = normalize(mix(bn, vec3(0.0, 1.0, 0.0), 0.45));
    vGrassColor = mix(vec3(0.1, 0.07, 0.025), vec3(0.58, 0.44, 0.19), smoothstep(0.05, 0.9, t));
    vGrassData = vec4(t, mix(0.35, 1.0, t), 0.0, kzSunVis);
    vGrassUv = vec3(0.0);
  } else {
    float u = position.x, s = position.y;
    // frame at the node for the splay of the racemes (P3 is horizontal, never along the stalk tangent)
    vec3 B2 = normalize(cross(P3, tipTan));
    vec3 B1 = cross(tipTan, B2);
#if PAMPAS_STRIPS > 1
    vec3 rk = kazeHash3(ivec3(kzId, int(part) * 131 + 7, kzKi.x * 7 + kzKi.y * 3));
    float lk = mix(0.8, 1.0, rk.x);
    float phi = (part - 1.0 + 0.2 + 0.6 * rk.y) * (6.2831853 / float(PAMPAS_STRIPS)) + r3.z * 6.2831853;
    // the racemes open from the node into a fan; a strong gust combs them together
    float splay = mix(0.04, 0.22, rk.z) * (1.0 - 0.3 * min(gust, 1.0));
    float wS = mix(0.065, 0.12, rk.x) * uGrassShape.y;
#else
    float lk = 1.0, phi = 0.0, splay = 0.0;
    float wS = mix(0.11, 0.21, r1.y) * uGrassShape.y;
#endif
    // lanceolate: narrow at the node, full before the middle, a soft point at the end
    float prof = sin(3.14159 * pow(s, 0.72)) * (1.0 - 0.2 * s) + 0.1 * (1.0 - s);
    vec3 sp = B1 * cos(phi) + B2 * sin(phi);
    float x = s * lk;
    vec3 Q = tipPos + (2.0 * (1.0 - x) * x) * C + (x * x) * E + sp * (splay * plumeL * x * (1.0 - 0.3 * x));
    vec3 T = normalize(lk * (2.0 * (1.0 - x) * C + 2.0 * x * (E - C)) + sp * (splay * plumeL * lk * (1.0 - 0.6 * x)) + vec3(0.0, 1e-5, 0.0));
    vec3 V = cameraPosition - Q;
    vec3 side = cross(T, V);
    float sl = length(side);
    side = sl > 1e-5 ? side / sl : B1;
    kzPos = Q + side * (u * wS * prof * 0.5 * kzAlive);
    vec3 cn = normalize(cross(side, T));
    cn *= sign(dot(cn, V) + 1e-4);
    objectNormal = normalize(cn + side * (u * 0.55) + vec3(0.0, 0.25, 0.0));
    // each plant its own shade and tint, from rosy to silver
    vec3 plume = KZ_PLUME * mix(0.3, 0.56, r3.x) * mix(vec3(1.0, 0.93, 0.88), vec3(0.93, 0.97, 1.0), r2.y);
    plume = mix(plume * vec3(0.82, 0.62, 0.56), plume, smoothstep(0.0, 0.6, s)); // rosy-brown node, silver ends
    vGrassColor = plume;
    vGrassData = vec4(1.0, mix(0.7, 1.0, s), kzSheen * 0.6 * s, kzSunVis);
    vGrassUv = vec3(u, max(s, 1e-3), r2.y * 17.0 + part * 3.1);
    vGrassFade = kzLens;
  }
`,wn=`
  float part = uv.y;
  float keep = kzMask.b * uGrassPatch.w * kzThin * (1.0 - kzLawn);
  kzAlive *= step(r1.x, keep);
  float stemH = mix(0.34, 0.55, r1.y) * kzAlive * (1.0 - 0.6 * kzFlat);
  float headR = mix(0.1, 0.15, r2.z) * kzAlive;
  vec2 D = kzWind * 0.22 + kzPushV * 0.6;
  vec2 tipXZ = kzXZ + D * stemH;
  vec3 tipPos = vec3(tipXZ.x, kzH0 + stemH, tipXZ.y);
  vec3 kzPos;
  vec3 objectNormal;
  vec3 toCam = normalize(cameraPosition - tipPos);
  if (part < 0.5) {
    float t = position.y, side = position.x;
    float w = max(0.008, kzDist * uGrassShape.w) * (1.0 - 0.3 * t);
    vec2 across = vec2(cos(r3.z * 6.2831853), sin(r3.z * 6.2831853));
    kzPos.xz = kzXZ + D * (stemH * t * t) + across * side * w * 0.5;
    kzPos.y = kzH0 - 0.03 + stemH * t;
    vec3 bn = normalize(vec3(-across.y, 0.0, across.x));
    bn *= sign(dot(bn, toCam) + 1e-4);
    objectNormal = normalize(mix(bn, vec3(0.0, 1.0, 0.0), 0.4));
    vGrassColor = vec3(0.07, 0.12, 0.03);
    vGrassData = vec4(t, mix(0.35, 1.0, t), 0.0, kzSunVis);
    vGrassUv = vec3(0.0);
  } else {
    float u = position.x, v = position.y; // -1..1 square
    float a = (part - 1.0) * 1.5708 + r3.z * 6.2831853;
    vec3 cardDir = vec3(cos(a), 0.0, sin(a));
    vec3 upDir = normalize(vec3(D.x, 1.0, D.y) + vec3(cos(a + 1.57), 0.0, sin(a + 1.57)) * 0.35);
    kzPos = tipPos + cardDir * (u * headR) + upDir * (v * headR) + vec3(0.0, headR * 0.35, 0.0);
    vec3 cn = normalize(cross(cardDir, upDir));
    cn *= sign(dot(cn, toCam) + 1e-4);
    objectNormal = normalize(mix(cn, vec3(0.0, 1.0, 0.0), 0.3));
    vGrassColor = KZ_LILY * mix(0.85, 1.1, r3.x);
    vGrassData = vec4(1.0, 1.0, 0.0, kzSunVis);
    vGrassUv = vec3(u, v, r2.y * 13.0);
  }
`,Tn=`
  float keep = kzMask.r * uGrassPatch.w * kzThin * (1.0 - kzMask.a);
  kzAlive *= step(r1.x, keep);
  float u = position.x, v = position.y;
  float th = mix(0.55, 1.05, r1.y) * uGrassShape.x * (1.0 + kzMask.g * 0.6) * kzAlive * (1.0 - 0.6 * kzFlat) * (1.0 - 0.75 * kzLawn);
  float tw = mix(1.0, 1.7, r2.z) * uGrassShape.y * kzAlive;
  vec3 toCamT = cameraPosition - vec3(kzXZ.x, kzH0, kzXZ.y);
  vec3 rightT = normalize(vec3(toCamT.z, 0.0, -toCamT.x) + vec3(1e-4, 0.0, 0.0));
  vec2 bend = (kzWind * 0.5 + vec2(cos(r3.z * 6.2831853), sin(r3.z * 6.2831853)) * 0.12) * th * v * v;
  vec3 kzPos = vec3(kzXZ.x, kzH0 - 0.06, kzXZ.y) + rightT * (u * tw * 0.5) + vec3(bend.x, v * th, bend.y);
  vec3 objectNormal = normalize(mix(normalize(vec3(toCamT.x, 0.0, toCamT.z) + 1e-4), vec3(0.0, 1.0, 0.0), 0.62));
  vec3 tipT = kzTip;
  tipT = mix(tipT, KZ_PLUME * 0.9, kzMask.g * 0.7);
  vGrassColor = mix(tipT * vec3(0.5, 0.48, 0.34), tipT, v) * (0.75 + 0.4 * r1.y);
  vGrassData = vec4(v, mix(0.35, 1.0, v), kzSheen * v, kzSunVis);
  vGrassUv = vec3(u, max(v, 0.002), r2.y * 11.0);
`,En=`
#include <kaze_common>
#include <kaze_atmosphere>
varying vec3 vGrassColor;
varying vec4 vGrassData;
varying vec3 vGrassUv;
varying float vGrassFade;
float kzTransK = 1.0;        // pampas plumes: light passes through the thin hair tips, less through the heart
uniform vec3 uTransColor;
uniform float uTransStrength;
uniform float uWrap;
uniform vec3 uPlumeGlow;
vec3 kzTrans = vec3(0.0);
float kzSunVisF = 1.0;
vec3 kzSunDirV = vec3(0.0, 1.0, 0.0);
`,Dn=`
#undef RE_Direct
void RE_Direct_Grass(const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
  vec3 lc = directLight.color;
  if (dot(directLight.direction, kzSunDirV) > 0.9995) lc *= kzSunVisF;
  float NoL = dot(geometryNormal, directLight.direction);
  float wrapNL = clamp((NoL + uWrap) / (1.0 + uWrap), 0.0, 1.0);
  reflectedLight.directDiffuse += wrapNL * lc * BRDF_Lambert(material.diffuseContribution);
  reflectedLight.directSpecular += clamp(NoL, 0.0, 1.0) * lc * BRDF_GGX(directLight.direction, geometryViewDir, geometryNormal, material) * 0.6;
  // light passing through the blade toward the viewer
  float back = pow(clamp(dot(-geometryViewDir, directLight.direction), 0.0, 1.0), 3.0);
  float fwd = 0.25 * pow(clamp(dot(-geometryViewDir, directLight.direction), 0.0, 1.0), 12.0);
  reflectedLight.directDiffuse += lc * kzTrans * (back + fwd);
}
#define RE_Direct RE_Direct_Grass
`,On=`
#ifdef GRASS_PAMPAS
  // a susuki plume: a plush, near-opaque heart of silky hairs with a fringe of loose hair tips at its edge (near: one
  // raceme of the fan; far: the whole plume). Each hair reaches its own length (a ragged, soft silhouette); inside the
  // heart the hairs only streak the colour along their slant, in the fringe they part and glow against the sun.
  float kzU = vGrassUv.x, kzV = max(vGrassUv.y, 1e-3);
#if PAMPAS_STRIPS > 1
  // fine hairs lying almost along the raceme toward its tip (silky streaks, not a fishbone), their slant wavering
  float bz = kzV * 70.0 - abs(kzU) * (18.0 + 5.0 * sin(kzV * 4.3 + vGrassUv.z)) + vGrassUv.z;
#else
  float bz = kzV * 34.0 - abs(kzU) * 9.0 + vGrassUv.z;
#endif
  // uneven spacing: the hairs bunch and part along the axis instead of ruling a fishbone
  bz += sin(kzV * 11.0 + vGrassUv.z * 1.7) * 2.0 + sin(kzV * 23.0 + vGrassUv.z) * 0.8 + sin(kzV * 41.0 + vGrassUv.z * 2.3) * 0.35;
  // hairs and plume half-widths per pixel (outside the per-primitive branch: well-defined derivatives)
  float bzW = fwidth(bz);
  float auW = fwidth(abs(kzU));
  if (vGrassUv.y > 0.0 || vGrassUv.x != 0.0) {
    float u = kzU, v = kzV, au = abs(u), seed = vGrassUv.z;
    float bid = floor(bz);
    float br = fract(sin(bid * 12.9898 + seed * 3.1 + step(0.0, u) * 7.7) * 43758.5453);
    float reach = mix(0.55, 1.0, br) * (0.55 + 0.45 * smoothstep(0.0, 0.3, v)) * (1.0 - 0.35 * smoothstep(0.75, 1.0, v));
    float along = au / max(reach, 0.05);                 // 0 at the axis … 1 at the hair's tip
    float alongW = auW / max(reach, 0.05);
    float bc = abs(fract(bz + sin(au * 5.0 + br * 6.28) * 0.12) - 0.5) * 2.0;
    // a second set of hairs at another slant and spacing tangles the grain into silk instead of ruled stripes
    float bc2 = abs(fract(bz * 0.77 + au * 4.0 + seed * 1.3) - 0.5) * 2.0;
    // the heart is solid out to about half of its hairs' reach (a third on the far cards), with a pixel-wide edge (a
    // wide soft alpha ramp dithers into a stippled band under alpha-to-coverage); beyond it the hairs part, thinner
    // toward their tips
#if PAMPAS_STRIPS > 1
    const float kzHeart = 0.55;
#else
    const float kzHeart = 0.35; // a whole plume on one card: a slimmer heart, more fringe (no solid leaf at a distance)
#endif
    float heart = 1.0 - smoothstep(kzHeart - alongW, kzHeart + alongW, along);
    float thick = 0.3 + 0.26 * (1.0 - along) + 0.35 * clamp(bzW - 0.35, 0.0, 1.0);
    float hair = 1.0 - smoothstep(thick, thick + 0.3, bc);
    float hair2 = 1.0 - smoothstep(thick, thick + 0.3, bc2);
    float fringe = max(hair, 0.9 * hair2) * (1.0 - smoothstep(0.78, 1.0, along));
    // the fibre streaks in the colour fade out where several hairs share a pixel (no moiré at a distance)
    float fibre = mix(0.5 * (hair + hair2), 0.5, clamp(bzW * 1.2 - 0.3, 0.0, 1.0));
    float rachis = (1.0 - smoothstep(0.04, 0.1, au)) * (1.0 - smoothstep(0.85, 0.97, v));
    float a = max(max(heart * smoothstep(0.02, 0.1, v), fringe), rachis) * smoothstep(0.0, 0.03, v) * (1.0 - smoothstep(0.95, 1.0, v));
    float kzEdge = smoothstep(0.35, 0.95, along) * (0.6 + 0.4 * br);
    diffuseColor.a = a * vGrassFade;
    // the heart in its own shade and streaked by its hairs, the fringe brighter and glowing against the sun
    diffuseColor.rgb *= mix(0.7, 1.1, kzEdge) * (0.7 + 0.45 * fibre) * (0.88 + 0.24 * br);
    kzTransK = (0.35 + 0.95 * kzEdge) * (0.75 + 0.5 * fibre);
  }
#endif
#ifdef GRASS_TUFT
  {
    float u = vGrassUv.x, v = vGrassUv.y;
    float ang = atan(u * 0.8, v + 0.08);
    float fan = ang * 9.0 + vGrassUv.z;
    float sid = floor(fan);
    float srnd = fract(sin(sid * 17.13 + vGrassUv.z) * 43758.5453);
    float cell = abs(fract(fan) - 0.5) * 2.0;
    float blade = 1.0 - smoothstep(0.3, 0.75, cell / max(1.0 - v, 0.05));
    float tipCut = 1.0 - smoothstep(0.55 + 0.45 * srnd, 0.6 + 0.45 * srnd, v);
    diffuseColor.a = blade * tipCut * (1.0 - smoothstep(0.85, 1.0, abs(u)));
  }
#endif
#ifdef GRASS_LILY
  if (vGrassUv.x != 0.0 || vGrassUv.y != 0.0) {
    vec2 p = vGrassUv.xy;
    float r = length(p);
    float th = atan(p.y, p.x) + vGrassUv.z;
    // six narrow, recurved petals + long stamens curving outward (Lycoris radiata)
    float curl = th + 0.55 * r * r;
    float petal = pow(abs(cos(curl * 3.0)), 14.0) * (1.0 - smoothstep(0.55, 0.72, r));
    float core = 1.0 - smoothstep(0.1, 0.18, r);
    float stam = pow(abs(cos(th * 3.0 + 1.5708 - 0.9 * r)), 220.0) * smoothstep(0.2, 0.35, r) * (1.0 - smoothstep(0.93, 1.0, r));
    diffuseColor.a = max(max(petal * 1.4, core), stam * 1.2);
    diffuseColor.rgb *= mix(0.55, 1.2, smoothstep(0.05, 0.5, r));
  }
#endif
`;function kn(e,t,n=1){let r=new s({color:16777215,roughness:.62,metalness:0,side:2});(e===`pampas`||e===`lily`||e===`tuft`)&&(r.alphaTest=e===`pampas`?.22:.42,r.alphaToCoverage=!0),r.defines={},e===`mid`&&(r.defines.GRASS_MID=``),e===`pampas`&&(r.defines.GRASS_PAMPAS=``,r.defines.PAMPAS_STRIPS=n),e===`lily`&&(r.defines.GRASS_LILY=``),e===`tuft`&&(r.defines.GRASS_TUFT=``),r.userData.shaderKey=`grass-`+e+(e===`pampas`?`-`+n:``);let i=e===`pampas`?Cn:e===`lily`?wn:e===`tuft`?Tn:xn,a=gn+(e===`pampas`?Sn:e===`lily`||e===`tuft`?``:dn);return r.userData.onBeforeCompile=n=>{Object.assign(n.uniforms,t),n.vertexShader=n.vertexShader.replace(`#include <common>`,`#include <common>
`+a).replace(`#include <beginnormal_vertex>`,bn+i).replace(`#include <begin_vertex>`,`vec3 transformed = kzPos;`),n.fragmentShader=n.fragmentShader.replace(`#include <common>`,`#include <common>
`+En).replace(`#include <color_fragment>`,`#include <color_fragment>
  // gust sheen (vGrassData.z): blades combed over by a passing front turn a paler, glossier face to the light,
  // in the diffuse and in the light through the blade alike, so the band also reads against the low sun
  vec3 kzPale = vec3(dot(vGrassColor, vec3(0.2126, 0.7152, 0.0722))) * vec3(1.3, 1.24, 1.1) + vec3(0.05, 0.04, 0.025);
  vec3 kzCol = mix(vGrassColor, mix(vGrassColor * 1.15, kzPale, 0.7), vGrassData.z);
  diffuseColor.rgb = kzCol;
  ${On}
  // the low sun shines through the thin upper leaves and the plumes; lower down the blades stand in the shade of the
  // field around them: backlit tips glow, the body of the field keeps deep amber shadows
  kzTrans = kzCol * uTransColor * uTransStrength * (0.06 + 0.94 * vGrassData.x * vGrassData.x) * kzTransK;
  kzSunVisF = vGrassData.w;
  kzSunDirV = normalize((viewMatrix * vec4(uSunDir, 0.0)).xyz);`).replace(`#include <normal_fragment_begin>`,be.normal_fragment_begin.replace(`normal *= faceDirection;`,``)).replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
`+Dn).replace(`#include <aomap_fragment>`,`#include <aomap_fragment>
  reflectedLight.indirectDiffuse *= vGrassData.y;
  reflectedLight.indirectSpecular *= vGrassData.y * 0.6;`+(e===`pampas`?`
  if (vGrassUv.y > 0.0 || vGrassUv.x != 0.0) reflectedLight.indirectDiffuse += vGrassColor * uPlumeGlow;`:``))},r}function An(e){let t=[];for(let n=0;n<e.length;n++)t.push(-1,e[n],0,1,e[n],0);t.push(0,1,0);let n=[];for(let t=0;t<e.length-1;t++){let e=t*2,r=e+1,i=e+2,a=e+3;n.push(e,r,i,r,a,i)}let r=e.length;n.push((r-1)*2,(r-1)*2+1,r*2);let i=new o;return i.setAttribute(`position`,new f(t,3)),i.setAttribute(`uv`,new f(new Float32Array(t.length/3*2),2)),i.setIndex(n),i}function jn(e,t,n,r){let i=[],a=[],s=[];for(let t=0;t<e.length;t++)i.push(-1,e[t],0,1,e[t],0),a.push(0,0,0,0);i.push(0,1,0),a.push(0,0);for(let t=0;t<e.length-1;t++){let e=t*2;s.push(e,e+1,e+2,e+1,e+3,e+2)}let c=e.length;s.push((c-1)*2,(c-1)*2+1,c*2);for(let e=0;e<t;e++){let t=i.length/3;for(let t=0;t<=n;t++){let o=r?-1+2*t/n:t/n;i.push(-1,o,0,1,o,0),a.push(0,e+1,0,e+1)}for(let e=0;e<n;e++){let n=t+e*2;s.push(n,n+1,n+2,n+1,n+3,n+2)}}let l=new o;return l.setAttribute(`position`,new f(i,3)),l.setAttribute(`uv`,new f(a,2)),l.setIndex(s),l}function Mn(){let e=new o;return e.setAttribute(`position`,new f([-1,0,0,1,0,0,-1,1,0,1,1,0],3)),e.setAttribute(`uv`,new f([0,1,0,1,0,1,0,1],2)),e.setIndex([0,1,2,1,3,2]),e}function X({kind:e,base:t,patch:n,density:r,inner:i,outer:o,heightScale:s,widthScale:l,farKeep:u,seed:d,strips:f=1}){let m=Math.max(8,Math.round(n*Math.sqrt(r))),g=n/m,_=new Float32Array(m*m*2),y=de(d),b=0;for(let e=0;e<m;e++)for(let t=0;t<m;t++)_[b++]=(t+y())*g,_[b++]=(e+y())*g;let x=new p(_,m,m,te,pe);x.minFilter=x.magFilter=S,x.generateMipmaps=!1,x.needsUpdate=!0;let C=new he(m,m,{count:4,type:v,format:a,minFilter:S,magFilter:S,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1});for(let e of C.textures)e.colorSpace=``;let w=new fe;w.index=t.index,w.setAttribute(`position`,t.getAttribute(`position`)),w.setAttribute(`uv`,t.getAttribute(`uv`)),w.setAttribute(`aOffset`,new ge(_,2)),w.instanceCount=m*m,w.boundingSphere=new c(new k,1e6),w.boundingBox=new ie(new k(-1e6,-1e6,-1e6),new k(1e6,1e6,1e6));let T={uGrassCenter:{value:new k},uGrassPatch:{value:new R(n,i,o,1)},uGrassShape:{value:new R(s,l,u,.001)},uGrassCell:{value:g},uTransColor:{value:e===`pampas`?new h(1,.9,.76):new h(1,.86,.62)},uTransStrength:{value:e===`pampas`?.8:e===`lily`?.9:1.1},uWrap:{value:e===`pampas`?.6:.45},uPlumeGlow:mn.uPlumeGlow,uInst0:{value:C.textures[0]},uInst1:{value:C.textures[1]},uInst2:{value:C.textures[2]},uInst3:{value:C.textures[3]},uInstN:{value:m}},E=new ce({vertexShader:vn,fragmentShader:yn,glslVersion:ee,uniforms:{...H,uOffsetTex:{value:x},uGrassCenter:T.uGrassCenter,uGrassPatch:T.uGrassPatch,uGrassCell:T.uGrassCell,uInstN:T.uInstN},depthTest:!1,depthWrite:!1}),ne=kn(e,T,f),D=new V(w,ne);return D.frustumCulled=!1,D.castShadow=!1,D.receiveShadow=!0,D.name=`grass-`+e,D.userData.instances=m*m,D.userData.verts=t.getAttribute(`position`).count,{mesh:D,uniforms:T,kind:e,instRT:C,prepass:E}}var Nn=class{constructor({quality:e}){this.group=new E,this.group.name=`grass`,this.layers=[];let t=e,n=t.grassDensity,r=t.grassNear;this.layers.push(X({kind:`near`,base:An([0,.4,.75]),patch:26,density:64*n,inner:0,outer:11,heightScale:.8,widthScale:1.3,farKeep:1,seed:13})),this.layers.push(X({kind:`near`,base:An([0,.3,.58,.82]),patch:40,density:46*n,inner:0,outer:17,heightScale:1.08,widthScale:1.3,farKeep:.75,seed:11})),this.layers.push(X({kind:`near`,base:An([0,.5]),patch:r*2+8,density:24*n,inner:17,outer:r,heightScale:1.05,widthScale:1.35,farKeep:.4,seed:12})),t.grassMid&&this.layers.push(X({kind:`mid`,base:An([0,.55]),patch:330,density:2.6*n,inner:r,outer:165,heightScale:1,widthScale:1,farKeep:.45,seed:23})),t.grassMid&&this.layers.push(X({kind:`tuft`,base:Mn(),patch:580,density:.32*n,inner:160,outer:285,heightScale:1,widthScale:1,farKeep:.6,seed:29})),this.layers.push(X({kind:`pampas`,strips:3,base:jn([0,.4,.75],3,3,!1),patch:56,density:4.2*t.pampasDensity,inner:0,outer:24,heightScale:1,widthScale:1,farKeep:1,seed:37})),this.layers.push(X({kind:`pampas`,strips:1,base:jn([0,.55],1,2,!1),patch:170,density:4.2*t.pampasDensity,inner:24,outer:82,heightScale:1,widthScale:1,farKeep:.18,seed:38})),this.layers.push(X({kind:`lily`,base:jn([0,.6],2,1,!0),patch:96,density:3*n,inner:0,outer:46,heightScale:1,widthScale:1,farKeep:.4,seed:51}));for(let e of this.layers)this.group.add(e.mesh);this.playerUniform=mn.uPlayer,this.quad=new Je(null)}setPlayer(e,t,n,r=.9){mn.uPlayer.value.set(e,t,n,r)}setTrample(e,t=`default`){this._trample||=new Map,e&&e.length?this._trample.set(t,e):this._trample.delete(t);let n=[...this._trample.values()].flat(),r=mn.uTrample.value;for(let e=0;e<r.length;e++){let t=n[e];t?r[e].set(t.x,t.z,t.r,t.s??1):r[e].set(0,0,0,0)}}setLawn(e){let t=mn.uLawn.value;for(let n=0;n<t.length;n++){let r=e&&e[n];r?t[n].set(r.x,r.z,r.r,r.s??1):t[n].set(0,0,0,0)}}update(e,t,n){let r=2*Math.tan(M.degToRad(e.fov)*.5)/Math.max(1,t);e.getWorldDirection(hn);let i=mn.uGrassView.value,a=Math.hypot(hn.x,hn.z);if(a>.35){let t=M.degToRad(e.fov)*.5,n=Math.atan(Math.tan(t)*e.aspect),r=Math.abs(Math.asin(M.clamp(hn.y,-1,1))),o=Math.min(Math.PI*.49,n+M.degToRad(14)+r*.6);i.set(hn.x/a,hn.z/a,Math.cos(o),1)}else i.w=0;let o=n?n.getRenderTarget():null;for(let t of this.layers)t.uniforms.uGrassCenter.value.copy(e.position),t.uniforms.uGrassShape.value.w=r*1.1,n&&t.mesh.visible&&(this.quad.material=t.prepass,n.setRenderTarget(t.instRT),this.quad.render(n));n&&n.setRenderTarget(o)}stats(){return this.layers.map(e=>({kind:e.kind,instances:e.mesh.userData.instances,verts:e.mesh.userData.verts}))}},Z=16,Pn=class{constructor(){this.items=[],this.grid=new Map}_key(e,t){return e*73856093^t*19349663}_insert(e){this.items.push(e);let t=Math.floor((e.x-e.bound)/Z),n=Math.floor((e.x+e.bound)/Z),r=Math.floor((e.z-e.bound)/Z),i=Math.floor((e.z+e.bound)/Z);for(let a=t;a<=n;a++)for(let t=r;t<=i;t++){let n=this._key(a,t),r=this.grid.get(n);r||this.grid.set(n,r=[]),r.push(e)}return e}addCircle(e,t,n,r={}){return this._insert({type:`circle`,x:e,z:t,r:n,bound:n,tag:r.tag||``,top:r.top??1/0})}addBox(e,t,n,r,i=0,a={}){return this._insert({type:`box`,x:e,z:t,hw:n,hd:r,cos:Math.cos(i),sin:Math.sin(i),bound:Math.hypot(n,r),tag:a.tag||``,top:a.top??1/0})}nearby(e,t,n=0){let r=new Set,i=Math.floor((e-n)/Z),a=Math.floor((e+n)/Z),o=Math.floor((t-n)/Z),s=Math.floor((t+n)/Z);for(let e=i;e<=a;e++)for(let t=o;t<=s;t++){let n=this.grid.get(this._key(e,t));if(n)for(let e of n)r.add(e)}return[...r]}resolve(e,t,n=-1/0){let r=!1;for(let i of this.nearby(e.x,e.z,t+1))if(!(n>=i.top-.35)){if(i.type===`circle`){let n=e.x-i.x,a=e.z-i.z,o=Math.hypot(n,a),s=i.r+t;o<s&&(o>1e-5?(e.x=i.x+n/o*s,e.z=i.z+a/o*s):e.x=i.x+s,r=!0)}else{let n=e.x-i.x,a=e.z-i.z,o=n*i.cos-a*i.sin,s=n*i.sin+a*i.cos,c=Math.max(-i.hw,Math.min(i.hw,o)),l=Math.max(-i.hd,Math.min(i.hd,s)),u=o-c,d=s-l,f=Math.hypot(u,d);if(f<t){let n,a;f>1e-5?(n=c+u/f*t,a=l+d/f*t):i.hw-Math.abs(o)<i.hd-Math.abs(s)?(n=Math.sign(o||1)*(i.hw+t),a=s):(n=o,a=Math.sign(s||1)*(i.hd+t)),e.x=i.x+n*i.cos+a*i.sin,e.z=i.z-n*i.sin+a*i.cos,r=!0}}}return r}},Fn=class{constructor(e,t={}){this.container=e,this.opts=t,this.quality=Fe(t.quality||`high`),this.seed=t.seed||1234,this.systems=[],this.ready=!1,this.timeOfDay=17.7,this._patched=new WeakSet,this.events=new EventTarget,this.state=`boot`,this.colliders=new Pn,this._groundOverrides=[],this._shotHooks=[],this.cameraController=null,this.player=null,this.modules={},this._extraStats=[]}emit(e,t){this.events.dispatchEvent(new CustomEvent(e,{detail:t}))}on(e,t){return this.events.addEventListener(e,t),()=>this.off(e,t)}off(e,t){this.events.removeEventListener(e,t)}setState(e){if(e===this.state)return;let t=this.state;this.state=e,this.emit(`state`,{state:e,prev:t})}addGroundOverride(e){return this._groundOverrides.push(e),e}groundAt(e,t){let n=this.terrain.heightAt(e,t);for(let r of this._groundOverrides){let i=r(e,t);i!=null&&i>n&&(n=i)}return n}addStat(e){return this._extraStats.push(e),e}onShot(e){return this._shotHooks.push(e),e}_runShotHooks(e,t){for(let n of this._shotHooks)try{n(e,t)}catch(e){console.error(`[kaze] shot hook failed:`,e)}}async init(e=()=>{}){e(.05,`noise`),this.noise=Re(7),ze({uNoiseTex:{value:this.noise.texture}}),U.setNoise(this.noise),this.wind=U,this.atmosphere=Ge,Ge.install(),this.renderer=new Ce(this.container,this.quality),this.opts.deterministic&&(this.renderer.dyn.enabled=!1),this.gl=this.renderer.renderer,this.scene=new n,this.scene.fog=new d(16777215,1e-4),this.camera=new r(50,this.renderer.width/this.renderer.height,.3,2e4),this.renderer.onResize(e=>{this.camera.aspect=e.width/e.height,this.camera.updateProjectionMatrix()}),this.input=new Me(this.renderer.canvas),e(.15,`sky`),this.sky=new Ot,this.scene.add(this.sky.mesh),this.lighting=new Vt({renderer:this.gl,scene:this.scene,quality:this.quality,atmosphere:Ge,sky:this.sky}),e(.25,`terrain`),await In(),this.terrain=new $t({seed:this.seed,quality:this.quality}),this.terrain.onMaterialSwap=e=>this.patchMaterial(e),this.add(this.terrain.group),this.backdrop=new ln,this.add(this.backdrop.group),e(.6,`water`),this.water=new rn,this.water.mesh.renderOrder=5,this.add(this.water.mesh),e(.7,`grass`),await In(),this.grass=new Nn({quality:this.quality}),this.add(this.grass.group),this.post=new nt(this.renderer,this.quality),this.godRays=this.post.addHDRPass(new pt(this.post)),this.dof=this.post.addHDRPass(new mt(this.post)),e(.8,`light`),this.setTimeOfDay(this.timeOfDay),await this.terrain.loadPhotoTextures(this.gl).catch(()=>!1);let t=this.terrain.heightAt(N.spawn.x,N.spawn.z);return this.camera.position.set(N.spawn.x+12,t+1.75,N.spawn.z-6),this.camera.lookAt(N.shrine.x,t+18,N.shrine.z),this.freeCam=new Ne(this.camera,this.input,this.terrain),this.freeCam.enabled=!this.opts.noFreeCam,e(.9,`shaders`),this.renderer.canvas.addEventListener(`click`,()=>{this.freeCam.enabled&&!this.opts.shot&&this.input.requestPointerLock()}),this.loop=new we({update:(e,t)=>this.update(e,t),frame:(e,t,n,r)=>this.frame(e,t,n,r),deterministic:!!this.opts.deterministic}),this._patchNew(),await this.gl.compileAsync(this.scene,this.camera).catch(()=>{}),e(1,`ready`),this}start(){this.loop.start()}add(e){return e.parent||this.scene.add(e),e.traverse(e=>{if(!e.material)return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t)this.patchMaterial(e)}),e}remove(e){e.parent&&e.parent.remove(e)}patchMaterial(e){if(!e||this._patched.has(e))return e;this._patched.add(e);let t=e.onBeforeCompile,n=e.userData&&e.userData.onBeforeCompile;e.onBeforeCompile=function(e,r){t&&t.call(this,e,r);for(let t in H)t in e.uniforms||(e.uniforms[t]=H[t]);n&&n(e,r)};let r=e.userData&&e.userData.shaderKey||``;return e.customProgramCacheKey=()=>`kaze|`+r,e.needsUpdate=!0,e}_patchNew(){this.scene.traverse(e=>{if(!e.material)return;let t=Array.isArray(e.material)?e.material:[e.material];for(let e of t)!this._patched.has(e)&&e.type!==`ShaderMaterial`&&e.type!==`RawShaderMaterial`&&this.patchMaterial(e)})}addSystem(e){return this.systems.push(e),e}removeSystem(e){this.systems=this.systems.filter(t=>t!==e)}setTimeOfDay(e){this.timeOfDay=e,this.lighting.setTimeOfDay(e),this.terrain.bakeLighting(this.lighting.sunDir);let t=this.lighting.fill;H.uPlumeGlow&&H.uPlumeGlow.value.copy(t.color).multiplyScalar(t.intensity*.55)}setQuality(e){this.quality=Fe(e),this.renderer.setQuality(this.quality),this.lighting.setQuality(this.quality)}update(e,t){U.update(e);for(let n of this.systems)n.update&&n.update(e,t)}frame(e,t,n,r){this.input.update();for(let r of this.systems)r.frame&&r.frame(e,t,n);this.freeCam&&this.freeCam.enabled?this.freeCam.frame(e):this.cameraController&&!this.opts.shot&&this.cameraController.frame(e,t);let i=this.camera,a=this.player&&this.state===`play`?this.player.position:i.position;U.setOrigin(a.x,a.z),this.sky.update(i,e,U.uniforms.uWindDir.value),this.water.update(i),this.grass.update(i,this.renderer.renderHeight,this.gl),this.lighting.update(),this.loop.frameCount&63||this._patchNew(),this.gl.info.reset(),this.post.render(this.scene,i,U.time),this.renderer.updateDynamicResolution(r)}stats(){let e=this.gl.info;return{fps:1e3/Math.max(1,this.loop.lastFrameMs),frameMs:this.loop.lastFrameMs,calls:e.render.calls,triangles:e.render.triangles,renderScale:this.renderer.renderScale,renderSize:[this.renderer.renderWidth,this.renderer.renderHeight],quality:this.quality.name,grass:this.grass.stats(),...Object.assign({},...this._extraStats.map(e=>e()))}}};function In(){return new Promise(e=>requestAnimationFrame(()=>e()))}var Ln=Math.PI/180;function Rn(e,t,n){let r=t*Ln,i=n*Ln,a=[Math.sin(r)*Math.cos(i),Math.sin(i),-Math.cos(r)*Math.cos(i)];return{pos:e,target:[e[0]+a[0]*100,e[1]+a[1]*100,e[2]+a[2]*100]}}var zn={S1_field:{hours:18,fov:50,t0:17,sky:{cloudCover:.4,cloudSoft:.1,cloudScale:1.2,cloudOffset:[1.4,.2],sunHalo:1.3,sunSize:1.4,sunLift:.8},post:{exposure:.74,contrast:1.15,saturation:1.1,vignette:.42,splitStrength:.12,warmth:-.2},pose(e){return Rn([150,e.heightAt(150,90)+3.1,90],265,-7)}},S2_shrine:{hours:16.3,sky:{sunHalo:3.5,sunLift:5.5,sunSize:1.6,cloudCover:.2},post:{warmth:.8,splitStrength:.04,godRays:.8,exposure:.68,contrast:1,saturation:.95,vignette:.7,groundShade:.3},fov:38,t0:9,pose(e){let t;if(zn.T6_S2)t=zn.T6_S2.pose(e);else{let n=N.shrine,r=n.stairsBase.x-n.stairDir.x*9,i=n.stairsBase.z-n.stairDir.z*9,a=n.stairsTop.x,o=n.stairsTop.z;t={pos:[r,e.heightAt(r,i)+1.7,i],target:[a,e.heightAt(a,o)+7,o]}}let n=[t.target[0]-t.pos[0],t.target[1]-t.pos[1],t.target[2]-t.pos[2]],r=Math.atan2(n[0],-n[2])/Ln,i=Math.atan2(n[1],Math.hypot(n[0],n[2]))/Ln;return Rn(t.pos,r-3,i+2)}},S3_standoff:{hours:18.33,fov:38,sky:{sunSize:9,sunLift:4,sunDisc:.15,sunHalo:.6,cloudCover:.6,cloudScale:2.2,cloudSoft:.18,cloudDark:.7},post:{exposure:.52,saturation:1.05,warmth:1.1,contrast:1,splitStrength:.05,vignette:.45,bloomStrength:.3,groundShade:.55,dofAperture:.5,dofFocus:7.2,dofMaxBlur:7},t0:21,pose(e){return Rn([40,e.heightAt(40,-20)+1.45,-20],272,1.2)}},S4_title:{hours:17.95,fov:24,t0:5,sky:{cloudCover:.44,cloudSoft:.1,cloudScale:1.2,cloudOffset:[1.4,.2],sunHalo:1.5,sunSize:1.5},post:{exposure:.78,contrast:1.12,saturation:1.1,vignette:.45,splitStrength:.12},pose(e){return Rn([195,e.heightAt(195,41)+4.5,41],250.5,1)}},S5_ginkgo:{hours:17.15,fov:50,t0:17,sky:{cloudCover:.55,cloudDark:.15,cloudGlow:2.8,cloudSoft:.08,cloudScale:.7,cloudOffset:[-.6,1.8]},post:{exposure:1,contrast:1,saturation:.97,splitStrength:.05,warmth:.42,bloomStrength:.35,vignette:.45},pose(e){let t=N.camp.house,n=N.camp.view,r=1/0;for(let[n,i]of[[0,0],[-7,-5],[7,-5],[-7,5],[7,5]])r=Math.min(r,e.heightAt(t.x+n,t.z+i));let i=t.x-n.x,a=t.z-n.z,o=Math.hypot(i,a),s=a/o,c=-i/o,l=n.x+s*2,u=n.z+c*2;return{pos:[l,e.heightAt(l,u)+1.6,u],target:[t.x+s*5.5,r+8.4,t.z+c*5.5]}}}};Object.keys(zn);function Bn(e,t){let n={game:e,ready:!1,shot:null,setShot(t){let r=zn[t];if(!r)throw Error(`unknown shot `+t);n.shot=t,Math.abs(e.timeOfDay-r.hours)>1e-4&&e.setTimeOfDay(r.hours);let{pos:i,target:a}=r.pose(e.terrain),o=e.camera;return o.fov=r.fov,o.updateProjectionMatrix(),o.position.set(i[0],i[1],i[2]),o.lookAt(new k(a[0],a[1],a[2])),e.freeCam&&(e.freeCam.syncFromCamera(),e.freeCam.enabled=!1),U.setTime(r.t0||0),Object.assign(e.post.params,e.post.defaults),r.post&&Object.assign(e.post.params,r.post),e.sky.applyShot(r.sky),e._runShotHooks(t,r),n},setTime(t){return e.setTimeOfDay(t),n},stats(){return e.stats()},waitFrames(t=1){return e.loop.waitFrames(t)},measureFps(e=3e3){return new Promise(t=>{let n=[],r=performance.now(),i=r,a=o=>{if(n.push(o-r),r=o,o-i<e)requestAnimationFrame(a);else{n.shift();let e=[...n].sort((e,t)=>e-t),r=n.reduce((e,t)=>e+t,0)/Math.max(1,n.length);t({fps:1e3/r,avgMs:r,p50:e[Math.floor(e.length*.5)]||0,p95:e[Math.floor(e.length*.95)]||0,frames:n.length})}};requestAnimationFrame(a)})}};if(window.kaze=n,t&&t.has(`debug`)){let t=document.createElement(`div`);t.id=`kaze-debug`,t.style.cssText=`position:fixed;left:8px;top:8px;font:12px/1.4 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.45);padding:6px 8px;border-radius:4px;z-index:50;pointer-events:none;white-space:pre`,document.body.appendChild(t);let n=0,r=0;e.addSystem({frame(i){if(n+=e.loop.lastFrameMs,r++,r>=30){let i=e.stats(),a=e.camera.position;t.textContent=`${(1e3/(n/r)).toFixed(0)} fps  ${(n/r).toFixed(1)} ms  scale ${i.renderScale.toFixed(2)}\ncalls ${i.calls}  tris ${(i.triangles/1e6).toFixed(2)}M\npos ${a.x.toFixed(0)} ${a.y.toFixed(1)} ${a.z.toFixed(0)}  t ${e.timeOfDay.toFixed(2)}h`,n=r=0}}})}return n}var Vn=`modulepreload`,Hn=function(e,t){return new URL(e,t).href},Un={},Wn=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=Hn(t,n),t=s(t),t in Un)return;Un[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:Vn,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Gn={trees:()=>Wn(()=>import(`./trees-CtIl4fFN.js`),__vite__mapDeps([0,1,2]),import.meta.url),props:()=>Wn(()=>import(`./props-CFr1IxRj.js`),__vite__mapDeps([3,1,4,5]),import.meta.url),actors:()=>Wn(()=>import(`./actors-C7wnLYvI.js`),__vite__mapDeps([6,1,4,7,8]),import.meta.url),wildlife:()=>Wn(()=>import(`./wildlife-CnFbGFqZ.js`),__vite__mapDeps([9,1,7,5,4]),import.meta.url),ui:()=>Wn(()=>import(`./ui-OFCnlZEd.js`),__vite__mapDeps([10,1,8,11]),import.meta.url),audio:()=>Wn(()=>import(`./audio-B9-2QAYG.js`),__vite__mapDeps([12,1]),import.meta.url)};async function Kn(e,t,n=()=>{}){let r=e=>(t.params.get(e)||``).split(`,`).filter(Boolean),i=r(`only`),a=r(`no`),o=Object.keys(Gn).filter(e=>(!i.length||i.includes(e))&&!a.includes(e));e.modules={};for(let r=0;r<o.length;r++){let i=o[r];try{let n=await Gn[i]();e.modules[i]=await n.install(e,t)||!0}catch(e){console.error(`[kaze] module "${i}" failed to install:`,e)}n((r+1)/o.length,i)}}var qn=new URLSearchParams(location.search),Jn=qn.get(`shot`),Q=document.getElementById(`boot`),Yn=Q&&Q.querySelector(`.bar i`);Jn&&Q&&(Q.style.display=`none`);var $=new Fn(document.getElementById(`app`),{quality:qn.get(`quality`)||`high`,seed:Number(qn.get(`seed`))||1234,shot:Jn,deterministic:!!Jn||qn.has(`deterministic`),noFreeCam:!1}),Xn=Bn($,qn);$.init(e=>{Yn&&(Yn.style.width=`${Math.round(e*100)}%`)}).then(async()=>{if(qn.has(`grass`)){let e=qn.get(`grass`).split(`,`);for(let t of $.grass.layers)t.mesh.visible=e.includes(t.kind)}await Kn($,{params:qn,shot:Jn},e=>{Yn&&(Yn.style.width=`${Math.round(90+e*10)}%`)}),$._patchNew(),await $.gl.compileAsync($.scene,$.camera).catch(()=>{}),Jn?($.setState(`shot`),Xn.setShot(Jn)):$.setState($.modules.ui?`title`:`play`),$.start(),await $.loop.waitFrames(3),Q&&(Q.classList.add(`hide`),setTimeout(()=>Q.remove(),900)),Xn.ready=!0,window.dispatchEvent(new CustomEvent(`kaze:ready`,{detail:$})),$.on(`ui:quit`,()=>location.reload())}).catch(e=>{console.error(e),Q&&(Q.textContent=`Errore di avvio: `+e.message)});export{U as a,H as c,ht as i,Rn as n,rt as o,Bt as r,$e as s,zn as t};