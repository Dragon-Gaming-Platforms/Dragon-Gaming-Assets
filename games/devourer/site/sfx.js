// Devourer's sound, made with the Web Audio API (no files): a low hum that deepens as you grow, gulps that drop in
// pitch with the size of what you eat, and the rest. The browser only allows sound after a key or tap, so the audio
// starts on the first one. M mutes (remembered between visits).
var Sfx = (function () {
  "use strict";
  var ctx = null, out = null, hum = null, humGain = null, humFilter = null;
  var muted = localStorage.getItem("devourerMuted") === "1";
  var VOL = 0.34;

  function wake() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = muted ? 0 : VOL;
      out.connect(ctx.destination);
      // the hum of the hole: two detuned saws through a low-pass
      humFilter = ctx.createBiquadFilter(); humFilter.type = "lowpass"; humFilter.frequency.value = 220;
      humGain = ctx.createGain(); humGain.gain.value = 0;
      hum = [ctx.createOscillator(), ctx.createOscillator()];
      hum[0].type = "sawtooth"; hum[1].type = "sawtooth";
      hum[0].frequency.value = 55; hum[1].frequency.value = 55.7;
      hum.forEach(function (o) { o.connect(humFilter); o.start(); });
      humFilter.connect(humGain); humGain.connect(out);
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  ["keydown", "pointerdown", "touchstart"].forEach(function (e) { document.addEventListener(e, wake, true); });

  function tone(type, f0, f1, at, len, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), at + len);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + len);
    o.connect(g); g.connect(out);
    o.start(at); o.stop(at + len + 0.02);
  }

  function noise(at, len, vol, freq, type) {
    var n = Math.floor(ctx.sampleRate * len), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = type || "lowpass"; f.frequency.value = freq || 1500; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(out);
    s.start(at);
  }

  var lastGulp = 0, lastBump = 0;
  function ok() { return ctx && !muted; }
  return {
    gulp: function (k) {                  // k: how big the meal was next to you (0..1); bigger = deeper
      if (!ok()) return;
      var t = ctx.currentTime;
      if (t - lastGulp < 0.04) return;
      lastGulp = t;
      var f = 900 - k * 700 + Math.random() * 80;
      tone("sine", f, f * 0.35, t, 0.12 + k * 0.25, 0.25 + k * 0.2);
      if (k > 0.45) { noise(t, 0.3 + k * 0.3, 0.25, 400); tone("triangle", 120, 40, t, 0.4, 0.3); }
    },
    hit: function () {                    // torn by something bigger
      if (!ok()) return;
      var t = ctx.currentTime;
      tone("sawtooth", 300, 30, t, 0.9, 0.3);
      noise(t, 0.8, 0.6, 700);
    },
    level: function () {                  // grown into a new scale
      if (!ok()) return;
      var t = ctx.currentTime;
      [196, 247, 294, 392, 494].forEach(function (f, i) { tone("square", f, f, t + i * 0.09, 0.3, 0.1); tone("sine", f * 2, f * 2, t + i * 0.09, 0.3, 0.12); });
    },
    power: function (kind) {              // the form's power
      if (!ok()) return;
      var t = ctx.currentTime;
      if (kind === "pull") { tone("sawtooth", 60, 240, t, 0.6, 0.2); noise(t, 0.6, 0.2, 600); }
      else if (kind === "dash") { noise(t, 0.3, 0.4, 3000, "bandpass"); tone("square", 300, 1200, t, 0.18, 0.1); }
      else if (kind === "shock") { tone("sine", 120, 30, t, 0.8, 0.6); noise(t, 0.7, 0.5, 500); }
      else { tone("sine", 600, 1200, t, 0.5, 0.15); tone("sine", 603, 1210, t, 0.5, 0.15); }
    },
    form: function () {
      if (!ok()) return;
      var t = ctx.currentTime;
      tone("triangle", 440, 880, t, 0.15, 0.2);
    },
    bump: function () {                   // run into your own trail
      if (!ok()) return;
      var t = ctx.currentTime;
      if (t - lastBump < 0.25) return;
      lastBump = t;
      tone("sine", 90, 50, t, 0.18, 0.4);
      noise(t, 0.12, 0.2, 300);
    },
    creature: function () {               // something comes hunting: a low growl
      if (!ok()) return;
      var t = ctx.currentTime;
      tone("sawtooth", 70, 45, t, 1.2, 0.18);
      tone("sawtooth", 73, 47, t, 1.2, 0.18);
      tone("square", 1100, 500, t + 0.2, 0.5, 0.05);
    },
    shatter: function () {                // a creature dashed on your trail
      if (!ok()) return;
      var t = ctx.currentTime;
      noise(t, 0.5, 0.5, 2500);
      tone("square", 800, 100, t, 0.4, 0.12);
    },
    spit: function () {
      if (!ok()) return;
      tone("sawtooth", 200, 600, ctx.currentTime, 0.25, 0.08);
    },
    over: function () {
      if (!ok()) return;
      var t = ctx.currentTime;
      tone("sawtooth", 220, 20, t, 2.2, 0.3);
      tone("sine", 110, 15, t, 2.5, 0.5);
      noise(t, 1.5, 0.5, 400);
    },
    hum: function (size, on) {            // size: the hole's radius on a log scale, 0..1
      if (!ctx || !humGain) return;
      var t = ctx.currentTime;
      humGain.gain.setTargetAtTime(on && !muted ? 0.16 : 0, t, 0.3);
      var f = 70 - size * 40;
      hum[0].frequency.setTargetAtTime(f, t, 0.5);
      hum[1].frequency.setTargetAtTime(f * 1.012, t, 0.5);
      humFilter.frequency.setTargetAtTime(160 + (1 - size) * 200, t, 0.5);
    },
    toggleMute: function () {
      muted = !muted;
      localStorage.setItem("devourerMuted", muted ? "1" : "0");
      if (out) out.gain.value = muted ? 0 : VOL;
      return muted;
    },
    isMuted: function () { return muted; }
  };
})();
