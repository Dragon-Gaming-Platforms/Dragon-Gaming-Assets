// Procedural meshes. Everything is flat-shaded low-poly: each triangle owns its
// three vertices so it can own its normal, which is what gives the faceted look
// without a single texture.
//
// Model convention for every creature: nose at +x, tail at -x, body spanning
// x in [-0.5, +0.5]. The swim animation in the vertex shader relies on it, and
// the model matrix scales the whole thing by its length in metres.

import { hexToRgb, lerp } from './math.js';

class Builder {
  constructor() {
    this.pos = [];
    this.nrm = [];
    this.col = [];
    this.idx = [];
  }

  // One flat-shaded triangle. Winding is counter-clockwise when seen from the
  // front, which is what the normal is derived from and what culling expects.
  tri(a, b, c, ca, cb, cc) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-9) return;                 // degenerate: a pole ring seam
    nx /= l; ny /= l; nz /= l;
    const base = this.pos.length / 3;
    for (const [p, col] of [[a, ca], [b, cb], [c, cc]]) {
      this.pos.push(p[0], p[1], p[2]);
      this.nrm.push(nx, ny, nz);
      this.col.push(col[0], col[1], col[2]);
    }
    this.idx.push(base, base + 1, base + 2);
  }

  quad(a, b, c, d, ca, cb, cc, cd) {
    this.tri(a, b, c, ca, cb, cc);
    this.tri(a, c, d, ca, cc, cd);
  }

  // Both faces, for anything thin enough to be seen from behind.
  quad2(a, b, c, d, col) {
    this.quad(a, b, c, d, col, col, col, col);
    this.quad(d, c, b, a, col, col, col, col);
  }

  merge(other, fn) {
    const n = other.pos.length / 3;
    for (let i = 0; i < n; i++) {
      const p = [other.pos[i * 3], other.pos[i * 3 + 1], other.pos[i * 3 + 2]];
      const q = fn ? fn(p) : p;
      this.pos.push(q[0], q[1], q[2]);
      this.nrm.push(other.nrm[i * 3], other.nrm[i * 3 + 1], other.nrm[i * 3 + 2]);
      this.col.push(other.col[i * 3], other.col[i * 3 + 1], other.col[i * 3 + 2]);
    }
    return this;
  }

  // Fit the model into a unit box on its longest axis and centre it on x, so
  // one scale factor -- the creature's length in metres -- drives every mesh
  // and the vertex-shader bend can assume the tail is at x = -0.5.
  normalize() {
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < this.pos.length; i += 3) {
      for (let a = 0; a < 3; a++) {
        if (this.pos[i + a] < lo[a]) lo[a] = this.pos[i + a];
        if (this.pos[i + a] > hi[a]) hi[a] = this.pos[i + a];
      }
    }
    const ext = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1;
    const k = 1 / ext;
    const cx = (lo[0] + hi[0]) / 2;
    for (let i = 0; i < this.pos.length; i += 3) {
      this.pos[i] = (this.pos[i] - cx) * k;
      this.pos[i + 1] *= k;
      this.pos[i + 2] *= k;
    }
    return this;
  }

  finish() {
    return {
      position: new Float32Array(this.pos),
      normal: new Float32Array(this.nrm),
      color: new Float32Array(this.col),
      index: this.pos.length / 3 > 65000
        ? new Uint32Array(this.idx)
        : new Uint16Array(this.idx),
      tris: this.idx.length / 3,
    };
  }
}

export function builder() {
  return new Builder();
}

/* ------------------------------------------------------------------ helpers */

// Stitch a sequence of rings into a closed tube. Each ring is an array of
// [x,y,z] of equal length; colours come from a per-vertex callback.
function loft(b, rings, colorAt) {
  for (let i = 0; i < rings.length - 1; i++) {
    const r0 = rings[i], r1 = rings[i + 1];
    const n = r0.length;
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      b.quad(
        r0[j], r0[k], r1[k], r1[j],
        colorAt(i, j), colorAt(i, k), colorAt(i + 1, k), colorAt(i + 1, j),
      );
    }
  }
}

function ring(x, cy, ry, rz, seg, squash = 1) {
  const out = [];
  for (let j = 0; j < seg; j++) {
    const a = (j / seg) * Math.PI * 2;
    const cs = Math.cos(a), sn = Math.sin(a);
    // A slight flattening of the belly reads as a fish rather than a tube.
    const yy = sn >= 0 ? sn : sn * squash;
    out.push([x, cy + yy * ry, cs * rz]);
  }
  return out;
}

const PROFILE = [
  [0.00, 0.03], [0.07, 0.34], [0.16, 0.64], [0.27, 0.88], [0.38, 1.00],
  [0.52, 0.92], [0.66, 0.70], [0.80, 0.44], [0.92, 0.24], [1.00, 0.13],
];

