import {B} from './input.js';

// Live input only (rules v4): a jump, punch or sword press made while the hero cannot act (dodge,
// hit-stop) is held back and delivered as a fresh press on the first tick they can, instead of
// being swallowed. tick() records the masks it receives, so replays and saves stay exact.
// window: ticks a held-back press stays valid; jumpHold: ticks a released buffered jump stays down
// (its height follows how long it was held, within these bounds).
// bits5 (rules v5): the dodge too, so a dash-cancel tapped during a hit's hit-stop is not swallowed.
export const BUFFER={bits:B.jump|B.attack|B.sword,bits5:B.jump|B.attack|B.sword|B.dodge,window:12,jumpHold:[4,12]};

export class PressBuffer{
 constructor(){this.state=null;this.reset();}
 reset(){this.p=[0,1].map(()=>({raw:0,bits:0,age:0,held:0,inject:0,injectBits:0}));}
 // raw: this tick's sampled mask; blocked: the hero cannot act on presses this tick; bits: the buttons held back.
 filter(i,raw,blocked,bits=BUFFER.bits){
  const b=this.p[i],press=raw&~b.raw&bits;b.raw=raw;
  let mask=raw;
  if(b.inject>0){mask|=b.injectBits;if(--b.inject===0)b.injectBits=0;}
  if(blocked){
   if(press){b.bits|=press;b.age=0;}
   if(b.bits){
    b.age++;if(raw&b.bits&B.jump)b.held++;
    if(b.age>BUFFER.window){b.bits=0;b.held=0;}
   }
   // The simulation never sees the held-back bits, so they arrive later as a new edge.
   return mask&~b.bits;
  }
  if(b.bits){
   // Still held: the raw bit passes and reads as a fresh press. Released: replay it now.
   const released=b.bits&~raw;
   if(released){
    const [lo,hi]=BUFFER.jumpHold,n=released&B.jump?Math.max(lo,Math.min(hi,b.held)):1;
    mask|=released;b.injectBits=released;b.inject=n-1;
   }
   b.bits=0;b.held=0;b.age=0;
  }
  return mask;
 }
}
