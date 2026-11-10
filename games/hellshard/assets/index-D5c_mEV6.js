(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={title:`HELLSHARD`,version:`0.1.0`,internalWidth:640,internalHeight:360,tile:16,fixedStep:1/60,maxFrameDelta:.25,maxSubSteps:6,camera:{lookAhead:42,horizontalSmooth:9,verticalSmooth:7,offsetY:72,shakeDecay:8.5,shakeMax:7},world:{zoneCount:5,roomsPerZone:5,roomWidth:34,rows:28,floorRow:4,chunkTiles:16,spawnOffset:5,fallDeathY:-48,roomTagCount:5,platformMaxRise:3},player:{width:12,height:28,gravity:1500,maxFall:620,walkSpeed:150,groundAccel:1600,airAccel:950,groundFriction:1900,airFriction:260,jumpSpeed:460,jumpCut:.42,coyoteTime:.1,jumpBuffer:.12,dashSpeed:560,dashDuration:.17,dashCooldown:1.1,dashIFrames:.24,hurtIFrames:.8,respawnDelay:.85,knockbackX:160,knockbackY:160,interactionRange:30,pickupRadius:14},combat:{hitstopNormal:2,hitstopHeavy:3,hitstopCrit:4,hitFlashDuration:.09,playerHurtFlash:.12,damageNumberLife:.72,deathFragments:22,bossDeathFragments:90,maxParticles:720,maxActiveEnemies:150,xpMagnetSpeed:300,xpAttractRange:[58,240]},rendering:{pixelSnap:!0,tileChunkPadding:1,maxSpriteInstances:4096,maxParticles:720,atlasMaxWidth:2048,atlasPadding:2,layers:{background:-100,tiles:0,props:1,generated:1.5,actors:2,fringe:2.6,orbs:3,particles:4}},progression:{weaponLevelsAt:[2,4,6,8],baseXpToLevel:50,xpCurve:1.28,maxLevel:40,evolutionUnlockLevel:8,cardCount:3},meta:{storageKey:`hellshard.meta.v1`,settingsKey:`hellshard.settings.v1`,unlockCosts:{seraphine:1,nyx:2},bossShardReward:5,eliteShardChance:.08},power:{critChanceBase:.06,critDamageBase:1.6,armorCap:.5,critChanceCap:.6,attackSpeedCap:2,dashCooldownReductionCap:.5,moveSpeedCap:1.6,magnetRangeBase:58,magnetRangeCap:240,projectileCountCap:4,lifeRecoveryCap:5},xpOrb:{valueSmall:6,valueBig:14,size:6},interaction:{promptRange:30,chestRadius:20},transition:{fadeDuration:.55,holdDuration:.15},seed:{default:20261102,min:1,max:2147483646,maxLength:10},debug:{key:`F3`,sampleWindow:60},spatial:{cellSize:48},enemyAI:{pitProbeTiles:1,pitMaxGapTiles:4,pitJumpSpeed:190,pitJumpHeight:330,pitRetreatSeconds:.55,pitStuckSeconds:5,pitFallDepth:8,despawnY:-40,stepCooldown:.8,crowd:{maxSameTypePerScreen:3,speedVariance:.08,tintVariance:.05}},hazards:{spikeDamage:12,enemyDamageMultiplier:1.25,enemyHitInterval:.65},dev:{flySpeed:260,gallerySpeed:110,galleryHeight:32},footSink:{cemetery:5,church:0,swamp:5,dungeon:1,forest:5},foregroundFringe:{cemetery:5,church:0,swamp:5,dungeon:0,forest:5}},t={maxJumpHeight:e.player.jumpSpeed*e.player.jumpSpeed/(2*e.player.gravity),maxJumpDistance:e.player.walkSpeed*2*e.player.jumpSpeed/e.player.gravity,maxGapTiles:4,maxStepTiles:4,maxDropTiles:6},n={cemetery:{id:`cemetery`,nameKey:`zone.cemetery.name`,subtitleKey:`zone.cemetery.subtitle`,order:0,phaseKeys:{tutorial:`zone.cemetery.phase.tutorial`,stirring:`zone.cemetery.phase.stirring`,pressure:`zone.cemetery.phase.pressure`,elites:`zone.cemetery.phase.elites`,hell:`zone.cemetery.phase.hell`},family:`gothicvania`,atlas:`gothic`,tileset:`cemetery`,backdrop:`cemetery`,boss:`cemetery`,bossRoom:3,spawnRoom:0,palette:{fog:`#0b0d13`,fogAlpha:.18,vignette:`rgba(10, 8, 15, 0.72)`,accent:`#b7c07a`,particle:`#d8d4a0`,sky:`#0a0b12`},enemyPool:[`bone_thrall`,`bone_thrall`,`wight`,`wisp`,`cinder_hound`,`alpha_hound`],elitePool:[`alpha_hound`,`pale_revenant`],decor:[`tree1`,`tree2`,`tree3`,`statue`,`stone1`,`stone2`,`stone3`,`stone4`,`bushLarge`,`bushSmall`],traps:[`spikes`],exit:{side:`right`,target:`church`,labelKey:`zone.church.name`},doors:[],hasFinalGate:!1,hazards:`spikes`,music:`cemetery`,weather:`embers`},church:{id:`church`,nameKey:`zone.church.name`,subtitleKey:`zone.church.subtitle`,order:1,phaseKeys:{tutorial:`zone.church.phase.tutorial`,stirring:`zone.church.phase.stirring`,pressure:`zone.church.phase.pressure`,elites:`zone.church.phase.elites`,hell:`zone.church.phase.hell`},family:`gothicvania`,atlas:`gothic`,tileset:`church`,backdrop:`church`,boss:`church`,bossRoom:3,spawnRoom:0,palette:{fog:`#111024`,fogAlpha:.16,vignette:`rgba(8, 7, 19, 0.78)`,accent:`#c9a5ff`,particle:`#e0d4ff`,sky:`#08070f`},enemyPool:[`bone_thrall`,`wight`,`wisp`,`burning_ghoul`,`blight_cultist`,`cinder_hound`,`alpha_hound`],elitePool:[`pale_revenant`,`alpha_hound`],decor:[`column`],traps:[`spikes`],exit:null,doors:[],hasFinalGate:!1,hazards:`spikes`,music:`church`,weather:`dust`},swamp:{id:`swamp`,nameKey:`zone.swamp.name`,subtitleKey:`zone.swamp.subtitle`,order:2,phaseKeys:{tutorial:`zone.swamp.phase.tutorial`,stirring:`zone.swamp.phase.stirring`,pressure:`zone.swamp.phase.pressure`,elites:`zone.swamp.phase.elites`,hell:`zone.swamp.phase.hell`},family:`gothicvania`,atlas:`gothic`,tileset:`swamp`,backdrop:`swamp`,boss:`swamp`,bossRoom:3,spawnRoom:0,palette:{fog:`#0a130d`,fogAlpha:.2,vignette:`rgba(5, 12, 8, 0.78)`,accent:`#83b667`,particle:`#a3d985`,sky:`#060b08`},enemyPool:[`venom_spider`,`wisp`,`mire_wraith`,`bog_brute`,`wight`,`blight_cultist`,`pale_revenant`],elitePool:[`pale_revenant`,`bog_brute`],decor:[`trees`,`grass`,`root`,`fern`],traps:[`water`,`spikes`],exit:{side:`right`,target:`forest`,labelKey:`zone.forest.name`},doors:[],hasFinalGate:!1,hazards:`water`,music:`swamp`,weather:`spores`},dungeon:{id:`dungeon`,nameKey:`zone.dungeon.name`,subtitleKey:`zone.dungeon.subtitle`,order:3,phaseKeys:{tutorial:`zone.dungeon.phase.tutorial`,stirring:`zone.dungeon.phase.stirring`,pressure:`zone.dungeon.phase.pressure`,elites:`zone.dungeon.phase.elites`,hell:`zone.dungeon.phase.hell`},family:`dungeon`,atlas:`dungeon`,tileset:`dungeon`,backdrop:`dungeon`,boss:null,bossRoom:-1,spawnRoom:0,palette:{fog:`#090b10`,fogAlpha:.24,vignette:`rgba(2, 3, 6, 0.86)`,accent:`#a4abb9`,particle:`#d8b06c`,sky:`#030407`},enemyPool:[`bone_thrall`,`wight`,`burning_ghoul`,`blight_cultist`,`wisp`,`pale_revenant`],elitePool:[`pale_revenant`],decor:[],traps:[`spikes`],exit:null,doors:[{id:`return`,target:`cemetery`,room:0,offset:.14,labelKey:`zone.cemetery.name`,style:`crypt`}],hasFinalGate:!1,hazards:`spikes`,music:`dungeon`,weather:`dust`,challengeRoom:3},forest:{id:`forest`,nameKey:`zone.forest.name`,subtitleKey:`zone.forest.subtitle`,order:4,phaseKeys:{tutorial:`zone.forest.phase.tutorial`,stirring:`zone.forest.phase.stirring`,pressure:`zone.forest.phase.pressure`,elites:`zone.forest.phase.elites`,hell:`zone.forest.phase.hell`},family:`fantasyForest`,atlas:`forest`,tileset:`forest`,backdrop:`forest`,boss:null,bossRoom:-1,spawnRoom:0,palette:{fog:`#07120d`,fogAlpha:.18,vignette:`rgba(3, 9, 6, 0.72)`,accent:`#9ed5a0`,particle:`#c6f2b3`,sky:`#050a07`},enemyPool:[`venom_spider`,`mire_wraith`,`moss_slime`,`wisp`,`bog_brute`,`pale_revenant`],elitePool:[`pale_revenant`,`bog_brute`],decor:[`treeBig1`,`treeBig2`,`treeBig3`,`bush1`,`bush2`,`bush3`,`rock`,`log`],traps:[`spikes`,`water`],exit:null,doors:[{id:`return`,target:`swamp`,room:0,offset:.14,labelKey:`zone.swamp.name`,style:`portal`}],hasFinalGate:!1,hazards:`spikes`,music:`forest`,weather:`fireflies`,challengeRoom:3}},r=[`cemetery`,`church`],i=[`cemetery`,`church`],a={version:1,hellshards:0,unlockedCharacters:[`kael`,`brakk`],selectedCharacter:`kael`,permanent:{vitality:0,fortune:0,edge:0},achievements:[],achievementProgress:{},runs:0,bestTime:0,bestKills:0,bestLevel:1,bossKills:{},totalKills:0,totalXp:0,shardsFound:[],seenZones:[`cemetery`],lastSeed:20261102},o={version:1,language:`en`,master:.8,sfx:.85,music:.35,shake:.7,flash:.75,damageNumbers:!0,musicEnabled:!0,seed:20261102};function s(e){return JSON.parse(JSON.stringify(e))}function c(e){try{let t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}function l(e,t){try{return localStorage.setItem(e,JSON.stringify(t)),!0}catch{return!1}}var u=class{constructor(e={metaKey:`hellshard.meta.v1`,settingsKey:`hellshard.settings.v1`}){this.metaKey=e.metaKey,this.settingsKey=e.settingsKey,this.meta=this.loadMeta(),this.settings=this.loadSettings()}loadMeta(){let e=c(this.metaKey);if(!e||typeof e!=`object`)return s(a);let t={...s(a),...e};return t.permanent={...a.permanent,...e.permanent??{}},t.unlockedCharacters=Array.isArray(e.unlockedCharacters)?e.unlockedCharacters:[`kael`,`brakk`],t.achievements=Array.isArray(e.achievements)?e.achievements:[],t.achievementProgress=e.achievementProgress??{},t.bossKills=e.bossKills??{},t.shardsFound=Array.isArray(e.shardsFound)?e.shardsFound:[],t.seenZones=Array.isArray(e.seenZones)?e.seenZones:[`cemetery`],t}loadSettings(){let e=c(this.settingsKey);return!e||typeof e!=`object`?s(o):{...s(o),...e}}saveMeta(){return l(this.metaKey,this.meta)}saveSettings(){return l(this.settingsKey,this.settings)}updateMeta(e){return this.meta={...this.meta,...e},this.saveMeta(),this.meta}updateSettings(e){return this.settings={...this.settings,...e},this.saveSettings(),this.settings}addShards(e){return this.meta.hellshards=Math.max(0,(this.meta.hellshards??0)+e),this.saveMeta(),this.meta.hellshards}spendShards(e){return e<0||(this.meta.hellshards??0)<e?!1:(this.meta.hellshards-=e,this.saveMeta(),!0)}unlockCharacter(e,t){return this.meta.unlockedCharacters.includes(e)?!0:this.spendShards(t)?(this.meta.unlockedCharacters.push(e),this.meta.selectedCharacter=e,this.saveMeta(),!0):!1}isUnlocked(e){return this.meta.unlockedCharacters.includes(e)}recordRun(e){let t=this.meta;t.runs+=1,t.totalKills+=e.kills,t.totalXp+=e.xp,t.bestTime=Math.max(t.bestTime,e.elapsed),t.bestKills=Math.max(t.bestKills,e.kills),t.bestLevel=Math.max(t.bestLevel,e.level),t.hellshards+=e.shardsEarned,t.lastSeed=e.seed;for(let n of e.bosses)t.bossKills[n]=(t.bossKills[n]??0)+1;for(let n of e.shardIds)t.shardsFound.includes(n)||t.shardsFound.push(n);return t.bestTime=t.bestTime??0,this.saveMeta(),t}resetMeta(){return this.meta=s(a),this.saveMeta(),this.meta}resetSettings(){return this.settings=s(o),this.saveSettings(),this.settings}};function d(e,t=0){let n=(e|0)^2654435769^Math.imul(t|0,2246822507);return n=Math.imul(n^n>>>16,569420461),n=Math.imul(n^n>>>15,1935289751),n^=n>>>15,n>>>0}function f(e,...t){let n=d(e);for(let e of t){let t=typeof e==`number`?e:p(String(e));n=d(n^t,2654435769)}return n>>>0}function p(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function m(e){let t=e>>>0;return function(){t|=0,t=t+1831565813|0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var h=class e{constructor(e=1){this.seed=e>>>0,this._next=m(this.seed)}next(){return this._next()}float(e=0,t=1){return e+this.next()*(t-e)}int(e,t){return t<e?e:Math.floor(this.float(e,t+1))}chance(e){return this.next()<e}pick(e){if(e.length)return e[this.int(0,e.length-1)]}weighted(e){let t=0;for(let n of e)t+=n.weight;let n=this.next()*t;for(let t of e)if(n-=t.weight,n<=0)return t.value;return e[e.length-1]?.value}shuffle(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=this.int(0,e),r=t[e];t[e]=t[n],t[n]=r}return t}derive(t){return new e(f(this.seed,t))}};function g(e,t,n){return e<t?t:e>n?n:e}function _(e,t,n){return e+(t-e)*n}function v(e,t,n,r){return _(e,t,1-Math.exp(-n*r))}var y={samples:{attack:`assets/cemetery/demo/assets/sounds/attack.ogg`,hurt:`assets/cemetery/demo/assets/sounds/hurt.ogg`,jump:`assets/cemetery/demo/assets/sounds/jump.ogg`,kill:`assets/cemetery/demo/assets/sounds/kill.ogg`,rise:`assets/cemetery/demo/assets/sounds/rise.ogg`},music:{cemetery:`assets/cemetery/demo/assets/sounds/sci_fi_platformer04_main_loop.ogg`},bindings:{swing:{sample:`attack`,fallback:`swing`},swingHeavy:{sample:`attack`,fallback:`swingHeavy`,pitch:.86},playerHurt:{sample:`hurt`,fallback:`playerHurt`},jump:{sample:`jump`,fallback:`jump`},enemyDeath:{sample:`kill`,fallback:`death`},rise:{sample:`rise`,fallback:`ability`,pitch:.72,volume:.8}},pitchJitter:.05,gainJitter:.08},b={jump:{type:`sweep`,from:170,to:330,duration:.12,gain:.12,wave:`square`},dash:{type:`noise`,duration:.18,gain:.18,band:900,q:.8,slide:500},swing:{type:`noise`,duration:.1,gain:.12,band:1800,q:1.2,slide:900},swingHeavy:{type:`noise`,duration:.22,gain:.18,band:700,q:1.4,slide:300},hit:{type:`both`,duration:.09,gain:.24,wave:`square`,from:120,to:50,noiseGain:.12,band:800},crit:{type:`both`,duration:.16,gain:.28,wave:`sawtooth`,from:500,to:180,noiseGain:.14,band:2400},death:{type:`sweep`,from:190,to:42,duration:.38,gain:.2,wave:`sawtooth`},playerHurt:{type:`both`,duration:.26,gain:.24,wave:`square`,from:90,to:38,noiseGain:.1,band:300},xp:{type:`sweep`,from:620,to:880,duration:.08,gain:.05,wave:`sine`},levelUp:{type:`arp`,notes:[261,329,392,523],duration:.12,gain:.12,wave:`triangle`},boss:{type:`both`,duration:.9,gain:.24,wave:`sawtooth`,from:54,to:34,noiseGain:.08,band:120},chest:{type:`arp`,notes:[392,494,587,784],duration:.1,gain:.1,wave:`sine`},shard:{type:`arp`,notes:[523,659,784,1046,1318],duration:.14,gain:.14,wave:`triangle`},interact:{type:`sweep`,from:280,to:340,duration:.06,gain:.06,wave:`triangle`},projectile:{type:`sweep`,from:420,to:220,duration:.07,gain:.045,wave:`triangle`},ability:{type:`both`,duration:.3,gain:.16,wave:`sine`,from:300,to:700,noiseGain:.06,band:1500},blink:{type:`both`,duration:.18,gain:.13,wave:`sine`,from:900,to:200,noiseGain:.05,band:2400},empty:{type:`sweep`,from:120,to:90,duration:.08,gain:.05,wave:`square`},elite:{type:`both`,duration:.45,gain:.15,wave:`sawtooth`,from:70,to:100,noiseGain:.05,band:200},gate:{type:`sweep`,from:90,to:50,duration:.5,gain:.16,wave:`triangle`},ui:{type:`sweep`,from:420,to:460,duration:.04,gain:.04,wave:`triangle`}};function x(e){let t=globalThis.document?.baseURI??globalThis.location?.href;return t?new URL(e,t).href:e}var S=class{constructor(e,t={}){this.settings=e,this.context=null,this.masterGain=null,this.sfxGain=null,this.musicGain=null,this.noiseBuffer=null,this.musicNodes=[],this.musicStarted=!1,this.throttle=new Map,this.hooks=t,this.enabled=!0,this.samples=new Map,this.sampleFailures=new Set,this.sampleLoadPromise=null,this.musicBuffer=null,this.musicSource=null,this.musicZone=null,this.ambientZone=null,this.mutedZone=null}ensure(){if(this.context)return this.context.state===`suspended`&&this.context.resume().catch(()=>{}),this.context;let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;try{this.context=new e}catch{return null}return this.masterGain=this.context.createGain(),this.sfxGain=this.context.createGain(),this.musicGain=this.context.createGain(),this.sfxGain.connect(this.masterGain),this.musicGain.connect(this.masterGain),this.masterGain.connect(this.context.destination),this.applyVolumes(),this.noiseBuffer=this.createNoiseBuffer(1.5),this.loadSamples(),this.context}createNoiseBuffer(e){let t=this.context,n=Math.floor(t.sampleRate*e),r=t.createBuffer(1,n,t.sampleRate),i=r.getChannelData(0),a=0;for(let e=0;e<n;e++)a=a*.75+(Math.random()*2-1)*.25,i[e]=a;return r}async decodeAudio(e){let t=await fetch(x(e));if(!t.ok)throw Error(`Audio fetch failed: ${e} (${t.status})`);let n=await t.arrayBuffer();return await new Promise((e,t)=>{let r=this.context.decodeAudioData(n,e,t);r?.then&&r.then(e,t)})}loadSamples(){if(this.sampleLoadPromise)return this.sampleLoadPromise;let e=Object.entries(y.samples).map(async([e,t])=>{try{this.samples.set(e,await this.decodeAudio(t))}catch{this.sampleFailures.add(e)}}),t=(async()=>{let e=y.music.cemetery;if(e)try{this.musicBuffer=await this.decodeAudio(e)}catch{this.musicBuffer=null}})();return this.sampleLoadPromise=Promise.allSettled([...e,t]).then(()=>{let e=this.ambientZone;this.context&&e&&this.settings.musicEnabled!==!1&&y.music[e]&&this.musicBuffer&&!this.musicSource&&(this.stopSynthAmbient(),this.startMusicLoop(e))}),this.sampleLoadPromise}applyVolumes(){if(!this.context)return;let e=this.settings,t=g(Number(e.master??.8),0,1);this.masterGain.gain.setTargetAtTime(t,this.context.currentTime,.03),this.sfxGain.gain.setTargetAtTime(g(Number(e.sfx??.8),0,1),this.context.currentTime,.03);let n=e.musicEnabled===!1?0:g(Number(e.music??.3),0,1);this.musicGain.gain.setTargetAtTime(n,this.context.currentTime,.05)}setSettings(e){let t=this.settings.musicEnabled===!1,n=this.ambientZone;if(this.settings=e,this.applyVolumes(),e.musicEnabled===!1)this.stopAmbient(),this.mutedZone=n;else if(t&&this.mutedZone){let e=this.mutedZone;this.mutedZone=null,this.startAmbient(e)}}isThrottled(e,t){let n=performance.now();return n-(this.throttle.get(e)??0)<t||(this.throttle.set(e,n),!1)}play(e,t={}){if(!this.enabled)return;let n=this.ensure();if(!n)return;let r=y.bindings[e]??null;if(this.isThrottled(e,t.throttle??24))return;let i=g(t.volume??1,0,2),a=g(t.pitch??1,.4,2.4),o=n.currentTime,s=r?.sample?this.samples.get(r.sample):null;if(s){this.playSample(s,r,i,a);return}let c=b[e]??(r?.fallback?b[r.fallback]:null)??b.ui,l=i*(r?.volume??1),u=a*(r?.pitch??1);c.type===`arp`?c.notes.forEach((e,t)=>{this.playTone({frequency:e*u,duration:c.duration,gain:c.gain*l,wave:c.wave,start:o+t*c.duration*.8})}):((c.type===`noise`||c.type===`both`)&&this.playNoise(c,u,l,o),(c.type===`sweep`||c.type===`both`)&&this.playTone({frequency:c.from*u,endFrequency:c.to*u,duration:c.duration,gain:c.gain*l,wave:c.wave,start:o}))}playSample(e,t,n,r){let i=this.context,a=i.currentTime,o=i.createBufferSource();o.buffer=e;let s=1+(Math.random()*2-1)*y.pitchJitter,c=1+(Math.random()*2-1)*y.gainJitter;o.playbackRate.setValueAtTime(g(r*(t.pitch??1)*s,.4,2.4),a);let l=i.createGain();l.gain.value=g(n*(t.volume??1)*c,0,2),o.connect(l),l.connect(this.sfxGain),o.start(a),o.onended=()=>{o.disconnect(),l.disconnect()}}playTone({frequency:e,endFrequency:t,duration:n,gain:r,wave:i=`sine`,start:a}){let o=this.context,s=o.createOscillator(),c=o.createGain();s.type=i,s.frequency.setValueAtTime(Math.max(20,e),a),t&&s.frequency.exponentialRampToValueAtTime(Math.max(20,t),a+n),c.gain.setValueAtTime(1e-4,a),c.gain.exponentialRampToValueAtTime(Math.max(1e-4,r),a+.008),c.gain.exponentialRampToValueAtTime(1e-4,a+n),s.connect(c),c.connect(this.sfxGain),s.start(a),s.stop(a+n+.02),s.onended=()=>{s.disconnect(),c.disconnect()}}playNoise(e,t,n,r){let i=this.context;if(!this.noiseBuffer)return;let a=i.createBufferSource();a.buffer=this.noiseBuffer;let o=i.createBiquadFilter();o.type=`bandpass`;let s=Math.max(80,(e.band??900)*t);o.frequency.setValueAtTime(s,r),e.slide&&o.frequency.exponentialRampToValueAtTime(Math.max(80,s+e.slide*t),r+e.duration),o.Q.value=e.q??1;let c=i.createGain(),l=(e.noiseGain??e.gain)*n;c.gain.setValueAtTime(1e-4,r),c.gain.exponentialRampToValueAtTime(Math.max(1e-4,l),r+.01),c.gain.exponentialRampToValueAtTime(1e-4,r+e.duration),a.connect(o),o.connect(c),c.connect(this.sfxGain),a.start(r),a.stop(r+e.duration+.02),a.onended=()=>{a.disconnect(),o.disconnect(),c.disconnect()}}startAmbient(e=`cemetery`){this.ambientZone=e,this.settings.musicEnabled!==!1&&this.ensure()&&(y.music[e]&&this.musicBuffer?(this.stopSynthAmbient(),this.startMusicLoop(e)):(this.stopMusicLoop(),this.startSynthAmbient(e)))}startMusicLoop(e){if(this.musicSource&&this.musicZone===e||(this.stopMusicLoop(),!this.musicBuffer))return;let t=this.context,n=t.createBufferSource();n.buffer=this.musicBuffer,n.loop=!0,n.connect(this.musicGain),n.start(t.currentTime),this.musicSource=n,this.musicZone=e}stopMusicLoop(){if(this.musicSource){try{this.musicSource.stop()}catch{}this.musicSource.disconnect()}this.musicSource=null,this.musicZone=null}startSynthAmbient(e){if(this.settings.musicEnabled===!1)return;let t=this.ensure();if(!t)return;if(this.musicStarted){this.setSynthZone(e);return}this.musicStarted=!0,this.ambientZone=e;let n={cemetery:55,church:49,swamp:46,dungeon:41,forest:52}[e]??50,r=t.createGain();r.gain.setValueAtTime(1e-4,t.currentTime),r.gain.exponentialRampToValueAtTime(.12,t.currentTime+3),r.connect(this.musicGain);for(let e=0;e<3;e++){let i=t.createOscillator(),a=t.createGain(),o=t.createBiquadFilter();i.type=e===0?`sine`:`triangle`,i.frequency.value=n*(e+1)*.5,i.detune.value=(e-1)*6,o.type=`lowpass`,o.frequency.value=240+e*60,a.gain.value=.22/(e+1),i.connect(o),o.connect(a),a.connect(r),i.start(),this.musicNodes.push({osc:i,oscGain:a,filter:o})}let i=t.createOscillator(),a=t.createGain();i.frequency.value=.06,a.gain.value=.03,i.connect(a),a.connect(r.gain),i.start(),this.musicNodes.push({lfo:i,lfoGain:a,extra:!0}),this.synthZone=e}setSynthZone(e){if(!this.context||!this.musicStarted)return;let t={cemetery:55,church:49,swamp:46,dungeon:41,forest:52}[e]??50,n=this.context.currentTime,r=0;for(let e of this.musicNodes)if(e.osc){let i=(r+1)*.5;e.osc.frequency.setTargetAtTime(t*i,n,1.5),r++}this.synthZone=e}stopSynthAmbient(){if(!this.context||!this.musicStarted)return;let e=this.context.currentTime;for(let t of this.musicNodes)try{t.osc&&t.osc.stop(e+1.2),t.lfo&&t.lfo.stop(e+1.2)}catch{}this.musicNodes=[],this.musicStarted=!1,this.synthZone=null}stopAmbient(){this.stopSynthAmbient(),this.stopMusicLoop(),this.ambientZone=null,this.mutedZone=null}setAmbientZone(e){this.context?this.startAmbient(e):this.ambientZone=e}setEnabled(e){this.enabled=e,e||this.stopAmbient()}destroy(){this.stopAmbient(),this.context&&this.context.close().catch(()=>{}),this.context=null}},C=1e3,w=1001,T=1002,E=1003,D=1004,O=1005,k=1006,A=1007,j=1008,M=1009,ee=1010,N=1011,te=1012,P=1013,ne=1014,re=1015,ie=1016,ae=1017,oe=1018,se=1020,ce=35902,F=35899,le=1021,ue=1022,de=1023,fe=1026,pe=1027,me=1028,he=1029,ge=1030,_e=1031,ve=1033,ye=33776,be=33777,xe=33778,Se=33779,Ce=35840,we=35841,Te=35842,Ee=35843,De=36196,Oe=37492,ke=37496,Ae=37488,je=37489,Me=37490,Ne=37491,I=37808,Pe=37809,Fe=37810,Ie=37811,L=37812,Le=37813,R=37814,z=37815,Re=37816,ze=37817,Be=37818,Ve=37819,He=37820,Ue=37821,We=36492,Ge=36494,Ke=36495,qe=36283,Je=36284,Ye=36285,Xe=36286,Ze=2300,Qe=2301,$e=2302,et=2303,tt=2400,nt=2401,rt=2402,it=3200,at=`srgb`,ot=`srgb-linear`,st=`linear`,ct=`srgb`,lt=7680,ut=35044,dt=35048,ft=2e3;function pt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function mt(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function ht(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function gt(){let e=ht(`canvas`);return e.style.display=`block`,e}var _t={};function vt(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function yt(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function B(...e){e=yt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function V(...e){e=yt(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function bt(...e){let t=e.join(` `);t in _t||(_t[t]=!0,B(...e))}function xt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var St={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},Ct=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},wt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Tt=Math.PI/180,Et=180/Math.PI;function Dt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(wt[e&255]+wt[e>>8&255]+wt[e>>16&255]+wt[e>>24&255]+`-`+wt[t&255]+wt[t>>8&255]+`-`+wt[t>>16&15|64]+wt[t>>24&255]+`-`+wt[n&63|128]+wt[n>>8&255]+`-`+wt[n>>16&255]+wt[n>>24&255]+wt[r&255]+wt[r>>8&255]+wt[r>>16&255]+wt[r>>24&255]).toLowerCase()}function H(e,t,n){return Math.max(t,Math.min(n,e))}function Ot(e,t){return(e%t+t)%t}function kt(e,t,n){return(1-n)*e+n*t}function At(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function jt(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Mt(e,t){if(t.constructor===Float32Array)return e;let n=jt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Nt(e,t){if(t.constructor===Float32Array)return e;let n=jt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var U=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Pt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:B(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(H(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(It.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(It.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ft.copy(this).projectOnVector(e),this.sub(Ft)}reflect(e){return this.sub(Ft.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ft=new W,It=new Pt,G=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return bt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Lt.makeScale(e,t)),this}rotate(e){return bt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Lt.makeRotation(-e)),this}translate(e,t){return bt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Lt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Lt=new G,Rt=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zt=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Bt(){let e={enabled:!0,workingColorSpace:ot,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Vt(e.r),e.g=Vt(e.g),e.b=Vt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Ht(e.r),e.g=Ht(e.g),e.b=Ht(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?st:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[ot]:{primaries:t,whitePoint:r,transfer:st,toXYZ:Rt,fromXYZ:zt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:at},outputColorSpaceConfig:{drawingBufferColorSpace:at}},[at]:{primaries:t,whitePoint:r,transfer:ct,toXYZ:Rt,fromXYZ:zt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:at}}}),e}var K=Bt();function Vt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Ht(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Ut,Wt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ut===void 0&&(Ut=ht(`canvas`)),Ut.width=e.width,Ut.height=e.height;let t=Ut.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Ut}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=ht(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Vt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Vt(t[e]/255)*255):t[e]=Vt(t[e]);return{data:t,width:e.width,height:e.height}}return B(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Gt=0,Kt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Gt++}),this.uuid=Dt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(qt(r[t].image)):e.push(qt(r[t]))}else e=qt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function qt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Wt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(B(`Texture: Unable to serialize Texture.`),{})}var Jt=0,Yt=new W,Xt=class e extends Ct{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=w,i=w,a=k,o=j,s=de,c=M,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Jt++}),this.uuid=Dt(),this.name=``,this.source=new Kt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new U(0,0),this.repeat=new U(1,1),this.center=new U(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Yt).x}get height(){return this.source.getSize(Yt).y}get depth(){return this.source.getSize(Yt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){B(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?B(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case C:e.x-=Math.floor(e.x);break;case w:e.x=e.x<0?0:1;break;case T:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case C:e.y-=Math.floor(e.y);break;case w:e.y=e.y<0?0:1;break;case T:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Xt.DEFAULT_IMAGE=null,Xt.DEFAULT_MAPPING=300,Xt.DEFAULT_ANISOTROPY=1;var Zt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this.w=H(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this.w=H(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Qt=class extends Ct{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:k,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Zt(0,0,e,t),this.scissorTest=!1,this.viewport=new Zt(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new Xt({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:k,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Kt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},$t=class extends Qt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},en=class extends Xt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=E,this.minFilter=E,this.wrapR=w,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},tn=class extends Xt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=E,this.minFilter=E,this.wrapR=w,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},nn=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/rn.setFromMatrixColumn(e,0).length(),i=1/rn.setFromMatrixColumn(e,1).length(),a=1/rn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(on,e,sn)}lookAt(e,t,n){let r=this.elements;return un.subVectors(e,t),un.lengthSq()===0&&(un.z=1),un.normalize(),cn.crossVectors(n,un),cn.lengthSq()===0&&(Math.abs(n.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),cn.crossVectors(n,un)),cn.normalize(),ln.crossVectors(un,cn),r[0]=cn.x,r[4]=ln.x,r[8]=un.x,r[1]=cn.y,r[5]=ln.y,r[9]=un.y,r[2]=cn.z,r[6]=ln.z,r[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],ee=r[3],N=r[7],te=r[11],P=r[15];return i[0]=a*x+o*T+s*k+c*ee,i[4]=a*S+o*E+s*A+c*N,i[8]=a*C+o*D+s*j+c*te,i[12]=a*w+o*O+s*M+c*P,i[1]=l*x+u*T+d*k+f*ee,i[5]=l*S+u*E+d*A+f*N,i[9]=l*C+u*D+d*j+f*te,i[13]=l*w+u*O+d*M+f*P,i[2]=p*x+m*T+h*k+g*ee,i[6]=p*S+m*E+h*A+g*N,i[10]=p*C+m*D+h*j+g*te,i[14]=p*w+m*O+h*M+g*P,i[3]=_*x+v*T+y*k+b*ee,i[7]=_*S+v*E+y*A+b*N,i[11]=_*C+v*D+y*j+b*te,i[15]=_*w+v*O+y*M+b*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=rn.set(r[0],r[1],r[2]).length(),o=rn.set(r[4],r[5],r[6]).length(),s=rn.set(r[8],r[9],r[10]).length();i<0&&(a=-a),an.copy(this);let c=1/a,l=1/o,u=1/s;return an.elements[0]*=c,an.elements[1]*=c,an.elements[2]*=c,an.elements[4]*=l,an.elements[5]*=l,an.elements[6]*=l,an.elements[8]*=u,an.elements[9]*=u,an.elements[10]*=u,t.setFromRotationMatrix(an),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=ft,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=ft,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},rn=new W,an=new nn,on=new W(0,0,0),sn=new W(1,1,1),cn=new W,ln=new W,un=new W,dn=new nn,fn=new Pt,pn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(H(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-H(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(H(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-H(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(H(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-H(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:B(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return dn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return fn.setFromEuler(this),this.setFromQuaternion(fn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pn.DEFAULT_ORDER=`XYZ`;var mn=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},hn=0,gn=new W,_n=new Pt,vn=new nn,yn=new W,bn=new W,xn=new W,Sn=new Pt,Cn=new W(1,0,0),wn=new W(0,1,0),Tn=new W(0,0,1),En={type:`added`},Dn={type:`removed`},On={type:`childadded`,child:null},kn={type:`childremoved`,child:null},An=class e extends Ct{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:hn++}),this.uuid=Dt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new pn,r=new Pt,i=new W(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new nn},normalMatrix:{value:new G}}),this.matrix=new nn,this.matrixWorld=new nn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new mn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return _n.setFromAxisAngle(e,t),this.quaternion.multiply(_n),this}rotateOnWorldAxis(e,t){return _n.setFromAxisAngle(e,t),this.quaternion.premultiply(_n),this}rotateX(e){return this.rotateOnAxis(Cn,e)}rotateY(e){return this.rotateOnAxis(wn,e)}rotateZ(e){return this.rotateOnAxis(Tn,e)}translateOnAxis(e,t){return gn.copy(e).applyQuaternion(this.quaternion),this.position.add(gn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Cn,e)}translateY(e){return this.translateOnAxis(wn,e)}translateZ(e){return this.translateOnAxis(Tn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(vn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?yn.copy(e):yn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),bn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vn.lookAt(bn,yn,this.up):vn.lookAt(yn,bn,this.up),this.quaternion.setFromRotationMatrix(vn),r&&(vn.extractRotation(r.matrixWorld),_n.setFromRotationMatrix(vn),this.quaternion.premultiply(_n.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(V(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(En),On.child=e,this.dispatchEvent(On),On.child=null):V(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Dn),kn.child=e,this.dispatchEvent(kn),kn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),vn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),vn.multiply(e.parent.matrixWorld)),e.applyMatrix4(vn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(En),On.child=e,this.dispatchEvent(On),On.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bn,e,xn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bn,Sn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};An.DEFAULT_UP=new W(0,1,0),An.DEFAULT_MATRIX_AUTO_UPDATE=!0,An.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var jn=class extends An{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Mn={type:`move`},Nn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new jn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new jn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new jn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Mn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new jn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Pn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Fn={h:0,s:0,l:0},In={h:0,s:0,l:0};function Ln(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var q=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=at){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,K.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=K.workingColorSpace){return this.r=e,this.g=t,this.b=n,K.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=K.workingColorSpace){if(e=Ot(e,1),t=H(t,0,1),n=H(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Ln(i,r,e+1/3),this.g=Ln(i,r,e),this.b=Ln(i,r,e-1/3)}return K.colorSpaceToWorking(this,r),this}setStyle(e,t=at){function n(t){t!==void 0&&parseFloat(t)<1&&B(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:B(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);B(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=at){let n=Pn[e.toLowerCase()];return n===void 0?B(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vt(e.r),this.g=Vt(e.g),this.b=Vt(e.b),this}copyLinearToSRGB(e){return this.r=Ht(e.r),this.g=Ht(e.g),this.b=Ht(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=at){return K.workingToColorSpace(Rn.copy(this),e),Math.round(H(Rn.r*255,0,255))*65536+Math.round(H(Rn.g*255,0,255))*256+Math.round(H(Rn.b*255,0,255))}getHexString(e=at){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=K.workingColorSpace){K.workingToColorSpace(Rn.copy(this),t);let n=Rn.r,r=Rn.g,i=Rn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=K.workingColorSpace){return K.workingToColorSpace(Rn.copy(this),t),e.r=Rn.r,e.g=Rn.g,e.b=Rn.b,e}getStyle(e=at){K.workingToColorSpace(Rn.copy(this),e);let t=Rn.r,n=Rn.g,r=Rn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Fn),this.setHSL(Fn.h+e,Fn.s+t,Fn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Fn),e.getHSL(In);let n=kt(Fn.h,In.h,t),r=kt(Fn.s,In.s,t),i=kt(Fn.l,In.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Rn=new q;q.NAMES=Pn;var zn=class extends An{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pn,this.environmentIntensity=1,this.environmentRotation=new pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Bn=new W,Vn=new W,Hn=new W,Un=new W,Wn=new W,Gn=new W,Kn=new W,qn=new W,Jn=new W,Yn=new W,Xn=new Zt,Zn=new Zt,Qn=new Zt,$n=class e{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Bn.subVectors(e,t),r.cross(Bn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Bn.subVectors(r,t),Vn.subVectors(n,t),Hn.subVectors(e,t);let a=Bn.dot(Bn),o=Bn.dot(Vn),s=Bn.dot(Hn),c=Vn.dot(Vn),l=Vn.dot(Hn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Un)!==null&&Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Un)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Un.x),s.addScaledVector(a,Un.y),s.addScaledVector(o,Un.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Xn.setScalar(0),Zn.setScalar(0),Qn.setScalar(0),Xn.fromBufferAttribute(e,t),Zn.fromBufferAttribute(e,n),Qn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Xn,i.x),a.addScaledVector(Zn,i.y),a.addScaledVector(Qn,i.z),a}static isFrontFacing(e,t,n,r){return Bn.subVectors(n,t),Vn.subVectors(e,t),Bn.cross(Vn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Bn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),Bn.cross(Vn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Wn.subVectors(r,n),Gn.subVectors(i,n),qn.subVectors(e,n);let s=Wn.dot(qn),c=Gn.dot(qn);if(s<=0&&c<=0)return t.copy(n);Jn.subVectors(e,r);let l=Wn.dot(Jn),u=Gn.dot(Jn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Wn,a);Yn.subVectors(e,i);let f=Wn.dot(Yn),p=Gn.dot(Yn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Gn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Kn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Kn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Wn,a).addScaledVector(Gn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},er=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(nr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(nr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=nr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,nr):nr.fromBufferAttribute(r,t),nr.applyMatrix4(e.matrixWorld),this.expandByPoint(nr);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),rr.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),rr.copy(e.boundingBox)),rr.applyMatrix4(e.matrixWorld),this.union(rr)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nr),nr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ur),dr.subVectors(this.max,ur),ir.subVectors(e.a,ur),ar.subVectors(e.b,ur),or.subVectors(e.c,ur),sr.subVectors(ar,ir),cr.subVectors(or,ar),lr.subVectors(ir,or);let t=[0,-sr.z,sr.y,0,-cr.z,cr.y,0,-lr.z,lr.y,sr.z,0,-sr.x,cr.z,0,-cr.x,lr.z,0,-lr.x,-sr.y,sr.x,0,-cr.y,cr.x,0,-lr.y,lr.x,0];return!mr(t,ir,ar,or,dr)||(t=[1,0,0,0,1,0,0,0,1],!mr(t,ir,ar,or,dr))?!1:(fr.crossVectors(sr,cr),t=[fr.x,fr.y,fr.z],mr(t,ir,ar,or,dr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(nr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(tr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),tr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),tr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),tr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),tr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),tr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),tr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),tr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(tr)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},tr=[new W,new W,new W,new W,new W,new W,new W,new W],nr=new W,rr=new er,ir=new W,ar=new W,or=new W,sr=new W,cr=new W,lr=new W,ur=new W,dr=new W,fr=new W,pr=new W;function mr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){pr.fromArray(e,a);let o=i.x*Math.abs(pr.x)+i.y*Math.abs(pr.y)+i.z*Math.abs(pr.z),s=t.dot(pr),c=n.dot(pr),l=r.dot(pr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var hr=new W,gr=new U,_r=0,vr=class extends Ct{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_r++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=ut,this.updateRanges=[],this.gpuType=re,this.version=0,this._normalizationScale=e===void 0?void 0:jt(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyMatrix3(e),this.setXY(t,gr.x,gr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyMatrix3(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyMatrix4(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyNormalMatrix(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.transformDirection(e),this.setXYZ(t,hr.x,hr.y,hr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?Mt(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Nt(e,this.array):Math.round(e*t)}},yr=class extends vr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},br=class extends vr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},J=class extends vr{constructor(e,t,n){super(new Float32Array(e),t,n)}},xr=new er,Sr=new W,Cr=new W,wr=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?xr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Sr.subVectors(e,this.center);let t=Sr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Sr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Cr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Sr.copy(e.center).add(Cr)),this.expandByPoint(Sr.copy(e.center).sub(Cr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Tr=0,Er=new nn,Dr=new An,Or=new W,kr=new er,Ar=new er,jr=new W,Mr=class e extends Ct{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Tr++}),this.uuid=Dt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(pt(e)?br:yr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new G().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Er.makeRotationFromQuaternion(e),this.applyMatrix4(Er),this}rotateX(e){return Er.makeRotationX(e),this.applyMatrix4(Er),this}rotateY(e){return Er.makeRotationY(e),this.applyMatrix4(Er),this}rotateZ(e){return Er.makeRotationZ(e),this.applyMatrix4(Er),this}translate(e,t,n){return Er.makeTranslation(e,t,n),this.applyMatrix4(Er),this}scale(e,t,n){return Er.makeScale(e,t,n),this.applyMatrix4(Er),this}lookAt(e){return Dr.lookAt(e),Dr.updateMatrix(),this.applyMatrix4(Dr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Or).negate(),this.translate(Or.x,Or.y,Or.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new J(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&B(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new er);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)V(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];kr.setFromBufferAttribute(n),this.morphTargetsRelative?(jr.addVectors(this.boundingBox.min,kr.min),this.boundingBox.expandByPoint(jr),jr.addVectors(this.boundingBox.max,kr.max),this.boundingBox.expandByPoint(jr)):(this.boundingBox.expandByPoint(kr.min),this.boundingBox.expandByPoint(kr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&V(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)V(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new W,1/0);else if(e){let n=this.boundingSphere.center;if(kr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ar.setFromBufferAttribute(n),this.morphTargetsRelative?(jr.addVectors(kr.min,Ar.min),kr.expandByPoint(jr),jr.addVectors(kr.max,Ar.max),kr.expandByPoint(jr)):(kr.expandByPoint(Ar.min),kr.expandByPoint(Ar.max))}kr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)jr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(jr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)jr.fromBufferAttribute(a,t),o&&(Or.fromBufferAttribute(e,t),jr.add(Or)),r=Math.max(r,n.distanceToSquared(jr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&V(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){V(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new vr(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new W,s[e]=new W;let l=new W,u=new W,d=new W,f=new U,p=new U,m=new U,h=new W,g=new W;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new W,b=new W,x=new W,S=new W;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new vr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new W,i=new W,a=new W,o=new W,s=new W,c=new W,l=new W,u=new W;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)jr.fromBufferAttribute(e,t),jr.normalize(),e.setXYZ(t,jr.x,jr.y,jr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new vr(a,r,i)}if(this.index===null)return B(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Nr=new W,Pr=new W,Fr=new G,Ir=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Nr.subVectors(n,t).cross(Pr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Nr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Fr.getNormalMatrix(e),r=this.coplanarPoint(Nr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Lr=0,Rr=class extends Ct{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Lr++}),this.uuid=Dt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new q(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=lt,this.stencilZFail=lt,this.stencilZPass=lt,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){B(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?B(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new q().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Ir().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new U().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new U().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},zr=new W,Br=new W,Vr=new W,Hr=new W,Ur=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,zr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=zr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(zr.copy(this.origin).addScaledVector(this.direction,t),zr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Br.copy(e).add(t).multiplyScalar(.5),Vr.copy(t).sub(e).normalize(),Hr.copy(this.origin).sub(Br);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Vr),o=Hr.dot(this.direction),s=-Hr.dot(Vr),c=Hr.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Br).addScaledVector(Vr,d),f}intersectSphere(e,t){if(e.radius<0)return null;zr.subVectors(e.center,this.origin);let n=zr.dot(this.direction),r=zr.dot(zr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,zr)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,ee;if(y>=b&&y>=x?(w=s,D=u,A=p,ee=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,ee=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,ee=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let N=S/w,te=C/w,P=1/w,ne=T-N*D,re=E-te*D,ie=O-N*A,ae=k-te*A,oe=j-N*ee,se=M-te*ee,ce=oe*ae-se*ie,F=ne*se-re*oe,le=ie*re-ae*ne;if(r){if(ce<0||F<0||le<0)return null}else if((ce<0||F<0||le<0)&&(ce>0||F>0||le>0))return null;let ue=ce+F+le;if(ue===0)return null;let de=P*(ce*D+F*A+le*ee);return(ue>0?de<0:de>0)?null:this.at(de/ue,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Wr=class extends Rr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new q(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Gr=new nn,Kr=new Ur,qr=new wr,Jr=new W,Yr=new W,Xr=new W,Zr=new W,Qr=new W,$r=new W,ei=new W,ti=new W,ni=class extends An{constructor(e=new Mr,t=new Wr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){$r.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Qr.fromBufferAttribute(s,e),a?$r.addScaledVector(Qr,r):$r.addScaledVector(Qr.sub(t),r))}t.add($r)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),qr.copy(n.boundingSphere),qr.applyMatrix4(i),Kr.copy(e.ray).recast(e.near),qr.containsPoint(Kr.origin)===!1&&(Kr.intersectSphere(qr,Jr)===null||Kr.origin.distanceToSquared(Jr)>(e.far-e.near)**2)||(Gr.copy(i).invert(),Kr.copy(e.ray).applyMatrix4(Gr),(n.boundingBox===null||Kr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Kr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ii(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ii(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ii(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ii(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ri(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;ti.copy(s),ti.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(ti);return l<n.near||l>n.far?null:{distance:l,point:ti.clone(),object:e}}function ii(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Yr),e.getVertexPosition(c,Xr),e.getVertexPosition(l,Zr);let u=ri(e,t,n,r,Yr,Xr,Zr,ei);if(u){let e=new W;$n.getBarycoord(ei,Yr,Xr,Zr,e),i&&(u.uv=$n.getInterpolatedAttribute(i,s,c,l,e,new U)),a&&(u.uv1=$n.getInterpolatedAttribute(a,s,c,l,e,new U)),o&&(u.normal=$n.getInterpolatedAttribute(o,s,c,l,e,new W),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new W,materialIndex:0};$n.getNormal(Yr,Xr,Zr,t.normal),u.face=t,u.barycoord=e}return u}var ai=class extends Xt{constructor(e=null,t=1,n=1,r,i,a,o,s,c=E,l=E,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},oi=class extends vr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},si=new nn,ci=new nn,li=[],ui=new er,di=new nn,fi=new ni,pi=new wr,mi=class extends ni{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new oi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,di)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new er),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,si),ui.copy(e.boundingBox).applyMatrix4(si),this.boundingBox.union(ui)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new wr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,si),pi.copy(e.boundingSphere).applyMatrix4(si),this.boundingSphere.union(pi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(fi.geometry=this.geometry,fi.material=this.material,fi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),pi.copy(this.boundingSphere),pi.applyMatrix4(n),e.ray.intersectsSphere(pi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,si),ci.multiplyMatrices(n,si),fi.matrixWorld=ci,fi.raycast(e,li);for(let e=0,n=li.length;e<n;e++){let n=li[e];n.instanceId=i,n.object=this,t.push(n)}li.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new oi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ai(new Float32Array(r*this.count),r,this.count,me,re));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},hi=new wr,gi=new U(.5,.5),_i=new W,vi=class{constructor(e=new Ir,t=new Ir,n=new Ir,r=new Ir,i=new Ir,a=new Ir){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ft,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),hi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),hi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(hi)}intersectsSprite(e){return hi.center.set(0,0,0),hi.radius=.7071067811865476+gi.distanceTo(e.center),hi.applyMatrix4(e.matrixWorld),this.intersectsSphere(hi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(_i.x=r.normal.x>0?e.max.x:e.min.x,_i.y=r.normal.y>0?e.max.y:e.min.y,_i.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(_i)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},yi=new nn,bi=class e{constructor(){this.coordinateSystem=ft,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];yi.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new vi),n[e].setFromProjectionMatrix(yi,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new vi),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},xi=class extends Xt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Si=class extends Xt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ci=class extends Xt{constructor(e,t,n=ne,r,i,a,o=E,s=E,c,l=fe,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Kt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},wi=class extends Ci{constructor(e,t=ne,n=301,r,i,a=E,o=E,s,c=fe){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ti=class extends Xt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ei=class e extends Mr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new J(c,3)),this.setAttribute(`normal`,new J(l,3)),this.setAttribute(`uv`,new J(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new W;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Di=class e extends Mr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new J(p,3)),this.setAttribute(`normal`,new J(m,3)),this.setAttribute(`uv`,new J(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};function Oi(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Ai(i))i.isRenderTargetTexture?(B(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Ai(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function ki(e){let t={};for(let n=0;n<e.length;n++){let r=Oi(e[n]);for(let e in r)t[e]=r[e]}return t}function Ai(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function ji(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Mi(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:K.workingColorSpace}var Ni={clone:Oi,merge:ki},Pi=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fi=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ii=class extends Rr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pi,this.fragmentShader=Fi,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Oi(e.uniforms),this.uniformsGroups=ji(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new q().setHex(r.value);break;case`v2`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Zt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new G().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new nn().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Li=class extends Ii{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Ri=class extends Rr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=it,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},zi=class extends Rr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Bi(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Vi(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Hi=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Ui=class extends Hi{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:tt,endingEnd:tt}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case nt:i=e,o=2*t-n;break;case rt:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case nt:a=e,s=2*n-t;break;case rt:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Wi=class extends Hi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Gi=class extends Hi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ki=class extends Hi{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Yi(n,t,g,y,r);i[p]=qi(x,o,_,b,m)}return i}};function qi(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Ji(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Yi(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=qi(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Ji(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Xi=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Bi(t,this.TimeBufferType),this.values=Bi(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Bi(e.times,Array),values:Bi(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Vi(e.settings)&&(n.settings={inTangents:Bi(e.settings.inTangents,Array),outTangents:Bi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Gi(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Wi(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ui(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ki(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ze:t=this.InterpolantFactoryMethodDiscrete;break;case Qe:t=this.InterpolantFactoryMethodLinear;break;case $e:t=this.InterpolantFactoryMethodSmooth;break;case et:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return B(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ze;case this.InterpolantFactoryMethodLinear:return Qe;case this.InterpolantFactoryMethodSmooth:return $e;case this.InterpolantFactoryMethodBezier:return et}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Vi(this.settings)&&(Zi(this.settings.inTangents,e),Zi(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Vi(this.settings)&&(Qi(this.settings.inTangents,e),Qi(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(V(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(V(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){V(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){V(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&mt(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){V(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===$e,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Vi(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Zi(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function Qi(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Xi.prototype.ValueTypeName=``,Xi.prototype.TimeBufferType=Float32Array,Xi.prototype.ValueBufferType=Float32Array,Xi.prototype.DefaultInterpolation=Qe;var $i=class extends Xi{constructor(e,t,n){super(e,t,n)}};$i.prototype.ValueTypeName=`bool`,$i.prototype.ValueBufferType=Array,$i.prototype.DefaultInterpolation=Ze,$i.prototype.InterpolantFactoryMethodLinear=void 0,$i.prototype.InterpolantFactoryMethodSmooth=void 0;var ea=class extends Xi{constructor(e,t,n,r){super(e,t,n,r)}};ea.prototype.ValueTypeName=`color`;var ta=class extends Xi{constructor(e,t,n,r){super(e,t,n,r)}};ta.prototype.ValueTypeName=`number`;var na=class extends Hi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Pt.slerpFlat(i,0,a,c-o,a,c,s);return i}},ra=class extends Xi{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new na(this.times,this.values,this.getValueSize(),e)}};ra.prototype.ValueTypeName=`quaternion`,ra.prototype.InterpolantFactoryMethodSmooth=void 0;var ia=class extends Xi{constructor(e,t,n){super(e,t,n)}};ia.prototype.ValueTypeName=`string`,ia.prototype.ValueBufferType=Array,ia.prototype.DefaultInterpolation=Ze,ia.prototype.InterpolantFactoryMethodLinear=void 0,ia.prototype.InterpolantFactoryMethodSmooth=void 0;var aa=class extends Xi{constructor(e,t,n,r){super(e,t,n,r)}};aa.prototype.ValueTypeName=`vector`;var oa=new W,sa=new Pt,ca=new W,la=class extends An{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new nn,this.projectionMatrix=new nn,this.projectionMatrixInverse=new nn,this.coordinateSystem=ft,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(oa,sa,ca),ca.x===1&&ca.y===1&&ca.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(oa,sa,ca.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(oa,sa,ca),ca.x===1&&ca.y===1&&ca.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(oa,sa,ca.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ua=new W,da=new U,fa=new U,pa=class extends la{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Et*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Tt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Et*2*Math.atan(Math.tan(Tt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ua.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ua.x,ua.y).multiplyScalar(-e/ua.z),ua.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ua.x,ua.y).multiplyScalar(-e/ua.z)}getViewSize(e,t){return this.getViewBounds(e,da,fa),t.subVectors(fa,da)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Tt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ma=class extends la{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ha=class extends Mr{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type=`InstancedBufferGeometry`,this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},ga=-90,_a=1,va=class extends An{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new pa(ga,_a,e,t);r.layers=this.layers,this.add(r);let i=new pa(ga,_a,e,t);i.layers=this.layers,this.add(i);let a=new pa(ga,_a,e,t);a.layers=this.layers,this.add(a);let o=new pa(ga,_a,e,t);o.layers=this.layers,this.add(o);let s=new pa(ga,_a,e,t);s.layers=this.layers,this.add(s);let c=new pa(ga,_a,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},ya=class extends pa{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},ba=`\\[\\]\\.:\\/`,xa=RegExp(`[\\[\\]\\.:\\/]`,`g`),Sa=`[^\\[\\]\\.:\\/]`,Ca=`[^`+ba.replace(`\\.`,``)+`]`,wa=`((?:WC+[\\/:])*)`.replace(`WC`,Sa),Ta=`(WCOD+)?`.replace(`WCOD`,Ca),Ea=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Sa),Da=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Sa),Oa=RegExp(`^`+wa+Ta+Ea+Da+`$`),ka=[`material`,`materials`,`bones`,`map`],Aa=class{constructor(e,t,n){let r=n||ja.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ja=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(xa,``)}static parseTrackName(e){let t=Oa.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);ka.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){B(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){V(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){V(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){V(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){V(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){V(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;V(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ja.Composite=Aa,ja.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},ja.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},ja.prototype.GetterByBindingType=[ja.prototype._getValue_direct,ja.prototype._getValue_array,ja.prototype._getValue_arrayElement,ja.prototype._getValue_toArray],ja.prototype.SetterByBindingTypeAndVersioning=[[ja.prototype._setValue_direct,ja.prototype._setValue_direct_setNeedsUpdate,ja.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ja.prototype._setValue_array,ja.prototype._setValue_array_setNeedsUpdate,ja.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ja.prototype._setValue_arrayElement,ja.prototype._setValue_arrayElement_setNeedsUpdate,ja.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ja.prototype._setValue_fromArray,ja.prototype._setValue_fromArray_setNeedsUpdate,ja.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function Ma(e,t,n,r){let i=Na(r);switch(n){case le:return e*t;case me:return e*t/i.components*i.byteLength;case he:return e*t/i.components*i.byteLength;case ge:return e*t*2/i.components*i.byteLength;case _e:return e*t*2/i.components*i.byteLength;case ue:return e*t*3/i.components*i.byteLength;case de:return e*t*4/i.components*i.byteLength;case ve:return e*t*4/i.components*i.byteLength;case ye:case be:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case xe:case Se:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case we:case Ee:return Math.max(e,16)*Math.max(t,8)/4;case Ce:case Te:return Math.max(e,8)*Math.max(t,8)/2;case De:case Oe:case Ae:case je:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ke:case Me:case Ne:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case I:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Pe:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Fe:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Ie:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case L:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Le:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case R:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case z:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Re:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ze:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Be:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Ve:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case He:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ue:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case We:case Ge:case Ke:return Math.ceil(e/4)*Math.ceil(t/4)*16;case qe:case Je:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ye:case Xe:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Na(e){switch(e){case M:case ee:return{byteLength:1,components:1};case te:case N:case ie:return{byteLength:2,components:1};case ae:case oe:return{byteLength:2,components:4};case ne:case P:case re:return{byteLength:4,components:1};case ce:case F:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?B(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function Pa(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Fa(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Y={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},X={common:{diffuse:{value:new q(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new U(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new q(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new q(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new q(16777215)},opacity:{value:1},center:{value:new U(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},Ia={basic:{uniforms:ki([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.fog]),vertexShader:Y.meshbasic_vert,fragmentShader:Y.meshbasic_frag},lambert:{uniforms:ki([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new q(0)},envMapIntensity:{value:1}}]),vertexShader:Y.meshlambert_vert,fragmentShader:Y.meshlambert_frag},phong:{uniforms:ki([X.common,X.specularmap,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.fog,X.lights,{emissive:{value:new q(0)},specular:{value:new q(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Y.meshphong_vert,fragmentShader:Y.meshphong_frag},standard:{uniforms:ki([X.common,X.envmap,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.roughnessmap,X.metalnessmap,X.fog,X.lights,{emissive:{value:new q(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag},toon:{uniforms:ki([X.common,X.aomap,X.lightmap,X.emissivemap,X.bumpmap,X.normalmap,X.displacementmap,X.gradientmap,X.fog,X.lights,{emissive:{value:new q(0)}}]),vertexShader:Y.meshtoon_vert,fragmentShader:Y.meshtoon_frag},matcap:{uniforms:ki([X.common,X.bumpmap,X.normalmap,X.displacementmap,X.fog,{matcap:{value:null}}]),vertexShader:Y.meshmatcap_vert,fragmentShader:Y.meshmatcap_frag},points:{uniforms:ki([X.points,X.fog]),vertexShader:Y.points_vert,fragmentShader:Y.points_frag},dashed:{uniforms:ki([X.common,X.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Y.linedashed_vert,fragmentShader:Y.linedashed_frag},depth:{uniforms:ki([X.common,X.displacementmap]),vertexShader:Y.depth_vert,fragmentShader:Y.depth_frag},normal:{uniforms:ki([X.common,X.bumpmap,X.normalmap,X.displacementmap,{opacity:{value:1}}]),vertexShader:Y.meshnormal_vert,fragmentShader:Y.meshnormal_frag},sprite:{uniforms:ki([X.sprite,X.fog]),vertexShader:Y.sprite_vert,fragmentShader:Y.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Y.background_vert,fragmentShader:Y.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:Y.backgroundCube_vert,fragmentShader:Y.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Y.cube_vert,fragmentShader:Y.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Y.equirect_vert,fragmentShader:Y.equirect_frag},distance:{uniforms:ki([X.common,X.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Y.distance_vert,fragmentShader:Y.distance_frag},shadow:{uniforms:ki([X.lights,X.fog,{color:{value:new q(0)},opacity:{value:1}}]),vertexShader:Y.shadow_vert,fragmentShader:Y.shadow_frag}};Ia.physical={uniforms:ki([Ia.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new U(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new G},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new q(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new U},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new q(0)},specularColor:{value:new q(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new U},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:Y.meshphysical_vert,fragmentShader:Y.meshphysical_frag};var La={r:0,b:0,g:0},Ra=new nn,za=new G;za.set(-1,0,0,0,1,0,0,0,1);function Ba(e,t,n,r,i,a){let o=new q(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new ni(new Ei(1,1,1),new Ii({name:`BackgroundCubeMaterial`,uniforms:Oi(Ia.backgroundCube.uniforms),vertexShader:Ia.backgroundCube.vertexShader,fragmentShader:Ia.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ra.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(za),l.material.toneMapped=K.getTransfer(i.colorSpace)!==ct,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new ni(new Di(2,2),new Ii({name:`BackgroundMaterial`,uniforms:Oi(Ia.background.uniforms),vertexShader:Ia.background.vertexShader,fragmentShader:Ia.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=K.getTransfer(i.colorSpace)!==ct,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(La,Mi(e)),n.buffers.color.setClear(La.r,La.g,La.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Va(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Ha(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Ua(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(B(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&B(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&B(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Wa(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Ir,s=new G,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Ga=class extends $t{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new xi(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ei(5,5,5),i=new Ii({name:`CubemapFromEquirect`,uniforms:Oi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new ni(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=k),new va(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Ka=256,qa=3,Ja=20,Ya=256,Xa=16,Za=3,Qa=new W,$a=new q,eo=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new va(1,10,null),this._boxMesh=new ni(new Ei(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Qa}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor($a));let h=new va(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=so(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=oo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Ka,At(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Ka:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=to(e,!1,!1),n=Math.log2(e)-qa;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=to(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=so()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=oo()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=ro(),this._integrationMaterial=io());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/Xa);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Za)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(Ya*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=ao());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function to(e,t,n){return new Ga(e,{minFilter:j,generateMipmaps:t,type:ie,colorSpace:ot,depthBuffer:n})}function no(e,t,n){return new Ii({name:e,uniforms:t,vertexShader:Y.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function ro(){return no(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ya}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function io(){return no(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Xa}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function ao(){return no(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Ja}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function oo(){return no(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function so(){return no(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function co(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Ga(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new eo(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new eo(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function lo(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&bt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function uo(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?br:yr)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function fo(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function po(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:V(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function mo(e,t,n){let r=new WeakMap,i=new Zt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new en(h,p,m,u);g.type=re,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new U(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function ho(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var go={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function _o(e,t,n,r,i,a){let o=new $t(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new Mr;u.setAttribute(`position`,new J([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new J([0,2,0,0,2,0],2));let d=new Li({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new ni(u,d),p=new ma(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new $t(t,n,{type:ie,depthBuffer:!1,stencilBuffer:!1}),c=new $t(t,n,{type:ie,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Ci(t,n),a===!0&&(l.format=pe,l.type=se)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},K.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=go[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var vo=new Xt,yo=new Ci(1,1),bo=new wi(1),xo=new en,So=new tn,Co=new xi,wo=[],To=[],Eo=new Float32Array(16),Do=new Float32Array(9),Oo=new Float32Array(4);function ko(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=wo[i];if(a===void 0&&(a=new Float32Array(i),wo[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Ao(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function jo(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Mo(e,t){let n=To[t];n===void 0&&(n=new Int32Array(t),To[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function No(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Po(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ao(n,t))return;e.uniform2fv(this.addr,t),jo(n,t)}}function Fo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ao(n,t))return;e.uniform3fv(this.addr,t),jo(n,t)}}function Io(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ao(n,t))return;e.uniform4fv(this.addr,t),jo(n,t)}}function Lo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ao(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),jo(n,t)}else{if(Ao(n,r))return;Oo.set(r),e.uniformMatrix2fv(this.addr,!1,Oo),jo(n,r)}}function Ro(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ao(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),jo(n,t)}else{if(Ao(n,r))return;Do.set(r),e.uniformMatrix3fv(this.addr,!1,Do),jo(n,r)}}function zo(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ao(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),jo(n,t)}else{if(Ao(n,r))return;Eo.set(r),e.uniformMatrix4fv(this.addr,!1,Eo),jo(n,r)}}function Bo(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Vo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ao(n,t))return;e.uniform2iv(this.addr,t),jo(n,t)}}function Ho(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ao(n,t))return;e.uniform3iv(this.addr,t),jo(n,t)}}function Uo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ao(n,t))return;e.uniform4iv(this.addr,t),jo(n,t)}}function Wo(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Go(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ao(n,t))return;e.uniform2uiv(this.addr,t),jo(n,t)}}function Ko(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ao(n,t))return;e.uniform3uiv(this.addr,t),jo(n,t)}}function qo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ao(n,t))return;e.uniform4uiv(this.addr,t),jo(n,t)}}function Jo(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function Yo(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Jo(yo):vo,n.setTexture2D(t||a,i)}function Xo(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||So,i)}function Zo(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Jo(bo):Co,n.setTextureCube(t||a,i)}function Qo(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||xo,i)}function $o(e){switch(e){case 5126:return No;case 35664:return Po;case 35665:return Fo;case 35666:return Io;case 35674:return Lo;case 35675:return Ro;case 35676:return zo;case 5124:case 35670:return Bo;case 35667:case 35671:return Vo;case 35668:case 35672:return Ho;case 35669:case 35673:return Uo;case 5125:return Wo;case 36294:return Go;case 36295:return Ko;case 36296:return qo;case 35678:case 36198:case 36298:case 36306:case 35682:return Yo;case 35679:case 36299:case 36307:return Xo;case 35680:case 36300:case 36308:case 36293:return Zo;case 36289:case 36303:case 36311:case 36292:return Qo}}function es(e,t){e.uniform1fv(this.addr,t)}function ts(e,t){let n=ko(t,this.size,2);e.uniform2fv(this.addr,n)}function ns(e,t){let n=ko(t,this.size,3);e.uniform3fv(this.addr,n)}function rs(e,t){let n=ko(t,this.size,4);e.uniform4fv(this.addr,n)}function is(e,t){let n=ko(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function as(e,t){let n=ko(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function os(e,t){let n=ko(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ss(e,t){e.uniform1iv(this.addr,t)}function cs(e,t){e.uniform2iv(this.addr,t)}function ls(e,t){e.uniform3iv(this.addr,t)}function us(e,t){e.uniform4iv(this.addr,t)}function ds(e,t){e.uniform1uiv(this.addr,t)}function fs(e,t){e.uniform2uiv(this.addr,t)}function ps(e,t){e.uniform3uiv(this.addr,t)}function ms(e,t){e.uniform4uiv(this.addr,t)}function hs(e,t,n){let r=this.cache,i=t.length,a=Mo(n,i);Ao(r,a)||(e.uniform1iv(this.addr,a),jo(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Jo(yo):vo;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function gs(e,t,n){let r=this.cache,i=t.length,a=Mo(n,i);Ao(r,a)||(e.uniform1iv(this.addr,a),jo(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||So,a[e])}function _s(e,t,n){let r=this.cache,i=t.length,a=Mo(n,i);Ao(r,a)||(e.uniform1iv(this.addr,a),jo(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Jo(bo):Co;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function vs(e,t,n){let r=this.cache,i=t.length,a=Mo(n,i);Ao(r,a)||(e.uniform1iv(this.addr,a),jo(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||xo,a[e])}function ys(e){switch(e){case 5126:return es;case 35664:return ts;case 35665:return ns;case 35666:return rs;case 35674:return is;case 35675:return as;case 35676:return os;case 5124:case 35670:return ss;case 35667:case 35671:return cs;case 35668:case 35672:return ls;case 35669:case 35673:return us;case 5125:return ds;case 36294:return fs;case 36295:return ps;case 36296:return ms;case 35678:case 36198:case 36298:case 36306:case 35682:return hs;case 35679:case 36299:case 36307:return gs;case 35680:case 36300:case 36308:case 36293:return _s;case 36289:case 36303:case 36311:case 36292:return vs}}var bs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=$o(t.type)}},xs=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ys(t.type)}},Ss=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Cs=/(\w+)(\])?(\[|\.)?/g;function ws(e,t){e.seq.push(t),e.map[t.id]=t}function Ts(e,t,n){let r=e.name,i=r.length;for(Cs.lastIndex=0;;){let a=Cs.exec(r),o=Cs.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){ws(n,l===void 0?new bs(s,e,t):new xs(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ss(s),ws(n,e)),n=e}}}var Es=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ts(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Ds(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Os=37297,ks=0;function As(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var js=new G;function Ms(e){K._getMatrix(js,K.workingColorSpace,e);let t=`mat3( ${js.elements.map(e=>e.toFixed(4))} )`;switch(K.getTransfer(e)){case st:return[t,`LinearTransferOETF`];case ct:return[t,`sRGBTransferOETF`];default:return B(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ns(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+As(e.getShaderSource(t),r)}return i}function Ps(e,t){let n=Ms(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var Fs={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Is(e,t){let n=Fs[t];return n===void 0?(B(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Ls=new W;function Rs(){return K.getLuminanceCoefficients(Ls),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Ls.x.toFixed(4)}, ${Ls.y.toFixed(4)}, ${Ls.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function zs(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Hs).join(`
`)}function Bs(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Vs(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Hs(e){return e!==``}function Us(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Ws(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Gs=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ks(e){return e.replace(Gs,qs)}function qs(e,t){let n=Y[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return Ks(n)}var Js=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ys(e){return e.replace(Js,Xs)}function Xs(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Zs(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Qs={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function $s(e){return Qs[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var ec={302:`ENVMAP_MODE_REFRACTION`};function tc(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:ec[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var nc={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function rc(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:nc[e.combine]||`ENVMAP_BLENDING_NONE`}function ic(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=$s(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=tc(n),d=rc(n),f=zs(n),p=Bs(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Hs).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Hs).join(`
`),g.length>0&&(g+=`
`)):(h=[Zs(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Hs).join(`
`),g=[Zs(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Y.tonemapping_pars_fragment,n.toneMapping===0?``:Is(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Y.colorspace_pars_fragment,Ps(`linearToOutputTexel`,n.outputColorSpace),Rs(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Hs).join(`
`)),o=Ks(o),o=Us(o,n),o=Ws(o,n),s=Ks(s),s=Us(s,n),s=Ws(s,n),o=Ys(o),s=Ys(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Ds(i,i.VERTEX_SHADER,v),x=Ds(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=Ns(i,b,`vertex`),n=Ns(i,x,`fragment`);V(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):B(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new Es(i,m),w=Vs(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,Os)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=ks++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var ac=0,oc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new sc(e),t.set(e,n)),n}},sc=class{constructor(e){this.id=ac++,this.code=e,this.usedTimes=0}};function cc(e){return e===1030||e===37490||e===36285}function lc(e,t,n,r,i,a){let o=new mn,s=new oc,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&B(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=Ia[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),M=m.isInstancedMesh===!0,ee=m.isBatchedMesh===!0,N=!!i.map,te=!!i.matcap,P=!!b,ne=P&&b.isPMREMTexture===!0,re=!!i.aoMap,ie=!!i.lightMap,ae=!!i.bumpMap&&i.wireframe===!1,oe=!!i.normalMap,se=!!i.displacementMap,ce=!!i.emissiveMap,F=!!i.metalnessMap,le=!!i.roughnessMap,ue=i.anisotropy>0,de=i.clearcoat>0,fe=i.diffuseRoughness>0,pe=i.dispersion>0,me=i.retroreflectivity>0,he=i.iridescence>0,ge=i.sheen>0,_e=i.transmission>0,ve=ue&&!!i.anisotropyMap,ye=de&&!!i.clearcoatMap,be=de&&!!i.clearcoatNormalMap,xe=de&&!!i.clearcoatRoughnessMap,Se=fe&&!!i.diffuseRoughnessMap,Ce=he&&!!i.iridescenceMap,we=he&&!!i.iridescenceThicknessMap,Te=ge&&!!i.sheenColorMap,Ee=ge&&!!i.sheenRoughnessMap,De=!!i.specularMap,Oe=!!i.specularColorMap,ke=!!i.specularIntensityMap,Ae=_e&&!!i.transmissionMap,je=_e&&!!i.thicknessMap,Me=!!i.gradientMap,Ne=!!i.alphaMap,I=i.alphaTest>0,Pe=!!i.alphaHash,Fe=!!i.extensions,Ie=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let L=ne?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Le={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:ee,batchingColor:ee&&m._colorsTexture!==null,instancing:M,instancingColor:M&&m.instanceColor!==null,instancingMorph:M&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:K.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:N,matcap:te,envMap:P,envMapMode:P&&b.mapping,envMapPMREM:ne,envMapMaxLod:ne?L.length-1:null,envMapSize:ne?L[0].width:null,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:se,emissiveMap:ce,normalMapObjectSpace:oe&&i.normalMapType===1,normalMapTangentSpace:oe&&i.normalMapType===0,packedNormalMap:oe&&i.normalMapType===0&&cc(i.normalMap.format),metalnessMap:F,roughnessMap:le,anisotropy:ue,anisotropyMap:ve,clearcoat:de,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:xe,diffuseRoughness:fe,diffuseRoughnessMap:Se,dispersion:pe,retroreflection:me,iridescence:he,iridescenceMap:Ce,iridescenceThicknessMap:we,sheen:ge,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:Oe,specularIntensityMap:ke,transmission:_e,transmissionMap:Ae,thicknessMap:je,gradientMap:Me,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ne,alphaTest:I,alphaHash:Pe,combine:i.combine,mapUv:N&&p(i.map.channel),aoMapUv:re&&p(i.aoMap.channel),lightMapUv:ie&&p(i.lightMap.channel),bumpMapUv:ae&&p(i.bumpMap.channel),normalMapUv:oe&&p(i.normalMap.channel),displacementMapUv:se&&p(i.displacementMap.channel),emissiveMapUv:ce&&p(i.emissiveMap.channel),metalnessMapUv:F&&p(i.metalnessMap.channel),roughnessMapUv:le&&p(i.roughnessMap.channel),anisotropyMapUv:ve&&p(i.anisotropyMap.channel),clearcoatMapUv:ye&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:be&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Se&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:Ce&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:we&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&p(i.sheenRoughnessMap.channel),specularMapUv:De&&p(i.specularMap.channel),specularColorMapUv:Oe&&p(i.specularColorMap.channel),specularIntensityMapUv:ke&&p(i.specularIntensityMap.channel),transmissionMapUv:Ae&&p(i.transmissionMap.channel),thicknessMapUv:je&&p(i.thicknessMap.channel),alphaMapUv:Ne&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(oe||ue),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(N||Ne),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&oe===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:N&&i.map.isVideoTexture===!0&&K.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&i.emissiveMap.isVideoTexture===!0&&K.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Fe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&i.extensions.multiDraw===!0||ee)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Le.vertexUv1s=c.has(1),Le.vertexUv2s=c.has(2),Le.vertexUv3s=c.has(3),c.clear(),Le}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=Ia[t];n=Ni.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new ic(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function uc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function dc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function fc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function pc(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||dc),r.length>1&&r.sort(t||fc),i.length>1&&i.sort(t||fc)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function mc(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new pc,e.set(t,[i])):n>=r.length?(i=new pc,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function hc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new W,color:new q};break;case`SpotLight`:n={position:new W,direction:new W,color:new q,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new W,color:new q,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new W,skyColor:new q,groundColor:new q};break;case`RectAreaLight`:n={color:new q,position:new W,halfWidth:new W,halfHeight:new W}}return e[t.id]=n,n}}}function gc(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var _c=0;function vc(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function yc(e){let t=new hc,n=gc(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new W);let i=new W,a=new nn,o=new nn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(vc);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=X.LTC_FLOAT_1,r.rectAreaLTC2=X.LTC_FLOAT_2):(r.rectAreaLTC1=X.LTC_HALF_1,r.rectAreaLTC2=X.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=_c++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function bc(e){let t=new yc(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function xc(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new bc(e),t.set(n,[a])):r>=i.length?(a=new bc(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Sc=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Cc=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,wc=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],Tc=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],Ec=new nn,Dc=new W,Oc=new W;function kc(e,t,n){let r=new vi,i=new U,a=new U,o=new Zt,s=new Ri,c=new zi,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Ii({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new U},radius:{value:4}},vertexShader:Sc,fragmentShader:Cc}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Mr;m.setAttribute(`position`,new vr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new ni(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(B(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){B(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){B(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new $t(i.x,i.y,{format:ge,type:ie,minFilter:k,magFilter:k,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Ci(i.x,i.y,re),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=fe,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=E,d.map.depthTexture.magFilter=E}else l.isPointLight?(d.map=new Ga(i.x),d.map.depthTexture=new wi(i.x,ne)):(d.map=new $t(i.x,i.y),d.map.depthTexture=new Ci(i.x,i.y,ne)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=fe,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=k,d.map.depthTexture.magFilter=k):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=E,d.map.depthTexture.magFilter=E);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Dc.setFromMatrixPosition(l.matrixWorld),e.position.copy(Dc),Oc.copy(e.position),Oc.add(wc[t]),e.up.copy(Tc[t]),e.lookAt(Oc),e.updateMatrixWorld(),n.makeTranslation(-Dc.x,-Dc.y,-Dc.z),Ec.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Ec,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new $t(i.x,i.y,{format:ge,type:ie}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Ac(e,t){function n(){let t=!1,n=new Zt,r=null,i=new Zt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?F(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=St[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?F(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new q(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ee=!1,N=0,te=e.getParameter(e.VERSION);te.indexOf(`WebGL`)===-1?te.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),ee=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(te)[1]),ee=N>=1);let P=null,ne={},re=e.getParameter(e.SCISSOR_BOX),ie=e.getParameter(e.VIEWPORT),ae=new Zt().fromArray(re),oe=new Zt().fromArray(ie);function se(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ce={};ce[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),F(e.DEPTH_TEST),o.setFunc(3),_e(!1),ve(1),F(e.CULL_FACE),he(0);function F(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function le(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ue(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function de(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function fe(t){return h!==t&&(e.useProgram(t),h=t,!0)}let pe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};pe[103]=e.MIN,pe[104]=e.MAX;let me={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function he(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(le(e.BLEND),g=!1);else if(g===!1&&(F(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:V(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:V(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:V(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:V(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(pe[n],pe[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(me[r],me[i],me[o],me[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ge(t,n){t.side===2?le(e.CULL_FACE):F(e.CULL_FACE);let r=t.side===1;n&&(r=!r),_e(r),t.blending===1&&t.transparent===!1?he(0):he(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),be(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?F(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function _e(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ve(t){t===0?le(e.CULL_FACE):(F(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function ye(t){t!==k&&(ee&&e.lineWidth(t),k=t)}function be(t,n,r){t?(F(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):le(e.POLYGON_OFFSET_FILL)}function xe(t){t?F(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function Se(t){t===void 0&&(t=e.TEXTURE0+M-1),P!==t&&(e.activeTexture(t),P=t)}function Ce(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+M-1:P);let i=ne[r];i===void 0&&(i={type:void 0,texture:void 0},ne[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||ce[t]),i.type=t,i.texture=n)}function we(){let t=ne[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Te(){try{e.compressedTexImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ee(){try{e.compressedTexImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function De(){try{e.texSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Oe(){try{e.texSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function je(){try{e.texStorage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Me(){try{e.texStorage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ne(){try{e.texImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function I(){try{e.texImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Pe(t){return d[t]===void 0?e.getParameter(t):d[t]}function Fe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Ie(t){ae.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ae.copy(t))}function L(t){oe.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),oe.copy(t))}function Le(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function R(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function z(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},P=null,ne={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new q(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ae.set(0,0,e.canvas.width,e.canvas.height),oe.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:F,disable:le,bindFramebuffer:ue,drawBuffers:de,useProgram:fe,setBlending:he,setMaterial:ge,setFlipSided:_e,setCullFace:ve,setLineWidth:ye,setPolygonOffset:be,setScissorTest:xe,activeTexture:Se,bindTexture:Ce,unbindTexture:we,compressedTexImage2D:Te,compressedTexImage3D:Ee,texImage2D:Ne,texImage3D:I,pixelStorei:Fe,getParameter:Pe,updateUBOMapping:Le,uniformBlockBinding:R,texStorage2D:je,texStorage3D:Me,texSubImage2D:De,texSubImage3D:Oe,compressedTexSubImage2D:ke,compressedTexSubImage3D:Ae,scissor:Ie,viewport:L,reset:z}}function jc(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new U,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):ht(`canvas`)}function v(e,t,n){let r=1,i=z(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),B(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&B(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];B(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||B(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?st:K.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function M(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,B(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function ee(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function N(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function te(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function P(e){re(e.target)}function ne(e){ie(e.target)}function re(e){e.removeEventListener(`dispose`,P),te(e),oe(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function ie(e){e.removeEventListener(`dispose`,ne),te(e),ce(e)}function ae(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?ie(t):re(t))}m.clear(),d.clear()}function oe(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&se(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function se(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function ce(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&re(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let F=0;function le(){F=0}function ue(){return F}function de(e){F=e}function fe(){let e=F;return e>=i.maxTextures&&B(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),F+=1,e}function me(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function he(t,i){let a=r.get(t);if(t.isVideoTexture&&Le(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)B(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)B(`WebGLRenderer: Texture marked for update but image is incomplete`);else{Ee(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ge(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?Ee(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function _e(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?Ee(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ve(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?De(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ye={[C]:e.REPEAT,[w]:e.CLAMP_TO_EDGE,[T]:e.MIRRORED_REPEAT},be={[E]:e.NEAREST,[D]:e.NEAREST_MIPMAP_NEAREST,[O]:e.NEAREST_MIPMAP_LINEAR,[k]:e.LINEAR,[A]:e.LINEAR_MIPMAP_NEAREST,[j]:e.LINEAR_MIPMAP_LINEAR},xe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function Se(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&B(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ye[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ye[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ye[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,be[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,be[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,xe[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function Ce(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,P),N(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=me(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&se(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function we(e,t,n){return Math.floor(Math.floor(e/n)/t)}function Te(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=we(n.start,r.width,4),c=we(t.start,r.width,4);n.start<=i+1&&a===c&&we(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function Ee(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=Ce(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=K.getPrimaries(K.workingColorSpace),r=o.colorSpace===``?null:K.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=R(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);Se(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,C=u.dataReady,w=ee(o,t);if(o.isDepthTexture)m=M(o.format===pe,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,w,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?C&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,w,m,t.width,t.height),C&&Te(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,w,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(C){if(o.layerUpdates.size>0){let t=Ma(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?C&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,w,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?C&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?C&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,w,m,t.width,t.height,t.depth),C){if(o.layerUpdates.size>0){let i=Ma(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,w,m,t.width,t.height,t.depth),C&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,w,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<w;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=z(g[0]);n.texStorage2D(e.TEXTURE_2D,w,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?C&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=z(t);n.texStorage2D(e.TEXTURE_2D,w,m,r.width,r.height)}C&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function De(t,o,s){if(o.image.length!==6)return;let c=Ce(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=K.getPrimaries(K.workingColorSpace),r=o.colorSpace===``?null:K.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=R(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),C=o.isVideoTexture!==!0,w=u.__version===void 0||c===!0,T=l.dataReady,E=ee(o,h);Se(e.TEXTURE_CUBE_MAP,o);let D;if(o.isDepthTexture){if(x=M(o.format===pe,o.type),w){if(C)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){C&&w&&n.texStorage2D(e.TEXTURE_CUBE_MAP,E,x,h.width,h.height);for(let t=0;t<6;t++){D=m[t].mipmaps;for(let r=0;r<D.length;r++){let i=D[r];o.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(D=o.mipmaps,C&&w){D.length>0&&E++;let t=z(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,E,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<D.length;r++){let i=D[r].image[t].image;C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<D.length;r++){let i=D[r];C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function Oe(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),L(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,Ie(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ke(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=M(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;L(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ie(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ie(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);L(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ie(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ie(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ae(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?ve(i.depthTexture,0):he(i.depthTexture,0);let u=c.__webglTexture,d=Ie(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)L(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)L(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function je(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)Ae(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Ae(i.__webglFramebuffer[0],t,0):Ae(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),ke(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),ke(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Me(t,n,i){let a=r.get(t);n!==void 0&&Oe(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&je(t)}function Ne(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,ne),N(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&L(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=Ie(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),ke(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),Se(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)Oe(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else Oe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),Se(c,a),Oe(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),Se(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)Oe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else Oe(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&je(t)}function I(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let Pe=[];function Fe(t){if(t.samples>0){if(L(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(Pe.length=0,Pe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Pe.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Pe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Ie(e){return Math.min(i.maxSamples,e.samples)}function L(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Le(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function R(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(K.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&B(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):V(`WebGLTextures: Unsupported texture color space:`,n)),t}function z(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=fe,this.resetTextureUnits=le,this.getTextureUnits=ue,this.setTextureUnits=de,this.setTexture2D=he,this.setTexture2DArray=ge,this.setTexture3D=_e,this.setTextureCube=ve,this.rebindTextures=Me,this.setupRenderTarget=Ne,this.updateRenderTargetMipmap=I,this.updateMultisampleRenderTarget=Fe,this.setupDepthRenderbuffer=je,this.setupFrameBufferTexture=Oe,this.useMultisampledRTT=L,this.dispose=ae}function Mc(e,t){function n(n,r=``){let i,a=K.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Nc=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Pc=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Fc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ti(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ii({vertexShader:Nc,fragmentShader:Pc,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ni(new Di(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ic=class extends Ct{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Fc,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new U,C=null,w=null,T=new pa;T.viewport=new Zt;let E=new pa;E.viewport=new Zt;let D=[T,E],O=new ya,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Nn,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Nn,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Nn,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ae.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,N),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?pe:fe,a=_.stencil?se:ne);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new $t(d.textureWidth,d.textureHeight,{format:de,type:M,depthTexture:new Ci(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new $t(f.framebufferWidth,f.framebufferHeight,{format:de,type:M,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ae.setContext(r),ae.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;te(O,i);for(let e=0;e<a.length;e++)te(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),P(e,O,i)};function P(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Et*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let re=null;function ie(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new pa,o.layers.enable(n),o.viewport=new Zt,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Ti,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}re&&re(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ae=new Pa;ae.setAnimationLoop(ie),this.setAnimationLoop=function(e){re=e},this.dispose=function(){}}},Lc=new nn,Rc=new G;Rc.set(-1,0,0,0,1,0,0,0,1);function zc(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Mi(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Lc.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Rc),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Bc(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?B(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):B(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var Vc=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Hc=null;function Uc(){return Hc===null&&(Hc=new ai(Vc,16,16,ge,ie),Hc.name=`DFG_LUT`,Hc.minFilter=k,Hc.magFilter=k,Hc.wrapS=w,Hc.wrapT=w,Hc.generateMipmaps=!1,Hc.needsUpdate=!0),Hc}var Wc=class{constructor(e={}){let{canvas:t=gt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=M}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([ve,_e,he]),g=new Set([M,ne,te,se,ae,oe]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=at;let ee=0,N=0,P=null,re=-1,ce=null,F=new Zt,le=new Zt,ue=null,de=new q(0),fe=0,pe=t.width,me=t.height,ge=1,ye=null,be=null,xe=new Zt(0,0,pe,me),Se=new Zt(0,0,pe,me),Ce=!1,we=new vi,Te=new bi,Ee=!1,De=!1,Oe=new nn,ke=new W,Ae=new Zt,je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Me=!1;function Ne(){return P===null?ge:1}let I=n;function Pe(e,n){return t.getContext(e,n)}let Fe,Ie,L,Le,R,z,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,rt,!1),t.addEventListener(`webglcontextrestored`,it,!1),t.addEventListener(`webglcontextcreationerror`,ot,!1),I===null){let t=`webgl2`;if(I=Pe(t,e),I===null)throw Pe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}tt()}catch(e){throw t.removeEventListener(`webglcontextlost`,rt,!1),t.removeEventListener(`webglcontextrestored`,it,!1),t.removeEventListener(`webglcontextcreationerror`,ot,!1),V(`WebGLRenderer: `+e.message),e}function tt(){Fe=new lo(I),Fe.init(),Qe=new Mc(I,Fe),Ie=new Ua(I,Fe,e,Qe),L=new Ac(I,Fe),Ie.reversedDepthBuffer&&d&&L.buffers.depth.setReversed(!0),O=I.createFramebuffer(),k=I.createFramebuffer(),A=I.createFramebuffer(),Le=new po(I),R=new uc,z=new jc(I,Fe,L,R,Ie,Qe,Le),Re=new co(T),ze=new Fa(I),$e=new Va(I,ze),Be=new uo(I,ze,Le,$e),Ve=new ho(I,Be,ze,$e,Le),Ye=new mo(I,Ie,z),Ke=new Wa(R),He=new lc(T,Re,Fe,Ie,$e,Ke),Ue=new zc(T,R),We=new mc,Ge=new xc(Fe),Je=new Ba(T,Re,L,Ve,p,s),qe=new kc(T,Ve,Ie),et=new Bc(I,Le,Ie,L),Xe=new Ha(I,Fe,Le),Ze=new fo(I,Fe,Le),Le.programs=He.programs,T.capabilities=Ie,T.extensions=Fe,T.properties=R,T.renderLists=We,T.shadowMap=qe,T.state=L,T.info=Le}m!==1009&&(w=new _o(m,t.width,t.height,o,r,i));let nt=new Ic(T,I);this.xr=nt,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let e=Fe.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Fe.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ge},this.setPixelRatio=function(e){e!==void 0&&(ge=e,this.setSize(pe,me,!1))},this.getSize=function(e){return e.set(pe,me)},this.setSize=function(e,n,r=!0){nt.isPresenting?B(`WebGLRenderer: Can't change size while VR device is presenting.`):(pe=e,me=n,t.width=Math.floor(e*ge),t.height=Math.floor(n*ge),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(pe*ge,me*ge).floor()},this.setDrawingBufferSize=function(e,n,r){pe=e,me=n,ge=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)V(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){B(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(F)},this.getViewport=function(e){return e.copy(xe)},this.setViewport=function(e,t,n,r){e.isVector4?xe.set(e.x,e.y,e.z,e.w):xe.set(e,t,n,r),L.viewport(F.copy(xe).multiplyScalar(Ne()).round())},this.getScissor=function(e){return e.copy(Se)},this.setScissor=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),L.scissor(le.copy(Se).multiplyScalar(Ne()).round())},this.getScissorTest=function(){return Ce},this.setScissorTest=function(e){L.setScissorTest(Ce=e)},this.setOpaqueSort=function(e){ye=e},this.setTransparentSort=function(e){be=e},this.getClearColor=function(e){return e.copy(Je.getClearColor())},this.setClearColor=function(){Je.setClearColor(...arguments)},this.getClearAlpha=function(){return Je.getClearAlpha()},this.setClearAlpha=function(){Je.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(P!==null){let t=P.texture.format;e=h.has(t)}if(e){let e=P.texture.type,t=g.has(e),n=Je.getClearColor(),r=Je.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,I.clearBufferuiv(I.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,I.clearBufferiv(I.COLOR,0,v))}else r|=I.COLOR_BUFFER_BIT}t&&(r|=I.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&I.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,rt,!1),t.removeEventListener(`webglcontextrestored`,it,!1),t.removeEventListener(`webglcontextcreationerror`,ot,!1),Je.dispose(),We.dispose(),Ge.dispose(),z.dispose(),R.dispose(),Re.dispose(),Ve.dispose(),Be.dispose(),$e.dispose(),et.dispose(),He.dispose(),nt.dispose(),nt.removeEventListener(`sessionstart`,mt),nt.removeEventListener(`sessionend`,ht),_t.stop()};function rt(e){e.preventDefault(),vt(`WebGLRenderer: Context Lost.`),E=!0}function it(){vt(`WebGLRenderer: Context Restored.`),E=!1;let e=Le.autoReset,t=qe.enabled,n=qe.autoUpdate,r=qe.needsUpdate,i=qe.type;tt(),Le.autoReset=e,qe.enabled=t,qe.autoUpdate=n,qe.needsUpdate=r,qe.type=i}function ot(e){V(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function st(e){let t=e.target;t.removeEventListener(`dispose`,st),ct(t)}function ct(e){lt(e),R.remove(e)}function lt(e){let t=R.get(e).programs;t!==void 0&&(t.forEach(function(e){He.releaseProgram(e)}),e.isShaderMaterial&&He.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=je);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=kt(e,t,n,r,i);L.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Be.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;$e.setup(i,r,s,n,c);let h,g=Xe;if(c!==null&&(h=ze.get(c),g=Ze,g.setIndex(h)),i.isMesh)r.wireframe===!0?(L.setLineWidth(r.wireframeLinewidth*Ne()),g.setMode(I.LINES)):g.setMode(I.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),L.setLineWidth(e*Ne()),i.isLineSegments?g.setMode(I.LINES):i.isLineLoop?g.setMode(I.LINE_LOOP):g.setMode(I.LINE_STRIP)}else i.isPoints?g.setMode(I.POINTS):i.isSprite&&g.setMode(I.TRIANGLES);if(i.isBatchedMesh){if(Fe.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ze.get(c).bytesPerElement:1,o=R.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(I,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ut(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),Ee===!0&&Ke.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Et(e,t,r),e.side=0,e.needsUpdate=!0,Et(e,t,r),e.side=2):Et(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Ge.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),De=this.localClippingEnabled,Ee=Ke.init(this.clippingPlanes,De),Ee===!0&&Ke.setGlobalState(this.clippingPlanes,t),D!==null&&qe.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ut(o,n,t,e),r.add(o)}else ut(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=R.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Fe.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let dt=null;function pt(e){dt&&dt(e)}function mt(){_t.stop()}function ht(){_t.start()}let _t=new Pa;_t.setAnimationLoop(pt),typeof self<`u`&&_t.setContext(self),this.setAnimationLoop=function(e){dt=e,nt.setAnimationLoop(e),e===null?_t.stop():_t.start()},nt.addEventListener(`sessionstart`,mt),nt.addEventListener(`sessionend`,ht),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){V(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=nt.enabled===!0&&nt.isPresenting===!0,r=w!==null&&(P===null||n)&&w.begin(T,P);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),nt.enabled===!0&&nt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(nt.cameraAutoUpdate===!0&&nt.updateCamera(t),t=nt.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,P),x=Ge.get(e,C.length),x.init(t),x.state.textureUnits=z.getTextureUnits(),C.push(x),Oe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?Te.setFromArrayCamera(t):we.setFromProjectionMatrix(Oe,ft,t.reversedDepth),De=this.localClippingEnabled,Ee=Ke.init(this.clippingPlanes,De),b=We.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,nt.enabled===!0&&nt.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&yt(e,t,-1/0,T.sortObjects)}yt(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(ye,be),Me=nt.enabled===!1||nt.isPresenting===!1||nt.hasDepthSensing()===!1,Me&&Je.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),Ee===!0&&Ke.beginShadows();let i=x.state.shadowsArray;if(qe.render(i,e,t),Ee===!0&&Ke.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];St(n,r,e,a)}Me&&Je.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];bt(b,e,n,n.viewport)}}else r.length>0&&St(n,r,e,t),Me&&Je.render(e),bt(b,e,t)}P!==null&&N===0&&(z.updateMultisampleRenderTarget(P),z.updateRenderTargetMipmap(P)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),$e.resetDefaultState(),re=-1,ce=null,C.pop(),C.length>0?(x=C[C.length-1],z.setTextureUnits(x.state.textureUnits),Ee===!0&&Ke.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function yt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?Te:we;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Ae.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Oe);let i=Ve.update(e),a=e.material;a.visible&&b.push(e,i,a,n,Ae.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?Te:we;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Ve.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Ae.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Ae.copy(e.boundingSphere.center)),Ae.applyMatrix4(e.matrixWorld).applyMatrix4(Oe)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,Ae.z,s,t)}}else a.visible&&b.push(e,i,a,n,Ae.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)yt(i[e],t,n,r)}function bt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),Ee===!0&&Ke.setGlobalState(T.clippingPlanes,n),r&&L.viewport(F.copy(r)),i.length>0&&Ct(i,t,n),a.length>0&&Ct(a,t,n),o.length>0&&Ct(o,t,n),L.buffers.depth.setTest(!0),L.buffers.depth.setMask(!0),L.buffers.color.setMask(!0),L.setPolygonOffset(!1)}function St(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=Fe.has(`EXT_color_buffer_half_float`)||Fe.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new $t(1,1,{generateMipmaps:!0,type:e?ie:M,minFilter:j,samples:Math.max(4,Ie.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:K.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||F;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(de),fe=T.getClearAlpha(),fe<1&&T.setClearColor(16777215,.5),T.clear(),Me&&Je.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),Ee===!0&&Ke.setGlobalState(T.clippingPlanes,r),Ct(e,n,r),z.updateMultisampleRenderTarget(a),z.updateRenderTargetMipmap(a),Fe.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,wt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(z.updateMultisampleRenderTarget(a),z.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(de,fe),d!==void 0&&(r.viewport=d),T.toneMapping=u}function Ct(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&wt(o,t,n,s,l,c)}}function wt(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function Tt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Et(e,t,n){t.isScene!==!0&&(t=je);let r=R.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=He.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=He.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Re.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,st),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Ot(e,s),d}else s.uniforms=He.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=He.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ke.uniform),Ot(e,s),r.needsLights=jt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=Tt(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Dt(e,t,n,r,i){let a=R.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Et(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function H(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Es.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Ot(e,t){let n=R.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function kt(e,t,n,r,i){t.isScene!==!0&&(t=je),z.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=P===null?T.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:K.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Re.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=R.get(r),b=x.state.lights;if(Ee===!0&&(De===!0||e!==ce)){let t=e===ce&&r.id===re;Ke.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ke.numPlanes||v.numIntersection!==Ke.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===Tt(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?Dt(r,t,i,s,h):Et(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(L.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==re&&(re=r.id,O=!0),E||ce!==e){L.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(I,`projectionMatrix`,e.projectionMatrix),A.setValue(I,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(I,ke.setFromMatrixPosition(e.matrixWorld)),Ie.logarithmicDepthBuffer&&A.setValue(I,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(I,`isOrthographic`,e.isOrthographicCamera===!0),ce!==e&&(ce=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(I,`sunShadowMap`,b.state.sunShadowMap,z),b.state.directionalShadowMap.length>0&&A.setValue(I,`directionalShadowMap`,b.state.directionalShadowMap,z),b.state.spotShadowMap.length>0&&A.setValue(I,`spotShadowMap`,b.state.spotShadowMap,z),b.state.pointShadowMap.length>0&&A.setValue(I,`pointShadowMap`,b.state.pointShadowMap,z)),i.isSkinnedMesh){A.setOptional(I,i,`bindMatrix`),A.setOptional(I,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(I,`boneTexture`,e.boneTexture,z))}i.isBatchedMesh&&(A.setOptional(I,i,`batchingTexture`),A.setValue(I,`batchingTexture`,i._matricesTexture,z),A.setOptional(I,i,`batchingIdTexture`),A.setValue(I,`batchingIdTexture`,i._indirectTexture,z),A.setOptional(I,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(I,`batchingColorTexture`,i._colorsTexture,z));let M=n.morphAttributes;if((M.position!==void 0||M.normal!==void 0||M.color!==void 0)&&Ye.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(I,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=Uc()),O){if(A.setValue(I,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&At(j,k),a&&r.fog===!0&&Ue.refreshFogUniforms(j,a),Ue.refreshMaterialUniforms(j,r,ge,me,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}Es.upload(I,H(v),j,z)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Es.upload(I,H(v),j,z),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(I,`center`,i.center),A.setValue(I,`modelViewMatrix`,i.modelViewMatrix),A.setValue(I,`normalMatrix`,i.normalMatrix),A.setValue(I,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];et.update(n,w),et.bind(n,w)}}return w}function At(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function jt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return ee},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(e,t,n){let r=R.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),R.get(e.texture).__webglTexture=t,R.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=R.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){P=e,ee=t,N=n;let r=null,i=!1,a=!1;if(e){let o=R.get(e);if(o.__useDefaultFramebuffer!==void 0){L.bindFramebuffer(I.FRAMEBUFFER,o.__webglFramebuffer),F.copy(e.viewport),le.copy(e.scissor),ue=e.scissorTest,L.viewport(F),L.scissor(le),L.setScissorTest(ue),re=-1;return}if(o.__webglFramebuffer===void 0)z.setupRenderTarget(e);else if(o.__hasExternalTextures)z.rebindTextures(e,R.get(e.texture).__webglTexture,R.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&R.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);z.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=R.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&z.useMultisampledRTT(e)===!1?R.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,F.copy(e.viewport),le.copy(e.scissor),ue=e.scissorTest}else F.copy(xe).multiplyScalar(ge).floor(),le.copy(Se).multiplyScalar(ge).floor(),ue=Ce;if(n!==0&&(r=O),L.bindFramebuffer(I.FRAMEBUFFER,r)&&L.drawBuffers(e,r),L.viewport(F),L.scissor(le),L.setScissorTest(ue),i){let r=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=R.get(e.textures[t]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,t.__webglTexture,n)}re=-1};function Mt(e){let t=R.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Ie.textureFormatReadable(e.format),t.__typeReadable=Ie.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){L.bindFramebuffer(I.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s);let u=Mt(o);if(u.__formatReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&I.readPixels(t,n,r,i,Qe.convert(c),Qe.convert(l),a)}finally{let e=P===null?null:R.get(P).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){L.bindFramebuffer(I.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s);let d=Mt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,f),I.bufferData(I.PIXEL_PACK_BUFFER,a.byteLength,I.STREAM_READ),I.readPixels(t,n,r,i,Qe.convert(l),Qe.convert(u),0),I.bindBuffer(I.PIXEL_PACK_BUFFER,null);let p=P===null?null:R.get(P).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,p);let m=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await xt(I,m,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,f),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,a),I.bindBuffer(I.PIXEL_PACK_BUFFER,null),I.deleteBuffer(f),I.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;z.setTexture2D(e,0),I.copyTexSubImage2D(I.TEXTURE_2D,n,0,0,o,s,i,a),L.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Qe.convert(t.format),_=Qe.convert(t.type),v;t.isData3DTexture?(z.setTexture3D(t,0),v=I.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(z.setTexture2DArray(t,0),v=I.TEXTURE_2D_ARRAY):(z.setTexture2D(t,0),v=I.TEXTURE_2D),L.activeTexture(I.TEXTURE0),L.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,t.flipY),L.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),L.pixelStorei(I.UNPACK_ALIGNMENT,t.unpackAlignment);let y=L.getParameter(I.UNPACK_ROW_LENGTH),b=L.getParameter(I.UNPACK_IMAGE_HEIGHT),x=L.getParameter(I.UNPACK_SKIP_PIXELS),S=L.getParameter(I.UNPACK_SKIP_ROWS),C=L.getParameter(I.UNPACK_SKIP_IMAGES);L.pixelStorei(I.UNPACK_ROW_LENGTH,h.width),L.pixelStorei(I.UNPACK_IMAGE_HEIGHT,h.height),L.pixelStorei(I.UNPACK_SKIP_PIXELS,l),L.pixelStorei(I.UNPACK_SKIP_ROWS,u),L.pixelStorei(I.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=R.get(e),r=R.get(t),h=R.get(n.__renderTarget),g=R.get(r.__renderTarget);L.bindFramebuffer(I.READ_FRAMEBUFFER,h.__webglFramebuffer),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(e).__webglTexture,i,d+n),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(t).__webglTexture,a,m+n)),I.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,I.DEPTH_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||R.has(e)){let n=R.get(e),r=R.get(t);L.bindFramebuffer(I.READ_FRAMEBUFFER,k),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,n.__webglTexture,i),T?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,r.__webglTexture,a),i===0?T?I.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):I.copyTexSubImage2D(v,a,f,p,l,u,o,s):I.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,I.COLOR_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?I.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h);L.pixelStorei(I.UNPACK_ROW_LENGTH,y),L.pixelStorei(I.UNPACK_IMAGE_HEIGHT,b),L.pixelStorei(I.UNPACK_SKIP_PIXELS,x),L.pixelStorei(I.UNPACK_SKIP_ROWS,S),L.pixelStorei(I.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&I.generateMipmap(v),L.unbindTexture()},this.initRenderTarget=function(e){R.get(e).__webglFramebuffer===void 0&&z.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?z.setTextureCube(e,0):e.isData3DTexture?z.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?z.setTexture2DArray(e,0):z.setTexture2D(e,0),L.unbindTexture()},this.resetState=function(){ee=0,N=0,P=null,L.reset(),$e.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return ft}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=K._getDrawingBufferColorSpace(e),t.unpackColorSpace=K._getUnpackColorSpace()}},Gc={version:1,game:{internalWidth:640,internalHeight:360,worldTile:16,defaultLanguage:`en`,assetRoot:`assets`},styleFamilies:{gothicvania:{description:`Cemetery, Church and Swamp. One artist, 16x16 tiles, 1x pixel density, dark gothic palette with local biome ramp shifts.`,nativeScale:1,tileSize:16},dungeon:{description:`ThePixelist castle dungeon. 16px platform strip and composite 32px masonry chunks, desaturated charcoal palette.`,nativeScale:1,tileSize:16},fantasyForest:{description:`KilluaKage Fantasy Forest. 16x16 grid, muted teal/green palette, dark ambient. Isolated by portal fade.`,nativeScale:1,tileSize:16}},atlases:{gothic:[`cemetery`,`church`,`swamp`],dungeon:[`dungeon`],forest:[`fantasyForest`]},sprites:JSON.parse(`{"kael":{"atlas":"gothic","facing":"right","animations":{"idle":{"images":["assets/swamp/Sprites/Player/idle/idle1.png","assets/swamp/Sprites/Player/idle/idle2.png","assets/swamp/Sprites/Player/idle/idle3.png","assets/swamp/Sprites/Player/idle/idle4.png","assets/swamp/Sprites/Player/idle/idle5.png","assets/swamp/Sprites/Player/idle/idle6.png"],"w":62,"h":54,"fps":8,"loop":true},"run":{"images":["assets/swamp/Sprites/Player/run/run1.png","assets/swamp/Sprites/Player/run/run2.png","assets/swamp/Sprites/Player/run/run3.png","assets/swamp/Sprites/Player/run/run4.png","assets/swamp/Sprites/Player/run/run5.png","assets/swamp/Sprites/Player/run/run6.png","assets/swamp/Sprites/Player/run/run7.png","assets/swamp/Sprites/Player/run/run8.png","assets/swamp/Sprites/Player/run/run9.png","assets/swamp/Sprites/Player/run/run10.png","assets/swamp/Sprites/Player/run/run11.png","assets/swamp/Sprites/Player/run/run12.png","assets/swamp/Sprites/Player/run/run13.png","assets/swamp/Sprites/Player/run/run14.png"],"w":62,"h":54,"fps":18,"loop":true},"jump":{"images":["assets/swamp/Sprites/Player/jump/jump1.png","assets/swamp/Sprites/Player/jump/jump2.png"],"w":62,"h":54,"fps":8,"loop":false},"fall":{"images":["assets/swamp/Sprites/Player/fall/fall1.png","assets/swamp/Sprites/Player/fall/fall2.png"],"w":62,"h":54,"fps":8,"loop":false},"attack":{"images":["assets/swamp/Sprites/Player/shoot/shoot1.png","assets/swamp/Sprites/Player/shoot/shoot2.png","assets/swamp/Sprites/Player/shoot/shoot3.png"],"w":62,"h":54,"fps":18,"loop":false},"hurt":{"images":["assets/swamp/Sprites/Player/hurt/Hurt1.png","assets/swamp/Sprites/Player/hurt/Hurt2.png"],"w":62,"h":54,"fps":8,"loop":false}},"preview":{"animation":"idle","frame":0}},"brakk":{"atlas":"gothic","facing":"right","animations":{"idle":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[20,21,22,23],"durations":[100,100,100,100],"fps":10,"loop":true},"run":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[30,31,32,33,34,35],"durations":[100,100,100,100,100,100],"fps":10,"loop":true},"jump":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[0,1],"durations":[100,100],"fps":10,"loop":false},"fall":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[2,3],"durations":[100,100],"fps":10,"loop":false},"flyingKick":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[4,5],"durations":[100,100],"fps":10,"loop":false},"crouch":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[6,7],"durations":[100,300],"fps":5,"loop":true},"crouchKick":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[8,9,10,11,12],"durations":[300,50,50,50,300],"fps":6.67,"loop":false},"kick":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[13,14,15,16,17],"durations":[100,100,100,100,100],"fps":10,"loop":false},"hurt":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[18,19],"durations":[100,100],"fps":10,"loop":false},"punch":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[24,25,26,27,28,29],"durations":[200,50,50,50,50,400],"fps":7.5,"loop":false},"attack":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[24,25,26,27,28,29],"durations":[200,50,50,50,50,400],"fps":7.5,"loop":false},"heavy":{"sheet":"assets/church/SPRITES/player/spritesheet/player.png","fw":82,"fh":60,"frames":[13,14,15,16,17],"durations":[100,100,100,100,100],"fps":10,"loop":false}},"preview":{"animation":"idle","frame":0}},"seraphine":{"atlas":"gothic","facing":"right","animations":{"idle":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[0,1,2,3,4],"fps":7,"loop":true},"cast":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[5,6,7,8,9,10,11,12,13,14],"fps":16,"loop":false},"hurt":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[0],"fps":8,"loop":false}},"preview":{"animation":"idle","frame":1}},"nyx":{"atlas":"gothic","facing":"right","animations":{"idle":{"images":["assets/cemetery/PNG/Sprites/hero/hero-idle/hero-idle-1.png","assets/cemetery/PNG/Sprites/hero/hero-idle/hero-idle-2.png","assets/cemetery/PNG/Sprites/hero/hero-idle/hero-idle-3.png","assets/cemetery/PNG/Sprites/hero/hero-idle/hero-idle-4.png"],"w":100,"h":59,"fps":8,"loop":true},"run":{"images":["assets/cemetery/PNG/Sprites/hero/hero-run/hero-run-1.png","assets/cemetery/PNG/Sprites/hero/hero-run/hero-run-2.png","assets/cemetery/PNG/Sprites/hero/hero-run/hero-run-3.png","assets/cemetery/PNG/Sprites/hero/hero-run/hero-run-4.png","assets/cemetery/PNG/Sprites/hero/hero-run/hero-run-5.png","assets/cemetery/PNG/Sprites/hero/hero-run/hero-run-6.png"],"w":100,"h":59,"fps":12,"loop":true},"jump":{"images":["assets/cemetery/PNG/Sprites/hero/hero-jump/hero-jump-1.png","assets/cemetery/PNG/Sprites/hero/hero-jump/hero-jump-2.png","assets/cemetery/PNG/Sprites/hero/hero-jump/hero-jump-3.png","assets/cemetery/PNG/Sprites/hero/hero-jump/hero-jump-4.png"],"w":100,"h":59,"fps":10,"loop":false},"attack":{"images":["assets/cemetery/PNG/Sprites/hero/hero-attack/hero-attack-1.png","assets/cemetery/PNG/Sprites/hero/hero-attack/hero-attack-2.png","assets/cemetery/PNG/Sprites/hero/hero-attack/hero-attack-3.png","assets/cemetery/PNG/Sprites/hero/hero-attack/hero-attack-4.png","assets/cemetery/PNG/Sprites/hero/hero-attack/hero-attack-5.png"],"w":100,"h":59,"fps":18,"loop":false},"hurt":{"images":["assets/cemetery/PNG/Sprites/hero/hero-hurt/hero-hurt.png"],"w":100,"h":59,"fps":8,"loop":false}},"preview":{"animation":"idle","frame":0}},"bone_thrall":{"atlas":"gothic","facing":"left","animations":{"walk":{"images":["assets/cemetery/PNG/Sprites/skeleton/skeleton-1.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-2.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-3.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-4.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-5.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-6.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-7.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-8.png"],"w":44,"h":52,"fps":9,"loop":true},"attack":{"images":["assets/cemetery/PNG/Sprites/skeleton/skeleton-1.png","assets/cemetery/PNG/Sprites/skeleton/skeleton-2.png"],"w":44,"h":52,"fps":12,"loop":false},"hurt":{"images":["assets/cemetery/PNG/Sprites/skeleton/skeleton-2.png"],"w":44,"h":52,"fps":8,"loop":false},"rise":{"images":["assets/cemetery/PNG/Sprites/skeleton-rise/skeleton-rise-1.png","assets/cemetery/PNG/Sprites/skeleton-rise/skeleton-rise-2.png","assets/cemetery/PNG/Sprites/skeleton-rise/skeleton-rise-3.png","assets/cemetery/PNG/Sprites/skeleton-rise/skeleton-rise-4.png","assets/cemetery/PNG/Sprites/skeleton-rise/skeleton-rise-5.png","assets/cemetery/PNG/Sprites/skeleton-rise/skeleton-rise-6.png"],"w":44,"h":52,"fps":7,"loop":false}}},"wight":{"atlas":"gothic","facing":"left","animations":{"walk":{"images":["assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-1.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-2.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-3.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-4.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-5.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-6.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-7.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-8.png"],"w":44,"h":52,"fps":9,"loop":true},"attack":{"images":["assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-5.png","assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-6.png"],"w":44,"h":52,"fps":14,"loop":false},"hurt":{"images":["assets/cemetery/PNG/Sprites/skeleton-clothed/skeleton-clothed-2.png"],"w":44,"h":52,"fps":8,"loop":false},"rise":{"images":["assets/cemetery/PNG/Sprites/skeleton-rise-clothed/skeleton-rise-clothed-1.png","assets/cemetery/PNG/Sprites/skeleton-rise-clothed/skeleton-rise-clothed-2.png","assets/cemetery/PNG/Sprites/skeleton-rise-clothed/skeleton-rise-clothed-3.png","assets/cemetery/PNG/Sprites/skeleton-rise-clothed/skeleton-rise-clothed-4.png","assets/cemetery/PNG/Sprites/skeleton-rise-clothed/skeleton-rise-clothed-5.png","assets/cemetery/PNG/Sprites/skeleton-rise-clothed/skeleton-rise-clothed-6.png"],"w":44,"h":52,"fps":7,"loop":false}}},"wisp":{"atlas":"gothic","facing":"right","animations":{"float":{"images":["assets/cemetery/PNG/Sprites/ghost/ghost-1.png","assets/cemetery/PNG/Sprites/ghost/ghost-2.png","assets/cemetery/PNG/Sprites/ghost/ghost-3.png","assets/cemetery/PNG/Sprites/ghost/ghost-4.png"],"w":37,"h":65,"fps":8,"loop":true},"attack":{"images":["assets/cemetery/PNG/Sprites/ghost/ghost-2.png","assets/cemetery/PNG/Sprites/ghost/ghost-3.png"],"w":37,"h":65,"fps":14,"loop":false},"hurt":{"images":["assets/cemetery/PNG/Sprites/ghost/ghost-2.png"],"w":37,"h":65,"fps":8,"loop":false}}},"hellgato":{"atlas":"gothic","facing":"left","animations":{"run":{"images":["assets/cemetery/PNG/Sprites/hell-gato/hell-gato-1.png","assets/cemetery/PNG/Sprites/hell-gato/hell-gato-2.png","assets/cemetery/PNG/Sprites/hell-gato/hell-gato-3.png","assets/cemetery/PNG/Sprites/hell-gato/hell-gato-4.png"],"w":96,"h":53,"fps":12,"loop":true},"attack":{"images":["assets/cemetery/PNG/Sprites/hell-gato/hell-gato-3.png","assets/cemetery/PNG/Sprites/hell-gato/hell-gato-4.png"],"w":96,"h":53,"fps":14,"loop":false},"hurt":{"images":["assets/cemetery/PNG/Sprites/hell-gato/hell-gato-2.png"],"w":96,"h":53,"fps":8,"loop":false}}},"burning_ghoul":{"atlas":"gothic","facing":"left","animations":{"walk":{"sheet":"assets/church/SPRITES/burning-ghoul/spritesheet/v2/burning-ghoul.png","fw":57,"fh":60,"frames":[0,1,2,3,4,5,6,7],"durations":[100,100,100,100,100,100,100,100],"fps":10,"loop":true},"walk2":{"sheet":"assets/church/SPRITES/burning-ghoul/spritesheet/v2/burning-ghoul.png","fw":57,"fh":60,"frames":[8,9,10,11,12,13,14,15],"durations":[100,100,100,100,100,100,100,100],"fps":10,"loop":true},"attack":{"sheet":"assets/church/SPRITES/burning-ghoul/spritesheet/v2/burning-ghoul.png","fw":57,"fh":60,"frames":[4,5],"durations":[100,100],"fps":10,"loop":false},"hurt":{"sheet":"assets/church/SPRITES/burning-ghoul/spritesheet/v2/burning-ghoul.png","fw":57,"fh":60,"frames":[2],"durations":[100],"fps":10,"loop":false}}},"blight_cultist":{"atlas":"gothic","facing":"right","animations":{"idle":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[0,1,2,3,4],"durations":[100,100,100,100,100],"fps":10,"loop":true},"walk":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[0,1,2,3,4],"durations":[100,100,100,100,100],"fps":10,"loop":true},"cast":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[5,6,7,8,9,10,11,12,13,14],"durations":[100,100,100,100,100,100,100,100,100,300],"fps":8.33,"loop":false},"hurt":{"sheet":"assets/church/SPRITES/wizard/spritesheet/wizard.png","fw":81,"fh":66,"frames":[0],"durations":[100],"fps":10,"loop":false}}},"venom_spider":{"atlas":"gothic","facing":"right","animations":{"walk":{"images":["assets/swamp/Sprites/Spider/walk/spider1.png","assets/swamp/Sprites/Spider/walk/spider2.png","assets/swamp/Sprites/Spider/walk/spider3.png","assets/swamp/Sprites/Spider/walk/spider4.png"],"w":32,"h":21,"fps":12,"loop":true},"attack":{"images":["assets/swamp/Sprites/Spider/walk/spider3.png","assets/swamp/Sprites/Spider/walk/spider4.png"],"w":32,"h":21,"fps":14,"loop":false},"hurt":{"images":["assets/swamp/Sprites/Spider/walk/spider2.png"],"w":32,"h":21,"fps":8,"loop":false}}},"bog_brute":{"atlas":"gothic","facing":"left","animations":{"walk":{"images":["assets/swamp/Sprites/Thing/walk thing/thing1.png","assets/swamp/Sprites/Thing/walk thing/thing2.png","assets/swamp/Sprites/Thing/walk thing/thing3.png","assets/swamp/Sprites/Thing/walk thing/thing4.png"],"w":33,"h":45,"fps":8,"loop":true},"attack":{"images":["assets/swamp/Sprites/Thing/walk thing/thing3.png","assets/swamp/Sprites/Thing/walk thing/thing4.png"],"w":33,"h":45,"fps":14,"loop":false},"hurt":{"images":["assets/swamp/Sprites/Thing/walk thing/thing2.png"],"w":33,"h":45,"fps":8,"loop":false}}},"mire_wraith":{"atlas":"gothic","facing":"left","animations":{"float":{"images":["assets/swamp/Sprites/Ghost/Flying/Ghost1.png","assets/swamp/Sprites/Ghost/Flying/Ghost2.png","assets/swamp/Sprites/Ghost/Flying/Ghost3.png","assets/swamp/Sprites/Ghost/Flying/Ghost4.png"],"w":31,"h":44,"fps":8,"loop":true},"attack":{"images":["assets/swamp/Sprites/Ghost/Flying/Ghost3.png","assets/swamp/Sprites/Ghost/Flying/Ghost4.png"],"w":31,"h":44,"fps":14,"loop":false},"hurt":{"images":["assets/swamp/Sprites/Ghost/Flying/Ghost2.png"],"w":31,"h":44,"fps":8,"loop":false}}},"moss_slime":{"atlas":"forest","facing":"right","animations":{"bounce":{"sheet":"assets/fantasy forest map/Enemies/Slime-jumping-Sheet.png","fw":16,"fh":16,"frames":[0,1,2,3],"fps":10,"loop":true},"attack":{"sheet":"assets/fantasy forest map/Enemies/Slime-jumping-Sheet.png","fw":16,"fh":16,"frames":[2,3],"fps":14,"loop":false},"hurt":{"sheet":"assets/fantasy forest map/Enemies/Slime-jumping-Sheet.png","fw":16,"fh":16,"frames":[1],"fps":8,"loop":false}}},"angel":{"atlas":"gothic","facing":"right","animations":{"attack":{"sheet":"assets/church/SPRITES/angel/spritesheet/angel.png","fw":122,"fh":117,"frames":[0,1,2],"durations":[100,100,100],"fps":10,"loop":false},"idle":{"sheet":"assets/church/SPRITES/angel/spritesheet/angel.png","fw":122,"fh":117,"frames":[3,4,5,6,7,8,9,10],"durations":[100,100,100,100,100,100,100,100],"fps":10,"loop":true}}},"fireball":{"atlas":"gothic","animations":{"fly":{"sheet":"assets/church/SPRITES/fx/fireball/fireball-spritesheet/fireball.png","fw":26,"fh":26,"frames":[0,1,2],"durations":[100,100,100],"fps":10,"loop":true}}},"death_burst":{"atlas":"gothic","animations":{"burst":{"sheet":"assets/church/SPRITES/fx/enemy-death/enemy-death-spritesheet/enemy-death.png","fw":81,"fh":66,"frames":[0,1,2,3,4,5,6,7,8],"durations":[100,100,100,100,100,100,100,100,300],"fps":8.18,"loop":false}}},"cemetery_death":{"atlas":"gothic","animations":{"burst":{"images":["assets/cemetery/PNG/Sprites/enemy-death/enemy-death-1.png","assets/cemetery/PNG/Sprites/enemy-death/enemy-death-2.png","assets/cemetery/PNG/Sprites/enemy-death/enemy-death-3.png","assets/cemetery/PNG/Sprites/enemy-death/enemy-death-4.png","assets/cemetery/PNG/Sprites/enemy-death/enemy-death-5.png"],"w":44,"h":52,"fps":16,"loop":false}}},"swamp_death":{"atlas":"gothic","animations":{"burst":{"images":["assets/swamp/Sprites/Enemy-Death/Explosion/Enemy-Death1.png","assets/swamp/Sprites/Enemy-Death/Explosion/Enemy-Death2.png","assets/swamp/Sprites/Enemy-Death/Explosion/Enemy-Death3.png","assets/swamp/Sprites/Enemy-Death/Explosion/Enemy-Death4.png","assets/swamp/Sprites/Enemy-Death/Explosion/Enemy-Death5.png","assets/swamp/Sprites/Enemy-Death/Explosion/Enemy-Death6.png"],"w":39,"h":49,"fps":14,"loop":false}}}}`),props:{cemetery:{atlas:`gothic`,frames:{tree1:{image:`assets/cemetery/PNG/Environment/sliced-objects/tree-1.png`,w:166,h:117},tree2:{image:`assets/cemetery/PNG/Environment/sliced-objects/tree-2.png`,w:166,h:117},tree3:{image:`assets/cemetery/PNG/Environment/sliced-objects/tree-3.png`,w:176,h:171},statue:{image:`assets/cemetery/PNG/Environment/sliced-objects/statue.png`,w:63,h:75},stone1:{image:`assets/cemetery/PNG/Environment/sliced-objects/stone-1.png`,w:27,h:39},stone2:{image:`assets/cemetery/PNG/Environment/sliced-objects/stone-2.png`,w:27,h:40},stone3:{image:`assets/cemetery/PNG/Environment/sliced-objects/stone-3.png`,w:27,h:33},stone4:{image:`assets/cemetery/PNG/Environment/sliced-objects/stone-4.png`,w:19,h:38},bushLarge:{image:`assets/cemetery/PNG/Environment/sliced-objects/bush-large.png`,w:76,h:65},bushSmall:{image:`assets/cemetery/PNG/Environment/sliced-objects/bush-small.png`,w:34,h:29}}},church:{atlas:`gothic`,frames:{column:{image:`assets/church/ENVIRONMENT/column.png`,w:114,h:190},balustrade:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[192,92,80,52],w:80,h:52}}},swamp:{atlas:`gothic`,frames:{trees:{image:`assets/swamp/Evironment/trees.png`,w:288,h:208},grass:{image:`assets/swamp/Evironment/props.png`,rect:[8,5,38,34],w:38,h:34},root:{image:`assets/swamp/Evironment/props.png`,rect:[60,20,55,21],w:55,h:21},fern:{image:`assets/swamp/Evironment/props.png`,rect:[128,10,45,32],w:45,h:32}}},dungeon:{atlas:`dungeon`,frames:{torch0:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[4,7,34,58],w:34,h:58},torch1:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[42,7,34,58],w:34,h:58},torch2:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[80,7,34,58],w:34,h:58},torch3:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[118,5,34,60],w:34,h:60},knight:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[17,69,42,96],w:42,h:96},robed:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[68,69,44,96],w:44,h:96},wallLarge:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[162,128,128,48],w:128,h:48},spikes:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[160,184,32,18],w:32,h:18}}},forest:{atlas:`forest`,frames:{treeBig1:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[0,64,48,80],w:48,h:80},treeBig2:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[114,114,76,78],w:76,h:78},treeBig3:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[197,119,51,73],w:51,h:73},bush1:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[145,60,31,20],w:31,h:20},bush2:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[177,60,31,20],w:31,h:20},bush3:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[112,88,63,24],w:63,h:24},rock:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[81,54,28,26],w:28,h:26},log:{image:`assets/fantasy forest map/Decore/Fantasy Decore.png`,rect:[98,26,77,22],w:77,h:22}}}},tiles:{cemetery:{atlas:`gothic`,groupWidth:2,surfaceOffset:10,frames:{top:[{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[80,48,16,16]},{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[96,48,16,16]}],body:[{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[80,64,16,16]},{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[96,64,16,16]}],deep:[{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[80,80,16,16]},{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[96,80,16,16]}],topLeft:{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[64,48,16,16]},topRight:{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[112,48,16,16]},bodyLeft:{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[64,64,16,16]},bodyRight:{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[112,64,16,16]},deepLeft:{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[64,80,16,16]},deepRight:{image:`assets/cemetery/PNG/Environment/tileset.png`,rect:[112,80,16,16]}},tileWidth:16,tileHeight:16,margin:0,spacing:0},church:{atlas:`gothic`,groupWidth:2,surfaceOffset:0,frames:{top:[{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[16,112,16,16]},{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[32,112,16,16]}],body:[{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[16,128,16,16]},{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[32,128,16,16]}],deep:[{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[16,144,16,16]},{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[32,144,16,16]}],topLeft:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[16,112,16,16]},topRight:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[32,112,16,16]},bodyLeft:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[16,128,16,16]},bodyRight:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[32,128,16,16]},deepLeft:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[16,144,16,16]},deepRight:{image:`assets/church/ENVIRONMENT/tileset.png`,rect:[32,144,16,16]}},tileWidth:16,tileHeight:16,margin:0,spacing:0},swamp:{atlas:`gothic`,groupWidth:3,surfaceOffset:7,frames:{top:[{image:`assets/swamp/Evironment/tileset.png`,rect:[48,0,16,16]},{image:`assets/swamp/Evironment/tileset.png`,rect:[64,0,16,16]},{image:`assets/swamp/Evironment/tileset.png`,rect:[80,0,16,16]}],body:[{image:`assets/swamp/Evironment/tileset.png`,rect:[48,16,16,16]},{image:`assets/swamp/Evironment/tileset.png`,rect:[64,16,16,16]},{image:`assets/swamp/Evironment/tileset.png`,rect:[80,16,16,16]}],deep:[{image:`assets/swamp/Evironment/tileset.png`,rect:[48,32,16,16]},{image:`assets/swamp/Evironment/tileset.png`,rect:[64,32,16,16]},{image:`assets/swamp/Evironment/tileset.png`,rect:[80,32,16,16]}],topLeft:{image:`assets/swamp/Evironment/tileset.png`,rect:[32,0,16,16]},topRight:{image:`assets/swamp/Evironment/tileset.png`,rect:[96,0,16,16]},bodyLeft:{image:`assets/swamp/Evironment/tileset.png`,rect:[32,16,16,16]},bodyRight:{image:`assets/swamp/Evironment/tileset.png`,rect:[96,16,16,16]},deepLeft:{image:`assets/swamp/Evironment/tileset.png`,rect:[32,32,16,16]},deepRight:{image:`assets/swamp/Evironment/tileset.png`,rect:[96,32,16,16]},water:{image:`assets/swamp/Evironment/tileset.png`,rect:[224,80,64,32]},sideLeft:{image:`assets/swamp/Evironment/tileset.png`,rect:[0,8,16,56]},sideRight:{image:`assets/swamp/Evironment/tileset.png`,rect:[320,8,14,56]}},tileWidth:16,tileHeight:16,margin:0,spacing:0},dungeon:{atlas:`dungeon`,groupWidth:4,surfaceOffset:0,frames:{top:[{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[21,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[53,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[85,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[117,187,16,16]}],body:[{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[21,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[53,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[85,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[117,187,16,16]}],deep:[{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[21,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[53,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[85,187,16,16]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[117,187,16,16]}],topLeft:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[21,187,16,16]},topRight:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[117,187,16,16]},bodyLeft:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[21,187,16,16]},bodyRight:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[117,187,16,16]},deepLeft:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[21,187,16,16]},deepRight:{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,rect:[117,187,16,16]}},tileWidth:16,tileHeight:16,margin:0,spacing:0},forest:{atlas:`forest`,groupWidth:2,surfaceOffset:0,frames:{top:[{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[16,16,16,16]},{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[32,16,16,16]}],body:[{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[16,32,16,16]},{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[32,32,16,16]}],deep:[{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[16,48,16,16]},{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[32,48,16,16]}],topLeft:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[0,16,16,16]},topRight:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[48,16,16,16]},bodyLeft:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[0,32,16,16]},bodyRight:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[48,32,16,16]},deepLeft:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[0,48,16,16]},deepRight:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[48,48,16,16]},chunk:{image:`assets/fantasy forest map/Tileset/Fantasy-TileSet.png`,rect:[0,16,176,96]}},tileWidth:16,tileHeight:16,margin:0,spacing:0}},backgrounds:{cemetery:[{image:`assets/cemetery/demo/assets/environment/bg-moon.png`,parallax:.015,y:136,mode:`repeat`,tint:[.68,.52,.75]},{image:`assets/cemetery/PNG/Environment/mountains.png`,parallax:.07,y:28,mode:`repeat`,tint:[.23,.21,.36]},{image:`assets/cemetery/PNG/Environment/graveyard.png`,parallax:.25,y:8,mode:`repeat`,tint:[.24,.17,.23]}],church:[{image:`assets/church/ENVIRONMENT/backgrounds.png`,parallax:.05,worldY:144,mode:`repeat`,crop:[0,0,160,192],tint:[.58,.54,.82]}],swamp:[{image:`assets/swamp/Evironment/background.png`,parallax:.015,worldY:144,mode:`repeat`,tint:[.55,.72,.48]},{image:`assets/swamp/Evironment/mid-layer-02.png`,parallax:.06,worldY:144,mode:`repeat`,tint:[.56,.72,.46],opacity:.9},{image:`assets/swamp/Evironment/mid-layer-01.png`,parallax:.13,worldY:144,mode:`repeat`,tint:[.48,.64,.4],opacity:.94},{image:`assets/swamp/Evironment/trees.png`,parallax:.24,worldY:144,mode:`repeat`,tint:[.3,.4,.26],opacity:.92}],dungeon:[{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.01,worldY:144,mode:`repeat`,opacity:.5,tint:[.06,.07,.1],crop:[162,58,128,64]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.03,worldY:144,mode:`repeat`,tint:[.2,.21,.28],crop:[162,58,128,64]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.03,worldY:208,mode:`repeat`,tint:[.17,.18,.24],crop:[162,5,128,47]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.03,worldY:255,mode:`repeat`,tint:[.14,.15,.2],crop:[162,58,128,64]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.03,worldY:319,mode:`repeat`,tint:[.11,.12,.16],crop:[162,5,128,47]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.9,worldY:144,mode:`single`,single:!0,x:-312,tint:[.09,.1,.15],opacity:.82,crop:[162,58,16,64]},{image:`assets/dungeon/2D Medieval Castle Dungeon Tileset Assets.png`,parallax:.9,worldY:144,mode:`single`,single:!0,x:312,tint:[.09,.1,.15],opacity:.82,crop:[274,58,16,64]}],forest:[{image:`assets/fantasy forest map/Background/BG-1.png`,parallax:.01,y:0,mode:`repeat`,tint:[.25,.34,.35]},{image:`assets/fantasy forest map/Background/BG-3.png`,parallax:.025,y:80,mode:`repeat`,tint:[.28,.36,.38],opacity:.5},{image:`assets/fantasy forest map/Background/BG-2.png`,parallax:.06,y:0,mode:`stretchRepeat`,tint:[.47,.58,.56]},{image:`assets/fantasy forest map/Background/BG-4.png`,parallax:.17,y:0,mode:`stretchRepeat`,tint:[.36,.45,.43]}]},presentation:{characterTints:{kael:[.8,.94,1.06],brakk:[1.08,.82,.72],seraphine:[.92,.8,1.1],nyx:[.68,.7,1.02]},zoneTints:{cemetery:[.92,.9,1],church:[.94,.9,1.06],swamp:[.84,.96,.82],dungeon:[.72,.78,.92],forest:[.72,.9,.8]}}},Kc=.02;function qc(e){return new Promise((t,n)=>{let r=new Image;r.decoding=`async`,r.onload=()=>t(r),r.onerror=()=>n(Error(`Failed to load image: ${e}`)),r.src=new URL(e,document.baseURI).href})}function Jc(e){let t=1;for(;t<e;)t*=2;return t}function Yc(e,t,n){let r=[...e].sort((e,t)=>t.w===e.w?t.h-e.h:t.w-e.w),i=n,a=n,o=0,s=t-n;for(let e of r)i+e.w+n>s&&(i=n,a+=o+n,o=0),e.packX=i,e.packY=a,i+=e.w+n,e.h>o&&(o=e.h);return{width:t,height:Jc(a+o+n),sorted:r}}function Xc(e,t,n){let r=[];if(t.images)return t.images.forEach((i,a)=>{let o=n.get(i);r.push({id:`spr:${e}:${t.id??``}:${a}`,imagePath:i,x:0,y:0,w:t.w??o.width,h:t.h??o.height})}),r;let i=n.get(t.sheet),a=Math.max(1,Math.floor(i.width/t.fw));return t.frames.forEach((n,i)=>{let o=n%a*t.fw,s=Math.floor(n/a)*t.fh;r.push({id:`spr:${e}:${t.id??``}:${i}`,imagePath:t.sheet,x:o,y:s,w:t.fw,h:t.fh})}),r}function Zc(e){let t=[];for(let[n,r]of Object.entries(e.frames))t.push({id:`prop:${n}`,imagePath:r.image,x:r.rect?r.rect[0]:0,y:r.rect?r.rect[1]:0,w:r.rect?r.rect[2]:null,h:r.rect?r.rect[3]:null,alias:n});return t}function Qc(e,t){let n=[];for(let[r,i]of Object.entries(t.frames))Array.isArray(i)?i.forEach((t,i)=>{n.push({id:`tile:${e}:${r}:${i}`,imagePath:t.image,x:t.rect[0],y:t.rect[1],w:t.rect[2],h:t.rect[3]})}):n.push({id:`tile:${e}:${r}`,imagePath:i.image,x:i.rect[0],y:i.rect[1],w:i.rect[2],h:i.rect[3]});return n}var $c=class{constructor(){this.manifest=Gc,this.atlases={},this.images=new Map,this.backgrounds=new Map,this.animations={},this.tileGroupWidths={},this.progress=0,this.totalTasks=0,this.completedTasks=0}async loadAll(e){this.onProgress=e;let t=Object.keys(this.manifest.atlases);for(let e of t)await this.buildFamilyAtlas(e);this.progress=1,this.onProgress?.(1)}async loadFamilies(e){for(let t of e)await this.buildFamilyAtlas(t)}collectImagePath(e){this.images.has(e)||this.images.set(e,null)}async ensureImagesLoaded(){let e=[...this.images.entries()].filter(([,e])=>!e);if(e.length===0)return;let t=0;this.totalTasks=e.length,this.completedTasks=0,await Promise.all(Array.from({length:12},async()=>{for(;t<e.length;){let n=t++,[r]=e[n],i=await qc(r);this.images.set(r,i),this.completedTasks++,this.onProgress?.(Math.min(.95,this.completedTasks/this.totalTasks)*.95)}}))}async loadBackgroundImages(e){let t=[...new Set(e)];await Promise.all(t.map(async e=>{if(this.backgrounds.has(e))return;let t=await qc(e),n=new Xt(t);n.magFilter=E,n.minFilter=E,n.generateMipmaps=!1,n.colorSpace=at,n.wrapS=w,n.wrapT=w,n.needsUpdate=!0,this.backgrounds.set(e,{img:t,texture:n})}))}async buildFamilyAtlas(e){for(let[t,n]of Object.entries(this.manifest.sprites))if(n.atlas===e)for(let e of Object.values(n.animations))e.images?e.images.forEach(e=>this.collectImagePath(e)):this.collectImagePath(e.sheet);for(let t of Object.values(this.manifest.props))if(t.atlas===e)for(let e of Object.values(t.frames))this.collectImagePath(e.image);for(let t of Object.values(this.manifest.tiles))if(t.atlas===e)for(let e of Object.values(t.frames))Array.isArray(e)?e.forEach(e=>this.collectImagePath(e.image)):this.collectImagePath(e.image);await this.ensureImagesLoaded();let t=new Map;for(let[e,n]of this.images)t.set(e,{width:n.width,height:n.height});let n=[];for(let[r,i]of Object.entries(this.manifest.sprites))if(i.atlas===e){this.animations[r]={};for(let[e,a]of Object.entries(i.animations)){let i=Xc(r,{...a,id:e},t);this.animations[r][e]={frames:i,fps:a.fps??8,loop:a.loop??!0,durations:Array.isArray(a.durations)&&a.durations.length===i.length?a.durations.map(e=>Number(e)/1e3):null},n.push(...i)}}for(let[r,i]of Object.entries(this.manifest.props)){if(i.atlas!==e)continue;let a=Zc(i);for(let e of a){let n=t.get(e.imagePath);e.w=e.w??n.width,e.h=e.h??n.height,e.id=`prop:${r}:${e.alias}`}n.push(...a)}for(let[t,r]of Object.entries(this.manifest.tiles))r.atlas===e&&(this.tileGroupWidths[t]=r.groupWidth,n.push(...Qc(t,r)));let r=new Map;for(let e of n){let t=`${e.imagePath}|${e.x}|${e.y}|${e.w}|${e.h}`;r.has(t)||r.set(t,t)}let i=[...r.keys()].map(e=>n.find(t=>`${t.imagePath}|${t.x}|${t.y}|${t.w}|${t.h}`===e)),a=this.manifest.rendering?.atlasPadding??2,o=Yc(i,this.manifest.rendering?.atlasMaxWidth??2048,a),s=document.createElement(`canvas`);s.width=o.width,s.height=o.height;let c=s.getContext(`2d`,{willReadFrequently:!0});c.imageSmoothingEnabled=!1;let l=new Map,u=new Map;for(let e of o.sorted){let t=this.images.get(e.imagePath);c.drawImage(t,e.x,e.y,e.w,e.h,e.packX,e.packY,e.w,e.h);let n=`${e.imagePath}|${e.x}|${e.y}|${e.w}|${e.h}`,r={u0:(e.packX+Kc)/s.width,v0:1-(e.packY+e.h-Kc)/s.height,u1:(e.packX+e.w-Kc)/s.width,v1:1-(e.packY+Kc)/s.height,w:e.w,h:e.h,sx:e.packX,sy:e.packY,imagePath:e.imagePath,srcX:e.x,srcY:e.y};u.set(n,r)}let d=c.getImageData(0,0,s.width,s.height).data,f=e=>{let t=e.w,n=e.h,r=-1,i=-1;for(let a=0;a<e.h;a++)for(let o=0;o<e.w;o++)d[((e.sy+a)*s.width+e.sx+o)*4+3]<8||(o<t&&(t=o),o>r&&(r=o),a<n&&(n=a),a>i&&(i=a));return i<0?{anchorX:.5,anchorY:1}:{anchorX:.5,anchorY:(i+1)/e.h,opaqueBox:{x:t,y:n,w:r-t+1,h:i-n+1}}},p=new Map;for(let e of u.values()){let t=`${e.sx}|${e.sy}|${e.w}|${e.h}`;p.set(t,f(e))}for(let e of n){let t=`${e.imagePath}|${e.x}|${e.y}|${e.w}|${e.h}`,n=u.get(t);if(!n)continue;let r=p.get(`${n.sx}|${n.sy}|${n.w}|${n.h}`)??{anchorX:.5,anchorY:1};l.set(e.id,{id:e.id,...n,...r})}for(let[t,n]of Object.entries(this.manifest.sprites)){if(n.atlas!==e)continue;for(let[e,r]of Object.entries(n.animations)){let n=this.animations[t]?.[e];n&&(n.frames=n.frames.map(e=>l.get(e.id)??null))}let r=0;for(let e of Object.values(this.animations[t]??{}))for(let t of e.frames)t&&(r=Math.max(r,t.anchorY??1));if(r>0)for(let e of Object.values(this.animations[t]??{}))e.frames=e.frames.map(e=>e&&{...e,anchorY:r})}let m=new Si(s);m.magFilter=E,m.minFilter=E,m.generateMipmaps=!1,m.colorSpace=at,m.flipY=!0,m.needsUpdate=!0,this.atlases[e]={family:e,canvas:s,ctx:c,texture:m,frames:l,padding:a,width:s.width,height:s.height}}getAtlas(e){return this.atlases[e]}getFrame(e,t){return this.atlases[e]?.frames.get(t)??null}getAnimation(e,t){return this.animations[e]?.[t]??null}getSpriteFacing(e){return this.manifest.sprites[e]?.facing===`left`?`left`:`right`}shouldFlipSprite(e,t,n=null){let r=n===`left`||n===`right`?n:this.getSpriteFacing(e);return t<0!=(r===`left`)}getTileFrame(e,t,n=0){let r=this.manifest.tiles[e]?.atlas;if(!r)return null;let i=[`tile:${e}:${t}:${n}`,`tile:${e}:${t}:0`,`tile:${e}:${t}`];for(let e of i){let t=this.getFrame(r,e);if(t)return t}return null}getPropFrame(e,t){let n=this.manifest.props[e]?.atlas;return n?this.getFrame(n,`prop:${e}:${t}`):null}getGroupWidth(e){return this.tileGroupWidths[e]??4}getPalette(e,t,n=10){if(!t)return[[220,210,190]];this.paletteCache??=new Map;let r=`${e}:${t.id}`;if(this.paletteCache.has(r))return this.paletteCache.get(r);let i=this.atlases[e];if(!i)return[[220,210,190]];let a=i.ctx;i.pixelData??=a.getImageData(0,0,i.canvas.width,i.canvas.height).data;let o=i.pixelData,s=new Map,c=i.canvas.width;for(let e=0;e<t.h;e+=2)for(let n=0;n<t.w;n+=2){let r=((t.sy+e)*c+t.sx+n)*4;if(o[r+3]<40)continue;let i=o[r]&248,a=o[r+1]&248,l=o[r+2]&248;if(i+a+l<30)continue;let u=i<<16|a<<8|l;s.set(u,(s.get(u)??0)+1)}let l=[...s.entries()].sort((e,t)=>t[1]-e[1]).slice(0,n).map(([e])=>[e>>16&255,e>>8&255,e&255]);return l.length||l.push([210,196,170]),this.paletteCache.set(r,l),l}get backgroundManifest(){return this.manifest.backgrounds}getSpriteManifest(e){return this.manifest.sprites[e]}getSpriteAtlas(e){return this.manifest.sprites[e]?.atlas??`gothic`}getPresentation(){return this.manifest.presentation}async loadZoneBackgrounds(e){let t=this.manifest.backgrounds[e]??[];return await this.loadBackgroundImages(t.map(e=>e.image)),t.map(e=>({...e,texture:this.backgrounds.get(e.image)?.texture,image:this.backgrounds.get(e.image)?.img}))}dispose(){for(let e of Object.values(this.atlases))e.texture.dispose();for(let e of this.backgrounds.values())e.texture.dispose();this.atlases={},this.backgrounds.clear()}},el={base:{enemyHp:1,enemyDamage:1,enemySpeed:1,spawnBudgetPerSecond:1.05,maxActive:10,eliteChance:0,eventInterval:75,xpMultiplier:1},phases:[{id:`tutorial`,startTime:0,endTime:120,labelKey:`difficulty.tutorial`,spawnBudgetPerSecond:1.05,maxActive:10,hpScale:1,damageScale:1,speedScale:1,eliteChance:0,pool:[`bone_thrall`,`venom_spider`],eventInterval:0,events:[]},{id:`stirring`,startTime:120,endTime:300,labelKey:`difficulty.stirring`,spawnBudgetPerSecond:1.45,maxActive:22,hpScale:1.18,damageScale:1.08,speedScale:1.04,eliteChance:.02,pool:[`bone_thrall`,`venom_spider`,`cinder_hound`,`wisp`,`moss_slime`],eventInterval:95,events:[`ambush`]},{id:`pressure`,startTime:300,endTime:480,labelKey:`difficulty.pressure`,spawnBudgetPerSecond:2,maxActive:52,hpScale:1.38,damageScale:1.18,speedScale:1.08,eliteChance:.05,pool:[`bone_thrall`,`wight`,`cinder_hound`,`wisp`,`burning_ghoul`,`blight_cultist`,`venom_spider`,`moss_slime`,`bog_brute`],eventInterval:75,events:[`ambush`,`surge`]},{id:`elites`,startTime:480,endTime:720,labelKey:`difficulty.elite`,spawnBudgetPerSecond:2.75,maxActive:100,hpScale:1.65,damageScale:1.3,speedScale:1.14,eliteChance:.1,pool:[`wight`,`cinder_hound`,`wisp`,`burning_ghoul`,`blight_cultist`,`venom_spider`,`bog_brute`,`mire_wraith`,`moss_slime`],eventInterval:60,events:[`ambush`,`surge`,`elite_pack`]},{id:`hell`,startTime:720,endTime:null,labelKey:`difficulty.hell`,spawnBudgetPerSecond:4.2,maxActive:150,hpScale:2,damageScale:1.5,speedScale:1.2,eliteChance:.16,pool:[`wight`,`cinder_hound`,`wisp`,`burning_ghoul`,`blight_cultist`,`venom_spider`,`bog_brute`,`mire_wraith`,`moss_slime`],eventInterval:45,events:[`ambush`,`surge`,`elite_pack`]}],events:{ambush:{nameKey:`event.ambush`,duration:18,budgetMultiplier:1.8,maxAdd:12},surge:{nameKey:`event.surge`,duration:14,budgetMultiplier:2.3,maxAdd:20},elite_pack:{nameKey:`event.elitePack`,duration:12,eliteBonus:1,maxAdd:6}},adaptive:{enabled:!0,lowFps:52,highFps:58,step:.04,minBudgetScale:.55,recoveryDelay:1.5},timeScale:{hpPerMinuteAfter10:.06,damagePerMinuteAfter10:.035}};function tl(e){for(let t of el.phases)if(t.endTime===null||e<t.endTime)return t;return el.phases[el.phases.length-1]}var nl=[{id:`bone_thrall`,sprite:`bone_thrall`,nameKey:`enemy.boneThrall.name`,behavior:`walker`,canJumpGap:!0,health:32,speed:42,damage:8,attackRange:22,windup:.35,active:.18,recover:.55,cooldown:1.7,xp:8,cost:1,width:16,height:34,visualScale:1,flying:!1,tint:[.95,.92,.9],deathEffect:`bone`,spawnSound:`rise`,pool:[`cemetery`,`church`,`dungeon`]},{id:`wight`,sprite:`wight`,nameKey:`enemy.wight.name`,behavior:`walker`,canJumpGap:!0,health:62,speed:50,damage:12,attackRange:24,windup:.48,active:.22,recover:.6,cooldown:1.9,xp:15,cost:2,width:18,height:36,visualScale:1,flying:!1,tint:[.8,.85,.96],deathEffect:`bone`,spawnSound:`rise`,pool:[`cemetery`,`church`,`dungeon`,`swamp`]},{id:`cinder_hound`,sprite:`hellgato`,nameKey:`enemy.cinderHound.name`,behavior:`charger`,canJumpGap:!0,health:56,speed:68,chargeSpeed:260,damage:16,attackRange:180,windup:.6,active:.35,recover:.9,cooldown:2.6,xp:18,cost:3,width:36,height:26,visualScale:1,flying:!1,tint:[1.18,.74,.6],deathEffect:`ember`,pool:[`cemetery`,`church`]},{id:`wisp`,sprite:`wisp`,nameKey:`enemy.wisp.name`,behavior:`flyer`,health:28,speed:52,diveSpeed:170,damage:10,attackRange:90,windup:.45,active:.25,recover:.7,cooldown:2.1,xp:11,cost:2,width:16,height:30,visualScale:1,flying:!0,hoverHeight:48,tint:[.7,.9,1.05],deathEffect:`soul`,pool:[`cemetery`,`swamp`,`dungeon`,`forest`]},{id:`burning_ghoul`,sprite:`burning_ghoul`,nameKey:`enemy.burningGhoul.name`,behavior:`kamikaze`,canJumpGap:!0,health:36,speed:80,damage:26,attackRange:26,windup:.38,active:.2,recover:.2,cooldown:99,xp:16,cost:3,width:18,height:38,visualScale:1,flying:!1,tint:[1.15,.88,.72],deathEffect:`fire`,pool:[`church`,`dungeon`]},{id:`blight_cultist`,sprite:`blight_cultist`,nameKey:`enemy.blightCultist.name`,behavior:`ranged`,canJumpGap:!1,health:48,speed:38,projectileSpeed:150,projectileDamage:12,damage:0,attackRange:210,preferredRange:130,windup:.7,active:.25,recover:.8,cooldown:2.3,xp:20,cost:3,width:16,height:34,visualScale:1,flying:!1,tint:[.82,.68,1.02],deathEffect:`soul`,projectile:`fireball`,pool:[`church`,`swamp`,`dungeon`]},{id:`venom_spider`,sprite:`venom_spider`,nameKey:`enemy.venomSpider.name`,behavior:`swarm`,canJumpGap:!0,health:14,speed:92,damage:5,attackRange:16,windup:.18,active:.15,recover:.4,cooldown:1.15,xp:5,cost:1,width:14,height:12,visualScale:1,flying:!1,tint:[.8,1.02,.7],deathEffect:`venom`,pool:[`swamp`,`forest`]},{id:`mire_wraith`,sprite:`mire_wraith`,nameKey:`enemy.mireWraith.name`,behavior:`flyer`,health:44,speed:64,diveSpeed:210,damage:14,attackRange:100,windup:.4,active:.22,recover:.8,cooldown:2,xp:17,cost:2,width:16,height:28,visualScale:1,flying:!0,hoverHeight:40,tint:[.6,1,.82],deathEffect:`soul`,pool:[`swamp`,`forest`]},{id:`bog_brute`,sprite:`bog_brute`,nameKey:`enemy.bogBrute.name`,behavior:`tank`,canJumpGap:!1,health:160,speed:26,damage:22,attackRange:30,windup:.8,active:.3,recover:1,cooldown:2.6,xp:34,cost:5,width:22,height:40,visualScale:1,flying:!1,tint:[.8,.98,.68],deathEffect:`mud`,pool:[`swamp`,`forest`]},{id:`moss_slime`,sprite:`moss_slime`,nameKey:`enemy.mossSlime.name`,behavior:`bouncer`,canJumpGap:!0,health:24,speed:38,jumpSpeed:220,damage:8,attackRange:20,windup:.25,active:.2,recover:.5,cooldown:1.5,xp:7,cost:1,width:14,height:12,visualScale:1,flying:!1,tint:[.74,1.04,.74],deathEffect:`venom`,pool:[`forest`]},{id:`pale_revenant`,sprite:`wight`,nameKey:`enemy.paleRevenant.name`,behavior:`teleporter`,canJumpGap:!1,health:135,speed:64,damage:18,attackRange:28,windup:.3,active:.2,recover:.45,cooldown:1.8,xp:52,cost:6,width:20,height:38,visualScale:1,flying:!1,elite:!0,tint:[.7,.88,1.18],deathEffect:`frost`,pool:[`church`,`dungeon`,`swamp`,`forest`]},{id:`alpha_hound`,sprite:`hellgato`,nameKey:`enemy.alphaHound.name`,behavior:`charger`,canJumpGap:!0,health:190,speed:82,chargeSpeed:320,damage:24,attackRange:200,windup:.42,active:.4,recover:.7,cooldown:2.2,xp:58,cost:6,width:44,height:30,visualScale:1,flying:!1,elite:!0,tint:[1.25,.5,.48],deathEffect:`ember`,pool:[`cemetery`,`church`]}],rl=Object.fromEntries(nl.map(e=>[e.id,e])),il={enemy:{idle:{fps:0,loop:!0},walk:{fps:10,loop:!0},attack:{fps:14,loop:!1},hurt:{fps:10,loop:!1,duration:.2},death:{duration:.45},spawn:{fps:7,loop:!1},windup:{scaleX:.94,scaleY:1.08},strike:{scaleX:1.16,scaleY:.86},hurtPose:{scaleX:1.12,scaleY:.86}},boss:{idleFps:7,attackFps:8,hurtFps:10}},al=class{constructor(e,t){this.assets=e,this.spriteId=t,this.animation=null,this.animationName=null,this.time=0,this.frameIndex=0,this.finished=!1,this.speed=1,this.durations=null}play(e,{restart:t=!1,speed:n=1,fps:r=null,loop:i=null,phase:a=0}={}){let o=this.assets.getAnimation(this.spriteId,e);if(!o)return!1;if(this.animationName===e&&!t)return this.speed=n,r!==null&&(this.fps=r,this.durations=null),i!==null&&(this.loop=i),!1;this.animation=o,this.animationName=e,this.time=0,this.frameIndex=0,this.finished=!1,this.speed=n,this.fps=r??o.fps??8,this.loop=i??o.loop??!0,this.durations=r===null&&Array.isArray(o.durations)&&o.durations.length===o.frames.length?o.durations:null;let s=this.fps>0?1/this.fps:0;return this.loop&&a>0&&s>0&&this.animation.frames.length>0&&(this.time=a%1*this.animation.frames.length*s,this.frameIndex=Math.floor(this.time/s)%this.animation.frames.length),!0}get totalDuration(){return this.durations?this.durations.reduce((e,t)=>e+t,0):0}frameIndexAt(e){let t=0;for(let n=0;n<this.durations.length;n++)if(t+=this.durations[n],e<t)return n;return this.durations.length-1}update(e){if(!this.animation)return;if(this.time+=e*this.speed,this.durations){let e=this.totalDuration;if(e<=0)return;this.loop??this.animation.loop?(this.time%=e,this.frameIndex=this.frameIndexAt(this.time),this.finished=!1):this.time>=e?(this.finished||this.onFinished?.(),this.finished=!0,this.frameIndex=this.animation.frames.length-1):this.frameIndex=this.frameIndexAt(this.time);return}if((this.fps??this.animation.fps??8)<=0){this.frameIndex=0,this.finished=!1;return}let t=1/(this.fps??this.animation.fps??8),n=Math.floor(this.time/t);this.loop??this.animation.loop?(this.frameIndex=n%this.animation.frames.length,this.finished=!1):n>=this.animation.frames.length?(this.finished||this.onFinished?.(),this.finished=!0,this.frameIndex=this.animation.frames.length-1):this.frameIndex=n}get frame(){return this.animation?.frames[this.frameIndex]??null}get progress(){if(!this.animation)return 0;if(this.durations){let e=this.totalDuration;return e>0?Math.min(1,this.time/e):0}let e=this.fps||this.animation.fps||8;if(e<=0)return 0;let t=this.animation.frames.length/e;return Math.min(1,this.time/t)}},ol=class{constructor(t,n,r,i,a={}){this.def=t,this.id=t.id,this.sprite=t.sprite,this.assets=n,this.animator=new al(n,t.sprite),this.width=t.width,this.height=t.height,this.x=r,this.y=i,this.prevX=r,this.prevY=i,this.vx=0,this.vy=0,this.facing=-1,this.elite=!!t.elite,this.behavior=t.behavior,this.flying=!!t.flying,this.visualScale=t.visualScale??1,this.healthScale=a.health??1,this.damageScale=a.damage??1,this.speedScale=a.speed??1;let o=e.enemyAI.crowd;this.speedJitter=1+(Math.random()*2-1)*o.speedVariance,this.animationPhase=Math.random(),this.tintJitter=[0,1,2].map(()=>1+(Math.random()*2-1)*o.tintVariance),this.maxHealth=Math.round(t.health*this.healthScale),this.health=this.maxHealth,this.damage=t.damage*this.damageScale,this.projectileDamage=(t.projectileDamage??t.damage)*this.damageScale,this.speed=t.speed*this.speedScale*this.speedJitter,this.state=`spawn`,this.stateTimer=.45,this.cooldown=.5+Math.random()*.9,this.attackFired=!1,this.flashTimer=0,this.hitstun=0,this.iframes=0,this.dead=!1,this.touchingPlayer=!1,this.contactCooldown=0,this.flyingPhase=Math.random()*6,this.events=[],this.onGround=!1,this.idlePhase=Math.random()*Math.PI*2,this.hoverBaseY=i,this.speedMultiplier=a.speed??1,this.bounceCooldown=0,this.stepCooldown=0,this.stuckTimer=0,this.pendingAttack=!1,this.lastHitAt=-1,this.spatialIndex=-1,this.tintBase=(t.tint??[1,1,1]).map((e,t)=>e*this.tintJitter[t]),this.zoneTint=a.zoneTint??[1,1,1],this.spawnGrace=.15,this.slowTimer=0,this.slowFactor=1,this.hurtTimer=0,this.deathTimer=0,this.hazardCooldown=0,this.pitBlockedTime=0,this.pitEngaged=!1,this.retreatTimer=0,this.pitJumpTimer=0,this.pitJumpDirection=1,this.stuckTimer=0,this.progressAnchorX=r,this.spawnCost=0,this.despawned=!1,this.canJumpGap=!!t.canJumpGap,this.paletteFrame=null,this.playAnimation(`idle`,{restart:!0}),this.spawnAnimation=this.resolveAnimation(`spawn`),this.spawnStateDuration=this.spawnAnimation?this.assets.getAnimation(this.sprite,this.spawnAnimation).frames.length/il.enemy.spawn.fps:.45,this.stateTimer=this.spawnStateDuration,this.spawnAnimation&&this.playAnimation(`spawn`,{restart:!0})}get isDamageable(){return!this.dead&&this.state!==`spawn`}get center(){return{x:this.x,y:this.y+this.height/2}}update(e,t,n,r){this.dead?this.deathTimer=Math.max(0,this.deathTimer-e):(this.prevX=this.x,this.prevY=this.y,this.hurtTimer=Math.max(0,this.hurtTimer-e),this.hazardCooldown=Math.max(0,this.hazardCooldown-e),this.flashTimer=Math.max(0,this.flashTimer-e),this.iframes=Math.max(0,this.iframes-e),this.spawnGrace=Math.max(0,this.spawnGrace-e),this.slowTimer=Math.max(0,this.slowTimer-e),this.slowTimer<=0&&(this.slowFactor=1),this.cooldown=Math.max(0,this.cooldown-e),this.bounceCooldown=Math.max(0,this.bounceCooldown-e),this.stepCooldown=Math.max(0,this.stepCooldown-e),this.contactCooldown=Math.max(0,this.contactCooldown-e),this.chooseAnimation(),this.hitstun>0?(this.hitstun-=e,this.applyPhysics(e,t),this.animator.update(e)):this.state===`spawn`?(this.stateTimer-=e,this.stateTimer<=0&&this.setState(`chase`),this.animator.update(e)):this.state===`windup`?(this.stateTimer-=e,this.vx=0,this.flying||this.applyPhysics(e,t),this.stateTimer<=0&&this.beginStrike(r,n),this.animator.update(e)):this.state===`strike`?(this.updateStrike(e,t,n,r),this.animator.update(e)):this.state===`recover`?(this.stateTimer-=e,this.flying?this.vx*=Math.max(0,1-5*e):this.applyPhysics(e,t),this.stateTimer<=0&&(this.cooldown=this.def.cooldown,this.setState(`chase`)),this.animator.update(e)):(this.updateChase(e,t,n,r),this.animator.update(e)))}setState(e){switch(this.state=e,e){case`chase`:this.stateTimer=0,this.attackFired=!1;break;case`windup`:this.stateTimer=this.def.windup,this.attackFired=!1,this.playAnimation(`attack`,{restart:!0}),this.events.push({type:`windup`,enemy:this});break;case`strike`:this.stateTimer=this.def.active,this.strikeHit=!1;break;case`recover`:this.stateTimer=this.def.recover}}updateChase(t,n,r,i){if(!r||r.dead){this.vx*=.8,this.applyPhysics(t,n);return}let a=r.x-this.x,o=r.y+r.height/2-(this.y+this.height/2),s=Math.abs(a),c=Math.abs(o);this.facing=a>=0?1:-1,this.pitJumpTimer>0?(this.pitJumpTimer-=t,this.vx=this.pitJumpDirection*e.enemyAI.pitJumpSpeed,this.applyPhysics(t,n),this.onGround&&(this.pitJumpTimer=0,this.pitBlockedTime=0,this.progressAnchorX=this.x,this.stuckTimer=0)):(this.behavior===`ranged`?this.updateRanged(t,n,r,a,s,c,i):this.behavior===`flyer`?this.updateFlyer(t,n,r,a,o,s,c):this.behavior===`teleporter`?this.updateTeleporter(t,n,r,s,c,i):this.behavior===`bouncer`?this.updateBouncer(t,n,r,a,s,c):this.updateGroundChase(t,n,r,a,s),this.handlePitEdge(t,n,r,a,i),this.dead||this.pitJumpTimer>0||(this.tryAttack(r,s,c)&&this.setState(`windup`),this.applyPhysics(t,n),this.trackProgress(t,r,i),this.checkContactDamage(r,i)))}trackProgress(t,n,r){if(this.flying||this.behavior===`ranged`||this.behavior===`teleporter`||this.isBoss||!n||n.dead)return;let i=Math.sign(n.x-this.x)||1;(this.x-this.progressAnchorX)*i>1.2?(this.progressAnchorX=this.x,this.stuckTimer=0):Math.abs(n.x-this.x)>80?(this.stuckTimer+=t,this.stuckTimer>=e.enemyAI.pitStuckSeconds&&r?.despawnEnemy?.(this,`noProgress`)):this.stuckTimer=0}updateGroundChase(t,n,r,i,a){if(a>600){this.vx*=.8;return}let o=g(i,-1,1)*this.speed*this.slowFactor;if(this.vx+=g(o-this.vx,-900*t,900*t),this.onGround&&this.stepCooldown<=0&&Math.abs(a)>8){let t=Math.sign(i)||this.facing||1,r=Math.floor(this.y/e.tile)+1,a=this.x+t*(this.width/2+3),o=Math.floor(a/e.tile),s=n.map.getType(o,r),c=n.map.getType(o,r+1),l=(r+1)*e.tile-this.y;n.map.isSolid(s)&&!n.map.isSolid(c)&&l>2&&l<=e.tile*2+2&&(this.vy=e.player.jumpSpeed*.8,this.vx=t*Math.max(this.speed,40),this.stepCooldown=e.enemyAI.stepCooldown)}}probeGap(n){let r=n.map,i=this.facing||1,a=this.x+i*(this.width/2+e.enemyAI.pitProbeTiles*4),o=r.getGroundYAtWorld(a,this.y+8);if(o!==null&&Math.abs(o-this.y)<=4)return{safe:!0,landing:null};let s=Math.min(e.enemyAI.pitMaxGapTiles,t.maxGapTiles);for(let t=1;t<=s+1;t++){let n=this.x+i*t*e.tile,a=r.getGroundYAtWorld(n,this.y+8);if(a!==null&&Math.abs(a-this.y)<=4)return{safe:!1,landing:{x:n,tiles:t-1}}}return{safe:!1,landing:null}}handlePitEdge(n,r,i,a,o){if(this.flying||this.isBoss||this.behavior===`teleporter`)return;let s=this.probeGap(r);if(s.safe){this.retreatTimer=0,this.pitEngaged&&(i&&Math.abs(i.x-this.x)<120?(this.pitEngaged=!1,this.pitBlockedTime=0):(this.pitBlockedTime+=n,this.pitBlockedTime>=e.enemyAI.pitStuckSeconds&&o?.despawnEnemy?.(this,`pitStuck`)));return}this.pitEngaged=!0,this.pitBlockedTime+=n;let c=Math.min(e.enemyAI.pitMaxGapTiles,t.maxGapTiles);if(this.canJumpGap&&s.landing&&s.landing.tiles<=c){let t=Math.sign(a)||this.facing||1;this.vx=t*e.enemyAI.pitJumpSpeed,this.vy=e.enemyAI.pitJumpHeight,this.pitJumpDirection=t,this.pitJumpTimer=.9,this.facing=t,this.onGround=!1,this.ridingPlatform=null,this.pitBlockedTime=0,this.pitEngaged=!1,this.events.push({type:`pitJump`,enemy:this})}else this.retreatTimer=Math.max(this.retreatTimer,e.enemyAI.pitRetreatSeconds),this.retreatTimer>0&&(this.retreatTimer-=n,this.vx=-Math.sign(a)*Math.max(this.speed,42)),this.pitBlockedTime>=e.enemyAI.pitStuckSeconds&&o?.despawnEnemy?.(this,`pitStuck`)}updateRanged(e,t,n,r,i,a,o){let s=this.def.preferredRange??130,c=this.speed*this.slowFactor;i<s-24?this.vx=-Math.sign(r)*c:i>s+28?this.vx=Math.sign(r)*c:this.vx*=.72,this.facing=r>=0?1:-1,a>64&&(this.vx=0)}updateFlyer(e,t,n,r,i,a,o){let s=n.y+n.height*.7+(this.def.hoverHeight??40),c=n.x-this.facing*12,l=s,u=this.speed*this.slowFactor;this.vx=g((c-this.x)*1.2,-u,u),this.vy=g((l-this.y)*1.1,-u,u),this.flyingPhase=(this.flyingPhase??Math.random()*6)+e;let d=Math.sin(this.flyingPhase*3+this.idlePhase)*10;this.x+=this.vx*e,this.y+=this.vy*e+d*e,this.stateTimer>0&&(this.stateTimer-=e),this.touchingPlayer=a<22&&o<34}updateTeleporter(e,t,n,r,i,a){if(this.cooldown<=0&&r<280&&r>55){let e=n.x-Math.sign(n.x-this.x)*36;this.events.push({type:`teleport`,enemy:this,fromX:this.x,toX:e,y:this.y}),this.x=e,this.cooldown=this.def.cooldown*1.4,this.iframes=.2,this.events.push({type:`teleportArrival`,enemy:this})}let o=n.x-this.x;this.vx=Math.abs(o)>30?Math.sign(o)*this.speed*this.slowFactor:0}updateBouncer(e,t,n,r,i,a){this.facing=r>=0?1:-1,this.onGround&&this.bounceCooldown<=0&&i<260&&(this.vy=this.def.jumpSpeed??220,this.vx=Math.sign(r)*Math.max(this.speed,Math.abs(r)*.65),this.onGround=!1,this.bounceCooldown=.8+Math.random()*.5)}tryAttack(e,t,n){return this.cooldown>0||this.state!==`chase`||this.behavior===`flyer`&&this.touchingPlayer?!1:t<=(this.behavior===`charger`||this.behavior===`ranged`||this.behavior,this.def.attackRange)&&n<=(this.flying?80:52)}beginStrike(e,t){this.setState(`strike`);let n=t?t.x-this.x:this.facing;if(this.facing=n>=0?1:-1,this.behavior===`charger`)this.vx=this.facing*this.def.chargeSpeed,this.events.push({type:`charge`,enemy:this});else if(this.behavior===`flyer`){let e=t?t.x-this.x:this.facing*60,n=t?t.y+t.height*.4-(this.y+this.height*.5):0,r=Math.hypot(e,n)||1;this.vx=e/r*this.def.diveSpeed,this.vy=n/r*this.def.diveSpeed,this.events.push({type:`dive`,enemy:this})}else this.behavior===`ranged`?(this.fireProjectile(e,t),this.attackFired=!0):this.behavior===`kamikaze`&&(this.explode(e,t),this.attackFired=!0)}updateStrike(n,r,i,a){if(this.stateTimer-=n,this.behavior===`charger`){if(this.onGround&&this.vx!==0){let n=this.probeGap(r);if(!n.safe){let r=Math.min(e.enemyAI.pitMaxGapTiles,t.maxGapTiles);if(this.canJumpGap&&n.landing&&n.landing.tiles<=r){this.vx=this.facing*e.enemyAI.pitJumpSpeed,this.vy=e.enemyAI.pitJumpHeight,this.pitJumpDirection=this.facing,this.pitJumpTimer=.9,this.onGround=!1,this.state=`chase`;return}this.vx=0,this.setState(`recover`);return}}this.vx=this.facing*this.def.chargeSpeed,this.applyPhysics(n,r),this.onGround}else this.behavior===`flyer`?(this.x+=this.vx*n,this.y+=this.vy*n,this.vx*=Math.max(0,1-2*n),this.vy*=Math.max(0,1-2*n)):(this.vx*=Math.max(0,1-10*n),this.applyPhysics(n,r));if(this.behavior===`charger`||this.behavior===`flyer`){if(!this.strikeHit&&i&&!i.dead){let e=this.getAttackHitbox();this.overlapsPlayer(i,e)&&(this.strikeHit=!0,a.combat.damagePlayer(this.damage,this,{element:this.def.deathEffect,heavy:this.behavior===`charger`}))}}else if(!this.attackFired){this.attackFired=!0;let e=this.getAttackHitbox();i&&!i.dead&&this.overlapsPlayer(i,e)&&a.combat.damagePlayer(this.damage,this,{element:this.def.deathEffect}),this.behavior===`kamikaze`&&this.explode(a,i)}this.stateTimer<=0&&this.setState(`recover`)}checkContactDamage(e,t){!e||e.dead||this.contactCooldown>0||this.state===`chase`&&this.behavior===`flyer`&&this.touchingPlayer&&(t.combat.damagePlayer(this.damage*.8,this,{element:`contact`}),this.contactCooldown=.7)}getAttackHitbox(){let e=this.behavior===`charger`||this.behavior===`flyer`?22:16,t=this.width+e;return{x:this.facing>0?this.x:this.x-t,y:this.y,w:t,h:this.height}}overlapsPlayer(e,t){let n=e.getBounds();return n.x<t.x+t.w&&n.x+n.w>t.x&&n.y<t.y+t.h&&n.y+n.h>t.y}fireProjectile(e,t){if(!t)return;let n=this.x+this.facing*16,r=this.y+this.height*.55,i=t.x-n,a=t.y+t.height*.45-r,o=Math.hypot(i,a)||1,s=this.def.projectileSpeed??150;this.events.push({type:`cast`,enemy:this}),e.projectiles.spawnHostile({x:n,y:r,vx:i/o*s,vy:a/o*s,damage:this.projectileDamage,color:[201,149,235],sprite:this.def.projectile??null,radius:6,life:2.8,source:this})}explode(e,t){if(t){let n=t.x-this.x,r=t.y+t.height/2-(this.y+this.height/2);Math.hypot(n,r)<42&&e.combat.damagePlayer(this.damage,this,{element:`fire`,heavy:!0})}this.events.push({type:`explode`,enemy:this}),this.die(e,{selfDestruct:!0})}applyPhysics(t,n){if(this.flying)return;let r=this.onGround;this.onGround=!1,this.vy-=e.player.gravity*t,this.vy=Math.max(this.vy,-e.player.maxFall),this.vx!==0&&n.map.moveX(this,this.vx*t)&&(this.vx=0,this.state===`strike`&&this.behavior===`charger`&&(this.stateTimer=0,this.setState(`recover`))),n.map.moveY(this,this.vy*t),this.onGround||=n.map.checkGround(this),r&&!this.onGround&&(this.vy=Math.max(this.vy,-20))}applySlow(e,t=.5){this.slowTimer=Math.max(this.slowTimer,e),this.slowFactor=Math.min(this.slowFactor,t)}hasGroundAhead(e,t){let n=e.map.getGroundYAtWorld(t,this.y+20);return n!==null&&Math.abs(n-this.y)<40}takeHit(t,n={}){if(!this.isDamageable)return 0;this.health-=t,this.flashTimer=e.combat.hitFlashDuration,this.lastHitAt=performance.now();let r=n.direction??1,i=n.knockback??60;return this.vx=r*i,this.flying||(this.vy=Math.max(this.vy,40)),this.hitstun=Math.max(this.hitstun,n.hitstun??.06),this.hurtTimer=Math.max(this.hurtTimer,il.enemy.hurt.duration),this.playAnimation(`hurt`,{restart:!0}),this.events.push({type:`hit`,enemy:this,amount:t,crit:n.crit}),this.health<=0?(this.die(n.game),t):(this.def.cooldown&&this.state!==`chase`||(this.cooldown=Math.max(this.cooldown,.35)),t)}die(e,t={}){this.dead||(this.dead=!0,this.state=`dead`,this.deathTimer=il.enemy.death.duration,this.vx=0,this.vy=0,this.events.push({type:`death`,enemy:this,selfDestruct:!!t.selfDestruct}),e&&e.onEnemyDefeated?.(this,t))}getRenderPosition(e){return{x:Math.round(this.prevX+(this.x-this.prevX)*e),y:Math.round(this.prevY+(this.y-this.prevY)*e)}}getBounds(){return{x:this.x-this.width/2,y:this.y,w:this.width,h:this.height}}resolveAnimation(e){let t={spawn:[`rise`],idle:this.flying?[`idle`,`float`,`walk`,`run`,`bounce`]:[`idle`,`walk`,`run`,`bounce`,`float`],walk:this.flying?[`float`,`idle`,`walk`,`run`,`bounce`]:[`walk`,`run`,`bounce`,`idle`,`float`],attack:this.flying?[`attack`,`cast`,`float`,`idle`,`walk`,`run`,`bounce`]:[`attack`,`cast`,`walk`,`run`,`bounce`,`idle`,`float`],hurt:[`hurt`,`idle`,`walk`,`float`,`bounce`,`cast`]};for(let n of t[e]??[])if(this.assets.getAnimation(this.sprite,n))return n;return null}playAnimation(e,{restart:t=!1}={}){let n=this.resolveAnimation(e);if(!n)return!1;let r=il.enemy[e]??il.enemy.walk;return this.animator.play(n,{restart:t,fps:r.fps,loop:r.loop,phase:r.loop?this.animationPhase:0})}chooseAnimation(){if(this.state===`spawn`&&this.spawnAnimation){this.playAnimation(`spawn`);return}if(this.hurtTimer>0){this.playAnimation(`hurt`);return}if(this.state===`windup`||this.state===`strike`){this.playAnimation(`attack`);return}let e=Math.abs(this.vx)>6;this.playAnimation(e?`walk`:`idle`)}consumeEvents(){let e=this.events.slice();return this.events.length=0,e}},sl=class{constructor(t){this.canvas=t,this.renderer=new Wc({canvas:t,antialias:!1,alpha:!0,powerPreference:`high-performance`,stencil:!1,depth:!0}),this.renderer.setPixelRatio(1),this.renderer.setSize(e.internalWidth,e.internalHeight,!1),this.renderer.outputColorSpace=at,this.renderer.toneMapping=0,this.renderer.autoClear=!0,this.renderer.setClearColor(0,0),this.scene=new zn,this.camera=new ma(-e.internalWidth/2,e.internalWidth/2,e.internalHeight/2,-e.internalHeight/2,.1,1e3),this.camera.position.set(0,0,500),this.zoom=1,this.stage=document.getElementById(`stage`),this.scale=1,this.quality=1,this.resize=this.resize.bind(this),window.addEventListener(`resize`,this.resize),this.resize()}resize(){let t=window.innerWidth,n=window.innerHeight,r=Math.max(1,Math.floor(Math.min(t/e.internalWidth,n/e.internalHeight)));this.scale=r,this.stage&&(this.stage.style.transform=`translate(-50%, -50%) scale(${r})`,this.stage.style.setProperty(`--ui-scale`,String(r)));let i=this.renderer.domElement;i.style.width=`${e.internalWidth}px`,i.style.height=`${e.internalHeight}px`,i.style.imageRendering=`pixelated`}setZoom(e){let t=Math.max(.5,Number(e)||1);this.zoom!==t&&(this.zoom=t,this.camera.zoom=t,this.camera.updateProjectionMatrix())}render(e,t,n){let r=e.getRenderPosition(t);this.camera.position.x=r.x,this.camera.position.y=r.y,this.camera.position.z=500,this.renderer.render(this.scene,this.camera)}add(e){this.scene.add(e)}remove(e){this.scene.remove(e)}clearScene(){for(;this.scene.children.length>0;){let e=this.scene.children[0];this.scene.remove(e),e.geometry?.dispose?.(),Array.isArray(e.material)?e.material.forEach(e=>e.dispose()):e.material?.dispose?.()}}getInfo(){return{calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,textures:this.renderer.info.memory.textures}}setQuality(e){this.quality=g(e,.5,1)}dispose(){window.removeEventListener(`resize`,this.resize),this.clearScene(),this.renderer.dispose()}},cl=class{constructor(){this.x=0,this.y=0,this.targetX=0,this.targetY=0,this.bounds={left:0,right:1e4,bottom:0,top:1e3},this.shakeAmount=0,this.shakeX=0,this.shakeY=0,this.shakeTime=0,this.shakeSetting=.7,this.lookAhead=e.camera.lookAhead,this.initialized=!1,this.zoom=1,this.verticalAnchor=`follow`}setBounds(e,t,n,r){this.bounds.left=e,this.bounds.right=t,this.bounds.bottom=n,this.bounds.top=r}setZoom(e){this.zoom=Math.max(.5,Number(e)||1)}setVerticalAnchor(e){this.verticalAnchor=e===`bottom`?`bottom`:`follow`}snapTo(e,t){this.x=e,this.y=t,this.targetX=e,this.targetY=t,this.initialized=!0}follow(t,n,r,i){let a=e.internalWidth/(2*this.zoom),o=e.internalHeight/(2*this.zoom),s=t+r*this.lookAhead,c=this.verticalAnchor===`bottom`?this.bounds.bottom+o:n+e.camera.offsetY;this.targetX=g(s,this.bounds.left+a,Math.max(this.bounds.left+a,this.bounds.right-a)),this.targetY=g(c,this.bounds.bottom+o,Math.max(this.bounds.bottom+o,this.bounds.top-o)),this.initialized?(this.x=v(this.x,this.targetX,e.camera.horizontalSmooth,i),this.y=v(this.y,this.targetY,e.camera.verticalSmooth,i)):(this.x=this.targetX,this.y=this.targetY,this.initialized=!0)}addShake(t){let n=t*this.shakeSetting;this.shakeAmount=Math.min(e.camera.shakeMax,Math.max(this.shakeAmount,n))}updateShake(t,n){if(this.shakeAmount=v(this.shakeAmount,0,e.camera.shakeDecay,t),this.shakeAmount<.15){this.shakeAmount=0,this.shakeX=0,this.shakeY=0;return}let r=n*43;this.shakeX=Math.round(Math.sin(r*1.7)*this.shakeAmount),this.shakeY=Math.round(Math.cos(r*2.3)*this.shakeAmount*.7)}getRenderPosition(e){return{x:Math.round(this.x+this.shakeX),y:Math.round(this.y+this.shakeY)}}setShakeSetting(e){this.shakeSetting=g(e,0,1)}},ll=`
  attribute vec2 iPosition;
  attribute vec2 iSize;
  attribute vec3 iColor;
  attribute float iAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 world = iPosition + position.xy * iSize;
    vColor = iColor;
    vAlpha = iAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
  }
`,ul=`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;function dl(e){let t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4}var Z={frost:[170,231,255],frostDeep:[92,157,206],blood:[181,53,55],ember:[236,139,70],bone:[210,195,165],shadow:[122,100,181],venom:[136,193,91],soul:[156,209,213],gold:[218,181,108],white:[240,230,210],mud:[123,128,78],stone:[123,113,95]},fl=class{constructor({scene:t,maxParticles:n=720,additive:r=!1}){this.maxParticles=n,this.particles=Array(n);for(let e=0;e<n;e++)this.particles[e]={x:0,y:0,vx:0,vy:0,gravity:0,drag:0,age:0,life:1,sizeX:1,sizeY:1,color:[1,1,1],alpha:1,active:!1};this.count=0,this.positions=new Float32Array(n*2),this.sizes=new Float32Array(n*2),this.colors=new Float32Array(n*3),this.alphas=new Float32Array(n);let i=new ha;i.setAttribute(`position`,new J([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),i.setAttribute(`uv`,new J([0,0,1,0,1,1,0,1],2)),i.setIndex([0,1,2,0,2,3]),i.setAttribute(`iPosition`,new oi(this.positions,2)),i.setAttribute(`iSize`,new oi(this.sizes,2)),i.setAttribute(`iColor`,new oi(this.colors,3)),i.setAttribute(`iAlpha`,new oi(this.alphas,1)),i.instanceCount=0,this.geometry=i,this.material=new Ii({vertexShader:ll,fragmentShader:ul,transparent:!0,depthTest:!0,depthWrite:!1,blending:r?2:1}),this.mesh=new ni(i,this.material),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e.rendering.layers.particles,this.mesh.visible=!1,t.add(this.mesh),this.additive=r}emit(e){if(this.count>=this.maxParticles)return null;let t=this.particles[this.count++];t.x=e.x??0,t.y=e.y??0,t.vx=e.vx??0,t.vy=e.vy??0,t.gravity=e.gravity??0,t.drag=e.drag??0,t.age=0,t.life=e.life??.5,t.sizeX=e.sizeX??e.size??2,t.sizeY=e.sizeY??e.size??2,t.endSize=e.endSize??0;let n=e.color??Z.white;return t.color[0]=dl(n[0]),t.color[1]=dl(n[1]),t.color[2]=dl(n[2]),t.alpha=e.alpha??1,t.active=!0,t}burst(e,t,n,r,i={}){let a=i.speed??60,o=i.spread??Math.PI*2,s=i.direction??0,c=i.life??.45,l=i.gravity??300,u=i.size??2,d=i.endSize??0,f=i.drag??1,p=e.length?e:[Z.white];for(let e=0;e<r;e++){let e=s+(Math.random()-.5)*o,r=a*(.25+Math.random()*.9);this.emit({x:t+(Math.random()-.5)*(i.radius??4),y:n+(Math.random()-.5)*(i.radius??4),vx:Math.cos(e)*r,vy:Math.sin(e)*r,gravity:l,drag:f,life:c*(.6+Math.random()*.8),sizeX:u*(.6+Math.random()*.8),sizeY:u*(.6+Math.random()*.8),endSize:d,color:p[Math.floor(Math.random()*p.length)],alpha:i.alpha??1})}}update(e){let t=0;for(let n=0;n<this.count;n++){let r=this.particles[n];if(r.age+=e,r.age>=r.life)this.swapRemove(n),n--;else{if(r.vy-=r.gravity*e,r.drag>0){let t=Math.max(0,1-r.drag*e);r.vx*=t,r.vy*=t}r.x+=r.vx*e,r.y+=r.vy*e,t++}}return this.writeRenderData(),t}swapRemove(e){let t=this.count-1;if(e!==t){let n=this.particles[e];this.particles[e]=this.particles[t],this.particles[t]=n}this.count--}writeRenderData(){for(let e=0;e<this.count;e++){let t=this.particles[e],n=t.age/t.life,r=1-n,i=t.endSize>0?t.sizeX+(t.endSize-t.sizeX)*n:t.sizeX*r,a=t.endSize>0?t.sizeY+(t.endSize-t.sizeY)*n:t.sizeY*r;this.positions[e*2]=Math.round(t.x),this.positions[e*2+1]=Math.round(t.y),this.sizes[e*2]=Math.max(1,i),this.sizes[e*2+1]=Math.max(1,a),this.colors[e*3]=t.color[0],this.colors[e*3+1]=t.color[1],this.colors[e*3+2]=t.color[2],this.alphas[e]=t.alpha*Math.min(1,(1-n)*2.5)}this.geometry.instanceCount=this.count,this.geometry.getAttribute(`iPosition`).needsUpdate=!0,this.geometry.getAttribute(`iSize`).needsUpdate=!0,this.geometry.getAttribute(`iColor`).needsUpdate=!0,this.geometry.getAttribute(`iAlpha`).needsUpdate=!0,this.mesh.visible=this.count>0}clear(){this.count=0,this.geometry.instanceCount=0,this.mesh.visible=!1}dispose(){this.mesh.removeFromParent(),this.geometry.dispose(),this.material.dispose()}},pl=class{constructor({assets:e,size:t=24}){this.assets=e,this.slots=Array.from({length:t},()=>({active:!1,animation:null,sprite:null,atlas:`gothic`,x:0,y:0,age:0,duration:0,frameIndex:0,fps:12,tint:null,alpha:1,flip:!1})),this.next=0}spawn({sprite:e,animation:t,x:n,y:r,fps:i=12,tint:a=null,alpha:o=1,flip:s=!1}){let c=this.assets.getAnimation(e,t);if(!c?.frames?.length)return null;let l=this.slots[this.next];return this.next=(this.next+1)%this.slots.length,l.active=!0,l.animation=c,l.sprite=e,l.atlas=this.assets.getSpriteAtlas(e),l.x=Math.round(n),l.y=Math.round(r),l.age=0,l.fps=Math.max(1,i),l.duration=c.frames.length/l.fps,l.frameIndex=0,l.tint=a,l.alpha=o,l.flip=s,l}update(e){for(let t of this.slots)t.active&&(t.age+=e,t.age>=t.duration?t.active=!1:t.frameIndex=Math.min(t.animation.frames.length-1,Math.floor(t.age*t.fps)))}render(e,t){for(let n of this.slots){if(!n.active||n.atlas!==t)continue;let r=n.animation.frames[n.frameIndex];r&&e.draw(r,n.x,n.y,{anchorY:.5,flip:n.flip,tint:n.tint??[1,1,1],alpha:n.alpha})}}clear(){for(let e of this.slots)e.active=!1;this.next=0}},ml={KeyA:`left`,ArrowLeft:`left`,KeyD:`right`,ArrowRight:`right`,KeyW:`jump`,ArrowUp:`jump`,Space:`jump`,KeyS:`down`,ArrowDown:`down`,KeyN:`nextZone`,KeyP:`prevZone`,ShiftLeft:`dash`,ShiftRight:`dash`,KeyJ:`attack`,KeyK:`heavy`,KeyL:`special`,KeyE:`interact`,Escape:`pause`,F3:`debug`,Digit1:`card1`,Digit2:`card2`,Digit3:`card3`,Enter:`confirm`},hl=new Set([`Space`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`F3`]),gl=class{constructor(e=window){this.target=e,this.down=new Set,this.pressed=new Set,this.released=new Set,this.enabled=!0,this.onFirstGesture=null,this._firstGestureFired=!1,this._keydown=e=>this.handleKeyDown(e),this._keyup=e=>this.handleKeyUp(e),this._blur=()=>this.clear(),this._gesture=()=>{this._firstGestureFired||(this._firstGestureFired=!0,this.onFirstGesture?.())},e.addEventListener(`keydown`,this._keydown),e.addEventListener(`keyup`,this._keyup),e.addEventListener(`blur`,this._blur),e.addEventListener(`pointerdown`,this._gesture),e.addEventListener(`keydown`,this._gesture,{once:!1})}handleKeyDown(e){let t=e.target;if(t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`||t.isContentEditable))return;hl.has(e.code)&&e.preventDefault();let n=ml[e.code];n&&(this.down.has(n)||this.pressed.add(n),this.down.add(n),this.onFirstGesture?.())}handleKeyUp(e){let t=ml[e.code];t&&(this.down.delete(t),this.released.add(t))}isDown(e){return this.enabled&&this.down.has(e)}wasPressed(e){return this.enabled&&this.pressed.has(e)}wasReleased(e){return this.enabled&&this.released.has(e)}getAxis(){let e=0;return this.isDown(`left`)&&--e,this.isDown(`right`)&&(e+=1),e}consume(e){this.pressed.delete(e)}clearPressed(){this.pressed.clear(),this.released.clear()}clear(){this.down.clear(),this.pressed.clear(),this.released.clear()}setEnabled(e){this.enabled=e,e||this.clear()}destroy(){this.target.removeEventListener(`keydown`,this._keydown),this.target.removeEventListener(`keyup`,this._keyup),this.target.removeEventListener(`blur`,this._blur),this.target.removeEventListener(`pointerdown`,this._gesture)}},_l=class{constructor({step:e=1/60,maxDelta:t=.25,maxSubSteps:n=6,update:r,render:i}){this.step=e,this.maxDelta=t,this.maxSubSteps=n,this.update=r,this.render=i,this.accumulator=0,this.lastTime=0,this.running=!1,this.rafId=0,this.fpsSamples=new Float32Array(60),this.fpsIndex=0,this.fpsAverage=60,this.frameMs=0,this.simMs=0,this.elapsed=0,this.tick=0,this._frame=e=>this.frame(e),this._visibility=()=>{this.lastTime=performance.now(),this.accumulator=0},document.addEventListener(`visibilitychange`,this._visibility)}start(){this.running||(this.running=!0,this.lastTime=performance.now(),this.rafId=requestAnimationFrame(this._frame))}stop(){this.running=!1,cancelAnimationFrame(this.rafId)}frame(e){if(!this.running)return;if(this.rafId=requestAnimationFrame(this._frame),document.hidden){this.lastTime=e,this.accumulator=0;return}let t=(e-this.lastTime)/1e3;this.lastTime=e,(!Number.isFinite(t)||t<0)&&(t=0),t=Math.min(t,this.maxDelta),this.frameMs=t*1e3;let n=t>0?1/t:60;this.fpsSamples[this.fpsIndex]=n,this.fpsIndex=(this.fpsIndex+1)%this.fpsSamples.length;let r=0;for(let e=0;e<this.fpsSamples.length;e++)r+=this.fpsSamples[e];this.fpsAverage=r/this.fpsSamples.length,this.accumulator+=t;let i=0,a=performance.now();for(;this.accumulator>=this.step&&i<this.maxSubSteps;)this.update(this.step),this.accumulator-=this.step,this.elapsed+=this.step,this.tick++,i++;i===this.maxSubSteps&&(this.accumulator=Math.min(this.accumulator,this.step)),this.simMs=performance.now()-a;let o=this.accumulator/this.step;this.render(o,t)}destroy(){this.stop(),document.removeEventListener(`visibilitychange`,this._visibility)}},vl=class{constructor(e,t,n,r=512){this.cellSize=n,this.cols=Math.ceil(e/n),this.rows=Math.ceil(t/n),this.heads=new Int32Array(this.cols*this.rows).fill(-1),this.next=new Int32Array(r).fill(-1),this.visited=new Uint32Array(r),this.stamp=1,this.maxEntities=r}clear(){this.heads.fill(-1)}cellIndex(e,t){return e<0||e>=this.cols||t<0||t>=this.rows?-1:t*this.cols+e}insert(e,t){if(e>=this.maxEntities)return;let n=Math.floor((t.x-t.width/2)/this.cellSize),r=Math.floor((t.x+t.width/2)/this.cellSize),i=Math.floor(t.y/this.cellSize),a=Math.floor((t.y+t.height)/this.cellSize);for(let t=i;t<=a;t++)for(let i=n;i<=r;i++){let n=this.cellIndex(i,t);n<0||(this.next[e]=this.heads[n],this.heads[n]=e)}}query(e,t,n,r,i){let a=Math.floor(e/this.cellSize),o=Math.floor((e+n)/this.cellSize),s=Math.floor(t/this.cellSize),c=Math.floor((t+r)/this.cellSize),l=++this.stamp;for(let e=s;e<=c;e++)for(let t=a;t<=o;t++){let n=this.cellIndex(t,e);if(n<0)continue;let r=this.heads[n];for(;r!==-1;)this.visited[r]!==l&&(this.visited[r]=l,i(r)),r=this.next[r]}}},yl=class{constructor({maxProjectiles:e=256,particles:t,glowParticles:n}){this.maxProjectiles=e,this.particles=t,this.glowParticles=n,this.items=Array(e);for(let t=0;t<e;t++)this.items[t]={active:!1,x:0,y:0,prevX:0,prevY:0,vx:0,vy:0,damage:0,radius:3,life:0,age:0,owner:`player`,element:`physical`,color:Z.white,trailColor:Z.frost,pierce:0,aoe:0,knockback:0,sprite:null,animTime:0,source:null,heavy:!1,evolved:!1,ricochet:0,hit:new Set,trailTimer:0,isEnemy:!1};this.count=0}acquire(){for(let e=0;e<this.maxProjectiles;e++)if(!this.items[e].active)return this.items[e];return null}spawnPlayer(e){let t=this.acquire();return t?(this.reset(t,e),t.owner=`player`,t.isEnemy=!1,t.damage=e.damage,t.pierce=e.pierce??0,t.aoe=e.aoe??0,t.element=e.element??`physical`,t.color=e.color??Z.frost,t.trailColor=e.trailColor??t.color,t.knockback=e.knockback??40,t.heavy=!!e.heavy,t.evolved=!!e.evolved,t.ricochet=e.ricochet??0,t.characterId=e.characterId??null,t.speed=e.vx,this.items.active=!0,t):null}spawnHostile(e){let t=this.acquire();return t?(this.reset(t,e),t.owner=`enemy`,t.isEnemy=!0,t.damage=e.damage,t.sprite=e.sprite??null,t.radius=e.radius??6,t.source=e.source??null,t.color=e.color??Z.soul,this.spawnBurst(e.x,e.y,t.color),t):null}reset(e,t){e.active=!0,e.x=t.x,e.y=t.y,e.prevX=e.x,e.prevY=e.y,e.vx=t.vx,e.vy=t.vy??0,e.life=t.life??1,e.age=0,e.radius=t.radius??3,e.hit.clear(),e.trailTimer=0,e.animTime=0,e.sprite=t.sprite??null,e.pierce=0,e.aoe=0,e.ricochet=0,e.element=`physical`,e.color=t.color??Z.white,e.owner=`player`,e.isEnemy=!1,e.source=null,e.heavy=!1,e.evolved=!1,e.characterId=null,e.knockback=0}update(t,n){let r=n.activeWorld,i=n.player,a=n.enemies,o=n.spatialHash;for(let s=0;s<this.maxProjectiles;s++){let c=this.items[s];if(c.active){if(c.age+=t,c.prevX=c.x,c.prevY=c.y,c.x+=c.vx*t,c.y+=c.vy*t,c.animTime+=t,c.sprite?(c.trailTimer-=t,c.trailTimer<=0&&(c.trailTimer=.045,this.emitTrail(c,!0))):(c.trailTimer-=t,c.trailTimer<=0&&(c.trailTimer=.032,this.emitTrail(c,!1))),c.age>=c.life)this.expire(c,n);else if(c.x<0||c.x>r.width*e.tile||c.y<e.world.fallDeathY||c.y>r.height*e.tile)c.active=!1;else if(r.map.pointHitsSolid(c.x,c.y)){let t=Math.floor(c.x/e.tile),i=Math.floor(c.y/e.tile);!c.isEnemy&&r.map.getType(t,i)===4&&n.combatDirector.breakTileAt(t,i,c.x,c.y),this.impact(c,n,null)}else if(c.isEnemy){if(i&&!i.dead){let e=i.getBounds();if(c.x+c.radius>e.x&&c.x-c.radius<e.x+e.w&&c.y+c.radius>e.y&&c.y-c.radius<e.y+e.h){n.combat.damagePlayer(c.damage,c.source,{element:c.element,projectile:!0}),this.impact(c,n,null);continue}}}else if(o){let e=c.x-c.radius,t=c.y-c.radius,r=c.radius*2,i=c.radius*2,s=!1;if(o.query(e,t,r,i,e=>{if(s)return;let t=a[e];if(!t||t.dead||c.hit.has(e))return;let r=t.getBounds();c.x+c.radius>r.x&&c.x-c.radius<r.x+r.w&&c.y+c.radius>r.y&&c.y-c.radius<r.y+r.h&&(c.hit.add(e),n.combat.damageEnemy(t,c.damage,{direction:Math.sign(c.vx)||1,knockback:c.knockback,element:c.element,critBonus:0,projectile:c,heavy:c.heavy,sourceX:c.x,sourceY:c.y}),this.emitHit(c,c.x,c.y),c.evolved&&c.characterId===`seraphine`&&t.applySlow?.(1.4,.45),c.aoe>0&&n.combat.areaDamage(c.x,c.y,c.aoe,c.damage*.7,{direction:Math.sign(c.vx)||1,knockback:c.knockback*.5,element:c.element,exclude:c.hit}),s=!0,c.pierce>0?c.pierce--:c.shouldDie=!0)}),c.shouldDie){if(c.shouldDie=!1,c.ricochet>0){let e=n.findNearestEnemy(c.x,c.y,100,c.hit);if(e){c.ricochet--,c.hit.clear();let t=e.x-c.x,n=e.y+e.height/2-c.y,r=Math.hypot(t,n)||1,i=Math.hypot(c.vx,c.vy);c.vx=t/r*i,c.vy=n/r*i;continue}}this.impact(c,n,null)}}}}}emitTrail(e,t){let n=e.isEnemy?[Z.soul,Z.shadow]:[e.color,e.trailColor],r=t?2:e.heavy?3:2;if(!t){let t=Math.abs(e.vx)>=Math.abs(e.vy);this.glowParticles?.emit({x:e.x,y:e.y,vx:0,vy:0,gravity:0,drag:0,life:.06,sizeX:t?e.heavy?9:7:2,sizeY:t?2:e.heavy?9:7,color:Z.white,alpha:.95})}this.glowParticles?.emit({x:e.x,y:e.y,vx:-e.vx*.04+(Math.random()-.5)*8,vy:-e.vy*.04+(Math.random()-.5)*8,gravity:0,drag:2,life:t?.15:.22,sizeX:r,sizeY:r,color:n[Math.floor(Math.random()*n.length)],alpha:.55}),t||this.particles?.emit({x:e.x+(Math.random()-.5)*2,y:e.y+(Math.random()-.5)*2,vx:-e.vx*.06,vy:(Math.random()-.5)*12,gravity:40,drag:1.5,life:.28,sizeX:1,sizeY:Math.random()<.3?4:1,color:e.trailColor,alpha:.8})}emitHit(e,t,n){this.glowParticles?.burst([e.color,Z.white,e.trailColor],t,n,8,{speed:65,spread:Math.PI*2,life:.22,gravity:20,drag:3,size:2,endSize:0}),this.particles?.burst([e.trailColor,e.color],t,n,4,{speed:40,spread:Math.PI*2,life:.32,gravity:140,drag:1,size:1})}spawnBurst(e,t,n){this.glowParticles?.burst([n,Z.white],e,t,6,{speed:35,spread:Math.PI*2,life:.2,gravity:0,drag:2,size:1})}impact(e,t,n){e.active&&=(e.aoe>0&&!e.isEnemy&&t.combat.areaDamage(e.x,e.y,e.aoe,e.damage*.7,{direction:Math.sign(e.vx)||1,knockback:e.knockback*.4,element:e.element,exclude:e.hit}),e.isEnemy&&this.glowParticles?.burst([e.color,Z.soul],e.x,e.y,6,{speed:40,life:.25,gravity:30,drag:1,size:2}),!1)}expire(e,t){e.aoe>0&&!e.isEnemy&&t.combat.areaDamage(e.x,e.y,e.aoe,e.damage*.7,{direction:Math.sign(e.vx)||1,knockback:e.knockback*.4,element:e.element,exclude:e.hit}),e.active=!1}render(e,t,n){for(let r of this.items){if(!r.active||!r.sprite)continue;let i=t.getAnimation(r.sprite,`fly`);if(!i)continue;let a=i.frames[Math.floor(r.animTime*i.fps%i.frames.length)],o=Math.round(r.prevX+(r.x-r.prevX)*n),s=Math.round(r.prevY+(r.y-r.prevY)*n);e.draw(a,o,s,{anchorY:.5,anchorX:.5,tint:r.isEnemy?[1.25,.8,1.4]:[1.2,1.2,1.3]})}}getActiveCount(){let e=0;for(let t of this.items)t.active&&e++;return e}clear(){for(let e of this.items)e.active=!1}},bl={cemetery:{sprite:`cemetery_death`,animation:`burst`,fps:16},dungeon:{sprite:`cemetery_death`,animation:`burst`,fps:16},church:{sprite:`death_burst`,animation:`burst`,fps:14},swamp:{sprite:`swamp_death`,animation:`burst`,fps:14},forest:{sprite:`cemetery_death`,animation:`burst`,fps:16,tint:[.58,.9,.68]}},xl={bone:Z.bone,ember:Z.ember,soul:Z.soul,fire:Z.ember,frost:Z.frost,venom:Z.venom,mud:Z.mud,shadow:Z.shadow},Sl=class{constructor({game:e,particles:t,glowParticles:n,audio:r,ui:i}){this.game=e,this.particles=t,this.glowParticles=n,this.audio=r,this.ui=i,this.rng=new h(f(e.seed??1,`combat`))}setSeed(e){this.rng=new h(f(e,`combat`))}damageEnemy(t,n,r={}){if(!t||t.dead||!t.isDamageable)return 0;let i=this.game.player;if(!i)return 0;let a=r.crit??this.rng.chance(i.stats.critChance),o=Math.max(1,n*(a?i.stats.critDamage:1)),s=t.takeHit(o,{direction:r.direction??(Math.sign(t.x-(r.sourceX??i.x))||1),knockback:(r.knockback??60)*(a?1.3:1),crit:a,game:this.game,element:r.element??`physical`});if(s>0&&(this.game.player.evolved&&this.game.player.characterId===`brakk`&&this.game.player.heal(s*.075),this.onHitFeedback(t,s,a,r),r.noHitstop!==!0)){let t=a?e.combat.hitstopCrit:r.heavy?e.combat.hitstopHeavy:e.combat.hitstopNormal;this.game.addHitstop(t)}return s}onHitFeedback(e,t,n,r){let i=r.element===`frost`?Z.frost:e.def.deathEffect===`shadow`?Z.shadow:Z.gold,a=r.sourceY??e.y+Math.min(e.height*.6,22),o=r.sourceX??e.x-Math.sign(e.x-(this.game.player?.x??0))*4;this.glowParticles.emit({x:o,y:a,vx:0,vy:0,life:.09,sizeX:n?15:10,sizeY:n?15:10,endSize:0,color:n?Z.white:i,alpha:.85}),this.particles.burst([i,Z.bone,Z.white],o,a,n?16:8,{speed:n?105:70,spread:Math.PI*2,life:n?.42:.28,gravity:240,drag:1.2,size:n?2.6:2,radius:5}),this.glowParticles.burst([i,Z.white],o,a,n?12:5,{speed:n?130:75,spread:Math.PI*2,life:.22,gravity:20,drag:3,size:1.5}),this.game.camera.addShake(n?3.4:r.heavy?2.4:1.2),this.ui?.spawnDamageNumber(e.x+(Math.random()-.5)*8,e.y+e.height,Math.round(t),n?`crit`:`normal`),this.audio.play(n?`crit`:`hit`,{pitch:.9+Math.random()*.22})}damagePlayer(t,n=null,r={}){let i=this.game.player;if(!i||i.dead)return 0;let a=i.health,o=i.takeDamage(t,n);return o>0&&(i.vx=(n&&Math.sign(i.x-n.x)||1)*e.player.knockbackX,i.vy=Math.max(i.vy,e.player.knockbackY),this.game.camera.addShake(r.heavy?4.5:2.6),this.game.addHitstop(2),this.game.boss&&!this.game.boss.dead&&(this.game.bossDamageTaken+=o)),{actual:o,before:a}}areaDamage(t,n,r,i,a={}){let o=this.game;if(!o.spatialHash)return;let s=0,c=!1;o.spatialHash.query(t-r,n-r,r*2,r*2,e=>{if(a.exclude?.has(e))return;let l=o.enemies[e];if(!l||l.dead)return;let u=l.x-t,d=l.y+l.height/2-n;if(u*u+d*d>(r+l.width*.5)**2)return;let f=l.health;this.damageEnemy(l,i,{...a,noHitstop:!0,sourceX:t,sourceY:n})>0&&f>0&&(s++,c||=l.flashTimer>0)}),s>0&&(o.addHitstop(c?e.combat.hitstopCrit:e.combat.hitstopHeavy),o.camera.addShake(2.2+Math.min(3,s*.25)),this.glowParticles.burst([Z.frost,Z.violet??Z.shadow,Z.white],t,n,12+s*2,{speed:140,spread:Math.PI*2,life:.35,gravity:0,drag:2.2,size:2}))}enemyDeath(e){let t=e.animator.frame,n=this.game.assets.getSpriteAtlas(e.sprite??e.data?.sprite),r=this.game.assets.getPalette(n,t,8),i=xl[e.def.deathEffect]??Z.bone,a=e.x,o=e.y+e.height*.55,s=[...r,i];e.def.deathEffect===`soul`||e.def.deathEffect===`frost`?this.glowParticles.burst(s,a,o,24,{speed:55,spread:Math.PI,direction:Math.PI/2,life:.8,gravity:-18,drag:1.5,size:2.5,endSize:.5}):e.def.deathEffect===`ember`||e.def.deathEffect===`fire`?this.glowParticles.burst(s,a,o,30,{speed:130,spread:Math.PI*2,life:.6,gravity:80,drag:1.8,size:2.7,endSize:.4}):e.def.deathEffect===`venom`||e.def.deathEffect===`mud`?this.particles.burst(s,a,o,28,{speed:95,spread:Math.PI*2,life:.65,gravity:360,drag:.8,size:2.2}):this.particles.burst(s,a,o,30,{speed:110,spread:Math.PI*2,life:.7,gravity:330,drag:.8,size:2.2}),this.glowParticles.emit({x:a,y:o,vx:0,vy:0,life:.14,sizeX:22,sizeY:22,endSize:0,color:i,alpha:.6});let c=bl[this.game.activeZoneId]??bl.cemetery;this.game.effects?.spawn({...c,x:a,y:o,flip:e.facing<0}),this.audio.play(`enemyDeath`,{volume:e.elite?1.25:1}),this.game.camera.addShake(e.elite?4:1.5)}meleeArc({x:e,y:t,facing:n,range:r,height:i,color:a,heavy:o}){let s=o?26:14,c=n>0?-.6:Math.PI+.6,l=n>0?1.4:-1.4;for(let n=0;n<s;n++){let i=n/(s-1),u=c+l*i,d=r*(.55+.45*Math.sin(i*Math.PI));this.glowParticles.emit({x:e+Math.cos(u)*d,y:t+16+Math.sin(u)*d*.55,vx:Math.cos(u)*(o?45:22),vy:Math.sin(u)*(o?35:18),gravity:0,drag:2.5,life:.16+i*.08,sizeX:o?3:2,sizeY:1,color:a,alpha:.75})}this.particles.burst([a,Z.white],e+n*r*.4,t+i*.5,o?12:6,{speed:80,spread:1.2,direction:n>0?0:Math.PI,life:.25,gravity:80,size:1.5})}shockwave({x:e,y:t,color:n,heavy:r}){for(let i=0;i<18;i++){let a=i/18*Math.PI*2;this.glowParticles.emit({x:e,y:t+12,vx:Math.cos(a)*(r?150:100),vy:Math.abs(Math.sin(a))*40,gravity:0,drag:2.2,life:.35,sizeX:2,sizeY:2,color:n,alpha:.7})}}},Cl=class{constructor(e){this.game=e,this.rng=new h(1),this.budget=0,this.maxActive=10,this.spawnTimer=0,this.eventTimer=0,this.event=null,this.budgetScale=1,this.lowFpsTime=0,this.recoveryTime=0,this.lastPhase=null,this.zoneId=`cemetery`}reset(e,t){this.rng=new h(f(e,`spawns`,t)),this.zoneId=t,this.budget=2.5,this.spawnTimer=.2,this.eventTimer=tl(0).eventInterval||70,this.event=null,this.budgetScale=1,this.lowFpsTime=0,this.recoveryTime=0,this.lastPhase=tl(this.game.run?.elapsed??0).id}get activeCount(){return this.game.enemies?.length??0}update(e){let t=this.game;if(t.peaceful||!t.player||!t.activeWorld||t.activeWorld.noAmbientSpawns||t.boss&&!t.boss.dead)return;let n=t.activeWorld.arena;if(n&&t.player.x>n.left&&t.player.x<n.right)return;let r=t.run.elapsed,i=tl(r);if(this.lastPhase!==i.id){this.lastPhase=i.id;let e=t.activeZone?.phaseKeys?.[i.id]??i.labelKey;t.ui?.toast(e,{},{icon:`☠`,duration:1600})}this.updateAdaptive(e),this.event?(this.event.timer-=e,this.event.timer<=0&&(this.event=null)):(this.eventTimer-=e,this.eventTimer<=0&&i.events?.length&&(this.eventTimer=i.eventInterval,this.triggerEvent(i)));let a=this.event?.budgetMultiplier??1,o=this.event?.maxAdd??0,s=this.event?.eliteBonus??0;if(this.maxActive=Math.max(4,Math.round((i.maxActive+o)*this.budgetScale)),this.activeCount>=this.maxActive){this.budget=Math.min(this.budget,4);return}if(this.budget+=i.spawnBudgetPerSecond*a*this.budgetScale*e,this.spawnTimer-=e,this.spawnTimer>0||this.budget<=0)return;this.spawnTimer=.26;let c=i.eliteChance+s*.22,l=this.rng.chance(c),u=l?this.pickElite(i):this.pickEnemy(i);if(!u)return;let d=this.getCost(u)*(l?1.4:1);if(this.budget<d)return;let f=this.findSpawnPosition(u,i);f&&(this.budget-=d,t.spawnEnemy(u,f.x,f.y,{health:i.hpScale*this.timeHealthScale(r),damage:i.damageScale*this.timeDamageScale(r),speed:i.speedScale,elite:l}))}refund(e){let t=Number(e);Number.isFinite(t)&&t>0&&(this.budget+=t)}timeHealthScale(e){return e<600?1:1+(e-600)/60*el.timeScale.hpPerMinuteAfter10}timeDamageScale(e){return e<600?1:1+(e-600)/60*el.timeScale.damagePerMinuteAfter10}updateAdaptive(e){let t=el.adaptive;if(!t.enabled)return;let n=this.game.loop.fpsAverage;n<t.lowFps&&this.activeCount>12?(this.lowFpsTime+=e,this.lowFpsTime>1.5&&(this.budgetScale=g(this.budgetScale-t.step,t.minBudgetScale,1),this.lowFpsTime=0,this.recoveryTime=t.recoveryDelay)):n>t.highFps&&(this.lowFpsTime=0,this.recoveryTime>0?this.recoveryTime-=e:this.budgetScale=g(this.budgetScale+t.step*.5,t.minBudgetScale,1))}countSameTypeOnScreen(t){let n=this.game,r=n.player;if(!r)return 0;let i=e.internalWidth/2,a=0;for(let e of n.enemies??[])e.dead||e.isBoss||e.id!==t||Math.abs(e.x-r.x)<=i&&a++;return a}isTypeAtCrowdLimit(t){return this.countSameTypeOnScreen(t)>=e.enemyAI.crowd.maxSameTypePerScreen}pickEnemy(e){let t=this.game.activeZone,n=t.enemyPool.filter(t=>e.pool.includes(t)),r=(n.length?n:t.enemyPool).filter(e=>!this.isTypeAtCrowdLimit(e));if(!r.length)return null;let i=r.map(e=>({value:e,weight:r.filter(t=>t===e).length}));return this.rng.weighted(i)}pickElite(e){let t=this.game.activeZone,n=t.elitePool.filter(t=>e.pool.includes(t)),r=t.elitePool,i=(n.length?n:r).filter(e=>!this.isTypeAtCrowdLimit(e));return i.length?this.rng.pick(i):null}getCost(e){return this.game.getEnemyCost(e)}findSpawnPosition(t,n){let r=this.game,i=r.player,a=r.activeWorld,o=r.getEnemyDef(t);if(!o||this.isTypeAtCrowdLimit(t))return null;let s=this.rng.chance(.5)?-1:1,c=e.internalWidth/2+40+this.rng.float(0,170),l=[s,-s];for(let t of l)for(let n=0;n<8;n++){let r=i.x+t*(c+n*40);if(r<32||r>a.width*e.tile-32||a.interactions.some(t=>t.type===`chest`&&Math.abs(t.x-r)<4*e.tile))continue;let s=this.findGround(a,r,a.surface);if(s===null||!o.flying&&!this.isBaseFloorSpawn(a,r,s))continue;let l=Math.floor(r/e.tile);if(!a.map.isStandableTile(l,Math.ceil(s/e.tile)))continue;let u=o.flying?s+38+this.rng.float(0,80):s;if(!(o.flying&&u<s+20))return{x:r,y:u}}return null}isBaseFloorSpawn(t,n,r){if(Math.abs(r-t.surface)>.5)return!1;let i=t.map,a=Math.floor(n/e.tile);for(let e=-1;e<=1;e++)if(!i.isSolidAt(a+e,i.surfaceRow))return!1;return!0}findGround(t,n,r=t.surface){let i=Math.min(t.height-2,Math.floor(r/e.tile)+14);return t.map.getGroundYAtWorld(n,i*e.tile)}triggerEvent(e){if(!e.events.length)return;let t=this.rng.pick(e.events),n=el.events[t];n&&(this.event={type:t,timer:n.duration,budgetMultiplier:n.budgetMultiplier,maxAdd:n.maxAdd,eliteBonus:n.eliteBonus??0},this.game.ui?.toast(n.nameKey,{},{icon:`☠`,achievement:!0}),this.game.audio.play(t===`surge`?`boss`:`elite`),t===`elite_pack`?this.spawnElitePack(e):t===`ambush`&&this.spawnAmbush(e,4))}spawnAmbush(e,t){for(let n=0;n<t;n++){let t=this.pickEnemy(e);if(!t)continue;let n=this.findSpawnPosition(t,e);n&&this.game.spawnEnemy(t,n.x,n.y,{health:e.hpScale,damage:e.damageScale,speed:e.speedScale})}}spawnElitePack(e){let t=2+this.rng.int(0,2);for(let n=0;n<t;n++){let t=this.pickElite(e);if(!t)continue;let n=this.findSpawnPosition(t,e);n&&this.game.spawnEnemy(t,n.x,n.y,{health:e.hpScale,damage:e.damageScale,speed:e.speedScale,elite:!0})}}},wl=`
  attribute vec2 iPosition;
  attribute vec2 iSize;
  attribute vec3 iColor;
  attribute float iAlpha;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 world = iPosition + position.xy * iSize;
    vUv = uv;
    vColor = iColor;
    vAlpha = iAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
  }
`,Tl=`
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 p = vUv - 0.5;
    float diamond = abs(p.x) + abs(p.y);
    if (diamond > 0.5) discard;
    float edge = smoothstep(0.34, 0.51, diamond);
    vec3 color = mix(vec3(1.0), vColor, edge);
    float core = 1.0 - smoothstep(0.0, 0.18, diamond);
    color = mix(color, vec3(1.0), core * 0.45);
    gl_FragColor = vec4(color, vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;function El(e){return e.map(e=>{let t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4})}var Dl=class{constructor({scene:t,particles:n,glowParticles:r,maxOrbs:i=220}){this.maxOrbs=i,this.orbs=Array(i);for(let e=0;e<i;e++)this.orbs[e]={active:!1,x:0,y:0,vx:0,vy:0,value:0,age:0,life:30,phase:0,size:4,color:Z.soul,attracted:!1};this.particles=n,this.glowParticles=r,this.count=0,this.positions=new Float32Array(i*2),this.sizes=new Float32Array(i*2),this.colors=new Float32Array(i*3),this.alphas=new Float32Array(i);let a=new ha;a.setAttribute(`position`,new J([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),a.setAttribute(`uv`,new J([0,0,1,0,1,1,0,1],2)),a.setIndex([0,1,2,0,2,3]),a.setAttribute(`iPosition`,new oi(this.positions,2)),a.setAttribute(`iSize`,new oi(this.sizes,2)),a.setAttribute(`iColor`,new oi(this.colors,3)),a.setAttribute(`iAlpha`,new oi(this.alphas,1)),a.instanceCount=0,this.geometry=a,this.material=new Ii({vertexShader:wl,fragmentShader:Tl,transparent:!0,depthTest:!0,depthWrite:!1,blending:2}),this.mesh=new ni(a,this.material),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e.rendering.layers.orbs,this.mesh.visible=!1,t.add(this.mesh),this.rng=new h(f(1,`xp`)),this.gainHandler=null}setSeed(e){this.rng=new h(f(e,`xp`))}acquire(){for(let e=0;e<this.maxOrbs;e++)if(!this.orbs[e].active)return this.orbs[e];return null}spawn(e,t,n,{big:r=!1,burst:i=!0}={}){let a=this.acquire();return a?(a.active=!0,a.x=t+(this.rng.next()-.5)*10,a.y=n+10+this.rng.next()*8,a.vx=i?(this.rng.next()-.5)*80:0,a.vy=i?70+this.rng.next()*70:0,a.value=e,a.age=0,a.life=28,a.phase=this.rng.next()*Math.PI*2,a.size=r?7:4,a.color=r?Z.gold:Z.soul,a.attracted=!1,a.grounded=!1,a):null}spawnFromEnemy(e,t,n){let r=n>=30?3:n>=15?2:1,i=Math.max(1,Math.round(n/r));for(let n=0;n<r;n++)this.spawn(i,e,t,{big:i>=20})}update(t,n,r,i){this.gainHandler=i;for(let a of this.orbs){if(!a.active)continue;if(a.age+=t,a.age>=a.life){a.active=!1;continue}let o=n.x-a.x,s=n.y+n.height*.45-a.y,c=Math.hypot(o,s),l=n.magnetRange??e.power.magnetRangeBase;if(c<l){a.attracted=!0;let n=e.combat.xpMagnetSpeed*(1-g(c/l,0,.9)*.4),r=c||1;a.x+=o/r*n*t,a.y+=s/r*n*t}else if(a.attracted=!1,a.grounded)a.y+=Math.sin((a.age+a.phase)*4)*6*t;else{a.vy-=800*t,a.x+=a.vx*t,a.y+=a.vy*t,a.vx*=Math.max(0,1-3*t);let e=r.getGroundYAtWorld(a.x,a.y+8);e!==null&&a.y<=e+1&&(a.y=e+1,a.vy=0,a.vx=0,a.grounded=!0)}c<n.width/2+6&&(a.active=!1,i(a.value,a),this.glowParticles.burst([a.color,Z.white],a.x,a.y,7,{speed:40,spread:Math.PI*2,life:.25,gravity:-40,drag:2,size:1.5}),a.active=!1)}this.render()}render(){let e=0;for(let t of this.orbs){if(!t.active)continue;let n=e*2,r=e*3,i=t.grounded?Math.sin((t.age+t.phase)*5)*3:0;this.positions[n]=Math.round(t.x),this.positions[n+1]=Math.round(t.y+i),this.sizes[n]=t.size,this.sizes[n+1]=t.size*1.35;let a=El(t.color);this.colors[r]=a[0],this.colors[r+1]=a[1],this.colors[r+2]=a[2],this.alphas[e]=g((t.life-t.age)/2,0,1)*(.55+.45*Math.abs(Math.sin((t.age+t.phase)*3))),e++}this.count=e,this.geometry.instanceCount=e,this.geometry.getAttribute(`iPosition`).needsUpdate=!0,this.geometry.getAttribute(`iSize`).needsUpdate=!0,this.geometry.getAttribute(`iColor`).needsUpdate=!0,this.geometry.getAttribute(`iAlpha`).needsUpdate=!0,this.mesh.visible=e>0}clear(){for(let e of this.orbs)e.active=!1;this.geometry.instanceCount=0,this.mesh.visible=!1}dispose(){this.mesh.removeFromParent(),this.geometry.dispose(),this.material.dispose()}},Ol=[{id:`first_blood`,nameKey:`achievement.firstBlood.name`,descKey:`achievement.firstBlood.desc`,icon:`†`,condition:{type:`kills`,target:1},reward:1},{id:`hundred_souls`,nameKey:`achievement.hundredSouls.name`,descKey:`achievement.hundredSouls.desc`,icon:`☠`,condition:{type:`kills`,target:100},reward:2},{id:`shardbearer`,nameKey:`achievement.shardbearer.name`,descKey:`achievement.shardbearer.desc`,icon:`◆`,condition:{type:`shards`,target:1},reward:1},{id:`maw_silenced`,nameKey:`achievement.mawSilenced.name`,descKey:`achievement.mawSilenced.desc`,icon:`◉`,condition:{type:`boss`,target:`mourning_maw`},reward:2},{id:`ashfall`,nameKey:`achievement.ashfall.name`,descKey:`achievement.ashfall.desc`,icon:`✦`,condition:{type:`boss`,target:`seraph_ash`},reward:2},{id:`ascendant`,nameKey:`achievement.ascendant.name`,descKey:`achievement.ascendant.desc`,icon:`▲`,condition:{type:`level`,target:10},reward:2},{id:`first_evolution`,nameKey:`achievement.firstEvolution.name`,descKey:`achievement.firstEvolution.desc`,icon:`✶`,condition:{type:`evolution`,target:1},reward:3},{id:`treasure_hunter`,nameKey:`achievement.treasureHunter.name`,descKey:`achievement.treasureHunter.desc`,icon:`▣`,condition:{type:`chests`,target:5},reward:2},{id:`survivor`,nameKey:`achievement.survivor.name`,descKey:`achievement.survivor.desc`,icon:`⧗`,condition:{type:`time`,target:600},reward:3},{id:`untouched`,nameKey:`achievement.untouched.name`,descKey:`achievement.untouched.desc`,icon:`❂`,condition:{type:`bossNoHit`,target:1},reward:4}],kl=Object.fromEntries(Ol.map(e=>[e.id,e])),Al={"game.title":`HELLSHARD`,"game.tagline":`A dark fantasy descent`,"game.loading":`Forging the abyss…`,"game.assets":`Gathering the dead`,"game.version":`v{version}`,"menu.start":`Begin the Descent`,"menu.startHint":`Choose your vessel`,"menu.rule":`Two shards · two wardens · no return`,"menu.ledger":`Descent ledger`,"menu.protocol":`Descent protocol`,"menu.ready":`Ready`,"menu.fragments":`Two fragments wake the shard`,"menu.hellshards":`Hellshards`,"menu.best":`Best descent`,"menu.runs":`Descents`,"menu.zones":`Zones seen`,"menu.originalWork":`MIT licensed · JAYNUS`,"menu.tip":`Two wardens hold the shards. Break them both and the descent ends.`,"menu.creditsHint":`Sources & license`,"menu.continue":`Resume Run`,"menu.achievements":`Achievements`,"menu.settings":`Settings`,"menu.credits":`Credits`,"menu.controls":`Controls`,"menu.seed":`World Seed`,"menu.seedHint":`Same seed, same grave.`,"menu.footer":`WASD / Arrows to move  ·  J attack  ·  K heavy  ·  L ability`,"menu.shards":`Hellshards: {count}`,"menu.lockedTooltip":`Unlock this character from the roster.`,"menu.subtitle":`The dead remember every step.`,"menu.enter":`Awaken`,"menu.reroll":`Randomize Seed`,"menu.newSeed":`New Seed`,"menu.meta":`Crypt of Memory`,"menu.difficulty":`The abyss deepens with time.`,"char.select.title":`Choose Your Vessel`,"char.select.subtitle":`The shard answers to one soul at a time.`,"char.select.kicker":`Vessel selection`,"char.select.roster":`Roster`,"char.select.hint":`A/D or 1–4 to choose · Enter to descend`,"char.select.start":`Descend`,"char.select.back":`Back`,"char.select.locked":`Sealed`,"char.select.unlock":`Unseal — {cost} ◆`,"char.select.notEnough":`Not enough Hellshards`,"char.select.selected":`Chosen`,"char.select.stat.vitality":`Vitality`,"char.select.stat.power":`Power`,"char.select.stat.speed":`Swiftness`,"char.select.stat.ability":`Resonance`,"char.select.weapon":`Weapon`,"char.select.special":`Ability`,"char.select.difficulty":`Difficulty`,"char.select.passive":`Passive`,"char.select.stats":`Attributes`,"char.select.controls":`A/D move · Space jump · Shift dash · J/K attack · L ability`,"char.select.name":`Name`,"char.select.health":`Health`,"char.select.armor":`Armor`,"char.select.speedStat":`Move speed`,"char.select.crit":`Crit chance`,"char.select.dash":`Dash cooldown`,"char.select.blurb":`The shard answers to {name}.`,"char.select.unlockedTitle":`Vessel awakened`,"char.select.shardBalance":`{count} ◆`,"char.select.clickUnseal":`Click to unseal`,"char.kael.name":`Kael the Frostbow`,"char.kael.title":`The Frostbow`,"char.kael.desc":`A ranger whose arrows carry the cold of a dead winter. Creates an ice trap that slows and rends the careless.`,"char.kael.passive":`Frost-tipped arrows leave a freezing trail.`,"char.brakk.name":`Brakk the Berserker`,"char.brakk.title":`The Red Tide`,"char.brakk.desc":`A relentless brawler who grows stronger as blood spills. Cleaves through crowds and drinks life from violent rage.`,"char.brakk.passive":`Heavy blows cleave in a wide arc.`,"char.seraphine.name":`Seraphine the Frostweaver`,"char.seraphine.title":`The Frostweaver`,"char.seraphine.desc":`A fragile sorceress who hovers above the dead earth. Hurls slow ice orbs and blinks away from danger in a bloom of frost.`,"char.seraphine.passive":`Orbs shatter in a small area.`,"char.nyx.name":`Nyx the Shadowblade`,"char.nyx.title":`The Shadowblade`,"char.nyx.desc":`A swift assassin who cuts from the dark. Shadow Blades fire in rapid succession, and Shadow Step turns her into a blade of night.`,"char.nyx.passive":`Strikes from behind deal increased damage.`,"char.seraphine.float":`Levitates above the ground.`,"weapon.frostArrows.name":`Frost Arrows`,"weapon.berserkerCleave.name":`Berserker Cleave`,"weapon.iceOrb.name":`Ice Orb`,"weapon.shadowBlades.name":`Shadow Blades`,"special.frostTrap.name":`Glacial Snare`,"special.frostTrap.desc":`Sow a frozen snare that slows and damages enemies crossing it.`,"special.bloodRage.name":`Blood Rage`,"special.bloodRage.desc":`For 4s, damage rises and every kill restores health.`,"special.blinkBurst.name":`Frostblink`,"special.blinkBurst.desc":`Blink forward and detonate a shard of frost at both ends.`,"special.shadowStep.name":`Shadow Step`,"special.shadowStep.desc":`Slip through the dark, briefly invulnerable, and cut anything left behind.`,"attack.iceLance":`Ice Lance`,"attack.bloodCyclone":`Blood Cyclone`,"attack.frozenNova":`Frozen Nova`,"attack.voidArc":`Void Arc`,"difficulty.easy":`Easy`,"difficulty.easyMedium":`Easy–Medium`,"difficulty.medium":`Medium`,"difficulty.mediumHard":`Medium–Hard`,"difficulty.hard":`Hard`,"difficulty.tutorial":`The Grave Awakens`,"difficulty.stirring":`Restless Dead`,"difficulty.pressure":`The Swarm Deepens`,"difficulty.elite":`No Sanctuary`,"difficulty.hell":`Hellshard Overflow`,"zone.cemetery.name":`Cinder Cemetery`,"zone.cemetery.subtitle":`Where the first oath was buried`,"zone.church.name":`Ashen Cathedral`,"zone.church.subtitle":`A choir that never stopped singing`,"zone.swamp.name":`Mire of Names`,"zone.swamp.subtitle":`The water remembers what the living forget`,"zone.dungeon.name":`The Hollow Keep`,"zone.dungeon.subtitle":`Below the dead, the castle still breathes`,"zone.forest.name":`Whispering Wilds`,"zone.forest.subtitle":`An old root system dreams in green`,"zone.dungeonGate.name":`Dungeon Gate`,"zone.dungeonGate.subtitle":`The last door before the deep`,"zone.cemetery.phase.tutorial":`The First Oath Stirs`,"zone.cemetery.phase.stirring":`The Cemetery Hungers`,"zone.cemetery.phase.pressure":`Graves Give Way`,"zone.cemetery.phase.elites":`No Sanctuary`,"zone.cemetery.phase.hell":`Cinder Overflow`,"zone.church.phase.tutorial":`The Choir Breathes`,"zone.church.phase.stirring":`Hymns Turn Hollow`,"zone.church.phase.pressure":`The Nave Crawls`,"zone.church.phase.elites":`The Last Sermon`,"zone.church.phase.hell":`Ashfall Without End`,"zone.swamp.phase.tutorial":`The Mire Remembers`,"zone.swamp.phase.stirring":`Names in the Water`,"zone.swamp.phase.pressure":`The Bog Swells`,"zone.swamp.phase.elites":`Drowned Procession`,"zone.swamp.phase.hell":`The Water Rises`,"zone.dungeon.phase.tutorial":`The Keep Wakes`,"zone.dungeon.phase.stirring":`Chains in the Dark`,"zone.dungeon.phase.pressure":`The Halls Breathe`,"zone.dungeon.phase.elites":`No Light Below`,"zone.dungeon.phase.hell":`The Castle Devours`,"zone.forest.phase.tutorial":`Roots Begin to Move`,"zone.forest.phase.stirring":`Whispers in Green`,"zone.forest.phase.pressure":`The Wilds Close In`,"zone.forest.phase.elites":`The Old Grove Stirs`,"zone.forest.phase.hell":`The Forest Feeds`,"zone.dungeonGate.phase.tutorial":`The Gate Holds`,"zone.dungeonGate.phase.stirring":`Embers in the Dark`,"zone.dungeonGate.phase.pressure":`The Warden Wakes`,"zone.dungeonGate.phase.elites":`No Key but Blood`,"zone.dungeonGate.phase.hell":`The Gate Devours`,"zone.entered":`Entered {zone}`,"zone.return":`Return to {zone}`,"zone.sealed":`The way is sealed.`,"zone.finalGate":`The Final Gate`,"zone.finalGateLocked":`Three shards. Three dead kings. The gate remains cold.`,"zone.finalGateOpen":`The Hellshard Gate awakens.`,"zone.gateLockedItem":`The gate answers only to the iron key.`,"zone.shardFound":`Hellshard claimed: {zone}`,"zone.bossGate":`The arena seals. No way back.`,"boss.mourningMaw.name":`Mourning Maw`,"boss.mourningMaw.title":`The Grave That Bites`,"boss.seraphAsh.name":`Seraph of Ash`,"boss.seraphAsh.title":`The Cathedral’s Last Hymn`,"boss.drownedChoir.name":`The Drowned Choir`,"boss.drownedChoir.title":`Many Voices, One Hunger`,"boss.gateWarden.name":`The Gate Warden`,"boss.gateWarden.title":`The Last Oath Before the Deep`,"boss.phase":`Phase {phase}`,"boss.incoming":`Something ancient stirs…`,"boss.defeated":`{boss} falls silent.`,"boss.shard":`Hellshard fragment claimed.`,"boss.rewardChest":`A memory chest materializes.`,"enemy.boneThrall.name":`Bone Thrall`,"enemy.wight.name":`Grave Wight`,"enemy.cinderHound.name":`Cinder Hound`,"enemy.wisp.name":`Mourning Wisp`,"enemy.burningGhoul.name":`Burning Ghoul`,"enemy.blightCultist.name":`Blight Cultist`,"enemy.venomSpider.name":`Venom Spider`,"enemy.mireWraith.name":`Mire Wraith`,"enemy.bogBrute.name":`Bog Brute`,"enemy.mossSlime.name":`Moss Slime`,"enemy.paleRevenant.name":`Pale Revenant`,"enemy.alphaHound.name":`Alpha Hound`,"hud.health":`Vitality`,"hud.level":`Level {level}`,"hud.time":`Descent {time}`,"hud.kills":`{count} slain`,"hud.shards":`Shards`,"hud.weapon":`Weapon`,"hud.weaponLevel":`Lv {level}`,"hud.evolved":`Evolved`,"hud.special":`Ability`,"hud.dash":`Dash`,"hud.boss":`Boss`,"hud.seed":`Seed {seed}`,"hud.prompt":`E`,"hud.interact":`[E] {action}`,"hud.empty":`Empty`,"hud.controls":`J attack · K heavy · L ability`,"hud.wave":`The dead are restless`,"hud.achievementUnlocked":`Achievement unlocked`,"hud.newUpgrade":`Power stirs within`,"hud.hp":`{current}/{max}`,"hud.elite":`ELITE`,"hud.key":`Iron Key`,"action.openChest":`Open memory chest`,"action.claimShard":`Claim Hellshard`,"action.enterGate":`Enter the Final Gate`,"action.gateLocked":`The gate is sealed`,"action.readSign":`Read the weathered sign`,"sign.dungeonGate.arch":`The gate waits behind the shadows. Seek the iron key in the chest atop the arch.`,"sign.dungeonGate.warden":`The Gate Warden guards the passage. Rest at the fire before you enter.`,"hint.dungeonGate.pits":`Spikes wait below the gaps. Jump early.`,"hint.dungeonGate.lava":`Lava. Ride the moving platform.`,"action.touchAltar":`Offer blood at the altar`,"action.breakWall":`Break the fragile wall`,"action.usePortal":`Enter {zone}`,"pause.title":`Drowned Silence`,"pause.resume":`Resume`,"pause.settings":`Settings`,"pause.achievements":`Achievements`,"pause.abandon":`Abandon Run`,"pause.confirmAbandon":`Abandon this descent?`,"pause.confirm":`Abandon`,"pause.cancel":`Return`,"pause.seed":`Seed: {seed}`,"pause.time":`Descent: {time}`,"pause.level":`Level {level}`,"settings.title":`Offerings`,"settings.audio":`Sound`,"settings.video":`Ritual`,"settings.master":`Master volume`,"settings.sfx":`Effects`,"settings.music":`Ambient drone`,"settings.musicEnabled":`Enable ambient`,"settings.shake":`Screen shake`,"settings.flash":`Flash intensity`,"settings.damageNumbers":`Damage numbers`,"settings.fullscreen":`Fullscreen`,"settings.fullscreenButton":`Toggle`,"settings.language":`Language`,"settings.seed":`World seed`,"settings.apply":`Apply`,"settings.back":`Back`,"settings.reset":`Reset to defaults`,"settings.on":`On`,"settings.off":`Off`,"settings.percent":`{value}%`,"settings.saved":`Settings preserved.`,"settings.seedInvalid":`Seed must be 1–10 digits.`,"settings.fullscreen":`Fullscreen`,"settings.pixel":`Integer pixel scaling`,"settings.meta":`Meta progression`,"settings.bonus":`Permanent boons`,"settings.bonus.vitality":`Grave Vitality`,"settings.bonus.vitalityDesc":`+5 max health per rank`,"settings.bonus.fortune":`Pale Fortune`,"settings.bonus.fortuneDesc":`+4% XP per rank`,"settings.bonus.edge":`Shard Edge`,"settings.bonus.edgeDesc":`+3% damage per rank`,"settings.bonus.rank":`Rank {rank}/{max}`,"settings.bonus.buy":`Bind for {cost} ◆`,"settings.bonus.maxed":`Mastered`,"settings.language.en":`English`,"settings.language.tr":`Türkçe`,"levelup.title":`The Shard Speaks`,"levelup.subtitle":`Choose one gift. The rest will drown.`,"levelup.choose":`Claim`,"levelup.evolution":`Weapon Evolution`,"levelup.evolutionReady":`A weapon remembers its true name.`,"levelup.weaponLevel":`Weapon Lv {level}`,"levelup.max":`MAX`,"levelup.key":`Press {key}`,"levelup.cardType.upgrade":`Passive Rite`,"levelup.cardType.evolution":`Forbidden Evolution`,"levelup.levelReached":`Level {level} reached`,"levelup.noOffers":`The shard is silent. Continue.`,"upgrade.attackSpeed.name":`Frenzied Strikes`,"upgrade.attackSpeed.desc":`+12% attack speed.`,"upgrade.critChance.name":`Grave Instinct`,"upgrade.critChance.desc":`+10% critical chance.`,"upgrade.critDamage.name":`Cruel Edge`,"upgrade.critDamage.desc":`+25% critical damage.`,"upgrade.frostPower.name":`Winter’s Grip`,"upgrade.frostPower.desc":`+20% frost damage and slow potency.`,"upgrade.projectileCount.name":`Split Oath`,"upgrade.projectileCount.desc":`+1 projectile per attack.`,"upgrade.areaDamage.name":`Widening Wound`,"upgrade.areaDamage.desc":`+20% area damage and blast radius.`,"upgrade.movementSpeed.name":`Pallbearer’s Stride`,"upgrade.movementSpeed.desc":`+6% movement speed.`,"upgrade.maxHealth.name":`Borrowed Breath`,"upgrade.maxHealth.desc":`+20 max health.`,"upgrade.armor.name":`Ossuary Plate`,"upgrade.armor.desc":`+8% damage reduction.`,"upgrade.lifeRecovery.name":`Blood Tithe`,"upgrade.lifeRecovery.desc":`Recover 1 health per kill.`,"upgrade.xpGain.name":`Grave Hunger`,"upgrade.xpGain.desc":`+15% XP from crystals.`,"upgrade.magnetRange.name":`Call of the Dead`,"upgrade.magnetRange.desc":`+20 crystal pull radius.`,"upgrade.dashCooldown.name":`Hollow Step`,"upgrade.dashCooldown.desc":`-8% dash cooldown.`,"evolution.piercingGlacier.name":`Piercing Glacier`,"evolution.piercingGlacier.desc":`Frost Arrows pierce up to 3 foes and leave exploding icicles.`,"evolution.bloodstorm.name":`Bloodstorm`,"evolution.bloodstorm.desc":`Berserker Cleave becomes a storm of blood that drinks from every wound.`,"evolution.frozenNova.name":`Frozen Nova`,"evolution.frozenNova.desc":`Ice Orbs detonate in rings of shattering frost and slow entire packs.`,"evolution.voidReaper.name":`Void Reaper`,"evolution.voidReaper.desc":`Shadow Blades ricochet to nearby prey and can strike twice.`,"evolution.available":`Evolution available`,"evolution.already":`Evolved`,"achievements.title":`Crypt of Memory`,"achievements.subtitle":`The dead keep every promise.`,"achievements.locked":`Not yet remembered`,"achievements.unlockedShort":`Unlocked`,"achievements.reward":`+{count} ◆`,"achievements.progress":`{current}/{target}`,"achievements.none":`No achievements yet.`,"achievements.unlocked":`Achievement unlocked: {name}`,"achievement.firstBlood.name":`First Blood`,"achievement.firstBlood.desc":`Kill your first enemy.`,"achievement.hundredSouls.name":`A Hundred Names`,"achievement.hundredSouls.desc":`Kill 100 enemies in a single descent.`,"achievement.shardbearer.name":`Shardbearer`,"achievement.shardbearer.desc":`Claim one Hellshard fragment.`,"achievement.trinity.name":`Trinity of Ruin`,"achievement.trinity.desc":`Claim all three Hellshard fragments.`,"achievement.mawSilenced.name":`Maw Silenced`,"achievement.mawSilenced.desc":`Defeat the Mourning Maw.`,"achievement.ashfall.name":`Ashfall`,"achievement.ashfall.desc":`Defeat the Seraph of Ash.`,"achievement.silentChoir.name":`The Choir Ends`,"achievement.silentChoir.desc":`Defeat the Drowned Choir.`,"achievement.wardenFallen.name":`The Last Oath`,"achievement.wardenFallen.desc":`Defeat the Gate Warden.`,"achievement.ascendant.name":`Ascendant`,"achievement.ascendant.desc":`Reach level 10 in one descent.`,"achievement.firstEvolution.name":`Forbidden Bloom`,"achievement.firstEvolution.desc":`Evolve a weapon.`,"achievement.treasureHunter.name":`Grave Robber`,"achievement.treasureHunter.desc":`Open 5 memory chests in one descent.`,"achievement.survivor.name":`Ten Minutes Below`,"achievement.survivor.desc":`Survive for 10 minutes.`,"achievement.untouched.name":`Unbroken`,"achievement.untouched.desc":`Defeat a boss without taking damage.`,"result.death":`The Dead Claim You`,"result.victory":`The Ashes Remember`,"result.subtitleDeath":`Your name joins the water.`,"result.subtitleVictory":`Two shards burn as one. The descent ends.`,"result.survived":`Time Survived`,"result.kills":`Enemies Slain`,"result.bosses":`Bosses Defeated`,"result.xp":`XP Earned`,"result.level":`Final Level`,"result.shards":`Hellshards Earned`,"result.achievements":`Achievements Unlocked`,"result.topUpgrades":`Strongest Rites`,"result.weapon":`Final Weapon`,"result.seed":`Seed`,"result.restart":`Descend Again`,"result.menu":`Return to Crypt`,"result.newShard":`+{count} ◆ stored in the crypt`,"result.noAchievements":`No achievements this descent.`,"result.killsCount":`{count}`,"result.bossesCount":`{count}/3`,"result.topUpgradeLine":`Lv {level} — {name}`,"result.bestLevel":`Peak Level {level}`,"result.retryTip":`The world remembers your seed.`,"toast.levelUp":`Level {level}`,"toast.weaponLevel":`{weapon} Lv {level}`,"toast.armor":`Armor {value}%`,"toast.heal":`Health restored`,"toast.chest":`Memory chest opened`,"toast.altar":`Blood accepted. Strength given.`,"toast.altarFull":`Your blood is not enough.`,"toast.elite":`An elite stirs.`,"toast.bossGateOpen":`The arena opens.`,"toast.seedCopied":`Seed whispered.`,"toast.nothing":`Nothing but dust.`,"toast.shardSurge":`Hellshard Surge!`,"toast.ambush":`Ambush!`,"toast.elitePack":`An elite pack hunts you.`,"toast.checkpoint":`Respawned at the last gate.`,"toast.checkpointHeal":`The bonfire restores you.`,"item.dungeonKey":`Iron Key claimed`,"toast.fell":`The dark caught you.`,"toast.newRecord":`New record: {time}`,"event.ambush":`Ambush`,"event.surge":`Hellshard Surge`,"event.elitePack":`Elite Pack`,"controls.title":`Rites of Movement`,"controls.move":`Move`,"controls.jump":`Jump`,"controls.dash":`Dash`,"controls.attack":`Basic attack`,"controls.heavy":`Heavy attack`,"controls.special":`Special ability`,"controls.interact":`Interact`,"controls.pause":`Pause`,"controls.debug":`Debug overlay`,"controls.move.keys":`A D / ← →`,"controls.jump.keys":`Space / W`,"controls.dash.keys":`Shift`,"controls.attack.keys":`J`,"controls.heavy.keys":`K`,"controls.special.keys":`L`,"controls.interact.keys":`E`,"controls.pause.keys":`Esc`,"controls.debug.keys":`F3`,"controls.hold":`Hold J to keep attacking. Hold Shift + direction to dash.`,"controls.tip1":`Coyote time forgives late jumps.`,"controls.tip2":`Heavy attacks have a windup. Read the telegraphs.`,"controls.tip3":`Red flash means danger. White flash means impact.`,"debug.title":`RITUAL DEBUG`,"debug.fps":`FPS`,"debug.frame":`Frame`,"debug.drawCalls":`Draw calls`,"debug.entities":`Entities`,"debug.particles":`Particles`,"debug.spawnBudget":`Spawn budget`,"debug.zone":`Zone`,"debug.seed":`Seed`,"debug.pos":`Pos`,"debug.state":`State`,"debug.activeEnemies":`Active enemies`,"debug.boss":`Boss`,"debug.hint":`F3 to hide`,"debug.rail":`Rail`,"debug.render":`Render`,"debug.sim":`Sim`,"debug.collisionLegend":`COLLISION ANCHORS`,"debug.hitbox":`HIT`,"debug.collisionFloor":`AABB FEET`,"debug.tileFloor":`TILE FLOOR`,"debug.spriteAnchor":`SPRITE`,"debug.footSink":`FOOT SINK`,"debug.noFloor":`—`,"credits.title":`Credits`,"credits.assets":`Art`,"credits.code":`Code`,"credits.audio":`Audio`,"credits.font":`Type`,"credits.thanks":`Thanks for descending.`,"credits.back":`Back`,"credits.license":`Third-party art keeps its original license. Original game content is MIT licensed; see LICENSE.`,"error.loadTitle":`The abyss resisted.`,"error.loadBody":`Assets could not be summoned. Check the console and refresh.`,"error.retry":`Try again`,"error.webgl":`WebGL is not available on this device.`,"language.en":`English`,"language.tr":`Türkçe`,"common.yes":`Yes`,"common.no":`No`,"common.close":`Close`,"common.back":`Back`,"common.confirm":`Confirm`,"common.cancel":`Cancel`,"common.on":`On`,"common.off":`Off`,"common.level":`Lv {level}`,"common.unknown":`Unknown`,"common.minutes":`{m}:{s}`,"common.shardsIcon":`◆`,"common.timeShort":`{m}:{s}`,"common.loadout":`Loadout`,"common.new":`NEW`,"common.seedCopied":`Copied`,"common.requires":`Requires`,"common.total":`Total`,"common.lock":`Locked`,"common.unlocked":`Unlocked`,"common.emptySlot":`Unbound`,"common.noUpgrade":`No rite chosen`,"common.none":`None`,"common.reset":`Reset`,"common.rank":`Rank {rank}`,"common.bosses":`Bosses`,"common.shards":`Shards`,"common.records":`Records`,"common.best":`Best`,"common.bestTime":`Longest descent`,"common.bestKills":`Most slain`,"common.runs":`Descents`,"common.metaShards":`Hellshards`,"common.continue":`Continue`,"common.press":`Press {key}`,"common.seconds":`{s}s`,"common.levelShort":`Lv {level}`,"common.weaponLevelShort":`Weapon {level}`,"common.killsShort":`{count} kills`,"common.seedShort":`#{seed}`,"common.loading":`Loading…`},jl={en:Al,tr:{"game.title":`HELLSHARD`,"game.tagline":`Karanlık bir fantezi inişi`,"game.loading":`Cehennem çukuru dövülüyor…`,"game.assets":`Ölüler toplanıyor`,"game.version":`v{version}`,"menu.start":`İnişi Başlat`,"menu.startHint":`Kabını seç`,"menu.rule":`İki parça · iki bekçi · dönüş yok`,"menu.ledger":`İniş defteri`,"menu.protocol":`İniş protokolü`,"menu.ready":`Hazır`,"menu.fragments":`Cevheri iki parça uyandırır`,"menu.hellshards":`Cehennem Parçaları`,"menu.best":`En iyi iniş`,"menu.runs":`İnişler`,"menu.zones":`Görülen bölgeler`,"menu.originalWork":`MIT lisanslı · JAYNUS`,"menu.tip":`Parçaları iki bekçi tutar. İkisini de sustur, iniş bitsin.`,"menu.creditsHint":`Kaynaklar ve lisans`,"menu.continue":`Koşuya Dön`,"menu.achievements":`Başarımlar`,"menu.settings":`Ayarlar`,"menu.credits":`Katkılar`,"menu.controls":`Kontroller`,"menu.seed":`Dünya Tohumu`,"menu.seedHint":`Aynı tohum, aynı mezar.`,"menu.footer":`WASD / Yön tuşları hareket  ·  J saldırı  ·  K ağır  ·  L özel`,"menu.shards":`Cehennem Parçaları: {count}`,"menu.lockedTooltip":`Bu karakteri kadrodan aç.`,"menu.subtitle":`Ölüler her adımı hatırlar.`,"menu.enter":`Uyan`,"menu.reroll":`Tohumu Rastgeleleştir`,"menu.newSeed":`Yeni Tohum`,"menu.meta":`Hafıza Mahzeni`,"menu.difficulty":`Uçurum zamanla derinleşir.`,"char.select.title":`Kabını Seç`,"char.select.subtitle":`Parça aynı anda tek bir ruha cevap verir.`,"char.select.kicker":`Kap seçimi`,"char.select.roster":`Kadro`,"char.select.hint":`A/D veya 1–4 ile seç · İnmek için Enter`,"char.select.start":`Aşağı İn`,"char.select.back":`Geri`,"char.select.locked":`Mühürlü`,"char.select.unlock":`Mührü Aç — {cost} ◆`,"char.select.notEnough":`Yeterli Cehennem Parçası yok`,"char.select.selected":`Seçildi`,"char.select.stat.vitality":`Can`,"char.select.stat.power":`Güç`,"char.select.stat.speed":`Çeviklik`,"char.select.stat.ability":`Rezonans`,"char.select.weapon":`Silah`,"char.select.special":`Yetenek`,"char.select.difficulty":`Zorluk`,"char.select.passive":`Pasif`,"char.select.stats":`Nitelikler`,"char.select.controls":`A/D hareket · Space zıpla · Shift dash · J/K saldırı · L yetenek`,"char.select.name":`İsim`,"char.select.health":`Can`,"char.select.armor":`Zırh`,"char.select.speedStat":`Hareket hızı`,"char.select.crit":`Kritik şansı`,"char.select.dash":`Dash beklemesi`,"char.select.blurb":`Parça {name} adına cevap verir.`,"char.select.unlockedTitle":`Kap uyandı`,"char.select.shardBalance":`{count} ◆`,"char.select.clickUnseal":`Mührü açmak için tıkla`,"char.kael.name":`Kael the Frostbow`,"char.kael.title":`Kırağı Yaylı`,"char.kael.desc":`Okları ölü bir kışın soğuğunu taşıyan bir avcı. Dikkatsizleri yavaşlatan ve parçalayan bir buz tuzağı kurar.`,"char.kael.passive":`Kırağı uçlu oklar dondurucu bir iz bırakır.`,"char.brakk.name":`Brakk the Berserker`,"char.brakk.title":`Kızıl Dalga`,"char.brakk.desc":`Kan döküldükçe güçlenen yorulmaz bir dövüşçü. Sürüleri yarar ve vahşi öfkeyle can çalar.`,"char.brakk.passive":`Ağır vuruşlar geniş bir yay çizer.`,"char.seraphine.name":`Seraphine the Frostweaver`,"char.seraphine.title":`Kırağı Dokuyucu`,"char.seraphine.desc":`Ölü toprağın üzerinde süzülen kırılgan bir büyücü. Yavaş buz küreleri fırlatır ve tehlike anında kırağı içinde ışıldayıp kaybolur.`,"char.seraphine.passive":`Küreler küçük bir alanda patlar.`,"char.nyx.name":`Nyx the Shadowblade`,"char.nyx.title":`Gölge Bıçağı`,"char.nyx.desc":`Karanlıktan kesen hızlı bir suikastçı. Gölge Bıçakları art arda ateşlenir; Gölge Adımı onu gecenin bir bıçağına çevirir.`,"char.nyx.passive":`Arkadan gelen darbeler daha fazla hasar verir.`,"char.seraphine.float":`Zeminin üzerinde süzülür.`,"weapon.frostArrows.name":`Kırağı Okları`,"weapon.berserkerCleave.name":`Berserker Yarığı`,"weapon.iceOrb.name":`Buz Küresi`,"weapon.shadowBlades.name":`Gölge Bıçakları`,"special.frostTrap.name":`Buzul Kapanı`,"special.frostTrap.desc":`Üzerinden geçen düşmanları yavaşlatan ve yaralayan bir buz kapanı kur.`,"special.bloodRage.name":`Kan Öfkesi`,"special.bloodRage.desc":`4 saniye boyunca hasar artar ve her öldürme can yeniler.`,"special.blinkBurst.name":`Kırağı Işınlanması`,"special.blinkBurst.desc":`İleri kay ve iki uçta kırağı patlaması yarat.`,"special.shadowStep.name":`Gölge Adımı`,"special.shadowStep.desc":`Kısa süre dokunulmaz olarak karanlıktan geç ve geride kalanları kes.`,"attack.iceLance":`Buz Mızrağı`,"attack.bloodCyclone":`Kan Kasırgası`,"attack.frozenNova":`Donuk Nova`,"attack.voidArc":`Boşluk Yayı`,"difficulty.easy":`Kolay`,"difficulty.easyMedium":`Kolay–Orta`,"difficulty.medium":`Orta`,"difficulty.mediumHard":`Orta–Zor`,"difficulty.hard":`Zor`,"difficulty.tutorial":`Mezar Uyanıyor`,"difficulty.stirring":`Huzursuz Ölüler`,"difficulty.pressure":`Sürü Derinleşiyor`,"difficulty.elite":`Sığınak Yok`,"difficulty.hell":`Cehennem Taşması`,"zone.cemetery.name":`Küllü Mezarlık`,"zone.cemetery.subtitle":`İlk yemin buraya gömüldü`,"zone.church.name":`Kül Katedrali`,"zone.church.subtitle":`Hiç susmayan bir koro`,"zone.swamp.name":`İsimler Bataklığı`,"zone.swamp.subtitle":`Su, yaşayanların unuttuğunu hatırlar`,"zone.dungeon.name":`Oyuk Kale`,"zone.dungeon.subtitle":`Ölülerin altında kale hâlâ nefes alıyor`,"zone.forest.name":`Fısıldayan Yaban`,"zone.forest.subtitle":`Eski bir kök sistemi yeşilde rüya görüyor`,"zone.dungeonGate.name":`Zindan Kapısı`,"zone.dungeonGate.subtitle":`Derinliğe açılan son kapı`,"zone.cemetery.phase.tutorial":`İlk Yemin Kıpırdıyor`,"zone.cemetery.phase.stirring":`Mezarlık Acıkıyor`,"zone.cemetery.phase.pressure":`Mezarlar Yol Veriyor`,"zone.cemetery.phase.elites":`Sığınak Yok`,"zone.cemetery.phase.hell":`Kül Taşkını`,"zone.church.phase.tutorial":`Koro Nefes Alıyor`,"zone.church.phase.stirring":`İlahiler Boşalıyor`,"zone.church.phase.pressure":`Nef Sürünüyor`,"zone.church.phase.elites":`Son Vaaz`,"zone.church.phase.hell":`Bitmeyen Kül Yağmuru`,"zone.swamp.phase.tutorial":`Bataklık Hatırlıyor`,"zone.swamp.phase.stirring":`Suda İsimler`,"zone.swamp.phase.pressure":`Bataklık Kabarıyor`,"zone.swamp.phase.elites":`Boğulmuş Alay`,"zone.swamp.phase.hell":`Su Yükseliyor`,"zone.dungeon.phase.tutorial":`Kale Uyanıyor`,"zone.dungeon.phase.stirring":`Karanlıkta Zincirler`,"zone.dungeon.phase.pressure":`Koridorlar Soluk Alıyor`,"zone.dungeon.phase.elites":`Aşağıda Işık Yok`,"zone.dungeon.phase.hell":`Kale Yutuyor`,"zone.forest.phase.tutorial":`Kökler Kıpırdamaya Başlıyor`,"zone.forest.phase.stirring":`Yeşilde Fısıltılar`,"zone.forest.phase.pressure":`Yaban Daralıyor`,"zone.forest.phase.elites":`Eski Koru Kıpırdıyor`,"zone.forest.phase.hell":`Orman Besleniyor`,"zone.dungeonGate.phase.tutorial":`Kapı Dayanıyor`,"zone.dungeonGate.phase.stirring":`Karanlıkta Korlar`,"zone.dungeonGate.phase.pressure":`Bekçi Uyanıyor`,"zone.dungeonGate.phase.elites":`Anahtar Değil, Kan`,"zone.dungeonGate.phase.hell":`Kapı Yutuyor`,"zone.entered":`{zone} bölgesine girildi`,"zone.return":`{zone} bölgesine dön`,"zone.sealed":`Yol mühürlü.`,"zone.finalGate":`Son Kapı`,"zone.finalGateLocked":`Üç parça. Üç ölü kral. Kapı hâlâ soğuk.`,"zone.finalGateOpen":`Cehennem Parçası Kapısı uyanıyor.`,"zone.gateLockedItem":`Kapı yalnızca demir anahtara boyun eğer.`,"zone.shardFound":`Cehennem Parçası alındı: {zone}`,"zone.bossGate":`Arena mühürlendi. Geri dönüş yok.`,"boss.mourningMaw.name":`Yas Çenesi`,"boss.mourningMaw.title":`Isıran Mezar`,"boss.seraphAsh.name":`Kül Serafı`,"boss.seraphAsh.title":`Katedralin Son İlahisi`,"boss.drownedChoir.name":`Boğulmuş Koro`,"boss.drownedChoir.title":`Çok Ses, Tek Açlık`,"boss.gateWarden.name":`Kapı Bekçisi`,"boss.gateWarden.title":`Derinliğin Önündeki Son Yemin`,"boss.phase":`Evre {phase}`,"boss.incoming":`Kadim bir şey kıpırdıyor…`,"boss.defeated":`{boss} sessizliğe gömüldü.`,"boss.shard":`Cehennem Parçası alındı.`,"boss.rewardChest":`Bir hafıza sandığı beliriyor.`,"enemy.boneThrall.name":`Kemik Esiri`,"enemy.wight.name":`Mezar Hayaleti`,"enemy.cinderHound.name":`Kor Tazısı`,"enemy.wisp.name":`Yas Fısıltısı`,"enemy.burningGhoul.name":`Yanan Hortlak`,"enemy.blightCultist.name":`Çürük Kültist`,"enemy.venomSpider.name":`Zehir Örümceği`,"enemy.mireWraith.name":`Bataklık Hayaleti`,"enemy.bogBrute.name":`Bataklık Devi`,"enemy.mossSlime.name":`Yosun Balçığı`,"enemy.paleRevenant.name":`Solgun Revenant`,"enemy.alphaHound.name":`Alfa Tazı`,"hud.health":`Can`,"hud.level":`Seviye {level}`,"hud.time":`İniş {time}`,"hud.kills":`{count} ölü`,"hud.shards":`Parçalar`,"hud.weapon":`Silah`,"hud.weaponLevel":`Sv {level}`,"hud.evolved":`Evrilmiş`,"hud.special":`Yetenek`,"hud.dash":`Atılma`,"hud.boss":`Boss`,"hud.seed":`Tohum {seed}`,"hud.prompt":`E`,"hud.interact":`[E] {action}`,"hud.empty":`Boş`,"hud.controls":`J saldırı · K ağır · L yetenek`,"hud.wave":`Ölüler huzursuz`,"hud.achievementUnlocked":`Başarım açıldı`,"hud.newUpgrade":`İçinde güç kıpırdıyor`,"hud.hp":`{current}/{max}`,"hud.elite":`ELİT`,"hud.key":`Demir Anahtar`,"action.openChest":`Hafıza sandığını aç`,"action.claimShard":`Cehennem Parçasını al`,"action.enterGate":`Son Kapıya gir`,"action.gateLocked":`Kapı mühürlü`,"action.readSign":`Yıpranmış tabelayı oku`,"sign.dungeonGate.arch":`Kapı gölgelerin ardında. Anahtarı kemerin tepesindeki sandıkta ara.`,"sign.dungeonGate.warden":`Kapı Bekçisi geçidi koruyor. Girmeden önce ateşte dinlen.`,"hint.dungeonGate.pits":`Boşlukların altında sivri uçlar var! Erken zıpla.`,"hint.dungeonGate.lava":`Lav! Hareketli platformu kullan.`,"action.touchAltar":`Sunağa kan sun`,"action.breakWall":`Kırılgan duvarı kır`,"action.usePortal":`{zone} bölgesine gir`,"pause.title":`Boğulmuş Sessizlik`,"pause.resume":`Devam Et`,"pause.settings":`Ayarlar`,"pause.achievements":`Başarımlar`,"pause.abandon":`Koşuyu Bırak`,"pause.confirmAbandon":`Bu inişi bırakıyor musun?`,"pause.confirm":`Bırak`,"pause.cancel":`Geri Dön`,"pause.seed":`Tohum: {seed}`,"pause.time":`İniş: {time}`,"pause.level":`Seviye {level}`,"settings.title":`Sunular`,"settings.audio":`Ses`,"settings.video":`Ritüel`,"settings.master":`Ana ses`,"settings.sfx":`Efektler`,"settings.music":`Ortam uğultusu`,"settings.musicEnabled":`Ortam sesini aç`,"settings.shake":`Ekran sarsıntısı`,"settings.flash":`Flaş yoğunluğu`,"settings.damageNumbers":`Hasar sayıları`,"settings.fullscreen":`Tam ekran`,"settings.fullscreenButton":`Değiştir`,"settings.language":`Dil`,"settings.seed":`Dünya tohumu`,"settings.apply":`Uygula`,"settings.back":`Geri`,"settings.reset":`Varsayılanlara dön`,"settings.on":`Açık`,"settings.off":`Kapalı`,"settings.percent":`%{value}`,"settings.saved":`Ayarlar korundu.`,"settings.seedInvalid":`Tohum 1–10 haneli olmalı.`,"settings.fullscreen":`Tam ekran`,"settings.pixel":`Tamsayı piksel ölçeği`,"settings.meta":`Meta ilerleme`,"settings.bonus":`Kalıcı lütuflar`,"settings.bonus.vitality":`Mezar Canlılığı`,"settings.bonus.vitalityDesc":`Her kademe +5 azami can`,"settings.bonus.fortune":`Solgun Şans`,"settings.bonus.fortuneDesc":`Her kademe +%4 XP`,"settings.bonus.edge":`Parça Kenarı`,"settings.bonus.edgeDesc":`Her kademe +%3 hasar`,"settings.bonus.rank":`Kademe {rank}/{max}`,"settings.bonus.buy":`{cost} ◆ karşılığında bağla`,"settings.bonus.maxed":`Ustalaşıldı`,"settings.language.en":`English`,"settings.language.tr":`Türkçe`,"levelup.title":`Parça Konuşuyor`,"levelup.subtitle":`Bir hediyeyi seç. Gerisi boğulacak.`,"levelup.choose":`Al`,"levelup.evolution":`Silah Evrimi`,"levelup.evolutionReady":`Bir silah gerçek adını hatırlıyor.`,"levelup.weaponLevel":`Silah Sv {level}`,"levelup.max":`MAKS`,"levelup.key":`{key} tuşuna bas`,"levelup.cardType.upgrade":`Pasif Rit`,"levelup.cardType.evolution":`Yasak Evrim`,"levelup.levelReached":`Seviye {level}`,"levelup.noOffers":`Parça sessiz. Devam et.`,"upgrade.attackSpeed.name":`Çılgın Darbeler`,"upgrade.attackSpeed.desc":`+%12 saldırı hızı.`,"upgrade.critChance.name":`Mezar İçgüdüsü`,"upgrade.critChance.desc":`+%10 kritik şansı.`,"upgrade.critDamage.name":`Zalim Kenar`,"upgrade.critDamage.desc":`+%25 kritik hasarı.`,"upgrade.frostPower.name":`Kışın Kavrayışı`,"upgrade.frostPower.desc":`+%20 kırağı hasarı ve yavaşlatma gücü.`,"upgrade.projectileCount.name":`Bölünmüş Yemin`,"upgrade.projectileCount.desc":`Saldırı başına +1 mermi.`,"upgrade.areaDamage.name":`Genişleyen Yara`,"upgrade.areaDamage.desc":`+%20 alan hasarı ve patlama yarıçapı.`,"upgrade.movementSpeed.name":`Tabut Taşıyıcısı Adımı`,"upgrade.movementSpeed.desc":`+%6 hareket hızı.`,"upgrade.maxHealth.name":`Ödünç Nefes`,"upgrade.maxHealth.desc":`+20 azami can.`,"upgrade.armor.name":`Kemik Zırhı`,"upgrade.armor.desc":`+%8 hasar azaltımı.`,"upgrade.lifeRecovery.name":`Kan Vergisi`,"upgrade.lifeRecovery.desc":`Öldürme başına 1 can yenile.`,"upgrade.xpGain.name":`Mezar Açlığı`,"upgrade.xpGain.desc":`Kristallerden +%15 XP.`,"upgrade.magnetRange.name":`Ölülerin Çağrısı`,"upgrade.magnetRange.desc":`+20 kristal çekim yarıçapı.`,"upgrade.dashCooldown.name":`Oyuk Adım`,"upgrade.dashCooldown.desc":`-%8 dash beklemesi.`,"evolution.piercingGlacier.name":`Delici Buzul`,"evolution.piercingGlacier.desc":`Kırağı Okları 3 düşmana kadar deler ve patlayan buz sarkıtları bırakır.`,"evolution.bloodstorm.name":`Kan Fırtınası`,"evolution.bloodstorm.desc":`Berserker Yarığı her yaradan kan içen bir kan fırtınasına dönüşür.`,"evolution.frozenNova.name":`Donuk Nova`,"evolution.frozenNova.desc":`Buz Küreleri kırağı halkalarıyla patlar ve sürüleri yavaşlatır.`,"evolution.voidReaper.name":`Boşluk Orakçısı`,"evolution.voidReaper.desc":`Gölge Bıçakları yakındaki avlara seker ve iki kez vurabilir.`,"evolution.available":`Evrim hazır`,"evolution.already":`Evrilmiş`,"achievements.title":`Hafıza Mahzeni`,"achievements.subtitle":`Ölüler her sözü tutar.`,"achievements.locked":`Henüz hatırlanmadı`,"achievements.unlockedShort":`Açıldı`,"achievements.reward":`+{count} ◆`,"achievements.progress":`{current}/{target}`,"achievements.none":`Henüz başarım yok.`,"achievements.unlocked":`Başarım açıldı: {name}`,"achievement.firstBlood.name":`İlk Kan`,"achievement.firstBlood.desc":`İlk düşmanını öldür.`,"achievement.hundredSouls.name":`Yüz İsim`,"achievement.hundredSouls.desc":`Tek inişte 100 düşman öldür.`,"achievement.shardbearer.name":`Parça Taşıyıcı`,"achievement.shardbearer.desc":`Bir Cehennem Parçası al.`,"achievement.trinity.name":`Yıkım Üçlüsü`,"achievement.trinity.desc":`Üç Cehennem Parçasını da topla.`,"achievement.mawSilenced.name":`Çene Sustu`,"achievement.mawSilenced.desc":`Yas Çenesini yen.`,"achievement.ashfall.name":`Kül Yağmuru`,"achievement.ashfall.desc":`Kül Serafını yen.`,"achievement.silentChoir.name":`Koro Bitti`,"achievement.silentChoir.desc":`Boğulmuş Koroyu yen.`,"achievement.wardenFallen.name":`Son Yemin`,"achievement.wardenFallen.desc":`Kapı Bekçisini yen.`,"achievement.ascendant.name":`Yükselen`,"achievement.ascendant.desc":`Tek inişte 10. seviyeye ulaş.`,"achievement.firstEvolution.name":`Yasak Çiçek`,"achievement.firstEvolution.desc":`Bir silahı evrimleştir.`,"achievement.treasureHunter.name":`Mezar Soyguncusu`,"achievement.treasureHunter.desc":`Tek inişte 5 hafıza sandığı aç.`,"achievement.survivor.name":`On Dakika Aşağıda`,"achievement.survivor.desc":`10 dakika hayatta kal.`,"achievement.untouched.name":`Kırılmamış`,"achievement.untouched.desc":`Bir bossu hasar almadan yen.`,"result.death":`Ölüler Seni İstedi`,"result.victory":`Küller Hatırlar`,"result.subtitleDeath":`İsmin suya karıştı.`,"result.subtitleVictory":`İki parça tek bir alev olarak yanıyor. İniş bitti.`,"result.survived":`Hayatta Kalınan Süre`,"result.kills":`Öldürülen Düşman`,"result.bosses":`Yenilen Boss`,"result.xp":`Kazanılan XP`,"result.level":`Son Seviye`,"result.shards":`Kazanılan Cehennem Parçası`,"result.achievements":`Açılan Başarımlar`,"result.topUpgrades":`En Güçlü Ritler`,"result.weapon":`Son Silah`,"result.seed":`Tohum`,"result.restart":`Tekrar İn`,"result.menu":`Mahzene Dön`,"result.newShard":`+{count} ◆ mahzende saklandı`,"result.noAchievements":`Bu inişte başarım yok.`,"result.killsCount":`{count}`,"result.bossesCount":`{count}/3`,"result.topUpgradeLine":`Sv {level} — {name}`,"result.bestLevel":`Zirve Seviye {level}`,"result.retryTip":`Dünya tohumunu hatırlar.`,"toast.levelUp":`Seviye {level}`,"toast.weaponLevel":`{weapon} Sv {level}`,"toast.armor":`Zırh %{value}`,"toast.heal":`Can yenilendi`,"toast.chest":`Hafıza sandığı açıldı`,"toast.altar":`Kan kabul edildi. Güç verildi.`,"toast.altarFull":`Kanın yeterli değil.`,"toast.elite":`Bir elit kıpırdıyor.`,"toast.bossGateOpen":`Arena açıldı.`,"toast.seedCopied":`Tohum fısıldandı.`,"toast.nothing":`Tozdan başka bir şey yok.`,"toast.shardSurge":`Cehennem Parçası Dalgası!`,"toast.ambush":`Pusu!`,"toast.elitePack":`Bir elit sürü seni avlıyor.`,"toast.checkpoint":`Son kapıda yeniden doğdun.`,"toast.checkpointHeal":`Ateş seni onarıyor.`,"item.dungeonKey":`Demir Anahtar alındı`,"toast.fell":`Karanlık seni yakaladı.`,"toast.newRecord":`Yeni rekor: {time}`,"event.ambush":`Pusu`,"event.surge":`Cehennem Parçası Dalgası`,"event.elitePack":`Elit Sürü`,"controls.title":`Hareket Ritleri`,"controls.move":`Hareket`,"controls.jump":`Zıpla`,"controls.dash":`Atıl`,"controls.attack":`Temel saldırı`,"controls.heavy":`Ağır saldırı`,"controls.special":`Özel yetenek`,"controls.interact":`Etkileşim`,"controls.pause":`Duraklat`,"controls.debug":`Hata ayıklama`,"controls.move.keys":`A D / ← →`,"controls.jump.keys":`Space / W`,"controls.dash.keys":`Shift`,"controls.attack.keys":`J`,"controls.heavy.keys":`K`,"controls.special.keys":`L`,"controls.interact.keys":`E`,"controls.pause.keys":`Esc`,"controls.debug.keys":`F3`,"controls.hold":`Saldırmak için J basılı tut. Yönle Shift basılı tutarak atıl.`,"controls.tip1":`Coyote time geç zıplamaları affeder.`,"controls.tip2":`Ağır saldırıların hazırlık süresi vardır. İşaretleri oku.`,"controls.tip3":`Kırmızı flaş tehlike, beyaz flaş darbe demektir.`,"debug.title":`RİTÜEL HATA AYIKLAMA`,"debug.fps":`FPS`,"debug.frame":`Kare`,"debug.drawCalls":`Çizim çağrısı`,"debug.entities":`Varlık`,"debug.particles":`Parçacık`,"debug.spawnBudget":`Spawn bütçesi`,"debug.zone":`Bölge`,"debug.seed":`Tohum`,"debug.pos":`Konum`,"debug.state":`Durum`,"debug.activeEnemies":`Aktif düşman`,"debug.boss":`Boss`,"debug.hint":`Gizlemek için F3`,"debug.rail":`Ray`,"debug.render":`Çizim`,"debug.sim":`Sim`,"debug.collisionLegend":`ÇARPIŞMA ÇAPALARI`,"debug.hitbox":`HITBOX`,"debug.collisionFloor":`AABB AYAK`,"debug.tileFloor":`TILE ZEMİN`,"debug.spriteAnchor":`SPRITE`,"debug.footSink":`AYAK GÖMÜLMESİ`,"debug.noFloor":`—`,"credits.title":`Katkılar`,"credits.assets":`Sanat`,"credits.code":`Kod`,"credits.audio":`Ses`,"credits.font":`Yazı`,"credits.thanks":`İndiğin için teşekkürler.`,"credits.back":`Geri`,"credits.license":`Üçüncü taraf sanat özgün lisansında kalır. Orijinal oyun içeriği MIT lisanslıdır; LICENSE dosyasına bak.`,"error.loadTitle":`Uçurum direndi.`,"error.loadBody":`Varlıklar çağrılamadı. Konsolu kontrol et ve sayfayı yenile.`,"error.retry":`Tekrar dene`,"error.webgl":`Bu cihazda WebGL kullanılamıyor.`,"language.en":`English`,"language.tr":`Türkçe`,"common.yes":`Evet`,"common.no":`Hayır`,"common.close":`Kapat`,"common.back":`Geri`,"common.confirm":`Onayla`,"common.cancel":`İptal`,"common.on":`Açık`,"common.off":`Kapalı`,"common.level":`Sv {level}`,"common.unknown":`Bilinmiyor`,"common.minutes":`{m}:{s}`,"common.shardsIcon":`◆`,"common.timeShort":`{m}:{s}`,"common.loadout":`Yük`,"common.new":`YENİ`,"common.seedCopied":`Kopyalandı`,"common.requires":`Gerekli`,"common.total":`Toplam`,"common.lock":`Kilitli`,"common.unlocked":`Açık`,"common.emptySlot":`Bağsız`,"common.noUpgrade":`Rit seçilmedi`,"common.none":`Yok`,"common.reset":`Sıfırla`,"common.rank":`Kademe {rank}`,"common.bosses":`Bosslar`,"common.shards":`Parçalar`,"common.records":`Kayıtlar`,"common.best":`En iyi`,"common.bestTime":`En uzun iniş`,"common.bestKills":`En çok öldürülen`,"common.runs":`İnişler`,"common.metaShards":`Cehennem Parçaları`,"common.continue":`Devam`,"common.press":`{key} tuşuna bas`,"common.seconds":`{s}sn`,"common.levelShort":`Sv {level}`,"common.weaponLevelShort":`Silah {level}`,"common.killsShort":`{count} ölü`,"common.seedShort":`#{seed}`,"common.loading":`Yükleniyor…`}};function Ml(e,t,n={}){let r=(jl[e]??Al)[t]??Al[t]??t;for(let[e,t]of Object.entries(n))r=r.replaceAll(`{${e}}`,String(t));return r}function Nl(e,t=!0){let n=Math.floor(e/60),r=Math.floor(e%60);return`${t?String(n).padStart(2,`0`):n}:${String(r).padStart(2,`0`)}`}var Pl=class{constructor({game:e,save:t,ui:n,audio:r}){this.game=e,this.save=t,this.ui=n,this.audio=r,this.progress=this.emptyProgress(),this.unlockedThisRun=[],this.rewardTotal=0}emptyProgress(){return{kills:0,shards:0,level:1,chests:0,time:0,evolution:0,bossIds:new Set,bossNoHit:0}}reset(){this.progress=this.emptyProgress(),this.unlockedThisRun=[],this.rewardTotal=0}current(e){let t=this.progress;switch(e.type){case`kills`:return t.kills;case`shards`:return t.shards;case`level`:return t.level;case`chests`:return t.chests;case`time`:return t.time;case`evolution`:return t.evolution;case`boss`:return+!!t.bossIds.has(e.target);case`bossNoHit`:return t.bossNoHit;default:return 0}}checkAll(){let e=(e,t)=>Ml(this.save.settings.language,e,t);for(let t of Ol){if(this.save.meta.achievements.includes(t.id))continue;let n=this.current(t.condition),r=t.condition.type===`boss`?1:t.condition.target;this.save.meta.achievementProgress[t.id]=Math.min(n,r),n<r||(this.save.meta.achievements.push(t.id),this.save.meta.achievementProgress[t.id]=r,this.rewardTotal+=t.reward,this.unlockedThisRun.push(t.id),this.save.saveMeta(),this.ui?.toast(e(`achievements.unlocked`,{name:e(t.nameKey)}),{},{icon:t.icon,achievement:!0,duration:3e3}),this.audio?.play(`shard`))}}persist(){this.save.saveMeta()}onKill(e){this.progress.kills=e,this.checkAll()}onShards(e){this.progress.shards=e,this.checkAll()}onLevel(e){this.progress.level=e,this.checkAll()}onChest(e){this.progress.chests=e,this.checkAll()}onTime(e){this.progress.time=Math.floor(e),this.checkAll()}onEvolution(){this.progress.evolution+=1,this.checkAll()}onBoss(e,t=!1){this.progress.bossIds.add(e),t&&(this.progress.bossNoHit+=1),this.checkAll()}},Fl=[{id:`attackSpeed`,nameKey:`upgrade.attackSpeed.name`,descKey:`upgrade.attackSpeed.desc`,icon:`⏵`,maxLevel:5,stat:`attackSpeedBonus`,perLevel:.12,format:`percent`,color:`#e4b764`},{id:`critChance`,nameKey:`upgrade.critChance.name`,descKey:`upgrade.critChance.desc`,icon:`✦`,maxLevel:5,stat:`critChanceBonus`,perLevel:.1,format:`percent`,color:`#f0d179`},{id:`critDamage`,nameKey:`upgrade.critDamage.name`,descKey:`upgrade.critDamage.desc`,icon:`✸`,maxLevel:5,stat:`critDamageBonus`,perLevel:.25,format:`percent`,color:`#f5a56d`},{id:`frostPower`,nameKey:`upgrade.frostPower.name`,descKey:`upgrade.frostPower.desc`,icon:`❄`,maxLevel:5,stat:`frostPower`,perLevel:.2,format:`percent`,color:`#9fdcff`,validFor:[`kael`,`seraphine`]},{id:`projectileCount`,nameKey:`upgrade.projectileCount.name`,descKey:`upgrade.projectileCount.desc`,icon:`➶`,maxLevel:3,stat:`projectileCountBonus`,perLevel:1,format:`flat`,color:`#b9e4ff`,validFor:[`kael`,`seraphine`,`nyx`]},{id:`areaDamage`,nameKey:`upgrade.areaDamage.name`,descKey:`upgrade.areaDamage.desc`,icon:`◉`,maxLevel:5,stat:`areaBonus`,perLevel:.2,format:`percent`,color:`#cfadff`},{id:`movementSpeed`,nameKey:`upgrade.movementSpeed.name`,descKey:`upgrade.movementSpeed.desc`,icon:`➤`,maxLevel:5,stat:`moveSpeedBonus`,perLevel:.06,format:`percent`,color:`#9fe2be`},{id:`maxHealth`,nameKey:`upgrade.maxHealth.name`,descKey:`upgrade.maxHealth.desc`,icon:`♥`,maxLevel:5,stat:`maxHealthBonus`,perLevel:20,format:`flat`,color:`#e76f75`},{id:`armor`,nameKey:`upgrade.armor.name`,descKey:`upgrade.armor.desc`,icon:`◈`,maxLevel:5,stat:`armorBonus`,perLevel:.08,format:`percent`,color:`#c3cad7`},{id:`lifeRecovery`,nameKey:`upgrade.lifeRecovery.name`,descKey:`upgrade.lifeRecovery.desc`,icon:`✚`,maxLevel:5,stat:`lifeOnKillBonus`,perLevel:1,format:`flat`,color:`#b6e88f`},{id:`xpGain`,nameKey:`upgrade.xpGain.name`,descKey:`upgrade.xpGain.desc`,icon:`✧`,maxLevel:5,stat:`xpGainBonus`,perLevel:.15,format:`percent`,color:`#b7a3ff`},{id:`magnetRange`,nameKey:`upgrade.magnetRange.name`,descKey:`upgrade.magnetRange.desc`,icon:`◎`,maxLevel:5,stat:`magnetRangeBonus`,perLevel:20,format:`flat`,color:`#8fe3dd`},{id:`dashCooldown`,nameKey:`upgrade.dashCooldown.name`,descKey:`upgrade.dashCooldown.desc`,icon:`⇥`,maxLevel:6,stat:`dashCooldownReduction`,perLevel:.08,format:`percent`,color:`#d9b3ff`}],Il=Object.fromEntries(Fl.map(e=>[e.id,e])),Ll={kael:{id:`piercingGlacier`,nameKey:`evolution.piercingGlacier.name`,descKey:`evolution.piercingGlacier.desc`,requiresUpgrade:`frostPower`,weaponLevel:5,color:`#bdecff`},brakk:{id:`bloodstorm`,nameKey:`evolution.bloodstorm.name`,descKey:`evolution.bloodstorm.desc`,requiresUpgrade:`lifeRecovery`,weaponLevel:5,color:`#ff6d62`},seraphine:{id:`frozenNova`,nameKey:`evolution.frozenNova.name`,descKey:`evolution.frozenNova.desc`,requiresUpgrade:`areaDamage`,weaponLevel:5,color:`#d7b7ff`},nyx:{id:`voidReaper`,nameKey:`evolution.voidReaper.name`,descKey:`evolution.voidReaper.desc`,requiresUpgrade:`critChance`,weaponLevel:5,color:`#b59cff`}};function Rl(t){let n={};for(let e of Fl)n[e.stat]=0;for(let[e,r]of Object.entries(t)){let t=Il[e];if(!t)continue;let i=Math.min(r,t.maxLevel);n[t.stat]+=i*t.perLevel}return n.critChanceBonus=Math.min(n.critChanceBonus,e.power.critChanceCap-e.power.critChanceBase),n.armorBonus=Math.min(n.armorBonus,e.power.armorCap),n.dashCooldownReduction=Math.min(n.dashCooldownReduction,e.power.dashCooldownReductionCap),n.projectileCountBonus=Math.min(n.projectileCountBonus,e.power.projectileCountCap-1),n.lifeOnKillBonus=Math.min(n.lifeOnKillBonus,e.power.lifeRecoveryCap),n}var zl=`
  precision highp float;
  attribute vec2 iOffset;
  attribute vec2 iSize;
  attribute vec4 iUv;
  attribute float iFlip;
  attribute vec3 iTint;
  attribute float iFlash;
  attribute float iAlpha;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vFlash;
  varying float vAlpha;
  void main() {
    vec2 local = position.xy;
    local.x *= iFlip > 0.5 ? -1.0 : 1.0;
    vec2 worldPosition = iOffset + local * iSize;
    vUv = iUv.xy + uv * iUv.zw;
    vTint = iTint;
    vFlash = iFlash;
    vAlpha = iAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPosition, 0.0, 1.0);
  }
`;function Bl(e,t,n,r={}){if(!e)return null;let i=r.scale??1,a=e.w*(r.scaleX??i),o=e.h*(r.scaleY??i),s=r.anchorX??.5,c=r.anchorY??1,l=r.offsetX??0,u=r.offsetY??0,d=t+(.5-s)*a+l,f=n+(c-.5)*o+u;return{left:d-a/2,right:d+a/2,bottom:f-o/2,top:f+o/2,width:a,height:o,centerX:d,centerY:f}}var Vl=`
  precision highp float;
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vFlash;
  varying float vAlpha;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.02) discard;
    vec3 color = mix(tex.rgb * vTint, vec3(1.0), vFlash);
    gl_FragColor = vec4(color, tex.a * vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`,Hl=class{constructor(e,t=4096){this.texture=e,this.maxInstances=t,this.count=0,this.offset=new Float32Array(t*2),this.size=new Float32Array(t*2),this.uv=new Float32Array(t*4),this.flip=new Float32Array(t),this.tint=new Float32Array(t*3),this.flash=new Float32Array(t),this.alpha=new Float32Array(t);let n=new ha;n.setAttribute(`position`,new J([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3)),n.setAttribute(`uv`,new J([0,0,1,0,1,1,0,1],2)),n.setIndex([0,1,2,0,2,3]),n.setAttribute(`iOffset`,new oi(this.offset,2)),n.setAttribute(`iSize`,new oi(this.size,2)),n.setAttribute(`iUv`,new oi(this.uv,4)),n.setAttribute(`iFlip`,new oi(this.flip,1)),n.setAttribute(`iTint`,new oi(this.tint,3)),n.setAttribute(`iFlash`,new oi(this.flash,1)),n.setAttribute(`iAlpha`,new oi(this.alpha,1)),n.instanceCount=0,n.boundingSphere=new wr(new W(0,0,0),1e7),this.material=new Ii({uniforms:{uMap:{value:e}},vertexShader:zl,fragmentShader:Vl,transparent:!0,depthTest:!0,depthWrite:!1,side:2}),this.mesh=new ni(n,this.material),this.mesh.frustumCulled=!1,this.geometry=n}begin(){this.count=0}draw(e,t,n,r={}){if(!e||this.count>=this.maxInstances)return!1;let i=Bl(e,t,n,r),a=this.count++,o=a*2,s=a*3,c=a*4;this.offset[o]=i.centerX,this.offset[o+1]=i.centerY,this.size[o]=i.width,this.size[o+1]=i.height,this.uv[c]=e.u0,this.uv[c+1]=e.v0,this.uv[c+2]=e.u1-e.u0,this.uv[c+3]=e.v1-e.v0,this.flip[a]=+!!r.flip;let l=r.tint??[1,1,1];return this.tint[s]=l[0],this.tint[s+1]=l[1],this.tint[s+2]=l[2],this.flash[a]=r.flash??0,this.alpha[a]=r.alpha??1,!0}end(){this.geometry.instanceCount=this.count;let e=[[`iOffset`,this.offset],[`iSize`,this.size],[`iUv`,this.uv],[`iFlip`,this.flip],[`iTint`,this.tint],[`iFlash`,this.flash],[`iAlpha`,this.alpha]];for(let[t,n]of e){let e=this.geometry.getAttribute(t);e.array=n,e.needsUpdate=!0}this.mesh.visible=this.count>0}dispose(){this.geometry.dispose(),this.material.dispose()}},Ul=class{constructor(e){this.game=e}render(t,n){let r=this.game,i=new Map;for(let t of r.enemies){if(t.dead&&t.deathTimer<=0||Math.abs(t.x-r.camera.x)>e.internalWidth*.75)continue;let n=r.assets.getSpriteAtlas(t.sprite);i.has(n)||i.set(n,[]),i.get(n).push(t)}i.has(`gothic`)||i.set(`gothic`,[]),i.get(`gothic`).push(r.player);for(let[e,a]of i){let i=t[e]?.actor;if(i&&a.length){i.begin(),a.sort((e,t)=>t.y-e.y);for(let e of a)e===r.player?this.drawPlayer(i,n):this.drawEnemy(i,e,n);e===`gothic`&&r.projectiles.render(i,r.assets,n),e===`gothic`&&r.effects?.render(i,e),i.end()}}}drawEnemy(t,n,r){if(n.isBoss){this.drawBoss(t,n,r);return}let i=this.game,a=n.animator.frame;if(!a)return;let o=n.getRenderPosition(r),s=i.assets.shouldFlipSprite(n.sprite,this.resolveFacing(n)),c=this.getEnemyPose(n),l=i.assets.getPresentation().zoneTints[i.activeZoneId]??[1,1,1],u=[0,1,2].map(e=>(n.tintBase[e]??1)*l[e]),d=n.state===`spawn`?g(1-n.stateTimer/(n.spawnStateDuration??.45),.15,1):1;if(n.state===`windup`){let e=.6+Math.sin(i.time*26)*.25;u=[u[0]*(1+e*.5),u[1]*(1-e*.3),u[2]*(1-e*.25)]}n.slowTimer>0&&(u=[u[0]*.7,u[1]*1.08,u[2]*1.18]);let f=n.flashTimer>0?.9*(n.flashTimer/e.combat.hitFlashDuration)*(i.save.settings.flash??.75):0;n.elite&&t.draw(a,o.x,o.y,{anchorY:a.anchorY??1,flip:s,tint:[1.35,1.1,.55],alpha:.14*c.alpha,offsetY:-2,scaleX:c.scaleX,scaleY:c.scaleY}),t.draw(a,o.x,o.y,{anchorY:a.anchorY??1,flip:s,tint:u,flash:f,alpha:d*c.alpha,scaleX:c.scaleX,scaleY:c.scaleY})}resolveFacing(e){let t=Number(e.vx)||0;return Math.abs(t)>4&&e.state!==`windup`&&e.state!==`strike`?Math.sign(t):Math.sign(e.facing||t||1)}getEnemyPose(e){let t=1,n=1,r=1;if(e.dead){let i=g(1-e.deathTimer/il.enemy.death.duration,0,1);t=1+i*.7,n=Math.max(.05,1-i*.95),r=1-i}else e.hurtTimer>0?(t=il.enemy.hurtPose.scaleX,n=il.enemy.hurtPose.scaleY):e.state===`windup`?(t=il.enemy.windup.scaleX,n=il.enemy.windup.scaleY):e.state===`strike`&&(t=il.enemy.strike.scaleX,n=il.enemy.strike.scaleY);return{scaleX:t,scaleY:n,alpha:r}}drawBoss(t,n,r){let i=this.game,a=n.animator.frame;if(!a)return;let o=n.getRenderPosition(r),s=n.data?.sprite??`angel`,c=this.resolveFacing(n),l=i.assets.shouldFlipSprite(s,c),u=i.assets.getPresentation().zoneTints[i.activeZoneId]??[1,1,1],d=n.flashTimer>0?.9*(n.flashTimer/e.combat.hitFlashDuration)*(i.save.settings.flash??.75):0,f=[0,1,2].map(e=>(n.tintBase[e]??1)*u[e]);if(n.state===`windup`){let e=.55+Math.sin(i.time*22)*.25;f=[f[0]*(1+e*.6),f[1]*(1-e*.35),f[2]*(1-e*.3)]}if(n.id===`drowned_choir`){let e=i.assets.getAnimation(`mire_wraith`,`float`),r=n.animator.frameIndex;[-28,0,28].forEach((n,a)=>{let s=(r+a*2)%e.frames.length,l=e.frames[s],u=a===2?-c:c;t.draw(l,o.x+n,o.y+(a===1?0:10),{anchorY:l.anchorY??1,flip:i.assets.shouldFlipSprite(`mire_wraith`,u),tint:[f[0]*(a===1?1:.65),f[1]*(a===1?1:.8),f[2]],flash:d,alpha:a===1?.95:.45})})}else t.draw(a,o.x,o.y,{anchorY:a.anchorY??1,flip:l,tint:f,flash:d,alpha:n.state===`intro`?.7:1});let p=.12+(n.phaseIndex>0?.08:0)+Math.sin(i.time*4)*.03;t.draw(a,o.x,o.y,{anchorY:a.anchorY??1,flip:l,tint:[f[0]*1.8,f[1]*1.5,f[2]*.8],alpha:p,offsetY:-2})}drawPlayer(e,t){let n=this.game,r=n.player,i=r.getRenderPosition(t),a=r.animator.frame;if(!a)return;let o=n.assets.getPresentation().zoneTints[n.activeZoneId]??[1,1,1],s=r.character.tint,c=[0,1,2].map(e=>s[e]*o[e]),l=n.assets.shouldFlipSprite(r.character.sprite,this.resolveFacing(r));for(let t of r.afterimages){let i=t.life/t.maxLife;e.draw(t.frame,Math.round(t.x),Math.round(t.y),{anchorY:t.frame.anchorY??1,flip:n.assets.shouldFlipSprite(r.character.sprite,t.facing||1),tint:[.55*i+c[0]*.2,.65*i+c[1]*.2,1*i],alpha:i*.3})}if(r.hurtTimer>0&&Math.floor(n.time*22)%2==0)return;let u=r.characterId===`seraphine`?Math.round(Math.sin(r.animTime*3)*1):0,d=+(r.dashTimer>0);if(e.draw(a,i.x+d*r.facing,i.y+u,{anchorY:a.anchorY??1,flip:l,tint:c,flash:r.flashTimer>0?.8*(r.flashTimer/.12)*(n.save.settings.flash??.75):0}),r.characterId===`brakk`&&r.rageTimer>0){let t=.5+Math.sin(n.time*10)*.2;e.draw(a,i.x,i.y+u,{anchorY:a.anchorY??1,flip:l,tint:[1.6,.3,.2],alpha:t*.18})}}},Wl={ink:`#120d10`,ink2:`#24171b`,wood:`#4c2925`,woodHi:`#8a4e36`,iron:`#3f4049`,gold:`#c99a53`,goldHi:`#efd18a`,bone:`#d9c8a5`,stone:`#34313a`,stoneHi:`#5b5564`,frost:`#8fd8f2`,blood:`#8f2732`,void:`#1b1122`};function Gl(e,t,n,r=!1){let i=Wl;e.fillStyle=i.ink,e.fillRect(t,n+(r?2:3),18,10),e.fillStyle=i.wood,e.fillRect(t+1,n+4,16,8),e.fillStyle=i.woodHi,r?(e.fillRect(t+2,n,14,4),e.fillStyle=i.ink,e.fillRect(t+2,n+4,14,2),e.fillStyle=i.goldHi,e.fillRect(t+5,n+3,8,1)):(e.fillRect(t+1,n+3,16,2),e.fillStyle=i.ink,e.fillRect(t+2,n+5,14,1)),e.fillStyle=i.iron,e.fillRect(t+3,n+6,2,6),e.fillRect(t+13,n+6,2,6),e.fillStyle=i.gold,e.fillRect(t+5,n+9,8,2),e.fillStyle=i.ink2,e.fillRect(t+8,n+8,2,3),e.fillStyle=i.goldHi,e.fillRect(t+8,n+8,1,1)}function Kl(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t+3,n+13,18,6),e.fillStyle=r.stone,e.fillRect(t+5,n+14,14,5),e.fillStyle=r.stoneHi,e.fillRect(t+6,n+14,12,1),e.fillStyle=r.ink2,e.fillRect(t+7,n+8,10,6),e.fillStyle=r.stone,e.fillRect(t+8,n+9,8,5),e.fillStyle=r.blood,e.fillRect(t+9,n+10,6,1),e.fillRect(t+11,n+10,2,3),e.fillStyle=r.gold,e.fillRect(t+6,n+7,12,1),e.fillStyle=r.goldHi,e.fillRect(t+11,n+5,2,2)}function ql(e,t,n,r=!1){let i=Wl,a=r?i.frost:i.gold;if(e.fillStyle=i.ink,e.fillRect(t+1,n+4,30,44),e.fillStyle=i.stone,e.fillRect(t+3,n+6,4,38),e.fillRect(t+25,n+6,4,38),e.fillStyle=i.stoneHi,e.fillRect(t+3,n+6,1,38),e.fillRect(t+25,n+6,1,38),e.fillStyle=i.stone,e.fillRect(t+6,n+42,20,4),e.fillStyle=i.ink2,e.fillRect(t+6,n+36,20,7),e.fillStyle=i.void,e.fillRect(t+7,n+8,18,30),e.fillStyle=a,e.globalAlpha=.28,e.fillRect(t+9,n+10,14,27),e.globalAlpha=1,r)e.fillStyle=i.gold,e.fillRect(t+15,n+4,2,40),e.fillRect(t+10,n+7,12,1),e.fillStyle=i.goldHi,e.fillRect(t+15,n+20,2,2),e.fillRect(t+12,n+32,8,1);else{e.fillStyle=i.iron;for(let r of[9,13,17,21,25])e.fillRect(t+r,n+9,1,29);e.fillRect(t+8,n+18,18,1),e.fillRect(t+8,n+30,18,1),e.fillStyle=i.gold,e.fillRect(t+16,n+9,1,29),e.fillStyle=i.goldHi,e.fillRect(t+16,n+20,1,1),e.fillRect(t+16,n+33,1,1)}}function Jl(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t+2,n+12,8,6),e.fillStyle=r.stone,e.fillRect(t+3,n+13,6,5),e.fillStyle=r.iron,e.fillRect(t+4,n+7,4,6),e.fillStyle=r.frost,e.fillRect(t+3,n+2,6,5),e.fillStyle=r.bone,e.fillRect(t+4,n,3,3)}function Yl(e,t,n){let r=Wl;e.fillStyle=r.goldHi,e.fillRect(t+4,n+1,4,1),e.fillRect(t+2,n+2,8,5),e.fillRect(t+4,n+7,4,4),e.fillStyle=r.gold,e.fillRect(t+3,n+3,6,3),e.fillStyle=r.bone,e.fillRect(t+4,n+3,2,2)}function Xl(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t,n+2,48,6),e.fillStyle=r.wood,e.fillRect(t+1,n+3,46,4),e.fillStyle=r.woodHi,e.fillRect(t+2,n+3,44,1),e.fillStyle=r.iron,e.fillRect(t+5,n+5,1,4),e.fillRect(t+41,n+5,1,4),e.fillStyle=r.gold,e.fillRect(t+23,n+1,2,1),e.fillStyle=r.blood,e.fillRect(t+23,n+2,2,1)}function Zl(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t+6,n+7,2,9),e.fillStyle=r.wood,e.fillRect(t+1,n,12,8),e.fillStyle=r.woodHi,e.fillRect(t+2,n+1,10,1),e.fillStyle=r.ink2,e.fillRect(t+3,n+3,8,1),e.fillRect(t+3,n+5,6,1)}function Ql(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t+1,n+1,6,6),e.fillStyle=r.gold,e.fillRect(t+2,n+1,4,6),e.fillRect(t+1,n+2,6,4),e.fillStyle=r.goldHi,e.fillRect(t+3,n+2,2,3),e.fillStyle=r.ink2,e.fillRect(t+4,n+3,1,1)}function $l(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t+3,n,2,2),e.fillRect(t+2,n+2,4,2),e.fillRect(t+1,n+4,6,9),e.fillStyle=r.bone,e.fillRect(t+3,n+1,2,2),e.fillStyle=r.blood,e.fillRect(t+2,n+5,4,7),e.fillStyle=r.goldHi,e.fillRect(t+3,n+6,1,2)}function eu(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t+1,n+1,5,5),e.fillRect(t+5,n+3,7,2),e.fillRect(t+9,n+5,1,2),e.fillRect(t+11,n+5,1,2),e.fillStyle=r.gold,e.fillRect(t+2,n+2,3,3),e.fillRect(t+5,n+4,6,1),e.fillStyle=r.goldHi,e.fillRect(t+3,n+2,1,1),e.fillRect(t+10,n+4,1,1)}function tu(e,t,n){let r=Wl;e.fillStyle=r.ink,e.fillRect(t,n+7,16,3),e.fillStyle=r.stone,e.fillRect(t+1,n+8,14,2);let i=[5,8,6,9,4],a=t+1;for(let t of i)e.fillStyle=r.stoneHi,e.fillRect(a,n+8-t,2,t),e.fillStyle=r.bone,e.fillRect(a,n+8-t,1,1),a+=3;e.fillStyle=r.blood,e.fillRect(t+6,n+6,2,1)}function nu(){let e=document.createElement(`canvas`);e.width=160,e.height=80;let t=e.getContext(`2d`);t.imageSmoothingEnabled=!1,t.clearRect(0,0,e.width,e.height);let n=[[`chest`,2,2,18,14],[`chestOpen`,24,2,18,14],[`altar`,46,2,24,20],[`gate`,74,2,32,48],[`portal`,110,2,32,48],[`brazier`,2,28,12,20],[`shard`,18,28,10,12],[`bossChest`,32,32,18,14],[`spikes`,56,28,16,10],[`plank`,72,32,48,10],[`sign`,144,2,14,16],[`key`,140,30,12,8],[`potion`,124,38,8,14],[`coin`,136,44,8,8]];Gl(t,2,2,!1),Gl(t,24,2,!0),Gl(t,32,32,!1),t.fillStyle=Wl.goldHi,t.fillRect(39,36,4,4),t.fillStyle=Wl.blood,t.fillRect(40,37,2,2),Kl(t,46,2),ql(t,74,2,!1),ql(t,110,2,!0),Jl(t,2,28),Yl(t,18,28),tu(t,56,28),Xl(t,72,32),Zl(t,144,2),eu(t,140,30),$l(t,124,38),Ql(t,136,44);let r=new Si(e);r.magFilter=E,r.minFilter=E,r.generateMipmaps=!1,r.colorSpace=at,r.flipY=!0,r.needsUpdate=!0;let i=t.getImageData(0,0,e.width,e.height).data,a={};for(let[t,r,o,s,c]of n){let n=-1;for(let t=0;t<c;t++)for(let a=0;a<s;a++)i[((o+t)*e.width+r+a)*4+3]>=8&&(n=t);a[t]={id:`generated:${t}`,u0:(r+.01)/e.width,v0:1-(o+c-.01)/e.height,u1:(r+s-.01)/e.width,v1:1-(o+.01)/e.height,w:s,h:c,sx:r,sy:o,anchorY:(n+1)/c}}return{canvas:e,texture:r,frames:a}}function ru(e,t=128){let n=new Hl(e,t);return n.mesh.renderOrder=1,n}function iu(e,t,n,r,i){if(!e)return null;let a=(e.u1-e.u0)/e.w,o=(e.v1-e.v0)/e.h;return{...e,u0:e.u0+t*a,u1:e.u0+(t+r)*a,v1:e.v1-n*o,v0:e.v1-(n+i)*o,w:r,h:i}}var au=class{constructor(t){this.game=t,this.scene=t.renderer.scene,this.assets=t.assets,this.batchEntries={},this.entityRenderer=new Ul(t),this.createBatches(),this.generated=nu(),this.generatedBatch=ru(this.generated.texture),this.generatedBatch.mesh.renderOrder=e.rendering.layers.generated,this.scene.add(this.generatedBatch.mesh)}createBatches(){for(let[t,n]of Object.entries(this.assets.atlases)){let r=new Hl(n.texture,e.rendering.maxSpriteInstances);r.mesh.renderOrder=e.rendering.layers.props,this.scene.add(r.mesh);let i=new Hl(n.texture,e.rendering.maxSpriteInstances);i.mesh.renderOrder=e.rendering.layers.actors+(t===`gothic`?.1:0),this.scene.add(i.mesh),this.batchEntries[t]={prop:r,actor:i}}}prepare(t,n,r){let i=this.game;if(!i.background||!i.tileChunks)return;let a={x:i.camera.x,y:i.camera.y};i.background.update(a.x,a.y,i.time),i.tiledLights?.update(i.time),i.water?.update(i.time),i.tileChunks.update?.(i.time);let o=e.internalWidth/(2*(i.camera.zoom||1)),s=e.internalHeight/(2*(i.camera.zoom||1));i.tileChunks.cull(a.x-o,a.x+o,a.y-s,a.y+s);for(let e of Object.keys(this.batchEntries))this.batchEntries[e].prop.mesh.visible=!1,this.batchEntries[e].actor.mesh.visible=!1;let c=this.batchEntries[i.activeWorld.atlas]?.prop;c&&(c.begin(),this.drawSurfaceDecals(c),this.drawBackdrops(c),this.drawInteractionBases(c),this.drawDecorations(c),this.drawPlatformBodies(c),this.drawGateFrames(c),i.activeZoneId===`dungeon`&&this.drawDungeonPlatforms(c),c.end()),r&&i.player&&(this.generatedBatch.begin(),this.drawInteractables(this.generatedBatch),this.drawTiledObjects(this.generatedBatch),this.drawMovingPlatforms(this.generatedBatch),this.drawHazards(this.generatedBatch),this.generatedBatch.end(),this.entityRenderer.render(this.batchEntries,t))}drawSurfaceDecals(e){let t=this.game;if(t.activeZoneId!==`dungeon`||!t.activeWorld.surfaceDecals?.length)return;let n=this.assets.getPropFrame(`dungeon`,`wallLarge`);for(let r of t.activeWorld.surfaceDecals){let t=this.assets.getTileFrame(`dungeon`,`top`,r.variant),i=null,a=[1,1,1];r.kind===`moss`?(i=iu(t,0,10,16,6),a=[.32,.46,.3]):r.kind===`puddle`?(i=iu(t,0,12,16,4),a=[.28,.4,.52]):r.kind===`crack`?(i=iu(n,12,28,16,2),a=[.05,.04,.04]):r.kind===`rubble`?(i=iu(t,4,12,8,4),a=[.5,.48,.45]):(i=iu(t,0,10,16,5),a=[.34,.33,.32]),i&&e.draw(i,Math.round(r.x),Math.round(r.y),{anchorY:0,flip:r.flip,tint:a,alpha:r.alpha})}}drawBackdrops(e){let t=this.game;if(t.activeWorld.backdrops?.length)for(let n of t.activeWorld.backdrops){let r=this.assets.getPropFrame(t.activeZoneId,n.prop);r&&e.draw(r,Math.round(n.x),Math.round(n.y),{anchorY:r.anchorY??1,tint:n.tint??[.35,.36,.44],alpha:n.alpha??.7,flip:n.flip})}}drawInteractionBases(e){let t=this.game,n=t.activeZoneId,r=iu(this.assets.getTileFrame(n,`body`,0),0,0,16,4);if(!r)return;let i=n===`dungeon`?[.2,.2,.24]:[.3,.27,.22];for(let n of t.activeWorld.interactions)(n.type===`chest`||n.type===`altar`)&&e.draw(r,Math.round(n.x),Math.round(n.y+1),{anchorY:0,tint:i,alpha:.62})}drawDecorations(e){let t=this.game,n=this.assets.getPresentation().zoneTints[t.activeZoneId]??[1,1,1],r=t.activeZoneId===`dungeon`,i=r?[1.36,1.38,1.52]:n.map(e=>e*.84);for(let a of t.activeWorld.decorations){let o=this.assets.getPropFrame(t.activeZoneId,a.prop);if(a.prop.startsWith(`torch`)){let e=Math.floor(t.time*6+a.x*.01)%4;o=this.assets.getFrame(`dungeon`,`prop:dungeon:torch${e}`)??o}if(!o)continue;let s=a.tint?[0,1,2].map(e=>a.tint[e]*n[e]):i;if(e.draw(o,Math.round(a.x),Math.round(a.y+(a.yOffset??0)),{anchorY:o.anchorY??1,flip:a.flip,tint:s,alpha:r?a.alpha??1:a.alpha??.8}),r&&a.glow&&Math.random()<.035){let e=.7+Math.sin(t.time*18+a.x)*.3;t.glowParticles.emit({x:a.x+(Math.random()-.5)*5,y:a.y+(a.yOffset??0)+42,vx:0,vy:5,gravity:-2,drag:1,life:.55,sizeX:3,sizeY:3,color:Z.ember,alpha:.16*e})}}}drawPlatformBodies(t){let n=this.game,r=n.activeZoneId,i=n.activeWorld.platformRuns;if(!i?.length)return;let a=this.assets.getGroupWidth(r),o=Array.from({length:a},(e,t)=>this.assets.getTileFrame(r,`body`,t)).filter(Boolean),s=this.assets.getTileFrame(r,`bodyLeft`)??o[0],c=this.assets.getTileFrame(r,`bodyRight`)??o.at(-1);if(!o.length)return;let l={cemetery:[.62,.58,.46],church:[.62,.6,.72],swamp:[.38,.5,.35],dungeon:[.52,.51,.58],forest:[.45,.52,.44]}[r]??[1,1,1],u=l.map(e=>e*.66),d=r===`forest`?this.assets.getPropFrame(`forest`,`log`):null,f=r===`swamp`?this.assets.getPropFrame(`swamp`,`root`):null;for(let n of i){let i=n.row*e.tile;for(let r=0;r<2;r++)for(let a=n.x;a<n.x+n.w;a+=e.tile){let d=a===n.x,f=a+e.tile>=n.x+n.w,p=d?s:f?c:o[Math.floor(a/e.tile)%o.length];t.draw(p,a+e.tile/2,i-r*e.tile,{anchorY:0,tint:r===0?l:u})}let a=[{x:n.x+e.tile/2,frame:s},{x:n.x+n.w-e.tile/2,frame:c}],p=r===`dungeon`?2:1;for(let n of a)for(let r=0;r<p;r++)t.draw(n.frame,n.x,i-(2+r)*e.tile,{anchorY:0,tint:u});d&&n.w>=e.tile*3?t.draw(d,n.x+n.w/2,i-30,{anchorY:0,tint:[.34,.42,.32],alpha:.9}):f&&n.w>=e.tile*3&&t.draw(f,n.x+n.w/2,i-26,{anchorY:0,tint:[.32,.43,.3],alpha:.9})}}drawGateFrames(e){let t=this.game;if(t.activeWorld.tiled)return;let n=t.activeZoneId,r=this.assets.getGroupWidth(n),i=Array.from({length:r},(e,t)=>this.assets.getTileFrame(n,`body`,t)).filter(Boolean);if(!i.length)return;let a=n===`dungeon`?[.48,.49,.58]:n===`church`?[.55,.5,.7]:[.38,.35,.32],o=(t,n,r=0)=>{let o=i[r%i.length];e.draw(o,Math.round(t),Math.round(n),{anchorY:1,tint:a})};for(let e of t.activeWorld.transitions){let t=e.y+1,n=e.x;for(let e of[-24,24])o(n+e,t+16,0),o(n+e,t+32,1),o(n+e,t+48,2);o(n-16,t+48,3),o(n+16,t+48,3),o(n,t+48,2),o(n,t+64,0)}if(t.activeWorld.finalGate){let e=t.activeWorld.finalGate,n=e.y+1;for(let t of[-28,28])o(e.x+t,n+16,0),o(e.x+t,n+32,1),o(e.x+t,n+48,2);o(e.x-16,n+48,3),o(e.x+16,n+48,3),o(e.x,n+48,2),o(e.x,n+64,0)}}drawInteractables(e){let t=this.game,n=this.generated.frames,r=t.time,i=this.assets.getPresentation().zoneTints[t.activeZoneId]??[1,1,1],a=e=>[e[0]/255*i[0],e[1]/255*i[1],e[2]/255*i[2]];for(let i of t.activeWorld.interactions){if(i.secret&&!i.opened&&t.player&&t.player.x<i.x-32)continue;let o=n.chest;if(i.type===`altar`?o=n.altar:i.type===`sign`?o=n.sign:i.opened?o=n.chestOpen:i.type===`chestBoss`&&(o=n.bossChest),!o)continue;let s=.75+Math.sin(r*3+i.x*.03)*.15;e.draw(o,Math.round(i.x),Math.round(i.y+1),{anchorY:o.anchorY??1,tint:a(i.type===`altar`?[220,175,130]:[220,200,165]),alpha:s})}for(let r of t.activeWorld.transitions){let i=r.type===`portal`?n.portal:n.gate;if(!i)continue;let o=r.requiresBoss&&!t.zoneStates[t.activeZoneId]?.bossDefeated,s=t.transition?.gateId===r.id?Math.max(0,Math.min(1,1-t.transition.timer/(t.transition.duration||.7))):0,c=s>0?[1.2+s*.3,1+s*.2,.68]:a([205,180,140]);e.draw(i,Math.round(r.x),Math.round(r.y+1+s*7),{anchorY:i.anchorY??1,tint:o?[.8,.42,.4]:c,alpha:.85-s*.45}),s>0&&Math.random()<.35&&t.glowParticles.emit({x:r.x+(Math.random()-.5)*24,y:r.y+8+Math.random()*40,vx:0,vy:12,life:.55,sizeX:2,sizeY:2,color:Z.gold,alpha:.4*s})}if(t.activeWorld.finalGate){let r=t.activeWorld.finalGate,i=!r.requiresItem||!!t.run?.flags?.[r.requiresItem],a=t.run.shards.length>=r.requiresShards&&i;e.draw(n.portal,Math.round(r.x),Math.round(r.y+1),{anchorY:n.portal.anchorY??1,tint:a?[1.2,1,.68]:[.55,.5,.6],alpha:a?.9:.55}),a&&Math.random()<.12&&t.glowParticles.emit({x:r.x+(Math.random()-.5)*20,y:r.y+20+Math.random()*18,vx:0,vy:16,life:.5,sizeX:1,sizeY:2,color:Z.gold,alpha:.5})}if(t.boss&&!t.boss.dead)for(let r of t.arenaGatePositions)e.draw(n.portal,Math.round(r.x-12),Math.round(r.y+4),{anchorY:n.portal.anchorY??1,tint:[1.2,.5,.45],alpha:.35}),Math.random()<.22&&t.glowParticles.emit({x:r.x+(Math.random()-.5)*10,y:r.y+30+Math.random()*200,vx:0,vy:25,life:.4,sizeX:1,sizeY:5,color:Z.blood,alpha:.25})}drawTiledObjects(e){let t=this.game,n=t.activeWorld;if(!n?.tiled)return;let r=this.generated.frames,i=t.time;for(let t of n.checkpoints??[]){if(t.id===`spawn`||!r.brazier)continue;let n=.7+Math.sin(i*2.4+t.x*.02)*.18;e.draw(r.brazier,Math.round(t.x),Math.round(t.y+1),{anchorY:r.brazier.anchorY??1,tint:t.activated?[.52,1.08,.92]:[.92,.7,.42],alpha:n})}for(let t of n.pickups??[]){if(t.collected)continue;let n=r.coin,a=[1,1,1];if(t.type===`health_potion`?(n=r.potion,a=[1.15,.9,.88]):t.type===`dungeon_key`&&(n=r.key,a=[1.14,1.02,.7]),!n)continue;let o=Math.round(Math.sin(i*2.8+t.x*.05)*2);e.draw(n,Math.round(t.x),Math.round(t.y+o),{anchorY:n.anchorY??1,tint:a,alpha:.92})}}drawDungeonPlatforms(e){let t=this.game.activeWorld?.movingPlatforms;if(!t?.length)return;let n=[this.assets.getTileFrame(`dungeon`,`top`,0),this.assets.getTileFrame(`dungeon`,`top`,1),this.assets.getTileFrame(`dungeon`,`top`,2)].filter(Boolean);if(n.length<3)return;let r=[0,1,2].map(e=>this.assets.getTileFrame(`dungeon`,`body`,e)).filter(Boolean),i=this.assets.getTileFrame(`dungeon`,`bodyLeft`)??r[0],a=this.assets.getTileFrame(`dungeon`,`bodyRight`)??r.at(-1);for(let o of t){for(let t=0;t<3;t++)e.draw(n[t],Math.round(o.x-16+t*16),Math.round(o.y),{anchorY:0,alpha:1});for(let t=0;t<3;t++){let n=t===0?i:t===2?a:r[1];n&&e.draw(n,Math.round(o.x-16+t*16),Math.round(o.y-16),{anchorY:0,tint:[.5,.49,.56]})}for(let t of[{x:o.x-16,frame:i},{x:o.x+16,frame:a}])t.frame&&e.draw(t.frame,Math.round(t.x),Math.round(o.y-32),{anchorY:0,tint:[.38,.37,.43]})}}drawMovingPlatforms(e){let t=this.game,n=t.activeWorld?.movingPlatforms;if(!n?.length||t.activeZoneId===`dungeon`)return;let r=this.generated.frames.plank;if(!r)return;let i=t.activeZoneId===`forest`?[.72,.96,.78]:t.activeZoneId===`dungeon`?[.72,.75,.8]:[1,.96,.86];for(let a of n)e.draw(r,Math.round(a.x),Math.round(a.y-6),{anchorY:0,tint:i.map(e=>e*.52),alpha:.82}),e.draw(r,Math.round(a.x),Math.round(a.y),{anchorY:0,tint:i,alpha:.96}),Math.random()<.08&&t.glowParticles.emit({x:a.x+(Math.random()-.5)*36,y:a.y-1,vx:0,vy:7,life:.32,sizeX:1,sizeY:1,color:Z.gold,alpha:.2})}drawHazards(e){let t=this.game;if(t.activeWorld?.hazards&&!t.activeWorld.tiled)for(let n of t.activeWorld.hazards){if(n.kind===`water`)continue;let r=this.generated.frames.spikes;if(r){for(let i=n.x;i<n.x+n.w;i+=16){let a=Math.min(16,n.x+n.w-i);e.draw(r,Math.round(i+a/2),Math.round(n.y),{anchorY:r.anchorY??1,tint:t.activeZoneId===`forest`?[.6,.85,.55]:[.85,.8,.72],alpha:.9})}Math.random()<.04&&t.glowParticles.emit({x:n.x+Math.random()*n.w,y:n.y+4,vx:0,vy:10,life:.35,sizeX:1,sizeY:1,color:Z.blood,alpha:.4})}}}dispose(){for(let e of Object.values(this.batchEntries))e.prop.dispose(),e.actor.dispose();this.batchEntries={},this.generatedBatch.dispose(),this.generated.texture.dispose()}},ou=class{constructor(e){this.game=e}updateCheckpoint(){let t=this.game,n=t.activeWorld;if(n.tiled){for(let e of n.checkpoints??[])e.activated||Math.abs(e.x-t.player.x)>22||Math.abs(e.y-t.player.y)>26||(e.activated=!0,t.run.checkpoint={x:e.x,y:e.y},e.heal?(t.player.health=Math.min(t.player.maxHealth,t.player.health+t.player.maxHealth*.35),t.ui?.toast(`toast.checkpointHeal`,{},{icon:`✚`}),t.glowParticles.burst([Z.bone,Z.gold],e.x,e.y+10,18,{speed:60,life:.7,gravity:-35,size:2})):t.ui?.toast(`toast.checkpoint`),t.audio.play(`ui`));return}let r=e.world.roomWidth*e.tile,i=Math.floor(t.player.x/r),a=n.rooms?.[i];a&&i!==t.lastRoom&&(t.lastRoom=i,(!n.arena||t.zoneStates[t.activeZoneId]?.bossDefeated)&&(t.run.checkpoint={x:Math.max(32,a.start*e.tile+24),y:n.surface}))}updatePrompt(){let t=this.game;if(!t.player||!t.activeWorld){t.currentInteraction=null,t.prompt=null;return}let r=t.player.x,i=t.player.y+t.player.height*.5,a=[];for(let e of t.activeWorld.interactions)e.opened||a.push(e);for(let e of t.activeWorld.transitions)a.push(e);t.activeWorld.finalGate&&a.push(t.activeWorld.finalGate);let o=null,s=e.interaction.promptRange;for(let e of a){let t=e.x-r,n=e.y+12-i,a=Math.hypot(t,n);a<s&&(s=a,o=e)}if(t.currentInteraction=o,!o){t.prompt=null;return}let c=t.ui?.t??(e=>e),l=c(`action.openChest`);if(o.type===`altar`)l=c(`action.touchAltar`);else if(o.type===`sign`)l=c(`action.readSign`);else if(o.type===`finalGate`){let e=!o.requiresItem||!!t.run?.flags?.[o.requiresItem],n=t.run.shards.length>=o.requiresShards;l=c(e&&n?`action.enterGate`:`action.gateLocked`)}else if(o.type===`chestBoss`)l=c(`action.openChest`);else if(o.target){let e=n[o.target];l=o.labelKey===`zone.return`?c(`zone.return`,{zone:c(e.nameKey)}):c(`action.usePortal`,{zone:c(e.nameKey)})}t.prompt={text:l}}interactWith(e){let t=this.game;if(e){if(e.type===`finalGate`){if(e.requiresItem&&!t.run.flags?.[e.requiresItem]){t.ui?.toast(`zone.gateLockedItem`,{},{icon:`⌘`}),t.audio.play(`empty`);return}t.run.shards.length>=e.requiresShards?(t.audio.play(`shard`),t.endRun(`victory`)):(t.ui?.toast(`zone.finalGateLocked`,{},{icon:`◆`}),t.audio.play(`empty`))}else if(e.type===`sign`){let n=e.textKey?t.ui?.t?.(e.textKey)??e.text:e.text;t.ui?.toastText?.(n,{icon:`✎`,duration:3600}),t.audio.play(`ui`)}else if(e.type===`altar`)this.useAltar(e);else if(e.type===`chest`||e.type===`chestBoss`)this.openChest(e);else if(e.target){let n=t.zoneStates[t.activeZoneId];if(e.requiresBoss&&!n?.bossDefeated){t.ui?.toast(`zone.sealed`,{},{icon:`▣`}),t.audio.play(`empty`);return}this.startTransition(e.target,e.id)}}}openChest(e){let t=this.game;if(e.opened)return;e.opened=!0,t.run.chestsOpened+=1,t.gameAchievements?.onChest(t.run.chestsOpened),e.loot&&(t.run.flags=t.run.flags??{},t.run.flags[e.loot]=!0,t.ui?.toast(e.loot===`dungeon_key`?`item.dungeonKey`:`toast.chest`,{},{icon:e.loot===`dungeon_key`?`⌘`:`▣`,achievement:e.loot===`dungeon_key`,duration:2400}),t.audio.play(`shard`));let n=e.type===`chestBoss`||e.secret,i=t.progression.grantChestReward(n);t.audio.play(`chest`),t.camera.addShake(1.2),t.glowParticles.burst([Z.gold,Z.white],e.x,e.y+14,20,{speed:80,spread:Math.PI*2,life:.8,gravity:-50,drag:1.4,size:2}),i.type===`upgrade`?t.ui?.toast(i.data.nameKey,{},{icon:i.data.icon,achievement:!0}):i.type===`xp`?(t.xpOrbs.spawn(i.amount,e.x,e.y+12,{big:!0}),t.ui?.toast(`toast.chest`,{},{icon:`✦`})):t.ui?.toast(`toast.heal`,{},{icon:`✚`});let a=r[r.length-1];e.type===`chestBoss`&&t.activeZoneId===a&&setTimeout(()=>{t.state===`playing`&&t.endRun(`victory`)},1400)}useAltar(e){let t=this.game;if(e.used){t.ui?.toast(`toast.nothing`);return}let n=Math.ceil(t.player.maxHealth*.2);if(t.player.health<=n+1){t.ui?.toast(`toast.altarFull`,{},{icon:`✚`});return}e.used=!0,t.player.health-=n,t.player.flashTimer=.2,t.ui?.spawnDamageNumber(t.player.x,t.player.y+28,n,`player`);let r=t.progression.grantChestReward(!0);t.audio.play(`ability`),t.camera.addShake(3),t.glowParticles.burst([Z.blood,Z.ember],e.x,e.y+14,24,{speed:110,life:.6,gravity:40,size:2.5}),t.ui?.toast(`toast.altar`,{},{icon:`☩`}),r.type===`upgrade`&&t.ui?.toast(r.data.nameKey,{},{icon:r.data.icon})}startTransition(e,t=null){let n=this.game;n.state===`playing`&&(n.state=`transition`,n.transition={target:e,gateId:t,timer:.7,duration:.7},n.ui?.clearToasts?.(),n.ui?.setFade(!0),n.audio.play(`gate`),n.audio.stopAmbient())}updateTransition(e){let t=this.game;if(!t.transition||(t.transition.timer-=e,t.transition.timer>0))return;let n=t.transition.target;t.transition=null,this.performTransition(n),t.ui?.setFade(!1),t.state=`playing`,t.input.clear()}performTransition(t){let n=this.game,r=n.worlds[t];if(!r)return;let i=n.activeZoneId;n.enemies.length=0,n.projectiles.clear(),n.xpOrbs.clear(),n.traps=[],n.particles.clear(),n.glowParticles.clear(),n.effects.clear(),n.bossHazards=[],n.boss=null,n.arenaGatePositions=[];let a=r.transitions.find(e=>e.target===i),o=r.spawn;if(a){let t=a.x<r.width*e.tile*.5?76:-76;o={x:a.x+t,y:r.surface}}n.setZone(t,o),n.zoneStates[t].seen=!0,n.save.meta.seenZones.includes(t)||(n.save.meta.seenZones.push(t),n.save.saveMeta()),n.player.facing=o.x<r.width*e.tile*.5?1:-1,n.player.setPosition(o.x,o.y),n.run.checkpoint={...o},n.spawnDirector.reset(n.seed,t),n.spatialHash=null,n.lastRoom=-1,n.ui?.setZoneTheme(n.activeZone),n.ui?.toast(`zone.entered`,{zone:n.ui.t(n.activeZone.nameKey)},{duration:1600}),n.audio.startAmbient(t),n.snapCameraToPlayer(),this.updatePrompt()}},su=class{constructor(e){this.game=e}update(e,t){e.dead||e.update(t,this.game.activeWorld,this.game.player,this.game)}applySpikeDamage(){let t=this.game,n=t.activeWorld;if(n?.hazards?.length)for(let r of t.enemies){if(r.dead||r.hazardCooldown>0)continue;let i=r.getBounds();n.hazards.some(e=>e.kind===`spikes`&&i.x<e.x+e.w&&i.x+i.w>e.x&&i.y<e.y+e.h&&i.y+i.h>e.y)&&(r.hazardCooldown=e.hazards.enemyHitInterval,t.combat.damageEnemy(r,e.hazards.spikeDamage*e.hazards.enemyDamageMultiplier,{element:`trap`,knockback:0,sourceX:r.x}))}}handleEnemyEvents(e){let t=this.game;for(let n of e)switch(n.type){case`windup`:{let e=n.enemy,r=e.behavior===`ranged`?Z.shadow:Z.ember;t.glowParticles.burst([r,Z.white],e.x,e.y+e.height+4,5,{speed:18,spread:Math.PI,direction:Math.PI/2,life:.45,gravity:-10,size:1.6}),e.elite&&t.audio.play(`elite`,{throttle:350});break}case`charge`:case`dive`:t.audio.play(`swingHeavy`),t.particles.burst([Z.bone,Z.ember],n.enemy.x,n.enemy.y+4,8,{speed:50,spread:1.4,direction:-n.enemy.facing,life:.3,gravity:20,size:1.5});break;case`cast`:t.glowParticles.burst([Z.shadow,Z.soul],n.enemy.x,n.enemy.y+20,7,{speed:30,life:.3,gravity:-5,size:2});break;case`teleport`:t.glowParticles.burst([Z.shadow,Z.soul],n.fromX,n.enemy.y+16,12,{speed:60,life:.35,gravity:0,size:2}),t.glowParticles.burst([Z.shadow,Z.soul],n.toX,n.enemy.y+16,12,{speed:60,life:.35,gravity:0,size:2});break;case`explode`:t.camera.addShake(4),t.glowParticles.burst([Z.ember,Z.blood,Z.gold],n.enemy.x,n.enemy.y+14,28,{speed:150,life:.5,gravity:80,size:3});break;case`roar`:case`fightStart`:t.camera.addShake(n.type===`roar`?4:1.5),n.type===`roar`&&t.audio.play(`boss`);break;case`telegraph`:{let e=n.boss;t.glowParticles.burst([n.color??Z.ember,Z.blood,Z.white],e.x,e.y+e.height*.8,14,{speed:55,spread:Math.PI,direction:Math.PI/2,life:.55,gravity:-20,drag:1.5,size:2});break}case`lunge`:case`dive`:t.audio.play(`swingHeavy`);break;case`slam`:t.camera.addShake(4),t.audio.play(`hit`,{pitch:.7});break;case`phase`:t.camera.addShake(6),t.ui?.toast(`boss.phase`,{phase:n.phase},{icon:`◆`,achievement:!0,duration:2200}),t.glowParticles.burst([n.boss.data.accent,Z.white],n.boss.x,n.boss.y+30,30,{speed:150,life:.7,gravity:0,drag:1.4,size:3});break;case`pillars`:t.audio.play(`ability`);break;case`summon`:t.glowParticles.burst([Z.shadow,Z.soul],n.boss.x,n.boss.y+20,20,{speed:80,life:.6,gravity:0,size:2});break;case`blink`:t.glowParticles.burst([Z.shadow,Z.soul],n.fromX,n.boss.y+20,15,{speed:80,life:.4,gravity:0,size:2})}}handlePlayerEvents(t){let n=this.game;for(let r of t)switch(r.type){case`fell`:n.respawnFromFall();break;case`hazardHit`:n.player.takeDamage(e.hazards.spikeDamage,{type:`hazard`}),n.audio.play(`playerHurt`);break;case`playerHurt`:n.run.damageTaken+=r.amount,n.ui?.flashHurt(n.player.health<n.player.maxHealth*.25),n.audio.play(`playerHurt`),n.ui?.spawnDamageNumber(n.player.x,n.player.y+28,Math.round(r.amount),`player`),n.camera.addShake(2.5);break;case`playerDeath`:n.audio.play(`death`),n.camera.addShake(5);break;case`jump`:n.audio.play(`jump`);break;case`land`:r.velocity>250&&n.camera.addShake(.8);break;case`dash`:n.audio.play(`dash`),n.camera.addShake(1.2);break;case`dashTrail`:Math.random()<.4&&n.glowParticles.emit({x:r.x-r.facing*8,y:r.y+12,vx:-r.facing*18,vy:2,gravity:0,drag:3,life:.24,sizeX:3,sizeY:2,color:n.player.character.accent,alpha:.35});break;case`spawnProjectile`:n.projectiles.spawnPlayer({...r,source:n.player});break;case`meleeStrike`:this.resolveMelee(r);break;case`burst`:n.combat.areaDamage(r.x,r.y,r.radius,r.damage,{direction:r.facing??1,knockback:120,element:r.element,heavy:r.heavy}),n.combat.shockwave({x:r.x,y:r.y,color:r.color,heavy:r.heavy}),n.camera.addShake(r.heavy?3.2:1.8),n.audio.play(`ability`);break;case`specialTrap`:this.addFrostTrap(r),n.audio.play(`ability`);break;case`shock`:n.combat.shockwave({x:r.x,y:r.y,color:r.color,heavy:r.heavy});break;case`heavyTrail`:n.particles.burst([r.color,Z.white],r.x+r.facing*14,r.y+18,10,{speed:60,spread:.8,direction:r.facing>0?0:Math.PI,life:.3,gravity:20,size:2});break;case`castBurst`:n.glowParticles.burst([r.color,Z.frost,Z.white],r.x,r.y,12,{speed:55,life:.35,gravity:0,drag:2,size:2});break;case`blink`:n.glowParticles.burst([Z.frost,Z.shadow],r.fromX,r.y,14,{speed:65,life:.3,gravity:0,size:2}),n.glowParticles.burst([Z.frost,Z.white],r.toX,r.y,16,{speed:85,life:.35,gravity:0,size:2}),n.audio.play(`blink`);break;case`rage`:n.audio.play(`ability`),n.camera.addShake(3),n.glowParticles.burst([Z.blood,Z.ember],r.x,r.y+14,24,{speed:100,life:.45,gravity:-20,size:2});break;case`muzzle`:n.audio.play(`projectile`),n.glowParticles.burst([r.color,Z.white],r.x,r.y,5,{speed:45,spread:r.facing>0?1:Math.PI,direction:r.facing>0?0:Math.PI,life:.18,gravity:0,size:1.5})}}resolveMelee(t){let n=this.game,r=t.facing>0?t.x:t.x-t.range,i=t.y-2,a=t.height?t.height:n.player.height+t.arcHeight*.6,o=0;n.spatialHash&&n.spatialHash.query(r,i,t.range,a,e=>{let s=n.enemies[e];if(!s||s.dead)return;let c=s.getBounds();c.x<r+t.range&&c.x+c.w>r&&c.y<i+a&&c.y+c.h>i&&n.combat.damageEnemy(s,t.damage,{direction:t.facing,knockback:t.knockback,heavy:t.heavy,sourceX:t.x,sourceY:t.y+16})>0&&o++}),n.combat.meleeArc({x:t.x,y:t.y,facing:t.facing,range:t.range,height:a,color:t.color,heavy:t.heavy});let s=!1;n.activeWorld.map.forEachTileInRect(r,i,t.range,a,(t,n,r)=>{r===4&&(this.breakTileAt(t,n,t*e.tile+e.tile/2,n*e.tile+8),s=!0)}),s&&(n.addHitstop(2),n.audio.play(`hit`)),n.audio.play(t.heavy?`swingHeavy`:`swing`,{throttle:30}),o>0&&n.camera.addShake(t.heavy?3:1.2)}breakTileAt(e,t,n,r){let i=this.game,a=i.activeWorld.map;if(!a.breakTile(e,t))return!1;i.tileChunks&&i.tileChunks.rebuildAtTile(e,t);for(let n of[-1,1])a.getType(e,t+n)===4&&(a.breakTile(e,t+n),i.tileChunks&&i.tileChunks.rebuildAtTile(e,t+n));return i.particles.burst([Z.stone,[102,83,65],Z.bone],n,r,12,{speed:90,spread:Math.PI*2,life:.55,gravity:340,drag:.9,size:2}),i.glowParticles.burst([Z.gold,Z.white],n,r,5,{speed:60,life:.3,gravity:40,size:1}),i.camera.addShake(1.8),!0}addFrostTrap(e){let t=this.game;t.traps.push({x:e.x,y:e.y,age:0,duration:e.duration,damage:e.damage,radius:e.radius,tick:0}),t.combat.areaDamage(e.x,e.y+8,e.radius,e.damage,{direction:1,knockback:40,element:`frost`}),t.glowParticles.burst([Z.frost,Z.white],e.x,e.y+8,22,{speed:60,spread:Math.PI*2,life:.6,gravity:0,drag:2,size:2})}updateTraps(e){let t=this.game;for(let n=t.traps.length-1;n>=0;n--){let r=t.traps[n];r.age+=e,r.tick-=e,r.tick<=0&&(r.tick=.35,t.glowParticles.burst([Z.frost,Z.frostDeep],r.x,r.y+8,2,{speed:22,spread:Math.PI*2,life:.6,gravity:-15,drag:1,size:1})),t.spatialHash&&t.spatialHash.query(r.x-r.radius,r.y,r.radius*2,48,e=>{let n=t.enemies[e];if(!n||n.dead)return;let i=n.x-r.x;Math.abs(i)<r.radius&&n.applySlow?.(1.2,.45)}),r.age>=r.duration&&(t.glowParticles.burst([Z.frost,Z.white],r.x,r.y+8,16,{speed:80,life:.5,gravity:40,size:2}),t.traps.splice(n,1))}}onEnemyDefeated(e){let t=this.game;e.countedDeath||(e.countedDeath=!0,t.combat.enemyDeath(e),t.run.kills+=1,t.xpOrbs.spawnFromEnemy(e.x,e.y+e.height*.5,e.def.xp),t.player.onEnemyKilled(),t.gameAchievements?.onKill?.(t.run.kills),e.isBoss?t.onBossDefeated(e):e.elite&&t.ui?.toast(`toast.elite`,{},{icon:`✦`}))}findNearestEnemy(e,t,n,r=null){let i=this.game,a=null,o=n*n;for(let n=0;n<i.enemies.length;n++){if(r?.has(n))continue;let s=i.enemies[n];if(!s||s.dead)continue;let c=s.x-e,l=s.y+s.height/2-t,u=c*c+l*l;u<o&&(o=u,a=s)}return a}},cu={cemetery:{id:`mourning_maw`,zone:`cemetery`,nameKey:`boss.mourningMaw.name`,titleKey:`boss.mourningMaw.title`,sprite:`hellgato`,animation:`run`,tint:[1.34,.58,.52],accent:`#c8483d`,maxHealth:720,phases:[{threshold:1,speed:62,patterns:[`lunge`,`shockwave`,`summon`],cooldowns:{lunge:3.1,shockwave:4.5,summon:7.5},damage:20},{threshold:.5,speed:88,patterns:[`lunge`,`double_lunge`,`shockwave`,`summon`],cooldowns:{lunge:2.2,double_lunge:3.4,shockwave:3.3,summon:6},damage:27}],width:68,height:36,visualOffsetY:8,shard:`cemetery`,arenaWidth:30,deathEffect:`ember`,xp:140},church:{id:`seraph_ash`,zone:`church`,nameKey:`boss.seraphAsh.name`,titleKey:`boss.seraphAsh.title`,sprite:`angel`,animation:`idle`,attackAnimation:`attack`,tint:[1.16,.94,.72],accent:`#f1cf87`,maxHealth:940,phases:[{threshold:1,speed:40,patterns:[`feather_volley`,`dive`,`pillars`],cooldowns:{feather_volley:3.8,dive:4.2,pillars:6.5},damage:22},{threshold:.55,speed:58,patterns:[`radial_volley`,`dive`,`pillars`,`feather_volley`],cooldowns:{radial_volley:4.2,dive:3.1,pillars:4.5,feather_volley:2.6},damage:30}],width:52,height:82,visualOffsetY:10,flying:!0,shard:`church`,arenaWidth:32,deathEffect:`soul`,xp:190},swamp:{id:`drowned_choir`,zone:`swamp`,nameKey:`boss.drownedChoir.name`,titleKey:`boss.drownedChoir.title`,sprite:`mire_wraith`,animation:`float`,tint:[.62,1.06,.82],accent:`#7ee1aa`,maxHealth:820,phases:[{threshold:1,speed:50,patterns:[`soul_burst`,`summon_wisps`,`tidal_wave`],cooldowns:{soul_burst:3.2,summon_wisps:6.8,tidal_wave:5.2},damage:18},{threshold:.5,speed:76,patterns:[`soul_burst`,`spiral_souls`,`summon_wisps`,`tidal_wave`,`blink`],cooldowns:{soul_burst:2.3,spiral_souls:4.4,summon_wisps:5.5,tidal_wave:3.8,blink:5},damage:26}],width:58,height:72,visualOffsetY:14,flying:!0,shard:`swamp`,arenaWidth:30,deathEffect:`soul`,xp:170}},lu=class{constructor({data:e,assets:t,game:n,x:r,y:i}){this.data=e,this.def={...e,elite:!0,cost:0,xp:e.xp??160,deathEffect:e.deathEffect??`soul`},this.id=e.id,this.isBoss=!0,this.assets=t,this.game=n,this.animator=new al(t,e.sprite),this.width=e.width,this.height=e.height,this.x=r,this.y=i,this.prevX=r,this.prevY=i,this.vx=0,this.vy=0,this.facing=-1,this.flying=!!e.flying,this.tintBase=e.tint??[1,1,1],this.maxHealth=e.maxHealth,this.health=e.maxHealth,this.phaseIndex=0,this.phase=e.phases[0],this.state=`intro`,this.stateTimer=1.4,this.pattern=null,this.patternCooldown=2.5,this.cooldowns={};for(let e of this.phase.patterns)this.cooldowns[e]=1.2;this.flashTimer=0,this.iframes=0,this.invuln=0,this.dead=!1,this.events=[],this.playAnimation(e.animation??`idle`),this.rng=new h(f(n.seed??1,e.id)),this.hoverPhase=Math.random()*Math.PI*2,this.attackCount=0,this.contactCooldown=0,this.strikeHit=!1,this.slowTimer=0,this.slowFactor=1,this.tintBase=e.tint??[1,1,1],this.active=!0,this.events.push({type:`roar`,boss:this})}get isDamageable(){return!this.dead&&this.state!==`intro`&&this.invuln<=0}get center(){return{x:this.x,y:this.y+this.height/2}}getBounds(){return{x:this.x-this.width/2,y:this.y,w:this.width,h:this.height}}getRenderPosition(e){return{x:Math.round(this.prevX+(this.x-this.prevX)*e),y:Math.round(this.prevY+(this.y-this.prevY)*e)}}update(e,t,n,r){if(!this.dead){this.prevX=this.x,this.prevY=this.y,this.flashTimer=Math.max(0,this.flashTimer-e),this.invuln=Math.max(0,this.invuln-e),this.iframes=Math.max(0,this.iframes-e),this.slowTimer=Math.max(0,this.slowTimer-e),this.slowTimer<=0&&(this.slowFactor=1),this.contactCooldown=Math.max(0,this.contactCooldown-e),this.patternCooldown=Math.max(0,this.patternCooldown-e);for(let t of Object.keys(this.cooldowns))this.cooldowns[t]=Math.max(0,this.cooldowns[t]-e);this.animator.update(e),this.state===`intro`?(this.stateTimer-=e,this.stateTimer<=0&&(this.state=`fight`,this.events.push({type:`fightStart`,boss:this}))):(this.checkPhase(),this.state===`windup`?(this.stateTimer-=e,this.stateTimer<=0&&this.executePattern(r,n)):this.state===`active`?(this.updateActive(e,t,n,r),this.stateTimer-=e,this.stateTimer<=0&&this.endAttack()):this.state===`recover`?(this.stateTimer-=e,this.drift(e,t,n),this.stateTimer<=0&&(this.state=`fight`,this.playAnimation(this.data.animation??`idle`))):(this.state===`fight`&&(this.drift(e,t,n),this.patternCooldown<=0&&this.choosePattern(n)),this.contactCooldown<=0&&this.overlapsPlayer(n)&&(r.combat.damagePlayer(this.phase.damage*.6,this,{element:`boss`}),this.contactCooldown=.9)))}}checkPhase(){let e=this.data.phases[this.phaseIndex+1];if(e&&this.health<=this.maxHealth*e.threshold&&this.state!==`phaseChange`){this.phaseIndex+=1,this.phase=e,this.state=`recover`,this.stateTimer=1.2,this.invuln=1.2,this.cooldowns={};for(let t of e.patterns)this.cooldowns[t]=1;this.events.push({type:`phase`,boss:this,phase:this.phaseIndex+1}),this.playAnimation(this.data.attackAnimation??this.data.animation,{restart:!0})}}choosePattern(e){let t=this.phase.patterns.filter(e=>(this.cooldowns[e]??0)<=0),n=t.length?this.rng.pick(t):this.rng.pick(this.phase.patterns);(n===`summon`||n===`summon_wisps`)&&this.game.enemies.filter(e=>e.bossMinion&&!e.dead).length>=4&&(n=this.rng.pick([`shockwave`,`soul_burst`,`feather_volley`].filter(e=>this.phase.patterns.includes(e)))??n),this.pattern=n,this.state=`windup`,this.attackCount++,this.facing=e.x<this.x?-1:1;let r={lunge:.65,double_lunge:.55,shockwave:.7,summon:.65,summon_wisps:.6,feather_volley:.75,radial_volley:.8,dive:.6,pillars:1,soul_burst:.7,spiral_souls:.9,tidal_wave:.75,blink:.5}[n]??.7;this.stateTimer=r,this.playAnimation(this.data.attackAnimation??this.data.animation,{restart:!0}),this.events.push({type:`telegraph`,boss:this,color:this.data.accent,duration:r})}executePattern(e,t){let n=this.pattern;this.state=`active`,this.stateTimer=.42,this.strikeHit=!1;let r=this.phase;if(n===`lunge`||n===`double_lunge`)this.vx=this.facing*(n===`double_lunge`?380:310),this.stateTimer=n===`double_lunge`?.75:.5,this.events.push({type:`lunge`,boss:this});else if(n===`shockwave`)this.stateTimer=.25,this.spawnShockwaves(e,r),this.events.push({type:`slam`,boss:this,color:this.data.accent});else if(n===`summon`)this.spawnMinions(e,`cinder_hound`,2),this.stateTimer=.4;else if(n===`summon_wisps`)this.spawnMinions(e,`wisp`,3),this.stateTimer=.4;else if(n===`feather_volley`)this.spawnSpreadProjectiles(e,t,5,.18,this.data.accent),this.stateTimer=.65;else if(n===`radial_volley`)this.spawnRadialProjectiles(e,10,this.data.accent),this.stateTimer=.5;else if(n===`soul_burst`||n===`spiral_souls`)this.spawnRadialProjectiles(e,n===`spiral_souls`?14:8,`#8fe0c2`,.55),this.stateTimer=.6;else if(n===`tidal_wave`)this.spawnTidalWave(e),this.stateTimer=.5;else if(n===`dive`){let e=t.x-this.x,n=t.y+t.height*.5-(this.y+this.height*.5),r=Math.hypot(e,n)||1;this.vx=e/r*300,this.vy=n/r*300,this.stateTimer=.55,this.events.push({type:`dive`,boss:this})}else if(n===`pillars`){this.stateTimer=.3;for(let n=-1;n<=1;n++)e.bossController.queueHazard(t.x+n*74,e.activeWorld.surface,26,130,.55+n*.06,r.damage);this.events.push({type:`pillars`,boss:this})}else if(n===`blink`){let n=e.activeWorld.arena,r=t.x<(n.left+n.right)/2?n.left+120:n.right-120;this.events.push({type:`blink`,boss:this,fromX:this.x,toX:r}),this.x=r,this.stateTimer=.3}this.cooldowns[n]=(r.cooldowns[n]??4)*(.85+Math.random()*.3),this.playAnimation(this.data.attackAnimation??this.data.animation,{restart:!0})}playAnimation(e,{restart:t=!1}={}){let n=e===this.data.attackAnimation||e===`attack`;return this.animator.play(e,{restart:t,fps:n?il.boss.attackFps:il.boss.idleFps})}updateActive(e,t,n,r){this.flying?(this.x+=this.vx*e,this.y+=this.vy*e,this.vx*=Math.max(0,1-1.5*e),this.vy*=Math.max(0,1-1.5*e)):(this.vx*=Math.max(0,1-3.2*e),this.x+=this.vx*e,this.applyBounds(t)),(this.pattern===`lunge`||this.pattern===`double_lunge`||this.pattern===`dive`)&&!this.strikeHit&&this.overlapsPlayer(n)&&(this.strikeHit=!0,r.combat.damagePlayer(this.phase.damage,this,{element:`boss`,heavy:!0}),r.camera.addShake(4.5)),this.stateTimer<=0&&((this.pattern===`lunge`||this.pattern===`double_lunge`||this.pattern===`tidal_wave`)&&this.spawnShockwaves(r,this.phase),this.endAttack()),this.applyBounds(t)}endAttack(){this.state=`recover`,this.stateTimer=.65+Math.random()*.35,this.vx=0,this.vy=0,this.pattern=null,this.patternCooldown=1.1,this.strikeHit=!1,this.playAnimation(this.data.animation??`idle`)}drift(e,t,n){let r=t.arena;if(r){if(n&&(this.facing=n.x<this.x?-1:1),(r.left+r.right)/2,this.flying){this.hoverPhase+=e;let i=g(n.x-this.facing*40,r.left+60,r.right-60),a=t.surface+112+Math.sin(this.hoverPhase*1.2)*22;this.x+=g((i-this.x)*.5,-50,50)*e,this.y+=g((a-this.y)*.5,-40,40)*e}else{let r=n.x-this.x;Math.abs(r)>70&&(this.x+=Math.sign(r)*this.phase.speed*e),this.y=t.surface}this.applyBounds(t)}}applyBounds(e){let t=e.arena;if(!t)return;let n=this.width/2+12;this.x=g(this.x,t.left+n,t.right-n),this.y=this.flying?g(this.y,e.surface+34,e.surface+190):e.surface}overlapsPlayer(e){let t=this.getBounds(),n=e.getBounds();return t.x<n.x+n.w&&t.x+t.w>n.x&&t.y<n.y+n.h&&t.y+t.h>n.y}spawnShockwaves(e,t){let n=this.game.activeWorld.surface+8;for(let r of[-1,1])e.projectiles.spawnHostile({x:this.x+r*20,y:n,vx:r*190,vy:0,damage:t.damage*.75,color:this.data.accent,radius:10,life:2.2,source:this,sprite:`fireball`})}spawnSpreadProjectiles(e,t,n,r,i){let a=this.x,o=this.y+this.height*.55,s=Math.atan2(t.y+t.height*.4-o,t.x-a);for(let t=0;t<n;t++){let r=s+(t-(n-1)/2)*.13;e.projectiles.spawnHostile({x:a,y:o,vx:Math.cos(r)*170,vy:Math.sin(r)*170,damage:this.phase.damage*.7,color:i,radius:5,life:3,source:this,sprite:this.game.activeZoneId===`church`?`fireball`:null})}}spawnRadialProjectiles(e,t,n,r=130){let i=this.y+this.height*.55;for(let a=0;a<t;a++){let o=a/t*Math.PI*2+this.attackCount*.35;e.projectiles.spawnHostile({x:this.x,y:i,vx:Math.cos(o)*r,vy:Math.sin(o)*r,damage:this.phase.damage*.65,color:n,radius:5,life:3.2,source:this,sprite:null})}}spawnTidalWave(e){let t=e.activeWorld.surface+8;for(let n=0;n<6;n++)e.projectiles.spawnHostile({x:this.x+(n-2.5)*24,y:t,vx:this.facing*(160+n*8),vy:(n-2.5)*12,damage:this.phase.damage*.6,color:`#84d9b2`,radius:7,life:2.5,source:this,sprite:null})}spawnMinions(e,t,n){let r=e.activeWorld.arena;for(let i=0;i<n;i++){let n=r.left+100+i*80%(r.right-r.left-200),a=e.getEnemyDef(t)?.flying?e.activeWorld.surface+110:e.activeWorld.surface,o=e.spawnEnemy(t,n,a);o&&(o.bossMinion=!0)}this.events.push({type:`summon`,boss:this})}takeHit(t,n={}){return this.isDamageable?(this.health-=t,this.flashTimer=e.combat.hitFlashDuration,this.events.push({type:`hit`,boss:this,amount:t}),this.health<=0&&(this.health=0,this.dead=!0,this.state=`dead`,this.active=!1,this.events.push({type:`death`,boss:this}),n.game?.onEnemyDefeated?.(this,n)),t):0}applySlow(e,t){this.slowTimer=Math.max(this.slowTimer,e),this.slowFactor=Math.min(this.slowFactor,t)}consumeEvents(){let e=this.events.slice();return this.events.length=0,e}},uu=class{constructor(e){this.game=e}checkTrigger(){let e=this.game;if(e.peaceful)return;let t=e.activeWorld?.arena,n=e.zoneStates[e.activeZoneId];t&&n&&!n.bossStarted&&!n.bossDefeated&&e.activeZone.boss&&(e.player.x<t.triggerX||(n.bossStarted=!0,this.startFight()))}startFight(){let e=this.game,t=cu[e.activeZoneId],n=e.activeWorld.arena;if(!t||!n)return;e.enemies=[],e.projectiles.clear(),e.bossHazards=[],e.bossDamageTaken=0;let r=(n.left+n.right)/2,i=n.floorY??e.activeWorld.surface,a=t.flying?i+112:i;e.boss=new lu({data:t,assets:e.assets,game:e,x:r,y:a}),e.enemies.push(e.boss),e.activeWorld.map.addBlocker(n.left+10,i,10,260,{tag:`arena`}),e.activeWorld.map.addBlocker(n.right-20,i,10,260,{tag:`arena`}),e.arenaGatePositions=[{x:n.left+10,y:i},{x:n.right-20,y:i}],e.buildSpatialHash(),e.camera.addShake(5),e.audio.play(`boss`),e.ui?.toast(`boss.incoming`,{},{icon:`☠`,achievement:!0,duration:2400}),e.prompt=null}updateHazards(e){let t=this.game;for(let n=t.bossHazards.length-1;n>=0;n--){let r=t.bossHazards[n];if(r.age+=e,r.age<r.delay)Math.random()<.35&&t.glowParticles.emit({x:r.x+Math.random()*r.w,y:r.y+Math.random()*r.h,vx:0,vy:20,life:.35,sizeX:1,sizeY:3,color:Z.ember,alpha:.45});else{if(!r.triggered){r.triggered=!0;let e=t.player.getBounds();e.x<r.x+r.w&&e.x+e.w>r.x&&e.y<r.y+r.h&&e.y+e.h>r.y&&t.combat.damagePlayer(r.damage,t.boss,{element:`fire`,heavy:!0}),t.glowParticles.burst([Z.ember,Z.gold,Z.white],r.x+r.w/2,r.y+8,30,{speed:120,spread:Math.PI,direction:Math.PI/2,life:.6,gravity:260,drag:1,size:3}),t.camera.addShake(4),t.audio.play(`swingHeavy`)}r.age>=r.delay+.35&&t.bossHazards.splice(n,1)}}}queueHazard(e,t,n,r,i,a){this.game.bossHazards.push({x:e-n/2,y:t,w:n,h:r,delay:i,damage:a,age:0,triggered:!1})}onDefeated(e){let t=this.game,n=t.zoneStates[t.activeZoneId];n.bossDefeated=!0;let r=e.data;t.run.bossIds.includes(r.id)||t.run.bossIds.push(r.id),t.run.shardIds.includes(r.shard)||(t.run.shardIds.push(r.shard),t.run.shards.push(r.shard));for(let n of t.enemies)n!==e&&!n.dead&&n.bossMinion&&(n.dead=!0,n.countedDeath=!0);t.boss=null,t.bossHazards=[],t.arenaGatePositions=[],t.activeWorld.map.clearBlockers(`arena`);let i={id:`boss-chest-${r.id}`,type:`chestBoss`,x:e.x,y:t.activeWorld.arena?.floorY??t.activeWorld.surface,opened:!1};t.activeWorld.interactions.some(e=>e.id===i.id)||t.activeWorld.interactions.push(i),t.xpOrbs.spawn(40,e.x-10,e.y+16,{big:!0}),t.xpOrbs.spawn(40,e.x+10,e.y+16,{big:!0}),t.glowParticles.burst([Z.gold,Z.white,r.accent??Z.gold],e.x,e.y+30,60,{speed:150,spread:Math.PI*2,life:1.1,gravity:-20,drag:1.2,size:3}),t.gameAchievements?.onShards(t.run.shards.length),t.gameAchievements?.onBoss(r.id,t.bossDamageTaken<=0),t.audio.play(`shard`);let a=t.ui?.t??(e=>e);t.ui?.toast(`boss.defeated`,{boss:a(r.nameKey)},{icon:`☠`,achievement:!0,duration:2600}),t.ui?.toast(`boss.shard`,{},{icon:`◆`,duration:2600}),t.ui?.toast(`boss.rewardChest`,{},{icon:`▣`,duration:2200}),t.run.shards.length>=3&&t.ui?.toast(`zone.finalGateOpen`,{},{icon:`◆`,achievement:!0,duration:3e3}),t.lastRoom=-1,t.interactions.updatePrompt()}},du=[{id:`kael`,nameKey:`char.kael.name`,titleKey:`char.kael.title`,descKey:`char.kael.desc`,difficultyKey:`difficulty.medium`,unlock:`default`,sprite:`kael`,tint:[.8,.94,1.06],accent:`#9fe4ff`,accentDark:`#3f7d9a`,stats:{maxHealth:100,moveSpeed:1,armor:0,critChance:.06,critDamage:1.6,dashCooldown:1.1,specialCooldown:8,pickupMagnet:58},weapon:{id:`frostArrows`,nameKey:`weapon.frostArrows.name`,style:`projectile`,damage:13,cooldown:.27,projectileSpeed:360,projectileLife:.85,range:300,knockback:90,projectileCount:1,spread:.045,pierce:0,aoe:0,color:`#a9e8ff`,trailColor:`#c9f4ff`,element:`frost`,heavy:{damage:30,cooldown:3.2,windup:.32,recover:.35,speed:520,pierce:3,knockback:170,width:18,height:8,nameKey:`attack.iceLance`}},special:{id:`frostTrap`,nameKey:`special.frostTrap.name`,descKey:`special.frostTrap.desc`,type:`trap`,cooldown:8,duration:4.5,damage:20,radius:38},passiveKey:`char.kael.passive`},{id:`brakk`,nameKey:`char.brakk.name`,titleKey:`char.brakk.title`,descKey:`char.brakk.desc`,difficultyKey:`difficulty.easyMedium`,unlock:`default`,sprite:`brakk`,tint:[1.08,.82,.72],accent:`#ff9b75`,accentDark:`#8e3e32`,stats:{maxHealth:130,moveSpeed:.92,armor:.04,critChance:.04,critDamage:1.55,dashCooldown:1.2,specialCooldown:12,pickupMagnet:54},weapon:{id:`berserkerCleave`,nameKey:`weapon.berserkerCleave.name`,style:`melee`,damage:20,cooldown:.38,range:40,arcHeight:38,knockback:130,aoe:0,projectileCount:0,color:`#ff9a6e`,trailColor:`#ffd0a1`,element:`blood`,heavy:{damage:42,cooldown:3.6,windup:.38,recover:.42,radius:58,knockback:230,nameKey:`attack.bloodCyclone`}},special:{id:`bloodRage`,nameKey:`special.bloodRage.name`,descKey:`special.bloodRage.desc`,type:`rage`,cooldown:12,duration:4,damageMultiplier:1.5,lifesteal:.2},passiveKey:`char.brakk.passive`},{id:`seraphine`,nameKey:`char.seraphine.name`,titleKey:`char.seraphine.title`,descKey:`char.seraphine.desc`,difficultyKey:`difficulty.hard`,unlock:`shards`,sprite:`seraphine`,tint:[.92,.8,1.1],accent:`#d7b7ff`,accentDark:`#684d99`,stats:{maxHealth:80,moveSpeed:.95,armor:0,critChance:.08,critDamage:1.7,dashCooldown:1,specialCooldown:7,pickupMagnet:62},weapon:{id:`iceOrb`,nameKey:`weapon.iceOrb.name`,style:`projectile`,damage:16,cooldown:.46,projectileSpeed:240,projectileLife:1.05,range:280,knockback:80,projectileCount:1,spread:0,pierce:0,aoe:28,color:`#d8c4ff`,trailColor:`#a4e9ff`,element:`frost`,heavy:{damage:34,cooldown:4,windup:.4,recover:.4,radius:64,knockback:210,nameKey:`attack.frozenNova`}},special:{id:`blinkBurst`,nameKey:`special.blinkBurst.name`,descKey:`special.blinkBurst.desc`,type:`blinkBurst`,cooldown:7,distance:112,damage:28,radius:46},passiveKey:`char.seraphine.passive`,floatOffset:3},{id:`nyx`,nameKey:`char.nyx.name`,titleKey:`char.nyx.title`,descKey:`char.nyx.desc`,difficultyKey:`difficulty.mediumHard`,unlock:`shards`,sprite:`nyx`,tint:[.68,.7,1.02],accent:`#9b8bff`,accentDark:`#403564`,stats:{maxHealth:90,moveSpeed:1.12,armor:0,critChance:.1,critDamage:1.75,dashCooldown:.9,specialCooldown:6,pickupMagnet:66},weapon:{id:`shadowBlades`,nameKey:`weapon.shadowBlades.name`,style:`projectile`,damage:10,cooldown:.19,projectileSpeed:310,projectileLife:.45,range:130,knockback:70,projectileCount:1,spread:.03,pierce:0,aoe:0,color:`#b5a7ff`,trailColor:`#7f6bd1`,element:`shadow`,heavy:{damage:26,cooldown:2.8,windup:.24,recover:.3,range:50,arcHeight:46,knockback:150,nameKey:`attack.voidArc`}},special:{id:`shadowStep`,nameKey:`special.shadowStep.name`,descKey:`special.shadowStep.desc`,type:`shadowStep`,cooldown:6,distance:148,damage:22,iframes:.35},passiveKey:`char.nyx.passive`}],fu=Object.fromEntries(du.map(e=>[e.id,e])),pu=[{id:`torch-procession`,setPiece:`torch-corridor`,steps:[{x:16,w:4,h:1},{x:22,w:4,h:1}],pits:[],ledges:[{x:14,y:5,w:5},{x:21,y:5,w:5}],chests:[{x:15,level:5},{x:23,level:5}],torches:[5,9,24,31],statues:[{x:12,level:0,prop:`knight`},{x:28,level:0,prop:`robed`}],panels:[13,21],altar:null},{id:`cellblock`,setPiece:`cellblock`,steps:[{x:14,w:3,h:1},{x:25,w:3,h:1}],pits:[{x:18,w:2}],ledges:[{x:17,y:4,w:4}],chests:[{x:15,level:1},{x:26,level:1}],torches:[5,9,24,31],statues:[{x:12,level:0,prop:`robed`},{x:28,level:0,prop:`knight`}],panels:[14,23],altar:null},{id:`throne-dais`,setPiece:`throne-room`,steps:[{x:15,w:10,h:1},{x:18,w:4,h:2}],pits:[],ledges:[{x:14,y:5,w:4},{x:23,y:5,w:4}],chests:[{x:16,level:1}],torches:[5,9,24,31],statues:[{x:12,level:0,prop:`knight`},{x:28,level:0,prop:`robed`}],panels:[15,22],altar:{x:20,level:2}},{id:`chain-pit`,setPiece:`chain-pit`,steps:[{x:14,w:3,h:1}],pits:[{x:18,w:4}],ledges:[{x:16,y:4,w:4},{x:22,y:5,w:4}],chests:[{x:17,level:4}],torches:[5,9,24,31],statues:[{x:12,level:0,prop:`robed`},{x:28,level:0,prop:`knight`}],panels:[15,22],altar:null},{id:`treasury`,setPiece:`treasury`,steps:[],pits:[],ledges:[{x:14,y:4,w:5},{x:20,y:5,w:6},{x:27,y:4,w:3}],chests:[{x:15,level:4},{x:23,level:5},{x:28,level:4},{x:18,level:0}],torches:[5,9,24,31],statues:[{x:12,level:0,prop:`knight`}],panels:[14,22],altar:null},{id:`collapsed-steps`,setPiece:`collapsed`,steps:[{x:15,w:3,h:1},{x:21,w:4,h:1}],pits:[{x:18,w:2},{x:26,w:2}],ledges:[{x:17,y:5,w:4}],chests:[{x:16,level:1},{x:23,level:1}],torches:[5,9,24,31],statues:[{x:12,level:0,prop:`robed`},{x:28,level:0,prop:`knight`}],panels:[14,22],altar:null}],Q={EMPTY:0,SOLID:1,ONE_WAY:2,HAZARD:3,BREAKABLE:4,FAKE:5},mu=.001,hu=class{constructor(t,n,r=null,{surfaceOffset:i=0,surfaceRow:a=8}={}){this.width=t,this.height=n,this.tileSize=e.tile,this.data=r??new Uint8Array(t*n),this.surfaceOffset=Number(i)||0,this.surfaceRow=a,this.blockers=[],this.version=0}get surfaceY(){return(this.surfaceRow+1)*this.tileSize-this.surfaceOffset}index(e,t){return t*this.width+e}getType(e,t){return e<0||e>=this.width||t<0?Q.SOLID:t>=this.height?Q.EMPTY:this.data[this.index(e,t)]}setType(e,t,n){e<0||e>=this.width||t<0||t>=this.height||(this.data[this.index(e,t)]=n,this.version++)}clear(){this.data.fill(Q.EMPTY),this.version++}isSolid(e){return e===Q.SOLID||e===Q.BREAKABLE}isSolidAt(e,t){return this.isSolid(this.getType(e,t))}isStandableTile(e,t){let n=this.getType(e,t);if(n!==Q.EMPTY&&n!==Q.FAKE)return!1;let r=this.getType(e,t-1);if(!this.isSolid(r)&&r!==Q.ONE_WAY)return!1;let i=this.getType(e,t+1),a=this.getType(e,t+2);return i!==Q.SOLID&&a!==Q.SOLID}rectHitsSolid(e,t,n,r,i=!1){let a=Math.floor(e/this.tileSize),o=Math.floor((e+n-mu)/this.tileSize),s=Math.floor(t/this.tileSize),c=Math.floor((t+r-mu)/this.tileSize);for(let e=s;e<=c;e++)for(let n=a;n<=o;n++){let r=this.getType(n,e);if(this.isSolid(r)){let n=this.surfaceY+this.surfaceOffset;if(e===this.surfaceRow&&t<=n+4)continue;return!0}if(i&&r===Q.ONE_WAY)return!0}return!1}rectHitsHazard(e,t,n,r){let i=Math.floor(e/this.tileSize),a=Math.floor((e+n-mu)/this.tileSize),o=Math.floor(t/this.tileSize),s=Math.floor((t+r-mu)/this.tileSize);for(let e=o;e<=s;e++)for(let t=i;t<=a;t++)if(this.getType(t,e)===Q.HAZARD)return!0;return!1}pointHitsSolid(e,t){return this.isSolidAt(Math.floor(e/this.tileSize),Math.floor(t/this.tileSize))}forEachTileInRect(e,t,n,r,i){let a=Math.floor(e/this.tileSize),o=Math.floor((e+n-mu)/this.tileSize),s=Math.floor(t/this.tileSize),c=Math.floor((t+r-mu)/this.tileSize);for(let e=s;e<=c;e++)for(let t=a;t<=o;t++)i(t,e,this.getType(t,e))}addBlocker(e,t,n,r,i={}){let a={x:e,y:t,w:n,h:r,enabled:!0,meta:i};return this.blockers.push(a),a}clearBlockers(e=null){this.blockers=this.blockers.filter(t=>e!==null&&t.meta?.tag!==e)}moveX(e,t){if(t===0)return!1;e.x+=t;let n=e.width/2,r=Math.floor((e.x-n)/this.tileSize),i=Math.floor((e.x+n-mu)/this.tileSize),a=Math.floor(e.y/this.tileSize),o=Math.floor((e.y+e.height-mu)/this.tileSize),s=!1;for(let c=a;c<=o;c++)for(let a=r;a<=i;a++){if(!this.isSolidAt(a,c))continue;let r=this.surfaceY+this.surfaceOffset;c===this.surfaceRow&&e.y<=r+.5||(t>0?(e.x=a*this.tileSize-n-mu,s=!0):(e.x=(a+1)*this.tileSize+n+mu,s=!0))}for(let r of this.blockers)r.enabled&&e.x-n<r.x+r.w&&e.x+n>r.x&&e.y<r.y+r.h&&e.y+e.height>r.y&&(e.x=t>0?r.x-n-mu:r.x+r.w+n+mu,s=!0);return s}moveY(e,t){if(t===0)return{grounded:!1,ceiling:!1};let n=e.y;e.y+=t;let r=e.width/2,i=Math.floor((e.x-r)/this.tileSize),a=Math.floor((e.x+r-mu)/this.tileSize),o=Math.floor(e.y/this.tileSize),s=Math.floor((e.y+e.height-mu)/this.tileSize),c=!1,l=!1;for(let r=o;r<=s;r++)for(let o=i;o<=a;o++){let i=this.getType(o,r);if(this.isSolid(i)||i===Q.ONE_WAY&&t<0){if(i===Q.ONE_WAY){if(t>0)continue;let i=(r+1)*this.tileSize-this.surfaceOffset;if(n<i-.01||e.dropThrough&&e.dropThrough>0)continue;e.y=i+mu,e.vy=0,e.onGround=!0,c=!0}else if(t>0){if(r===this.surfaceRow)continue;e.y=r*this.tileSize-e.height-mu,e.vy=0,l=!0}else r===this.surfaceRow?(e.y=this.surfaceY+mu,e.vy=0,e.onGround=!0,c=!0):(e.y=(r+1)*this.tileSize+mu,e.vy=0,e.onGround=!0,c=!0)}}for(let n of this.blockers)n.enabled&&e.x-r<n.x+n.w&&e.x+r>n.x&&e.y<n.y+n.h&&e.y+e.height>n.y&&(t>0?(e.y=n.y-e.height-mu,e.vy=0,l=!0):(e.y=n.y+n.h+mu,e.vy=0,e.onGround=!0,c=!0));return c&&(e.onGround=!0),{grounded:c,ceiling:l}}checkGround(e){if((e.vy??0)>.1)return!1;let t=Math.max(1,e.width/2-1),n=Math.floor((e.x-t)/this.tileSize),r=Math.floor((e.x+t-mu)/this.tileSize),i=e.y-1,a=Math.floor(i/this.tileSize);for(let e=n;e<=r;e++){let t=this.getType(e,a);if(this.isSolid(t)||t===Q.ONE_WAY)return!0}for(let n of this.blockers)if(n.enabled&&e.x+t>n.x&&e.x-t<n.x+n.w&&i<=n.y+n.h&&i>=n.y)return!0;return!1}getHighestStandableY(e,t=this.height-1){for(let n=Math.min(t,this.height-2);n>=0;n--)if(this.isStandableTile(e,n+1))return n+1;return null}getGroundYAtWorld(e,t=this.height*this.tileSize){let n=Math.max(0,Math.min(this.width-1,Math.floor(e/this.tileSize))),r=Math.max(0,Math.min(this.height-1,Math.floor(t/this.tileSize)));for(let e=r;e>=0;e--)if(this.isSolidAt(n,e))return(e+1)*this.tileSize-(e===this.surfaceRow?this.surfaceOffset:0);return null}breakTile(e,t){return this.getType(e,t)===Q.BREAKABLE&&(this.setType(e,t,Q.EMPTY),!0)}dustTile(e,t){this.getType(e,t)===Q.FAKE&&this.setType(e,t,Q.EMPTY)}findNearestGround(e,t,n=24){let r=Math.floor(e/this.tileSize),i=Math.floor(t/this.tileSize);for(let e=0;e<=n;e++)for(let t=-e;t<=e;t++)for(let n=-e;n<=e;n++){if(Math.abs(t)!==e&&Math.abs(n)!==e)continue;let a=r+t,o=i+n;if(this.isStandableTile(a,o))return{x:(a+.5)*this.tileSize,y:o*this.tileSize}}return null}},gu=class{constructor({width:e,height:t,tileSize:n}){this.width=e,this.height=t,this.tileSize=n,this.cells=Array.from({length:e*t},()=>[]),this.entries=[]}intersects(e,t){return e.x<t.x+t.w&&e.x+e.w>t.x&&e.y<t.y+t.h&&e.y+e.h>t.y}overlaps(e,t=null){let n=Math.max(0,Math.floor(e.x/this.tileSize)),r=Math.min(this.width-1,Math.floor((e.x+e.w-.001)/this.tileSize)),i=Math.max(0,Math.floor(e.y/this.tileSize)),a=Math.min(this.height-1,Math.floor((e.y+e.h-.001)/this.tileSize)),o=new Set;for(let s=i;s<=a;s++)for(let i=n;i<=r;i++)for(let n of this.cells[s*this.width+i])if(!o.has(n)&&(o.add(n),(!t||t(n))&&this.intersects(e,n)))return n;return null}mark(e,t,n,r={}){let i={...e,kind:t,id:n,meta:r};this.entries.push(i);let a=Math.max(0,Math.floor(e.x/this.tileSize)),o=Math.min(this.width-1,Math.floor((e.x+e.w-.001)/this.tileSize)),s=Math.max(0,Math.floor(e.y/this.tileSize)),c=Math.min(this.height-1,Math.floor((e.y+e.h-.001)/this.tileSize));for(let e=s;e<=c;e++)for(let t=a;t<=o;t++)this.cells[e*this.width+t].push(i);return i}markTile(e,t,n,r,i={}){return this.mark({x:e*this.tileSize,y:t*this.tileSize,w:this.tileSize,h:this.tileSize},n,r,i)}},_u=2147483648,vu=1073741824,yu=536870912,bu=536870911;function xu(e){let t=Number(e)>>>0;return{id:t&bu,h:(t&_u)!==0,v:(t&vu)!==0,d:(t&yu)!==0}}function Su(e){if(typeof globalThis.atob==`function`){let t=globalThis.atob(e);return Uint8Array.from(t,e=>e.charCodeAt(0))}if(typeof Buffer<`u`)return Uint8Array.from(Buffer.from(e,`base64`));throw Error(`No base64 decoder available`)}function Cu(e){if(!e||e.type!==`tilelayer`)throw Error(`Tiled layer is not a tile layer: ${e?.name??`unknown`}`);if(Array.isArray(e.data))return e.data.map(e=>Number(e)>>>0);if(typeof e.data!=`string`)throw Error(`Unsupported tile data in layer ${e.name}`);if(e.encoding===`base64`||e.data.startsWith(`H4sI`)||e.data.startsWith(`eJ`)){if(e.compression)throw Error(`Compressed Tiled layers are not supported (${e.compression}); export with CSV/no compression`);let t=Su(e.data),n=[];for(let e=0;e+3<t.length;e+=4)n.push((t[e]|t[e+1]<<8|t[e+2]<<16|t[e+3]<<24)>>>0);return n}if(e.encoding===`csv`||e.data.includes(`,`))return e.data.split(`,`).map(e=>Number(e.trim())||0).map(e=>e>>>0);throw Error(`Unsupported Tiled layer encoding in layer ${e.name}`)}function wu(e){let t={};for(let n of e?.properties??[])t[n.name]=n.value;return t}function Tu(e,t,n=e.firstgid){let r=e.image?new URL(e.image,t).href:null,i=(e.tiles??[]).map(e=>({...e,imageUrl:e.image?new URL(e.image,t).href:null}));return{...e,firstgid:n,imageUrl:r,tiles:i,imageCollection:!r}}async function Eu(e,t,n){let r=new URL(e.source,t).href;if(/\.tsx(?:$|\?)/i.test(e.source))throw Error(`TSX tilesets are not supported; export ${e.source} as TSJ/JSON`);let i=await n(r);if(!i.ok)throw Error(`Failed to load tileset ${r}`);return Tu({...await i.json(),sourceUrl:r},r,e.firstgid)}async function Du(t,{fetchImpl:n=fetch,loadImage:r=null}={}){let i=await n(t);if(!i.ok)throw Error(`Failed to load Tiled map ${t}`);let a=await i.json();if(a.infinite)throw Error(`Infinite Tiled maps are not supported: ${t}`);if(a.tilewidth!==e.tile||a.tileheight!==e.tile)throw Error(`Tiled map tile size ${a.tilewidth}x${a.tileheight} != game tile ${e.tile}`);let o=[];for(let e of a.tilesets??[])e.source?o.push(await Eu(e,t,n)):o.push(Tu(e,t));let s=new Map;if(r){let e=new Set;for(let t of o){t.imageUrl&&e.add(t.imageUrl);for(let n of t.tiles)n.imageUrl&&e.add(n.imageUrl)}for(let n of a.layers??[])n.type===`imagelayer`&&n.image&&e.add(new URL(n.image,t).href);await Promise.all([...e].map(async e=>{s.set(e,await r(e))}))}return{map:a,mapUrl:t,tilesets:o,images:s}}function Ou(e,t){let n=t.collisionGids?.[String(e)]??`solid`;return n===`oneWay`?Q.ONE_WAY:n===`hazard`?Q.HAZARD:n===`empty`||n===`none`?Q.EMPTY:Q.SOLID}function ku(e,t,n,r,i=!1){for(let a=n-1;a>=0;a--){let n=e[a*t+r];if(n===Q.SOLID||i&&n===Q.ONE_WAY)return a}return-1}function Au(t){return Math.max(1,Math.ceil(t/e.world.roomWidth))}function ju(t,n,r,i=40){let a=Math.max(0,Math.min(t.width-1,Math.floor(n/e.tile))),o=Math.max(0,Math.min(t.height-1,Math.floor((r+e.tile-1)/e.tile)));for(let n=o;n>=0;n--){let o=t.getType(a,n);if(o!==Q.SOLID&&o!==Q.ONE_WAY)continue;let s=(n+1)*e.tile;if(r-s<=i)return s}return null}function Mu(t,n,r){let i=[];for(let a=0;a<r;a++){let r=-1;for(let o=0;o<=n;o++){let s=o<n&&t[a*n+o]===Q.HAZARD;s&&r<0&&(r=o),!s&&r>=0&&(i.push({x:r*e.tile,y:a*e.tile,w:(o-r)*e.tile,h:e.tile,kind:`spikes`}),r=-1)}}return i}function Nu(t,n,r){let i=(r+t.height)*e.tile,a=[],o=0;for(let e of t.layers??[]){if(e.type!==`imagelayer`||e.visible===!1)continue;let t=wu(e),r=t.draw_above_player?`fog`:`bg`;a.push({id:e.id,name:e.name,imageUrl:new URL(e.image,n).href,width:Number(e.imagewidth??0),height:Number(e.imageheight??0),offsetX:Number(e.offsetx??0),offsetY:Number(e.offsety??0),parallaxX:Number(e.parallaxx??1),parallaxY:Number(e.parallaxy??1),opacity:Number(e.opacity??1),repeat:!!e.repeatx,autoScrollX:Number(t.autoscroll_x??0),role:r,order:o++,mapTop:i})}return a}function Pu(e,t){return e-Number(t.y??0)}function Fu({map:e,world:t,mapTop:n,objectLayers:r}){let i=new Map((e.layers??[]).filter(e=>e.type===`objectgroup`).map(e=>[e.name,e])),a=r.flatMap(e=>i.get(e)?.objects??[]),o=e=>a.filter(t=>t.type===e),s=e=>wu(e);for(let e of o(`Enemy`)){let r=s(e),i=Number(e.x)+Number(e.width??16)/2,a=Pu(n,e),o=r.ai===`fly_sine`,c=ju(t.map,i,a,40),l=r.enemy_type??`skeleton`,u=Number(r.hp??4),d=l===`bat`?`wisp`:l===`ghoul`?`burning_ghoul`:u>=5?`wight`:`bone_thrall`;t.tiled.enemies.push({id:`tiled-enemy-${e.id}`,enemyId:d,x:i,y:o?a+Number(e.height??16)/2:c??a,health:Math.max(.7,Math.min(1.45,u/4.2)),damage:Math.max(.7,Math.min(1.35,Number(r.damage??1)/1.4)),flying:o})}for(let e of o(`Boss`)){let r=s(e),i=Number(r.arena_left??Number(e.x)-136),a=Number(r.arena_right??Number(e.x)+136),o=Number(e.x)+Number(e.width??16)/2;t.arena={left:i,right:a,floorY:ju(t.map,o,Pu(n,e),48)??t.surface,triggerX:i+32,active:!1,cleared:!1,source:`tiled`}}for(let e of o(`Checkpoint`)){let r=s(e),i=Number(e.x)+Number(e.width??16)/2,a=Pu(n,e),o=ju(t.map,i,a,40)??a;t.checkpoints.some(e=>Math.abs(e.x-i)<8&&Math.abs(e.y-o)<8)||t.checkpoints.push({id:r.id??e.name,x:i,y:o,room:0,heal:!!r.heal,activated:!1,source:`tiled`})}for(let e of o(`Chest`)){let r=s(e),i=Number(e.x)+Number(e.width??16)/2,a=Pu(n,e),o=ju(t.map,i,a,40)??a;t.interactions.push({id:`tiled-chest-${e.id}`,type:`chest`,x:i,y:o,opened:!1,secret:!!r.hidden,loot:r.loot??null,labelKey:`action.openChest`})}for(let e of o(`Sign`)){let r=s(e),i=Number(e.x)+Number(e.width??16)/2,a=Pu(n,e),o=ju(t.map,i,a,40)??a,c=e.name===`lore_sign_1`?`sign.dungeonGate.arch`:e.name===`lore_sign_2`?`sign.dungeonGate.warden`:null;t.interactions.push({id:`tiled-sign-${e.id}`,type:`sign`,x:i,y:o,text:r.text??``,textKey:c})}for(let e of o(`Pickup`)){let r=s(e);if(r.hidden)continue;let i=Number(e.x)+Number(e.width??16)/2,a=Pu(n,e);t.pickups.push({id:`tiled-pickup-${e.id}`,type:r.item??`coin`,x:i,y:a+4,value:Number(r.value??1),heal:Number(r.heal??0),collected:!1})}for(let e of o(`MovingPlatform`)){let r=s(e),i=Number(e.x)+Number(e.width??48)/2,a=Pu(n,e),o=Math.max(8,Number(r.distance??48)/2),c=Number(r.speed??28);t.movingPlatforms.push({id:`tiled-platform-${e.id}`,baseX:i,baseY:a,x:i,y:a,w:Number(e.width??48),h:Number(e.height??8),axis:r.axis===`y`?`y`:`x`,range:o,speed:Math.max(.2,Math.PI*c/(2*o)),phase:0,dx:0,dy:0})}let c=o(`LevelExit`)[0];if(c){let e=s(c),r=Number(c.x)+Number(c.width??48)/2;t.finalGate={id:`tiled-level-exit`,type:`finalGate`,x:r,y:ju(t.map,r,Pu(n,c),80)??t.surface,requiresShards:3,requiresItem:e.requires_item??null,labelKey:`action.enterGate`,targetMap:e.target_map??null}}for(let e of o(`Hint`)){let r=e.name===`hint_jump_pits`?`hint.dungeonGate.pits`:e.name===`hint_lava`?`hint.dungeonGate.lava`:null;t.triggers.push({id:`hint-${e.id}`,type:`hint`,x:Number(e.x),y:n-(Number(e.y)+Number(e.height??0)),w:Number(e.width??0),h:Number(e.height??0),text:s(e).text??``,textKey:r,shown:!1})}for(let e of o(`KillZone`))t.killZone={x:Number(e.x),y:n-Number(e.y),w:Number(e.width??0),h:Number(e.height??0)};for(let e of o(`Light`)){let r=s(e);t.tiled.lights.push({x:Number(e.x),y:n-Number(e.y),color:r.color??`#ffb066`,radius:Number(r.radius??120),intensity:Number(r.intensity??1),flicker:Number(r.flicker??0),phase:Number(e.id)*1.37})}}function Iu({map:t,mapUrl:r,tilesets:i,images:a=new Map,config:o,route:s=[],seed:c=1}){if(!o)throw Error(`buildTiledWorld needs a map config`);let l=o.zoneId,u=n[l];if(!u)throw Error(`Unknown zone: ${l}`);let d=t.width,f=t.height,p=o.worldHeight??Math.max(f,e.world.rows),m=o.verticalPlacement===`top`?Math.max(0,p-f):0,h=(m+f)*e.tile,g=t.layers.find(e=>e.name===o.layers.collision);if(!g)throw Error(`Missing collision layer ${o.layers.collision}`);let _=Cu(g),v=new Uint8Array(d*p),y=0;for(let e=0;e<f;e++){let t=m+f-1-e;for(let n=0;n<d;n++){let r=xu(_[e*d+n]).id;r&&(v[t*d+n]=Ou(r,o),y++)}}let b=t.layers.find(e=>e.name===`Objects`)?.objects?.find(e=>e.type===`PlayerStart`),x=Math.max(1,Math.min(d-2,b?Math.floor(Number(b.x)/e.tile):o.spawnTileX??6)),S=ku(v,d,p,x,!0);if(S<0)throw Error(`Tiled map has no floor at spawn tile ${x}`);let C=(S+1)*e.tile,w=new hu(d,p,v,{surfaceOffset:0,surfaceRow:S}),T=new gu({width:d,height:p,tileSize:e.tile}),E=[],D=Au(d);for(let t=0;t<D;t++)E.push({index:t,start:t*e.world.roomWidth,width:Math.min(e.world.roomWidth,d-t*e.world.roomWidth)});let O={x:b?Number(b.x)+Number(b.width??e.tile)/2:x*e.tile+e.tile/2,y:C},k=[...o.layers.render??[],...o.layers.front??[]],A=new Set(o.layers.front??[]),j={zoneId:l,seed:c,width:d,height:p,rows:p,rowOffset:m,mapHeight:f,mapTop:h,playableTop:h,surface:C,surfaceOffset:0,paintedOffset:0,paintedSurface:C,footSink:0,fringeHeight:0,floorRow:S,spawn:O,spawnRoom:0,checkpoints:[{id:`spawn`,x:O.x,y:O.y,room:0,activated:!0}],transitions:[],interactions:[],decorations:[],backdrops:[],surfaceDecals:[],setPieces:[],platformRuns:[],dungeonRooms:[],dungeonTemplateOrder:[],hazards:Mu(v,d,p),secrets:[],propsAnimated:[],movingPlatforms:[],pickups:[],triggers:[],arena:null,challenge:null,finalGate:null,rooms:E,bossRoom:-1,styleFamily:u.family,atlas:u.atlas,palette:u.palette,enemyPool:u.enemyPool,elitePool:u.elitePool,bossKey:u.boss??null,ambient:u.weather,route:s,map:w,layout:T,cameraZoom:Number(o.camera?.zoom??1),cameraAnchor:o.camera?.anchor??`follow`,ambientColor:o.ambientColor??wu(t).ambient_color??null,ambientStrength:Number(o.ambientStrength??.25),authoredEnemies:!!o.spawnFromObjects,noAmbientSpawns:!!o.spawnFromObjects,tiled:{mapUrl:r,width:d,height:f,rowOffset:m,mapTop:h,layers:k.map((e,n)=>{let r=t.layers.find(t=>t.name===e);if(!r)throw Error(`Missing visual layer ${e}`);return{name:e,order:n,opacity:r.opacity??1,visible:r.visible!==!1,front:A.has(e),data:Cu(r)}}),collisionLayer:o.layers.collision,collisionGids:o.collisionGids,tilesets:i,images:a,mapWidth:d,mapHeight:f,imageLayers:Nu(t,r,m),enemies:[],lights:[],objectLayers:o.objectLayers??[],ambientColor:o.ambientColor??wu(t).ambient_color??null,ambientStrength:Number(o.ambientStrength??.25),parallaxOriginX:Number(o.parallaxOrigin?.[0]??d*e.tile/2),parallaxOriginY:Number(o.parallaxOrigin?.[1]??90)},reachability:{ok:!0,gaps:[],badGaps:[],unreachable:[]},tiledMapConfig:o};if(Fu({map:t,world:j,mapTop:h,objectLayers:o.objectLayers??[`Objects`,`Triggers`,`Lights`]}),!j.arena&&u.boss&&o.arena){let e=Number(o.arena.triggerX),t=o.arena.floor===`surface`?j.surface:ju(j.map,e,j.surface+48,96)??j.surface;j.arena={left:Number(o.arena.left),right:Number(o.arena.right),floorY:t,triggerX:e,active:!1,cleared:!1,source:`config`}}o.returnTarget&&(j.transitions.push({id:`return-${l}`,type:`door`,x:24,y:j.surface,target:o.returnTarget,labelKey:`zone.return`,labelZone:o.returnTarget,requiresBoss:!1,entrySide:`door`}),T.mark({x:6,y:j.surface,w:36,h:52},`gate`,`return-${l}`));let M=s[s.indexOf(l)+1];if(M&&o.exitTarget!==null){let t=(d-(o.exitTileOffset??3))*e.tile,n=ku(v,d,p,Math.floor(t/e.tile),!0);if(n>=0){let r=(n+1)*e.tile;j.transitions.push({id:`right-${l}`,type:`portal`,x:t,y:r,target:M,labelKey:`action.usePortal`,requiresBoss:!!u.boss,entrySide:`left`}),T.mark({x:t-18,y:r,w:36,h:52},`gate`,`right-${l}`)}}return j}var $=e.tile,Lu=e.world.roomWidth,Ru=e.world.roomsPerZone,zu=Lu*Ru,Bu=e.world.rows,Vu=8,Hu=9*$,Uu=3;function Wu(e){return[`cemetery`,`church`]}function Gu(e,t){return t*zu+e}function Ku(e){for(let t=0;t<zu;t++)for(let n=0;n<=Vu;n++)e[Gu(t,n)]=Q.SOLID}function qu(e,t,n){for(let r=t;r<t+n;r++){for(let t=7;t<=Vu;t++)e[Gu(r,t)]=Q.EMPTY;e[Gu(r,7)]=Q.HAZARD,n>1&&(e[Gu(r,Vu)]=Q.HAZARD)}}function Ju(e,t,n,r,i,a=Q.SOLID){for(let o=n;o<n+i;o++)for(let n=t;n<t+r;n++)n<0||n>=zu||o<0||o>=Bu||(e[Gu(n,o)]=a)}function Yu(e,t,n,r){for(let i=t;i<t+r;i++)i<0||i>=zu||(e[Gu(i,n)]=Q.ONE_WAY)}function Xu(e,t,n,r=-1){let i=n-Vu;if(i<=1)return!1;let a=n=>{let r=[];for(let e=1;e<i;e++)r.push({x:t+n*(i-e),height:e});if(!r.every(({x:t})=>t>=0&&t<zu&&e[Gu(t,Vu)]===Q.SOLID))return!1;for(let{x:t,height:n}of r)Ju(e,t,9,1,n);return!0};return a(r)||r<0&&a(1)}function Zu(e,t,n){if(!(n.h<=1))for(let r of[-1,n.w]){let i=t+n.x+r;i<0||i>=zu||Ju(e,i,9,1,1)}}function Qu(e,t,n,r,i=!1){let a=e.map?.getType(n,r-1);if(a!==Q.SOLID&&a!==Q.ONE_WAY)return;for(let t=-1;t<=1;t++)if(e.map?.getType(n+t,r)!==Q.EMPTY||e.map?.getType(n+t,r+1)!==Q.EMPTY)return;let o=n*$+$/2,s=r-1===e.map.surfaceRow||a===Q.ONE_WAY?e.surfaceOffset??0:0,c=r*$-s,l={x:o-9,y:c,w:18,h:16};e.layout?.overlaps(l,e=>e.kind===`gate`||e.kind===`chest`||e.kind===`chestClear`||e.kind===`structure`)||(e.interactions.push({id:t,type:`chest`,x:o,y:c,secret:i,opened:!1}),e.layout?.mark(l,`chest`,t),e.layout?.mark({x:o-12,y:c,w:24,h:$*2},`chestClear`,`${t}:clear`))}function $u(e,t){return t<=0?e.surface:(9+t)*$}function ed(t,n,r,i,a,o){let s=n*Lu,c=a.surface,l=e.world.platformMaxRise;for(let e of o.pits)qu(r,s+e.x,e.w),a.hazards.push({x:(s+e.x)*$,y:7*$,w:e.w*$,h:$*2,kind:`spikes`});for(let e of o.steps)Ju(r,s+e.x,9,e.w,e.h),Zu(r,s,e);for(let e of o.ledges){let t=Vu+Math.min(e.y,l);Yu(r,s+e.x,t,e.w),Xu(r,s+e.x,t)}o.chests.forEach((e,t)=>{Qu(a,`chest-dungeon-${n}-${t}`,s+e.x,9+Math.min(e.level,l))}),o.altar&&a.interactions.push({id:`altar-dungeon-${n}`,type:`altar`,x:(s+o.altar.x)*$,y:$u(a,o.altar.level),used:!1}),n===t.challengeRoom&&(a.challenge={room:n,x:(s+16)*$,y:c,cleared:!1}),a.dungeonRooms[n]={id:o.id,setPiece:o.setPiece,start:s,chests:o.chests.length},a.checkpoints.push({x:(s+3)*$,y:c,room:n})}function td(n,r,i,a,o){let s=r*Lu,c=o.surface,l=r===Uu,u=r===n.challengeRoom;if(n.id===`dungeon`)ed(n,r,i,a,o,o.dungeonTemplateOrder[r]);else{if(!(l&&n.boss)){let c=r===0?0:n.id===`forest`?a.int(1,2):a.int(0,1);for(let e=0;e<c;e++){let r=s+12+e*10,c=s+Lu-12;if(r>=c)continue;let l=a.int(r,c),u=a.int(2,Math.min(3,t.maxGapTiles-1));qu(i,l,u),o.hazards.push({x:l*$,y:7*$,w:u*$,h:$*2,kind:n.hazards})}let l=n.id===`forest`?a.int(1,2):r===4?1:a.int(0,1);for(let t=0;t<l;t++){let c=s+8+t*12+a.int(0,2),l=Vu+a.int(2,e.world.platformMaxRise);Yu(i,c,l,a.int(4,6)),Xu(i,c,l),t===0&&Qu(o,`chest-${n.id}-${r}`,c+2,l+1)}l===0&&Qu(o,`chest-${n.id}-${r}-floor`,s+Lu-7,9)}if(r===1){Qu(o,`chest-${n.id}-1b`,s+Lu-8,9);let e=(s+16)*$,t=c+56;l||o.movingPlatforms.push({id:`${n.id}-lifter-1`,baseX:e,baseY:t,x:e,y:t,w:48,h:10,axis:a.chance(.5)?`x`:`y`,range:a.int(22,38),speed:.55,phase:a.float(0,Math.PI*2),dx:0,dy:0})}if(r===2&&(Qu(o,`chest-${n.id}-2b`,s+8,9),!u)){let e=s+Lu-5;o.map?.isSolidAt(e,Vu)&&o.interactions.push({id:`altar-${n.id}`,type:`altar`,x:e*$,y:c,used:!1})}r===Uu&&n.boss&&(o.arena={left:s*$,right:(s+Lu)*$,triggerX:(s+4)*$,active:!1,cleared:!1}),u&&(o.challenge={room:r,x:(s+8)*$,y:c,cleared:!1}),o.checkpoints.push({x:(s+3)*$,y:c,room:r})}}function nd(e,t,n,r,i,a,o,s,c={}){e.transitions.push({id:n,type:r,x:i,y:a,target:o,labelKey:s,requiresBoss:!1,...c}),e.layout?.mark({x:i-18,y:a,w:36,h:52},`gate`,n,{zone:t.id})}function rd(e,t,n,r,i=0){let a=Gc.props[e]?.frames?.[t],o=Number(a?.w??$),s=Number(a?.h??$);return{x:n-o/2,y:r+i,w:o,h:s}}function id(t,n,r,i,a){let o=(n.id===`swamp`||n.id,r.int(2,4));for(let s=0;s<o;s++){let o=r.pick(n.decor);if(!o)continue;let s=Gc.props[n.id]?.frames?.[o];if(!s)continue;let c=o.startsWith(`torch`)?38:0,l=Number(s.h??$)>e.player.height*2,u=!1;for(let e=0;e<4&&!u;e++){let s=i+r.int(3,Lu-4),d=s*$;if(!t.map?.isSolidAt(s,Vu)||[Q.SOLID,Q.BREAKABLE,Q.FAKE,Q.ONE_WAY].some(e=>t.map.getType(s,9)===e)||t.transitions.some(e=>Math.abs(e.x-d)<64))continue;let f=rd(n.id,o,d,a,c);t.layout?.overlaps(f,e=>!l||[`platform`,`movingPlatform`,`chest`,`chestClear`,`gate`,`prop`,`structure`].includes(e.kind))||(t.decorations.push({prop:o,x:d,y:a,flip:r.chance(.5),layer:`back`,scale:1,alpha:.72+r.float(0,.28),yOffset:c}),t.layout?.mark(f,`prop`,`${n.id}:${o}:${i+e}`,{prop:o}),u=!0)}}}function ad(e,t){let n=new h(f(t,`cemetery-backdrops`));for(let t=0;t<Ru;t++){let r=t*Lu,i=n.pick([`tree1`,`tree2`,`tree3`]);e.backdrops.push({prop:i,x:(r+n.int(9,25))*$,y:e.surface,tint:[.32,.27,.38],alpha:.62,flip:n.chance(.5)}),e.backdrops.push({prop:`bushLarge`,x:(r+n.int(7,27))*$,y:e.surface,tint:[.3,.35,.28],alpha:.54,flip:n.chance(.5)})}}function od(e){for(let t=0;t<Ru;t++){let n=t*Lu;e.backdrops.push({prop:`column`,x:(n+17)*$,y:e.surface,tint:[.62,.58,.82],alpha:.72,flip:t%2==0}),e.backdrops.push({prop:`balustrade`,x:(n+17)*$,y:e.surface,tint:[.5,.47,.68],alpha:.62,flip:t%2==1})}}function sd(e){let t=(t,n,r,i,a={})=>{let o=n*$+$/2,s=r>0?$u(e,r):e.surface,c=a.yOffset??0,l=rd(`dungeon`,t,o,s,c);return e.layout?.overlaps(l,e=>[`platform`,`movingPlatform`,`chest`,`chestClear`,`gate`,`prop`,`structure`].includes(e.kind))||c===0&&!e.map?.isSolidAt(n,Vu+r)?!1:(e.decorations.push({prop:t,x:o,y:s,yOffset:c,flip:i,layer:`back`,scale:1,alpha:a.alpha??1,tint:a.tint??null,glow:!!a.glow}),e.layout?.mark(l,`prop`,`dungeon:${t}:${n}:${r}`,{prop:t}),!0)};for(let n=0;n<Ru;n++){let r=n*Lu,i=e.dungeonTemplateOrder[n];for(let t of i.panels){let n=(r+t)*$;for(let t of[0,3])e.backdrops.push({prop:`wallLarge`,x:n,y:e.surface+t*$,yOffset:0,layer:`back`,alpha:.64,tint:[.24,.26,.34]})}for(let e of i.torches)t(`torch0`,r+e,0,e>=17,{yOffset:72,tint:[1.18,1.12,1.02],glow:!0});for(let t of i.statues)e.backdrops.push({prop:t.prop,x:(r+t.x)*$+$/2,y:e.surface,tint:[.62,.63,.72],alpha:.62,flip:(t.x+n)%2==0});e.setPieces.push({room:n,type:i.setPiece,x:(r+16)*$})}}function cd(e,t){let n=new h(f(t,`dungeon-decals`)),r=[`moss`,`puddle`,`crack`,`rubble`,`broken`];for(let t=0;t<Ru;t++){let i=t*Lu,a=0;for(let o=i+5;o<i+29;o++)e.map.getType(o,Vu)===Q.SOLID&&e.map.getType(o,9)===Q.EMPTY&&n.chance(.24)&&(e.transitions.some(e=>Math.abs(e.x-o*$)<28)||e.interactions.some(e=>Math.abs(e.x-o*$)<24)||(e.surfaceDecals.push({kind:r[(t*3+a)%r.length],x:o*$+$/2,y:e.paintedSurface,variant:n.int(0,3),flip:n.chance(.5),alpha:.24+n.float(0,.2)}),a++))}}function ld(e){let t=[];for(let n=0;n<e.map.height;n++){let r=-1;for(let i=0;i<=e.map.width;i++){let a=i<e.map.width&&e.map.getType(i,n)===Q.ONE_WAY;a&&r<0&&(r=i),!a&&r>=0&&(t.push({x:r*$,y:(n+1)*$-e.surfaceOffset,row:n,w:(i-r)*$}),r=-1)}}return t}function ud(e){for(let t=0;t<e.map.height;t++)for(let n=0;n<e.map.width;n++){let r=e.map.getType(n,t);r===Q.ONE_WAY?e.layout.markTile(n,t,`platform`,`${n}:${t}`,{x:n,y:t}):t>Vu&&(r===Q.SOLID||r===Q.BREAKABLE||r===Q.FAKE)&&e.layout.markTile(n,t,`structure`,`${n}:${t}`,{x:n,y:t})}for(let t of e.movingPlatforms)e.layout.mark({x:t.x-t.w/2,y:t.y,w:t.w,h:t.h},`movingPlatform`,t.id)}function dd(e){let t=new Set(e.layout.entries.filter(e=>e.kind===`chest`).map(e=>e.id));for(let n of e.interactions){if(n.type!==`chest`||t.has(n.id))continue;let r={x:n.x-9,y:n.y,w:18,h:16};if(e.layout.overlaps(r,e=>[`structure`,`gate`,`prop`,`chest`,`chestClear`].includes(e.kind))){n.opened=!0,n.removed=!0;continue}let i=e.map.getGroundYAtWorld(n.x,n.y-1);i===null||Math.abs(i-n.y)>1?(n.opened=!0,n.removed=!0):(e.layout.mark(r,`chest`,n.id),e.layout.mark({x:n.x-12,y:n.y,w:24,h:$*2},`chestClear`,`${n.id}:clear`))}e.interactions=e.interactions.filter(e=>!e.removed)}function fd(e,t,n){let r=n.indexOf(e.id);if(r>0){let i=n[r-1];nd(t,e,`left-${e.id}`,e.id===`forest`||i===`forest`?`portal`:`gate`,2.5*$,t.surface,i,`zone.return`,{labelZone:i,entrySide:`right`})}if(r>=0&&r<n.length-1){let i=n[r+1];nd(t,e,`right-${e.id}`,i===`forest`||e.id===`forest`?`portal`:`gate`,(zu-3)*$,t.surface,i,`action.usePortal`,{labelZone:i,entrySide:`left`,requiresBoss:!!e.boss})}for(let n of e.doors){if(e.id===`forest`)continue;let r=(n.room*Lu+Math.floor(Lu*n.offset))*$;nd(t,e,`door-${n.id}`,n.style===`portal`?`portal`:`door`,r,t.surface,n.target,`action.usePortal`,{labelZone:n.target,entrySide:`door`,doorId:n.id,targetDoor:n.id})}e.hasFinalGate&&(t.finalGate={id:`final-gate`,type:`finalGate`,x:24*$,y:t.surface,requiresShards:3},t.layout?.mark({x:24*$-18,y:t.surface,w:36,h:52},`gate`,`final-gate`,{zone:e.id}))}function pd(t,r,i={}){let a=n[r];if(!a)throw Error(`Unknown zone: ${r}`);let o=i.route??Wu(t),s=Object.values(i.packagedMaps??{}).find(e=>e?.map&&e?.config?.zoneId===r);if(s)return Iu({map:s.map,mapUrl:s.mapUrl,tilesets:s.tilesets,images:s.images,config:s.config,route:o,seed:t});let c=new Uint8Array(zu*Bu);Ku(c);let l=Number(e.footSink[r]??0),u=Number(Gc.tiles[r]?.surfaceOffset??0),d=u+l,p=Hu-d;new h(f(t,`zone`,r));let m={zoneId:r,seed:t,width:zu,height:Bu,rows:Bu,surface:p,surfaceOffset:d,paintedOffset:u,paintedSurface:Hu-u,footSink:l,fringeHeight:Number(e.foregroundFringe[r]??0),floorRow:Vu,spawn:{x:4*$,y:p},spawnRoom:a.spawnRoom,checkpoints:[],transitions:[],interactions:[],decorations:[],backdrops:[],surfaceDecals:[],setPieces:[],platformRuns:[],dungeonRooms:[],dungeonTemplateOrder:[],hazards:[],secrets:[],propsAnimated:[],movingPlatforms:[],arena:null,challenge:null,finalGate:null,rooms:[],bossRoom:a.bossRoom,styleFamily:a.family,atlas:a.atlas,palette:a.palette,enemyPool:a.enemyPool,elitePool:a.elitePool,bossKey:a.boss,ambient:a.weather};m.map=new hu(zu,Bu,c,{surfaceOffset:d,surfaceRow:Vu}),m.layout=new gu({width:zu,height:Bu,tileSize:$}),m.route=o,a.id===`dungeon`&&(m.dungeonTemplateOrder=new h(f(t,`dungeon-room-order`)).shuffle(pu).slice(0,Ru)),m.spawn=a.id===`dungeon`||a.id===`forest`?{x:10*$,y:p}:{x:6*$,y:p},fd(a,m,o);for(let e=0;e<Ru;e++){let n=new h(f(t,`room`,r,e));m.rooms.push({index:e,start:e*Lu,width:Lu}),td(a,e,c,n,m)}ud(m),dd(m);for(let e=0;e<Ru;e++)id(m,a,new h(f(t,`decor`,r,e)),e*Lu,p);return a.id===`cemetery`&&ad(m,t),a.id===`church`&&od(m),a.id===`dungeon`&&(sd(m),cd(m,t)),m.platformRuns=ld(m),m.reachability=hd(m),m}function md(e){let t=[],n=0;for(let r=0;r<zu;r++)e.map.isSolidAt(r,Vu)?n>0&&(t.push({end:r,length:n}),n=0):n++;return n>0&&t.push({end:zu,length:n}),t}function hd(e){let n=md(e),r=n.filter(e=>e.length>t.maxGapTiles),i=[];for(let t of e.transitions)i.push({id:t.id,x:t.x});e.finalGate&&i.push({id:`final-gate`,x:e.finalGate.x}),e.arena&&i.push({id:`arena`,x:e.arena.triggerX});let a=[];for(let r of i){let i=Math.round(r.x/$);n.filter(t=>t.end>e.spawn.x/$&&t.end<i).some(e=>e.length>t.maxGapTiles)&&a.push(r.id),(i<2||i>=zu-1)&&a.push(r.id)}return{ok:r.length===0&&a.length===0,gaps:n,badGaps:r,unreachable:a}}function gd(e,t={}){let n={},r=Wu(e);for(let a of i)n[a]=pd(e,a,{...t,route:r});return n}function _d(e,t,n){if(e.heavyPhase!==`none`||e.dashTimer>0)return;let r=t.wasPressed(`heavy`),i=t.wasPressed(`special`),a=t.wasPressed(`attack`)||t.isDown(`attack`)&&e.basicCooldown<=0;i&&e.specialCooldown<=0?wd(e,n):r&&e.heavyCooldown<=0?(e.heavyPhase=`windup`,e.heavyTimer=e.character.weapon.heavy.windup??.3,e.heavyStrikeFired=!1,e.attackAnim=e.heavyTimer+(e.character.weapon.heavy.recover??.3)+.1,e.animator.play(yd(e),{restart:!0}),e.emit({type:`heavyWindup`,characterId:e.characterId})):a&&e.basicCooldown<=0&&(e.basicCooldown=e.stats.attackCooldown,e.basicAnimTimer=Math.min(.3,e.stats.attackCooldown*.8),e.attackAnim=e.basicAnimTimer,e.attackKind=e.onGround?t.isDown(`down`)?`crouch`:`ground`:`air`,e.animator.play(vd(e),{restart:!0}),xd(e))}function vd(e){return e.characterId===`brakk`?e.attackKind===`air`?bd(e,`flyingKick`,`punch`,`attack`,`cast`):e.attackKind===`crouch`?bd(e,`crouchKick`,`punch`,`attack`,`cast`):bd(e,`punch`,`attack`,`cast`):bd(e,`attack`,`cast`)}function yd(e){return e.character.weapon.style===`melee`?bd(e,`kick`,`heavy`,`attack`):bd(e,`attack`,`cast`)}function bd(e,...t){for(let n of t)if(e.assets.getAnimation(e.character.sprite,n))return n;return`idle`}function xd(e){let t=e.character.weapon;if(t.style===`melee`){let n=e.evolved&&e.characterId===`brakk`;e.emit({type:`meleeStrike`,x:e.x,y:e.y,facing:e.facing,range:t.range*e.stats.area*(n?1.32:1),arcHeight:t.arcHeight,damage:t.damage*e.stats.damageMultiplier*(e.rageTimer>0?1.5:1)*(n?1.18:1),knockback:t.knockback,color:n?`#ff5a52`:e.character.accent,heavy:!1,evolved:n})}else Sd(e,!1)}function Sd(e,t){let n=e.character.weapon,r=n.heavy,i=t?1:e.stats.projectileCount,a=t?r.damage:n.damage,o=e.evolved?1.1:1,s=n.element===`frost`?e.stats.frostPower:1,c=a*e.stats.damageMultiplier*o*s*(e.rageTimer>0?1.5:1),l=t?r.speed:n.projectileSpeed,u=e.evolved&&e.characterId===`kael`?3:0,d=t?r.pierce:n.pierce+u,f=i>1?n.spread:0,p=t?n.style===`projectile`?n.aoe:0:n.aoe*e.stats.area;e.evolved&&e.characterId===`kael`&&!t&&(p=Math.max(p,24*e.stats.area)),e.evolved&&e.characterId===`seraphine`&&(p*=1.65);let m=e.evolved?e.characterId===`kael`?`#d8f7ff`:`#d7b7ff`:e.character.accent;for(let r=0;r<i;r++){let a=i===1?0:(r-(i-1)/2)*f,o=e.facing*l,s=a*60;e.emit({type:`spawnProjectile`,owner:`player`,x:e.x+e.facing*15,y:e.y+16+a*4,vx:o,vy:s,damage:c,pierce:d,aoe:p,element:n.element,color:m,trailColor:e.evolved?m:n.trailColor,life:t?n.projectileLife*1.2:n.projectileLife,heavy:t,evolved:e.evolved,characterId:e.characterId,knockback:n.knockback,weaponId:n.id,ricochet:e.evolved&&e.characterId===`nyx`?2:0})}let h={type:`muzzle`,x:e.x+e.facing*16,y:e.y+16,facing:e.facing,color:n.accent??e.character.accent,heavy:t};e.emit(h)}function Cd(e){let t=e.character.weapon;if(e.characterId===`kael`)Sd(e,!0),e.emit({type:`heavyTrail`,x:e.x,y:e.y,facing:e.facing,color:`#bfefff`});else if(e.characterId===`brakk`){let n=t.heavy.radius*e.stats.area;e.emit({type:`meleeStrike`,x:e.x,y:e.y,facing:e.facing,range:n,arcHeight:60,damage:t.heavy.damage*e.stats.damageMultiplier*(e.rageTimer>0?1.5:1),knockback:t.heavy.knockback,color:`#ff7a66`,heavy:!0}),e.emit({type:`shock`,x:e.x,y:e.y,facing:e.facing,color:`#d05155`,heavy:!0})}else e.characterId===`seraphine`?(e.emit({type:`burst`,x:e.x,y:e.y+16,radius:t.heavy.radius*e.stats.area,damage:t.heavy.damage*e.stats.frostPower*e.stats.damageMultiplier,color:`#cfadff`,element:`frost`,heavy:!0}),e.emit({type:`shock`,x:e.x,y:e.y,facing:e.facing,color:`#cdb0ff`,heavy:!0})):e.emit({type:`meleeStrike`,x:e.x,y:e.y,facing:e.facing,range:t.heavy.range*e.stats.area,arcHeight:t.heavy.arcHeight,damage:t.heavy.damage*e.stats.damageMultiplier,knockback:t.heavy.knockback,color:`#a48bff`,heavy:!0})}function wd(t,n){let r=t.character.special;if(t.specialCooldown=r.cooldown,t.attackAnim=.3,t.animator.play(bd(t,`cast`,`attack`),{restart:!0}),r.type===`trap`){let e=t.x+t.facing*38;t.emit({type:`specialTrap`,x:e,y:t.y,duration:r.duration,damage:r.damage*t.stats.frostPower*t.stats.damageMultiplier,radius:r.radius*t.stats.area}),t.emit({type:`castBurst`,x:t.x,y:t.y+16,color:`#9fe4ff`})}else if(r.type===`rage`)t.rageTimer=r.duration,t.emit({type:`rage`,x:t.x,y:t.y,duration:r.duration});else if(r.type===`blinkBurst`||r.type===`shadowStep`){let i=t.x,a=r.distance,o=t.x;for(let r=6;r<=a;r+=6){let i=t.x+t.facing*r,a=Math.floor((i+(t.facing>0?6:-6))/e.tile),s=Math.floor((t.y+2)/e.tile),c=Math.floor((t.y+t.height-2)/e.tile),l=!1;for(let e=s;e<=c;e++)if(n.map.isSolidAt(a,e)){l=!0;break}if(l)break;o=i}t.x=o,t.iframes=Math.max(t.iframes,r.iframes??.35),t.emit({type:`blink`,fromX:i,toX:o,y:t.y+16,facing:t.facing}),r.type===`blinkBurst`?(t.emit({type:`burst`,x:t.x,y:t.y+16,radius:r.radius*t.stats.area,damage:r.damage*t.stats.frostPower*t.stats.damageMultiplier,color:`#d5bcff`,element:`frost`,heavy:!0}),t.emit({type:`burst`,x:i,y:t.y+16,radius:r.radius*.6*t.stats.area,damage:r.damage*.5*t.stats.damageMultiplier,color:`#a9e8ff`,element:`frost`,heavy:!1})):t.emit({type:`meleeStrike`,x:i,y:t.y,facing:t.facing,range:46,arcHeight:40,damage:r.damage*t.stats.damageMultiplier,knockback:120,color:`#9c86ff`,heavy:!1})}t.emit({type:`specialUsed`,characterId:t.characterId})}var Td=class{constructor(t,n,r={}){if(this.character=fu[t],!this.character)throw Error(`Unknown character: ${t}`);this.characterId=t,this.assets=n,this.animator=new al(n,this.character.sprite),this.x=0,this.y=0,this.prevX=0,this.prevY=0,this.width=e.player.width,this.height=e.player.height,this.vx=0,this.vy=0,this.facing=1,this.onGround=!1,this.coyote=0,this.jumpBuffer=0,this.dropThrough=0,this.dashTimer=0,this.dashCooldown=0,this.dashDirection=1,this.iframes=0,this.hurtTimer=0,this.dead=!1,this.devFly=!1,this.immortal=!1,this.spawnGrace=1,this.specialCooldown=0,this.specialActiveTimer=0,this.heavyPhase=`none`,this.heavyTimer=0,this.heavyCooldown=0,this.heavyStrikeFired=!1,this.basicCooldown=0,this.basicAnimTimer=0,this.attackAnim=0,this.attackKind=`ground`,this.attackPressed=!1,this.attackHeld=!1,this.events=[],this.afterimages=[],this.afterimageTimer=0,this.animTime=0,this.rageTimer=0,this.flashTimer=0,this.hazardCooldown=0,this.metaModifiers=r,this.stats=this.computeStats({},r),this.health=this.stats.maxHealth,this.maxHealth=this.stats.maxHealth,this.enemyHitCount=0,this.lastDamageAt=0,this.timeAlive=0,this.weaponLevel=1,this.evolved=!1,this.upgradeLevels={},this.upgrades={},this.magnetRange=this.character.stats.pickupMagnet}setWorld(e){this.world=e,this.map=e.map,this.animator.play(`idle`)}setPosition(e,t){this.x=e,this.y=t,this.prevX=e,this.prevY=t,this.vx=0,this.vy=0,this.onGround=!1}computeStats(t,n=this.metaModifiers){let r=this.character;this.stats;let i=this.weaponLevel??1,a=this.upgrades??{},o=n??{},s=r.stats.maxHealth+(a.maxHealthBonus??0)+(o.vitality??0)*5,c=e.player.walkSpeed*r.stats.moveSpeed*(1+(a.moveSpeedBonus??0)),l=1+(a.attackSpeedBonus??0),u=Math.min(e.power.critChanceCap,r.stats.critChance+(a.critChanceBonus??0)),d=r.stats.critDamage+(a.critDamageBonus??0),f=1+(a.frostPower??0),p=1+(a.areaBonus??0),m=Math.min(e.power.armorCap,r.stats.armor+(a.armorBonus??0)),h=Math.min(e.power.dashCooldownReductionCap,a.dashCooldownReduction??0),g=r.weapon.style===`projectile`?Math.min(e.power.projectileCountCap,r.weapon.projectileCount+(a.projectileCountBonus??0)):0,_=1+(a.xpGainBonus??0)+(o.fortune??0)*.04,v=Math.min(e.power.magnetRangeCap,r.stats.pickupMagnet+(a.magnetRangeBonus??0)),y=a.lifeOnKillBonus??0,b=(1+(o.edge??0)*.03)*(1+(i-1)*.06);return{maxHealth:s,moveSpeed:c,attackSpeed:l,critChance:u,critDamage:d,frostPower:f,area:p,armor:m,dashCooldown:r.stats.dashCooldown*(1-h),specialCooldown:r.stats.specialCooldown,projectileCount:g,xpMultiplier:_,magnetRange:v,lifeOnKill:y,damageMultiplier:b,attackCooldown:r.weapon.cooldown/l,heavyCooldown:r.weapon.heavy.cooldown,dashIFrames:e.player.dashIFrames}}applyProgression(e,t,n){let r=this.maxHealth;this.upgrades=e,this.evolved=t,this.metaModifiers=n??this.metaModifiers,this.stats=this.computeStats(e,this.metaModifiers),this.maxHealth=this.stats.maxHealth,this.magnetRange=this.stats.magnetRange,this.maxHealth>r&&(this.health+=this.maxHealth-r),this.health=Math.min(this.health,this.maxHealth)}setWeaponLevel(e){this.weaponLevel=e,this.stats=this.computeStats(this.upgrades,this.metaModifiers)}update(e,t,n){this.dead||(this.world=t,this.map=t.map,this.prevX=this.x,this.prevY=this.y,this.devFly?this.updateDevFlight(e,t,n):(this._wasRiding=this.ridingPlatform,this.ridingPlatform&&(this.x+=this.ridingPlatform.dx??0,this.y+=this.ridingPlatform.dy??0),this.timeAlive+=e,this.animTime+=e,this.tickTimers(e),this.handleDash(n,t),_d(this,n,t),this.handleHorizontal(e,n),this.applyGravity(e),this.integrate(e,t),this.checkMovingPlatforms(t),this.handleHazards(e,t),this.chooseAnimation(),this.animator.update(e),this.updateAfterimages(e)))}updateDevFlight(t,n,r){let i=r.getAxis(),a=+!!r.isDown(`jump`)-!!r.isDown(`down`),o=e.dev.flySpeed;this.vx=i*o,this.vy=a*o,i!==0&&(this.facing=i),this.x=g(this.x+this.vx*t,8,n.width*e.tile-8),this.y=g(this.y+this.vy*t,8,n.height*e.tile-8),this.onGround=!1,this.animTime+=t,this.iframes=Math.max(this.iframes,.2),this.animator.play(i===0?`idle`:`run`),this.animator.update(t)}tickTimers(e){this.iframes=Math.max(0,this.iframes-e),this.spawnGrace=Math.max(0,this.spawnGrace-e),this.specialCooldown=Math.max(0,this.specialCooldown-e),this.basicCooldown=Math.max(0,this.basicCooldown-e),this.basicAnimTimer=Math.max(0,this.basicAnimTimer-e),this.dashCooldown=Math.max(0,this.dashCooldown-e),this.hurtTimer=Math.max(0,this.hurtTimer-e),this.hazardCooldown=Math.max(0,this.hazardCooldown-e),this.flashTimer=Math.max(0,this.flashTimer-e),this.attackAnim=Math.max(0,this.attackAnim-e),this.heavyPhase!==`none`&&this.tickHeavy(e),this.rageTimer=Math.max(0,this.rageTimer-e),this.dashCooldown<=0&&this.dashTimer<=0&&(this.afterimages.length=0)}tickHeavy(e){this.heavyTimer-=e;let t=this.character.weapon.heavy;this.heavyPhase===`windup`&&this.heavyTimer<=0?(this.heavyPhase=`strike`,this.heavyTimer=.08,this.heavyStrikeFired||(this.heavyStrikeFired=!0,Cd(this))):this.heavyPhase===`strike`&&this.heavyTimer<=0?(this.heavyPhase=`recover`,this.heavyTimer=t.recover??.3):this.heavyPhase===`recover`&&this.heavyTimer<=0&&(this.heavyPhase=`none`,this.heavyCooldown=this.stats.heavyCooldown)}handleDash(t,n){if(t.wasPressed(`dash`)&&this.dashCooldown<=0&&this.heavyPhase===`none`){let n=t.getAxis();this.dashDirection=n===0?this.facing:n,this.facing=this.dashDirection,this.dashTimer=e.player.dashDuration,this.dashCooldown=this.stats.dashCooldown,this.iframes=Math.max(this.iframes,e.player.dashIFrames),this.ridingPlatform=null,this._wasRiding=null,this.vy=0,this.emit({type:`dash`,x:this.x,y:this.y,direction:this.dashDirection}),this.afterimageTimer=0}this.dashTimer>0&&(this.dashTimer=Math.max(0,this.dashTimer-e.fixedStep),this.vx=this.dashDirection*e.player.dashSpeed,this.vy=0,this.afterimageTimer-=e.fixedStep,this.afterimageTimer<=0&&(this.afterimageTimer=.028,this.afterimages.push({x:this.x,y:this.y,frame:this.animator.frame,facing:this.facing,life:.24,maxLife:.24}),this.afterimages.length>7&&this.afterimages.shift()),this.emit({type:`dashTrail`,x:this.x,y:this.y,facing:this.facing}))}handleHorizontal(t,n){let r=n.getAxis();if(this.dashTimer>0){this.map.moveX(this,this.vx*t)&&(this.dashTimer=0,this.vx=0);return}let i=this.heavyPhase===`windup`?.18:this.attackAnim>0?.65:1,a=r*this.stats.moveSpeed*i,o=this.onGround?e.player.groundAccel:e.player.airAccel;if(r!==0)this.facing=r,this.vx+=g(a-this.vx,-o*t,o*t);else{let n=this.onGround?e.player.groundFriction:e.player.airFriction;Math.abs(this.vx)<=n*t?this.vx=0:this.vx-=Math.sign(this.vx)*n*t}this.vx=g(this.vx,-this.stats.moveSpeed,this.stats.moveSpeed);let s=this.vx*t;this.map.moveX(this,s)&&(this.vx=0),this.jumpBuffer=n.wasPressed(`jump`)?e.player.jumpBuffer:Math.max(0,this.jumpBuffer-t),this.coyote=this.onGround?e.player.coyoteTime:Math.max(0,this.coyote-t),this.jumpBuffer>0&&this.coyote>0&&(this.vy=e.player.jumpSpeed,this.jumpBuffer=0,this.coyote=0,this.onGround=!1,this.ridingPlatform=null,this._wasRiding=null,this.emit({type:`jump`,x:this.x,y:this.y})),!n.isDown(`jump`)&&this.vy>0&&(this.vy*=e.player.jumpCut),n.wasPressed(`jump`)&&n.isDown(`down`)&&(this.dropThrough=.15),this.dropThrough=Math.max(0,this.dropThrough-t)}applyGravity(t){this.dashTimer>0||(this.vy-=e.player.gravity*t,this.vy=Math.max(this.vy,-e.player.maxFall))}integrate(e,t){let n=this.onGround;this.onGround=!1;let r=this.vy*e;if(r!==0&&this.map.moveY(this,r).grounded&&(this.onGround=!0),this.dashTimer<=0){let e=this.map.checkGround(this);this.onGround=e}!n&&this.onGround&&this.emit({type:`land`,x:this.x,y:this.y,velocity:Math.abs(this.vy)})}checkMovingPlatforms(e){let t=e.movingPlatforms,n=this._wasRiding;if(this.ridingPlatform=null,!t?.length)return;let r=this.width/2;for(let e of t){let t=e.y;if(!(this.x+r>e.x-e.w/2+2&&this.x-r<e.x+e.w/2-2))continue;let i=n===e;if(!(!i&&this.vy>0)&&!(!i&&this.prevY<t-1)&&(i||this.y<=t+2&&this.y>=t-12)){this.y=t,this.vy=0,this.onGround=!0,this.ridingPlatform=e;break}}}handleHazards(t,n){this.iframes>0||this.spawnGrace>0||(n.map.rectHitsHazard(this.x-this.width/2,this.y,this.width,this.height)&&this.hazardCooldown<=0&&(this.hazardCooldown=.8,this.emit({type:`hazardHit`,x:this.x,y:this.y})),this.y<e.world.fallDeathY&&this.emit({type:`fell`,x:this.x,y:this.y}))}takeDamage(t,n=null){if(this.immortal||this.dead||this.iframes>0||this.spawnGrace>0)return 0;let r=t*(1-this.stats.armor);return this.health=Math.max(0,this.health-r),this.iframes=e.player.hurtIFrames,this.hurtTimer=.25,this.flashTimer=.14,this.emit({type:`playerHurt`,x:this.x,y:this.y+this.height*.5,amount:r,source:n}),this.health<=0&&(this.dead=!0,this.emit({type:`playerDeath`,x:this.x,y:this.y})),r}heal(e){let t=this.health;this.health=Math.min(this.maxHealth,this.health+e);let n=this.health-t;return n>.5&&this.emit({type:`heal`,x:this.x,y:this.y+24,amount:n}),n}onEnemyKilled(){this.rageTimer>0&&this.heal(2),this.stats.lifeOnKill>0&&this.heal(this.stats.lifeOnKill)}chooseAnimation(){this.animator.animation||this.animator.play(`idle`),this.hurtTimer>0&&this.assets.getAnimation(this.character.sprite,`hurt`)?this.animator.play(`hurt`):this.heavyPhase!==`none`||this.attackAnim>0?this.characterId===`seraphine`?this.animator.play(`cast`):this.characterId===`brakk`?this.heavyPhase===`none`?this.animator.play(vd(this)):this.animator.play(yd(this)):this.heavyPhase!==`none`&&this.assets.getAnimation(this.character.sprite,`heavy`)?this.animator.play(`heavy`):this.animator.play(`attack`):this.onGround?Math.abs(this.vx)>10?this.animator.play(bd(this,`run`,`idle`)):this.animator.play(`idle`):this.characterId===`seraphine`?this.animator.play(`idle`):this.vy>0?this.animator.play(bd(this,`jump`,`run`)):this.animator.play(bd(this,`fall`,`jump`,`run`))}updateAfterimages(e){for(let t=this.afterimages.length-1;t>=0;t--){let n=this.afterimages[t];n.life-=e,n.life<=0&&this.afterimages.splice(t,1)}}consumeEvents(){let e=this.events.slice();return this.events.length=0,e}emit(e){this.events.push(e)}getRenderPosition(e){return{x:Math.round(this.prevX+(this.x-this.prevX)*e),y:Math.round(this.prevY+(this.y-this.prevY)*e)}}getCenter(){return{x:this.x,y:this.y+this.height/2}}getBounds(){return{x:this.x-this.width/2,y:this.y,w:this.width,h:this.height}}},Ed=class{constructor(t){this.game=t,this.rng=new h(1),this.level=1,this.xp=0,this.xpToNext=e.progression.baseXpToLevel,this.xpEarned=0,this.weaponLevel=1,this.upgradeLevels={},this.evolved=!1,this.evolutionId=null,this.pendingLevelUps=0,this.offers=[],this.reset(e.seed.default)}reset(t,n=`kael`){this.rng=new h(f(t,`progression`,n)),this.level=1,this.xp=0,this.xpToNext=e.progression.baseXpToLevel,this.xpEarned=0,this.weaponLevel=1,this.upgradeLevels={},this.evolved=!1,this.evolutionId=null,this.pendingLevelUps=0,this.offers=[],this.syncRun()}get character(){return this.game.player?.character}syncRun(){let e=this.game.run;e&&(e.level=this.level,e.xp=this.xp,e.xpToNext=this.xpToNext,e.weaponLevel=this.weaponLevel,e.upgradeLevels=this.upgradeLevels,e.evolved=this.evolved,e.evolutionId=this.evolutionId)}addXp(t){if(!this.game.player)return;let n=Math.max(1,Math.round(t*this.game.player.stats.xpMultiplier));this.xp+=n,this.xpEarned+=n,this.game.run.xpEarned+=n;let r=!1;for(;this.xp>=this.xpToNext&&this.level<e.progression.maxLevel;)this.xp-=this.xpToNext,this.level+=1,this.xpToNext=Math.round(e.progression.baseXpToLevel*e.progression.xpCurve**(this.level-1)),this.pendingLevelUps+=1,r=!0,e.progression.weaponLevelsAt.includes(this.level)&&this.weaponLevel<5&&(this.weaponLevel+=1,this.game.player.setWeaponLevel(this.weaponLevel),this.game.ui?.toast(`toast.weaponLevel`,{weapon:this.game.ui.t(this.character.weapon.nameKey),level:this.weaponLevel},{icon:`✦`}));this.syncRun(),r&&this.game.onPlayerLeveledUp()}applyUpgrade(e){let t=Il[e];if(!t)return!1;let n=this.upgradeLevels[e]??0;return n>=t.maxLevel?!1:(this.upgradeLevels[e]=n+1,this.recalculatePlayer(),this.syncRun(),this.game.ui?.toast(t.nameKey,{},{icon:t.icon}),!0)}isEvolutionReady(){let e=Ll[this.game.player?.characterId];return!e||this.evolved||this.weaponLevel<e.weaponLevel?!1:(this.upgradeLevels[e.requiresUpgrade]??0)>0}buildOffers(){let t=[],n=Ll[this.game.player?.characterId];this.isEvolutionReady()&&t.push({type:`evolution`,id:n.id,data:{id:n.id,nameKey:n.nameKey,descKey:n.descKey,icon:`❖`,color:n.color,maxLevel:1}});let r=this.game.player?.characterId,i=[...Fl.filter(e=>(this.upgradeLevels[e.id]??0)<e.maxLevel&&(!e.validFor||e.validFor.includes(r)))];for(;t.length<e.progression.cardCount&&i.length>0;){let e=this.rng.int(0,i.length-1),n=i.splice(e,1)[0];t.push({type:`upgrade`,id:n.id,data:n})}return this.offers=t,t}chooseOffer(e){let t=this.offers[e];return t?(t.type===`evolution`?(this.evolved=!0,this.evolutionId=t.id,this.recalculatePlayer(),this.game.ui?.toast(t.data.nameKey,{},{icon:`❖`,achievement:!0}),this.game.audio.play(`shard`),this.game.onEvolution?.(t.id)):this.applyUpgrade(t.id),this.pendingLevelUps=Math.max(0,this.pendingLevelUps-1),this.syncRun(),this.offers=[],!0):!1}grantChestReward(e=!1){let t=this.game.player?.characterId,n=Fl.filter(e=>(this.upgradeLevels[e.id]??0)<e.maxLevel&&(!e.validFor||e.validFor.includes(t)));if(n.length&&(e||this.rng.chance(.62))){let e=this.rng.pick(n);return this.applyUpgrade(e.id),{type:`upgrade`,data:e}}if(this.rng.chance(.45)){let e=10+this.rng.int(0,9);return this.addXp(e),{type:`xp`,amount:e}}return this.game.player.heal(Math.round(this.game.player.maxHealth*.25)),{type:`heal`}}hasPendingLevelUps(){return this.pendingLevelUps>0}recalculatePlayer(){if(!this.game.player)return;let e=Rl(this.upgradeLevels);this.game.player.applyProgression(e,this.evolved,this.game.getMetaModifiers())}},Dd=class{constructor(e){this.game=e}startRun(t,r){let i=this.game;if(fu[t]&&i.save.isUnlocked(t)){i.seed=r>>>0||e.seed.default,i.save.updateSettings({seed:i.seed}),i.run={seed:i.seed,elapsed:0,level:1,xp:0,xpToNext:e.progression.baseXpToLevel,kills:0,xpEarned:0,bosses:[],bossIds:[],shards:[],shardIds:[],chestsOpened:0,weaponLevel:1,evolved:!1,evolutionId:null,upgradeLevels:{},upgradeStats:{},damageTaken:0,characterId:t,checkpoint:{x:0,y:0},flags:{},startTime:performance.now(),victory:!1},i.worlds=gd(i.seed,{packagedMaps:i.packagedMaps}),i.player=new Td(t,i.assets,this.getMetaModifiers()),i.player.devFly=!!i.devFly,i.player.immortal=!!i.devFly,i.progression=new Ed(i),i.progression.reset(i.seed,t),i.progression.recalculatePlayer(),i.progression.syncRun(),i.state=`playing`,i.enemies=[],i.projectiles.clear(),i.traps=[],i.particles.clear(),i.glowParticles.clear(),i.effects.clear(),i.xpOrbs.clear(),i.xpOrbs.setSeed(i.seed),i.hitstopFrames=0,i.runRecorded=!1,i.lastAchievementSecond=0,i.zoneStates={};for(let e of Object.keys(n))i.zoneStates[e]={bossDefeated:!1,bossStarted:!1,seen:e===`cemetery`};i.currentInteraction=null,i.prompt=null,i.transition=null,i.lastRoom=-1,i.boss=null,i.bossHazards=[],i.bossDamageTaken=0,i.arenaGatePositions=[],i.gameAchievements?.reset(),i.combat.setSeed(i.seed),i.setZone(`cemetery`,i.worlds.cemetery.spawn),i.player.setPosition(i.activeWorld.spawn.x,i.activeWorld.spawn.y),i.run.checkpoint={...i.activeWorld.spawn},i.snapCameraToPlayer(),i.spawnDirector.reset(i.seed,`cemetery`),i.interactions.updatePrompt(),i.ui?.clearScreen(),i.ui?.setZoneTheme(i.activeZone),i.ui?.showHUD(!0),i.ui?.clearDamageNumbers(),i.ui?.setFade(!0),setTimeout(()=>i.ui?.setFade(!1),300),i.audio.ensure(),i.audio.startAmbient(`cemetery`),i.ui?.toast(`zone.entered`,{zone:i.ui.t(i.activeZone.nameKey)},{duration:1400})}}getMetaModifiers(){return{...this.game.save.meta.permanent}}endRun(e){let t=this.game;if(t.state===`result`)return;t.state=`result`,t.player&&(t.player.dead=!0),t.audio.stopAmbient(),t.ui?.clearToasts?.(),t.bossHazards=[];let n=t.save.meta.bestTime??0,r=this.buildSummary(e===`victory`);r.achievements=t.gameAchievements?[...t.gameAchievements.unlockedThisRun]:[],t.runRecorded||(t.runRecorded=!0,t.gameAchievements?.persist(),t.save.recordRun(r));let i=r.elapsed>n;t.ui?.showResult(r,e===`victory`,i),t.ui?.setFade(!1),t.input.clear()}buildSummary(t){let n=this.game,r=n.run,i=fu[r.characterId];return{seed:n.seed,characterId:r.characterId,elapsed:r.elapsed,kills:r.kills,bosses:r.bossIds,bossIds:r.bossIds,xp:r.xpEarned,level:r.level,upgradeLevels:r.upgradeLevels,shardsEarned:r.shards.length*e.meta.bossShardReward+(n.gameAchievements?.rewardTotal??0),shardIds:r.shardIds,achievements:[],topUpgrades:Object.entries(r.upgradeLevels).map(([e,t])=>({id:e,level:t,nameKey:`upgrade.${e}.name`})).sort((e,t)=>t.level-e.level).slice(0,3),weaponNameKey:r.evolved?Ll[r.characterId]?.nameKey??i.weapon.nameKey:i.weapon.nameKey,weaponLevel:r.weaponLevel,evolved:r.evolved,victory:t}}abandonRun(){this.endRun(`abandon`)}restartRun(){let e=this.game;if(!e.run)return;let t=e.run.characterId,n=e.seed;e.ui?.clearDamageNumbers(),this.startRun(t,n)}returnToMenu(){let e=this.game;e.state=`menu`,e.audio.stopAmbient(),e.ui?.clearToasts?.(),e.disposeScene(),e.player=null,e.run=null,e.enemies=[],e.projectiles.clear(),e.traps=[],e.particles.clear(),e.glowParticles.clear(),e.effects.clear(),e.xpOrbs.clear(),e.progression=null,e.boss=null,e.buildMenuScene(),e.ui?.showHUD(!1),e.ui?.clearScreen(),e.ui?.clearDamageNumbers()}},Od=class{constructor(e){this.game=e}update(){let e=this.game,t=e.activeWorld,n=e.player;if(t?.pickups?.length&&n&&!n.dead)for(let e of t.pickups){if(e.collected)continue;let t=e.x-n.x,r=e.y+6-(n.y+n.height*.5);Math.abs(t)>18||Math.abs(r)>24||this.collect(e)}}collect(e){let t=this.game;if(e.collected=!0,e.type===`health_potion`){let n=Math.max(18,Math.round(t.player.maxHealth*.25));t.player.health=Math.min(t.player.maxHealth,t.player.health+n),t.ui?.spawnDamageNumber(t.player.x,t.player.y+28,n,`heal`),t.ui?.toast(`toast.heal`,{},{icon:`✚`}),t.audio.play(`ui`),t.glowParticles.burst([Z.bone,Z.white],e.x,e.y,14,{speed:55,life:.6,gravity:-40,size:2});return}if(e.type===`dungeon_key`){t.run.flags=t.run.flags??{},t.run.flags.dungeon_key=!0,t.ui?.toast(`item.dungeonKey`,{},{icon:`⌘`,achievement:!0,duration:2400}),t.audio.play(`shard`),t.glowParticles.burst([Z.gold,Z.white],e.x,e.y,24,{speed:80,life:.9,gravity:-30,size:2.5});return}let n=Math.max(4,Math.round((e.value||1)*3));t.xpOrbs.spawn(n,e.x,e.y,{big:n>=12,burst:!1}),t.audio.play(`xp`,{throttle:40}),t.particles.burst([Z.gold],e.x,e.y,4,{speed:24,life:.35,gravity:30,size:1})}},kd=class{constructor(e){this.game=e,this.ambientTimer=0}updateMovingPlatforms(){let e=this.game,t=e.activeWorld?.movingPlatforms;if(!t?.length)return;let n=e.run.elapsed;for(let e of t){let t=Math.sin(n*e.speed+e.phase)*e.range,r=e.axis===`x`?e.baseX+t:e.baseX,i=e.axis===`y`?e.baseY+t:e.baseY;e.dx=r-e.x,e.dy=i-e.y,e.x=r,e.y=i}}updateTriggers(){let e=this.game,t=e.activeWorld,n=e.player;if(t?.triggers?.length&&n&&!n.dead)for(let r of t.triggers){if(r.shown||n.x<r.x||n.x>r.x+r.w||n.y<r.y-8||n.y>r.y+r.h+8)continue;r.shown=!0;let t=r.textKey?e.ui?.t?.(r.textKey)??r.text:r.text;e.ui?.toastText?.(t,{icon:`!`,duration:3200}),e.audio.play(`ui`)}}emitAmbient(t){let n=this.game;if(this.ambientTimer-=t,this.ambientTimer>0)return;this.ambientTimer=.18+Math.random()*.18;let r=n.camera.x+(Math.random()-.5)*e.internalWidth,i=n.camera.y+(Math.random()-.5)*e.internalHeight,a=Z.ember,o=8,s=2.6;n.activeZoneId===`swamp`?(a=Math.random()<.5?Z.venom:Z.gold,o=Math.random()<.5?-6:7,s=3.5):n.activeZoneId===`forest`?(a=Z.venom,o=5+Math.random()*9,s=3.8):n.activeZoneId===`church`?(a=Z.bone,o=5,s=3.4):n.activeZoneId===`dungeon`&&(a=Math.random()<.35?Z.ember:Z.bone,o=3+Math.random()*5,s=4.5),n.glowParticles.emit({x:r,y:i,vx:(Math.random()-.5)*9,vy:o,gravity:-1.5,drag:.08,life:s,sizeX:Math.random()<.12?2:1,sizeY:Math.random()<.12?2:1,color:a,alpha:.34})}},Ad=class{constructor({scene:t,assets:n,zoneId:r}){this.scene=t,this.assets=n,this.zoneId=r,this.layers=[],this.group=new jn,this.group.renderOrder=e.rendering.layers.background,t.add(this.group),this.initLayers()}initLayers(){let t=this.assets.backgroundManifest[this.zoneId]??[],n=0;for(let r of t){let t=this.assets.backgrounds.get(r.image);if(!t)continue;let i=t.img,a=t.texture,o=i.width,s=i.height;if(r.crop){let[e,t,n,c]=r.crop,l=document.createElement(`canvas`);l.width=n,l.height=c;let u=l.getContext(`2d`);u.imageSmoothingEnabled=!1,u.drawImage(i,e,t,n,c,0,0,n,c),a=new Si(l),a.magFilter=E,a.minFilter=E,a.generateMipmaps=!1,a.colorSpace=at,o=n,s=c}let c=o,l=r.single?1:Math.ceil(e.internalWidth/c)+2,u=new Wr({map:a,transparent:!0,opacity:r.opacity??1,depthTest:!1,depthWrite:!1,color:new q(r.tint?.[0]??1,r.tint?.[1]??1,r.tint?.[2]??1)}),d=new mi(new Di(1,1),u,l);d.frustumCulled=!1,d.renderOrder=e.rendering.layers.background+n,d.instanceMatrix.setUsage(dt);let f=new nn,p={x:0,y:0,sx:c,sy:s};for(let e=0;e<l;e++)f.compose(new W(0,0,0),new Pt,new W(p.sx,p.sy,1)),d.setMatrixAt(e,f);d.instanceMatrix.needsUpdate=!0,this.group.add(d),this.layers.push({def:r,mesh:d,matrix:f,count:l,width:c,height:s,parallax:r.parallax??.1,y:r.y??0,texture:a,ownTexture:!!r.crop,position:new W,quaternion:new Pt,scale:new W(c,s,1)}),n++}}update(t,n){let r=e.internalWidth/2,i=e.internalHeight/2;for(let e of this.layers){let a=Math.floor(t*e.parallax),o=e.def.single?Math.floor(t+(e.def.x??0)):Math.floor(t-r-(a%e.width+e.width)%e.width),s=Number.isFinite(e.def.worldY)?Math.floor(e.def.worldY):Math.floor(n-i+e.y);for(let t=0;t<e.count;t++){let n=e.def.single?o:o+t*e.width+e.width/2,r=s+e.height/2;e.position.set(n,r,0),e.matrix.compose(e.position,e.quaternion,e.scale),e.mesh.setMatrixAt(t,e.matrix)}e.mesh.instanceMatrix.needsUpdate=!0}}dispose(){this.group.removeFromParent();for(let e of this.layers)e.mesh.geometry.dispose(),e.mesh.material.dispose(),e.ownTexture&&e.texture.dispose();this.layers=[]}},jd=`
  attribute vec4 color;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vUv = uv;
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Md=`
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.02) discard;
    gl_FragColor = vec4(tex.rgb * vColor.rgb, tex.a * vColor.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`,Nd=class{constructor({scene:t,map:n,atlas:r,assets:i,zoneId:a,chunkTiles:o=16,tileSize:s=16,fringeHeight:c=0,surfaceInset:l=0}){this.scene=t,this.map=n,this.atlas=r,this.assets=i,this.zoneId=a,this.chunkTiles=o,this.tileSize=s,this.fringeHeight=Math.max(0,Math.min(5,Number(c)||0)),this.surfaceInset=Math.max(0,Number(l)||0),this.fringeMesh=null,this.chunks=new Map,this.groupWidth=i.getGroupWidth(a),this.material=new Ii({uniforms:{uMap:{value:r.texture}},vertexShader:jd,fragmentShader:Md,transparent:!0,depthTest:!0,depthWrite:!1,side:2}),this.group=new jn,this.group.renderOrder=e.rendering.layers.tiles,this.scene.add(this.group),this.buildAll(),this.buildFringe()}buildFringe(){if(this.fringeMesh&&=(this.fringeMesh.removeFromParent(),this.fringeMesh.geometry.dispose(),null),this.fringeHeight<=0)return;let t=[],n=[],r=[],i=[],a=this.groupWidth;for(let e=0;e<this.map.height;e++)for(let o=0;o<this.map.width;o++){let s=this.map.getType(o,e);if(s!==1&&s!==2&&s!==4)continue;let c=this.map.getType(o,e+1);if(s!==2&&(c===1||c===4))continue;let l=this.assets.getTileFrame(this.zoneId,`top`,o%a);if(!l)continue;let u=Math.min(this.surfaceInset,Math.max(0,l.h-1)),d=(e+1)*this.tileSize-u,f=Math.min(this.fringeHeight,l.h-u,this.tileSize);if(f<=0)continue;let p=o*this.tileSize,m=d-f,h=l.v1-(l.v1-l.v0)*(u/l.h),g=l.v1-(l.v1-l.v0)*((u+f)/l.h),_=t.length/3;t.push(p,m,0,p+this.tileSize,m,0,p+this.tileSize,d,0,p,d,0),n.push(l.u0,g,l.u1,g,l.u1,h,l.u0,h),r.push(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),i.push(_,_+1,_+2,_,_+2,_+3)}if(!t.length)return;let o=new Mr;o.setAttribute(`position`,new J(t,3)),o.setAttribute(`uv`,new J(n,2)),o.setAttribute(`color`,new J(r,4)),o.setIndex(i);let s=new ni(o,this.material);s.renderOrder=e.rendering.layers.fringe,s.frustumCulled=!1,this.scene.add(s),this.fringeMesh=s}frameFor(e,t,n){let r=this.map.getType(e,t+1),i=this.map.getType(e,t+2),a=r===1||r===3||r===4,o=i===1||i===3||i===4,s=this.groupWidth,c=e=>e===1||e===4||e===5,l=(e,t,n)=>!t&&!n||!t?`${e}Left`:n?e:`${e}Right`;if(n===2){let n=l(`top`,this.map.getType(e-1,t)===2,this.map.getType(e+1,t)===2);return{frame:this.assets.getTileFrame(this.zoneId,n,e%s)??this.assets.getTileFrame(this.zoneId,`top`,e%s),color:[1,1,1,1]}}let u=c(this.map.getType(e-1,t)),d=c(this.map.getType(e+1,t));if(n===4){let t=l(`body`,u,d);return{frame:this.assets.getTileFrame(this.zoneId,t,e%s)??this.assets.getTileFrame(this.zoneId,`body`,e%s),color:[1.18,.68,.62,1]}}if(n===5){let t=l(`body`,u,d);return{frame:this.assets.getTileFrame(this.zoneId,t,(e+1)%s)??this.assets.getTileFrame(this.zoneId,`body`,(e+1)%s),color:[.8,.72,.9,.58]}}let f,p;a?o?(f=`deep`,p=e%s):(f=`body`,p=(e+1)%s):(f=`top`,p=e%s),f=l(f,u,d);let m=this.assets.getTileFrame(this.zoneId,f,p)??this.assets.getTileFrame(this.zoneId,f.replace(/(Left|Right)$/,``),p),h=[1,1,1,1];if(this.zoneId===`dungeon`){let e=Math.max(0,this.map.surfaceRow-t),n=f.startsWith(`top`)?1:Math.max(.14,.94-e*.2);h=[n,n*.96,n*.88,1]}return{frame:m,color:h}}buildChunk(e,t){let n=[],r=[],i=[],a=[],o=e*this.chunkTiles,s=t*this.chunkTiles,c=this.tileSize;for(let e=s;e<s+this.chunkTiles;e++)for(let t=o;t<o+this.chunkTiles;t++){let o=this.map.getType(t,e);if(o!==1&&o!==2&&o!==4&&o!==5)continue;let s=this.frameFor(t,e,o),l=s.frame;if(!l)continue;let u=t*c,d=e*c,f=n.length/3,[p,m,h,g]=s.color;n.push(u,d,0,u+c,d,0,u+c,d+c,0,u,d+c,0),r.push(l.u0,l.v0,l.u1,l.v0,l.u1,l.v1,l.u0,l.v1),i.push(p,m,h,g,p,m,h,g,p,m,h,g,p,m,h,g),a.push(f,f+1,f+2,f,f+2,f+3)}if(n.length===0)return null;let l=new Mr;l.setAttribute(`position`,new J(n,3)),l.setAttribute(`uv`,new J(r,2)),l.setAttribute(`color`,new J(i,4)),l.setIndex(a),l.computeBoundingBox();let u=new ni(l,this.material);return u.frustumCulled=!1,u}buildAll(){for(let e of this.chunks.values())this.group.remove(e),e.geometry.dispose();this.chunks.clear();let e=Math.ceil(this.map.width/this.chunkTiles),t=Math.ceil(this.map.height/this.chunkTiles);for(let n=0;n<t;n++)for(let t=0;t<e;t++){let e=this.buildChunk(t,n);e&&(this.chunks.set(`${t},${n}`,e),this.group.add(e))}}rebuildAtTile(e,t){let n=Math.floor(e/this.chunkTiles),r=Math.floor(t/this.chunkTiles),i=`${n},${r}`,a=this.chunks.get(i);a&&(this.group.remove(a),a.geometry.dispose());let o=this.buildChunk(n,r);o?(this.chunks.set(i,o),this.group.add(o)):this.chunks.delete(i),this.buildFringe()}cull(e,t,n,r){for(let[i,a]of this.chunks){if(!a)continue;let[o,s]=i.split(`,`).map(Number),c=o*this.chunkTiles*this.tileSize,l=s*this.chunkTiles*this.tileSize,u=c+this.chunkTiles*this.tileSize,d=l+this.chunkTiles*this.tileSize;a.visible=u>e&&c<t&&d>n&&l<r}}dispose(){this.group.removeFromParent();for(let e of this.chunks.values())e?.geometry.dispose();this.chunks.clear(),this.fringeMesh&&=(this.fringeMesh.removeFromParent(),this.fringeMesh.geometry.dispose(),null),this.material.dispose()}},Pd=class{constructor({scene:e,world:t}){this.scene=e,this.world=t,this.tiled=t.tiled,this.group=new jn,this.scene.add(this.group),this.layers=[],this.textures=new Map,this.build()}textureFor(e){if(this.textures.has(e))return this.textures.get(e);let t=this.tiled.images?.get(e);if(!t)return null;let n=new Xt(t);return n.magFilter=E,n.minFilter=E,n.generateMipmaps=!1,n.colorSpace=at,n.needsUpdate=!0,this.textures.set(e,n),n}build(){let t=this.world.cameraZoom??1,n=e.internalWidth/t,r=0;for(let t of this.tiled.imageLayers??[]){if(!t.width||!t.height)continue;let i=this.textureFor(t.imageUrl);if(!i)continue;let a=t.repeat?Math.max(2,Math.ceil((n+t.width*2)/t.width)):1,o=new Wr({map:i,transparent:!0,opacity:t.opacity,depthTest:!1,depthWrite:!1,side:2}),s=[];for(let n=0;n<a;n++){let n=new ni(new Di(t.width,t.height),o);n.frustumCulled=!1,n.renderOrder=t.role===`fog`?e.rendering.layers.particles+.5:e.rendering.layers.background+.1+r*.05,this.group.add(n),s.push(n)}this.layers.push({layer:t,meshes:s,count:a,material:o}),r++}this.update(0,0,0)}update(t,n,r=0){let i=this.tiled,a=this.world.cameraZoom??1,o=t-e.internalWidth/(2*a),s=i.mapTop??(i.rowOffset+i.mapHeight)*e.tile,c=s-n,l=i.parallaxOriginX??0,u=i.parallaxOriginY??0;for(let e of this.layers){let{layer:n,meshes:i}=e,a=n.offsetX+(t-l)*(1-n.parallaxX)+n.autoScrollX*r,d=s-(n.offsetY+(c-u)*(1-n.parallaxY))-n.height;if(n.repeat){let t=o+((a-o)%n.width+n.width)%n.width-n.width;for(let r=0;r<e.count;r++)i[r].position.set(t+r*n.width+n.width/2,d+n.height/2,0)}else i[0].position.set(a+n.width/2,d+n.height/2,0)}}dispose(){this.group.removeFromParent();for(let e of this.layers){for(let t of e.meshes)t.geometry.dispose();e.material.dispose()}for(let e of this.textures.values())e.dispose();this.layers=[],this.textures.clear()}};function Fd(){let e=document.createElement(`canvas`);e.width=64,e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);n.addColorStop(0,`rgba(255,255,255,0.9)`),n.addColorStop(.35,`rgba(255,255,255,0.28)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64);let r=new Si(e);return r.magFilter=k,r.minFilter=k,r.generateMipmaps=!1,r.colorSpace=at,r.needsUpdate=!0,r}var Id=class{constructor({scene:e,world:t}){this.scene=e,this.world=t,this.group=new jn,this.scene.add(this.group),this.texture=Fd(),this.lights=[],this.build()}build(){for(let t of this.world.tiled?.lights??[]){let n=new Wr({map:this.texture,transparent:!0,opacity:.34*t.intensity,blending:2,depthTest:!1,depthWrite:!1,color:new q(t.color)}),r=Math.max(16,t.radius),i=new ni(new Di(r*2,r*2),n);i.position.set(t.x,t.y,0),i.frustumCulled=!1,i.renderOrder=e.rendering.layers.actors+.3,this.group.add(i),this.lights.push({def:t,mesh:i,material:n,radius:r})}}update(e){for(let t of this.lights){let n=t.def,r=.5+.5*Math.sin(e*17+n.phase)*Math.sin(e*7.3+n.phase*.73),i=1-n.flicker*(1-r);t.material.opacity=.34*n.intensity*i}}dispose(){this.group.removeFromParent();for(let e of this.lights)e.mesh.geometry.dispose(),e.material.dispose();this.texture.dispose(),this.lights=[]}};function Ld(e,t){let n=null;for(let r of e)if(r.firstgid<=t)n=r;else break;return n}function Rd(t,n){if(t.imageCollection){let r=t.tiles?.find(e=>e.id===n);return r?.imageUrl?{imageUrl:r.imageUrl,w:Number(r.imagewidth??t.tilewidth??e.tile),h:Number(r.imageheight??t.tileheight??e.tile),sx:0,sy:0}:null}if(!t.imageUrl)return null;let r=Math.max(1,Number(t.columns)||1),i=Number(t.tilewidth??e.tile),a=Number(t.tileheight??e.tile),o=Number(t.margin??0),s=Number(t.spacing??0),c=n%r,l=Math.floor(n/r);return{imageUrl:t.imageUrl,w:i,h:a,sx:o+c*(i+s),sy:o+l*(a+s)}}function zd(e,t){let n=e.tiles?.find(e=>e.id===t);if(!n?.animation?.length)return null;let r=n.animation.reduce((e,t)=>e+Number(t.duration),0);return{frames:n.animation,total:Math.max(1,r)}}function Bd(e,t){let n=e;return t.h&&(n=n.map(([e,t])=>[1-e,t])),t.v&&(n=n.map(([e,t])=>[e,1-t])),t.d&&(n=n.map(([e,t])=>[t,e])),n}var Vd=class{constructor({scene:t,world:n}){this.scene=t,this.world=n,this.tiled=n.tiled,this.group=new jn,this.group.renderOrder=e.rendering.layers.tiles,this.scene.add(this.group),this.meshes=[],this.animatedGroups=[],this.textures=new Map,this.build()}textureFor(e){if(this.textures.has(e))return this.textures.get(e);let t=this.tiled.images?.get(e);if(!t)return null;let n=new Xt(t);return n.magFilter=E,n.minFilter=E,n.generateMipmaps=!1,n.colorSpace=at,n.needsUpdate=!0,this.textures.set(e,n),n}renderOrderFor(t,n=0){return t.front?e.rendering.layers.actors+.42+n*.001:e.rendering.layers.tiles+t.order*.01+n*.001}build(){let t=this.tiled,n=e.tile;for(let e of t.layers){if(!e.visible)continue;let r=new Map,i=new Map;for(let a=0;a<t.mapHeight;a++)for(let o=0;o<t.mapWidth;o++){let s=e.data[a*t.mapWidth+o];if(!s)continue;let c=xu(s),l=Ld(t.tilesets??[],c.id);if(!l)continue;let u=c.id-l.firstgid,d=t.rowOffset+t.mapHeight-1-a,f=o*n,p=d*n,m=zd(l,u);if(m){let e=`${l.name}:${u}`;i.has(e)||i.set(e,{tileset:l,localId:u,animation:m,instances:[],frameIndex:-1}),i.get(e).instances.push({px:f,py:p,decoded:c});continue}let h=Rd(l,u);h&&(r.has(h.imageUrl)||r.set(h.imageUrl,[]),r.get(h.imageUrl).push({source:h,px:f,py:p,decoded:c}))}let a=0;for(let[t,n]of r){let r=this.textureFor(t);if(!r)continue;let i=[],o=[],s=[],c=r.image.width,l=r.image.height;for(let{source:e,px:t,py:r,decoded:a}of n){let n=i.length/3,u=e.sx/c,d=(e.sx+e.w)/c,f=1-(e.sy+e.h)/l,p=1-e.sy/l,m=Bd([[0,0],[1,0],[1,1],[0,1]],a);i.push(t,r,0,t+e.w,r,0,t+e.w,r+e.h,0,t,r+e.h,0);for(let[e,t]of m)o.push(u+(d-u)*e,f+(p-f)*t);s.push(n,n+1,n+2,n,n+2,n+3)}if(!s.length)continue;let u=new Mr;u.setAttribute(`position`,new J(i,3)),u.setAttribute(`uv`,new J(o,2)),u.setIndex(s);let d=new ni(u,new Wr({map:r,transparent:!0,opacity:e.opacity,depthTest:!1,depthWrite:!1,side:2}));d.frustumCulled=!1,d.renderOrder=this.renderOrderFor(e,a),this.group.add(d),this.meshes.push(d),a++}for(let[t,r]of i){let i=this.textureFor(r.tileset.imageUrl);if(!i)continue;let o=i.image.width,s=i.image.height,c=[],l=new Float32Array(r.instances.length*8),u=[];for(let{px:e,py:t}of r.instances){let r=c.length/3;c.push(e,t,0,e+n,t,0,e+n,t+n,0,e,t+n,0),u.push(r,r+1,r+2,r,r+2,r+3)}let d=new Mr;d.setAttribute(`position`,new J(c,3)),d.setAttribute(`uv`,new vr(l,2)),d.setIndex(u);let f=new ni(d,new Wr({map:i,transparent:!0,opacity:e.opacity,depthTest:!1,depthWrite:!1,side:2}));f.frustumCulled=!1,f.renderOrder=this.renderOrderFor(e,a),this.group.add(f),this.meshes.push(f),this.animatedGroups.push({...r,key:t,mesh:f,uvs:l,imgWidth:o,imgHeight:s,frameIndex:-1}),a++}}this.update(0)}update(e){if(!this.animatedGroups.length)return;let t=e*1e3;for(let e of this.animatedGroups){let n=0,r=(t%e.animation.total+e.animation.total)%e.animation.total;for(let t=0;t<e.animation.frames.length;t++){let i=Number(e.animation.frames[t].duration);if(r<i){n=t;break}r-=i,n=t}if(n===e.frameIndex)continue;e.frameIndex=n;let i=e.animation.frames[n],a=Rd(e.tileset,i.tileid);if(!a)continue;let o=a.sx/e.imgWidth,s=(a.sx+a.w)/e.imgWidth,c=1-(a.sy+a.h)/e.imgHeight,l=1-a.sy/e.imgHeight,u=0;for(let t of e.instances){let n=Bd([[0,0],[1,0],[1,1],[0,1]],t.decoded);for(let[t,r]of n)e.uvs[u++]=o+(s-o)*t,e.uvs[u++]=c+(l-c)*r}e.mesh.geometry.attributes.uv.needsUpdate=!0}}cull(){}dispose(){this.group.removeFromParent();for(let e of this.meshes)e.geometry.dispose(),e.material.dispose();for(let e of this.textures.values())e.dispose();this.meshes=[],this.animatedGroups=[],this.textures.clear()}},Hd=`
  attribute vec2 aLocal;
  varying vec2 vUv;
  varying vec2 vWorld;
  varying vec2 vLocal;
  void main() {
    vUv = uv;
    vWorld = position.xy;
    vLocal = aLocal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ud=`
  uniform float uTime;
  uniform vec3 uTint;
  uniform vec3 uGlow;
  uniform sampler2D uMap;
  uniform float uProcedural;
  varying vec2 vUv;
  varying vec2 vWorld;
  varying vec2 vLocal;
  void main() {
    float wave = sin(uTime * 1.8 + vWorld.x * 0.14 + vWorld.y * 0.21) * 0.5 + 0.5;
    float ripple = sin(uTime * 3.2 + vWorld.x * 0.32 - vWorld.y * 0.11) * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.12, vLocal.y) * smoothstep(0.0, 0.05, vLocal.x) * smoothstep(0.0, 0.05, 1.0 - vLocal.x);
    vec3 base;
    float alpha;
    if (uProcedural > 0.5) {
      base = uTint * (0.72 + wave * 0.28);
      alpha = 0.78;
      if (fract((vWorld.y + uTime * 8.0) / 16.0) < 0.16) base += uGlow * 0.35;
    } else {
      vec4 tex = texture2D(uMap, vUv);
      if (tex.a < 0.05) discard;
      base = tex.rgb * uTint * (0.8 + wave * 0.3);
      alpha = tex.a * 0.82;
      if (fract((vWorld.y + uTime * 9.0) / 20.0) < 0.12) base += uGlow * 0.22;
      base += uGlow * ripple * 0.08;
    }
    if (vLocal.y > 0.86) {
      base += uGlow * (0.35 + sin(uTime * 3.0 + vWorld.x * 0.2) * 0.12);
      alpha = min(1.0, alpha + 0.12);
    }
    gl_FragColor = vec4(base, alpha * edge);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`,Wd=class{constructor({scene:e,assets:t,zoneId:n,hazards:r}){this.scene=e,this.zoneId=n,this.hazards=r.filter(e=>e.kind===`water`),this.mesh=null,this.material=null,this.frame=t.getTileFrame(`swamp`,`water`),this.procedural=n!==`swamp`,this.hazards.length&&this.build(t)}build(t){let n=[],r=[],i=[],a=[],o=e.tile,s=this.frame;for(let e of this.hazards)for(let t=e.y;t<e.y+e.h;t+=o)for(let c=e.x;c<e.x+e.w;c+=o){let l=n.length/3,u=(c-e.x)/Math.max(1,e.w),d=(t-e.y)/Math.max(1,e.h),f=(c+o-e.x)/Math.max(1,e.w),p=(t+o-e.y)/Math.max(1,e.h);if(n.push(c,t,0,c+o,t,0,c+o,t+o,0,c,t+o,0),i.push(u,d,f,d,f,p,u,p),s&&!this.procedural){let e=Math.round(c)%64/64,n=Math.round(t)%32/32,i=s.u0+(s.u1-s.u0)*e,a=s.v1-(s.v1-s.v0)*(n+.5),o=s.u1,l=Math.min(s.v1,a+(s.v1-s.v0)*.5);r.push(i,a,o,a,o,l,i,l)}else r.push(0,0,1,0,1,1,0,1);a.push(l,l+1,l+2,l,l+2,l+3)}if(!n.length)return;let c=new Mr;c.setAttribute(`position`,new J(n,3)),c.setAttribute(`uv`,new J(r,2)),c.setAttribute(`aLocal`,new J(i,2)),c.setIndex(a);let l=this.zoneId===`forest`?[.22,.42,.33]:[.35,.48,.3],u=this.zoneId===`forest`?[.55,.9,.62]:[.55,.75,.4];this.material=new Ii({uniforms:{uTime:{value:0},uMap:{value:t.getAtlas(`gothic`).texture},uTint:{value:new W(l[0],l[1],l[2])},uGlow:{value:new W(u[0],u[1],u[2])},uProcedural:{value:+!!this.procedural}},vertexShader:Hd,fragmentShader:Ud,transparent:!0,depthTest:!0,depthWrite:!1,side:2}),this.mesh=new ni(c,this.material),this.mesh.renderOrder=.8,this.mesh.frustumCulled=!1,this.scene.add(this.mesh)}update(e){this.material&&(this.material.uniforms.uTime.value=e)}dispose(){this.mesh&&(this.mesh.removeFromParent(),this.mesh.geometry.dispose(),this.material.dispose())}},Gd=class{constructor(e){this.game=e}buildMenuScene(){let t=this.game;this.dispose(),t.seed=Number(t.save.settings.seed??t.seed),t.menuSeed=t.seed;let r=`cemetery`;t.menuZoneId=r,t.menuWorld=pd(t.seed,r,{packagedMaps:t.packagedMaps}),t.activeZoneId=r,t.activeZone=n[r],t.activeWorld=t.menuWorld,this.applyCameraProfile(t.menuWorld,!1),this.buildScenery(r,t.menuWorld),t.ui?.setZoneTheme(t.activeZone),t.menuCameraBase={x:t.menuWorld.spawn.x+280,y:214,drift:90,driftY:8},t.camera.setBounds(0,t.menuWorld.width*e.tile,0,t.menuWorld.playableTop??t.menuWorld.height*e.tile),t.camera.snapTo(t.menuCameraBase.x,t.menuCameraBase.y),t.time=0}setZone(t,r=null){let i=this.game,a=i.worlds?.[t],o=n[t];if(!a||!o)return;i.tileChunks&&this.dispose(),i.activeZoneId=t,i.activeZone=o,i.activeWorld=a,this.applyCameraProfile(a,!1),this.buildScenery(t,a),i.camera.setBounds(0,a.width*e.tile,0,a.playableTop??a.height*e.tile);let s=r??a.spawn;i.player.setWorld(a),i.player.setPosition(s.x,s.y),i.run.checkpoint={x:s.x,y:s.y},i.spawnAuthoredEnemies?.(a),this.snapCameraToPlayer(),i.ui?.setZoneTheme(o),i.audio.startAmbient(t),i.sceneVersion=(i.sceneVersion??0)+1}applyCameraProfile(e,t=!1){let n=this.game,r=t?1:Number(e.cameraZoom??1),i=t?`follow`:e.cameraAnchor??`follow`;n.camera.setZoom(r),n.camera.setVerticalAnchor(i),n.renderer.setZoom(r)}snapCameraToPlayer(){let t=this.game;if(!t.player)return;let n=t.camera.zoom||1,r=e.internalWidth/(2*n),i=e.internalHeight/(2*n),a=t.activeWorld.playableTop??t.activeWorld.height*e.tile,o=g(t.player.x+t.player.facing*e.camera.lookAhead,r,Math.max(r,t.activeWorld.width*e.tile-r)),s=g(t.camera.verticalAnchor===`bottom`?i:t.player.y+e.camera.offsetY,i,Math.max(i,a-i));t.camera.snapTo(o,s)}buildScenery(t,n){let r=this.game;r.background=n.tiled?.imageLayers?.length?new Pd({scene:r.renderer.scene,world:n}):new Ad({scene:r.renderer.scene,assets:r.assets,zoneId:t}),n.tiled?(r.tileChunks=new Vd({scene:r.renderer.scene,world:n}),r.tiledLights=new Id({scene:r.renderer.scene,world:n}),r.water=null):(r.tileChunks=new Nd({scene:r.renderer.scene,map:n.map,atlas:r.assets.getAtlas(n.atlas),assets:r.assets,zoneId:t,chunkTiles:e.world.chunkTiles,tileSize:e.tile,fringeHeight:n.fringeHeight??0,surfaceInset:n.paintedOffset??0}),r.water=new Wd({scene:r.renderer.scene,assets:r.assets,zoneId:t,hazards:n.hazards})),r.sceneryZoneId=t,r.sceneryWorld=n}dispose(){let e=this.game;e.background&&=(e.background.dispose(),null),e.tileChunks&&=(e.tileChunks.dispose(),null),e.tiledLights&&=(e.tiledLights.dispose(),null),e.water&&=(e.water.dispose(),null)}},Kd={hitbox:`#63e6ff`,physics:`#8df59a`,painted:`#ff5fd2`,sprite:`#ffe27a`,enemy:`#ffb05c`,panel:`rgba(5, 7, 10, 0.82)`,text:`#d9e7df`},qd=class{constructor(t){this.game=t,this.canvas=document.createElement(`canvas`),this.canvas.id=`collision-debug`,this.canvas.width=e.internalWidth,this.canvas.height=e.internalHeight,this.canvas.setAttribute(`aria-hidden`,`true`),document.getElementById(`stage`)?.appendChild(this.canvas),this.ctx=this.canvas.getContext(`2d`),this.ctx.imageSmoothingEnabled=!1,this.visible=!1,this.setVisible(!1)}setVisible(e){this.visible=!!e,this.canvas.style.display=this.visible?`block`:`none`,this.visible||this.clear()}clear(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}render(t){if(this.clear(),!this.visible)return;let n=this.game,r=n.player,i=n.activeWorld,a=i?.map;if(!r||!i||!a||[`menu`,`characters`,`result`].includes(n.state))return;let o=this.ctx,s=n.camera.getRenderPosition(t),c=n.camera.zoom||1,l=e.internalWidth/2,u=e.internalHeight/2,d=e=>Math.round((e-s.x)*c+l),f=e=>Math.round((s.y-e)*c+u),p=e=>n.ui?.t?.(e)??e;o.save(),o.lineWidth=1,o.font=`6px "Pixelify Sans", monospace`,o.textBaseline=`top`,o.textAlign=`left`;let m=r.getBounds(),h=m.y,g=this.findTileFloor(a,r.x,r.y+2),_=r.getRenderPosition(t),v=r.animator?.frame,y=r.characterId===`seraphine`?Math.round(Math.sin(r.animTime*3)*1):0,b=_.y+y,x=+(r.dashTimer>0),S=Bl(v,_.x+x*r.facing,b,{anchorY:v?.anchorY??1,flip:r.facing<0});if(g!==null&&(this.drawLine(o,d(r.x-56),f(g),d(r.x+56),f(g),Kd.painted),this.label(o,`${p(`debug.tileFloor`)} ${g.toFixed(0)}`,d(r.x)+20,f(g)-8,Kd.painted)),this.drawLine(o,d(r.x-42),f(h),d(r.x+42),f(h),Kd.physics),this.label(o,`${p(`debug.collisionFloor`)} ${h.toFixed(0)}`,d(r.x)+20,f(h)+3,Kd.physics),S){let e=d(S.left),t=f(S.top);o.strokeStyle=Kd.sprite,o.globalAlpha=.8,o.setLineDash([2,2]),o.strokeRect(e,t,Math.round(S.width*c),Math.round(S.height*c)),o.setLineDash([]),this.cross(o,d(_.x+x*r.facing),f(b),Kd.sprite),this.label(o,`${p(`debug.spriteAnchor`)} ${b.toFixed(0)}`,d(r.x)+20,f(b)-15,Kd.sprite),o.globalAlpha=1}o.strokeStyle=Kd.hitbox,o.strokeRect(d(m.x),f(m.y+m.h),Math.round(m.w*c),Math.round(m.h*c)),this.cross(o,d(r.x),f(h),Kd.physics),o.globalAlpha=.65;for(let e of n.enemies??[]){if(e.dead||Math.abs(e.x-r.x)>220)continue;let n=e.getBounds();o.strokeStyle=Kd.enemy,o.strokeRect(d(n.x),f(n.y+n.h),Math.round(n.w*c),Math.round(n.h*c)),this.cross(o,d(e.x),f(n.y),Kd.enemy);let i=e.animator?.frame,a=e.getRenderPosition(t),s=Bl(i,a.x,a.y,{anchorY:i?.anchorY??1,flip:e.facing<0});s&&(o.strokeStyle=`rgba(255, 176, 92, 0.55)`,o.setLineDash([1,2]),o.strokeRect(d(s.left),f(s.top),Math.round(s.width*c),Math.round(s.height*c)),o.setLineDash([]))}o.globalAlpha=1,this.drawLegend(o,p,{hit:h,tile:g,sprite:b,footSink:i.footSink??0}),o.restore()}findTileFloor(e,t,n){let r=Math.max(0,Math.min(e.width-1,Math.floor(t/e.tileSize))),i=Math.max(0,Math.min(e.height-1,Math.floor(n/e.tileSize)));for(let t=i;t>=0;t--){let n=e.getType(r,t);if(n===Q.SOLID||n===Q.ONE_WAY||n===Q.BREAKABLE){let r=t===e.surfaceRow||n===Q.ONE_WAY;return(t+1)*e.tileSize-(r?e.surfaceOffset:0)}}return null}drawLine(e,t,n,r,i,a){e.strokeStyle=a,e.beginPath(),e.moveTo(t+.5,n+.5),e.lineTo(r+.5,i+.5),e.stroke()}cross(e,t,n,r){e.strokeStyle=r,e.beginPath(),e.moveTo(t-3,n+.5),e.lineTo(t+3,n+.5),e.moveTo(t+.5,n-3),e.lineTo(t+.5,n+3),e.stroke()}label(e,t,n,r,i){let a=Math.ceil(e.measureText(t).width)+4;e.fillStyle=Kd.panel,e.fillRect(n-2,r-1,a,8),e.fillStyle=i,e.fillText(t,n,r)}drawLegend(e,t,n){e.fillStyle=Kd.panel,e.fillRect(8,58,150,34),e.strokeStyle=`rgba(160, 200, 180, 0.28)`,e.strokeRect(8.5,58.5,149,33),e.font=`6px "Pixelify Sans", monospace`,e.fillStyle=Kd.text,e.fillText(t(`debug.collisionLegend`),12,61),[[Kd.physics,`${t(`debug.hitbox`)} ${n.hit.toFixed(0)}`],[Kd.painted,`${t(`debug.tileFloor`)} ${n.tile===null?t(`debug.noFloor`):n.tile.toFixed(0)}`],[Kd.sprite,`${t(`debug.spriteAnchor`)} ${n.sprite.toFixed(0)}`],[Kd.text,`${t(`debug.footSink`)} ${n.footSink}px`]].forEach(([t,n],r)=>{e.fillStyle=t,e.fillRect(12,69+r*5,3,3),e.fillStyle=Kd.text,e.fillText(n,18,68+r*5)})}dispose(){this.canvas.remove()}},Jd=class{constructor({canvas:t,save:r,audio:i,assets:a,packagedMaps:o={},devOptions:s={}}){this.canvas=t,this.save=r,this.audio=i,this.assets=a,this.packagedMaps=o,this.devOptions=s,this.devFly=!!(s.fly||s.gallery),this.devGallery=!!s.gallery,this.peaceful=!!(s.peaceful||s.gallery),this.renderer=new sl(t),this.camera=new cl,this.camera.setShakeSetting(r.settings.shake??.7),this.input=new gl(window),this.input.onFirstGesture=()=>{this.audio.ensure(),this.state===`playing`&&this.audio.startAmbient(this.activeZoneId)},this.ui=null,this.state=`boot`,this.seed=Number(r.settings.seed??e.seed.default),this.activeZoneId=`cemetery`,this.activeZone=n.cemetery,this.activeWorld=null,this.run=null,this.player=null,this.enemies=[],this.projectiles=new yl({particles:null,glowParticles:null}),this.spatialHash=null,this.hitstopFrames=0,this.combat=null,this.traps=[],this.progression=null,this.spawnDirector=new Cl(this),this.zoneStates={},this.currentInteraction=null,this.prompt=null,this.transition=null,this.lastRoom=-1,this.boss=null,this.bossHazards=[],this.bossDamageTaken=0,this.arenaGatePositions=[],this.menuAmbientTimer=0,this.time=0,this.menuTime=0,this.lastFrameDelta=1/60,this.debugVisible=!1,this.sceneVersion=0,this.createEffects(),this.worldRenderer=new au(this),this.collisionDebug=new qd(this),this.interactions=new ou(this),this.combatDirector=new su(this),this.bossController=new uu(this),this.runController=new Dd(this),this.worldLife=new kd(this),this.pickups=new Od(this),this.sceneManager=new Gd(this),this.loop=new _l({step:e.fixedStep,maxDelta:e.maxFrameDelta,maxSubSteps:e.maxSubSteps,update:e=>this.update(e),render:(e,t)=>this.render(e,t)})}createEffects(){this.particles=new fl({scene:this.renderer.scene,maxParticles:e.rendering.maxParticles,additive:!1}),this.glowParticles=new fl({scene:this.renderer.scene,maxParticles:500,additive:!0}),this.projectiles=new yl({maxProjectiles:256,particles:this.particles,glowParticles:this.glowParticles}),this.xpOrbs=new Dl({scene:this.renderer.scene,particles:this.particles,glowParticles:this.glowParticles,maxOrbs:220}),this.effects=new pl({assets:this.assets,size:24})}attachUI(e){this.ui=e,this.combat=new Sl({game:this,particles:this.particles,glowParticles:this.glowParticles,audio:this.audio,ui:e}),this.gameAchievements=new Pl({game:this,save:this.save,ui:e,audio:this.audio})}initialize(){this.buildMenuScene(),this.state=`menu`}start(){this.loop.start()}enterMenuMode(){this.state!==`playing`&&this.state!==`paused`||[`result`].includes(this.state)||this.returnToMenu(),this.state=`menu`;let e=Number(this.save.settings.seed??this.seed);this.menuWorld&&this.menuSeed===e||(this.seed=e,this.menuSeed=e,this.buildMenuScene()),this.ui?.showHUD(!1),this.ui?.clearDamageNumbers(),this.ui?.setFade(!1)}buildMenuScene(){this.sceneManager.buildMenuScene()}startRun(e,t){this.runController.startRun(e,t)}spawnEnemy(t,n,r,i={}){let a=rl[t];if(!a)return null;let o=this.activeWorld,s=g(n,8,o.width*e.tile-8),c=this.assets.getPresentation().zoneTints[this.activeZoneId]??[1,1,1],l=new ol(a,this.assets,s,r,{health:i.health??1,damage:i.damage??1,speed:i.speed??1,zoneTint:c});return l.spawnCost=this.getEnemyCost(t)*(i.elite?1.4:1),this.enemies.push(l),a.spawnSound&&this.audio.play(a.spawnSound,{throttle:180,volume:.85}),this.glowParticles.burst([Z.soul,Z.shadow],s,r+l.height/2,10,{speed:45,life:.4,gravity:20,drag:2,size:2}),l}initSpatialHash(){this.activeWorld&&(this.spatialHash=new vl(this.activeWorld.width*e.tile,this.activeWorld.height*e.tile,e.spatial.cellSize,512))}addHitstop(e){this.hitstopFrames=Math.max(this.hitstopFrames,e)}getMetaModifiers(){return this.runController.getMetaModifiers()}setZone(e,t=null){this.sceneManager.setZone(e,t)}spawnAuthoredEnemies(e=this.activeWorld){let t=e?.tiled?.enemies;if(t?.length&&!this.peaceful)for(let e of t)this.spawnEnemy(e.enemyId,e.x,e.y,{health:e.health,damage:e.damage,speed:1})}snapCameraToPlayer(){this.sceneManager.snapCameraToPlayer()}disposeScene(){this.sceneManager.dispose()}update(e){if(this.time+=e,this.input.wasPressed(`debug`)&&(this.debugVisible=!this.debugVisible),this.devGallery&&this.state===`playing`&&(this.input.wasPressed(`nextZone`)&&this.changeDevZone(1),this.input.wasPressed(`prevZone`)&&this.changeDevZone(-1)),this.state===`playing`){if(this.input.wasPressed(`pause`)){this.state=`paused`,this.input.clearPressed(),this.ui?.showPause(),this.audio.play(`ui`);return}this.updatePlaying(e)}else this.state===`menu`?this.updateMenuAmbience(e):this.state===`transition`&&this.interactions.updateTransition(e);this.input.clearPressed()}updateGallery(t){let n=this.player,r=this.activeWorld;n&&r&&(n.x+=e.dev.gallerySpeed*t,n.y=r.surface+e.dev.galleryHeight,n.prevX=n.x,n.prevY=n.y,n.vx=0,n.vy=0,n.onGround=!1,n.x>r.width*e.tile-48&&(n.x=48,n.prevX=48))}changeDevZone(t){if(!this.devGallery)return;let n=r[(r.indexOf(this.activeZoneId)+t+r.length)%r.length];this.setZone(n,this.worlds[n].spawn),this.player.devFly=!0,this.player.immortal=!0,this.player.x=this.activeWorld.spawn.x,this.player.y=this.activeWorld.surface+e.dev.galleryHeight,this.player.prevX=this.player.x,this.player.prevY=this.player.y,this.snapCameraToPlayer(),this.ui?.toast(`zone.entered`,{zone:this.ui.t(this.activeZone.nameKey)},{duration:1200})}updateMenuAmbience(t){if(this.menuAmbientTimer-=t,this.menuAmbientTimer<=0){this.menuAmbientTimer=.16;let t=this.camera.zoom||1,n=e.internalWidth/t,r=e.internalHeight/t,i=this.camera.x+(Math.random()-.5)*n,a=this.camera.y-r*.5+Math.random()*r;this.glowParticles.emit({x:i,y:a,vx:(Math.random()-.5)*8,vy:8+Math.random()*10,gravity:-2,drag:.1,life:2.5+Math.random()*2,sizeX:Math.random()<.2?2:1,sizeY:Math.random()<.2?2:1,color:Math.random()<.5?Z.ember:Z.gold,alpha:.35})}this.particles.update(t),this.glowParticles.update(t)}updatePlaying(t){let n=this.player;if(!n)return;if(this.hitstopFrames>0){--this.hitstopFrames;return}this.run.elapsed+=t,this.worldLife.updateMovingPlatforms(),n.update(t,this.activeWorld,this.input),this.devGallery&&this.updateGallery(t),this.bossController.checkTrigger();let r=n.consumeEvents();for(let e of this.enemies)e.update(t,this.activeWorld,n,this);for(let t of this.enemies){if(t.dead)continue;let n=!t.flying&&t.y<this.activeWorld.surface-e.enemyAI.pitFallDepth;(t.y<e.enemyAI.despawnY||n)&&this.despawnEnemy(t,`fall`)}this.combatDirector.applySpikeDamage(),this.separateEnemies(),this.combatDirector.handlePlayerEvents(n.consumeEvents()),this.buildSpatialHash(),this.combatDirector.handlePlayerEvents(r),this.projectiles.update(t,this),this.combatDirector.updateTraps(t),this.bossController.updateHazards(t);for(let e of this.enemies)e.dead||this.combatDirector.handleEnemyEvents(e.consumeEvents());this.spawnDirector.update(t),this.pickups.update(t),this.worldLife.updateTriggers(),this.worldLife.emitAmbient(t),this.xpOrbs.update(t,n,this.activeWorld.map,(e,t)=>{this.progression.addXp(e),this.audio.play(`xp`,{pitch:t?.value>=20?.8:1,throttle:40})});let i=Math.floor(this.run.elapsed);i!==this.lastAchievementSecond&&(this.lastAchievementSecond=i,this.gameAchievements?.onTime(i)),this.particles.update(t),this.glowParticles.update(t),this.effects.update(t),this.cleanupEnemies(),n.dead?this.endRun(`death`):this.state===`playing`&&(this.interactions.updateCheckpoint(),this.interactions.updatePrompt(),this.currentInteraction&&this.input.wasPressed(`interact`)?this.interactions.interactWith(this.currentInteraction):this.camera.follow(n.x,n.y,n.facing,t))}onPlayerLeveledUp(){if(this.state!==`playing`)return;this.state=`levelup`,this.gameAchievements?.onLevel(this.progression.level),this.audio.play(`levelUp`);let e=this.progression.buildOffers();this.ui?.showLevelUp(e,{level:this.progression.level,playerUpgrades:this.progression.upgradeLevels})}chooseUpgrade(e){if(this.state===`levelup`&&this.progression){if(this.progression.chooseOffer(e),this.progression.hasPendingLevelUps()){let e=this.progression.buildOffers();this.ui?.showLevelUp(e,{level:this.progression.level,playerUpgrades:this.progression.upgradeLevels})}else this.state=`playing`,this.ui?.clearScreen(),this.input.clear()}}onEvolution(e){this.gameAchievements?.onEvolution?.(e)}getEnemyCost(e){return rl[e]?.cost??1}getEnemyDef(e){return rl[e]}buildSpatialHash(){if(this.spatialHash||this.initSpatialHash(),this.spatialHash){this.spatialHash.clear();for(let e=0;e<this.enemies.length;e++){let t=this.enemies[e];t.dead||this.spatialHash.insert(e,t)}}}cleanupEnemies(){this.enemies.some(e=>e.dead)&&(this.enemies=this.enemies.filter(e=>!e.dead||e.deathTimer>0),this.buildSpatialHash())}despawnEnemy(e,t=`despawn`){!e||e.dead||e.isBoss||(e.dead=!0,e.despawned=!0,e.despawnReason=t,e.deathTimer=0,e.countedDeath=!0,this.spawnDirector?.refund(e.spawnCost??0))}separateEnemies(){let t=this.activeWorld;if(!t||this.enemies.length<2)return;let n=t.width*e.tile-12;for(let e=0;e<this.enemies.length;e++){let t=this.enemies[e];if(!(t.dead||t.isBoss))for(let r=e+1;r<this.enemies.length;r++){let i=this.enemies[r];if(i.dead||i.isBoss)continue;let a=i.x-t.x,o=i.y-t.y,s=(t.width+i.width)*.5+2,c=Math.min(t.height,i.height)*.58;if(Math.abs(a)>=s||Math.abs(o)>=c)continue;let l=s-Math.abs(a),u=Math.sign(a)||(e%2==0?1:-1),d=Math.min(l*.5,3),f=t.x,p=i.x,m=g(t.x-u*d,12,n),h=g(i.x+u*d,12,n);if(this.canSeparateTo(t,m)&&(t.x=m),this.canSeparateTo(i,h)&&(i.x=h),t.x===f&&i.x===p){let e=Math.abs(t.vx)>Math.abs(i.vx)?t:i,r=g((e===t?f:p)+(e===t?u:-u),12,n);this.canSeparateTo(e,r)&&(e.x=r)}if(t.flying&&i.flying&&Math.abs(o)<c*.5){let e=Math.sign(o)||1;t.y-=e*Math.min(.5,l*.1),i.y+=e*Math.min(.5,l*.1)}}}}canSeparateTo(e,t){if(e.flying)return!0;let n=e.width/2,r=this.activeWorld?.map;if(!r)return!1;let i=r.getGroundYAtWorld(t,e.y+4);return i===null||Math.abs(i-e.y)>4?!1:!r.rectHitsSolid(t-n+1,e.y+2,e.width-2,Math.max(1,e.height-4))}onEnemyDefeated(e){this.combatDirector.onEnemyDefeated(e)}onBossDefeated(e){this.bossController.onDefeated(e)}findNearestEnemy(e,t,n,r=null){return this.combatDirector.findNearestEnemy(e,t,n,r)}respawnFromFall(){let e=this.run.checkpoint;this.player.setPosition(e.x,e.y),this.player.health=Math.max(1,this.player.health-this.player.maxHealth*.1),this.player.iframes=1.2,this.player.spawnGrace=1.2,this.snapCameraToPlayer(),this.ui?.toast(`toast.checkpoint`),this.audio.play(`playerHurt`)}setPaused(e){!e&&this.state===`paused`?(this.state=`playing`,this.input.clear()):e&&this.state===`playing`&&(this.state=`paused`)}updateSettings(e,t=!0){t&&(this.audio.setSettings(e),this.camera.setShakeSetting(Number(e.shake??.7))),Number(e.seed??this.seed)!==this.seed&&(this.seed=Number(e.seed))}unlockCharacter(e,t){return this.save.unlockCharacter(e,t)}buyPermanentBonus(e,t){let n=this.save.meta,r=n.permanent[e]??0;return r>=3||!this.save.spendShards(t)?!1:(n.permanent[e]=r+1,this.save.saveMeta(),this.progression&&this.progression.recalculatePlayer(),!0)}getHudInfo(){if(!this.player||!this.run)return null;let e=tl(this.run.elapsed),t=Ll[this.player.characterId];return{player:this.player,run:{...this.run,specialCooldown:this.player.specialCooldown,specialMax:this.player.character.special.cooldown,specialNameKey:this.player.character.special.nameKey,dashCooldown:this.player.dashCooldown,dashMax:this.player.stats.dashCooldown,weaponNameKey:this.run.evolved&&t?t.nameKey:this.player.character.weapon.nameKey},elapsed:this.run.elapsed,difficulty:e,seed:this.seed,zone:this.activeZone,boss:this.boss?{active:!this.boss.dead,nameKey:this.boss.def.nameKey,phase:this.boss.phaseIndex+1,health:this.boss.health,maxHealth:this.boss.maxHealth}:null,prompt:this.prompt,shards:this.run.shards.length,hasKey:!!this.run.flags?.dungeon_key,activeEnemies:this.enemies.length}}render(t,n){this.lastFrameDelta=n,this.camera.updateShake(n,this.time);let r=this.state===`menu`||this.state===`characters`;if(r){this.menuTime+=n;let t=this.menuWorld.width*e.tile,r=this.menuWorld.playableTop??this.menuWorld.height*e.tile,i=this.camera.zoom||1,a=e.internalWidth/(2*i),o=e.internalHeight/(2*i),s=this.menuCameraBase??{x:this.menuWorld.spawn.x+280,y:214},c=Math.sin(this.menuTime*.035)*(s.drift??90),l=Math.sin(this.menuTime*.05)*(s.driftY??8),u=g(s.x+c,a,Math.max(a,t-a)),d=g(s.y+l,o,Math.max(o,r-o));this.camera.x=u,this.camera.y=d,this.camera.shakeX=0,this.camera.shakeY=0}this.worldRenderer.prepare(t,n,!r&&this.state!==`result`),this.renderer.render(this.camera,t,this.time);let i=this.getHudInfo();i&&this.state!==`menu`&&this.state!==`characters`&&this.state!==`result`&&this.ui?.updateHUD(i),this.ui?.updateDamageNumbers(n,this.camera),this.updateDebugOverlay(t)}updateDebugOverlay(e=0){if(this.collisionDebug?.setVisible(this.debugVisible),this.collisionDebug?.render(e),!this.debugVisible||!this.ui){this.ui?.updateDebug(null);return}let t=this.renderer.getInfo(),n=this.player,r=this.spawnDirector?.budget??0;this.ui.updateDebug({fps:this.loop.fpsAverage,frameMs:this.loop.frameMs,drawCalls:t.calls,entities:+!!n+(this.enemies?.length??0)+this.projectiles.getActiveCount(),particles:(this.particles?.count??0)+(this.glowParticles?.count??0),spawnBudget:r,zone:this.activeZoneId,seed:this.seed,x:n?.x??0,y:n?.y??0,state:this.state,activeEnemies:this.enemies?.length??0,boss:this.boss?.id??null})}endRun(e){this.runController.endRun(e)}abandonRun(){this.runController.abandonRun()}restartRun(){this.runController.restartRun()}returnToMenu(){this.runController.returnToMenu()}destroy(){this.loop.destroy(),this.input.destroy(),this.disposeScene(),this.particles.dispose(),this.glowParticles.dispose(),this.xpOrbs.dispose(),this.worldRenderer.dispose(),this.collisionDebug?.dispose(),this.renderer.dispose(),this.audio.destroy()}},Yd=class{constructor(e,t){this.ui=t,this.root=document.createElement(`div`),this.root.className=`hud hidden`,this.root.innerHTML=`
      <div class="hud-top-left">
        <div class="health-wrap">
          <div class="health-label-row">
            <span data-label="health"></span>
            <span class="health-value"><span data-hp-current>0</span>/<span data-hp-max>0</span><span class="health-armor" data-armor></span></span>
          </div>
          <div class="health-bar"><div class="damage-ghost" data-ghost></div><div class="health-fill" data-health></div></div>
          <div class="xp-row">
            <div class="level-chip" data-level>1</div>
            <div class="xp-bar"><div class="xp-fill" data-xp></div></div>
          </div>
        </div>
      </div>
      <div class="hud-top-center">
        <div class="hud-chip"><b data-zone>—</b></div>
        <div class="hud-chip"><b data-time>00:00</b></div>
        <div class="hud-chip"><b data-kills>0</b><span data-kills-label></span></div>
      </div>
      <div class="hud-top-right">
        <div class="hud-zone" data-zone-name></div>
        <div class="hud-time" data-difficulty></div>
        <div class="hud-kills" data-seed></div>
      </div>
      <div class="boss-hud" data-boss>
        <div class="boss-meta"><span class="boss-name"></span><span class="boss-phase"></span></div>
        <div class="boss-bar"><div class="boss-fill"></div></div>
      </div>
      <div class="hud-bottom-left">
        <div class="weapon-panel">
          <div class="weapon-icon" data-weapon-icon>✦</div>
          <div class="weapon-info">
            <span class="weapon-name" data-weapon-name></span>
            <span class="weapon-level" data-weapon-level></span>
          </div>
        </div>
        <div class="ability-row">
          <div class="ability-cell" data-special>
            <span class="ability-fill" data-special-fill></span>
            <span class="ability-key">L</span><span class="ability-name" data-special-name></span>
          </div>
          <div class="ability-cell" data-dash>
            <span class="ability-fill" data-dash-fill></span>
            <span class="ability-key">⇧</span><span class="ability-name" data-dash-label></span>
          </div>
        </div>
      </div>
      <div class="hud-bottom-right">
        <div class="key-item hidden" data-key-item>
          <span class="key-glyph">⌘</span><span class="key-label" data-key-label></span>
        </div>
        <div class="shard-pips" data-shard-pips></div>
        <div class="control-hint" data-control-hint></div>
      </div>
      <div class="interact-prompt" data-prompt>
        <span class="keycap">E</span><span data-prompt-text></span>
      </div>
      <div class="elite-tag hidden" data-elite-tag></div>
    `,e.appendChild(this.root),this.refs={};for(let e of this.root.querySelectorAll(`[data-label]`))this.refs[`label_${e.dataset.label}`]=e;for(let e of`ghost.health.hp-current.hp-max.armor.level.xp.zone.time.kills.kills-label.zone-name.difficulty.seed.boss.weapon-icon.weapon-name.weapon-level.special.special-fill.special-name.dash.dash-fill.dash-label.shard-pips.control-hint.prompt.prompt-text.elite-tag.key-item.key-label`.split(`.`)){let t=e.replace(/-([a-z])/g,(e,t)=>t.toUpperCase());this.refs[t]=this.root.querySelector(`[data-${e}]`)}this.refs.bossName=this.root.querySelector(`.boss-name`),this.refs.bossPhase=this.root.querySelector(`.boss-phase`),this.refs.bossFill=this.root.querySelector(`.boss-fill`),this.refs.bossHud=this.root.querySelector(`[data-boss]`),this.cache={},this.localize(),this.buildShardPips()}localize(){let t=this.ui.t.bind(this.ui);this.refs.label_health.textContent=t(`hud.health`),this.refs.zone.textContent=t(`hud.empty`),this.refs.killsLabel.textContent=t(`hud.kills`).replace(`{count}`,``).trim(),this.refs.dashLabel.textContent=t(`hud.dash`),this.refs.specialName.textContent=t(`hud.special`),this.refs.controlHint.textContent=t(`hud.controls`),this.refs.keyLabel.textContent=t(`hud.key`),this.refs.seed.textContent=t(`hud.seed`,{seed:this.ui.game?.run?.seed??e.seed.default})}buildShardPips(){this.refs.shardPips.innerHTML=``;for(let e=0;e<3;e++){let e=document.createElement(`div`);e.className=`shard-pip`,this.refs.shardPips.appendChild(e)}this.shardPips=[...this.refs.shardPips.children]}setVisible(e){this.root.classList.toggle(`hidden`,!e)}setZone(t,n){let r=this.ui.t.bind(this.ui),i=r(t.nameKey);this.refs.zone.textContent=i,this.refs.zoneName.textContent=i,this.refs.difficulty.textContent=n??``,this.refs.seed.textContent=r(`hud.seed`,{seed:this.ui.game?.run?.seed??e.seed.default})}update(e){let{player:t,run:n,elapsed:r,difficulty:i,seed:a,zone:o,boss:s,prompt:c,shards:l,hasKey:u}=e,d=this.ui.t.bind(this.ui),f=Math.max(0,Math.ceil(t.health)),p=Math.round(t.maxHealth);(this.cache.hp!==f||this.cache.maxHp!==p)&&(this.refs.health.style.width=`${f/p*100}%`,this.refs.ghost.style.transform=`scaleX(${Math.max(0,f/p)})`,this.refs.hpCurrent.textContent=String(f),this.refs.hpMax.textContent=String(p),this.refs.armor.textContent=t.armor>0?` ◈${Math.round(t.armor*100)}%`:``,this.cache.hp=f,this.cache.maxHp=p),this.cache.level!==n.level&&(this.refs.level.textContent=String(n.level),this.cache.level=n.level);let m=Math.min(1,n.xp/n.xpToNext);this.refs.xp.style.width=`${m*100}%`;let h=Nl(r);if(this.cache.time!==h&&(this.refs.time.textContent=h,this.cache.time=h),this.cache.kills!==n.kills&&(this.refs.kills.textContent=String(n.kills),this.cache.kills=n.kills),this.refs.zone.textContent=d(o.nameKey),this.refs.seed.textContent=d(`hud.seed`,{seed:a??n.seed}),i){let e=o.phaseKeys?.[i.id]??i.labelKey;this.refs.difficulty.textContent=d(e)}this.refs.weaponName.textContent=d(n.weaponNameKey??Xd(t.characterId)),this.refs.weaponLevel.textContent=n.evolved?d(`evolution.already`):d(`hud.weaponLevel`,{level:n.weaponLevel}),this.refs.weaponLevel.classList.toggle(`weapon-evolved`,n.evolved),this.refs.weaponIcon.textContent=n.evolved?`❖`:`✦`;let g=n.specialCooldown??0,_=n.specialMax??1;this.refs.specialFill.style.width=`${Math.max(0,g/_)*100}%`,this.refs.special.classList.toggle(`active`,g<=0),this.refs.specialName.textContent=n.specialNameKey?d(n.specialNameKey):d(`hud.special`);let v=n.dashCooldown??0,y=n.dashMax??1;this.refs.dashFill.style.width=`${Math.max(0,v/y)*100}%`,this.refs.dash.classList.toggle(`active`,v<=0),this.cache.shards!==l&&(this.shardPips.forEach((e,t)=>e.classList.toggle(`filled`,t<l)),this.refs.zone.textContent=d(o.nameKey),this.cache.shards=l),this.cache.hasKey!==u&&(this.refs.keyItem.classList.toggle(`hidden`,!u),this.cache.hasKey=u),s&&s.active?(this.refs.bossHud.classList.add(`visible`),this.refs.bossName.textContent=d(s.nameKey),this.refs.bossPhase.textContent=d(`boss.phase`,{phase:s.phase}),this.refs.bossFill.style.width=`${Math.max(0,s.health/s.maxHealth*100)}%`):this.refs.bossHud.classList.remove(`visible`),c?.text?(this.refs.prompt.classList.add(`visible`),this.refs.promptText.textContent=c.text):this.refs.prompt.classList.remove(`visible`)}};function Xd(e){switch(e){case`kael`:return`weapon.frostArrows.name`;case`brakk`:return`weapon.berserkerCleave.name`;case`seraphine`:return`weapon.iceOrb.name`;case`nyx`:return`weapon.shadowBlades.name`;default:return`hud.weapon`}}var Zd=36,Qd=class{constructor({root:e,stage:t,save:n,audio:r,language:i,t:a,damageLayer:o,toastLayer:s,fadeLayer:c}){this.root=e,this.stage=t,this.save=n,this.audio=r,this.language=i,this.t=a,this.toastLayer=s,this.damageLayer=o,this.fadeLayer=c,this.toastQueue=[],this.activeToast=null,this.toastTimer=0,this.damageNumbers=[],this.damagePool=[],this.debugOverlay=document.createElement(`div`),this.debugOverlay.className=`debug-overlay hidden`,e.appendChild(this.debugOverlay),this.flashOverlay=document.createElement(`div`),this.flashOverlay.className=`hit-flash`,this.damageLayer.appendChild(this.flashOverlay);for(let e=0;e<Zd;e++){let e=document.createElement(`div`);e.className=`damage-number hidden`,this.damageLayer.appendChild(e),this.damagePool.push(e)}}setLanguage(e,t){this.language=e,this.t=t}clearToasts(){this.toastQueue.length=0,window.clearTimeout(this.toastTimer),this.activeToast&&=(this.activeToast.node.remove(),null),this.toastLayer.innerHTML=``}toast(e,t={},n={}){let r=e.includes(`.`)?this.t(e,t):e;this.queueToast(r,n)}toastText(e,t={}){this.queueToast(String(e??``),t)}queueToast(e,t={}){this.toastQueue.push({text:e,icon:t.icon??`◆`,kind:t.achievement?`achievement`:`normal`,fadeAfter:t.duration??1900}),this.activeToast||this.showNextToast()}showNextToast(){if(this.activeToast)return;let e=this.toastQueue.shift();if(!e)return;let t=document.createElement(`div`);t.className=`game-toast ${e.kind===`achievement`?`achievement`:``}`;let n=document.createElement(`span`);n.className=`toast-icon`,n.textContent=e.icon;let r=document.createElement(`span`);r.textContent=e.text,t.append(n,r),this.toastLayer.appendChild(t),requestAnimationFrame(()=>t.classList.add(`show`)),this.activeToast={node:t,entry:e},this.toastTimer=window.setTimeout(()=>{t.classList.remove(`show`),window.setTimeout(()=>{t.remove(),this.activeToast=null,this.showNextToast()},260)},e.fadeAfter)}spawnDamageNumber(t,n,r,i=`normal`){if(!this.save.settings.damageNumbers)return;let a=this.damagePool.find(e=>e.classList.contains(`hidden`));a&&(a.classList.remove(`hidden`,`crit`,`player`,`heal`),i===`crit`?a.classList.add(`crit`):i===`player`?a.classList.add(`player`):i===`heal`&&a.classList.add(`heal`),a.textContent=String(r),a.style.opacity=`1`,a.style.transform=`translate(-1000px,-1000px)`,a.dataset.age=`0`,a.dataset.life=String(e.combat.damageNumberLife),a.dataset.x=String(t),a.dataset.y=String(n),a.dataset.wobble=String((Math.random()-.5)*7),a.dataset.kind=i,a.style.display=`block`,a.classList.remove(`hidden`),a.classList.add(`active`),a.dataset.used=`1`)}updateDamageNumbers(t,n){if(!this.save.settings.damageNumbers)return;let r=n.getRenderPosition(0),i=n.zoom||1;for(let n of this.damagePool){if(!n.dataset.used)continue;let a=Number(n.dataset.life),o=Number(n.dataset.age)+t;if(n.dataset.age=String(o),o>=a){n.dataset.used=``,n.classList.add(`hidden`),n.style.display=`none`;continue}let s=o/a,c=(Number(n.dataset.x)-r.x)*i+e.internalWidth/2+Number(n.dataset.wobble)*s,l=(r.y-Number(n.dataset.y))*i+e.internalHeight/2-8-s*18;n.style.opacity=String(s<.65?1:1-(s-.65)/.35),n.style.transform=`translate(${Math.round(c)}px, ${Math.round(l)}px) translate(-50%, -100%)`}}clearDamageNumbers(){for(let e of this.damagePool)e.dataset.used=``,e.classList.add(`hidden`),e.style.display=`none`}updateDebug(e){if(!e){this.debugOverlay.classList.add(`hidden`);return}this.debugOverlay.classList.remove(`hidden`);let t=[`<div class="debug-title">${this.t(`debug.title`)} <span style="float:right;color:#6d806e">${this.t(`debug.hint`)}</span></div>`,`FPS <b>${e.fps.toFixed(0)}</b>  ${this.t(`debug.frame`)} <b>${e.frameMs.toFixed(1)}ms</b>`,`Draw <b>${e.drawCalls}</b>  ${this.t(`debug.entities`)} <b>${e.entities}</b>`,`Particles <b>${e.particles}</b>  Budget <b>${e.spawnBudget.toFixed(1)}</b>`,`${this.t(`debug.zone`)} <b>${e.zone}</b>  Seed <b>${e.seed}</b>`,`${this.t(`debug.pos`)} <b>${e.x.toFixed(0)}, ${e.y.toFixed(0)}</b>  ${this.t(`debug.state`)} <b>${e.state}</b>`,`Enemies <b>${e.activeEnemies}</b>  Boss <b>${e.boss??`—`}</b>`];this.debugOverlay.innerHTML=t.join(`
`)}hideDebug(){this.debugOverlay.classList.add(`hidden`)}setZoneTheme(e){if(!e?.palette)return;let t=e.palette;this.stage.dataset.zone=e.id,this.stage.style.background=`
      radial-gradient(ellipse at 50% 86%, ${$d(t.accent,.075)}, transparent 48%),
      linear-gradient(180deg, ${t.sky} 0%, #08070c 52%, #0c0909 100%)
    `;let n=document.getElementById(`zone-wash`);n&&(n.style.background=t.fog);let r=document.getElementById(`ambient-layer`);r&&(r.style.background=e.ambientColor??`transparent`,r.style.opacity=String(e.ambientColor?e.ambientStrength??.25:0)),this.setVignetteOpacity(e.id===`dungeon`?.92:.95),this.stage.classList.toggle(`is-critical`,!1)}setFade(e){this.fadeLayer?.classList.toggle(`active`,!!e)}setVignetteOpacity(e){let t=document.getElementById(`vignette`);t&&(t.style.opacity=String(e))}dispose(){this.clearToasts(),this.debugOverlay.remove();for(let e of this.damagePool)e.remove();this.flashOverlay.remove()}flashHurt(e=!1){this.stage.classList.remove(`is-hurt`),this.stage.offsetWidth,this.stage.classList.add(`is-hurt`),this.stage.classList.toggle(`is-critical`,e);let t=(this.save.settings.flash??.75)*(e?.26:.16);this.flashOverlay.style.background=`rgba(136, 22, 32, ${t})`,this.flashOverlay.style.opacity=`1`,setTimeout(()=>{this.flashOverlay.style.opacity=`0`,this.stage.classList.remove(`is-hurt`)},120),setTimeout(()=>this.stage.classList.remove(`is-critical`),280)}};function $d(e,t){let n=e.replace(`#`,``),r=n.length===3?n.split(``).map(e=>e+e).join(``):n;return`rgba(${parseInt(r.slice(0,2),16)}, ${parseInt(r.slice(2,4),16)}, ${parseInt(r.slice(4,6),16)}, ${t})`}var ef={sword:`M12 1h3v3L8 11 5 8l7-7ZM4 9l1-1 3 3-1 1H4V9Zm-2 4h3v2H0v-3h2v1Z`,trophy:`M5 2h6v3h2v2c0 2-2 3-4 3v2h2v2H5v-2h2v-2C5 10 3 9 3 7V4h2V2Zm0 4H4v1c0 1 1 1 1 1V6Zm6 0v2s1 0 1-1V6h-1Z`,gear:`M7 1h2v2h2l1-1 1 2-1 1v2l1 1-1 2-1-1H9v3H7v-3H5l-1 1-1-2 1-1V5L3 4l1-2 1 1h2V1Zm1 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z`,scroll:`M3 2h10v12H3V2Zm2 3h6v1H5V5Zm0 3h6v1H5V8Zm0 3h4v1H5v-1Z`,shard:`M8 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z`,arrow:`M2 7h8V3l4 5-4 5V9H2V7Z`,refresh:`M3 8a5 5 0 0 1 8-4l1-1v4H8l1-1a3 3 0 1 0 0 4l2 1a5 5 0 0 1-8-3Z`,lock:`M4 7V5a4 4 0 0 1 8 0v2h1v7H3V7h1Zm2 0h4V5a2 2 0 0 0-4 0v2Z`,flame:`M8 0l1 4 3-2-1 4 3 2-4 1 1 4-3-2-3 2 1-4-4-1 3-2-1-4 3 2 1-4Z`,skull:`M4 1h8v2h2v6h-2v3h-2v2H6v-2H4v-3H2V3h2V1Zm2 4v3h1V5H6Zm4 0v3h1V5h-1ZM7 10h2v2H7v-2Z`};function tf(e,t=``){return`<svg class="icon ${t}" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="${ef[e]??ef.shard}"/></svg>`}function nf(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function rf({t:e,seed:t,shards:n,version:i,bestTime:a,runs:o=0,zonesSeen:s=0}){return`
    <div class="screen menu-screen" data-screen="main-menu">
      <div class="menu-cinema" aria-hidden="true">
        <div class="menu-cinema__shade"></div>
        <div class="menu-constellation">
          <svg viewBox="0 0 460 460" fill="none">
            <circle class="orbit" cx="230" cy="230" r="208"></circle>
            <circle class="orbit orbit--dash" cx="230" cy="230" r="156"></circle>
            <circle class="orbit" cx="230" cy="230" r="104"></circle>
            <path class="shard-path" d="M230 22 438 230 230 438 22 230Z"></path>
            <path class="shard-path" d="M230 118 342 230 230 342 118 230Z"></path>
            <path class="orbit" d="M230 22v72M438 230h-72M230 438v-72M22 230h72"></path>
            <g transform="rotate(45 230 230)">
              <rect class="node" x="223" y="52" width="14" height="14"></rect>
              <rect class="node" x="217" y="217" width="26" height="26"></rect>
              <rect class="node" x="223" y="394" width="14" height="14"></rect>
            </g>
            <circle class="orbit orbit--dash" cx="230" cy="230" r="58"></circle>
          </svg>
        </div>
        <div class="menu-ghost">DESCEND</div>
        <div class="menu-fog menu-fog--one"></div>
        <div class="menu-fog menu-fog--two"></div>
        <div class="menu-embers">
          <span class="e1"></span><span class="e2"></span><span class="e3"></span><span class="e4"></span>
          <span class="e5"></span><span class="e6"></span><span class="e7"></span><span class="e8"></span>
        </div>
        <div class="menu-scanlines"></div>
      </div>
      <div class="menu-shell">
        <header class="menu-topbar">
          <div class="menu-brand"><span class="brand-glyph">${tf(`shard`)}</span><span>JAYNUS <i>/</i> HELLSHARD</span></div>
          <div class="menu-protocol"><span class="protocol-dot"></span>${e(`menu.protocol`)}<b>${e(`menu.ready`)}</b></div>
          <div class="menu-version">${e(`game.version`,{version:i})}</div>
        </header>
        <div class="menu-body">
          <section class="menu-hero">
            <div class="menu-kicker"><span></span>${e(`game.tagline`)}<span></span></div>
            <h1 class="game-title" aria-label="HELLSHARD">
              <span class="title-hell">HELL</span><span class="title-shard">${tf(`shard`)}</span><span class="title-shard-word">SHARD</span>
            </h1>
            <div class="title-rule">${e(`menu.rule`)}</div>
            <p class="game-subtitle">${e(`menu.subtitle`)}</p>
            <nav class="menu-actions" aria-label="${e(`menu.controls`)}">
              <button class="btn menu-btn menu-btn--primary" data-action="start" aria-keyshortcuts="1">
                <span class="btn-index">01</span>
                <span class="btn-icon">${tf(`sword`)}</span>
                <span class="btn-copy"><b>${e(`menu.start`)}</b><small>${e(`menu.startHint`)}</small></span>
                <span class="btn-key">1</span>
              </button>
              <button class="btn menu-btn" data-action="achievements" aria-keyshortcuts="2">
                <span class="btn-index">02</span>
                <span class="btn-icon">${tf(`trophy`)}</span>
                <span class="btn-copy"><b>${e(`menu.achievements`)}</b><small>${e(`menu.meta`)}</small></span>
                <span class="btn-key">2</span>
              </button>
              <button class="btn menu-btn" data-action="settings" aria-keyshortcuts="3">
                <span class="btn-index">03</span>
                <span class="btn-icon">${tf(`gear`)}</span>
                <span class="btn-copy"><b>${e(`menu.settings`)}</b><small>${e(`settings.audio`)} · ${e(`settings.video`)}</small></span>
                <span class="btn-key">3</span>
              </button>
              <button class="btn menu-btn menu-btn--ghost" data-action="credits" aria-keyshortcuts="4">
                <span class="btn-index">04</span>
                <span class="btn-icon">${tf(`scroll`)}</span>
                <span class="btn-copy"><b>${e(`menu.credits`)}</b><small>${e(`menu.creditsHint`)}</small></span>
                <span class="btn-key">4</span>
              </button>
            </nav>
          </section>
          <aside class="descent-ledger" aria-label="${e(`menu.ledger`)}">
            <div class="ledger-top">
              <span>${e(`menu.ledger`)}</span>
              <span class="ledger-mark">${tf(`shard`)}</span>
            </div>
            <div class="ledger-constellation" aria-hidden="true">
              <span class="fragment-line"></span>
              <span class="fragment f1"></span><span class="fragment f2"></span>
            </div>
            <div class="ledger-fragment-label">${e(`menu.fragments`)}</div>
            <div class="ledger-stats">
              <div class="ledger-stat">
                <span>${e(`menu.hellshards`)}</span>
                <b class="shard-count">${tf(`shard`)} ${n}</b>
              </div>
              <div class="ledger-stat"><span>${e(`menu.best`)}</span><b>${a>0?Nl(a):`—`}</b></div>
              <div class="ledger-stat"><span>${e(`menu.runs`)}</span><b>${o}</b></div>
              <div class="ledger-stat"><span>${e(`menu.zones`)}</span><b>${s}<em>/${r.length}</em></b></div>
            </div>
            <div class="seed-box">
              <label for="menu-seed">${e(`menu.seed`)}</label>
              <div class="seed-row">
                <input id="menu-seed" data-seed-input value="${nf(t)}" inputmode="numeric" maxlength="10" autocomplete="off" aria-label="${e(`menu.seed`)}" />
                <button class="btn icon-btn" data-action="random-seed" title="${e(`menu.reroll`)}" aria-label="${e(`menu.reroll`)}">${tf(`refresh`)}</button>
              </div>
              <div class="seed-hint">${e(`menu.seedHint`)}</div>
            </div>
            <div class="ledger-note">
              <span class="ledger-note-icon">${tf(`flame`)}</span>
              <p>${e(`menu.tip`)}</p>
            </div>
          </aside>
        </div>
        <footer class="menu-footer">
          <span class="footer-controls">${e(`menu.footer`)}</span>
          <span class="footer-meta">${e(`menu.originalWork`)} <i>·</i> LICENSE</span>
        </footer>
      </div>
    </div>
  `}function af(e,t){return`<div class="stat-bar"><div class="stat-fill" style="width:${Math.max(4,Math.min(100,Math.round(e*100)))}%;--stat-color:${t}"></div></div>`}function of({t,selectedId:n,meta:r,seed:i}){let a=Math.max(0,du.findIndex(e=>e.id===n)),o=du[a]??du[0],s=r.unlockedCharacters.includes(o.id),c=o.weapon.style===`melee`?o.weapon.damage*(1/o.weapon.cooldown)*.14:o.weapon.damage*(1/o.weapon.cooldown)*.1,l=1-Math.min(1,o.stats.specialCooldown/14),u=du.map((i,a)=>{let o=r.unlockedCharacters.includes(i.id),s=i.id===n,c=i.unlock===`shards`?e.meta.unlockCosts[i.id]??1:0;return`
      <button type="button" class="char-row ${s?`selected`:``} ${o?``:`locked`}"
        data-char="${i.id}" style="--accent:${i.accent}"
        aria-pressed="${s}"
        title="${o?t(i.nameKey):`${t(`char.select.locked`)} — ${t(`char.select.unlock`,{cost:c})}`}">
        <span class="roster-index">${String(a+1).padStart(2,`0`)}</span>
        <span class="roster-portrait"><canvas class="char-canvas char-canvas-mini" width="42" height="38" data-preview="${i.id}"></canvas></span>
        <span class="roster-copy"><b>${t(i.nameKey)}</b><small>${t(i.titleKey)}</small></span>
        <span class="roster-state">${o?s?`<span class="roster-chosen">${tf(`shard`)}</span>`:``:`<span class="roster-cost">${tf(`lock`)}${c}</span>`}</span>
      </button>
    `}).join(``);return`
    <div class="screen char-screen" data-screen="character-select">
      <div class="char-atmosphere" aria-hidden="true"></div>
      <div class="char-shell">
        <header class="char-header">
          <div class="char-heading">
            <span class="section-kicker">${t(`char.select.kicker`)}</span>
            <h1>${t(`char.select.title`)}</h1>
            <p>${t(`char.select.subtitle`)}</p>
          </div>
          <div class="header-actions">
            <span class="shard-balance">${tf(`shard`)} ${r.hellshards}</span>
            <button class="btn small ghost" data-action="back">${tf(`arrow`)} ${t(`char.select.back`)}</button>
          </div>
        </header>
        <div class="char-body">
          <section class="char-showcase corner-frame" style="--accent:${o.accent}">
            <div class="showcase-stage">
              <div class="showcase-halo" aria-hidden="true"></div>
              <canvas class="char-canvas char-canvas-hero" width="160" height="116" data-preview="${o.id}" aria-label="${t(o.nameKey)}"></canvas>
              <span class="showcase-index">${String(a+1).padStart(2,`0`)}</span>
              <span class="showcase-line" aria-hidden="true"></span>
            </div>
            <div class="showcase-copy">
              <span class="char-role">${t(o.titleKey)}</span>
              <h2 class="char-name">${t(o.nameKey)}</h2>
              <p class="char-desc">${t(o.descKey)}</p>
              <div class="char-kit">
                <span class="kit-chip"><small>${t(`char.select.weapon`)}</small><b>${t(o.weapon.nameKey)}</b></span>
                <span class="kit-chip"><small>${t(`char.select.special`)}</small><b>${t(o.special.nameKey)}</b></span>
              </div>
              <div class="char-stats">
                <div class="stat-row"><span class="stat-label">${t(`char.select.health`)}</span>${af(o.stats.maxHealth/150,`#b9575a`)}</div>
                <div class="stat-row"><span class="stat-label">${t(`char.select.stat.power`)}</span>${af(c,o.accent)}</div>
                <div class="stat-row"><span class="stat-label">${t(`char.select.stat.speed`)}</span>${af(o.stats.moveSpeed/1.25,`#91c6a0`)}</div>
                <div class="stat-row"><span class="stat-label">${t(`char.select.stat.ability`)}</span>${af(l,`#b8a1ea`)}</div>
              </div>
              <div class="char-meta-row">
                <span>${t(`char.select.difficulty`)}</span><b>${t(o.difficultyKey)}</b>
                ${s?``:`<span class="sealed-note">${tf(`lock`)} ${t(`char.select.unlock`,{cost:e.meta.unlockCosts[o.id]??1})}</span>`}
              </div>
            </div>
          </section>
          <aside class="char-roster" aria-label="${t(`char.select.roster`)}">
            <div class="roster-head">
              <span>${t(`char.select.roster`)}</span>
              <span>${r.unlockedCharacters.length}<em>/4</em></span>
            </div>
            ${u}
            <div class="roster-hint">${t(`char.select.hint`)}</div>
          </aside>
        </div>
        <footer class="char-footer">
          <span class="seed-chip">${t(`hud.seed`,{seed:nf(i)})}</span>
          <span class="char-selected-summary" data-selected-summary>${t(`char.select.blurb`,{name:t(o.nameKey)})}</span>
          <span class="spacer"></span>
          <span class="char-controls-hint">A/D · Space · J/K/L</span>
          <button class="btn primary char-start" data-action="start">${t(`char.select.start`)} ${tf(`arrow`)}</button>
        </footer>
      </div>
    </div>
  `}function sf({t:e,settings:t,meta:n,inRun:r,seed:i}){let a=[[`vitality`,`settings.bonus.vitality`,`settings.bonus.vitalityDesc`,3,2],[`fortune`,`settings.bonus.fortune`,`settings.bonus.fortuneDesc`,3,3],[`edge`,`settings.bonus.edge`,`settings.bonus.edgeDesc`,3,3]].map(([t,i,a,o,s])=>{let c=n.permanent[t]??0,l=c>=o;return`
      <div class="meta-bonus">
        <div class="meta-bonus-info">
          <div class="meta-bonus-name">${e(i)}</div>
          <div class="meta-bonus-desc">${e(a)}</div>
        </div>
        <span class="meta-bonus-rank">${l?e(`settings.bonus.maxed`):e(`settings.bonus.rank`,{rank:c,max:o})}</span>
        <button class="btn small ${l?``:`ghost`}" data-buy-bonus="${t}" data-cost="${s}" ${l||r?`disabled`:``}>
          ${l?`◆`:e(`settings.bonus.buy`,{cost:s})}
        </button>
      </div>
    `}).join(``);return`
    <div class="screen modal-screen" data-screen="settings">
      <div class="modal-panel corner-frame settings-modal">
        <div class="settings-heading">
          <div>
            <div class="section-kicker">${e(`settings.audio`)} · ${e(`settings.video`)} · ${e(`settings.meta`)}</div>
            <div class="modal-title">${e(`settings.title`)}</div>
          </div>
          <div class="settings-balance">
            <span>${e(`common.metaShards`)}</span><b>◆ ${n.hellshards}</b>
          </div>
        </div>
        <div class="settings-grid">
          <section class="settings-col">
            <div class="setting-section">${e(`settings.audio`)}</div>
            ${cf(e(`settings.master`),`master`,t.master,`settings.master`)}
            ${cf(e(`settings.sfx`),`sfx`,t.sfx,`settings.sfx`)}
            ${cf(e(`settings.music`),`music`,t.music,`settings.music`)}
            <div class="setting-row"><label>${e(`settings.musicEnabled`)}</label>${lf(`musicEnabled`,t.musicEnabled,e(`settings.musicEnabled`))}</div>
          </section>
          <section class="settings-col">
            <div class="setting-section">${e(`settings.video`)}</div>
            ${cf(e(`settings.shake`),`shake`,t.shake,`settings.shake`)}
            ${cf(e(`settings.flash`),`flash`,t.flash,`settings.flash`)}
            <div class="setting-row"><label>${e(`settings.damageNumbers`)}</label>${lf(`damageNumbers`,t.damageNumbers,e(`settings.damageNumbers`))}</div>
            <div class="setting-row">
              <label>${e(`settings.language`)}</label>
              <select data-setting="language" aria-label="${e(`settings.language`)}">
                <option value="en" ${t.language===`en`?`selected`:``}>${e(`settings.language.en`)}</option>
                <option value="tr" ${t.language===`tr`?`selected`:``}>${e(`settings.language.tr`)}</option>
              </select>
            </div>
            <div class="setting-row">
              <label>${e(`settings.seed`)}</label>
              <input type="text" inputmode="numeric" maxlength="10" data-setting="seed" value="${i}" aria-label="${e(`settings.seed`)}" ${r?`disabled`:``} />
            </div>
            <div class="setting-row">
              <label>${e(`settings.fullscreen`)}</label>
              <button class="btn small" data-action="fullscreen">${e(`settings.fullscreenButton`)}</button>
            </div>
          </section>
          <section class="settings-col settings-col--full">
            <div class="setting-section">${e(`settings.bonus`)}</div>
            <div class="meta-bonus-list">${a}</div>
          </section>
        </div>
        <div class="settings-actions">
          <button class="btn small ghost" data-action="reset-settings">${e(`settings.reset`)}</button>
          <span class="spacer"></span>
          <button class="btn small" data-action="back">${e(`settings.back`)}</button>
          <button class="btn small primary" data-action="apply-settings">${e(`settings.apply`)}</button>
        </div>
      </div>
    </div>
  `}function cf(e,t,n,r){let i=Math.round(Number(n)*100);return`
    <div class="setting-row">
      <label for="setting-${t}">${e}</label>
      <input id="setting-${t}" type="range" min="0" max="100" value="${i}" data-setting="${t}" data-format="percent" />
      <output data-output="${t}">${i}%</output>
    </div>
  `}function lf(e,t,n=``){return`<button class="toggle ${t?`on`:``}" data-toggle="${e}" aria-pressed="${t}" aria-label="${n}"></button>`}function uf({t:e,meta:t,inRun:n}){let r=Ol.map(n=>{let r=t.achievements.includes(n.id),i=t.achievementProgress[n.id]??0,a=n.condition.target,o=!r&&(n.condition.type===`kills`||n.condition.type===`chests`||n.condition.type===`time`);return`
      <div class="achievement-item ${r?`unlocked`:``}">
        <div class="achievement-icon">${r?n.icon:`◇`}</div>
        <div class="achievement-info">
          <div class="achievement-name">${e(n.nameKey)}</div>
          <div class="achievement-desc">${e(n.descKey)}</div>
          <div class="achievement-progress ${r?`unlocked`:``}">
            ${r?e(`achievements.unlockedShort`):o?e(`achievements.progress`,{current:Math.min(i,a),target:a}):e(`achievements.locked`)}
          </div>
        </div>
      </div>
    `}).join(``),i=Ol.filter(e=>t.achievements.includes(e.id)).length;return`
    <div class="screen modal-screen" data-screen="achievements">
      <div class="modal-panel achievement-list corner-frame">
        <div class="achievement-heading">
          <div>
            <div class="section-kicker">${e(`menu.meta`)}</div>
            <div class="modal-title">${e(`achievements.title`)}</div>
            <div class="modal-subtitle">${e(`achievements.subtitle`)}</div>
          </div>
          <div class="achievement-count">
            <b>${i}</b><span>/${Ol.length}</span>
            <small>${e(`achievements.unlockedShort`)}</small>
          </div>
        </div>
        <div class="achievement-grid">${r}</div>
        <div class="achievement-actions">
          <span class="achievement-progress-line"><span style="width:${i/Ol.length*100}%"></span></span>
          <button class="btn small" data-action="back">${e(`common.back`)}</button>
        </div>
      </div>
    </div>
  `}function df({t:e,offers:t,level:n,playerUpgrades:r}){let i=t.map((t,n)=>{if(!t)return``;let i=t.type===`evolution`,a=t.data,o=a.color??`#d4ae68`,s=i?null:r[a.id]??0,c=a.maxLevel??1;return`
      <button class="level-card ${i?`evolution-card`:``}" data-offer="${n}" style="--card-color:${o}">
        <span class="card-key">${n+1}</span>
        <div class="card-type">${e(i?`levelup.cardType.evolution`:`levelup.cardType.upgrade`)}</div>
        <div class="card-icon">${a.icon??(i?`❖`:`✧`)}</div>
        <h2 class="card-title">${e(a.nameKey)}</h2>
        <p class="card-desc">${e(a.descKey)}</p>
        <div class="card-footer">
          <span>${i?e(`levelup.weaponLevel`,{level:5}):e(`common.level`,{level:s+1})}</span>
          <span class="card-levels">${i?e(`evolution.available`):`${s}/${c}`}</span>
        </div>
      </button>
    `}).join(``);return`
    <div class="screen levelup-screen" data-screen="levelup">
      <div class="levelup-header">
        <h1>${e(`levelup.title`)}</h1>
        <p>${e(`levelup.levelReached`,{level:n})} · ${e(`levelup.subtitle`)}</p>
      </div>
      <div class="levelup-cards">${i}</div>
      <div class="levelup-footer">
        <span>${e(`levelup.key`,{key:`1`})}</span><span>${e(`levelup.key`,{key:`2`})}</span><span>${e(`levelup.key`,{key:`3`})}</span>
      </div>
    </div>
  `}function ff({t:e,summary:t,victory:n,newBestTime:i}){let a=t.topUpgrades.length?t.topUpgrades.map(t=>`
        <div class="result-list-item">
          <span>${e(t.nameKey)}</span><b>${e(`common.level`,{level:t.level})}</b>
        </div>`).join(``):`<div class="result-list-item muted">${e(`common.noUpgrade`)}</div>`,o=t.achievements.length?t.achievements.map(t=>{let n=kl[t];return`<span class="result-achievement">${n?e(n.nameKey):t}</span>`}).join(``):`<span class="result-list-item muted">${e(`result.noAchievements`)}</span>`;return`
    <div class="screen result-screen ${n?`victory`:`death`}" data-screen="result">
      <div class="result-header">
        <div>
          <h1>${e(n?`result.victory`:`result.death`)}</h1>
          <p class="result-sub">${e(n?`result.subtitleVictory`:`result.subtitleDeath`)}</p>
        </div>
        <div class="result-seed">${e(`result.seed`)}: ${t.seed}${i?` · ${e(`toast.newRecord`,{time:Nl(t.elapsed)})}`:``}</div>
      </div>
      <div class="result-body">
        <div class="result-stat-grid">
          <div class="result-stat"><span>${e(`result.survived`)}</span><b>${Nl(t.elapsed)}</b></div>
          <div class="result-stat"><span>${e(`result.kills`)}</span><b>${t.kills}</b></div>
          <div class="result-stat"><span>${e(`result.bosses`)}</span><b>${t.bosses.length}/${r.length}</b></div>
          <div class="result-stat"><span>${e(`result.level`)}</span><b>${t.level}</b></div>
          <div class="result-stat"><span>${e(`result.xp`)}</span><b>${t.xp}</b></div>
          <div class="result-stat gold"><span>${e(`result.shards`)}</span><b>+${t.shardsEarned} ◆</b></div>
        </div>
        <div class="result-panel">
          <h3>${e(`result.topUpgrades`)}</h3>
          <div class="result-list">${a}</div>
          <h3 style="margin-top:10px;">${e(`result.achievements`)}</h3>
          <div class="result-achievements">${o}</div>
          <h3 style="margin-top:10px;">${e(`result.weapon`)}</h3>
          <div class="result-list-item"><span>${e(t.weaponNameKey??`hud.weapon`)}</span><b>${t.evolved?e(`evolution.already`):e(`common.level`,{level:t.weaponLevel})}</b></div>
        </div>
      </div>
      <div class="result-footer">
        <button class="btn primary" data-action="restart">${e(`result.restart`)}</button>
        <button class="btn" data-action="menu">${e(`result.menu`)}</button>
      </div>
    </div>
  `}function pf({t:e}){return`
    <div class="screen modal-screen" data-screen="credits">
      <div class="modal-panel credits-panel corner-frame">
        <div class="modal-title">${e(`credits.title`)}</div>
        <div class="modal-subtitle">${e(`game.title`)}</div>
        <div class="credits-copy">
          <b>${e(`credits.assets`)}</b><br/>
          Gothicvania Cemetery · Church · Swamp — <b>ansimuz</b> (CC0)<br/>
          2D Medieval Castle Dungeon — <b>TPC / ThePixelist</b><br/>
          Fantasy Forest Pixel Tileset — <b>KilluaKage</b><br/>
          <br/>
          <b>${e(`credits.code`)}</b><br/>
          HELLSHARD — <b>JAYNUS</b><br/>
          Three.js r187 · Vite · Vitest<br/>
          <br/>
          <b>${e(`credits.audio`)}</b><br/>
          ${e(`credits.thanks`)}<br/>
          <br/>
          <span>${e(`credits.license`)}</span><br/>
          <span class="credits-license">© JAYNUS. MIT licensed. See LICENSE.</span>
        </div>
        <div class="levelup-footer" style="justify-content:center;margin-top:9px;">
          <button class="btn small" data-action="back">${e(`credits.back`)}</button>
        </div>
      </div>
    </div>
  `}var mf=class{constructor(e){this.ui=e,this.game=e.game,this.save=e.save,this.audio=e.audio,this.settingsReturn=`menu`,this.achievementsReturn=`menu`,this.currentInRun=!1}showSettings({inRun:e=!1,from:t=`menu`}={}){let n=this.ui;this.settingsReturn=t,this.currentInRun=e;let r=this.save.settings,i=this.game.seed??r.seed??1,a=sf({t:n.t,settings:r,meta:this.save.meta,inRun:e,seed:i});n.mountScreen(`settings`,a,{back:()=>this.backFromSettings(),"apply-settings":()=>{let t=n.screenRoot.querySelector(`[data-setting="seed"]`);if(t&&!e){let e=n.parseSeed(t.value);if(e===null){n.toast(`settings.seedInvalid`,{},{error:!0});return}this.save.updateSettings({seed:e}),this.game.updateSettings?.({seed:e},!1)}n.toast(`settings.saved`),this.backFromSettings()},fullscreen:()=>{document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.()},"reset-settings":()=>{this.save.resetSettings(),n.settings=this.save.settings,this.audio.setSettings(this.save.settings),this.game.updateSettings?.(this.save.settings,!0),n.setLanguage(this.save.settings.language),this.showSettings({inRun:e,from:t})}}),this.bindSettingsControls(e)}backFromSettings(){this.settingsReturn===`pause`?this.ui.showPause():this.ui.showMainMenu()}bindSettingsControls(e){let t=this.ui;for(let e of t.screenRoot.querySelectorAll(`[data-setting]`)){let n=e.dataset.setting;n===`seed`?e.addEventListener(`input`,()=>{e.value=e.value.replace(/[^0-9]/g,``).slice(0,10)}):e.addEventListener(`input`,()=>{if(e.type===`range`){let r=Number(e.value)/100,i=t.screenRoot.querySelector(`[data-output="${n}"]`);i&&(i.textContent=`${Math.round(r*100)}%`),this.updateSettingLive(n,r)}else n===`language`&&(this.updateSettingLive(n,e.value),t.setLanguage(e.value))})}for(let e of t.screenRoot.querySelectorAll(`[data-toggle]`))e.addEventListener(`click`,()=>{let t=e.dataset.toggle,n=!e.classList.contains(`on`);e.classList.toggle(`on`,n),e.setAttribute(`aria-pressed`,String(n)),this.updateSettingLive(t,n)});for(let n of t.screenRoot.querySelectorAll(`[data-buy-bonus]`))n.addEventListener(`click`,()=>{let r=n.dataset.buyBonus,i=Number(n.dataset.cost);this.game.buyPermanentBonus(r,i)?(this.audio.play(`shard`),this.showSettings({inRun:e,from:this.settingsReturn})):t.toast(`char.select.notEnough`,{},{error:!0})})}updateSettingLive(e,t){this.save.updateSettings({[e]:t}),this.ui.settings=this.save.settings,e===`seed`?this.game.updateSettings?.({seed:Number(t)},!1):this.game.updateSettings?.(this.save.settings,!0),this.audio.applyVolumes()}showAchievements({from:e=`menu`}={}){let t=this.ui;this.achievementsReturn=e;let n=uf({t:t.t,meta:this.save.meta,inRun:e===`pause`});t.mountScreen(`achievements`,n,{back:()=>e===`pause`?t.showPause():t.showMainMenu()})}backFromAchievements(){this.achievementsReturn===`pause`?this.ui.showPause():this.ui.showMainMenu()}},hf=class{constructor({game:e,assets:t,save:n,audio:r}){this.game=e,this.assets=t,this.save=n,this.audio=r,this.root=document.getElementById(`ui-root`),this.toastLayer=document.getElementById(`toast-layer`),this.damageLayer=document.getElementById(`damage-layer`),this.fadeLayer=document.getElementById(`fade-layer`),this.stage=document.getElementById(`stage`),this.screenRoot=document.createElement(`div`),this.screenRoot.style.cssText=`position:absolute;inset:0;pointer-events:none;z-index:15;`,this.root.appendChild(this.screenRoot),this.currentScreen=null,this.currentScreenName=null,this.screenContext={},this.previewRaf=0,this.previewCanvases=[],this.previewStartedAt=performance.now(),this.selectedCharacterId=fu[n.meta.selectedCharacter]?n.meta.selectedCharacter:`kael`,this.screenContext.inRun=!1,this.hud=new Yd(this.root,this),this.settingsViews=new mf(this),this.feedback=new Qd({root:this.root,stage:this.stage,save:this.save,audio:this.audio,language:n.settings.language,t:(e,t)=>this.t(e,t),damageLayer:this.damageLayer,toastLayer:this.toastLayer,fadeLayer:this.fadeLayer}),this.boundKeydown=e=>this.handleKeyDown(e),window.addEventListener(`keydown`,this.boundKeydown),this.setLanguage(n.settings.language)}get t(){return(e,t)=>Ml(this.language,e,t)}setLanguage(e){this.language=e===`tr`?`tr`:`en`,this.hud.localize(),document.documentElement.lang=this.language,this.currentScreenName&&this.refreshCurrentScreen()}setBootProgress(e,t){let n=document.getElementById(`boot-progress`),r=document.getElementById(`boot-status`);n&&(n.style.width=`${Math.round(e*100)}%`),r&&t&&(r.textContent=t)}hideBoot(){let e=document.getElementById(`boot-overlay`);e&&(e.classList.add(`done`),setTimeout(()=>e.remove(),900))}mountScreen(e,t,n={}){if(this.stopPreviewAnimation(),this.screenRoot.innerHTML=t,this.currentScreen=this.screenRoot.querySelector(`.screen`),this.currentScreenName=e,this.screenContext=n,!this.currentScreen)return null;this.currentScreen.style.pointerEvents=`auto`;for(let e of this.screenRoot.querySelectorAll(`[data-action]`))e.addEventListener(`click`,t=>{let r=e.dataset.action;this.audio?.play(`ui`),n[r]&&n[r](t,e)});return this.bindSeedInputs(),this.currentScreen}bindSeedInputs(){let t=this.screenRoot.querySelector(`[data-seed-input]`);t&&t.addEventListener(`input`,()=>{t.value=t.value.replace(/[^0-9]/g,``).slice(0,e.seed.maxLength)})}clearScreen(){this.stopPreviewAnimation(),this.screenRoot.innerHTML=``,this.currentScreen=null,this.currentScreenName=null,this.screenContext={}}refreshCurrentScreen(){if(this.currentScreenName)switch(this.currentScreenName){case`menu`:this.showMainMenu();break;case`characters`:this.showCharacterSelect();break;case`settings`:this.showSettings({inRun:this.settingsViews.currentInRun,from:this.settingsViews.settingsReturn});break;case`achievements`:this.showAchievements({from:this.settingsViews.achievementsReturn});break;case`pause`:this.showPause();break;case`credits`:this.showCredits()}}setMenuVisible(e){this.hud.setVisible(!1)}showMainMenu(){this.game.enterMenuMode?.(),this.hud.setVisible(!1),this.setFade(!1),this.stage.classList.remove(`is-critical`);let t=this.getSeedFromInputOrSettings(),n=rf({t:this.t,seed:t,shards:this.save.meta.hellshards,version:e.version,bestTime:this.save.meta.bestTime,runs:this.save.meta.runs??0,zonesSeen:Math.min(r.length,new Set(this.save.meta.seenZones??[]).size)});this.mountScreen(`menu`,n,{start:()=>{let e=this.screenRoot.querySelector(`[data-seed-input]`),t=this.parseSeed(e?.value);t===null?this.toast(`settings.seedInvalid`,{},{error:!0}):(this.save.updateSettings({seed:t}),this.game.updateSettings?.({seed:t},!1),this.showCharacterSelect())},achievements:()=>this.showAchievements({from:`menu`}),settings:()=>this.showSettings({inRun:!1,from:`menu`}),credits:()=>this.showCredits(),"random-seed":()=>{let e=this.screenRoot.querySelector(`[data-seed-input]`),t=String(Math.floor(Math.random()*8999999)+1e6);e&&(e.value=t),this.save.updateSettings({seed:Number(t)}),this.game.updateSettings?.({seed:Number(t)},!1),this.audio?.play(`ui`)}}),this.bindSeedInputs()}getSeedFromInputOrSettings(){let t=this.screenRoot?.querySelector(`[data-seed-input]`);return t&&t.value?t.value:String(this.save.settings.seed??e.seed.default)}parseSeed(t){let n=String(t??``).trim();if(!/^\d{1,10}$/.test(n))return null;let r=Number(n);return r<e.seed.min||r>e.seed.max?null:r}showCharacterSelect(){this.stopPreviewAnimation();let t=Number(this.save.settings.seed??e.seed.default);this.game.enterMenuMode?.(),this.hud.setVisible(!1),this.save.isUnlocked(this.selectedCharacterId)||(this.selectedCharacterId=this.save.meta.unlockedCharacters[0]??`kael`);let n=of({t:this.t,selectedId:this.selectedCharacterId,meta:this.save.meta,seed:t});this.mountScreen(`characters`,n,{back:()=>this.showMainMenu(),start:()=>{let t=fu[this.selectedCharacterId];if(!t||!this.save.isUnlocked(t.id)){this.toast(`char.select.locked`,{},{error:!0});return}let n=Number(this.save.settings.seed??e.seed.default);this.game.startRun(this.selectedCharacterId,n),this.hud.setVisible(!0)}}),this.bindCharacterCards(),this.startPreviewAnimation()}bindCharacterCards(){for(let t of this.screenRoot.querySelectorAll(`[data-char]`))t.addEventListener(`click`,()=>{let n=t.dataset.char;if(fu[n]){if(this.save.isUnlocked(n))this.selectedCharacterId!==n&&(this.selectedCharacterId=n,this.save.meta.selectedCharacter=n,this.save.saveMeta(),this.audio?.play(`ui`),this.showCharacterSelect());else{let t=e.meta.unlockCosts[n]??1;this.game.unlockCharacter(n,t)?(this.audio?.play(`shard`),this.toast(`char.select.unlockedTitle`,{},{icon:`◆`}),this.selectedCharacterId=n,this.save.meta.selectedCharacter=n,this.save.saveMeta(),this.showCharacterSelect()):this.toast(`char.select.notEnough`,{},{error:!0})}}})}startPreviewAnimation(){this.stopPreviewAnimation(),this.previewCanvases=[...this.screenRoot.querySelectorAll(`[data-preview]`)];let e=()=>{if(!this.previewCanvases.length)return;let t=performance.now();for(let e of this.previewCanvases){let n=fu[e.dataset.preview];if(!n)continue;let r=this.assets.getAnimation(n.sprite,`idle`);if(!r||!r.frames.length)continue;let i=(t-this.previewStartedAt)/1e3*r.fps,a=r.frames[Math.floor(i)%r.frames.length];this.drawPreview(e,a)}this.previewRaf=requestAnimationFrame(e)};this.previewStartedAt=performance.now(),e()}drawPreview(e,t){if(!t)return;let n=e.getContext(`2d`);n.imageSmoothingEnabled=!1,n.clearRect(0,0,e.width,e.height);let r=this.assets.atlases.gothic;if(!r)return;let i=t.opaqueBox??{x:0,y:0,w:t.w,h:t.h},a=e.width-14,o=e.height-14,s=Math.max(1,Math.min(3,Math.floor(a/Math.max(1,i.w)),Math.floor(o/Math.max(1,i.h)))),c=i.w*s,l=i.h*s,u=Math.floor((e.width-c)/2),d=Math.floor(e.height-l-6);n.save(),n.globalAlpha=.22,n.fillStyle=`rgba(0,0,0,0.7)`,n.beginPath(),n.ellipse(e.width/2,e.height-6,c*.42,3,0,0,Math.PI*2),n.fill(),n.restore(),n.drawImage(r.canvas,t.sx+i.x,t.sy+i.y,i.w,i.h,u,d,c,l)}stopPreviewAnimation(){this.previewRaf&&cancelAnimationFrame(this.previewRaf),this.previewRaf=0,this.previewCanvases=[]}showPause(){this.game.setPaused?.(!0),this.hud.setVisible(!0);let e=`
      <div class="screen modal-screen" data-screen="pause">
        <div class="modal-panel corner-frame" style="width:310px;padding-bottom:14px;">
          <div class="modal-title">${this.t(`pause.title`)}</div>
          <div class="modal-subtitle">${this.t(`pause.seed`,{seed:this.game.seed})} · ${this.t(`pause.level`,{level:this.game.run?.level??1})}</div>
          <div class="pause-buttons">
            <button class="btn primary" data-action="resume">${this.t(`pause.resume`)}</button>
            <button class="btn" data-action="settings">${this.t(`pause.settings`)}</button>
            <button class="btn" data-action="achievements">${this.t(`pause.achievements`)}</button>
            <button class="btn ghost" data-action="abandon">${this.t(`pause.abandon`)}</button>
          </div>
          <div class="pause-meta">
            <span>${this.t(`pause.time`,{time:Nl(this.game.run?.elapsed??0)})}</span>
            <span>${this.t(`hud.seed`,{seed:this.game.seed})}</span>
          </div>
          <div class="pause-buttons hidden" data-abandon-confirm>
            <div class="modal-subtitle" style="margin:9px 0 5px;">${this.t(`pause.confirmAbandon`)}</div>
            <button class="btn small" data-action="confirm-abandon">${this.t(`pause.confirm`)}</button>
            <button class="btn small ghost" data-action="cancel-abandon">${this.t(`pause.cancel`)}</button>
          </div>
        </div>
      </div>
    `;this.mountScreen(`pause`,e,{resume:()=>{this.clearScreen(),this.game.setPaused?.(!1)},settings:()=>this.showSettings({inRun:!0,from:`pause`}),achievements:()=>this.showAchievements({from:`pause`}),abandon:()=>{this.screenRoot.querySelector(`[data-abandon-confirm]`)?.classList.toggle(`hidden`)},"cancel-abandon":()=>{this.screenRoot.querySelector(`[data-abandon-confirm]`)?.classList.add(`hidden`)},"confirm-abandon":()=>{this.game.abandonRun?.(`abandon`)}})}hidePause(){this.currentScreenName===`pause`&&this.clearScreen()}showSettings(e){this.settingsViews.showSettings(e)}showAchievements(e){this.settingsViews.showAchievements(e)}showCredits(){let e=pf({t:this.t});this.mountScreen(`credits`,e,{back:()=>this.showMainMenu()})}showLevelUp(e,{level:t,playerUpgrades:n}){this.game.setPaused?.(!0);let r=df({t:this.t,offers:e,level:t,playerUpgrades:n});this.mountScreen(`levelup`,r,{});let i=t=>{e[t]&&(this.audio?.play(`levelUp`),this.clearScreen(),this.game.chooseUpgrade?.(t))};for(let e of this.screenRoot.querySelectorAll(`[data-offer]`))e.addEventListener(`click`,()=>i(Number(e.dataset.offer)));this.screenContext.choose=i}showResult(e,t,n){this.stopPreviewAnimation(),this.game.setPaused?.(!0),this.hud.setVisible(!1);let r=ff({t:this.t,summary:e,victory:t,newBestTime:n});this.mountScreen(`result`,r,{restart:()=>{this.game.restartRun?.()},menu:()=>{this.game.returnToMenu?.(),this.showMainMenu()}})}handleKeyDown(e){if(!this.currentScreenName)return;let t=e.target?.closest?.(`input, select, textarea`);if(!t&&this.currentScreenName===`menu`&&/^Digit[1-4]$/.test(e.code)){let t=[`start`,`achievements`,`settings`,`credits`][Number(e.code.slice(-1))-1];this.screenRoot.querySelector(`[data-action="${t}"]`)?.click(),e.preventDefault()}else{if(!t&&this.currentScreenName===`characters`){if(/^Digit[1-4]$/.test(e.code)){let t=Number(e.code.slice(-1))-1;this.screenRoot.querySelectorAll(`[data-char]`)[t]?.click(),e.preventDefault();return}if(e.code===`Enter`){this.screenRoot.querySelector(`[data-action="start"]`)?.click(),e.preventDefault();return}if(e.code===`Escape`){this.showMainMenu(),e.preventDefault();return}}if(e.code===`Escape`){if(this.currentScreenName===`pause`){this.clearScreen(),this.game.setPaused?.(!1),e.preventDefault();return}[`settings`,`achievements`,`credits`].includes(this.currentScreenName)&&(this.currentScreenName===`settings`?this.settingsViews.backFromSettings():this.currentScreenName===`achievements`?this.settingsViews.backFromAchievements():this.showMainMenu(),e.preventDefault())}else if(this.currentScreenName===`levelup`&&/^Digit[1-3]$/.test(e.code)){let t=Number(e.code.slice(-1))-1;this.screenContext.choose?.(t),e.preventDefault()}}}showHUD(e){this.hud.setVisible(e)}updateHUD(e){this.hud.update(e)}setZoneTheme(e){this.feedback.setZoneTheme(e)}setFade(e){this.feedback.setFade(e)}setVignetteOpacity(e){this.feedback.setVignetteOpacity(e)}flashHurt(e=!1){this.feedback.flashHurt(e)}clearToasts(){this.feedback.clearToasts()}toast(e,t={},n={}){this.feedback.toast(e,t,n)}toastText(e,t={}){this.feedback.toastText(e,t)}spawnDamageNumber(e,t,n,r=`normal`){this.feedback.spawnDamageNumber(e,t,n,r)}updateDamageNumbers(e,t){this.feedback.updateDamageNumbers(e,t)}clearDamageNumbers(){this.feedback.clearDamageNumbers()}updateDebug(e){this.feedback.updateDebug(e)}hideDebug(){this.feedback.hideDebug()}destroy(){window.removeEventListener(`keydown`,this.boundKeydown),this.stopPreviewAnimation(),this.feedback.dispose(),this.screenRoot.innerHTML=``,this.hud.root.remove()}},gf=160,_f=`
  html, body { margin: 0; background: #0b0910; color: #ded3c2; }
  body { font-family: "Pixelify Sans", monospace; }
  #facing-debug {
    height: 100vh; overflow-y: auto; padding: 24px; box-sizing: border-box;
    background: radial-gradient(ellipse at 50% 0%, #221522 0%, #0b0910 60%);
  }
  .facing-header { max-width: 1220px; margin: 0 auto 20px; }
  .facing-header h1 { margin: 0 0 6px; font-size: 24px; color: #f0d89b; font-weight: normal; }
  .facing-header p { margin: 4px 0; color: #9d8f9f; font-size: 13px; max-width: 900px; line-height: 1.5; }
  .facing-legend { display: flex; gap: 16px; margin-top: 10px; font-size: 12px; color: #c9b7d1; flex-wrap: wrap; }
  .facing-legend b { color: #f0d89b; font-weight: normal; }
  .facing-grid { max-width: 1220px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .facing-card { border: 1px solid #3e2a40; background: rgba(20, 14, 24, 0.9); padding: 10px 12px 12px; }
  .facing-title { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; color: #f0d89b; font-size: 16px; }
  .facing-used { color: #806d85; font-size: 10px; text-align: right; }
  .facing-meta { color: #958297; font-size: 10px; margin: 3px 0 8px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .facing-meta b { color: #e9d29b; font-weight: normal; }
  .facing-flip { background: #2a182c; border: 1px solid #8c5a91; color: #f2d6a0; font: inherit; font-size: 10px; padding: 2px 7px; cursor: pointer; }
  .facing-flip:hover { background: #452047; }
  .facing-states { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .facing-state { margin: 0; }
  .facing-state canvas { display: block; width: 100%; image-rendering: pixelated; border: 1px solid #3b2b3e; background-color: #17111d; background-image: linear-gradient(45deg, #201728 25%, transparent 25%), linear-gradient(-45deg, #201728 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #201728 75%), linear-gradient(-45deg, transparent 75%, #201728 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0; }
  .facing-state figcaption { margin-top: 4px; color: #9d8f9f; font-size: 9px; line-height: 1.35; }
  .facing-state figcaption b { color: #e9d29b; font-weight: normal; }
  .facing-json-wrap { max-width: 1220px; margin: 18px auto 0; border-top: 1px solid #3e2a40; padding-top: 14px; }
  .facing-json-wrap h2 { margin: 0 0 8px; color: #f0d89b; font-size: 15px; font-weight: normal; }
  .facing-json-wrap p { color: #9d8f9f; font-size: 11px; margin: 0 0 8px; }
  .facing-json { margin: 0; padding: 12px; border: 1px solid #3e2a40; background: #100c14; color: #d8c7a5; font-size: 12px; line-height: 1.45; max-height: 260px; overflow: auto; user-select: text; }
  .facing-copy { margin-top: 8px; background: #2a182c; border: 1px solid #8c5a91; color: #f2d6a0; font: inherit; font-size: 11px; padding: 4px 10px; cursor: pointer; }
  @media (max-width: 900px) {
    .facing-grid { grid-template-columns: 1fr; }
    #facing-debug { padding: 12px; }
  }
`;function vf(){let e=new Map,t=(t,n)=>{e.has(t)||e.set(t,[]),e.get(t).push(n)};for(let e of du)t(e.sprite,e.id);for(let e of nl)t(e.sprite,e.id);for(let e of Object.values(cu))t(e.sprite,e.id);return e}function yf(e){let t=Object.keys(e.animations);return[`walk`,`run`,`float`,`bounce`,`idle`,`cast`].find(e=>t.includes(e))??t[0]}function bf(e,t,n,r){let i=e.getContext(`2d`);i.imageSmoothingEnabled=!1,i.clearRect(0,0,e.width,e.height);let a=t.atlases[n.atlas];if(!a)return;let o=Math.max(1,Math.min(3,Math.floor(120/Math.max(1,r.w,r.h)))),s=r.w*o,c=r.h*o,l=Math.floor((e.width-s)/2),u=Math.floor((e.height-c)/2);i.drawImage(a.canvas,r.sx,r.sy,r.w,r.h,l,u,s,c)}function xf(e,t,n,r,i,a,o,s,c,l){for(let e of r.values())e.mesh.visible=!1;let u=r.get(o);if(!u)return;let d=i.shouldFlipSprite(a,c,l);u.begin(),u.draw(s,0,-s.h/2,{anchorY:s.anchorY??1,flip:d}),u.end(),u.mesh.visible=!0,t.render(n,t.userData.camera);let f=e.getContext(`2d`);f.imageSmoothingEnabled=!1,f.clearRect(0,0,e.width,e.height),f.drawImage(t.domElement,0,0)}function Sf(e){document.getElementById(`stage`)?.style.setProperty(`display`,`none`);let t=document.getElementById(`app`)??document.body,n=document.createElement(`main`);n.id=`facing-debug`;let r=vf(),i=Object.values(e.atlases);n.innerHTML=`
    <header class="facing-header">
      <h1>HELLSHARD · sprite facing audit</h1>
      <p>Raw source frame vs the game's own atlas + SpriteBatch path. LEFT/RIGHT are produced by the
      same <b>shouldFlipSprite</b> helper used by EntityRenderer, with the target direction passed
      directly. Use <b>TERS</b> on any card, then copy the JSON at the bottom and send it back.
      Nothing on this page changes the game manifest or a running run.</p>
      <div class="facing-legend">
        <span><b>RAW</b> source crop + current facing</span>
        <span><b>LEFT</b> target on the left</span>
        <span><b>RIGHT</b> target on the right</span>
        <span><b>TERS</b> toggles this sprite's facing</span>
      </div>
    </header>
    <section class="facing-grid" data-facing-grid></section>
    <section class="facing-json-wrap">
      <h2>Current facing JSON</h2>
      <p>This is the state after your TERS clicks. Copy it and paste it into the chat.</p>
      <pre class="facing-json" data-facing-json></pre>
      <button class="facing-copy" data-copy-faces type="button">Copy JSON</button>
    </section>
  `,t.appendChild(n);let a=n.querySelector(`[data-facing-grid]`),o=n.querySelector(`[data-facing-json]`),s=n.querySelector(`[data-copy-faces]`),c=document.createElement(`style`);c.textContent=_f,document.head.appendChild(c);let l=new Wc({alpha:!0,antialias:!1,preserveDrawingBuffer:!0,powerPreference:`low-power`});l.setPixelRatio(1),l.setSize(gf,gf,!1),l.setClearColor(0,0),l.outputColorSpace=at;let u=new zn,d=new ma(-80,80,80,-80,.1,10);d.position.z=5,l.userData.camera=d;let f=new Map;for(let e of i){let t=new Hl(e.texture,4);t.mesh.visible=!1,u.add(t.mesh),f.set(e.family,t)}let p=Object.entries(e.manifest.sprites).filter(([e])=>e!==`fireball`&&e!==`death_burst`),m=[];for(let[t,n]of p){let i=yf(n),o=e.getAnimation(t,i)?.frames?.[0];if(!o)continue;let s=r.get(t)??[],c=document.createElement(`article`);c.className=`facing-card`,c.dataset.sprite=t,c.innerHTML=`
      <div class="facing-title"><span>${t}</span><span class="facing-used">${s.length?`used by: ${s.join(`, `)}`:``}</span></div>
      <div class="facing-meta">
        <span>frame ${o.w}×${o.h} · clip <b>${i}</b> · facing: <b data-facing-label>${n.facing??`right`}</b></span>
        <button class="facing-flip" data-flip type="button">TERS</button>
      </div>
      <div class="facing-states">
        <figure class="facing-state"><canvas width="${gf}" height="${gf}"></canvas><figcaption><b>RAW</b><br>source frame · <span data-raw-facing>${n.facing??`right`}</span></figcaption></figure>
        <figure class="facing-state"><canvas width="${gf}" height="${gf}"></canvas><figcaption><b>LEFT</b><br>target left · flip <span data-left-flip>${e.shouldFlipSprite(t,-1,n.facing)}</span></figcaption></figure>
        <figure class="facing-state"><canvas width="${gf}" height="${gf}"></canvas><figcaption><b>RIGHT</b><br>target right · flip <span data-right-flip>${e.shouldFlipSprite(t,1,n.facing)}</span></figcaption></figure>
      </div>
    `,a.appendChild(c);let d=c.querySelectorAll(`canvas`),p={spriteId:t,sprite:n,frame:o,clipName:i,facing:n.facing===`left`?`left`:`right`},g=()=>{c.querySelector(`[data-facing-label]`).textContent=p.facing,c.querySelector(`[data-raw-facing]`).textContent=p.facing,c.querySelector(`[data-left-flip]`).textContent=String(e.shouldFlipSprite(p.spriteId,-1,p.facing)),c.querySelector(`[data-right-flip]`).textContent=String(e.shouldFlipSprite(p.spriteId,1,p.facing)),xf(d[1],l,u,f,e,p.spriteId,p.sprite.atlas,p.frame,-1,p.facing),xf(d[2],l,u,f,e,p.spriteId,p.sprite.atlas,p.frame,1,p.facing)};bf(d[0],e,p.sprite,p.frame),g(),c.querySelector(`[data-flip]`).addEventListener(`click`,()=>{p.facing=p.facing===`left`?`right`:`left`,g(),h()}),m.push({state:p,renderCard:g})}function h(){let e={};for(let{state:t}of m)e[t.spriteId]=t.facing;o.textContent=JSON.stringify(e,null,2)}return h(),s.addEventListener(`click`,async()=>{let e=o.textContent;try{await navigator.clipboard.writeText(e),s.textContent=`Copied`,window.setTimeout(()=>{s.textContent=`Copy JSON`},1200)}catch{let e=document.createRange();e.selectNodeContents(o);let t=window.getSelection();t?.removeAllRanges(),t?.addRange(e),s.textContent=`Selected — press Ctrl+C`}}),l.domElement.style.display=`none`,{page:n,renderer:l,camera:d,batches:f,cards:m}}var Cf={cemetery_demo:{id:`cemetery_demo`,zoneId:`cemetery`,url:`assets/cemetery/demo/assets/maps/map.json`,layers:{collision:`Collisions Layer`,render:[`Back Layer`,`Main Layer`]},collisionGids:{1:`solid`,2:`oneWay`},worldHeight:e.world.rows,verticalPlacement:`bottom`,spawnTileX:6,exitTileOffset:3,exitTarget:`routeNext`,arena:{left:150*e.tile,right:182*e.tile,triggerX:154*e.tile,floor:`surface`}}};function wf(){return{}}function Tf(e,t){let n=document.getElementById(`boot-progress`),r=document.getElementById(`boot-status`);n&&(n.style.width=`${Math.round(e*100)}%`),r&&t&&(r.textContent=t)}async function Ef(){let t=new u,n=t.settings.language??`en`,i=(e,t)=>Ml(n,e,t),a=new URLSearchParams(window.location.search).get(`debug`)===`facing`;Tf(.02,i(`game.loading`));let o=new S(t.settings),s=new $c;if(await s.loadAll(e=>{Tf(.05+e*.62,i(`game.assets`))}),a){let e=Sf(s);Tf(1,`Facing audit ready`);let t=document.getElementById(`boot-overlay`);t?.classList.add(`done`),window.setTimeout(()=>t?.remove(),900),window.HELLSHARD={assets:s,facingDebug:e};return}Tf(.7,i(`game.loading`)),await Promise.all(r.map(e=>s.loadZoneBackgrounds(e)));let c={};for(let e of Object.values(Cf)){let t=new URL(e.url,document.baseURI).href,n=await Du(t,{loadImage:qc});c[e.id]={...n,config:e}}Tf(.94,i(`game.loading`));let l=document.getElementById(`game`),d=wf(),f=new Jd({canvas:l,save:t,audio:o,assets:s,packagedMaps:c,devOptions:d}),p=new hf({game:f,assets:s,save:t,audio:o});if(f.attachUI(p),f.initialize(),d.autoStart){let n=d.seed??Number(t.settings.seed??e.seed.default);if(f.startRun(`kael`,n),d.zone&&d.zone!==`cemetery`&&f.setZone(d.zone,f.worlds[d.zone].spawn),d.packagedMap){let e=Cf[d.packagedMap],t=e&&f.worlds[e.zoneId];t&&f.setZone(e.zoneId,t.spawn)}d.spawnX!==null&&d.spawnY!==null&&(f.player.setPosition(d.spawnX,d.spawnY),f.run.checkpoint={x:d.spawnX,y:d.spawnY},f.snapCameraToPlayer()),f.devGallery&&(f.player.devFly=!0,f.player.immortal=!0,f.player.x=f.activeWorld.spawn.x,f.player.y=f.activeWorld.surface+e.dev.galleryHeight,f.player.prevX=f.player.x,f.player.prevY=f.player.y,f.snapCameraToPlayer())}else p.showMainMenu(),d.screen===`characters`?p.showCharacterSelect():d.screen===`achievements`?p.showAchievements({from:`menu`}):d.screen===`settings`?p.showSettings({inRun:!1,from:`menu`}):d.screen===`credits`?p.showCredits():d.screen===`pause`&&p.showPause();Tf(1,i(`game.assets`)),f.start(),p.hideBoot(),window.HELLSHARD={game:f,ui:p,save:t,assets:s,audio:o}}Ef().catch(e=>{console.error(e);let t=(()=>{try{return JSON.parse(localStorage.getItem(`hellshard.settings.v1`))?.language??`en`}catch{return`en`}})(),n=e=>Ml(t,e);Tf(1,n(`error.loadTitle`));let r=document.getElementById(`boot-status`);r&&(r.style.color=`#d05155`,r.textContent=`${n(`error.loadTitle`)} ${n(`error.loadBody`)}`);let i=document.getElementById(`boot-overlay`);if(i){let e=document.createElement(`button`);e.textContent=n(`error.retry`),e.style.cssText=`margin-top:14px;padding:6px 14px;background:#160b0d;border:1px solid #87343a;color:#e9ddc7;font-family:inherit;cursor:pointer;`,e.addEventListener(`click`,()=>window.location.reload()),i.appendChild(e)}});