function profileAt(t) {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [t0, r0] = PROFILE[i], [t1, r1] = PROFILE[i + 1];
    if (t <= t1) return lerp(r0, r1, (t - t0) / (t1 - t0));
  }
  return PROFILE[PROFILE.length - 1][1];
}

// Colour a body vertex by how high it sits on its own ring: back on top,
// pale belly underneath, with a soft band between.
function skinAt(top, belly, up) {
  const k = Math.pow(Math.max(0, up * 0.5 + 0.5), 1.35);
  return [
    lerp(belly[0], top[0], k),
    lerp(belly[1], top[1], k),
    lerp(belly[2], top[2], k),
  ];
}

function sphere(b, cx, cy, cz, r, col, seg = 8, rows = 6) {
  for (let i = 0; i < rows; i++) {
    const p0 = (i / rows) * Math.PI, p1 = ((i + 1) / rows) * Math.PI;
    for (let j = 0; j < seg; j++) {
      const a0 = (j / seg) * Math.PI * 2, a1 = ((j + 1) / seg) * Math.PI * 2;
      const P = (p, a) => [
        cx + r * Math.sin(p) * Math.cos(a),
        cy + r * Math.cos(p),
        cz + r * Math.sin(p) * Math.sin(a),
      ];
      b.quad(P(p0, a0), P(p0, a1), P(p1, a1), P(p1, a0), col, col, col, col);
    }
  }
}

function box(b, x0, y0, z0, x1, y1, z1, col, colTop = col) {
  const V = (x, y, z) => [x, y, z];
  b.quad(V(x0, y1, z1), V(x1, y1, z1), V(x1, y1, z0), V(x0, y1, z0), colTop, colTop, colTop, colTop);
  b.quad(V(x0, y0, z0), V(x1, y0, z0), V(x1, y0, z1), V(x0, y0, z1), col, col, col, col);
  b.quad(V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1), col, col, col, col);
  b.quad(V(x1, y0, z0), V(x0, y0, z0), V(x0, y1, z0), V(x1, y1, z0), col, col, col, col);
  b.quad(V(x1, y0, z1), V(x1, y0, z0), V(x1, y1, z0), V(x1, y1, z1), col, col, col, col);
  b.quad(V(x0, y0, z0), V(x0, y0, z1), V(x0, y1, z1), V(x0, y1, z0), col, col, col, col);
}

