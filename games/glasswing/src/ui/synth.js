// Procedural WebAudio sound (no audio files): layered hits, telegraph colours, the parry ting, stingers, the kill
// crescendo and the heartbeat. Works on any BaseAudioContext (live AudioContext, or OfflineAudioContext for demos).
// Live side only: it reads nothing from the simulation; the director (director.js) turns state changes into calls.
import {MIX,TELL,HEART,THEMES} from './sonic.js';

const NODES=['createOscillator','createGain','createBiquadFilter','createBufferSource','createBuffer',
 'createDynamicsCompressor','createWaveShaper','createConvolver'];
export const canSynth=ctx=>!!ctx&&NODES.every(n=>typeof ctx[n]==='function');
export const hz=n=>440*2**((n-69)/12);
const LOW=.0001;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Scale degree of a theme -> MIDI note (degrees wrap octaves).
export function degree(T,d,octave=0){const o=Math.floor(d/7),i=((d%7)+7)%7;return T.root+T.scale[i]+12*(o+octave);}

export class Synth{
 constructor(ctx,{destination=ctx.destination,seed=0x2545f491}={}){
  this.ctx=ctx;this.voices=new Set();this.playing=[];this.seed=seed>>>0||1;this.last=new Map();this.trace=null;
  const g=v=>{const n=ctx.createGain();n.gain.value=v;return n;};
  this.master=g(MIX.master);
  const c=this.comp=ctx.createDynamicsCompressor();
  for(const [k,v] of Object.entries({threshold:-14,knee:10,ratio:4,attack:.003,release:.22}))if(c[k]&&'value' in c[k])c[k].value=v;
  this.master.connect(c);c.connect(destination);
  this.sfx=g(1);this.cues=g(1);this.music=g(1);this.duckGain=g(1);
  this.muffle=ctx.createBiquadFilter();this.muffle.type='lowpass';this.muffle.frequency.value=MIX.muffle.open;
  this.music.connect(this.duckGain);this.duckGain.connect(this.muffle);this.muffle.connect(this.master);
  this.sfx.connect(this.master);this.cues.connect(this.master);
  // Hits run through a soft clipper first: grit and loudness without digital clipping.
  this.drive=ctx.createWaveShaper();this.drive.curve=driveCurve(MIX.impactDrive);this.drive.connect(this.sfx);
  // One shared hall reverb (the dead god's ribcage) fed by per-voice sends.
  this.reverb=ctx.createConvolver();this.reverb.buffer=this.impulse(2.6);this.reverbIn=g(MIX.reverb);
  this.reverbIn.connect(this.reverb);this.reverb.connect(this.master);
  this.noise=this.noiseBuffer(1);
 }
 rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 noiseBuffer(seconds){
  const n=Math.max(1,Math.floor(this.ctx.sampleRate*seconds)),b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=this.rand()*2-1;return b;
 }
 impulse(seconds){
  const sr=this.ctx.sampleRate,n=Math.max(1,Math.floor(sr*seconds)),b=this.ctx.createBuffer(2,n,sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++){const t=i/n;d[i]=(this.rand()*2-1)*(1-t)**3.2*(i<sr*.012?i/(sr*.012):1);}}
  return b;
 }
 // Bus levels follow the options sliders; music fades rather than steps.
 // Automation is added only when a value changes: per-frame events would pile up on the param timelines.
 levels({sfx=1,cues=1,music=1},now){
  const l=this.level||(this.level={});
  if(l.sfx!==sfx)set(this.sfx.gain,l.sfx=sfx,now,.04);
  if(l.cues!==cues)set(this.cues.gain,l.cues=cues,now,.04);
  if(l.music!==music)set(this.music.gain,l.music=music,now,.3);
 }
 setMuffle(freq,now){if(this.muffled!==freq)set(this.muffle.frequency,this.muffled=freq,now,.25);}
 // Sidechain feel: music dips under big moments and comes back.
 // A lighter duck never cuts short a deeper one still holding (a hit after the kill keeps the score out).
 duck(amount,when,hold=.15){
  const d=this.ducked;if(d&&when<d.until&&amount<=d.amount)return;
  this.ducked={amount,until:when+hold};
  const p=this.duckGain.gain;p.cancelScheduledValues?.(when);
  p.setTargetAtTime(clamp(1-amount,0,1),when,.012);p.setTargetAtTime(1,when+hold,MIX.duck.recover);
 }
 // A voice: an output gain (optionally panned, optionally sent to the reverb) that cleans itself up.
 begin(bus,{pan=0,send=0,when=this.ctx.currentTime,priority=5,gain=1}={}){
  // The cap counts voices still sounding at `when` (sources end on the audio clock, which an offline render or a
  // look-ahead schedule reaches only later); the quietest-priority one gives way to a more important sound.
  this.playing=this.playing.filter(v=>v.end>when&&this.voices.has(v));
  if(this.playing.length>=MIX.voices){
   let low=null;for(const v of this.playing)if(!low||v.priority<low.priority)low=v;
   if(!low||low.priority>=priority)return null;
   this.release(low);this.playing.splice(this.playing.indexOf(low),1);
  }
  const ctx=this.ctx,out=ctx.createGain();out.gain.value=gain;
  const v={out,nodes:[out],sources:[],count:0,priority,when,end:when};
  let tail=out;
  if(pan&&typeof ctx.createStereoPanner==='function'){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);out.connect(p);v.nodes.push(p);tail=p;}
  tail.connect(bus);
  if(send>0){const s=ctx.createGain();s.gain.value=send;out.connect(s);s.connect(this.reverbIn);v.nodes.push(s);}
  this.voices.add(v);this.playing.push(v);return v;
 }
 source(v,node,when,end){
  v.nodes.push(node);v.sources.push(node);v.count++;v.end=Math.max(v.end,end);
  node.onended=()=>{if(--v.count<=0)this.finish(v);};
  node.start(when);node.stop(end);return node;
 }
 finish(v){
  if(!this.voices.has(v))return;
  this.voices.delete(v);for(const n of v.nodes)try{n.disconnect();}catch{}
 }
 release(v){for(const s of v.sources)try{s.onended=null;s.stop();}catch{}this.finish(v);}
 stopVoices(){for(const v of [...this.voices])if(!v.music)this.release(v);}
 // An envelope gain: attack to peak, optional hold, exponential decay. Returns the gain node.
 env(v,when,{a=.002,peak=.3,d=.2,hold=0}={},into=v.out){
  const g=this.ctx.createGain(),p=g.gain;
  p.setValueAtTime(LOW,when);p.linearRampToValueAtTime(peak,when+a);
  if(hold)p.setValueAtTime(peak,when+a+hold);
  p.exponentialRampToValueAtTime(LOW,when+a+hold+d);
  g.connect(into);v.nodes.push(g);return g;
 }
 filter(v,type,f,q=.7){const n=this.ctx.createBiquadFilter();n.type=type;n.frequency.value=f;n.Q.value=q;v.nodes.push(n);return n;}
 // A pitched partial with an optional glide.
 tone(v,when,{type='sine',f=440,to=0,glide=0,a=.002,peak=.2,d=.2,hold=0,filter=null,detune=0}={}){
  const o=this.ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,when);
  if(detune&&o.detune)o.detune.value=detune;
  if(to)o.frequency.exponentialRampToValueAtTime(Math.max(1,to),when+(glide||a+hold+d));
  // A filter sits after the envelope, so several tones may share one (a chord through one lowpass).
  if(filter&&!filter.routed){filter.connect(v.out);filter.routed=true;}
  const g=this.env(v,when,{a,peak,d,hold},filter||v.out);o.connect(g);
  this.source(v,o,when,when+a+hold+d+.03);return o;
 }
 // Filtered noise with an optional filter sweep.
 hiss(v,when,{type='bandpass',f=1000,to=0,q=.8,a=.002,peak=.2,d=.1,hold=0}={}){
  const n=this.ctx.createBufferSource();n.buffer=this.noise;n.loop=true;
  const fl=this.filter(v,type,f,q);if(to)fl.frequency.exponentialRampToValueAtTime(Math.max(20,to),when+a+hold+d);
  const g=this.env(v,when,{a,peak,d,hold});n.connect(fl);fl.connect(g);
  const end=when+a+hold+d+.03;v.nodes.push(n);v.sources.push(n);v.count++;v.end=Math.max(v.end,end);
  n.onended=()=>{if(--v.count<=0)this.finish(v);};n.start(when,this.rand()*.9);n.stop(end);return n;
 }
 // Inharmonic bell: [ratio, gain, decay scale] partials.
 bell(v,when,f,partials,{peak=.2,d=.8,a=.0015}={}){
  for(const [r,g,k] of partials)this.tone(v,when,{f:f*r,a,peak:peak*g,d:d*k});
 }
 lfo(v,when,end,rate,param,depth){
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=rate;g.gain.value=depth;
  o.connect(g);g.connect(param);v.nodes.push(g);this.source(v,o,when,end);
 }
 // Entry point: a named cue (sim cue, director event or hook) at an absolute context time.
 play(name,opts={},when=this.ctx.currentTime){
  const patch=PATCHES[name];if(!patch)return null;
  const gap=MIX.repeat[name]??MIX.repeat.default,key=name+(opts.id??'');
  if(!opts.force&&when-(this.last.get(key)??-1)<gap)return null;
  this.last.set(key,when);
  const v=patch(this,opts,when);
  if(this.trace)this.trace.push({name,when,opts,sources:v?.sources?.length||0});
  return v;
 }
}
export const hasPatch=name=>Object.hasOwn(PATCHES,name);
function set(param,value,now,tau){if(param.setTargetAtTime)param.setTargetAtTime(value,now,tau);else param.value=value;}
function driveCurve(k){const n=1024,c=new Float32Array(n),t=Math.tanh(k);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/t;}return c;}

