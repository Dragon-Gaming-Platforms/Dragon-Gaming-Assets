import { PRESETS, cleanProfile as baseProfile } from './engine-v1.js';
export { PRESETS };
export const WIDTH = 1200, HEIGHT = 650, FLOOR = 508;
export const INPUT_KEYS = ['left','right','jump','crouch','block','punch','heavyPunch','lightKick','kick','special','uppercut','throw','super'];
export const STYLES = [{name:'All-rounder',speed:275,damage:9},{name:'Rushdown',speed:315,damage:8},{name:'Power',speed:240,damage:10}];
export const SHOP_ITEMS = [{id:'mint-aura',name:'Mint Aura',price:80,description:'A cosmetic glow. No stat advantage.',icon:'✧'},{id:'crown',name:'Tiny Crown',price:160,description:'A champion-sized crown for tiny ears.',icon:'♛'}];
export const cleanProfile = value => baseProfile(value);
export const emptyInput = () => Object.fromEntries(INPUT_KEYS.map(k=>[k,false]));
export const cleanInput = value => Object.fromEntries(INPUT_KEYS.map(k=>[k,value?.[k]===true]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const MOVES = {
  punch:      {startup:.08,active:.09,recovery:.15,damage:7,range:132,level:'high',stun:.28,cancel:1},
  heavyPunch: {startup:.19,active:.12,recovery:.29,damage:15,range:151,level:'high',stun:.43,cancel:2},
  lightKick:  {startup:.11,active:.10,recovery:.18,damage:8,range:155,level:'mid',stun:.30,cancel:1},
  kick:       {startup:.20,active:.12,recovery:.30,damage:14,range:177,level:'mid',stun:.42,cancel:2},
  lowPunch:   {startup:.07,active:.09,recovery:.17,damage:6,range:123,level:'low',stun:.25,cancel:1},
  sweep:      {startup:.19,active:.12,recovery:.37,damage:13,range:181,level:'low',stun:.65,down:true},
  airPunch:   {startup:.08,active:.17,recovery:.12,damage:9,range:130,level:'overhead',stun:.32,cancel:1},
  airKick:    {startup:.13,active:.20,recovery:.20,damage:13,range:172,level:'overhead',stun:.42,cancel:2},
  uppercut:   {startup:.10,active:.24,recovery:.50,damage:19,range:128,level:'mid',stun:.62,launch:true,cost:20,cancel:3},
  special:    {startup:.15,active:.08,recovery:.35,damage:21,range:0,level:'mid',stun:.40,cost:35,cancel:3},
  throw:      {startup:.08,active:.07,recovery:.50,damage:17,range:99,level:'throw',stun:.72,down:true},
  super:      {startup:.21,active:.10,recovery:.55,damage:38,range:0,level:'mid',stun:.75,cost:100,cancel:4,down:true}
};
const length=m=>m.startup+m.active+m.recovery;
function fighter(profile,i){return {x:i?840:360,y:0,vy:0,vx:0,hp:100,meter:35,facing:i?-1:1,action:'idle',actionTime:0,cooldown:0,stun:0,down:0,combo:0,comboTimer:0,comboDamage:0,attackId:0,hit:false,block:false,crouching:false,knockback:0,previous:emptyInput(),buffer:null,taps:{left:-100,right:-100},motion:[],lastDirection:'neutral',...STYLES[profile.style]};}
export function createMatch(profiles=PRESETS.slice(0,2),options={}){const p=profiles.map(cleanProfile);return {profiles:p,fighters:p.map(fighter),phase:'countdown',phaseTime:2.6,round:1,time:99,wins:[0,0],winner:null,roundWinner:null,projectiles:[],effects:[],tick:0,nextAttack:1,difficulty:options.difficulty||'normal',training:!!options.training,hitstop:0,shake:0,lastMessage:''};}
function begin(m,f,kind){const move=MOVES[kind];if(!move||f.meter<(move.cost||0))return false;f.action=kind;f.actionTime=length(move);f.cooldown=f.actionTime;f.hit=false;f.projectileFired=false;f.attackId=m.nextAttack++;f.meter-=move.cost||0;if(kind==='uppercut'){f.vy=570;f.invulnerable=.15;}if(kind==='throw')f.crouching=false;return true;}
function effect(m,f,damage,blocked,kind){m.effects.push({id:m.nextAttack++,x:f.x-f.facing*10,y:f.y+(f.crouching?45:85),life:.32,blocked,damage,kind});}
function hurt(m,a,d,move,dir){
  if(d.invulnerable>0||d.down>.25)return;
  const standing=d.y<8,guard=d.block&&standing&&d.facing===-dir&&move.level!=='throw';
  const blocked=guard&&(move.level==='low'?d.crouching:move.level==='overhead'?!d.crouching:true);
  const counter=!blocked&&!!MOVES[d.action]&&length(MOVES[d.action])-d.actionTime<MOVES[d.action].startup;
  if(!blocked){if(d.stun>0&&a.comboTimer>0)a.combo++;else {a.combo=1;a.comboDamage=0;}a.comboTimer=1.2;}
  const scale=blocked?1:Math.max(.5,1-(a.combo-1)*.12);
  const damage=blocked?(move.cost?Math.ceil(move.damage*.12):0):Math.round(move.damage*scale*(counter?1.2:1));
  d.hp=Math.max(0,d.hp-damage);a.comboDamage+=damage;
  d.stun=blocked?.13:move.stun+(counter?.10:0);d.knockback=dir*(blocked?85:move.down?330:135);
  if(!blocked){d.action=move.down?'knockdown':'hurt';d.actionTime=d.stun;d.down=move.down?.7:0;d.crouching=false;if(move.launch){d.vy=570;d.y=Math.max(d.y,2);}}
  a.meter=clamp(a.meter+(blocked?2:7),0,100);d.meter=clamp(d.meter+(blocked?3:4),0,100);
  m.hitstop=blocked?.035:move.damage>=14?.085:.05;m.shake=blocked?1:move.damage>=14?7:3;
  m.lastMessage=blocked?'BLOCK':counter?'COUNTER':move.level==='throw'?'THROW':a.combo>1?`${a.combo} HIT COMBO`:'';
  effect(m,d,damage,blocked,counter?'COUNTER':move.level==='low'?'LOW':move.level==='overhead'?'AIR':move.level==='throw'?'THROW':'');
}
function endRound(m){const[a,b]=m.fighters;m.roundWinner=a.hp===b.hp?-1:a.hp>b.hp?0:1;if(m.roundWinner>=0)m.wins[m.roundWinner]++;m.phase=m.wins.some(v=>v>=2)?'finished':'roundEnd';m.winner=m.phase==='finished'?m.wins[0]>m.wins[1]?0:1:null;m.phaseTime=2.6;}
function requested(f,input,pressed,m){
  const forward=f.facing===1?'right':'left';
  let direction=input.crouch?'down':input[forward]?'forward':'neutral';
  if(input.crouch&&input[forward])direction='diagonal';
  if(direction!==f.lastDirection){f.motion.push({direction,tick:m.tick});f.lastDirection=direction;}
  f.motion=f.motion.filter(v=>m.tick-v.tick<28).slice(-8);
  const motion=f.motion.map(v=>v.direction).join(',');
  if(pressed.super)return 'super';
  if(pressed.uppercut)return 'uppercut';
  if(pressed.throw&&f.y<8)return 'throw';
  if(pressed.special&&f.y<8)return 'special';
  if(pressed.punch||pressed.heavyPunch){if(f.y>15)return 'airPunch';if(/forward,down,(diagonal|forward)/.test(motion))return 'uppercut';if(/down,(diagonal,)?forward/.test(motion))return 'special';return input.crouch?'lowPunch':pressed.heavyPunch?'heavyPunch':'punch';}
  if(pressed.kick||pressed.lightKick)return f.y>15?'airKick':input.crouch?'sweep':pressed.lightKick?'lightKick':'kick';
  return null;
}
export function stepMatch(m,rawInputs=[],dt=1/60){
  dt=clamp(Number.isFinite(dt)?dt:0,0,.05);if(['finished','disconnected'].includes(m.phase))return m;m.tick++;
  m.effects=m.effects.filter(e=>(e.life-=dt)>0);m.shake=Math.max(0,m.shake-dt*35);
  if(m.hitstop>0){m.hitstop=Math.max(0,m.hitstop-dt);return m;}
  if(m.phase!=='fight'){m.phaseTime-=dt;if(m.phaseTime<=0){if(m.phase==='roundEnd'){m.round++;m.fighters=m.profiles.map(fighter);m.projectiles=[];m.time=99;m.phase='countdown';m.phaseTime=2.6;}else m.phase='fight';}return m;}
  m.time=Math.max(0,m.time-dt);const hits=[];
  for(let i=0;i<2;i++){
    const f=m.fighters[i],other=m.fighters[1-i],input=cleanInput(rawInputs[i]),pressed=Object.fromEntries(INPUT_KEYS.map(k=>[k,input[k]&&!f.previous[k]]));
    f.facing=f.x<=other.x?1:-1;f.stun=Math.max(0,f.stun-dt);f.down=Math.max(0,f.down-dt);f.invulnerable=Math.max(0,(f.invulnerable||0)-dt);
    f.actionTime=Math.max(0,f.actionTime-dt);f.cooldown=Math.max(0,f.cooldown-dt);f.comboTimer=Math.max(0,f.comboTimer-dt);
    const current=MOVES[f.action],canCancel=current&&f.hit&&current.cancel&&f.actionTime>0;
    if(f.actionTime<=0){f.action='idle';f.cooldown=0;}
    f.crouching=input.crouch&&f.y===0&&f.stun<=0&&!MOVES[f.action];
    const retreat=input[f.facing===1?'left':'right'];
    f.block=(input.block||retreat)&&f.y===0&&f.stun<=0&&!MOVES[f.action];
    const request=requested(f,input,pressed,m);if(request)f.buffer={kind:request,expires:m.tick+7};
    if(f.buffer?.expires<m.tick)f.buffer=null;
    if(f.stun<=0&&!f.down){
      if(pressed.jump&&f.y===0&&!current){f.vy=650;f.vx=(Number(input.right)-Number(input.left))*f.speed*.85;f.block=false;}
      for(const dir of ['left','right'])if(pressed[dir]){if(m.tick-f.taps[dir]<17&&f.y===0&&!current&&!input.crouch){f.action='dash';f.actionTime=.18;f.vx=(dir==='right'?1:-1)*690;}f.taps[dir]=m.tick;}
      if(!MOVES[f.action]&&f.action!=='dash'&&f.y===0&&!f.crouching){const move=Number(input.right)-Number(input.left);f.x+=move*f.speed*dt*(f.block?.62:1);if(move)f.action='walk';}
      const next=f.buffer&&MOVES[f.buffer.kind];
      if(next&&(!f.block||next.level==='throw')&&((!MOVES[f.action]&&f.action!=='dash')||(canCancel&&next.cancel>current.cancel))){if(begin(m,f,f.buffer.kind))f.buffer=null;}
    }
    if(f.y>0||f.action==='dash')f.x+=f.vx*dt;else f.vx=0;
    f.x=clamp(f.x+f.knockback*dt,70,WIDTH-70);f.knockback*=Math.exp(-10*dt);f.vy-=1700*dt;f.y=Math.max(0,f.y+f.vy*dt);if(!f.y)f.vy=0;
    f.meter=clamp(f.meter+dt*1.8,0,100);f.previous=input;
    const move=MOVES[f.action];
    if(move){const elapsed=length(move)-f.actionTime;
      if(['special','super'].includes(f.action)&&elapsed>=move.startup&&!f.projectileFired){m.projectiles.push({id:f.attackId,owner:i,x:f.x+f.facing*65,y:68,dir:f.facing,life:1.8,super:f.action==='super'});f.projectileFired=true;}
      if(!f.hit&&move.range&&elapsed>=move.startup&&elapsed<move.startup+move.active&&Math.abs(f.x-other.x)<move.range&&Math.abs(f.y-other.y)<(move.launch?200:92)&&!(move.level==='throw'&&other.y>15)){
        // Standing high punches pass over a crouching target; overhead air attacks beat low guard.
        if(!(move.level==='high'&&other.crouching)){hits.push([f,other,move,f.facing]);f.hit=true;}
      }
    }
  }
  const[a,b]=m.fighters;if(Math.abs(a.x-b.x)<86&&Math.abs(a.y-b.y)<110){const push=(86-Math.abs(a.x-b.x))/2,dir=a.x<=b.x?1:-1;a.x=clamp(a.x-dir*push,70,1130);b.x=clamp(b.x+dir*push,70,1130);}
  for(const args of hits)hurt(m,...args);
  m.projectiles=m.projectiles.filter(p=>{p.x+=p.dir*(p.super?790:650)*dt;p.life-=dt;const d=m.fighters[1-p.owner];if(Math.abs(p.x-d.x)<62&&Math.abs(p.y-(d.y+65))<70){hurt(m,m.fighters[p.owner],d,MOVES[p.super?'super':'special'],p.dir);return false;}return p.life>0&&p.x>-50&&p.x<1250;});
  if(!m.training&&(a.hp<=0||b.hp<=0||m.time<=0))endRound(m);
  if(m.training){m.time=99;if(b.hp<10&&b.stun<=0){b.hp=100;a.combo=0;}}
  return m;
}
export function aiInput(m){const f=m.fighters[1],r=m.fighters[0],o=emptyInput(),d=Math.abs(f.x-r.x),phase=m.tick%(m.difficulty==='easy'?105:m.difficulty==='hard'?48:72);if(phase<(m.difficulty==='easy'?25:9))return o;if(d>135)o[f.x<r.x?'right':'left']=true;if(r.actionTime>0&&d<190&&phase%4<2){o.block=true;o.crouch=['sweep','lowPunch'].includes(r.action);}if(m.tick%12===0){if(d<98&&r.block)o.throw=true;else if(d<180)o[m.tick%48===0?'kick':m.tick%36===0?'heavyPunch':'punch']=true;else if(f.meter>=35&&d<650)o.special=true;}if(m.difficulty!=='easy'&&m.projectiles.some(p=>p.owner===0&&Math.abs(p.x-f.x)<200))o.jump=m.tick%18===0;return o;}
export function publicState(m){const{profiles,...state}=m;return state;}