function cone(b, base, tip, r, col, seg = 8) {
  const axis = [tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]];
  const al = Math.hypot(...axis) || 1;
  const ax = axis.map((v) => v / al);
  let up = Math.abs(ax[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const s1 = [
    up[1] * ax[2] - up[2] * ax[1],
    up[2] * ax[0] - up[0] * ax[2],
    up[0] * ax[1] - up[1] * ax[0],
  ];
  const s1l = Math.hypot(...s1) || 1;
  const u = s1.map((v) => v / s1l);
  const v = [
    ax[1] * u[2] - ax[2] * u[1],
    ax[2] * u[0] - ax[0] * u[2],
    ax[0] * u[1] - ax[1] * u[0],
  ];
  const P = (j) => {
    const a = (j / seg) * Math.PI * 2;
    return [
      base[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r,
      base[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r,
      base[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r,
    ];
  };
  for (let j = 0; j < seg; j++) {
    b.tri(P(j), P(j + 1), tip, col, col, col);
    b.tri(base, P(j + 1), P(j), col, col, col);
  }
}

// A fin is a flat blade with a little thickness so it survives backface culling.
function fin(b, pts, thick, col) {
  const front = pts.map((p) => [p[0], p[1], p[2] + thick]);
  const back = pts.map((p) => [p[0], p[1], p[2] - thick]);
  for (let i = 1; i < pts.length - 1; i++) {
    b.tri(front[0], front[i], front[i + 1], col, col, col);
    b.tri(back[0], back[i + 1], back[i], col, col, col);
  }
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    b.quad(front[i], front[j], back[j], back[i], col, col, col, col);
  }
}

/* ---------------------------------------------------------------- creatures */

function eyes(b, t, ry, rz, cyAt, scale) {
  const white = [0.96, 0.97, 1.0];
  const dark = [0.05, 0.06, 0.09];
  const x = 0.5 - t;
  const cy = cyAt(t);
  // Project onto the body surface instead of guessing an offset: at a 2D-looking
  // depth the whole eye ends up inside the mesh and simply never appears.
  const dy = 0.42, dz = 0.91;
  const r = 0.052 * scale;
  for (const s of [1, -1]) {
    const ey = cy + dy * ry;
    const ez = s * dz * rz;
    const nx = 0, ny = (dy * ry) / (ry * ry), nz = (s * dz * rz) / (rz * rz);
    const nl = Math.hypot(nx, ny, nz) || 1;
    sphere(b, x, ey + (ny / nl) * r * 0.35, ez + (nz / nl) * r * 0.35, r, white, 7, 5);
    sphere(b, x, ey + (ny / nl) * r * 0.8, ez + (nz / nl) * r * 0.8, r * 0.58, dark, 6, 4);
  }
}

export function buildFish(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const body = sp.body || { height: 0.34, width: 0.18, snout: 0.2, tail: 0.56 };
  const SEG = 10, STEPS = 14;

  const rys = [], rzs = [], cys = [];
  const rings = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const r = profileAt(t);
    const ry = Math.max(0.006, r * body.height);
    const rz = Math.max(0.005, r * body.width);
    // The head sits slightly above the tail line, which reads as a snout.
    const cy = -0.02 + Math.pow(1 - t, 2.2) * 0.03;
    rys.push(ry); rzs.push(rz); cys.push(cy);
    rings.push(ring(0.5 - t, cy, ry, rz, SEG, 0.82));
  }
  loft(b, rings, (i, j) => {
    const a = (j / SEG) * Math.PI * 2;
    return skinAt(top, belly, Math.sin(a));
  });
  // Cap the nose and the peduncle.
  const nose = [0.5, cys[0], 0];
  for (let j = 0; j < SEG; j++) {
    const k = (j + 1) % SEG;
    b.tri(nose, rings[0][k], rings[0][j], belly, belly, belly);
  }

  const tailX = -0.5, tailR = rys[STEPS];
  const tl = body.tail;
  fin(b, [
    [tailX + 0.02, cys[STEPS], 0],
    [tailX - tl * 0.9, cys[STEPS] + tl * 0.95, 0],
    [tailX - tl * 0.62, cys[STEPS], 0],
    [tailX - tl * 0.9, cys[STEPS] - tl * 0.85, 0],
  ], 0.012, top);

  // Dorsal, anal and a pair of pectorals.
  const di = Math.round(STEPS * 0.42);
  fin(b, [
    [0.5 - di / STEPS + 0.10, cys[di] + rys[di] * 0.92, 0],
    [0.5 - di / STEPS - 0.02, cys[di] + rys[di] + body.height * 0.78, 0],
    [0.5 - di / STEPS - 0.16, cys[di] + rys[di] * 0.92, 0],
  ], 0.010, top);
  const ai = Math.round(STEPS * 0.66);
  fin(b, [
    [0.5 - ai / STEPS + 0.06, cys[ai] - rys[ai] * 0.9, 0],
    [0.5 - ai / STEPS - 0.06, cys[ai] - rys[ai] - body.height * 0.42, 0],
    [0.5 - ai / STEPS - 0.13, cys[ai] - rys[ai] * 0.9, 0],
  ], 0.010, top);
  const pi = Math.round(STEPS * 0.3);
  for (const s of [1, -1]) {
    const zr = rzs[pi] * s;
    fin(b, [
      [0.5 - pi / STEPS, cys[pi] - rys[pi] * 0.1, zr * 0.85],
      [0.5 - pi / STEPS - 0.16, cys[pi] - rys[pi] * 0.5, zr * 2.5],
      [0.5 - pi / STEPS - 0.05, cys[pi] - rys[pi] * 0.2, zr * 1.9],
    ], 0.008, top);
  }

  if (sp.shape === 'bill') {
    cone(b, [0.5, cys[0], 0], [0.5 + body.snout * 1.9, cys[0] + 0.01, 0], rzs[1] * 0.5, top, 6);
  }

  const ei = Math.round(STEPS * 0.14);
  eyes(b, ei / STEPS, rys[ei], rzs[ei], () => cys[ei], 1);
  return b.normalize().finish();
}

export function buildSquid(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const SEG = 10, STEPS = 10;
  const rings = [];
  // Mantle: a cone from the tail point forward to the blunt head.
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;                     // 0 at head, 1 at tail tip
    const r = Math.sin(Math.PI * Math.pow(1 - t, 0.55)) * 0.9;
    rings.push(ring(0.2 - t * 0.7, 0, Math.max(0.006, r * 0.20), Math.max(0.006, r * 0.18), SEG));
  }
  loft(b, rings, (i, j) => skinAt(top, belly, Math.sin((j / SEG) * Math.PI * 2)));
  const tip = [-0.5, 0, 0];
  for (let j = 0; j < SEG; j++) {
    b.tri(tip, rings[STEPS][j], rings[STEPS][(j + 1) % SEG], top, top, top);
  }
  // Two triangular fins near the tail.
  for (const s of [1, -1]) {
    fin(b, [
      [-0.20, 0, s * 0.05],
      [-0.44, 0.02, s * 0.30],
      [-0.46, -0.02, s * 0.08],
    ], 0.008, top);
  }
  // Head and arms.
  sphere(b, 0.22, 0, 0, 0.155, skinAt(top, belly, 0.2), 10, 7);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const dy = Math.sin(a) * 0.10, dz = Math.cos(a) * 0.10;
    const seg = 4;
    let prev = [0.32, dy * 0.6, dz * 0.6];
    for (let s = 1; s <= seg; s++) {
      const u = s / seg;
      const nxt = [
        0.32 + u * 0.30,
        dy * (0.6 + u * 1.5) - u * u * 0.05,
        dz * (0.6 + u * 1.5),
      ];
      cone(b, prev, nxt, 0.026 * (1 - u * 0.75) + 0.004, belly, 5);
      prev = nxt;
    }
  }
  // Two long hunting tentacles.
  for (const s of [1, -1]) {
    let prev = [0.34, -0.02, s * 0.05];
    for (let i = 1; i <= 5; i++) {
      const u = i / 5;
      const nxt = [0.34 + u * 0.46, -0.02 - u * 0.02, s * (0.05 + u * 0.10)];
      cone(b, prev, nxt, 0.016 * (1 - u * 0.5) + 0.004, belly, 5);
      prev = nxt;
    }
  }
  eyes(b, 0.5 - 0.30, 0.14, 0.14, () => 0.02, 1.25);
  return b.normalize().finish();
}

