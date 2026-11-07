// Procedural music with intensity layers (pad, bass, drums, motif, storm), one theme per area and per boss.
// A look-ahead step sequencer on the audio clock: schedule(now) fills the next fraction of a second.
import {THEMES,KITS,LAYERS,INTENSITY} from './sonic.js';
import {hz,degree} from './synth.js';

const LEVEL=[.9,.85,.8,.75,.7];
export class Music{
 constructor(synth){
  this.S=synth;const ctx=synth.ctx;
  this.section=ctx.createGain();this.section.gain.value=0;this.section.connect(synth.music);
  this.layers=LAYERS.map(()=>{const g=ctx.createGain();g.gain.value=0;g.connect(this.section);return g;});
  this.echo=null;
  this.theme=null;this.want=null;this.swapAt=0;this.intensity=-1;this.step=0;this.next=0;this.targets=LAYERS.map(()=>0);
 }
 // The wanted theme and intensity (0-4); a theme change fades out, swaps on the beat and fades in.
 set(theme,intensity,now){
  if(!THEMES[theme])theme='imago';
  if(this.stopped){this.stopped=false;if(this.theme&&theme===this.want)this.section.gain.setTargetAtTime(1,now,.35);}
  if(theme!==this.want){
   this.want=theme;
   if(!this.theme){this.swap(now);}
   else{this.section.gain.setTargetAtTime(0,now,INTENSITY.themeFade/4);this.swapAt=now+INTENSITY.themeFade;}
  }
  const level=Math.max(0,Math.min(LAYERS.length-1,intensity|0));
  if(level!==this.intensity){
   this.intensity=level;
   this.layers.forEach((g,i)=>{const on=i<=level?LEVEL[i]:0;this.targets[i]=on;g.gain.setTargetAtTime(on,now,INTENSITY.fade/3);});
  }
 }
 swap(now){
  this.theme=this.want;this.swapAt=0;this.step=0;this.next=now+.06;
  this.section.gain.cancelScheduledValues?.(now);this.section.gain.setTargetAtTime(1,now,.35);
 }
 schedule(now,ahead=.22){
  if(this.stopped)return 0;
  if(this.swapAt&&now>=this.swapAt)this.swap(now);
  const T=THEMES[this.theme];if(!T)return 0;
  const st=60/T.bpm/4;
  if(this.next<now-.3)this.next=now+.02; // after a stall (tab hidden) never play a burst of late notes
  let n=0;
  while(this.next<now+ahead&&n<64){this.play(T,this.step,this.next,st);this.step=(this.step+1)%(16*T.prog.length);this.next+=st;n++;}
  return n;
 }
 voice(i,when,send=0){const v=this.S.begin(this.layers[i],{when,priority:1,send});if(v)v.music=true;return v;}
 play(T,step,t0,st){
  const S=this.S,i16=step%16,bar=(step>>4)%T.prog.length,deg=T.prog[bar],on=i=>this.targets[i]>0;
  const t=t0+(i16%2?st*T.swing:0);
  // Pad: a slow detuned chord per bar, filtered by the theme's colour.
  if(i16===0&&on(0)){
   const v=this.voice(0,t,.35);
   if(v){const lp=S.filter(v,'lowpass',T.cutoff,.6),len=16*st;
    for(const d of [deg,deg+2,deg+4])for(const det of [-7,7])
     S.tone(v,t,{type:T.pad,f:hz(degree(T,d,0)),a:Math.min(.6,len*.3),hold:len*.5,d:len*.6,peak:.045,detune:det,filter:lp});}
  }
  // Bass: a plucked ostinato on the chord root.
  const b=T.bass[i16];
  if(b!==null&&b!==undefined&&on(1)){
   const v=this.voice(1,t);
   if(v){const lp=S.filter(v,'lowpass',520,1.1);S.tone(v,t,{type:'triangle',f:hz(degree(T,deg+b,-1)),a:.005,peak:.16,d:st*1.7,filter:lp});
    S.tone(v,t,{f:hz(degree(T,deg+b,-2)),a:.005,peak:.12,d:st*1.9});}
  }
  if(on(2)||T.clock&&on(1))this.drums(T,i16,t,st,on(2));
  const m=T.motif[i16];
  if(m!==null&&m!==undefined&&on(3)){
   const f=hz(degree(T,m,1));
   for(let e=0;e<(T.echo?3:1);e++){
    const v=this.voice(3,t+e*st*3,.25);
    if(v)S.tone(v,t+e*st*3,{type:T.lead,f,a:.006,peak:.055*(T.echo?T.echo**e:1),d:st*2.4});
   }
  }
  if(on(4)){
   const v=this.voice(4,t,.2);
   if(v){const tones=[deg,deg+2,deg+4,deg+7];S.tone(v,t,{type:'sine',f:hz(degree(T,tones[i16%4],2)),a:.004,peak:.022,d:st*1.2});
    // A cold shimmer on the bar, from the chord itself: the score never borrows the cyan tell's partials.
    if(i16===0)for(const d of [deg+4,deg+7])S.tone(v,t,{f:hz(degree(T,d,2)),a:.4,peak:.008,d:16*st*.7});}
  }
 }
 drums(T,i16,t,st,full){
  const S=this.S,kit=KITS[T.kit]||KITS.soft,storm=this.targets[4]>0;
  const v=this.voice(2,t);if(!v)return;
  if(full&&kit.kick[i16])S.tone(v,t,{f:118,to:42,glide:.18,a:.002,peak:.55*kit.kick[i16],d:.24});
  if(full&&kit.snare[i16]){S.hiss(v,t,{f:1800,q:.8,peak:.2*kit.snare[i16],d:.13});S.tone(v,t,{type:'triangle',f:190,to:150,glide:.08,peak:.1*kit.snare[i16],d:.09});}
  const hat=kit.hat[i16]||(storm?.25:0);
  if(hat)S.hiss(v,t,{type:'highpass',f:7200,peak:.09*hat,d:.028});
  if(T.clock&&!full&&i16%4===0){S.tone(v,t,{f:1800,peak:.03,d:.03});}
 }
 stop(now){if(!this.stopped){this.stopped=true;this.section.gain.setTargetAtTime(0,now,.2);}}
}
