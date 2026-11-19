(() => {
  "use strict";

  // Keplerian orbit lab. The satellite's position comes from solving Kepler's
  // equation M = E - e*sin(E) for the eccentric anomaly E (Newton's method),
  // then converting to true anomaly. Velocities use vis-viva. The ground
  // track subtracts Earth's rotation from the inertial longitude.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 390 };
  const TRACK = { x: 26, y: 470, w: 828, h: 150 };

  const MU = 398600; // km^3/s^2
  const RE = 6371; // km
  const OMEGA_E = (2 * Math.PI) / 86164; // Earth rotation, rad/s (sidereal day)

  const PRESETS = {
    leo: { label: "LEO", a: 1.1, e: 0.01, i: 53 },
    iss: { label: "ISS", a: 1.065, e: 0.001, i: 51.6 },
    geo: { label: "GEO", a: 6.61, e: 0.001, i: 0 },
    molniya: { label: "Molniya", a: 4.15, e: 0.72, i: 63.4 },
    gto: { label: "GTO", a: 3.8, e: 0.73, i: 28.5 },
  };

  const state = {
    a: 1.1, // Earth radii
    e: 0.01,
    inc: 51.6, // degrees
    speed: 60, // time scale
    playing: true,
    showTrack: true,
    t: 0, // sim seconds
    preset: "leo",
    track: [], // {lon, lat}
    trail: [], // {x, y} orbit trail
    statusKind: "",
  };

  /* ------------------------------------------------------------- orbital maths */

  function periodSec(aRe) {
    const aKm = aRe * RE;
    return 2 * Math.PI * Math.sqrt((aKm * aKm * aKm) / MU);
  }

  function solveKepler(M, e) {
    // Newton iterations on E - e*sin(E) = M
    let E = M;
    for (let k = 0; k < 12; k++) {
      const f = E - e * Math.sin(E) - M;
      const fp = 1 - e * Math.cos(E);
      const d = f / fp;
      E -= d;
      if (Math.abs(d) < 1e-12) break;
    }
    return E;
  }

  function positionAt(aRe, e, tSec) {
    const T = periodSec(aRe);
    const n = (2 * Math.PI) / T;
    let M = (n * tSec) % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;
    const E = solveKepler(M, e);
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    const rRe = aRe * (1 - e * Math.cos(E));
    const rKm = rRe * RE;
    const aKm = aRe * RE;
    const v = Math.sqrt(MU * (2 / rKm - 1 / aKm));
    return { nu, rRe, rKm, v, M, E };
  }

  function groundPoint(aRe, e, incDeg, tSec) {
    const { nu } = positionAt(aRe, e, tSec);
    const inc = (incDeg * Math.PI) / 180;
    const lat = Math.asin(Math.sin(inc) * Math.sin(nu));
    let lon = Math.atan2(Math.cos(inc) * Math.sin(nu), Math.cos(nu)) - OMEGA_E * tSec;
    while (lon > Math.PI) lon -= 2 * Math.PI;
    while (lon < -Math.PI) lon += 2 * Math.PI;
    return { lon, lat };
  }

  function derived(aRe, e) {
    const aKm = aRe * RE;
    const T = periodSec(aRe);
    const apoKm = aKm * (1 + e);
    const periKm = aKm * (1 - e);
    const vPeri = Math.sqrt((MU * (1 + e)) / (aKm * (1 - e)));
    const vApo = Math.sqrt((MU * (1 - e)) / (aKm * (1 + e)));
    return { T, apoAlt: apoKm - RE, periAlt: periKm - RE, vPeri, vApo };
  }

  /* ------------------------------------------------------------------- drawing */

  function orbitScale() {
    const maxR = state.a * (1 + state.e);
    return (Math.min(STAGE.w, STAGE.h) / 2 / maxR) * 0.94;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const scale = orbitScale();
    const cx = STAGE.x + STAGE.w / 2;
    const cy = STAGE.y + STAGE.h / 2;
    const aPx = state.a * scale;
    const cPx = state.a * state.e * scale;

    // stars
    ctx.fillStyle = "#0a1420";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
    ctx.fillStyle = "rgba(160,200,240,0.5)";
    for (let k = 0; k < 60; k++) {
      const sx = STAGE.x + ((k * 137.5) % STAGE.w);
      const sy = STAGE.y + ((k * 89.3) % STAGE.h);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // orbit ellipse (Earth at focus: centre offset by c to the right)
    ctx.strokeStyle = "#7cc4ff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx + cPx, cy, aPx, aPx * Math.sqrt(Math.max(0, 1 - state.e * state.e)), 0, 0, Math.PI * 2);
    ctx.stroke();

    // apoapsis / periapsis markers
    ctx.fillStyle = "#8296a9";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("periapsis", cx + cPx - aPx, cy + 16);
    ctx.fillText("apoapsis", cx + cPx + aPx, cy + 16);

    // Earth
    const earthR = Math.max(4, scale * 1);
    const g = ctx.createRadialGradient(cx - earthR * 0.3, cy - earthR * 0.3, earthR * 0.2, cx, cy, earthR);
    g.addColorStop(0, "#7cc4ff");
    g.addColorStop(1, "#1d4e79");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(124,196,255,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // satellite trail
    ctx.strokeStyle = "rgba(255,209,102,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    state.trail.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.stroke();

    // satellite
    const pos = positionAt(state.a, state.e, state.t);
    const sx = cx + pos.rRe * scale * Math.cos(pos.nu);
    const sy = cy + pos.rRe * scale * Math.sin(pos.nu);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,209,102,0.5)";
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.stroke();

    // ground track
    if (state.showTrack) {
      ctx.fillStyle = "#071018";
      ctx.fillRect(TRACK.x, TRACK.y, TRACK.w, TRACK.h);
      ctx.strokeStyle = "rgba(124,196,255,0.18)";
      ctx.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 60) {
        const x = TRACK.x + ((lon + 180) / 360) * TRACK.w;
        ctx.beginPath(); ctx.moveTo(x, TRACK.y); ctx.lineTo(x, TRACK.y + TRACK.h); ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = TRACK.y + ((90 - lat) / 180) * TRACK.h;
        ctx.beginPath(); ctx.moveTo(TRACK.x, y); ctx.lineTo(TRACK.x + TRACK.w, y); ctx.stroke();
      }
      ctx.strokeStyle = "#6ff0c8";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let prevLon = null;
      state.track.forEach((p) => {
        const x = TRACK.x + ((p.lon * 180 / Math.PI + 180) / 360) * TRACK.w;
        const y = TRACK.y + ((90 - p.lat * 180 / Math.PI) / 180) * TRACK.h;
        if (prevLon === null || Math.abs(p.lon - prevLon) > Math.PI) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        prevLon = p.lon;
      });
      ctx.stroke();
      ctx.fillStyle = "#8296a9";
      ctx.textAlign = "left";
      ctx.fillText("ground track (lon →, lat ↑)", TRACK.x + 6, TRACK.y + 14);
    }

    // labels
    ctx.fillStyle = "#8296a9";
    ctx.textAlign = "left";
    ctx.fillText("orbit (Earth at focus)", STAGE.x + 6, STAGE.y + 14);
  }

  /* ------------------------------------------------------------------ readouts */

  function fmt(x, d) {
    return Number(x).toFixed(d === undefined ? 2 : d);
  }

  function updateReadouts() {
    const d = derived(state.a, state.e);
    const pos = positionAt(state.a, state.e, state.t);
    const gp = groundPoint(state.a, state.e, state.inc, state.t);
    const altKm = pos.rKm - RE;
    const latDeg = (gp.lat * 180) / Math.PI;

    el("a-out").textContent = fmt(state.a, 2) + " R⊕";
    el("e-out").textContent = fmt(state.e, 3);
    el("i-out").textContent = fmt(state.inc, 1) + "°";
    el("speed-out").textContent = state.speed + "×";

    el("period-hud").textContent = "period " + fmt(d.T / 60, 1) + " min";
    el("alt-hud").textContent = "alt " + Math.round(altKm) + " km";
    el("vel-hud").textContent = "v " + fmt(pos.v, 2) + " km/s";

    el("period-read").textContent = fmt(d.T / 60, 1) + " min";
    el("apo-read").textContent = Math.round(d.apoAlt) + " km";
    el("peri-read").textContent = Math.round(d.periAlt) + " km";
    el("vperi-read").textContent = fmt(d.vPeri, 2) + " km/s";
    el("vapo-read").textContent = fmt(d.vApo, 2) + " km/s";
    el("alt-read").textContent = Math.round(altKm) + " km";
    el("vel-read").textContent = fmt(pos.v, 2) + " km/s";
    el("lat-read").textContent = fmt(latDeg, 1) + "°";
  }

  function describe() {
    const d = derived(state.a, state.e);
    const ratio = d.vPeri / d.vApo;
    let msg;
    if (state.e < 0.02) {
      msg = "Nearly circular: the velocity barely changes around the orbit (" + fmt(ratio, 2) + "× between periapsis and apoapsis). The period is " + fmt(d.T / 60, 1) + " min — Kepler's third law in action.";
    } else if (state.e > 0.5) {
      msg = "Highly elliptical: the satellite screams through periapsis at " + fmt(d.vPeri, 1) + " km/s and crawls at apoapsis (" + fmt(d.vApo, 1) + " km/s) — " + fmt(ratio, 1) + "× slower. Most of the " + fmt(d.T / 60, 0) + " min period is spent far from Earth.";
    } else {
      msg = "Moderately elliptical: periapsis velocity " + fmt(d.vPeri, 2) + " km/s vs apoapsis " + fmt(d.vApo, 2) + " km/s. Vis-viva trades speed for altitude as the satellite climbs.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function clampE() {
    const eMax = 1 - 1.02 / state.a;
    if (state.e > eMax) {
      state.e = Math.max(0, eMax);
      el("e").value = String(state.e);
    }
  }

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.a = p.a;
    state.e = p.e;
    state.inc = p.i;
    state.t = 0;
    state.track = [];
    state.trail = [];
    el("a").value = String(p.a);
    el("e").value = String(p.e);
    el("i").value = String(p.i);
    ["leo", "iss", "geo", "molniya", "gto"].forEach((k) => {
      el("preset-" + k).classList.toggle("active", k === name);
    });
    clampE();
    updateReadouts();
    describe();
    draw();
  }

  el("a").addEventListener("input", (evt) => {
    state.a = Math.max(1.05, Math.min(7, Number(evt.target.value) || 1.1));
    state.preset = "";
    ["leo", "iss", "geo", "molniya", "gto"].forEach((k) => el("preset-" + k).classList.remove("active"));
    clampE();
    updateReadouts();
    describe();
    draw();
  });
  el("e").addEventListener("input", (evt) => {
    state.e = Math.max(0, Math.min(0.9, Number(evt.target.value) || 0));
    clampE();
    updateReadouts();
    describe();
    draw();
  });
  el("i").addEventListener("input", (evt) => {
    state.inc = Math.max(0, Math.min(90, Number(evt.target.value) || 0));
    updateReadouts();
    describe();
    draw();
  });
  el("speed").addEventListener("input", (evt) => {
    state.speed = Math.max(1, Math.min(600, Number(evt.target.value) || 60));
    updateReadouts();
    draw();
  });

  el("preset-leo").addEventListener("click", () => setPreset("leo"));
  el("preset-iss").addEventListener("click", () => setPreset("iss"));
  el("preset-geo").addEventListener("click", () => setPreset("geo"));
  el("preset-molniya").addEventListener("click", () => setPreset("molniya"));
  el("preset-gto").addEventListener("click", () => setPreset("gto"));

  el("toggle-play").addEventListener("click", () => {
    state.playing = !state.playing;
    el("toggle-play").textContent = state.playing ? "Pause" : "Play";
    el("toggle-play").classList.toggle("active", state.playing);
  });
  el("toggle-track").addEventListener("click", () => {
    state.showTrack = !state.showTrack;
    el("toggle-track").classList.toggle("active", state.showTrack);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("leo");
    else if (evt.key === "2") setPreset("iss");
    else if (evt.key === "3") setPreset("geo");
    else if (evt.key === "4") setPreset("molniya");
    else if (evt.key === "5") setPreset("gto");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("toggle-play").click();
    } else if (evt.key === "t" || evt.key === "T") {
      el("toggle-track").click();
    }
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.playing) {
      state.t += dt * state.speed;
      // record ground track + trail
      const gp = groundPoint(state.a, state.e, state.inc, state.t);
      state.track.push(gp);
      const T = periodSec(state.a);
      const maxPts = Math.floor(T / 10) + 200;
      if (state.track.length > maxPts) state.track.splice(0, state.track.length - maxPts);
      const scale = orbitScale();
      const cx = STAGE.x + STAGE.w / 2;
      const cy = STAGE.y + STAGE.h / 2;
      const pos = positionAt(state.a, state.e, state.t);
      state.trail.push([cx + pos.rRe * scale * Math.cos(pos.nu), cy + pos.rRe * scale * Math.sin(pos.nu)]);
      if (state.trail.length > 400) state.trail.splice(0, state.trail.length - 400);
      updateReadouts();
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PRESETS,
    periodSec,
    solveKepler,
    positionAt,
    groundPoint,
    derived,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  updateReadouts();
  describe();
  draw();
  requestAnimationFrame(frame);
})();