export function buildManta(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const STEPS = 9, WING = 9;
  // A flattened disc: half-span grows then tapers, thickness peaks at the body.
  const rows = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;                     // 0 at the front edge, 1 at the back
    const x = 0.42 - t * 0.84;
    const span = Math.sin(Math.PI * Math.pow(t, 0.72)) * 0.62 + 0.04;
    const thick = Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.085 + 0.006;
    const row = [];
    for (let j = 0; j <= WING; j++) {
      const u = (j / WING) * 2 - 1;
      const z = u * span;
      const taper = Math.pow(1 - Math.abs(u), 0.55);
      row.push([x - Math.abs(u) * 0.16, thick * taper, z]);
      row.push([x - Math.abs(u) * 0.16, -thick * taper * 0.55, z]);
    }
    rows.push(row);
  }
  for (let i = 0; i < STEPS; i++) {
    for (let j = 0; j < WING; j++) {
      const a = rows[i][j * 2], b1 = rows[i][j * 2 + 1];
      const c = rows[i + 1][j * 2], d = rows[i + 1][j * 2 + 1];
      const a2 = rows[i][(j + 1) * 2], b2 = rows[i][(j + 1) * 2 + 1];
      const c2 = rows[i + 1][(j + 1) * 2], d2 = rows[i + 1][(j + 1) * 2 + 1];
      b.quad(a, c, c2, a2, top, top, top, top);
      b.quad(d, b1, b2, d2, belly, belly, belly, belly);
      if (j === 0) b.quad(a, b1, d, c, top, belly, belly, top);
      if (j === WING - 1) b.quad(c2, d2, b2, a2, top, belly, belly, top);
    }
  }
  // Cephalic lobes and a whip tail.
  for (const s of [1, -1]) {
    cone(b, [0.40, 0.01, s * 0.09], [0.56, -0.02, s * 0.13], 0.028, top, 5);
  }
  let prev = [-0.40, 0.01, 0];
  for (let i = 1; i <= 5; i++) {
    const u = i / 5;
    cone(b, prev, [-0.40 - u * 0.52, 0.01 + u * 0.02, 0], 0.026 * (1 - u * 0.85) + 0.003, top, 5);
    prev = [-0.40 - u * 0.52, 0.01 + u * 0.02, 0];
  }
  eyes(b, 0.5 - 0.40, 0.055, 0.115, () => 0.012, 0.85);
  return b.normalize().finish();
}

export function buildJelly(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const SEG = 12, ROWS = 6;
  // The bell is modelled facing +y, then the whole mesh is rotated into the
  // nose-at-+x convention so one shader path drives every creature.
  const rings = [];
  for (let i = 0; i <= ROWS; i++) {
    const t = i / ROWS;
    const a = t * Math.PI * 0.5;
    const r = Math.sin(a) * 0.34;
    const y = Math.cos(a) * 0.26 - 0.02;
    const rr = [];
    for (let j = 0; j < SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      rr.push([y, r * Math.sin(th), r * Math.cos(th)]);   // x <- y on purpose
    }
    rings.push(rr);
  }
  loft(b, rings, (i) => {
    const k = i / ROWS;
    return [lerp(belly[0], top[0], k), lerp(belly[1], top[1], k), lerp(belly[2], top[2], k)];
  });
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const r = 0.3;
    let prev = [-0.02, r * Math.sin(a), r * Math.cos(a)];
    for (let s = 1; s <= 4; s++) {
      const u = s / 4;
      const nxt = [-0.02 - u * 0.44, r * (1 - u * 0.35) * Math.sin(a), r * (1 - u * 0.35) * Math.cos(a)];
      cone(b, prev, nxt, 0.013 * (1 - u * 0.6) + 0.003, belly, 4);
      prev = nxt;
    }
  }
  return b.normalize().finish();
}

