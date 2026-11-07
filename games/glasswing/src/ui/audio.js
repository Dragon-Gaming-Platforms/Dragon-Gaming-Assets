import {manifest} from './assets.js';
import {localAsset} from './assets.js';
import {AUDIO} from '../data/audio.js?v=0.3.1';
import {Synth,canSynth,hasPatch} from './synth.js';
import {Music} from './music.js';
import {createEar,listen} from './director.js';
import {CUE_BUS,HEART,MIX,HOOK_CUES} from './sonic.js';

// Sim cues the ear resolves with more context (colour, weight, kill) on the same frame; heard alone they fall back.
const DEFER={'enemy-telegraph':'tell','sword-hit':'impact','blast-hit':'impact','enemy-beaten':'kill'};
// The kind of moment a cue marks: a sim cue and an ear event of one kind on one frame are one sound, not two.
const kindOf=c=>c==='impact'?'impact':c.startsWith('tell-')?'tell':c.startsWith('strike-')?'strike':c.endsWith('-kill')?'kill':c==='boss-break'?'boss-desperation':c;
// Hook cues a boss sim may emitSound (sonic.js HOOK_CUES) whose kind the ear also hears: the sim's explicit name wins
// (a 'tell-delayed' stays delayed), and the ear's event lends it the context the bare name lacks (theme, phase, pan).
const HOOKED=new Set(HOOK_CUES.filter(c=>/^(tell|strike)-|^boss-(phase|desperation|break|opening|kill)$|^enemy-kill$/.test(c)));
const classic=()=>{try{return new URLSearchParams(location.search).get('audio')==='classic';}catch{return false;}};

