// GLSL ES 3.00 sources. `#version` has to be the first thing in the string, so
// every template literal below starts hard against the backtick.

export const SKY_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
out vec2 vNdc;
void main() {
  vNdc = aPos.xy;
  gl_Position = vec4(aPos.xy, 1.0, 1.0);
}`;

export const SKY_FS = `#version 300 es
precision highp float;
in vec2 vNdc;
uniform vec3 uCamRight, uCamUp, uCamFwd;
uniform vec2 uRay;         // tan(fov/2) * aspect, tan(fov/2)
uniform vec3 uCamPos;
uniform vec3 uZenith, uHorizon, uGround;
uniform vec3 uSunDir, uSunColor, uMoonDir;
uniform float uNight;      // 0 day, 1 night
uniform float uUnderwater; // 0 above, 1 fully submerged
uniform vec3 uFogColor;
out vec4 outColor;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 dir = normalize(uCamFwd + uCamRight * (vNdc.x * uRay.x) + uCamUp * (vNdc.y * uRay.y));

  float h = dir.y;
  vec3 col = mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.55));
  col = mix(col, uGround, smoothstep(0.0, -0.14, h));

  // Stars: a coarse cell hash so they sit still as the camera turns.
  if (uNight > 0.25) {
    vec3 cell = floor(dir * 190.0);
    float s = hash(cell);
    float twinkle = 0.55 + 0.45 * sin(dot(cell, vec3(1.7, 2.3, 3.1)));
    float star = smoothstep(0.9965, 1.0, s) * twinkle;
    col += vec3(star) * smoothstep(0.25, 0.8, uNight) * clamp(h * 3.0, 0.0, 1.0) * 1.7;
  }

  float sd = dot(dir, uSunDir);
  col += uSunColor * pow(max(sd, 0.0), 900.0) * 4.0 * (1.0 - uNight);
  col += uSunColor * pow(max(sd, 0.0), 8.0) * 0.16 * (1.0 - uNight);
  float md = dot(dir, uMoonDir);
  col += vec3(0.92, 0.95, 1.0) * pow(max(md, 0.0), 1400.0) * 3.2 * uNight;
  col += vec3(0.55, 0.62, 0.8) * pow(max(md, 0.0), 24.0) * 0.10 * uNight;

  outColor = vec4(mix(col, uFogColor, uUnderwater), 1.0);
}`;

/* --------------------------------------------------------------- lit geometry */

export const LIT_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNrm;
layout(location = 2) in vec3 aCol;
uniform mat4 uViewProj, uModel, uNormalMat;
uniform vec3 uBend;        // amplitude, frequency, phase
out vec3 vNrm;
out vec3 vCol;
out vec3 vWorld;
void main() {
  vec3 p = aPos;
  vec3 n = aNrm;
  if (uBend.x != 0.0) {
    // Tail-weighted lateral bend. bt is 0 at the nose and 1 at the tail, which
    // is why every creature mesh is modelled nose-at-+x.
    float bt = clamp(0.5 - aPos.x, 0.0, 1.0);
    float w = bt * bt;
    float ph = bt * uBend.y + uBend.z;
    p.z += sin(ph) * uBend.x * w;
    // Slope of that offset along x, so the lighting swims with the body.
    float d = -(cos(ph) * uBend.y * w + sin(ph) * 2.0 * bt) * uBend.x;
    float c = inversesqrt(1.0 + d * d);
    n = normalize(vec3(n.x * c - n.z * d * c, n.y, n.z * c + n.x * d * c));
  }
  vec4 world = uModel * vec4(p, 1.0);
  vWorld = world.xyz;
  vNrm = mat3(uNormalMat) * n;
  vCol = aCol;
  gl_Position = uViewProj * world;
}`;

export const LIT_FS = `#version 300 es
precision highp float;
in vec3 vNrm;
in vec3 vCol;
in vec3 vWorld;
uniform vec3 uCamPos;
uniform vec3 uSunDir, uSunColor, uAmbient;
uniform float uWrap;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform vec3 uAbsorb;       // what the water column leaves of each channel
uniform float uAbsorbScale;
uniform vec3 uEmissive;
uniform float uEmissiveAmt;
uniform vec3 uRim;
uniform float uAlpha;
uniform vec3 uLampPos, uLampColor;
uniform float uLampPower;
uniform float uCaustic;
out vec4 outColor;

void main() {
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCamPos - vWorld);
  if (!gl_FrontFacing) N = -N;

  // Wrapped diffuse. A hard N.L terminator is what makes a flat-shaded scene
  // read as unlit black on every face turned away from the sun, and no amount
  // of extra light power widens it.
  float ndl = max((dot(N, uSunDir) + uWrap) / (1.0 + uWrap), 0.0);
  vec3 lit = vCol * (uAmbient + uSunColor * ndl);

  // How much water sits above this fragment, used by both the caustics and
  // the colour absorption below.
  float dep = clamp(-vWorld.y * uAbsorbScale, 0.0, 1.0);

  // A point lamp -- the lure underwater, the boat lantern after dark. It uses
  // the same wrapped term: a hard terminator here would leave everything on
  // the far side of a fish unlit no matter how much power the lamp is given.
  if (uLampPower > 0.0) {
    vec3 L = uLampPos - vWorld;
    float ld = length(L);
    float att = uLampPower / (1.0 + ld * ld * 0.22);
    float ndl2 = max((dot(N, L / max(ld, 0.001)) + uWrap) / (1.0 + uWrap), 0.0);
    lit += vCol * uLampColor * ndl2 * att;
  }

  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  lit += uRim * rim * vCol;
  lit += uEmissive * uEmissiveAmt;

  if (uCaustic > 0.0) {
    // Cheap interference pattern: two rotated sine grids beating against each
    // other, fading out with depth where no light reaches anyway.
    vec2 q = vWorld.xz * 0.55;
    float c = sin(q.x + uCaustic * 0.9) * sin(q.y * 1.13 - uCaustic * 0.7)
            + sin((q.x + q.y) * 0.71 + uCaustic * 1.3);
    c = pow(clamp(c * 0.5 + 0.5, 0.0, 1.0), 3.5);
    lit += vec3(0.55, 0.78, 0.85) * c * 0.5 * (1.0 - dep);
  }

  // Water absorbs the long wavelengths first, so colour drains with depth
  // rather than everything simply getting darker.
  lit *= mix(vec3(1.0), uAbsorb, dep);

  float dist = length(uCamPos - vWorld);
  float f = 1.0 - exp(-dist * uFogDensity);
  outColor = vec4(mix(lit, uFogColor, f), uAlpha);
}`;