export function buildEel(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const SEG = 8, STEPS = 16;
  const rings = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    // Huge pelican jaw at the head, tapering to a thread of a tail.
    const r = t < 0.22
      ? lerp(0.30, 1.0, t / 0.22)
      : Math.pow(1 - (t - 0.22) / 0.78, 1.5) * 0.95 + 0.03;
    rings.push(ring(0.5 - t, -0.02 * (1 - t), Math.max(0.006, r * 0.17), Math.max(0.006, r * 0.15), SEG, 0.9));
  }
  loft(b, rings, (i, j) => skinAt(top, belly, Math.sin((j / SEG) * Math.PI * 2)));
  const nose = [0.5, -0.02, 0];
  for (let j = 0; j < SEG; j++) b.tri(nose, rings[0][(j + 1) % SEG], rings[0][j], belly, belly, belly);
  // A ribbon fin along the back half.
  const pts = [];
  for (let i = 6; i <= STEPS; i++) {
    const t = i / STEPS;
    pts.push([0.5 - t, 0.02 + (1 - t) * 0.06, 0]);
  }
  for (let i = STEPS; i >= 6; i--) {
    const t = i / STEPS;
    pts.push([0.5 - t, rings[i][2][1] * 0.9, 0]);
  }
  fin(b, pts, 0.006, top);
  eyes(b, 0.16, 0.10, 0.09, () => -0.015, 0.9);
  return b.normalize().finish();
}

export function buildAngler(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const SEG = 10, STEPS = 10;
  const rings = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const r = Math.sin(Math.PI * Math.pow(t * 0.86 + 0.07, 0.62));
    rings.push(ring(0.42 - t * 0.78, 0, Math.max(0.006, r * 0.31), Math.max(0.006, r * 0.27), SEG, 0.9));
  }
  loft(b, rings, (i, j) => skinAt(top, belly, Math.sin((j / SEG) * Math.PI * 2)));
  const nose = [0.46, 0.02, 0];
  for (let j = 0; j < SEG; j++) b.tri(nose, rings[0][(j + 1) % SEG], rings[0][j], top, top, top);
  const back = [-0.40, 0, 0];
  for (let j = 0; j < SEG; j++) b.tri(back, rings[STEPS][j], rings[STEPS][(j + 1) % SEG], top, top, top);

  // Gaping jaw with a row of teeth.
  const jaw = [0.06, 0.07, 0.10];
  fin(b, [[0.46, -0.02, 0], [0.20, -0.20, 0], [-0.02, -0.10, 0], [0.30, 0.02, 0]], 0.10, jaw);
  const white = [0.95, 0.96, 0.98];
  for (let k = 0; k < 7; k++) {
    const u = k / 7;
    const x = lerp(0.42, 0.06, u);
    const y = lerp(-0.03, -0.14, u);
    for (const s of [1, -1]) {
      cone(b, [x, y, s * 0.055], [x - 0.02, y + 0.075, s * 0.05], 0.014, white, 4);
    }
  }
  // The illicium: a stalk with a bulb the glow pass lights up.
  let prev = [0.30, 0.22, 0];
  for (let i = 1; i <= 4; i++) {
    const u = i / 4;
    const nxt = [0.30 + u * 0.30, 0.22 + Math.sin(u * 2.1) * 0.16, 0];
    cone(b, prev, nxt, 0.012 * (1 - u * 0.4) + 0.003, top, 4);
    prev = nxt;
  }
  sphere(b, prev[0], prev[1], prev[2], 0.055, hexToRgb(sp.glow || '#ffffff'), 8, 6);
  fin(b, [[-0.36, 0, 0], [-0.56, 0.22, 0], [-0.58, -0.20, 0]], 0.010, top);
  eyes(b, 0.16, 0.26, 0.24, () => 0.02, 1.0);
  return b.normalize().finish();
}