// ---------- patches ----------
function whoosh(S,o,t,{f,to,d,peak,q=1.3,send=0}){
 const v=S.begin(S.sfx,{pan:o.pan,when:t,priority:2,send});if(!v)return null;
 S.hiss(v,t,{f,to,q,a:d*.35,peak,d:d*.65});return v;
}
function impact(S,o,t){
 if(o.chip)return bone(S,o,t);
 const w=clamp(o.weight??1,0,3)|0,r=1+(S.rand()-.5)*.07;
 const v=S.begin(S.drive,{pan:o.pan,when:t,priority:5+w,send:.08+.05*w});if(!v)return null;
 // Transient click, then a body thump whose size grows with the weight.
 S.hiss(v,t,{type:'highpass',f:3200,q:.7,peak:.45+.08*w,d:.014});
 S.tone(v,t,{f:[190,165,140,118][w]*r,to:44,glide:.09+.04*w,peak:.5+.14*w,d:.12+.07*w});
 if(w>=1)S.hiss(v,t,{f:(1700-260*w)*r,q:.9,peak:.26+.1*w,d:.05+.05*w});
 if(w>=2)S.tone(v,t,{f:66*r,to:29,glide:.42,peak:.62,d:.44});
 if(w>=3){
  S.tone(v,t+.042,{f:96*r,to:36,glide:.3,peak:.55,d:.32});
  S.hiss(v,t+.01,{type:'lowpass',f:1100,to:220,peak:.24,a:.004,d:.75});
 }
 // An amber opening rings warm: the hit landed where it counts.
 if(o.amber){
  const f=880*r;
  for(const [k,g,d] of [[1,.12,.55],[2.32,.07,.34],[3.96,.045,.22],[5.6,.02,.12]])S.tone(v,t,{type:'triangle',f:f*k,peak:g,d});
  S.tone(v,t,{f:1300,to:2600,glide:.05,peak:.05,d:.06});
 }
 if(o.shield)S.tone(v,t,{type:'triangle',f:610*r,peak:.1,d:.16});
 S.duck(MIX.duck.hit[w],t,.1+.08*w);
 return v;
}
// Ivory armour chip: a dull bone knock, deliberately small next to an opening hit.
function bone(S,o,t){
 const v=S.begin(S.sfx,{pan:o.pan,when:t,priority:3});if(!v)return null;
 const r=1+(S.rand()-.5)*.1;
 S.hiss(v,t,{f:900*r,q:4,peak:.22,d:.035});S.tone(v,t,{type:'triangle',f:310*r,to:190,glide:.03,peak:.16,d:.05});
 return v;
}
function shatter(S,v,t,n,peak=.06){
 S.hiss(v,t,{type:'highpass',f:2800,peak:.28,d:.34});
 for(let i=0;i<n;i++){const at=t+S.rand()*S.rand()*.6;S.tone(v,at,{f:2000+S.rand()*4600,peak:peak*(.5+S.rand()*.5),d:.05+S.rand()*.18});}
}
function killPop(S,o,t){
 const w=clamp(o.weight??1,1,3);
 const v=S.begin(S.drive,{pan:o.pan,when:t,priority:6,send:.2});if(!v)return null;
 S.tone(v,t,{f:210,to:58,glide:.12,peak:.42+.08*w,d:.16});shatter(S,v,t+.01,5+3*w,.05);
 S.tone(v,t+.02,{type:'triangle',f:hz(81),to:hz(69),glide:.25,peak:.05,d:.3});
 return v;
}
function tellIvory(S,o,t){
 const T=TELL.ivory,boss=!!o.boss,soft=!!o.soft;
 const v=S.begin(S.cues,{pan:o.pan,when:t,priority:boss?8:6,send:.35,gain:soft?.55:boss?1.25:.8});if(!v)return null;
 for(const f of T.notes)S.bell(v,t,f,[[1,1,1],[2.01,.28,.45],[3.0,.12,.25]],{peak:T.gain,d:T.decay,a:.004});
 if(boss)for(const f of T.boss)S.bell(v,t,f,[[1,1,1],[2,.3,.5]],{peak:T.gain*.9,d:T.decay*1.4,a:.004});
 if(!soft)S.duck(MIX.duck.tell,t,.22);
 return v;
}
function tellCyan(S,o,t){
 const T=TELL.cyan,boss=!!o.boss,d=T.decay*(boss?1.25:1),end=t+.03+d;
 const v=S.begin(S.cues,{pan:o.pan,when:t,priority:boss?8:6,send:.25,gain:(boss?1.3:.85)*(o.soft?.6:1)});if(!v)return null;
 // A swelling, beating cluster that slides up, under a glass scrape, all shivering: cold and wrong.
 const trem=S.ctx.createGain();trem.gain.value=.65;trem.connect(v.out);v.nodes.push(trem);
 S.lfo(v,t,end,T.tremolo,trem.gain,.35);
 const sub={out:trem};
 for(const f of T.notes){
  const o2=S.ctx.createOscillator();o2.type='sine';o2.frequency.setValueAtTime(f,t);o2.frequency.exponentialRampToValueAtTime(f*T.glide,t+d);
  const g=S.ctx.createGain(),p=g.gain;p.setValueAtTime(LOW,t);p.linearRampToValueAtTime(T.gain,t+.03);p.exponentialRampToValueAtTime(LOW,t+.03+d);
  o2.connect(g);g.connect(sub.out);v.nodes.push(g);S.source(v,o2,t,end+.03);
 }
 S.hiss(v,t,{f:3000,to:7200,q:8,a:.03,peak:.12,d});
 if(boss)S.tone(v,t,{type:'triangle',f:hz(45),to:hz(44),glide:d,a:.03,peak:.07,d});
 if(!o.soft)S.duck(MIX.duck.tell,t,.22);
 return v;
}
function tellDelayed(S,o,t){
 const v=tellIvory(S,{...o,boss:true},t);if(!v)return null;
 // The held breath: a wavering tone, then a second, later chime (delayed variants have their own sound).
 S.tone(v,t+.04,{type:'triangle',f:1318.5,to:1244.5,glide:.28,peak:.05,d:.3});
 S.bell(v,t+.26,1975.5,[[1,1,1],[2,.25,.4]],{peak:.09,d:.35});return v;
}
function strike(S,o,t,colour){
 const v=S.begin(S.cues,{pan:o.pan,when:t,priority:7,send:.15,gain:o.boss?1.1:.7});if(!v)return null;
 if(colour==='ivory'){S.hiss(v,t,{type:'highpass',f:5200,peak:.18,d:.08});S.tone(v,t,{f:TELL.release.ivory,peak:.07,d:.12});}
 else{S.hiss(v,t,{type:'highpass',f:2600,peak:.3,d:.05});S.tone(v,t,{type:'triangle',f:TELL.release.cyan,to:300,glide:.1,peak:.1,d:.1});}
 return v;
}
function parry(S,o,t){
 const v=S.begin(S.sfx,{pan:o.pan,when:t,priority:9,send:.45});if(!v)return null;
 // The 'ting': a high, hard, inharmonic bell over a click and a low thoom; music holds its breath.
 S.hiss(v,t,{type:'highpass',f:6000,peak:.4,d:.007});
 S.bell(v,t,2349.3,[[1,1,1.6],[2.0,.38,.6],[2.76,.32,.35],[5.4,.18,.15],[8.93,.09,.08]],{peak:.3,d:.9,a:.001});
 S.tone(v,t,{f:196,to:98,glide:.2,peak:.26,d:.22});
 S.duck(MIX.duck.parry,t,.2);return v;
}
function clank(S,o,t){
 const v=S.begin(S.sfx,{pan:o.pan,when:t,priority:6,send:.15});if(!v)return null;
 S.hiss(v,t,{type:'highpass',f:3500,peak:.26,d:.03});
 for(const [f,g,d] of [[523,.13,.22],[1336,.08,.16],[2117,.06,.1],[3020,.03,.07]])S.tone(v,t,{type:f<600?'triangle':'sine',f,peak:g,d});
 return v;
}
function stinger(S,o,t){
 const T=THEMES[o.theme]||THEMES.imago,iv=T.stinger||[0,3,7,10],phase=o.phase||2,root=T.root+12;
 const v=S.begin(S.cues,{when:t,priority:9,send:.4});if(!v)return null;
 const lp=S.filter(v,'lowpass',260,1.2);lp.frequency.setValueAtTime(260,t);lp.frequency.exponentialRampToValueAtTime(3400,t+.22);lp.frequency.exponentialRampToValueAtTime(700,t+1.7);
 const g=S.env(v,t,{a:.03,peak:1,hold:.25,d:1.5});lp.connect(g);
 const notes=iv.map(i=>root+i);if(phase>=3)notes.push(root-12,root+iv[1]+12);
 for(const n of notes)for(const det of [-9,9]){
  const o2=S.ctx.createOscillator();o2.type='sawtooth';o2.frequency.value=hz(n);if(o2.detune)o2.detune.value=det;
  const a=S.ctx.createGain();a.gain.value=.055;o2.connect(a);a.connect(lp);v.nodes.push(a);S.source(v,o2,t,t+1.85);
 }
 // A timpani hit and its rolling tail.
 S.tone(v,t,{f:hz(T.root-12),to:hz(T.root-14),glide:.8,peak:.75,d:.9});
 S.hiss(v,t,{type:'lowpass',f:3000,to:300,peak:.3,d:1.1});
 for(let i=1;i<6;i++)S.tone(v,t+.8+i*.07,{f:hz(T.root-12),to:hz(T.root-13),glide:.2,peak:.18/i,d:.25});
 // Phase 3 adds a high glass swell in the boss's key; never the cyan tell itself (that sound means "an unparryable strike is coming").
 if(phase>=3)glassSwell(S,v,T,t+.05,.035);
 S.duck(MIX.duck.stinger,t,1.1);return v;
}
// A cold, falling swell on the theme's stinger notes (MIDI <= 97, below every cyan tell partial): menace without a false tell.
function glassSwell(S,v,T,t,peak){
 for(const i of T.stinger||[0,3,7,10]){const f=hz(T.root+36+i);S.tone(v,t,{f,to:f*.97,glide:1.3,a:.22,peak,d:1.1});}
}
function desperation(S,o,t){
 const T=THEMES[o.theme]||THEMES.imago,v=S.begin(S.cues,{when:t,priority:10,send:.5});if(!v)return null;
 // Rising noise into a dissonant glass cluster and a sub drop: the boss's own Glass.
 S.hiss(v,t,{type:'highpass',f:400,to:6000,q:.6,a:.5,peak:.25,d:.25});
 S.tone(v,t+.45,{f:hz(T.root-12),to:hz(T.root-24),glide:1.2,peak:.8,d:1.4});
 for(const n of [0,1,6,11])S.tone(v,t+.45,{type:'sawtooth',f:hz(T.root+24+n),a:.02,peak:.035,hold:.3,d:1.2,detune:S.rand()*20-10});
 shatter(S,v,t+.45,14,.07);glassSwell(S,v,T,t+.5,.045);
 S.duck(.8,t+.4,1.5);return v;
}
function crescendo(S,o,t){
 const T=THEMES[o.theme]||THEMES.imago,v=S.begin(S.cues,{when:t,priority:10,send:.55});if(!v)return null;
 // The kill: a boom and a shatter, a swelling chord, then it resolves to major (the light is yours now).
 S.tone(v,t,{f:58,to:26,glide:2,peak:1,d:2.1});S.hiss(v,t,{type:'lowpass',f:6000,to:250,peak:.5,d:2.6});shatter(S,v,t,22,.08);
 const sw=S.filter(v,'lowpass',300,1);sw.frequency.setValueAtTime(300,t+.25);sw.frequency.exponentialRampToValueAtTime(3800,t+1.75);
 const sg=S.ctx.createGain(),p=sg.gain;p.setValueAtTime(LOW,t+.25);p.exponentialRampToValueAtTime(.9,t+1.72);p.exponentialRampToValueAtTime(LOW,t+1.95);
 sw.connect(sg);sg.connect(v.out);v.nodes.push(sg);
 for(const d of [0,2,4,7]){const o2=S.ctx.createOscillator();o2.type='sawtooth';o2.frequency.setValueAtTime(hz(degree(T,d,1)),t+.25);o2.frequency.exponentialRampToValueAtTime(hz(degree(T,d,1))*1.02,t+1.75);
  const a=S.ctx.createGain();a.gain.value=.05;o2.connect(a);a.connect(sw);v.nodes.push(a);S.source(v,o2,t+.25,t+2);}
 const r=T.root+12,at=t+1.75,warm=S.filter(v,'lowpass',2400,.5);
 for(const n of [r-12,r,r+4,r+7,r+12,r+16])S.tone(v,at,{type:n<r?'sawtooth':'triangle',f:hz(n),a:.01,peak:n<r?.06:.09,d:3.6,filter:warm});
 S.bell(v,at,hz(r+24),[[1,1,1],[2.76,.3,.4],[5.4,.12,.2]],{peak:.12,d:2.4});
 S.tone(v,at,{f:hz(r-24),peak:.5,d:1.6});
 S.duck(MIX.duck.kill,t,4);return v;
}
function heartbeat(S,o,t){
 const v=S.begin(S.cues,{when:t,priority:4,gain:HEART.gain*(o.level>1?1.15:1)});if(!v)return null;
 const lp=S.filter(v,'lowpass',180,.5);
 S.tone(v,t,{f:64,to:40,glide:.16,a:.006,peak:.9,d:.17,filter:lp});
 S.tone(v,t+.15,{f:56,to:36,glide:.14,a:.006,peak:.6,d:.15,filter:S.filter(v,'lowpass',160,.5)});
 return v;
}
function roar(S,o,t){
 const v=S.begin(S.cues,{when:t,priority:8,send:.4});if(!v)return null;
 const bp=S.filter(v,'bandpass',260,2.6);const f=bp.frequency;f.setValueAtTime(260,t);f.linearRampToValueAtTime(720,t+.42);f.exponentialRampToValueAtTime(230,t+1.35);
 const g=S.env(v,t,{a:.12,peak:1,hold:.45,d:.85});bp.connect(g);
 for(const [hzv,type] of [[52,'sawtooth'],[78,'sawtooth'],[104,'square']]){
  const o2=S.ctx.createOscillator();o2.type=type;o2.frequency.value=hzv;const a=S.ctx.createGain();a.gain.value=type==='square'?.12:.3;
  o2.connect(a);a.connect(bp);v.nodes.push(a);S.source(v,o2,t,t+1.5);S.lfo(v,t,t+1.5,6.3,o2.frequency,hzv*.06);
 }
 S.hiss(v,t,{f:900,q:1.6,a:.1,hold:.3,peak:.16,d:.8});
 S.tone(v,t,{f:46,to:34,glide:1.3,a:.1,peak:.4,d:1.2});
 return v;
}
function arp(S,o,t,notes,{gap=.08,type='triangle',peak=.09,d=.4,bus=S.sfx,send=.3,chord=0}={}){
 const v=S.begin(bus,{when:t,priority:7,send});if(!v)return null;
 notes.forEach((n,i)=>S.tone(v,t+i*gap,{type,f:hz(n),peak,d}));
 if(chord)for(const n of notes)S.tone(v,t+notes.length*gap,{type,f:hz(n),a:.01,peak:peak*.7,d:chord});
 return v;
}
function crack(S,o,t,k){
 const v=S.begin(S.sfx,{when:t,priority:8,send:.2});if(!v)return null;
 S.hiss(v,t,{f:2400+600*k,q:2,peak:.3,d:.05});S.tone(v,t,{f:1500+320*k,to:700,glide:.08,peak:.1,d:.09});
 S.tone(v,t,{f:130,to:60,glide:.12,peak:.3,d:.13});return v;
}
function crackle(S,v,t,n,span,{f=3000,peak=.1,rise=0}={}){
 for(let i=0;i<n;i++){const k=i/n;S.hiss(v,t+k*span+S.rand()*.02,{type:'bandpass',f:f*(1+rise*k),q:5,peak:peak*(.5+S.rand()*.5),d:.012});}
}
const sig=(fn,prio=7,send=.3)=>(S,o,t)=>{const v=S.begin(S.cues,{pan:o.pan,when:t,priority:prio,send});if(!v)return null;fn(S,v,t,o);return v;};

