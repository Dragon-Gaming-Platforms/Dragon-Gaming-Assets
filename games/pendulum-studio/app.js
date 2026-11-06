(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('scene');
  const ctx = canvas.getContext('2d');
  const angle = $('angle'), length = $('length'), gravity = $('gravity'), damping = $('damping');
  const state = { theta: 55 * Math.PI / 180, omega: 0, time: 0, trace: [], running: false, raf: 0, generation: 0, last: 0, dragging: false };
  const dt = 1 / 120;
  const outputs = { angle: $('angle-out'), length: $('length-out'), gravity: $('gravity-out'), damping: $('damping-out') };
  const reads = { angle: $('angle-read'), speed: $('speed-read'), energy: $('energy-read') };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function reset() { state.theta = Number(angle.value) * Math.PI / 180; state.omega = 0; state.time = 0; state.trace = []; draw(); update(); $('status').textContent = 'Reset to the selected release angle.'; }
  function updateLabels() { outputs.angle.textContent = `${angle.value}°`; outputs.length.textContent = `${Number(length.value).toFixed(1)} m`; outputs.gravity.textContent = `${Number(gravity.value).toFixed(1)} m/s²`; outputs.damping.textContent = Number(damping.value).toFixed(2); }
  function advance(seconds) {
    const steps = Math.max(1, Math.round(seconds / dt));
    for (let i = 0; i < steps; i += 1) {
      const acceleration = -(Number(gravity.value) / Number(length.value)) * Math.sin(state.theta) - Number(damping.value) * state.omega;
      state.omega += acceleration * dt;
      state.theta += state.omega * dt;
      state.time += dt;
      if (i % 3 === 0) state.trace.push(state.theta);
    }
    if (state.trace.length > 260) state.trace.splice(0, state.trace.length - 260);
  }
  function draw() {
    const w = canvas.width, h = canvas.height, cx = w * 0.5, cy = 92;
    ctx.fillStyle = '#0a131a'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1b2d36'; ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 40; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const bobLength = Number(length.value) * 72;
    const bx = cx + Math.sin(state.theta) * bobLength;
    const by = cy + Math.cos(state.theta) * bobLength;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.strokeStyle = '#c5d9d0'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fillStyle = '#f2c574'; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fillStyle = '#76d8bd'; ctx.shadowColor = '#76d8bd88'; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.strokeStyle = '#d8fff1'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#9bb1b6'; ctx.font = '12px system-ui'; ctx.fillText('PIVOT', cx + 13, cy + 4);
    const graph = { x: 28, y: h - 90, w: w - 56, h: 52 };
    ctx.fillStyle = '#101d24'; ctx.fillRect(graph.x, graph.y, graph.w, graph.h);
    ctx.strokeStyle = '#2a3f48'; ctx.beginPath(); ctx.moveTo(graph.x, graph.y + graph.h / 2); ctx.lineTo(graph.x + graph.w, graph.y + graph.h / 2); ctx.stroke();
    if (state.trace.length > 1) {
      ctx.beginPath(); state.trace.forEach((theta, i) => { const x = graph.x + i / (state.trace.length - 1) * graph.w; const y = graph.y + graph.h / 2 - theta / Math.PI * graph.h * 0.42; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.strokeStyle = '#8de2c4'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.fillStyle = '#96aeb1'; ctx.font = '10px ui-monospace, monospace'; ctx.fillText('ANGLE TRACE', graph.x, graph.y - 7);
    update();
  }
  function update() {
    updateLabels();
    const deg = state.theta * 180 / Math.PI;
    const energy = 0.5 * (Number(length.value) ** 2) * state.omega ** 2 + Number(gravity.value) * Number(length.value) * (1 - Math.cos(state.theta));
    reads.angle.textContent = `${deg.toFixed(1)}°`; reads.speed.textContent = `${state.omega.toFixed(2)} rad/s`; reads.energy.textContent = `${energy.toFixed(2)} J/kg`;
    $('run-state').textContent = state.running ? 'RUNNING' : 'PAUSED'; $('toggle').textContent = state.running ? 'Ⅱ Pause' : '▶ Start'; $('step').disabled = state.running;
  }
  function frame(now, generation) {
    if (generation !== state.generation) return;
    state.raf = 0;
    if (!state.running) return;
    if (state.last) advance(Math.min(0.04, (now - state.last) / 1000));
    state.last = now;
    draw();
    state.raf = requestAnimationFrame((time) => frame(time, generation));
  }
  function setRunning(on) {
    if (state.running === on) return;
    state.running = on;
    state.generation += 1;
    state.last = 0;
    if (on) {
      const generation = state.generation;
      state.raf = requestAnimationFrame((time) => frame(time, generation));
    } else {
      if (state.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
    $('status').textContent = on ? 'Running at a fixed physics step.' : 'Paused. Step or change the setup.';
    update();
  }
  $('toggle').addEventListener('click', () => setRunning(!state.running));
  $('step').addEventListener('click', () => { if (!state.running) { advance(0.1); draw(); $('status').textContent = 'Advanced 0.1 simulated seconds.'; } });
  $('reset').addEventListener('click', reset);
  angle.addEventListener('input', () => { state.theta = Number(angle.value) * Math.PI / 180; state.omega = 0; state.trace = []; draw(); });
  [length, gravity, damping].forEach((input) => input.addEventListener('input', () => { draw(); }));
  canvas.addEventListener('pointerdown', (event) => { const rect = canvas.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width * canvas.width; const y = (event.clientY - rect.top) / rect.height * canvas.height; const bx = canvas.width/2 + Math.sin(state.theta) * Number(length.value)*72; const by = 92 + Math.cos(state.theta) * Number(length.value)*72; if (Math.hypot(x-bx,y-by) < 34) { state.dragging = true; setRunning(false); if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId); $('status').textContent = 'Drag the bob to set its release angle.'; update(); } });
  canvas.addEventListener('pointermove', (event) => { if (!state.dragging) return; const rect=canvas.getBoundingClientRect(); const x=(event.clientX-rect.left)/rect.width*canvas.width-canvas.width/2; const y=(event.clientY-rect.top)/rect.height*canvas.height-92; state.theta=Math.atan2(x,y); angle.value=String(Math.round(Math.abs(state.theta)*180/Math.PI)); state.omega=0; state.trace=[]; draw(); });
  const release=()=>{ if(state.dragging){state.dragging=false; $('status').textContent='New release angle set. Press Start to let it swing.';} };
  canvas.addEventListener('pointerup',release); canvas.addEventListener('pointercancel',release); canvas.addEventListener('lostpointercapture',release);
  document.addEventListener('keydown',(event)=>{if(event.code==='Space'&&!['INPUT','BUTTON'].includes(event.target?.tagName)){event.preventDefault();$('toggle').click();}});
  reset();
})();
