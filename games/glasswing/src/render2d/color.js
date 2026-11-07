// Simulation colours stay integers; the renderer converts them and applies the colour grammar.
export const P={
 ink:'#0b0710',outline:'#120a12',
 fur:'#3b2140',furDeep:'#1f1024',furLight:'#6a4470',furRim:'#b48fc0',
 bone:'#ece0c6',boneShade:'#b3a083',boneDark:'#6d5c48',boneRim:'#fffaf0',
 amber:'#ffab3d',amberHot:'#ffd98a',amberDeep:'#c25410',
 cyan:'#62f0ff',cyanDeep:'#168aa6',cyanHot:'#d6fdff',
 crimson:'#8f1c2c',crimsonDeep:'#55101c',crimsonLight:'#c03a46',
 ivory:'#fff6e4',ash:'#b7aab2',wildFur:'#2e2a3a',wildFurLight:'#57526b'
};
const cache=new Map();
export function rgb(c){
 if(typeof c==='number')return [c>>16&255,c>>8&255,c&255];
 if(typeof c==='string'&&c[0]==='#'){
  let h=c.slice(1);if(h.length===3)h=[...h].map(x=>x+x).join('');
  const n=parseInt(h.slice(0,6),16);return [n>>16&255,n>>8&255,n&255];
 }
 return [255,255,255];
}
// Keyed per colour, then per alpha in 1/1000 steps: a hit (every frame) builds no key string.
export function css(c,a=1){
 const q=a>=1?1000:a>0?Math.round(a*1000):0;
 let m=cache.get(c);if(!m){if(cache.size>400)cache.clear();cache.set(c,m=new Map());}
 let v=m.get(q);if(v)return v;
 const [r,g,b]=rgb(c);v=q>=1000?`rgb(${r},${g},${b})`:`rgba(${r},${g},${b},${q/1000})`;
 m.set(q,v);return v;
}
export function mix(a,b,t){
 const x=rgb(a),y=rgb(b);
 return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
// Colour grammar: amber = player power and weak points, cyan = enemy light, ivory = bone/parry.
const grammar=new Map([
 [0xf1ece2,P.bone],[0xffffff,P.ivory],[0xa9d68a,'#c9b48e'],[0xcfe9f2,P.ash],
 [0xffd27c,P.amberHot],[0xffc77c,P.amber],[0x79e0c8,P.cyan],[0x8c8c94,P.cyan],[0x19b8a6,P.cyan]
]);
const tones=new Map();
export function tone(c){
 let v=tones.get(c);if(v)return v;
 const n=typeof c==='number'?c:typeof c==='string'&&c[0]==='#'?parseInt(c.slice(1,7),16):0xffffff;
 v=grammar.get(n)||(typeof c==='string'?c:'#'+n.toString(16).padStart(6,'0'));
 if(tones.size>256)tones.clear();
 tones.set(c,v);return v;
}