export function buildPuffer(sp) {
  const b = new Builder();
  const top = hexToRgb(sp.skin[0]);
  const belly = hexToRgb(sp.skin[1]);
  const SEG = 12, ROWS = 9;
  const rings = [];
  for (let i = 0; i <= ROWS; i++) {
    const t = i / ROWS;
    const a = t * Math.PI;
    const r = Math.sin(a) * 0.36;
    rings.push(ring(0.36 - t * 0.72, 0, Math.max(0.005, r), Math.max(0.005, r), SEG));
  }
  loft(b, rings, (i, j) => skinAt(top, belly, Math.sin((j / SEG) * Math.PI * 2)));
  for (const [x, cap] of [[0.38, 1], [-0.38, -1]]) {
    for (let j = 0; j < SEG; j++) {
      const k = (j + 1) % SEG;
      if (cap > 0) b.tri([x, 0, 0], rings[0][k], rings[0][j], belly, belly, belly);
      else b.tri([x, 0, 0], rings[ROWS][j], rings[ROWS][k], top, top, top);
    }
  }
  // Spines, scattered with the R2 sequence so they do not rule themselves
  // into the diagonal lines a modular stride would produce.
  for (let i = 1; i <= 44; i++) {
    const u = (i * 0.7548776662466927) % 1;
    const v = (i * 0.5698402909980532) % 1;
    const phi = Math.acos(1 - 2 * u);
    const th = v * Math.PI * 2;
    const nx = Math.cos(phi), ny = Math.sin(phi) * Math.sin(th), nz = Math.sin(phi) * Math.cos(th);
    const r = 0.355;
    cone(b,
      [nx * r * 0.95, ny * r * 0.95, nz * r * 0.95],
      [nx * r * 1.34, ny * r * 1.34, nz * r * 1.34],
      0.024, belly, 4);
  }
  fin(b, [[-0.34, 0, 0], [-0.54, 0.17, 0], [-0.54, -0.15, 0]], 0.008, top);
  eyes(b, 0.5 - 0.24, 0.24, 0.24, () => 0.05, 1.1);
  return b.normalize().finish();
}

export function buildBoot(sp) {
  const b = new Builder();
  const c = hexToRgb(sp.skin[0]);
  const c2 = hexToRgb(sp.skin[1]);
  box(b, -0.10, -0.20, -0.14, 0.16, 0.28, 0.14, c, c2);   // the shaft
  box(b, -0.42, -0.30, -0.15, 0.16, -0.10, 0.15, c, c);   // the foot
  box(b, -0.44, -0.36, -0.16, 0.18, -0.28, 0.16, c2, c2); // the sole
  return b.normalize().finish();
}

export function buildCan(sp) {
  const b = new Builder();
  const c = hexToRgb(sp.skin[0]);
  const c2 = hexToRgb(sp.skin[1]);
  const SEG = 12;
  // loft() assumes the rings run from +x to -x, the same way every body does.
  const r1 = ring(0.34, 0, 0.24, 0.24, SEG);
  const r0 = ring(-0.34, 0, 0.24, 0.24, SEG);
  loft(b, [r1, r0], (i) => (i ? c2 : c));
  for (let j = 0; j < SEG; j++) {
    b.tri([0.34, 0, 0], r1[(j + 1) % SEG], r1[j], c2, c2, c2);
    b.tri([-0.34, 0, 0], r0[j], r0[(j + 1) % SEG], c2, c2, c2);
  }
  return b.normalize().finish();
}

export function buildChest(sp) {
  const b = new Builder();
  const wood = hexToRgb(sp.skin[0]);
  const brass = hexToRgb(sp.skin[1]);
  box(b, -0.42, -0.30, -0.28, 0.42, 0.06, 0.28, wood, wood);
  // Barrel lid, opened just enough to spill light.
  const SEG = 8;
  for (let j = 0; j < SEG; j++) {
    const a0 = Math.PI * (j / SEG), a1 = Math.PI * ((j + 1) / SEG);
    const P = (a, x) => [x, 0.06 + Math.sin(a) * 0.26, Math.cos(a) * 0.28];
    b.quad(P(a0, -0.42), P(a0, 0.42), P(a1, 0.42), P(a1, -0.42), wood, wood, wood, wood);
  }
  for (const x of [-0.30, 0.02, 0.34]) box(b, x - 0.04, -0.31, -0.29, x + 0.04, 0.08, 0.29, brass, brass);
  box(b, -0.06, -0.16, 0.26, 0.06, -0.02, 0.34, brass, brass);
  return b.normalize().finish();
}

export function buildKelp(sp) {
  const b = new Builder();
  const c = hexToRgb(sp.skin[0]);
  const c2 = hexToRgb(sp.skin[1]);
  for (let s = 0; s < 4; s++) {
    const a = (s / 4) * Math.PI * 2;
    const dz = Math.cos(a) * 0.10, dy0 = Math.sin(a) * 0.06;
    const pts = [];
    const N = 7;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      pts.push([-0.46 + u * 0.94, dy0 + Math.sin(u * 3.1 + a) * 0.10, dz * (1 + u * 0.7)]);
    }
    for (let i = 0; i < N; i++) {
      const w = 0.055 * (1 - i / N * 0.5);
      const p = pts[i], q = pts[i + 1];
      b.quad2([p[0], p[1] - w, p[2]], [q[0], q[1] - w, q[2]], [q[0], q[1] + w, q[2]], [p[0], p[1] + w, p[2]], i % 2 ? c : c2);
    }
  }
  return b.normalize().finish();
}

