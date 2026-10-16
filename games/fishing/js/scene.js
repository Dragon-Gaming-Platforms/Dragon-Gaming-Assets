// The WebGL2 renderer. Reads game state, draws the world, owns the camera.
// Nothing here mutates the simulation.

import { WORLD, CAST, SPECIES } from './config.js';
import { game, isNight, dayFraction, ROD_TIP, lerp as flerp } from './game.js';
import {
  mat4, perspective, lookAt, multiply, compose, normalMatrix, v3, lerp, clamp, hexToRgb,
} from './gl/math.js';
import { createProgram, uploadMesh, createDynamic, flushDynamic } from './gl/glutil.js';
import * as S from './gl/shaders.js';
import {
  buildSpecies, buildBoat, buildLanternGlass, buildSeabed, buildRock, buildWeed,
  buildWaterGrid, seabedHeight,
} from './gl/meshes.js';

const FOV = 1.06;
const NEAR = 0.12;
const FAR = 420;

/* ------------------------------------------------------------------ palette */

const KEYS = [
  { f: 0.00, zenith: '#2c3c66', horizon: '#f0a878', ground: '#4a3a4a', sun: '#ffcb9c', amb: '#48527a', water: '#2d6480', night: 0.35 },
  { f: 0.12, zenith: '#3f7fc4', horizon: '#cfe7f6', ground: '#7f9ab0', sun: '#fff3d8', amb: '#6a7d9c', water: '#2f7fa6', night: 0.0 },
  { f: 0.40, zenith: '#2d78cc', horizon: '#a8d8f2', ground: '#7492ab', sun: '#fffaf0', amb: '#6e83a4', water: '#2a86b8', night: 0.0 },
  { f: 0.55, zenith: '#3c5c95', horizon: '#f2a868', ground: '#5a4a55', sun: '#ffc79a', amb: '#565f82', night: 0.22, water: '#33697f' },
  { f: 0.66, zenith: '#16203f', horizon: '#5c3e66', ground: '#241c30', sun: '#9a86b4', amb: '#333c5e', night: 0.88, water: '#1c3552' },
  { f: 0.82, zenith: '#080d20', horizon: '#141f3d', ground: '#0d1424', sun: '#8390bc', amb: '#2b3352', night: 1.0, water: '#13273e' },
  { f: 0.94, zenith: '#111b3a', horizon: '#3c4672', ground: '#1b2138', sun: '#b0a6c8', amb: '#333b5c', night: 0.7, water: '#1c3552' },
  { f: 1.00, zenith: '#2c3c66', horizon: '#f0a878', ground: '#4a3a4a', sun: '#ffcb9c', amb: '#48527a', water: '#2d6480', night: 0.35 },
];

const mixRgb = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export function palette(f = dayFraction()) {
  let a = KEYS[0], b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (f >= KEYS[i].f && f <= KEYS[i + 1].f) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  }
  const t = b.f === a.f ? 0 : (f - a.f) / (b.f - a.f);
  return {
    zenith: mixRgb(hexToRgb(a.zenith), hexToRgb(b.zenith), t),
    horizon: mixRgb(hexToRgb(a.horizon), hexToRgb(b.horizon), t),
    ground: mixRgb(hexToRgb(a.ground), hexToRgb(b.ground), t),
    sun: mixRgb(hexToRgb(a.sun), hexToRgb(b.sun), t),
    amb: mixRgb(hexToRgb(a.amb), hexToRgb(b.amb), t),
    water: mixRgb(hexToRgb(a.water), hexToRgb(b.water), t),
    night: lerp(a.night, b.night, t),
  };
}

/* -------------------------------------------------------------------- scatter */

// R2 low-discrepancy placement. A modular stride would rule the props into
// visible diagonals as soon as there are more than a handful.
function scatter(n, span, seedOffset) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const u = ((i + seedOffset) * 0.7548776662466927) % 1;
    const v = ((i + seedOffset) * 0.5698402909980532) % 1;
    const w = ((i + seedOffset) * 0.2354477382845685) % 1;
    const x = (u - 0.5) * span;
    const z = (v - 0.5) * span;
    out.push({ x, z, y: seabedHeight(x, z), s: 0.5 + w * 1.6, r: w * 6.28 });
  }
  return out;
}

