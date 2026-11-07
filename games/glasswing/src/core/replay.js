import {validConfig} from './config.js';

// Format 2 (rules 4 and later) adds the possess input bit (1024); rules 1-3 recordings stay format 1.
export function record(s){return {version:s.config.rulesVersion>=4?2:1,config:{...s.config},inputs:s.log.map(row=>[...row])};}
// Call once per simulated step. Menus and pause never advance this cursor.
export class ReplayCursor {
 constructor(replay){this.config=replay.config;this.inputs=replay.inputs;this.row=0;this.count=0;}
 next(masks){
  const row=this.inputs[this.row];
  if(!row)return false;
  masks[0]=row[1];masks[1]=row[2];
  if(++this.count===row[0]){this.count=0;this.row++;}
  return true;
 }
}
export function validateReplay(replay){
 if(![1,2].includes(replay?.version)||!Array.isArray(replay.inputs)||replay.inputs.length>200000)
  throw new Error('Invalid replay');
 validConfig(replay.config);
 if(replay.version===2&&!(replay.config.rulesVersion>=4))throw new Error('Invalid replay');
 const top=replay.version===2?2047:1023;
 let frames=0;
 for(const row of replay.inputs){
  if(!Array.isArray(row)||row.length!==3||row.some(v=>!Number.isInteger(v))||
   row[0]<1||row[0]>360000||row[1]<0||row[1]>top||row[2]<0||row[2]>top)
   throw new Error('Invalid input');
  frames+=row[0];
  if(frames>360000)throw new Error('Replay too long');
 }
 return replay;
}