const BUILDERS = {
  fish: buildFish, bill: buildFish, squid: buildSquid, manta: buildManta,
  jelly: buildJelly, eel: buildEel, angler: buildAngler, puffer: buildPuffer,
  boot: buildBoot, can: buildCan, chest: buildChest, kelp: buildKelp,
};

export function buildSpecies(sp) {
  return (BUILDERS[sp.shape] || buildFish)(sp);
}

/* ------------------------------------------------------------------- scenery */

export function buildBoat() {
  const b = new Builder();
  const hull = hexToRgb('#8a5a38');
  const hullDark = hexToRgb('#63402a');
  const deck = hexToRgb('#a9764c');
  const SEG = 7, STEPS = 9;
  const rings = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const x = -1.9 + t * 3.8;
    const taper = Math.sin(Math.PI * Math.pow(t, 0.85)) * 0.86 + 0.14;
    const rr = [];
    for (let j = 0; j <= SEG; j++) {
      const u = j / SEG;
      const z = (u * 2 - 1) * 0.78 * taper;
      const dip = 1 - Math.abs(u * 2 - 1) * Math.abs(u * 2 - 1);
      rr.push([x, -0.62 * dip - 0.02, z]);
    }
    rings.push(rr);
  }
  for (let i = 0; i < STEPS; i++) {
    for (let j = 0; j < SEG; j++) {
      // Outward for a hull is downward/outward, away from the deck.
      b.quad(rings[i][j], rings[i + 1][j], rings[i + 1][j + 1], rings[i][j + 1],
        hullDark, hullDark, hullDark, hullDark);
      // Gunwale strip along the top edge on both sides.
      if (j === 0 || j === SEG - 1) {
        const a = rings[i][j === 0 ? 0 : SEG], c = rings[i + 1][j === 0 ? 0 : SEG];
        b.quad([a[0], 0.30, a[2]], [c[0], 0.30, c[2]], [c[0], a[1], c[2]], [a[0], a[1], a[2]],
          hull, hull, hullDark, hullDark);
        b.quad([a[0], a[1], a[2]], [c[0], c[1], c[2]], [c[0], 0.30, c[2]], [a[0], 0.30, a[2]],
          hullDark, hullDark, hull, hull);
      }
    }
  }
  // Deck plank across the middle.
  box(b, -1.5, 0.02, -0.62, 1.5, 0.10, 0.62, deck, deck);
  box(b, -0.5, 0.10, -0.60, -0.1, 0.34, 0.60, hexToRgb('#7d5334'), hexToRgb('#95663f'));

  // Angler.
  const coat = hexToRgb('#3d5f86');
  const skin = hexToRgb('#f0c39c');
  const hat = hexToRgb('#d4653a');
  box(b, -0.26, 0.34, -0.20, 0.10, 1.06, 0.20, coat, coat);
  box(b, -0.20, 1.06, -0.16, 0.06, 1.14, 0.16, hexToRgb('#e8d9c6'), hexToRgb('#e8d9c6'));
  sphere(b, -0.06, 1.30, 0, 0.20, skin, 10, 7);
  sphere(b, -0.06, 1.42, 0, 0.21, hat, 10, 5);
  box(b, -0.34, 1.38, -0.30, 0.24, 1.43, 0.30, hat, hat);
  for (const s of [1, -1]) box(b, 0.02, 0.62, s * 0.18, 0.34, 0.74, s * 0.30, skin, skin);
  for (const s of [1, -1]) box(b, -0.22, -0.02, s * 0.06, 0.06, 0.36, s * 0.16, hexToRgb('#33445c'), hexToRgb('#33445c'));

  // Rod, bending up to the tip the line is anchored at.
  const rodCol = hexToRgb('#4a3222');
  let prev = [0.24, 0.66, 0.10];
  for (let i = 1; i <= 6; i++) {
    const u = i / 6;
    const nxt = [0.24 + u * 1.0, 0.66 + u * 1.5 - u * u * 0.10, 0.10];
    cone(b, prev, nxt, 0.055 * (1 - u * 0.75) + 0.008, rodCol, 5);
    prev = nxt;
  }
  // Lantern post on the bow.
  const post = hexToRgb('#5a4230');
  cone(b, [1.30, 0.10, 0], [1.30, 1.30, 0], 0.045, post, 5);
  box(b, 1.14, 1.16, -0.14, 1.32, 1.30, 0.14, post, post);
  return b.finish();
}

// A lantern glass drawn separately so the emissive pass can own it.
export function buildLanternGlass() {
  const b = new Builder();
  box(b, 1.15, 1.00, -0.11, 1.31, 1.17, 0.11, [1, 0.92, 0.62], [1, 0.95, 0.72]);
  return b.finish();
}

// Raised-cosine humps: flat value and flat slope at their own rim, so any
// number of them sum into one height field with no creases to shade.
function hump(dx, dz, r) {
  const d = Math.hypot(dx, dz) / r;
  if (d >= 1) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * d));
}