/* ------------------------------------------------------------------- water */

export const WATER_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;      // xz relative to the camera
uniform mat4 uViewProj;
uniform vec3 uCamPos;
uniform float uTime;
out vec3 vWorld;
out vec3 vNrm;
out float vDist;

const vec2 D0 = vec2(1.0, 0.18);
const vec2 D1 = vec2(-0.42, 0.91);
const vec2 D2 = vec2(0.72, -0.69);
const vec2 D3 = vec2(0.13, 0.99);

void main() {
  vec2 xz = aPos.xz + uCamPos.xz;
  float dist = length(aPos.xz);
  // Waves flatten out with distance so the far grid, whose quads are metres
  // across, cannot alias into a moire.
  float fade = 1.0 / (1.0 + dist * 0.02);

  float h = 0.0;
  vec2 slope = vec2(0.0);
  vec4 amp = vec4(0.10, 0.062, 0.035, 0.018);
  vec4 frq = vec4(0.55, 1.05, 2.1, 4.3);
  vec4 spd = vec4(1.1, 1.6, 2.3, 3.4);
  vec2 dirs[4] = vec2[4](D0, D1, D2, D3);
  for (int i = 0; i < 4; i++) {
    vec2 d = normalize(dirs[i]);
    float ph = dot(d, xz) * frq[i] + uTime * spd[i];
    h += sin(ph) * amp[i] * fade;
    slope += d * cos(ph) * amp[i] * frq[i] * fade;
  }

  vWorld = vec3(xz.x, h, xz.y);
  vNrm = normalize(vec3(-slope.x, 1.0, -slope.y));
  vDist = dist;
  gl_Position = uViewProj * vec4(vWorld, 1.0);
}`;

export const WATER_FS = `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNrm;
in float vDist;
uniform vec3 uCamPos;
uniform vec3 uSunDir, uSunColor;
uniform vec3 uSkyColor, uDeepColor, uFogColor;
uniform float uFogDensity;
uniform float uNight;
out vec4 outColor;

void main() {
  vec3 N = normalize(vNrm);
  vec3 V = normalize(uCamPos - vWorld);
  bool fromAbove = uCamPos.y > vWorld.y;
  if (!fromAbove) N = -N;

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
  vec3 col;
  float alpha;

  if (fromAbove) {
    col = mix(uDeepColor, uSkyColor, 0.25 + 0.75 * fres);
    vec3 H = normalize(uSunDir + V);
    col += uSunColor * pow(max(dot(N, H), 0.0), 220.0) * 2.4 * (1.0 - uNight * 0.75);
    alpha = 0.82 + 0.18 * fres;
  } else {
    // Seen from below the surface is a shimmering ceiling: bright looking
    // straight up, and closing to a mirror at grazing angles.
    float up = clamp(dot(V, vec3(0.0, -1.0, 0.0)), 0.0, 1.0);
    float window = pow(1.0 - fres, 2.0);
    col = mix(uFogColor, uSkyColor, window * (0.35 + 0.65 * up));
    col += uSunColor * pow(max(dot(N, normalize(uSunDir + V)), 0.0), 90.0)
         * 0.8 * (1.0 - uNight * 0.8);
    alpha = 0.55 + 0.40 * (1.0 - window);
  }

  float f = 1.0 - exp(-vDist * uFogDensity);
  outColor = vec4(mix(col, uFogColor, f), alpha * (1.0 - f * 0.65));
}`;

/* --------------------------------------------------------- additive sprites */

export const GLOW_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aColor;
layout(location = 2) in vec2 aUv;
uniform mat4 uViewProj;
out vec4 vColor;
out vec2 vUv;
void main() {
  vColor = aColor;
  vUv = aUv;
  gl_Position = uViewProj * vec4(aPos, 1.0);
}`;

export const GLOW_FS = `#version 300 es
precision highp float;
in vec4 vColor;
in vec2 vUv;
uniform float uSoft;    // 1 = round falloff, 0 = flat quad
out vec4 outColor;
void main() {
  float d = length(vUv);
  float a = mix(1.0 - step(1.0, d), pow(clamp(1.0 - d, 0.0, 1.0), 2.0), uSoft);
  if (a <= 0.002) discard;
  outColor = vec4(vColor.rgb * vColor.a * a, vColor.a * a);
}`;

/* ------------------------------------------------------------- flat ribbons */

export const FLAT_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aColor;
uniform mat4 uViewProj;
uniform vec3 uCamPos;
uniform vec3 uFogColor;
uniform float uFogDensity;
out vec4 vColor;
void main() {
  float f = 1.0 - exp(-length(uCamPos - aPos) * uFogDensity);
  vColor = vec4(mix(aColor.rgb, uFogColor, f), aColor.a * (1.0 - f * 0.8));
  gl_Position = uViewProj * vec4(aPos, 1.0);
}`;

export const FLAT_FS = `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 outColor;
void main() { outColor = vColor; }`;
