import {hubTheme} from './hub-themes.js';
// Four areas inside the corpse of Old Glasswing. Colours only; shapes live in parallax.js and tiles.js.
export const THEMES={
 hand:{
  id:'hand',sky:['#07040a','#1d1020','#4a2a2c','#7a4a32'],horizon:.72,
  far:'#2a1a26',mid:'#22141f',near:'#140b13',fog:'#6b4a44',fogAlpha:.32,light:'#ffb35c',lightAlpha:.10,
  stone:'#4a3a3c',stoneDark:'#21171c',top:'#d9c8a6',topShade:'#8e7b62',accent:'#ffab3d',motes:'ash',moteColor:'#cbb9a8'
 },
 canopy:{
  id:'canopy',sky:['#04070a','#0d1a1f','#1f3335','#3c4a3e'],horizon:.62,
  far:'#14252a',mid:'#101b20',near:'#080d10',fog:'#3f5a58',fogAlpha:.30,light:'#cfe6d8',lightAlpha:.09,
  stone:'#2c2730',stoneDark:'#141018',top:'#4b3c52',topShade:'#2a2030',accent:'#ffab3d',motes:'scales',moteColor:'#9fd6d0'
 },
 hollow:{
  id:'hollow',sky:['#020306','#070b16','#111a2c','#1a2238'],horizon:.55,
  far:'#121a2c',mid:'#0c1120',near:'#05070d',fog:'#1f3d55',fogAlpha:.34,light:'#62f0ff',lightAlpha:.08,
  stone:'#2a2533',stoneDark:'#0f0c16',top:'#a99c8a',topShade:'#5a5048',accent:'#62f0ff',motes:'spores',moteColor:'#62f0ff'
 },
 // Cordycea's Mycelial Garden (rules v4): the hollow's shapes in colder light (painters are keyed by id).
 garden:{
  id:'hollow',sky:['#020406','#071016','#0f1f26','#1b2b2e'],horizon:.6,
  far:'#13222a',mid:'#0e171f',near:'#060a0e',fog:'#2c5a5e',fogAlpha:.3,light:'#9ff6ff',lightAlpha:.1,
  stone:'#2e2632',stoneDark:'#120e16',top:'#cfc4ae',topShade:'#6d6152',accent:'#62f0ff',motes:'spores',moteColor:'#9ff6ff'
 },
 skull:{
  id:'skull',sky:['#0b0605','#24130c','#5a3216','#a8642a'],horizon:.66,
  far:'#3a261c',mid:'#2a1a14',near:'#140b08',fog:'#8a5a34',fogAlpha:.30,light:'#ffbe5c',lightAlpha:.16,
  stone:'#6a5a4c',stoneDark:'#2a2019',top:'#efe2c4',topShade:'#a8916e',accent:'#ffab3d',motes:'embers',moteColor:'#ffb347'
 }
};
export function themeFor(level){
 if(level?.garden)return THEMES.garden;
 const hub=hubTheme(level,THEMES);if(hub)return hub;
 const id=String(level?.id||'');
 if(Object.hasOwn(THEMES,level?.theme||''))return THEMES[level.theme];
 if(/canopy/.test(id))return THEMES.canopy;
 if(/hollow/.test(id))return THEMES.hollow;
 if(/nest|skull|crown/.test(id))return THEMES.skull;
 return THEMES.hand;
}