const PATCHES={
 // Sim cues (src/data/audio.js SOUND_CUES).
 step1:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:0});if(v)S.hiss(v,t,{type:'lowpass',f:520,peak:.08,d:.03});return v;},
 step2:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:0});if(v)S.hiss(v,t,{type:'lowpass',f:640,peak:.07,d:.03});return v;},
 jump:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:2});if(v){S.hiss(v,t,{type:'lowpass',f:900,peak:.12,d:.06});S.tone(v,t,{f:280,to:430,glide:.07,peak:.05,d:.07});}return v;},
 doublejump:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:2,send:.1});if(v){S.hiss(v,t,{f:700,q:1.2,peak:.16,d:.06});S.hiss(v,t+.07,{f:620,q:1.2,peak:.12,d:.07});}return v;},
 land:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:2});if(v){S.hiss(v,t,{type:'lowpass',f:320,peak:.26,d:.08});S.tone(v,t,{f:96,to:48,glide:.1,peak:.26,d:.1});}return v;},
 punch1:(S,o,t)=>whoosh(S,o,t,{f:520,to:1900,d:.09,peak:.13}),
 punch2:(S,o,t)=>whoosh(S,o,t,{f:600,to:2100,d:.09,peak:.13}),
 punch3:(S,o,t)=>whoosh(S,o,t,{f:400,to:1700,d:.13,peak:.2}),
 kick:(S,o,t)=>whoosh(S,o,t,{f:300,to:1500,d:.13,peak:.21}),
 divekick:(S,o,t)=>whoosh(S,o,t,{f:2600,to:480,d:.16,peak:.2}),
 'sword-swing':(S,o,t)=>whoosh(S,o,t,{f:700,to:3900,d:.14,peak:.22,q:1.6,send:.08}),
 rush:(S,o,t)=>whoosh(S,o,t,{f:300,to:2200,d:.26,peak:.26,send:.15}),
 'sword-hit':(S,o,t)=>impact(S,{weight:2,...o},t),
 'blast-hit':(S,o,t)=>impact(S,{weight:1,...o},t),
 pogo:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:4});if(v)S.tone(v,t,{f:320,to:980,glide:.1,peak:.14,d:.11});return v;},
 'blast-fire':(S,o,t)=>{const v=S.begin(S.sfx,{pan:o.pan,when:t,priority:3,send:.1});if(v){S.tone(v,t,{type:'square',f:900,to:240,glide:.14,peak:.06,d:.14});S.hiss(v,t,{f:1300,peak:.1,d:.08});}return v;},
 dodge:(S,o,t)=>whoosh(S,o,t,{f:1300,to:380,d:.18,peak:.16,q:.8,send:.1}),
 'player-hit':(S,o,t)=>{const v=S.begin(S.drive,{when:t,priority:8});if(v){S.tone(v,t,{f:150,to:48,glide:.18,peak:.62,d:.2});S.hiss(v,t,{type:'lowpass',f:1300,peak:.3,d:.12});S.duck(.45,t,.25);}return v;},
 'mask-crack1':(S,o,t)=>crack(S,o,t,1),'mask-crack2':(S,o,t)=>crack(S,o,t,2),'mask-crack3':(S,o,t)=>crack(S,o,t,3),
 'mask-shatter':(S,o,t)=>{const v=S.begin(S.drive,{when:t,priority:9,send:.4});if(v){S.tone(v,t,{f:120,to:42,glide:.3,peak:.7,d:.34});shatter(S,v,t,16,.07);S.duck(.6,t,.5);}return v;},
 'shard-pickup':(S,o,t)=>arp(S,o,t,[91,96,100],{gap:.05,type:'sine',peak:.07,d:.25}),
 'altar-chime':(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:6,send:.55});if(v)for(const n of [72,76,79,83])S.bell(v,t,hz(n),[[1,1,1],[2.76,.2,.3]],{peak:.07,d:1.6});return v;},
 'enemy-telegraph':(S,o,t)=>{const v=S.begin(S.cues,{pan:o.pan,when:t,priority:4});if(v)S.hiss(v,t,{f:500,to:1500,q:2,a:.12,peak:.07,d:.1});return v;},
 'enemy-beaten':(S,o,t)=>killPop(S,o,t),
 'boss-roar':roar,
 'round-win':(S,o,t)=>arp(S,o,t,[72,76,79,84],{gap:.09,peak:.1,d:.45,chord:1.6}),
 'run-win':(S,o,t)=>arp(S,o,t,[67,72,76,79,84],{gap:.1,peak:.1,d:.5,chord:2.2,send:.5}),
 'run-lost':(S,o,t)=>arp(S,o,t,[57,53,50,45],{gap:.26,type:'sawtooth',peak:.05,d:.9,send:.4}),
 'menu-move':(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:1});if(v)S.tone(v,t,{f:880,peak:.05,d:.03});return v;},
 'menu-select':(S,o,t)=>arp(S,o,t,[76,83],{gap:.05,type:'sine',peak:.07,d:.08,send:.1}),
 block:clank,
 parry,
 // Mend (src/game/mend.js): a rising three-note chime while the cocoon knits, a bright close, a dull snap when struck.
 mend1:(S,o,t)=>arp(S,o,t,[72],{type:'sine',peak:.07,d:.3,send:.4}),
 mend2:(S,o,t)=>arp(S,o,t,[76],{type:'sine',peak:.07,d:.3,send:.4}),
 mend3:(S,o,t)=>arp(S,o,t,[79],{type:'sine',peak:.08,d:.35,send:.4}),
 mend:(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:6,send:.5});if(v)for(const n of [84,88,91,96])S.bell(v,t,hz(n),[[1,1,1],[2.76,.2,.3]],{peak:.06,d:1.1});return v;},
 'mend-break':(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:7,send:.2});if(v){S.tone(v,t,{f:140,to:60,glide:.18,peak:.3,d:.2});shatter(S,v,t,6,.05);}return v;},
 'mend-fail':(S,o,t)=>{const v=S.begin(S.sfx,{when:t,priority:3});if(v){S.tone(v,t,{type:'square',f:230,to:170,glide:.12,peak:.04,d:.13});S.hiss(v,t,{type:'lowpass',f:700,peak:.08,d:.07});}return v;},
 'ember-full':(S,o,t)=>arp(S,o,t,[88,95],{gap:.05,type:'sine',peak:.06,d:.25,send:.35}),
 // Director events and hooks (src/ui/sonic.js HOOK_CUES).
 impact,
 heartbeat,
 'tell-ivory':tellIvory,'tell-cyan':tellCyan,'tell-delayed':tellDelayed,
 'strike-ivory':(S,o,t)=>strike(S,o,t,'ivory'),'strike-cyan':(S,o,t)=>strike(S,o,t,'cyan'),
 'boss-phase':stinger,'boss-desperation':desperation,'boss-kill':crescendo,'enemy-kill':killPop,
 'boss-opening':(S,o,t)=>arp(S,o,t,[81,85,88,93],{gap:.045,peak:.12,d:.35,bus:S.cues,send:.35}),
 'boss-break':(S,o,t)=>{const v=impact(S,{weight:3,...o},t);if(v)shatter(S,v,t,10,.06);return v;},
 'tallowgrave-snuff':sig((S,v,t)=>{S.hiss(v,t,{f:1200,to:200,q:1,a:.02,peak:.2,d:.45});S.tone(v,t,{f:180,to:60,glide:.4,peak:.12,d:.4});}),
 'tallowgrave-ignite':sig((S,v,t)=>{S.hiss(v,t,{type:'lowpass',f:200,to:4000,a:.25,peak:.3,d:.6});crackle(S,v,t+.1,10,.8,{f:2500,peak:.12});}),
 'antiphon-echo':sig((S,v,t)=>{for(let i=0;i<4;i++)S.bell(v,t+i*.18,1046.5*(1-.012*i),[[1,1,1],[2.76,.25,.3]],{peak:.14*.5**i,d:.5});},7,.6),
 'antiphon-mirror':sig((S,v,t)=>{for(const f of [1760,2217.5,2637,3520])S.tone(v,t,{f,a:.15,peak:.04,d:.8});},6,.6),
 'anchorite-turn':sig((S,v,t)=>{S.hiss(v,t,{f:180,q:3,a:.3,peak:.35,d:.8});S.tone(v,t,{type:'sawtooth',f:70,to:55,glide:1,a:.2,peak:.05,d:.9});},8,.35),
 'anchorite-tick':sig((S,v,t)=>{S.tone(v,t,{f:1800,peak:.12,d:.03});S.tone(v,t,{f:1200,peak:.1,d:.04});S.hiss(v,t,{f:2500,q:3,peak:.1,d:.01});},5,.15),
 'cordycea-bloom':sig((S,v,t)=>{S.tone(v,t,{f:300,to:120,glide:.08,peak:.3,d:.08});S.hiss(v,t,{f:800,q:4,peak:.15,d:.15});S.hiss(v,t+.05,{type:'highpass',f:6000,a:.1,peak:.06,d:.5});}),
 'cordycea-wall':sig((S,v,t)=>{crackle(S,v,t,14,.6,{f:1200,peak:.12,rise:2});S.tone(v,t,{f:90,a:.1,peak:.12,d:.7});},7,.3),
 'exuvial-hook':sig((S,v,t)=>{S.hiss(v,t,{f:3000,to:1200,q:10,peak:.25,d:.3});S.tone(v,t,{type:'sawtooth',f:400,to:900,glide:.2,peak:.04,d:.2});}),
 'exuvial-shed':sig((S,v,t)=>{S.hiss(v,t,{f:2000,to:300,q:2,a:.01,peak:.3,d:.35});crackle(S,v,t,8,.35,{f:3500,peak:.1});})
};
