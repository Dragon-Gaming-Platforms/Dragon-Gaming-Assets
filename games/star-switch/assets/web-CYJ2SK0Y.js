import"./index-BwpXb2Sy.js";import{u as w,G as S}from"./game-CJBFmPls.js";const y=document.querySelector("#app"),l=document.createElement("button");l.className="mute-button";l.type="button";l.setAttribute("aria-label","Mute");l.innerHTML="🔊";document.body.appendChild(l);function P(){const t=window.innerWidth>=1024,e=window.matchMedia("(pointer: fine)").matches,n=window.matchMedia("(hover: hover)").matches,a=window.matchMedia("(pointer: coarse)").matches;return a&&!n?window.innerWidth>=768?"ipad":"phone":t&&(e||n)||t&&!a||t?"laptop":a&&window.innerWidth>=768?"ipad":"phone"}let r=P(),L="easy",i="harbin",h=!1,s=null,g=!1;function A(t){return t==="phone"||t==="ipad"}function H(t){return A(t)?"1p":"2p"}const c=document.createElement("div");c.className="screen active";c.id="title-screen";c.innerHTML=`
  <h1 class="title">Harbin &amp; Agam</h1>
  <p class="subtitle" id="title-subtitle">A kids adventure!</p>

  <p class="section-label">What are you playing on?</p>
  <div class="choice-row" id="device-buttons">
    <button class="button" type="button" data-device="laptop">Laptop</button>
    <button class="button secondary" type="button" data-device="phone">Phone</button>
    <button class="button" type="button" data-device="ipad" style="background:#7c3aed;box-shadow:0 8px 0 #5b21b6, 0 12px 20px rgba(0,0,0,0.3);">iPad</button>
  </div>
  <p class="hint" id="device-hint"></p>

  <p class="section-label">Pick Difficulty:</p>
  <div class="difficulty-buttons" id="difficulty-buttons">
    <button class="button" type="button" data-difficulty="easy">EASY ⭐</button>
    <button class="button secondary" type="button" data-difficulty="medium">MEDIUM ⭐⭐</button>
    <button class="button danger" type="button" data-difficulty="hard">HARD ⭐⭐⭐</button>
  </div>

  <button class="button play-cta" type="button" id="play-button">PLAY!</button>
`;const b=document.createElement("div");b.className="screen";b.id="character-screen";b.innerHTML=`
  <h1 class="title">Who is playing?</h1>
  <p class="subtitle">Only that child is in the level</p>
  <div class="character-row">
    <button class="character-card harbin" type="button" data-character="harbin">
      <span class="character-swatch" style="background:#00CED1;"></span>
      <span class="character-name">Harbin</span>
      <span class="character-meta">Girl · older · cyan</span>
    </button>
    <button class="character-card agam" type="button" data-character="agam">
      <span class="character-swatch" style="background:#FFA500;"></span>
      <span class="character-name">Agam</span>
      <span class="character-meta">Boy · younger · orange</span>
    </button>
  </div>
`;const u=document.createElement("div");u.className="screen";u.id="howto-screen";const f=document.createElement("div");f.className="screen";f.id="win-screen";f.innerHTML=`
  <h1 class="title">🎉 YOU WIN! 🎉</h1>
  <div class="win-stats" id="win-stats"></div>
  <button class="button" type="button" id="play-again-button">PLAY AGAIN</button>
  <button class="button secondary" type="button" id="home-button">HOME</button>
`;y.appendChild(c);y.appendChild(b);y.appendChild(u);y.appendChild(f);const k=document.createElement("canvas");k.id="game-canvas";y.appendChild(k);const m=document.createElement("div");m.className="touch-controls hidden";m.id="touch-controls";m.innerHTML=`
  <div class="touch-cluster touch-left">
    <button class="touch-btn" type="button" data-touch="left" aria-label="Left">◀</button>
    <button class="touch-btn" type="button" data-touch="right" aria-label="Right">▶</button>
  </div>
  <div class="touch-cluster touch-right">
    <button class="touch-btn touch-action" type="button" data-touch="action">ACTION</button>
    <button class="touch-btn touch-jump" type="button" data-touch="jump">JUMP</button>
  </div>
`;document.body.appendChild(m);function M(t){return t==="harbin"?{left:"a",right:"d",jump:"w",action:"s"}:{left:"arrowleft",right:"arrowright",jump:"arrowup",action:"arrowdown"}}function j(t,e,n){const a=new Set,d=o=>{if(o.preventDefault(),o.stopPropagation(),!a.has(o.pointerId)){a.add(o.pointerId);try{t.setPointerCapture(o.pointerId)}catch{}t.classList.add("pressed"),e()}},v=o=>{a.has(o.pointerId)&&(a.delete(o.pointerId),o.preventDefault(),a.size===0&&(t.classList.remove("pressed"),n()))};t.addEventListener("pointerdown",d),t.addEventListener("pointerup",v),t.addEventListener("pointercancel",v),t.addEventListener("lostpointercapture",v),t.addEventListener("contextmenu",o=>o.preventDefault())}m.querySelectorAll("[data-touch]").forEach(t=>{const e=t.dataset.touch;j(t,()=>{if(!s)return;const n=M(i);s.pressKey(n[e])},()=>{if(!s)return;const n=M(i);s.releaseKey(n[e])})});function E(t){m.classList.toggle("hidden",!t)}function x(){l.innerHTML=h?"🔇":"🔊",l.setAttribute("aria-label",h?"Unmute":"Mute")}l.addEventListener("click",()=>{w(),h=!h,x(),s&&s.setMuted(h)});document.addEventListener("pointerdown",()=>{w()},{once:!0});function p(t){document.querySelectorAll(".screen").forEach(e=>e.classList.remove("active")),t?.classList.add("active")}function T(t,e,n,a){t.querySelectorAll(e).forEach(d=>{d.classList.toggle("active",d.dataset[a]===n)})}function N(){const t=document.getElementById("device-hint"),e=document.getElementById("title-subtitle");!t||!e||(r==="laptop"?(e.textContent="Same-screen 2-player adventure!",t.textContent="Laptop: Harbin uses WASD, Agam uses arrow keys. Both play at the same time."):r==="ipad"?(e.textContent="Single-player touch adventure!",t.textContent="iPad: one player with on-screen buttons. Pick Harbin or Agam next."):(e.textContent="Single-player touch adventure!",t.textContent="Phone: one player with on-screen buttons. Pick Harbin or Agam next."))}function D(){const t=A(r),e=i==="harbin"?"Harbin":"Agam",n=i==="harbin"?"#00CED1":"#FFA500";t?u.innerHTML=`
      <h1 class="title">How to Play</h1>
      <p class="subtitle" style="color:${n};">You are ${e}!</p>
      <div class="controls">
        <div class="player-controls">
          <h3>Touch buttons</h3>
          <div class="control-item"><span class="key">◀ ▶</span><span>Move</span></div>
          <div class="control-item"><span class="key">JUMP</span><span>Jump</span></div>
          <div class="control-item"><span class="key">ACTION</span><span>Open the door</span></div>
        </div>
      </div>
      <div class="instructions">
        <ul class="instruction-list">
          <li><span class="emoji">🏃</span> Move and jump with the big buttons</li>
          <li><span class="emoji">⭐</span> Grab the sparkling stars</li>
          <li><span class="emoji">🧡</span> Stomp baddies from above. Out of hearts? You restart with full hearts!</li>
          <li><span class="emoji">🔘</span> Press ACTION at the glowing switch to open the door</li>
          <li><span class="emoji">🌈</span> Walk through the rainbow to win!</li>
        </ul>
      </div>
      <button class="button" type="button" id="start-button">START GAME!</button>
    `:u.innerHTML=`
      <h1 class="title">How to Play</h1>
      <p class="subtitle">Both play at the same time — not turns!</p>
      <div class="controls">
        <div class="player-controls" style="background: rgba(0, 206, 209, 0.3);">
          <h3 style="color: #00CED1;">Harbin</h3>
          <div class="control-item"><span class="key">W</span><span>Jump</span></div>
          <div class="control-item"><span class="key">A</span><span>Left</span></div>
          <div class="control-item"><span class="key">D</span><span>Right</span></div>
          <div class="control-item"><span class="key">S</span><span>ACTION - open door</span></div>
        </div>
        <div class="player-controls" style="background: rgba(255, 165, 0, 0.3);">
          <h3 style="color: #FFA500;">Agam</h3>
          <div class="control-item"><span class="key">↑</span><span>Jump</span></div>
          <div class="control-item"><span class="key">←</span><span>Left</span></div>
          <div class="control-item"><span class="key">→</span><span>Right</span></div>
          <div class="control-item"><span class="key">↓</span><span>ACTION - open door</span></div>
        </div>
      </div>
      <div class="instructions">
        <ul class="instruction-list">
          <li><span class="emoji">🏃</span> Move and jump</li>
          <li><span class="emoji">⭐</span> Grab the sparkling stars</li>
          <li><span class="emoji">🧡</span> Stomp baddies from above. Out of hearts? You restart with full hearts!</li>
          <li><span class="emoji">🔘</span> Press ACTION at the glowing switch to open the door</li>
          <li><span class="emoji">🌈</span> Walk through the rainbow to win!</li>
        </ul>
      </div>
      <button class="button" type="button" id="start-button">START GAME!</button>
    `,document.getElementById("start-button")?.addEventListener("click",()=>{p(null),w(),I()})}function C(){T(c,"[data-device]",r,"device"),T(c,"[data-difficulty]",L,"difficulty"),N()}c.querySelectorAll("[data-device]").forEach(t=>{t.addEventListener("click",()=>{r=t.dataset.device,C()})});c.querySelectorAll("[data-difficulty]").forEach(t=>{t.addEventListener("click",()=>{L=t.dataset.difficulty,C()})});document.getElementById("play-button")?.addEventListener("click",()=>{w(),A(r)?p(b):(D(),p(u))});b.querySelectorAll("[data-character]").forEach(t=>{t.addEventListener("click",()=>{i=t.dataset.character,D(),p(u)})});document.getElementById("play-again-button")?.addEventListener("click",()=>{p(null),I()});document.getElementById("home-button")?.addEventListener("click",()=>{s&&(s.destroy(),s=null),g=!1,E(!1),document.body.classList.remove("playing","playing-touch"),p(c)});function I(){s&&s.destroy();const t=H(r);g=!0,document.body.classList.add("playing"),document.body.classList.toggle("playing-touch",t==="1p"),E(t==="1p"),s=new S(k,L,h,(e,n)=>{g=!1,E(!1),document.body.classList.remove("playing","playing-touch"),B(e,n)},t,i),window.__haGame=s,s.start()}function B(t,e){const n=document.getElementById("win-stats");if(H(r)==="1p"){const a=i==="harbin"?"Harbin":"Agam",d=i==="harbin"?"#00CED1":"#FFA500",v=i==="harbin"?t:e;n.innerHTML=`
      <div style="color: ${d};">Well done ${a}!</div>
      <div style="color: ${d};">${a} collected ${v} stars!</div>
    `}else n.innerHTML=`
      <div style="color: #00CED1;">Harbin collected ${t} stars!</div>
      <div style="color: #FFA500;">Agam collected ${e} stars!</div>
      <div style="margin-top: 20px;">Total: ${t+e} stars! ⭐</div>
    `;p(f)}document.addEventListener("touchmove",t=>{g&&t.preventDefault()},{passive:!1});document.addEventListener("gesturestart",t=>t.preventDefault());document.addEventListener("gesturechange",t=>t.preventDefault());document.addEventListener("gestureend",t=>t.preventDefault());C();