const BUMPS = [];
for (let i = 1; i <= 46; i++) {
  const u = (i * 0.7548776662466927) % 1;
  const v = (i * 0.5698402909980532) % 1;
  const w = (i * 0.2354477382845685) % 1;
  BUMPS.push({
    x: (u - 0.5) * 150,
    z: (v - 0.5) * 150,
    r: 7 + w * 22,
    h: (w < 0.5 ? 1 : -1) * (0.9 + w * 3.4),
  });
}

export function seabedHeight(x, z) {
  let y = 0;
  for (const b of BUMPS) y += hump(x - b.x, z - b.z, b.r) * b.h;
  return y;
}

export function buildSeabed() {
  const b = new Builder();
  const sand = hexToRgb('#8b7d5e');
  const sandDark = hexToRgb('#6a6049');
  const N = 56, SPAN = 150;
  const P = (i, j) => {
    const x = (i / N - 0.5) * SPAN;
    const z = (j / N - 0.5) * SPAN;
    return [x, seabedHeight(x, z), z];
  };
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const a = P(i, j), c = P(i + 1, j), d = P(i + 1, j + 1), e = P(i, j + 1);
      const shade = (p) => {
        const k = Math.min(1, Math.max(0, (p[1] + 3) / 7));
        return [lerp(sandDark[0], sand[0], k), lerp(sandDark[1], sand[1], k), lerp(sandDark[2], sand[2], k)];
      };
      b.quad(a, e, d, c, shade(a), shade(e), shade(d), shade(c));
    }
  }
  return b.finish();
}

export function buildRock() {
  const b = new Builder();
  const c = hexToRgb('#6e6a63');
  const c2 = hexToRgb('#8d8880');
  const SEG = 7, ROWS = 5;
  const rings = [];
  for (let i = 0; i <= ROWS; i++) {
    const t = i / ROWS;
    const a = t * Math.PI * 0.55;
    const r = Math.cos(a) * (0.9 + Math.sin(t * 9.1) * 0.12);
    const rr = [];
    for (let j = 0; j < SEG; j++) {
      const th = (j / SEG) * Math.PI * 2;
      const jag = 0.82 + ((j * 7 + i * 3) % 5) * 0.07;
      rr.push([Math.sin(th) * r * jag, Math.sin(a) * 0.62, Math.cos(th) * r * jag]);
    }
    rings.push(rr);
  }
  loft(b, rings, (i) => (i > ROWS * 0.6 ? c2 : c));
  for (let j = 0; j < SEG; j++) {
    b.tri([0, 0.62, 0], rings[ROWS][(j + 1) % SEG], rings[ROWS][j], c2, c2, c2);
  }
  return b.finish();
}

export function buildWeed() {
  const b = new Builder();
  const c = hexToRgb('#4f7a46');
  const c2 = hexToRgb('#78a95e');
  for (let s = 0; s < 7; s++) {
    const a = (s / 7) * Math.PI * 2;
    const dx = Math.sin(a) * 0.16, dz = Math.cos(a) * 0.16;
    const N = 6;
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N;
      const w0 = 0.13 * (1 - u0 * 0.7), w1 = 0.13 * (1 - u1 * 0.7);
      const p0 = [dx * u0 * 2.2, u0 * 1.7, dz * u0 * 2.2];
      const p1 = [dx * u1 * 2.2, u1 * 1.7, dz * u1 * 2.2];
      b.quad2(
        [p0[0] - dz * w0, p0[1], p0[2] + dx * w0],
        [p1[0] - dz * w1, p1[1], p1[2] + dx * w1],
        [p1[0] + dz * w1, p1[1], p1[2] - dx * w1],
        [p0[0] + dz * w0, p0[1], p0[2] - dx * w0],
        i % 2 ? c : c2,
      );
    }
  }
  return b.finish();
}

/* ------------------------------------------------------------- water surface */

// A flat grid; the vertex shader does the waving. Positions are relative to the
// camera, so the sheet is recentred each frame instead of being world-sized.
export function buildWaterGrid(n, span) {
  const position = new Float32Array((n + 1) * (n + 1) * 3);
  const index = new Uint32Array(n * n * 6);
  let p = 0;
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      // Squared spacing keeps the detail near the camera and the span far away.
      const u = (i / n) * 2 - 1, v = (j / n) * 2 - 1;
      position[p++] = Math.sign(u) * u * u * span;
      position[p++] = 0;
      position[p++] = Math.sign(v) * v * v * span;
    }
  }
  let k = 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i, b2 = a + 1, c = a + n + 1, d = c + 1;
      index[k++] = a; index[k++] = c; index[k++] = d;
      index[k++] = a; index[k++] = d; index[k++] = b2;
    }
  }
  return { position, index };
}
