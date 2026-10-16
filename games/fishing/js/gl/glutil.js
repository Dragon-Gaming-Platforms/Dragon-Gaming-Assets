// Thin WebGL2 helpers: compile a program, upload a mesh, bind uniforms.
// No state machine of its own beyond caching uniform locations.

export function createProgram(gl, vsSrc, fsSrc, name) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc, name + '.vert');
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc, name + '.frag');
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(`link ${name}: ${gl.getProgramInfoLog(p)}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  const uniforms = Object.create(null);
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i);
    const base = info.name.replace(/\[0\]$/, '');
    uniforms[base] = gl.getUniformLocation(p, info.name);
  }
  return { program: p, uniforms, name };
}

function compile(gl, type, src, label) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    const numbered = src.split('\n').map((l, i) => `${String(i + 1).padStart(3)}| ${l}`).join('\n');
    throw new Error(`compile ${label}: ${log}\n${numbered}`);
  }
  return s;
}

// A mesh is { position: Float32Array, normal, color, index: Uint16Array|Uint32Array }.
// Only `position` is required; the rest fall back to safe defaults.
export function uploadMesh(gl, mesh) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  attrib(gl, 0, mesh.position, 3);
  attrib(gl, 1, mesh.normal, 3);
  attrib(gl, 2, mesh.color, 3);
  if (mesh.wave) attrib(gl, 3, mesh.wave, 1);

  const ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  const idx = mesh.index instanceof Uint32Array ? mesh.index : new Uint16Array(mesh.index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  return {
    vao,
    count: idx.length,
    type: idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
  };
}

function attrib(gl, loc, data, size) {
  if (!data) return;
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
}

// A buffer rewritten every frame (the line ribbon, the billboard batch).
export function createDynamic(gl, layout, maxVerts) {
  const stride = layout.reduce((s, l) => s + l.size, 0);
  const data = new Float32Array(maxVerts * stride);
  const vao = gl.createVertexArray();
  const vbo = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
  let off = 0;
  for (const l of layout) {
    gl.enableVertexAttribArray(l.loc);
    gl.vertexAttribPointer(l.loc, l.size, gl.FLOAT, false, stride * 4, off * 4);
    off += l.size;
  }
  gl.bindVertexArray(null);
  return { vao, vbo, data, stride, maxVerts, count: 0 };
}

export function flushDynamic(gl, dyn) {
  if (dyn.count === 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, dyn.vbo);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn.data.subarray(0, dyn.count * dyn.stride));
}