const family=key=>key?.replace(/^glass-/,'');
export class AudioBus {
 constructor(settings,{rich}={}) {
  this.settings=settings;this.context=null;this.unlocked=false;this.track=null;
  this.music=new Map();this.buffers=new Map();this.pending=new Map();
  this.failedSounds=new Set();this.failedMusic=new Set();
  this.starting=new Set();this.blocked=new Set();this.syncFrom=new Map();
  this.loops=new Map();this.wantedLoops=new Set();this.effects=new Set();
  // Procedural sound pass (rich by default when the context can synthesise; ?audio=classic keeps the old blips).
  this.rich=rich??!classic();this.synth=null;this.score=null;this.ear=createEar();this.deferred=new Map();this.heartAt=0;
 }
 ensureSynth() {
  if(this.synth||!this.rich||!canSynth(this.context))return this.synth;
  try{this.synth=new Synth(this.context);this.score=new Music(this.synth);}catch{this.rich=false;this.synth=this.score=null;}
  return this.synth;
 }
 cueLevel(){return Math.max(0,Math.min(1,Number(this.settings.cues??.8)||0));}
 // A named event for UI, renderer or integrator hooks (sonic.js HOOK_CUES), e.g. audio.event('boss-phase',{phase:2,theme:'tallowgrave'}).
 event(name,opts={}) {
  const synth=this.context&&this.ensureSynth();
  if(!synth||!hasPatch(name)||!(CUE_BUS.has(name)?this.cueLevel():this.settings.sound))return null;
  return synth.play(name,opts,this.context.currentTime);
 }
 unlock() {
  this.unlocked=true;
  if(!this.context)try{this.context=new(window.AudioContext||window.webkitAudioContext)();}catch{}
  this.ensureSynth();
  this.context?.resume().catch(()=>{});
  // A fresh gesture may recover suspended audio; failed autoplay is never retried every frame.
  this.blocked.clear();
 }
 path(entry) {
  if(typeof entry==='string')return entry;
  const a=document.createElement('audio');
  return a.canPlayType('audio/ogg')?entry?.ogg||entry?.m4a:entry?.m4a||entry?.ogg;
 }
 loadSound(name) {
  if(this.buffers.has(name))return Promise.resolve(this.buffers.get(name));
  if(this.pending.has(name))return this.pending.get(name);
  if(!this.context||!manifest.sounds?.[name]||this.failedSounds.has(name))return Promise.resolve(null);
  const task=Promise.resolve().then(async()=>{
   try {
    const r=await fetch(localAsset(this.path(manifest.sounds[name])));
    if(!r.ok)throw new Error('Missing sound');
    const data=await this.context.decodeAudioData(await r.arrayBuffer());
    this.buffers.set(name,data);return data;
   }catch{this.failedSounds.add(name);return null;}
   finally{this.pending.delete(name);}
  });
  this.pending.set(name,task);return task;
 }
 voice(buffer,loop=false) {
  const source=this.context.createBufferSource(),gain=this.context.createGain();
  source.buffer=buffer;source.loop=loop;gain.gain.value=this.settings.sound*(loop?AUDIO.loopVolume:1);
  const voice={source,gain};
  if(!loop)this.effects.add(voice);
  source.connect(gain).connect(this.context.destination);
  source.onended=()=>{source.disconnect();gain.disconnect();this.effects.delete(voice);};
  source.start();return voice;
 }
 resetEffects() {
  for(const voice of this.effects)try{voice.source.stop();}catch{}
  for(const voice of this.loops.values())try{voice.source.stop();}catch{}
  this.effects.clear();this.loops.clear();this.wantedLoops.clear();
  this.synth?.stopVoices();this.deferred.clear();this.ear=createEar();this.heartAt=0;
 }
 cue(name) {
  if(!this.context||!name)return;
  const synth=this.ensureSynth();
  if(synth&&(hasPatch(name)||this.buffers.has(name))) {
   if(!(CUE_BUS.has(name)?this.cueLevel():this.settings.sound))return;
   if(manifest.sounds?.[name]&&!this.buffers.has(name)&&!this.failedSounds.has(name))this.loadSound(name);
   // Deferred even when a delivered sample exists: the ear's weighted hit must not double it.
   if(DEFER[name]||HOOKED.has(name)){this.deferred.set(name,DEFER[name]||kindOf(name));return;}
   this.sample(name)||synth.play(name,{},this.context.currentTime);return;
  }
  if(!this.settings.sound)return;
  const data=this.buffers.get(name);
  if(data){this.voice(data);return;}
  // First-use feedback stays immediate; decoding prepares future hits, never a late one.
  if(manifest.sounds?.[name]&&!this.failedSounds.has(name))this.loadSound(name);
  const o=this.context.createOscillator(),g=this.context.createGain(),now=this.context.currentTime;
  const voice={source:o,gain:g};this.effects.add(voice);
  const tone=AUDIO.tones[name]||AUDIO.base;o.type='triangle';
  o.frequency.setValueAtTime(tone,now);o.frequency.exponentialRampToValueAtTime(tone*.65,now+AUDIO.duration);
  g.gain.setValueAtTime(this.settings.sound*AUDIO.volume,now);g.gain.exponentialRampToValueAtTime(.001,now+AUDIO.duration);
  o.connect(g).connect(this.context.destination);
  o.onended=()=>{o.disconnect();g.disconnect();this.effects.delete(voice);};o.start();o.stop(now+AUDIO.duration);
 }
 // A delivered sample, when one has decoded, plays instead of the patch.
 sample(name){const data=this.buffers.get(name);if(!data)return false;if(this.settings.sound)this.voice(data);return true;}
 ensureMusic(key,entry) {
  if(!entry||this.music.has(key)||this.failedMusic.has(key))return;
  try {
   const a=new Audio(localAsset(this.path(entry)));a.loop=true;a.volume=0;
   this.music.set(key,a);
   a.addEventListener('loadedmetadata',()=>this.alignMusic(key));
   a.addEventListener('error',()=>this.failedMusic.add(key));
  }catch{this.failedMusic.add(key);}
 }
 alignMusic(key) {
  const a=this.music.get(key),source=this.syncFrom.get(key);
  if(key!==this.track||!a||!source||!Number.isFinite(a.duration)||a.duration<=0)return;
  try{a.currentTime=source.currentTime%a.duration;this.syncFrom.delete(key);}catch{}
 }
 playMusic(key,a) {
  if(!a.paused||this.starting.has(key)||this.blocked.has(key)||this.failedMusic.has(key))return;
  this.starting.add(key);
  Promise.resolve(a.play()).catch(()=>this.blocked.add(key)).finally(()=>this.starting.delete(key));
 }
 updateLoops(s,active) {
  this.wantedLoops.clear();
  if(active&&this.settings.sound)for(const p of s.players)if(!p.dead) {
   if(p.clip==='glide')this.wantedLoops.add('glide-loop');
   if(p.charge>0)this.wantedLoops.add('blast-charge-loop');
   if(p.glass)this.wantedLoops.add('glass-loop');
  }
  for(const [name,voice] of this.loops) {
   if(!this.wantedLoops.has(name)){voice.source.stop();this.loops.delete(name);}
   else voice.gain.gain.value=this.settings.sound*AUDIO.loopVolume;
  }
  for(const name of this.wantedLoops) {
   if(this.loops.has(name)||!manifest.sounds?.[name]||this.failedSounds.has(name))continue;
   const buffer=this.buffers.get(name);
   if(buffer)this.loops.set(name,this.voice(buffer,true));
   else if(!this.pending.has(name))this.loadSound(name);
  }
 }
 update(s,title,delta,paused=false) {
  if(!this.unlocked)return;
  const base=title?'title':s.bossStarted?'boss':s.area<2?'forest':'hollow';
  const wanted=!title&&s.players.some(p=>p.glass&&!p.dead)?'glass-'+base:base;
  // A partial delivery keeps the normal loop instead of fading to silence.
  const key=manifest.music?.[wanted]?wanted:base;
  this.ensureMusic(key,manifest.music?.[key]);
  if(this.track!==key) {
   const previous=this.music.get(this.track);
   if(previous&&Number.isFinite(previous.duration)&&previous.duration>0&&family(this.track)===family(key))this.syncFrom.set(key,previous);
   else this.syncFrom.delete(key);
   this.track=key;this.alignMusic(key);
  }
  for(const [id,a] of this.music) {
   const goal=id===key?this.settings.music:0;
   a.volume=Math.max(0,Math.min(1,a.volume+(goal-a.volume)*Math.min(1,delta/AUDIO.fade)));
   if(id===key){this.alignMusic(id);this.playMusic(id,a);}
   else if(a.volume<AUDIO.silence)a.pause();
  }
  this.updateLoops(s,!title&&!paused&&s.phase==='playing');
  this.updateRich(s,title,paused,!!manifest.music?.[key]);
 }
 // The ear and the procedural score: weighted hits, tells by colour, stingers, kills, heartbeat, music layers.
 updateRich(s,title,paused,filed) {
  const synth=this.ensureSynth();if(!synth)return;
  const now=this.context.currentTime,cues=this.cueLevel(),sound=this.settings.sound;
  synth.levels({sfx:sound,cues,music:filed?0:this.settings.music},now);
  const heard=listen(this.ear,s,{title});
  const kinds=new Set(),hooks=new Map();
  for(const [name,kind] of this.deferred)if(HOOKED.has(name)&&!hooks.has(kind))hooks.set(kind,name);
  const on=cue=>CUE_BUS.has(cue)?cues:sound;
  for(const ev of heard.events) {
   const kind=kindOf(ev.cue),hook=hooks.get(kind),cue=hook||ev.cue;kinds.add(kind);
   if(hook)hooks.delete(kind);
   if(on(cue))synth.play(cue,{...ev,cue,force:cue==='impact'},now);
  }
  // A hook the ear did not hear itself still gets the fight's context.
  for(const [kind,name] of hooks){kinds.add(kind);synth.play(name,{boss:true,theme:heard.theme,phase:heard.phase},now);}
  // A sim cue the ear could not explain still sounds (versus hits, Hall waves). A boss telegraph the ear cannot
  // place (the Chrysalis's reel wait and wall pump) still sounds in the boss's colour, softly: never a colourless cue.
  for(const [name,kind] of this.deferred) {
   if(kinds.has(kind)||HOOKED.has(name))continue;
   if(name==='enemy-telegraph'&&heard.colour)synth.play('tell-'+heard.colour,{boss:true,soft:true},now);
   else this.sample(name)||synth.play(name,{},now);
  }
  this.deferred.clear();
  // Heartbeat below one mask; music muffles near death and while paused.
  const beat=heard.danger&&!paused&&!title&&this.settings.heartbeat!==false&&cues>0;
  if(beat){
   if(now>=this.heartAt-.02){const at=Math.max(now,this.heartAt);synth.play('heartbeat',{level:heard.danger,force:true},at);this.heartAt=at+1/(heard.danger>1?HEART.glassRate:HEART.rate);}
  }else this.heartAt=0;
  synth.setMuffle(paused?MIX.muffle.pause:heard.danger?MIX.muffle.danger:MIX.muffle.open,now);
  if(filed||!this.settings.music){this.score.stop(now);return;}
  this.score.set(heard.theme,heard.intensity,now);this.score.schedule(now);
 }
}
