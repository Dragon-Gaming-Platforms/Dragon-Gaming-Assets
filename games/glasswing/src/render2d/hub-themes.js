// Palettes of the Hub with Spokes (level.theme). Each borrows an existing painter set (its id) and recolours it,
// so a spoke reads as its own material without new parallax code: wax, scale-ice, bronze, fungus, cocoon silk.
// Built on first use from themes.js's THEMES (passed in: themes.js imports this file).
let built=null;
export function hubTheme(level,THEMES){
 if(!level?.theme)return null;
 if(!built)built=palettes((base,colors)=>({...THEMES[base],...colors,id:base}));
 return built[level.theme]||null;
}
const palettes=from=>({
 // The Head (Mandible Steps): bone teeth over a red-dark palate.
 head:from('skull',{sky:['#070304','#1c0a0c','#3e1a18','#6e3420'],far:'#2c1414',mid:'#1f0e10',near:'#100608',fog:'#6a3a2a',light:'#ffb35c',lightAlpha:.12,top:'#efe2c4'}),
 // The Thorax Nave: rib vaults of aubergine flesh and ivory bone, dead amber veins.
 nave:from('hollow',{sky:['#05020a','#140a1e','#2a1634','#4a2440'],far:'#2a1830',mid:'#1c1024',near:'#0c0610',fog:'#5a3050',fogAlpha:.3,
  light:'#ffab3d',lightAlpha:.1,accent:'#ffab3d',stone:'#3a2440',stoneDark:'#160c1a',top:'#e8dcc0',topShade:'#9a8468',motes:'embers',moteColor:'#ffb347'}),
 // Forewing left, the Rendering Nave: backlit wing-membrane, tallow and a cold cyan flame.
 render:from('hand',{sky:['#060406','#1a1414','#3a2c26','#7a6450'],far:'#3a2e2a',mid:'#2a201e',near:'#140e0e',fog:'#8a7a64',fogAlpha:.28,
  light:'#cfe9f2',lightAlpha:.12,stone:'#5a4c40',stoneDark:'#241c18',top:'#f2e6c8',topShade:'#b09a76',motes:'ash',moteColor:'#efe0c0'}),
 // Forewing right, the Scale Mere: silver scale-ice under a dead compound eye.
 mere:from('canopy',{sky:['#03050a','#0c1220','#1e2a3c','#3a4a5e'],far:'#1a2434',mid:'#121a28',near:'#070b12',fog:'#5a6a82',fogAlpha:.32,
  light:'#d6e6ff',lightAlpha:.1,stone:'#3a4050',stoneDark:'#151a24',top:'#c8d4e4',topShade:'#7a8698',motes:'scales',moteColor:'#c8dcff'}),
 // Hindwing left, the Reliquary Drum: bronze, bone and amber sand.
 drum:from('hand',{sky:['#080503','#1e140a','#4a3014','#8a5a20'],far:'#3a2814',mid:'#2a1c0e',near:'#140c06',fog:'#9a6a30',fogAlpha:.3,
  light:'#ffcf6a',lightAlpha:.14,stone:'#6a4a24',stoneDark:'#2a1a0c',top:'#e6c88a',topShade:'#a07a40',motes:'ash',moteColor:'#ffd27c'}),
 // Hindwing right, the Mycelial Garden: pale stalks and cold cyan caps over dead moths.
 garden:from('canopy',{sky:['#020605','#071612','#10302a','#1e4a40'],far:'#0e2622',mid:'#0a1a18',near:'#040a09',fog:'#2a6a60',fogAlpha:.34,
  light:'#62f0ff',lightAlpha:.08,stone:'#26302e',stoneDark:'#0e1412',top:'#cfe0d4',topShade:'#7a9a8c',accent:'#62f0ff',motes:'spores',moteColor:'#62f0ff'}),
 // The Moulting Well: a shaft of cocoon silk and shed skins.
 well:from('hollow',{sky:['#050203','#140608','#2a0e12','#44161c'],far:'#2a1014',mid:'#1c0a0e',near:'#0c0406',fog:'#5a2a30',fogAlpha:.34,
  light:'#ffab3d',lightAlpha:.07,stone:'#3a2226',stoneDark:'#160a0c',top:'#d8c8b8',topShade:'#8a7468',motes:'spores',moteColor:'#ffcf9a'})
});