/* --------------------------------------------------------------------- scene */

export function createScene(gl) {
  gl.getExtension('EXT_color_buffer_float');

  const progs = {
    sky: createProgram(gl, S.SKY_VS, S.SKY_FS, 'sky'),
    lit: createProgram(gl, S.LIT_VS, S.LIT_FS, 'lit'),
    water: createProgram(gl, S.WATER_VS, S.WATER_FS, 'water'),
    glow: createProgram(gl, S.GLOW_VS, S.GLOW_FS, 'glow'),
    flat: createProgram(gl, S.FLAT_VS, S.FLAT_FS, 'flat'),
  };

  const fishMesh = Object.create(null);
  for (const sp of SPECIES) fishMesh[sp.id] = uploadMesh(gl, buildSpecies(sp));
  const boat = uploadMesh(gl, buildBoat());
  const lantern = uploadMesh(gl, buildLanternGlass());
  const seabed = uploadMesh(gl, buildSeabed());
  const rock = uploadMesh(gl, buildRock());
  const weed = uploadMesh(gl, buildWeed());
  const water = uploadMesh(gl, buildWaterGrid(96, 170));
  const skyTri = uploadMesh(gl, {
    position: new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
    index: new Uint16Array([0, 1, 2]),
  });

  const rocks = scatter(40, 130, 3);
  // R2 again, in three dimensions, so the flakes do not sit on a lattice.
  const snow = [];
  for (let i = 1; i <= 420; i++) {
    snow.push([
      (((i * 0.8191725133961644) % 1) - 0.5) * 44,
      (((i * 0.6710436067037893) % 1) - 0.5) * 31,
      (((i * 0.5497004779019702) % 1) - 0.5) * 44,
      0.030 + ((i * 0.2354477382845685) % 1) * 0.075,
    ]);
  }
  const wrap = (v, centre, half) => {
    const d = v - centre;
    return centre + d - Math.floor((d + half) / (half * 2)) * half * 2;
  };
  const weeds = scatter(64, 120, 17);

  const sprites = createDynamic(gl, [
    { loc: 0, size: 3 }, { loc: 1, size: 4 }, { loc: 2, size: 2 },
  ], 6 * 1400);
  const ribbon = createDynamic(gl, [{ loc: 0, size: 3 }, { loc: 1, size: 4 }], 6 * 120);

  // Reusable scratch so the frame loop allocates nothing.
  const proj = mat4(), view = mat4(), viewProj = mat4();
  const model = mat4(), nrm = mat4();
  const eye = new Float32Array([-7.2, 3.9, 7.6]);
  const look = new Float32Array([5.5, 0.4, 0]);
  const wantEye = new Float32Array(3), wantLook = new Float32Array(3);
  const camRight = new Float32Array(3), camUp = new Float32Array(3), camFwd = new Float32Array(3);
  const tmpA = new Float32Array(3), tmpB = new Float32Array(3);
  const UP = new Float32Array([0, 1, 0]);
  const sunDir = new Float32Array(3), moonDir = new Float32Array(3);

  let first = true;

  function desired(pal) {
    const g = game;
    if (g.phase === 'title' || g.phase === 'aiming' || g.phase === 'result') {
      const reach = flerp(CAST.minRange, CAST.maxRange, g.power);
      const sway = Math.sin(g.t * 0.16) * 1.6;
      v3.set(wantLook, 3.0 + reach * 0.28, 0.55, 0);
      v3.set(wantEye, -7.4, 4.1, 8.4 + sway);
      if (g.phase === 'result' && g.trophy) {
        // Aim past the fish, not at it: the catch card owns the middle of the
        // screen, so the subject has to sit in the left third.
        const t2 = g.trophy.p;
        v3.set(wantEye, t2[0] - 3.4, t2[1] + 1.5, t2[2] + 4.3);
        v3.set(wantLook, t2[0] + 2.0, t2[1] - 0.55, t2[2] + 1.8);
      } else if (g.phase === 'result') {
        v3.set(wantLook, 3.4, 0.2, 1.6);
        v3.set(wantEye, -4.4, 2.3, 6.2);
      }
      return;
    }
    if (g.phase === 'casting') {
      v3.set(wantLook, g.hook[0] * 0.7 + 1.5, 0.5, g.hook[2] * 0.5);
      v3.set(wantEye, -6.2, 4.2, 8.8);
      return;
    }
    const f = (g.phase === 'reeling' && g.target) ? g.target.p : g.hook;
    const near = g.phase === 'reeling' ? 1 : 0;
    v3.set(wantLook, f[0], Math.min(-0.9, f[1] - 0.45), f[2]);
    // Kept close to the world x axis on purpose: screen-right stays world +x,
    // so left/right steering means what the player expects. The ceiling keeps
    // the eye under the surface: a camera sitting in the interface sees the
    // horizon instead of the water, and the fog picks the wrong side.
    v3.set(wantEye,
      f[0] - lerp(2.6, 1.8, near),
      Math.min(-1.15, f[1] + lerp(1.9, 1.35, near)) + Math.sin(g.t * 0.5) * 0.12,
      f[2] + lerp(10.2, 6.6, near));
  }

  function setCamera(dt, pal) {
    desired(pal);
    const rate = first ? 1 : Math.min(1, dt * (game.phase === 'result' ? 3.4 : game.submerged ? 5.2 : 2.6));
    first = false;
    v3.lerp(eye, eye, wantEye, rate);
    v3.lerp(look, look, wantLook, rate);
    // Never let the eye sit exactly on the surface: the water is a blended
    // interface and a camera inside it flickers between the two shadings.
    if (Math.abs(eye[1]) < 0.16) eye[1] = eye[1] >= 0 ? 0.16 : -0.16;
  }

  function frameUniforms(pal, aspect, shake) {
    perspective(proj, FOV, aspect, NEAR, FAR);
    let ex = eye[0], ey = eye[1], ez = eye[2];
    if (shake > 0) {
      ex += Math.sin(game.t * 61) * shake;
      ey += Math.cos(game.t * 47) * shake;
    }
    v3.set(tmpA, ex, ey, ez);
    lookAt(view, tmpA, look, UP);
    multiply(viewProj, proj, view);
    // Camera basis, straight out of the view matrix's rows.
    v3.set(camRight, view[0], view[4], view[8]);
    v3.set(camUp, view[1], view[5], view[9]);
    v3.set(camFwd, -view[2], -view[6], -view[10]);
    return tmpA;
  }

  function lightDirs() {
    const f = dayFraction();
    const t = clamp((f - 0.02) / 0.58, 0, 1);
    v3.norm(sunDir, [Math.cos(t * Math.PI), Math.max(0.06, Math.sin(t * Math.PI) * 0.98), 0.34]);
    const mt = clamp(((f + 0.5) % 1 - 0.02) / 0.58, 0, 1);
    v3.norm(moonDir, [Math.cos(mt * Math.PI), Math.max(0.06, Math.sin(mt * Math.PI) * 0.98), -0.30]);
  }

  /* ------------------------------------------------------------ sprite batch */

  function resetSprites() { sprites.count = 0; }

  function pushSprite(cx, cy, cz, size, r, g, b, a) {
    if (sprites.count + 6 > sprites.maxVerts) return;
    const rx = camRight[0] * size, ry = camRight[1] * size, rz = camRight[2] * size;
    const ux = camUp[0] * size, uy = camUp[1] * size, uz = camUp[2] * size;
    const d = sprites.data;
    let o = sprites.count * 9;
    const corner = (sx, sy) => {
      d[o] = cx + rx * sx + ux * sy;
      d[o + 1] = cy + ry * sx + uy * sy;
      d[o + 2] = cz + rz * sx + uz * sy;
      d[o + 3] = r; d[o + 4] = g; d[o + 5] = b; d[o + 6] = a;
      d[o + 7] = sx; d[o + 8] = sy;
      o += 9;
    };
    corner(-1, -1); corner(1, -1); corner(1, 1);
    corner(-1, -1); corner(1, 1); corner(-1, 1);
    sprites.count += 6;
  }

  // A vertical curtain that turns to face the camera: the light shafts. Built
  // as two quads meeting on a bright centre line, so the beam fades out
  // sideways as well as downwards -- one flat quad reads as a painted stripe.
  function pushShaft(cx, cz, topY, height, halfW, r, g, b, a) {
    if (sprites.count + 12 > sprites.maxVerts) return;
    v3.set(tmpB, cx - eye[0], 0, cz - eye[2]);
    const l = Math.hypot(tmpB[0], tmpB[2]) || 1;
    const sx = (-tmpB[2] / l) * halfW, sz = (tmpB[0] / l) * halfW;
    const d = sprites.data;
    let o = sprites.count * 9;
    const vtx = (side, down, alpha, spread) => {
      d[o] = cx + sx * side * spread;
      d[o + 1] = topY - height * down;
      d[o + 2] = cz + sz * side * spread;
      d[o + 3] = r; d[o + 4] = g; d[o + 5] = b; d[o + 6] = alpha;
      d[o + 7] = 0; d[o + 8] = 0;
      o += 9;
    };
    for (const side of [-1, 1]) {
      vtx(side, 0, 0, 1); vtx(0, 0, a, 0); vtx(0, 1, 0, 0);
      vtx(side, 0, 0, 1); vtx(0, 1, 0, 0); vtx(side, 1, 0, 2.4);
    }
    sprites.count += 12;
  }

  /* --------------------------------------------------------------- the frame */

  function drawMesh(u, mesh, pos, yaw, pitch, roll, sx, sy, sz) {
    compose(model, pos, yaw, pitch, roll, sx, sy, sz);
    normalMatrix(nrm, model);
    gl.uniformMatrix4fv(u.uModel, false, model);
    gl.uniformMatrix4fv(u.uNormalMat, false, nrm);
    gl.bindVertexArray(mesh.vao);
    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
  }

  function render(dt, width, height) {
    const pal = palette();
    const night = isNight();
    lightDirs();
    setCamera(dt, pal);
    const shake = game.shakeUntil > game.t ? (game.shakeUntil - game.t) * 0.5 : 0;
    const camPos = frameUniforms(pal, width / Math.max(1, height), shake);

    const camDepth = Math.max(0, -camPos[1]);
    const under = clamp(camDepth / 1.2, 0, 1);
    const depthN = clamp(camDepth / 62, 0, 1);

    // Fog: aerial haze above the surface, a fast-closing water column below.
    const deepFog = mixRgb(mixRgb(pal.water, [0.02, 0.05, 0.10], 0.55), [0.01, 0.02, 0.05], depthN * 0.85);
    const fogColor = mixRgb(pal.horizon, deepFog, under);
    const fogDensity = lerp(0.0016, lerp(0.020, 0.050, depthN), under);
    // Lifted well above what a flat renderer would want: everything below is
    // albedo, and ambient is the term that decides whether the dark end of the
    // palette survives at all.
    const ambient = mixRgb(pal.amb, mixRgb(pal.amb, [0.13, 0.20, 0.29], 0.45 + depthN * 0.35), under);
    const sunColor = mixRgb(pal.sun, mixRgb(pal.sun, [0.15, 0.3, 0.42], 0.5 + depthN * 0.45), under);

    gl.viewport(0, 0, width, height);
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);

    /* sky */
    {
      const p = progs.sky, u = p.uniforms;
      gl.useProgram(p.program);
      gl.depthMask(false);
      gl.depthFunc(gl.LEQUAL);
      gl.uniform3fv(u.uCamRight, camRight);
      gl.uniform3fv(u.uCamUp, camUp);
      gl.uniform3fv(u.uCamFwd, camFwd);
      const th = Math.tan(FOV / 2);
      gl.uniform2f(u.uRay, th * (width / Math.max(1, height)), th);
      gl.uniform3fv(u.uCamPos, camPos);
      gl.uniform3fv(u.uZenith, pal.zenith);
      gl.uniform3fv(u.uHorizon, pal.horizon);
      gl.uniform3fv(u.uGround, pal.ground);
      gl.uniform3fv(u.uSunDir, sunDir);
      gl.uniform3fv(u.uMoonDir, moonDir);
      gl.uniform3fv(u.uSunColor, pal.sun);
      gl.uniform1f(u.uNight, pal.night);
      gl.uniform1f(u.uUnderwater, under);
      gl.uniform3fv(u.uFogColor, fogColor);
      gl.bindVertexArray(skyTri.vao);
      gl.drawElements(gl.TRIANGLES, skyTri.count, skyTri.type, 0);
      gl.depthMask(true);
      gl.depthFunc(gl.LESS);
    }

    /* lit geometry */
    const p = progs.lit, u = p.uniforms;
    gl.useProgram(p.program);
    gl.uniformMatrix4fv(u.uViewProj, false, viewProj);
    gl.uniform3fv(u.uCamPos, camPos);
    gl.uniform3fv(u.uSunDir, night ? moonDir : sunDir);
    gl.uniform3fv(u.uSunColor, night ? mixRgb(sunColor, [0.45, 0.55, 0.85], 0.55) : sunColor);
    gl.uniform3fv(u.uAmbient, ambient);
    gl.uniform1f(u.uWrap, 0.42);
    gl.uniform3fv(u.uFogColor, fogColor);
    gl.uniform1f(u.uFogDensity, fogDensity);
    gl.uniform3f(u.uAbsorb, 0.34, 0.68, 0.98);
    gl.uniform1f(u.uAbsorbScale, 0.014);
    gl.uniform3f(u.uRim, 0.10 + depthN * 0.22, 0.16 + depthN * 0.28, 0.22 + depthN * 0.34);
    gl.uniform1f(u.uAlpha, 1);
    gl.uniform3f(u.uEmissive, 0, 0, 0);
    gl.uniform1f(u.uEmissiveAmt, 0);
    gl.uniform1f(u.uCaustic, 0);
    gl.uniform3f(u.uBend, 0, 0, 0);

    // One point lamp: the lure while fishing, the boat lantern after dark.
    if (game.submerged) {
      gl.uniform3fv(u.uLampPos, game.hook);
      gl.uniform3f(u.uLampColor, 0.55, 0.82, 1.0);
      gl.uniform1f(u.uLampPower, 2.2 + depthN * 6.5);
    } else if (night) {
      gl.uniform3f(u.uLampPos, 1.23, 1.1, 0);
      gl.uniform3f(u.uLampColor, 1.0, 0.83, 0.5);
      gl.uniform1f(u.uLampPower, 5.5);
    } else {
      gl.uniform1f(u.uLampPower, 0);
    }

    /* seabed and its props */
    if (game.submerged) {
      const bedY = -game.seabed;
      gl.uniform1f(u.uCaustic, game.seabed < 52 ? game.t * 1.2 : 0);
      drawMesh(u, seabed, [0, bedY, 0], 0, 0, 0, 1, 1, 1);
      gl.uniform1f(u.uCaustic, 0);
      for (const r of rocks) {
        if (Math.abs(r.x - camPos[0]) > 62) continue;
        drawMesh(u, rock, [r.x, bedY + r.y - 0.15, r.z], r.r, 0, 0, r.s * 1.5, r.s * 1.1, r.s * 1.5);
      }
      const sway = Math.sin(game.t * 0.7) * 0.12;
      for (const w of weeds) {
        if (Math.abs(w.x - camPos[0]) > 48) continue;
        drawMesh(u, weed, [w.x, bedY + w.y - 0.1, w.z], w.r, 0, sway + Math.sin(game.t * 0.9 + w.r) * 0.1, w.s, w.s * 1.4, w.s);
      }
    }

    /* the boat */
    {
      const bob = Math.sin(game.t * 0.9) * 0.09;
      const roll = Math.sin(game.t * 0.75 + 0.6) * 0.035;
      drawMesh(u, boat, [WORLD.boat.x, bob - 0.05, WORLD.boat.z], 0, Math.sin(game.t * 0.9) * 0.02, roll, 1, 1, 1);
      gl.uniform3f(u.uEmissive, 1.0, 0.86, 0.55);
      gl.uniform1f(u.uEmissiveAmt, night ? 1.5 : 0.15);
      drawMesh(u, lantern, [WORLD.boat.x, bob - 0.05, WORLD.boat.z], 0, Math.sin(game.t * 0.9) * 0.02, roll, 1, 1, 1);
      gl.uniform1f(u.uEmissiveAmt, 0);
    }

    /* creatures */
    for (const f of game.fishes) {
      const sp = f.sp;
      const mesh = fishMesh[sp.id];
      if (!mesh) continue;
      const swim = f.state === 'hooked' ? 1.5 : f.state === 'flee' ? 1.2 : f.state === 'landed' ? 0.5 : 0.75;
      const amp = sp.speed > 0.4 ? 0.055 * swim : 0.012;
      gl.uniform3f(u.uBend, amp, 7.5, f.phase);
      if (sp.glow) {
        const gc = hexToRgb(sp.glow);
        gl.uniform3f(u.uEmissive, gc[0], gc[1], gc[2]);
        gl.uniform1f(u.uEmissiveAmt, 0.14 + 0.06 * Math.sin(game.t * 2 + f.phase));
      }
      drawMesh(u, mesh, f.p, f.yaw, f.pitch, f.roll, f.size, f.size, f.size);
      if (sp.glow) gl.uniform1f(u.uEmissiveAmt, 0);
    }
    gl.uniform3f(u.uBend, 0, 0, 0);

    /* water surface */
    {
      const wp = progs.water, wu = wp.uniforms;
      gl.useProgram(wp.program);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.CULL_FACE);
      gl.uniformMatrix4fv(wu.uViewProj, false, viewProj);
      gl.uniform3fv(wu.uCamPos, camPos);
      gl.uniform1f(wu.uTime, game.t);
      gl.uniform3fv(wu.uSunDir, night ? moonDir : sunDir);
      gl.uniform3fv(wu.uSunColor, night ? [0.6, 0.68, 0.95] : pal.sun);
      // Grazing reflections show the horizon, not the zenith.
      gl.uniform3fv(wu.uSkyColor, mixRgb(pal.horizon, pal.zenith, 0.22));
      gl.uniform3fv(wu.uDeepColor, mixRgb(pal.water, [0.02, 0.06, 0.12], 0.45));
      gl.uniform3fv(wu.uFogColor, fogColor);
      gl.uniform1f(wu.uFogDensity, fogDensity);
      gl.uniform1f(wu.uNight, pal.night);
      gl.bindVertexArray(water.vao);
      gl.drawElements(gl.TRIANGLES, water.count, water.type, 0);
      gl.enable(gl.CULL_FACE);
    }

    /* additive effects */
    resetSprites();
    if (game.submerged) {
      // Shafts hang from the surface wherever the camera is looking.
      const shaftFade = (1 - depthN * 0.85) * (1 - pal.night * 0.8);
      if (shaftFade > 0.02) {
        for (let i = 1; i <= 20; i++) {
          const x = camPos[0] + ((i * 0.7548776662466927) % 1 - 0.5) * 44;
          const z = camPos[2] + ((i * 0.5698402909980532) % 1 - 0.5) * 44 - 14;
          pushShaft(x + Math.sin(game.t * 0.2 + i) * 1.6, z, -0.2, 40, 1.5,
            0.45, 0.76, 1.0, 0.62 * shaftFade);
        }
      }

      // Marine snow: the single strongest cue that this is water and not fog.
      // A fixed cloud, wrapped around the camera so it is never empty.
      const SN = 22;
      for (const s2 of snow) {
        const x = wrap(s2[0] + camPos[0], camPos[0], SN);
        const y = wrap(s2[1] - game.t * 0.35, camPos[1], SN * 0.7);
        const z = wrap(s2[2] + camPos[2], camPos[2], SN);
        if (y > -0.4) continue;
        pushSprite(x, y, z, s2[3], 0.72, 0.88, 1.0, 0.42);
      }
      // The lure's own pool of light.
      const lure = 0.20 + depthN * 0.45;
      pushSprite(game.hook[0], game.hook[1], game.hook[2], 1.1 + depthN * 2.2, 0.5, 0.82, 1.0, lure);
      pushSprite(game.hook[0], game.hook[1], game.hook[2], 0.16, 0.85, 0.95, 1.0, 0.9);
    }
    for (const f of game.fishes) {
      if (!f.sp.glow) continue;
      const c = hexToRgb(f.sp.glow);
      const pulse = 0.55 + 0.45 * Math.sin(game.t * 2.2 + f.phase);
      pushSprite(f.p[0], f.p[1], f.p[2], f.size * (1.5 + pulse * 0.5), c[0], c[1], c[2], 0.22 + pulse * 0.16);
    }
    for (const b of game.bubbles) {
      pushSprite(b.p[0], b.p[1], b.p[2], b.r * 3.2, 0.75, 0.92, 1.0, 0.42);
    }
    for (const s of game.splashes) {
      pushSprite(s.p[0], s.p[1], s.p[2], s.r * 2.4, 0.9, 0.97, 1.0, 0.7);
    }
    if (!game.submerged && night) {
      pushSprite(1.23, 1.1, 0, 2.6, 1.0, 0.82, 0.45, 0.45);
    }
    flushDynamic(gl, sprites);
    if (sprites.count) {
      const sp2 = progs.glow, su = sp2.uniforms;
      gl.useProgram(sp2.program);
      gl.uniformMatrix4fv(su.uViewProj, false, viewProj);
      gl.uniform1f(su.uSoft, 1);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      gl.bindVertexArray(sprites.vao);
      gl.drawArrays(gl.TRIANGLES, 0, sprites.count);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }

    /* the line */
    drawLine(camPos, fogColor, fogDensity);

    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }

  function drawLine(camPos, fogColor, fogDensity) {
    if (game.phase === 'title') return;
    const tip = ROD_TIP;
    const h = game.hook;
    const N = 18;
    ribbon.count = 0;
    const d = ribbon.data;
    // Sag scales with slack: a cast line droops, a line under load runs taut.
    const span = Math.hypot(h[0] - tip[0], h[1] - tip[1], h[2] - tip[2]);
    const sag = game.phase === 'reeling' ? span * 0.02 : Math.min(0.9, span * 0.045);
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = lerp(tip[0], h[0], t);
      const z = lerp(tip[2], h[2], t);
      const y = lerp(tip[1], h[1], t) - Math.sin(t * Math.PI) * sag;
      const pt = [x, y, z];
      if (prev) {
        v3.set(tmpA, pt[0] - prev[0], pt[1] - prev[1], pt[2] - prev[2]);
        v3.set(tmpB, prev[0] - camPos[0], prev[1] - camPos[1], prev[2] - camPos[2]);
        const distCam = Math.max(0.4, Math.hypot(tmpB[0], tmpB[1], tmpB[2]));
        v3.cross(tmpA, tmpA, tmpB);
        v3.norm(tmpA, tmpA);
        // Constant apparent thickness: a world-space width vanishes at depth.
        const w = distCam * 0.0016;
        const push = (p, s) => {
          d[ribbon.count * 7] = p[0] + tmpA[0] * w * s;
          d[ribbon.count * 7 + 1] = p[1] + tmpA[1] * w * s;
          d[ribbon.count * 7 + 2] = p[2] + tmpA[2] * w * s;
          d[ribbon.count * 7 + 3] = 0.92; d[ribbon.count * 7 + 4] = 0.96;
          d[ribbon.count * 7 + 5] = 1.0; d[ribbon.count * 7 + 6] = 0.72;
          ribbon.count++;
        };
        if (ribbon.count + 6 <= ribbon.maxVerts) {
          push(prev, -1); push(prev, 1); push(pt, 1);
          push(prev, -1); push(pt, 1); push(pt, -1);
        }
      }
      prev = pt;
    }
    flushDynamic(gl, ribbon);
    if (!ribbon.count) return;
    const fp = progs.flat, fu = fp.uniforms;
    gl.useProgram(fp.program);
    gl.uniformMatrix4fv(fu.uViewProj, false, viewProj);
    gl.uniform3fv(fu.uCamPos, camPos);
    gl.uniform3fv(fu.uFogColor, fogColor);
    gl.uniform1f(fu.uFogDensity, fogDensity);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    gl.bindVertexArray(ribbon.vao);
    gl.drawArrays(gl.TRIANGLES, 0, ribbon.count);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
  }

  // Project a world point to 0..1 screen space, for HUD markers.
  function project(out, p) {
    const x = p[0], y = p[1], z = p[2];
    const w = viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
    if (w <= 0.0001) { out[2] = -1; return out; }
    out[0] = (viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12]) / w;
    out[1] = (viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13]) / w;
    out[2] = (viewProj[2] * x + viewProj[6] * y + viewProj[10] * z + viewProj[14]) / w;
    out[0] = out[0] * 0.5 + 0.5;
    out[1] = 0.5 - out[1] * 0.5;
    return out;
  }

  return { render, project, palette, get eye() { return eye; } };
}
