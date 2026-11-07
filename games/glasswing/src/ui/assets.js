export let manifest={models:{},sets:{},sprites:{},music:{},sounds:{}};
export function localAsset(path){
 if(typeof path!=='string'||!/^\.?(?:\/?assets\/|\.?\/assets\/)/.test(path)||path.includes('..')||path.includes(':')||path.includes('\\'))throw new Error('Asset must be a local assets/ path');
 return new URL(path,new URL('../../',import.meta.url)).href;
}
// Unknown or malformed sections become empty maps; sprite entries need local image/data paths.
export function validateManifest(data){
 const out={version:1,keyArt:null,...(data&&typeof data==='object'&&!Array.isArray(data)?data:{}),models:{},sets:{},sprites:{},music:{},sounds:{}};
 if(!data||typeof data!=='object')return out;
 for(const key of ['models','sets','music','sounds'])if(data[key]&&typeof data[key]==='object'&&!Array.isArray(data[key]))out[key]=data[key];
 if(data.sprites&&typeof data.sprites==='object'&&!Array.isArray(data.sprites))for(const [id,e] of Object.entries(data.sprites)){
  try{if(e&&localAsset(e.image)&&localAsset(e.data)&&(e.glow===undefined||localAsset(e.glow)))out.sprites[id]=e;}catch{}
 }
 return out;
}
export async function loadManifest(path='./assets/manifest.json'){try{const response=await fetch(path);if(response.ok)manifest=validateManifest(await response.json());}catch{}return manifest;}
